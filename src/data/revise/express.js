// Revise MERN: Express.js. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'express',
  icon: '🚂',
  title: 'Express.js',
  note: 'Middleware, routing, errors, security, REST conventions and how to structure an Express API.',
  items: [
    {
      q: 'What is Express.js and why use it?',
      a: `**Express** is a minimal, unopinionated **web framework for Node.js**. It sits on top of Node's \`http\` module and adds routing, middleware, and helpers on \`req\` and \`res\` like \`res.json()\` and \`req.params\`.

People use it because it is simple, flexible and has a huge ecosystem of middleware for auth, CORS, logging and uploads. The downside of "unopinionated" is that you must decide the project structure, validation and error handling yourself. The current major version is **Express 5**.`,
    },
    {
      q: 'What is middleware in Express?',
      a: `**Middleware** is a function with the signature \`(req, res, next)\` that runs during the request-response cycle. It can read or change \`req\` and \`res\`, end the request by sending a response, or call \`next()\` to pass control to the next middleware.

Examples are body parsing, logging, CORS, auth checks and validation. You attach it globally with \`app.use()\`, to a path, to a router, or to a single route. If a middleware neither responds nor calls \`next()\`, the request just **hangs**.`,
    },
    {
      q: 'Why does middleware order matter?',
      a: `Express runs middleware **in the order you register it**, top to bottom. So anything that later code depends on must come first.

For example, \`express.json()\` must run before routes that read \`req.body\`; CORS and helmet should be near the top; auth middleware must come before the protected routes; the **404 handler** goes after all routes; and the **error-handling middleware goes last**. A common bug is putting a route above the auth middleware and accidentally making it public.`,
    },
    {
      q: 'How does error-handling middleware work?',
      a: `Error-handling middleware has **four arguments**: \`(err, req, res, next)\`. Express recognises it by that signature. When any middleware calls \`next(err)\` or throws, Express skips the normal middleware and jumps to the next error handler.

I register one **central error handler** at the end. It logs the error, maps known errors to status codes (like a validation error to 400), and returns a clean JSON message. In production it hides stack traces and internal details, returning a generic 500 for unknown errors.`,
    },
    {
      q: 'How are async errors handled in Express 4 vs Express 5?',
      a: `In **Express 4**, if an \`async\` route handler threw or its promise rejected, Express did not catch it. The request hung or you got an unhandled rejection, so you had to wrap handlers in \`try/catch\` with \`next(err)\`, or use a helper like \`express-async-handler\`.

In **Express 5**, a **rejected promise from a handler or middleware is automatically passed to \`next(err)\`**, so the central error handler gets it. Express 5 also changed route path syntax (for example wildcards must be named), removed some old methods, and requires Node 18+.`,
    },
    {
      q: 'What are req, res and next?',
      a: `\`req\` is the **request object**: \`req.params\` for route parameters like \`/users/:id\`, \`req.query\` for the query string, \`req.body\` for the parsed body, plus \`req.headers\`, \`req.cookies\` (with cookie-parser), and anything earlier middleware added, like \`req.user\`.

\`res\` is the **response**: \`res.status()\`, \`res.json()\`, \`res.send()\`, \`res.redirect()\`, \`res.cookie()\`. \`next\` is the function that hands control to the next middleware; \`next(err)\` jumps to error handling, and \`next('route')\` skips to the next matching route.`,
    },
    {
      q: 'What is express.Router and why use it?',
      a: `\`express.Router()\` creates a **mini-app** with its own routes and middleware, which you mount on a path with \`app.use('/api/users', userRouter)\`.

It keeps the code modular: one router per resource or feature, each in its own file. You can attach middleware to just that router, for example auth on all admin routes. Use \`Router({ mergeParams: true })\` if a nested router needs params from the parent path, like \`/projects/:projectId/tasks\`.`,
    },
    {
      q: 'How do you implement authentication middleware with JWT?',
      a: `The middleware reads the token from the \`Authorization: Bearer\` header or an **httpOnly cookie**, verifies it with \`jwt.verify\` using the secret or public key, and puts the decoded user on \`req.user\`. If it is missing, invalid or expired, it returns **401**.

A separate **authorisation** middleware then checks roles or permissions and returns **403** if the user is not allowed. In SkillKeepr the token also carried the company id, and each request was checked against the tenant, so a user from one company could never reach another's data.`,
    },
    {
      q: 'How do you handle CORS in Express?',
      a: `**CORS** is a browser rule: a page from one origin can only read responses from another origin if that server allows it with headers like \`Access-Control-Allow-Origin\`. For non-simple requests the browser first sends a **preflight** \`OPTIONS\` request.

In Express I use the \`cors\` package with an **explicit allow-list** of origins, not \`*\`, especially with \`credentials: true\` for cookies, where \`*\` is not even allowed. Remember CORS protects browsers only; it is not server-side security, so you still need auth.`,
    },
    {
      q: 'How do you parse request bodies?',
      a: `Express has built-in parsers: \`express.json()\` for JSON bodies and \`express.urlencoded({ extended: true })\` for HTML form data. They fill \`req.body\`. Without them, \`req.body\` is \`undefined\` (in Express 5 it stays undefined rather than \`{}\`).

I always set a **size limit**, like \`express.json({ limit: '1mb' })\`, to prevent large-payload attacks. For file uploads (\`multipart/form-data\`) you need a separate library such as **multer** or busboy, and for webhooks like Stripe you need the **raw body** to verify the signature.`,
    },
    {
      q: 'How do you validate request input?',
      a: `I validate **every input at the edge**, body, params and query, before it reaches business logic. I use a schema library like **Zod** or **Joi**, or \`express-validator\`, inside a small middleware that returns **400** with clear messages on failure.

Zod is nice with TypeScript because the schema also gives you the type. Also strip unknown fields, so a user cannot sneak in something like \`role: 'admin'\`. Database-level validation (like Mongoose schemas) is a second safety net, not a replacement.`,
    },
    {
      q: 'Which HTTP status codes do you use and when?',
      a: `**200** OK, **201** Created after a POST, **204** No Content for a successful delete. **400** bad input, **401** not authenticated, **403** authenticated but not allowed, **404** not found, **409** conflict like a duplicate email, **422** validation errors (some teams use 400), **429** too many requests.

**500** for unexpected server errors, **502/503/504** for upstream or availability problems. The key ones interviewers check are **401 vs 403** and using **201** for creation instead of always 200.`,
    },
    {
      q: 'What are REST API conventions?',
      a: `Use **nouns for resources** and HTTP methods for actions: \`GET /users\`, \`GET /users/:id\`, \`POST /users\`, \`PATCH /users/:id\` for partial update, \`PUT\` for full replace, \`DELETE /users/:id\`. Use plural names and nesting only one level deep, like \`/users/:id/orders\`.

Return proper status codes and a consistent JSON error shape. Support filtering, sorting and **pagination** through query params, version the API (\`/api/v1\`), and keep it **stateless**. GET, PUT and DELETE should be **idempotent**; POST usually is not.`,
    },
    {
      q: 'How do you implement rate limiting?',
      a: `**Rate limiting** caps how many requests a client can make in a time window, to stop brute-force logins, scraping and abuse. In Express the common tool is \`express-rate-limit\`, keyed by IP or user id, returning **429** when exceeded.

With multiple instances, the counters must be shared, so I use a **Redis store**. I apply stricter limits on login and OTP routes. Often rate limiting is also done at the edge, in an API gateway, Nginx or a WAF. If behind a proxy, set \`app.set('trust proxy', ...)\` so the real client IP is used.`,
    },
    {
      q: 'What does helmet do?',
      a: `**helmet** is middleware that sets a group of **security-related HTTP headers** with sensible defaults. For example: \`Content-Security-Policy\` to limit where scripts load from (reduces XSS), \`Strict-Transport-Security\` to force HTTPS, \`X-Content-Type-Options: nosniff\`, and frame protection against clickjacking.

It also removes \`X-Powered-By\`, so you do not advertise that you use Express. It is one line, \`app.use(helmet())\`, but it does not replace input validation, auth or escaping output.`,
    },
    {
      q: 'How would you structure a large Express project?',
      a: `I use a **layered structure**: **routes** define URLs and attach middleware, **controllers** handle req/res, **services** hold business logic, and **repositories or models** talk to the database. Plus folders for middleware, validators, config and utils.

The rule is that services never touch \`req\` or \`res\`, so they are easy to test and reuse. Some teams group by **feature** (users, orders) instead of by layer, which scales better. SkillKeepr followed the same controller to service to repository flow, though its handlers ran on Lambda rather than Express.`,
    },
    {
      q: 'How do you handle file uploads in Express?',
      a: `File uploads come as \`multipart/form-data\`, which \`express.json()\` cannot parse, so I use **multer** (or busboy). Multer can store to disk or memory and gives you \`req.file\` or \`req.files\`. I always set **file size limits** and check the MIME type and extension.

For production, I avoid streaming big files through the API at all. The better pattern is a **pre-signed S3 URL**: the server returns a signed URL, the browser uploads directly to S3, and the server only stores the key.`,
    },
    {
      q: 'How do you add logging to an Express app?',
      a: `For request logs, \`morgan\` is the classic simple option, but in production I prefer **structured JSON logging** with **pino** (\`pino-http\`) because it is fast and easy to search.

I attach a **request id** to every request and include it in every log line, so I can trace one request end to end. I log method, path, status and duration, never passwords or tokens. Log levels (info, warn, error) are controlled by env config, and logs go to a central system like CloudWatch or ELK.`,
    },
    {
      q: 'What is the difference between app.use, app.get and app.all?',
      a: `\`app.use(path, fn)\` mounts **middleware** that runs for **every HTTP method** and for any path that **starts with** the given path. So \`app.use('/api', ...)\` matches \`/api/users\` too.

\`app.get(path, fn)\` handles only **GET** requests that **exactly match** the path pattern; same for \`post\`, \`put\`, \`patch\` and \`delete\`. \`app.all(path, fn)\` matches **all methods** but on the exact path, useful for things like path-specific auth checks.`,
    },
    {
      q: 'Sessions vs JWT for authentication in Express?',
      a: `With **sessions**, the server stores session data (often in Redis) and the browser holds only a session id cookie. It is easy to revoke, but the server needs shared storage. With **JWT**, the token itself carries the signed claims, so the server is **stateless**, which suits scaling and serverless, but revoking before expiry is harder.

A common setup is a **short-lived access token** plus a **refresh token**, both in \`httpOnly\`, \`Secure\`, \`SameSite\` cookies. That protects against XSS stealing tokens from localStorage.`,
    },
    {
      q: 'How do you handle 404s for unknown routes?',
      a: `Express has no built-in JSON 404. I add a catch-all middleware **after all routes**: \`app.use((req, res) => res.status(404).json({ message: 'Not found' }))\`. Since no route matched, the request reaches it.

Then the error handler comes after that. For a resource that does not exist, like \`GET /users/:id\` with an unknown id, the controller itself returns 404. For tenant-scoped data, returning 404 instead of 403 also avoids revealing that the record exists.`,
    },
    {
      q: 'How do you secure an Express API overall?',
      a: `In layers: **HTTPS**, \`helmet\` headers, a strict **CORS** allow-list, **rate limiting**, and body **size limits**. Validate every input with a schema, and use parameterised queries or Mongoose with sanitisation to avoid **NoSQL injection** like \`{ "$gt": "" }\` in a login body.

Authenticate with JWT or sessions in \`httpOnly\` cookies, add **CSRF** protection if you use cookies, check authorisation on every route, hash passwords with bcrypt, keep secrets in env vars, update dependencies, and never return stack traces in production.`,
    },
    {
      q: 'How do you test an Express API?',
      a: `**Unit tests** for services and utils with Jest or Vitest, mocking the database or external APIs. **Integration tests** with **Supertest**, which calls the Express app in memory without opening a port, checking status codes and JSON bodies.

For the database I use a test database or \`mongodb-memory-server\`, reset between tests. To make testing easy, I export the \`app\` separately from the file that calls \`app.listen()\`. In CI, the tests run on every pull request.`,
    },
    {
      q: 'How do you handle API versioning?',
      a: `The most common way is **URL versioning**: \`/api/v1/users\` and \`/api/v2/users\`, each mounted as its own router. It is clear, easy to route and easy to cache. Other options are a header like \`Accept-Version\` or a custom media type, which keeps URLs clean but is harder to test in a browser.

The main rule is: **never break existing clients**. Additive changes like new optional fields do not need a new version; removing or renaming fields does. Deprecate old versions with notice before removing them.`,
    },
    {
      q: 'Express vs Fastify vs NestJS?',
      a: `**Express** is minimal and has the biggest ecosystem, but you design the structure yourself. **Fastify** is also lightweight but **faster**, with built-in JSON-schema validation, serialisation, a plugin system and first-class async support. **NestJS** is an **opinionated framework** with modules, controllers, providers and dependency injection, built on TypeScript, and runs on Express or Fastify underneath.

I would choose Express for small services or teams who know it well, Fastify where throughput matters, and NestJS for large teams that want enforced structure.`,
    },
  ],
};
