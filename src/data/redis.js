// Redis, Caching & CAP — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.
// All Node examples use the ioredis package:  import Redis from 'ioredis';

export default {
  id: 'redis',
  title: 'Redis, Caching & CAP',
  icon: '🟥',
  description: 'Redis data structures and the caching patterns built on them: cache-aside, TTL, eviction, invalidation, rate limiting, sessions, locks, persistence — plus the CAP theorem for distributed systems questions.',
  definitionTitle: 'What is Redis?',
  definition: `**Redis** is an **in-memory data store**. It keeps data in RAM instead of on disk, so reads and writes take well under a millisecond. It stores keys with values that can be strings, lists, sets, sorted sets, hashes and more.

We use it mainly as a **cache** (to avoid hitting the database again), for **sessions**, **rate limiting**, queues and **pub/sub** messaging. This stack also covers caching strategies and the **CAP theorem**, the rule about what a distributed system can guarantee when the network fails.

**One-line answer:** "Redis is an in-memory key-value data store with rich data structures, used for caching, sessions, rate limiting, queues and pub/sub because it's extremely fast."`,
  topics: [
    {
      id: 'what-is-redis-data-structures',
      title: 'What Redis Is and Its Data Structures',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Redis is an in-memory key-value store with rich data types — strings, hashes, lists, sets, sorted sets and streams — used for caching, counters, queues and leaderboards.',
      what: `**Redis** (REmote DIctionary Server) is a database that keeps data **in memory (RAM)**, so reads and writes take well under a millisecond. Every piece of data is stored under a **key** (a string like \`user:42\`).

The value can be one of several **data structures**:

- **String** — text, a number, or bytes. Caching JSON, counters (\`INCR\`).
- **Hash** — a small object of field → value pairs. A user profile: \`HSET user:42 name Asha plan pro\`.
- **List** — an ordered list; push/pop from both ends. Simple queues, recent items.
- **Set** — unique, unordered values. Tags, "users online", deduplication.
- **Sorted set (ZSET)** — unique values each with a **score**, kept sorted by score. Leaderboards, rate limiting, scheduling.
- **Stream** — an append-only log of events with consumer groups. Event processing, activity feeds.

Others: bitmaps, HyperLogLog (approximate unique counts), geospatial indexes, and (with modules or newer versions) JSON and vector search.

#### Deeper version
**Why so fast?** Data is in RAM, data structures are simple and efficient, and commands run on a **single main thread** — no locks needed, and each command is **atomic**. (Since Redis 6, network I/O can use extra threads, but commands still execute one at a time.) The downside: one slow command (\`KEYS *\`, a huge \`SMEMBERS\`) blocks everyone. Use \`SCAN\` instead of \`KEYS\`.

Complexity matters: \`GET\`/\`SET\`/\`HGET\` are O(1); sorted set adds are O(log N).

Redis can also persist to disk (RDB/AOF), replicate, and run as a cluster — but RAM is still the limit, so it is usually a **cache or fast side-store**, not the main source of truth.

**Licensing note:** Redis changed its license in 2024, and the Linux Foundation started an open-source fork called **Valkey**, which many cloud providers now offer. Commands are compatible. The license situation has changed again since, so check the current details if it matters for your project.`,
      why: `Databases like Postgres or MongoDB read from disk and do much more work per query. Redis gives you a super-fast layer for things that are read often or change constantly: caches, sessions, counters, rate limits, leaderboards, queues and real-time messaging.`,
      analogy: `Postgres is a big warehouse: it holds everything safely but fetching takes time. Redis is the small shelf right next to the shop counter, holding the items customers ask for most. It's tiny compared to the warehouse, but grabbing from it is instant.`,
      code: [
        {
          title: 'Each data structure with ioredis',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL); // e.g. redis://localhost:6379

// String: cache + counter
await redis.set('greeting', 'hello');
await redis.incr('page:home:views');                 // atomic +1

// Hash: object-like
await redis.hset('user:42', { name: 'Asha', plan: 'pro' });
console.log(await redis.hgetall('user:42'));         // { name: 'Asha', plan: 'pro' }

// List: queue (push left, pop right)
await redis.lpush('emails', 'job1', 'job2');
console.log(await redis.rpop('emails'));             // 'job1'

// Set: unique values
await redis.sadd('online', 'u1', 'u2', 'u1');
console.log(await redis.scard('online'));            // 2

// Sorted set: leaderboard
await redis.zadd('leaderboard', 300, 'asha', 450, 'ravi', 120, 'meera');
console.log(await redis.zrevrange('leaderboard', 0, 1, 'WITHSCORES'));
// [ 'ravi', '450', 'asha', '300' ]

// Stream: append-only event log
await redis.xadd('orders:events', '*', 'type', 'created', 'orderId', '101');
console.log(await redis.xrange('orders:events', '-', '+'));`,
        },
        {
          title: 'Same ideas in redis-cli',
          lang: 'bash',
          code: `SET greeting hello
INCR page:home:views
HSET user:42 name Asha plan pro
HGETALL user:42
ZADD leaderboard 300 asha 450 ravi
ZREVRANGE leaderboard 0 9 WITHSCORES
SCAN 0 MATCH user:* COUNT 100   # safe iteration (never KEYS * in production)`,
        },
      ],
      output: `The counter goes up by one atomically, even if many servers call \`INCR\` at once. \`hgetall\` returns the user as a plain object (all values come back as **strings**). The list behaves like a queue: the first pushed job (\`job1\`) is popped first from the right. The set ignores the duplicate \`u1\`, so its size is 2. The leaderboard returns the top two with scores, highest first. The stream returns entries with auto-generated ids like \`1767225600000-0\` (a millisecond timestamp plus a sequence number).`,
      questions: [
        {
          q: 'What is Redis and why is it fast?',
          a: 'An in-memory key-value data store. It is fast because data lives in RAM, its data structures are efficient, and commands run on a single thread without locking overhead.',
        },
        {
          q: 'Which Redis data structure would you use for a leaderboard?',
          a: 'A sorted set: `ZADD` / `ZINCRBY` to update scores and `ZREVRANGE` (or `ZRANGE ... REV`) to read the top N, all in O(log N).',
        },
        {
          q: 'Is Redis single-threaded?',
          a: 'Command execution is single-threaded, so each command is atomic. Newer versions use extra threads for network I/O and background tasks like persistence.',
        },
        {
          q: 'Why should you never run KEYS * in production?',
          a: 'It scans every key in one blocking command, freezing Redis for all clients. Use `SCAN`, which iterates in small batches.',
        },
        {
          q: 'Hash vs a JSON string for storing an object?',
          a: 'A hash lets you read or update single fields (`HGET`, `HINCRBY`) without rewriting the whole object. A JSON string is simpler when you always read and write the whole thing.',
        },
      ],
      spoken: `"Redis is an in-memory key-value store, so reads and writes are typically sub-millisecond. It's fast because everything is in RAM and commands run one at a time on a single thread, which also makes every command atomic. Beyond plain strings it has hashes for objects, lists for simple queues, sets for unique values, sorted sets for leaderboards and rate limiting, and streams for event logs. I mostly use it as a cache and for counters, sessions and rate limits, not as the source of truth. And I never run KEYS in production — I use SCAN."`,
      mistakes: [
        'Treating Redis as the main database for important data without thinking about persistence and memory limits.',
        'Running `KEYS *` or fetching huge collections in one command, which blocks the single thread.',
        'Forgetting that values come back as strings — `"5"`, not `5` — so parse numbers and JSON.',
        'Storing big blobs (MBs) per key. Large values slow the network and block other commands.',
        'Follow-up trap: "If Redis is single-threaded, how does it handle thousands of clients?" It uses an event loop with non-blocking I/O (like Node.js); each command is tiny, so one thread can serve a huge number of requests per second.',
      ],
      takeaway: 'Redis is RAM-speed key-value storage with smart data types — pick the right structure and never block its single thread.',
    },
    {
      id: 'ttl-expiry',
      title: 'TTL and Key Expiry',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A TTL (time to live) makes a key delete itself after some seconds — the simplest way to keep a cache fresh and bounded.',
      what: `**TTL** = Time To Live: how long a key should exist before Redis deletes it automatically.

- Set with the value: \`SET key value EX 60\` (60 seconds) or \`PX 60000\` (milliseconds).
- Add later: \`EXPIRE key 60\`.
- Check: \`TTL key\` → seconds left. \`-1\` = no expiry. \`-2\` = key does not exist.
- Remove expiry: \`PERSIST key\`.

#### Deeper version
**How Redis expires keys:**
- **Lazy (passive)** — when you access an expired key, Redis deletes it and returns nothing.
- **Active** — a background job regularly samples keys that have a TTL and deletes expired ones.
So an expired key may still use memory for a short time, but you will never read it.

**Gotchas:**
- A plain \`SET\` on an existing key **removes its TTL** unless you pass a new one (or use \`KEEPTTL\`, Redis 6+).
- \`INCR\`, \`HSET\`, \`LPUSH\` etc. keep the existing TTL.
- TTL is per **key**, not per field. A hash field cannot expire on its own in older versions (newer Redis versions added hash-field expiry — check the docs for your version).

**TTL jitter:** if you cache 10,000 keys with exactly 3600 seconds, they all expire at the same moment and the database gets slammed. Add a random few percent to each TTL.

Choosing a TTL is a business decision: how stale can this data be? Prices: seconds. Product descriptions: hours. Feature flags: a minute.`,
      why: `Without TTLs a cache grows forever and serves stale data forever. TTL is the safety net: even if your invalidation code has a bug, the wrong data disappears on its own.`,
      analogy: `A TTL is the "best before" date on milk. You don't need to remember to throw it away — after the date, the fridge (Redis) removes it automatically, and next time you need milk you buy fresh (load from the database).`,
      code: [
        {
          title: 'Setting and reading TTLs',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

await redis.set('otp:asha@x.com', '482913', 'EX', 300);  // OTP valid for 5 minutes
console.log(await redis.ttl('otp:asha@x.com'));          // 300 (counting down)

await redis.set('otp:asha@x.com', '111111');             // overwrite WITHOUT EX...
console.log(await redis.ttl('otp:asha@x.com'));          // -1  -> TTL was removed!

await redis.set('otp:asha@x.com', '222222', 'KEEPTTL');  // Redis 6+: keep the old TTL
console.log(await redis.ttl('missing-key'));             // -2  -> key does not exist`,
        },
        {
          title: 'TTL with jitter to avoid mass expiry',
          lang: 'javascript',
          code: `// Base TTL of 1 hour plus up to 10% random extra
function ttlWithJitter(baseSeconds = 3600, jitterRatio = 0.1) {
  const extra = Math.floor(Math.random() * baseSeconds * jitterRatio);
  return baseSeconds + extra;
}

async function cacheProduct(product) {
  await redis.set(
    'product:' + product.id,
    JSON.stringify(product),
    'EX',
    ttlWithJitter()
  );
}`,
        },
      ],
      output: `The OTP starts with a 300-second TTL. Overwriting it with a plain \`SET\` silently removes the TTL (\`-1\`), so the OTP would live forever — a security bug. \`KEEPTTL\` keeps the remaining time. A missing key returns \`-2\`.

With jitter, products cached at the same moment expire spread over about 6 minutes instead of all at once, so the database sees a gentle trickle of reloads instead of a spike.`,
      questions: [
        {
          q: 'How do you set an expiry in Redis?',
          a: '`SET key value EX seconds` (or `PX` for milliseconds) in one command, or `EXPIRE key seconds` on an existing key.',
        },
        {
          q: 'What do TTL return values -1 and -2 mean?',
          a: '`-1`: the key exists but has no expiry. `-2`: the key does not exist.',
        },
        {
          q: 'How does Redis delete expired keys?',
          a: 'Lazily when a key is accessed, plus an active background cycle that samples keys with TTLs and removes expired ones.',
        },
        {
          q: 'Why add jitter to TTLs?',
          a: 'So many keys cached at the same time do not all expire together and cause a burst of database load (a stampede).',
        },
      ],
      spoken: `"A TTL is how long a key lives before Redis deletes it. I usually set it in the same command with SET key value EX seconds, so there's no gap where the key exists without an expiry. Redis removes expired keys lazily when they're accessed and also with a background sampling job. One gotcha: a plain SET overwrites and removes the TTL, unless I use KEEPTTL. I pick TTLs based on how stale the data can be, and I add random jitter so thousands of keys don't expire at the same instant and hammer the database."`,
      mistakes: [
        'Doing `SET` then `EXPIRE` as two commands — if the app crashes between them, the key never expires. Use `SET ... EX`.',
        'Overwriting a key with plain `SET` and accidentally removing its TTL.',
        'Using the same fixed TTL for a huge batch of keys, causing synchronized expiry.',
        'Caching data with no TTL at all and relying only on manual invalidation.',
        'Follow-up trap: "Does an expired key free memory immediately?" Not always — it is removed when accessed or when the active expiry cycle finds it, so memory is reclaimed shortly after, not instantly.',
      ],
      takeaway: 'Always set TTLs atomically with SET … EX, add jitter, and remember plain SET wipes the TTL.',
    },
    {
      id: 'cache-aside',
      title: 'Cache-Aside (Lazy Loading)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'The app checks Redis first; on a miss it reads the database, stores the result in Redis with a TTL, and returns it. On writes it updates the DB and deletes the cache key.',
      what: `**Cache-aside** is the most common caching pattern. The **application** manages the cache itself:

**Read:**
1. Look in Redis.
2. **Hit** → return it.
3. **Miss** → read from the database, save it in Redis with a TTL, return it.

**Write:**
1. Update the database.
2. **Delete** the cache key (so the next read loads fresh data).

It is called "lazy loading" because data enters the cache only when someone asks for it.

#### Deeper version
**Delete, don't update**, on writes. If two writers update the cache with their own values, a slower one can overwrite the newer value. Deleting is simpler and safer.

Even delete-on-write has a small race: reader A misses, reads the **old** value from the DB; writer B updates the DB and deletes the key; then reader A writes the **old** value into the cache. A TTL limits how long that stale value lives. Some teams also do a **delayed second delete** (delete again a moment later).

**Cache negative results** (like "user not found") for a short TTL, otherwise attackers can hammer the DB with ids that don't exist (**cache penetration**).

**Pros:** only requested data is cached; if Redis is down the app still works (slower). **Cons:** the first request is always a miss (cold cache), and data can be stale until TTL or invalidation.`,
      why: `Most apps read far more than they write. Cache-aside takes the repeated reads off the database, cutting latency from tens of milliseconds to about one, and lets the database handle more traffic without scaling up.`,
      analogy: `It is like a chef with a small prep counter. When an order comes in, they first check the counter (cache). If the sauce is there, they use it. If not, they go to the storeroom (database), bring some back, and leave the extra on the counter for the next order. When the recipe changes, they throw away the old sauce on the counter.`,
      code: [
        {
          title: 'Cache-aside read and write with ioredis',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
import pg from 'pg';
const redis = new Redis(process.env.REDIS_URL);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const key = (id) => 'product:' + id;

export async function getProduct(id) {
  // 1. Try the cache
  const cached = await redis.get(key(id));
  if (cached) return JSON.parse(cached);              // cache HIT

  // 2. Miss: load from the database
  const { rows } = await pool.query('SELECT id, name, price FROM products WHERE id = $1', [id]);
  const product = rows[0] ?? null;

  // 3. Store with a TTL (cache "not found" briefly to stop repeated misses)
  await redis.set(key(id), JSON.stringify(product), 'EX', product ? 3600 : 60);
  return product;
}

export async function updateProductPrice(id, price) {
  await pool.query('UPDATE products SET price = $1 WHERE id = $2', [price, id]);
  await redis.del(key(id));                           // invalidate, don't update
}`,
        },
        {
          title: 'Do not let a Redis outage take the site down',
          lang: 'javascript',
          code: `async function safeGet(k) {
  try {
    return await redis.get(k);
  } catch (err) {
    console.warn('Redis unavailable, falling back to DB', err.message);
    return null;                                      // treat as a cache miss
  }
}`,
        },
      ],
      output: `The first \`getProduct(7)\` call misses, queries Postgres (say 20 ms) and caches the result for an hour. Following calls return from Redis in about 1 ms. After \`updateProductPrice(7, 499)\`, the key is deleted, so the next read misses once and caches the new price.

An unknown id is cached as \`null\` for 60 seconds, so a bot asking for id 999999 again and again does not hit the database each time. With \`safeGet\`, if Redis goes down, requests just become cache misses instead of errors.`,
      questions: [
        {
          q: 'Explain the cache-aside pattern.',
          a: 'The app reads from the cache first; on a miss it loads from the database and writes the result to the cache with a TTL. On updates it writes to the database and deletes the cache key.',
        },
        {
          q: 'On a write, should you update the cache or delete it?',
          a: 'Usually delete. Updating can leave the wrong value if concurrent writes finish out of order; deleting forces the next read to load fresh data.',
        },
        {
          q: 'What happens if Redis goes down with cache-aside?',
          a: 'Reads fall back to the database, so the app still works but slower — as long as you handle Redis errors as misses and the database can survive the extra load.',
        },
        {
          q: 'What is cache penetration and how do you prevent it?',
          a: 'Repeated requests for keys that do not exist, so they always miss and hit the DB. Prevent it by caching "not found" with a short TTL, validating ids, or using a Bloom filter.',
        },
      ],
      spoken: `"Cache-aside, or lazy loading, is the pattern I use most. On a read, my code checks Redis first; on a hit it returns immediately, and on a miss it reads the database, stores the result with a TTL, and returns it. On a write I update the database and delete the cache key rather than updating it, which avoids out-of-order write bugs. I also cache 'not found' briefly to stop repeated misses, and wrap Redis calls so an outage just becomes a cache miss. The trade-off is a cold first request and possible staleness until the TTL."`,
      mistakes: [
        'Deleting the cache **before** updating the database — a reader can re-cache the old value in between. Update DB first, then delete.',
        'Caching without a TTL, so any missed invalidation means stale data forever.',
        'Letting Redis errors crash the request instead of falling back to the database.',
        'Caching user-specific data under a shared key (like `cart`) and leaking it to other users. Include the user id in the key.',
        'Follow-up trap: "Is cache-aside strongly consistent?" No. There are short windows where the cache holds stale data; TTLs bound how long. If you need strict consistency, read from the database.',
      ],
      takeaway: 'Cache-aside: read cache → miss → load DB → set with TTL; on write update DB then delete the key.',
    },
    {
      id: 'write-through-write-behind',
      title: 'Write-Through and Write-Behind (Write-Back) Caching',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Write-through updates cache and database together on every write; write-behind writes to the cache first and saves to the database later in the background.',
      what: `These patterns decide what happens on a **write**:

- **Write-through**: every write goes to the **cache and the database at the same time** (synchronously). The cache is always fresh, so reads almost always hit.
- **Write-behind (write-back)**: the write goes to the **cache only**, and is saved to the database **later**, often in batches. Very fast writes, but risk of data loss.
- **Write-around**: write only to the database and skip the cache; the cache fills on reads (this is what cache-aside does).

There is also **read-through**: the app always asks the cache, and the cache layer itself loads from the database on a miss. With plain Redis, your code plays that role.

#### Deeper version
**Write-through:**
- Pros: fresh cache, simple reads.
- Cons: every write is slower (two writes); you cache data that may never be read; you still need TTLs or eviction. If the DB write fails after the cache write (or the other way round), they disagree — so write the DB first.

**Write-behind:**
- Pros: very fast writes; batching many small updates (like view counters) into one DB write.
- Cons: if Redis crashes before flushing, data is **lost**; the database is behind (eventual consistency); ordering and retries are harder.
- Common real use: counters, likes, analytics, "last seen" timestamps — data where losing a few seconds is acceptable.

In practice many systems combine them: cache-aside for most reads, write-behind for high-volume counters.`,
      why: `Interviewers ask this to see if you understand the trade-off between consistency, write speed and durability — and can choose a pattern for a specific feature rather than "just add Redis".`,
      analogy: `Write-through is a cashier who writes every sale in both the till display and the account book immediately. Write-behind is a cashier who keeps a tally on a notepad and copies it into the account book every hour — faster during the rush, but if the notepad is lost, so is that hour's record.`,
      code: [
        {
          title: 'Write-through: DB first, then cache',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function updateUserProfile(pool, id, name) {
  // 1. Write to the source of truth
  const { rows } = await pool.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
    [name, id]
  );
  // 2. Write the fresh value to the cache too (still with a TTL)
  await redis.set('user:' + id, JSON.stringify(rows[0]), 'EX', 3600);
  return rows[0];
}`,
        },
        {
          title: 'Write-behind: buffer view counts, flush in batches',
          lang: 'javascript',
          code: `// Every page view: fast in-memory increment only
async function trackView(postId) {
  await redis.hincrby('pending:views', String(postId), 1);
}

// Every 10 seconds: move counts to Postgres in one batch
async function flushViews(pool) {
  // Atomically rename so new views go to a fresh hash while we flush
  const exists = await redis.exists('pending:views');
  if (!exists) return;
  await redis.rename('pending:views', 'flushing:views');
  const counts = await redis.hgetall('flushing:views');   // { '7': '42', '9': '3' }

  for (const [postId, n] of Object.entries(counts)) {
    await pool.query('UPDATE posts SET views = views + $1 WHERE id = $2', [Number(n), Number(postId)]);
  }
  await redis.del('flushing:views');
}

setInterval(() => flushViews(pool).catch(console.error), 10_000);`,
        },
      ],
      output: `With write-through, after \`updateUserProfile\` both Postgres and Redis hold the new name, so the next read is a cache hit with fresh data.

With write-behind, 10,000 page views become 10,000 cheap Redis increments, but only one \`UPDATE\` per post every 10 seconds in Postgres. If Redis crashed without persistence before a flush, up to about 10 seconds of view counts would be lost — acceptable for views, not for payments. (In a real system, run the flush loop on one worker or protect it with a lock.)`,
      questions: [
        {
          q: 'What is the difference between write-through and write-behind?',
          a: 'Write-through writes to cache and database synchronously on every write. Write-behind writes to the cache and saves to the database later asynchronously, which is faster but can lose data.',
        },
        {
          q: 'When is write-behind a good idea?',
          a: 'For high-volume, loss-tolerant data like view counters, likes, analytics and presence, where batching saves a lot of database writes.',
        },
        {
          q: 'Cache-aside vs write-through?',
          a: 'Cache-aside fills the cache on reads and deletes keys on writes; simpler and caches only what is read. Write-through keeps the cache fresh on every write but caches data that may never be read and makes writes slower.',
        },
        {
          q: 'What is read-through?',
          a: 'The app reads only from the cache, and the cache layer loads missing data from the database itself. With Redis, a small wrapper in your code usually does this.',
        },
      ],
      spoken: `"With write-through, every write goes to the database and then the cache synchronously, so the cache stays fresh and reads hit, but writes are slower and I may cache data nobody reads. With write-behind, I write to Redis first and flush to the database later in batches — great for high-volume things like view counters, because thousands of increments become one update — but if Redis dies before the flush, I lose that data. For most features I use cache-aside with deletes, and I reserve write-behind for loss-tolerant counters."`,
      mistakes: [
        'Using write-behind for money, orders or anything that must never be lost.',
        'Writing the cache first and the database second in write-through — if the DB write fails, the cache now lies.',
        'Running the write-behind flush on every app instance at once, causing double counting. Use one worker or a lock, and atomic rename/claim.',
        'Forgetting TTLs with write-through, so the cache grows with rarely read data.',
        'Follow-up trap: "How would you make write-behind safer?" Enable Redis persistence (AOF), use a Stream with consumer groups so unacknowledged items are retried, and keep the flush interval short.',
      ],
      takeaway: 'Write-through = fresh cache, slower writes; write-behind = fast batched writes, risk of loss — choose per feature.',
    },
    {
      id: 'redis-vs-memcached',
      title: 'Redis vs Memcached',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Both are in-memory caches; Memcached is a simple multi-threaded string cache, Redis adds data structures, persistence, replication, pub/sub and scripting.',
      what: `**Memcached** is an older, very simple in-memory cache. It stores **strings** (bytes) under keys with a TTL. That's it.

**Redis** does that too, plus much more:
- Rich data types (hashes, lists, sets, sorted sets, streams).
- **Persistence** to disk (RDB, AOF).
- **Replication**, Sentinel (failover) and Cluster (sharding).
- Pub/sub, Lua scripting, transactions.

#### Deeper version
- **Threading:** Memcached is multi-threaded, so one instance can use many CPU cores for simple GET/SET. Redis executes commands on one main thread (with I/O threads in newer versions); you scale it with more instances or Cluster.
- **Memory:** Memcached uses a slab allocator that is efficient for many same-sized small values. Redis has per-key overhead but compact encodings for small hashes/lists/sets.
- **Eviction:** Memcached uses LRU. Redis offers several policies (LRU, LFU, random, TTL-based).
- **Max value size:** Memcached's default item limit is 1 MB (configurable). Redis strings can be up to 512 MB (but huge values are a bad idea).
- **Scaling:** Memcached has no built-in clustering; clients shard keys with consistent hashing. Redis Cluster shards for you.

Today Redis (or Valkey) is the default choice. Memcached still makes sense for a pure, very high-throughput, simple string cache where you want multi-core use in one process.`,
      why: `This question checks whether you choose tools for reasons. Knowing the differences shows you understand what a cache needs and what Redis adds on top.`,
      analogy: `Memcached is a plain coat-check counter: hand in a coat, get it back by ticket number, fast and simple. Redis is a full-service concierge desk: coat check, plus a message board, a queue system, a leaderboard and a safe for things you want kept overnight.`,
      code: [
        {
          title: 'What only Redis can do in one call',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Both can do a plain cache:
await redis.set('page:/home', '<html>...</html>', 'EX', 60);

// Only Redis: update one field of an object without rewriting it
await redis.hincrby('cart:42', 'item:7', 1);

// Only Redis: ranked data maintained by the server
await redis.zincrby('trending', 1, 'post:99');
const top = await redis.zrevrange('trending', 0, 4);

// Only Redis: push work to a list that a worker pops (BRPOP blocks until data arrives)
await redis.lpush('jobs', JSON.stringify({ type: 'email', to: 'a@x.com' }));`,
        },
      ],
      output: `The first call works the same in Memcached. The other three need server-side data structures: in Memcached you would have to GET the whole value, change it in Node and SET it back, which is slower and races when many servers do it at once. Redis does each change atomically in a single command.`,
      questions: [
        {
          q: 'Redis vs Memcached — when would you pick each?',
          a: 'Redis for almost everything: rich data types, persistence, replication, pub/sub, Lua. Memcached for a simple, multi-threaded string cache where you need nothing else.',
        },
        {
          q: 'Which one supports persistence?',
          a: 'Redis (RDB snapshots and AOF). Memcached is memory-only; a restart empties it.',
        },
        {
          q: 'Which is multi-threaded?',
          a: 'Memcached. Redis executes commands on a single main thread (using I/O threads for networking in newer versions) and scales by running more instances or a cluster.',
        },
      ],
      spoken: `"Both are in-memory key-value caches. Memcached is deliberately simple: string values, TTLs, LRU eviction, and it's multi-threaded, so a single node uses many cores well. Redis adds real data structures like hashes and sorted sets, atomic operations on them, persistence with RDB and AOF, replication and clustering, pub/sub, streams and Lua scripting. So I default to Redis, because one tool covers caching, sessions, rate limiting and queues. I'd only consider Memcached for a very simple, high-throughput string cache."`,
      mistakes: [
        'Saying Memcached is "faster" in general. For simple GET/SET they are both extremely fast; the difference is threading model and features.',
        'Choosing Memcached and then needing counters, sorted data or persistence later.',
        'Saying Redis is purely single-threaded in modern versions — command execution is, but networking and background work can use threads.',
        'Follow-up trap: "How do you scale Memcached?" Client-side sharding with consistent hashing across nodes; there is no built-in replication or cluster.',
      ],
      takeaway: 'Memcached = simple multi-threaded string cache; Redis = cache plus data structures, persistence, replication and messaging.',
    },
    {
      id: 'eviction-policies',
      title: 'Eviction Policies (LRU, LFU) and maxmemory',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'When Redis hits its memory limit (maxmemory), the eviction policy decides which keys to throw out — or whether to reject writes.',
      what: `RAM is limited. You set a limit with \`maxmemory\` (for example \`2gb\`). When Redis reaches it and needs space for a new write, it uses the **eviction policy** (\`maxmemory-policy\`) to decide what to do:

- \`noeviction\` — do not delete anything; **reject writes** with an error. (The default in open-source Redis.)
- \`allkeys-lru\` — remove the **Least Recently Used** key from all keys.
- \`allkeys-lfu\` — remove the **Least Frequently Used** key from all keys.
- \`volatile-lru\` / \`volatile-lfu\` — same, but only among keys **that have a TTL**.
- \`allkeys-random\` / \`volatile-random\` — remove a random key.
- \`volatile-ttl\` — remove keys with the shortest remaining TTL first.

**LRU** = "not used for the longest time". **LFU** = "used the fewest times".

#### Deeper version
Redis's LRU and LFU are **approximate**: instead of tracking a perfect order of all keys (expensive), it samples a few keys (\`maxmemory-samples\`, default 5) and evicts the best candidate. Higher samples = closer to true LRU, a bit more CPU.

**LFU** uses a small counter per key that grows logarithmically and **decays** over time, so a key that was popular yesterday but not today can still be evicted.

**Choosing:**
- Pure cache → \`allkeys-lru\` (good default) or \`allkeys-lfu\` (if a small set of keys is always hot).
- Redis holds both cache keys (with TTL) and important keys (no TTL, like sessions or queues) → \`volatile-lru\`/\`volatile-lfu\`, so non-TTL keys are never evicted. (Better: use separate Redis instances.)
- Redis as a primary store or queue → \`noeviction\`, and alert on memory.

If you set \`maxmemory\` = 0 (no limit) on a 64-bit build, Redis grows until the OS runs out of memory. Managed services (ElastiCache, Memorystore, Upstash) set their own defaults — check your provider's settings.`,
      why: `A cache that fills up must either drop something or start failing. Picking the wrong policy can make your app crash on writes (\`noeviction\` on a cache) or silently lose important data (\`allkeys-lru\` on a queue).`,
      analogy: `Your fridge is full and you bought new groceries. LRU throws out the item you haven't touched for the longest time. LFU throws out the item you rarely eat at all. Noeviction is refusing to put anything new in until someone empties the fridge.`,
      code: [
        {
          title: 'Configure memory limit and policy',
          lang: 'bash',
          code: `# redis.conf (or CONFIG SET at runtime)
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Check at runtime
redis-cli CONFIG GET maxmemory-policy
redis-cli INFO memory | grep used_memory_human
redis-cli INFO stats  | grep evicted_keys`,
        },
        {
          title: 'Watch evictions and hit rate from Node',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// INFO returns text like "keyspace_hits:1234\\r\\n..."
const stats = await redis.info('stats');
const read = (name) => Number(stats.match(new RegExp(name + ':(\\\\d+)'))[1]);

const hits = read('keyspace_hits');
const misses = read('keyspace_misses');
console.log('hit rate', (hits / (hits + misses || 1)).toFixed(2));
console.log('evicted keys', read('evicted_keys'));`,
        },
      ],
      output: `With \`allkeys-lru\` and a 2 GB limit, Redis never grows past about 2 GB; when full, it quietly drops keys that haven't been used recently and the next request for them is just a cache miss.

The Node script prints the cache hit rate (for example \`0.94\` = 94% of reads found their key) and how many keys have been evicted. A rising \`evicted_keys\` with a falling hit rate means the cache is too small for the working set.`,
      questions: [
        {
          q: 'What happens when Redis runs out of memory?',
          a: 'It follows `maxmemory-policy`. With `noeviction` it rejects writes with an OOM error; with LRU/LFU/random/TTL policies it evicts keys to make room.',
        },
        {
          q: 'LRU vs LFU?',
          a: 'LRU evicts keys not accessed for the longest time. LFU evicts keys accessed the fewest times (with decay). LFU is better when some keys are consistently hot; LRU is a solid general default.',
        },
        {
          q: 'allkeys-lru vs volatile-lru?',
          a: '`allkeys-lru` can evict any key. `volatile-lru` only evicts keys that have a TTL, protecting keys without one. If no keys have TTLs, volatile policies behave like noeviction.',
        },
        {
          q: 'Is Redis LRU exact?',
          a: 'No, it is approximated by sampling a few keys and evicting the best candidate, controlled by `maxmemory-samples`.',
        },
      ],
      spoken: `"Redis has a memory limit set by maxmemory, and when it's full the maxmemory-policy decides what happens. noeviction rejects writes, which suits a primary store or queue. For a pure cache I use allkeys-lru, which drops the least recently used keys, or allkeys-lfu when a few keys are always hot. The volatile variants only evict keys with a TTL, which protects keys like sessions — though I'd rather separate those into another instance. The LRU is approximate, based on sampling. I monitor evicted_keys and hit rate to know if the cache is too small."`,
      mistakes: [
        'Leaving `noeviction` on a cache — when memory fills, every write errors and requests fail.',
        'Using `allkeys-lru` on an instance that also holds queues or sessions — they can be silently evicted.',
        'Using a `volatile-*` policy when most keys have no TTL — nothing can be evicted, so writes fail.',
        'Not monitoring memory, hit rate and evictions.',
        'Follow-up trap: "Eviction vs expiry?" Expiry removes keys whose TTL ended. Eviction removes keys (even unexpired ones) because memory is full.',
      ],
      takeaway: 'Set maxmemory and pick a policy that fits the role: allkeys-lru/lfu for caches, noeviction for data you cannot lose.',
    },
    {
      id: 'sessions-in-redis',
      title: 'Storing Sessions in Redis',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Keep session data in Redis under a random session id so any app server can read it, it expires automatically, and you can log users out instantly.',
      what: `A **session** is data the server remembers about a logged-in user between requests (user id, role, cart). The browser only holds a **session id** in a cookie.

If you store sessions in the Node process memory, they break when you run **more than one server** (load balancer sends the next request elsewhere) or restart the app.

Storing them in **Redis** fixes this:
- Every server reads the same session store.
- A TTL ends idle sessions automatically.
- Logging out = deleting the key, effective immediately.

#### Deeper version
**Sessions vs JWT:**
- **Server sessions (Redis)**: the cookie holds a random id; data stays on the server. Easy to revoke (delete key), small cookie, but needs a Redis lookup per request.
- **JWT**: a signed token holding the data itself; no lookup needed, but hard to revoke before it expires. Teams often keep a Redis **denylist** of revoked token ids, or use short-lived access tokens plus refresh tokens stored server-side.

**Security checklist:** session id must be long and random (\`crypto.randomBytes(32)\`); cookie with \`HttpOnly\`, \`Secure\`, \`SameSite\`; **rotate** the session id after login (prevents session fixation); sliding expiry (refresh the TTL on activity) with an absolute max lifetime.

To support "log out from all devices", keep a set of session ids per user: \`user:42:sessions\`.

In Express, \`express-session\` with \`connect-redis\` does this for you. The \`connect-redis\` import style changed between major versions (default export vs named \`RedisStore\`), so check the README for the version you install. The manual version below shows what it does underneath.`,
      why: `Horizontal scaling (many Node instances, containers, serverless) needs shared session state. Redis is fast enough to check on every request and has built-in expiry, which is exactly what sessions need.`,
      analogy: `A session id is like a cloakroom ticket. The ticket (cookie) is just a number; your coat (session data) stays in the cloakroom (Redis). Any attendant (server) can look up your coat with the ticket, and the cloakroom can cancel your ticket at any time.`,
      code: [
        {
          title: 'Minimal Redis session store with ioredis',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

const SESSION_TTL = 60 * 60 * 24;          // 1 day, sliding

export async function createSession(user) {
  const sid = crypto.randomBytes(32).toString('hex');   // unguessable id
  await redis
    .multi()
    .set('sess:' + sid, JSON.stringify({ userId: user.id, role: user.role }), 'EX', SESSION_TTL)
    .sadd('user:' + user.id + ':sessions', sid)          // for "logout everywhere"
    .exec();
  return sid;                                            // put this in an HttpOnly cookie
}

export async function getSession(sid) {
  const raw = await redis.get('sess:' + sid);
  if (!raw) return null;                                 // expired or logged out
  await redis.expire('sess:' + sid, SESSION_TTL);        // sliding expiry
  return JSON.parse(raw);
}

export async function logoutEverywhere(userId) {
  const sids = await redis.smembers('user:' + userId + ':sessions');
  if (sids.length) await redis.del(...sids.map((s) => 'sess:' + s));
  await redis.del('user:' + userId + ':sessions');
}`,
        },
        {
          title: 'Using it as Express middleware',
          lang: 'javascript',
          code: `import express from 'express';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cookieParser());

app.post('/login', async (req, res) => {
  const user = { id: 42, role: 'admin' };                // after checking the password
  const sid = await createSession(user);
  res.cookie('sid', sid, { httpOnly: true, secure: true, sameSite: 'lax' });
  res.json({ ok: true });
});

app.use(async (req, res, next) => {
  req.session = req.cookies.sid ? await getSession(req.cookies.sid) : null;
  next();
});

app.get('/me', (req, res) => {
  if (!req.session) return res.status(401).json({ error: 'Not logged in' });
  res.json(req.session);
});`,
        },
      ],
      output: `After \`POST /login\`, the browser gets an \`HttpOnly\` cookie with a 64-character random id, and Redis holds \`sess:<id>\` with the user data for one day. Every request to any server reads the session from Redis and pushes the expiry forward. \`GET /me\` returns \`{ userId: 42, role: 'admin' }\`.

If the user is idle for a day, the key expires and \`/me\` returns 401. Calling \`logoutEverywhere(42)\` deletes all of that user's sessions, so every device is logged out on its very next request.`,
      questions: [
        {
          q: 'Why store sessions in Redis instead of server memory?',
          a: 'With multiple servers or restarts, in-memory sessions are lost or not shared. Redis is a fast shared store with built-in expiry.',
        },
        {
          q: 'Sessions in Redis vs JWT?',
          a: 'Redis sessions are easy to revoke and keep data server-side but need a lookup per request. JWTs need no lookup but are hard to revoke before expiry. Many apps use short JWTs plus a server-side refresh token or denylist in Redis.',
        },
        {
          q: 'How do you implement "log out from all devices"?',
          a: 'Track session ids per user in a Redis set; on logout-all, delete every session key in that set (or bump a per-user token version that all sessions check).',
        },
        {
          q: 'What is session fixation and how do you prevent it?',
          a: 'An attacker makes the victim use a session id the attacker knows. Prevent it by issuing a brand-new session id at login (and on privilege change).',
        },
      ],
      spoken: `"I store sessions in Redis so every app instance shares them. The cookie only holds a long random session id, HttpOnly, Secure and SameSite, and Redis holds the data with a TTL that I refresh on activity for a sliding expiry. Logging out is just deleting the key, and I keep a set of session ids per user so I can log someone out of all devices. Compared with JWTs, this is easier to revoke at the cost of one fast lookup per request. In Express, express-session with connect-redis does the same thing."`,
      mistakes: [
        'Using the default in-memory session store in production — it leaks memory and breaks with multiple instances.',
        'Putting large objects (whole user records, carts with images) in the session; keep it small.',
        'Not regenerating the session id after login (session fixation).',
        'Storing sessions in a Redis with `allkeys-lru` eviction alongside cache data — users get logged out randomly when memory fills.',
        'Follow-up trap: "What happens if Redis goes down?" Everyone is logged out or cannot authenticate. Use a replicated/managed Redis with failover, and consider persistence for the session instance.',
      ],
      takeaway: 'Cookie holds a random id, Redis holds the session with a TTL — shared across servers and instantly revocable.',
    },
    {
      id: 'pub-sub-streams',
      title: 'Pub/Sub (and When to Use Streams Instead)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Pub/Sub broadcasts messages to whoever is listening right now (fire-and-forget); Streams store messages so consumers can catch up and acknowledge them.',
      what: `**Pub/Sub** (publish/subscribe) is messaging built into Redis:

- A **publisher** sends a message to a **channel**: \`PUBLISH chat:room1 "hi"\`.
- Every **subscriber** listening on that channel receives it instantly.
- \`PSUBSCRIBE chat:*\` subscribes to a pattern.

It is **fire-and-forget**: Redis does not store messages. If nobody is listening, or a subscriber is disconnected, the message is lost.

#### Deeper version
**Connection rule:** a connection in subscribe mode can only run subscribe-related commands. In ioredis you use a **separate** \`Redis\` instance for subscribing (\`redis.duplicate()\`).

**Common use: scaling WebSockets.** With 3 Node servers behind a load balancer, user A is connected to server 1 and user B to server 2. When A sends a message, server 1 publishes to Redis; all servers receive it and push it to their local sockets. (Socket.IO's Redis adapter does exactly this.) Also used for cache-invalidation broadcasts to in-process caches.

**Redis Streams** fix the "lost message" problem:
- \`XADD\` appends to a persistent log.
- **Consumer groups** (\`XGROUP\`, \`XREADGROUP\`) split work among workers.
- Workers \`XACK\` processed messages; unacknowledged ones stay pending and can be claimed by another worker (\`XAUTOCLAIM\`).

Rule of thumb: **Pub/Sub** for real-time notifications where missing one is OK. **Streams** (or a real queue: BullMQ, SQS, Kafka) for jobs/events that must be processed.`,
      why: `Real-time features (chat, notifications, live dashboards) across several servers need a way for servers to talk to each other. Redis Pub/Sub is the simplest backbone for that, and Streams cover reliable event processing without adding Kafka.`,
      analogy: `Pub/Sub is a radio broadcast: anyone tuned in hears it live; if your radio was off, you missed it. A Stream is a group chat with history: you can scroll back to messages you missed, and you mark them as read (ACK).`,
      code: [
        {
          title: 'Pub/Sub with ioredis (separate connections)',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const pub = new Redis(process.env.REDIS_URL);
const sub = pub.duplicate();              // subscriber needs its own connection

await sub.subscribe('notifications');
sub.on('message', (channel, message) => {
  const data = JSON.parse(message);
  console.log('[' + channel + ']', data.text);
  // e.g. io.to(data.userId).emit('notify', data) on this server's sockets
});

// Somewhere else (any server)
const receivers = await pub.publish('notifications', JSON.stringify({ userId: 42, text: 'Order shipped' }));
console.log('delivered to', receivers, 'subscriber(s)');`,
        },
        {
          title: 'Reliable processing with a Stream + consumer group',
          lang: 'javascript',
          code: `const redis = new Redis(process.env.REDIS_URL);

// Create the group once (MKSTREAM creates the stream if missing)
await redis.xgroup('CREATE', 'orders', 'billing', '$', 'MKSTREAM').catch(() => {}); // ignore "already exists"

// Producer
await redis.xadd('orders', '*', 'orderId', '101', 'amount', '499');

// Worker: read new messages for this consumer, process, then ACK
const res = await redis.xreadgroup('GROUP', 'billing', 'worker-1', 'COUNT', 10, 'BLOCK', 5000, 'STREAMS', 'orders', '>');
if (res) {
  const [, entries] = res[0];               // [streamName, [[id, [field, value, ...]], ...]]
  for (const [id, fields] of entries) {
    console.log('processing', id, fields);  // e.g. [ 'orderId', '101', 'amount', '499' ]
    await redis.xack('orders', 'billing', id);
  }
}`,
        },
      ],
      output: `In the Pub/Sub example, the subscriber logs \`[notifications] Order shipped\`, and \`publish\` returns how many subscribers got it (for example \`1\`). If no subscriber was connected, it returns \`0\` and the message is gone.

In the Stream example, the order event is stored. \`worker-1\` reads it, processes it and acknowledges it. If the worker crashed before \`XACK\`, the message would stay in the group's pending list and another worker could claim it later — nothing is lost.`,
      questions: [
        {
          q: 'Does Redis Pub/Sub guarantee delivery?',
          a: 'No. It is fire-and-forget: messages are not stored, so offline or disconnected subscribers miss them.',
        },
        {
          q: 'How do you scale WebSockets across multiple Node servers?',
          a: 'Each server subscribes to Redis channels; when one server gets an event it publishes to Redis, and every server forwards it to its own connected clients. Socket.IO\'s Redis adapter does this.',
        },
        {
          q: 'Pub/Sub vs Streams?',
          a: 'Pub/Sub is live broadcast with no history. Streams are a persistent log with consumer groups, acknowledgements and replay — use them when messages must not be lost.',
        },
        {
          q: 'Why do you need a separate connection for subscribing?',
          a: 'Once a connection subscribes, it enters subscriber mode and can only run (P)SUBSCRIBE/(P)UNSUBSCRIBE/PING-type commands, so normal commands need another connection.',
        },
      ],
      spoken: `"Redis Pub/Sub lets a publisher send a message to a channel and every currently connected subscriber gets it instantly. It's fire-and-forget — nothing is stored — so it's great for real-time things like broadcasting chat or notifications across multiple WebSocket servers, which is how the Socket.IO Redis adapter works. A subscribing connection can't run normal commands, so in ioredis I duplicate the client. When messages must not be lost, I use Redis Streams with consumer groups and XACK, or a queue like BullMQ."`,
      mistakes: [
        'Using Pub/Sub as a job queue — if the worker is down, the job is lost.',
        'Calling `get`/`set` on the subscriber connection (it is in subscriber mode).',
        'Forgetting that every subscriber gets every message — Pub/Sub broadcasts, it does not load-balance. Use consumer groups to split work.',
        'Letting Streams grow forever. Trim with `XADD ... MAXLEN ~ 100000` or `XTRIM`.',
        'Follow-up trap: "Does Pub/Sub work across a Redis Cluster?" Classic Pub/Sub messages are broadcast to all nodes, which can be costly at scale; Redis 7 added sharded Pub/Sub (`SPUBLISH`/`SSUBSCRIBE`) for that.',
      ],
      takeaway: 'Pub/Sub = live broadcast, no memory; Streams = stored, acknowledged messages — choose by whether you can lose a message.',
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting with Redis (Fixed Window, Sliding Window, Lua)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Count requests per user in Redis so all servers share the limit: INCR+EXPIRE for a fixed window, a sorted set for a sliding window, and Lua to make it atomic.',
      what: `**Rate limiting** = allowing only N requests per time window per user/IP/API key (for example 100 per minute). Extra requests get **HTTP 429 Too Many Requests**.

Why Redis? With several app servers, each server's memory only sees part of the traffic. Redis gives one **shared, atomic counter**.

Two common algorithms:

1. **Fixed window** — one counter per minute: key \`rl:ip:minute\`. \`INCR\` it; on the first hit set \`EXPIRE 60\`. Simple and cheap. **Problem:** bursts at the window edge — 100 requests at 12:00:59 and 100 more at 12:01:00 = 200 in two seconds.
2. **Sliding window log** — store each request's timestamp in a **sorted set** (score = time). Remove entries older than the window, count the rest. Accurate, but uses more memory (one entry per request).

#### Deeper version
**Atomicity:** "read count, decide, then write" from Node as separate commands can race when many requests arrive at once. Fixes:
- \`MULTI\`/\`EXEC\` (or a pipeline in a transaction) to send the commands together.
- A **Lua script** (\`EVAL\`): Redis runs the whole script atomically — no other command runs in between. This is the standard for sliding windows.

Other algorithms you can mention:
- **Sliding window counter** — weights the previous window's count; nearly as accurate as the log with fixed memory.
- **Token bucket** — tokens refill at a steady rate; each request spends one; allows short bursts up to the bucket size. Used by many APIs.
- **Leaky bucket** — processes requests at a fixed rate, smoothing bursts.

Return headers like \`Retry-After\` and \`RateLimit-*\` so clients can back off. Decide what to do if Redis is down: **fail open** (allow) for normal APIs, **fail closed** for login/OTP endpoints.`,
      why: `Rate limits protect your API from abuse, brute-force login attempts, scraping and runaway clients — and protect your wallet when each request calls a paid service like an LLM API or SMS gateway.`,
      analogy: `Fixed window is a club that lets in 100 people per hour, resetting the count exactly on the hour — so 100 can rush in at 7:59 and 100 more at 8:00. Sliding window is a bouncer who checks "how many came in during the last 60 minutes from right now?" for every new guest.`,
      code: [
        {
          title: 'Fixed window: INCR + EXPIRE in one transaction',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Allow 'limit' requests per 'windowSec' for this id
async function fixedWindow(id, limit = 100, windowSec = 60) {
  const windowNo = Math.floor(Date.now() / 1000 / windowSec);
  const key = 'rl:fixed:' + id + ':' + windowNo;          // new key each window

  const [[, count]] = await redis
    .multi()
    .incr(key)                                            // atomic +1
    .expire(key, windowSec)                               // key cleans itself up
    .exec();                                              // [[err, result], [err, result]]

  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}`,
        },
        {
          title: 'Sliding window log with an atomic Lua script',
          lang: 'javascript',
          code: `// KEYS[1] = key, ARGV = now(ms), window(ms), limit, unique member
const SLIDING_WINDOW_LUA = \`
  local key    = KEYS[1]
  local now    = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit  = tonumber(ARGV[3])
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)  -- drop old requests
  local count = redis.call('ZCARD', key)
  if count < limit then
    redis.call('ZADD', key, now, ARGV[4])               -- record this request
    redis.call('PEXPIRE', key, window)
    return 1
  end
  return 0
\`;

redis.defineCommand('slidingWindow', { numberOfKeys: 1, lua: SLIDING_WINDOW_LUA });

async function slidingWindow(id, limit = 100, windowMs = 60_000) {
  const now = Date.now();
  const member = now + ':' + Math.random();                 // unique per request
  const ok = await redis.slidingWindow('rl:slide:' + id, now, windowMs, limit, member);
  return ok === 1;
}`,
        },
        {
          title: 'Express middleware',
          lang: 'javascript',
          code: `function rateLimit({ limit, windowMs }) {
  return async (req, res, next) => {
    try {
      const allowed = await slidingWindow(req.ip, limit, windowMs);
      if (!allowed) {
        res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
        return res.status(429).json({ error: 'Too many requests' });
      }
      next();
    } catch (err) {
      next();            // Redis down: fail open for normal routes
    }
  };
}

app.use('/api', rateLimit({ limit: 100, windowMs: 60_000 }));
app.post('/login', rateLimit({ limit: 5, windowMs: 15 * 60_000 }), loginHandler);`,
        },
      ],
      output: `With the fixed window, requests 1-100 in the current minute are allowed and request 101 gets \`allowed: false\`; at the next minute a fresh key starts at 1. The \`MULTI\` makes INCR and EXPIRE go together, so a key can never be left without an expiry.

With the sliding window, each request's timestamp is stored in a sorted set. At any moment, only requests from the last 60 seconds count, so the "200 requests across a window edge" burst is impossible. Because the Lua script runs atomically, two simultaneous requests can never both see "99" and both get in.

The middleware returns 429 with \`Retry-After\` when the limit is hit. The login route gets a much stricter limit (5 tries per 15 minutes) to slow brute-force attacks.`,
      questions: [
        {
          q: 'How would you implement rate limiting with Redis?',
          a: 'Fixed window: `INCR` a per-user-per-window key and set `EXPIRE` on it, reject when the count passes the limit. For accuracy, a sliding window with a sorted set of timestamps (ZREMRANGEBYSCORE, ZCARD, ZADD) inside a Lua script for atomicity.',
        },
        {
          q: 'What is the problem with a fixed window?',
          a: 'Bursts at the boundary: a client can send the full limit at the end of one window and again at the start of the next, doubling the rate briefly.',
        },
        {
          q: 'Why use a Lua script?',
          a: 'Redis runs a Lua script atomically, so the check-and-increment logic cannot interleave with other requests. It also saves round trips.',
        },
        {
          q: 'What is a token bucket?',
          a: 'A bucket holds up to N tokens and refills at a steady rate; each request takes a token, and requests without a token are rejected. It allows short bursts while enforcing an average rate.',
        },
        {
          q: 'What should happen if Redis is unavailable?',
          a: 'Decide per route: fail open (allow) for general APIs to avoid an outage, fail closed (deny) for sensitive endpoints like login and OTP.',
        },
      ],
      spoken: `"I rate limit in Redis so all app instances share one counter. The simplest is a fixed window: INCR a key for this user and this minute and set an expiry, together in a MULTI so the key always expires. Its weakness is bursts at the window edge. For accuracy I use a sliding window log in a sorted set — remove timestamps older than the window, count, and add the new one — inside a Lua script so it's atomic. I return 429 with Retry-After, use stricter limits on login, and choose fail-open or fail-closed per route if Redis is down."`,
      mistakes: [
        'Doing `GET`, comparing in Node, then `INCR` — concurrent requests race past the limit.',
        'Calling `INCR` and `EXPIRE` separately without a transaction — a crash in between leaves a key that never expires and blocks the user forever.',
        'Using a sorted-set log for very high limits (like 10,000 per minute) — one entry per request uses lots of memory; use a sliding window counter or token bucket.',
        'Rate limiting only by IP — users behind one NAT or office share an IP; prefer user id or API key when authenticated.',
        'Follow-up trap: "Does using req.ip work behind a load balancer?" Only if Express is configured to trust the proxy (`app.set(\'trust proxy\', ...)`); otherwise every request appears to come from the load balancer\'s IP.',
      ],
      takeaway: 'Use Redis as the shared counter: INCR+EXPIRE for simple fixed windows, sorted set + Lua for accurate, atomic sliding windows.',
    },
    {
      id: 'cache-invalidation-stampede',
      title: 'Cache Invalidation and Cache Stampede (Thundering Herd)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Invalidation keeps cached data in sync with the database; a stampede is when a hot key expires and hundreds of requests hit the database at once.',
      what: `**Cache invalidation** = removing or updating cached data when the source data changes. It is famously "one of the two hard things in computer science".

Main strategies:
- **TTL-based** — data just expires. Simple; stale for up to the TTL.
- **Explicit delete on write** — after updating the DB, \`DEL\` the key (cache-aside).
- **Event-based** — the DB change publishes an event (Pub/Sub, a queue, or CDC from the DB log) and a consumer deletes the keys. Good when many services write.
- **Versioned keys** — include a version in the key (\`products:v42:list\`); bump the version to invalidate a whole group at once.

**Cache stampede** (thundering herd, dog-piling): a **very popular** key expires. In the next millisecond, 500 requests all miss, all query the database, and all write the cache. The database may fall over.

#### Deeper version
Ways to prevent a stampede:
1. **Locking / single flight** — only the first request that misses gets a lock (\`SET lock:key 1 NX PX 5000\`) and rebuilds; the others wait briefly and retry the cache, or get a stale value.
2. **In-process request coalescing** — inside one Node process, share one Promise for the same key, so 100 concurrent requests on that server cause one DB query.
3. **Stale-while-revalidate** — store the value with a "soft" expiry inside it and a longer real TTL. After the soft expiry, serve the stale value and refresh in the background.
4. **Probabilistic early expiration** — each request has a small, growing chance of refreshing the value **before** it expires, so refreshes spread out.
5. **TTL jitter** — avoid many keys expiring at the same moment.
6. **Pre-warming** — refresh known hot keys on a schedule before they expire.

Related problems: **cache penetration** (requests for keys that never exist — cache the "not found" or use a Bloom filter) and **cache avalanche** (many keys expire together, or Redis restarts empty — jitter, warm-up, replicas).`,
      why: `Caches are added to protect the database. A stampede does the opposite: at the worst possible moment (peak traffic on the hottest key), the cache stops helping. Interviewers love this question because it separates "used Redis" from "ran Redis at scale".`,
      analogy: `A stampede is like a shop opening its doors after a sale announcement: everyone rushes the single cashier at once. The fix is a staff member at the door letting one person in to restock the shelf while the others wait a moment (lock), or keeping yesterday's stock on display while new stock is fetched (stale-while-revalidate).`,
      code: [
        {
          title: 'Lock so only one request rebuilds the cache',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWithLock(key, ttlSec, loadFromDb) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    // Try to become the one rebuilder (lock auto-expires after 5s)
    const gotLock = await redis.set('lock:' + key, '1', 'PX', 5000, 'NX');
    if (gotLock === 'OK') {
      try {
        const value = await loadFromDb();
        await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
        return value;
      } finally {
        await redis.del('lock:' + key);
      }
    }
    await sleep(50);   // someone else is rebuilding: wait and re-check the cache
  }
  return loadFromDb(); // give up waiting after ~2.5s and go to the DB
}`,
        },
        {
          title: 'Coalesce concurrent misses inside one Node process',
          lang: 'javascript',
          code: `const inFlight = new Map();   // key -> Promise

async function getCoalesced(key, ttlSec, loadFromDb) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  if (!inFlight.has(key)) {
    const p = (async () => {
      const value = await loadFromDb();
      await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
      return value;
    })().finally(() => inFlight.delete(key));
    inFlight.set(key, p);
  }
  return inFlight.get(key);   // everyone awaits the same Promise
}`,
        },
        {
          title: 'Stale-while-revalidate',
          lang: 'javascript',
          code: `async function getSWR(key, freshSec, loadFromDb) {
  const raw = await redis.get(key);
  if (raw) {
    const { value, freshUntil } = JSON.parse(raw);
    if (Date.now() > freshUntil) {
      // Stale: serve it now, refresh in the background (one refresher via NX lock)
      redis.set('refresh:' + key, '1', 'EX', 30, 'NX').then(async (ok) => {
        if (ok === 'OK') await save(key, await loadFromDb(), freshSec);
      }).catch(console.error);
    }
    return value;
  }
  const value = await loadFromDb();
  await save(key, value, freshSec);
  return value;
}

async function save(key, value, freshSec) {
  const payload = JSON.stringify({ value, freshUntil: Date.now() + freshSec * 1000 });
  await redis.set(key, payload, 'EX', freshSec * 10);   // keep stale copy much longer
}`,
        },
      ],
      output: `Without protection, when \`home:feed\` expires during peak traffic, every concurrent request runs the expensive query. With \`getWithLock\`, one request rebuilds and the rest wait about 50 ms and then read the fresh cache — the database sees **one** query instead of hundreds.

\`getCoalesced\` does the same inside a single process: 200 simultaneous requests on one server share one Promise and one DB call.

With \`getSWR\`, users never wait for a rebuild: after the fresh period they get the slightly old value instantly, while one background refresh updates it.`,
      questions: [
        {
          q: 'What is a cache stampede and how do you prevent it?',
          a: 'When a hot key expires and many requests miss at once and all hit the database. Prevent it with a rebuild lock (SET NX), request coalescing, stale-while-revalidate, probabilistic early refresh, TTL jitter and pre-warming.',
        },
        {
          q: 'What are the main cache invalidation strategies?',
          a: 'TTL expiry, explicit delete after writes, event-driven invalidation (pub/sub, queue, CDC), and versioned keys to invalidate groups.',
        },
        {
          q: 'Cache penetration vs cache avalanche vs stampede?',
          a: 'Penetration: requests for data that never exists keep missing (cache nulls, Bloom filter). Avalanche: many keys expire at once or the cache restarts empty (jitter, warm-up, HA). Stampede: one hot key expires and causes a burst (locks, SWR).',
        },
        {
          q: 'How do you invalidate a list cache like "all products in category 5"?',
          a: 'Delete that list key whenever a product in the category changes, or use a version number in the key and increment it so old list keys are simply never read again (and expire by TTL).',
        },
      ],
      spoken: `"Invalidation is keeping the cache in sync with the database. I combine a TTL as a safety net with deleting keys right after writes, and for multiple services I use events. For groups of keys I use a version number in the key. A cache stampede is when a hot key expires and hundreds of requests hit the database at once. I prevent it with a short Redis lock using SET NX so only one request rebuilds, request coalescing inside each process, stale-while-revalidate so users get the old value while one refresh runs, and jitter on TTLs."`,
      mistakes: [
        'Relying only on TTL for data that must update immediately (like a price change or a ban).',
        'Using `KEYS pattern*` + `DEL` to invalidate groups in production. Use versioned keys, tracked sets of keys, or `SCAN` + `UNLINK` offline.',
        'A rebuild lock without an expiry — if the rebuilder crashes, nobody can rebuild again.',
        'Not handling the case where waiting requests time out — they should fall back to the DB or a stale value, not error.',
        'Follow-up trap: "Why delete the key instead of setting the new value after a write?" Two concurrent writers can set values in the wrong order and leave an old value cached; deleting lets the next read load the true current value.',
      ],
      takeaway: 'Invalidate with TTL + delete-on-write (or events/versions), and guard hot keys against stampedes with locks, coalescing and stale-while-revalidate.',
    },
    {
      id: 'persistence-rdb-aof',
      title: 'Persistence: RDB vs AOF',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'RDB saves point-in-time snapshots (compact, may lose minutes); AOF logs every write (more durable, bigger files); many setups use both.',
      what: `Redis keeps data in RAM, but it can save it to disk so data survives a restart. Two methods:

- **RDB (Redis Database snapshot)** — every so often, Redis writes the **whole dataset** to a compact binary file (\`dump.rdb\`). Example rule: "save if at least 100 keys changed in 60 seconds".
- **AOF (Append Only File)** — Redis **appends every write command** to a log file. On restart it replays the log.

You can use neither (pure cache), one, or both.

#### Deeper version
**RDB:**
- Uses \`fork()\`: a child process writes the snapshot while the parent keeps serving. Copy-on-write means memory use can grow during the save on a write-heavy instance.
- Pros: small file, fast restarts, great for backups.
- Cons: you lose everything since the last snapshot if Redis crashes (could be minutes).

**AOF:**
- \`appendfsync\` controls how often the file is flushed to disk:
  - \`always\` — every write. Safest, slowest.
  - \`everysec\` — once per second (the default). Lose at most about 1 second of writes.
  - \`no\` — let the OS decide. Fastest, least safe.
- The file grows, so Redis **rewrites** it in the background into the shortest set of commands that rebuilds the current data.
- Pros: much less data loss. Cons: bigger files, slower restarts than RDB.

**Both together:** Redis loads from AOF on restart (it's more complete). Modern versions can write the AOF with an RDB "preamble" (a snapshot followed by recent commands) to get fast loads and good durability; Redis 7 split the AOF into multiple files. Check your version's docs for exact defaults.

Managed services (ElastiCache, Memorystore) expose these as backup/snapshot and durability settings, often with different defaults.`,
      why: `Whether Redis can lose data decides what you are allowed to store in it. A pure cache can run with no persistence; sessions, rate limits, queues or write-behind buffers need at least AOF everysec.`,
      analogy: `RDB is taking a photo of your whiteboard every 5 minutes — quick to restore, but you lose whatever was written after the last photo. AOF is a stenographer writing down every change as it happens — you can replay it all, but the notebook gets thick and reading it back takes longer.`,
      code: [
        {
          title: 'redis.conf persistence settings',
          lang: 'bash',
          code: `# RDB: snapshot if >=1 change in 3600s, >=100 in 300s, >=10000 in 60s
save 3600 1 300 100 60 10000
dbfilename dump.rdb

# AOF: log every write, fsync once per second
appendonly yes
appendfsync everysec

# Rewrite AOF when it doubles in size (and is at least 64mb)
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Pure cache instead? Turn both off:
# save ""
# appendonly no`,
        },
        {
          title: 'Trigger and check persistence from Node',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

await redis.bgsave();                         // background RDB snapshot
const info = await redis.info('persistence');
console.log(info.match(/rdb_last_bgsave_status:(\\w+)/)?.[1]);   // 'ok'
console.log(info.match(/aof_enabled:(\\d)/)?.[1]);               // '1' if AOF is on`,
        },
      ],
      output: `With these settings, Redis writes an RDB snapshot on the schedule and also logs every write to the AOF, flushing it once per second. If the server crashes, it restarts by replaying the AOF and loses at most about one second of writes. Without AOF it would fall back to the last snapshot, possibly minutes old.

The Node script asks Redis to snapshot in the background and then reads the persistence section of \`INFO\` to confirm the last save succeeded and whether AOF is enabled.`,
      questions: [
        {
          q: 'RDB vs AOF?',
          a: 'RDB writes periodic full snapshots: compact and fast to restore but can lose minutes of data. AOF logs every write and replays it: loses at most about a second with everysec, but files are bigger and restarts slower.',
        },
        {
          q: 'What does appendfsync everysec mean?',
          a: 'Redis flushes the AOF to disk once per second, so a crash loses at most roughly the last second of writes. It balances safety and speed.',
        },
        {
          q: 'Why does an RDB save sometimes spike memory?',
          a: 'It forks a child process; pages modified by the parent during the save are copied (copy-on-write), so heavy writes during a snapshot increase memory use.',
        },
        {
          q: 'Do you need persistence for a cache?',
          a: 'Not strictly — a cache can be rebuilt from the database. But an empty cache after restart can overload the database, so some teams still keep RDB for faster warm-up.',
        },
      ],
      spoken: `"Redis has two persistence options. RDB takes periodic snapshots of the whole dataset using a forked child — compact and fast to restart from, but I could lose everything since the last snapshot. AOF appends every write to a log; with appendfsync everysec I'd lose at most about a second, at the cost of bigger files and slower restarts, and Redis rewrites the log in the background to compact it. Many setups use both. For a pure cache I might turn persistence off; for sessions, queues or rate limits I'd enable AOF."`,
      mistakes: [
        'Assuming Redis data is safe on disk by default for anything important — check what persistence is actually enabled.',
        'Using `appendfsync always` without need, which hurts write throughput badly.',
        'Ignoring fork memory overhead and setting `maxmemory` too close to the machine\'s RAM.',
        'Treating persistence as a backup. Copy RDB files off the machine (or use managed snapshots) for real backups.',
        'Follow-up trap: "With AOF everysec, is Redis fully durable like Postgres?" No — and with async replication a failover can also lose acknowledged writes. Do not keep money-critical data only in Redis.',
      ],
      takeaway: 'RDB = periodic snapshots (compact, lossy); AOF = write log (durable to ~1s); enable what matches how much loss you can accept.',
    },
    {
      id: 'pipelining-transactions-lua',
      title: 'Pipelining, MULTI/EXEC Transactions and Lua Scripts',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Pipelines batch commands to save round trips, MULTI/EXEC runs a group without interruption, and Lua scripts run logic atomically on the server.',
      what: `Three ways to send several commands together:

- **Pipelining** — send many commands at once without waiting for each reply. Saves **network round trips**. Not atomic: other clients' commands can run in between.
- **MULTI / EXEC** (a Redis "transaction") — queue commands after \`MULTI\`; \`EXEC\` runs them all **in a row**, with nothing from other clients in between.
- **Lua scripts** (\`EVAL\`) — run a small program **inside Redis**. The whole script is atomic, and it can **read values and make decisions** in the middle.

#### Deeper version
**MULTI/EXEC is not like a SQL transaction:**
- There is **no rollback**. If one command fails at runtime (for example \`INCR\` on a non-number), the others still run.
- You **cannot read a value and decide** inside the transaction — results come back only after \`EXEC\`.
- For "check then set", use \`WATCH key\` (optimistic locking): if the watched key changes before \`EXEC\`, the transaction is aborted (\`EXEC\` returns null) and you retry.

**Lua** solves "read, decide, write" atomically in one round trip (rate limiters, lock release, conditional updates). Keep scripts short — while a script runs, Redis serves nobody else. Pass all keys in \`KEYS\` (needed for Redis Cluster routing). In ioredis, \`defineCommand\` caches the script and calls it via \`EVALSHA\`. Redis 7 also added **Functions** (\`FUNCTION LOAD\`), a more permanent way to store scripts.

In **ioredis**: \`redis.pipeline()\` = pipeline, \`redis.multi()\` = MULTI/EXEC (also pipelined), and both return \`[[err, result], ...]\` from \`exec()\`.`,
      why: `A Node server talking to Redis over the network pays maybe 0.2-1 ms per round trip. Doing 100 commands one by one wastes 100 round trips; a pipeline does it in one. And without atomic grouping, concurrent requests can interleave and corrupt counters, locks and limits.`,
      analogy: `Pipelining is handing the shopkeeper your whole shopping list at once instead of asking for one item, waiting, then asking for the next. MULTI/EXEC is the shopkeeper promising to serve your whole list before turning to the next customer. A Lua script is giving the shopkeeper instructions like "if there are fewer than 3 apples left, give me oranges instead" — they decide on the spot, without you going back and forth.`,
      code: [
        {
          title: 'Pipeline vs MULTI with ioredis',
          lang: 'javascript',
          code: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Pipeline: 1 round trip for 3 reads (not atomic)
const results = await redis
  .pipeline()
  .get('user:1:name')
  .get('user:2:name')
  .hgetall('settings')
  .exec();
// results = [[null, 'Asha'], [null, 'Ravi'], [null, { theme: 'dark' }]]

// MULTI/EXEC: these run back-to-back with no other client in between
await redis
  .multi()
  .decrby('stock:7', 1)
  .lpush('orders:recent', 'order-101')
  .exec();`,
        },
        {
          title: 'WATCH for check-and-set',
          lang: 'javascript',
          code: `// Transfer points only if the balance is enough; retry if someone else changed it
async function spendPoints(userId, cost) {
  const key = 'points:' + userId;
  for (let i = 0; i < 5; i++) {
    await redis.watch(key);
    const balance = Number(await redis.get(key) ?? 0);
    if (balance < cost) { await redis.unwatch(); return false; }

    const res = await redis.multi().decrby(key, cost).exec();
    if (res !== null) return true;   // null = key changed after WATCH -> retry
  }
  throw new Error('Too much contention');
}`,
        },
        {
          title: 'Same thing atomically with Lua',
          lang: 'javascript',
          code: `redis.defineCommand('spendPoints', {
  numberOfKeys: 1,
  lua: \`
    local balance = tonumber(redis.call('GET', KEYS[1]) or '0')
    local cost = tonumber(ARGV[1])
    if balance < cost then return 0 end
    redis.call('DECRBY', KEYS[1], cost)
    return 1
  \`,
});

const ok = await redis.spendPoints('points:42', 50);   // 1 = spent, 0 = not enough`,
        },
      ],
      output: `The pipeline returns all three results after one network round trip, each as \`[error, value]\`. The MULTI block decreases stock and records the order back-to-back.

\`spendPoints\` with WATCH reads the balance, and if another client changes it before \`EXEC\`, \`exec()\` returns \`null\` and the loop retries. The Lua version does the same check and update inside Redis in one atomic step — no retries needed — and returns \`1\` or \`0\`.`,
      questions: [
        {
          q: 'What is pipelining in Redis?',
          a: 'Sending multiple commands without waiting for each reply, then reading all replies together. It cuts network round trips but is not atomic.',
        },
        {
          q: 'Does MULTI/EXEC roll back on errors?',
          a: 'No. Commands with syntax errors abort the whole transaction before it runs, but a runtime error in one command does not undo the others.',
        },
        {
          q: 'What does WATCH do?',
          a: 'It is optimistic locking: if a watched key is modified before EXEC, the transaction is aborted and EXEC returns null so you can retry.',
        },
        {
          q: 'When would you use a Lua script?',
          a: 'When you need read-decide-write logic to be atomic, like rate limiting, safe lock release or conditional counters, in a single round trip.',
        },
        {
          q: 'What is the risk of Lua scripts?',
          a: 'A long-running script blocks the whole Redis server because commands run one at a time. Keep scripts short and bounded.',
        },
      ],
      spoken: `"Pipelining sends many commands in one round trip without waiting for each reply, which is great for bulk reads but isn't atomic. MULTI and EXEC run a queued group back-to-back with no other client in between, but there's no rollback and I can't read a value and branch inside it — for check-and-set I add WATCH and retry if it aborts. When I need real read-decide-write atomicity, like a rate limiter or safe lock release, I use a Lua script, which runs atomically on the server. I keep scripts short since they block Redis while running."`,
      mistakes: [
        'Expecting MULTI/EXEC to roll back like a SQL transaction.',
        'Trying to use a value read inside MULTI to decide the next command — results only arrive after EXEC.',
        'Writing long loops in Lua over big data, freezing Redis for all clients.',
        'Building key names inside a Lua script instead of passing them via KEYS — breaks Redis Cluster routing.',
        'Follow-up trap: "Is a single Redis command atomic?" Yes. Every single command (INCR, SET NX, LPUSH...) is atomic on its own; you only need MULTI or Lua when combining several.',
      ],
      takeaway: 'Pipeline to save round trips, MULTI/EXEC to group without interruption (no rollback), Lua for atomic read-decide-write.',
    },
    {
      id: 'distributed-locks',
      title: 'Distributed Locks with SET NX PX (and Their Caveats)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'SET key token NX PX ttl gives a simple lock across many servers; release it only if you still own it, and remember it is not perfectly safe.',
      what: `A **distributed lock** makes sure only **one** process across many servers does something at a time — for example, only one instance runs the nightly billing job, or only one worker rebuilds a cache entry.

The basic Redis lock is one atomic command:

\`SET lock:billing <random-token> NX PX 30000\`

- \`NX\` — only set if the key does **not** exist (so only one client wins).
- \`PX 30000\` — auto-expire after 30 seconds, so a crashed holder can't block forever.
- \`<random-token>\` — a unique value so you can prove **you** own the lock.

**Release safely:** delete the key **only if it still holds your token**. This must be atomic, so it is done with a small Lua script.

#### Deeper version
**Why the token check?** Process A takes the lock, then pauses (long GC, slow network) past the 30-second TTL. The lock expires, process B takes it. A wakes up and calls \`DEL\` — deleting **B's** lock. With the token check, A's delete does nothing.

**Caveats (the important interview part):**
1. **Expiry vs long work** — if the work takes longer than the TTL, two processes can run at once. Extend the lock periodically while working ("watchdog"), and pick a TTL well above normal run time.
2. **Process pauses** — even with checks, a paused process can wake up and act after losing the lock. The real fix is a **fencing token**: an increasing number given with each lock, which the protected resource (e.g. the database) checks, rejecting older tokens.
3. **Failover** — with async replication, a primary can crash after granting a lock but before replicating it; the new primary doesn't know about it and grants it again.
4. **Redlock** — an algorithm using several independent Redis nodes (majority wins) to survive single-node failure. It is debated (Martin Kleppmann's critique vs antirez's response). Common view: Redis locks are fine for **efficiency** (avoid duplicate work), but for **correctness** (must never run twice) use fencing tokens, a database lock (\`SELECT ... FOR UPDATE\`, Postgres advisory locks) or a consensus system (etcd, ZooKeeper).

Libraries like \`redlock\` (npm) implement retries and extension, but understand the basics first.`,
      why: `Running several app instances or cron workers is normal in cloud deployments. Without a lock, scheduled jobs run N times, emails are sent twice, and caches are rebuilt by every instance at once.`,
      analogy: `A Redis lock is like a meeting-room booking with an auto-release: you book it with your name (token) for 30 minutes. If you leave without cancelling, it frees itself. When you cancel, the system checks it's still your booking — you shouldn't cancel the booking of the person who took the room after yours ran out.`,
      code: [
        {
          title: 'Acquire and safely release a lock with ioredis',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Delete only if the value is still our token (atomic check-and-delete)
redis.defineCommand('releaseLock', {
  numberOfKeys: 1,
  lua: \`
    if redis.call('GET', KEYS[1]) == ARGV[1] then
      return redis.call('DEL', KEYS[1])
    end
    return 0
  \`,
});

async function withLock(name, ttlMs, fn) {
  const key = 'lock:' + name;
  const token = crypto.randomUUID();
  const ok = await redis.set(key, token, 'PX', ttlMs, 'NX');
  if (ok !== 'OK') return { ran: false };          // someone else holds it

  try {
    return { ran: true, result: await fn() };
  } finally {
    await redis.releaseLock(key, token);            // never deletes another owner's lock
  }
}

// Only one instance runs the nightly job
const out = await withLock('nightly-billing', 60_000, async () => {
  console.log('Running billing...');
  return 'done';
});
console.log(out);`,
        },
        {
          title: 'Fencing token idea (protecting the real resource)',
          lang: 'javascript',
          code: `// Each lock acquisition also gets an ever-increasing number
const fence = await redis.incr('fence:invoice-42');

// The database rejects writes from an older lock holder
await pool.query(
  'UPDATE invoices SET status = $1, fence = $2 WHERE id = $3 AND fence < $2',
  ['paid', fence, 42]
);
// If a newer holder already wrote with fence 8, a paused holder with fence 7 updates 0 rows.`,
        },
      ],
      output: `If three instances call \`withLock('nightly-billing', ...)\` at the same time, exactly one gets \`'OK'\` and prints "Running billing..." and \`{ ran: true, result: 'done' }\`. The other two get \`null\` from \`SET NX\` and return \`{ ran: false }\` immediately. When the job ends, the lock is deleted only if it still holds this instance's token. If the instance crashed mid-job, the lock disappears on its own after 60 seconds.

In the fencing example, a stale lock holder with an older number cannot overwrite the work of a newer holder, because the database checks the number.`,
      questions: [
        {
          q: 'How do you implement a distributed lock in Redis?',
          a: '`SET lock:name <unique-token> NX PX <ttl>` to acquire; release with a Lua script that deletes the key only if its value equals your token.',
        },
        {
          q: 'Why store a unique token instead of just "1"?',
          a: 'So you only release your own lock. If your lock expired and someone else acquired it, a plain DEL would remove their lock.',
        },
        {
          q: 'What if the work takes longer than the lock TTL?',
          a: 'Another process can acquire the lock and both run at once. Extend the lock periodically while working, choose a safe TTL, and protect the resource with fencing tokens.',
        },
        {
          q: 'What is Redlock and is it safe?',
          a: 'An algorithm that acquires the lock on a majority of independent Redis nodes. It survives single-node failures, but it is debated because it relies on timing assumptions; for strict correctness use fencing tokens or a consensus store like etcd/ZooKeeper.',
        },
        {
          q: 'Alternatives to Redis locks?',
          a: 'Postgres advisory locks or `SELECT ... FOR UPDATE`, unique constraints for idempotency, a job queue that guarantees single delivery per job, or etcd/ZooKeeper/Consul.',
        },
      ],
      spoken: `"The standard Redis lock is SET key token NX PX ttl — NX so only one client wins, a TTL so a crashed holder can't block forever, and a random token so I can prove ownership. I release it with a Lua script that deletes only if the value is still my token, otherwise I might delete someone else's lock after mine expired. The caveats are that long pauses or work longer than the TTL can let two holders run, and failover can lose a lock. So I use Redis locks for efficiency, and for strict correctness I add fencing tokens or use a database lock."`,
      mistakes: [
        'Using `SETNX` then a separate `EXPIRE` — a crash in between creates a lock that never expires. Use `SET ... NX PX` in one command.',
        'Releasing with a plain `DEL` without checking the token.',
        'Setting a TTL shorter than the job can take, without extending it.',
        'Treating a Redis lock as a hard correctness guarantee for payments or inventory.',
        'Follow-up trap: "Why not just use a unique constraint?" Often that is better! If the goal is "process this payment once", an idempotency key with a unique constraint in Postgres is simpler and stronger than a lock.',
      ],
      takeaway: 'SET token NX PX to lock, Lua compare-and-delete to unlock — great for avoiding duplicate work, add fencing for true correctness.',
    },
    {
      id: 'replication-sentinel-cluster',
      title: 'Redis High Availability: Replication, Sentinel and Cluster',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Replicas copy a primary for reads and failover, Sentinel promotes a replica automatically, and Cluster shards keys across many primaries using 16,384 hash slots.',
      what: `One Redis server is a single point of failure and has limited RAM. Three building blocks fix this:

- **Replication** — a primary sends every write to one or more **replicas**. Replicas can serve reads and take over if the primary dies.
- **Sentinel** — separate watcher processes that monitor the primary, agree when it is down, **promote a replica**, and tell clients the new primary's address. This gives **high availability** without sharding.
- **Redis Cluster** — **shards** data across several primaries (each with replicas). Gives more total memory and write throughput, plus automatic failover.

#### Deeper version
**Replication is asynchronous** by default: the primary acknowledges the client before replicas confirm. If the primary crashes, the newest writes may be lost, and replicas can briefly serve stale reads. \`WAIT numreplicas timeout\` makes a client wait until N replicas have the write — it reduces loss but does not make Redis strongly consistent.

**Cluster details:**
- The key space is split into **16,384 hash slots**. A key's slot = CRC16(key) mod 16384. Each primary owns a range of slots.
- Clients must be **cluster-aware** (ioredis has \`new Redis.Cluster([...])\`); a node replies \`MOVED\` if you asked the wrong one.
- **Multi-key commands** (MGET, MULTI, Lua with several keys) work only if all keys are in the **same slot**. Use **hash tags**: only the part in \`{...}\` is hashed, so \`{user:42}:cart\` and \`{user:42}:profile\` land together.
- Cluster supports only database 0 (no \`SELECT 1\`).

**Managed options:** AWS ElastiCache / MemoryDB, GCP Memorystore, Azure Cache, Upstash, Redis Cloud — these handle failover and patching for you.`,
      why: `In production, Redis often holds sessions, rate limits and hot caches. If it goes down, logins break and the database gets flooded. Interviewers ask this to see whether you can make Redis reliable and know the consistency trade-offs.`,
      analogy: `Replication is having an assistant who copies everything the manager writes. Sentinel is the HR team that notices the manager is absent and promotes the assistant. Cluster is splitting a huge library into several buildings by the first letter of each book's code — each building has its own librarian and backup librarian.`,
      code: [
        {
          title: 'Connecting with ioredis: Sentinel and Cluster',
          lang: 'javascript',
          code: `import Redis from 'ioredis';

// Sentinel: ioredis asks the sentinels who the current primary is
const viaSentinel = new Redis({
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 },
  ],
  name: 'mymaster',           // the monitored primary group
});

// Cluster: ioredis discovers all nodes and routes keys to the right slot
const cluster = new Redis.Cluster([
  { host: 'redis-node-1', port: 6379 },
  { host: 'redis-node-2', port: 6379 },
]);

// Hash tags keep related keys in the same slot, so multi-key ops work
await cluster
  .multi()
  .hset('{user:42}:profile', 'name', 'Asha')
  .sadd('{user:42}:roles', 'admin')
  .exec();

// Wait until at least 1 replica has the write (or 100ms pass)
const acked = await viaSentinel.call('WAIT', 1, 100);
console.log('replicas acknowledged:', acked);`,
        },
      ],
      output: `The Sentinel client always talks to the current primary; after a failover it reconnects to the newly promoted one automatically. The Cluster client sends each key to the node that owns its slot. Because both keys share the hash tag \`{user:42}\`, the \`MULTI\` works; without the tag, the keys might live on different nodes and the transaction would fail with a CROSSSLOT error.

\`WAIT\` returns how many replicas confirmed the write, for example \`1\`.`,
      questions: [
        {
          q: 'Sentinel vs Cluster?',
          a: 'Sentinel provides monitoring and automatic failover for one primary and its replicas (no sharding). Cluster shards data across multiple primaries using hash slots and also handles failover.',
        },
        {
          q: 'How does Redis Cluster decide where a key lives?',
          a: 'CRC16 of the key modulo 16,384 gives the hash slot; each primary owns a range of slots. Hash tags `{...}` let you force related keys into one slot.',
        },
        {
          q: 'Can Redis lose acknowledged writes?',
          a: 'Yes. Replication is asynchronous, so if the primary fails before replicas receive a write, failover can lose it. `WAIT` reduces but does not eliminate this.',
        },
        {
          q: 'Why do multi-key commands fail in Cluster?',
          a: 'They require all keys to be in the same hash slot. Use hash tags to co-locate keys that are used together.',
        },
      ],
      spoken: `"For availability Redis uses primary-replica replication, which is asynchronous, so a failover can lose the latest writes. Sentinel watches the primary and promotes a replica automatically, and clients like ioredis ask Sentinel for the current primary. When one node's memory or throughput isn't enough, Redis Cluster shards keys into 16,384 hash slots across several primaries, each with replicas. The catch is that multi-key operations need all keys in the same slot, so I use hash tags like curly-brace user id. In practice I usually use a managed service like ElastiCache."`,
      mistakes: [
        'Assuming replicas are always up to date and reading critical data from them.',
        'Using multi-key commands or Lua scripts across keys in different slots in Cluster mode (CROSSSLOT errors).',
        'Overusing one hash tag, so all keys land on one node (a hot shard).',
        'Running only one or two Sentinels — you need at least three for a reliable majority vote.',
        'Follow-up trap: "Is Redis CP or AP in CAP terms?" Redis Cluster is generally described as favouring availability and performance; during partitions and failovers it can lose writes, so it is not strongly consistent.',
      ],
      takeaway: 'Replicas + Sentinel for failover, Cluster for sharding across 16,384 slots — and remember async replication can lose writes.',
    },
    {
      id: 'cap-theorem-pacelc',
      title: 'CAP Theorem (and PACELC)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'In a distributed system, during a network partition you must choose between consistency and availability; PACELC adds that even without partitions you trade latency for consistency.',
      what: `**CAP theorem** is about distributed data systems (data copied across several machines). It names three properties:

- **C — Consistency**: every read gets the **latest** write (or an error). All nodes agree.
- **A — Availability**: every request gets a **non-error** response (it may be old data).
- **P — Partition tolerance**: the system keeps working even when the network between nodes breaks (a **partition**).

The theorem: **when a partition happens, you must choose C or A.** You cannot have both at that moment.

Because networks *do* fail, P is not optional in real distributed systems. So the practical choice is:
- **CP**: during a partition, refuse some requests to stay correct.
- **AP**: during a partition, keep answering, even with possibly stale data, and reconcile later.

#### Deeper version
Common mistakes: "pick any two of three" is misleading — you don't "give up P". And CAP only talks about behaviour **during** a partition.

**PACELC** fills the gap: **if Partition → choose Availability or Consistency; Else (normal operation) → choose Latency or Consistency.** Even when the network is fine, waiting for replicas to confirm (consistency) costs latency.

Typical (simplified, depends on configuration) classifications:
- **Single-node Postgres** — not distributed, so CAP doesn't really apply. Postgres with **synchronous** replication leans **PC/EC**; with async replicas, reads from replicas may be stale.
- **MongoDB** with majority read/write concerns — leans **CP**; with relaxed settings it trades consistency for latency.
- **Cassandra / DynamoDB** — **AP / EL** by default, with tunable consistency (quorum reads/writes or DynamoDB strongly consistent reads).
- **Redis** with async replication — favours availability and low latency; can lose writes on failover.
- **etcd / ZooKeeper** — **CP** (consensus with Raft/ZAB); minority partitions stop accepting writes.

Also remember: CAP's C (linearizability) is not ACID's C (constraints hold).`,
      why: `System design interviews use CAP to see if you can reason about trade-offs: "Should the shopping cart stay available during an outage?" (AP), "Can two people book the same seat?" (CP). Knowing PACELC shows you also understand the everyday latency cost of consistency.`,
      analogy: `Two bank branches share account data over a phone line. The line goes dead (partition). A customer asks one branch for a withdrawal. **CP**: "Sorry, we can't confirm your balance right now" (correct but unavailable). **AP**: "Sure, here's the money" (available, but the other branch may also pay out — they'll reconcile later). PACELC adds: even when the phone works, calling the other branch before every withdrawal makes the queue slower.`,
      code: [
        {
          title: 'Choosing consistency vs latency in practice',
          lang: 'javascript',
          code: `// 1. Postgres: strong read from primary vs fast (maybe stale) read from replica
const fresh = await primaryPool.query('SELECT balance FROM accounts WHERE id = $1', [1]);
const maybeStale = await replicaPool.query('SELECT balance FROM accounts WHERE id = $1', [1]);

// 2. MongoDB: wait for a majority of nodes (consistent, slower) vs primary only (faster)
await orders.insertOne(order, { writeConcern: { w: 'majority' } });
await logs.insertOne(logEntry, { writeConcern: { w: 1 } });

// 3. Redis: make the write wait for 1 replica (reduces loss, adds latency)
await redis.set('balance-cache:1', '500');
const replicasAcked = await redis.call('WAIT', 1, 50);`,
        },
        {
          title: 'CP vs AP behaviour during a partition',
          lang: 'text',
          code: `Network split:   [Node A] ---X--- [Node B]
Client writes x=2 to Node A. Node B still has x=1.

CP system (e.g. etcd, Mongo with majority):
  Client reads from B  ->  ERROR / timeout (B can't confirm it is up to date)

AP system (e.g. Cassandra with consistency ONE, DynamoDB eventually consistent read):
  Client reads from B  ->  x = 1 (stale, but answered)
  After the network heals, nodes sync  ->  x = 2 everywhere (eventual consistency)`,
        },
      ],
      output: `In the code: reading from the primary always shows the latest balance; the replica may lag by a few milliseconds or seconds. Mongo's \`w: 'majority'\` waits for most nodes, so the write survives a primary failure, while \`w: 1\` is faster for logs where a rare loss is acceptable. Redis \`WAIT\` returns how many replicas got the write within 50 ms.

In the diagram: during the split, the CP system refuses the read from B rather than return old data; the AP system returns the old value 1 and fixes itself after the network heals.`,
      questions: [
        {
          q: 'Explain the CAP theorem.',
          a: 'A distributed system cannot guarantee both consistency (latest data on every read) and availability (every request answered) while a network partition is happening. Since partitions happen, you choose CP or AP behaviour.',
        },
        {
          q: 'Why is "pick two out of three" misleading?',
          a: 'Partition tolerance is not optional in a real distributed system — networks fail. The real choice is between consistency and availability during a partition.',
        },
        {
          q: 'What is PACELC?',
          a: 'If there is a Partition, choose Availability or Consistency; Else, choose Latency or Consistency. It adds the everyday trade-off that stronger consistency means waiting for more replicas.',
        },
        {
          q: 'Is a shopping cart CP or AP? A seat booking?',
          a: 'A cart can usually be AP — always accept adds and merge later. Seat booking or payments should be CP — better to reject than to double-book.',
        },
        {
          q: 'Is CAP consistency the same as ACID consistency?',
          a: 'No. CAP consistency means all nodes return the latest write (linearizability). ACID consistency means transactions keep data valid under its rules.',
        },
      ],
      spoken: `"CAP says that in a distributed system, when there's a network partition, you have to choose between consistency — every read sees the latest write — and availability — every request gets an answer. Partitions are a fact of life, so it's really CP versus AP during a failure. etcd or Mongo with majority writes lean CP; Cassandra and DynamoDB default to AP with tunable consistency. PACELC adds that even without a partition, you trade latency for consistency, like waiting for replicas to acknowledge. I choose per feature: a cart can be AP, but seat booking or payments must be CP."`,
      mistakes: [
        'Saying "we chose CA" for a distributed system — you cannot opt out of partitions.',
        'Labelling whole databases as strictly CP or AP; most are configurable per operation.',
        'Mixing up CAP consistency with ACID consistency.',
        'Forgetting that CAP only describes behaviour during a partition; PACELC covers normal operation.',
        'Follow-up trap: "What is eventual consistency?" If no new writes happen, all replicas will eventually converge to the same value — but reads in the meantime may be stale.',
      ],
      takeaway: 'During a partition choose consistency or availability (CAP); otherwise choose latency or consistency (PACELC) — decide per feature.',
    },
  ],
  rapidFire: [
    { q: 'What is Redis in one line?', a: 'An in-memory key-value store with rich data structures, used for caching, sessions, counters, queues and messaging.' },
    { q: 'Why is Redis fast?', a: 'Data lives in RAM, structures are efficient, and commands run on one thread with no locking.' },
    { q: 'Is each Redis command atomic?', a: 'Yes, every single command runs fully before the next one.' },
    { q: 'Best structure for a leaderboard?', a: 'A sorted set (`ZADD`, `ZINCRBY`, `ZREVRANGE`).' },
    { q: 'Best structure for unique visitors (exact)?', a: 'A set (`SADD`, `SCARD`); for approximate counts at huge scale, HyperLogLog.' },
    { q: 'Best structure for an object with fields?', a: 'A hash (`HSET`, `HGET`, `HINCRBY`).' },
    { q: 'KEYS vs SCAN?', a: '`KEYS` blocks Redis while scanning everything; `SCAN` iterates in small batches. Use SCAN.' },
    { q: 'DEL vs UNLINK?', a: '`UNLINK` frees memory in a background thread, so deleting big keys doesn\'t block.' },
    { q: 'How do you set a value with expiry atomically?', a: '`SET key value EX seconds` (or `PX` for ms).' },
    { q: 'TTL returns -1 / -2?', a: '-1 = no expiry, -2 = key does not exist.' },
    { q: 'Does a plain SET keep the old TTL?', a: 'No, it removes it — use `KEEPTTL` (Redis 6+) or pass a new EX.' },
    { q: 'Why add TTL jitter?', a: 'To stop many keys expiring at the same moment and flooding the database.' },
    { q: 'Cache-aside in one line?', a: 'Read cache → on miss load DB and cache with TTL; on write update DB then delete the key.' },
    { q: 'On write: update or delete the cache?', a: 'Usually delete, to avoid out-of-order writes leaving stale values.' },
    { q: 'Write-through vs write-behind?', a: 'Write-through writes cache and DB together; write-behind writes cache now and DB later (faster, can lose data).' },
    { q: 'What is cache penetration?', a: 'Repeated lookups for keys that never exist; fix by caching nulls briefly or a Bloom filter.' },
    { q: 'What is a cache stampede?', a: 'A hot key expires and many requests rebuild it at once, hammering the DB.' },
    { q: 'How do you prevent a stampede?', a: 'Rebuild lock (SET NX), request coalescing, stale-while-revalidate, early refresh, TTL jitter.' },
    { q: 'What is a cache avalanche?', a: 'Many keys expire together or the cache restarts empty, sending a flood of traffic to the DB.' },
    { q: 'Default eviction policy in open-source Redis?', a: '`noeviction` — writes fail when memory is full.' },
    { q: 'Good eviction policy for a pure cache?', a: '`allkeys-lru` (or `allkeys-lfu` for consistently hot keys).' },
    { q: 'LRU vs LFU?', a: 'LRU evicts least recently used; LFU evicts least frequently used.' },
    { q: 'Eviction vs expiry?', a: 'Expiry removes keys whose TTL ended; eviction removes keys because memory is full.' },
    { q: 'Is Redis Pub/Sub reliable?', a: 'No — fire-and-forget; offline subscribers miss messages. Use Streams for reliability.' },
    { q: 'What do consumer groups give you in Streams?', a: 'Work split across workers, acknowledgements (XACK), and re-delivery of pending messages.' },
    { q: 'Fixed window rate limit in Redis?', a: '`INCR` a per-window key and `EXPIRE` it (in MULTI); reject when count > limit.' },
    { q: 'Sliding window rate limit in Redis?', a: 'Sorted set of timestamps: ZREMRANGEBYSCORE old, ZCARD, ZADD — inside a Lua script.' },
    { q: 'Why Lua for rate limiting?', a: 'The script runs atomically, so concurrent requests can\'t race past the limit.' },
    { q: 'Does MULTI/EXEC roll back?', a: 'No. Runtime errors in one command don\'t undo the others.' },
    { q: 'What does WATCH do?', a: 'Aborts the next EXEC if a watched key changed — optimistic locking.' },
    { q: 'Pipeline vs MULTI?', a: 'Pipeline saves round trips (not atomic); MULTI runs commands back-to-back atomically.' },
    { q: 'Redis lock command?', a: '`SET lock:name <token> NX PX <ttl>`.' },
    { q: 'How do you release a Redis lock safely?', a: 'Lua compare-and-delete: delete only if the value equals your token.' },
    { q: 'What is a fencing token?', a: 'An increasing number issued with each lock that the protected resource checks to reject stale holders.' },
    { q: 'RDB vs AOF?', a: 'RDB = periodic snapshots (compact, may lose minutes); AOF = log of every write (loses ~1s with everysec).' },
    { q: 'Redis vs Memcached?', a: 'Memcached is a simple multi-threaded string cache; Redis adds data types, persistence, replication, pub/sub, Lua.' },
    { q: 'Sentinel vs Cluster?', a: 'Sentinel = automatic failover without sharding; Cluster = sharding across 16,384 hash slots plus failover.' },
    { q: 'What are hash tags in Redis Cluster?', a: 'Braces in a key like `{user:42}:cart` — only that part is hashed, so related keys share a slot.' },
    { q: 'Can Redis lose acknowledged writes?', a: 'Yes, replication is async, so a failover can drop the latest writes.' },
    { q: 'Sessions in Redis vs JWT?', a: 'Redis sessions are easy to revoke but need a lookup; JWTs need no lookup but are hard to revoke early.' },
    { q: 'CAP theorem in one line?', a: 'During a network partition, a distributed system must choose consistency or availability.' },
    { q: 'What does PACELC add?', a: 'Even without partitions, you trade latency against consistency.' },
    { q: 'Example of a CP and an AP system?', a: 'CP: etcd/ZooKeeper (or Mongo with majority). AP: Cassandra/DynamoDB with default eventual consistency.' },
    { q: 'What is eventual consistency?', a: 'Replicas may differ briefly but converge to the same value once writes stop.' },
  ],
};
