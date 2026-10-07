// Architecture & System Design — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'architecture',
  title: 'Architecture & System Design',
  icon: '🏗️',
  description: 'How to structure and scale real systems: monoliths vs microservices, queues, caching, database scaling, distributed patterns, and full system design walkthroughs you can say out loud in an interview.',
  definitionTitle: 'What is software architecture and system design?',
  definition: `**Software architecture** is the **high-level structure** of a system: what the main parts are (services, databases, queues, caches), what each one is responsible for, and how they talk to each other.

**System design** is the skill of planning that structure for given requirements. That means thinking about **scalability** (handling more users), **reliability** (staying up), **performance**, **security** and **cost**, and explaining the **trade-offs** of each choice.

**One-line answer:** "Architecture is the high-level structure of a system's components and how they interact, and system design is choosing that structure to meet requirements like scale, reliability and cost while explaining the trade-offs."`,
  topics: [
    {
      id: 'system-design-approach',
      title: 'How to Approach a System Design Interview',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A repeatable 6-step framework: requirements, estimates, API, data model, high-level design, deep dives and trade-offs.',
      what: `A system design interview asks you to design a big system (like "design a URL shortener") in about 45 minutes. There is no single right answer. The interviewer wants to see **how you think**: do you ask good questions, make sensible choices, and explain trade-offs?

A simple framework to follow every time:
1. **Clarify requirements** — functional (what it does) and non-functional (how fast, how many users, how reliable).
2. **Estimate** — rough numbers: users, requests per second, storage.
3. **Define the API** — the main endpoints.
4. **Data model** — main tables/collections and which database.
5. **High-level design** — draw boxes: client, load balancer, services, database, cache, queue.
6. **Deep dive and trade-offs** — scale the hard part, talk about failures and bottlenecks.

#### Deeper version
**Back-of-the-envelope estimation** is quick math to size the system. Useful numbers: 1 day is about 86,400 seconds (round to 100,000). So 10 million requests per day is about 100 requests per second (RPS). Peak traffic is often 2-5x the average. Storage = items per day x size x days kept.

Strong candidates also say **what they are NOT designing** (scope), name **bottlenecks** (single points of failure, hot keys, slow DB), and always explain **why** they picked a tool ("I use Redis here because reads are 100x more than writes and I need sub-millisecond lookups").`,
      why: `Without a framework, people jump straight into drawing boxes, forget key requirements, and get lost. A clear structure keeps you calm, shows senior thinking, and makes sure you cover what interviewers score: requirements, scale, data, design, and trade-offs.`,
      analogy: `It is like an architect designing a house. First they ask: how many people live here, what budget, any special needs? Then a rough floor plan. Only then do they pick the exact pipes and wires. Nobody starts by choosing the bathroom tiles.`,
      code: [
        {
          title: 'Back-of-the-envelope estimate as code',
          lang: 'javascript',
          code: `// Quick sizing for "design a URL shortener"
const newUrlsPerDay = 1_000_000;      // writes
const readWriteRatio = 100;           // 100 reads per write
const secondsPerDay = 86_400;

const writeRps = newUrlsPerDay / secondsPerDay;   // ~11.6
const readRps = writeRps * readWriteRatio;        // ~1157
const peakReadRps = readRps * 3;                  // assume 3x at peak

const bytesPerRecord = 500;                       // url + code + metadata
const storage5YearsGB = (newUrlsPerDay * 365 * 5 * bytesPerRecord) / 1e9;

console.log({
  writeRps: Math.round(writeRps),
  readRps: Math.round(readRps),
  peakReadRps: Math.round(peakReadRps),
  storage5YearsGB: Math.round(storage5YearsGB),
});`,
        },
        {
          title: 'The framework as a checklist',
          lang: 'text',
          code: `1. Requirements (5 min)
   - Functional: what must users be able to do?
   - Non-functional: scale, latency, availability, consistency
   - Out of scope: say it out loud
2. Estimates (3 min): users, RPS (avg + peak), storage, bandwidth
3. API (5 min): POST /urls, GET /:code ...
4. Data model (5 min): tables/collections, keys, indexes, which DB and why
5. High-level design (10 min): client -> LB -> services -> cache/DB/queue
6. Deep dives (15 min): bottlenecks, scaling, failures, trade-offs
7. Wrap up: what you would improve with more time`,
        },
      ],
      output: `The estimate prints roughly \`{ writeRps: 12, readRps: 1157, peakReadRps: 3472, storage5YearsGB: 913 }\`.

What this tells you: writes are tiny (12/s, one database handles that easily), but reads are about 1,000+/s and up to ~3,500/s at peak, so you need a **cache**. Storage is under 1 TB over 5 years, so you may not need sharding on day one. Numbers turn vague design into clear decisions.`,
      questions: [
        {
          q: 'What do you do in the first five minutes of a system design interview?',
          a: 'I ask clarifying questions. I list functional requirements, non-functional requirements like scale and latency, and what is out of scope. I confirm them with the interviewer before drawing anything.',
        },
        {
          q: 'Why do back-of-the-envelope estimates matter?',
          a: 'They decide the design. 10 requests per second fits on one server; 100,000 per second needs caching, many instances and maybe sharding. Estimates show you design for the real load, not a guess.',
        },
        {
          q: 'What is the difference between functional and non-functional requirements?',
          a: 'Functional is what the system does, like "users can shorten a URL". Non-functional is how well it does it: latency, availability, consistency, security, scale.',
        },
        {
          q: 'How do you handle a question you do not know the answer to in a design round?',
          a: 'I say what I know, state my assumption clearly, and reason from first principles. For example: "I have not used Kafka in production, but I would choose a log-based queue here because we need replay."',
        },
      ],
      spoken: `"I follow a simple framework. First I clarify requirements: what the system must do, plus scale, latency and availability needs, and what is out of scope. Then I do quick estimates, like requests per second and storage, because the numbers drive the design. Next I define the main APIs and the data model, and draw a high-level design with load balancers, services, cache, database and queues. Finally I deep dive into the hardest part, discuss bottlenecks and failures, and explain the trade-offs behind each choice."`,
      mistakes: [
        'Jumping into drawing boxes before asking about requirements and scale.',
        'Naming tools ("Kafka, Kubernetes, Redis") without explaining why each one is needed.',
        'Over-engineering: designing for 1 billion users when the requirement is 10,000.',
        'Ignoring failures. Always say what happens when a server, the cache or the database goes down.',
        'Follow-up trap: "Why not just use one big server?" Have a real answer: single point of failure, limits of vertical scaling, and no zero-downtime deploys.',
      ],
      takeaway: 'Requirements, estimates, API, data model, high-level design, deep dive — and always explain the trade-off behind every choice.',
    },
    {
      id: 'monolith-vs-microservices',
      title: 'Monolith vs Microservices',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A monolith is one deployable app; microservices split the app into small independent services that talk over the network.',
      what: `A **monolith** is one application. All features (users, orders, payments) live in one codebase, run as one process, and are deployed together.

**Microservices** split the app into small services. Each service owns one business area (for example, a Payments service), has its **own database**, and is deployed on its own. Services talk over the network using HTTP, gRPC or messages.

#### Deeper version
There is a middle path: the **modular monolith**. It is one deployable app, but the code is split into strict modules with clear boundaries (no module reaches into another module's tables). It gives you clean structure without network calls.

Microservices bring real costs: network latency and failures, **distributed transactions** (no simple DB transaction across services), harder debugging (you need distributed tracing), data duplication, and much more DevOps work (CI/CD per service, service discovery, monitoring). A common rule: start with a well-structured monolith, and extract services only when a team or a scaling need clearly demands it.`,
      why: `Monoliths are simple to build, test, and deploy — great for small teams and new products. Microservices solve problems of **big** organisations: many teams stepping on each other, one slow part forcing you to scale the whole app, and one bug taking down everything. They let teams deploy independently and scale only the hot part.`,
      analogy: `A monolith is a big restaurant with one kitchen where every cook does everything. Easy to run when small. Microservices are a food court: a pizza stall, a juice stall, a dessert stall. Each one runs on its own and can grow on its own, but now you need a common seating area, shared rules, and someone to coordinate orders across stalls.`,
      code: [
        {
          title: 'Monolith: one process, direct function calls',
          lang: 'javascript',
          code: `// monolith/orders.js — everything in one Express app
import express from 'express';
import { chargeCard } from './payments.js';   // plain function call
import { db } from './db.js';

const app = express();
app.use(express.json());

app.post('/orders', async (req, res) => {
  const session = await db.startSession();
  await session.withTransaction(async () => {   // one DB, one transaction
    const order = await db.orders.create(req.body, { session });
    await chargeCard(order, { session });
  });
  res.status(201).json({ ok: true });
});

app.listen(3000);`,
        },
        {
          title: 'Microservices: network call to another service',
          lang: 'javascript',
          code: `// orders-service/index.js — talks to payments-service over HTTP
import express from 'express';

const app = express();
app.use(express.json());

app.post('/orders', async (req, res) => {
  const order = await saveOrder(req.body); // orders DB only

  // Network call: it can be slow or fail, so add a timeout
  const resp = await fetch('http://payments-service/charges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, amount: order.total }),
    signal: AbortSignal.timeout(2000),
  });

  if (!resp.ok) {
    await markOrderFailed(order.id); // no shared transaction: we clean up ourselves
    return res.status(502).json({ error: 'Payment failed' });
  }
  res.status(201).json(order);
});

async function saveOrder(data) { return { id: 'ord_1', total: data.total }; }
async function markOrderFailed(id) { console.log('failed', id); }

app.listen(3001);`,
        },
      ],
      output: `In the monolith, creating an order and charging the card happen in **one database transaction**. If charging fails, everything rolls back automatically.

In the microservice version, the orders service must call payments over the network. That call can time out or fail, and there is no shared transaction, so the code must handle failure itself (mark the order as failed). This is the hidden cost of microservices: every function call becomes a network call that can fail.`,
      questions: [
        {
          q: 'When would you choose a monolith over microservices?',
          a: 'For a new product, a small team, or an unclear domain. A monolith is faster to build, easier to debug, and has simple transactions. I would keep it modular so it can be split later.',
        },
        {
          q: 'What are the main challenges of microservices?',
          a: 'Network failures and latency, data consistency across services (no shared transactions), distributed debugging, versioning APIs between services, and a lot more DevOps work.',
        },
        {
          q: 'Should microservices share a database?',
          a: 'Ideally no. Each service should own its data. A shared database couples services tightly: one schema change can break others, and you lose independent deploys.',
        },
        {
          q: 'What is a modular monolith?',
          a: 'One deployable app split into strict internal modules with clear boundaries. It keeps the simplicity of a monolith but makes a later move to microservices much easier.',
        },
      ],
      spoken: `"A monolith is one codebase deployed as one unit, while microservices split the system into small services that each own their data and deploy independently. Monoliths are simpler: one deploy, easy debugging, real database transactions. Microservices help large teams ship independently and scale only the hot parts, but they add network failures, eventual consistency, and a lot of operational work. My default is a well-structured modular monolith, and I extract a service only when there is a clear reason, like a part that needs to scale differently or a separate team owning it."`,
      mistakes: [
        'Saying microservices are always better or "more modern". They are a trade-off, not an upgrade.',
        'Building a "distributed monolith": many services that share one database or must be deployed together. You get all the costs and none of the benefits.',
        'Splitting services too small (one per table). Split by business capability, not by data entity.',
        'Follow-up trap: "How do you handle a transaction across two services?" You cannot use a normal DB transaction; use a saga with compensating actions, or the outbox pattern for reliable events.',
      ],
      takeaway: 'Start with a modular monolith; move to microservices only when team size or scaling needs justify the extra complexity.',
    },
    {
      id: 'scalability-basics',
      title: 'Scalability: Vertical vs Horizontal, Stateless Services',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Vertical scaling = a bigger machine; horizontal scaling = more machines. Horizontal scaling needs stateless services.',
      what: `**Scalability** means your system can handle more load (users, requests, data) by adding resources.

- **Vertical scaling (scale up):** give one server more CPU, RAM or disk. Simple, but there is a hard limit and it is still one point of failure.
- **Horizontal scaling (scale out):** add more servers and spread traffic across them with a load balancer. Almost no upper limit, and if one server dies, others keep working.

A **stateless** service does not keep user data in its own memory between requests. Any server can handle any request. That is what makes horizontal scaling easy.

#### Deeper version
State has to live somewhere. Move it **out** of the app server into shared stores: sessions in Redis or in a signed JWT, files in S3, data in the database. Then servers become "cattle, not pets" — you can add, remove or restart them freely, and autoscaling works.

The database is usually the last stateful part and the hardest to scale horizontally (see database scaling: read replicas, sharding). Also remember **latency vs throughput**: latency is how long one request takes; throughput is how many requests per second you handle. Scaling out raises throughput; it does not make a single slow query faster.`,
      why: `Traffic grows and has peaks (sales, launches). One server will eventually run out of power, and if it crashes, the whole product is down. Horizontal scaling with stateless services gives you more capacity on demand and high availability.`,
      analogy: `Vertical scaling is buying a bigger truck. At some point there is no bigger truck. Horizontal scaling is buying more trucks. For that to work, any driver must be able to deliver any parcel — so the delivery list cannot sit in one driver's head (state); it must be in a shared system everyone can read.`,
      code: [
        {
          title: 'Stateful (bad for scaling) vs stateless (good)',
          lang: 'javascript',
          code: `import express from 'express';
import { createClient } from 'redis';

const app = express();
app.use(express.json());

// BAD: cart lives in this server's memory.
// With 3 servers behind a load balancer, the next request may hit
// a different server and the cart is "gone".
const carts = new Map();
app.post('/bad/cart', (req, res) => {
  carts.set(req.body.userId, req.body.items);
  res.json({ ok: true });
});

// GOOD: cart lives in Redis, shared by every server.
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.post('/cart', async (req, res) => {
  await redis.set(\`cart:\${req.body.userId}\`, JSON.stringify(req.body.items), { EX: 86400 });
  res.json({ ok: true });
});

app.get('/cart/:userId', async (req, res) => {
  const raw = await redis.get(\`cart:\${req.params.userId}\`);
  res.json(raw ? JSON.parse(raw) : []);
});

app.listen(process.env.PORT || 3000);`,
        },
      ],
      output: `With the in-memory \`Map\`, a user adds items on server A, then the load balancer sends the next request to server B, which has an empty Map — the cart looks empty. With Redis, every server reads and writes the same store, so it does not matter which server handles the request. Now you can run 1 or 50 copies of this app.`,
      questions: [
        {
          q: 'What is the difference between vertical and horizontal scaling?',
          a: 'Vertical means a bigger machine; it is simple but limited and a single point of failure. Horizontal means more machines behind a load balancer; it scales further and survives failures but needs stateless services.',
        },
        {
          q: 'What does stateless mean, and why does it matter?',
          a: 'The server keeps no per-user data in memory between requests. Any instance can serve any request, so you can add or remove instances freely and use autoscaling.',
        },
        {
          q: 'Where do you put sessions in a horizontally scaled app?',
          a: 'In a shared store like Redis, or in a signed token like a JWT that the client sends each time. Not in the server process memory.',
        },
        {
          q: 'Is the database easy to scale horizontally?',
          a: 'No, it is usually the hardest part. You start with vertical scaling, indexes and caching, then add read replicas, and shard only when writes or data size demand it.',
        },
      ],
      spoken: `"Vertical scaling means giving one server more CPU and memory. It is simple but has a ceiling and is a single point of failure. Horizontal scaling means adding more servers behind a load balancer, which scales much further and keeps the app up if one server dies. The key requirement is that the app servers are stateless, so any server can handle any request. I keep sessions in Redis or JWTs, files in S3, and data in the database. Then the app tier scales easily and the database becomes the main thing to scale carefully."`,
      mistakes: [
        'Storing sessions, uploaded files or in-memory caches on the app server and then adding more servers.',
        'Thinking horizontal scaling fixes slow code. If one query takes 3 seconds, more servers will not make it faster.',
        'Forgetting that background jobs, cron tasks and WebSocket connections also hold state and need a plan when scaled out.',
        'Follow-up trap: "If you run a cron job in the app and scale to 5 instances, what happens?" It runs 5 times. Use a separate scheduler, a job queue with repeatable jobs, or a distributed lock.',
      ],
      takeaway: 'Make app servers stateless, push state into shared stores, and scale out; the database is the part that needs special care.',
    },
    {
      id: 'load-balancing',
      title: 'Load Balancing (Algorithms, Sticky Sessions, L4 vs L7)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A load balancer spreads requests across many servers, checks their health, and removes broken ones.',
      what: `A **load balancer (LB)** sits in front of your servers. Clients talk to the LB, and it forwards each request to one healthy server. It also runs **health checks** and stops sending traffic to servers that fail.

Common algorithms:
- **Round robin:** server 1, 2, 3, 1, 2, 3...
- **Weighted round robin:** stronger servers get more requests.
- **Least connections:** send to the server with the fewest active connections. Good for long requests.
- **IP hash / consistent hashing:** the same client (or key) always goes to the same server.

#### Deeper version
**L4 vs L7** (layers of the network model):
- **L4 (transport layer)** looks only at IP and port (TCP/UDP). Very fast, cannot read URLs or headers. Example: AWS Network Load Balancer.
- **L7 (application layer)** reads HTTP: path, headers, cookies. It can route \`/api\` to one group and \`/images\` to another, terminate TLS, and add auth or rate limits. Example: AWS Application Load Balancer, NGINX.

**Sticky sessions** (session affinity) make the LB send a user to the same server every time, usually via a cookie. They help with in-memory sessions or WebSocket state, but they hurt even load spreading and break when that server dies. Prefer stateless servers; use stickiness only when needed (for example, Socket.IO long-polling fallback needs it).

The LB itself must not be a single point of failure: cloud LBs are managed and redundant; self-hosted ones run in pairs with failover.`,
      why: `One server cannot handle all traffic and will fail at some point. A load balancer lets you run many servers as one service, hides failures from users, and allows zero-downtime deploys (drain one server, update it, put it back).`,
      analogy: `A load balancer is the host at a busy restaurant. Guests do not pick a table; the host sends each group to a free waiter. If a waiter goes home sick, the host simply stops sending guests to them. Sticky sessions are like a regular who always asks for "their" waiter.`,
      code: [
        {
          title: 'Tiny round-robin and least-connections picker',
          lang: 'javascript',
          code: `const servers = [
  { url: 'http://10.0.0.1', healthy: true, active: 0 },
  { url: 'http://10.0.0.2', healthy: true, active: 0 },
  { url: 'http://10.0.0.3', healthy: false, active: 0 }, // failed health check
];

let i = 0;
function roundRobin() {
  const healthy = servers.filter((s) => s.healthy);
  const s = healthy[i % healthy.length];
  i++;
  return s.url;
}

function leastConnections() {
  return servers
    .filter((s) => s.healthy)
    .reduce((best, s) => (s.active < best.active ? s : best)).url;
}

console.log(roundRobin(), roundRobin(), roundRobin());
servers[0].active = 5;
console.log(leastConnections());`,
        },
        {
          title: 'NGINX as an L7 load balancer',
          lang: 'nginx',
          code: `upstream api_servers {
    least_conn;                     # algorithm
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000 backup;    # used only if others are down
}

server {
    listen 80;

    location /api/ {                # L7: route by path
        proxy_pass http://api_servers;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`,
        },
      ],
      output: `Round robin skips the unhealthy third server and prints \`http://10.0.0.1 http://10.0.0.2 http://10.0.0.1\`. After server 1 gets 5 active connections, least-connections picks \`http://10.0.0.2\`.

In the NGINX config, requests to \`/api/\` are spread with least connections across two servers, and the third is only a backup. Because NGINX reads the path, this is L7 balancing.`,
      questions: [
        {
          q: 'What is the difference between an L4 and an L7 load balancer?',
          a: 'L4 routes by IP and port only, so it is very fast but cannot see HTTP. L7 understands HTTP, so it can route by path, header or cookie, terminate TLS, and do smarter things, at a bit more cost.',
        },
        {
          q: 'What are sticky sessions and what is the downside?',
          a: 'The LB sends a user to the same server every time. The downside: uneven load, and if that server dies the user loses their session. Stateless servers with a shared session store are better.',
        },
        {
          q: 'Which algorithm would you use for long-lived connections like WebSockets?',
          a: 'Least connections, because round robin ignores that some servers already hold many long connections.',
        },
        {
          q: 'How does a load balancer know a server is down?',
          a: 'Health checks: it calls an endpoint like `/health` every few seconds. After a few failures it removes the server, and adds it back when checks pass again.',
        },
      ],
      spoken: `"A load balancer spreads incoming requests across many servers and uses health checks to stop sending traffic to broken ones. Common algorithms are round robin, weighted round robin, least connections, and hashing when the same key must hit the same server. L4 balancers route on IP and port and are very fast, while L7 balancers understand HTTP and can route by path or headers and terminate TLS. I avoid sticky sessions when I can by keeping servers stateless, and only use them for cases like certain WebSocket setups."`,
      mistakes: [
        'Forgetting health checks, so the LB keeps sending users to a dead server.',
        'Making the load balancer itself a single point of failure.',
        'Using sticky sessions to hide stateful servers instead of fixing the state problem.',
        'Follow-up trap: "How do you get the real client IP behind a load balancer?" Read the `X-Forwarded-For` header (and in Express set `trust proxy`), because the TCP source IP is the LB.',
      ],
      takeaway: 'A load balancer gives you capacity and fault tolerance; keep servers stateless so any algorithm works and stickiness is rarely needed.',
    },
    {
      id: 'cdn',
      title: 'CDN (Content Delivery Network)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'A worldwide network of cache servers that serves your static files (and sometimes API responses) from a location close to the user.',
      what: `A **CDN** is a group of servers spread around the world, called **edge locations**. They keep copies of your files (images, JS, CSS, videos). When a user in Mumbai asks for \`logo.png\`, the CDN serves it from a nearby edge server instead of your origin server in the US.

Examples: CloudFront (AWS), Cloud CDN (GCP), Cloudflare, Fastly, and the Vercel edge network.

#### Deeper version
- **Origin:** your real server or S3 bucket. On a **cache miss**, the edge fetches from the origin and stores a copy.
- **Cache-Control headers** tell the CDN how long to keep a file: \`public, max-age=31536000, immutable\` for hashed assets like \`app.3f9a.js\`.
- **Cache busting:** put a content hash in the filename. A new build makes a new file name, so you never need to clear the cache.
- **Invalidation:** for non-hashed files you can purge paths, but it is slower and may cost money.
- **Push vs pull CDN:** pull (most common) fetches from origin on first request; push means you upload files to the CDN ahead of time.
- Modern CDNs also cache API responses (\`s-maxage\`, \`stale-while-revalidate\`), run code at the edge, and absorb DDoS attacks.
- **Signed URLs/cookies** protect private content (like paid videos) on a CDN.`,
      why: `Distance adds latency. Serving files from far away is slow, and serving every image from your own server wastes its CPU and bandwidth. A CDN makes pages load faster everywhere, reduces load and cost on the origin, and protects you from traffic spikes.`,
      analogy: `Instead of one central warehouse shipping every order across the country, a company keeps popular products in small local stores in every city. Customers get them the same day, and the central warehouse is not overloaded.`,
      code: [
        {
          title: 'Set cache headers so a CDN can cache correctly',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

// Hashed build files never change -> cache for 1 year
app.use('/assets', express.static('dist/assets', {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));

// HTML changes on deploy -> always revalidate
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile('index.html', { root: 'dist' });
});

// Public API data: CDN caches 60s, may serve stale for 5 min while refreshing
app.get('/api/products', (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.json([{ id: 1, name: 'Course A' }]);
});

app.listen(3000);`,
        },
      ],
      output: `The CDN keeps \`/assets/app.3f9a.js\` for a year at every edge. When you deploy, the HTML points to a new file name like \`app.81bc.js\`, so users get the new code immediately. The HTML itself is revalidated every time. The product list is cached at the edge for 60 seconds (\`s-maxage\` applies to shared caches like CDNs), so 10,000 users per minute cause only about one request to your server.`,
      questions: [
        {
          q: 'What is a CDN and why use it?',
          a: 'A network of edge servers that cache content close to users. It lowers latency, reduces origin load and bandwidth cost, and helps absorb traffic spikes and DDoS attacks.',
        },
        {
          q: 'How do you make sure users get new JS after a deploy if the CDN caches for a year?',
          a: 'Use content-hashed file names. Each build produces new names, the HTML (which is not cached long) points to them, so old cache entries simply stop being used.',
        },
        {
          q: 'What is the difference between max-age and s-maxage?',
          a: '`max-age` applies to all caches including the browser. `s-maxage` applies only to shared caches like CDNs and overrides `max-age` there.',
        },
        {
          q: 'How would you serve private files, like paid course videos, through a CDN?',
          a: 'Keep the bucket private and use signed URLs or signed cookies with a short expiry, generated by the backend after checking the user has access.',
        },
      ],
      spoken: `"A CDN is a network of edge servers around the world that cache my content close to users. On the first request the edge fetches from my origin, like S3 or my server, and then serves later requests itself. That reduces latency, cuts load and bandwidth on the origin, and helps with traffic spikes. I control it with Cache-Control headers: long, immutable caching for hashed assets, no-cache for HTML, and short s-maxage with stale-while-revalidate for public API data. For private content I use signed URLs."`,
      mistakes: [
        'Caching HTML for a long time, so users keep loading old pages that point to old assets.',
        'Caching personalised API responses as public, so one user sees another user\'s data.',
        'Relying on manual invalidation instead of hashed file names.',
        'Follow-up trap: "Does a CDN help with dynamic, per-user pages?" Mostly not for caching, but it still helps with TLS termination near the user, connection reuse to the origin, and DDoS protection.',
      ],
      takeaway: 'Put static assets behind a CDN with hashed names and long cache headers; never publicly cache per-user data.',
    },
    {
      id: 'caching-strategies',
      title: 'Caching: Layers and Strategies',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Keep copies of data in fast storage. Know the layers (browser, CDN, app, DB) and strategies (cache-aside, write-through, write-behind) plus invalidation.',
      what: `A **cache** is a fast store (usually memory) that keeps a copy of data so you don't compute or fetch it again.

**Layers** (from user to database):
- **Browser cache** (Cache-Control headers)
- **CDN** (edge servers)
- **App/in-memory cache** (a Map or LRU in the process)
- **Distributed cache** (Redis, Memcached — shared by all servers)
- **Database cache** (buffer pool, query cache)

**Strategies:**
- **Cache-aside (lazy loading):** app checks cache; on a miss, reads the DB and stores the result. Most common.
- **Write-through:** write to cache and DB at the same time. Cache always fresh, writes slower.
- **Write-behind (write-back):** write to cache, save to DB later in batches. Fast, but data can be lost.
- **Read-through:** the cache library itself loads from the DB on a miss.

#### Deeper version
**Invalidation** is the hard part. Options: a **TTL** (time-to-live, data expires after N seconds), **delete on write** (when you update the DB, delete the cache key), or event-based invalidation.

**Eviction policies** decide what to remove when the cache is full: LRU (least recently used), LFU (least frequently used), FIFO.

Problems to know:
- **Cache stampede (thundering herd):** a hot key expires and 1,000 requests hit the DB at once. Fix: a lock so only one request rebuilds, early refresh, or random TTL jitter.
- **Cache penetration:** requests for keys that don't exist always miss. Fix: cache the "not found" result for a short time.
- **Stale data:** decide how stale is acceptable per feature (a product price vs a like count).`,
      why: `Databases and external APIs are slow and expensive compared to memory. Most apps read far more than they write, so caching hot data cuts latency from tens of milliseconds to under one, reduces database load, and lets the same hardware serve many more users.`,
      analogy: `A cache is the notepad on your desk. Instead of walking to the filing room (the database) every time someone asks for a phone number, you write the popular ones on your notepad. The risk: if the number changes in the filing room, your notepad is wrong until you update it.`,
      code: [
        {
          title: 'Cache-aside with Redis, TTL and delete-on-write',
          lang: 'javascript',
          code: `import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

// Pretend DB
const db = {
  courses: new Map([['42', { id: '42', title: 'Node Basics' }]]),
  async findCourse(id) { return this.courses.get(id) ?? null; },
  async updateCourse(id, data) { this.courses.set(id, { id, ...data }); },
};

export async function getCourse(id) {
  const key = \`course:\${id}\`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);          // cache hit

  const course = await db.findCourse(id);         // cache miss -> DB
  // Cache "not found" briefly too (stops cache penetration)
  const ttl = course ? 300 + Math.floor(Math.random() * 60) : 30; // jitter
  await redis.set(key, JSON.stringify(course), { EX: ttl });
  return course;
}

export async function updateCourse(id, data) {
  await db.updateCourse(id, data);   // 1. write DB first
  await redis.del(\`course:\${id}\`);  // 2. then delete the cache key
}`,
        },
      ],
      output: `First call to \`getCourse('42')\`: cache miss, reads the DB, stores the JSON in Redis for about 5-6 minutes (random jitter so many keys don't expire together). Next calls: served straight from Redis. On \`updateCourse\`, we write the DB and **delete** the key, so the next read loads fresh data. A missing course is cached as \`null\` for 30 seconds, so attackers can't hammer the DB with fake IDs.`,
      questions: [
        {
          q: 'What is cache-aside?',
          a: 'The app checks the cache first. On a miss it reads the database, puts the result in the cache with a TTL, and returns it. On writes it updates the DB and deletes or updates the cache key.',
        },
        {
          q: 'Why delete the cache key on update instead of setting the new value?',
          a: 'Deleting is safer with concurrent writes: two updates racing to set the cache can leave an older value in it. A delete just forces the next read to load the fresh row.',
        },
        {
          q: 'What is a cache stampede and how do you prevent it?',
          a: 'When a hot key expires and many requests hit the DB at the same time. Prevent it with a lock so one request rebuilds the value, refreshing before expiry, or adding random jitter to TTLs.',
        },
        {
          q: 'Write-through vs write-behind?',
          a: 'Write-through writes cache and DB together, so data is safe but writes are slower. Write-behind writes the cache first and the DB later, so it is fast but you can lose data if the cache crashes.',
        },
        {
          q: 'What should you NOT cache?',
          a: 'Data that must be perfectly fresh (like an account balance during a payment), highly personal data in shared caches, and things that are rarely read again.',
        },
      ],
      spoken: `"Caching keeps hot data in fast storage so we avoid slow work. There are layers: browser, CDN, in-process, a shared cache like Redis, and the database's own cache. My default strategy is cache-aside: check Redis, on a miss read the database and store it with a TTL, and on writes update the database then delete the key. The hard part is invalidation and freshness, so I choose TTLs per feature. I also guard against stampedes with locks or TTL jitter, and cache not-found results briefly to stop penetration."`,
      mistakes: [
        'Caching without a TTL or invalidation plan, so users see stale data forever.',
        'Deleting the cache before writing the DB: another request can re-fill the cache with the old value in between.',
        'Using an in-process cache with many servers and expecting it to be consistent across them.',
        'Follow-up trap: "What happens if Redis goes down?" With cache-aside the app should fall back to the database (with timeouts), but the DB may be overloaded, so you need capacity planning or a circuit breaker.',
      ],
      takeaway: 'Cache-aside with TTLs and delete-on-write is the safe default; the hard parts are invalidation, stampedes, and deciding how stale is OK.',
    },
    {
      id: 'solid-principles',
      title: 'SOLID Principles',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Five rules for code that is easy to change: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion.',
      what: `**SOLID** is five design rules that keep code easy to change and test:

- **S — Single Responsibility:** a module or class should have one reason to change. A \`UserService\` should not also format emails and write PDFs.
- **O — Open/Closed:** open for extension, closed for modification. Add new behaviour by adding new code (a new class or handler), not by editing a growing \`if/else\`.
- **L — Liskov Substitution:** a subtype must work anywhere its parent type works, without surprises.
- **I — Interface Segregation:** many small, focused interfaces are better than one huge one. Don't force a class to implement methods it doesn't need.
- **D — Dependency Inversion:** high-level code should depend on an **abstraction** (an interface), not on a concrete tool. Your \`OrderService\` depends on a \`PaymentGateway\` interface, not directly on Stripe.

#### Deeper version
In JavaScript/TypeScript, SOLID is usually applied with functions and modules, not deep class trees. **Dependency injection** (passing dependencies in through the constructor or function arguments) is the practical way to do D: in tests you pass a fake; in production you pass the real Stripe client.

The classic Liskov example: a \`Square\` that extends \`Rectangle\` breaks code that sets width and height separately. If a subclass must throw "not supported" for a parent method, that's a Liskov smell — and often an interface segregation problem too.

SOLID is a guide, not a law. Applied blindly it creates too many tiny abstractions. Use it where change is likely.`,
      why: `Real code changes all the time: new payment providers, new notification channels, new rules. SOLID makes those changes local and safe, makes code testable (swap real dependencies for fakes), and lets several developers work without breaking each other's code.`,
      analogy: `Think of a kitchen. Each appliance does one job (S). You add a new appliance without rebuilding the kitchen (O). Any brand of kettle works in the same socket (L). The toaster doesn't come with a washing-machine control panel (I). And appliances plug into a standard wall socket, not wired directly into the power plant (D).`,
      code: [
        {
          title: 'Open/Closed + Dependency Inversion in TypeScript',
          lang: 'typescript',
          code: `// Abstraction (the "socket")
interface Notifier {
  send(to: string, message: string): Promise<void>;
}

// Concrete tools (the "appliances")
class EmailNotifier implements Notifier {
  async send(to: string, message: string) { console.log(\`Email to \${to}: \${message}\`); }
}
class SmsNotifier implements Notifier {
  async send(to: string, message: string) { console.log(\`SMS to \${to}: \${message}\`); }
}

// High-level code depends on the interface, not on SendGrid or Twilio (D)
class OrderService {
  constructor(private notifiers: Notifier[]) {}   // injected

  async placeOrder(userContact: string) {
    // ... save order (single responsibility: ordering logic only)
    for (const n of this.notifiers) await n.send(userContact, 'Order placed!');
  }
}

// Adding WhatsApp later = a new class, no edits to OrderService (O)
const service = new OrderService([new EmailNotifier(), new SmsNotifier()]);
await service.placeOrder('asha@example.com');`,
        },
        {
          title: 'Breaking Open/Closed (what to avoid)',
          lang: 'javascript',
          code: `// Every new channel means editing this function again and again.
async function notify(type, to, msg) {
  if (type === 'email') { /* sendgrid code */ }
  else if (type === 'sms') { /* twilio code */ }
  else if (type === 'whatsapp') { /* ... */ }
  // grows forever, every change risks breaking the others
}`,
        },
      ],
      output: `Running the TypeScript example prints:
\`Email to asha@example.com: Order placed!\` and \`SMS to asha@example.com: Order placed!\`.

\`OrderService\` never imports an email or SMS library. To add WhatsApp you write a new \`WhatsAppNotifier\` class and pass it in — no existing code changes. In tests you pass a fake notifier that just records calls. The second block shows the opposite: one function that must be edited for every new channel.`,
      questions: [
        {
          q: 'Explain SOLID briefly.',
          a: 'Single responsibility: one reason to change. Open/closed: extend without modifying. Liskov: subtypes must be usable as their parent. Interface segregation: small focused interfaces. Dependency inversion: depend on abstractions, not concrete tools.',
        },
        {
          q: 'Give a real example of dependency inversion from your work.',
          a: 'My billing logic depends on a `PaymentProvider` interface. The Stripe adapter implements it. Tests inject a fake provider, and we could add another provider without touching billing logic.',
        },
        {
          q: 'What is a Liskov violation?',
          a: 'When a subclass changes expected behaviour, like a `ReadOnlyFile` that extends `File` but throws on `write()`. Code that expects any `File` now breaks.',
        },
        {
          q: 'Is SOLID only for object-oriented code?',
          a: 'No. The ideas apply to functions and modules too: small focused functions, passing dependencies as arguments, and plugging in handlers instead of editing big switch statements.',
        },
      ],
      spoken: `"SOLID is five principles for code that is easy to change. Single responsibility means one reason to change. Open/closed means I add behaviour with new code instead of editing a big if-else. Liskov means a subtype must work wherever the parent works. Interface segregation means small, focused interfaces. Dependency inversion means business logic depends on abstractions. For example, my order service depends on a Notifier interface, and email or SMS are injected. That makes it easy to test with fakes and add new channels without touching existing code."`,
      mistakes: [
        'Reciting the five names without a concrete example. Interviewers want to hear how you used them.',
        'Over-applying SOLID: an interface and a factory for every tiny class makes code harder to read.',
        'Confusing dependency inversion (a design principle) with dependency injection (a technique to achieve it).',
        'Follow-up trap: "Doesn\'t Single Responsibility mean a function should do only one thing?" Not exactly. It means one reason to change — one actor or business concern that would ask for changes.',
      ],
      takeaway: 'SOLID is about making change cheap: small focused pieces, extension over modification, and depending on interfaces you can swap.',
    },
    {
      id: 'design-patterns',
      title: 'Design Patterns: Singleton, Factory, Observer, Repository',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Named, reusable solutions to common problems. The four you will use most in Node apps: Singleton, Factory, Observer and Repository.',
      what: `A **design pattern** is a proven, named solution to a common code problem.

- **Singleton:** only one instance of something exists in the app, like a database connection pool or a logger.
- **Factory:** a function that decides **which** object to create, so the caller doesn't need to know the details. Example: \`createPaymentProvider('stripe')\`.
- **Observer (pub/sub):** objects subscribe to events and get notified when something happens. Node's \`EventEmitter\`, DOM events and React state stores use it.
- **Repository:** a layer that hides how data is stored. Business code calls \`userRepo.findByEmail()\` and doesn't care if it's MongoDB, Postgres or an in-memory fake.

#### Deeper version
- In Node, **ES modules are cached**, so exporting one instance from a module is already a singleton per process. But with many servers or serverless functions, each process has its **own** "singleton". In Next.js dev mode, hot reload can create many DB connections, which is why people store the client on \`globalThis\`.
- Singletons are global state: they make testing harder. Prefer creating them once at startup and injecting them.
- **Observer** in-process is synchronous with \`EventEmitter\` (listeners run in order on emit). Across servers you need a message broker (Redis pub/sub, Kafka, SNS).
- Other patterns worth naming: **Strategy** (swap algorithms, e.g. pricing rules), **Adapter** (wrap a third-party API into your interface), **Decorator/Middleware** (Express middleware), **Builder**.`,
      why: `Patterns give teams a shared vocabulary ("put that behind a repository") and solve recurring problems in a tested way: one shared connection pool, swappable providers, loose coupling between parts of the system, and database code you can mock in tests.`,
      analogy: `A singleton is the one president of a club. A factory is a car dealer: you say "family car" and they hand you the right model. An observer is a YouTube subscription: you get notified when a new video is posted. A repository is a librarian: you ask for a book by title and don't care which shelf or building it is in.`,
      code: [
        {
          title: 'Singleton and Factory',
          lang: 'javascript',
          code: `// db.js — Singleton: one MongoClient shared by the whole process
import { MongoClient } from 'mongodb';
let client;
export function getDb() {
  if (!client) client = new MongoClient(process.env.MONGO_URL); // created once
  return client.db('app');
}

// payments.js — Factory: caller asks for a provider by name
class StripeProvider { charge(amount) { return \`stripe charged \${amount}\`; } }
class RazorpayProvider { charge(amount) { return \`razorpay charged \${amount}\`; } }

export function createPaymentProvider(name) {
  switch (name) {
    case 'stripe': return new StripeProvider();
    case 'razorpay': return new RazorpayProvider();
    default: throw new Error(\`Unknown provider: \${name}\`);
  }
}

console.log(createPaymentProvider('stripe').charge(499));`,
        },
        {
          title: 'Observer and Repository',
          lang: 'javascript',
          code: `import { EventEmitter } from 'node:events';

// Observer: order code doesn't know who listens
const events = new EventEmitter();
events.on('order.placed', (o) => console.log('Send email for', o.id));
events.on('order.placed', (o) => console.log('Update analytics for', o.id));

// Repository: business code doesn't know the storage
class InMemoryOrderRepo {
  #rows = new Map();
  async save(order) { this.#rows.set(order.id, order); return order; }
  async findById(id) { return this.#rows.get(id) ?? null; }
}

async function placeOrder(repo, data) {
  const order = await repo.save({ id: 'ord_1', ...data });
  events.emit('order.placed', order);
  return order;
}

await placeOrder(new InMemoryOrderRepo(), { total: 499 });`,
        },
      ],
      output: `The factory prints \`stripe charged 499\`. \`getDb()\` returns the same database object every time in this process.

\`placeOrder\` prints \`Send email for ord_1\` then \`Update analytics for ord_1\` — listeners run in the order they were added. \`placeOrder\` only knows it has a repo with \`save()\`. In production you pass a \`MongoOrderRepo\`; in tests the in-memory one, with no database needed.`,
      questions: [
        {
          q: 'How do you create a singleton in Node.js?',
          a: 'Export a single instance (or a lazy getter) from a module. Modules are cached, so every import gets the same instance within that process.',
        },
        {
          q: 'Why is the Singleton pattern sometimes called an anti-pattern?',
          a: 'It is hidden global state. It couples code to one instance and makes tests harder. It is fine for things like a connection pool, but inject it rather than importing it everywhere.',
        },
        {
          q: 'What problem does the Repository pattern solve?',
          a: 'It separates business logic from data access. You can change the database, add caching, or use an in-memory fake in tests without changing business code.',
        },
        {
          q: 'Where have you used the Observer pattern?',
          a: 'Node `EventEmitter` for domain events, WebSocket subscriptions, React state stores, and webhooks are all observer-style: producers emit, subscribers react.',
        },
      ],
      spoken: `"I mostly use four patterns. Singleton for things there should be one of per process, like a database client or logger; in Node a module export already behaves like a singleton. Factory when the caller shouldn't know which concrete class to create, like picking a payment provider by name. Observer for decoupling, like emitting an order-placed event and letting email and analytics react. And Repository to hide data access behind methods like findById, so business logic doesn't depend on Mongo and tests can use an in-memory fake."`,
      mistakes: [
        'Thinking a module-level singleton is shared across servers, workers or serverless instances. It is one per process.',
        'Creating a new DB client per request instead of reusing one, which exhausts connections.',
        'Forgetting to remove event listeners, which causes memory leaks (Node warns after 10 listeners per event by default).',
        'Follow-up trap: "Is EventEmitter asynchronous?" No. `emit()` calls listeners synchronously, in order. A slow listener blocks the emitter.',
      ],
      takeaway: 'Singleton for shared resources, Factory to choose implementations, Observer to decouple, Repository to hide storage — and know each one\'s cost.',
    },
    {
      id: 'sql-vs-nosql',
      title: 'Choosing a Database: SQL vs NoSQL',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'SQL gives strict schemas, joins and strong transactions; NoSQL gives flexible schemas and easy horizontal scaling. Pick by data shape and access patterns.',
      what: `**SQL (relational)** databases like PostgreSQL and MySQL store data in tables with a fixed schema. They support **joins** and strong **ACID transactions** (all-or-nothing, consistent, isolated, durable).

**NoSQL** is a family:
- **Document** (MongoDB): JSON-like documents, flexible schema.
- **Key-value** (Redis, DynamoDB): super-fast lookups by key.
- **Wide-column** (Cassandra): huge write volumes across many machines.
- **Graph** (Neo4j): relationships like friends-of-friends.

#### Deeper version
The real question is **access patterns**: how will you read and write the data?
- Lots of relationships and reports, money, inventory → SQL.
- Data read as one unit (a course with its lessons), evolving schema → document DB.
- Massive write-heavy time-series or chat messages → wide-column.
- Caching, sessions, counters, rate limits → key-value.

The lines are blurry now: MongoDB has multi-document transactions, Postgres has \`JSONB\`. Many systems use **polyglot persistence**: Postgres for billing, MongoDB for content, Redis for cache, Elasticsearch for search.

For NoSQL, **model for your queries**: embed data that is read together, reference data that grows without limit or is shared.`,
      why: `The database is the hardest part of a system to change later. Picking based on data shape, consistency needs and scale avoids painful migrations and performance problems.`,
      analogy: `SQL is a well-organised spreadsheet with strict columns and links between sheets. A document database is a set of folders, where each folder holds everything about one thing. A key-value store is a coat check: give a ticket, get your coat back instantly.`,
      code: [
        {
          title: 'Same data, two models',
          lang: 'sql',
          code: `-- SQL: normalised tables + join
CREATE TABLE courses (id SERIAL PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id),
  title TEXT NOT NULL,
  position INT NOT NULL
);

SELECT c.title, l.title AS lesson
FROM courses c JOIN lessons l ON l.course_id = c.id
WHERE c.id = 1
ORDER BY l.position;`,
        },
        {
          title: 'MongoDB: embed what you read together',
          lang: 'javascript',
          code: `// One read returns the course and its lessons together
await db.collection('courses').insertOne({
  _id: 1,
  title: 'Node Basics',
  lessons: [                       // embedded: bounded, read together
    { title: 'Intro', position: 1 },
    { title: 'Event loop', position: 2 },
  ],
});

const course = await db.collection('courses').findOne({ _id: 1 });

// Enrollments grow without limit -> separate collection with a reference
await db.collection('enrollments').insertOne({ courseId: 1, userId: 'u_9' });`,
        },
      ],
      output: `In SQL, lessons live in their own table and you join them. In MongoDB, lessons are embedded, so one \`findOne\` returns everything with no join. But enrollments (which can grow to millions) go in a separate collection, because a single MongoDB document has a 16 MB limit and huge arrays are slow to update.`,
      questions: [
        {
          q: 'When would you pick PostgreSQL over MongoDB?',
          a: 'When data is highly relational, I need complex joins and reports, or strong multi-row transactions — like billing, orders and inventory.',
        },
        {
          q: 'When would you pick MongoDB?',
          a: 'When data is naturally document-shaped and read as a unit, the schema evolves quickly, and I want easy horizontal scaling with sharding.',
        },
        {
          q: 'Embed or reference in MongoDB?',
          a: 'Embed when data is read together and bounded in size. Reference when it is shared by many documents, updated independently, or can grow without limit.',
        },
        {
          q: 'Can you use more than one database in a system?',
          a: 'Yes, that is polyglot persistence. For example Postgres for payments, MongoDB for content, Redis for caching and rate limits. The cost is more operations and keeping data in sync.',
        },
      ],
      spoken: `"I choose the database based on data shape and access patterns. For relational data with joins and strong transactions, like billing and orders, I pick PostgreSQL. For document-shaped data that is read together and changes shape often, like course content or user profiles, MongoDB works well, and it shards easily. Redis is for caching, sessions and counters. In MongoDB I model for my queries: embed what is read together and bounded, and reference what grows without limit. Many real systems combine several databases for different jobs."`,
      mistakes: [
        'Saying "NoSQL scales, SQL doesn\'t". Postgres scales very far with replicas and partitioning; the choice is about data and access patterns.',
        'Designing MongoDB like SQL tables, with joins ($lookup) everywhere.',
        'Embedding unbounded arrays (all comments of a post) inside one document.',
        'Follow-up trap: "Does MongoDB support transactions?" Yes, multi-document ACID transactions on replica sets since 4.0 (sharded clusters since 4.2), but good schema design should make them rare.',
      ],
      takeaway: 'Pick the database by data shape, consistency needs and access patterns — and it is fine to use more than one.',
    },
    {
      id: 'twelve-factor-app',
      title: 'The 12-Factor App',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Twelve rules for cloud-ready apps: config in env vars, stateless processes, backing services as attachable resources, logs as streams, and more.',
      what: `The **12-Factor App** is a set of 12 rules for building apps that run well in the cloud and scale easily. The most useful ones day to day:

- **Config in environment variables** — no secrets or URLs hard-coded in code.
- **Stateless processes** — keep nothing important in memory or on local disk.
- **Backing services as attached resources** — a database or Redis is just a URL you can swap.
- **Build, release, run are separate** — build once, then combine with config per environment.
- **Logs as event streams** — write to stdout; the platform collects them.
- **Dev/prod parity** — keep environments as similar as possible (Docker helps).
- **Disposability** — start fast, shut down gracefully.

#### Deeper version
All 12 factors: 1. Codebase (one repo, many deploys) 2. Dependencies (declared explicitly, e.g. \`package.json\` + lockfile) 3. Config (env vars) 4. Backing services 5. Build/release/run 6. Processes (stateless) 7. Port binding (the app exports HTTP by binding a port) 8. Concurrency (scale out by running more processes) 9. Disposability 10. Dev/prod parity 11. Logs 12. Admin processes (migrations and scripts run as one-off processes in the same environment).

Graceful shutdown in Node means: on \`SIGTERM\`, stop accepting new requests, finish in-flight ones, close DB connections, then exit. Kubernetes and ECS send \`SIGTERM\` before killing a container.`,
      why: `Following these rules makes an app easy to deploy to any cloud, scale horizontally, and run in many environments (dev, staging, prod) with the same build. It removes classic problems like "works on my machine" and secrets leaking into Git.`,
      analogy: `It is like a standard shipping container. Any ship, train or truck can carry it, because the contents are packed the same standard way. A 12-factor app is a standard container for code that any cloud can run.`,
      code: [
        {
          title: 'Config from env, logs to stdout, graceful shutdown',
          lang: 'javascript',
          code: `import express from 'express';

// Factor 3: config from the environment, fail fast if missing
const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
};
if (!config.databaseUrl) throw new Error('DATABASE_URL is required');

const app = express();
app.get('/health', (req, res) => res.json({ ok: true }));

// Factor 7: bind to a port
const server = app.listen(config.port, () => {
  // Factor 11: log to stdout as structured JSON
  console.log(JSON.stringify({ level: 'info', msg: 'server started', port: config.port }));
});

// Factor 9: graceful shutdown
process.on('SIGTERM', () => {
  console.log(JSON.stringify({ level: 'info', msg: 'SIGTERM received, draining' }));
  server.close(() => {          // stop new connections, finish current ones
    // close DB / Redis connections here
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // hard stop after 10s
});`,
        },
      ],
      output: `The same Docker image runs in dev, staging and prod; only the env vars change. If \`DATABASE_URL\` is missing, the app crashes at startup with a clear message instead of failing later. Logs go to stdout as JSON, so CloudWatch or GCP Logging can collect and search them. On deploy, the platform sends \`SIGTERM\`; the server stops taking new requests, finishes current ones, then exits — no dropped requests.`,
      questions: [
        {
          q: 'What is the 12-factor app?',
          a: 'A methodology for building cloud-native apps: config in env vars, stateless processes, logs as streams, explicit dependencies, dev/prod parity, fast startup and graceful shutdown, among others.',
        },
        {
          q: 'Why store config in environment variables?',
          a: 'So the same build runs in every environment, and secrets never go into the code repository. In production, values often come from a secrets manager injected as env vars.',
        },
        {
          q: 'How do you do a graceful shutdown in Node?',
          a: 'Listen for SIGTERM, call `server.close()` to stop new connections and let in-flight requests finish, close DB connections, then exit, with a timeout as a safety net.',
        },
      ],
      spoken: `"The 12-factor app is a checklist for cloud-ready services. The parts I use every day are: config and secrets come from environment variables, so one build runs everywhere; processes are stateless, so we can scale out; backing services like Mongo or Redis are just URLs we can swap; logs go to stdout as structured JSON for the platform to collect; and the app starts fast and shuts down gracefully on SIGTERM. Following it is what makes Docker, Kubernetes and autoscaling work smoothly."`,
      mistakes: [
        'Committing `.env` files with real secrets to Git.',
        'Building a different Docker image per environment instead of one image plus different config.',
        'Writing logs to local files inside a container, where they disappear on restart.',
        'Follow-up trap: "Are env vars safe for secrets?" They are better than code, but they can leak into logs or crash dumps. Use a secrets manager (AWS Secrets Manager, GCP Secret Manager) and never log the whole `process.env`.',
      ],
      takeaway: 'Config in env, stateless processes, logs to stdout, graceful shutdown — that is what makes an app cloud-ready.',
    },
    {
      id: 'serverless',
      title: 'Serverless Architecture',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'You write functions; the cloud runs, scales and bills them per request. Great for spiky traffic, with trade-offs like cold starts and time limits.',
      what: `**Serverless** means you don't manage servers. You upload a function (or container), and the cloud provider runs it when an event happens: an HTTP request, a file upload, a queue message or a schedule. It scales automatically, even to zero, and you pay only for the time it runs.

Examples: AWS Lambda, Google Cloud Functions / Cloud Run, Vercel and Netlify functions. "Serverless" also covers managed services like DynamoDB, S3, SQS and Firestore.

#### Deeper version
Trade-offs to know:
- **Cold start:** the first request to a new instance must start the runtime and load your code, adding latency (often hundreds of ms, more with big bundles). Mitigate with smaller bundles, keeping init light, or provisioned/minimum instances.
- **Time and memory limits:** functions have a max duration (AWS Lambda's maximum is 15 minutes; other platforms differ — check current docs). Long jobs belong in queues/containers.
- **Statelessness:** each invocation may be a new instance. Anything in memory may vanish.
- **Database connections:** thousands of concurrent functions can exhaust a database's connection limit. Use connection reuse outside the handler, a pooler (RDS Proxy, PgBouncer), or HTTP-based databases.
- **Cost model:** cheap at low or spiky traffic, can be more expensive than containers at high, steady traffic.
- **Vendor lock-in** and harder local testing/debugging.`,
      why: `Serverless removes server management (patching, scaling, capacity planning), so small teams can ship fast. It is ideal for event-driven work like webhooks, image processing, cron jobs, and APIs with unpredictable traffic.`,
      analogy: `Owning a server is like owning a car: you pay for it even when it's parked. Serverless is like a taxi: you pay only for the rides, there's always one available, but sometimes you wait a little for it to arrive (cold start), and you can't take it on a 3-day road trip (time limit).`,
      code: [
        {
          title: 'AWS Lambda handler with connection reuse',
          lang: 'javascript',
          code: `import { MongoClient } from 'mongodb';

// Created OUTSIDE the handler: reused while this instance stays "warm"
const client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 1 });
const ready = client.connect();

export const handler = async (event) => {
  await ready;
  const body = JSON.parse(event.body ?? '{}');

  const result = await client.db('app').collection('leads').insertOne({
    email: body.email,
    createdAt: new Date(),
  });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: result.insertedId }),
  };
};`,
        },
      ],
      output: `When a request arrives, AWS starts an instance (cold start), runs the code outside the handler once (creating the DB client), then calls \`handler\`. Later requests to the same warm instance skip setup and reuse the connection. If 100 requests come at once, AWS runs up to 100 instances in parallel — each with its own connection, which is why \`maxPoolSize\` is kept small and a connection limit plan matters.`,
      questions: [
        {
          q: 'What is a cold start and how do you reduce it?',
          a: 'The extra delay when a new function instance starts. Reduce it with smaller bundles, fewer heavy imports, lazy loading, a faster runtime, or provisioned/minimum instances.',
        },
        {
          q: 'When is serverless a bad fit?',
          a: 'Long-running jobs, steady very high traffic (containers are cheaper), workloads needing persistent connections or local state, and very latency-sensitive paths where cold starts hurt.',
        },
        {
          q: 'How do you handle database connections in Lambda?',
          a: 'Create the client outside the handler so warm instances reuse it, keep the pool small, and use a proxy like RDS Proxy or PgBouncer, or an HTTP-based data API.',
        },
        {
          q: 'Serverless vs containers?',
          a: 'Serverless: zero ops, scales to zero, pay per use, but limits and cold starts. Containers (ECS, Cloud Run, Kubernetes): more control, no hard duration limits, better for steady load.',
        },
      ],
      spoken: `"Serverless means I deploy functions and the provider handles servers, scaling and billing per invocation. It's great for spiky or event-driven work like webhooks, file processing and scheduled jobs, and it scales to zero so it's cheap at low traffic. The trade-offs are cold starts, execution time limits, no local state, and database connection storms when many instances run at once. I reduce those by keeping bundles small, creating clients outside the handler, using a connection proxy, and moving long jobs to queues or containers."`,
      mistakes: [
        'Opening a new database connection inside the handler on every request.',
        'Putting long video processing in a function that hits the time limit. Use a queue plus a container or a job service.',
        'Assuming in-memory variables persist between invocations. Sometimes they do (warm instance), often they don\'t.',
        'Follow-up trap: "What happens if a Lambda triggered by a queue fails?" The message is retried; after max retries it should go to a dead-letter queue. So the handler must be idempotent.',
      ],
      takeaway: 'Serverless trades control for zero ops and pay-per-use; design around cold starts, limits, statelessness and connection counts.',
    },
    {
      id: 'event-driven-architecture',
      title: 'Event-Driven Architecture',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Services publish events ("OrderPlaced") and other services react to them, instead of calling each other directly.',
      what: `In **event-driven architecture**, a service announces that something happened by publishing an **event**, like \`OrderPlaced\` or \`UserSignedUp\`. Other services **subscribe** and react: send an email, update analytics, give a reward. The publisher doesn't know or care who listens.

Compare:
- **Request/response (sync):** Orders calls Email, then calls Analytics, and waits for each.
- **Event-driven (async):** Orders publishes one event and moves on. Email and Analytics consume it in their own time.

#### Deeper version
Key ideas:
- **Event vs command:** an event is a fact in the past ("OrderPlaced"); a command is a request ("SendEmail"). Events can have many listeners; commands have one handler.
- **Event notification vs event-carried state transfer:** a thin event carries only an ID (listeners call back for details); a fat event carries the data needed (no callback, but bigger and needs versioning).
- **Brokers:** Kafka, RabbitMQ, AWS SNS/SQS/EventBridge, GCP Pub/Sub, Redis Streams.
- **Delivery is usually at-least-once**, so consumers must be **idempotent** (handle duplicates safely).
- **Ordering** is only guaranteed within a partition/key, not globally.
- **Eventual consistency:** other services catch up a bit later.
- **Schema evolution:** add fields, don't rename or remove; include a version field.
- Hard parts: debugging a flow across services (use correlation IDs and tracing) and publishing events reliably with your DB write (outbox pattern).`,
      why: `It decouples services: you add a new feature (like a "loyalty points" service) by subscribing to existing events, without touching the publisher. It also improves resilience (if Email is down, orders still work; events wait) and lets each consumer scale on its own.`,
      analogy: `A radio station broadcasts the news. It doesn't know who is listening. Anyone can tune in, and new listeners don't need the station's permission. If your radio is off, some stations (like a podcast) keep the episode so you can catch up later — that's a durable event log.`,
      code: [
        {
          title: 'Publish once, many independent consumers (Redis Streams)',
          lang: 'javascript',
          code: `import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

// Producer: Orders service publishes a fact
export async function publishOrderPlaced(order) {
  await redis.xAdd('events:orders', '*', {
    type: 'OrderPlaced',
    version: '1',
    orderId: order.id,
    userId: order.userId,
    total: String(order.total),
  });
}

// Consumer: each service has its OWN consumer group,
// so every group receives every event once.
export async function runConsumer(group, handle) {
  try {
    await redis.xGroupCreate('events:orders', group, '0', { MKSTREAM: true });
  } catch { /* group already exists */ }

  while (true) {
    const res = await redis.xReadGroup(group, 'worker-1',
      { key: 'events:orders', id: '>' }, { COUNT: 10, BLOCK: 5000 });
    for (const msg of res?.[0]?.messages ?? []) {
      await handle(msg.message);                           // must be idempotent
      await redis.xAck('events:orders', group, msg.id);    // mark done
    }
  }
}

// e.g. runConsumer('email-service', (e) => sendReceipt(e.orderId));
//      runConsumer('analytics', (e) => trackRevenue(e.total));`,
        },
      ],
      output: `The Orders service writes one \`OrderPlaced\` entry and returns to the user immediately. The \`email-service\` group and the \`analytics\` group each read that same event independently and acknowledge it. If the email service is down for 10 minutes, its events wait in the stream; when it restarts, it continues from where it stopped. Adding a new "loyalty" consumer needs zero changes in Orders.`,
      questions: [
        {
          q: 'What are the benefits of event-driven architecture?',
          a: 'Loose coupling, easier extension (new consumers without changing producers), better resilience to downstream outages, and independent scaling of consumers.',
        },
        {
          q: 'What are the downsides?',
          a: 'Eventual consistency, harder debugging and tracing, duplicate and out-of-order events, and the need to manage event schemas and versions.',
        },
        {
          q: 'What is the difference between an event and a command?',
          a: 'An event says something already happened and can have many listeners. A command asks one specific service to do something.',
        },
        {
          q: 'How do you handle duplicate events?',
          a: 'Make consumers idempotent: store processed event IDs, or use upserts and unique constraints so processing twice has the same result as once.',
        },
      ],
      spoken: `"In event-driven architecture, services publish facts like OrderPlaced to a broker, and other services subscribe and react. The producer doesn't know who's listening, so I can add features like analytics or loyalty points without touching it, and a slow or down consumer doesn't block the main flow. The trade-offs are eventual consistency, harder debugging, and at-least-once delivery, so I make consumers idempotent, add correlation IDs for tracing, version event schemas, and use the outbox pattern to publish events reliably with the database write."`,
      mistakes: [
        'Assuming exactly-once delivery. Plan for duplicates and make handlers idempotent.',
        'Assuming global ordering of events. Ordering is usually only per partition or key.',
        'Writing to the DB and then publishing the event in two separate steps — if the app crashes in between, the event is lost. Use the outbox pattern.',
        'Follow-up trap: "How do you debug a flow across five services?" Pass a correlation/trace ID in every event and use distributed tracing (OpenTelemetry) plus centralised logs.',
      ],
      takeaway: 'Events decouple services and absorb failures, but you must design for duplicates, ordering, eventual consistency and tracing.',
    },
    {
      id: 'message-queues',
      title: 'Message Queues (SQS, RabbitMQ, Kafka)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A buffer between services: producers drop messages in, consumers take them out at their own pace. Gives async work, smoothing of spikes and retries.',
      what: `A **message queue** is a place where one service (the **producer**) puts messages, and another service (the **consumer**) takes them out and processes them later. The producer doesn't wait.

Why it's useful:
- **Async work:** the API answers fast; slow work (emails, PDFs, AI calls) happens in the background.
- **Load levelling:** a spike of 10,000 messages waits in the queue; consumers work through it at a safe speed.
- **Reliability:** if a consumer crashes, the message stays and is retried.

Two styles:
- **Point-to-point (queue):** each message is handled by **one** consumer (SQS, RabbitMQ queue, BullMQ).
- **Pub/sub (topic):** each message goes to **every** subscriber group (SNS, Kafka consumer groups, GCP Pub/Sub).

#### Deeper version
- **Acknowledgement:** a consumer confirms it finished. Without an ack (for example, a crash), the message becomes visible again (SQS **visibility timeout**) and is redelivered.
- **Delivery guarantees:** at-most-once (may lose), at-least-once (may duplicate — the usual default), exactly-once (very hard; in practice "at-least-once + idempotent consumer").
- **Dead-letter queue (DLQ):** messages that fail N times are moved aside for inspection, so one "poison" message doesn't block everything.
- **Ordering:** standard SQS is best-effort order; SQS FIFO and Kafka partitions give order per group/key.
- **Kafka vs RabbitMQ/SQS:** Kafka is a **log** — messages are kept for a retention period and consumers track their own offset, so you can **replay** history and have many independent readers. RabbitMQ/SQS delete a message once it is acknowledged; they're simpler for task distribution.
- **Backpressure:** watch queue depth and age of the oldest message; autoscale consumers on it.`,
      why: `Direct synchronous calls couple services together: if the email provider is slow, your signup API is slow; if it's down, signups fail. A queue decouples timing and failure, absorbs spikes, and gives you retries and visibility for free.`,
      analogy: `A queue is the order rail in a restaurant kitchen. Waiters (producers) clip order tickets on the rail and go back to customers. Cooks (consumers) take tickets one by one. During a rush, tickets pile up but nothing is lost, and the manager can add another cook.`,
      code: [
        {
          title: 'AWS SQS producer and consumer',
          lang: 'javascript',
          code: `import {
  SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: 'ap-south-1' });
const QueueUrl = process.env.EMAIL_QUEUE_URL;

// Producer (inside the API): fast, no waiting for the email provider
export async function enqueueWelcomeEmail(userId) {
  await sqs.send(new SendMessageCommand({
    QueueUrl,
    MessageBody: JSON.stringify({ type: 'welcome', userId }),
  }));
}

// Consumer (separate worker process)
export async function poll() {
  while (true) {
    const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({
      QueueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 20, // long polling
    }));
    for (const m of Messages) {
      try {
        await sendEmail(JSON.parse(m.Body));
        // Delete = acknowledge. If we crash before this, SQS redelivers.
        await sqs.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: m.ReceiptHandle }));
      } catch (err) {
        console.error('will retry after visibility timeout', err.message);
      }
    }
  }
}

async function sendEmail(job) { console.log('sending', job.type, 'to', job.userId); }`,
        },
      ],
      output: `The signup API calls \`enqueueWelcomeEmail\` and returns in a few milliseconds. The worker long-polls (waits up to 20 seconds for messages, which saves cost), sends each email, then deletes the message. If sending throws, the message is not deleted; after the visibility timeout it reappears and is retried. With a redrive policy, after (say) 5 failures SQS moves it to a dead-letter queue.`,
      questions: [
        {
          q: 'Why use a message queue?',
          a: 'To do slow work asynchronously, decouple services, absorb traffic spikes, and get retries. The producer stays fast even if the consumer is slow or down.',
        },
        {
          q: 'Kafka vs RabbitMQ (or SQS)?',
          a: 'Kafka is a durable, partitioned log: messages are retained, consumers track offsets, you can replay, and throughput is huge. RabbitMQ/SQS are task queues: messages are removed after ack, with simpler routing and per-message retries.',
        },
        {
          q: 'What is a dead-letter queue?',
          a: 'A separate queue where messages go after failing a set number of times. It stops poison messages from retrying forever and lets you inspect and replay them later.',
        },
        {
          q: 'What does at-least-once delivery mean for your code?',
          a: 'You may receive the same message more than once, so the consumer must be idempotent — processing twice must have the same effect as once.',
        },
      ],
      spoken: `"A message queue sits between a producer and a consumer. The API drops a message and returns quickly, and workers process it at their own pace. That decouples services, smooths traffic spikes, and gives retries: if a worker crashes before acknowledging, the message is redelivered, and after several failures it goes to a dead-letter queue. Most queues are at-least-once, so I always make consumers idempotent. For simple task distribution I use SQS or BullMQ; when I need a replayable event log with many independent consumers and high throughput, I'd pick Kafka."`,
      mistakes: [
        'Acknowledging (deleting) the message before the work is done — a crash then loses it.',
        'No dead-letter queue, so one bad message retries forever and blocks or wastes workers.',
        'Setting the visibility timeout shorter than the processing time, so a second worker picks up the same message mid-processing.',
        'Follow-up trap: "Can a queue guarantee exactly-once?" End-to-end exactly-once is very hard. Design for at-least-once and make the consumer idempotent.',
      ],
      takeaway: 'Queues decouple and buffer work; always plan for retries, a dead-letter queue, and duplicate messages.',
    },
    {
      id: 'job-queues-bullmq',
      title: 'Job Queues with BullMQ (Retries, Backoff, Delayed & Repeatable Jobs)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'BullMQ is a Redis-backed job queue for Node: add jobs to a Queue, process them in Workers, with retries, backoff, delays, priorities and scheduled jobs.',
      what: `**BullMQ** is a popular Node.js library for **background jobs**, using Redis to store them.

- **Queue:** where you add jobs (\`queue.add('send-email', data)\`).
- **Worker:** a process that picks jobs and runs your function. You can run many workers on many machines.
- **Job:** one unit of work with data, a status (waiting, active, completed, failed, delayed), and options.

Useful options:
- **attempts** + **backoff:** retry a failed job, waiting longer each time (fixed or exponential).
- **delay:** run the job later (for example, a reminder email in 24 hours).
- **repeatable jobs:** run on a schedule using a cron pattern (daily reports).
- **priority**, **concurrency** (jobs per worker at once), and **rate limiting** (max N jobs per period).

#### Deeper version
- **Exponential backoff:** delays like 1s, 2s, 4s, 8s... give a struggling API time to recover. Pair it with a max attempt count.
- **Idempotency / dedup:** pass a custom \`jobId\` (like \`invoice-\${invoiceId}\`); adding a job with an existing ID is ignored while that job still exists.
- **Stalled jobs:** if a worker dies mid-job, its lock expires and BullMQ moves the job back to waiting so another worker retries it. So your job code must be safe to run twice.
- **Graceful shutdown:** call \`worker.close()\` on SIGTERM so active jobs finish.
- **Cleanup:** use \`removeOnComplete\` / \`removeOnFail\` so Redis doesn't fill up.
- **Flows:** parent/child job dependencies.
- Scheduling API: older versions use the \`repeat\` option; newer BullMQ versions add **job schedulers** (\`upsertJobScheduler\`). Check the docs for your version.
- Redis must be configured so it does not evict BullMQ keys (\`maxmemory-policy noeviction\`).`,
      why: `Some work is too slow or too unreliable to do inside an HTTP request: sending emails, generating PDFs, calling LLM APIs, processing videos, syncing to a CRM. A job queue gives you fast APIs, automatic retries, scheduling, and horizontal scaling of workers — with a dashboard of what failed and why.`,
      analogy: `BullMQ is a to-do board in an office. The manager (your API) pins task cards on the board. Workers take cards, do them, and move them to "done". If a task fails, the card goes back with a note "try again in 5 minutes". Some cards say "do this every Monday at 9".`,
      code: [
        {
          title: 'Queue with retries, backoff, delay and a schedule',
          lang: 'javascript',
          code: `import { Queue } from 'bullmq';

const connection = { host: process.env.REDIS_HOST ?? '127.0.0.1', port: 6379 };
export const emailQueue = new Queue('emails', { connection });

// 1. Normal job with retries + exponential backoff (1s, 2s, 4s, 8s)
await emailQueue.add('welcome', { userId: 'u_1' }, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 1000,   // keep only the last 1000 completed jobs
  removeOnFail: 5000,
});

// 2. Delayed job: reminder after 24 hours, deduped by jobId
await emailQueue.add('trial-reminder', { userId: 'u_1' }, {
  delay: 24 * 60 * 60 * 1000,
  jobId: 'trial-reminder-u_1',
});

// 3. Repeatable job: daily digest at 09:00 (cron pattern)
await emailQueue.add('daily-digest', {}, { repeat: { pattern: '0 9 * * *' } });`,
        },
        {
          title: 'Worker with concurrency and graceful shutdown',
          lang: 'javascript',
          code: `import { Worker } from 'bullmq';

const connection = { host: process.env.REDIS_HOST ?? '127.0.0.1', port: 6379 };

const worker = new Worker('emails', async (job) => {
  console.log(\`Processing \${job.name} (attempt \${job.attemptsMade + 1})\`);
  if (job.name === 'welcome') await sendWelcome(job.data.userId);
  return { sentAt: Date.now() };          // stored as job.returnvalue
}, { connection, concurrency: 10 });      // up to 10 jobs in parallel

worker.on('failed', (job, err) => {
  console.error(\`Job \${job?.id} failed: \${err.message}\`);
});

process.on('SIGTERM', async () => {
  await worker.close();                    // let active jobs finish
  process.exit(0);
});

async function sendWelcome(userId) {
  if (Math.random() < 0.3) throw new Error('Email provider timeout');
  console.log('Welcome email sent to', userId);
}`,
        },
      ],
      output: `The API adds jobs and returns immediately. The worker picks up \`welcome\`. If \`sendWelcome\` throws, BullMQ retries it after about 1s, then 2s, 4s, 8s — up to 5 attempts in total — then marks it failed and fires the \`failed\` event. The trial reminder sits in the delayed set for 24 hours, and adding it twice with the same \`jobId\` does not create a duplicate. The digest runs every day at 09:00 no matter how many API servers you have, because the schedule lives in Redis, not in each process.`,
      questions: [
        {
          q: 'How do retries and backoff work in BullMQ?',
          a: 'Set `attempts` and `backoff` on the job. When the processor throws, the job is retried after the backoff delay — fixed, or exponential where the wait doubles each time — until attempts run out, then it is marked failed.',
        },
        {
          q: 'How do you avoid duplicate jobs?',
          a: 'Use a deterministic `jobId`, such as `invoice-123`. BullMQ ignores adding a job whose ID already exists. Still make the processor idempotent, because a stalled job can run again.',
        },
        {
          q: 'Why not use node-cron inside the API for scheduled jobs?',
          a: 'With several API instances, each one runs the cron, so the job runs many times. A repeatable BullMQ job is stored once in Redis and run by one worker.',
        },
        {
          q: 'How do you scale BullMQ processing?',
          a: 'Increase worker concurrency for I/O-bound jobs, and run more worker processes or containers. Use the rate limiter to respect third-party API limits.',
        },
        {
          q: 'What happens if a worker crashes mid-job?',
          a: 'The job lock expires, BullMQ detects it as stalled, and moves it back to waiting so another worker picks it up. That is why job handlers must be safe to run more than once.',
        },
      ],
      spoken: `"I use BullMQ for background jobs in Node. The API adds jobs to a Redis-backed queue and returns quickly, and separate worker processes handle them. I set attempts with exponential backoff so flaky providers get retried, use delayed jobs for things like trial reminders, and repeatable jobs with a cron pattern for daily digests, so they run once even with many servers. I use custom job IDs to deduplicate, keep handlers idempotent because stalled jobs can rerun, clean up completed jobs, and close workers gracefully on SIGTERM."`,
      mistakes: [
        'Doing CPU-heavy work in a worker with high concurrency — it blocks the event loop. Use sandboxed processors or separate processes for CPU work.',
        'Never cleaning completed and failed jobs, so Redis memory keeps growing.',
        'Using a Redis eviction policy that deletes BullMQ keys, which silently loses jobs.',
        'Retrying errors that will never succeed (like "user not found"). Throw an unrecoverable error or skip retries for those.',
        'Follow-up trap: "BullMQ or SQS?" BullMQ is great when you already have Redis and want rich features (delays, priorities, schedules, dashboards). SQS is fully managed and very durable, with fewer features.',
      ],
      takeaway: 'BullMQ = Queue + Workers on Redis; use attempts with exponential backoff, jobIds for dedup, delayed/repeatable jobs for scheduling, and idempotent handlers.',
    },
    {
      id: 'idempotency',
      title: 'Idempotency and Safe Retries',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'An operation is idempotent if doing it twice has the same effect as doing it once. Essential for retries, webhooks and payments.',
      what: `**Idempotent** means: running the same operation many times gives the same result as running it once.

- \`GET /users/1\` — idempotent (just reads).
- \`PUT /users/1 { name: "Asha" }\` — idempotent (sets the same value).
- \`DELETE /users/1\` — idempotent (it's gone either way).
- \`POST /payments\` — **not** idempotent by default. Sending it twice can charge the card twice!

In distributed systems, retries are everywhere (network timeouts, queue redelivery, webhook retries). So operations with side effects must be made idempotent.

#### Deeper version
Techniques:
- **Idempotency key:** the client sends a unique key (a UUID) in a header like \`Idempotency-Key\`. The server stores the key with the result. If the same key comes again, it returns the saved result instead of doing the work again. Stripe's API works this way.
- **Unique constraints:** a unique index on \`eventId\` or \`orderId\` makes a second insert fail safely.
- **Upserts and conditional updates:** \`updateOne({ _id, status: 'pending' }, { $set: { status: 'paid' } })\` only changes the row once.
- **Processed-events table:** for webhooks and queue consumers, record the event ID; skip if already seen.

Watch the race: two identical requests can arrive at the same time. Store the key **atomically** first (unique index or Redis \`SET NX\`), then do the work.`,
      why: `A timeout doesn't tell you if the server did the work or not. Without idempotency, a safe retry becomes a double charge, a duplicate order or two welcome emails. Idempotency is what makes retries, queues and webhooks safe.`,
      analogy: `A lift (elevator) call button is idempotent: pressing it five times doesn't call five lifts. A vending machine "buy" button is not: pressing twice can take your money twice — unless the machine remembers "this coin was already used".`,
      code: [
        {
          title: 'Idempotency-Key middleware with Redis',
          lang: 'javascript',
          code: `import express from 'express';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();
const app = express();
app.use(express.json());

app.post('/payments', async (req, res) => {
  const key = req.get('Idempotency-Key');
  if (!key) return res.status(400).json({ error: 'Idempotency-Key header required' });

  const redisKey = \`idem:\${key}\`;
  // Atomically claim the key. NX = only set if it does not exist.
  const claimed = await redis.set(redisKey, 'IN_PROGRESS', { NX: true, EX: 86400 });

  if (!claimed) {
    const saved = await redis.get(redisKey);
    if (saved === 'IN_PROGRESS') return res.status(409).json({ error: 'Request in progress' });
    return res.status(200).json(JSON.parse(saved));        // replay saved result
  }

  try {
    const result = { paymentId: 'pay_' + Date.now(), amount: req.body.amount, status: 'succeeded' };
    await redis.set(redisKey, JSON.stringify(result), { EX: 86400 });
    res.status(201).json(result);
  } catch (err) {
    await redis.del(redisKey);   // allow a real retry after failure
    res.status(500).json({ error: 'Payment failed' });
  }
});

app.listen(3000);`,
        },
        {
          title: 'Idempotent webhook / queue consumer with a unique index',
          lang: 'javascript',
          code: `// One-time setup: db.processedEvents.createIndex({ eventId: 1 }, { unique: true })
export async function handleEvent(db, event) {
  try {
    await db.collection('processedEvents').insertOne({ eventId: event.id, at: new Date() });
  } catch (err) {
    if (err.code === 11000) return 'duplicate - skipped';   // already processed
    throw err;
  }
  await db.collection('orders').updateOne(
    { _id: event.orderId, status: 'pending' },               // conditional update
    { $set: { status: 'paid' } },
  );
  return 'processed';
}`,
        },
      ],
      output: `The client sends \`POST /payments\` with \`Idempotency-Key: 7f3c...\`. The first request claims the key, does the work and saves the result. If the network drops and the client retries with the same key, the server returns the saved result with no second charge. If both copies arrive at the same moment, only one wins \`SET NX\`; the other gets 409.

In the consumer, the second delivery of the same event fails the unique insert (error code 11000) and is skipped. A small gap remains: if the process crashes after recording the event but before updating the order, the retry would skip it. In production, do both writes in one transaction, or record the event after the work.`,
      questions: [
        {
          q: 'What does idempotent mean? Which HTTP methods are idempotent?',
          a: 'Calling it many times has the same effect as once. GET, PUT, DELETE, HEAD and OPTIONS are idempotent by spec; POST and PATCH are not by default.',
        },
        {
          q: 'How would you make a payment API safe to retry?',
          a: 'Require an Idempotency-Key from the client, store it atomically with the result, and return the stored result for repeated keys. Also pass the key to the payment provider (Stripe supports idempotency keys).',
        },
        {
          q: 'How do you handle duplicate webhooks?',
          a: 'Store each event ID with a unique index or in a processed set; skip if already present. Also make the state change conditional, like "only mark paid if currently pending".',
        },
      ],
      spoken: `"Idempotent means doing something twice has the same effect as doing it once. It matters because in distributed systems retries are normal: network timeouts, queue redelivery, webhook retries. GET, PUT and DELETE are idempotent, but POST isn't, so for things like payments I require an Idempotency-Key header, claim it atomically in Redis or with a unique index, and return the saved result on repeats. For webhooks and queue consumers I record processed event IDs and use conditional updates, so a duplicate event can't double-charge or double-email anyone."`,
      mistakes: [
        'Checking "does the key exist?" and then inserting in two separate steps — two parallel requests both pass the check. Claim the key atomically.',
        'Using the request timestamp as the idempotency key; retries get a new timestamp.',
        'Storing idempotency keys forever without a TTL, or for too short a time to cover the retry window.',
        'Follow-up trap: "Is PUT always idempotent?" By design it should be, but if your PUT handler increments a counter or appends to a list, you broke it.',
      ],
      takeaway: 'Assume every request and message can arrive twice; idempotency keys, unique constraints and conditional updates make retries safe.',
    },
    {
      id: 'database-scaling',
      title: 'Database Scaling: Replicas, Sharding, Partitioning, Connection Pooling',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Scale reads with replicas, scale writes and size with sharding, split big tables with partitioning, and protect the DB with connection pooling.',
      what: `When one database can't keep up, there is a usual order of steps:

1. **Optimise first:** add the right indexes, fix slow queries, add caching.
2. **Vertical scaling:** a bigger DB machine.
3. **Read replicas:** copies of the database that serve **reads**. The primary takes all writes and copies changes to the replicas.
4. **Partitioning:** split one big table into smaller pieces **inside one database** (for example, by month).
5. **Sharding:** split data across **many database servers** by a **shard key** (for example, \`tenantId\` or \`userId\`). Each shard holds part of the data and handles its own writes.

**Connection pooling:** opening a DB connection is slow and each one uses memory on the DB server. A **pool** keeps a few open connections and reuses them across requests.

#### Deeper version
- **Replication lag:** replicas are usually a bit behind (async replication). A user who just updated their profile might read old data from a replica. Fix: "read-your-own-writes" — read from the primary for that user for a short time after a write, or for critical reads.
- **Choosing a shard key:** it should spread data and traffic evenly (high cardinality), and most queries should include it so they hit one shard. A bad key causes **hot shards** (e.g. sharding by country when 80% of users are in one country). Queries without the shard key become slow **scatter-gather** queries across all shards.
- **Sharding strategies:** range-based (easy range queries, risk of hot spots), hash-based (even spread, no range queries), directory/lookup-based (flexible, extra lookup). **Consistent hashing** reduces data movement when adding shards.
- **Resharding** is painful, so pick a good key early. MongoDB has built-in sharding; for Postgres you use tools like Citus or app-level sharding.
- **Pool sizing:** total connections = pool size x number of app instances. 50 pods x 20 = 1,000 connections, which can exceed the DB limit. Use a pooler (PgBouncer, RDS Proxy) for many instances or serverless.`,
      why: `The database is usually the first real bottleneck, and it holds state, so you can't just add copies like app servers. These techniques let you handle more reads, more writes and more data, each with different costs.`,
      analogy: `Read replicas are photocopies of a library's catalogue placed in every reading room — anyone can look things up, but changes are made only at the main desk and copies may be a few minutes old. Sharding is splitting the library into branches: A-M books in one building, N-Z in another. Connection pooling is a taxi stand: a few taxis waiting and reused, instead of buying a new car for every trip.`,
      code: [
        {
          title: 'Connection pool + read/write split (Postgres)',
          lang: 'javascript',
          code: `import pg from 'pg';

// One pool per process, created once and reused
const primary = new pg.Pool({ connectionString: process.env.PRIMARY_URL, max: 10 });
const replica = new pg.Pool({ connectionString: process.env.REPLICA_URL, max: 20 });

export async function createOrder(userId, total) {
  // Writes always go to the primary
  const { rows } = await primary.query(
    'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
    [userId, total],
  );
  return rows[0];
}

export async function listOrders(userId, { justWrote = false } = {}) {
  // Read-your-own-writes: use primary right after a write
  const pool = justWrote ? primary : replica;
  const { rows } = await pool.query(
    'SELECT id, total FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT 20',
    [userId],
  );
  return rows;
}`,
        },
        {
          title: 'Partitioning a big table by month (Postgres)',
          lang: 'sql',
          code: `CREATE TABLE events (
  id BIGSERIAL,
  tenant_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  payload JSONB,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_10 PARTITION OF events
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

-- Queries filtered by created_at only scan the matching partition.
-- Old data: DROP TABLE events_2025_01;  (much faster than DELETE)`,
        },
      ],
      output: `\`createOrder\` writes to the primary. \`listOrders\` normally reads from a replica, which takes read load off the primary, but right after a write the app reads from the primary so the user sees their new order (avoiding replication lag). Each pool keeps at most 10 or 20 connections open and reuses them.

With partitioning, a query for October only scans \`events_2026_10\`, and deleting old months is just dropping a partition table.`,
      questions: [
        {
          q: 'Read replicas vs sharding?',
          a: 'Replicas copy all the data and scale reads; writes still go to one primary. Sharding splits data across servers, so it scales writes and storage, but makes cross-shard queries and transactions hard.',
        },
        {
          q: 'How do you choose a shard key?',
          a: 'High cardinality, even distribution of data and traffic, and present in most queries. For a SaaS app, `tenantId` (sometimes combined with another field) is common. Avoid keys that create hot spots, like a timestamp or a low-cardinality field.',
        },
        {
          q: 'What is replication lag and how do you handle it?',
          a: 'Replicas apply changes a bit after the primary. Handle it by reading from the primary right after a user writes, or for critical reads, and by designing UIs that tolerate slight delays.',
        },
        {
          q: 'Partitioning vs sharding?',
          a: 'Partitioning splits a table into pieces within one database server. Sharding spreads data across multiple servers. Sharding is basically partitioning across machines.',
        },
        {
          q: 'Why use connection pooling?',
          a: 'Opening connections is slow, and databases support limited connections. A pool reuses a small set of connections, lowering latency and protecting the database.',
        },
      ],
      spoken: `"I scale a database in steps. First indexes, query fixes and caching, then a bigger machine. For read-heavy load I add read replicas and route reads there, being careful about replication lag by reading from the primary right after a user's own write. For huge tables I use partitioning, like by month, which also makes deleting old data cheap. When writes or data size outgrow one server, I shard by a key like tenantId that spreads load evenly and appears in most queries. And I always use connection pooling, plus a pooler like PgBouncer when there are many instances."`,
      mistakes: [
        'Sharding too early. It adds huge complexity; most apps never need it.',
        'Picking a shard key with low cardinality or a monotonically increasing value (like createdAt), creating hot shards.',
        'Forgetting that pool size is per instance, so autoscaling multiplies connections and crashes the database.',
        'Follow-up trap: "A user updates their profile and refreshes, but sees old data. Why?" Probably reading from a lagging replica. Use read-your-own-writes routing.',
      ],
      takeaway: 'Optimise, then scale up, then replicas for reads, partitioning for big tables, sharding for writes — with pooling throughout.',
    },
    {
      id: 'cap-theorem-consistency',
      title: 'CAP Theorem and Consistency Models',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'In a network partition, a distributed system must choose between consistency and availability. Know strong vs eventual consistency.',
      what: `**CAP theorem** is about distributed data stores (data copied on several machines):
- **C — Consistency:** every read gets the latest write (all nodes agree).
- **A — Availability:** every request gets a (non-error) response.
- **P — Partition tolerance:** the system keeps working even if the network between nodes breaks.

Networks **do** break, so P is not optional. The real choice is: **during a partition**, do you return possibly-stale data (**AP**) or refuse/wait to stay correct (**CP**)?

#### Deeper version
**Consistency models** (strongest to weakest):
- **Strong / linearizable:** reads always see the latest write. Simple to reason about, slower.
- **Read-your-own-writes:** you always see your own changes.
- **Monotonic reads:** you never see time go backwards.
- **Eventual consistency:** if writes stop, all copies become the same "eventually". Fast and available.

**PACELC** extends CAP: if Partition, choose A or C; **Else** (normal times), choose **Latency** or **Consistency**. Even without failures, waiting for all replicas costs latency.

Practical examples:
- A bank balance or seat booking needs strong consistency (CP behaviour).
- A like counter, view count or social feed can be eventually consistent (AP behaviour).
- MongoDB lets you tune this per operation with **write concern** (\`w: 'majority'\`) and **read concern / read preference**. DynamoDB offers eventually consistent reads by default and strongly consistent reads as an option.`,
      why: `Every time you add replicas, caches, queues or microservices, you create copies of data that can disagree. CAP and consistency models give you the words to explain which features need fresh data and which can be a little stale — a key system design discussion.`,
      analogy: `Two branches of a bank lose their phone line. A customer withdraws money in branch A. In branch B, should the teller still allow withdrawals (available, but might allow overdrawing — AP) or say "sorry, system down, come back later" (consistent but unavailable — CP)?`,
      code: [
        {
          title: 'Tuning consistency per operation in MongoDB',
          lang: 'javascript',
          code: `// Critical write: wait until a majority of replica set members have it
await db.collection('payments').insertOne(
  { orderId: 'ord_1', amount: 499, status: 'succeeded' },
  { writeConcern: { w: 'majority' } },
);

// Critical read: read only majority-committed data, from the primary
const payment = await db.collection('payments').findOne(
  { orderId: 'ord_1' },
  { readConcern: { level: 'majority' }, readPreference: 'primary' },
);

// Non-critical read: allow a secondary (may be slightly stale, but offloads the primary)
const popular = await db.collection('courses')
  .find({}, { readPreference: 'secondaryPreferred' })
  .sort({ views: -1 }).limit(10).toArray();`,
        },
      ],
      output: `The payment write only succeeds once most nodes have stored it, so it survives a primary failure. The payment read sees committed data from the primary. The "popular courses" list may come from a secondary and be a few seconds old — fine for that feature, and it reduces load on the primary. Same database, different consistency choices per feature.`,
      questions: [
        {
          q: 'Explain the CAP theorem.',
          a: 'A distributed system cannot guarantee consistency, availability and partition tolerance all at once. Since partitions happen, during one you must choose consistency (reject or wait) or availability (answer with maybe-stale data).',
        },
        {
          q: 'Is MongoDB CP or AP?',
          a: 'With defaults (reads and writes on the primary) it behaves closer to CP: during a primary election, writes are briefly unavailable. But you can tune it with read preference and write concern, so labels are a simplification.',
        },
        {
          q: 'What is eventual consistency? Give an example.',
          a: 'Replicas may disagree for a short time but converge if writes stop. Example: a like count that shows 99 on one device and 100 on another for a second.',
        },
        {
          q: 'What is PACELC?',
          a: 'If there is a Partition, choose Availability or Consistency; Else choose Latency or Consistency. It reminds you that consistency costs latency even when nothing is broken.',
        },
      ],
      spoken: `"CAP says that in a distributed system, when a network partition happens, you can't have both perfect consistency and full availability, so you choose. Since partitions are unavoidable, it's really CP versus AP during a failure. In practice I decide per feature: payments, inventory and bookings need strong consistency, so I use majority writes and primary reads. Feeds, counters and analytics can be eventually consistent and served from replicas or caches. PACELC adds that even without failures, stronger consistency costs latency."`,
      mistakes: [
        'Saying "pick any two of three". You cannot drop partition tolerance in a real distributed system.',
        'Labelling a whole database as CP or AP without mentioning it is often tunable per operation.',
        'Confusing CAP consistency (linearizability across nodes) with ACID consistency (data respects rules and constraints).',
        'Follow-up trap: "Does a single-node Postgres need to worry about CAP?" Not about partitions between replicas — CAP is about replicated, distributed systems. Once you add replicas or caches, it matters.',
      ],
      takeaway: 'Partitions happen, so you trade consistency vs availability (and latency) — decide per feature, not per system.',
    },
    {
      id: 'multi-tenant-design',
      title: 'Multi-Tenant Design (Shared DB vs Schema vs Separate DB)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'One app serves many customer organisations (tenants). Choose shared tables, schema-per-tenant or database-per-tenant, and enforce isolation everywhere.',
      what: `A **multi-tenant** SaaS app serves many customer organisations, called **tenants** (e.g. many companies using the same HR app). The most important rule: one tenant must **never** see another tenant's data.

Three common models:
1. **Shared database, shared tables:** every row has a \`tenantId\` column. Cheapest and simplest to run; isolation depends on your code always filtering by tenant.
2. **Schema per tenant:** one database, a separate schema (set of tables) per tenant (common in Postgres). Better isolation; migrations must run on every schema.
3. **Database per tenant:** each tenant gets its own database. Strongest isolation, easy per-tenant backup/restore and data residency, but most expensive and hardest to operate at scale.

#### Deeper version
- **Hybrid** is common: small tenants share tables; big enterprise tenants get a dedicated database ("silo" vs "pool" model).
- **Tenant resolution:** figure out the tenant from the subdomain (\`acme.app.com\`), a custom domain, or the user's JWT claims — never trust a \`tenantId\` sent in the request body.
- **Enforce isolation in layers:** middleware sets tenant context; a repository layer always adds the tenant filter; Postgres **Row-Level Security (RLS)** as a database-level safety net; tenant-scoped cache keys (\`t:acme:user:1\`) and file paths (\`s3://bucket/acme/...\`).
- **Noisy neighbour:** one large tenant can slow down everyone. Use per-tenant rate limits, quotas, separate queues, or move them to a dedicated tier.
- **Data security:** per-tenant encryption keys for sensitive data, audit logs, tenant-aware backups, and tests that try cross-tenant access.
- **Indexes** in shared tables should start with \`tenantId\` (compound indexes), and \`tenantId\` is a natural shard key later.`,
      why: `SaaS businesses need to serve thousands of customers cheaply from one codebase, while giving enterprise customers strong data isolation and compliance guarantees. A data leak between tenants is one of the worst possible SaaS incidents.`,
      analogy: `Shared tables are an apartment building where everyone shares the walls and pipes, with locked doors (tenantId filters). Schema-per-tenant is a row of townhouses: shared land, separate houses. Database-per-tenant is detached houses: full privacy, but each one needs its own maintenance.`,
      code: [
        {
          title: 'Tenant resolution middleware + tenant-scoped repository',
          lang: 'javascript',
          code: `import express from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

const tenantContext = new AsyncLocalStorage();
const app = express();

// Resolve tenant from the verified JWT (set by auth middleware), not from the body
app.use((req, res, next) => {
  const tenantId = req.user?.tenantId;        // e.g. from a verified token claim
  if (!tenantId) return res.status(401).json({ error: 'No tenant' });
  tenantContext.run({ tenantId }, next);      // available to all code in this request
});

// Repository ALWAYS adds the tenant filter, so routes cannot forget it
export function makeProjectRepo(db) {
  const col = db.collection('projects');
  const tenantId = () => tenantContext.getStore().tenantId;
  return {
    find: (filter = {}) => col.find({ ...filter, tenantId: tenantId() }).toArray(),
    create: (doc) => col.insertOne({ ...doc, tenantId: tenantId() }),
    update: (id, set) => col.updateOne({ _id: id, tenantId: tenantId() }, { $set: set }),
  };
}

// Index: db.projects.createIndex({ tenantId: 1, createdAt: -1 })`,
        },
        {
          title: 'Postgres Row-Level Security as a safety net',
          lang: 'sql',
          code: `ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.tenant_id')::int);

-- In each request/transaction the app sets the tenant:
-- SET LOCAL app.tenant_id = '42';
-- Now even "SELECT * FROM projects" returns only tenant 42 rows.
-- Note: table owners and superusers bypass RLS unless FORCE ROW LEVEL SECURITY is used.`,
        },
      ],
      output: `Every request gets its tenant from the verified token and stores it in \`AsyncLocalStorage\`. The repository automatically adds \`tenantId\` to every find, insert and update, so a developer writing a new route can't accidentally query another tenant's projects. Even an update by \`_id\` includes \`tenantId\`, so guessing another tenant's ID does nothing. In Postgres, RLS adds a second wall at the database level: even a buggy query only sees the current tenant's rows (as long as the app connects with a role that RLS applies to).`,
      questions: [
        {
          q: 'What are the multi-tenancy models and their trade-offs?',
          a: 'Shared tables with tenantId: cheapest, easiest to operate, weakest isolation. Schema per tenant: better isolation, more migration work. Database per tenant: strongest isolation and easy per-tenant restore, but costly and complex at scale.',
        },
        {
          q: 'How do you guarantee tenant isolation in a shared database?',
          a: 'Resolve tenant from a trusted source (verified token or domain), scope every query through a repository layer, add DB-level protection like RLS, scope caches and storage keys by tenant, and write tests that try cross-tenant access.',
        },
        {
          q: 'What is the noisy neighbour problem?',
          a: 'One heavy tenant uses so many resources that others slow down. Solve with per-tenant rate limits and quotas, separate queues, or moving big tenants to dedicated infrastructure.',
        },
        {
          q: 'An enterprise customer wants their data in the EU only. What do you do?',
          a: 'Offer a dedicated or regional deployment: their database (and backups, files and logs) in an EU region, with tenant routing that sends their requests to that region.',
        },
      ],
      spoken: `"Multi-tenancy means one app serves many customer organisations, and the top rule is that no tenant ever sees another's data. There are three models: shared tables with a tenantId column, which is cheapest; schema per tenant; and database per tenant, which gives the strongest isolation for enterprise or compliance needs. Many products mix them. For isolation I resolve the tenant from the verified token, enforce it in a repository layer so no query can skip it, add row-level security as a backstop, scope cache keys and S3 paths by tenant, and handle noisy neighbours with per-tenant limits."`,
      mistakes: [
        'Taking tenantId from the request body or query string, which lets a user switch tenants by editing a request.',
        'Filtering by tenant in some queries and forgetting in others (especially updates, deletes, aggregations and background jobs).',
        'Global cache keys like `user:1` shared across tenants, leaking cached data.',
        'Follow-up trap: "How do you run a migration with schema-per-tenant and 2,000 tenants?" You need tooling to run it per schema, in batches, with tracking and retries — this operational cost is the main downside of that model.',
      ],
      takeaway: 'Pick the tenancy model by isolation needs and cost, then enforce tenant scoping in every layer — never trust the client for tenantId.',
    },
    {
      id: 'api-gateway-bff',
      title: 'API Gateway and Backend for Frontend (BFF)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'An API gateway is the single front door for all clients (routing, auth, rate limits). A BFF is a small backend built for one specific frontend.',
      what: `An **API gateway** is one entry point in front of many backend services. Clients call the gateway; it forwards each request to the right service.

It usually handles **cross-cutting concerns** (things every service needs):
- Routing (\`/orders/*\` → orders service)
- Authentication (verify the JWT once)
- Rate limiting and quotas
- TLS termination, CORS, request logging
- Sometimes caching and response transformation

Examples: AWS API Gateway, Kong, NGINX, Apigee, GCP API Gateway.

A **BFF (Backend for Frontend)** is a backend made for **one** client type — for example, one for the web app and one for the mobile app. It calls several services and shapes the data exactly as that screen needs it.

#### Deeper version
- **Aggregation:** the gateway or BFF can combine several service calls into one response, so mobile apps make 1 request instead of 6 (fewer round trips on slow networks).
- **Gateway vs load balancer:** an LB spreads traffic across copies of one service; a gateway routes across different services and adds API features. They are often used together.
- **Gateway vs service mesh:** a gateway handles **north-south** traffic (clients → system). A service mesh (Istio, Linkerd) handles **east-west** traffic (service ↔ service: mTLS, retries, tracing).
- **Risks:** the gateway is a single point of failure and a possible bottleneck (run it redundantly), and putting business logic in it makes it a "god gateway". Keep it thin.
- A Next.js app with server-side route handlers or server components that call internal services is effectively a BFF for the web client. GraphQL is also often used as a BFF/aggregation layer.`,
      why: `Without a gateway, every client must know the address of every service, and every service must re-implement auth, rate limiting and logging. Different clients also need different data shapes: a mobile screen wants a small payload, a web dashboard wants more. The gateway centralises shared concerns; the BFF tailors responses per client.`,
      analogy: `An API gateway is a hotel reception. Guests don't walk into the kitchen or laundry; they ask reception, which checks their room key (auth) and passes the request to the right department. A BFF is a personal concierge for VIP guests: they collect things from several departments and hand over exactly what that guest wants.`,
      code: [
        {
          title: 'Tiny gateway: auth once, route to services',
          lang: 'javascript',
          code: `import express from 'express';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Cross-cutting concern: verify JWT once, at the edge
app.use((req, res, next) => {
  try {
    const token = req.get('Authorization')?.replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.headers['x-user-id'] = req.user.sub;   // pass identity downstream
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Routing: path prefix -> service
app.use('/orders', createProxyMiddleware({ target: 'http://orders-service:3001', changeOrigin: true }));
app.use('/users', createProxyMiddleware({ target: 'http://users-service:3002', changeOrigin: true }));

app.listen(8080);`,
        },
        {
          title: 'BFF endpoint: aggregate for one mobile screen',
          lang: 'javascript',
          code: `// GET /mobile/home -> one call from the app instead of three
app.get('/mobile/home', async (req, res) => {
  const userId = req.user.sub;
  const [profile, orders, offers] = await Promise.all([
    fetch(\`http://users-service:3002/users/\${userId}\`).then((r) => r.json()),
    fetch(\`http://orders-service:3001/orders?userId=\${userId}&limit=3\`).then((r) => r.json()),
    fetch('http://offers-service:3003/offers/active').then((r) => r.json()),
  ]);

  // Shape the data exactly for the mobile home screen (small payload)
  res.json({
    greeting: \`Hi \${profile.firstName}\`,
    recentOrders: orders.map((o) => ({ id: o.id, status: o.status })),
    banner: offers[0] ?? null,
  });
});`,
        },
      ],
      output: `Every request first hits the gateway, which verifies the JWT. Bad tokens get 401 and never reach the services. A valid \`GET /orders/123\` is forwarded to the orders service with an \`x-user-id\` header. The BFF endpoint calls three services **in parallel** and returns one small, screen-shaped JSON response, so the mobile app makes one round trip instead of three.`,
      questions: [
        {
          q: 'What does an API gateway do?',
          a: 'It is the single entry point for clients. It routes requests to services and handles cross-cutting concerns: auth, rate limiting, TLS, CORS, logging, sometimes caching and aggregation.',
        },
        {
          q: 'What is the BFF pattern and why use it?',
          a: 'A separate backend per frontend type (web, mobile). Each one aggregates and shapes data for its client, so frontends get exactly what they need and teams can change them independently.',
        },
        {
          q: 'API gateway vs load balancer?',
          a: 'A load balancer spreads traffic across instances of the same service. A gateway routes to different services and adds API-level features like auth and rate limits. You usually have both.',
        },
        {
          q: 'What are the risks of an API gateway?',
          a: 'It can become a single point of failure and a bottleneck, and teams may push business logic into it. Run it redundantly, monitor it, and keep it thin.',
        },
      ],
      spoken: `"An API gateway is the single front door to a set of services. Clients only know the gateway, and it routes requests to the right service while handling shared concerns like JWT verification, rate limiting, TLS, CORS and logging, so each service doesn't repeat them. A Backend for Frontend goes one step further: a small backend per client type, like web and mobile, that aggregates calls to several services and shapes the response for that screen. I keep gateways thin, without business logic, and run them redundantly so they don't become a bottleneck."`,
      mistakes: [
        'Putting business rules in the gateway, turning it into a hard-to-change monolith.',
        'Trusting identity headers like `x-user-id` from outside. Services should only accept them from the gateway (private network, mTLS or a signed token).',
        'Making BFF calls to services one after another instead of in parallel.',
        'Follow-up trap: "If the gateway verifies the JWT, should services check auth again?" At least they should verify the request really came from the gateway; many teams also verify the token or check fine-grained permissions in the service (zero-trust).',
      ],
      takeaway: 'The gateway centralises routing and cross-cutting concerns; a BFF tailors data per client — keep both thin and redundant.',
    },
    {
      id: 'service-communication',
      title: 'Service-to-Service Communication (Sync vs Async, REST, gRPC, Service Discovery)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Services talk either synchronously (REST, gRPC — wait for an answer) or asynchronously (queues, events — fire and continue). Choose per use case.',
      what: `When you have more than one service, they must talk to each other. Two families:

**Synchronous** — the caller waits for a reply:
- **REST over HTTP/JSON:** simple, universal, easy to debug.
- **gRPC:** uses HTTP/2 and Protocol Buffers (a compact binary format) with a strict contract (\`.proto\` file). Faster and typed, great for internal service-to-service calls; less friendly for browsers.
- **GraphQL:** mostly for client-to-backend, not usually between internal services.

**Asynchronous** — the caller doesn't wait:
- **Message queues / events** (SQS, RabbitMQ, Kafka, BullMQ): send and move on; the other service handles it later.

#### Deeper version
- **When to use sync:** the caller needs the answer **now** to continue (check stock before showing "in stock", validate a coupon).
- **When to use async:** the work can happen later or many services care (send email, update analytics, generate invoice). Async improves resilience: if the receiver is down, messages wait.
- **Temporal coupling:** a chain of sync calls (A → B → C → D) means availability multiplies down and latency adds up. Keep sync chains short.
- **Service discovery:** how does A find B's address when instances come and go? Platform DNS (Kubernetes Services, ECS Service Connect, Cloud Run URLs), a registry (Consul), or a service mesh.
- **Contracts:** version APIs and events; never break consumers. gRPC/protobuf and OpenAPI/JSON Schema help. **Consumer-driven contract tests** (e.g. Pact) catch breaking changes early.
- **Security between services:** private networks, mTLS, or service tokens (zero-trust).`,
      why: `The way services communicate decides how coupled, fast and reliable the whole system is. Too many synchronous calls create a fragile "distributed monolith"; everything async makes simple read flows complex. Choosing correctly per interaction is a core architecture skill.`,
      analogy: `A synchronous call is a phone call: you wait on the line until the other person answers. An asynchronous message is an email or WhatsApp message: you send it and get on with your day, and they reply when they can.`,
      code: [
        {
          title: 'Sync call (needs the answer now) vs async event (fire and continue)',
          lang: 'javascript',
          code: `// SYNC: checkout must know the price before charging -> HTTP call with timeout
export async function getPrice(courseId) {
  const res = await fetch(\`http://catalog-service/courses/\${courseId}/price\`, {
    signal: AbortSignal.timeout(1500),           // never wait forever
  });
  if (!res.ok) throw new Error(\`catalog error \${res.status}\`);
  return (await res.json()).amount;
}

// ASYNC: nobody needs to wait for the receipt email or analytics
export async function onPaymentSucceeded(queue, payment) {
  await queue.add('payment-succeeded', {
    paymentId: payment.id,
    userId: payment.userId,
    amount: payment.amount,
  }, { jobId: \`payment-succeeded-\${payment.id}\` }); // idempotent enqueue
}`,
        },
        {
          title: 'A gRPC contract (.proto) for an internal service',
          lang: 'text',
          code: `syntax = "proto3";

package catalog;

service Catalog {
  rpc GetPrice (GetPriceRequest) returns (GetPriceResponse);
}

message GetPriceRequest {
  string course_id = 1;
}

message GetPriceResponse {
  int64 amount = 1;      // in smallest currency unit (paise / cents)
  string currency = 2;
}`,
        },
      ],
      output: `Checkout calls the catalog synchronously because it cannot continue without the price; the 1.5-second timeout ensures a slow catalog fails fast instead of hanging checkout. After payment, an event is queued and checkout returns immediately — the email and analytics services process it whenever they can, and the \`jobId\` stops duplicates.

The \`.proto\` file is a strict contract: both sides generate typed code from it, and fields are identified by numbers, so adding new fields later doesn't break old clients.`,
      questions: [
        {
          q: 'When do you use synchronous vs asynchronous communication?',
          a: 'Synchronous when the caller needs the result immediately to continue. Asynchronous when the work can happen later or several services should react, which also decouples availability.',
        },
        {
          q: 'REST vs gRPC?',
          a: 'REST with JSON is simple, human-readable and browser-friendly. gRPC uses HTTP/2 and protobuf: smaller, faster, strongly typed contracts and streaming — good for internal calls, less convenient for browsers.',
        },
        {
          q: 'What is service discovery?',
          a: 'The way a service finds the current network addresses of another service whose instances change. Usually DNS from the platform (Kubernetes Services), a registry like Consul, or a service mesh.',
        },
        {
          q: 'What is the danger of long chains of synchronous calls?',
          a: 'Latency adds up and availability multiplies down; one slow service slows everything. Keep chains short, add timeouts and circuit breakers, and move non-critical steps to async.',
        },
      ],
      spoken: `"Services communicate either synchronously, with REST or gRPC where the caller waits for a response, or asynchronously through queues and events. I use synchronous calls only when the caller truly needs the answer to continue, like getting a price at checkout, always with timeouts. Everything that can happen later, like emails, analytics or invoices, goes through events, which decouples services and survives outages. For internal high-volume calls gRPC gives typed contracts and speed. Service discovery usually comes from the platform's DNS, and I version contracts so consumers don't break."`,
      mistakes: [
        'Long synchronous chains across many services, creating a fragile distributed monolith.',
        'Making everything async, even simple reads, which adds complexity and eventual consistency for no reason.',
        'Hard-coding service IPs instead of using service discovery or DNS names.',
        'Follow-up trap: "How do you change an API that other services use?" Make backward-compatible changes (add optional fields), version when you must break, support both versions during migration, and use contract tests.',
      ],
      takeaway: 'Use sync calls only when you need the answer now (with timeouts); push everything else to async messages.',
    },
    {
      id: 'circuit-breaker',
      title: 'Circuit Breaker, Timeouts and Retries',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Stop calling a failing service for a while so failures don\'t cascade. Combine with timeouts, retries with backoff, and fallbacks.',
      what: `When service A calls service B and B is slow or down, A's requests pile up waiting. Soon A runs out of resources and fails too — a **cascading failure**.

A **circuit breaker** wraps calls to B and tracks failures:
- **Closed** (normal): calls go through. Failures are counted.
- **Open**: too many failures → stop calling B. Fail fast immediately (or return a fallback) for some time.
- **Half-open**: after a cool-down, let a few test calls through. If they succeed → Closed. If they fail → Open again.

#### Deeper version
Resilience patterns that work together:
- **Timeouts:** never wait forever. Every network call needs a timeout.
- **Retries with exponential backoff + jitter:** retry temporary errors (timeouts, 503, 429), waiting longer each time with randomness so clients don't all retry together. Only retry **idempotent** operations (or use idempotency keys).
- **Retry budget:** retries multiply load. If 3 layers each retry 3 times, one request can become 27. Retry at one layer, and limit the total.
- **Circuit breaker:** stops hammering a broken dependency and gives it time to recover.
- **Fallback:** cached data, a default value, or a degraded feature ("recommendations unavailable").
- **Bulkhead:** separate resource pools per dependency, so one slow dependency can't use all connections/threads.

In Node, the \`opossum\` library is a common circuit breaker. A service mesh can also do this at the network level.`,
      why: `In a distributed system, dependencies fail all the time. Without these patterns, one slow payment provider or recommendation service can take down your whole API. With them, failures stay contained and users get fast errors or degraded features instead of hanging requests.`,
      analogy: `It's exactly like the electrical circuit breaker in your house. When there's a fault, it trips and cuts the power so the wires don't catch fire. After you fix things, you flip it back on carefully to test. The half-open state is that careful test flip.`,
      code: [
        {
          title: 'A small circuit breaker with timeout and fallback',
          lang: 'javascript',
          code: `class CircuitBreaker {
  constructor(fn, { failureThreshold = 5, coolDownMs = 10_000, timeoutMs = 2000 } = {}) {
    Object.assign(this, { fn, failureThreshold, coolDownMs, timeoutMs });
    this.state = 'CLOSED';
    this.failures = 0;
    this.openedAt = 0;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt < this.coolDownMs) throw new Error('Circuit open: failing fast');
      this.state = 'HALF_OPEN';                // cool-down over: allow a test call
    }
    try {
      const result = await Promise.race([
        this.fn(...args),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), this.timeoutMs)),
      ]);
      this.failures = 0;
      this.state = 'CLOSED';
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
}

// Usage with a fallback
const getRecs = new CircuitBreaker((userId) =>
  fetch(\`http://recs-service/recs/\${userId}\`).then((r) => {
    if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
    return r.json();
  }));

export async function recommendations(userId) {
  try { return await getRecs.call(userId); }
  catch { return []; }   // fallback: page still renders without recommendations
}`,
        },
        {
          title: 'Retry with exponential backoff and jitter',
          lang: 'javascript',
          code: `export async function retry(fn, { attempts = 4, baseMs = 200 } = {}) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      const wait = baseMs * 2 ** i;                 // 200, 400, 800 ...
      const jitter = Math.random() * wait;          // "full jitter"
      await new Promise((r) => setTimeout(r, jitter));
    }
  }
}`,
        },
      ],
      output: `While the recommendations service is healthy, calls pass through. If it fails 5 times in a row (or each call takes over 2 seconds), the breaker opens: for the next 10 seconds every call fails instantly, and \`recommendations()\` returns an empty list, so the page still loads fast. After 10 seconds, one test call is allowed; success closes the circuit, failure opens it again.

The retry helper waits a random time up to 200ms, 400ms, 800ms between attempts, so thousands of clients don't retry at the same instant.`,
      questions: [
        {
          q: 'What is a circuit breaker and what are its states?',
          a: 'A wrapper that stops calling a failing dependency. Closed: normal. Open: fail fast without calling. Half-open: after a cool-down, allow test calls to decide whether to close again.',
        },
        {
          q: 'Why add jitter to retries?',
          a: 'Without jitter, many clients retry at exactly the same moments and create waves of load (thundering herd) that keep the service down. Randomness spreads retries out.',
        },
        {
          q: 'Which errors should you retry?',
          a: 'Temporary ones: timeouts, connection resets, 429, 502, 503, 504. Not 400, 401, 403, 404 or validation errors. And only for idempotent operations or with an idempotency key.',
        },
        {
          q: 'What is the bulkhead pattern?',
          a: 'Isolating resources per dependency, like separate connection pools, so a slow dependency can only exhaust its own pool and not the whole service.',
        },
      ],
      spoken: `"A circuit breaker protects my service from a failing dependency. It counts failures, and when they pass a threshold it opens and fails fast instead of waiting on timeouts, which stops cascading failures and gives the dependency time to recover. After a cool-down it goes half-open and lets a test request through. I combine it with timeouts on every network call, retries with exponential backoff and jitter only for temporary errors and idempotent operations, and a fallback like cached data so users get a degraded experience instead of an error."`,
      mistakes: [
        'No timeout on HTTP calls — Node\'s `fetch` has no short default timeout, so a hung dependency can hold requests for a very long time. Use `AbortSignal.timeout()`.',
        'Retrying non-idempotent calls like "charge card" without an idempotency key.',
        'Retrying at every layer, multiplying load during an outage (retry storms).',
        'Follow-up trap: "With 10 instances of your service, does each have its own breaker?" Usually yes, each instance tracks its own view; that\'s normally fine. Shared state across instances is possible but adds complexity.',
      ],
      takeaway: 'Timeouts everywhere, retries with backoff and jitter for safe operations, a circuit breaker to fail fast, and a fallback for graceful degradation.',
    },
    {
      id: 'observability',
      title: 'Observability: Logs, Metrics, Traces and OpenTelemetry',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'The three pillars — logs (what happened), metrics (how much/how fast), traces (where time went across services) — tell you why production is misbehaving.',
      what: `**Observability** means you can understand what is happening inside your system from the outside, using the data it produces. Three pillars:

- **Logs:** text or JSON records of events. "Payment failed for order 42: card declined." Good for details.
- **Metrics:** numbers over time. Requests per second, error rate, p95 latency, queue length, CPU. Good for dashboards and alerts.
- **Traces:** the full path of one request across services, broken into **spans** (timed steps). Good for "which service made this slow?"

**OpenTelemetry (OTel)** is an open, vendor-neutral standard and set of SDKs to produce all three. You instrument once and can send data to Datadog, Grafana, New Relic, AWS X-Ray, GCP Cloud Trace, Jaeger, etc.

#### Deeper version
- **Structured logs:** log JSON with fields (\`level\`, \`msg\`, \`orderId\`, \`traceId\`) so you can search and filter. Use pino or winston. Never log passwords, tokens or full card data.
- **Correlation:** put the same \`traceId\`/request ID in logs and traces so you can jump from an error log to the full trace.
- **Context propagation:** OTel passes trace context between services in the W3C \`traceparent\` HTTP header (and in message metadata for queues).
- **Golden signals** (Google SRE): latency, traffic, errors, saturation. **RED** for services: Rate, Errors, Duration.
- **Percentiles beat averages:** p95/p99 latency shows the slow experience that averages hide.
- **SLI / SLO / SLA:** an SLI is a measurement (successful requests %), an SLO is the internal target (99.9%), an SLA is the contract with customers. **Error budget** = how much failure the SLO allows.
- **Alert on symptoms** (high error rate, slow p99) rather than causes (CPU 80%) to avoid noisy alerts.
- **Sampling:** tracing every request is expensive; sample (e.g. 10%, or keep all errors).`,
      why: `In production you can't attach a debugger. With many services, queues and serverless functions, a single user action touches many components. Observability lets you detect problems (metrics + alerts), find where (traces), and understand why (logs) — fast.`,
      analogy: `Think of a car. Metrics are the dashboard gauges (speed, fuel, temperature). Logs are the mechanic's notebook of events ("engine warning at 3:42pm"). A trace is a GPS route history showing exactly where you were stuck in traffic on the trip.`,
      code: [
        {
          title: 'OpenTelemetry auto-instrumentation for a Node service',
          lang: 'javascript',
          code: `// tracing.js — load this BEFORE the app (node --import ./tracing.js server.js)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  serviceName: 'orders-service',
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations()], // http, express, mongodb, pg, redis...
});
sdk.start();

process.on('SIGTERM', () => sdk.shutdown());`,
        },
        {
          title: 'Structured logs with the trace ID + a custom span',
          lang: 'javascript',
          code: `import pino from 'pino';
import { trace } from '@opentelemetry/api';

const logger = pino({ level: 'info' });
const tracer = trace.getTracer('orders-service');

export async function placeOrder(order) {
  return tracer.startActiveSpan('placeOrder', async (span) => {
    const traceId = span.spanContext().traceId;
    span.setAttribute('order.total', order.total);
    try {
      logger.info({ traceId, orderId: order.id }, 'placing order');
      // ... save order, call payments (auto-instrumented as child spans)
      return { ok: true };
    } catch (err) {
      span.recordException(err);
      logger.error({ traceId, orderId: order.id, err: err.message }, 'order failed');
      throw err;
    } finally {
      span.end();
    }
  });
}`,
        },
      ],
      output: `With auto-instrumentation, every incoming HTTP request, database query and outgoing call becomes a span automatically, and the trace context is forwarded to other services in the \`traceparent\` header. In your tracing UI you see one trace like: \`POST /orders (420ms)\` → \`placeOrder\` → \`mongodb insert (15ms)\` → \`POST payments-service (380ms)\` — so the slow part is obviously payments. Each log line includes the \`traceId\`, so from an error log you can open the exact trace.`,
      questions: [
        {
          q: 'What are the three pillars of observability?',
          a: 'Logs for detailed events, metrics for numbers over time used in dashboards and alerts, and traces for following one request across services to see where time and errors happen.',
        },
        {
          q: 'What is OpenTelemetry?',
          a: 'A vendor-neutral standard, APIs and SDKs for producing traces, metrics and logs. You instrument once and export to any backend, avoiding lock-in.',
        },
        {
          q: 'Why use p95/p99 instead of average latency?',
          a: 'Averages hide the slow tail. If the average is 100ms but p99 is 3s, one in a hundred users waits 3 seconds — and heavy users hit that often.',
        },
        {
          q: 'What is the difference between SLI, SLO and SLA?',
          a: 'SLI is the measured indicator (like % successful requests). SLO is the internal target for it (99.9%). SLA is the external contract with customers, often with penalties.',
        },
        {
          q: 'How would you debug a slow API in production?',
          a: 'Check the metrics dashboard to see when and which endpoint, open traces for slow requests to find the slow span, then read the correlated logs for that trace to find the cause.',
        },
      ],
      spoken: `"Observability is being able to explain production behaviour from the data the system emits. I use three pillars: structured JSON logs for detail, metrics like request rate, error rate and p95 latency for dashboards and alerts, and distributed traces to follow one request across services. I use OpenTelemetry because it's vendor-neutral: auto-instrumentation creates spans for HTTP, database and Redis calls and propagates trace context between services. I put the trace ID in every log line, alert on symptoms tied to SLOs, and never log secrets or personal data."`,
      mistakes: [
        'Unstructured `console.log` strings that can\'t be searched or correlated.',
        'Logging sensitive data: passwords, tokens, full card numbers, personal data.',
        'Alerting on everything, so the on-call team ignores alerts (alert fatigue).',
        'Using high-cardinality labels (like userId) on metrics, which explodes cost and storage.',
        'Follow-up trap: "How do traces work across a message queue?" You put the trace context into the message attributes/headers when publishing and extract it in the consumer, linking the spans.',
      ],
      takeaway: 'Metrics tell you something is wrong, traces tell you where, logs tell you why — and OpenTelemetry ties them together without vendor lock-in.',
    },
    {
      id: 'feature-flags',
      title: 'Feature Flags',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Turn features on or off at runtime, for some users or a percentage of traffic, without deploying new code.',
      what: `A **feature flag** (feature toggle) is an \`if\` in your code whose value comes from configuration, not from the code itself. You can turn a feature on or off **without a new deploy**.

Common uses:
- **Gradual rollout:** turn the new checkout on for 5% of users, then 25%, then 100%.
- **Kill switch:** instantly disable a broken feature.
- **Beta / targeting:** only internal staff or certain tenants or paid plans see it.
- **A/B testing:** compare two versions.
- **Trunk-based development:** merge unfinished code to main, hidden behind a flag.

Tools: LaunchDarkly, Unleash, Flagsmith, GrowthBook, ConfigCat, or a simple table in your own database.

#### Deeper version
- **Deploy vs release:** deploying puts code on servers; releasing turns it on for users. Flags separate the two, which makes deploys low-risk.
- **Consistent bucketing:** for percentage rollouts, hash the user ID so the same user always gets the same answer (not \`Math.random()\` per request).
- **Evaluation:** SDKs cache flag rules locally and update them in the background (streaming or polling), so checking a flag is fast and still works if the flag service is down (with safe defaults).
- **Flag types:** release flags (short-lived), ops flags/kill switches (long-lived), permission/entitlement flags (often part of the plan system), experiment flags.
- **Flag debt:** old flags make code messy and create untested combinations. Give each flag an owner and an expiry, and remove it after full rollout.
- Evaluate sensitive flags on the **server**; client-side flags are visible to users.`,
      why: `Big-bang releases are risky. Flags let you ship small changes continuously, test in production with a few users, roll back instantly without redeploying, and give features to specific customers (like enterprise tenants) — key for SaaS products.`,
      analogy: `Feature flags are light switches in a new house. All the wiring (code) is installed, but you choose which rooms have the lights on, and you can switch one off instantly if a bulb starts sparking — no electrician needed.`,
      code: [
        {
          title: 'Simple flag service with targeting and stable percentage rollout',
          lang: 'javascript',
          code: `import { createHash } from 'node:crypto';

// Normally loaded from a DB / flag service and cached
const flags = {
  'new-checkout': { enabled: true, rolloutPercent: 20, allowTenants: ['acme'] },
  'ai-summary': { enabled: false },   // kill switch: off for everyone
};

function bucket(flagKey, userId) {
  // Same user + flag -> same number 0..99, every time
  const hash = createHash('sha256').update(\`\${flagKey}:\${userId}\`).digest();
  return hash.readUInt32BE(0) % 100;
}

export function isEnabled(flagKey, { userId, tenantId }) {
  const f = flags[flagKey];
  if (!f || !f.enabled) return false;                       // safe default
  if (f.allowTenants?.includes(tenantId)) return true;      // targeting
  return bucket(flagKey, userId) < (f.rolloutPercent ?? 0); // gradual rollout
}

console.log(isEnabled('new-checkout', { userId: 'u_1', tenantId: 'acme' }));  // true
console.log(isEnabled('ai-summary', { userId: 'u_1', tenantId: 'acme' }));    // false
console.log(isEnabled('new-checkout', { userId: 'u_2', tenantId: 'other' })); // stable true/false`,
        },
      ],
      output: `The first call returns \`true\` because tenant \`acme\` is explicitly targeted. The second returns \`false\` because \`ai-summary\` is switched off. The third depends on the user's hash bucket: about 20% of users get \`true\`, and the same user always gets the same answer, so their experience doesn't flip between page loads. Changing \`rolloutPercent\` to 100 in the config releases the feature to everyone with no deploy.`,
      questions: [
        {
          q: 'What are feature flags used for?',
          a: 'Gradual rollouts, kill switches, beta access for specific users or tenants, A/B tests, and merging unfinished work safely in trunk-based development.',
        },
        {
          q: 'How do you do a percentage rollout so users get a consistent experience?',
          a: 'Hash a stable ID like userId together with the flag name into a bucket from 0-99 and compare it to the percentage. Never use a random number per request.',
        },
        {
          q: 'What are the downsides of feature flags?',
          a: 'Flag debt and messy code, many combinations to test, and risk if flag evaluation fails. Remove flags after rollout and always define safe defaults.',
        },
      ],
      spoken: `"Feature flags let me separate deploying code from releasing a feature. The code ships behind a flag, and I turn it on through configuration: first for internal users or a pilot tenant, then for a percentage of users, then everyone. For percentages I hash the user ID so each user gets a consistent experience. Flags also act as kill switches if something breaks. I evaluate important flags on the server with safe defaults, and I treat old flags as tech debt with an owner and a removal date."`,
      mistakes: [
        'Using `Math.random()` per request for rollouts, so users see the feature appear and disappear.',
        'Never removing old flags, leaving dead code paths everywhere.',
        'Hiding security-sensitive features only with client-side flags — anyone can flip them in the browser.',
        'Follow-up trap: "What if the flag service is down?" SDKs serve the last cached values, and the code falls back to a safe default (usually off).',
      ],
      takeaway: 'Feature flags decouple deploy from release: roll out gradually, target users or tenants, kill instantly — and clean them up.',
    },
    {
      id: 'clean-architecture',
      title: 'Clean Architecture (Layers and the Dependency Rule)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Keep business logic at the centre, independent of frameworks, databases and UI. Dependencies point inwards only.',
      what: `**Clean Architecture** organises code in layers, like rings of an onion:

1. **Entities / Domain** (centre): core business rules. Pure code — no Express, no Mongoose.
2. **Use cases / Application**: what the app does ("place order", "cancel subscription"). Orchestrates entities and calls **ports** (interfaces) like \`OrderRepository\` or \`PaymentGateway\`.
3. **Interface adapters**: controllers, presenters, repository implementations that translate between the outside world and use cases.
4. **Frameworks & drivers** (outside): Express, Next.js, MongoDB, Stripe SDK, queues.

**The Dependency Rule:** code can only depend on layers **closer to the centre**. The domain knows nothing about the database or HTTP.

#### Deeper version
Closely related ideas: **Hexagonal architecture (Ports and Adapters)** and **Onion architecture**. All say the same thing: business logic in the middle, technology at the edges, connected through interfaces (ports) and implementations (adapters).

The trick that makes it work is **dependency inversion**: the use case defines the interface it needs; the infrastructure layer implements it; a **composition root** (your \`main.ts\` / app startup) wires real implementations together.

Practical folder layout in a Node/TS app: \`domain/\`, \`application/\` (use cases + ports), \`infrastructure/\` (Mongo repos, Stripe adapter), \`interfaces/http/\` (Express routes). Benefits: unit-test use cases with fakes, swap Mongo for Postgres or Stripe for another provider with limited changes.

Cost: more files and indirection. For a small CRUD app, a simple "routes → services → repositories" structure is often enough.`,
      why: `Frameworks and vendors change; business rules last longer. When business logic is mixed into Express handlers and Mongoose hooks, it's hard to test and hard to move. Clean architecture keeps the valuable part — the rules — isolated, testable and long-lived.`,
      analogy: `Think of a laptop. The core (CPU and logic board) doesn't care what charger, monitor or mouse you plug in. It defines standard ports (USB-C, HDMI), and any compatible device (adapter) can be connected. Swapping the mouse never requires changing the CPU.`,
      code: [
        {
          title: 'Use case with ports, adapters wired at the edge (TypeScript)',
          lang: 'typescript',
          code: `// application/ports.ts — interfaces owned by the inner layer
export interface Order { id: string; userId: string; total: number; status: 'pending' | 'paid'; }
export interface OrderRepository { save(o: Order): Promise<void>; }
export interface PaymentGateway { charge(userId: string, amount: number): Promise<boolean>; }

// application/placeOrder.ts — pure use case, no Express / Mongo / Stripe imports
export function makePlaceOrder(repo: OrderRepository, payments: PaymentGateway) {
  return async (userId: string, total: number): Promise<Order> => {
    if (total <= 0) throw new Error('Total must be positive');   // business rule
    const order: Order = { id: crypto.randomUUID(), userId, total, status: 'pending' };
    const ok = await payments.charge(userId, total);
    if (ok) order.status = 'paid';
    await repo.save(order);
    return order;
  };
}

// infrastructure — adapters that implement the ports
class InMemoryOrderRepo implements OrderRepository {
  rows: Order[] = [];
  async save(o: Order) { this.rows.push(o); }
}
class FakePayments implements PaymentGateway {
  async charge() { return true; }
}

// composition root — wire it up (in production: MongoOrderRepo, StripeGateway)
const placeOrder = makePlaceOrder(new InMemoryOrderRepo(), new FakePayments());
console.log(await placeOrder('u_1', 499));`,
        },
      ],
      output: `It prints an order like \`{ id: '…uuid…', userId: 'u_1', total: 499, status: 'paid' }\`.

\`makePlaceOrder\` only knows the \`OrderRepository\` and \`PaymentGateway\` interfaces. Here we inject in-memory fakes, which makes this a fast unit test with no database or network. In production, the composition root injects a Mongo repository and a Stripe adapter instead — the use case code doesn't change at all.`,
      questions: [
        {
          q: 'What is the dependency rule in clean architecture?',
          a: 'Source code dependencies point only inwards. The domain and use cases never import frameworks, databases or UI; outer layers depend on inner ones through interfaces.',
        },
        {
          q: 'What are ports and adapters?',
          a: 'Ports are interfaces the application defines for what it needs (save an order, charge a card). Adapters are concrete implementations (MongoDB repo, Stripe client, Express controller) that plug into those ports.',
        },
        {
          q: 'Is clean architecture worth it for every project?',
          a: 'No. It adds files and indirection. It pays off for long-lived products with complex business rules; a small CRUD app can use a simpler routes-services-repositories structure.',
        },
      ],
      spoken: `"Clean architecture puts business logic at the centre and technology at the edges. The domain and use cases don't import Express, Mongoose or Stripe; instead, use cases define interfaces, or ports, like OrderRepository and PaymentGateway, and the infrastructure layer provides adapters that implement them. The dependency rule is that dependencies only point inwards, and everything gets wired together at startup. This makes use cases easy to unit test with fakes and lets me swap a database or provider with limited changes. For small CRUD apps I keep it lighter."`,
      mistakes: [
        'Leaking framework objects (Express `req`, Mongoose documents) into use cases.',
        'Creating interfaces for everything, even things that will never change, making simple code hard to follow.',
        'Putting business rules in controllers or database hooks.',
        'Follow-up trap: "How is this different from MVC?" MVC organises the UI/presentation layer. Clean architecture is about the whole application\'s dependency direction; MVC controllers would just be one outer adapter.',
      ],
      takeaway: 'Business rules in the centre, frameworks at the edges, dependencies pointing inward through interfaces.',
    },
    {
      id: 'ddd-basics',
      title: 'Domain-Driven Design Basics (Bounded Contexts, Aggregates)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Model software around the business domain: a shared language, bounded contexts that split the system, and aggregates that protect business rules.',
      what: `**Domain-Driven Design (DDD)** means designing software around the real business (the **domain**) and the language experts use.

Key ideas:
- **Ubiquitous language:** developers and business people use the same words. If the business says "enrolment", the code says \`Enrolment\`, not \`UserCourseMapping\`.
- **Bounded context:** a clear boundary inside which a word has one meaning. "Customer" in Billing (payment methods, invoices) is different from "Customer" in Support (tickets, chat history). Each context has its own model.
- **Entity:** an object with an identity that lasts (an Order with id 42).
- **Value object:** defined only by its values, no identity, usually immutable (Money { amount: 499, currency: 'INR' }, an Address).
- **Aggregate:** a cluster of objects treated as one unit for changes, with one **aggregate root** as the only entry point. Example: \`Order\` (root) with its \`OrderLines\`. You change lines only through the order, so its rules (like "total can't go negative") are always protected.

#### Deeper version
- **Aggregate rules of thumb:** keep them small; one transaction changes one aggregate; reference other aggregates by **ID**, not by holding the object; use **domain events** (\`OrderPaid\`) for effects in other aggregates, which may be eventually consistent.
- **Context mapping:** how contexts talk — shared kernel, customer/supplier, and an **anti-corruption layer** (a translation layer so a messy external or legacy model doesn't pollute yours, e.g. wrapping Stripe's objects into your own Billing model).
- **Bounded contexts are a great guide for microservice boundaries** — one service per context, not per table.
- **Strategic vs tactical DDD:** strategic = contexts and boundaries (most valuable); tactical = entities, value objects, aggregates, repositories, domain events.`,
      why: `Large systems get messy when one giant model tries to mean everything to everyone. DDD gives clear boundaries, models that match how the business thinks, and rules that live in one place — which makes complex domains (billing, scheduling, hiring workflows) easier to change safely.`,
      analogy: `A big company has departments: Sales, Finance, Shipping. Each department uses the word "order" a bit differently and keeps its own files. They talk through clear forms and handoffs, not by editing each other's files. Each department is a bounded context. A sealed parcel is an aggregate: you change its contents only by going through the packing desk (the root), which checks the rules.`,
      code: [
        {
          title: 'An aggregate root that protects its rules',
          lang: 'javascript',
          code: `// Value object: immutable, compared by value
const Money = (amount, currency = 'INR') => Object.freeze({ amount, currency });

// Aggregate root: the ONLY way to change order lines
class Order {
  #lines = [];
  #status = 'draft';
  events = [];

  constructor(id, customerId) {
    this.id = id;
    this.customerId = customerId; // reference another aggregate by ID only
  }

  addLine(productId, qty, price) {
    if (this.#status !== 'draft') throw new Error('Cannot change a placed order');
    if (qty <= 0) throw new Error('Quantity must be positive');
    this.#lines.push({ productId, qty, price });
  }

  get total() {
    return Money(this.#lines.reduce((sum, l) => sum + l.qty * l.price.amount, 0));
  }

  place() {
    if (this.#lines.length === 0) throw new Error('Order is empty');
    this.#status = 'placed';
    this.events.push({ type: 'OrderPlaced', orderId: this.id, total: this.total });
  }
}

const order = new Order('ord_1', 'cust_9');
order.addLine('course_42', 1, Money(499));
order.place();
console.log(order.total, order.events);
try { order.addLine('course_7', 1, Money(299)); } catch (e) { console.log(e.message); }`,
        },
      ],
      output: `It prints the total \`{ amount: 499, currency: 'INR' }\` and one \`OrderPlaced\` domain event. The last call fails with \`Cannot change a placed order\`. Because lines are private and only changed through \`Order\` methods, no other code can break the rules (like editing lines after placing). The \`OrderPlaced\` event can later be published so other bounded contexts (Billing, Email) react to it.`,
      questions: [
        {
          q: 'What is a bounded context?',
          a: 'A boundary within which a model and its terms have one clear meaning. The same word, like "customer", can mean different things in Billing and Support, so each context has its own model.',
        },
        {
          q: 'What is an aggregate and an aggregate root?',
          a: 'An aggregate is a group of objects changed together as one consistency unit. The root is the only entry point, so it can enforce the business rules for the whole group.',
        },
        {
          q: 'Entity vs value object?',
          a: 'An entity has a lasting identity (Order #42 stays the same order even if it changes). A value object has no identity and is defined by its values, like Money or Address, and is usually immutable.',
        },
        {
          q: 'How does DDD help with microservices?',
          a: 'Bounded contexts are natural service boundaries. Splitting by context, rather than by table, gives services that own a complete business capability and their own data.',
        },
      ],
      spoken: `"Domain-Driven Design means modelling the software around the business and its language. The most useful part for me is bounded contexts: splitting a big system into areas like Billing, Catalogue and Support, where each word has one clear meaning and each context owns its model. Those boundaries are also good microservice boundaries. Inside a context, aggregates group objects that must stay consistent, with a root as the only entry point, like an Order controlling its lines. Aggregates reference each other by ID and communicate through domain events."`,
      mistakes: [
        'Applying full tactical DDD to a simple CRUD app — lots of ceremony, little value.',
        'Huge aggregates that load half the database and cause locking conflicts. Keep them small.',
        'Sharing one "User" model across every part of the system instead of context-specific models.',
        'Follow-up trap: "How do you keep two aggregates consistent?" Usually not in one transaction; use domain events and eventual consistency, or reconsider the boundary if they truly must change together.',
      ],
      takeaway: 'Split the system into bounded contexts with a shared language, and protect business rules inside small aggregates.',
    },
    {
      id: 'cqrs',
      title: 'CQRS (Command Query Responsibility Segregation)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Use separate models (and sometimes separate databases) for writing data (commands) and reading data (queries).',
      what: `**CQRS** splits your system into two sides:
- **Commands** change data: \`PlaceOrder\`, \`CancelSubscription\`. They return little or nothing (maybe an ID).
- **Queries** read data: \`GetOrderHistory\`, \`GetDashboardStats\`. They never change anything.

Each side can have its own model. The write side is normalised and focused on business rules. The read side is shaped for screens — often **denormalised** (pre-joined) so queries are fast and simple.

#### Deeper version
Levels of CQRS:
1. **Code-level:** separate command handlers and query handlers, same database. Cheap and often useful.
2. **Separate read models:** the write side stores data normally; a **projection** process listens to changes (domain events, or change streams/CDC — change data capture) and updates read-optimised views, for example a MongoDB collection, an Elasticsearch index, or a Redis leaderboard.
3. **With event sourcing:** commands append events; projections build all read models from the event stream.

Trade-offs: read models are **eventually consistent** (a few ms to seconds behind), there are more moving parts, and you must be able to rebuild projections. Use it when reads and writes have very different shapes or loads (e.g. a dashboard that aggregates millions of rows, search, feeds) — not for simple CRUD.`,
      why: `In many apps, reads outnumber writes 100 to 1, and the screens need data shaped very differently from how it's stored. One model trying to serve both becomes slow and complicated. CQRS lets you optimise and scale each side separately.`,
      analogy: `A restaurant kitchen (write side) is organised for cooking: raw ingredients, prep stations, strict rules. The menu board (read side) is organised for customers: dish names, prices, photos. You don't make customers read the kitchen inventory; someone updates the menu board when the kitchen changes.`,
      code: [
        {
          title: 'Command side writes; a projection updates a read model',
          lang: 'javascript',
          code: `// Command handler: business rules + normalised write
export async function placeOrder(db, bus, { userId, items }) {
  if (!items.length) throw new Error('Empty order');
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const { insertedId } = await db.collection('orders').insertOne({
    userId, items, total, status: 'placed', createdAt: new Date(),
  });
  await bus.emit('OrderPlaced', { orderId: insertedId, userId, total });
  return insertedId;
}

// Projection: listens to events, keeps a denormalised read model up to date
export function registerProjections(db, bus) {
  bus.on('OrderPlaced', async ({ userId, total }) => {
    await db.collection('user_dashboard').updateOne(
      { _id: userId },
      { $inc: { orderCount: 1, lifetimeSpend: total }, $set: { lastOrderAt: new Date() } },
      { upsert: true },
    );
  });
}

// Query handler: one cheap read, no aggregation at request time
export function getDashboard(db, userId) {
  return db.collection('user_dashboard').findOne({ _id: userId });
}`,
        },
      ],
      output: `When a user places an order, the command handler validates and saves it, then emits \`OrderPlaced\`. The projection increments \`orderCount\` and \`lifetimeSpend\` in a \`user_dashboard\` document. The dashboard query is then a single \`findOne\` by ID, instead of aggregating all orders on every page load. The trade-off: right after placing an order, the dashboard might be a moment behind, and if events are delivered twice, \`$inc\` would double count — so in production the projection must be idempotent (track processed event IDs).`,
      questions: [
        {
          q: 'What is CQRS?',
          a: 'Separating the write model (commands that change state) from the read model (queries). Each can be optimised and scaled independently, and read models can be denormalised for fast queries.',
        },
        {
          q: 'When would you use CQRS?',
          a: 'When reads and writes differ a lot in shape or volume: heavy dashboards, search, feeds, reporting. Not for simple CRUD, where it only adds complexity.',
        },
        {
          q: 'Does CQRS require event sourcing?',
          a: 'No. They pair well, but you can use CQRS with a normal database and update read models from domain events or change streams.',
        },
        {
          q: 'What is the main downside?',
          a: 'Eventual consistency between write and read models, plus more components to build, monitor and rebuild when projections have bugs.',
        },
      ],
      spoken: `"CQRS means separating commands, which change state, from queries, which read it, and letting each side have its own model. The write side focuses on business rules with a normalised model. The read side has denormalised views shaped for screens, kept up to date by projections listening to events or change streams. That lets me make dashboards and searches very fast and scale reads separately. The cost is eventual consistency and more moving parts, so I only use it where reads and writes really differ, not for simple CRUD."`,
      mistakes: [
        'Using CQRS everywhere by default; most features don\'t need it.',
        'Forgetting that read models lag, then showing users confusing stale data right after they act. Return the new data from the command or update the UI optimistically.',
        'Non-idempotent projections that double count when an event is redelivered.',
        'Follow-up trap: "How do you fix a bug in a projection?" Fix the code, then rebuild the read model by replaying events or re-scanning the source data — so design projections to be rebuildable.',
      ],
      takeaway: 'CQRS separates writes from reads so each can be optimised; worth it only when their shapes or loads really differ.',
    },
    {
      id: 'high-availability-dr',
      title: 'High Availability, Fault Tolerance and Disaster Recovery',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Remove single points of failure with redundancy across zones, use health checks and failover, and plan backups with RTO/RPO targets.',
      what: `**Availability** is the percentage of time your system works. "Three nines" (99.9%) allows about 8.8 hours of downtime per year; "four nines" (99.99%) allows about 53 minutes.

**High availability (HA)** means removing **single points of failure (SPOF)**: anything that, if it dies, takes everything down. You do this with **redundancy**: more than one of everything (app servers, database replicas, load balancers), spread across **availability zones** (separate data centres in one region).

**Disaster recovery (DR)** is your plan when something big fails: a whole region, a deleted database, ransomware.

#### Deeper version
- **RTO (Recovery Time Objective):** how long you can be down. **RPO (Recovery Point Objective):** how much data (in time) you can lose. RPO 5 minutes means backups/replication must be at most 5 minutes behind.
- **DR strategies** (cheap/slow → expensive/fast): backup & restore → pilot light (minimal copy running) → warm standby (scaled-down copy running) → multi-site active-active.
- **Failover:** managed databases (RDS Multi-AZ, MongoDB Atlas replica sets) promote a replica to primary automatically, usually within tens of seconds to a couple of minutes. Apps must reconnect and retry.
- **Active-passive vs active-active:** passive waits idle until failover; active-active serves traffic from multiple sites (harder: data conflicts, replication).
- **Backups:** automated, point-in-time recovery, stored in another region/account, and **regularly test restores** — an untested backup is a hope, not a backup.
- **Graceful degradation:** if a non-critical dependency is down, keep the core working (checkout works even if recommendations don't).
- **Chaos testing:** deliberately kill instances to prove the system survives.
- Combined availability: two services in series at 99.9% each give about 99.8% overall — every extra dependency in the critical path lowers availability.`,
      why: `Hardware fails, zones go down, deploys go wrong, people delete data by mistake. Downtime costs money and trust — especially for payments, interviews or live sessions. HA keeps the system up during small failures; DR gets you back after big ones.`,
      analogy: `A plane has two engines, so it can fly if one fails (redundancy, HA). It also carries life jackets and has an emergency landing plan (disaster recovery). The crew practises the drill regularly — that's testing your restores.`,
      code: [
        {
          title: 'Health endpoints: liveness vs readiness',
          lang: 'javascript',
          code: `import express from 'express';
import mongoose from 'mongoose';

const app = express();
let shuttingDown = false;

// Liveness: is the process alive? (if this fails, restart the container)
app.get('/health/live', (req, res) => res.sendStatus(200));

// Readiness: can it serve traffic right now? (if not, LB stops sending traffic)
app.get('/health/ready', (req, res) => {
  const dbOk = mongoose.connection.readyState === 1; // 1 = connected
  if (shuttingDown || !dbOk) return res.status(503).json({ ready: false, dbOk });
  res.json({ ready: true });
});

process.on('SIGTERM', () => { shuttingDown = true; /* then drain and close */ });

app.listen(3000);`,
        },
        {
          title: 'Availability and downtime math',
          lang: 'javascript',
          code: `const minutesPerYear = 365 * 24 * 60;
for (const sla of [99, 99.9, 99.95, 99.99]) {
  const downtime = minutesPerYear * (1 - sla / 100);
  console.log(\`\${sla}% -> \${(downtime / 60).toFixed(1)} hours/year\`);
}
// Two dependencies in series multiply:
console.log('Series:', (0.999 * 0.999 * 100).toFixed(2) + '%');`,
        },
      ],
      output: `The load balancer calls \`/health/ready\`. If the database disconnects or the app is shutting down, it returns 503 and the LB stops routing traffic there, while Kubernetes uses \`/health/live\` to decide whether to restart the container.

The math prints: 99% → 87.6 hours/year, 99.9% → 8.8 hours, 99.95% → 4.4 hours, 99.99% → 0.9 hours (about 53 minutes). Two 99.9% dependencies in series give 99.80% — each dependency in the critical path costs you availability.`,
      questions: [
        {
          q: 'How do you design for high availability?',
          a: 'Remove single points of failure: multiple instances across availability zones behind a load balancer, replicated databases with automatic failover, health checks, stateless services, and graceful degradation for non-critical dependencies.',
        },
        {
          q: 'What are RTO and RPO?',
          a: 'RTO is the maximum acceptable downtime. RPO is the maximum acceptable data loss, measured in time. They decide your backup frequency and DR strategy.',
        },
        {
          q: 'What is the difference between liveness and readiness probes?',
          a: 'Liveness says the process is alive; failing it causes a restart. Readiness says it can serve traffic now; failing it removes the instance from the load balancer without restarting it.',
        },
        {
          q: 'How do you know your backups work?',
          a: 'By regularly restoring them to a separate environment and checking the data, ideally automated. Backups should also be stored in a different region or account.',
        },
      ],
      spoken: `"For high availability I remove single points of failure: multiple stateless instances across availability zones behind a load balancer, a replicated database with automatic failover, and health checks so traffic only goes to healthy instances. I separate liveness from readiness so we restart broken processes but just drain ones that are temporarily unready. For disaster recovery I agree RTO and RPO with the business, then choose backups with point-in-time recovery, cross-region copies, or a warm standby. And I test restores regularly, because an untested backup isn't a backup."`,
      mistakes: [
        'Running everything in one availability zone, or one Redis instance that everything depends on.',
        'Readiness checks that call every downstream dependency, so one slow third party marks all instances unready at once.',
        'Never testing backup restores or failover.',
        'Follow-up trap: "Is 100% availability possible?" No. Aim for an SLO that matches business needs; each extra nine costs a lot more money and complexity.',
      ],
      takeaway: 'Redundancy across zones removes single points of failure; RTO/RPO drive your DR plan; tested restores are the only real backups.',
    },
    {
      id: 'event-sourcing',
      title: 'Event Sourcing',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'Store every change as an immutable event, and rebuild current state by replaying events, instead of overwriting rows.',
      what: `Normally we store the **current state**: \`balance = 700\`. When it changes, we overwrite it, and the history is lost.

With **event sourcing**, we store **every change as an event** in an append-only log:
- \`AccountOpened\`
- \`MoneyDeposited { amount: 1000 }\`
- \`MoneyWithdrawn { amount: 300 }\`

The current state (balance 700) is calculated by **replaying** the events in order. Events are never edited or deleted — to fix a mistake, you add a new correcting event.

#### Deeper version
- **Event store:** an append-only store, with events grouped into **streams** (one per aggregate, e.g. \`account-123\`) and a **version** per stream. Options: EventStoreDB, Kafka (as a log, with care), or a Postgres/Mongo table with a unique \`(streamId, version)\` index.
- **Optimistic concurrency:** when appending, say "I expect the stream to be at version 5". If someone else already wrote version 6, the unique index rejects your write and you retry. This stops lost updates.
- **Snapshots:** replaying 1 million events is slow, so periodically save the state at version N and replay only newer events.
- **Projections:** build read models (CQRS) from the event stream. You can build **new** views later from the full history.
- **Event versioning (upcasting):** old events stay forever, so your code must handle old event shapes.
- **Hard parts:** querying current state needs projections, schema evolution, GDPR "right to be forgotten" with immutable events (crypto-shredding: encrypt personal data with a per-user key and delete the key), and a steep learning curve.

Good fits: finance/ledgers, audit-heavy domains, booking systems, collaborative editing. Bad fit: simple CRUD.`,
      why: `You get a complete, trustworthy audit trail for free, you can answer "what was the state on 1 March?", debug by replaying exactly what happened, and build new reports from old data. Many domains (accounting, banking) already think in events — a ledger is event sourcing.`,
      analogy: `A bank passbook. It doesn't just say "balance: 700". It lists every deposit and withdrawal. You can always recompute the balance by adding them up, and see exactly what happened on any date. Nobody erases a line; mistakes are fixed with a new correcting entry.`,
      code: [
        {
          title: 'Append events with optimistic concurrency, rebuild by replay',
          lang: 'javascript',
          code: `// One-time setup: db.events.createIndex({ streamId: 1, version: 1 }, { unique: true })

export async function appendEvent(db, streamId, expectedVersion, type, data) {
  try {
    await db.collection('events').insertOne({
      streamId, version: expectedVersion + 1, type, data, at: new Date(),
    });
  } catch (err) {
    if (err.code === 11000) throw new Error('Concurrency conflict: reload and retry');
    throw err;
  }
}

// Pure function: state = fold over events
function apply(state, e) {
  switch (e.type) {
    case 'AccountOpened':  return { ...state, open: true, balance: 0 };
    case 'MoneyDeposited': return { ...state, balance: state.balance + e.data.amount };
    case 'MoneyWithdrawn': return { ...state, balance: state.balance - e.data.amount };
    default: return state;
  }
}

export async function loadAccount(db, streamId) {
  const events = await db.collection('events').find({ streamId }).sort({ version: 1 }).toArray();
  const state = events.reduce(apply, { open: false, balance: 0 });
  return { state, version: events.length };
}

export async function withdraw(db, streamId, amount) {
  const { state, version } = await loadAccount(db, streamId);
  if (state.balance < amount) throw new Error('Insufficient funds'); // rule on current state
  await appendEvent(db, streamId, version, 'MoneyWithdrawn', { amount });
}`,
        },
      ],
      output: `After \`AccountOpened\`, \`MoneyDeposited 1000\` and \`MoneyWithdrawn 300\`, \`loadAccount\` replays the three events and returns \`{ open: true, balance: 700 }\` at version 3.

If two withdrawals run at the same moment, both load version 3 and both try to insert version 4. The unique index lets only one succeed; the other gets "Concurrency conflict", reloads (now seeing the new balance) and re-checks the rule. So you can't overdraw the account through a race.`,
      questions: [
        {
          q: 'What is event sourcing?',
          a: 'Persisting every state change as an immutable event in an append-only log, and deriving current state by replaying those events instead of storing and overwriting the latest state.',
        },
        {
          q: 'What are the benefits and costs?',
          a: 'Benefits: full audit trail, time travel, replay for debugging, new projections from history. Costs: complexity, eventual consistency for read models, event schema evolution, and harder deletes for privacy laws.',
        },
        {
          q: 'How do you avoid replaying millions of events every time?',
          a: 'Use snapshots: store the computed state at some version, then load the snapshot and replay only the events after it.',
        },
        {
          q: 'How do you handle concurrent writes?',
          a: 'Optimistic concurrency: append with an expected version. A unique index on stream and version rejects the second writer, who reloads and retries.',
        },
      ],
      spoken: `"Event sourcing means I store every change as an immutable event, like MoneyDeposited or MoneyWithdrawn, in an append-only stream, and I rebuild current state by replaying those events. It gives a complete audit trail, lets me see the state at any point in time, and lets me build new read models from history, so it pairs naturally with CQRS. For concurrency I append with an expected version and a unique index, and I use snapshots to avoid long replays. The costs are complexity, event versioning and privacy deletes, so I'd only use it for audit-heavy domains like ledgers."`,
      mistakes: [
        'Using event sourcing for simple CRUD where nobody needs the history.',
        'Editing or deleting past events to "fix" data instead of adding a compensating event.',
        'Storing events that are too vague ("UserUpdated") instead of meaningful business events ("EmailChanged").',
        'Follow-up trap: "How do you delete a user\'s personal data under GDPR if events are immutable?" Keep personal data out of events where possible, or encrypt it with a per-user key and delete the key (crypto-shredding).',
      ],
      takeaway: 'Event sourcing stores what happened, not just what is — great for audit and history, but only worth its complexity in the right domains.',
    },
    {
      id: 'saga-pattern',
      title: 'Saga Pattern (Choreography vs Orchestration)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Run a multi-service business transaction as a series of local steps, with compensating actions to undo earlier steps if a later one fails.',
      what: `In microservices, each service has its own database, so you can't wrap "create order + charge payment + reserve seat" in one database transaction.

A **saga** breaks the big transaction into **local transactions**, one per service. If a step fails, the saga runs **compensating actions** to undo the earlier steps.

Example (course purchase):
1. Orders: create order (pending) — compensation: cancel order
2. Payments: charge card — compensation: refund
3. Enrolment: enrol student — if this fails → refund payment → cancel order

Two styles:
- **Choreography:** no central boss. Each service listens to events and publishes its own (\`OrderCreated\` → Payments charges → \`PaymentSucceeded\` → Enrolment enrols...).
- **Orchestration:** a central **orchestrator** tells each service what to do, step by step, and decides what to compensate.

#### Deeper version
- **Choreography** is simple for 2-3 steps and very decoupled, but the flow is spread across services, so it's hard to see, change and debug. Watch out for cyclic event dependencies.
- **Orchestration** keeps the whole flow in one place, easier to understand, monitor and change. The orchestrator must persist its state (which step it's on) so it can resume after a crash. Tools: AWS Step Functions, Temporal, or a state machine in your own DB with BullMQ jobs.
- **Compensations are semantic, not rollbacks:** you can't "un-send" an email; you send a correction. A refund is a new transaction, not erasing the charge.
- Every step and compensation must be **idempotent** and retryable.
- Sagas give **eventual consistency**, without isolation: other users may see intermediate states (an order "pending" for a moment). Use status fields like \`PENDING\` to make that explicit.
- Put the **least likely to fail or hardest to undo** step last (a "pivot" step) — e.g. send the confirmation email only after everything succeeded.`,
      why: `Distributed transactions with two-phase commit (2PC) lock resources across services, are slow, and fragile; most modern databases and brokers don't support them across services anyway. Sagas give reliable multi-step business processes with eventual consistency.`,
      analogy: `Booking a holiday: you book a flight, then a hotel, then a car. If the car booking fails, you don't magically "undo time" — you cancel the hotel and cancel the flight (compensations). Choreography is each company emailing the next one. Orchestration is a travel agent who handles every step and every cancellation.`,
      code: [
        {
          title: 'Orchestrated saga with compensations',
          lang: 'javascript',
          code: `// Each step has an action and a compensation. Both must be idempotent.
const steps = [
  {
    name: 'createOrder',
    run: async (ctx) => { ctx.orderId = 'ord_1'; console.log('order created'); },
    undo: async (ctx) => console.log('order cancelled', ctx.orderId),
  },
  {
    name: 'chargePayment',
    run: async (ctx) => { ctx.paymentId = 'pay_1'; console.log('payment charged'); },
    undo: async (ctx) => console.log('payment refunded', ctx.paymentId),
  },
  {
    name: 'enrolStudent',
    run: async () => { throw new Error('Course is full'); },
    undo: async () => {},
  },
];

export async function runSaga(steps, ctx = {}) {
  const done = [];
  for (const step of steps) {
    try {
      await step.run(ctx);          // in production: persist "step X done" in DB
      done.push(step);
    } catch (err) {
      console.log(\`\${step.name} failed: \${err.message}. Compensating...\`);
      for (const s of done.reverse()) await s.undo(ctx);   // undo in reverse order
      return { ok: false, reason: err.message };
    }
  }
  return { ok: true, ctx };
}

console.log(await runSaga(steps));`,
        },
      ],
      output: `Output:
\`order created\`
\`payment charged\`
\`enrolStudent failed: Course is full. Compensating...\`
\`payment refunded pay_1\`
\`order cancelled ord_1\`
\`{ ok: false, reason: 'Course is full' }\`

Compensations run in **reverse** order. In a real system the orchestrator saves its progress after every step (in a DB table or a tool like Temporal/Step Functions), so if it crashes after the payment, it resumes and either continues or compensates — the student is never charged without being enrolled.`,
      questions: [
        {
          q: 'What is a saga and why is it needed?',
          a: 'A way to manage a business transaction across services with separate databases: a sequence of local transactions with compensating actions on failure. It replaces distributed transactions, which are slow and rarely supported.',
        },
        {
          q: 'Choreography vs orchestration?',
          a: 'Choreography: services react to each other\'s events, no central coordinator — decoupled but hard to follow. Orchestration: a central coordinator drives each step and compensation — easier to understand, monitor and change, but it is another component.',
        },
        {
          q: 'What is a compensating transaction?',
          a: 'An action that semantically undoes a completed step, like refunding a charge or releasing a reserved seat. It\'s a new action, not a database rollback.',
        },
        {
          q: 'What happens if the orchestrator crashes mid-saga?',
          a: 'It must persist saga state after each step, so on restart it reads the state and resumes or compensates. Steps must be idempotent because some may be retried.',
        },
      ],
      spoken: `"A saga handles a business transaction that spans several services, since we can't use one database transaction across them. It's a sequence of local transactions, and if a later step fails, we run compensating actions for the earlier ones, like refunding a payment and cancelling the order. With choreography, services react to each other's events, which is decoupled but hard to follow. With orchestration, a coordinator drives the steps and persists its state, which I prefer for flows longer than two or three steps. Every step and compensation must be idempotent."`,
      mistakes: [
        'Assuming a saga gives isolation like a database transaction. Other requests can see intermediate states.',
        'Compensations that are not idempotent, so a retried refund refunds twice.',
        'Orchestrator keeping state only in memory, so a crash leaves sagas stuck halfway.',
        'Follow-up trap: "What if a compensation itself fails?" Retry it with backoff (it must be idempotent); if it keeps failing, park it in a dead-letter queue and alert a human — never silently drop it.',
      ],
      takeaway: 'A saga = local transactions + compensating actions; prefer orchestration for complex flows and make every step idempotent.',
    },
    {
      id: 'outbox-pattern',
      title: 'Transactional Outbox Pattern',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Save the event in the same database transaction as the data change, then a separate relay publishes it — so you never lose or invent events.',
      what: `A common bug: you save an order to the database, then publish \`OrderPlaced\` to a queue. If the app crashes between the two steps, the order exists but no event is sent — the email and enrolment never happen. If you publish first and the DB write fails, you sent an event for an order that doesn't exist. This is the **dual-write problem**.

The **outbox pattern** fixes it:
1. In **one database transaction**, write the order **and** an event row into an \`outbox\` table/collection.
2. A separate **relay** (a poller or a change stream / CDC reader) reads unsent outbox rows and publishes them to the broker, then marks them as sent.

Because the data and the event are saved atomically, either both exist or neither does.

#### Deeper version
- The relay may publish an event and crash before marking it sent, so it publishes again on restart → **at-least-once** delivery. Consumers must be idempotent (use the outbox row ID as the event ID).
- **Polling relay:** simple; query \`status: 'pending'\` every second, ordered by creation time.
- **CDC (change data capture):** stream DB changes (MongoDB change streams, Debezium for Postgres/MySQL) and publish them — lower latency, more infrastructure.
- Multiple relay instances need coordination (a lock, or claiming rows with an atomic update / \`SELECT ... FOR UPDATE SKIP LOCKED\` in Postgres) to avoid heavy duplicate publishing.
- The mirror pattern on the consumer side is the **inbox**: store received message IDs to deduplicate.
- Clean up old sent rows with a TTL index or a scheduled job.`,
      why: `Event-driven systems and sagas depend on events being published reliably. The outbox guarantees that every committed change produces its event — without distributed transactions between the database and the message broker.`,
      analogy: `Instead of writing a letter and then hoping you remember to post it, you write the letter and drop it in your office's "outgoing mail" tray in the same motion. The mail clerk (relay) empties the tray regularly and posts everything. If the clerk is sick for an hour, the letters wait in the tray — none are lost.`,
      code: [
        {
          title: 'Write data + outbox event in one MongoDB transaction',
          lang: 'javascript',
          code: `export async function placeOrder(client, order) {
  const db = client.db('app');
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection('orders').insertOne(order, { session });
      await db.collection('outbox').insertOne({
        type: 'OrderPlaced',
        payload: { orderId: order._id, userId: order.userId, total: order.total },
        status: 'pending',
        createdAt: new Date(),
      }, { session });
    });   // both inserts commit together, or neither does
  } finally {
    await session.endSession();
  }
}`,
        },
        {
          title: 'Relay: claim, publish, mark sent',
          lang: 'javascript',
          code: `export async function runRelay(db, publish) {
  while (true) {
    // Atomically claim one pending event so two relays don't take the same row
    const evt = await db.collection('outbox').findOneAndUpdate(
      { status: 'pending' },
      { $set: { status: 'processing', claimedAt: new Date() } },
      { sort: { createdAt: 1 }, returnDocument: 'after' },
    );
    if (!evt) { await new Promise((r) => setTimeout(r, 1000)); continue; }

    try {
      await publish(evt.type, { eventId: String(evt._id), ...evt.payload });
      await db.collection('outbox').updateOne({ _id: evt._id }, { $set: { status: 'sent' } });
    } catch {
      // put it back for a retry (a real relay would also count attempts)
      await db.collection('outbox').updateOne({ _id: evt._id }, { $set: { status: 'pending' } });
    }
  }
}`,
        },
      ],
      output: `\`placeOrder\` commits the order and its \`OrderPlaced\` outbox row together. If the app crashes before commit, neither exists; after commit, both exist. The relay picks the oldest pending row, publishes it with \`eventId\` set to the outbox row ID, and marks it sent. If the relay crashes after publishing but before marking it sent, the row needs to be returned to pending (for example by a sweeper that resets old \`processing\` rows using \`claimedAt\`) and gets published again — consumers dedupe by \`eventId\`. (MongoDB transactions need a replica set or sharded cluster.)`,
      questions: [
        {
          q: 'What problem does the outbox pattern solve?',
          a: 'The dual-write problem: you can\'t atomically write to a database and publish to a broker. The outbox stores the event in the same DB transaction as the data, and a relay publishes it later.',
        },
        {
          q: 'Does the outbox give exactly-once delivery?',
          a: 'No, at-least-once. The relay can publish and crash before marking sent. Consumers must deduplicate using the event ID.',
        },
        {
          q: 'Polling relay vs CDC?',
          a: 'Polling is simple and works anywhere but adds a little latency and DB load. CDC (change streams, Debezium) streams changes in near real time but needs more infrastructure.',
        },
      ],
      spoken: `"The outbox pattern solves the dual-write problem: if I save an order and then publish an event, a crash in between loses the event, and there's no transaction across the database and the broker. So in one database transaction I insert both the order and an event row into an outbox collection. A separate relay, either polling or using change streams, publishes pending rows to the broker and marks them sent. That gives at-least-once delivery, so consumers deduplicate using the outbox row ID as the event ID."`,
      mistakes: [
        'Publishing to the broker inside the DB transaction — the publish can succeed even if the transaction later aborts.',
        'Assuming exactly-once delivery from the relay.',
        'Never cleaning up the outbox, so it grows forever and polling gets slower (add an index on status + createdAt, and a TTL for sent rows).',
        'Follow-up trap: "What about ordering?" A single relay processing in createdAt order keeps rough order; for strict per-entity order, publish with the entity ID as the partition/message group key.',
      ],
      takeaway: 'Write the event to an outbox table in the same transaction as the data; a relay publishes it — reliable events without distributed transactions.',
    },
    {
      id: 'consistent-hashing',
      title: 'Consistent Hashing',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A way to spread keys across servers so that adding or removing a server moves only a small fraction of keys.',
      what: `To spread data across N cache or database servers, the simple way is \`server = hash(key) % N\`. Problem: if N changes from 4 to 5, almost **every** key maps to a different server. For a cache, that means nearly all lookups miss at once and the database gets flooded.

**Consistent hashing** puts servers and keys on a **ring** (a circle of hash values). Each key belongs to the **first server clockwise** from its position. When you add a server, it only takes keys from its neighbour; when you remove one, only its keys move to the next server. Roughly only **1/N** of keys move.

#### Deeper version
- **Virtual nodes (vnodes):** each physical server is placed on the ring many times (e.g. 100-200 points). This spreads load evenly and, when a server leaves, its keys are spread across many servers instead of overloading one neighbour. Stronger machines can get more vnodes (weighting).
- **Where it's used:** distributed caches (client-side sharding for Memcached), DynamoDB and Cassandra partitioning, some load balancers for sticky routing, CDNs.
- **Replication:** store a key on the next R distinct servers clockwise for redundancy.
- **Redis Cluster** does not use a ring; it uses **16,384 hash slots** (\`CRC16(key) mod 16384\`), assigned to nodes. Similar goal: move slots, not all keys, when resharding.
- **Hot keys** are still a problem: one very popular key lands on one server whatever the scheme. Fix with local caching, key replication, or splitting the key.`,
      why: `In systems that scale up and down (caches, sharded databases), servers come and go. Consistent hashing keeps most keys where they are, avoiding mass cache misses and huge data migrations.`,
      analogy: `Picture a round table with seats (servers) and guests (keys) who sit at the next free seat clockwise from where they enter. If a new seat is added, only the guests between the new seat and the previous one move. With modulo hashing, adding a seat would make everyone in the room change places.`,
      code: [
        {
          title: 'Consistent hash ring with virtual nodes',
          lang: 'javascript',
          code: `import { createHash } from 'node:crypto';

const h = (s) => createHash('md5').update(s).digest().readUInt32BE(0);

class HashRing {
  constructor(nodes = [], vnodes = 100) {
    this.vnodes = vnodes;
    this.ring = [];                    // sorted [{ pos, node }]
    nodes.forEach((n) => this.add(n));
  }
  add(node) {
    for (let i = 0; i < this.vnodes; i++) this.ring.push({ pos: h(\`\${node}#\${i}\`), node });
    this.ring.sort((a, b) => a.pos - b.pos);
  }
  remove(node) {
    this.ring = this.ring.filter((p) => p.node !== node);
  }
  get(key) {
    const pos = h(key);
    // first point clockwise (binary search would be faster)
    const point = this.ring.find((p) => p.pos >= pos) ?? this.ring[0];
    return point.node;
  }
}

const keys = Array.from({ length: 10_000 }, (_, i) => \`user:\${i}\`);
const ring = new HashRing(['cache-a', 'cache-b', 'cache-c', 'cache-d']);
const before = keys.map((k) => ring.get(k));
ring.add('cache-e');
const moved = keys.filter((k, i) => ring.get(k) !== before[i]).length;

const moduloMoved = keys.filter((k) => h(k) % 4 !== h(k) % 5).length;
console.log({ ringMovedPct: moved / 100, moduloMovedPct: moduloMoved / 100 });`,
        },
      ],
      output: `It prints something like \`{ ringMovedPct: 20, moduloMovedPct: 80 }\` (exact numbers vary a bit). Adding a fifth server to the ring moved about 20% of keys — roughly 1/5, only the keys the new server takes over. With plain modulo, about 80% of keys moved. For a cache, that's the difference between a small dip in hit rate and nearly every request hitting the database at once.`,
      questions: [
        {
          q: 'What problem does consistent hashing solve?',
          a: 'With `hash % N`, changing N remaps almost every key. Consistent hashing remaps only about 1/N of keys when a node is added or removed, which avoids cache stampedes and big data migrations.',
        },
        {
          q: 'Why use virtual nodes?',
          a: 'With few points on the ring, load is uneven. Many virtual points per server spread keys evenly, and when a server leaves, its load is shared by many servers instead of one neighbour.',
        },
        {
          q: 'Does Redis Cluster use consistent hashing?',
          a: 'Not a ring. It uses 16,384 fixed hash slots computed with CRC16 and assigns slots to nodes; resharding moves slots. The goal is similar.',
        },
      ],
      spoken: `"Consistent hashing places both servers and keys on a hash ring, and each key belongs to the next server clockwise. The point is that adding or removing a server only moves about one over N of the keys, unlike hash mod N where almost everything moves, which would wipe out a cache. Virtual nodes put each server on the ring many times for even distribution and smoother rebalancing. It's used in systems like Cassandra, DynamoDB and client-side cache sharding. Redis Cluster uses a related idea with 16,384 hash slots."`,
      mistakes: [
        'Using `hash(key) % N` for cache sharding in a system that autoscales.',
        'Using too few virtual nodes, so one server gets far more keys than others.',
        'Thinking consistent hashing fixes hot keys — one very popular key still lands on one server.',
        'Follow-up trap: "How do you add replication?" Store each key on the next R distinct physical nodes clockwise on the ring.',
      ],
      takeaway: 'Consistent hashing moves only ~1/N of keys when servers change; virtual nodes keep the load even.',
    },
    {
      id: 'design-url-shortener',
      title: 'System Design: URL Shortener',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Design bit.ly: generate short unique codes, redirect very fast, handle a 100:1 read-heavy load, and optionally track clicks.',
      what: `**Functional requirements**
- Given a long URL, return a short URL like \`sho.rt/aZ3k9Q\`.
- Visiting the short URL redirects to the long URL.
- Optional: custom alias, expiry date, click analytics, user accounts.

**Non-functional requirements**
- Very low redirect latency (under ~50 ms at the server), high availability (redirects must not break).
- Short codes must be unique and hard to guess in order (optional).
- Read-heavy: about 100 reads per write.

**Rough estimates**
- 1M new URLs/day → ~12 writes/sec. 100:1 → ~1,200 reads/sec, ~3,500 at peak.
- 500 bytes per record x 1M x 365 x 5 years ≈ 0.9 TB.
- Code length: base62 (a-z, A-Z, 0-9) with 7 characters = 62^7 ≈ 3.5 trillion codes — plenty.

#### Deeper version
**Code generation options:**
1. **Hash the URL** (MD5/SHA → take 7 chars): same URL gives same code, but collisions must be checked and retried.
2. **Counter + base62:** a global counter (Redis \`INCR\`, or a DB sequence) turned into base62. No collisions. To avoid one hot counter, each app server **reserves a range** (e.g. 1,000 IDs at a time). Sequential codes are guessable — shuffle/encrypt the number if that matters.
3. **Pre-generated key service:** generate random unique codes offline, hand them out from a pool.
4. **Random code + unique index:** generate random 7 chars, insert, retry on duplicate. Simple and good at this scale.

**Data model:** \`{ code (unique, PK), longUrl, userId, createdAt, expiresAt }\`. A key-value lookup by code — fits DynamoDB, MongoDB, Cassandra or Postgres.`,
      why: `Key challenges:
- Generating **unique, short** codes at scale without collisions or a single bottleneck.
- Making redirects **extremely fast and always available** — they're 99% of the traffic. Caching is central.
- Choosing **301 vs 302**: 301 (permanent) is cached by browsers, so less load but you lose click analytics; 302 (temporary) hits your server every time.
- Analytics without slowing down redirects (do it asynchronously).
- Abuse: spam/phishing links, enumeration of codes, rate limiting creation.`,
      analogy: `It's like a cloakroom. You hand over a big coat (long URL) and get a small numbered ticket (short code). Later anyone with the ticket gets the coat back instantly. The cloakroom needs a ticket machine that never prints the same number twice, and a fast shelf near the counter for the most popular coats (the cache).`,
      code: [
        {
          title: 'Base62 encoding + range-based ID allocation',
          lang: 'javascript',
          code: `const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function toBase62(num) {
  if (num === 0) return ALPHABET[0];
  let out = '';
  while (num > 0) {
    out = ALPHABET[num % 62] + out;
    num = Math.floor(num / 62);
  }
  return out;
}

export function fromBase62(str) {
  return [...str].reduce((n, ch) => n * 62 + ALPHABET.indexOf(ch), 0);
}

// Each server grabs a block of 1000 IDs from Redis, then hands them out locally.
export function makeIdAllocator(redis, blockSize = 1000) {
  let next = 0, end = 0;
  return async function nextId() {
    if (next >= end) {
      end = await redis.incrBy('url:id-counter', blockSize); // atomic across servers
      next = end - blockSize;
    }
    return next++;
  };
}

console.log(toBase62(125), toBase62(3_521_614_606_207)); // "21", "ZZZZZZZ"
console.log(fromBase62('21'));                             // 125`,
        },
        {
          title: 'Create + redirect endpoints with cache-aside',
          lang: 'javascript',
          code: `// POST /urls  { longUrl }
app.post('/urls', async (req, res) => {
  const { longUrl } = req.body;
  if (!/^https?:\\/\\//.test(longUrl)) return res.status(400).json({ error: 'Invalid URL' });
  const code = toBase62(await nextId() + 100_000_000);  // offset avoids very short codes
  await db.collection('urls').insertOne({ _id: code, longUrl, createdAt: new Date() });
  res.status(201).json({ shortUrl: \`https://sho.rt/\${code}\` });
});

// GET /:code -> redirect (the hot path)
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  let longUrl = await redis.get(\`u:\${code}\`);
  if (!longUrl) {
    const doc = await db.collection('urls').findOne({ _id: code });
    if (!doc) return res.status(404).send('Not found');
    longUrl = doc.longUrl;
    await redis.set(\`u:\${code}\`, longUrl, { EX: 86400 });
  }
  clickQueue.add('click', { code, at: Date.now(), ua: req.get('user-agent') }); // async analytics, not awaited
  res.redirect(302, longUrl);  // 302 so every click reaches us for analytics
});`,
        },
        {
          title: 'Architecture diagram',
          lang: 'text',
          code: `  Browser
     |
     v
  [ CDN / Edge ] ---- (optional: cache popular redirects)
     |
     v
  [ Load Balancer ]
     |
     v
  [ API servers (stateless, N copies) ] --- INCRBY ---> [ Redis: ID counter ]
     |            |                    |
     | read       | write              | enqueue click
     v            v                    v
  [ Redis cache ] [ DB: urls ]      [ Queue ] --> [ Analytics workers ] --> [ ClickHouse / BigQuery ]
     (miss) -----> (code -> longUrl,
                   replicas for reads)`,
        },
      ],
      output: `**Create flow:** client → LB → API server. The server takes the next ID from its locally reserved block (one Redis \`INCRBY\` per 1,000 URLs), converts it to base62, stores \`{ _id: code, longUrl }\`, and returns the short URL.

**Redirect flow:** client → (CDN) → LB → API server → Redis. On a hit (most traffic), redirect immediately. On a miss, read the DB, fill the cache, redirect. A click event is pushed to a queue without waiting; workers write it to an analytics store.

**Scaling and trade-offs:**
- Reads dominate, so cache hot codes in Redis (a small set of links gets most clicks) and use DB read replicas.
- The DB is a key-value lookup by \`_id\`, easy to shard by code if needed.
- 302 keeps analytics accurate; 301 saves load but browsers skip you after the first visit.
- Sequential codes are guessable; if privacy matters, use random codes with a unique index, or scramble the ID before encoding.
- Expired links: TTL index or a cleanup job; return 410 Gone.
- Abuse: rate limit creation per user/IP, scan URLs against malware lists.`,
      questions: [
        {
          q: 'How do you guarantee unique short codes across many servers?',
          a: 'Use a central atomic counter (Redis INCR or a DB sequence) and base62-encode it, with each server reserving a block of IDs so the counter isn\'t hit on every request. Alternatively random codes with a unique index and retry on conflict.',
        },
        {
          q: '301 or 302 redirect?',
          a: '301 is permanent and cached by browsers, reducing load but hiding repeat clicks. 302 is temporary, so every click reaches the server — better for analytics and for changing destinations later.',
        },
        {
          q: 'How long should the code be?',
          a: 'Base62 with 7 characters gives about 3.5 trillion combinations, which covers billions of URLs with lots of headroom.',
        },
        {
          q: 'How do you handle a link that goes viral?',
          a: 'It\'s a hot key: serve it from Redis, add a short in-process cache or CDN caching for the redirect, so the database isn\'t touched and even Redis load is reduced.',
        },
        {
          q: 'How would you add click analytics without slowing redirects?',
          a: 'Publish a click event to a queue or stream asynchronously and return the redirect immediately. Workers aggregate into an analytics database in batches.',
        },
      ],
      spoken: `"For a URL shortener I'd first note it's very read-heavy, roughly 100 reads per write. To create links, stateless API servers take IDs from a Redis counter in blocks of a thousand and base62-encode them, so seven characters give trillions of codes with no collisions. Links are stored as a key-value record by code. For redirects, I check Redis first, fall back to the database and fill the cache, then return a 302 so we can count clicks. Click events go to a queue for async analytics. I'd add rate limiting and URL scanning against abuse."`,
      mistakes: [
        'Hashing the long URL and taking 7 chars without handling collisions.',
        'Hitting one central counter or the database on every redirect instead of caching.',
        'Writing analytics synchronously inside the redirect, making every click slower.',
        'Forgetting abuse: unlimited anonymous creation, phishing links, enumerating sequential codes.',
        'Follow-up trap: "What if Redis (the counter) goes down?" Servers still have their reserved blocks for a while; you can also fall back to random codes with a unique index, or use a DB sequence as the counter source.',
      ],
      takeaway: 'Unique codes via counter + base62 (or random + unique index), cache-first redirects, async analytics — it\'s all about the read path.',
    },
    {
      id: 'design-rate-limiter',
      title: 'System Design: Rate Limiter',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Limit how many requests a user, IP or API key can make in a time window, consistently across many servers, using Redis and an algorithm like token bucket.',
      what: `**Functional requirements**
- Limit requests per client (user ID, API key or IP), e.g. 100 requests per minute.
- Different limits per endpoint or plan (free vs pro).
- When over the limit, return **HTTP 429 Too Many Requests** with a \`Retry-After\` header.

**Non-functional requirements**
- Works across many API servers (a shared view of counts).
- Very low added latency (about 1 ms), highly available.
- If the limiter fails, decide: **fail open** (allow traffic) or **fail closed** (block).

**Rough estimates**
- 10M active users, one small Redis key each (~100 bytes) ≈ 1 GB — fits in Redis memory easily.
- Each API request = 1 Redis round trip.

#### Deeper version
**Algorithms:**
- **Fixed window counter:** count per minute (\`INCR key; EXPIRE 60\`). Simple, but allows bursts at window edges (100 at 0:59 + 100 at 1:00).
- **Sliding window log:** store each request timestamp (sorted set), count those in the last 60s. Accurate, more memory.
- **Sliding window counter:** weighted mix of current and previous window counts. Good accuracy, low memory.
- **Token bucket:** a bucket holds up to N tokens and refills at R tokens/sec; each request takes a token. Allows short bursts but enforces an average rate. Used widely (AWS, Stripe-style limits).
- **Leaky bucket:** requests drain at a fixed rate — smooths traffic, like a queue.

**Atomicity:** read-then-write from Node in two calls has a race. Use a **Lua script** in Redis (runs atomically) or atomic commands like \`INCR\`.`,
      why: `Key challenges:
- Protecting services from abuse, bots, brute-force logins and accidental retry storms; controlling costs (e.g. LLM API calls); enforcing plan limits.
- Keeping counts **consistent across many servers** — an in-memory limiter per server lets users multiply their limit by the number of servers.
- Doing it **atomically and fast**, and choosing behaviour when Redis is unavailable.`,
      analogy: `A token bucket is like a ticket machine at a ride that prints one ticket every second and holds at most 10. If you arrive after a quiet period you can take several tickets at once (a burst), but on average nobody can ride more than once per second.`,
      code: [
        {
          title: 'Atomic token bucket in Redis (Lua) + Express middleware',
          lang: 'javascript',
          code: `import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

// Runs atomically inside Redis: refill tokens based on elapsed time, then try to take one.
const TOKEN_BUCKET = \`
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillPerSec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1]) or capacity
local ts = tonumber(data[2]) or now
tokens = math.min(capacity, tokens + math.max(0, now - ts) / 1000 * refillPerSec)
local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end
redis.call('HSET', key, 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', key, math.ceil(capacity / refillPerSec * 1000))
return { allowed, tostring(tokens) }
\`;

export function rateLimit({ capacity = 10, refillPerSec = 1 } = {}) {
  return async (req, res, next) => {
    const id = req.user?.id ?? req.ip;                  // per user, else per IP
    try {
      const [allowed, left] = await redis.eval(TOKEN_BUCKET, {
        keys: [\`rl:\${id}\`],
        arguments: [String(capacity), String(refillPerSec), String(Date.now())],
      });
      res.set('X-RateLimit-Remaining', String(Math.floor(Number(left))));
      if (allowed === 1) return next();
      res.set('Retry-After', String(Math.ceil(1 / refillPerSec)));
      return res.status(429).json({ error: 'Too many requests' });
    } catch (err) {
      console.error('rate limiter unavailable, failing open', err.message);
      return next();                                    // fail open: availability first
    }
  };
}

// app.use('/api', rateLimit({ capacity: 20, refillPerSec: 5 }));`,
        },
        {
          title: 'Architecture diagram',
          lang: 'text',
          code: `  Clients
     |
     v
  [ API Gateway / LB ]  <-- coarse per-IP limits (WAF, gateway throttling)
     |
     v
  [ API server 1 ] [ API server 2 ] [ API server N ]
       |  rate-limit middleware (1 Lua call per request)
       v
  [ Redis (primary + replica), keys: rl:<userId> ]
       |
   allowed? --yes--> handler --> services / DB
       |
       no --> 429 Too Many Requests + Retry-After

  Limits config (per plan / endpoint) cached in memory, loaded from DB`,
        },
      ],
      output: `**Request flow:** request → gateway (coarse IP limits) → API server → middleware runs one Lua script in Redis. The script refills tokens by elapsed time, takes one if available, saves state and sets an expiry so idle keys disappear. Allowed → continue; not allowed → 429 with \`Retry-After\`.

With \`capacity: 10, refillPerSec: 1\`, a quiet user can burst 10 requests instantly, then gets about 1 request per second.

**Scaling and trade-offs:**
- One Redis call per request; Redis handles very high throughput, and you can shard keys with Redis Cluster.
- Lua makes check-and-update atomic, so parallel requests across servers can't both take the last token.
- Clock: this uses the app server's clock; big clock differences between servers skew refill. Alternative: use Redis \`TIME\` inside the script.
- **Fail open vs closed:** for general APIs, fail open (availability); for login/OTP endpoints, consider failing closed or a stricter local fallback.
- Layer limits: per-IP at the edge (DDoS/bots), per-user/API-key in the app, per-tenant quotas for billing.`,
      questions: [
        {
          q: 'Which rate-limiting algorithm would you choose and why?',
          a: 'Token bucket for most APIs: it allows small bursts but enforces an average rate, and needs only two numbers per key. Sliding window if I need precise counts per window.',
        },
        {
          q: 'Why not store counts in each server\'s memory?',
          a: 'With N servers behind a load balancer, each one counts separately, so a user effectively gets N times the limit. A shared store like Redis gives one consistent count.',
        },
        {
          q: 'How do you avoid race conditions?',
          a: 'Do the read-modify-write atomically inside Redis with a Lua script, or use atomic commands like INCR with EXPIRE for a fixed window.',
        },
        {
          q: 'What do you return when a client is limited?',
          a: 'HTTP 429 with a Retry-After header, and ideally rate-limit headers showing the limit and remaining requests so well-behaved clients can back off.',
        },
        {
          q: 'What if Redis is down?',
          a: 'Choose per endpoint: fail open to keep the API available, or fail closed for sensitive endpoints like login. A fallback in-memory limiter per server is a middle ground.',
        },
      ],
      spoken: `"I'd build the rate limiter as middleware backed by Redis so all API servers share one view of each client's usage. I'd use a token bucket: each key stores tokens and a last-refill time, and a Lua script atomically refills based on elapsed time and takes a token, so there are no races between servers. Allowed requests continue; others get a 429 with Retry-After. Limits come from config per plan and endpoint. I'd also have coarse IP limits at the gateway, and decide fail-open versus fail-closed per endpoint if Redis is unavailable."`,
      mistakes: [
        'Doing GET then SET from Node in two steps — two parallel requests both pass the check.',
        'Rate limiting only by IP, which punishes many users behind one office NAT and is easy to bypass with many IPs.',
        'Fixed window without understanding the boundary burst problem.',
        'Forgetting to expire keys, so Redis fills with idle clients.',
        'Follow-up trap: "How would you rate limit across multiple regions?" Either accept separate per-region limits (simple, slightly looser), or sync counts asynchronously; a single global Redis adds cross-region latency to every request.',
      ],
      takeaway: 'Shared Redis state + an atomic algorithm (token bucket via Lua) + 429 with Retry-After + a clear fail-open/closed decision.',
    },
    {
      id: 'design-chat-app',
      title: 'System Design: Chat Application',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Design WhatsApp/Slack-style messaging: real-time delivery over WebSockets across many servers, message storage, history, presence and offline delivery.',
      what: `**Functional requirements**
- 1:1 and group chats; send and receive messages in real time.
- Message history with pagination; delivered/read receipts.
- Online/offline presence and "typing..." indicators.
- Offline users get messages when they reconnect (and a push notification).

**Non-functional requirements**
- Low latency delivery (under ~200 ms when both are online).
- Messages never lost; ordered within a conversation.
- Millions of concurrent connections; highly available.

**Rough estimates**
- 10M daily users, 5M online at peak. If one server holds ~50k WebSocket connections → ~100 chat servers.
- 10M users x 40 messages/day = 400M messages/day ≈ 4,600/sec average, ~15k/sec peak.
- 400M x 200 bytes ≈ 80 GB/day of messages → write-heavy storage with time-ordered reads.

#### Deeper version
- **Connections:** WebSockets (two-way, persistent). Alternatives: long polling (fallback) or SSE (server-to-client only).
- **Routing between servers:** user A is on server 3, user B on server 7. Server 3 must forward the message: publish via **Redis pub/sub**, Redis Streams, or Kafka, or look up B's server in a **connection registry** (\`userId → serverId\` in Redis) and send directly.
- **Storage:** messages partitioned by \`conversationId\`, sorted by time/sequence. Cassandra/ScyllaDB or DynamoDB fit write-heavy, time-ordered data well; MongoDB with an index on \`{ conversationId, createdAt }\` works at moderate scale.
- **Ordering:** assign a per-conversation increasing sequence number (or a time-sortable ID like a Snowflake ID/ULID). Clients sort by it.
- **Delivery guarantees:** save the message first, then ack to the sender ("sent ✓"), then deliver. Client-generated message IDs make retries idempotent.
- **Offline:** if the receiver isn't connected, store it and send a push notification (FCM/APNs); on reconnect the client syncs "messages since my last seen sequence".
- **Large groups:** fan-out on write gets expensive for huge channels; consider fan-out on read for big rooms.`,
      why: `Key challenges:
- Keeping **millions of long-lived connections** and routing a message to whichever server holds the receiver's socket.
- **Never losing messages** and keeping them **in order**, even with reconnects and retries.
- Presence at scale (lots of tiny updates), offline delivery, and very high write volume.`,
      analogy: `Chat servers are like telephone exchanges. Each exchange (server) has many phones (sockets) connected. When you call someone connected to a different exchange, your exchange passes the call over a trunk line (Redis pub/sub) to theirs. If they're not home, the message goes to their answering machine (database + push notification).`,
      code: [
        {
          title: 'WebSocket fan-out across servers with Redis pub/sub',
          lang: 'javascript',
          code: `import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import { randomUUID } from 'node:crypto';

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();                 // subscriber needs its own connection
await Promise.all([pub.connect(), sub.connect()]);

const local = new Map();                     // userId -> Set of sockets ON THIS SERVER
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async (ws, req) => {
  const userId = authenticate(req);          // e.g. verify a token from the query string
  if (!local.has(userId)) {
    local.set(userId, new Set());
    // Listen for messages addressed to this user from ANY server
    await sub.subscribe(\`user:\${userId}\`, (raw) => {
      for (const sock of local.get(userId) ?? []) sock.send(raw);
    });
  }
  local.get(userId).add(ws);

  ws.on('message', async (data) => {
    const { clientMsgId, to, text } = JSON.parse(data);
    const msg = { id: clientMsgId ?? randomUUID(), from: userId, to, text, at: Date.now() };
    await saveMessage(msg);                                    // 1. persist first
    ws.send(JSON.stringify({ type: 'ack', id: msg.id }));      // 2. ack the sender
    const receivers = await pub.publish(\`user:\${to}\`, JSON.stringify({ type: 'msg', ...msg }));
    if (receivers === 0) await sendPushNotification(to, msg);  // 3. nobody online -> push
  });

  ws.on('close', async () => {
    const set = local.get(userId);
    set?.delete(ws);
    if (set && set.size === 0) {
      local.delete(userId);
      await sub.unsubscribe(\`user:\${userId}\`);
    }
  });
});

function authenticate(req) { return new URL(req.url, 'http://x').searchParams.get('user'); } // demo only
async function saveMessage(msg) { /* insert into messages, unique on id */ }
async function sendPushNotification(userId, msg) { console.log('push to', userId); }`,
        },
        {
          title: 'Architecture diagram',
          lang: 'text',
          code: `  Mobile / Web clients
     |  WebSocket (wss://)
     v
  [ L4/L7 Load Balancer (least connections) ]
     |                |                 |
  [ Chat srv 1 ]  [ Chat srv 2 ]  ... [ Chat srv N ]   <- hold sockets, stateless otherwise
     |   ^              |   ^
     |   +---- [ Redis pub/sub or Kafka ] ----+   (route msg to server holding receiver)
     |
     +--> [ Message store: Cassandra / DynamoDB / MongoDB ]  partition key = conversationId
     +--> [ Presence: Redis, keys with TTL heartbeat ]
     +--> [ Queue ] --> [ Push workers ] --> FCM / APNs  (offline users)

  REST API (history, conversations, uploads) --> same DB; media --> S3 + CDN`,
        },
      ],
      output: `**Send flow:** A's app sends \`{ clientMsgId, to: B, text }\` over the WebSocket to server 3. Server 3 saves the message (unique on ID, so a retried send isn't duplicated), acks A ("sent ✓"), then publishes to channel \`user:B\`. Server 7, which holds B's socket, is subscribed to that channel and pushes the message to B. If \`publish\` returns 0 subscribers, B is offline → push notification; when B reconnects, the client fetches messages after its last seen ID over REST.

**Scaling and trade-offs:**
- Chat servers scale horizontally; the LB uses least connections. Plan for reconnect storms after a deploy (clients reconnect with jitter).
- Redis pub/sub is fire-and-forget (no persistence) — fine because the DB is the source of truth; clients re-sync gaps. For stronger delivery, use Redis Streams or Kafka.
- Per-user channels are simple; for very large groups, publish once per room and let servers fan out to local members.
- Presence: heartbeat every ~30s sets a key with TTL; only broadcast presence to contacts, and batch updates.
- Ordering: per-conversation sequence numbers; clients sort and detect gaps.
- Media goes to S3 via presigned upload and is served via CDN; only the URL travels in the message.`,
      questions: [
        {
          q: 'WebSockets vs long polling vs SSE for chat?',
          a: 'WebSockets give full two-way, low-latency communication, so they are the default for chat. SSE is server-to-client only. Long polling is a fallback when WebSockets are blocked.',
        },
        {
          q: 'How does a message reach a user connected to a different server?',
          a: 'Through a shared broker: the sender\'s server publishes to a channel for that user or room, and the server holding the receiver\'s socket is subscribed. Or use a registry of userId → server and forward directly.',
        },
        {
          q: 'How do you make sure messages are not lost or duplicated?',
          a: 'Persist before acking, use client-generated message IDs with a unique constraint for idempotent retries, and let clients sync from their last received sequence number after reconnecting.',
        },
        {
          q: 'Which database would you use for messages?',
          a: 'Something optimised for high write volume and time-ordered reads per conversation, like Cassandra or DynamoDB with conversationId as partition key. MongoDB with a compound index works well at moderate scale.',
        },
        {
          q: 'How do you implement online presence?',
          a: 'Clients send heartbeats; the server sets a Redis key with a short TTL. If heartbeats stop, the key expires and the user is offline. Presence updates are sent only to interested contacts and throttled.',
        },
      ],
      spoken: `"Clients keep a WebSocket to one of many stateless chat servers behind a load balancer. When a user sends a message, the server saves it first, with a client-generated ID so retries aren't duplicated, acks the sender, and then publishes it to a Redis channel for the receiver. Whichever server holds the receiver's socket is subscribed and delivers it. If nobody is subscribed, we send a push notification, and the client syncs missed messages on reconnect. Messages are stored partitioned by conversation and ordered by sequence, presence uses Redis keys with TTL heartbeats, and media goes through S3 and a CDN."`,
      mistakes: [
        'Keeping the receiver lookup in one server\'s memory, so messages to users on other servers are lost.',
        'Acknowledging a message before it is saved.',
        'Relying on Redis pub/sub as durable storage — it drops messages if no one is listening.',
        'Broadcasting every presence change to every user, creating huge fan-out.',
        'Follow-up trap: "How do you deploy chat servers without dropping everyone?" Drain gradually: stop new connections, tell clients to reconnect with random delay, and let the LB move them to other servers.',
      ],
      takeaway: 'WebSockets for delivery, a broker to route between servers, the database as the source of truth, and idempotent message IDs with resync on reconnect.',
    },
    {
      id: 'design-notification-system',
      title: 'System Design: Notification System',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Send email, SMS, push and in-app notifications reliably: accept events, apply user preferences and templates, queue per channel, retry, dedupe and track delivery.',
      what: `**Functional requirements**
- Other services trigger notifications ("interview scheduled", "payment failed").
- Channels: email, SMS, mobile push, in-app (bell icon), maybe WhatsApp.
- Respect **user preferences** (opt-outs per channel/type) and quiet hours.
- Templates with variables and multiple languages.
- Scheduled notifications (reminder 1 hour before) and bulk campaigns.
- Delivery status tracking (sent, delivered, failed, opened).

**Non-functional requirements**
- Reliable: no lost notifications, no duplicates (no "you were charged" email twice).
- Scalable to spikes (a campaign to 1M users); soft real-time (seconds are fine, OTPs faster).
- Respect provider rate limits (SES, Twilio, FCM); one provider's outage must not block the others.

**Rough estimates**
- 5M notifications/day ≈ 60/sec average; a campaign can push 1M in an hour ≈ 280/sec for that hour.

#### Deeper version
- **Separate queues per channel** (and priority): an SMS provider slowdown shouldn't delay emails; OTPs go in a high-priority queue ahead of marketing.
- **Idempotency:** each notification gets a key like \`interview-reminder:<interviewId>:<userId>\`; store it with a unique index so retries and duplicate events don't send twice.
- **Retries** with exponential backoff for temporary provider errors; **dead-letter** after N attempts; **fallback provider** (e.g. switch SMS vendor) for outages.
- **Provider webhooks** (delivered, bounced, complained) update status; hard bounces suppress future emails to that address.
- **Fan-out:** a campaign event is expanded into per-user jobs in batches by a fan-out worker, not in the API request.
- **In-app:** store in a \`notifications\` collection (unread count) and push live via WebSocket/SSE.
- **Scheduling:** delayed jobs (BullMQ) for reminders; cancel the job if the interview is rescheduled.`,
      why: `Key challenges:
- **Reliability without duplicates** across retries, crashes and duplicate upstream events.
- **Isolation between channels** and handling third-party rate limits and outages.
- **Preferences, quiet hours, localisation** and legal requirements (unsubscribe links, opt-in for SMS/WhatsApp).
- Absorbing **bursty** traffic (campaigns, incidents) without slowing the core product.`,
      analogy: `It's a post office. Departments drop letters into the intake box (events). Sorters check the address book (preferences), put each letter in the right envelope (template), and place it in the right outgoing bin: air mail, courier, local delivery (channel queues). Each courier works at their own speed, retries failed deliveries, and records a receipt.`,
      code: [
        {
          title: 'Channel worker: preferences, dedupe, send, retry (BullMQ)',
          lang: 'javascript',
          code: `import { Worker, UnrecoverableError } from 'bullmq';

const connection = { host: process.env.REDIS_HOST ?? '127.0.0.1', port: 6379 };

// Job data: { notificationId, userId, type, channel, vars }
export function startEmailWorker({ db, emailProvider, templates }) {
  return new Worker('notify-email', async (job) => {
    const { notificationId, userId, type, vars } = job.data;

    // 1. Idempotency: already sent? (unique index on notificationId)
    const existing = await db.collection('deliveries').findOne({ _id: notificationId });
    if (existing?.status === 'sent') return 'duplicate-skipped';

    // 2. Preferences + suppression list
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user?.email || user.prefs?.email?.[type] === false) return 'opted-out';
    if (user.emailBounced) throw new UnrecoverableError('Hard bounced address'); // no retries

    // 3. Render template
    const { subject, html } = templates.render(type, user.locale ?? 'en', vars);

    // 4. Send (throws on temporary errors -> BullMQ retries with backoff)
    const providerId = await emailProvider.send({ to: user.email, subject, html });

    // 5. Record delivery status
    await db.collection('deliveries').updateOne(
      { _id: notificationId },
      { $set: { status: 'sent', channel: 'email', providerId, sentAt: new Date() } },
      { upsert: true },
    );
    return 'sent';
  }, {
    connection,
    concurrency: 20,
    limiter: { max: 50, duration: 1000 },   // respect provider limit: 50 emails/sec
  });
}

// Producer side (notification service):
// await emailQueue.add('send', data, {
//   jobId: data.notificationId,                     // dedupe at enqueue time
//   attempts: 5, backoff: { type: 'exponential', delay: 2000 },
// });`,
        },
        {
          title: 'Architecture diagram',
          lang: 'text',
          code: `  [ Services: Orders, Interviews, Billing ... ]
          |  event / POST /notify  { type, userIds, vars, idempotencyKey }
          v
  [ Notification API ] -- validate, persist request --> [ DB: notifications ]
          |
          v
  [ Fan-out + Routing workers ]
      - expand user lists in batches
      - load preferences, quiet hours, locale
      - pick channels, build notificationId
          |
    +-----+-----------+-------------+------------------+
    v                 v             v                  v
 [email queue]   [sms queue]   [push queue]      [in-app queue]
    |                 |             |                  |
 [email workers]  [sms workers]  [push workers]   [in-app workers] -> DB + WebSocket
    |                 |             |
  SES/SendGrid     Twilio        FCM/APNs
    |                 |             |
    +---- provider webhooks (delivered / bounced) ----> [ status updater ] -> DB
  Failed after N retries --> [ DLQ ] --> alerts + manual replay`,
        },
      ],
      output: `**Flow:** Interviews service calls \`POST /notify { type: 'interview_reminder', userIds: [...], vars }\` with an idempotency key. The Notification API stores the request and returns 202 immediately. Fan-out workers expand it per user, check preferences, quiet hours and locale, and enqueue one job per user per channel with a deterministic \`notificationId\` as the \`jobId\`. Channel workers render templates, send through the provider within its rate limit, and record status. Temporary failures retry with exponential backoff; hard failures (bounced address) don't retry; jobs failing every attempt go to a DLQ and alert.

**Scaling and trade-offs:**
- Separate queues per channel and priority isolate failures and let OTPs skip ahead of marketing.
- Workers scale horizontally; the limiter protects provider quotas.
- At-least-once processing + idempotency key = effectively once for users.
- A small gap remains: provider accepted the send but the worker crashed before saving status → a retry can send again. Pass the notificationId as the provider's idempotency key where supported.
- Reminders are delayed jobs; rescheduling removes the old job by its ID.
- In-app notifications live in the DB (source of truth) and are pushed live when the user is online.`,
      questions: [
        {
          q: 'How do you avoid sending the same notification twice?',
          a: 'Generate a deterministic notification ID from the event and recipient, use it as the job ID and as a unique key in the deliveries table, and check it before sending. Upstream services send idempotency keys too.',
        },
        {
          q: 'Why separate queues per channel?',
          a: 'Isolation: if the SMS provider is slow or down, emails and push keep flowing. Each queue can have its own concurrency, rate limit and retry policy.',
        },
        {
          q: 'How do you send a campaign to a million users?',
          a: 'Accept it as one request, then a fan-out worker pages through the audience in batches and enqueues per-user jobs, with rate limits per provider so we don\'t get throttled or flagged as spam.',
        },
        {
          q: 'How do you handle provider outages?',
          a: 'Retries with backoff for temporary errors, a circuit breaker on the provider, and a fallback provider for critical channels like OTP SMS. Failed jobs go to a DLQ for replay.',
        },
        {
          q: 'How do you track delivery and opens?',
          a: 'Store a delivery record per notification, update it from provider webhooks (delivered, bounced, complained) and tracking pixels or link redirects for opens and clicks.',
        },
      ],
      spoken: `"Services send a notify request with a type, recipients, variables and an idempotency key. The notification service stores it and returns quickly. Fan-out workers expand recipients in batches, apply preferences, quiet hours and locale, and enqueue one job per user per channel into separate queues for email, SMS, push and in-app. Channel workers render templates and call providers within their rate limits, retrying temporary errors with backoff and sending permanent failures to a dead-letter queue. A deterministic notification ID prevents duplicates, and provider webhooks update delivery status."`,
      mistakes: [
        'Sending notifications synchronously inside the user\'s API request.',
        'One shared queue for all channels, so an SMS outage blocks password-reset emails.',
        'No deduplication, so retries or duplicate events send the same email twice.',
        'Ignoring bounces and unsubscribes, which harms email reputation and breaks the law in many places.',
        'Follow-up trap: "How do you handle time zones for a 9 AM digest?" Store each user\'s time zone and schedule per time-zone bucket (or per user), not one global 9 AM UTC job.',
      ],
      takeaway: 'Accept fast, fan out in workers, one queue per channel, preferences before sending, deterministic IDs for dedupe, retries + DLQ for failures.',
    },
    {
      id: 'design-video-interview-platform',
      title: 'System Design: Video Interview Platform',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Design a platform to schedule and run live video interviews with a shared code editor, recording, transcription and AI feedback.',
      what: `**Functional requirements**
- Recruiters schedule interviews; candidates and interviewers get invites and reminders (email/SMS/calendar).
- Join a secure video room at the scheduled time (browser, no install), with screen sharing and chat.
- Shared live code editor / whiteboard.
- Record the session; generate a transcript and an AI summary/scorecard afterwards.
- Interviewers submit feedback; recruiters see results.

**Non-functional requirements**
- Low-latency media (under ~300 ms end-to-end feels natural), works on weak networks and behind firewalls.
- Secure: only invited people can join, recordings private, candidate data protected.
- Scheduling and room joins must be highly available; post-processing can be async.

**Rough estimates**
- 10k interviews/day, peak 1,000 concurrent rooms x 2-4 participants.
- Recording: ~1 hour at ~1 Mbps ≈ 450 MB per interview → ~4.5 TB/day before compression/retention rules.

#### Deeper version
- **Media with WebRTC:** browsers send audio/video peer-to-peer or through a server. Options:
  - **Mesh** (everyone connects to everyone): fine for 2 people, breaks down with more.
  - **SFU (Selective Forwarding Unit):** each client uploads once, the server forwards streams to others. The standard for group calls (Jitsi Videobridge, LiveKit, mediasoup, Twilio/Agora/Daily as managed services).
  - **MCU:** server mixes streams into one — heavy CPU, rarely used now.
- **Signalling:** WebRTC needs a separate channel (usually WebSocket) to exchange offers/answers and ICE candidates.
- **STUN/TURN:** STUN helps clients discover their public address; **TURN** relays media when direct connection fails (corporate firewalls). TURN costs bandwidth, but is essential.
- **Build vs buy:** running SFUs and TURN globally is hard; most companies use a managed provider or self-host Jitsi/LiveKit. The real product value is scheduling, security, editor, recording and AI on top.
- **Shared editor:** CRDTs (e.g. Yjs) or Operational Transform over WebSockets for conflict-free collaborative editing.
- **Post-processing pipeline:** recording uploaded to object storage → queue → transcription (speech-to-text) → LLM summary → store results → notify recruiter.`,
      why: `Key challenges:
- **Real-time media quality** across different networks and devices — this is why you use WebRTC with SFUs and TURN, not your normal REST stack.
- **Security and privacy:** time-boxed, role-based room access; private recordings; data retention and consent rules.
- **Reliability at the scheduled time:** an interview can't be "retried later" — joins must work first time.
- **Heavy async processing** (recording, transcription, AI) that must not affect live calls.`,
      analogy: `The video part is like a conference call operator (the SFU): each person speaks into one microphone, and the operator forwards their voice to everyone else, instead of everyone dialling everyone. The rest of the platform is the reception desk: it checks your invitation, shows you to the right room at the right time, records the meeting, and later writes the minutes.`,
      code: [
        {
          title: 'Issue a short-lived, role-based room join token',
          lang: 'javascript',
          code: `import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const FIVE_MIN = 5 * 60 * 1000;

// GET /interviews/:id/join -> token the media server (SFU) will verify
app.get('/interviews/:id/join', requireAuth, async (req, res) => {
  const interview = await db.collection('interviews').findOne({ _id: req.params.id });
  if (!interview) return res.status(404).json({ error: 'Not found' });

  // 1. Is this user invited, and with which role?
  const participant = interview.participants.find((p) => p.userId === req.user.id);
  if (!participant) return res.status(403).json({ error: 'Not invited' });

  // 2. Only allow joining shortly before the start until the scheduled end
  const now = Date.now();
  const start = interview.startsAt.getTime();
  const end = start + interview.durationMin * 60 * 1000;
  if (now < start - FIVE_MIN || now > end) {
    return res.status(403).json({ error: 'Room is not open right now' });
  }

  // 3. Short-lived token scoped to ONE room and ONE role.
  //    (Real claim names depend on your provider: Jitsi, LiveKit, Twilio... check its docs.)
  const token = jwt.sign(
    {
      room: \`interview-\${interview._id}\`,
      role: participant.role,                         // 'interviewer' | 'candidate'
      canRecord: participant.role === 'interviewer',
      name: participant.displayName,
    },
    process.env.MEDIA_JWT_SECRET,
    { subject: req.user.id, expiresIn: '10m', audience: 'media-server' },
  );

  res.json({ token, mediaUrl: process.env.MEDIA_SERVER_URL });
});

function requireAuth(req, res, next) { /* verify session / JWT, set req.user */ next(); }`,
        },
        {
          title: 'Architecture diagram',
          lang: 'text',
          code: `  Recruiter / Interviewer / Candidate (browser)
     |                     |                         |
     | HTTPS (REST)        | WebSocket               | WebRTC media (UDP, TURN fallback)
     v                     v                         v
  [ API (Next.js / Node) ] [ Signalling + Editor ]   [ SFU cluster (Jitsi / LiveKit / managed) ]
     |   scheduling, auth,   (Yjs CRDT sync,           |        ^
     |   join tokens          presence)                |        | [ STUN / TURN servers ]
     v                                                 v
  [ DB: interviews, participants, feedback ]     [ Recorder ] --> [ S3: recordings (private) ]
     |                                                                  |
     +--> [ Queue: reminders ] --> Notification service                 v
                                                         [ Queue: post-processing ]
                                                                  |
                                    [ Transcribe worker ] --> [ LLM summary worker ]
                                                                  |
                                                     [ DB: transcript, AI scorecard ] --> notify recruiter`,
        },
      ],
      output: `**Flow:**
1. Recruiter schedules an interview → saved in DB → delayed reminder jobs created (24h and 15 min before).
2. At interview time, each participant calls \`/join\`. The API checks invitation, role and time window, and returns a 10-minute token for that one room.
3. The browser connects to signalling and the SFU with the token; the SFU verifies it and forwards media. TURN relays media for users behind strict firewalls.
4. The code editor syncs through a CRDT over WebSockets, so both people can type without conflicts.
5. After the call, the recording lands in a private S3 bucket → a queue triggers transcription → an LLM generates a summary and scorecard → recruiter is notified.

**Scaling and trade-offs:**
- Buy vs build media: managed providers cost per minute but save huge ops effort; self-hosted Jitsi/LiveKit is cheaper at scale but needs media/networking expertise.
- SFUs are placed in several regions; route each room to the region closest to most participants.
- Live calls and post-processing are fully separated; a slow transcription backlog never affects calls.
- Security: short-lived tokens, private buckets with signed URLs for playback, encryption, retention policies, and consent before recording and AI analysis.`,
      questions: [
        {
          q: 'Mesh vs SFU vs MCU?',
          a: 'Mesh: each peer sends to every other peer — fine for 2, bad beyond 3-4. SFU: each sends once to a server that forwards streams — the standard choice. MCU: the server mixes everything into one stream — CPU-heavy, used for legacy devices or recordings.',
        },
        {
          q: 'Why do you need TURN servers?',
          a: 'Many corporate or mobile networks block direct peer connections. TURN relays the media through a public server so the call still works. Without it, a noticeable share of users would fail to connect.',
        },
        {
          q: 'How do you secure who can join a room?',
          a: 'The backend checks the invitation, role and time window, then issues a short-lived signed token scoped to that room and role. The media server only accepts valid tokens.',
        },
        {
          q: 'How would you build the shared code editor?',
          a: 'Use a CRDT library like Yjs synced over WebSockets (or Operational Transform). CRDTs merge concurrent edits without conflicts, and the document can be saved for later review.',
        },
        {
          q: 'How do recording, transcription and AI feedback fit in?',
          a: 'As an async pipeline: recording uploaded to object storage, a queue triggers transcription, then an LLM summary job, results saved, recruiter notified. Retries and idempotent jobs make it robust.',
        },
      ],
      spoken: `"I'd split it into the real-time part and everything else. Media uses WebRTC through an SFU, either managed or self-hosted like Jitsi or LiveKit, with STUN and TURN so calls work behind firewalls. Our backend handles scheduling, invitations and reminders, and when a user joins, it checks they're invited and within the time window, then issues a short-lived, room-scoped token the SFU verifies. A CRDT-based editor syncs over WebSockets. Recordings go to private S3, and a queue-driven pipeline does transcription and an LLM summary, completely separate from live calls."`,
      mistakes: [
        'Designing peer-to-peer mesh for group calls — upload bandwidth explodes with more participants.',
        'Forgetting TURN, so calls fail for users on strict corporate networks.',
        'Using long-lived or reusable meeting links with no authentication.',
        'Running transcription or AI analysis on the same servers as live media.',
        'Follow-up trap: "What about consent and data retention?" Show a clear recording/AI notice, store consent, restrict access to recordings, and auto-delete after a retention period to meet privacy laws like GDPR.',
      ],
      takeaway: 'Use WebRTC + SFU + TURN for media (often bought, not built), secure joins with short-lived room tokens, and push recording/AI into an async pipeline.',
    },
    {
      id: 'design-saas-subscriptions',
      title: 'System Design: SaaS Subscription & Billing System',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Design plans, trials, upgrades and payments with Stripe: checkout, webhook-driven subscription state, entitlements, dunning and usage limits.',
      what: `**Functional requirements**
- Plans (Free, Pro, Enterprise), monthly/yearly prices, free trials.
- Subscribe via checkout, upgrade/downgrade (with proration), cancel at period end.
- **Entitlements:** what each plan allows (features, seats, usage limits like "100 AI credits/month").
- Handle failed payments (retries, grace period, emails), invoices, tax.
- Optional: usage-based billing, coupons, multiple currencies.

**Non-functional requirements**
- Correctness above all: never give paid access without payment, never block paying customers.
- Reliable webhook handling (idempotent, order-independent), auditability.
- Entitlement checks must be fast (on every request) — cache them.
- Security: no raw card data on our servers (PCI scope minimised by using Stripe-hosted pages/elements).

**Rough estimates**
- 50k tenants; a few thousand subscription events per day — low volume, high importance.
- Entitlement checks on every API call → thousands per second → read from cache/DB, never call Stripe on the request path.

#### Deeper version
- **Source of truth:** Stripe is the source of truth for payment state; your DB stores a **synced copy** (subscription status, price, period end) updated from **webhooks**, plus your own entitlements.
- **Key webhooks:** \`checkout.session.completed\`, \`customer.subscription.created/updated/deleted\`, \`invoice.paid\`, \`invoice.payment_failed\`.
- **Webhooks can arrive late, twice, or out of order** → verify signature, dedupe by event ID, and either compare timestamps or re-fetch the latest subscription from Stripe before updating.
- **Status handling:** \`trialing\`/\`active\` → access; \`past_due\` → grace period (keep access, show banner, emails — Stripe Smart Retries handle retries); \`canceled\`/\`unpaid\` → downgrade to Free.
- **Entitlements table:** map Stripe price IDs to plans and plans to features/limits in **your** config, not scattered \`if (plan === 'pro')\` checks.
- **Usage limits:** count usage in Redis/DB per billing period; for metered billing, report usage to Stripe.
- **Never trust the client redirect** after checkout ("success page") to grant access — wait for the webhook (or verify the session server-side).
- Exact Stripe object fields can change between API versions (for example, where the current period end lives). Pin your API version and check the docs.`,
      why: `Key challenges:
- Keeping **your access control in sync** with the payment provider's state using asynchronous, unordered, duplicated webhooks.
- **Correct entitlements** in every part of the product (features, seats, quotas) with fast checks.
- Edge cases: trials ending, failed renewals, mid-cycle upgrades, cancellations, refunds, disputes, and multi-tenant (the subscription belongs to an organisation, not a user).`,
      analogy: `It's a gym membership. The bank (Stripe) handles the money and tells the gym office (webhooks) when a payment works or fails. The office updates the member's card (entitlements). The door scanner (your API) only checks the card — it never calls the bank. If a payment fails, the member gets a grace period and reminder letters before the card stops working.`,
      code: [
        {
          title: 'Stripe webhook -> subscription sync -> entitlement update',
          lang: 'javascript',
          code: `import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// Our own mapping: Stripe price -> plan -> entitlements
const PLANS = {
  [process.env.PRICE_PRO_MONTHLY]: { plan: 'pro', seats: 10, aiCredits: 1000, features: ['sso', 'export'] },
  [process.env.PRICE_TEAM_MONTHLY]: { plan: 'team', seats: 50, aiCredits: 5000, features: ['sso', 'export', 'audit'] },
};
const FREE = { plan: 'free', seats: 1, aiCredits: 50, features: [] };
const ACCESS_STATUSES = ['trialing', 'active', 'past_due']; // past_due = grace period

// Raw body is required for signature verification
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(\`Invalid signature: \${err.message}\`);
  }

  // Idempotency: skip events we already processed (unique index on _id)
  const seen = await db.collection('stripeEvents').findOne({ _id: event.id });
  if (seen) return res.json({ received: true, duplicate: true });

  if (event.type.startsWith('customer.subscription.')) {
    // Out-of-order safe: re-fetch the LATEST state instead of trusting this event's snapshot
    const sub = await stripe.subscriptions.retrieve(event.data.object.id);
    const tenantId = sub.metadata.tenantId;      // set when creating the checkout session
    const priceId = sub.items.data[0]?.price.id;
    const hasAccess = ACCESS_STATUSES.includes(sub.status);
    const ent = hasAccess ? (PLANS[priceId] ?? FREE) : FREE;

    await db.collection('tenants').updateOne(
      { _id: tenantId },
      { $set: {
        'billing.stripeSubscriptionId': sub.id,
        'billing.status': sub.status,
        'billing.priceId': priceId,
        entitlements: ent,
        updatedAt: new Date(),
      } },
    );
    await redis.del(\`ent:\${tenantId}\`);         // invalidate cached entitlements
  }

  if (event.type === 'invoice.payment_failed') {
    await notifyQueue.add('payment-failed', { invoiceId: event.data.object.id }, { jobId: event.id });
  }

  await db.collection('stripeEvents').insertOne({ _id: event.id, type: event.type, at: new Date() });
  res.json({ received: true });
});`,
        },
        {
          title: 'Fast entitlement check middleware',
          lang: 'javascript',
          code: `export function requireFeature(feature) {
  return async (req, res, next) => {
    const tenantId = req.user.tenantId;
    let ent = JSON.parse((await redis.get(\`ent:\${tenantId}\`)) ?? 'null');
    if (!ent) {
      const tenant = await db.collection('tenants').findOne({ _id: tenantId }, { projection: { entitlements: 1 } });
      ent = tenant?.entitlements ?? { plan: 'free', features: [] };
      await redis.set(\`ent:\${tenantId}\`, JSON.stringify(ent), { EX: 300 });
    }
    if (!ent.features.includes(feature)) {
      return res.status(402).json({ error: \`Upgrade required for \${feature}\`, plan: ent.plan });
    }
    next();
  };
}

// app.get('/reports/export', requireFeature('export'), exportHandler);`,
        },
        {
          title: 'Architecture diagram',
          lang: 'text',
          code: `  Browser (pricing page)
     | 1. POST /billing/checkout {priceId}
     v
  [ Billing API ] --2. create Checkout Session (metadata: tenantId)--> [ Stripe ]
     |                                                                  |
     | 3. redirect URL                         4. customer pays on Stripe-hosted page
     v                                                                  |
  Browser --> Stripe Checkout --> success page ("activating...")        |
                                                                        | 5. webhooks
                                                                        v
                                         [ Webhook endpoint ] verify signature, dedupe event.id
                                                   |
                                     re-fetch subscription, map price -> plan
                                                   |
                         [ DB: tenants.billing + entitlements ] -- invalidate --> [ Redis cache ]
                                                   |
                         [ Queue ] --> emails (receipt, payment failed, trial ending)

  Every API request --> entitlement middleware --> Redis/DB (never calls Stripe)`,
        },
      ],
      output: `**Flow:**
1. The user picks a plan; the backend creates a Stripe Checkout Session with \`tenantId\` in metadata (so the webhook knows which tenant it belongs to) and redirects the user to Stripe's hosted page. Card data never touches our servers.
2. After payment, the success page shows "activating..." — it does **not** grant access.
3. Stripe sends \`customer.subscription.created\` (and others). The webhook verifies the signature with the raw body, skips duplicates, re-fetches the latest subscription so out-of-order events can't overwrite newer state, maps price → plan → entitlements, saves them, and clears the cache.
4. Every API request checks entitlements from Redis (falling back to the DB) — fast, and it works even if Stripe is slow.
5. Renewal fails → \`invoice.payment_failed\` → status \`past_due\` → access kept during the grace period, emails sent; Stripe retries the card. If retries fail, the subscription is canceled/unpaid → the next webhook downgrades the tenant to Free.

**Trade-offs:**
- Webhook-driven sync is eventually consistent (a few seconds); the success page can poll our API until active.
- Re-fetching from Stripe costs an API call per event but removes ordering bugs.
- If the webhook handler fails, Stripe retries for days; a nightly reconciliation job comparing Stripe and DB catches anything missed.
- Note: the record-after-processing dedupe here can process an event twice if the handler crashes just before recording, so the updates themselves are idempotent \`$set\`s.`,
      questions: [
        {
          q: 'Why not grant access when the user lands on the checkout success page?',
          a: 'The redirect can be faked, skipped or happen before payment settles. Access should be granted from a verified webhook (or by verifying the session server-side with Stripe).',
        },
        {
          q: 'How do you handle duplicate and out-of-order webhooks?',
          a: 'Verify the signature, store processed event IDs to skip duplicates, and make updates order-safe by re-fetching the current subscription from Stripe or comparing event timestamps before writing.',
        },
        {
          q: 'What happens when a renewal payment fails?',
          a: 'The subscription becomes past_due. I keep access during a grace period, show a banner and send emails with a link to update the card, while Stripe retries. If it still fails, the subscription is canceled or unpaid and the tenant is downgraded.',
        },
        {
          q: 'How do you check plan limits quickly on every request?',
          a: 'Store entitlements in our DB, cache them in Redis per tenant, invalidate on webhook updates. The request path never calls Stripe.',
        },
        {
          q: 'Who owns the subscription in a B2B SaaS — a user or an organisation?',
          a: 'The organisation (tenant). Store the Stripe customer and subscription on the tenant, so seats and features apply to everyone in it, and billing survives a user leaving.',
        },
      ],
      spoken: `"Stripe is the source of truth for payments, and my database keeps a synced copy plus our own entitlements. Checkout happens on Stripe's hosted page with the tenant ID in metadata. I never grant access from the success redirect; a webhook does it. The webhook verifies the signature with the raw body, dedupes by event ID, re-fetches the latest subscription so out-of-order events are safe, maps the price to a plan and entitlements, saves them and invalidates the Redis cache. Requests check entitlements from cache, failed payments get a grace period with emails, and a nightly job reconciles with Stripe."`,
      mistakes: [
        'Granting or removing access based on the client-side success redirect.',
        'Parsing the webhook body as JSON before signature verification — verification needs the raw body.',
        'Not handling duplicate or out-of-order webhooks, so an old "updated" event overwrites a newer cancellation.',
        'Calling Stripe on every API request to check the plan.',
        'Follow-up trap: "What if your webhook endpoint was down for an hour?" Stripe retries failed deliveries for a period of days, and a reconciliation job that lists subscriptions from Stripe catches anything still missed.',
      ],
      takeaway: 'Stripe owns payment state; verified, idempotent, order-safe webhooks sync it into your own cached entitlements, which every request checks.',
    },
  ],
  rapidFire: [
    { q: 'What is the first step in a system design interview?', a: 'Clarify functional and non-functional requirements and agree on scope before drawing anything.' },
    { q: 'Monolith or microservices for a new startup product?', a: 'Usually a modular monolith; extract services later when there is a clear reason.' },
    { q: 'Vertical vs horizontal scaling in one line?', a: 'Vertical = bigger machine; horizontal = more machines behind a load balancer.' },
    { q: 'What makes horizontal scaling easy?', a: 'Stateless app servers, with sessions, files and data in shared stores.' },
    { q: 'L4 vs L7 load balancer?', a: 'L4 routes by IP/port; L7 understands HTTP and can route by path, headers or cookies.' },
    { q: 'Best LB algorithm for long-lived WebSocket connections?', a: 'Least connections.' },
    { q: 'What does a CDN do?', a: 'Caches content at edge servers close to users to cut latency and origin load.' },
    { q: 'How do you bust CDN cache for new JS builds?', a: 'Content-hashed file names, with HTML not cached long.' },
    { q: 'Most common caching strategy?', a: 'Cache-aside: check cache, on miss read DB and fill cache with a TTL.' },
    { q: 'On update, set or delete the cache key?', a: 'Usually delete it after writing the DB, so the next read loads fresh data.' },
    { q: 'What is a cache stampede?', a: 'Many requests hitting the DB at once when a hot key expires; fix with locks, early refresh or TTL jitter.' },
    { q: 'What does the D in SOLID mean?', a: 'Dependency inversion: depend on abstractions, not concrete implementations.' },
    { q: 'Is a Node module export a singleton?', a: 'Yes, per process — modules are cached, but each server or Lambda instance has its own.' },
    { q: 'What does the Repository pattern give you?', a: 'Business logic independent of the database, and easy fakes for tests.' },
    { q: 'SQL or NoSQL for billing and orders?', a: 'SQL, for joins and strong multi-row transactions.' },
    { q: 'Where should config and secrets live (12-factor)?', a: 'In environment variables, ideally injected from a secrets manager.' },
    { q: 'What is a cold start?', a: 'Extra latency when a serverless platform starts a new function instance.' },
    { q: 'Event vs command?', a: 'An event is a past fact with many listeners; a command asks one handler to do something.' },
    { q: 'Default delivery guarantee of most queues?', a: 'At-least-once — so consumers must be idempotent.' },
    { q: 'What is a dead-letter queue?', a: 'Where messages go after failing N times, for inspection and replay.' },
    { q: 'Kafka vs SQS in one line?', a: 'Kafka is a replayable partitioned log; SQS is a managed task queue that deletes messages after processing.' },
    { q: 'BullMQ retry config?', a: 'attempts plus backoff, e.g. { attempts: 5, backoff: { type: "exponential", delay: 1000 } }.' },
    { q: 'How to dedupe BullMQ jobs?', a: 'Use a deterministic jobId; adding a job with an existing ID is ignored.' },
    { q: 'What does idempotent mean?', a: 'Doing it twice has the same effect as doing it once.' },
    { q: 'Is POST idempotent?', a: 'Not by default; use an Idempotency-Key to make it safe to retry.' },
    { q: 'Read replicas scale what?', a: 'Reads. Writes still go to the primary.' },
    { q: 'What is replication lag?', a: 'Replicas being slightly behind the primary; fix critical reads with read-your-own-writes.' },
    { q: 'Partitioning vs sharding?', a: 'Partitioning splits a table inside one server; sharding spreads data across servers.' },
    { q: 'Good shard key properties?', a: 'High cardinality, even distribution, and present in most queries.' },
    { q: 'Why connection pooling?', a: 'Reuse a few DB connections instead of opening one per request; protects the DB connection limit.' },
    { q: 'CAP theorem in one line?', a: 'During a network partition you must choose consistency or availability.' },
    { q: 'Three multi-tenancy models?', a: 'Shared tables with tenantId, schema per tenant, database per tenant.' },
    { q: 'Where should tenantId come from?', a: 'A verified token or domain — never the request body.' },
    { q: 'API gateway vs load balancer?', a: 'A gateway routes to different services and adds auth/rate limits; an LB spreads load across copies of one service.' },
    { q: 'What is a BFF?', a: 'A backend tailored to one frontend that aggregates and shapes data for it.' },
    { q: 'REST vs gRPC for internal calls?', a: 'gRPC is faster and strongly typed via protobuf; REST is simpler and browser-friendly.' },
    { q: 'Circuit breaker states?', a: 'Closed, Open, Half-open.' },
    { q: 'Why add jitter to retries?', a: 'To spread retries out and avoid synchronized retry storms.' },
    { q: 'Three pillars of observability?', a: 'Logs, metrics and traces.' },
    { q: 'What is OpenTelemetry?', a: 'A vendor-neutral standard and SDKs for traces, metrics and logs.' },
    { q: 'SLI vs SLO vs SLA?', a: 'Measurement vs internal target vs customer contract.' },
    { q: 'Feature flag percentage rollout — how to keep it stable?', a: 'Hash userId + flag name into a 0-99 bucket.' },
    { q: 'Dependency rule in clean architecture?', a: 'Dependencies point inward; the domain knows nothing about frameworks or databases.' },
    { q: 'What is a bounded context?', a: 'A boundary where a domain model and its words have one meaning; a good service boundary.' },
    { q: 'What is an aggregate root?', a: 'The only entry point to a cluster of objects, enforcing its business rules.' },
    { q: 'CQRS in one line?', a: 'Separate models for writes (commands) and reads (queries).' },
    { q: 'Event sourcing in one line?', a: 'Store every change as an immutable event and rebuild state by replaying them.' },
    { q: 'Saga: choreography vs orchestration?', a: 'Services react to events vs a central coordinator drives the steps.' },
    { q: 'What is a compensating transaction?', a: 'A new action that semantically undoes a completed step, like a refund.' },
    { q: 'What problem does the outbox pattern solve?', a: 'The dual write of DB + broker; save the event in the same DB transaction and relay it later.' },
    { q: 'Why consistent hashing over hash % N?', a: 'Adding or removing a node moves only about 1/N of keys.' },
    { q: 'RTO vs RPO?', a: 'RTO = max downtime; RPO = max data loss measured in time.' },
    { q: 'URL shortener: how many codes with 7 base62 chars?', a: 'About 3.5 trillion (62^7).' },
    { q: 'URL shortener: 301 or 302?', a: '302 if you want click analytics; 301 is cached by browsers.' },
    { q: 'Rate limiter: which HTTP status?', a: '429 Too Many Requests with a Retry-After header.' },
    { q: 'Rate limiter: how to avoid races in Redis?', a: 'Run the check-and-update atomically in a Lua script.' },
    { q: 'Chat: how does a message reach a user on another server?', a: 'Publish via Redis pub/sub or Kafka to the server holding the receiver\'s socket.' },
    { q: 'Video calls: SFU vs mesh?', a: 'SFU forwards one upload to everyone; mesh makes each peer send to every other peer and does not scale.' },
    { q: 'Stripe: when do you grant paid access?', a: 'From a verified, idempotent webhook — not the client success redirect.' },
    { q: 'Why does Stripe webhook verification need the raw body?', a: 'The signature is computed over the exact raw bytes; parsed JSON would not match.' },
  ],
};
