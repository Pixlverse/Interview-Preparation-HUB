// Interview problems for the Redis stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'redis',
  problems: [
    {
      id: 'what-to-cache',
      title: 'Which data should (and should not) go in the cache?',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'cache-aside',
      question: `You run an e-commerce API (Node + MongoDB/Postgres). The team wants to "add Redis to make it fast". For each item below, say **cache or not**, and if yes, roughly what TTL (time to live) and how you keep it fresh:

1. Product details page (name, description, images)
2. Product **stock count** shown on the checkout button
3. Home page "trending products" list (a heavy aggregation query)
4. The logged-in user's cart
5. Payment status of an order (from Stripe)
6. Country/currency list used in dropdowns
7. A user's password hash

Then give the general rule you used.`,
      hints: [
        'Ask two questions per item: how often is it read compared to written? And what is the damage if a user sees an old value for a few seconds?',
        'Good cache candidates: read often, change rarely, expensive to compute, and OK to be slightly stale.',
        'Things where a stale value costs money or security (stock at checkout, payments, passwords) should be read from the source of truth.',
      ],
      solution: `**Idea:** cache data that is **read a lot, changes rarely, is expensive to build, and is safe to be a little old**. Never let the cache be the only place important data lives (unless Redis is the deliberate primary store, like sessions).

\`\`\`text
 item                        cache?   TTL / freshness
---------------------------+--------+----------------------------------------------------
 1. product details         | yes    | 5-60 min + delete the key when the product is edited
 2. stock at checkout       | no (a) | read from DB inside the order transaction
 3. trending list           | yes    | 1-5 min; rebuild in the background (cron/worker)
 4. user's cart             | yes (b)| Redis hash as the main store, 7-30 day TTL
 5. payment status          | no     | DB updated by Stripe webhook is the truth
 6. countries / currencies  | yes    | hours/days, or in app memory; rarely changes
 7. password hash           | no     | never; read from DB at login only
\`\`\`

**(a)** You can **show** an approximate stock number from cache on the product page ("only 3 left"), but the real check at checkout must hit the database (e.g. \`UPDATE ... SET stock = stock - 1 WHERE stock > 0\`).

**(b)** A cart is often stored **in** Redis as primary data (fast, expires on its own). Then you need persistence (AOF) or accept that a Redis loss empties carts.

**General rules:**
- Prefer caching **expensive reads** (aggregations, third-party API calls) over cheap primary-key lookups that are already fast.
- Always set a **TTL**, so mistakes fix themselves.
- Invalidate (delete) on write for data users edit and expect to see right away.
- Do not cache **per-user secrets** or permission checks for long. A revoked admin should lose access quickly.
- Measure: hit rate (\`INFO stats\` → keyspace_hits / keyspace_misses). A cache with a low hit rate adds latency and complexity for nothing.`,
      followUps: [
        {
          q: 'What can go wrong when you add a cache?',
          a: 'Stale data, cache stampedes when hot keys expire, more memory cost, a new failure point (the app must still work, maybe slower, if Redis is down), and bugs where different services forget to invalidate.',
        },
        {
          q: 'Would you cache an API response per user or shared?',
          a: 'Share when the response is the same for everyone (product page). Per-user keys (e.g. `feed:user:42`) multiply memory by the number of users, so use shorter TTLs and only for expensive data.',
        },
      ],
    },
    {
      id: 'leaderboard-sorted-set',
      title: 'Build a game leaderboard: top 10 and "my rank"',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'what-is-redis-data-structures',
      question: `A quiz app gives points after every game. Build a weekly leaderboard with ioredis:

1. \`addPoints(userId, points)\` — add points to a user's weekly score.
2. \`getTop(n)\` — top N users with their scores, highest first.
3. \`getMyRank(userId)\` — the user's rank (1 = first) and score, or \`null\` if they have not played.

Example:

\`\`\`javascript
await addPoints('u1', 50);
await addPoints('u2', 80);
await addPoints('u3', 65);
await addPoints('u1', 40);   // u1 now has 90

await getTop(3);        // [{ userId: 'u1', score: 90 }, { userId: 'u2', score: 80 }, { userId: 'u3', score: 65 }]
await getMyRank('u3');  // { rank: 3, score: 65 }
\`\`\`

Why is Redis a better fit for this than \`ORDER BY score DESC\` in the database on every request?`,
      hints: [
        'Redis has a data type that keeps members sorted by a number automatically: the sorted set (ZSET).',
        '`ZINCRBY` adds to a score. `ZREVRANGE key 0 n-1 WITHSCORES` returns the highest first.',
        '`ZREVRANK` returns a 0-based position from the top, so add 1. It returns null if the member is missing.',
      ],
      solution: `**Idea:** a **sorted set** stores unique members, each with a score, and keeps them ordered by score. Adding and ranking are O(log N), so it stays fast with millions of players.

\`\`\`javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

const KEY = 'leaderboard:2026-w41'; // one key per week -> easy weekly reset

async function addPoints(userId, points) {
  await redis.zincrby(KEY, points, userId);     // creates the member if missing
  await redis.expire(KEY, 60 * 60 * 24 * 14);   // auto-delete old weeks after 14 days
}

async function getTop(n = 10) {
  // flat array: ['u1', '90', 'u2', '80', ...]
  const flat = await redis.zrevrange(KEY, 0, n - 1, 'WITHSCORES');
  const result = [];
  for (let i = 0; i < flat.length; i += 2) {
    result.push({ userId: flat[i], score: Number(flat[i + 1]) });
  }
  return result;
}

async function getMyRank(userId) {
  const [rank, score] = await Promise.all([
    redis.zrevrank(KEY, userId),  // 0-based, highest score = 0
    redis.zscore(KEY, userId),    // string or null
  ]);
  if (rank === null) return null; // never played this week
  return { rank: rank + 1, score: Number(score) };
}
\`\`\`

**Why it works:** Redis keeps the set sorted on every write (it uses a skip list inside). Reading the top 10 or one user's rank does not need any sorting at request time.

**Why not the database every time?** \`ORDER BY score DESC LIMIT 10\` is fine with an index, but "what is my rank?" needs \`COUNT(*) WHERE score > mine\`, which gets slow with millions of rows and heavy write traffic. Redis answers both in O(log N) from memory.

**Edge cases:**
- **Ties:** equal scores are ordered by member name (byte order). If "first to reach the score wins", encode time into the score, e.g. \`score * 1e7 + (1e7 - secondsIntoWeek)\` (stays below 2^53 for normal score sizes).
- **Durability:** keep the real points history in the database and treat the ZSET as a fast view you can rebuild.
- On Redis 6.2+, \`ZRANGE key 0 9 REV WITHSCORES\` is the newer form of \`ZREVRANGE\`.`,
      followUps: [
        {
          q: 'How do you show the players just above and below me?',
          a: 'Get my 0-based rank `r` with `ZREVRANK`, then `ZREVRANGE key max(0, r-2) r+2 WITHSCORES`. That returns 2 players above, me, and 2 below.',
        },
        {
          q: 'How do you build an all-time leaderboard from weekly ones?',
          a: '`ZUNIONSTORE leaderboard:all 2 leaderboard:all leaderboard:2026-w41` adds the scores (default aggregate is SUM). Or simply `ZINCRBY` both the weekly and all-time keys in one pipeline on every game.',
        },
      ],
    },
    {
      id: 'cache-aside-product-endpoint',
      title: 'Add cache-aside caching to GET /products/:id',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'cache-aside',
      question: `This Express endpoint hits the database on every request and the product page is slow under load:

\`\`\`javascript
app.get('/products/:id', async (req, res) => {
  const product = await db.products.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.put('/products/:id', async (req, res) => {
  const product = await db.products.update(req.params.id, req.body);
  res.json(product);
});
\`\`\`

Using ioredis, add the **cache-aside** pattern:
- Read from Redis first; on a miss, read the DB and store the result with a **5 minute TTL**.
- When a product is updated, users must see the new data right away.
- Requests for ids that do not exist should not hammer the database either.
- If Redis is down, the endpoint must still work.`,
      hints: [
        'Pick a key format like `product:<id>`. Redis stores strings, so `JSON.stringify` on write and `JSON.parse` on read.',
        'Use `SET key value EX 300` for the TTL. On update: write the DB first, then `DEL` the key.',
        'For missing ids, cache a small "not found" marker with a short TTL ("negative caching"). Wrap Redis calls in try/catch and fall back to the DB.',
      ],
      solution: `**Idea:** the app manages the cache itself: **check cache → on miss load from DB → save to cache**. On writes, update the DB and **delete** the cache key so the next read reloads fresh data.

\`\`\`javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

const TTL_SECONDS = 300;           // 5 minutes
const NOT_FOUND_TTL_SECONDS = 60;  // short TTL for "does not exist"
const keyFor = (id) => \`product:\${id}\`;

async function cacheGet(key) {
  try {
    return await redis.get(key);  // string or null
  } catch (err) {
    console.warn('redis get failed, using DB', err.message);
    return null;                  // treat Redis errors as a cache miss
  }
}

async function cacheSet(key, value, ttl) {
  try {
    await redis.set(key, value, 'EX', ttl);
  } catch (err) {
    console.warn('redis set failed', err.message);
  }
}

app.get('/products/:id', async (req, res) => {
  const key = keyFor(req.params.id);

  const cached = await cacheGet(key);
  if (cached !== null) {
    const product = JSON.parse(cached);
    if (product === null) return res.status(404).json({ error: 'Not found' }); // cached "missing"
    return res.json(product);                                                   // cache hit
  }

  // cache miss -> go to the database
  const product = await db.products.findById(req.params.id);
  if (!product) {
    await cacheSet(key, 'null', NOT_FOUND_TTL_SECONDS);   // negative caching
    return res.status(404).json({ error: 'Not found' });
  }

  // small random jitter so many keys do not expire at the same second
  const ttl = TTL_SECONDS + Math.floor(Math.random() * 30);
  await cacheSet(key, JSON.stringify(product), ttl);
  res.json(product);
});

app.put('/products/:id', async (req, res) => {
  const product = await db.products.update(req.params.id, req.body); // 1. write the source of truth
  try {
    await redis.del(keyFor(req.params.id));                          // 2. then invalidate
  } catch (err) {
    console.warn('redis del failed; TTL will clean up', err.message);
  }
  res.json(product);
});
\`\`\`

**Why it works:**
- Hot products are served from memory; the DB sees roughly one query per product per 5 minutes.
- **Delete, not update, on write:** deleting is simpler and avoids writing a half-built or out-of-order value. The next reader loads the fresh row.
- **DB first, then delete:** if you delete first, another request may refill the cache with the **old** row before your DB write finishes.
- **TTL** is the safety net: even if a delete fails, data is at most 5 minutes old.
- **Negative caching** stops bots that request random ids from hitting the DB every time.

**Edge cases:** if the product appears on other cached pages (category lists, search), those keys must be invalidated too, or given short TTLs. For very hot keys, add stampede protection (see the cache-stampede problem).`,
      followUps: [
        {
          q: 'Cache-aside vs write-through: what is the difference?',
          a: 'Cache-aside loads into the cache only on a read miss, so only data that is actually read gets cached. Write-through updates the cache on every write, so reads are always hits, but you cache data nobody reads and every write is slower.',
        },
        {
          q: 'There are 5 API servers. Does deleting the key on one server update the others?',
          a: 'Yes, because the cache is in Redis, which all servers share. That is a big reason to use Redis instead of an in-process Map. With per-process caches you would need pub/sub to tell every server to drop its copy.',
        },
      ],
    },
    {
      id: 'redis-session-store',
      title: 'Move Express sessions from memory to Redis',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'sessions-in-redis',
      question: `An Express app uses \`express-session\` with the default **MemoryStore**. After you scaled from 1 to 3 servers behind a load balancer, users get **logged out randomly**, and every deploy logs everyone out.

1. Explain why.
2. Move sessions to Redis (\`connect-redis\` + ioredis) with secure cookie settings and a 7-day lifetime.
3. Add a "log out from all devices" feature.`,
      hints: [
        'MemoryStore keeps sessions inside one Node process. Where does request #2 go if the load balancer picks a different server?',
        '`connect-redis` stores each session as a Redis key like `sess:<id>` with a TTL equal to the cookie lifetime.',
        'To log out everywhere, you must find all sessions of one user. Keep a Redis set `user:<id>:sessions` of session ids.',
      ],
      solution: `**1. Why it breaks:** \`MemoryStore\` keeps sessions in the RAM of **one** process. If the next request lands on server B, B has never seen that session id, so the user looks logged out. A deploy restarts the process and wipes the RAM. (MemoryStore also leaks memory and is not meant for production.)

**2. Store sessions in Redis** — every server reads the same data:

\`\`\`javascript
import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis'; // v8+ named export; older versions use a default export
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const app = express();
app.set('trust proxy', 1); // behind a load balancer, so "secure" cookies work

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

app.use(session({
  store: new RedisStore({ client: redis, prefix: 'sess:' }),
  secret: process.env.SESSION_SECRET,   // long random string, never in code
  name: 'sid',                          // do not reveal "connect.sid" / Express
  resave: false,                        // do not rewrite unchanged sessions
  saveUninitialized: false,             // no empty sessions for anonymous visitors
  rolling: true,                        // each request extends the 7 days
  cookie: {
    httpOnly: true,                     // JS cannot read it (XSS protection)
    secure: true,                       // HTTPS only
    sameSite: 'lax',                    // basic CSRF protection
    maxAge: SEVEN_DAYS_MS,              // also becomes the Redis key TTL
  },
}));
\`\`\`

**3. Log out from all devices:**

\`\`\`javascript
// at login: remember which sessions belong to this user
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);       // your own check
  req.session.regenerate(async (err) => {           // new id on login (stops session fixation)
    if (err) return res.status(500).end();
    req.session.userId = user.id;
    await redis.sadd(\`user:\${user.id}:sessions\`, req.session.id);
    res.json({ ok: true });
  });
});

app.post('/logout-all', async (req, res) => {
  const setKey = \`user:\${req.session.userId}:sessions\`;
  const ids = await redis.smembers(setKey);
  if (ids.length) {
    await redis.del(...ids.map((id) => \`sess:\${id}\`), setKey); // delete every session + the index
  }
  req.session.destroy(() => res.json({ ok: true }));
});
\`\`\`

**Why it works:** the cookie only holds a signed session **id**. The data lives in Redis, which all servers share and which survives deploys. Redis TTLs clean up expired sessions automatically.

**Edge cases:**
- The \`user:<id>:sessions\` set can contain ids that already expired. Deleting a missing key is harmless; you can also clean the set on logout.
- Redis is now **critical**: if it goes down, nobody can log in. Use a managed Redis with a replica, and enable persistence (AOF) if losing sessions on a restart is not acceptable.
- Alternative: stateless JWTs avoid a session store, but then "log out everywhere" needs a denylist (often in Redis anyway).`,
      followUps: [
        {
          q: 'Could you use sticky sessions on the load balancer instead?',
          a: 'It hides the problem: a server restart or scale-down still logs those users out, and load can become uneven. A shared store is the robust fix.',
        },
        {
          q: 'Sessions in Redis or JWT?',
          a: 'Sessions: easy to revoke instantly, small cookie, but need a store lookup per request. JWT: no lookup, good across services, but hard to revoke before expiry. Many apps use short-lived JWT access tokens plus a refresh token stored server-side.',
        },
      ],
    },
    {
      id: 'fixed-window-rate-limiter',
      title: 'Fixed-window rate limiter: 100 requests per minute per API key',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'rate-limiting',
      question: `Write an Express middleware with ioredis that allows each API key **100 requests per minute**. Over the limit, respond \`429 Too Many Requests\` with a \`Retry-After\` header. Also set \`X-RateLimit-Remaining\`. It must work correctly with **many API servers**.

A teammate wrote this. Find the bug first:

\`\`\`javascript
async function rateLimit(req, res, next) {
  const key = 'rl:' + req.get('x-api-key');
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60);
  }
  if (count > 100) return res.status(429).send('Too many requests');
  next();
}
\`\`\``,
      hints: [
        'What happens if the server crashes (or the network fails) between `INCR` and `EXPIRE`?',
        'A key with no TTL never resets. That API key is blocked forever after 100 requests.',
        'Make INCR + EXPIRE atomic: a small Lua script, or `MULTI` with `EXPIRE key 60 NX` (Redis 7+). Putting the window number in the key name also makes resets automatic.',
      ],
      solution: `**The bug:** \`INCR\` and \`EXPIRE\` are two separate commands. If the process dies, times out or restarts right after \`INCR\` returns 1, the key is created **without a TTL**. It never resets, so after 100 requests that customer is blocked forever. The fix is to make "increment and set TTL" **atomic**.

**Idea:** one counter per API key per minute. Redis \`INCR\` is atomic, so many servers can share the counter without races.

\`\`\`javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

const LIMIT = 100;
const WINDOW_SECONDS = 60;

// Runs inside Redis as one atomic step: nothing can happen between INCR and EXPIRE.
const INCR_WITH_TTL = \`
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count\`;

export async function rateLimit(req, res, next) {
  const apiKey = req.get('x-api-key');
  if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

  // window id changes every minute -> the key name itself rotates
  const windowId = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = \`rl:\${apiKey}:\${windowId}\`;

  let count;
  try {
    count = await redis.eval(INCR_WITH_TTL, 1, key, WINDOW_SECONDS);
  } catch (err) {
    console.warn('rate limiter unavailable, allowing request', err.message);
    return next(); // "fail open": do not take the API down because Redis is down
  }

  const secondsLeft = WINDOW_SECONDS - (Math.floor(Date.now() / 1000) % WINDOW_SECONDS);
  res.set('X-RateLimit-Limit', String(LIMIT));
  res.set('X-RateLimit-Remaining', String(Math.max(0, LIMIT - count)));

  if (count > LIMIT) {
    res.set('Retry-After', String(secondsLeft));
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}
\`\`\`

**Alternative without Lua (Redis 7+):**

\`\`\`javascript
const [[, count]] = await redis
  .multi()
  .incr(key)
  .expire(key, WINDOW_SECONDS, 'NX') // NX = only set a TTL if the key has none
  .exec();
\`\`\`

**Why it works:** the whole check is one atomic Redis operation, shared by all servers. Each minute uses a new key, and old keys expire by themselves.

**Weakness of fixed windows:** a client can send 100 requests at 12:00:59 and 100 more at 12:01:00, which is 200 in about one second. If that matters, use a sliding window (next problems) or a token bucket.

**Fail open or closed?** For a public API, fail open (allow) so a Redis outage does not cause a full outage. For a login or OTP endpoint, fail closed (deny), because abuse there is worse.`,
      followUps: [
        {
          q: 'Should you limit by IP or by user?',
          a: 'By API key or user id when the caller is authenticated (fair and precise). By IP for anonymous routes like login and signup, but remember many users can share one IP (offices, mobile carriers), so set those limits higher and combine with per-account limits.',
        },
        {
          q: 'Why not count requests in a JavaScript Map?',
          a: 'Each server would have its own Map, so with 3 servers a client gets 3x the limit, and counts reset on every restart. Redis gives one shared, atomic counter.',
        },
      ],
    },
    {
      id: 'otp-expiry-attempt-limit',
      title: 'Store login OTPs with expiry, attempt limit and resend cooldown',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'ttl-expiry',
      question: `Build the backend for "login with a 6-digit code sent by SMS" using ioredis. Rules:

- The code is valid for **5 minutes**.
- The user gets at most **5 wrong attempts**; after that the code is dead and they must request a new one.
- A user can request a new code at most **once every 60 seconds**.
- A code can be used **only once**.
- Two verify requests arriving at the same time must not both get extra guesses.

Write \`sendOtp(phone)\` and \`verifyOtp(phone, code)\`.`,
      hints: [
        'Redis TTL does the 5-minute expiry for you: no cron job needed. A separate key with `SET ... EX 60 NX` works as the resend cooldown.',
        'Store the code and the attempt counter together in a hash: `HSET otp:<phone> hash <...> attempts 0`.',
        'Checking attempts, comparing the code, and incrementing must happen as one step. Use a Lua script so two parallel requests cannot both read "attempts = 4".',
      ],
      solution: `**Idea:** one Redis hash per phone holds a **hash** of the code and the number of failed attempts, with a 5-minute TTL. A Lua script does "check limit → compare → delete or count the failure" atomically.

\`\`\`javascript
import Redis from 'ioredis';
import { randomInt, createHash } from 'node:crypto';

const redis = new Redis(process.env.REDIS_URL);
const OTP_TTL = 300;        // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN = 60; // seconds

// Store only a hash, so a leaked Redis dump does not reveal live codes.
const hashCode = (phone, code) =>
  createHash('sha256').update(\`\${phone}:\${code}:\${process.env.OTP_PEPPER}\`).digest('hex');

export async function sendOtp(phone) {
  // NX = only set if missing -> null means a code was sent less than 60s ago
  const allowed = await redis.set(\`otp:cooldown:\${phone}\`, '1', 'EX', RESEND_COOLDOWN, 'NX');
  if (!allowed) return { ok: false, error: 'Please wait before requesting a new code' };

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0'); // crypto-safe, keeps leading zeros
  const key = \`otp:\${phone}\`;
  await redis
    .multi()
    .del(key)                                                   // a new code replaces the old one
    .hset(key, 'hash', hashCode(phone, code), 'attempts', 0)
    .expire(key, OTP_TTL)
    .exec();

  await sms.send(phone, \`Your login code is \${code}\`);       // your SMS provider
  return { ok: true };
}

// Returns: 1 = correct, 0 = wrong, -1 = no code / expired, -2 = too many attempts
const VERIFY_LUA = \`
local data = redis.call('HGETALL', KEYS[1])
if #data == 0 then return -1 end

local h = {}
for i = 1, #data, 2 do h[data[i]] = data[i + 1] end

if tonumber(h.attempts) >= tonumber(ARGV[2]) then
  redis.call('DEL', KEYS[1])
  return -2
end

if h.hash == ARGV[1] then
  redis.call('DEL', KEYS[1])          -- single use
  return 1
end

redis.call('HINCRBY', KEYS[1], 'attempts', 1)
return 0\`;

export async function verifyOtp(phone, code) {
  const result = await redis.eval(
    VERIFY_LUA, 1, \`otp:\${phone}\`, hashCode(phone, String(code)), MAX_ATTEMPTS);

  if (result === 1) return { ok: true };
  if (result === -2) return { ok: false, error: 'Too many attempts. Request a new code.' };
  if (result === -1) return { ok: false, error: 'Code expired. Request a new code.' };
  return { ok: false, error: 'Wrong code' };
}
\`\`\`

**Why it works:**
- **Expiry** is Redis TTL. The key simply disappears after 5 minutes.
- **Cooldown** is a separate key created with \`SET NX EX\`: it exists for 60 seconds, so a second send in that time fails.
- **Single use:** a correct code deletes the key.
- **Atomic attempts:** Redis runs a Lua script without running any other command in the middle. Two parallel guesses are handled one after the other, so nobody gets a sixth try.

**Tested behaviour:** five wrong guesses return 0, and the sixth call returns -2 even with the right code.

**Edge cases and security:**
- A 6-digit code has 1,000,000 values. 5 attempts per code plus the 60s cooldown keeps brute force very slow. Also rate-limit per IP and per phone per day (SMS costs money).
- Use \`crypto.randomInt\`, not \`Math.random\`, which is predictable.
- Give the same error timing for "wrong" and "expired" if you worry about enumeration.`,
      followUps: [
        {
          q: 'Why not store the code in the database with an expires_at column?',
          a: 'You can, but you then need a cleanup job, an index, and careful locking for the attempt counter. Redis gives TTL, atomic counters and Lua for free, and the data is short-lived, so losing it on a crash only means "request a new code".',
        },
        {
          q: 'How would you limit SMS sends to 5 per phone per day?',
          a: 'A counter key `otp:daily:<phone>:<YYYY-MM-DD>` with `INCR` and a 24-hour TTL (set atomically, like the fixed-window rate limiter). Refuse to send when it is above 5.',
        },
      ],
    },
    {
      id: 'debug-stale-cache-after-update',
      title: 'Debug: users still see the old price after an update',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'cache-invalidation-stampede',
      question: `Admins change a product price. Most of the time the site shows the new price. But sometimes the **old price stays for the full 1-hour TTL**, especially during busy hours.

\`\`\`javascript
// read path (cache-aside)
async function getProduct(id) {
  const cached = await redis.get(\`product:\${id}\`);
  if (cached) return JSON.parse(cached);
  const product = await db.products.findById(id);         // reads from a READ REPLICA
  await redis.set(\`product:\${id}\`, JSON.stringify(product), 'EX', 3600);
  return product;
}

// write path
async function updatePrice(id, price) {
  await redis.del(\`product:\${id}\`);                        // 1. invalidate
  await db.products.update(id, { price });                  // 2. write to PRIMARY
}
\`\`\`

Find the race conditions and fix them.`,
      hints: [
        'Draw a timeline with two requests: the admin update, and a customer read that happens in the middle of it.',
        'Bug 1: the cache is deleted BEFORE the database write. A reader can refill the cache with the old row in between.',
        'Bug 2: even after the write, the read replica may lag behind the primary for a short time. A reader that misses the cache can load the old row from the replica.',
      ],
      solution: `**Bug 1 — delete happens before the write:**

\`\`\`text
admin: DEL product:42
user:  GET product:42 -> miss
user:  SELECT from DB -> old price (update not done yet)
user:  SET product:42 = old price, EX 3600      <- stale for 1 hour
admin: UPDATE price in DB
\`\`\`

**Bug 2 — replica lag:** even with the right order, the reader queries a **replica**. Replication is asynchronous, so for a few milliseconds (or seconds under load) the replica still has the old price, and the reader caches it.

**Fixes:**

\`\`\`javascript
const key = (id) => \`product:\${id}\`;

async function updatePrice(id, price) {
  await db.products.update(id, { price });   // 1. write the source of truth FIRST
  await redis.del(key(id));                  // 2. then invalidate

  // 3. "delayed double delete": remove anything a lagging reader put back
  setTimeout(() => {
    redis.del(key(id)).catch((err) => console.warn('second delete failed', err.message));
  }, 2000);                                  // a bit longer than typical replica lag
}

async function getProduct(id) {
  const cached = await redis.get(key(id));
  if (cached) return JSON.parse(cached);
  const product = await db.products.findById(id, { usePrimary: true }); // refill from PRIMARY
  // shorter TTL = smaller damage if something is still missed
  await redis.set(key(id), JSON.stringify(product), 'EX', 600);
  return product;
}
\`\`\`

**Why it works:**
- Writing first means anyone who misses the cache **after** the delete reads the new row from the primary.
- Reading cache misses from the **primary** avoids replica lag. Cache misses are rare, so the extra primary load is small.
- The delayed second delete is a cheap safety net for remaining edge cases (a reader that started before the write and finished after the delete).
- A shorter TTL limits how long any missed case can last.

**Stronger options (mention them):**
- **Versioned values:** store \`updatedAt\` or a version number in the cached JSON, and only overwrite with a newer version (a Lua script compares before \`SET\`).
- **Change data capture:** listen to the database's change stream (MongoDB change streams, Postgres logical replication/Debezium) and invalidate from there, so no code path can forget.
- In a DB transaction, delete the cache **after COMMIT**, not inside the transaction. Otherwise a reader may refill the cache before the commit is visible.
- Remember **other keys** that include the price: category pages, search results, the cart.`,
      followUps: [
        {
          q: 'Why delete the key instead of setting the new value on update?',
          a: 'Two concurrent updates can call SET in the wrong order, leaving the older value in the cache. Delete has no order problem: whatever happens, the next reader loads the current row.',
        },
        {
          q: 'What if the redis.del call fails?',
          a: 'Retry it (a small queue or outbox), log it, and rely on the TTL as the last line of defence. For critical data, invalidate from the database change stream so failed deletes are retried automatically.',
        },
      ],
    },
    {
      id: 'debug-keys-evicted-maxmemory',
      title: 'Debug: sessions and job data disappear from Redis',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'eviction-policies',
      question: `One Redis instance (2 GB) is shared by three things: the product **cache**, user **sessions**, and a **BullMQ** job queue. During a sale, users are logged out at random, and some background jobs vanish. Nobody deleted anything. \`INFO\` shows:

\`\`\`text
# Memory
used_memory_human:1.99G
maxmemory_human:2.00G
maxmemory_policy:allkeys-lru

# Stats
evicted_keys:184233
expired_keys:9120
keyspace_hits:5123344
keyspace_misses:2981100
\`\`\`

1. What is happening?
2. Why is \`allkeys-lru\` the wrong policy for this setup, and what would happen with \`noeviction\` or \`volatile-lru\` instead?
3. How do you fix it properly?`,
      hints: [
        '`used_memory` is at `maxmemory` and `evicted_keys` is large. What does Redis do when it is full?',
        '`allkeys-lru` may evict ANY key, including sessions and queue data, not only cache keys.',
        'Data that must not be lost and data that can be thrown away should not share an eviction policy. Separate them, or make sure only cache keys can be evicted.',
      ],
      solution: `**1. What is happening:** Redis reached \`maxmemory\` (2 GB). With \`allkeys-lru\`, every new write makes Redis **evict** (delete) the least recently used keys, from **all** keys. 184,233 keys were evicted. Sessions of users who were idle for a few minutes, and waiting jobs, look "old" to LRU, so they were deleted. The misses (2.98M vs 5.1M hits, about 37% miss rate) also show the cache is too small.

**2. The policies:**

\`\`\`text
 policy         | what happens when memory is full
----------------+-------------------------------------------------------------------
 allkeys-lru    | evict any key (least recently used) -> loses sessions and jobs
 allkeys-lfu    | evict any key (least frequently used) -> same problem
 volatile-lru   | evict only keys WITH a TTL; if none left -> write errors (OOM)
 volatile-ttl   | evict keys with a TTL, soonest expiry first
 noeviction     | evict nothing; writes fail with an "OOM command not allowed" error
\`\`\`

- \`noeviction\` protects sessions and jobs, but during the sale **all** writes (cache fills, new logins) would fail with OOM errors.
- \`volatile-lru\` only evicts keys that have a TTL. But sessions **also** have a TTL, so they can still be evicted.

**3. Proper fix:**

\`\`\`text
Redis A  "cache"     maxmemory 4gb, maxmemory-policy allkeys-lfu    <- safe to lose
Redis B  "data"      maxmemory-policy noeviction, AOF on            <- sessions + BullMQ
\`\`\`

- **Separate instances by purpose.** Cache data can be thrown away; session and queue data cannot. BullMQ's docs say to use \`noeviction\`, because evicted job keys break the queue.
- **Monitor and alert** on \`used_memory\` vs \`maxmemory\` and on \`evicted_keys\` going up on the data instance (it should be 0).
- **Find what is big:** \`redis-cli --bigkeys\` or \`--memkeys\`, and \`MEMORY USAGE <key>\`. Often a few huge values (a whole category page as JSON) or keys **without a TTL** that grow forever.
- **Give every cache key a TTL**, store smaller values (only needed fields, maybe compressed), and size the cache from the hit rate you need.

If you must keep one instance for now: use \`volatile-lru\`, give cache keys a TTL, and keep sessions/jobs **without** an eviction-eligible TTL (BullMQ keys have none; sessions could be cleaned by the app instead). It is fragile, so plan the split.`,
      followUps: [
        {
          q: 'LRU vs LFU: which is better for a cache?',
          a: 'LRU evicts what was not used recently; LFU evicts what is used rarely. LFU (Redis 4+) handles "one big scan touched many keys once" better, because those keys still have low frequency. For typical web caches with stable hot items, `allkeys-lfu` is often a good default.',
        },
        {
          q: 'What is the default maxmemory-policy?',
          a: 'On self-hosted Redis the default is `noeviction`, and `maxmemory` is 0 (no limit) on 64-bit systems, so Redis can grow until the OS kills it. Managed services often set their own defaults (for example ElastiCache uses `volatile-lru`), so always check.',
        },
      ],
    },
    {
      id: 'socketio-pubsub-multiple-instances',
      title: 'Broadcast Socket.IO events across several Node servers',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'pub-sub-streams',
      question: `A chat app runs **3 Node servers** behind a load balancer. User A is connected (WebSocket) to server 1, user B to server 2. When A sends a message in room "team-42", B never receives it. With 1 server everything worked.

\`\`\`javascript
io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
  socket.on('message', ({ room, text }) => {
    io.to(room).emit('message', { text, from: socket.id });
  });
});
\`\`\`

1. Why does B not get the message?
2. Fix it with Redis.
3. A background worker (not a Socket.IO server) needs to push "your report is ready" to a user. How?
4. What are the limits of Redis Pub/Sub here?`,
      hints: [
        '`io.to(room).emit` only knows about sockets connected to **this** process.',
        'Every server must hear about every broadcast. Redis Pub/Sub delivers a published message to all subscribed servers.',
        'Socket.IO has an official Redis adapter: `@socket.io/redis-adapter`. Workers can use `@socket.io/redis-emitter`.',
      ],
      solution: `**1. Why:** each Node process keeps its own list of connected sockets and rooms in memory. Server 1 emits to "team-42", but only sockets on **server 1** are in its list. Server 2 never hears about it.

**2. Fix — the Redis adapter:** every server publishes broadcasts to Redis and subscribes to receive broadcasts from the others.

\`\`\`javascript
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

const httpServer = createServer();
const io = new Server(httpServer);

const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate(); // a subscribed connection cannot run normal commands

io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
  socket.on('message', ({ room, text }) => {
    // Same code as before. The adapter now also publishes this to Redis,
    // and every other server delivers it to its own sockets in "team-42".
    io.to(room).emit('message', { text, from: socket.id });
  });
});

httpServer.listen(3000);
\`\`\`

**Load balancer note:** if clients may use HTTP long-polling (Socket.IO's fallback), enable **sticky sessions**, because one polling session must keep hitting the same server. Pure WebSocket connections stay on one server anyway.

**3. From a worker — the Redis emitter:**

\`\`\`javascript
import { Emitter } from '@socket.io/redis-emitter';
import Redis from 'ioredis';

const emitter = new Emitter(new Redis(process.env.REDIS_URL));

// After each user connects, the server does: socket.join(\`user:\${userId}\`)
emitter.to(\`user:\${userId}\`).emit('report-ready', { reportId });
\`\`\`

**Why it works:** Redis Pub/Sub sends every published message to all current subscribers. Each Socket.IO server is a subscriber, so each one delivers the event to its local sockets.

**4. Limits of Pub/Sub:**
- **Fire and forget:** if a server is disconnected from Redis for a moment, messages sent during that time are lost. Nothing is stored.
- **No history:** a user who was offline misses messages. Store chat messages in the database and load history on reconnect.
- **Everyone gets everything:** every server receives every broadcast, which costs CPU at very large scale. (Socket.IO also has a sharded adapter for Redis 7 sharded Pub/Sub.)
- For guaranteed delivery between services, use **Redis Streams** (stored, consumer groups, acknowledgements) or a real queue.`,
      followUps: [
        {
          q: 'Pub/Sub vs Streams in one sentence?',
          a: 'Pub/Sub is a live radio broadcast: if you are not listening, you miss it. Streams are a stored log: consumers read at their own pace, can catch up, and acknowledge what they processed.',
        },
        {
          q: 'How do you send a message to one specific user who has 3 tabs open on different servers?',
          a: 'Put every socket of that user into a room named after them (`socket.join(\'user:\' + userId)` after authentication) and emit to that room. The adapter delivers to all their tabs on all servers.',
        },
      ],
    },
    {
      id: 'debug-hot-key',
      title: 'Debug: one Redis node at 100% CPU during a product launch',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'occasional',
      relatedTopic: 'replication-sentinel-cluster',
      question: `You use a **Redis Cluster** with 6 primary nodes. During a big product launch, one node goes to 100% CPU and its latency jumps to 200 ms, while the other 5 nodes are almost idle. Every request to the launch page reads one key:

\`\`\`javascript
const page = await redis.get('product:launch-2026'); // ~500 KB JSON, ~150,000 reads/second
\`\`\`

1. Why is only one node overloaded? Adding more nodes did not help. Why?
2. How do you confirm which key is the problem?
3. Give at least three fixes.`,
      hints: [
        'In Redis Cluster each key lives on exactly one node (one hash slot). How are reads for a single key spread?',
        'Redis runs commands on one main thread. 150k reads/sec × 500 KB is also a lot of network bandwidth.',
        'Ideas: a small in-process cache in each Node server, copies of the key spread across nodes, smaller values, read replicas.',
      ],
      solution: `**1. Why one node:** Redis Cluster splits keys into 16,384 **hash slots**, and each slot belongs to one primary. A single key always lives on **one** node, so all 150,000 reads per second go there. Adding nodes spreads **different** keys; it cannot split one key. Each read also sends 500 KB, which is roughly 75 GB/s of traffic on paper, so the node's network and single command thread are both saturated. This is a **hot key** (and also a **big key**).

**2. Confirm it:**
- \`redis-cli --hotkeys\` (needs an LFU \`maxmemory-policy\`) lists the most frequently used keys.
- \`redis-cli --bigkeys\` / \`MEMORY USAGE product:launch-2026\` shows its size.
- \`SLOWLOG GET\`, and a few seconds of \`MONITOR\` on a non-production replica (MONITOR is expensive).
- App-side metrics per key prefix often show it fastest.

**3. Fixes (combine them):**

**a) In-process (L1) cache in each Node server** — the biggest win:

\`\`\`javascript
// Tiny local cache: each API server asks Redis at most once per second for this key.
const local = new Map(); // key -> { value, expiresAt }

async function getHot(key, ttlMs = 1000) {
  const hit = local.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  const raw = await redis.get(key);
  const value = raw === null ? null : JSON.parse(raw);
  local.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}
\`\`\`

With 50 API servers, Redis now sees about 50 reads per second for this key instead of 150,000. The price: data can be up to 1 second old.

**b) Spread copies across nodes** (key splitting):

\`\`\`javascript
const COPIES = 8;
// writer: store the same value under 8 keys that hash to different slots
await Promise.all(Array.from({ length: COPIES }, (_, i) =>
  redis.set(\`product:launch-2026:copy\${i}\`, json, 'EX', 300)));

// reader: pick a random copy
const i = Math.floor(Math.random() * COPIES);
const raw = await redis.get(\`product:launch-2026:copy\${i}\`);
\`\`\`

**c) Make the value small:** cache only the fields the page needs, compress it, or split it (prices change often, description rarely). Serve static parts through a **CDN**.

**d) Read from replicas:** in cluster mode, ioredis \`scaleReads: 'slave'\` spreads reads over replicas (accepting slightly stale data).

**Why it works:** all fixes reduce how many requests hit **one** node, or how many bytes each request moves.`,
      followUps: [
        {
          q: 'What is the problem with very big keys besides traffic?',
          a: 'Commands on them block Redis\'s single thread longer (deleting a huge hash or set can freeze it, so use `UNLINK`, which frees memory in the background), they make replication and failover slower, and they unbalance memory across cluster nodes.',
        },
        {
          q: 'What are hash tags in Redis Cluster?',
          a: 'Only the part inside `{...}` is hashed, so `cart:{42}` and `orders:{42}` go to the same slot. Use them when a multi-key command or Lua script needs several keys together. Do not overuse them, or you create hot slots.',
        },
      ],
    },
    {
      id: 'cap-choose-cp-or-ap',
      title: 'CP or AP? Choose for three real features',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'occasional',
      relatedTopic: 'cap-theorem-pacelc',
      question: `Your system runs in two data centers. A network problem cuts them off from each other (a **partition**). For each feature, decide: keep answering with possibly stale/conflicting data (**AP** — available), or refuse some requests until data can be agreed (**CP** — consistent). Explain the business reason and where Redis fits.

1. "Likes" counter on posts and the "who viewed your profile" count.
2. Seat booking for a concert (each seat can be sold once).
3. The shopping cart.

Bonus: is Redis (with replicas and Sentinel/Cluster failover) CP or AP?`,
      hints: [
        'CAP only forces a choice **during a partition**: Consistency (everyone sees the same latest data) or Availability (every request gets an answer).',
        'Ask: what is worse for the business: a wrong/old number, or an error page?',
        'Redis replication is asynchronous. What happens to writes the old primary accepted just before a failover?',
      ],
      solution: `**Idea:** CAP says that when the network **splits**, a distributed system must pick: answer anyway (A) and risk inconsistency, or refuse until it can be consistent (C). The right pick depends on the cost of being wrong vs the cost of being down.

**1. Likes / view counts → AP.**
A like count that is off by a few for some seconds hurts nobody. An error page on every post would. Count locally in each region (\`INCR\` in Redis) and merge later. Redis is a great fit.

**2. Concert seats → CP.**
Selling one seat twice means refunds and angry customers. During a partition it is better to say "booking temporarily unavailable" in one region. The source of truth must be a strongly consistent store: one primary database with a unique constraint on \`(event_id, seat_id)\`, or a consensus-based system. Redis can **help** (a short "hold" on a seat with \`SET seat:42:A7 user123 NX EX 600\`) but the final sale is confirmed in the database.

**3. Shopping cart → AP.**
Users must always be able to add items, since that is revenue. If the two sides diverge, merge the carts afterwards (union of items), as Amazon's Dynamo paper famously described. A deleted item might come back, which is a small annoyance compared to "cannot add to cart". Checkout itself (payment, stock) is CP.

**Bonus — Redis:** Redis replication is **asynchronous**. The primary confirms a write before replicas have it. If the primary fails, or is cut off, and a replica is promoted, the writes it had not yet copied are **lost**, and for a short time the old primary may still accept writes that will be thrown away. So Redis with failover leans **AP**: it stays available but can lose acknowledged writes. \`WAIT\` (wait for N replicas) lowers the risk but does not make Redis strongly consistent. That is why money and inventory truth should not live only in Redis.

**PACELC add-on:** even without a partition, there is a trade-off between **latency and consistency**. Reading from a nearby replica is fast but may be stale. Reading from the primary is consistent but slower.`,
      followUps: [
        {
          q: 'Is MongoDB with a replica set CP or AP?',
          a: 'With default settings (reads from the primary, majority write concern in recent versions) it behaves mostly CP: during a partition the minority side has no primary and refuses writes. Reading from secondaries trades consistency for availability and latency.',
        },
        {
          q: 'Why is "CA" not a real option for distributed systems?',
          a: 'Network partitions will happen in any system spread over machines, so you cannot "choose" to avoid P. CA only describes a single-node system, where there is no network to split.',
        },
      ],
    },
    {
      id: 'sliding-window-rate-limiter-lua',
      title: 'Sliding-window rate limiter with a sorted set and Lua',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'rate-limiting',
      question: `The fixed-window limiter lets a client send 2× the limit around a window edge (100 at 12:00:59 and 100 at 12:01:00). Product wants a **true rolling limit**: "at most N requests in **any** window of W milliseconds".

Write \`slidingWindowLimit(userId, limit, windowMs)\` with ioredis that:
- returns \`{ allowed, remaining, retryAfterMs }\`
- is **atomic** across many API servers
- does not count rejected requests against the user

Example (limit 3, window 1000 ms):

\`\`\`text
t=1000 allowed (remaining 2)
t=1100 allowed (remaining 1)
t=1200 allowed (remaining 0)
t=1300 rejected, retry after 700 ms   (oldest request at 1000 leaves the window at 2000)
t=2000 allowed (remaining 0)          (the request at 1000 slid out)
t=2050 rejected, retry after 50 ms
\`\`\``,
      hints: [
        'Store one entry per accepted request, with its timestamp. A sorted set with score = timestamp lets you delete old entries by score range.',
        'Steps: remove entries older than `now - window` (`ZREMRANGEBYSCORE`), count what is left (`ZCARD`), and if below the limit, add the new request (`ZADD`).',
        'Those steps must not interleave between servers. Put them in one Lua script. Members must be unique (timestamp + random id), or two requests in the same millisecond collapse into one.',
      ],
      solution: `**Idea:** a **sliding log**. Each user has a sorted set of request timestamps. For every request: drop timestamps that left the window, count the rest, and accept only if the count is below the limit. A Lua script makes the whole thing one atomic step.

\`\`\`javascript
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';

const redis = new Redis(process.env.REDIS_URL);

const SLIDING_WINDOW_LUA = \`
local key    = KEYS[1]
local now    = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit  = tonumber(ARGV[3])
local member = ARGV[4]

-- 1. forget requests that are older than the window
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

-- 2. how many requests are still inside the window?
local count = redis.call('ZCARD', key)

if count < limit then
  -- 3a. accept: remember this request and keep the key alive for one window
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window)
  return {1, limit - count - 1, 0}
end

-- 3b. reject: tell the client when the oldest request leaves the window
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local retryAfter = tonumber(oldest[2]) + window - now
return {0, 0, retryAfter}\`;

// Register once; ioredis uses EVALSHA and falls back to EVAL automatically.
redis.defineCommand('slidingWindow', { numberOfKeys: 1, lua: SLIDING_WINDOW_LUA });

export async function slidingWindowLimit(userId, limit, windowMs) {
  const now = Date.now();
  const member = \`\${now}-\${randomUUID()}\`; // unique even for requests in the same ms
  const [allowed, remaining, retryAfterMs] =
    await redis.slidingWindow(\`rl:sw:\${userId}\`, now, windowMs, limit, member);
  return { allowed: allowed === 1, remaining, retryAfterMs };
}

// Express usage
export function rateLimit(limit = 100, windowMs = 60_000) {
  return async (req, res, next) => {
    const r = await slidingWindowLimit(req.user.id, limit, windowMs);
    res.set('X-RateLimit-Remaining', String(r.remaining));
    if (!r.allowed) {
      res.set('Retry-After', String(Math.ceil(r.retryAfterMs / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}
\`\`\`

**Why it works:** Redis runs a Lua script from start to end without running other commands in between, so two servers can never both see "2 requests" and both add a third. Only accepted requests are added, so rejected retries do not extend the block. \`PEXPIRE\` deletes the set of a user who stops sending. The example in the question was run against a real Redis and gives exactly those results.

**Trade-offs:**
- **Memory:** one entry per request in the window. With a limit of 10,000/hour per user, that is up to 10,000 entries per user. For big limits use the **sliding window counter** approximation: keep counts for the current and previous fixed windows and estimate \`prev * (1 - elapsedFraction) + current\`. It uses 2 numbers per user.
- **Clocks:** the time comes from the app servers. If their clocks differ, results shift a bit. You can use \`redis.call('TIME')\` inside the script to use Redis's clock instead.
- **Redis Cluster:** the script touches only one key, so it works in cluster mode.`,
      followUps: [
        {
          q: 'What is a token bucket and when is it better?',
          a: 'Each user has a bucket that refills at a steady rate (e.g. 10 tokens/second, max 100). Each request takes a token. It allows short bursts up to the bucket size while keeping the average rate. Store `tokens` and `lastRefill` in a hash and update them in a Lua script. Good for APIs that want to allow bursts.',
        },
        {
          q: 'Why not use MULTI/EXEC instead of Lua?',
          a: 'MULTI/EXEC queues commands and runs them together, but you cannot read the ZCARD result and decide inside the transaction whether to ZADD. Lua can run logic between commands, still atomically.',
        },
      ],
    },
    {
      id: 'prevent-cache-stampede',
      title: 'Prevent a cache stampede on a hot, expensive key',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'cache-invalidation-stampede',
      question: `The home feed is built by a heavy query that takes **300 ms** and is cached in Redis for 5 minutes. About **2,000 requests per second** read it.

Every 5 minutes, exactly when the key expires, database CPU spikes to 100%, the API slows down for several seconds, and sometimes the database falls over.

\`\`\`javascript
async function getHomeFeed() {
  const cached = await redis.get('cache:home-feed');
  if (cached) return JSON.parse(cached);
  const feed = await db.buildHomeFeed();               // 300 ms, heavy
  await redis.set('cache:home-feed', JSON.stringify(feed), 'EX', 300);
  return feed;
}
\`\`\`

1. Explain the problem.
2. Fix it so only **one** request rebuilds the feed.
3. Describe at least two other techniques, and when you would choose each.`,
      hints: [
        'During the 300 ms rebuild, how many requests arrive and also see a cache miss?',
        'Let only the request that wins a Redis lock (`SET lock NX PX`) rebuild. Others wait a little and read the cache again.',
        'Other ideas: refresh the value before it expires (early/probabilistic refresh, or a background job), serve stale data while one request refreshes, and add random jitter to TTLs.',
      ],
      solution: `**1. The problem — cache stampede (thundering herd):** when the key expires, every request in the next 300 ms misses: 2,000/s × 0.3 s ≈ **600 requests** all run the heavy query at the same time. The database is overloaded, so the query gets even slower, so even more requests pile up.

**2. Fix — a rebuild lock (only one request rebuilds):**

\`\`\`javascript
import { randomUUID } from 'node:crypto';

const KEY = 'cache:home-feed';
const LOCK_KEY = 'lock:cache:home-feed';
const TTL = 300;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Delete the lock only if we still own it (see the distributed-lock problem).
const RELEASE_LUA = \`
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0\`;

async function getHomeFeed() {
  for (let attempt = 0; attempt < 50; attempt++) {          // wait at most ~5 s
    const cached = await redis.get(KEY);
    if (cached !== null) return JSON.parse(cached);

    const token = randomUUID();
    const gotLock = await redis.set(LOCK_KEY, token, 'PX', 10_000, 'NX'); // auto-expires if we crash
    if (gotLock) {
      try {
        const again = await redis.get(KEY);                  // someone may have just filled it
        if (again !== null) return JSON.parse(again);

        const feed = await db.buildHomeFeed();
        const ttl = TTL + Math.floor(Math.random() * 30);    // jitter
        await redis.set(KEY, JSON.stringify(feed), 'EX', ttl);
        return feed;
      } finally {
        await redis.eval(RELEASE_LUA, 1, LOCK_KEY, token);
      }
    }
    await sleep(50 + Math.random() * 50);                    // someone else is rebuilding
  }
  return db.buildHomeFeed();                                 // last resort
}
\`\`\`

Tested with 200 parallel calls on an empty cache: the database was called **once**, and all 200 got the feed.

**3. Other techniques:**

**a) Stale-while-revalidate (never let users wait):** store the value with a "soft" expiry inside it and a longer real TTL. If the soft expiry passed, return the **stale** value right away and let one request (holding the lock) refresh in the background. Best for feeds and listings where a few seconds of staleness is fine.

**b) Probabilistic early refresh ("XFetch"):** each reader may refresh a bit **before** expiry, with a probability that grows as expiry gets closer and as the rebuild cost grows. The refresh happens once, early, by one lucky request, and no lock is needed:

\`\`\`javascript
// value stored as { value, delta (rebuild ms), expiresAt (ms) }
const shouldRefreshEarly = (delta, expiresAt, beta = 1) =>
  Date.now() - delta * beta * Math.log(Math.random()) >= expiresAt;
// Math.log(Math.random()) is negative, so this adds a random "head start"
\`\`\`

**c) Background refresh:** a cron job or worker rebuilds the key every 4 minutes, and the TTL is longer (10 minutes). Readers never trigger a rebuild. Best for a few known, very hot keys.

**d) Jittered TTLs:** add randomness to TTLs so thousands of keys written together do not all expire at the same second. It helps with many keys, not with one hot key.

**e) In-process request coalescing:** within one Node process, keep a \`Map<key, Promise>\` so concurrent misses await the same promise. It reduces load per server, but with 20 servers you still get 20 rebuilds, so combine it with the Redis lock.`,
      followUps: [
        {
          q: 'What happens if the request holding the lock crashes?',
          a: 'The lock has a PX timeout (10 s here), so it expires and another request takes over. Pick a timeout well above the normal rebuild time, but not so long that users wait forever.',
        },
        {
          q: 'Cache stampede vs cache penetration vs cache avalanche?',
          a: 'Stampede: many requests rebuild the same hot key at once. Penetration: requests for keys that do not exist always miss and hit the DB (fix: cache "not found" or use a Bloom filter). Avalanche: many keys expire together, or the whole cache goes down (fix: jitter, warm-up, replicas, circuit breakers).',
        },
      ],
    },
    {
      id: 'distributed-lock-cron-job',
      title: 'Run a cron job only once when 3 servers all schedule it',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'distributed-locks',
      question: `Your Node API runs on **3 servers**. Each one uses \`node-cron\` to run \`sendDailyInvoices()\` at 09:00. Customers now get **3 invoice emails**.

A teammate's fix:

\`\`\`javascript
cron.schedule('0 9 * * *', async () => {
  const locked = await redis.get('lock:daily-invoices');
  if (locked) return;
  await redis.set('lock:daily-invoices', '1');
  await sendDailyInvoices();               // takes 2-10 minutes
  await redis.del('lock:daily-invoices');
});
\`\`\`

1. List what is wrong with this lock.
2. Write a correct lock with ioredis: acquire, safe release, and extend for long jobs.
3. Even with a correct lock, how can an invoice still be sent twice, and how do you make that safe?`,
      hints: [
        'GET then SET is two steps: all 3 servers can GET "nothing" before any of them SETs. And what if the process crashes before DEL?',
        'Acquire with one atomic command: `SET key <random token> NX PX <ms>`. NX = only if absent, PX = auto-expire.',
        'Release only if the value is still YOUR token (Lua: GET + compare + DEL). For long jobs, extend the TTL periodically with the same check. And make the job itself idempotent.',
      ],
      solution: `**1. What is wrong:**
- **Race:** \`GET\` and \`SET\` are separate. All 3 servers can run \`GET\` at 09:00:00.000, see nothing, and all set the lock.
- **No expiry:** if the process crashes or is redeployed mid-job, \`DEL\` never runs and the lock stays **forever**. No invoices again, ever.
- **Unsafe release:** any server can \`DEL\` the lock, even one that does not own it.

**2. A correct lock:**

\`\`\`javascript
import Redis from 'ioredis';
import cron from 'node-cron';
import { randomUUID } from 'node:crypto';

const redis = new Redis(process.env.REDIS_URL);

// Delete only if the lock still holds OUR token.
const RELEASE_LUA = \`
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0\`;

// Extend only if we still own it.
const EXTEND_LUA = \`
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('PEXPIRE', KEYS[1], ARGV[2])
end
return 0\`;

async function withLock(key, ttlMs, fn) {
  const token = randomUUID();                                      // proves ownership
  const ok = await redis.set(key, token, 'PX', ttlMs, 'NX');       // atomic "take if free"
  if (ok !== 'OK') return { ran: false };                          // another server has it

  // Heartbeat: keep the lock alive while the job runs.
  const heartbeat = setInterval(async () => {
    const still = await redis.eval(EXTEND_LUA, 1, key, token, ttlMs).catch(() => 0);
    if (still !== 1) console.error(\`lost lock \${key}; another server may run the job\`);
  }, ttlMs / 3);

  try {
    return { ran: true, result: await fn() };
  } finally {
    clearInterval(heartbeat);
    await redis.eval(RELEASE_LUA, 1, key, token);                  // safe release
  }
}

cron.schedule('0 9 * * *', async () => {
  const today = new Date().toISOString().slice(0, 10);            // e.g. 2026-10-07
  const { ran } = await withLock(\`lock:daily-invoices:\${today}\`, 60_000, sendDailyInvoices);
  if (!ran) console.log('another server is sending invoices');
});
\`\`\`

**Why it works:**
- \`SET NX PX\` is **one atomic command**: exactly one server gets \`'OK'\`, the others get \`null\`.
- The **TTL** frees the lock if the owner crashes.
- The **random token** means a server can only release or extend its own lock. Without it: server A's lock expires while A is slow, B takes it, then A finishes and deletes **B's** lock.
- The **heartbeat** keeps a 10-minute job safe with a 60-second TTL, without leaving a long stuck lock after a crash.
- Putting the date in the key also stops a server whose clock is a few seconds off from re-running after the first one finished. (For that, do not delete the lock at the end; let it expire, or keep a separate "done for today" key.)

**3. Why it can still run twice — and the real fix:** a lock with a TTL is not perfect. A long **GC pause** or network freeze can make the lock expire while the owner still thinks it holds it, and a Redis failover can lose the lock key (replication is asynchronous). So make the job **idempotent**:

\`\`\`sql
-- each invoice row is claimed once; a second run finds nothing to do
UPDATE invoices SET status = 'sending'
WHERE id = $1 AND status = 'pending'
RETURNING id;
\`\`\`

and use an idempotency key with the email provider. Then a rare double run is harmless.

**Alternatives:** run scheduled jobs in **one** place (a single worker, a BullMQ repeatable job, AWS EventBridge/Cloud Scheduler calling an endpoint), or use a Postgres advisory lock (\`pg_try_advisory_lock\`). For strict correctness, use a lock with **fencing tokens** (an increasing number checked by the database) from a consensus system like etcd or ZooKeeper.`,
      followUps: [
        {
          q: 'What is Redlock and is it needed here?',
          a: 'Redlock takes the lock on a majority of several independent Redis primaries (e.g. 3 of 5) so one Redis failing does not lose the lock. It is debated (Martin Kleppmann\'s critique: timing assumptions, no fencing). For "avoid doing a job twice for efficiency", a single-Redis lock plus an idempotent job is usually enough.',
        },
        {
          q: 'What is a fencing token?',
          a: 'A number that increases every time the lock is granted. The worker sends it with every write, and the storage rejects writes with a token lower than one it has already seen. Even if an old lock holder wakes up late, its writes are refused.',
        },
      ],
    },
  ],
};
