// Revise MERN: Optimization. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'optimization',
  icon: '⚡',
  title: 'Optimization',
  note: 'Frontend and backend performance: measuring, React rendering, caching, databases, and scaling.',
  items: [
    {
      q: 'How do you approach a performance problem?',
      a: `**Measure first, then optimize.** I reproduce the issue, find the actual bottleneck with tools, fix the biggest one, and measure again to confirm it helped. Guessing usually wastes time on code that was never slow.

On the frontend I use Chrome DevTools Performance, Lighthouse and the React Profiler. On the backend I look at logs, response-time metrics, slow-query logs and database \`explain()\` plans. Then I decide whether the problem is the network, rendering, the API code or the database.`,
    },
    {
      q: 'How do you prevent unnecessary re-renders in React?',
      a: `A component re-renders when its state changes or its parent re-renders. To cut wasted renders: keep state as **close as possible** to where it is used, wrap pure child components in **React.memo**, and keep props stable with \`useCallback\` and \`useMemo\` so memo actually works.

Also avoid creating new objects or arrays inline as props, split large contexts, and select only the slice of the Redux store you need. With React 19 the **React Compiler** can do much of this memoization automatically, but you still need to understand why renders happen.`,
    },
    {
      q: 'What is the difference between useMemo, useCallback and React.memo?',
      a: `**useMemo** caches the result of an expensive calculation until its dependencies change. **useCallback** caches a function reference, so a child receiving it as a prop sees the same function each render.

**React.memo** wraps a component and skips re-rendering if its props are shallowly equal. They work together: memo on the child, useCallback for the function props. But they have a cost too, so I use them where profiling shows a real problem, not everywhere.`,
    },
    {
      q: 'What is code splitting and lazy loading?',
      a: `**Code splitting** breaks the JavaScript bundle into smaller chunks so the user only downloads what the current page needs. In React you do it with \`React.lazy\` and a dynamic \`import()\`, wrapped in \`Suspense\` for a loading fallback.

The usual place to start is **route-level splitting**, so the admin dashboard code is not shipped to someone on the login page. Heavy libraries like charts, editors or video SDKs are also good candidates to load only when needed.`,
    },
    {
      q: 'What are database indexes and how do they speed up queries?',
      a: `An **index** is a separate sorted data structure, usually a B-tree, that lets the database find matching rows without scanning the whole collection. Without one, MongoDB does a **COLLSCAN**; with one, an **IXSCAN**.

Index the fields you filter and sort on, and for compound indexes follow the **ESR rule**: equality, then sort, then range fields. The trade-off is that indexes use memory and slow down writes, so I add them based on real query patterns and check with \`explain()\`.`,
    },
    {
      q: 'What is the N+1 query problem?',
      a: `**N+1** is when you run one query to fetch a list, then one extra query **per item** to fetch related data, so 100 items means 101 database round trips. It is often hidden inside a loop or an ORM.

The fix is to fetch related data in **one batched query**: use \`$in\` with all the IDs, Mongoose \`populate\` (which batches), a \`$lookup\` aggregation, or a SQL JOIN. In GraphQL, a DataLoader solves the same thing by batching per request.`,
    },
    {
      q: 'Explain caching layers in a web application.',
      a: `Caching happens at several levels. The **browser cache** stores static files using \`Cache-Control\` and ETags. A **CDN** caches assets and sometimes API responses close to the user. An **application cache** like **Redis** stores hot data or computed results so you skip the database.

Finally the **database** has its own memory cache. The hard part is **invalidation**: use sensible TTLs, delete or update cache keys when data changes, and never cache user-specific data under a shared key.`,
    },
    {
      q: 'What are Core Web Vitals?',
      a: `Core Web Vitals are Google's main user-experience metrics. **LCP** (Largest Contentful Paint) measures loading, aim under 2.5 seconds. **INP** (Interaction to Next Paint) measures responsiveness to clicks and typing, aim under 200 ms; it replaced FID in 2024. **CLS** (Cumulative Layout Shift) measures visual stability, aim under 0.1.

To improve them: optimize the hero image and server response for LCP, break up long JavaScript tasks for INP, and reserve space for images and ads with set dimensions for CLS.`,
    },
    {
      q: 'What is pagination and which type would you use?',
      a: `Pagination returns data in **pages** instead of all at once, which keeps responses small and the database fast. **Offset pagination** uses \`skip\` and \`limit\`; it is simple and supports jumping to page 5, but gets slow on large offsets because the database still walks the skipped rows.

**Cursor pagination** uses the last seen value, like \`_id > lastId\`, with an index. It stays fast at any depth and is stable when new data is inserted, so I prefer it for feeds and infinite scroll, and offset for small admin tables.`,
    },
    {
      q: 'What blocks the Node.js event loop and how do you avoid it?',
      a: `Node runs your JavaScript on **one main thread**, so any long synchronous work blocks every other request. Typical culprits are heavy loops or JSON parsing on huge payloads, synchronous file or crypto APIs, and complex regexes.

To avoid it: use async APIs, process large data in **streams** or chunks, move CPU-heavy work to **worker threads** or a separate service, and push slow jobs to a **queue**. You can spot it by watching event-loop lag metrics.`,
    },
    {
      q: 'What are debouncing and throttling?',
      a: `**Debounce** waits until the user stops triggering an event for a set time, then runs once. It is perfect for search-as-you-type, so you call the API after typing pauses instead of on every keystroke.

**Throttle** runs at most once per time window, no matter how often the event fires, which suits scroll, resize or mouse-move handlers. Both reduce wasted work and API calls; on the server side, rate limiting plays a similar role.`,
    },
    {
      q: 'How do you reduce the bundle size of a React app?',
      a: `First **analyze** it with a tool like \`rollup-plugin-visualizer\` for Vite to see what is actually big. Then: code-split routes, replace heavy libraries with lighter ones, import only what you need so **tree shaking** works, and lazy-load rarely used features.

Also make sure the production build is minified and compressed, remove unused dependencies, and avoid shipping big JSON or polyfills you do not need. Measuring before and after keeps you honest.`,
    },
    {
      q: 'What is connection pooling?',
      a: `Opening a database connection is expensive, so a **connection pool** keeps a set of open connections and reuses them across requests. The MongoDB driver and Mongoose pool by default, and \`maxPoolSize\` controls the size.

In serverless it matters even more: you create the connection **outside the handler** so warm Lambda invocations reuse it, instead of reconnecting on every request. This matters a lot in a setup like SkillKeepr, Lambda plus one MongoDB database per company, where connection counts can grow quickly.`,
    },
    {
      q: 'What is list virtualization?',
      a: `**Virtualization**, or windowing, renders only the rows **currently visible** on screen plus a small buffer, instead of thousands of DOM nodes. As you scroll, rows are reused with new data.

Libraries like \`react-window\` or TanStack Virtual handle this. It is the right fix when a long list or table is slow, such as a large candidate list. If the data is huge, I combine it with server-side pagination or infinite loading so the client does not hold everything.`,
    },
    {
      q: 'How do you optimize images on a website?',
      a: `Use modern formats like **WebP or AVIF**, serve **responsive sizes** with \`srcset\` so phones do not download desktop images, and compress them. Lazy-load below-the-fold images with \`loading="lazy"\`.

Always set **width and height** to avoid layout shift, and serve images from a CDN. For the main hero image, do not lazy-load it; preload it or give it high fetch priority instead, because it is usually the LCP element.`,
    },
    {
      q: 'What is HTTP compression?',
      a: `The server compresses text responses like HTML, JS, CSS and JSON before sending them, and the browser decompresses them. **Gzip** is universal and **Brotli** usually compresses better. The browser says what it supports with \`Accept-Encoding\`.

Usually a CDN or reverse proxy like Nginx handles it, or the \`compression\` middleware in Express. It can cut text payloads by 70% or more. Images and videos are already compressed, so you skip them.`,
    },
    {
      q: 'When would you use a message queue or background job?',
      a: `When work is **slow, can fail, or does not need to finish before you reply**, like sending emails, generating reports, processing uploads, or calling third-party APIs. The API puts a job on a queue and returns quickly; a worker processes it separately.

You get faster responses, automatic retries, and smoothing of traffic spikes. Common tools are **BullMQ** with Redis, AWS **SQS**, or RabbitMQ. Make jobs **idempotent**, since a retry may run the same job twice.`,
    },
    {
      q: 'What are worker threads in Node.js?',
      a: `**Worker threads** let Node run JavaScript in parallel on separate threads, each with its own event loop. They are meant for **CPU-heavy** work like image processing, compression, or big calculations that would otherwise block the main thread.

They do not help much with I/O, because Node already handles I/O asynchronously. For many small tasks, a worker pool like Piscina is better than creating a new worker each time. The \`cluster\` module is different: it runs multiple processes to use all CPU cores for handling requests.`,
    },
    {
      q: 'What are Lambda cold starts and how do you reduce them?',
      a: `A **cold start** happens when AWS has to create a new execution environment: download your code, start the runtime and run your initialization, before handling the request. It adds latency, especially after idle periods or during scale-up.

To reduce it: keep the **bundle small**, avoid heavy work at init, reuse DB connections across invocations, and give the function more memory (which also gives more CPU). **Provisioned concurrency** keeps environments warm for critical paths. This was a real concern on SkillKeepr, since all services ran on Lambda.`,
    },
    {
      q: 'What is horizontal vs vertical scaling?',
      a: `**Vertical scaling** means a bigger machine: more CPU and RAM. It is simple but has a ceiling and a single point of failure. **Horizontal scaling** means more machines behind a **load balancer**, which can grow much further and survives one server dying.

Horizontal scaling needs **stateless** servers: sessions in Redis or JWTs, files in S3, not on local disk. OCTAGNT ran as Docker containers on ECS, which fits this model: you scale out by running more tasks.`,
    },
    {
      q: 'What is a CDN and how does it improve performance?',
      a: `A **Content Delivery Network** is a network of servers around the world that caches your content at locations **close to users**. A user in Chennai gets files from a nearby edge server instead of a far-away origin, so latency drops.

It also takes load off your origin server, absorbs traffic spikes, and often adds compression, HTTP/2 or HTTP/3, and DDoS protection. Static assets with **hashed filenames** can be cached for a very long time, since a new build changes the name.`,
    },
    {
      q: 'What is load testing and which tools have you used or would use?',
      a: `**Load testing** simulates many users hitting your system to find its limits and bottlenecks before real users do. You watch latency percentiles like **p95 and p99**, error rate and throughput as load increases.

Common tools are **k6**, Artillery, JMeter and autocannon for quick Node checks. Variants include stress tests (push until it breaks), spike tests, and soak tests (steady load for hours to catch memory leaks). Always test against a staging environment similar to production.`,
    },
    {
      q: 'How do you optimize a slow MongoDB query?',
      a: `Run it with \`explain("executionStats")\` and compare **documents examined** with documents returned; a big gap means a missing or wrong index. Then add or fix a compound index that matches the filter and sort.

Other wins: use **projection** to return only needed fields, use \`.lean()\` in Mongoose to skip document hydration for read-only data, put \`$match\` early in aggregations, and avoid unbounded arrays inside documents. The database profiler helps find slow queries in the first place.`,
    },
    {
      q: 'How do you find and fix a memory leak in Node.js?',
      a: `Signs are memory that keeps growing until the process crashes or restarts. I take **heap snapshots** at different times with Chrome DevTools via \`--inspect\` and compare which objects keep growing.

Common causes are global arrays or caches that never get cleaned, event listeners added but never removed, timers not cleared, and closures holding big objects. Fixes are bounded caches with an LRU or TTL, removing listeners, and clearing intervals.`,
    },
    {
      q: 'How does server-side rendering help performance?',
      a: `With **SSR**, the server sends ready HTML, so the user sees content faster and search engines can read it, which helps **LCP and SEO**. With pure client-side rendering, the browser must download and run JavaScript before showing anything.

The trade-off is more server work and complexity, plus hydration cost on the client. Frameworks like Next.js also offer static generation and React Server Components, which ship less JavaScript. For a logged-in dashboard, client rendering with good code splitting is often enough.`,
    },
  ],
};
