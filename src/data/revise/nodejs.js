// Revise MERN: Node.js. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'nodejs',
  icon: '🟩',
  title: 'Node.js',
  note: 'Runtime internals, the event loop, async I/O, streams, modules, scaling and production habits.',
  items: [
    {
      q: 'What is Node.js and why is it used for backends?',
      a: `Node.js is a **JavaScript runtime** built on Chrome's **V8 engine** that lets you run JavaScript outside the browser, mainly for servers and tooling. It is not a framework or a language.

It is popular for backends because it uses **non-blocking, event-driven I/O**, so one process can handle thousands of concurrent connections cheaply. That fits I/O-heavy work like REST APIs, real-time apps and proxies. You also get one language across the stack and a huge npm ecosystem. It is a weaker fit for long CPU-heavy work, unless you move that to worker threads.`,
    },
    {
      q: 'Node.js is single-threaded. How does it handle many requests at once?',
      a: `Your JavaScript runs on **one main thread**, but Node does not wait on I/O. When you read a file or query a database, Node hands the work to the OS or the **libuv** thread pool and moves on. When the result is ready, a callback is queued, and the **event loop** runs it on the main thread.

So concurrency comes from never blocking, not from many threads. The catch is that if your own code blocks the thread, for example a heavy loop or \`JSON.parse\` on a huge payload, every other request waits.`,
    },
    {
      q: 'Explain the event loop and its phases.',
      a: `The **event loop** is the loop that keeps picking up completed work and running its callbacks. Each turn goes through phases in order:

**timers** (\`setTimeout\`/\`setInterval\` callbacks), **pending callbacks** (some deferred system errors), **idle/prepare** (internal), **poll** (wait for and run I/O callbacks), **check** (\`setImmediate\`), and **close callbacks** (like a socket \`close\` event). Between each callback, Node drains the **microtask queues**: first \`process.nextTick\`, then resolved promises. That is why a promise \`.then\` runs before a \`setTimeout(fn, 0)\`.`,
    },
    {
      q: 'What is the difference between process.nextTick, setImmediate and setTimeout?',
      a: `\`process.nextTick\` runs the callback **right after the current operation**, before any promise microtasks and before the event loop continues. \`setImmediate\` runs in the **check phase**, after the poll phase of the current loop turn. \`setTimeout(fn, 0)\` runs in the **timers phase**, at least about 1ms later.

Inside an I/O callback, \`setImmediate\` always fires before \`setTimeout(0)\`; from the main module their order is not guaranteed. Overusing \`nextTick\` recursively can **starve the event loop**, so \`setImmediate\` or a promise is usually the safer choice.`,
    },
    {
      q: 'What is non-blocking I/O, and what blocks the event loop?',
      a: `**Non-blocking I/O** means Node starts an I/O operation and immediately continues, getting the result later through a callback, promise or event. The thread is never stuck waiting for disk or network.

Things that block the loop are synchronous or CPU-heavy work: \`fs.readFileSync\` in a request path, big loops, heavy crypto with sync APIs, regex with catastrophic backtracking, or parsing huge JSON. To fix it, use async APIs, break work into chunks, stream data, or move CPU work to **worker threads** or a separate service.`,
    },
    {
      q: 'What is libuv and what does its thread pool do?',
      a: `**libuv** is the C library under Node that provides the event loop and cross-platform async I/O. Network I/O mostly uses the OS's own async mechanisms (epoll, kqueue, IOCP), so it does not need threads.

For things the OS cannot do asynchronously, libuv uses a **thread pool**, 4 threads by default, set with \`UV_THREADPOOL_SIZE\`. It handles file system calls, \`dns.lookup\`, some \`crypto\` functions like \`pbkdf2\` and \`scrypt\`, and \`zlib\`. If many slow file or crypto calls happen at once, they queue up behind those 4 threads.`,
    },
    {
      q: 'Callbacks vs promises vs async/await in Node?',
      a: `All three handle async results. **Callbacks** were the original style, with the error-first convention \`(err, data)\`, but nesting them leads to "callback hell" and messy error handling. **Promises** represent a future value and can be chained, with one \`.catch\` for errors. **async/await** is syntax on top of promises that makes async code read like sync code, with normal \`try/catch\`.

Today I use async/await everywhere, \`Promise.all\` for parallel work, and \`util.promisify\` or the \`fs/promises\`-style APIs when an old library only has callbacks.`,
    },
    {
      q: 'How do you handle errors in Node, including unhandled rejections?',
      a: `For async/await I use **try/catch**, and in a framework I pass errors to one central handler rather than catching everywhere. Operational errors (bad input, DB down) are handled and returned cleanly; programmer errors (bugs) should crash and restart.

Since Node 15, an **unhandled promise rejection crashes the process** by default. I add \`process.on('unhandledRejection')\` and \`process.on('uncaughtException')\` handlers only to **log and exit gracefully**, not to keep running, because the app may be in a broken state. A process manager or container orchestrator then restarts it.`,
    },
    {
      q: 'What are streams, and what is backpressure?',
      a: `**Streams** process data in chunks instead of loading it all into memory. There are four types: **Readable**, **Writable**, **Duplex** (both, like a TCP socket) and **Transform** (modify data as it passes, like gzip). They are great for big files, uploads and proxying.

**Backpressure** happens when the reader is faster than the writer. \`write()\` returns \`false\` when the buffer is full, and you should wait for the \`drain\` event. The easy way is \`stream.pipeline()\`, which handles backpressure and also cleans up and forwards errors from every stream.`,
    },
    {
      q: 'Cluster module vs worker threads?',
      a: `**Cluster** forks multiple **separate Node processes** that share the same server port, usually one per CPU core. Each has its own memory and event loop, so it scales an HTTP server across cores. In practice PM2, Kubernetes or ECS often do this job instead.

**Worker threads** run JavaScript in **threads inside one process**. They can share memory with \`SharedArrayBuffer\` and talk with messages. They are meant for **CPU-heavy tasks** like image processing or big calculations, so the main event loop stays free. Short version: cluster for scaling requests, workers for CPU work.`,
    },
    {
      q: 'CommonJS vs ES Modules in Node?',
      a: `**CommonJS** uses \`require\` and \`module.exports\`, loads modules **synchronously**, and was Node's original system. **ES Modules** use \`import\`/\`export\`, are the JavaScript standard, are statically analysable (good for tree-shaking) and support **top-level await**.

You enable ESM with \`"type": "module"\` in package.json or the \`.mjs\` extension. In ESM there is no \`__dirname\` by default; you use \`import.meta.dirname\` or \`import.meta.url\`. ESM can import CommonJS, and newer Node versions (22+) can also \`require()\` synchronous ES modules, which made mixing much easier.`,
    },
    {
      q: 'What is a Buffer?',
      a: `A **Buffer** is Node's way to handle **raw binary data**, a fixed-size chunk of memory outside the V8 heap. It is a subclass of \`Uint8Array\`. You meet it when reading files, network packets, images or crypto output.

You create one with \`Buffer.from('hi')\` or \`Buffer.alloc(10)\`, and convert with \`buf.toString('utf8')\` or \`'base64'\`. Avoid the old \`new Buffer()\` and be careful with \`Buffer.allocUnsafe\`, which is faster but may contain old memory until you overwrite it.`,
    },
    {
      q: 'What is the EventEmitter?',
      a: `**EventEmitter** is the class in the \`events\` module that implements the **publish/subscribe pattern**. You register listeners with \`on\` or \`once\`, and trigger them with \`emit\`. Streams, HTTP servers and sockets are all EventEmitters underneath.

Listeners run **synchronously** in the order they were added. If you emit an \`'error'\` event with no listener, Node throws and can crash the process. If you keep adding listeners without removing them, you get a "MaxListenersExceeded" warning, which usually points to a **memory leak**.`,
    },
    {
      q: 'How do you manage environment variables and config?',
      a: `Config like DB URLs, API keys and ports go in **environment variables**, read through \`process.env\`, never hard-coded or committed. Locally I use a \`.env\` file, which Node 20.6+ can load directly with \`--env-file\`, or the \`dotenv\` package.

I validate all config **once at startup**, for example with Zod, so the app fails fast if something is missing. In production, secrets come from a secret manager or the platform, like AWS Secrets Manager or SSM; on SkillKeepr the Lambda environment was configured through the Serverless Framework.`,
    },
    {
      q: 'What is graceful shutdown and how do you implement it?',
      a: `**Graceful shutdown** means that when the process is told to stop, it finishes in-flight work before exiting, instead of dropping requests. Containers and orchestrators send **SIGTERM** first.

On \`SIGTERM\` I stop accepting new connections with \`server.close()\`, let current requests finish, close the database and queue connections, then \`process.exit(0)\`. I also add a timeout that force-exits if cleanup hangs. During deploys, combined with a load balancer health check, this gives zero dropped requests.`,
    },
    {
      q: 'How do you find and fix memory leaks in Node?',
      a: `Signs of a leak are memory that keeps growing over hours and never drops after GC, then an out-of-memory crash. Common causes are **global caches without limits**, **event listeners never removed**, timers not cleared, and closures holding big objects.

To find it, I watch \`process.memoryUsage()\` or APM graphs, take **heap snapshots** with \`--inspect\` and Chrome DevTools, and compare two snapshots to see which objects keep growing. Fixes are usually an LRU cache with a size limit, removing listeners, and clearing intervals.`,
    },
    {
      q: 'How do you scale a Node.js application?',
      a: `First, keep the app **stateless**: sessions in Redis or JWTs, files in S3, so any instance can serve any request. Then scale **horizontally**: more processes per machine (cluster or PM2) and more machines or containers behind a **load balancer**.

Beyond that: cache hot data in Redis, push slow work to **queues** with background workers, add DB indexes and read replicas, and serve static files from a CDN. On SkillKeepr we went serverless, so AWS Lambda scaled per request and heavy work went to SQS queues.`,
    },
    {
      q: 'What are package.json and package-lock.json for?',
      a: `**package.json** describes the project: name, scripts, and dependencies with **semver ranges** like \`^1.2.3\` (allow minor and patch updates) or \`~1.2.3\` (patch only). **package-lock.json** records the **exact version** of every installed package, including nested dependencies.

You commit the lock file so every machine and CI gets the same tree. In CI I use \`npm ci\`, which installs strictly from the lock file and fails if it does not match package.json. \`dependencies\` are needed at runtime; \`devDependencies\` only for build and tests.`,
    },
    {
      q: 'Have you upgraded a Node.js version? What did you check?',
      a: `Yes, on SkillKeepr I worked on the **Node 16 to 18** migration for our Lambda services, since Node 16 was reaching end of life.

The usual checklist: update the runtime in the deploy config, upgrade dependencies that had native modules or engine limits, run the full test suite, and look for behaviour changes. Node 18 brought a built-in global \`fetch\`, OpenSSL 3 (which can break old crypto settings), and an AWS SDK v3 default in the Lambda runtime. Then roll out service by service and watch the logs. Today I would target an LTS like Node 22.`,
    },
    {
      q: 'Is Node.js good for CPU-intensive tasks?',
      a: `Not on the main thread. Because all JavaScript runs on one thread, a CPU-heavy task like image resizing, PDF generation or a big sort **blocks every other request** until it finishes.

The options are: **worker threads** for in-process parallel work, a separate **background worker** fed by a queue, or a service in a better-suited language. You can also use native addons or WebAssembly. For an API server, I keep the request path I/O-only and push heavy work to queues.`,
    },
    {
      q: 'What is the difference between spawn, exec and fork in child_process?',
      a: `All three start a **child process**. \`spawn\` runs a command and gives you **streams** for stdout and stderr, so it is good for long-running or large-output commands. \`exec\` runs the command in a **shell** and buffers the whole output into a callback, which is simple but has a size limit and shell-injection risk with user input.

\`fork\` is a special \`spawn\` for **Node scripts** that sets up an **IPC channel**, so parent and child can \`send\` messages. The cluster module uses fork internally.`,
    },
    {
      q: 'What are some Node.js security best practices?',
      a: `Validate and sanitise all input, use parameterised queries to avoid injection, and never use \`eval\` or pass user input to \`exec\`. Keep dependencies updated and run \`npm audit\` in CI, since supply-chain attacks are real.

Store secrets in env vars or a secret manager, hash passwords with **bcrypt** or **argon2**, use HTTPS, set security headers, add rate limiting, and limit request body size. Run the process as a non-root user and do not leak stack traces in production error responses.`,
    },
    {
      q: 'How does Node.js handle concurrency compared to multi-threaded servers?',
      a: `Traditional servers like old Java or PHP setups often use **one thread per request**. Each thread uses memory and context switching, and threads sit idle while waiting on the database.

Node uses **one event loop** that handles thousands of connections, because most request time is spent waiting on I/O, not computing. That makes it very memory-efficient for I/O-bound APIs and WebSockets. The trade-off is that one slow synchronous function hurts everyone, while a thread-per-request server only slows that one request.`,
    },
    {
      q: 'What is the purpose of the global objects like process, __dirname and globalThis?',
      a: `\`process\` gives information and control over the current Node process: \`process.env\`, \`process.argv\`, \`process.exit\`, memory usage, and signal events like \`SIGTERM\`. \`__dirname\` and \`__filename\` give the current module's folder and file path in CommonJS; in ESM you use \`import.meta.dirname\` and \`import.meta.filename\`.

\`globalThis\` is the standard global object across browser and Node. Node also has web-standard globals now, like \`fetch\`, \`URL\`, \`AbortController\` and \`structuredClone\`.`,
    },
    {
      q: 'How do you debug and monitor a Node.js app in production?',
      a: `Locally I use \`node --inspect\` with Chrome DevTools or the VS Code debugger. In production I rely on **structured JSON logs** (pino or winston) with a request id, so I can trace one request across services.

On top of that: metrics like latency, error rate, memory and **event loop lag**, plus an APM or error tracker such as Sentry or Datadog. On AWS Lambda we used CloudWatch logs and alarms. For performance issues, a CPU profile or flame graph shows which functions block the loop.`,
    },
  ],
};
