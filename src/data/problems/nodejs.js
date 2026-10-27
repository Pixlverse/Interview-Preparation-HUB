// Interview problems for the Node.js stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'nodejs',
  problems: [
    {
      id: 'event-loop-basic-order',
      title: 'Event loop: nextTick vs Promise vs setTimeout',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'nexttick-setimmediate-settimeout',
      question: `What does this print? The file is run as a normal CommonJS script: \`node order.js\`.

\`\`\`javascript
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

process.nextTick(() => console.log('D'));

(async () => {
  console.log('E');
  await null;
  console.log('F');
})();

console.log('G');
\`\`\``,
      hints: [
        'First, all normal (synchronous) code runs top to bottom. Remember: an async function runs synchronously until its first `await`.',
        'After the sync code, Node empties the `process.nextTick` queue, then the Promise (microtask) queue.',
        'Code after `await` is just a Promise `.then` in disguise. Timers run last, in the next event loop phase.',
      ],
      solution: `**Output:**

\`\`\`text
A
E
G
D
C
F
B
\`\`\`

**Step by step:**

1. **Sync code:** \`A\`, then \`E\` (the async function runs right away until \`await\`), then \`G\`.
2. **nextTick queue:** Node runs all \`process.nextTick\` callbacks before Promise callbacks → \`D\`.
3. **Microtask (Promise) queue:** \`C\` was queued first, then the code after \`await null\` → \`C\`, \`F\`.
4. **Timers phase:** the event loop now starts. The \`setTimeout\` callback runs → \`B\`.

**Why it works:** a simple rule for CommonJS scripts: **sync code → nextTick → promises → timers / I/O / setImmediate**. Both queues (nextTick and promises) are emptied completely before the event loop moves on.

**Edge case:** \`await\` on a value that is not a Promise still waits for one microtask. It never continues synchronously.`,
      followUps: [
        {
          q: 'Does the order change if the file is an ES module (`order.mjs` or `"type": "module"`)?',
          a: 'Yes. An ES module is itself run from inside a Promise job, so the Promise queue is drained before Node gets to the nextTick queue. The output becomes `A E G C F D B`. This is a good reason not to depend on nextTick-vs-promise order in real code.',
        },
        {
          q: 'What happens if a nextTick callback schedules another nextTick, forever?',
          a: 'The event loop is **starved**. Node keeps draining the nextTick queue and never reaches timers or I/O, so the server stops answering. Prefer `setImmediate` when you want to "run later" but let I/O happen first.',
        },
      ],
    },
    {
      id: 'exports-vs-module-exports',
      title: 'exports vs module.exports: what does main.js print?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'modules-cjs-esm',
      question: `Two CommonJS files. What does \`node main.js\` print?

\`\`\`javascript
// math.js
exports.add = (a, b) => a + b;
module.exports = { sub: (a, b) => a - b };
exports.mul = (a, b) => a * b;
\`\`\`

\`\`\`javascript
// main.js
const m = require('./math');
console.log(Object.keys(m));
console.log(typeof m.add, typeof m.mul);

const again = require('./math');
console.log(m === again);
\`\`\``,
      hints: [
        '`exports` is just a variable that starts out pointing to the same object as `module.exports`.',
        '`require()` returns `module.exports`, not `exports`. What happens to the link when you assign a new object to `module.exports`?',
        'Node caches a module after the first `require`.',
      ],
      solution: `**Output:**

\`\`\`text
[ 'sub' ]
undefined undefined
true
\`\`\`

**Why:**

- At the start, \`exports\` and \`module.exports\` point to the **same** empty object. So \`exports.add\` is added to that object.
- \`module.exports = { sub }\` replaces the object. Now \`module.exports\` points to a **new** object, but \`exports\` still points to the **old** one.
- \`exports.mul\` goes onto the old object, which nobody will ever see.
- \`require()\` returns \`module.exports\` → only \`sub\`.
- The second \`require('./math')\` does not run the file again. Node returns the **cached** object, so \`m === again\` is \`true\`.

**Fix:** pick one style per file:

\`\`\`javascript
// Style 1: add properties to exports
exports.add = (a, b) => a + b;
exports.sub = (a, b) => a - b;

// Style 2: replace module.exports once, at the end
module.exports = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
};
\`\`\``,
      followUps: [
        {
          q: 'Since modules are cached, how can two files share state?',
          a: 'Export an object (for example a DB connection or an in-memory Map). Every `require` gets the same object, so it acts like a singleton for that process. Note: the cache key is the resolved file path, so two copies of a package in `node_modules` give two different instances.',
        },
        {
          q: 'What is the ES module version of this?',
          a: 'Use `export const add = ...` (named) or `export default {...}`. ES module exports are live bindings and you cannot "lose" them by reassigning like with `exports`.',
        },
      ],
    },
    {
      id: 'promisify-callback-api',
      title: 'Promisify a callback-style function',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'callbacks-promises-async',
      question: `An old library gives you callback-style functions (Node "error-first" callbacks):

\`\`\`javascript
function getUser(id, cb) {
  setTimeout(() => {
    if (id <= 0) return cb(new Error('Invalid id'));
    cb(null, { id, name: 'Asha' });
  }, 50);
}
\`\`\`

1. Write your own \`myPromisify(fn)\` so you can do \`const user = await getUserAsync(1)\`.
2. It must also keep \`this\` working when the function is a method on an object.
3. Which built-in does the same thing?`,
      hints: [
        'The new function must return `new Promise((resolve, reject) => ...)`.',
        'Call the original function with all the user\'s arguments, plus one extra argument: your own callback `(err, result) => ...`.',
        'Use a normal `function` (not an arrow) for the returned function and call `fn.call(this, ...args, callback)` to keep `this`.',
      ],
      solution: `**Idea:** wrap the call in a Promise. Add our own callback as the last argument. If it gets an error, reject. Otherwise, resolve with the result.

\`\`\`javascript
function myPromisify(fn) {
  // normal function so "this" is whatever the caller used
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) return reject(err); // error-first: first arg is the error
        resolve(result);
      });
    });
  };
}

// Usage
const getUserAsync = myPromisify(getUser);

async function main() {
  console.log(await getUserAsync(1)); // { id: 1, name: 'Asha' }
  try {
    await getUserAsync(0);
  } catch (e) {
    console.log('Error:', e.message);  // Error: Invalid id
  }
}
main();

// Methods keep "this"
const greeter = {
  prefix: 'Hi',
  greet(name, cb) { cb(null, this.prefix + ' ' + name); },
};
greeter.greetAsync = myPromisify(greeter.greet);
greeter.greetAsync('Ravi').then(console.log); // Hi Ravi
\`\`\`

**Built-in:** \`util.promisify\`:

\`\`\`javascript
const { promisify } = require('node:util');
const getUserAsync2 = promisify(getUser);

// For core modules, use the ready-made promise APIs instead:
const fs = require('node:fs/promises');
const text = await fs.readFile('notes.txt', 'utf8'); // inside an async function
\`\`\`

**Why it works:** the Promise settles exactly once, when the library calls our callback. The error-first convention tells us which branch to take.

**Edge case:** this only works for **error-first** callbacks where the callback is the **last** argument. Functions that call back more than once (like event streams) are not a fit for a Promise.`,
      followUps: [
        {
          q: 'How would you go the other way: turn an async function into a callback one?',
          a: 'Use `util.callbackify(asyncFn)`. Or by hand: `asyncFn(...args).then((r) => cb(null, r), (e) => cb(e))`.',
        },
        {
          q: 'Some functions like `setTimeout` don\'t have an error-first callback. How does `util.promisify` handle them?',
          a: 'Such functions can provide a custom version through `util.promisify.custom`. For timers you can just use `require(\'node:timers/promises\')` — e.g. `await setTimeout(1000)` from that module.',
        },
      ],
    },
    {
      id: 'readfilesync-in-handler',
      title: 'Debug: fs.readFileSync inside a request handler',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'single-thread-non-blocking',
      question: `This Express route works in development. Under load (hundreds of requests per second), every route on the server gets slow — even routes that have nothing to do with emails. Why? Fix it.

\`\`\`javascript
const fs = require('node:fs');
const path = require('node:path');

app.get('/email-preview/:name', (req, res) => {
  // read the 200 KB HTML template on EVERY request
  const template = fs.readFileSync(
    path.join(__dirname, 'templates', 'welcome.html'),
    'utf8'
  );
  res.send(template.replace('{{name}}', req.params.name));
});
\`\`\``,
      hints: [
        'Node runs your JavaScript on one main thread. What is that thread doing while `readFileSync` waits for the disk?',
        'Does the template file change between requests? Does it need to be read every time?',
      ],
      solution: `**The bug:** \`readFileSync\` is **blocking**. While it reads the disk, the one JavaScript thread waits and can't do anything else. No other request, timer or DB callback can run. Under load these small waits add up, so **all** routes get slow.

**Fix 1 (best here): read once at startup and cache it.** The template does not change while the server runs.

\`\`\`javascript
const fs = require('node:fs');
const path = require('node:path');

// Sync is OK here: it runs once at startup, before we accept traffic
const welcomeTemplate = fs.readFileSync(
  path.join(__dirname, 'templates', 'welcome.html'),
  'utf8'
);

app.get('/email-preview/:name', (req, res) => {
  res.send(welcomeTemplate.replace('{{name}}', req.params.name));
});
\`\`\`

**Fix 2: if the file really changes (or there are many files), use the async API.**

\`\`\`javascript
const fsp = require('node:fs/promises');

app.get('/email-preview/:name', async (req, res, next) => {
  try {
    const template = await fsp.readFile(
      path.join(__dirname, 'templates', 'welcome.html'),
      'utf8'
    );
    res.send(template.replace('{{name}}', req.params.name));
  } catch (err) {
    next(err);
  }
});
\`\`\`

**Why it works:** the async version hands the disk read to libuv's thread pool. The main thread is free to handle other requests while the file is read.

**Bonus bug:** \`req.params.name\` is put into HTML without escaping. That is an XSS risk. Escape it (or use a template engine that escapes by default).`,
      followUps: [
        {
          q: 'When is it fine to use sync fs methods?',
          a: 'At startup (loading config, certificates, templates), in CLI scripts and in build tools. Basically anywhere that is not serving many users at the same time.',
        },
        {
          q: 'The file is 2 GB instead of 200 KB. Is `fsp.readFile` OK now?',
          a: 'No. It loads the whole file into memory. Stream it instead: `fs.createReadStream(file)` piped to the response with `stream.pipeline`.',
        },
      ],
    },
    {
      id: 'env-config-validation',
      title: 'Load and validate environment config at startup',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'env-variables',
      question: `Your app reads \`process.env\` everywhere in the code. Last week a deploy went out without \`STRIPE_SECRET_KEY\`. The app started fine, then crashed on the first payment.

Write a \`config.js\` module that:

- reads \`PORT\` (number, default 3000), \`MONGO_URI\` (required), \`STRIPE_SECRET_KEY\` (required), \`ENABLE_CRON\` (boolean, default false)
- **fails at startup** with a clear message that lists **all** problems at once
- returns a typed, read-only config object the rest of the app imports`,
      hints: [
        'All values in `process.env` are **strings** (or `undefined`). `"false"` is a truthy string!',
        'Collect errors in an array instead of throwing on the first one.',
        'Call the loader once at the top of your server file, before connecting to anything.',
      ],
      solution: `**Idea:** one module reads and checks every env var once. It converts strings into proper types and throws one error listing every problem. The rest of the app never touches \`process.env\`.

\`\`\`javascript
// config.js
function required(name) {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(\`Missing required env var: \${name}\`);
  }
  return value.trim();
}

function toPort(name, fallback) {
  const raw = process.env[name] ?? String(fallback);
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    throw new Error(\`\${name} must be a port number (1-65535), got "\${raw}"\`);
  }
  return n;
}

function toBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  throw new Error(\`\${name} must be true/false, got "\${raw}"\`);
}

function loadConfig() {
  const errors = [];
  const read = (fn) => {
    try { return fn(); } catch (e) { errors.push(e.message); }
  };

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const config = {
    nodeEnv,
    port: read(() => toPort('PORT', 3000)),
    mongoUri: read(() => required('MONGO_URI')),
    stripeKey: read(() => required('STRIPE_SECRET_KEY')),
    enableCron: read(() => toBool('ENABLE_CRON', false)),
  };

  // cross-field rule: production must use a live key
  if (config.stripeKey && nodeEnv === 'production' && !config.stripeKey.startsWith('sk_live_')) {
    errors.push('STRIPE_SECRET_KEY must be a live key in production');
  }

  if (errors.length) {
    // show ALL problems at once, not one per restart
    throw new Error('Invalid config:\\n- ' + errors.join('\\n- '));
  }
  return Object.freeze(config); // nobody can change it later by mistake
}

module.exports = { loadConfig };
\`\`\`

\`\`\`javascript
// server.js
const { loadConfig } = require('./config');
const config = loadConfig(); // crashes here, at startup, if anything is wrong
// ...connect to Mongo with config.mongoUri, listen on config.port
\`\`\`

With nothing set, the error is:

\`\`\`text
Invalid config:
- Missing required env var: MONGO_URI
- Missing required env var: STRIPE_SECRET_KEY
\`\`\`

**Why it works:** "fail fast" — a bad deploy fails health checks right away and is rolled back, instead of failing later on a real customer's payment.

**Edge cases:** \`Boolean("false")\` is \`true\`, so parse booleans by hand. Never log the full config — it contains secrets.`,
      followUps: [
        {
          q: 'How would you do this in a TypeScript project?',
          a: 'Use a schema library like **zod**: `z.object({ PORT: z.coerce.number().default(3000), MONGO_URI: z.string().url(), ... }).parse(process.env)`. You get validation and a TypeScript type from one schema.',
        },
        {
          q: 'How do you load a `.env` file in development?',
          a: 'Use the `dotenv` package, or newer Node versions have the `--env-file=.env` flag (check the docs for your Node version). In production, set real env vars or use a secret manager (AWS Secrets Manager, GCP Secret Manager) — don\'t ship `.env` files.',
        },
      ],
    },
    {
      id: 'eventemitter-on-once-error',
      title: 'EventEmitter: on, once and the special "error" event',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'events-eventemitter',
      question: `What does this print?

\`\`\`javascript
const EventEmitter = require('node:events');
const bus = new EventEmitter();

bus.on('order', (id) => console.log('on', id));
bus.once('order', (id) => console.log('once', id));

console.log('before');
bus.emit('order', 1);
bus.emit('order', 2);
console.log('after', bus.listenerCount('order'));

try {
  bus.emit('error', new Error('boom'));
} catch (e) {
  console.log('caught', e.message);
}
\`\`\``,
      hints: [
        'Is `emit()` synchronous or asynchronous?',
        'Listeners run in the order they were added. `once` removes itself after the first call.',
        'What does Node do with an `error` event when nobody listens for it?',
      ],
      solution: `**Output:**

\`\`\`text
before
on 1
once 1
on 2
after 1
caught boom
\`\`\`

**Why:**

- \`emit()\` is **synchronous**. It calls every listener right away, in the order they were added. So \`on 1\` and \`once 1\` print before \`emit\` returns.
- The \`once\` listener removes itself after the first call. The second emit only reaches the \`on\` listener. One listener is left.
- \`error\` is special. If you emit \`error\` and **no** listener exists, Node **throws** the error. Here our \`try/catch\` catches it. In a real app (for example inside a callback), nothing catches it and the **process crashes**.

**The fix in real code:** always add an \`error\` listener to emitters you create or use (streams, sockets, DB clients):

\`\`\`javascript
bus.on('error', (err) => {
  console.error('bus error:', err.message); // log it, maybe retry or clean up
});
\`\`\``,
      followUps: [
        {
          q: 'How do you wait for one event with async/await?',
          a: 'Use `const [value] = await events.once(emitter, \'ready\')` from `node:events`. It resolves with the event arguments as an array, and rejects if `error` is emitted first.',
        },
        {
          q: 'What does the "MaxListenersExceededWarning" mean?',
          a: 'More than 10 listeners (the default) were added for one event on one emitter. It is usually a **memory leak**: code adds a listener on every request and never removes it. Fix the leak; only raise the limit with `setMaxListeners` if many listeners are really expected.',
        },
      ],
    },
    {
      id: 'unhandled-rejection-crash',
      title: 'Debug: one bad request crashes the whole server',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'unhandled-rejections-uncaught',
      question: `This Express 4 API runs on Node 20. When a user asks for an id that does not exist, the **whole process crashes** and every other user gets errors until it restarts. Why, and how do you fix it?

\`\`\`javascript
app.get('/users/:id', async (req, res) => {
  const user = await userService.getById(req.params.id); // throws "User not found"
  res.json(user);
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
\`\`\``,
      hints: [
        'What does an `async` function return? What happens when it throws?',
        'Express 4 calls your handler but ignores the Promise it returns. Nobody calls `.catch()` on it.',
        'Since Node 15, an unhandled Promise rejection crashes the process by default.',
      ],
      solution: `**The bug:** an \`async\` handler returns a Promise. When \`getById\` throws, that Promise is **rejected**. Express 4 does not look at the returned Promise, so the error never reaches the error middleware. It becomes an **unhandled rejection**, and since Node 15 the default is to **crash the process**.

**Fix 1: catch and pass to \`next(err)\`.**

\`\`\`javascript
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err); // now the error middleware handles it
  }
});
\`\`\`

**Fix 2 (cleaner): a small wrapper used on every async route.**

\`\`\`javascript
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json(user);
}));
\`\`\`

**Fix 3:** upgrade to **Express 5**, which passes rejected promises from handlers to \`next\` for you.

**Plus a safety net (log, then exit and let PM2/Kubernetes restart):**

\`\`\`javascript
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection');
  process.exit(1); // state may be broken; restart clean
});
\`\`\`

**Why it works:** each fix makes sure someone calls \`.catch()\` on the handler's Promise, so the error turns into a 500/404 response for one user instead of killing the server for all users.

**Better still:** "User not found" should be a **404**, not a 500. Throw a custom \`NotFoundError\` with \`status = 404\` and use \`err.status\` in the error middleware.`,
      followUps: [
        {
          q: 'Why not just catch unhandledRejection and keep running?',
          a: 'You no longer know what state the app is in (half-written data, open connections). Log it, let in-flight requests finish if you can, then exit. A process manager restarts a clean process.',
        },
        {
          q: 'What other common code creates unhandled rejections?',
          a: 'Calling an async function without `await` or `.catch()` ("fire and forget"), e.g. `sendEmail(user)` inside a handler. Either `await` it, add `.catch(log)`, or push the work to a queue.',
        },
      ],
    },
    {
      id: 'event-loop-inside-io-callback',
      title: 'Event loop: setTimeout vs setImmediate inside an I/O callback',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'event-loop-phases',
      question: `What does this print? Is the order always the same?

\`\`\`javascript
const fs = require('node:fs');

fs.readFile(__filename, () => {
  console.log('1: readFile callback');
  setTimeout(() => console.log('2: timeout'), 0);
  setImmediate(() => console.log('3: immediate'));
  process.nextTick(() => console.log('4: nextTick'));
  Promise.resolve().then(() => console.log('5: promise'));
});

console.log('6: sync');
\`\`\`

Bonus: what about these two lines at the **top level** of a file (not inside any callback)?

\`\`\`javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
\`\`\``,
      hints: [
        'The readFile callback runs in the **poll** phase (the I/O phase) of the event loop.',
        'Which phase comes right after poll: timers or check (where setImmediate runs)?',
        'At the top level, it depends on whether 1 ms has already passed when the loop starts.',
      ],
      solution: `**Output (always this order):**

\`\`\`text
6: sync
1: readFile callback
4: nextTick
5: promise
3: immediate
2: timeout
\`\`\`

**Why:**

1. \`6: sync\` — sync code runs first. The file read happens in the background.
2. When the read finishes, its callback runs in the **poll** phase → \`1\`.
3. After **any** callback, Node drains nextTick then promises → \`4\`, \`5\`.
4. The phase order is: timers → pending → **poll → check** → close → back to timers. Right after poll comes **check**, where \`setImmediate\` runs → \`3\`.
5. The loop goes around to **timers** → \`2\`.

So inside an I/O callback, \`setImmediate\` **always** runs before \`setTimeout(fn, 0)\`.

**Bonus (top level):** the order is **not guaranteed**. \`setTimeout(fn, 0)\` really means "at least 1 ms". When the loop starts, if 1 ms has already passed, the timer fires first; if not, the loop moves on and \`setImmediate\` fires first. It depends on how busy the machine is. Running it 20 times can print \`immediate\` first most times and \`timeout\` first other times.`,
      followUps: [
        {
          q: 'When would you use setImmediate in real code?',
          a: 'To split a long CPU job into pieces: do a chunk of work, then `setImmediate(nextChunk)`. That lets I/O callbacks (incoming requests) run between chunks, so the server stays responsive.',
        },
        {
          q: 'Why are the names confusing?',
          a: '`process.nextTick` runs **before** the loop continues (more "immediate" than setImmediate), and `setImmediate` runs on the **next** loop turn. Node\'s own docs admit the names should be swapped, but it is too late to change.',
        },
      ],
    },
    {
      id: 'read-large-csv-readline',
      title: 'Sum a 5 GB CSV file line by line',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'streams',
      question: `You have a 5 GB \`orders.csv\` export. The server has 1 GB of RAM. Print the total \`amount\` per \`country\`.

\`\`\`text
orderId,country,amount
1,US,1.50
2,DE,2.50
3,IN,oops
...
\`\`\`

- Skip the header and empty lines.
- Count bad rows (like \`oops\`) instead of crashing.
- Handle a missing file with a clean error.`,
      hints: [
        '`fs.readFile` loads the whole file into memory. With 1 GB RAM that will crash. You need a **stream**.',
        'The `readline` module turns a stream into lines. `rl` is async-iterable, so you can use `for await (const line of rl)`.',
        'Set `crlfDelay: Infinity` so Windows line endings (`\\r\\n`) count as one line break.',
      ],
      solution: `**Idea:** stream the file and process one line at a time. Only the current chunk (about 64 KB) and the totals object are in memory, no matter how big the file is.

\`\`\`javascript
const fs = require('node:fs');
const readline = require('node:readline');

async function totalsByCountry(filePath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity, // treat \\r\\n as one line break
  });

  const totals = {};
  let lineNo = 0;
  let goodRows = 0;
  let badRows = 0;

  for await (const line of rl) {
    lineNo++;
    if (lineNo === 1) continue;   // skip header
    if (!line.trim()) continue;   // skip empty lines

    const [, country, amountRaw] = line.split(',');
    const amount = Number(amountRaw);
    if (!country || Number.isNaN(amount)) {
      badRows++;
      continue;
    }
    totals[country] = (totals[country] ?? 0) + amount;
    goodRows++;
  }

  return { totals, goodRows, badRows };
}

totalsByCountry('orders.csv')
  .then((result) => console.log(result))
  .catch((err) => {
    // a missing file rejects here with code ENOENT
    console.error('Failed:', err.message);
    process.exitCode = 1;
  });
\`\`\`

**Why it works:** \`createReadStream\` reads small chunks. \`readline\` cuts them into lines, even when a line is split across two chunks. \`for await\` pulls one line at a time, and the stream pauses while we are busy, so memory stays flat (**backpressure**).

**Complexity:** O(n) time for n lines. Memory is O(number of countries), not O(file size).

**Edge cases:**

- \`split(',')\` breaks on quoted values like \`"Smith, John"\`. For real CSVs use a streaming parser like \`csv-parse\`.
- Adding many decimals gives floating-point errors (\`0.1 + 0.2\`). For money, convert to integer cents first.`,
      followUps: [
        {
          q: 'How would you make it faster on a multi-core machine?',
          a: 'Usually the disk is the bottleneck, not the CPU. If parsing is the slow part, split the file into byte ranges (cut at newlines) and process each range in a worker thread, then merge the totals.',
        },
        {
          q: 'What if each line must be saved to MongoDB?',
          a: 'Don\'t insert one row at a time. Collect rows into a batch of ~1000 and `await collection.insertMany(batch, { ordered: false })`. Because you `await` inside `for await`, reading pauses while the DB writes — natural backpressure.',
        },
      ],
    },
    {
      id: 'serve-large-file-pipeline',
      title: 'Serve a 2 GB file download without running out of memory',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'stream-pipeline-backpressure',
      question: `This endpoint crashes the server with "JavaScript heap out of memory" when users download a large report. Rewrite it with the plain \`http\` module (or Express) so it uses little memory and cleans up if the user cancels the download.

\`\`\`javascript
app.get('/download', async (req, res) => {
  const data = await fs.promises.readFile('/data/report.bin'); // 2 GB!
  res.send(data);
});
\`\`\``,
      hints: [
        '`res` (the response) is a **writable stream**. A file can be a **readable stream**.',
        'If the network is slower than the disk, who stops the disk reading too fast? (backpressure)',
        'Use `pipeline` from `node:stream/promises` — not `.pipe()` — so errors and client disconnects destroy both streams.',
      ],
      solution: `**Idea:** stream the file to the response in small chunks. \`pipeline\` connects the two streams, respects backpressure and cleans up on errors.

\`\`\`javascript
const http = require('node:http');
const fs = require('node:fs');
const { pipeline } = require('node:stream/promises');

const FILE = '/data/report.bin';

const server = http.createServer(async (req, res) => {
  if (req.url !== '/download') {
    res.statusCode = 404;
    return res.end('Not found');
  }

  let stat;
  try {
    stat = await fs.promises.stat(FILE); // size for Content-Length
  } catch {
    res.statusCode = 404;
    return res.end('File missing');
  }

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': stat.size,
    'Content-Disposition': 'attachment; filename="report.bin"',
  });

  try {
    // moves chunks, handles backpressure, and destroys BOTH
    // streams if either side fails or the client disconnects
    await pipeline(fs.createReadStream(FILE), res);
  } catch (err) {
    // ERR_STREAM_PREMATURE_CLOSE = user cancelled the download
    if (err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      console.error('download failed:', err.message);
    }
  }
});

server.listen(3000);
\`\`\`

**Why it works:**

- Only a few 64 KB chunks are in memory at a time. A 50 MB test download kept the whole process under ~90 MB RSS.
- **Backpressure:** when \`res.write()\` returns \`false\` (the socket buffer is full because the user's network is slow), \`pipeline\` pauses the file stream and resumes it on the \`drain\` event.
- If the user closes the tab, \`pipeline\` destroys the file stream, so we don't leak a file descriptor.

**Why not \`.pipe()\`?** \`src.pipe(res)\` does handle backpressure, but if \`res\` closes early it does **not** destroy \`src\`, and errors on one stream are not forwarded. You must wire that up by hand. \`pipeline\` does it for you.

**In Express:** \`res.sendFile(path)\` also streams the file and supports Range requests.`,
      followUps: [
        {
          q: 'How would you support resuming a download?',
          a: 'Read the `Range: bytes=start-end` header, reply `206 Partial Content` with `Content-Range`, and use `fs.createReadStream(file, { start, end })`. `res.sendFile` already does this.',
        },
        {
          q: 'The file is in S3. Should Node stream it?',
          a: 'Usually no. Generate a short-lived **pre-signed URL** and redirect the user to S3/CloudFront. Your server does no work and pays no bandwidth. Stream through Node only if you must transform or check the data.',
        },
        {
          q: 'How would you gzip it on the fly?',
          a: 'Add a transform: `pipeline(fs.createReadStream(file), zlib.createGzip(), res)` and set `Content-Encoding: gzip`. Drop `Content-Length` because the compressed size is unknown upfront.',
        },
      ],
    },
    {
      id: 'transform-stream-csv-to-json',
      title: 'Write a Transform stream: CSV to JSON lines',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'streams',
      question: `Write \`csvToNdjson()\`, a **Transform stream** that turns CSV into NDJSON (one JSON object per line), so it can be used like this:

\`\`\`javascript
await pipeline(
  fs.createReadStream('users.csv'),
  csvToNdjson(),
  fs.createWriteStream('users.ndjson')
);
\`\`\`

\`\`\`text
users.csv                         users.ndjson
name,email,plan                   {"name":"Asha","email":"asha@x.com","plan":"pro"}
Asha,asha@x.com,pro        ->     {"name":"Ravi","email":"ravi@x.com","plan":"free"}
Ravi,ravi@x.com,free
\`\`\`

Warm-up first: write a Transform that upper-cases everything from \`stdin\` to \`stdout\`.`,
      hints: [
        'A Transform needs a `transform(chunk, encoding, callback)` function. Call `callback(null, output)` to push data out.',
        'A chunk is a random piece of the file. It can end in the **middle** of a line. Keep the unfinished last part for the next chunk.',
        'Use `flush(callback)` to handle the last line when the input ends. Use a `StringDecoder` so emojis or accents split across chunks don\'t break.',
      ],
      solution: `**Warm-up — uppercase:**

\`\`\`javascript
const { Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');

const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});

pipeline(process.stdin, upper, process.stdout).catch(console.error);
// echo "hello world" | node upper.js   ->   HELLO WORLD
\`\`\`

**Idea for CSV:** keep a \`leftover\` string. Add each chunk to it, split into lines, and keep the last (maybe incomplete) piece for next time. The first line is the header.

\`\`\`javascript
const { Transform } = require('node:stream');
const { StringDecoder } = require('node:string_decoder');

function csvToNdjson() {
  let leftover = '';                         // partial line from the last chunk
  let headers = null;                        // column names from line 1
  const decoder = new StringDecoder('utf8'); // safe for multi-byte characters

  function lineToJson(line) {
    if (!line.trim()) return '';             // skip empty lines
    const values = line.split(',');
    if (!headers) {
      headers = values.map((h) => h.trim());
      return '';                             // header row: no output
    }
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim(); });
    return JSON.stringify(obj) + '\\n';
  }

  return new Transform({
    transform(chunk, encoding, callback) {
      const text = leftover + decoder.write(chunk);
      const lines = text.split(/\\r?\\n/);
      leftover = lines.pop();                // last piece may be incomplete
      callback(null, lines.map(lineToJson).join(''));
    },
    flush(callback) {
      // input ended: the leftover is the final line (no trailing newline)
      callback(null, lineToJson(leftover + decoder.end()));
    },
  });
}

module.exports = { csvToNdjson };
\`\`\`

**Why it works:** we never assume a chunk holds whole lines. The \`leftover\` joins a line that was split across chunks. \`flush\` makes sure the last line is not lost. Tested with 5-byte chunks and names like \`Ashä\` and \`Ravi 😀\`; output was correct.

**Why \`StringDecoder\`?** One emoji is 4 bytes. If a chunk ends after byte 2, \`chunk.toString()\` produces garbage characters. The decoder holds back incomplete bytes until the next chunk.

**Edge cases:** quoted commas (\`"Smith, John"\`) need a real CSV parser (\`csv-parse\`). Calling \`callback\` with an empty string is fine — nothing is pushed.`,
      followUps: [
        {
          q: 'How would you output objects instead of strings, e.g. to insert into MongoDB in a later step?',
          a: 'Create the Transform with `readableObjectMode: true` and `this.push(obj)` for each row. The next stream (a Writable with `objectMode: true`) receives JS objects.',
        },
        {
          q: 'Can you write this without a Transform class?',
          a: 'Yes. `pipeline` accepts async generator functions: `async function* (source) { for await (const chunk of source) { ... yield line; } }`. It is often easier to read.',
        },
      ],
    },
    {
      id: 'concurrency-limit',
      title: 'Process 10,000 tasks with at most 5 running at once',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'callbacks-promises-async',
      question: `You must call a partner API for 10,000 user ids. The partner allows **at most 5 requests at the same time**.

- \`Promise.all(ids.map(fetchUser))\` starts all 10,000 at once → you get banned.
- A plain \`for\` loop with \`await\` runs one at a time → it takes hours.

Write \`mapWithLimit(items, limit, worker)\`. It returns results **in the same order** as \`items\`, and never runs more than \`limit\` workers at once. No libraries.

\`\`\`javascript
const users = await mapWithLimit(ids, 5, (id) => fetchUser(id));
\`\`\``,
      hints: [
        'Think of 5 "lanes" (runners). Each lane takes the next item, waits for it, then takes another.',
        'A shared index counter is safe: JavaScript runs one piece of code at a time, so `i = next++` can never be done by two lanes at once.',
        'Start `limit` runners and `await Promise.all(runners)`. Store each result at `results[i]` to keep the order.',
      ],
      solution: `**Idea:** start \`limit\` async "runners". Each one loops: take the next index, \`await\` the worker, repeat until no items are left. So exactly \`limit\` tasks are in flight, and a new one starts as soon as one finishes.

\`\`\`javascript
async function mapWithLimit(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0; // shared ticket counter for all runners

  async function runner() {
    while (nextIndex < items.length) {
      const i = nextIndex++;               // take a ticket (safe: single thread)
      results[i] = await worker(items[i], i);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, runner);
  await Promise.all(runners);              // rejects on the first error
  return results;                          // same order as input
}

// Test
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let running = 0;
let maxRunning = 0;

async function fakeFetch(id) {
  running++;
  maxRunning = Math.max(maxRunning, running);
  await sleep(Math.random() * 50);
  running--;
  return 'user-' + id;
}

(async () => {
  const ids = Array.from({ length: 20 }, (_, i) => i + 1);
  const users = await mapWithLimit(ids, 5, fakeFetch);
  console.log(users.slice(0, 3), 'max in flight:', maxRunning);
  // [ 'user-1', 'user-2', 'user-3' ] max in flight: 5
})();
\`\`\`

**Why it works:** there are only \`limit\` runners, and each runner only has one task at a time. Results go to \`results[i]\`, so order is kept even though tasks finish in random order.

**Complexity:** O(n) time overall; memory O(n) for results.

**Edge cases:** empty array → \`[]\` right away. If one task throws, \`Promise.all\` rejects, but the other runners keep going in the background. If you want **all** results including failures, catch inside the worker and return \`{ status: 'rejected', reason }\` (like \`Promise.allSettled\`).`,
      followUps: [
        {
          q: 'Why not split into batches of 5 and Promise.all each batch?',
          a: 'Each batch waits for its **slowest** task, so lanes sit idle. The runner pattern starts a new task as soon as any lane frees up — better throughput.',
        },
        {
          q: 'What library would you use in production?',
          a: '`p-limit` / `p-map` for in-process limits. For millions of jobs or work that must survive restarts, use a queue (BullMQ, SQS) with a worker concurrency setting.',
        },
        {
          q: 'The partner also limits to 100 requests per minute. Does this solve it?',
          a: 'No. Concurrency limit ("how many at once") is different from rate limit ("how many per time window"). Add a token bucket or use a library like `bottleneck`, and handle `429` responses with retry + backoff.',
        },
      ],
    },
    {
      id: 'retry-exponential-backoff',
      title: 'Retry a flaky API call with exponential backoff',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'error-handling',
      question: `Calls to a payment provider sometimes fail with \`503\` or a network timeout, then work a second later. Write \`retry(fn, options)\`:

- try \`fn\`; on failure wait and try again, up to \`retries\` extra times
- waits grow: 200 ms, 400 ms, 800 ms… (**exponential backoff**), capped at a max
- add **jitter** (randomness) to the wait
- do **not** retry errors that will never succeed (like \`400 Bad Request\`)

\`\`\`javascript
const charge = await retry(() => callProvider(order), {
  retries: 3,
  shouldRetry: isRetryable,
});
\`\`\``,
      hints: [
        'A `for` loop with `try { return await fn() } catch { ... }` is simpler than recursion.',
        'Delay = `base * 2 ** attempt`, then `Math.min` with a max.',
        'Jitter: wait `Math.random() * delay`. Why? If 1,000 servers all retry at exactly 200 ms, they hit the provider at the same moment again.',
      ],
      solution: `**Idea:** loop over attempts. On error, check if we should give up. If not, sleep for an exponentially growing, randomized time, then try again.

\`\`\`javascript
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retry(fn, {
  retries = 3,              // extra attempts after the first one
  baseDelayMs = 200,
  maxDelayMs = 5000,
  shouldRetry = () => true, // which errors are worth retrying
} = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      const isLast = attempt >= retries;
      if (isLast || !shouldRetry(err)) throw err; // give up: original error

      // exponential: 200, 400, 800, ... capped at maxDelayMs
      const expDelay = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      // "full jitter": random wait between 0 and expDelay
      const delay = Math.round(Math.random() * expDelay);
      console.warn(\`attempt \${attempt + 1} failed (\${err.message}), retrying in \${delay}ms\`);
      await sleep(delay);
    }
  }
}

// Only retry problems that might go away by themselves
const isRetryable = (err) =>
  err.status === undefined ||  // network error / timeout
  err.status === 429 ||        // rate limited
  err.status >= 500;           // server error
\`\`\`

**Test result:** a function that fails twice with \`503\` then succeeds returns \`'ok'\` after 3 calls. A \`400\` error is thrown after **1** call. An error that never stops is thrown after \`retries + 1\` calls.

**Why it works:** backoff gives the other service time to recover instead of hammering it. Jitter spreads retries from many clients over time. \`shouldRetry\` avoids wasting time on errors that will never pass.

**Edge cases:**

- **Idempotency!** Retrying a payment that actually went through but timed out can charge the customer twice. Send an **idempotency key** (Stripe supports the \`Idempotency-Key\` header) so the provider ignores duplicates.
- If the server sends a \`Retry-After\` header (common with 429), wait that long instead.`,
      followUps: [
        {
          q: 'What is a circuit breaker and how is it different?',
          a: 'Retry handles a single call. A circuit breaker watches many calls: after too many failures it "opens" and fails fast for a while (no calls at all), then lets a few test calls through. It protects both you and the struggling service. Library example: `opossum`.',
        },
        {
          q: 'How would you add a timeout to each attempt?',
          a: 'Pass an `AbortSignal.timeout(ms)` to `fetch` (or use `AbortController`). A timed-out attempt throws an `AbortError`/`TimeoutError`, which `shouldRetry` can treat as retryable.',
        },
      ],
    },
    {
      id: 'hash-password-scrypt',
      title: 'Hash and verify passwords with crypto.scrypt (no libraries)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'crypto-module',
      question: `Your team can't add \`bcrypt\` (native build problems on the CI image). Using only \`node:crypto\`, write:

\`\`\`javascript
const stored = await hashPassword('s3cret!');      // string to save in MongoDB
const ok = await verifyPassword('s3cret!', stored); // true / false
\`\`\`

Also explain: why not just \`sha256(password)\`?`,
      hints: [
        'Use a **salt**: random bytes, different for every user, stored next to the hash. It is not secret.',
        'Use the **async** `crypto.scrypt` (promisify it). The sync version blocks the event loop for every login.',
        'Compare hashes with `crypto.timingSafeEqual`, not `===`.',
      ],
      solution: `**Idea:** \`scrypt\` is a slow, memory-hard hash made for passwords. Make a random salt, hash, and store \`algorithm$salt$hash\` in one string. To verify, re-hash the attempt with the same salt and compare in constant time.

\`\`\`javascript
const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const KEY_LEN = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);                // new random salt per user
  const hash = await scrypt(password, salt, KEY_LEN); // runs in the libuv thread pool
  // store everything needed to verify later, in one string
  return \`scrypt$\${salt.toString('hex')}$\${hash.toString('hex')}\`;
}

async function verifyPassword(password, stored) {
  const [algo, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  // constant-time compare: does not stop at the first different byte
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword };
\`\`\`

Tested: the right password → \`true\`, a wrong one → \`false\`, a broken stored string → \`false\`. Hashing the same password twice gives **different** strings (different salts).

**Why not \`sha256(password)\`?**

- SHA-256 is **fast** — a GPU can try billions of guesses per second. Password hashes must be **slow** on purpose.
- Without a salt, the same password gives the same hash. Attackers use pre-computed tables ("rainbow tables"), and one crack reveals every user with that password.

**Why \`timingSafeEqual\`?** A normal compare stops at the first different byte, so it answers faster for worse guesses. An attacker can measure that. \`timingSafeEqual\` always takes the same time. (It throws if lengths differ — here both are \`KEY_LEN\` bytes.)`,
      followUps: [
        {
          q: 'Why is the async version important?',
          a: 'scrypt is slow on purpose (tens of ms). The sync version blocks the main thread for that time on **every** login, so 50 logins at once freeze the server. The async version runs in the libuv thread pool (4 threads by default).',
        },
        {
          q: 'How do you raise the cost later without breaking old users?',
          a: 'Store the cost parameters in the string too (e.g. `scrypt$N=16384$salt$hash`). On successful login, if the stored cost is old, re-hash the password with the new cost and save it.',
        },
      ],
    },
    {
      id: 'verify-webhook-hmac',
      title: 'Verify a webhook signature with HMAC',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'crypto-module',
      question: `A partner sends webhooks to \`POST /webhooks/orders\`. Each request has a header \`X-Signature\`: the **hex HMAC-SHA256** of the raw request body, using a shared secret. Write an Express route that rejects fake requests.

Your teammate's first try fails for every real webhook:

\`\`\`javascript
app.use(express.json());

app.post('/webhooks/orders', (req, res) => {
  const sig = crypto.createHmac('sha256', SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  if (sig !== req.headers['x-signature']) return res.sendStatus(401);
  // ...
});
\`\`\`

Why does it fail, and what else is wrong with it?`,
      hints: [
        'Is `JSON.stringify(JSON.parse(body))` always byte-for-byte the same as the original body? (spaces, key order, unicode escapes)',
        'You need the **raw bytes**. `express.raw({ type: \'application/json\' })` on that one route gives you a Buffer.',
        'Compare with `crypto.timingSafeEqual`, and check lengths first because it throws on different lengths.',
      ],
      solution: `**Why it fails:** the partner signed the **exact bytes** they sent. \`express.json()\` parses them, and \`JSON.stringify\` rebuilds a **different** string (different spacing, maybe escaped characters). One different byte → a totally different HMAC.

**Also wrong:** \`!==\` is not constant-time (timing attack), and a missing header is not handled.

\`\`\`javascript
const crypto = require('node:crypto');
const express = require('express');
const app = express();

function verifySignature(rawBody, signatureHeader, secret) {
  if (typeof signatureHeader !== 'string') return false;

  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(rawBody)            // the EXACT bytes received
    .digest('hex');

  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(signatureHeader, 'hex');

  // timingSafeEqual throws if lengths differ, so check first
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(received, expected);
}

// raw body ONLY for this route; register it BEFORE app.use(express.json())
app.post(
  '/webhooks/orders',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const ok = verifySignature(req.body, req.get('x-signature'), process.env.WEBHOOK_SECRET);
    if (!ok) return res.sendStatus(401);

    const event = JSON.parse(req.body.toString('utf8')); // parse only after verifying
    // ...queue the work, then answer fast
    res.sendStatus(200);
  }
);

app.use(express.json()); // other routes still get parsed JSON
\`\`\`

Tested: correct signature → \`true\`; wrong secret, short/garbage signature, missing header, or a re-formatted body → \`false\`.

**Why it works:** HMAC proves the sender knows the secret and the body was not changed. Using the raw bytes means we hash exactly what they hashed.

**Edge cases:**

- **Replay attacks:** someone resends an old valid request. Good providers sign a timestamp too (Stripe's header has \`t=...\`). Reject old timestamps (e.g. older than 5 minutes) and store processed event ids to ignore duplicates.
- With Stripe, use \`stripe.webhooks.constructEvent(rawBody, sig, secret)\` — it does all of this for you, but it still needs the raw body.`,
      followUps: [
        {
          q: 'Why answer 200 fast and do the work later?',
          a: 'Providers time out after a few seconds and **retry**. Slow handlers cause duplicate deliveries. Save the event (or push to a queue), reply 200, and process in a worker. Make processing idempotent anyway.',
        },
        {
          q: 'HMAC vs a plain hash of body + secret?',
          a: 'HMAC is designed for this and is safe against "length extension" attacks that break naive `sha256(secret + body)` constructions. Always use `createHmac`.',
        },
      ],
    },
    {
      id: 'blocking-event-loop-debug',
      title: 'Debug: /health takes 3 seconds when login traffic spikes',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'single-thread-non-blocking',
      question: `During a marketing campaign, the load balancer marks your servers unhealthy: \`GET /health\` (which just returns \`ok\`) takes seconds. CPU is high. Find the problems in this code and fix them.

\`\`\`javascript
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.sendStatus(401);

  const hash = crypto
    .pbkdf2Sync(req.body.password, user.salt, 600000, 64, 'sha512')
    .toString('hex');
  if (hash !== user.passwordHash) return res.sendStatus(401);

  res.json({ token: signToken(user) });
});

app.post('/profile/bio', (req, res) => {
  // "words separated by single spaces"
  if (!/^(\\w+\\s?)*$/.test(req.body.bio)) return res.status(400).send('Invalid bio');
  // ...
});

app.get('/health', (req, res) => res.send('ok'));
\`\`\``,
      hints: [
        'Any function whose name ends in `Sync` runs on the main thread. How long does 600,000 rounds of PBKDF2 take?',
        'The regex has a group with `+` inside a `*`. What happens when the input almost matches but ends with `!`?',
        'If one request keeps the main thread busy, every other request — even `/health` — waits in line.',
      ],
      solution: `**Bug 1: \`pbkdf2Sync\` blocks the event loop.** 600,000 rounds take roughly 100-200 ms of pure CPU (in a test, 5 sync calls took ~770 ms). During that time Node can't run any other code. 20 logins in a burst = seconds of a frozen server, so \`/health\` waits too.

**Bug 2: catastrophic regex backtracking (ReDoS).** In \`/^(\\w+\\s?)*$/\`, the text \`aaaa\` can be split into words in a huge number of ways (\`a|aaa\`, \`aa|aa\`, ...). When the input ends with \`!\` and can't match, the regex engine tries **every** split. In a test, \`'a'.repeat(30) + '!'\` took **over 6 seconds**. One malicious request freezes the whole server.

**Bonus bug:** \`hash !== user.passwordHash\` is not a constant-time compare.

**Fix:**

\`\`\`javascript
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const pbkdf2 = promisify(crypto.pbkdf2);

app.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.sendStatus(401);

    // async version runs in the libuv thread pool, main thread stays free
    const hash = await pbkdf2(req.body.password, user.salt, 600000, 64, 'sha512');
    const stored = Buffer.from(user.passwordHash, 'hex');
    if (stored.length !== hash.length || !crypto.timingSafeEqual(hash, stored)) {
      return res.sendStatus(401);
    }
    res.json({ token: signToken(user) });
  } catch (err) {
    next(err);
  }
});

app.post('/profile/bio', (req, res) => {
  const bio = String(req.body.bio ?? '');
  if (bio.length > 500) return res.status(400).send('Bio too long'); // limit input first
  // no nested quantifiers: a word, then (space + word) repeated
  if (!/^\\w+( \\w+)*$/.test(bio)) return res.status(400).send('Invalid bio');
  // ...
});
\`\`\`

**Why it works:** the async \`pbkdf2\` moves hashing to background threads (5 parallel calls took ~320 ms total vs ~770 ms blocking). The new regex has only one way to match each input, so it runs in linear time (the same 31-character input: ~0 ms).

**How to find this in production:** watch **event loop lag** (\`perf_hooks.monitorEventLoopDelay\`), take a CPU profile (\`node --cpu-prof\` or \`--inspect\` + Chrome DevTools) and look for wide bars like \`pbkdf2Sync\` or \`RegExp\`.`,
      followUps: [
        {
          q: 'The async pbkdf2 is used, but under huge load logins still queue up. Why?',
          a: 'The libuv thread pool has only **4 threads** by default (shared with fs, dns.lookup, zlib). Extra hash jobs wait. You can raise `UV_THREADPOOL_SIZE` (set it before startup) up to about the number of CPU cores, add more instances, and rate-limit `/login`.',
        },
        {
          q: 'What other common things block the event loop?',
          a: '`JSON.parse`/`JSON.stringify` of huge payloads, big sync loops over arrays (sorting 1M items), `fs.*Sync` in handlers, `zlib` sync methods, and heavy image/PDF work. Move CPU work to worker threads or a separate service.',
        },
      ],
    },
    {
      id: 'cluster-all-cores',
      title: 'Use all CPU cores with the cluster module',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'cluster-worker-threads',
      question: `Your Node API runs on an 8-core VM, but monitoring shows **one core at 100%** and seven cores idle. Without changing the app code, write a small entry file that:

- starts one worker process per core
- lets all workers share port 3000
- restarts a worker if it crashes

Then explain when you would **not** use \`cluster\`.`,
      hints: [
        '`cluster.isPrimary` tells you if this is the parent process. The primary only manages workers; it does not serve requests.',
        '`cluster.fork()` starts a copy of the same file as a worker. Listen on the port inside workers.',
        'Listen to `cluster.on(\'exit\', ...)` and fork again. `worker.exitedAfterDisconnect` tells you if the exit was on purpose.',
      ],
      solution: `**Idea:** one Node process uses one core for JavaScript. \`cluster\` starts several processes. The primary process accepts connections on the port and hands them out to workers.

\`\`\`javascript
// cluster.js  ->  node cluster.js
const cluster = require('node:cluster');
const http = require('node:http');
const os = require('node:os');

// availableParallelism() exists in newer Node; os.cpus().length works everywhere
const WORKERS = Number(process.env.WEB_CONCURRENCY) || os.availableParallelism();

if (cluster.isPrimary) {
  console.log(\`primary \${process.pid} starting \${WORKERS} workers\`);
  for (let i = 0; i < WORKERS; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    // crashed or killed (not a planned disconnect): start a new one
    if (!worker.exitedAfterDisconnect) {
      console.warn(\`worker \${worker.process.pid} died (\${signal || code}), restarting\`);
      cluster.fork();
    }
  });
} else {
  // each worker is a full copy of the app with its own event loop and memory
  http
    .createServer((req, res) => {
      if (req.url === '/crash') process.exit(1); // simulate a crash
      res.end(\`handled by worker \${process.pid}\\n\`);
    })
    .listen(3000); // all workers share port 3000
}
\`\`\`

Tested with 2 workers: requests were answered by different PIDs; after \`/crash\` the primary logged \`worker ... died (1), restarting\` and the next request still worked.

**Why it works:** each worker is a separate process with its own event loop, so 8 workers can run 8 requests' JavaScript at the same time.

**Things to remember:**

- Workers **don't share memory**. In-memory sessions, caches or rate-limit counters must move to **Redis**.
- In-process cron jobs would run 8 times. Run them in one place only.
- In real projects, **PM2** does this for you: \`pm2 start app.js -i max\`.

**When not to use cluster:** in **Kubernetes / ECS / Cloud Run**, usually run **one process per container** and scale with more containers (replicas). The platform handles restarts and load balancing. Also, cluster does not help if the bottleneck is the database.`,
      followUps: [
        {
          q: 'Cluster vs worker threads?',
          a: 'Cluster = several **processes** to handle more requests (scale the server). Worker threads = extra threads **inside one process** for CPU-heavy tasks (image resize, parsing), and they can share memory with `SharedArrayBuffer`.',
        },
        {
          q: 'How do you restart all workers with zero downtime after a deploy?',
          a: 'Rolling restart: for each worker, fork a new one, wait for its `listening` event, then call `oldWorker.disconnect()` so it finishes in-flight requests and exits. `pm2 reload` does exactly this.',
        },
      ],
    },
    {
      id: 'graceful-shutdown',
      title: 'Write a graceful shutdown handler',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'graceful-shutdown',
      question: `Every deploy causes a burst of \`502\` errors and some half-finished payment updates. Your app runs in Docker/Kubernetes, which sends **SIGTERM** and then, after a grace period (30 s by default in Kubernetes), **SIGKILL**.

Write the shutdown logic for an HTTP server that uses a MongoDB connection, so that:

- the load balancer stops sending new traffic
- requests that are already running finish
- the DB is closed **after** requests are done
- the process never hangs forever`,
      hints: [
        'Listen for `process.on(\'SIGTERM\', ...)` (and `SIGINT` for Ctrl+C).',
        '`server.close(cb)` stops accepting new connections and calls `cb` when existing ones end. Keep-alive connections that are idle can keep it waiting.',
        'Add a force-exit timer with `.unref()` shorter than the platform\'s grace period.',
      ],
      solution: `**Idea:** on SIGTERM: mark "shutting down" (health check fails) → wait briefly so the load balancer notices → stop accepting connections and let in-flight requests finish → close the DB → exit. A timer forces exit if something hangs.

\`\`\`javascript
const http = require('node:http');
const mongoose = require('mongoose');

let shuttingDown = false;
const DRAIN_DELAY_MS = Number(process.env.DRAIN_DELAY_MS ?? 5000);

const server = http.createServer(app); // your Express app

// the load balancer / Kubernetes readiness probe calls this
app.get('/health', (req, res) => {
  res.status(shuttingDown ? 503 : 200).send(shuttingDown ? 'shutting down' : 'ok');
});

async function shutdown(signal) {
  if (shuttingDown) return;          // ignore a second signal
  shuttingDown = true;
  console.log(\`\${signal} received, shutting down\`);

  // safety net: if cleanup hangs, force exit before SIGKILL arrives
  const forceTimer = setTimeout(() => {
    console.error('could not finish in time, forcing exit');
    process.exit(1);
  }, 20_000);
  forceTimer.unref(); // this timer alone must not keep the process alive

  try {
    // 1. keep serving while /health returns 503, so the LB stops routing to us
    await new Promise((r) => setTimeout(r, DRAIN_DELAY_MS));

    // 2. stop accepting new connections; callback runs when in-flight requests end
    const closed = new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
    server.closeIdleConnections?.(); // drop idle keep-alive sockets (Node 18.2+)
    await closed;
    console.log('http server closed');

    // 3. close resources AFTER requests are done (they may still need the DB)
    await mongoose.connection.close();

    process.exit(0);
  } catch (err) {
    console.error('error during shutdown', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker / Kubernetes / PM2
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
\`\`\`

Tested with a plain \`http\` server: a 2-second request started before SIGTERM still got its response, \`/health\` returned \`503\` during the drain, then the server closed, the DB closed and the process exited with code 0.

**Why it works:** the order matters. Closing the DB first would make running requests fail (the half-finished payment updates). \`unref()\` means the force timer does not keep Node alive if everything finishes early.

**Edge cases:**

- In Docker, use \`CMD ["node", "server.js"]\`, not \`npm start\` — npm may not forward SIGTERM to Node.
- Background workers (BullMQ) also need closing: \`await worker.close()\` lets the current job finish.
- Long-lived connections (WebSockets, SSE) never end on their own — close them explicitly.`,
      followUps: [
        {
          q: 'Why wait a few seconds before server.close()?',
          a: 'The load balancer only learns we are leaving after a failed health check or endpoint update, which takes a few seconds. If we close immediately, requests it still sends get "connection refused" → 502s.',
        },
        {
          q: 'What should happen on uncaughtException?',
          a: 'Log it and run the same shutdown, but with a short timeout — the process is in an unknown state. Then exit with code 1 so the orchestrator restarts it.',
        },
      ],
    },
    {
      id: 'node-upgrade-err-ossl',
      title: 'Scenario: Node upgrade breaks the build with ERR_OSSL_EVP_UNSUPPORTED',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'node-16-to-18-migration',
      question: `You upgrade CI and the Docker base image from Node 16 to Node 18. The API still starts, but the frontend build (an older webpack 4 / create-react-app setup in the same repo) fails:

\`\`\`text
Error: error:0308010C:digital envelope routines::unsupported
  opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
\`\`\`

What is happening, what do you do right now, and what is the real fix? How would you roll out a Node major upgrade safely in general?`,
      hints: [
        'Node 17+ ships with **OpenSSL 3**, which disables old algorithms by default.',
        'Webpack 4 uses the old `md4` hash to name its output files.',
        'There is a temporary flag that turns the old algorithms back on. Why is it only temporary?',
      ],
      solution: `**What is happening:** Node 17 moved to **OpenSSL 3**. OpenSSL 3 puts old, weak algorithms (like **MD4**) into a "legacy provider" that is off by default. Webpack 4 calls \`crypto.createHash('md4')\` to hash file names, so it fails. Node 16 used OpenSSL 1.1.1, which still allowed it.

**Right now (unblock the pipeline):**

\`\`\`bash
# turns the old algorithms back on for this process only
NODE_OPTIONS=--openssl-legacy-provider npm run build
\`\`\`

This is a **workaround**, not a fix. It re-enables weak crypto, and the flag is not recognised by Node 16, so don't put it everywhere blindly. Add a ticket to remove it.

**Real fix:** upgrade the tool that uses MD4:

- webpack 4 → **webpack 5** (or a newer webpack 4 release that added a fallback hash — check the changelog)
- create-react-app: \`react-scripts\` 5+, or move to **Vite**
- run \`npm ls webpack\` to find who brings in the old version

**Safe rollout of a Node major upgrade:**

1. Read the changelog for the versions you skip (e.g. Node 18: global \`fetch\`, OpenSSL 3, npm 8/9 changes).
2. Pin the version everywhere: \`.nvmrc\`, \`"engines": { "node": ">=18" }\`, Docker \`FROM node:18-alpine\`, CI matrix.
3. Delete \`node_modules\`, reinstall, rebuild **native modules** (\`bcrypt\`, \`sharp\`) — they are compiled per Node version.
4. Run unit + integration tests, then deploy to staging and run smoke tests.
5. Canary: send a small share of production traffic to the new version, watch error rate, latency and memory, then roll out fully. Keep the old image for quick rollback.`,
      followUps: [
        {
          q: 'Other things that commonly break moving Node 16 → 18?',
          a: 'Native modules compiled for the old version (`NODE_MODULE_VERSION` mismatch → rebuild), a global `fetch` now existing (code that checked `typeof fetch` or polyfills may behave differently), and stricter OpenSSL defaults for old TLS certificates/ciphers.',
        },
        {
          q: 'How do you keep dev, CI and production on the same Node version?',
          a: 'One source of truth: `.nvmrc` (or `.node-version`) read by nvm/fnm and by CI (e.g. `actions/setup-node` with `node-version-file`), the same major in the Dockerfile, and `engines` in package.json with `engine-strict=true` in `.npmrc` to fail fast.',
        },
      ],
    },
    {
      id: 'last-seat-double-booking',
      title: 'Scenario: two users book the last seat at the same time',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'scaling-production',
      question: `A movie booking API has one seat left. Two users click "Book" at exactly the same moment, and **both** get a confirmation. The code looks like this:

\`\`\`javascript
app.post('/api/shows/:showId/seats/:seatNo/book', requireAuth, async (req, res) => {
  const { showId, seatNo } = req.params;
  const seat = await Seat.findOne({ showId, seatNo });
  if (seat.status !== 'available') {
    return res.status(409).json({ code: 'SEAT_TAKEN' });
  }
  seat.status = 'booked';
  seat.bookedBy = req.user.id;
  await seat.save();
  res.json({ ok: true });
});
\`\`\`

Why does this happen, and how do you make sure only one user gets the seat? The API runs on several servers.`,
      hints: [
        'Between the `findOne` and the `save` there is an `await`. What can the other request do during that time?',
        'Can the database do the check **and** the write in one atomic step?',
        'A lock in a JavaScript variable only works inside one process. You have several servers.',
      ],
      solution: `**Idea:** this is a **check-then-act race condition**. Both requests read the seat as \`available\` before either one writes, so both pass the check. Node being single-threaded doesn't help: each \`await\` lets the other request run, and there are several servers anyway. The fix is to let the **database** do the check and the update **as one atomic operation**, so only one request can win.

**Fix 1 — atomic conditional update (MongoDB).** Put the condition in the filter. Only one update can match \`status: 'available'\`; the second finds nothing:

\`\`\`javascript
app.post('/api/shows/:showId/seats/:seatNo/hold', requireAuth, async (req, res) => {
  const { showId, seatNo } = req.params;
  const now = new Date();

  const seat = await Seat.findOneAndUpdate(
    {
      showId,
      seatNo,
      // free, or held by someone whose hold has expired
      $or: [{ status: 'available' }, { status: 'held', holdExpiresAt: { $lt: now } }],
    },
    { $set: { status: 'held', heldBy: req.user.id, holdExpiresAt: new Date(now.getTime() + 10 * 60_000) } },
    { new: true }
  );

  if (!seat) return res.status(409).json({ code: 'SEAT_TAKEN' });
  res.json({ seatId: seat._id, holdExpiresAt: seat.holdExpiresAt });
});
\`\`\`

A single-document update is atomic in MongoDB, so even with many servers only one request gets the seat. The loser gets **409** and the UI says "Sorry, this seat was just taken".

**Same idea in SQL:**

\`\`\`sql
UPDATE seats
SET status = 'held', held_by = $3, hold_expires_at = now() + interval '10 minutes'
WHERE show_id = $1 AND seat_no = $2
  AND (status = 'available' OR (status = 'held' AND hold_expires_at < now()))
RETURNING id;
-- 0 rows returned -> someone else got the seat
\`\`\`

Or, inside a transaction, \`SELECT ... FOR UPDATE\` locks the row so the second request waits, then sees it is taken.

**Fix 2 — a unique index as a safety net.** If bookings are a separate collection, a unique index on \`{ showId, seatNo }\` makes the database reject the second insert (duplicate key error 11000), even if a bug slips into the code.

**Hold, then pay.** Real booking systems (like BookMyShow) **hold** the seat for a few minutes while the user pays, then mark it \`booked\` when the payment succeeds. Expired holds become free again (the \`$or\` above, or a cleanup job).

**Other options to mention:**
- **Redis lock** (\`SET seat:123 userId NX PX 600000\`) for a fast, short hold across servers. The database update is still the final check.
- **Idempotency key** so a double click or retry from the same user doesn't create two bookings.
- **Not** an in-memory flag or mutex: it only protects one Node process.`,
      followUps: [
        {
          q: 'Optimistic or pessimistic locking — which here?',
          a: 'Optimistic (a conditional update or a version field) is a good default: no waiting, and the loser just gets a conflict. Pessimistic (SELECT ... FOR UPDATE) makes others wait and suits short transactions that touch several rows, like moving money.',
        },
        {
          q: 'How do you book several seats together, all or nothing?',
          a: 'Use a transaction: hold every seat with the conditional update and abort if any one returns nothing. In SQL, lock rows in a fixed order (e.g. by seat number) to avoid deadlocks. In MongoDB use a multi-document transaction, or put all seats of a show in one document.',
        },
        {
          q: 'How would you test that it works?',
          a: 'Fire many requests for the same seat at once (Promise.all in a test, or k6/autocannon) and assert that exactly one succeeds and the rest get 409.',
        },
      ],
    },
    {
      id: 'works-in-postman-fails-in-react',
      title: 'Scenario: the API works in Postman but fails from the React app',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'node-security',
      question: `Your Express API returns the right data when you call it from **Postman**. When the React app calls the same endpoint, it fails: sometimes there is a red error in the console, sometimes the server gets an empty body, sometimes the user is "not logged in".

How do you debug this step by step? What are the usual causes?`,
      hints: [
        'Postman is not a browser. Which rules does the browser enforce that Postman ignores?',
        'Open DevTools → Network and Console and read the actual error before guessing.',
        'Compare the two requests: URL, method, headers, body, cookies.',
      ],
      solution: `**Idea:** Postman sends exactly what you typed and ignores browser security rules. The browser adds rules (CORS, cookie policies, mixed content) and your frontend code builds the request differently. So **compare the two requests** and read the browser's error.

**Step 1 — Read the real error.** DevTools → Console and Network. Click the failing request: status, request headers, payload, response. Is there an **OPTIONS** request before it that failed?

**Step 2 — Compare.** Right-click the request → **Copy as cURL** and run it in a terminal (or import into Postman).
- It **fails** there too → the request itself is wrong (URL, headers, body, token).
- It **works** there → it is a **browser rule** (CORS or cookies).

**Usual causes and fixes:**

1. **CORS** — console says "blocked by CORS policy". Postman, curl and servers ignore CORS; browsers enforce it. A request with \`Content-Type: application/json\` or an \`Authorization\` header first sends an **OPTIONS preflight**, which the server must answer.

\`\`\`javascript
import cors from 'cors';

const allowedOrigins = ['http://localhost:5173', 'https://app.example.com'];

app.use(cors({
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
  credentials: true, // allow cookies; the origin can not be '*' when this is true
}));
app.use(express.json());
\`\`\`

   In development you can also avoid CORS with the dev server's proxy (Vite \`server.proxy\`), so the app and API share one origin.

2. **Missing body or headers** — the server gets \`req.body\` as \`{}\`. Postman sets \`Content-Type\` for you; with \`fetch\` you must set it **and** call \`JSON.stringify\`.

\`\`\`javascript
const res = await fetch(\`\${import.meta.env.VITE_API_URL}/api/orders\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
  credentials: 'include', // send cookies to another origin
  body: JSON.stringify(order),
});
if (!res.ok) throw new Error(\`HTTP \${res.status}: \${await res.text()}\`); // fetch does not throw on 4xx/5xx
\`\`\`

3. **Wrong URL** — the env variable is \`undefined\` because it lacks the required prefix (\`VITE_\`, \`NEXT_PUBLIC_\`, \`REACT_APP_\`) or the dev server wasn't restarted. The request then hits the frontend server, which returns \`index.html\`, and \`res.json()\` fails with *"Unexpected token '<'"*.

4. **Auth not sent** — Postman has the token or cookie saved; the app doesn't attach it. Cookies to another origin need \`credentials: 'include'\` on the client, \`credentials: true\` in CORS, and \`SameSite=None; Secure\` on the cookie.

5. **Mixed content** — an \`https\` site calling an \`http\` API is blocked by the browser.

6. **\`localhost\` in production** — the deployed app calls \`http://localhost:4000\`, which means the **user's own machine**.

7. **Browser extensions** — ad blockers can block URLs containing words like \`/ads\` or \`/track\`. Try an incognito window.

**Step 3 — Check the server logs** too: did the request even arrive? Which status did the server send? Log the method, URL, origin and status for every request.`,
      followUps: [
        {
          q: 'Does CORS protect my API from attackers?',
          a: 'No. CORS only stops other websites, in a user\'s browser, from reading your responses. Anyone can call the API with curl or Postman. You still need authentication, authorization and rate limiting.',
        },
        {
          q: 'What is a preflight request?',
          a: 'An OPTIONS request the browser sends before a "non-simple" request (custom headers like Authorization, JSON content type, PUT/DELETE). The server must reply with the matching Access-Control-Allow-* headers, or the real request is never sent.',
        },
      ],
    },
    {
      id: 'memory-leak-cache-listeners',
      title: 'Debug: memory grows until the container is OOM-killed',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'memory-performance',
      question: `Your Node API's memory grows slowly all day (300 MB → 1.5 GB) until the container is killed for using too much memory ("OOMKilled"). After a restart it starts again. Logs also show \`MaxListenersExceededWarning\`. Find the leaks and fix them. How would you **prove** where a leak is?

\`\`\`javascript
const priceFeed = new EventEmitter(); // one shared feed for the whole app
const cache = {};                     // "simple cache" for product lookups

app.get('/products/:id', async (req, res) => {
  const key = req.params.id + ':' + req.query.currency;
  if (!cache[key]) {
    cache[key] = await Product.findById(req.params.id).lean();
  }
  res.json(cache[key]);
});

// Server-Sent Events: push live prices to the browser
app.get('/prices/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  priceFeed.on('price', (p) => {
    res.write('data: ' + JSON.stringify(p) + '\\n\\n');
  });
});
\`\`\``,
      hints: [
        'Garbage collection can only free objects that **nothing points to**. What keeps pointing to old cache entries? To closed responses?',
        'The cache key includes user input (`currency`). How many different keys can a bot create?',
        'When a browser closes the SSE connection, who removes the `price` listener? The listener closure holds `res`.',
      ],
      solution: `**Leak 1: a cache with no limit.** \`cache\` is a module-level object, so it lives forever. Every new \`id:currency\` adds an entry and nothing ever removes one. Random ids or currencies (bots, crawlers) make it grow without end. Old products also go stale.

**Leak 2: listeners never removed.** Each SSE request adds a \`price\` listener. When the browser disconnects, the listener stays on the **global** \`priceFeed\`, and its closure keeps \`res\` (socket, buffers) alive forever. That is what \`MaxListenersExceededWarning\` was telling you (more than 10 listeners on one event).

**Fix:**

\`\`\`javascript
// A small LRU cache with TTL. A Map keeps insertion order,
// so the first key is always the least recently used one.
class LruCache {
  constructor({ max = 1000, ttlMs = 60_000 } = {}) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.map = new Map(); // key -> { value, expiresAt }
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {  // expired: drop it
      this.map.delete(key);
      return undefined;
    }
    this.map.delete(key);                // move to the "newest" end
    this.map.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    this.map.delete(key);
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    if (this.map.size > this.max) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);        // evict least recently used
    }
  }
}

const productCache = new LruCache({ max: 5000, ttlMs: 5 * 60_000 });
const CURRENCIES = new Set(['USD', 'EUR', 'INR']);

app.get('/products/:id', async (req, res, next) => {
  try {
    const currency = CURRENCIES.has(req.query.currency) ? req.query.currency : 'USD';
    const key = req.params.id + ':' + currency;  // bounded set of keys
    let product = productCache.get(key);
    if (!product) {
      product = await Product.findById(req.params.id).lean();
      if (!product) return res.sendStatus(404);  // don't cache misses forever
      productCache.set(key, product);
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

app.get('/prices/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  const onPrice = (p) => res.write('data: ' + JSON.stringify(p) + '\\n\\n');
  priceFeed.on('price', onPrice);

  // client disconnected -> remove OUR listener so res can be garbage-collected
  req.on('close', () => priceFeed.off('price', onPrice));
});
\`\`\`

Tested: with \`max: 2\`, after \`set a, set b, get a, set c\` → \`b\` is evicted, \`a\` and \`c\` stay; entries expire after the TTL. Adding a listener per call fires \`MaxListenersExceededWarning\` at 11; with \`off()\` on close the count goes back to 0.

**How to prove where the leak is:**

1. Reproduce: run the app locally with load (\`autocannon\` / \`k6\`) hitting the suspected routes.
2. \`node --inspect server.js\`, open \`chrome://inspect\` → Memory tab.
3. Take **heap snapshot 1**, send traffic, force GC (trash-can icon), take **snapshot 2**, repeat for **snapshot 3**.
4. Use the **Comparison** view: look for object types whose count only goes up (\`Object\` with product fields, \`ServerResponse\`, \`Socket\`, closures). The **Retainers** panel shows the chain keeping them alive — here \`cache\` and \`priceFeed._events.price\`.

**Why it works:** objects are freed only when nothing references them. A bounded cache drops references; removing the listener releases the closure and \`res\`.`,
      followUps: [
        {
          q: 'Would a WeakMap fix the cache?',
          a: 'No. WeakMap keys must be **objects**, and entries are only removed when the key object is unreachable. String keys like `"42:USD"` are not allowed. Use an LRU (e.g. the `lru-cache` package) or Redis for a shared cache.',
        },
        {
          q: 'Why put the cache in Redis instead of process memory?',
          a: 'With several instances, each has its own cache (more memory, inconsistent data). Redis gives one shared cache with built-in TTL and memory limits, and it survives restarts.',
        },
        {
          q: 'Heap is stable, but RSS (total memory) keeps growing. What then?',
          a: 'The memory is outside the JS heap: Buffers, native modules (image libraries), or many sockets. Check `process.memoryUsage()` fields `external` and `arrayBuffers`. Look for streams that are never consumed or destroyed.',
        },
      ],
    },
    {
      id: 'worker-thread-pool',
      title: 'Move CPU-heavy work to a worker thread pool',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'cluster-worker-threads',
      question: `An endpoint does heavy CPU work (resizing images / scoring / big calculations). While it runs, every other request waits. Using \`node:worker_threads\` (no libraries), build a small **worker pool**:

\`\`\`javascript
const pool = new WorkerPool('/abs/path/task-worker.js', 4);
const result = await pool.run({ n: 35 }); // runs fib(35) in a background thread
\`\`\`

Requirements:

- a fixed number of threads (creating a thread per request is slow and can exhaust memory)
- extra jobs wait in a queue
- errors in a job reject only that job
- if a thread crashes, replace it
- \`close()\` stops all threads`,
      hints: [
        'In the worker file, listen with `parentPort.on(\'message\', ...)` and answer with `parentPort.postMessage(...)`.',
        'Give each job an `id`. Keep a `Map` of id → `{ resolve, reject }` so you know which Promise to settle when a message comes back.',
        'Keep an `idle` list of workers. When a job finishes, put the worker back and start the next queued job.',
      ],
      solution: `**Idea:** start N threads once. \`run()\` puts a job in a queue and returns a Promise. A free worker takes the next job; when it posts the result, we resolve that job's Promise and give the worker the next job.

\`\`\`javascript
// task-worker.js — runs in a separate thread
const { parentPort } = require('node:worker_threads');

function fib(n) { // CPU-heavy example: slow on purpose
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

parentPort.on('message', ({ id, n }) => {
  try {
    if (!Number.isInteger(n) || n < 0) throw new Error('n must be a non-negative integer');
    parentPort.postMessage({ id, result: fib(n) });
  } catch (err) {
    parentPort.postMessage({ id, error: err.message }); // job error, thread survives
  }
});
\`\`\`

\`\`\`javascript
// pool.js — a fixed number of threads and a queue of jobs
const { Worker } = require('node:worker_threads');
const os = require('node:os');

class WorkerPool {
  constructor(file, size = Math.max(1, os.availableParallelism() - 1)) {
    this.file = file;          // must be an absolute path (or start with ./)
    this.queue = [];           // jobs waiting for a free worker
    this.idle = [];            // workers with nothing to do
    this.jobs = new Map();     // job id -> { resolve, reject }
    this.nextId = 0;
    this.workers = new Set();  // every live worker
    for (let i = 0; i < size; i++) this.addWorker();
  }

  addWorker() {
    const worker = new Worker(this.file);
    this.workers.add(worker);

    worker.on('message', ({ id, result, error }) => {
      const job = this.jobs.get(id);
      this.jobs.delete(id);
      worker.currentJobId = null;
      if (error) job.reject(new Error(error));
      else job.resolve(result);
      this.idle.push(worker);  // free again
      this.runNext();
    });

    worker.on('error', (err) => {
      // the thread crashed: fail its job and replace the worker
      const job = this.jobs.get(worker.currentJobId);
      if (job) {
        this.jobs.delete(worker.currentJobId);
        job.reject(err);
      }
      this.workers.delete(worker);
      this.idle = this.idle.filter((w) => w !== worker);
      if (!this.closed) {
        this.addWorker();
        this.runNext();
      }
    });

    this.idle.push(worker);
  }

  run(data) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.jobs.set(id, { resolve, reject });
      this.queue.push({ id, data });
      this.runNext();
    });
  }

  runNext() {
    while (this.idle.length && this.queue.length) {
      const worker = this.idle.pop();
      const { id, data } = this.queue.shift();
      worker.currentJobId = id;
      worker.postMessage({ id, ...data });
    }
  }

  async close() {
    this.closed = true;
    await Promise.all([...this.workers].map((w) => w.terminate()));
  }
}

module.exports = { WorkerPool };
\`\`\`

\`\`\`javascript
// usage in an Express app: one pool for the whole process
const path = require('node:path');
const pool = new WorkerPool(path.join(__dirname, 'task-worker.js'), 4);

app.get('/fib/:n', async (req, res, next) => {
  try {
    res.json({ result: await pool.run({ n: Number(req.params.n) }) });
  } catch (err) {
    next(err);
  }
});
\`\`\`

Tested with 2 threads: five jobs (\`fib(35)\` × 4 + \`fib(10)\`) finished in ~200 ms with the main event loop staying responsive (max lag ~11 ms). A bad input rejected only that job. A worker that threw an uncaught error rejected its job, was replaced, and the next job worked.

**Why it works:** each worker thread has its own V8 instance and event loop, so the heavy loop runs on another core. The main thread only sends and receives small messages.

**Edge cases:** data passed with \`postMessage\` is **copied** (structured clone) — sending huge objects costs time; transfer \`ArrayBuffer\`s instead. Add a queue limit so a traffic spike returns \`503\` instead of queueing forever.`,
      followUps: [
        {
          q: 'Which library would you use in production?',
          a: '`piscina` — a well-tested worker pool with queue limits, timeouts and cancellation. For work that can take minutes, use a job queue (BullMQ) with separate worker processes instead.',
        },
        {
          q: 'Why not use a worker thread for database calls or HTTP requests?',
          a: 'They are I/O, not CPU. Node already handles I/O without blocking. Worker threads only help when **JavaScript itself** is busy computing.',
        },
        {
          q: 'How do you add a timeout per job?',
          a: 'Start a `setTimeout` in `run()`. If it fires, reject the job, `terminate()` that worker (you cannot interrupt a busy sync loop any other way), and create a new one.',
        },
      ],
    },
    {
      id: 'async-local-storage-request-id',
      title: 'Add a request id to every log line with AsyncLocalStorage',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'async-local-storage',
      question: `Production logs are a mess: 200 requests run at the same time, and you can't tell which "charging card" line belongs to which request. Passing \`req\` into every service and repository function is not an option.

Implement:

1. an Express middleware that gives each request an id (reuse \`X-Request-Id\` from the load balancer if present) and returns it in the response header
2. a \`log(level, message, extra)\` function, usable in **any** file, that automatically adds \`requestId\` and \`userId\` to each JSON log line

\`\`\`javascript
// deep inside a service, no req available:
async function chargeCard(amount) {
  log('info', 'charging card', { amount });
  // {"level":"info","message":"charging card","requestId":"3f1c...","userId":"u42","amount":10}
}
\`\`\``,
      hints: [
        'A normal global variable fails: request B overwrites it while request A is still waiting on `await`.',
        '`AsyncLocalStorage` from `node:async_hooks` keeps a "store" that follows async calls (await, timers, callbacks) started inside `als.run(store, fn)`.',
        'Make the store an object so the auth middleware can set `store.userId` later.',
      ],
      solution: `**Idea:** \`AsyncLocalStorage\` is like thread-local storage for async code. \`als.run(store, fn)\` makes \`store\` visible to \`fn\` and **everything async that \`fn\` starts**. Two requests running at once each see their own store.

\`\`\`javascript
// context.js
const { AsyncLocalStorage } = require('node:async_hooks');
const { randomUUID } = require('node:crypto');

const requestContext = new AsyncLocalStorage();

// Express middleware: start a new context for every request
function contextMiddleware(req, res, next) {
  // reuse the id from the load balancer / caller (limit length: it's user input)
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && incoming.length <= 100 ? incoming : randomUUID();

  res.setHeader('x-request-id', requestId); // users can quote it in bug reports
  // everything that runs inside next(), sync or async, sees this store
  requestContext.run({ requestId, userId: null }, () => next());
}

// logger.js — any file can log without receiving req
function log(level, message, extra = {}) {
  const ctx = requestContext.getStore(); // undefined outside a request
  console.log(JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    requestId: ctx?.requestId,
    userId: ctx?.userId,
    ...extra,
  }));
}

module.exports = { requestContext, contextMiddleware, log };
\`\`\`

\`\`\`javascript
// app.js
app.use(contextMiddleware); // register FIRST

app.use(async (req, res, next) => {
  const user = await authenticate(req);
  const store = requestContext.getStore();
  if (store && user) store.userId = user.id; // later logs include the user
  next();
});

app.post('/checkout', async (req, res, next) => {
  try {
    await chargeCard(req.body.amount); // logs with the right requestId
    log('info', 'checkout done');
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});
\`\`\`

Tested with 3 parallel requests that each \`await\` random delays: every log line had its own request's id and user, the id sent by the "load balancer" was reused, and \`log()\` outside a request printed \`requestId: undefined\` without crashing.

**Why it works:** Node tracks which async operation created which. The store is attached when \`run()\` starts and is carried through every \`await\`, timer and callback created inside it.

**Edge cases:**

- Set up the context **before** other middleware. Some older libraries with their own callback queues or connection pools can "lose" the context — test your stack.
- Send the id to downstream services (\`fetch(url, { headers: { 'x-request-id': id } })\`) and add it to queue job data so logs connect across services.
- In real projects use **pino** with a \`mixin()\` that reads the store — fast JSON logs with the same idea.`,
      followUps: [
        {
          q: 'Why not attach the id to req and pass req around?',
          a: 'It couples every service, repository and util function to Express, and many call sites (queue workers, cron jobs, library callbacks) have no `req`. ALS keeps business code clean.',
        },
        {
          q: 'Is AsyncLocalStorage slow?',
          a: 'It has a small overhead, and it has been optimized a lot in recent Node versions. For logging and tracing it is the standard approach — OpenTelemetry uses it for trace context in Node.',
        },
      ],
    },
    {
      id: 'api-latency-spikes-under-load',
      title: 'Scenario: API p99 latency jumps from 80 ms to 4 s under load',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'memory-profiling-inspect',
      question: `Your Express + MongoDB API is fine at normal traffic. During a sale, **p99 latency** (the slowest 1% of requests) jumps from 80 ms to 4 s and some requests time out. Average CPU is 60%, memory looks OK, and MongoDB Atlas shows normal query times.

Walk the interviewer through how you would find the cause. What tools would you use, what would you look at, and what are the usual suspects in Node?`,
      hints: [
        'First decide: is the time spent **inside Node** (event loop busy) or **waiting** (DB pool, thread pool, other service)?',
        'Event loop lag is the key metric. How can you measure it in code?',
        'The DB reports fast queries, but the app may be **waiting for a free connection** before the query even starts.',
      ],
      solution: `**Idea:** measure first, then narrow down. Split the 4 s into "Node was busy" vs "Node was waiting".

**Step 1 — Look at what you already have.** APM traces (Datadog, New Relic, OpenTelemetry) per route: which routes are slow? Is the time in a DB span, an HTTP call, or in "self time" (our own code)? Do spikes match deploys, cron jobs or GC?

**Step 2 — Measure event loop lag.** If the loop is blocked, **every** request is slow, even cheap ones.

\`\`\`javascript
const { monitorEventLoopDelay } = require('node:perf_hooks');

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
  // values are in nanoseconds -> convert to ms
  console.log(JSON.stringify({
    msg: 'event-loop-lag',
    p50: Math.round(histogram.percentile(50) / 1e6),
    p99: Math.round(histogram.percentile(99) / 1e6),
    max: Math.round(histogram.max / 1e6),
  }));
  histogram.reset();
}, 1000).unref();
\`\`\`

(Tested: with a 300 ms busy loop every 400 ms, it reported \`p99\` ≈ 315 ms.)

**Step 3a — Lag is high → Node is busy. Profile the CPU.**

- Reproduce with a load tool (\`autocannon\`, \`k6\`) on staging.
- \`node --cpu-prof server.js\` (writes a \`.cpuprofile\` on exit) or \`node --inspect\` + Chrome DevTools → Performance, or \`clinic flame\` / \`0x\` for a flame graph. Wide bars = where time goes.
- Usual suspects: big \`JSON.stringify\` of huge responses, sync crypto (\`bcrypt.hashSync\`, \`pbkdf2Sync\`), bad regex, sorting/filtering large arrays in JS instead of in MongoDB, sync logging, \`*Sync\` fs calls.
- Also check **GC pauses**: \`--trace-gc\` or the profile. Many big temporary objects → long garbage collection.

**Step 3b — Lag is low → Node is waiting.**

- **DB connection pool exhausted:** the Mongo driver's \`maxPoolSize\` defaults to 100 per client; requests queue for a free connection, and Atlas never sees that wait. Check the driver's pool events/metrics; fix slow queries or tune the pool.
- **libuv thread pool saturated:** only 4 threads for \`fs\`, \`dns.lookup\`, \`crypto.pbkdf2/scrypt\`, \`zlib\`. Many async hashes or file reads queue up. Raise \`UV_THREADPOOL_SIZE\` or reduce the work.
- **Slow downstream calls** without timeouts (payment provider, another service). Add timeouts and circuit breakers.
- **No HTTP keep-alive** to downstream services → new TCP/TLS handshake every call.

**Step 4 — Fix, then verify** with the same load test and watch p99 + event loop lag in production. Longer term: move CPU work to worker threads/queues, cache hot reads, add instances, and alert on event loop lag.`,
      followUps: [
        {
          q: 'Why look at p99 and not the average?',
          a: 'The average hides the pain. If 99 requests take 50 ms and 1 takes 5 s, the average is ~100 ms and looks fine. p99 shows what your unhappiest users feel — and one blocked event loop makes many requests land there.',
        },
        {
          q: 'Is it safe to profile in production?',
          a: 'Short CPU profiles are usually OK on one instance taken out of the load balancer. Heap snapshots **pause** the process and need a lot of memory (roughly the heap size again), so do them on a drained instance or reproduce in staging.',
        },
      ],
    },
    {
      id: 'cpu-100-one-core',
      title: 'Scenario: one core at 100%, server stops responding',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'single-thread-non-blocking',
      question: `At 2 AM an alert fires: one Node instance shows **one CPU core pinned at 100%**, and it stops answering requests (even \`/health\`). Other instances are fine. Memory is flat. A restart fixes it — until it happens again two days later.

1. What does "one core at 100% + no responses" tell you?
2. How do you find the exact line of code **next time**, before restarting?
3. What would you put in place so it doesn't take the service down?`,
      hints: [
        'Node runs your JavaScript on one thread. What would keep that thread busy forever?',
        'An infinite loop, catastrophic regex, or a huge sync job never yields, so timers, I/O and health checks never run.',
        'You can attach a debugger or take a CPU profile from a running process without restarting it.',
      ],
      solution: `**1. What it means:** the main JavaScript thread is stuck in **synchronous** code that never yields to the event loop. Because it never returns, nothing else runs — no requests, no timers, no health checks. Memory is flat, so it is not a leak. Usually it is triggered by **one specific input**, which is why only one instance is affected and it repeats every few days.

**Common causes:**

- Catastrophic regex backtracking (ReDoS) on user input (email/URL validators are classic).
- An infinite or huge loop: \`while\` with a bad exit condition, pagination code where the "next" cursor never changes, a recursive tree walk on data with a cycle.
- \`JSON.parse\`/\`stringify\` of a gigantic payload, or sorting millions of items.

**2. Catch it in the act (before restarting):**

\`\`\`bash
# take the stuck instance out of the load balancer, keep it running

# a) open the inspector on an already-running process (Linux/macOS)
kill -USR1 <pid>          # Node starts the inspector on 127.0.0.1:9229
ssh -L 9229:localhost:9229 server   # tunnel, then open chrome://inspect
# click "Pause" in DevTools -> the call stack shows the exact stuck line

# b) or, if started with --cpu-prof / a profiler agent, grab a CPU profile
\`\`\`

- \`kill -USR1\` turning on the inspector is documented Node behaviour on non-Windows systems. Never expose port 9229 publicly — only tunnel it.
- Also log the **request** that triggered it: an access log line written when a request **starts** (with request id, route, body size) shows which request never finished.

**3. Protect the service:**

- **Health checks with a short timeout** so the orchestrator (Kubernetes liveness probe, ECS) kills and replaces a stuck instance automatically.
- **Alert on event loop lag** (\`perf_hooks.monitorEventLoopDelay\`).
- **Fix the root cause:** safe regexes (no nested quantifiers like \`(a+)*\`; consider the \`re2\` package for user-supplied patterns), input size limits (\`express.json({ limit: '100kb' })\`), loop guards (max iterations, cycle detection with a \`Set\`).
- Move unavoidable heavy work to **worker threads** with a timeout — a stuck worker can be \`terminate()\`d; the main thread cannot.
- Run several instances so one stuck process doesn't cause an outage.`,
      followUps: [
        {
          q: 'Why does `/health` also hang? It does no work.',
          a: 'The health request is waiting in the same queue. The event loop can only start a new callback when the current JavaScript finishes. A stuck synchronous function blocks every callback, no matter how small.',
        },
        {
          q: 'Could the cluster module have prevented this?',
          a: 'Only partly. Other workers keep serving, but the stuck worker still holds its share of connections, and the same bad input can hit every worker. Detection (lag alerts, liveness probes) plus fixing the cause is the real answer.',
        },
      ],
    },
    {
      id: 'design-csv-import-endpoint',
      title: 'Design: import a 1-million-row CSV into MongoDB',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'background-jobs-queues',
      question: `Admins upload product CSV files (up to ~1 million rows, ~500 MB) that must be inserted or updated in MongoDB by \`sku\`. The current version does:

\`\`\`javascript
app.post('/import', upload.single('file'), async (req, res) => {
  const rows = parseCsv(req.file.buffer.toString()); // whole file in memory
  for (const row of rows) {
    await Product.updateOne({ sku: row.sku }, row, { upsert: true }); // 1M round trips
  }
  res.json({ ok: true }); // request takes 40 minutes and times out
});
\`\`\`

Design a better version: upload, processing, progress reporting, bad rows, and running the same file twice. Write the core import function.`,
      hints: [
        'Separate the **upload** (fast, return a job id) from the **processing** (background worker).',
        'Stream the file line by line and write to MongoDB in **batches** with `bulkWrite`.',
        'Upsert by `sku` makes re-running the same file safe (idempotent).',
      ],
      solution: `**Design:**

1. **Upload:** the browser uploads directly to **S3** with a pre-signed URL (or the API streams the upload to S3/disk — never into a memory buffer). The API creates an \`imports\` document \`{ status: 'queued', fileKey }\` and returns \`202 Accepted\` with the \`jobId\` right away.
2. **Queue:** push \`{ jobId }\` to a job queue (BullMQ on Redis, or SQS). Jobs survive restarts and can be retried.
3. **Worker process:** streams the file, parses and validates rows, writes **batches of ~1000** with \`bulkWrite\` (upsert by \`sku\`), and updates progress after each batch.
4. **Progress:** the UI polls \`GET /imports/:jobId\` (or gets SSE/WebSocket pushes) showing \`done\`, \`bad\` and \`status\`.
5. **Bad rows:** skip and record them (line number + reason), capped; offer a downloadable error report. Don't fail 1M rows because of 3 bad ones.
6. **Idempotency:** upsert by \`sku\` with a **unique index** on \`sku\` — running the same file twice gives the same result, and a retried job can safely start over.

**Core import function (runs in the worker):**

\`\`\`javascript
const fs = require('node:fs');
const readline = require('node:readline');

// Group items from any async iterable into arrays of "size"
async function* inBatches(rows, size) {
  let batch = [];
  for await (const row of rows) {
    batch.push(row);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length) yield batch; // the last, smaller batch
}

// Turn lines into validated product objects (skip header and bad rows)
async function* parseRows(lines, onBadRow) {
  let lineNo = 0;
  for await (const line of lines) {
    lineNo++;
    if (lineNo === 1 || !line.trim()) continue;
    const [sku, name, priceRaw] = line.split(',');
    const priceCents = Math.round(Number(priceRaw) * 100); // money as integer cents
    if (!sku || !name || !Number.isFinite(priceCents)) {
      onBadRow({ lineNo, line });
      continue;
    }
    yield { sku: sku.trim(), name: name.trim(), priceCents };
  }
}

async function importProducts({ filePath, collection, jobId, reportProgress }) {
  const lines = readline.createInterface({
    input: fs.createReadStream(filePath), // or the S3 object's Body stream
    crlfDelay: Infinity,
  });

  const badRows = [];
  let done = 0;

  for await (const batch of inBatches(parseRows(lines, (r) => badRows.push(r)), 1000)) {
    // upsert by sku: running the same file twice does not create duplicates
    await collection.bulkWrite(
      batch.map((p) => ({
        updateOne: {
          filter: { sku: p.sku },
          update: { $set: { ...p, importJobId: jobId } },
          upsert: true,
        },
      })),
      { ordered: false } // one failing doc doesn't stop the rest of the batch
    );
    done += batch.length;
    await reportProgress({ done, bad: badRows.length }); // e.g. update the imports doc
  }

  return { done, badRows: badRows.slice(0, 100) }; // keep the report small
}

module.exports = { importProducts };
\`\`\`

Tested with a 25,003-row file and a mock collection: 24,952 rows written in 25 \`bulkWrite\` calls, 51 bad rows reported, **at most 1 batch in flight** at any time (reading paused while writing), and re-running the file left the same 24,952 documents (no duplicates).

**Why it works:**

- **Memory stays flat:** async generators pull one line at a time; \`await bulkWrite\` pauses reading (backpressure).
- **~1000× fewer round trips:** 1,000 batches instead of 1,000,000 single updates.
- **The HTTP request is instant;** the slow work runs in a worker that can be retried, scaled and monitored.

**Edge cases:** use a real CSV parser (\`csv-parse\`) for quoted fields; validate headers before starting; set a max file size; for very large imports consider running 2-4 batches in parallel (with a concurrency limit) if the DB can take it.`,
      followUps: [
        {
          q: 'What happens if the worker crashes at row 600,000?',
          a: 'The queue retries the job. Because writes are upserts by `sku`, starting over is safe. To save time, store the last finished line number in the imports doc and skip up to it on retry.',
        },
        {
          q: 'How would you let the admin "undo" an import?',
          a: 'Tag every write with `importJobId` (as above) and keep the previous values (e.g. write to a staging collection first, then swap or merge). A full undo needs the old data; a tag alone only tells you **which** documents changed.',
        },
      ],
    },
    {
      id: 'thousand-concurrent-requests-slow',
      title: 'Scenario: 1,000 concurrent requests and response time suddenly climbs',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'scaling-production',
      question: `Your Node.js API (Express + MongoDB, one server) answers in about 100 ms. When traffic reaches about **1,000 concurrent requests**, response times suddenly climb to several seconds and some requests time out.

How would you investigate, and how would you resolve it?`,
      hints: [
        'First find **where** the time goes: is Node busy running code, or is it waiting for something (database, another service)?',
        'With 1,000 requests and, say, 10 database connections, what happens to request number 11?',
        'One Node process runs JavaScript on one core. How many cores does the server have?',
      ],
      solution: `**Idea:** latency that jumps at a certain load usually means **requests are waiting in a queue** for something limited: the CPU (one thread), the DB connection pool, the libuv thread pool, or a slow service. Measure to find which one, fix that bottleneck, then add capacity.

**Step 1 — Get the facts.**
- Does it affect **all routes** or only some? Did it start after a deploy, a traffic spike, or a cron job?
- Look at the metrics: CPU **per core**, memory and GC, **event loop lag**, DB pool waits, DB query times, latency of outside calls, error rate.
- Reproduce on staging with a load tool: \`npx autocannon -c 1000 -d 30 http://localhost:3000/api/products\`.

**Step 2 — Is Node busy or waiting?**

\`\`\`javascript
const { monitorEventLoopDelay } = require('node:perf_hooks');
const lag = monitorEventLoopDelay();
lag.enable();
setInterval(() => {
  console.log('event loop p99 lag (ms):', Math.round(lag.percentile(99) / 1e6));
  lag.reset();
}, 5000).unref();
\`\`\`

- **High lag, one core at 100%** → Node is **busy**. Synchronous work blocks every request: big \`JSON.stringify\`, \`bcrypt.hashSync\`, sorting large arrays, heavy regex. Profile with \`node --cpu-prof\` or \`clinic flame\`.
- **Low lag** → Node is **waiting**. Check the DB pool, the thread pool and outside services.

**Step 3 — Understand the queue (Little's law).** If a request holds a DB connection for 50 ms and the pool has 10 connections, the most you can serve is about 10 / 0.05 = **200 requests per second**. The other requests wait for a free connection, so time grows with the queue, even though the database says "every query is fast".

**Step 4 — Fix the bottleneck:**

| Cause | Fix |
|---|---|
| CPU-heavy code on the main thread | Make it async or move it to **worker threads** or a **queue** (BullMQ). |
| Only one core used | Run one process per core: \`pm2 start server.js -i max\` (cluster mode) or several containers. |
| DB pool exhausted / slow queries | Add **indexes**, remove N+1 queries, paginate, tune \`maxPoolSize\`. |
| Same data read again and again | **Cache** hot reads in Redis with a TTL. |
| Slow outside service | **Timeouts** (\`fetch(url, { signal: AbortSignal.timeout(2000) })\`), retries with backoff, a circuit breaker. |
| libuv thread pool full (fs, crypto, dns, zlib) | Raise \`UV_THREADPOOL_SIZE\` or reduce that work. |
| Memory pressure and long GC pauses | Find the leak with a heap snapshot; stream big responses instead of building them in memory. |

**Step 5 — Protect and scale:**
- **Scale out:** several instances behind a load balancer, with autoscaling on CPU or latency.
- **Rate limiting** per user or IP, and **load shedding**: reply 503 quickly when overloaded instead of letting every request get slow.
- **Alerts** on p99 latency and event loop lag so you see it before users complain.

**Step 6 — Verify:** run the same load test again and compare p95/p99 latency and errors before and after.`,
      followUps: [
        {
          q: 'Can Node handle 1,000 concurrent requests at all?',
          a: 'Yes, easily, if each request mostly waits on I/O. One process can hold thousands of open connections because waiting does not use the thread. It slows down when requests use CPU or when a shared resource (DB pool, thread pool) is too small.',
        },
        {
          q: 'Should I just make the database pool much bigger?',
          a: 'Not blindly. Each connection uses memory on the database, and many instances × a big pool can exceed its connection limit. Fix slow queries first, then size the pool based on what the database can handle.',
        },
        {
          q: 'Cluster module or worker threads?',
          a: 'Cluster (or PM2 / several containers) runs more copies of the whole server to use all cores. Worker threads run specific CPU-heavy tasks off the main thread inside one process. They solve different problems and are often used together.',
        },
      ],
    },
  ],
};
