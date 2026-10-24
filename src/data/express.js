// Express.js — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'express',
  title: 'Express.js',
  icon: '🚂',
  description: 'The small web framework on top of Node.js. Routing and middleware first, then errors, validation, auth and architecture, then security and production topics.',
  definitionTitle: 'What is Express.js?',
  definition: `**Express.js** is a small, popular **web framework for Node.js**. It makes building **web servers and REST APIs** simple. You define **routes** (like \`GET /users\`) and **middleware**, which are functions that run on every request for things like logging, authentication, parsing JSON and handling errors.

Plain Node can build a server too, but Express removes the boilerplate and gives a clean structure.

**One-line answer:** "Express is a minimal, unopinionated Node.js web framework for building APIs and web servers using routing and a middleware pipeline."`,
  topics: [
    {
      id: 'express-basics',
      title: 'What is Express? (Your first server)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A small, unopinionated web framework for Node.js that gives you routing and middleware on top of the built-in http module.',
      what: `**Express** (also called **Express.js**) is a **fast, minimal and flexible** back-end framework for building web servers and APIs, built **on top of Node.js**.

Node.js already has a built-in \`http\` module, but it is very low-level: you read the URL, parse the body and set headers yourself. Express does that work for you.

#### Key features

**1. Routing:** connects an HTTP method (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`) and a URL path to the function that should handle it.

\`\`\`javascript
app.get('/users', (req, res) => res.json(users));        // read
app.post('/users', (req, res) => res.status(201).json(req.body)); // create
app.delete('/users/:id', (req, res) => res.sendStatus(204));      // delete
\`\`\`

**2. Middleware:** functions that run **in between** the request arriving and the response going out. They handle jobs like logging, checking login (auth), reading the request body, and handling errors. Each one calls \`next()\` to pass the request on.

\`\`\`javascript
app.use(express.json()); // read JSON bodies

app.use((req, res, next) => {
  console.log(req.method, req.url); // log every request
  next();                           // pass it on
});
\`\`\`

**3. APIs and web apps:** the same framework is used for **REST APIs**, single-page apps, multi-page (server-rendered) apps and hybrids of both.

Express is also **unopinionated**: it does not force a folder structure, a database or a style. You decide.

#### Deeper version
\`express()\` returns an \`app\` object. This \`app\` is actually a plain function with the shape \`(req, res) => {}\`. That is why you can pass it to \`http.createServer(app)\` or \`https.createServer(options, app)\`. \`app.listen(port)\` is just a shortcut that does \`http.createServer(app).listen(port)\` and returns the Node \`http.Server\`.

Inside, Express keeps a **stack** of layers (middleware and routes). For each request it walks the stack top to bottom and runs every layer whose path and method match. This "walk the stack" idea explains almost every Express behavior.

Express 5 is the current major version (stable since late 2024). Express 4 is still everywhere in existing code. The core ideas are the same in both.`,
      why: `Writing a server with raw \`http\` means lots of repeated code: \`if (req.url === '/users' && req.method === 'GET')\`, manual JSON parsing, manual headers. Express removes this boilerplate. It is also the most popular Node framework, so it has a huge ecosystem of middleware (cors, helmet, multer, morgan) that you can plug in with one line. Many other frameworks (like NestJS by default) are built on top of it.`,
      analogy: `Raw Node \`http\` is like a restaurant with only a door: every customer walks straight into the kitchen. Express adds a reception desk (routing) that sends each customer to the right table, and a row of staff (middleware) who check the booking, take the coat, and hand over the menu before the chef (your handler) cooks.`,
      code: [
        {
          title: 'Raw Node http vs Express',
          lang: 'javascript',
          code: `// Raw Node: you do everything yourself
import http from 'node:http';

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'hi' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(3000);`,
        },
        {
          title: 'The same server with Express',
          lang: 'javascript',
          code: `import express from 'express';

const app = express();
app.use(express.json()); // parse JSON bodies

app.get('/hello', (req, res) => {
  res.json({ message: 'hi' }); // sets status 200 + JSON header for you
});

// Unknown routes get a 404 from Express automatically
const server = app.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});`,
        },
      ],
      output: `Both servers answer \`GET /hello\` with \`{"message":"hi"}\`. In the raw version we check the method and URL by hand, write headers by hand, and turn the object into a string by hand. In the Express version, \`app.get\` does the matching and \`res.json\` sets the status, the \`Content-Type\` header and the string conversion. Any other URL gets Express's default "Cannot GET /path" 404 page. \`app.listen\` returns the real Node server, which we keep in \`server\` so we can close it later.`,
      questions: [
        {
          q: "What is Express.js?",
          a: "A minimal, unopinionated web framework for Node.js. It adds routing, middleware and request/response helpers on top of Node's built-in `http` module.",
        },
        {
          q: "Why use Express instead of the plain http module?",
          a: "It removes boilerplate: easy routing, JSON parsing, helpers like `res.json()`, and a big middleware ecosystem. Plain `http` makes you parse URLs, bodies and headers by hand.",
        },
        {
          q: "What does unopinionated mean?",
          a: "Express does not force a structure, ORM, or template engine. You choose your folders, database and libraries. That is flexible but means the team must agree on conventions.",
        },
        {
          q: "What does app.listen() return?",
          a: "A Node `http.Server`. You need it for things like graceful shutdown (`server.close()`) or attaching WebSockets.",
        },
        {
          q: "Express vs NestJS vs Fastify?",
          a: "Express is minimal and flexible. NestJS is an opinionated framework with modules and dependency injection (it uses Express underneath by default). Fastify focuses on speed and built-in schema validation.",
        },
      ],
      spoken: `"Express is a minimal web framework for Node.js. Node's \`http\` module is very low-level, so Express adds three things on top: routing, so I can map a method and path to a handler; middleware, which is a chain of functions every request passes through; and helpers like \`res.json\` and \`req.params\`. It's unopinionated, so I decide the folder structure and libraries. Under the hood the app is just a request handler function, and \`app.listen\` creates a normal Node HTTP server with it. I've used it for REST APIs with MongoDB, auth and Stripe webhooks."`,
      mistakes: [
        "Calling Express a full framework like Django or Rails. It is minimal; you add validation, auth, ORM and structure yourself.",
        "Forgetting `express.json()` and then wondering why `req.body` is undefined.",
        "Follow-up trap: \"Is Express single-threaded?\" Express runs on Node's single main thread with the event loop. Heavy CPU work blocks every request, so offload it to worker threads or another service.",
        "Not keeping the `server` returned by `app.listen`, then having no clean way to close it on shutdown.",
      ],
      takeaway: 'Express = Node http + routing + middleware + helpers. Everything else you add yourself.',
    },
    {
      id: 'routing',
      title: 'Routing and express.Router',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Routing maps an HTTP method and a URL path to a handler. express.Router lets you split routes into small modules.',
      what: `**Routing** decides which function runs for a request. A route has three parts:

- An **HTTP method**: \`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`.
- A **path**: like \`/users/:id\`.
- A **handler**: \`(req, res) => { ... }\`.

Data can come in through the URL in two ways:
- **Route params**: \`/users/:id\` → \`req.params.id\`. Used to identify one thing.
- **Query string**: \`/users?page=2\` → \`req.query.page\`. Used for filters, sorting, paging.

\`express.Router()\` creates a mini app that only has routes and middleware. You mount it on a prefix with \`app.use('/api/users', usersRouter)\`.

#### Deeper version
Routes are checked **in the order you register them**. The first match that sends a response wins. So \`/users/me\` must come before \`/users/:id\`, otherwise \`:id\` would catch \`"me"\`.

\`app.route('/books')\` lets you chain \`.get().post()\` for the same path. \`router.param('id', fn)\` runs a function whenever a route has \`:id\` (useful to load a record once).

Path syntax changed in **Express 5**: a bare \`*\` wildcard must now have a name, like \`/files/*splat\`, and optional parts use braces, like \`/:file{.:ext}\`. Regex characters inside path strings are no longer supported. If you upgrade from Express 4, check every wildcard route.

All values in \`req.params\` and \`req.query\` are **strings** (or arrays/objects for query), never numbers. Convert and validate them.`,
      why: `Without routing you would have one giant function full of \`if\` checks. Routers let you split a big API into feature files (\`users.routes.js\`, \`orders.routes.js\`), give each group its own middleware (for example, auth only on \`/admin\`), and version your API (\`/api/v1\`, \`/api/v2\`) cleanly.`,
      analogy: `Routing is like the floor guide in a shopping mall. "Shoes → floor 2, shop 14." The method + path is the shop name, and the handler is the shop. \`express.Router\` is a whole floor: you can put a security guard (middleware) at the floor entrance without guarding every shop.`,
      code: [
        {
          title: 'Params, query and order',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

// Specific route first, otherwise :id would match "me"
app.get('/users/me', (req, res) => res.json({ id: 'current-user' }));

// GET /users/42
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id); // params are always strings
  res.json({ id, type: typeof req.params.id }); // { id: 42, type: "string" }
});

// GET /products?category=shoes&page=2
app.get('/products', (req, res) => {
  const { category = 'all', page = '1' } = req.query;
  res.json({ category, page: Number(page) });
});

app.listen(3000);`,
        },
        {
          title: 'A feature router mounted on a prefix',
          lang: 'javascript',
          code: `// routes/users.routes.js
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json([{ id: 1 }]));      // GET  /api/users
router.post('/', (req, res) => res.status(201).json(req.body)); // POST /api/users
router
  .route('/:id')
  .get((req, res) => res.json({ id: req.params.id }))     // GET    /api/users/7
  .delete((req, res) => res.sendStatus(204));             // DELETE /api/users/7

export default router;

// app.js
// import usersRouter from './routes/users.routes.js';
// app.use(express.json());
// app.use('/api/users', usersRouter);`,
        },
      ],
      output: `\`GET /users/me\` returns \`{"id":"current-user"}\` because that route is registered first. \`GET /users/42\` returns \`{"id":42,"type":"string"}\` — the param arrived as a string and we converted it. \`GET /products?category=shoes&page=2\` returns \`{"category":"shoes","page":2}\`.

In the router example, the router's paths are relative. Mounted at \`/api/users\`, \`router.get('/')\` answers \`GET /api/users\` and \`.route('/:id')\` answers \`/api/users/7\`. \`sendStatus(204)\` sends "No Content" with an empty body.`,
      questions: [
        {
          q: "What is the difference between req.params and req.query?",
          a: "`req.params` holds named parts of the path, like `:id` in `/users/:id`. `req.query` holds the query string after `?`. Use params to identify a resource and query for filters, sorting and pagination.",
        },
        {
          q: "Why use express.Router?",
          a: "To split routes into modules by feature, mount them on a prefix, and attach middleware to just that group (for example auth on `/admin`). It keeps app.js small.",
        },
        {
          q: "Does route order matter?",
          a: "Yes. Express checks routes in the order they are registered and the first one that responds wins. Put specific paths like `/users/me` before dynamic ones like `/users/:id`, and the 404 handler last.",
        },
        {
          q: "What is the difference between PUT and PATCH?",
          a: "PUT replaces the whole resource with the body you send. PATCH updates only the fields you send. PUT should be idempotent: sending it twice gives the same result.",
        },
        {
          q: "What changed in route paths in Express 5?",
          a: "Wildcards must be named (`/*splat` instead of `*`), optional parts use braces like `{/:id}`, and regex characters inside path strings are no longer supported. It comes from a newer `path-to-regexp` version.",
        },
      ],
      spoken: `"Routing in Express maps an HTTP method and a path to a handler. Dynamic parts like \`:id\` show up in \`req.params\`, and the query string shows up in \`req.query\` — both are strings, so I convert and validate them. For bigger apps I create one \`express.Router\` per feature, like users or orders, and mount it with \`app.use('/api/users', router)\`. That lets me add middleware like auth to just one group. Order matters: Express takes the first matching route, so specific routes go before dynamic ones. In Express 5 the wildcard syntax also changed, so that's something I check when upgrading."`,
      mistakes: [
        "Putting `/users/:id` before `/users/me`, so `me` is treated as an id.",
        "Treating `req.params.id` or `req.query.page` as a number. They are strings; `'2' + 1` gives `'21'`.",
        "Using a bare `*` wildcard in Express 5. It throws at startup; you need a named wildcard like `/*splat`.",
        "Follow-up trap: \"What is the difference between app.use('/api', fn) and app.get('/api', fn)?\" `app.use` matches any method and any path that **starts with** `/api`. `app.get` matches only GET and only the exact path.",
      ],
      takeaway: 'Method + path → handler; split by feature with Router; specific routes first; params are always strings.',
    },
    {
      id: 'req-res-objects',
      title: 'The req and res objects (status codes and responses)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'req is everything the client sent; res is how you answer. Send exactly one response per request with the right status code.',
      what: `Every handler gets two objects:

- **\`req\` (request)**: what the client sent. \`req.params\`, \`req.query\`, \`req.body\`, \`req.headers\`, \`req.method\`, \`req.path\`, \`req.ip\`, \`req.cookies\` (with cookie-parser).
- **\`res\` (response)**: how you reply. \`res.status(201)\`, \`res.json(data)\`, \`res.send(text)\`, \`res.sendStatus(204)\`, \`res.redirect(url)\`, \`res.set(header, value)\`, \`res.cookie()\`, \`res.download()\`.

The golden rule: **one request, one response.** If you never respond, the client waits until it times out. If you respond twice, Express throws \`ERR_HTTP_HEADERS_SENT\`.

#### Deeper version
\`req\` and \`res\` are Node's own \`IncomingMessage\` and \`ServerResponse\` objects with extra methods added by Express. So \`req\` is also a readable stream and \`res\` is a writable stream. That is why you can do \`fileStream.pipe(res)\` for big files.

\`res.json(obj)\` sets \`Content-Type: application/json\` and calls \`JSON.stringify\`. \`res.send()\` guesses the type: a string becomes HTML, an object becomes JSON, a Buffer becomes binary. \`res.end()\` is the raw Node method with no helpers.

\`res.locals\` is an object that lives for one request. Middleware can put things there (like the logged-in user) for later handlers. Many teams use \`req.user\` instead; both work.`,
      why: `Correct status codes and response shapes are the "contract" of your API. Front-end code, mobile apps and monitoring tools all depend on them. A \`200\` with \`{ error: '...' }\` inside breaks error handling on the client. Knowing what lives on \`req\` also tells you where untrusted input comes from, which matters for security.`,
      analogy: `\`req\` is the order slip a waiter brings to the kitchen: table number (params), special requests (query), and the full order (body). \`res\` is the plate you send back. You must send exactly one plate per slip: zero plates makes the customer wait forever, two plates confuses everyone.`,
      code: [
        {
          title: 'Reading the request and choosing a status',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();
app.use(express.json());

const tasks = [{ id: 1, title: 'Learn Express' }];

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' }); // return stops the function
  }
  const task = { id: tasks.length + 1, title };
  tasks.push(task);
  res.status(201).location(\`/tasks/\${task.id}\`).json(task); // 201 Created
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task); // 200 by default
});

app.listen(3000);`,
        },
        {
          title: 'The double-response bug',
          lang: 'javascript',
          code: `app.get('/bad', (req, res) => {
  if (!req.query.q) {
    res.status(400).json({ error: 'q missing' }); // no "return" here!
  }
  res.json({ ok: true }); // runs too -> Error [ERR_HTTP_HEADERS_SENT]
});`,
        },
      ],
      output: `\`POST /tasks\` with \`{"title":"Buy milk"}\` returns status \`201\`, a \`Location: /tasks/2\` header and the new task. Without a title it returns \`400\` with an error message, and \`return\` stops the rest of the function. \`GET /tasks/99\` returns \`404\`.

In the bad example, when \`q\` is missing the handler sends a 400 and then keeps running and tries to send again. Node throws "Cannot set headers after they are sent to the client". The fix is \`return res.status(400)...\`.`,
      questions: [
        {
          q: "What is the difference between res.send, res.json and res.end?",
          a: "`res.json` always sends JSON with the right header. `res.send` guesses the type from what you pass. `res.end` is Node's raw method that just ends the response with no helpers.",
        },
        {
          q: "What causes 'Cannot set headers after they are sent'?",
          a: "Sending two responses for one request. Usually a missing `return` before an early `res.status(...).json(...)`, or calling `next()` after responding.",
        },
        {
          q: "Which status codes should a REST API use?",
          a: "200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (logged in but not allowed), 404 Not Found, 409 Conflict, 422 validation failed (some teams use 400), 429 Too Many Requests, 500 server error.",
        },
        {
          q: "What is res.locals?",
          a: "An object scoped to one request/response cycle. Middleware can store values there (like the current user) for later middleware, handlers or templates.",
        },
      ],
      spoken: `"\`req\` holds everything the client sent — params, query, body, headers, cookies — and \`res\` is how I answer, with helpers like \`res.status\`, \`res.json\` and \`res.redirect\`. They're actually Node's request and response streams with extra methods, so I can pipe a file into \`res\`. The main rule is exactly one response per request. If I forget to respond, the request hangs; if I respond twice, I get 'headers already sent'. So I always \`return\` on early exits. I also care about status codes: 201 for create, 204 for delete, 401 versus 403, and 422 or 400 for validation errors."`,
      mistakes: [
        "Forgetting `return` before an early response, then sending a second response.",
        "Returning `200` with an error in the body. Clients and monitoring tools rely on the status code.",
        "Mixing up 401 and 403. 401 means \"who are you?\" (not authenticated); 403 means \"I know you, but no\" (not authorized).",
        "Follow-up trap: \"Is req.body safe to use directly?\" No. It is untrusted user input. Validate it and pick only the fields you expect before saving.",
      ],
      takeaway: 'req = what came in (untrusted), res = what goes out; one response per request, with an honest status code.',
    },
    {
      id: 'middleware',
      title: 'Middleware',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Functions (req, res, next) that run in order for each request. They can change req/res, end the request, or pass control with next().',
      what: `**Middleware** is a function that runs **in the middle** of a request: after the request arrives, and before the final route handler sends the response.

Every middleware gets three things:
- \`req\`: the **request** (what the user sent).
- \`res\`: the **response** (what you send back).
- \`next\`: a function that **passes control** to the next middleware or route.

\`\`\`javascript
// A logger middleware
const logger = (req, res, next) => {
  console.log(req.method, req.url); // e.g. GET /users
  next();                           // hand over to the next function
};

app.use(logger); // runs for every request

app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Asha' }]); // final route handler
});

// Request flow: request → logger → GET /users handler → response
\`\`\`

Express runs middleware **in the order you add it**. Each one can:

1. Run any code (log, measure time).
2. Change \`req\` or \`res\` (add \`req.user\`).
3. **End** the request by sending a response (e.g. 401).
4. Call \`next()\` to pass control to the next function.

If a middleware neither responds nor calls \`next()\`, the request **hangs**.

Kinds of middleware:
- **Application-level**: \`app.use(fn)\` — runs for every request.
- **Router-level**: \`router.use(fn)\` — runs for that router only.
- **Route-level**: \`app.get('/admin', auth, handler)\` — runs for one route.
- **Built-in**: \`express.json()\`, \`express.urlencoded()\`, \`express.static()\`.
- **Third-party**: \`cors\`, \`helmet\`, \`morgan\`, \`multer\`.
- **Error-handling**: four arguments \`(err, req, res, next)\`.

#### Deeper version
Route handlers are also middleware — they are just the last link in the chain. Express keeps one stack, and \`next()\` means "find the next layer that matches this method and path".

Special forms of \`next\`:
- \`next()\` → go to the next matching layer.
- \`next(err)\` → skip all normal middleware and jump to the error handlers.
- \`next('route')\` → skip the rest of this route's handlers and go to the next matching route (only for \`app.METHOD\`/\`router.METHOD\`).
- \`next('router')\` → leave this router entirely.

Code written **after** \`next()\` runs as soon as \`next()\` returns. That happens when the rest of the chain finishes its **synchronous** part — not when the response is sent. Express does not await the rest of the chain, so to run code "after the response" use \`res.on('finish', ...)\`.

Middleware is usually written as a **factory** — a function that takes options and returns the middleware (like \`cors(options)\` or \`requireRole('admin')\`). This is a closure.`,
      why: `Many things must happen on every request: parse the body, log it, check auth, add security headers, limit the rate. Writing this inside every route would repeat code everywhere. Middleware lets you write each concern once and plug it in where needed. It is the core idea of Express.`,
      analogy: `Middleware is an airport security line. First the ticket check, then the ID check, then the bag scanner, then the gate. Each person can let you go on (\`next()\`), stop you (send a response), or add a sticker to your bag (change \`req\`). The plane (your route handler) is just the last step.`,
      code: [
        {
          title: 'Logger, auth and a middleware factory',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

// 1. Application-level: runs for every request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {           // runs after the response is sent
    console.log(\`\${req.method} \${req.originalUrl} \${res.statusCode} \${Date.now() - start}ms\`);
  });
  next();                            // pass control on
});

// 2. Auth middleware: adds req.user or stops the request
function auth(req, res, next) {
  const token = req.get('Authorization');
  if (token !== 'Bearer secret') {
    return res.status(401).json({ error: 'Unauthorized' }); // ends the chain
  }
  req.user = { id: 1, role: 'admin' };
  next();
}

// 3. Factory: returns a configured middleware (a closure)
const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).json({ error: 'Forbidden' });

app.get('/public', (req, res) => res.send('anyone'));
app.get('/admin', auth, requireRole('admin'), (req, res) => {
  res.json({ hello: req.user.id });  // route-level middleware ran first
});

app.listen(3000);`,
        },
      ],
      output: `Every request is logged after it finishes, for example \`GET /admin 401 2ms\`.

- \`GET /public\` → the logger calls \`next()\`, the handler sends "anyone".
- \`GET /admin\` without the header → \`auth\` sends 401 and never calls \`next()\`, so \`requireRole\` and the handler never run.
- \`GET /admin\` with \`Authorization: Bearer secret\` → \`auth\` sets \`req.user\`, \`requireRole('admin')\` passes, and the handler returns \`{"hello":1}\`.`,
      questions: [
        {
          q: "What is middleware in Express?",
          a: "A function `(req, res, next)` that runs during the request. It can modify req/res, end the request, or call `next()` to pass control. Express runs middleware in the order it was added.",
        },
        {
          q: "What happens if you forget to call next()?",
          a: "If the middleware also does not send a response, the request hangs until the client or server times out.",
        },
        {
          q: "What is the difference between next(), next(err) and next('route')?",
          a: "`next()` goes to the next matching layer. `next(err)` skips to error-handling middleware. `next('route')` skips the remaining handlers of the current route and moves to the next matching route.",
        },
        {
          q: "Does middleware order matter?",
          a: "Yes, a lot. `express.json()` must come before routes that read `req.body`, `cors` before the routes, auth before protected routes, and the 404 and error handlers at the very end.",
        },
        {
          q: "How do you write configurable middleware?",
          a: "Use a factory: a function that takes options and returns `(req, res, next) => {}`. For example `requireRole('admin')`. The inner function remembers the options through a closure.",
        },
      ],
      spoken: `"Middleware is a function with \`req\`, \`res\` and \`next\` that runs as part of a chain for each request. Express runs them in the order I register them. Each one can change the request, end it by sending a response, or call \`next\` to continue. If it does neither, the request hangs. I use app-level middleware for things like body parsing, helmet, CORS and logging, and route-level middleware for auth and role checks. Calling \`next\` with an error jumps to the error handlers. For configurable ones I write a factory, like \`requireRole('admin')\`, which returns the actual middleware."`,
      mistakes: [
        "Forgetting to call `next()` (or send a response), so the request hangs.",
        "Calling `next()` after already sending a response, which can trigger a second response further down.",
        "Registering `express.json()` or `cors()` after the routes that need them. Order is everything.",
        "Follow-up trap: \"Does code after next() run after the response is sent?\" Not reliably. Express does not await the rest of the chain. Use `res.on('finish')` for after-response work.",
      ],
      takeaway: 'Middleware is an ordered chain of (req, res, next) functions; each one must either respond or call next().',
    },
    {
      id: 'body-parsers',
      title: 'Body parsers (express.json, urlencoded, raw)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Request bodies arrive as a stream of bytes. Body-parser middleware reads them and fills req.body based on the Content-Type.',
      what: `**Body parsers** are built-in Express middleware. They catch the incoming request, **read its body** (the data the client sent), and put the result on \`req.body\`. **Without them, \`req.body\` is \`undefined\`.**

#### 1. express.json(options)
For **JSON** bodies (\`Content-Type: application/json\`).
- \`limit\`: the **maximum body size**, e.g. \`'1mb'\`. Bigger bodies are rejected.
- \`strict\`: \`true\` by default. Only accepts **objects and arrays**, and rejects a plain top-level value like a raw string or number.

\`\`\`javascript
app.use(express.json({ limit: '500kb' }));
\`\`\`

#### 2. express.urlencoded(options)
For **HTML form** posts (\`name=Asha&city=Kochi\`).
- \`extended\`: picks which library reads the form string.
  - \`false\`: uses Node's built-in \`querystring\`. **No nested objects.**
  - \`true\` (recommended): uses the \`qs\` library, so nested objects like \`user[name]=Asha\` work.

\`\`\`javascript
app.use(express.urlencoded({ extended: true }));
\`\`\`

#### 3. express.raw(options)
Gives you the body **as-is**, as a \`Buffer\` (raw bytes), without parsing it.
- \`type\`: which \`Content-Type\` it should catch. Default is \`application/octet-stream\`.

\`\`\`javascript
// Intercept text/csv and expose the unparsed buffer directly
app.use(express.raw({ type: 'text/csv' }));
\`\`\`

There is also \`express.text()\`, which gives you the body as a plain string. File uploads (\`multipart/form-data\`) are **not** handled by any of these. Use \`multer\` for that.

#### Deeper version
Each parser checks the request's \`Content-Type\`. If it does not match, the parser just calls \`next()\` and leaves \`req.body\` alone. That is why a client that forgets the \`Content-Type: application/json\` header gets an empty body.

Important options:
- \`limit\`: max body size. Default is \`100kb\`. Larger bodies get a **413 Payload Too Large** error. Keep it small to protect memory.
- \`type\`: which content types to parse.
- \`verify\`: a hook that sees the raw bytes before parsing.

Invalid JSON produces a **400** error with \`err.type === 'entity.parse.failed'\` that goes to your error handler.

In Express 5, \`req.body\` is \`undefined\` when no parser ran (in Express 4 it was usually \`{}\`). Also \`extended\` for \`urlencoded\` defaults to \`false\` in Express 5. \`extended: true\` uses the \`qs\` library, which allows nested objects like \`user[name]=x\`.

**Stripe webhook trick:** signature checking needs the exact raw bytes. If \`express.json()\` runs first, the raw body is gone. So mount \`express.raw()\` on the webhook route **before** the global \`express.json()\`.`,
      why: `Without a parser you would have to collect stream chunks, join them, and \`JSON.parse\` them yourself in every route. Parsers do this once, safely, with size limits that protect your server from huge payloads that could eat all the memory.`,
      analogy: `A body parser is a translator at the door. If the letter is in JSON, the JSON translator reads it and puts a clean summary in \`req.body\`. If the letter is in a language no translator speaks (wrong Content-Type), it goes through untranslated and \`req.body\` stays empty.`,
      code: [
        {
          title: 'Common setup with a size limit',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

app.use(express.json({ limit: '1mb' }));                 // JSON APIs
app.use(express.urlencoded({ extended: false, limit: '1mb' })); // HTML forms

app.post('/echo', (req, res) => {
  res.json({ youSent: req.body });
});

// Invalid JSON or too-large body ends up here
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Body too large' });
  next(err);
});

app.listen(3000);`,
        },
        {
          title: 'Stripe webhook needs the raw body',
          lang: 'javascript',
          code: `import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// 1. Webhook route FIRST, with raw body (a Buffer)
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.get('stripe-signature');
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Verified event:', event.type);
    res.sendStatus(200);
  } catch (err) {
    res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
});

