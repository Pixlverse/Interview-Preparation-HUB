// Node.js — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'nodejs',
  title: 'Node.js',
  icon: '🟩',
  description: 'How Node runs your JavaScript on the server: the event loop, libuv, streams, modules, errors, scaling, debugging, and real-world upgrades like the Node 16 to 18 migration.',
  definitionTitle: 'What is Node.js?',
  definition: `**Node.js** is a **runtime** that lets you run JavaScript **outside the browser** — on servers, in scripts and in command-line tools. A runtime is the program that actually executes your code. Node is built on Google's **V8** JavaScript engine (the same one inside Chrome) plus a library called **libuv** for files, networking and timers.

Node runs your JavaScript on **one main thread** but uses **non-blocking I/O**. Instead of waiting for a database or file, it moves on and handles the result later through the **event loop**. That lets one Node server handle thousands of connections at once.

**One-line answer:** "Node.js is a JavaScript runtime built on V8 that uses an event-driven, non-blocking I/O model, which makes it great for fast, scalable network applications like APIs."`,
  topics: [
    {
      id: 'how-node-works',
      title: 'How Node.js Works',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Node = the V8 JavaScript engine + libuv (event loop and async I/O) + core modules like fs, http and crypto.',
      what: `**Node.js** is a program that runs JavaScript outside the browser, usually on a server.

It is built from three main parts:
- **V8** — Google's JavaScript engine (the same one in Chrome). It turns your JS into fast machine code.
- **libuv** — a C library that gives Node the **event loop** and **async I/O** (I/O = input/output, like reading files, network calls, database calls).
- **Core modules** — ready-made tools like \`fs\` (files), \`http\` (servers), \`crypto\`, \`path\`, \`events\`.

Your JavaScript runs on **one main thread**. When you ask for slow work (read a file, call an API), Node hands it off and keeps running other code. When the work is done, your callback is put in a queue and run later.

#### Deeper version
Between your JS and the C/C++ parts there are **bindings** — glue code that lets JS call native functions. For example \`fs.readFile\` in JS calls a C++ binding, which asks libuv to do the read.

libuv uses two strategies:
- For **network I/O** (sockets), it uses the operating system's async features (epoll on Linux, kqueue on macOS, IOCP on Windows). No extra thread needed.
- For work the OS cannot do async (most file system calls, DNS \`lookup\`, some \`crypto\`, \`zlib\`), it uses a small **thread pool** (4 threads by default).

So "Node is single-threaded" really means **your JavaScript** runs on one thread. Node itself uses more threads behind the scenes.`,
      why: `Classic servers often used one thread per request. Threads cost memory, and most of the time they just sit and wait for the database or the network.

Node's model is: one thread runs the JS, and while waiting for I/O it serves other requests. This makes Node very good for **I/O-heavy** apps — APIs, real-time chat, proxies, streaming — and lets frontend developers use the same language (JavaScript/TypeScript) on the server.`,
      analogy: `Think of a single waiter in a restaurant. The waiter (main thread) takes your order and gives it to the kitchen (libuv / OS). The waiter does not stand in the kitchen waiting for your food. They go take other orders. When the food is ready, the kitchen rings a bell (callback in the queue) and the waiter brings it to you.`,
      code: [
        {
          title: 'Non-blocking file read',
          lang: 'javascript',
          code: `import { readFile } from 'node:fs/promises';

console.log('1. Start');

// This read is handed off; Node does not wait here
readFile(new URL(import.meta.url), 'utf8').then((text) => {
  console.log('3. File read done, length:', text.length);
});

console.log('2. Doing other work while the file is read');`,
        },
        {
          title: 'A tiny HTTP server',
          lang: 'javascript',
          code: `import http from 'node:http';

// One process, one JS thread, many concurrent requests
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, path: req.url }));
});

server.listen(3000, () => console.log('Listening on http://localhost:3000'));`,
        },
      ],
      output: `In the first example the order is \`1. Start\`, \`2. Doing other work...\`, then \`3. File read done\`. The file read is started, but Node does not block. It finishes the current code first, and the \`.then\` callback runs later when libuv says the read is done.

The second example starts a server. Even with one JS thread it can handle many requests at the same time, because each request mostly waits on I/O, and the thread is free during that wait.`,
      questions: [
        {
          q: 'What is Node.js?',
          a: 'A JavaScript runtime built on Chrome\'s V8 engine and libuv. It runs JS on the server with an event-driven, non-blocking I/O model.',
        },
        {
          q: 'Is Node.js single-threaded?',
          a: 'Your JavaScript runs on one main thread. But Node uses a libuv thread pool (default 4 threads) for file system, DNS lookup, some crypto and zlib work, and V8 uses extra threads for things like garbage collection.',
        },
        {
          q: 'What is V8 and what is libuv?',
          a: 'V8 compiles and runs JavaScript. libuv is a C library that provides the event loop, async I/O on top of the OS, and the thread pool.',
        },
        {
          q: 'When is Node a bad choice?',
          a: 'For heavy CPU work (video encoding, big image processing, large number crunching) on the main thread, because it blocks every other request. You can still do it with worker threads or a separate service.',
        },
      ],
      spoken: `"Node.js is a JavaScript runtime made of V8, which runs the JS, and libuv, which gives us the event loop and async I/O. My JavaScript runs on a single main thread. When I do I/O, like a database query or a file read, Node hands it to the operating system or to libuv's thread pool and keeps serving other requests. When the result is ready, the callback is queued and run. That's why Node handles lots of concurrent I/O cheaply, but I avoid heavy CPU work on the main thread because it blocks everyone."`,
      mistakes: [
        'Saying "Node is fully single-threaded". Only your JS runs on one thread; libuv and V8 use other threads.',
        'Saying "Node is a framework" or "a language". It is a runtime. Express is the framework; JavaScript is the language.',
        'Thinking all async work uses the thread pool. Network I/O uses OS async features, not the thread pool.',
        'Follow-up trap: "So if Node is single-threaded, how does it handle 10,000 connections?" Because most of the time those connections are waiting on I/O, and waiting does not need a thread — the OS notifies libuv when data arrives.',
      ],
      takeaway: 'Node = V8 runs your JS on one thread, libuv does the waiting — great for I/O, careful with CPU.',
    },
    {
      id: 'single-thread-non-blocking',
      title: 'Single Thread, Blocking vs Non-blocking',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'One JS thread serves every request, so one slow synchronous task blocks everyone. Keep the main thread free.',
      what: `**Blocking** code makes the thread wait until it finishes. Nothing else can run.
**Non-blocking** code starts the work and returns at once. The result comes later through a callback, promise or event.

In Node, all requests share **one JS thread**. If one request runs a slow \`for\` loop for 2 seconds, every other user waits 2 seconds too.

#### Deeper version
Blocking can come from:
- **Sync APIs**: \`fs.readFileSync\`, \`crypto.pbkdf2Sync\`, \`zlib.gzipSync\`, \`child_process.execSync\`.
- **CPU-heavy JS**: big loops, sorting huge arrays, \`JSON.parse\` / \`JSON.stringify\` on very large objects.
- **Bad regular expressions** that take exponential time (ReDoS — "Regular expression Denial of Service").

The event loop can only move on when the current JS code finishes. So "event loop lag" (how late timers fire) is a good health signal. You can measure it with \`perf_hooks.monitorEventLoopDelay()\`.

Fixes: use async APIs, split work into chunks (\`setImmediate\` between chunks), move CPU work to **worker threads**, or move it to another service/queue.`,
      why: `Understanding this is the difference between a fast API and an API that randomly freezes under load. Many production incidents in Node are "someone added a sync call or a heavy loop in a request handler".`,
      analogy: `One cashier at a shop. If a customer starts counting 10,000 coins at the counter (blocking), the whole line waits. A smart cashier says "count them at the side table and come back" (non-blocking), and serves the next person.`,
      code: [
        {
          title: 'One slow route blocks every route',
          lang: 'javascript',
          code: `import http from 'node:http';

http.createServer((req, res) => {
  if (req.url === '/slow') {
    // Blocking CPU work: ~3 seconds of busy loop
    const end = Date.now() + 3000;
    while (Date.now() < end) {}
    return res.end('slow done');
  }
  res.end('fast'); // also waits while /slow is running!
}).listen(3000);

// Try: open /slow, then quickly open / in another tab.`,
        },
        {
          title: 'Sync vs async file read',
          lang: 'javascript',
          code: `import fs from 'node:fs';

// Blocking: the thread stops here until the file is read
const a = fs.readFileSync('package.json', 'utf8');
console.log('sync read done');

// Non-blocking: start the read, continue right away
fs.readFile('package.json', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('async read done');
});
console.log('this prints before "async read done"');`,
        },
      ],
      output: `In the server, while \`/slow\` is spinning, the request to \`/\` cannot get a response — it waits about 3 seconds even though its own work is tiny.

In the file example, you see \`sync read done\`, then \`this prints before "async read done"\`, then \`async read done\`. Sync reads are fine at startup (loading config once), but not inside request handlers.`,
      questions: [
        {
          q: 'What does "blocking the event loop" mean?',
          a: 'Running synchronous code that takes a long time on the main thread. While it runs, no callbacks, timers or requests can be processed.',
        },
        {
          q: 'How do you handle CPU-heavy work in Node?',
          a: 'Move it off the main thread: worker threads, a child process, or a job queue (like BullMQ) with separate workers. For medium work you can split it into chunks with `setImmediate`.',
        },
        {
          q: 'Is it ever OK to use readFileSync?',
          a: 'Yes, at startup — for example loading a config file once before the server starts. Not inside a request handler.',
        },
        {
          q: 'How can you detect event loop blocking in production?',
          a: 'Measure event loop delay with `perf_hooks.monitorEventLoopDelay()` or an APM tool, and watch p99 latency. Profiling with `--cpu-prof` or `--inspect` shows which function is hot.',
        },
      ],
      spoken: `"In Node, all requests share one JavaScript thread. Non-blocking code starts work and returns immediately, and the result comes back later through a callback or promise. Blocking code holds the thread, so if one request runs a three-second loop or a sync crypto call, every other request waits too. So I never use sync APIs inside request handlers, I keep JSON payloads reasonable, and for CPU-heavy tasks like PDF generation or image resizing I use worker threads or push the job to a queue with separate workers."`,
      mistakes: [
        'Wrapping CPU work in a Promise and thinking it is now non-blocking. `new Promise(() => heavyLoop())` still runs the loop on the main thread.',
        'Using `*Sync` functions (readFileSync, pbkdf2Sync, execSync) in request handlers.',
        'Forgetting that huge `JSON.parse`/`JSON.stringify` calls are synchronous and can block for hundreds of milliseconds.',
        'Follow-up trap: "Does `async` on a function make it run in the background?" No. An async function runs synchronously until its first `await`; CPU work inside it still blocks.',
      ],
      takeaway: 'One thread serves everyone — never make it wait on CPU work or sync calls.',
    },
    {
      id: 'modules-cjs-esm',
      title: 'Modules: CommonJS vs ES Modules',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'CommonJS uses require/module.exports and loads synchronously; ESM uses import/export, loads asynchronously and is the modern standard.',
      what: `A **module** is just a file that shares some code with other files. Node supports two systems:

- **CommonJS (CJS)** — the original Node way. \`require()\` to import, \`module.exports\` to export.
- **ES Modules (ESM)** — the official JavaScript standard. \`import\` / \`export\`.

How Node decides which one a file is:
- \`.cjs\` is always CommonJS. \`.mjs\` is always ESM.
- \`.js\` follows the nearest \`package.json\`: \`"type": "module"\` means ESM, otherwise CommonJS.

#### Deeper version
Key differences:
- **Loading**: \`require\` is synchronous and runs at the moment it is called (it can be inside an \`if\`). ESM is parsed first, imports are resolved, then the code runs. This allows **top-level await** and **tree-shaking**.
- **Bindings**: \`require\` gives you a **copy of the exports object at that moment**. ESM imports are **live bindings** — if the exporting module changes the value, you see the change.
- **Globals**: CJS has \`__dirname\`, \`__filename\`, \`require\`, \`module\`. ESM does not; use \`import.meta.url\` (newer Node versions, 20.11+, also have \`import.meta.dirname\` and \`import.meta.filename\`).
- **Interop**: ESM can \`import\` CommonJS files. CommonJS cannot \`require()\` ESM in older versions — use dynamic \`import()\`. Newer Node versions (22.x and backported to some 20.x releases) added \`require()\` of ESM; the details vary by version, so check the docs for your version.
- ESM needs **full file extensions** in relative imports: \`import x from './util.js'\`.
- **Caching**: both cache a module after the first load. Requiring it again returns the same instance.`,
      why: `You will meet both every day: old packages and many backends are CommonJS; new packages are often ESM-only (for example newer versions of \`node-fetch\`, \`chalk\`, \`nanoid\`). Knowing the rules prevents errors like \`ERR_REQUIRE_ESM\` and "Cannot use import statement outside a module".`,
      analogy: `CommonJS is like asking a colleague for a document and they photocopy it for you right now (sync, a copy). ESM is like a shared Google Doc link listed at the top of your plan (imports declared first), and you always see the latest version (live binding).`,
      code: [
        {
          title: 'CommonJS',
          lang: 'javascript',
          code: `// math.cjs
function add(a, b) { return a + b; }
module.exports = { add };

// app.cjs
const { add } = require('./math.cjs');
const path = require('node:path');
console.log(add(2, 3));               // 5
console.log(path.basename(__filename)); // app.cjs`,
        },
        {
          title: 'ES Modules + interop',
          lang: 'javascript',
          code: `// math.mjs
export function add(a, b) { return a + b; }
export default function sub(a, b) { return a - b; }

// app.mjs
import sub, { add } from './math.mjs'; // extension is required
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(add(2, 3), sub(5, 1)); // 5 4
console.log(path.basename(__dirname));

// Top-level await works only in ESM
const { default: os } = await import('node:os');
console.log(os.platform());`,
        },
      ],
      output: `The CJS file prints \`5\` and \`app.cjs\`. The ESM file prints \`5 4\`, the folder name, and your platform (like \`darwin\` or \`linux\`). Note how ESM rebuilds \`__dirname\` from \`import.meta.url\`, and uses top-level \`await\` with a dynamic \`import()\`.`,
      questions: [
        {
          q: 'What are the main differences between CommonJS and ES Modules?',
          a: 'Syntax (`require`/`module.exports` vs `import`/`export`), loading (sync at call time vs parsed and linked first), bindings (copy vs live), and ESM supports top-level await and tree-shaking. ESM has no `__dirname` or `require` by default.',
        },
        {
          q: 'How does Node know if a .js file is ESM?',
          a: 'It looks at the nearest `package.json`. If `"type": "module"`, `.js` files are ESM; otherwise CommonJS. `.mjs` is always ESM and `.cjs` is always CommonJS.',
        },
        {
          q: 'How do you use an ESM-only package from CommonJS?',
          a: 'Use dynamic import: `const { default: pkg } = await import(\'pkg\')` inside an async function. Or migrate the project to ESM, or pin the last CJS version of the package. Newer Node versions can `require()` ESM in many cases — check your version.',
        },
        {
          q: 'What is module caching?',
          a: 'After the first load, Node stores the module in a cache. Later imports or requires return the same object, so module-level code runs only once — that is why a DB connection in a module acts like a singleton.',
        },
        {
          q: 'What is the difference between module.exports and exports?',
          a: '`exports` is just a shortcut variable pointing to `module.exports`. Adding properties (`exports.a = 1`) works. Re-assigning `exports = {...}` breaks the link, and nothing is exported — use `module.exports = {...}` instead.',
        },
      ],
      spoken: `"Node supports two module systems. CommonJS is the original one with require and module.exports — it loads synchronously and gives you a copy of the exports. ES Modules use import and export, are parsed and linked before running, support top-level await and tree-shaking, and imports are live bindings. Node decides by file extension or by the type field in package.json. In practice I hit interop issues, like an ESM-only package in a CommonJS project, and I solve it with dynamic import or by moving the service to ESM. In ESM I rebuild __dirname from import.meta.url."`,
      mistakes: [
        'Forgetting the file extension in ESM relative imports (`./util` instead of `./util.js`) — Node throws `ERR_MODULE_NOT_FOUND`.',
        'Using `__dirname` in an ESM file — it is not defined there.',
        'Writing `exports = { a }` in CommonJS. That re-assigns the local variable; use `module.exports = { a }`.',
        'Mixing `"type": "module"` with TypeScript or Jest config without updating them, leading to confusing errors.',
        'Follow-up trap: "What happens with circular requires in CommonJS?" One module gets a partially filled `exports` object (whatever was exported before the cycle). It does not crash, but values can be `undefined`.',
      ],
      takeaway: 'CJS = require, sync, copy; ESM = import, linked first, live bindings — and the package.json "type" field decides for .js files.',
    },
    {
      id: 'package-json-npm',
      title: 'package.json, npm, Lock Files and Scripts',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'package.json describes your project and dependency ranges; package-lock.json pins exact versions; npm ci installs exactly from the lock file.',
      what: `**package.json** is the ID card of a Node project. It lists the name, version, scripts, and dependencies.

- \`dependencies\` — needed at runtime (express, mongoose).
- \`devDependencies\` — only for building and testing (typescript, jest, eslint).
- \`scripts\` — short commands: \`npm run dev\`, \`npm test\`.
- \`engines\` — which Node versions the project supports.

**package-lock.json** records the **exact** version of every package (including dependencies of dependencies) that was installed.

#### Deeper version
- \`npm install\` reads package.json ranges (like \`^4.18.0\`), may update the lock file, and installs.
- \`npm ci\` deletes \`node_modules\`, installs **exactly** what the lock file says, and fails if package.json and the lock file disagree. Use it in CI and Docker builds for repeatable installs.
- **npx** runs a package binary without installing it globally: \`npx prisma migrate dev\`.
- **peerDependencies** — "the app using me must provide this" (a React component library needs \`react\` from the app).
- \`npm run\` adds \`node_modules/.bin\` to the PATH, so scripts can call local tools like \`tsc\` directly.
- Lifecycle scripts like \`preinstall\` / \`postinstall\` run code during install — a supply-chain risk; \`npm ci --ignore-scripts\` is a hardening option.`,
      why: `Without a lock file, two developers (or your laptop and production) can get different versions of the same library and see different bugs. Clear scripts and the \`engines\` field make onboarding and CI predictable.`,
      analogy: `package.json is a shopping list that says "any brand of milk, version 4 or above". package-lock.json is the receipt that says "we bought Amul milk, batch 4.18.2". To cook the same dish again, you follow the receipt (\`npm ci\`), not the list.`,
      code: [
        {
          title: 'A typical package.json',
          lang: 'json',
          code: `{
  "name": "orders-api",
  "version": "1.4.0",
  "type": "module",
  "engines": { "node": ">=18.0.0" },
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "test": "node --test",
    "lint": "eslint ."
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "~7.6.0"
  },
  "devDependencies": {
    "eslint": "^8.57.0"
  }
}`,
        },
        {
          title: 'Everyday commands',
          lang: 'bash',
          code: `npm install express          # add a runtime dependency
npm install -D typescript     # add a dev dependency
npm ci                        # clean, exact install from the lock file (CI/Docker)
npm run dev                   # run a script
npx tsc --init                # run a local/remote binary
npm ls mongoose               # see which version is installed and why`,
        },
      ],
      output: `With this file, \`npm run dev\` starts the server with \`--watch\` (auto restart on file change, available in Node 18.11+ and marked experimental there). \`^4.18.2\` allows any 4.x version at or above 4.18.2; \`~7.6.0\` allows only 7.6.x patches. The \`engines\` field documents that Node 18+ is required (npm only warns unless \`engine-strict\` is set).`,
      questions: [
        {
          q: 'What is the difference between npm install and npm ci?',
          a: '`npm install` resolves ranges and can update the lock file. `npm ci` installs exactly from the lock file, removes node_modules first, and fails if the lock file is out of sync. Use `npm ci` in CI and Docker.',
        },
        {
          q: 'Should you commit package-lock.json?',
          a: 'Yes, for apps. It guarantees everyone and every environment installs the same versions.',
        },
        {
          q: 'dependencies vs devDependencies vs peerDependencies?',
          a: 'dependencies are needed at runtime, devDependencies only for building/testing, peerDependencies must be provided by the host project (common for plugins and UI libraries).',
        },
        {
          q: 'What does the engines field do?',
          a: 'It declares supported Node (and npm) versions. npm warns on mismatch; with `engine-strict=true` in `.npmrc` it fails the install.',
        },
      ],
      spoken: `"package.json describes the project: scripts, dependency ranges, and the engines field for the Node version. The lock file pins the exact version of every package in the tree, so I always commit it. Locally I use npm install, but in CI and Docker I use npm ci, which installs exactly what's in the lock file and fails if it's out of sync — that gives repeatable builds. I keep build tools in devDependencies so production images stay smaller, and I use npx to run local binaries like tsc or prisma."`,
      mistakes: [
        'Not committing the lock file, then getting "works on my machine" bugs.',
        'Using `npm install` in CI instead of `npm ci`.',
        'Putting runtime packages in devDependencies, then the production build (`npm ci --omit=dev`) crashes with "Cannot find module".',
        'Follow-up trap: "Does the engines field stop people from using the wrong Node?" Not by default — npm only warns. Use `engine-strict=true` or a CI check.',
      ],
      takeaway: 'package.json = what you want, lock file = what you got; use npm ci for repeatable installs.',
    },
    {
      id: 'fs-module',
      title: 'The fs Module (and path)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'fs reads and writes files in three styles — sync, callback, and promises. Prefer fs/promises, and use streams for big files.',
      what: `The \`fs\` (file system) module lets Node read, write, delete and watch files and folders.

It has three styles of the same functions:
- **Sync**: \`fs.readFileSync\` — blocks the thread. OK at startup only.
- **Callback**: \`fs.readFile(path, cb)\` — the old async style.
- **Promises**: \`import { readFile } from 'node:fs/promises'\` — modern, works with \`async/await\`.

The \`path\` module builds file paths safely: \`path.join\`, \`path.resolve\`, \`path.extname\`, \`path.basename\`.

#### Deeper version
- \`readFile\` loads the **whole file into memory**. For a 2 GB log file, use \`fs.createReadStream\` instead.
- Most \`fs\` calls run on the **libuv thread pool**, because operating systems do not offer good async file APIs everywhere. Many parallel file operations can fill the 4 default threads.
- **Relative paths** resolve against \`process.cwd()\` (where you started Node), **not** the file's folder. Use \`path.join(__dirname, ...)\` (CJS) or \`new URL('./x', import.meta.url)\` (ESM).
- Check-then-act is a race condition: \`if (exists) readFile()\` can fail if the file is deleted in between. Just try the operation and handle \`ENOENT\`.
- \`fs.watch\` is platform-dependent; tools like chokidar smooth it out.`,
      why: `Servers read config files, write uploads, rotate logs, and generate reports. Doing it with the wrong style (sync in a handler) or the wrong size (readFile on huge files) is a common performance and memory bug.`,
      analogy: `readFile is like photocopying an entire book before reading it. A stream is like reading it page by page. Sync reading is like making the whole queue wait while you photocopy.`,
      code: [
        {
          title: 'Read, write and handle errors with fs/promises',
          lang: 'javascript',
          code: `import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data');
const file = path.join(dir, 'notes.json');

await mkdir(dir, { recursive: true }); // no error if it exists
await writeFile(file, JSON.stringify({ tasks: ['learn fs'] }, null, 2));

try {
  const text = await readFile(file, 'utf8');
  console.log(JSON.parse(text).tasks); // [ 'learn fs' ]
  await readFile(path.join(dir, 'missing.json'), 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') console.log('File not found:', err.path);
  else throw err;
}`,
        },
        {
          title: 'Big file: count lines with a stream',
          lang: 'javascript',
          code: `import { createReadStream } from 'node:fs';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: createReadStream('big.log'), // reads in small chunks
});

let lines = 0;
for await (const line of rl) lines++;
console.log('Lines:', lines);`,
        },
      ],
      output: `The first script creates \`data/notes.json\`, reads it back and prints \`[ 'learn fs' ]\`. Reading \`missing.json\` throws an error with \`code: 'ENOENT'\` ("Error NO ENTry" = file not found), which we catch and print.

The second script counts lines in a file of any size with low, steady memory, because it never loads the whole file at once.`,
      questions: [
        {
          q: 'readFile vs createReadStream?',
          a: '`readFile` loads the whole file into memory at once. `createReadStream` reads it in chunks (64 KB by default for files), so memory stays small. Use streams for big files or when piping to a response.',
        },
        {
          q: 'Why should you avoid fs.existsSync before reading?',
          a: 'It is a race condition (the file can change between the check and the read) and it is an extra call. Just read and handle the `ENOENT` error.',
        },
        {
          q: 'Where do relative paths in fs resolve from?',
          a: 'From `process.cwd()`, the folder Node was started in, not the folder of the current file. Use `__dirname` or `import.meta.url` to build paths relative to the file.',
        },
        {
          q: 'Does fs use the thread pool?',
          a: 'Yes, most async fs operations run on the libuv thread pool, which has 4 threads by default (`UV_THREADPOOL_SIZE`).',
        },
      ],
      spoken: `"The fs module handles files, and it comes in sync, callback and promise styles. I use fs/promises with async/await by default, sync calls only at startup, and streams for big files so memory stays flat. I build paths with the path module, and I remember relative paths resolve from process.cwd, not the file's folder, so I anchor them to __dirname or import.meta.url. Instead of checking if a file exists first, I just try the operation and handle ENOENT, which avoids race conditions."`,
      mistakes: [
        'Using `readFile` on very large files and running out of memory.',
        'Building paths with string concatenation (`dir + "/" + name`) instead of `path.join`, which breaks on Windows and with extra slashes.',
        'Assuming relative paths are relative to the current file.',
        'Follow-up trap: "Is `path.join` safe for user input?" No. `path.join(uploads, "../../etc/passwd")` escapes the folder. Resolve the path and check it still starts with your base folder.',
      ],
      takeaway: 'Use fs/promises for normal work, streams for big files, and path helpers anchored to the file — never sync in handlers.',
    },
    {
      id: 'env-variables',
      title: 'Environment Variables and Config',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'process.env holds config like DB URLs and API keys. Values are always strings — validate them at startup and never commit secrets.',
      what: `**Environment variables** are key-value settings given to a process by the operating system. In Node you read them from \`process.env\`.

We use them for anything that changes between environments: \`PORT\`, \`MONGO_URI\`, \`STRIPE_SECRET_KEY\`, \`NODE_ENV\`.

Locally we often keep them in a \`.env\` file and load it with the **dotenv** package, or with Node's built-in \`--env-file\` flag (added in Node 20.6, so not available in Node 18).

#### Deeper version
- Every value in \`process.env\` is a **string**. \`process.env.DEBUG = false\` becomes \`"false"\`, which is truthy. Convert explicitly.
- Missing variables are \`undefined\`. Validate **all** config at startup with a schema (zod, envalid, joi) and crash early with a clear message — better than failing at 2 a.m. on the first payment.
- \`NODE_ENV=production\` makes many libraries (like Express) switch to faster, less verbose behaviour.
- In production, secrets come from the platform: AWS Secrets Manager / Parameter Store, GCP Secret Manager, Kubernetes secrets, or your host's env settings — not from a committed \`.env\`.
- Reading \`process.env\` is a bit slower than a normal object, so read once into a config object.`,
      why: `The same code must run on your laptop, staging, and production with different databases and keys. Env variables separate **config from code** (a rule from the "12-factor app" guidelines) and keep secrets out of git.`,
      analogy: `Your app is a travel adapter. The env variables are the settings for each country: the plug is the same, but the voltage setting changes when you travel. You don't rebuild the adapter for every country.`,
      code: [
        {
          title: 'Validated config module',
          lang: 'javascript',
          code: `// config.js
import 'dotenv/config'; // loads .env into process.env (local dev)

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error('Missing env variable: ' + name);
  return value;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),          // string -> number
  mongoUri: required('MONGO_URI'),
  stripeKey: required('STRIPE_SECRET_KEY'),
  debug: process.env.DEBUG === 'true',             // string -> boolean
};`,
        },
        {
          title: 'Ways to pass env variables',
          lang: 'bash',
          code: `# One-off, inline (macOS/Linux)
PORT=4000 NODE_ENV=production node server.js

# Node 20.6+ built-in .env loading (not in Node 18)
node --env-file=.env server.js

# .gitignore should always contain:
# .env`,
        },
      ],
      output: `If \`MONGO_URI\` is missing, the app throws \`Missing env variable: MONGO_URI\` right at startup instead of failing later. \`PORT\` becomes the number \`3000\` (or whatever was set), and \`debug\` is a real boolean, not the string \`"false"\`.`,
      questions: [
        {
          q: 'How do you manage secrets in a Node app?',
          a: 'Locally with a git-ignored .env file. In production with a secret manager (AWS Secrets Manager, GCP Secret Manager) or platform env settings. Validate them at startup and never log them.',
        },
        {
          q: 'What type are values in process.env?',
          a: 'Always strings (or undefined). You must convert numbers and booleans yourself.',
        },
        {
          q: 'What does NODE_ENV=production do?',
          a: 'Node itself does not care much, but libraries do: Express caches view templates and gives less verbose errors, and many tools skip dev-only checks. It is a convention, so set it in production.',
        },
        {
          q: 'Why validate env variables at startup?',
          a: 'To fail fast with a clear message. A missing key found during startup is a 1-minute fix; found during a live request it is an incident.',
        },
      ],
      spoken: `"I keep all environment-specific settings — ports, database URIs, Stripe and OpenAI keys — in environment variables, not in code. Locally they come from a git-ignored .env file via dotenv, and in production from the platform or a secret manager like AWS Secrets Manager. I read them in one config module, convert types because everything in process.env is a string, and validate them with a schema so the app crashes at startup if something is missing. I also make sure secrets never end up in logs or error messages."`,
      mistakes: [
        'Checking `if (process.env.FEATURE_ON)` when the value is `"false"` — non-empty strings are truthy.',
        'Committing `.env` to git, or baking secrets into a Docker image.',
        'Reading `process.env` all over the codebase instead of one validated config module.',
        'Follow-up trap: "Are env variables in a frontend bundle secret?" No. Anything bundled into client code (for example `NEXT_PUBLIC_*`) is public. Real secrets stay on the server.',
      ],
      takeaway: 'Config lives in env variables; read them once, convert types, validate at startup, keep secrets out of git and logs.',
    },
    {
      id: 'http-module',
      title: 'The http Module (What Express Sits On)',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'http.createServer gives you raw req (a readable stream) and res (a writable stream). Express is a layer on top of this.',
      what: `The built-in \`http\` module lets Node act as a web server or a web client without any framework.

\`http.createServer((req, res) => { ... })\` calls your function for **every** request:
- \`req\` (request) has the method, URL and headers. The **body** is not ready yet — it arrives as a stream of chunks.
- \`res\` (response) is where you set the status, headers, and write the body. You must call \`res.end()\`.

#### Deeper version
- \`req\` is a **Readable stream** and \`res\` is a **Writable stream**. That is why you can \`pipe\` a file straight into \`res\`.
- Express adds routing, middleware, \`req.body\` parsing (\`express.json()\`), \`res.json()\`, and error handling — but underneath it is still \`http.createServer\`.
- Keep-alive: Node reuses TCP connections. \`server.keepAliveTimeout\` (default 5 seconds) should be **longer** than your load balancer's idle timeout, otherwise you can get random 502 errors behind an AWS ALB.
- \`server.headersTimeout\` and \`server.requestTimeout\` protect against slow clients. Defaults have changed across Node versions — check the docs for yours.
- For HTTPS use the \`https\` module (or terminate TLS at a load balancer/Nginx, which is more common).`,
      why: `Interviewers ask this to see whether you understand what Express actually does. It also explains real bugs: forgetting \`res.end()\` (request hangs), reading a body that never got parsed, and 502s from keep-alive timeouts.`,
      analogy: `The http module is a bare kitchen with a stove and a fridge. Express is a fully set-up restaurant kitchen with labelled stations (routes) and a prep line (middleware). The stove underneath is the same.`,
      code: [
        {
          title: 'Raw JSON API with body parsing',
          lang: 'javascript',
          code: `import http from 'node:http';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/echo') {
    // The body arrives in chunks; collect them
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ youSent: body }));
  }
  res.statusCode = 404;
  res.end('Not found'); // without end(), the client waits forever
});

server.keepAliveTimeout = 65_000; // longer than ALB idle timeout (60s)
server.listen(3000);`,
        },
        {
          title: 'Try it',
          lang: 'bash',
          code: `curl -X POST localhost:3000/echo -H 'Content-Type: application/json' -d '{"name":"Asha"}'
# {"youSent":{"name":"Asha"}}`,
        },
      ],
      output: `The POST to \`/echo\` returns \`{"youSent":{"name":"Asha"}}\`. Any other URL gets a 404 with "Not found". Notice we had to read the body ourselves from the \`req\` stream — that is exactly what \`express.json()\` does for you.`,
      questions: [
        {
          q: 'What does Express add on top of the http module?',
          a: 'Routing, a middleware chain, body parsing helpers, helpers like `res.json()` and `res.status()`, and centralized error handling. The server itself is still `http.createServer`.',
        },
        {
          q: 'Why is req.body undefined in Express sometimes?',
          a: 'Because the body is a stream and nobody parsed it. You need middleware like `express.json()` before your routes, and the client must send the right Content-Type.',
        },
        {
          q: 'Why do you get random 502 errors behind a load balancer?',
          a: 'Often because Node closes idle keep-alive connections (default 5s) before the load balancer does (ALB default 60s). Set `server.keepAliveTimeout` higher than the LB idle timeout, and `headersTimeout` a bit higher than that.',
        },
      ],
      spoken: `"The http module is what every Node web framework sits on. createServer gives me req and res for each request. req is a readable stream, so the body comes in chunks and has to be collected and parsed — that's what express.json does. res is a writable stream, so I can set status and headers, write, and must always call end. Express adds routing, middleware and error handling on top. One production lesson: behind an AWS load balancer, I set keepAliveTimeout higher than the LB's idle timeout to avoid random 502s."`,
      mistakes: [
        'Forgetting `res.end()` on some code path — the request hangs until the client times out.',
        'Sending a response twice (for example missing `return` after `res.end()`), which throws "Cannot set headers after they are sent".',
        'Parsing big request bodies without a size limit — a client can send gigabytes. Express `json({ limit })` exists for this.',
        'Follow-up trap: "Is req.url the full URL?" No, it is only the path and query string (like `/users?page=2`). Use `new URL(req.url, \'http://\' + req.headers.host)` to parse it.',
      ],
      takeaway: 'req and res are streams; Express is convenience on top of http.createServer.',
    },
    {
      id: 'events-eventemitter',
      title: 'Events and EventEmitter',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'EventEmitter lets objects emit named events and other code listen with on(). Streams, servers and sockets are all EventEmitters.',
      what: `**EventEmitter** is a class from the \`events\` module. An object can **emit** a named event (\`emitter.emit('order', data)\`), and any code that **listens** (\`emitter.on('order', fn)\`) gets called.

Many core Node objects are EventEmitters: HTTP servers (\`'request'\`), streams (\`'data'\`, \`'end'\`, \`'error'\`), sockets, and \`process\` itself (\`'exit'\`, \`'SIGTERM'\`).

#### Deeper version
- \`emit()\` calls listeners **synchronously**, in the order they were added. It is not async by itself.
- \`once()\` listens only one time. \`off()\` / \`removeListener()\` removes a listener.
- The **\`'error'\` event is special**: if you emit \`'error'\` and nobody listens, Node **throws** it and the process can crash.
- If you add more than 10 listeners for one event, Node prints a **MaxListenersExceededWarning** — usually a sign of a memory leak (adding a listener per request and never removing it).
- \`events.once(emitter, 'name')\` returns a promise; \`events.on(emitter, 'name')\` gives an async iterator.`,
      why: `It is the pattern that lets different parts of an app react to things without being tightly linked. For example, after an order is paid, one listener sends an email, another updates analytics — the payment code does not need to know about either.`,
      analogy: `A YouTube channel. The channel (emitter) uploads a video (emits an event). Subscribers (listeners) get notified. The channel does not know or care what each subscriber does with the notification.`,
      code: [
        {
          title: 'Custom emitter',
          lang: 'javascript',
          code: `import { EventEmitter } from 'node:events';

class OrderService extends EventEmitter {
  place(order) {
    // ...save to DB...
    this.emit('placed', order);
  }
}

const orders = new OrderService();
orders.on('placed', (o) => console.log('Send email for', o.id));
orders.on('placed', (o) => console.log('Track analytics for', o.id));
orders.once('placed', () => console.log('First order ever!'));

// Always handle 'error', or an emitted error crashes the process
orders.on('error', (err) => console.error('Order error:', err.message));

console.log('before');
orders.place({ id: 'A1' });
orders.place({ id: 'A2' });
console.log('after');`,
        },
        {
          title: 'Await an event as a promise',
          lang: 'javascript',
          code: `import { EventEmitter, once } from 'node:events';

const ee = new EventEmitter();
setTimeout(() => ee.emit('ready', 42), 100);

const [value] = await once(ee, 'ready'); // resolves with the args array
console.log('ready with', value); // ready with 42`,
        },
      ],
      output: `The first script prints \`before\`, then for A1: email, analytics, "First order ever!", then for A2: email, analytics (the \`once\` listener is gone), then \`after\`. Because \`emit\` is synchronous, all listeners run before \`after\` is printed.

The second script waits 100 ms and prints \`ready with 42\`.`,
      questions: [
        {
          q: 'Is EventEmitter.emit synchronous or asynchronous?',
          a: 'Synchronous. All listeners run right away, in order, before `emit` returns. To make it async, call `emit` inside `setImmediate` or `process.nextTick`, or do async work inside the listener.',
        },
        {
          q: 'What happens if you emit "error" with no listener?',
          a: 'Node throws the error. If nothing catches it, the process crashes with an uncaught exception.',
        },
        {
          q: 'What does MaxListenersExceededWarning mean?',
          a: 'More than 10 listeners were added for one event on one emitter. It usually means a leak, like adding a listener on every request without removing it. Fix the leak; only raise the limit with `setMaxListeners` if many listeners are truly intended.',
        },
        {
          q: 'EventEmitter vs a message queue?',
          a: 'EventEmitter works inside one process and in memory — if the process crashes, events are lost. A queue (SQS, RabbitMQ, BullMQ) works across processes and services and can retry and persist messages.',
        },
      ],
      spoken: `"EventEmitter is Node's built-in publish-subscribe pattern. An object emits named events and listeners registered with on or once get called. A lot of Node is built on it — servers, streams, sockets and the process object. Two things I always keep in mind: emit is synchronous, so listeners run immediately in order, and the error event is special — if no one listens, it throws and can crash the process. I also watch for MaxListenersExceeded warnings, because they usually mean listeners are being added per request and never removed."`,
      mistakes: [
        'Assuming listeners run asynchronously. A slow listener blocks the code that called `emit`.',
        'Not adding an `\'error\'` listener on streams, sockets or custom emitters.',
        'Adding listeners inside a request handler or loop and never removing them, causing a memory leak.',
        'Follow-up trap: "If an async listener rejects, does EventEmitter catch it?" No, by default the rejected promise is unhandled. `captureRejections: true` can route it to the `\'error\'` event.',
      ],
      takeaway: 'EventEmitter = in-process pub/sub; emit is synchronous, and always handle "error".',
    },
    {
      id: 'callbacks-promises-async',
      title: 'Callbacks, Promises, promisify and async/await in Node',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Node started with error-first callbacks; today we use promises and async/await, with util.promisify and fs/promises bridging old APIs.',
      what: `Callbacks, Promises and async/await are the three main ways to handle **async work** (work that finishes later, like reading a file or calling a database) in Node.js.

#### 1. Callbacks
A **callback** is a function you pass into another function. It runs when the async task is done.

Node uses **error-first callbacks**: the first parameter is the error (or \`null\` if all went well), and the next parameters hold the result.

\`\`\`javascript
const fs = require('node:fs');

fs.readFile('notes.txt', 'utf8', (err, data) => {
  if (err) return console.error('Failed:', err.message);
  console.log(data); // file contents
});
\`\`\`

Nesting many callbacks inside each other leads to **callback hell**: code that drifts to the right and is hard to read.

#### 2. Promises
A **Promise** is an object that stands for a result that will come **later**. It either succeeds (resolves) with a value or fails (rejects) with an error.

\`\`\`javascript
const fs = require('node:fs/promises');

fs.readFile('notes.txt', 'utf8')
  .then((data) => console.log(data))              // success
  .catch((err) => console.error('Failed:', err.message)); // failure
\`\`\`

#### 3. async/await
**async/await** is a nicer way to write Promises. It makes async code read like normal top-to-bottom code.
- An \`async\` function **always returns a Promise**.
- \`await\` **pauses** the function until the Promise finishes, then gives you the value.

\`\`\`javascript
const fs = require('node:fs/promises');

async function readNotes() {
  try {
    const data = await fs.readFile('notes.txt', 'utf8'); // waits here
    console.log(data);
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

readNotes();
\`\`\`

All three do the same job. The difference is how the code looks and how you handle errors: \`err\` first in callbacks, \`.catch()\` with Promises, \`try/catch\` with async/await.

#### Turning old callbacks into Promises
- \`util.promisify(fn)\` turns an error-first callback function into one that returns a Promise.
- Many core modules have Promise versions: \`node:fs/promises\`, \`node:timers/promises\`, \`node:stream/promises\`, \`node:dns/promises\`.

#### Deeper version
- \`await\` inside a \`for\` loop runs things **one by one**. Use \`Promise.all\` for parallel work, \`Promise.allSettled\` when some may fail, and a limit (like \`p-limit\`) when there are thousands of items so you don't overload the DB.
- \`Promise.all\` rejects on the **first** failure, but the other operations keep running — it does not cancel them. Use **AbortController** to cancel (fetch, timers and many core APIs accept a \`signal\`).
- Always \`return\` or \`await\` promises. A "floating" promise that rejects becomes an **unhandled rejection**, which crashes Node 15+.
- Never mix styles in one function (calling the callback **and** returning a promise) — the caller may get the result twice.`,
      why: `Most legacy Node code and some libraries still use callbacks. You need to read them, convert them safely, and write modern async code that runs in parallel when possible and handles every error.`,
      analogy: `A callback is "call me back on this number when it's ready". A promise is a token from a restaurant buzzer — you hold it, and it will either buzz (resolve) or flash red (reject). async/await is just waiting at the counter politely while still letting others order.`,
      code: [
        {
          title: 'From callback to async/await',
          lang: 'javascript',
          code: `import { promisify } from 'node:util';
import { scrypt, randomBytes } from 'node:crypto';

// scrypt is a callback API: scrypt(password, salt, keylen, cb)
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, 64);
  return salt + ':' + key.toString('hex');
}

console.log(await hashPassword('s3cret'));`,
        },
        {
          title: 'Sequential vs parallel vs settled',
          lang: 'javascript',
          code: `import { setTimeout as sleep } from 'node:timers/promises';

const fetchUser = async (id) => { await sleep(100); return { id }; };

console.time('sequential');
for (const id of [1, 2, 3]) await fetchUser(id); // ~300ms
console.timeEnd('sequential');

console.time('parallel');
await Promise.all([1, 2, 3].map(fetchUser));     // ~100ms
console.timeEnd('parallel');

const results = await Promise.allSettled([
  fetchUser(1),
  Promise.reject(new Error('DB down')),
]);
console.log(results.map((r) => r.status)); // [ 'fulfilled', 'rejected' ]`,
        },
      ],
      output: `The first script prints something like \`a3f1...:9bc2...\` — a salt and a derived key in hex.

The second prints \`sequential: ~300ms\`, \`parallel: ~100ms\`, then \`[ 'fulfilled', 'rejected' ]\`. Running independent calls with \`Promise.all\` is three times faster here.`,
      questions: [
        {
          q: 'What is an error-first callback?',
          a: 'The Node convention where the callback\'s first argument is an error (or null) and the next ones are results: `(err, data) => {}`. You always check `err` first.',
        },
        {
          q: 'What does util.promisify do?',
          a: 'It wraps a function that uses an error-first callback and returns a version that returns a promise, so you can `await` it.',
        },
        {
          q: 'Promise.all vs Promise.allSettled vs Promise.race vs Promise.any?',
          a: '`all` waits for all and fails fast on the first rejection. `allSettled` waits for all and reports each result. `race` settles with the first to settle. `any` resolves with the first success and rejects only if all fail.',
        },
        {
          q: 'How do you run 10,000 async tasks without overloading the database?',
          a: 'Limit concurrency: process in batches or use a pool/limiter like `p-limit` so only N run at once. Or push them to a queue.',
        },
      ],
      spoken: `"Node's original style is error-first callbacks, which leads to nesting and messy error handling. Today I use async/await everywhere, and I convert old callback APIs with util.promisify or use the built-in promise modules like fs/promises and timers/promises. I'm careful about sequential versus parallel: independent calls go in Promise.all, partial-failure cases use allSettled, and for thousands of items I limit concurrency so I don't overload Mongo or a third-party API. And I always await or return promises so nothing becomes an unhandled rejection."`,
      mistakes: [
        'Using `await` inside a loop for independent calls, making the code slow for no reason.',
        'Using `forEach` with an async callback — `forEach` does not wait, and errors become unhandled. Use `for...of` or `Promise.all(arr.map(...))`.',
        'Forgetting that `Promise.all` does not cancel the other operations when one fails.',
        'Follow-up trap: "Can you promisify any function?" Only ones that follow the error-first callback convention with the callback last. Others need a manual `new Promise` wrapper.',
      ],
      takeaway: 'Use async/await, convert callbacks with promisify, run independent work in parallel, and never leave a promise floating.',
    },
    {
      id: 'event-loop-phases',
      title: 'The Event Loop (Node Phases)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'The Node event loop cycles through phases — timers, pending callbacks, poll, check, close — and empties the nextTick and promise queues between callbacks.',
      what: `The **event loop** is the loop that decides **which callback runs next** on the main thread.

Simple version: Node runs your main code. Then it keeps looping: "Is any timer due? Any I/O finished? Any \`setImmediate\` waiting?" and runs those callbacks one at a time. When nothing is left to wait for, the process exits.

Each loop round goes through **phases**, in this order:
1. **timers** — runs \`setTimeout\` / \`setInterval\` callbacks whose time is up.
2. **pending callbacks** — some system I/O callbacks delayed from the last round (like certain TCP errors).
3. **idle, prepare** — internal use only.
4. **poll** — gets new I/O events and runs their callbacks (file read done, data on a socket). If nothing else is scheduled, it can wait here for I/O.
5. **check** — runs \`setImmediate\` callbacks.
6. **close callbacks** — runs things like \`socket.on('close')\`.

#### Deeper version
Two **microtask** queues are not phases — they run **after every single callback** (and after the main script):
- first the \`process.nextTick\` queue,
- then the **promise** microtask queue (\`.then\`, \`await\` continuations).

Both are drained **completely** before the loop continues. So a recursive \`nextTick\` or an endless promise chain can **starve** the loop: I/O and timers never get a turn. (Since Node 11, microtasks run between each individual timer/immediate callback, matching browsers.)

The poll phase is clever: if there are \`setImmediate\` callbacks, it does not wait; if timers are due soon, it waits only until then. Node keeps running while there are "ref'd" handles (open servers, sockets, timers). \`timer.unref()\` lets the process exit even if that timer is pending.`,
      why: `This is the most common Node interview topic. It explains callback ordering, why a heavy loop delays timers, why \`setTimeout(fn, 0)\` is not really 0 ms, and how to avoid starving I/O.`,
      analogy: `A security guard doing rounds in a building with fixed rooms: timer room, I/O room, setImmediate room, closing room. In each room he handles everyone waiting. But between every single person, he checks his phone for two urgent inboxes (nextTick first, then promises) and answers every message there before moving on.`,
      code: [
        {
          title: 'Ordering puzzle (save as order.cjs)',
          lang: 'javascript',
          code: `const fs = require('node:fs');

setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
console.log('sync');

fs.readFile(__filename, () => {
  // Inside an I/O callback we are in the poll phase
  setTimeout(() => console.log('io: timeout'), 0);
  setImmediate(() => console.log('io: immediate'));
});`,
        },
        {
          title: 'Starving the loop with nextTick',
          lang: 'javascript',
          code: `let count = 0;
setTimeout(() => console.log('timer finally ran after', count, 'ticks'), 0);

function spin() {
  if (count++ < 1_000_000) process.nextTick(spin); // keeps refilling the queue
}
spin();`,
        },
      ],
      output: `The puzzle prints:
1. \`sync\` — normal code first.
2. \`nextTick\` then \`promise\` — microtasks run right after the main script (nextTick queue first in CommonJS).
3. \`timeout\` and \`immediate\` — in the **main module** their order is **not guaranteed**; it depends on how fast the loop starts (timer resolution is 1 ms).
4. \`io: immediate\` then \`io: timeout\` — **always** this order, because after the poll phase comes the check phase.

In the second script the timer only runs after all one million ticks — the nextTick queue blocked the timers phase the whole time.

Note: if you run the puzzle as an ES module (.mjs), \`promise\` prints before \`nextTick\`, because ESM code itself runs inside a promise job and the promise queue is drained first.`,
      questions: [
        {
          q: 'What are the phases of the Node.js event loop?',
          a: 'Timers, pending callbacks, idle/prepare, poll, check, and close callbacks. Between each callback, Node drains the nextTick queue and then the promise microtask queue.',
        },
        {
          q: 'What happens in the poll phase?',
          a: 'Node gets completed I/O events and runs their callbacks. If no immediates are queued and no timers are due, it may block here waiting for new I/O.',
        },
        {
          q: 'Why is setTimeout(fn, 0) not instant?',
          a: 'It runs in the timers phase, after the current code and microtasks finish, and the minimum delay is 1 ms. A busy thread delays it further.',
        },
        {
          q: 'How is the Node event loop different from the browser one?',
          a: 'Both have a task queue and microtasks. Node has explicit libuv phases, `process.nextTick` and `setImmediate`. The browser has rendering steps and `requestAnimationFrame`.',
        },
        {
          q: 'When does a Node process exit?',
          a: 'When the event loop has nothing left: no pending timers, no open handles like servers or sockets, and no pending I/O — or when `process.exit()` is called.',
        },
      ],
      spoken: `"The event loop is what decides which callback runs next on Node's single JavaScript thread. After the main script, libuv cycles through phases: timers for setTimeout and setInterval, pending callbacks, poll where I/O callbacks run and where Node can wait for I/O, check for setImmediate, and close callbacks. Between every callback Node drains two microtask queues — process.nextTick first, then promises. So inside an I/O callback, setImmediate always beats setTimeout zero. And because microtasks drain fully, a recursive nextTick or a CPU-heavy callback can starve the loop and delay everything."`,
      mistakes: [
        'Saying setImmediate always runs before setTimeout(0). Only inside an I/O callback; in the main module the order is not guaranteed.',
        'Thinking microtasks run once per loop round. They run after **every** callback.',
        'Calling the promise queue a "phase". Microtasks are not a libuv phase; they run between callbacks.',
        'Follow-up trap: "In an ES module, which runs first: nextTick or a resolved promise?" The promise — the ESM module body itself runs as part of a promise job, so the promise queue drains before Node gets to the nextTick queue.',
      ],
      takeaway: 'Phases: timers → pending → poll → check → close; nextTick and promises drain after every callback.',
    },
    {
      id: 'nexttick-setimmediate-settimeout',
      title: 'process.nextTick vs setImmediate vs setTimeout',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'nextTick runs before anything else (right after the current operation), promises next, setImmediate in the check phase, setTimeout in the timers phase.',
      what: `All three schedule a function to run "later", but **how much later** is different:

- **process.nextTick(fn)** — runs **as soon as the current operation finishes**, before promises and before the event loop moves on. Highest priority.
- **Promise.then / queueMicrotask** — run right after the nextTick queue is empty.
- **setImmediate(fn)** — runs in the **check** phase, after I/O callbacks in the current loop round.
- **setTimeout(fn, 0)** — runs in the **timers** phase, after at least 1 ms.

The names are confusing: \`nextTick\` is actually more "immediate" than \`setImmediate\`. The Node docs themselves admit this.

#### Deeper version
- Use **\`setImmediate\`** to break up CPU work so I/O can run in between (it yields to the event loop).
- Use **\`nextTick\`** when you must run something after the current function returns but **before** any I/O — for example, emitting an event from a constructor after the caller had a chance to attach listeners, or making a callback API always async.
- Recursive \`nextTick\` starves I/O; recursive \`setImmediate\` does not (new immediates added during the check phase run in the **next** round).
- \`queueMicrotask\` is the standard (browser-compatible) way to add a microtask and is usually preferred over \`nextTick\` in new code.`,
      why: `Choosing the wrong one causes subtle bugs: events emitted before listeners exist, starved I/O, or code that is sometimes sync and sometimes async (sometimes called "releasing Zalgo").`,
      analogy: `You are on a call. \`nextTick\` is "let me finish this sentence and then I'll tell you" — immediate. A promise is "right after this sentence and any other sentence-finishers". \`setImmediate\` is "after I check my inbox". \`setTimeout(0)\` is "when the next alarm goes off".`,
      code: [
        {
          title: 'Priority order (CommonJS file)',
          lang: 'javascript',
          code: `setTimeout(() => console.log('4/5 setTimeout'), 0);
setImmediate(() => console.log('4/5 setImmediate'));
Promise.resolve().then(() => console.log('3 promise'));
queueMicrotask(() => console.log('3 queueMicrotask'));
process.nextTick(() => console.log('2 nextTick'));
console.log('1 sync');`,
        },
        {
          title: 'Using setImmediate to keep the server responsive',
          lang: 'javascript',
          code: `// Process a big array in chunks, yielding to I/O between chunks
function processInChunks(items, handle, chunkSize = 1000) {
  return new Promise((resolve) => {
    let i = 0;
    function next() {
      const end = Math.min(i + chunkSize, items.length);
      for (; i < end; i++) handle(items[i]);
      if (i < items.length) setImmediate(next); // let I/O run, then continue
      else resolve();
    }
    next();
  });
}

const data = Array.from({ length: 100_000 }, (_, n) => n);
let sum = 0;
await processInChunks(data, (n) => { sum += n; });
console.log('sum', sum); // sum 4999950000`,
        },
      ],
      output: `The first file prints \`1 sync\`, \`2 nextTick\`, \`3 promise\`, \`3 queueMicrotask\`, then \`setTimeout\` and \`setImmediate\` in an order that may vary in the main module.

The second script finishes with \`sum 4999950000\`. Because it yields with \`setImmediate\` every 1000 items, an HTTP server running in the same process would still answer other requests in between.`,
      questions: [
        {
          q: 'What is the difference between process.nextTick and setImmediate?',
          a: '`nextTick` runs right after the current operation, before promises and before the event loop continues. `setImmediate` runs in the check phase of the event loop, after I/O callbacks.',
        },
        {
          q: 'Which runs first, nextTick or a resolved promise?',
          a: 'In CommonJS, nextTick runs first. The nextTick queue is drained before the promise microtask queue. (In an ES module main file the order can flip.)',
        },
        {
          q: 'When would you use setImmediate?',
          a: 'To run something after pending I/O, or to split long CPU work into chunks so the server stays responsive.',
        },
        {
          q: 'Why can recursive nextTick be dangerous?',
          a: 'The nextTick queue is drained completely before moving on, so if it keeps refilling itself, the event loop never reaches timers or I/O — the server freezes.',
        },
      ],
      spoken: `"All three defer work but at different points. process.nextTick runs as soon as the current operation finishes, before promise callbacks and before the event loop moves on. Then the promise microtasks run. setImmediate runs in the check phase, right after I/O callbacks, and setTimeout zero runs in the timers phase after at least a millisecond. Inside an I/O callback, setImmediate always beats setTimeout. In practice I use setImmediate to chunk CPU-heavy work so I/O can interleave, and I use nextTick or queueMicrotask rarely — mainly to make an API consistently async — because recursive nextTick can starve the loop."`,
      mistakes: [
        'Believing the names: `setImmediate` is not immediate — `nextTick` runs earlier.',
        'Using `nextTick` to "yield" to I/O. It does the opposite; use `setImmediate`.',
        'Assuming `setTimeout(fn, 0)` vs `setImmediate` order is fixed in the main module.',
        'Follow-up trap: "Does setTimeout(fn, 10) run exactly after 10 ms?" No — after **at least** 10 ms, and later if the thread is busy.',
      ],
      takeaway: 'nextTick > promises > setImmediate (check) / setTimeout (timers) — use setImmediate to yield, not nextTick.',
    },
    {
      id: 'libuv-thread-pool',
      title: 'libuv and the Thread Pool',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'libuv runs the event loop and a thread pool (4 threads by default) for fs, dns.lookup, some crypto and zlib. Network I/O uses the OS instead.',
      what: `**libuv** is the C library under Node. It does two big jobs:
1. Runs the **event loop**.
2. Does **async I/O** — either with the operating system's async features, or with its own **thread pool**.

The **thread pool** has **4 threads by default**. These operations use it:
- Most \`fs\` operations (readFile, writeFile, stat...).
- \`dns.lookup\` (used when you connect to a hostname).
- CPU-heavy async \`crypto\`: \`pbkdf2\`, \`scrypt\`, \`randomBytes\` (async version), and similar.
- \`zlib\` async compression.

**Network** I/O (HTTP, TCP sockets, database connections) does **not** use the thread pool. libuv uses epoll/kqueue/IOCP from the OS.

#### Deeper version
- You can change the size with the env variable **\`UV_THREADPOOL_SIZE\`** (for example 8 or 16). Set it **before the process starts** (for example \`UV_THREADPOOL_SIZE=8 node app.js\`), because the pool is created the first time it is used.
- If the pool is busy (say, many \`bcrypt\` hashes on signup), other pool users — even a simple \`fs.readFile\` or a DNS lookup for an HTTP call — **wait in line**. This shows up as random latency spikes.
- More threads is not always better: they compete for CPU cores. Measure.
- \`dns.resolve*\` functions use c-ares and the network, **not** the pool, unlike \`dns.lookup\`.
- Native addons (like \`bcrypt\`, \`sharp\`) can also queue work onto the pool.`,
      why: `It explains real production mysteries: "why do file reads get slow when many users log in?" — because password hashing filled the 4 pool threads. Knowing what uses the pool tells you when to raise \`UV_THREADPOOL_SIZE\` or move work to workers.`,
      analogy: `The main thread is a receptionist. For phone calls (network), the phone company handles waiting — no extra staff needed. For paperwork (files, hashing), the receptionist hands it to a back office with only 4 clerks. If 10 big hashing jobs arrive, the 5th paper waits until a clerk is free.`,
      code: [
        {
          title: 'See the 4-thread limit',
          lang: 'javascript',
          code: `import { pbkdf2 } from 'node:crypto';

const start = Date.now();
for (let i = 1; i <= 6; i++) {
  // Each hash is heavy and runs on a thread-pool thread
  pbkdf2('password', 'salt', 300_000, 64, 'sha512', () => {
    console.log('hash', i, 'done after', Date.now() - start, 'ms');
  });
}`,
        },
        {
          title: 'Run with a bigger pool',
          lang: 'bash',
          code: `node pool.mjs                       # 4 finish together, then 2 more later
UV_THREADPOOL_SIZE=6 node pool.mjs  # all 6 finish at about the same time (if you have 6+ cores)`,
        },
      ],
      output: `With the default pool, hashes 1-4 finish at about the same time (say ~400 ms), and hashes 5-6 finish roughly twice as late (~800 ms), because they had to wait for a free thread. The exact numbers depend on your CPU. With \`UV_THREADPOOL_SIZE=6\`, all six can run at once, if you have enough CPU cores.`,
      questions: [
        {
          q: 'What is libuv?',
          a: 'A cross-platform C library that gives Node its event loop, async I/O on top of the OS, and a thread pool for work the OS cannot do asynchronously.',
        },
        {
          q: 'Which operations use the libuv thread pool?',
          a: 'Most fs operations, dns.lookup, async crypto like pbkdf2/scrypt/randomBytes, and async zlib. Network sockets do not use it.',
        },
        {
          q: 'How do you change the thread pool size?',
          a: 'Set the `UV_THREADPOOL_SIZE` env variable when starting the process. Default is 4.',
        },
        {
          q: 'Is the thread pool the same as worker threads?',
          a: 'No. The libuv pool is internal and runs C/C++ tasks for Node APIs. Worker threads are separate JS threads you create yourself to run your own JavaScript.',
        },
      ],
      spoken: `"libuv is the C library that powers Node's event loop and async I/O. For network sockets it uses the operating system's async mechanisms, so no extra threads are needed. For things the OS can't do asynchronously — most file system calls, dns.lookup, heavy crypto like pbkdf2 and scrypt, and zlib — it uses a thread pool of four threads by default. If that pool is saturated, say by password hashing during a signup spike, even simple file reads and DNS lookups queue up. Then I'd raise UV_THREADPOOL_SIZE at startup or move the heavy work out."`,
      mistakes: [
        'Saying database queries or HTTP calls use the thread pool. They use OS-level async networking (only the DNS lookup part uses the pool).',
        'Setting `process.env.UV_THREADPOOL_SIZE` in code after the pool is already in use — it has no effect.',
        'Setting the pool to a huge number without measuring; threads compete for the same CPU cores.',
        'Follow-up trap: "If I set UV_THREADPOOL_SIZE=64, is my CPU-heavy JS faster?" No. The pool runs Node\'s internal C++ tasks, not your JavaScript. Your JS still runs on one thread — use worker threads for that.',
      ],
      takeaway: 'libuv = event loop + 4-thread pool for fs/dns.lookup/crypto/zlib; network I/O skips the pool.',
    },
    {
      id: 'buffers',
      title: 'Buffers',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A Buffer is a fixed-size chunk of raw bytes. Node uses it for files, network data, images and encodings like base64.',
      what: `A **Buffer** holds **raw binary data** — plain bytes (numbers from 0 to 255). JavaScript strings are text; Buffers are bytes.

Node gives you Buffers when you read files without an encoding, receive network data, or work with images, PDFs and hashes.

You can convert between text and bytes with an **encoding**: \`'utf8'\`, \`'base64'\`, \`'hex'\`, \`'latin1'\`.

#### Deeper version
- A Buffer is a subclass of \`Uint8Array\`. Its size is **fixed** once created.
- Buffer memory lives **outside the V8 heap** (it shows up as \`external\` / \`arrayBuffers\` in \`process.memoryUsage()\`), so big buffers do not count against \`--max-old-space-size\` in the same way.
- \`Buffer.alloc(n)\` gives zero-filled memory (safe). \`Buffer.allocUnsafe(n)\` is faster but may contain **old data from memory** — only use it if you overwrite every byte.
- \`new Buffer()\` is deprecated because of that security risk.
- **Length**: \`'é'.length\` is 1 but \`Buffer.byteLength('é')\` is 2 — UTF-8 characters can be several bytes. This matters for \`Content-Length\` headers.
- Joining chunks: \`Buffer.concat(chunks)\`. Never do \`str += chunk\` on binary data — a multi-byte character split across two chunks gets corrupted.
- \`buf.slice()\` / \`buf.subarray()\` share memory with the original; changing one changes the other.`,
      why: `Anything that is not plain text — uploads, S3 objects, Stripe webhook signature checks (which need the **raw** body bytes), image resizing, encryption — is handled with Buffers.`,
      analogy: `A string is a sentence you can read. A Buffer is the same sentence written as numbered beads on a string. Encoding is the key that tells you which beads mean which letters.`,
      code: [
        {
          title: 'Create, convert, measure',
          lang: 'javascript',
          code: `const buf = Buffer.from('Hi é', 'utf8');
console.log(buf);                       // <Buffer 48 69 20 c3 a9>
console.log(buf.length, 'Hi é'.length); // 5 4  -> bytes vs characters
console.log(buf.toString('base64'));    // SGkgw6k=
console.log(buf.toString('hex'));       // 486920c3a9

const decoded = Buffer.from('SGkgw6k=', 'base64').toString('utf8');
console.log(decoded);                   // Hi é

const safe = Buffer.alloc(4);           // <Buffer 00 00 00 00>
console.log(safe);`,
        },
        {
          title: 'Joining chunks the right way',
          lang: 'javascript',
          code: `const euro = Buffer.from('€');          // 3 bytes: e2 82 ac
const chunks = [euro.subarray(0, 2), euro.subarray(2)]; // split mid-character

const wrong = chunks.map((c) => c.toString()).join('');
const right = Buffer.concat(chunks).toString('utf8');

console.log(wrong); // garbage characters
console.log(right); // €`,
        },
      ],
      output: `"Hi é" is 4 characters but 5 bytes, because \`é\` takes 2 bytes in UTF-8. We can show the same bytes as base64 or hex and decode them back.

In the second example, converting each half of the euro sign separately produces broken replacement characters, while \`Buffer.concat\` first and decode once prints \`€\` correctly.`,
      questions: [
        {
          q: 'What is a Buffer in Node?',
          a: 'A fixed-size chunk of raw bytes, a subclass of Uint8Array, used for binary data like files, network packets and images.',
        },
        {
          q: 'Buffer.alloc vs Buffer.allocUnsafe?',
          a: '`alloc` zero-fills the memory, so it is safe. `allocUnsafe` is faster but may contain old data from memory; only use it when you will overwrite all bytes immediately.',
        },
        {
          q: 'Why does Stripe webhook verification need the raw body?',
          a: 'The signature is computed over the exact bytes sent. If a JSON parser changes the body (spacing, key order), the signature check fails. So you use `express.raw({ type: \'application/json\' })` on that route and pass the Buffer.',
        },
        {
          q: 'Where is Buffer memory stored?',
          a: 'Outside the V8 JS heap, in memory managed by Node. It appears as `external` and `arrayBuffers` in `process.memoryUsage()`.',
        },
      ],
      spoken: `"A Buffer is Node's way to handle raw bytes, like file contents, network data or images. It's a fixed-size Uint8Array, and I convert between bytes and text with encodings like utf8, base64 and hex. A few things I watch out for: string length isn't byte length, so I use Buffer.byteLength for headers; I join chunks with Buffer.concat before decoding so multi-byte characters don't break; and I use Buffer.alloc rather than allocUnsafe unless I fill it myself. A real example is Stripe webhooks — I keep the raw body Buffer to verify the signature."`,
      mistakes: [
        'Concatenating chunks as strings, which breaks multi-byte characters.',
        'Using `str.length` for `Content-Length` instead of `Buffer.byteLength(str)`.',
        'Parsing the Stripe webhook body with `express.json()` before signature verification, so verification always fails.',
        'Follow-up trap: "If I change a slice of a Buffer, does the original change?" Yes. `subarray`/`slice` share the same memory. Use `Buffer.from(buf)` to copy.',
      ],
      takeaway: 'Buffers are raw bytes outside the JS heap — concat before decoding and count bytes, not characters.',
    },
    {
      id: 'streams',
      title: 'Streams',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Streams process data piece by piece instead of all at once. Four types: Readable, Writable, Duplex, Transform.',
      what: `A **stream** moves data in small **chunks** over time, instead of loading everything into memory first.

Four types:
- **Readable** — you read from it: \`fs.createReadStream\`, an HTTP request (\`req\`), \`process.stdin\`.
- **Writable** — you write to it: \`fs.createWriteStream\`, an HTTP response (\`res\`), \`process.stdout\`.
- **Duplex** — both readable and writable, independent sides: a TCP socket.
- **Transform** — a duplex that changes data as it passes through: \`zlib.createGzip()\`, encryption, CSV parsing.

#### Deeper version
- Streams are **EventEmitters**. Readable emits \`'data'\`, \`'end'\`, \`'error'\`, \`'close'\`. Writable emits \`'drain'\`, \`'finish'\`, \`'error'\`.
- Readable streams have two modes: **paused** (you call \`read()\`) and **flowing** (\`'data'\` events, \`pipe\`, or \`for await\`).
- Each stream has a buffer limit called **\`highWaterMark\`** (16 KB for most byte streams, 64 KB for file read streams, 16 objects in **object mode**). It is a target, not a hard limit — it powers **backpressure** (see the next topic).
- **Object mode** streams pass JS objects instead of bytes — useful for processing DB rows (Mongoose \`cursor()\` returns a stream).
- Readable streams are **async iterable**: \`for await (const chunk of stream)\` is the simplest way to consume them.`,
      why: `Memory and speed. Sending a 2 GB video or exporting a million Mongo documents as CSV with \`readFile\` / \`find()\` loads everything into RAM and can crash the process. With streams, memory stays at a few KB/MB, and the user starts getting data immediately (lower time to first byte).`,
      analogy: `Downloading a whole movie before watching vs streaming it on Netflix. With streaming you start watching right away and your device only holds a few seconds of video at a time.`,
      code: [
        {
          title: 'Stream a file to an HTTP response',
          lang: 'javascript',
          code: `import http from 'node:http';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'video/mp4');
  try {
    // Memory stays small, no matter how big the file is
    await pipeline(createReadStream('./big-video.mp4'), res);
  } catch (err) {
    console.error('Stream failed:', err.message); // e.g. file missing or client left
  }
}).listen(3000);`,
        },
        {
          title: 'A custom Transform: uppercase text',
          lang: 'javascript',
          code: `import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase()); // push changed data
  },
});

// Type something and press Enter; Ctrl+D to end
await pipeline(process.stdin, upper, process.stdout);`,
        },
        {
          title: 'Export Mongo rows as a stream (object mode)',
          lang: 'javascript',
          code: `// Inside an Express route; Order is a Mongoose model
app.get('/orders.csv', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.write('id,total\\n');
  // cursor() gives an async-iterable stream of documents, not one big array
  for await (const order of Order.find().lean().cursor()) {
    const ok = res.write(order._id + ',' + order.total + '\\n');
    if (!ok) await new Promise((r) => res.once('drain', r)); // respect backpressure
  }
  res.end();
});`,
        },
      ],
      output: `The server streams the video in 64 KB chunks; memory usage stays roughly flat even for a multi-GB file. If the client closes the tab, \`pipeline\` rejects and cleans up the file stream.

The transform example echoes whatever you type in UPPERCASE.

The CSV route sends rows as it reads them from MongoDB, so a million orders do not need to fit in memory, and it pauses when the client is slower than the database.`,
      questions: [
        {
          q: 'What are streams and why use them?',
          a: 'Streams handle data in chunks over time. They keep memory low for big data and let you start sending output before all the input is ready.',
        },
        {
          q: 'What are the four types of streams?',
          a: 'Readable, Writable, Duplex (both, like a socket) and Transform (a duplex that modifies data, like gzip).',
        },
        {
          q: 'What is highWaterMark?',
          a: 'The buffer size threshold for a stream (16 KB default for most byte streams, 64 KB for fs read streams, 16 objects in object mode). When the buffer is above it, the stream signals the producer to slow down.',
        },
        {
          q: 'How would you export a million MongoDB documents as CSV?',
          a: 'Use a cursor stream (`Model.find().cursor()`), transform each doc into a CSV line, and pipe it into the response with `pipeline`, respecting backpressure — never load all documents into one array.',
        },
      ],
      spoken: `"Streams let me process data chunk by chunk instead of loading it all into memory. There are four types: readable, writable, duplex like sockets, and transform like gzip. In Node, the HTTP request is a readable stream and the response is a writable one. I use streams for file downloads, S3 uploads and downloads, and big exports — for example streaming a Mongo cursor out as CSV. I connect them with stream.pipeline from stream/promises, because it handles errors, cleanup, and backpressure, so memory stays flat even for gigabyte-sized data."`,
      mistakes: [
        'Using `readFile` or `Model.find()` on huge data and running out of memory.',
        'Forgetting `\'error\'` handlers on streams — an unhandled stream error crashes the process.',
        'Using `.pipe()` and assuming errors propagate. They do not; a failure in one stream leaves the others open (leaks). Use `pipeline`.',
        'Follow-up trap: "Is `res.write()` always safe to call in a loop?" No. It returns `false` when the buffer is full; you should wait for `\'drain\'` before writing more.',
      ],
      takeaway: 'Streams = small chunks over time; use them for anything big, and connect them with pipeline.',
    },
    {
      id: 'stream-pipeline-backpressure',
      title: 'Stream pipeline() and Backpressure',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Backpressure means slowing the fast producer when the consumer is slow. pipeline() handles it plus error propagation and cleanup.',
      what: `**Backpressure** happens when data comes in **faster** than it can go out. For example, reading a file from a fast SSD and uploading it to a slow client.

If you ignore it, the data piles up in memory until the process runs out of RAM.

Node handles it like this:
- \`writable.write(chunk)\` returns **\`false\`** when its internal buffer is above \`highWaterMark\`. That means "stop, I'm full".
- When the buffer empties, the writable emits **\`'drain'\`**. That means "OK, send more".

\`pipe()\` and \`pipeline()\` do this pausing and resuming for you.

#### Deeper version
**\`pipe()\` vs \`pipeline()\`:**
- \`a.pipe(b)\` handles backpressure but **does not forward errors**. If \`a\` fails, \`b\` is not closed; if \`b\` fails, \`a\` keeps reading. This leaks file descriptors and memory.
- \`stream.pipeline(a, b, c, cb)\` (or the promise version from \`node:stream/promises\`) handles backpressure, **forwards errors**, and **destroys all streams** on failure or completion. Always prefer it.

Extra details:
- \`pipeline\` accepts **async generator functions** as transform steps: \`async function* (source) { for await (const chunk of source) yield transformed; }\`.
- Pass an \`AbortSignal\` (\`{ signal }\` as the last argument in the promise version) to cancel a pipeline, for example on a timeout.
- \`stream.finished(stream)\` tells you when a single stream is fully done or has failed.`,
      why: `Without backpressure handling, a fast producer can blow up memory — a classic cause of out-of-memory crashes in file upload/download services and ETL jobs. Without proper error handling, failed streams leak file handles.`,
      analogy: `Filling buckets from a tap and passing them to a person who carries them away. If the carrier is slow and you keep filling, buckets pile up and flood the room. Backpressure is the carrier shouting "wait!" (write returns false) and later "ready!" (drain).`,
      code: [
        {
          title: 'Gzip a file with pipeline + async generator step',
          lang: 'javascript',
          code: `import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

try {
  await pipeline(
    createReadStream('access.log'),
    async function* (source) {
      // Transform step: mask email addresses in each chunk
      for await (const chunk of source) {
        yield chunk.toString().replace(/[\\w.]+@[\\w.]+/g, '***@***');
      }
    },
    createGzip(),
    createWriteStream('access.log.gz'),
  );
  console.log('Done');
} catch (err) {
  // Any stream failing lands here, and ALL streams are cleaned up
  console.error('Pipeline failed:', err.message);
}`,
        },
        {
          title: 'Manual backpressure with write() and drain',
          lang: 'javascript',
          code: `import { createWriteStream } from 'node:fs';
import { once } from 'node:events';

const out = createWriteStream('numbers.txt');
for (let i = 0; i < 1_000_000; i++) {
  if (!out.write(i + '\\n')) {
    await once(out, 'drain'); // pause until the buffer empties
  }
}
out.end();
await once(out, 'finish');
console.log('written');`,
        },
      ],
      output: `The first script reads the log, masks emails, gzips it and writes \`access.log.gz\`, printing \`Done\`. If \`access.log\` does not exist, you get \`Pipeline failed: ENOENT...\` and no half-open streams are left behind. (A simple per-chunk replace can miss an email split across two chunks — fine for a demo; real code would split by lines first.)

The second writes a million lines with steady memory. Without the \`drain\` check, the loop would queue all million writes in memory first, because the loop is much faster than the disk.`,
      questions: [
        {
          q: 'What is backpressure?',
          a: 'When a consumer is slower than the producer, data builds up in memory. Backpressure is the signal for the producer to pause: `write()` returns false, and `\'drain\'` says it can continue.',
        },
        {
          q: 'pipe() vs pipeline()?',
          a: 'Both handle backpressure. `pipeline()` also forwards errors from any stream and destroys all streams on error or completion. `pipe()` does not, so it can leak resources. Prefer `pipeline` (promise version from `node:stream/promises`).',
        },
        {
          q: 'What happens if you ignore the return value of write()?',
          a: 'Node keeps buffering the data in memory. It still works, but memory can grow without limit and crash the process for large data.',
        },
        {
          q: 'How do you cancel a pipeline?',
          a: 'Pass an AbortSignal: `await pipeline(a, b, { signal })`. Aborting destroys the streams and rejects with an AbortError.',
        },
      ],
      spoken: `"Backpressure is what happens when the producer is faster than the consumer — like reading from a fast disk and sending to a slow mobile client. Writable streams signal it: write returns false when the buffer is above the highWaterMark, and they emit drain when it's safe to continue. pipe handles that, but it doesn't propagate errors or clean up, so I always use stream.pipeline from stream/promises. It handles backpressure, forwards errors from any stage, destroys every stream on failure, and I can add async generator steps or an AbortSignal for timeouts."`,
      mistakes: [
        'Calling `write()` in a tight loop and ignoring its `false` return.',
        'Using `.pipe()` chains in production and leaking file descriptors when one stream fails.',
        'Wrapping `pipeline` in try/catch but forgetting to `await` it — the error escapes as an unhandled rejection.',
        'Follow-up trap: "Does highWaterMark hard-limit memory?" No. It is a threshold for the signal. If the producer ignores the signal, the buffer keeps growing.',
      ],
      takeaway: 'Respect write() returning false; use stream/promises pipeline for backpressure, errors and cleanup in one call.',
    },
    {
      id: 'error-handling',
      title: 'Error Handling in Node',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Handle errors where they happen: try/catch for sync and await, error-first callbacks, "error" events, plus one central handler — and separate operational from programmer errors.',
      what: `Errors in Node arrive in **four ways**, and each needs its own handling:
1. **Sync code** — \`throw\` → catch with \`try/catch\`.
2. **Promises / async-await** — rejection → \`try/catch\` around \`await\` or \`.catch()\`.
3. **Callbacks** — the \`err\` argument → check \`if (err)\`.
4. **EventEmitters / streams** — the \`'error'\` event → \`.on('error', ...)\`.

A \`try/catch\` **cannot** catch an error thrown later inside a callback, because by then the try block has already finished.

#### Deeper version
**Operational vs programmer errors** (an important idea):
- **Operational errors** are expected things going wrong in a correct program: DB down, timeout, invalid user input, 404. Handle them: retry, return a 4xx/5xx, log.
- **Programmer errors** are bugs: reading a property of \`undefined\`, wrong argument types. You cannot "handle" a bug safely — log it, and often let the process restart.

Good practice:
- Throw **\`Error\` objects** (or subclasses), never strings — you lose the stack trace.
- Create custom classes like \`NotFoundError\` with a \`statusCode\`.
- Use \`cause\` to wrap errors without losing the original: \`new Error('Payment failed', { cause: err })\` (Node 16.9+).
- In Express, one **central error middleware** \`(err, req, res, next)\` turns errors into responses. Express 4 does **not** catch rejected promises from async handlers by itself — you need a wrapper or \`express-async-errors\`; Express 5 forwards rejected promises to the error handler.`,
      why: `Unhandled errors crash the process or, worse, leave requests hanging. Consistent error handling gives users correct status codes, gives you useful logs, and avoids leaking stack traces to clients.`,
      analogy: `Operational errors are like a flat tyre — expected, you have a spare and a plan. Programmer errors are like the engine being installed backwards — you don't keep driving, you take the car back to the garage (restart).`,
      code: [
        {
          title: 'Custom errors + central Express handler',
          lang: 'javascript',
          code: `class AppError extends Error {
  constructor(message, statusCode = 500, options) {
    super(message, options);     // options can include { cause }
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
class NotFoundError extends AppError {
  constructor(what) { super(what + ' not found', 404); }
}

// Wrapper so rejected promises reach the error middleware (Express 4)
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));

// Central error handler: must have 4 arguments
app.use((err, req, res, next) => {
  const status = err.isOperational ? err.statusCode : 500;
  if (status >= 500) console.error(err); // log full details server-side only
  res.status(status).json({ error: err.isOperational ? err.message : 'Internal error' });
});`,
        },
        {
          title: 'Why try/catch misses callback errors',
          lang: 'javascript',
          code: `try {
  setTimeout(() => {
    throw new Error('boom'); // thrown later, outside the try block
  }, 0);
} catch (e) {
  console.log('never caught here');
}
// Result: the process crashes with an uncaught exception.
// Fix: catch inside the callback, or use promises + await.`,
        },
      ],
      output: `A request for a missing user returns \`404 {"error":"User not found"}\`. A real bug (like \`TypeError\`) returns \`500 {"error":"Internal error"}\` to the client, while the full stack trace is logged on the server.

The second snippet crashes: the \`throw\` happens in a later event loop turn, after the \`try/catch\` has finished.`,
      questions: [
        {
          q: 'What is the difference between operational and programmer errors?',
          a: 'Operational errors are expected runtime problems (network failure, bad input) that you handle. Programmer errors are bugs; you log them and usually let the process restart cleanly.',
        },
        {
          q: 'How do you handle errors in async Express routes?',
          a: 'Wrap handlers so rejections call `next(err)` (or use `express-async-errors`) in Express 4. Express 5 forwards rejected promises automatically. Then use one central 4-argument error middleware.',
        },
        {
          q: 'Why throw Error objects instead of strings?',
          a: 'Error objects carry a stack trace, a name and optional properties like `cause` and `code`. A thrown string has none of that, so debugging is much harder.',
        },
        {
          q: 'Can try/catch catch an error thrown in a setTimeout callback?',
          a: 'No. The callback runs later on a fresh call stack, after the try block finished. Handle it inside the callback or use promises with await.',
        },
      ],
      spoken: `"In Node, errors come through four channels — sync throws, promise rejections, error-first callbacks, and error events on emitters and streams — and each needs its own handling. I separate operational errors, like a timeout or invalid input, which I handle and turn into proper status codes, from programmer errors, which are bugs that I log and let the process restart. In Express I use custom error classes with a status code, an async wrapper so rejections reach next, and one central error middleware that logs details server-side and sends safe messages to the client."`,
      mistakes: [
        'Async Express 4 handlers without a wrapper: a rejected promise never reaches the error middleware, and the request hangs.',
        'Sending `err.stack` or raw DB errors to clients — it leaks internals.',
        'Swallowing errors with an empty `catch {}` — the bug disappears from logs but still happens.',
        'Follow-up trap: "Why does Express know the error middleware is special?" Because it has exactly four parameters `(err, req, res, next)`. Leave out `next` and Express treats it as a normal middleware.',
      ],
      takeaway: 'Catch errors in the channel they arrive on, handle operational errors, restart on bugs, and centralize the response.',
    },
    {
      id: 'unhandled-rejections-uncaught',
      title: 'Unhandled Rejections and Uncaught Exceptions',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Since Node 15, an unhandled promise rejection crashes the process. Use process handlers only to log and exit cleanly, not to keep running.',
      what: `- An **uncaught exception** is an error that was thrown and nobody caught it.
- An **unhandled rejection** is a promise that was rejected and nobody attached a \`.catch\` or \`await\`-ed it in a \`try\`.

Node gives you last-resort hooks:
- \`process.on('uncaughtException', handler)\`
- \`process.on('unhandledRejection', handler)\`

**Since Node 15**, the default for unhandled rejections is to **crash** the process (mode \`--unhandled-rejections=throw\`). Before that (Node 14 and older) Node only printed a warning — so upgrading old apps often surfaced hidden bugs.

#### Deeper version
After an \`uncaughtException\`, your app is in an **unknown state**: a DB transaction might be half done, a lock might be held, a request might never get a response. The Node docs say it is **not safe to resume** normal operation.

So the correct pattern is:
1. Log the error (with full stack) and send it to your error tracker (Sentry, Datadog).
2. Stop accepting new work and try a short graceful shutdown.
3. Exit with a non-zero code: \`process.exit(1)\`.
4. Let the process manager (PM2, Kubernetes, ECS, systemd) start a fresh process.

Other details:
- \`unhandledRejection\` fires when a rejected promise has no handler by the end of the microtask drain; if a handler is attached later, \`rejectionHandled\` fires.
- Setting an \`uncaughtException\` listener **replaces** the default crash — if you forget to exit, a broken process keeps serving traffic.
- \`process.on('exit')\` handlers can only run **synchronous** code.`,
      why: `Every Node service will hit an unexpected error at some point. The difference between "one failed request plus a clean restart" and "a zombie process serving corrupt data for hours" is how you set up these handlers.`,
      analogy: `A smoke alarm. Its job is not to put out the fire and let everyone keep working in a smoky room. Its job is to alert people (log) and get everyone out safely (graceful exit) so the building can be cleaned (restart).`,
      code: [
        {
          title: 'Last-resort handlers (log, then exit)',
          lang: 'javascript',
          code: `import http from 'node:http';

const server = http.createServer((req, res) => res.end('ok')).listen(3000);

function crash(kind, err) {
  console.error(kind, err);          // also send to Sentry/Datadog here
  server.close(() => process.exit(1)); // stop new connections, then exit
  setTimeout(() => process.exit(1), 5000).unref(); // force exit if close hangs
}

process.on('uncaughtException', (err) => crash('uncaughtException', err));
process.on('unhandledRejection', (reason) => crash('unhandledRejection', reason));

// Demo: a forgotten promise rejection
async function loadUser() { throw new Error('DB timeout'); }
loadUser(); // no await, no .catch -> unhandledRejection`,
        },
        {
          title: 'The real fix: never leave promises floating',
          lang: 'javascript',
          code: `async function loadUser() { throw new Error('DB timeout'); }

// Option 1: await inside try/catch
try {
  await loadUser();
} catch (err) {
  console.log('handled:', err.message);
}

// Option 2: fire-and-forget on purpose, but still attach a catch
loadUser().catch((err) => console.log('background job failed:', err.message));`,
        },
      ],
      output: `In the first script, \`loadUser()\` rejects with nobody listening, so the \`unhandledRejection\` handler logs "unhandledRejection Error: DB timeout", closes the server, and exits with code 1. A process manager would then start a new instance.

The second script prints \`handled: DB timeout\` and \`background job failed: DB timeout\`, with no crash.`,
      questions: [
        {
          q: 'What happens on an unhandled promise rejection in modern Node?',
          a: 'Since Node 15 the default is to throw it as an uncaught exception, which crashes the process (unless an `unhandledRejection` handler is registered).',
        },
        {
          q: 'Should you use process.on("uncaughtException") to keep the server running?',
          a: 'No. The process may be in a corrupted state. Use it to log and exit cleanly, and let a process manager restart it.',
        },
        {
          q: 'How do you avoid unhandled rejections?',
          a: 'Always `await` promises inside try/catch or attach `.catch()`, use `for...of` instead of async `forEach`, and use lint rules like `no-floating-promises` (typescript-eslint).',
        },
        {
          q: 'Why might upgrading from Node 14 to 16 or 18 cause new crashes?',
          a: 'Because unhandled rejections changed from a warning to a crash in Node 15. Hidden floating promises that only printed warnings before now kill the process.',
        },
      ],
      spoken: `"An uncaught exception is a thrown error nobody caught, and an unhandled rejection is a rejected promise nobody handled. Since Node 15, unhandled rejections crash the process by default, which is actually good — it surfaces bugs. I register process-level handlers only as a last resort: they log the error to our tracker, stop accepting traffic, and exit with code one, and then PM2 or Kubernetes restarts a clean process. I don't try to keep running after an uncaught exception, because state may be corrupted. The real fix is no floating promises, enforced with a lint rule."`,
      mistakes: [
        'Using `uncaughtException` to swallow errors and keep running.',
        'Adding an `uncaughtException` listener and forgetting `process.exit(1)`, which turns crashes into zombie processes.',
        'Doing async work inside `process.on(\'exit\')` — it never completes.',
        'Follow-up trap: "Is an unhandled rejection always a bug?" Almost always. Even intentional fire-and-forget calls should end with `.catch()` that logs.',
      ],
      takeaway: 'Process-level handlers are smoke alarms: log, shut down cleanly, exit(1), and let the supervisor restart.',
    },
    {
      id: 'child-processes',
      title: 'Child Processes (spawn, exec, execFile, fork)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'child_process runs other programs as separate OS processes: spawn streams output, exec buffers it through a shell, execFile skips the shell, fork runs Node with an IPC channel.',
      what: `The \`child_process\` module lets Node start **another program** as a separate operating-system process — for example \`ffmpeg\`, \`git\`, a Python script, or another Node script.

Four main functions:
- **spawn(cmd, args)** — starts the program and gives you **streams** for stdout/stderr. Best for long-running or big output.
- **exec(commandString)** — runs the command **in a shell** and gives you the whole output at the end (buffered, with a size limit called \`maxBuffer\`).
- **execFile(file, args)** — like exec but **without a shell**: safer and slightly faster.
- **fork(modulePath)** — special spawn for **Node scripts**, with a built-in message channel (\`process.send\` / \`'message'\`).

#### Deeper version
- A child process has its **own memory and its own event loop**. It is fully isolated: if it crashes, your server survives.
- It is heavier than a worker thread (a new Node process takes tens of MB and some startup time).
- **Command injection**: \`exec('convert ' + userFileName)\` runs through a shell, so a filename like \`a.png; rm -rf /\` is dangerous. Use \`spawn\`/\`execFile\` with an **args array** and never use \`shell: true\` with user input.
- Each has a \`*Sync\` version (\`execSync\`) — blocks the event loop; only for scripts/CLIs.
- Always handle \`'error'\` (program not found) and \`'close'\`/\`'exit'\` (exit code). Kill children on shutdown so they don't become orphans.`,
      why: `Sometimes the best tool is not JavaScript: \`ffmpeg\` for video, \`ImageMagick\`, \`pdftk\`, a Python ML script, or a git command in a deployment tool. Child processes also isolate risky or crash-prone work.`,
      analogy: `Your office hires a contractor. The contractor works in their own building (separate process, separate memory). You talk to them by phone (stdin/stdout or IPC messages). If their building burns down, your office is fine.`,
      code: [
        {
          title: 'spawn with streaming output (safe args array)',
          lang: 'javascript',
          code: `import { spawn } from 'node:child_process';

const child = spawn('ls', ['-la', '/tmp']); // no shell, args are not interpreted

child.stdout.on('data', (chunk) => process.stdout.write(chunk));
child.stderr.on('data', (chunk) => process.stderr.write(chunk));
child.on('error', (err) => console.error('Failed to start:', err.message));
child.on('close', (code) => console.log('exited with code', code));`,
        },
        {
          title: 'execFile with promises',
          lang: 'javascript',
          code: `import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const { stdout } = await execFileAsync('node', ['--version']);
console.log('Node version:', stdout.trim()); // e.g. v18.19.0`,
        },
        {
          title: 'fork with IPC messages',
          lang: 'javascript',
          code: `// parent.mjs
import { fork } from 'node:child_process';
const child = fork('./child.mjs');
child.on('message', (msg) => { console.log('parent got:', msg); child.kill(); });
child.send({ n: 40 });

// child.mjs
process.on('message', ({ n }) => {
  const fib = (x) => (x < 2 ? x : fib(x - 1) + fib(x - 2));
  process.send({ n, result: fib(n) }); // heavy work off the parent process
});`,
        },
      ],
      output: `The spawn example prints the directory listing as it arrives, then \`exited with code 0\`. The execFile example prints the Node version. The fork example prints \`parent got: { n: 40, result: 102334155 }\` after the child computes it, while the parent's event loop stayed free.`,
      questions: [
        {
          q: 'spawn vs exec?',
          a: '`spawn` streams output and does not use a shell by default — good for big or long output. `exec` runs in a shell and buffers all output into a string, with a `maxBuffer` limit — fine for small commands.',
        },
        {
          q: 'What is fork used for?',
          a: 'Starting another Node.js script as a child process with a built-in IPC channel, so parent and child can exchange messages with `send` and `on(\'message\')`.',
        },
        {
          q: 'How do you avoid command injection?',
          a: 'Never build shell strings from user input. Use `execFile` or `spawn` with an arguments array and no shell, and validate inputs.',
        },
        {
          q: 'Child process vs worker thread?',
          a: 'A child process is a separate OS process with its own memory — heavier but fully isolated, can run any program. A worker thread is a JS thread inside the same process — lighter, can share memory, but only runs JavaScript.',
        },
      ],
      spoken: `"The child_process module lets Node run other programs as separate OS processes. I use spawn when I want streaming output, like piping ffmpeg output, execFile for small commands without a shell, exec only for trusted shell commands, and fork for running another Node script with an IPC channel. Since a child is a separate process, it's isolated — if it crashes my API keeps running. The big security point is command injection: I never concatenate user input into exec strings; I pass arguments as an array to spawn or execFile."`,
      mistakes: [
        'Building `exec` commands from user input — command injection.',
        'Using `exec` for commands with large output and hitting `maxBuffer exceeded`.',
        'Not listening for the `\'error\'` event — if the binary is missing, the process crashes.',
        'Follow-up trap: "Does a forked child share variables with the parent?" No. It is a separate process with separate memory. You can only exchange serialized messages.',
      ],
      takeaway: 'Use spawn/execFile with argument arrays, fork for Node-to-Node work, and treat children as isolated processes.',
    },
    {
      id: 'cluster-worker-threads',
      title: 'Cluster vs Worker Threads',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Cluster runs several Node processes sharing one port to use all CPU cores for requests; worker threads run CPU-heavy JS in parallel inside one process.',
      what: `One Node process uses **one CPU core** for your JavaScript. Two ways to use more:

- **Cluster** (\`node:cluster\`) — a **primary** process starts several **worker processes** (usually one per core). They all **share the same server port**, and incoming connections are spread between them. Each worker is a full copy of your app with its own memory. Use it to **scale an HTTP server** on one machine.
- **Worker threads** (\`node:worker_threads\`) — extra **threads inside one process**, each with its own V8 instance and event loop. Use them for **CPU-heavy tasks** (image processing, PDF generation, big calculations) so the main thread stays free.

#### Deeper version
**Cluster:**
- On Linux/macOS the primary accepts connections and hands them to workers **round-robin** by default (Windows differs).
- Workers **share nothing**: in-memory sessions, caches, rate-limit counters and WebSocket rooms are per worker. Use Redis or another shared store.
- Restart workers when they die: listen to \`cluster.on('exit')\`.
- \`cluster.isPrimary\` replaced \`isMaster\` (Node 16+).
- In Docker/Kubernetes, people often skip cluster and run **one process per container** with more replicas — simpler scaling and health checks.

**Worker threads:**
- Communicate with \`postMessage\` (data is **copied** with the structured clone algorithm), or share memory with \`SharedArrayBuffer\` + \`Atomics\`, or **transfer** an \`ArrayBuffer\` (moved, not copied).
- Starting a worker costs time and memory (~ms and some MB), so for many small jobs use a **pool** (like \`piscina\`).
- Workers do **not** help with I/O-bound work — the event loop already handles that well.`,
      why: `Interviewers ask "how do you use all cores?" and "how do you handle CPU-heavy work?". Mixing them up is a classic red flag: cluster is for **throughput of requests**, worker threads are for **one heavy computation** not blocking the server.`,
      analogy: `Cluster is opening 4 identical branches of a shop on the same street, all using one big sign (port); a manager at the door sends customers to whichever branch is next. Worker threads are hiring a back-room assistant in one shop to do the heavy packing while the cashier keeps serving.`,
      code: [
        {
          title: 'Cluster: one worker per CPU core',
          lang: 'javascript',
          code: `import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';

if (cluster.isPrimary) {
  const cores = os.cpus().length;
  console.log('Primary', process.pid, 'starting', cores, 'workers');
  for (let i = 0; i < cores; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    console.log('Worker', worker.process.pid, 'died with', code, '- restarting');
    cluster.fork();
  });
} else {
  // Every worker runs this; they all share port 3000
  http.createServer((req, res) => res.end('Handled by ' + process.pid)).listen(3000);
}`,
        },
        {
          title: 'Worker thread for CPU-heavy work (single file)',
          lang: 'javascript',
          code: `import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

if (isMainThread) {
  // Main thread: start a worker running this same file
  const worker = new Worker(new URL(import.meta.url), { workerData: 40 });
  worker.on('message', (result) => console.log('fib(40) =', result));
  worker.on('error', (err) => console.error('Worker failed:', err));
  console.log('Main thread is still free...');
} else {
  // Worker thread: do the heavy work and send the result back
  parentPort.postMessage(fib(workerData));
}`,
        },
      ],
      output: `The cluster script prints one "starting N workers" line. Refreshing \`localhost:3000\` shows different PIDs as connections are spread across workers. If you kill a worker, the primary logs it and starts a new one.

The worker script prints \`Main thread is still free...\` immediately, then \`fib(40) = 102334155\` about a second later. The main event loop was never blocked.`,
      questions: [
        {
          q: 'What is the difference between cluster and worker threads?',
          a: 'Cluster creates separate processes that share a server port, to handle more requests across CPU cores. Worker threads are threads inside one process, used to run CPU-heavy JavaScript without blocking the main event loop.',
        },
        {
          q: 'Do cluster workers share memory?',
          a: 'No. Each is a separate process with its own memory. Shared state like sessions, caches and rate limits must live in Redis or a database.',
        },
        {
          q: 'How do worker threads communicate?',
          a: 'With `postMessage` (data is copied via structured clone), by transferring ArrayBuffers, or by sharing memory with `SharedArrayBuffer` and `Atomics`.',
        },
        {
          q: 'Would you use cluster inside Kubernetes?',
          a: 'Usually not. One process per container with horizontal pod scaling is simpler, and the orchestrator handles restarts and load balancing. Cluster or PM2 cluster mode makes more sense on a VM.',
        },
        {
          q: 'Do worker threads make database calls faster?',
          a: 'No. DB calls are I/O-bound and already non-blocking. Worker threads only help CPU-bound work.',
        },
      ],
      spoken: `"A single Node process runs my JavaScript on one core. To use all cores for an HTTP server on one machine, I can use the cluster module or PM2's cluster mode: a primary forks one worker process per core and they share the same port. Workers don't share memory, so sessions and caches go to Redis. Worker threads are different — they run CPU-heavy JavaScript, like PDF generation or image processing, in parallel inside the same process so the main event loop stays responsive. In containers I usually prefer one process per pod and scale replicas instead of using cluster."`,
      mistakes: [
        'Using worker threads to "speed up" I/O-bound code like DB queries.',
        'Storing sessions or rate limits in process memory with cluster — each worker has its own copy, so behaviour is inconsistent.',
        'Creating a new Worker per request instead of using a pool — startup cost kills the benefit.',
        'Follow-up trap: "Can cluster workers share a WebSocket room?" Not by default. You need sticky sessions and a pub/sub adapter (like the Socket.IO Redis adapter).',
      ],
      takeaway: 'Cluster = more processes for more requests; worker threads = offload CPU work; neither shares memory by default.',
    },
    {
      id: 'crypto-module',
      title: 'The crypto Module',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Built-in crypto for random IDs and tokens, hashing, HMAC signatures (webhooks), password hashing (scrypt) and encryption (AES-GCM).',
      what: `\`node:crypto\` gives you security tools built on OpenSSL:

- **Random values**: \`randomUUID()\` for IDs, \`randomBytes(32)\` for tokens (password reset links, API keys).
- **Hashing**: \`createHash('sha256')\` — a one-way fingerprint of data. Same input always gives the same output; you cannot reverse it.
- **HMAC**: \`createHmac('sha256', secret)\` — a hash mixed with a secret key. Used to **sign** and **verify** data, like webhooks from Stripe or GitHub.
- **Password hashing**: \`scrypt\` / \`pbkdf2\` — deliberately **slow** hashes with a **salt** (random extra data), so stolen hashes are hard to crack. (Many teams use \`bcrypt\` or \`argon2\` packages instead.)
- **Encryption**: \`createCipheriv('aes-256-gcm', key, iv)\` — two-way: you can decrypt with the key.

#### Deeper version
- **Hashing ≠ encryption.** Hashing is one-way (passwords, integrity checks). Encryption is two-way (data you must read later, like a stored third-party API token).
- Never use plain \`sha256\` or \`md5\` for passwords — they are too **fast**, so attackers can try billions of guesses per second.
- Compare secrets with **\`timingSafeEqual\`**, not \`===\`. \`===\` stops at the first different byte, and the time difference can leak information (a timing attack).
- AES-GCM needs a **unique IV** (nonce) for every encryption with the same key, and gives an **auth tag** that detects tampering.
- \`Math.random()\` is **not** secure. Use \`crypto.randomBytes\` / \`randomInt\` / \`randomUUID\`.
- The async versions of \`pbkdf2\`, \`scrypt\` and \`randomBytes\` use the libuv thread pool; the \`*Sync\` versions block the event loop.
- Node 17+ uses **OpenSSL 3**, which disabled some old algorithms by default (see the Node 16→18 migration topic).`,
      why: `Every backend needs secure tokens, password storage and webhook verification. Doing it wrong (Math.random tokens, sha256 passwords, \`===\` signature checks) causes real security holes.`,
      analogy: `A hash is a fingerprint — it identifies a person but you can't rebuild the person from it. HMAC is a wax seal only the king has — anyone can see the seal, but only the king could make it. Encryption is a locked box — anyone with the key can open it.`,
      code: [
        {
          title: 'IDs, tokens, hashes and webhook signatures',
          lang: 'javascript',
          code: `import { randomUUID, randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto';

console.log(randomUUID());                     // e.g. '3b241101-e2bb-4255-8caf-4136c566a962'
const resetToken = randomBytes(32).toString('hex'); // 64 hex chars, safe for links
// Store only the hash of the token in the DB, so a DB leak does not leak tokens
const tokenHash = createHash('sha256').update(resetToken).digest('hex');
console.log(tokenHash.length);                 // 64

// Verify a webhook signature (generic HMAC-SHA256 pattern)
function verifySignature(rawBody, signatureHex, secret) {
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const given = Buffer.from(signatureHex, 'hex');
  // timingSafeEqual throws if lengths differ, so check first
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const body = Buffer.from('{"event":"paid"}');
const sig = createHmac('sha256', 'whsec_demo').update(body).digest('hex');
console.log(verifySignature(body, sig, 'whsec_demo'));   // true
console.log(verifySignature(body, sig, 'wrong_secret')); // false`,
        },
        {
          title: 'Encrypt and decrypt with AES-256-GCM',
          lang: 'javascript',
          code: `import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const key = randomBytes(32); // in real apps: load a 32-byte key from a secret manager

function encrypt(text) {
  const iv = randomBytes(12);                       // new IV every time
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();                  // 16 bytes, detects tampering
  return Buffer.concat([iv, tag, data]).toString('base64');
}

function decrypt(payload) {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

const secret = encrypt('sk_live_customer_api_key');
console.log(secret);          // random-looking base64, different every run
console.log(decrypt(secret)); // sk_live_customer_api_key`,
        },
      ],
      output: `The first script prints a UUID, the hash length \`64\`, then \`true\` for the correct secret and \`false\` for the wrong one.

The second prints a base64 string that changes every run (because the IV is random), and then decrypts it back to the original text. If anyone changes even one byte of the payload, \`decipher.final()\` throws, thanks to the GCM auth tag.

For Stripe specifically, use the official \`stripe.webhooks.constructEvent(rawBody, signature, secret)\`, which also checks the timestamp; the code above shows the general idea.`,
      questions: [
        {
          q: 'What is the difference between hashing and encryption?',
          a: 'Hashing is one-way: you cannot get the original back (used for passwords and integrity). Encryption is two-way: with the key you can decrypt (used for data you need to read later).',
        },
        {
          q: 'How should you store passwords?',
          a: 'With a slow, salted password hash: bcrypt, argon2, or scrypt/pbkdf2 with good parameters. Never plain text, never fast hashes like md5 or sha256 alone.',
        },
        {
          q: 'What is an HMAC and where do you use it?',
          a: 'A hash combined with a secret key. It proves the data came from someone who knows the secret and was not changed. Used for webhook signatures (Stripe, GitHub) and signed tokens.',
        },
        {
          q: 'Why use timingSafeEqual?',
          a: 'Normal comparison stops at the first different character, so response time leaks how much of a guess was right. `timingSafeEqual` always takes the same time.',
        },
      ],
      spoken: `"I use Node's crypto module for a few things. randomUUID and randomBytes for IDs and tokens — never Math.random. For passwords I use a slow salted hash like bcrypt, argon2 or scrypt, never plain sha256. For webhooks I verify an HMAC-SHA256 signature over the raw request body and compare with timingSafeEqual to avoid timing attacks — for Stripe I use their constructEvent helper. And when I need to store something I must read back later, like a customer's third-party API key, I encrypt it with AES-256-GCM, with a fresh IV each time and the key in a secret manager."`,
      mistakes: [
        'Using `Math.random()` for tokens or reset links — it is predictable.',
        'Hashing passwords with `sha256` or `md5` — far too fast to resist brute force.',
        'Re-using the same IV with the same key in AES-GCM — this breaks its security.',
        'Follow-up trap: "Why store a hash of the reset token instead of the token?" If the database leaks, attackers cannot use hashed tokens to reset passwords.',
      ],
      takeaway: 'Random = randomBytes/randomUUID, passwords = slow salted hash, signatures = HMAC + timingSafeEqual, secrets you must read = AES-GCM.',
    },
    {
      id: 'testing-node',
      title: 'Testing Node APIs (node:test, Jest/Vitest, Supertest)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Unit-test pure logic, integration-test routes with Supertest against a real or in-memory DB, and mock only external services like Stripe or OpenAI.',
      what: `Testing a Node backend usually has three layers:
- **Unit tests** — test one function with no DB or network (price calculation, validation).
- **Integration tests** — test a route end to end: HTTP request in, JSON out, real (test) database in between. **Supertest** sends requests to your Express app without opening a real port.
- **End-to-end tests** — the whole system, often fewer and slower.

Test runners: **Jest** and **Vitest** are the popular choices. Node also has a **built-in runner**, \`node:test\` with \`node --test\` — added as experimental in Node 18 and marked stable in Node 20.

#### Deeper version
- Export the Express \`app\` separately from \`app.listen()\`, so tests can import the app without starting a server.
- For MongoDB, use a separate test database, or \`mongodb-memory-server\` for a fast throwaway instance. Clean collections between tests.
- **Mock external services** (Stripe, OpenAI, S3, email) — tests must not call real paid APIs. Tools: Jest mocks, \`nock\` or \`msw\` for HTTP, or dependency injection.
- Test the **unhappy paths**: invalid input (400), missing auth (401), not found (404), and external failure (502/503).
- Run tests in CI on every pull request, ideally on the Node versions you support (a CI matrix).`,
      why: `Tests are your safety net for refactors and upgrades — like moving from Node 16 to 18 or bumping a major version of Mongoose. Without them, every upgrade is a gamble.`,
      analogy: `Unit tests check each car part on the bench. Integration tests start the engine with the parts connected. E2E tests take the car for a drive. You need mostly bench and engine tests, and a few test drives.`,
      code: [
        {
          title: 'Built-in node:test (unit test)',
          lang: 'javascript',
          code: `// price.test.mjs  -> run with: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';

function totalWithTax(amount, rate) {
  if (amount < 0) throw new RangeError('amount must be >= 0');
  return Math.round(amount * (1 + rate) * 100) / 100;
}

test('adds tax and rounds to 2 decimals', () => {
  assert.equal(totalWithTax(100, 0.18), 118);
  assert.equal(totalWithTax(9.99, 0.05), 10.49);
});

test('rejects negative amounts', () => {
  assert.throws(() => totalWithTax(-1, 0.1), RangeError);
});`,
        },
        {
          title: 'Route integration test with Supertest (Jest/Vitest style)',
          lang: 'javascript',
          code: `// app.js exports the Express app WITHOUT calling listen()
import request from 'supertest';
import { app } from '../src/app.js';

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 for unknown routes', async () => {
    await request(app).get('/nope').expect(404);
  });
});`,
        },
      ],
      output: `\`node --test\` finds files matching test naming patterns (like \`*.test.mjs\`), runs them, and prints a pass/fail report (TAP or spec format depending on version). Both tests pass.

The Supertest file calls the app in memory; it checks the status and body without opening a port. If someone breaks the health route, CI fails before the change reaches production.`,
      questions: [
        {
          q: 'How do you test an Express API?',
          a: 'Export the app separately from `listen()`, use Supertest to send requests in tests, use a test database (or mongodb-memory-server), and mock external services like Stripe and email.',
        },
        {
          q: 'Unit vs integration tests?',
          a: 'Unit tests check one piece of logic in isolation and are fast. Integration tests check several parts working together, like route + validation + database.',
        },
        {
          q: 'Does Node have a built-in test runner?',
          a: 'Yes, `node:test` with `node --test`. It was experimental in Node 18 and became stable in Node 20. Many teams still use Jest or Vitest for richer mocking and watch mode.',
        },
        {
          q: 'How do you avoid calling real Stripe or OpenAI in tests?',
          a: 'Mock the client module or intercept HTTP with nock/msw, or inject the client as a dependency so tests pass a fake. Use Stripe test mode keys only for manual or dedicated sandbox tests.',
        },
      ],
      spoken: `"For Node APIs I write fast unit tests for pure logic and integration tests for routes. I export the Express app separately from listen, and use Supertest to hit routes in memory, with a test MongoDB — often mongodb-memory-server — cleaned between tests. External services like Stripe, OpenAI and email are always mocked. I make sure error paths are covered: validation errors, auth failures and third-party timeouts. These tests run in CI on every PR, and during our Node upgrade the same suite ran on both the old and new Node versions."`,
      mistakes: [
        'Calling `app.listen()` in the same file the tests import, causing "port already in use" and hanging tests.',
        'Tests that depend on each other\'s data or run order.',
        'Hitting real third-party APIs in CI — slow, flaky and sometimes costly.',
        'Follow-up trap: "Is node:test production-ready in Node 18?" It exists in Node 18 but was marked experimental there; it became stable in Node 20.',
      ],
      takeaway: 'Unit-test logic, Supertest the routes against a test DB, mock third parties, and run it all in CI.',
    },
    {
      id: 'node-security',
      title: 'Node.js Security Basics',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Validate all input, prevent NoSQL/command injection, set security headers, rate limit, keep secrets out of code, audit dependencies, and avoid ReDoS and prototype pollution.',
      what: `Most Node security problems come from **trusting input** or **trusting dependencies**.

Key practices:
- **Validate input** at the edge (zod, joi, express-validator). Check types, lengths and allowed values.
- **Injection**: never build queries, shell commands or HTML by joining raw user strings.
- **Security headers** with \`helmet\` (Express), **CORS** limited to your domains.
- **Rate limiting** on login, OTP and expensive routes.
- **Secrets** in env variables / secret managers, never in git or logs.
- **Dependencies**: \`npm audit\`, Dependabot/Renovate, commit the lock file.
- Run the app as a **non-root** user in Docker.

#### Deeper version
- **NoSQL injection (MongoDB)**: if \`req.body.password\` is the object \`{ "$ne": null }\` instead of a string, \`User.findOne({ email, password })\` can match any user. Fix: validate that fields are strings, and/or use a sanitizer that strips \`$\` keys. (Mongoose \`sanitizeFilter\` exists as an option — check your version's docs.)
- **ReDoS**: some regexes, like \`/(a+)+$/\`, take exponential time on crafted input and block the single thread. Avoid nested quantifiers on user input, and limit input length.
- **Prototype pollution**: deep-merging user JSON like \`{"__proto__": {"isAdmin": true}}\` can add properties to **every** object. Use safe merge libraries, \`Object.create(null)\` for maps, or reject \`__proto__\`/\`constructor\` keys.
- **Path traversal**: \`../../\` in file names — resolve the path and check it stays inside your folder.
- **SSRF** (Server-Side Request Forgery): if your server fetches user-given URLs (link previews, AI tools fetching pages), block internal IPs like \`169.254.169.254\` (cloud metadata).
- **Body size limits** (\`express.json({ limit: '100kb' })\`) to stop memory exhaustion.`,
      why: `Node servers are often directly on the internet and handle payments and personal data. A single injection or leaked key can expose every customer. Interviewers expect senior-ish engineers to name concrete risks, not just "use HTTPS".`,
      analogy: `Your API is a building. Input validation is the security desk checking IDs. Rate limiting is a turnstile. Helmet is locking the windows. Dependency audits are checking that the contractors you hired are not secretly bad actors.`,
      code: [
        {
          title: 'NoSQL injection and the fix',
          lang: 'javascript',
          code: `import { z } from 'zod';

// Attack body: { "email": "admin@site.com", "password": { "$ne": null } }

// BAD: passes an object straight into a Mongo query
// const user = await User.findOne({ email: req.body.email, password: req.body.password });

// GOOD: validate shape and types first (and compare hashed passwords, not raw ones)
const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
});

app.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, password } = parsed.data; // now guaranteed strings
  const user = await User.findOne({ email });
  const ok = user && (await verifyPassword(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ ok: true });
});`,
        },
        {
          title: 'Baseline Express hardening',
          lang: 'javascript',
          code: `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
app.disable('x-powered-by');                       // do not advertise Express
app.use(helmet());                                 // security headers
app.use(cors({ origin: ['https://app.example.com'] }));
app.use(express.json({ limit: '100kb' }));         // cap body size
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 })); // brute-force guard`,
        },
      ],
      output: `With validation, the attack body fails because \`password\` is an object, not a string, and the API returns \`400 Invalid input\`. Without it, \`{ "$ne": null }\` means "password is not null", which matches the admin's record.

The hardening snippet adds headers like \`Content-Security-Policy\` and \`X-Content-Type-Options\`, restricts CORS to your frontend, rejects bodies over 100 KB, and limits auth routes to 20 requests per 15 minutes per IP. (The rate-limit option name has changed across express-rate-limit versions — older versions use \`max\`.)`,
      questions: [
        {
          q: 'What is NoSQL injection and how do you prevent it?',
          a: 'Sending objects with Mongo operators (like `{ "$ne": null }`) where the server expects strings, so the query matches more than intended. Prevent it by validating types with a schema and stripping `$` keys from input.',
        },
        {
          q: 'What is ReDoS?',
          a: 'Regular expression Denial of Service: a badly written regex takes exponential time on crafted input, blocking Node\'s single thread. Avoid nested quantifiers, limit input length, and test regexes.',
        },
        {
          q: 'What is prototype pollution?',
          a: 'An attacker injects `__proto__` or `constructor.prototype` keys through merged JSON, adding properties to all objects. Prevent it with safe merge functions, input validation, and objects without prototypes for maps.',
        },
        {
          q: 'How do you secure dependencies?',
          a: 'Commit lock files, run `npm audit` and Dependabot/Renovate in CI, review new packages before adding them, use `npm ci`, and limit install scripts where possible.',
        },
      ],
      spoken: `"For Node security I start with input validation using zod at every route, because that blocks a lot — including MongoDB operator injection, where someone sends an object like dollar-ne null instead of a password string. I add helmet, strict CORS, body size limits and rate limiting on auth routes. I keep secrets in a secret manager, never in code or logs. Node-specific risks I watch for are ReDoS, since one bad regex blocks the single thread, prototype pollution from deep merges, and command injection with child_process. And dependencies get npm audit and Dependabot in CI."`,
      mistakes: [
        'Passing `req.body` or `req.query` fields straight into Mongo queries without type checks.',
        'Running regexes written by hand on unbounded user input.',
        'Logging full request bodies, which leaks passwords, tokens and card data into logs.',
        'Follow-up trap: "Does using an ORM/ODM like Mongoose make you safe from injection?" Not fully. Operator injection still works if you pass user objects into filters. Validate types.',
      ],
      takeaway: 'Never trust input or dependencies: validate types, limit size and rate, harden headers, and audit packages.',
    },
    {
      id: 'pm2',
      title: 'PM2 (Process Manager)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'PM2 keeps Node apps alive on a server: auto-restart on crash, cluster mode across cores, zero-downtime reload, logs, and start on boot.',
      what: `**PM2** is a popular **process manager** for Node. On a plain server (EC2, a VM), you don't want to run \`node server.js\` in a terminal — if it crashes or the server reboots, your app is gone.

PM2 gives you:
- **Auto-restart** on crash.
- **Cluster mode** — run one instance per CPU core sharing one port (it uses Node's cluster module).
- **Zero-downtime reload** — \`pm2 reload\` restarts instances one by one.
- **Logs** — \`pm2 logs\`, with log files per app.
- **Monitoring** — \`pm2 monit\`, \`pm2 list\`.
- **Startup on boot** — \`pm2 startup\` + \`pm2 save\`.

#### Deeper version
- Config lives in an **ecosystem file** (\`ecosystem.config.js\`, or \`.cjs\` in an ESM project) with env variables per environment.
- \`max_memory_restart\` restarts an instance if it grows past a limit — a safety net for slow leaks, **not** a fix.
- For truly graceful reloads: set \`wait_ready: true\` and call \`process.send('ready')\` after your DB connects, and handle **SIGINT** (PM2's default stop signal) to close the server; \`kill_timeout\` controls how long PM2 waits before force-killing.
- **In Docker/Kubernetes** you usually don't need PM2: the orchestrator restarts containers and scales replicas. If you do use it in a container, use \`pm2-runtime\` so it stays in the foreground.
- Alternatives: systemd, Docker restart policies, ECS, Kubernetes.`,
      why: `On VM-based deployments PM2 is the simplest way to get reliability (restarts), use all CPU cores, and deploy without downtime. It's very common in Indian startups and mid-size companies running Node on EC2.`,
      analogy: `PM2 is a shift supervisor at a factory. If a worker faints (crash), the supervisor immediately brings a replacement. During a change of uniform (deploy), he swaps workers one at a time so the line never stops.`,
      code: [
        {
          title: 'ecosystem.config.cjs',
          lang: 'javascript',
          code: `module.exports = {
  apps: [
    {
      name: 'orders-api',
      script: './src/server.js',
      exec_mode: 'cluster',       // use Node cluster under the hood
      instances: 'max',           // one per CPU core
      max_memory_restart: '500M', // safety net for slow leaks
      wait_ready: true,           // wait for process.send('ready')
      listen_timeout: 10000,      // ms to wait for 'ready'
      kill_timeout: 10000,        // ms to wait for graceful stop before SIGKILL
      env: { NODE_ENV: 'development', PORT: 3000 },
      env_production: { NODE_ENV: 'production', PORT: 8080 },
    },
  ],
};`,
        },
        {
          title: 'Everyday PM2 commands',
          lang: 'bash',
          code: `pm2 start ecosystem.config.cjs --env production
pm2 list                 # status, CPU, memory per instance
pm2 logs orders-api      # tail logs
pm2 reload orders-api    # zero-downtime restart (cluster mode)
pm2 monit                # live dashboard
pm2 startup && pm2 save  # start on boot with the current process list`,
        },
        {
          title: 'App side: signal ready and stop gracefully',
          lang: 'javascript',
          code: `const server = app.listen(process.env.PORT, async () => {
  await connectToMongo();
  if (process.send) process.send('ready'); // tell PM2 this instance is ready
});

process.on('SIGINT', () => {               // PM2 sends SIGINT on stop/reload
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
});`,
        },
      ],
      output: `\`pm2 start\` launches one instance per core in production mode. \`pm2 reload\` starts a new instance, waits for its \`ready\` signal, then stops an old one, one at a time — users never see downtime. If any instance crashes or crosses 500 MB, PM2 restarts it automatically.`,
      questions: [
        {
          q: 'What is PM2 and why use it?',
          a: 'A production process manager for Node. It restarts crashed apps, runs cluster mode across CPU cores, does zero-downtime reloads, manages logs, and restarts apps on server reboot.',
        },
        {
          q: 'pm2 restart vs pm2 reload?',
          a: '`restart` kills and restarts all instances at once (brief downtime). `reload` restarts cluster-mode instances one by one, so some instances are always serving.',
        },
        {
          q: 'Do you need PM2 inside Docker or Kubernetes?',
          a: 'Usually not. The orchestrator already restarts containers and scales replicas. If used, run `pm2-runtime` so the container\'s main process stays in the foreground.',
        },
        {
          q: 'Is max_memory_restart a fix for memory leaks?',
          a: 'No. It is a safety net that buys time. You still need to find the leak with heap snapshots.',
        },
      ],
      spoken: `"PM2 is a process manager I use when deploying Node on VMs like EC2. It keeps the app alive with auto-restart, runs it in cluster mode with one instance per core, and gives zero-downtime deploys with pm2 reload, which restarts instances one at a time. I configure it with an ecosystem file, use wait_ready so PM2 only routes traffic once Mongo is connected, and handle SIGINT for graceful shutdown. max_memory_restart is a safety net, not a leak fix. In Kubernetes or ECS I usually skip PM2, because the orchestrator does those jobs."`,
      mistakes: [
        'Using `pm2 restart` for deploys and causing short downtime instead of `pm2 reload`.',
        'Forgetting `pm2 save` after `pm2 startup`, so apps don\'t come back after reboot.',
        'Keeping in-memory state (sessions, caches) while running cluster mode.',
        'Follow-up trap: "Which signal does PM2 send to stop an app?" SIGINT by default, then SIGKILL after `kill_timeout`. Kubernetes and Docker send SIGTERM — handle both.',
      ],
      takeaway: 'PM2 = restarts, cluster mode, zero-downtime reloads and logs for Node on VMs; orchestrators replace it in containers.',
    },
    {
      id: 'graceful-shutdown',
      title: 'Graceful Shutdown',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'On SIGTERM, stop accepting new requests, finish in-flight ones, close DB/queue connections, then exit — with a hard timeout as backup.',
      what: `**Graceful shutdown** means stopping the app **politely** instead of killing it mid-request.

When you deploy, scale down, or restart, the platform sends a **signal** to your process:
- **SIGTERM** — "please stop" (Kubernetes, Docker, ECS, systemd).
- **SIGINT** — Ctrl+C in a terminal, and PM2's default.

Steps:
1. Catch the signal: \`process.on('SIGTERM', ...)\`.
2. Stop taking new connections: \`server.close()\`.
3. Let in-flight requests finish.
4. Close resources: Mongo, Redis, queue consumers, timers.
5. Exit with \`process.exit(0)\`.
6. Add a **timeout** that forces exit if something hangs.

#### Deeper version
- \`server.close()\` stops new connections but **waits** for existing ones. **Keep-alive** connections can stay open and idle, so close can hang. Node 18.2+ added \`server.closeIdleConnections()\` and \`server.closeAllConnections()\`; in Node 19+ \`close()\` also closes idle connections automatically.
- **Kubernetes**: on pod termination, it sends SIGTERM and removes the pod from Service endpoints **at about the same time** — so a few requests can still arrive. Many teams fail the readiness probe first and/or wait a few seconds before closing. After \`terminationGracePeriodSeconds\` (30s default) it sends **SIGKILL**, which cannot be caught.
- **Docker**: if you start with \`npm start\`, npm may not forward signals to Node, so Node never sees SIGTERM. Use \`CMD ["node", "server.js"]\` or an init like \`tini\` / \`docker run --init\`.
- Background workers should **stop pulling new jobs**, finish the current one, and let unfinished jobs return to the queue.`,
      why: `Without it, every deploy cuts off requests mid-way: users see 502s, payments can be half-processed, and DB connections are left dangling. With it, deploys are invisible to users.`,
      analogy: `A restaurant closing for the night. You lock the front door (no new customers), let seated guests finish their meal (in-flight requests), clean the kitchen (close DB), then turn off the lights (exit). If a guest refuses to leave after an hour, security escorts them out (force timeout).`,
      code: [
        {
          title: 'Graceful shutdown for Express + Mongoose',
          lang: 'javascript',
          code: `import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.get('/health', (req, res) => res.json({ ok: !shuttingDown }));

let shuttingDown = false;
await mongoose.connect(process.env.MONGO_URI);
const server = app.listen(3000, () => console.log('up'));

async function shutdown(signal) {
  if (shuttingDown) return;      // ignore a second signal
  shuttingDown = true;
  console.log(signal, 'received, shutting down');

  // Force exit if cleanup hangs (keep below the platform's grace period)
  setTimeout(() => { console.error('forced exit'); process.exit(1); }, 20_000).unref();

  server.close(async (err) => {  // wait for in-flight requests
    await mongoose.connection.close();
    console.log('clean exit');
    process.exit(err ? 1 : 0);
  });
  server.closeIdleConnections?.(); // Node 18.2+: drop idle keep-alive sockets
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));`,
        },
        {
          title: 'Dockerfile: make sure Node receives the signal',
          lang: 'dockerfile',
          code: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
# Run node directly (not "npm start") so SIGTERM reaches the app
CMD ["node", "src/server.js"]`,
        },
      ],
      output: `On \`docker stop\` or a Kubernetes rollout, the app logs \`SIGTERM received, shutting down\`, stops accepting new connections, lets running requests finish, closes Mongo, logs \`clean exit\` and exits with code 0. If something hangs, after 20 seconds it logs \`forced exit\` and exits with 1 — before Kubernetes would SIGKILL it at 30 seconds.`,
      questions: [
        {
          q: 'What is graceful shutdown and why do it?',
          a: 'Stopping the process cleanly: stop new requests, finish in-flight ones, close connections, then exit. It prevents dropped requests and half-done work during deploys and scaling.',
        },
        {
          q: 'Which signals should a Node app handle?',
          a: 'SIGTERM (sent by Docker, Kubernetes, ECS, systemd) and SIGINT (Ctrl+C, PM2). SIGKILL cannot be caught.',
        },
        {
          q: 'Why might server.close() never finish?',
          a: 'Idle keep-alive connections keep the server open. Use `closeIdleConnections()` (Node 18.2+), send `Connection: close` during shutdown, and always keep a forced-exit timeout.',
        },
        {
          q: 'Why does my container not receive SIGTERM?',
          a: 'Often because the app is started via `npm start` or a shell script that does not forward signals, or Node runs as PID 1 without an init. Use `CMD ["node", "server.js"]`, `exec` in scripts, or tini.',
        },
      ],
      spoken: `"Graceful shutdown means that when the platform sends SIGTERM during a deploy or scale-down, my app stops accepting new connections with server.close, lets in-flight requests finish, closes MongoDB, Redis and queue consumers, and then exits with code zero. I always add a forced-exit timer below the platform's grace period, because keep-alive connections or a stuck query can make close hang. In Docker I run node directly instead of npm start so the signal actually reaches the process. In Kubernetes I also fail readiness first so traffic drains before I close."`,
      mistakes: [
        'Calling `process.exit()` right away on SIGTERM — in-flight requests are cut off.',
        'No forced timeout, so the process hangs until SIGKILL.',
        'Starting the container with `npm start`, so Node never gets SIGTERM and gets SIGKILLed after the grace period.',
        'Follow-up trap: "Can you run async cleanup in process.on(\'exit\')?" No — only synchronous code runs there. Do async cleanup in the signal handler, then call exit.',
      ],
      takeaway: 'On SIGTERM: stop new work, finish current work, close connections, exit — with a timeout as a safety net.',
    },
    {
      id: 'dependency-upgrades',
      title: 'Dependency Upgrades: semver, npm outdated, npm audit',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Read semver ranges, find stale packages with npm outdated, upgrade majors one at a time with changelogs and tests, and fix vulnerabilities with npm audit — carefully.',
      what: `**Semver** (semantic versioning) is the \`MAJOR.MINOR.PATCH\` format, like \`4.18.2\`:
- **PATCH** (4.18.**3**) — bug fixes only.
- **MINOR** (4.**19**.0) — new features, nothing breaks.
- **MAJOR** (**5**.0.0) — breaking changes. Your code may need updates.

Ranges in package.json:
- \`^4.18.2\` — allow minor and patch updates (\`>=4.18.2 <5.0.0\`). The npm default.
- \`~4.18.2\` — allow patch updates only (\`>=4.18.2 <4.19.0\`).
- \`4.18.2\` — exact version.

Tools:
- \`npm outdated\` — shows **Current**, **Wanted** (max allowed by your range) and **Latest**.
- \`npm update\` — updates within your ranges (never crosses a major).
- \`npm audit\` — lists known vulnerabilities; \`npm audit fix\` applies safe fixes.

#### Deeper version
**Upgrading a major safely:**
1. Read the **changelog / migration guide** (for example Mongoose 6→7 removed callback support; Express 4→5 changed path matching and promise handling).
2. Upgrade **one major at a time**, in its **own PR**.
3. Run the full test suite, lint and type-check. Fix deprecation warnings first (\`node --trace-deprecation\` helps find them).
4. Deploy to **staging**, then production with monitoring and a rollback plan.

**Other tools and tips:**
- \`npx npm-check-updates\` (ncu) shows/bumps ranges past majors. \`npm ls <pkg>\` shows **why** a package is installed and which versions exist.
- \`npm audit fix --force\` may install **breaking majors** — never run it blindly.
- **overrides** in package.json (npm 8.3+) forces a fixed version of a **transitive** (indirect) dependency when the parent package has not updated yet.
- Not every audit finding matters: a ReDoS in a dev-only build tool is lower risk than one in your request parser. Prioritize by runtime exposure.
- Automate with **Dependabot** or **Renovate**: small, frequent PRs are far safer than one huge upgrade every two years.
- Remember **0.x** versions: \`^0.2.3\` only allows \`0.2.x\`, since in 0.x the minor acts like a major.`,
      why: `Old dependencies collect security vulnerabilities and block runtime upgrades (like Node 16→18, where old native modules simply stopped building). Upgrading carelessly breaks production. Interviewers want to hear a calm, repeatable process.`,
      analogy: `Upgrading dependencies is like servicing a car. Patch updates are topping up oil. Minor updates are new floor mats. A major update is replacing the engine — you read the manual, do it alone (one at a time), test drive it (staging), and keep the old engine nearby (rollback).`,
      code: [
        {
          title: 'Find and apply updates',
          lang: 'bash',
          code: `npm outdated
# Package   Current  Wanted  Latest
# express    4.17.1  4.21.2   5.1.0   <- Wanted stays on 4.x because of ^4
# mongoose    6.12.0  6.13.8   8.x    <- two majors behind

npm update                  # safe: moves to "Wanted" versions only
npm ls mongoose             # who depends on it, which versions are installed
npx npm-check-updates       # list upgrades including majors (does not install)
npm install mongoose@7      # one major at a time, in its own PR
npm test`,
        },
        {
          title: 'Security audit and overrides',
          lang: 'bash',
          code: `npm audit                   # list vulnerabilities by severity
npm audit --omit=dev        # focus on what ships to production
npm audit fix               # apply semver-compatible fixes only
# npm audit fix --force     # may jump majors - review before using!`,
        },
        {
          title: 'Pin a vulnerable transitive dependency with overrides',
          lang: 'json',
          code: `{
  "dependencies": {
    "some-sdk": "^3.2.0"
  },
  "overrides": {
    "semver": "^7.5.4"
  }
}`,
        },
      ],
      output: `\`npm outdated\` shows Express could go to 4.21.2 safely ("Wanted"), but 5.x needs a deliberate major upgrade. Mongoose is two majors behind, so we go 6→7 first, read the migration guide, run tests, ship, then 7→8.

\`npm audit\` lists issues. \`audit fix\` patches what it can without breaking ranges. The \`overrides\` block forces every nested copy of \`semver\` to a patched version even though \`some-sdk\` has not updated its own dependency yet. (Exact versions in these examples are illustrative — check the real output in your project.)`,
      questions: [
        {
          q: 'What do ^ and ~ mean in package.json?',
          a: '`^1.2.3` allows minor and patch updates below 2.0.0. `~1.2.3` allows only patch updates below 1.3.0. For 0.x versions, `^` is stricter.',
        },
        {
          q: 'How do you upgrade a major version of a library safely?',
          a: 'Read the changelog and migration guide, upgrade one major in its own PR, fix deprecations, run tests and type-checks, test in staging, roll out with monitoring and a rollback plan.',
        },
        {
          q: 'What does npm audit fix --force do?',
          a: 'It applies fixes even if they need breaking major upgrades. It can break your app, so review the changes and test instead of running it blindly.',
        },
        {
          q: 'How do you fix a vulnerability in a transitive dependency?',
          a: 'First try upgrading the direct parent. If it has no fixed release, use `overrides` (npm) / `resolutions` (yarn) to force a patched version, and test that the parent still works.',
        },
        {
          q: 'How do you keep dependencies fresh over time?',
          a: 'Dependabot or Renovate opening small PRs regularly, grouped minor/patch updates, CI tests on every PR, and a routine for majors.',
        },
      ],
      spoken: `"Packages follow semver — major, minor, patch — and the caret range allows minor and patch updates while tilde allows only patches. I use npm outdated to see current, wanted and latest, npm update for safe in-range bumps, and I treat majors as small projects: read the migration guide, upgrade one major per PR, fix deprecation warnings, run tests, then staging and a monitored rollout. For security I run npm audit in CI, prioritize what ships to production, never run audit fix force blindly, and use overrides for vulnerable transitive dependencies. Dependabot keeps the upgrades small and regular."`,
      mistakes: [
        'Bumping ten majors in one PR — when something breaks, you cannot tell which upgrade caused it.',
        'Running `npm audit fix --force` and shipping without testing.',
        'Deleting the lock file to "fix" install issues — it silently upgrades everything in the tree.',
        'Follow-up trap: "Does ^1.2.3 ever install 2.0.0?" Never. Caret ranges stay below the next major (and for 0.x, below the next minor).',
      ],
      takeaway: 'Patch/minor often and automated; majors one at a time with changelog, tests, staging and rollback.',
    },
    {
      id: 'memory-performance',
      title: 'Memory and Performance (V8 Heap, GC, Leaks)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'V8 stores objects in a heap and frees them with garbage collection. Leaks happen when something keeps references alive; performance dies when the event loop is blocked.',
      what: `**Memory**: every object you create lives in V8's **heap**. The **garbage collector (GC)** frees objects that nothing references anymore.

A **memory leak** in Node is when objects stay referenced by accident, so the GC can never free them, and memory grows until the process crashes with "JavaScript heap out of memory".

Common leak sources:
- A global **cache/Map** that only grows (no limit, no expiry).
- **Event listeners** added per request and never removed.
- **Timers/intervals** never cleared.
- **Closures** holding big objects.
- Storing per-request data in module-level arrays.

**Performance** in Node mostly means: don't block the event loop, do less I/O, and do I/O in parallel.

#### Deeper version
**V8 heap layout:**
- **Young generation** (new space) — new, short-lived objects. Cleaned often by a fast **Scavenge** GC.
- **Old generation** (old space) — objects that survived a few GCs. Cleaned by **Mark-Sweep-Compact**, which is slower.
- Max old space size depends on the Node version and available memory. Set it with \`--max-old-space-size=<MB>\`. In containers, set it below the container limit (for example ~75%) to leave room for Buffers and native memory.

**\`process.memoryUsage()\`** fields:
- \`rss\` — total memory of the process (resident set size).
- \`heapTotal\` / \`heapUsed\` — V8 heap allocated / used.
- \`external\` / \`arrayBuffers\` — memory outside the heap (Buffers).

A leak looks like \`heapUsed\` climbing after each GC and never coming back down (a "sawtooth that keeps rising").

**Performance checklist:**
- Avoid sync APIs and heavy CPU in handlers; use workers/queues.
- Mongo: \`.lean()\`, projections, indexes, pagination, connection pool (\`maxPoolSize\`).
- Cache hot data in Redis (with TTL), use HTTP caching headers.
- Stream big responses; compress at Nginx/CDN rather than in Node.
- Set timeouts on all outbound calls (DB, Stripe, OpenAI) so slow dependencies don't pile up requests.
- Use \`WeakMap\` / \`WeakRef\` when attaching data to objects you don't own the lifecycle of.`,
      why: `Memory leaks and event loop blocking are the two most common Node production problems. They show up as slowly rising memory with restarts every few days, or as p99 latency spikes. Interviewers love asking "how would you debug a memory leak?".`,
      analogy: `The heap is a room. The GC is a cleaner who throws away anything no one is holding. A leak is someone who keeps holding onto old newspapers "just in case" — the cleaner can't throw them away, and eventually the room is full.`,
      code: [
        {
          title: 'A classic leak: unbounded cache',
          lang: 'javascript',
          code: `import http from 'node:http';

const cache = new Map(); // grows forever: every unique URL is stored

http.createServer((req, res) => {
  if (!cache.has(req.url)) cache.set(req.url, Buffer.alloc(1024 * 100)); // 100 KB each
  res.end('ok');
}).listen(3000);

setInterval(() => {
  const { rss, heapUsed, external } = process.memoryUsage();
  const mb = (n) => Math.round(n / 1024 / 1024) + 'MB';
  console.log('rss', mb(rss), 'heapUsed', mb(heapUsed), 'external', mb(external), 'entries', cache.size);
}, 5000);`,
        },
        {
          title: 'Fix: bounded cache with expiry (simple LRU)',
          lang: 'javascript',
          code: `class LruCache {
  constructor(max = 500, ttlMs = 60_000) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.map = new Map(); // Map keeps insertion order
  }
  get(key) {
    const hit = this.map.get(key);
    if (!hit || hit.expires < Date.now()) { this.map.delete(key); return undefined; }
    this.map.delete(key); this.map.set(key, hit); // mark as recently used
    return hit.value;
  }
  set(key, value) {
    this.map.delete(key);
    this.map.set(key, { value, expires: Date.now() + this.ttlMs });
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value); // evict oldest
  }
}

const cache = new LruCache(2);
cache.set('a', 1); cache.set('b', 2); cache.get('a'); cache.set('c', 3);
console.log([...cache.map.keys()]); // [ 'a', 'c' ] -> 'b' was evicted`,
        },
        {
          title: 'Run with a heap limit',
          lang: 'bash',
          code: `# Container has 1 GB: keep the V8 old space well below it
node --max-old-space-size=768 server.js

# Or via env (works with npm scripts, PM2, Docker)
NODE_OPTIONS="--max-old-space-size=768" node server.js`,
        },
      ],
      output: `In the leaky server, hitting many different URLs (\`/a1\`, \`/a2\`, ...) makes \`external\` and \`entries\` climb every 5 seconds and never drop. Eventually the container is killed (OOM) or Node crashes.

The LRU cache keeps at most N entries and drops expired ones, so memory stays bounded. In the demo, after using \`a\` and adding \`c\`, the least recently used key \`b\` is evicted. In real projects, a library like \`lru-cache\` or Redis with TTLs does this for you.`,
      questions: [
        {
          q: 'How does garbage collection work in V8?',
          a: 'It is generational. New objects go to the young generation and are cleaned by fast scavenges. Survivors move to the old generation, cleaned by mark-sweep-compact. An object is freed when nothing reachable references it.',
        },
        {
          q: 'What are common causes of memory leaks in Node?',
          a: 'Unbounded caches or arrays, event listeners never removed, intervals never cleared, closures holding large objects, and global variables storing per-request data.',
        },
        {
          q: 'What do rss, heapUsed and external mean?',
          a: '`rss` is total process memory. `heapUsed` is memory used by JS objects in the V8 heap. `external` is memory for things like Buffers outside the heap.',
        },
        {
          q: 'What does --max-old-space-size do?',
          a: 'It sets the max size of V8\'s old generation in MB. Raise it for memory-heavy jobs, or set it below the container limit so Node GCs harder before the container is OOM-killed.',
        },
        {
          q: 'How do you improve the performance of a slow Node API?',
          a: 'Measure first (APM, profiling). Then common fixes: DB indexes and lean queries, caching, parallel I/O with Promise.all, pagination and streaming, moving CPU work off the main thread, and timeouts on slow dependencies.',
        },
      ],
      spoken: `"V8 uses a generational garbage collector: new objects live in the young generation and are cleaned quickly, and survivors move to old space, which is collected less often. A leak in Node is basically something still holding references — usually an unbounded cache, listeners added per request, or timers never cleared. I watch heapUsed and rss over time; if heapUsed keeps rising after GC, it's a leak. I set max-old-space-size below the container limit. For performance I measure first, then fix the usual suspects — missing indexes, sequential awaits, no caching, or CPU work blocking the event loop."`,
      mistakes: [
        'Raising `--max-old-space-size` to "fix" a leak — it only delays the crash.',
        'Using a plain object or Map as a cache with no size limit or TTL.',
        'Only looking at `heapUsed` and missing Buffer growth in `external`/`arrayBuffers`.',
        'Follow-up trap: "Rising memory after deploy — is it always a leak?" No. V8 grows the heap lazily and caches warm up. A leak is memory that keeps growing **after** GC under steady load.',
      ],
      takeaway: 'Leaks are forgotten references; bound every cache, clean up listeners and timers, and measure before optimizing.',
    },
    {
      id: 'memory-profiling-inspect',
      title: 'Debugging and Profiling with --inspect (Heap Snapshots, CPU Profiles)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Start Node with --inspect and attach Chrome DevTools or VS Code to debug, record CPU profiles, and compare heap snapshots to find leaks.',
      what: `\`node --inspect server.js\` turns on the **inspector**: a debugging port (default \`127.0.0.1:9229\`). Then you attach a tool:
- **Chrome**: open \`chrome://inspect\` → "Open dedicated DevTools for Node".
- **VS Code**: "Attach to Node process" or a launch config.

Then you can set **breakpoints**, step through code, see variables, record a **CPU profile** (which functions use the most time), and take **heap snapshots** (what objects are in memory).

\`--inspect-brk\` does the same but **pauses on the first line**, so you can debug startup code.

#### Deeper version
**Finding a memory leak (3-snapshot technique):**
1. Start the app with \`--inspect\`, warm it up, take **snapshot 1**.
2. Send load (for example \`autocannon\` or \`k6\`) that triggers the suspected leak. Take **snapshot 2**.
3. Repeat the load, take **snapshot 3**.
4. In DevTools, view snapshot 3 as **"Objects allocated between snapshots 1 and 2"** or use the **Comparison** view. Objects that keep growing are suspects.
5. Open the **Retainers** panel to see **who is holding** them (for example a Map in \`cache.js\`).

**Other tools:**
- \`--cpu-prof\` and \`--heap-prof\` write profile files on exit, which you can open in DevTools — no live attach needed.
- \`--heapsnapshot-signal=SIGUSR2\` → \`kill -USR2 <pid>\` writes a heap snapshot from a running process. Or call \`v8.writeHeapSnapshot()\` from an admin-only route.
- \`--heapsnapshot-near-heap-limit=N\` writes snapshots automatically when close to OOM.
- \`--trace-gc\` logs every GC run.
- **clinic.js** (\`clinic doctor\`, \`clinic flame\`) and \`0x\` give flame graphs and quick diagnosis.
- Sending **SIGUSR1** to a running Node process (Linux/macOS) turns on the inspector without a restart.

**Safety:** never expose the inspector port publicly (\`--inspect=0.0.0.0\`) — anyone who connects can run any code in your process. Use an SSH tunnel or \`kubectl port-forward\`. Taking a heap snapshot **pauses** the process and needs extra memory (roughly the heap size), so do it on one instance taken out of traffic.`,
      why: `"How would you debug a memory leak or a CPU spike in production?" is a classic senior-level question. Knowing the actual steps — snapshots, comparison, retainers, flame graphs — shows real experience instead of guessing.`,
      analogy: `A heap snapshot is a photo of a messy room. One photo tells you little. Three photos taken an hour apart show which pile keeps growing. The retainers view shows who keeps adding to that pile.`,
      code: [
        {
          title: 'Start with the inspector',
          lang: 'bash',
          code: `node --inspect server.js          # attach any time via chrome://inspect
node --inspect-brk server.js      # pause on first line (debug startup)

# Profiles written to disk on exit (open the files in Chrome DevTools)
node --cpu-prof --cpu-prof-dir=./profiles server.js
node --heap-prof server.js

# Snapshot a running process on demand
node --heapsnapshot-signal=SIGUSR2 server.js &
kill -USR2 <pid>                  # writes Heap.<date>.<pid>...heapsnapshot

# Remote server: tunnel instead of opening the port
ssh -L 9229:127.0.0.1:9229 user@my-server`,
        },
        {
          title: 'Write a snapshot from code (admin-only)',
          lang: 'javascript',
          code: `import v8 from 'node:v8';
import express from 'express';

const app = express();

// Protect this route! Snapshots contain secrets and pause the process.
app.post('/admin/heap-snapshot', requireAdmin, (req, res) => {
  const file = v8.writeHeapSnapshot(); // returns the file name written
  res.json({ file });
});

function requireAdmin(req, res, next) {
  if (req.get('x-admin-token') !== process.env.ADMIN_TOKEN) return res.sendStatus(403);
  next();
}

app.listen(3000);`,
        },
        {
          title: 'VS Code launch config',
          lang: 'json',
          code: `{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "program": "\${workspaceFolder}/src/server.js",
      "env": { "NODE_ENV": "development" }
    }
  ]
}`,
        },
      ],
      output: `With \`--inspect\`, Node prints \`Debugger listening on ws://127.0.0.1:9229/...\`. In DevTools you can pause on breakpoints, use the **Memory** tab to take and compare snapshots, and the **Profiler/Performance** tab to record CPU usage.

Comparing snapshots usually points straight at the problem: for example thousands of \`Buffer\` or \`IncomingMessage\` objects retained by a \`Map\` in \`cache.js\`. A CPU profile shows a "flame" where a single function (say, a regex or a big \`JSON.stringify\`) takes most of the time.`,
      questions: [
        {
          q: 'How would you debug a memory leak in a Node service?',
          a: 'Confirm it with metrics (heapUsed rising after GC under steady load). Reproduce locally or on one instance, take three heap snapshots with load in between, compare them, and follow the retainers of growing objects to the code holding them. Fix, then load-test again.',
        },
        {
          q: 'What does --inspect do?',
          a: 'It enables the V8 inspector on port 9229 so Chrome DevTools or VS Code can attach for breakpoints, CPU profiling and heap snapshots. `--inspect-brk` also pauses on the first line.',
        },
        {
          q: 'How do you find what is using CPU?',
          a: 'Record a CPU profile (`--cpu-prof`, DevTools Profiler, or clinic flame / 0x) and read the flame graph to find the hottest functions.',
        },
        {
          q: 'Is it safe to take heap snapshots in production?',
          a: 'Carefully. It pauses the process and needs extra memory, and the file contains secrets and user data. Take it on one instance removed from traffic, and store the file securely.',
        },
      ],
      spoken: `"For debugging I start Node with --inspect and attach Chrome DevTools or VS Code for breakpoints. For a memory leak, I first confirm with metrics that heapUsed keeps rising after GC. Then I reproduce it, take three heap snapshots with load in between, compare them, and use the retainers view to see what's holding the growing objects — usually a cache, listeners or closures. For CPU issues I record a CPU profile or use clinic flame and look at the flame graph. In production I never expose the inspector port; I use an SSH tunnel or heap-snapshot signal on one instance taken out of rotation."`,
      mistakes: [
        'Running `--inspect=0.0.0.0:9229` on a public server — remote code execution for anyone.',
        'Taking a single heap snapshot and guessing. You need a comparison over time.',
        'Taking snapshots on a busy production instance and causing a long pause or an OOM.',
        'Follow-up trap: "Why is the heap snapshot file bigger than heapUsed?" It stores the full object graph with names and edges, so it can be larger than the live heap — and taking it needs extra memory too.',
      ],
      takeaway: '--inspect + DevTools: compare three heap snapshots for leaks, read flame graphs for CPU — never expose the port.',
    },
    {
      id: 'async-local-storage',
      title: 'AsyncLocalStorage (Request Context)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'AsyncLocalStorage keeps a per-request "context" (like a request ID or user) available across all async calls, without passing it through every function.',
      what: `Imagine you want every log line during a request to include its **request ID**. Without help, you must pass \`requestId\` into every function — controller, service, repository, logger. That is messy.

**AsyncLocalStorage** (from \`node:async_hooks\`) solves this. You start a context with \`als.run(store, fn)\`. Anything that runs inside \`fn\` — even after \`await\`, timers and callbacks — can read that store with \`als.getStore()\`.

Each request gets its **own** store, even though all requests share one thread.

#### Deeper version
- It works by tracking **async context**: Node knows which async operation created which, so the store "follows" promises, timers and most callbacks.
- It is **stable** (since Node 16.4) and is the recommended API. The lower-level \`async_hooks.createHook\` is not recommended for normal use.
- Common uses: request IDs / trace IDs for logging, current user or tenant for multi-tenant apps, DB transaction sessions, APM tools (OpenTelemetry uses similar context propagation).
- Store a **mutable object** (\`{ requestId, userId }\`) if later middleware needs to add fields, like the user after authentication.
- **Context can be lost** with some libraries that pool callbacks or use custom queues (older DB drivers, some event emitters). \`AsyncResource.bind()\` / \`AsyncLocalStorage.bind()\` can fix those spots.
- There is a small performance cost; it improved a lot in newer Node versions.`,
      why: `Production debugging needs correlated logs: "show me every log line for request abc-123". AsyncLocalStorage gives that without changing every function signature. It is also how frameworks provide things like "current request" helpers (Next.js uses it internally for \`headers()\` and \`cookies()\`).`,
      analogy: `A hospital wristband. Each patient (request) gets a wristband with their ID when they arrive. Any doctor or nurse (function) who touches the patient later — even in a different department after a wait — can read the wristband without asking the front desk.`,
      code: [
        {
          title: 'Request ID in every log, no parameter passing',
          lang: 'javascript',
          code: `import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

const als = new AsyncLocalStorage();

function log(message) {
  const ctx = als.getStore();
  console.log('[' + (ctx?.requestId ?? 'no-ctx') + '] ' + message);
}

async function chargeCustomer(amount) {     // deep inside the service layer
  await sleep(Math.random() * 50);          // simulate DB / Stripe call
  log('charged ' + amount);
}

async function handleRequest(amount) {
  return als.run({ requestId: randomUUID().slice(0, 8) }, async () => {
    log('request started');
    await chargeCustomer(amount);
    log('request finished');
  });
}

// Two "requests" running at the same time on one thread
await Promise.all([handleRequest(100), handleRequest(250)]);
log('outside any request');`,
        },
        {
          title: 'Express middleware version',
          lang: 'javascript',
          code: `import express from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export const requestContext = new AsyncLocalStorage();
const app = express();

app.use((req, res, next) => {
  const requestId = req.get('x-request-id') ?? randomUUID();
  res.set('x-request-id', requestId);
  requestContext.run({ requestId, userId: null }, next); // everything after runs inside
});

app.use((req, res, next) => {
  requestContext.getStore().userId = 'user_42'; // e.g. set after auth
  next();
});

app.get('/me', (req, res) => res.json(requestContext.getStore()));
app.listen(3000);`,
        },
      ],
      output: `The first script prints something like:
\`[a1b2c3d4] request started\`, \`[e5f6a7b8] request started\`, then the "charged" and "finished" lines in a random order — but each line always carries the **correct** ID of its own request, even though they are interleaved. The last line prints \`[no-ctx] outside any request\`.

In the Express app, \`GET /me\` returns \`{"requestId":"...","userId":"user_42"}\`, and the same ID is sent back in the \`x-request-id\` header for tracing across services.`,
      questions: [
        {
          q: 'What is AsyncLocalStorage?',
          a: 'A Node API that stores data for the duration of an async flow. You start a context with `run(store, fn)`, and any code running inside it, even after awaits and timers, can read it with `getStore()`.',
        },
        {
          q: 'What would you use it for?',
          a: 'Request IDs and trace IDs in logs, current user or tenant, per-request DB sessions or transactions, and APM/tracing context.',
        },
        {
          q: 'Why not just use a global variable for the current request?',
          a: 'Because many requests run interleaved on the same thread. A global would be overwritten by the next request while the first is still awaiting. AsyncLocalStorage keeps a separate store per async flow.',
        },
        {
          q: 'Can the context get lost?',
          a: 'Yes, with some libraries that queue callbacks in custom ways. You can fix it by binding callbacks with `AsyncLocalStorage.bind()` or `AsyncResource`.',
        },
      ],
      spoken: `"AsyncLocalStorage lets me keep per-request context without passing it through every function. In a middleware I call run with a store containing the request ID, and later — even several awaits deep in a service or the logger — getStore returns that request's data. A global variable wouldn't work because requests interleave on the same thread. I've used it for request IDs in structured logs so I can filter all logs for one request, and for the current user or tenant. It's stable and it's what tracing tools and frameworks like Next.js use under the hood."`,
      mistakes: [
        'Using a module-level variable for "current user" — requests overwrite each other.',
        'Calling `getStore()` outside `run()` and not handling `undefined`.',
        'Using `als.enterWith()` casually — it changes context for the rest of the current sync execution and is easy to misuse; prefer `run()`.',
        'Follow-up trap: "Does AsyncLocalStorage work across services?" No, only inside one process. Across services you pass IDs in headers (like `x-request-id` or W3C `traceparent`).',
      ],
      takeaway: 'AsyncLocalStorage = a per-request backpack that follows your async calls — perfect for request IDs and tracing.',
    },
    {
      id: 'node-16-to-18-migration',
      title: 'Node 16 → 18 Migration (What Changed and How to Roll It Out)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Node 18 brought OpenSSL 3, a newer V8, global fetch and node:test (both experimental in 18), and IPv6-first DNS behaviour. Roll out with nvm/.nvmrc, engines, a CI matrix and staged deploys.',
      what: `**Why migrate?** Node 16 reached **end-of-life on 11 September 2023** — earlier than usual, because the OpenSSL 1.1.1 library it depended on was also reaching end-of-life. After EOL there are no security fixes. Node 18 was the next LTS (Long-Term Support) line. (Node 18 itself reached end-of-life in April 2025, so today the same playbook applies to moving to a newer LTS.)

**What changed between 16 and 18** (many changes actually landed in Node 17, which you skip over):
- **OpenSSL 3.0** (from Node 17). Old/weak algorithms are disabled by default. The famous error is \`ERR_OSSL_EVP_UNSUPPORTED\` ("digital envelope routines::unsupported"), usually from **webpack 4 / old react-scripts** using the MD4 hash.
- **Global \`fetch\`**, \`FormData\`, \`Headers\`, \`Request\`, \`Response\` — available by default in 18 but marked **experimental** there (it prints an ExperimentalWarning). It became stable in Node 21.
- **Built-in test runner** \`node:test\` — added in 18 as **experimental**; stable in Node 20.
- **V8 upgraded** (Node 18.0 shipped V8 10.1, Node 16 had V8 9.x): new JS features like \`Array.prototype.findLast()\`, and \`structuredClone()\` is a global (since Node 17).
- **DNS order**: from Node 17, \`dns.lookup\` returns addresses in the order the OS gives (no longer IPv4 first). So \`localhost\` may resolve to \`::1\` (IPv6). If MongoDB/Redis listens only on \`127.0.0.1\`, you get \`ECONNREFUSED ::1:27017\`.
- **Native addons** must be rebuilt for the new ABI (binary interface). Old \`node-sass\`, \`bcrypt\`, \`sharp\` versions may fail to install.
- **npm**: Node 18 shipped with npm 8 at first; later 18.x releases bundled newer npm versions. Check \`npm -v\` — a different npm can rewrite the lock file format.

#### Deeper version
**Fixes for common breakages:**
- \`ERR_OSSL_EVP_UNSUPPORTED\` → the **real fix** is upgrading the tool (webpack 5 / react-scripts 5 / the library using old crypto). The **temporary** workaround is \`NODE_OPTIONS=--openssl-legacy-provider\` — use it only to unblock, and track removing it.
- TLS errors talking to old servers (for example "unsafe legacy renegotiation disabled") → the other side should upgrade; workarounds exist but weaken security.
- \`ECONNREFUSED ::1\` → use \`127.0.0.1\` in connection strings, make the service listen on IPv6 too, or start Node with \`--dns-result-order=ipv4first\`.
- Native module build errors → upgrade to versions with Node 18 prebuilt binaries, replace \`node-sass\` with \`sass\` (Dart Sass), run \`npm rebuild\`.
- If you used \`node-fetch\`: you can keep it, or move to global fetch. Note fetch **does not reject on 4xx/5xx** (check \`res.ok\`) and has **no default timeout** — use \`AbortSignal.timeout(ms)\`.
- AWS Lambda: the \`nodejs18.x\` runtime includes **AWS SDK v3** only, not v2. Code doing \`require('aws-sdk')\` without bundling it breaks — migrate to \`@aws-sdk/client-*\` or bundle v2.
- Upgrading from Node 14 or older? Remember unhandled rejections already crash since Node 15.

**Rollout plan (what to say you did):**
1. **Inventory**: list services, Dockerfiles, CI images, Lambda runtimes, and native dependencies (\`npm ls\` for bcrypt, sharp, node-sass...).
2. **Pin versions**: \`.nvmrc\` with \`18\`, \`engines.node\` in package.json, \`FROM node:18-alpine\` in Dockerfiles.
3. **Local**: \`nvm install 18 && nvm use\`, delete \`node_modules\`, \`npm ci\`, run tests and the app.
4. **CI matrix**: run the test suite on **both 16 and 18** during the transition, so nothing breaks for whoever is still on 16.
5. **Fix**: upgrade blocking dependencies one at a time; treat warnings (\`--trace-deprecation\`, \`--trace-warnings\`) seriously.
6. **Staging**: deploy, run smoke/E2E tests, watch logs for OpenSSL, TLS, DNS and memory differences.
7. **Staged production rollout**: one low-risk service first, or a canary (a small % of traffic / one instance). Compare error rate, p95/p99 latency, memory and CPU with the old version.
8. **Rollback ready**: keep the Node 16 image tagged so you can redeploy in minutes.
9. **Clean up**: remove the 16 entry from the CI matrix, remove temporary flags like \`--openssl-legacy-provider\`, update docs.`,
      why: `Running an EOL runtime means unpatched security issues, failing compliance checks, and being blocked from newer libraries (many packages drop old Node versions). Interviewers ask about migrations to see whether you can change critical infrastructure **safely**, not just whether you know version numbers.`,
      analogy: `Changing the engine of a bus that is still carrying passengers. You first test the new engine in the garage (local + CI), then on an empty test route (staging), then on one bus with a few passengers (canary), and you keep the old engine ready in case the new one makes a strange noise (rollback).`,
      code: [
        {
          title: 'Pin and switch versions locally',
          lang: 'bash',
          code: `# .nvmrc in the repo root contains a single line:  18
echo "18" > .nvmrc

nvm install          # installs the version from .nvmrc
nvm use              # switches this shell to it
node -v && npm -v    # confirm both (npm version can differ!)

rm -rf node_modules
npm ci               # clean install; native addons build for Node 18 here
npm test

# Temporary unblock for old webpack/react-scripts - track removing it!
NODE_OPTIONS=--openssl-legacy-provider npm run build`,
        },
        {
          title: 'CI matrix during the transition (GitHub Actions)',
          lang: 'yaml',
          code: `name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [16, 18]          # drop 16 once every environment is on 18
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build`,
        },
        {
          title: 'Code-level changes you may make',
          lang: 'javascript',
          code: `// 1) engines in package.json:  "engines": { "node": ">=18" }

// 2) Global fetch (experimental in Node 18): check res.ok and add a timeout
const res = await fetch('https://api.example.com/health', {
  signal: AbortSignal.timeout(5000), // fetch has no default timeout
});
if (!res.ok) throw new Error('Upstream failed with ' + res.status); // 4xx/5xx do not reject
console.log(await res.json());

// 3) DNS change: avoid "ECONNREFUSED ::1:27017" by using an explicit IPv4 host
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/app';

// 4) structuredClone is global since Node 17 (deep copy without lodash)
const copy = structuredClone({ nested: { a: 1 }, when: new Date() });
console.log(copy.when instanceof Date); // true`,
        },
      ],
      output: `After \`nvm use\`, \`node -v\` prints a v18 version. \`npm ci\` rebuilds native modules for the new ABI — this is where old \`node-sass\` or \`bcrypt\` versions usually fail, telling you what to upgrade.

The CI matrix runs every PR on Node 16 **and** 18, so the team can merge safely while some services are still on 16. When production is fully on 18, you remove 16 from the matrix.

The code block shows the small changes many teams make: \`engines\`, safe fetch usage with \`res.ok\` and a timeout, an explicit IPv4 Mongo host to avoid the DNS-order change, and using the global \`structuredClone\`.`,
      questions: [
        {
          q: 'What were the main changes you dealt with moving from Node 16 to 18?',
          a: 'OpenSSL 3 (ERR_OSSL_EVP_UNSUPPORTED from old webpack, stricter TLS), native modules needing rebuild or upgrades, the DNS change where localhost can resolve to IPv6 ::1, a newer V8 and npm, and new built-ins like global fetch and node:test, which were experimental in 18.',
        },
        {
          q: 'How do you fix ERR_OSSL_EVP_UNSUPPORTED?',
          a: 'Properly, by upgrading the tool that uses a legacy hash (for example webpack 4 → 5 or react-scripts 4 → 5). As a temporary workaround, `NODE_OPTIONS=--openssl-legacy-provider`, which re-enables legacy algorithms — but remove it later.',
        },
        {
          q: 'Is fetch stable in Node 18?',
          a: 'It is available globally by default but marked experimental in Node 18 (it prints an ExperimentalWarning). It became stable in Node 21. Many teams kept axios or node-fetch in production on 18.',
        },
        {
          q: 'How did you roll out the migration safely?',
          a: 'Pinned the version with .nvmrc, engines and Docker base images; ran a CI matrix on 16 and 18; fixed dependency blockers one by one; deployed to staging; then rolled out service by service with a canary while watching errors, latency and memory, with the old image ready for rollback.',
        },
        {
          q: 'Why did Node 16 reach end-of-life early?',
          a: 'Because it depended on OpenSSL 1.1.1, which reached end-of-life in September 2023. Node moved Node 16\'s EOL to 11 September 2023 to match.',
        },
      ],
      spoken: `"I led our migration from Node 16 to 18, mainly because 16 hit end-of-life early in September 2023. First I inventoried services, Docker images and native dependencies. I pinned 18 with .nvmrc, the engines field and the base image, and ran a CI matrix on both 16 and 18 during the transition. The main breakages were OpenSSL 3 — ERR_OSSL_EVP_UNSUPPORTED from an old webpack, which we fixed by upgrading rather than keeping the legacy-provider flag — native modules like bcrypt needing upgrades, and localhost resolving to IPv6. Then staging, a canary per service, monitoring errors, latency and memory, with a rollback image ready."`,
      mistakes: [
        'Leaving `--openssl-legacy-provider` in production forever instead of fixing the root cause.',
        'Saying fetch and the test runner were stable in Node 18. Both were experimental there (fetch stable in 21, node:test stable in 20).',
        'Upgrading the local Node version but forgetting Docker base images, CI images, or Lambda runtimes — environments drift.',
        'Deploying all services at once with no canary and no rollback image.',
        'Follow-up trap: "After upgrading, MongoDB connections to localhost fail with ECONNREFUSED ::1. Why?" Since Node 17, DNS results are not reordered to put IPv4 first, so localhost can resolve to ::1. Use 127.0.0.1, listen on IPv6, or `--dns-result-order=ipv4first`.',
      ],
      takeaway: 'Know the real breakages (OpenSSL 3, native modules, DNS order) and the rollout recipe: pin, CI matrix, staging, canary, rollback.',
      tags: ['nvm', 'nvmrc', 'openssl', 'upgrade', 'migration', 'lts'],
    },
    {
      id: 'background-jobs-queues',
      title: 'Background Jobs and Queues (BullMQ, SQS)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Move slow or retry-able work (emails, PDFs, AI calls, webhooks) out of the request into a queue processed by separate workers.',
      what: `Some work should **not** happen inside the HTTP request: sending emails, generating invoices, resizing images, calling an LLM for a long summary, syncing with a CRM.

A **job queue** solves this:
1. The API **adds a job** to a queue and responds right away ("202 Accepted").
2. A separate **worker** process picks up jobs and does the work.
3. If a job fails, the queue can **retry** it, with a delay (**backoff**).

Popular choices in Node: **BullMQ** (uses Redis), **AWS SQS**, **Google Cloud Tasks / Pub/Sub**, **RabbitMQ**.

#### Deeper version
- Jobs may run **more than once** (a worker crashes after doing the work but before acknowledging). So handlers must be **idempotent** — safe to repeat. Use idempotency keys (Stripe supports them) or check "already done" before acting.
- **Retries with exponential backoff** for temporary failures (rate limits, timeouts); send permanently failing jobs to a **dead-letter queue** for inspection.
- **Concurrency**: limit how many jobs one worker runs at once, to respect DB and third-party rate limits (OpenAI, email providers).
- Keep job payloads small — store IDs, not whole documents. Read fresh data in the worker.
- Workers need **graceful shutdown** too: stop taking new jobs, finish the current one.
- Scheduled/repeatable jobs (cron-like) are supported by BullMQ and by cloud schedulers.
- Use the **outbox pattern** if a job must be created only when a DB transaction commits.`,
      why: `It keeps APIs fast, isolates failures (email provider down ≠ checkout down), adds automatic retries, and lets you scale workers separately from web servers. It is also the standard answer to "how do you handle CPU-heavy or slow tasks in Node?".`,
      analogy: `A restaurant's order ticket rail. The waiter (API) pins the ticket and goes back to customers. Cooks (workers) take tickets one by one. If a dish burns, the cook makes it again (retry). The waiter never stands in the kitchen.`,
      code: [
        {
          title: 'BullMQ: producer in the API, worker in another process',
          lang: 'javascript',
          code: `// queue.js (shared)
import { Queue } from 'bullmq';
export const connection = { host: '127.0.0.1', port: 6379 };
export const emailQueue = new Queue('emails', { connection });

// api.js - add a job and respond immediately
app.post('/orders/:id/receipt', async (req, res) => {
  await emailQueue.add(
    'send-receipt',
    { orderId: req.params.id },                     // small payload: just the ID
    { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, jobId: 'receipt-' + req.params.id },
  );
  res.status(202).json({ queued: true });
});

// worker.js - run as a separate process
import { Worker } from 'bullmq';
const worker = new Worker('emails', async (job) => {
  const order = await Order.findById(job.data.orderId);
  if (order.receiptSentAt) return 'already sent';  // idempotent
  await sendEmail(order.email, 'Your receipt', renderReceipt(order));
  order.receiptSentAt = new Date();
  await order.save();
}, { connection, concurrency: 10 });

worker.on('failed', (job, err) => console.error('job failed', job?.id, err.message));
process.on('SIGTERM', async () => { await worker.close(); process.exit(0); });`,
        },
      ],
      output: `The API answers in a few milliseconds with \`202 {"queued":true}\`. The worker sends the email in the background. If the email provider times out, BullMQ retries up to 5 times with growing delays (2s, 4s, 8s...). Using a fixed \`jobId\` prevents duplicate jobs for the same order, and the \`receiptSentAt\` check makes repeated runs harmless. On deploy, the worker finishes its current jobs before exiting.`,
      questions: [
        {
          q: 'When should work go to a background queue?',
          a: 'When it is slow, CPU-heavy, can fail and needs retries, or does not need to finish before responding — emails, reports, image processing, webhooks, long AI calls.',
        },
        {
          q: 'What is idempotency and why does it matter for jobs?',
          a: 'An operation is idempotent if running it twice has the same effect as once. Queues usually guarantee at-least-once delivery, so jobs can repeat; idempotent handlers prevent double emails or double charges.',
        },
        {
          q: 'What is a dead-letter queue?',
          a: 'A queue where messages go after failing all retries, so they are not lost and can be inspected and replayed.',
        },
        {
          q: 'BullMQ vs SQS?',
          a: 'BullMQ runs on your Redis with rich features (priorities, repeatable jobs, rate limits, dashboards). SQS is fully managed by AWS, highly durable and scales without ops work, but has fewer built-in job features.',
        },
      ],
      spoken: `"I move anything slow or failure-prone out of the request path into a queue — emails, invoices, image processing, long LLM calls. The API adds a small job with just an ID and responds 202, and separate worker processes handle it with retries and exponential backoff. I've used BullMQ on Redis, and SQS on AWS. Because queues are at-least-once, I make handlers idempotent — for example checking a sentAt field or using Stripe idempotency keys — and failed jobs end up in a dead-letter queue. Workers get concurrency limits and graceful shutdown too."`,
      mistakes: [
        'Putting entire documents in job payloads — they go stale. Store IDs and reload.',
        'Non-idempotent handlers that double-charge or double-email on retry.',
        'Running workers inside the web server process, so CPU-heavy jobs slow down API requests.',
        'Follow-up trap: "What if the DB write succeeds but adding the job fails?" Use the outbox pattern: save the job in the same DB transaction, and a separate process publishes it to the queue.',
      ],
      takeaway: 'Respond fast, queue the slow work, retry with backoff, and make every job idempotent.',
    },
    {
      id: 'scaling-production',
      title: 'Running Node in Production: Scaling, Health Checks, Logging',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Keep services stateless, scale horizontally behind a load balancer, add health checks, structured logs, metrics and timeouts everywhere.',
      what: `To run Node reliably for many users:

- **Stateless servers** — no sessions, uploads or caches only in process memory. Use Redis, a database or S3. Then any instance can serve any request.
- **Horizontal scaling** — add more instances (containers, pods, PM2 instances) behind a **load balancer** (ALB, Nginx, Cloud Load Balancing).
- **Health checks** — an endpoint like \`/health\` so the platform knows when to route traffic and when to restart.
- **Structured logging** — JSON logs (with \`pino\` or \`winston\`) including a request ID.
- **Metrics and tracing** — latency, error rate, event loop delay, memory; tools like Datadog, New Relic, Prometheus/Grafana, OpenTelemetry.
- **Timeouts** on every outbound call (DB, Stripe, OpenAI, other services).

#### Deeper version
- **Liveness vs readiness**: liveness = "is the process alive?" (restart if not). Readiness = "can it serve traffic now?" (DB connected, not shutting down). Don't make liveness depend on the database, or a DB blip restarts every pod at once.
- **Connection pools**: each Node instance opens its own Mongo pool (\`maxPoolSize\`, default 100 in recent drivers — check yours). 50 pods × 100 connections can overwhelm the database. Size pools on purpose.
- **Let Nginx/CDN do** TLS, gzip/brotli and static files; let Node do app logic.
- **Caching**: Redis for hot data with TTLs; HTTP cache headers and a CDN for public responses.
- **Resilience**: retries with backoff and jitter only for idempotent operations, circuit breakers for flaky dependencies, rate limiting, and bulkheads (separate pools/queues so one slow dependency doesn't take down everything).
- **Logging cost**: \`console.log\` is synchronous for files/terminals in some cases and slow at high volume; \`pino\` is designed for low overhead. Never log secrets or full card/PII data.
- **Event loop delay** is the Node-specific health metric to watch, alongside p95/p99 latency.`,
      why: `Most interviews for full-stack roles end with "how would you scale this?" or "how do you know your service is healthy?". Concrete answers — stateless, health checks, pools, timeouts, logs with request IDs — show production experience.`,
      analogy: `A food delivery company. Stateless servers are riders who can take any order because the order details are in the app (Redis/DB), not in one rider's head. The load balancer is the dispatcher. Health checks are riders checking in. Logs with request IDs are order tracking numbers.`,
      code: [
        {
          title: 'Health endpoints + structured logging with pino',
          lang: 'javascript',
          code: `import express from 'express';
import mongoose from 'mongoose';
import pino from 'pino';
import { randomUUID } from 'node:crypto';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info', redact: ['req.headers.authorization'] });
const app = express();
let shuttingDown = false;

// Attach a request-scoped child logger with a request ID
app.use((req, res, next) => {
  req.id = req.get('x-request-id') ?? randomUUID();
  req.log = logger.child({ requestId: req.id });
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    req.log.info({ method: req.method, url: req.url, status: res.statusCode, ms }, 'request done');
  });
  next();
});

app.get('/health/live', (req, res) => res.json({ ok: true }));   // process is alive
app.get('/health/ready', (req, res) => {                         // can take traffic?
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp && !shuttingDown ? 200 : 503).json({ dbUp, shuttingDown });
});

await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 20 }); // sized on purpose
app.listen(process.env.PORT ?? 3000, () => logger.info('server started'));`,
        },
        {
          title: 'Kubernetes probes for the endpoints above',
          lang: 'yaml',
          code: `livenessProbe:
  httpGet: { path: /health/live, port: 3000 }
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /health/ready, port: 3000 }
  periodSeconds: 5
resources:
  limits: { memory: "1Gi", cpu: "1" }
env:
  - name: NODE_OPTIONS
    value: "--max-old-space-size=768"`,
        },
      ],
      output: `Every request produces one JSON log line like \`{"level":30,"requestId":"9f1c...","method":"GET","url":"/orders","status":200,"ms":12.4,"msg":"request done"}\`, easy to search in CloudWatch, Datadog or Loki by request ID.

Kubernetes restarts the pod only if \`/health/live\` fails, and stops sending traffic (without restarting) when \`/health/ready\` returns 503 — for example when MongoDB is disconnected or the pod is shutting down. The heap limit is set below the 1 GiB container limit.`,
      questions: [
        {
          q: 'How do you scale a Node.js API?',
          a: 'Make it stateless (sessions/cache in Redis, files in S3), run multiple instances behind a load balancer, use all cores per machine (cluster/PM2) or more pods, cache hot reads, move slow work to queues, and size DB connection pools.',
        },
        {
          q: 'What is the difference between liveness and readiness probes?',
          a: 'Liveness checks if the process is alive; failing it restarts the container. Readiness checks if it can serve traffic now; failing it only removes it from the load balancer.',
        },
        {
          q: 'Why structured logging?',
          a: 'JSON logs with fields like requestId, userId, status and latency can be filtered and aggregated by log tools, unlike free-text logs. Request IDs connect all logs from one request across services.',
        },
        {
          q: 'What metrics would you watch for a Node service?',
          a: 'Request rate, error rate, p95/p99 latency (the RED metrics), event loop delay, heap and RSS memory, CPU, DB pool usage, and queue depth.',
        },
      ],
      spoken: `"To run Node in production I keep services stateless — sessions and caches in Redis, files in S3 — so I can scale horizontally behind a load balancer, with more pods or PM2 cluster mode on VMs. I expose separate liveness and readiness endpoints; readiness checks the database and goes false during shutdown. I log JSON with pino and attach a request ID to every line, and I watch error rate, p99 latency, event loop delay and memory. Every outbound call has a timeout, DB pools are sized for the number of instances, and slow work goes to a queue."`,
      mistakes: [
        'Storing sessions or uploaded files on the local instance, breaking as soon as there are two instances.',
        'Making the liveness probe check the database — a DB blip restarts every pod at the same time.',
        'Ignoring connection pool math when scaling out (instances × pool size).',
        'No timeouts on outbound HTTP calls, so one slow dependency piles up requests until memory runs out.',
        'Follow-up trap: "Your API is slow only at peak hours. What do you check first?" Metrics before guessing: p99 latency per route, event loop delay, DB slow-query logs and pool wait time, and third-party latency.',
      ],
      takeaway: 'Stateless + horizontal scaling + health checks + structured logs + timeouts = a Node service you can run at scale.',
    },
  ],
  rapidFire: [
    { q: 'What is Node.js in one line?', a: 'A JavaScript runtime built on V8 and libuv for running JS on the server with non-blocking I/O.' },
    { q: 'What does V8 do?', a: 'Compiles and runs JavaScript, and manages the heap and garbage collection.' },
    { q: 'What does libuv do?', a: 'Provides the event loop, async I/O on top of the OS, and the thread pool.' },
    { q: 'Is Node single-threaded?', a: 'Your JS runs on one main thread; libuv and V8 use extra threads behind the scenes.' },
    { q: 'Default libuv thread pool size?', a: '4 threads, changeable with `UV_THREADPOOL_SIZE` at startup.' },
    { q: 'Name things that use the thread pool.', a: 'Most fs calls, dns.lookup, async pbkdf2/scrypt/randomBytes, and async zlib.' },
    { q: 'Do HTTP and DB sockets use the thread pool?', a: 'No, network I/O uses OS mechanisms like epoll, kqueue or IOCP.' },
    { q: 'List the event loop phases.', a: 'Timers, pending callbacks, idle/prepare, poll, check, close callbacks.' },
    { q: 'When do microtasks run?', a: 'After every callback: the nextTick queue first, then promise microtasks.' },
    { q: 'nextTick or Promise.then — which runs first in CommonJS?', a: '`process.nextTick`.' },
    { q: 'setImmediate vs setTimeout(0) inside an I/O callback?', a: 'setImmediate always runs first there.' },
    { q: 'How do you yield to the event loop during CPU work?', a: 'Split the work into chunks and continue with `setImmediate`.' },
    { q: 'What blocks the event loop?', a: 'Long synchronous code: sync APIs, heavy loops, huge JSON parse/stringify, bad regexes.' },
    { q: 'CommonJS vs ESM in one line?', a: 'CJS is require/module.exports and sync; ESM is import/export, linked first, with live bindings and top-level await.' },
    { q: 'How does Node pick ESM for a .js file?', a: '`"type": "module"` in the nearest package.json.' },
    { q: 'How do you get __dirname in ESM?', a: '`path.dirname(fileURLToPath(import.meta.url))`, or `import.meta.dirname` in newer Node versions.' },
    { q: 'exports vs module.exports?', a: '`exports` is a shortcut to `module.exports`; re-assigning `exports` breaks the link.' },
    { q: 'npm install vs npm ci?', a: '`npm ci` installs exactly from the lock file and fails if it is out of sync — use it in CI.' },
    { q: 'What does ^1.2.3 allow?', a: 'Any 1.x.x version at or above 1.2.3, but not 2.0.0.' },
    { q: 'What does ~1.2.3 allow?', a: 'Only patch updates: 1.2.x at or above 1.2.3.' },
    { q: 'What does npm outdated show?', a: 'Current, Wanted (max allowed by your range) and Latest versions of each package.' },
    { q: 'How do you force a patched version of a nested dependency?', a: 'Use `overrides` in package.json (npm 8.3+).' },
    { q: 'Is npm audit fix --force safe?', a: 'No, it can install breaking majors; review and test first.' },
    { q: 'What type are process.env values?', a: 'Always strings (or undefined).' },
    { q: 'Which Node version added --env-file?', a: 'Node 20.6; Node 18 needs dotenv.' },
    { q: 'readFile vs createReadStream?', a: 'readFile loads everything into memory; a stream reads in chunks with steady memory.' },
    { q: 'Four stream types?', a: 'Readable, Writable, Duplex, Transform.' },
    { q: 'What is backpressure?', a: 'Slowing a fast producer when the consumer is slow: write() returns false, then wait for drain.' },
    { q: 'Why pipeline() over pipe()?', a: 'pipeline forwards errors and destroys all streams on failure; pipe does not.' },
    { q: 'What is a Buffer?', a: 'A fixed-size chunk of raw bytes (a Uint8Array), stored outside the V8 heap.' },
    { q: 'Buffer.alloc vs allocUnsafe?', a: 'alloc zero-fills; allocUnsafe is faster but may contain old memory.' },
    { q: 'Is EventEmitter.emit async?', a: 'No, it calls listeners synchronously in order.' },
    { q: 'What happens if an "error" event has no listener?', a: 'Node throws it, which can crash the process.' },
    { q: 'What happens on an unhandled rejection since Node 15?', a: 'The process crashes by default.' },
    { q: 'Should uncaughtException keep the app running?', a: 'No — log, shut down cleanly, exit(1), and let a supervisor restart.' },
    { q: 'Operational vs programmer error?', a: 'Operational = expected runtime failure to handle; programmer = a bug to fix and restart on.' },
    { q: 'Does Express 4 catch rejected promises in async handlers?', a: 'No; use a wrapper or express-async-errors. Express 5 does.' },
    { q: 'spawn vs exec?', a: 'spawn streams output without a shell; exec buffers output and runs in a shell.' },
    { q: 'What is fork for?', a: 'Starting a Node script as a child process with an IPC message channel.' },
    { q: 'Cluster vs worker threads?', a: 'Cluster = more processes sharing a port for more requests; worker threads = CPU work off the main thread.' },
    { q: 'Do cluster workers share memory?', a: 'No — use Redis or a DB for shared state.' },
    { q: 'What does pm2 reload do?', a: 'Restarts cluster instances one by one for zero downtime.' },
    { q: 'Which signal do Docker and Kubernetes send to stop a container?', a: 'SIGTERM, then SIGKILL after the grace period.' },
    { q: 'Why not start containers with npm start?', a: 'npm may not forward SIGTERM to Node, so graceful shutdown never runs.' },
    { q: 'How should you store passwords?', a: 'With a slow salted hash: bcrypt, argon2 or scrypt.' },
    { q: 'How do you compare signatures safely?', a: 'With `crypto.timingSafeEqual` on equal-length Buffers.' },
    { q: 'Secure random token in Node?', a: '`crypto.randomBytes(32).toString(\'hex\')` or `crypto.randomUUID()`.' },
    { q: 'What is AsyncLocalStorage for?', a: 'Keeping per-request context like a request ID across async calls.' },
    { q: 'How do you raise the V8 heap limit?', a: '`--max-old-space-size=<MB>`, usually via NODE_OPTIONS.' },
    { q: 'Common Node memory leak causes?', a: 'Unbounded caches, listeners never removed, intervals never cleared, closures holding big objects.' },
    { q: 'How do you find a memory leak?', a: 'Compare heap snapshots over time and follow the retainers of growing objects.' },
    { q: 'What does --inspect-brk do?', a: 'Starts the inspector and pauses on the first line.' },
    { q: 'Why was Node 16 EOL early?', a: 'Its OpenSSL 1.1.1 dependency reached EOL, so Node 16 ended on 11 Sept 2023.' },
    { q: 'What causes ERR_OSSL_EVP_UNSUPPORTED?', a: 'OpenSSL 3 (Node 17+) disabling legacy algorithms like MD4, often used by webpack 4.' },
    { q: 'Temporary fix for ERR_OSSL_EVP_UNSUPPORTED?', a: '`NODE_OPTIONS=--openssl-legacy-provider` — the real fix is upgrading the tool.' },
    { q: 'Was fetch stable in Node 18?', a: 'No, it was global but experimental; stable in Node 21.' },
    { q: 'Was node:test stable in Node 18?', a: 'No, experimental in 18; stable in Node 20.' },
    { q: 'Why might localhost fail after moving to Node 18?', a: 'Since Node 17, localhost may resolve to IPv6 ::1 first; use 127.0.0.1 or --dns-result-order=ipv4first.' },
    { q: 'What files pin the Node version for a project?', a: '.nvmrc, the engines field, Docker base images and CI config.' },
    { q: 'Liveness vs readiness?', a: 'Liveness failing restarts the container; readiness failing only stops traffic to it.' },
  ],
};
