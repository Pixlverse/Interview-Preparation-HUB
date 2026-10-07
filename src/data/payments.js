// Stripe & Razorpay — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'payments',
  title: 'Stripe & Razorpay',
  icon: '💳',
  description: 'Taking money safely in a SaaS: Stripe objects, Checkout, subscriptions, webhooks, proration, usage billing and entitlements, plus Razorpay orders, signatures and UPI for India.',
  definitionTitle: 'What are Stripe and Razorpay?',
  definition: `**Stripe** and **Razorpay** are **payment gateways**. They are services that let your app accept online payments (cards, UPI, wallets, bank transfers) safely, without you storing card details yourself.

- **Stripe** is global and very strong for **subscriptions and billing**: plans, trials, invoices, proration, coupons and usage-based billing.
- **Razorpay** is India-focused, with strong **UPI** and local payment-method support.

Both send **webhooks**, which are server-to-server messages that tell your backend when a payment succeeds or fails.

**One-line answer:** "Stripe and Razorpay are payment gateways that securely process online payments and subscriptions through APIs and hosted checkouts, and notify your backend through signed webhooks."`,
  topics: [
    {
      id: 'stripe-core-objects',
      title: 'Stripe Core Objects (Customer, Product, Price, PaymentIntent, SetupIntent, Subscription, Invoice)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Stripe is a set of linked objects: a Customer buys a Price of a Product; money moves through PaymentIntents; Subscriptions create Invoices every period.',
      what: `Stripe models billing as a small set of **objects**. Each one has an id with a prefix, so you can recognise it at a glance.

- **Customer** (\`cus_...\`) — the person or company who pays. In a multi-tenant SaaS, one tenant (company) = one Stripe Customer.
- **Product** (\`prod_...\`) — what you sell, for example "Pro Plan" or "Extra Seats".
- **Price** (\`price_...\`) — how much and how often, for example "₹999 per month" or "$10 per seat per month". One Product can have many Prices (monthly, yearly, USD, INR).
- **PaymentIntent** (\`pi_...\`) — one attempt to collect one payment. It tracks the whole journey: card entered, 3D Secure, success or failure.
- **SetupIntent** (\`seti_...\`) — saves a card for later **without** charging now.
- **PaymentMethod** (\`pm_...\`) — the saved card, UPI, bank account, etc.
- **Subscription** (\`sub_...\`) — "charge this Customer for these Prices every month". It has **items** (one per Price).
- **Invoice** (\`in_...\`) — the bill. A Subscription creates an Invoice each period, and the Invoice uses a PaymentIntent to collect money.

#### Deeper version
The chain for a subscription renewal is: **Subscription → Invoice → PaymentIntent → Charge**. The Charge is the actual money movement; Refunds and Disputes attach to it.

Prices are **immutable** for amount: you cannot edit the amount of a Price. To change pricing you create a new Price and move customers to it (or keep old customers on the old Price, which is called grandfathering). Use \`lookup_key\` on Prices so your code says \`pro_monthly\` instead of hard-coding \`price_123\` ids that differ between test and live mode.

Every object has \`metadata\` (your own key-value pairs). Put your \`tenantId\` there so webhooks can find the right tenant in your database.`,
      why: `If you understand the objects, every Stripe feature becomes "which object do I create or update?". Interviewers ask this first because people who mix up Product and Price, or PaymentIntent and Charge, usually build fragile billing code. Knowing the chain also helps you choose which webhook to listen to.`,
      analogy: `Think of a gym. The **Customer** is the member. The **Product** is "Gym membership"; the **Price** is "₹1,500 per month" or "₹15,000 per year". The **Subscription** is the membership card that says "charge me every month". Each month the front desk prints an **Invoice** (the bill), and swiping the card at the counter is the **PaymentIntent**. Saving your card at the desk without paying today is the **SetupIntent**.`,
      code: [
        {
          title: 'Create the catalog and a Customer for a tenant',
          lang: 'javascript',
          code: `import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Product = what you sell
const product = await stripe.products.create({ name: 'Pro Plan' });

// 2. Price = how much and how often (amount is in the smallest unit: paise/cents)
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 99900,            // ₹999.00
  currency: 'inr',
  recurring: { interval: 'month' },
  lookup_key: 'pro_monthly',     // stable name you use in code
});

// 3. Customer = the tenant that pays. Link it to your DB with metadata.
const customer = await stripe.customers.create({
  email: 'billing@acme.com',
  name: 'Acme HR Pvt Ltd',
  metadata: { tenantId: 'tenant_42' },
});

console.log(product.id, price.id, customer.id);`,
        },
        {
          title: 'Find a Price by lookup_key instead of hard-coding ids',
          lang: 'javascript',
          code: `const { data } = await stripe.prices.list({
  lookup_keys: ['pro_monthly'],
  expand: ['data.product'],      // also load the Product in the same call
});
const proMonthly = data[0];
console.log(proMonthly.id, proMonthly.unit_amount, proMonthly.product.name);`,
        },
      ],
      output: `The first block prints three ids like \`prod_Q1...\`, \`price_1P...\` and \`cus_Q9...\`. You save \`customer.id\` on your tenant document in MongoDB (for example \`tenant.stripeCustomerId\`).

The second block finds the Price by its friendly name \`pro_monthly\`. It prints the price id, \`99900\` (amounts are always integers in the smallest currency unit) and \`Pro Plan\` because we expanded the product.`,
      questions: [
        {
          q: 'What is the difference between a Product and a Price?',
          a: 'A Product is what you sell ("Pro Plan"). A Price is how much and how often ("₹999/month"). One Product can have many Prices, for example monthly, yearly and different currencies.',
        },
        {
          q: 'What is the difference between a PaymentIntent and a Charge?',
          a: 'A PaymentIntent is the whole payment attempt with a state machine (needs card, needs 3DS, succeeded). A Charge is one actual attempt to move money. One PaymentIntent can have several failed Charges and one successful one.',
        },
        {
          q: 'How do you link a Stripe Customer to your own user or tenant?',
          a: 'Save the Stripe `customer.id` in your database, and also put your own id in the Customer `metadata` (for example `tenantId`). Then lookups work in both directions, including inside webhooks.',
        },
        {
          q: 'Why are amounts integers?',
          a: 'Stripe uses the smallest currency unit (paise, cents) to avoid floating-point errors. ₹999 is `99900`. Some currencies like JPY have no decimal unit, so check the currency.',
        },
      ],
      spoken: `"Stripe billing is built from a few linked objects. A Customer is who pays — in my HR SaaS one tenant was one Customer. A Product is what we sell, and a Price is the amount and interval, so one plan can have monthly and yearly Prices. A Subscription ties a Customer to Prices through subscription items. Every period it creates an Invoice, and the Invoice collects money through a PaymentIntent. SetupIntents save a card without charging. I always store the Stripe ids in Mongo and put our tenantId in metadata so webhooks can map back to the tenant."`,
      mistakes: [
        'Trying to edit a Price amount. Prices are immutable for amount — create a new Price and migrate customers.',
        'Hard-coding `price_...` ids. They differ between test and live mode; use `lookup_key` or config per environment.',
        'Sending amounts as decimals like `999.00`. Stripe wants integers in the smallest unit (`99900`).',
        'Creating a new Stripe Customer on every checkout. Create one per tenant once and reuse it, or you get duplicate customers and split payment history.',
        'Follow-up trap: "Where does the money actually move — Invoice or PaymentIntent?" The Invoice is the bill; it creates a PaymentIntent, and the PaymentIntent creates the Charge that moves money.',
      ],
      takeaway: 'Customer buys a Price of a Product; Subscriptions make Invoices; Invoices collect through PaymentIntents.',
    },
    {
      id: 'stripe-keys-test-mode',
      title: 'API Keys, Test Mode and Test Cards',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Publishable key goes to the browser, secret key stays on the server; test mode is a full sandbox with test cards.',
      what: `Stripe gives you two kinds of keys:

- **Publishable key** (\`pk_test_...\` / \`pk_live_...\`) — safe to put in frontend code. It can only do things like show Stripe Elements and confirm a payment.
- **Secret key** (\`sk_test_...\` / \`sk_live_...\`) — full power over your account. It must **only** live on your server, in environment variables.

**Test mode** is a separate copy of your account. Nothing is real: you use **test cards** like \`4242 4242 4242 4242\` (always succeeds) and \`4000 0025 0000 3155\` (asks for 3D Secure). Objects in test mode do not exist in live mode.

#### Deeper version
- **Restricted keys** (\`rk_...\`) let you give a service only the permissions it needs, for example read-only access for an analytics job.
- Every request is pinned to an **API version**. Your account has a default version, and you can pin one in the SDK constructor. Newer Stripe SDKs pin a version by default, so upgrading the npm package can change response shapes. Read the changelog before upgrading.
- Stripe has also introduced **Sandboxes** (isolated test environments). Check the current docs for how they relate to classic test mode in your account.
- The **Stripe CLI** can forward webhooks to localhost: \`stripe listen --forward-to localhost:4000/webhooks/stripe\`.`,
      why: `Leaking a secret key means anyone can refund, create charges or read your customers. Knowing test cards lets you test failure paths (declines, 3DS, insufficient funds) before real users hit them.`,
      analogy: `The publishable key is your shop's address on the signboard — everyone can see it. The secret key is the key to the cash drawer — only the owner holds it. Test mode is a toy shop with play money where you can practise every situation.`,
      code: [
        {
          title: 'Server setup with env vars',
          lang: 'javascript',
          code: `// .env  (never commit this file)
// STRIPE_SECRET_KEY=sk_test_...
// STRIPE_WEBHOOK_SECRET=whsec_...

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing');
}

// One shared client for the whole app
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  maxNetworkRetries: 2,   // SDK retries safe network failures for you
});`,
        },
        {
          title: 'Local webhook testing with the Stripe CLI',
          lang: 'bash',
          code: `# Log in once
stripe login

# Forward test-mode events to your local Express server.
# It prints a whsec_... secret: put it in STRIPE_WEBHOOK_SECRET
stripe listen --forward-to localhost:4000/webhooks/stripe

# In another terminal, fire a fake event
stripe trigger invoice.payment_failed`,
        },
      ],
      output: `The server throws early if the key is missing, which is better than failing on the first real payment. The CLI prints a webhook signing secret and then logs every forwarded event, for example \`invoice.payment_failed [200]\`, so you can see if your handler answered with 200.`,
      questions: [
        {
          q: 'Which Stripe key can go in the frontend?',
          a: 'Only the publishable key (`pk_...`). The secret key (`sk_...`) must stay on the server in environment variables.',
        },
        {
          q: 'How do you test a 3D Secure payment?',
          a: 'Use a 3DS test card such as `4000 0025 0000 3155` in test mode. Stripe shows a fake authentication page where you can approve or fail it.',
        },
        {
          q: 'How do you test webhooks locally?',
          a: 'Use the Stripe CLI: `stripe listen --forward-to localhost:PORT/path`, and `stripe trigger <event>` to send sample events.',
        },
      ],
      spoken: `"Stripe has a publishable key for the browser and a secret key that only lives on the server in env vars. I also use restricted keys for internal services that need limited access. Test mode is a full sandbox, so I test success, declines and 3D Secure with the official test cards. For webhooks locally I run the Stripe CLI with stripe listen and forward to my Express route, and I use stripe trigger to fire events like invoice.payment_failed. I also pin the API version, because SDK upgrades can change response shapes."`,
      mistakes: [
        'Putting the secret key in a React or Next.js client bundle (for example a `NEXT_PUBLIC_` env var). Anyone can read it.',
        'Using test price ids in production. Test and live objects are completely separate.',
        'Upgrading the `stripe` npm package without reading the API version changelog. Field names can move between versions.',
        'Follow-up trap: "Is the webhook secret from the CLI the same as the dashboard one?" No. The CLI gives its own `whsec_`; the dashboard endpoint has a different one. Use the right one per environment.',
      ],
      takeaway: 'Publishable key in the browser, secret key only on the server, and test every failure path in test mode first.',
    },
    {
      id: 'payment-intents',
      title: 'PaymentIntents (One-time Payments)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Create the PaymentIntent on the server, send its client_secret to the browser, confirm with Stripe Elements, and trust the webhook for success.',
      what: `A **PaymentIntent** represents "I want to collect ₹X from this customer". It moves through statuses until it succeeds or is cancelled.

The basic flow:
1. Server creates a PaymentIntent with the amount. **The server decides the amount**, never the browser.
2. Server sends the \`client_secret\` to the frontend.
3. Frontend shows Stripe's **Payment Element** and calls \`stripe.confirmPayment()\`.
4. Stripe handles 3D Secure if needed.
5. Your server learns the result from the \`payment_intent.succeeded\` **webhook** and fulfils the order.

#### Deeper version
Main statuses: \`requires_payment_method\` → \`requires_confirmation\` → \`requires_action\` (3DS) → \`processing\` → \`succeeded\`. Also \`requires_capture\` (if you used manual capture) and \`canceled\`.

- \`automatic_payment_methods: { enabled: true }\` lets Stripe show the payment methods you turned on in the Dashboard.
- \`capture_method: 'manual'\` only **authorizes** (holds) the money; you capture later. Holds expire (often about 7 days for cards), so check the docs for your method.
- \`setup_future_usage: 'off_session'\` saves the card for future charges while paying now.
- The \`client_secret\` lets the browser confirm this one payment. Don't log it or store it.`,
      why: `PaymentIntents handle the hard parts for you: retries, 3D Secure, async payment methods and a clear status. Without it you would have to build your own state machine for "paid / pending / needs authentication".`,
      analogy: `It is like a delivery tracking number. Once created, everyone (your server, the browser, Stripe) looks at the same tracking number to see the status: "waiting for address", "needs signature", "delivered".`,
      code: [
        {
          title: 'Express: create a PaymentIntent (amount decided on the server)',
          lang: 'javascript',
          code: `import express from 'express';
import { stripe } from './stripe.js';

const router = express.Router();

router.post('/api/payments/intent', requireAuth, async (req, res) => {
  // Never trust an amount from the client. Look it up yourself.
  const pack = await CreditPack.findById(req.body.packId);
  if (!pack) return res.status(404).json({ error: 'Pack not found' });

  const intent = await stripe.paymentIntents.create({
    amount: pack.priceInPaise,           // e.g. 49900 = ₹499
    currency: 'inr',
    customer: req.tenant.stripeCustomerId,
    automatic_payment_methods: { enabled: true },
    metadata: { tenantId: String(req.tenant._id), packId: String(pack._id) },
  });

  res.json({ clientSecret: intent.client_secret });
});

export default router;`,
        },
        {
          title: 'React: confirm with the Payment Element',
          lang: 'jsx',
          code: `import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export function PayForm() {
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;   // Stripe.js not loaded yet

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/billing/done' },
    });
    // Only reached if there is an immediate error (e.g. card declined)
    if (error) alert(error.message);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Pay</button>
    </form>
  );
}
// Wrap it in <Elements stripe={stripePromise} options={{ clientSecret }}>`,
        },
      ],
      output: `The server returns \`{ clientSecret: 'pi_..._secret_...' }\`. The React form renders Stripe's card/UPI fields inside an iframe. On submit, Stripe confirms the payment, shows 3D Secure if the bank asks, and redirects to \`/billing/done\`. If the card is declined, \`error.message\` says something like "Your card was declined." The order is marked paid only when the server receives \`payment_intent.succeeded\`.`,
      questions: [
        {
          q: 'Why create the PaymentIntent on the server?',
          a: 'Because the amount must come from your trusted server and the secret key is needed. If the browser chose the amount, a user could pay ₹1 for a ₹999 item.',
        },
        {
          q: 'Why not mark the order paid on the success redirect page?',
          a: 'The user can close the tab before redirect, or fake the URL. The webhook `payment_intent.succeeded` is the reliable signal. The redirect page is only for UX.',
        },
        {
          q: 'What does capture_method manual do?',
          a: 'It authorizes the payment (holds the money) without taking it. You call `paymentIntents.capture()` later, for example after shipping. Uncaptured holds expire after some days.',
        },
        {
          q: 'What is the client_secret?',
          a: 'A key that lets the frontend confirm and read this one PaymentIntent. It cannot create other charges, but it should not be logged or shared.',
        },
      ],
      spoken: `"For a one-time payment I create a PaymentIntent on the server with an amount I look up myself, never from the client, plus the customer id and metadata like tenantId. I return only the client_secret to the frontend, where the Payment Element collects details and calls confirmPayment, which also handles 3D Secure. I don't trust the redirect page to mark things as paid. I fulfil the order in the payment_intent.succeeded webhook, because the user might close the tab, and the webhook is signed by Stripe."`,
      mistakes: [
        'Accepting `amount` from the request body. Always compute it on the server from your own data.',
        'Fulfilling the order on the success page instead of in the webhook.',
        'Creating a new PaymentIntent on every page refresh. Reuse the existing one for the same cart/order, or you get many abandoned intents.',
        'Follow-up trap: "What if the status is processing?" Some methods (bank debits, some UPI flows) are async. Show "payment pending" and wait for the webhook to say succeeded or failed.',
      ],
      takeaway: 'Server creates the intent and decides the amount; browser confirms; the webhook decides success.',
    },
    {
      id: 'stripe-checkout',
      title: 'Stripe Checkout Sessions',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A Stripe-hosted payment page: create a Checkout Session on the server, redirect the user, and handle checkout.session.completed.',
      what: `**Stripe Checkout** is a ready-made payment page hosted by Stripe. You create a **Checkout Session** on your server, send the user to its \`url\`, and Stripe handles the form, cards, wallets, 3D Secure, coupons, taxes and receipts.

It has three modes:
- \`payment\` — one-time payment.
- \`subscription\` — starts a Subscription.
- \`setup\` — only saves a payment method.

#### Deeper version
- \`client_reference_id\` and \`metadata\` carry your own ids (like \`tenantId\`) to the webhook.
- Pass an existing \`customer\` so the tenant does not get a duplicate Customer.
- \`success_url\` can contain \`{CHECKOUT_SESSION_ID}\`; Stripe replaces it with the real id so your success page can fetch the session.
- \`subscription_data\` sets things for the new subscription (trial days, metadata).
- \`allow_promotion_codes: true\` shows a "promo code" box.
- There is also an **embedded** Checkout option (shown inside your page) — the server side is the same idea. Check the docs for the current \`ui_mode\` values.
- Sessions expire (24 hours by default). Listen for \`checkout.session.completed\` and, for async methods, \`checkout.session.async_payment_succeeded\` / \`..._failed\`.`,
      why: `Building your own payment form takes weeks and you must handle every edge case. Checkout gives a conversion-optimised, PCI-compliant page in an hour, and it is the fastest way to start a subscription correctly.`,
      analogy: `It is like sending the customer to the bank's counter instead of building your own counter. You tell the bank "collect ₹999 per month from this person", the bank does the paperwork, and then sends you a note (webhook) when it is done.`,
      code: [
        {
          title: 'Create a subscription Checkout Session for a tenant',
          lang: 'javascript',
          code: `router.post('/api/billing/checkout', requireAuth, async (req, res) => {
  const tenant = req.tenant;
  const { data: prices } = await stripe.prices.list({ lookup_keys: [req.body.plan] });
  if (!prices.length) return res.status(400).json({ error: 'Unknown plan' });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: tenant.stripeCustomerId,          // reuse, don't duplicate
    line_items: [{ price: prices[0].id, quantity: tenant.seatCount }],
    client_reference_id: String(tenant._id),
    subscription_data: { metadata: { tenantId: String(tenant._id) } },
    allow_promotion_codes: true,
    success_url: process.env.APP_URL + '/billing/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: process.env.APP_URL + '/billing',
  });

  res.json({ url: session.url });   // frontend does window.location = url
});`,
        },
        {
          title: 'Handle the completed session in the webhook',
          lang: 'javascript',
          code: `async function onCheckoutCompleted(session) {
  // session.subscription is the new sub id (mode = subscription)
  const tenantId = session.client_reference_id;
  await Tenant.updateOne(
    { _id: tenantId },
    { stripeSubscriptionId: session.subscription, billingStatus: 'active' }
  );
}`,
        },
      ],
      output: `The API returns a URL like \`https://checkout.stripe.com/c/pay/cs_test_...\`. The user pays there. Stripe redirects to \`/billing/success?session_id=cs_test_...\` and, separately, sends \`checkout.session.completed\` to your webhook. The webhook saves the subscription id on the tenant. The success page only shows "Thanks! Activating your plan..." and can poll your API until the tenant is active.`,
      questions: [
        {
          q: 'Checkout vs Payment Element — when do you use which?',
          a: 'Checkout is fastest and Stripe maintains it; use it unless you need a fully custom in-app UI. The Payment Element gives full UI control but you write more code (intents, confirmation, error states).',
        },
        {
          q: 'How do you know which tenant paid?',
          a: 'Pass `client_reference_id` and/or `metadata.tenantId` when creating the session, and pass the existing `customer`. Read them back in the `checkout.session.completed` webhook.',
        },
        {
          q: 'Is checkout.session.completed enough to mark a payment as done?',
          a: 'For cards, usually yes (`payment_status` is `paid`). For delayed methods, the session can complete with `payment_status: unpaid`; then wait for `checkout.session.async_payment_succeeded`.',
        },
      ],
      spoken: `"Stripe Checkout is a hosted payment page. On the server I create a Checkout Session with mode subscription, the tenant's existing customer id, the price from a lookup key, the seat quantity, and our tenantId in client_reference_id and subscription metadata. I enable promotion codes and set success and cancel URLs. The frontend just redirects to session.url. Activation happens in the checkout.session.completed webhook, not on the success page, and I check payment_status for async methods. It keeps us PCI-light and handles 3D Secure and wallets for free."`,
      mistakes: [
        'Activating the plan on the success URL. Users can open that URL without paying.',
        'Not passing `customer`, so every checkout creates a new Customer for the same tenant.',
        'Passing both `allow_promotion_codes` and `discounts` — Stripe rejects that combination; choose one.',
        'Follow-up trap: "What if the user never returns from Checkout?" Nothing breaks — the webhook still arrives. Expired sessions fire `checkout.session.expired`, which you can use for abandoned-cart emails.',
      ],
      takeaway: 'Checkout = create session on server, redirect, and activate from the webhook.',
    },
    {
      id: 'pci-basics',
      title: 'PCI DSS Basics (Why Elements/Checkout Keep You in SAQ A)',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'If card numbers never touch your servers (Checkout or Elements iframes), your PCI work shrinks to the simplest questionnaire, SAQ A.',
      what: `**PCI DSS** is a security standard from the card networks (Visa, Mastercard...). Anyone who handles card data must follow it.

How much work you do depends on whether **raw card numbers touch your systems**:
- With **Stripe Checkout** (hosted page) or **Stripe Elements** (Stripe's iframes inside your page), the card number goes straight from the browser to Stripe. Your server only sees tokens like \`pm_...\`. This usually qualifies for **SAQ A** — the shortest self-assessment questionnaire.
- If you build your own \`<input>\` for card numbers and send them to your API, you are in the much bigger **SAQ D** scope: audits, network scans, strict controls.

#### Deeper version
SAQ means Self-Assessment Questionnaire. Even with SAQ A you still must: serve your pages over HTTPS, keep your site from being tampered with (a hacked script on your checkout page can still steal data), and never log card data. Newer PCI DSS v4 rules add requirements about managing scripts on payment pages, so the exact list can change — check Stripe's PCI guide and your acquirer for the current requirements. Stripe itself is a PCI Level 1 service provider.`,
      why: `PCI compliance is expensive and slow. Using Stripe's hosted fields means a small team can accept cards safely without becoming a card-security company.`,
      analogy: `It is like a sealed envelope. If customers put their card details in a sealed envelope that only the bank can open, and you just pass it along, you don't need a bank-grade vault in your office.`,
      code: [
        {
          title: 'Good vs bad: who sees the card number',
          lang: 'javascript',
          code: `// BAD: your own input posts the raw card number to your API (SAQ D scope)
// app.post('/pay', (req) => chargeCard(req.body.cardNumber, req.body.cvc));

// GOOD: Stripe Elements runs in an iframe; your server only gets ids/tokens
app.post('/api/subscribe', requireAuth, async (req, res) => {
  // req.body.paymentMethodId looks like 'pm_1Px...' — not a card number
  await stripe.paymentMethods.attach(req.body.paymentMethodId, {
    customer: req.tenant.stripeCustomerId,
  });
  await stripe.customers.update(req.tenant.stripeCustomerId, {
    invoice_settings: { default_payment_method: req.body.paymentMethodId },
  });
  res.json({ ok: true });
});`,
        },
      ],
      output: `In the good version, your logs and database only ever contain \`pm_...\` ids and maybe the card brand and last 4 digits (which Stripe returns and are safe to show). There is no card number for an attacker to steal from your servers.`,
      questions: [
        {
          q: 'What is PCI DSS?',
          a: 'A security standard from the card networks for anyone who stores, processes or transmits card data.',
        },
        {
          q: 'Why do Stripe Elements and Checkout reduce PCI scope?',
          a: 'Card data is entered in Stripe-hosted iframes or pages and sent straight to Stripe. Your servers never see it, so you usually qualify for SAQ A.',
        },
        {
          q: 'Can you store the last 4 digits and expiry?',
          a: 'Yes, Stripe returns brand, last4 and expiry on the PaymentMethod, and these are fine to display. Never store the full number or CVC.',
        },
      ],
      spoken: `"PCI DSS is the card industry's security standard. The main idea for scope is: do raw card numbers touch my servers? With Stripe Checkout or Elements, the card fields live in Stripe's iframes, so the number goes straight to Stripe and I only get a PaymentMethod id. That usually keeps us in SAQ A, the lightest questionnaire. If I built my own card inputs, we'd be in SAQ D with audits and scans. Even with SAQ A, we still need HTTPS, protect the checkout page's scripts, and never log card data."`,
      mistakes: [
        'Thinking "Stripe handles PCI so we have zero responsibility". You still fill SAQ A, use HTTPS and protect your pages.',
        'Logging full request bodies on payment routes in a custom integration — that can leak card data into logs.',
        'Follow-up trap: "Is Elements as safe as Checkout for PCI?" Both are usually SAQ A because fields are Stripe iframes, but with Elements your own page hosts them, so the security of your page matters more.',
      ],
      takeaway: 'Never let raw card numbers touch your servers — Checkout/Elements keep you in the smallest PCI scope.',
    },
    {
      id: 'razorpay-orders',
      title: 'Razorpay Orders',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Create an Order on the server with amount in paise, pass order_id to Razorpay Checkout, and link every payment to that order.',
      what: `In Razorpay you first create an **Order** on your server. An Order says "I expect ₹X for this purchase". It returns an \`order_id\` like \`order_Ns...\`.

Then the frontend opens **Razorpay Checkout** with that \`order_id\`. The user pays (card, UPI, netbanking, wallet), and Razorpay gives back a \`payment_id\` and a **signature** that your server must verify.

#### Deeper version
- Amounts are in **paise** (₹500 = \`50000\`), like Stripe.
- \`receipt\` is your own reference (for example your internal order id), useful for reconciliation.
- \`notes\` is a key-value object like Stripe's \`metadata\`.
- Order statuses: \`created\` → \`attempted\` (a payment was tried) → \`paid\`.
- Payments have their own statuses: \`created\`, \`authorized\`, \`captured\`, \`refunded\`, \`failed\`. With auto-capture enabled (common default in Dashboard settings), authorized payments are captured automatically. If not captured within the allowed window, they are auto-refunded — check the current docs for the timing.
- One Order can have several payment attempts (first fails, second succeeds), which is why you link everything to the order.`,
      why: `Orders stop tampering and double-payments. The amount is locked on the server, Razorpay checks the payment against the order, and you can always ask "is this order paid?" instead of trusting the browser.`,
      analogy: `An Order is like a restaurant bill with a bill number. The waiter (your server) writes the amount. The customer pays against that bill number at the counter (Razorpay). Later, the bill number tells you exactly what was paid.`,
      code: [
        {
          title: 'Express: create a Razorpay order',
          lang: 'javascript',
          code: `import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/rzp/order', requireAuth, async (req, res) => {
  const plan = await Plan.findById(req.body.planId);   // amount from DB, not client
  const ourOrder = await Order.create({ tenantId: req.tenant._id, planId: plan._id,
    amount: plan.pricePaise, status: 'created' });

  const order = await razorpay.orders.create({
    amount: plan.pricePaise,          // 50000 = ₹500
    currency: 'INR',
    receipt: String(ourOrder._id),    // your reference
    notes: { tenantId: String(req.tenant._id) },
  });

  ourOrder.razorpayOrderId = order.id;
  await ourOrder.save();
  res.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
});`,
        },
        {
          title: 'Frontend: open Razorpay Checkout',
          lang: 'javascript',
          code: `// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
const { orderId, amount, keyId } = await fetch('/api/rzp/order', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId }),
}).then((r) => r.json());

const rzp = new Razorpay({
  key: keyId,             // public key id only
  amount,
  currency: 'INR',
  order_id: orderId,
  name: 'Acme HR',
  handler: async (response) => {
    // response has razorpay_payment_id, razorpay_order_id, razorpay_signature
    await fetch('/api/rzp/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });
  },
});
rzp.on('payment.failed', (r) => alert(r.error.description));
rzp.open();`,
        },
      ],
      output: `The server creates our own Order in Mongo first, then the Razorpay order (\`order_...\`), and saves the link. The browser opens the Razorpay popup with the amount locked. On success, the \`handler\` receives three values and sends them to \`/api/rzp/verify\`, where the signature is checked (next topics). On failure, the \`payment.failed\` event shows the reason, and the user can retry on the same order.`,
      questions: [
        {
          q: 'Why create an Order before payment in Razorpay?',
          a: 'It locks the amount on the server, lets Razorpay tie payments to it, prevents tampering, and gives you one id to check whether the purchase is paid.',
        },
        {
          q: 'What is the receipt field?',
          a: 'Your own reference id (like your DB order id). It helps reconciliation between your records and Razorpay.',
        },
        {
          q: 'What is the difference between authorized and captured?',
          a: 'Authorized means the bank approved and blocked the money. Captured means you actually took it. Usually auto-capture is on; uncaptured payments get auto-refunded after a time limit.',
        },
      ],
      spoken: `"With Razorpay I always create an Order on the server first. I look up the amount from my database, create my own order record, then call razorpay.orders.create with the amount in paise, INR, my order id as the receipt, and tenantId in notes. The frontend opens Razorpay Checkout with the order_id and only the public key id. When payment succeeds, the handler gets payment id, order id and signature, and I verify that signature on the server before marking anything paid. I also rely on webhooks in case the browser closes."`,
      mistakes: [
        'Sending the amount from the browser to create the order. Compute it on the server.',
        'Exposing `key_secret` to the frontend. Only `key_id` is public.',
        'Treating the frontend `handler` call as proof of payment without verifying the signature.',
        'Follow-up trap: "What if the user pays but the handler never runs (tab closed)?" The `payment.captured` / `order.paid` webhook still arrives, so the order still becomes paid.',
      ],
      takeaway: 'Razorpay flow starts with a server-side Order: amount locked, receipt linked, payments verified against it.',
    },
    {
      id: 'stripe-webhooks',
      title: 'Stripe Webhooks (Raw Body + Signature Verification)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Stripe POSTs events to your server; verify them with constructEvent on the raw body, answer 200 fast, then process.',
      what: `A **webhook** is an HTTP POST that Stripe sends to your server when something happens: a payment succeeded, an invoice failed, a subscription was cancelled.

To trust it you must **verify the signature**. Stripe signs each request with your endpoint's secret (\`whsec_...\`) and puts it in the \`Stripe-Signature\` header. The SDK function \`stripe.webhooks.constructEvent(rawBody, signature, secret)\` checks it and returns the event, or throws.

The key Express detail: you need the **raw body** (exact bytes). If \`express.json()\` parses the body first, the bytes change and verification fails.

#### Deeper version
- The signature is an HMAC-SHA256 of \`timestamp + "." + rawBody\`. The timestamp check (default tolerance 5 minutes) blocks **replay attacks** — someone resending an old valid request.
- Mount \`express.raw({ type: 'application/json' })\` on the webhook route **before** any global \`express.json()\`, or exclude that path from the JSON parser.
- Answer with **2xx quickly**. Stripe treats slow or non-2xx responses as failures and **retries** (in live mode for up to about 3 days with backoff). For heavy work, store the event and process it in a queue.
- In Next.js App Router, read the raw body with \`await req.text()\`.`,
      why: `Most important billing changes happen **outside** your app: renewals at 3 AM, bank declines, customers cancelling in the portal, disputes. Webhooks are the only reliable way to keep your database in sync. Without signature checks, anyone could POST a fake "payment succeeded" event and get a free plan.`,
      analogy: `A webhook is like a courier delivering a sealed letter from the bank. The wax seal (signature) proves it really came from the bank and was not opened. If you open and re-fold the letter first (parse JSON), the seal looks broken.`,
      code: [
        {
          title: 'Express webhook route with raw body',
          lang: 'javascript',
          code: `import express from 'express';
import { stripe } from './stripe.js';

const app = express();

// 1. Webhook route FIRST, with the raw body parser
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,                               // Buffer, not parsed JSON
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Bad signature:', err.message);
    return res.status(400).send('Invalid signature');
  }

  try {
    await handleStripeEvent(event);           // your switch on event.type
    res.json({ received: true });             // 2xx = done
  } catch (err) {
    console.error('Handler failed', event.id, err);
    res.status(500).end();                    // Stripe will retry later
  }
});

// 2. JSON parser for every other route AFTER
app.use(express.json());`,
        },
        {
          title: 'Next.js App Router version',
          lang: 'typescript',
          code: `// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();                     // raw string
  const sig = req.headers.get('stripe-signature')!;
  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    await handleStripeEvent(event);
    return new Response('ok');
  } catch (err) {
    return new Response('Webhook error', { status: 400 });
  }
}`,
        },
      ],
      output: `A valid event passes \`constructEvent\` and returns an object like \`{ id: 'evt_...', type: 'invoice.paid', data: { object: {...invoice} } }\`. Your handler updates Mongo and the route returns 200. A forged request or a body that was parsed by \`express.json()\` throws "No signatures found matching the expected signature for payload", and you return 400. If your handler crashes, you return 500 and Stripe retries the same event later.`,
      questions: [
        {
          q: 'Why do you need the raw body for Stripe webhooks?',
          a: 'The signature is computed over the exact bytes Stripe sent. Parsing and re-stringifying JSON can change spacing or key order, so the HMAC no longer matches.',
        },
        {
          q: 'What happens if your endpoint returns 500?',
          a: 'Stripe marks the delivery failed and retries with exponential backoff (for days in live mode). So handlers must be idempotent.',
        },
        {
          q: 'How does Stripe prevent replay attacks on webhooks?',
          a: 'The signed header includes a timestamp. `constructEvent` rejects events older than the tolerance (5 minutes by default).',
        },
        {
          q: 'Should you do heavy work inside the webhook request?',
          a: 'No. Verify, save the event, return 200 quickly, then process in a background job or queue. Slow responses cause timeouts and retries.',
        },
      ],
      spoken: `"Webhooks are how Stripe tells my server about things that happen outside my app, like renewals, failed payments or cancellations. In Express I mount the webhook route with express.raw before the global JSON parser, because constructEvent verifies an HMAC signature over the exact raw bytes using the whsec secret. If the signature fails I return 400. If it passes, I process the event and return 200 fast. Any non-2xx makes Stripe retry for days, so my handlers are idempotent, and for heavy work I store the event and process it in a queue."`,
      mistakes: [
        'Putting `app.use(express.json())` before the webhook route. Verification always fails.',
        'Skipping verification "because the URL is secret". URLs leak; always verify.',
        'Returning 200 before doing the work and then crashing — the event is lost. Either process then respond, or durably store it first.',
        'Using the CLI webhook secret in production or the dashboard secret locally.',
        'Follow-up trap: "Can you trust `event.data.object` fully?" It is a snapshot at event time and may be stale. For important decisions, re-fetch the latest object from the API.',
      ],
      takeaway: 'Raw body in, constructEvent to verify, 2xx fast, idempotent handlers.',
    },
    {
      id: 'stripe-subscriptions',
      title: 'Stripe Subscriptions and Their Statuses',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A Subscription bills a Customer for one or more Prices each period; its status (trialing, active, past_due, canceled...) drives access.',
      what: `A **Subscription** says "bill this Customer for these Prices every month (or year)". Each Price is a **subscription item** with a quantity (for example 25 seats).

Ways to create one:
- **Checkout** with \`mode: 'subscription'\` (easiest).
- Directly with \`stripe.subscriptions.create()\` plus the Payment Element.

Important **statuses**:
- \`trialing\` — in free trial.
- \`active\` — paid and good.
- \`incomplete\` — first payment not done yet (for example waiting for 3DS). Becomes \`incomplete_expired\` after about 23 hours.
- \`past_due\` — a renewal payment failed; Stripe is retrying.
- \`unpaid\` / \`canceled\` — retries ran out (depends on your settings) or it was cancelled.
- \`paused\` — for example a trial ended with no payment method and you chose to pause.

#### Deeper version
- \`cancel_at_period_end: true\` cancels at the end of the paid period (user keeps access until then). Cancelling immediately ends it now.
- \`payment_behavior: 'default_incomplete'\` creates the subscription in \`incomplete\` state and returns a payment secret so the frontend can confirm the first payment.
- **API version note:** in recent API versions some fields moved. For example the billing period dates (\`current_period_start/end\`) moved from the Subscription to each subscription item, and how you get the first invoice's client secret changed (older: \`latest_invoice.payment_intent.client_secret\`; newer: \`latest_invoice.confirmation_secret.client_secret\`). Check the docs for your pinned API version.`,
      why: `Subscriptions are the heart of SaaS revenue. Your access control should follow the subscription status, and interviewers want to see you know what to do in each state (grace period for \`past_due\`, block on \`canceled\`, and so on).`,
      analogy: `It is like a mobile postpaid plan. The plan has items (base plan, extra data pack). Each month you get a bill. If you don't pay, the line goes into "payment due" (past_due) with reminders, and eventually gets disconnected (canceled/unpaid).`,
      code: [
        {
          title: 'Create a subscription directly (Payment Element flow)',
          lang: 'javascript',
          code: `const subscription = await stripe.subscriptions.create({
  customer: tenant.stripeCustomerId,
  items: [{ price: proPriceId, quantity: tenant.seatCount }],
  payment_behavior: 'default_incomplete',             // wait for first payment
  payment_settings: { save_default_payment_method: 'on_subscription' },
  metadata: { tenantId: String(tenant._id) },
  // Newer API versions: confirmation_secret. Older: latest_invoice.payment_intent
  expand: ['latest_invoice.confirmation_secret'],
});

res.json({
  subscriptionId: subscription.id,
  clientSecret: subscription.latest_invoice.confirmation_secret.client_secret,
});`,
        },
        {
          title: 'Cancel at period end, and map status to access',
          lang: 'javascript',
          code: `// User clicks "Cancel plan": keep access until the paid period ends
await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
  cancel_at_period_end: true,
});

// Decide access from the status you synced from webhooks
function hasAccess(status) {
  return ['active', 'trialing', 'past_due'].includes(status); // past_due = grace period
}
console.log(hasAccess('past_due'), hasAccess('canceled'));   // true false`,
        },
      ],
      output: `The create call returns a subscription with status \`incomplete\` and a client secret. The frontend confirms the payment with the Payment Element; then Stripe sends \`invoice.paid\` and \`customer.subscription.updated\` with status \`active\`. The cancel call sets \`cancel_at_period_end\` to true; the status stays \`active\` until the period ends, then becomes \`canceled\` and \`customer.subscription.deleted\` fires. \`hasAccess\` prints \`true false\`.`,
      questions: [
        {
          q: 'What is the difference between past_due and unpaid/canceled?',
          a: '`past_due` means a renewal failed and Stripe is still retrying. After retries end, your billing settings decide whether it becomes `canceled` or `unpaid` (or stays past_due).',
        },
        {
          q: 'How do you cancel without cutting off access immediately?',
          a: 'Set `cancel_at_period_end: true`. The subscription stays active until the period ends, then cancels.',
        },
        {
          q: 'What does payment_behavior default_incomplete do?',
          a: 'It creates the subscription as `incomplete` and lets the frontend confirm the first payment (including 3DS). If not paid in about 23 hours it becomes `incomplete_expired`.',
        },
        {
          q: 'Where do you check if a tenant can use the product?',
          a: 'In my own database, using the status and plan synced from webhooks — not by calling Stripe on every request.',
        },
      ],
      spoken: `"A Stripe Subscription bills a customer for one or more prices every period, each as a subscription item with a quantity — like seats. I usually start them through Checkout, or with payment_behavior default_incomplete when I use the Payment Element. The statuses matter for access: trialing and active get full access, past_due gets a grace period with a banner while Stripe retries, and canceled or unpaid lose paid features. For cancellations I use cancel_at_period_end so customers keep what they paid for. I sync status to Mongo from webhooks and check access there."`,
      mistakes: [
        'Calling the Stripe API on every request to check status. Sync it to your DB via webhooks and read locally.',
        'Cutting access immediately on `past_due`. Usually you give a grace period while Smart Retries run.',
        'Ignoring `incomplete` — users who abandoned 3DS end up with a dead subscription; clean them up or prompt them.',
        'Reading `subscription.current_period_end` on a new API version where it moved to the items. Check your pinned version.',
        'Follow-up trap: "Can one customer have two subscriptions?" Yes, Stripe allows it. Your app must decide if that is valid (usually one per tenant) and guard against double checkouts.',
      ],
      takeaway: 'Subscription status drives access; sync it from webhooks and handle every state on purpose.',
    },
    {
      id: 'subscription-webhook-events',
      title: 'Which Webhook Events to Handle for Subscriptions',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'checkout.session.completed, customer.subscription.created/updated/deleted, invoice.paid, invoice.payment_failed, plus trial_will_end and action_required.',
      what: `You do not need every event. For subscription billing, these cover almost everything:

- \`checkout.session.completed\` — Checkout finished; link the new subscription to the tenant.
- \`customer.subscription.created\` / \`customer.subscription.updated\` — status, plan, quantity or cancel flag changed. **Sync the plan and status from here.**
- \`customer.subscription.deleted\` — subscription ended. Downgrade to free.
- \`invoice.paid\` — a period was paid (first payment or renewal). Extend access, reset usage counters.
- \`invoice.payment_failed\` — renewal failed. Notify the admin, show a banner.
- \`invoice.payment_action_required\` — the bank needs 3DS for a renewal. Email a link so the customer can authenticate.
- \`customer.subscription.trial_will_end\` — sent about 3 days before a trial ends. Remind them to add a card.

#### Deeper version
A good pattern: **don't trust the event payload as the final truth**. For subscription events, take the subscription id, re-fetch the subscription from Stripe, and write its current state to your DB. This also fixes out-of-order events (see the idempotency topic).

Other useful events: \`invoice.upcoming\` (a few days before renewal — good for usage-based add-ons), \`invoice.finalized\`, \`charge.refunded\`, \`charge.dispute.created\`, \`customer.subscription.paused\` / \`resumed\`, and \`payment_method.attached\`.`,
      why: `Listening to too few events leaves your database wrong (for example a tenant cancelled in the portal still has Pro). Listening to too many adds noise. Interviewers ask this to see if you've actually run billing in production.`,
      analogy: `Think of a newspaper subscription office. You care about: "new subscriber", "changed plan", "stopped", "paid this month", "payment bounced", "needs signature", and "trial ending soon". You don't need a note every time the printing press starts.`,
      code: [
        {
          title: 'Event router for subscription billing',
          lang: 'javascript',
          code: `export async function handleStripeEvent(event) {
  const obj = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      if (obj.mode === 'subscription') await syncSubscription(obj.subscription);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(obj.id);           // re-fetch, then save
      break;

    case 'invoice.paid':
      await resetMonthlyUsage(obj.customer);    // new period starts
      break;

    case 'invoice.payment_failed':
      await notifyBillingAdmin(obj.customer, obj.hosted_invoice_url);
      break;

    case 'invoice.payment_action_required':
      await emailAuthLink(obj.customer, obj.hosted_invoice_url); // 3DS needed
      break;

    case 'customer.subscription.trial_will_end':
      await sendTrialEndingEmail(obj.customer);
      break;

    default:
      // Ignore events we don't use, but still return 200
      break;
  }
}`,
        },
        {
          title: 'syncSubscription: always save the latest state',
          lang: 'javascript',
          code: `async function syncSubscription(subscriptionId) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const tenantId = sub.metadata.tenantId;
  const item = sub.items.data[0];

  await Tenant.updateOne(
    { _id: tenantId },
    {
      stripeSubscriptionId: sub.id,
      billingStatus: sub.status,                  // active, past_due, canceled...
      planKey: item.price.lookup_key,             // e.g. 'pro_monthly'
      seats: item.quantity,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    }
  );
}`,
        },
      ],
      output: `When a tenant upgrades in the customer portal, Stripe sends \`customer.subscription.updated\`. The router calls \`syncSubscription\`, which re-fetches the subscription and writes \`planKey: 'business_monthly'\`, the new seat count and status to Mongo. On renewal, \`invoice.paid\` resets usage counters. On a failed card, the billing admin gets an email with the hosted invoice link to pay. Unknown events fall into \`default\` and still return 200.`,
      questions: [
        {
          q: 'Which events do you handle for subscriptions?',
          a: '`checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`, `invoice.payment_action_required`, and `customer.subscription.trial_will_end`.',
        },
        {
          q: 'invoice.paid vs payment_intent.succeeded — which for subscriptions?',
          a: 'Use `invoice.paid`. It is tied to the subscription period. PaymentIntent events also fire for one-time payments, so they are noisier for subscription logic.',
        },
        {
          q: 'Why re-fetch the subscription inside the handler?',
          a: 'Events can arrive out of order or be retried late. Re-fetching gives the current truth, so an old event cannot overwrite newer data.',
        },
      ],
      spoken: `"For subscriptions I handle a small set of events. checkout.session.completed links the new subscription to the tenant. customer.subscription.created, updated and deleted are where I sync plan, seats and status. invoice.paid marks a period as paid and resets usage counters. invoice.payment_failed and invoice.payment_action_required notify the billing admin with the hosted invoice link, the second one for 3D Secure. trial_will_end sends a reminder. In the handler I re-fetch the subscription and save its current state, so out-of-order or retried events can't put stale data in the database."`,
      mistakes: [
        'Only handling `checkout.session.completed`. Then cancellations, renewals and portal upgrades never reach your DB.',
        'Treating `invoice.payment_failed` as "cancel now". Stripe is still retrying; show a warning instead.',
        'Subscribing the endpoint to "all events" and doing work for each — slow and noisy.',
        'Follow-up trap: "What if you add a new event type later — how do you backfill?" Re-sync all subscriptions with a script using `subscriptions.list` (auto-pagination), not by replaying old events.',
      ],
      takeaway: 'Handle a few key events, and in each one re-fetch and save the current subscription state.',
    },
    {
      id: 'setup-intents-saved-cards',
      title: 'SetupIntents and Saving Cards for Later',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A SetupIntent saves and authenticates a payment method now so you can charge it later off-session.',
      what: `A **SetupIntent** is like a PaymentIntent with no money. It collects card details, runs 3D Secure if needed, and attaches the **PaymentMethod** to the Customer for future use.

Use it when:
- A trial starts and you want a card on file but charge nothing yet.
- The user updates their card in your billing page.
- You will charge later for usage ("off-session", meaning the user is not on your site).

#### Deeper version
- \`usage: 'off_session'\` (the default for SetupIntents) tells Stripe and the bank you plan to charge without the user present. Authenticating now reduces 3DS requests later, but the bank can still ask again.
- After saving, set it as the default: \`customers.update(cus, { invoice_settings: { default_payment_method: pm } })\` so subscriptions use it.
- To charge later: create a PaymentIntent with \`customer\`, \`payment_method\`, \`off_session: true\`, \`confirm: true\`. If the bank wants authentication, it fails with code \`authentication_required\`; bring the user back on-session to confirm.
- Checkout \`mode: 'setup'\` does the same without your own UI.`,
      why: `SaaS billing depends on charging cards when the user is asleep. Saving a card properly (with authentication) makes renewals and usage charges succeed more often.`,
      analogy: `It is like giving a hotel your card at check-in. They verify it and keep it on file, but only charge at checkout or for the minibar later.`,
      code: [
        {
          title: 'Create a SetupIntent and set the default card',
          lang: 'javascript',
          code: `// 1. Server: create the SetupIntent
app.post('/api/billing/setup-intent', requireAuth, async (req, res) => {
  const si = await stripe.setupIntents.create({
    customer: req.tenant.stripeCustomerId,
    automatic_payment_methods: { enabled: true },
    usage: 'off_session',
  });
  res.json({ clientSecret: si.client_secret });
});
// Frontend: stripe.confirmSetup({ elements, confirmParams: { return_url } })

// 2. Webhook 'setup_intent.succeeded': make it the default for invoices
async function onSetupSucceeded(si) {
  await stripe.customers.update(si.customer, {
    invoice_settings: { default_payment_method: si.payment_method },
  });
}`,
        },
        {
          title: 'Charge a saved card off-session',
          lang: 'javascript',
          code: `try {
  await stripe.paymentIntents.create({
    amount: 150000,
    currency: 'inr',
    customer: tenant.stripeCustomerId,
    payment_method: tenant.defaultPaymentMethodId,
    off_session: true,     // user is not present
    confirm: true,         // try to charge right now
  });
} catch (err) {
  if (err.code === 'authentication_required') {
    // Email the user a link to come back and confirm (3DS)
    await askUserToAuthenticate(tenant, err.raw.payment_intent.id);
  } else {
    throw err;
  }
}`,
        },
      ],
      output: `The first block returns a client secret; the user enters a card, passes 3DS once, and \`setup_intent.succeeded\` sets it as the default for future invoices. The second block charges ₹1,500 with no user present. Usually it succeeds. If the bank insists on authentication, Stripe throws \`authentication_required\` and you ask the user to return and confirm.`,
      questions: [
        {
          q: 'SetupIntent vs PaymentIntent?',
          a: 'A PaymentIntent collects money now. A SetupIntent only saves and authenticates a payment method for later, with no charge.',
        },
        {
          q: 'What does off_session mean?',
          a: 'The customer is not present when you charge (for example a renewal at night). The bank may still require authentication, so you need a recovery flow.',
        },
        {
          q: 'How do you make a saved card the one subscriptions use?',
          a: 'Set `invoice_settings.default_payment_method` on the Customer (or `default_payment_method` on the subscription).',
        },
      ],
      spoken: `"A SetupIntent saves a payment method for later without charging. I use it for trials that need a card, and for the 'update card' screen. It runs 3D Secure up front with usage off_session, which helps later charges go through. Then in the setup_intent.succeeded webhook I set it as the customer's default payment method for invoices. For off-session charges like usage top-ups, I create a PaymentIntent with off_session and confirm true, and if it fails with authentication_required I email the user to come back and authenticate."`,
      mistakes: [
        'Saving the card but not setting it as default, so the next invoice fails with "no payment method".',
        'Assuming a saved, authenticated card never needs 3DS again. Banks can still ask.',
        'Follow-up trap: "Can you charge a card saved through a PaymentIntent later?" Yes, if you used `setup_future_usage: \'off_session\'` when paying.',
      ],
      takeaway: 'SetupIntent = save and authenticate now, charge later off-session with a recovery path.',
    },
    {
      id: 'sca-3d-secure',
      title: 'SCA and 3D Secure',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Banks may ask the cardholder to prove it is really them (OTP/app approval); Stripe handles it if you use PaymentIntents, Elements or Checkout.',
      what: `**3D Secure (3DS)** is the extra step where the bank asks you to confirm a card payment — an OTP, or "approve in your bank app".

**SCA (Strong Customer Authentication)** is a European rule (PSD2) that requires this kind of check for many online payments. India's RBI has a similar rule called **AFA (Additional Factor of Authentication)** — that's why almost every Indian card payment asks for an OTP.

With Stripe you don't build 3DS yourself. When the bank requires it, the PaymentIntent goes to \`requires_action\`, and \`confirmPayment\` / Checkout shows the bank's challenge automatically.

#### Deeper version
- **Frictionless vs challenge:** in 3DS2 the bank may approve silently using device data (frictionless) or show a challenge.
- **Liability shift:** if a payment was authenticated with 3DS and later disputed as fraud, liability usually moves to the card issuer. Not every dispute reason is covered.
- **Recurring payments:** the first payment is authenticated on-session; later off-session charges can often be exempted (merchant-initiated). Banks may still require authentication — then Stripe sends \`invoice.payment_action_required\`.
- **India e-mandates:** RBI rules require a registered **e-mandate** for recurring card charges, with pre-debit notifications and AFA above a limit. The limits have changed over time, so check current RBI and gateway docs. This is why Indian card subscriptions fail more often if not set up as mandates.`,
      why: `If your flow can't handle 3DS, payments from Europe and India simply fail. Many "renewals failing" bugs are actually missing 3DS recovery flows.`,
      analogy: `It's like a bank calling you to say "Did you just try to buy a laptop? Press 1 to confirm." Stripe connects that call for you; your job is to not hang up on it.`,
      code: [
        {
          title: 'Handle renewals that need authentication',
          lang: 'javascript',
          code: `// Webhook: renewal needs 3DS (customer must act)
case 'invoice.payment_action_required': {
  const invoice = event.data.object;
  // hosted_invoice_url is a Stripe page where the customer can authenticate and pay
  await mailer.send({
    to: invoice.customer_email,
    subject: 'Action needed: confirm your payment',
    text: 'Your bank needs you to confirm this payment: ' + invoice.hosted_invoice_url,
  });
  break;
}`,
        },
        {
          title: 'Ask for 3DS explicitly (rarely needed)',
          lang: 'javascript',
          code: `// Normally Stripe decides. You can request 3DS when you suspect fraud.
const intent = await stripe.paymentIntents.create({
  amount: 500000,
  currency: 'eur',
  customer: customerId,
  payment_method_options: {
    card: { request_three_d_secure: 'any' },   // default is 'automatic'
  },
  automatic_payment_methods: { enabled: true },
});`,
        },
      ],
      output: `In the first block, when a European tenant's bank wants authentication on renewal, the admin receives an email with Stripe's hosted invoice link. They open it, approve in their bank app, and the invoice is paid; \`invoice.paid\` then fires and your sync keeps them active. In the second block, setting \`request_three_d_secure: 'any'\` makes Stripe try 3DS for this payment even when the bank would not require it.`,
      questions: [
        {
          q: 'What is SCA?',
          a: 'Strong Customer Authentication — a European (PSD2) rule that many online payments need two factors, usually done through 3D Secure.',
        },
        {
          q: 'How does Stripe handle 3D Secure?',
          a: 'The PaymentIntent goes to `requires_action`, and Stripe.js / Checkout shows the bank challenge automatically when you call `confirmPayment`.',
        },
        {
          q: 'What happens when a renewal needs 3DS?',
          a: 'The invoice payment needs customer action. Stripe sends `invoice.payment_action_required`; you email the hosted invoice link (or Stripe can send emails if enabled in settings).',
        },
        {
          q: 'What is liability shift?',
          a: 'For fraud disputes on payments that passed 3DS, the issuer usually bears the loss instead of the merchant.',
        },
      ],
      spoken: `"3D Secure is the bank's extra check, like an OTP or app approval. SCA in Europe and AFA in India make it required for many payments. With Stripe I don't build it myself: when it's needed, the PaymentIntent goes to requires_action and confirmPayment or Checkout shows the challenge. The tricky part is renewals, because the user isn't there. I handle invoice.payment_action_required by emailing the hosted invoice link so they can authenticate. In India, recurring card payments also need e-mandates, which is a big reason renewals fail if you don't set them up properly."`,
      mistakes: [
        'Using the old Charges API with tokens, which cannot handle 3DS properly. Use PaymentIntents.',
        'Not handling `requires_action` / `invoice.payment_action_required`, so renewals silently go past_due.',
        'Thinking 3DS stops all disputes. It mainly shifts liability for fraud; "product not received" disputes still happen.',
        'Follow-up trap: "Why do Indian card subscriptions fail more?" RBI e-mandate and AFA rules: recurring charges need a registered mandate, pre-debit notification, and OTP above a limit.',
      ],
      takeaway: 'Use PaymentIntents/Checkout so 3DS just works, and build a recovery path for off-session renewals.',
    },
    {
      id: 'razorpay-signature-verification',
      title: 'Razorpay Payment Flow and Signature Verification',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Verify HMAC-SHA256 of "order_id|payment_id" with your key secret on the server before marking an order paid; webhooks use a separate secret over the raw body.',
      what: `After a Razorpay payment, Checkout gives the browser three values: \`razorpay_order_id\`, \`razorpay_payment_id\` and \`razorpay_signature\`.

The **signature** proves these values came from Razorpay and were not changed. To check it, your server computes:

\`HMAC_SHA256(order_id + "|" + payment_id, key_secret)\` as a hex string

and compares it with \`razorpay_signature\`. If they match, the payment is genuine for **your** order.

#### Deeper version
- Use the **order id from your database**, not the one the client sends, so a user cannot swap in another order.
- Compare with \`crypto.timingSafeEqual\` (constant-time) to avoid timing attacks. Check lengths first, because it throws when lengths differ.
- **Webhooks** are verified differently: HMAC-SHA256 of the **raw request body** using the **webhook secret** (set in the Dashboard), compared with the \`X-Razorpay-Signature\` header.
- The SDK also ships helper functions for both checks (in \`razorpay/dist/utils/razorpay-utils\`). Check the docs for the current import path.
- For extra safety, fetch the payment (\`razorpay.payments.fetch(id)\`) and confirm \`status\` is \`captured\` and the amount matches.`,
      why: `Without verification, anyone could call your \`/verify\` endpoint with a made-up payment id and get the product for free. The signature ties the payment to your secret, which only you and Razorpay know.`,
      analogy: `It's like a cheque with a bank's special stamp. You check the stamp using a secret pattern only you and the bank know. If someone copies the cheque and changes the amount, the stamp doesn't match.`,
      code: [
        {
          title: 'Verify the checkout signature',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';

function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

app.post('/api/rzp/verify', requireAuth, async (req, res) => {
  const { razorpay_payment_id, razorpay_signature } = req.body;

  // Use OUR stored order id, not whatever the client sends
  const order = await Order.findOne({ tenantId: req.tenant._id, razorpayOrderId: req.body.razorpay_order_id });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(order.razorpayOrderId + '|' + razorpay_payment_id)
    .digest('hex');

  if (!safeEqual(expected, razorpay_signature)) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Idempotent update: only move from created -> paid once
  await Order.updateOne(
    { _id: order._id, status: { $ne: 'paid' } },
    { status: 'paid', razorpayPaymentId: razorpay_payment_id }
  );
  res.json({ ok: true });
});`,
        },
        {
          title: 'Verify a Razorpay webhook (raw body)',
          lang: 'javascript',
          code: `app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)  // NOT the key secret
    .update(req.body)                                          // raw Buffer
    .digest('hex');

  if (!safeEqual(expected, req.headers['x-razorpay-signature'] || '')) {
    return res.status(400).end();
  }

  const event = JSON.parse(req.body.toString('utf8'));
  await handleRazorpayEvent(event);   // e.g. payment.captured, order.paid
  res.status(200).end();
});`,
        },
      ],
      output: `For a real payment, the computed hex digest equals \`razorpay_signature\`, and the order becomes \`paid\` exactly once (the \`$ne: 'paid'\` filter makes a second call a no-op). If someone changes the payment id or sends a fake signature, the digests differ and they get 400. The webhook route does the same check over the raw body with the webhook secret, so \`order.paid\` arriving later is safe even if the browser verify call already ran.`,
      questions: [
        {
          q: 'How do you verify a Razorpay payment?',
          a: 'Compute HMAC-SHA256 of `order_id|payment_id` with your key secret, hex-encode it, and compare it to `razorpay_signature` using a constant-time compare.',
        },
        {
          q: 'How is webhook verification different?',
          a: 'It hashes the raw request body with the webhook secret (not the API key secret), and compares to the `X-Razorpay-Signature` header.',
        },
        {
          q: 'Why use the order id from your DB?',
          a: 'So the client cannot pay for a cheap order and then claim it was for an expensive one. The signature must match the order you created.',
        },
        {
          q: 'Is the client-side handler enough?',
          a: 'No. Verify on the server, and also handle webhooks because the browser may close before the handler runs.',
        },
      ],
      spoken: `"After Razorpay Checkout succeeds, the browser gets order id, payment id and a signature. On my server I take the order id from my own database, compute an HMAC SHA-256 of order_id pipe payment_id with the key secret, and compare it to the signature using timingSafeEqual. Only then do I mark the order paid, using an idempotent update so double calls are safe. I also listen to webhooks like payment.captured and order.paid, which I verify by hashing the raw body with the separate webhook secret. That covers users who close the tab before the handler runs."`,
      mistakes: [
        'Using the webhook secret for checkout verification, or the key secret for webhooks. They are different.',
        'Parsing the webhook body with `express.json()` before hashing — the bytes change and verification fails.',
        'Comparing with `===` instead of a constant-time compare (minor, but interviewers like it).',
        'Writing the string as `payment_id|order_id`. The order is `order_id|payment_id`.',
        'Follow-up trap: "What about subscriptions?" The checkout signature for a Razorpay subscription uses the payment id and the subscription id instead of the order id — check the docs for the exact order of fields.',
      ],
      takeaway: 'HMAC of order_id|payment_id with key secret for checkout; HMAC of raw body with webhook secret for webhooks.',
    },
    {
      id: 'stripe-trials',
      title: 'Free Trials',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Start a subscription in trialing status with trial_period_days; decide what happens at trial end if no card is on file.',
      what: `A **trial** lets a tenant use a paid plan free for some days. The subscription status is \`trialing\`. When the trial ends, Stripe creates the first real invoice and tries to charge.

Two common styles:
- **Card required** — collect a card at signup; charge automatically when the trial ends. Higher quality leads.
- **No card required** — easier signup; ask for a card before the trial ends.

Key settings:
- \`trial_period_days: 14\` or \`trial_end: <unix timestamp>\`.
- \`trial_settings.end_behavior.missing_payment_method\`: \`'cancel'\`, \`'pause'\` or \`'create_invoice'\` — what to do if no card exists at trial end.
- In Checkout, \`payment_method_collection: 'if_required'\` lets users start a trial without entering a card.

#### Deeper version
- \`customer.subscription.trial_will_end\` fires about 3 days before the end. Use it for reminder emails.
- A trial on a subscription creates a ₹0/$0 invoice at the start.
- You can end a trial early with \`trial_end: 'now'\` (for example when the user clicks "Upgrade now").
- Prevent **trial abuse**: allow one trial per tenant (store \`hasUsedTrial\` in your DB), and maybe per email domain.`,
      why: `Trials drive SaaS signups. Handling the trial end badly loses money (users keep using it free) or angers users (surprise charges with no reminder).`,
      analogy: `It's like a gym's free 2-week pass. Either they take your card at the desk and start billing on day 15, or they let you in free and ask for the card on day 12.`,
      code: [
        {
          title: 'Trial without a card via Checkout',
          lang: 'javascript',
          code: `const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: tenant.stripeCustomerId,
  line_items: [{ price: proPriceId, quantity: 1 }],
  payment_method_collection: 'if_required',     // no card needed for the trial
  subscription_data: {
    trial_period_days: 14,
    trial_settings: {
      end_behavior: { missing_payment_method: 'pause' },  // or 'cancel' / 'create_invoice'
    },
    metadata: { tenantId: String(tenant._id) },
  },
  success_url: process.env.APP_URL + '/welcome',
  cancel_url: process.env.APP_URL + '/pricing',
});`,
        },
        {
          title: 'Guard against repeat trials, and end a trial early',
          lang: 'javascript',
          code: `if (tenant.hasUsedTrial) {
  delete subscriptionData.trial_period_days;    // pay from day one
}

// User clicks "Start paid plan now"
await stripe.subscriptions.update(tenant.stripeSubscriptionId, { trial_end: 'now' });`,
        },
      ],
      output: `The tenant starts a 14-day trial without a card; the subscription status is \`trialing\`. Around day 11, \`trial_will_end\` fires and you email "Add a card to keep Pro". If they add a card, the first invoice is charged on day 15 and status becomes \`active\`. If not, the subscription is paused (status \`paused\`), and your sync moves the tenant to limited access. Calling \`trial_end: 'now'\` ends the trial immediately and bills right away.`,
      questions: [
        {
          q: 'How do you create a trial in Stripe?',
          a: 'Set `trial_period_days` or `trial_end` on the subscription (or in `subscription_data` for Checkout). The status is `trialing` until it ends.',
        },
        {
          q: 'What happens at trial end without a card?',
          a: 'It depends on `trial_settings.end_behavior.missing_payment_method`: cancel, pause, or create an invoice that will go unpaid.',
        },
        {
          q: 'How do you remind users before the trial ends?',
          a: 'Handle `customer.subscription.trial_will_end`, which fires about 3 days before the end.',
        },
      ],
      spoken: `"For trials I start the subscription with trial_period_days, usually through Checkout. If we don't require a card, I set payment_method_collection to if_required and choose a trial end behavior — pause or cancel if there's no payment method. I listen to trial_will_end to send a reminder three days before. When the user upgrades early I set trial_end to now. I also keep a hasUsedTrial flag on the tenant so they can't get endless trials by cancelling and restarting."`,
      mistakes: [
        'Giving unlimited trials — users cancel and restart. Track trial usage per tenant.',
        'No reminder before charging; leads to angry users and disputes.',
        'Granting access based on "subscription exists" instead of status, so paused/canceled trials keep working.',
        'Follow-up trap: "Does a trial need a PaymentIntent?" No money is collected at start; a SetupIntent (or Checkout) can save a card so the first real invoice can be charged.',
      ],
      takeaway: 'Trials are just a trialing subscription; plan the trial end, remind users, and block repeat trials.',
    },
    {
      id: 'coupons-promotion-codes',
      title: 'Coupons and Promotion Codes',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A Coupon defines the discount; a Promotion Code is the customer-facing code that points to a coupon, with its own limits.',
      what: `- A **Coupon** is the discount rule: "20% off" or "₹500 off", and for how long (\`once\`, \`repeating\` for N months, or \`forever\`).
- A **Promotion Code** is the text a customer types, like \`LAUNCH20\`. It points to a coupon and adds limits: max redemptions, expiry date, first-time customers only, minimum amount, or a specific customer.

You can apply discounts:
- In **Checkout**: \`allow_promotion_codes: true\` (customer types a code), or \`discounts: [{ coupon }]\` / \`discounts: [{ promotion_code }]\` to pre-apply.
- On a **Subscription**: \`discounts: [{ coupon: 'id' }]\` or \`[{ promotion_code: 'promo_...' }]\`.

#### Deeper version
- One coupon, many codes: create a coupon "PARTNER_30" and many promotion codes for each partner, so you can track who brought which customer.
- Coupons can be restricted to certain Products with \`applies_to\`.
- Older API versions had a single \`coupon\` parameter on subscriptions; newer ones use the \`discounts\` array. Also the shape of \`promotionCodes.create\` has changed in recent API versions. Check the docs for your pinned version.
- Amount-off coupons need a currency. Percent-off coupons do not.`,
      why: `Marketing needs launch offers, partner deals and win-back discounts. Splitting "rule" (coupon) from "code" (promotion code) means you can track and limit codes without duplicating rules.`,
      analogy: `The coupon is the store's policy: "20% off for 3 months". The promotion code is the printed voucher with a code on it. You can print many vouchers for one policy, each with its own expiry.`,
      code: [
        {
          title: 'Create a coupon and a promotion code',
          lang: 'javascript',
          code: `// The rule: 20% off for the first 3 months
const coupon = await stripe.coupons.create({
  percent_off: 20,
  duration: 'repeating',
  duration_in_months: 3,
  name: 'Launch 20%',
});

// The code customers type. (Param shape differs in some newer API versions — check docs.)
const promo = await stripe.promotionCodes.create({
  coupon: coupon.id,
  code: 'LAUNCH20',
  max_redemptions: 500,
  expires_at: Math.floor(new Date('2026-12-31').getTime() / 1000),
  restrictions: { first_time_transaction: true },
});
console.log(promo.id); // promo_...`,
        },
        {
          title: 'Apply a discount to an existing subscription',
          lang: 'javascript',
          code: `// Win-back offer from your retention flow
await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
  discounts: [{ coupon: 'WINBACK_50' }],
});

// Read the discount back when showing the billing page
const sub = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId, {
  expand: ['discounts'],
});
console.log(sub.discounts.map((d) => d.coupon.name));`,
        },
      ],
      output: `The coupon gives 20% off for 3 billing months. The promotion code \`LAUNCH20\` can be used up to 500 times, only by first-time customers, until the end of 2026. With \`allow_promotion_codes: true\` in Checkout, the customer types \`LAUNCH20\` and sees the discount. The second block adds a 50% win-back coupon to a subscription; the next invoice shows the discount line.`,
      questions: [
        {
          q: 'What is the difference between a coupon and a promotion code?',
          a: 'A coupon is the discount rule (amount/percent and duration). A promotion code is a customer-facing code that points to a coupon and adds limits like expiry and max uses.',
        },
        {
          q: 'What do once, repeating and forever mean?',
          a: '`once` applies to one invoice, `repeating` to N months (`duration_in_months`), and `forever` to every invoice.',
        },
        {
          q: 'How do you let users enter a code in Checkout?',
          a: 'Set `allow_promotion_codes: true` on the Checkout Session.',
        },
      ],
      spoken: `"In Stripe a coupon is the discount rule — like 20 percent off, repeating for three months — and a promotion code is the code customers type, which points to a coupon and adds limits like expiry, max redemptions or first-time customers only. In our SaaS we used one coupon with several promotion codes for partners so we could track attribution. In Checkout I just set allow_promotion_codes to true. For retention offers, I apply a coupon directly to the subscription through the discounts array. I always check the docs for the API version, because the discount parameters changed over time."`,
      mistakes: [
        'Creating a new coupon for every code — you lose the shared rule and reporting.',
        'Validating promo codes only in your frontend. Let Stripe (or your server) validate.',
        'Using `forever` for a launch deal, then being stuck with it — you must remove the discount manually later.',
        'Follow-up trap: "Does deleting a coupon remove it from existing subscriptions?" No. Existing discounts stay; deleting only stops new redemptions.',
      ],
      takeaway: 'Coupon = rule, promotion code = customer-facing key to that rule with its own limits.',
    },
    {
      id: 'stripe-invoices',
      title: 'Invoices',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Subscriptions create invoices each period; invoices go draft → open → paid (or void/uncollectible) and collect via PaymentIntents.',
      what: `An **Invoice** is the bill. Every subscription period creates one. You can also create one-off invoices (for example a setup fee).

Invoice statuses:
- \`draft\` — still editable. Subscription renewal invoices stay draft for about an hour so you can add items.
- \`open\` — finalized and waiting for payment.
- \`paid\` — done.
- \`void\` — cancelled (it was a mistake).
- \`uncollectible\` — you gave up collecting.

Useful fields: \`hosted_invoice_url\` (a Stripe page to view and pay), \`invoice_pdf\`, \`amount_due\`, \`lines\` (each charge line).

#### Deeper version
- \`collection_method: 'charge_automatically'\` (default) charges the saved card. \`'send_invoice'\` emails the invoice with \`days_until_due\` — good for enterprise customers who pay by bank transfer.
- **Invoice items** (\`invoiceItems.create\`) added before the draft is finalized appear on the next invoice. Good for one-time add-on charges.
- To preview the next invoice (for proration previews), newer API versions use \`invoices.createPreview\`; older versions used \`invoices.retrieveUpcoming\`. Check your version.
- Tax IDs, address and invoice numbering can be set on the Customer and in Dashboard settings.`,
      why: `B2B customers need proper invoices for accounting (GST/VAT). Your app's "Billing history" page is usually a list of Stripe invoices, and invoice events drive renewals and failures.`,
      analogy: `An invoice is like the electricity bill: drafted at month end, then sent (open), then marked paid. If it was wrong, it's cancelled (void); if the customer vanished, it's written off (uncollectible).`,
      code: [
        {
          title: 'Billing history API for your React page',
          lang: 'javascript',
          code: `app.get('/api/billing/invoices', requireAuth, async (req, res) => {
  const invoices = await stripe.invoices.list({
    customer: req.tenant.stripeCustomerId,
    limit: 12,
  });
  res.json(invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    total: inv.total / 100,                 // paise -> rupees for display
    currency: inv.currency,
    date: new Date(inv.created * 1000),
    pdf: inv.invoice_pdf,
    payUrl: inv.status === 'open' ? inv.hosted_invoice_url : null,
  })));
});`,
        },
        {
          title: 'One-off charge on the next invoice (e.g. onboarding fee)',
          lang: 'javascript',
          code: `await stripe.invoiceItems.create({
  customer: tenant.stripeCustomerId,
  amount: 500000,             // ₹5,000
  currency: 'inr',
  description: 'Onboarding & data migration',
});
// It will be added to the next subscription invoice automatically.`,
        },
      ],
      output: `The first route returns the last 12 invoices with number, status, total in rupees, date and PDF link. Open invoices include a pay link so the admin can pay a failed renewal. The second block adds a ₹5,000 line that appears on the next renewal invoice next to the plan charge.`,
      questions: [
        {
          q: 'What are the invoice statuses?',
          a: '`draft`, `open`, `paid`, `void` and `uncollectible`.',
        },
        {
          q: 'charge_automatically vs send_invoice?',
          a: '`charge_automatically` charges the saved payment method. `send_invoice` emails the invoice and the customer pays by a due date — common for enterprise.',
        },
        {
          q: 'How do you add a one-time charge to a subscription bill?',
          a: 'Create an invoice item for the customer (or use `add_invoice_items` on the subscription). It is pulled into the next invoice.',
        },
      ],
      spoken: `"Invoices are the bills Stripe creates every subscription period. They move from draft to open to paid, or to void or uncollectible. For our billing history page I just list the customer's invoices and show the number, total, PDF link and the hosted invoice URL for open ones, so admins can pay a failed renewal themselves. For enterprise tenants I use send_invoice with days until due instead of auto-charge. For one-off fees I create invoice items so they land on the next bill. invoice.paid and invoice.payment_failed drive my access logic."`,
      mistakes: [
        'Storing your own copies of invoice PDFs — just link to Stripe\'s `invoice_pdf` / `hosted_invoice_url`.',
        'Deleting or editing a finalized invoice. You void it (or issue a credit note) instead.',
        'Showing `amount` values without dividing by 100 (or using the currency\'s decimals).',
        'Follow-up trap: "How do you fix an overcharge on a paid invoice?" Issue a credit note (with a refund or customer credit balance), not an edit.',
      ],
      takeaway: 'Invoices are the bills of subscriptions: draft → open → paid, linkable to customers via hosted URLs.',
    },
    {
      id: 'renewals-failed-payments',
      title: 'Renewals, Failed Payments and Dunning',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Renewals are automatic invoices; failed renewals go past_due, Smart Retries try again, and your app shows a grace period and recovery flow.',
      what: `**Renewal** = at the end of each period, Stripe creates a new invoice and charges the default payment method. You don't write a cron job for this.

If the charge fails (expired card, no balance):
1. The invoice stays \`open\` and the subscription becomes \`past_due\`.
2. Stripe **retries** automatically (Smart Retries pick good times) over a period you configure.
3. Stripe can email the customer (if enabled in settings).
4. When retries run out, the subscription is \`canceled\`, marked \`unpaid\`, or left \`past_due\` — your choice in Billing settings.

This whole recovery process is called **dunning**.

#### Deeper version
Your app's job:
- On \`invoice.payment_failed\`: show a banner "Payment failed — update your card", email the billing admin with \`hosted_invoice_url\`.
- Keep access during a **grace period** (for example 7 days), then restrict to read-only.
- On \`invoice.paid\`: clear the banner and restore full access.
- When the user updates their card, you can pay the open invoice right away with \`stripe.invoices.pay(invoiceId)\` instead of waiting for the next retry.
- Card networks can auto-update expired card numbers (card account updater) for many cards, which reduces failures.`,
      why: `Involuntary churn (people who wanted to stay but their card failed) is a big part of SaaS revenue loss. A good dunning flow recovers a lot of it.`,
      analogy: `It's like a phone company when your auto-debit bounces: they try again in a few days, send SMS reminders, keep your line working for a bit, and only disconnect after the final notice.`,
      code: [
        {
          title: 'Grace period logic from synced data',
          lang: 'javascript',
          code: `// Saved by webhooks: billingStatus, pastDueSince
function accessLevel(tenant, now = Date.now()) {
  if (['active', 'trialing'].includes(tenant.billingStatus)) return 'full';
  if (tenant.billingStatus === 'past_due') {
    const days = (now - tenant.pastDueSince) / 86400000;
    return days <= 7 ? 'full-with-warning' : 'read-only';
  }
  return 'free';
}

console.log(accessLevel({ billingStatus: 'past_due', pastDueSince: Date.now() - 3 * 86400000 }));
// 'full-with-warning'`,
        },
        {
          title: 'Pay the open invoice right after the card is updated',
          lang: 'javascript',
          code: `async function retryOpenInvoices(customerId) {
  const open = await stripe.invoices.list({ customer: customerId, status: 'open' });
  for (const inv of open.data) {
    try {
      await stripe.invoices.pay(inv.id);    // uses the new default payment method
    } catch (err) {
      console.warn('Still failing', inv.id, err.code);
    }
  }
}`,
        },
      ],
      output: `A tenant whose renewal failed 3 days ago gets \`'full-with-warning'\`: the app works but shows a red banner. After 7 days they become read-only. When they add a new card, \`retryOpenInvoices\` pays the open invoice immediately; Stripe sends \`invoice.paid\` and \`customer.subscription.updated\` (status \`active\`), and the banner disappears.`,
      questions: [
        {
          q: 'Do you need a cron job for renewals with Stripe?',
          a: 'No. Stripe creates and charges renewal invoices automatically. You react to webhooks.',
        },
        {
          q: 'What happens when a renewal payment fails?',
          a: 'The invoice stays open, the subscription goes `past_due`, Stripe retries on a schedule, and after the final retry it cancels, marks unpaid, or leaves it past_due depending on settings.',
        },
        {
          q: 'What is dunning?',
          a: 'The process of recovering failed payments: retries, reminder emails, in-app banners, and finally restricting or cancelling.',
        },
        {
          q: 'What do you do when the customer updates their card?',
          a: 'Set it as default and try to pay open invoices now with `invoices.pay`, so access is restored immediately.',
        },
      ],
      spoken: `"Renewals in Stripe are automatic: each period a new invoice is created and charged, so I don't run cron jobs for billing. When a renewal fails, the subscription goes past_due and Smart Retries try again over a configured window. In my app, invoice.payment_failed shows a banner and emails the billing admin the hosted invoice link. I give a seven-day grace period, then read-only. When they update the card, I set it as default and call invoices.pay on open invoices so access comes back immediately. invoice.paid clears everything."`,
      mistakes: [
        'Cancelling on the first failure. Most failures recover with retries and a card update.',
        'Writing your own renewal cron that creates charges — duplicates Stripe\'s work and causes double billing.',
        'Not storing when `past_due` started, so you can\'t compute a grace period.',
        'Follow-up trap: "What if the webhook for invoice.paid is missed?" Stripe retries it; plus a nightly reconciliation job that re-syncs subscriptions catches anything missed.',
      ],
      takeaway: 'Stripe renews and retries; your app owns the grace period, banners and fast recovery.',
    },
    {
      id: 'stripe-refunds',
      title: 'Refunds and Credit Notes',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Refund a PaymentIntent fully or partially; for subscription invoices, prefer credit notes so the invoice stays correct.',
      what: `A **refund** sends money back to the customer's payment method.

\`stripe.refunds.create({ payment_intent: 'pi_...' })\` refunds the full amount. Add \`amount\` for a partial refund.

Things to know:
- Refunds are not instant for the customer — card refunds often take about 5–10 business days to appear.
- Stripe's processing fee is usually **not** returned to you on refunds (check your pricing).
- Refunds can fail (for example the card account is closed). Listen for refund status updates.

#### Deeper version
For **subscription invoices**, a **credit note** is cleaner. A credit note reduces the amount of a finalized invoice and records why. You can pair it with a refund (money back) or add it to the customer's **credit balance** (used on future invoices). This keeps your invoices accurate for accounting and tax.

Events: \`charge.refunded\` and refund-related events (for example \`refund.updated\` / \`charge.refund.updated\` depending on API version) tell you about status changes. Use an **idempotency key** when refunding so a double-click cannot refund twice.`,
      why: `Refunds are part of every billing support process: accidental upgrades, double payments, goodwill gestures. Doing them right prevents disputes (which are much more expensive).`,
      analogy: `A refund is giving cash back at the counter. A credit note is the official paper that says "this bill was ₹500 too high", which the accountant needs even if you also return the cash.`,
      code: [
        {
          title: 'Admin refund endpoint (partial, idempotent)',
          lang: 'javascript',
          code: `app.post('/api/admin/refunds', requireSupportRole, async (req, res) => {
  const { paymentIntentId, amountPaise, ticketId } = req.body;

  const refund = await stripe.refunds.create(
    {
      payment_intent: paymentIntentId,
      amount: amountPaise,                  // omit for full refund
      reason: 'requested_by_customer',
      metadata: { ticketId },
    },
    { idempotencyKey: 'refund-' + ticketId } // double-click safe
  );

  res.json({ id: refund.id, status: refund.status }); // 'succeeded' or 'pending'
});`,
        },
        {
          title: 'Credit note on a subscription invoice',
          lang: 'javascript',
          code: `// Customer was overcharged ₹500 on a paid invoice: refund it and record why
await stripe.creditNotes.create({
  invoice: 'in_123',
  lines: [{ type: 'custom_line_item', description: 'Seat billing correction', quantity: 1, unit_amount: 50000 }],
  refund_amount: 50000,   // send money back (or use credit_amount for account credit)
  reason: 'order_change',
});
// Exact field names: check the Credit Notes API docs for your API version.`,
        },
      ],
      output: `The first endpoint refunds part of a payment and returns status \`succeeded\` or \`pending\`. If support clicks twice, the same idempotency key returns the same refund instead of creating a second one. The second block creates a credit note on the invoice, refunds ₹500, and the invoice PDF now shows the adjustment.`,
      questions: [
        {
          q: 'How do you do a partial refund in Stripe?',
          a: 'Call `refunds.create` with the `payment_intent` and an `amount` smaller than the original.',
        },
        {
          q: 'Refund vs credit note?',
          a: 'A refund moves money back. A credit note adjusts a finalized invoice for accounting; it can come with a refund or add credit to the customer balance.',
        },
        {
          q: 'Does cancelling a subscription refund money automatically?',
          a: 'No. Cancelling only stops future billing. Refunds or prorated credits must be issued explicitly.',
        },
      ],
      spoken: `"For refunds I call refunds.create with the payment intent, plus an amount for partial refunds, a reason and our support ticket in metadata. I always pass an idempotency key so a double-click can't refund twice. For subscription invoices I prefer credit notes, because they keep the invoice correct for accounting — the credit note can refund money or add credit to the customer's balance for future invoices. I also tell support that card refunds take several business days, and that Stripe usually keeps its fee."`,
      mistakes: [
        'Refunding without an idempotency key — double refunds happen.',
        'Expecting cancellation to refund automatically.',
        'Refunding a disputed charge — you cannot; the dispute already pulled the money. Respond to the dispute instead.',
        'Follow-up trap: "Can a refund fail?" Yes, for example if the card is closed. Watch refund status events and contact the customer.',
      ],
      takeaway: 'Refund payments with an idempotency key; use credit notes for subscription invoices.',
    },
    {
      id: 'customer-portal',
      title: 'Stripe Customer Portal',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A Stripe-hosted page where customers update cards, see invoices, switch plans and cancel — you just create a portal session.',
      what: `The **Customer Portal** is a ready-made page hosted by Stripe. Customers can:
- update their payment method,
- see and download invoices,
- switch plans or change quantity (if you allow it),
- cancel their subscription (if you allow it).

You configure what is allowed in the Dashboard (or via the API with a configuration object). In code, you only create a **portal session** and redirect to its URL.

#### Deeper version
- Every change made in the portal comes back to you as webhooks (\`customer.subscription.updated\`, \`deleted\`, \`payment_method.attached\`...). This is why your sync must be webhook-driven.
- You can create multiple **portal configurations** (for example one that allows downgrades and one that doesn't) and pass \`configuration\` when creating the session.
- **Flows** (\`flow_data\`) can deep-link into one action like "update payment method" or "cancel with retention offer". Check the docs for supported flow types.
- Only billing admins of a tenant should be able to open the portal — check roles on your side.`,
      why: `It saves weeks of UI work and handles card updates with 3DS correctly. For a small team it's the fastest way to give self-service billing.`,
      analogy: `It's like the "My Account" page of your mobile operator: you don't build it, you just give the customer a secure link to it.`,
      code: [
        {
          title: 'Create a portal session (billing admins only)',
          lang: 'javascript',
          code: `app.post('/api/billing/portal', requireAuth, requireRole('billing_admin'), async (req, res) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: req.tenant.stripeCustomerId,
    return_url: process.env.APP_URL + '/settings/billing',
  });
  res.json({ url: session.url });   // frontend redirects to it
});`,
        },
        {
          title: 'Deep link straight to "update payment method"',
          lang: 'javascript',
          code: `const session = await stripe.billingPortal.sessions.create({
  customer: tenant.stripeCustomerId,
  return_url: process.env.APP_URL + '/settings/billing',
  flow_data: { type: 'payment_method_update' },
});
// Used in the "Payment failed — update card" banner`,
        },
      ],
      output: `The admin clicks "Manage billing", gets redirected to \`billing.stripe.com/p/session/...\`, changes plan from Pro to Business, and returns to your app. Meanwhile Stripe sends \`customer.subscription.updated\`; your webhook syncs the new plan to Mongo, so the app shows Business features. The deep link version opens directly on the card update screen.`,
      questions: [
        {
          q: 'What is the Stripe Customer Portal?',
          a: 'A Stripe-hosted self-service billing page for payment methods, invoices, plan changes and cancellations.',
        },
        {
          q: 'How does your app know a user changed plan in the portal?',
          a: 'Through webhooks like `customer.subscription.updated`. The portal does not call your API directly.',
        },
        {
          q: 'How do you control what customers can do in the portal?',
          a: 'With portal configuration in the Dashboard or API: which products/prices they can switch to, whether cancel is allowed, proration behavior, and so on.',
        },
      ],
      spoken: `"The Customer Portal is Stripe's hosted billing page. Customers can update cards, download invoices, change plans and cancel, based on what I enable in the portal configuration. My backend only creates a billing portal session for the tenant's customer id, checks that the user is a billing admin, and returns the URL. Everything they change comes back as webhooks, which is another reason my plan and status sync is fully webhook-driven. I also use flow_data to deep-link to the update-card screen from the payment-failed banner."`,
      mistakes: [
        'Letting any user in the tenant open the portal. Restrict it to billing admins.',
        'Expecting a redirect back to mean the change is saved in your DB. Wait for the webhook.',
        'Allowing plan switches in the portal to prices your app does not know how to map to entitlements.',
        'Follow-up trap: "Can you add custom upgrade rules (like seat minimums) to the portal?" Only what portal settings support; for custom rules build your own upgrade screen with the Subscriptions API.',
      ],
      takeaway: 'The portal gives free self-service billing; your webhooks keep your app in sync with it.',
    },
    {
      id: 'stripe-idempotency-keys',
      title: 'Idempotency Keys for API Requests',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Send an Idempotency-Key with POST requests so a retry after a timeout never creates a second charge or subscription.',
      what: `**Idempotent** means "doing it twice has the same effect as doing it once".

Network calls can time out: you don't know if Stripe created the charge or not. If you simply retry, you might charge twice. An **idempotency key** fixes this: you send a unique key with the request. If Stripe has already seen that key, it returns the **saved result** of the first request instead of doing the work again.

In Node: pass \`{ idempotencyKey: '...' }\` as the second argument to any create/update call.

#### Deeper version
- Keys are kept for at least 24 hours by Stripe.
- Reusing a key with **different parameters** returns an error — that protects you from bugs.
- Choose keys from your business data: \`'upgrade-' + tenantId + '-' + requestId\`, or the id of your own DB record (\`order._id\`). A random UUID per click is not enough if the user clicks twice — two clicks would make two keys.
- The Stripe Node SDK adds its own idempotency keys automatically when it retries network errors (\`maxNetworkRetries\`), but that only covers the SDK's internal retries, not your app-level retries.
- This is a different problem from **webhook** idempotency (receiving the same event twice), which you solve on your side.`,
      why: `Double charges are the worst bug in payments: angry customers, refunds and disputes. Idempotency keys make retries safe.`,
      analogy: `It's like a token number at a bank counter. If you come back with the same token, the clerk says "this is already done, here is your receipt" instead of processing your deposit again.`,
      code: [
        {
          title: 'Safe upgrade call with a business-based key',
          lang: 'javascript',
          code: `app.post('/api/billing/upgrade', requireAuth, async (req, res) => {
  // The client generates one requestId per "Upgrade" dialog, reused on retries
  const key = 'upgrade-' + req.tenant._id + '-' + req.body.requestId;

  const sub = await stripe.subscriptions.update(
    req.tenant.stripeSubscriptionId,
    {
      items: [{ id: req.tenant.stripeItemId, price: req.body.newPriceId }],
      proration_behavior: 'always_invoice',
    },
    { idempotencyKey: key }
  );
  res.json({ status: sub.status });
});`,
        },
        {
          title: 'One-time charge keyed by your order id',
          lang: 'javascript',
          code: `const order = await Order.create({ tenantId, amount: 49900, status: 'pending' });

const intent = await stripe.paymentIntents.create(
  { amount: order.amount, currency: 'inr', customer: customerId, metadata: { orderId: String(order._id) } },
  { idempotencyKey: 'order-' + order._id }   // same order -> same PaymentIntent
);`,
        },
      ],
      output: `If the upgrade request times out and the frontend retries with the same \`requestId\`, Stripe sees the same key and returns the original result. The subscription is updated only once and only one proration invoice is created. In the second block, retrying for the same order always returns the same PaymentIntent.`,
      questions: [
        {
          q: 'What is an idempotency key?',
          a: 'A unique key sent with a write request. If the same key is sent again, Stripe returns the first result instead of repeating the action.',
        },
        {
          q: 'What should you use as the key?',
          a: 'Something tied to the business action, like your order id or an operation id reused on retries. Not a new random value per attempt.',
        },
        {
          q: 'Is this the same as webhook idempotency?',
          a: 'No. API idempotency protects requests you send to Stripe. Webhook idempotency protects your handlers from processing the same incoming event twice.',
        },
      ],
      spoken: `"Idempotency keys make Stripe write calls safe to retry. If my request times out, I don't know if the charge happened, so I retry with the same key and Stripe returns the original result instead of charging again. I build keys from business data — like 'order-' plus our order id, or an operation id the frontend reuses on retries — not a fresh UUID per attempt, because that defeats the point. Sending the same key with different parameters errors out, which catches bugs. Webhook duplicates are a separate problem I solve by storing event ids."`,
      mistakes: [
        'Generating a new UUID on every retry — then the key never matches.',
        'Only using keys for charges. Subscription creates/updates and refunds also need them.',
        'Follow-up trap: "What happens if you reuse a key with a different amount?" Stripe returns an error saying the parameters don\'t match the original request.',
      ],
      takeaway: 'Tie idempotency keys to the business action so retries can never double-charge.',
    },
    {
      id: 'razorpay-upi',
      title: 'UPI Payments (Intent, Collect, Async Status)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'UPI payments finish in the user\'s UPI app, so the result is async: wait for webhooks or poll, never assume instant success.',
      what: `**UPI** (Unified Payments Interface) is India's real-time bank payment system. The user approves the payment in a UPI app (GPay, PhonePe, Paytm, BHIM) with their UPI PIN.

Main flows:
- **Intent flow** — on mobile, your page or app opens the UPI app directly. The user approves and comes back.
- **QR flow** — the user scans a QR code shown on desktop.
- **Collect flow** — the user enters their UPI ID (VPA, like \`name@bank\`), and a request appears in their UPI app. NPCI (the body that runs UPI) has been restricting collect requests, so check Razorpay's current docs for what is still supported.

The important part: **the result is asynchronous**. The user may approve after 2 minutes, or never. The payment may sit in a pending state.

#### Deeper version
- Razorpay Checkout handles UPI for you when you create an Order. The \`handler\` runs if the user completes it while the popup is open, but you must also rely on **webhooks** (\`payment.captured\`, \`order.paid\`, \`payment.failed\`).
- Show a "Waiting for payment approval..." screen and **poll your own API** (which reads your DB, updated by webhooks), with a timeout.
- Sometimes UPI says "debited" at the bank but the gateway still shows pending. Razorpay resolves these later (captured, or auto-refunded). This is why reconciliation jobs exist.
- **UPI AutoPay** supports recurring mandates (subscriptions) with per-transaction limits; check current limits in the docs.`,
      why: `UPI is the most used payment method in India. If you treat it like an instant card payment, you'll show "failed" for payments that actually succeed a minute later — and get support tickets.`,
      analogy: `A card payment is like paying at the counter and getting a receipt instantly. UPI collect is like sending someone a payment request on WhatsApp — you wait until they open the app and approve it.`,
      code: [
        {
          title: 'Frontend: wait for async status by polling your API',
          lang: 'javascript',
          code: `async function waitForPayment(orderId, { timeoutMs = 5 * 60 * 1000, everyMs = 3000 } = {}) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const { status } = await fetch('/api/orders/' + orderId).then((r) => r.json());
    if (status === 'paid') return 'paid';
    if (status === 'failed') return 'failed';
    await new Promise((r) => setTimeout(r, everyMs));   // wait 3s
  }
  return 'pending';   // tell user: "We'll email you when it's confirmed"
}`,
        },
        {
          title: 'Server: webhook updates the order status',
          lang: 'javascript',
          code: `async function handleRazorpayEvent(event) {
  if (event.event === 'order.paid' || event.event === 'payment.captured') {
    const p = event.payload.payment.entity;
    await Order.updateOne(
      { razorpayOrderId: p.order_id, status: { $ne: 'paid' } },
      { status: 'paid', razorpayPaymentId: p.id, method: p.method } // method: 'upi'
    );
  }
  if (event.event === 'payment.failed') {
    const p = event.payload.payment.entity;
    // Don't mark the ORDER failed forever: the user may retry on the same order
    await Order.updateOne(
      { razorpayOrderId: p.order_id, status: { $ne: 'paid' } },
      { lastError: p.error_description }
    );
  }
}`,
        },
      ],
      output: `The user picks UPI, the popup shows a QR or opens their UPI app, and your page shows "Waiting for approval". When they approve, Razorpay sends \`payment.captured\` / \`order.paid\`; the webhook marks the order paid; the next poll returns \`paid\` and the UI shows success. If they never approve, the poll ends with \`pending\` and you promise an email once it's confirmed. A failed attempt only records the error, so the user can retry on the same order.`,
      questions: [
        {
          q: 'Why is UPI payment status asynchronous?',
          a: 'The user approves in a separate app, possibly minutes later, and bank/NPCI confirmations can be delayed. So the gateway may report success after your page has given up.',
        },
        {
          q: 'Intent vs collect flow?',
          a: 'Intent opens the UPI app directly on the phone. Collect sends a request to the user\'s UPI ID that they approve in their app. Collect is being restricted by NPCI, so check current support.',
        },
        {
          q: 'How do you show the result to the user?',
          a: 'Show a pending screen, poll your own backend (updated by webhooks) with a timeout, and send an email/notification when the final status arrives.',
        },
      ],
      spoken: `"UPI payments are confirmed in the user's UPI app, so the result is async. On mobile it's usually the intent flow that opens GPay or PhonePe; on desktop a QR; collect requests to a UPI ID are being restricted by NPCI. With Razorpay I create an Order and let Checkout handle UPI, but I never assume instant success. I show a 'waiting for approval' screen, poll my own API, and the actual status comes from verified webhooks like order.paid and payment.failed. For stuck 'debited but pending' cases I rely on reconciliation, because Razorpay later captures or auto-refunds them."`,
      mistakes: [
        'Marking the order failed when the popup closes. The UPI approval might still come.',
        'Polling Razorpay directly from the browser. Poll your own API; only the server talks to Razorpay.',
        'Marking an order permanently failed after one `payment.failed`. The user can retry on the same order.',
        'Follow-up trap: "Customer says money was debited but your app says unpaid?" Check the payment in Razorpay; it is often pending at the bank and will be captured or auto-refunded. Your reconciliation job should fix the order status.',
      ],
      takeaway: 'UPI is async: pending screen, webhooks for truth, and reconciliation for stuck payments.',
    },
    {
      id: 'razorpay-failure-handling',
      title: 'Razorpay Payment Failures, Retries and Reconciliation',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Combine checkout callbacks, verified webhooks and a scheduled reconciliation job so every order ends paid, failed or refunded correctly.',
      what: `Payments can fail or end up "unknown" in many ways: wrong OTP, bank down, user closed the tab, webhook missed, server crashed after payment.

A safe design uses **three layers**:
1. **Checkout handler** — fast UX path. Verify the signature on the server.
2. **Webhooks** — reliable path (\`payment.captured\`, \`order.paid\`, \`payment.failed\`, \`refund.processed\`). Razorpay retries webhooks if your server doesn't return 2xx (check docs for the exact schedule).
3. **Reconciliation job** — a cron that finds orders stuck in \`created\`/\`attempted\` for too long and asks Razorpay for the truth (\`orders.fetchPayments(orderId)\`).

#### Deeper version
- **Retries for the user:** one Order can have several payment attempts. Let the user retry on the same order instead of creating a new one, so you never get two successful payments for one purchase.
- **Double payment:** if two attempts both succeed (rare, but possible with UPI), refund the extra one automatically.
- **Idempotent updates:** use conditional updates (\`status: { $ne: 'paid' }\`) so the handler, webhook and cron can all run without double-processing.
- **Settlement reconciliation:** finance also matches Razorpay **settlements** (money reaching your bank, minus fees and GST on fees) against your orders. Razorpay provides settlement reports and APIs for this.`,
      why: `In India, network and bank issues are common. Without reconciliation, you'll have customers who paid but didn't get access, which is the fastest way to lose trust.`,
      analogy: `It's like a shop owner who checks the cash register (checkout), the bank SMS alerts (webhooks), and at night compares the day's bills with the bank statement (reconciliation).`,
      code: [
        {
          title: 'Nightly/15-min reconciliation job',
          lang: 'javascript',
          code: `export async function reconcileStuckOrders() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);   // older than 30 min
  const stuck = await Order.find({ status: { $in: ['created', 'attempted'] }, createdAt: { $lt: cutoff } });

  for (const order of stuck) {
    const { items: payments } = await razorpay.orders.fetchPayments(order.razorpayOrderId);
    const captured = payments.filter((p) => p.status === 'captured');

    if (captured.length >= 1) {
      await Order.updateOne({ _id: order._id, status: { $ne: 'paid' } },
        { status: 'paid', razorpayPaymentId: captured[0].id });
      // More than one success for one order? Refund the extras.
      for (const extra of captured.slice(1)) {
        await razorpay.payments.refund(extra.id, { notes: { reason: 'duplicate payment' } });
      }
    } else if (Date.now() - order.createdAt > 24 * 60 * 60 * 1000) {
      await Order.updateOne({ _id: order._id }, { status: 'expired' });
    }
  }
}`,
        },
      ],
      output: `Every run, orders older than 30 minutes that are still unpaid are checked against Razorpay. If a captured payment exists (the webhook was missed), the order becomes \`paid\` and the tenant gets access. If two captured payments exist, the extra one is refunded. Orders with no success after a day become \`expired\`. Because updates are conditional, running the job twice is harmless.`,
      questions: [
        {
          q: 'How do you handle a user who paid but closed the browser before the callback?',
          a: 'The `payment.captured` / `order.paid` webhook marks the order paid. If that also fails, the reconciliation job fetches the order\'s payments from Razorpay and fixes it.',
        },
        {
          q: 'What is reconciliation?',
          a: 'Comparing your records with the payment provider\'s records (payments and settlements) and fixing differences.',
        },
        {
          q: 'How do you stop double charging when a user retries?',
          a: 'Retry on the same Razorpay order, make status updates idempotent, and refund any extra captured payments for the same order.',
        },
      ],
      spoken: `"I design Razorpay payments with three layers. The checkout handler gives fast feedback, and I verify the signature on the server. Webhooks like payment.captured, order.paid and payment.failed are the reliable source, verified with the webhook secret. Then a reconciliation job runs every few minutes, finds orders stuck in created or attempted, and calls fetchPayments to get the truth — marking them paid, refunding duplicates, or expiring them. All updates are conditional on the current status, so the three paths can overlap safely. Finance separately reconciles settlements."`,
      mistakes: [
        'Trusting only the checkout handler. Tabs close and networks drop.',
        'Creating a new order on every retry click — makes double payments much more likely.',
        'Non-idempotent updates (for example `$inc` credits on every event), so webhook retries give extra credits.',
        'Follow-up trap: "Webhook arrives before your verify API call — problem?" No, if both paths use the same idempotent "mark paid once" update.',
      ],
      takeaway: 'Handler for UX, webhooks for truth, reconciliation for safety — all idempotent.',
    },
    {
      id: 'razorpay-subscriptions',
      title: 'Razorpay Subscriptions',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Create a Plan, then a Subscription for a customer; the first payment sets up a card/UPI mandate and webhooks report each charge.',
      what: `Razorpay subscriptions work in three steps:
1. **Plan** — the price and period, for example ₹999 every 1 month (\`period: 'monthly', interval: 1\`).
2. **Subscription** — a customer on a plan, with \`total_count\` (how many billing cycles).
3. The customer authorizes it through Checkout with \`subscription_id\` (instead of \`order_id\`). This sets up a **mandate** (card e-mandate or UPI AutoPay) so future charges happen automatically.

#### Deeper version
- Statuses include \`created\`, \`authenticated\`, \`active\`, \`pending\` (a charge failed, retrying), \`halted\` (retries exhausted), \`cancelled\`, \`completed\`. Check docs for the full list.
- Webhooks: \`subscription.activated\`, \`subscription.charged\` (each successful renewal), \`subscription.pending\`, \`subscription.halted\`, \`subscription.cancelled\`.
- Checkout signature for subscriptions uses the **payment id and subscription id** (not order id). Check the docs for the exact string order.
- **India rules:** RBI e-mandate rules mean recurring card charges need a registered mandate, pre-debit notifications, and an OTP above a set amount limit. UPI AutoPay also has per-transaction limits. These limits change, so check current docs.
- Razorpay subscriptions are simpler than Stripe Billing: features like proration, metered billing and complex add-ons are more limited, so many teams keep plan logic in their own app.`,
      why: `For an Indian customer base, Razorpay subscriptions support UPI AutoPay and Indian mandate rules out of the box, which Stripe may not cover the same way.`,
      analogy: `It's like setting up a standing instruction with your bank for your SIP or Netflix: you approve once, and the bank pays every month within the agreed limit.`,
      code: [
        {
          title: 'Create a plan and a subscription',
          lang: 'javascript',
          code: `// One-time setup: the plan
const plan = await razorpay.plans.create({
  period: 'monthly',
  interval: 1,
  item: { name: 'Pro Plan', amount: 99900, currency: 'INR' },  // ₹999
});

// Per tenant: the subscription
const sub = await razorpay.subscriptions.create({
  plan_id: plan.id,
  total_count: 12,             // bill for 12 months
  customer_notify: 1,          // Razorpay sends emails/SMS
  notes: { tenantId: String(tenant._id) },
});
// Frontend: new Razorpay({ key, subscription_id: sub.id, handler }).open()`,
        },
        {
          title: 'Handle subscription webhooks',
          lang: 'javascript',
          code: `async function onRazorpaySubscriptionEvent(event) {
  const s = event.payload.subscription.entity;
  const tenantId = s.notes.tenantId;
  const statusMap = {
    'subscription.activated': 'active',
    'subscription.charged': 'active',
    'subscription.pending': 'past_due',
    'subscription.halted': 'halted',
    'subscription.cancelled': 'canceled',
  };
  const status = statusMap[event.event];
  if (status) await Tenant.updateOne({ _id: tenantId }, { billingStatus: status, rzpSubStatus: s.status });
}`,
        },
      ],
      output: `The plan is created once. Each tenant gets a subscription id like \`sub_...\`; they pay the first charge in Checkout, which also registers the mandate. Every month \`subscription.charged\` keeps them active. If a renewal fails, \`subscription.pending\` sets a grace state; after retries, \`subscription.halted\` restricts access.`,
      questions: [
        {
          q: 'How does a Razorpay subscription start?',
          a: 'Create a plan, create a subscription for it, then open Checkout with `subscription_id`. The first payment authorizes the mandate for future charges.',
        },
        {
          q: 'Which webhook tells you a renewal succeeded?',
          a: '`subscription.charged`.',
        },
        {
          q: 'Why do recurring payments in India need mandates?',
          a: 'RBI rules require a registered e-mandate (cards) or UPI AutoPay mandate for automatic recurring debits, with pre-debit notifications and extra authentication above a limit.',
        },
      ],
      spoken: `"Razorpay subscriptions are plan plus subscription. I create a plan with the period, interval and amount, then a subscription for the tenant with total_count and tenantId in notes. The customer opens Checkout with the subscription_id, and the first payment registers a card e-mandate or UPI AutoPay mandate, which RBI rules require for recurring debits. I then rely on webhooks: subscription.charged for renewals, pending for failures, halted when retries run out, and cancelled. Compared to Stripe it's simpler, so I keep proration and usage logic in my own app."`,
      mistakes: [
        'Verifying the subscription checkout signature with the order id formula — it uses the subscription id.',
        'Ignoring `subscription.halted`, so tenants keep access after all retries failed.',
        'Assuming any amount can auto-debit. Mandates have limits; high-value renewals may need customer authentication.',
        'Follow-up trap: "How would you upgrade a plan mid-cycle on Razorpay?" Razorpay supports updating a subscription\'s plan with options for when it applies, but proration support is limited — check the docs, and often you calculate any difference yourself.',
      ],
      takeaway: 'Razorpay subscriptions = plan + subscription + mandate, driven by subscription.* webhooks.',
    },
    {
      id: 'stripe-errors-declines',
      title: 'Handling Stripe Errors and Card Declines',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Separate card declines (show a friendly message) from your bugs and Stripe outages (log, retry, alert); never show raw errors.',
      what: `Stripe calls can fail for very different reasons, and each needs a different reaction:

- **Card errors** (\`StripeCardError\`, type \`card_error\`) — the bank declined: insufficient funds, expired card, wrong CVC. Show the user a friendly message and let them try another card.
- **Invalid request** (\`StripeInvalidRequestError\`) — **your** bug: wrong parameter, missing id. Log it and fix the code.
- **Authentication / permission** — wrong or restricted API key.
- **Rate limit** (\`StripeRateLimitError\`, HTTP 429) — too many requests. Back off and retry.
- **Connection / API errors** — network or Stripe-side problem. Retry with the same idempotency key.

#### Deeper version
- Card errors include \`code\` (for example \`card_declined\`, \`expired_card\`, \`incorrect_cvc\`) and often \`decline_code\` (for example \`insufficient_funds\`, \`do_not_honor\`). Don't show some decline codes like \`fraudulent\` or \`stolen_card\` to users — show a generic "card declined" message.
- In the browser, \`stripe.confirmPayment\` returns \`{ error }\` instead of throwing; \`error.type === 'card_error' || 'validation_error'\` messages are safe to display.
- The SDK's \`maxNetworkRetries\` retries safe network failures automatically.
- Log \`err.requestId\` — Stripe support can trace it.`,
      why: `Good error handling turns "something went wrong" into "your card has insufficient funds, try another card", which recovers payments. It also stops you from retrying requests that will never succeed (your bugs) and alerts you when Stripe has issues.`,
      analogy: `It's like a shop's card machine: "declined" means ask for another card; "machine not connected" means try again; "wrong amount typed" means the cashier made a mistake and must fix it.`,
      code: [
        {
          title: 'Map Stripe errors to HTTP responses',
          lang: 'javascript',
          code: `import Stripe from 'stripe';

const HIDDEN_DECLINES = ['fraudulent', 'stolen_card', 'lost_card', 'pickup_card'];

export function stripeErrorHandler(err, req, res, next) {
  if (!(err instanceof Stripe.errors.StripeError)) return next(err);

  if (err instanceof Stripe.errors.StripeCardError) {
    const msg = HIDDEN_DECLINES.includes(err.decline_code)
      ? 'Your card was declined. Please use another card.'
      : err.message;                                   // e.g. "Your card has insufficient funds."
    return res.status(402).json({ error: msg, code: err.code });
  }
  if (err instanceof Stripe.errors.StripeRateLimitError) {
    return res.status(503).json({ error: 'Busy, please retry in a moment.' });
  }
  // Invalid request, auth, API or connection errors: our problem, not the user's
  req.log.error({ requestId: err.requestId, type: err.type, msg: err.message }, 'Stripe error');
  return res.status(500).json({ error: 'Payment service error. Please try again.' });
}

app.use(stripeErrorHandler);   // after your routes`,
        },
      ],
      output: `If a tenant's card has no balance, the API answers 402 with "Your card has insufficient funds." and the UI asks for another card. If the bank flagged fraud, the user only sees the generic decline message. A typo in a price id becomes a 500 with a generic message, and your logs contain the Stripe \`requestId\` and the exact error so you can fix it quickly.`,
      questions: [
        {
          q: 'What types of errors does Stripe return?',
          a: 'Card errors (declines), invalid request errors (your bug), authentication/permission errors, rate limit errors, and API/connection errors (Stripe or network issues).',
        },
        {
          q: 'Which errors should you retry?',
          a: 'Connection, API (5xx) and rate limit errors — with backoff and the same idempotency key. Never blindly retry card declines or invalid requests.',
        },
        {
          q: 'What is a decline_code?',
          a: 'A more specific reason from the bank, like `insufficient_funds` or `do_not_honor`. Some, like `fraudulent`, should not be shown to the customer.',
        },
      ],
      spoken: `"I split Stripe errors into user problems and system problems. Card errors are declines — I return a 402 with a friendly message, but for codes like fraudulent or stolen card I show a generic 'card declined'. Invalid request errors are our bugs, so I log them with the Stripe request id and return a generic 500. Rate limits and connection errors are retried with backoff and the same idempotency key, and the SDK's maxNetworkRetries handles simple network blips. On the frontend, confirmPayment returns an error object that's safe to display for card and validation errors."`,
      mistakes: [
        'Showing raw error messages for every error type — leaks internal details for invalid requests.',
        'Retrying card declines automatically — the bank will keep declining and may flag the card.',
        'Retrying without an idempotency key, risking duplicate charges.',
        'Follow-up trap: "Do you get a webhook for a declined Checkout attempt?" The user just retries on the page; you mainly care about the final `checkout.session.completed` or `payment_intent.payment_failed` for your own flows.',
      ],
      takeaway: 'Declines get friendly messages; bugs get logs; outages get retries with idempotency keys.',
    },
    {
      id: 'webhook-idempotency',
      title: 'Webhook Idempotency, Retries and Out-of-Order Events',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Webhooks can arrive twice, late or out of order: store processed event ids, make handlers idempotent, and re-fetch current state.',
      what: `Stripe (and Razorpay) promise **at-least-once** delivery. That means:
- The **same event can arrive more than once** (retries after a timeout, or network issues).
- Events can arrive **out of order** (\`customer.subscription.updated\` may arrive before \`customer.subscription.created\`).
- Events can arrive **late** (hours later, after retries).

So your handler must be **idempotent**: processing the same event twice must not change the result.

Three tools:
1. **Store event ids** — save \`event.id\` in a collection with a unique index. If it's already there, skip.
2. **Re-fetch, don't trust** — for state (subscription status, plan), fetch the latest object from Stripe and save that. Then order doesn't matter: whichever event comes last, you write the current truth.
3. **Idempotent writes** — prefer \`$set\` over \`$inc\`, and use conditional updates (\`status: { $ne: 'paid' }\`).

#### Deeper version
- Insert the event id **atomically** (unique index + catch duplicate key error \`11000\`) instead of "find then insert", which has a race when two deliveries arrive at once.
- Track a status (\`processing\`, \`done\`, \`failed\`) so a crash mid-way can be retried, instead of "seen = done forever".
- If you don't re-fetch, compare timestamps: keep \`lastEventCreated\` on the tenant and ignore events with an older \`event.created\`. (Seconds-level precision can tie, so re-fetching is safer.)
- For heavy work, store the raw event, return 200, and process from a queue (BullMQ, SQS) with the same idempotency checks.
- TTL index the processed-events collection (for example 30–90 days) to keep it small.`,
      why: `Without idempotency, a retried \`invoice.paid\` could add usage credits twice, send two "welcome" emails, or an old \`updated\` event could downgrade a tenant who just upgraded. These bugs are rare, so they hit in production, not in testing.`,
      analogy: `Imagine the postman sometimes delivers the same letter twice, and sometimes Tuesday's letter comes after Wednesday's. You keep a register of letter numbers you've already handled, and before acting on a letter about your account, you call the bank to ask for the current balance.`,
      code: [
        {
          title: 'Atomic dedupe with a unique index (Mongoose)',
          lang: 'javascript',
          code: `const ProcessedEventSchema = new mongoose.Schema({
  _id: String,                                // Stripe event id, e.g. 'evt_...'
  type: String,
  status: { type: String, default: 'processing' },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 60 }, // TTL 60 days
});
const ProcessedEvent = mongoose.model('ProcessedEvent', ProcessedEventSchema);

export async function processOnce(event, handler) {
  try {
    await ProcessedEvent.create({ _id: event.id, type: event.type });  // atomic claim
  } catch (err) {
    if (err.code === 11000) {
      const existing = await ProcessedEvent.findById(event.id);
      if (existing.status === 'done') return 'duplicate';    // already handled
      // status 'processing' or 'failed': fall through and try again
    } else {
      throw err;
    }
  }
  try {
    await handler(event);
    await ProcessedEvent.updateOne({ _id: event.id }, { status: 'done' });
    return 'processed';
  } catch (err) {
    await ProcessedEvent.updateOne({ _id: event.id }, { status: 'failed' });
    throw err;                                // return 500 -> Stripe retries
  }
}`,
        },
        {
          title: 'Out-of-order safe: write current state, not event state',
          lang: 'javascript',
          code: `// BAD: trusts the (maybe old) snapshot inside the event
// await Tenant.updateOne({ _id }, { plan: event.data.object.items.data[0].price.lookup_key });

// GOOD: re-fetch the subscription so the newest truth always wins
async function onSubscriptionChanged(event) {
  const sub = await stripe.subscriptions.retrieve(event.data.object.id);
  await Tenant.updateOne(
    { _id: sub.metadata.tenantId },
    { $set: { billingStatus: sub.status, planKey: sub.items.data[0].price.lookup_key } }
  );
}`,
        },
      ],
      output: `When Stripe delivers \`evt_123\` twice, the first call inserts the id and processes it; the second hits the unique index (\`11000\`), sees status \`done\`, and returns \`duplicate\` — still with HTTP 200 so Stripe stops retrying. If the handler crashed the first time, the status is \`failed\`, so the retry processes it again. In the second block, even if an old \`updated\` event arrives last, it re-fetches and writes the current plan, so the tenant is never wrongly downgraded.`,
      questions: [
        {
          q: 'How do you make webhook handlers idempotent?',
          a: 'Store each event id with a unique index and skip duplicates, use `$set`/conditional updates instead of increments, and re-fetch current state from Stripe for state changes.',
        },
        {
          q: 'How do you handle out-of-order webhook events?',
          a: 'Don\'t apply the event snapshot blindly. Re-fetch the object from the API and save its current state, or compare timestamps and ignore older events.',
        },
        {
          q: 'Should a duplicate event return 200 or 4xx?',
          a: '200. You have already handled it; any non-2xx makes Stripe keep retrying.',
        },
        {
          q: 'Why not "findOne then insert" to check duplicates?',
          a: 'Two deliveries can arrive at the same moment; both see "not found" and both process. A unique index makes the claim atomic.',
        },
      ],
      spoken: `"Webhooks are at-least-once, so I assume duplicates, retries and out-of-order delivery. I keep a processed-events collection where the Stripe event id is the _id, so inserting it is an atomic claim — a duplicate key error means we've seen it. I store a status so a crashed handler can be retried. For state like plan and subscription status, I don't trust the event snapshot; I re-fetch the subscription and set the current values, so the order of events doesn't matter. And I avoid increments in handlers, or guard them with the event id, so retries can't double-count credits."`,
      mistakes: [
        'Marking the event as processed **before** the work finishes; a crash then loses the event forever.',
        'Using `$inc` for credits or usage resets without dedupe — retries double-count.',
        'Returning 400 for duplicates — Stripe keeps retrying and eventually may disable the endpoint after many failures.',
        'Checking duplicates with find-then-insert (race condition).',
        'Follow-up trap: "Is the event id enough? What about two different events about the same object?" Event ids dedupe deliveries, not business actions. Also make the business update itself idempotent (for example mark invoice id as applied).',
      ],
      takeaway: 'Assume duplicates and disorder: dedupe by event id atomically, write current state, keep writes idempotent.',
    },
    {
      id: 'subscription-items-add-ons',
      title: 'Add-ons, Seats and Multiple Subscription Items',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'One subscription can hold many items — base plan, per-seat price, add-on modules — each with its own Price and quantity.',
      what: `A subscription has an \`items\` list. Each **subscription item** is one Price with a quantity. This is how you build:

- **Base plan**: \`pro_monthly\`, quantity 1.
- **Seats**: \`seat_monthly\`, quantity 25 (per-user pricing).
- **Add-ons**: \`payroll_addon_monthly\`, \`ats_addon_monthly\` — extra modules from your marketplace.

All items are billed together on **one invoice** per period. Adding or removing an item mid-cycle creates **prorations** (see next topic).

Rules: all items in one subscription must share the same billing interval (for example all monthly) and currency. Check the docs for edge cases.

#### Deeper version
- Add an item: \`stripe.subscriptionItems.create({ subscription, price, quantity, proration_behavior })\` or \`subscriptions.update\` with a new entry in \`items\`.
- Remove an item: \`subscriptions.update(id, { items: [{ id: 'si_...', deleted: true }] })\`.
- Change seats: update that item's \`quantity\`.
- Store the **item ids** (\`si_...\`) per add-on in your DB, or find them by \`price.lookup_key\` when syncing.
- Add-ons that are one-time (setup, data migration) are **not** subscription items — use invoice items or \`add_invoice_items\`.
- Each item's Price links to a Product; give Products \`metadata\` like \`feature: 'payroll'\` so webhooks can map items to entitlements automatically.`,
      why: `In a marketplace-style SaaS, customers mix and match. Using multiple items keeps everything on one bill and one renewal date, instead of many separate subscriptions that renew on different days.`,
      analogy: `It's like a cable TV bill: base pack plus sports pack plus movies pack plus 3 set-top boxes. One monthly bill, with one line per pack.`,
      code: [
        {
          title: 'Add a marketplace add-on to an existing subscription',
          lang: 'javascript',
          code: `app.post('/api/marketplace/:addonKey/enable', requireAuth, requireRole('billing_admin'), async (req, res) => {
  const { data } = await stripe.prices.list({ lookup_keys: [req.params.addonKey + '_monthly'] });
  if (!data.length) return res.status(404).json({ error: 'Unknown add-on' });

  const item = await stripe.subscriptionItems.create(
    {
      subscription: req.tenant.stripeSubscriptionId,
      price: data[0].id,
      quantity: 1,
      proration_behavior: 'always_invoice',   // charge the prorated amount now
    },
    { idempotencyKey: 'addon-' + req.tenant._id + '-' + req.params.addonKey + '-' + req.body.requestId }
  );
  // Don't unlock here; the webhook sync will grant the entitlement
  res.json({ itemId: item.id });
});`,
        },
        {
          title: 'Change seats and remove an add-on in one update',
          lang: 'javascript',
          code: `await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
  items: [
    { id: tenant.seatItemId, quantity: 40 },          // 25 -> 40 seats
    { id: tenant.atsAddonItemId, deleted: true },     // remove ATS add-on
  ],
  proration_behavior: 'create_prorations',            // settle on next invoice
});`,
        },
      ],
      output: `Enabling the payroll add-on creates a new item on the same subscription and an immediate invoice for the remaining days of the month. Stripe sends \`customer.subscription.updated\`; your sync sees the \`payroll\` item and grants the feature. The second call raises seats to 40 and removes ATS; prorated charges and credits are added to the next invoice, which shows lines for the base plan, 40 seats and the adjustments.`,
      questions: [
        {
          q: 'How do you model add-ons in Stripe?',
          a: 'As extra subscription items on the same subscription, each with its own Price and quantity, so everything is billed together.',
        },
        {
          q: 'How do you implement per-seat pricing?',
          a: 'A Price per seat and a subscription item whose `quantity` equals the seat count. Update the quantity when users are added or removed.',
        },
        {
          q: 'Can you mix monthly and yearly items in one subscription?',
          a: 'Generally no — items in one subscription share a billing interval. Use separate subscriptions for different intervals (check docs for current rules).',
        },
        {
          q: 'How do you remove an add-on?',
          a: 'Update the subscription with `{ id: itemId, deleted: true }` in `items`, choosing the proration behavior.',
        },
      ],
      spoken: `"I model add-ons as extra subscription items on the tenant's single subscription — base plan, a per-seat item where quantity equals the user count, and one item per marketplace module like payroll. They all renew on one date and appear on one invoice. Enabling an add-on creates a subscription item with an idempotency key and a proration behavior, usually always_invoice so they pay now. I don't unlock the feature in the API call; the subscription.updated webhook maps item lookup keys to entitlements in our database. Removing is an update with deleted true."`,
      mistakes: [
        'Creating a separate subscription per add-on — many invoices, many renewal dates, messy proration.',
        'Unlocking the feature right after the API call, before payment is confirmed (for `always_invoice`, the payment could fail).',
        'Updating seat quantity on every single user invite without debouncing — creates many tiny proration lines.',
        'Follow-up trap: "What if the add-on payment fails?" With `payment_behavior: \'pending_if_incomplete\'` on the update, Stripe can keep the change pending until payment succeeds — check docs for which changes support it.',
      ],
      takeaway: 'One subscription, many items: base plan, seats and add-ons billed together and mapped to entitlements via webhooks.',
    },
    {
      id: 'stripe-proration',
      title: 'Proration: Upgrades and Downgrades',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Changing plans mid-cycle creates credits for unused time and charges for new time; proration_behavior decides when they are billed.',
      what: `**Proration** means "charge only for the part of the month actually used".

Example: Pro costs ₹1,000/month, Business ₹3,000/month. A tenant upgrades halfway through the month.
- **Credit** for unused Pro: about ₹500.
- **Charge** for remaining Business: about ₹1,500.
- Net: about ₹1,000 extra.

\`proration_behavior\` controls this:
- \`'create_prorations'\` (default) — create the credit/charge lines and add them to the **next** invoice.
- \`'always_invoice'\` — create them and **invoice immediately** (charge now).
- \`'none'\` — no proration; new price applies from next period.

#### Deeper version
Common SaaS policy:
- **Upgrade** → \`always_invoice\` so they pay the difference now and get features now.
- **Downgrade** → apply at the **end of the period** so they keep what they paid for. Use a **Subscription Schedule** (phases: current plan until period end, then the cheaper plan), or store a "pending downgrade" in your DB and apply it on \`invoice.upcoming\` / at renewal.
- \`billing_cycle_anchor: 'now'\` resets the billing date (for example monthly → yearly switch).
- **Preview** the amount before confirming: newer API versions use \`stripe.invoices.createPreview(...)\`; older ones \`invoices.retrieveUpcoming(...)\`. Pass the same \`proration_date\` to the preview and the update so the numbers match exactly.
- Proration is calculated to the second, so the amounts are not round numbers.`,
      why: `"How do you handle upgrades and downgrades?" is the most common Stripe billing interview question. Wrong proration means overcharging (disputes) or undercharging (lost revenue).`,
      analogy: `It's like moving from a ₹10,000 flat to a ₹15,000 flat in the middle of the month. The landlord returns half of the old rent and charges half of the new rent. Moving to a cheaper flat is usually done at month end, because you already paid for this month.`,
      code: [
        {
          title: 'Preview then upgrade with immediate invoice',
          lang: 'javascript',
          code: `const prorationDate = Math.floor(Date.now() / 1000);
const sub = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
const itemId = sub.items.data[0].id;

// 1. Preview (newer API versions; older used invoices.retrieveUpcoming)
const preview = await stripe.invoices.createPreview({
  customer: tenant.stripeCustomerId,
  subscription: sub.id,
  subscription_details: {
    items: [{ id: itemId, price: businessPriceId }],
    proration_date: prorationDate,
  },
});
console.log('Due now:', preview.amount_due / 100);

// 2. After the user confirms: same proration_date so amounts match
await stripe.subscriptions.update(sub.id, {
  items: [{ id: itemId, price: businessPriceId }],
  proration_behavior: 'always_invoice',
  proration_date: prorationDate,
}, { idempotencyKey: 'upgrade-' + tenant._id + '-' + prorationDate });`,
        },
        {
          title: 'Downgrade at period end with a Subscription Schedule',
          lang: 'javascript',
          code: `// Turn the existing subscription into a schedule
const schedule = await stripe.subscriptionSchedules.create({
  from_subscription: tenant.stripeSubscriptionId,
});

const current = schedule.phases[0];
await stripe.subscriptionSchedules.update(schedule.id, {
  end_behavior: 'release',                  // become a normal subscription after
  phases: [
    { items: [{ price: current.items[0].price, quantity: 1 }],
      start_date: current.start_date, end_date: current.end_date },
    { items: [{ price: starterPriceId, quantity: 1 }] },   // from next period
  ],
});`,
        },
      ],
      output: `The preview shows something like "Due now: 1003.47" — the credit for unused Pro plus the charge for the rest of the month on Business. After confirmation, the update invoices immediately; \`invoice.paid\` and \`customer.subscription.updated\` arrive and the tenant gets Business features. For the downgrade, the tenant stays on Pro until the current period ends; then the schedule moves them to Starter with no proration, and the next invoice is the Starter price.`,
      questions: [
        {
          q: 'What are the proration_behavior options?',
          a: '`create_prorations` (default, adds lines to the next invoice), `always_invoice` (bills the difference now), and `none` (no proration).',
        },
        {
          q: 'How do you handle downgrades?',
          a: 'Usually at period end: a Subscription Schedule with a second phase on the cheaper price, or a pending change stored in your DB and applied at renewal. The user keeps paid features until then.',
        },
        {
          q: 'How do you show the user the exact upgrade cost?',
          a: 'Preview the next invoice with the proposed change and a fixed `proration_date`, then use the same `proration_date` in the real update.',
        },
        {
          q: 'What does billing_cycle_anchor now do?',
          a: 'It resets the billing date to today and starts a fresh period — useful when switching monthly to yearly.',
        },
      ],
      spoken: `"Proration means charging only for the time used. If a tenant upgrades mid-month, Stripe credits the unused part of the old plan and charges the remaining part of the new plan. proration_behavior decides when: create_prorations puts it on the next invoice, always_invoice charges now, none skips it. Our policy was upgrades with always_invoice so they pay and unlock immediately, and downgrades at period end using a subscription schedule, so they keep what they paid for. Before upgrading I show a preview invoice with a fixed proration_date and reuse that date in the update so the numbers match."`,
      mistakes: [
        'Downgrading immediately with prorations — creates credits and confuses customers. Prefer period-end downgrades.',
        'Preview and update using different times, so the charged amount differs slightly from what was shown.',
        'Using `none` for upgrades by accident — the customer gets the expensive plan free until renewal.',
        'Forgetting that seat quantity changes also prorate.',
        'Follow-up trap: "With create_prorations, when does the customer pay?" On the next regular invoice, not now — so unlocking features immediately means you are extending credit until renewal.',
      ],
      takeaway: 'Upgrades: prorate and invoice now; downgrades: switch at period end; always preview with a fixed proration_date.',
    },
    {
      id: 'metered-usage-billing',
      title: 'Usage Tracking and Metered Billing (Billing Meters)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Report usage events to Stripe Billing Meters and bill with a metered Price; keep your own usage counters for limits and dashboards.',
      what: `**Metered billing** = charge for what was used: API calls, AI tokens, payslips generated, SMS sent.

How it works in Stripe (current approach):
1. Create a **Meter** — it defines an \`event_name\` (like \`payslips_generated\`) and how to aggregate (for example **sum**).
2. Create a **Price** with \`recurring.usage_type: 'metered'\` linked to that meter.
3. Add that Price to the customer's subscription (no quantity).
4. Send **meter events** as usage happens: event name + customer id + value.
5. At period end, Stripe sums the usage and puts it on the invoice.

**Important:** Stripe used to use "usage records" on subscription items. Stripe moved to the newer **Billing Meters** API, and the old usage records API was removed in recent API versions. Always check the current docs before building.

#### Deeper version
- Meter events are processed asynchronously, so they won't show on the customer instantly.
- Send an \`identifier\` (unique per event) so retries don't double-count.
- Don't send one API call per tiny action at high volume. Aggregate in your own DB (or a queue) and send batched values every few minutes. Check rate limits and the high-throughput meter event stream options in the docs.
- Keep **your own usage counters** in MongoDB too: you need them instantly for limits ("you used 950 of 1,000"), and Stripe's numbers are for billing.
- Pricing models: per-unit, **tiered** (\`graduated\` or \`volume\`), or "included quota + overage".`,
      why: `AI features and APIs have real per-use costs. Metered billing makes heavy users pay more and keeps light users cheap. The reader's HR SaaS used usage tracking to enforce plan quotas and bill overages.`,
      analogy: `It's like an electricity meter. The meter (Billing Meter) counts units all month. At the end the company multiplies units by the rate (metered Price) and puts it on the bill.`,
      code: [
        {
          title: 'One-time setup: meter + metered price',
          lang: 'javascript',
          code: `const meter = await stripe.billing.meters.create({
  display_name: 'Payslips generated',
  event_name: 'payslips_generated',
  default_aggregation: { formula: 'sum' },
});

const price = await stripe.prices.create({
  product: payslipProductId,
  currency: 'inr',
  unit_amount: 500,                                  // ₹5 per payslip
  recurring: { interval: 'month', usage_type: 'metered', meter: meter.id },
  lookup_key: 'payslip_usage',
});`,
        },
        {
          title: 'Record usage: own counter + batched meter events',
          lang: 'javascript',
          code: `// 1. On each action: count in your own DB (fast, used for limits)
await Usage.updateOne(
  { tenantId, metric: 'payslips', period: currentPeriodKey },
  { $inc: { count: 1, unreported: 1 } },
  { upsert: true }
);

// 2. Every 5 minutes: report the unreported amount to Stripe
async function flushUsage(doc, tenant) {
  if (!doc.unreported) return;
  const amount = doc.unreported;
  await stripe.billing.meterEvents.create({
    event_name: 'payslips_generated',
    payload: { stripe_customer_id: tenant.stripeCustomerId, value: String(amount) },
    identifier: 'usage-' + doc._id + '-' + doc.flushSeq,  // dedupe on retry
  });
  await Usage.updateOne({ _id: doc._id }, { $inc: { unreported: -amount, flushSeq: 1 } });
}`,
        },
      ],
      output: `Each payslip increases the tenant's own counter immediately, so the dashboard and limits are always up to date. Every 5 minutes the job sends the batched number to Stripe with a unique identifier; if the request is retried with the same identifier, Stripe does not count it twice. At month end, the invoice shows something like "Payslips generated — 1,240 × ₹5 = ₹6,200" next to the base plan.`,
      questions: [
        {
          q: 'How does metered billing work in Stripe now?',
          a: 'You create a Billing Meter, a metered Price linked to it, add the Price to the subscription, and send meter events with the customer id and value. Stripe aggregates them per period. The older usage records API was replaced — check current docs.',
        },
        {
          q: 'Why keep your own usage counters if Stripe tracks usage?',
          a: 'You need instant numbers for limits and dashboards. Stripe processes meter events asynchronously and is the billing record, not your real-time quota system.',
        },
        {
          q: 'How do you avoid double-counting usage?',
          a: 'Send a unique `identifier` with each meter event, and batch from a DB counter with a sequence number so retries reuse the same identifier.',
        },
      ],
      spoken: `"For usage-based billing I use Stripe's Billing Meters, which replaced the older usage records API. I create a meter with an event name and sum aggregation, and a metered price linked to it on the tenant's subscription. In the app, every billable action increments a counter in Mongo, which powers limits and the usage dashboard instantly. A job batches unreported usage every few minutes and sends meter events with a unique identifier so retries don't double count. At period end Stripe totals it on the invoice. I'd check current docs, since this API changed recently."`,
      mistakes: [
        'Following old tutorials that use `subscriptionItems.createUsageRecord` — removed on newer API versions.',
        'Sending a Stripe API call synchronously on every user action — slow, rate-limited, and fails if Stripe is down.',
        'No idempotency on usage reporting, so retries bill customers twice.',
        'Using Stripe as the real-time quota store.',
        'Follow-up trap: "What happens to usage reported after the period closes?" Late events may land in the next period or be rejected depending on timestamps and meter rules — report frequently and check the docs for grace windows.',
      ],
      takeaway: 'Count usage in your DB for limits; report batched, deduped meter events to Stripe for billing.',
    },
    {
      id: 'entitlements-plan-limits',
      title: 'Plan-based Access and Usage Limits (Entitlements in Your DB)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Map Stripe prices to features and limits in your own DB, sync them from webhooks, and check them locally on every request.',
      what: `**Entitlements** = what a tenant is allowed to do: which features (payroll, ATS) and how much (50 employees, 1,000 AI requests/month).

The pattern:
1. Keep a **plan config** in code or DB: \`pro_monthly → { features: ['payroll'], limits: { employees: 100, aiRequests: 1000 } }\`.
2. When subscription webhooks arrive, compute the tenant's entitlements from their subscription items (base plan + add-ons + seats) and save them on the tenant.
3. On each request, a middleware checks entitlements **from your DB** (or cache), not from Stripe.
4. Usage limits compare a usage counter with the limit.

#### Deeper version
- **Single source of truth:** Stripe is the truth for *billing* (what they pay). Your DB is the truth for *access* (what they can use), derived from Stripe. Never let the frontend decide.
- **Atomic limit checks:** use a conditional update like \`{ count: { $lt: limit } }\` with \`$inc\`, so two parallel requests can't both pass at 999/1000.
- **Grace and soft limits:** warn at 80%, block at 100%, or allow overage that is billed via metering.
- **Downgrade with data over the limit:** for example 120 employees on a 100-employee plan. Usually block *adding* new ones but keep existing data readable.
- Stripe also has an **Entitlements** feature (Features attached to Products, with an active-entitlements API and webhook). It can be the source for feature flags, but you still store a local copy for fast checks. Check current docs for its status.
- Cache entitlements in Redis or in the JWT/session with a short TTL, and invalidate on webhook updates.`,
      why: `This is where billing meets product. Calling Stripe on every request is slow and rate-limited, and if Stripe is down your app goes down. Local entitlements make checks fast, testable and resilient.`,
      analogy: `Stripe is the ticket office that sells passes. Your app is the gate guard. The guard doesn't call the ticket office for every visitor; the office sends an updated guest list (webhooks), and the guard checks the list.`,
      code: [
        {
          title: 'Compute entitlements from subscription items',
          lang: 'javascript',
          code: `// Plan config keyed by Stripe price lookup_key
const PLAN_CONFIG = {
  starter_monthly: { features: ['core'], limits: { employees: 25, aiRequests: 100 } },
  pro_monthly: { features: ['core', 'reports'], limits: { employees: 100, aiRequests: 1000 } },
  payroll_addon_monthly: { features: ['payroll'], limits: {} },
  ai_pack_monthly: { features: [], limits: { aiRequests: 5000 } },   // adds on top
};

export function computeEntitlements(subscription) {
  const result = { features: new Set(), limits: { employees: 0, aiRequests: 0 } };
  for (const item of subscription.items.data) {
    const cfg = PLAN_CONFIG[item.price.lookup_key];
    if (!cfg) continue;                                  // unknown price: ignore safely
    cfg.features.forEach((f) => result.features.add(f));
    for (const [k, v] of Object.entries(cfg.limits)) result.limits[k] += v * (item.quantity || 1);
  }
  return { features: [...result.features], limits: result.limits };
}
// Called inside syncSubscription(); saved as tenant.entitlements`,
        },
        {
          title: 'Express middleware: feature gate + atomic usage limit',
          lang: 'javascript',
          code: `export const requireFeature = (feature) => (req, res, next) => {
  if (!req.tenant.entitlements.features.includes(feature)) {
    return res.status(402).json({ error: 'Upgrade required', feature });
  }
  next();
};

export async function consumeAiRequest(req, res, next) {
  const limit = req.tenant.entitlements.limits.aiRequests;
  // Atomic: only increments if still under the limit
  const updated = await Usage.findOneAndUpdate(
    { tenantId: req.tenant._id, metric: 'aiRequests', period: currentPeriodKey(), count: { $lt: limit } },
    { $inc: { count: 1 } },
    { new: true }
  );
  if (!updated) return res.status(429).json({ error: 'Monthly AI limit reached' });
  next();
}

app.post('/api/payroll/run', requireAuth, requireFeature('payroll'), runPayroll);
app.post('/api/ai/summarize', requireAuth, consumeAiRequest, summarize);`,
        },
      ],
      output: `A tenant with Pro + payroll add-on + one AI pack gets features \`['core', 'reports', 'payroll']\` and limits \`{ employees: 100, aiRequests: 6000 }\`. Calling payroll without the add-on returns 402 "Upgrade required". The 6,001st AI request in a month returns 429. Because the usage check is one atomic \`findOneAndUpdate\`, two requests at 5,999 can't both pass. (The usage document per period must be created first, for example with an upsert at period start or on \`invoice.paid\`, so the filter can match.)`,
      questions: [
        {
          q: 'How do you implement plan-based feature access with Stripe?',
          a: 'Map price lookup keys to features/limits in config, compute entitlements in the subscription webhook, save them on the tenant, and check them in middleware from your DB.',
        },
        {
          q: 'Why not call Stripe on each request to check the plan?',
          a: 'It is slow, rate-limited, and makes your app depend on Stripe\'s uptime. Webhook-synced local data is fast and reliable.',
        },
        {
          q: 'How do you enforce a usage limit safely under concurrency?',
          a: 'Use an atomic conditional update (`count < limit` in the filter plus `$inc`) or a Redis `INCR` with a check, not read-then-write.',
        },
        {
          q: 'What happens to data when a tenant downgrades below their usage?',
          a: 'Keep existing data, but block creating more until they are under the limit or upgrade. Communicate it clearly in the UI.',
        },
      ],
      spoken: `"Stripe is our source of truth for billing, but access lives in our database. I keep a config that maps each price lookup key — base plans and add-ons — to features and limits. In the subscription webhook, I compute entitlements from the subscription items, multiplying by quantity for things like seats or packs, and save them on the tenant. Middleware then checks features locally and returns 402 for upgrades. Usage limits use an atomic Mongo update with count less than limit in the filter, so concurrent requests can't overshoot. Downgrades keep data but block new creation."`,
      mistakes: [
        'Hiding features only in the UI. Always enforce on the server.',
        'Hard-coding plan checks like `if (plan === "pro")` everywhere. Centralise in an entitlements config.',
        'Read-then-write usage checks — race conditions let users exceed limits.',
        'Not resetting usage counters at the right time (use the billing period, e.g. on `invoice.paid`, not calendar month, if billing anchors differ).',
        'Follow-up trap: "What if the webhook is delayed after an upgrade?" Optionally sync right after a successful upgrade API call (re-fetch the subscription), and still let the webhook confirm it.',
      ],
      takeaway: 'Stripe owns billing; your DB owns access — entitlements synced from webhooks and checked locally.',
    },
    {
      id: 'stripe-disputes',
      title: 'Disputes (Chargebacks)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A customer asks their bank to reverse a charge; Stripe takes the money plus a fee, and you can submit evidence before the deadline.',
      what: `A **dispute** (also called a **chargeback**) is when the cardholder tells their bank "I don't recognise this" or "I didn't get what I paid for". The bank pulls the money back.

What happens:
1. Stripe sends \`charge.dispute.created\`. The amount is taken from your balance, plus a **dispute fee**.
2. You have a deadline (shown as \`evidence_details.due_by\`) to submit **evidence**: invoices, login logs, terms accepted, emails.
3. The bank decides. If you win, the money comes back (the fee may not — check Stripe pricing). Then \`charge.dispute.closed\` fires with status \`won\` or \`lost\`.

#### Deeper version
- Common reasons: \`fraudulent\`, \`product_not_received\`, \`subscription_canceled\`, \`duplicate\`, \`credit_not_processed\`.
- For SaaS, strong evidence = proof of usage (login/activity logs), the signed-up email, your cancellation policy, and that you sent renewal reminders.
- An **early fraud warning** (\`radar.early_fraud_warning.created\`) can come before a dispute; refunding then can prevent the dispute.
- Too many disputes (high dispute rate) can get your account reviewed or restricted by the card networks.
- You cannot refund a disputed charge — the money is already gone; respond to the dispute or accept it.`,
      why: `Disputes cost the payment plus a fee and hurt your account health. Good billing UX (clear descriptor, reminders, easy cancel) prevents most of them, and good logs help you win the rest.`,
      analogy: `It's like a customer telling their bank "I never bought this". The bank freezes the money and asks the shop for the receipt and CCTV footage. If the shop proves the sale, it gets the money back.`,
      code: [
        {
          title: 'Auto-collect evidence when a dispute opens',
          lang: 'javascript',
          code: `case 'charge.dispute.created': {
  const dispute = event.data.object;
  const charge = await stripe.charges.retrieve(dispute.charge);
  const tenant = await Tenant.findOne({ stripeCustomerId: charge.customer });
  const logins = await AuditLog.find({ tenantId: tenant._id, action: 'login' }).limit(20).lean();

  await stripe.disputes.update(dispute.id, {
    evidence: {
      customer_email_address: tenant.billingEmail,
      product_description: 'Monthly HR SaaS subscription (Pro plan)',
      access_activity_log: logins.map((l) => l.at.toISOString() + ' ' + l.ip).join('; '),
      uncategorized_text: 'Customer actively used the service during the billed period.',
    },
    submit: false,   // save as draft; a human reviews and submits before due_by
  });
  await alertFinanceTeam(dispute.id, dispute.evidence_details.due_by);
  break;
}`,
        },
      ],
      output: `When a dispute opens, the handler finds the tenant, gathers recent login activity, and saves draft evidence on the dispute. The finance team gets an alert with the deadline. They review, add the invoice PDF if needed, and submit. Later, \`charge.dispute.closed\` reports \`won\` or \`lost\`.`,
      questions: [
        {
          q: 'What is a dispute or chargeback?',
          a: 'The cardholder asks their bank to reverse a payment. The money and a fee are taken from your Stripe balance until it is resolved.',
        },
        {
          q: 'How do you fight a dispute?',
          a: 'Submit evidence before the deadline via the Dashboard or `disputes.update` with `evidence` and `submit: true` — usage logs, invoices, terms, communication.',
        },
        {
          q: 'How do you reduce disputes in a SaaS?',
          a: 'Clear statement descriptor, renewal reminders, easy cancellation, quick refunds for honest complaints, and 3DS for fraud liability shift.',
        },
      ],
      spoken: `"A dispute, or chargeback, is when the cardholder asks their bank to reverse a charge. Stripe immediately takes the amount and a dispute fee, and sends charge.dispute.created. I handle that webhook by collecting evidence automatically — the billing email, a description of the service, and login activity logs that show usage — and saving it as a draft for finance to review and submit before the due date. To prevent disputes we use a clear statement descriptor, send renewal reminders, make cancellation easy, and refund quickly when someone has a fair complaint."`,
      mistakes: [
        'Ignoring dispute emails until the deadline passes — that is an automatic loss.',
        'Trying to refund a disputed charge. You respond to the dispute instead.',
        'An unclear statement descriptor (customers don\'t recognise the charge and dispute it).',
        'Follow-up trap: "Does 3D Secure protect you from all disputes?" No. It mainly shifts liability for fraud-type disputes; "not received" or "cancelled" disputes still need evidence.',
      ],
      takeaway: 'Disputes cost money and reputation: prevent with clear billing UX, and answer fast with usage evidence.',
    },
    {
      id: 'stripe-test-clocks',
      title: 'Test Clocks (Testing Renewals, Trials and Time)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Test clocks let you fast-forward time in test mode to see trials end, renewals happen and failed payments retry — without waiting a month.',
      what: `Billing bugs often appear only **after time passes**: trial ends, the month renews, a card expires, retries run out. Waiting 30 days to test is not possible.

A **test clock** is a fake clock in test mode. You:
1. Create a test clock with a start time.
2. Create a Customer **attached to that clock**.
3. Create subscriptions for that customer as normal.
4. **Advance** the clock (for example +15 days). Stripe runs everything that would happen in that time — invoices, payments, retries — and sends the real webhooks.

#### Deeper version
- Advancing is **asynchronous**: the clock goes to status \`advancing\` and then \`ready\`. Wait (poll) until it is ready before checking results.
- There are limits on how far you can advance at once and how many customers/subscriptions per clock — check the docs.
- Use failing test cards (for example a card that declines after being attached, like \`4000 0000 0000 0341\`) to test dunning.
- Deleting the test clock deletes its customers and related objects, which keeps test data clean.
- Your app must use **Stripe's time** for billing logic (from webhook objects), not \`Date.now()\` — otherwise your code and Stripe disagree during clock tests.`,
      why: `Trials, renewals, proration and dunning are the riskiest parts of billing, and they all depend on time. Test clocks let you run a full year of billing in minutes and catch bugs before customers do.`,
      analogy: `It's like a time machine for your billing. You set a customer up today, press "skip 30 days", and watch what bills and emails they would get.`,
      code: [
        {
          title: 'Script: test a trial ending and the first renewal',
          lang: 'javascript',
          code: `const now = Math.floor(Date.now() / 1000);
const DAY = 86400;

const clock = await stripe.testHelpers.testClocks.create({ frozen_time: now, name: 'trial-test' });

const customer = await stripe.customers.create({
  email: 'qa@acme.test',
  test_clock: clock.id,
  payment_method: 'pm_card_visa',                       // test PaymentMethod
  invoice_settings: { default_payment_method: 'pm_card_visa' },
});

await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: proPriceId }],
  trial_period_days: 14,
});

// Jump 15 days: trial ends, first invoice is created and paid
await stripe.testHelpers.testClocks.advance(clock.id, { frozen_time: now + 15 * DAY });

// Wait until Stripe finishes processing
let c;
do {
  await new Promise((r) => setTimeout(r, 2000));
  c = await stripe.testHelpers.testClocks.retrieve(clock.id);
} while (c.status !== 'ready');

const subs = await stripe.subscriptions.list({ customer: customer.id });
console.log(subs.data[0].status);   // 'active'`,
        },
      ],
      output: `The script creates a customer on a frozen clock with a 14-day trial. After advancing 15 days and waiting for the clock to be \`ready\`, the subscription is \`active\` and a paid invoice exists. Your local webhook endpoint (via \`stripe listen\`) receives \`customer.subscription.trial_will_end\`, \`invoice.paid\` and \`customer.subscription.updated\` exactly as in production, so you can check your DB changes.`,
      questions: [
        {
          q: 'What is a Stripe test clock?',
          a: 'A test-mode feature that simulates time moving forward for customers attached to it, so you can test trials, renewals and retries quickly.',
        },
        {
          q: 'How do you test a failed renewal?',
          a: 'Attach a customer to a test clock with a card that declines on charge, create the subscription, then advance past the renewal date and watch `invoice.payment_failed` and the retries.',
        },
        {
          q: 'Do webhooks fire with test clocks?',
          a: 'Yes, the same events fire as time advances, so you can test your handlers end to end.',
        },
      ],
      spoken: `"Billing bugs usually show up when time passes — trial end, renewal, retries — so I use Stripe test clocks. I create a clock, attach a test customer to it, create the subscription, then advance the clock by a few weeks. Stripe generates the invoices, charges, retries and webhooks as if that time had passed. Advancing is async, so I poll until the clock is ready. I use declining test cards to test dunning, and I make sure my app uses timestamps from Stripe objects rather than Date.now, so clock tests behave correctly."`,
      mistakes: [
        'Checking results right after `advance` without waiting for status `ready`.',
        'Trying to attach an existing customer to a clock — the clock must be set when the customer is created.',
        'Using server `Date.now()` for period logic, which ignores the simulated time.',
        'Follow-up trap: "Can you use test clocks in live mode?" No, they are test-mode only.',
      ],
      takeaway: 'Test clocks fast-forward billing time so you can test trials, renewals and dunning end to end.',
    },
    {
      id: 'stripe-connect-marketplaces',
      title: 'Stripe Connect for Marketplaces (Splitting Payments)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Connect lets your platform take payments on behalf of sellers and pay them out, keeping an application fee.',
      what: `If your platform takes money from buyers and **pays other businesses** (sellers, trainers, vendors in a marketplace), you need **Stripe Connect**. Each seller gets a **connected account** (\`acct_...\`). Stripe handles their identity checks (KYC) and payouts to their bank.

Note the difference: a "marketplace" of **your own add-ons** (like the HR SaaS add-on store) is just subscription items — no Connect needed. Connect is for when money must go to **third parties**.

Account types (simplified): **Standard** (seller has their own full Stripe dashboard), **Express** (light Stripe-hosted dashboard), **Custom** (you build everything). Newer Stripe docs describe accounts by "controller" properties instead of these types — check the current docs.

#### Deeper version
Charge types:
- **Direct charges** — the payment is created on the seller's account; you take an \`application_fee_amount\`.
- **Destination charges** — the payment is on your platform; you send part to the seller with \`transfer_data.destination\` and keep a fee.
- **Separate charges and transfers** — charge first, transfer to one or more sellers later (good for splitting one order across many sellers).

Who pays refunds and disputes depends on the charge type — an important design decision. Onboarding uses **Account Links** (Stripe-hosted forms). Listen to \`account.updated\` to know when a seller can receive payouts.`,
      why: `Moving money to third parties has legal and KYC requirements. Connect handles onboarding, compliance and payouts so you don't become a money transmitter yourself.`,
      analogy: `It's like a food delivery app: the customer pays the app, the app keeps its commission and passes the rest to the restaurant's bank account. Connect is the system that knows every restaurant's bank and identity.`,
      code: [
        {
          title: 'Onboard a seller and take a destination charge with a fee',
          lang: 'javascript',
          code: `// 1. Create a connected account and an onboarding link
const account = await stripe.accounts.create({ type: 'express', country: 'US', email: seller.email });
const link = await stripe.accountLinks.create({
  account: account.id,
  type: 'account_onboarding',
  refresh_url: process.env.APP_URL + '/seller/onboarding/retry',
  return_url: process.env.APP_URL + '/seller/onboarding/done',
});
// redirect seller to link.url

// 2. Buyer pays $100; platform keeps $10; seller gets the rest
const intent = await stripe.paymentIntents.create({
  amount: 10000,                 // $100.00 in cents
  currency: 'usd',
  automatic_payment_methods: { enabled: true },
  application_fee_amount: 1000,   // $10.00
  transfer_data: { destination: account.id },
});`,
        },
      ],
      output: `The seller completes Stripe's hosted onboarding (identity, bank). When the buyer pays, Stripe moves the money to the seller's connected account minus the application fee, which stays in your platform balance. The seller later gets a payout to their bank. (Country and account-type options vary — check Connect docs for your region.)`,
      questions: [
        {
          q: 'When do you need Stripe Connect?',
          a: 'When your platform collects money and pays it out to other businesses or individuals (sellers, vendors, service providers).',
        },
        {
          q: 'Direct vs destination charges?',
          a: 'Direct charges are created on the connected account (seller is merchant of record). Destination charges are on the platform and part is transferred to the seller.',
        },
        {
          q: 'How does the platform earn money with Connect?',
          a: 'Using `application_fee_amount` on charges (or keeping part when doing separate transfers).',
        },
      ],
      spoken: `"Stripe Connect is for platforms that pay other businesses — like a marketplace of vendors. Each seller gets a connected account, and Stripe handles their KYC and payouts through hosted onboarding links. Then I choose a charge type: direct charges on the seller's account with an application fee, destination charges where the platform charges and transfers to the seller, or separate charges and transfers for splitting one order. The choice affects who pays for refunds and disputes. In our HR SaaS the add-on marketplace was our own products, so it was plain subscription items, not Connect."`,
      mistakes: [
        'Using Connect for selling your own add-ons — subscription items are enough.',
        'Paying sellers manually from your own bank — compliance risk; use Connect payouts.',
        'Not checking `charges_enabled` / `payouts_enabled` on the account before routing money to it.',
        'Follow-up trap: "Who loses money on a dispute with destination charges?" By default the platform is responsible and may need to reverse the transfer — decide this up front.',
      ],
      takeaway: 'Connect is for paying third parties: connected accounts, hosted onboarding, and application fees.',
    },
    {
      id: 'saas-billing-architecture',
      title: 'Designing Multi-tenant SaaS Billing (Source of Truth and Sync)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Stripe owns money, your DB owns access: one Customer per tenant, webhook-driven sync, a queue, and a nightly reconciliation job.',
      what: `This is the "system design" version of everything above. A solid multi-tenant billing design:

1. **One Stripe Customer per tenant**, created at signup or first checkout. Store \`stripeCustomerId\` on the tenant and \`tenantId\` in Stripe metadata.
2. **Changes go through Stripe first** (checkout, upgrade, add-on, cancel). Your app does not set "plan = pro" directly.
3. **Webhooks update your DB**: verify, dedupe, re-fetch, compute entitlements, save.
4. **Access checks are local**: middleware reads entitlements from DB/cache.
5. **Usage** is counted locally and reported to Stripe in batches.
6. **Reconciliation**: a nightly job lists subscriptions from Stripe and fixes any tenant whose DB state differs (a safety net for missed webhooks or bugs).

#### Deeper version
- **Data model:** \`tenant.billing = { stripeCustomerId, subscriptionId, status, planKey, items: [{ priceKey, itemId, quantity }], entitlements, currentPeriodEnd, pastDueSince, cancelAtPeriodEnd }\`.
- **Queue:** webhook route verifies + stores event + returns 200; a worker processes it. This survives slow DB writes and deploys.
- **Locks:** serialise billing operations per tenant (for example a Redis lock or a Mongo "billing in progress" flag) so two admins can't upgrade at the same time.
- **Audit log:** record who changed what plan and when — support and finance will ask.
- **Environments:** separate keys, webhook secrets and price lookup keys per environment; seed test data with scripts.
- **Observability:** alert on webhook failures in the Stripe Dashboard and on handler errors in your logs.`,
      why: `Interviewers love "design a subscription billing system". Showing clear ownership (Stripe = billing truth, DB = access copy), idempotent sync and reconciliation proves you've run billing in production.`,
      analogy: `Stripe is the bank's ledger; your database is the company's employee access-card system. HR (webhooks) updates the access cards whenever the bank says a payment changed, and every night an auditor compares the two lists.`,
      code: [
        {
          title: 'Nightly reconciliation of subscriptions',
          lang: 'javascript',
          code: `export async function reconcileSubscriptions() {
  let fixed = 0;
  // Auto-pagination: iterates over every subscription in pages
  for await (const sub of stripe.subscriptions.list({ status: 'all', limit: 100 })) {
    const tenantId = sub.metadata.tenantId;
    if (!tenantId) continue;

    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant || tenant.billing?.subscriptionId !== sub.id) continue;

    if (tenant.billing.status !== sub.status) {
      await syncSubscription(sub.id);       // same function the webhook uses
      fixed++;
      logger.warn({ tenantId, from: tenant.billing.status, to: sub.status }, 'billing drift fixed');
    }
  }
  return fixed;
}`,
        },
        {
          title: 'Webhook route that only stores and enqueues',
          lang: 'javascript',
          code: `app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).end();
  }
  // jobId = event id: the queue itself ignores duplicates
  await billingQueue.add(event.type, { event }, { jobId: event.id, attempts: 5, backoff: { type: 'exponential', delay: 5000 } });
  res.json({ received: true });
});`,
        },
      ],
      output: `The webhook route only verifies and enqueues, so it answers in milliseconds. A BullMQ worker runs \`processOnce\` + \`syncSubscription\` with retries. Each night, the reconciliation job walks all subscriptions; if any tenant's stored status drifted (for example a webhook failed for days), it re-syncs using the same function and logs a warning, so drift is both fixed and visible.`,
      questions: [
        {
          q: 'What is the source of truth for billing in your design?',
          a: 'Stripe for billing (subscriptions, invoices, payments). My DB holds a synced copy used for access checks, updated by webhooks and fixed by reconciliation.',
        },
        {
          q: 'What if your webhook endpoint was down for a day?',
          a: 'Stripe retries for days, so most events arrive later. The nightly reconciliation also re-syncs any drift. Handlers are idempotent so late or duplicate events are safe.',
        },
        {
          q: 'How do you prevent two upgrades at once for the same tenant?',
          a: 'Use idempotency keys per operation and a per-tenant lock around billing changes.',
        },
        {
          q: 'Why use a queue for webhooks?',
          a: 'To answer Stripe quickly, absorb spikes, retry failures with backoff, and dedupe by event id.',
        },
      ],
      spoken: `"In our multi-tenant HR SaaS, each tenant had one Stripe Customer, linked both ways through ids and metadata. All billing changes went through Stripe — Checkout, upgrades, add-ons, the portal — and never directly set the plan in our DB. Webhooks were verified, enqueued with the event id as the job id, and a worker re-fetched the subscription, computed entitlements from the items, and saved them. Access checks were local middleware. Usage was counted in Mongo and batched to Stripe. A nightly reconciliation job compared Stripe subscriptions with our DB and fixed any drift."`,
      mistakes: [
        'Letting the app write the plan directly ("set plan = pro") and then trying to make Stripe match — two sources of truth.',
        'No reconciliation job — a few missed events leave tenants on the wrong plan forever.',
        'Doing all work inside the webhook request, causing timeouts during traffic spikes.',
        'Follow-up trap: "What if Stripe is down?" Payments and upgrades fail gracefully with a retry message, but existing tenants keep working because access checks use your DB.',
      ],
      takeaway: 'Stripe is the billing truth; webhooks keep a local access copy; reconciliation catches drift.',
    },
    {
      id: 'stripe-vs-razorpay',
      title: 'Stripe vs Razorpay (India Context)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Stripe is strongest for global SaaS billing; Razorpay is strongest for Indian customers, UPI, netbanking and Indian mandate rules.',
      what: `Both are payment gateways with good APIs, but they shine in different places.

**Stripe**
- Best for **global** customers and multi-currency.
- Very rich **Billing**: subscriptions, proration, metering, test clocks, customer portal, invoices.
- Great docs, SDKs and developer tools.
- In India, Stripe has limited support for some local methods, and its availability for new Indian businesses has been restricted (invite-only since 2024) — check the current status before choosing it.

**Razorpay**
- Best for **Indian** customers: UPI (including AutoPay), netbanking, Indian wallets, RuPay, EMI.
- Built around Indian rules: RBI e-mandates, GST on fees, INR settlements.
- Order → payment → signature verification flow.
- Subscriptions exist but are simpler (less proration and metering support), so more billing logic lives in your app.

#### Deeper version
Many Indian SaaS companies use **both**: Razorpay for INR/domestic customers and Stripe for international customers. To keep this clean:
- Build a **payment provider abstraction** in your code (\`createCheckout\`, \`verifyWebhook\`, \`cancelSubscription\`) and store \`provider\` on each tenant.
- Keep **entitlements provider-agnostic** — both providers' webhooks feed the same \`computeEntitlements\`.
- Watch differences: amount units are both smallest unit, but webhook verification, statuses and retry behavior differ.
- Fees, settlement times and exact feature lists change — compare the current pricing pages before deciding.`,
      why: `Interviewers in India often ask "Why Stripe and not Razorpay?" or "How would you support both?". The right answer depends on where your customers are and how complex your billing is.`,
      analogy: `Stripe is like an international bank with excellent online services worldwide. Razorpay is like a strong local bank that knows every Indian payment habit — UPI, netbanking, local rules. A business with customers in both places often keeps an account in each.`,
      code: [
        {
          title: 'Provider abstraction for a SaaS that uses both',
          lang: 'typescript',
          code: `interface BillingProvider {
  createCheckout(tenant: Tenant, planKey: string): Promise<{ url?: string; orderId?: string }>;
  verifyWebhook(rawBody: Buffer, headers: Record<string, string>): BillingEvent;
  cancel(tenant: Tenant): Promise<void>;
}

const providers: Record<'stripe' | 'razorpay', BillingProvider> = {
  stripe: stripeProvider,
  razorpay: razorpayProvider,
};

// Choose per tenant: INR customers -> Razorpay, others -> Stripe
export function providerFor(tenant: Tenant): BillingProvider {
  return providers[tenant.billingCountry === 'IN' ? 'razorpay' : 'stripe'];
}

// Both webhooks end in the same entitlement logic
export async function onBillingEvent(e: BillingEvent) {
  await saveEntitlements(e.tenantId, computeEntitlementsFromPlan(e.planKey, e.addons));
}`,
        },
      ],
      output: `An Indian tenant clicking "Upgrade" gets a Razorpay order and pays with UPI; a US tenant gets a Stripe Checkout URL. Each provider has its own webhook route and verification, but both normalise events into one \`BillingEvent\` shape, so access control and entitlements work the same way regardless of provider.`,
      questions: [
        {
          q: 'When would you choose Razorpay over Stripe?',
          a: 'When most customers pay in INR and expect UPI, netbanking, RuPay and Indian mandates (UPI AutoPay, e-mandates).',
        },
        {
          q: 'When would you choose Stripe?',
          a: 'For international customers and complex SaaS billing — proration, metering, portal, test clocks, multi-currency.',
        },
        {
          q: 'How would you support both in one product?',
          a: 'A provider interface, a `provider` field per tenant, separate verified webhook routes, and one shared entitlements layer.',
        },
      ],
      spoken: `"I see Stripe as the strongest choice for global SaaS billing — subscriptions with proration, metering, test clocks and the customer portal are very mature. Razorpay is better for Indian customers because of UPI, AutoPay, netbanking, RuPay and built-in RBI mandate handling. Stripe's availability for new Indian businesses has also been limited, so that matters. For a product with both audiences, I'd add a small billing provider interface, store the provider per tenant, verify each provider's webhooks separately, and normalise everything into one entitlements layer so the rest of the app doesn't care who processed the payment."`,
      mistakes: [
        'Claiming one is "better" in general. It depends on customer location, payment methods and billing complexity.',
        'Spreading provider-specific code across the app instead of behind one interface.',
        'Stating exact fees or availability from memory — they change; check the current pricing and docs.',
        'Follow-up trap: "Can Stripe do UPI?" Support for UPI and Indian methods has been limited and has changed over time; check Stripe\'s current India docs rather than assuming.',
      ],
      takeaway: 'Stripe for global, complex billing; Razorpay for Indian payment methods — and an abstraction if you need both.',
    },
  ],
  rapidFire: [
    { q: 'Product vs Price in Stripe?', a: 'Product is what you sell; Price is the amount and interval. One Product can have many Prices.' },
    { q: 'Can you change the amount of a Stripe Price?', a: 'No. Prices are immutable for amount; create a new Price and migrate customers.' },
    { q: 'What unit are Stripe and Razorpay amounts in?', a: 'The smallest currency unit, as integers: ₹999 is `99900` paise.' },
    { q: 'Why use lookup_key on Prices?', a: 'So code uses stable names like `pro_monthly` instead of ids that differ between test and live mode.' },
    { q: 'Which Stripe key goes in the browser?', a: 'Only the publishable key (`pk_...`). The secret key stays on the server.' },
    { q: 'PaymentIntent in one line?', a: 'An object that tracks one payment attempt from creation to success, including 3D Secure.' },
    { q: 'SetupIntent in one line?', a: 'Saves and authenticates a payment method for later, without charging now.' },
    { q: 'Who decides the payment amount?', a: 'Always the server, from your own data — never the client.' },
    { q: 'Where do you mark an order as paid?', a: 'In a verified webhook (or a server-side verified callback), never on the success redirect page.' },
    { q: 'What are the three Checkout Session modes?', a: '`payment`, `subscription` and `setup`.' },
    { q: 'How do you pass your tenant id through Checkout?', a: '`client_reference_id` and/or `metadata`, plus the existing `customer` id.' },
    { q: 'What placeholder puts the session id in success_url?', a: '`{CHECKOUT_SESSION_ID}`.' },
    { q: 'Why does Stripe webhook verification need the raw body?', a: 'The HMAC signature is over the exact bytes; parsed and re-serialised JSON will not match.' },
    { q: 'Which function verifies Stripe webhooks in Node?', a: '`stripe.webhooks.constructEvent(rawBody, signatureHeader, endpointSecret)`.' },
    { q: 'What does a non-2xx webhook response cause?', a: 'Stripe retries the event with backoff, for up to about 3 days in live mode.' },
    { q: 'Are webhooks delivered exactly once?', a: 'No, at least once — expect duplicates and out-of-order events.' },
    { q: 'How do you dedupe webhook events?', a: 'Store the event id with a unique index and skip ids already processed.' },
    { q: 'How do you survive out-of-order events?', a: 'Re-fetch the object from the API and save its current state.' },
    { q: 'Main subscription webhook events?', a: '`checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`.' },
    { q: 'Which event warns that a trial is ending?', a: '`customer.subscription.trial_will_end`, about 3 days before.' },
    { q: 'Which event means a renewal needs 3DS?', a: '`invoice.payment_action_required`.' },
    { q: 'What does past_due mean?', a: 'A renewal payment failed and Stripe is retrying.' },
    { q: 'How do you cancel but keep access until the period ends?', a: 'Set `cancel_at_period_end: true`.' },
    { q: 'What does incomplete status mean?', a: 'The first payment is not done yet; it expires to `incomplete_expired` after about 23 hours.' },
    { q: 'Coupon vs promotion code?', a: 'Coupon is the discount rule; promotion code is the customer-facing code pointing to it with extra limits.' },
    { q: 'Coupon durations?', a: '`once`, `repeating` (with `duration_in_months`) and `forever`.' },
    { q: 'How do you enable promo codes in Checkout?', a: '`allow_promotion_codes: true`.' },
    { q: 'How do you sell add-ons in one subscription?', a: 'Add more subscription items, each with its own Price and quantity.' },
    { q: 'How is per-seat pricing modelled?', a: 'A per-seat Price with `quantity` equal to the number of seats.' },
    { q: 'proration_behavior options?', a: '`create_prorations` (default, next invoice), `always_invoice` (bill now), `none`.' },
    { q: 'Typical upgrade and downgrade policy?', a: 'Upgrade now with `always_invoice`; downgrade at period end (Subscription Schedule).' },
    { q: 'How do you preview an upgrade cost?', a: 'Preview the next invoice (`invoices.createPreview` in newer API versions) with a fixed `proration_date`.' },
    { q: 'Do you need a cron job for renewals?', a: 'No. Stripe creates and charges renewal invoices automatically.' },
    { q: 'What is dunning?', a: 'Recovering failed payments: retries, reminders, grace period, then restriction or cancellation.' },
    { q: 'Invoice statuses?', a: '`draft`, `open`, `paid`, `void`, `uncollectible`.' },
    { q: 'Refund vs credit note?', a: 'A refund returns money; a credit note adjusts a finalized invoice (with refund or account credit).' },
    { q: 'Can you refund a disputed charge?', a: 'No. The money is already pulled; respond to the dispute with evidence instead.' },
    { q: 'What is a chargeback?', a: 'The cardholder asks their bank to reverse a payment; you lose the amount plus a fee unless you win.' },
    { q: 'What does the Customer Portal do?', a: 'Stripe-hosted self-service: update cards, view invoices, change plans, cancel.' },
    { q: 'What are test clocks for?', a: 'Simulating time in test mode to test trials, renewals and retries quickly.' },
    { q: 'Current Stripe API for usage-based billing?', a: 'Billing Meters with meter events; the old usage records API was replaced — check current docs.' },
    { q: 'Where do you check plan limits at request time?', a: 'In your own DB/cache, using entitlements synced from webhooks.' },
    { q: 'How do you enforce a usage limit under concurrency?', a: 'An atomic conditional update: `count < limit` in the filter plus `$inc`.' },
    { q: 'What is an idempotency key?', a: 'A key that makes a retried write return the first result instead of repeating it.' },
    { q: 'What makes a good idempotency key?', a: 'A value tied to the business action (order id, operation id), reused on retries.' },
    { q: 'What is SCA?', a: 'Strong Customer Authentication — EU rule requiring two-factor checks, usually via 3D Secure.' },
    { q: 'What is AFA in India?', a: 'RBI\'s Additional Factor of Authentication — the OTP step on Indian card payments.' },
    { q: 'What is liability shift?', a: 'For 3DS-authenticated payments, fraud dispute losses usually move to the card issuer.' },
    { q: 'Which PCI questionnaire do Checkout/Elements usually keep you in?', a: 'SAQ A, because card data never touches your servers.' },
    { q: 'When do you need Stripe Connect?', a: 'When paying out money to third-party sellers or service providers.' },
    { q: 'First step of a Razorpay payment?', a: 'Create an Order on the server with amount in paise; pass `order_id` to Checkout.' },
    { q: 'Razorpay checkout signature formula?', a: 'HMAC-SHA256 of `order_id|payment_id` with the key secret, hex-encoded.' },
    { q: 'Razorpay webhook signature?', a: 'HMAC-SHA256 of the raw body with the webhook secret, compared to `X-Razorpay-Signature`.' },
    { q: 'Razorpay payment statuses?', a: '`created`, `authorized`, `captured`, `refunded`, `failed`.' },
    { q: 'Why is UPI status async?', a: 'The user approves in a separate UPI app, sometimes minutes later, so you wait for webhooks.' },
    { q: 'UPI intent vs collect?', a: 'Intent opens the UPI app directly; collect sends a request to a UPI ID (being restricted by NPCI).' },
    { q: 'What catches missed Razorpay webhooks?', a: 'A reconciliation job that fetches payments for stuck orders and fixes their status.' },
    { q: 'Which Razorpay event marks a subscription renewal?', a: '`subscription.charged`.' },
    { q: 'Stripe or Razorpay for an India-first SaaS?', a: 'Usually Razorpay for UPI/netbanking/mandates; Stripe for global customers and complex billing.' },
  ],
};
