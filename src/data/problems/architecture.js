// Interview problems for the Architecture & System Design stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'architecture',
  problems: [
    {
      id: 'back-of-envelope-photo-app',
      title: 'Back-of-the-envelope: storage and QPS for a photo app',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'system-design-approach',
      question: `Before designing anything, the interviewer asks you to **estimate the size** of a photo-sharing app (like a small Instagram):

- 10 million daily active users (DAU)
- 1 in 5 users uploads 1 photo per day
- Each user views about 50 photos per day
- An average photo is 500 KB after compression
- We keep photos for 5 years

Estimate: write QPS, read QPS (average and peak), storage per day, storage for 5 years, and daily bandwidth. Then say what these numbers **tell you** about the design.`,
      hints: [
        'A day has 86,400 seconds. Round it to 100,000 (10^5) for quick mental math.',
        'QPS = requests per day / seconds per day. Peak is usually 2-3x the average.',
        'Storage per day = uploads per day x size of one photo. Then multiply by 365 x 5.',
      ],
      solution: `**Idea:** turn "users" into "requests per second" and "bytes per day". Round hard. The goal is the right **order of magnitude** (10s vs 1,000s vs 100,000s), not exact numbers.

**Step by step (mental math):**

- Uploads per day = 10M x 0.2 = **2M**
- Write QPS = 2M / 10^5 = **~20/s** (peak ~3x = ~60/s)
- Views per day = 10M x 50 = **500M**
- Read QPS = 500M / 10^5 = **~5,000/s** (peak ~15,000/s)
- Read : write ratio = about **250 : 1**
- Photo storage per day = 2M x 500 KB = 1,000,000,000 KB = **~1 TB/day**
- 5 years = 1 TB x 365 x 5 = **~1.8 PB** (petabytes)
- Metadata (1 KB row per photo) = 2M x 1 KB x 1,825 days = **~3.6 TB** total
- Bandwidth out = 500M x 500 KB = **~250 TB/day** (this is why you need a CDN)

You can check it with a tiny script:

\`\`\`javascript
const DAU = 10_000_000;
const SECONDS_PER_DAY = 86_400;
const uploadsPerUserPerDay = 0.2;
const viewsPerUserPerDay = 50;
const avgPhotoKB = 500;
const metadataBytes = 1_000;
const peakFactor = 3;

const writesPerDay = DAU * uploadsPerUserPerDay;          // 2,000,000
const readsPerDay = DAU * viewsPerUserPerDay;              // 500,000,000
const writeQps = writesPerDay / SECONDS_PER_DAY;          // ~23
const readQps = readsPerDay / SECONDS_PER_DAY;            // ~5,787

console.log('write QPS', writeQps.toFixed(0), 'peak', (writeQps * peakFactor).toFixed(0)); // 23 / 69
console.log('read QPS', readQps.toFixed(0), 'peak', (readQps * peakFactor).toFixed(0));    // 5787 / 17361
console.log('storage/day GB', (writesPerDay * avgPhotoKB) / 1e6);                         // 1000
console.log('storage 5y TB', (writesPerDay * avgPhotoKB * 365 * 5) / 1e9);                // 1825
console.log('metadata 5y GB', (writesPerDay * metadataBytes * 365 * 5) / 1e9);            // 3650
console.log('egress/day TB', (readsPerDay * avgPhotoKB) / 1e9);                           // 250
\`\`\`

**What the numbers tell you (this is the part that scores points):**

- **Read-heavy (250:1).** Optimise reads: CDN for images, cache for feeds, read replicas for metadata.
- **Photos do not go in the database.** 1.8 PB belongs in object storage (S3 / GCS). The DB stores only the URL and metadata.
- **Metadata is small** (~3.6 TB over 5 years). One well-indexed database (plus replicas) can hold it for a long time. No need to shard on day one.
- **Write QPS is tiny** (~60/s at peak). A single primary DB handles that easily.
- **250 TB/day egress** is a cost problem. A CDN is not optional here.

**Handy numbers to remember:**

\`\`\`text
1 day          ~ 10^5 seconds (86,400)
1 million/day  ~ 12 per second
1 KB x 1M      = 1 GB
1 MB x 1M      = 1 TB
1 MB x 1B      = 1 PB
\`\`\``,
      followUps: [
        {
          q: 'How many servers do you need for 15,000 read QPS?',
          a: 'If one Node.js API server handles about 1,000-2,000 simple cached requests per second, you need roughly 10-15 servers, plus extra for failover. But most image reads hit the CDN, not your servers, so the API only serves metadata and feed requests.',
        },
        {
          q: 'Why not store photos in MongoDB with GridFS?',
          a: 'It works for small apps, but at petabyte scale it makes the database huge, backups slow and expensive, and every image read uses DB resources. Object storage is cheaper per GB, scales without limits, and plugs straight into a CDN.',
        },
        {
          q: 'How would you reduce storage cost?',
          a: 'Move old photos to cheaper storage classes (S3 Infrequent Access / Glacier) with lifecycle rules, store fewer resized versions, use modern formats like WebP/AVIF, and de-duplicate identical uploads by content hash.',
        },
      ],
    },
    {
      id: 'refactor-solid-order-service',
      title: 'Refactor a "god class" that breaks SOLID',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'solid-principles',
      question: `This class works, but the interviewer says it is "hard to test and hard to change". Name the SOLID principles it breaks and refactor it.

\`\`\`javascript
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

class OrderService {
  async placeOrder(order) {
    if (!order.items.length) throw new Error('Order has no items');

    // price calculation
    let total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    if (order.couponCode === 'SAVE10') total = total * 0.9;
    else if (order.couponCode === 'FLAT5') total = total - 5;
    // every new coupon = edit this if/else

    // save to DB
    const saved = await mongoose.model('Order').create({ ...order, total });

    // send email
    const transporter = nodemailer.createTransport({ host: 'smtp.example.com' });
    await transporter.sendMail({ to: order.email, subject: 'Order confirmed', text: 'Total: ' + total });

    return saved;
  }
}
\`\`\``,
      hints: [
        'Count the reasons this class might need to change: pricing rules, database, email provider...',
        'Every new coupon means editing an if/else. Which principle says "add new code instead of changing old code"?',
        'The class creates its own DB model and email transporter. How would you pass them in instead, so a test can use fakes?',
      ],
      solution: `**Idea:** split the class by "reason to change", turn coupon rules into small plug-in objects, and pass dependencies in through the constructor.

**What is wrong:**

- **S — Single Responsibility:** one class does validation, pricing, saving and emailing. A change to email templates and a change to discounts both touch this file.
- **O — Open/Closed:** every new coupon means editing the if/else. Easy to break old coupons.
- **D — Dependency Inversion:** it creates Mongoose and Nodemailer itself. You cannot unit-test it without a real DB and SMTP server, and you cannot swap SendGrid in without editing it.

**Refactored:**

\`\`\`javascript
// Each discount rule is its own class. New coupon = new class, no edits (OCP).
class PercentOffRule {
  constructor(code, percent) { this.code = code; this.percent = percent; }
  applies(order) { return order.couponCode === this.code; }
  discount(subtotal) { return subtotal * (this.percent / 100); }
}
class FlatOffRule {
  constructor(code, amount) { this.code = code; this.amount = amount; }
  applies(order) { return order.couponCode === this.code; }
  discount(subtotal) { return Math.min(this.amount, subtotal); } // never below 0
}

// Only job: work out the price (SRP)
class PriceCalculator {
  constructor(rules) { this.rules = rules; }
  total(order) {
    const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const rule = this.rules.find((r) => r.applies(order));
    return subtotal - (rule ? rule.discount(subtotal) : 0);
  }
}

// Only job: coordinate the steps. Depends on "shapes", not libraries (DIP).
class OrderService {
  constructor({ orderRepo, calculator, notifier }) {
    this.orderRepo = orderRepo;   // anything with save(order)
    this.calculator = calculator; // anything with total(order)
    this.notifier = notifier;     // anything with orderPlaced(order)
  }
  async placeOrder(order) {
    if (!order.items.length) throw new Error('Order has no items');
    const saved = await this.orderRepo.save({ ...order, total: this.calculator.total(order) });
    await this.notifier.orderPlaced(saved);
    return saved;
  }
}

// Real implementations live at the edges
class MongoOrderRepo {
  constructor(collection) { this.collection = collection; }
  async save(order) {
    const { insertedId } = await this.collection.insertOne(order);
    return { ...order, id: insertedId };
  }
}
class EmailNotifier {
  constructor(mailer) { this.mailer = mailer; }
  orderPlaced(order) {
    return this.mailer.send(order.email, 'Order confirmed', 'Total: ' + order.total);
  }
}

// Test with fakes: no database, no email server
const sent = [];
const service = new OrderService({
  orderRepo: { save: async (o) => ({ ...o, id: 'ord_1' }) },
  calculator: new PriceCalculator([new PercentOffRule('SAVE10', 10), new FlatOffRule('FLAT5', 5)]),
  notifier: { orderPlaced: async (o) => sent.push(o.id) },
});
service
  .placeOrder({ email: 'a@b.com', couponCode: 'SAVE10', items: [{ price: 50, qty: 2 }] })
  .then((o) => console.log(o.id, o.total, sent)); // ord_1 90 [ 'ord_1' ]
\`\`\`

**Why it is better:**

- New coupon type? Add a class and put it in the rules list. \`PriceCalculator\` does not change.
- Switch to SendGrid? Write a new notifier. \`OrderService\` does not change.
- The test above runs in milliseconds with plain objects as fakes.
- The wiring (which real classes to use) happens once, at app start-up (the "composition root").`,
      followUps: [
        {
          q: 'Is this over-engineering for a small app?',
          a: 'It can be. A good answer: start simple, and split when you feel the pain (a second coupon type, a second email provider, slow tests). SOLID is a tool for code that changes often, not a rule to apply everywhere on day one.',
        },
        {
          q: 'Where does Liskov Substitution show up here?',
          a: 'Any rule must be usable wherever a rule is expected. If `FlatOffRule.discount` returned a negative total or threw for some orders, it would break callers that trust the shape. That is why it clamps with `Math.min`.',
        },
        {
          q: 'Should the email be sent inside placeOrder at all?',
          a: 'Better: placeOrder saves the order and emits an "OrderPlaced" event (ideally via an outbox). A separate worker sends the email. Then a slow or failing SMTP server cannot fail the checkout.',
        },
      ],
    },
    {
      id: 'database-is-the-bottleneck',
      title: 'The database is the bottleneck. What do you do, in what order?',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'database-scaling',
      question: `Your Node.js + MongoDB (or Postgres) API has grown. At peak, DB CPU is at 95%, p95 latency went from 80 ms to 2 s, and the team lead says "let's shard the database".

Before you agree: what would you check and try **first**, and in **what order**? When is sharding actually the right move?`,
      hints: [
        'Start with the cheapest, least risky fixes. Is the DB doing unnecessary work?',
        'Look at slow query logs and `explain()` plans. Missing indexes are the most common cause.',
        'Reads and writes need different fixes: reads -> caching and replicas; writes -> batching, queues, then sharding.',
      ],
      solution: `**Idea:** measure first, then fix in order of **cost and risk**. Sharding is the last step, not the first, because it is expensive and very hard to undo.

**The order:**

1. **Measure.** Turn on the slow query log / MongoDB profiler / \`pg_stat_statements\`. Find the top 5 queries by total time (count x average time). Usually a few queries cause most of the load.
2. **Fix the queries.**
   - Add the **right indexes** (check with \`explain()\` — look for COLLSCAN / Seq Scan). Compound indexes in the order: equality fields, then sort field, then range.
   - Remove **N+1 queries** (a loop that runs one query per item). Batch with \`$in\` or a join.
   - Select only needed fields. Add pagination (cursor based, not big \`skip\`).
3. **Fix connections.** Too many connections can kill a DB. Use a connection pool with a sensible size; for Postgres + serverless use PgBouncer / RDS Proxy.
4. **Cache hot reads.** Redis with cache-aside for data that is read often and changes rarely (product pages, settings, counts). Often cuts DB reads by 70-90%.
5. **Read replicas.** Send read-only queries (reports, dashboards, listing pages) to replicas. Accept a little replication lag for those screens.
6. **Scale up (vertical).** A bigger instance is boring but fast and safe. Buys months.
7. **Move work off the request path.** Heavy writes, analytics and exports go through a queue and workers. Archive old data. Partition big tables by date.
8. **Shard (last).** Only when **writes** or **data size** are too big for the biggest single machine you can buy.

\`\`\`text
cost / risk  low ------------------------------------------------> high
             measure -> indexes -> pooling -> cache -> replicas -> bigger box -> queues/archive -> shard
\`\`\`

**Why sharding is last:** you must pick a shard key (hard to change later), cross-shard queries and transactions become hard, re-balancing is painful, and operations get more complex. Most apps never need it.

**When sharding IS right:** write QPS beyond one primary even after tuning, or data that will not fit on one node, or a natural key (like \`tenantId\`) where most queries stay inside one shard.`,
      followUps: [
        {
          q: 'How do you choose a shard key?',
          a: 'High cardinality (many different values), even spread of reads and writes, and present in most queries so they hit one shard. `tenantId` or `userId` are common. Avoid monotonically increasing keys like timestamps or ObjectIds as a range key, because all new writes go to one "hot" shard.',
        },
        {
          q: 'What problem do read replicas add?',
          a: 'Replication lag. A user saves a profile and the next read (from a replica) shows the old value. Fix: "read your own writes" — send that user\'s reads to the primary for a few seconds after a write, or for that specific screen.',
        },
        {
          q: 'Can too many indexes hurt?',
          a: 'Yes. Every index slows down writes (it must be updated too) and uses RAM. Remove unused indexes and prefer a few compound indexes that serve several queries.',
        },
      ],
    },
    {
      id: 'spot-flaws-naive-design',
      title: 'Spot the flaws in this naive e-commerce design',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'scalability-basics',
      question: `A junior engineer drew this design for an online store expected to handle **5,000 requests/second** at sale time. Find as many problems as you can and suggest a fix for each.

\`\`\`text
 Users
   |
   v
+-----------------------------------------+
|  ONE Node.js server (EC2)                |
|  - Express API                           |
|  - sessions stored in memory             |
|  - product images saved to local disk    |
|  - sends order emails inside the request |
|  - nightly report cron job               |
+-----------------------------------------+
   |
   v
+----------------------+
|  ONE MongoDB server  |
|  no backups          |
+----------------------+
\`\`\``,
      hints: [
        'Ask "what happens if this one box dies?" for every box.',
        'If you add a second Node server, what breaks? (think about sessions and the local disk)',
        'Which work does NOT need to happen while the user waits for the response?',
      ],
      solution: `**Idea:** go box by box and ask three questions: what if it dies (availability), what if traffic grows 10x (scalability), what if data is lost (durability).

**Flaws and fixes:**

1. **Single point of failure (one server).** If it crashes or you deploy, the store is down.
   Fix: 2+ servers in different availability zones behind a **load balancer** (ALB), with auto-scaling.
2. **Sessions in memory.** With 2+ servers, a user logged in on server A is "logged out" on server B. A restart logs everyone out.
   Fix: make servers **stateless** — store sessions in Redis, or use JWTs.
3. **Images on local disk.** Other servers cannot see them, disk fills up, data lost if the instance dies.
   Fix: upload to **S3** (with presigned URLs) and serve through a **CDN**.
4. **Email sent inside the request.** A slow SMTP server makes checkout slow or fail.
   Fix: put a job on a **queue** (SQS / BullMQ); a worker sends the email with retries.
5. **Cron job on the API server.** With 3 servers it runs 3 times. It also steals CPU from user requests.
   Fix: run it as a separate scheduled worker (one instance, or a lock), ideally against a read replica.
6. **One MongoDB, no backups.** One disk failure = all orders lost forever.
   Fix: a **replica set** (3 nodes, automatic failover) + automated daily backups with point-in-time recovery, and test restores.
7. **No caching.** 5,000 req/s of mostly product reads all hit the DB.
   Fix: CDN for static pages/images, Redis cache for product data.
8. **Missing basics:** no health checks, no monitoring/alerts, no rate limiting, secrets probably in code.

**Improved design:**

\`\`\`text
 Users -> CDN (images, static JS/CSS)
   |
   v
 Load balancer (ALB)
   |            |
 API #1  ...  API #N      (stateless, auto-scaling, multi-AZ)
   |   |          |
   |  Redis (sessions + cache)
   |
   +--> Queue (SQS/BullMQ) --> Workers (emails, reports)
   |
 MongoDB replica set (primary + 2 secondaries, backups)
   |
 S3 (product images)
\`\`\``,
      followUps: [
        {
          q: 'Which fix would you do first if you only had one day?',
          a: 'Backups (data loss is permanent), then a second server behind a load balancer with sessions moved to Redis. Downtime hurts, but lost orders are far worse.',
        },
        {
          q: 'How does the load balancer know a server is unhealthy?',
          a: 'Health checks: it calls something like `GET /health` every few seconds. If it fails a few times in a row, the LB stops sending traffic there. Keep the check cheap, and decide carefully whether it should fail when the DB is down (otherwise all servers may be pulled at once).',
        },
      ],
    },
    {
      id: 'design-game-leaderboard',
      title: 'Design a real-time leaderboard',
      difficulty: 'easy',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'caching-strategies',
      question: `Design the leaderboard for a mobile quiz game.

- 5 million players, about 2,000 score updates per second at peak
- Show the **top 100** players
- Show **"your rank"** for any player (for example "You are #48,213")
- Show players just above and below you
- A weekly leaderboard that resets every Monday

Why is \`SELECT ... ORDER BY score DESC\` on every request a bad idea, and what would you use instead?`,
      hints: [
        'Sorting 5 million rows on every request is slow. Is there a data structure that keeps items sorted all the time?',
        'Redis has a "sorted set" (ZSET). Look at ZADD, ZINCRBY, ZREVRANK and ZREVRANGE.',
        'For the weekly board, think about using a different key per week instead of deleting data.',
      ],
      solution: `**Idea:** keep the ranking in a **Redis sorted set**. It stays sorted on every write, so "top 100" and "my rank" are O(log N) instead of sorting millions of rows. The real database stays the source of truth.

**Requirements:** fast rank reads, high write rate, top-N, "around me", weekly reset. Rank can be a second or two stale; scores must never be lost.

**API:**

\`\`\`text
POST /scores                       { playerId, points }   -> 202
GET  /leaderboard/weekly?limit=100                        -> top 100
GET  /leaderboard/weekly/me                               -> { rank, score, neighbours[] }
\`\`\`

**Data model:**

- **Database (source of truth):** \`scores { playerId, week, totalScore, updatedAt }\` — and/or an append-only log of score events.
- **Redis sorted set** per board: key \`lb:weekly:2026-W41\`, member = playerId, score = points.

**Redis commands:**

\`\`\`text
ZINCRBY  lb:weekly:2026-W41  50  player:123        # add 50 points       O(log N)
ZREVRANGE lb:weekly:2026-W41 0 99 WITHSCORES       # top 100             O(log N + 100)
ZREVRANK lb:weekly:2026-W41  player:123            # my rank (0-based)   O(log N)
ZREVRANGE lb:weekly:2026-W41 (rank-5) (rank+5)     # 5 above, 5 below
EXPIRE   lb:weekly:2026-W41  1209600               # keep 2 weeks, then auto-delete
\`\`\`

**Architecture:**

\`\`\`text
Game client -> API (Node) --> Redis ZSET  (rankings, fast reads)
                   |
                   +--> Queue --> Worker --> MongoDB/Postgres (durable scores)
\`\`\`

**Key decisions and trade-offs:**

- **Weekly reset without a big delete:** use a new key per week (\`2026-W41\`, \`2026-W42\`). Monday = just start writing to the new key. Old keys expire.
- **Memory:** 5M members x roughly 100 bytes = ~500 MB. Fits easily in one Redis node.
- **Durability:** if Redis is lost, rebuild the set from the database (stream all scores and ZADD them). Use Redis persistence (AOF) or a managed service with replicas to make that rare.
- **Ties:** sorted sets order equal scores by member name. If "first to reach the score wins", encode time into the score, e.g. \`score * 1e10 + (maxTs - ts)\` (keep it below 2^53 so it stays exact).
- **Write spikes:** 2,000 ZINCRBY/s is easy for Redis (it does 100k+ ops/s). Writes to the DB go through a queue so the DB is not hammered.

**Scaling:** for hundreds of millions of players or many boards, split by board/region (one set per country or league), or keep exact ranks only for the top N and show "top 10%" style buckets for everyone else.`,
      followUps: [
        {
          q: 'How would you build a "friends only" leaderboard?',
          a: 'Friends lists are small (say 200). Fetch the friends\' scores with ZMSCORE (or a pipeline of ZSCORE) and sort them in the API. No need for a separate sorted set per user.',
        },
        {
          q: 'How do you stop cheaters posting fake scores?',
          a: 'Never trust the client score. The server should calculate points from validated game events, rate limit submissions, and flag impossible jumps for review.',
        },
      ],
    },
    {
      id: 'payment-provider-factory-repository',
      title: 'Switch payment providers with Factory + Repository',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'design-patterns',
      question: `Your app calls the Stripe SDK directly from 14 different files (controllers, cron jobs, webhooks). The business now wants **Razorpay for Indian customers** and Stripe for everyone else, and maybe PayPal next year. Payments are also saved with raw Mongoose calls all over the code.

Refactor the design so that:

1. Business code never imports a payment SDK directly.
2. Adding a new provider means adding **one new class**, not editing 14 files.
3. A refund always goes to the provider that took the original payment.
4. The payment logic can be unit-tested without Stripe or MongoDB.

Write the core classes.`,
      hints: [
        'Define your OWN interface, for example charge() and refund(), and write one "adapter" class per provider that implements it.',
        'One function (the factory) decides which adapter to create from a name like "stripe" or "razorpay".',
        'Put all database access for payments behind a PaymentRepository. Store which provider was used on each payment.',
      ],
      solution: `**Idea:** three patterns together. **Adapter** classes wrap each SDK behind our own small interface. A **Factory** picks the adapter by name. A **Repository** hides how payments are stored. The service only talks to these abstractions.

\`\`\`javascript
// Our own contract (not Stripe's):
//   charge({ amountCents, currency, customerRef, idempotencyKey }) -> { providerId, status }
//   refund({ providerId, amountCents }) -> { status }

// --- Adapters: translate our contract into each SDK ---
class StripeGateway {
  constructor(stripe) { this.stripe = stripe; }
  async charge({ amountCents, currency, customerRef, idempotencyKey }) {
    const pi = await this.stripe.paymentIntents.create(
      { amount: amountCents, currency, customer: customerRef, confirm: true },
      { idempotencyKey }                       // safe to retry
    );
    return { providerId: pi.id, status: pi.status === 'succeeded' ? 'paid' : 'pending' };
  }
  async refund({ providerId, amountCents }) {
    await this.stripe.refunds.create({ payment_intent: providerId, amount: amountCents });
    return { status: 'refunded' };
  }
}

class RazorpayGateway {
  constructor(razorpay) { this.razorpay = razorpay; }
  async charge({ amountCents, currency, customerRef, idempotencyKey }) {
    const p = await this.razorpay.charge({
      amount: amountCents, currency, customer_id: customerRef, receipt: idempotencyKey,
    });
    return { providerId: p.id, status: p.status === 'captured' ? 'paid' : 'pending' };
  }
  async refund({ providerId, amountCents }) {
    await this.razorpay.refund(providerId, { amount: amountCents });
    return { status: 'refunded' };
  }
}

// --- Factory: the ONLY place that knows which class to build ---
function createPaymentGateway(name, clients) {
  const builders = {
    stripe: () => new StripeGateway(clients.stripe),
    razorpay: () => new RazorpayGateway(clients.razorpay),
    // paypal: () => new PayPalGateway(clients.paypal),   <- next year: one line + one class
  };
  const build = builders[name];
  if (!build) throw new Error('Unknown payment provider: ' + name);
  return build();
}

// --- Repository: the ONLY place that knows how payments are stored ---
class PaymentRepository {
  constructor(collection) { this.collection = collection; }
  findByOrderId(orderId) { return this.collection.findOne({ orderId }); }
  save(payment) {
    return this.collection.updateOne({ orderId: payment.orderId }, { $set: payment }, { upsert: true });
  }
}

// --- Service: business rules only. No SDK, no Mongo code. ---
class PaymentService {
  constructor({ gatewayFor, paymentRepo }) {
    this.gatewayFor = gatewayFor;     // (providerName) => gateway
    this.paymentRepo = paymentRepo;
  }

  async payForOrder(order, providerName) {
    const existing = await this.paymentRepo.findByOrderId(order.id);
    if (existing && existing.status === 'paid') return existing;   // already paid: safe retry

    const result = await this.gatewayFor(providerName).charge({
      amountCents: order.totalCents,
      currency: order.currency,
      customerRef: order.customerRef,
      idempotencyKey: 'order-' + order.id,
    });
    const payment = { orderId: order.id, provider: providerName, ...result };
    await this.paymentRepo.save(payment);     // remember WHICH provider was used
    return payment;
  }

  async refundOrder(orderId) {
    const payment = await this.paymentRepo.findByOrderId(orderId);
    if (!payment) throw new Error('No payment for order ' + orderId);
    // Use the provider that took the money, not today's default
    const result = await this.gatewayFor(payment.provider).refund({ providerId: payment.providerId });
    await this.paymentRepo.save({ ...payment, status: result.status });
    return result;
  }
}

// --- Wiring (composition root, once at start-up) ---
// const clients = { stripe: new Stripe(process.env.STRIPE_KEY), razorpay: new Razorpay({...}) };
// const paymentService = new PaymentService({
//   gatewayFor: (name) => createPaymentGateway(name, clients),
//   paymentRepo: new PaymentRepository(db.collection('payments')),
// });
// Choosing the provider is a business rule:
// const provider = customer.country === 'IN' ? 'razorpay' : 'stripe';
\`\`\`

**Why it works:**

- Business code depends on \`charge/refund\`, never on an SDK. Swapping or adding a provider touches only the adapter + one line in the factory.
- The payment record stores \`provider\`, so refunds go back to the right place even after the default changes.
- Tests pass fake clients and a fake collection (plain objects with \`findOne/updateOne\`). No network, no DB.
- The idempotency key (\`order-<id>\`) means a retried request will not charge twice.`,
      followUps: [
        {
          q: 'Webhooks look different for each provider. Where do they fit?',
          a: 'Give each adapter a `parseWebhook(rawBody, headers)` method that verifies the signature and returns OUR event shape, like `{ type: "payment.succeeded", providerId }`. One webhook route per provider calls the right adapter, then shared code handles the normalised event.',
        },
        {
          q: 'What is the difference between this and the Strategy pattern?',
          a: 'Very close. Each gateway is a "strategy" for taking payments, picked at runtime. The factory is just how we create the right strategy. In interviews it is fine to say "strategy + factory".',
        },
        {
          q: 'Is the repository pointless with Mongoose already being an abstraction?',
          a: 'Mongoose hides the driver, but not the database. A repository gives you domain-shaped methods (findByOrderId) in one place, so query logic is not copied everywhere and tests can swap it for an in-memory fake.',
        },
      ],
    },
    {
      id: 'service-b-is-down',
      title: 'Service A calls Service B, and B is down',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'circuit-breaker',
      question: `Your **Product Page service (A)** calls the **Recommendations service (B)** over HTTP on every request. Last night B became very slow (10-30 s responses) and then started returning 500s. Within minutes, **A also went down**, even though A's own code was fine.

1. Explain why A went down too.
2. What would you change so that B failing does not take A down?
3. Implement a simple circuit breaker in Node.js.`,
      hints: [
        'With no timeout, each request to A waits for B. What happens to A\'s open connections, memory and threads/event loop queue?',
        'Three tools: timeouts, retries with backoff (careful!), and a circuit breaker that stops calling B for a while.',
        'Recommendations are "nice to have". What could A show instead when B is unavailable?',
      ],
      solution: `**Idea:** A died from a **cascading failure**. Protect A with a short **timeout**, a **circuit breaker** that fails fast while B is unhealthy, and a **fallback** so the page still works.

**1. Why A went down:**

- No timeout -> each request to A waited up to 30 s for B.
- Requests piled up: open sockets, memory and pending promises grew until A ran out of resources (or hit the load balancer's max connections).
- Retries made it worse: A retried failed calls, sending **more** traffic to a service that was already struggling (a "retry storm").
- Health checks on A started failing, so the load balancer pulled A's instances. Now the whole product page is down.

**2. The fixes:**

- **Timeout** on every outbound call (for example 300-800 ms for B, based on its normal p99).
- **Retries** only for safe (idempotent) calls, max 1-2, with **exponential backoff + jitter**.
- **Circuit breaker:** after N failures, stop calling B for a cool-down period and fail instantly.
- **Fallback:** show cached recommendations, or a "popular items" list, or just hide the widget.
- **Bulkhead:** limit how many concurrent calls A makes to B (e.g. max 50), so B can only use a small part of A's capacity.
- **Async where possible:** precompute recommendations into a cache/DB so the page does not need B live at all.

**3. Circuit breaker:**

\`\`\`text
           failures >= threshold
 CLOSED  ------------------------->  OPEN  (fail fast, do not call B)
   ^                                   |
   |  test call succeeds               | cool-down time passed
   +-------------  HALF_OPEN  <--------+
                     |
                     +-- test call fails --> OPEN again
\`\`\`

\`\`\`javascript
class CircuitBreaker {
  constructor(fn, { failureThreshold = 5, resetTimeoutMs = 30_000, timeoutMs = 2_000 } = {}) {
    this.fn = fn;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.timeoutMs = timeoutMs;
    this.state = 'CLOSED';   // CLOSED = normal, OPEN = fail fast, HALF_OPEN = testing
    this.failures = 0;
    this.openedAt = 0;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt < this.resetTimeoutMs) {
        throw new Error('Circuit open: failing fast');   // do not even try B
      }
      this.state = 'HALF_OPEN';                           // cool-down over: allow a test call
    }
    try {
      const result = await this.withTimeout(this.fn(...args));
      this.failures = 0;
      this.state = 'CLOSED';                              // success closes the circuit
      return result;
    } catch (err) {
      this.failures++;
      if (this.state === 'HALF_OPEN' || this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        this.openedAt = Date.now();
      }
      throw err;
    }
  }

  withTimeout(promise) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Timeout')), this.timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }
}

// Usage in service A
const recsBreaker = new CircuitBreaker(
  (userId) => fetch('http://recs/users/' + userId).then((r) => {
    if (!r.ok) throw new Error('Recs returned ' + r.status);
    return r.json();
  }),
  { failureThreshold: 5, resetTimeoutMs: 30_000, timeoutMs: 500 }
);

async function getRecommendations(userId) {
  try {
    return await recsBreaker.call(userId);
  } catch (err) {
    return getPopularItemsFromCache();   // fallback: the page still renders
  }
}
\`\`\`

**Why it works:** while the circuit is OPEN, A answers in microseconds with the fallback instead of waiting on B. That protects A's resources **and** gives B room to recover, because A stops sending it traffic. In production, use a library like **opossum** (Node) or a service mesh (Istio/Envoy) instead of hand-rolling it.`,
      followUps: [
        {
          q: 'What is wrong with the HALF_OPEN state in this simple version?',
          a: 'Many concurrent requests can all see HALF_OPEN and all hit B at once. Real libraries allow only one (or a few) test calls and fail the rest fast until the test call finishes.',
        },
        {
          q: 'What if B is critical, like the payment service?',
          a: 'You cannot fake a payment. Fail fast with a clear error ("Payments are temporarily unavailable, try again"), or accept the order and process payment asynchronously from a queue once B is back — if the business allows it.',
        },
        {
          q: 'Why add jitter to retry backoff?',
          a: 'Without jitter, thousands of clients that failed at the same moment retry at the same moment too, creating waves of load. Random jitter spreads the retries out.',
        },
      ],
    },
    {
      id: 'dual-write-to-outbox',
      title: 'Find the dual-write bug (and fix it with an outbox)',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'outbox-pattern',
      question: `This order endpoint saves the order and then publishes an event so that the Inventory, Email and Analytics services can react. It "works on my machine". What can go wrong in production, and how do you fix it properly?

\`\`\`javascript
app.post('/orders', async (req, res) => {
  const order = await Order.create(req.body);              // 1. write to MongoDB

  await broker.publish('OrderPlaced', {                    // 2. publish to Kafka / SQS / RabbitMQ
    orderId: order._id,
    items: order.items,
  });

  res.status(201).json(order);
});
\`\`\``,
      hints: [
        'There are two separate systems here (DB and broker). What if the process crashes between step 1 and step 2?',
        'What if you swap the order: publish first, then save? Does that fix it?',
        'Can you write the event into the SAME database, in the SAME transaction as the order, and publish it later?',
      ],
      solution: `**Idea:** this is the **dual-write problem**: two writes to two different systems cannot be atomic. Fix it with the **transactional outbox**: save the event in the same DB transaction as the order, and let a separate relay publish it.

**What can go wrong:**

- **Crash or broker outage after step 1:** the order exists but no event is ever sent. Inventory is never reduced, no email, analytics are wrong. Silent data loss.
- **Swap the order (publish first):** if the DB insert then fails, other services react to an order that does not exist. Just as bad.
- **"Wrap it in try/catch and retry":** the process can still die between the two lines (deploy, OOM, pod killed).

**The fix — transactional outbox:**

\`\`\`text
 POST /orders
     |
     v
 +---------------- one DB transaction ----------------+
 |  insert into orders     insert into outbox (event) |
 +-----------------------------------------------------+
                               |
              Relay worker polls (or uses change streams / CDC)
                               |
                               v
                 Broker (Kafka / SQS / RabbitMQ)  -->  Inventory, Email, Analytics
\`\`\`

\`\`\`javascript
// 1) In the request: write the order AND the event in ONE transaction
app.post('/orders', async (req, res) => {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      [order] = await Order.create([req.body], { session });
      await Outbox.create([{
        type: 'OrderPlaced',
        payload: { orderId: order._id, items: order.items },
        createdAt: new Date(),
        publishedAt: null,
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json(order);
});

// 2) Relay worker (separate process): publish unsent events, then mark them sent
async function relayOnce() {
  const events = await Outbox.find({ publishedAt: null }).sort({ createdAt: 1 }).limit(100);
  for (const event of events) {
    await broker.publish(event.type, event.payload, { messageId: String(event._id) });
    await Outbox.updateOne({ _id: event._id }, { $set: { publishedAt: new Date() } });
  }
  return events.length;
}
setInterval(() => relayOnce().catch(console.error), 1000);
\`\`\`

**Why it works:** the order and the event are committed together or not at all. If the broker is down, events wait safely in the outbox and the relay retries later.

**The catch — at-least-once delivery:** if the relay crashes after publishing but before marking \`publishedAt\`, the event is sent **again**. So consumers must be **idempotent**: store processed event ids (the \`messageId\`) and skip duplicates.

**Notes:**

- MongoDB transactions need a replica set (Atlas always has one).
- Instead of polling you can use **MongoDB change streams** or **Debezium (CDC)** on Postgres to stream outbox rows.
- Add an index on \`{ publishedAt: 1, createdAt: 1 }\` and clean up old published rows (TTL index).`,
      followUps: [
        {
          q: 'How do you keep the order of events per order?',
          a: 'Publish with a partition/group key = orderId (Kafka partition key, SQS FIFO MessageGroupId). Run a single relay, or shard relays by key, so events for one order are published in createdAt order.',
        },
        {
          q: 'What if two relay instances run at the same time?',
          a: 'They may publish the same event twice. Either run one relay with leader election, or have each relay "claim" rows atomically (findOneAndUpdate setting `claimedBy` and `claimedAt`). Idempotent consumers make the occasional duplicate harmless anyway.',
        },
        {
          q: 'Outbox vs Saga — how are they related?',
          a: 'The outbox makes sure each step\'s event is reliably published. A saga uses those events to run a multi-step business process across services, with compensating actions when a step fails. Sagas usually rely on outboxes underneath.',
        },
      ],
    },
    {
      id: 'cache-stampede-after-deploy',
      title: 'The database melts every time you deploy',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'caching-strategies',
      question: `Your Node.js API uses Redis as a cache (cache-aside, TTL 5 minutes) in front of MongoDB. Normally the DB sits at 20% CPU.

But every deploy, the deploy script runs \`FLUSHALL\` "to avoid stale data", and for the next 2-3 minutes the DB hits 100% CPU, latency spikes to 10 s, and some requests time out. A smaller version of the same spike happens at random times during the day for very popular product pages.

What is happening? Give at least three fixes and write code for one of them.`,
      hints: [
        'When the cache is empty, how many requests for the SAME hot key go to the DB at the same moment?',
        'Do all keys that were cached together also expire together?',
        'Can the second, third... thousandth request wait for the first request\'s DB result instead of querying again?',
      ],
      solution: `**Idea:** this is a **cache stampede** (also called "thundering herd" or "dog-piling"). When a hot key is missing, **every** concurrent request misses at the same time and they all hit the DB for the same data.

**Why it happens here:**

- \`FLUSHALL\` makes **every** key cold at once -> the whole traffic load lands on the DB.
- Keys that were filled at the same time with the same TTL **expire at the same time** -> smaller stampedes later.
- A popular product page with 2,000 req/s: when its key expires, maybe 200 requests miss before the first one refills the cache.

**Fixes (use several):**

1. **Do not flush the whole cache on deploy.** Use **versioned keys** (\`v42:product:123\`) when the data shape changes, so old keys just age out. Invalidate specific keys when the data actually changes (on write).
2. **Request coalescing / single-flight:** only one request loads a missing key; the others wait for its result.
3. **TTL jitter:** add a random +/- 10% to TTLs so keys do not expire together.
4. **Distributed lock** (Redis \`SET key NX PX 5000\`) so only one instance across the whole fleet rebuilds a key; others serve slightly stale data or wait briefly.
5. **Stale-while-revalidate / early refresh:** keep a "soft" expiry. After it, serve the stale value and refresh in the background.
6. **Warm the cache** for the top N hot keys before sending traffic to new instances.

**Code — single-flight + jitter (per process):**

\`\`\`javascript
const inFlight = new Map(); // key -> Promise of the value being loaded

async function getWithSingleFlight(key, cache, loadFromDb, ttlSeconds = 300) {
  const cached = await cache.get(key);
  if (cached !== null && cached !== undefined) return cached;

  // Another request in this process is already loading this key -> share its result
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    try {
      const value = await loadFromDb(key);
      // Jitter: 300s +/- 10%, so keys filled together do not expire together
      const jitter = Math.floor(ttlSeconds * 0.1 * (Math.random() * 2 - 1));
      await cache.set(key, value, ttlSeconds + jitter);
      return value;
    } finally {
      inFlight.delete(key); // clean up even if the DB call failed
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

// Test: 1,000 concurrent requests for a cold key -> only 1 DB query
const store = new Map();
const cache = { get: async (k) => store.get(k), set: async (k, v) => store.set(k, v) };
let dbCalls = 0;
const loadFromDb = async (k) => {
  dbCalls++;
  await new Promise((r) => setTimeout(r, 50));
  return 'value-of-' + k;
};
Promise.all(Array.from({ length: 1000 }, () => getWithSingleFlight('product:42', cache, loadFromDb)))
  .then(() => console.log('db calls:', dbCalls)); // db calls: 1
\`\`\`

**Why it works:** the first request stores its Promise in the map; every other request for that key gets the same Promise. With 20 API instances, the DB sees at most 20 queries for a hot key instead of thousands. Add a Redis lock if even that is too many.`,
      followUps: [
        {
          q: 'Single-flight works per process. What about 50 instances?',
          a: 'Use a Redis lock: `SET lock:product:42 <id> NX PX 5000`. The winner loads from the DB and fills the cache. Others either return the stale value (if you keep one) or poll the cache for a short time.',
        },
        {
          q: 'How do you avoid serving stale data after a product price changes?',
          a: 'Invalidate on write: when the price is updated, delete (or overwrite) that product\'s cache key in the same code path, ideally triggered by an event so every writer does it. TTL is only the safety net.',
        },
      ],
    },
    {
      id: 'implement-consistent-hashing',
      title: 'Implement consistent hashing for a cache cluster',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'consistent-hashing',
      question: `You have 3 Redis cache servers. Today the app picks a server with \`hash(key) % 3\`. When you add a 4th server, almost every key suddenly maps to a different server, the cache becomes useless, and the database gets hammered.

1. Explain why \`% N\` causes this.
2. Implement a \`HashRing\` class with \`addNode(name)\`, \`removeNode(name)\` and \`getNode(key)\`.
3. Show that adding a 4th server moves only about 1/4 of the keys.`,
      hints: [
        'Picture a circle of hash values. Put each server at a point on the circle. A key belongs to the first server you meet going clockwise.',
        'Keep the server positions in a sorted array and use binary search to find "the next one clockwise".',
        'With only 3 points the circle is uneven. Put each server on the circle many times ("virtual nodes").',
      ],
      solution: `**Idea:** place servers and keys on the same circle of hash values. A key goes to the next server clockwise. Adding a server only "steals" the keys between it and its neighbour, so only about **1/N** of keys move, instead of almost all of them.

**Why \`% N\` is bad:** \`hash % 3\` and \`hash % 4\` give different answers for about 75% of keys. Changing N reshuffles almost everything.

\`\`\`javascript
const crypto = require('node:crypto');

// Hash a string to a 32-bit number (first 8 hex chars of md5)
function hash(key) {
  return parseInt(crypto.createHash('md5').update(key).digest('hex').slice(0, 8), 16);
}

class HashRing {
  constructor(vnodes = 100) {
    this.vnodes = vnodes;   // virtual nodes per server -> smoother spread
    this.ring = [];         // sorted list of { pos, node }
  }

  addNode(node) {
    for (let i = 0; i < this.vnodes; i++) {
      this.ring.push({ pos: hash(node + '#' + i), node });
    }
    this.ring.sort((a, b) => a.pos - b.pos);
  }

  removeNode(node) {
    this.ring = this.ring.filter((v) => v.node !== node);
  }

  getNode(key) {
    if (!this.ring.length) throw new Error('No nodes in ring');
    const pos = hash(key);
    // Binary search: first virtual node with position >= pos
    let lo = 0, hi = this.ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ring[mid].pos < pos) lo = mid + 1;
      else hi = mid;
    }
    return this.ring[lo === this.ring.length ? 0 : lo].node; // past the end -> wrap to start
  }
}

// Test: how many keys move when we add a 4th server?
const ring = new HashRing(100);
['cache-a', 'cache-b', 'cache-c'].forEach((n) => ring.addNode(n));
const keys = Array.from({ length: 10_000 }, (_, i) => 'user:' + i);
const before = new Map(keys.map((k) => [k, ring.getNode(k)]));

ring.addNode('cache-d');
const moved = keys.filter((k) => ring.getNode(k) !== before.get(k)).length;
console.log('moved with ring :', (moved / keys.length * 100).toFixed(1) + '%');      // ~26%

const naive = (k, n) => hash(k) % n;
const movedMod = keys.filter((k) => naive(k, 3) !== naive(k, 4)).length;
console.log('moved with mod N:', (movedMod / keys.length * 100).toFixed(1) + '%');   // ~74%
\`\`\`

**Why it works:** every key that moved went to the **new** server; no key moved between old servers. Virtual nodes (100 per server) spread each server around the circle, so load is roughly even (each got 2,000-2,800 of 10,000 keys in the test).

**Complexity:** \`getNode\` is O(log(N x V)) with binary search. \`addNode\` is O(N x V log(N x V)) because of the sort — fine, since it happens rarely.`,
      followUps: [
        {
          q: 'Where is consistent hashing used in real systems?',
          a: 'DynamoDB and Cassandra partitioning, Memcached client libraries, load balancers that need "sticky" routing by user, and CDNs. Redis Cluster uses a similar idea with 16,384 fixed hash slots.',
        },
        {
          q: 'How would you add replication?',
          a: 'Store each key on the first R distinct servers clockwise (skip virtual nodes that belong to a server you already picked). If one server dies, the next one already has a copy.',
        },
      ],
    },
    {
      id: 'design-job-board-search',
      title: 'Design search for a job board',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'sql-vs-nosql',
      question: `Design the search feature for a job board (like a small Indeed / LinkedIn Jobs).

- 2 million active job posts, 50,000 new or updated posts per day
- 300 searches per second at peak
- Free-text search on title, company and description ("senior react developer")
- Filters: location (city or "within 25 km"), remote/onsite, salary range, experience level, posted in the last N days
- Sort by relevance or by newest; results in under 300 ms
- New jobs should be searchable within about a minute

Your main data is in MongoDB (or Postgres). How do you build search?`,
      hints: [
        'Is `$regex: /react/i` on 2 million documents fast? What kind of index does full-text search need?',
        'A search engine (Elasticsearch / OpenSearch / Atlas Search) is usually a second copy of the data, built for searching. How do you keep it in sync?',
        'Think about the inverted index, analyzers (stemming, synonyms) and how filters vs relevance scoring work.',
      ],
      solution: `**Idea:** keep MongoDB/Postgres as the **source of truth**, and keep a **search index** (Elasticsearch / OpenSearch, or MongoDB Atlas Search) as a read-optimised copy. Sync changes through events. Search reads only from the index.

**Requirements recap:** read-heavy (300 QPS search vs ~1 write/s), relevance ranking, geo + range filters, near-real-time (about 1 min lag is OK).

**API:**

\`\`\`text
GET /jobs/search?q=senior+react&lat=12.97&lng=77.59&radiusKm=25
               &remote=true&minSalary=2000000&level=senior&postedWithinDays=7
               &sort=relevance&cursor=...
-> { results: [{ id, title, company, location, salary, snippet }], nextCursor, facets }
\`\`\`

**Why not just the database?** \`$regex\` with a leading wildcard cannot use a normal index, so it scans all 2M docs. Basic DB text indexes have weak relevance ranking, no typo tolerance and poor mixing with geo filters. A search engine uses an **inverted index**: a map from each word to the list of jobs that contain it, like the index at the back of a book.

**Search document (denormalised — everything needed to search and show a result):**

\`\`\`json
{
  "jobId": "j_123",
  "title": "Senior React Developer",
  "company": "Acme",
  "description": "...",
  "skills": ["react", "typescript", "node"],
  "location": { "lat": 12.97, "lon": 77.59 },
  "remote": true,
  "salaryMin": 2000000,
  "salaryMax": 3500000,
  "level": "senior",
  "postedAt": "2026-10-01T10:00:00Z",
  "status": "open"
}
\`\`\`

**Architecture:**

\`\`\`text
Recruiter -> Jobs API -> MongoDB (source of truth)
                             |
                  change stream / outbox event
                             v
                     Queue -> Indexer worker -> Elasticsearch / OpenSearch
                                                     ^
Job seeker -> Search API (+ Redis cache for popular queries) --+
\`\`\`

**Key decisions and trade-offs:**

- **Query shape:** full-text \`match\` on title (boosted x3), skills (x2), description (x1). Put location, salary, level, remote and date in a **filter** clause — filters do not affect the score and are cached, so they are fast.
- **Analyzers:** lowercase, stemming ("developers" -> "developer"), synonyms ("js" = "javascript", "sde" = "software engineer").
- **Freshness in ranking:** mix relevance with a decay function on \`postedAt\` so old posts sink.
- **Sync:** an outbox or change stream feeds an indexer. At-least-once delivery is fine because indexing by \`jobId\` is idempotent (same doc overwritten). Use the job's \`updatedAt\` as a version to ignore out-of-order old updates.
- **Expired/closed jobs:** update \`status\` in the index, filter on \`status: open\`.
- **Pagination:** use \`search_after\` (cursor) instead of deep \`from/size\` paging.
- **Consistency:** the index lags a few seconds. After a recruiter edits a job, their own dashboard reads from MongoDB, not the index.

**Scaling:** 2M docs is small for Elasticsearch (a few GB). Start with 3 nodes, 1-2 primary shards with replicas. Add replicas for more search QPS. Cache the top queries for 30-60 s in Redis. Rebuild the index with zero downtime by writing a new index and switching an **alias**.`,
      followUps: [
        {
          q: 'How would you add "did you mean" and autocomplete?',
          a: 'Autocomplete: a separate field with edge n-grams or a completion suggester on titles/skills, queried on each keystroke (debounced on the client). "Did you mean": the engine\'s term/phrase suggester, or fuzzy matching with a small edit distance.',
        },
        {
          q: 'How do you reindex 2M jobs after changing the mapping?',
          a: 'Create `jobs_v2` with the new mapping, bulk-load from MongoDB, replay changes that happened during the load (from the queue), then atomically switch the `jobs` alias from v1 to v2. Delete v1 later.',
        },
        {
          q: 'When is Atlas Search enough?',
          a: 'If you are already on MongoDB Atlas, Atlas Search (Lucene under the hood) gives full-text, fuzzy and geo search without running a separate cluster or a sync pipeline. Choose Elasticsearch when you need more control, heavy aggregations or you are not on Atlas.',
        },
      ],
    },
    {
      id: 'design-news-feed',
      title: 'Design a social news feed (fan-out on write vs read)',
      difficulty: 'medium',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'caching-strategies',
      question: `Design the home feed for a professional social network (like a simple LinkedIn feed).

- 20 million daily active users
- Users follow others; the average user follows 200 people; some "influencers" have 5 million followers
- 5 million new posts per day
- Opening the app shows the latest ~50 posts from people you follow, in under 200 ms
- Feed can be a few seconds late, but must not miss posts

Explain how a feed is built and how you handle the celebrity problem.`,
      hints: [
        'Two options: build the feed when someone posts (push to every follower) or when someone opens the app (pull from everyone they follow).',
        'What happens with "push" when a user with 5 million followers posts?',
        'Most real systems use a hybrid. Store only post IDs in each feed list, not full posts.',
      ],
      solution: `**Idea:** precompute each user's feed (**fan-out on write**) for normal users, because reads are far more common than writes. For celebrities, **pull** their posts at read time and merge. This is the **hybrid** approach.

**Numbers:** 5M posts/day = ~60 posts/s (peak ~200/s). Average fan-out 200 -> ~12,000 feed inserts/s. Feed reads: 20M users x ~10 opens/day = 200M/day = ~2,300 reads/s (peak ~7,000).

**API:**

\`\`\`text
POST /posts                         { text, mediaIds }      -> { postId }
GET  /feed?cursor=<lastPostId>&limit=50                     -> { posts[], nextCursor }
POST /users/:id/follow
\`\`\`

**Data model:**

- \`posts { postId, authorId, text, media, createdAt }\` — MongoDB / Cassandra, sharded by postId or authorId.
- \`follows { followerId, followeeId }\` — indexed both ways.
- **Feed cache:** Redis list (or sorted set) per user: \`feed:<userId>\` = latest ~500 **post IDs**, newest first.
- \`users.isCelebrity\` (follower count > e.g. 100k).

**Architecture:**

\`\`\`text
Author -> Post API -> posts DB
              |
              +--> Queue "PostCreated" --> Fan-out workers
                                              | for each follower (normal authors only):
                                              v
                                    Redis  feed:<followerId>  (LPUSH id, LTRIM 0 499)

Reader -> Feed API --> Redis feed:<me>  (post IDs from normal authors)
              |   +--> recent posts of celebrities I follow (cached per celebrity)
              |   merge by time -> top 50 IDs
              +--> fetch post bodies (post cache / DB, batched) + likes counts
\`\`\`

**Key decisions and trade-offs:**

- **Push (fan-out on write):** fast reads (one Redis read), but heavy writes and wasted work for followers who never log in.
- **Pull (fan-out on read):** cheap writes, but the read must query 200 authors and merge — slow.
- **Hybrid:** push for normal users; for celebrities, skip fan-out and pull their latest posts at read time (cached, since millions of readers share them). One celebrity post = 1 write, not 5 million.
- **Store IDs, not posts** in feeds: smaller memory, and edits/deletes show up everywhere because bodies are fetched fresh.
- **Inactive users:** do not fan out to users inactive for 30+ days. Rebuild their feed with pull when they come back.
- **Ranking:** start with reverse-chronological. Ranked feeds score candidates (recency, author affinity, engagement) in the Feed API after gathering them.
- **Deleted post:** remove from post store; the feed hydrator skips missing IDs (lazy cleanup).

**Scaling:** fan-out workers scale horizontally on the queue. Redis Cluster sharded by userId (20M users x 500 IDs x ~10 bytes ~ 100 GB, so several nodes, or keep only 200 IDs). Post bodies cached in Redis/CDN. Pagination with a cursor (last seen post ID / timestamp), never offset.`,
      followUps: [
        {
          q: 'A user follows someone new. Do their old posts appear?',
          a: 'Optionally run a small "backfill" job: fetch that author\'s last ~20 posts and merge them into the follower\'s feed list. Unfollow is the reverse: filter that author\'s posts out at read time and clean up lazily.',
        },
        {
          q: 'How would you show "3 new posts" without refreshing?',
          a: 'Either poll a cheap endpoint (`GET /feed/new-count?since=<id>`) every 30-60 s, or push a small notification over WebSocket/SSE from the fan-out worker. Do not stream full posts; let the client fetch on tap.',
        },
      ],
    },
    {
      id: 'design-webhook-delivery',
      title: 'Design a reliable webhook delivery service',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'job-queues-bullmq',
      question: `Your hiring SaaS lets customers register webhook URLs to receive events like \`candidate.applied\` and \`candidate.hired\` (like Stripe or GitHub webhooks).

- 5,000 customers, ~2 million events per day, bursts of 500 events/s
- Customer endpoints are often slow, down for hours, or return errors
- Customers must be able to **trust** that a webhook really came from you
- One slow customer must not delay webhooks for everyone else
- Customers want to see delivery logs and press "resend"

Design it.`,
      hints: [
        'Never call customer URLs inside your main request. What should sit between "event happened" and "HTTP POST to customer"?',
        'Retries: how often, how long, and what happens after the last retry fails?',
        'How do customers verify a webhook is from you? (HMAC signature with a shared secret, plus a timestamp)',
      ],
      solution: `**Idea:** events go into a durable store and a queue. Workers POST to customer URLs with a **short timeout**, **HMAC signature**, **exponential backoff retries**, and a **dead-letter** state after the last attempt. Isolate customers so one bad endpoint cannot block others.

**API (for customers):**

\`\`\`text
POST   /webhook-endpoints          { url, events: ["candidate.hired"] } -> { id, secret }
GET    /webhook-endpoints/:id/deliveries?status=failed
POST   /webhook-deliveries/:id/resend
POST   /webhook-endpoints/:id/rotate-secret
\`\`\`

**Data model:**

- \`endpoints { id, tenantId, url, secret, events[], status: active|disabled, failureStreak }\`
- \`events { id, tenantId, type, payload, createdAt }\` (written via outbox with the business change)
- \`deliveries { id, eventId, endpointId, attempt, status: pending|success|failed|dead, nextAttemptAt, lastStatusCode, lastError, durationMs }\`

**Architecture:**

\`\`\`text
App services --(outbox)--> events table --> Dispatcher
                                              | one delivery per matching endpoint
                                              v
                           Queue (per-tenant groups, delayed jobs for retries)
                                              |
                                      Delivery workers  --HTTPS POST (5-10s timeout)--> Customer URL
                                              |
                                  deliveries log (Mongo/Postgres) --> dashboard + resend
                                              |
                                after max attempts -> status "dead" (DLQ) + email customer
\`\`\`

**Signing (customers verify with their secret):**

\`\`\`javascript
const crypto = require('node:crypto');

// Sender: sign "timestamp.body" with the endpoint's secret
function signPayload(secret, body, timestamp) {
  const sig = crypto.createHmac('sha256', secret).update(timestamp + '.' + body).digest('hex');
  return 't=' + timestamp + ',v1=' + sig;      // sent as header X-Signature
}

// Receiver (in our docs for customers)
function verifySignature(secret, body, header, toleranceSec = 300) {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const age = Math.floor(Date.now() / 1000) - Number(parts.t);
  if (!parts.t || !parts.v1 || Math.abs(age) > toleranceSec) return false; // too old = replay
  const expected = crypto.createHmac('sha256', secret).update(parts.t + '.' + body).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(parts.v1, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b); // constant-time compare
}

// Retry schedule: exponential backoff + jitter, capped at 6 hours
function nextRetryDelayMs(attempt) {
  const base = 30_000 * 2 ** (attempt - 1);              // 30s, 1m, 2m, 4m, 8m ...
  const capped = Math.min(base, 6 * 60 * 60 * 1000);
  return Math.floor(capped * (0.8 + Math.random() * 0.4)); // +/- 20% jitter
}
\`\`\`

**Key decisions and trade-offs:**

- **At-least-once delivery.** A timeout does not mean the customer did not process it. So we may send twice. Every webhook carries a unique \`event.id\` and we tell customers to dedupe on it.
- **Success = any 2xx within the timeout.** 4xx like 410 Gone can disable the endpoint; 5xx, timeouts and connection errors are retried (~15 attempts over ~3 days).
- **Isolation:** per-tenant/per-endpoint concurrency limits (BullMQ groups or a queue per endpoint). A dead endpoint\'s retries sit as delayed jobs and do not block healthy ones. Auto-disable after many days of failures and email the customer.
- **Ordering is not guaranteed** (retries reorder). Include \`createdAt\` and a resource version so customers can ignore stale events, or fetch the latest state from our API.
- **Security:** HMAC signature + timestamp (stops tampering and replay), HTTPS only, block private IPs (SSRF protection: do not let customers point webhooks at \`169.254.169.254\` or internal hosts), secret rotation with two valid secrets for a while.
- **Payload size:** keep it small ("thin events" with IDs) or include the full object; thin events + API fetch avoid leaking stale data.

**Scaling:** 500 events/s x average 2 endpoints = 1,000 POSTs/s. Most time is waiting on the network, so Node workers handle hundreds of concurrent requests each. Scale workers on queue depth. Partition the deliveries log by date and keep 30 days.`,
      followUps: [
        {
          q: 'How does "resend" work?',
          a: 'It creates a new delivery attempt for the same event (same event.id, so the customer\'s dedupe still works) and puts it on the queue immediately. Bulk resend: "resend all failed in the last 24h" as a background job.',
        },
        {
          q: 'Why sign "timestamp.body" instead of just the body?',
          a: 'If only the body is signed, an attacker who captured one webhook could replay it forever. Including the timestamp in the signature and rejecting old timestamps (e.g. older than 5 minutes) blocks replays.',
        },
      ],
    },
    {
      id: 'design-ai-resume-screening',
      title: 'Design an AI resume screening pipeline with queues',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'message-queues',
      question: `Design a feature for a recruiting platform: when a candidate applies, the system scores their resume against the job description with an LLM and shows recruiters a ranked list with a short explanation.

- 200,000 applications per day, with spikes of 20,000 in an hour when a big company posts a job
- Resumes arrive as PDF/DOCX (up to 5 MB)
- The LLM API has a rate limit (say 500 requests/minute and a tokens-per-minute cap), costs money per token, and sometimes times out or returns invalid JSON
- Recruiters should see "Scoring..." and then the result, usually within a few minutes
- Re-scoring is needed when the job description changes

Design the pipeline.`,
      hints: [
        'Calling the LLM inside the "apply" HTTP request is a bad idea. Why? What should the request do instead?',
        'Break the work into stages (upload -> extract text -> score -> store) connected by queues. Each stage can retry on its own.',
        'How do you respect the LLM rate limit during a spike, avoid paying twice for the same resume, and handle bad JSON?',
      ],
      solution: `**Idea:** the apply request only stores the file and enqueues a job. A **staged pipeline** of queue workers extracts text, calls the LLM under a **global rate limiter**, validates the output, and saves the score. Cache by content hash so the same resume + job is never paid for twice.

**Numbers:** 200k/day = ~2.3/s average, but a spike of 20k/hour = ~5.5/s = 333/min. Under the 500 RPM limit, but tokens may be the real limit: a resume (~1,500 tokens) + JD (~800) + prompt (~500) = ~3k tokens in. 333/min x 3k = 1M tokens/min, so plan the TPM quota or let the queue absorb the spike.

**API:**

\`\`\`text
POST /applications                 (multipart or presigned S3 upload) -> 201 { applicationId, scoreStatus: "pending" }
GET  /jobs/:jobId/applications?sort=score     -> list with score, summary, status
POST /jobs/:jobId/rescore                      -> 202 (bulk job)
\`\`\`

**Data model:**

- \`applications { id, jobId, candidateId, resumeS3Key, resumeHash, scoreStatus: pending|extracting|scoring|done|failed, score, summary, strengths[], gaps[], model, promptVersion, jdVersion }\`
- \`resume_texts { resumeHash, text, extractedAt }\` — extract once per unique file.
- \`score_cache\` key = hash(resumeHash + jdVersion + promptVersion + model).

**Architecture:**

\`\`\`text
Candidate -> API -> S3 (resume file)
              |
              +-> MongoDB (application, status=pending)
              +-> Queue: extract
                       |
              Extract workers (pdf/docx -> text, PII redaction) --> Queue: score
                                                                       |
              Score workers --[global rate limiter (Redis token bucket)]--> LLM API
                       |  validate JSON (zod) -> retry/repair -> fallback
                       v
              MongoDB (score, summary) --> event --> WebSocket/SSE to recruiter UI

 Failed after N retries -> DLQ -> alert + "Retry" button
\`\`\`

**Key decisions and trade-offs:**

- **Async, not in the request:** LLM calls take 5-30 s and can fail. The candidate gets an instant "Application received".
- **Separate stages:** text extraction is CPU work; scoring is slow network + rate limited. Separate queues scale and retry independently.
- **Rate limiting:** a shared Redis token bucket (or BullMQ's limiter) caps calls across all workers to stay under RPM/TPM. On 429, back off using the \`retry-after\` header.
- **Structured output:** ask for JSON with a fixed schema (\`score 0-100, strengths, gaps, summary\`), use the model\'s JSON/tool-calling mode, and validate with zod. On invalid output: one repair retry, then mark as failed.
- **Cost control:** cache by content hash; truncate/clean resume text; use a cheaper model for a first pass and a stronger one only for the top candidates; set max output tokens.
- **Fairness and safety:** redact name, photo, age, gender and address before scoring to reduce bias; store prompt and model version for auditability; humans make the final decision (the score is a helper, not an auto-reject).
- **Re-scoring:** bump \`jdVersion\`, enqueue rescore jobs at **low priority** so they do not delay new applications.
- **Idempotency:** the job id = applicationId + jdVersion, so a duplicated message does not cause a second paid call.

**Scaling:** workers scale on queue depth, but throughput is capped by the LLM quota — so the real levers are quota increases, batching, caching and priority queues (paying customers / new applications first).`,
      followUps: [
        {
          q: 'How would you add semantic search like "find candidates similar to this one"?',
          a: 'Create an embedding for each resume during the pipeline and store it in a vector index (Atlas Vector Search, pgvector, Pinecone). Search by nearest neighbours, then optionally re-rank the top 50 with the LLM.',
        },
        {
          q: 'How do you know the scores are any good?',
          a: 'Build an evaluation set: past applications with recruiter decisions. Measure how well scores correlate with "shortlisted", check for bias across groups, and re-run the eval whenever you change the prompt or model.',
        },
      ],
    },
    {
      id: 'checkout-inventory-no-overselling',
      title: 'Design checkout and inventory without overselling',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'saga-pattern',
      question: `Design checkout for an e-commerce site running a flash sale.

- 1,000 units of a sneaker go on sale at 10:00; ~200,000 users try to buy in the first minute
- We must **never sell more than 1,000** (no overselling), and should not leave items stuck in carts forever (no "underselling")
- Payment goes through Stripe and can take several seconds or fail
- Services: Orders, Inventory, Payments (separate services, each with its own DB)
- A user who double-clicks "Pay" must not be charged twice

What is the race condition in a naive "read stock, then write stock" approach, and how do you design the flow?`,
      hints: [
        'Two requests both read stock = 1, both decide "OK", both write stock = 0. How do you make "check and decrement" a single atomic step?',
        'Reserve stock first (with an expiry), then take payment, then confirm. What happens to the reservation if payment fails or the user walks away?',
        'Each step lives in a different service. How do you undo earlier steps if a later step fails? (saga + compensation). And how do you stop double charges? (idempotency key)',
      ],
      solution: `**Idea:** make "check and decrement" one **atomic conditional update**, use **reservations with a TTL** instead of selling immediately, and coordinate Order -> Inventory -> Payment with a **saga** (each step has an undo). Idempotency keys stop double charges.

**The race (naive code):**

\`\`\`javascript
const item = await Inventory.findOne({ sku });   // two requests both read available = 1
if (item.available < qty) throw new Error('Sold out');
item.available -= qty;                            // both set available = 0
await item.save();                                // 2 units sold, 1 existed
\`\`\`

**Fix — atomic conditional update (the DB checks and decrements in one step):**

\`\`\`javascript
// MongoDB: only matches if enough stock is left; the update is atomic per document
const res = await Inventory.updateOne(
  { sku, available: { $gte: qty } },
  { $inc: { available: -qty, reserved: qty } }
);
if (res.modifiedCount === 0) throw new Error('Sold out');

// SQL equivalent:
// UPDATE inventory SET available = available - $1, reserved = reserved + $1
// WHERE sku = $2 AND available >= $1;   -- check rows affected
\`\`\`

**Flow (orchestrated saga):**

\`\`\`text
Client --POST /checkout (Idempotency-Key)--> Checkout/Order service
   1. create order (status=PENDING)
   2. Inventory: reserve qty  (atomic, expiresAt = now + 10 min)  -- fail -> order CANCELLED "sold out"
   3. Payments: Stripe PaymentIntent (idempotencyKey = orderId)
        success (webhook) -> 4. Inventory: confirm reservation (reserved -= qty, sold += qty)
                             5. order CONFIRMED -> events: email, shipping
        failure / timeout -> compensate: release reservation (available += qty), order FAILED

 Sweeper job (every minute): reservations past expiresAt -> release -> stock goes back on sale
\`\`\`

**Data model:**

- \`inventory { sku, available, reserved, sold }\` — invariant: available + reserved + sold = total.
- \`reservations { id, orderId, sku, qty, status: held|confirmed|released, expiresAt }\` — unique on orderId so retries do not reserve twice.
- \`orders { id, userId, items, status, idempotencyKey (unique), paymentIntentId }\`

**Key decisions and trade-offs:**

- **Why reservations?** Payment takes seconds. Without reserving, you either oversell (sell before paying) or make users pay for items that are gone. A TTL prevents "abandoned cart" items being locked forever.
- **Double click:** the client sends an \`Idempotency-Key\`. The orders table has a unique index on it; the second request returns the first result. Stripe also gets \`idempotencyKey = orderId\`.
- **Steps talk via events + outbox** so a crash between steps does not lose progress; the orchestrator stores saga state and resumes.
- **Payment result arrives via webhook.** Handle "payment succeeded after the reservation expired": either re-reserve if stock is left, or refund automatically. This edge case is a favourite interview question.
- **Flash-sale hot spot:** 200k requests hitting one inventory row cause lock contention. Options:
  - Put a **queue / virtual waiting room** in front so only N checkouts per second reach inventory.
  - Keep the counter in **Redis** (\`DECRBY\` in a Lua script that checks >= 0) as a fast gate, then write real reservations to the DB for the winners.
  - Split stock into **buckets** (10 rows of 100 units) and pick a random bucket to spread contention.
- **Consistency choice:** stock is strongly consistent (single source, atomic updates). Product page "only 3 left!" can be eventually consistent (cached).

**Scaling:** the normal catalog is easy; the flash sale is the hard part. Cache product pages on the CDN, rate limit per user, use a waiting room, and reject early ("Sold out") from a Redis flag once stock hits zero so the DB is not touched by the other 199,000 requests.`,
      followUps: [
        {
          q: 'Why not use a distributed lock (Redlock) around the inventory check?',
          a: 'You can, but a conditional atomic update in the database is simpler and safer: no lock expiry edge cases, no extra network round-trips, and the DB guarantees correctness. Locks are for when the critical section spans multiple systems.',
        },
        {
          q: 'Orchestration or choreography for this saga?',
          a: 'Orchestration: one Checkout orchestrator tells each service what to do and handles compensation. The flow is easy to read, test and monitor. Choreography (services reacting to each other\'s events) works for simple flows but gets hard to follow as steps grow.',
        },
        {
          q: 'How do you know you never oversold?',
          a: 'Check the invariant `available + reserved + sold = total` and `available >= 0` in a periodic reconciliation job, alert on mismatch, and compare sold count with confirmed paid orders.',
        },
      ],
    },
    {
      id: 'monolith-to-microservices-strangler',
      title: 'Plan a monolith to microservices migration (strangler fig)',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'monolith-vs-microservices',
      question: `You join a startup with a 6-year-old Node.js/Express monolith (250k lines) and one big MongoDB. It handles users, jobs, applications, billing (Stripe), notifications and reporting. 25 engineers deploy it together; deploys take 2 hours and one bug in reporting recently took down billing.

The CTO says: "Let's rewrite everything as microservices in 6 months."

1. What do you say about the big-bang rewrite?
2. Give a step-by-step migration plan. Which service do you extract first, and how?
3. What about the shared database?`,
      hints: [
        'Big-bang rewrites stop feature work and usually take far longer than planned. What is the incremental alternative?',
        'Strangler fig: put a routing layer in front, move one piece at a time, route traffic to the new service, and remove the old code.',
        'Pick the first service by low risk + high value + clear boundaries. Data ownership is the hardest part: each service should own its data.',
      ],
      solution: `**Idea:** do not rewrite. Use the **strangler fig pattern**: put a proxy in front of the monolith, extract one bounded context at a time behind it, move its data, switch traffic gradually, delete the old code. The monolith shrinks until it is gone (or until what remains is fine as it is).

**1. About the big-bang rewrite:**

- It freezes features for months while the business keeps changing, and the new system must catch up with 6 years of hidden edge cases.
- Nothing ships until the end, so risk is all at once.
- And check the real problem first: slow deploys and one bug breaking billing may be fixable with **modularisation**, better CI, and isolating background jobs. Microservices also add network failures, distributed data and ops cost. Migrate only where it pays off.

**2. Step-by-step plan:**

1. **Foundations first:** CI/CD per service, containers, centralised logs, metrics and tracing (OpenTelemetry), a service template, an event bus. Without observability, debugging distributed calls is guesswork.
2. **Map bounded contexts** (DDD): users/auth, jobs, applications, billing, notifications, reporting. Draw which modules call which and which collections they touch.
3. **Modularise inside the monolith:** enforce module boundaries (no reaching into other modules' collections), so extraction later is a copy, not surgery.
4. **Put a routing layer (API gateway / Nginx / ALB rules) in front.** All traffic goes through it, initially 100% to the monolith.
5. **Extract the first service. Good candidates:** **Notifications** (few inbound dependencies, asynchronous, low risk) or **Reporting** (read-only, and isolating it removes the "reporting bug kills billing" problem). Billing is valuable but risky — do it later, once the team has practice.
6. **For each extraction:**
   - Build the new service with its **own database**.
   - Sync data: backfill, then keep in sync via change streams / events (outbox) from the monolith.
   - Route a little traffic to the new service (feature flag or gateway weight: 1% -> 10% -> 100%). Optionally run in **shadow mode** first (call both, compare results, serve the monolith's).
   - Switch writes to the new service. The monolith now calls it (or listens to its events) instead of touching that data.
   - Delete the old code and collections. Not deleting is how you end up with two systems forever.
7. **Repeat** context by context, measuring deploy time, incident rate and lead time to prove it is working.

\`\`\`text
 Phase 1                      Phase 2                          Phase 3
 Client -> Gateway            Client -> Gateway                 Client -> Gateway
             |                   |            |                   |     |      |      |
          Monolith            Monolith   Notifications          Jobs  Billing Notif  (small core
          (all)               (minus      service + DB          svc    svc    svc    monolith)
                              notifs)
\`\`\`

**3. The shared database:**

- Rule: **each service owns its data**; others access it only via its API or events. A shared DB means every schema change is still a coordinated deploy — a "distributed monolith".
- Steps: first stop other modules reading that service's collections directly (go through module interfaces), then move the collections to the new DB, using events/CDC to sync during the transition.
- Cross-service queries (e.g. reports joining jobs + applications) move to a **read model**: a reporting DB / warehouse fed by events (CQRS).
- Cross-service transactions become **sagas** with an **outbox** for reliable events.

**Risks to call out:** distributed transactions, network latency and failures (timeouts, circuit breakers), data duplication and eventual consistency, team ownership (each service needs an owning team — Conway's law), and higher infra cost.`,
      followUps: [
        {
          q: 'How do you know when to stop?',
          a: 'When the remaining monolith is stable, rarely changed, and not slowing anyone down. A "modular monolith core" plus a few extracted services is a perfectly good final state.',
        },
        {
          q: 'How do you handle authentication across services?',
          a: 'The gateway validates the user token (JWT/session) once and forwards a signed identity (JWT with userId, tenantId, roles) to services. Services verify the signature locally instead of calling an auth service on every request.',
        },
        {
          q: 'What is an anti-corruption layer?',
          a: 'A translation layer between the new service and the monolith, so the monolith\'s messy models and naming do not leak into the new clean domain model. It converts data both ways at the boundary.',
        },
      ],
    },
    {
      id: 'design-online-code-judge',
      title: 'Design an online code judge / coding assessment platform',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'job-queues-bullmq',
      question: `Design a coding assessment platform (like HackerRank / LeetCode) used by companies to test candidates.

- Candidates write code in the browser (JavaScript, Python, Java, C++) and click **Run** (sample tests) or **Submit** (hidden tests)
- 10,000 candidates in peak hours; ~50 submissions/second at peak, each runs 10-30 test cases
- Strict limits per run: 2 s CPU time, 256 MB memory, no network, no reading other users' files
- Results within ~5 seconds; recruiters see score, time taken, and a replay of the code
- Timed tests (90 minutes) must be fair even if the candidate refreshes or loses connection

Focus on executing **untrusted code safely** and at scale.`,
      hints: [
        'Never run candidate code inside your API server process. Where should it run, and how is it isolated?',
        'Submissions are bursty and slow. Use a queue between the API and a pool of runner machines. How does the browser get the result?',
        'Think about sandboxing layers: containers with no network, seccomp, cgroup limits, read-only filesystem, or micro-VMs like Firecracker / gVisor.',
      ],
      solution: `**Idea:** the API stores the submission and puts a job on a queue. A pool of **isolated runners** pulls jobs, runs code inside a locked-down sandbox (container or micro-VM) with strict CPU/memory/time limits and no network, compares output with expected results, and stores the verdict. The browser gets results by polling or WebSocket.

**API:**

\`\`\`text
POST /assessments/:id/start                     -> { attemptId, endsAt }   (server-side timer)
PUT  /attempts/:id/questions/:qid/draft          { code, language }        (autosave every few s)
POST /attempts/:id/questions/:qid/run            { code, language }  -> 202 { runId }
POST /attempts/:id/questions/:qid/submit         { code, language }  -> 202 { submissionId }
GET  /runs/:runId                                -> { status, results[] }   (or WebSocket push)
\`\`\`

**Data model:**

- \`problems { id, statement, languages, timeLimitMs, memoryMb, sampleTests[], hiddenTestsS3Key }\`
- \`attempts { id, candidateId, assessmentId, startedAt, endsAt, status }\`
- \`submissions { id, attemptId, questionId, language, codeS3Key, status: queued|running|done|error, verdict: AC|WA|TLE|MLE|RE|CE, passed, total, runtimeMs }\`
- \`code_snapshots\` (for replay): timestamped diffs per attempt.

**Architecture:**

\`\`\`text
Browser (Monaco editor) --HTTPS/WS--> API (Node) --> Postgres/Mongo (attempts, submissions)
                                         |                S3 (code, hidden tests)
                                         v
                             Queue (priority: Submit > Run)
                                         |
                  +----------------------+----------------------+
              Runner node             Runner node            Runner node   (autoscaled)
              | worker pulls job, starts a fresh sandbox per run:
              |  - container/micro-VM, image per language, no network
              |  - cgroups: 1 CPU, 256 MB, pids limit; wall-clock kill
              |  - read-only FS + small tmpfs, non-root user, seccomp
              |  compile -> run each test -> compare output
              +--> result --> DB --> pub/sub --> API --> WebSocket to browser
\`\`\`

**Key decisions and trade-offs:**

- **Isolation is the heart of the design.** Plain Docker shares the host kernel; a kernel exploit escapes. Stronger: **gVisor** or **Firecracker micro-VMs** (used by AWS Lambda). Defence in depth: no network namespace, drop all capabilities, seccomp syscall filter, non-root, read-only root FS, pids limit (stops fork bombs), output size limit (stops "print forever").
- **Runner nodes are disposable** and in a separate network/VPC with no access to databases or secrets. They receive code + tests and return results only.
- **Fresh sandbox per run** (or pre-warmed pool of clean sandboxes) — never reuse a container between candidates.
- **Verdicts:** compile error, wrong answer, time limit exceeded (CPU time from cgroups, plus a wall-clock kill), memory limit exceeded, runtime error. Compare output after trimming whitespace; use a custom checker for problems with many correct answers.
- **Fair timing:** the **server** owns \`endsAt\`. Refreshing does not reset it. Autosave drafts every few seconds; at \`endsAt\` the server auto-submits the latest draft.
- **Priority:** "Submit" jobs before "Run" jobs; rate-limit Run clicks per candidate.
- **Anti-cheating (optional):** tab-switch and paste events, plagiarism check (code similarity, e.g. MOSS-style fingerprints) after the test, webcam proctoring as a separate add-on.

**Scaling:** 50 submissions/s x 20 tests x ~0.5 s = ~500 CPU-seconds per second -> ~500 busy cores at peak, plus headroom. Autoscale runners on queue depth; keep warm sandbox pools to avoid cold starts (~100 ms for Firecracker, more for containers). Cache compiled binaries by code hash for repeated "Run" clicks. Hidden tests are cached on runner nodes (read-only).`,
      followUps: [
        {
          q: 'Why not run the code with AWS Lambda?',
          a: 'It can work (Lambda runs on Firecracker and gives isolation and autoscaling for free). Downsides: cold starts, limited control over CPU time measurement, per-language runtimes and cost at high volume. Many platforms start on Lambda/containers and move to their own runner fleet later.',
        },
        {
          q: 'How do you measure runtime fairly when machines are noisy?',
          a: 'Measure CPU time (not wall-clock) from cgroups, pin each sandbox to a dedicated core, avoid overcommitting runner nodes, and set limits with a margin (e.g. 2x the reference solution time).',
        },
      ],
    },
    {
      id: 'design-file-storage-dropbox',
      title: 'Design a simplified Dropbox / Google Drive',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'cdn',
      question: `Design a simplified file storage and sync service.

- 50 million users, 10 million daily active
- Upload, download, delete, rename files and folders; files up to 10 GB
- A desktop app syncs a folder across a user's devices (laptop edits a file -> phone sees the new version)
- Share a file or folder with other users (view / edit)
- Keep the last 30 days of file versions
- Uploads must survive flaky Wi-Fi (resume where they stopped)

Explain how uploads, sync and storage work. Keep it to the core ideas.`,
      hints: [
        'Separate file **bytes** (object storage) from file **metadata** (database). Should file bytes go through your API servers at all?',
        'Split big files into chunks (say 4-8 MB) with a content hash for each. What does that give you for resume, de-duplication and small edits?',
        'For sync: how does device B find out that device A changed something? Think of a per-user change log with a cursor, plus a push notification.',
      ],
      solution: `**Idea:** store bytes in **object storage** (S3) as content-addressed **chunks**, store the file tree and versions in a **metadata DB**, upload directly to S3 with presigned URLs, and sync devices through a per-user **change journal** plus a "something changed" push.

**Numbers (rough):** 50M users x 2 GB average = **~100 PB** raw (less after de-dup). Metadata: billions of file rows — needs a DB that can be sharded by user/namespace.

**API:**

\`\`\`text
POST /files/upload-session      { path, size, chunkHashes[] }
     -> { sessionId, missingChunks: [{ hash, presignedPutUrl }] }   (only chunks we do not have)
PUT  <presigned S3 URL>         (client uploads each missing chunk directly)
POST /files/upload-session/:id/commit                 -> new file version
GET  /files/:id/download        -> { chunks: [{ hash, presignedGetUrl }] }
GET  /changes?cursor=<n>        -> { changes[], newCursor, hasMore }   (sync)
POST /shares                    { fileOrFolderId, userId, role }
\`\`\`

**Data model:**

- \`files { fileId, namespaceId, parentId, name, isFolder, latestVersionId, deleted }\`
- \`versions { versionId, fileId, size, chunkHashes[], createdBy, createdAt }\`
- \`chunks { hash, s3Key, size, refCount }\` — content-addressed (hash = SHA-256 of the bytes)
- \`journal { namespaceId, seq (increasing), fileId, op: create|update|move|delete, versionId }\`
- \`shares { namespaceId/fileId, userId, role }\`

**Architecture:**

\`\`\`text
Desktop/mobile client
  | 1. split file into 4 MB chunks, hash each
  | 2. ask API which chunks are missing
  v
API / Metadata service --> Metadata DB (sharded by namespaceId)
  |        |                    journal (per-namespace change log)
  |        +--> Notification service (WebSocket / long-poll): "namespace X changed"
  |
  +-- presigned URLs --> client uploads/downloads chunks directly <--> S3 (+ CDN for downloads)

Other device: gets "changed" ping -> GET /changes?cursor -> downloads only missing chunks
\`\`\`

**Key decisions and trade-offs:**

- **Bytes never go through API servers.** Presigned URLs send them straight to S3: cheap, fast, scalable.
- **Chunking** gives: resumable uploads (retry only failed chunks), **de-duplication** (same chunk hash stored once, even across users), and **delta sync** (edit 1 MB of a 1 GB file -> upload only the changed chunk or two).
- **Commit is atomic:** a new version row is created only after all chunks exist. Readers never see half-uploaded files.
- **Sync via journal + cursor:** each device remembers the last \`seq\` it saw and asks for changes after it. Push only says "something changed"; the journal is the truth, so missed pushes do no harm.
- **Conflicts:** two devices edit the same file offline. Do not merge binary files — keep both: save the second as "report (Adarsh's laptop conflicted copy).docx". Detect via the version the client based its edit on (optimistic concurrency).
- **Versions and deletes:** keep old versions 30 days; a garbage collector deletes chunks whose \`refCount\` hits 0 after the retention period.
- **Security:** encryption at rest (S3 SSE/KMS), short-lived presigned URLs, permission check before issuing any URL. De-dup across users can leak "this file exists" — many systems de-dup only within one user/account for that reason.

**Scaling:** metadata DB sharded by \`namespaceId\` (a user's or shared folder's space) so a folder's tree and journal live together. Notification servers hold millions of idle connections (scale horizontally, route by namespace via pub/sub). Old/cold chunks move to cheaper storage classes.`,
      followUps: [
        {
          q: 'Why use fixed-size chunks? Is there a better way?',
          a: 'Fixed-size chunks break when you insert a byte at the start: every chunk boundary shifts and all hashes change. Content-defined chunking (rolling hash, like Rabin fingerprints) picks boundaries from the content itself, so an insert changes only nearby chunks.',
        },
        {
          q: 'How does sharing a folder work with the namespace model?',
          a: 'A shared folder becomes its own namespace with its own journal. Each member\'s client mounts it and syncs it with a separate cursor. Permissions are checked on the namespace.',
        },
      ],
    },
    {
      id: 'design-multi-tenant-provisioning',
      title: 'Design multi-tenant SaaS onboarding and provisioning',
      difficulty: 'hard',
      type: 'design',
      frequency: 'occasional',
      relatedTopic: 'multi-tenant-design',
      question: `Your B2B SaaS signs up companies (tenants). When a company signs up, several things must be set up:

1. Create the tenant record and admin user
2. Create a Stripe customer and start a 14-day trial subscription
3. Create the tenant's data space (small tenants: shared DB with \`tenantId\`; enterprise tenants: a dedicated database)
4. Set up a subdomain \`acme.yourapp.com\` (DNS + TLS certificate)
5. Seed default data (roles, email templates, sample pipeline)
6. Send a welcome email

Some steps take seconds, a dedicated DB can take 10 minutes, and any step can fail. Design a reliable provisioning pipeline, and explain how requests are routed to the right tenant afterwards.`,
      hints: [
        'Do not do all of this in the sign-up HTTP request. Model provisioning as a workflow with states and steps.',
        'Every step must be idempotent so the workflow can be retried safely after a crash. What happens to Stripe if step 4 fails?',
        'After provisioning, a tenant catalog (tenantId -> plan, DB connection, region, status) tells every request where its data lives.',
      ],
      solution: `**Idea:** sign-up creates a tenant in state \`PROVISIONING\` and starts a **workflow** (orchestrated saga). Each step is **idempotent** and records its result. Failures retry with backoff; permanent failures run **compensations** or alert ops. A **tenant catalog** is the single place that knows where each tenant's data lives.

**API:**

\`\`\`text
POST /signup                 { companyName, subdomain, adminEmail, plan }  -> 202 { tenantId, status: "provisioning" }
GET  /tenants/:id/status     -> { status, steps: [{ name, status }] }      (UI shows progress)
POST /admin/tenants/:id/retry-provisioning
\`\`\`

**Data model (control plane DB):**

- \`tenants { id, name, subdomain (unique), plan, tier: shared|dedicated, region, status: provisioning|active|failed|suspended, dbConnectionRef }\`
- \`provisioning_runs { tenantId, step, status: pending|done|failed, attempts, output (e.g. stripeCustomerId), lastError }\`
- Secrets (DB passwords) live in AWS Secrets Manager / GCP Secret Manager; the catalog stores only a reference.

**Architecture:**

\`\`\`text
Sign-up UI -> Signup API --> control-plane DB (tenant = PROVISIONING)
                   |
                   v
        Workflow engine (Temporal / Step Functions / BullMQ flow)
           1. create admin user      (idempotent: upsert by email+tenant)
           2. Stripe customer + trial (idempotencyKey = tenantId + step)
           3. data space:
                shared    -> insert tenant rows / indexes
                dedicated -> Terraform/API: create DB (long, poll until ready)
           4. DNS record + TLS cert (wildcard cert covers *.yourapp.com)
           5. seed defaults           (skip if already seeded)
           6. tenant = ACTIVE -> event -> welcome email
        on permanent failure -> compensate (cancel Stripe sub, drop DB) -> FAILED + alert

Request time:
  acme.yourapp.com -> Gateway -> tenant catalog (cached in Redis) -> tenantId, db ref
                   -> app uses the right DB / applies tenantId filter
\`\`\`

**Key decisions and trade-offs:**

- **Workflow engine vs hand-rolled:** Temporal or AWS Step Functions give durable state, retries, timeouts and visibility for long steps (the 10-minute DB). A BullMQ flow works for simpler cases if you store step state yourself.
- **Idempotency everywhere:** a retried step must not create a second Stripe customer or a second DB. Use idempotency keys, "create if not exists", and save each step's output before moving on.
- **Order matters:** do cheap, reversible steps first; do billing early so you do not provision expensive resources for a failed payment setup; mark ACTIVE only at the end.
- **Fast UX:** shared-tier tenants finish in seconds. For dedicated tenants, let the admin in early with a "setting up" screen, or pre-create a **warm pool** of empty databases to assign instantly.
- **Tenant isolation at request time:** resolve tenant from the subdomain (or a JWT claim), then enforce it in **one place** — a repository/middleware that always adds \`tenantId\`, or a separate connection per dedicated tenant. Never trust a \`tenantId\` sent in the request body.
- **Subdomains:** a wildcard DNS record and wildcard TLS cert make subdomains instant; custom domains (\`careers.acme.com\`) need per-domain certs (e.g. via ACM / Let's Encrypt) as an async step.
- **Deprovisioning** is the same workflow in reverse: suspend, export data, delete after a retention period (GDPR).

**Scaling:** the control plane is low traffic; the catalog is read on every request, so cache it (Redis + in-process LRU with short TTL) and invalidate on change. Group dedicated DBs per region; run schema migrations per tenant DB with a migration runner that tracks versions per tenant.`,
      followUps: [
        {
          q: 'How do you run a schema migration across 2,000 tenant databases?',
          a: 'A migration job iterates tenants in batches, records the schema version per tenant, and is resumable. Code must handle both old and new schema during the rollout (expand-and-contract: add new fields first, migrate data, remove old fields later).',
        },
        {
          q: 'How do you stop one big tenant from slowing down everyone in the shared DB?',
          a: 'Per-tenant rate limits and quotas, tenant-aware monitoring to find "noisy neighbours", and moving very large tenants to their own dedicated database (which this design already supports).',
        },
      ],
    },
    {
      id: 'design-collaborative-doc-editor',
      title: 'Design a basic real-time collaborative document editor',
      difficulty: 'hard',
      type: 'design',
      frequency: 'occasional',
      relatedTopic: 'event-driven-architecture',
      question: `Design a simple Google Docs-style editor for interview notes: several interviewers can edit the same document at the same time and see each other's changes and cursors live.

- Up to 20 editors per document, ~100,000 documents open at peak
- Changes should appear for others within ~200 ms
- Edits made offline (or during a network blip) must merge when the user reconnects
- Nobody's text should be lost or duplicated when two people type at the same spot
- Keep version history

Why doesn't "send the whole document on every keystroke, last write wins" work? What would you use instead?`,
      hints: [
        'With last-write-wins on the whole doc, if A and B both type at the same time, whose text survives?',
        'Send small operations ("insert \'x\' at position 5") instead of the whole document. But positions shift when someone else inserts first. Look up OT (Operational Transformation) and CRDTs.',
        'All editors of one document should connect to the same server (or share a pub/sub channel). Store the document as a snapshot + an operation log.',
      ],
      solution: `**Idea:** clients send small **operations**, not the whole document. A merge algorithm — **OT** (Operational Transformation) or a **CRDT** (Conflict-free Replicated Data Type) — makes sure everyone ends up with the same text no matter what order operations arrive in. A WebSocket server per document relays operations; the document is stored as **snapshot + operation log**.

**Why last-write-wins fails:** A types "Hello" and B types "World" at the same moment. Each sends the full document. Whichever arrives second overwrites the first — someone's work is silently lost.

**Why naive positions fail:** text is "abc". A inserts "X" at 0 -> "Xabc". B (not yet seeing A) deletes position 2 ("c"). If the server applies B's op to "Xabc" as-is, it deletes "b" instead. Positions must be **transformed** (OT) or replaced with **stable IDs** (CRDT).

**OT vs CRDT (simple version):**

- **OT:** a central server orders operations and transforms each incoming op against ops the client had not seen. Used by Google Docs. Needs a central server; algorithm is tricky to get right.
- **CRDT:** every character gets a unique, ordered ID, so ops can be merged in any order and still give the same result. Works offline and peer-to-peer. Libraries: **Yjs**, **Automerge**. Some memory overhead.
- **Practical answer:** "I would use Yjs (a CRDT) rather than write my own" — it has WebSocket and persistence providers and editor bindings (ProseMirror, Monaco).

**API / protocol:**

\`\`\`text
GET  /docs/:id                          -> metadata + permission check + short-lived token
WS   /docs/:id/live?token=...
     client -> server: { type: "update", update: <binary CRDT update> }
     client -> server: { type: "awareness", cursor, selection, user }   (not stored)
     server -> clients: broadcast updates + awareness
GET  /docs/:id/versions                  -> named snapshots
\`\`\`

**Architecture:**

\`\`\`text
Editors (browser + Yjs) <==WebSocket==> Collab server (holds doc in memory)
                                         |   sticky routing: docId -> server (consistent hashing)
                                         |   or Redis pub/sub channel "doc:<id>" across servers
                                         v
                       Update log (append-only, e.g. Redis stream / DB) --> compactor
                                         |                                     |
                                         +---------> Snapshot store (S3/Mongo) <+
\`\`\`

**Key decisions and trade-offs:**

- **One "home" server per document** (route by docId) keeps all editors of a doc in one memory space: simple and fast. Use Redis pub/sub when editors land on different servers.
- **Persistence:** append each update to a log (durable before ack), and periodically compact into a snapshot. Loading a doc = latest snapshot + updates after it.
- **Offline:** the client keeps its local CRDT state (IndexedDB) and sends its updates when it reconnects; the CRDT merges them automatically.
- **Cursors/presence** ("awareness") are ephemeral — broadcast only, never stored.
- **Permissions:** checked when opening the socket (token) and on every update (a viewer's updates are rejected).
- **Version history:** named snapshots every N minutes or on demand; "restore" creates a new update that sets the content, so history stays linear.

**Scaling:** 100k open docs x 20 editors = up to 2M WebSocket connections — ~20-40 Node servers at ~50k connections each. Idle docs are unloaded from memory after a few minutes (flush snapshot first). Rebalance docs when servers are added (consistent hashing keeps most docs where they are).`,
      followUps: [
        {
          q: 'What happens if the collab server crashes?',
          a: 'Clients reconnect (to another server via the router), which loads snapshot + log. Since each client also keeps its own CRDT state, any updates the server had not persisted are re-sent by the clients and merged, so nothing is lost.',
        },
        {
          q: 'Do you need OT/CRDT for a form with separate fields?',
          a: 'Usually not. For structured fields (status, rating, tags), per-field last-write-wins with versions (optimistic locking) is enough. OT/CRDT matters for free text that several people edit at the same position.',
        },
      ],
    },
  ],
};
