// Interview problems for the API Design stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'api-design',
  problems: [
    {
      id: 'pick-status-codes',
      title: 'Pick the right status code for 8 situations',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'status-codes',
      question: `For each situation, which HTTP status code should your API return? Give one short reason for each.

1. \`POST /users\` created a new user.
2. \`DELETE /users/42\` worked. There is nothing to send back.
3. The request has no token, or the token has expired.
4. The token is valid, but this user is not an admin and tried \`DELETE /orgs/7\`.
5. \`POST /users\` with an email that already exists.
6. The JSON is fine, but \`age\` is \`-5\` (fails validation).
7. The client sent more than 100 requests in a minute.
8. \`POST /reports\` started a big report that will finish in 2 minutes.`,
      hints: [
        '2xx = success, 4xx = the client did something wrong, 5xx = the server broke.',
        '401 means "I don\'t know who you are". 403 means "I know who you are, but you are not allowed".',
        'For work that finishes later, there is a code that means "I accepted it, but it is not done yet".',
      ],
      solution: `**Idea:** pick the most specific code, so the client can react without reading the message text.

1. **201 Created** — a new resource exists. Also send a \`Location: /users/123\` header and the new user in the body.
2. **204 No Content** — success with an empty body. (200 with a small body is also fine.)
3. **401 Unauthorized** — the server doesn't know who you are. Really means "unauthenticated". The client should log in or refresh the token.
4. **403 Forbidden** — the server knows who you are, but you lack permission. Logging in again won't help.
5. **409 Conflict** — the request clashes with the current state (a unique field already exists).
6. **422 Unprocessable Content** (or **400 Bad Request**) — the body is valid JSON but breaks validation rules. Many teams use 400 for all input errors; both are accepted. Be consistent.
7. **429 Too Many Requests** — add a \`Retry-After\` header so the client knows when to try again.
8. **202 Accepted** — the work is queued. Return a job id and a URL to check progress, e.g. \`Location: /reports/jobs/abc\`.

\`\`\`javascript
// Example: 202 for long-running work
app.post('/reports', async (req, res) => {
  const job = await reportQueue.add({ userId: req.user.id, filters: req.body });
  res
    .status(202)
    .location(\`/reports/jobs/\${job.id}\`)
    .json({ jobId: job.id, status: 'queued' });
});
\`\`\`

**Why it matters:** clients (and tools like API gateways, retries and monitoring) make decisions from the code alone. For example, a client retries a 503 but never retries a 400.`,
      followUps: [
        {
          q: 'When would you return 404 instead of 403?',
          a: 'When you do not want to reveal that the resource exists. Example: `GET /orgs/7/invoices/99` from a user outside org 7 — returning 404 hides that invoice 99 exists. GitHub does this for private repos.',
        },
        {
          q: 'What is the difference between 500, 502, 503 and 504?',
          a: '500 = a bug in your server. 502 = a proxy/gateway got a bad response from the server behind it. 503 = the service is down or overloaded (often temporary, send `Retry-After`). 504 = the gateway timed out waiting for the server behind it.',
        },
        {
          q: 'Is it OK to return 200 with { "error": "..." } in the body?',
          a: 'No. Clients, caches, retry logic and monitoring all trust the status code. A 200 with an error inside hides failures from dashboards and makes client code check two places.',
        },
      ],
    },
    {
      id: 'design-job-application-endpoints',
      title: 'Design REST endpoints for job applications and interviews',
      difficulty: 'easy',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'rest-principles',
      question: `You are building a job-tracking app. A **user** has many **job applications**. Each application has many **interviews** (round, date, result).

Design the REST endpoints. For each one, give the **method**, **path**, and the **success status code**. Users must be able to:

- list their applications (filter by status, e.g. \`applied\`, \`rejected\`)
- create, read, update and delete an application
- add, list, update and delete interviews of an application
- move an application to a new status (e.g. \`offer\`)`,
      hints: [
        'Use nouns in the path (resources), and let the HTTP method be the verb.',
        'Interviews belong to an application, so nest them one level: `/applications/:id/interviews`.',
        'Changing status is just a partial update — which method changes only some fields?',
      ],
      solution: `**Idea:** resources are plural nouns. The method says what happens. Nest a child only one level deep.

\`\`\`text
# Applications (the current user is taken from the token, not the URL)
GET    /applications?status=applied&page=...   -> 200  list (paginated)
POST   /applications                           -> 201  create (+ Location header)
GET    /applications/:appId                    -> 200  read one (404 if not found)
PATCH  /applications/:appId                    -> 200  partial update, e.g. { "status": "offer" }
PUT    /applications/:appId                    -> 200  full replace (optional, PATCH is usually enough)
DELETE /applications/:appId                    -> 204  delete

# Interviews (nested, because an interview only exists inside an application)
GET    /applications/:appId/interviews         -> 200
POST   /applications/:appId/interviews         -> 201
PATCH  /applications/:appId/interviews/:intId  -> 200
DELETE /applications/:appId/interviews/:intId  -> 204
\`\`\`

Sample create request and response:

\`\`\`text
// POST /applications
{ "company": "Stripe", "role": "Senior Full Stack Engineer", "status": "applied" }

// 201 Created, Location: /applications/66f1c2
{ "id": "66f1c2", "company": "Stripe", "role": "Senior Full Stack Engineer",
  "status": "applied", "createdAt": "2026-10-07T10:00:00Z" }
\`\`\`

**Why it works:**
- No verbs in paths (\`/createApplication\` is RPC style, not REST).
- Status change uses \`PATCH\` — it is just a field update. If moving status has side effects (send emails, check allowed transitions), validate the transition in the handler and return **409** or **422** for an illegal move (e.g. \`rejected -> offer\`).
- The user id comes from the auth token, so a user can never read someone else's list by changing a URL. Still check ownership on every \`:appId\` (return 404 if it belongs to another user).
- Validation errors -> 400/422, missing application -> 404.`,
      followUps: [
        {
          q: 'Would you also add GET /interviews?upcoming=true?',
          a: 'Yes, a top-level collection is fine when the client needs interviews across all applications (e.g. a calendar view). Nesting is for ownership; a flat route is for cross-cutting queries. Both can exist.',
        },
        {
          q: 'What if status changes need history (applied -> interview -> offer)?',
          a: 'Store a `statusHistory` array or a separate `status_events` collection. You can expose it as `GET /applications/:id/events`. Some teams use an action sub-resource like `POST /applications/:id/transitions` with `{ "to": "offer" }` when the change has business rules.',
        },
      ],
    },
    {
      id: 'fix-rpc-style-api',
      title: 'Review and fix a badly designed API',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'http-methods',
      question: `A teammate wrote these endpoints. Find every problem and give the fixed version.

\`\`\`text
GET  /getAllProducts
POST /createProduct
GET  /deleteProduct?id=12
POST /products/12/update
GET  /products/12          -> returns 200 { "error": "Product not found" }
POST /products/search      body: { "category": "shoes" }
\`\`\``,
      hints: [
        'Look for verbs in the URL — REST puts the action in the HTTP method.',
        'GET must be **safe**: it must never change data. Why is a GET that deletes dangerous? (Think browser prefetch, crawlers, caches.)',
        'Check the status code of the "not found" case.',
      ],
      solution: `**Idea:** use nouns for paths, the HTTP method for the action, and real status codes.

\`\`\`text
BEFORE                                AFTER
GET  /getAllProducts               -> GET    /products
POST /createProduct                -> POST   /products              (201 + Location)
GET  /deleteProduct?id=12          -> DELETE /products/12           (204)
POST /products/12/update           -> PATCH  /products/12           (200)  or PUT for full replace
GET  /products/12 -> 200 {error}   -> GET    /products/12           (404 + error body)
POST /products/search {category}   -> GET    /products?category=shoes
\`\`\`

**What was wrong:**
- **Verbs in paths** (\`getAll\`, \`create\`, \`delete\`, \`update\`) — the method already says the action.
- **GET that deletes** — GET is supposed to be *safe* (no side effects). Browsers prefetch links, crawlers follow links, and caches/proxies may replay GETs. A link preview in Slack could delete a product!
- **POST for update** — POST is not idempotent, so clients and proxies cannot safely retry it. PATCH/PUT describe the intent.
- **200 with an error** — monitoring, caching and client code all trust the status code. Use 404.
- **POST for a simple search** — a simple filter belongs in query params with GET, so it can be cached, bookmarked and shared.

**Note:** POST for search *is* acceptable when the filter is huge or complex (long JSON, many fields) and would not fit in a URL. Elasticsearch does this.`,
      followUps: [
        {
          q: 'Which HTTP methods are idempotent?',
          a: 'GET, HEAD, OPTIONS, PUT and DELETE are idempotent (doing it twice = same result as once). POST is not. PATCH is not guaranteed — `{ "views": +1 }` style patches are not idempotent, but `{ "status": "done" }` is.',
        },
        {
          q: 'Is it OK to have an action endpoint like POST /orders/12/cancel?',
          a: 'Yes. Pure REST would be `PATCH /orders/12 { "status": "cancelled" }`, but when an action has side effects (refund, email), an explicit action sub-resource is clearer. Stripe uses this style (`/payment_intents/:id/cancel`).',
        },
      ],
    },
    {
      id: 'cors-credentials-wildcard',
      title: 'Debug a CORS error with cookies',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'cors-preflight',
      question: `The React app on \`https://app.example.com\` calls the API on \`https://api.example.com\` with cookies. The browser console shows:

\`\`\`text
Access to fetch at 'https://api.example.com/me' from origin 'https://app.example.com'
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header
in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
\`\`\`

Server code:

\`\`\`javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/me', auth, (req, res) => res.json(req.user));
\`\`\`

Client code:

\`\`\`javascript
fetch('https://api.example.com/me', { credentials: 'include' });
\`\`\`

Find all the bugs and fix them. Also: why does Postman work fine?`,
      hints: [
        'With cookies, the browser needs the server to name the exact origin, not "everyone".',
        'There is a second header that must be `true` for the browser to expose a response that used cookies.',
        'A request with `Authorization` or `Content-Type: application/json` triggers a preflight `OPTIONS` request. Who answers it?',
      ],
      solution: `**Idea:** when cookies are sent, the server must echo the **exact** allowed origin, say \`Allow-Credentials: true\`, and answer the preflight \`OPTIONS\` request.

\`\`\`javascript
const ALLOWED_ORIGINS = new Set([
  'https://app.example.com',
  'http://localhost:5173', // local dev
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);     // exact origin, never '*'
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // allow cookies
    res.setHeader('Vary', 'Origin');                           // caches must key on Origin
  }

  if (req.method === 'OPTIONS') {
    // Preflight: tell the browser what is allowed, then stop here
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600'); // cache preflight for 10 min
    return res.sendStatus(204);
  }
  next();
});
\`\`\`

Or with the \`cors\` package:

\`\`\`javascript
import cors from 'cors';
app.use(cors({ origin: [...ALLOWED_ORIGINS], credentials: true }));
\`\`\`

**The bugs:**
1. \`*\` is not allowed together with credentials. Echo the exact origin from an allow-list. (Never blindly echo *any* origin — that lets any site read user data with their cookies.)
2. \`Access-Control-Allow-Credentials: true\` was missing.
3. No \`Vary: Origin\` — a CDN could cache the response for one origin and serve it to another.
4. The preflight \`OPTIONS\` request was not handled, so requests with JSON bodies or \`Authorization\` would fail too.

Also check the cookie itself: for cross-site requests it needs \`SameSite=None; Secure\`. Here \`app.\` and \`api.example.com\` are the **same site**, so \`SameSite=Lax\` is enough.

**Why Postman works:** CORS is enforced by **browsers** only. Postman, curl and servers don't check it. CORS is not server security — it controls which web pages may *read* responses in a user's browser.`,
      followUps: [
        {
          q: 'What makes a request "simple" (no preflight)?',
          a: 'Method is GET, HEAD or POST; only basic headers; and Content-Type is one of `text/plain`, `multipart/form-data`, or `application/x-www-form-urlencoded`. Sending `application/json` or an `Authorization` header triggers a preflight.',
        },
        {
          q: 'How can you avoid CORS completely?',
          a: 'Serve the API from the same origin: e.g. a reverse proxy so `app.example.com/api/*` goes to the API, or Next.js rewrites. Same origin = no CORS.',
        },
      ],
    },
    {
      id: 'choose-realtime-transport',
      title: 'Polling, SSE or WebSocket? Choose for 4 features',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'realtime-options',
      question: `Pick **short polling**, **Server-Sent Events (SSE)**, or **WebSocket** for each feature, and explain why.

1. A dashboard showing the status of a CSV export that takes ~1 minute.
2. Streaming an AI chatbot answer token by token (like ChatGPT).
3. A multiplayer whiteboard where many users draw at the same time.
4. A notification bell that shows new notifications within a few seconds.`,
      hints: [
        'Ask: who sends data — only the server, or both sides, all the time?',
        'Ask: how often does data change? Is a small delay OK?',
        'SSE is a one-way stream from server to browser over plain HTTP. WebSocket is two-way.',
      ],
      solution: `**Idea:** choose the simplest tool that meets the need. Two-way, high-frequency → WebSocket. Server-to-client stream → SSE. Rare, short-lived checks → polling.

1. **Export status → short polling.** Call \`GET /exports/:id\` every 2–5 seconds until \`status: "done"\`. It runs for a short time and only one user cares. Polling is simple, works through every proxy, and needs no extra servers.
2. **AI answer → SSE.** The server pushes chunks one way. SSE is plain HTTP (\`Content-Type: text/event-stream\`), so it works with normal auth, load balancers and CDNs. OpenAI and Anthropic APIs stream this way.
3. **Whiteboard → WebSocket.** Both sides send many small messages per second with low delay. One open, two-way connection avoids HTTP overhead for each message.
4. **Notifications → SSE** (or a WebSocket if the app already has one open). Server-to-client only. SSE also reconnects automatically and can resume with the \`Last-Event-ID\` header. Polling every 30 seconds is an acceptable simple start too.

\`\`\`javascript
// Minimal SSE endpoint in Express
app.get('/notifications/stream', auth, (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  const send = (n) => res.write(\`id: \${n.id}\\ndata: \${JSON.stringify(n)}\\n\\n\`);
  const unsubscribe = notifications.subscribe(req.user.id, send);

  const ping = setInterval(() => res.write(': ping\\n\\n'), 25000); // keep proxies from closing it
  req.on('close', () => { clearInterval(ping); unsubscribe(); });
});

// Browser
const es = new EventSource('/notifications/stream', { withCredentials: true });
es.onmessage = (e) => showToast(JSON.parse(e.data));
\`\`\`

**Why it works:** each choice matches *direction* and *frequency*. WebSockets cost more to run: sticky sessions, a pub/sub layer (e.g. Redis) when you have many servers, and custom reconnect logic.`,
      followUps: [
        {
          q: 'What is long polling?',
          a: 'The client sends a request and the server holds it open until there is new data (or a timeout), then the client immediately asks again. It gives near real-time updates with plain HTTP. It was common before SSE/WebSocket were well supported.',
        },
        {
          q: 'What are the limits of SSE?',
          a: 'One-way only (client uses normal HTTP requests to send). Text only. On HTTP/1.1 browsers allow about 6 connections per domain, so many tabs can run out — HTTP/2 fixes this. The native `EventSource` cannot set custom headers, so auth is usually via cookies.',
        },
      ],
    },
    {
      id: 'error-handler-middleware',
      title: 'Build one consistent error format for an Express API',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'error-response-design',
      question: `Every route in the API returns errors in a different shape: some send a string, some \`{ msg }\`, and crashes leak stack traces to the client.

Write:
1. An \`AppError\` class that carries a status code and a machine-readable \`code\`.
2. A single Express error-handling middleware that always returns:

\`\`\`json
{ "error": { "code": "USER_NOT_FOUND", "message": "User not found", "requestId": "c1a9..." } }
\`\`\`

Unknown errors must return **500** with a generic message (no stack trace) but must still be logged.`,
      hints: [
        'An Express error handler has **4** arguments: `(err, req, res, next)`. It must be registered after all routes.',
        'Extend `Error` so `throw new AppError(404, "USER_NOT_FOUND", "User not found")` works.',
        'Express 4 does not catch rejected promises from async handlers — you need a wrapper (Express 5 does it for you).',
      ],
      solution: `**Idea:** throw typed errors anywhere, and convert them to one JSON shape in one place.

\`\`\`javascript
import crypto from 'node:crypto';

// 1. A known, "expected" error
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;   // HTTP status, e.g. 404
    this.code = code;       // stable string the client can switch on
    this.details = details; // optional, e.g. field validation errors
  }
}

// Give every request an id (also useful in logs)
app.use((req, res, next) => {
  req.id = req.get('X-Request-Id') || crypto.randomUUID();
  res.set('X-Request-Id', req.id);
  next();
});

// Express 4: forward async errors to next()
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  res.json(user);
}));

// 404 for unknown routes
app.use((req, res, next) => next(new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found')));

// 2. The ONE error handler (4 args, registered last)
app.use((err, req, res, next) => {
  const known = err instanceof AppError;
  const status = known ? err.status : 500;

  if (!known) {
    // Log the full error for us, never send it to the client
    console.error({ requestId: req.id, err });
  }

  res.status(status).json({
    error: {
      code: known ? err.code : 'INTERNAL_ERROR',
      message: known ? err.message : 'Something went wrong',
      ...(known && err.details ? { details: err.details } : {}),
      requestId: req.id,
    },
  });
});
\`\`\`

**Why it works:** routes only *throw*; the formatting lives in one function. Clients switch on \`code\` (stable) instead of \`message\` (can change or be translated). The \`requestId\` lets support find the exact log line when a user reports a bug.

**Edge cases:** validation libraries (Zod, Joi) throw their own errors — map them to \`AppError(400, 'VALIDATION_ERROR', ..., fieldErrors)\` inside the handler. If headers were already sent (streaming), call \`next(err)\` so Express closes the connection.`,
      followUps: [
        {
          q: 'Is there a standard error format?',
          a: 'Yes — RFC 9457 "Problem Details" (`application/problem+json`) with fields `type`, `title`, `status`, `detail`, `instance`. Using it is a nice touch, but any consistent shape is fine.',
        },
        {
          q: 'How would you return several validation errors at once?',
          a: 'Put them in `details`: `[{ "field": "email", "code": "INVALID_FORMAT" }, { "field": "age", "code": "MIN_VALUE" }]`. Then the frontend can show each message next to its form field.',
        },
      ],
    },
    {
      id: 'safe-filter-sort-params',
      title: 'Turn query params into a safe MongoDB filter and sort',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'filtering-sorting',
      question: `Implement \`GET /products?category=shoes&minPrice=50&sort=-price,name&limit=20\`.

The current code passes the query straight into MongoDB:

\`\`\`javascript
app.get('/products', async (req, res) => {
  const { sort, limit, ...filter } = req.query;
  const items = await Product.find(filter).sort(sort).limit(Number(limit));
  res.json(items);
});
\`\`\`

1. Explain why this is dangerous.
2. Write a safe version: only allow filtering by \`category\`, \`minPrice\`, \`maxPrice\`; only allow sorting by \`price\`, \`name\`, \`createdAt\` (a leading \`-\` means descending); cap \`limit\` at 100.`,
      hints: [
        'Express turns `?price[$gt]=0` into the object `{ price: { $gt: "0" } }`. What does MongoDB do with that?',
        'Use an **allow-list**: build the filter yourself from known keys, never spread user input into a query.',
        'Parse `sort` by splitting on commas; ignore unknown fields.',
      ],
      solution: `**Idea:** never pass user input to the database as-is. Build the query from an allow-list and convert types yourself.

**Why the old code is dangerous:**
- **NoSQL injection:** \`?password[$ne]=x\` or \`?isDeleted[$ne]=true\` becomes a Mongo operator, so users can filter on hidden fields or bypass conditions.
- **Unindexed sorts:** sorting by any field can force a slow full collection scan (an easy DoS).
- **No limit cap:** \`?limit=1000000\` (or no limit at all) can dump the whole collection.

\`\`\`javascript
const SORTABLE = new Set(['price', 'name', 'createdAt']);
const MAX_LIMIT = 100;

function buildProductQuery(query) {
  const filter = { isDeleted: false }; // server-side rules always apply

  // Only accept plain strings (rejects objects like { $ne: ... })
  if (typeof query.category === 'string') filter.category = query.category;

  const min = Number(query.minPrice);
  const max = Number(query.maxPrice);
  if (Number.isFinite(min) || Number.isFinite(max)) {
    filter.price = {};
    if (Number.isFinite(min)) filter.price.$gte = min;
    if (Number.isFinite(max)) filter.price.$lte = max;
  }

  // "-price,name" -> { price: -1, name: 1 }
  const sort = {};
  if (typeof query.sort === 'string') {
    for (const part of query.sort.split(',')) {
      const desc = part.startsWith('-');
      const field = desc ? part.slice(1) : part;
      if (SORTABLE.has(field)) sort[field] = desc ? -1 : 1;
    }
  }
  sort._id = 1; // tie-breaker so the order is stable

  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), MAX_LIMIT);
  return { filter, sort, limit };
}

app.get('/products', async (req, res) => {
  const { filter, sort, limit } = buildProductQuery(req.query);
  const items = await Product.find(filter).sort(sort).limit(limit).lean();
  res.json({ data: items });
});
\`\`\`

**Why it works:** the database only ever sees keys and types we chose. Unknown params are ignored (or you can return 400 to be strict). The \`_id\` tie-breaker keeps the order the same between requests when two products have the same price.

**Edge cases:** \`minPrice=abc\` → \`NaN\` → ignored. \`limit=0\` or negative → 1. Also add indexes that match common filter + sort combos, e.g. \`{ category: 1, price: -1 }\`.`,
      followUps: [
        {
          q: 'Should unknown query params be ignored or rejected?',
          a: 'Both are valid. Ignoring is friendlier for clients. Rejecting with 400 catches typos early (`?catgory=shoes` silently returning everything is a confusing bug). Public APIs often validate strictly with a schema (Zod/Joi).',
        },
        {
          q: 'Is there a library-level protection against $ operators?',
          a: 'Yes: `express-mongo-sanitize` strips keys starting with `$` or containing `.`, and Mongoose has `sanitizeFilter`. Use them as a safety net, but still build queries from an allow-list.',
        },
      ],
    },
    {
      id: 'cursor-pagination-api',
      title: 'Implement cursor pagination for a feed',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'pagination',
      question: `\`GET /posts?page=500&limit=20\` uses \`skip\` and is slow. Users also see **duplicate posts** when new posts are added while they scroll.

Rewrite it as **cursor pagination**, newest first:

\`\`\`text
GET /posts?limit=20                      -> first page
GET /posts?limit=20&cursor=eyJjIjoi...   -> next page
\`\`\`

Response shape:

\`\`\`text
{ "data": [ ... ], "nextCursor": "eyJjIjoi..." }   // nextCursor is null on the last page
\`\`\`

Use MongoDB (Mongoose). Posts have \`createdAt\` and \`_id\`. Many posts can share the same \`createdAt\`.`,
      hints: [
        'The cursor should remember **where the last item was**, not a page number.',
        '`createdAt` alone is not unique. Sort by `createdAt` AND `_id` so the order is stable, and put both in the cursor.',
        'Fetch `limit + 1` items. If you got the extra one, there is a next page.',
      ],
      solution: `**Idea:** the cursor stores the sort values of the **last item** you returned. The next query asks for items that come *after* it. Because it does not count rows, it stays fast and new posts don't shift the pages.

\`\`\`javascript
import mongoose from 'mongoose';

// Cursor = base64url(JSON) of the last item's sort keys. Opaque to the client.
function encodeCursor(doc) {
  const payload = { c: doc.createdAt.toISOString(), id: String(doc._id) };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeCursor(cursor) {
  try {
    const { c, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    const createdAt = new Date(c);
    if (Number.isNaN(createdAt.getTime()) || !mongoose.isValidObjectId(id)) return null;
    return { createdAt, id: new mongoose.Types.ObjectId(id) };
  } catch {
    return null; // bad base64 or bad JSON
  }
}

app.get('/posts', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const filter = {};

  if (req.query.cursor) {
    const cur = decodeCursor(req.query.cursor);
    if (!cur) return res.status(400).json({ error: { code: 'INVALID_CURSOR' } });

    // "older than the last item" for a DESC sort on (createdAt, _id)
    filter.$or = [
      { createdAt: { $lt: cur.createdAt } },
      { createdAt: cur.createdAt, _id: { $lt: cur.id } }, // same time -> use _id as tie-breaker
    ];
  }

  const rows = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 }) // must match the cursor fields and direction
    .limit(limit + 1)                 // one extra to know if there is a next page
    .lean();

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  res.json({
    data,
    nextCursor: hasMore ? encodeCursor(data[data.length - 1]) : null,
  });
});

// Index that makes this fast:
// postSchema.index({ createdAt: -1, _id: -1 });
\`\`\`

**Why it works:**
- **Speed:** \`skip(10000)\` makes the DB walk 10,000 entries and throw them away. A range condition on an index jumps straight to the right place, so page 500 is as fast as page 1.
- **No duplicates:** the next page is "older than item X". New posts at the top don't move X.
- **Stable order:** \`_id\` breaks ties when two posts have the same \`createdAt\`. Without it, posts with equal timestamps could be skipped or repeated.
- **Opaque cursor:** clients treat it as a black box, so you can change its contents later.

**Trade-off:** you cannot jump to "page 37" directly. That is fine for feeds and infinite scroll. Keep offset pagination for small admin tables that need page numbers.`,
      followUps: [
        {
          q: 'Should the cursor be signed or encrypted?',
          a: 'Base64 is not secret — anyone can decode it. That is fine if it only holds sort values, because the server re-applies all permission filters. If it holds anything sensitive or you need tamper-proofing, sign it with HMAC or encrypt it.',
        },
        {
          q: 'How do you support a "previous page" button?',
          a: 'Add a `prevCursor` from the first item and query in the opposite direction (`$gt` with ascending sort), then reverse the results before returning them.',
        },
        {
          q: 'What if the user can sort by price instead of date?',
          a: 'The cursor must contain the values of *every* sort field plus `_id`, and the `$or` condition must follow the same order. Each sort option needs a matching compound index.',
        },
      ],
    },
    {
      id: 'idempotency-key-middleware',
      title: 'Write Idempotency-Key middleware for POST /payments',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'idempotency-key',
      question: `Mobile clients on bad networks retry \`POST /payments\` when they don't get a response. Sometimes the first request **did** succeed, so the customer is charged twice.

Write Express middleware that uses an \`Idempotency-Key\` header (a UUID the client creates once per payment attempt):

- The **first** request with a key runs normally, and its response is saved for 24 hours.
- A **repeat** with the same key returns the saved response without charging again.
- A repeat that arrives **while the first is still running** must not run twice.
- Reusing a key with a **different body** is an error.

You have a Redis-like \`store\` with \`setNX(key, value, ttlSec)\` (set only if missing, returns true/false), \`get\`, \`set\`, \`del\`.`,
      hints: [
        'Use an atomic "set if not exists" to claim the key. Only the winner runs the handler.',
        'Save the state as "processing" first, then "done" with the status code and body.',
        'Store a hash of the request body so you can detect the same key being used for a different payment.',
      ],
      solution: `**Idea:** claim the key atomically. The first request runs; later requests replay the saved response. Scope the key per user so two users can't collide.

\`\`\`javascript
import crypto from 'node:crypto';

const hashBody = (body) =>
  crypto.createHash('sha256').update(JSON.stringify(body ?? {})).digest('hex');

export function idempotency(store, ttlSec = 24 * 60 * 60) {
  return async (req, res, next) => {
    const key = req.get('Idempotency-Key');
    if (!key) {
      return res.status(400).json({ error: 'Idempotency-Key header is required' });
    }

    const storeKey = \`idem:\${req.user.id}:\${key}\`; // scoped per user
    const bodyHash = hashBody(req.body);

    // 1. Try to claim the key (atomic: only one request can win)
    const claimed = await store.setNX(
      storeKey,
      JSON.stringify({ status: 'processing', bodyHash }),
      ttlSec,
    );

    if (!claimed) {
      const saved = JSON.parse(await store.get(storeKey));

      if (saved.bodyHash !== bodyHash) {
        return res.status(422).json({ error: 'Idempotency-Key reused with a different body' });
      }
      if (saved.status === 'processing') {
        // The first request is still running: tell the client to retry later
        return res.status(409).json({ error: 'Request with this key is still in progress' });
      }
      // 2. Replay the saved response — no second charge
      res.set('Idempotent-Replayed', 'true');
      return res.status(saved.code).json(saved.body);
    }

    // 3. We won: run the handler, but capture its response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 500) {
        // Server failure: release the key so the client can retry safely
        store.del(storeKey);
      } else {
        // Save 2xx and 4xx results so retries get the same answer
        store.set(
          storeKey,
          JSON.stringify({ status: 'done', bodyHash, code: res.statusCode, body }),
          ttlSec,
        );
      }
      return originalJson(body);
    };

    next();
  };
}

// Usage
app.post('/payments', auth, idempotency(redisStore), async (req, res) => {
  const payment = await chargeCard(req.body); // pass the same key to Stripe too!
  res.status(201).json(payment);
});
\`\`\`

I tested this flow: first call → 201 \`pay_1\`; same key again → 201 \`pay_1\` with \`Idempotent-Replayed: true\` (only one charge); same key + different amount → 422; concurrent duplicate → 409.

**Why it works:**
- \`setNX\` is atomic in Redis (\`SET key value NX EX ttl\`), so two parallel requests cannot both "win".
- The body hash stops a buggy client from reusing a key for a different payment.
- 5xx results are not saved, so a crash does not lock the key forever with an error.

**Edge case:** if the server crashes mid-request, the key stays "processing" until the TTL ends. Use a shorter TTL for the processing state (e.g. 60s), or store a timestamp and allow takeover after a timeout.`,
      followUps: [
        {
          q: 'Why not just check "does an order with these details already exist"?',
          a: 'Two genuine payments can have identical details (same user buys the same coffee twice). Only the client knows whether a request is a retry or a new intent — the key carries that knowledge.',
        },
        {
          q: 'Is Redis alone enough for money?',
          a: 'For stronger guarantees, store the idempotency key in the same database transaction as the payment row, with a unique index on (userId, key). Then the DB itself makes duplicates impossible even if Redis loses data.',
        },
        {
          q: 'How does Stripe use this?',
          a: 'Stripe accepts an `Idempotency-Key` header on POST requests and keeps results for 24 hours. When you call Stripe from your server, pass a key derived from your own order id so your retries are also safe.',
        },
      ],
    },
    {
      id: 'verify-webhook-hmac',
      title: 'Verify a webhook signature (HMAC + timestamp)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'webhooks',
      question: `A payment provider sends webhooks to \`POST /webhooks/payments\` with this header:

\`\`\`text
X-Signature: t=1760000000,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
\`\`\`

The provider computes: \`v1 = HMAC_SHA256(secret, t + "." + rawBody)\` as hex.

Write \`verifyWebhook(rawBody, header, secret)\` that:
- rejects a missing or malformed header,
- rejects events older than **5 minutes** (replay attacks),
- compares signatures in **constant time**.

Then show how to wire it in Express so you get the **raw** body.`,
      hints: [
        'Use `crypto.createHmac("sha256", secret).update(...).digest("hex")` from `node:crypto`.',
        'Comparing with `===` stops at the first different character, which leaks timing. Use `crypto.timingSafeEqual` (it needs Buffers of equal length).',
        'If `express.json()` runs first, the body is parsed and re-stringified — the bytes change and the signature never matches. Use `express.raw()` on this route.',
      ],
      solution: `**Idea:** recompute the signature from the exact raw bytes and the timestamp, then compare in constant time. The timestamp is inside the signed data, so an attacker can't change it to replay old events.

\`\`\`javascript
import crypto from 'node:crypto';
import express from 'express';

const TOLERANCE_SEC = 5 * 60;

export function verifyWebhook(rawBody, header, secret, now = Date.now()) {
  if (!header) return false;

  // "t=123,v1=abc" -> { t: '123', v1: 'abc' }
  const parts = {};
  for (const item of header.split(',')) {
    const i = item.indexOf('=');
    if (i > 0) parts[item.slice(0, i).trim()] = item.slice(i + 1).trim();
  }
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!Number.isInteger(timestamp) || !signature) return false;

  // Reject old (or far-future) events -> blocks replay attacks
  if (Math.abs(now / 1000 - timestamp) > TOLERANCE_SEC) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(\`\${timestamp}.\${rawBody}\`)
    .digest('hex');

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;   // timingSafeEqual throws on different lengths
  return crypto.timingSafeEqual(a, b);       // constant-time compare
}

// Raw body ONLY for this route (register before app.use(express.json()))
app.post(
  '/webhooks/payments',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const raw = req.body.toString('utf8'); // req.body is a Buffer here
    if (!verifyWebhook(raw, req.get('X-Signature'), process.env.WEBHOOK_SECRET)) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(raw);

    // Providers retry, so the same event can arrive twice -> dedupe by event id
    const firstTime = await ProcessedEvent.insertIfAbsent(event.id); // unique index on id
    if (firstTime) await jobQueue.add('payment-event', event);       // do slow work async

    res.sendStatus(200); // answer fast, or the provider will retry
  },
);
\`\`\`

I checked it with \`node:crypto\`: a correct signature → \`true\`; one extra space in the body → \`false\`; a 1000-second-old timestamp → \`false\`; a garbage signature → \`false\`.

**Why it works:**
- **HMAC** proves the sender knows the shared secret and that the body was not changed.
- **Timestamp check** stops someone who captured an old valid request from sending it again later.
- **timingSafeEqual** takes the same time no matter where the strings differ, so an attacker can't guess the signature byte by byte.
- **Raw body** — the HMAC is over exact bytes; \`JSON.stringify(JSON.parse(x))\` may change spacing or key order.`,
      followUps: [
        {
          q: 'Why return 200 quickly and process in a queue?',
          a: 'Providers have short timeouts (often 5-30s) and retry on slow or failed responses. Doing heavy work inline causes timeouts, retries and duplicate processing. Acknowledge fast, process in the background.',
        },
        {
          q: 'How do you rotate the webhook secret without downtime?',
          a: 'Accept both the old and new secret for a period (check against each), switch the provider to the new one, then remove the old one. Some providers send multiple `v1=` signatures during rotation for this reason.',
        },
        {
          q: 'Should you trust the event data, or re-fetch it?',
          a: 'For critical state (payment status), many teams re-fetch the object from the provider API using the id in the event. This protects against out-of-order events and makes the provider the source of truth.',
        },
      ],
    },
    {
      id: 'token-bucket-rate-limiter',
      title: 'Implement a token bucket rate limiter',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'rate-limiting',
      question: `Implement a **token bucket** rate limiter as a class:

\`\`\`javascript
const limiter = new TokenBucket({ capacity: 3, refillPerSec: 1 });
limiter.allow('user-1'); // true / false
\`\`\`

- Each key (user id or API key) has its own bucket that starts **full**.
- A request costs 1 token. No token → rejected.
- Tokens refill smoothly at \`refillPerSec\`, never above \`capacity\`.
- Do **not** use \`setInterval\` to refill.

Then use it in Express middleware that returns **429** with a \`Retry-After\` header.`,
      hints: [
        'Instead of a timer, store `tokens` and `lastRefill` time per key. Add the missing tokens when a request arrives.',
        'tokens = min(capacity, tokens + secondsSinceLast * refillPerSec)',
        'Inject the clock (`now`) in the constructor so you can test without waiting.',
      ],
      solution: `**Idea:** each bucket holds tokens. On every request, add the tokens earned since the last request ("lazy refill"), then spend one if you can. Capacity allows short bursts; refill rate sets the long-term average.

\`\`\`javascript
export class TokenBucket {
  constructor({ capacity, refillPerSec, now = () => Date.now() }) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
    this.now = now;               // injectable clock for tests
    this.buckets = new Map();     // key -> { tokens, last }
  }

  #refill(key) {
    const t = this.now();
    let b = this.buckets.get(key);
    if (!b) {
      b = { tokens: this.capacity, last: t }; // new keys start full
      this.buckets.set(key, b);
    }
    const elapsedSec = (t - b.last) / 1000;
    b.tokens = Math.min(this.capacity, b.tokens + elapsedSec * this.refillPerSec);
    b.last = t;
    return b;
  }

  allow(key) {
    const b = this.#refill(key);
    if (b.tokens >= 1) {
      b.tokens -= 1;
      return true;
    }
    return false;
  }

  // Seconds until 1 token is available (for Retry-After)
  retryAfterSec(key) {
    const b = this.#refill(key);
    return b.tokens >= 1 ? 0 : Math.ceil((1 - b.tokens) / this.refillPerSec);
  }
}

// Test with a fake clock
let fakeNow = 0;
const limiter = new TokenBucket({ capacity: 3, refillPerSec: 1, now: () => fakeNow });
// t=0s: 5 requests  -> true true true false false   (burst of 3)
// t=1s: 2 requests  -> true false                   (1 token refilled)
// t=5s: 4 requests  -> true true true false         (refill capped at 3)

// Express middleware
export const rateLimit = (limiter) => (req, res, next) => {
  const key = req.user?.id ?? req.ip;
  if (limiter.allow(key)) return next();
  res.set('Retry-After', String(limiter.retryAfterSec(key)));
  res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
};
\`\`\`

I ran the test above in Node and got exactly those results.

**Why it works:** we never need a timer — elapsed time tells us how many tokens were earned. **Complexity:** O(1) time per request, O(number of keys) memory.

**Edge cases:**
- The Map grows forever: delete buckets that are full and idle (or use Redis keys with a TTL).
- With several servers, each has its own Map, so the real limit is multiplied. Move the state to **Redis** and do the refill + take in one atomic **Lua script**, so two servers can't spend the same token.`,
      followUps: [
        {
          q: 'Token bucket vs fixed window counter?',
          a: 'A fixed window ("100 per minute, reset at :00") allows a double burst at the boundary: 100 at 0:59 and 100 at 1:00. A token bucket smooths traffic and still allows controlled bursts up to `capacity`.',
        },
        {
          q: 'Which key should you limit on?',
          a: 'Authenticated: user id or API key (fair per customer). Anonymous: IP address — but many users can share one IP (offices, mobile carriers). Login endpoints often limit per IP AND per username to slow down password guessing.',
        },
        {
          q: 'What headers do good APIs send?',
          a: '`Retry-After` on 429, plus remaining-quota headers such as `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (or the newer IETF `RateLimit` headers), so clients can slow down before hitting the limit.',
        },
      ],
    },
    {
      id: 'etag-conditional-get',
      title: 'Add ETag support: 304 on GET and 412 on stale updates',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'http-caching',
      question: `A mobile app calls \`GET /products/:id\` every time a screen opens. The product rarely changes, but the full JSON (~50 KB) is downloaded every time.

1. Add **ETag** support so an unchanged product returns **304 Not Modified** with no body.
2. Two admins edit the same product at the same time and one silently overwrites the other ("lost update"). Use the same ETag with \`If-Match\` on \`PUT /products/:id\` to stop this.

Products have \`_id\` and \`updatedAt\` (or a \`__v\` version number).`,
      hints: [
        'An ETag is a short "fingerprint" of the current version. The client sends it back in `If-None-Match`.',
        'If the fingerprint still matches, send 304 and no body. The client reuses its cached copy.',
        'For updates: the client sends `If-Match: <etag it last saw>`. If the product has changed since, return 412 Precondition Failed.',
      ],
      solution: `**Idea:** build an ETag from the version of the record. On GET, if the client already has that version, answer 304. On PUT, only write if the client's version is still the current one.

\`\`\`javascript
// A strong ETag from id + last update time (must change on every update)
const etagOf = (doc) => \`"\${doc._id}-\${doc.updatedAt.getTime()}"\`;

// "If-None-Match" can hold several tags: W/"a", "b"  (W/ = weak tag)
function matches(header, etag) {
  if (!header) return false;
  if (header.trim() === '*') return true;
  return header.split(',').map((t) => t.trim().replace(/^W\\//, '')).includes(etag);
}

// 1. Conditional GET
app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.sendStatus(404);

  const etag = etagOf(product);
  res.set('ETag', etag);
  res.set('Cache-Control', 'private, no-cache'); // may cache, but must revalidate each time

  if (matches(req.get('If-None-Match'), etag)) {
    return res.status(304).end(); // client copy is still fresh, send no body
  }
  res.json(product);
});

// 2. Optimistic concurrency on update
app.put('/products/:id', auth, async (req, res) => {
  const ifMatch = req.get('If-Match');
  if (!ifMatch) return res.status(428).json({ error: 'If-Match header required' }); // 428 Precondition Required

  const current = await Product.findById(req.params.id).lean();
  if (!current) return res.sendStatus(404);
  if (!matches(ifMatch, etagOf(current))) {
    return res.status(412).json({ error: 'Product was changed by someone else. Reload and try again.' });
  }

  // Atomic guard: the filter includes the old updatedAt, so a write that sneaks in
  // between findById and here makes this update match nothing.
  const updated = await Product.findOneAndUpdate(
    { _id: current._id, updatedAt: current.updatedAt },
    { ...req.body, updatedAt: new Date() },
    { new: true, lean: true },
  );
  if (!updated) return res.status(412).json({ error: 'Product was changed by someone else.' });

  res.set('ETag', etagOf(updated)).json(updated);
});
\`\`\`

**Why it works:**
- **304:** the browser (or your fetch cache) stores the body and its ETag. Next time it sends \`If-None-Match\`. Same version → tiny 304 response, saving bandwidth. The DB read still happens, but serialization and download are skipped.
- **412:** Admin A and B both load version \`v1\`. A saves → now \`v2\`. B sends \`If-Match: v1\` → 412, so B must reload instead of overwriting A's changes.

**Note:** Express already adds a weak ETag (a hash of the response body) to \`res.json\` and answers 304 automatically. It still runs your DB query and builds the full JSON. A version-based ETag lets you skip that work, and it also enables \`If-Match\`.`,
      followUps: [
        {
          q: 'Strong vs weak ETag?',
          a: 'A strong ETag ("abc") means byte-for-byte identical. A weak ETag (W/"abc") means "same meaning", e.g. the same data with different gzip. Weak tags are fine for 304 but should not be used for If-Match on writes or byte-range requests.',
        },
        {
          q: 'ETag vs Last-Modified?',
          a: '`Last-Modified` + `If-Modified-Since` works the same way using a date, but only to 1-second precision. ETag is more exact. You can send both.',
        },
      ],
    },
    {
      id: 'rbac-permission-middleware',
      title: 'Design an RBAC permission check with ownership',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'rbac',
      question: `A multi-tenant project tool has organizations. Users have roles **inside an org**: \`viewer\`, \`editor\`, \`admin\`.

Rules:
- viewer: read projects
- editor: read + update projects, create and update tasks
- admin: everything (including deleting projects and managing members)
- Nobody can touch data from **another org**.
- A user can always edit **their own** comments, whatever the role.

Code is full of checks like \`if (user.role === 'admin' || user.role === 'editor')\`. Design a cleaner permission system and write Express middleware \`requirePermission('project:update')\`.`,
      hints: [
        'Check **permissions**, not role names, in your routes. Map roles to permissions in one place.',
        'Two checks are needed: "does this role allow the action?" and "does this resource belong to the user\'s org?"',
        'Ownership rules (own comment) need the resource, so they can\'t be decided from the token alone.',
      ],
      solution: `**Idea:** one table maps roles to permissions. Routes ask for a permission, never a role. A second check ties the resource to the user's org (and to the owner when needed).

\`\`\`javascript
// 1. One source of truth
const ROLE_PERMISSIONS = {
  viewer: ['project:read'],
  editor: ['project:read', 'project:update', 'task:create', 'task:update'],
  admin: ['*'], // everything
};

export function can(user, permission, resource) {
  // Tenant isolation first: never cross orgs, even for admins
  if (resource && String(resource.orgId) !== String(user.orgId)) return false;

  const perms = new Set((user.roles ?? []).flatMap((r) => ROLE_PERMISSIONS[r] ?? []));
  return perms.has('*') || perms.has(permission);
}

// 2. Route-level middleware (role check only, from the token)
export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return res.sendStatus(401);
  if (!can(req.user, permission)) return res.sendStatus(403);
  next();
};

// 3. Resource-level check inside the handler
app.patch('/projects/:id', auth, requirePermission('project:update'), async (req, res) => {
  // Scope the query by org: another org's project simply "does not exist" -> 404
  const project = await Project.findOne({ _id: req.params.id, orgId: req.user.orgId });
  if (!project) return res.sendStatus(404);

  Object.assign(project, pick(req.body, ['name', 'description'])); // allow-list fields
  await project.save();
  res.json(project);
});

// 4. Ownership rule: anyone may edit their own comment
app.patch('/comments/:id', auth, async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.id, orgId: req.user.orgId });
  if (!comment) return res.sendStatus(404);

  const isOwner = String(comment.authorId) === String(req.user.id);
  if (!isOwner && !can(req.user, 'comment:moderate')) return res.sendStatus(403);

  comment.body = req.body.body;
  await comment.save();
  res.json(comment);
});
\`\`\`

I tested \`can()\`: viewer + \`project:read\` → true; viewer + \`project:update\` → false; editor on another org's project → false; admin → true; unknown role → false.

**Why it works:**
- Adding a role (e.g. \`billing\`) means editing one table, not 50 \`if\` statements.
- Tenant isolation is in the **query** (\`orgId: req.user.orgId\`). Forgetting a check can't leak data — this prevents **BOLA/IDOR** (changing an id in the URL to read someone else's data), the #1 item in the OWASP API Top 10.
- \`pick()\` stops "mass assignment" (a user sending \`{ "orgId": "other" }\` or \`{ "role": "admin" }\` in the body).

**Edge case:** if roles live in the JWT, a demoted user keeps the old role until the token expires. Keep access tokens short (5-15 min) or load roles from the DB/cache on each request.`,
      followUps: [
        {
          q: 'RBAC vs ABAC?',
          a: 'RBAC decides by role ("editors can update"). ABAC (attribute-based) decides by attributes of user, resource and context ("owner can edit during business hours if status is draft"). Most apps use RBAC plus a few ABAC-style rules like ownership.',
        },
        {
          q: 'Should the frontend also check permissions?',
          a: 'Yes, to hide buttons the user can\'t use (better UX) — send the permission list in a `/me` response. But the frontend check is only cosmetic. The server must always enforce.',
        },
      ],
    },
    {
      id: 'api-breaking-change-versioning',
      title: 'Ship a breaking API change without breaking mobile apps',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'api-versioning',
      question: `Your public API returns:

\`\`\`json
{ "id": "o_1", "customerName": "Asha Rao", "total": 49.99 }
\`\`\`

The business wants: \`customerName\` split into \`customer: { firstName, lastName }\`, and \`total\` changed to **integer cents** (\`4999\`) with a \`currency\` field, because floats cause rounding bugs.

Old mobile app versions will stay installed for months, and partners have integrations. How do you roll this out?`,
      hints: [
        'First ask: can this be done **without** breaking anything? (Add new fields, keep old ones.)',
        'If you must break it, version it (URL `/v2` or a header) and keep v1 working by mapping from the new model.',
        'How will clients know v1 is going away, and how will you know who still uses it?',
      ],
      solution: `**Idea:** prefer **additive** changes. When a real break is needed, run v1 and v2 side by side from **one** internal model, announce a deprecation date, and measure who still uses v1 before removing it.

**Step 1 — Try a non-breaking change first (expand)**

\`\`\`json
{
  "id": "o_1",
  "customerName": "Asha Rao",
  "customer": { "firstName": "Asha", "lastName": "Rao" },
  "total": 49.99,
  "totalCents": 4999,
  "currency": "USD"
}
\`\`\`

Old clients ignore unknown fields, new clients use the new ones. This alone often solves the problem.

**Step 2 — If the old shape must go, add /v2**

\`\`\`javascript
// One domain model (cents + split name), two "presenters"
const toV2 = (o) => ({
  id: o.id,
  customer: { firstName: o.firstName, lastName: o.lastName },
  totalCents: o.totalCents,
  currency: o.currency,
});

const toV1 = (o) => ({
  id: o.id,
  customerName: \`\${o.firstName} \${o.lastName}\`.trim(),
  total: o.totalCents / 100, // old clients still get a float
});

app.get('/v2/orders/:id', auth, async (req, res) => res.json(toV2(await getOrder(req.params.id))));

app.get('/v1/orders/:id', auth, async (req, res) => {
  // Tell clients it is going away (Sunset is RFC 8594)
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Tue, 30 Jun 2027 00:00:00 GMT');
  res.set('Link', '</v2/orders>; rel="successor-version"');
  metrics.increment('api.v1.orders', { client: req.get('User-Agent') });
  res.json(toV1(await getOrder(req.params.id)));
});
\`\`\`

**Step 3 — Migrate and retire (contract)**
1. Ship the mobile app using v2. Use a **minimum app version** check to force very old apps to update.
2. Email partners with the sunset date and a migration guide.
3. Watch the v1 usage metric. Contact the remaining heavy users.
4. After the date (and when traffic is near zero), return **410 Gone** from v1, then delete the code.

**Why it works:** both versions read the same data, so there is only one source of truth and no data migration per version. Versioning is about the **contract** (shape), not separate databases.

**What counts as breaking:** removing or renaming a field, changing a type (float → int), making an optional input required, changing the meaning of a status code or enum value. Adding a new optional field or new endpoint is **not** breaking.`,
      followUps: [
        {
          q: 'URL versioning vs header versioning?',
          a: 'URL (`/v2/orders`) is simple, visible in logs and easy to test in a browser — most common. Header versioning (`Accept: application/vnd.app.v2+json` or Stripe-style `Stripe-Version: 2024-06-20`) keeps URLs clean and allows fine-grained dated versions, but is harder to debug.',
        },
        {
          q: 'Is adding a new enum value breaking?',
          a: 'It can be. If a client has a `switch` without a default, a new `status: "on_hold"` may crash it. Document that clients must handle unknown enum values, and announce new values ahead of time.',
        },
      ],
    },
    {
      id: 'presigned-url-upload-flow',
      title: 'Design large file uploads with S3 presigned URLs',
      difficulty: 'medium',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'file-uploads',
      question: `Users upload résumés and videos (up to 500 MB) in your React + Node app. Today the file goes through your Node server with \`multer\`, which uses a lot of memory and times out.

Design a **presigned URL** flow with S3:
- the endpoints and the order of calls,
- how you limit file size and type,
- how the server knows the upload actually finished,
- how you clean up uploads that were never completed.`,
      hints: [
        'The browser should upload straight to S3. Your server only hands out a short-lived permission (a signed URL).',
        'Save a DB row with status `pending` before the upload; flip it to `ready` after you verify the file exists.',
        'A presigned POST can enforce `content-length-range`. A presigned PUT cannot limit size on its own.',
      ],
      solution: `**Idea:** the server signs a short-lived URL that allows exactly one upload to one key. The browser sends the bytes directly to S3, so your server never touches the file.

\`\`\`text
1. Browser -> POST /uploads { fileName, contentType, size }
      Server: checks auth, type allow-list, size <= 500 MB
              creates DB row { id, key, status: 'pending' }
              returns { uploadId, url, fields }   (presigned POST, expires in 5 min)
2. Browser -> POST to S3 url with fields + file   (progress bar via XHR upload events)
3. Browser -> POST /uploads/:id/complete
      Server: HeadObject(key) -> exists? size/type OK? -> status: 'ready'
   (or S3 "ObjectCreated" event -> SQS/Lambda marks it ready: works even if the tab closes)
4. Later: GET /files/:id -> server returns a presigned GET URL (private bucket)
\`\`\`

\`\`\`javascript
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import crypto from 'node:crypto';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const ALLOWED = new Set(['application/pdf', 'video/mp4']);
const MAX_BYTES = 500 * 1024 * 1024;

app.post('/uploads', auth, async (req, res) => {
  const { contentType, size } = req.body;
  if (!ALLOWED.has(contentType)) return res.status(400).json({ error: 'File type not allowed' });
  if (!(size > 0 && size <= MAX_BYTES)) return res.status(400).json({ error: 'File too large' });

  // Server chooses the key: never trust the user's file name as a path
  const key = \`uploads/\${req.user.id}/\${crypto.randomUUID()}\`;
  const upload = await Upload.create({ userId: req.user.id, key, contentType, status: 'pending' });

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: process.env.BUCKET,
    Key: key,
    Conditions: [
      ['content-length-range', 1, MAX_BYTES], // S3 itself rejects bigger files
      ['eq', '$Content-Type', contentType],
    ],
    Fields: { 'Content-Type': contentType },
    Expires: 300, // seconds
  });

  res.status(201).json({ uploadId: upload.id, url, fields });
});

app.post('/uploads/:id/complete', auth, async (req, res) => {
  const upload = await Upload.findOne({ _id: req.params.id, userId: req.user.id });
  if (!upload) return res.sendStatus(404);

  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: process.env.BUCKET, Key: upload.key }));
    upload.size = head.ContentLength;
    upload.status = 'ready';
    await upload.save();
    res.json(upload);
  } catch {
    res.status(409).json({ error: 'File not found in storage yet' });
  }
});
\`\`\`

**Cleanup:** an S3 **lifecycle rule** deletes objects under \`uploads/\` that were never confirmed (or upload to a \`tmp/\` prefix and move on confirm), plus a cron job that removes DB rows stuck in \`pending\` for more than a day. Also add a lifecycle rule to abort incomplete multipart uploads.

**Why it works:** your server handles a tiny JSON request instead of 500 MB, so memory and timeouts stop being a problem, and S3 scales the upload. The signature is tied to one key, one content type, a size range and 5 minutes, so it can't be reused for anything else.

**Security:** the bucket stays private. The \`Content-Type\` header is set by the client, so for risky files run a virus scan or check the file's magic bytes in a background job before marking it \`ready\`.`,
      followUps: [
        {
          q: 'How do you make a 500 MB upload resumable?',
          a: 'Use S3 **multipart upload**: the server creates the upload and signs a URL per part (e.g. 10 MB each). The client uploads parts in parallel, retries only failed parts, then the server calls CompleteMultipartUpload with the part ETags. Libraries like Uppy handle the client side.',
        },
        {
          q: 'Presigned PUT vs presigned POST?',
          a: 'PUT is simpler (one URL, send the raw file), but it cannot enforce a size range. POST (form upload) supports policy conditions like `content-length-range`. For user uploads with limits, POST is safer.',
        },
      ],
    },
    {
      id: 'graphql-n-plus-one-dataloader',
      title: 'Fix the N+1 query problem in a GraphQL API',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'graphql-dataloader',
      question: `This query is slow. Logs show **101 database queries** for one request.

\`\`\`graphql
query {
  posts(limit: 100) {
    id
    title
    author { id name }
  }
}
\`\`\`

\`\`\`javascript
const resolvers = {
  Query: {
    posts: (_, { limit }) => Post.find().limit(limit).lean(),
  },
  Post: {
    author: (post) => User.findById(post.authorId).lean(), // runs once per post!
  },
};
\`\`\`

Explain the problem and fix it with **DataLoader**. Also explain where the loader must be created.`,
      hints: [
        'Count: 1 query for the posts, then one `findById` per post.',
        'DataLoader collects all `.load(id)` calls made in the same tick and calls your batch function **once** with all ids.',
        'The batch function must return results in the **same order** as the ids it received.',
      ],
      solution: `**Idea:** GraphQL resolves each \`author\` field separately, so 100 posts = 100 user queries (+1 for the posts) = **N+1**. DataLoader batches those 100 calls into one \`$in\` query and caches duplicates.

\`\`\`javascript
import DataLoader from 'dataloader';

// Batch function: gets ALL ids requested in this tick
async function batchUsers(ids) {
  const users = await User.find({ _id: { $in: ids } }).lean(); // 1 query
  const byId = new Map(users.map((u) => [String(u._id), u]));
  // MUST return one result per id, in the same order (null if missing)
  return ids.map((id) => byId.get(String(id)) ?? null);
}

// Create NEW loaders for EVERY request
export const createLoaders = () => ({
  userById: new DataLoader(batchUsers),
});

// Apollo Server (standalone) context: runs once per request
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({
    user: await getUserFromToken(req.headers.authorization),
    loaders: createLoaders(),
  }),
});

const resolvers = {
  Query: {
    posts: (_, { limit }) => Post.find().limit(limit).lean(),
  },
  Post: {
    author: (post, _, { loaders }) => loaders.userById.load(String(post.authorId)),
  },
};
\`\`\`

Result: **2 queries** total (posts + one \`User.find({ _id: { $in: [...] } })\`), no matter how many posts.

**Why it works:** each \`load(id)\` returns a promise and adds the id to a queue. At the end of the current tick, DataLoader calls \`batchUsers\` once with all unique ids, then resolves each promise with its matching result. Ten posts by the same author ask for that author only once (per-request cache).

**Why per request?** The cache is not shared on purpose. A global loader would serve stale data forever and could leak data between users with different permissions.

**Common bug:** returning \`users\` straight from \`User.find\` — Mongo does not return them in the order of \`ids\`, and missing users shorten the array, so authors get mixed up. Always map back by id.`,
      followUps: [
        {
          q: 'Does REST have the N+1 problem too?',
          a: 'Yes — e.g. a loop that calls `await User.findById()` for each order, or a frontend that calls `/users/:id` for each row. Fix it the same way: collect ids and fetch with one `$in` query, or use `populate`/a JOIN/`$lookup`.',
        },
        {
          q: 'What other GraphQL performance risks should you guard against?',
          a: 'Very deep or very large queries (a client asking `friends { friends { friends ... } }`). Use depth limits, query cost analysis, pagination limits on lists, and persisted queries for public APIs.',
        },
      ],
    },
    {
      id: 'oauth-pkce-spa-flow',
      title: 'Walk through OAuth 2.0 Authorization Code + PKCE for a React SPA',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'oauth-flows',
      question: `Your React SPA must let users "Sign in with Google" (or any OAuth/OIDC provider) and then call your API.

1. List the steps of the **Authorization Code flow with PKCE**, in order.
2. Write the browser code that creates the \`code_verifier\` and \`code_challenge\`.
3. Explain what \`state\` and PKCE each protect against, and why the old **Implicit flow** is no longer recommended.`,
      hints: [
        'The SPA cannot keep a client secret (anyone can read its JS). PKCE replaces the secret with a one-time random value.',
        '`code_challenge = BASE64URL(SHA256(code_verifier))`. The challenge goes in the redirect; the verifier goes in the token request.',
        '`state` is a random value you check when the user comes back — it is about CSRF, not about stolen codes.',
      ],
      solution: `**Idea:** the browser gets a short-lived **code**, not a token, in the redirect. Only the app that created the secret \`code_verifier\` can swap that code for tokens.

**The steps**

\`\`\`text
1. SPA creates: code_verifier (random), code_challenge = BASE64URL(SHA256(verifier)), state (random)
   Saves verifier + state in sessionStorage.
2. SPA redirects to the provider:
   GET https://auth.example.com/authorize
       ?response_type=code
       &client_id=spa-123
       &redirect_uri=https://app.example.com/callback
       &scope=openid profile email
       &state=xyz
       &code_challenge=E9Mel...
       &code_challenge_method=S256
3. User logs in and consents on the provider's page.
4. Provider redirects back: https://app.example.com/callback?code=abc&state=xyz
5. SPA checks state === saved state (else stop: possible CSRF).
6. SPA POSTs to the token endpoint:
   grant_type=authorization_code, code=abc, redirect_uri=..., client_id=spa-123, code_verifier=<original>
7. Provider computes SHA256(code_verifier), compares with the saved challenge -> returns
   access_token (+ id_token for OIDC, + refresh_token if allowed).
8. SPA calls your API with Authorization: Bearer <access_token>. Your API verifies it.
\`\`\`

**Browser code (Web Crypto API)**

\`\`\`javascript
function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');
}

export async function startLogin() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32))); // 43 chars
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64url(new Uint8Array(digest));
  const state = crypto.randomUUID();

  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: \`\${location.origin}/callback\`,
    scope: 'openid profile email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  location.assign(\`https://auth.example.com/authorize?\${params}\`);
}
\`\`\`

I checked in Node that this challenge equals \`createHash('sha256').update(verifier).digest('base64url')\`.

**What protects what:**
- **PKCE** — stops a **stolen code** from being used. An attacker who grabs the code (from logs, history, or a malicious app on the same redirect) doesn't have the verifier, so the token request fails.
- **state** — stops **login CSRF**: an attacker tricking your app into finishing *their* login. If state doesn't match what you saved, you reject the callback.
- **Implicit flow** returned the access token directly in the URL fragment. Tokens leaked via browser history, referrer headers and extensions, and there was no PKCE-style proof. OAuth 2.1 removes it.

**Best practice:** for higher security, use the **BFF pattern** (Backend-for-Frontend): your Node server does steps 6-7 with a real client secret, keeps the tokens server-side, and gives the browser only an \`httpOnly\` session cookie. Then no token is ever readable by JavaScript.`,
      followUps: [
        {
          q: 'OAuth vs OpenID Connect?',
          a: 'OAuth 2.0 is about **authorization** (an access token to call APIs). OIDC adds **authentication** on top: an `id_token` (a JWT with who the user is: `sub`, `email`) and a `/userinfo` endpoint. "Sign in with Google" is OIDC.',
        },
        {
          q: 'Where should the SPA store the access token?',
          a: 'Best: nowhere in JS (BFF + httpOnly cookie). Next best: in memory (a JS variable), refreshed silently. Avoid localStorage — any XSS can read it.',
        },
      ],
    },
    {
      id: 'duplicate-orders-on-retry',
      title: 'Customers are getting duplicate orders — find and fix the cause',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'idempotency-key',
      question: `Support reports that ~0.5% of customers get **two identical orders** (and two charges). Logs show two \`POST /orders\` requests from the same user, 1–30 seconds apart, both returning 201.

The checkout flow: React \`Place order\` button → \`POST /orders\` → server creates the order in MongoDB → charges the card with Stripe → returns 201. The API sits behind a load balancer with a 30s timeout, and the mobile app retries failed requests up to 2 times.

What are the possible causes, and how do you fix it **end to end**? What do you do about the existing duplicates?`,
      hints: [
        'List every place a request can be sent twice: the user, the client code, the network layer, the load balancer.',
        'Disabling the button helps but is not enough. Why? (Think timeouts and mobile retries.)',
        'Give every checkout attempt a unique id that the server can enforce with a unique index.',
      ],
      solution: `**Idea:** you cannot stop duplicate *requests* — networks retry. You make the *operation* idempotent: the same checkout attempt can only create one order and one charge.

**Likely causes**
1. **Double click** on "Place order" (two requests at once).
2. **Client retry after a timeout:** the order was created, but the response was slow (Stripe call + DB) and hit the 30s load-balancer timeout. The app saw an error and retried.
3. **Automatic retries** by the mobile HTTP client or a proxy on 502/504.
4. The user pressed **back** and submitted again.

**Fix — layer by layer**

\`\`\`javascript
// 1. Client: one key per checkout attempt, reused on every retry
const [checkoutId] = useState(() => crypto.randomUUID()); // created once per checkout page
const [submitting, setSubmitting] = useState(false);

async function placeOrder() {
  if (submitting) return;   // stop double clicks
  setSubmitting(true);
  try {
    await api.post('/orders', cart, { headers: { 'Idempotency-Key': checkoutId } });
  } finally {
    setSubmitting(false);
  }
}
\`\`\`

\`\`\`javascript
// 2. Database: the real guarantee
orderSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

// 3. Server
app.post('/orders', auth, async (req, res) => {
  const key = req.get('Idempotency-Key');
  if (!key) return res.status(400).json({ error: 'Idempotency-Key required' });

  let order;
  try {
    order = await Order.create({ userId: req.user.id, idempotencyKey: key, items: req.body.items, status: 'pending' });
  } catch (err) {
    if (err.code !== 11000) throw err; // 11000 = duplicate key in MongoDB
    // A retry: return the existing order instead of creating a new one
    order = await Order.findOne({ userId: req.user.id, idempotencyKey: key });
    return res.status(200).json(order);
  }

  // 4. Stripe: same key -> Stripe will not charge twice either
  const payment = await stripe.paymentIntents.create(
    { amount: order.totalCents, currency: 'usd', customer: req.user.stripeId, confirm: true, payment_method: req.body.paymentMethodId },
    { idempotencyKey: \`order-\${order.id}\` },
  );

  order.status = 'paid';
  order.paymentIntentId = payment.id;
  await order.save();
  res.status(201).json(order);
});
\`\`\`

**Why it works:** the unique index makes a second order with the same key **impossible**, even with two servers handling the two requests at the same moment. A check like "find, then insert" would race. The Stripe idempotency key protects the charge in the same way.

**Also:**
- Make checkout faster than the gateway timeout. Or return **202** quickly and confirm payment via Stripe **webhooks**.
- Handle the "pending order whose retry arrives while the first is still running" case: return 409 or the current pending state, and let the client poll.
- **Existing duplicates:** query orders with the same user + same items within a short window, refund the extra charges in Stripe, cancel the extra orders, and email the affected customers. Add an alert on a "duplicate charges" metric so it is caught early next time.`,
      followUps: [
        {
          q: 'Why not dedupe by "same user + same cart within 1 minute"?',
          a: 'It blocks real repeat purchases and still races under concurrency. A client-generated key captures intent exactly: retry = same key, new purchase = new key.',
        },
        {
          q: 'Where else do you need idempotency in this flow?',
          a: 'Webhook handlers (Stripe sends the same event more than once — dedupe by event id), queue consumers (at-least-once delivery), and any cron job that might run twice.',
        },
      ],
    },
    {
      id: 'sliding-window-rate-limiter',
      title: 'Implement a sliding window rate limiter (in memory and Redis)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'rate-limiting',
      question: `Your login endpoint uses a **fixed window** limit: 5 attempts per minute, reset at the start of each minute. An attacker sends 5 requests at 0:59 and 5 more at 1:00 — **10 attempts in 2 seconds**.

1. Implement a **sliding window log** limiter: "at most \`limit\` requests in any \`windowMs\` period".
2. It must work across **many Node servers** — show the Redis version.
3. Explain the **sliding window counter** variant and when you'd prefer it.

\`\`\`javascript
const limiter = new SlidingWindowLog({ limit: 3, windowMs: 1000 });
limiter.allow('ip:1.2.3.4'); // true / false
\`\`\``,
      hints: [
        'Keep a list of timestamps per key. On each request, drop timestamps older than `now - windowMs`, then count.',
        'In Redis, a **sorted set** (ZSET) with the timestamp as the score fits perfectly: `ZREMRANGEBYSCORE`, `ZCARD`, `ZADD`.',
        'The count-then-add must be atomic across servers — use a Lua script.',
      ],
      solution: `**Idea:** remember when each request happened. A request is allowed only if fewer than \`limit\` requests happened in the last \`windowMs\`. The window "slides" with time, so there is no boundary to abuse.

**1. In memory (one server)**

\`\`\`javascript
export class SlidingWindowLog {
  constructor({ limit, windowMs, now = () => Date.now() }) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
    this.logs = new Map(); // key -> array of timestamps (oldest first)
  }

  allow(key) {
    const t = this.now();
    const log = this.logs.get(key) ?? [];

    // Drop requests that have left the window
    while (log.length && log[0] <= t - this.windowMs) log.shift();

    if (log.length >= this.limit) {
      this.logs.set(key, log);
      return false; // rejected requests are NOT recorded
    }
    log.push(t);
    this.logs.set(key, log);
    return true;
  }
}

// limit 3 per 1000 ms, fake clock:
// t=0 true, 100 true, 200 true, 300 false, 999 false,
// t=1000 true (t=0 left the window), 1001 false, 1100 true, 1150 false
\`\`\`

**2. Redis (many servers) — atomic Lua script**

\`\`\`javascript
import Redis from 'ioredis';
import crypto from 'node:crypto';
const redis = new Redis(process.env.REDIS_URL);

const SCRIPT = \`
local key    = KEYS[1]
local now    = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit  = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)  -- drop old entries
if redis.call('ZCARD', key) >= limit then return 0 end
redis.call('ZADD', key, now, ARGV[4])                 -- unique member per request
redis.call('PEXPIRE', key, window)                    -- idle keys clean themselves up
return 1
\`;

export async function allow(key, { limit, windowMs }) {
  const ok = await redis.eval(SCRIPT, 1, \`rl:\${key}\`, Date.now(), windowMs, limit, crypto.randomUUID());
  return ok === 1;
}
\`\`\`

Redis runs a Lua script as one atomic step, so two servers can't both read "4" and both add the 5th request.

**3. Sliding window counter (cheaper approximation)**

Keep only two counters per key: the current fixed window and the previous one. Estimate:

\`\`\`text
estimated = previousCount * (1 - elapsedFractionOfCurrentWindow) + currentCount
\`\`\`

Example: limit 10/min, previous minute had 10, we are 15s (25%) into this minute → \`10 * 0.75 + current\`. The limiter checks the estimate *before* counting the new request: 7.5, 8.5 and 9.5 are all under 10, so 3 requests pass; the 4th sees 10.5 and is blocked. I ran this in Node and got exactly that.

**Trade-offs:**
- **Log:** exact, but memory is O(limit) per key. Fine for small limits like logins (5/min). Bad for 10,000 req/min per key.
- **Counter:** O(1) memory, very close to exact (assumes requests in the previous window were spread evenly). Good for high-volume API quotas.

**Complexity (log):** O(k) per request in the worst case, where k is how many old entries expire (amortized O(1)); Redis ZSET operations are O(log n).`,
      followUps: [
        {
          q: 'Fail open or fail closed if Redis is down?',
          a: 'Usually fail **open** for general API limits (don\'t take the whole API down because of the limiter) with an alert. For security-sensitive limits like login or OTP attempts, consider failing **closed** or falling back to a local in-memory limiter.',
        },
        {
          q: 'Where should rate limiting live?',
          a: 'Coarse limits at the edge (API gateway, Cloudflare, Nginx) to absorb floods cheaply. Fine-grained business limits (per user plan, per endpoint) in the app, backed by Redis.',
        },
      ],
    },
    {
      id: 'refresh-token-rotation-reuse',
      title: 'Implement refresh token rotation with reuse detection',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'jwt-access-refresh',
      question: `Your app uses a short-lived JWT **access token** (15 min) and a long-lived **refresh token** (30 days) in an \`httpOnly\` cookie.

Security asks for:
1. **Rotation:** each \`POST /auth/refresh\` returns a new refresh token and the old one stops working.
2. **Reuse detection:** if an **old** (already used) refresh token is ever presented, assume it was stolen and log the user out on **all devices of that login session**.
3. **Logout** that really revokes the refresh token.

Implement the refresh endpoint and the token storage logic.`,
      hints: [
        'Refresh tokens should be random strings stored (hashed) in the DB, not JWTs you can\'t revoke.',
        'Group all tokens from one login into a **family** (`familyId`). Mark tokens as `used` instead of deleting them.',
        'If a `used` token comes back, revoke the whole family.',
      ],
      solution: `**Idea:** each refresh token can be used **once**. Using it gives you the next token in the same "family". If someone presents a token that was already used, two parties have the same token — one of them is an attacker — so kill the whole family.

\`\`\`javascript
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Schema: { tokenHash (unique), userId, familyId, used, revoked, expiresAt }
async function issueRefreshToken(userId, familyId = crypto.randomUUID()) {
  const raw = crypto.randomBytes(32).toString('base64url'); // random, not a JWT
  await RefreshToken.create({
    tokenHash: sha256(raw), // store only the hash: a DB leak doesn't leak tokens
    userId,
    familyId,
    used: false,
    revoked: false,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  return raw;
}

const issueAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

const cookieOpts = {
  httpOnly: true,           // JS can't read it (XSS)
  secure: true,             // HTTPS only
  sameSite: 'strict',       // not sent on cross-site requests (CSRF)
  path: '/auth',            // only sent to auth routes
  maxAge: REFRESH_TTL_MS,
};

app.post('/auth/refresh', async (req, res) => {
  const raw = req.cookies.refreshToken;
  if (!raw) return res.sendStatus(401);

  // Atomically flip used: false -> true, so two parallel requests can't both succeed
  const record = await RefreshToken.findOneAndUpdate(
    { tokenHash: sha256(raw), used: false, revoked: false, expiresAt: { $gt: new Date() } },
    { $set: { used: true } },
  );

  if (!record) {
    // Unknown, expired, revoked — or ALREADY USED (reuse!)
    const old = await RefreshToken.findOne({ tokenHash: sha256(raw) });
    if (old?.used && !old.revoked) {
      await RefreshToken.updateMany({ familyId: old.familyId }, { $set: { revoked: true } });
      securityLog.warn('refresh_token_reuse', { userId: old.userId, familyId: old.familyId });
    }
    res.clearCookie('refreshToken', { path: '/auth' });
    return res.sendStatus(401);
  }

  const newRefresh = await issueRefreshToken(record.userId, record.familyId); // same family
  res.cookie('refreshToken', newRefresh, cookieOpts);
  res.json({ accessToken: issueAccessToken(record.userId) });
});

app.post('/auth/logout', async (req, res) => {
  const raw = req.cookies.refreshToken;
  if (raw) {
    const rec = await RefreshToken.findOne({ tokenHash: sha256(raw) });
    if (rec) await RefreshToken.updateMany({ familyId: rec.familyId }, { $set: { revoked: true } });
  }
  res.clearCookie('refreshToken', { path: '/auth' });
  res.sendStatus(204);
});
\`\`\`

I simulated the logic in Node: token A → refresh → B (200); B → C (200); presenting **A again** → 401 "reuse detected" and the family is revoked; then **C** (the newest) → 401 too.

**Why it works:**
- An attacker who steals a refresh token races the real user. Whoever uses it **second** presents a used token → reuse detected → both are logged out, and the user must log in again with their password. The attacker's window is very small.
- The atomic \`findOneAndUpdate\` with \`used: false\` in the filter makes "check and mark" one step.
- Storing hashes means a DB leak doesn't give working tokens.

**Edge case — false alarms:** two browser tabs refresh at the same moment, one gets 401 for "reuse". Fix: a short grace period (e.g. a used token is still accepted for 10 seconds and returns the same new token), or make the frontend share one in-flight refresh promise.

**Cleanup:** a TTL index on \`expiresAt\` deletes old rows automatically.`,
      followUps: [
        {
          q: 'Why not just make the access token last 30 days?',
          a: 'A JWT can\'t be revoked before it expires (the server doesn\'t look it up). A stolen 30-day token is a 30-day breach. Short access tokens limit the damage; the refresh token is checked in the DB, so it *can* be revoked.',
        },
        {
          q: 'How do you log a user out of all devices (e.g. after a password change)?',
          a: 'Revoke all refresh tokens for that user (`updateMany({ userId })`). Access tokens still live up to 15 minutes; if that is too long, store a `tokenVersion` on the user, put it in the JWT, and reject tokens with an older version.',
        },
      ],
    },
    {
      id: 'bulk-import-partial-failures',
      title: 'Design a bulk contact import with partial failures',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'bulk-operations',
      question: `A CRM lets users import contacts:
- From the UI, a user can paste up to **100 contacts** at once.
- From a CSV upload, a file can have up to **50,000 rows**.

Some rows will be bad (invalid email, duplicate, missing name). Good rows must still be imported.

Design the API: endpoints, request/response shapes, status codes, how the client learns which rows failed and why, and how to make re-running an import safe.`,
      hints: [
        '100 items can be handled in one request. 50,000 rows cannot — it will time out. Which pattern do you use for slow work?',
        'For the sync batch, return a result **per item**, in the same order as the input.',
        'Use upsert by a natural key (email) so running the same file twice does not create duplicates.',
      ],
      solution: `**Idea:** two shapes for two sizes. **Small batch → synchronous** with per-item results. **Large file → asynchronous job** (202 + status URL + error report).

**A. Small batch (≤ 100 items, synchronous)**

\`\`\`text
POST /contacts/batch
{ "items": [ { "email": "a@x.com", "name": "A" }, { "email": "bad", "name": "B" } ] }

200 OK            (some teams use 207 Multi-Status; be consistent)
{
  "summary": { "total": 2, "succeeded": 1, "failed": 1 },
  "results": [
    { "index": 0, "status": "created", "id": "c_91" },
    { "index": 1, "status": "error", "error": { "code": "INVALID_EMAIL", "field": "email" } }
  ]
}
\`\`\`

- Return **400** only when the *whole request* is wrong (not an array, more than 100 items).
- Results keep the input order and include \`index\`, so the UI can highlight row 2.

**B. Large CSV (async job)**

\`\`\`text
1. POST /imports                     { "fileId": "f_77", "mode": "upsert" }   (file uploaded via presigned URL)
   -> 202 Accepted, Location: /imports/imp_5
   { "id": "imp_5", "status": "queued" }

2. GET /imports/imp_5
   -> 200 { "id": "imp_5", "status": "processing", "processed": 20000, "total": 50000,
            "succeeded": 19870, "failed": 130 }

3. When done: "status": "completed" (or "completed_with_errors"),
   "errorReportUrl": "/imports/imp_5/errors.csv"   -> original row + line number + reason

4. Optional: webhook / email / SSE "import finished" so the client doesn't need to poll.
\`\`\`

**Worker (chunked, idempotent):**

\`\`\`javascript
// Runs in a queue worker (e.g. BullMQ), not in the HTTP request
async function processImport(importId) {
  const job = await Import.findById(importId);
  const rows = parseCsvStream(await openFile(job.fileId));

  for await (const chunk of inChunks(rows, 1000)) {
    const valid = [];
    for (const row of chunk) {
      const parsed = contactSchema.safeParse(row.data); // Zod validation
      if (parsed.success) valid.push({ line: row.line, data: parsed.data });
      else await ImportError.create({ importId, line: row.line, reason: parsed.error.issues[0].message });
    }

    // Upsert by email: running the same file twice updates instead of duplicating
    const ops = valid.map(({ data }) => ({
      updateOne: {
        filter: { orgId: job.orgId, email: data.email.toLowerCase() },
        update: { $set: { ...data, orgId: job.orgId } },
        upsert: true,
      },
    }));

    let failed = 0;
    try {
      await Contact.bulkWrite(ops, { ordered: false }); // keep going after a bad row
    } catch (err) {
      // With ordered:false the driver reports each failed op with its index
      for (const we of err.writeErrors ?? []) {
        failed++;
        await ImportError.create({ importId, line: valid[we.index].line, reason: we.errmsg });
      }
      if (!err.writeErrors) throw err; // a real outage: let the queue retry the job
    }

    await Import.updateOne({ _id: importId }, {
      $inc: { processed: chunk.length, succeeded: valid.length - failed, failed: chunk.length - valid.length + failed },
    });
  }
  await Import.updateOne({ _id: importId }, { $set: { status: 'completed' } });
}
\`\`\`

**Why it works:**
- The HTTP request returns in milliseconds; the heavy work runs in a worker that can retry.
- Partial success is a normal outcome, reported per row, not a 500.
- **Upsert by email** makes re-runs and queue retries safe (idempotent).
- Chunks of 1,000 keep memory flat and give progress updates.

**Edge cases:** limit file size and row count up front; strip formula prefixes (\`=\`, \`+\`, \`-\`, \`@\`) in the error CSV to avoid CSV injection in Excel; decide whether the import is "all or nothing" (rare — use a staging collection and swap) or "best effort" (usual).`,
      followUps: [
        {
          q: '207 Multi-Status or 200 for partial success?',
          a: '207 comes from WebDAV and says "look inside for each result". Many APIs just return 200 with per-item results. What matters is consistency and documenting that the client must check each item.',
        },
        {
          q: 'How would you let the user cancel a running import?',
          a: '`POST /imports/:id/cancel` (or `PATCH { "status": "cancelling" }`). The worker checks the status between chunks and stops. Rows already imported stay, so the UI should show how many were saved.',
        },
      ],
    },
    {
      id: 'unreliable-third-party-api',
      title: 'Make calls to a slow, flaky third-party API resilient',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'retries-timeouts',
      question: `Your \`GET /quotes\` endpoint calls a third-party shipping-rates API. That API is sometimes slow (20+ seconds) and sometimes returns 503. When it is down, **your** API also becomes slow, Node requests pile up, and the whole service gets sluggish.

\`\`\`javascript
app.get('/quotes', async (req, res) => {
  const r = await fetch(\`https://rates.example.com/v1/quote?zip=\${req.query.zip}\`);
  res.json(await r.json());
});
\`\`\`

Make it resilient. Write code for:
1. a **timeout**,
2. **retries** with exponential backoff and jitter — only for errors where a retry makes sense,
3. a **circuit breaker**,
4. a **fallback** when the provider is unavailable.`,
      hints: [
        '`fetch` has no default timeout. `AbortSignal.timeout(ms)` gives you one.',
        'Retry 5xx, 429 and timeouts. Never retry a 400 — it will fail the same way. Add random jitter so all clients don\'t retry at the same moment.',
        'A circuit breaker counts failures. After N in a row it "opens" and fails instantly for a while, then lets one test request through ("half-open").',
      ],
      solution: `**Idea:** never wait forever, retry only what can succeed on retry, stop calling a dependency that is clearly down, and serve something useful instead.

\`\`\`javascript
// 1. Timeout + error with status
async function fetchJson(url, timeoutMs) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) }); // throws TimeoutError
  if (!res.ok) {
    const err = new Error(\`Upstream \${res.status}\`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// 2. Retry with exponential backoff + full jitter
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isRetryable = (err) =>
  err.name === 'TimeoutError' || err.status === 429 || err.status >= 500 || err.cause?.code === 'ECONNRESET';

async function withRetry(fn, { retries = 2, baseMs = 200 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err) || attempt >= retries) throw err;
      await sleep(Math.random() * baseMs * 2 ** attempt); // 0-200ms, 0-400ms, ...
    }
  }
}

// 3. Circuit breaker: CLOSED -> OPEN -> HALF_OPEN -> CLOSED
class CircuitBreaker {
  constructor(fn, { failureThreshold = 5, resetTimeoutMs = 30_000, now = () => Date.now() } = {}) {
    Object.assign(this, { fn, failureThreshold, resetTimeoutMs, now });
    this.state = 'CLOSED';
    this.failures = 0;
    this.openedAt = 0;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (this.now() - this.openedAt < this.resetTimeoutMs) {
        throw new Error('Circuit open: failing fast'); // don't even try
      }
      this.state = 'HALF_OPEN'; // cool-down over: allow a test request
    }
    try {
      const result = await this.fn(...args);
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (err) {
      this.failures++;
      if (this.state === 'HALF_OPEN' || this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        this.openedAt = this.now();
      }
      throw err;
    }
  }
}

const ratesBreaker = new CircuitBreaker(
  (zip) => withRetry(() => fetchJson(\`https://rates.example.com/v1/quote?zip=\${encodeURIComponent(zip)}\`, 3000)),
  { failureThreshold: 5, resetTimeoutMs: 30_000 },
);

// 4. Endpoint with fallback
app.get('/quotes', async (req, res) => {
  const zip = String(req.query.zip ?? '');
  if (!/^\\d{5}$/.test(zip)) return res.status(400).json({ error: 'Invalid zip' });

  try {
    const quote = await ratesBreaker.call(zip);
    await cache.set(\`quote:\${zip}\`, quote, { ttlSec: 3600 }); // remember last good answer
    res.json({ ...quote, stale: false });
  } catch (err) {
    const cached = await cache.get(\`quote:\${zip}\`);
    if (cached) return res.json({ ...cached, stale: true }); // degraded but useful
    res.status(503).set('Retry-After', '30').json({ error: 'Shipping rates temporarily unavailable' });
  }
});
\`\`\`

I tested the pieces in Node: a 503 → 503 → success sequence succeeds on the 3rd attempt; a 400 is not retried; with threshold 3 the breaker opens after 3 failures, the next calls fail instantly without calling the API, and after the cool-down one successful call closes it again. \`AbortSignal.timeout\` throws an error named \`TimeoutError\`.

**Why it works:**
- **Timeout** frees your server quickly instead of holding sockets and memory for 20+ seconds.
- **Backoff + jitter** gives the provider time to recover and spreads retries out. Without jitter, thousands of clients retry at the same instant (a "thundering herd").
- **Circuit breaker** stops wasting time and money on a dependency that is down, and gives it room to recover.
- **Fallback** turns an outage into a "slightly stale" answer for users.

**Budget:** worst case = 3 attempts × 3s + backoff ≈ 10s. Keep that under your own gateway timeout, or reduce retries. Only retry **idempotent** calls (a GET quote is safe; a POST "create shipment" needs an idempotency key first). In production you can use a library like \`opossum\` (circuit breaker) or \`p-retry\`.`,
      followUps: [
        {
          q: 'What does "full jitter" mean?',
          a: 'Instead of waiting exactly 200, 400, 800 ms, wait a random time between 0 and that value. AWS showed this spreads load best and reduces total work during recovery.',
        },
        {
          q: 'What if the third-party call is not needed for the response?',
          a: 'Take it out of the request path entirely: put a job on a queue (SQS, BullMQ), return 202, and let a worker call the API with its own retries and a dead-letter queue for permanent failures.',
        },
        {
          q: 'What is the "bulkhead" pattern?',
          a: 'Limit how many requests can call one dependency at the same time (e.g. max 20 concurrent calls to the rates API). If it hangs, only that pool is stuck; the rest of your API keeps working.',
        },
      ],
    },
    {
      id: 'design-webhook-delivery-system',
      title: 'Design a reliable outgoing webhook system',
      difficulty: 'hard',
      type: 'design',
      frequency: 'occasional',
      relatedTopic: 'webhooks',
      question: `You run a SaaS payments product. Customers register a URL, and you must send them events like \`invoice.paid\` and \`subscription.cancelled\` — just like Stripe does.

Design the **sending** side:
- how events are created so none are lost if the server crashes,
- how they are delivered, signed and retried,
- what happens when a customer's endpoint is down for 2 days,
- how customers can debug and replay deliveries,
- security risks of calling user-provided URLs.`,
      hints: [
        'Writing the business change and "send a webhook" in two separate steps can lose events. Look up the **transactional outbox** pattern.',
        'Delivery is "at least once": receivers must dedupe by event id, so include a stable id in every event.',
        'A user-provided URL could point to `http://169.254.169.254` or `localhost`. What attack is that?',
      ],
      solution: `**Idea:** save the event in the **same DB transaction** as the business change, deliver it from a queue with signed requests and exponential-backoff retries, and keep a delivery log that customers can see and replay.

\`\`\`text
                (same transaction)
API request -> [ invoices update + events insert (outbox) ]
                             |
                  outbox relay / change stream
                             v
                      queue (SQS / BullMQ)
                             v
             delivery workers  --(signed POST, 10s timeout)-->  customer URL
                   |   2xx -> mark delivered
                   |   else -> schedule retry with backoff
                   v
        delivery_attempts log (status, latency, response code)  -> dashboard + "Replay" button
                   |
        after ~3 days of failures -> mark failed, email customer, disable endpoint
\`\`\`

**Event payload (stable id, type, time, data):**

\`\`\`json
{
  "id": "evt_01J9X",
  "type": "invoice.paid",
  "created": 1760000000,
  "apiVersion": "2026-01-01",
  "data": { "object": { "id": "in_77", "amountPaid": 4999, "currency": "usd" } }
}
\`\`\`

**Delivery worker:**

\`\`\`javascript
import crypto from 'node:crypto';

// 30s, 1m, 2m, 4m ... capped at 6h; ~15 attempts covers about 3 days
const backoffSec = (attempt) => Math.min(30 * 2 ** attempt, 6 * 60 * 60);

async function deliver(delivery) {
  const endpoint = await Endpoint.findById(delivery.endpointId);
  const body = JSON.stringify(delivery.event);
  const t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', endpoint.secret).update(\`\${t}.\${body}\`).digest('hex');

  let status = 0;
  try {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': \`t=\${t},v1=\${sig}\`,
        'X-Event-Id': delivery.event.id,
      },
      body,
      redirect: 'manual',                 // don't follow redirects to internal hosts
      signal: AbortSignal.timeout(10_000),
    });
    status = res.status;
  } catch {
    status = 0; // timeout / DNS / connection error
  }

  await DeliveryAttempt.create({ deliveryId: delivery.id, status, at: new Date() });

  if (status >= 200 && status < 300) {
    return Delivery.updateOne({ _id: delivery.id }, { $set: { state: 'delivered' } });
  }
  if (delivery.attempts + 1 >= 15) {
    await Delivery.updateOne({ _id: delivery.id }, { $set: { state: 'failed' } });
    return notifyCustomerEndpointFailing(endpoint); // and disable it after repeated failures
  }
  await Delivery.updateOne({ _id: delivery.id }, { $inc: { attempts: 1 } });
  await queue.add('deliver', { deliveryId: delivery.id }, { delay: backoffSec(delivery.attempts) * 1000 });
}
\`\`\`

**Key decisions:**
- **Outbox:** if the server crashes after committing the invoice, the event row is already committed too, and a relay process will publish it. Never "update DB, then publish to queue" as two separate steps — a crash between them loses the event.
- **At-least-once:** retries and relay restarts can send the same event twice. Document it: receivers dedupe by \`id\`.
- **Ordering is not guaranteed** (a retry of event 1 can arrive after event 2). Include \`created\`, and tell receivers to re-fetch the object when order matters.
- **Isolation:** one slow customer must not delay others. Short timeouts, a concurrency limit per endpoint, and separate queues or rate limits for noisy endpoints.
- **Debugging:** a dashboard showing each attempt (status, latency, response snippet), a "Send test event" button, and "Replay" for one event or a time range.
- **Signing secret per endpoint**, shown once, rotatable with an overlap period.

**Security — SSRF (Server-Side Request Forgery):** a customer could register \`http://169.254.169.254/latest/meta-data\` (cloud credentials) or \`http://localhost:6379\`. Require HTTPS, resolve DNS and block private, loopback and link-local IP ranges **at connect time** (DNS can change after you validate), don't follow redirects, and send from a separate network zone with no access to internal services.`,
      followUps: [
        {
          q: 'Why not just call the customer URL inside the API request that paid the invoice?',
          a: 'The customer endpoint might be slow or down, which would make your API slow or fail the payment. Webhooks must be asynchronous and independent from the main request.',
        },
        {
          q: 'How do you implement the outbox relay with MongoDB?',
          a: 'Insert the event into an `events` collection inside the same multi-document transaction as the business write. Then either poll for unpublished events (mark them published after enqueueing) or use a **change stream** on the collection to push new events to the queue, saving the resume token so nothing is skipped after a restart.',
        },
      ],
    },
  ],
};
