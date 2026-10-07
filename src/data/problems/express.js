// Interview problems for the Express stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'express',
  problems: [
    {
      id: 'req-body-undefined',
      title: 'Why is req.body undefined?',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'body-parsers',
      question: `A teammate says: "My POST route always crashes with \`Cannot destructure property 'email' of 'req.body' as it is undefined\`." Find the bug(s).

\`\`\`javascript
import express from 'express';
const app = express();

app.post('/api/users', (req, res) => {
  const { email, name } = req.body;
  res.status(201).json({ email, name });
});

app.use(express.json());

app.listen(3000);
\`\`\`

The client sends:

\`\`\`javascript
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ email: 'a@b.com', name: 'Asha' }),
});
\`\`\``,
      hints: [
        'Express runs middleware in the order you register it. When does `express.json()` run compared to the route?',
        '`express.json()` only parses a body when the request says it is JSON. Which header tells the server that?',
      ],
      solution: `**Idea:** there are two bugs. (1) The body parser is registered **after** the route, so the route runs before the body is parsed. (2) The client does not send \`Content-Type: application/json\`, so \`express.json()\` would skip the body anyway.

\`\`\`javascript
import express from 'express';
const app = express();

// 1. Register body parsers BEFORE the routes that need them
app.use(express.json({ limit: '100kb' })); // limit = protect against huge bodies

app.post('/api/users', (req, res) => {
  // Defensive: req.body can still be undefined/empty if the client sent no JSON
  const { email, name } = req.body ?? {};
  if (!email || !name) {
    return res.status(400).json({ message: 'email and name are required' });
  }
  res.status(201).json({ email, name });
});

app.listen(3000);
\`\`\`

\`\`\`javascript
// 2. Client: tell the server the body is JSON
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'a@b.com', name: 'Asha' }),
});
\`\`\`

**Why it works:** middleware is a line of functions. A request walks down the line from top to bottom. \`express.json()\` reads the raw body, parses it, and puts the result on \`req.body\`. It must sit **above** the route. It also checks the \`Content-Type\` header and does nothing if the body is not JSON.

**Other causes to mention:** HTML forms send \`application/x-www-form-urlencoded\` (needs \`express.urlencoded()\`), file uploads send \`multipart/form-data\` (needs multer), and a Stripe webhook route may need \`express.raw()\` instead.`,
      followUps: [
        {
          q: 'Is req.body undefined or {} when no parser runs?',
          a: 'It is `undefined` when no body parser ran. Some older setups gave `{}`, which is why defensive code like `req.body ?? {}` is common. Check your Express version docs if you rely on it.',
        },
        {
          q: 'What happens if the client sends invalid JSON?',
          a: '`express.json()` calls `next(err)` with a 400 error (the error has `type: \'entity.parse.failed\'`). Your error handler should turn it into a clean 400 response instead of a stack trace.',
        },
      ],
    },
    {
      id: 'middleware-order-output',
      title: 'Predict the middleware log order',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'request-lifecycle',
      question: `What is logged for **GET /api/users**? And for **GET /health**?

\`\`\`javascript
app.use((req, res, next) => {
  console.log('A');
  next();
  console.log('A after');
});

app.use('/api', (req, res, next) => {
  console.log('B');
  next();
});

app.get('/api/users', (req, res) => {
  console.log('C');
  res.send('users');
});

app.use((req, res) => {
  console.log('D');
  res.status(404).send('Not found');
});
\`\`\``,
      hints: [
        '`app.use(\'/api\', ...)` only runs for paths that start with `/api`.',
        '`next()` is a normal function call. When it returns, the code after it continues.',
        'All handlers here are synchronous, so the whole chain finishes inside the first `next()` call.',
      ],
      solution: `**Output for GET /api/users:**

\`\`\`text
A
B
C
A after
\`\`\`

**Output for GET /health:**

\`\`\`text
A
D
A after
\`\`\`

**Why:**

- Middleware runs top to bottom. \`A\` runs for every request.
- \`next()\` calls the next matching middleware **right now**. Because everything is synchronous, B and C (or D) run fully inside A's \`next()\` call. Then control returns to A and \`'A after'\` prints.
- \`/health\` does not start with \`/api\`, so B is skipped. No route matches, so the last \`app.use\` (the 404 catcher) runs.
- The 404 handler has no \`next\` and sends a response, so the chain ends there.

**Watch out:** code after \`next()\` is **not** a reliable "after response" hook. If a later handler is async (awaits a DB call), \`'A after'\` would print **before** the response is sent. To run code after the response, use \`res.on('finish', ...)\`.`,
      followUps: [
        {
          q: 'Why must the 404 handler be registered last?',
          a: 'Because it matches every path. If it were first, it would answer every request with 404 before your routes get a chance.',
        },
        {
          q: 'What would happen if B forgot to call next()?',
          a: 'For /api/users the request would hang: nothing sends a response and nothing moves on. The client waits until it times out.',
        },
      ],
    },
    {
      id: 'request-logger-timing',
      title: 'Write a request-logging middleware with timing',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'middleware',
      question: `Write a middleware \`requestLogger\` that logs one line per request **after the response is finished**:

\`\`\`text
GET /api/users 200 12.4ms
POST /api/login 401 85.1ms
\`\`\`

It must log the final status code (which is only known at the end), and it must not slow down or block the request.`,
      hints: [
        'Record the start time when the middleware runs, then call `next()` right away.',
        'The response object is an event emitter. Which event fires when the response is fully sent?',
        'Use `process.hrtime.bigint()` or `performance.now()` for accurate timing instead of `Date.now()`.',
      ],
      solution: `**Idea:** take a timestamp at the start, call \`next()\` immediately, and log inside a \`res.on('finish')\` listener. At that moment the status code is final.

\`\`\`javascript
// middleware/requestLogger.js
export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint(); // high-resolution time in nanoseconds

  // 'finish' = the last byte of the response was handed to the OS
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(\`\${req.method} \${req.originalUrl} \${res.statusCode} \${ms.toFixed(1)}ms\`);
  });

  // 'close' without 'finish' = the client disconnected before we answered
  res.on('close', () => {
    if (!res.writableFinished) {
      console.log(\`\${req.method} \${req.originalUrl} aborted by client\`);
    }
  });

  next(); // never block the request
}

// app.js
app.use(requestLogger); // register near the top so it times everything
\`\`\`

**Why it works:** the middleware itself does almost nothing, so it adds no delay. The \`finish\` event fires once the response is sent, so \`res.statusCode\` is the real final code, even if an error handler changed it.

**Edge cases:**

- Use \`req.originalUrl\`, not \`req.url\`. Inside a router mounted at \`/api\`, \`req.url\` has the \`/api\` part removed.
- Do not log passwords, tokens or full bodies.
- In production use a real logger (pino, winston, or morgan) that writes JSON lines.`,
      followUps: [
        {
          q: 'Why not log after calling next()?',
          a: 'Because async handlers have not finished yet when `next()` returns. You would log the wrong status (usually 200) and the wrong time.',
        },
        {
          q: 'How would you add a request ID to every log line?',
          a: 'Generate an id with `crypto.randomUUID()` (or reuse an incoming `X-Request-Id` header), store it on `req.id`, set it as a response header, and include it in every log. AsyncLocalStorage lets deeper code read it without passing `req` around.',
        },
      ],
    },
    {
      id: 'async-handler-wrapper',
      title: 'Write an asyncHandler wrapper',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'async-error-handling',
      question: `In Express 4, if an \`async\` route handler throws, the error is **not** sent to your error-handling middleware. Write a helper \`asyncHandler(fn)\` so that this works:

\`\`\`javascript
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id); // may throw
  if (!user) throw new NotFoundError('User not found');
  res.json(user);
}));
\`\`\`

Any thrown error or rejected promise must reach \`next(err)\`.`,
      hints: [
        'An `async` function always returns a promise. A thrown error becomes a rejected promise.',
        'Return a new `(req, res, next)` function that calls `fn` and attaches `.catch(next)`.',
        'Wrap the call in `Promise.resolve(...)` so it also works if `fn` is not async.',
      ],
      solution: `**Idea:** wrap the handler. Call it, and if the promise it returns rejects, pass the error to \`next\`.

\`\`\`javascript
// utils/asyncHandler.js
export const asyncHandler = (fn) => (req, res, next) => {
  // Promise.resolve handles both async and normal functions.
  // .catch(next) is the same as .catch((err) => next(err)).
  Promise.resolve(fn(req, res, next)).catch(next);
};
\`\`\`

**Why it works:** Express 4 calls your handler but ignores the promise it returns. The wrapper listens to that promise. When it rejects, \`next(err)\` tells Express "skip to the error handlers".

**Edge cases:**

- If \`fn\` is a normal (non-async) function and throws synchronously, the wrapper throws too. Express 4 already catches sync throws from any handler and forwards them to the error handlers, so that case is covered.
- Errors thrown inside a \`setTimeout\` or a plain callback are **not** caught by anything here. Convert callbacks to promises (\`util.promisify\`) or call \`next(err)\` yourself.`,
      followUps: [
        {
          q: 'Do you still need this in Express 5?',
          a: 'No. Express 5 handles it for you: if a handler returns a promise that rejects, Express calls `next(err)` automatically. You still need care with errors thrown inside callbacks or timers.',
        },
        {
          q: 'What does the express-async-errors package do?',
          a: 'It patches Express 4 internals so async errors are forwarded automatically, without wrapping each route. It works by monkey-patching, so some teams prefer the explicit wrapper or upgrading to Express 5.',
        },
      ],
    },
    {
      id: 'missing-next-request-hangs',
      title: 'The request hangs forever',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'middleware',
      question: `Every request to this API hangs until the browser times out. There is no error in the logs. Find the bug.

\`\`\`javascript
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (req.headers['x-api-version'] === '1') {
    req.apiVersion = 1;
    next();
  }
});

app.use(async (req, res, next) => {
  req.featureFlags = await loadFlags(req.headers['x-user-id']);
});

app.get('/api/products', (req, res) => {
  res.json([{ id: 1, name: 'Desk' }]);
});
\`\`\``,
      hints: [
        'A middleware must do one of two things: send a response, or call `next()`.',
        'Look at every path through each middleware. Which paths do neither?',
      ],
      solution: `**Idea:** two middlewares sometimes end without sending a response **and** without calling \`next()\`. The request is then stuck.

- Middleware 1 only calls \`next()\` when the header is \`'1'\`. For every other request it does nothing.
- Middleware 2 never calls \`next()\` at all. It also has no error handling, so if \`loadFlags\` fails the request still hangs.

\`\`\`javascript
app.use((req, res, next) => {
  // Default to version 1 instead of silently stopping
  req.apiVersion = Number(req.headers['x-api-version'] ?? 1);
  next(); // ALWAYS continue
});

app.use(async (req, res, next) => {
  try {
    req.featureFlags = await loadFlags(req.headers['x-user-id']);
    next();               // continue on success
  } catch (err) {
    next(err);            // hand the error to the error handler
  }
});
\`\`\`

**Why it works:** Express does not move to the next function by itself. Only \`next()\` moves the request forward. Only \`res.send/json/end\` finishes it. Every code path must do exactly one of these.

**Tip:** if you want to reject a request, send a response and \`return\`:

\`\`\`javascript
if (!req.headers['x-api-key']) {
  return res.status(401).json({ message: 'Missing API key' });
}
next();
\`\`\``,
      followUps: [
        {
          q: 'How would you catch hanging requests in production?',
          a: 'Set a server timeout (`server.requestTimeout`/`server.headersTimeout` in Node, or a load balancer timeout) and log requests that end with `close` but never `finish`. A request-timing log quickly shows routes that never complete.',
        },
        {
          q: 'What is the difference between next() and next(\'route\')?',
          a: '`next()` goes to the next matching function. `next(\'route\')` skips the remaining handlers of the current route and jumps to the next matching route. It only works in route handlers (app.get etc.), not in app.use.',
        },
      ],
    },
    {
      id: 'crud-rest-api-status-codes',
      title: 'Build a CRUD REST API with correct status codes',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'routing',
      question: `Build a small REST API for **notes** using \`express.Router\`. Keep the data in memory (a \`Map\`). Each note has \`id\`, \`title\`, \`body\`, \`createdAt\`.

- \`GET /api/notes\` — list all notes
- \`GET /api/notes/:id\` — get one note
- \`POST /api/notes\` — create a note
- \`PATCH /api/notes/:id\` — update some fields
- \`DELETE /api/notes/:id\` — delete a note

Use the **right HTTP status code** for every case: success, not found, bad input.`,
      hints: [
        'Create: 201 Created. Delete: 204 No Content (no body). Missing resource: 404. Bad input: 400.',
        'Use `crypto.randomUUID()` for ids.',
        'For PATCH, only copy the fields you allow. Never spread the whole `req.body` into your object.',
      ],
      solution: `**Idea:** one router, one handler per method + path. Validate input, look up the note, and pick the status code that matches what happened.

\`\`\`javascript
// routes/notes.js
import { Router } from 'express';
import { randomUUID } from 'node:crypto';

const router = Router();
const notes = new Map(); // id -> note (in-memory "database")

// GET /api/notes -> 200 + array (an empty list is still 200, not 404)
router.get('/', (req, res) => {
  res.json([...notes.values()]);
});

// GET /api/notes/:id -> 200 or 404
router.get('/:id', (req, res) => {
  const note = notes.get(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
});

// POST /api/notes -> 201 + Location header + created note
router.post('/', (req, res) => {
  const { title, body = '' } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'title is required' });
  }
  const note = { id: randomUUID(), title: title.trim(), body: String(body), createdAt: new Date().toISOString() };
  notes.set(note.id, note);
  res.status(201).location(\`/api/notes/\${note.id}\`).json(note);
});

// PATCH /api/notes/:id -> 200 with updated note, 400 or 404
router.patch('/:id', (req, res) => {
  const note = notes.get(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  const { title, body } = req.body ?? {};
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ message: 'title must be a non-empty string' });
  }
  // Whitelist fields: a client must not be able to change id or createdAt
  if (title !== undefined) note.title = title.trim();
  if (body !== undefined) note.body = String(body);
  res.json(note);
});

// DELETE /api/notes/:id -> 204 (no body) or 404
router.delete('/:id', (req, res) => {
  if (!notes.delete(req.params.id)) {
    return res.status(404).json({ message: 'Note not found' });
  }
  res.status(204).end();
});

export default router;

// app.js
// app.use(express.json());
// app.use('/api/notes', notesRouter);
\`\`\`

**Why it works:** status codes tell the client what happened without reading the body.

- **200 OK** — read or update worked.
- **201 Created** — something new exists. The \`Location\` header says where.
- **204 No Content** — success, nothing to return (delete).
- **400 Bad Request** — the client sent bad data.
- **404 Not Found** — the id does not exist.

**Edge cases:** \`return\` before every early response (otherwise you get "headers already sent"). An empty list is \`200 []\`, not 404. Never spread \`req.body\` into a stored object — that lets clients overwrite fields like \`role\` or \`id\` (called **mass assignment**).`,
      followUps: [
        {
          q: 'PUT vs PATCH?',
          a: 'PUT replaces the whole resource (missing fields are cleared or defaulted). PATCH changes only the fields you send. PUT should be idempotent: sending it twice gives the same result.',
        },
        {
          q: 'When would you return 409 or 422?',
          a: '409 Conflict when the request clashes with current state (email already taken, version mismatch). 422 Unprocessable Entity is used by some teams for well-formed JSON that fails validation rules; others use 400 for all validation errors. Pick one and be consistent.',
        },
        {
          q: 'Should DELETE of a missing id return 404 or 204?',
          a: 'Both are seen in practice. 404 is more informative. 204 makes DELETE fully idempotent from the client side. Document your choice.',
        },
      ],
    },
    {
      id: 'headers-already-sent',
      title: 'Fix "Cannot set headers after they are sent to the client"',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'req-res-objects',
      question: `This route sometimes crashes with **Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client**. When, and why? Fix it.

\`\`\`javascript
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }
    if (user.isBanned) {
      res.status(403).json({ message: 'User is banned' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});
\`\`\``,
      hints: [
        'Does `res.json()` stop the function? Or does the code keep going after it?',
        'Trace the code when the user does **not** exist. And when the user is banned.',
      ],
      solution: `**Idea:** \`res.json()\` sends the response but does **not** stop the function. The code keeps running and tries to send a second response.

- User not found: sends 404, then \`user.isBanned\` throws a TypeError (\`user\` is null). The \`catch\` calls \`next(err)\`, and the error handler tries to send a 500 → headers already sent.
- User banned: sends 403, then \`res.json(user)\` tries to send again → headers already sent.

**Fix:** \`return\` on every early response, so each path sends exactly once.

\`\`\`javascript
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'User is banned' });
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});
\`\`\`

**Why it works:** an HTTP response has one status line and one set of headers. Once they are sent, they cannot change. \`return\` ends the function, so no second send happens.

**Other common causes:**

- Calling \`next()\` **after** sending a response (a later handler then responds too).
- Sending inside a loop or inside both a callback and the main code.
- An error handler that does not check \`res.headersSent\` (use \`if (res.headersSent) return next(err);\`).`,
      followUps: [
        {
          q: 'How do you check whether a response has already been sent?',
          a: 'Use `res.headersSent` (true once headers are written). Error handlers should check it and call `next(err)` so Express closes the connection instead of trying to respond again.',
        },
        {
          q: 'Is there a lint rule that helps?',
          a: 'Code review and the habit "always return res.xxx()" help most. Keeping handlers small (call a service, then send once) makes double sends rare.',
        },
      ],
    },
    {
      id: 'async-error-express4',
      title: 'Async error crashes the server in Express 4',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'async-error-handling',
      question: `This app uses **Express 4**. When a client calls \`GET /api/orders/abc\` (an invalid MongoDB id), the request hangs and then the whole Node process crashes. The error handler never runs. Explain why and fix it.

\`\`\`javascript
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id); // throws CastError for "abc"
  res.json(order);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});
\`\`\``,
      hints: [
        'Express 4 calls your handler but does it look at the promise the async function returns?',
        'What does Node (version 15 and newer) do by default with an unhandled promise rejection?',
        'You need to turn the rejected promise into a `next(err)` call.',
      ],
      solution: `**Idea:** Express 4 only catches errors that are thrown **synchronously**. An \`async\` function never throws synchronously — it returns a **rejected promise**. Express 4 ignores that promise, so:

1. Nobody calls \`next(err)\`, so the error handler never runs and no response is sent → the request hangs.
2. The rejected promise is never handled → Node raises \`unhandledRejection\`. Since Node 15 the default is to **crash the process** for that.

**Fix A — try/catch and forward:**

\`\`\`javascript
app.get('/api/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err); // send to the error handler
  }
});
\`\`\`

**Fix B — a reusable wrapper (cleaner for many routes):**

\`\`\`javascript
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/api/orders/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}));
\`\`\`

**Fix C — upgrade to Express 5**, which forwards rejected promises from handlers to \`next(err)\` automatically.

**Also improve the error handler:** a Mongoose \`CastError\` should become a **400** (bad id), not a 500. And for 500s, do not leak \`err.message\` to clients in production.

\`\`\`javascript
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
});
\`\`\``,
      followUps: [
        {
          q: 'Should you add process.on(\'unhandledRejection\') to stop the crash?',
          a: 'Use it to **log** and then shut down cleanly, not to keep running. After an unexpected error the app may be in a bad state. Let the process manager (PM2, Docker, Kubernetes) restart it. The real fix is to handle errors in the route.',
        },
        {
          q: 'Does Express 5 catch errors thrown inside setTimeout or a callback?',
          a: 'No. Express 5 only handles a returned promise that rejects. An error thrown inside a timer or an old-style callback is outside that promise, so you must catch it and call `next(err)` yourself.',
        },
      ],
    },
    {
      id: 'error-handler-order-bug',
      title: 'The error handler never runs',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'error-handling-middleware',
      question: `A teammate wrote this app. **Every** request — even valid ones — gets Express's default HTML 500 page saying \`TypeError: res.status is not a function\`. Find **all** the bugs, and make sure route errors and unknown routes return the JSON shape.

\`\`\`javascript
const app = express();

// error handler
app.use((err, req, res) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

app.listen(3000);
\`\`\``,
      hints: [
        'How does Express decide that a middleware is an **error** handler? Count the parameters.',
        'Errors only travel **forward** (down the list). Where is the error handler compared to the routes?',
      ],
      solution: `**Idea:** two bugs.

1. **Wrong signature.** Express decides "this is an error handler" by counting the function's parameters (\`fn.length === 4\`). \`(err, req, res)\` has 3, so Express treats it as a **normal** middleware that runs for **every** request, with the arguments \`(req, res, next)\`. So inside it, \`err\` is really \`req\`, \`req\` is really \`res\`, and \`res\` is really \`next\`. \`next.status\` does not exist → \`TypeError: res.status is not a function\`. There is no real error handler, so Express's default HTML page is shown.
2. **Wrong position.** Even with 4 parameters, an error handler at the top is useless. When something calls \`next(err)\`, Express only looks **forward** (down the list) for an error handler. Errors from routes registered below it never reach it.

**Fixed version:**

\`\`\`javascript
const app = express();

app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);

// 404: after all routes, before the error handler
app.use((req, res, next) => {
  const err = new Error(\`Route \${req.method} \${req.originalUrl} not found\`);
  err.status = 404;
  next(err);
});

// Error handler: LAST, and with all FOUR parameters (even if next is unused)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

app.listen(3000);
\`\`\`

**Why it works:** the order is now: parse body → routes → 404 → error handler. A route error and the 404 error both flow down to the 4-argument handler.

**Rule of thumb for order:** security/CORS/logging → body parsers → routes → 404 → error handler.`,
      followUps: [
        {
          q: 'Can you have more than one error handler?',
          a: 'Yes. They run in order. A common pattern: one logs the error and calls `next(err)`, the last one sends the response. A router can also have its own error handler for its own routes.',
        },
        {
          q: 'Why keep the unused next parameter?',
          a: 'Because Express uses the parameter count to detect error handlers. Removing `next` turns it into a normal middleware. Linters may complain, so disable the unused-vars rule for that line.',
        },
      ],
    },
    {
      id: 'central-error-handler-apperror',
      title: 'Central error handling with custom AppError classes',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'error-handling-middleware',
      question: `Right now every controller builds its own error JSON, and the shapes are all different. Design a **single** error-handling system:

1. An \`AppError\` base class plus \`NotFoundError\`, \`ValidationError\`, \`UnauthorizedError\`, \`ConflictError\`.
2. One error-handling middleware that returns the same shape for every error:

\`\`\`json
{ "error": { "code": "NOT_FOUND", "message": "User not found" } }
\`\`\`

3. Known library errors (Mongoose \`CastError\`, MongoDB duplicate key \`11000\`, bad JSON body, expired JWT) become proper 4xx errors.
4. Unknown errors return 500 with a generic message. The stack trace is shown only in development.`,
      hints: [
        'Extend `Error` and add `statusCode` and a machine-readable `code`. Set `this.name = this.constructor.name`.',
        'Write a `normalizeError(err)` function that converts library errors into your AppError types. Return null for unknown errors.',
        'Controllers just `throw new NotFoundError(...)` (or `next(err)` in Express 4 without a wrapper). Only the handler builds JSON.',
      ],
      solution: `**Idea:** controllers only **throw** meaningful errors. One middleware at the end turns any error into a consistent JSON response. Unknown errors are logged and hidden from the client.

\`\`\`javascript
// errors/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
    super(message);
    this.name = this.constructor.name; // "NotFoundError" etc. in logs
    this.statusCode = statusCode;
    this.code = code;                   // stable code the frontend can switch on
    this.details = details;             // e.g. field-level validation errors
    this.isOperational = true;          // an expected error, not a bug
  }
}
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') { super(message, 404, 'NOT_FOUND'); }
}
export class ValidationError extends AppError {
  constructor(message = 'Invalid input', details) { super(message, 400, 'VALIDATION_ERROR', details); }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') { super(message, 401, 'UNAUTHORIZED'); }
}
export class ConflictError extends AppError {
  constructor(message = 'Conflict') { super(message, 409, 'CONFLICT'); }
}
\`\`\`

\`\`\`javascript
// middleware/errorHandler.js
import { AppError, ValidationError, ConflictError, UnauthorizedError, NotFoundError } from '../errors/AppError.js';

// Convert well-known library errors into our own error types
function normalizeError(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') return new ValidationError('Request body is not valid JSON');
  if (err.name === 'CastError') return new ValidationError(\`Invalid \${err.path}: \${err.value}\`);
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue ?? {}).join(', ');
    return new ConflictError(\`Duplicate value for \${fields}\`);
  }
  if (err.name === 'TokenExpiredError') return new UnauthorizedError('Token expired');
  if (err.name === 'JsonWebTokenError') return new UnauthorizedError('Invalid token');
  return null; // unknown = a real bug
}

export function notFound(req, res, next) {
  next(new NotFoundError(\`Route \${req.method} \${req.originalUrl} not found\`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err); // let Express close the connection

  const known = normalizeError(err);
  if (!known) {
    // Log full details on the server only
    console.error({ requestId: req.id, err }, 'Unexpected error');
  }

  const isDev = process.env.NODE_ENV !== 'production';
  res.status(known?.statusCode ?? 500).json({
    error: {
      code: known?.code ?? 'INTERNAL_ERROR',
      message: known ? known.message : 'Something went wrong',
      ...(known?.details && { details: known.details }),
      ...(isDev && !known && { stack: err.stack }),
    },
  });
}
\`\`\`

\`\`\`javascript
// app.js (order matters)
app.use('/api/users', usersRouter);
app.use(notFound);
app.use(errorHandler);

// in a service or controller
const user = await User.findById(id);
if (!user) throw new NotFoundError('User not found');
\`\`\`

**Why it works:** every error flows to one place, so the response shape is always the same. Library errors get the right 4xx code. Real bugs become a safe 500, and their details go to the logs, not to the client.

**Edge case:** \`instanceof\` checks can fail if two copies of your errors module get loaded (rare, with duplicated packages). Checking a flag like \`err.isOperational\` is a fallback.`,
      followUps: [
        {
          q: 'What is the difference between an operational error and a programmer error?',
          a: 'Operational errors are expected situations (not found, bad input, DB timeout). You handle them and respond. Programmer errors are bugs (undefined is not a function). Log them, return 500, and fix the code. A bug outside a request (like an uncaught exception) usually means you should restart the process.',
        },
        {
          q: 'Why use a code field and not just the message?',
          a: 'Messages change and may be translated. A stable code like `EMAIL_TAKEN` lets the frontend show the right UI without parsing text.',
        },
        {
          q: 'How would you send errors to Sentry or Datadog?',
          a: 'Report only unknown (non-operational) errors and 5xx from the error handler, along with the request id, route and user id. Most SDKs offer an Express error middleware you register before your own handler.',
        },
      ],
    },
    {
      id: `jwt-auth-authorize-roles`,
      title: `JWT auth middleware + role-based authorize()`,
      difficulty: `medium`,
      type: `coding`,
      frequency: `very common`,
      relatedTopic: `jwt-auth-middleware`,
      question: `Write two middlewares:

1. \`authenticate\` — reads a JWT from the \`Authorization: Bearer <token>\` header, verifies it, and puts the user on \`req.user\`. Missing or bad token → **401**.
2. \`authorize(...roles)\` — a middleware **factory**. \`authorize('admin')\` lets only admins through. Logged in but wrong role → **403**.

\`\`\`javascript
router.get('/me', authenticate, getMe);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
router.get('/reports', authenticate, authorize('admin', 'manager'), getReports);
\`\`\`

Use the \`jsonwebtoken\` package. The token payload looks like \`{ sub: userId, role: 'user' }\`.`,
      hints: [
        `Split the header on the space: the first part must be \`Bearer\`, the second is the token.`,
        `\`jwt.verify(token, secret)\` throws if the token is invalid or expired. Wrap it in try/catch.`,
        `\`authorize\` is a function that **returns** a middleware. The returned middleware closes over \`roles\`.`,
      ],
      solution: `**Idea:** \`authenticate\` answers "**who** are you?" (401 if unknown). \`authorize\` answers "are you **allowed**?" (403 if not). Keep them separate so you can mix them per route.

\`\`\`javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // long random secret, never in code

export function authenticate(req, res, next) {
  const header = req.get('Authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or malformed token' });
  }

  try {
    // Pin the algorithm so an attacker cannot pick a different one
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ message });
  }
}

// Factory: authorize('admin', 'manager') returns a middleware
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // authenticate was not run before this middleware
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
\`\`\`

\`\`\`javascript
// Issuing the token at login (short expiry)
const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '15m',
});
\`\`\`

**Why it works:** \`jwt.verify\` checks the signature (the token was made with our secret and not changed) and the \`exp\` time. If it passes, we trust the payload. \`authorize\` uses a **closure**: the inner function remembers \`allowedRoles\`.

**401 vs 403:** 401 = "I don't know who you are" (log in again). 403 = "I know who you are, but you can't do this".

**Edge cases:**

- The role inside the token can be stale (user was demoted). For sensitive actions, load the user from the DB, or keep tokens short-lived.
- Never put secrets or personal data in the payload — it is only Base64, anyone can read it.
- Ownership checks ("can this user edit **this** order?") are a separate step in the service, not just a role check.`,
      followUps: [
        {
          q: `Where should the token be stored on the client?`,
          a: `An httpOnly, Secure, SameSite cookie is safest against XSS (JavaScript cannot read it), but then you need CSRF protection. localStorage is simpler but any XSS can steal the token. Many apps use a short-lived access token in memory plus a refresh token in an httpOnly cookie.`,
        },
        {
          q: `How do you log a user out with JWTs?`,
          a: `JWTs are valid until they expire, so: keep access tokens short (5-15 min), store refresh tokens server-side so you can revoke them, and if needed keep a denylist of token ids (\`jti\`) in Redis until they expire.`,
        },
        {
          q: `How would you do permission-based checks instead of roles?`,
          a: `Map roles to permissions (\`admin -> ['user:delete', ...]\`) and write \`requirePermission('user:delete')\`. Routes then depend on what is allowed, not on role names, which scales better as roles grow.`,
        },
      ],
    },
    {
      id: `zod-validation-middleware`,
      title: `Write a reusable validation middleware with zod`,
      difficulty: `medium`,
      type: `coding`,
      frequency: `very common`,
      relatedTopic: `validation`,
      question: `Write a middleware \`validate(schemas)\` that validates \`req.body\`, \`req.params\` and \`req.query\` with **zod** schemas. Use it like this:

\`\`\`javascript
const createProductSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(100),
    price: z.number().positive(),
    tags: z.array(z.string()).max(10).default([]),
  }),
};

router.post('/products', validate(createProductSchema), createProduct);
\`\`\`

On failure respond **400** with a list of field errors:

\`\`\`json
{ "message": "Validation failed", "errors": [{ "path": "body.price", "message": "Number must be greater than 0" }] }
\`\`\`

On success the handler must receive the **parsed** data (trimmed, with defaults applied, unknown fields removed).`,
      hints: [
        `Use \`schema.safeParse(value)\`. It returns \`{ success: true, data }\` or \`{ success: false, error }\` instead of throwing.`,
        `Loop over \`['params', 'query', 'body']\`. Collect errors from all parts before responding.`,
        `Each zod issue has \`path\` (an array) and \`message\`. In Express 5, \`req.query\` is read-only, so store parsed data somewhere else, like \`req.validated\`.`,
      ],
      solution: `**Idea:** a middleware factory. It receives schemas, and returns a middleware that parses each part of the request. If anything fails, it answers 400. Otherwise it saves the clean data and calls \`next()\`.

\`\`\`javascript
// middleware/validate.js
const PARTS = ['params', 'query', 'body'];

export function validate(schemas) {
  return (req, res, next) => {
    const errors = [];
    const validated = {};

    for (const part of PARTS) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part] ?? {});
      if (result.success) {
        validated[part] = result.data; // trimmed, defaults applied, unknown keys stripped
      } else {
        for (const issue of result.error.issues) {
          errors.push({ path: [part, ...issue.path].join('.'), message: issue.message });
        }
      }
    }

    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Do not overwrite req.query: it is a getter (read-only) in Express 5
    req.validated = validated;
    if (validated.body) req.body = validated.body; // body is safe to replace
    next();
  };
}
\`\`\`

\`\`\`javascript
// Query params are always strings, so use z.coerce for numbers
const listProductsSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};

router.get('/products', validate(listProductsSchema), (req, res) => {
  const { page, limit } = req.validated.query; // numbers, with defaults
  // ...
});
\`\`\`

**Why it works:** zod checks types **and** transforms data. \`z.object()\` strips unknown keys by default, which also blocks **mass assignment** (a client sending \`role: 'admin'\`). Validating at the edge means services can trust their input.

**Edge cases:**

- \`z.number()\` fails for \`"10"\` (a string). JSON bodies have real numbers, but query strings never do — use \`z.coerce.number()\` there.
- Error message wording differs between zod versions. Do not write tests that depend on exact zod messages.
- With TypeScript, \`z.infer<typeof schema>\` gives you the type for free.`,
      followUps: [
        {
          q: `Why validate on the server if the frontend already validates?`,
          a: `Anyone can call your API directly with curl or Postman. Frontend validation is for user experience. Server validation is for safety and data integrity.`,
        },
        {
          q: `How would you reject unknown fields instead of stripping them?`,
          a: `Use \`.strict()\` on the object schema. Unknown keys then produce an error. Useful for public APIs where you want clients to notice typos.`,
        },
        {
          q: `zod vs Joi vs express-validator?`,
          a: `All work. zod is TypeScript-first and gives types from schemas. Joi is mature and popular in JS codebases. express-validator is a chain of middleware based on validator.js. Pick one and use it everywhere.`,
        },
      ],
    },
    {
      id: `pagination-filter-sort`,
      title: `Pagination, filtering and sorting from query params (safely)`,
      difficulty: `medium`,
      type: `coding`,
      frequency: `very common`,
      relatedTopic: `security-helmet-sanitization`,
      question: `Build \`GET /api/products\` for a MongoDB collection. It must support:

\`\`\`text
GET /api/products?page=2&limit=20&category=books&minPrice=10&maxPrice=50&q=react&sort=-price,name
\`\`\`

- \`page\`, \`limit\` (max 100)
- filter by \`category\`, price range, and a text search \`q\` on the name
- \`sort\` by allowed fields, \`-\` prefix = descending

Response:

\`\`\`json
{ "data": [], "page": 2, "limit": 20, "total": 134, "totalPages": 7 }
\`\`\`

The interviewer adds: "Users can type anything in the URL. Make it safe."`,
      hints: [
        `Every query value is user input. It can be a string, an array (\`?a=1&a=2\`), or even an object (\`?price[$gt]=0\` with the extended query parser).`,
        `Use **allow-lists** (a Set of allowed sort fields and categories). Never pass \`req.query\` straight into \`find()\`.`,
        `For text search with \`$regex\`, escape special regex characters and limit the length. Run \`find\` and \`countDocuments\` in parallel with \`Promise.all\`.`,
      ],
      solution: `**Idea:** turn the raw query into a **clean** Mongo filter, sort and skip/limit, using only values we allow. Then run the page query and the count in parallel.

\`\`\`javascript
// utils/buildListQuery.js
const ALLOWED_SORT = new Set(['price', 'createdAt', 'name']);
const ALLOWED_CATEGORIES = new Set(['books', 'electronics', 'toys']);

// Escape regex special characters so "c++ (pro)" is searched literally
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

function toInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max); // clamp into [min, max]
}

function toNumber(value) {
  if (typeof value !== 'string' || value.trim() === '') return undefined; // '' would become 0
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function buildListQuery(query) {
  const page = toInt(query.page, 1, 1, 10_000);
  const limit = toInt(query.limit, 20, 1, 100);

  const filter = {};
  // typeof check: blocks arrays and objects like { $ne: null }
  if (typeof query.category === 'string' && ALLOWED_CATEGORIES.has(query.category)) {
    filter.category = query.category;
  }

  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== undefined) filter.price = { ...filter.price, $gte: minPrice };
  if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: maxPrice };

  if (typeof query.q === 'string' && query.q.trim()) {
    const term = escapeRegex(query.q.trim().slice(0, 50)); // limit length
    filter.name = { $regex: term, $options: 'i' };
  }

  const sort = {};
  if (typeof query.sort === 'string') {
    for (const part of query.sort.split(',').slice(0, 3)) {
      const desc = part.startsWith('-');
      const field = desc ? part.slice(1) : part;
      if (ALLOWED_SORT.has(field)) sort[field] = desc ? -1 : 1; // ignore unknown fields
    }
  }
  sort._id = 1; // tie-breaker: stable order, no duplicates across pages

  return { filter, sort, page, limit, skip: (page - 1) * limit };
}
\`\`\`

\`\`\`javascript
// controllers/products.js
router.get('/api/products', async (req, res, next) => {
  try {
    const { filter, sort, page, limit, skip } = buildListQuery(req.query);

    const [data, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});
\`\`\`

**Why it works:**

- Only known fields and known operators reach MongoDB, so \`?category[$ne]=x\` or \`?sort=password\` do nothing.
- Clamping stops \`limit=1000000\` from loading the whole collection.
- The \`_id\` tie-breaker keeps the order stable, so items do not repeat or disappear between pages.
- \`.lean()\` returns plain objects (faster, no Mongoose document overhead).

**Performance:** add an index that matches common filters + sort (for example \`{ category: 1, price: -1 }\`). A \`$regex\` that does not start with \`^\` cannot use an index well — for real search use a text index or Atlas Search. \`skip\` gets slow on deep pages; see the follow-up.`,
      followUps: [
        {
          q: `Why is skip/limit slow for page 5000, and what is the alternative?`,
          a: `MongoDB still walks through all skipped documents. Cursor (keyset) pagination is faster: return a \`nextCursor\` (e.g. the last \`createdAt\` + \`_id\`), and query \`{ createdAt: { $lt: cursor } }\` with a limit. It is great for infinite scroll, but you cannot jump to page N.`,
        },
        {
          q: `Is countDocuments on every request a problem?`,
          a: `On big collections it can be slow. Options: cache the count, use \`estimatedDocumentCount()\` when there is no filter, or drop the total and just return \`hasNextPage\` by fetching \`limit + 1\` items.`,
        },
        {
          q: `What does Express do with ?tag=a&tag=b?`,
          a: `The query parser gives an array: \`['a', 'b']\`. That is why \`typeof value === 'string'\` checks matter. Express 4 used the "extended" parser (qs) by default, which also builds nested objects; Express 5 switched the default to the "simple" parser. Check your version and the \`query parser\` setting.`,
        },
      ],
    },
    {
      id: `multer-file-upload-limits`,
      title: `File upload with multer: type and size limits`,
      difficulty: `medium`,
      type: `coding`,
      frequency: `common`,
      relatedTopic: `file-upload-multer`,
      question: `Build \`POST /api/users/me/avatar\`:

- accepts **one** image in the form field \`avatar\`
- only JPEG, PNG or WebP
- max **2 MB**
- returns **400** with a clear message for a wrong type or missing file, **413** for a too-big file
- the user must be logged in

Bonus: explain where the file should be stored in production.`,
      hints: [
        `multer options: \`limits: { fileSize }\` and a \`fileFilter(req, file, cb)\` function.`,
        `Size errors come as a \`multer.MulterError\` with \`code === 'LIMIT_FILE_SIZE'\`. Handle them in an error middleware.`,
        `The \`mimetype\` comes from the client and can be faked. For real safety, check the file's first bytes (magic number).`,
      ],
      solution: `**Idea:** configure multer with a size limit and a file filter. Turn multer errors into clean 4xx responses. Keep the file in memory (it is small) so we can check it and upload it to cloud storage.

\`\`\`javascript
// middleware/uploadAvatar.js
import multer from 'multer';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

class BadUploadError extends Error {
  constructor(message) { super(message); this.statusCode = 400; }
}

export const uploadAvatar = multer({
  storage: multer.memoryStorage(), // file ends up in req.file.buffer
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
    files: 1,                  // only one file
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new BadUploadError('Only JPEG, PNG or WebP images are allowed'));
    }
    cb(null, true); // accept
  },
}).single('avatar'); // field name in the form
\`\`\`

\`\`\`javascript
// routes/users.js
import multer from 'multer';

router.post('/me/avatar', authenticate, uploadAvatar, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'avatar file is required' });
    }
    // Extra safety: check the real file signature, not just the client's mimetype
    // (for example with the "file-type" package, or sharp to re-encode the image)
    const key = \`avatars/\${req.user.id}-\${Date.now()}\`;
    const url = await storage.upload(key, req.file.buffer, req.file.mimetype); // S3 / GCS helper
    await User.updateOne({ _id: req.user.id }, { avatarUrl: url });
    res.status(201).json({ avatarUrl: url });
  } catch (err) {
    next(err);
  }
});

// Error handler: map upload errors to clean responses
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ message: err.message, code: err.code });
  }
  if (err.statusCode === 400) return res.status(400).json({ message: err.message });
  next(err); // anything else goes to the app error handler
});
\`\`\`

**Why it works:** multer parses \`multipart/form-data\` (the format browsers use for files). \`limits.fileSize\` makes multer stop reading and raise \`LIMIT_FILE_SIZE\` as soon as the file gets too big, so a huge upload cannot fill memory. \`fileFilter\` rejects wrong types before the data is stored. \`authenticate\` runs **before** multer, so anonymous users cannot even upload bytes.

**Production notes:**

- Do not keep uploads on the server's disk: servers get replaced, and several instances do not share a disk. Use S3 / GCS.
- For big files, let the browser upload **directly** to S3/GCS with a **pre-signed URL**. Your API only signs the URL and saves the final key.
- Never use the original file name as the path (path traversal, overwrites). Generate your own name.`,
      followUps: [
        {
          q: `memoryStorage vs diskStorage?`,
          a: `memoryStorage keeps the file in RAM as a Buffer — fine for small files you send on to cloud storage. diskStorage writes to a temp folder — better for larger files, but you must clean up the files and the disk is local to one server.`,
        },
        {
          q: `What is a pre-signed URL?`,
          a: `A short-lived URL your server creates with its cloud credentials. It lets the client PUT one specific file to S3/GCS directly. Your server never handles the bytes, so it scales better.`,
        },
      ],
    },
    {
      id: `cors-preflight-credentials`,
      title: `CORS preflight fails with cookies`,
      difficulty: `medium`,
      type: `debug`,
      frequency: `very common`,
      relatedTopic: `cors`,
      question: `The React app runs on \`https://app.example.com\`. The API runs on \`https://api.example.com\` and uses a session cookie. The browser console shows:

\`\`\`text
Access to fetch at 'https://api.example.com/api/orders' from origin 'https://app.example.com'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*'
when the request's credentials mode is 'include'.
\`\`\`

Server:

\`\`\`javascript
app.use(express.json());
app.use(authenticate);           // checks the session cookie, 401 if missing
app.use(cors());                 // default options
app.use('/api/orders', ordersRouter);
\`\`\`

Client:

\`\`\`javascript
fetch('https://api.example.com/api/orders', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order),
});
\`\`\`

Fix the server so only \`https://app.example.com\` (and \`http://localhost:5173\` in development) can call it with cookies.`,
      hints: [
        `A **preflight** is an automatic \`OPTIONS\` request the browser sends before a "non-simple" request (like POST with JSON). It has no cookies. What does \`authenticate\` do with it?`,
        `With credentials, the server must echo the exact origin (not \`*\`) and send \`Access-Control-Allow-Credentials: true\`.`,
        `Use an allow-list of origins in the \`cors()\` options and register \`cors\` before auth.`,
      ],
      solution: `**Idea:** three problems.

1. \`cors()\` with defaults sends \`Access-Control-Allow-Origin: *\`. Browsers **refuse** \`*\` when the request includes credentials (cookies).
2. \`cors\` is registered **after** \`authenticate\`. The preflight \`OPTIONS\` request carries no cookies, so \`authenticate\` answers 401 before CORS headers are ever added.
3. The server never sends \`Access-Control-Allow-Credentials: true\`.

\`\`\`javascript
import cors from 'cors';

const allowedOrigins = new Set(
  process.env.NODE_ENV === 'production'
    ? ['https://app.example.com']
    : ['https://app.example.com', 'http://localhost:5173'],
);

const corsOptions = {
  origin(origin, callback) {
    // origin is undefined for same-origin requests and tools like curl
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false); // no CORS headers -> the browser blocks it
  },
  credentials: true,                          // Access-Control-Allow-Credentials: true
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,                                // cache preflight for 10 minutes
};

app.use(cors(corsOptions));   // FIRST: also answers OPTIONS preflights
app.use(express.json());
app.use(authenticate);        // now real requests only
app.use('/api/orders', ordersRouter);
\`\`\`

With \`origin\` as a function (or an array), the cors package echoes the **exact** request origin back and adds \`Vary: Origin\`, so caches do not mix responses between origins.

**Why it works:** the browser sends \`OPTIONS\` with \`Origin\` and \`Access-Control-Request-Method\`. The cors middleware now answers it with the right headers (status 204) before any auth runs. Then the real POST goes through with the cookie, and the response also has matching CORS headers.

**Also check the cookie itself:** the app and API are on different subdomains of the same site, so \`SameSite=Lax\` cookies are sent. If they were on **different sites** (e.g. \`myapp.vercel.app\` → \`api.render.com\`) the cookie needs \`SameSite=None; Secure\`.

**Remember:** CORS is enforced by the **browser** only. It is not security against curl or other servers — that is what auth is for.`,
      followUps: [
        {
          q: `What makes a request trigger a preflight?`,
          a: `Methods other than GET/HEAD/POST, custom headers (like Authorization), or a Content-Type other than form types or text/plain — so \`application/json\` triggers it.`,
        },
        {
          q: `Can you just reflect any Origin with credentials: true?`,
          a: `Technically yes (\`origin: true\`), but then any website can make logged-in requests to your API from a victim's browser and read the responses. Always use an allow-list with credentials.`,
        },
        {
          q: `How else can you avoid CORS completely?`,
          a: `Serve the frontend and API from the same origin: a reverse proxy (Nginx, Vercel rewrites, Next.js API routes) routes \`/api\` to the backend. Same origin = no CORS.`,
        },
      ],
    },
    {
      id: `nosql-injection-login`,
      title: `Prevent NoSQL injection in a login route`,
      difficulty: `medium`,
      type: `scenario`,
      frequency: `very common`,
      relatedTopic: `security-helmet-sanitization`,
      question: `A security tester logs in as the **first user in the database (an admin)** without knowing any password. They sent this body:

\`\`\`json
{ "email": { "$ne": null }, "password": { "$ne": null } }
\`\`\`

The login route:

\`\`\`javascript
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  req.session.userId = user.id;
  res.json({ message: 'Logged in' });
});
\`\`\`

Explain the attack and fix the route properly. What other layers would you add?`,
      hints: [
        `\`{ "$ne": null }\` is a MongoDB **operator** meaning "not equal to null". What does \`findOne({ email: { $ne: null } })\` match?`,
        `The code expects strings but never checks. Validate that \`email\` and \`password\` are strings.`,
        `There is a second, bigger problem: the password is compared directly in the query. How should passwords be stored?`,
      ],
      solution: `**The attack:** \`express.json()\` happily parses objects. So \`email\` becomes \`{ $ne: null }\`, and the query becomes "find a user whose email is not null and whose password is not null". That matches **every** user, and \`findOne\` returns the first one — often the admin. This is **NoSQL injection**: user input is treated as query **operators** instead of plain values.

**Second bug:** passwords are stored and compared as plain text. They must be hashed with bcrypt (or argon2).

**Fixed route:**

\`\`\`javascript
import { z } from 'zod';
import bcrypt from 'bcrypt';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

// A real bcrypt hash of a random string, used to keep timing the same
const DUMMY_HASH = process.env.DUMMY_BCRYPT_HASH;

app.post('/api/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid email or password format' });
    }
    const { email, password } = parsed.data; // guaranteed plain strings now

    // Look up by email ONLY. Never put the password in the query.
    const user = await User.findOne({ email }).select('+passwordHash');

    // Always run bcrypt, even when the user doesn't exist, so response time
    // does not reveal which emails are registered
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) {
      return res.status(401).json({ message: 'Invalid email or password' }); // same message for both
    }

    req.session.regenerate((err) => {          // new session id: prevents session fixation
      if (err) return next(err);
      req.session.userId = user.id;
      res.json({ message: 'Logged in' });
    });
  } catch (err) {
    next(err);
  }
});
\`\`\`

**Why it works:** the zod schema guarantees \`email\` and \`password\` are strings. A string can never be a Mongo operator. The password is checked with \`bcrypt.compare\`, not inside the query.

**Defence in depth (more layers):**

- **Mongoose \`sanitizeFilter\`**: \`mongoose.set('sanitizeFilter', true)\` wraps values that look like operators (\`$ne\`, \`$gt\`) so they are treated as plain values. Available in modern Mongoose; check your version.
- Rate limiting and brute-force protection on \`/login\`.
- \`select: false\` on \`passwordHash\` in the schema so it is never returned by accident.
- Never pass \`req.body\` or \`req.query\` straight into \`find()\`, \`updateOne()\` or \`$where\`.`,
      followUps: [
        {
          q: `Is express-mongo-sanitize enough on its own?`,
          a: `It removes keys starting with \`$\` or containing \`.\` from req.body/query/params, which helps. But validation with types is the real fix. Also check it supports your Express version — Express 5 made \`req.query\` a read-only getter, which broke some sanitizer packages.`,
        },
        {
          q: `Can the same attack happen through query params?`,
          a: `Yes. With the extended query parser, \`?email[$ne]=x\` becomes \`{ email: { $ne: 'x' } }\`. Validate query params the same way.`,
        },
        {
          q: `Why the same error message for wrong email and wrong password?`,
          a: `Different messages let attackers find which emails are registered (user enumeration). Same message plus similar response time hides it.`,
        },
      ],
    },
    {
      id: `request-id-tracing`,
      title: `Add request IDs for tracing across logs`,
      difficulty: `medium`,
      type: `coding`,
      frequency: `common`,
      relatedTopic: `logging-morgan-winston`,
      question: `Production logs are a mess: 50 requests run at the same time, and you can't tell which log lines belong to which request. Add a **request ID**:

1. Every request gets an id. If the load balancer or another service already sent \`X-Request-Id\`, reuse it (if it looks valid).
2. Return it in the \`X-Request-Id\` response header (users can quote it in bug reports).
3. Any code — including a service 5 calls deep that does **not** have \`req\` — can log with the id automatically.
4. Pass the id on when calling other internal services.`,
      hints: [
        `\`crypto.randomUUID()\` creates a unique id. Validate incoming ids (length, allowed characters) — they are user input.`,
        `Passing \`req\` into every function is ugly. Node has \`AsyncLocalStorage\` (in \`node:async_hooks\`) that keeps a value for the whole async chain of a request.`,
        `Wrap \`next()\` inside \`als.run(store, () => next())\`.`,
      ],
      solution: `**Idea:** a middleware creates (or reuses) the id, sets the header, and stores it in **AsyncLocalStorage** (ALS). ALS is like a "per-request global": any code that runs as part of this request, even after \`await\`, can read it.

\`\`\`javascript
// context/requestContext.js
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const als = new AsyncLocalStorage();
const VALID_ID = /^[A-Za-z0-9-]{1,64}$/; // don't trust incoming headers blindly

export function requestContext(req, res, next) {
  const incoming = req.get('X-Request-Id');
  const requestId = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();

  req.id = requestId;
  res.set('X-Request-Id', requestId);

  // Everything that runs inside next() - sync or async - sees this store
  als.run({ requestId }, () => next());
}

export const getRequestId = () => als.getStore()?.requestId;
\`\`\`

\`\`\`javascript
// logger.js - every log line gets the id automatically
import pino from 'pino';
import { getRequestId } from './context/requestContext.js';

export const logger = pino({
  mixin() {
    return { requestId: getRequestId() }; // added to every log call
  },
});

// services/paymentService.js - no req needed
export async function chargeOrder(order) {
  logger.info({ orderId: order.id }, 'charging order');
  // Propagate the id to other internal services
  const res = await fetch('http://billing.internal/charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Request-Id': getRequestId() ?? '' },
    body: JSON.stringify({ orderId: order.id, amount: order.total }),
  });
  return res.json();
}
\`\`\`

\`\`\`javascript
// app.js - register FIRST, so every later log line has the id
app.use(requestContext);
app.use(requestLogger);
\`\`\`

**Why it works:** \`als.run(store, fn)\` attaches \`store\` to everything started inside \`fn\`, including promises and timers created later in that request. Two requests running at the same time each see their own store. The error handler can also include \`req.id\` in the error response so support can find the logs.

**Edge cases:**

- Validate incoming ids: an attacker could send a huge or multi-line value to pollute logs.
- Some older callback-based libraries can lose the ALS context. If \`getStore()\` returns undefined there, pass the id explicitly.
- For full distributed tracing (timings across services), use **OpenTelemetry**, which uses the standard \`traceparent\` header.`,
      followUps: [
        {
          q: `Why not just store the id in a module-level variable?`,
          a: `Node handles many requests at once on one thread. A global would be overwritten by the next request while the first is still awaiting the database. ALS gives each request its own copy.`,
        },
        {
          q: `Does AsyncLocalStorage cost performance?`,
          a: `A small amount. It is used widely in production (APM tools, OpenTelemetry), and for most APIs the cost is not noticeable. Measure if you are on a very hot path.`,
        },
      ],
    },
    {
      id: `rate-limiter-fixed-window`,
      title: `Rate limiter middleware: in-memory, then across many servers`,
      difficulty: `hard`,
      type: `coding`,
      frequency: `very common`,
      relatedTopic: `rate-limiting`,
      question: `**Part 1.** Without using a library, write \`rateLimit({ windowMs, max })\`: each client (by IP) may make at most \`max\` requests per \`windowMs\`. Extra requests get **429 Too Many Requests** with a \`Retry-After\` header.

\`\`\`javascript
app.use('/api', rateLimit({ windowMs: 60_000, max: 100 }));
app.post('/api/login', rateLimit({ windowMs: 15 * 60_000, max: 5 }), login);
\`\`\`

**Part 2.** The API now runs on **4 servers** behind a load balancer. Why does your limiter break, and how do you fix it?`,
      hints: [
        `Fixed window: keep \`{ count, resetAt }\` per key in a \`Map\`. When \`now >= resetAt\`, start a new window.`,
        `Old entries must be deleted or the Map grows forever (a memory leak). A \`setInterval\` with \`.unref()\` can sweep them.`,
        `Part 2: each server has its own Map, so a client gets 4 × max. Move the counter to Redis: \`INCR\` + set an expiry, done atomically.`,
      ],
      solution: `**Idea (Part 1):** a **fixed window** counter. Each key (IP) has a count and the time its window ends. Each request increments the count. Above \`max\` → 429.

\`\`\`javascript
// middleware/rateLimit.js
export function rateLimit({ windowMs = 60_000, max = 100, keyGenerator = (req) => req.ip } = {}) {
  const hits = new Map(); // key -> { count, resetAt }

  // Sweep expired entries so the Map does not grow forever
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  timer.unref(); // don't keep the process alive just for this timer

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs }; // start a new window
      hits.set(key, entry);
    }
    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(remaining));
    res.set('RateLimit-Reset', String(resetSeconds));

    if (entry.count > max) {
      res.set('Retry-After', String(resetSeconds));
      return res.status(429).json({ message: 'Too many requests, try again later' });
    }
    next();
  };
}
\`\`\`

**Important:** behind a load balancer or proxy, \`req.ip\` is the proxy's IP — everyone shares one limit! Set \`app.set('trust proxy', 1)\` (number of proxies in front of you) so Express reads the real client IP from \`X-Forwarded-For\`. Don't set it to \`true\` blindly: clients could then fake their IP with that header.

**Part 2 — why it breaks:** each of the 4 servers has its own \`Map\`. The load balancer spreads requests, so a client can make up to 4 × max requests. A restart also resets every counter.

**Fix:** keep the counter in a **shared store — Redis**. Use a small Lua script so "increment" and "set expiry" happen **atomically** (as one step):

\`\`\`javascript
// middleware/redisRateLimit.js  (using ioredis)
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// INCR the key; on the first hit, set its expiry. Return count and time left.
const SCRIPT = \`
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
  return { count, redis.call('PTTL', KEYS[1]) }
\`;

export function redisRateLimit({ windowMs = 60_000, max = 100, prefix = 'rl' } = {}) {
  return async (req, res, next) => {
    try {
      const key = \`\${prefix}:\${req.ip}\`;
      const [count, ttlMs] = await redis.eval(SCRIPT, 1, key, windowMs);
      const resetSeconds = Math.ceil(Math.max(ttlMs, 0) / 1000);

      res.set('RateLimit-Limit', String(max));
      res.set('RateLimit-Remaining', String(Math.max(0, max - count)));
      if (count > max) {
        res.set('Retry-After', String(resetSeconds));
        return res.status(429).json({ message: 'Too many requests' });
      }
      next();
    } catch (err) {
      // Redis is down: choose "fail open" (allow) for normal APIs,
      // "fail closed" (block) for very sensitive routes like login
      req.log?.warn({ err }, 'rate limiter unavailable');
      next();
    }
  };
}
\`\`\`

**Why it works:** all servers read and write the **same** counter in Redis. Redis runs commands one at a time, and the Lua script runs as one unit, so two servers can never both "see" count 99. The key expires by itself, so there is no cleanup job.

**Trade-offs of a fixed window:** a client can send \`max\` requests at 0:59 and \`max\` again at 1:00 — a burst of 2 × max in 2 seconds. A **sliding window** (Redis sorted set of timestamps) or a **token bucket** smooths this out.

**In real projects:** use \`express-rate-limit\` with a Redis store (e.g. \`rate-limit-redis\`), or rate limit at the edge (API gateway, Nginx, Cloudflare).`,
      followUps: [
        {
          q: `Fixed window vs sliding window vs token bucket?`,
          a: `Fixed window: simple counter per time block, allows bursts at the edges. Sliding window: counts requests in the last N seconds exactly (more memory) or approximately (weighted two windows). Token bucket: tokens refill at a steady rate and each request spends one — allows short bursts but caps the average rate.`,
        },
        {
          q: `What key would you use instead of IP?`,
          a: `For logged-in users, the user id or API key is fairer (many users can share one office/mobile IP). For login, combine IP and the target username. Often you apply both an IP limit and a user limit.`,
        },
        {
          q: `Why is the in-memory version still useful?`,
          a: `Single-instance apps, local development, and as a cheap first layer. It also has zero network cost. But it must not be your only protection once you scale horizontally.`,
        },
      ],
    },
    {
      id: `stripe-webhook-raw-body`,
      title: `Stripe webhook signature fails because of express.json()`,
      difficulty: `hard`,
      type: `debug`,
      frequency: `common`,
      relatedTopic: `body-parsers`,
      question: `Payments work, but every Stripe webhook fails with:

\`\`\`text
StripeSignatureVerificationError: No signatures found matching the expected signature for payload.
\`\`\`

\`\`\`javascript
const app = express();
app.use(express.json());

app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  if (event.type === 'checkout.session.completed') {
    await Order.updateOne({ _id: event.data.object.metadata.orderId }, { status: 'paid' });
    await sendReceiptEmail(event.data.object.customer_email);
  }
  res.json({ received: true });
});

app.use('/api', apiRouter); // needs JSON bodies
\`\`\`

1. Fix the signature error while keeping \`express.json()\` for the rest of the API.
2. Stripe may deliver the **same event more than once**. Make the handler safe for that.
3. What else is wrong with this handler?`,
      hints: [
        `The signature is computed over the **exact raw bytes** Stripe sent. What does \`express.json()\` do to the body?`,
        `Use \`express.raw({ type: 'application/json' })\` on the webhook route only, and register it **before** the global \`express.json()\`.`,
        `Each event has a unique \`event.id\`. Record processed ids with a unique index so duplicates are skipped.`,
      ],
      solution: `**Why it fails:** Stripe signs the **raw body bytes** with your webhook secret. \`express.json()\` parses the body into an object, so \`req.body\` is no longer the original bytes. Turning it back into a string never gives the exact same bytes (spacing, key order), so the signature check fails.

**Other problems in the handler:**

- \`constructEvent\` throws on a bad signature, and there is no try/catch → unhandled error (in Express 4, a crash or hang).
- No protection against **duplicate** deliveries → the receipt email can be sent twice.
- Slow work (email) runs before responding. Stripe expects a quick 2xx, otherwise it treats the delivery as failed and retries.

**Fixed version:**

\`\`\`javascript
const app = express();

// 1. Webhook route FIRST, with the raw body (a Buffer)
app.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,                                // Buffer: exact bytes
        req.get('stripe-signature'),
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).send(\`Webhook signature error: \${err.message}\`);
    }

    // 2. Idempotency: try to claim this event id (unique _id = event.id)
    const claim = await ProcessedEvent.updateOne(
      { _id: event.id },
      { $setOnInsert: { type: event.type, receivedAt: new Date() } },
      { upsert: true },
    );
    if (claim.upsertedCount === 0) {
      return res.json({ received: true, duplicate: true }); // already handled
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Only move forward from 'pending': safe even if events arrive out of order
        await Order.updateOne(
          { _id: session.metadata.orderId, status: 'pending' },
          { status: 'paid', paidAt: new Date() },
        );
        await emailQueue.add('receipt', { email: session.customer_email }); // background job
      }
      res.json({ received: true });
    } catch (err) {
      // Release the claim so Stripe's retry can process it again
      await ProcessedEvent.deleteOne({ _id: event.id });
      res.status(500).json({ received: false });
    }
  },
);

// 2. JSON parser for everything else, AFTER the webhook route
app.use(express.json());
app.use('/api', apiRouter);
\`\`\`

**Why it works:** the webhook route gets a Buffer with the original bytes, so the signature matches. Other routes still get parsed JSON. The \`ProcessedEvent\` insert works like a lock: only the first delivery of an event id gets \`upsertedCount === 1\`. The \`status: 'pending'\` condition makes the order update safe to repeat. The email goes to a queue, so the response is fast.

**Alternative:** keep one global parser and save the raw bytes: \`express.json({ verify: (req, res, buf) => { req.rawBody = buf; } })\`, then pass \`req.rawBody\` to \`constructEvent\`.`,
      followUps: [
        {
          q: `Why not just trust the webhook without verifying the signature?`,
          a: `Anyone who finds the URL could POST a fake "payment succeeded" event and get free orders. The signature proves the request came from Stripe and was not changed.`,
        },
        {
          q: `What if events arrive out of order (e.g. updated before created)?`,
          a: `Do not rely on order. Use conditional updates (only move status forward), or fetch the latest object from the Stripe API inside the handler and use that as the truth.`,
        },
        {
          q: `How do you test webhooks locally?`,
          a: `Use the Stripe CLI: \`stripe listen --forward-to localhost:3000/webhooks/stripe\` gives you a local signing secret, and \`stripe trigger checkout.session.completed\` sends test events.`,
        },
      ],
    },
    {
      id: `login-brute-force-protection`,
      title: `Protect the login endpoint from brute force`,
      difficulty: `hard`,
      type: `scenario`,
      frequency: `common`,
      relatedTopic: `brute-force-protection`,
      question: `Your logs show one IP trying **thousands of passwords** against \`POST /api/login\`, and a botnet of **10,000 IPs** each trying 2-3 common passwords against many different emails ("password spraying").

The app runs on several servers. How would you protect login **without** locking real users out of their own accounts? Write the core middleware/logic.`,
      hints: [
        `Two different attacks need two different keys: per IP (one machine, many tries) and per account (many machines, one target).`,
        `Locking an account forever lets an attacker lock out anyone. Use short, growing (exponential) delays instead.`,
        `State must be shared across servers (Redis). Reset the failure counter on a successful login.`,
      ],
      solution: `**Idea:** several layers, all stored in Redis so every server sees the same numbers.

1. **Per-IP limit** — stops one machine hammering (e.g. 50 attempts / 15 min).
2. **Per-account failure counter** — stops many machines targeting one account. After 5 failures, a **temporary** lock that grows: 1 min, 2 min, 4 min… (max 1 hour).
3. **Same error + same timing** for unknown email and wrong password.
4. Reset the account counter on success.

\`\`\`javascript
// services/loginGuard.js  (ioredis)
const MAX_FAILS = 5;
const FAIL_WINDOW_SEC = 15 * 60;
const BASE_LOCK_SEC = 60;
const MAX_LOCK_SEC = 60 * 60;

const failKey = (email) => \`login:fail:\${email}\`;
const lockKey = (email) => \`login:lock:\${email}\`;

// Returns seconds the account is still locked (0 = not locked)
export async function lockedFor(email) {
  const ttl = await redis.ttl(lockKey(email));
  return ttl > 0 ? ttl : 0;
}

export async function recordFailure(email) {
  const fails = await redis.incr(failKey(email));
  if (fails === 1) await redis.expire(failKey(email), FAIL_WINDOW_SEC);

  if (fails >= MAX_FAILS) {
    // Exponential backoff: 60s, 120s, 240s ... up to 1 hour
    const lockSec = Math.min(BASE_LOCK_SEC * 2 ** (fails - MAX_FAILS), MAX_LOCK_SEC);
    await redis.set(lockKey(email), '1', 'EX', lockSec);
  }
  return fails;
}

export async function recordSuccess(email) {
  await redis.del(failKey(email), lockKey(email));
}
\`\`\`

\`\`\`javascript
// routes/auth.js
router.post(
  '/login',
  redisRateLimit({ prefix: 'rl:login-ip', windowMs: 15 * 60_000, max: 50 }), // layer 1: per IP
  validate({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body; // already validated + lowercased

      const wait = await lockedFor(email);  // layer 2: per account
      if (wait > 0) {
        res.set('Retry-After', String(wait));
        return res.status(429).json({ message: 'Too many attempts. Try again later.' });
      }

      const user = await User.findOne({ email }).select('+passwordHash');
      const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH); // same timing

      if (!user || !ok) {
        const fails = await recordFailure(email); // count unknown emails too: hides which exist
        return res.status(401).json({
          message: 'Invalid email or password',
          captchaRequired: fails >= 3,            // frontend shows a CAPTCHA
        });
      }

      await recordSuccess(email);
      // ...create session / tokens
      res.json({ message: 'Logged in' });
    } catch (err) {
      next(err);
    }
  },
);
\`\`\`

**Why it works:** the IP limit stops a single attacker. The per-account counter stops spraying from many IPs, because the counter is on the **email**, not the IP. The lock is short and grows, so a real user is only delayed a little, and an attacker cannot lock someone out for days.

**More layers to mention:**

- **CAPTCHA** after a few failures (only for this browser/account) — cheap for humans, expensive for bots.
- **MFA** (one-time codes, passkeys) — a stolen password alone is not enough.
- Check new passwords against known-breached lists (e.g. Have I Been Pwned's k-anonymity API).
- Alert the user by email on many failures or a login from a new device.
- A WAF / bot protection at the edge (Cloudflare, AWS WAF) for very large attacks.
- Set \`trust proxy\` correctly, or the "IP" is your load balancer's IP.`,
      followUps: [
        {
          q: `Why not lock the account permanently after 5 failures?`,
          a: `Then anyone who knows a user's email can lock them out (a denial-of-service on that user). Temporary, growing locks plus CAPTCHA slow attackers without hurting real users much.`,
        },
        {
          q: `Why is bcrypt itself a defence?`,
          a: `bcrypt is deliberately slow (cost factor). Each guess costs CPU time, so even if the hash database leaks, offline guessing is slow. On the server, also be aware that bcrypt load can be used to stress your CPU — another reason for rate limits.`,
        },
      ],
    },
    {
      id: `structure-growing-express-app`,
      title: `Structure a growing Express app`,
      difficulty: `hard`,
      type: `design`,
      frequency: `very common`,
      relatedTopic: `mvc-layered-architecture`,
      question: `Your Express API started as one \`index.js\`. It is now **3,000 lines**: routes contain Mongoose queries, Stripe calls, emails and validation all mixed together. Tests are impossible, and three developers keep getting merge conflicts.

Propose a structure. Show:

1. the folder layout,
2. what each layer is allowed to do,
3. one feature ("create order") written across the layers,
4. how this makes testing easier.`,
      hints: [
        `Think layers: routes → controllers → services → repositories (data access). Each layer only calls the one below.`,
        `Group by **feature** (modules/orders, modules/users) instead of by type when the app is big.`,
        `Split \`app.js\` (builds the app, no listen) from \`server.js\` (starts listening) so tests can import the app.`,
      ],
      solution: `**Idea:** split by **feature**, and inside each feature split by **responsibility**. Each layer has one job, and dependencies only point downward.

\`\`\`text
src/
  app.js                 # creates the express app: middleware, routes, error handler (NO listen)
  server.js              # imports app, connects DB, app.listen, graceful shutdown
  config/index.js        # reads + validates env vars once (e.g. with zod)
  middleware/            # auth, validate, requestContext, errorHandler, rateLimit
  errors/                # AppError, NotFoundError, ...
  lib/                   # clients: db.js, redis.js, stripe.js, logger.js
  modules/
    orders/
      order.routes.js      # URL + middleware -> controller
      order.controller.js  # HTTP only: read req, call service, send res
      order.service.js     # business rules, no req/res
      order.repository.js  # database queries only
      order.model.js       # Mongoose schema
      order.schemas.js     # zod schemas for requests
      order.service.test.js
    users/ ...
\`\`\`

**Rules per layer:**

- **Routes:** map URL + method to middleware and a controller. No logic.
- **Controllers:** translate HTTP ↔ plain data. No database calls. No business rules.
- **Services:** business logic ("can this user order this?", "calculate total", "charge payment"). They know nothing about Express (\`req\`/\`res\`), so they can be reused by jobs, queues or CLI scripts.
- **Repositories:** the only place that talks to MongoDB. Switching databases or adding caching touches only this layer.

**"Create order" across the layers:**

\`\`\`javascript
// order.routes.js
const router = Router();
router.post('/', authenticate, validate({ body: createOrderSchema }), orderController.create);
export default router;

// order.controller.js
export const create = async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json(order);
};

// order.service.js
export function makeOrderService({ orderRepo, productRepo, payments }) {
  return {
    async createOrder(userId, { items }) {
      const products = await productRepo.findByIds(items.map((i) => i.productId));
      if (products.length !== items.length) throw new ValidationError('Unknown product in order');

      // Use prices from the DB, never from the client
      const total = items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);
        return sum + product.priceCents * item.quantity;
      }, 0);

      const order = await orderRepo.create({ userId, items, total, status: 'pending' });
      await payments.createPaymentIntent(order.id, total);
      return order;
    },
  };
}

// order.repository.js
export const orderRepo = {
  create: (data) => Order.create(data).then((doc) => doc.toObject()),
  findById: (id) => Order.findById(id).lean(),
};
\`\`\`

**Testing gets easy:**

- **Unit test services** by passing fake repos (dependency injection — the service receives its dependencies instead of importing them):

\`\`\`javascript
const service = makeOrderService({
  productRepo: { findByIds: async () => [{ id: 'p1', priceCents: 500 }] },
  orderRepo: { create: async (data) => ({ id: 'o1', ...data }) },
  payments: { createPaymentIntent: async () => {} },
});
const order = await service.createOrder('u1', { items: [{ productId: 'p1', quantity: 2 }] });
// expect(order.total).toBe(1000)
\`\`\`

- **Integration test routes** with supertest: \`request(app).post('/api/orders')\` — possible because \`app.js\` does not call \`listen\`.

**Why it works:** small files with one job each mean fewer merge conflicts, easier reviews, and logic that can be tested without HTTP or a real database. Feature folders keep everything about "orders" in one place.

**Don't over-engineer:** for a tiny service, routes + services is enough. Add repositories and DI when the app and team grow.`,
      followUps: [
        {
          q: `Where does validation belong — controller or service?`,
          a: `Shape validation (types, required fields) at the edge with a middleware. Business rules (enough stock, user may order this) in the service, because they apply no matter who calls the service.`,
        },
        {
          q: `Feature folders vs type folders (controllers/, services/)?`,
          a: `Type folders are fine for small apps. Feature folders scale better: a change to orders touches one folder, and you could later extract a module into its own service.`,
        },
        {
          q: `Should services throw HTTP errors?`,
          a: `They throw domain errors like \`NotFoundError\` or \`ValidationError\`. The error middleware maps them to HTTP status codes. Services should not call \`res.status()\`.`,
        },
      ],
    },
    {
      id: `graceful-shutdown-health-checks`,
      title: `Zero-downtime deploys: graceful shutdown and health checks`,
      difficulty: `hard`,
      type: `scenario`,
      frequency: `common`,
      relatedTopic: `production-graceful-shutdown`,
      question: `Every time you deploy to Kubernetes (or ECS / Cloud Run), users see a few **502 errors** and some orders are half-saved. Your \`server.js\` is:

\`\`\`javascript
mongoose.connect(process.env.MONGO_URL);
app.listen(3000, () => console.log('listening'));
\`\`\`

Explain what happens during a deploy, and implement graceful shutdown plus liveness and readiness health checks.`,
      hints: [
        `The platform sends **SIGTERM** to the old container, waits a grace period, then **SIGKILL**s it. What does Node do on SIGTERM by default?`,
        `Stop accepting new connections with \`server.close()\`, let in-flight requests finish, then close DB connections.`,
        `Readiness = "send me traffic?" (return 503 while shutting down). Liveness = "am I alive?" (keep it cheap).`,
      ],
      solution: `**What happens now:** on deploy, the old container gets \`SIGTERM\`. Node's default for SIGTERM is to **exit immediately**. Requests in the middle of processing are cut off (502 at the load balancer, half-written data). Also, the load balancer may still send new requests to a pod that is going away.

**Fix:** catch SIGTERM, stop taking new work, finish current work, close resources, then exit. Add health endpoints so the platform knows when to route traffic.

\`\`\`javascript
// app.js - health routes go FIRST (before auth, routers and the 404 handler)
import mongoose from 'mongoose';

const app = express();
app.locals.shuttingDown = false;

// Liveness: is the process healthy? Keep it cheap (no DB call),
// or the platform may restart pods just because the DB is slow.
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Readiness: should the load balancer send traffic here?
app.get('/readyz', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1; // 1 = connected
  if (app.locals.shuttingDown || !dbReady) return res.status(503).send('not ready');
  res.status(200).send('ready');
});

// While shutting down, ask keep-alive clients to reconnect elsewhere
app.use((req, res, next) => {
  if (app.locals.shuttingDown) res.set('Connection', 'close');
  next();
});

// ...json parser, auth, routers, 404, error handler
export default app;
\`\`\`

\`\`\`javascript
// server.js
import mongoose from 'mongoose';
import app from './app.js';

await mongoose.connect(process.env.MONGO_URL);
const server = app.listen(process.env.PORT ?? 3000, () => console.log('listening'));

async function shutdown(signal) {
  if (app.locals.shuttingDown) return;
  app.locals.shuttingDown = true; // readiness now returns 503
  console.log(\`\${signal} received, shutting down gracefully\`);

  // Safety net: if something hangs, force exit before the platform's SIGKILL
  const force = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 25_000);
  force.unref();

  // Stop accepting new connections; callback runs when existing ones are done
  server.close(async (err) => {
    try {
      await mongoose.connection.close(); // close DB pool after requests finish
      // also: await redis.quit(); await queue.close();
      process.exit(err ? 1 : 0);
    } catch (closeErr) {
      console.error(closeErr);
      process.exit(1);
    }
  });

  // Idle keep-alive connections can keep server.close() waiting
  server.closeIdleConnections?.();
}

process.on('SIGTERM', () => shutdown('SIGTERM')); // platform stop
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C locally
\`\`\`

**Why it works:** \`server.close()\` stops new connections but lets running requests finish. Readiness turns 503, so the load balancer stops routing to this instance. Only after all requests are done do we close MongoDB, so no request loses its DB connection halfway. The forced timeout must be **shorter** than the platform's grace period (Kubernetes default: 30 seconds).

**Production details:**

- Kubernetes may still send a few requests right after SIGTERM (endpoint removal is not instant). A short \`preStop\` sleep (a few seconds) helps.
- Behind Docker, run Node as PID 1 correctly (\`CMD ["node", "server.js"]\`, not \`npm start\`, which may not forward signals), or use \`--init\`/tini.
- Idle keep-alive connections: newer Node versions handle them better on \`close()\`; check your Node version's docs. \`closeIdleConnections()\` is a safe extra step where available.
- Half-saved orders: also use MongoDB transactions or idempotent steps, so a crash mid-way can be retried safely.`,
      followUps: [
        {
          q: `Liveness vs readiness — why two endpoints?`,
          a: `Liveness failing means "restart me" (the process is stuck). Readiness failing means "don't send me traffic for now" (starting up, DB down, shutting down). Mixing them up causes restart loops when a dependency is slow.`,
        },
        {
          q: `What about long-running requests like SSE streams or LLM streaming?`,
          a: `They never "finish", so server.close() would wait forever. Track them, send a final event telling clients to reconnect, and end them during shutdown. Clients then reconnect to a new instance.`,
        },
      ],
    },
  ],
};
