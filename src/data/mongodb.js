// MongoDB & Mongoose — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'mongodb',
  title: 'MongoDB & Mongoose',
  icon: '🍃',
  description: 'How to store, query and scale data in MongoDB, and how to use it well from Node with Mongoose. From documents and CRUD to indexes, aggregation, transactions, sharding and real search design.',
  definitionTitle: 'What are MongoDB and Mongoose?',
  definition: `**MongoDB** is a **NoSQL document database**. Instead of tables with rows, it stores **documents** — JSON-like objects (stored as **BSON**, a binary JSON) — inside **collections**. Documents in the same collection can have different fields, so the schema is flexible.

**Mongoose** is a Node.js library (an **ODM**, Object Data Modeling tool) for MongoDB. It adds **schemas**, validation, middleware hooks and helper methods, so your data stays consistent.

**One-line answer:** "MongoDB is a NoSQL document database that stores flexible JSON-like documents, and Mongoose is an ODM for Node.js that adds schemas, validation and middleware on top of it."`,
  topics: [
    {
      id: 'documents-collections-bson',
      title: 'Documents, Collections, BSON and ObjectId',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'MongoDB stores JSON-like documents (saved as BSON) inside collections. Every document has a unique _id, usually an ObjectId.',
      what: `MongoDB is a **document database**. Instead of rows in tables, you store **documents** in **collections**.

- A **document** is a JSON-like object: \`{ name: 'Asha', skills: ['react', 'node'] }\`.
- A **collection** is a group of documents, like a table. Documents in one collection do not need the same shape.
- A **database** holds many collections.
- Every document has an \`_id\` field. If you do not give one, MongoDB creates an **ObjectId**.

#### Deeper version
On disk and over the network, documents are stored as **BSON** (Binary JSON). BSON adds types that JSON does not have: \`ObjectId\`, \`Date\`, \`Decimal128\`, \`Int32\`, \`Int64\`, \`Binary\` and more. One document can be at most **16 MB**.

An **ObjectId** is 12 bytes: a 4-byte timestamp (seconds), a 5-byte random value, and a 3-byte counter. So ObjectIds are roughly sorted by creation time, and you can read the creation time with \`id.getTimestamp()\`. The \`_id\` field always has a unique index that you cannot drop.`,
      why: `Most app data is already shaped like objects (a user with addresses, an order with items). Storing it as documents means less mapping code, no joins for data that belongs together, and a flexible schema that is easy to change as the product grows.`,
      analogy: `A SQL table is like a printed form where every person must fill the same boxes. A MongoDB collection is like a folder of files: each file (document) is about one thing, and one file can have an extra page that the others do not have.`,
      code: [
        {
          title: 'Insert a document and read its ObjectId',
          lang: 'javascript',
          code: `// mongosh (the MongoDB shell)
use shop

db.users.insertOne({
  name: 'Asha',
  email: 'asha@example.com',
  skills: ['react', 'node'],          // arrays are normal
  address: { city: 'Pune', pin: '411001' }, // nested object
  createdAt: new Date(),
});

const u = db.users.findOne({ email: 'asha@example.com' });
print(u._id);                 // ObjectId('...') created automatically
print(u._id.getTimestamp());  // the time the ObjectId was created`,
        },
        {
          title: 'Money: use integer cents or Decimal128, not floats',
          lang: 'javascript',
          code: `// Floats are not exact: 0.1 + 0.2 = 0.30000000000000004
db.orders.insertOne({
  amountCents: 1999,                      // like Stripe: store the smallest unit
  price: NumberDecimal('19.99'),          // or exact Decimal128
  currency: 'usd',
});`,
        },
      ],
      output: `The user is stored as one document with an array and a nested object inside it. MongoDB adds an \`_id\` of type ObjectId, and \`getTimestamp()\` gives back the time it was created, because the first 4 bytes of the ObjectId are a timestamp.

In the order example, \`amountCents\` is an integer so math is exact, and \`NumberDecimal('19.99')\` stores an exact decimal instead of a float.`,
      questions: [
        { q: 'What is the difference between JSON and BSON?', a: 'JSON is text. BSON is the binary format MongoDB really stores. BSON is faster to scan and has extra types like `ObjectId`, `Date` and `Decimal128`.' },
        { q: 'What is inside an ObjectId?', a: 'A 4-byte timestamp, a 5-byte random value and a 3-byte counter. So it is unique without asking the server, and roughly ordered by creation time.' },
        { q: 'What is the maximum document size?', a: '16 MB. If a document could grow past that (for example, an unbounded array of comments), you should reference instead of embed.' },
        { q: 'Is MongoDB schemaless?', a: 'The database is schema-flexible: it does not force a shape by default. But real apps still have a schema — in Mongoose, or with `$jsonSchema` validation on the collection.' },
      ],
      spoken: `"MongoDB is a document database. Data lives in collections of JSON-like documents, which are stored as BSON, a binary format with extra types like ObjectId, Date and Decimal128. Each document has an \`_id\` with a unique index; by default it is an ObjectId, which contains a timestamp, so it is roughly sorted by creation time. A single document can be up to 16 MB. The schema is flexible, but in real projects I still enforce a shape with Mongoose or JSON Schema validation, and I store money as integer cents or Decimal128, never floats."`,
      mistakes: [
        'Saying MongoDB has "no schema". It is flexible, but your app still needs a clear schema, or the data becomes messy fast.',
        'Storing money as a normal JavaScript number (a float). Use integer cents or `Decimal128`.',
        'Comparing an ObjectId to a string with `===` in Node. Use `id.equals(other)` or compare `id.toString()`.',
        'Follow-up trap: "Can you sort by _id to get insert order?" Roughly yes, because of the timestamp, but only to the second, and clocks on different machines can differ. Use a `createdAt` field when the order really matters.',
      ],
      takeaway: 'MongoDB stores BSON documents in collections; each has a unique `_id`, usually an ObjectId with a built-in timestamp.',
    },
    {
      id: 'mongodb-vs-sql',
      title: 'MongoDB vs SQL: When to Choose Which',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'MongoDB fits flexible, document-shaped data read as a whole; SQL fits highly relational data with many joins and strict constraints.',
      what: `**SQL databases** (PostgreSQL, MySQL) store data in **tables** with fixed columns, and connect tables with **joins** and **foreign keys**.

**MongoDB** stores **documents** that can hold nested objects and arrays, so data that belongs together lives together.

Quick comparison:
- Table ↔ collection, row ↔ document, column ↔ field, JOIN ↔ embedding / \`$lookup\`, foreign key ↔ reference (not enforced).
- SQL: schema first, then data. MongoDB: flexible schema (but you should still design one).
- SQL scales mostly **vertically** (bigger machine) with read replicas; MongoDB has built-in **horizontal** scaling (sharding).

#### Deeper version
The real difference is **how you model**. SQL models the data in normalized form and lets queries join it. MongoDB models the data around the **queries**: you embed what is read together, duplicate a little on purpose, and avoid joins on hot paths.

Both now overlap a lot: MongoDB has multi-document ACID transactions, JSON Schema validation and \`$lookup\`; PostgreSQL has JSONB columns. So the choice is about fit:
- **MongoDB fits:** product catalogs with varying attributes, user profiles, content/CMS, event and log data, SaaS apps with tenant-scoped documents, fast-changing early products.
- **SQL fits:** banking ledgers and accounting with heavy relational rules, complex reporting with many ad-hoc joins, data where foreign-key integrity is critical.`,
      why: `"Why MongoDB and not Postgres?" is one of the most common questions for a MERN developer. A balanced answer (not "Mongo is faster") shows maturity.`,
      analogy: `SQL is a spreadsheet workbook: neat sheets with fixed columns, linked by ids. MongoDB is a set of folders: each folder holds a whole story (the order with its items and address) in one place.`,
      code: [
        {
          title: 'Same order in SQL and MongoDB',
          lang: 'sql',
          code: `-- SQL: three tables, joined on read
SELECT o.id, o.total_cents, c.name, i.sku, i.qty
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items i ON i.order_id = o.id
WHERE o.id = 42;`,
        },
        {
          title: 'MongoDB: one document, one read',
          lang: 'javascript',
          code: `db.orders.findOne({ _id: 42 });
// {
//   _id: 42,
//   totalCents: 27000,
//   customer: { _id: 7, name: 'Asha' },          // small copy (extended reference)
//   items: [ { sku: 'PEN-1', qty: 2 }, { sku: 'BK-7', qty: 1 } ]
// }`,
        },
      ],
      output: `In SQL, reading one order touches three tables and joins them. In MongoDB the same screen is one document read, because items and the customer's name are stored with the order. The trade-off: if the customer changes their name, the copy on old orders stays the same (which is often what you want for history), and nothing enforces that customer 7 exists.`,
      questions: [
        { q: 'Why would you choose MongoDB over a SQL database?', a: 'When data is document-shaped and read as a whole, the schema changes often, attributes vary per item, or you need easy horizontal scaling. It maps naturally to JavaScript objects in a MERN stack.' },
        { q: 'When would you not choose MongoDB?', a: 'For highly relational data with many ad-hoc joins, complex reporting across entities, or strict foreign-key integrity rules, a relational database is usually simpler.' },
        { q: 'Does MongoDB support joins and transactions?', a: 'Yes. `$lookup` does left outer joins, and multi-document ACID transactions exist since 4.0 (replica sets) and 4.2 (sharded clusters). They are just not meant to be on every hot path.' },
      ],
      spoken: `"I don't think one is simply better. SQL databases model data in normalized tables and join them at read time, with strong foreign-key integrity. MongoDB models data around the queries: I embed what is read together, so a typical screen is one document read, and the flexible schema helps when the product changes fast or items have different attributes. MongoDB also scales out with sharding. Today they overlap — Mongo has transactions and \`$lookup\`, Postgres has JSONB — so I choose by data shape: document-like, tenant-scoped app data fits Mongo; heavy relational reporting or ledgers fit SQL."`,
      mistakes: [
        'Saying "MongoDB has no transactions" or "no joins". Both exist now.',
        'Saying "MongoDB is always faster". It is fast when the model fits the queries; a SQL-style model in MongoDB with many `$lookup`s is often slower.',
        'Moving SQL tables 1:1 into collections without redesigning for embedding.',
        'Follow-up trap: "How do you keep referential integrity without foreign keys?" In the application: validate references on write, use transactions when several docs change together, and clean up orphans with jobs.',
      ],
      takeaway: 'Choose by data shape: document-like data read as a whole fits MongoDB; deeply relational data with many joins fits SQL.',
    },
    {
      id: 'mongoose-schemas-models',
      title: 'Mongoose Schemas and Models',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A Mongoose schema describes the shape and rules of your documents; a model is the class you use to query that collection.',
      what: `**Mongoose** is a Node.js library on top of the MongoDB driver. It adds a **schema** to your data.

- A **schema** says which fields exist, their types, defaults and validation rules.
- A **model** is built from a schema. It is a class connected to one collection. You use it to create, find, update and delete documents.
- A **document** is one instance of a model, with methods like \`save()\`.

#### Deeper version
Mongoose **casts** values to the schema type: \`'42'\` becomes \`42\` for a Number field. It runs **validators** on \`save()\` and \`create()\`, but on update queries only when you pass \`runValidators: true\`. Fields not in the schema are dropped by default (\`strict: true\`). The \`timestamps: true\` option adds \`createdAt\` and \`updatedAt\` for you. The model name \`'User'\` becomes the collection \`users\` (lowercase, plural).`,
      why: `MongoDB itself will accept any shape. In a real team, that leads to bugs like \`emial\` typos and strings where numbers should be. A schema gives one place for types, defaults, validation, indexes and helper methods, so every part of the app writes data the same way.`,
      analogy: `The schema is a cookie cutter. The model is the cookie factory that uses that cutter. Each document is one cookie: same shape every time, even though the dough (MongoDB) could take any shape.`,
      code: [
        {
          title: 'Define a schema and a model',
          lang: 'javascript',
          code: `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    age: { type: Number, min: 13 },
    skills: [String],
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// unique: true creates a unique INDEX. It is not a validator.
userSchema.index({ tenantId: 1, createdAt: -1 });

export const User = mongoose.model('User', userSchema); // collection: "users"`,
        },
        {
          title: 'Use the model',
          lang: 'javascript',
          code: `await mongoose.connect(process.env.MONGO_URL);

const user = await User.create({
  name: '  Asha ',
  email: 'ASHA@Example.com',
  age: '30',               // cast to the number 30
  tenantId: someTenantId,
  hacker: true,            // not in schema -> dropped (strict mode)
});
console.log(user.name, user.email, user.age); // "Asha" "asha@example.com" 30

try {
  await User.create({ name: 'Kid', email: 'k@x.com', age: 10, tenantId: someTenantId });
} catch (err) {
  console.log(err.name); // "ValidationError" (age is below min 13)
}`,
        },
      ],
      output: `\`trim\` and \`lowercase\` clean the input, so the saved name is \`Asha\` and the email is \`asha@example.com\`. The string \`'30'\` is cast to the number \`30\`. The unknown field \`hacker\` is silently dropped because of strict mode.

The second \`create\` fails with a \`ValidationError\` because \`age: 10\` is below \`min: 13\`. Nothing is written to the database.`,
      questions: [
        { q: 'What is the difference between a schema and a model?', a: 'A schema is the blueprint: fields, types, rules. A model is a class compiled from the schema and tied to a collection; you call `find`, `create` and so on on the model.' },
        { q: 'Is `unique: true` a validator?', a: 'No. It only tells Mongoose to build a unique index. A duplicate fails in MongoDB with error code 11000 (duplicate key), not with a Mongoose ValidationError.' },
        { q: 'Do validators run on `updateOne` or `findOneAndUpdate`?', a: 'Not by default. Pass `{ runValidators: true }` to run them on update queries. They always run on `save()` and `create()`.' },
        { q: 'Why use Mongoose instead of the native driver?', a: 'Schemas, casting, validation, middleware, populate and a nicer API. The native driver is lighter and a bit faster, and is fine when you want full control.' },
      ],
      spoken: `"In Mongoose, a schema describes the shape of a document: types, required fields, defaults, enums and validation. From the schema I build a model, which is a class tied to one collection, and I use it for all queries. Mongoose casts values to the right type and drops unknown fields in strict mode. One thing I watch for: \`unique: true\` is an index, not a validator, so duplicates come back as error 11000. And validators do not run on update queries unless I pass \`runValidators: true\`."`,
      mistakes: [
        'Treating `unique: true` as validation. It creates an index; if the index build fails because duplicates already exist, there is no uniqueness at all.',
        'Expecting validators to run on `updateOne` / `findOneAndUpdate` without `runValidators: true`.',
        'Relying on `autoIndex` in production. Mongoose builds indexes on startup by default, which can be slow on big collections; many teams turn it off and create indexes in migrations.',
        'Follow-up trap: "Where does the collection name come from?" Mongoose lowercases and pluralizes the model name (`User` -> `users`) unless you pass a collection name explicitly.',
      ],
      takeaway: 'Schema = rules and shape; model = the class you query with; remember that `unique` is an index and update queries skip validators by default.',
    },
    {
      id: 'crud-operations',
      title: 'CRUD Operations',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Create, Read, Update and Delete with insertOne/find/updateOne/deleteOne, plus update operators like $set, $inc and $push.',
      what: `**CRUD** means Create, Read, Update, Delete — the four basic things you do with data.

- **Create:** \`insertOne\`, \`insertMany\` (Mongoose: \`Model.create\`).
- **Read:** \`find\` (many), \`findOne\` (first match), with a **filter** and an optional **projection** (which fields to return).
- **Update:** \`updateOne\`, \`updateMany\`, \`findOneAndUpdate\`. You change fields with **update operators** like \`$set\`, \`$inc\`, \`$push\`.
- **Delete:** \`deleteOne\`, \`deleteMany\`, \`findOneAndDelete\`.

#### Deeper version
A single-document write is **atomic**: other clients never see half of it. So \`$inc\` on a counter is safe under many parallel requests, while "read, change in JS, save" is not. An **upsert** (\`upsert: true\`) updates the match or inserts a new document if none matches. \`findOneAndUpdate\` returns the old document by default; pass \`{ new: true }\` in Mongoose (or \`returnDocument: 'after'\` in the driver) to get the updated one.`,
      why: `Every feature you build is CRUD at the bottom. Knowing the right operator avoids bugs: \`$set\` changes one field instead of replacing the whole document, \`$inc\` avoids race conditions, and \`$addToSet\` avoids duplicate array items.`,
      analogy: `Think of a library card box. Create = add a new card. Read = look up cards. Update = write a correction on one line of a card (\`$set\`), not throw the card away and rewrite it. Delete = take a card out.`,
      code: [
        {
          title: 'CRUD in mongosh',
          lang: 'javascript',
          code: `// Create
db.products.insertMany([
  { name: 'Pen', price: 10, stock: 100, tags: ['office'] },
  { name: 'Book', price: 250, stock: 5, tags: ['study'] },
]);

// Read: filter + projection (only name and price, hide _id)
db.products.find({ price: { $lt: 100 } }, { name: 1, price: 1, _id: 0 });
// -> [ { name: 'Pen', price: 10 } ]

// Update: change only some fields
db.products.updateOne(
  { name: 'Book' },
  { $set: { price: 199 }, $inc: { stock: -1 }, $addToSet: { tags: 'sale' } }
);

// Upsert: update if found, insert if not
db.products.updateOne({ name: 'Bag' }, { $set: { price: 900 } }, { upsert: true });

// Delete
db.products.deleteOne({ name: 'Pen' });`,
        },
        {
          title: 'Same ideas in Mongoose',
          lang: 'javascript',
          code: `const book = await Product.findOneAndUpdate(
  { name: 'Book', stock: { $gt: 0 } },   // only if in stock
  { $inc: { stock: -1 } },               // atomic decrement
  { new: true, runValidators: true }     // return the updated doc
);
if (!book) throw new Error('Out of stock');

const cheap = await Product.find({ price: { $lt: 100 } })
  .select('name price')
  .sort({ price: 1 })
  .limit(10);

const { deletedCount } = await Product.deleteMany({ stock: 0 });`,
        },
      ],
      output: `The \`find\` returns only the Pen with \`name\` and \`price\`, because the projection hides everything else. The update on Book changes three things in one atomic step: price becomes 199, stock goes from 5 to 4, and \`'sale'\` is added to tags only if it is not there already. The upsert creates a new Bag document because none existed.

In Mongoose, the filter \`stock: { $gt: 0 }\` plus \`$inc\` makes "buy one" safe: if two users click at the same time, stock can never go below zero. \`book\` is \`null\` when nothing matched.`,
      questions: [
        { q: 'What is the difference between `updateOne` with `$set` and `replaceOne`?', a: '`$set` changes only the listed fields. `replaceOne` replaces the whole document (except `_id`). Passing a plain object to an update without operators is an error in the driver, which protects you from accidental replaces.' },
        { q: 'What is an upsert?', a: 'Update if a match exists, otherwise insert a new document built from the filter and the update. Turned on with `{ upsert: true }`.' },
        { q: 'How do you safely decrement stock under concurrency?', a: 'Put the condition in the filter and use `$inc` in one call: `updateOne({ _id, stock: { $gt: 0 } }, { $inc: { stock: -1 } })`. A single-document update is atomic.' },
        { q: 'What does `findOneAndUpdate` return by default?', a: 'The document as it was before the update. Use `{ new: true }` in Mongoose or `returnDocument: "after"` in the driver to get the new version.' },
      ],
      spoken: `"CRUD in MongoDB is insert, find, update and delete. For reads I use a filter and a projection so I only fetch the fields I need. For updates I always use operators like \`$set\`, \`$inc\`, \`$push\` and \`$addToSet\`, so I change just those fields. Single-document writes are atomic, so for things like stock I put the condition in the filter and use \`$inc\` in one call instead of reading, changing in JavaScript and saving, which can race. I also use upserts for 'create or update' logic, and remember \`findOneAndUpdate\` returns the old doc unless I ask for the new one."`,
      mistakes: [
        'Read-modify-save in Node (`doc.stock -= 1; await doc.save()`) under concurrency. Two requests can read the same value and one update is lost. Use `$inc` with a filter.',
        'Forgetting that `find` returns a cursor in the driver; you need `.toArray()` or iterate it.',
        'Using `$push` when you meant `$addToSet` and getting duplicate tags.',
        'Follow-up trap: "Is `updateMany` atomic?" Each document update is atomic, but the whole `updateMany` is not. If it fails halfway, some docs are updated and some are not. Use a transaction if you need all-or-nothing.',
      ],
      takeaway: 'Use update operators, not full replaces, and lean on single-document atomicity (`$inc` + filter) to avoid race conditions.',
    },
    {
      id: 'query-operators',
      title: 'Query Operators (Comparison, Logical, Array)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Filters are built from operators like $eq, $gt, $in, $and, $or, $not, $nor, $all and $elemMatch.',
      what: `A **filter** tells MongoDB which documents you want. You build it from **operators** that start with \`$\`.

- **Comparison:** \`$eq\`, \`$ne\`, \`$gt\`, \`$gte\`, \`$lt\`, \`$lte\`, \`$in\`, \`$nin\`.
- **Logical:** \`$and\`, \`$or\`, \`$nor\` (none of these), \`$not\` (negate one field condition).
- **Element:** \`$exists\`, \`$type\`.
- **Array:** \`$all\` (has all these values), \`$elemMatch\` (one element matches all conditions), \`$size\`.
- **Other:** \`$regex\`, \`$text\`, \`$expr\` (compare two fields).

#### Deeper version
Two fields in the same object are an implicit **AND**: \`{ a: 1, b: 2 }\`. You need an explicit \`$and\` only when you repeat the same key or combine two \`$or\` blocks.

\`$not\` is a **field-level** operator: \`{ title: { $not: /angular/i } }\`. There is no top-level \`$not\`; to negate a whole group you use \`$nor\`.

On arrays, \`{ skills: 'react' }\` matches if **any** element equals \`'react'\`. Watch out: \`$ne\`, \`$nin\` and \`$not\` also match documents where the field is **missing**.`,
      why: `Real screens have filters: price ranges, tags, status lists, "not archived", search. Knowing operators lets you push that filtering into the database (fast, uses indexes) instead of loading everything into Node and filtering there.`,
      analogy: `Operators are the filter buttons on a shopping site. "Price under 500" is \`$lt\`. "Brand is Nike or Puma" is \`$in\`. "Not refurbished" is \`$ne\`. Click many buttons together and you get AND.`,
      code: [
        {
          title: 'Common filters',
          lang: 'javascript',
          code: `// Price between 100 and 500, in some categories, not archived
db.products.find({
  price: { $gte: 100, $lte: 500 },
  category: { $in: ['shoes', 'bags'] },
  archived: { $ne: true },
});

// OR: on sale OR very cheap
db.products.find({ $or: [{ onSale: true }, { price: { $lt: 50 } }] });

// Two ORs together need an explicit $and
db.jobs.find({
  $and: [
    { $or: [{ remote: true }, { city: 'Pune' }] },
    { $or: [{ level: 'senior' }, { salary: { $gte: 3000000 } }] },
  ],
});

// NOR: neither draft nor deleted
db.posts.find({ $nor: [{ status: 'draft' }, { deleted: true }] });`,
        },
        {
          title: 'Array operators: $all and $elemMatch',
          lang: 'javascript',
          code: `// Candidates who know BOTH react and node
db.candidates.find({ skills: { $all: ['react', 'node'] } });

// Candidates who know react but NOT angular
db.candidates.find({ skills: { $eq: 'react', $nin: ['angular'] } });

// experience: [{ tech: 'react', years: 4 }, { tech: 'vue', years: 1 }]
// ONE element must be react AND years >= 3
db.candidates.find({
  experience: { $elemMatch: { tech: 'react', years: { $gte: 3 } } },
});

// Compare two fields in the same document
db.products.find({ $expr: { $lt: ['$stock', '$reorderLevel'] } });`,
        },
      ],
      output: `The first query returns products priced 100-500, in shoes or bags, that are not archived (including ones with no \`archived\` field). The \`$and\` of two \`$or\` blocks means "(remote or Pune) and (senior or high salary)".

\`$all\` matches candidates whose skills array has both values in any order. Without \`$elemMatch\`, \`{ 'experience.tech': 'react', 'experience.years': { $gte: 3 } }\` could match react with 1 year plus vue with 4 years, because each condition may hit a **different** element. \`$elemMatch\` forces both on the same element. \`$expr\` finds products that need restocking.`,
      questions: [
        { q: 'What is the difference between `$in` and `$all`?', a: '`$in` matches if the field equals any one of the values. `$all` matches only if the array contains every value.' },
        { q: 'When do you need `$elemMatch`?', a: 'When several conditions must be true for the same array element, for example tech = react and years >= 3 in one experience entry.' },
        { q: 'How do you write NOT in MongoDB?', a: 'Field level: `$ne`, `$nin` or `$not` (`{ title: { $not: /angular/i } }`). For a whole group of conditions use `$nor: [ ... ]`. There is no top-level `$not`.' },
        { q: 'Does `{ status: { $ne: "active" } }` match documents without a status field?', a: 'Yes. `$ne` and `$nin` also match missing fields. Add `$exists: true` if you do not want that.' },
      ],
      spoken: `"MongoDB filters are built from operators. Comparison ones like \`$gt\`, \`$lt\` and \`$in\`, logical ones like \`$or\`, \`$and\` and \`$nor\`, and array ones like \`$all\` and \`$elemMatch\`. Fields in the same object are an implicit AND, so I only write \`$and\` when I combine two ORs or repeat a key. For NOT, \`$not\` works on one field, and \`$nor\` negates a whole group. With arrays I use \`$elemMatch\` when two conditions must hit the same element. And I remember that \`$ne\` and \`$nin\` also match documents where the field is missing."`,
      mistakes: [
        'Using a top-level `$not` like `{ $not: { a: 1 } }`. That is invalid; use `$nor` or a field-level `$not`.',
        'Writing two `$or` keys in one object. The second silently overwrites the first in JavaScript. Wrap them in `$and`.',
        'Forgetting `$elemMatch` and matching conditions across different array elements.',
        'Follow-up trap: "Can `$nin` / `$ne` use an index well?" Not very well. Negation is not selective, so MongoDB often scans most of the index. Put a selective positive condition next to it.',
      ],
      takeaway: 'Learn the operator families; implicit AND, `$or`/`$nor` for groups, field-level `$not`, and `$elemMatch` for same-element array conditions.',
    },
    {
      id: 'embedding-vs-referencing',
      title: 'Embedding vs Referencing (Data Modeling)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Embed data that is read together and stays small; reference data that grows without limit, is shared, or is updated on its own.',
      what: `There are two ways to connect related data in MongoDB:

- **Embedding:** put the related data inside the parent document. Example: an order with its items array.
- **Referencing:** store only the other document's \`_id\`. Example: a post with \`authorId\` pointing to a user.

The golden rule: **data that is read together should be stored together.**

#### Deeper version
Think about the relationship size:
- **One-to-few** (a user's 3 addresses): embed.
- **One-to-many** (a product's 500 reviews): reference from the child (\`review.productId\`), or embed only a small subset (the latest 10 reviews) — the **subset pattern**.
- **One-to-squillions** (a server's log lines): always reference from the child. An array that grows forever will hit the 16 MB limit and gets slower to update.
- **Many-to-many** (students and courses): arrays of ids on one or both sides, or a join collection.

Sometimes you **duplicate** a little data on purpose (store \`authorName\` on each post) to avoid a lookup. This is fast to read but you must update copies when the source changes.`,
      why: `Model design decides your performance more than anything else. Good embedding means one query per screen. Bad embedding means huge documents, 16 MB errors and slow writes. Bad referencing means many queries (the N+1 problem) or heavy \`$lookup\`s.`,
      analogy: `Embedding is like keeping a receipt stapled inside the product box — everything is in one place. Referencing is like writing "see file #42" — you keep things separate and go fetch file #42 when you need it. You staple small things that always go together; you file away big or shared things.`,
      code: [
        {
          title: 'Embed: order with its items and a shipping address snapshot',
          lang: 'javascript',
          code: `db.orders.insertOne({
  userId: ObjectId('65f0c0ffee0000000000aaaa'), // reference to the user
  items: [                                       // embedded: always read with the order
    { sku: 'PEN-1', name: 'Pen', qty: 2, priceCents: 1000 },
    { sku: 'BK-7', name: 'Book', qty: 1, priceCents: 25000 },
  ],
  shipTo: { line1: '12 MG Road', city: 'Pune' }, // snapshot: must not change later
  totalCents: 27000,
  status: 'paid',
});`,
        },
        {
          title: 'Reference: reviews point to the product',
          lang: 'javascript',
          code: `// Unbounded -> separate collection, child points to parent
db.reviews.insertOne({
  productId: ObjectId('65f0c0ffee0000000000bbbb'),
  userId: ObjectId('65f0c0ffee0000000000aaaa'),
  rating: 5,
  text: 'Great pen',
});
db.reviews.createIndex({ productId: 1, createdAt: -1 });

// Product keeps only a small summary (computed + subset pattern)
db.products.updateOne(
  { _id: ObjectId('65f0c0ffee0000000000bbbb') },
  { $inc: { reviewCount: 1, ratingSum: 5 } }
);`,
        },
      ],
      output: `The order screen needs items and the address every time, so one \`findOne\` returns everything. The address is copied on purpose: if the user later changes their address, old orders must still show where they were shipped.

Reviews can grow to thousands, so they live in their own collection with an index on \`productId\`. The product stores only \`reviewCount\` and \`ratingSum\`, so the product page can show the average rating without reading all reviews.`,
      questions: [
        { q: 'When do you embed and when do you reference?', a: 'Embed when the data is small, bounded and read with the parent. Reference when it grows without limit, is shared by many parents, or is often read or updated on its own.' },
        { q: 'What is the risk of embedding a growing array?', a: 'The document can hit the 16 MB limit, every update rewrites a bigger document, and indexes on that array get very large.' },
        { q: 'Is duplicating data in MongoDB bad?', a: 'Not always. Duplicating fields that rarely change (like a name or a price snapshot) is a common trade-off to make reads fast. You accept extra work when the source changes.' },
        { q: 'How do you model many-to-many?', a: 'Store an array of ids on one side (e.g. `courseIds` on a student) if it is bounded, or use a separate join collection like `enrollments` with both ids and extra fields.' },
      ],
      spoken: `"My rule is: data that is read together is stored together. I embed when the related data is small and bounded, like order items or a few addresses, so one query loads the whole screen. I reference when the data grows without limit, is shared, or is accessed on its own, like reviews or logs, and I put the parent id on the child with an index. Sometimes I duplicate a small field, like a price snapshot on an order, for history or speed. The main thing I avoid is an unbounded array, because of the 16 MB limit and slow updates."`,
      mistakes: [
        'Designing like SQL: one collection per entity and joining everything with `$lookup`. Start from the queries the app runs.',
        'Embedding an unbounded array (comments, logs, followers) inside the parent document.',
        'Embedding a copy of data that must always be current (like a user\'s current email) and forgetting to update the copies.',
        'Follow-up trap: "What if a post can have 1 million comments but the page shows the latest 10?" Keep comments in their own collection and embed only the latest 10 in the post (subset pattern).',
      ],
      takeaway: 'Model for your queries: embed small, bounded, read-together data; reference big, unbounded or shared data.',
    },
    {
      id: 'indexes-basics',
      title: 'Indexes: Single, Compound, Multikey and Text',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'An index is a sorted list of field values pointing to documents, so MongoDB can find matches without scanning the whole collection.',
      what: `Without an index, MongoDB must read **every** document to answer a query. This is a **collection scan** (COLLSCAN).

An **index** is a separate, sorted structure (a B-tree) that stores some field values and a pointer to each document. MongoDB can jump straight to the matching part, like a book index.

- **Single-field index:** \`{ email: 1 }\`. \`1\` = ascending, \`-1\` = descending.
- **Compound index:** several fields in one index: \`{ tenantId: 1, createdAt: -1 }\`. **Order matters.**
- **Multikey index:** created automatically when the field is an array. One index entry per array element.
- **Text index:** splits text into words for \`$text\` search. Only **one text index per collection** (it can cover many fields).

#### Deeper version
A compound index supports queries on its **prefixes**. The index \`{ a: 1, b: 1, c: 1 }\` helps queries on \`a\`, on \`a + b\`, and on \`a + b + c\` — but not on \`b\` alone or \`c\` alone.

For a single-field index, direction does not matter (MongoDB can walk it both ways). For a compound index used for sorting, the sort must match the index directions **or be the exact reverse** of all of them: \`{ a: 1, b: -1 }\` can serve \`sort({ a: 1, b: -1 })\` and \`sort({ a: -1, b: 1 })\`, but not \`sort({ a: 1, b: 1 })\`.

Indexes cost something: every insert/update/delete must also update every index, and indexes use RAM. A compound index can have at most one array field (you cannot index two arrays together).`,
      why: `Indexes are the number one fix for slow MongoDB queries. A query that takes 2 seconds on a million documents can take 2 milliseconds with the right index. Interviewers almost always ask about them because they show if you have run MongoDB in production.`,
      analogy: `A collection scan is reading a whole phone book page by page to find "Sharma". An index is the alphabet tabs on the side: you jump to "S" and read only a few pages. A compound index is a phone book sorted by city, then by surname — great for "Sharma in Pune", useless for "all Sharmas in any city".`,
      code: [
        {
          title: 'Creating indexes',
          lang: 'javascript',
          code: `// Single field, unique
db.users.createIndex({ email: 1 }, { unique: true });

// Compound: "orders of one tenant, newest first"
db.orders.createIndex({ tenantId: 1, createdAt: -1 });

// Multikey: skills is an array -> one entry per skill
db.candidates.createIndex({ skills: 1 });

// Text index on two fields with weights (title matters more)
db.jobs.createIndex(
  { title: 'text', description: 'text' },
  { weights: { title: 10, description: 1 }, name: 'jobs_text' }
);

db.orders.getIndexes(); // list indexes`,
        },
        {
          title: 'Which queries use the compound index?',
          lang: 'javascript',
          code: `// Index: { tenantId: 1, status: 1, createdAt: -1 }
db.orders.find({ tenantId: t });                         // yes (prefix)
db.orders.find({ tenantId: t, status: 'paid' });         // yes (prefix)
db.orders.find({ tenantId: t, status: 'paid' })
         .sort({ createdAt: -1 });                       // yes, no in-memory sort
db.orders.find({ status: 'paid' });                      // no (not a prefix)

// Mongoose: declare indexes on the schema
orderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });`,
        },
      ],
      output: `Each \`createIndex\` builds a sorted structure. The unique index also stops two users from having the same email.

With the index \`{ tenantId, status, createdAt }\`, the first three queries can use it because they start from the left of the index. The third one even gets its sort for free, since inside one tenant and status the entries are already ordered by \`createdAt\`. The last query filters only on \`status\`, which is not a prefix, so this index cannot help it.`,
      questions: [
        { q: 'What is a compound index and why does field order matter?', a: 'One index on several fields, sorted by the first field, then the second, and so on. It only helps queries that use a left prefix of those fields, so the order decides which queries it can serve.' },
        { q: 'What is a multikey index?', a: 'An index on an array field. MongoDB adds one index entry per element, so `{ skills: "react" }` can use it. A compound index can include at most one array field.' },
        { q: 'What are the downsides of indexes?', a: 'Slower writes (every index must be updated), more RAM and disk, and the query planner has more options to evaluate. Remove unused indexes.' },
        { q: 'How many text indexes can a collection have?', a: 'Only one. It can include many fields, or all string fields with the wildcard `{ "$**": "text" }`.' },
      ],
      spoken: `"An index is a sorted B-tree of field values with pointers to documents, so MongoDB can avoid a full collection scan. I use single-field indexes for simple lookups, compound indexes for queries that filter and sort on several fields, and MongoDB makes them multikey automatically on arrays. In a compound index the order matters: it only supports left prefixes, and the sort direction must match or be fully reversed. I also keep in mind that each index slows down writes and uses memory, so I add indexes for real query patterns and drop the unused ones."`,
      mistakes: [
        'Creating one single-field index per field and expecting MongoDB to combine them well. A compound index for the real query is almost always better.',
        'Querying on a field that is not a left prefix of the compound index and wondering why it is slow.',
        'Adding indexes for every field "just in case". Each one slows every write and eats RAM.',
        'Follow-up trap: "Does `{ a: 1, b: 1 }` make a separate `{ a: 1 }` index useless?" Yes, mostly — the compound index already covers queries on `a`, so the single index is redundant.',
      ],
      takeaway: 'Indexes turn full scans into quick lookups; design compound indexes around real queries, because field order and prefixes decide what they can serve.',
    },
    {
      id: 'esr-rule',
      title: 'The ESR Rule (Equality, Sort, Range)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'In a compound index put Equality fields first, then Sort fields, then Range fields — it avoids in-memory sorts and keeps scans small.',
      what: `**ESR** is a simple rule for ordering fields in a compound index:

1. **E — Equality** fields first (exact match: \`status: 'open'\`, \`tenantId: t\`).
2. **S — Sort** fields next (the fields in \`.sort()\`).
3. **R — Range** fields last (\`$gt\`, \`$lt\`, \`$in\` with many values, \`$regex\`, \`$ne\`).

#### Deeper version
Why this order? After the equality fields, the matching index entries form **one continuous block** that is already sorted by the next field. If the sort field comes next, MongoDB reads that block in order and needs **no in-memory sort**.

If you put the range field before the sort field, the index walks many separate ranges. The results are not in sort order, so MongoDB must do a **blocking SORT stage** in memory. That is slow, and it fails or spills to disk if it uses too much memory (the limit is 100 MB by default; whether it spills depends on version and \`allowDiskUse\`, so check the docs for your version).

\`$in\` is special: with a few values it can act like equality, but when combined with a sort it often behaves like a range. Always confirm with \`explain()\`.`,
      why: `Most real API endpoints look like "filter by tenant and status, date between X and Y, newest first". ESR gives a clear way to build one index that serves the whole query efficiently instead of guessing.`,
      analogy: `Think of a library. First go to the right floor and shelf (equality). The books on that shelf are already in date order (sort), so you just pick the ones from 2020 to 2023 while walking along the shelf (range). If you first collected all books from 2020-2023 from every shelf, you would then have to sort the pile on a table yourself.`,
      code: [
        {
          title: 'Apply ESR to a real query',
          lang: 'javascript',
          code: `// Query: open tickets of one tenant, priority >= 3, newest first
db.tickets.find({
  tenantId: t,                 // E
  status: 'open',              // E
  priority: { $gte: 3 },       // R
}).sort({ createdAt: -1 });    // S

// ESR index: E, E, S, R
db.tickets.createIndex({ tenantId: 1, status: 1, createdAt: -1, priority: 1 });

// Non-ESR index: E, E, R, S -> needs an in-memory SORT
// db.tickets.createIndex({ tenantId: 1, status: 1, priority: 1, createdAt: -1 });`,
        },
        {
          title: 'Check it with explain',
          lang: 'javascript',
          code: `const plan = db.tickets.find({ tenantId: t, status: 'open', priority: { $gte: 3 } })
  .sort({ createdAt: -1 })
  .explain('executionStats');

// Good (ESR): winningPlan has IXSCAN, and NO "SORT" stage
// Bad (E, E, R, S): winningPlan shows a SORT stage above IXSCAN
printjson(plan.queryPlanner.winningPlan);
print(plan.executionStats.totalKeysExamined, plan.executionStats.nReturned);`,
        },
      ],
      output: `With the ESR index, MongoDB jumps to the block "this tenant, open", walks it already ordered by \`createdAt\` descending, and skips entries whose \`priority\` is below 3. There is no SORT stage in the plan, and it can stop early when you use \`.limit()\`.

With the E-E-R-S index, MongoDB finds all entries with priority 3, 4, 5... as separate chunks, so the results are not in date order and it must sort them in memory. \`explain()\` shows a \`SORT\` stage, which is the sign of a non-ESR index.`,
      questions: [
        { q: 'What is the ESR rule?', a: 'For compound indexes: Equality fields first, then Sort fields, then Range fields. It avoids in-memory sorts and keeps the index scan tight.' },
        { q: 'Why not put the range field before the sort field?', a: 'Then the index entries matching the range are not in sort order, so MongoDB must do a blocking in-memory sort.' },
        { q: 'Is `$in` equality or range?', a: 'It depends. Alone, it behaves like equality. With a sort after it, MongoDB may need to merge or sort results, so it often behaves like a range. Check `explain()`.' },
        { q: 'How do you know a query does an in-memory sort?', a: 'The `explain()` winning plan contains a `SORT` stage instead of the sort being satisfied by the `IXSCAN`.' },
      ],
      spoken: `"ESR is how I order fields in a compound index: Equality first, then Sort, then Range. After the equality fields, the index entries form one block already ordered by the sort field, so MongoDB can read them in order without an in-memory sort, and filter the range while it walks. If I put the range before the sort, I get a blocking SORT stage, which is slow and can hit memory limits. For example, tenantId and status, then createdAt for the sort, then priority for the range filter. I always confirm with explain that there is no SORT stage."`,
      mistakes: [
        'Putting the range field (`createdAt: { $gte: ... }`) before the sort field and getting a SORT stage.',
        'Treating ESR as a law. It is a strong default; sometimes a very selective range field earlier is better. Measure with `explain()`.',
        'Forgetting that a `$regex` that does not start with `^` is effectively a full scan of that index part, not a nice range.',
        'Follow-up trap: "Your filter and sort are on the same field, e.g. `createdAt >= X` and sort by `createdAt`?" Then it is one field; put it after the equality fields and it serves both the range and the sort.',
      ],
      takeaway: 'Equality, then Sort, then Range — and confirm there is no SORT stage in explain().',
    },
    {
      id: 'special-indexes',
      title: 'Unique, Partial, Sparse and TTL Indexes',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Index options that enforce uniqueness, index only some documents, skip missing fields, or auto-delete old documents.',
      what: `Indexes can take options that change how they behave:

- **Unique:** no two documents can have the same value. \`{ unique: true }\`.
- **Partial:** index only documents that match a filter. \`{ partialFilterExpression: { status: 'active' } }\`.
- **Sparse:** index only documents where the field **exists**.
- **TTL (Time To Live):** automatically delete documents some seconds after a date field. \`{ expireAfterSeconds: 3600 }\`.

#### Deeper version
**Partial vs sparse:** partial indexes are the modern, more flexible option. Sparse is basically a partial index with "field exists". MongoDB recommends partial indexes.

**Unique + partial** is a powerful combo: "email must be unique among non-deleted users", so a soft-deleted user does not block a new signup with the same email.

A partial index is used only when the query filter **includes the partial condition** (so the planner knows every result is inside the index).

**TTL details:** the field must be a BSON Date (or an array of dates). A background job runs about **every 60 seconds**, so documents are not deleted at the exact second. TTL works on single-field indexes; newer versions added more cases, so check the docs for your version before relying on anything else.`,
      why: `These options solve real product needs inside the database: unique emails, soft deletes, smaller indexes for "only active rows", and auto-cleanup of sessions, OTP codes, password-reset tokens and logs without writing a cron job.`,
      analogy: `A unique index is a guest list where no name can appear twice. A partial index is a VIP list — only some guests are on it, so it is short and fast. A TTL index is milk with an expiry date: after the date, it is thrown away automatically.`,
      code: [
        {
          title: 'Unique among non-deleted users (partial + unique)',
          lang: 'javascript',
          code: `// Soft delete with a boolean flag; only active users must be unique
db.users.createIndex(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false }, name: 'email_unique_active' }
);

// To USE the partial index, the query must include the condition
db.users.find({ email: 'a@x.com', isDeleted: false });`,
        },
        {
          title: 'TTL: OTP codes expire after 10 minutes',
          lang: 'javascript',
          code: `db.otps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });
db.otps.insertOne({ phone: '+9199...', code: '482913', createdAt: new Date() });

// Or expire at an exact time: put the expiry date in the field, use 0 seconds
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.sessions.insertOne({ userId: u, expiresAt: new Date(Date.now() + 7 * 864e5) });

// Mongoose shortcut
const otpSchema = new mongoose.Schema({
  code: String,
  createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL index
});`,
        },
      ],
      output: `The partial unique index only contains users with \`isDeleted: false\`. So two deleted users may share an email, but only one active user can have it. A query must include \`isDeleted: false\` for MongoDB to pick this index.

The OTP document is deleted roughly 10 minutes after \`createdAt\` — maybe up to a minute later, because the TTL monitor runs about every 60 seconds. The session uses \`expireAfterSeconds: 0\`, which means "delete at the time stored in \`expiresAt\`".`,
      questions: [
        { q: 'What is the difference between a partial and a sparse index?', a: 'Sparse skips documents where the field is missing. Partial skips documents that do not match any filter expression you give. Partial is more flexible and is the recommended one.' },
        { q: 'How does a TTL index work?', a: 'You set `expireAfterSeconds` on a Date field. A background task, running about every 60 seconds, deletes documents whose date plus that many seconds is in the past.' },
        { q: 'How do you allow the same email for soft-deleted users?', a: 'A unique index with a `partialFilterExpression` like `{ isDeleted: false }`, so only active users are checked for uniqueness.' },
        { q: 'Why might the planner ignore your partial index?', a: 'Because your query does not include the partial filter condition, so MongoDB cannot be sure all matches are in the index.' },
      ],
      spoken: `"Besides normal indexes, I use a few options a lot. Unique indexes enforce things like one account per email. Partial indexes only index documents that match a filter, which keeps them small; combined with unique, they let me do 'unique among active users' for soft deletes. Sparse is the older version of that, just skipping missing fields. And TTL indexes auto-delete documents after a time, which I use for OTPs, sessions and reset tokens. TTL is not exact to the second, because the cleanup runs about once a minute, so I still check expiry in code when it matters."`,
      mistakes: [
        'Relying on TTL for exact expiry. Deletion can lag about a minute or more under load; also check `expiresAt` in your code for security tokens.',
        'Putting TTL on a string date. It only works on BSON Date values.',
        'Adding a unique index to a collection that already has duplicates. The build fails; clean the data first.',
        'Follow-up trap: "Can a sparse unique index have many docs without the field?" Yes. Missing fields are not indexed, so they do not clash. A normal unique index would treat missing as null and allow only one.',
      ],
      takeaway: 'Unique for rules, partial for small targeted indexes (and soft-delete uniqueness), TTL for automatic cleanup — and the query must include the partial filter.',
    },
    {
      id: 'covered-queries',
      title: 'Covered Queries',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A query whose filter and returned fields are all inside one index, so MongoDB answers from the index without reading any document.',
      what: `Normally MongoDB uses the index to find matches, then **fetches** each full document from disk or cache.

A **covered query** is one where:
1. Every field in the **filter** is in the index, and
2. Every field in the **projection** (the fields you return) is in the index, and
3. \`_id\` is excluded (\`_id: 0\`) unless it is part of the index.

Then MongoDB never touches the documents. It answers straight from the index, which is very fast.

#### Deeper version
In \`explain()\`, a covered query shows \`totalDocsExamined: 0\` and there is **no FETCH stage** (you usually see \`PROJECTION_COVERED\` above \`IXSCAN\`).

A query is **not covered** if any indexed field is an array (multikey index) in a way that needs the document, or if you query a sub-field in an embedded document in some cases. In Mongoose, remember that \`find()\` returns \`_id\` by default, so add \`-_id\` to \`select()\`.`,
      why: `Covered queries are the fastest reads you can get: the index is smaller than the documents and often fully in RAM. They are great for hot endpoints like "does this email exist?", autocomplete lists, or counts and id lists.`,
      analogy: `A book index usually tells you "see page 42", and you flip to the page. But if all you need is "which page number has 'closures'?", the index itself has the answer — you never open the page. That is a covered query.`,
      code: [
        {
          title: 'A covered query',
          lang: 'javascript',
          code: `db.users.createIndex({ tenantId: 1, email: 1, name: 1 });

// Filter and projection only use indexed fields, and _id is excluded
const plan = db.users
  .find({ tenantId: t, email: 'asha@example.com' }, { _id: 0, email: 1, name: 1 })
  .explain('executionStats');

print(plan.executionStats.totalDocsExamined); // 0  -> covered
print(plan.executionStats.totalKeysExamined); // 1`,
        },
        {
          title: 'Same in Mongoose, and what breaks it',
          lang: 'javascript',
          code: `// Covered: lean + only indexed fields + no _id
const rows = await User.find({ tenantId: t, email })
  .select('email name -_id')
  .lean();

// NOT covered: _id is returned by default
await User.find({ tenantId: t, email }).select('email name');

// NOT covered: 'role' is not in the index -> FETCH needed
await User.find({ tenantId: t, email }).select('email role -_id');`,
        },
      ],
      output: `In the first query, \`totalDocsExamined\` is 0 and \`totalKeysExamined\` is 1: MongoDB found one index entry and returned \`email\` and \`name\` from it without loading the document.

In Mongoose, the first query is covered. The second one is not, because \`_id\` is returned by default and \`_id\` is not in this index. The third is not, because \`role\` lives only in the document, so MongoDB must FETCH it.`,
      questions: [
        { q: 'What is a covered query?', a: 'A query where the filter and the returned fields are all in one index, so MongoDB answers from the index alone and examines zero documents.' },
        { q: 'How do you confirm a query is covered?', a: 'Run `explain("executionStats")`: `totalDocsExamined` is 0 and there is no FETCH stage.' },
        { q: 'Why does a simple query often fail to be covered?', a: 'Because `_id` is returned by default. Exclude it with `{ _id: 0 }`, unless `_id` is in the index.' },
      ],
      spoken: `"A covered query is one that MongoDB can answer only from the index, without reading the documents. For that, every field in the filter and every field I return must be in the same index, and I must exclude \`_id\` unless it is indexed too. In explain, I check that \`totalDocsExamined\` is zero and there is no FETCH stage. I use it for hot, small queries like checking if an email exists or listing ids. The common gotcha is that \`_id\` comes back by default, which quietly breaks coverage."`,
      mistakes: [
        'Forgetting to exclude `_id`, so the query must fetch documents.',
        'Projecting one extra non-indexed field "just in case" and losing coverage.',
        'Building huge indexes with many fields only to cover one query; the write cost may be higher than the read gain.',
        'Follow-up trap: "Can a query on an array field be covered?" Usually no. Multikey indexes cannot cover queries on the array fields themselves.',
      ],
      takeaway: 'If the filter and the projection live entirely in one index (and `_id` is excluded), MongoDB never touches the documents.',
    },
    {
      id: 'explain-plans',
      title: 'explain(): COLLSCAN vs IXSCAN, Docs Examined vs Returned',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'explain() shows how MongoDB ran a query: which index, how many keys and documents it read, and how many it returned.',
      what: `\`explain()\` tells you **how** MongoDB runs a query. It is the main tool for finding slow queries.

The key things to read:
- **COLLSCAN:** collection scan — no index used, every document was read. Usually bad on big collections.
- **IXSCAN:** index scan — an index was used.
- **FETCH:** documents were loaded after the index scan.
- **SORT:** an in-memory sort happened (no index served the sort).
- **nReturned:** how many documents came back.
- **totalKeysExamined:** how many index entries were read.
- **totalDocsExamined:** how many documents were read.

#### Deeper version
The perfect ratio is \`totalKeysExamined ≈ totalDocsExamined ≈ nReturned\`. If MongoDB examined 50,000 documents to return 20, your index is missing or not selective.

\`explain()\` has three modes:
- \`'queryPlanner'\` (default): shows the chosen plan, does not run the query.
- \`'executionStats'\`: runs the query and shows real counts and time (\`executionTimeMillis\`).
- \`'allPlansExecution'\`: also shows stats for the plans that lost.

The **query planner** tries candidate plans for a new query shape, picks the winner, and **caches** it. In production, you also find slow queries using the **profiler** (\`db.setProfilingLevel(1, { slowms: 100 })\`) or the Atlas Performance Advisor.`,
      why: `"It is slow" is not a diagnosis. \`explain()\` shows exactly why: no index, wrong index order, an in-memory sort, or reading 1000x more documents than needed. Interviewers love asking how you debugged a slow query.`,
      analogy: `\`explain()\` is the delivery driver's route log. COLLSCAN means the driver knocked on every house in the city. IXSCAN means they used the map. "Docs examined 50,000, returned 20" means they knocked on 50,000 doors to deliver 20 parcels.`,
      code: [
        {
          title: 'Before and after an index',
          lang: 'javascript',
          code: `const q = { tenantId: t, status: 'open' };

let s = db.tickets.find(q).sort({ createdAt: -1 }).limit(20).explain('executionStats');
print(s.queryPlanner.winningPlan.stage);   // e.g. "SORT" / "LIMIT" over "COLLSCAN"
print(s.executionStats.totalDocsExamined); // 500000
print(s.executionStats.nReturned);         // 20

db.tickets.createIndex({ tenantId: 1, status: 1, createdAt: -1 });

s = db.tickets.find(q).sort({ createdAt: -1 }).limit(20).explain('executionStats');
// winning plan now: LIMIT -> FETCH -> IXSCAN (no SORT stage)
print(s.executionStats.totalKeysExamined); // 20
print(s.executionStats.totalDocsExamined); // 20
print(s.executionStats.nReturned);         // 20`,
        },
        {
          title: 'explain in Mongoose and the profiler',
          lang: 'javascript',
          code: `const stats = await Ticket.find({ tenantId: t, status: 'open' })
  .sort({ createdAt: -1 })
  .limit(20)
  .explain('executionStats');
console.log(stats.executionStats?.totalDocsExamined);
// Note: the exact shape of the explain output can differ by server version
// and for sharded clusters, so read it carefully.

// mongosh: log queries slower than 100 ms into db.system.profile
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(5);`,
        },
      ],
      output: `Before the index, the plan is a COLLSCAN with an in-memory SORT. MongoDB read 500,000 documents to return 20 — a terrible ratio.

After the compound index, the plan is IXSCAN then FETCH, with no SORT stage. Keys examined, docs examined and returned are all 20, which is the ideal. The profiler records any query slower than 100 ms, so you can find the next slow query to fix.`,
      questions: [
        { q: 'What is the difference between COLLSCAN and IXSCAN?', a: 'COLLSCAN reads every document in the collection. IXSCAN walks an index to find only the matching entries.' },
        { q: 'What does a high totalDocsExamined compared to nReturned mean?', a: 'MongoDB is reading many documents it then throws away. The index is missing, not selective, or in the wrong field order.' },
        { q: 'What are the explain modes?', a: '`queryPlanner` (plan only, no execution), `executionStats` (runs it and shows real counts and time), and `allPlansExecution` (stats for rejected plans too).' },
        { q: 'How do you find slow queries in production?', a: 'Use the database profiler with a `slowms` threshold, the slow query log, or Atlas Query Profiler / Performance Advisor, then run `explain()` on the worst ones.' },
      ],
      spoken: `"When a query is slow, I run explain with executionStats. First I look at the winning plan: COLLSCAN means no index was used, IXSCAN means an index was used, and a SORT stage means an in-memory sort. Then I compare totalKeysExamined, totalDocsExamined and nReturned. Ideally they are close. If it examined 50,000 docs to return 20, I need a better index, usually a compound one following the ESR rule. In production I find these queries with the profiler or Atlas Performance Advisor, fix the index, and run explain again to confirm."`,
      mistakes: [
        'Looking only at execution time. On a small dev database everything is fast; the ratio of examined to returned shows the real problem.',
        'Running `explain()` in default mode and expecting real counts. You need `executionStats`.',
        'Seeing IXSCAN and assuming the query is good. An IXSCAN that reads 100,000 keys for 10 results is still bad.',
        'Follow-up trap: "The index exists but MongoDB does not use it — why?" The query is not a prefix match, the types differ (string vs ObjectId), a cached plan is stale, or the planner found another plan faster. You can test with `hint()`.',
      ],
      takeaway: 'Read explain() for COLLSCAN vs IXSCAN, a SORT stage, and the ratio of keys/docs examined to nReturned — aim for them to be nearly equal.',
    },
    {
      id: 'aggregation-basics',
      title: 'Aggregation Pipeline: $match, $group, $project, $sort',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A pipeline is a list of stages; documents flow through each stage, which filters, groups, reshapes or sorts them.',
      what: `The **aggregation pipeline** is MongoDB's tool for reports and data transformation. You pass an **array of stages**. Documents go into stage 1, its output goes into stage 2, and so on — like Unix pipes.

The most used stages:
- \`$match\` — filter documents (same syntax as \`find\`).
- \`$group\` — group by a key and compute totals: \`$sum\`, \`$avg\`, \`$min\`, \`$max\`, \`$push\`, \`$addToSet\`, \`$first\`.
- \`$project\` — choose, rename or compute fields.
- \`$addFields\` / \`$set\` — add computed fields but keep the rest.
- \`$sort\`, \`$limit\`, \`$skip\` — order and slice.
- \`$count\` — count the documents that reach this stage.

#### Deeper version
**Order matters for speed.** Put \`$match\` (and \`$sort\` + \`$limit\` when possible) at the **start**, because only stages at the beginning of the pipeline can use indexes. After a \`$group\` or \`$project\`, the documents are new shapes and indexes no longer apply.

Inside stages, \`'$field'\` (with a dollar) means "the value of this field". Each stage has a **100 MB memory limit**; for big \`$group\` or \`$sort\` stages use \`{ allowDiskUse: true }\` (newer versions may spill to disk by default — check the docs for your version). The final result of \`aggregate\` (when not using \`$out\` / \`$merge\`) is returned through a cursor; each output document must still be under 16 MB.`,
      why: `Dashboards, revenue reports, "top 5 products this month", counts by status — all of this should run inside the database. Loading 100,000 documents into Node to sum them is slow and wastes memory and network.`,
      analogy: `A pipeline is a factory assembly line. The first worker throws out bad parts (\`$match\`), the next sorts parts into bins by type (\`$group\`), the next labels each bin (\`$project\`), and the last puts them in order (\`$sort\`). Throwing out bad parts first means less work for everyone after.`,
      code: [
        {
          title: 'Revenue per product for one tenant, this month',
          lang: 'javascript',
          code: `db.orders.aggregate([
  // 1. Filter first: uses the { tenantId, status, createdAt } index
  { $match: {
      tenantId: t,
      status: 'paid',
      createdAt: { $gte: ISODate('2026-09-01'), $lt: ISODate('2026-10-01') },
  } },
  // 2. One document per order item
  { $unwind: '$items' },
  // 3. Group by product
  { $group: {
      _id: '$items.sku',
      revenueCents: { $sum: { $multiply: ['$items.qty', '$items.priceCents'] } },
      unitsSold: { $sum: '$items.qty' },
      orders: { $addToSet: '$_id' },
  } },
  // 4. Reshape the output
  { $project: {
      _id: 0,
      sku: '$_id',
      revenueCents: 1,
      unitsSold: 1,
      orderCount: { $size: '$orders' },
  } },
  // 5. Top 5
  { $sort: { revenueCents: -1 } },
  { $limit: 5 },
]);`,
        },
        {
          title: 'Counts by status (Mongoose)',
          lang: 'javascript',
          code: `// Aggregate does NOT cast types: convert string ids yourself
const tenantObjectId = new mongoose.Types.ObjectId(req.tenantId);

const byStatus = await Order.aggregate([
  { $match: { tenantId: tenantObjectId } },
  { $group: { _id: '$status', count: { $sum: 1 }, avgCents: { $avg: '$totalCents' } } },
  { $sort: { count: -1 } },
]);
// [ { _id: 'paid', count: 120, avgCents: 4520 }, { _id: 'refunded', count: 4, ... } ]`,
        },
      ],
      output: `The first pipeline keeps only this tenant's paid orders from September, splits each order into one document per item, then groups by SKU. For each SKU it adds up revenue (qty x price) and units, and collects unique order ids. \`$project\` renames \`_id\` to \`sku\` and turns the order id list into a count. Finally we get the top 5 by revenue.

The Mongoose example returns one row per status with a count and the average total. Note that we built an ObjectId ourselves: Mongoose casts \`find()\` filters, but **not** aggregation pipelines.`,
      questions: [
        { q: 'What is the aggregation pipeline?', a: 'An array of stages that process documents in order. Each stage takes the output of the previous one and filters, groups, reshapes or sorts it.' },
        { q: 'Why should `$match` come first?', a: 'It reduces the number of documents early, and only stages at the start of the pipeline can use indexes.' },
        { q: 'What is the difference between `$project` and `$addFields`?', a: '`$project` outputs only the fields you list (or removes the ones you exclude). `$addFields` (alias `$set`) keeps all fields and adds or overwrites some.' },
        { q: 'Does Mongoose cast types inside `aggregate()`?', a: 'No. You must convert strings to `ObjectId` and dates to `Date` yourself, or `$match` silently returns nothing.' },
      ],
      spoken: `"The aggregation pipeline is an array of stages, and documents flow through them in order. I use \`$match\` to filter, \`$group\` with accumulators like \`$sum\` and \`$avg\` to build totals, \`$project\` or \`$addFields\` to shape the output, and \`$sort\` and \`$limit\` to get top N lists. For performance I always put \`$match\` first, because only the early stages can use indexes and it cuts the data down. One gotcha I have hit with Mongoose: aggregate does not cast types, so a string tenant id in \`$match\` matches nothing until I convert it to an ObjectId."`,
      mistakes: [
        'Putting `$match` after `$group` or `$project` when it could go first; the index cannot be used and every document is processed.',
        'Passing a string where an ObjectId is stored inside `$match` in Mongoose, and getting an empty result.',
        'Writing `_id: "status"` instead of `_id: "$status"` in `$group`. Without the dollar it is a constant, so everything lands in one group.',
        'Follow-up trap: "What happens with a huge `$group`?" Each stage has a memory limit (100 MB); use `allowDiskUse` or reduce data earlier, and check the docs because the default changed in newer versions.',
      ],
      takeaway: 'Stages run in order — filter early with `$match`, then group, reshape and sort; and convert types yourself in Mongoose aggregations.',
    },
    {
      id: 'aggregation-lookup-unwind',
      title: 'Aggregation: $lookup and $unwind',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: '$lookup joins documents from another collection into an array; $unwind turns each array element into its own document.',
      what: `- \`$lookup\` is MongoDB's **join**. For each document, it finds matching documents in another collection and puts them into a new **array field**.
- \`$unwind\` takes an array field and outputs **one document per element**. A document with 3 items becomes 3 documents.

They are often used together: \`$lookup\` gives an array (even for one match), and \`$unwind\` turns that array back into a single object.

#### Deeper version
There are two forms of \`$lookup\`:
1. **Simple:** \`localField\` / \`foreignField\` — equality match.
2. **Pipeline form:** \`let\` + \`pipeline\` — run a full sub-pipeline per document, so you can add extra conditions, project only some fields, sort or limit. Newer versions (5.0+) also let you combine \`localField\`/\`foreignField\` with a \`pipeline\`.

Performance: \`$lookup\` runs a query on the other collection **for each input document**. Always have an index on the \`foreignField\`, and \`$match\` / \`$limit\` **before** the lookup so it runs fewer times.

\`$unwind\` drops documents whose array is empty or missing. Use \`preserveNullAndEmptyArrays: true\` to keep them (like a LEFT JOIN).`,
      why: `Even with good modeling, some screens need data from two collections — orders with customer names, posts with author info. \`$lookup\` does this in one round trip. \`$unwind\` is needed whenever you want to group or sort by something inside an array.`,
      analogy: `\`$lookup\` is like a teacher writing each student's library books next to their name in the register. \`$unwind\` is like making a separate row for each book, so you can count "how many times was each book borrowed".`,
      code: [
        {
          title: 'Orders with customer info (left join)',
          lang: 'javascript',
          code: `db.orders.aggregate([
  { $match: { tenantId: t, status: 'paid' } },
  { $sort: { createdAt: -1 } },
  { $limit: 20 },                     // join only 20 orders, not all of them
  { $lookup: {
      from: 'users',                  // the real collection name
      localField: 'userId',
      foreignField: '_id',            // _id is always indexed
      as: 'customer',                 // result is an ARRAY
  } },
  { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
  { $project: { totalCents: 1, createdAt: 1, 'customer.name': 1, 'customer.email': 1 } },
]);`,
        },
        {
          title: 'Pipeline $lookup: latest 3 reviews per product',
          lang: 'javascript',
          code: `db.products.aggregate([
  { $match: { category: 'pens' } },
  { $lookup: {
      from: 'reviews',
      let: { pid: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$productId', '$$pid'] }, approved: true } },
        { $sort: { createdAt: -1 } },
        { $limit: 3 },
        { $project: { _id: 0, rating: 1, text: 1 } },
      ],
      as: 'latestReviews',
  } },
]);
// Needs an index on reviews { productId: 1, createdAt: -1 }`,
        },
      ],
      output: `The first pipeline picks the 20 newest paid orders and only then joins each to its user. \`customer\` starts as an array with one user; \`$unwind\` turns it into a plain object. Because of \`preserveNullAndEmptyArrays\`, an order whose user was deleted is still returned (without \`customer\`). The result has the total, date and the customer's name and email.

The second pipeline adds a \`latestReviews\` array with at most 3 approved reviews per pen. \`$$pid\` refers to the variable defined in \`let\`; \`$productId\` is the field in the review.`,
      questions: [
        { q: 'Why does `$lookup` return an array?', a: 'Because many documents can match. Even a one-to-one join gives an array, so you often follow it with `$unwind` or `$arrayElemAt`.' },
        { q: 'What does `$unwind` do with an empty array?', a: 'It drops the document by default. Use `preserveNullAndEmptyArrays: true` to keep it.' },
        { q: 'How do you make `$lookup` fast?', a: 'Index the `foreignField`, reduce documents with `$match`/`$limit` before the lookup, and use the pipeline form to project only needed fields.' },
        { q: 'Is `$lookup` a replacement for good schema design?', a: 'No. It is useful, but if a screen always needs a join, consider embedding or duplicating the needed fields instead.' },
      ],
      spoken: `"\`$lookup\` is MongoDB's left outer join: for each document it finds matches in another collection and puts them in an array. \`$unwind\` splits an array into one document per element, so I use it after a lookup to get a single object, or before a \`$group\` when I need to aggregate over array items. For performance, I make sure the foreign field is indexed and I filter and limit before the lookup, because it runs once per input document. The pipeline form lets me add conditions, sort and limit inside the join, like latest three reviews per product."`,
      mistakes: [
        'Using the model name (`User`) in `from` instead of the collection name (`users`).',
        'Running `$lookup` before `$match`/`$limit`, so it joins the whole collection.',
        'Forgetting that `$unwind` drops documents with empty arrays and losing rows silently.',
        'Follow-up trap: "Can `$lookup` join a sharded collection?" Historically the `from` collection had to be unsharded; newer versions (5.1+) allow sharded `from` collections. Mention that it depends on the version.',
      ],
      takeaway: '`$lookup` joins into an array, `$unwind` flattens arrays into documents; index the foreign field and filter before joining.',
    },
    {
      id: 'aggregation-facet',
      title: 'Aggregation: $facet (Results + Counts in One Query)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: '$facet runs several sub-pipelines on the same input, e.g. one page of results, the total count and filter counts in one call.',
      what: `\`$facet\` lets you run **several pipelines in parallel on the same set of documents** and returns one document with one array per pipeline.

The classic use: a search page needs
- the current page of results,
- the total number of matches (for "Page 2 of 40"),
- counts for sidebar filters ("React (120), Node (85)").

With \`$facet\` you get all three in one round trip.

#### Deeper version
Sub-pipelines inside \`$facet\` **cannot use indexes** — they work on the documents that reached \`$facet\`. So put a selective \`$match\` **before** \`$facet\` (that part can use an index).

The output of \`$facet\` is **one document**, so it must stay under the **16 MB** limit. Never put a huge unlimited result list inside a facet. Also, counting all matches can be expensive on large collections; for big data, consider showing "1,000+" or using Atlas Search facets, which are built for this.`,
      why: `Without \`$facet\` you would send 3 queries: \`find\` for the page, \`countDocuments\` for the total, and an aggregation for filter counts. \`$facet\` keeps them consistent (same filter) and saves round trips.`,
      analogy: `You hand one basket of fruit to three helpers at the same time. One picks the 10 best apples to show, one counts all the fruit, and one counts fruit by color. You get one report with three sections.`,
      code: [
        {
          title: 'Search page: results, total and skill counts',
          lang: 'javascript',
          code: `const page = 2, size = 20;

const [res] = await Candidate.aggregate([
  { $match: { tenantId: tenantObjectId, status: 'active' } }, // uses an index
  { $facet: {
      results: [
        { $sort: { updatedAt: -1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
        { $project: { name: 1, skills: 1, city: 1 } },
      ],
      total: [{ $count: 'value' }],
      bySkill: [
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ],
  } },
]);

const total = res.total[0]?.value ?? 0; // $count returns [] when there are no matches
console.log(res.results.length, total, res.bySkill);`,
        },
      ],
      output: `The \`$match\` runs once using an index. Then \`$facet\` sends those same documents into three pipelines:
- \`results\` holds page 2 (documents 21-40) sorted by last update,
- \`total\` holds \`[{ value: 812 }]\`, or an empty array if nothing matched — that is why we use \`?.\` and \`?? 0\`,
- \`bySkill\` holds the top 10 skills with counts, like \`{ _id: 'react', count: 340 }\`.

All of it comes back as one document in one round trip.`,
      questions: [
        { q: 'What is `$facet` used for?', a: 'Running multiple aggregations on the same input in one query, like paginated results plus a total count plus filter counts.' },
        { q: 'Can stages inside `$facet` use indexes?', a: 'No. Only the stages before `$facet` can. Put a selective `$match` before it.' },
        { q: 'What is a risk of `$facet`?', a: 'Its output is a single document, so it must be under 16 MB. Always limit the lists inside it.' },
      ],
      spoken: `"\`$facet\` runs several sub-pipelines on the same input and returns one document with an array per sub-pipeline. I use it for search pages: one facet returns the current page, one returns the total count, and one returns counts per filter, like per skill. It saves round trips and keeps all three consistent. The things to watch are that the sub-pipelines cannot use indexes, so I put a selective \`$match\` before the facet, and the whole output is one document, so it must stay under 16 MB."`,
      mistakes: [
        'Putting the `$match` inside each facet instead of before `$facet`, so no index is used.',
        'Returning an unlimited list inside a facet and hitting the 16 MB document limit.',
        'Reading `res.total[0].value` without a check; when nothing matches, the array is empty and the code crashes.',
        'Follow-up trap: "Is counting all matches always a good idea?" On millions of documents it is slow. Many products show an estimate or cap ("1,000+"), or use Atlas Search facets.',
      ],
      takeaway: '`$facet` = many reports from one filtered input in one round trip; match first, limit everything inside.',
    },
    {
      id: 'text-search',
      title: 'Text Search with $text (and $regex)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: '$text uses a text index to find words with stemming and relevance scores; $regex matches patterns but is slow unless anchored.',
      what: `MongoDB has two built-in ways to search text:

- **\`$regex\`** — pattern matching, like \`/^rea/i\`. Simple and flexible, but usually slow.
- **\`$text\`** — word search using a **text index**. It splits text into words, ignores common words ("the", "and"), and uses **stemming** ("running" matches "run"). It gives each result a **relevance score**.

#### Deeper version
**\`$text\` rules:**
- Needs a text index; only **one** text index per collection.
- Words in the search string are **OR**ed: \`'react node'\` means react OR node.
- \`"exact phrase"\` in quotes requires that phrase; \`-word\` excludes a word.
- Sort by relevance with \`{ score: { $meta: 'textScore' } }\`.
- In an aggregation, a \`$match\` with \`$text\` must be the **first stage**.
- Only one \`$text\` per query, it cannot be inside \`$nor\`, and inside \`$or\` every branch must be indexed.
- No fuzzy matching (typos) and no "starts with" (prefix) search.

**\`$regex\` rules:** only a **case-sensitive prefix regex** like \`/^rea/\` can use a normal index efficiently. \`/react/i\` (not anchored, or case-insensitive) must check every index key or document.

For real search features (typos, autocomplete, facets, highlighting) on Atlas, use **Atlas Search** (\`$search\`, based on Lucene).`,
      why: `Search boxes are everywhere. Knowing when \`$regex\` is fine, when \`$text\` is better, and when to move to Atlas Search avoids slow pages and angry users.`,
      analogy: `\`$regex\` is reading every page looking for letters in a pattern. \`$text\` is using the book's word index, which also knows "ran" and "running" are the same word. Atlas Search is hiring a librarian who also understands typos and can tell you how many books match each topic.`,
      code: [
        {
          title: '$text with relevance score',
          lang: 'javascript',
          code: `db.jobs.createIndex({ title: 'text', description: 'text' }, { weights: { title: 5 } });

// react OR node, must contain the phrase "full stack", exclude angular
db.jobs.find(
  { $text: { $search: 'react node "full stack" -angular' }, tenantId: t },
  { score: { $meta: 'textScore' }, title: 1 }
).sort({ score: { $meta: 'textScore' } }).limit(10);

// In aggregation, $text must be in the FIRST $match
db.jobs.aggregate([
  { $match: { $text: { $search: 'react' } } },
  { $group: { _id: '$city', count: { $sum: 1 } } },
]);`,
        },
        {
          title: '$regex: escape user input, prefer anchored patterns',
          lang: 'javascript',
          code: `// Escape special characters so user input cannot break or abuse the regex
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

const term = escapeRegex('c++');            // "c\\+\\+"

// Slow: contains, case-insensitive -> scans every key/doc
await Job.find({ title: { $regex: term, $options: 'i' } });

// Faster: anchored prefix on a lowercased, indexed field
// schema: titleLower: { type: String, index: true }
await Job.find({ titleLower: { $regex: '^' + term.toLowerCase() } });`,
        },
      ],
      output: `The \`$text\` query finds jobs containing react or node, which also contain the exact phrase "full stack", and none containing angular. Each result gets a \`score\`; titles count 5 times more than descriptions, and we sort by that score.

In the regex example, \`escapeRegex('c++')\` turns the pluses into literal characters, so the user's input is treated as text, not as regex syntax. The first query must scan everything; the anchored, case-sensitive prefix query on a lowercased indexed field can use the index as a range.`,
      questions: [
        { q: 'What is the difference between `$text` and `$regex`?', a: '`$text` uses a text index with word splitting, stemming and relevance scores, but no partial words. `$regex` matches any pattern, but is slow unless it is a case-sensitive prefix like `/^abc/`.' },
        { q: 'How do multiple words behave in `$text`?', a: 'They are ORed. Use quotes for an exact phrase and a minus sign to exclude a word.' },
        { q: 'Why escape user input in `$regex`?', a: 'Characters like `.` `*` `(` change the meaning, can throw errors, and some patterns can be very slow (ReDoS). Escape them so the input is literal.' },
        { q: 'When would you move to Atlas Search?', a: 'When you need typo tolerance, autocomplete, facets, highlighting, synonyms or better relevance. `$text` cannot do these.' },
      ],
      spoken: `"MongoDB gives me \`$regex\` and \`$text\` for search. \`$regex\` is flexible but only an anchored, case-sensitive prefix can use an index well, so a contains search with the i flag scans everything; I also always escape user input. \`$text\` uses a text index, with stemming, stop words and a relevance score; multiple words are ORed, quotes force a phrase, and minus excludes a word. Its limits are one text index per collection, no partial words and no typo tolerance. When the product needs autocomplete, fuzzy matching or facets, I use Atlas Search with \`$search\`."`,
      mistakes: [
        'Assuming `$text` does AND between words. It does OR by default; you need phrases or a different design (see Boolean search).',
        'Expecting `$text` to match partial words like "reac" for "react". It matches whole (stemmed) words only.',
        'Passing raw user input into `$regex` (errors, ReDoS risk, and unexpected matches).',
        'Follow-up trap: "Can you combine `$text` with `$nor` or use two `$text` in one query?" No. One `$text` per query, never inside `$nor`, and in an aggregation it must be in the first stage.',
      ],
      takeaway: '`$regex` for simple anchored patterns, `$text` for word search with scores, Atlas Search for real search features.',
    },
    {
      id: 'populate',
      title: 'Mongoose populate()',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'populate() replaces stored ObjectId references with the real documents by running an extra query with $in behind the scenes.',
      what: `When a schema field has \`ref: 'User'\`, it stores only the user's \`_id\`. Calling \`.populate('author')\` tells Mongoose to **fetch the referenced documents** and put them in place of the ids.

It is not a database join. Mongoose runs **one extra query per populated path**, using \`$in\` with all the collected ids, then stitches the results together in Node.

#### Deeper version
- You can select fields: \`populate('author', 'name avatar')\`.
- Nested populate: \`populate({ path: 'comments', populate: { path: 'author' } })\`.
- You can add \`match\`, \`options: { sort, limit }\`, and \`perDocumentLimit\` (because a plain \`limit\` applies to the whole query, not per document).
- **Virtual populate** lets the parent show children when only the child stores the reference (e.g. \`product.reviews\` where each review has \`productId\`).
- If a referenced document was deleted, the field becomes \`null\` (or is removed from arrays).

Compare with \`$lookup\`: populate is easy and works across databases/connections, but it is several round trips and filtering on populated fields is not possible in the main query. \`$lookup\` is one round trip and lets you filter or sort by joined fields.`,
      why: `Referencing keeps data clean, but screens need the related data. \`populate\` gives you the related documents with one line of code and still avoids the N+1 problem, because it batches ids with \`$in\`.`,
      analogy: `Your document has ticket numbers ("user #42"). populate is a helper who collects all the ticket numbers on the page, goes to the counter once, gets all the matching items, and puts each item in place of its ticket.`,
      code: [
        {
          title: 'Basic and nested populate',
          lang: 'javascript',
          code: `const postSchema = new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});
const Post = mongoose.model('Post', postSchema);

const posts = await Post.find({ published: true })
  .limit(20)
  .populate('author', 'name avatar')          // only these fields
  .populate({
    path: 'comments',
    select: 'text author',
    options: { sort: { createdAt: -1 } },
    perDocumentLimit: 3,                        // 3 comments PER post
    populate: { path: 'author', select: 'name' }, // nested
  })
  .lean();

// Queries sent: posts (1), users for authors (1), comments (1), users for comment authors (1)`,
        },
        {
          title: 'Virtual populate (child stores the reference)',
          lang: 'javascript',
          code: `const productSchema = new mongoose.Schema({ name: String });

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId',
});

const p = await Product.findById(id).populate({
  path: 'reviews',
  options: { sort: { createdAt: -1 }, limit: 5 },
});
console.log(p.reviews.length); // up to 5
// To include virtuals in JSON: new Schema({...}, { toJSON: { virtuals: true } })`,
        },
      ],
      output: `For 20 posts, Mongoose does not run 20 author queries. It collects all author ids and runs **one** \`users.find({ _id: { $in: [...] } })\`, and does the same for comments and their authors. So the page costs about 4 queries no matter how many posts there are. Each post's \`author\` becomes an object like \`{ _id, name, avatar }\`.

In the virtual example, the product has no \`reviews\` field in the database. Mongoose finds reviews where \`productId\` equals the product's \`_id\` and attaches up to 5 of them.`,
      questions: [
        { q: 'How does populate work internally?', a: 'It runs the main query, collects the referenced ids, runs one more query per path with `$in`, and merges the results in Node. It is not a server-side join.' },
        { q: 'populate vs $lookup?', a: 'populate is simpler and works with models and across connections, but needs extra round trips and cannot filter the parent by child fields. `$lookup` is one round trip and can filter and sort on joined data.' },
        { q: 'What is virtual populate?', a: 'A virtual field that populates documents which reference the parent (child has the foreign key), without storing an array of ids on the parent.' },
        { q: 'Why use `perDocumentLimit`?', a: 'A normal `limit` in populate applies to the whole extra query, so some parents may get no children. `perDocumentLimit` limits per parent.' },
      ],
      spoken: `"populate replaces ObjectId references with the actual documents. Under the hood it is not a join: Mongoose runs the main query, collects all referenced ids, and runs one extra query per path using \`$in\`, so it avoids N+1. I always select only the fields I need, and I use nested populate or virtual populate when the child holds the reference. The trade-off with \`$lookup\` is that populate costs extra round trips and I cannot filter parents by a populated field. When I need that, or for reports, I use an aggregation with \`$lookup\` instead."`,
      mistakes: [
        'Populating whole documents (passwords and all) instead of selecting fields.',
        'Trying to filter the main query by a populated field (`find({ "author.name": "Asha" })`). That field does not exist in the posts collection; use `$lookup` or query users first.',
        'Using `options.limit` and expecting a per-parent limit; use `perDocumentLimit`.',
        'Follow-up trap: "Does populate cause N+1?" Not for a single `find` — it batches with `$in`. But calling `populate` inside a loop over documents does.',
      ],
      takeaway: 'populate is a convenient, batched `$in` query — great for simple references; use `$lookup` when you need to filter or sort by joined data.',
    },
    {
      id: 'lean-queries',
      title: 'Mongoose lean()',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'lean() returns plain JavaScript objects instead of full Mongoose documents — faster and lighter, but without save(), getters or virtuals.',
      what: `By default, a Mongoose query returns **Mongoose documents**: objects with change tracking, getters/setters, virtuals and methods like \`save()\`.

\`.lean()\` returns **plain JavaScript objects** (POJOs) straight from the driver. They are much lighter and faster to create.

#### Deeper version
What you **lose** with \`lean()\`:
- \`save()\`, \`populate()\` on the result, and instance methods.
- **Virtuals**, **getters** and **defaults** are not applied (plugins like \`mongoose-lean-virtuals\` can add virtuals back).
- Change tracking.

What still works: the query filter is still cast, query middleware (\`pre('find')\`) still runs, and \`.populate()\` **in the same query** still works.

Rule of thumb: use \`lean()\` for **read-only** responses (APIs that return JSON). Use full documents when you will modify and \`save()\` them, or need virtuals/getters.`,
      why: `Building full Mongoose documents costs CPU and memory. For a list endpoint returning 500 rows, \`lean()\` can be several times faster and use much less memory, which matters on busy APIs and in serverless functions.`,
      analogy: `A full Mongoose document is a rental car with GPS, insurance and a support phone line. \`lean()\` gives you just the car keys. If you only need to drive across town (read and return JSON), you do not need the extras.`,
      code: [
        {
          title: 'Read-only API with lean',
          lang: 'javascript',
          code: `app.get('/api/products', async (req, res) => {
  const products = await Product.find({ tenantId: req.tenantId, active: true })
    .select('name priceCents stock')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();                                   // plain objects

  console.log(products[0] instanceof mongoose.Document); // false
  res.json(products);
});`,
        },
        {
          title: 'When NOT to use lean',
          lang: 'javascript',
          code: `// Need to modify and save -> full document
const user = await User.findById(id);        // no lean
user.name = 'Asha R';
await user.save();                           // runs validators + save hooks

// lean result has no save() and no virtuals
const plain = await User.findById(id).lean();
console.log(typeof plain.save);  // "undefined"
console.log(plain.fullName);     // undefined (virtual not applied)

// With lean, update with a query instead
await User.updateOne({ _id: id }, { $set: { name: 'Asha R' } });`,
        },
      ],
      output: `The products endpoint gets plain objects, so they are not \`mongoose.Document\` instances and \`res.json\` has less work to do. For large lists this saves noticeable CPU and memory.

In the second example, the full document can be changed and saved, and save hooks and validation run. The lean version has no \`save\` method and the \`fullName\` virtual is \`undefined\`, so we update it with \`updateOne\` instead.`,
      questions: [
        { q: 'What does `lean()` do?', a: 'Returns plain JavaScript objects instead of hydrated Mongoose documents, skipping change tracking, getters, virtuals and methods. It is faster and uses less memory.' },
        { q: 'When should you not use `lean()`?', a: 'When you need to call `save()`, rely on virtuals/getters/defaults, or use document methods and document middleware.' },
        { q: 'Does populate work with lean?', a: 'Yes, `.populate().lean()` works; the populated documents are also plain objects.' },
      ],
      spoken: `"lean returns plain JavaScript objects instead of full Mongoose documents. Full documents have change tracking, getters, virtuals and methods like save, which costs CPU and memory. For read-only endpoints, which is most of my list and detail APIs, I add lean and select only the fields I need, and it is noticeably faster. I do not use lean when I need to modify and save the document, or when the response depends on virtuals or getters. In that case I either load a full document or update directly with updateOne."`,
      mistakes: [
        'Using `lean()` and then calling `doc.save()` — it does not exist.',
        'Returning lean results to the client and expecting virtual fields like `id` or `fullName` to be there.',
        'Expecting schema defaults to fill missing fields on lean results; old documents without the field stay without it.',
        'Follow-up trap: "Is lean always faster?" For reads, yes in practice. But if you then manually recreate what Mongoose did (virtuals, casting), you lose the benefit — pick the right tool per endpoint.',
      ],
      takeaway: 'Use `lean()` for read-only responses; use full documents only when you need save, virtuals or getters.',
    },
    {
      id: 'n-plus-one',
      title: 'The N+1 Query Problem',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Running 1 query for a list and then 1 more query per item — fix it by batching with $in, populate, or $lookup.',
      what: `The **N+1 problem** happens when you run **1** query to get a list of N items, and then **N** more queries, one for each item, to get related data.

Example: load 50 posts (1 query), then for each post load its author (50 queries) = 51 queries. Each query has network latency, so the page gets slow as the list grows.

#### Deeper version
Fixes, from simplest to most powerful:
1. **Batch with \`$in\`:** collect all ids, run one query, build a map in memory.
2. **Mongoose \`populate()\`:** does the same \`$in\` batching for you.
3. **\`$lookup\`** in an aggregation: one round trip, server-side join.
4. **Model change:** embed or duplicate the few fields you always need (like \`authorName\`), so no second query at all.

In GraphQL APIs, N+1 is very common because each field resolver runs per item; the standard fix is a **DataLoader**, which batches all ids requested in one tick into a single \`$in\` query.`,
      why: `N+1 is invisible in development (5 rows, local DB) and terrible in production (500 rows, 5 ms network each = 2.5 seconds). It is one of the most common real performance bugs in Node + Mongo apps.`,
      analogy: `You need 50 books from the library. N+1 is driving to the library 50 times, one book per trip. Batching is giving the librarian the full list once and coming back with one big bag.`,
      code: [
        {
          title: 'The bug and the $in fix',
          lang: 'javascript',
          code: `// BAD: 1 + N queries
const posts = await Post.find().limit(50).lean();
for (const post of posts) {
  post.author = await User.findById(post.authorId).select('name').lean(); // 50 queries!
}

// GOOD: 2 queries total
const posts2 = await Post.find().limit(50).lean();
const ids = [...new Set(posts2.map((p) => p.authorId.toString()))];
const users = await User.find({ _id: { $in: ids } }).select('name').lean();
const byId = new Map(users.map((u) => [u._id.toString(), u]));
for (const p of posts2) p.author = byId.get(p.authorId.toString()) ?? null;`,
        },
        {
          title: 'DataLoader for GraphQL resolvers',
          lang: 'javascript',
          code: `import DataLoader from 'dataloader';

// Create one loader PER REQUEST (so caches do not leak between users)
export const makeLoaders = () => ({
  user: new DataLoader(async (ids) => {
    const users = await User.find({ _id: { $in: ids } }).lean();
    const map = new Map(users.map((u) => [u._id.toString(), u]));
    return ids.map((id) => map.get(id.toString()) ?? null); // same order as ids
  }),
});

// Resolver: called once per post, but batched into ONE query
const resolvers = {
  Post: { author: (post, _args, ctx) => ctx.loaders.user.load(post.authorId) },
};`,
        },
      ],
      output: `The bad version sends 51 queries. If each takes 5 ms over the network, that is about 255 ms just waiting, and it grows with the list size.

The good version sends exactly 2 queries no matter how many posts: one for posts and one \`$in\` query for all unique author ids. A \`Map\` lets us attach each author in O(1).

DataLoader collects every \`load(id)\` call made in the same tick and calls the batch function once with all ids. It must return results in the **same order** as the ids, which is why we map over \`ids\`.`,
      questions: [
        { q: 'What is the N+1 problem?', a: 'One query for a list, then one extra query per item for related data. It turns 1 page load into N+1 database round trips.' },
        { q: 'How do you fix N+1 in MongoDB?', a: 'Batch ids with `$in`, use Mongoose `populate` (which batches), use `$lookup`, or embed/duplicate the needed fields.' },
        { q: 'How do you detect N+1?', a: 'Turn on Mongoose debug (`mongoose.set("debug", true)`) or APM tracing and look for many similar queries in one request.' },
        { q: 'Why create a DataLoader per request?', a: 'Its cache is per instance. Sharing one across requests can serve stale data or leak one user\'s data to another.' },
      ],
      spoken: `"N+1 is when I fetch a list with one query and then run another query for each item, like loading 50 posts and then each author separately. It's fast locally but slow in production because every query pays network latency. I fix it by collecting the ids and running one \`$in\` query, then mapping results back, or by using populate, which does that batching for me, or \`$lookup\` for a single round trip. In GraphQL I use DataLoader, created per request. Sometimes the best fix is modeling: duplicating a small field like the author's name."`,
      mistakes: [
        'Awaiting a query inside a `for` loop or `map` over results.',
        'Using `Promise.all` over N queries and thinking N+1 is fixed. It is faster, but it still sends N queries and can overload the connection pool.',
        'Returning DataLoader results in a different order than the input keys.',
        'Follow-up trap: "Can populate cause N+1?" Not within one query, but calling `doc.populate()` for each document in a loop does.',
      ],
      takeaway: 'Never query inside a loop — batch ids with `$in` (or populate / `$lookup` / DataLoader).',
    },
    {
      id: 'pagination',
      title: 'Pagination: skip/limit vs Cursor (Keyset)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'skip/limit is simple but gets slower on deep pages; cursor pagination continues from the last seen value and stays fast.',
      what: `Two common ways to page through data:

- **Offset (skip/limit):** \`find().sort(...).skip(40).limit(20)\` gives page 3. Easy, supports "jump to page 7".
- **Cursor / keyset:** remember the last item you showed, then ask for "items after this one": \`find({ createdAt: { $lt: lastCreatedAt } }).limit(20)\`. Used for infinite scroll and APIs.

#### Deeper version
**Why skip is slow:** \`skip(100000)\` still walks 100,000 index entries (or documents) and throws them away. The deeper the page, the slower the query.

**Why skip can be wrong:** if a new item is inserted while the user is paging, everything shifts by one, so users see duplicates or miss items.

**Cursor pagination needs a unique, stable sort.** Sorting only by \`createdAt\` can break when two items have the same time. Use a **tie-breaker**: sort by \`{ createdAt: -1, _id: -1 }\` and filter with:
\`{ $or: [ { createdAt: { $lt: c } }, { createdAt: c, _id: { $lt: id } } ] }\`
Back it with an index on \`{ tenantId: 1, createdAt: -1, _id: -1 }\`.

The cursor is usually sent to the client as an opaque **base64 string** of the last values. Trade-off: no "jump to page 50", only next/previous.`,
      why: `Feeds, logs, tables of orders and admin lists all need pagination. On big collections, skip-based pages beyond a few thousand rows become a real performance problem, and interviewers often ask how you would fix it.`,
      analogy: `skip/limit is reading a book by counting pages from the start every time: "skip 300 pages, read 10". Cursor pagination is using a bookmark: open where you left off and read the next 10.`,
      code: [
        {
          title: 'Offset pagination (simple)',
          lang: 'javascript',
          code: `const page = Number(req.query.page) || 1;
const size = Math.min(Number(req.query.size) || 20, 100); // cap the page size

const items = await Order.find({ tenantId })
  .sort({ createdAt: -1, _id: -1 })
  .skip((page - 1) * size)          // slow for big page numbers
  .limit(size)
  .lean();`,
        },
        {
          title: 'Cursor pagination with a tie-breaker',
          lang: 'javascript',
          code: `// Index: { tenantId: 1, createdAt: -1, _id: -1 }
const encode = (d) => Buffer.from(JSON.stringify({ c: d.createdAt, id: d._id })).toString('base64url');
const decode = (s) => JSON.parse(Buffer.from(s, 'base64url').toString());

async function listOrders(tenantId, cursor, size = 20) {
  const filter = { tenantId };
  if (cursor) {
    const { c, id } = decode(cursor);
    const createdAt = new Date(c);
    const _id = new mongoose.Types.ObjectId(id);
    filter.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: _id } },   // same time -> use _id as tie-breaker
    ];
  }

  const rows = await Order.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(size + 1)                      // fetch one extra to know if there is more
    .lean();

  const hasMore = rows.length > size;
  const items = hasMore ? rows.slice(0, size) : rows;
  return { items, nextCursor: hasMore ? encode(items[items.length - 1]) : null };
}`,
        },
      ],
      output: `The offset version is fine for small tables, but on page 5,000 MongoDB walks 100,000 entries before returning 20.

The cursor version starts directly after the last item of the previous page using the index, so page 5,000 is as fast as page 1. Fetching \`size + 1\` rows tells us if there is a next page without a separate count. The \`_id\` tie-breaker makes sure two orders with the same \`createdAt\` are never skipped or duplicated. The client just sends back \`nextCursor\` to get the next page.`,
      questions: [
        { q: 'Why is skip/limit slow on large offsets?', a: 'MongoDB still has to walk and discard all the skipped entries, so the cost grows with the page number.' },
        { q: 'What is cursor (keyset) pagination?', a: 'You remember the sort values of the last item and query for items after them, using an index. Cost stays constant for any page.' },
        { q: 'Why do you need a tie-breaker field?', a: 'If the sort field is not unique (two items with the same createdAt), items can be skipped or repeated. Adding `_id` makes the order unique and stable.' },
        { q: 'What do you lose with cursor pagination?', a: 'Jumping to an arbitrary page number and easy total page counts. You get next/previous only.' },
      ],
      spoken: `"For small admin tables I use skip and limit because it supports page numbers. But skip gets slower the deeper you go, since MongoDB still walks the skipped entries, and inserts during paging can cause duplicates. For feeds and big lists I use cursor pagination: I sort by createdAt and \`_id\`, send the last item's values as an opaque cursor, and query for items after it with an index on the same fields. I fetch one extra row to know if there's a next page. The \`_id\` tie-breaker is important so items with the same timestamp are never skipped."`,
      mistakes: [
        'Cursor pagination sorted by a non-unique field without a tie-breaker.',
        'No index matching the sort, so even cursor pagination does an in-memory sort.',
        'Running `countDocuments` on every page request for huge collections; it can be the slowest part. Cache it or show an estimate.',
        'Follow-up trap: "Can the client change the sort with cursor pagination?" Each sort needs its own cursor format and its own index; the cursor must encode the values of the active sort fields.',
      ],
      takeaway: 'skip/limit for small, numbered pages; cursor pagination with a unique tie-breaker and a matching index for anything big.',
    },
    {
      id: 'mongoose-middleware',
      title: 'Mongoose Middleware (Hooks)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'pre and post hooks run your code before or after save, validate, find, update and delete operations.',
      what: `**Middleware** (also called **hooks**) are functions Mongoose runs **before** (\`pre\`) or **after** (\`post\`) an operation.

Common uses: hash a password before save, set a slug, add \`tenantId\` to every query, write an audit log after a delete.

There are kinds of middleware, and \`this\` means something different in each:
- **Document middleware** (\`save\`, \`validate\`, \`deleteOne\` with \`{ document: true }\`): \`this\` is the **document**.
- **Query middleware** (\`find\`, \`findOne\`, \`updateOne\`, \`findOneAndUpdate\`, \`deleteMany\`, ...): \`this\` is the **query**.
- **Aggregate middleware** (\`aggregate\`): \`this\` is the aggregation; \`this.pipeline()\` gives the stages.
- **Model middleware** (\`insertMany\`).

#### Deeper version
The big trap: \`updateOne\`, \`findOneAndUpdate\` and \`insertMany\` **do not** run \`save\` hooks. So a \`pre('save')\` that hashes passwords will not run when you update the password with \`findOneAndUpdate\`. Either use \`doc.save()\` for that flow or add a matching query hook that reads \`this.getUpdate()\`.

Use \`async\` functions for hooks; throwing an error stops the operation. Older code uses a \`next\` callback — the exact rules for \`next\` changed across major Mongoose versions, so check the docs for your version. Hooks must be added **before** calling \`mongoose.model()\`.`,
      why: `Hooks keep cross-cutting rules in one place instead of copying them into every route: hashing, timestamps, slugs, soft-delete filters, tenant scoping and audit logs.`,
      analogy: `Middleware is airport security. Every passenger (operation) passes through the check before boarding (pre) and through customs after landing (post), without each passenger having to remember it.`,
      code: [
        {
          title: 'Hash password before save',
          lang: 'javascript',
          code: `import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: false }, // never returned unless asked
});

userSchema.pre('save', async function () {
  // "this" is the document
  if (!this.isModified('password')) return;   // do not re-hash on every save
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model('User', userSchema); // AFTER the hooks`,
        },
        {
          title: 'Query hooks: soft delete filter and timing',
          lang: 'javascript',
          code: `// "this" is the Query. Regex = run for find, findOne, findOneAndUpdate, ...
postSchema.pre(/^find/, function () {
  // Only add the filter if the caller did not ask about isDeleted explicitly
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  this._start = Date.now();
});

postSchema.post(/^find/, function (result) {
  console.log(this.op, 'took', Date.now() - this._start, 'ms');
});

// Hash also when the password is changed through an update query
userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() || {};
  const set = update.$set || {};
  const pwd = set.password ?? update.password;
  if (!pwd) return;
  delete update.password;                                  // move it into $set
  update.$set = { ...set, password: await bcrypt.hash(pwd, 12) };
  this.setUpdate(update);
});`,
        },
      ],
      output: `When you call \`user.save()\` with a new password, the pre-save hook hashes it once. Saving again without changing the password skips the hash because \`isModified('password')\` is false.

The \`/^find/\` hook adds \`isDeleted: { $ne: true }\` to every find-style query, so deleted posts are hidden everywhere unless the query itself filters on \`isDeleted\` (for example an admin "trash" page). The post hook logs how long each query took. The \`findOneAndUpdate\` hook makes sure passwords changed through an update query are hashed too, since save hooks would not run there.`,
      questions: [
        { q: 'What is the difference between document and query middleware?', a: 'In document middleware (`save`, `validate`) `this` is the document. In query middleware (`find`, `updateOne`, ...) `this` is the Query object, and there may be no document loaded.' },
        { q: 'Does `pre("save")` run on `findOneAndUpdate`?', a: 'No. Update queries skip save hooks and (by default) validators. Use `save()` or add a `pre("findOneAndUpdate")` hook.' },
        { q: 'How do you stop an operation from a hook?', a: 'Throw an error (or reject) in an async hook. The operation fails with that error.' },
        { q: 'Why check `isModified` in a pre-save hook?', a: 'So you only transform a field when it actually changed — otherwise you would, for example, hash an already-hashed password again.' },
      ],
      spoken: `"Mongoose middleware are pre and post hooks around operations. In document middleware like save, \`this\` is the document, so I use it to hash passwords, checking \`isModified\` first. In query middleware like find or updateOne, \`this\` is the query, so I use it to add filters like a soft-delete condition or tenant scoping, or to log timings. The classic gotcha is that update queries do not run save hooks, so if passwords can change through findOneAndUpdate, I need a query hook too or I use save. I also make sure hooks are registered before I compile the model."`,
      mistakes: [
        'Registering hooks after `mongoose.model()` is called; they will not apply.',
        'Using an arrow function in a hook, so `this` is not the document or query.',
        'Assuming `pre("save")` covers all writes, including `updateOne`, `insertMany` and bulk writes.',
        'Follow-up trap: "Do hooks run for `Model.collection.insertOne` or `bulkWrite`?" No — native driver calls bypass Mongoose middleware entirely.',
      ],
      takeaway: 'Hooks centralize rules, but know which kind runs for which operation — update queries do not trigger save hooks.',
    },
    {
      id: 'virtuals-plugins',
      title: 'Mongoose Virtuals, Methods, Statics and Plugins',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Virtuals are computed fields not stored in MongoDB; methods/statics add functions; plugins package schema logic for reuse.',
      what: `- **Virtual:** a field you can read (and optionally set) but that is **not saved** in the database. Example: \`fullName\` from \`firstName\` + \`lastName\`.
- **Instance method** (\`schema.methods\`): a function on each document, like \`user.checkPassword()\`.
- **Static** (\`schema.statics\`): a function on the model, like \`User.findByEmail()\`.
- **Plugin:** a function that receives a schema and adds fields, hooks, methods or indexes to it. Use it to share logic across many schemas.

#### Deeper version
Virtuals are **not included in JSON by default**. Turn them on with \`{ toJSON: { virtuals: true }, toObject: { virtuals: true } }\`. You **cannot query or sort** by a virtual, because it does not exist in the database. Virtuals do not appear in \`lean()\` results.

Plugins can be applied per schema with \`schema.plugin(fn, options)\` or globally with \`mongoose.plugin(fn)\` (global plugins must be registered before models are compiled). Popular examples: soft delete, pagination, audit fields, tenant scoping.`,
      why: `They keep business logic close to the data model and stop copy-paste. A tenant-scoping plugin, for example, makes sure every model gets the same \`tenantId\` field, index and query filter.`,
      analogy: `A virtual is a person's age: you do not write it down, you calculate it from the birth date when asked. A plugin is a standard safety kit you bolt onto every car model in the factory, instead of designing it again for each car.`,
      code: [
        {
          title: 'Virtual, method and static',
          lang: 'javascript',
          code: `const userSchema = new mongoose.Schema(
  { firstName: String, lastName: String, email: String },
  { toJSON: { virtuals: true } }               // include virtuals in res.json
);

userSchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName;
});

userSchema.methods.initials = function () {
  return (this.firstName[0] + this.lastName[0]).toUpperCase();
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);
const u = await User.findByEmail('ASHA@x.com');
console.log(u.fullName, u.initials()); // "Asha Rao" "AR"`,
        },
        {
          title: 'A reusable plugin: tenant scoping',
          lang: 'javascript',
          code: `export function tenantPlugin(schema) {
  schema.add({ tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true } });

  // Refuse any find/update/delete without a tenantId in the filter
  const ops = ['find', 'findOne', 'countDocuments', 'updateOne', 'updateMany',
               'findOneAndUpdate', 'deleteOne', 'deleteMany'];
  schema.pre(ops, function () {
    if (!this.getFilter().tenantId) throw new Error('tenantId is required in every query');
  });
}

productSchema.plugin(tenantPlugin);
orderSchema.plugin(tenantPlugin);`,
        },
      ],
      output: `\`u.fullName\` is computed on the fly from the two stored fields, and it appears in \`res.json(u)\` because of \`toJSON: { virtuals: true }\`. \`initials()\` runs on the document, \`findByEmail()\` on the model.

Every schema using \`tenantPlugin\` gets a required, indexed \`tenantId\`, and any listed query without \`tenantId\` in its filter throws an error. This turns "forgot the tenant filter" from a data leak into a loud failure.`,
      questions: [
        { q: 'What is a virtual in Mongoose?', a: 'A computed property that is not stored in MongoDB. It has a getter (and optional setter) and is calculated when you read it.' },
        { q: 'Can you query by a virtual?', a: 'No. It does not exist in the database. Store the value as a real field if you need to filter or sort by it.' },
        { q: 'What is the difference between methods and statics?', a: '`methods` are called on a document (`user.initials()`). `statics` are called on the model (`User.findByEmail()`).' },
        { q: 'What is a Mongoose plugin?', a: 'A function `(schema, options) => {}` that adds fields, hooks, methods or indexes, so you can reuse the same logic across schemas.' },
      ],
      spoken: `"Virtuals are computed fields that are not stored, like fullName from first and last name. They do not show up in JSON unless I enable toJSON virtuals, and I cannot query by them. Methods are functions on documents, statics are functions on the model, like findByEmail. Plugins are functions that take a schema and add things to it, so I can reuse logic. At work I would use a tenant plugin that adds a required tenantId and a query hook that throws if a query is missing the tenant filter, which protects against data leaks between customers."`,
      mistakes: [
        'Expecting virtuals in API responses without `toJSON: { virtuals: true }`, or with `lean()`.',
        'Trying to `find` or `sort` by a virtual field.',
        'Using arrow functions for virtuals or methods — `this` will not be the document.',
        'Follow-up trap: "Global plugin vs schema plugin?" `mongoose.plugin()` applies to every schema compiled after it is registered; register it before defining models.',
      ],
      takeaway: 'Virtuals compute, methods/statics add behavior, plugins share it — but virtuals are not in the DB, so you cannot query them.',
    },
    {
      id: 'schema-validation',
      title: 'Schema Validation with $jsonSchema',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'MongoDB can reject bad documents itself using a $jsonSchema validator on the collection, independent of Mongoose.',
      what: `Mongoose validation only protects writes that go **through Mongoose**. Other services, scripts or the shell can still write anything.

**Schema validation** puts the rules **inside MongoDB**. You attach a \`validator\` to a collection, usually with \`$jsonSchema\`: required fields, types (\`bsonType\`), enums, min/max, patterns.

#### Deeper version
Two options control behavior:
- \`validationLevel\`: \`'strict'\` (default: check all inserts and updates) or \`'moderate'\` (only check updates to documents that are already valid — useful when old data does not match yet).
- \`validationAction\`: \`'error'\` (reject the write, default) or \`'warn'\` (allow it but log a warning).

You add it with \`createCollection\` or later with \`collMod\`. Newer versions return detailed error info explaining which rule failed. \`bypassDocumentValidation\` lets privileged operations skip the check (for migrations).`,
      why: `In a microservice or multi-team setup, many writers touch the same collection. Database-level validation is the last line of defence against bad data, no matter which code wrote it.`,
      analogy: `Mongoose validation is a receptionist checking forms at the front door. \`$jsonSchema\` is a lock on the filing cabinet itself — even someone who used the back door cannot file a bad form.`,
      code: [
        {
          title: 'Create a collection with a validator',
          lang: 'javascript',
          code: `db.createCollection('payments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tenantId', 'amountCents', 'currency', 'status'],
      properties: {
        tenantId: { bsonType: 'objectId' },
        amountCents: { bsonType: ['int', 'long'], minimum: 1 },
        currency: { enum: ['usd', 'inr', 'eur'] },
        status: { enum: ['pending', 'succeeded', 'failed', 'refunded'] },
        stripePaymentIntentId: { bsonType: 'string', pattern: '^pi_' },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
});

db.payments.insertOne({ tenantId: ObjectId(), amountCents: 0, currency: 'usd', status: 'paid' });
// MongoServerError: Document failed validation`,
        },
        {
          title: 'Add validation to an existing collection',
          lang: 'javascript',
          code: `db.runCommand({
  collMod: 'users',
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['email'],
    properties: { email: { bsonType: 'string', pattern: '@' } },
  } },
  validationLevel: 'moderate', // do not block updates to old invalid docs
  validationAction: 'warn',    // log first, switch to 'error' later
});`,
        },
      ],
      output: `The insert fails because \`amountCents\` is 0 (below \`minimum: 1\`) and \`'paid'\` is not in the status enum. The write is rejected with "Document failed validation", even though no Mongoose code was involved.

For the existing \`users\` collection, we start in \`warn\` + \`moderate\` mode: bad writes are logged but allowed and old invalid documents can still be updated. After cleaning the data, switch to \`error\` and \`strict\`.`,
      questions: [
        { q: 'Why use `$jsonSchema` if you already use Mongoose?', a: 'Mongoose only validates writes made through Mongoose. Database validation protects against every writer: other services, scripts, the shell.' },
        { q: 'What are validationLevel and validationAction?', a: 'Level: `strict` checks all writes, `moderate` skips updates to already-invalid docs. Action: `error` rejects, `warn` only logs.' },
        { q: 'How do you add validation to a collection with old bad data?', a: 'Use `collMod` with `moderate` level and `warn` action, fix the data, then switch to `strict` and `error`.' },
      ],
      spoken: `"Mongoose validation only works for writes that go through Mongoose. If other services or scripts write to the same collection, I can add a \`$jsonSchema\` validator on the collection itself, with required fields, BSON types, enums and ranges. MongoDB then rejects bad documents no matter who writes them. For existing collections I roll it out carefully with \`collMod\`, starting with the moderate level and warn action so nothing breaks, cleaning up data, and then switching to strict and error. It's a good safety net for critical data like payments."`,
      mistakes: [
        'Using `type: "number"` and getting surprised by int vs double. In MongoDB use `bsonType` with the exact BSON types (`int`, `long`, `double`, `decimal`).',
        'Turning on strict + error on a collection with old invalid data and breaking production updates.',
        'Keeping Mongoose and `$jsonSchema` rules out of sync; decide which one is the source of truth.',
        'Follow-up trap: "Does validation slow writes?" A little, because each write is checked, but it is usually small compared to index updates.',
      ],
      takeaway: '`$jsonSchema` enforces rules inside MongoDB for every writer — roll it out with moderate/warn first.',
    },
    {
      id: 'atomic-updates-bulk',
      title: 'Atomic Updates, Array Updates and bulkWrite',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Change many fields or array items in one atomic write, and send many writes in one round trip with bulkWrite.',
      what: `MongoDB guarantees that a write to **one document** is **atomic**: all changes in that update happen together or not at all.

Useful tools that build on this:
- **Array operators:** \`$push\` (with \`$each\`, \`$slice\`, \`$sort\`), \`$pull\`, \`$addToSet\`, \`$pop\`.
- **Positional operators:** \`$\` (first matching element), \`$[]\` (all elements), \`$[id]\` with \`arrayFilters\` (elements matching a condition).
- **\`bulkWrite\`:** send many inserts/updates/deletes in **one round trip**.

#### Deeper version
\`bulkWrite\` is **not** a transaction. With \`ordered: true\` (default) it stops at the first error; with \`ordered: false\` it continues and is usually faster, and reports all errors at the end.

**Optimistic concurrency:** to avoid lost updates when two users edit the same document, put a \`version\` number in the filter and \`$inc\` it in the update. If the filter does not match, someone else changed the document first. Mongoose has \`optimisticConcurrency: true\` for \`save()\`.

**Update with aggregation pipeline:** an update can be an array of stages (\`$set\`, \`$unset\`, ...) so a field can be computed from other fields in the same document.`,
      why: `Many bugs come from read-modify-write in Node: lost updates, duplicate array items, race conditions on counters. Using atomic operators keeps data correct under concurrency. \`bulkWrite\` makes imports and syncs (like Stripe webhooks backfills) much faster.`,
      analogy: `An atomic update is a bank teller doing a transfer on one account in one motion — no one sees the balance halfway. \`bulkWrite\` is handing the teller a stack of slips at once instead of queuing again for each slip.`,
      code: [
        {
          title: 'Array updates',
          lang: 'javascript',
          code: `// Keep only the latest 50 notifications
db.users.updateOne({ _id: u }, {
  $push: { notifications: { $each: [{ msg: 'Hi', at: new Date() }], $sort: { at: -1 }, $slice: 50 } },
});

// Remove a tag
db.posts.updateOne({ _id: p }, { $pull: { tags: 'draft' } });

// Update the matched cart item: $ = first array element matched by the filter
db.carts.updateOne({ _id: c, 'items.sku': 'PEN-1' }, { $inc: { 'items.$.qty': 1 } });

// Update ALL items with qty 0 using arrayFilters
db.carts.updateOne(
  { _id: c },
  { $set: { 'items.$[it].status': 'removed' } },
  { arrayFilters: [{ 'it.qty': 0 }] }
);`,
        },
        {
          title: 'bulkWrite and optimistic concurrency',
          lang: 'javascript',
          code: `// Upsert prices from a Stripe sync in one round trip
const ops = prices.map((p) => ({
  updateOne: {
    filter: { stripePriceId: p.id },
    update: { $set: { amountCents: p.unit_amount, active: p.active } },
    upsert: true,
  },
}));
const r = await Price.bulkWrite(ops, { ordered: false });
console.log(r.upsertedCount, r.modifiedCount);

// Optimistic concurrency: only update if nobody changed it since we read it
const res = await Doc.updateOne(
  { _id: id, version: 7 },
  { $set: { body: newBody }, $inc: { version: 1 } }
);
if (res.matchedCount === 0) throw new Error('Conflict: document was changed by someone else');`,
        },
      ],
      output: `\`$push\` with \`$each\`, \`$sort\` and \`$slice\` adds the new notification, sorts newest first and keeps only 50 — in one atomic step, so the array can never grow without limit. \`'items.$.qty'\` increments only the cart item whose SKU matched. \`arrayFilters\` marks every item with \`qty: 0\`.

\`bulkWrite\` sends all price upserts in one request and reports how many were inserted and modified. In the last example, if another user already bumped \`version\` to 8, \`matchedCount\` is 0 and we report a conflict instead of silently overwriting their change.`,
      questions: [
        { q: 'Is a single document update atomic?', a: 'Yes. All changes in one update to one document are applied together, even across nested fields and arrays.' },
        { q: 'What is the difference between `$`, `$[]` and `$[id]`?', a: '`$` updates the first element matched by the query, `$[]` updates all elements, `$[id]` with `arrayFilters` updates only elements matching a condition.' },
        { q: 'Is bulkWrite a transaction?', a: 'No. Each operation is atomic on its own document, but some can succeed while others fail. Use a transaction if you need all-or-nothing.' },
        { q: 'How do you prevent lost updates when two users edit the same document?', a: 'Optimistic concurrency: include a version in the filter and increment it. If no document matched, someone else updated it first.' },
      ],
      spoken: `"MongoDB makes single-document writes atomic, so I try to express changes as one update with operators. For arrays I use \`$push\` with \`$slice\` to cap size, \`$pull\`, \`$addToSet\`, and positional operators — \`$\` for the matched element and \`arrayFilters\` for elements matching a condition. For imports or syncs, like syncing Stripe prices, I use bulkWrite with ordered false to send everything in one round trip, knowing it is not a transaction. And to avoid lost updates when two users edit the same doc, I use a version field in the filter: optimistic concurrency."`,
      mistakes: [
        'Reading a document, changing an array in JS, and saving it back — another request\'s changes can be lost.',
        'Thinking `bulkWrite` rolls back on error.',
        'Using `$` positional with a filter that does not mention the array field; MongoDB cannot know which element to update.',
        'Follow-up trap: "Does Mongoose `__v` give you optimistic locking?" Not fully by default — it only protects some array operations. Enable `optimisticConcurrency: true` on the schema for full version checks on `save()`.',
      ],
      takeaway: 'Express changes as single atomic updates with operators; use bulkWrite for speed and a version field for conflict detection.',
    },
    {
      id: 'nosql-injection-security',
      title: 'NoSQL Injection and MongoDB Security',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Attackers can send objects like { "$gt": "" } instead of strings to change your query; validate and cast input, and lock down the database.',
      what: `**NoSQL injection** happens when user input is put into a query **as an object** instead of a plain value.

Express parses JSON bodies and query strings like \`?password[$ne]=x\` into objects. So this code:
\`User.findOne({ email: req.body.email, password: req.body.password })\`
can receive \`password: { "$ne": null }\` — which means "password is not null" — and log in without the password.

#### Deeper version
Defences, in layers:
1. **Validate input shape** with a schema library (Zod, Joi): \`email\` must be a string. This is the main fix.
2. **Cast** values: \`String(req.body.email)\`. Mongoose casts for schema paths, and its \`sanitizeFilter\` option (or the \`mongoose.trusted()\` helper for intended operators) strips \`$\` operators from user filters — check your Mongoose version's docs for exact behavior.
3. **Never** use \`$where\`, \`$function\` or \`$accumulator\` with user input (they run JavaScript on the server).
4. **Escape** user input before \`$regex\`.
5. **Whitelist** sortable/filterable fields; never pass \`req.query\` straight into \`find()\` or \`sort()\`.
6. **Database security:** authentication on, a least-privilege user per app (readWrite on one DB, not root), TLS, IP allowlists / private networking (VPC peering, private endpoints on Atlas), encryption at rest, secrets in a secret manager, and backups.`,
      why: `This is the MERN version of SQL injection, and many tutorials have this bug. Interviewers ask it to check you know that "no SQL" does not mean "no injection".`,
      analogy: `You ask a guest to write their name on a card. Injection is the guest writing "anyone whose name is not empty" instead of a name — and your receptionist lets everyone in. Validation is the rule "only accept a plain name".`,
      code: [
        {
          title: 'The bug and the fix',
          lang: 'javascript',
          code: `// BAD: body can be { "email": "admin@x.com", "password": { "$ne": null } }
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email, password: req.body.password });
  // ...also bad: passwords should be hashed, never compared in a query
});

// GOOD: validate the shape, query by email only, compare the hash in code
import { z } from 'zod';
const LoginBody = z.object({ email: z.string().email(), password: z.string().min(8).max(200) });

app.post('/login', async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const { email, password } = parsed.data;              // guaranteed strings
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ ok: true });
});`,
        },
        {
          title: 'Safe filters and sorting from query strings',
          lang: 'javascript',
          code: `mongoose.set('sanitizeFilter', true); // strips $-operators that come from user objects

const SORTABLE = new Set(['createdAt', 'price', 'name']);

app.get('/api/products', async (req, res) => {
  const sortField = SORTABLE.has(req.query.sort) ? req.query.sort : 'createdAt';
  const filter = { tenantId: req.user.tenantId };
  if (typeof req.query.category === 'string') filter.category = req.query.category;

  const rows = await Product.find(filter).sort({ [sortField]: -1 }).limit(50).lean();
  res.json(rows);
});

// Least-privilege DB user (mongosh, run by an admin)
// db.createUser({ user: 'api', pwd: passwordPrompt(), roles: [{ role: 'readWrite', db: 'shop' }] })`,
        },
      ],
      output: `In the bad login, \`{ "$ne": null }\` turns the password check into "any password that is not null", so the attacker logs in as admin. In the good version, Zod rejects any non-string, the query uses only the email, and the password is checked with \`bcrypt.compare\` against the stored hash.

In the products route, only known sort fields are allowed, \`category\` is used only if it is a plain string, and \`sanitizeFilter\` adds a safety net. The database user can only read and write the \`shop\` database, so even a bug cannot drop other databases.`,
      questions: [
        { q: 'What is NoSQL injection?', a: 'Sending objects with query operators (like `{ "$ne": null }` or `{ "$gt": "" }`) where the server expects a plain value, so the query logic changes.' },
        { q: 'How do you prevent it in a MERN app?', a: 'Validate input types with Zod/Joi, cast to strings, use Mongoose `sanitizeFilter`, whitelist fields for filters and sorts, escape regex, and never use `$where` with user input.' },
        { q: 'How do you secure a MongoDB deployment?', a: 'Enable auth, use least-privilege users per app, TLS, network restrictions (IP allowlist, private endpoints), encryption at rest, keep secrets out of code, and keep backups.' },
      ],
      spoken: `"NoSQL injection is when the server expects a string but receives an object with operators. For example, a login with password set to \`{ $ne: null }\` would match any user if the code puts the body straight into findOne. I prevent it mainly by validating request shapes with Zod, so fields must be strings, and I never compare passwords in the query — I fetch by email and use bcrypt. I also whitelist sortable and filterable fields, escape regex input, and enable Mongoose's sanitizeFilter. On the database side, I use auth, least-privilege users, TLS and private networking."`,
      mistakes: [
        'Passing `req.query` or `req.body` directly into `find()` or `sort()`.',
        'Thinking Mongoose casting always saves you. It casts schema paths, but operator objects can still slip through in some cases, and `aggregate` is not cast at all.',
        'Connecting the app with an admin/root user.',
        'Follow-up trap: "Is `?email[$gt]=` really parsed into an object?" With Express\'s extended query parser (the `qs` library), yes. Check your Express version\'s default query parser; validating types fixes it either way.',
      ],
      takeaway: 'Validate that values are the types you expect before they reach a query — "no SQL" does not mean "no injection".',
    },
    {
      id: 'connections-pooling',
      title: 'Connections and Connection Pooling in Node',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Create one MongoClient / Mongoose connection per process and reuse it; the driver keeps a pool of sockets for parallel queries.',
      what: `Opening a connection to MongoDB is slow (TCP, TLS, authentication). So the driver keeps a **connection pool**: a set of open connections that queries borrow and return.

The rule: **connect once when the app starts, and reuse that connection everywhere.** Do not connect inside each request.

#### Deeper version
- \`maxPoolSize\` (default 100 in the Node driver) limits connections per client. If all are busy, extra queries **wait** in a queue.
- \`minPoolSize\` keeps some connections warm.
- \`serverSelectionTimeoutMS\` controls how long to wait to find a usable server before failing.
- Each app instance has its own pool, so 20 instances x 100 = up to 2,000 connections on the cluster. Atlas tiers have connection limits.

**Serverless (Lambda, Vercel, Next.js API routes):** cache the client in a **global variable outside the handler**, so warm invocations reuse it. In Next.js dev mode, hot reload re-runs modules, so store the promise on \`globalThis\` to avoid creating a new pool on every reload.

Mongoose **buffers** commands until connected; turning off \`bufferCommands\` makes queries fail fast instead of hanging if the DB is down.`,
      why: `"Too many connections" and random timeouts in serverless apps are a very common production issue. Knowing how pooling works lets you size pools and avoid connection storms.`,
      analogy: `A connection pool is a taxi stand. Instead of buying a new car for every trip (opening a connection), you take a waiting taxi and it comes back to the stand after the ride. If all taxis are out, you wait in line.`,
      code: [
        {
          title: 'Connect once (Express / long-running server)',
          lang: 'javascript',
          code: `import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO_URL, {
  maxPoolSize: 20,                 // per process
  serverSelectionTimeoutMS: 5000,  // fail fast if no server is reachable
});

mongoose.connection.on('disconnected', () => console.warn('Mongo disconnected'));

// Graceful shutdown
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});`,
        },
        {
          title: 'Cached connection for Next.js / serverless',
          lang: 'javascript',
          code: `// lib/db.js
import mongoose from 'mongoose';

const cached = globalThis._mongoose ?? (globalThis._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;               // warm: reuse
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URL, { maxPoolSize: 5 });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;                           // allow a retry next time
    throw err;
  }
  return cached.conn;
}

// In a route handler: await connectDB(); then use your models`,
        },
      ],
      output: `The server connects once at startup and every request reuses up to 20 pooled connections. If MongoDB is unreachable, startup fails in 5 seconds instead of hanging. On shutdown the pool is closed cleanly.

In the serverless version, the first (cold) invocation creates the connection and stores it on \`globalThis\`. Later warm invocations, and hot reloads in dev, reuse it. Concurrent first calls share the same promise, so only one pool is created. A small \`maxPoolSize\` keeps total connections low when many function instances run.`,
      questions: [
        { q: 'Why should you not connect to MongoDB inside every request?', a: 'Opening connections is slow and each one uses memory on the server. You quickly hit connection limits. Connect once and reuse the pool.' },
        { q: 'What happens when the pool is exhausted?', a: 'New operations wait in a queue until a connection is free; if it takes too long they time out. Slow queries holding connections are the usual cause.' },
        { q: 'How do you handle MongoDB connections in serverless functions?', a: 'Cache the client or connection promise in a global outside the handler, keep `maxPoolSize` small, and watch the cluster connection limit.' },
      ],
      spoken: `"The MongoDB driver keeps a connection pool, so I connect once when the process starts and reuse it everywhere, never per request. I tune \`maxPoolSize\` and set a server selection timeout so the app fails fast. The thing to remember is the total: every instance has its own pool, so many instances can hit the cluster's connection limit. In Next.js or Lambda, I cache the connection promise on globalThis outside the handler, so warm invocations and hot reloads reuse it, and I keep the pool small because there can be many concurrent instances."`,
      mistakes: [
        'Calling `mongoose.connect()` in every API route without caching, creating a new pool each time.',
        'Setting a huge `maxPoolSize` on many serverless instances and exhausting the cluster connections.',
        'Not handling the case where the cached connection promise rejected, so every later request reuses a failed promise.',
        'Follow-up trap: "Queries are timing out but the DB CPU is low — why?" Often the pool is exhausted by slow or stuck operations (or long transactions), so new queries wait for a free connection.',
      ],
      takeaway: 'One client per process, reuse the pool, cache it globally in serverless, and size pools with the total instance count in mind.',
    },
    {
      id: 'query-optimization',
      title: 'Query Optimization Checklist',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Find slow queries, read explain(), add the right compound index, fetch less data, and fix the data model if needed.',
      what: `Query optimization is a repeatable process, not magic:

1. **Find** slow queries: profiler, slow query log, Atlas Performance Advisor, APM.
2. **Explain** them: \`explain('executionStats')\` — look for COLLSCAN, a SORT stage, and a bad examined/returned ratio.
3. **Index** for the query: compound index using the **ESR** rule.
4. **Fetch less:** projections (\`select\`), \`limit\`, \`lean()\`, cursor pagination.
5. **Fewer round trips:** avoid N+1, batch with \`$in\`, use \`bulkWrite\`.
6. **Fix the model** when the query shape is fighting the data shape (embed, precompute, bucket).

#### Deeper version
Things that silently kill index use:
- **Type mismatch:** querying a string \`'65f...'\` when the field stores an ObjectId — no match or no index use.
- **Unanchored or case-insensitive \`$regex\`.**
- **Negations** (\`$ne\`, \`$nin\`, \`$not\`) — not selective.
- **\`$where\`** and JavaScript expressions — no index, slow. \`$expr\` can use indexes only in limited cases.
- **Low selectivity:** an index on \`isActive\` (two values) barely helps alone.
- **Big \`$in\` lists** with sort — can turn into many index ranges plus a sort.

Also watch the **working set** (frequently used data + indexes) — if it does not fit in RAM, everything slows down with disk reads. Use \`hint()\` to test a specific index, and remove unused indexes (\`$indexStats\` shows usage).`,
      why: `Interviewers want to hear a calm, structured approach: measure, explain, fix, verify. Random guessing ("add an index on every field") is a red flag.`,
      analogy: `It is like a doctor: first find where it hurts (profiler), take an X-ray (explain), give the right medicine (index or model change), and check again after (explain again).`,
      code: [
        {
          title: 'A real optimization walk-through',
          lang: 'javascript',
          code: `// 1. Slow endpoint: open tickets for a tenant, newest first
const q = { tenantId: t, status: 'open', priority: { $gte: 3 } };

// 2. Explain
db.tickets.find(q).sort({ createdAt: -1 }).limit(20).explain('executionStats');
// COLLSCAN, totalDocsExamined: 812000, nReturned: 20, SORT stage present

// 3. ESR index
db.tickets.createIndex({ tenantId: 1, status: 1, createdAt: -1, priority: 1 });

// 4. Fetch less + verify
db.tickets.find(q, { title: 1, createdAt: 1, priority: 1 })
  .sort({ createdAt: -1 }).limit(20).explain('executionStats');
// IXSCAN, no SORT, totalKeysExamined ~ a few dozen, totalDocsExamined: 20

// Which indexes are actually used?
db.tickets.aggregate([{ $indexStats: {} }]);`,
        },
        {
          title: 'Common silent killers in Mongoose',
          lang: 'javascript',
          code: `// Type mismatch inside aggregate (no casting!) -> matches nothing
await Ticket.aggregate([{ $match: { tenantId: req.params.tenantId } }]);          // BAD
await Ticket.aggregate([{ $match: { tenantId: new mongoose.Types.ObjectId(req.params.tenantId) } }]); // GOOD

// Returning huge documents when the list needs 3 fields
await Ticket.find({ tenantId: t }).lean();                       // BAD
await Ticket.find({ tenantId: t }).select('title status createdAt').limit(50).lean(); // GOOD

// Debug: log every query Mongoose sends
mongoose.set('debug', true);`,
        },
      ],
      output: `Before: MongoDB scanned 812,000 documents and sorted in memory to return 20. After the ESR index and a projection: an index scan, no in-memory sort, and only 20 documents read. The endpoint goes from seconds to milliseconds. \`$indexStats\` shows how often each index is used, so you can drop dead ones.

In the Mongoose examples, the first aggregate returns nothing because a string is compared to ObjectIds. The second list query sends much less data over the network and skips building full documents.`,
      questions: [
        { q: 'A query is slow. How do you approach it?', a: 'Find it (profiler/Atlas), run `explain("executionStats")`, check for COLLSCAN, SORT and examined vs returned, add or fix a compound index with ESR, add projection/limit/lean, then explain again to verify.' },
        { q: 'What can stop MongoDB from using an index?', a: 'Not a prefix of the index, type mismatch, unanchored or case-insensitive regex, negation operators, `$where`, or the planner choosing another plan.' },
        { q: 'What is the working set?', a: 'The data and indexes your app touches often. If it does not fit in RAM, MongoDB reads from disk and gets much slower.' },
        { q: 'How do you find unused indexes?', a: 'Run the `$indexStats` aggregation stage and look for indexes with very low `accesses.ops` over a long period.' },
      ],
      spoken: `"I follow a simple loop: measure, explain, fix, verify. I find slow queries with the profiler or Atlas Performance Advisor, then run explain with executionStats and look for a COLLSCAN, an in-memory SORT, or a big gap between docs examined and returned. Usually the fix is a compound index following ESR. Then I reduce data with projections, limits and lean, remove N+1 patterns, and check for silent killers like a string versus ObjectId mismatch or a case-insensitive regex. If the query still fights the data shape, I change the model, for example precomputing totals."`,
      mistakes: [
        'Adding indexes without checking explain before and after.',
        'Optimizing on a tiny local dataset where every query is fast; test with production-like data volume.',
        'Keeping many unused indexes that slow every write.',
        'Follow-up trap: "Would you use `hint()` in production code?" Rarely. It is great for testing, but it locks the query to one index even when data changes; fix the index or query instead.',
      ],
      takeaway: 'Measure → explain → index (ESR) → fetch less → verify; and watch for type mismatches and regex/negation that silently skip indexes.',
    },
    {
      id: 'transactions',
      title: 'Transactions (Multi-Document ACID)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Transactions make several writes across documents or collections all succeed or all fail, using a session on a replica set.',
      what: `A **transaction** groups several operations so they are **all-or-nothing**. If one fails, all are rolled back. This is **ACID**: Atomic, Consistent, Isolated, Durable.

A single-document update is already atomic. You need a transaction only when **several documents** must change together — like moving money between two wallets, or creating an order and decreasing stock.

#### Deeper version
- Transactions need a **replica set** or **sharded cluster** (a single standalone server cannot do them; a one-node replica set works for local dev).
- You start a **session**, run every operation **with that session**, then commit or abort.
- Use \`session.withTransaction()\` (or Mongoose \`connection.transaction()\`): it **retries** automatically on transient errors like write conflicts.
- Default max runtime is **60 seconds** (\`transactionLifetimeLimitSeconds\`). Keep transactions short.
- Reads inside a transaction see a consistent **snapshot**. If two transactions write the same document, one gets a **WriteConflict** and is retried.
- Transactions cost more (locks, memory, oplog). The MongoDB advice: a good schema (embedding) removes most needs for them.`,
      why: `Some business operations must never be half-done: payments, inventory, ledger entries, account transfers. Without a transaction, a crash between two writes can leave money missing or stock wrong.`,
      analogy: `A transaction is a shopping checkout. Either everything in the cart is paid for and you leave with all of it, or the payment fails and every item goes back on the shelf. You never walk out with half the cart paid.`,
      code: [
        {
          title: 'Wallet transfer with Mongoose',
          lang: 'javascript',
          code: `async function transfer(fromId, toId, amountCents) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Pass { session } to EVERY operation inside
      const from = await Wallet.findOneAndUpdate(
        { _id: fromId, balanceCents: { $gte: amountCents } },
        { $inc: { balanceCents: -amountCents } },
        { session, new: true }
      );
      if (!from) throw new Error('Insufficient funds'); // aborts the transaction

      await Wallet.updateOne({ _id: toId }, { $inc: { balanceCents: amountCents } }, { session });

      await Ledger.create(
        [{ fromId, toId, amountCents, at: new Date() }],
        { session } // create() needs an array when passing options
      );
    });
  } finally {
    await session.endSession();
  }
}`,
        },
        {
          title: 'Native driver with explicit concerns',
          lang: 'javascript',
          code: `const session = client.startSession();
try {
  await session.withTransaction(async () => {
    await orders.insertOne({ sku: 'PEN-1', qty: 1 }, { session });
    const r = await products.updateOne(
      { sku: 'PEN-1', stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { session }
    );
    if (r.modifiedCount === 0) throw new Error('Out of stock');
  }, {
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
  });
} finally {
  await session.endSession();
}`,
        },
      ],
      output: `In the transfer, three writes happen together: debit, credit and a ledger entry. If the sender does not have enough money, the error aborts the transaction and nothing is written. If the server crashes before commit, nothing is visible. If a write conflict happens with another transfer, \`withTransaction\` retries the whole callback.

In the driver example, the order insert and the stock decrement commit together with majority write concern. If stock is 0, the thrown error rolls back the order insert too.`,
      questions: [
        { q: 'When do you need a transaction in MongoDB?', a: 'When several documents or collections must change together atomically. A single-document update is already atomic and does not need one.' },
        { q: 'What are the requirements for transactions?', a: 'A replica set or sharded cluster, a session, and passing that session to every operation inside the transaction.' },
        { q: 'Why use `withTransaction` instead of manual start/commit?', a: 'It handles commit and abort for you and automatically retries on transient errors like write conflicts and unknown commit results.' },
        { q: 'What are the downsides of transactions?', a: 'More overhead and latency, write conflicts under contention, a 60-second default limit, and pressure on cache/oplog. Prefer schema design that keeps related data in one document.' },
      ],
      spoken: `"MongoDB has had multi-document ACID transactions since version 4.0 for replica sets, and 4.2 for sharded clusters. A single-document write is already atomic, so I use transactions only when several documents must change together, like debiting one wallet, crediting another and writing a ledger entry. I start a session, use withTransaction, which retries transient errors, and pass the session to every operation. I keep transactions short because there is a 60-second default limit and they add overhead. If I find myself needing many transactions, I check if embedding would solve it."`,
      mistakes: [
        'Forgetting to pass `{ session }` to one operation — that write happens outside the transaction and is not rolled back.',
        'Doing slow work (HTTP calls to Stripe, sending emails) inside the transaction; it holds resources and may hit the time limit. Do side effects after commit.',
        'Running transactions against a standalone local MongoDB and getting an error; start it as a single-node replica set.',
        'Follow-up trap: "Is the callback in `withTransaction` safe to run twice?" It must be, because it can be retried. Do not do non-idempotent side effects (like charging a card) inside it.',
      ],
      takeaway: 'Use transactions only for true multi-document all-or-nothing work; pass the session everywhere, keep them short, and keep side effects outside.',
    },
    {
      id: 'write-read-concern',
      title: 'Write Concern, Read Concern and Read Preference',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Write concern = how many nodes must confirm a write; read concern = how durable the data you read must be; read preference = which node you read from.',
      what: `In a replica set, data lives on several servers. Three settings decide the trade-off between **speed** and **safety**:

- **Write concern** (\`w\`): how many members must confirm the write before MongoDB says "OK".
  - \`w: 1\` — only the primary confirmed. Fast, but the write can be lost if the primary dies before copying it.
  - \`w: 'majority'\` — most members have it. Safe from rollback.
  - \`j: true\` — written to the on-disk journal. \`wtimeout\` — how long to wait.
- **Read concern**: how "confirmed" the data you read must be.
  - \`local\` (default for most reads) — latest data on that node, may be rolled back later.
  - \`majority\` — only data confirmed by a majority; it will never be rolled back.
  - \`linearizable\` — strongest, for single-document reads on the primary; slow.
  - \`snapshot\` — used in transactions.
- **Read preference**: **which node** to read from: \`primary\` (default), \`primaryPreferred\`, \`secondary\`, \`secondaryPreferred\`, \`nearest\`.

#### Deeper version
The default write concern is \`w: 'majority'\` for most deployments since MongoDB 5.0 (older versions defaulted to \`w: 1\`; some setups with arbiters still differ — check the docs for your version).

Reading from **secondaries** can return **stale data**, because replication is asynchronous (replication lag). So "write on primary, then read from secondary" may not show your own write. Use secondaries for analytics, reports or geo-local reads where a little staleness is fine. For "read your own writes", use **causal consistency** with sessions, or read from the primary.`,
      why: `These settings decide whether a payment can be lost in a failover, and whether a user sees their own update right after saving. Knowing them shows you understand distributed data, not just queries.`,
      analogy: `Write concern is how many witnesses must sign a contract before it counts — one witness is fast, a majority is safe. Read preference is which copy of the contract you look at: the original (primary) or a photocopy in another office (secondary) that may not have the latest page yet.`,
      code: [
        {
          title: 'Setting concerns',
          lang: 'javascript',
          code: `// Connection-string defaults
// mongodb+srv://.../app?w=majority&readPreference=primary

// Critical write: wait for majority, max 5 seconds
await Payment.create([{ amountCents: 1999, status: 'succeeded' }], {
  writeConcern: { w: 'majority', wtimeout: 5000 },
});

// Low-value event log: speed over safety
await db.collection('clickEvents').insertOne(evt, { writeConcern: { w: 1 } });

// Heavy report: read from a secondary to protect the primary
const report = await Order.aggregate(pipeline).read('secondaryPreferred');

// Must never be rolled back
const balance = await Wallet.findById(id).read('primary').readConcern('majority');`,
        },
      ],
      output: `The payment write returns only after a majority of replica set members have it, so it survives a primary failover. If that takes more than 5 seconds, the driver reports a write concern error (the write may still finish later). The click event returns as soon as the primary has it.

The report runs on a secondary if one is available, so it does not slow down the primary — but its numbers may be a few seconds old. The balance read uses majority read concern, so it never shows data that could later be rolled back.`,
      questions: [
        { q: 'What is write concern?', a: 'The number of replica set members that must acknowledge a write before it is considered successful, e.g. `w: 1` or `w: "majority"`, plus optional journaling and a timeout.' },
        { q: 'What can go wrong when reading from secondaries?', a: 'Stale reads because of replication lag. A user may not see the change they just made.' },
        { q: 'What is the difference between read concern and read preference?', a: 'Read preference picks which node to read from. Read concern picks how durable or consistent the returned data must be.' },
        { q: 'Why can a `w: 1` write be lost?', a: 'If the primary crashes before replicating it, a new primary is elected without that write, and the old primary rolls it back when it rejoins.' },
      ],
      spoken: `"Write concern says how many replica set members must confirm a write. With \`w: 1\` only the primary confirms, which is fast but can be rolled back on failover; with majority the write survives failover, and that is the default in recent versions. Read concern says how durable the data I read must be — local or majority, or snapshot in transactions. Read preference says which node to read from. I keep critical reads on the primary, and send heavy reports to secondaries, accepting some staleness because replication is asynchronous."`,
      mistakes: [
        'Sending normal user reads to secondaries for "scaling" and getting bugs where users do not see their own updates.',
        'Thinking a `wtimeout` error means the write was undone. It only means the wait timed out; the write may still replicate.',
        'Using `w: 0` (fire and forget) for anything important — you do not even know if it failed.',
        'Follow-up trap: "Does reading from secondaries scale writes?" No. Every node still applies every write; secondaries only spread read load. To scale writes you shard.',
      ],
      takeaway: 'Write concern = how many confirm, read concern = how confirmed, read preference = where to read; secondaries can be stale.',
    },
    {
      id: 'replication',
      title: 'Replication: Replica Sets and Elections',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'A replica set is a group of MongoDB servers with the same data: one primary takes writes, secondaries copy it, and a new primary is elected if it fails.',
      what: `**Replication** means keeping copies of the same data on several servers.

A **replica set** is a group of \`mongod\` servers (usually 3):
- One **primary**: receives all writes (and reads by default).
- **Secondaries**: copy the primary's changes and can serve reads.
- If the primary goes down, the remaining members hold an **election** and pick a new primary automatically. This is **automatic failover**.

#### Deeper version
**How copying works:** the primary records every change in the **oplog** (operations log, a capped collection). Secondaries tail the oplog and apply the same operations. This is asynchronous, so secondaries can lag.

**Elections:** members send heartbeats every 2 seconds. If the primary is unreachable for \`electionTimeoutMillis\` (10 seconds by default), an eligible secondary calls an election. A candidate needs votes from a **majority** of voting members. That is why you use an **odd number** of members (3, 5): with 3 members, the set survives 1 failure; with 5, it survives 2. Failover usually takes several seconds, during which writes fail; drivers with **retryable writes** (on by default in modern drivers) retry once.

Other member types: **arbiter** (votes but holds no data — discouraged now because it weakens majority writes), **hidden** and **delayed** members (for backups or reports), and **priority** settings to prefer some members as primary.

If the old primary had writes that were not replicated to a majority, they are **rolled back** when it rejoins — which is why \`w: 'majority'\` matters.`,
      why: `Replication gives **high availability** (the app keeps working if one server dies), **data safety** (copies on several machines, often in different zones), and is required for transactions and change streams. Every MongoDB Atlas cluster is a replica set.`,
      analogy: `A replica set is a team with one captain and two vice-captains who copy every instruction the captain gives. If the captain disappears, the team votes, and a vice-captain who has the latest notes becomes the new captain. You need more than half of the team to agree, so there is never two captains.`,
      code: [
        {
          title: 'Start a local 3-member replica set',
          lang: 'bash',
          code: `# Three mongod processes on one machine (dev only)
mongod --replSet rs0 --port 27017 --dbpath ./data/1 &
mongod --replSet rs0 --port 27018 --dbpath ./data/2 &
mongod --replSet rs0 --port 27019 --dbpath ./data/3 &

mongosh --port 27017 --eval '
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017", priority: 2 },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" },
  ],
})'`,
        },
        {
          title: 'Inspect and connect',
          lang: 'javascript',
          code: `// mongosh
rs.status().members.map((m) => ({ name: m.name, state: m.stateStr }));
// [ { name: 'localhost:27017', state: 'PRIMARY' }, ... 'SECONDARY', 'SECONDARY' ]

rs.printSecondaryReplicationInfo(); // shows lag per secondary
rs.stepDown();                      // force an election (for testing failover)

// App: list members + replicaSet name; driver finds the primary itself
// mongodb://localhost:27017,localhost:27018,localhost:27019/app?replicaSet=rs0`,
        },
      ],
      output: `\`rs.initiate\` forms the set. The member on port 27017 has priority 2, so it is preferred as primary; the others become secondaries and start copying its oplog.

\`rs.status()\` shows one PRIMARY and two SECONDARY members. \`rs.stepDown()\` makes the primary step down; within seconds the secondaries elect a new primary. The app's driver, connected with all hosts and the replica set name, discovers the new primary and continues; retryable writes cover one failed write during the switch.`,
      questions: [
        { q: 'What is a replica set?', a: 'A group of mongod servers holding the same data: one primary for writes and secondaries that replicate from it, with automatic failover.' },
        { q: 'How does replication work?', a: 'The primary writes every change to the oplog. Secondaries continuously read the oplog and apply the same operations, asynchronously.' },
        { q: 'Why an odd number of members?', a: 'Elections need a majority of votes. With 3 members you can lose 1; adding a 4th does not let you lose 2, so odd numbers give the best fault tolerance for the cost.' },
        { q: 'What happens during failover?', a: 'Members notice the primary is gone (about 10 seconds by default), hold an election, and promote a secondary. Writes fail briefly; drivers retry, and unreplicated writes on the old primary may be rolled back.' },
      ],
      spoken: `"A replica set is a group of MongoDB servers with the same data, usually three. The primary takes the writes and records them in the oplog; the secondaries tail the oplog and replay it asynchronously. If the primary goes down, the others notice through heartbeats and hold an election; a secondary needs votes from a majority to become primary, which is why we use odd numbers like three or five. Failover takes a few seconds and the driver retries writes. Replication gives us high availability and is required for transactions and change streams."`,
      mistakes: [
        'Thinking replication is a backup. A bad `deleteMany` is replicated to all members in seconds. You still need backups or point-in-time restore.',
        'Saying secondaries are for scaling writes. Every member applies every write.',
        'Using two data centers with 2 + 1 members and expecting the side with 1 member to keep accepting writes if the link breaks; it cannot reach a majority.',
        'Follow-up trap: "What is a rollback?" Writes the old primary accepted but never replicated to a majority are undone when it rejoins. `w: "majority"` avoids losing acknowledged writes this way.',
      ],
      takeaway: 'Replica sets = one primary + copying secondaries + majority elections; it gives availability and safety, not write scaling or backups.',
    },
    {
      id: 'sharding',
      title: 'Sharding and Choosing a Shard Key',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Sharding splits a collection across many replica sets by a shard key, so data and writes scale horizontally.',
      what: `**Sharding** splits one big collection across many servers. Each part is called a **shard** (and each shard is itself a replica set).

Parts of a sharded cluster:
- **Shards**: hold the data.
- **mongos**: a router. Your app connects to it; it sends each query to the right shard(s).
- **Config servers**: store which data lives on which shard.

Data is split by a **shard key** — a field (or fields) present in every document, like \`tenantId\` or \`userId\`.

#### Deeper version
**Ranged vs hashed sharding:**
- **Ranged:** documents with nearby key values stay together. Good for range queries, but a **monotonically increasing** key (like a timestamp or ObjectId) sends all new inserts to one shard — a **hot shard**.
- **Hashed:** the key is hashed, so writes spread evenly. But range queries must ask every shard.

**A good shard key has:** high **cardinality** (many distinct values), low **frequency** (no single value is too common), is **not monotonic**, and matches your most common query filter.

**Targeted vs scatter-gather:** if the query includes the shard key, mongos sends it to one shard (fast). If not, it sends it to **all** shards and merges results (slow).

Data is grouped in **chunks** (key ranges); the **balancer** moves chunks between shards to keep them even. Changing a shard key used to be impossible; newer versions support refining (4.4+) and resharding (5.0+), but it is still heavy work — check the docs for your version.

A compound key like \`{ tenantId: 1, _id: 1 }\` is common for SaaS: queries for one tenant stay on one shard, while big tenants can still be split.`,
      why: `A single replica set has limits: disk size, RAM for the working set, and write throughput on one primary. Sharding is how MongoDB scales beyond one machine. Because the shard key is very hard to change, interviewers ask how you would pick it.`,
      analogy: `Sharding is splitting a huge phone book into volumes A-F, G-M, N-Z on different shelves. The librarian (mongos) knows which volume to open. If you search by surname, you open one volume. If you search by phone number, you must check every volume.`,
      code: [
        {
          title: 'Shard a collection',
          lang: 'javascript',
          code: `// mongosh connected to mongos
sh.enableSharding('saas'); // explicit step in older versions; newer ones may not need it

// Index on the shard key must exist (or the collection must be empty)
db.events.createIndex({ tenantId: 1, _id: 1 });
sh.shardCollection('saas.events', { tenantId: 1, _id: 1 });

// Alternative: hashed key for even write distribution
// sh.shardCollection('saas.logs', { deviceId: 'hashed' });

sh.status();                         // shards, chunks, balancer
db.events.getShardDistribution();    // data per shard`,
        },
        {
          title: 'Targeted vs scatter-gather queries',
          lang: 'javascript',
          code: `// Targeted: includes the shard key prefix -> one shard
db.events.find({ tenantId: t, type: 'login' });

// Scatter-gather: no shard key -> every shard is asked
db.events.find({ type: 'login' });

// explain() on mongos shows how many shards were queried
db.events.find({ tenantId: t }).explain().queryPlanner.winningPlan;`,
        },
      ],
      output: `The events collection is split by \`{ tenantId, _id }\`. All events of one tenant are kept together (so tenant queries hit one shard), and \`_id\` lets a very large tenant be split into multiple chunks. \`sh.status()\` and \`getShardDistribution()\` show how the data is spread.

The first query includes \`tenantId\`, so mongos routes it to one shard. The second has no shard key, so mongos sends it to all shards and merges the results — fine occasionally, slow as a main access pattern.`,
      questions: [
        { q: 'What is sharding?', a: 'Horizontal scaling: one collection is split across several shards (replica sets) by a shard key, and mongos routes queries to the right shard.' },
        { q: 'What makes a good shard key?', a: 'High cardinality, even frequency, not monotonically increasing, and present in most queries so they can be targeted to one shard.' },
        { q: 'Why is `createdAt` or ObjectId a bad ranged shard key?', a: 'They always increase, so every new insert goes to the same last chunk on one shard — a hot spot. Use a hashed key or a compound key.' },
        { q: 'Replication vs sharding?', a: 'Replication copies the same data to several servers for availability. Sharding splits different data across servers for scale. Production sharded clusters use both.' },
      ],
      spoken: `"Sharding is MongoDB's horizontal scaling: a collection is split across several shards by a shard key, each shard is a replica set, mongos routes queries, and config servers store the metadata. The shard key is the big decision. I want high cardinality, even distribution, not monotonically increasing, and present in my main queries so they target one shard instead of scatter-gather. For a multi-tenant SaaS I would consider a compound key like tenantId plus \`_id\`, or hashed if writes must spread evenly. I would shard only when one replica set is not enough, because it adds complexity."`,
      mistakes: [
        'Sharding too early. Vertical scaling, indexes and archiving usually go a long way first.',
        'Picking a low-cardinality key like `country` or `status` — chunks cannot be split and one shard gets too big (jumbo chunks).',
        'Using a monotonic ranged key (timestamp, ObjectId) and creating a hot shard for inserts.',
        'Follow-up trap: "What about unique indexes on a sharded collection?" A unique index must include the shard key as a prefix (except `_id`, whose uniqueness across shards is the app\'s job if you set it yourself).',
      ],
      takeaway: 'Sharding scales by splitting data with a shard key — choose a high-cardinality, non-monotonic key that your main queries include.',
    },
    {
      id: 'change-streams',
      title: 'Change Streams',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Change streams let your app subscribe to inserts, updates and deletes in real time, and resume from where it stopped.',
      what: `A **change stream** is a live feed of changes in MongoDB. Your Node app calls \`watch()\` on a collection (or database, or whole cluster) and gets an **event** every time a document is inserted, updated, replaced or deleted.

It works like an event listener for the database, so you do not need to poll ("anything new?") every few seconds.

#### Deeper version
- Change streams are built on the **oplog**, so they need a **replica set** or sharded cluster.
- Each event has a **resume token** (\`_id\`). Save it; after a crash, call \`watch([], { resumeAfter: token })\` (or \`startAfter\`) to continue without missing events — as long as the oplog still contains that point. If the oplog has rolled past it, you cannot resume and must resync.
- Pass an aggregation **pipeline** to \`watch()\` to filter events (\`$match\` on \`operationType\` or fields) on the server.
- Update events contain only the changed fields (\`updateDescription\`). Use \`fullDocument: 'updateLookup'\` to also get the current full document (it is looked up at read time, so it may include later changes).
- Events are delivered in order; by default only **majority-committed** changes are returned, so you never see events that later roll back.`,
      why: `Real-time features and data sync: live dashboards, notifications, syncing to Elasticsearch / a cache / analytics, invalidating Redis keys, triggering webhooks after a write, or an "outbox" pattern without a message broker.`,
      analogy: `Polling is calling the shop every 5 minutes to ask "has my parcel arrived?". A change stream is the shop texting you the moment it arrives. The resume token is the last message number you read, so after your phone restarts you ask for "everything after message 5,123".`,
      code: [
        {
          title: 'Watch new paid orders and resume after restarts',
          lang: 'javascript',
          code: `const pipeline = [
  { $match: { operationType: { $in: ['insert', 'update'] }, 'fullDocument.status': 'paid' } },
];

async function startWatcher() {
  const saved = await Checkpoint.findById('orders-watcher').lean();

  const stream = Order.watch(pipeline, {
    fullDocument: 'updateLookup',                    // full doc on updates too
    ...(saved?.token ? { resumeAfter: saved.token } : {}),
  });

  stream.on('change', async (event) => {
    await sendReceiptEmail(event.fullDocument);      // should be idempotent
    await Checkpoint.updateOne(
      { _id: 'orders-watcher' },
      { $set: { token: event._id } },                // save the resume token
      { upsert: true }
    );
  });

  stream.on('error', (err) => {
    console.error('change stream error', err);
    setTimeout(startWatcher, 1000);                  // restart and resume
  });
}`,
        },
      ],
      output: `The watcher only receives inserts and updates where the order's status is \`paid\`, because the \`$match\` runs on the server. For each event it sends a receipt and stores the event's resume token.

If the process crashes or deploys, the next start reads the saved token and passes \`resumeAfter\`, so it continues right after the last processed event. Because the token is saved after the email, an event might be processed twice after a crash, so \`sendReceiptEmail\` must be idempotent (for example, check a \`receiptSentAt\` field first).`,
      questions: [
        { q: 'What are change streams?', a: 'A real-time feed of data changes (insert, update, replace, delete) that apps can subscribe to with `watch()`, built on the oplog.' },
        { q: 'What do change streams require?', a: 'A replica set or sharded cluster, because they read from the oplog.' },
        { q: 'How do you avoid missing events after a restart?', a: 'Store the resume token from each processed event and pass it as `resumeAfter` / `startAfter` when you reopen the stream. The oplog must still contain that point.' },
        { q: 'Change streams vs polling?', a: 'Change streams push events as they happen, with ordering and resumability. Polling adds delay and load and can miss intermediate changes.' },
      ],
      spoken: `"Change streams let me subscribe to changes in a collection in real time with \`watch()\`. They are built on the oplog, so they need a replica set. I usually pass a \`$match\` pipeline so the server only sends events I care about, and I use \`fullDocument: 'updateLookup'\` when I need the whole document on updates. The important production detail is the resume token: I save it after processing each event, and on restart I resume from it, so I don't miss changes. Since an event can be processed twice after a crash, the handler has to be idempotent."`,
      mistakes: [
        'Not saving the resume token, so every restart either misses events or starts from "now".',
        'Doing slow work in the handler without a queue; events back up and the oplog may roll past your token.',
        'Assuming `fullDocument` on update events is the state right after that update. With `updateLookup` it is the current state when looked up.',
        'Follow-up trap: "Can you use change streams on a standalone local MongoDB?" No — run a single-node replica set for development.',
      ],
      takeaway: 'Change streams push DB changes in real time; filter on the server, save the resume token, and make handlers idempotent.',
    },
    {
      id: 'multi-tenant-modeling',
      title: 'Multi-Tenant Data Modeling',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Serve many customers from one system: a tenantId on every document with compound indexes, or a database per tenant — each with trade-offs.',
      what: `A **multi-tenant** app (SaaS) serves many customers — **tenants** (companies, workspaces) — from the same code. Each tenant must only ever see its own data.

Three common models:
1. **Shared collections + \`tenantId\` field** on every document. Most common.
2. **Collection per tenant** (\`orders_acme\`, \`orders_globex\`). Rarely a good idea.
3. **Database per tenant** (\`tenant_acme\`, \`tenant_globex\`), or even a cluster per tenant for big customers.

#### Deeper version
**Shared + \`tenantId\`:**
- Every query must include \`tenantId\` — enforce it in one place (a Mongoose plugin or query middleware, a repository layer).
- **\`tenantId\` is the first field of almost every compound index**: \`{ tenantId: 1, status: 1, createdAt: -1 }\`. That keeps each tenant's data together in the index and follows ESR (tenant is an equality).
- Unique rules become per tenant: \`{ tenantId: 1, email: 1 }, { unique: true }\`.
- Scales to many thousands of tenants; easy migrations (one schema). Risk: one bug without the filter leaks data; a huge tenant can be a **noisy neighbour**.
- Shards naturally with a shard key like \`{ tenantId: 1, _id: 1 }\`.

**Database per tenant:**
- Strong isolation, easy per-tenant backup/restore/delete, per-tenant encryption or region.
- But thousands of databases mean thousands of collections and indexes: high memory/file overhead, slow migrations (run each one N times), and connection handling becomes harder (\`useDb\` helps in Mongoose).

**Hybrid:** most tenants in shared collections, very large or regulated (enterprise) tenants on their own database or cluster.`,
      why: `This is a core SaaS design decision that affects security, cost, performance and operations for years. Interviewers ask it to see whether you think about data isolation and scale, not just CRUD.`,
      analogy: `Shared collections with \`tenantId\` is an apartment building: everyone shares the structure, and each flat has a lock (the tenantId filter). Database per tenant is a street of separate houses: more privacy, but every house needs its own roof repair (migrations), plumbing and keys.`,
      code: [
        {
          title: 'Shared model: tenantId first in every index',
          lang: 'javascript',
          code: `const candidateSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: String,
  email: String,
  skills: [String],
  status: { type: String, enum: ['active', 'hired', 'archived'] },
}, { timestamps: true });

// Unique per tenant, not globally
candidateSchema.index({ tenantId: 1, email: 1 }, { unique: true });
// Main list: E (tenantId, status) -> S (updatedAt)
candidateSchema.index({ tenantId: 1, status: 1, updatedAt: -1 });
// Skill search inside a tenant (multikey)
candidateSchema.index({ tenantId: 1, skills: 1 });

// Tenant always comes from the authenticated session, never from the request body
app.get('/api/candidates', auth, async (req, res) => {
  const rows = await Candidate.find({ tenantId: req.user.tenantId, status: 'active' })
    .sort({ updatedAt: -1 }).limit(50).lean();
  res.json(rows);
});`,
        },
        {
          title: 'Database per tenant with Mongoose useDb',
          lang: 'javascript',
          code: `const base = await mongoose.createConnection(process.env.MONGO_URL).asPromise();

function modelsFor(tenantSlug) {
  // useCache: reuse the same db handle; all share ONE connection pool
  const db = base.useDb('tenant_' + tenantSlug, { useCache: true });
  return {
    Candidate: db.models.Candidate || db.model('Candidate', candidateSchema),
  };
}

const { Candidate: AcmeCandidate } = modelsFor('acme');
await AcmeCandidate.find({ status: 'active' }); // reads tenant_acme.candidates`,
        },
      ],
      output: `In the shared model, every candidate has a \`tenantId\`, and every index starts with it, so a tenant's queries scan only that tenant's part of the index. Two tenants can each have a candidate with the same email, because uniqueness is per \`(tenantId, email)\`. The route takes \`tenantId\` from the logged-in user, so a user cannot ask for another tenant's data by changing a parameter.

In the database-per-tenant version, \`useDb\` switches to \`tenant_acme\` while sharing one connection pool. Queries need no tenant filter, because isolation comes from the database itself — but each tenant database has its own collections and indexes to create and migrate.`,
      questions: [
        { q: 'How would you design a multi-tenant schema in MongoDB?', a: 'Usually shared collections with a required `tenantId` on every document, `tenantId` as the first field of compound indexes, per-tenant unique indexes, and tenant filtering enforced centrally. Large or regulated tenants can get their own database.' },
        { q: 'Why put tenantId first in compound indexes?', a: 'Every query filters by tenant with equality, so it is the natural first (E) field. It keeps each tenant\'s entries together and makes every index usable for tenant-scoped queries.' },
        { q: 'When would you choose database per tenant?', a: 'Strong isolation needs, per-tenant backup/restore or deletion, data residency (region), or a few very large tenants. Not for tens of thousands of small tenants because of overhead and migrations.' },
        { q: 'How do you prevent cross-tenant data leaks?', a: 'Take tenantId only from the auth context, enforce it in a plugin/repository/query middleware that throws when missing, include it in unique indexes, and test for it.' },
      ],
      spoken: `"For most SaaS apps I use shared collections with a required tenantId on every document. tenantId is the first field in nearly every compound index, since every query filters on it by equality, and unique constraints become per tenant, like tenantId plus email. I never trust tenantId from the request; it comes from the auth token, and I enforce the filter centrally with a Mongoose plugin that throws if it's missing. Database per tenant gives stronger isolation and easy per-tenant backups, but with thousands of tenants the overhead and migrations hurt, so I'd use it for a few big enterprise tenants in a hybrid model."`,
      mistakes: [
        'Reading `tenantId` from the request body or query string instead of the authenticated user.',
        'Forgetting `tenantId` in an aggregation `$match` or a `$lookup` sub-pipeline — middleware on `find` does not protect `aggregate` unless you add aggregate middleware too.',
        'Global unique indexes (`email` unique) that block the same user from existing in two tenants.',
        'Follow-up trap: "One tenant is 100x bigger and slows everyone down — what now?" Make sure its queries are index-bound, add rate limits, and consider moving it to its own database/cluster or shard by `{ tenantId, _id }` so it can be split.',
      ],
      takeaway: 'Default to shared collections with `tenantId` first in every index and enforced centrally; move only special tenants to their own database.',
    },
    {
      id: 'boolean-search-design',
      title: 'Boolean Search Design (AND / OR / NOT, Nested, Field Filters)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Parse a query like (react AND node) OR (vue NOT angular) into a tree, then turn the tree into a $and / $or / $nor filter (or an Atlas Search compound query).',
      what: `Recruiters and power users love **Boolean search**: \`(react AND node) OR (vue NOT angular)\`, \`title:"full stack" city:pune\`.

You cannot pass that string to MongoDB directly. You build it in three steps:
1. **Tokenize:** split the string into pieces: words, \`"phrases"\`, \`field:value\`, \`(\`, \`)\`, \`AND\`, \`OR\`, \`NOT\`.
2. **Parse** into a tree (an **AST**, Abstract Syntax Tree) with the right **precedence**: \`NOT\` binds tightest, then \`AND\`, then \`OR\`. Two words next to each other mean AND.
3. **Convert** the tree into a MongoDB filter: AND → \`$and\`, OR → \`$or\`, NOT → \`$nor\` (or a field-level \`$not\` / \`$ne\`).

So \`(react AND node) OR (vue NOT angular)\` becomes:
\`{ $or: [ { $and: [ {skills:'react'}, {skills:'node'} ] }, { $and: [ {skills:'vue'}, { $nor: [ {skills:'angular'} ] } ] } ] }\`

#### Deeper version
**Matching strategy per field — the big trade-off:**
- **Exact match on a normalized array** (\`skills: ['react','node']\`, lowercased on save): fastest, uses a multikey index, perfect for tags/skills. Can be simplified: AND of several skills → \`{ skills: { $all: [...] } }\`, NOT → \`{ skills: { $nin: [...] } }\`.
- **\`$regex\`:** supports "contains" on free text, works inside any \`$and/$or/$nor\` nesting, but unanchored/case-insensitive regex cannot use an index efficiently. OK for small, tenant-scoped sets; dangerous on millions of docs. Always escape user input.
- **\`$text\`:** uses a text index with stemming and scores, but it is a poor fit for arbitrary Boolean trees: only one \`$text\` per query, never inside \`$nor\`, its words are ORed, and in \`$or\` every branch must be indexed. Use it only as a coarse first filter.
- **Atlas Search (\`$search\`):** the \`compound\` operator maps 1:1 to Boolean logic — \`must\` (AND), \`should\` + \`minimumShouldMatch: 1\` (OR), \`mustNot\` (NOT), \`filter\` (must match, no scoring). Nested compounds give nested parentheses. Plus fuzzy matching, autocomplete, highlighting and scores. Best choice on Atlas at scale.

**Indexes to support it (native queries):** keep the tenant first: \`{ tenantId: 1, skills: 1 }\`. Each \`$or\` branch is planned separately and can use its own index — but if **any** branch has no usable index, the whole \`$or\` falls back to a collection scan (within the tenant, if you can still use the tenant index). \`$nor\` / \`$nin\` are not selective, so they only filter after the positive parts.

**Safety:** whitelist searchable fields, cap the number of terms and nesting depth, return 400 on syntax errors, escape regex, and **always wrap** the user's tree inside the tenant filter: \`{ tenantId, $and: [userFilter] }\` — never let user \`OR\` logic sit next to the tenant condition.`,
      why: `This is a real-world feature (ATS / job boards / CRMs / admin search) that shows parsing skills, query-building skills, index design and security thinking at once. A naive version (split on spaces, OR everything) gives wrong results; a careless one (raw regex, no tenant wrapper) is slow or leaks data.`,
      analogy: `It is like a calculator. \`2 + 3 x 4\` is not read left to right — multiplication goes first. A Boolean query works the same: NOT is like a minus sign, AND is like multiply, OR is like plus. The parser builds the "math tree" so the database evaluates the right thing.`,
      code: [
        {
          title: 'Step 1-2: tokenizer and recursive-descent parser',
          lang: 'javascript',
          code: `// 1. Tokenizer: words, "quoted phrases", field:value, ( ) AND OR NOT
function tokenize(input) {
  const re = /\\s*(\\(|\\)|[^\\s()"]*"[^"]*"|[^\\s()]+)/g;
  const tokens = [];
  let m;
  while ((m = re.exec(input)) !== null) {
    const raw = m[1];
    const upper = raw.toUpperCase();
    if (raw === '(' || raw === ')') tokens.push({ type: raw });
    else if (upper === 'AND' || upper === 'OR' || upper === 'NOT') tokens.push({ type: upper });
    else tokens.push({ type: 'TERM', value: raw });
  }
  return tokens;
}

// 2. Parser (recursive descent). Precedence: NOT > AND > OR
//    "vue NOT angular" = vue AND (NOT angular)  (implicit AND)
function parse(input, { maxTerms = 30 } = {}) {
  const tokens = tokenize(input);
  let pos = 0;
  let terms = 0;
  const peek = () => tokens[pos];
  const take = (type) => {
    if (peek()?.type !== type) throw new Error('Expected ' + type + ' at token ' + pos);
    return tokens[pos++];
  };

  function parseOr() {
    const children = [parseAnd()];
    while (peek()?.type === 'OR') { pos++; children.push(parseAnd()); }
    return children.length === 1 ? children[0] : { type: 'or', children };
  }
  function parseAnd() {
    const children = [parseNot()];
    while (peek() && peek().type !== 'OR' && peek().type !== ')') {
      if (peek().type === 'AND') pos++;          // explicit AND is optional
      children.push(parseNot());
    }
    return children.length === 1 ? children[0] : { type: 'and', children };
  }
  function parseNot() {
    if (peek()?.type === 'NOT') { pos++; return { type: 'not', child: parseNot() }; }
    return parsePrimary();
  }
  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error('Unexpected end of query');
    if (t.type === '(') { pos++; const node = parseOr(); take(')'); return node; }
    const { value } = take('TERM');
    if (++terms > maxTerms) throw new Error('Too many terms');
    const idx = value.startsWith('"') ? -1 : value.indexOf(':');
    const field = idx > 0 ? value.slice(0, idx) : null;   // "title:react" -> field "title"
    const text = (idx > 0 ? value.slice(idx + 1) : value).replace(/^"|"$/g, '');
    return { type: 'term', field, text };
  }

  const ast = parseOr();
  if (pos < tokens.length) throw new Error('Unexpected token at ' + pos);
  return ast;
}`,
        },
        {
          title: 'Step 3: tree -> MongoDB filter (field whitelist, tenant wrapper)',
          lang: 'javascript',
          code: `const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

// Only these fields may be searched (never let users pick any field)
const FIELDS = {
  skills: (v) => ({ skills: v.toLowerCase() }),                       // array, exact, indexed
  title: (v) => ({ title: { $regex: escapeRegex(v), $options: 'i' } }), // text, contains
  city: (v) => ({ city: v.toLowerCase() }),
};

function toMongo(node) {
  switch (node.type) {
    case 'term': {
      const build = FIELDS[node.field ?? 'skills'];
      if (!build) throw new Error('Unknown field: ' + node.field);
      return build(node.text);
    }
    case 'and': return { $and: node.children.map(toMongo) };
    case 'or': return { $or: node.children.map(toMongo) };
    case 'not': return { $nor: [toMongo(node.child)] };
  }
}

// Express route: user logic is ALWAYS wrapped inside the tenant filter
app.get('/api/candidates/search', async (req, res) => {
  let userFilter;
  try {
    userFilter = toMongo(parse(String(req.query.q ?? '')));
  } catch (err) {
    return res.status(400).json({ error: err.message }); // bad syntax -> 400, not 500
  }
  const filter = { tenantId: req.tenantId, $and: [userFilter] };
  const rows = await Candidate.find(filter).sort({ updatedAt: -1 }).limit(50).lean();
  res.json(rows);
});`,
        },
        {
          title: 'Same tree -> Atlas Search compound query',
          lang: 'javascript',
          code: `// AND -> must, OR -> should (min 1), NOT -> mustNot, tenant -> filter
function toAtlas(node) {
  switch (node.type) {
    case 'term':
      return { text: { query: node.text, path: node.field ?? 'skills' } };
    case 'and':
      return { compound: { must: node.children.map(toAtlas) } };
    case 'or':
      return { compound: { should: node.children.map(toAtlas), minimumShouldMatch: 1 } };
    case 'not':
      // mustNot needs something to subtract from: match all docs that "exist"
      return { compound: { must: [{ exists: { path: 'tenantId' } }], mustNot: [toAtlas(node.child)] } };
  }
}

const results = await Candidate.aggregate([
  { $search: {
      index: 'candidates',
      compound: {
        filter: [{ equals: { path: 'tenantId', value: tenantObjectId } }], // tenant isolation
        must: [toAtlas(parse('(react AND node) OR (vue NOT angular)'))],
      },
  } },
  { $limit: 50 },
  { $project: { name: 1, skills: 1, score: { $meta: 'searchScore' } } },
]);
// Needs an Atlas Search index with tenantId mapped as objectId (for "equals")`,
        },
      ],
      output: `\`parse('(react AND node) OR (vue NOT angular)')\` produces the tree: OR( AND(react, node), AND(vue, NOT(angular)) ). Note that \`vue NOT angular\` has no explicit AND — the parser adds it, because two items next to each other mean AND.

\`toMongo\` turns that tree into:
\`{ $or: [ { $and: [{ skills: 'react' }, { skills: 'node' }] }, { $and: [{ skills: 'vue' }, { $nor: [{ skills: 'angular' }] }] } ] }\`
which matches candidates who know both React and Node, or who know Vue but not Angular.

\`title:"full stack" (react OR vue) NOT city:pune\` becomes an \`$and\` of a safe, escaped title regex, an \`$or\` of two skills, and a \`$nor\` on city. Unknown fields (\`foo:bar\`) and broken syntax (\`(react\`) throw, and the route returns 400. The final filter is \`{ tenantId, $and: [userFilter] }\`, so user ORs can never escape the tenant.

The Atlas version expresses the same tree with \`must\`, \`should\` and \`mustNot\`, keeps the tenant in a non-scoring \`filter\`, and returns a relevance score.`,
      questions: [
        { q: 'How would you implement a Boolean search box on MongoDB?', a: 'Tokenize the input, parse it into an AST with precedence NOT > AND > OR (implicit AND between terms), then recursively map AND to `$and`, OR to `$or`, NOT to `$nor`, with a whitelist of fields and the tenant filter wrapped outside.' },
        { q: 'How do you express NOT in MongoDB?', a: 'For a single field: `$ne`, `$nin` or `{ field: { $not: /x/ } }`. For a whole sub-expression: `{ $nor: [subFilter] }`. There is no top-level `$not`.' },
        { q: 'Why not just use `$text` for Boolean search?', a: '`$text` ORs words, allows only one `$text` per query, cannot be used in `$nor`, and needs every `$or` branch indexed. It cannot represent an arbitrary nested Boolean tree, so use it only as a coarse filter, or use Atlas Search.' },
        { q: 'regex vs $text vs Atlas Search?', a: 'Regex: flexible, nests anywhere, but slow unless anchored. `$text`: indexed word search with stemming but limited Boolean logic. Atlas Search: full Boolean `compound` (must/should/mustNot/filter), fuzzy, autocomplete and scoring — best at scale.' },
        { q: 'Which indexes support it?', a: 'Compound indexes starting with tenantId, like `{ tenantId: 1, skills: 1 }`. Each `$or` branch needs an indexable condition, otherwise the `$or` falls back to scanning. Negations only filter.' },
      ],
      spoken: `"I built this at work. I tokenize the query into words, phrases, field:value pairs, parentheses and operators, then a small recursive-descent parser builds a tree with NOT binding tighter than AND, and AND tighter than OR, with implicit AND between words. Then I walk the tree: AND becomes \`$and\`, OR becomes \`$or\`, NOT becomes \`$nor\`. Fields are whitelisted, regex input is escaped, and the user's filter is always wrapped inside the tenant filter. For skills I match a normalized array with a tenantId-plus-skills index; for free text, regex is fine at small scale, but at scale I map the same tree to Atlas Search's compound must, should and mustNot."`,
      mistakes: [
        'Splitting on spaces and ORing everything — "react node" then means react OR node, which is not what the user typed.',
        'Merging the user filter with the tenant filter at the same level, e.g. `{ tenantId, $or: [...] }` is fine, but building `{ $or: [{ tenantId }, ...userBranches] }` leaks other tenants. Always `{ tenantId, $and: [userFilter] }`.',
        'Passing raw user text into `$regex` — invalid patterns crash the query and evil patterns can be very slow (ReDoS).',
        'No limits on terms or nesting depth; a 500-term query can overload the database.',
        'Follow-up trap: "Does `$nor: [{ skills: "angular" }]` also return docs with no skills field?" Yes — like `$nin`, it matches documents where the field is missing. Add `skills: { $exists: true }` if that matters.',
      ],
      takeaway: 'Tokenize → parse to an AST (NOT > AND > OR) → map to $and/$or/$nor or Atlas compound, with a field whitelist, escaped input, tenant-first indexes and the tenant filter wrapped outside.',
    },
    {
      id: 'atlas-search',
      title: 'Atlas Search ($search) vs $text vs $regex',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Atlas Search is a Lucene-based full-text engine inside MongoDB Atlas with fuzzy matching, autocomplete, facets and Boolean compound queries.',
      what: `**Atlas Search** is a search engine (built on Apache **Lucene**, the same core as Elasticsearch) that runs next to your MongoDB Atlas cluster. You query it with the \`$search\` aggregation stage.

It gives you what real search boxes need:
- **Fuzzy** matching (typos: "recat" finds "react").
- **Autocomplete** (search-as-you-type).
- **Compound** Boolean queries: \`must\`, \`should\`, \`mustNot\`, \`filter\`.
- **Relevance scores**, **highlighting**, **synonyms**, and **facets** (counts per category via \`$searchMeta\`).

#### Deeper version
- You define a **search index** (separate from normal MongoDB indexes) with **mappings**: which fields, which analyzer (how text is split and normalized), and types like \`string\`, \`autocomplete\`, \`token\` (for exact match/filters), \`objectId\`, \`date\`, \`number\`.
- \`$search\` must be the **first stage** of the pipeline.
- The search index is updated **asynchronously** from the oplog, so a just-written document may take a moment to appear (eventual consistency).
- Put exact conditions (tenant, status) in \`compound.filter\` so they do not affect the score.
- Filtering with a normal \`$match\` after \`$search\` works but is slower, because \`$search\` first returns many results; push filters into the search query.
- Atlas Search is an Atlas feature; on self-managed MongoDB the availability and setup differ by version — check the current docs.`,
      why: `\`$regex\` is slow and \`$text\` has no typos, autocomplete or facets. Running a separate Elasticsearch cluster means syncing data and more infrastructure. Atlas Search gives a real search engine without a sync pipeline.`,
      analogy: `\`$regex\` is reading every line with a magnifying glass. \`$text\` is a book index. Atlas Search is a smart librarian who understands typos, finishes your words, and tells you how many books exist in each genre.`,
      code: [
        {
          title: 'Search index definition (JSON in Atlas UI or API)',
          lang: 'json',
          code: `{
  "mappings": {
    "dynamic": false,
    "fields": {
      "tenantId": { "type": "objectId" },
      "status": { "type": "token" },
      "name": [
        { "type": "string" },
        { "type": "autocomplete" }
      ],
      "skills": { "type": "string", "analyzer": "lucene.keyword" },
      "summary": { "type": "string", "analyzer": "lucene.english" }
    }
  }
}`,
        },
        {
          title: 'Fuzzy search + autocomplete + tenant filter',
          lang: 'javascript',
          code: `// Typo-tolerant search in summary, boosted name match, active only
await Candidate.aggregate([
  { $search: {
      index: 'candidates',
      compound: {
        filter: [
          { equals: { path: 'tenantId', value: tenantObjectId } },
          { equals: { path: 'status', value: 'active' } },
        ],
        should: [
          { text: { query: 'recat developer', path: 'summary', fuzzy: { maxEdits: 1 } } },
          { text: { query: 'recat developer', path: 'name', score: { boost: { value: 3 } } } },
        ],
        minimumShouldMatch: 1,
      },
      highlight: { path: 'summary' },
  } },
  { $limit: 20 },
  { $project: { name: 1, score: { $meta: 'searchScore' }, highlights: { $meta: 'searchHighlights' } } },
]);

// Search-as-you-type on name
await Candidate.aggregate([
  { $search: { index: 'candidates', autocomplete: { query: 'ash', path: 'name' } } },
  { $limit: 5 },
  { $project: { name: 1 } },
]);`,
        },
      ],
      output: `The index maps \`tenantId\` and \`status\` for exact filtering, \`name\` both as text and autocomplete, \`skills\` as whole keywords, and \`summary\` with the English analyzer (stemming, stop words).

The first query finds active candidates of this tenant whose summary or name matches "react developer" even though the user typed "recat" (one edit away). Name matches count 3x more. Results include a score and highlighted snippets. The second query returns names starting with "ash", like "Asha" and "Ashwin", as the user types.`,
      questions: [
        { q: 'What is Atlas Search?', a: 'A Lucene-based full-text search engine integrated with MongoDB Atlas, queried with the `$search` aggregation stage, with fuzzy, autocomplete, compound queries, scoring and facets.' },
        { q: 'How is a search index different from a normal index?', a: 'It is a separate Lucene index with analyzers and mappings, updated asynchronously. Normal indexes are B-trees used by the query planner for exact and range queries.' },
        { q: 'Where should exact filters like tenantId go in `$search`?', a: 'In `compound.filter` — it restricts results without affecting the score, and it is faster than a `$match` after `$search`.' },
        { q: 'When is `$regex` or `$text` still fine?', a: 'Small datasets, simple prefix lookups, admin tools, or when you are not on Atlas. For user-facing search at scale, Atlas Search is better.' },
      ],
      spoken: `"Atlas Search is a Lucene engine built into Atlas, used through the \`$search\` stage. Compared to \`$regex\`, which is slow unless anchored, and \`$text\`, which has stemming but no typos or autocomplete, Atlas Search gives fuzzy matching, autocomplete, highlighting, facets and a compound operator with must, should, mustNot and filter, which maps nicely to Boolean queries. I define a search index with explicit mappings, put the tenantId and status in the filter clause so they don't affect scoring, and remember the index is eventually consistent, so a new document can take a moment to show up."`,
      mistakes: [
        'Using dynamic mappings on everything; the index gets big and fields are analyzed the wrong way. Map fields explicitly.',
        'Putting `$search` anywhere except the first stage.',
        'Doing tenant filtering with `$match` after `$search` instead of `compound.filter` — slower, and pagination/limits get wrong results.',
        'Follow-up trap: "A user creates a record and searches for it immediately but cannot find it — why?" The search index syncs asynchronously from the oplog; there is a small lag.',
      ],
      takeaway: 'For real user-facing search on Atlas, use `$search` with explicit mappings, `compound` logic and tenant filters in `filter`.',
    },
    {
      id: 'atlas-vector-search-rag',
      title: 'Atlas Vector Search: RAG on MongoDB',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Store embeddings next to your documents and use $vectorSearch to find the most similar chunks, then send them to the LLM — RAG without a separate vector database.',
      tags: ['rag', 'embeddings', 'vectorSearch', 'genai', 'llm'],
      what: `**Atlas Vector Search** lets MongoDB find documents by **meaning**, not exact words. It is the "retrieve" step of **RAG** (Retrieval-Augmented Generation).

How RAG on MongoDB works, in 4 steps:
1. **Embed:** turn each chunk of your text into an **embedding** (a list of numbers that captures its meaning) using an embedding model.
2. **Store:** save the embedding in the same document as the text, e.g. \`{ text, embedding: [0.12, -0.03, ...] }\`.
3. **Search:** when a user asks a question, embed the question and run \`$vectorSearch\` to get the most similar chunks.
4. **Generate:** put those chunks into the prompt and ask the LLM to answer **only from them**.

#### Deeper version
- You create a **vector search index** on the embedding field, with the number of **dimensions** (must match your embedding model, e.g. 1536) and a **similarity** (\`cosine\`, \`dotProduct\` or \`euclidean\`).
- \`$vectorSearch\` must be the **first stage** of the pipeline. \`numCandidates\` is how many neighbours to look at; \`limit\` is how many to return. More candidates = better recall but slower (it is an approximate nearest neighbour search).
- Add a \`filter\` (e.g. \`tenantId\`) inside \`$vectorSearch\` so users only search their own data. Filter fields must be declared in the index.
- Use \`{ $meta: 'vectorSearchScore' }\` to see how close each match is.
- You must use the **same embedding model** for the stored chunks and the question. Changing models means re-embedding everything.
- Like Atlas Search, the index syncs **asynchronously**, so brand-new documents appear after a short delay.`,
      why: `If your app already uses MongoDB, Vector Search keeps your text, metadata and embeddings in **one database**. No separate vector store to sync, and you can filter by tenant, status or date in the same query. It lets an LLM answer from **your** data (docs, resumes, tickets) instead of guessing.`,
      analogy: `A normal index is like finding a book by its exact title. Vector search is like asking a librarian "I want something about feeling homesick" — they bring the books with the closest meaning, even if none has that exact phrase. RAG then hands those books to the LLM so it answers from them.`,
      code: [
        {
          title: 'Vector index definition (Atlas)',
          lang: 'json',
          code: `{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
    { "type": "filter", "path": "tenantId" }
  ]
}`,
        },
        {
          title: 'Retrieve chunks and answer with an LLM',
          lang: 'javascript',
          code: `// 1. Embed the question (same model used for the stored chunks)
const question = 'How many leave days do new employees get?';
const queryVector = await embed(question); // e.g. OpenAI text-embedding-3-small → 1536 numbers

// 2. Find the 5 most similar chunks for this tenant
const chunks = await Doc.aggregate([
  {
    $vectorSearch: {
      index: 'doc_vector_index',
      path: 'embedding',
      queryVector,
      numCandidates: 100, // look at 100 neighbours
      limit: 5,           // return the best 5
      filter: { tenantId },
    },
  },
  { $project: { text: 1, score: { $meta: 'vectorSearchScore' } } },
]);

// 3. Ask the LLM to answer only from those chunks
const context = chunks.map((c) => c.text).join('\\n---\\n');
const answer = await llm({
  system: 'Answer only from the context. If the answer is not there, say you do not know.',
  user: \`Context:\\n\${context}\\n\\nQuestion: \${question}\`,
});`,
        },
      ],
      output: `The question is turned into a vector. \`$vectorSearch\` compares it with the stored chunk vectors for that tenant and returns the 5 closest, each with a similarity score. Those 5 chunks are joined into the prompt, and the LLM answers from them, saying "I don't know" if the answer is not in the context.`,
      questions: [
        {
          q: 'What is RAG?',
          a: 'Retrieval-Augmented Generation: first retrieve relevant chunks from your own data, then send them to the LLM with the question so it answers from them. It reduces hallucinations and works with private or fresh data.',
        },
        {
          q: 'What is an embedding?',
          a: 'A list of numbers that represents the meaning of a piece of text. Texts with similar meaning have vectors that are close together.',
        },
        {
          q: 'Why use Atlas Vector Search instead of a separate vector DB?',
          a: 'If the data is already in MongoDB, you keep text, metadata and vectors together, avoid a sync pipeline, and can filter (tenant, date) in the same query. A dedicated vector DB may make sense at very large scale or for special features.',
        },
        {
          q: 'What are numCandidates and limit?',
          a: '`numCandidates` is how many nearest neighbours the search considers; `limit` is how many it returns. A higher `numCandidates` improves accuracy but costs speed.',
        },
      ],
      spoken: `"For RAG on MongoDB I split documents into chunks, create an embedding for each chunk and store it in the same document as the text. I add an Atlas vector search index on that field with the right dimensions and cosine similarity. When a user asks something, I embed the question with the same model, run a vectorSearch stage with a tenant filter to get the top few chunks, and pass them to the LLM with an instruction to answer only from that context. That keeps everything in one database and cuts hallucinations."`,
      mistakes: [
        'Using a different embedding model for the question than for the stored chunks — the vectors are not comparable.',
        'Setting `numDimensions` in the index different from the model output — the search fails.',
        'Forgetting the tenant filter, so one customer\'s data can show up in another\'s answers.',
        'Sending whole documents instead of small chunks — results get less precise and the prompt gets expensive.',
        'Follow-up trap: "The answer is wrong even though the data exists — what do you check?" Check chunk size, whether the right chunks were retrieved (log scores), numCandidates, and whether the prompt tells the model to use the context.',
      ],
      takeaway: 'RAG on MongoDB = embed chunks, store vectors with the text, $vectorSearch with a tenant filter, then let the LLM answer only from what was retrieved.',
    },
    {
      id: 'schema-design-patterns',
      title: 'Schema Design Patterns (Computed, Bucket, Subset, Outlier, Extended Reference)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Named, reusable modeling tricks for common performance problems: precompute totals, bucket time series, embed a subset, handle outliers.',
      what: `MongoDB has a set of well-known **schema design patterns**. Each solves one common problem:

- **Computed pattern:** store a value you would otherwise calculate on every read (\`reviewCount\`, \`ratingSum\`, \`totalCents\`). Update it on write.
- **Subset pattern:** embed only the part you show most (latest 10 reviews) and keep the full list in another collection.
- **Extended reference:** copy a few fields of a referenced document (\`customer: { _id, name }\`) to avoid a join.
- **Bucket pattern:** group many small records into one document per time window (one document per sensor per hour with a \`readings\` array).
- **Outlier pattern:** most documents are normal, a few are huge (a celebrity with 10M followers). Handle the few with an overflow flag and extra documents.
- **Attribute pattern:** turn many similar fields into an array of \`{ k, v }\` so one index can cover them all.
- **Schema versioning:** add \`schemaVersion\` so old and new shapes can live together during migrations.

#### Deeper version
All of these trade **write complexity** and some **duplication** for **fast, simple reads**. They fit MongoDB's idea of designing for the queries. For time-series data, newer MongoDB versions (5.0+) have **time series collections** that do bucketing for you internally — prefer them over a hand-made bucket pattern for metrics and events.`,
      why: `Interviewers ask "how would you model X?" for reviews, chat messages, IoT readings or social followers. Naming the right pattern and its trade-off shows real data-modeling experience.`,
      analogy: `These patterns are like kitchen prep. Computed = pre-cutting vegetables before dinner rush. Subset = keeping the most used spices on the counter and the rest in the pantry. Bucket = storing eggs in cartons of 12 instead of one by one.`,
      code: [
        {
          title: 'Computed + extended reference + subset',
          lang: 'javascript',
          code: `// On new review: one write to reviews, one atomic update to the product
await Review.create({ productId, userId, rating: 5, text: 'Great' });
await Product.updateOne({ _id: productId }, {
  $inc: { reviewCount: 1, ratingSum: 5 },                    // computed
  $push: { recentReviews: {                                  // subset (latest 5)
    $each: [{ user: { _id: userId, name: 'Asha' }, rating: 5, text: 'Great' }], // extended reference
    $sort: { _id: -1 }, $slice: 5,
  } },
});
// Average = ratingSum / reviewCount, no aggregation needed on page load`,
        },
        {
          title: 'Bucket pattern vs time series collection',
          lang: 'javascript',
          code: `// Hand-made bucket: one doc per sensor per hour, capped at 200 readings
db.readings.updateOne(
  { sensorId: 's1', hour: ISODate('2026-10-07T10:00:00Z'), count: { $lt: 200 } },
  { $push: { values: { t: new Date(), v: 21.7 } }, $inc: { count: 1, sum: 21.7 } },
  { upsert: true }
);

// Built-in alternative (MongoDB 5.0+): time series collection
db.createCollection('metrics', {
  timeseries: { timeField: 'ts', metaField: 'sensorId', granularity: 'minutes' },
  expireAfterSeconds: 60 * 60 * 24 * 30, // keep 30 days
});
db.metrics.insertOne({ ts: new Date(), sensorId: 's1', v: 21.7 });`,
        },
      ],
      output: `Adding a review updates the product with \`$inc\` and \`$push\` in one atomic write. The product page now reads one document: average rating from \`ratingSum / reviewCount\`, plus the latest 5 reviews with the reviewer's name already inside — no aggregation, no join.

The bucket upsert adds a reading to the current hour's document for sensor s1. When the bucket reaches 200 readings, the filter no longer matches and the upsert starts a new document. The time series collection does this grouping internally and also expires old data after 30 days.`,
      questions: [
        { q: 'What is the computed pattern?', a: 'Storing a pre-calculated value (count, sum, total) and updating it on write, so reads do not recalculate it every time.' },
        { q: 'When would you use the bucket pattern?', a: 'For many small, time-based records like IoT readings or logs: group them per entity per time window to cut document and index counts. On 5.0+ consider time series collections.' },
        { q: 'What is the outlier pattern?', a: 'Design for the normal case and handle the rare huge document specially, e.g. a `hasOverflow` flag and extra overflow documents for a user with millions of followers.' },
        { q: 'What is the extended reference pattern?', a: 'Copying a few frequently needed fields of a referenced document (like customer name) next to the reference, to avoid a lookup on reads.' },
      ],
      spoken: `"MongoDB has well-known schema patterns that trade some write work for fast reads. I use the computed pattern for things like review counts and rating sums, the subset pattern to embed the latest few reviews while keeping all of them in a separate collection, and the extended reference pattern to copy a customer's name onto an order. For time-based data I'd use the bucket pattern, or better, a native time series collection on 5.0 and later. And for rare giant documents, like a celebrity's followers, the outlier pattern. The cost is keeping duplicated data in sync."`,
      mistakes: [
        'Using a computed value without updating it atomically (`$inc`), so it drifts under concurrency.',
        'Copying fields that change often (extended reference) and never updating the copies.',
        'Building a manual bucket pattern for metrics when a time series collection would do it better.',
        'Follow-up trap: "What if the computed count gets out of sync?" Run a periodic reconciliation job (an aggregation that recomputes the real value) and fix differences.',
      ],
      takeaway: 'Patterns like computed, subset, extended reference and bucket trade write effort for fast reads — pick them based on your hottest queries.',
    },
    {
      id: 'aggregation-advanced',
      title: 'Advanced Aggregation: $bucket, $setWindowFields, $merge / $out',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'Group values into ranges with $bucket, compute running totals and ranks with window functions, and save results to a collection with $merge.',
      what: `Beyond \`$match\` and \`$group\`, a few stages solve common reporting needs:

- **\`$bucket\` / \`$bucketAuto\`:** group documents into **ranges**, like salary bands or price ranges.
- **\`$setWindowFields\`** (MongoDB 5.0+): **window functions** — running totals, moving averages, rank within a group — while keeping every document (unlike \`$group\`, which collapses them).
- **\`$out\`:** write the pipeline result into a collection, **replacing** it.
- **\`$merge\`:** write results into a collection, **merging** with existing documents (insert new, update or keep existing). Great for **materialized views**.

#### Deeper version
A **materialized view** is a precomputed report stored as a collection. Instead of running a heavy aggregation on every dashboard load, a scheduled job runs it (say, every 10 minutes or nightly) with \`$merge\`, and the dashboard reads the small result collection with a simple indexed \`find\`. With \`$merge\` you can update only the new day's numbers (incremental), which is cheaper than rebuilding with \`$out\`.

\`$out\` and \`$merge\` must be the **last stage**. Pipelines with them run on the primary by default.`,
      why: `Dashboards and analytics are common in SaaS. These stages let you do salary bands, running revenue and leaderboards inside the database, and keep dashboards fast by precomputing.`,
      analogy: `\`$bucket\` is sorting coins into jars by value. A window function is a running scoreboard that shows each player's score and their rank, without removing anyone from the list. \`$merge\` is writing today's totals into the shop's ledger book so tomorrow you just read the book.`,
      code: [
        {
          title: '$bucket and $setWindowFields',
          lang: 'javascript',
          code: `// Candidates by expected salary band
db.candidates.aggregate([
  { $match: { tenantId: t } },
  { $bucket: {
      groupBy: '$expectedSalary',
      boundaries: [0, 500000, 1000000, 2000000, 5000000],
      default: 'other',
      output: { count: { $sum: 1 } },
  } },
]);

// Running revenue per tenant, by day (keeps every daily row)
db.dailyRevenue.aggregate([
  { $setWindowFields: {
      partitionBy: '$tenantId',
      sortBy: { day: 1 },
      output: {
        runningTotal: { $sum: '$revenueCents', window: { documents: ['unbounded', 'current'] } },
        rankInTenant: { $rank: {} }, // rank by day order within the tenant
      },
  } },
]);`,
        },
        {
          title: 'Materialized view with $merge (run by a scheduled job)',
          lang: 'javascript',
          code: `const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

await Order.aggregate([
  { $match: { status: 'paid', createdAt: { $gte: since } } },
  { $group: {
      _id: { tenantId: '$tenantId', day: { $dateTrunc: { date: '$createdAt', unit: 'day' } } },
      revenueCents: { $sum: '$totalCents' },
      orders: { $sum: 1 },
  } },
  { $merge: {
      into: 'dailyRevenue',
      on: '_id',                 // match existing rows by the same tenant + day
      whenMatched: 'replace',    // recompute that day
      whenNotMatched: 'insert',
  } },
]);

// Dashboard: tiny, fast read
await DailyRevenue.find({ '_id.tenantId': t }).sort({ '_id.day': -1 }).limit(30).lean();`,
        },
      ],
      output: `\`$bucket\` returns one document per salary band, like \`{ _id: 500000, count: 42 }\` for 5-10 lakh; values outside all boundaries go to \`'other'\`.

\`$setWindowFields\` keeps every daily row but adds \`runningTotal\` (sum of revenue from the first day up to this day, per tenant) and a rank. The \`$merge\` job recomputes the last day's revenue per tenant and writes it into \`dailyRevenue\`, inserting new days and replacing changed ones. The dashboard then reads 30 small rows instead of aggregating millions of orders.`,
      questions: [
        { q: 'What is the difference between `$out` and `$merge`?', a: '`$out` replaces the whole target collection with the results. `$merge` merges results into an existing collection with rules for matched and unmatched documents, so it supports incremental updates.' },
        { q: 'What are window functions in MongoDB?', a: '`$setWindowFields` computes values over a window of related documents (running totals, moving averages, ranks) without collapsing them like `$group` does.' },
        { q: 'How would you make a slow dashboard fast?', a: 'Precompute it: run the heavy aggregation on a schedule with `$merge` into a summary collection (a materialized view), index it, and have the dashboard read that.' },
      ],
      spoken: `"For reporting I go beyond match and group. \`$bucket\` groups values into ranges like salary bands. \`$setWindowFields\`, available since 5.0, gives window functions like running totals and ranks per partition, while keeping each document. And for dashboards I like materialized views: a scheduled job runs the heavy aggregation and writes the result with \`$merge\` into a small summary collection, updating only recent days, so the dashboard just does a quick indexed find. \`$out\` is the simpler version that replaces the whole collection."`,
      mistakes: [
        'Running a heavy aggregation over all history on every dashboard page load instead of precomputing.',
        'Using `$out` for incremental updates — it replaces the entire collection each time.',
        'Forgetting that `$merge` with `on` needs a unique index on those fields in the target collection (other than `_id`, which is always unique).',
        'Follow-up trap: "Is a materialized view always up to date?" No, it is as fresh as the last job run. Say so in the UI, or combine it with a live query for today.',
      ],
      takeaway: '`$bucket` for ranges, window functions for running totals and ranks, `$merge` for precomputed materialized views.',
    },
  ],
  rapidFire: [
    { q: 'What format does MongoDB store documents in?', a: 'BSON, a binary form of JSON with extra types like ObjectId, Date and Decimal128.' },
    { q: 'Maximum size of one document?', a: '16 MB.' },
    { q: 'What is inside an ObjectId?', a: 'A 4-byte timestamp, a 5-byte random value and a 3-byte counter.' },
    { q: 'How should you store money?', a: 'As integer cents or Decimal128, never as a float.' },
    { q: 'Schema vs model in Mongoose?', a: 'The schema defines shape and rules; the model is the class compiled from it that queries a collection.' },
    { q: 'Is `unique: true` a Mongoose validator?', a: 'No, it creates a unique index; duplicates fail with error code 11000.' },
    { q: 'Do validators run on updateOne?', a: 'Only with `runValidators: true`.' },
    { q: '`$set` vs `replaceOne`?', a: '`$set` changes listed fields; `replaceOne` replaces the whole document except `_id`.' },
    { q: 'What is an upsert?', a: 'Update if a match exists, insert otherwise (`upsert: true`).' },
    { q: 'Are single-document writes atomic?', a: 'Yes, always.' },
    { q: '`$in` vs `$all`?', a: '`$in` = matches any value; `$all` = array contains every value.' },
    { q: 'When do you need `$elemMatch`?', a: 'When several conditions must match the same array element.' },
    { q: 'Is there a top-level `$not`?', a: 'No. Use field-level `$not`, or `$nor` to negate a group.' },
    { q: 'Do `$ne` / `$nin` match missing fields?', a: 'Yes.' },
    { q: 'Embed or reference an unbounded list?', a: 'Reference — unbounded arrays risk the 16 MB limit and slow updates.' },
    { q: 'What does a compound index support?', a: 'Queries on its left prefixes, e.g. `{a,b,c}` serves a, a+b, a+b+c.' },
    { q: 'What is a multikey index?', a: 'An index on an array field, with one entry per element.' },
    { q: 'How many text indexes per collection?', a: 'One (it can cover many fields).' },
    { q: 'What is the ESR rule?', a: 'Order compound index fields: Equality, then Sort, then Range.' },
    { q: 'Sign of a missing sort index in explain?', a: 'A `SORT` stage in the winning plan.' },
    { q: 'Partial vs sparse index?', a: 'Sparse skips docs missing the field; partial indexes only docs matching any filter you give.' },
    { q: 'How often does the TTL monitor run?', a: 'About every 60 seconds, so expiry is not exact.' },
    { q: 'What is a covered query?', a: 'One answered fully from an index; `totalDocsExamined` is 0.' },
    { q: 'COLLSCAN vs IXSCAN?', a: 'COLLSCAN reads every document; IXSCAN walks an index.' },
    { q: 'Ideal explain ratio?', a: 'totalKeysExamined ≈ totalDocsExamined ≈ nReturned.' },
    { q: 'Which explain mode gives real counts?', a: '`executionStats`.' },
    { q: 'Where should `$match` go in a pipeline?', a: 'As early as possible, so it can use indexes and reduce data.' },
    { q: 'Does Mongoose cast types in `aggregate()`?', a: 'No — convert ids and dates yourself.' },
    { q: 'What does `$lookup` return?', a: 'An array of matching documents from the other collection.' },
    { q: 'What does `$unwind` do with empty arrays by default?', a: 'Drops the document, unless `preserveNullAndEmptyArrays: true`.' },
    { q: 'Can stages inside `$facet` use indexes?', a: 'No, only stages before `$facet`.' },
    { q: 'How are words combined in `$text`?', a: 'With OR; quotes force a phrase and `-word` excludes.' },
    { q: 'When can `$regex` use an index well?', a: 'When it is an anchored, case-sensitive prefix like `/^abc/`.' },
    { q: 'How does populate work?', a: 'It runs one extra `$in` query per populated path and merges results in Node.' },
    { q: 'What does `lean()` return?', a: 'Plain JavaScript objects — no save, virtuals or getters.' },
    { q: 'How to fix N+1 queries?', a: 'Batch ids with `$in`, populate, `$lookup`, or DataLoader in GraphQL.' },
    { q: 'Why is `skip` slow on deep pages?', a: 'MongoDB still walks and discards every skipped entry.' },
    { q: 'Why add `_id` to a cursor-pagination sort?', a: 'As a unique tie-breaker so items with equal sort values are not skipped or repeated.' },
    { q: 'Does `pre("save")` run on `findOneAndUpdate`?', a: 'No; update queries use query middleware.' },
    { q: 'Can you query by a virtual?', a: 'No, virtuals are not stored in the database.' },
    { q: '`countDocuments` vs `estimatedDocumentCount`?', a: '`countDocuments` counts matches of a filter exactly; `estimatedDocumentCount` uses collection metadata — fast, no filter.' },
    { q: 'What is a discriminator in Mongoose?', a: 'Schema inheritance: several models with different fields stored in one collection, told apart by a key field.' },
    { q: 'What is GridFS?', a: 'A way to store files bigger than 16 MB by splitting them into chunks across two collections.' },
    { q: 'What is NoSQL injection?', a: 'Sending operator objects like `{ "$ne": null }` where a plain value is expected.' },
    { q: 'What do transactions require?', a: 'A replica set or sharded cluster and a session passed to every operation.' },
    { q: 'Default transaction time limit?', a: '60 seconds (`transactionLifetimeLimitSeconds`).' },
    { q: 'Write concern `w: "majority"` means?', a: 'Most replica set members must confirm the write before success.' },
    { q: 'Risk of reading from secondaries?', a: 'Stale data due to replication lag.' },
    { q: 'What is the oplog?', a: 'A capped collection of operations that secondaries replay to replicate data.' },
    { q: 'Why use an odd number of replica set members?', a: 'Elections need a majority; odd numbers give the best fault tolerance.' },
    { q: 'Default election timeout?', a: '10 seconds (`electionTimeoutMillis`).' },
    { q: 'Is replication a backup?', a: 'No — mistakes replicate instantly; you still need backups.' },
    { q: 'Good shard key traits?', a: 'High cardinality, even frequency, not monotonic, and used in most queries.' },
    { q: 'Targeted vs scatter-gather query?', a: 'Targeted includes the shard key and hits one shard; scatter-gather asks all shards.' },
    { q: 'What does a change stream resume token do?', a: 'Lets you restart `watch()` from the last processed event.' },
    { q: 'Where does tenantId go in compound indexes?', a: 'First, since every tenant query filters on it by equality.' },
    { q: 'Boolean search precedence?', a: 'NOT binds tightest, then AND, then OR; adjacent terms mean AND.' },
    { q: 'Atlas Search compound clauses?', a: '`must` (AND), `should` (OR), `mustNot` (NOT), `filter` (match without scoring).' },
    { q: '`$out` vs `$merge`?', a: '`$out` replaces the target collection; `$merge` merges results into it.' },
    { q: 'How many connections should a Node app open?', a: 'One client/pool per process, reused for all requests.' },
  ],
};
