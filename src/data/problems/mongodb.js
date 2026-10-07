// Interview problems for the MongoDB stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.
// Queries are written in mongosh (shell) syntax. In Node, use the same objects with
// the driver or Mongoose (use `new Date(...)` instead of `ISODate(...)`).

export default {
  stackId: 'mongodb',
  problems: [
    {
      id: 'find-products-with-operators',
      title: 'Find in-stock products by category and price range',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'query-operators',
      question: `You have a \`products\` collection:

\`\`\`javascript
{ _id: 1, name: 'MacBook Air', category: 'laptop', price: 1199, stock: { qty: 5,  warehouse: 'BLR' } }
{ _id: 2, name: 'iPhone 15',   category: 'phone',  price: 799,  stock: { qty: 0,  warehouse: 'BLR' } }
{ _id: 3, name: 'Pixel 8',     category: 'phone',  price: 699,  stock: { qty: 12, warehouse: 'DEL' } }
{ _id: 4, name: 'ThinkPad X1', category: 'laptop', price: 1899, stock: { qty: 3,  warehouse: 'DEL' } }
{ _id: 5, name: 'AirPods',     category: 'audio',  price: 249,  stock: { qty: 40, warehouse: 'BLR' } }
\`\`\`

Write a query that returns products that are:

- in category **laptop or phone**,
- priced **between 500 and 1500** (inclusive),
- **in stock** (\`stock.qty\` greater than 0).

Return only \`name\` and \`price\` (no \`_id\`), cheapest first.`,
      hints: [
        'For "category is one of these values" there is an operator that takes an array.',
        'Two conditions on the same field (price) go inside ONE object: `{ $gte: ..., $lte: ... }`.',
        'To reach a field inside an embedded object, use dot notation in quotes: `\'stock.qty\'`.',
      ],
      solution: `**Idea:** put all conditions in one filter object (they are ANDed by default), use \`$in\` for the category list, a range for price, and dot notation for the nested stock field.

\`\`\`javascript
db.products
  .find(
    {
      category: { $in: ['laptop', 'phone'] },  // laptop OR phone
      price: { $gte: 500, $lte: 1500 },        // 500 <= price <= 1500
      'stock.qty': { $gt: 0 },                 // nested field -> dot notation in quotes
    },
    { _id: 0, name: 1, price: 1 }              // projection: only these fields
  )
  .sort({ price: 1 });                         // 1 = ascending (cheapest first)

// Same thing in Mongoose
await Product.find(
  { category: { $in: ['laptop', 'phone'] }, price: { $gte: 500, $lte: 1500 }, 'stock.qty': { $gt: 0 } },
  { _id: 0, name: 1, price: 1 }
).sort({ price: 1 }).lean();
\`\`\`

**Expected output:**

\`\`\`javascript
{ name: 'Pixel 8', price: 699 }
{ name: 'MacBook Air', price: 1199 }
\`\`\`

iPhone 15 is out of stock, ThinkPad is too expensive, AirPods is the wrong category.

**Why it works:** fields listed side by side in a filter are combined with AND. \`$in\` is a short way to write "equals any of these". Putting \`$gte\` and \`$lte\` in the same object makes both apply to the same value.

**Edge case:** do NOT write \`{ stock: { qty: { $gt: 0 } } }\`. That asks for a \`stock\` object that is **exactly** \`{ qty: { $gt: 0 } }\` and matches nothing. Always use dot notation for nested fields.`,
      followUps: [
        {
          q: 'Is `$in` the same as `$or`?',
          a: 'For one field, yes in meaning: `{ category: { $in: [a, b] } }` equals `{ $or: [{ category: a }, { category: b }] }`. `$in` is shorter and easier for the planner. Use `$or` when the conditions are on **different** fields.',
        },
        {
          q: 'Which index would help this query?',
          a: 'By the ESR rule (Equality, Sort, Range): `{ category: 1, price: 1 }` works well here because the sort field and the range field are both `price`. You could add `\'stock.qty\'` at the end so the stock check is done using the index too.',
        },
        {
          q: 'What does `price: { $gt: 500 }` do if some products store price as a string?',
          a: 'Comparison operators only match values of the same BSON type group, so string prices are silently skipped. Keep types consistent with a Mongoose schema or `$jsonSchema` validation.',
        },
      ],
    },
    {
      id: 'elemmatch-array-of-objects',
      title: 'Why does this array query return the wrong orders? ($elemMatch)',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'query-operators',
      question: `\`orders\` collection:

\`\`\`javascript
{ _id: 1, items: [ { sku: 'A', qty: 1 }, { sku: 'B', qty: 5 } ] }
{ _id: 2, items: [ { sku: 'A', qty: 3 } ] }
{ _id: 3, items: [ { sku: 'B', qty: 2 } ] }
\`\`\`

We want orders that contain **one item** with \`sku: 'A'\` **and** \`qty >= 2\`. A teammate wrote:

\`\`\`javascript
db.orders.find({ 'items.sku': 'A', 'items.qty': { $gte: 2 } });
\`\`\`

It returns orders **1 and 2**. Why is order 1 returned? Fix the query so only order 2 comes back.`,
      hints: [
        'Look at order 1. Is there an item with sku A? Is there an item with qty >= 2? Are they the SAME item?',
        'With dot notation, each condition can be satisfied by a DIFFERENT array element.',
        'There is an operator that forces all conditions to match the same element.',
      ],
      solution: `**Idea:** with dot notation on an array, each condition is checked **separately** against all elements. Order 1 has an item with sku A (item 0) and an item with qty 5 (item 1), so it matches. \`$elemMatch\` makes all conditions apply to the **same** element.

\`\`\`javascript
db.orders.find({
  items: {
    $elemMatch: { sku: 'A', qty: { $gte: 2 } }, // both must be true for ONE item
  },
});
\`\`\`

**Expected output:**

\`\`\`javascript
{ _id: 2, items: [ { sku: 'A', qty: 3 } ] }
\`\`\`

**Why it works:** \`$elemMatch\` takes one array element at a time and checks every condition on it. Only order 2 has a single item that is both sku A and qty 3.

**When you do NOT need \`$elemMatch\`:** with only one condition, dot notation is fine: \`{ 'items.sku': 'A' }\` means "any item has sku A".

**Same trap with arrays of numbers:** \`{ scores: { $gt: 80, $lt: 90 } }\` matches \`[95, 50]\` (95 > 80 and 50 < 90 — different elements). Use \`{ scores: { $elemMatch: { $gt: 80, $lt: 90 } } }\` when one value must be in the range.`,
      followUps: [
        {
          q: 'How do you return only the matching item, not the whole items array?',
          a: 'Use `$elemMatch` in the projection: `find({ _id: 2 }, { items: { $elemMatch: { sku: \'A\' } } })`, or the positional projection `{ \'items.$\': 1 }` after a query on `items`. Both return only the FIRST matching element. For all matching elements use aggregation with `$filter`.',
        },
        {
          q: 'How do you find documents whose tags array contains BOTH "node" and "react"?',
          a: '`{ tags: { $all: [\'node\', \'react\'] } }`. Note `{ tags: [\'node\', \'react\'] }` is an exact match: same elements, same order, nothing else.',
        },
      ],
    },
    {
      id: 'update-operators-profile',
      title: 'Update a profile: $inc, $addToSet, $push with $slice in one call',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'atomic-updates-bulk',
      question: `A user document looks like this:

\`\`\`javascript
{ _id: 'u1', name: 'Asha', views: 10, tags: ['react'], recentSearches: ['node', 'mongo'] }
\`\`\`

In **one** update (no read first), do all of this:

1. Increase \`views\` by 1.
2. Add the tag \`'node'\` — but only if it is not already there.
3. Add \`'stripe'\` to \`recentSearches\`, keeping **only the last 5** searches.
4. Set \`lastSeenAt\` to the current time.

Why is this better than \`findOne\` → change in JavaScript → \`save()\`?`,
      hints: [
        'Each task has its own update operator: $inc, $addToSet, $push, $set. You can use several in one update.',
        '`$push` has modifiers. `$slice` limits the array size, but it only works together with `$each`.',
      ],
      solution: `**Idea:** combine several update operators in one \`updateOne\`. The server applies them atomically (all at once, for this one document).

\`\`\`javascript
db.users.updateOne(
  { _id: 'u1' },
  {
    $inc: { views: 1 },                        // add 1 (creates the field if missing)
    $addToSet: { tags: 'node' },               // push only if not already present
    $push: {
      recentSearches: {
        $each: ['stripe'],                     // $slice needs $each, even for one value
        $slice: -5,                            // keep the LAST 5 elements
      },
    },
    $set: { lastSeenAt: new Date() },
  }
);
\`\`\`

**Result:**

\`\`\`javascript
{
  _id: 'u1', name: 'Asha', views: 11,
  tags: ['react', 'node'],
  recentSearches: ['node', 'mongo', 'stripe'],
  lastSeenAt: ISODate('...')
}
\`\`\`

After more searches the array never grows past 5 — the oldest ones fall off the front.

**Why it is better than read-modify-save:** two requests running at the same time could both read \`views: 10\` and both save \`11\` — one update is lost (a **race condition**). \`$inc\` and \`$push\` run inside the database on the current value, so nothing is lost. It is also one round trip instead of two.

**Edge case:** you cannot touch the **same field** with two operators in one update (for example \`$set\` and \`$push\` on \`recentSearches\`). MongoDB returns a "conflict" error.`,
      followUps: [
        {
          q: 'How do you keep the NEWEST search at the front instead?',
          a: 'Add `$position: 0` and use a positive slice: `{ $each: [\'stripe\'], $position: 0, $slice: 5 }`. New items go to index 0 and only the first 5 are kept.',
        },
        {
          q: 'How would you avoid duplicate searches but still move a repeated one to the front?',
          a: 'You need two steps: `$pull` the value, then `$push` it with `$position: 0`. They touch the same field, so they cannot be in one update document — use `bulkWrite` with two ordered `updateOne` operations, or an update with an aggregation pipeline.',
        },
        {
          q: 'Does `$addToSet` work for objects?',
          a: 'Yes, but it compares the WHOLE object, including field order. `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` are different, so duplicates can sneak in. For objects, prefer a filter like `{ \'items.sku\': { $ne: sku } }` plus `$push`.',
        },
      ],
    },
    {
      id: 'count-orders-by-status',
      title: 'Count orders by status',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'aggregation-basics',
      question: `\`orders\` collection:

\`\`\`javascript
{ _id: 1, status: 'paid' }
{ _id: 2, status: 'pending' }
{ _id: 3, status: 'paid' }
{ _id: 4, status: 'cancelled' }
{ _id: 5, status: 'paid' }
{ _id: 6, status: 'pending' }
\`\`\`

Write an aggregation that returns how many orders are in each status, biggest count first, in this shape:

\`\`\`javascript
{ status: 'paid', count: 3 }
\`\`\``,
      hints: [
        'Use `$group` with `_id: \'$status\'` — the `$` means "the value of this field".',
        'Count with `{ $sum: 1 }` (add 1 for each document). Then `$sort` and `$project` to rename `_id`.',
      ],
      solution: `**Idea:** group documents by \`status\`, add 1 per document, sort by the count, then rename \`_id\` to \`status\`.

\`\`\`javascript
db.orders.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },  // one output doc per status
  { $sort: { count: -1 } },                             // biggest first
  { $project: { _id: 0, status: '$_id', count: 1 } },   // rename _id -> status
]);

// Shortcut: $sortByCount = $group + $sum: 1 + $sort (output keeps _id)
db.orders.aggregate([{ $sortByCount: '$status' }]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ status: 'paid', count: 3 }
{ status: 'pending', count: 2 }
{ status: 'cancelled', count: 1 }
\`\`\`

**Why it works:** \`$group\` puts all documents with the same \`_id\` expression into one bucket. \`$sum: 1\` adds 1 for each document in the bucket. \`$project\` with \`'$_id'\` copies the group key into a new field name.

**Edge case:** documents with no \`status\` field are grouped under \`_id: null\`. Add \`{ $match: { status: { $exists: true } } }\` first if you do not want them.`,
      followUps: [
        {
          q: 'Only count orders from the last 30 days. Where does the filter go?',
          a: 'In a `$match` as the FIRST stage: `{ $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }`. Early `$match` can use an index and reduces the number of documents `$group` must process.',
        },
        {
          q: 'How do you get the counts as ONE object like `{ paid: 3, pending: 2 }`?',
          a: 'After the group, collect pairs and convert: `{ $group: { _id: null, pairs: { $push: { k: \'$_id\', v: \'$count\' } } } }`, then `{ $replaceWith: { $arrayToObject: \'$pairs\' } }`. Many teams just do this small reshape in JavaScript.',
        },
      ],
    },
    {
      id: 'upsert-daily-counter',
      title: 'Daily page-view counter with upsert',
      difficulty: 'easy',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'crud-operations',
      question: `Every time someone views a page, you must add 1 to a counter for **that page on that day**. If the counter document does not exist yet, create it.

Target documents:

\`\`\`javascript
{ page: '/pricing', day: '2026-10-07', views: 42, createdAt: ISODate('2026-10-07T00:00:03Z') }
\`\`\`

Write it as **one** database call. \`createdAt\` must be set only when the document is first created. What can go wrong when two requests arrive at the same millisecond?`,
      hints: [
        'Look at the `upsert: true` option: "update if found, insert if not".',
        'There is an operator that sets fields ONLY on insert.',
        'For the race condition, think about what stops two documents with the same page + day.',
      ],
      solution: `**Idea:** \`updateOne\` with \`upsert: true\`. \`$inc\` works on a new document too (it starts from 0). \`$setOnInsert\` only runs when a new document is inserted.

\`\`\`javascript
// One-time setup: stop duplicates for the same page + day
db.pageStats.createIndex({ page: 1, day: 1 }, { unique: true });

// On every page view
db.pageStats.updateOne(
  { page: '/pricing', day: '2026-10-07' },   // equality fields are copied into a new doc
  {
    $inc: { views: 1 },                       // 0 -> 1 on insert, +1 on update
    $setOnInsert: { createdAt: new Date() },  // ignored when the doc already exists
  },
  { upsert: true }
);
\`\`\`

**First call** creates \`{ page: '/pricing', day: '2026-10-07', views: 1, createdAt: ... }\`. **Later calls** only change \`views\`.

**Why it works:** on insert, MongoDB builds the new document from the equality fields in the filter plus the update operators. \`$setOnInsert\` is skipped when an existing document is updated, so \`createdAt\` never changes.

**Race condition:** two upserts at the same moment can both find "no document" and both insert, giving two counters for the same day. The **unique index** blocks the second insert. Newer MongoDB versions retry this case automatically when the filter is an equality match on the unique index fields; on older versions catch duplicate key error \`11000\` and retry the update once.`,
      followUps: [
        {
          q: 'Why store `day` as a string like "2026-10-07" instead of a Date?',
          a: 'It is an exact, timezone-free key that is easy to match with equality. If you store a Date, make sure every writer truncates to midnight in the SAME timezone, or you get two docs for one day.',
        },
        {
          q: 'How would you handle 10,000 views per second on one page?',
          a: 'One hot document becomes a write bottleneck. Count in memory or Redis and flush to MongoDB every few seconds with `$inc: { views: n }`, or split the counter into several shard documents and sum them when reading.',
        },
      ],
    },
    {
      id: 'findoneandupdate-returns-old-doc',
      title: 'Debug: findOneAndUpdate returns the old credits value',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'mongoose-schemas-models',
      question: `This Express route spends 10 credits. The database is updated correctly, but the response always shows the **old** balance. Also, users sometimes end up with **negative** credits. Find both bugs and fix them.

\`\`\`javascript
app.post('/api/generate', async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    { $inc: { credits: -10 } }
  );
  res.json({ credits: user.credits });  // shows 50 when the DB now has 40
});
\`\`\``,
      hints: [
        'By default, which version of the document does findOneAndUpdate give back — before or after the update?',
        'Mongoose has an option `new: true` (the native driver uses `returnDocument: \'after\'`).',
        'For negative credits: put the "has enough credits" check inside the FILTER, so the check and the update happen together.',
      ],
      solution: `**Idea:** \`findOneAndUpdate\` returns the document **as it was before** the update unless you ask for the new one. And the balance check must be part of the filter so it is atomic.

\`\`\`javascript
app.post('/api/generate', async (req, res) => {
  const COST = 10;

  const user = await User.findOneAndUpdate(
    { _id: req.user.id, credits: { $gte: COST } }, // only match if the user can afford it
    { $inc: { credits: -COST } },
    { new: true }                                   // return the doc AFTER the update
    // native driver: { returnDocument: 'after' }
  ).lean();

  if (!user) {
    // either the user does not exist or credits < COST
    return res.status(402).json({ error: 'Not enough credits' });
  }

  res.json({ credits: user.credits });              // now shows 40
});
\`\`\`

**Why it works:**

- \`new: true\` tells Mongoose to return the updated document.
- The filter \`credits: { $gte: COST }\` and the \`$inc\` run as **one atomic operation** on the server. If two requests race, the second one simply finds no matching document. A separate "read credits, check in JS, then update" would let both requests pass the check.
- When nothing matches, the result is \`null\` — always handle it.

**Extra gotcha:** schema validators (like \`min: 0\`) do **not** run on update queries by default. Pass \`runValidators: true\` if you rely on them — but the filter check above is the safer guard.`,
      followUps: [
        {
          q: 'What changed in the native Node driver here?',
          a: 'In driver v6, `findOneAndUpdate` returns the document itself. Older versions returned a wrapper `{ value: doc, ok: 1 }`. If you upgrade and see `undefined` (or the wrapper), check your driver version and the `includeResultMetadata` option in the docs.',
        },
        {
          q: 'When would you use `updateOne` instead?',
          a: 'When you do not need the document back. `updateOne` returns `matchedCount` / `modifiedCount`, which is enough to know if the update happened, and sends less data.',
        },
      ],
    },
    {
      id: 'otp-codes-ttl-index',
      title: 'Store OTP codes that expire after 5 minutes',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'special-indexes',
      question: `You send a 6-digit OTP (one-time password) by SMS for login. Requirements:

- A code is valid for **5 minutes**.
- Max **5 wrong attempts** per code.
- Old codes must be cleaned up **automatically** — no cron job.

Design the collection, the index, and the "verify code" logic.`,
      hints: [
        'MongoDB has a special index that deletes documents after a time. Which one?',
        'The background cleanup is not instant. Can you rely on it alone for security?',
        'Never store the raw code — store a hash, just like a password.',
      ],
      solution: `**Idea:** store an \`expiresAt\` date on each OTP and create a **TTL index** (time-to-live) on it with \`expireAfterSeconds: 0\` — "delete when the clock passes this date". Still check \`expiresAt\` in the query, because cleanup runs only about once a minute.

\`\`\`javascript
import crypto from 'node:crypto';
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  codeHash: { type: String, required: true },    // never store the raw code
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
// TTL index: delete the doc once expiresAt is in the past
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1 });
const Otp = mongoose.model('Otp', otpSchema);

const hash = (code) => crypto.createHash('sha256').update(code).digest('hex');

export async function sendOtp(phone) {
  const code = crypto.randomInt(100000, 1000000).toString(); // 6 digits
  await Otp.deleteMany({ phone });                          // only one active code per phone
  await Otp.create({ phone, codeHash: hash(code), expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
  return code; // send by SMS, never return to the client
}

export async function verifyOtp(phone, code) {
  // Count this attempt atomically, and only for a code that is still valid
  const otp = await Otp.findOneAndUpdate(
    { phone, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } },
    { $inc: { attempts: 1 } },
    { new: true }
  );
  if (!otp) return false;                       // expired, missing, or too many attempts

  if (otp.codeHash !== hash(code)) return false;

  await Otp.deleteOne({ _id: otp._id });        // one-time: remove after success
  return true;
}
\`\`\`

**Why it works:**

- The TTL index lets MongoDB delete old codes by itself. The background task runs about **every 60 seconds**, so an expired code may live a little longer — that is why \`verifyOtp\` also checks \`expiresAt: { $gt: new Date() }\`.
- \`$inc\` on \`attempts\` in the same atomic call stops brute force, even with parallel requests.
- Hashing means a database leak does not leak live codes.

**TTL rules to remember:** the field must be a **Date** (or an array of dates); docs where it is missing or not a date are never deleted; a TTL index must be a single-field index.`,
      followUps: [
        {
          q: 'What is the difference between `expireAfterSeconds: 0` on expiresAt and `expireAfterSeconds: 300` on createdAt?',
          a: 'Both work. With `createdAt` + 300 every code lives exactly 5 minutes. With `expiresAt` + 0, each document can have its own lifetime (e.g. 5 min for login, 24 h for email verification) in the same collection.',
        },
        {
          q: 'How do you rate-limit how often a user can REQUEST a code?',
          a: 'Keep a small document per phone with a counter and a TTL (for example "max 3 requests per 15 minutes"), updated with `$inc` + upsert, or use Redis with `INCR` + `EXPIRE`.',
        },
      ],
    },
    {
      id: 'second-highest-salary',
      title: 'Find the employee(s) with the second highest salary',
      difficulty: 'easy',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'aggregation-advanced',
      question: `\`employees\` collection:

\`\`\`javascript
{ _id: 1, name: 'Asha',  salary: 90000 }
{ _id: 2, name: 'Ben',   salary: 120000 }
{ _id: 3, name: 'Chen',  salary: 120000 }
{ _id: 4, name: 'Divya', salary: 75000 }
{ _id: 5, name: 'Eli',   salary: 100000 }
\`\`\`

Find the **second highest distinct salary** and the employee(s) who earn it. A teammate wrote \`find().sort({ salary: -1 }).skip(1).limit(1)\`. What does it return, and why is it wrong?`,
      hints: [
        'Two people share the top salary. What is at position 2 after sorting?',
        'First reduce salaries to UNIQUE values with `$group`, then sort and skip.',
        'MongoDB 5.0+ has window functions; `$denseRank` gives equal salaries the same rank.',
      ],
      solution: `**Idea:** the teammate's query returns **Chen (120000)** — the second DOCUMENT, not the second SALARY, because of the tie. Make salaries unique first, or rank them so ties share a rank.

**Option 1 — just the value (works on any version):**

\`\`\`javascript
db.employees.aggregate([
  { $group: { _id: '$salary' } },  // one doc per distinct salary
  { $sort: { _id: -1 } },          // highest first
  { $skip: 1 },                    // drop the highest
  { $limit: 1 },
]);
// -> { _id: 100000 }
// then: db.employees.find({ salary: 100000 })
\`\`\`

**Option 2 — value and employees in one pipeline (MongoDB 5.0+):**

\`\`\`javascript
db.employees.aggregate([
  {
    $setWindowFields: {
      sortBy: { salary: -1 },
      output: { salaryRank: { $denseRank: {} } }, // ties share a rank, no gaps
    },
  },
  { $match: { salaryRank: 2 } },
  { $project: { _id: 0, name: 1, salary: 1 } },
]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ name: 'Eli', salary: 100000 }
\`\`\`

Ranks: Ben 1, Chen 1, Eli 2, Asha 3, Divya 4.

**Why it works:** \`$denseRank\` gives Ben and Chen rank 1 and the next salary rank 2 (no gap). \`$rank\` would give Eli rank **3** (1, 1, 3) — that is the difference interviewers look for.

**Edge case:** if all salaries are equal, there is no second highest — both options return nothing. Say so in your API response.`,
      followUps: [
        {
          q: 'How do you get the second highest salary PER department?',
          a: 'Add `partitionBy: \'$department\'` to `$setWindowFields`. Ranking restarts for each department. Then `$match: { salaryRank: 2 }`.',
        },
        {
          q: 'Is `sort + skip + limit` ever fine here?',
          a: 'Yes, if salaries are guaranteed unique, or if the question is "the second person in the list". With a `{ salary: -1 }` index it is very fast. Always ask the interviewer how ties should be handled.',
        },
      ],
    },
    {
      id: 'top-5-customers-by-sales',
      title: 'Top 5 customers by total spend',
      difficulty: 'medium',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'aggregation-basics',
      question: `\`orders\` collection (amount is in dollars):

\`\`\`javascript
{ _id: 1,  customerId: 'c1', amount: 120, status: 'paid' }
{ _id: 2,  customerId: 'c1', amount: 80,  status: 'paid' }
{ _id: 3,  customerId: 'c2', amount: 500, status: 'paid' }
{ _id: 4,  customerId: 'c3', amount: 50,  status: 'paid' }
{ _id: 5,  customerId: 'c3', amount: 300, status: 'cancelled' }
{ _id: 6,  customerId: 'c4', amount: 150, status: 'paid' }
{ _id: 7,  customerId: 'c4', amount: 150, status: 'paid' }
{ _id: 8,  customerId: 'c5', amount: 90,  status: 'paid' }
{ _id: 9,  customerId: 'c6', amount: 40,  status: 'paid' }
\`\`\`

Return the **top 5 customers** by total amount of **paid** orders, with their total and number of orders.`,
      hints: [
        'Filter first: only paid orders should be counted.',
        'Group by `customerId`, then `$sum: \'$amount\'` for the total and `$sum: 1` for the count.',
        'Sort by the total descending and limit to 5.',
      ],
      solution: `**Idea:** \`$match\` paid orders → \`$group\` per customer → \`$sort\` by total → \`$limit\` 5.

\`\`\`javascript
db.orders.aggregate([
  { $match: { status: 'paid' } },                    // cancelled orders do not count
  {
    $group: {
      _id: '$customerId',
      totalSpent: { $sum: '$amount' },               // add up the amounts
      orderCount: { $sum: 1 },                       // count the orders
    },
  },
  { $sort: { totalSpent: -1, _id: 1 } },             // _id breaks ties -> stable result
  { $limit: 5 },
  { $project: { _id: 0, customerId: '$_id', totalSpent: 1, orderCount: 1 } },
]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ customerId: 'c2', totalSpent: 500, orderCount: 1 }
{ customerId: 'c4', totalSpent: 300, orderCount: 2 }
{ customerId: 'c1', totalSpent: 200, orderCount: 2 }
{ customerId: 'c5', totalSpent: 90,  orderCount: 1 }
{ customerId: 'c3', totalSpent: 50,  orderCount: 1 }
\`\`\`

c3's cancelled 300 is ignored. c6 (40) is 6th, so it is cut.

**Why it works:** \`$match\` first reduces work and can use an index on \`status\`. \`$sum: '$amount'\` adds the field value, \`$sum: 1\` counts documents. When \`$sort\` is followed by \`$limit\`, MongoDB only keeps the top 5 in memory while sorting (a "top-k" sort), so it stays cheap.

**Edge cases:** add a tie-breaker in the sort or results can change order between runs. For real money, store integer **cents** (like Stripe does) or \`Decimal128\` — floating point sums like \`0.1 + 0.2\` are not exact.`,
      followUps: [
        {
          q: 'How do you show the customer name and email too?',
          a: 'After `$limit`, add `$lookup` from `customers` on `_id`, then `$unwind`. Doing the `$lookup` AFTER the limit means only 5 lookups instead of one per order.',
        },
        {
          q: 'This runs on 50 million orders and is slow. What do you do?',
          a: 'Add a date range to the `$match` (with an index), or precompute: keep a `totalSpent` field on each customer updated with `$inc` when an order is paid (computed pattern), or a nightly `$merge` into a summary collection.',
        },
      ],
    },
    {
      id: 'monthly-revenue-report',
      title: 'Monthly revenue for a year',
      difficulty: 'medium',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'aggregation-basics',
      question: `\`orders\` collection:

\`\`\`javascript
{ _id: 1, amount: 100, status: 'paid',      createdAt: ISODate('2026-01-05T10:00:00Z') }
{ _id: 2, amount: 250, status: 'paid',      createdAt: ISODate('2026-01-20T15:30:00Z') }
{ _id: 3, amount: 400, status: 'paid',      createdAt: ISODate('2026-02-11T09:00:00Z') }
{ _id: 4, amount: 90,  status: 'cancelled', createdAt: ISODate('2026-02-15T12:00:00Z') }
{ _id: 5, amount: 120, status: 'paid',      createdAt: ISODate('2026-03-02T08:00:00Z') }
{ _id: 6, amount: 500, status: 'paid',      createdAt: ISODate('2025-12-30T18:00:00Z') }
\`\`\`

Return paid revenue and order count **per month of 2026**, oldest month first:

\`\`\`javascript
{ month: '2026-01', revenue: 350, orders: 2 }
\`\`\``,
      hints: [
        'Filter the year with a date range: `$gte` Jan 1 2026 and `$lt` Jan 1 2027.',
        'You can group by a computed key. `$dateToString` with format `%Y-%m` turns a date into "2026-01".',
      ],
      solution: `**Idea:** \`$match\` paid orders in 2026 using a date range, then group by the month string made with \`$dateToString\`.

\`\`\`javascript
db.orders.aggregate([
  {
    $match: {
      status: 'paid',
      createdAt: { $gte: ISODate('2026-01-01T00:00:00Z'), $lt: ISODate('2027-01-01T00:00:00Z') },
    },
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, // "2026-01"
      revenue: { $sum: '$amount' },
      orders: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },                     // "2026-01" < "2026-02" as strings too
  { $project: { _id: 0, month: '$_id', revenue: 1, orders: 1 } },
]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ month: '2026-01', revenue: 350, orders: 2 }
{ month: '2026-02', revenue: 400, orders: 1 }
{ month: '2026-03', revenue: 120, orders: 1 }
\`\`\`

Order 4 is cancelled, order 6 is from 2025.

**Why it works:** the range filter (\`$gte\` / \`$lt\`) can use an index on \`createdAt\` — unlike filtering with \`$year\` inside \`$expr\`, which must compute the year for every document. \`$dateToString\` builds a sortable "YYYY-MM" key.

**Edge cases:**

- **Timezones:** dates are stored in UTC. An order at \`2026-01-31T20:00Z\` is already **Feb 1** in India. Pass \`timezone: 'Asia/Kolkata'\` inside \`$dateToString\` (and shift the \`$match\` boundaries) if the report is for IST.
- **Empty months** do not appear at all. Fill them in JavaScript, or use \`$densify\` on newer MongoDB versions (check the docs for your version).`,
      followUps: [
        {
          q: 'Could you group by `{ year: { $year: \'$createdAt\' }, month: { $month: \'$createdAt\' } }` instead?',
          a: 'Yes. You get `_id: { year: 2026, month: 1 }` and sort with `{ \'_id.year\': 1, \'_id.month\': 1 }`. It is the same result; the string version is just easier to send to a chart.',
        },
        {
          q: 'The finance team opens this dashboard 1,000 times a day. How do you make it cheap?',
          a: 'Precompute: run the pipeline on a schedule and end it with `$merge` into a `monthlyRevenue` collection. The dashboard reads 12 small documents instead of scanning orders.',
        },
      ],
    },
    {
      id: 'average-rating-per-product',
      title: 'Average rating per product (only products with 3+ reviews)',
      difficulty: 'medium',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'aggregation-basics',
      question: `\`reviews\` collection:

\`\`\`javascript
{ productId: 'p1', rating: 5 }
{ productId: 'p1', rating: 4 }
{ productId: 'p1', rating: 4 }
{ productId: 'p2', rating: 5 }
{ productId: 'p2', rating: 5 }
{ productId: 'p3', rating: 3 }
{ productId: 'p3', rating: 2 }
{ productId: 'p3', rating: 4 }
{ productId: 'p3', rating: 5 }
\`\`\`

Return each product's average rating, **rounded to 1 decimal**, and its review count. Only include products with **at least 3 reviews**. Best rated first.`,
      hints: [
        '`$avg` works inside `$group` just like `$sum`.',
        'A `$match` placed AFTER `$group` filters on the computed values (like SQL HAVING).',
        '`$round: [value, 1]` rounds to one decimal place.',
      ],
      solution: `**Idea:** group by product with \`$avg\` and a count, filter groups by count, round, sort.

\`\`\`javascript
db.reviews.aggregate([
  {
    $group: {
      _id: '$productId',
      avgRating: { $avg: '$rating' },
      reviewCount: { $sum: 1 },
    },
  },
  { $match: { reviewCount: { $gte: 3 } } },     // like SQL HAVING
  {
    $project: {
      _id: 0,
      productId: '$_id',
      avgRating: { $round: ['$avgRating', 1] }, // 4.333... -> 4.3
      reviewCount: 1,
    },
  },
  { $sort: { avgRating: -1 } },
]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ productId: 'p1', avgRating: 4.3, reviewCount: 3 }   // (5+4+4)/3 = 4.33
{ productId: 'p3', avgRating: 3.5, reviewCount: 4 }   // (3+2+4+5)/4 = 3.5
\`\`\`

p2 has a perfect 5.0 but only 2 reviews, so it is excluded.

**Why it works:** \`$match\` before \`$group\` filters documents; \`$match\` after \`$group\` filters the groups. Rounding happens in \`$project\` so the sort uses the rounded value shown to users.

**Edge case:** \`$avg\` ignores documents where \`rating\` is missing or not a number. If every value is missing, the average is \`null\`.`,
      followUps: [
        {
          q: 'Product pages show the rating on every view. Would you run this pipeline each time?',
          a: 'No. Use the **computed pattern**: store `ratingSum` and `ratingCount` on the product and `$inc` both when a review is added. Average = sum / count, read in O(1).',
        },
        {
          q: 'A product with one 5-star review ranks above one with 500 reviews at 4.8. How do you fix the ranking?',
          a: 'Use a weighted (Bayesian) average that pulls products with few reviews toward the global average: `(C * m + sum) / (C + count)`, where `m` is the global average and `C` is a confidence number like 10.',
        },
      ],
    },
    {
      id: 'lookup-orders-with-users',
      title: 'Join orders with user details ($lookup + $unwind)',
      difficulty: 'medium',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'aggregation-lookup-unwind',
      question: `Two collections:

\`\`\`javascript
// users
{ _id: ObjectId('...a1'), name: 'Asha', email: 'asha@x.com' }
{ _id: ObjectId('...b2'), name: 'Ben',  email: 'ben@x.com' }

// orders
{ _id: 101, userId: ObjectId('...a1'), amount: 250 }
{ _id: 102, userId: ObjectId('...b2'), amount: 100 }
{ _id: 103, userId: ObjectId('...c3'), amount: 75 }   // this user was deleted
\`\`\`

Return each order as \`{ orderId, amount, userName, userEmail }\`.

1. What happens to order 103?
2. How do you keep it in the result?
3. A teammate's \`$lookup\` returns an empty \`user\` array for **every** order. Name two likely causes.`,
      hints: [
        '`$lookup` always produces an ARRAY field. `$unwind` turns a one-element array into a plain object.',
        'Look at the `preserveNullAndEmptyArrays` option of `$unwind`.',
        'For the empty-array bug: check the `from` name and the TYPE of userId.',
      ],
      solution: `**Idea:** \`$lookup\` brings matching users in as an array, \`$unwind\` flattens it, \`$project\` shapes the output.

\`\`\`javascript
db.orders.aggregate([
  {
    $lookup: {
      from: 'users',           // the COLLECTION name, not the Mongoose model name
      localField: 'userId',    // field in orders
      foreignField: '_id',     // field in users
      as: 'user',              // result is an array: [ {...} ] or []
    },
  },
  { $unwind: '$user' },        // [ {...} ] -> {...}; orders with [] are DROPPED
  {
    $project: {
      _id: 0,
      orderId: '$_id',
      amount: 1,
      userName: '$user.name',
      userEmail: '$user.email',
    },
  },
]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ amount: 250, orderId: 101, userName: 'Asha', userEmail: 'asha@x.com' }
{ amount: 100, orderId: 102, userName: 'Ben',  userEmail: 'ben@x.com' }
\`\`\`

**1. Order 103** finds no user, so \`user\` is \`[]\`, and plain \`$unwind\` removes documents with empty arrays. It disappears — like an SQL INNER JOIN.

**2. Keep it** (like a LEFT JOIN):

\`\`\`javascript
{ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
// -> { amount: 75, orderId: 103 }   (userName / userEmail are simply missing)
\`\`\`

**3. Empty \`user\` for every order — common causes:**

- \`from\` is wrong: Mongoose model \`User\` is stored in the collection **\`users\`** (lowercase, plural).
- **Type mismatch:** \`userId\` saved as a **string** \`'66f...'\` while \`users._id\` is an **ObjectId**. They never equal each other. Store references as ObjectId (or convert with \`$toObjectId\` in a pipeline \`$lookup\`, which is slower).

**Performance:** \`$lookup\` runs a query per input document against \`foreignField\` — make sure that field is indexed (\`_id\` always is). Put \`$match\` / \`$limit\` BEFORE \`$lookup\` when you can.`,
      followUps: [
        {
          q: 'How do you bring in only `name` and `email`, not the whole user document?',
          a: 'Give `$lookup` a `pipeline` with a `$project`: `{ $lookup: { from: \'users\', localField: \'userId\', foreignField: \'_id\', pipeline: [{ $project: { name: 1, email: 1 } }], as: \'user\' } }`. Combining localField with pipeline needs MongoDB 5.0+; older versions use `let` + `$expr`.',
        },
        {
          q: 'If you need this join on every request, what does that tell you about the schema?',
          a: 'Maybe the data should be embedded. Copy the few fields you need (name, email) into the order — the **extended reference** pattern. For orders that copy is also correct historically: it shows the details at the time of purchase.',
        },
      ],
    },
    {
      id: 'find-duplicate-emails',
      title: 'Find (and clean up) duplicate users by email',
      difficulty: 'medium',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'aggregation-basics',
      question: `Because of an old bug, the \`users\` collection has duplicate emails, sometimes with different letter case:

\`\`\`javascript
{ _id: 1, email: 'asha@x.com', createdAt: ISODate('2026-01-01') }
{ _id: 2, email: 'Asha@X.com', createdAt: ISODate('2026-02-01') }
{ _id: 3, email: 'ben@x.com',  createdAt: ISODate('2026-01-05') }
{ _id: 4, email: 'asha@x.com', createdAt: ISODate('2026-03-01') }
{ _id: 5, email: 'chen@x.com', createdAt: ISODate('2026-01-09') }
{ _id: 6, email: 'chen@x.com', createdAt: ISODate('2026-01-10') }
\`\`\`

1. Write an aggregation that lists each duplicated email (case-insensitive), how many times it appears, and which \`_id\` to **keep** (the oldest).
2. Delete the extra copies.
3. Stop it from happening again.`,
      hints: [
        'Group by the lower-cased email: `{ $toLower: \'$email\' }`.',
        'Sort by createdAt BEFORE grouping, then `$first` gives the oldest document in each group.',
        'For prevention: a unique index — but how do you make it case-insensitive?',
      ],
      solution: `**Idea:** sort oldest first, group by lower-cased email, keep groups with more than one document. \`$first\` (after the sort) is the one to keep.

\`\`\`javascript
// 1. Find duplicates
const dupes = await db.collection('users').aggregate([
  { $sort: { createdAt: 1 } },                 // oldest first, so $first = oldest
  {
    $group: {
      _id: { $toLower: '$email' },             // 'Asha@X.com' and 'asha@x.com' -> same key
      count: { $sum: 1 },
      keepId: { $first: '$_id' },
      allIds: { $push: '$_id' },
    },
  },
  { $match: { count: { $gt: 1 } } },           // only real duplicates
  { $sort: { count: -1 } },
], { allowDiskUse: true }).toArray();          // big collections may need disk for the sort
\`\`\`

**Expected output:**

\`\`\`javascript
{ _id: 'asha@x.com', count: 3, keepId: 1, allIds: [1, 2, 4] }
{ _id: 'chen@x.com', count: 2, keepId: 5, allIds: [5, 6] }
\`\`\`

\`\`\`javascript
// 2. Delete the extras (after merging their orders etc. into keepId, if needed!)
const toDelete = dupes.flatMap((d) => d.allIds.filter((id) => id !== d.keepId));
// ObjectIds are objects: compare them with id.equals(d.keepId) instead of !==
await db.collection('users').deleteMany({ _id: { $in: toDelete } }); // deletes 2, 4, 6

// 3. Prevent it: store a normalized email and make it unique
await db.collection('users').updateMany({}, [{ $set: { email: { $toLower: '$email' } } }]);
await db.collection('users').createIndex({ email: 1 }, { unique: true });
\`\`\`

**Why it works:** \`$toLower\` makes the group key case-insensitive. Because of the \`$sort\` before \`$group\`, \`$first\` reliably picks the oldest account. The unique index makes the database itself reject a second insert (error code \`11000\`), which is safer than checking "does it exist?" in code — two signups at the same moment would both pass that check.

**Edge cases:** you must remove duplicates **before** creating a unique index, or index creation fails. Also lowercase emails in your signup code (or a Mongoose \`lowercase: true\` option) so new data stays clean.`,
      followUps: [
        {
          q: 'Can you make the unique index case-insensitive without lowercasing the data?',
          a: 'Yes, with a collation: `createIndex({ email: 1 }, { unique: true, collation: { locale: \'en\', strength: 2 } })`. Strength 2 ignores case. Queries must use the same collation to use this index, so many teams just store a lowercased email.',
        },
        {
          q: 'Why `allowDiskUse: true`?',
          a: 'Blocking stages like `$sort` and `$group` have a memory limit (100 MB per stage). On large collections the pipeline fails unless it may spill to disk. Recent versions enable this by default — check the docs for your version.',
        },
      ],
    },
    {
      id: 'update-array-elements-positional',
      title: 'Update items inside an array: $, $[] and arrayFilters',
      difficulty: 'medium',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'atomic-updates-bulk',
      question: `One order document:

\`\`\`javascript
{
  _id: 1,
  items: [
    { sku: 'A', qty: 1, status: 'pending' },
    { sku: 'B', qty: 2, status: 'pending' },
    { sku: 'C', qty: 1, status: 'shipped' },
  ],
}
\`\`\`

Write three separate updates, without reading the document first:

1. Set the \`qty\` of item **B** to 5.
2. Mark **every pending** item as \`'cancelled'\`.
3. Add 1 to the \`qty\` of **every** item.`,
      hints: [
        'The positional operator `$` means "the element that matched my filter". It needs the array field in the filter.',
        '`$` only updates the FIRST match. For all matches use a named placeholder like `$[it]` plus the `arrayFilters` option.',
        '`$[]` (empty brackets) means "every element".',
      ],
      solution: `**Idea:** MongoDB has three ways to point at array elements in an update:

- \`$\` → the **first** element matched by the query filter
- \`$[name]\` + \`arrayFilters\` → **all** elements matching a condition
- \`$[]\` → **all** elements

\`\`\`javascript
// 1. Item B's qty -> 5  ($ = the element matched by 'items.sku': 'B')
db.orders.updateOne(
  { _id: 1, 'items.sku': 'B' },
  { $set: { 'items.$.qty': 5 } }
);

// 2. Every pending item -> cancelled
db.orders.updateOne(
  { _id: 1 },
  { $set: { 'items.$[it].status': 'cancelled' } },
  { arrayFilters: [{ 'it.status': 'pending' }] }   // "it" is our name for each element
);

// 3. Every item qty + 1
db.orders.updateOne(
  { _id: 1 },
  { $inc: { 'items.$[].qty': 1 } }
);
\`\`\`

**Document after all three updates:**

\`\`\`javascript
{
  _id: 1,
  items: [
    { sku: 'A', qty: 2, status: 'cancelled' },
    { sku: 'B', qty: 6, status: 'cancelled' },
    { sku: 'C', qty: 2, status: 'shipped' },
  ],
}
\`\`\`

**Why it works:** the server finds the right elements and changes them in place, atomically. You never send the whole array back, so a parallel update to another item is not overwritten.

**Rules:** the \`arrayFilters\` name must start with a lowercase letter and contain only letters and digits. Each name used in the update must have exactly one filter. In Mongoose, pass \`{ arrayFilters: [...] }\` as the options argument of \`updateOne\` / \`findOneAndUpdate\`.`,
      followUps: [
        {
          q: 'Why not use `$` for task 2?',
          a: '`$` only updates the FIRST matching element. Item A would be cancelled but item B would stay pending.',
        },
        {
          q: 'How do you remove all cancelled items from the array?',
          a: '`$pull` with a condition: `updateOne({ _id: 1 }, { $pull: { items: { status: \'cancelled\' } } })`.',
        },
        {
          q: 'How do you update nested arrays, like a reply inside a comment inside a post?',
          a: 'Chain filtered placeholders: `\'comments.$[c].replies.$[r].text\'` with `arrayFilters: [{ \'c._id\': commentId }, { \'r._id\': replyId }]`. If you need this often, consider moving comments into their own collection.',
        },
      ],
    },
    {
      id: 'bucket-users-by-age-group',
      title: 'Group users into age ranges with $bucket',
      difficulty: 'medium',
      type: 'query',
      frequency: 'occasional',
      relatedTopic: 'aggregation-advanced',
      question: `\`users\` collection (one user has no age):

\`\`\`javascript
{ name: 'A', age: 19 }  { name: 'B', age: 22 }  { name: 'C', age: 30 }
{ name: 'D', age: 33 }  { name: 'E', age: 34 }  { name: 'F', age: 41 }
{ name: 'G', age: 52 }  { name: 'H', age: 16 }  { name: 'I' }
\`\`\`

For an analytics chart, count users in these groups: **18-24, 25-34, 35-44, 45+**, and put everyone else (under 18 or no age) in **"Other"**. Also return the average age per group.`,
      hints: [
        '`$bucket` takes `groupBy`, a sorted `boundaries` array, an optional `default` bucket and an `output`.',
        'Each bucket includes its lower boundary and EXCLUDES its upper boundary: [18, 25) means 18 to 24.',
        'Without `default`, a document that fits no bucket makes the whole pipeline fail.',
      ],
      solution: `**Idea:** \`$bucket\` groups values into ranges. Boundaries \`[18, 25, 35, 45, 200]\` create the ranges 18-24, 25-34, 35-44 and 45-199. Anything outside (16, missing age) goes to \`default\`.

\`\`\`javascript
db.users.aggregate([
  {
    $bucket: {
      groupBy: '$age',
      boundaries: [18, 25, 35, 45, 200],   // lower bound inclusive, upper exclusive
      default: 'Other',                    // under 18, missing age, or 200+
      output: {
        count: { $sum: 1 },
        avgAge: { $avg: '$age' },
      },
    },
  },
  { $sort: { _id: 1 } },                   // numbers sort before strings -> 'Other' last
  {
    $project: {
      _id: 0,
      count: 1,
      avgAge: { $round: ['$avgAge', 1] },
      group: {
        $switch: {
          branches: [
            { case: { $eq: ['$_id', 18] }, then: '18-24' },
            { case: { $eq: ['$_id', 25] }, then: '25-34' },
            { case: { $eq: ['$_id', 35] }, then: '35-44' },
            { case: { $eq: ['$_id', 45] }, then: '45+' },
          ],
          default: 'Other',
        },
      },
    },
  },
]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ count: 2, avgAge: 20.5, group: '18-24' }   // 19, 22
{ count: 3, avgAge: 32.3, group: '25-34' }   // 30, 33, 34
{ count: 1, avgAge: 41,   group: '35-44' }
{ count: 1, avgAge: 52,   group: '45+' }
{ count: 2, avgAge: 16,   group: 'Other' }   // 16 and the user with no age
\`\`\`

**Why it works:** each bucket's \`_id\` is its lower boundary (18, 25, ...). \`$avg\` ignores the missing age, so "Other" averages only the 16. The \`$switch\` turns boundary numbers into readable labels for the chart.

**Rules:** boundaries must be sorted ascending and of one type. The \`default\` value must be outside the boundary range or of a different type (a string here).`,
      followUps: [
        {
          q: 'What is `$bucketAuto`?',
          a: 'You give it a number of buckets and MongoDB picks the boundaries so each bucket has roughly the same number of documents. Useful when you do not know the data distribution, e.g. price ranges.',
        },
        {
          q: 'How do you return age groups AND a country breakdown in one query?',
          a: 'Wrap both in `$facet`: `{ $facet: { byAge: [ { $bucket: ... } ], byCountry: [ { $sortByCount: \'$country\' } ] } }`.',
        },
      ],
    },
    {
      id: 'compound-index-esr',
      title: 'Choose the best compound index for this query (ESR rule)',
      difficulty: 'medium',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'esr-rule',
      question: `This is the hottest query in your app (the "orders" list screen):

\`\`\`javascript
db.orders.find({
  tenantId: 't_42',
  status: 'shipped',
  amount: { $gte: 100 },
}).sort({ createdAt: -1 }).limit(20);
\`\`\`

A teammate created \`{ tenantId: 1, status: 1, amount: 1, createdAt: -1 }\`. \`explain()\` still shows a **SORT** stage and high latency.

1. Why?
2. Which index would you create, and why in that order?
3. How do you confirm it in \`explain\`?`,
      hints: [
        'Label each field: is it Equality (exact value), Sort, or Range ($gt, $lt, $in sometimes)?',
        'After a range field in an index, the next fields are no longer in sorted order for the whole result.',
        'ESR: Equality fields first, then Sort fields, then Range fields.',
      ],
      solution: `**Idea:** order index fields by **E**quality → **S**ort → **R**ange.

- Equality: \`tenantId\`, \`status\`
- Sort: \`createdAt\`
- Range: \`amount\`

\`\`\`javascript
db.orders.createIndex({ tenantId: 1, status: 1, createdAt: -1, amount: 1 });
\`\`\`

**1. Why the teammate's index needs a SORT:** in \`{ tenantId, status, amount, createdAt }\`, the keys are ordered by amount first. Inside "tenant t_42, shipped, amount >= 100" there are many different amounts, and \`createdAt\` is only sorted **within each amount**. So MongoDB must collect all matching docs and sort them in memory (a blocking SORT stage) before it can return the first 20.

**2. Why ESR works:** with \`tenantId, status\` fixed, the index entries are already in \`createdAt\` order. MongoDB walks them newest first, skips entries with \`amount < 100\` (checked from the index key, no document fetch), and **stops after 20 matches**. No in-memory sort.

**3. Confirm with explain:**

\`\`\`javascript
db.orders.find({ tenantId: 't_42', status: 'shipped', amount: { $gte: 100 } })
  .sort({ createdAt: -1 }).limit(20)
  .explain('executionStats');

// Look for:
// winningPlan: LIMIT -> FETCH -> IXSCAN (indexName 'tenantId_1_status_1_createdAt_-1_amount_1')
// NO 'SORT' stage
// executionStats.nReturned: 20, totalDocsExamined close to 20
// totalKeysExamined may be a bit higher (skipped small amounts) - that is fine
\`\`\`

**Trade-off:** ESR may examine some extra index keys (orders under 100), but it avoids a blocking sort and can stop early. That is almost always the better deal for "sorted list + limit" screens.

**Note:** for a single sort field, \`createdAt: -1\` or \`1\` both work — MongoDB can walk an index backwards. Direction matters only for sorts on several fields with mixed directions.`,
      followUps: [
        {
          q: 'What changes if the query uses `status: { $in: [\'shipped\', \'delivered\'] }`?',
          a: '`$in` acts like equality for matching. With a sort, MongoDB can merge the already-sorted index ranges for each value (a SORT_MERGE stage) for small lists. Check `explain` — for large `$in` lists treat it more like a range.',
        },
        {
          q: 'How would you make this a covered query?',
          a: 'Project only fields that are in the index and exclude `_id`: `{ _id: 0, createdAt: 1, amount: 1, status: 1 }`. Then explain shows no FETCH stage and `totalDocsExamined: 0`. Not possible if the list needs fields outside the index.',
        },
        {
          q: 'Does this index also serve `find({ tenantId })` alone?',
          a: 'Yes — any **prefix** of a compound index can be used (`tenantId`, or `tenantId + status`, ...). It does NOT help a query on `status` alone, because `status` is not the first field.',
        },
      ],
    },
    {
      id: 'explain-collscan-prefix',
      title: 'Debug: login query does a COLLSCAN even though "email is indexed"',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'explain-plans',
      question: `Login got slow as the \`users\` collection grew to 1.2 million documents. The team says "email is indexed". Here is what you find:

\`\`\`javascript
db.users.getIndexes();
// [ { key: { _id: 1 } }, { key: { tenantId: 1, email: 1 }, unique: true } ]

db.users.find({ email: 'asha@x.com' }).explain('executionStats');
// queryPlanner.winningPlan: { stage: 'COLLSCAN', filter: { email: { '$eq': 'asha@x.com' } } }
// executionStats: { nReturned: 1, executionTimeMillis: 850,
//                   totalKeysExamined: 0, totalDocsExamined: 1200000 }
\`\`\`

Explain what the output means, why the index is not used, and give two fixes.`,
      hints: [
        'COLLSCAN = collection scan. Compare totalDocsExamined with nReturned.',
        'Which field comes FIRST in the compound index? Is it in the query?',
      ],
      solution: `**Reading the output:**

- \`COLLSCAN\` → no index was used; MongoDB read **every** document.
- \`totalKeysExamined: 0\` → not a single index entry was touched.
- \`totalDocsExamined: 1,200,000\` vs \`nReturned: 1\` → it read 1.2 million docs to return one. A healthy query has these numbers close together.

**Why:** the only email index is the compound \`{ tenantId: 1, email: 1 }\`. A compound index is sorted by its **first field first** (like a phone book sorted by last name, then first name). It can only be used for queries that include a **prefix** of its fields: \`tenantId\`, or \`tenantId + email\`. A query on \`email\` alone cannot jump into it, so the planner falls back to a COLLSCAN.

**Fix 1 — include the tenant in the query** (correct for a multi-tenant app anyway, the login page knows which tenant):

\`\`\`javascript
db.users.findOne({ tenantId: 't_42', email: 'asha@x.com' });
\`\`\`

**Fix 2 — if email must be looked up across tenants, add an index for it:**

\`\`\`javascript
db.users.createIndex({ email: 1 });
\`\`\`

**After the fix, explain should show:**

\`\`\`javascript
// winningPlan: FETCH -> IXSCAN { keyPattern: { tenantId: 1, email: 1 } }
// executionStats: { nReturned: 1, totalKeysExamined: 1, totalDocsExamined: 1, executionTimeMillis: 0 }
\`\`\`

**Other common reasons for a COLLSCAN to check:** the field name in the query differs from the index (\`Email\` vs \`email\`, \`user.email\` vs \`email\`); an unanchored or case-insensitive \`$regex\`; \`$where\` / \`$expr\` on computed values; negations like \`$ne\` / \`$nin\` that match most of the collection.`,
      followUps: [
        {
          q: 'How do you run explain from Mongoose?',
          a: '`await User.find({ email }).explain(\'executionStats\')`. For aggregations: `Model.aggregate(pipeline).explain(\'executionStats\')`.',
        },
        {
          q: 'How do you find slow queries in production in the first place?',
          a: 'Use the database profiler (`db.setProfilingLevel(1, { slowms: 100 })`) or the slow query logs, or in Atlas the Query Profiler and Performance Advisor, which also suggests indexes.',
        },
      ],
    },
    {
      id: 'regex-search-not-using-index',
      title: 'Debug: name search with $regex is slow and unsafe',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'text-search',
      question: `A "search users" box uses this code. There is an index on \`{ name: 1 }\`, but the query takes seconds on 2 million users. Someone also crashed it by typing \`(a+)+$\`.

\`\`\`javascript
app.get('/api/users/search', async (req, res) => {
  const users = await User.find({
    name: { $regex: req.query.q, $options: 'i' },
  }).limit(20);
  res.json(users);
});
\`\`\`

Find the problems and fix them for **"starts with" (autocomplete) search**. What would you use for "contains a word anywhere" search?`,
      hints: [
        'An index is sorted. Can a sorted list help you find names that CONTAIN "sha" somewhere in the middle?',
        'Case-insensitive (`i`) regex cannot use the index ranges efficiently either.',
        'User input goes straight into a regex. What do special characters like `.` `*` `(` do?',
      ],
      solution: `**Problems:**

1. **Unanchored regex** (no \`^\`): MongoDB cannot use the sorted index to jump to a range. It must check every index key or every document.
2. **\`$options: 'i'\`**: case-insensitive regex also cannot use tight index bounds, even with \`^\`.
3. **Unescaped user input**: \`(a+)+$\` is a "catastrophic backtracking" pattern (ReDoS — a regex that takes huge CPU time). The user controls the regex, which is also a kind of injection.

**Fix for autocomplete:** store a lowercased copy of the name, escape the input, and use an **anchored, case-sensitive** prefix regex. That becomes a fast index range scan.

\`\`\`javascript
// schema: nameLower: { type: String, index: true }  (set it on save from name.toLowerCase())

// Escape every regex special character so input is matched literally
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

app.get('/api/users/search', async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase().slice(0, 50); // limit length
  if (q.length < 2) return res.json([]);

  const users = await User.find(
    { nameLower: { $regex: '^' + escapeRegex(q) } },  // anchored + case-sensitive = index range
    { name: 1, avatarUrl: 1 }
  ).limit(20).lean();

  res.json(users);
});
\`\`\`

**Why it works:** \`^ash\` on a sorted index is like looking up "ash" in a dictionary: MongoDB jumps to keys \`>= 'ash'\` and stops at \`< 'asi'\`. Lowercasing the stored field and the input replaces the \`i\` flag. Escaping turns \`(a+)+$\` into a harmless literal string.

**For "contains a word anywhere":** regex will always scan. Use a **text index** (\`$text\`, word-based, supports stemming) or, on Atlas, **Atlas Search** (\`$search\`) which supports autocomplete, fuzzy matching and relevance scoring.`,
      followUps: [
        {
          q: 'Why does `String(req.query.q)` matter?',
          a: 'Express can parse `?q[$ne]=x` into an object `{ $ne: \'x\' }`. Passing objects straight into a filter is NoSQL injection. Forcing a string (or validating with zod) blocks it.',
        },
        {
          q: 'Can a collation index give case-insensitive prefix search?',
          a: 'A case-insensitive collation index helps exact equality matches, but `$regex` does not use collation. For prefix search, the lowercased field is the reliable approach.',
        },
      ],
    },
    {
      id: 'populate-n-plus-one',
      title: 'Debug: the posts API makes 21 database queries',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'n-plus-one',
      question: `The feed endpoint is slow. The MongoDB logs show 21 queries for one request.

\`\`\`javascript
// Post schema: { title, body, author: { type: ObjectId, ref: 'User' }, createdAt }
app.get('/api/feed', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(20);

  const result = [];
  for (const post of posts) {
    const author = await User.findById(post.author);   // one query per post
    result.push({ ...post.toObject(), author: { name: author.name, avatarUrl: author.avatarUrl } });
  }
  res.json(result);
});
\`\`\`

Explain the problem and fix it in two ways: with Mongoose and without \`populate\`.`,
      hints: [
        '1 query for the posts + 1 query per post = N + 1. Many of those posts may even have the same author.',
        'Collect all author ids first and fetch them in ONE query with `$in`.',
        '`populate()` does exactly that for you — 2 queries total.',
      ],
      solution: `**Problem:** this is the **N+1 query problem**: 1 query for the list, then N more (one per item) inside a loop. Each query is a network round trip, so 20 posts = 21 round trips. With 100 posts it gets 5x worse. There is also a crash risk: if an author was deleted, \`author.name\` throws.

**Fix 1 — Mongoose \`populate\` (2 queries total):**

\`\`\`javascript
app.get('/api/feed', async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('author', 'name avatarUrl')  // second query: User.find({ _id: { $in: [...] } })
    .lean();                               // plain objects, faster, less memory
  res.json(posts);                          // author is null if the user was deleted
});
\`\`\`

**Fix 2 — manual batching (what populate does under the hood):**

\`\`\`javascript
app.get('/api/feed', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(20).lean();

  // 1) unique author ids
  const ids = [...new Set(posts.map((p) => String(p.author)))];

  // 2) ONE query for all authors
  const authors = await User.find({ _id: { $in: ids } }, { name: 1, avatarUrl: 1 }).lean();

  // 3) Map for O(1) lookup by id
  const byId = new Map(authors.map((a) => [String(a._id), a]));

  res.json(posts.map((p) => ({ ...p, author: byId.get(String(p.author)) ?? null })));
});
\`\`\`

**Why it works:** both versions send 2 queries no matter how many posts there are. \`String(id)\` is needed because two ObjectId objects are never \`===\` equal, but their strings are.

**Watch out:** calling \`await post.populate('author')\` **inside a loop** is still N+1. And populating deeply (\`posts → comments → author\`) adds a query per level — fine for 2 levels, a design smell beyond that.`,
      followUps: [
        {
          q: 'Could you do it in a single query?',
          a: 'Yes, with an aggregation: `$sort`, `$limit`, then `$lookup` from users. Or avoid the join completely by embedding a small author snapshot `{ _id, name, avatarUrl }` in each post (extended reference), and update it when a user changes their name.',
        },
        {
          q: 'How would you catch N+1 problems before production?',
          a: 'Turn on `mongoose.set(\'debug\', true)` in development to log every query, count queries per request in tests, or look at APM traces (Datadog, New Relic) which show many small identical queries per request.',
        },
      ],
    },
    {
      id: 'blog-schema-embed-vs-reference',
      title: 'Design: blog posts and comments — embed or reference?',
      difficulty: 'medium',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'embedding-vs-referencing',
      question: `Design MongoDB collections for a blog platform:

- The **feed** shows posts with author name/avatar, tags, comment count and the **latest 3 comments**.
- The **post page** shows all comments, 20 at a time, newest first.
- Most posts get under 50 comments, but viral posts get **50,000+**.
- Users can filter posts by tag.

Should comments be embedded in the post or stored separately? Show the document shapes, indexes, and the code to add a comment.`,
      hints: [
        'A single document has a hard limit of 16 MB, and big documents are slow to read and write.',
        '"Unbounded" arrays (that can grow forever) should not be embedded.',
        'You can embed a SMALL copy of the latest comments for the feed (subset pattern) and keep all comments in their own collection.',
      ],
      solution: `**Idea:** comments are **unbounded**, so they live in their own collection (reference). For the feed, the post keeps a **small embedded subset**: the latest 3 comments and a counter. Author details are copied as a small snapshot (extended reference) to avoid a join.

\`\`\`javascript
// posts
{
  _id: ObjectId('...'),
  title: 'Cursor pagination in MongoDB',
  body: '...',
  author: { _id: ObjectId('...'), name: 'Asha', avatarUrl: '/a.png' }, // snapshot
  tags: ['mongodb', 'node'],                                           // small, bounded -> embed
  commentCount: 1287,                                                   // computed pattern
  recentComments: [                                                     // subset pattern (max 3)
    { _id: ObjectId('...'), authorName: 'Ben', text: 'Great post!', createdAt: ISODate('...') },
  ],
  createdAt: ISODate('...'),
}

// comments (one document per comment)
{
  _id: ObjectId('...'),
  postId: ObjectId('...'),
  author: { _id: ObjectId('...'), name: 'Ben' },
  text: 'Great post!',
  createdAt: ISODate('...'),
}
\`\`\`

**Indexes:**

\`\`\`javascript
db.posts.createIndex({ createdAt: -1 });              // feed
db.posts.createIndex({ tags: 1, createdAt: -1 });     // filter by tag (multikey index)
db.comments.createIndex({ postId: 1, createdAt: -1, _id: -1 }); // comments page, newest first
\`\`\`

**Adding a comment:**

\`\`\`javascript
async function addComment(postId, user, text) {
  const comment = await Comment.create({
    postId, author: { _id: user._id, name: user.name }, text, createdAt: new Date(),
  });

  await Post.updateOne(
    { _id: postId },
    {
      $inc: { commentCount: 1 },
      $push: {
        recentComments: {
          $each: [{ _id: comment._id, authorName: user.name, text, createdAt: comment.createdAt }],
          $position: 0,   // newest first
          $slice: 3,      // keep only 3
        },
      },
    }
  );
  return comment;
}
\`\`\`

**Why it works:**

- The feed is **one query** on \`posts\` — no join, no comment scan.
- The post page pages through \`comments\` with an index (\`postId\` equality + \`createdAt\` sort).
- No document ever grows without limit, so the 16 MB limit and slow rewrites are never a problem.

**Trade-offs:** the two writes are not atomic. If the second fails, the counter is off by one — usually acceptable (fix with a periodic recount), or wrap both in a transaction if it must be exact. Snapshots of the author name go stale when a user renames; update them in a background job.`,
      followUps: [
        {
          q: 'When WOULD you embed comments directly?',
          a: 'When the array is small and bounded and always read with the parent — e.g. max 10 review notes on an internal ticket. Rule of thumb: embed "one-to-few", reference "one-to-many / one-to-squillions".',
        },
        {
          q: 'How do you handle nested replies?',
          a: 'Store replies in the same `comments` collection with a `parentId` (and maybe `rootId` for the thread). Fetch top-level comments with `parentId: null`, and replies for one thread with `rootId: x`.',
        },
      ],
    },
    {
      id: 'soft-delete-design',
      title: 'Add soft delete to an existing collection',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'mongoose-middleware',
      question: `Product asks for a "Trash" feature: deleted projects should disappear from the app but be **restorable for 30 days**, then removed for good.

The \`projects\` collection already has a **unique index on \`{ tenantId: 1, slug: 1 }\`**, and there are dozens of \`find\` / \`countDocuments\` / \`aggregate\` calls across the codebase.

How do you implement soft delete safely? What breaks if you just add a \`deleted\` flag?`,
      hints: [
        'Hard part 1: every existing query must now ignore deleted documents. How do you avoid editing 50 call sites?',
        'Hard part 2: a deleted project still occupies its slug in the unique index. Look at partial indexes.',
        'Hard part 3: automatic removal after 30 days — which index type deletes old documents?',
      ],
      solution: `**Idea:** add \`isDeleted\` (boolean) + \`deletedAt\` (date). Filter deleted docs automatically with Mongoose middleware, make the unique index **partial** (only live docs), and use a **TTL index** on \`deletedAt\` for the 30-day purge.

\`\`\`javascript
const projectSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  slug: { type: String, required: true },
  name: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

// 1) Unique only among NOT-deleted docs -> a deleted "website" slug can be reused
projectSchema.index(
  { tenantId: 1, slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// 2) TTL: delete for good 30 days after deletedAt. Docs with deletedAt null are never touched.
projectSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// 3) Hide deleted docs from every find*/count query unless the caller asks about isDeleted
function hideDeleted() {
  if (this.getFilter().isDeleted === undefined) this.where({ isDeleted: false });
}
projectSchema.pre(/^find/, hideDeleted);          // find, findOne, findById, findOneAndUpdate...
projectSchema.pre('countDocuments', hideDeleted);
// ...and from aggregations (query hooks do not run for aggregate)
projectSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

const Project = mongoose.model('Project', projectSchema);

// Delete / restore / trash list
const softDelete = (id) => Project.updateOne({ _id: id }, { $set: { isDeleted: true, deletedAt: new Date() } });
const restore = (id) => Project.updateOne({ _id: id, isDeleted: true }, { $set: { isDeleted: false, deletedAt: null } });
const trash = (tenantId) => Project.find({ tenantId, isDeleted: true }); // explicit filter -> hook skips
\`\`\`

**Migration first:** old documents have no \`isDeleted\` field and would be hidden by \`isDeleted: false\`. Run \`updateMany({ isDeleted: { $exists: false } }, { $set: { isDeleted: false, deletedAt: null } })\`, then drop the old unique index and create the partial one.

**What breaks with a naive flag:**

- Every query you forgot shows deleted data (leaks "deleted" items).
- Re-creating a project with the same slug fails with duplicate key \`11000\`.
- Trash grows forever.
- Related data (tasks of the project) is still visible — decide whether to soft-delete children too, or filter them by parent.

**Restore edge case:** if a new live project took the slug meanwhile, \`restore\` hits the unique index — catch \`11000\` and ask the user to rename.`,
      followUps: [
        {
          q: 'Why not use `partialFilterExpression: { deletedAt: null }`?',
          a: 'Partial filter expressions support a limited set of operators (equality, `$exists: true`, comparison operators, `$type`, `$and`, ...). A boolean equality like `isDeleted: false` is simple and clearly supported, so a separate flag is the safe choice.',
        },
        {
          q: 'Soft delete vs archiving to another collection?',
          a: 'Moving deleted docs to `projects_archive` keeps the main collection and its indexes clean and needs no query filters, but restore becomes a move back (ideally in a transaction). For large volumes of deletes, archiving is often cleaner.',
        },
      ],
    },
    {
      id: 'facet-search-results-and-counts',
      title: 'Search page: results, total count and filter counts in one query ($facet)',
      difficulty: 'hard',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'aggregation-facet',
      question: `A product search page needs, for the current filters (\`inStock: true\`, \`price <= 2000\`):

- the products for **page 2**, page size **2**, sorted by price (cheapest first),
- the **total** number of matches (for "Showing 3-4 of 5"),
- counts **per category** (sidebar filters),
- counts **per price range**: under 500, 500-999, 1000-2000.

\`products\`:

\`\`\`javascript
{ _id: 1, name: 'Mouse',       category: 'accessories', price: 25,   inStock: true }
{ _id: 2, name: 'Keyboard',    category: 'accessories', price: 80,   inStock: true }
{ _id: 3, name: 'Monitor',     category: 'displays',    price: 300,  inStock: true }
{ _id: 4, name: 'Pixel 8',     category: 'phones',      price: 699,  inStock: true }
{ _id: 5, name: 'MacBook Air', category: 'laptops',     price: 1199, inStock: true }
{ _id: 6, name: 'iPhone 15',   category: 'phones',      price: 799,  inStock: false }
\`\`\`

Do it in **one** aggregation and return a single clean object.`,
      hints: [
        'Run the shared `$match` ONCE, before anything else.',
        '`$facet` runs several sub-pipelines on the same input documents and returns one document with one array per sub-pipeline.',
        '`$count` inside a facet returns `[{ count: 5 }]` — or `[]` when nothing matches. Flatten it with `$arrayElemAt` and `$ifNull`.',
      ],
      solution: `**Idea:** one \`$match\` for the filters (can use an index), then \`$facet\` with four sub-pipelines, then a \`$project\` to flatten the total.

\`\`\`javascript
const page = 2;
const pageSize = 2;

db.products.aggregate([
  { $match: { inStock: true, price: { $lte: 2000 } } },     // shared filter, uses indexes
  {
    $facet: {
      results: [
        { $sort: { price: 1, _id: 1 } },                    // _id = stable tie-breaker
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
        { $project: { name: 1, price: 1, category: 1 } },
      ],
      total: [{ $count: 'count' }],                         // -> [ { count: 5 } ] or []
      byCategory: [
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ],
      priceRanges: [
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 500, 1000, 2001],               // [0,500) [500,1000) [1000,2001)
            default: 'other',
            output: { count: { $sum: 1 } },
          },
        },
      ],
    },
  },
  {
    $project: {
      results: 1,
      byCategory: 1,
      priceRanges: 1,
      total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] }, // [] -> 0
    },
  },
]);
\`\`\`

**Expected output (one document):**

\`\`\`javascript
{
  results: [
    { _id: 3, name: 'Monitor', category: 'displays', price: 300 },
    { _id: 4, name: 'Pixel 8', category: 'phones', price: 699 },
  ],
  byCategory: [
    { _id: 'accessories', count: 2 },
    { _id: 'displays', count: 1 },
    { _id: 'laptops', count: 1 },
    { _id: 'phones', count: 1 },      // iPhone is out of stock, so phones = 1
  ],
  priceRanges: [
    { _id: 0, count: 3 },             // 25, 80, 300
    { _id: 500, count: 1 },           // 699
    { _id: 1000, count: 1 },          // 1199
  ],
  total: 5,
}
\`\`\`

**Why it works:** \`$facet\` feeds the same 5 matched documents into each sub-pipeline in parallel, so you avoid 4 round trips and the counts are consistent with the results. \`'$total.count'\` on an array of objects gives an array of the counts, and \`$arrayElemAt\` picks the first.

**Limits to mention:**

- Stages **inside** \`$facet\` cannot use indexes — only the stages before it can. Keep the \`$match\` in front and selective.
- The whole \`$facet\` output is **one document**, so it must fit in **16 MB**. Never put an unlimited result list inside a facet.
- Every request counts all matches. On huge collections, cache the counts or use Atlas Search facets.`,
      followUps: [
        {
          q: 'The user selects category "phones". Should the category counts now show only phones?',
          a: 'Usually not — users want to see the other categories to switch. This is "disjunctive faceting": each facet is computed with all filters EXCEPT its own. Move the category filter into the `results`, `total` and `priceRanges` sub-pipelines (as a `$match`), and leave it out of `byCategory`.',
        },
        {
          q: 'Why not `$skip`/`$limit` before `$facet`?',
          a: 'Then the counts would only see the 2 docs of the current page. The total and facet counts need ALL matching docs, so pagination happens inside the `results` sub-pipeline only.',
        },
      ],
    },
    {
      id: 'running-total-setwindowfields',
      title: 'Running total and moving average per store ($setWindowFields)',
      difficulty: 'hard',
      type: 'query',
      frequency: 'occasional',
      relatedTopic: 'aggregation-advanced',
      question: `\`dailySales\` collection:

\`\`\`javascript
{ storeId: 'A', day: ISODate('2026-10-01'), amount: 100 }
{ storeId: 'A', day: ISODate('2026-10-02'), amount: 200 }
{ storeId: 'A', day: ISODate('2026-10-03'), amount: 50 }
{ storeId: 'A', day: ISODate('2026-10-04'), amount: 150 }
{ storeId: 'B', day: ISODate('2026-10-01'), amount: 300 }
{ storeId: 'B', day: ISODate('2026-10-02'), amount: 100 }
\`\`\`

For each row, add:

- \`runningTotal\`: the sum of the store's sales from its first day up to this day,
- \`movingAvg3\`: the average of this day and the 2 previous days for that store (rounded to 2 decimals).

Every original row must stay in the output (unlike \`$group\`, which collapses rows).`,
      hints: [
        '`$group` collapses rows. Window functions keep every row and add computed fields.',
        'Use `partitionBy` for "per store" and `sortBy` for "in day order".',
        'A window `documents: [\'unbounded\', \'current\']` means "from the first row up to this row"; `[-2, 0]` means "2 rows before up to this row".',
      ],
      solution: `**Idea:** \`$setWindowFields\` (MongoDB 5.0+) computes values over a "window" of neighbouring rows, separately for each partition (store), without removing any rows.

\`\`\`javascript
db.dailySales.aggregate([
  {
    $setWindowFields: {
      partitionBy: '$storeId',          // restart the calculation for each store
      sortBy: { day: 1 },               // order inside each store
      output: {
        runningTotal: {
          $sum: '$amount',
          window: { documents: ['unbounded', 'current'] }, // first row .. this row
        },
        movingAvg3: {
          $avg: '$amount',
          window: { documents: [-2, 0] },                  // 2 rows before .. this row
        },
      },
    },
  },
  { $set: { movingAvg3: { $round: ['$movingAvg3', 2] } } },
  { $project: { _id: 0 } },
  { $sort: { storeId: 1, day: 1 } },
]);
\`\`\`

**Expected output:**

\`\`\`javascript
{ storeId: 'A', day: ISODate('2026-10-01'), amount: 100, runningTotal: 100, movingAvg3: 100 }
{ storeId: 'A', day: ISODate('2026-10-02'), amount: 200, runningTotal: 300, movingAvg3: 150 }
{ storeId: 'A', day: ISODate('2026-10-03'), amount: 50,  runningTotal: 350, movingAvg3: 116.67 }
{ storeId: 'A', day: ISODate('2026-10-04'), amount: 150, runningTotal: 500, movingAvg3: 133.33 }
{ storeId: 'B', day: ISODate('2026-10-01'), amount: 300, runningTotal: 300, movingAvg3: 300 }
{ storeId: 'B', day: ISODate('2026-10-02'), amount: 100, runningTotal: 400, movingAvg3: 200 }
\`\`\`

At the start of a store there are fewer than 3 rows, so the average uses what exists (day 1 = 100, day 2 = (100+200)/2).

**Why it works:** \`partitionBy\` splits rows by store, \`sortBy\` orders them, and each \`window\` says which rows around the current one to use. This is the MongoDB version of SQL's \`SUM(amount) OVER (PARTITION BY store ORDER BY day)\`.

**Edge case — missing days:** \`documents: [-2, 0]\` counts **rows**, not days. If a store has no row for Oct 3, the "3-day" window silently covers 4 days. For calendar-based windows use a range window: \`window: { range: [-2, 0], unit: 'day' }\` (requires \`sortBy\` on a date field).`,
      followUps: [
        {
          q: 'How would you do this before MongoDB 5.0?',
          a: 'Fetch the rows sorted by store and day and compute the running total in Node with a simple loop (reset the sum when the store changes). For huge data, precompute and store the running total when each day is closed.',
        },
        {
          q: 'How do you rank stores by revenue within each region?',
          a: 'Group to one row per store first, then `$setWindowFields` with `partitionBy: \'$region\'`, `sortBy: { revenue: -1 }`, and `output: { rank: { $rank: {} } }` (or `$denseRank` if ties should not leave gaps).',
        },
      ],
    },
    {
      id: 'deep-skip-pagination-to-cursor',
      title: 'Debug: page 10,000 of the orders API takes 4 seconds',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'pagination',
      question: `The orders list API uses classic page numbers:

\`\`\`javascript
app.get('/api/orders', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const orders = await Order.find({ tenantId: req.tenantId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 20)
    .limit(20);
  res.json(orders);
});
\`\`\`

Page 1 is fast. Page 10,000 takes ~4 seconds. A mobile app with infinite scroll also reports **duplicate and missing orders** while new orders are coming in.

Explain both problems and rewrite the endpoint.`,
      hints: [
        '`skip(199980)` does not jump — the server still walks over every skipped entry.',
        'If a new order is inserted at the top while the user is on page 1, what happens to the items on page 2?',
        'Instead of "skip N", remember the LAST item you returned and ask for items that come after it ("keyset" or "cursor" pagination). You need a unique tie-breaker like `_id`.',
      ],
      solution: `**Problem 1 — skip is O(N):** \`skip(199980)\` makes MongoDB walk through 199,980 index entries (and often documents) and throw them away before returning 20. Deeper pages get linearly slower.

**Problem 2 — moving window:** page numbers are positions. When a new order is inserted at the top, every item shifts down by one, so the first item of page 2 is the last item the user already saw on page 1 (**duplicate**). When items are deleted, items are skipped (**missing**).

**Fix — cursor (keyset) pagination:** sort by \`createdAt\` + \`_id\` (unique tie-breaker), and for the next page ask for "rows strictly after the last row I sent". With the right index this is a direct index seek, equally fast on page 1 and page 10,000.

\`\`\`javascript
import { ObjectId } from 'mongodb';

const PAGE_SIZE = 20;

// The cursor is an opaque string the client sends back unchanged
const encodeCursor = (doc) =>
  Buffer.from(JSON.stringify({ t: doc.createdAt.toISOString(), id: String(doc._id) })).toString('base64url');

const decodeCursor = (cursor) => {
  const { t, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  return { createdAt: new Date(t), _id: new ObjectId(id) }; // throws on bad input
};

// Index: { tenantId: 1, createdAt: -1, _id: -1 }
app.get('/api/orders', async (req, res) => {
  const filter = { tenantId: req.tenantId };

  if (req.query.cursor) {
    let c;
    try {
      c = decodeCursor(String(req.query.cursor));
    } catch {
      return res.status(400).json({ error: 'Invalid cursor' });
    }
    // "after" the last row in (createdAt desc, _id desc) order
    filter.$or = [
      { createdAt: { $lt: c.createdAt } },               // older
      { createdAt: c.createdAt, _id: { $lt: c._id } },   // same time, smaller _id
    ];
  }

  const docs = await Order.find(filter)
    .sort({ createdAt: -1, _id: -1 })                     // must match the cursor logic
    .limit(PAGE_SIZE + 1)                                 // 1 extra row = "is there more?"
    .lean();

  const hasMore = docs.length > PAGE_SIZE;
  const items = hasMore ? docs.slice(0, PAGE_SIZE) : docs;

  res.json({ items, nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null });
});
\`\`\`

**Why it works:** the filter uses the index to seek straight to the position after the cursor, then reads only 21 entries. New inserts at the top do not shift anything, because the next page is defined by **values** (time + id), not by position. The \`_id\` tie-breaker makes the order unique, so two orders with the same \`createdAt\` are never skipped or repeated.

**Trade-offs:** you cannot jump to "page 537", and an exact total count is expensive on huge collections (show "1,000+" or use \`estimatedDocumentCount()\` for the whole collection). For admin tables that really need page numbers, keep skip/limit but cap the maximum page.`,
      followUps: [
        {
          q: 'Is there a simpler version?',
          a: 'If "newest first" is enough, sort by `_id` alone: ObjectIds start with a timestamp, so they roughly follow creation time. Then the filter is just `{ _id: { $lt: lastId } }` with sort `{ _id: -1 }`. It is only approximate across different servers creating ids in the same second.',
        },
        {
          q: 'How do you support a "previous page" button?',
          a: 'Send a `before` cursor and reverse the logic: `$gt` instead of `$lt`, sort ascending, then reverse the results in code before returning them.',
        },
        {
          q: 'Why make the cursor opaque (base64) instead of `?after=2026-10-07T...&id=...`?',
          a: 'Clients treat it as a token and cannot depend on its internals, so you can change the sort fields later without breaking apps. Validate it anyway — it is still user input.',
        },
      ],
    },
    {
      id: 'transaction-standalone-error',
      title: 'Debug: wallet transfer fails locally and loses money in production',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'transactions',
      question: `Transferring credits between two wallets. On a developer laptop it throws:

\`\`\`text
MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
\`\`\`

On Atlas it runs, but support tickets say money sometimes **disappears** (taken from one wallet, never added to the other) and some balances are **negative**.

\`\`\`javascript
async function transfer(fromId, toId, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Wallet.updateOne({ _id: fromId }, { $inc: { balance: -amount } }, { session });
    await Wallet.updateOne({ _id: toId }, { $inc: { balance: amount } });
    await Ledger.create([{ fromId, toId, amount }], { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
\`\`\``,
      hints: [
        'Transactions need the oplog (the replication log). Does a single standalone mongod have one?',
        'Look carefully at every operation — are they ALL part of the session?',
        'Where is the check that the sender has enough balance? Also: transient errors should be retried — `withTransaction` does that for you.',
      ],
      solution: `**Bug 1 — standalone server:** multi-document transactions only work on a **replica set** or a sharded cluster (they rely on the oplog). A plain local \`mongod\` is standalone. Atlas is always a replica set, so it works there.

Fix locally with a **single-node replica set**:

\`\`\`bash
docker run -d --name mongo -p 27017:27017 mongo:7 --replSet rs0
docker exec -it mongo mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"
# connection string: mongodb://localhost:27017/app?replicaSet=rs0
\`\`\`

(For tests, \`mongodb-memory-server\` has \`MongoMemoryReplSet\`.)

**Bug 2 — the second update has no \`{ session }\`:** it runs **outside** the transaction and is saved immediately. If the ledger insert then fails and the transaction aborts, the debit is rolled back but the credit stays — money is created from nothing. The two updates are no longer all-or-nothing. **Every** operation must pass \`{ session }\`.

**Bug 3 — results are never checked:** if \`toId\` is wrong (or the wallet was deleted), the credit matches **0** documents, no error is thrown, and the debit commits — that is the "disappearing money". Also nothing stops \`balance\` going below zero. Put the balance check in the filter (atomic) and check \`matchedCount\` / \`modifiedCount\`.

**Bug 4 — no retries:** transactions can fail with temporary errors (write conflicts, elections). \`session.withTransaction()\` retries the whole callback on \`TransientTransactionError\` and retries the commit on \`UnknownTransactionCommitResult\`.

**Fixed version:**

\`\`\`javascript
async function transfer(fromId, toId, amount) {
  if (!(amount > 0)) throw new Error('Amount must be positive');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // debit only if enough balance - check and update are one atomic step
      const debit = await Wallet.updateOne(
        { _id: fromId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { session }
      );
      if (debit.modifiedCount !== 1) throw new Error('Insufficient funds'); // aborts everything

      const credit = await Wallet.updateOne({ _id: toId }, { $inc: { balance: amount } }, { session });
      if (credit.matchedCount !== 1) throw new Error('Receiver not found');  // aborts the debit too

      await Ledger.create([{ fromId, toId, amount, at: new Date() }], { session }); // array form with options
    });
  } finally {
    await session.endSession();
  }
}
\`\`\`

**Why it works:** all three writes share one session inside one transaction, so either all are committed or none are. Throwing inside the callback aborts the transaction. \`withTransaction\` handles retry logic, so the callback must be safe to run more than once — **no side effects** like sending emails or calling Stripe inside it; do those after it succeeds.`,
      followUps: [
        {
          q: 'Could you avoid a transaction here?',
          a: 'Partly. A single-document update is always atomic, so a design where one document holds both balances would not need one. Another approach is a ledger-only design: insert one immutable ledger entry per transfer and compute balances from it — inserting one document is atomic.',
        },
        {
          q: 'What are the costs of transactions in MongoDB?',
          a: 'They hold locks on the touched documents, have a default time limit (about 60 seconds), cause write conflicts under contention, and are slower than single-document writes. Keep them short and touch few documents; prefer schema designs where one document update is enough.',
        },
        {
          q: 'How do you stop the same transfer request from running twice (double click, retry)?',
          a: 'Make it idempotent: the client sends an idempotency key, store it in the ledger entry with a unique index, and insert the ledger entry inside the transaction. A duplicate request then fails with `11000` and the whole transaction aborts.',
        },
      ],
    },
    {
      id: 'order-schema-snapshot-design',
      title: 'Design: e-commerce orders collection (snapshots, money, Stripe)',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'schema-design-patterns',
      question: `Design the \`orders\` collection for an online store that takes payments with Stripe. Requirements:

- "My orders" page: a user's orders, newest first.
- An order must always show the **price and product name the customer paid**, even if the product is renamed or the price changes later.
- Payment status is updated by **Stripe webhooks**, which can arrive **more than once**.
- Ops team lists all orders stuck in \`pending_payment\` for more than 1 hour.
- Stock must never go below zero.

Show the document shape, indexes, and the key update queries. Explain each design choice.`,
      hints: [
        'Should an order item reference the product (productId only) or copy the details? Think about what an invoice from last year should show.',
        'Floating-point numbers and money do not mix. What does Stripe use?',
        'Webhook idempotency: make the update conditional on the CURRENT status, so the second delivery changes nothing.',
      ],
      solution: `**Idea:** an order is a **historical record**, so it embeds a **snapshot** of everything at purchase time (item names, prices, address). Money is stored as integer cents. Status changes are conditional updates, which makes webhooks idempotent.

\`\`\`javascript
// orders
{
  _id: ObjectId('...'),
  orderNumber: 'ORD-2026-000123',            // human-friendly, unique
  userId: ObjectId('...'),
  status: 'paid',                             // pending_payment | paid | shipped | delivered | cancelled | refunded
  currency: 'usd',
  items: [                                    // SNAPSHOT: copied, not just referenced
    { productId: ObjectId('...'), sku: 'MBA-13-M3', name: 'MacBook Air 13"',
      unitPriceCents: 119900, qty: 1, lineTotalCents: 119900 },
  ],
  subtotalCents: 119900, discountCents: 10000, taxCents: 8793, shippingCents: 0,
  totalCents: 118693,                          // integer cents, like Stripe
  shippingAddress: { name: 'Asha Rao', line1: '12 MG Road', city: 'Bengaluru', postalCode: '560001', country: 'IN' },
  payment: { provider: 'stripe', paymentIntentId: 'pi_3Q...', status: 'succeeded' },
  statusHistory: [                             // bounded: a handful of changes per order
    { status: 'pending_payment', at: ISODate('...') },
    { status: 'paid', at: ISODate('...'), source: 'stripe_webhook' },
  ],
  createdAt: ISODate('...'),
  updatedAt: ISODate('...'),
}
\`\`\`

**Indexes:**

\`\`\`javascript
db.orders.createIndex({ userId: 1, createdAt: -1 });          // "my orders" (equality + sort)
db.orders.createIndex({ status: 1, createdAt: 1 });           // ops: stuck pending orders
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex(                                          // one order per PaymentIntent
  { 'payment.paymentIntentId': 1 },
  { unique: true, partialFilterExpression: { 'payment.paymentIntentId': { $exists: true } } }
);
\`\`\`

**Key queries:**

\`\`\`javascript
// 1) Reserve stock: conditional $inc -> never negative (run per item, in a transaction for multi-item carts)
const r = await db.collection('products').updateOne(
  { _id: productId, stock: { $gte: qty } },
  { $inc: { stock: -qty } }
);
if (r.modifiedCount !== 1) throw new Error('Out of stock');

// 2) Stripe webhook payment_intent.succeeded - idempotent
await db.collection('orders').updateOne(
  { 'payment.paymentIntentId': pi.id, status: 'pending_payment' }, // only from the expected state
  {
    $set: { status: 'paid', 'payment.status': 'succeeded', updatedAt: new Date() },
    $push: { statusHistory: { status: 'paid', at: new Date(), source: 'stripe_webhook' } },
  }
);
// A duplicate webhook finds status 'paid' -> matches 0 docs -> nothing happens. Still return 200 to Stripe.

// 3) Ops: pending for more than 1 hour
db.orders.find({ status: 'pending_payment', createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) } });
\`\`\`

**Why these choices:**

- **Snapshot vs reference:** if items only stored \`productId\`, renaming or repricing a product would silently change old invoices. \`productId\` is still kept for links and analytics.
- **Integer cents:** \`0.1 + 0.2 !== 0.3\` in floating point. Integers add up exactly and match Stripe's API.
- **Conditional status updates** form a simple state machine: an update only applies from the expected previous state, so retries, duplicates and out-of-order webhooks cannot move an order backwards.
- **Indexes follow the queries:** equality first, then the sort/range field (ESR).
- \`statusHistory\` is embedded because it is small and bounded and always read with the order.`,
      followUps: [
        {
          q: 'Where would you store the full Stripe webhook payloads?',
          a: 'In a separate `webhookEvents` collection with a unique index on the Stripe `event.id`. Insert first; a duplicate key error means "already processed". Add a TTL index if you only need them for a few months.',
        },
        {
          q: 'An order can have 5,000 line items (B2B). Does embedding still work?',
          a: 'It still fits in 16 MB, but every status update rewrites a large document. Consider an `orderItems` collection referenced by `orderId`, keeping totals and a small item summary on the order (subset pattern).',
        },
        {
          q: 'Why not decrement stock when the order is paid instead of when it is created?',
          a: 'Then two customers could pay for the last unit. Common approach: reserve stock at checkout with an expiry, confirm on payment, release on timeout or failure (a TTL-driven or scheduled cleanup).',
        },
      ],
    },
    {
      id: 'multi-tenant-unique-per-tenant',
      title: 'Design: multi-tenant SaaS — tenantId, unique email per company, no data leaks',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'multi-tenant-modeling',
      question: `You are building a hiring SaaS (applicant tracking). 2,000 companies (tenants) share one MongoDB database. One big customer owns ~40% of all data.

Requirements:

1. A candidate email must be **unique within a company**, but the same person can apply to two different companies.
2. A bug must **never** show one company's candidates to another company.
3. All list screens must stay fast for small and big tenants.

Design the collection, indexes and the code that enforces tenant isolation.`,
      hints: [
        'A unique index can span several fields. Which pair must be unique?',
        'If every developer has to remember `tenantId` in every query, someone will forget. Where can you add it automatically?',
        'Every hot query starts with "tenantId = X". Where should tenantId go in each compound index?',
      ],
      solution: `**Idea:** one shared \`candidates\` collection with a required \`tenantId\` on every document. Uniqueness is on the **pair** \`(tenantId, email)\`. Every index starts with \`tenantId\`. A Mongoose plugin adds the tenant filter to **every** query automatically, using the tenant stored in AsyncLocalStorage for the current request — and fails closed if there is none.

\`\`\`javascript
// Indexes
db.candidates.createIndex({ tenantId: 1, email: 1 }, { unique: true });  // unique PER tenant
db.candidates.createIndex({ tenantId: 1, stage: 1, createdAt: -1 });     // pipeline board lists
db.candidates.createIndex({ tenantId: 1, skills: 1 });                   // skill search
\`\`\`

\`\`\`javascript
// tenant-context.js
import { AsyncLocalStorage } from 'node:async_hooks';
export const tenantContext = new AsyncLocalStorage();

export function currentTenantId() {
  const tenantId = tenantContext.getStore()?.tenantId;
  if (!tenantId) throw new Error('No tenant in context'); // fail closed, never "all tenants"
  return tenantId;
}

// Express: after auth, everything in this request "knows" its tenant
app.use((req, res, next) => tenantContext.run({ tenantId: req.user.tenantId }, next));

// tenant-plugin.js
export function tenantPlugin(schema) {
  schema.add({ tenantId: { type: String, required: true, immutable: true } });

  // new documents get the tenant automatically
  schema.pre('validate', function () {
    if (!this.tenantId) this.tenantId = currentTenantId();
  });

  // every query gets "AND tenantId = current"
  const queryOps = ['find', 'findOne', 'countDocuments', 'findOneAndUpdate', 'findOneAndDelete',
    'updateOne', 'updateMany', 'deleteOne', 'deleteMany'];
  schema.pre(queryOps, function () {
    this.where({ tenantId: currentTenantId() });
  });

  // aggregations: put the tenant $match first (also lets it use the indexes)
  schema.pre('aggregate', function () {
    this.pipeline().unshift({ $match: { tenantId: currentTenantId() } });
  });
}

candidateSchema.plugin(tenantPlugin);

// Duplicate email inside the same company -> friendly error
try {
  await Candidate.create({ email: email.toLowerCase(), name });
} catch (err) {
  if (err.code === 11000) return res.status(409).json({ error: 'Candidate already exists' });
  throw err;
}
\`\`\`

**Why it works:**

- \`{ tenantId: 1, email: 1 }\` unique allows \`(acme, a@x.com)\` and \`(globex, a@x.com)\` but rejects a second \`(acme, a@x.com)\` — enforced by the database, so even concurrent requests cannot create duplicates.
- Isolation does not depend on every developer remembering a filter. If code runs without a tenant (a forgotten background job), it **throws** instead of reading everything.
- With \`tenantId\` first in every index, each tenant's data is a separate, contiguous range of the index, so a small tenant's query never scans the big tenant's entries.

**Gaps to cover:**

- \`$lookup\` inside an aggregation reads the other collection **without** the plugin — add \`tenantId\` to the lookup's own pipeline.
- \`insertMany\`, \`bulkWrite\` and the raw driver may skip some middleware — set \`tenantId\` explicitly there and cover it with tests.
- Background jobs must wrap work in \`tenantContext.run({ tenantId }, ...)\`.
- Add an integration test that logs in as tenant A and tries to read tenant B's ids (should get 404).

**The 40% tenant:** if the collection is sharded, use a compound shard key like \`{ tenantId: 1, _id: 1 }\` so the big tenant's data can be split across shards (a key of only \`tenantId\` would put it all in one huge, unsplittable chunk). Very large or regulated customers can also get their own database.`,
      followUps: [
        {
          q: 'Shared collection vs database-per-tenant: when would you switch?',
          a: 'Shared collection is cheapest and simplest for many small tenants. Database-per-tenant gives stronger isolation, per-tenant backup/restore and data residency, but thousands of databases mean thousands of collections and indexes, which strains the server. A hybrid (shared for small, dedicated for enterprise) is common.',
        },
        {
          q: 'Why `immutable: true` on tenantId?',
          a: 'So no update can move a document to another tenant by accident (or by a malicious payload like `{ $set: { tenantId: \'other\' } }`). Mongoose ignores changes to immutable paths after creation.',
        },
      ],
    },
    {
      id: 'boolean-search-query-builder',
      title: 'Build a MongoDB filter from "(react AND node) OR (vue NOT angular)"',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'boolean-search-design',
      question: `Recruiters search candidates with Boolean queries over the \`skills\` array (lowercase strings):

\`\`\`text
(react AND node) OR (vue NOT angular)
\`\`\`

Write \`buildSkillFilter(query)\` that returns a MongoDB filter:

- Support \`AND\`, \`OR\`, \`NOT\`, parentheses and \`"quoted phrases"\` (like \`"next.js"\`).
- Two terms next to each other mean AND (\`react node\` = \`react AND node\`). \`vue NOT angular\` means vue AND NOT angular.
- Precedence: \`NOT\` binds tighter than \`AND\`, which binds tighter than \`OR\`.
- Invalid queries like \`(react\` must throw a clear error — never build a broken or empty filter.

Expected output for the example:

\`\`\`javascript
{
  $or: [
    { $and: [{ skills: 'react' }, { skills: 'node' }] },
    { $and: [{ skills: 'vue' }, { $nor: [{ skills: 'angular' }] }] },
  ],
}
\`\`\``,
      hints: [
        'Split the work into 3 steps: tokenize (string -> tokens), parse (tokens -> tree), convert (tree -> filter).',
        'Recursive descent parser: one function per precedence level — parseOr calls parseAnd, which calls parseNot, which calls parsePrimary (a term or a group in parentheses).',
        'On an array field, `{ skills: \'react\' }` means "contains react". For NOT of any sub-expression, use `{ $nor: [subFilter] }`.',
      ],
      solution: `**Idea:** never glue strings together into a query. Build a small **syntax tree** first, then turn each node into a MongoDB operator: TERM → \`{ skills: value }\`, AND → \`$and\`, OR → \`$or\`, NOT → \`$nor\`.

\`\`\`javascript
// 1) Tokenizer: "(" or ")" or "quoted phrase" or a word
function tokenize(input) {
  const tokens = [];
  const re = /\\s*(\\(|\\)|"[^"]*"|[^\\s()"]+)/g;
  let m;
  while ((m = re.exec(input)) !== null) {
    const raw = m[1];
    const upper = raw.toUpperCase();
    if (raw === '(' || raw === ')') tokens.push({ type: raw });
    else if (upper === 'AND' || upper === 'OR' || upper === 'NOT') tokens.push({ type: upper });
    else tokens.push({ type: 'TERM', value: raw.replace(/"/g, '').trim().toLowerCase() });
  }
  if (tokens.length > 50) throw new Error('Query too long'); // protect the database
  return tokens;
}

// 2) Parser: precedence NOT > AND > OR
function parse(input) {
  const tokens = tokenize(input);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseOr() {
    const children = [parseAnd()];
    while (peek()?.type === 'OR') {
      next();
      children.push(parseAnd());
    }
    return children.length === 1 ? children[0] : { type: 'OR', children };
  }

  function parseAnd() {
    const children = [parseNot()];
    // explicit AND, or implicit AND when a term / "(" / NOT follows
    while (peek() && ['AND', 'TERM', '(', 'NOT'].includes(peek().type)) {
      if (peek().type === 'AND') next();
      children.push(parseNot());
    }
    return children.length === 1 ? children[0] : { type: 'AND', children };
  }

  function parseNot() {
    if (peek()?.type === 'NOT') {
      next();
      return { type: 'NOT', child: parseNot() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = next();
    if (!tok) throw new Error('Unexpected end of query');
    if (tok.type === 'TERM') return { type: 'TERM', value: tok.value };
    if (tok.type === '(') {
      const node = parseOr();
      if (next()?.type !== ')') throw new Error('Missing )');
      return node;
    }
    throw new Error(\`Unexpected \${tok.type}\`);
  }

  if (tokens.length === 0) throw new Error('Empty query');
  const tree = parseOr();
  if (pos < tokens.length) throw new Error(\`Unexpected \${peek().type}\`);
  return tree;
}

// 3) Tree -> MongoDB filter
function toMongo(node, field = 'skills') {
  switch (node.type) {
    case 'TERM':
      return { [field]: node.value };                 // array contains this value
    case 'AND':
      return { $and: node.children.map((c) => toMongo(c, field)) };
    case 'OR':
      return { $or: node.children.map((c) => toMongo(c, field)) };
    case 'NOT':
      return { $nor: [toMongo(node.child, field)] };   // works for a term or a whole group
    default:
      throw new Error('Unknown node');
  }
}

export function buildSkillFilter(query) {
  return toMongo(parse(query));
}

// Usage
const filter = buildSkillFilter('(react AND node) OR (vue NOT angular)');
const candidates = await Candidate.find({ tenantId, ...filter }).limit(50).lean();
\`\`\`

**Results on sample data:**

\`\`\`text
skills [react, node]           -> match   (first group)
skills [react]                 -> no match
skills [vue]                   -> match   (second group)
skills [vue, angular]          -> no match
skills [react, node, angular]  -> match   (first group does not care about angular)
"(react"                       -> Error: Missing )
"react AND"                    -> Error: Unexpected end of query
"OR node"                      -> Error: Unexpected OR
\`\`\`

**Why it works:** each parse function handles one precedence level and calls the next-tighter one, so \`a OR b AND c\` becomes \`a OR (b AND c)\` automatically. The final \`pos < tokens.length\` check catches leftovers like an extra \`)\`. Because user input only ever becomes **values** in \`{ skills: value }\` (never operator keys), there is no injection risk.

**Performance:** a multikey index on \`{ tenantId: 1, skills: 1 }\` helps the positive terms. \`$nor\` (NOT) cannot use the index well, so a query of only NOT terms scans many documents — consider rejecting "NOT-only" queries. Limit the number of tokens (done above) so one search cannot build a giant filter.`,
      followUps: [
        {
          q: 'How would you add field filters like `title:"engineering manager" AND skill:react`?',
          a: 'Let the tokenizer recognise `field:value` and store the field on the TERM node. In `toMongo`, map allowed field names to real paths (`skill` -> `skills`, `title` -> `currentTitle`) with a whitelist, and reject unknown fields.',
        },
        {
          q: 'Recruiters also want "react" to match "React.js" and "ReactJS". How?',
          a: 'Normalise at write time: store a `skillsNormalized` array using a synonym map (`reactjs`, `react.js` -> `react`) and apply the same map to search terms. For fuzzy matching and relevance scoring, move to Atlas Search, where the compound operator has `must`, `should` and `mustNot` that map nicely to AND / OR / NOT.',
        },
        {
          q: 'Why `$nor: [x]` instead of `{ skills: { $ne: \'angular\' } }`?',
          a: 'For a single term they mean the same thing (`$ne` on an array means "no element equals"). But `$nor` also works for NOT around a whole group like `NOT (php OR java)`, so one rule covers every case.',
        },
      ],
    },
  ],
};
