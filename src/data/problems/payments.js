// Interview problems for the Payments stack (Stripe + Razorpay).
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'payments',
  problems: [
    {
      id: 'checkout-subscription-trial-coupon',
      title: 'Create a Checkout Session for a subscription with a trial and a coupon',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'stripe-checkout',
      question: `Your HR SaaS has a "Pro" plan (a Stripe Price \`price_pro_monthly\`). Write an Express endpoint \`POST /billing/checkout\` that:

- creates a Stripe Checkout Session in **subscription** mode for the logged-in tenant,
- gives a **14-day free trial**,
- applies the coupon \`LAUNCH20\` (20% off),
- links the resulting subscription back to the tenant (so your webhooks can find it later),
- returns the Checkout URL so the frontend can redirect.

Assume \`req.tenant\` has \`{ id, stripeCustomerId }\` (the Stripe Customer already exists).`,
      hints: [
        'Use `stripe.checkout.sessions.create` with `mode: \'subscription\'` and a `line_items` array with the price and quantity.',
        'Trial settings and metadata for the subscription go inside `subscription_data`, not at the top level.',
        'A fixed coupon goes in `discounts: [{ coupon: \'LAUNCH20\' }]`. You cannot use `discounts` and `allow_promotion_codes` together.',
      ],
      solution: `**Idea:** the server creates the Checkout Session (never the browser), puts the trial and tenant metadata on the *subscription* that Checkout will create, and returns the hosted page URL.

\`\`\`javascript
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/billing/checkout', async (req, res, next) => {
  try {
    const tenant = req.tenant; // set by your auth middleware

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: tenant.stripeCustomerId,          // reuse the existing Customer
      client_reference_id: tenant.id,             // handy in checkout.session.completed
      line_items: [{ price: 'price_pro_monthly', quantity: 1 }],

      // These settings are copied onto the Subscription that Checkout creates
      subscription_data: {
        trial_period_days: 14,
        metadata: { tenantId: tenant.id },        // lets subscription webhooks find the tenant
      },

      discounts: [{ coupon: 'LAUNCH20' }],        // fixed coupon (no promo code box)

      // {CHECKOUT_SESSION_ID} is replaced by Stripe, it is NOT a JS template
      success_url: process.env.APP_URL + '/billing/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.APP_URL + '/billing',
    });

    res.json({ url: session.url }); // frontend does window.location = url
  } catch (err) {
    next(err);
  }
});

export default router;
\`\`\`

**Why it works:** Checkout handles the card form, 3D Secure and the trial. \`subscription_data.metadata\` is stored on the Subscription itself, so every later \`customer.subscription.*\` event carries \`tenantId\`. Metadata on the Session alone is **not** copied to the Subscription.

**Edge cases:**
- Do **not** grant Pro on the success page. The redirect can fail or be faked. Grant access from the \`checkout.session.completed\` / \`customer.subscription.created\` webhook.
- If the tenant already has an active subscription, block this endpoint (or send them to the Customer Portal) to avoid two subscriptions.
- To let users type their own promo code, drop \`discounts\` and set \`allow_promotion_codes: true\` instead.`,
      followUps: [
        {
          q: 'How do you start a trial without asking for a card?',
          a: 'Set `payment_method_collection: \'if_required\'` on the session. Then also set `subscription_data.trial_settings.end_behavior.missing_payment_method` (for example `cancel` or `pause`) so Stripe knows what to do if no card is added by the end of the trial. Check the current docs for the exact options.',
        },
        {
          q: 'Why use one Stripe Customer per tenant, not per user?',
          a: 'The tenant (company) pays, not each employee. One Customer per tenant keeps all invoices, cards and subscriptions in one place, and admins can change without losing billing history.',
        },
        {
          q: 'How do you stop a tenant from getting the trial twice?',
          a: 'Store `hasUsedTrial` on the tenant in your DB. Only add `trial_period_days` when it is false, and set it to true when the first subscription is created.',
        },
      ],
    },
    {
      id: 'webhook-no-signatures-found',
      title: 'Debug: webhook returns 400 "No signatures found matching the expected signature"',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'stripe-webhooks',
      question: `Every Stripe webhook to this server fails with **400** and the log says:

\`\`\`text
No signatures found matching the expected signature for payload.
Are you passing the raw request body you received from Stripe?
\`\`\`

Find the bug and fix it.

\`\`\`javascript
const app = express();
app.use(express.json());

app.post('/webhooks/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Webhook Error: ' + err.message);
  }
  handleEvent(event);
  res.sendStatus(200);
});
\`\`\``,
      hints: [
        'The signature is an HMAC of the exact bytes Stripe sent. What does `express.json()` do to those bytes?',
        'After `express.json()`, `req.body` is a JS object. Turning it back into a string does not give the same bytes.',
        'Mount `express.raw({ type: \'application/json\' })` on the webhook route **before** the global `express.json()`.',
      ],
      solution: `**Idea:** Stripe signs the **raw** body. \`express.json()\` runs first and replaces \`req.body\` with a parsed object, so the signature check is done on different bytes and fails.

\`\`\`javascript
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// 1) Webhook route FIRST, with a raw body parser (req.body becomes a Buffer)
app.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send('Webhook Error: ' + err.message);
    }

    try {
      await handleEvent(event);   // await it, so a failure returns 500 and Stripe retries
      res.sendStatus(200);
    } catch (err) {
      console.error('Webhook handler failed', event.id, err);
      res.sendStatus(500);
    }
  }
);

// 2) JSON parser for every other route AFTER the webhook route
app.use(express.json());
\`\`\`

**Why it works:** Express runs middleware in order. The webhook route now gets an untouched \`Buffer\`, so the HMAC that \`constructEvent\` computes matches the \`stripe-signature\` header.

**Other causes of the same error (check these too):**
- **Wrong secret.** The Stripe CLI (\`stripe listen\`) prints its own \`whsec_...\`. It is different from the Dashboard endpoint secret. Test mode and live mode secrets are different too.
- A proxy or framework (API Gateway, Next.js API route with body parsing on) changed the body.
- The original code also did not \`await\` \`handleEvent\`, so errors were swallowed and Stripe got 200 even when processing failed.`,
      followUps: [
        {
          q: 'How do you get the raw body in a Next.js App Router route handler?',
          a: 'Use `const body = await req.text()` and pass that string to `constructEvent`. Do not call `req.json()` first.',
        },
        {
          q: 'Why not just skip signature verification?',
          a: 'Then anyone who finds the URL can POST a fake `invoice.paid` and unlock paid plans for free. The signature proves the event came from Stripe.',
        },
      ],
    },
    {
      id: 'customer-portal-session',
      title: 'Let admins manage billing with the Customer Portal',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'customer-portal',
      question: `Product wants a **"Manage billing"** button in the HR SaaS settings page. Admins should be able to update their card, download invoices and cancel the plan — without you building those screens.

Write the Express endpoint behind the button. Only tenant **admins** may use it.`,
      hints: [
        'Stripe has a hosted page for this: the Customer Portal. You create a short-lived portal *session* on the server.',
        'Use `stripe.billingPortal.sessions.create({ customer, return_url })` and return `session.url`.',
      ],
      solution: `**Idea:** create a portal session for the tenant's Stripe Customer and redirect the admin to it. Stripe hosts the UI; your webhooks receive the changes.

\`\`\`javascript
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
}

router.post('/billing/portal', requireAdmin, async (req, res, next) => {
  try {
    // Never take the customer id from the request body: a user could pass someone else's id
    const customerId = req.tenant.stripeCustomerId;
    if (!customerId) return res.status(400).json({ error: 'No billing account yet' });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.APP_URL + '/settings/billing',
    });

    res.json({ url: session.url }); // short-lived URL, create a new one on every click
  } catch (err) {
    next(err);
  }
});

export default router;
\`\`\`

**Why it works:** the portal URL is tied to one Customer and expires quickly, so it is safe to hand to the browser. What the portal allows (cancel, switch plans, update card) is set in the Dashboard portal settings (or a portal configuration object).

**Edge cases:**
- Cancellations and plan switches made in the portal reach you as \`customer.subscription.updated\` / \`customer.subscription.deleted\` webhooks. Your app must listen to those, or the DB goes out of sync.
- The customer id comes from your DB (via the logged-in tenant), never from the client.`,
      followUps: [
        {
          q: 'Should cancel in the portal cancel immediately?',
          a: 'Usually no. Configure it to cancel at period end: the tenant keeps access for the time they paid for, and `cancel_at_period_end` becomes true. You can show a "Your plan ends on X" banner.',
        },
        {
          q: 'Can you limit which plans appear in the portal?',
          a: 'Yes. In the portal configuration you list the products and prices customers may switch between. Hide old or internal prices there.',
        },
      ],
    },
    {
      id: 'razorpay-verify-payment-signature',
      title: 'Razorpay: create an order and verify the payment signature',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'razorpay-signature-verification',
      question: `An Indian customer buys a ₹499 add-on. Write two Express endpoints:

1. \`POST /pay/order\` — creates a Razorpay order and returns what the frontend Checkout needs.
2. \`POST /pay/verify\` — receives \`razorpay_order_id\`, \`razorpay_payment_id\` and \`razorpay_signature\` from the Checkout success handler, verifies them, and marks the purchase paid.

Why can't you just trust the success callback in the browser?`,
      hints: [
        'Razorpay amounts are in the smallest unit (paise). ₹499 = 49900.',
        'The signature is HMAC-SHA256 of `order_id + "|" + payment_id`, using your **key secret**, as hex.',
        'Use the order id **from your DB**, not the one the client sends, and compare with `crypto.timingSafeEqual`.',
      ],
      solution: `**Idea:** create the order on the server (so the amount cannot be changed by the client), then recompute the HMAC on the server and compare it to the signature from Checkout.

\`\`\`javascript
import crypto from 'node:crypto';
import express from 'express';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const router = express.Router();

// 1) Create the order
router.post('/pay/order', async (req, res, next) => {
  try {
    const purchase = await Purchase.create({ tenantId: req.tenant.id, addon: 'payroll-export', amount: 49900, status: 'created' });

    const order = await razorpay.orders.create({
      amount: 49900,                 // paise
      currency: 'INR',
      receipt: purchase.id,          // your own reference
      notes: { tenantId: req.tenant.id, purchaseId: purchase.id },
    });

    purchase.razorpayOrderId = order.id;
    await purchase.save();

    // key_id is public; key_secret never leaves the server
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    next(err);
  }
});

// 2) Verify the signature
function isValidSignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b); // constant-time compare
}

router.post('/pay/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find OUR order for this tenant; do not trust a random order id from the client
    const purchase = await Purchase.findOne({ razorpayOrderId: razorpay_order_id, tenantId: req.tenant.id });
    if (!purchase) return res.status(404).json({ error: 'Order not found' });

    if (!isValidSignature(purchase.razorpayOrderId, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Idempotent: a second call with the same payment does nothing new
    if (purchase.status !== 'paid') {
      purchase.status = 'paid';
      purchase.razorpayPaymentId = razorpay_payment_id;
      await purchase.save();
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
\`\`\`

**Why it works:** only Razorpay and your server know the key secret. A valid HMAC proves this payment id really belongs to this order. Anyone can call the success handler in DevTools, so the browser alone proves nothing.

**Edge cases:**
- The user may close the tab before \`/pay/verify\` runs. Also listen to the \`payment.captured\` / \`order.paid\` **webhooks** and mark the purchase paid there too (same idempotent update).
- If your account does not auto-capture, an "authorized" payment must still be captured, or it is refunded automatically after some days.`,
      followUps: [
        {
          q: 'How is Razorpay webhook verification different from this?',
          a: 'Webhooks use a separate **webhook secret** (set in the Dashboard) and the HMAC-SHA256 is computed over the **raw request body**, sent in the `X-Razorpay-Signature` header. The checkout signature uses the key secret over `order_id|payment_id`.',
        },
        {
          q: 'Why use timingSafeEqual instead of ===?',
          a: '`===` can stop at the first different character, so response time leaks how much of a guess was right. `timingSafeEqual` always takes the same time. Note it throws if lengths differ, so check length first.',
        },
      ],
    },
    {
      id: 'subscription-status-to-access',
      title: 'Map Stripe subscription statuses to app access',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'stripe-subscriptions',
      question: `Your DB stores the Stripe subscription status for each tenant. Write a function \`getAccess(subscription)\` that returns one of:

- \`'full'\` — normal access to the paid plan,
- \`'grace'\` — still has access, but show a "payment failed, update your card" banner,
- \`'none'\` — fall back to the free plan.

Stripe statuses: \`trialing\`, \`active\`, \`past_due\`, \`incomplete\`, \`incomplete_expired\`, \`unpaid\`, \`canceled\`, \`paused\`. Also handle a subscription that is set to cancel at the end of the period.`,
      hints: [
        'Which statuses mean "the customer is in good standing"? Which mean "a payment failed but Stripe is still retrying"?',
        '`incomplete` means the **first** payment never succeeded. Should that give access?',
        'Unknown statuses should fail closed (no access) — Stripe may add new ones.',
      ],
      solution: `**Idea:** a simple lookup table, plus a safe default for anything unknown.

\`\`\`javascript
const ACCESS_BY_STATUS = {
  trialing: 'full',            // in free trial
  active: 'full',              // paid and in good standing
  past_due: 'grace',           // renewal failed, Stripe is retrying (dunning)
  incomplete: 'none',          // first payment not done yet (e.g. 3DS pending)
  incomplete_expired: 'none',  // first payment never completed within ~23h
  unpaid: 'none',              // retries exhausted, kept open but unpaid
  canceled: 'none',            // ended
  paused: 'none',              // e.g. trial ended without a payment method
};

export function getAccess(subscription) {
  if (!subscription) return 'none';
  // cancel_at_period_end: still 'active' until the period ends, then Stripe sends
  // customer.subscription.deleted and the status becomes 'canceled'. So no special case is needed.
  return ACCESS_BY_STATUS[subscription.status] ?? 'none'; // unknown -> fail closed
}

// Examples
console.log(getAccess({ status: 'active', cancelAtPeriodEnd: true })); // 'full'
console.log(getAccess({ status: 'past_due' }));                        // 'grace'
console.log(getAccess({ status: 'something_new' }));                   // 'none'
\`\`\`

**Why it works:** access depends only on the status that your webhooks keep in sync. \`past_due\` is a grace period because Stripe is still retrying the card; cutting access instantly would punish customers whose card simply expired.

**Edge cases:**
- Decide grace rules with product: some teams give \`past_due\` read-only access after N days instead of full access.
- \`cancel_at_period_end: true\` still means access until the end date. Show "Your plan ends on …" in the UI.
- Never compute access from the Checkout success redirect — only from the synced status.`,
      followUps: [
        {
          q: 'What is the difference between unpaid and canceled?',
          a: 'Both happen after retries fail, depending on your Dashboard setting. `unpaid` keeps the subscription open (invoices stay open, you can collect later and reactivate). `canceled` ends it for good; the customer needs a new subscription.',
        },
        {
          q: 'Where should this check run?',
          a: 'In one backend middleware/helper used by every paid feature (and mirrored in the UI for display only). The backend check is the real gate.',
        },
      ],
    },
    {
      id: 'verify-stripe-signature-by-hand',
      title: 'Verify a Stripe webhook signature without the SDK',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'stripe-webhooks',
      question: `Interviewers sometimes ask: "What does \`constructEvent\` actually do?" Implement it yourself.

The \`Stripe-Signature\` header looks like this:

\`\`\`text
t=1712345678,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd,v0=...
\`\`\`

Write \`verifyStripeSignature(rawBody, header, secret, toleranceSec = 300)\` that returns \`true\` only if one of the \`v1\` values is a valid HMAC and the timestamp is recent.`,
      hints: [
        'Split the header on `,` and then on `=`. There can be more than one `v1` (during secret rotation).',
        'The signed message is `timestamp + "." + rawBody`. The algorithm is HMAC-SHA256 with the endpoint secret, as hex.',
        'Reject old timestamps (replay attacks) and compare with `crypto.timingSafeEqual`.',
      ],
      solution: `**Idea:** rebuild the signed string, compute the HMAC with your secret, and compare it to each \`v1\` in constant time. Check the timestamp so an old captured request cannot be replayed.

\`\`\`javascript
import crypto from 'node:crypto';

export function verifyStripeSignature(rawBody, header, secret, toleranceSec = 300) {
  if (!header) return false;

  // "t=123,v1=abc,v0=def" -> [['t','123'], ['v1','abc'], ['v0','def']]
  const parts = header.split(',').map((p) => p.split('='));
  const timestamp = Number(parts.find(([k]) => k === 't')?.[1]);
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v); // ignore v0 (test scheme)
  if (!timestamp || signatures.length === 0) return false;

  // Replay protection: reject events signed too long ago (or too far in the future)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSec) return false;

  // rawBody must be the exact string/Buffer Stripe sent
  const expected = crypto
    .createHmac('sha256', secret)
    .update(timestamp + '.' + rawBody)
    .digest('hex');

  return signatures.some(
    (sig) => sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}

// Quick self-test
const secret = 'whsec_test';
const body = '{"id":"evt_1","type":"invoice.paid"}';
const t = Math.floor(Date.now() / 1000);
const v1 = crypto.createHmac('sha256', secret).update(t + '.' + body).digest('hex');
console.log(verifyStripeSignature(body, 't=' + t + ',v1=' + v1, secret));               // true
console.log(verifyStripeSignature(body + ' ', 't=' + t + ',v1=' + v1, secret));         // false (body changed)
\`\`\`

**Why it works:** only Stripe and you know the endpoint secret, so only Stripe can produce a matching HMAC. Including the timestamp in the signed string means an attacker cannot change \`t\` to make an old request look fresh.

**Edge cases:** one changed byte (pretty-printed JSON, different whitespace) breaks the match — that is why you need the raw body. In real code, use \`stripe.webhooks.constructEvent\`; it does exactly this and also parses the event.`,
      followUps: [
        {
          q: 'Why can the header contain two v1 signatures?',
          a: 'When you roll (rotate) the endpoint secret, Stripe can sign with both the old and new secret for a while, so your server keeps working during the switch.',
        },
        {
          q: 'Why is a 5-minute tolerance safe if Stripe retries for days?',
          a: 'Each retry is a new delivery with a new timestamp and a new signature, so retries are always fresh.',
        },
      ],
    },
    {
      id: 'idempotent-webhook-processing',
      title: 'Make a webhook handler safe against duplicate events',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'webhook-idempotency',
      question: `Stripe delivers webhooks **at least once**. The same \`invoice.paid\` event can arrive twice, and today that adds the monthly AI credits twice.

\`\`\`javascript
async function handleEvent(event) {
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    await Tenant.updateOne({ stripeCustomerId: invoice.customer }, { $inc: { aiCredits: 1000 } });
  }
}
\`\`\`

Make processing **idempotent** (running it twice has the same result as once) using MongoDB. Two copies of the event may even arrive at the same time on two servers.`,
      hints: [
        'Every event has a unique `event.id`. Save the ids you have processed.',
        'A "find then insert" check has a race. Use a **unique index** on the event id and let the insert fail for the duplicate.',
        'If processing fails after you saved the id, the retry will be skipped. Mark the record "done" only at the end, or do both writes in one transaction.',
      ],
      solution: `**Idea:** claim the event with an insert into a \`processed_events\` collection that has a unique index on the event id. Only the request that wins the insert does the work. Use a transaction so "claim" and "add credits" succeed or fail together.

\`\`\`javascript
import mongoose from 'mongoose';

const processedEventSchema = new mongoose.Schema({
  _id: String,                         // Stripe event id, e.g. "evt_123" -> unique by default
  type: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // TTL: keep 30 days
});
const ProcessedEvent = mongoose.model('ProcessedEvent', processedEventSchema);

export async function handleEvent(event) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 1) Claim the event. A duplicate throws E11000 (duplicate key).
      await ProcessedEvent.create([{ _id: event.id, type: event.type }], { session });

      // 2) Do the side effect in the SAME transaction
      if (event.type === 'invoice.paid') {
        const invoice = event.data.object;
        await Tenant.updateOne(
          { stripeCustomerId: invoice.customer },
          { $inc: { aiCredits: 1000 } },
          { session }
        );
      }
    });
  } catch (err) {
    if (err.code === 11000) return;    // already processed -> do nothing, still return 200
    throw err;                         // real failure -> caller returns 500, Stripe retries
  } finally {
    await session.endSession();
  }
}
\`\`\`

**Why it works:** the unique index is enforced by the database, so even two parallel requests cannot both insert the same id. Because the claim and the credit update are in one transaction, a crash in the middle rolls back both, and Stripe's retry processes it cleanly.

**Edge cases:**
- Transactions need a replica set (Atlas has one). Without them, use a status field: insert \`{ status: 'processing' }\`, do the work, then set \`'done'\`; a retry that finds \`'processing'\` older than a few minutes may take over.
- Even better: make the side effect itself idempotent, e.g. store credits per invoice (\`grantedForInvoice: invoice.id\`) instead of a blind \`$inc\`.
- Still return **200** for duplicates; returning 4xx/5xx makes Stripe retry forever.`,
      followUps: [
        {
          q: 'Is the event id enough, or can the same business action come with different event ids?',
          a: 'Different events can describe the same thing (e.g. `invoice.paid` and `invoice.payment_succeeded`). Handle only one of them per action, or key idempotency on the business object (invoice id) as well.',
        },
        {
          q: 'Why not process the webhook in a queue?',
          a: 'You often should: verify the signature, save the event, return 200 fast, and let a worker (BullMQ, SQS) process it with retries. Stripe expects a quick response, and slow handlers cause timeouts and extra retries.',
        },
      ],
    },
    {
      id: 'charged-twice-double-click',
      title: 'Debug: a customer was charged twice for one purchase',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'stripe-idempotency-keys',
      question: `Support reports: "I clicked Pay once, the page was slow, I clicked again — and I was charged twice." Here is the code. Find the problems and fix them.

\`\`\`javascript
// Frontend
payButton.onclick = async () => {
  const res = await fetch('/api/pay', { method: 'POST', body: JSON.stringify({ addonId }) });
  const { clientSecret } = await res.json();
  await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
};

// Backend
app.post('/api/pay', async (req, res) => {
  const addon = await Addon.findById(req.body.addonId);
  const pi = await stripe.paymentIntents.create({
    amount: addon.price,
    currency: 'usd',
    customer: req.tenant.stripeCustomerId,
  });
  res.json({ clientSecret: pi.client_secret });
});
\`\`\``,
      hints: [
        'Every click creates a brand new PaymentIntent. Stripe sees two separate payments.',
        'The frontend should disable the button while a payment is in progress.',
        'On the backend, reuse one PaymentIntent per purchase attempt and send an `idempotencyKey` so retries of the same request return the same object.',
      ],
      solution: `**Idea:** fix it in layers. (1) Disable the button. (2) Create **one** purchase record per checkout attempt and reuse its PaymentIntent. (3) Pass an idempotency key so network retries do not create a second one.

\`\`\`javascript
// Frontend: block double clicks and send a stable attempt id
const attemptId = crypto.randomUUID();            // created once when the checkout page loads

payButton.onclick = async () => {
  payButton.disabled = true;                      // layer 1
  try {
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addonId, attemptId }),
    });
    const { clientSecret } = await res.json();
    const { error } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
    if (error) payButton.disabled = false;        // let them try again with the SAME intent
  } catch {
    payButton.disabled = false;
  }
};
\`\`\`

\`\`\`javascript
// Backend
app.post('/api/pay', async (req, res, next) => {
  try {
    const { addonId, attemptId } = req.body;
    const addon = await Addon.findById(addonId);      // price from DB, never from the client

    // layer 2: one purchase per (tenant, attempt) - unique index on these two fields
    let purchase = await Purchase.findOneAndUpdate(
      { tenantId: req.tenant.id, attemptId },
      { $setOnInsert: { addonId, amount: addon.price, status: 'pending' } },
      { upsert: true, new: true }
    );

    if (!purchase.paymentIntentId) {
      // layer 3: same key -> Stripe returns the same PaymentIntent instead of a new one
      const pi = await stripe.paymentIntents.create(
        {
          amount: addon.price,
          currency: 'usd',
          customer: req.tenant.stripeCustomerId,
          metadata: { purchaseId: String(purchase._id), tenantId: req.tenant.id },
        },
        { idempotencyKey: 'purchase-' + purchase._id }
      );
      purchase = await Purchase.findByIdAndUpdate(purchase._id, { paymentIntentId: pi.id }, { new: true });
    }

    const pi = await stripe.paymentIntents.retrieve(purchase.paymentIntentId);
    if (pi.status === 'succeeded') return res.status(409).json({ error: 'Already paid' });
    res.json({ clientSecret: pi.client_secret });
  } catch (err) {
    next(err);
  }
});
\`\`\`

**Why it works:** a PaymentIntent can succeed **only once**. If every click for the same attempt gets the same PaymentIntent, a second confirm cannot charge again. The idempotency key covers the case where two requests race before the DB has the PaymentIntent id: Stripe returns the first result for the same key (keys are kept for about 24 hours).

**Edge cases:** the idempotency key must be tied to the *purchase*, not random per request, or it does nothing. Reusing a key with different parameters returns an error. Mark the purchase paid from the \`payment_intent.succeeded\` webhook, not from the frontend.`,
      followUps: [
        {
          q: 'The customer was already charged twice. What do you do now?',
          a: 'Refund the duplicate PaymentIntent with `stripe.refunds.create({ payment_intent })`, tell the customer, and search for other duplicates (same customer + amount within a few minutes) to fix them proactively.',
        },
        {
          q: 'Does the Stripe Node SDK retry by itself?',
          a: 'It can retry network errors when you set `maxNetworkRetries`, and it adds idempotency keys automatically for those retries. That only covers one request, not two separate clicks — you still need your own key.',
        },
      ],
    },
    {
      id: 'active-in-stripe-free-in-app',
      title: 'Debug: subscription is active in Stripe but the app shows the Free plan',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'subscription-webhook-events',
      question: `A tenant paid. The Stripe Dashboard shows the subscription as **active** on Pro. Your app still shows **Free**. The webhook endpoint returns 200 for every event. Find the bug.

\`\`\`javascript
// Creating checkout
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: tenant.stripeCustomerId,
  line_items: [{ price: PRICE_PRO, quantity: 1 }],
  metadata: { tenantId: tenant.id },
  success_url: SUCCESS_URL,
  cancel_url: CANCEL_URL,
});

// Webhook handler
async function handleEvent(event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const tenantId = sub.metadata.tenantId;
      await Tenant.updateOne(
        { _id: tenantId },
        { plan: planFromPrice(sub.items.data[0].price.id), subStatus: sub.status }
      );
      break;
    }
  }
}
\`\`\``,
      hints: [
        'Which object did you put `tenantId` metadata on? Which object\'s metadata does the handler read?',
        'Session metadata is **not** copied to the Subscription. `sub.metadata.tenantId` is `undefined`.',
        '`updateOne({ _id: undefined })` matches nothing and does not throw — so the handler "succeeds" silently.',
      ],
      solution: `**Idea:** the metadata was set on the Checkout **Session**, but the handler reads it from the **Subscription**. It is \`undefined\`, the update matches 0 documents, no error is thrown, and Stripe gets 200. Fix the data flow and make "no match" loud.

\`\`\`javascript
// Fix 1: put metadata on the subscription Checkout will create
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: tenant.stripeCustomerId,
  client_reference_id: tenant.id,
  line_items: [{ price: PRICE_PRO, quantity: 1 }],
  subscription_data: { metadata: { tenantId: tenant.id } },   // <- copied to the Subscription
  success_url: SUCCESS_URL,
  cancel_url: CANCEL_URL,
});

// Fix 2: find the tenant by a stable key, and fail loudly if not found
async function handleEvent(event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object;

      // The Stripe customer id is always present; metadata is a fallback
      const tenant =
        (await Tenant.findOne({ stripeCustomerId: sub.customer })) ||
        (sub.metadata?.tenantId && (await Tenant.findById(sub.metadata.tenantId)));

      if (!tenant) {
        // Throw -> 500 -> Stripe retries, and your alerting sees it
        throw new Error('No tenant for customer ' + sub.customer + ' (sub ' + sub.id + ')');
      }

      tenant.stripeSubscriptionId = sub.id;
      tenant.subStatus = sub.status;
      tenant.plan = event.type === 'customer.subscription.deleted'
        ? 'free'
        : planFromPrice(sub.items.data[0].price.id);
      await tenant.save();
      break;
    }
  }
}

// Fix 3 (repair existing data): a one-off sync script
for await (const sub of stripe.subscriptions.list({ status: 'all', limit: 100 })) {
  await handleEvent({ type: 'customer.subscription.updated', data: { object: sub } });
}
\`\`\`

**Why it works:** the Stripe customer id is saved on the tenant before checkout, so it is a reliable link. Throwing when the tenant is missing turns a silent bug into a retried, visible error.

**Other common causes of the same symptom:**
- The endpoint is not subscribed to \`customer.subscription.*\` events in the Dashboard.
- Test-mode vs live-mode mix-up (different endpoint, different secret).
- \`planFromPrice\` does not know a new price id and returns \`'free'\`.
- Out-of-order events: an old \`created\` event processed after \`updated\` overwrote the newer state.`,
      followUps: [
        {
          q: 'How would you catch this in production before customers complain?',
          a: 'Log and alert when an update matches 0 documents, and run a nightly reconciliation job that lists active Stripe subscriptions and compares them to your DB.',
        },
        {
          q: 'Why loop with "for await" over stripe.subscriptions.list?',
          a: 'The Node SDK supports auto-pagination: iterating the list with `for await` fetches the next pages for you.',
        },
      ],
    },
    {
      id: 'estimate-proration-amount',
      title: 'Calculate the proration for a mid-cycle upgrade',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'stripe-proration',
      question: `Before an admin clicks "Upgrade", product wants to show: **"You will be charged $X today."**

A tenant is on Basic ($20/month = 2000 cents). On day 10 of a 30-day period they upgrade to Pro ($50/month = 5000 cents).

1. Write \`estimateProration({ oldAmount, newAmount, periodStart, periodEnd, changeAt })\` (timestamps in seconds, amounts in cents) that returns the credit, the new charge and the net amount.
2. What is the answer for the example?
3. How would you get the **exact** number Stripe will charge?`,
      hints: [
        'Proration is based on the fraction of the period that is left: `(periodEnd - changeAt) / (periodEnd - periodStart)`.',
        'Credit = old price × fraction left (unused time). Charge = new price × fraction left.',
        'Money in cents must be integers. Round each line, like Stripe does per invoice line.',
      ],
      solution: `**Idea:** the customer gets back the unused part of the old plan and pays for the rest of the period on the new plan.

\`\`\`javascript
export function estimateProration({ oldAmount, newAmount, periodStart, periodEnd, changeAt }) {
  const total = periodEnd - periodStart;
  const remaining = Math.max(0, periodEnd - changeAt);
  const fraction = remaining / total;                 // share of the period still left

  const credit = Math.round(oldAmount * fraction);    // unused time on the old plan
  const charge = Math.round(newAmount * fraction);    // remaining time on the new plan
  return { credit, charge, net: charge - credit };    // net > 0 -> pay, net < 0 -> credit
}

const DAY = 86400;
const start = 1_700_000_000;
console.log(estimateProration({
  oldAmount: 2000, newAmount: 5000,
  periodStart: start, periodEnd: start + 30 * DAY, changeAt: start + 10 * DAY,
}));
// { credit: 1333, charge: 3333, net: 2000 }  -> "You will be charged $20.00 today"
\`\`\`

**Answer:** 20 of 30 days are left (2/3). Credit = 2000 × 2/3 ≈ 1333. Charge = 5000 × 2/3 ≈ 3333. Net ≈ **$20.00**.

**Exact number from Stripe:** do not rely on your own math for the real charge. Ask Stripe for a preview of the next invoice with the proposed change (the "create preview invoice" / upcoming invoice API, passing the subscription, the new price for the item and a fixed \`proration_date\`). Then pass the **same** \`proration_date\` when you call \`subscriptions.update\`, so the preview and the real charge match. The method name changed between API versions, so check the current docs.

**Edge cases:** Stripe prorates by the second, so the result depends on the exact time; taxes and coupons change the total; a negative net (downgrade) becomes customer **credit balance**, not a refund.`,
      followUps: [
        {
          q: 'What happens to a negative net amount?',
          a: 'By default Stripe adds it to the customer credit balance and uses it on the next invoices. It does not send money back to the card unless you refund.',
        },
        {
          q: 'Why use proration_date?',
          a: 'Time keeps moving between the preview and the update. Fixing `proration_date` makes both calculations use the same moment, so the number you showed is the number you charge.',
        },
      ],
    },
    {
      id: 'upgrade-downgrade-subscription',
      title: 'Upgrade now, downgrade at period end',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'stripe-proration',
      question: `Write \`POST /billing/change-plan\` with body \`{ newPriceId }\`. Business rules:

- **Upgrade** (more expensive): switch now and **charge the prorated difference immediately**. If the payment fails, the tenant stays on the old plan.
- **Downgrade** (cheaper): keep the current plan until the period ends, then switch. No refund.

The tenant has one subscription with one item (the base plan).`,
      hints: [
        'To change the plan you update the existing **subscription item** (`items: [{ id: itemId, price: newPriceId }]`), you do not add a second item.',
        'For upgrades: `proration_behavior: \'always_invoice\'` creates and charges the invoice right away; `payment_behavior: \'pending_if_incomplete\'` keeps the old plan if payment fails.',
        'For downgrades: either a Subscription Schedule (phase 1 = current plan until period end, phase 2 = new plan), or save a "pending plan" and apply it on renewal.',
      ],
      solution: `**Idea:** compare prices, then use two different Stripe strategies.

\`\`\`javascript
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/billing/change-plan', async (req, res, next) => {
  try {
    const { newPriceId } = req.body;
    const allowed = await Plan.findOne({ stripePriceId: newPriceId, active: true });
    if (!allowed) return res.status(400).json({ error: 'Unknown plan' }); // never trust any price id

    const sub = await stripe.subscriptions.retrieve(req.tenant.stripeSubscriptionId);
    const item = sub.items.data[0];
    const currentAmount = item.price.unit_amount;

    if (allowed.amount > currentAmount) {
      // UPGRADE: change now, invoice + charge the difference now
      const updated = await stripe.subscriptions.update(sub.id, {
        items: [{ id: item.id, price: newPriceId }],
        proration_behavior: 'always_invoice',
        payment_behavior: 'pending_if_incomplete', // if the charge fails, the change is NOT applied
      });
      // updated.pending_update is set when payment did not go through (e.g. needs 3DS)
      return res.json({ status: updated.pending_update ? 'payment_required' : 'upgraded' });
    }

    // DOWNGRADE: schedule the change for the end of the current period
    // In newer API versions the period end lives on the item; older ones have it on the subscription
    const periodEnd = item.current_period_end ?? sub.current_period_end;
    await Tenant.updateOne(
      { _id: req.tenant.id },
      { pendingPriceId: newPriceId, pendingChangeAt: new Date(periodEnd * 1000) }
    );
    return res.json({ status: 'downgrade_scheduled', effectiveAt: periodEnd });
  } catch (err) {
    next(err);
  }
});

export default router;
\`\`\`

For the downgrade, apply the pending change near the renewal. The cleanest Stripe-native way is a **Subscription Schedule**: create one \`from_subscription\`, then set two phases (current price until the current period end, then the new price) with \`end_behavior: 'release'\`. A simpler way that many teams use: a job (or the \`invoice.upcoming\` webhook) calls \`subscriptions.update\` with the new price and \`proration_behavior: 'none'\` just before renewal. Check the docs for the exact schedule phase parameters.

**Why it works:** \`always_invoice\` turns the proration into an invoice immediately, instead of adding it to next month's bill. \`pending_if_incomplete\` makes the upgrade atomic: no payment, no new plan. Downgrades with \`proration_behavior: 'none'\` at the boundary mean no credit and no refund, which matches "keep what you paid for".

**Edge cases:** the user downgrades and then upgrades again before renewal (clear the pending change); a downgrade below current usage (e.g. 80 employees but the new plan allows 50) — block it or warn first; update your DB only from the \`customer.subscription.updated\` webhook.`,
      followUps: [
        {
          q: 'What does proration_behavior: create_prorations do differently?',
          a: 'It creates the proration lines but leaves them on the **next** regular invoice. The customer gets Pro now but pays the difference at renewal — risky if they cancel before that.',
        },
        {
          q: 'Upgrade from monthly to yearly — what changes?',
          a: 'The billing interval changes, so Stripe resets the billing cycle anchor to now and charges the yearly price minus the credit for unused monthly time.',
        },
      ],
    },
    {
      id: 'addon-as-subscription-item',
      title: 'Sell a monthly add-on as a second subscription item',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'subscription-items-add-ons',
      question: `Tenants on any plan can buy the **"AI Resume Screening"** add-on for $15/month (\`price_ai_addon\`). Write two endpoints:

- \`POST /billing/addons/ai\` — adds the add-on to the tenant's **existing** subscription and charges the prorated amount now.
- \`DELETE /billing/addons/ai\` — removes it, with no refund for the current month.

Why is this better than creating a second subscription?`,
      hints: [
        'A subscription can have several **items**, each with its own price and quantity. Use `stripe.subscriptionItems.create`.',
        'Check first that the add-on is not already on the subscription, or the tenant pays twice.',
        'To remove: `stripe.subscriptionItems.del(itemId, { proration_behavior: \'none\' })`.',
      ],
      solution: `**Idea:** add the add-on price as a new item on the same subscription. One subscription means one invoice, one renewal date and one dunning flow.

\`\`\`javascript
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const AI_ADDON_PRICE = process.env.STRIPE_PRICE_AI_ADDON;

async function findAddonItem(subscriptionId) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  return { sub, item: sub.items.data.find((i) => i.price.id === AI_ADDON_PRICE) };
}

router.post('/billing/addons/ai', async (req, res, next) => {
  try {
    const { sub, item } = await findAddonItem(req.tenant.stripeSubscriptionId);
    if (!['active', 'trialing'].includes(sub.status)) {
      return res.status(400).json({ error: 'Subscription is not active' });
    }
    if (item) return res.json({ status: 'already_added' }); // idempotent

    await stripe.subscriptionItems.create(
      {
        subscription: sub.id,
        price: AI_ADDON_PRICE,
        quantity: 1,
        proration_behavior: 'always_invoice',     // charge the rest of this month now
        payment_behavior: 'error_if_incomplete',  // fail the request if the card is declined
      },
      { idempotencyKey: 'add-ai-' + sub.id + '-' + req.body.attemptId }
    );
    // Entitlements are updated by the customer.subscription.updated webhook
    res.json({ status: 'added' });
  } catch (err) {
    if (err.type === 'StripeCardError') return res.status(402).json({ error: err.message });
    next(err);
  }
});

router.delete('/billing/addons/ai', async (req, res, next) => {
  try {
    const { item } = await findAddonItem(req.tenant.stripeSubscriptionId);
    if (!item) return res.json({ status: 'not_present' });

    await stripe.subscriptionItems.del(item.id, { proration_behavior: 'none' }); // no refund
    res.json({ status: 'removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
\`\`\`

**Why it works:** Stripe bills all items together on the same cycle. The webhook handler reads \`sub.items.data\` and turns each known price into entitlements (\`price_ai_addon\` → \`features.aiScreening = true\`).

**Edge cases:**
- Removing with \`proration_behavior: 'none'\` deletes the item now, so the tenant loses the feature now. To keep it until period end, store \`addonEndsAt\` in your DB and remove the item at renewal instead.
- Items usually must share the same currency and billing interval (no yearly base + monthly add-on in one subscription). Stripe has been adding more flexible billing modes, so check the current docs.
- Seat-based add-ons: use \`quantity\` and update it instead of adding new items.`,
      followUps: [
        {
          q: 'Why not a separate subscription per add-on?',
          a: 'Separate subscriptions mean separate invoices, renewal dates and failed-payment flows. Customers get many small charges, and you have more states to sync. Use a separate subscription only when the interval must differ.',
        },
        {
          q: 'How does the webhook know which item is the base plan and which is an add-on?',
          a: 'Keep a price catalog in your DB (price id → kind: "plan" or "addon", plus the entitlements it grants), or put `metadata.kind` on the Stripe Product. Do not rely on the order of items.',
        },
      ],
    },
    {
      id: 'enforce-plan-usage-limits',
      title: 'Enforce plan limits: max employees and monthly AI credits',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'entitlements-plan-limits',
      question: `Plans in the HR SaaS:

\`\`\`text
Free:   10 employees,  50 AI screenings / month
Pro:   200 employees, 1000 AI screenings / month
\`\`\`

Write:
1. An Express middleware \`requireQuota('aiScreenings')\` that blocks the request with **402** when the tenant has used their monthly limit, and counts the usage when allowed.
2. It must be correct when 20 requests arrive at the same moment (no going over the limit).
3. Usage must reset every billing period.

Use MongoDB. Do **not** call Stripe on every request.`,
      hints: [
        'Store entitlements (limits) in your own DB, filled by subscription webhooks. Reading Stripe on every request is slow and rate-limited.',
        '"Read count, check, then increment" has a race. Do the check and the increment in **one** atomic `updateOne` with a filter like `{ used: { $lt: limit } }`.',
        'Key the usage document by the period start (e.g. `periodStart`). A new period means a new document with 0 usage — no reset job needed.',
      ],
      solution: `**Idea:** one usage document per tenant, per metric, per billing period. An atomic conditional \`$inc\` both checks and counts.

\`\`\`javascript
// Tenant (synced from webhooks):
// { _id, plan: 'pro', limits: { employees: 200, aiScreenings: 1000 }, currentPeriodStart: Date }

// Usage: unique index on { tenantId, metric, periodStart }
const usageSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  metric: { type: String, required: true },
  periodStart: { type: Date, required: true },
  used: { type: Number, default: 0 },
});
usageSchema.index({ tenantId: 1, metric: 1, periodStart: 1 }, { unique: true });
const Usage = mongoose.model('Usage', usageSchema);

export function requireQuota(metric, amount = 1) {
  return async (req, res, next) => {
    try {
      const tenant = req.tenant;
      const limit = tenant.limits?.[metric] ?? 0;
      const key = { tenantId: tenant.id, metric, periodStart: tenant.currentPeriodStart };

      // 1) Make sure this period's doc exists (no-op if it does)
      await Usage.updateOne(key, { $setOnInsert: { used: 0 } }, { upsert: true }).catch((e) => {
        if (e.code !== 11000) throw e; // two requests upserting at once: one wins, fine
      });

      // 2) Atomic check-and-increment: only matches if there is room left
      const result = await Usage.updateOne(
        { ...key, used: { $lte: limit - amount } },
        { $inc: { used: amount } }
      );

      if (result.modifiedCount === 0) {
        return res.status(402).json({
          error: 'Monthly limit reached',
          metric,
          limit,
          upgradeUrl: '/settings/billing',
        });
      }

      // Give the unit back if the request later fails (e.g. AI provider error)
      req.refundQuota = () => Usage.updateOne(key, { $inc: { used: -amount } });
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Usage
app.post('/api/ai/screen-resume', requireQuota('aiScreenings'), screenResumeHandler);
\`\`\`

For **employees** (a count, not monthly usage) check the real count at create time: \`countDocuments({ tenantId })\` against \`limits.employees\`. To make it race-free, keep an \`employeeCount\` on the tenant and use the same conditional \`$inc\` pattern.

**Why it works:** MongoDB applies a single-document update atomically. Of 20 parallel requests with 1 unit left, only one matches \`used <= limit - 1\`; the other 19 get \`modifiedCount: 0\`. The reset is automatic: the \`invoice.paid\` / \`customer.subscription.updated\` webhook sets a new \`currentPeriodStart\`, so the next request creates a fresh document.

**Edge cases:** downgrade mid-period (new lower limit applies at once — decide with product); \`past_due\` tenants (use access level from status first); keep old usage documents for reports and invoices.`,
      followUps: [
        {
          q: 'Would you use Redis instead?',
          a: 'For very high traffic, yes: `INCR` with a period-based key and `EXPIRE`, or a Lua script for check-and-increment. Then sync totals to MongoDB for reporting. For normal SaaS traffic, MongoDB is enough and simpler.',
        },
        {
          q: 'How do you bill overage instead of blocking?',
          a: 'Allow usage above the limit, and report the extra units to Stripe usage-based billing (a metered price / Billing Meter events). Stripe adds them to the next invoice.',
        },
      ],
    },
    {
      id: 'full-and-partial-refunds',
      title: 'Build a refund endpoint for support agents (full and partial)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'stripe-refunds',
      question: `Support agents need \`POST /admin/payments/:paymentId/refund\` with an optional \`amount\` (cents). Requirements:

- No amount = full refund. With amount = partial refund.
- Never refund more than what is left (a payment may already be partly refunded).
- A double-click must not refund twice.
- Record who refunded and why.

\`paymentId\` is your own DB id; the record stores \`stripePaymentIntentId\`, \`amount\` and \`refundedAmount\`.`,
      hints: [
        'Use `stripe.refunds.create({ payment_intent, amount })`. Without `amount` Stripe refunds the rest.',
        'Compute `remaining = amount - refundedAmount` and reject anything above it.',
        'Use an idempotency key built from a request id the admin UI generates once per refund form.',
      ],
      solution: `**Idea:** validate on your side, call Stripe with an idempotency key, and let the \`charge.refunded\` / \`refund.updated\` webhooks confirm the final state.

\`\`\`javascript
router.post('/admin/payments/:paymentId/refund', requireRole('support'), async (req, res, next) => {
  try {
    const { amount, reason, requestId } = req.body; // requestId: UUID created when the form opened
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const remaining = payment.amount - payment.refundedAmount;
    const refundAmount = amount ?? remaining;          // default: refund everything left

    if (!Number.isInteger(refundAmount) || refundAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive integer (cents)' });
    }
    if (refundAmount > remaining) {
      return res.status(400).json({ error: 'Only ' + remaining + ' cents left to refund' });
    }

    const refund = await stripe.refunds.create(
      {
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount,
        reason: 'requested_by_customer',               // allowed: duplicate, fraudulent, requested_by_customer
        metadata: { paymentId: String(payment._id), refundedBy: req.user.id, note: reason ?? '' },
      },
      { idempotencyKey: 'refund-' + requestId }        // double-click -> same refund returned
    );

    // Audit log; refundedAmount is updated from the webhook to stay the single source of truth
    await RefundLog.create({ paymentId: payment._id, stripeRefundId: refund.id, amount: refundAmount, by: req.user.id, reason });
    res.json({ refundId: refund.id, status: refund.status }); // 'pending' or 'succeeded'
  } catch (err) {
    next(err);
  }
});
\`\`\`

**Why it works:** the remaining-amount check stops over-refunds before calling Stripe (Stripe would also reject it). The idempotency key makes a repeated click return the first refund instead of creating a second one.

**Edge cases:**
- Refunds can be \`pending\` and can even **fail** later (closed card). Listen to refund webhooks and update status.
- Stripe processing fees are usually not returned on refunds.
- For subscription invoices, prefer a **credit note** (\`stripe.creditNotes.create\` with a refund amount): it adjusts the invoice and refunds in one step, so accounting stays correct.
- Refunding does not cancel the subscription or remove access — do that separately if needed.`,
      followUps: [
        {
          q: 'Refund vs credit balance — when to use which?',
          a: 'Refund sends money back to the card. Credit balance keeps it in Stripe for future invoices. Credit is good for goodwill on an active customer; refund is for customers leaving or charged by mistake.',
        },
        {
          q: 'How do you refund in Razorpay?',
          a: 'Call `razorpay.payments.refund(paymentId, { amount })` (amount in paise; omit for full). Track it with the `refund.processed` / `refund.failed` webhooks.',
        },
      ],
    },
    {
      id: 'test-renewals-with-test-clocks',
      title: 'Test a trial ending and a failed renewal without waiting a month',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'stripe-test-clocks',
      question: `QA asks: "How do we test that a 14-day trial converts to paid, that renewal works next month, and that a failed renewal moves the tenant to past_due — without waiting 45 days?"

Explain the approach and write a Node script that sets up the scenario.`,
      hints: [
        'Stripe has **test clocks**: a fake clock you attach to a test-mode Customer and move forward.',
        'Create the clock, create the Customer with `test_clock`, create the subscription, then `advance` the clock.',
        'For a failed renewal, switch the default payment method to a test card that is declined on charge, then advance past the renewal date.',
      ],
      solution: `**Idea:** in test mode, create a test clock, attach a new customer to it, and advance time. Stripe runs the real billing logic (trial end, invoices, retries) and sends real webhooks to your endpoint.

\`\`\`javascript
// scripts/simulate-renewal.mjs  (TEST MODE KEY ONLY)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY);

const DAY = 86400;
const now = Math.floor(Date.now() / 1000);

// 1) A clock frozen at "now"
const clock = await stripe.testHelpers.testClocks.create({ frozen_time: now, name: 'trial -> renew -> fail' });

// 2) Customer on that clock, with a working test card
const customer = await stripe.customers.create({
  email: 'qa+clock@example.com',
  test_clock: clock.id,
  payment_method: 'pm_card_visa',
  invoice_settings: { default_payment_method: 'pm_card_visa' },
});

// 3) Subscription with a 14-day trial
const sub = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: process.env.STRIPE_PRICE_PRO }],
  trial_period_days: 14,
  metadata: { tenantId: 'qa-tenant' },
});

// Advance and wait until Stripe finished processing (clock status back to "ready")
async function advanceTo(time) {
  await stripe.testHelpers.testClocks.advance(clock.id, { frozen_time: time });
  for (;;) {
    const c = await stripe.testHelpers.testClocks.retrieve(clock.id);
    if (c.status === 'ready') return;
    await new Promise((r) => setTimeout(r, 2000));
  }
}

await advanceTo(now + 15 * DAY);   // trial ends -> first invoice paid -> status "active"
console.log((await stripe.subscriptions.retrieve(sub.id)).status);

// 4) Make the next renewal fail: attach a card that is declined on charge
const failing = await stripe.paymentMethods.attach('pm_card_chargeCustomerFail', { customer: customer.id });
await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: failing.id } });

await advanceTo(now + 46 * DAY);   // renewal attempt fails -> "past_due"
console.log((await stripe.subscriptions.retrieve(sub.id)).status);
\`\`\`

**Why it works:** objects attached to a test clock live in "clock time". Advancing the clock makes Stripe run everything that would happen in that time window and fire the webhooks (\`customer.subscription.trial_will_end\`, \`invoice.paid\`, \`invoice.payment_failed\`, \`customer.subscription.updated\`). Your app is tested end to end, including the webhook handler.

**Edge cases / tips:**
- Run \`stripe listen --forward-to localhost:4000/webhooks/stripe\` so local webhooks arrive.
- Advancing is async and has limits (how far per step, how many objects per clock) — check the docs.
- Delete the clock after the test; it deletes the attached objects too.
- Your app must use the **event time / Stripe period dates**, not \`Date.now()\`, or clock-time tests will look wrong.`,
      followUps: [
        {
          q: 'How would you put this into CI?',
          a: 'Run the script against a test-mode account, point webhooks to a tunnel or poll the subscription status, then assert DB state (plan, access level). Keep it as a nightly job because clock advances take time.',
        },
        {
          q: 'What is pm_card_chargeCustomerFail?',
          a: 'A Stripe test PaymentMethod that attaches to a customer successfully but is declined when charged — perfect for simulating a renewal failure.',
        },
      ],
    },
    {
      id: 'out-of-order-webhooks',
      title: 'Handle webhooks that arrive out of order',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'webhook-idempotency',
      question: `A tenant upgraded and then canceled within a few seconds. Stripe sent:

\`\`\`text
1. customer.subscription.updated   (plan: pro, status: active)        created 10:00:01
2. customer.subscription.deleted   (status: canceled)                 created 10:00:04
\`\`\`

Event 1 failed once and was **retried after** event 2. Your handler blindly writes \`event.data.object\` into the DB, so the canceled tenant is now "active on Pro" forever.

Rewrite the subscription sync so the order of delivery does not matter.`,
      hints: [
        'Stripe does not guarantee delivery order. `event.data.object` is a snapshot from when the event was created — it may be old.',
        'Option A: ignore events older than the last one you applied (compare `event.created`). Ties within the same second are a problem.',
        'Option B (most robust): treat the event as a "something changed" signal and **re-fetch** the current subscription from Stripe, then save that.',
      ],
      solution: `**Idea:** never trust the snapshot for state. On any subscription event, retrieve the latest subscription from the API and write that. Also keep a guard so an older write cannot overwrite a newer one.

\`\`\`javascript
const SUB_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
]);

export async function handleEvent(event) {
  if (!SUB_EVENTS.has(event.type)) return;

  const subId = event.data.object.id;

  // 1) Fetch the CURRENT truth (works for deleted subs too: status "canceled")
  const sub = await stripe.subscriptions.retrieve(subId);

  const item = sub.items.data.find((i) => i.price.metadata?.kind !== 'addon') ?? sub.items.data[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end; // field moved in newer API versions

  // 2) Guarded write: only apply if this event is not older than what we already applied
  const result = await Tenant.updateOne(
    {
      stripeCustomerId: sub.customer,
      $or: [{ subSyncedAt: { $exists: false } }, { subSyncedAt: { $lte: event.created } }],
    },
    {
      $set: {
        stripeSubscriptionId: sub.id,
        subStatus: sub.status,
        plan: sub.status === 'canceled' ? 'free' : planFromPrice(item.price.id),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodEnd: new Date(periodEnd * 1000),
        subSyncedAt: event.created,          // unix seconds of the event we applied
      },
    }
  );

  if (result.matchedCount === 0) {
    // Either an older event (fine to skip) or an unknown customer (must alert)
    const exists = await Tenant.exists({ stripeCustomerId: sub.customer });
    if (!exists) throw new Error('Unknown customer ' + sub.customer);
  }
}
\`\`\`

**Why it works:** whatever order events arrive in, each one writes the **latest** state from Stripe, so the last write is always correct. In the example, the late retry of event 1 fetches the subscription, sees \`canceled\`, and writes Free. The \`subSyncedAt\` guard is a second safety net for parallel workers.

**Trade-offs:**
- One extra API call per event. Fine for subscription events (low volume). Watch rate limits during bulk changes.
- Stripe keeps canceled subscriptions retrievable, so retrieving after delete works.
- Combine with event-id idempotency (processed_events) so duplicates are cheap.`,
      followUps: [
        {
          q: 'Why is comparing event.created alone not enough?',
          a: 'It has 1-second resolution, so two events in the same second tie. And the snapshot could still be stale relative to API state. Re-fetching avoids both problems.',
        },
        {
          q: 'What about invoice events arriving before customer.subscription.created?',
          a: 'Handlers should not assume the subscription row exists. Upsert by Stripe ids, or fetch the subscription inside the invoice handler and sync it first.',
        },
      ],
    },
    {
      id: 'upi-pending-reconciliation',
      title: 'Razorpay UPI: payment stuck "pending" — webhook + reconciliation job',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'razorpay-failure-handling',
      question: `Customers pay with UPI through Razorpay Checkout. Sometimes the money leaves their bank, but your app never marks the order paid: they closed the app before the success callback, or the UPI approval came 3 minutes later.

1. How do you confirm such payments reliably?
2. Write the Razorpay webhook endpoint (with signature verification).
3. Write a reconciliation job that catches anything the webhook missed.`,
      hints: [
        'UPI is **asynchronous**: the user approves in their UPI app later. The browser callback is not reliable.',
        'Razorpay sends webhooks like `payment.captured` and `order.paid`. Verify `X-Razorpay-Signature` = HMAC-SHA256(raw body, **webhook secret**).',
        'A cron job can list orders still "created" after N minutes and call `razorpay.orders.fetchPayments(orderId)` to check the real status.',
      ],
      solution: `**Idea:** three layers, all calling the **same idempotent** \`markOrderPaid\` function: (1) the checkout callback (fast path), (2) the webhook (reliable path), (3) a reconciliation cron (safety net).

\`\`\`javascript
import crypto from 'node:crypto';
import express from 'express';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

// Shared, idempotent: only moves "created" -> "paid" once
async function markOrderPaid(orderId, paymentId, amount) {
  const order = await Order.findOneAndUpdate(
    { razorpayOrderId: orderId, status: { $ne: 'paid' } },
    { $set: { status: 'paid', razorpayPaymentId: paymentId, paidAt: new Date() } },
    { new: true }
  );
  if (!order) return;                              // already paid or unknown -> nothing to do
  if (order.amount !== amount) {                   // paid amount must match what we asked for
    await Alert.create({ type: 'amount_mismatch', orderId, amount });
    return;
  }
  await grantPurchase(order);                      // unlock the add-on / plan
}

// --- 2) Webhook: raw body, verify with the WEBHOOK secret ---
const app = express();
app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] || '';
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest('hex');
  const valid = signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return res.status(400).send('bad signature');

  const event = JSON.parse(req.body.toString('utf8'));
  try {
    if (event.event === 'payment.captured') {
      const p = event.payload.payment.entity;
      await markOrderPaid(p.order_id, p.id, p.amount);
    } else if (event.event === 'payment.failed') {
      const p = event.payload.payment.entity;
      await Order.updateOne({ razorpayOrderId: p.order_id, status: 'created' }, { $set: { lastError: p.error_description } });
      // do NOT mark failed for good: the user may retry and pay on the same order
    }
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);                          // Razorpay retries
  }
});

// --- 3) Reconciliation: every 10 minutes ---
export async function reconcilePendingOrders() {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const pending = await Order.find({ status: 'created', createdAt: { $lt: cutoff, $gt: new Date(Date.now() - 3 * 86400000) } });

  for (const order of pending) {
    const { items } = await razorpay.orders.fetchPayments(order.razorpayOrderId);
    const captured = items.find((p) => p.status === 'captured');
    const authorized = items.find((p) => p.status === 'authorized');

    if (captured) {
      await markOrderPaid(order.razorpayOrderId, captured.id, captured.amount);
    } else if (authorized) {
      // money is blocked but not captured (manual capture setup) -> capture it
      await razorpay.payments.capture(authorized.id, authorized.amount, authorized.currency);
      await markOrderPaid(order.razorpayOrderId, authorized.id, authorized.amount);
    } else if (order.createdAt < new Date(Date.now() - 86400000)) {
      await Order.updateOne({ _id: order._id }, { $set: { status: 'expired' } });
    }
  }
}
\`\`\`

**Why it works:** the webhook does not depend on the user's browser, and the cron catches webhooks that failed or were never configured. Because every path calls the same idempotent function, a payment confirmed by two paths is granted once.

**Edge cases:** show the user a "Payment processing, we will email you" screen instead of "failed" while UPI is pending; two payments on one order (user retried) — refund the extra one; compare amount and currency before granting.`,
      followUps: [
        {
          q: 'Why not mark the order failed on payment.failed?',
          a: 'One order can have several payment attempts. A failed UPI attempt is often followed by a successful retry on the same order. Only expire the order after a timeout.',
        },
        {
          q: 'What is the difference between authorized and captured?',
          a: 'Authorized = the bank approved and blocked the money. Captured = you actually take it. With auto-capture on, Razorpay captures right away; otherwise uncaptured payments are auto-refunded after a few days.',
        },
      ],
    },
    {
      id: 'failed-renewal-dunning-grace',
      title: 'Design the failed-renewal (dunning) flow with a grace period',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'renewals-failed-payments',
      question: `A Pro tenant's card expired. The monthly renewal fails. Product wants:

- Keep full access for **7 days** while we try to collect.
- Remind the admin by email and an in-app banner with a "Fix payment" link.
- After 7 days: **read-only** mode (can view, cannot add employees).
- After retries end: downgrade to Free, but keep their data.
- The moment they pay, everything is restored.

Which Stripe settings and webhook events do you use, and what does your code do at each step?`,
      hints: [
        'Stripe already retries failed renewals (Smart Retries) and can email customers — configure that in the Dashboard (Billing → Revenue recovery).',
        'Key events: `invoice.payment_failed`, `customer.subscription.updated` (status → `past_due`), `invoice.paid`, and finally `customer.subscription.deleted` or status `unpaid`.',
        'Store `pastDueSince` in your DB and derive the access level from it plus the status.',
      ],
      solution: `**Idea:** let Stripe own the **retry schedule**; your app owns the **access rules**. Webhooks move the tenant through states, and one function computes access from those states.

**Stripe setup:** Smart Retries over e.g. 2 weeks; after the last retry → cancel the subscription (or mark \`unpaid\`); turn on failed-payment and expiring-card emails if you do not send your own.

\`\`\`javascript
async function handleEvent(event) {
  const obj = event.data.object;
  switch (event.type) {
    case 'invoice.payment_failed': {
      const tenant = await Tenant.findOne({ stripeCustomerId: obj.customer });
      if (!tenant) throw new Error('Unknown customer ' + obj.customer);
      if (!tenant.pastDueSince) tenant.pastDueSince = new Date(); // first failure only
      await tenant.save();
      await sendEmail(tenant.billingEmail, 'payment-failed', {
        payUrl: obj.hosted_invoice_url,                            // Stripe page to pay this invoice
        nextAttempt: obj.next_payment_attempt,                     // unix time or null (no more retries)
        attempt: obj.attempt_count,
      });
      break;
    }
    case 'invoice.paid': {
      // Restores everything, whether paid by a retry or by the customer
      await Tenant.updateOne({ stripeCustomerId: obj.customer }, { $unset: { pastDueSince: 1 } });
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(obj.id);   // re-fetch and store status (past_due / unpaid / canceled)
      break;
  }
}

// One place that decides access
const GRACE_DAYS = 7;
export function accessLevel(tenant, now = new Date()) {
  const s = tenant.subStatus;
  if (s === 'active' || s === 'trialing') return 'full';
  if (s === 'past_due') {
    const days = (now - tenant.pastDueSince) / 86400000;
    return days <= GRACE_DAYS ? 'full_with_banner' : 'read_only';
  }
  return 'free'; // unpaid, canceled, incomplete_expired... data is kept, features limited
}

// Middleware for write actions
export const requireWriteAccess = (req, res, next) =>
  accessLevel(req.tenant) === 'read_only'
    ? res.status(402).json({ error: 'Payment overdue', fixUrl: '/billing/portal' })
    : next();
\`\`\`

**Timeline:** Day 0 \`invoice.payment_failed\` → status \`past_due\` → banner + email. Days 1-7 full access, retries continue. Day 8 read-only (computed, no job needed). Last retry fails → \`customer.subscription.deleted\` → Free plan, data kept. Any time: customer pays via \`hosted_invoice_url\` or the portal → \`invoice.paid\` → back to full.

**Why it works:** access is derived from synced state + time, so there are no cron jobs flipping flags that can drift. Stripe does the retry timing; you never charge cards yourself.

**Edge cases:** cards that need 3D Secure on renewal (\`invoice.payment_action_required\` → send the hosted invoice link); a new card added in the portal does **not** automatically pay the open invoice in every setup — Stripe can retry it, or you pay it with \`stripe.invoices.pay\`; never delete data on downgrade.`,
      followUps: [
        {
          q: 'How do you reduce involuntary churn before failure even happens?',
          a: 'Enable card updater / expiring-card emails, ask for a backup payment method, and send a reminder before renewal for yearly plans.',
        },
        {
          q: 'Should the tenant be able to re-subscribe after cancellation?',
          a: 'Yes — a new Checkout Session on the same Customer. Because data was kept, they continue where they left off.',
        },
      ],
    },
    {
      id: 'handle-disputes-chargebacks',
      title: 'A customer opened a chargeback — handle disputes end to end',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'occasional',
      relatedTopic: 'stripe-disputes',
      question: `You receive \`charge.dispute.created\` for a $588 yearly Pro payment. The tenant says "I did not authorize this".

1. What happens to the money?
2. What should your webhook handler do?
3. How do you submit evidence, and what evidence helps an HR SaaS win?
4. How do you lower the dispute rate?`,
      hints: [
        'When a dispute opens, the amount plus a dispute fee is taken from your balance right away.',
        'You have a deadline (`evidence_details.due_by`). Alert a human; do not auto-ban blindly.',
        'Evidence: login/activity logs, IP addresses, emails, terms accepted, invoice — via `stripe.disputes.update(id, { evidence, submit })`.',
      ],
      solution: `**Idea:** react fast (alert, freeze risky actions), collect proof from your own data automatically, and let a person decide whether to fight or accept.

**1) Money:** Stripe withdraws the disputed amount **plus a dispute fee** from your balance when the dispute is created. If you win, the amount comes back (whether the fee comes back depends on Stripe's current pricing). If you lose, it is gone.

\`\`\`javascript
async function handleEvent(event) {
  const dispute = event.data.object;
  switch (event.type) {
    case 'charge.dispute.created': {
      const charge = await stripe.charges.retrieve(dispute.charge);
      const tenant = await Tenant.findOne({ stripeCustomerId: charge.customer });

      await Dispute.create({
        stripeDisputeId: dispute.id,
        tenantId: tenant?.id,
        amount: dispute.amount,
        reason: dispute.reason,                                 // e.g. 'fraudulent', 'product_not_received'
        dueBy: new Date(dispute.evidence_details.due_by * 1000),
        status: dispute.status,                                 // 'needs_response'
      });

      // Pause risky actions (new paid add-ons, plan upgrades), keep data
      if (tenant) await Tenant.updateOne({ _id: tenant.id }, { $set: { billingFlag: 'disputed' } });
      await notifySlack('#billing', 'Dispute ' + dispute.id + ' ' + dispute.reason + ', due ' + dispute.evidence_details.due_by);

      // Pre-fill evidence from our own data, but do NOT submit yet
      const evidence = await buildEvidence(tenant, charge);
      await stripe.disputes.update(dispute.id, { evidence, submit: false });
      break;
    }
    case 'charge.dispute.closed':
      await Dispute.updateOne({ stripeDisputeId: dispute.id }, { status: dispute.status }); // 'won' | 'lost'
      if (dispute.status === 'lost') await cancelSubscriptionForTenantOfCharge(dispute.charge);
      break;
  }
}

async function buildEvidence(tenant, charge) {
  const logins = await AuditLog.find({ tenantId: tenant.id, action: 'login' }).sort({ at: -1 }).limit(50);
  return {
    customer_email_address: tenant.billingEmail,
    customer_name: tenant.companyName,
    product_description: 'HR SaaS (Pro plan, yearly). Used for payroll and employee records.',
    access_activity_log: logins.map((l) => l.at.toISOString() + ' ' + l.userEmail + ' ' + l.ip).join('\\n'),
    uncategorized_text: 'Tenant created ' + tenant.employeeCount + ' employee records and ran payroll after this payment.',
  };
}
\`\`\`

**3) Evidence that wins for B2B SaaS:** proof the company **used** the service after paying (logins, records created, payroll runs), the signed-up admin's email and IP, accepted terms and cancellation policy, the invoice, and any emails where they acknowledged the purchase. A support person reviews and clicks submit (\`submit: true\`) before \`due_by\`.

**4) Lower dispute rate:** clear statement descriptor (a name customers recognize on their bank statement), renewal reminder emails before yearly renewals, easy cancellation and refunds (a refund is cheaper than a dispute), Radar rules and 3D Secure for risky cards. Often the "dispute" is a finance team that did not recognize the charge.

**Edge cases:** you cannot refund a charge that is already disputed to "close" it — you accept or fight; an \`inquiry\` (early warning) may come before a real dispute; very high dispute rates can get your account restricted.`,
      followUps: [
        {
          q: 'Should you cancel the account immediately on dispute.created?',
          a: 'Usually not for B2B: many disputes are mistakes, and using the product after the dispute is evidence for you. Freeze new purchases, contact the admin, and decide after talking to them.',
        },
        {
          q: 'Who pays the dispute in a marketplace with Stripe Connect?',
          a: 'It depends on the charge type. With destination charges or separate charges, the platform is liable by default and can recover from the connected account; with direct charges, the connected account is liable.',
        },
      ],
    },
    {
      id: 'multi-tenant-billing-schema',
      title: 'Design the billing schema for a multi-tenant HR SaaS',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'saas-billing-architecture',
      question: `Design the MongoDB collections for billing in a multi-tenant HR SaaS that has:

- plans (Free, Starter, Pro, Enterprise) with monthly and yearly prices,
- marketplace add-ons (AI screening, payroll export, extra storage),
- limits per plan (employees, AI screenings/month, storage GB),
- usage tracking per billing period,
- Stripe as the payment provider (maybe Razorpay later for India).

Show the collections, key fields, indexes, and explain what is the **source of truth** for each piece of data.`,
      hints: [
        'Stripe is the source of truth for money (subscriptions, invoices, payments). Your DB is the source of truth for **what features mean** (entitlements) and usage.',
        'Keep a catalog: plans/add-ons in your DB, each pointing to Stripe price ids. Code should check entitlements ("can use AI screening?"), not plan names.',
        'Store a denormalized "current entitlements" snapshot on the tenant for fast checks, recomputed by webhooks.',
      ],
      solution: `**Idea:** separate **catalog** (what we sell), **billing state** (mirrored from Stripe), **entitlements** (what the tenant may do right now) and **usage** (what they did). Webhooks connect billing state to entitlements.

\`\`\`javascript
// catalog_items — what we sell (source of truth: OUR DB)
{
  _id: 'pro', kind: 'plan',            // 'plan' | 'addon'
  name: 'Pro',
  prices: [                            // provider price ids per interval/currency
    { provider: 'stripe', priceId: 'price_pro_m_usd', interval: 'month', currency: 'usd', amount: 4900 },
    { provider: 'stripe', priceId: 'price_pro_y_usd', interval: 'year', currency: 'usd', amount: 49000 },
  ],
  grants: { limits: { employees: 200, aiScreenings: 1000, storageGb: 50 }, features: ['reports', 'sso'] },
  active: true, version: 3,
}
// index: { 'prices.priceId': 1 } (unique) -> map webhook price ids to catalog items fast

// tenants — the paying company
{
  _id, name,
  billing: {
    provider: 'stripe', customerId: 'cus_123', billingEmail,
    subscriptionId: 'sub_123', status: 'active',       // mirrored from Stripe
    currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd,
    pastDueSince, syncedAt,
  },
  entitlements: {                                       // computed snapshot, read on every request
    plan: 'pro',
    addons: ['ai-screening'],
    limits: { employees: 200, aiScreenings: 1500, storageGb: 50 },   // plan + add-ons merged
    features: ['reports', 'sso', 'ai-screening'],
    computedAt,
  },
}
// indexes: { 'billing.customerId': 1 } unique, { 'billing.subscriptionId': 1 }

// subscriptions — local mirror of the provider subscription (history + debugging)
{ _id: 'sub_123', tenantId, provider: 'stripe', status, items: [{ itemId, priceId, catalogId, quantity }],
  currentPeriodStart, currentPeriodEnd, raw: { /* last fetched object */ }, updatedAt }

// usage — one doc per tenant + metric + period
{ tenantId, metric: 'aiScreenings', periodStart, used: 312 }
// index: { tenantId: 1, metric: 1, periodStart: 1 } unique

// billing_events — processed webhook ids (idempotency + audit)
{ _id: 'evt_123', provider: 'stripe', type, receivedAt, processedAt, error }
// TTL index on receivedAt (e.g. 90 days)

// invoices (optional mirror for an in-app billing history page)
{ _id: 'in_123', tenantId, amountPaid, currency, status, hostedInvoiceUrl, periodStart, periodEnd }
\`\`\`

**Flow:** webhook → re-fetch subscription → upsert \`subscriptions\` → map each item price id to a catalog item → merge grants into \`tenant.entitlements\` → feature checks read only \`tenant.entitlements\` (and \`usage\` for counters).

**Source of truth:**
- Money, subscription status, invoices → **Stripe** (we mirror).
- What a plan includes, limits, feature flags → **our catalog**.
- Usage counts → **our DB** (and reported to Stripe only if usage is billed).

**Why it works:** feature code asks "does this tenant have \`ai-screening\`?" instead of "is the plan Pro?", so changing what a plan includes or adding an add-on needs no code change. The \`provider\` field leaves room for Razorpay. The \`entitlements\` snapshot makes access checks a single read.

**Edge cases:** Enterprise custom deals (allow per-tenant \`overrides\` merged last); grandfathered plan versions (\`version\` on catalog items); recompute entitlements in a nightly job too, in case a webhook was missed.`,
      followUps: [
        {
          q: 'Why not just call Stripe to check the plan on each request?',
          a: 'Latency, rate limits and a hard dependency: if Stripe is slow, your whole app is slow. Mirror the state via webhooks and read locally.',
        },
        {
          q: 'Would you use Stripe Entitlements (Features) instead?',
          a: 'It can work: you attach features to products and Stripe sends active entitlements. Many teams still keep limits (numbers) in their own DB because numeric limits and usage are app-specific.',
        },
      ],
    },
    {
      id: 'marketplace-addons-design',
      title: 'Design a marketplace of add-ons with plan rules',
      difficulty: 'hard',
      type: 'design',
      frequency: 'occasional',
      relatedTopic: 'subscription-items-add-ons',
      question: `Your HR SaaS opens a **marketplace**: tenants can buy add-ons from a catalog. Rules:

- Some add-ons are **monthly** (AI screening, $15/mo), some **one-time** (data migration service, $299), some **per-seat** (background checks, $2 per employee per month).
- Some add-ons require a minimum plan (SSO needs Pro).
- Some add-ons are **included free** in higher plans (Enterprise gets AI screening free).
- When a tenant downgrades below the required plan, dependent add-ons must be handled.

Design the API, catalog model and Stripe mapping.`,
      hints: [
        'Recurring add-ons → extra items on the existing subscription. One-time add-ons → a one-time payment (Checkout in `payment` mode or an invoice item on the next invoice).',
        'Per-seat → a subscription item whose `quantity` follows the employee count.',
        'Put rules (`requiresPlan`, `includedIn`) in your catalog and check them on the server before calling Stripe.',
      ],
      solution: `**Idea:** one catalog with explicit rules; the purchase API validates rules, then maps each billing type to the right Stripe primitive; webhooks recompute entitlements.

\`\`\`javascript
// catalog_items (kind: 'addon')
{ _id: 'ai-screening', billing: 'recurring', priceId: 'price_ai_m', requiresPlan: null, includedIn: ['enterprise'], grants: { features: ['ai-screening'], limits: { aiScreenings: 500 } } }
{ _id: 'sso', billing: 'recurring', priceId: 'price_sso_m', requiresPlan: 'pro', includedIn: ['enterprise'], grants: { features: ['sso'] } }
{ _id: 'bg-checks', billing: 'per_seat', priceId: 'price_bg_seat', requiresPlan: null, includedIn: [], grants: { features: ['background-checks'] } }
{ _id: 'migration', billing: 'one_time', priceId: 'price_migration', requiresPlan: null, includedIn: [], grants: { features: [] } }

const PLAN_RANK = { free: 0, starter: 1, pro: 2, enterprise: 3 };

// POST /marketplace/addons/:id/purchase
export async function purchaseAddon(tenant, addonId) {
  const addon = await Catalog.findOne({ _id: addonId, kind: 'addon', active: true });
  if (!addon) throw httpError(404, 'Add-on not found');

  const plan = tenant.entitlements.plan;
  if (addon.includedIn.includes(plan)) throw httpError(409, 'Already included in your plan');
  if (addon.requiresPlan && PLAN_RANK[plan] < PLAN_RANK[addon.requiresPlan]) {
    throw httpError(403, 'Requires the ' + addon.requiresPlan + ' plan');
  }
  if (tenant.entitlements.addons.includes(addonId)) return { status: 'already_active' };

  const subId = tenant.billing.subscriptionId;
  switch (addon.billing) {
    case 'recurring':
      await stripe.subscriptionItems.create({ subscription: subId, price: addon.priceId, quantity: 1, proration_behavior: 'always_invoice' });
      return { status: 'active' };            // entitlements updated by webhook
    case 'per_seat':
      await stripe.subscriptionItems.create({ subscription: subId, price: addon.priceId, quantity: tenant.employeeCount, proration_behavior: 'always_invoice' });
      return { status: 'active' };
    case 'one_time': {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: tenant.billing.customerId,
        line_items: [{ price: addon.priceId, quantity: 1 }],
        metadata: { tenantId: tenant.id, addonId },  // payment mode: session metadata is enough
        success_url: process.env.APP_URL + '/marketplace?bought=' + addonId,
        cancel_url: process.env.APP_URL + '/marketplace',
      });
      return { status: 'redirect', url: session.url }; // fulfil on checkout.session.completed
    }
  }
}
\`\`\`

**Per-seat sync:** when employees are added/removed, update the item quantity (\`stripe.subscriptionItems.update(itemId, { quantity })\`). Debounce it (e.g. a job every hour or on bulk import end) so 500 imported employees do not create 500 prorations.

**Downgrade rules:** before a downgrade, list add-ons whose \`requiresPlan\` is above the new plan. Show them in a confirm dialog, then remove those items in the **same** \`subscriptions.update\` call as the plan change. Add-ons that become "included" on an upgrade (Enterprise + AI screening) are removed as paid items so the tenant is not charged twice.

**Why it works:** the rules live in data, not in if-statements spread over the code. Stripe just sees subscription items and one-time payments, which it handles natively.

**Edge cases:** one-time services need fulfilment state (\`requested → in_progress → done\`); refunds remove the add-on grant; add-ons with different intervals than the base plan may need a separate subscription.`,
      followUps: [
        {
          q: 'What if third-party vendors sell add-ons and get paid?',
          a: 'That is a real marketplace: use Stripe Connect so vendors have connected accounts, and use destination charges or separate charges and transfers with an application fee for your cut.',
        },
        {
          q: 'How do you show the price before purchase including proration?',
          a: 'Ask Stripe for an invoice preview with the extra item added (same idea as the upgrade preview), and display the amount due today.',
        },
      ],
    },
    {
      id: 'migrate-prices-safely',
      title: 'Raise prices without breaking existing customers',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'saas-billing-architecture',
      question: `Management decides: Pro goes from **$49 to $59/month**. New customers pay $59 from Monday. Existing customers keep $49 for 3 months (with an email notice), then move to $59. A few big customers are "grandfathered" at $49 forever.

You cannot edit the amount of an existing Stripe Price. How do you roll this out safely?`,
      hints: [
        'Prices are immutable. Create a **new** Price on the same Product and archive the old one for new sign-ups (`active: false`). Existing subscriptions keep the old price.',
        'Use a lookup key (e.g. `pro_monthly`) so your code asks for "the current Pro monthly price" instead of hardcoding a price id; `transfer_lookup_key` moves the key to the new price.',
        'Migrate existing subscriptions in batches at their **renewal** with `proration_behavior: \'none\'`, idempotently, with a dry-run first.',
      ],
      solution: `**Idea:** add the new price, point new sign-ups to it, and move old subscribers on a schedule at their renewal date — never mid-period, never all at once without a dry run.

**Step 1 — new price, catalog update (day 0):**

\`\`\`javascript
const newPrice = await stripe.prices.create({
  product: 'prod_pro',
  currency: 'usd',
  unit_amount: 5900,
  recurring: { interval: 'month' },
  lookup_key: 'pro_monthly',
  transfer_lookup_key: true,          // move the key from the old $49 price to this one
});
await stripe.prices.update(OLD_PRICE_ID, { active: false }); // no NEW subscriptions on $49
await Catalog.updateOne({ _id: 'pro' }, { $push: { prices: { provider: 'stripe', priceId: newPrice.id, interval: 'month', amount: 5900 } } });
\`\`\`

Archiving does **not** affect existing subscriptions; they keep renewing at $49. Keep the old price id in your catalog so webhooks still map it to "Pro" (same entitlements).

**Step 2 — notify:** email every affected admin with the date. Mark grandfathered tenants in your DB (\`priceLock: true\`).

**Step 3 — migration job (after the notice period):**

\`\`\`javascript
export async function migrateProPrices({ dryRun = true } = {}) {
  const report = [];
  for await (const sub of stripe.subscriptions.list({ price: OLD_PRICE_ID, status: 'active', limit: 100 })) {
    const tenant = await Tenant.findOne({ 'billing.customerId': sub.customer });
    if (!tenant || tenant.priceLock) { report.push({ sub: sub.id, action: 'skip' }); continue; }

    const item = sub.items.data.find((i) => i.price.id === OLD_PRICE_ID);
    report.push({ sub: sub.id, action: 'migrate' });
    if (dryRun) continue;

    await stripe.subscriptions.update(
      sub.id,
      {
        items: [{ id: item.id, price: newPrice.id }],
        proration_behavior: 'none',   // no charge now: the new amount applies from the next renewal
      },
      { idempotencyKey: 'price-migration-2026-pro-' + sub.id } // safe to re-run the job
    );
  }
  return report;
}
\`\`\`

With \`proration_behavior: 'none'\` the current period stays paid at $49 and the next invoice uses $59, so each customer moves at their own renewal date. (A Subscription Schedule per subscription is the alternative if you need the switch at an exact future date.)

**Why it works:** nothing is changed in place, so there is always a way back (move subscribers back to the old price id). Lookup keys keep code free of hardcoded ids. Batching, dry runs and idempotency keys make the job safe to stop and resume.

**Edge cases:** yearly subscribers (migrate at their yearly renewal, needs a separate notice); tenants with coupons (check the coupon still applies to the new price); trialing tenants (switch before the trial ends); rate limits (pace the loop); some regions require explicit consent for price increases — involve legal.`,
      followUps: [
        {
          q: 'How do you roll back if something goes wrong?',
          a: 'Run the same job in reverse (new price → old price, `proration_behavior: none`). Because the old Price still exists (only archived), nothing is lost. If someone was over-charged, issue credit notes.',
        },
        {
          q: 'Why not give everyone a coupon of $10 off instead of keeping the old price?',
          a: 'Possible for a temporary grandfather period, but coupons expire, stack with other discounts and clutter invoices. Keeping them on the old price is clearer for permanent grandfathering.',
        },
      ],
    },
  ],
};