// 2. JSON parser for everything else
app.use(express.json());`,
        },
      ],
      output: `\`POST /echo\` with header \`Content-Type: application/json\` and body \`{"a":1}\` returns \`{"youSent":{"a":1}}\`. The same request **without** the header returns \`{}\` in Express 4 (and an undefined body in Express 5), because the JSON parser skipped it. A broken body like \`{a:1}\` returns 400 "Invalid JSON". A 2 MB body returns 413.

In the Stripe example, the webhook route gets \`req.body\` as a raw \`Buffer\`, so \`constructEvent\` can check the signature against the exact bytes Stripe signed. All other routes still get parsed JSON.`,
      questions: [
        {
          q: "Why is req.body undefined or empty?",
          a: "Either no body parser is registered, it is registered after the route, or the client did not send the matching `Content-Type` header (for example `application/json`).",
        },
        {
          q: "Do you still need the body-parser package?",
          a: "Usually no. Since Express 4.16, `express.json()` and `express.urlencoded()` are built in (they use body-parser internally).",
        },
        {
          q: "What is the default body size limit and why does it matter?",
          a: "`100kb`. A limit stops attackers from sending huge bodies that use up memory. Raise it only on routes that really need it.",
        },
        {
          q: "How do you handle Stripe webhooks with Express?",
          a: "Use `express.raw({ type: 'application/json' })` on the webhook route, registered before the global `express.json()`, so the signature can be checked against the raw bytes.",
        },
        {
          q: "What does extended mean in express.urlencoded?",
          a: "`extended: true` uses the `qs` library and supports nested objects and arrays. `false` uses the simpler `querystring` style. Express 5 defaults to `false`.",
        },
      ],
      spoken: `"The request body arrives as a stream, so Express needs a body parser to fill \`req.body\`. I use the built-in \`express.json()\` for JSON APIs and \`express.urlencoded()\` for forms; the separate body-parser package isn't needed anymore. The parser only runs when the Content-Type matches, which is a common reason for an empty body. I set a size limit — the default is 100kb — to protect memory. One real case I've handled is Stripe webhooks: signature verification needs the raw bytes, so I mount \`express.raw()\` on the webhook route before the global JSON parser. File uploads need multer instead."`,
      mistakes: [
        "Registering `express.json()` globally before the Stripe webhook route, which breaks signature verification.",
        "Setting `limit: '50mb'` globally just because one route uploads big data. Raise limits per route.",
        "Expecting `express.json()` to handle file uploads. Multipart data needs multer or busboy.",
        "Follow-up trap: \"The client sends JSON but req.body is empty — why?\" Most often a missing or wrong `Content-Type` header, so the JSON parser skipped the request.",
      ],
      takeaway: 'No parser, no req.body: use express.json() with a sensible limit, and raw bodies for signed webhooks.',
    },
    {
      id: 'static-files',
      title: 'Serving static files (express.static)',
      level: 'basic',
      priority: 'good',
      frequency: 'occasional',
      summary: 'express.static serves files like images, CSS and a built React app straight from a folder, with caching headers.',
      what: `**Static files** are files that do not change per request: images, CSS, JavaScript bundles, fonts, a built React app.

\`express.static('public')\` is built-in middleware. When a request comes for \`/logo.png\`, it looks for \`public/logo.png\`. If the file exists, it sends it. If not, it calls \`next()\` so your other routes can try.

You can add a **prefix**: \`app.use('/assets', express.static('public'))\` → \`/assets/logo.png\`.

#### Deeper version
\`express.static\` uses the \`serve-static\` package. It sets \`ETag\` and \`Last-Modified\` headers, so browsers can ask "has this changed?" and get a cheap **304 Not Modified**. You can set \`maxAge\` (cache time) and \`immutable\` for hashed file names like \`main.4f3a.js\`.

It also blocks path tricks like \`/../../etc/passwd\` (path traversal), and by default ignores dotfiles such as \`.env\`.

Use an **absolute path** built from the file location, because a relative path is resolved from the folder where you started Node, not from your file.

For a **single-page app** (React with client-side routing), serve the build folder and add a fallback that sends \`index.html\` for unknown non-API GET routes.

In real production, a **CDN** or **Nginx** usually serves static files. They are faster and take load off Node.`,
      why: `Sometimes you want one server to host both the API and the front-end, or to serve uploaded images. \`express.static\` does it safely in one line, with proper caching and protection against path traversal.`,
      analogy: `\`express.static\` is a self-service shelf at the front of a shop. If the customer wants something that is already on the shelf (a file), they take it without bothering the staff. If it is not on the shelf, they go to the counter (your routes).`,
      code: [
        {
          title: 'Serve a built React app plus an API',
          lang: 'javascript',
          code: `import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Hashed assets can be cached for a long time
app.use(express.static(path.join(__dirname, 'client/dist'), {
  maxAge: '1y',
  immutable: true,
  index: false,
}));

// SPA fallback: any other GET that is not /api gets index.html
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
  res.set('Cache-Control', 'no-cache'); // index.html must stay fresh
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(3000);`,
        },
      ],
      output: `\`GET /api/health\` returns JSON. \`GET /assets/main.4f3a.js\` is found in \`client/dist\` and sent with a one-year cache header. \`GET /dashboard\` is not a real file, so the fallback sends \`index.html\`, and React Router shows the dashboard page. \`index.html\` itself gets \`no-cache\` so users always get the newest bundle names after a deploy.`,
      questions: [
        {
          q: "How do you serve static files in Express?",
          a: "Use the built-in `express.static(folder)` middleware, optionally with a prefix: `app.use('/static', express.static('public'))`.",
        },
        {
          q: "How do you serve a React SPA from Express?",
          a: "Serve the build folder with `express.static`, then add a catch-all GET handler (after API routes) that sends `index.html`, so client-side routes work on refresh.",
        },
        {
          q: "Should Node serve static files in production?",
          a: "It can, but a CDN or Nginx is usually better. They are faster at serving files and keep Node free for API work.",
        },
      ],
      spoken: `"Express has built-in \`express.static\` middleware that serves files from a folder. If the file exists it sends it with ETag and caching headers; if not, it calls next so my routes can handle it. I always use an absolute path built from the file location. For a React SPA I serve the dist folder with a long cache on hashed assets, and add a fallback that returns index.html for non-API GET routes, with no-cache on index.html. In production I'd usually put static assets on a CDN like CloudFront and keep Node for the API."`,
      mistakes: [
        "Using a relative path like `'public'` and getting 404s when Node is started from another folder.",
        "Putting the SPA catch-all before the API routes, so API calls return HTML.",
        "Caching `index.html` for a year, so users keep loading old bundle names after a deploy.",
        "Follow-up trap: \"Can someone read ../.env through express.static?\" No, serve-static blocks path traversal and ignores dotfiles by default — but never put secrets inside the static folder anyway.",
      ],
      takeaway: 'express.static serves a folder safely with caching; in production prefer a CDN for heavy static traffic.',
    },
    {
      id: 'request-lifecycle',
      title: 'The request lifecycle in Express',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A request enters Node, walks the Express stack top to bottom through matching middleware and routes, and ends when one of them sends a response.',
      what: `The **request lifecycle** is the journey of one request from the moment it reaches your server until the response is sent.

Simple steps:
1. The client sends an HTTP request. Node's \`http\` server receives it and calls your Express \`app\`.
2. Express walks its **stack** from top to bottom, in the order you called \`app.use\` / \`app.get\`.
3. Each layer whose **path and method match** runs. Global middleware first (helmet, cors, json, logger), then routers, then the route handler.
4. Some function sends the response (\`res.json\`). The lifecycle is finished.
5. If nothing matched, your **404 handler** at the end runs.
6. If anything called \`next(err)\` (or threw), Express skips to the **error handlers** at the end.

#### Deeper version
Inside Express, every \`app.use\` or \`app.get\` call adds a **Layer** with a path matcher. A route layer holds its own small stack of handlers for each method. \`next()\` is the function that moves the pointer to the next matching layer.

Useful details:
- \`app.use('/api', fn)\` matches \`/api\` and anything under it, and inside \`fn\`, \`req.url\` is shortened (the \`/api\` part is removed). \`req.originalUrl\` keeps the full URL and \`req.baseUrl\` holds the mount path.
- When there is an error, Express only runs layers with **four** arguments \`(err, req, res, next)\`, and skips normal ones.
- After the response is sent, the \`res\` emits \`finish\`. If the client disconnects early, \`res\` emits \`close\` without finish. Logging tools like morgan use these events.
- The **event loop** is shared. While one request awaits the database, Node handles other requests. But a slow synchronous loop blocks every request in the lifecycle of every user.`,
      why: `Most Express bugs are lifecycle bugs: body is empty because the parser is registered too late, CORS fails because cors runs after an auth check, errors are not caught because the error handler is not last, or requests hang because a middleware forgot \`next()\`. If you can draw the lifecycle, you can debug all of them.`,
      analogy: `It is like a parcel on a conveyor belt in a sorting center. The belt has stations in a fixed order: scanning, weighing, labeling, then the right delivery van. Each station checks "is this parcel for me?" A station can pass it on, or take it off the belt and deliver it. A damaged parcel (an error) goes on a special belt straight to the repair desk at the end.`,
      code: [
        {
          title: 'A typical, correctly ordered app',
          lang: 'javascript',
          code: `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// 1. Security + infrastructure (runs for every request)
app.use(helmet());
app.use(cors({ origin: 'https://app.example.com' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// 2. Routes (only matching ones run)
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/boom', () => { throw new Error('Something broke'); });

// 3. 404: nothing above sent a response
app.use((req, res) => {
  res.status(404).json({ error: \`No route for \${req.method} \${req.originalUrl}\` });
});

// 4. Error handler: four arguments, always last
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

app.listen(3000);`,
        },
      ],
      output: `- \`GET /api/health\` → helmet adds headers, cors adds CORS headers, morgan prepares a log line, json parser skips (no body), the health route responds \`{"ok":true}\`. Morgan prints the log when the response finishes.
- \`GET /api/nope\` → no route matches, so the 404 handler responds with "No route for GET /api/nope".
- \`GET /api/boom\` → the handler throws. Express catches the sync error, skips the 404 handler (it has only two arguments), and runs the error handler, which returns 500.`,
      questions: [
        {
          q: "Walk me through what happens when a request hits an Express server.",
          a: "Node's http server receives it and calls the app. Express runs every matching middleware and route in registration order. One of them sends the response. If none match, the 404 handler runs. If an error is passed or thrown, Express jumps to the four-argument error handlers.",
        },
        {
          q: "Why must the error handler be registered last?",
          a: "Express only reaches it by moving forward through the stack. An error handler registered before the routes can never receive errors from those routes.",
        },
        {
          q: "What is the difference between req.url, req.originalUrl and req.baseUrl?",
          a: "Inside a mounted router, `req.url` has the mount path removed. `req.originalUrl` is the full original URL. `req.baseUrl` is the path the router was mounted on.",
        },
        {
          q: "Where do you put the 404 handler?",
          a: "After all routes and before the error handler, as a normal middleware with no path: `app.use((req, res) => res.status(404)...)`.",
        },
      ],
      spoken: `"When a request comes in, Node's HTTP server hands it to the Express app, which walks its stack of middleware and routes in the exact order I registered them. Every layer that matches the path and method runs. Usually that's security headers, CORS, logging and body parsing first, then the routers, then the handler that sends the response. If nothing matches, a 404 middleware at the end catches it. If anything calls \`next\` with an error or throws, Express skips normal middleware and goes to the four-argument error handler, which I always register last. Most Express bugs I've debugged were really ordering problems in this chain."`,
      mistakes: [
        "Registering the error handler before the routes, so it never sees their errors.",
        "Putting the 404 handler before some routes, so those routes become unreachable.",
        "Running an auth check before `cors()`, so browser preflight OPTIONS requests fail with 401.",
        "Follow-up trap: \"Do other users wait while one request awaits MongoDB?\" No. Awaiting I/O frees the event loop. Only synchronous CPU work (big loops, JSON.parse of huge data, sync crypto) blocks everyone.",
      ],
      takeaway: 'A request walks the stack in registration order: global middleware → routes → 404 → error handler.',
    },
    {
      id: 'error-handling-middleware',
      title: 'Error-handling middleware',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A special middleware with four arguments (err, req, res, next) that catches errors from the whole app and sends one consistent error response.',
      what: `An **error-handling middleware** is a middleware with **four** parameters: \`(err, req, res, next)\`. Express recognizes it by the number of parameters.

It runs when:
- A route or middleware calls \`next(err)\`.
- A synchronous handler **throws**.
- In Express 5, an async handler **rejects** (see the async errors topic).

You register it **last**, after all routes. It is the one central place that turns any error into a clean JSON response.

#### Deeper version
Good practice is a custom error class, like \`AppError\`, with a \`statusCode\` and an \`isOperational\` flag.

- **Operational errors** are expected: invalid input, not found, duplicate email. Show the message to the user with a 4xx code.
- **Programmer errors** are bugs: \`undefined is not a function\`. Log the full stack, but send a generic 500 message. Never leak stack traces or database details to clients.

You can have several error handlers in a chain. For example, one that converts Mongoose \`ValidationError\` or duplicate key error \`11000\` into a 400/409, then calls \`next(err)\`, and a final one that sends the response.

If headers were already sent (for example, an error in the middle of streaming), you cannot send a new response. Check \`res.headersSent\` and call \`next(err)\` so Express's **default error handler** closes the connection.

Express's default handler (if you don't write one) sends the stack trace in development and only the status message when \`NODE_ENV=production\`.`,
      why: `Without a central handler, each route builds its own error JSON, the shapes differ, some routes leak stack traces, and some forget to set the status code. One error middleware gives a consistent format (\`{ error: { code, message } }\`), one place to log and alert (e.g. Sentry), and cleaner controllers that just \`throw\`.`,
      analogy: `It is the hospital emergency room. Any department (route) that has a problem sends the patient (error) to the ER instead of treating it themselves. The ER has one standard process: check how serious it is, record it, and give the family (client) a calm, clear update — not the scary internal medical notes.`,
      code: [
        {
          title: 'AppError + central error handler',
          lang: 'javascript',
          code: `// utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // expected error, safe to show
  }
}

// app.js
import express from 'express';
const app = express();

app.get('/users/:id', (req, res, next) => {
  if (req.params.id !== '1') {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }
  res.json({ id: 1, name: 'Asha' });
});

app.get('/bug', () => {
  null.boom(); // programmer error -> TypeError
});

// Error handler: 4 params, registered LAST
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err); // let Express close the connection

  const status = err.statusCode || 500;
  if (status >= 500) console.error(err); // log full details on the server only

  res.status(status).json({
    error: {
      code: err.isOperational ? err.code : 'INTERNAL',
      message: err.isOperational ? err.message : 'Something went wrong',
    },
  });
});

app.listen(3000);`,
        },
        {
          title: 'Translating database errors',
          lang: 'javascript',
          code: `// Runs before the final handler; converts known errors into AppErrors
function mongoErrorTranslator(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return next(new AppError(err.message, 400, 'VALIDATION_ERROR'));
  }
  if (err.code === 11000) {
    return next(new AppError('Already exists', 409, 'DUPLICATE'));
  }
  if (err.name === 'CastError') {
    return next(new AppError('Invalid id', 400, 'INVALID_ID'));
  }
  next(err); // not ours, pass it on
}

// app.use(mongoErrorTranslator);
// app.use(finalErrorHandler);`,
        },
      ],
      output: `\`GET /users/5\` → \`next(new AppError(...))\` jumps to the error handler, which responds \`404\` with \`{"error":{"code":"USER_NOT_FOUND","message":"User not found"}}\`.

\`GET /bug\` → a \`TypeError\` is thrown. It has no \`statusCode\` and is not operational, so the client sees only \`500\` and "Something went wrong", while the full stack is logged on the server.

In the second block, a duplicate email (Mongo error code \`11000\`) becomes a clean 409 instead of a scary 500.`,
      questions: [
        {
          q: "How does Express know a middleware is an error handler?",
          a: "By its arity — it must declare exactly four parameters `(err, req, res, next)`, even if you do not use `next`.",
        },
        {
          q: "How do you trigger the error handler?",
          a: "Call `next(err)`, or throw inside a synchronous handler. In Express 5, a rejected promise from an async handler also reaches it automatically.",
        },
        {
          q: "What is the difference between operational and programmer errors?",
          a: "Operational errors are expected failures like bad input or not found; you show a helpful message with a 4xx code. Programmer errors are bugs; you log them and return a generic 500 without details.",
        },
        {
          q: "What is res.headersSent used for in an error handler?",
          a: "If part of the response was already sent, you cannot send a new one. You call `next(err)` so Express's default handler closes the connection.",
        },
        {
          q: "Should you send the stack trace to the client?",
          a: "No. It leaks file paths, library versions and logic. Log it on the server (or send to Sentry) and give the client a generic message plus maybe a request id.",
        },
      ],
      spoken: `"Express identifies an error handler by its four arguments: \`err\`, \`req\`, \`res\`, \`next\`. I register one at the very end of the app. Any route can call \`next\` with an error, or just throw, and it lands there. I usually create an \`AppError\` class with a status code and an \`isOperational\` flag. Operational errors like not found or validation get their real message and a 4xx code; unknown errors are logged with the stack and the client gets a generic 500. I also translate things like Mongo duplicate key errors into a 409. That way every error response has the same shape and nothing sensitive leaks."`,
      mistakes: [
        "Writing the handler with three parameters `(err, req, res)`. Express then treats it as normal middleware and it never catches errors.",
        "Registering it before the routes. It must be last.",
        "Sending `err.message` for every error, which can leak database or internal details. Only show messages for operational errors.",
        "Follow-up trap: \"Will the error handler catch an error thrown inside a setTimeout callback?\" No — that runs outside Express's call stack in both Express 4 and 5. Catch it yourself and call `next(err)`.",
      ],
      takeaway: 'One four-argument error handler, registered last, turns every error into a safe, consistent response.',
    },
    {
      id: 'async-error-handling',
      title: 'Async error handling (Express 4 vs Express 5)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Express 4 does not catch rejected promises, so you need try/catch or a wrapper. Express 5 forwards rejected promises from handlers to next(err) automatically.',
      what: `Most handlers are \`async\` because they await the database. What happens when the awaited promise **rejects**?

- **Express 4:** Express only catches errors that are thrown **synchronously**. An \`async\` function that throws returns a rejected promise, and Express 4 ignores it. The request **hangs**, and Node logs an "unhandled rejection" (in Node 15+ that crashes the process by default). So you must use \`try/catch\` and call \`next(err)\`, or a wrapper.
- **Express 5:** If a route handler or middleware **returns a promise that rejects** (or an async function throws), Express calls \`next(err)\` for you. Your normal error handler receives it. No wrapper needed.

#### Deeper version
Common Express 4 solutions:
1. \`try/catch\` in every handler — works, but lots of repetition.
2. An \`asyncHandler\` wrapper: \`fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)\`.
3. The \`express-async-errors\` package, which patches Express 4 so rejections go to \`next\`. (Not needed in Express 5.)

What Express 5 does **not** fix:
- Errors thrown inside **callbacks** that are not part of the returned promise: \`setTimeout\`, event emitters, stream \`'error'\` events, old callback APIs. They happen outside Express's chain. Wrap them in a promise or call \`next(err)\` yourself.
- **Fire-and-forget** promises you don't \`await\` or return. If you start \`sendEmail()\` without awaiting, its rejection is not tied to the request.

Always add process-level safety nets: \`process.on('unhandledRejection')\` and \`process.on('uncaughtException')\` to log, then shut down gracefully. After an uncaught exception the app may be in a broken state, so restarting (via PM2, Docker, Kubernetes) is the safe choice.`,
      why: `This is one of the most common real production bugs in Express 4 apps: a database call fails, the error is never caught, the user sees a spinner forever, and the process may crash. Interviewers ask it to see if you know the difference between sync and async errors, and whether you know what Express 5 changed.`,
      analogy: `Express 4 is a teacher who only hears students who shout right now (sync throws). A student who writes the problem on a note to be read later (a rejected promise) is ignored. Express 5 reads those notes too. But neither teacher can hear a student who left the room (a \`setTimeout\` callback).`,
      code: [
        {
          title: 'Express 4: wrapper so rejections reach next(err)',
          lang: 'javascript',
          code: `// utils/asyncHandler.js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// routes (Express 4)
import { asyncHandler } from './utils/asyncHandler.js';

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id); // may reject
  if (!user) throw new AppError('User not found', 404);
  res.json(user);
}));

// Without asyncHandler in Express 4, a rejection here would hang the request.`,
        },
        {
          title: 'Express 5: just throw or let the promise reject',
          lang: 'javascript',
          code: `// Express 5: rejected promises are forwarded to next(err) automatically
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id); // rejection -> error handler
  if (!user) throw new AppError('User not found', 404); // also -> error handler
  res.json(user);
});

// Still NOT caught automatically, in any version:
app.get('/timer', (req, res, next) => {
  setTimeout(() => {
    try {
      throw new Error('inside a callback');
    } catch (err) {
      next(err); // you must forward it yourself
    }
  }, 10);
});

// Safety nets for anything that slips through
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection', reason);
});`,
        },
      ],
      output: `In Express 4 with \`asyncHandler\`, if \`findById\` rejects (for example the database is down), \`.catch(next)\` sends the error to the error handler and the client gets a 500 instead of a hanging request. The thrown \`AppError\` becomes a 404.

In Express 5 the same code works with no wrapper, because Express itself attaches the \`.catch(next)\`. In \`/timer\`, the error happens later inside a callback, so we catch it and call \`next(err)\` by hand; otherwise it would become an uncaught exception.`,
      questions: [
        {
          q: "Does Express catch errors in async route handlers?",
          a: "Express 4 does not — rejected promises are ignored and the request hangs. Express 5 does: if a handler or middleware returns a rejected promise, Express calls `next(err)` automatically.",
        },
        {
          q: "How do you handle async errors in Express 4?",
          a: "Use try/catch with `next(err)`, an `asyncHandler` wrapper that does `.catch(next)`, or the `express-async-errors` package.",
        },
        {
          q: "Write an asyncHandler from memory.",
          a: "`const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);`",
        },
        {
          q: "What errors does Express 5 still not catch?",
          a: "Errors in callbacks outside the returned promise (setTimeout, event emitters, stream error events) and promises you started but did not await or return.",
        },
        {
          q: "What should happen on an uncaught exception?",
          a: "Log it, stop accepting new requests, finish in-flight ones if possible, and exit so a process manager restarts a clean instance. Continuing to run can leave the app in a broken state.",
        },
      ],
      spoken: `"Express 4 only catches errors thrown synchronously. An async handler that rejects is ignored, so the request hangs and Node reports an unhandled rejection, which can crash the process. In Express 4 I use an \`asyncHandler\` wrapper that calls \`.catch(next)\`, or the express-async-errors package. Express 5 fixed this: if a handler or middleware returns a rejected promise, Express forwards it to \`next\` with the error. But even in Express 5, errors inside callbacks like setTimeout or event emitters, or promises I don't await, aren't caught. So I still add \`unhandledRejection\` and \`uncaughtException\` handlers that log and restart cleanly."`,
      mistakes: [
        "Saying Express 5 catches every possible error. It only catches rejections of the promise your handler returns; callback and fire-and-forget errors still escape.",
        "Using async handlers in Express 4 without try/catch or a wrapper, leaving requests hanging on DB errors.",
        "Catching an error and only logging it, without responding or calling `next(err)` — the request still hangs.",
        "Follow-up trap: \"Do you still need express-async-errors in Express 5?\" No. Express 5 handles rejected promises natively, so remove the patch when you upgrade.",
      ],
      takeaway: 'Express 4: wrap async handlers (.catch(next)); Express 5: rejections are forwarded for you — but callbacks still need manual next(err).',
    },
    {
      id: 'validation',
      title: 'Request validation (zod, Joi, express-validator)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Check body, params and query against a schema at the edge of your API, reject bad input with 400/422, and pass only clean, typed data to your logic.',
      what: `**Validation** means checking that incoming data has the right shape before you use it. "Is \`email\` a real email? Is \`age\` a number between 13 and 120? Are there unexpected fields?"

Never trust the client. Front-end validation is only for user experience; anyone can call your API with curl.

#### Zod vs Joi vs express-validator
All three are top choices for Express, but they work in **different ways**.

**Zod:** schema-first and **built for TypeScript**. You write one schema, and Zod gives you the TypeScript type from it **automatically**.

\`\`\`typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(13),
});

type User = z.infer<typeof UserSchema>; // { email: string; age: number } — no extra type to write

const result = UserSchema.safeParse(req.body);
if (!result.success) return res.status(400).json(result.error.issues);
\`\`\`

**Joi:** older and very mature, long popular in Node.js. You describe the data as a **blueprint** (schema), but it **does not give you TypeScript types** on its own; you write those separately.

\`\`\`javascript
import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(13),
});

const { error, value } = userSchema.validate(req.body, { abortEarly: false });
if (error) return res.status(400).json(error.details);
\`\`\`

**express-validator:** made **only for Express**. It is a set of middleware built on validator.js. You check and clean (**sanitize**) fields **one by one, right on the route**.

\`\`\`javascript
import { body, validationResult } from 'express-validator';

app.post(
  '/users',
  body('email').isEmail().normalizeEmail(), // check + clean
  body('age').isInt({ min: 13 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());
    res.status(201).json(req.body);
  }
);
\`\`\`

**Which one?** TypeScript project → **Zod**. Existing JS codebase that already uses it → **Joi**. Simple Express-only checks and sanitising per route → **express-validator**.

#### Deeper version
Validate at the **edge** (in a middleware, before the controller). Then the controller and service can trust the data.

Good habits:
- **Strip unknown fields** (zod objects strip them by default; Joi has \`stripUnknown\`). This blocks **mass assignment**, where an attacker sends \`"role": "admin"\` and your code saves the whole body.
- **Coerce** query and params: they are strings. \`z.coerce.number()\` turns \`"2"\` into \`2\`.
- Return **all** errors at once (Joi: \`abortEarly: false\`) in a clear shape the front-end can map to form fields.
- Use \`safeParse\` (zod) so you get a result object instead of a thrown error.
- Validation is not the same as **business rules** ("email already taken"). Shape checks go in middleware; rules that need the database go in the service.

In Express 5, \`req.query\` is a getter and cannot be reassigned. So store parsed query data somewhere else, like \`req.validated\` or \`res.locals\`, instead of \`req.query = parsed\`.

Zod's error helper APIs changed between versions 3 and 4 (for example how you flatten errors). \`error.issues\` exists in both; check the docs for the version you use.`,
      why: `Bad input causes crashes (\`undefined.toLowerCase\`), corrupt data in MongoDB, NoSQL injection (\`{"$gt": ""}\` as a password), and security holes like mass assignment. A schema at the entry point stops all of this in one place and documents what the API accepts.`,
      analogy: `Validation is the bouncer at a club door with a checklist: ID present, age over 18, dress code OK. People who fail are turned away at the door with a reason. Inside, the staff never needs to check again. And the bouncer takes away anything not on the allowed list (unknown fields) before people go in.`,
      code: [
        {
          title: 'Reusable zod validation middleware',
          lang: 'javascript',
          code: `import express from 'express';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().email().toLowerCase(),
  age: z.number().int().min(13).optional(),
}); // unknown keys (like "role") are stripped by default

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), // "2" -> 2
  limit: z.coerce.number().int().max(100).default(20),
});

// where = 'body' | 'query' | 'params'
const validate = (schema, where = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[where]);
  if (!result.success) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  req.validated = { ...req.validated, [where]: result.data }; // clean data
  next();
};

const app = express();
app.use(express.json());

app.post('/users', validate(createUserSchema), (req, res) => {
  res.status(201).json(req.validated.body);
});
app.get('/users', validate(listQuerySchema, 'query'), (req, res) => {
  res.json(req.validated.query);
});

app.listen(3000);`,
        },
        {
          title: 'Same idea with express-validator and Joi',
          lang: 'javascript',
          code: `// express-validator: chains are middleware
import { body, validationResult } from 'express-validator';

app.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    res.json({ ok: true });
  });

// Joi: validate and strip unknown keys, report all errors
import Joi from 'joi';
const schema = Joi.object({ email: Joi.string().email().required() });
const { error, value } = schema.validate(
  { email: 'x@y.com', role: 'admin' },
  { abortEarly: false, stripUnknown: true },
);
console.log(error, value); // undefined { email: 'x@y.com' }`,
        },
      ],
      output: `\`POST /users\` with \`{"name":" Asha ","email":"ASHA@X.COM","role":"admin"}\` returns 201 with \`{"name":"Asha","email":"asha@x.com"}\` — the name was trimmed, the email lower-cased, and \`role\` was removed. With \`{"name":"A"}\` it returns 400 with details for \`name\` (too short) and \`email\` (required).

\`GET /users?page=2\` returns \`{"page":2,"limit":20}\` — page converted to a number and limit filled with its default.

The Joi example prints \`undefined\` for the error and \`{ email: 'x@y.com' }\` for the value, because \`role\` was stripped.`,
      questions: [
        {
          q: "Why validate on the server if the front-end already validates?",
          a: "Anyone can call the API directly with curl or Postman. Front-end checks are for user experience; server checks are for correctness and security.",
        },
        {
          q: "Where should validation live in an Express app?",
          a: "In middleware at the edge, before the controller. Shape checks there; business rules that need the database (like unique email) in the service layer.",
        },
        {
          q: "What is mass assignment and how does validation prevent it?",
          a: "Saving `req.body` directly lets an attacker set fields like `role` or `isVerified`. A schema that strips unknown keys means only allowed fields reach the database.",
        },
        {
          q: "Why do you need coercion for query params?",
          a: "Everything in the query string is a string. `z.coerce.number()` (or Joi's conversion) turns `\"2\"` into `2` so comparisons and math work.",
        },
        {
          q: "zod vs Joi vs express-validator?",
          a: "zod is TypeScript-first and gives inferred types. Joi is a mature JS schema library. express-validator uses middleware chains per field. All work; in a TS codebase I prefer zod because one schema gives both validation and types.",
        },
      ],
      spoken: `"I never trust the client, so every route validates body, params and query at the edge with a schema. In TypeScript projects I use zod, because one schema gives me runtime validation and the inferred type. I wrap it in a small \`validate(schema, 'body')\` middleware that uses \`safeParse\`, returns a 400 with a list of field errors, and puts the clean data on the request. The schema strips unknown fields, which blocks mass assignment like someone sending \`role: admin\`, and it coerces query strings into numbers. Checks that need the database, like unique email, stay in the service layer."`,
      mistakes: [
        "Saving `req.body` straight into Mongo (`User.create(req.body)`) — classic mass assignment.",
        "Forgetting that query params are strings, so `limit > 100` compares strings or `page * 10` behaves oddly.",
        "Trying `req.query = parsed` in Express 5, where `req.query` is a read-only getter. Store parsed data on another property.",
        "Follow-up trap: \"Is validation enough to stop NoSQL injection?\" It helps a lot (a password must be a string, not `{ $gt: '' }`), but also use Mongoose's `sanitizeFilter` or strict query options and never build queries from raw objects.",
      ],
      takeaway: 'Validate every input with a schema at the edge, strip unknown fields, and pass only clean data inward.',
    },
    {
      id: 'cors',
      title: 'CORS (Cross-Origin Resource Sharing)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A browser rule: a page can only read responses from another origin if that server allows it with CORS headers. Configure an allow-list with the cors middleware.',
      what: `An **origin** is protocol + domain + port, like \`https://app.example.com:443\`. Two URLs with any difference are different origins.

Browsers have the **Same-Origin Policy**: JavaScript on \`app.example.com\` cannot read a response from \`api.example.com\` unless the API says it is allowed. **CORS** is how the server says "yes, this origin may read my responses", using headers like \`Access-Control-Allow-Origin\`.

In Express you use the \`cors\` package: \`app.use(cors({ origin: 'https://app.example.com' }))\`.

Important: CORS is enforced by the **browser**. Postman, curl and other servers ignore it. CORS is not a security wall for your API; it protects users' browsers.

#### Deeper version
**Simple requests** (GET/POST with basic headers) are sent directly; the browser then checks the response headers.

**Preflight requests:** for "non-simple" requests (like \`PUT\`, \`DELETE\`, \`Content-Type: application/json\`, or an \`Authorization\` header), the browser first sends an \`OPTIONS\` request asking "may I?". The server must answer with \`Access-Control-Allow-Methods\`, \`Access-Control-Allow-Headers\` and so on. \`app.use(cors())\` handles preflight for all routes. \`maxAge\` lets the browser cache the preflight answer.

**Credentials:** to send cookies cross-origin, the front-end sets \`credentials: 'include'\` (fetch) or \`withCredentials: true\` (axios), and the server sets \`credentials: true\`. Then \`Access-Control-Allow-Origin\` **cannot be \`*\`** — it must be the exact origin. Also the cookie itself needs \`SameSite=None; Secure\` if the sites are cross-site.

Use an **allow-list** function for multiple origins. Do not blindly reflect any origin with credentials enabled — that lets any website make logged-in requests and read the answers.`,
      why: `Your React app on Vercel and your API on AWS are different origins. Without CORS headers, every fetch fails in the browser with the famous red "blocked by CORS policy" error. Configuring CORS correctly lets your own front-ends work while other websites cannot read your users' data with their cookies.`,
      analogy: `CORS is like a building's guest list kept by the receptionist (the browser). A visitor from another company (another origin) can only enter a floor if that floor's manager (your API) has put the company on the list. Note that the guest list only binds the receptionist — someone using the back door (curl) never meets the receptionist at all.`,
      code: [
        {
          title: 'Allow-list with credentials',
          lang: 'javascript',
          code: `import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'https://app.example.com',
  'http://localhost:5173', // Vite dev server
];

app.use(cors({
  origin(origin, callback) {
    // No origin = curl, server-to-server, same-origin: allow
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,                     // allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,                           // cache preflight for 10 minutes
}));

app.get('/api/me', (req, res) => res.json({ user: 'asha' }));
app.listen(4000);`,
        },
        {
          title: 'Front-end call that needs CORS + credentials',
          lang: 'javascript',
          code: `// Runs in the browser at http://localhost:5173
const res = await fetch('http://localhost:4000/api/me', {
  method: 'GET',
  credentials: 'include', // send cookies cross-origin
});
console.log(await res.json());`,
        },
      ],
      output: `The browser at \`http://localhost:5173\` calls the API. The server sees the \`Origin\` header, finds it in the allow-list, and responds with \`Access-Control-Allow-Origin: http://localhost:5173\` and \`Access-Control-Allow-Credentials: true\`. The browser lets the page read \`{"user":"asha"}\`.

If a page on \`https://evil.com\` tries the same call, the callback rejects the origin, no CORS headers are sent, and the browser blocks the page from reading the response. (The rejected callback error goes to your error handler; you may want to respond 403 there.)`,
      questions: [
        {
          q: "What is CORS?",
          a: "A browser mechanism that lets a server allow specific other origins to read its responses, using `Access-Control-Allow-*` headers. It relaxes the Same-Origin Policy in a controlled way.",
        },
        {
          q: "What is a preflight request?",
          a: "An automatic `OPTIONS` request the browser sends before non-simple requests (like PUT/DELETE, JSON content type or custom headers) to ask which methods and headers are allowed.",
        },
        {
          q: "Why can't you use origin '*' with credentials?",
          a: "Browsers reject `Access-Control-Allow-Origin: *` when credentials are included. You must echo the exact allowed origin and set `Access-Control-Allow-Credentials: true`.",
        },
        {
          q: "Does CORS protect my API from attackers?",
          a: "No. It only controls what browsers let pages read. curl, Postman and servers ignore it. You still need authentication, authorization and rate limiting.",
        },
        {
          q: "My API works in Postman but fails in the browser. Why?",
          a: "Postman does not apply CORS. The browser does. The server is missing the right CORS headers, or the preflight OPTIONS request is failing (often because auth middleware runs before cors).",
        },
      ],
      spoken: `"CORS is a browser rule. By default, JavaScript on one origin can't read responses from another origin. The server opts in with headers like Access-Control-Allow-Origin. In Express I use the cors package with an allow-list of my front-end origins, for example the production domain and localhost for Vite. For non-simple requests the browser sends a preflight OPTIONS first, and \`app.use(cors())\` answers it. If I use cookies, I set \`credentials: true\` on both sides, and then I can't use a star origin. I also remember that CORS isn't API security — curl ignores it — so auth and rate limiting still matter."`,
      mistakes: [
        "Using `origin: '*'` together with cookies and wondering why the browser still blocks it.",
        "Reflecting any origin (`origin: true`) with `credentials: true` in production — any site can then make logged-in requests and read the response.",
        "Putting auth middleware before `cors()`, so preflight OPTIONS requests get 401 and every call fails.",
        "Follow-up trap: \"Is a CORS error a server error?\" No. The server usually answered fine; the browser refused to give the response to the page because headers were missing.",
      ],
      takeaway: 'CORS is the browser asking your API for permission; answer with an exact allow-list, and remember it is not authentication.',
    },
    {
      id: 'project-structure',
      title: 'Project structure and config (app vs server, .env)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Organize by layer or by feature, keep app.js (the Express app) separate from server.js (listen), and load and validate config from environment variables in one place.',
      what: `Express does not tell you where to put files, so a clear structure is your job. A common, interview-friendly layout:

\`\`\`text
src/
  app.js              # builds the Express app (middleware + routes), exports it
  server.js           # imports app, connects DB, calls listen, handles shutdown
  config/index.js     # reads and validates env variables
  routes/             # URL -> controller mapping
  controllers/        # read req, call service, send res
  services/           # business logic (no req/res here)
  repositories/       # database queries (or models/ for Mongoose)
  middlewares/        # auth, validate, errorHandler, rateLimit
  validators/         # zod/Joi schemas
  utils/              # AppError, asyncHandler, logger
tests/
\`\`\`

**Why split app and server?** Tests can import \`app\` and call it with supertest, without opening a real port or connecting to production services.

#### Deeper version
Two main ways to organize:
- **By layer** (above): easy for small and medium apps, everyone knows where controllers live.
- **By feature / module**: \`modules/users/{users.routes.js, users.controller.js, users.service.js, users.schema.js}\`. Better for big apps — everything about "users" is in one folder, and features are easier to move into a separate service later.

**Configuration** follows the 12-factor idea: settings come from **environment variables**, not hard-coded values. Use \`dotenv\` in development (Node 20.6+ also supports \`node --env-file=.env\`). Read \`process.env\` in **one** config file, validate it with zod at startup, and **fail fast** if something is missing. The rest of the code imports \`config\`, never \`process.env\` directly.

Never commit \`.env\`. Commit a \`.env.example\` with fake values. In production, secrets come from AWS Secrets Manager, GCP Secret Manager, or the platform's env settings.`,
      why: `A messy Express app becomes one 2000-line \`app.js\` where routes, SQL and business rules are mixed. That is hard to test, hard to review and hard for new people to understand. A predictable structure makes code easy to find, lets you test each layer, and lets several developers work without conflicts. Validated config prevents the "app started but crashes at 2 AM because STRIPE_KEY was undefined" problem.`,
      analogy: `It is like a well-organized kitchen. Ingredients in the fridge (repositories/data), recipes in a book (services), chefs at the stove (controllers), the order screen at the counter (routes). A new cook can find anything on day one. The config file is the checklist taped to the door: if the gas or water is missing, you find out before opening, not in the middle of dinner service.`,
      code: [
        {
          title: 'config/index.js — validate env at startup',
          lang: 'javascript',
          code: `import 'dotenv/config'; // loads .env into process.env (dev only)
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.issues);
  process.exit(1); // fail fast at startup
}

export const config = parsed.data;`,
        },
        {
          title: 'app.js vs server.js',
          lang: 'javascript',
          code: `// src/app.js — no listen, no DB connect: easy to test
import express from 'express';
import usersRouter from './routes/users.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

// src/server.js — the real entry point
// import mongoose from 'mongoose';
// import { app } from './app.js';
// import { config } from './config/index.js';
//
// await mongoose.connect(config.MONGO_URI);
// const server = app.listen(config.PORT, () => console.log('Up on', config.PORT));`,
        },
      ],
      output: `If \`MONGO_URI\` is missing or \`JWT_SECRET\` is too short, the app prints a clear list of problems and exits immediately, instead of starting and failing later. \`PORT\` arrives as a string from the environment and \`z.coerce.number()\` turns it into a number.

\`app.js\` only builds the app, so a test can do \`request(app).get('/api/users')\` with no port and no real database connection. \`server.js\` is the only file that connects to Mongo and calls \`listen\`.`,
      questions: [
        {
          q: "How do you structure an Express project?",
          a: "Routes → controllers → services → repositories/models, plus middlewares, validators, config and utils folders. For large apps I group by feature module. I keep `app.js` separate from `server.js`.",
        },
        {
          q: "Why separate app.js and server.js?",
          a: "So tests (supertest) can import the app without starting a server or connecting to real services, and so startup concerns (DB connection, listen, shutdown) stay in one place.",
        },
        {
          q: "How do you manage configuration and secrets?",
          a: "Environment variables, loaded with dotenv locally and from a secret manager in production. Read them in one config module, validate at startup, and never commit `.env`.",
        },
        {
          q: "Layer-based or feature-based folders?",
          a: "Layer-based is simple for small apps. Feature-based scales better because each feature is self-contained and easier to split out later. Many teams use feature folders with layers inside each feature.",
        },
      ],
      spoken: `"Express is unopinionated, so I bring the structure. I separate \`app.js\`, which builds the app with middleware and routes and exports it, from \`server.js\`, which connects to the database and calls listen. That makes the app easy to test with supertest. Inside src I have routes, controllers, services, repositories or models, middlewares, validators and utils. For bigger projects I group by feature, so each module has its own routes, controller, service and schema. Config comes from environment variables, read in one file and validated with zod at startup, so the app fails fast if a secret is missing."`,
      mistakes: [
        "Reading `process.env.X` all over the codebase with no validation, so typos fail silently as `undefined`.",
        "Committing `.env` with real keys to Git. Rotate the keys immediately if it happens.",
        "Calling `app.listen` inside `app.js`, which makes tests open real ports and leak handles.",
        "Follow-up trap: \"Is process.env always a string?\" Yes — every value is a string (or undefined). `PORT=3000` is `'3000'`, and `DEBUG=false` is the truthy string `'false'`.",
      ],
      takeaway: 'Predictable folders, app separate from server, and one validated config module.',
    },
    {
      id: 'mvc-layered-architecture',
      title: 'MVC and layered architecture (controller / service / repository)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Split each request into layers: the controller handles HTTP, the service holds business rules, the repository talks to the database. Each layer only knows the one below it.',
      what: `**MVC** (Model–View–Controller) and the **layered architecture** (Controller–Service–Repository) **work together** to keep a backend clean as it grows.

**MVC** splits an app into three parts:
- **Model**: the data and its rules (e.g. a Mongoose model).
- **View**: what the user sees (HTML; in an API, the JSON response).
- **Controller**: receives the request and coordinates.

**The problem:** in pure MVC, everything ends up in the controller or the model. Controllers become huge ("**fat controllers**") and models get overloaded. So teams add **three layers**, each with **one job**.

- **Controller** (the MVC Controller): handles the HTTP / API endpoint. It is the **gatekeeper**: reads \`req\`, sends \`res\`.
- **Service** (the Model's **logic**): the **business rules**. It does not care how the request arrived or where the data is stored.
- **Repository** (the Model's **data**): the **data access** layer (DAO). It hides the database from the business logic.

#### How the data flows
\`\`\`text
Client request  →  Controller  →  Service  →  Repository  →  Database
Client response ←  Controller  ←  Service  ←  Repository  ←  Database
\`\`\`

\`\`\`javascript
// Repository: only talks to the database
const userRepo = {
  findByEmail: (email) => User.findOne({ email }),
  create: (data) => User.create(data),
};

// Service: only business rules
async function registerUser(data) {
  if (await userRepo.findByEmail(data.email)) throw new AppError('Email already used', 409);
  return userRepo.create(data);
}

// Controller: only HTTP
async function register(req, res) {
  const user = await registerUser(req.body);
  res.status(201).json(user);
}
\`\`\`

#### Deeper version
The key rule is **dependency direction**: controller → service → repository. Lower layers never import upper ones. A service never touches \`res\`; it returns data or throws an \`AppError\`.

Benefits:
- **Testability**: you can unit test a service by giving it a fake repository, no HTTP and no database.
- **Reuse**: the same service can be called from an HTTP controller, a cron job, a queue worker, or a CLI script.
- **Swappable data layer**: moving from MongoDB to PostgreSQL mostly touches repositories.

**Dependency injection** (passing the repository into the service, instead of importing it directly) makes testing even easier. NestJS does this automatically; in plain Express you can do it with simple factory functions.

Don't over-engineer: for a tiny service with three routes, a full repository layer can be overkill. Many Mongoose apps let the service use the model directly and skip the repository. Say this trade-off in interviews.`,
      why: `Without layers, a controller grows into 200 lines that parse input, run business rules, call Stripe, query Mongo and format JSON. Nothing is reusable or testable. With layers each piece has one job (Single Responsibility), bugs are easier to locate, and you can run the same logic from a webhook, a job queue or an API endpoint.`,
      analogy: `A restaurant: the **waiter** (controller) takes your order and brings the plate but does not cook. The **chef** (service) decides how to cook and follows the recipe rules. The **storeroom keeper** (repository) fetches ingredients and knows where every item is stored. The chef never talks to customers, and the waiter never goes into the storeroom.`,
      code: [
        {
          title: 'One feature across the layers',
          lang: 'javascript',
          code: `// repositories/user.repository.js — only DB access
import { User } from '../models/user.model.js';
export const userRepository = {
  findByEmail: (email) => User.findOne({ email }).lean(),
  create: (data) => User.create(data),
};

// services/user.service.js — business rules, no req/res
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError.js';
export function makeUserService(repo) {      // repo is injected
  return {
    async register({ name, email, password }) {
      const existing = await repo.findByEmail(email);
      if (existing) throw new AppError('Email already registered', 409);
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await repo.create({ name, email, passwordHash });
      return { id: user.id, name: user.name, email: user.email }; // never return the hash
    },
  };
}

// controllers/user.controller.js — HTTP only
import { userRepository } from '../repositories/user.repository.js';
const userService = makeUserService(userRepository);
export async function register(req, res) {
  const user = await userService.register(req.validated.body);
  res.status(201).json(user);
}

// routes/user.routes.js
// router.post('/register', validate(registerSchema), register);`,
        },
        {
          title: 'Unit testing the service with a fake repository',
          lang: 'javascript',
          code: `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeUserService } from '../src/services/user.service.js';

test('rejects a duplicate email', async () => {
  const fakeRepo = {
    findByEmail: async () => ({ id: '1', email: 'a@b.com' }), // already exists
    create: async () => { throw new Error('should not be called'); },
  };
  const service = makeUserService(fakeRepo);

  await assert.rejects(
    service.register({ name: 'A', email: 'a@b.com', password: 'secret123' }),
    { statusCode: 409 },
  );
});`,
        },
      ],
      output: `A \`POST /register\` request goes route → validation middleware → controller → service → repository. If the email exists, the service throws a 409 \`AppError\`; the controller does not need any \`if\`, and the error handler formats the response. On success the controller returns 201 with the safe user object (no password hash).

The test runs the real business rule with a fake repository, so it needs no database and no HTTP server, and it proves a duplicate email is rejected with status 409.`,
      questions: [
        {
          q: "What is the difference between a controller and a service?",
          a: "The controller handles HTTP: reads the request, calls the service, sends the response. The service holds business logic and knows nothing about `req`/`res`, so it can be reused and unit tested.",
        },
        {
          q: "Why add a repository layer?",
          a: "It isolates database queries. Services become easy to test with a fake repository, and changing the database or ORM touches only one layer. For small Mongoose apps it can be optional.",
        },
        {
          q: "Where do you put validation and authorization?",
          a: "Shape validation and authentication in middleware before the controller. Business rules and ownership checks (\"can this user edit this order?\") in the service.",
        },
        {
          q: "What is dependency injection in an Express app?",
          a: "Passing dependencies (like a repository or a Stripe client) into a service instead of importing them inside it. It makes swapping and mocking easy. Plain factory functions are enough; no framework needed.",
        },
      ],
      spoken: `"I use a layered architecture. Routes map URLs to controllers and attach middleware like auth and validation. Controllers only deal with HTTP: they read the validated input, call a service, and send the response. Services hold the business rules and never touch \`req\` or \`res\`, so I can reuse them from a webhook handler or a queue worker. Repositories, or Mongoose models in smaller apps, do the database queries. I inject the repository into the service with a simple factory, which makes unit tests easy with a fake repo. It's basically MVC, where the view is the JSON response."`,
      mistakes: [
        "Passing `req` or `res` into services. That ties business logic to HTTP and kills reuse.",
        "Fat controllers with queries, rules and formatting mixed together.",
        "Returning the full Mongoose document (with password hash and internal fields) straight to the client.",
        "Follow-up trap: \"Isn't this over-engineering?\" For a tiny app, maybe — you can skip the repository and use models directly. The controller/service split is cheap and almost always worth it.",
      ],
      takeaway: 'Controller = HTTP, service = business rules, repository = data; dependencies point downward only.',
    },
    {
      id: 'cookies-sessions',
      title: 'Cookies and sessions (cookie-parser, express-session)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Cookies are small key-values the browser sends back on every request. Sessions keep user data on the server and store only a session id in a secure cookie.',
      what: `HTTP is **stateless**: each request forgets the last one. Cookies and sessions add memory.

- A **cookie** is a small piece of text the server asks the browser to store (\`Set-Cookie\` header). The browser sends it back automatically on every request to that site.
- A **session** keeps the real data (user id, cart) on the **server**, in a store like Redis or MongoDB. The cookie holds only a random **session id**.

In Express:
- \`res.cookie(name, value, options)\` sets a cookie. \`res.clearCookie(name)\` removes it.
- \`cookie-parser\` reads cookies into \`req.cookies\` (and signed ones into \`req.signedCookies\`).
- \`express-session\` manages sessions and gives you \`req.session\`.

#### Deeper version
Cookie security flags (know these by heart):
- \`httpOnly: true\` — JavaScript cannot read it, which protects it from XSS theft.
- \`secure: true\` — only sent over HTTPS.
- \`sameSite: 'lax' | 'strict' | 'none'\` — controls cross-site sending; key defense against CSRF. \`'none'\` requires \`secure\`.
- \`maxAge\` / \`expires\` — lifetime. No lifetime = deleted when the browser closes.
- \`signed: true\` — tamper-proof (an HMAC signature with your secret), but **not** encrypted; users can still read it.

\`express-session\` details:
- The default **MemoryStore** is only for development. It leaks memory and does not work with several server instances. Use \`connect-redis\` or \`connect-mongo\`.
- \`resave: false\` and \`saveUninitialized: false\` avoid useless writes and avoid creating sessions for anonymous visitors.
- On login call \`req.session.regenerate()\` to get a new id. This prevents **session fixation** (an attacker planting a known session id).
- Behind a proxy or load balancer with \`secure\` cookies, set \`app.set('trust proxy', 1)\`, otherwise Express thinks the request is HTTP and does not send the cookie.

**Sessions vs JWT:** sessions are easy to revoke (delete from the store) but need a shared store. JWTs are stateless but hard to revoke before expiry.`,
      why: `Login state, shopping carts, preferences and CSRF tokens all need state across requests. Cookies are the browser's built-in way to carry it, and \`httpOnly\` cookies are safer than putting tokens in \`localStorage\`, where any XSS script can read them.`,
      analogy: `A session is a coat check. You give your coat (data) to the cloakroom (server store) and get a small numbered ticket (the session id cookie). You show the ticket each time. The ticket is useless on its own, and if you lose it, the cloakroom can cancel it. A cookie with data inside is like pinning a note to your own jacket — anyone can read it, so put nothing secret there.`,
      code: [
        {
          title: 'Sessions stored in MongoDB',
          lang: 'javascript',
          code: `import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const app = express();
app.set('trust proxy', 1); // behind a load balancer / Nginx
app.use(express.json());

app.use(session({
  name: 'sid',                         // don't reveal the default "connect.sid"
  secret: process.env.SESSION_SECRET,  // signs the session id cookie
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, ttl: 60 * 60 * 24 }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,       // 1 day
  },
}));

app.post('/login', (req, res, next) => {
  // ...check email + password first...
  req.session.regenerate((err) => {    // new id -> prevents session fixation
    if (err) return next(err);
    req.session.userId = 'user-123';
    res.json({ ok: true });
  });
});

app.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  res.json({ userId: req.session.userId });
});

app.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid').json({ ok: true });
  });
});

app.listen(3000);`,
        },
        {
          title: 'Plain and signed cookies',
          lang: 'javascript',
          code: `import cookieParser from 'cookie-parser';

app.use(cookieParser(process.env.COOKIE_SECRET)); // secret enables signed cookies

app.get('/set-theme', (req, res) => {
  res.cookie('theme', 'dark', { maxAge: 30 * 24 * 3600 * 1000, sameSite: 'lax' });
  res.cookie('plan', 'pro', { signed: true, httpOnly: true });
  res.send('cookies set');
});

app.get('/read', (req, res) => {
  res.json({
    theme: req.cookies.theme,        // "dark"
    plan: req.signedCookies.plan,    // "pro", or false if someone edited it
  });
});`,
        },
      ],
      output: `After \`POST /login\`, the browser gets a \`sid\` cookie (httpOnly, so JavaScript can't read it). The session document \`{ userId: 'user-123' }\` lives in MongoDB. \`GET /me\` sends the cookie automatically; express-session loads the session, and the response is \`{"userId":"user-123"}\`. After \`/logout\`, the session is deleted from the store and the cookie is cleared, so \`/me\` returns 401.

In the second example, \`req.cookies.theme\` is "dark". If a user edits the signed \`plan\` cookie in DevTools, the signature no longer matches and \`req.signedCookies.plan\` becomes \`false\`.`,
      questions: [
        {
          q: "What is the difference between a cookie and a session?",
          a: "A cookie is data stored in the browser and sent on every request. A session stores data on the server and uses a cookie only to carry the session id.",
        },
        {
          q: "What do httpOnly, secure and sameSite do?",
          a: "`httpOnly` hides the cookie from JavaScript (XSS protection). `secure` sends it only over HTTPS. `sameSite` limits sending it on cross-site requests (CSRF protection).",
        },
        {
          q: "Why not use the default MemoryStore in production?",
          a: "It leaks memory, loses all sessions on restart, and does not share sessions between multiple instances. Use Redis or MongoDB as the store.",
        },
        {
          q: "What is session fixation and how do you prevent it?",
          a: "An attacker makes the victim use a session id the attacker knows, then waits for them to log in. Prevent it by calling `req.session.regenerate()` on login so the id changes.",
        },
        {
          q: "Sessions or JWT?",
          a: "Sessions are simple and instantly revocable but need a shared store. JWTs are stateless and good across services but hard to revoke. For a classic web app I like sessions in httpOnly cookies; for multiple services or mobile clients, short-lived JWTs with refresh tokens.",
        },
      ],
      spoken: `"HTTP is stateless, so cookies give the browser a way to send data back on every request. With sessions, the real data stays on the server and the cookie just holds a random session id. In Express I use express-session with a Redis or Mongo store, never the default memory store in production. The cookie is httpOnly, secure and sameSite lax, and I set trust proxy when behind a load balancer. On login I regenerate the session to prevent session fixation, and on logout I destroy it and clear the cookie. A big plus over JWT is that I can revoke a session instantly."`,
      mistakes: [
        "Using MemoryStore in production — sessions vanish on restart and break with more than one instance.",
        "Thinking signed cookies are encrypted. Signing only detects tampering; the value is readable.",
        "Setting `secure: true` behind a proxy without `trust proxy`, so the session cookie is never sent.",
        "Follow-up trap: \"Where should I store a JWT in the browser?\" Prefer an httpOnly, secure, sameSite cookie over localStorage, because any XSS can read localStorage. Then add CSRF protection.",
      ],
      takeaway: 'Keep secrets on the server, send only an id in an httpOnly + secure + sameSite cookie, and use a real session store.',
    },
    {
      id: 'jwt-auth-middleware',
      title: 'JWT authentication and authorization middleware',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Issue a signed token on login, verify it in an auth middleware that sets req.user, and check roles or ownership in a second middleware or the service.',
      what: `**Authentication** = "who are you?" **Authorization** = "what are you allowed to do?"

A **JWT auth middleware** checks both **without storing sessions** on the server. The client sends a **signed token** in the header \`Authorization: Bearer <token>\`, and the middleware checks that the signature is real.

A **JWT (JSON Web Token)** is used to **securely log users in** and **share information** between a client (like a browser) and a server.

#### What a JWT looks like
A long string in **three parts separated by two dots**: \`xxxxx.yyyyy.zzzzz\`. Each part is Base64Url-encoded.

1. **Header:** details about the token: its type (\`JWT\`) and the signing algorithm (e.g. \`HS256\`).
2. **Payload:** the actual data, called **claims**: \`userId\`, \`username\`, \`role\`, \`exp\`. It is only **encoded, not encrypted**: anyone can decode and read it. **Never put passwords or sensitive data here.**
3. **Signature:** the **security guard**. The server mixes the header, the payload and a **secret key only it knows** into a signature. If anyone changes the payload, the signature no longer matches and the server **rejects** the token.

\`\`\`text
eyJhbGciOiJIUzI1NiJ9 . eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9 . SflKxwRJSMeKKF2QT4fwpM
      header                        payload                         signature
\`\`\`

#### Why Node.js developers prefer JWT over sessions
- **Storage:** sessions live on the **server** (RAM or Redis). JWTs live on the **client** (browser or mobile storage).
- **Scalability:** with sessions, many servers must **share session data**. With JWT, **any server** can check the token on its own using the secret key.
- **Performance:** sessions need a **database lookup on every request**. JWT is checked with **maths on the signature**, no database call.
- **Architecture:** sessions suit **monolithic** web apps. JWT suits **APIs, mobile apps and microservices**.

**Trade-off to mention:** a JWT stays valid until it expires, so **logging someone out early is harder** than deleting a session. That is why access tokens are kept short-lived (see Deeper version).

#### How the middleware works
1. **Extract:** read the token from the \`Authorization: Bearer <token>\` header (or a cookie).
2. **Verify:** check the signature with the secret (or public key), and check it has not **expired** (\`exp\`).
3. **Attach:** if valid, put the decoded user data (\`sub\`, \`email\`, \`role\`) on \`req.user\`.
4. **Authorize:** later middleware or the route checks \`req.user\` (role, \`isAdmin\`) and allows or blocks the request: **401 Unauthorized** (not logged in / bad token) or **403 Forbidden** (logged in, but not allowed).

\`\`\`javascript
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Attach payload to request
    next();
  });
}
\`\`\`

**Interview tip:** many teams return **401** (not 403) for an invalid or expired token, because the user is not authenticated. Keep **403** for "you are logged in but not allowed". Also pass \`{ algorithms: ['HS256'] }\` to \`jwt.verify\` so a token cannot choose its own algorithm.

#### Deeper version
- The payload is **base64url-encoded, not encrypted**. Anyone can read it. Never put passwords or secrets inside.
- Always pass \`algorithms\` to \`jwt.verify\` (e.g. \`['HS256']\`) so a token cannot pick its own algorithm.
- Use **short-lived access tokens** (5-15 minutes) and a long-lived **refresh token** in an httpOnly cookie. Store refresh tokens (or a hash of them) in the DB so you can revoke them, and **rotate** them on each use.
- \`jwt.verify\` throws \`TokenExpiredError\` or \`JsonWebTokenError\` — map both to 401.
- **Authorization** has two kinds: **role-based** (admin only) and **ownership** ("is this order yours?"). Ownership usually needs the DB, so do it in the service. Missing ownership checks cause IDOR bugs (Insecure Direct Object Reference) — user A reads \`/orders/123\` that belongs to user B.
- For RS256, an auth server signs with a private key and APIs verify with the public key — useful with many services, and how providers like Auth0 or Cognito work.`,
      why: `Every protected route needs to know who is calling and whether they may do it. Putting this in middleware means one tested implementation, and routes simply declare \`auth, authorize('admin')\`. JWTs let many servers (or microservices) verify users without sharing a session store.`,
      analogy: `A JWT is a festival wristband. At the entrance (login) security checks your ticket and puts a tamper-proof band on you showing your name and "VIP" (claims). After that, every gate guard (auth middleware) just checks the band is real and not expired — no phone call to the ticket office. But anyone can read what is printed on the band, and a lost band stays valid until it expires.`,
      code: [
        {
          title: 'Sign, verify, and role check',
          lang: 'javascript',
          code: `import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
const SECRET = process.env.JWT_SECRET;

app.post('/login', async (req, res) => {
  // ...verify email + password with bcrypt first...
  const user = { id: 'u1', role: 'admin' };
  const token = jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '15m' });
  res.json({ accessToken: token });
});

// Authentication: who are you?
function auth(req, res, next) {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ error: msg });
  }
}

// Authorization: are you allowed?
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });

app.get('/profile', auth, (req, res) => res.json(req.user));
app.delete('/users/:id', auth, authorize('admin'), (req, res) => res.sendStatus(204));

app.listen(3000);`,
        },
        {
          title: 'Ownership check in the service (prevents IDOR)',
          lang: 'javascript',
          code: `// services/order.service.js
export async function getOrderForUser(orderId, user) {
  const order = await Order.findById(orderId).lean();
  if (!order) throw new AppError('Order not found', 404);
  const isOwner = String(order.userId) === user.id;
  if (!isOwner && user.role !== 'admin') {
    throw new AppError('Order not found', 404); // 404 hides that it exists
  }
  return order;
}`,
        },
      ],
      output: `\`POST /login\` returns \`{"accessToken":"eyJ..."}\`. \`GET /profile\` with \`Authorization: Bearer eyJ...\` returns \`{"id":"u1","role":"admin"}\`. Without a token → 401 "Missing token". After 15 minutes → 401 "Token expired", and the client should call a refresh endpoint.

\`DELETE /users/7\` passes \`auth\` and then \`authorize('admin')\`; a user with role "user" gets 403. In the service example, a user asking for someone else's order gets a 404, so they can't even learn the order exists.`,
      questions: [
        {
          q: "What is the difference between authentication and authorization?",
          a: "Authentication checks identity (valid token or session → 401 if not). Authorization checks permission for an action (role or ownership → 403 if not).",
        },
        {
          q: "Is the JWT payload encrypted?",
          a: "No. It is only base64url-encoded and signed. Anyone can decode and read it; the signature only proves it was not changed.",
        },
        {
          q: "How do you log out or revoke a JWT?",
          a: "You can't cancel a stateless JWT before it expires. Use short access-token lifetimes, revoke refresh tokens in the DB, and if needed keep a denylist of token ids (jti) in Redis.",
        },
        {
          q: "Why access and refresh tokens?",
          a: "A short-lived access token limits damage if stolen. A long-lived refresh token (httpOnly cookie, stored server-side, rotated on use) gets new access tokens without asking the user to log in again.",
        },
        {
          q: "What is an IDOR bug?",
          a: "Insecure Direct Object Reference: the API trusts an id from the URL without checking ownership, so user A can read or change user B's data. Fix it with ownership checks or by always filtering queries by `userId`.",
        },
      ],
      spoken: `"On login I verify the password with bcrypt and sign a short-lived JWT, around fifteen minutes, with the user id and role. The client sends it as a Bearer token. An \`auth\` middleware verifies it with a fixed algorithm, sets \`req.user\`, and returns 401 if it's missing, invalid or expired. A separate \`authorize\` factory checks roles and returns 403. Ownership checks, like 'is this your order', happen in the service, which prevents IDOR bugs. For sessions longer than fifteen minutes I use a rotating refresh token in an httpOnly cookie, stored in the database so I can revoke it."`,
      mistakes: [
        "Putting sensitive data (email, password hash, permissions you don't want public) in the JWT payload — it is readable by anyone.",
        "Long-lived access tokens (30 days) with no way to revoke them.",
        "Only checking roles and forgetting ownership, leaving IDOR holes like `/orders/:id`.",
        "Using `jwt.decode` instead of `jwt.verify` — decode does not check the signature at all.",
        "Follow-up trap: \"Should auth failures return 401 or 403?\" 401 when identity is missing or invalid; 403 when the user is known but not allowed.",
      ],
      takeaway: 'auth middleware verifies the token and sets req.user; authorize checks roles; services check ownership.',
    },
    {
      id: 'bcrypt-password-hashing',
      title: 'Password hashing with bcrypt',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Never store passwords. Store a slow, salted bcrypt hash, and use bcrypt.compare on login.',
      what: `You must **never store plain passwords**, and never store them with simple encryption that can be reversed. You store a **hash**: a one-way fingerprint. On login you hash the typed password again and compare.

**bcrypt** is a password-hashing function that is:
- **Salted**: a random value is mixed in, so two users with password "hello123" get different hashes. This defeats **rainbow tables** (pre-computed hash lists).
- **Slow on purpose**: controlled by a **cost factor** (salt rounds). Each +1 doubles the time. Slow hashing makes brute-forcing stolen hashes very expensive.

In Node: \`await bcrypt.hash(password, 12)\` and \`await bcrypt.compare(password, hash)\`.

#### Deeper version
A bcrypt hash looks like \`$2b$12$<22-char salt><31-char hash>\`. It stores the algorithm version, the cost and the salt **inside** the string. That is why \`compare\` only needs the plain password and the stored hash.

Details interviewers like:
- **Why not SHA-256?** It is designed to be fast — billions per second on GPUs. Fast is bad for passwords.
- **Cost factor**: pick a value that takes roughly 100-300 ms on your server (10-12 is common). Increase it over time as hardware gets faster; re-hash on next login.
- **Use the async API.** \`hashSync\` blocks the event loop. The \`bcrypt\` package runs async hashing in libuv's thread pool.
- **72-byte limit**: bcrypt ignores everything after 72 bytes. Very long passphrases are effectively cut.
- \`bcrypt\` (native, faster) vs \`bcryptjs\` (pure JS, no build tools, slower). **Argon2id** is the modern winner of the Password Hashing Competition and is recommended by OWASP; bcrypt is still acceptable.
- **Timing and user enumeration**: if the user doesn't exist, still do a compare against a dummy hash so the response time is similar, and return the same "Invalid email or password" message.`,
      why: `Databases get leaked. If passwords are plain text or fast hashes, attackers instantly get real passwords — which people reuse on email and banking. With salted bcrypt, every single password must be cracked separately and slowly, which buys users time to change them.`,
      analogy: `Hashing is like putting fruit through a juicer: easy to make juice, impossible to rebuild the fruit. The salt is a secret spice added to each glass, so two people's apple juice still tastes different. bcrypt's cost factor is a deliberately slow, hand-cranked juicer: fine for one glass at login, painfully slow for a thief trying a billion fruits.`,
      code: [
        {
          title: 'Hash on register, compare on login',
          lang: 'javascript',
          code: `import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function register(password) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS); // salt generated for you
  console.log(hash); // $2b$12$....(60 chars)
  return hash;
}

async function login(password, storedHash) {
  return bcrypt.compare(password, storedHash); // true / false
}

const hash = await register('correct horse');
const hash2 = await register('correct horse');
console.log(hash === hash2);                       // false -> different salts
console.log(await login('correct horse', hash));   // true
console.log(await login('wrong', hash));           // false`,
        },
        {
          title: 'Mongoose hook + safe login',
          lang: 'javascript',
          code: `import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false }, // not returned by default
});

// Hash only when the password field changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const User = mongoose.model('User', userSchema);

// A dummy hash so "no such user" takes about the same time
const DUMMY_HASH = await bcrypt.hash('dummy-password', 12);

export async function verifyLogin(email, password) {
  const user = await User.findOne({ email }).select('+password');
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !ok) throw new Error('Invalid email or password'); // same message for both
  return user;
}`,
        },
      ],
      output: `The first block prints two different 60-character hashes for the same password (different salts), so \`hash === hash2\` is \`false\`. \`compare\` still returns \`true\` for the right password because the salt is stored inside the hash, and \`false\` for the wrong one.

In the Mongoose example, the \`pre('save')\` hook hashes the password only when it was set or changed, so updating the email doesn't double-hash it. \`select: false\` keeps the hash out of normal queries. Login always runs one \`compare\`, and returns the same error whether the email or the password was wrong.`,
      questions: [
        {
          q: "Why hash passwords instead of encrypting them?",
          a: "Encryption can be reversed with the key; if the key leaks, all passwords leak. Hashing is one-way, so you only ever compare hashes.",
        },
        {
          q: "What is a salt?",
          a: "A random value mixed into each password before hashing. Same password → different hashes, which defeats rainbow tables and hides users who share a password.",
        },
        {
          q: "Why is bcrypt better than SHA-256 for passwords?",
          a: "SHA-256 is fast, so attackers can test billions of guesses per second. bcrypt is deliberately slow and has a tunable cost factor.",
        },
        {
          q: "How does bcrypt.compare know the salt?",
          a: "The salt and cost are stored inside the hash string itself (`$2b$12$salt...hash`), so compare re-hashes the input with the same salt and cost.",
        },
        {
          q: "How many salt rounds should you use?",
          a: "Enough that one hash takes roughly 100-300 ms on your hardware; 10-12 is common today. Measure it and raise it over time.",
        },
      ],
      spoken: `"I never store passwords, only a bcrypt hash. bcrypt generates a random salt per password, so identical passwords get different hashes, and it's deliberately slow with a cost factor — I usually use 12. The salt and cost live inside the hash string, so on login I just call \`bcrypt.compare\` with the typed password and the stored hash. I use the async API so the event loop isn't blocked, hash in a Mongoose pre-save hook only when the password changed, and hide the field with \`select: false\`. On login I return the same generic error for a wrong email or password. For new systems Argon2id is also a great choice."`,
      mistakes: [
        "Using MD5 or SHA-256 (even with a salt) for passwords — far too fast.",
        "Using `hashSync`/`compareSync` in a request handler, blocking the event loop for every user.",
        "Hashing in a pre-save hook without `isModified('password')`, so the hash gets hashed again on every save.",
        "Different error messages for \"email not found\" and \"wrong password\", which lets attackers find valid emails.",
        "Follow-up trap: \"Can you decrypt a bcrypt hash to email users their password?\" No. It is one-way. Offer a password reset link with a single-use, expiring token instead.",
      ],
      takeaway: 'Store only slow, salted hashes (bcrypt or Argon2), use the async API, and compare — never decrypt.',
    },
    {
      id: 'file-upload-multer',
      title: 'File uploads with multer',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'multer parses multipart/form-data, puts files on req.file / req.files, and lets you limit size, count and type. Store files in S3, not on the server disk.',
      what: `Files are sent as **\`multipart/form-data\`** — the body is split into parts, one per field or file. \`express.json()\` cannot read it. **multer** is the standard Express middleware for this.

- \`upload.single('avatar')\` → one file in \`req.file\`, text fields in \`req.body\`.
- \`upload.array('photos', 5)\` → up to 5 files in \`req.files\`.
- \`upload.fields([...])\` → several named file fields.

Storage options:
- \`diskStorage\` → saves to a folder on the server.
- \`memoryStorage\` → keeps the file in RAM as a \`Buffer\` (\`req.file.buffer\`), handy for sending to S3.

#### Deeper version
Always set **limits**: \`limits: { fileSize: 2 * 1024 * 1024, files: 1 }\`. Without them, one user can upload a huge file and fill your disk or memory (memoryStorage + no limit = easy crash).

\`fileFilter\` lets you accept or reject a file. But \`file.mimetype\` comes from the **client** and can be faked. For real safety, check the file's **magic bytes** (the first bytes of the content) with a library like \`file-type\`, and never trust the original file name — generate your own (UUID).

Multer errors (like \`LIMIT_FILE_SIZE\`) are \`multer.MulterError\` instances; handle them in your error handler and return 400 or 413.

**Production pattern:** servers on AWS/GCP are often stateless and can be replaced at any time, so the local disk is not a safe place. Upload to **S3 / GCS**. Even better for big files: the server creates a **pre-signed URL**, and the browser uploads directly to S3. Node never handles the bytes, which saves bandwidth and memory.

Multer had security fixes in its 2.x releases (2025), so keep it updated. Never serve uploaded files from the same origin as your app without care: a user-uploaded HTML or SVG file can contain scripts (stored XSS).`,
      why: `Profile pictures, documents, invoices, CSV imports — almost every app needs uploads. Doing it wrong is a top source of security bugs and outages: disks fill up, servers run out of memory, attackers upload scripts. multer gives you a simple, battle-tested parser with the limits and hooks you need.`,
      analogy: `multer is the mailroom of an office. Letters (text fields) go into your inbox (\`req.body\`), packages (files) are logged and stored (\`req.file\`). A good mailroom has rules: no packages over 2 kg (fileSize), no more than one per person (files), and it opens the box to check it is really a book and not something dangerous (magic bytes), not just trusting the label.`,
      code: [
        {
          title: 'Avatar upload with limits and filter',
          lang: 'javascript',
          code: `import express from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: 'uploads/', // folder must exist
  filename: (req, file, cb) => {
    // never trust the original name; generate our own
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2 MB, one file
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  },
});

const app = express();

app.post('/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.status(201).json({ file: req.file.filename, size: req.file.size, caption: req.body.caption });
});

// Turn multer errors into clean 400/413 responses
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: err.code });
  }
  next(err);
});

app.listen(3000);`,
        },
        {
          title: 'Memory storage straight to S3',
          lang: 'javascript',
          code: `import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/documents', upload.single('doc'), async (req, res) => {
  const key = \`docs/\${crypto.randomUUID()}.pdf\`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: req.file.buffer,          // the file bytes in memory
    ContentType: 'application/pdf',
  }));
  res.status(201).json({ key });
});`,
        },
      ],
      output: `A form with \`<input type="file" name="avatar">\` and a \`caption\` field posts to \`/avatar\`. multer saves the file as something like \`uploads/9b1c...e2.png\` and returns 201 with the new name, size and caption. A 5 MB file is rejected with 413 \`LIMIT_FILE_SIZE\`. A PDF is rejected with 400 because its mimetype is not in the allow-list.

In the S3 version, the file never touches the disk: multer keeps it as a Buffer, we send it to S3 under a random key, and return that key so the app can create a download link later.`,
      questions: [
        {
          q: "Why can't express.json() handle file uploads?",
          a: "Files are sent as `multipart/form-data`, a different format with separate parts and boundaries. You need a multipart parser like multer or busboy.",
        },
        {
          q: "What is the difference between diskStorage and memoryStorage?",
          a: "diskStorage writes files to a folder. memoryStorage keeps them in RAM as a Buffer, which is handy for forwarding to S3 but dangerous without a size limit.",
        },
        {
          q: "How do you make uploads secure?",
          a: "Set size and count limits, allow-list file types, verify magic bytes instead of trusting mimetype, generate your own file names, store outside the web root or in S3, and scan or re-encode files when needed.",
        },
        {
          q: "How do you handle large files at scale?",
          a: "Use pre-signed S3 URLs so the browser uploads directly to S3, or stream the upload (busboy) instead of buffering it. Node then doesn't hold the whole file in memory.",
        },
        {
          q: "Why not save uploads on the server's disk in the cloud?",
          a: "Containers and auto-scaled instances are temporary and not shared. Files disappear on redeploy and other instances can't see them. Object storage like S3 solves both.",
        },
      ],
      spoken: `"For uploads I use multer, because files come as multipart form data, which the JSON parser can't read. I always set limits for file size and count, use a fileFilter with an allow-list, and generate my own file names. Since the mimetype comes from the client, for sensitive cases I also check magic bytes. In the cloud I don't keep files on the server's disk — instances are disposable — so I either use memory storage and push the buffer to S3, or better, generate a pre-signed URL so the browser uploads straight to S3 and Node never handles the bytes."`,
      mistakes: [
        "No `limits` with memoryStorage — one big upload can crash the server.",
        "Trusting `file.originalname` (path tricks, overwrites) or `file.mimetype` (client-controlled).",
        "Saving uploads on a container's local disk, then losing them on the next deploy.",
        "Expecting `req.body` text fields before multer runs — they are only filled after multer parses the form.",
        "Follow-up trap: \"Is checking the file extension enough?\" No. Renaming `evil.html` to `evil.png` is trivial. Check the content and serve user files from a separate domain or with a safe Content-Type.",
      ],
      takeaway: 'multer for multipart, always with limits and an allow-list; store files in S3, ideally via pre-signed URLs.',
    },
    {
      id: 'logging-morgan-winston',
      title: 'Logging with morgan and winston (or pino)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'morgan logs each HTTP request; winston (or pino) is a general logger with levels, JSON output and transports. Add a request id and never log secrets.',
      what: `**Logging** means writing down what your app is doing so you can debug problems later.

- **morgan** is an HTTP **request logger** middleware. One line per request: method, URL, status, time. Formats: \`'dev'\` (short, colored, for local) and \`'combined'\` (Apache-style, for production).
- **winston** is a **general-purpose logger** for everything else: "payment failed", "user signed up". It has **levels** (\`error\`, \`warn\`, \`info\`, \`http\`, \`debug\`), **formats** (JSON, timestamps) and **transports** (where logs go: console, file, external service).
- **pino** is a popular, very fast alternative to winston that logs JSON by default.

#### Deeper version
Production logging best practices:
- **Structured (JSON) logs**, not plain text. Tools like CloudWatch, GCP Cloud Logging, Datadog or ELK can then search by fields: \`level=error AND userId=42\`.
- **Log to stdout**, not files, in containers. The platform collects stdout. (12-factor: "treat logs as event streams".)
- **Request id / correlation id**: generate an id per request (\`crypto.randomUUID()\`), put it in every log line and in an \`X-Request-Id\` response header. Pass it to downstream services. Then you can follow one request across many services.
- **Levels by environment**: \`debug\` locally, \`info\` in production. Use an env variable.
- **Never log secrets or personal data**: passwords, tokens, card numbers, full request bodies. Use redaction (pino has a \`redact\` option).
- Connect morgan to winston with morgan's \`stream\` option, so all logs share one format.
- Logging is not monitoring: also send errors to Sentry and collect metrics (latency, error rate).`,
      why: `In production you can't attach a debugger. When a customer says "my payment failed at 3:14 PM", logs are the only way to see what happened. \`console.log\` has no levels, no timestamps, no structure and can't be filtered — it does not scale beyond hobby projects.`,
      analogy: `morgan is the security camera at the front door: it records everyone who comes in and out, and when. winston is the ship's captain's logbook: the captain writes important events with a time and a severity ("storm warning", "engine failure"). The request id is the ticket number that lets you find one passenger in every camera and every logbook entry.`,
      code: [
        {
          title: 'winston logger + morgan + request id',
          lang: 'javascript',
          code: `import express from 'express';
import morgan from 'morgan';
import winston from 'winston';
import crypto from 'node:crypto';

// 1. One app-wide logger, JSON to stdout
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // include stack traces
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

const app = express();

// 2. Request id for every request
app.use((req, res, next) => {
  req.id = req.get('X-Request-Id') || crypto.randomUUID();
  res.set('X-Request-Id', req.id);
  next();
});

// 3. morgan writes through winston, including the request id
morgan.token('id', (req) => req.id);
app.use(morgan(':id :method :url :status :response-time ms', {
  stream: { write: (line) => logger.http(line.trim()) },
}));

app.get('/pay', (req, res) => {
  logger.info('Payment started', { requestId: req.id, amount: 499 }); // no card data!
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { requestId: req.id, err });
  res.status(500).json({ error: 'Internal error', requestId: req.id });
});

app.listen(3000);`,
        },
      ],
      output: `For \`GET /pay\` the app logs a JSON line like \`{"level":"info","message":"Payment started","requestId":"3f2a...","amount":499,"timestamp":"..."}\` and returns an \`X-Request-Id\` header.

Note: the morgan line is logged at the \`http\` level, which is below \`info\`, so with the default \`LOG_LEVEL=info\` it is hidden. Set \`LOG_LEVEL=http\` (or \`debug\`) to see lines like \`3f2a... GET /pay 200 1.2 ms\`. When an error happens, the client gets the request id, support can search the logs for it, and see every line for that request.`,
      questions: [
        {
          q: "What is the difference between morgan and winston?",
          a: "morgan only logs HTTP requests as middleware. winston is a general logger with levels, formats and transports for any message in the app. They are often combined via morgan's `stream` option.",
        },
        {
          q: "Why structured JSON logs?",
          a: "Log platforms can index and filter JSON fields (level, userId, requestId). Plain text needs fragile regex searches.",
        },
        {
          q: "What is a correlation / request id?",
          a: "A unique id attached to a request and added to every log line and downstream call, so you can trace one request end to end across services.",
        },
        {
          q: "What should you never log?",
          a: "Passwords, tokens, API keys, full card numbers, and unnecessary personal data. Use redaction for sensitive fields.",
        },
        {
          q: "Why not just console.log?",
          a: "No levels, no structure, no redaction, no easy way to turn debug output off in production. A proper logger gives all of these.",
        },
      ],
      spoken: `"I use morgan for HTTP access logs and winston or pino for application logs. In production everything goes to stdout as structured JSON, so CloudWatch or GCP Logging can filter by fields. I pipe morgan through winston so there's one format. Every request gets a request id from a middleware; it goes into each log line and the X-Request-Id header, so when a user reports an error I can find the whole trace. I use levels — debug locally, info in production — and I'm strict about never logging passwords, tokens or card data. Errors also go to Sentry for alerting."`,
      mistakes: [
        "Logging full `req.body` on login or payment routes, leaking passwords or card data into log storage.",
        "Writing logs to local files inside containers, where they vanish on restart.",
        "Using only `console.log`, so debug noise can't be turned off in production.",
        "Follow-up trap: \"Can logging slow down your API?\" Yes — heavy synchronous logging and huge objects cost CPU. Use a fast async logger (pino), sensible levels, and avoid logging large payloads.",
      ],
      takeaway: 'morgan for requests, winston/pino for app events; JSON to stdout with a request id, and never log secrets.',
    },
    {
      id: 'compression',
      title: 'Response compression',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'The compression middleware gzips responses so they travel faster. In production a proxy or CDN often does this instead.',
      what: `**Compression** makes responses smaller before sending them. A 500 KB JSON response can shrink to around 50-100 KB with gzip, because JSON has lots of repeated text.

The browser says what it supports with the \`Accept-Encoding\` header (for example \`gzip, deflate, br\`). The server compresses and adds \`Content-Encoding: gzip\`. The browser unzips it automatically.

In Express: \`app.use(compression())\` from the \`compression\` package.

#### Deeper version
- **threshold**: responses smaller than this are not compressed (default \`1kb\`). Compressing tiny responses wastes CPU and can even make them bigger.
- **Already-compressed files** (JPEG, PNG, MP4, ZIP) gain nothing; compression checks the content type and skips most of them.
- **CPU cost**: compression uses CPU on Node's main thread for each response. On a busy API it is usually better to let **Nginx, a load balancer, or a CDN** (CloudFront, Cloudflare) compress, and keep Node for business logic.
- **Brotli (\`br\`)** usually compresses better than gzip. CDNs support it well; support inside the \`compression\` package depends on the version, so check its docs.
- **Streaming / Server-Sent Events**: compression buffers data. For SSE or streaming AI responses you must call \`res.flush()\` after each write, or disable compression for that route, otherwise the client receives chunks late.
- **Security note**: compressing secrets together with attacker-controlled input over HTTPS can allow BREACH-style attacks. Rarely asked, but good to know.`,
      why: `Smaller responses mean faster page loads, especially on mobile networks, and lower bandwidth bills. It is a one-line win for APIs that return large JSON lists, as long as you don't double-compress or burn CPU that the proxy could handle.`,
      analogy: `Compression is vacuum-packing clothes before shipping. The parcel is much smaller and cheaper to send, and the receiver just opens it and the clothes puff back up. But vacuum-packing a single sock (a tiny response) is not worth the effort, and you can't vacuum-pack a brick (an already compressed JPEG).`,
      code: [
        {
          title: 'compression with a threshold and an opt-out',
          lang: 'javascript',
          code: `import express from 'express';
import compression from 'compression';

const app = express();

app.use(compression({
  threshold: 1024, // only compress responses bigger than 1 KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false; // client opt-out
    return compression.filter(req, res);             // default rules
  },
}));

app.get('/big', (req, res) => {
  const items = Array.from({ length: 5000 }, (_, i) => ({ id: i, name: \`Item \${i}\` }));
  res.json(items); // roughly 150 KB raw, much smaller gzipped
});

app.listen(3000);`,
        },
      ],
      output: `\`curl -H "Accept-Encoding: gzip" -I http://localhost:3000/big\` shows \`Content-Encoding: gzip\`. The JSON array (about 150 KB) is sent as a much smaller gzipped body, and the browser unzips it automatically. A request without \`Accept-Encoding: gzip\`, or with the \`x-no-compression\` header, gets the plain body. Small responses under 1 KB are never compressed.`,
      questions: [
        {
          q: "How does HTTP compression work?",
          a: "The client sends `Accept-Encoding: gzip, br`. The server compresses the body and sets `Content-Encoding`. The client decompresses automatically.",
        },
        {
          q: "Should Node compress responses in production?",
          a: "It can, but compression costs CPU on the main thread. Often it's better to let Nginx, the load balancer or a CDN do it, and keep Node free.",
        },
        {
          q: "Why not compress everything?",
          a: "Tiny responses don't benefit, and images, videos and zip files are already compressed. You just waste CPU.",
        },
        {
          q: "Why do streamed or SSE responses arrive late with compression on?",
          a: "Compression buffers output. You must call `res.flush()` after each chunk or disable compression on that route.",
        },
      ],
      spoken: `"Compression shrinks responses before sending them. The browser advertises gzip or brotli in Accept-Encoding, the server compresses and sets Content-Encoding, and the browser unpacks it. In Express it's one line with the compression middleware, and I keep the default threshold so tiny responses aren't compressed. Large JSON lists shrink a lot. In production I often let the CDN or Nginx handle it instead, since compression costs CPU on Node's main thread. One gotcha I've hit is with streaming or server-sent events, like streaming LLM output: compression buffers the data, so I flush after each chunk or skip compression on that route."`,
      mistakes: [
        "Compressing in Node and again at the proxy — wasted CPU, or broken responses if misconfigured.",
        "Turning compression on for SSE / streaming AI responses without `res.flush()`, so tokens arrive in big delayed batches.",
        "Expecting compression to help with images or videos — they are already compressed.",
        "Follow-up trap: \"Does compression reduce server load?\" It reduces bandwidth but adds CPU work. It is a trade-off, not free.",
      ],
      takeaway: 'Compression trades a little CPU for much smaller responses; often best done at the proxy/CDN, and careful with streaming.',
    },
    {
      id: 'testing-supertest',
      title: 'Testing Express APIs (supertest)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Unit test services with fakes, and integration test routes with supertest by calling the exported app directly — no real port needed.',
      what: `There are two main kinds of tests for an Express API:

- **Unit tests**: test one function (a service, a util) alone, with fake dependencies. Fast.
- **Integration tests**: send real HTTP requests through the whole Express app — middleware, validation, routes, error handler — and check status and body.

**supertest** makes integration tests easy. You give it your \`app\` (not a running server) and it handles the port for you: \`await request(app).get('/api/users').expect(200)\`.

You can use any test runner: **Jest**, **Vitest**, **Mocha**, or Node's built-in \`node:test\`.

#### Deeper version
- Export \`app\` from \`app.js\` without calling \`listen\` (see project structure). That is what makes supertest easy.
- For the database, use a **real but disposable** database: \`mongodb-memory-server\` or a Docker container (Testcontainers). Mocking Mongoose queries often tests your mocks, not your code.
- **Mock external services** like Stripe, email and LLM APIs at the boundary (inject a fake client, or use \`nock\`/msw to intercept HTTP). You don't want tests that charge cards or depend on someone else's uptime.
- Test the unhappy paths: 400 validation errors, 401 without token, 403 wrong role, 404, and that errors never leak stack traces.
- Clean up between tests (clear collections) so tests don't depend on each other, and close DB connections at the end so the runner exits.`,
      why: `Integration tests catch the bugs that unit tests miss in Express: wrong middleware order, a missing \`return\`, validation not wired up, wrong status codes. They let you refactor or upgrade (say, Express 4 → 5) with confidence, because the tests check the real HTTP behavior.`,
      analogy: `Unit tests check each car part on a workbench: the brakes work, the engine starts. supertest is a test drive around the block: you check that all the parts work together when a real driver presses the pedals.`,
      code: [
        {
          title: 'Integration tests with supertest and node:test',
          lang: 'javascript',
          code: `// tests/users.test.js   (run with: node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js'; // exported app, no listen()

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
});

test('POST /api/users rejects invalid input', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({ name: 'A' })                 // missing email, name too short
    .set('Content-Type', 'application/json');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'VALIDATION_ERROR');
});

test('GET /api/profile without token is 401', async () => {
  await request(app).get('/api/profile').expect(401); // supertest's own assertion
});`,
        },
      ],
      output: `\`node --test\` runs all three tests. supertest starts the app on a temporary port, sends each request, and gives back status, headers and the parsed JSON body. The first test checks the happy path, the second checks the validation middleware returns 400 with the right error code, and the third checks that the auth middleware blocks requests without a token. If someone later moves \`express.json()\` below the routes, the second test fails immediately.`,
      questions: [
        {
          q: "How do you test an Express API?",
          a: "Unit test services with fake dependencies, and integration test routes with supertest against the exported app, using a disposable test database and mocked external services.",
        },
        {
          q: "Why export app separately from server.listen?",
          a: "supertest can call the app directly without a fixed port, tests run in parallel without port conflicts, and no real server is left open.",
        },
        {
          q: "Should you mock the database?",
          a: "For integration tests I prefer a real disposable DB (mongodb-memory-server or a Docker container), because mocks can hide real query bugs. For service unit tests, a fake repository is fine.",
        },
        {
          q: "How do you test code that calls Stripe or an LLM?",
          a: "Inject the client so tests can pass a fake, or intercept HTTP with nock/msw. Tests should never hit the real paid API.",
        },
      ],
      spoken: `"I split tests into unit and integration. Services get unit tests with a fake repository injected, so they're fast and need no database. For the HTTP layer I use supertest against the exported app — that's why I keep app.js separate from server.js. Those tests go through the real middleware chain, so they catch things like wrong middleware order, missing validation or wrong status codes. I use mongodb-memory-server or a Docker database instead of mocking Mongoose, and I mock external services like Stripe or the LLM API at the boundary. I always test the failure cases too: 400, 401, 403 and 404."`,
      mistakes: [
        "Calling `app.listen` in the app module, so every test file opens a port and the runner never exits.",
        "Only testing happy paths; most real bugs are in error handling and auth checks.",
        "Tests that depend on each other's data because the DB isn't cleaned between tests.",
        "Follow-up trap: \"What's the difference between integration and end-to-end tests?\" Integration tests hit the API with a test database; E2E tests drive the real UI and full deployed stack (e.g. Playwright).",
      ],
      takeaway: 'Export the app, unit test services with fakes, and use supertest to test real HTTP behavior including failures.',
    },
    {
      id: 'rate-limiting',
      title: 'Rate limiting (express-rate-limit + Redis)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Limit how many requests a client can make in a time window, return 429 when they go over, and use a shared store like Redis when you run more than one instance.',
      what: `**Rate limiting** means: "each client may make at most N requests per time window." Example: 100 requests per 15 minutes per IP. Extra requests get **429 Too Many Requests**.

It protects against:
- Abuse and scraping.
- Simple denial-of-service floods.
- Brute-force login attempts.
- Runaway costs (e.g. an endpoint that calls a paid LLM API).

In Express, the common package is \`express-rate-limit\`.

#### Deeper version
**Algorithms** (good to name in interviews):
- **Fixed window**: count per minute; resets at :00. Simple, but allows bursts at window edges.
- **Sliding window**: smoother, looks at the last 60 seconds at any moment.
- **Token bucket**: tokens refill at a steady rate; each request spends one. Allows short bursts but limits the average.

**Key choice**: by IP for anonymous routes, by **user id or API key** for logged-in routes (many users can share one office IP).

**Behind a proxy**, \`req.ip\` is the load balancer's IP unless you set \`app.set('trust proxy', 1)\` (the number of proxies in front). Set it wrong in the other direction (\`true\` everywhere) and clients can fake their IP with an \`X-Forwarded-For\` header. Recent versions of express-rate-limit warn about this misconfiguration.

**Multiple instances**: the default store is in memory, so each server counts separately (3 servers = 3× the limit). Use a shared store like **Redis** (\`rate-limit-redis\`).

Send standard headers (\`RateLimit-*\`, \`Retry-After\`) so good clients can back off.

Option names changed across versions: newer express-rate-limit uses \`limit\`, older code uses \`max\`. Check the docs for the version you install.

Often the first layer of rate limiting lives **outside** Node — in a WAF, API Gateway, Cloudflare or Nginx — and Express adds finer per-user or per-route limits.`,
      why: `Without limits, one script can hammer your login, scrape your data, or call your OpenAI-backed endpoint thousands of times and create a huge bill. Rate limiting keeps the service fair and available for everyone, and protects money as well as servers.`,
      analogy: `It is a ticket machine at a busy bakery: each customer can take at most two numbers per hour. If you try a third time, the machine says "come back later" (429 + Retry-After). With several bakery branches, they must share one counter (Redis), otherwise a customer could take two numbers at every branch.`,
      code: [
        {
          title: 'Global, strict and per-user limits',
          lang: 'javascript',
          code: `import express from 'express';
import { rateLimit } from 'express-rate-limit';

const app = express();
app.set('trust proxy', 1); // one load balancer in front -> correct req.ip

// Gentle global limit for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  limit: 300,                // older versions call this "max"
  standardHeaders: 'draft-7',// RateLimit header
  legacyHeaders: false,      // no X-RateLimit-* headers
  message: { error: 'Too many requests, please slow down.' },
});

// Expensive AI endpoint: limit per logged-in user, not per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user.id, // runs after auth sets req.user
});

app.use('/api', apiLimiter);
app.post('/api/ai/summarize', fakeAuth, aiLimiter, (req, res) => res.json({ summary: '...' }));

function fakeAuth(req, res, next) { req.user = { id: 'u1' }; next(); }

app.listen(3000);`,
        },
        {
          title: 'Shared Redis store for many instances',
          lang: 'javascript',
          code: `import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export const sharedLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args), // all instances share counters
  }),
});`,
        },
      ],
      output: `A client can call \`/api/*\` 300 times in 15 minutes. Request 301 gets \`429\` with \`{"error":"Too many requests, please slow down."}\` and headers telling it when to retry. Each response carries a \`RateLimit\` header showing the remaining budget.

The AI endpoint has its own stricter limit of 10 calls per minute **per user id**, so 50 employees behind one office IP are not blocked together, and one user can't burn the LLM budget.

With the Redis store, three API servers share one counter, so the limit really is 100 per minute in total, not 100 per server.`,
      questions: [
        {
          q: "What is rate limiting and why do you need it?",
          a: "Capping how many requests a client can make in a time window. It stops abuse, brute force, scraping and runaway costs, and keeps the service available for others.",
        },
        {
          q: "What status code does a rate-limited request get?",
          a: "429 Too Many Requests, ideally with a `Retry-After` or `RateLimit` header.",
        },
        {
          q: "Why do you need Redis for rate limiting?",
          a: "The default store is per-process memory. With several instances or a restart, counts are split or lost. Redis gives one shared, fast counter.",
        },
        {
          q: "Why does trust proxy matter for rate limiting?",
          a: "Behind a load balancer, `req.ip` is the proxy's IP unless trust proxy is set, so all users share one limit. Setting it too broadly lets clients spoof `X-Forwarded-For`.",
        },
        {
          q: "Fixed window vs token bucket?",
          a: "Fixed window counts per time block and allows bursts at the edges. Token bucket refills at a steady rate, allowing small bursts but enforcing an average rate.",
        },
      ],
      spoken: `"Rate limiting caps how many requests a client can make in a window and returns 429 when they go over. I use express-rate-limit with a gentle global limit on the API and stricter limits on sensitive routes like login, password reset, or endpoints that call an LLM. For logged-in routes I key by user id instead of IP. Behind a load balancer I set trust proxy to the right number of hops so req.ip is the real client. Since we run several instances, I use a Redis store so the counters are shared. And usually there's a coarser limit at the edge too, like a WAF or API Gateway."`,
      mistakes: [
        "Using the in-memory store with several instances, so the real limit is N × instances.",
        "Forgetting `trust proxy`, so every user appears as the load balancer IP and everyone gets blocked together.",
        "Setting `trust proxy` to `true` when not behind a proxy, letting attackers fake IPs via headers.",
        "Follow-up trap: \"Is IP-based limiting enough?\" No. Attackers rotate IPs, and many real users share one IP. Combine IP limits with per-account limits and edge protection.",
      ],
      takeaway: 'Limit per key (IP or user), return 429, share counters in Redis, and get trust proxy right.',
    },
    {
      id: 'brute-force-protection',
      title: 'Brute-force protection for login',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Slow down repeated failed logins per account and per IP, with lockouts or backoff, CAPTCHA, generic errors and MFA — without letting attackers lock real users out.',
      what: `A **brute-force attack** is trying many passwords until one works. Related attacks:
- **Credential stuffing**: using email/password pairs leaked from other sites.
- **Password spraying**: trying one common password ("Summer2024!") against many accounts, to avoid per-account limits.

Defenses work in layers:
1. **Rate limit** the login route per IP.
2. **Limit failures per account** (email), not just per IP — attackers rotate IPs.
3. **Backoff or temporary lockout**: after 5 failures, wait 15 minutes, or make each try slower.
4. **CAPTCHA** after a few failures.
5. **Generic error message**: "Invalid email or password".
6. **MFA** (one-time codes) — the strongest defense; a stolen password is not enough.
7. Slow password hashing (bcrypt) so stolen hashes are hard to crack offline.

#### Deeper version
**Lockout can be abused.** If 5 bad passwords lock an account for an hour, an attacker can lock out your CEO forever. Better options: short temporary lockouts, progressive delays, lock per **email + IP** combination, and CAPTCHA instead of hard locks. Let the real user still log in via a reset link.

Count **failures only**: with \`express-rate-limit\` use \`skipSuccessfulRequests: true\`, or reset the counter on success.

Store counters in **Redis** with a TTL so they work across instances and expire automatically. The \`rate-limiter-flexible\` package is a popular option for advanced login protection (consecutive failures per user+IP and per IP per day).

Also protect **other "guessing" endpoints**: password reset, OTP verification (a 6-digit code has only 1,000,000 options — limit attempts!), email-exists checks, and coupon codes.

Monitor and alert on spikes of failed logins. Optionally check new passwords against known-breached lists (like the Have I Been Pwned range API).`,
      why: `Login is the most attacked endpoint of any app. A plain login route with no limits can be tried millions of times. Good brute-force protection blocks automated attacks while real users who mistype their password once or twice don't notice anything.`,
      analogy: `It is a phone's lock screen. Wrong PIN a few times? Wait 30 seconds. More? Wait 5 minutes. The phone doesn't erase itself after 5 tries (that would let a prankster wipe your phone), but it makes guessing all 10,000 PINs take years.`,
      code: [
        {
          title: 'Per-IP limit + per-account failure counter',
          lang: 'javascript',
          code: `import express from 'express';
import { rateLimit } from 'express-rate-limit';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// Layer 1: per-IP limit on the login route, counting only failed attempts
const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true, // a 2xx response does not count
});

// Layer 2: per-account failures (use Redis with TTL in production)
const failures = new Map(); // email -> { count, lockedUntil }
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

app.post('/login', loginIpLimiter, async (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const entry = failures.get(email) || { count: 0, lockedUntil: 0 };

  if (entry.lockedUntil > Date.now()) {
    return res.status(429).json({ error: 'Too many attempts. Try again later or reset your password.' });
  }

  const ok = await checkPassword(email, req.body.password); // bcrypt.compare inside
  if (!ok) {
    entry.count += 1;
    if (entry.count >= MAX_FAILS) entry.lockedUntil = Date.now() + LOCK_MS;
    failures.set(email, entry);
    return res.status(401).json({ error: 'Invalid email or password' }); // generic
  }

  failures.delete(email); // reset on success
  res.json({ ok: true });
});

async function checkPassword(email, password) {
  return email === 'a@b.com' && password === 'correct-password'; // demo only
}

app.listen(3000);`,
        },
      ],
      output: `A user who mistypes twice and then logs in sees nothing unusual: their counter resets on success. An attacker who tries 5 wrong passwords for \`a@b.com\` gets a 429 for 15 minutes on that account, even if they switch IPs. Meanwhile, one IP that fails 20 times across many accounts (password spraying) is blocked by the IP limiter. Every failed attempt gets the same "Invalid email or password" message, so the attacker can't tell which emails exist.`,
      questions: [
        {
          q: "How do you protect a login endpoint from brute force?",
          a: "Rate limit per IP, count failures per account with backoff or short lockouts, add CAPTCHA after a few failures, use generic errors, slow hashing, and MFA. Store counters in Redis.",
        },
        {
          q: "What is the risk of account lockout?",
          a: "Attackers can deliberately lock out real users (denial of service). Use short, progressive lockouts, per email+IP keys, CAPTCHA, and a reset path instead of permanent locks.",
        },
        {
          q: "What is credential stuffing?",
          a: "Trying email/password pairs leaked from other sites. Defenses: MFA, breached-password checks, per-account and per-IP limits, and bot detection.",
        },
        {
          q: "Which other endpoints need brute-force protection?",
          a: "OTP and 2FA verification, password reset, email/username existence checks, promo codes, and any endpoint where an attacker can guess a secret.",
        },
      ],
      spoken: `"For login I use layers. First, an IP rate limit on the route that only counts failed attempts. Second, a per-account failure counter in Redis: after about five failures I add a short temporary lock or growing delay, and I can show a CAPTCHA. I avoid permanent lockouts because attackers could lock out real users. Errors are always the generic 'invalid email or password', passwords are bcrypt-hashed, and MFA is the strongest protection against credential stuffing. I apply the same thinking to OTP verification and password reset, since a six-digit code is easy to brute force without limits."`,
      mistakes: [
        "Only limiting by IP — attackers use thousands of IPs. Also count failures per account.",
        "Permanent lockouts that let attackers lock out any user they choose.",
        "Forgetting to limit OTP verification, so a 6-digit code can be brute-forced in minutes.",
        "Follow-up trap: \"Does a generic error message really matter?\" Yes. Different messages (\"user not found\" vs \"wrong password\") let attackers build a list of valid accounts to target.",
      ],
      takeaway: 'Layer IP limits, per-account backoff, CAPTCHA and MFA — and never let lockouts become a weapon.',
    },
    {
      id: 'security-helmet-sanitization',
      title: 'Security basics: helmet, input sanitization, NoSQL injection, XSS',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'helmet sets safe HTTP headers; validation and sanitization block NoSQL injection and XSS; plus limits, HTTPS, secrets and dependency updates.',
      what: `Express is minimal, so security is **your** job. The basics:

- **helmet**: one middleware that sets many security-related HTTP headers.
- **Validation + sanitization**: only accept the shape you expect, and remove dangerous parts.
- **NoSQL injection**: an attacker sends an object instead of a string, like \`{"password": {"$ne": null}}\`, which matches any password.
- **XSS (cross-site scripting)**: an attacker stores \`<script>\` in a comment and it runs in other users' browsers.

#### Deeper version
**helmet** sets headers such as:
- \`Content-Security-Policy\` — which scripts, styles and images the browser may load. Strongest XSS defense.
- \`Strict-Transport-Security\` (HSTS) — always use HTTPS.
- \`X-Content-Type-Options: nosniff\` — don't guess content types.
- \`X-Frame-Options\` / CSP \`frame-ancestors\` — stop clickjacking (your site in a hidden iframe).
- It also removes \`X-Powered-By: Express\`, so you don't advertise your stack.

**NoSQL injection in MongoDB:** happens when user input becomes a query object. Defenses:
- Validate types: password must be a **string** (zod/Joi).
- Mongoose's \`sanitizeFilter\` option (Mongoose 6+) wraps \`$\`-keys in user filters with \`$eq\`.
- Never pass \`req.body\` or \`req.query\` straight into \`find()\`. Avoid \`$where\`.
- \`express-mongo-sanitize\` was a popular fix, but it modifies \`req.query\`, which is read-only in Express 5 — check its current docs or sanitize your own copy.

**XSS:** React escapes output by default, so the main risks are \`dangerouslySetInnerHTML\`, rendering user HTML, and user-uploaded HTML/SVG. Sanitize rich HTML with **DOMPurify** (or \`sanitize-html\` on the server), and add a CSP. Old packages like \`xss-clean\` are deprecated; don't rely on them.

**Other checklist items** (OWASP-style): HTTPS everywhere; body size limits; rate limiting; secrets in env/secret manager; \`npm audit\` and Dependabot; least-privilege DB users; parameterized SQL; careful CORS; httpOnly cookies; no stack traces in responses; authorization checks on every resource (IDOR).`,
      why: `Most real breaches come from simple mistakes: a missing header, a query built from raw input, an unescaped comment, an old dependency. These basics take minutes to add and close the most common attack paths. Interviewers ask about them to see if you build APIs that are safe by default.`,
      analogy: `Securing an Express app is like securing a house. helmet is the set of standard locks and window grills that come in one kit. Validation is checking ID at the door. Sanitization is going through deliveries to remove anything dangerous. CSP is a rule that only people on the guest list may speak at the party, so a stranger's shouted instructions are ignored.`,
      code: [
        {
          title: 'helmet with a custom CSP',
          lang: 'javascript',
          code: `import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // merged with helmet's safe defaults
      'script-src': ["'self'", 'https://js.stripe.com'],
      'frame-src': ["'self'", 'https://js.stripe.com'],
      'img-src': ["'self'", 'data:', 'https://my-bucket.s3.amazonaws.com'],
    },
  },
}));

app.use(express.json({ limit: '100kb' }));
app.get('/', (req, res) => res.send('secure headers on'));
app.listen(3000);`,
        },
        {
          title: 'NoSQL injection: the bug and the fixes',
          lang: 'javascript',
          code: `import mongoose from 'mongoose';
import { z } from 'zod';

// BAD: attacker sends { "email": "admin@x.com", "password": { "$ne": null } }
app.post('/login-bad', async (req, res) => {
  const user = await User.findOne({ email: req.body.email, password: req.body.password });
  res.json({ loggedIn: Boolean(user) }); // true without knowing the password!
});

// FIX 1: validate types, so objects are rejected
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

// FIX 2: Mongoose turns {"$ne": null} in filters into a literal value match
mongoose.set('sanitizeFilter', true);

// FIX 3: never compare passwords in the query; fetch by email, then bcrypt.compare
app.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const user = await User.findOne({ email: parsed.data.email }).select('+password');
  const ok = user && (await bcrypt.compare(parsed.data.password, user.password));
  res.status(ok ? 200 : 401).json({ loggedIn: Boolean(ok) });
});`,
        },
      ],
      output: `With helmet, every response includes headers like \`Content-Security-Policy\`, \`Strict-Transport-Security\` and \`X-Content-Type-Options: nosniff\`, and the \`X-Powered-By\` header disappears. The browser will only run scripts from your own origin and Stripe's.

In the injection example, \`/login-bad\` returns \`{"loggedIn":true}\` for the attacker because \`{"$ne": null}\` means "password is not null", which matches the admin. The fixed route rejects the request at the zod step (password must be a string), and even if it got through, \`sanitizeFilter\` and the bcrypt comparison stop it.`,
      questions: [
        {
          q: "What does helmet do?",
          a: "It sets security HTTP headers like Content-Security-Policy, HSTS, X-Content-Type-Options and frame protections, and removes `X-Powered-By`. It's a quick, safe default layer.",
        },
        {
          q: "What is NoSQL injection and how do you prevent it in Express + MongoDB?",
          a: "User input becomes a query operator, like `{ $ne: null }`. Prevent it with type validation, Mongoose `sanitizeFilter`, never passing raw `req.body` into queries, and avoiding `$where`.",
        },
        {
          q: "How do you prevent XSS?",
          a: "Escape output (React does by default), sanitize any user HTML with DOMPurify, set a strict Content-Security-Policy, use httpOnly cookies, and serve user uploads from a separate domain.",
        },
        {
          q: "Is helmet enough to secure an Express app?",
          a: "No. Headers are one layer. You still need validation, auth, authorization checks, rate limiting, HTTPS, secret management and dependency updates.",
        },
        {
          q: "How do you keep dependencies secure?",
          a: "Run `npm audit`, enable Dependabot or Renovate, pin versions with a lockfile, remove unused packages, and update regularly.",
        },
      ],
      spoken: `"Security in Express is layered. I start with helmet, which sets headers like Content-Security-Policy, HSTS and nosniff and hides X-Powered-By. Then every input is validated with zod, which also stops NoSQL injection — if a password must be a string, an object like \`$ne: null\` is rejected. I also enable Mongoose's sanitizeFilter and never pass raw request objects into queries. For XSS, React escapes by default, I sanitize any rich HTML with DOMPurify and rely on CSP. On top of that: body limits, rate limiting, httpOnly cookies, secrets in a secret manager, authorization checks on every resource, and regular npm audit."`,
      mistakes: [
        "Thinking `app.use(helmet())` makes the app secure. It only sets headers.",
        "Passing `req.query` straight into `Model.find(req.query)` — attackers can inject operators and filters.",
        "Using deprecated packages like `xss-clean` or `csurf` as a magic fix.",
        "Copy-pasting a CSP that breaks Stripe or Google Fonts, then disabling CSP completely instead of adding the right sources.",
        "Follow-up trap: \"Does Mongoose's schema protect against injection?\" Partly — casting helps for typed fields, but query filters can still contain operators. Validate input and use `sanitizeFilter`.",
      ],
      takeaway: 'helmet for headers, validation for input, sanitizeFilter for Mongo, CSP + escaping for XSS — security is layers.',
    },
    {
      id: 'csrf-protection',
      title: 'CSRF protection',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'CSRF tricks a logged-in browser into sending a request it did not mean to. It matters when you use cookies for auth; defend with SameSite cookies, CSRF tokens and Origin checks.',
      what: `**CSRF (Cross-Site Request Forgery)**: you are logged in to \`bank.com\` (cookie stored). You visit \`evil.com\`, which has a hidden form that posts to \`bank.com/transfer\`. Your browser **automatically attaches the bank cookie**, so the bank thinks you made the request.

The attacker can't **read** the response (CORS stops that), but they don't need to — the money already moved.

**When does it matter?** When the browser sends credentials automatically: **cookies** (sessions or JWT-in-cookie). If your API only uses an \`Authorization: Bearer\` header set by your JavaScript, classic CSRF does not apply, because the browser won't add that header for another site.

#### Deeper version
Defenses (use more than one):
1. **SameSite cookies**: \`SameSite=Lax\` (a common browser default now) stops cookies on cross-site POSTs; \`Strict\` blocks even cross-site links. It is a strong base defense, but not complete (old browsers, same-site subdomains, and GET routes that change data).
2. **CSRF token**:
   - **Synchronizer token**: server stores a random token in the session and the client must send it back in a header or form field.
   - **Double-submit cookie**: token in a cookie and in a header; the server checks they match. Use a **signed** (HMAC) token tied to the session, so an attacker who can set cookies on a subdomain can't fake it.
3. **Check \`Origin\` / \`Referer\`** on unsafe methods against your allow-list.
4. **Never change state with GET.** Safe methods (GET, HEAD, OPTIONS) must not modify data.
5. Requiring a **custom header** (like \`X-Requested-With\`) helps, because cross-site forms can't set custom headers and cross-site fetch with custom headers needs a CORS preflight.

The old \`csurf\` package is **deprecated** (archived in 2022). Use a maintained alternative such as \`csrf-csrf\` (double-submit) or \`csrf-sync\` (synchronizer) — check their current docs — or implement the small pattern below.`,
      why: `Cookie-based auth is common and often recommended (httpOnly cookies protect against token theft by XSS). But it brings CSRF back. Without protection, any website your users visit could perform actions as them: change email, transfer money, delete data.`,
      analogy: `Your browser is like a loyal assistant who always shows your company badge (cookie) at the bank. A stranger hands the assistant a form saying "transfer money" — and the assistant, being helpful, takes it to the bank and shows your badge. A CSRF token is a secret password you only told your own assistant: forms from strangers don't have it, so the bank refuses them.`,
      code: [
        {
          title: 'Synchronizer token with express-session',
          lang: 'javascript',
          code: `import express from 'express';
import session from 'express-session';
import crypto from 'node:crypto';

const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, sameSite: 'lax' }, // layer 1
}));

// Give the front-end a token tied to its session
app.get('/csrf-token', (req, res) => {
  req.session.csrfToken ??= crypto.randomBytes(32).toString('hex');
  res.json({ csrfToken: req.session.csrfToken });
});

// Check the token on every state-changing request
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
function csrfProtection(req, res, next) {
  if (SAFE.has(req.method)) return next();
  const sent = Buffer.from(String(req.get('X-CSRF-Token') || ''));
  const expected = Buffer.from(String(req.session.csrfToken || ''));
  const valid = expected.length > 0 && sent.length === expected.length
    && crypto.timingSafeEqual(sent, expected); // constant-time compare
  if (!valid) return res.status(403).json({ error: 'Invalid CSRF token' });
  next();
}
app.use(csrfProtection);

app.post('/account/email', (req, res) => res.json({ updated: true }));
app.listen(3000);`,
        },
        {
          title: 'Front-end sends the token in a header',
          lang: 'javascript',
          code: `// Browser code on your own site
const { csrfToken } = await (await fetch('/csrf-token', { credentials: 'include' })).json();

await fetch('/account/email', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  body: JSON.stringify({ email: 'new@example.com' }),
});`,
        },
      ],
      output: `Your own front-end first fetches a token, then sends it in \`X-CSRF-Token\` with the POST. The middleware compares it to the token in the session using a constant-time comparison and lets the request through: \`{"updated":true}\`.

A hidden form on \`evil.com\` that posts to \`/account/email\` cannot read your token (CORS blocks reading \`/csrf-token\`), and an HTML form can't set custom headers. Even if the browser attached the cookie, the request gets 403 "Invalid CSRF token". With \`sameSite: 'lax'\`, the browser usually won't attach the cookie to that cross-site POST at all.`,
      questions: [
        {
          q: "What is CSRF?",
          a: "An attack where another site makes the user's browser send an authenticated request (with cookies attached automatically) to your site, performing an action the user didn't intend.",
        },
        {
          q: "Do you need CSRF protection with JWT?",
          a: "If the JWT is sent in an `Authorization` header from JavaScript, classic CSRF doesn't apply. If the JWT is stored in a cookie, yes — it's sent automatically, so you need CSRF defenses.",
        },
        {
          q: "How does SameSite help?",
          a: "`Lax` stops cookies on cross-site POST and other unsafe requests (top-level GET links still send them). `Strict` stops all cross-site sends. It's a strong first layer, best combined with tokens or Origin checks.",
        },
        {
          q: "What is the double-submit cookie pattern?",
          a: "The server sets a random token in a cookie and the client must also send it in a header. Since another site can't read your cookies, it can't copy the value into the header. Sign the token and tie it to the session for extra safety.",
        },
        {
          q: "What replaced csurf?",
          a: "csurf is deprecated. Teams use maintained packages like csrf-csrf or csrf-sync, or implement a synchronizer/double-submit token themselves, plus SameSite cookies and Origin checks.",
        },
      ],
      spoken: `"CSRF is when another website makes the user's browser send a request to my site, and the browser automatically attaches my auth cookie. It matters whenever I use cookie-based auth. If tokens go in an Authorization header set by JavaScript, classic CSRF doesn't apply. My defenses are layered: SameSite Lax or Strict cookies, never changing state on GET, checking the Origin header, and a CSRF token — either a synchronizer token stored in the session or a signed double-submit cookie — sent back in a custom header and compared in constant time. The old csurf package is deprecated, so I'd use a maintained library or this small pattern."`,
      mistakes: [
        "Thinking CORS prevents CSRF. CORS stops reading the response; a simple cross-site form POST still reaches the server and runs.",
        "Changing data in GET routes (`GET /delete-account`), which even SameSite=Lax doesn't fully protect.",
        "Still installing `csurf` in new projects — it's deprecated.",
        "Follow-up trap: \"Is SameSite=Lax alone enough?\" Often close, but not for older browsers, attacks from a same-site subdomain, or state-changing GETs. Add tokens or Origin checks for sensitive actions.",
      ],
      takeaway: 'Cookie auth needs CSRF defense: SameSite cookies + CSRF token/Origin check, and never mutate state with GET.',
    },
    {
      id: 'streaming-sse',
      title: 'Streaming responses and Server-Sent Events (LLM output, big files)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Send data in pieces as it becomes ready: stream files with pipeline, and stream LLM tokens to the browser with Server-Sent Events. Stop work when the client disconnects.',
      what: `Normally you build the whole response and send it at once with \`res.json()\`. **Streaming** means sending it **in pieces** while you are still producing it.

Two common cases:
- **Big files / exports**: stream a file or CSV to the client instead of loading it all into memory.
- **LLM chat**: show the AI's answer word by word, like ChatGPT, instead of waiting 20 seconds for the full reply.

**Server-Sent Events (SSE)** is a simple standard for server → browser streaming over normal HTTP. The response has \`Content-Type: text/event-stream\`, and each message looks like \`data: ...\` followed by a blank line. The browser can read it with \`EventSource\` (GET only) or with \`fetch\` and a stream reader (works with POST too).

#### Deeper version
Because \`res\` is a writable stream, you can call \`res.write(chunk)\` many times and \`res.end()\` at the end.

Important details:
- Call \`res.flushHeaders()\` so headers go out right away.
- **Client disconnects**: listen for \`res.on('close')\` and stop the work — clear timers and **abort the upstream LLM request** with an \`AbortController\`. Otherwise you keep paying for tokens nobody reads.
- **Backpressure**: if the client is slow, \`res.write()\` returns \`false\`. Use \`stream.pipeline()\` for file streams; it handles backpressure and errors, and cleans up.
- **Compression and proxies buffer**: the \`compression\` middleware and Nginx can hold chunks back. Call \`res.flush()\` when using compression, or skip it for this route; for Nginx, the \`X-Accel-Buffering: no\` header disables buffering.
- **Timeouts**: load balancers close idle connections (often 60 seconds). Send a comment line like \`: ping\` every 15-30 seconds as a heartbeat.
- **Errors after streaming starts**: headers are already sent, so you can't send a 500. Send an \`event: error\` message and end the stream.

**SSE vs WebSockets:** SSE is one-way (server → client), plain HTTP, auto-reconnects with EventSource, and is great for notifications and AI tokens. WebSockets are two-way and better for chat rooms, games and collaboration.`,
      why: `Users feel an app is fast when they see output quickly. Streaming AI tokens drops the "time to first word" from many seconds to under one. For big downloads, streaming keeps memory flat: a 2 GB file uses a few KB of RAM instead of 2 GB.`,
      analogy: `A normal response is a restaurant bringing all courses at once after an hour. Streaming is serving each dish as it's ready. If the customer leaves early (client disconnect), the kitchen should stop cooking — that's aborting the upstream LLM request.`,
      code: [
        {
          title: 'SSE endpoint that streams tokens and stops on disconnect',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

// Fake LLM: yields words slowly (replace with your SDK's streaming call)
async function* fakeLlmStream(prompt, signal) {
  for (const word of \`You asked: \${prompt}. Here is a streamed answer.\`.split(' ')) {
    if (signal.aborted) return;
    await new Promise((r) => setTimeout(r, 150));
    yield word + ' ';
  }
}

app.get('/api/chat/stream', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // tell Nginx not to buffer
  });
  res.flushHeaders();

  const controller = new AbortController();
  res.on('close', () => controller.abort()); // client left -> stop the work

  try {
    for await (const token of fakeLlmStream(String(req.query.q || 'hi'), controller.signal)) {
      res.write(\`data: \${JSON.stringify({ token })}\\n\\n\`);
    }
    res.write('event: done\\ndata: {}\\n\\n');
  } catch (err) {
    res.write(\`event: error\\ndata: \${JSON.stringify({ message: 'Stream failed' })}\\n\\n\`);
  } finally {
    res.end();
  }
});

app.listen(3000);`,
        },
        {
          title: 'Streaming a big file with pipeline',
          lang: 'javascript',
          code: `import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';

app.get('/export.csv', async (req, res, next) => {
  res.set('Content-Type', 'text/csv');
  res.attachment('export.csv'); // download with this file name
  try {
    await pipeline(fs.createReadStream('./big-export.csv'), res); // backpressure handled
  } catch (err) {
    if (!res.headersSent) return next(err);
    res.destroy(err); // mid-stream failure: just close the connection
  }
});`,
        },
      ],
      output: `Opening \`/api/chat/stream?q=pricing\` in the browser (or with \`curl -N\`) shows lines like \`data: {"token":"You "}\` arriving every 150 ms, then \`event: done\`. If the user closes the tab, \`close\` fires, the controller aborts, and the generator stops — no more work (or tokens billed upstream).

The CSV route streams the file chunk by chunk with constant memory use. \`pipeline\` pauses reading when the client is slow, and cleans up both streams if anything fails.`,
      questions: [
        {
          q: "How would you stream an LLM response from Express to React?",
          a: "Use SSE: set `Content-Type: text/event-stream`, flush headers, `res.write` each token as `data: ...` followed by a blank line, and end with a done event. The client reads it with EventSource or fetch + a stream reader.",
        },
        {
          q: "What happens if the client disconnects mid-stream?",
          a: "`res` emits `close`. You should abort the upstream work (LLM call, DB cursor) with an AbortController and clear timers, otherwise you waste resources and money.",
        },
        {
          q: "SSE or WebSockets?",
          a: "SSE for one-way server-to-client updates over plain HTTP (AI tokens, notifications). WebSockets for two-way, low-latency communication (chat rooms, games, collaboration).",
        },
        {
          q: "Why use stream.pipeline instead of .pipe?",
          a: "`pipeline` forwards errors and cleans up all streams, and the promise version works nicely with async/await. `.pipe` does not handle errors for you, which can leak file handles.",
        },
      ],
      spoken: `"For AI features I stream responses with Server-Sent Events. I set the event-stream content type, flush the headers, and write each token as a data line. I always listen for the response close event and abort the upstream LLM request with an AbortController, so we don't pay for tokens nobody reads. I make sure compression and Nginx don't buffer the stream, and I send heartbeats so load balancers don't cut idle connections. For big file downloads I use stream pipeline, which handles backpressure and errors. SSE is enough for one-way streaming; I'd pick WebSockets when I need real two-way messaging."`,
      mistakes: [
        "Not aborting the upstream LLM call when the user leaves — wasted tokens and money.",
        "Leaving `compression()` or proxy buffering on, so tokens arrive in big delayed batches.",
        "Reading a whole large file into memory with `fs.readFile` and `res.send`, instead of streaming it.",
        "Follow-up trap: \"Can you send a 500 after streaming has started?\" No — the status and headers were already sent. Send an error event in the stream, then end it.",
      ],
      takeaway: 'Stream with res.write/pipeline, use SSE for AI tokens, and always stop work when the client disconnects.',
    },
    {
      id: 'production-graceful-shutdown',
      title: 'Running Express in production (trust proxy, graceful shutdown, health checks, scaling)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Set NODE_ENV and trust proxy, add health checks, tune keep-alive timeouts behind a load balancer, shut down gracefully on SIGTERM, and scale with multiple processes or containers.',
      what: `Running \`node server.js\` on your laptop is different from production. The checklist:

1. **\`NODE_ENV=production\`**: Express and many libraries behave more efficiently and show fewer error details.
2. **\`trust proxy\`**: behind Nginx or an AWS/GCP load balancer, set \`app.set('trust proxy', 1)\` so \`req.ip\`, \`req.protocol\` and secure cookies work.
3. **Health checks**: a cheap \`/health\` endpoint so the load balancer or Kubernetes knows the instance is alive (and a readiness check that it can serve traffic).
4. **Graceful shutdown**: when the platform sends **SIGTERM** (deploy, scale-down), stop taking new requests, finish the current ones, close the DB, then exit.
5. **Scaling**: Node uses one CPU core per process. Run several processes (PM2 cluster mode, Node's \`cluster\` module) or, more commonly today, several containers behind a load balancer.

#### Deeper version
**Graceful shutdown details:**
- \`server.close()\` stops accepting new connections and calls back when existing ones finish. Keep-alive connections can keep it open, so newer Node versions provide \`server.closeIdleConnections()\` (and recent versions close idle ones automatically on \`close()\`) — check your Node version.
- Mark readiness as failing first, so the load balancer stops sending traffic.
- Add a **hard timeout** (e.g. 10 seconds) that force-exits if something hangs.
- Close Mongo/Redis connections, flush logs, stop queue consumers.

**Keep-alive timeouts behind a load balancer:** Node's default \`keepAliveTimeout\` is 5 seconds; AWS ALB's idle timeout defaults to 60 seconds. If Node closes a connection the ALB still thinks is open, users get random **502 errors**. Fix: set \`server.keepAliveTimeout\` higher than the LB idle timeout (e.g. 65s) and \`server.headersTimeout\` a bit higher still.

**Stateless instances:** store sessions, rate limits and caches in Redis, and files in S3, so any instance can serve any request and you can scale horizontally.

**Process crashes:** on \`uncaughtException\`, log and exit; let PM2/Docker/Kubernetes restart the process. Don't try to keep running in an unknown state.

**Performance tips:** avoid sync APIs in handlers, cache hot reads (Redis), paginate, use \`.lean()\` for Mongoose reads, move CPU-heavy work to worker threads or a queue (BullMQ), and let a CDN serve static files.`,
      why: `Most production incidents in Node apps are not business-logic bugs — they are dropped requests during deploys, random 502s from timeout mismatches, wrong client IPs, lost sessions after scaling, or one CPU-heavy request freezing a whole instance. This checklist prevents them.`,
      analogy: `Graceful shutdown is closing a restaurant properly: lock the front door (no new customers), let the people already eating finish their meal, clean the kitchen (close DB connections), then turn off the lights. Pulling the main power switch mid-dinner (process.exit) leaves customers with half-cooked food (failed requests).`,
      code: [
        {
          title: 'server.js with health checks and graceful shutdown',
          lang: 'javascript',
          code: `import mongoose from 'mongoose';
import { app } from './app.js';

let isShuttingDown = false;

// Liveness: process is up. Readiness: can take traffic.
app.get('/health/live', (req, res) => res.json({ ok: true }));
app.get('/health/ready', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(!isShuttingDown && dbUp ? 200 : 503).json({ dbUp, isShuttingDown });
});
// (In a real app, register these routes in app.js before the 404 handler.)

await mongoose.connect(process.env.MONGO_URI);
const server = app.listen(process.env.PORT || 3000);

// Behind an AWS ALB (60s idle timeout): keep Node's timeouts longer
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(\`\${signal} received, shutting down gracefully\`);

  setTimeout(() => process.exit(1), 10_000).unref(); // hard limit

  server.close(async (err) => {             // stop new connections, wait for current ones
    await mongoose.connection.close();       // then close the database
    process.exit(err ? 1 : 0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker / Kubernetes / ECS
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C locally
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception', err);
  shutdown('uncaughtException');
});`,
        },
        {
          title: 'Using all CPU cores with PM2',
          lang: 'bash',
          code: `# Run one process per CPU core, restart on crash, zero-downtime reload
npm install -g pm2
NODE_ENV=production pm2 start src/server.js -i max --name api
pm2 reload api     # rolling restart for a deploy
pm2 logs api

# In Docker/Kubernetes you usually run ONE process per container
# and scale the number of containers instead.`,
        },
      ],
      output: `During a deploy, Kubernetes or ECS sends SIGTERM. The app sets \`isShuttingDown\`, so \`/health/ready\` returns 503 and the load balancer stops routing new traffic. \`server.close\` lets in-flight requests finish, then the Mongo connection closes and the process exits with code 0. If something hangs, the 10-second timer force-exits. Users see no failed requests during the deploy.

The longer keep-alive timeout stops the random 502s that happen when Node closes a connection before the ALB does. PM2's \`-i max\` starts one worker per CPU core on a VM.`,
      questions: [
        {
          q: "What is graceful shutdown and why does it matter?",
          a: "On SIGTERM, stop accepting new requests, let in-flight ones finish, close DB and other connections, then exit. Without it, every deploy or scale-down drops active requests.",
        },
        {
          q: "What does app.set('trust proxy', 1) do?",
          a: "It tells Express to trust one proxy hop, so `req.ip`, `req.protocol` and `req.secure` come from the `X-Forwarded-*` headers. Needed behind Nginx or a cloud load balancer for correct IPs and secure cookies.",
        },
        {
          q: "How do you scale an Express app?",
          a: "Keep instances stateless (sessions/rate limits in Redis, files in S3), then run multiple processes or containers behind a load balancer. Use PM2 cluster mode on a VM, or more containers/pods in ECS, Cloud Run or Kubernetes.",
        },
        {
          q: "Why do you see random 502 errors behind an AWS ALB?",
          a: "Often Node's keep-alive timeout (5s default) is shorter than the ALB idle timeout (60s default), so Node closes connections the ALB reuses. Set `keepAliveTimeout` above the LB timeout and `headersTimeout` above that.",
        },
        {
          q: "What is the difference between liveness and readiness checks?",
          a: "Liveness says the process is alive (restart it if not). Readiness says it can serve traffic right now (DB connected, not shutting down); if not, the load balancer stops sending requests but doesn't restart it.",
        },
      ],
      spoken: `"In production I run with NODE_ENV production and set trust proxy because we're behind a load balancer, so client IPs and secure cookies work. I expose liveness and readiness endpoints. On SIGTERM I do a graceful shutdown: readiness starts failing, \`server.close\` lets in-flight requests finish, I close Mongo and Redis, and there's a hard timeout as a safety net. Behind an AWS ALB I raise keepAliveTimeout above sixty seconds to avoid random 502s. Instances are stateless — sessions and rate limits in Redis, files in S3 — so I can scale horizontally with more containers, or PM2 cluster mode on a VM."`,
      mistakes: [
        "Calling `process.exit()` immediately on SIGTERM, dropping every in-flight request during deploys.",
        "Keeping sessions or uploads in memory/local disk, which breaks as soon as you run two instances.",
        "Running PM2 cluster mode inside every Kubernetes pod as well as scaling pods — usually one process per container is cleaner.",
        "Follow-up trap: \"Should you keep the process running after an uncaughtException?\" No. State may be corrupt. Log it, shut down gracefully, and let the orchestrator restart a clean process.",
      ],
      takeaway: 'Production Express = trust proxy, health checks, graceful SIGTERM shutdown, tuned timeouts and stateless horizontal scaling.',
    },
    {
      id: 'express-5-migration',
      title: 'Express 5: what changed from Express 4',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Express 5 forwards rejected promises to error handlers, uses stricter route path syntax, makes req.query read-only, removes old APIs, and requires a modern Node version.',
      what: `**Express 5** became the stable major version after about ten years of Express 4 (5.0 released in late 2024). Most code works the same, but some changes break old apps.

The big ones:
1. **Async errors**: rejected promises from handlers and middleware go to \`next(err)\` automatically. No more \`express-async-errors\` or wrapper needed.
2. **Route path syntax**: wildcards need a name (\`/*splat\`), optional parts use braces (\`/:file{.:ext}\`), and regex characters in path strings are not supported. This comes from an upgraded \`path-to-regexp\`.
3. **\`req.query\` is a getter**: you can't reassign it. Libraries that overwrite it (some sanitize packages) can break.
4. **\`req.body\`** is \`undefined\` when no body parser ran (it used to default to \`{}\`).
5. **Removed old APIs**: \`app.del()\` (use \`app.delete()\`), \`req.param(name)\`, \`res.sendfile()\` (use \`res.sendFile()\`), \`res.json(obj, status)\` and \`res.send(status)\` signatures, and the magic \`res.redirect('back')\`.
6. **Node.js 18 or newer** is required.

#### Deeper version
More details worth knowing:
- \`res.status()\` only accepts valid integer status codes (100-999); invalid ones throw.
- \`express.urlencoded()\` defaults to \`extended: false\`.
- \`res.clearCookie\` ignores \`maxAge\` and \`expires\` options.

**How to upgrade safely:**
1. Have good integration tests (supertest) first.
2. Read the official migration guide — there is also an official codemod package that rewrites some removed APIs automatically. Check the guide for the current command.
3. Search the codebase for \`*\` routes, \`req.param(\`, \`app.del(\`, \`res.send(<number>)\`, \`'back'\`, and any code that assigns \`req.query\`.
4. Check each middleware library's Express 5 compatibility.
5. Remove \`express-async-errors\` and async wrappers once tests pass.

Many existing codebases are still on Express 4, so know both. Exact defaults can change in minor versions; when in doubt, check the current docs.`,
      why: `Interviewers ask this to see whether your Express knowledge is current. It also comes up in real work: upgrading a production API needs knowing which changes are silent (req.body default, urlencoded default) and which crash on startup (wildcard paths).`,
      analogy: `Express 4 to 5 is like a new edition of a textbook. Most chapters are the same, a confusing chapter was rewritten (async errors now just work), some old shortcuts were removed, and a few page numbers moved (route path syntax). If you only memorize the old page numbers, you'll get lost.`,
      code: [
        {
          title: 'Express 4 code and its Express 5 version',
          lang: 'javascript',
          code: `// ---------- Express 4 ----------
// app.get('*', handler);                      // bare wildcard
// app.get('/files/*', (req, res) => res.send(req.params[0]));
// app.del('/items/:id', remove);
// res.send(404);                              // status as body
// res.json({ ok: true }, 201);                // old signature
// app.get('/x', asyncHandler(async (req, res) => { ... }));

// ---------- Express 5 ----------
import express from 'express';
const app = express();

app.get('/files/*filepath', (req, res) => {
  // named wildcard; the value is an array of path segments
  res.json({ parts: req.params.filepath });
});

app.delete('/items/:id', (req, res) => res.sendStatus(204));

app.get('/x', async (req, res) => {
  const data = await Promise.reject(new Error('DB down')); // goes to error handler
  res.json(data);
});

app.use((req, res) => res.status(404).json({ error: 'Not found' })); // catch-all without '*'
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

app.listen(3000);`,
        },
      ],
      output: `\`GET /files/docs/2024/report.pdf\` returns \`{"parts":["docs","2024","report.pdf"]}\` — in Express 5 a named wildcard captures the segments as an array. \`DELETE /items/3\` returns 204. \`GET /x\` rejects, and Express 5 sends the error to the error handler automatically, returning 500 with "DB down" (in a real app, hide the message). Any unknown path hits the final \`app.use\` 404 handler, which needs no \`*\` at all.

Running the commented Express 4 lines on Express 5 would fail: the bare \`*\` path throws at startup, and \`app.del\` no longer exists.`,
      questions: [
        {
          q: "What are the main changes in Express 5?",
          a: "Automatic forwarding of rejected promises to error handlers, new route path syntax (named wildcards, braces for optional parts), read-only `req.query`, removed legacy APIs like `app.del` and `req.param`, and Node 18+.",
        },
        {
          q: "Why does app.get('*') break in Express 5?",
          a: "The newer path-to-regexp requires wildcards to be named, like `/*splat`. For a catch-all 404, just use `app.use((req, res) => ...)` at the end.",
        },
        {
          q: "How would you migrate a production API to Express 5?",
          a: "Write integration tests first, follow the official migration guide and codemod, fix wildcard routes and removed APIs, check middleware compatibility (especially anything that writes `req.query`), then remove async-error wrappers.",
        },
        {
          q: "Is Express 5 much faster than Express 4?",
          a: "Not dramatically; the release focused on cleanup, security and modern Node support rather than raw speed. If performance is the main goal, profile first, and consider Fastify.",
        },
      ],
      spoken: `"Express 5 is now the stable version. The headline change is that rejected promises from async handlers and middleware are forwarded to the error handler automatically, so wrappers and express-async-errors aren't needed. Route paths changed because of a newer path-to-regexp: wildcards must be named, like slash star splat, and optional segments use braces. \`req.query\` became a getter, which broke some sanitizer middleware, and legacy APIs like app.del and req.param were removed. It needs Node 18 or newer. When migrating, I'd add integration tests first, follow the migration guide and codemod, and fix wildcard routes and middleware compatibility."`,
      mistakes: [
        "Assuming every Express 4 middleware works unchanged in Express 5 — check ones that modify `req.query` or rely on removed APIs.",
        "Keeping `app.get('*', ...)` catch-alls; use a final `app.use` instead.",
        "Claiming Express 5 catches errors in setTimeout or event-emitter callbacks. It only handles the promise your handler returns.",
        "Follow-up trap: \"Is Express 5 production ready?\" Yes, it's the stable release line, but many existing apps remain on Express 4, so interviewers may expect you to know both.",
      ],
      takeaway: 'Express 5: async errors handled, stricter paths, read-only req.query, legacy APIs gone — test, then migrate.',
    },
  ],
  rapidFire: [
    { q: 'What is Express in one line?', a: 'A minimal, unopinionated web framework for Node.js that adds routing, middleware and req/res helpers on top of the http module.' },
    { q: 'What does app.listen() return?', a: 'A Node `http.Server` instance.' },
    { q: 'What is the middleware signature?', a: '`(req, res, next)`; error-handling middleware is `(err, req, res, next)`.' },
    { q: 'How does Express recognize error-handling middleware?', a: 'By its four declared parameters.' },
    { q: 'What happens if middleware neither responds nor calls next()?', a: 'The request hangs until it times out.' },
    { q: 'What does next(\'route\') do?', a: 'Skips the remaining handlers of the current route and moves to the next matching route.' },
    { q: 'req.params vs req.query?', a: 'params are named path segments (`/users/:id`); query is the part after `?`. Both are strings.' },
    { q: 'app.use vs app.get?', a: '`app.use` matches any method and any path starting with the prefix; `app.get` matches only GET on the exact path.' },
    { q: 'What is express.Router?', a: 'A mini app with its own routes and middleware that you mount on a path prefix.' },
    { q: 'Does route order matter?', a: 'Yes. The first matching route that responds wins, so specific routes go before dynamic ones.' },
    { q: 'Why is req.body undefined?', a: 'No body parser, parser registered after the route, or a wrong/missing Content-Type header.' },
    { q: 'Default JSON body size limit?', a: '`100kb`; larger bodies get 413.' },
    { q: 'Which parser do Stripe webhooks need?', a: '`express.raw({ type: \'application/json\' })` on that route, before the global `express.json()`.' },
    { q: 'res.send vs res.json?', a: '`res.json` always sends JSON; `res.send` guesses the content type from the value.' },
    { q: 'What causes ERR_HTTP_HEADERS_SENT?', a: 'Sending a second response for the same request, usually a missing `return`.' },
    { q: '401 vs 403?', a: '401 = not authenticated; 403 = authenticated but not allowed.' },
    { q: 'Which status for a created resource?', a: '201 Created, ideally with a Location header.' },
    { q: 'Where do the 404 and error handlers go?', a: 'At the very end: 404 handler, then the error handler.' },
    { q: 'Does Express 4 catch rejected promises?', a: 'No. Use try/catch, an asyncHandler wrapper, or express-async-errors.' },
    { q: 'Does Express 5 catch rejected promises?', a: 'Yes. Rejections from handlers and middleware are forwarded to `next(err)` automatically.' },
    { q: 'Does Express 5 catch errors inside setTimeout callbacks?', a: 'No. Catch them yourself and call `next(err)`.' },
    { q: 'How do you write a catch-all route in Express 5?', a: 'A named wildcard like `/*splat`, or simply a final `app.use()` for 404s.' },
    { q: 'Is req.query writable in Express 5?', a: 'No, it is a getter. Store parsed values elsewhere, like `req.validated`.' },
    { q: 'Minimum Node version for Express 5?', a: 'Node.js 18 or newer.' },
    { q: 'What is mass assignment?', a: 'Saving raw `req.body` so attackers can set fields like `role`. Fix with schemas that strip unknown keys.' },
    { q: 'Why coerce query params?', a: 'They are always strings; `z.coerce.number()` turns `"2"` into `2`.' },
    { q: 'Is CORS enforced by the server?', a: 'No, by the browser. The server only sends permission headers; curl ignores CORS.' },
    { q: 'What is a preflight request?', a: 'An automatic OPTIONS request the browser sends before non-simple cross-origin requests.' },
    { q: 'Can you use origin "*" with credentials?', a: 'No. You must return the exact origin plus `Access-Control-Allow-Credentials: true`.' },
    { q: 'Cookie flags to always consider?', a: '`httpOnly`, `secure`, `sameSite`, and a lifetime (`maxAge`).' },
    { q: 'Are signed cookies encrypted?', a: 'No. They are tamper-proof but readable.' },
    { q: 'Why not use the default session MemoryStore in production?', a: 'It leaks memory, loses sessions on restart, and is not shared across instances.' },
    { q: 'How do you prevent session fixation?', a: 'Call `req.session.regenerate()` on login.' },
    { q: 'Is a JWT payload secret?', a: 'No. It is base64url-encoded and signed, not encrypted.' },
    { q: 'jwt.decode vs jwt.verify?', a: '`decode` only reads the payload; `verify` checks the signature and expiry. Always verify.' },
    { q: 'What is an IDOR bug?', a: 'Accessing another user\'s resource by changing an id because ownership is not checked.' },
    { q: 'Why bcrypt instead of SHA-256 for passwords?', a: 'bcrypt is salted and deliberately slow; SHA-256 is fast, which helps attackers.' },
    { q: 'Typical bcrypt cost factor?', a: 'Around 10-12, tuned so one hash takes roughly 100-300 ms.' },
    { q: 'Where does bcrypt store the salt?', a: 'Inside the hash string itself, along with the cost.' },
    { q: 'What does multer do?', a: 'Parses `multipart/form-data` uploads into `req.file`/`req.files` and `req.body`.' },
    { q: 'Most important multer option?', a: '`limits` (fileSize, files), plus a `fileFilter` allow-list.' },
    { q: 'Best way to upload large files in the cloud?', a: 'Pre-signed S3 URLs so the browser uploads directly to S3.' },
    { q: 'morgan vs winston?', a: 'morgan logs HTTP requests; winston is a general logger with levels and transports.' },
    { q: 'Why add a request id to logs?', a: 'To trace one request across all log lines and services.' },
    { q: 'Should Node or the proxy compress responses?', a: 'Either works; a CDN/Nginx often does it to save Node CPU.' },
    { q: 'What does helmet do?', a: 'Sets security headers (CSP, HSTS, nosniff, frame protection) and removes X-Powered-By.' },
    { q: 'Example of a NoSQL injection payload?', a: '`{ "password": { "$ne": null } }` sent instead of a string.' },
    { q: 'Mongoose option against operator injection?', a: '`sanitizeFilter`, plus validating that inputs are plain strings.' },
    { q: 'Is csurf still recommended?', a: 'No, it is deprecated. Use SameSite cookies plus a maintained token library or your own token check.' },
    { q: 'When do you need CSRF protection?', a: 'When auth is sent automatically by the browser, i.e. cookies.' },
    { q: 'Rate limit status code?', a: '429 Too Many Requests.' },
    { q: 'Why use Redis for rate limiting?', a: 'So all instances share one counter that survives restarts.' },
    { q: 'What does trust proxy affect?', a: '`req.ip`, `req.protocol`, `req.secure` and secure cookies behind a proxy.' },
    { q: 'Biggest risk of account lockout?', a: 'Attackers can lock out real users on purpose; prefer short, progressive delays and CAPTCHA.' },
    { q: 'Why separate app.js and server.js?', a: 'So tests can import the app with supertest without listening on a port.' },
    { q: 'Controller vs service?', a: 'Controller handles HTTP; service holds business logic with no req/res.' },
    { q: 'How do you stream LLM tokens to the browser?', a: 'Server-Sent Events: `text/event-stream`, `res.write` each `data:` line, abort upstream on `close`.' },
    { q: 'What should happen on SIGTERM?', a: 'Fail readiness, `server.close()`, finish in-flight requests, close DB connections, then exit.' },
    { q: 'Why random 502s behind AWS ALB?', a: 'Node keepAliveTimeout (5s) shorter than the ALB idle timeout (60s); raise it above the LB timeout.' },
    { q: 'How does Express use multiple CPU cores?', a: 'It doesn\'t by itself; run multiple processes (PM2 cluster) or containers behind a load balancer.' },
  ],
};
