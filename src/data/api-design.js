// API Design & Communication — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'api-design',
  title: 'API Design & Communication',
  icon: '🔌',
  description: 'How services talk to each other: REST, HTTP, auth (JWT, OAuth, SSO), real-time (WebSockets, Socket.IO, SSE, WebRTC), GraphQL, gRPC, caching, rate limiting, webhooks and uploads — in plain English.',
  definitionTitle: 'What is API design?',
  definition: `An **API (Application Programming Interface)** is a set of rules that lets two programs talk to each other — for example, your React app asking your server for a user's profile.

**API design** is deciding **how** that conversation works: the URLs, HTTP methods (GET, POST…), request and response shapes, status codes, authentication (JWT, OAuth), pagination, versioning and error format. It also covers **communication styles**: REST, GraphQL, gRPC, WebSockets, webhooks and WebRTC.

**One-line answer:** "API design is defining a clear, consistent and secure contract — endpoints, methods, data formats, auth and errors — so clients and services can communicate reliably."`,
  topics: [
    {
      id: 'rest-principles',
      title: 'REST Principles',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'REST is a style for designing APIs around resources (nouns) and standard HTTP methods (verbs), with stateless requests.',
      what: `**REST** (Representational State Transfer) is a set of rules for designing web APIs. It is a style, not a library or a standard.

The main ideas:
- Everything is a **resource** (a thing): a user, an order, a product. Each resource has a URL, like \`/users/42\`.
- You act on resources with **HTTP methods**: \`GET\` to read, \`POST\` to create, \`PUT\`/\`PATCH\` to update, \`DELETE\` to remove.
- Each request is **stateless**: it carries everything the server needs (like the auth token). The server does not remember the previous request.
- Data usually travels as **JSON** (the "representation" of the resource).

#### Deeper version
Roy Fielding defined REST with six constraints:
1. **Client-server** — UI and data storage are separated.
2. **Stateless** — no session state on the server between requests.
3. **Cacheable** — responses say whether they can be cached.
4. **Uniform interface** — resources identified by URLs, changed through representations, self-descriptive messages, and **HATEOAS** (responses include links to next actions).
5. **Layered system** — the client cannot tell if it talks to the real server or a proxy/load balancer.
6. **Code on demand** (optional) — the server can send runnable code.

Most "REST APIs" in real life are really "RESTful-ish JSON over HTTP". They follow resources + methods + status codes but skip HATEOAS. That is normal, and it is fine to say so in an interview.`,
      why: `Without shared rules every API looks different: \`/getUser\`, \`/fetchAllOrders\`, \`/deleteProductNow\`. REST gives a predictable shape. A new developer can guess the endpoints. Statelessness makes it easy to scale: any server behind the load balancer can handle any request. Caching rules let browsers and CDNs reuse responses.`,
      analogy: `Think of a library. Every book (resource) has a fixed shelf number (URL). You can do only a few standard actions at the desk: borrow (GET), donate (POST), replace (PUT), remove (DELETE). The librarian does not remember you — you show your library card (token) every single time.`,
      code: [
        {
          title: 'Resource-based routes in Express',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();
app.use(express.json());

const users = new Map([[1, { id: 1, name: 'Asha' }]]);
let nextId = 2;

// Nouns in URLs, verbs come from the HTTP method
app.get('/users', (req, res) => res.json([...users.values()]));

app.get('/users/:id', (req, res) => {
  const user = users.get(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/users', (req, res) => {
  const user = { id: nextId++, name: req.body.name };
  users.set(user.id, user);
  res.status(201).location(\`/users/\${user.id}\`).json(user); // 201 Created
});

app.delete('/users/:id', (req, res) => {
  users.delete(Number(req.params.id));
  res.status(204).end(); // 204 No Content
});

app.listen(3000);`,
        },
        {
          title: 'Good vs bad URL design',
          lang: 'text',
          code: `BAD                          GOOD
GET  /getAllUsers            GET    /users
POST /createUser             POST   /users
POST /deleteUser?id=5        DELETE /users/5
GET  /user/5/getOrders       GET    /users/5/orders   (nested resource)
POST /users/5/activate       POST   /users/5/activation  (or PATCH /users/5 {"active":true})`,
        },
      ],
      output: `\`GET /users\` returns the list. \`POST /users\` with \`{"name":"Ravi"}\` returns **201 Created**, a \`Location: /users/2\` header and the new user. \`GET /users/99\` returns **404**. \`DELETE /users/1\` returns **204** with no body.

The second block shows the habit interviewers look for: plural nouns in URLs, no verbs, and nesting only for clear parent-child relations.`,
      questions: [
        { q: 'What does stateless mean in REST?', a: 'Each request contains all the information needed to process it, such as the auth token. The server keeps no session memory between requests, so any server instance can handle any request.' },
        { q: 'What is HATEOAS?', a: 'Hypermedia As The Engine Of Application State. The response includes links to related actions, like `"links": { "cancel": "/orders/5/cancel" }`, so the client can discover what to do next. Few real APIs use it fully.' },
        { q: 'Should URLs contain verbs?', a: 'No. URLs name resources (nouns). The HTTP method is the verb. For actions that do not fit CRUD, model them as a sub-resource, like `POST /orders/5/cancellation`.' },
        { q: 'Is REST tied to JSON or HTTP?', a: 'In theory no; REST is an architectural style. In practice almost every REST API uses HTTP and JSON.' },
      ],
      spoken: `"REST is an architectural style for APIs. I model everything as resources with clear URLs, like \`/users/42/orders\`, and I use HTTP methods as the verbs — GET to read, POST to create, PUT or PATCH to update, DELETE to remove. Requests are stateless, so every call carries its own auth token, which makes horizontal scaling easy. I return proper status codes like 201 for create and 404 for not found, and I make responses cacheable where it makes sense. Most real APIs skip HATEOAS, and I'm honest that mine are RESTful rather than strictly REST."`,
      mistakes: [
        'Putting verbs in URLs like `/getUsers` or `/deleteUser`. The method already says the action.',
        'Returning `200 OK` with `{ "error": "not found" }` in the body. Use the right status code.',
        'Storing session state in server memory, which breaks when you add a second server.',
        'Follow-up trap: "Are cookies allowed in a stateless API?" Yes. Stateless means the server does not keep conversation state between requests; the client may still send a cookie or token with each request.',
      ],
      takeaway: 'REST = resources as nouns in URLs + HTTP methods as verbs + stateless requests + correct status codes.',
    },
    {
      id: 'http-methods',
      title: 'HTTP Methods (Safe & Idempotent)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'GET reads, POST creates, PUT replaces, PATCH partly updates, DELETE removes — and each is safe and/or idempotent or not.',
      what: `HTTP methods tell the server **what you want to do** with a resource.

- \`GET\` — read data. No body changes on the server.
- \`POST\` — create something new, or trigger an action.
- \`PUT\` — **replace** the whole resource with what you send.
- \`PATCH\` — **partly update** the resource (only the fields you send).
- \`DELETE\` — remove the resource.
- \`HEAD\` — like GET but only headers, no body.
- \`OPTIONS\` — ask what is allowed (used by CORS preflight).

Two important words:
- **Safe** = does not change data on the server (GET, HEAD, OPTIONS).
- **Idempotent** = doing it once or 10 times leaves the server in the **same state** (GET, PUT, DELETE, HEAD, OPTIONS).

#### Deeper version
- \`GET\` — safe: yes, idempotent: yes, body: no (by convention).
- \`POST\` — safe: no, idempotent: **no**, body: yes.
- \`PUT\` — safe: no, idempotent: yes, body: yes.
- \`PATCH\` — safe: no, idempotent: not guaranteed, body: yes.
- \`DELETE\` — safe: no, idempotent: yes, body: usually no.

Idempotent is about **server state**, not the response. A second \`DELETE /users/5\` may return 404 instead of 204, but the state is the same: user 5 is gone.

PATCH can be idempotent (\`{"name":"Asha"}\`) or not (\`{"op":"increment","path":"/count"}\`), so the spec does not promise it.`,
      why: `Methods tell browsers, proxies, CDNs and retry logic how to behave. Caches only cache GET. Clients and gateways can safely **retry** idempotent requests after a network timeout. A POST cannot be blindly retried — you might charge a card twice. Knowing this is the base for idempotency keys, caching and CORS.`,
      analogy: `Think of a light switch panel. GET is looking at whether the light is on (safe). PUT is "set the light to ON" — pressing it 5 times still leaves it ON (idempotent). POST is "add a new bulb" — pressing 5 times adds 5 bulbs (not idempotent). DELETE is "remove bulb #3" — after the first time, it is already gone.`,
      code: [
        {
          title: 'PUT vs PATCH in Express + MongoDB (Mongoose)',
          lang: 'javascript',
          code: `// PUT: replace the whole document. Missing fields are removed.
app.put('/products/:id', async (req, res) => {
  const { name, price, stock } = req.body;
  const doc = await Product.findOneAndReplace(
    { _id: req.params.id },
    { name, price, stock },
    { new: true, upsert: false }
  );
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

// PATCH: change only the fields that were sent.
app.patch('/products/:id', async (req, res) => {
  const allowed = ['name', 'price', 'stock'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );
  const doc = await Product.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});`,
        },
        {
          title: 'Calling them with fetch',
          lang: 'javascript',
          code: `const base = 'http://localhost:3000/products/abc123';
const json = { 'Content-Type': 'application/json' };

// Replace everything
await fetch(base, { method: 'PUT', headers: json,
  body: JSON.stringify({ name: 'Pen', price: 10, stock: 5 }) });

// Change only the price
await fetch(base, { method: 'PATCH', headers: json,
  body: JSON.stringify({ price: 12 }) });`,
        },
      ],
      output: `After the PUT the product is exactly \`{ name: 'Pen', price: 10, stock: 5 }\`. If the client had sent only \`{ price: 10 }\` with PUT, \`name\` and \`stock\` would be **gone**. After the PATCH only \`price\` changes to 12; \`name\` and \`stock\` stay. The \`allowed\` list in PATCH stops clients from changing fields like \`role\` or \`_id\` (this is called **mass assignment** protection).`,
      questions: [
        { q: 'What is the difference between PUT and PATCH?', a: 'PUT replaces the whole resource with the body you send. PATCH applies a partial update to only the given fields. PUT is idempotent; PATCH is not guaranteed to be.' },
        { q: 'Which methods are idempotent?', a: 'GET, HEAD, OPTIONS, PUT and DELETE. POST is not. PATCH may or may not be, depending on how it is designed.' },
        { q: 'Is DELETE idempotent if the second call returns 404?', a: 'Yes. Idempotency is about the server state, not the response code. After one or many calls, the resource is gone.' },
        { q: 'Can a GET request have a body?', a: 'The spec gives it no meaning, and many proxies and libraries drop it. Use query parameters for GET. For complex searches, use `POST /search` instead.' },
      ],
      spoken: `"HTTP methods describe the action. GET reads, POST creates, PUT replaces the full resource, PATCH updates part of it, and DELETE removes it. Two properties matter a lot: safe means no change on the server, which is GET, HEAD and OPTIONS. Idempotent means calling it many times gives the same server state — that is GET, PUT and DELETE, but not POST. This matters for retries: a gateway can safely retry a PUT after a timeout, but retrying a POST could create a duplicate order, which is why we add idempotency keys for payments."`,
      mistakes: [
        'Using GET to change data, like `GET /users/5/delete`. Crawlers, prefetchers and caches can trigger it by accident.',
        'Using PUT for partial updates and wiping out fields the client did not send.',
        'Passing `req.body` straight into an update. Whitelist fields to avoid mass assignment (a user setting `role: "admin"`).',
        'Follow-up trap: "Is idempotent the same as safe?" No. Safe means no change at all. Idempotent means repeated calls cause the same change as one call. DELETE is idempotent but not safe.',
      ],
      takeaway: 'Safe = no change; idempotent = same result if repeated. POST is neither, which is why retries need care.',
    },
    {
      id: 'status-codes',
      title: 'HTTP Status Codes',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Three-digit numbers that tell the client what happened: 2xx success, 3xx redirect, 4xx client error, 5xx server error.',
      what: `A **status code** is the three-digit number at the top of every HTTP response. The first digit tells the group:

- **1xx** — information (rare, e.g. \`101 Switching Protocols\` for WebSockets).
- **2xx** — success.
- **3xx** — redirect or "use your cached copy".
- **4xx** — the **client** did something wrong.
- **5xx** — the **server** failed.

The ones you must know:
- \`200 OK\`, \`201 Created\`, \`202 Accepted\`, \`204 No Content\`
- \`301 Moved Permanently\`, \`302 Found\`, \`304 Not Modified\`
- \`400 Bad Request\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`, \`409 Conflict\`, \`422 Unprocessable Content\`, \`429 Too Many Requests\`
- \`500 Internal Server Error\`, \`502 Bad Gateway\`, \`503 Service Unavailable\`, \`504 Gateway Timeout\`

#### Deeper version
- **401 vs 403**: 401 means "I don't know who you are" (missing or bad token). 403 means "I know who you are, but you are not allowed".
- **400 vs 422**: 400 is for a broken request (bad JSON). 422 is for valid JSON that fails business validation (email already used, price negative). Many teams just use 400 for both; be consistent.
- **409 Conflict**: the request clashes with current state (duplicate username, version mismatch).
- **202 Accepted**: "I got it and will do it later" (background jobs).
- **307/308** keep the method and body on redirect; 301/302 may let clients change POST to GET.
- **502** = the proxy got a bad answer from the upstream. **503** = server overloaded or in maintenance (send \`Retry-After\`). **504** = upstream took too long.
- Some APIs return **404 instead of 403** to hide that a resource exists.`,
      why: `Status codes let clients react without reading the body: retry on 503, refresh the token on 401, show a form error on 422, back off on 429. Monitoring tools count 5xx as errors and 4xx as client mistakes. Wrong codes break caching, retries and alerts.`,
      analogy: `It is like a reply from a restaurant kitchen. 2xx: "Here is your food." 3xx: "We moved — go to the other branch." 4xx: "You ordered something not on the menu." 5xx: "Sorry, our oven broke."`,
      code: [
        {
          title: 'Choosing the right code in Express',
          lang: 'javascript',
          code: `app.post('/signup', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  if (password.length < 8) {
    return res.status(422).json({ error: 'password must be at least 8 characters' });
  }
  if (await User.exists({ email })) {
    return res.status(409).json({ error: 'email already registered' });
  }
  const user = await User.create({ email, password }); // hash in a pre-save hook
  res.status(201).json({ id: user.id, email: user.email });
});

app.get('/admin/stats', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  res.json({ users: 120 });
});

// Last error handler: unknown errors become 500, never leak stack traces
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});`,
        },
      ],
      output: `Missing fields give **400**. A short password gives **422** (valid request, failed a rule). An existing email gives **409**. Success gives **201**. A logged-in non-admin hitting \`/admin/stats\` gets **403**; a user with no token gets **401** from \`requireAuth\`. Any crash gives a clean **500** without the stack trace.`,
      questions: [
        { q: 'What is the difference between 401 and 403?', a: '401 means not authenticated: the token is missing, invalid or expired. 403 means authenticated but not allowed to do this action.' },
        { q: 'When would you use 202?', a: 'When the server accepts the job but processes it later, like a video encode or a big report. Return a job id or status URL the client can poll.' },
        { q: 'What is the difference between 502, 503 and 504?', a: '502: the gateway got an invalid response from the upstream server. 503: the server is temporarily unavailable or overloaded. 504: the gateway waited too long for the upstream.' },
        { q: 'What does 304 mean?', a: 'Not Modified. The client\'s cached copy is still fresh (its ETag or date matched), so the server sends no body and the client uses the cache.' },
        { q: 'What code for a successful DELETE?', a: '`204 No Content` if you return nothing, or `200 OK` if you return the deleted item or a message.' },
      ],
      spoken: `"Status codes are grouped by the first digit: 2xx success, 3xx redirects, 4xx client errors and 5xx server errors. I use 201 for creates, 204 when there's no body, 400 for malformed input, 422 for validation failures, 409 for conflicts like a duplicate email, and 429 for rate limits. The one interviewers love is 401 versus 403: 401 means you're not authenticated, 403 means you're authenticated but not allowed. I never return 200 with an error inside, because clients, retries and monitoring all depend on the code."`,
      mistakes: [
        'Returning `200` with `{ success: false }`. Monitoring and client libraries will think it worked.',
        'Using 403 when the token is expired. That is 401, so the client knows to refresh the token.',
        'Returning 500 for bad user input. 5xx should mean the server is broken, and it pages the on-call engineer.',
        'Follow-up trap: "Why is 401 called Unauthorized if it means unauthenticated?" It is a historical naming mistake in the spec. It really means "not authenticated".',
      ],
      takeaway: '2xx ok, 3xx go elsewhere, 4xx your fault, 5xx our fault — and 401 = who are you, 403 = not allowed.',
    },
    {
      id: 'authn-vs-authz',
      title: 'Authentication vs Authorization',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Authentication checks WHO you are; authorization checks WHAT you are allowed to do.',
      what: `- **Authentication (AuthN)** = proving who you are. Login with password, Google sign-in, OTP, a valid token.
- **Authorization (AuthZ)** = deciding what you may do. "Can this user delete this order?"

Authentication always happens **first**. You cannot decide permissions for someone you do not know.

In an Express app this is usually two middlewares: one reads the token and sets \`req.user\` (authN), the next checks \`req.user\`'s role or ownership (authZ).

#### Deeper version
Authorization has levels:
- **Function level** — can this role call this endpoint at all? (only admins call \`DELETE /users\`)
- **Object level** — can this user touch **this specific** record? (user 5 must not read order of user 7). Missing this check is called **BOLA/IDOR** and is the number one risk in the OWASP API Security Top 10.
- **Field level** — can this user see or edit this field? (only HR sees \`salary\`)

Models: **RBAC** (role-based), **ABAC** (attribute-based: rules on user, resource and context like time or region), and **ReBAC** (relationship-based, like Google Docs sharing).

**MFA** (multi-factor authentication) is part of authentication: something you know (password), have (phone), or are (fingerprint).`,
      why: `Mixing them up causes real security bugs. Many breaches are not broken logins — they are logged-in users reading other users' data because the API only checked "is logged in" and never "owns this record".`,
      analogy: `At an airport, showing your passport at security is **authentication** (who you are). Your boarding pass deciding which plane and which seat you can use is **authorization** (what you can do). A valid passport does not let you sit in business class.`,
      code: [
        {
          title: 'Two middlewares: authenticate then authorize',
          lang: 'javascript',
          code: `import jwt from 'jsonwebtoken';

// AuthN: who are you?
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { sub, role }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// AuthZ (function level): is your role allowed?
const allowRoles = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });

app.delete('/users/:id', authenticate, allowRoles('admin'), deleteUser);

// AuthZ (object level): is this YOUR order?
app.get('/orders/:id', authenticate, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.sub });
  if (!order) return res.status(404).json({ error: 'Not found' }); // hides other users' orders
  res.json(order);
});`,
        },
      ],
      output: `No token → **401** from \`authenticate\`. A normal user calling \`DELETE /users/7\` → **403** from \`allowRoles\`. A user asking for someone else's order → **404**, because the query includes \`userId: req.user.sub\`, so other people's orders simply are not found. That single filter is what prevents IDOR.`,
      questions: [
        { q: 'What is the difference between authentication and authorization?', a: 'Authentication verifies identity (who you are). Authorization checks permissions (what you can do). Authentication comes first.' },
        { q: 'What is IDOR / BOLA?', a: 'Insecure Direct Object Reference / Broken Object Level Authorization. The API trusts an id from the URL without checking that the logged-in user owns that object, so changing `/orders/5` to `/orders/6` leaks data.' },
        { q: 'Which status codes map to each?', a: 'Failed authentication returns 401. Failed authorization returns 403 (or 404 if you want to hide that the resource exists).' },
        { q: 'Where should authorization checks live?', a: 'Always on the server. Hiding a button in React is only UX; the API must enforce the rule on every request.' },
      ],
      spoken: `"Authentication is about identity — proving who you are, with a password, OAuth login or a token. Authorization is about permissions — what that identity is allowed to do. Authentication always comes first. In Express I usually have an authenticate middleware that verifies the JWT and sets req.user, then authorization checks on top: role checks for whole endpoints, and ownership checks for specific records, like filtering the order query by the user's id. That object-level check is the one teams forget most, and it's the top API security risk in OWASP."`,
      mistakes: [
        'Only checking "is logged in" and then trusting ids in the URL. Always check ownership of the record.',
        'Doing permission checks only in the frontend. Anyone can call the API with curl.',
        'Putting the role in a token and never re-checking it. If an admin is demoted, the old token still says admin until it expires — keep access tokens short-lived.',
        'Follow-up trap: "Is OAuth authentication or authorization?" OAuth 2.0 is an authorization framework (delegated access). OpenID Connect adds authentication on top of it.',
      ],
      takeaway: 'AuthN = who you are (401 if it fails); AuthZ = what you can do (403 if it fails) — and always check ownership of the object.',
    },
    {
      id: 'pagination',
      title: 'Pagination: Offset vs Cursor',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Return big lists in pages. Offset (page/limit) is simple; cursor (after=lastId) is fast and stable for large or changing data.',
      what: `**Pagination** means returning a big list in small pieces (pages) instead of all at once.

Two main styles:
- **Offset pagination**: \`GET /posts?page=3&limit=20\` → skip 40, take 20. Easy, and you can jump to any page.
- **Cursor pagination**: \`GET /posts?limit=20&after=abc123\` → "give me 20 items after this one". The **cursor** is a pointer to the last item you saw (often its id or timestamp, encoded).

#### Deeper version
**Problems with offset:**
- **Slow on big tables**: \`skip(100000)\` still makes the database walk past 100,000 rows.
- **Unstable**: if a new post is added while you read page 1, page 2 repeats one item. If one is deleted, you skip an item.

**Cursor pagination** uses an indexed condition like \`WHERE (createdAt, _id) < (lastCreatedAt, lastId)\`. The database jumps straight there using the index, so page 1000 is as fast as page 1. New inserts do not shift your position. Downsides: no "jump to page 57", and no easy total count.

**Tie-breakers:** if you sort by \`createdAt\` and two items have the same time, you can skip or repeat items. Always add a unique field (like \`_id\`) to the sort and cursor.

Make the cursor **opaque** (base64-encode it) so clients do not depend on its format.

Return metadata: \`{ data, nextCursor, hasMore }\` for cursor, or \`{ data, page, totalPages }\` for offset. Some APIs also send a \`Link\` header (GitHub style).`,
      why: `Sending 1 million rows in one response kills the database, the network and the browser. Pagination keeps responses small and fast. Choosing cursor for feeds (infinite scroll, chat, activity logs) avoids duplicates and slow deep pages; offset is fine for admin tables with page numbers.`,
      analogy: `Offset is like saying "start reading from line 4,000 of the book" — you must count all lines to get there, and if someone inserts a page, you are off. Cursor is a **bookmark**: you open exactly where you left off, no counting, even if pages are added at the front.`,
      code: [
        {
          title: 'Offset pagination (MongoDB)',
          lang: 'javascript',
          code: `app.get('/posts', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20); // cap the limit!
  const [data, total] = await Promise.all([
    Post.find().sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(),
  ]);
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
});`,
        },
        {
          title: 'Cursor pagination with a tie-breaker',
          lang: 'javascript',
          code: `const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const decode = (str) => JSON.parse(Buffer.from(str, 'base64url').toString());

// Needs an index: { createdAt: -1, _id: -1 }
app.get('/feed', async (req, res) => {
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const filter = {};
  if (req.query.after) {
    const { t, id } = decode(req.query.after);
    filter.$or = [
      { createdAt: { $lt: new Date(t) } },
      { createdAt: new Date(t), _id: { $lt: id } }, // same time -> use _id
    ];
  }
  // Fetch one extra to know if there is a next page
  const rows = await Post.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit + 1);
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);
  const last = data.at(-1);
  res.json({
    data,
    hasMore,
    nextCursor: hasMore ? encode({ t: last.createdAt, id: String(last._id) }) : null,
  });
});`,
        },
      ],
      output: `Offset: \`GET /posts?page=2&limit=20\` returns items 21-40 plus \`totalPages\`. Good for tables with page numbers.

Cursor: the first \`GET /feed\` returns 20 posts and a \`nextCursor\` like \`eyJ0Ijoi...\`. The client calls \`GET /feed?after=eyJ0Ijoi...\` for the next 20. Because we asked for \`limit + 1\` rows, \`hasMore\` is true only if a 21st row exists. When \`nextCursor\` is \`null\`, the feed is finished.`,
      questions: [
        { q: 'Offset vs cursor pagination — when to use which?', a: 'Offset for small or medium data where users need page numbers (admin tables). Cursor for large or fast-changing data like feeds, chats and logs, because it is fast at any depth and does not skip or repeat items.' },
        { q: 'Why is offset slow for deep pages?', a: 'The database still has to scan and throw away all skipped rows. `skip(1000000)` reads a million index entries before returning anything.' },
        { q: 'Why add _id to the sort?', a: 'As a tie-breaker. If two rows share the same `createdAt`, the order is not stable and you can skip or repeat rows across pages.' },
        { q: 'How do you know if there is a next page without counting?', a: 'Fetch `limit + 1` rows. If you got the extra one, there is more. Return only `limit` rows.' },
      ],
      spoken: `"Pagination returns large lists in pages. Offset pagination uses page and limit, so it's simple and supports jumping to page 10, but it gets slow on deep pages because the database still scans skipped rows, and it can show duplicates when new data comes in. Cursor pagination passes a pointer to the last item, like an encoded createdAt plus id, and queries 'items after this' using an index. That's constant speed and stable for infinite scroll. I always cap the limit, add a unique tie-breaker to the sort, and fetch limit plus one to know if there's more."`,
      mistakes: [
        'Not capping `limit`. A client can send `limit=1000000` and take down the database.',
        'Sorting only by a non-unique field like `createdAt`, causing skipped or repeated items.',
        'Running `countDocuments()` on every request of a huge collection. Counting can be expensive; cache it or drop the total for cursor APIs.',
        'Follow-up trap: "How do you do cursor pagination when sorting by price?" The cursor must hold the sort value plus the unique id (price + _id), and you need a compound index on both.',
      ],
      takeaway: 'Offset is simple and jumpable; cursor is fast and stable — use cursor for feeds and big data, and always cap the limit.',
    },
    {
      id: 'api-versioning',
      title: 'API Versioning',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Versioning lets you make breaking changes without breaking existing clients: /v1 in the URL, a header, or a date-based version.',
      what: `**Versioning** means giving your API a version label so you can change it later without breaking apps that already use it.

Common ways:
- **URL path**: \`/api/v1/users\`, \`/api/v2/users\`. Most common and easiest to see.
- **Header**: \`Accept: application/vnd.myapp.v2+json\` or a custom header like \`API-Version: 2\`.
- **Query param**: \`/users?version=2\`. Simple but less clean.
- **Date-based**: Stripe sends \`Stripe-Version: 2024-06-20\`. Each account is pinned to the version it started with.

#### Deeper version
**Breaking changes** need a new version: removing or renaming a field, changing a type, making an optional field required, changing error formats.

**Non-breaking changes** do not: adding a new optional field, a new endpoint, a new optional query param. Clients should ignore unknown fields (this is called being a **tolerant reader**).

Good practice:
- Only bump the major version for breaking changes.
- Run old and new side by side; route v1 to an adapter that maps to the new internal logic.
- **Deprecate** with notice: send a \`Deprecation\` and \`Sunset\` header, email users, track who still calls v1, then remove it.
- Mobile apps make this harder — old app versions stay in the wild for years.

Header-based versioning keeps URLs clean but is harder to test in a browser and to cache (needs \`Vary\` header).`,
      why: `Once a mobile app or partner integration uses your API, you cannot force them to update the same day. Without versions, one renamed field crashes every old client. Versions let you improve the API while old clients keep working.`,
      analogy: `Like phone chargers. When the company switched from micro-USB to USB-C, they did not melt all the old chargers. They sold new phones with USB-C (v2) while old phones kept using micro-USB (v1) until people upgraded.`,
      code: [
        {
          title: 'URL versioning with Express routers',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

const v1 = express.Router();
v1.get('/users/:id', async (req, res) => {
  const u = await User.findById(req.params.id);
  // v1 shape: single "name" field (old clients depend on it)
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Wed, 31 Dec 2025 23:59:59 GMT');
  res.json({ id: u.id, name: \`\${u.firstName} \${u.lastName}\` });
});

const v2 = express.Router();
v2.get('/users/:id', async (req, res) => {
  const u = await User.findById(req.params.id);
  // v2 shape: split name (a breaking change, so it got a new version)
  res.json({ id: u.id, firstName: u.firstName, lastName: u.lastName });
});

app.use('/api/v1', v1);
app.use('/api/v2', v2);`,
        },
      ],
      output: `\`GET /api/v1/users/1\` returns \`{ id, name: "Asha Rao" }\` plus \`Deprecation\` and \`Sunset\` headers warning clients. \`GET /api/v2/users/1\` returns \`{ id, firstName, lastName }\`. Both use the same database; only the response shape differs. Old clients keep working until the sunset date.`,
      questions: [
        { q: 'What are the ways to version an API?', a: 'URL path (`/v1`), a header (`Accept` media type or custom header), a query param, or date-based versions like Stripe. URL path is the most common.' },
        { q: 'What counts as a breaking change?', a: 'Removing or renaming fields, changing types or meanings, making something required, changing auth or error formats. Adding optional fields or new endpoints is not breaking.' },
        { q: 'How do you retire an old version?', a: 'Announce it, add `Deprecation`/`Sunset` headers, monitor traffic per version, contact remaining users, and only remove it when usage is near zero.' },
        { q: 'How does Stripe version its API?', a: 'With dates. Your account is pinned to the version from when you integrated, and you can override per request with the `Stripe-Version` header and upgrade when ready.' },
      ],
      spoken: `"Versioning lets me make breaking changes without breaking existing clients. The most common approach is the URL, like /api/v1, because it's visible and easy to route and cache. Headers keep URLs clean, and Stripe uses date-based versions pinned per account, which I like. I only create a new version for breaking changes like renaming or removing a field. Adding optional fields is safe as long as clients ignore unknown fields. To retire a version I add Deprecation and Sunset headers, track who still calls it, and give clients plenty of notice."`,
      mistakes: [
        'Creating a new version for every small change. Additive changes do not need a new version.',
        'Silently changing a field type in the same version (string id to number). That is a breaking change.',
        'Forgetting mobile apps: you cannot remove v1 just because the web app moved to v2.',
        'Follow-up trap: "How does GraphQL handle versioning?" It usually avoids versions: you add new fields and mark old ones with `@deprecated`, then remove them when no one queries them.',
      ],
      takeaway: 'Version only for breaking changes, keep old versions alive with clear deprecation, and prefer additive changes.',
    },
    {
      id: 'cookies-vs-tokens',
      title: 'Cookies vs Tokens (Sessions vs JWT)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Session cookies keep state on the server; bearer tokens (like JWT) carry state to the server. Cookies are a transport, tokens are a format.',
      what: `There are two common ways to remember that a user is logged in:

- **Session + cookie**: after login, the server stores a session (in memory, Redis or the DB) and gives the browser a **cookie** with a random session id. The browser sends the cookie automatically on every request. The server looks up the id.
- **Token (often JWT)**: after login, the server gives the client a **signed token** that contains the user id and role. The client sends it in the \`Authorization: Bearer <token>\` header. The server checks the signature — no lookup needed.

A **cookie** is just a small piece of data the browser stores and sends automatically. A **token** is a string that proves who you are. They are not opposites: you can put a JWT **inside** a cookie.

#### Deeper version
**Sessions (stateful):**
- Easy to revoke: delete the session row and the user is logged out.
- Needs a shared store (Redis) when you have many servers.
- Cookie is sent automatically, so you must defend against **CSRF** (SameSite, CSRF tokens).

**JWT bearer tokens (stateless):**
- No DB lookup per request; good for microservices and mobile apps.
- Hard to revoke before expiry, so keep access tokens short (5-15 min) and use refresh tokens.
- If stored in \`localStorage\`, any **XSS** script can steal it.

**Safe browser default**: put the session id or refresh token in an \`HttpOnly; Secure; SameSite=Lax\` (or \`Strict\`) cookie. HttpOnly means JavaScript cannot read it, so XSS cannot steal it. For mobile apps and server-to-server calls, a bearer token in the header is normal.`,
      why: `HTTP is stateless — the server forgets you after each request. We need some proof on every request. The choice decides how you scale, how you log users out, and which attacks (XSS vs CSRF) you must defend against.`,
      analogy: `A **session cookie** is a coat-check ticket: it is just a number, and the cloakroom (server) keeps your coat (data). A **JWT** is a festival wristband: the info is on the band itself and security checks the stamp (signature) without calling anyone. You cannot easily "take back" a wristband before the festival ends — that is the revocation problem.`,
      code: [
        {
          title: 'Session cookie with express-session + Redis',
          lang: 'javascript',
          code: `import session from 'express-session';
import { RedisStore } from 'connect-redis'; // export style varies by version; check the docs
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 },
}));

app.post('/login', async (req, res) => {
  const user = await checkPassword(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: 'Bad credentials' });
  req.session.userId = user.id;      // state lives in Redis
  res.json({ ok: true });
});

app.post('/logout', (req, res) => req.session.destroy(() => res.status(204).end()));`,
        },
        {
          title: 'Bearer token in a header (mobile / API clients)',
          lang: 'javascript',
          code: `// Client side
const res = await fetch('https://api.example.com/me', {
  headers: { Authorization: \`Bearer \${accessToken}\` },
});

// Server side: verify the signature, no DB lookup needed
const payload = jwt.verify(token, process.env.JWT_SECRET); // { sub: 'u_1', role: 'user', exp: ... }`,
        },
      ],
      output: `With sessions, the browser receives \`Set-Cookie: connect.sid=s%3Aabc...; HttpOnly; Secure; SameSite=Lax\`. Every later request sends it automatically, and the server finds \`userId\` in Redis. Logout deletes the session, so the cookie becomes useless immediately.

With bearer tokens, the client attaches the header itself. The server only checks the signature and expiry. Logging out just means the client throws the token away — the token itself still works until \`exp\`.`,
      questions: [
        { q: 'Session cookies vs JWT — which would you pick?', a: 'For a classic web app on one domain, session cookies (with Redis) are simple and easy to revoke. For mobile apps, third-party APIs or many microservices, short-lived JWTs plus refresh tokens are common. Both are valid.' },
        { q: 'Where should a browser store a token?', a: 'Best is an HttpOnly, Secure, SameSite cookie so JavaScript cannot read it. Storing it in localStorage exposes it to any XSS script.' },
        { q: 'Are cookies vulnerable to CSRF?', a: 'Yes, because the browser sends them automatically. Defend with SameSite=Lax/Strict, CSRF tokens, and checking the Origin header. Bearer headers are not sent automatically, so they are not vulnerable to CSRF.' },
        { q: 'How do you log out a JWT user immediately?', a: 'Keep access tokens short, revoke the refresh token in the DB, and if needed keep a denylist of token ids (`jti`) in Redis until they expire.' },
      ],
      spoken: `"Cookies and tokens solve the same problem — HTTP is stateless, so the client needs to prove who it is on every request. With sessions, the server stores the state, usually in Redis, and the browser holds only a random id in a cookie. That's easy to revoke but needs a shared store. With JWTs, the token itself carries the user data and a signature, so there's no lookup, but you can't easily revoke it, so I keep access tokens short. In browsers I prefer HttpOnly, Secure, SameSite cookies over localStorage, because XSS can't read them."`,
      mistakes: [
        'Saying "cookies vs JWT" as if they are the same kind of thing. A cookie is a storage/transport; a JWT is a token format. A JWT can live in a cookie.',
        'Storing long-lived JWTs in localStorage. One XSS bug and the attacker has the token.',
        'Keeping sessions in server memory with several instances behind a load balancer. Users get logged out randomly.',
        'Follow-up trap: "If I use HttpOnly cookies, am I safe from XSS?" No. XSS can still send requests from the user\'s page with the cookie attached; it just cannot steal the cookie. You still need to prevent XSS.',
      ],
      takeaway: 'Sessions = state on server, easy logout; JWT = state in token, no lookup but hard to revoke — in browsers, keep secrets in HttpOnly cookies.',
    },
    {
      id: 'realtime-options',
      title: 'Polling vs Long Polling vs SSE vs WebSockets',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Four ways to get live updates: ask repeatedly, ask and wait, server pushes one-way (SSE), or a two-way open pipe (WebSocket).',
      what: `Normal HTTP is "client asks, server answers". For live data (chat, notifications, stock prices) we need the server to send updates. Options:

1. **Short polling** — the client asks every few seconds: "anything new?" Simple, but wasteful.
2. **Long polling** — the client asks, and the server **holds the request open** until there is new data (or a timeout). Then the client asks again right away.
3. **SSE (Server-Sent Events)** — one long HTTP response that stays open. The server keeps writing events into it. **One-way**: server → client only. Browser API: \`EventSource\`.
4. **WebSocket** — the connection upgrades from HTTP into a **two-way** pipe. Both sides can send messages any time with very low overhead.

#### Deeper version
- **Short polling**: many empty responses, delay up to the poll interval. Fine for "check job status every 5s".
- **Long polling**: near real-time, works everywhere, but each message costs a full HTTP request and holding many open requests uses server resources.
- **SSE**: plain HTTP, so it works with normal auth, proxies and HTTP/2. **Auto-reconnects** and can resume with \`Last-Event-ID\`. Text only. The native \`EventSource\` cannot set custom headers (use cookies or a fetch-based library). On HTTP/1.1 browsers limit about 6 connections per domain, which SSE can eat up; HTTP/2 fixes this. Great for **LLM token streaming**, notifications, live dashboards.
- **WebSocket**: starts with an HTTP request with \`Upgrade: websocket\`, server answers \`101 Switching Protocols\`. Full duplex, binary or text. You must handle reconnects, heartbeats and scaling yourself (or use Socket.IO). Load balancers need sticky sessions or a pub/sub layer. Best for chat, multiplayer games, collaborative editing.`,
      why: `Picking the simplest tool that fits saves a lot of complexity. Many teams reach for WebSockets when SSE (one-way updates) or even polling would be enough and easier to run behind normal HTTP infrastructure.`,
      analogy: `You are waiting for a parcel.
- **Short polling**: you call the courier every 5 minutes: "Is it here?"
- **Long polling**: you call and the courier says "stay on the line, I'll tell you when it arrives".
- **SSE**: you subscribe to SMS updates — they text you, you cannot text back on that channel.
- **WebSocket**: an open phone call where both of you can talk any time.`,
      code: [
        {
          title: 'SSE server (Express) and client',
          lang: 'javascript',
          code: `// Server
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  let id = 0;
  const timer = setInterval(() => {
    id++;
    // Each event: "id:", "event:", "data:" lines, then a blank line
    res.write(\`id: \${id}\\nevent: price\\ndata: \${JSON.stringify({ btc: 60000 + id })}\\n\\n\`);
  }, 1000);

  req.on('close', () => clearInterval(timer)); // client left: stop work
});

// Browser
const es = new EventSource('/events');
es.addEventListener('price', (e) => console.log(JSON.parse(e.data)));
es.onerror = () => console.log('lost connection, browser will retry');`,
        },
        {
          title: 'WebSocket with the ws library',
          lang: 'javascript',
          code: `import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    const msg = raw.toString();
    // Broadcast to every connected client (two-way pipe)
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(\`echo: \${msg}\`); // 1 = OPEN
    }
  });
});

// Browser
const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => ws.send('hello');
ws.onmessage = (e) => console.log(e.data); // "echo: hello"`,
        },
      ],
      output: `The SSE client logs \`{ btc: 60001 }\`, \`{ btc: 60002 }\`... once per second over a single HTTP response. If the network drops, \`EventSource\` reconnects and sends \`Last-Event-ID\` so the server could resume. When the tab closes, \`close\` fires and the interval is cleared.

The WebSocket client sends \`hello\` and every connected client receives \`echo: hello\` — messages flow both ways on one connection.`,
      questions: [
        { q: 'When would you choose SSE over WebSockets?', a: 'When updates only flow server to client: notifications, live scores, dashboards, streaming LLM responses. SSE is plain HTTP, auto-reconnects and works with existing auth and proxies.' },
        { q: 'How does a WebSocket connection start?', a: 'With a normal HTTP GET carrying `Upgrade: websocket` and `Connection: Upgrade` headers. The server replies `101 Switching Protocols` and the same TCP connection becomes a WebSocket.' },
        { q: 'What is long polling?', a: 'The client sends a request and the server holds it open until data is available or a timeout hits. The client immediately sends a new request after each response.' },
        { q: 'How did ChatGPT-style apps stream tokens?', a: 'Commonly with SSE (`text/event-stream`) or a streamed fetch response. Each chunk is written as soon as the model produces it.' },
      ],
      spoken: `"There are four main options for live data. Short polling asks every few seconds — simple but wasteful. Long polling holds the request until there's data, which is near real-time but heavy. Server-Sent Events keep one HTTP response open and the server pushes events one-way; it auto-reconnects, so I use it for notifications and streaming LLM output. WebSockets upgrade the connection into a full two-way pipe, which I use for chat or collaborative features. I pick the simplest one that fits, because WebSockets add work around reconnection, heartbeats and scaling."`,
      mistakes: [
        'Using WebSockets for one-way updates where SSE would be simpler.',
        'Forgetting to clean up timers or listeners when an SSE/WebSocket client disconnects — memory leak.',
        'Not configuring proxies: nginx buffering can hold SSE events, and load balancers can close idle connections. Send heartbeats and disable buffering.',
        'Follow-up trap: "Can you send a JWT header with EventSource?" The native `EventSource` cannot set custom headers. Use cookies, a short-lived token in the URL, or a fetch-based SSE client.',
      ],
      takeaway: 'Polling asks, long polling waits, SSE pushes one-way over HTTP, WebSockets talk both ways — use the simplest that fits.',
    },
    {
      id: 'openapi-swagger',
      title: 'Swagger / OpenAPI',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'OpenAPI is a standard YAML/JSON file that describes your REST API; Swagger is the toolset (UI, editor, codegen) around it.',
      what: `**OpenAPI** is a standard format (YAML or JSON) to describe a REST API: its endpoints, parameters, request bodies, responses and auth.

**Swagger** was the old name of the spec. Today "Swagger" means the **tools**: Swagger UI (interactive docs page), Swagger Editor and Swagger Codegen.

With one OpenAPI file you can show live docs, generate client SDKs, generate TypeScript types, validate requests and create mock servers.

#### Deeper version
Two approaches:
- **Design-first (spec-first)**: write the OpenAPI file first, review it with frontend/mobile teams, then build. Good for public APIs and parallel work.
- **Code-first**: generate the spec from code (decorators in NestJS, JSDoc with \`swagger-jsdoc\`, or schemas from Zod/Fastify). Faster for internal APIs, but the spec is only as good as the annotations.

Key parts of a spec: \`openapi\` version, \`info\`, \`servers\`, \`paths\`, \`components.schemas\` (reusable models), \`components.securitySchemes\` (Bearer, OAuth2, API key).

Tools like \`openapi-typescript\` generate types for the frontend, and middleware like \`express-openapi-validator\` rejects requests that do not match the spec. Contract tests check that the real API matches the spec.`,
      why: `Without a shared contract, frontend and backend argue about field names and break each other. A spec is living documentation, a contract for tests, and a source for generated, typed clients — fewer "what does this endpoint return?" messages.`,
      analogy: `It is the **menu** of a restaurant. It lists every dish (endpoint), the ingredients you must give (parameters) and what you get back (response). Swagger UI is the nice printed menu with photos where you can even order a sample.`,
      code: [
        {
          title: 'A small OpenAPI 3 spec',
          lang: 'yaml',
          code: `openapi: 3.0.3
info:
  title: Orders API
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /orders/{id}:
    get:
      summary: Get one order
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: The order
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Order' }
        '404':
          description: Not found
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    Order:
      type: object
      required: [id, total, status]
      properties:
        id: { type: string }
        total: { type: number }
        status: { type: string, enum: [pending, paid, shipped] }`,
        },
        {
          title: 'Serve Swagger UI in Express',
          lang: 'javascript',
          code: `import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const spec = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
// Open http://localhost:3000/docs to see and try every endpoint`,
        },
      ],
      output: `Visiting \`/docs\` shows an interactive page listing \`GET /orders/{id}\`. You can click "Authorize", paste a JWT, enter an id and hit "Try it out" to call the real API. The \`Order\` schema shows exactly which fields exist and that \`status\` can only be \`pending\`, \`paid\` or \`shipped\`. The frontend team can run \`npx openapi-typescript openapi.yaml -o api.d.ts\` to get matching TypeScript types.`,
      questions: [
        { q: 'What is the difference between OpenAPI and Swagger?', a: 'OpenAPI is the specification format. Swagger is the brand of tools around it (UI, Editor, Codegen). Swagger 2.0 was renamed OpenAPI starting with 3.0.' },
        { q: 'Design-first or code-first?', a: 'Design-first for public or multi-team APIs, so everyone agrees on the contract before coding. Code-first for fast internal APIs, generating the spec from code or schemas.' },
        { q: 'What can you generate from an OpenAPI spec?', a: 'Interactive docs, client SDKs, server stubs, TypeScript types, mock servers, request validators and contract tests.' },
        { q: 'How do you keep the spec and code in sync?', a: 'Generate one from the other, validate requests/responses against the spec in tests, and fail CI if the spec and implementation differ.' },
      ],
      spoken: `"OpenAPI is a standard YAML or JSON format that describes a REST API — paths, parameters, request and response schemas, and auth. Swagger is the tooling around it, like Swagger UI for interactive docs. I like it because one file becomes docs, generated TypeScript types for the frontend, mock servers and request validation. For public or cross-team APIs I prefer design-first, so the contract is agreed before coding. For internal services, code-first with schemas from Zod or decorators is faster. The key is keeping the spec in sync, ideally checked in CI."`,
      mistakes: [
        'Writing the spec once and never updating it. Out-of-date docs are worse than none.',
        'Documenting only the happy path. Include 4xx/5xx responses and the error shape.',
        'Leaving Swagger UI public on production with "Try it out" pointing at real data, without thinking about who can see it.',
        'Follow-up trap: "Is OpenAPI used for GraphQL or gRPC?" No. GraphQL has its own schema (SDL) and gRPC uses Protobuf `.proto` files. For event-driven APIs there is AsyncAPI.',
      ],
      takeaway: 'OpenAPI is the API contract; Swagger tools turn it into docs, types and clients — keep it in sync with the code.',
    },
    {
      id: 'error-response-design',
      title: 'Consistent Error Responses',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Return errors in one predictable JSON shape with the right status code, a machine-readable code, a human message, and field details.',
      what: `When something fails, the client needs to know **what** went wrong and **what to do**. A good API always returns errors in the **same shape**, for example:

\`\`\`json
{ "error": { "code": "VALIDATION_FAILED", "message": "Email is invalid", "details": [{ "field": "email", "issue": "format" }], "requestId": "req_123" } }
\`\`\`

- **status code** — the category (400, 404, 409...).
- **code** — a stable string the frontend can \`switch\` on. Never change it.
- **message** — human-readable text, safe to show or log.
- **details** — per-field problems for forms.
- **requestId** — so support can find the log line.

#### Deeper version
There is a standard for this: **Problem Details for HTTP APIs** (RFC 9457, which replaced RFC 7807). It uses the media type \`application/problem+json\` and fields \`type\`, \`title\`, \`status\`, \`detail\`, \`instance\`, plus any extra fields you like.

Rules:
- Never leak stack traces, SQL or internal paths in production.
- Separate **operational errors** (expected: not found, validation) from **programmer errors** (bugs). Log bugs with full detail, return a generic 500.
- Use a central error-handling middleware so every route behaves the same.
- Validate input at the edge with a schema library (Zod, Joi) and turn its errors into your standard shape.`,
      why: `If every endpoint invents its own error format, the frontend needs special code for each one, and bugs hide. One shape means one error handler on the client, clean form validation, and easy debugging through the request id.`,
      analogy: `Think of car dashboard warning lights. Every car uses the same symbols — the oil lamp always means oil. You do not need to read the manual each time. A consistent error format is the same idea for your API's clients.`,
      code: [
        {
          title: 'Central error handler with a custom error class',
          lang: 'javascript',
          code: `import { randomUUID } from 'node:crypto';
import { z } from 'zod';

class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    Object.assign(this, { status, code, details });
  }
}

app.use((req, res, next) => { req.id = randomUUID(); next(); });

const SignupBody = z.object({ email: z.string().email(), age: z.number().int().min(18) });

app.post('/signup', (req, res, next) => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ field: i.path.join('.'), issue: i.message }));
    return next(new ApiError(422, 'VALIDATION_FAILED', 'Some fields are invalid', details));
  }
  res.status(201).json({ ok: true });
});

// One place that formats every error
app.use((err, req, res, next) => {
  const known = err instanceof ApiError;
  if (!known) console.error(req.id, err); // bug: log it fully
  res.status(known ? err.status : 500).json({
    error: {
      code: known ? err.code : 'INTERNAL_ERROR',
      message: known ? err.message : 'Something went wrong',
      details: known ? err.details : undefined,
      requestId: req.id,
    },
  });
});`,
        },
      ],
      output: `Posting \`{ "email": "bad", "age": 12 }\` returns **422** with \`code: "VALIDATION_FAILED"\` and two details: one for \`email\` and one for \`age\`. The React form can show each message under the right input. If a bug throws (say, \`undefined.x\`), the client gets a clean **500** \`INTERNAL_ERROR\` with a \`requestId\`, while the full stack trace goes only to the server logs.`,
      questions: [
        { q: 'What should an API error response contain?', a: 'The right HTTP status, a stable machine-readable error code, a human message, optional field-level details, and a request/trace id for debugging.' },
        { q: 'What is RFC 9457 / Problem Details?', a: 'A standard JSON error format (`application/problem+json`) with fields like `type`, `title`, `status`, `detail` and `instance`. It replaced RFC 7807.' },
        { q: 'Why not just send the exception message?', a: 'It can leak internals (SQL, file paths, library versions) and it is not stable for clients to code against.' },
        { q: 'How do you handle async errors in Express?', a: 'Pass them to `next(err)` (or use Express 5, which forwards rejected promises automatically), and format them in one error-handling middleware with four arguments.' },
      ],
      spoken: `"I keep all API errors in one consistent shape: the correct status code, a stable error code the frontend can switch on, a human-readable message, field-level details for validation, and a request id that matches our logs. There's even a standard for it, Problem Details, RFC 9457. In Express I validate input with Zod at the edge, throw a custom ApiError for expected failures, and have one error middleware that formats everything. Unknown errors become a generic 500, with the full stack trace only in the logs, never in the response."`,
      mistakes: [
        'Different error formats per endpoint, forcing the frontend to special-case each one.',
        'Sending stack traces or database errors to the client in production.',
        'Using only `message` text for logic. Messages change; clients should rely on a stable `code`.',
        'Follow-up trap: "Should you return 500 when the database is down?" 503 Service Unavailable (optionally with `Retry-After`) is more accurate, because the request was fine and the outage is temporary.',
      ],
      takeaway: 'One error shape everywhere: status + stable code + message + details + requestId, and never leak internals.',
    },
    {
      id: 'filtering-sorting',
      title: 'Filtering, Sorting and Field Selection',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Let clients narrow lists with query params like ?status=paid&sort=-createdAt&fields=id,total — but whitelist everything.',
      what: `List endpoints usually need more than pagination. Clients want to:

- **Filter**: \`GET /orders?status=paid&minTotal=100\`
- **Sort**: \`GET /orders?sort=-createdAt,total\` (minus means descending)
- **Select fields**: \`GET /orders?fields=id,total,status\` (smaller responses)
- **Search**: \`GET /products?q=red+shoes\`

These go in the **query string**, because they change which items you see, not which resource you are addressing.

#### Deeper version
**Security first**: never pass \`req.query\` straight into a MongoDB query. A client could send \`?password[$ne]=x\`, which Express parses into \`{ password: { $ne: 'x' } }\` — a **NoSQL injection**. Whitelist allowed fields and operators, and cast values to the right types.

**Performance**: every filter + sort combination you allow needs a supporting index, or the query does a full collection scan. Only expose filters you can index. Full-text search usually belongs in a search engine (Atlas Search, Elasticsearch, OpenSearch) rather than \`$regex\`.

**Conventions** vary: \`price[gte]=10\`, \`price_gte=10\`, or a filter language like OData. Pick one and document it in OpenAPI. For very complex queries, \`POST /orders/search\` with a JSON body is acceptable.`,
      why: `Without filtering, clients download everything and filter in the browser — slow and wasteful. With unsafe filtering, you open injection holes and slow queries. A clear, whitelisted design gives flexibility with safety.`,
      analogy: `Like an online shopping sidebar: tick "size M", "under ₹1000", sort by "newest". The shop only shows filters it actually supports. You cannot type in a filter for "warehouse shelf number" — that is the whitelist.`,
      code: [
        {
          title: 'Safe query builder for MongoDB',
          lang: 'javascript',
          code: `const FILTERS = { status: String, customerId: String };
const SORTABLE = ['createdAt', 'total'];
const SELECTABLE = ['id', 'total', 'status', 'createdAt', 'customerId'];

app.get('/orders', async (req, res) => {
  const filter = {};
  for (const [key, cast] of Object.entries(FILTERS)) {
    if (typeof req.query[key] === 'string') filter[key] = cast(req.query[key]); // strings only: blocks {$ne:...}
  }
  if (req.query.minTotal) filter.total = { $gte: Number(req.query.minTotal) };

  // "-createdAt,total" -> { createdAt: -1, total: 1 }
  const sort = {};
  for (const part of String(req.query.sort || '-createdAt').split(',')) {
    const field = part.replace(/^-/, '');
    if (SORTABLE.includes(field)) sort[field] = part.startsWith('-') ? -1 : 1;
  }
  sort._id = -1; // tie-breaker

  const fields = String(req.query.fields || '')
    .split(',')
    .filter((f) => SELECTABLE.includes(f))
    .join(' ');

  const data = await Order.find(filter).sort(sort).select(fields || undefined).limit(50).lean();
  res.json({ data });
});`,
        },
      ],
      output: `\`GET /orders?status=paid&minTotal=100&sort=-total&fields=id,total\` returns paid orders of 100 or more, highest total first, with only \`id\` and \`total\` (plus \`_id\`). A malicious \`?status[$ne]=x\` is ignored because \`req.query.status\` is an object, not a string. An unknown sort field like \`sort=password\` is silently dropped.`,
      questions: [
        { q: 'How do you design filtering and sorting in a REST API?', a: 'Use query params like `?status=paid&sort=-createdAt&fields=id,total`. Whitelist the allowed fields and operators, cast types, and back common combinations with indexes.' },
        { q: 'What is NoSQL injection?', a: 'When user input becomes a query operator. For example `?password[$ne]=x` becomes `{ password: { $ne: "x" } }` and matches everyone. Prevent it by checking types, whitelisting, or using a sanitizer.' },
        { q: 'When would you use POST for search?', a: 'When the filter is too complex or too long for a URL (nested conditions, big id lists). The trade-off is that POST responses are not cached by default.' },
      ],
      spoken: `"For list endpoints I support filtering, sorting and field selection through query parameters, like status equals paid, sort equals minus createdAt, and fields equals id comma total. The important part is that everything is whitelisted. I never spread req.query into a Mongo query, because that allows NoSQL injection like a dollar-ne operator. I also cast types, cap the limit, add a unique tie-breaker to sorts, and only expose filters that have indexes. For real full-text search I'd use Atlas Search or Elasticsearch instead of regex."`,
      mistakes: [
        'Passing `req.query` directly to `Model.find()` — NoSQL injection.',
        'Allowing sort on any field, causing slow unindexed queries on big collections.',
        'Using `$regex` with user input for search, which is slow and can be abused with heavy patterns (ReDoS).',
        'Follow-up trap: "Does field selection save database work?" Partly — it reduces data sent over the network and, with a covering index, can avoid reading documents at all. Otherwise the DB still reads the full document.',
      ],
      takeaway: 'Query params for filter/sort/fields — but whitelist, cast types and index every combination you expose.',
    },
    {
      id: 'cors-preflight',
      title: 'CORS and Preflight Requests',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'CORS is how a server tells the browser which other origins may read its responses; preflight is the OPTIONS check before "non-simple" requests.',
      what: `Browsers follow the **Same-Origin Policy**: JavaScript on \`https://app.com\` cannot read responses from \`https://api.com\` unless the API allows it. An **origin** = scheme + host + port (\`https://app.com:443\`).

**CORS** (Cross-Origin Resource Sharing) is the way the **server** says "this other origin is allowed", using response headers like \`Access-Control-Allow-Origin: https://app.com\`.

A **preflight** is an automatic \`OPTIONS\` request the browser sends **before** the real request, to ask "may I send this?". It happens when the request is not "simple", for example:
- method is PUT, PATCH or DELETE,
- it has custom headers like \`Authorization\`,
- \`Content-Type\` is \`application/json\`.

#### Deeper version
**Simple requests** (no preflight): GET/HEAD/POST with only basic headers and Content-Type of \`text/plain\`, \`multipart/form-data\` or \`application/x-www-form-urlencoded\`.

Preflight request headers: \`Origin\`, \`Access-Control-Request-Method\`, \`Access-Control-Request-Headers\`.
Server reply headers: \`Access-Control-Allow-Origin\`, \`-Allow-Methods\`, \`-Allow-Headers\`, \`-Max-Age\` (cache the preflight so it is not repeated every time).

**Credentials** (cookies): the client must use \`credentials: 'include'\`, the server must send \`Access-Control-Allow-Credentials: true\`, and \`Allow-Origin\` **cannot be \`*\`** — it must be the exact origin. When you echo the origin dynamically, also send \`Vary: Origin\` so caches do not mix responses.

Key fact: **CORS is enforced by the browser only.** Postman, curl and servers ignore it. It protects users' browsers, not your API. It is not authentication.`,
      why: `Without the Same-Origin Policy, any website you visit could read your bank's API responses using your logged-in cookies. CORS is the controlled exception so your own frontend on another domain (or port, like localhost:5173 vs :3000) can call your API.`,
      analogy: `A building (browser) has a guard. Before a visitor from another company (origin) goes to an office (API) carrying a big package (PUT with JSON), the guard phones the office: "Visitor from app.com wants to bring a PUT with an Authorization header — OK?" That phone call is the preflight. The office's answer decides whether the visitor goes up.`,
      code: [
        {
          title: 'CORS in Express with an allow-list',
          lang: 'javascript',
          code: `import cors from 'cors';

const allowed = ['https://app.example.com', 'http://localhost:5173'];

app.use(cors({
  origin(origin, cb) {
    // origin is undefined for curl/server-to-server calls
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,                        // allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  maxAge: 600,                              // cache preflight for 10 minutes
}));`,
        },
        {
          title: 'What the browser sends and receives',
          lang: 'text',
          code: `--> OPTIONS /orders/5            (preflight, sent automatically)
    Origin: https://app.example.com
    Access-Control-Request-Method: PATCH
    Access-Control-Request-Headers: content-type, authorization

<-- 204 No Content
    Access-Control-Allow-Origin: https://app.example.com
    Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE
    Access-Control-Allow-Headers: Content-Type,Authorization,Idempotency-Key
    Access-Control-Allow-Credentials: true
    Access-Control-Max-Age: 600
    Vary: Origin

--> PATCH /orders/5              (the real request, only if preflight passed)`,
        },
      ],
      output: `The React app on \`localhost:5173\` calls \`PATCH /orders/5\` with a JSON body and a Bearer token. The browser first sends \`OPTIONS\`. The server answers with the allow headers, so the browser sends the real PATCH. For the next 10 minutes the browser skips the preflight for this URL. A page on \`https://evil.com\` gets blocked — the browser refuses to give its JavaScript the response.`,
      questions: [
        { q: 'What triggers a CORS preflight?', a: 'Any non-simple request: methods other than GET/HEAD/POST, custom headers like `Authorization`, or a Content-Type such as `application/json`.' },
        { q: 'Why can\'t I use `*` with credentials?', a: 'The spec forbids it. With cookies, the server must name the exact origin in `Access-Control-Allow-Origin` and set `Access-Control-Allow-Credentials: true`.' },
        { q: 'Does CORS protect my API from attackers?', a: 'No. It only stops browsers from reading responses. curl, Postman or a server can call your API freely. You still need authentication, authorization and rate limiting.' },
        { q: 'Why does my request work in Postman but fail in the browser?', a: 'Postman does not enforce CORS. The browser does, and your server is not sending the right `Access-Control-*` headers (often for the OPTIONS preflight).' },
        { q: 'How do you avoid CORS entirely?', a: 'Serve frontend and API from the same origin, for example through a reverse proxy (`/api` on the same domain) or a dev-server proxy in Vite/Next.js.' },
      ],
      spoken: `"Browsers block JavaScript from reading responses from a different origin — that's the same-origin policy. CORS lets the server opt in by sending headers like Access-Control-Allow-Origin. For non-simple requests, like a PUT, a JSON content type or an Authorization header, the browser first sends an OPTIONS preflight to check what's allowed, and I cache that with Max-Age. If cookies are involved, the origin must be exact, not a star, and credentials must be true. And importantly, CORS is enforced only by browsers — it's not a security layer for the API itself."`,
      mistakes: [
        'Thinking CORS is a server-side security feature. It only protects browser users.',
        'Reflecting any `Origin` header back with credentials allowed. That lets every site read your users\' data.',
        'Auth middleware rejecting the `OPTIONS` preflight with 401. Preflights carry no credentials; let them through to the CORS handler first.',
        'Follow-up trap: "Is http://localhost:3000 the same origin as http://localhost:5173?" No. A different port is a different origin.',
      ],
      takeaway: 'CORS = server-sent permission for browsers to read cross-origin responses; preflight = the OPTIONS check before non-simple requests.',
    },
    {
      id: 'idempotency-key',
      title: 'Idempotency and the Idempotency-Key Header',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Make unsafe POSTs (like payments) safe to retry by sending a unique key; the server stores the first result and replays it for repeats.',
      what: `**Idempotent** means doing something many times has the same effect as doing it once.

POST is not idempotent. If the client sends "charge ₹500", the network times out, and the client retries — the customer may be **charged twice**.

The fix: the client creates a unique id (a UUID) per **logical operation** and sends it in a header: \`Idempotency-Key: 7f3a...\`. The server:
1. First time it sees the key: runs the action and **saves the response** with the key.
2. Next time the same key comes: does **not** run it again — returns the saved response.

Stripe made this pattern popular.

#### Deeper version
Details that make it correct:
- **Atomic claim**: two retries can arrive at the same time. Insert the key with a **unique index** (or Redis \`SET NX\`) before doing work. The loser of the race gets "in progress" (409) or waits.
- **Bind the key to the request**: store a hash of the body. Same key + different body = return 422 (client bug).
- **Scope** the key per user/account so users cannot collide.
- **Expiry**: keep keys for a limited time (Stripe uses 24 hours) with a TTL index.
- **Do not cache some failures**: if the request failed before doing anything (validation, or a crash), allow a retry to run again. Cache final results (success and definite business failures).
- Combine with **database constraints** (unique order number) and the **outbox pattern** for side effects.

The IETF has a draft standard for the \`Idempotency-Key\` header; check the current status if asked about the spec.`,
      why: `Networks fail. Mobile users double-tap. Load balancers and SDKs retry. For payments, orders, emails and stock changes, "exactly once" effects matter. Idempotency keys turn "at least once" delivery into "effectively once" processing.`,
      analogy: `When you buy a train ticket, the booking form has a reference number. If you press "Pay" twice, the clerk sees the same reference and says "Already booked — here is your ticket" instead of booking a second seat.`,
      code: [
        {
          title: 'Idempotency middleware with MongoDB',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';
import mongoose from 'mongoose';

const IdemSchema = new mongoose.Schema({
  key: String, userId: String, bodyHash: String,
  status: { type: String, enum: ['processing', 'done'] },
  responseCode: Number, responseBody: Object,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }, // TTL: 24h
});
IdemSchema.index({ userId: 1, key: 1 }, { unique: true });
const Idem = mongoose.model('Idem', IdemSchema);

export async function idempotent(req, res, next) {
  const key = req.get('Idempotency-Key');
  if (!key) return res.status(400).json({ error: 'Idempotency-Key header required' });
  const bodyHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

  try {
    // Atomic claim: only one request can insert this key
    await Idem.create({ key, userId: req.user.sub, bodyHash, status: 'processing' });
  } catch (e) {
    if (e.code !== 11000) throw e; // 11000 = duplicate key
    const saved = await Idem.findOne({ key, userId: req.user.sub });
    if (saved.bodyHash !== bodyHash) return res.status(422).json({ error: 'Key reused with different body' });
    if (saved.status === 'processing') return res.status(409).json({ error: 'Request in progress' });
    return res.status(saved.responseCode).json(saved.responseBody); // replay
  }

  // Capture the response so we can save it
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    Idem.updateOne({ key, userId: req.user.sub },
      { status: 'done', responseCode: res.statusCode, responseBody: body }).catch(console.error);
    return originalJson(body);
  };
  // Note: if the handler crashes, delete the key in your error handler so a retry can run.
  next();
}

app.post('/payments', authenticate, idempotent, createPayment);`,
        },
        {
          title: 'Client: one key per operation, reused on retry',
          lang: 'javascript',
          code: `async function pay(amount) {
  const key = crypto.randomUUID(); // made ONCE for this payment
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify({ amount }),
      });
      if (res.status !== 409) return res.json(); // 409 = still processing, try again
    } catch {
      // network error: retry with the SAME key
    }
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  throw new Error('Payment status unknown');
}`,
        },
      ],
      output: `First call with key \`abc\`: the key is inserted, the payment runs, and the 201 response is saved. The response is lost on the network, so the client retries with \`abc\`. The insert fails with duplicate key 11000, the server finds status \`done\` and **replays** the same 201 body — no second charge. If two retries arrive at the exact same moment, only one insert wins; the other gets 409 and tries again later.`,
      questions: [
        { q: 'What is an idempotency key?', a: 'A unique client-generated id sent with a non-idempotent request. The server stores the result under that key and returns the stored result for any repeat, so the action runs only once.' },
        { q: 'How do you handle two requests with the same key at the same time?', a: 'Claim the key atomically first (unique index insert or Redis `SET NX`). The second request sees the claim and returns 409 "in progress" or waits for the result.' },
        { q: 'What if the same key comes with a different body?', a: 'Reject it (often 422), because it signals a client bug. Store a hash of the request body with the key to detect this.' },
        { q: 'How long do you keep keys?', a: 'Long enough to cover all realistic retries, commonly 24 hours, using a TTL index or Redis expiry.' },
      ],
      spoken: `"POST isn't idempotent, so a retry after a timeout can create a duplicate payment. The fix is an Idempotency-Key header: the client generates a UUID once per operation and reuses it on retries. On the server I atomically claim that key with a unique index, run the action, and store the response. If the same key comes again, I replay the saved response instead of charging again. I also store a body hash to catch key reuse with a different payload, scope keys per user, expire them after about 24 hours, and return 409 if the first request is still processing. Stripe's API works this way."`,
      mistakes: [
        'Generating a new key on every retry. Then every retry looks like a new payment.',
        'Checking "does the key exist?" and then inserting in two steps. Two parallel requests both pass the check — use an atomic insert.',
        'Caching a 500 caused by a crash forever, so the client can never succeed. Let unfinished or crashed attempts be retried.',
        'Follow-up trap: "Is the idempotency key enough on its own?" Add DB-level guarantees too (unique constraints, transactions) and make downstream calls (like Stripe) idempotent by passing your own key to them.',
      ],
      takeaway: 'One key per operation, claimed atomically, response stored and replayed — that is how retries stay safe for payments.',
    },
    {
      id: 'jwt-basics',
      title: 'JWT: Structure, Signing and Verification',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A JWT is header.payload.signature in base64url; the signature proves it was not changed, but the payload is readable by anyone.',
      what: `A **JWT** (JSON Web Token) is a compact string with three parts separated by dots:

\`header.payload.signature\`

- **Header** — the algorithm, like \`{"alg":"HS256","typ":"JWT"}\`.
- **Payload** — the **claims** (data): \`{"sub":"u_42","role":"admin","exp":1735689600}\`.
- **Signature** — a hash of header + payload made with a secret key.

Each part is **base64url-encoded**, not encrypted. Anyone can decode and read the payload. The signature only proves that **nobody changed it**.

#### Deeper version
**Standard claims**: \`sub\` (subject/user id), \`exp\` (expiry), \`iat\` (issued at), \`nbf\` (not before), \`iss\` (issuer), \`aud\` (audience), \`jti\` (unique token id, for revocation lists).

**Algorithms**:
- **HS256** (HMAC + shared secret): the same secret signs and verifies. Simple, but every verifier can also create tokens.
- **RS256 / ES256** (asymmetric): a **private key** signs, a **public key** verifies. Other services can verify without being able to mint tokens. Public keys are shared through a **JWKS** endpoint (\`/.well-known/jwks.json\`), and \`kid\` in the header tells which key was used (enables key rotation).

**Verification checklist**: check the signature, **pin the allowed algorithm** (never trust \`alg\` from the token — the old \`alg: none\` attack), and check \`exp\`, \`iss\` and \`aud\`.

**JWS vs JWE**: what everyone calls a JWT is a JWS (signed). JWE is the encrypted variant, rarely used in normal apps.`,
      why: `JWTs let any server check who the user is **without a database lookup** — just verify the signature. That fits microservices, serverless and mobile apps. Knowing the structure stops classic mistakes like putting secrets in the payload.`,
      analogy: `A JWT is like a cinema ticket with a hologram. Anyone can read the ticket (movie, seat, time) — it is not secret. But the hologram (signature) cannot be copied, so if someone edits the seat number with a pen, the usher sees the hologram does not match.`,
      code: [
        {
          title: 'Sign and verify with jsonwebtoken',
          lang: 'javascript',
          code: `import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET; // long random string, never in code

const token = jwt.sign(
  { sub: 'u_42', role: 'admin' },          // payload: no passwords or secrets!
  SECRET,
  { algorithm: 'HS256', expiresIn: '15m', issuer: 'api.example.com', audience: 'web' }
);
console.log(token.split('.').length); // 3

// Anyone can read the payload (it is NOT encrypted)
const payloadPart = token.split('.')[1];
console.log(JSON.parse(Buffer.from(payloadPart, 'base64url').toString()));

// Verify: pin the algorithm and check issuer/audience
try {
  const claims = jwt.verify(token, SECRET, {
    algorithms: ['HS256'], issuer: 'api.example.com', audience: 'web',
  });
  console.log('valid for user', claims.sub);
} catch (err) {
  console.log(err.name); // TokenExpiredError / JsonWebTokenError
}`,
        },
      ],
      output: `The token has 3 parts. Decoding the middle part prints \`{ sub: 'u_42', role: 'admin', iat: ..., exp: ..., aud: 'web', iss: 'api.example.com' }\` — proof that anyone can read it. \`jwt.verify\` succeeds and prints \`valid for user u_42\`. If someone changes \`role\` to \`superadmin\` and re-encodes the payload, the signature no longer matches and \`verify\` throws \`JsonWebTokenError: invalid signature\`. After 15 minutes it throws \`TokenExpiredError\`.`,
      questions: [
        { q: 'What are the three parts of a JWT?', a: 'Header (algorithm and type), payload (claims like sub, exp, role) and signature. Each is base64url-encoded and joined with dots.' },
        { q: 'Is a JWT encrypted?', a: 'No, a normal JWT is only signed. Anyone can decode the payload. Never put passwords, card data or secrets in it.' },
        { q: 'HS256 vs RS256?', a: 'HS256 uses one shared secret to sign and verify. RS256 uses a private key to sign and a public key to verify, so many services can verify tokens without being able to create them.' },
        { q: 'What is the alg none attack?', a: 'Old libraries trusted the `alg` header; an attacker set it to `none` and removed the signature. Always pass an explicit `algorithms` list when verifying.' },
        { q: 'What is JWKS?', a: 'A JSON Web Key Set — a public URL where an issuer publishes its public keys. Verifiers pick the right key using the `kid` header, which makes key rotation easy.' },
      ],
      spoken: `"A JWT has three base64url parts: a header with the algorithm, a payload with claims like sub, exp and role, and a signature. The important point is that it's signed, not encrypted — anyone can read the payload, but nobody can change it without breaking the signature. So I never put secrets in it. With HS256 one shared secret signs and verifies; with RS256 a private key signs and services verify with a public key from a JWKS endpoint. When verifying, I pin the algorithm and check expiry, issuer and audience."`,
      mistakes: [
        'Putting sensitive data (email of other users, internal flags, passwords) in the payload because "it\'s a token".',
        'Using `jwt.decode()` instead of `jwt.verify()` — decode does not check the signature at all.',
        'Using a short or guessable HS256 secret. It can be brute-forced offline from any token.',
        'Follow-up trap: "Can you invalidate a JWT?" Not by itself — it is valid until `exp`. You need short expiry, refresh-token revocation, or a denylist by `jti`.',
      ],
      takeaway: 'JWT = readable claims + tamper-proof signature; verify with a pinned algorithm and never store secrets in it.',
    },
    {
      id: 'jwt-access-refresh',
      title: 'Access vs Refresh Tokens (Storage, Expiry, Rotation)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Short-lived access tokens call APIs; long-lived refresh tokens get new access tokens. Rotate refresh tokens and detect reuse.',
      what: `Using one long-lived token is risky: if stolen, the attacker has access for days. So we use **two tokens**:

- **Access token** — short life (5-15 minutes). Sent with every API call. If stolen, it soon expires.
- **Refresh token** — long life (days or weeks). Used **only** to get a new access token from \`/auth/refresh\`. Sent rarely, stored carefully, and the server keeps a record so it can be **revoked**.

**Where to store them (browser):**
- Access token: in **memory** (a JS variable / React state). Gone on page reload, which is fine — just refresh.
- Refresh token: in an \`HttpOnly; Secure; SameSite=Strict\` cookie, scoped with \`Path=/auth/refresh\`. JavaScript cannot read it, so XSS cannot steal it.

#### Deeper version
**Refresh token rotation**: every time a refresh token is used, the server issues a **new** refresh token and invalidates the old one. All tokens from one login belong to a **family**.

**Reuse detection**: if an old (already used) refresh token shows up again, someone stole it. The server **revokes the whole family**, forcing the real user to log in again. This limits the damage of a stolen refresh token.

Store refresh tokens **hashed** in the DB (like passwords), with \`userId\`, \`familyId\`, \`expiresAt\`, \`revokedAt\`. Logout = revoke the family. "Log out of all devices" = revoke all families for the user.

**Client side**: when an API returns 401, call refresh once, then retry. If several requests fail at the same time, share **one** refresh promise so you do not fire 5 refreshes (which with rotation would look like reuse!).

Mobile apps store refresh tokens in the secure keychain/keystore.`,
      why: `This balances security and user experience. Short access tokens limit damage and keep APIs stateless and fast. Refresh tokens keep users logged in for weeks without asking for the password, while still being revocable on the server.`,
      analogy: `An access token is a **day pass** to the gym — it expires tonight. The refresh token is your **membership card** kept safe at home. Each morning you show the membership card at reception to get a new day pass. If reception sees the same old card used twice, they cancel the membership because it was copied.`,
      code: [
        {
          title: 'Refresh endpoint with rotation and reuse detection',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const hash = (t) => crypto.createHash('sha256').update(t).digest('hex');
const cookieOpts = { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth/refresh',
  maxAge: 1000 * 60 * 60 * 24 * 30 };

async function issueTokens(res, userId, familyId = crypto.randomUUID()) {
  const refresh = crypto.randomBytes(32).toString('hex'); // opaque random string
  await RefreshToken.create({ tokenHash: hash(refresh), userId, familyId,
    expiresAt: new Date(Date.now() + cookieOpts.maxAge) });
  res.cookie('rt', refresh, cookieOpts);
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

app.post('/auth/refresh', async (req, res) => {
  const presented = req.cookies.rt; // needs cookie-parser
  if (!presented) return res.status(401).end();
  const row = await RefreshToken.findOne({ tokenHash: hash(presented) });
  if (!row || row.expiresAt < new Date()) return res.status(401).end();

  if (row.revokedAt) {
    // REUSE! An old token came back -> kill the whole family
    await RefreshToken.updateMany({ familyId: row.familyId }, { revokedAt: new Date() });
    return res.status(401).json({ error: 'Token reuse detected' });
  }

  // Atomically mark the current token used (prevents two parallel uses)
  const used = await RefreshToken.updateOne({ _id: row._id, revokedAt: null }, { revokedAt: new Date() });
  if (used.modifiedCount === 0) return res.status(401).end();

  const accessToken = await issueTokens(res, row.userId, row.familyId);
  res.json({ accessToken });
});`,
        },
        {
          title: 'Client: refresh once on 401, share the promise',
          lang: 'javascript',
          code: `let accessToken = null;      // in memory only
let refreshing = null;       // one shared refresh at a time

async function refresh() {
  refreshing ??= fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('logged out'))))
    .then((d) => (accessToken = d.accessToken))
    .finally(() => (refreshing = null));
  return refreshing;
}

export async function api(url, opts = {}) {
  const call = () => fetch(url, { ...opts, headers: { ...opts.headers, Authorization: \`Bearer \${accessToken}\` } });
  let res = await call();
  if (res.status === 401) {
    await refresh();   // throws if the refresh token is dead -> redirect to login
    res = await call();
  }
  return res;
}`,
        },
      ],
      output: `Login returns a 15-minute access token (kept in memory) and sets the \`rt\` cookie. After 15 minutes an API call returns 401; the client calls \`/auth/refresh\`, gets a new access token **and** a new refresh cookie, then retries the call — the user notices nothing. If an attacker had copied the old refresh token and uses it later, the server sees a revoked token, revokes the entire family, and both attacker and user must log in again.`,
      questions: [
        { q: 'Why have both access and refresh tokens?', a: 'Access tokens are short-lived and sent everywhere, so theft has a small window. Refresh tokens live longer but are sent only to one endpoint and can be revoked on the server. Together you get security and long sessions.' },
        { q: 'Where do you store tokens in a browser app?', a: 'Access token in memory; refresh token in an HttpOnly, Secure, SameSite cookie scoped to the refresh path. Avoid localStorage for long-lived tokens because of XSS.' },
        { q: 'What is refresh token rotation?', a: 'Each refresh returns a new refresh token and invalidates the old one. If an old one is used again, that signals theft, and the whole token family is revoked.' },
        { q: 'How do you handle many parallel 401s on the client?', a: 'Queue them behind a single shared refresh promise, then retry them all with the new access token. Otherwise you trigger several refreshes and, with rotation, false reuse detection.' },
        { q: 'What expiry would you choose?', a: 'Commonly 5-15 minutes for access tokens and 7-30 days for refresh tokens, with an absolute maximum session length. It depends on the risk of the app.' },
      ],
      spoken: `"I use two tokens. The access token is a short-lived JWT, around fifteen minutes, sent as a Bearer header and kept in memory on the client. The refresh token is a long-lived random string in an HttpOnly, Secure, SameSite cookie, sent only to the refresh endpoint and stored hashed in the database. On every refresh I rotate it — issue a new one and revoke the old one. If a revoked token ever comes back, that means theft, so I revoke the whole token family. On the client, I make sure parallel 401s share a single refresh request."`,
      mistakes: [
        'Long-lived access tokens (days). A stolen token works for days with no way to stop it.',
        'Storing refresh tokens in plain text in the DB. Hash them like passwords.',
        'Firing multiple refresh calls at once and triggering your own reuse detection.',
        'Follow-up trap: "Can the refresh token be a JWT?" It can, but an opaque random string stored server-side is simpler — you must look it up to revoke it anyway, so the JWT\'s stateless benefit is lost.',
      ],
      takeaway: 'Short access token in memory, rotating refresh token in an HttpOnly cookie, reuse detection revokes the family.',
    },
    {
      id: 'samesite-csrf',
      title: 'SameSite Cookies and CSRF',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'CSRF tricks a browser into sending cookie-authenticated requests from another site; SameSite=Lax/Strict plus CSRF tokens stop it.',
      what: `**CSRF** (Cross-Site Request Forgery): you are logged in to \`bank.com\` (cookie saved). You visit \`evil.com\`, which has a hidden form that POSTs to \`bank.com/transfer\`. The browser **automatically attaches your bank cookie**, so the bank thinks you sent it.

**SameSite** is a cookie attribute that controls whether the cookie is sent on cross-site requests:
- \`SameSite=Strict\` — never sent from other sites. Even clicking a link from Gmail to your site arrives "logged out".
- \`SameSite=Lax\` — sent on top-level **GET navigations** (clicking a link), but not on cross-site POSTs, iframes or fetch. Good default. Modern browsers treat cookies with no SameSite as Lax by default (Chrome does; check other browsers).
- \`SameSite=None; Secure\` — always sent (needed for third-party widgets, embedded iframes, or API on a totally different site).

#### Deeper version
**Site vs origin**: "same-site" compares the registrable domain (\`app.example.com\` and \`api.example.com\` are **same-site** but **cross-origin**). So SameSite does not protect you from a compromised sibling subdomain.

Other cookie flags:
- \`HttpOnly\` — JavaScript cannot read it (protects from XSS theft).
- \`Secure\` — only sent over HTTPS.
- \`Domain\` / \`Path\` — where it is sent. Prefix \`__Host-\` forces Secure, Path=/ and no Domain.
- \`Max-Age\` / \`Expires\` — lifetime.

**Defense in depth for CSRF**:
1. SameSite=Lax or Strict.
2. **CSRF token**: a random value the server gives the page; the client sends it in a header or form field, and the server compares it. Common style: **double-submit cookie** (cookie + matching header).
3. Check the \`Origin\` / \`Referer\` header on state-changing requests.
4. Never change state with GET.

APIs that use \`Authorization: Bearer\` headers (not cookies) are **not** vulnerable to CSRF, because browsers do not add that header automatically.`,
      why: `Cookie-based auth is convenient but the browser's automatic sending is exactly what CSRF abuses. Understanding SameSite and CSRF tokens is needed whenever you put sessions or refresh tokens in cookies.`,
      analogy: `Your house key (cookie) works automatically in your door. CSRF is a stranger tricking you into opening your own door for them. SameSite=Strict is a door that only opens if you arrive from inside your own garden; Lax also opens when you walk up the main path, but not for parcels pushed through from the neighbour's yard.`,
      code: [
        {
          title: 'Secure cookie + double-submit CSRF token',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// 1) On login, set the session cookie AND a readable CSRF cookie
app.post('/login', async (req, res) => {
  const sessionId = await createSession(req.body); // your login logic
  res.cookie('__Host-sid', sessionId, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  res.cookie('csrf', crypto.randomBytes(16).toString('hex'), { secure: true, sameSite: 'lax' });
  res.status(204).end();
});

// 2) For state-changing requests, header must match cookie, and Origin must be ours
function csrfCheck(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('Origin');
  if (origin && origin !== 'https://app.example.com') return res.status(403).end();
  const fromCookie = req.cookies.csrf;
  const fromHeader = req.get('X-CSRF-Token');
  if (!fromCookie || fromCookie !== fromHeader) return res.status(403).json({ error: 'CSRF' });
  next();
}
app.use(csrfCheck);

// 3) Frontend reads the csrf cookie (not HttpOnly) and sends it as a header
// fetch('/transfer', { method: 'POST', credentials: 'include',
//   headers: { 'X-CSRF-Token': getCookie('csrf') }, body })`,
        },
      ],
      output: `Our own React app reads the \`csrf\` cookie and copies it into the \`X-CSRF-Token\` header, so its POSTs pass. A form on \`evil.com\` posting to our API fails twice: SameSite=Lax stops the session cookie on a cross-site POST, and even if it got through, \`evil.com\` cannot read our \`csrf\` cookie, so the header is missing → **403**. The session cookie stays HttpOnly, so XSS cannot read it.`,
      questions: [
        { q: 'What is CSRF?', a: 'An attack where another site makes the victim\'s browser send a request to your site, and the browser attaches the victim\'s cookies automatically, so the request looks legitimate.' },
        { q: 'Strict vs Lax vs None?', a: 'Strict: never sent cross-site. Lax: sent only on top-level GET navigations. None: always sent, but requires Secure. Lax is the usual default.' },
        { q: 'Are JWTs in Authorization headers vulnerable to CSRF?', a: 'No, because the browser does not attach that header automatically. They are more exposed to XSS if stored in JS-readable storage.' },
        { q: 'Is SameSite enough on its own?', a: 'It is a strong first layer, but add CSRF tokens or Origin checks for sensitive actions, because same-site subdomains and older browsers can bypass it.' },
      ],
      spoken: `"CSRF happens because browsers attach cookies automatically, so a malicious site can make your browser send a POST to your bank with your session cookie. SameSite controls that: Strict never sends the cookie cross-site, Lax only sends it on top-level GET navigations, and None always sends it but needs Secure. I default to Lax with HttpOnly and Secure. For sensitive actions I add a CSRF token, usually double-submit — the frontend copies a cookie value into a header and the server compares them — plus an Origin check. Bearer-token APIs aren't vulnerable to CSRF, but they shift the risk to XSS."`,
      mistakes: [
        'Changing data with GET requests. SameSite=Lax still sends cookies on top-level GET links.',
        'Using `SameSite=None` without `Secure` — browsers reject the cookie.',
        'Thinking HttpOnly prevents CSRF. HttpOnly is about XSS reading the cookie, not about it being sent.',
        'Follow-up trap: "Are app.example.com and api.example.com same-site?" Yes, same-site (same registrable domain) but different origins — so CORS applies, and SameSite does not block requests between them.',
      ],
      takeaway: 'Cookies are sent automatically — use SameSite=Lax/Strict, HttpOnly, Secure, plus CSRF tokens or Origin checks for unsafe methods.',
    },
    {
      id: 'rbac',
      title: 'RBAC (Role-Based Access Control)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Give users roles, give roles permissions, and check permissions (not role names) in code.',
      what: `**RBAC** means you do not give permissions to each user one by one. Instead:

1. Define **permissions** — small actions like \`order:read\`, \`order:refund\`, \`user:delete\`.
2. Group them into **roles** — \`viewer\`, \`support\`, \`admin\`.
3. Assign **roles to users**.

The code checks **"does this user have permission \`order:refund\`?"**, not "is this user an admin?". Then adding a new role later needs no code changes.

#### Deeper version
- **Multi-tenant RBAC**: in SaaS, a user can be \`admin\` in Company A and \`viewer\` in Company B. Store roles per membership: \`{ userId, orgId, role }\`, and always check the role **for the current org**.
- **Role hierarchy**: \`admin\` inherits everything from \`editor\`, which inherits from \`viewer\`.
- **RBAC + ownership**: roles answer "can you refund orders?"; you still need object-level checks ("is this order in your org?").
- **ABAC** (attribute-based) adds rules on attributes: "managers can approve expenses under ₹50,000 in their own department during business hours". More flexible, more complex. Libraries like CASL, or policy engines like OPA / Cerbos, help.
- **Where to put roles**: you can put roles in the JWT for speed, but changes only apply when the token refreshes. For instant changes, load permissions from DB/cache per request.
- Principle of **least privilege**: give the smallest set of permissions needed.`,
      why: `Hard-coded \`if (user.role === 'admin')\` checks spread across hundreds of files. When the business asks for a new "support" role that can refund but not delete, you must find and change every check. RBAC with permissions keeps rules in one place and makes audits easy.`,
      analogy: `In a hospital, doctors, nurses and receptionists wear different badges (roles). The doors (permissions) are programmed to open for certain badges. When a new nurse joins, you give her a nurse badge — you do not reprogram every door.`,
      code: [
        {
          title: 'Permission-based RBAC middleware (multi-tenant)',
          lang: 'javascript',
          code: `// One place that maps roles to permissions
const ROLE_PERMISSIONS = {
  viewer: ['order:read'],
  support: ['order:read', 'order:refund'],
  admin: ['order:read', 'order:refund', 'order:delete', 'user:manage'],
};

const can = (role, permission) => ROLE_PERMISSIONS[role]?.includes(permission) ?? false;

// Membership: role is per organisation
const requirePermission = (permission) => async (req, res, next) => {
  const membership = await Membership.findOne({ userId: req.user.sub, orgId: req.params.orgId });
  if (!membership) return res.status(404).json({ error: 'Not found' });
  if (!can(membership.role, permission)) return res.status(403).json({ error: 'Forbidden' });
  req.membership = membership;
  next();
};

app.post('/orgs/:orgId/orders/:id/refund', authenticate, requirePermission('order:refund'),
  async (req, res) => {
    // Object-level check too: the order must belong to this org
    const order = await Order.findOne({ _id: req.params.id, orgId: req.params.orgId });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(await refund(order));
  });`,
        },
      ],
      output: `A \`viewer\` calling the refund endpoint gets **403**. A \`support\` user in the same org passes and the refund runs. A \`support\` user from another org gets **404** because they have no membership in this org. If product later adds a \`finance\` role with \`order:refund\`, you add one line to \`ROLE_PERMISSIONS\` — no route changes.`,
      questions: [
        { q: 'What is RBAC?', a: 'Role-Based Access Control: permissions are attached to roles, roles are assigned to users, and the code checks permissions.' },
        { q: 'RBAC vs ABAC?', a: 'RBAC decides by role only. ABAC decides by attributes of the user, the resource and the context (department, amount, time). ABAC is more flexible but harder to manage.' },
        { q: 'Should roles be stored in the JWT?', a: 'It is fast but stale until the token is refreshed. Keep access tokens short, or look up permissions per request (with caching) when changes must apply instantly.' },
        { q: 'How do you handle roles in a multi-tenant SaaS?', a: 'Store the role on the user-organisation membership, not on the user, and always check it against the organisation in the current request.' },
      ],
      spoken: `"RBAC means users get roles, roles get permissions, and the code checks permissions like order:refund rather than role names. That way, adding a new role is a config change instead of a code change. In SaaS apps I store the role on the membership between user and organisation, since the same person can be an admin in one org and a viewer in another. RBAC covers function-level access, but I still add object-level checks, like making sure the order belongs to that org. For rules based on amounts or departments, I'd move to ABAC with something like CASL."`,
      mistakes: [
        'Checking `role === "admin"` all over the code instead of checking permissions.',
        'Storing one global role on the user in a multi-tenant app — an admin in one org becomes admin everywhere.',
        'Relying on RBAC alone and forgetting object-level ownership checks.',
        'Follow-up trap: "A user was demoted but can still do admin things — why?" Their JWT still contains the old role until it expires. Shorten expiry or check permissions from the DB/cache.',
      ],
      takeaway: 'Users → roles → permissions; check permissions in one place, scope roles per tenant, and still check ownership.',
    },
    {
      id: 'http-caching',
      title: 'HTTP Caching (Cache-Control, ETag, 304)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Cache-Control says how long a response can be reused; ETag lets the client ask "has it changed?" and get a tiny 304 if not.',
      what: `HTTP caching lets browsers and CDNs **reuse** a response instead of downloading it again.

Two ideas:
1. **Freshness** — \`Cache-Control: max-age=3600\` means "this copy is good for 1 hour; don't even ask".
2. **Validation** — after it expires, the client asks "has it changed?" using an **ETag** (a version fingerprint of the content). It sends \`If-None-Match: "abc"\`. If nothing changed, the server replies **304 Not Modified** with **no body**. The client reuses its copy.

#### Deeper version
Useful \`Cache-Control\` directives:
- \`public\` — any cache (CDN) may store it. \`private\` — only the user's browser (for personal data).
- \`no-cache\` — you **may** store it, but must revalidate every time (it does **not** mean "don't cache").
- \`no-store\` — never store it (bank pages, sensitive data).
- \`max-age=N\` (browser) and \`s-maxage=N\` (shared caches like CDNs).
- \`immutable\` — file never changes (hashed assets like \`app.3f9a.js\`), so never revalidate.
- \`stale-while-revalidate=N\` — serve the stale copy now, refresh in the background.

Validators:
- **ETag / If-None-Match** — content-based. Strong (\`"abc"\`) or weak (\`W/"abc"\`, "same meaning").
- **Last-Modified / If-Modified-Since** — time-based, one-second precision.

\`Vary\` tells caches which request headers change the response (\`Vary: Accept-Encoding\`, \`Vary: Origin\`, \`Vary: Authorization\`).

ETags also enable **optimistic concurrency**: \`PUT\` with \`If-Match: "v3"\` → server returns **412 Precondition Failed** if someone else changed it first.

Common strategy: HTML \`no-cache\`, hashed JS/CSS \`max-age=31536000, immutable\`, API data short \`max-age\` or \`private, no-cache\` with ETags.`,
      why: `Caching cuts latency, bandwidth and server load — often the cheapest performance win. A 304 saves sending the body. CDNs can serve millions of requests without touching your servers. Getting it wrong either shows stale data or leaks one user's private data to another through a shared cache.`,
      analogy: `You keep a printed bus timetable at home. \`max-age\` is "valid until Sunday — don't check". After Sunday you call the bus office: "Is version 12 still current?" (ETag). They say "Yes, still 12" (304) — you keep your printout without them reading out the whole timetable again.`,
      code: [
        {
          title: 'ETag and Cache-Control in Express',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';

app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).end();

  const body = JSON.stringify(product);
  const etag = '"' + crypto.createHash('sha1').update(body).digest('hex') + '"';

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.set('ETag', etag);

  if (req.get('If-None-Match') === etag) {
    return res.status(304).end(); // client copy is still good, no body
  }
  res.type('json').send(body);
});

// Personal data: browser only, always revalidate
app.get('/me', authenticate, (req, res) => {
  res.set('Cache-Control', 'private, no-cache');
  res.json({ id: req.user.sub });
});

// Static hashed assets: cache "forever"
app.use('/assets', express.static('dist/assets', { maxAge: '1y', immutable: true }));`,
        },
        {
          title: 'What goes over the wire',
          lang: 'text',
          code: `1st request:
GET /products/7
<-- 200 OK   ETag: "9f2c..."   Cache-Control: public, max-age=60   (full body)

Within 60s: browser uses its copy, no request at all.

After 60s:
GET /products/7
If-None-Match: "9f2c..."
<-- 304 Not Modified   (no body, reuse cached copy)`,
        },
      ],
      output: `The first request returns the full JSON with an ETag. For 60 seconds the browser (and any CDN, because of \`public\`) serves it without contacting the server. After that, the browser revalidates with \`If-None-Match\`; if the product has not changed, the server answers **304** with an empty body — fast and cheap. Note Express also adds weak ETags automatically by default; the manual version shows how it works.`,
      questions: [
        { q: 'What is the difference between no-cache and no-store?', a: '`no-cache` allows storing but requires revalidation before every use. `no-store` forbids storing at all.' },
        { q: 'How does an ETag work?', a: 'The server sends a fingerprint of the content. The client sends it back in `If-None-Match`. If it matches, the server returns 304 with no body, and the client uses its cache.' },
        { q: 'What is the difference between private and public?', a: '`private` means only the end user\'s browser may cache it (personal data). `public` lets shared caches like CDNs store it too.' },
        { q: 'How do you cache static assets forever but still deploy updates?', a: 'Put a content hash in the file name (`app.3f9a.js`) and serve it with `max-age=31536000, immutable`. A new build gets a new name, and the HTML (no-cache) points to it.' },
        { q: 'How can ETags prevent lost updates?', a: 'The client sends `If-Match: "<etag>"` with a PUT. If the resource changed meanwhile, the server returns 412 Precondition Failed instead of overwriting.' },
      ],
      spoken: `"HTTP caching has two parts. Freshness, with Cache-Control max-age, tells the browser or CDN it can reuse a response without asking. Validation kicks in after that: the server sends an ETag, the client sends it back with If-None-Match, and if nothing changed the server returns a 304 with no body. I use public with s-maxage for shared data on a CDN, private and no-cache for user data, and no-store for sensitive pages. For static builds I use hashed file names with a one-year immutable cache. ETags with If-Match also help prevent lost updates."`,
      mistakes: [
        'Thinking `no-cache` means "do not cache". It means "revalidate first"; `no-store` means do not cache.',
        'Marking personalised responses as `public`, so a CDN serves one user\'s data to another.',
        'Long-caching `index.html`, so users keep loading old JS bundles after a deploy.',
        'Follow-up trap: "Do POST responses get cached?" Practically no. Caches work on GET (and HEAD). That is one downside of using POST for search.',
      ],
      takeaway: 'Cache-Control decides how long; ETag + If-None-Match decides "still the same?" → 304 with no body.',
    },
    {
      id: 'https-tls',
      title: 'HTTPS and the TLS Handshake',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'HTTPS is HTTP inside TLS: the handshake checks the server\'s certificate and agrees on a shared key, then all data is encrypted.',
      what: `**HTTPS** = HTTP + **TLS** (Transport Layer Security). TLS gives three things:
- **Encryption** — nobody on the network can read the data.
- **Integrity** — nobody can change the data on the way.
- **Authentication** — you are really talking to \`api.stripe.com\`, not an impostor.

**The handshake in plain words** (TLS 1.3):
1. **Client hello**: the browser says "hi, I support these ciphers, and here is my half of a key exchange".
2. **Server hello**: the server picks a cipher, sends its half of the key exchange and its **certificate**.
3. The browser **checks the certificate**: is it signed by a trusted Certificate Authority (CA), is the domain right, is it not expired?
4. Both sides combine the two halves into the same **session key** — without ever sending that key over the network.
5. From now on, all data is encrypted with that fast shared key.

#### Deeper version
- **Asymmetric crypto** (public/private keys) is used only in the handshake: to prove identity (certificate signature) and to agree on a key (**ECDHE** — Elliptic Curve Diffie-Hellman Ephemeral).
- **Symmetric crypto** (like AES-GCM or ChaCha20) encrypts the actual data because it is much faster.
- **Ephemeral** keys give **forward secrecy**: even if the server's private key leaks later, old recorded traffic cannot be decrypted.
- **TLS 1.3** needs **1 round trip** for the handshake (TLS 1.2 needed 2) and supports **0-RTT** resumption (fast, but 0-RTT data can be replayed, so only for idempotent requests).
- **Certificate chain**: your cert is signed by an intermediate CA, signed by a root CA that is pre-installed in the OS/browser.
- **SNI** (Server Name Indication) tells the server which domain you want, so one IP can host many certificates.
- **HSTS** header (\`Strict-Transport-Security\`) tells browsers to always use HTTPS for your domain.
- **mTLS** (mutual TLS): the client also shows a certificate. Used for service-to-service security in zero-trust networks.
- **TLS termination**: often the load balancer (ALB, nginx, Cloudflare) handles TLS and forwards plain HTTP inside the private network.`,
      why: `Without HTTPS, anyone on the same Wi-Fi or any ISP router could read passwords and tokens, or inject scripts into pages. Browsers mark HTTP sites "Not secure", HTTP/2 in browsers requires TLS, and cookies with \`Secure\` only work over HTTPS.`,
      analogy: `Two people want to talk privately in a crowded room. First, one shows an ID card stamped by the government (certificate signed by a CA). Then they use a clever trick where each mixes a private colour with a shared colour, swaps the mixtures, and both end up with the same secret colour that onlookers cannot work out (Diffie-Hellman). Then they speak in a code based on that secret colour.`,
      code: [
        {
          title: 'HTTPS server in Node and HSTS',
          lang: 'javascript',
          code: `import https from 'node:https';
import fs from 'node:fs';
import express from 'express';

const app = express();

// Force browsers to use HTTPS for a year (only send over HTTPS)
app.use((req, res, next) => {
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.get('/', (req, res) => res.send('secure hello'));

https.createServer({
  key: fs.readFileSync('./certs/server.key'),   // private key: never commit it
  cert: fs.readFileSync('./certs/server.crt'),  // certificate (public)
  minVersion: 'TLSv1.2',
}, app).listen(443);

// In production you usually terminate TLS at a load balancer / nginx / Cloudflare
// and run plain HTTP inside the private network.`,
        },
        {
          title: 'See the handshake yourself',
          lang: 'bash',
          code: `# Shows the TLS version, cipher and certificate chain
openssl s_client -connect example.com:443 -servername example.com </dev/null

# Verbose curl prints each handshake step
curl -v https://example.com -o /dev/null`,
        },
      ],
      output: `Running the server and visiting \`https://localhost\` performs a TLS handshake using the given certificate (a self-signed dev cert will show a browser warning because no trusted CA signed it). The \`openssl\` command prints the certificate chain, the protocol (e.g. \`TLSv1.3\`) and the cipher. \`curl -v\` shows lines like "TLS handshake, Client hello", "Server hello", "SSL connection using TLSv1.3".`,
      questions: [
        { q: 'Explain the TLS handshake simply.', a: 'Client and server say hello and agree on a cipher. The server sends its certificate, which the client checks against trusted CAs. Both use a Diffie-Hellman key exchange to compute the same session key without sending it. Then data is encrypted with that symmetric key.' },
        { q: 'Why use both asymmetric and symmetric encryption?', a: 'Asymmetric crypto solves identity and key agreement but is slow. Symmetric encryption is fast, so it is used for the actual data after the handshake.' },
        { q: 'What is forward secrecy?', a: 'Using fresh (ephemeral) keys per session, so a future leak of the server\'s private key cannot decrypt past recorded traffic.' },
        { q: 'What is mTLS?', a: 'Mutual TLS: both client and server present certificates. Common for service-to-service authentication inside a company or service mesh.' },
        { q: 'What is TLS termination?', a: 'Decrypting HTTPS at the edge (load balancer, reverse proxy, CDN) and forwarding traffic to app servers, often as plain HTTP inside a private network.' },
      ],
      spoken: `"HTTPS is HTTP running inside TLS, which gives encryption, integrity and server authentication. In the handshake, the client says hello with its supported ciphers and a key share, the server answers with its own key share and its certificate, and the client verifies that certificate against trusted certificate authorities. Both sides then derive the same session key using Diffie-Hellman, without sending the key itself. After that, everything is encrypted with fast symmetric crypto. TLS 1.3 does this in one round trip and gives forward secrecy. In production I usually terminate TLS at the load balancer and add HSTS."`,
      mistakes: [
        'Saying the server "sends the session key encrypted with its public key". That was old RSA key exchange; modern TLS uses (EC)DHE so the key is never sent.',
        'Thinking HTTPS hides the domain you visit. The IP and usually the domain (via SNI) are visible; only the path, headers and body are encrypted.',
        'Disabling certificate checks in code (`rejectUnauthorized: false`) to "fix" errors — that removes the protection.',
        'Follow-up trap: "Is the URL query string encrypted in HTTPS?" Yes, on the wire. But it can still leak through server logs, browser history and Referer headers, so do not put secrets in URLs.',
      ],
      takeaway: 'TLS = check the certificate, agree on a key with Diffie-Hellman, then encrypt everything with a fast symmetric key.',
    },
    {
      id: 'http-versions',
      title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'HTTP/1.1 is text, one request at a time per connection; HTTP/2 multiplexes binary streams over one TCP connection; HTTP/3 does that over QUIC (UDP).',
      what: `The meaning of HTTP (methods, headers, status codes) is the same in all versions. What changes is **how the bytes travel**.

- **HTTP/1.1** (1997): text-based. One request at a time per connection. Browsers open ~6 connections per domain to get some parallelism. Slow when a page needs 100 files.
- **HTTP/2** (2015): binary. **Multiplexing** — many requests and responses share **one** TCP connection at the same time, as separate **streams**. Headers are compressed (**HPACK**).
- **HTTP/3** (2022): same ideas as HTTP/2, but runs over **QUIC**, a new protocol built on **UDP** instead of TCP. Faster connection setup and better on bad mobile networks.

#### Deeper version
**Head-of-line (HOL) blocking**:
- In HTTP/1.1, a slow response blocks the next request on that connection.
- HTTP/2 fixed this at the HTTP level, but **TCP** still delivers bytes strictly in order. One lost packet stalls **all** streams until it is re-sent.
- HTTP/3 / QUIC handles packet loss **per stream**, so one lost packet only blocks its own stream.

**QUIC benefits**: TLS 1.3 is built in, the handshake is combined (1 RTT, 0-RTT on resumption), and **connection migration** — a phone switching from Wi-Fi to 4G keeps the same connection (connections are identified by an ID, not by IP+port).

**Other notes**:
- HTTP/2 **server push** existed but is effectively dead; Chrome removed it. Use \`103 Early Hints\` or preload instead.
- With HTTP/2, old tricks like domain sharding and sprite sheets are less useful.
- Browsers only use HTTP/2 and HTTP/3 over TLS. Servers advertise HTTP/3 via the \`Alt-Svc\` header.
- gRPC is built on HTTP/2.
- Usually your CDN or load balancer speaks HTTP/2/3 to browsers and HTTP/1.1 to your Node app — and that is fine.`,
      why: `Modern apps load many assets and call many APIs. Multiplexing and header compression reduce latency a lot. HTTP/3 helps mobile users on lossy networks. Interviewers ask this to check you understand the network under your API.`,
      analogy: `HTTP/1.1 is a single-lane road: cars (requests) go one after another; to go faster you build 6 roads. HTTP/2 is one wide highway with many lanes — but if there is one accident (lost packet), the whole highway stops because of TCP. HTTP/3 gives each lane its own barriers, so an accident only stops one lane.`,
      code: [
        {
          title: 'HTTP/2 server in Node',
          lang: 'javascript',
          code: `import http2 from 'node:http2';
import fs from 'node:fs';

// Browsers require TLS for HTTP/2
const server = http2.createSecureServer({
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
  allowHTTP1: true, // fall back for old clients
});

server.on('stream', (stream, headers) => {
  // Each request is a "stream" on the same connection
  stream.respond({ ':status': 200, 'content-type': 'application/json' });
  stream.end(JSON.stringify({ path: headers[':path'], protocol: 'h2' }));
});

server.listen(8443);`,
        },
        {
          title: 'Check which version a site uses',
          lang: 'bash',
          code: `curl -sI --http2 https://www.google.com -o /dev/null -w '%{http_version}\\n'
# prints 2

# HTTP/3 needs a curl build with HTTP/3 support
curl -sI --http3 https://www.cloudflare.com -o /dev/null -w '%{http_version}\\n'
# prints 3 (if your curl supports it)`,
        },
      ],
      output: `The Node server answers each request as a separate stream on a single TLS connection; requesting \`/a\` and \`/b\` at once does not open two connections. The curl commands print \`2\` or \`3\`, showing which protocol was negotiated (through ALPN during the TLS handshake).`,
      questions: [
        { q: 'What is the main improvement of HTTP/2 over HTTP/1.1?', a: 'Multiplexing: many requests share one connection at the same time as streams. It also uses a binary format and compresses headers with HPACK.' },
        { q: 'Why was HTTP/3 created if HTTP/2 has multiplexing?', a: 'HTTP/2 still runs on TCP, where one lost packet blocks all streams (TCP head-of-line blocking). HTTP/3 uses QUIC over UDP, which recovers loss per stream and sets up connections faster.' },
        { q: 'What is QUIC?', a: 'A transport protocol on UDP with built-in TLS 1.3, independent streams, faster handshakes and connection migration across networks.' },
        { q: 'Does my Express app need to support HTTP/2?', a: 'Usually not. A CDN, ALB or nginx can speak HTTP/2 or HTTP/3 to clients and HTTP/1.1 to your app internally.' },
      ],
      spoken: `"All HTTP versions share the same semantics; they differ in transport. HTTP/1.1 is text and handles one request at a time per connection, so browsers open about six connections. HTTP/2 is binary and multiplexes many streams over one TCP connection with header compression. But TCP still has head-of-line blocking — one lost packet stalls every stream. HTTP/3 fixes that by running on QUIC over UDP, with TLS 1.3 built in, faster handshakes and connection migration when a phone changes networks. In practice I let the CDN or load balancer handle HTTP/2 and 3."`,
      mistakes: [
        'Saying HTTP/2 fully solved head-of-line blocking. It solved it at the HTTP layer, not at the TCP layer.',
        'Recommending HTTP/2 server push. It is deprecated in practice; use preload or 103 Early Hints.',
        'Keeping HTTP/1.1 hacks like domain sharding with HTTP/2, which actually hurts by opening extra connections.',
        'Follow-up trap: "Is UDP unreliable, so HTTP/3 loses data?" No. QUIC adds reliability, ordering per stream and congestion control on top of UDP.',
      ],
      takeaway: 'Same HTTP meaning; 1.1 = one at a time, 2 = multiplexed over TCP, 3 = multiplexed over QUIC without TCP head-of-line blocking.',
    },
    {
      id: 'webhooks',
      title: 'Webhooks (HMAC Signatures, Retries, Idempotency)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A webhook is a provider calling YOUR URL when an event happens. Verify the HMAC signature on the raw body, reply 2xx fast, and process idempotently.',
      what: `A **webhook** is a "reverse API call". Instead of you asking Stripe "did the payment succeed?" every minute, Stripe **sends a POST to your URL** when it happens: \`payment_intent.succeeded\`.

Three things you must do:
1. **Verify the signature** — anyone can POST to your URL. The provider signs each request with a shared secret (HMAC). You recompute the signature and compare.
2. **Respond fast with 2xx** — then do heavy work in a background job. If you are slow or return an error, the provider **retries**.
3. **Be idempotent** — because of retries, the **same event can arrive more than once**. Store processed event ids and skip duplicates.

#### Deeper version
**HMAC** (Hash-based Message Authentication Code): \`HMAC-SHA256(secret, timestamp + "." + rawBody)\`. Only someone with the secret can produce it.

- Use the **raw body bytes**. If Express parses JSON first and you re-stringify it, spacing or key order can change and the signature will not match.
- Compare with \`crypto.timingSafeEqual\`, not \`===\`. A normal compare stops at the first different character, and attackers can measure that timing to guess the signature byte by byte.
- Check a **timestamp** in the signed data (e.g. reject if older than 5 minutes) to stop **replay attacks**.
- Support **secret rotation** (accept two secrets during the switch).

**Retries**: providers retry with **exponential backoff** for hours or days (Stripe: up to 3 days). Events can arrive **out of order** — do not assume \`created\` comes before \`updated\`. Use event timestamps/versions, or re-fetch the latest object from the provider's API.

**Sending your own webhooks**: sign them, retry with backoff, give each delivery a unique event id, log deliveries, provide a "resend" button, and disable endpoints that keep failing.`,
      why: `Webhooks give near real-time updates without polling, which is how payments, Git pushes, Shopify orders and many SaaS integrations work. Without signature checks, attackers can fake "payment succeeded". Without idempotency, retries cause double emails or double credits.`,
      analogy: `A courier rings your doorbell (webhook) instead of you calling them all day. You check their ID card with a hologram (signature). You sign quickly and close the door (2xx fast), and unpack later (background job). If the courier comes back with the same parcel number, you say "already received" (idempotency).`,
      code: [
        {
          title: 'Generic HMAC verification with timing-safe compare',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';
import express from 'express';

const SECRET = process.env.WEBHOOK_SECRET;

// Use the RAW body for this route (do not let express.json() parse it first)
app.post('/webhooks/partner', express.raw({ type: 'application/json' }), async (req, res) => {
  const timestamp = req.get('X-Timestamp');
  const signature = req.get('X-Signature') || '';

  // 1) Reject old requests (replay protection: 5 minutes)
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return res.status(400).send('stale');
  }

  // 2) Recompute HMAC over timestamp + raw body
  const expected = crypto.createHmac('sha256', SECRET)
    .update(timestamp + '.' + req.body.toString('utf8'))
    .digest('hex');

  // 3) Timing-safe compare (lengths must match first, or timingSafeEqual throws)
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(400).send('bad signature');
  }

  const event = JSON.parse(req.body.toString('utf8'));

  // 4) Idempotency: unique index on eventId makes duplicates fail
  try {
    await ProcessedEvent.create({ eventId: event.id });
  } catch (e) {
    if (e.code === 11000) return res.status(200).send('duplicate, ignored');
    throw e;
  }

  await jobQueue.add('handle-event', event); // 5) heavy work later
  res.status(200).send('ok');                // 6) answer fast
});`,
        },
        {
          title: 'Stripe: use the SDK helper',
          lang: 'javascript',
          code: `import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  let event;
  try {
    // Checks the Stripe-Signature header, timestamp tolerance and HMAC for you
    event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'),
      process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
  if (event.type === 'checkout.session.completed') {
    // enqueue fulfilment, keyed by event.id for idempotency
  }
  res.json({ received: true });
});`,
        },
      ],
      output: `A valid request passes the timestamp check, the HMAC matches, the event id is new, the job is queued, and the provider gets \`200 ok\` within milliseconds. A forged request with a wrong signature gets **400**. If the provider retries the same event (maybe our first 200 got lost), the unique index fails with 11000 and we return 200 "duplicate, ignored" — no double processing. Returning 200 for duplicates matters: an error would make the provider keep retrying.`,
      questions: [
        { q: 'How do you verify a webhook is genuine?', a: 'Recompute the HMAC of the raw body (and timestamp) with the shared secret and compare it to the signature header using a constant-time comparison. Also reject old timestamps to block replays.' },
        { q: 'Why use timingSafeEqual instead of ===?', a: 'A normal comparison returns early at the first mismatch, so response time leaks how many characters matched. A constant-time compare always takes the same time, so attackers cannot guess the signature byte by byte.' },
        { q: 'Why must you use the raw body?', a: 'The signature was computed over the exact bytes sent. Parsing and re-serialising JSON can change whitespace or key order, so the HMAC will not match.' },
        { q: 'How do you handle duplicate or out-of-order webhooks?', a: 'Store processed event ids with a unique constraint and skip repeats. For order, compare event timestamps/versions or fetch the current state from the provider API instead of trusting event order.' },
        { q: 'Why respond quickly?', a: 'Providers have short timeouts and treat slow responses as failures, then retry. Acknowledge with 2xx and do heavy work in a queue.' },
      ],
      spoken: `"A webhook is the provider calling my endpoint when an event happens, like Stripe telling me a payment succeeded. I do three things. First, verify the signature: I compute an HMAC-SHA256 over the raw body and timestamp with the shared secret and compare using crypto.timingSafeEqual, and I reject old timestamps to stop replays. Second, I respond with a 2xx quickly and push the real work to a queue, because slow responses trigger retries. Third, I make processing idempotent by storing event ids with a unique index, since providers deliver at least once and sometimes out of order."`,
      mistakes: [
        'Applying `express.json()` globally before the webhook route, so the raw body is gone and signatures never match.',
        'Comparing signatures with `===` — vulnerable to timing attacks.',
        'Doing slow work (emails, PDFs) before responding, causing timeouts and duplicate retries.',
        'Returning 500 for duplicate events. The provider will keep retrying; return 200 for "already processed".',
        'Follow-up trap: "Can you trust the data inside the webhook?" After verifying the signature, yes for authenticity — but for critical state (like payment status) many teams re-fetch the object from the provider\'s API to get the latest version.',
      ],
      takeaway: 'Raw body + HMAC + timingSafeEqual + timestamp check, reply 2xx fast, and dedupe by event id.',
    },
    {
      id: 'socket-io',
      title: 'Socket.IO: Rooms, Namespaces and Acks',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Socket.IO adds events, auto-reconnect, rooms, namespaces and acknowledgements on top of WebSockets (with HTTP long-polling fallback).',
      what: `**Socket.IO** is a library for real-time, two-way communication between browser and Node server. It uses WebSockets when possible and falls back to HTTP long polling.

It is **not** plain WebSocket — a plain \`new WebSocket()\` client cannot talk to a Socket.IO server. It adds its own protocol with extra features:
- **Events**: \`socket.emit('chat:message', data)\` and \`socket.on('chat:message', handler)\` instead of raw strings.
- **Auto-reconnect** with backoff.
- **Rooms**: server-side groups of sockets. \`socket.join('room:42')\`, then \`io.to('room:42').emit(...)\` sends to everyone in the room. Perfect for chat rooms, per-user channels, per-document editing.
- **Namespaces**: separate channels on the same connection, like \`/chat\` and \`/admin\`, each with its own handlers and middleware.
- **Acknowledgements (acks)**: a callback so the sender knows the other side received (and processed) the message.

#### Deeper version
- A socket automatically joins a room equal to its own \`socket.id\`. A common pattern is to also join \`user:<userId>\` so you can reach a user on all their devices/tabs.
- Rooms exist only on the server; clients cannot list or join rooms by themselves — your server code decides.
- **Auth**: send the token in \`io(url, { auth: { token } })\` and verify it in \`io.use()\` middleware during the handshake.
- **Acks with timeout**: \`socket.timeout(5000).emit('event', data, (err, res) => ...)\`, or \`await socket.emitWithAck(...)\` in newer versions (check your version's docs).
- **Delivery guarantee**: by default "at most once". If the connection drops, messages can be lost. For reliable chat, store messages in the DB and let the client fetch missed ones after reconnect (or use the connection state recovery feature in v4.6+).
- **Volatile** events (\`socket.volatile.emit\`) may be dropped — fine for things like cursor positions.
- \`socket.broadcast.emit\` sends to everyone except the sender.`,
      why: `Raw WebSockets give you only a pipe. You would have to build reconnection, message routing, groups and acknowledgements yourself. Socket.IO gives these out of the box, which is why it is common for chat, notifications, live dashboards and multiplayer features in MERN apps.`,
      analogy: `Socket.IO is like an office building's internal phone system. **Namespaces** are different departments (Sales, Support), each with its own reception. **Rooms** are meeting rooms where everyone inside hears an announcement. An **ack** is the person saying "got it" after you pass them a note.`,
      code: [
        {
          title: 'Server: auth, rooms, namespace and acks',
          lang: 'javascript',
          code: `import { createServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: 'http://localhost:5173' } });

// Auth middleware runs once per connection (handshake)
io.use((socket, next) => {
  try {
    socket.data.user = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.user.sub;
  socket.join(\`user:\${userId}\`); // reach this user on every tab/device

  socket.on('room:join', (roomId, ack) => {
    // (check the user may join this room here)
    socket.join(\`room:\${roomId}\`);
    ack({ ok: true });
  });

  socket.on('chat:send', async ({ roomId, text }, ack) => {
    const msg = await Message.create({ roomId, userId, text }); // persist first
    socket.to(\`room:\${roomId}\`).emit('chat:new', msg);       // everyone else in room
    ack({ ok: true, id: msg.id });                             // tell sender it is saved
  });
});

// A separate namespace with its own middleware
const admin = io.of('/admin');
admin.use((socket, next) => (socket.handshake.auth.role === 'admin' ? next() : next(new Error('forbidden'))));
admin.on('connection', (socket) => socket.emit('stats', { online: io.engine.clientsCount }));

httpServer.listen(3000);

// Anywhere in the app (e.g. after a REST call): notify a user
export const notifyUser = (userId, payload) => io.to(\`user:\${userId}\`).emit('notification', payload);`,
        },
        {
          title: 'Client (React or plain JS)',
          lang: 'javascript',
          code: `import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { auth: { token: accessToken } });

socket.on('connect', () => {
  socket.emit('room:join', 'general', (res) => console.log('joined?', res.ok));
});

socket.on('chat:new', (msg) => console.log('new message', msg.text));

// Ack with a timeout: err is set if the server did not answer in 5s
socket.timeout(5000).emit('chat:send', { roomId: 'general', text: 'hi' }, (err, res) => {
  if (err) console.log('not confirmed, show retry button');
  else console.log('saved with id', res.id);
});

socket.on('connect_error', (err) => console.log('connect failed:', err.message));`,
        },
      ],
      output: `The client connects with its JWT; the server verifies it during the handshake. Joining \`general\` returns \`joined? true\` through the ack. Sending "hi" saves it to MongoDB, sends \`chat:new\` to everyone else in \`room:general\`, and the sender's ack prints \`saved with id ...\`. If the server is down for 5 seconds, the ack callback gets \`err\` and the UI can offer a retry. A bad token triggers \`connect_error: unauthorized\`.`,
      questions: [
        { q: 'What is the difference between rooms and namespaces?', a: 'Namespaces are separate endpoints (like `/chat`, `/admin`) with their own handlers and middleware; the client chooses which to connect to. Rooms are server-side groups inside a namespace that the server joins sockets to, used to broadcast to a subset.' },
        { q: 'Is Socket.IO the same as WebSocket?', a: 'No. It uses WebSocket (or long polling) as a transport, but adds its own protocol. A plain WebSocket client cannot connect to a Socket.IO server.' },
        { q: 'What are acknowledgements?', a: 'A callback passed as the last argument to `emit`. The receiver calls it to confirm the message was received or processed, optionally with a response.' },
        { q: 'How do you authenticate Socket.IO connections?', a: 'Send the token in the `auth` option and verify it in `io.use()` middleware. Store user info on `socket.data`. Re-check permissions when joining rooms.' },
        { q: 'Does Socket.IO guarantee delivery?', a: 'By default it is at-most-once: messages sent while disconnected can be lost. Persist important messages and let clients fetch missed ones after reconnect.' },
      ],
      spoken: `"Socket.IO is a real-time library on top of WebSockets with a long-polling fallback. It adds named events, auto-reconnect, rooms, namespaces and acknowledgements. Namespaces are separate channels like slash-admin with their own middleware. Rooms are server-side groups — I usually join each socket to a user room and to chat or document rooms, then emit with io.to(room). Acks let the sender know the server saved the message. I authenticate in io.use with a JWT from the auth option. Since delivery isn't guaranteed, I persist messages first and let clients sync after reconnecting."`,
      mistakes: [
        'Trusting the client to say which room to join without checking permission on the server.',
        'Sending the token in the query string where it ends up in logs; prefer the `auth` option.',
        'Assuming messages are never lost. Persist important data and resync after reconnect.',
        'Follow-up trap: "What happens when you run two Node instances?" Each instance only knows its own sockets, so `io.to(room).emit` misses users on the other instance. You need the Redis adapter and sticky sessions.',
      ],
      takeaway: 'Socket.IO = events + reconnect + rooms (server-side groups) + namespaces (separate channels) + acks (delivery confirmation).',
    },
    {
      id: 'graphql-basics',
      title: 'GraphQL Basics',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'GraphQL is a query language with one endpoint and a typed schema; the client asks for exactly the fields it needs.',
      what: `**GraphQL** is a query language for APIs. Instead of many REST endpoints, there is usually **one endpoint** (\`POST /graphql\`). The client sends a query describing **exactly the fields** it wants, and gets back JSON in the same shape.

Main parts:
- **Schema** — the typed contract, written in SDL: \`type User { id: ID!, name: String!, posts: [Post!]! }\`. The \`!\` means "not null".
- **Query** — read data.
- **Mutation** — change data.
- **Subscription** — real-time updates (usually over WebSockets).
- **Resolvers** — functions that fetch the data for each field.

#### Deeper version
**Pros**:
- No **over-fetching** (getting fields you do not need) and no **under-fetching** (needing 3 calls to build one screen).
- Strong types and **introspection** — tools like GraphiQL and codegen generate TypeScript types.
- One schema can combine many backends (federation).

**Cons**:
- **HTTP caching** is harder: everything is POST to one URL. Clients like Apollo/urql use normalized client caches instead. Persisted queries (by hash, sent as GET) help with CDN caching.
- **N+1 queries** from nested resolvers (solved with DataLoader).
- **Expensive queries**: clients can ask deeply nested queries. Protect with depth limits, complexity/cost limits, timeouts, and allow-listed persisted queries.
- **Errors**: GraphQL often returns HTTP 200 with an \`errors\` array, so monitoring must read the body.
- File uploads and rate limiting are less straightforward than REST.

Versioning: add fields, mark old ones \`@deprecated\`, remove later.`,
      why: `Frontend screens often need data from several resources. With REST you either make many calls or build custom endpoints for every screen. GraphQL lets the client ask for one nested shape in one request, which is especially useful for mobile apps and many different clients.`,
      analogy: `REST is a set meal: each endpoint gives a fixed plate. GraphQL is a buffet with a waiter: you write down exactly what you want ("rice, dal, no salad") and get one plate with only that.`,
      code: [
        {
          title: 'A small Apollo Server',
          lang: 'javascript',
          code: `import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = \`#graphql
  type User { id: ID!, name: String!, posts: [Post!]! }
  type Post { id: ID!, title: String!, authorId: ID! }
  type Query { user(id: ID!): User }
  type Mutation { createPost(title: String!, authorId: ID!): Post! }
\`;

const users = [{ id: '1', name: 'Asha' }];
const posts = [{ id: 'p1', title: 'Hello', authorId: '1' }];

const resolvers = {
  Query: {
    user: (_parent, { id }) => users.find((u) => u.id === id),
  },
  User: {
    // Field resolver: runs only if the client asks for "posts"
    posts: (user) => posts.filter((p) => p.authorId === user.id),
  },
  Mutation: {
    createPost: (_parent, { title, authorId }) => {
      const post = { id: 'p' + (posts.length + 1), title, authorId };
      posts.push(post);
      return post;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log('GraphQL ready at', url);`,
        },
        {
          title: 'Client query: ask only for what you need',
          lang: 'graphql',
          code: `query GetUser {
  user(id: "1") {
    name
    posts { title }
  }
}

# Response:
# { "data": { "user": { "name": "Asha", "posts": [{ "title": "Hello" }] } } }`,
        },
      ],
      output: `The query returns only \`name\` and post \`title\` — no \`id\` or \`authorId\` because the client did not ask. The \`User.posts\` resolver runs only because \`posts\` was requested. Sending the \`createPost\` mutation adds a post, and the next query shows two titles. If you ask for a field that does not exist, GraphQL rejects the query before running any resolver, because it validates against the schema.`,
      questions: [
        { q: 'GraphQL vs REST?', a: 'REST has many endpoints with fixed responses and uses HTTP caching well. GraphQL has one endpoint and a typed schema where clients choose fields, which avoids over- and under-fetching, but caching, rate limiting and query cost control are harder.' },
        { q: 'What is a resolver?', a: 'A function that returns the data for one field. It receives `(parent, args, context, info)`. Nested fields have their own resolvers that receive the parent object.' },
        { q: 'How do you secure a GraphQL API?', a: 'Authenticate in the context, authorize in resolvers, and protect against expensive queries with depth and complexity limits, timeouts, rate limits and persisted queries. Consider disabling introspection in production.' },
        { q: 'What status code does GraphQL return on error?', a: 'Often 200 with an `errors` array alongside partial `data`. Transport problems or invalid requests may return 4xx depending on the server. Monitoring must inspect the body.' },
      ],
      spoken: `"GraphQL is a query language with a single endpoint and a strongly typed schema. Clients send a query with exactly the fields they need and get JSON in the same shape, so there's no over-fetching or under-fetching. There are queries for reads, mutations for writes and subscriptions for real-time. Each field is backed by a resolver. The trade-offs are that HTTP caching is harder, nested resolvers cause N+1 queries unless you use DataLoader, and clients can send very expensive queries, so I add depth and complexity limits. I'd choose it for complex UIs with many clients."`,
      mistakes: [
        'Thinking GraphQL is a database or query language for a DB. It is an API layer; resolvers can call any database or service.',
        'Not limiting query depth or cost, allowing a single query to overload the server.',
        'Putting authorization only at the top-level query, so nested fields leak data.',
        'Follow-up trap: "Does GraphQL replace REST everywhere?" No. For simple CRUD, public cacheable APIs, file downloads and webhooks, REST is often simpler.',
      ],
      takeaway: 'GraphQL = one typed endpoint where clients pick fields; great for complex UIs, but watch caching, N+1 and query cost.',
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting Algorithms',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Limit how many requests a client can make: token bucket, leaky bucket, fixed window, sliding window log and sliding window counter.',
      what: `**Rate limiting** caps how many requests a client (user, API key or IP) can make in a time period, like 100 requests per minute. Over the limit → **429 Too Many Requests**.

The five classic algorithms:
1. **Fixed window** — count requests per clock window (12:00:00-12:00:59). Reset at the next minute. Simple, but allows bursts at the edges.
2. **Sliding window log** — store the timestamp of every request; count those in the last 60 seconds. Exact, but uses lots of memory.
3. **Sliding window counter** — mix of both: use the current and previous window counts, weighted by how far into the current window you are. Cheap and close to exact.
4. **Token bucket** — a bucket holds up to N tokens and refills at a steady rate. Each request takes one token. Allows **short bursts** up to N, then steady rate.
5. **Leaky bucket** — requests go into a queue that drains at a fixed rate. Output is perfectly **smooth**; extra requests wait or are dropped.

#### Deeper version
**Fixed window edge problem**: with 100/min, a client can send 100 at 12:00:59 and 100 at 12:01:00 — 200 requests in 2 seconds.

**Sliding window counter formula**: \`estimate = currentCount + previousCount × (1 − elapsedFractionOfCurrentWindow)\`. Example: 70% through the window, previous = 80, current = 30 → 30 + 80 × 0.3 = 54.

**Token bucket vs leaky bucket**: token bucket controls the **average rate but allows bursts**; leaky bucket **smooths output** to a constant rate (good for protecting a fragile downstream). AWS API Gateway uses a token-bucket style (rate + burst).

**Distributed**: with many servers, keep counters in **Redis** using atomic operations (\`INCR\` + \`EXPIRE\`, or a Lua script) so all instances share one count.

**Response headers**: \`Retry-After\`, and \`RateLimit-Limit\` / \`RateLimit-Remaining\` / \`RateLimit-Reset\` (standardised by an IETF draft; many APIs use \`X-RateLimit-*\`).

**Where**: at the API gateway/CDN/WAF for coarse IP limits, and in the app for per-user or per-plan limits. Stricter limits on login and OTP endpoints.`,
      why: `Protects against abuse (brute-force logins, scraping), runaway client bugs, and noisy tenants hurting others. It keeps costs predictable (especially for paid LLM calls) and enables pricing tiers (free: 100/min, pro: 1000/min).`,
      analogy: `**Token bucket**: an arcade gives you tokens; a machine refills one token every second up to 10 — you can play 10 games quickly, then one per second. **Leaky bucket**: a funnel with a small hole — pour fast, but water drips out at the same steady speed. **Fixed window**: a club lets in 100 people each hour on the hour.`,
      code: [
        {
          title: 'Token bucket in memory (single server)',
          lang: 'javascript',
          code: `class TokenBucket {
  constructor(capacity, refillPerSec) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
    this.buckets = new Map(); // key -> { tokens, last }
  }
  take(key) {
    const now = Date.now() / 1000;
    const b = this.buckets.get(key) ?? { tokens: this.capacity, last: now };
    // Refill based on time passed, but never above capacity
    b.tokens = Math.min(this.capacity, b.tokens + (now - b.last) * this.refillPerSec);
    b.last = now;
    const allowed = b.tokens >= 1;
    if (allowed) b.tokens -= 1;
    this.buckets.set(key, b);
    return { allowed, remaining: Math.floor(b.tokens) };
  }
}

const limiter = new TokenBucket(10, 2); // burst of 10, then 2 req/sec
app.use((req, res, next) => {
  const { allowed, remaining } = limiter.take(req.user?.sub ?? req.ip);
  res.set('RateLimit-Remaining', String(remaining));
  if (!allowed) return res.status(429).set('Retry-After', '1').json({ error: 'Too many requests' });
  next();
});`,
        },
        {
          title: 'Fixed window in Redis (works across many servers)',
          lang: 'javascript',
          code: `import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function fixedWindow(key, limit, windowSec) {
  const windowId = Math.floor(Date.now() / 1000 / windowSec);
  const redisKey = \`rl:\${key}:\${windowId}\`;
  const count = await redis.incr(redisKey);          // atomic across all servers
  if (count === 1) await redis.expire(redisKey, windowSec);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

app.post('/login', async (req, res, next) => {
  const { allowed } = await fixedWindow(\`login:\${req.ip}\`, 5, 60); // 5 tries / minute
  if (!allowed) return res.status(429).json({ error: 'Too many login attempts' });
  next();
});`,
        },
      ],
      output: `With the token bucket (10, 2/sec), a client can fire 10 requests instantly; the 11th gets **429** with \`Retry-After: 1\`. After one second, 2 more tokens are available. With the Redis fixed window, the 6th login attempt from the same IP within the same minute gets **429**, no matter which server instance handles it, because \`INCR\` is atomic in Redis. The in-memory version would only count per instance.`,
      questions: [
        { q: 'Token bucket vs leaky bucket?', a: 'Token bucket allows bursts up to the bucket size while enforcing an average rate. Leaky bucket processes requests at a constant rate, smoothing bursts by queueing or dropping them.' },
        { q: 'What is the problem with fixed window?', a: 'Bursts at the window boundary: a client can use the full limit at the end of one window and again at the start of the next, doubling the rate briefly.' },
        { q: 'How does the sliding window counter work?', a: 'It estimates the count in the last N seconds using the current window count plus the previous window count weighted by how much of it overlaps. It is memory-cheap and nearly accurate.' },
        { q: 'How do you rate limit across multiple servers?', a: 'Store counters in a shared fast store like Redis with atomic operations (INCR, Lua scripts), or enforce limits at the API gateway.' },
        { q: 'What should a rate-limited response include?', a: 'Status 429, a `Retry-After` header, and ideally headers showing the limit, remaining requests and reset time.' },
      ],
      spoken: `"Rate limiting caps requests per client and returns 429 with Retry-After when exceeded. Fixed window counts per clock minute — simple but allows double bursts at the edges. Sliding window log stores every timestamp, which is exact but memory-heavy. Sliding window counter weights the previous window's count, which is cheap and nearly exact. Token bucket refills tokens at a steady rate and allows bursts up to the bucket size, and leaky bucket drains at a constant rate to smooth traffic. With multiple servers I keep counters in Redis with atomic INCR or a Lua script, or let the API gateway do it."`,
      mistakes: [
        'Keeping counters in process memory with multiple instances — each server allows the full limit.',
        'Rate limiting only by IP. Users behind one office NAT share an IP; use user id or API key when authenticated.',
        'Trusting `X-Forwarded-For` blindly. Set `app.set("trust proxy", ...)` correctly or attackers can fake their IP.',
        'Follow-up trap: "Which algorithm does a typical API gateway use?" Many (like AWS API Gateway) use a token-bucket style with a steady rate and a burst size.',
      ],
      takeaway: 'Fixed window is simple, sliding windows are fairer, token bucket allows bursts, leaky bucket smooths — share counters in Redis.',
    },
    {
      id: 'api-gateway',
      title: 'API Gateway',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A single front door for many backend services that handles routing, auth, rate limiting, TLS, logging and more.',
      what: `An **API gateway** is a server that sits **in front of** your backend services. Clients call only the gateway; the gateway forwards each request to the right service.

It handles **cross-cutting concerns** (things every service needs) in one place:
- **Routing**: \`/users/*\` → user-service, \`/orders/*\` → order-service.
- **Authentication**: verify JWT/API key once at the edge.
- **Rate limiting and quotas**.
- **TLS termination**, CORS, request size limits.
- **Logging, metrics, tracing** (add a request id).
- **Caching**, request/response transformation, API versioning.

Examples: AWS API Gateway, Kong, NGINX, Apigee, Azure API Management, Google Cloud API Gateway, Traefik, Envoy.

#### Deeper version
- **Gateway vs load balancer**: a load balancer spreads traffic across copies of the **same** service (layer 4/7). A gateway routes to **different** services and adds API features. They often work together.
- **Gateway vs reverse proxy**: a gateway is a specialised reverse proxy with API management features.
- **BFF (Backend for Frontend)**: a separate gateway per client type (web, mobile) that shapes data for that client — aggregates several service calls into one response.
- **Aggregation**: one client call → gateway calls 3 services in parallel → one combined response. Reduces chattiness from mobile.
- **Service mesh** (Istio, Linkerd) handles **east-west** (service-to-service) traffic; the gateway handles **north-south** (client-to-system) traffic.
- **Risks**: single point of failure (run multiple instances), extra latency hop, and a "god gateway" full of business logic. Keep business logic in services.`,
      why: `Without a gateway, every microservice must implement auth, rate limiting, CORS and logging, and clients must know many service URLs. A gateway centralises that, hides internal structure, and lets you change services without changing clients.`,
      analogy: `A hotel reception desk. Guests do not wander the building looking for housekeeping, the kitchen or maintenance. They go to reception, which checks their room key (auth), routes the request to the right department, and keeps a log.`,
      code: [
        {
          title: 'A tiny gateway in Express',
          lang: 'javascript',
          code: `import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { randomUUID } from 'node:crypto';

const gw = express();

// Cross-cutting concerns, once, at the edge
gw.use((req, res, next) => {
  req.headers['x-request-id'] ??= randomUUID();
  next();
});
gw.use(authenticate);   // verify JWT once (from earlier topic)
gw.use(rateLimit);      // per user / API key

// Routing to internal services
gw.use('/users', createProxyMiddleware({ target: 'http://user-service:4001', changeOrigin: true }));
gw.use('/orders', createProxyMiddleware({ target: 'http://order-service:4002', changeOrigin: true }));

// Aggregation (BFF style): one call for the dashboard screen
gw.get('/bff/dashboard', async (req, res) => {
  const headers = { 'x-user-id': req.user.sub, 'x-request-id': req.headers['x-request-id'] };
  const [user, orders] = await Promise.all([
    fetch(\`http://user-service:4001/users/\${req.user.sub}\`, { headers }).then((r) => r.json()),
    fetch(\`http://order-service:4002/orders?userId=\${req.user.sub}&limit=5\`, { headers }).then((r) => r.json()),
  ]);
  res.json({ user, recentOrders: orders.data });
});

gw.listen(8080);`,
        },
      ],
      output: `A client calls \`https://api.example.com/orders/7\`. The gateway adds a request id, checks the JWT, applies rate limits and forwards to \`order-service\`. The client never knows that service's address. \`GET /bff/dashboard\` fans out to two services in parallel and returns one combined JSON, saving the mobile app two round trips. In production you would usually use a managed gateway (AWS API Gateway, Kong) instead of writing your own.`,
      questions: [
        { q: 'What does an API gateway do?', a: 'It is the single entry point for clients. It routes requests to services and handles cross-cutting concerns like auth, rate limiting, TLS, CORS, logging and sometimes caching and aggregation.' },
        { q: 'API gateway vs load balancer?', a: 'A load balancer distributes traffic across instances of the same service. A gateway routes to different services by path or host and adds API management features. You often use both.' },
        { q: 'What is the BFF pattern?', a: 'Backend for Frontend: a dedicated gateway layer per client type (web, mobile) that aggregates and shapes data specifically for that client.' },
        { q: 'What are the downsides of a gateway?', a: 'An extra network hop, a potential single point of failure and bottleneck, and the risk of putting business logic in it. Mitigate with redundancy, autoscaling and keeping it thin.' },
      ],
      spoken: `"An API gateway is the single front door for a set of backend services. It routes requests by path to the right service and handles cross-cutting concerns once — JWT validation, rate limiting, TLS, CORS, logging and request ids. That keeps each microservice simpler and hides the internal structure from clients. It's different from a load balancer, which spreads traffic across copies of one service. I also like the BFF pattern, where a gateway aggregates calls for a specific frontend. The main risks are an extra hop and a single point of failure, so it must be redundant and thin."`,
      mistakes: [
        'Putting business logic in the gateway — it becomes a hard-to-change monolith.',
        'Trusting identity headers (like `x-user-id`) from the internet. Strip them at the gateway and only let the gateway set them.',
        'Running one gateway instance — a single point of failure.',
        'Follow-up trap: "If the gateway checks auth, do services still need to?" Ideally services still check authorization (and verify a signed identity or use mTLS), following zero-trust — never assume internal traffic is safe.',
      ],
      takeaway: 'An API gateway is the front door: routing + auth + rate limits + observability in one place, kept thin and redundant.',
    },
    {
      id: 'bulk-operations',
      title: 'Bulk Operations (Batch Endpoints, Partial Failures, 207)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Batch endpoints process many items in one request; decide between all-or-nothing and per-item results (often 207 Multi-Status or 200 with a results array).',
      what: `A **bulk** (or **batch**) endpoint lets a client create, update or delete **many items in one request**, instead of 1,000 separate calls.

Example: \`POST /contacts/bulk\` with an array of 500 contacts.

The big design question: **what if some items fail?**
- **All-or-nothing (atomic)**: if one fails, none are saved. Use a database transaction. Return 400/422 with which items were bad. Simple for clients.
- **Partial success**: save the good ones, report the bad ones. Return a **per-item result** list. Faster and more forgiving, but clients must handle mixed results.

For partial results, some APIs use **207 Multi-Status** (from WebDAV) with a status per item; many others return **200** with a \`results\` array that has a status for each item. Both are fine if documented.

#### Deeper version
- **Limits**: cap the batch size (e.g. max 1,000 items or 5 MB). Bigger jobs → async.
- **Async for large jobs**: accept the file/array, return **202 Accepted** with a job id, process in a queue, let the client poll \`GET /jobs/:id\` or receive a webhook.
- **Correlation**: each item should carry a client-side id or index so the client can match results.
- **Idempotency**: use an \`Idempotency-Key\` for the whole batch, or per-item keys, so retries do not duplicate.
- **Database efficiency**: use \`insertMany({ ordered: false })\` or \`bulkWrite\` in MongoDB instead of looping single inserts. With \`ordered: false\`, MongoDB keeps going after an error and reports which ones failed.
- **Rate limiting**: count a batch as N requests (or by weight), not as 1.
- Generic "batch any request" endpoints (like Google's or Microsoft Graph's \`$batch\`) bundle different HTTP calls into one; they are more complex.`,
      why: `Importing 10,000 contacts with 10,000 HTTP calls is slow, hits rate limits and is fragile. Batch endpoints cut network overhead. But hiding errors in a batch causes silent data loss, so the failure contract must be clear.`,
      analogy: `Sending wedding invitations: you hand the post office a box of 300 cards at once instead of visiting 300 times. The post office returns a slip saying "296 sent, 4 failed: addresses incomplete" — that slip is the per-item result.`,
      code: [
        {
          title: 'Partial success with insertMany(ordered: false)',
          lang: 'javascript',
          code: `import { z } from 'zod';

const Contact = z.object({ email: z.string().email(), name: z.string().min(1) });

app.post('/contacts/bulk', authenticate, async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 1000) {
    return res.status(400).json({ error: 'items must be an array of 1-1000 contacts' });
  }

  // 1) Validate each item, keep its index for correlation
  const results = items.map((item, index) => {
    const parsed = Contact.safeParse(item);
    return parsed.success
      ? { index, status: 'pending', doc: { ...parsed.data, ownerId: req.user.sub } }
      : { index, status: 422, error: parsed.error.issues[0].message };
  });

  // 2) Insert valid ones; ordered:false continues past duplicates
  const valid = results.filter((r) => r.status === 'pending');
  try {
    const inserted = await ContactModel.insertMany(valid.map((r) => r.doc), { ordered: false });
    inserted.forEach((doc, i) => Object.assign(valid[i], { status: 201, id: doc.id }));
  } catch (err) {
    // Note: the exact shape of bulk write errors differs between Mongoose versions; check your docs.
    const failedIdx = new Set((err.writeErrors ?? []).map((w) => w.index));
    let okCursor = 0;
    valid.forEach((r, i) => {
      if (failedIdx.has(i)) Object.assign(r, { status: 409, error: 'duplicate email' });
      else Object.assign(r, { status: 201, id: err.insertedDocs?.[okCursor++]?.id });
    });
  }

  const body = results.map(({ doc, ...rest }) => rest);
  const allOk = body.every((r) => r.status === 201);
  res.status(allOk ? 201 : 207).json({ results: body });
});`,
        },
      ],
      output: `Sending 3 items — one valid, one with a bad email, one duplicate — returns **207** with:
\`[{ index: 0, status: 201, id: "..." }, { index: 1, status: 422, error: "Invalid email" }, { index: 2, status: 409, error: "duplicate email" }]\`.
The client can show "1 imported, 2 failed" and let the user fix rows 2 and 3. If all succeed, the response is a plain **201**. For an all-or-nothing design you would instead wrap the insert in a transaction and return 422 if any item is invalid.`,
      questions: [
        { q: 'How do you handle partial failures in a bulk API?', a: 'Either make it atomic (transaction, all-or-nothing) or return a per-item result with an index, status and error for each item. Document which one you chose.' },
        { q: 'What is 207 Multi-Status?', a: 'A status from WebDAV meaning the body contains separate statuses for multiple operations. Some APIs use it for mixed bulk results; others return 200 with a results array.' },
        { q: 'How do you handle a 100,000-row import?', a: 'Make it asynchronous: upload the file (presigned URL), return 202 with a job id, process in batches in a worker queue, and expose job status or send a webhook when done.' },
        { q: 'How do you make bulk inserts efficient in MongoDB?', a: 'Use `insertMany` or `bulkWrite` with `ordered: false`, so documents are sent in batches and one failure does not stop the rest.' },
      ],
      spoken: `"For bulk endpoints the key decision is the failure model. If the items depend on each other, I make it atomic with a transaction — all succeed or none do. Otherwise I allow partial success and return a per-item result with the index, status and error, using either 207 Multi-Status or 200 with a results array. I cap the batch size, validate each item, and use insertMany with ordered false in MongoDB. For really large imports I switch to async: return 202 with a job id and process in a queue. And retries use an idempotency key."`,
      mistakes: [
        'Returning `200 OK` for a batch where half the items silently failed.',
        'No size limit on the batch, letting one request block the server or exceed memory.',
        'Looping `await Model.create()` for each item instead of using bulk database operations.',
        'Follow-up trap: "Should a bulk request of 500 items count as one request for rate limiting?" Usually no — count by items or by weight, or clients will bypass limits through batches.',
      ],
      takeaway: 'Bulk = cap the size, choose atomic or per-item results (207/200 + results array), and go async (202) for huge jobs.',
    },
    {
      id: 'file-uploads',
      title: 'File Upload Design (Multipart, Presigned URLs, Resumable)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Small files: multipart to your server. Big files: presigned URLs straight to S3/GCS. Huge or flaky uploads: chunked, resumable multipart uploads.',
      what: `Three common ways to upload files:

1. **Multipart form upload to your server** — the browser sends \`multipart/form-data\`; your Node server (with \`multer\` or \`busboy\`) receives the file and saves it. Simple, fine for small files (avatars).
2. **Presigned URL (direct to storage)** — your server creates a short-lived signed URL for S3/GCS. The browser uploads **directly to the bucket** with that URL. Your server never touches the file bytes.
3. **Chunked / resumable upload** — the file is split into parts (e.g. 10 MB each). Each part is uploaded separately and can be retried. If the connection drops at 80%, you resume from the last good part. S3 calls this **Multipart Upload**; GCS has resumable uploads; the **tus** protocol is an open standard.

#### Deeper version
**Presigned flow**:
1. Client: \`POST /uploads\` with filename, type and size.
2. Server: checks auth, type and size, makes a key like \`users/42/<uuid>.jpg\`, returns a presigned PUT URL (valid ~5 min).
3. Client: \`PUT\` the file to S3 directly.
4. Client: \`POST /uploads/:id/complete\`, or S3 sends an **event notification** (S3 → SQS/Lambda) so the server knows it is done.
5. Server: verifies the object exists, records it in the DB, maybe triggers a virus scan or thumbnail job.

**Security**:
- Validate size and type on the server — and know that \`Content-Type\` from the client can lie. Check magic bytes after upload, or scan.
- Never use the user's file name as the storage key (path traversal, overwrites). Generate a UUID.
- Use **presigned POST** with policy conditions (\`content-length-range\`) to enforce max size at S3.
- Keep buckets private; serve files through presigned GET URLs or a CDN with signed URLs.
- Configure **CORS on the bucket** for browser uploads.

**Big files**: S3 multipart requires parts of at least 5 MB (except the last) and supports up to 10,000 parts. Upload parts in parallel for speed. Set a lifecycle rule to abort incomplete multipart uploads, or you pay for orphaned parts.`,
      why: `Streaming big files through your Node server wastes CPU, memory and bandwidth, and ties up instances (and serverless functions have small body limits). Presigned URLs offload the heavy lifting to S3/GCS, which scale for free. Resumable uploads make large files possible on mobile networks.`,
      analogy: `Multipart to your server is like handing a parcel to the receptionist who then walks it to the warehouse. A presigned URL is the receptionist giving you a **one-time gate pass** so you drive straight to the warehouse yourself. Resumable upload is moving house in many small boxes — if the truck breaks down, you only resend the boxes that did not arrive.`,
      code: [
        {
          title: 'Small files: multer with limits',
          lang: 'javascript',
          code: `import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (req, file, cb) =>
    cb(null, ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)),
});

app.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PNG, JPEG or WEBP under 2 MB required' });
  // req.file.buffer holds the bytes; upload to S3 or process with sharp here
  res.status(201).json({ size: req.file.size });
});`,
        },
        {
          title: 'Big files: presigned PUT URL with AWS SDK v3',
          lang: 'javascript',
          code: `import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const s3 = new S3Client({ region: 'ap-south-1' });
const BUCKET = process.env.UPLOAD_BUCKET;
const ALLOWED = ['application/pdf', 'video/mp4'];

app.post('/uploads', authenticate, async (req, res) => {
  const { contentType, size } = req.body;
  if (!ALLOWED.includes(contentType) || size > 500 * 1024 * 1024) {
    return res.status(422).json({ error: 'Only PDF/MP4 up to 500 MB' });
  }
  const key = \`users/\${req.user.sub}/\${randomUUID()}\`; // never the user's file name
  const url = await getSignedUrl(s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }); // 5 minutes
  await Upload.create({ key, ownerId: req.user.sub, status: 'pending' });
  res.json({ key, url });
});

app.post('/uploads/complete', authenticate, async (req, res) => {
  const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: req.body.key }));
  await Upload.updateOne({ key: req.body.key, ownerId: req.user.sub },
    { status: 'uploaded', size: head.ContentLength });
  res.json({ ok: true });
});

// Browser:
// const { key, url } = await (await fetch('/uploads', {...})).json();
// await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
// await fetch('/uploads/complete', { method: 'POST', body: JSON.stringify({ key }), ... });`,
        },
      ],
      output: `The avatar route rejects a 5 MB file or a GIF with **400** and accepts a small PNG with **201**. For a 300 MB video, the browser asks \`/uploads\` for a URL, then PUTs the file **directly to S3** — your server only handled two tiny JSON requests. \`/uploads/complete\` confirms the object exists using \`HeadObject\` and stores its real size. If the URL is used after 5 minutes, S3 returns **403**.`,
      questions: [
        { q: 'How would you design uploads for large files?', a: 'Use presigned URLs so the client uploads directly to S3/GCS. For very large files use multipart/resumable upload with parallel parts and retries. Confirm completion via a callback or storage event, then process asynchronously.' },
        { q: 'What is a presigned URL?', a: 'A URL signed with your cloud credentials that grants temporary permission for one specific action (PUT or GET) on one object, expiring after a short time.' },
        { q: 'How do resumable uploads work?', a: 'The file is split into parts uploaded independently. The server or storage tracks completed parts, so after a failure only missing parts are re-sent, and a final call combines them.' },
        { q: 'How do you secure file uploads?', a: 'Authenticate the request, limit size and type, generate the storage key yourself, keep buckets private, verify content (magic bytes, virus scan), and serve files through signed URLs or a CDN.' },
        { q: 'Why not stream every upload through Node?', a: 'It uses server bandwidth, memory and connections, limits scaling, and hits body-size limits on serverless platforms. Direct-to-storage uploads avoid all of that.' },
      ],
      spoken: `"It depends on file size. For small files like avatars I accept multipart form-data with multer, with strict size and type limits. For larger files I use presigned URLs: the client asks my API for permission, I validate size and type, generate a UUID key and return a short-lived signed PUT URL, and the browser uploads straight to S3. Then I confirm with a complete call or an S3 event and process it in a background job. For very large files or mobile users I use S3 multipart or a resumable protocol like tus, so failed parts can be retried."`,
      mistakes: [
        'Trusting the client\'s `Content-Type` or file extension. Verify the actual content and scan when it matters.',
        'Using the original file name as the S3 key — overwrites and path tricks. Use a generated id.',
        'Forgetting bucket CORS, so browser PUTs to the presigned URL fail.',
        'Not aborting incomplete multipart uploads, paying for invisible orphan parts forever.',
        'Follow-up trap: "Can a presigned PUT URL enforce a maximum size?" A plain presigned PUT cannot enforce a size range on its own; use a presigned POST with a `content-length-range` condition, or check after upload and delete oversized objects.',
      ],
      takeaway: 'Small: multipart to server. Large: presigned URL direct to storage. Huge/flaky: chunked resumable upload — and always validate.',
    },
    {
      id: 'api-security',
      title: 'API Security Essentials (OWASP API Top 10, API Keys)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Check ownership on every object, validate all input, limit rates and sizes, hide internals, and protect secrets — the OWASP API Top 10 in practice.',
      what: `API security is mostly about a short list of habits. The **OWASP API Security Top 10** lists the most common API risks. The big ones in plain words:

1. **Broken Object Level Authorization (BOLA/IDOR)** — user changes \`/orders/5\` to \`/orders/6\` and sees someone else's order. Always check ownership.
2. **Broken Authentication** — weak login, no rate limit on login, tokens never expire.
3. **Broken Object Property Level Authorization** — returning fields the user should not see (\`passwordHash\`) or letting them set fields they should not (\`role\`) — mass assignment.
4. **Unrestricted Resource Consumption** — no limits on page size, upload size or request rate.
5. **Broken Function Level Authorization** — normal users can call admin endpoints.
6. **SSRF** (Server-Side Request Forgery) — your server fetches a URL the user gave, like \`http://169.254.169.254\` (cloud metadata), leaking credentials.

#### Deeper version
**API keys** are long random secrets identifying a **client app** (not a user). Good practice:
- Show the key once; store only a **hash** (like passwords). Use a visible **prefix** (\`sk_live_\`) so leaked keys are easy to spot in code scans.
- Support multiple keys per account, **rotation**, scopes and revocation; log last-used time.
- Send in a header (\`Authorization: Bearer\` or \`x-api-key\`), never in URLs.

**Other checklist items**:
- Validate input with schemas (Zod/Joi); reject unknown fields.
- Use parameterised queries / avoid passing raw objects to Mongo (injection).
- Limit body size (\`express.json({ limit: '100kb' })\`).
- Set security headers (\`helmet\`), HTTPS only, HSTS.
- Do not leak stack traces or versions (\`x-powered-by\`).
- Log auth failures and alert on spikes; keep audit logs for sensitive actions.
- Keep secrets in a secret manager (AWS Secrets Manager, GCP Secret Manager), not in git.
- For SSRF: allow-list hosts, block private IP ranges, and use IMDSv2 on AWS.
- Keep an inventory of all APIs and versions — old forgotten endpoints are a classic hole.`,
      why: `APIs expose your data directly, without a UI to hide things. Most real API breaches come from simple missing checks (BOLA, mass assignment), not from broken crypto. Interviewers ask this to see whether you build secure-by-default endpoints.`,
      analogy: `A bank branch: guards at the door (authentication), tellers who check that the account belongs to you before handing money (object-level authorization), a limit on withdrawals per day (rate limits), and no customer allowed behind the counter (function-level authorization).`,
      code: [
        {
          title: 'Secure-by-default Express setup',
          lang: 'javascript',
          code: `import helmet from 'helmet';
import { z } from 'zod';

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' })); // stop huge bodies

// Strict schema: unknown fields (like "role") are rejected
const UpdateProfile = z.object({ name: z.string().max(80), bio: z.string().max(500) }).strict();

app.patch('/me', authenticate, async (req, res) => {
  const parsed = UpdateProfile.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.issues });
  const user = await User.findByIdAndUpdate(req.user.sub, parsed.data, { new: true })
    .select('name bio email'); // never return passwordHash
  res.json(user);
});`,
        },
        {
          title: 'API keys: hashed storage with a prefix',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export async function createApiKey(accountId) {
  const raw = 'sk_live_' + crypto.randomBytes(24).toString('base64url');
  await ApiKey.create({ accountId, prefix: raw.slice(0, 12), hash: sha256(raw) });
  return raw; // show ONCE to the user; we never store it in plain text
}

export async function apiKeyAuth(req, res, next) {
  const raw = req.get('x-api-key');
  if (!raw) return res.status(401).json({ error: 'API key required' });
  const key = await ApiKey.findOne({ hash: sha256(raw), revokedAt: null });
  if (!key) return res.status(401).json({ error: 'Invalid API key' });
  req.accountId = key.accountId;
  ApiKey.updateOne({ _id: key._id }, { lastUsedAt: new Date() }).catch(() => {});
  next();
}`,
        },
      ],
      output: `A \`PATCH /me\` with \`{ "name": "Asha", "role": "admin" }\` is rejected with **422** because \`.strict()\` refuses unknown keys — no privilege escalation. A 5 MB JSON body is rejected by the body limit. The response never includes \`passwordHash\`. For API keys, the database only has the hash; even if the DB leaks, the raw keys cannot be used. The \`sk_live_\` prefix lets GitHub secret scanning and your own logs flag leaked keys.`,
      questions: [
        { q: 'What is the most common API vulnerability?', a: 'Broken Object Level Authorization (BOLA/IDOR): the API does not check that the logged-in user owns the object id in the request. It is number one on the OWASP API Top 10.' },
        { q: 'What is mass assignment?', a: 'Binding request bodies directly to database models, so clients can set fields they should not, like `role` or `isVerified`. Prevent it with whitelists or strict schemas.' },
        { q: 'API key vs JWT?', a: 'An API key is a long-lived secret identifying an application, usually checked against a DB. A JWT is a short-lived signed token, usually representing a user session. Keys suit server-to-server integrations.' },
        { q: 'What is SSRF and how do you prevent it?', a: 'Server-Side Request Forgery: tricking your server into calling internal URLs (like cloud metadata). Prevent with allow-lists, blocking private IP ranges after DNS resolution, and IMDSv2.' },
      ],
      spoken: `"For API security I follow the OWASP API Top 10. The biggest one is object-level authorization — every query is scoped to the current user or tenant so changing an id in the URL doesn't leak data. I validate every body with strict Zod schemas to stop mass assignment, and I select only safe fields in responses. I add rate limits, body-size limits, helmet, HTTPS and no stack traces. For server-to-server clients I issue API keys with a visible prefix, store only a hash, and support rotation and revocation. And if the server fetches user-given URLs, I protect against SSRF."`,
      mistakes: [
        'Returning full database documents (with `passwordHash`, internal flags) from endpoints.',
        'Storing API keys in plain text in the database.',
        'Forgetting old API versions and debug endpoints that are still deployed and unprotected.',
        'Follow-up trap: "Are sequential ids a security problem?" They make enumeration easy, but the real fix is authorization checks. UUIDs only hide the problem; they do not fix it.',
      ],
      takeaway: 'Scope every query to the user, validate strictly, limit everything, hide internals, and treat keys like passwords.',
    },
    {
      id: 'async-long-running',
      title: 'Long-Running Operations (202 Accepted + Job Status)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'For slow work, return 202 with a job id immediately, process in a queue, and let the client poll, use SSE, or get a webhook.',
      what: `Some tasks take too long for one HTTP request: generating a big report, encoding a video, importing a CSV, or a long LLM job. HTTP requests often time out after 30-60 seconds (load balancers, API Gateway, serverless limits).

The pattern:
1. Client: \`POST /reports\`.
2. Server: puts a job in a **queue** (BullMQ, SQS, Cloud Tasks) and immediately returns **202 Accepted** with a job id and a status URL: \`Location: /jobs/123\`.
3. A **worker** process picks up the job and does the work.
4. Client learns the result by **polling** \`GET /jobs/123\`, by **SSE/WebSocket** push, or by a **webhook** (for server clients).
5. When done, the status shows \`completed\` and a link to the result.

#### Deeper version
Job resource shape: \`{ id, status: 'queued' | 'running' | 'completed' | 'failed', progress, resultUrl, error, createdAt }\`.

- When completed, \`GET /jobs/123\` can return 200 with the result link, or **303 See Other** pointing at the created resource.
- Make the create call **idempotent** (Idempotency-Key) so a retry does not start two jobs.
- Workers must be **idempotent** too: queues deliver at least once, and a crashed worker's job gets retried.
- Set **retries with backoff**, a **dead-letter queue** for jobs that keep failing, and **timeouts**.
- Support **cancellation** (\`DELETE /jobs/123\` or \`POST /jobs/123/cancel\`).
- Poll with a sensible interval and backoff; you can send \`Retry-After\` to tell the client when to check again.
- Clean up old jobs with a TTL.`,
      why: `Holding an HTTP request open for minutes wastes server resources, breaks on timeouts and gives users no progress. The async job pattern keeps APIs fast, makes work retryable, and lets you scale workers separately from the web servers.`,
      analogy: `Dropping clothes at a dry cleaner. They do not make you wait at the counter for 2 days. They give you a **token** (job id) right away (202). You can call to ask "is it ready?" (polling), or they SMS you when done (webhook/push).`,
      code: [
        {
          title: 'BullMQ: enqueue, worker, and status endpoint',
          lang: 'javascript',
          code: `import { Queue, Worker } from 'bullmq';
const connection = { host: 'localhost', port: 6379 }; // Redis

const reportQueue = new Queue('reports', { connection });

// 1) API: accept and return 202 immediately
app.post('/reports', authenticate, async (req, res) => {
  const job = await reportQueue.add('monthly', { userId: req.user.sub, month: req.body.month }, {
    attempts: 3, backoff: { type: 'exponential', delay: 2000 },
  });
  res.status(202).location(\`/jobs/\${job.id}\`).json({ jobId: job.id, status: 'queued' });
});

// 2) Status endpoint the client can poll
app.get('/jobs/:id', authenticate, async (req, res) => {
  const job = await reportQueue.getJob(req.params.id);
  if (!job || job.data.userId !== req.user.sub) return res.status(404).end();
  const state = await job.getState(); // waiting | active | completed | failed ...
  if (state !== 'completed' && state !== 'failed') res.set('Retry-After', '2');
  res.json({ id: job.id, state, progress: job.progress, result: job.returnvalue, error: job.failedReason });
});

// 3) Worker (usually a separate process)
new Worker('reports', async (job) => {
  await job.updateProgress(10);
  const url = await buildReportAndUpload(job.data); // slow work
  await job.updateProgress(100);
  return { url };
}, { connection });`,
        },
      ],
      output: `\`POST /reports\` returns in milliseconds: **202** with \`{ jobId: "1", status: "queued" }\` and \`Location: /jobs/1\`. Polling \`GET /jobs/1\` shows \`state: "active", progress: 10\`, then later \`state: "completed", result: { url: "https://..." }\`. If the build throws, BullMQ retries up to 3 times with exponential backoff; after that, the state is \`failed\` with \`failedReason\`.`,
      questions: [
        { q: 'How do you design an API for a task that takes 5 minutes?', a: 'Return 202 Accepted with a job id and status URL, process in a background queue, and let the client poll, subscribe via SSE/WebSocket, or receive a webhook when it finishes.' },
        { q: 'What does 202 mean?', a: 'The request was accepted for processing, but processing is not complete. It promises nothing about the final outcome.' },
        { q: 'Polling vs webhook for job completion?', a: 'Polling is simple and works for browsers. Webhooks are better for server-to-server, avoiding wasted calls. Browsers can also get push via SSE or WebSockets.' },
        { q: 'Why must workers be idempotent?', a: 'Queues usually deliver at least once; a job can run twice after a crash or timeout. Running it twice must not cause duplicate side effects.' },
      ],
      spoken: `"For slow operations I don't keep the HTTP request open. I enqueue a job, in Node usually with BullMQ on Redis or SQS on AWS, and return 202 Accepted with a job id and a Location header for the status endpoint. A separate worker does the work with retries, exponential backoff and a dead-letter queue. The client can poll the status endpoint, I can push updates with SSE or Socket.IO, or for server clients I send a webhook. Both the create call and the worker must be idempotent, because retries and at-least-once delivery mean jobs can run twice."`,
      mistakes: [
        'Doing minutes of work inside the request handler and hitting load balancer or serverless timeouts.',
        'Letting any user read any job status — check the job belongs to the caller.',
        'Polling every 100 ms from thousands of clients. Use backoff, `Retry-After`, or push.',
        'Follow-up trap: "What happens if the worker crashes mid-job?" The queue marks the job stalled and retries it, so the job logic must be idempotent and ideally checkpoint progress.',
      ],
      takeaway: 'Slow work → 202 + job id + queue + worker; client polls or gets pushed; everything idempotent.',
    },
    {
      id: 'retries-timeouts',
      title: 'Timeouts, Retries, Backoff and Circuit Breakers',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Always set timeouts, retry only safe or idempotent calls with exponential backoff + jitter, and use a circuit breaker to stop hammering a failing service.',
      what: `When your API calls another service (Stripe, an LLM API, another microservice), that call can be slow or fail. Three tools keep you safe:

- **Timeout** — stop waiting after N seconds. Without it, one slow service can hang all your requests.
- **Retry with backoff** — try again after a short wait, waiting longer each time (1s, 2s, 4s...). This is **exponential backoff**. Add **jitter** (random extra wait) so thousands of clients do not retry at the same moment.
- **Circuit breaker** — if a service keeps failing, stop calling it for a while and fail fast. Then test it with a few calls before fully opening traffic again.

#### Deeper version
**What to retry**: network errors, timeouts, 429, 502, 503, 504. **Do not retry** 400, 401, 403, 404, 422 — they will fail again. Only retry **idempotent** operations, or non-idempotent ones that carry an **Idempotency-Key**. Respect \`Retry-After\` when the server sends it.

**Retry storms**: if every layer (frontend → gateway → service A → service B) retries 3 times, one failure becomes 3 × 3 × 3 = 27 calls. Retry at one layer, and use a **retry budget**.

**Circuit breaker states**:
- **Closed** — normal, calls go through; failures are counted.
- **Open** — too many failures; calls fail immediately for a cool-down period.
- **Half-open** — after cool-down, allow a few test calls; success closes the circuit, failure opens it again.

Libraries: \`opossum\` (Node), resilience features in service meshes.

Related: **bulkheads** (separate connection pools so one slow dependency cannot use all resources), **fallbacks** (cached or default data), and **deadline propagation** (pass the remaining time budget to downstream calls).`,
      why: `In distributed systems, failures are normal. Without timeouts, slow dependencies cause cascading outages. Naive retries make outages worse. Backoff, jitter and circuit breakers let systems recover instead of collapsing.`,
      analogy: `Calling a busy friend: you hang up after 30 seconds (timeout), call again in 1 minute, then 2, then 4 (backoff), at a slightly random time so you do not clash with others (jitter). If they never answer all morning, you stop calling until lunch (circuit open), then try once (half-open).`,
      code: [
        {
          title: 'fetch with timeout, retries, backoff and jitter',
          lang: 'javascript',
          code: `const RETRYABLE = new Set([429, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetry(url, options = {}, { retries = 3, timeoutMs = 5000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
      if (!RETRYABLE.has(res.status) || attempt === retries) return res;
      const retryAfter = Number(res.headers.get('retry-after'));
      if (retryAfter) { await sleep(retryAfter * 1000); continue; }
    } catch (err) {
      // Network error or timeout (AbortSignal.timeout throws TimeoutError)
      if (attempt === retries) throw err;
    }
    // Exponential backoff with "full jitter": random between 0 and base * 2^attempt
    const delay = Math.random() * Math.min(10000, 500 * 2 ** attempt);
    await sleep(delay);
  }
}

// Only safe because the call is idempotent (has an Idempotency-Key)
const res = await fetchWithRetry('https://api.partner.com/charges', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
  body: JSON.stringify({ amount: 500 }),
});`,
        },
        {
          title: 'Circuit breaker with opossum',
          lang: 'javascript',
          code: `import CircuitBreaker from 'opossum';

const getRates = () => fetch('https://rates.example.com/latest').then((r) => {
  if (!r.ok) throw new Error('rates down');
  return r.json();
});

const breaker = new CircuitBreaker(getRates, {
  timeout: 3000,                 // count as failure after 3s
  errorThresholdPercentage: 50,  // open when half the calls fail
  resetTimeout: 30000,           // after 30s, go half-open and try again
});
breaker.fallback(() => ({ source: 'cache', usdInr: 83 })); // degrade gracefully
breaker.on('open', () => console.warn('rates circuit OPEN'));

app.get('/rates', async (req, res) => res.json(await breaker.fire()));`,
        },
      ],
      output: `If the partner returns 503 twice and then 200, \`fetchWithRetry\` waits a random short time after each failure and finally returns the 200. A 400 is returned immediately with no retry. With the breaker, if the rates service starts failing, after enough failures the circuit **opens**: \`/rates\` answers instantly from the fallback instead of waiting 3 seconds per request. After 30 seconds one test call is allowed; if it works, the circuit closes.`,
      questions: [
        { q: 'Which errors should you retry?', a: 'Transient ones: network errors, timeouts, 429, 502, 503 and 504. Do not retry 4xx client errors like 400, 401, 403, 404 or 422.' },
        { q: 'Why add jitter to backoff?', a: 'Without it, many clients that failed together retry at the same moments, creating waves of load (thundering herd). Randomness spreads retries out.' },
        { q: 'Explain a circuit breaker.', a: 'It wraps calls to a dependency. After too many failures it opens and fails fast for a cool-down period, then half-opens to test a few calls, and closes again if they succeed.' },
        { q: 'Is it safe to retry a POST?', a: 'Only if it is made idempotent, for example with an Idempotency-Key the server honours. Otherwise you risk duplicates.' },
      ],
      spoken: `"Every outbound call I make has a timeout, because one slow dependency can otherwise hang the whole service. I retry only transient failures — network errors, timeouts, 429 and 502 to 504 — and only for idempotent requests or ones with an idempotency key. Retries use exponential backoff with jitter and respect Retry-After. I'm careful not to retry at every layer, which multiplies traffic. For flaky dependencies I add a circuit breaker, like opossum, that fails fast when the service is down, uses a fallback, and tests recovery in a half-open state."`,
      mistakes: [
        'No timeout on HTTP calls — Node\'s `fetch` has no short default timeout, so a hung server can hold requests for a very long time.',
        'Retrying 4xx errors that will never succeed.',
        'Retrying at every layer, turning one failure into dozens of calls.',
        'Follow-up trap: "What is the difference between a retry and a circuit breaker?" Retries help with short, random failures; a circuit breaker protects against long outages by stopping calls entirely for a while.',
      ],
      takeaway: 'Timeout everything, retry only transient + idempotent with backoff and jitter, and break the circuit when a dependency is down.',
    },
    {
      id: 'oauth-basics',
      title: 'OAuth 2.0 Basics (Roles, Scopes, Tokens)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'OAuth 2.0 lets an app access a user\'s data on another service without getting their password, using limited, scoped tokens.',
      what: `**OAuth 2.0** is a standard for **delegated authorization**: letting one app act on your behalf at another service, **without sharing your password**.

Example: a scheduling app wants to read your Google Calendar. You do not give it your Google password. Instead, Google asks you "Allow this app to see your calendar?" and gives the app a limited **access token**.

**The four roles**:
- **Resource owner** — you, the user.
- **Client** — the app that wants access (the scheduling app).
- **Authorization server** — issues tokens after you log in and consent (Google's accounts server).
- **Resource server** — the API holding the data (Google Calendar API).

**Scopes** limit what the token can do: \`calendar.readonly\` instead of full account access.

#### Deeper version
- **Access token**: short-lived, sent as \`Authorization: Bearer ...\` to the resource server. Can be a JWT or an opaque string (checked via **token introspection**).
- **Refresh token**: gets new access tokens without bothering the user again (\`offline_access\` scope in OIDC; Google uses \`access_type=offline\`).
- **Client types**: **confidential** clients (servers) can keep a client secret; **public** clients (SPAs, mobile apps) cannot, so they rely on **PKCE**.
- **Redirect URI**: the authorization server only sends codes back to pre-registered URLs — a key protection.
- **state** parameter: random value to prevent CSRF on the callback.
- OAuth 2.0 is about **authorization**. It does not say who the user is. **OpenID Connect (OIDC)** adds an **ID token** for authentication ("Login with Google").
- **Deprecated flows**: the **Implicit** flow and **Resource Owner Password Credentials** flow are discouraged by current best practice (OAuth 2.0 Security BCP and the OAuth 2.1 draft). Use Authorization Code + PKCE instead.`,
      why: `Before OAuth, apps asked for your actual password to access other services — full access, no way to revoke one app, and passwords stored everywhere. OAuth gives limited, revocable, expiring access, and the user's password only ever goes to the real provider.`,
      analogy: `A **valet key** for your car. It starts the engine and drives (limited scope), but cannot open the boot or glovebox. You give the valet that key, not your master key, and you can take it back any time.`,
      code: [
        {
          title: 'The big picture of an OAuth request',
          lang: 'text',
          code: `1. User clicks "Connect Google Calendar" in MyScheduler (client)

2. Browser goes to Google (authorization server):
   https://accounts.google.com/o/oauth2/v2/auth
     ?client_id=myscheduler-123
     &redirect_uri=https://myscheduler.com/oauth/callback
     &response_type=code
     &scope=https://www.googleapis.com/auth/calendar.readonly
     &state=x7f2k9          (anti-CSRF random value)
     &code_challenge=...&code_challenge_method=S256   (PKCE)

3. User logs in AT GOOGLE and clicks "Allow"

4. Google redirects back: https://myscheduler.com/oauth/callback?code=4/abc&state=x7f2k9

5. MyScheduler's server swaps the code for tokens (back channel):
   POST https://oauth2.googleapis.com/token  -> { access_token, refresh_token, expires_in }

6. MyScheduler calls the Calendar API (resource server):
   GET /calendar/v3/... with Authorization: Bearer <access_token>`,
        },
        {
          title: 'Using the access token from Node',
          lang: 'javascript',
          code: `// After the code exchange you have tokens (store refresh_token encrypted in your DB)
async function listEvents(accessToken) {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5',
    { headers: { Authorization: \`Bearer \${accessToken}\` } }
  );
  if (res.status === 401) throw new Error('access token expired: use the refresh token');
  if (res.status === 403) throw new Error('missing scope or permission');
  return res.json();
}`,
        },
      ],
      output: `The user's Google password is typed only on Google's page. MyScheduler gets an access token limited to **read-only calendar** access. It can list the next 5 events. If it tried to delete an event, Google would return **403** (scope too small). When the access token expires (usually about an hour for Google), the API returns **401** and the app uses the refresh token to get a new one. The user can revoke the app any time from their Google account settings.`,
      questions: [
        { q: 'What problem does OAuth solve?', a: 'Delegated access: letting an app access a user\'s resources on another service with limited, revocable permissions, without the user sharing their password.' },
        { q: 'Name the OAuth roles.', a: 'Resource owner (user), client (the app), authorization server (issues tokens), and resource server (the API with the data).' },
        { q: 'What are scopes?', a: 'Strings that limit what an access token can do, like `calendar.readonly`. The user sees them on the consent screen, and the resource server enforces them.' },
        { q: 'OAuth vs OpenID Connect?', a: 'OAuth 2.0 is for authorization (access to APIs). OIDC is a layer on top that adds authentication: an ID token (a JWT) with user identity, plus a standard userinfo endpoint.' },
        { q: 'What is the state parameter for?', a: 'A random value the client sends and checks on the callback, to prevent CSRF and make sure the response belongs to a login the client started.' },
      ],
      spoken: `"OAuth 2.0 is a delegated authorization framework. It lets an app access my data on another service, like reading my Google Calendar, without ever seeing my password. There are four roles: the resource owner, the client app, the authorization server that issues tokens, and the resource server with the API. The user logs in at the provider, approves specific scopes, and the client gets a short-lived access token plus maybe a refresh token. OAuth itself doesn't tell you who the user is — that's what OpenID Connect adds with the ID token. Today the recommended flow is authorization code with PKCE."`,
      mistakes: [
        'Calling OAuth an authentication protocol. Plain OAuth is authorization; use OIDC for login.',
        'Requesting huge scopes "just in case". Ask for the minimum; users and app reviewers notice.',
        'Skipping the `state` check or allowing wildcard redirect URIs — both enable token theft.',
        'Follow-up trap: "Why not use the Implicit flow for SPAs anymore?" It returns tokens in the URL fragment, where they can leak via history, logs and extensions. Authorization Code + PKCE is safer and now recommended for SPAs.',
      ],
      takeaway: 'OAuth = limited, revocable, scoped tokens instead of passwords; OIDC adds "who is the user" on top.',
    },
    {
      id: 'oauth-flows',
      title: 'OAuth 2.0 Flows (Authorization Code + PKCE, Client Credentials, Refresh)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Auth Code + PKCE for apps with users, Client Credentials for machine-to-machine, Refresh Token grant to renew access silently.',
      what: `OAuth has different **flows** (also called **grants**) for different situations:

1. **Authorization Code + PKCE** — for any app with a **user** (web apps, SPAs, mobile). The user logs in at the provider; the app gets a short **code**; the app swaps the code for tokens.
2. **Client Credentials** — for **machine-to-machine** calls with no user. A backend service uses its own client id + secret to get a token (e.g. a cron job calling another internal API).
3. **Refresh Token** — use a refresh token to get a new access token when the old one expires, without the user logging in again.
4. **Device Code** — for TVs and CLIs with no easy keyboard: "go to example.com/device and enter ABCD-1234".

#### Deeper version
**PKCE** (Proof Key for Code Exchange, said "pixie"):
1. The app creates a random **code_verifier** (a long secret string).
2. It sends only its hash, the **code_challenge** = BASE64URL(SHA256(verifier)), in the login redirect.
3. When swapping the code for tokens, it sends the **original verifier**.
4. The server hashes it and checks it matches the challenge.

Why: if an attacker steals the code (malicious app on the same phone, logs), they cannot use it without the verifier, which never left the app. PKCE replaces the need for a client secret in public clients, and current best practice recommends it for **all** clients, even server apps.

**Client Credentials**: \`POST /token\` with \`grant_type=client_credentials\`, client id/secret (or a signed JWT / mTLS), and scopes. No refresh token is needed; just request a new access token and cache it until shortly before expiry.

**Refresh Token grant**: \`grant_type=refresh_token&refresh_token=...\`. Providers may **rotate** refresh tokens — always store the newest one returned.

**SPA token handling**: a growing pattern is the **BFF** (Backend for Frontend): the server does the OAuth flow, keeps tokens server-side, and gives the browser only an HttpOnly session cookie.`,
      why: `Each flow fits a different trust level. Using the wrong one (like Implicit in an SPA, or a user flow for a cron job) creates security holes or awkward designs. PKCE in particular is a frequent interview question because it is now the default for SPAs and mobile apps.`,
      analogy: `PKCE is like a cloakroom where you write a secret word, show the attendant only a sealed fingerprint of it, and get a ticket. To collect your coat you must say the secret word. Someone who steals your ticket still cannot collect the coat. Client credentials is a company van with its own staff badge — no person needed. Refresh is renewing your monthly pass without re-applying.`,
      code: [
        {
          title: 'Authorization Code + PKCE (Express client)',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';

const AUTH_URL = 'https://auth.example.com/authorize';
const TOKEN_URL = 'https://auth.example.com/oauth/token';
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const REDIRECT_URI = 'https://app.example.com/callback';

app.get('/login', (req, res) => {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauth = { verifier, state }; // keep secrets server-side

  const params = new URLSearchParams({
    response_type: 'code', client_id: CLIENT_ID, redirect_uri: REDIRECT_URI,
    scope: 'openid profile email offline_access', state,
    code_challenge: challenge, code_challenge_method: 'S256',
  });
  res.redirect(\`\${AUTH_URL}?\${params}\`);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const saved = req.session.oauth;
  if (!saved || state !== saved.state) return res.status(400).send('Invalid state');

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID, code_verifier: saved.verifier, // proves we started the flow
    }),
  });
  const tokens = await tokenRes.json(); // { access_token, refresh_token, id_token, expires_in }
  req.session.tokens = tokens;          // BFF style: tokens never reach the browser
  delete req.session.oauth;
  res.redirect('/');
});`,
        },
        {
          title: 'Client Credentials (service to service) with caching',
          lang: 'javascript',
          code: `let cached = { token: null, expiresAt: 0 };

export async function getServiceToken() {
  if (cached.token && Date.now() < cached.expiresAt - 60_000) return cached.token; // reuse
  const res = await fetch('https://auth.example.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SVC_CLIENT_ID,
      client_secret: process.env.SVC_CLIENT_SECRET,
      scope: 'invoices:read',
    }),
  });
  const { access_token, expires_in } = await res.json();
  cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}

// Refresh Token grant (for user tokens) looks like:
// body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token, client_id })
// Always save the NEW refresh_token if the provider returns one (rotation).`,
        },
      ],
      output: `Visiting \`/login\` redirects to the provider with a \`code_challenge\` and \`state\`. After login, the provider redirects to \`/callback?code=...&state=...\`. The server checks \`state\`, sends the code **plus the verifier**, and receives tokens. An attacker who intercepted the code cannot redeem it: they do not have the verifier. The service token function fetches a token once, then reuses it from memory until one minute before expiry.`,
      questions: [
        { q: 'Which OAuth flow for a React SPA?', a: 'Authorization Code with PKCE. Ideally through a BFF so tokens stay on the server and the browser only has an HttpOnly session cookie. The Implicit flow is no longer recommended.' },
        { q: 'What is PKCE and why is it needed?', a: 'Proof Key for Code Exchange. The client sends a hash of a random verifier at the start and the verifier itself when redeeming the code, so a stolen authorization code is useless. It protects public clients that cannot keep a secret.' },
        { q: 'When would you use Client Credentials?', a: 'For machine-to-machine calls with no user involved, like a backend job calling an internal API. The service authenticates as itself with its client id and secret.' },
        { q: 'Why exchange a code instead of getting tokens directly in the redirect?', a: 'The redirect goes through the browser URL, which can leak. The code is short-lived and single-use, and the actual tokens are fetched over a direct back-channel POST.' },
        { q: 'Does Client Credentials return a refresh token?', a: 'Normally no. The client can simply request a new access token with its credentials when needed.' },
      ],
      spoken: `"For apps with a user — web, SPA or mobile — I use authorization code with PKCE. The app creates a random verifier, sends its SHA-256 hash as the code challenge in the redirect, and later sends the verifier when exchanging the code for tokens, so an intercepted code is useless. I also check the state parameter against CSRF. For machine-to-machine calls with no user, I use client credentials and cache the token until near expiry. The refresh token grant renews user access tokens silently, and I always store the new refresh token in case the provider rotates it."`,
      mistakes: [
        'Putting a client secret inside a SPA or mobile app bundle. Anyone can extract it — use PKCE.',
        'Using `code_challenge_method=plain`. Always use `S256`.',
        'Requesting a new client-credentials token on every API call instead of caching it.',
        'Follow-up trap: "Does PKCE replace the state parameter?" PKCE protects the code exchange; `state` (or OIDC `nonce`) still protects against CSRF and mix-up on the callback. Use both.',
      ],
      takeaway: 'Users → Auth Code + PKCE; machines → Client Credentials; staying logged in → Refresh Token grant.',
    },
    {
      id: 'sso-saml-oidc',
      title: 'SSO: SAML vs OIDC',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Single Sign-On lets users log in once with a central identity provider. SAML uses signed XML (enterprise); OIDC uses JWTs on top of OAuth (modern apps).',
      what: `**SSO (Single Sign-On)** means a user logs in **once** at a central **Identity Provider (IdP)** — like Okta, Azure AD (Entra ID), Google Workspace — and then can use many apps without logging in again.

The apps are called **Service Providers (SP)** in SAML or **Relying Parties (RP)** in OIDC.

Two main protocols:
- **SAML 2.0** — older (2005), XML-based. The IdP sends a signed XML **assertion** ("this is asha@corp.com, groups: engineering") to the app through the browser. Very common in **enterprise** B2B SaaS.
- **OIDC (OpenID Connect)** — modern (2014), built on OAuth 2.0, JSON/JWT-based. The IdP returns an **ID token** (a JWT) with the user's identity. Used by "Sign in with Google", and by mobile apps and SPAs.

#### Deeper version
**SAML flow (SP-initiated)**:
1. User opens \`app.com\`; app redirects to the IdP with a SAML **AuthnRequest**.
2. User logs in at the IdP (maybe already logged in → instant).
3. IdP POSTs a signed **SAMLResponse** (XML, base64) to the app's **ACS URL** (Assertion Consumer Service).
4. App verifies the **XML signature** with the IdP's certificate, checks audience, time window and InResponseTo, then creates its own session.
There is also **IdP-initiated** login (user clicks the app tile in Okta), which is riskier because there is no request to match.

**OIDC flow**: Authorization Code + PKCE with scope \`openid\`. The token response includes an **id_token**. Verify its signature via the IdP's **JWKS**, and check \`iss\`, \`aud\` (your client id), \`exp\`, and \`nonce\`. Discovery doc at \`/.well-known/openid-configuration\`.

**Comparison**:
- Format: SAML = XML; OIDC = JSON/JWT.
- Clients: SAML is browser-focused; OIDC fits SPAs, mobile and APIs.
- API access: SAML only does login; OIDC also gives OAuth access tokens.
- Complexity: XML signature validation is tricky (XML signature wrapping attacks) — always use a well-tested library.

**Related**: **SCIM** is a standard for automatic user provisioning/deprovisioning from the IdP. Enterprise customers often ask for SSO + SCIM together. **Single logout** is hard in both protocols; many apps just keep short sessions.`,
      why: `Companies want one place to manage employee access: enforce MFA, and instantly remove access when someone leaves. For B2B SaaS, "Do you support SAML SSO?" is often a deal requirement. For consumer apps, "Sign in with Google" (OIDC) improves sign-up rates and avoids storing passwords.`,
      analogy: `SSO is like a company ID badge. Security (IdP) checks your identity once in the morning. After that, each office door (app) trusts the badge. SAML is a badge with a stamped paper letter (XML); OIDC is a modern smart card (JWT) that also opens the vending machines (APIs).`,
      code: [
        {
          title: 'Verify an OIDC ID token with jose',
          lang: 'javascript',
          code: `import { createRemoteJWKSet, jwtVerify } from 'jose';

const ISSUER = 'https://accounts.google.com';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function verifyIdToken(idToken, expectedNonce) {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ISSUER,
    audience: process.env.GOOGLE_CLIENT_ID, // token must be meant for OUR app
  });
  if (payload.nonce !== expectedNonce) throw new Error('nonce mismatch (replay?)');
  // payload: { sub, email, email_verified, name, picture, exp, ... }
  return { providerUserId: payload.sub, email: payload.email, verified: payload.email_verified };
}

// Link accounts by (provider, sub), NOT by email alone: sub is the stable id.`,
        },
        {
          title: 'SAML with passport-saml style config (shape only)',
          lang: 'javascript',
          code: `// Library and option names vary by package/version (@node-saml/passport-saml); check its docs.
import passport from 'passport';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';

passport.use(new SamlStrategy(
  {
    entryPoint: 'https://idp.customer.com/sso/saml',  // IdP login URL
    issuer: 'https://app.example.com/saml/metadata',  // our SP entity id
    callbackUrl: 'https://app.example.com/saml/acs',  // ACS URL
    idpCert: process.env.CUSTOMER_IDP_CERT,           // verify XML signatures
    wantAssertionsSigned: true,
  },
  (profile, done) => done(null, { email: profile.nameID, groups: profile.groups }),
  (profile, done) => done(null, profile),             // logout verify callback
));

app.post('/saml/acs', express.urlencoded({ extended: false }),
  passport.authenticate('saml', { session: false }),
  (req, res) => { /* create our own session for req.user */ res.redirect('/'); });`,
        },
      ],
      output: `For OIDC, \`verifyIdToken\` downloads Google's public keys (cached), checks the signature, issuer, audience and expiry, then checks the nonce. You get a stable \`sub\` to link to your user record. For SAML, the IdP POSTs a signed XML response to \`/saml/acs\`; the library verifies the signature with the customer's certificate and gives you the user's email and groups, and you create your own app session.`,
      questions: [
        { q: 'What is SSO?', a: 'Single Sign-On: users authenticate once with a central identity provider and gain access to many applications without logging in again.' },
        { q: 'SAML vs OIDC?', a: 'SAML is an older XML-based standard, mainly for enterprise browser SSO. OIDC is a modern JSON/JWT layer on OAuth 2.0 that works well for web, mobile and APIs. New builds usually prefer OIDC; enterprise customers often still require SAML.' },
        { q: 'What is an IdP and an SP?', a: 'The Identity Provider authenticates users (Okta, Entra ID, Google). The Service Provider (or Relying Party) is the application that trusts the IdP\'s assertion or token.' },
        { q: 'What must you validate in an OIDC ID token?', a: 'Signature (via JWKS), `iss`, `aud` equals your client id, `exp`, and `nonce`. Then use `sub` as the stable user id.' },
        { q: 'What is SCIM?', a: 'System for Cross-domain Identity Management: an API standard the IdP uses to create, update and deactivate users in your app automatically.' },
      ],
      spoken: `"SSO lets users log in once at a central identity provider like Okta or Entra ID and access many apps. The two main protocols are SAML and OIDC. SAML is XML-based: the IdP posts a signed assertion to the app's ACS URL, and the app verifies the XML signature. It's still the standard in enterprise B2B. OIDC is built on OAuth 2.0 and returns a JWT ID token, which I verify with the IdP's JWKS, checking issuer, audience, expiry and nonce. For new apps I prefer OIDC, but for enterprise customers I usually support SAML plus SCIM provisioning."`,
      mistakes: [
        'Writing your own XML signature validation. Use a well-maintained SAML library; XML signature wrapping attacks are subtle.',
        'Linking accounts by email only. Emails can change or be unverified; use the provider\'s stable `sub`/NameID with the provider id.',
        'Not checking `aud` on ID tokens, so a token issued for another app is accepted.',
        'Follow-up trap: "Is OIDC just OAuth?" It is built on OAuth 2.0 but adds the ID token, the `openid` scope, a userinfo endpoint and discovery — making it an authentication protocol.',
      ],
      takeaway: 'SSO = log in once at an IdP; SAML = signed XML for enterprise, OIDC = JWT ID token on top of OAuth for modern apps.',
    },
    {
      id: 'graphql-dataloader',
      title: 'GraphQL N+1 Problem and DataLoader',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Nested resolvers can fire one DB query per item (N+1); DataLoader batches those into one query per tick and caches per request.',
      what: `In GraphQL, each field has its own resolver. Consider:

\`\`\`graphql
{ posts { title author { name } } }
\`\`\`

- 1 query to get 50 posts.
- Then the \`author\` resolver runs **once per post** → 50 more queries.

That is **1 + N** queries — the **N+1 problem**. It gets worse with deeper nesting.

**DataLoader** (a small library from Facebook) fixes it. Instead of loading one author at a time, each resolver calls \`authorLoader.load(id)\`. DataLoader **collects** all the ids requested in the same tick of the event loop and calls your **batch function once** with all of them: one query with \`$in: [ids]\`.

#### Deeper version
- **Batching**: \`load()\` calls made in the same tick are grouped; the batch function receives an array of keys and **must return an array of results in the same order and same length** (use \`null\` or an \`Error\` for missing ones).
- **Caching**: DataLoader memoizes by key, so the same author requested twice is loaded once. This cache is **per request** — create new loaders for every request (in the GraphQL context). A global loader would leak data between users and serve stale data.
- **Authorization**: if results depend on the user, the per-request loader keeps it safe.
- Other N+1 fixes: look-ahead using the \`info\` argument to join/populate in the parent resolver, or tools that compile GraphQL to SQL. DataLoader is the standard answer.
- N+1 is not only a GraphQL problem — the same issue happens in REST with ORMs (\`for each order: await order.getCustomer()\`). In Mongoose, \`populate\` batches with \`$in\`.`,
      why: `N+1 turns one page load into hundreds of database round trips, which kills latency and DB capacity as data grows. It is the most common GraphQL performance problem, so interviewers expect you to name it and explain DataLoader.`,
      analogy: `A waiter taking orders from a table of 10 and walking to the kitchen 10 separate times (N+1). DataLoader is the waiter who writes down all 10 orders and makes **one** trip. And if two people order the same dish, he writes it once (caching).`,
      code: [
        {
          title: 'N+1 problem vs DataLoader fix',
          lang: 'javascript',
          code: `import DataLoader from 'dataloader';

// BAD: one DB query per post (N+1)
const badResolvers = {
  Post: {
    author: (post) => User.findById(post.authorId), // runs 50 times for 50 posts
  },
};

// GOOD: batch function gets ALL ids at once
async function batchUsers(ids) {
  const users = await User.find({ _id: { $in: ids } }).lean(); // ONE query
  const byId = new Map(users.map((u) => [String(u._id), u]));
  return ids.map((id) => byId.get(String(id)) ?? null);       // same order & length as ids!
}

// New loaders for EVERY request (per-request cache, no data leaks)
export const createContext = ({ req }) => ({
  user: req.user,
  loaders: { user: new DataLoader(batchUsers) },
});

const resolvers = {
  Query: { posts: () => Post.find().limit(50).lean() },
  Post: {
    author: (post, _args, ctx) => ctx.loaders.user.load(String(post.authorId)),
  },
};`,
        },
      ],
      output: `With the bad resolvers, the query \`{ posts { title author { name } } }\` for 50 posts makes **51** database queries. With DataLoader it makes **2**: one for posts, one \`User.find({ _id: { $in: [...] } })\`. If 30 posts share the same 5 authors, DataLoader asks only for the 5 unique ids. Because loaders are created in the context per request, user A's request never reuses user B's cached data.`,
      questions: [
        { q: 'What is the N+1 problem in GraphQL?', a: 'One query fetches a list of N items, then a nested field resolver runs a separate query for each item, giving N+1 queries total.' },
        { q: 'How does DataLoader solve it?', a: 'It collects all `load(key)` calls made in the same event-loop tick and calls a batch function once with all keys, so N lookups become one query. It also caches by key within the request.' },
        { q: 'Why create DataLoaders per request?', a: 'Its cache would otherwise be shared across users and requests, leaking data and returning stale results. Per-request loaders are isolated and short-lived.' },
        { q: 'What must the batch function return?', a: 'An array with the same length and order as the input keys, with `null` or an Error for keys that were not found.' },
      ],
      spoken: `"The N+1 problem happens when a list query returns N items and a nested resolver, like post dot author, runs one database query per item — so 50 posts become 51 queries. The standard fix is DataLoader. Each resolver calls loader dot load with an id, DataLoader collects all the ids from the same tick and calls my batch function once, where I do a single query with dollar-in. The batch function must return results in the same order as the keys. I create loaders per request in the GraphQL context, so the cache never leaks data between users."`,
      mistakes: [
        'Returning results from the batch function in database order instead of key order — authors get mixed up between posts.',
        'Creating one global DataLoader for the whole server, leaking cached data across users.',
        'Thinking DataLoader is a long-term cache like Redis. It only caches within one request.',
        'Follow-up trap: "How do you detect N+1 in production?" Log or trace DB queries per request (APM tools, Mongoose debug, OpenTelemetry) and alert when a single request runs many similar queries.',
      ],
      takeaway: 'N+1 = one query per item; DataLoader batches keys per tick into one query and caches per request.',
    },
    {
      id: 'socketio-scaling',
      title: 'Scaling Socket.IO / WebSockets (Redis Adapter, Sticky Sessions)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Many server instances need sticky sessions (for polling fallback) and a pub/sub adapter like Redis so broadcasts reach sockets on every instance.',
      what: `One Node server can hold many thousands of WebSocket connections, but eventually you need **several instances**. Two problems appear:

1. **Broadcasts miss users**. Asha is connected to server A, Ravi to server B. When server A runs \`io.to('room:1').emit(...)\`, it only knows its **own** sockets. Ravi gets nothing.
   **Fix**: the **Redis adapter**. Every instance publishes broadcasts to Redis **pub/sub**, and every instance subscribes, so each one forwards the message to its local sockets in that room.

2. **Requests land on the wrong server**. Socket.IO may start with HTTP long polling, which is many separate HTTP requests that must all reach the **same** server (the session lives in that server's memory).
   **Fix**: **sticky sessions** at the load balancer (by cookie or IP hash). Or force the WebSocket transport only (\`transports: ['websocket']\`), which avoids the polling problem.

#### Deeper version
- **Adapters**: \`@socket.io/redis-adapter\` (Redis pub/sub), a **Redis Streams** adapter (survives temporary Redis disconnections better), plus adapters for MongoDB, Postgres and cloud pub/sub. In the Node cluster module, use \`@socket.io/cluster-adapter\` with sticky sessions.
- **Emitting from non-socket processes**: a worker or REST server can use \`@socket.io/redis-emitter\` to send events to rooms without running a Socket.IO server.
- **Load balancers**: AWS ALB supports WebSockets and sticky sessions; set idle timeout higher than your heartbeat interval. nginx needs the \`Upgrade\` and \`Connection\` headers proxied.
- **Capacity limits**: file descriptors (\`ulimit\`), memory per connection, and the event loop. Monitor connection counts per instance.
- **Deploys**: rolling restarts drop connections; clients must reconnect with backoff and **resync** missed state (from the DB).
- **Redis pub/sub is fire-and-forget**: it does not store messages. If an instance is disconnected from Redis, it misses messages. Persist important data elsewhere.
- **Managed alternatives**: AWS API Gateway WebSockets, Ably, Pusher, or Azure Web PubSub — they handle fan-out for you.`,
      why: `Real-time features usually work fine on one dev server and break mysteriously in production with two instances: some users stop receiving messages and connections keep failing during the polling handshake. Knowing the adapter + sticky session pattern is key for any chat or notifications system design.`,
      analogy: `A hotel with several reception desks (instances). A guest who checked in at desk A must keep going back to desk A (sticky sessions), because that desk has their file. When the manager wants to announce something to all guests on floor 3 (a room), he uses the public speaker system connected to every desk (Redis pub/sub), not just one desk's microphone.`,
      code: [
        {
          title: 'Socket.IO with the Redis adapter',
          lang: 'javascript',
          code: `import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate(); // pub/sub needs its own connection
await Promise.all([pubClient.connect(), subClient.connect()]);

const httpServer = createServer();
const io = new Server(httpServer, {
  adapter: createAdapter(pubClient, subClient),
  // transports: ['websocket'], // optional: skip long polling -> sticky sessions less critical
});

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
  socket.on('msg', ({ room, text }) => {
    // Reaches sockets in "room" on EVERY instance, via Redis
    io.to(room).emit('msg', { text, from: socket.id, via: process.env.HOSTNAME });
  });
});

httpServer.listen(Number(process.env.PORT) || 3000);`,
        },
        {
          title: 'nginx: WebSocket upgrade + sticky by IP',
          lang: 'nginx',
          code: `upstream socket_nodes {
    ip_hash;                       # sticky: same client IP -> same instance
    server app1:3000;
    server app2:3000;
}

server {
    listen 80;
    location /socket.io/ {
        proxy_pass http://socket_nodes;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;     # allow WebSocket upgrade
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 75s;                     # longer than ping interval
    }
}`,
        },
      ],
      output: `Run two instances behind nginx. Asha connects to \`app1\`, Ravi to \`app2\`, both join \`room:1\`. When Asha sends a message, \`app1\` emits to \`room:1\`; the Redis adapter publishes it, \`app2\` receives it from Redis and delivers it to Ravi. Without the adapter, Ravi would see nothing. \`ip_hash\` keeps each client's polling requests on the same instance, so the handshake does not fail with "Session ID unknown" errors.`,
      questions: [
        { q: 'Why do you need the Redis adapter?', a: 'Each Socket.IO instance only knows its own connections. The adapter uses Redis pub/sub so a broadcast to a room on one instance is relayed to sockets in that room on all instances.' },
        { q: 'Why are sticky sessions needed?', a: 'The long-polling transport sends many HTTP requests that must reach the same instance holding that session. Without stickiness the handshake fails. Using WebSocket-only transport reduces this need.' },
        { q: 'How do you send a socket event from a background worker?', a: 'Use the Redis emitter (`@socket.io/redis-emitter`) or publish to the same Redis channel; instances with the adapter deliver it to the right rooms.' },
        { q: 'What happens to connections during a deploy?', a: 'They drop when instances restart. Clients reconnect automatically with backoff, re-authenticate, rejoin rooms, and should fetch missed data from the API or DB.' },
      ],
      spoken: `"Scaling Socket.IO beyond one instance has two issues. First, each instance only knows its own sockets, so a room broadcast misses users connected elsewhere. I fix that with the Redis adapter, which relays broadcasts between instances over Redis pub/sub. Second, the long-polling transport needs every request of a session to hit the same server, so I enable sticky sessions on the load balancer, or force WebSocket-only transport. I also tune load balancer idle timeouts, plan for reconnect storms during deploys, and persist messages because Redis pub/sub doesn't store anything."`,
      mistakes: [
        'Scaling to multiple instances without an adapter and wondering why some users miss messages.',
        'Forgetting sticky sessions with the polling transport, causing constant "400 Session ID unknown" errors.',
        'Load balancer idle timeout shorter than the heartbeat, so connections drop every minute.',
        'Follow-up trap: "Does the Redis adapter guarantee delivery?" No. Redis pub/sub is fire-and-forget; if an instance or client is disconnected, messages are lost. Store important messages and resync on reconnect.',
      ],
      takeaway: 'Multiple instances need a pub/sub adapter (Redis) for broadcasts and sticky sessions (or WebSocket-only) for connections.',
    },
    {
      id: 'webrtc-connection',
      title: 'WebRTC: Signalling, STUN, TURN and ICE',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'WebRTC sends audio/video/data directly between browsers; a signalling server swaps offers/answers, STUN finds public addresses, TURN relays when direct fails, ICE picks the best path.',
      what: `**WebRTC** (Web Real-Time Communication) lets browsers send **audio, video and data directly to each other** (peer-to-peer), with very low delay. Used for video calls, screen sharing and multiplayer games.

But two browsers cannot just find each other. They need help:

- **Signalling** — before the call, the peers must exchange connection details. WebRTC does **not** define how; you build it, usually with **WebSockets / Socket.IO**. They exchange:
  - an **offer** and an **answer** in **SDP** format (Session Description Protocol: "I can send VP8 video and Opus audio...").
  - **ICE candidates** (possible network addresses to reach me).
- **STUN server** — answers "what is my public IP and port?". Most devices sit behind a router (**NAT**), so they only know their private address (\`192.168.1.5\`). STUN is cheap: it only tells you your address.
- **TURN server** — a **relay**. When a direct connection is impossible (strict corporate firewalls, symmetric NAT), all media goes **through** the TURN server. Always works, but costs bandwidth and money.
- **ICE** (Interactive Connectivity Establishment) — the process that collects all candidates (local, STUN-discovered, TURN relay), tests pairs, and picks the **best working path** (direct first, relay last).

#### Deeper version
**Candidate types**: \`host\` (local IP), \`srflx\` (server-reflexive — public address from STUN), \`relay\` (from TURN). ICE prefers host, then srflx, then relay.

**Flow**:
1. Caller: \`getUserMedia\` → add tracks → \`createOffer()\` → \`setLocalDescription(offer)\` → send offer via signalling.
2. Callee: \`setRemoteDescription(offer)\` → \`createAnswer()\` → \`setLocalDescription(answer)\` → send answer back.
3. Both: as \`onicecandidate\` fires, send each candidate to the other peer, who calls \`addIceCandidate\` (**trickle ICE** — sending candidates as they are found speeds things up).
4. ICE connects; media flows over **SRTP** (encrypted RTP). Data channels use **SCTP over DTLS**. WebRTC traffic is **always encrypted**.

**TURN in practice**: run **coturn** or use a managed service (Twilio, Cloudflare, Xirsys). Give TURN **short-lived credentials** generated by your backend, not static passwords in frontend code. A noticeable share of real-world calls need TURN (often quoted around 10-20%, varies by network).

**RTCDataChannel**: send arbitrary data peer-to-peer (files, game state), reliable or unreliable.`,
      why: `Sending video through your own server for every call is expensive and adds delay. WebRTC lets media flow directly between users in most cases. But real networks (NAT, firewalls) block direct connections, so you need signalling, STUN and TURN to make calls work everywhere.`,
      analogy: `Two people want to meet but only know each other's phone numbers. **Signalling** is texting each other "here is how to reach me". **STUN** is asking a friend "what is my home address as seen from outside?". **ICE** is trying every route on the map and picking the fastest. **TURN** is when roads are blocked, so you both send parcels through a post office in the middle.`,
      code: [
        {
          title: 'Browser: peer connection with Socket.IO signalling',
          lang: 'javascript',
          code: `import { io } from 'socket.io-client';
const socket = io('https://signal.example.com');

// Short-lived TURN credentials should come from your backend
const { iceServers } = await (await fetch('/api/ice-servers')).json();
// e.g. [{ urls: 'stun:stun.l.google.com:19302' },
//       { urls: 'turn:turn.example.com:3478', username: 'u', credential: 'temp' }]

const pc = new RTCPeerConnection({ iceServers });

// Send my ICE candidates to the other peer as they are found (trickle ICE)
pc.onicecandidate = (e) => e.candidate && socket.emit('signal', { candidate: e.candidate });
// Show the remote video when tracks arrive
pc.ontrack = (e) => { document.querySelector('#remote').srcObject = e.streams[0]; };

const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach((track) => pc.addTrack(track, stream));

// Caller side
export async function call() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('signal', { sdp: pc.localDescription });
}

// Both sides: handle what the other peer sends
socket.on('signal', async ({ sdp, candidate }) => {
  if (sdp) {
    await pc.setRemoteDescription(sdp);
    if (sdp.type === 'offer') {
      await pc.setLocalDescription(await pc.createAnswer());
      socket.emit('signal', { sdp: pc.localDescription });
    }
  } else if (candidate) {
    await pc.addIceCandidate(candidate);
  }
});`,
        },
        {
          title: 'Minimal signalling server (relay only)',
          lang: 'javascript',
          code: `import { Server } from 'socket.io';
const io = new Server(3001, { cors: { origin: '*' } }); // restrict origins in production

io.on('connection', (socket) => {
  socket.join('call-room'); // real apps: one room per call, with auth
  // The server never touches media: it only forwards SDP and ICE candidates
  socket.on('signal', (data) => socket.to('call-room').emit('signal', data));
});`,
        },
      ],
      output: `Peer A calls \`call()\`: it creates an SDP offer and sends it through the signalling server. Peer B sets it as the remote description, creates an answer and sends it back. Meanwhile both send ICE candidates. ICE tests the pairs; on a home network it usually finds a direct \`srflx\` path through STUN. Behind a strict corporate firewall, only the \`relay\` candidate works, and media flows through TURN. Then the \`#remote\` video element shows the other person. The signalling server only ever saw small JSON messages, never the video.`,
      questions: [
        { q: 'What is signalling in WebRTC?', a: 'Exchanging session descriptions (SDP offer/answer) and ICE candidates between peers before and during connection setup. WebRTC does not define the transport; apps often use WebSockets.' },
        { q: 'STUN vs TURN?', a: 'STUN tells a client its public IP and port so peers can try a direct connection; it is cheap. TURN relays all media when direct connection fails; it always works but uses server bandwidth.' },
        { q: 'What is ICE?', a: 'Interactive Connectivity Establishment: it gathers candidate addresses (host, STUN, TURN), tests candidate pairs, and selects the best path that works.' },
        { q: 'Is WebRTC encrypted?', a: 'Yes, always. Media uses SRTP with keys negotiated over DTLS, and data channels run over DTLS.' },
        { q: 'Why do you still need a server for "peer-to-peer"?', a: 'For signalling (peers must find and describe each other), STUN for NAT discovery, TURN for relaying when direct paths are blocked, and SFUs for group calls.' },
      ],
      spoken: `"WebRTC lets browsers stream audio, video or data directly to each other. Because peers can't find each other on their own, you need signalling — usually a WebSocket server — to exchange the SDP offer and answer and the ICE candidates. Most devices are behind NAT, so a STUN server tells each peer its public address. If a direct path is blocked, like on strict corporate networks, a TURN server relays the media. ICE is the process that gathers all those candidates, tests them and picks the best path. I'd give TURN short-lived credentials from the backend, and everything is encrypted with DTLS and SRTP."`,
      mistakes: [
        'Thinking WebRTC needs no servers at all. Signalling, STUN and TURN are almost always required.',
        'Shipping without a TURN server — calls work in the office demo but fail for a share of real users.',
        'Hard-coding permanent TURN credentials in frontend code; anyone can use your relay bandwidth.',
        'Follow-up trap: "Does the signalling server see the video?" No. It only forwards SDP and ICE messages. Media goes peer-to-peer, or through TURN/SFU, which see encrypted packets.',
      ],
      takeaway: 'Signalling swaps offers/answers, STUN finds your public address, TURN relays when blocked, ICE picks the best path.',
    },
    {
      id: 'webrtc-topologies',
      title: 'WebRTC Group Calls: Mesh vs SFU vs MCU',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Mesh: everyone sends to everyone (small calls). SFU: everyone sends once to a server that forwards streams (most apps). MCU: server mixes all into one stream (heavy server).',
      what: `For a 1-to-1 call, peer-to-peer is perfect. For **group calls**, there are three designs:

- **Mesh** — every participant connects directly to every other participant. With 5 people, each person **uploads** their video 4 times. No media server needed, but upload bandwidth and CPU explode. Works for about 2-4 people.
- **SFU (Selective Forwarding Unit)** — each person uploads **once** to a server. The server **forwards** (does not decode) the streams to the others. Each person downloads N-1 streams. This is what most modern apps use (Google Meet, Zoom-style apps, LiveKit, mediasoup, Janus).
- **MCU (Multipoint Control Unit)** — each person uploads once; the server **decodes, mixes** everything into one combined video (a grid), re-encodes and sends **one** stream to each person. Very light for clients, very heavy (and expensive) for the server, and adds delay. Used for legacy video conferencing systems and old devices.

#### Deeper version
**Connection counts** for N participants:
- Mesh: N × (N − 1) / 2 peer connections; each client uploads N − 1 streams.
- SFU: N connections to the server; each client uploads 1, downloads up to N − 1.
- MCU: N connections; each client uploads 1, downloads 1.

**SFU tricks**:
- **Simulcast** — the sender uploads the same video at 2-3 qualities (e.g. 180p, 360p, 720p). The SFU forwards the right one to each receiver based on their bandwidth and layout (thumbnail vs speaker).
- **SVC** (Scalable Video Coding) — one stream with layers the SFU can drop.
- **Last-N / active speaker** — only forward video for the few people currently talking.
- Because the SFU does not decode, it is cheap per stream, but true end-to-end encryption needs extra work (Insertable Streams / SFrame).

**Scaling SFUs**: cascade SFUs across regions for global calls; for big **broadcasts** (1 to thousands), switch to HLS/DASH or WebRTC-based CDNs.

**Recording**: often done by a bot participant or server-side compositing.`,
      why: `Picking the wrong topology either melts users' laptops and uplinks (mesh with 10 people) or burns money on servers (MCU for everything). System design interviews for "build a video call app" expect this trade-off.`,
      analogy: `A group of friends sharing photos. **Mesh**: everyone sends their photo separately to every friend — tiring with many friends. **SFU**: everyone sends their photo once to a group admin, who forwards copies to all. **MCU**: the admin makes one collage of all photos and sends that single collage to everyone.`,
      code: [
        {
          title: 'Bandwidth maths for a 6-person call (720p ≈ 1.5 Mbps)',
          lang: 'javascript',
          code: `const n = 6;
const streamMbps = 1.5;

const mesh = { upload: (n - 1) * streamMbps, download: (n - 1) * streamMbps };
const sfu = { upload: 1 * streamMbps, download: (n - 1) * streamMbps };
const sfuSimulcast = { upload: 1.5 + 0.5 + 0.15, download: 1.5 + (n - 2) * 0.15 }; // 1 speaker HD, rest thumbnails
const mcu = { upload: 1 * streamMbps, download: 1 * streamMbps }; // server mixes

console.table({ mesh, sfu, sfuSimulcast, mcu });`,
        },
        {
          title: 'Choosing a topology',
          lang: 'text',
          code: `2 people                     -> P2P (with TURN fallback)
3-4 people, no server budget -> Mesh
5-100 people, interactive    -> SFU (+ simulcast, active speaker)
Old devices / phone dial-in  -> MCU (or SFU + a mixing service)
1 -> thousands (webinar)     -> SFU for speakers + HLS/CDN for viewers`,
        },
      ],
      output: `\`console.table\` shows mesh needs **7.5 Mbps upload** per person — many home connections cannot do that, so the call stutters. SFU needs only **1.5 Mbps upload**, with 7.5 Mbps download. With simulcast, download drops to about **2.1 Mbps** because only the active speaker is HD. MCU is lightest for clients (1.5 up, 1.5 down) but the server must decode and re-encode six videos — expensive CPU.`,
      questions: [
        { q: 'Mesh vs SFU vs MCU?', a: 'Mesh connects everyone directly (no server, but upload grows with each participant). SFU receives each stream once and forwards it without decoding (scalable, most common). MCU decodes and mixes all streams into one (light clients, heavy server, more latency).' },
        { q: 'Which would you choose for a 10-person meeting app?', a: 'An SFU (like LiveKit, mediasoup or Janus) with simulcast and active-speaker selection, plus TURN for connectivity.' },
        { q: 'What is simulcast?', a: 'The sender encodes the same video at several qualities at once; the SFU forwards the right quality to each receiver depending on bandwidth and how the video is displayed.' },
        { q: 'How do you stream to 10,000 viewers?', a: 'Use an SFU for the few interactive speakers, then convert to HLS/DASH and serve through a CDN, or use a WebRTC CDN for low latency.' },
      ],
      spoken: `"For group calls there are three topologies. Mesh connects every participant to every other one, so there's no media server, but each person uploads their video N minus one times, which breaks down above three or four people. An SFU has each person upload once, and the server forwards streams without decoding — that's what most modern apps use, often with simulcast so the server can send lower quality thumbnails. An MCU decodes and mixes everyone into one stream, which is easy for clients but very expensive for the server. For a typical meeting app, I'd choose an SFU like LiveKit or mediasoup."`,
      mistakes: [
        'Building group video with mesh and testing only with 2-3 people on fast office Wi-Fi.',
        'Saying an SFU mixes video. It only forwards packets; mixing is what an MCU does.',
        'Ignoring download bandwidth: an SFU still sends N − 1 streams unless you use simulcast or last-N.',
        'Follow-up trap: "Is an SFU call end-to-end encrypted?" Not automatically — the SFU terminates DTLS and could see media. True E2EE needs Insertable Streams / SFrame on top.',
      ],
      takeaway: 'Mesh for tiny calls, SFU for almost everything (with simulcast), MCU only when clients must receive one mixed stream.',
    },
    {
      id: 'grpc-basics',
      title: 'gRPC Basics',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'gRPC is a fast RPC framework: you define services in .proto files, data is sent as compact binary Protobuf over HTTP/2, with streaming support.',
      what: `**gRPC** is a framework from Google for one service to call another service's function **as if it were local** — this is called **RPC** (Remote Procedure Call).

Key parts:
- **Protocol Buffers (Protobuf)** — you define messages and services in a \`.proto\` file. Data is sent as small, fast **binary**, not JSON.
- **Code generation** — tools generate typed client and server code from the \`.proto\` for many languages (Node, Go, Java, Python...).
- **HTTP/2** — gRPC runs over HTTP/2, so it gets multiplexing and streaming.

Four call types:
1. **Unary** — one request, one response (like REST).
2. **Server streaming** — one request, a stream of responses.
3. **Client streaming** — a stream of requests, one response.
4. **Bidirectional streaming** — both sides stream at the same time.

#### Deeper version
- **Strong contracts**: field numbers in Protobuf make it **backward compatible** — you can add new fields; never reuse or change a field number. Removed fields should be marked \`reserved\`.
- **Deadlines**: clients set a deadline; it propagates to downstream calls. Status codes are gRPC-specific: \`OK\`, \`NOT_FOUND\`, \`INVALID_ARGUMENT\`, \`UNAVAILABLE\`, \`DEADLINE_EXCEEDED\`, \`PERMISSION_DENIED\`, \`UNAUTHENTICATED\`...
- **Metadata** — like HTTP headers (auth tokens, trace ids).
- **Browsers**: browsers cannot speak native gRPC directly (no control over HTTP/2 frames/trailers). Use **gRPC-Web** through a proxy (Envoy), or **Connect** protocol, or keep REST/GraphQL at the edge.
- **Load balancing**: long-lived HTTP/2 connections mean a simple L4 load balancer sends all calls to one backend. Use L7 (Envoy, a service mesh) or client-side load balancing.
- **Debugging** is harder than JSON — use \`grpcurl\` and server reflection.
- Common use: **internal microservice-to-microservice** communication where speed and contracts matter.`,
      why: `JSON over REST is human-friendly but larger and slower to parse, and contracts are loose. Between internal services, gRPC gives smaller payloads, lower latency, generated typed clients and real streaming — fewer integration bugs and better performance.`,
      analogy: `REST with JSON is sending a handwritten letter anyone can read. gRPC is two departments using a pre-agreed **form with numbered boxes** (the .proto). Because both sides know the form, they can fill and read it very fast, and a phone line stays open (HTTP/2) for continuous conversation.`,
      code: [
        {
          title: 'The contract: orders.proto',
          lang: 'text',
          code: `syntax = "proto3";
package orders;

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);                 // unary
  rpc WatchOrders (WatchRequest) returns (stream OrderEvent);     // server streaming
}

message GetOrderRequest { string id = 1; }
message WatchRequest { string customer_id = 1; }

message Order {
  string id = 1;
  double total = 2;
  string status = 3;
  // field numbers are the wire contract: never change or reuse them
}

message OrderEvent { string order_id = 1; string status = 2; }`,
        },
        {
          title: 'Server and client in Node (@grpc/grpc-js)',
          lang: 'javascript',
          code: `import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const def = protoLoader.loadSync('orders.proto', { keepCase: true });
const { orders } = grpc.loadPackageDefinition(def);

// ---- Server ----
const server = new grpc.Server();
server.addService(orders.OrderService.service, {
  GetOrder(call, callback) {
    if (call.request.id !== '1') {
      return callback({ code: grpc.status.NOT_FOUND, message: 'order not found' });
    }
    callback(null, { id: '1', total: 499.5, status: 'paid' });
  },
  WatchOrders(call) {
    let n = 0;
    const t = setInterval(() => {
      call.write({ order_id: '1', status: ['packed', 'shipped', 'delivered'][n++] });
      if (n === 3) { clearInterval(t); call.end(); }
    }, 500);
  },
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  // ---- Client ----
  const client = new orders.OrderService('localhost:50051', grpc.credentials.createInsecure());
  const deadline = new Date(Date.now() + 2000); // always set a deadline
  client.GetOrder({ id: '1' }, { deadline }, (err, order) => console.log(err?.message ?? order));
  client.WatchOrders({ customer_id: 'c1' }).on('data', (e) => console.log('event', e.status));
});`,
        },
      ],
      output: `The client prints \`{ id: '1', total: 499.5, status: 'paid' }\` for the unary call, then the stream prints \`event packed\`, \`event shipped\`, \`event delivered\` half a second apart, and ends. Calling \`GetOrder({ id: '2' })\` would print \`5 NOT_FOUND: order not found\`. (Insecure credentials are only for local demos; production uses TLS or mTLS.)`,
      questions: [
        { q: 'What is gRPC?', a: 'A high-performance RPC framework that uses Protocol Buffers for binary serialization and HTTP/2 for transport, with generated typed clients and support for streaming.' },
        { q: 'Why is gRPC faster than REST with JSON?', a: 'Protobuf messages are compact binary and fast to encode/decode, and HTTP/2 multiplexes calls over long-lived connections with header compression.' },
        { q: 'Can a browser call gRPC directly?', a: 'Not native gRPC. You use gRPC-Web (with a proxy like Envoy) or the Connect protocol, or expose REST/GraphQL to browsers and use gRPC internally.' },
        { q: 'What are the four gRPC call types?', a: 'Unary, server streaming, client streaming and bidirectional streaming.' },
        { q: 'How do you evolve a Protobuf schema safely?', a: 'Add new fields with new numbers, never change or reuse existing field numbers or types, and mark removed fields as reserved.' },
      ],
      spoken: `"gRPC is an RPC framework where I define services and messages in a proto file, generate typed clients and servers, and send compact binary Protobuf over HTTP/2. It supports unary calls and three kinds of streaming. It's faster and more strongly typed than JSON REST, so it's great for internal microservice communication. The trade-offs are that browsers need gRPC-Web or a gateway, debugging binary payloads is harder, and long-lived HTTP/2 connections need L7 or client-side load balancing. I always set deadlines on calls and evolve schemas by adding fields, never reusing field numbers."`,
      mistakes: [
        'Changing or reusing a Protobuf field number — old and new services silently misread data.',
        'Not setting deadlines, so a slow downstream call hangs forever.',
        'Putting gRPC behind a plain L4 load balancer and seeing all traffic go to one pod.',
        'Follow-up trap: "Should you replace your public REST API with gRPC?" Usually not. Public and browser clients prefer REST/JSON; gRPC shines inside your system between services.',
      ],
      takeaway: 'gRPC = .proto contract + binary Protobuf + HTTP/2 streaming — great for internal services, awkward for browsers.',
    },
    {
      id: 'rest-graphql-grpc',
      title: 'Choosing REST vs GraphQL vs gRPC vs Real-time',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'REST for public CRUD and caching, GraphQL for flexible UI data needs, gRPC for fast internal services, WebSockets/SSE for live updates, webhooks for server-to-server events.',
      what: `There is no single best API style. Interviewers want to hear **trade-offs**.

- **REST** — resources + HTTP methods + JSON. Simple, works everywhere, great HTTP caching and tooling. Can over-fetch or need many calls for complex screens.
- **GraphQL** — one endpoint, client picks fields. Great when many clients (web, mobile) need different shapes of related data. Harder caching, query cost control and N+1 handling.
- **gRPC** — binary Protobuf over HTTP/2 with generated clients and streaming. Great for internal service-to-service calls. Not browser-native.
- **WebSockets / Socket.IO** — two-way real-time (chat, collaboration, games).
- **SSE** — one-way server push over HTTP (notifications, LLM streaming).
- **Webhooks** — event notifications to other servers (payments, integrations).
- **Message queues / events** (Kafka, SQS, RabbitMQ) — async communication between services; decoupled and resilient.

#### Deeper version
Questions to decide:
1. **Who is the client?** Browsers and third parties → REST (or GraphQL). Internal services → gRPC or events.
2. **Data shape?** Many related entities per screen and many client types → GraphQL. Simple CRUD → REST.
3. **Caching?** CDN-cacheable public data → REST with GET.
4. **Latency and throughput?** High-volume internal calls → gRPC.
5. **Direction of data?** Server push → SSE/WebSocket; server-to-server notifications → webhooks.
6. **Coupling?** Must the caller wait for the answer? If not, prefer async events/queues.

**Mixing is normal**: a typical system has a REST or GraphQL edge for the web app, gRPC or events between microservices, webhooks for partners, SSE for streaming AI responses, and Socket.IO for chat. Also consider the **team's skills** and the **tooling** already in place.

**tRPC** is another option for full-stack TypeScript monorepos (Next.js): end-to-end types without a schema file, but only for TypeScript clients you own.`,
      why: `System design and senior interviews often ask "why did you choose REST over GraphQL?" A clear, trade-off-based answer shows judgment, not just knowledge of one tool.`,
      analogy: `Ways to communicate in an office: **REST** is a formal email with standard subjects. **GraphQL** is a custom request form where you tick exactly what you need. **gRPC** is an internal hotline with a strict script between departments. **WebSocket** is an open video call. **SSE** is a live announcement speaker. **Webhooks** are courier notifications to other companies. **Queues** are the office mail tray — drop it in, it gets handled later.`,
      code: [
        {
          title: 'The same "get order with items" in three styles',
          lang: 'text',
          code: `REST
  GET /orders/42                 -> { id, status, customerId }
  GET /orders/42/items           -> [{ productId, qty }]
  (2 calls, cacheable, maybe extra fields)

GraphQL
  POST /graphql
  { order(id: 42) { status items { qty product { name } } } }
  (1 call, exact fields, harder to CDN-cache)

gRPC (internal)
  rpc GetOrder(GetOrderRequest) returns (Order);   // Order includes repeated Item
  (binary, typed, fast; not for browsers directly)`,
        },
        {
          title: 'A realistic mixed architecture',
          lang: 'text',
          code: `React/Next.js app --(REST or GraphQL over HTTPS)--> API gateway / BFF
API gateway --(gRPC)--> order-service, user-service
order-service --(event "order.paid" on SQS/Kafka)--> email-service, analytics
Stripe --(webhook, HMAC-signed)--> payments-service
payments-service --(Socket.IO / SSE)--> browser "Payment received!"
AI chat endpoint --(SSE stream)--> browser token-by-token`,
        },
      ],
      output: `The first block shows the trade-off on one use case: REST needs two simple, cacheable calls; GraphQL gets exactly the needed fields in one call; gRPC is the compact, typed internal version. The second block shows how a real MERN/microservice system mixes styles: each communication path uses the tool that fits its client, direction and latency needs.`,
      questions: [
        { q: 'When would you choose GraphQL over REST?', a: 'When several clients need different shapes of deeply related data, or screens need data from many resources in one round trip. For simple CRUD, public cacheable APIs or file handling, REST is usually simpler.' },
        { q: 'When would you choose gRPC?', a: 'For internal service-to-service calls where performance, strong contracts and streaming matter, and both sides are services you control.' },
        { q: 'Synchronous API call vs message queue?', a: 'Use a synchronous call when the caller needs the answer now. Use a queue/event when the work can happen later, to decouple services, absorb spikes and survive downstream outages.' },
        { q: 'Can you use several styles in one system?', a: 'Yes, and it is normal: REST or GraphQL at the edge, gRPC or events inside, webhooks for partners and SSE/WebSockets for real-time.' },
      ],
      spoken: `"I choose based on the client, data shape and direction. For public or browser-facing CRUD I default to REST, because it's simple and cacheable. If a frontend needs lots of related data in flexible shapes, especially across web and mobile, GraphQL is a good fit, with DataLoader and query limits. Between internal services where latency and contracts matter, I'd use gRPC, or events on a queue when the caller doesn't need to wait. For live updates I use SSE when it's one-way, like streaming LLM output, and Socket.IO for two-way chat. Webhooks cover server-to-server notifications. Mixing them is normal."`,
      mistakes: [
        'Choosing GraphQL or gRPC because it is trendy, not because the use case needs it.',
        'Making every inter-service call synchronous, creating long chains where one slow service breaks all.',
        'Answering "which is better?" with one tool and no trade-offs.',
        'Follow-up trap: "Is GraphQL always faster than REST because it is one request?" No. One GraphQL request can trigger many resolver queries; speed depends on resolvers, batching and caching, not on the number of HTTP calls alone.',
      ],
      takeaway: 'Pick by client, data shape, direction and coupling: REST at the edge, GraphQL for flexible UIs, gRPC/events inside, SSE/WebSockets for live data.',
    },
  ],
  rapidFire: [
    { q: 'What does REST stand for?', a: 'Representational State Transfer — an architectural style built on resources and HTTP methods.' },
    { q: 'What does stateless mean in REST?', a: 'Each request carries everything needed; the server keeps no session between requests.' },
    { q: 'Should URLs contain verbs?', a: 'No. Use nouns like `/orders`; the HTTP method is the verb.' },
    { q: 'Which HTTP methods are idempotent?', a: 'GET, HEAD, OPTIONS, PUT and DELETE. POST is not; PATCH is not guaranteed.' },
    { q: 'PUT vs PATCH?', a: 'PUT replaces the whole resource; PATCH changes only the fields sent.' },
    { q: 'Safe vs idempotent?', a: 'Safe means no change at all; idempotent means repeating gives the same server state.' },
    { q: 'Status code for a successful create?', a: '201 Created, ideally with a `Location` header.' },
    { q: '401 vs 403?', a: '401: not authenticated. 403: authenticated but not allowed.' },
    { q: 'When do you return 409?', a: 'When the request conflicts with current state, like a duplicate email or version mismatch.' },
    { q: 'When do you return 429?', a: 'When the client exceeded a rate limit; include `Retry-After`.' },
    { q: '502 vs 504?', a: '502: bad response from upstream. 504: upstream took too long.' },
    { q: 'What does 202 Accepted mean?', a: 'The request was accepted and will be processed later (async job).' },
    { q: 'Authentication vs authorization?', a: 'Authentication is who you are; authorization is what you may do.' },
    { q: 'What is BOLA/IDOR?', a: 'Accessing another user\'s object by changing an id because the API does not check ownership.' },
    { q: 'Offset vs cursor pagination?', a: 'Offset is simple with page numbers; cursor is fast and stable for large or changing data.' },
    { q: 'Why add _id to a pagination sort?', a: 'As a unique tie-breaker so items are not skipped or repeated.' },
    { q: 'Most common API versioning method?', a: 'URL path versioning, like `/api/v1`.' },
    { q: 'Is adding an optional field a breaking change?', a: 'No, as long as clients ignore unknown fields.' },
    { q: 'What are the three parts of a JWT?', a: 'Header, payload and signature, base64url-encoded and joined by dots.' },
    { q: 'Is a JWT payload encrypted?', a: 'No. It is only signed; anyone can read it.' },
    { q: 'HS256 vs RS256?', a: 'HS256 uses one shared secret; RS256 signs with a private key and verifies with a public key.' },
    { q: 'Typical access token lifetime?', a: 'About 5-15 minutes.' },
    { q: 'Where to store a refresh token in a browser?', a: 'In an HttpOnly, Secure, SameSite cookie, not localStorage.' },
    { q: 'What is refresh token rotation?', a: 'Each refresh returns a new refresh token and invalidates the old one; reuse of an old one revokes the family.' },
    { q: 'What does HttpOnly do?', a: 'Stops JavaScript from reading the cookie, protecting it from XSS theft.' },
    { q: 'SameSite=Lax in one line?', a: 'Cookie is sent on same-site requests and top-level GET navigations, not on cross-site POSTs or fetches.' },
    { q: 'Are Bearer header tokens vulnerable to CSRF?', a: 'No, browsers do not attach them automatically.' },
    { q: 'What triggers a CORS preflight?', a: 'Non-simple requests: methods like PUT/DELETE, custom headers like Authorization, or JSON content type.' },
    { q: 'Can you use `Access-Control-Allow-Origin: *` with cookies?', a: 'No. With credentials the origin must be exact.' },
    { q: 'Does CORS protect your API from curl?', a: 'No. CORS is enforced only by browsers.' },
    { q: 'What is an Idempotency-Key?', a: 'A client-generated unique id that lets the server run a POST once and replay the saved result on retries.' },
    { q: 'How do you verify a webhook?', a: 'Recompute the HMAC of the raw body with the shared secret and compare using a timing-safe compare.' },
    { q: 'Why timingSafeEqual?', a: 'A normal compare leaks timing that lets attackers guess the signature byte by byte.' },
    { q: 'Why respond quickly to webhooks?', a: 'Slow responses look like failures and trigger retries; queue the heavy work.' },
    { q: 'no-cache vs no-store?', a: '`no-cache` stores but revalidates every time; `no-store` never stores.' },
    { q: 'What does a 304 response contain?', a: 'No body — it tells the client to use its cached copy.' },
    { q: 'What is an ETag?', a: 'A fingerprint of a response version, used with If-None-Match for validation and If-Match for safe updates.' },
    { q: 'Main gain of HTTP/2?', a: 'Multiplexing many requests over one connection, plus header compression.' },
    { q: 'What does HTTP/3 run on?', a: 'QUIC, which runs over UDP and has TLS 1.3 built in.' },
    { q: 'What does the TLS handshake do?', a: 'Verifies the server certificate and agrees on a shared session key for encryption.' },
    { q: 'What is forward secrecy?', a: 'Ephemeral keys per session so a leaked private key cannot decrypt old traffic.' },
    { q: 'SSE vs WebSocket?', a: 'SSE is one-way server push over HTTP with auto-reconnect; WebSocket is two-way.' },
    { q: 'What status code upgrades to WebSocket?', a: '101 Switching Protocols.' },
    { q: 'Socket.IO rooms vs namespaces?', a: 'Namespaces are separate channels clients connect to; rooms are server-side groups for broadcasting.' },
    { q: 'Why the Socket.IO Redis adapter?', a: 'So broadcasts reach sockets connected to other server instances.' },
    { q: 'What is a Socket.IO ack?', a: 'A callback the receiver calls to confirm it got or processed a message.' },
    { q: 'Token bucket in one line?', a: 'Tokens refill at a steady rate up to a cap; each request takes one, allowing bursts.' },
    { q: 'Problem with fixed window rate limiting?', a: 'Bursts at window edges can double the allowed rate briefly.' },
    { q: 'API gateway vs load balancer?', a: 'A gateway routes to different services and adds auth/limits; a load balancer spreads traffic across copies of one service.' },
    { q: 'What is 207 Multi-Status used for?', a: 'Returning separate results for multiple operations, like a bulk request with partial failures.' },
    { q: 'Best way to upload a 1 GB file?', a: 'Presigned URL direct to S3/GCS, using multipart/resumable upload.' },
    { q: 'OAuth 2.0 vs OIDC?', a: 'OAuth is delegated authorization; OIDC adds authentication with an ID token.' },
    { q: 'Recommended OAuth flow for SPAs and mobile?', a: 'Authorization Code with PKCE.' },
    { q: 'OAuth flow for machine-to-machine?', a: 'Client Credentials.' },
    { q: 'What does PKCE protect against?', a: 'A stolen authorization code being redeemed by someone without the code verifier.' },
    { q: 'SAML vs OIDC format?', a: 'SAML uses signed XML assertions; OIDC uses JWT ID tokens.' },
    { q: 'What is the GraphQL N+1 problem?', a: 'A nested resolver running one query per list item.' },
    { q: 'What fixes N+1 in GraphQL?', a: 'DataLoader: batches keys per tick into one query and caches per request.' },
    { q: 'What does gRPC use for serialization and transport?', a: 'Protocol Buffers over HTTP/2.' },
    { q: 'STUN vs TURN?', a: 'STUN discovers your public address; TURN relays media when direct connection fails.' },
    { q: 'Which WebRTC topology do most group-call apps use?', a: 'SFU (Selective Forwarding Unit), usually with simulcast.' },
  ],
};
