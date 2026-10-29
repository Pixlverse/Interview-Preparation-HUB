// Revise MERN: MongoDB & Mongoose. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'mongodb',
  icon: '🍃',
  title: 'MongoDB & Mongoose',
  note: 'Data modelling, indexes, aggregation, transactions, replication, sharding and Mongoose essentials.',
  items: [
    {
      q: 'SQL vs NoSQL: when would you choose MongoDB?',
      a: `**SQL databases** store data in tables with a fixed schema, use joins, and are strong for complex relationships and strict consistency. **MongoDB** is a **document database**: it stores flexible JSON-like documents, so related data can live together and the schema can evolve easily.

I choose MongoDB when data is naturally document-shaped, read together, and changes shape often, like profiles, catalogs or CMS content. I prefer SQL for heavy relational data and complex reporting, like finance. SkillKeepr used MongoDB, while OCTAGNT used PostgreSQL.`,
    },
    {
      q: 'What is a document, and what is BSON?',
      a: `A **document** is one record in MongoDB, a set of key-value pairs that looks like JSON and can contain nested objects and arrays. Documents live in **collections**, and every document has a unique \`_id\`, by default an **ObjectId**.

**BSON** is the binary format MongoDB actually stores. It is faster to scan than text JSON and supports extra types JSON does not have, such as \`ObjectId\`, \`Date\`, \`Decimal128\`, \`Int32\`/\`Int64\` and binary data. A single document has a **16 MB** size limit.`,
    },
    {
      q: 'Embedding vs referencing: how do you decide?',
      a: `**Embed** when the data is owned by the parent, read together, and bounded in size, like addresses inside a user or line items inside an order. It gives one fast read and atomic updates on that document.

**Reference** (store the other document's \`_id\`) when the related data is large, **grows without limit**, is shared by many parents, or is often queried on its own, like comments on a popular post or users in many teams. The rule of thumb is: model for how the app **reads** the data, and never let an array grow unbounded.`,
    },
    {
      q: 'What are indexes and why do they matter?',
      a: `An **index** is a sorted data structure (a B-tree) on one or more fields that lets MongoDB find documents without scanning the whole collection. Without one, a query does a **COLLSCAN**, which gets slow as data grows.

Indexes speed up reads and sorts but cost **extra storage** and **slower writes**, because every insert or update must update each index. So I index fields used in common filters, sorts and joins, and remove unused ones. \`_id\` is indexed automatically, and \`unique\` indexes also enforce uniqueness, like one account per email.`,
    },
    {
      q: 'What is a compound index and the ESR rule?',
      a: `A **compound index** covers multiple fields, like \`{ status: 1, createdAt: -1 }\`. Field order matters: it supports queries on a **prefix** of the fields, so \`status\` alone works but \`createdAt\` alone does not.

The **ESR rule** tells you the order: **Equality** fields first, then **Sort** fields, then **Range** fields (like \`$gt\`, \`$lt\`, \`$in\` on big lists). For "active jobs in a company, newest first, salary above X", the index is \`{ companyId: 1, status: 1, createdAt: -1, salary: 1 }\`. This avoids in-memory sorts and keeps scans tight.`,
    },
    {
      q: 'How do you use explain() to check a query?',
      a: `I run \`.explain('executionStats')\` on the query. The key things to read are the winning plan stage, **IXSCAN** (uses an index) versus **COLLSCAN** (full scan), and the numbers \`nReturned\`, \`totalKeysExamined\` and \`totalDocsExamined\`.

A healthy query examines roughly as many keys and documents as it returns. If it examines 100,000 docs to return 20, the index is missing or wrong. I also look for a **SORT** stage, which means an in-memory sort. In production, the **slow query log** or Atlas Profiler shows which queries to check.`,
    },
    {
      q: 'What is the aggregation pipeline?',
      a: `The **aggregation pipeline** processes documents through a series of **stages**, each transforming the output of the previous one, like Unix pipes. Common stages are \`$match\` (filter), \`$group\` (sum, count, average), \`$project\` or \`$addFields\` (reshape), \`$sort\`, \`$limit\`, \`$unwind\` (flatten arrays), \`$lookup\` (join) and \`$facet\` (several pipelines at once).

It is used for reports, dashboards and analytics. A key tip: put \`$match\` and \`$sort\` **early**, so they can use indexes and fewer documents flow through the later stages.`,
    },
    {
      q: 'What is $lookup and when should you avoid it?',
      a: `\`$lookup\` is the aggregation stage that does a **left outer join** with another collection in the same database, adding the matched documents as an array field. It can join on a simple field match, or use a sub-pipeline for more complex conditions.

It is useful, but if you need it on almost every read, your **schema may be too normalised**, and embedding or duplicating a few fields may be better. Make sure the foreign field is **indexed**, and filter with \`$match\` before the lookup so fewer documents get joined.`,
    },
    {
      q: 'Does MongoDB support transactions and ACID?',
      a: `Yes. **Single-document** operations have always been **atomic**, which is why good embedding often removes the need for transactions. Since MongoDB 4.0 there are **multi-document ACID transactions** on replica sets, and since 4.2 across sharded clusters.

You start a session, run operations with that session, and commit or abort. In Mongoose, \`connection.transaction()\` handles retries for you. Transactions add overhead and have a time limit, so I use them only when several documents must change together, like moving credits between two accounts.`,
    },
    {
      q: 'What is a replica set?',
      a: `A **replica set** is a group of MongoDB servers holding the same data: one **primary** that takes all writes, and **secondaries** that copy changes from the primary's **oplog**. It gives **high availability**: if the primary fails, the members hold an **election** and a secondary becomes primary automatically, usually within seconds.

You can read from secondaries with a **read preference**, but those reads may be slightly stale. **Write concern** \`majority\` makes sure a write survives a failover. A replica set is also required for transactions and change streams.`,
    },
    {
      q: 'What is sharding?',
      a: `**Sharding** is MongoDB's **horizontal scaling**: it splits one collection across multiple servers (shards), each usually a replica set. A **mongos** router sends each query to the right shard, using config servers that know where each chunk of data lives.

The most important decision is the **shard key**. A good key has high cardinality and spreads writes evenly, and most queries include it so they go to one shard. A bad key, like a monotonically increasing timestamp, sends all inserts to one "hot" shard. Hashed shard keys help spread writes.`,
    },
    {
      q: 'What is Mongoose and what are Schema and Model?',
      a: `**Mongoose** is an **ODM** (Object Data Modeling) library for MongoDB in Node. MongoDB itself is schemaless, so Mongoose adds structure on the application side.

A **Schema** defines the shape of documents: field types, defaults, validation, indexes, virtuals and middleware. A **Model** is compiled from a schema, \`mongoose.model('User', userSchema)\`, and maps to a collection; it is what you call to query and create documents, like \`User.find()\`. An instance of a model is a **document** with methods like \`save()\`.`,
    },
    {
      q: 'What is populate() in Mongoose?',
      a: `\`populate()\` replaces a stored **ObjectId reference** with the actual referenced document. You define \`ref: 'User'\` in the schema, then call \`Post.find().populate('author', 'name email')\`.

Under the hood it is **not a database join**: Mongoose runs a **second query** with \`$in\` on the collected ids and stitches the results together. That is fine for a few references, but deep or nested populates add many queries. For heavy reporting, an aggregation with \`$lookup\` or a denormalised field is often faster.`,
    },
    {
      q: 'What does lean() do and when should you use it?',
      a: `\`.lean()\` tells Mongoose to return **plain JavaScript objects** instead of full Mongoose documents. Normal documents carry change tracking, getters/setters, virtuals and methods like \`save()\`, which costs memory and CPU.

Lean queries are much **faster and lighter**, so I use them for **read-only** paths like API list endpoints. The trade-off: no \`save()\`, no virtuals or getters by default, and no document middleware. If I need to modify and save the document, I skip lean.`,
    },
    {
      q: 'What is Mongoose middleware (hooks)?',
      a: `**Middleware**, or hooks, are functions that run **before (\`pre\`) or after (\`post\`)** certain operations. Document middleware runs on \`save\` and \`validate\`, where \`this\` is the document; query middleware runs on \`find\`, \`updateOne\`, \`findOneAndUpdate\` and so on, where \`this\` is the query.

A classic use is a \`pre('save')\` hook to **hash a password** if it changed. A common gotcha: \`updateOne\` and \`findOneAndUpdate\` do **not** trigger \`save\` hooks, so logic in a save hook is skipped on those updates.`,
    },
    {
      q: 'How does validation work in Mongoose?',
      a: `You declare rules in the schema: \`required\`, \`min\`/\`max\`, \`minlength\`/\`maxlength\`, \`enum\`, \`match\` for regex, and **custom validators**. They run automatically on \`save()\` and \`create()\`, and throw a \`ValidationError\` with details per field.

Gotchas: update queries do **not** run validators unless you pass \`runValidators: true\`, and \`unique\` is **not a validator**, it only creates a unique index, so duplicates show up as error code **11000**. I still validate request input at the API layer, for example with Zod.`,
    },
    {
      q: 'How do you implement pagination in MongoDB?',
      a: `The simple way is **offset pagination** with \`skip()\` and \`limit()\`. It allows jumping to page N, but \`skip\` still walks over all skipped documents, so deep pages get slow, and results can shift if data changes.

For large or infinite-scroll lists I use **cursor (keyset) pagination**: sort by an indexed field like \`createdAt\` plus \`_id\`, and ask for documents after the last one seen, \`{ _id: { $lt: lastId } }\`. It stays fast at any depth. For total counts, \`countDocuments\` can be expensive, so I cache it or show an estimate.`,
    },
    {
      q: 'What is the N+1 query problem and how do you avoid it in MongoDB?',
      a: `**N+1** is when you fetch a list with one query, then run **one extra query per item** to load related data, so 50 posts cause 51 database calls. It is slow because of many network round trips.

To avoid it: **batch** the related ids and fetch them with a single \`$in\` query (which is what \`populate()\` does), use an aggregation with \`$lookup\`, or **embed or denormalise** small fields that you always show, like the author's name. Never call the database inside a loop over results.`,
    },
    {
      q: 'How did you design multi-tenancy with MongoDB?',
      a: `There are three common options: a **shared collection with a tenantId** on every document, a **separate database per tenant**, or a separate cluster per tenant. Shared is cheapest but one missed filter can leak data; separate databases give strong isolation and easy per-tenant backup or deletion, but more connections to manage.

On SkillKeepr we used **one MongoDB database per company**. The company was resolved from the subdomain on each request, the token's company id had to match, and the repository connected only to that company's database.`,
    },
    {
      q: 'What is a TTL index?',
      a: `A **TTL (time-to-live) index** automatically **deletes documents** after a set time. You create it on a **Date** field with \`expireAfterSeconds\`, for example \`{ createdAt: 1 }, { expireAfterSeconds: 3600 }\` deletes documents an hour after \`createdAt\`. Or set the expiry to 0 and store the exact expiry date in the field.

It is perfect for **sessions, OTPs, password reset tokens, and temporary logs**. A background job runs about every 60 seconds, so deletion is not instant. It only works on a single-field index.`,
    },
    {
      q: 'How does text search work in MongoDB?',
      a: `MongoDB has **text indexes**: you create one on string fields, then query with \`$text: { $search: 'react developer' }\`. It supports stemming, stop words, phrases in quotes and negation with a minus, and you can sort by \`textScore\`. A collection can have only **one text index**, though it can cover many fields.

For more advanced needs like fuzzy matching, autocomplete or better relevance, **Atlas Search** (built on Lucene) or Elasticsearch is better. On SkillKeepr, our Boolean candidate search parsed AND, OR, NOT and quoted phrases into a MongoDB query.`,
    },
    {
      q: 'What is optimistic concurrency and how does Mongoose support it?',
      a: `**Optimistic concurrency** assumes conflicts are rare. Instead of locking, each document has a **version number**, and an update only succeeds if the version has not changed since you read it. If someone else saved in between, your update fails and you retry or show a conflict.

Mongoose has a \`__v\` version key, but by default it only protects array changes. Setting \`optimisticConcurrency: true\` on the schema makes every \`save()\` check the version and throw a \`VersionError\`. You can also do it manually: \`updateOne({ _id, version }, { ..., $inc: { version: 1 } })\`.`,
    },
    {
      q: 'What are read and write concerns?',
      a: `**Write concern** sets how many replica set members must confirm a write before it is acknowledged. \`w: 1\` means only the primary; \`w: 'majority'\` (the default in modern MongoDB) means most members, so the write survives a primary failure.

**Read concern** controls how fresh or durable the data you read is: \`local\` returns the latest data on that node, which might be rolled back; \`majority\` returns only data confirmed by a majority. Stronger settings mean safer data but slightly higher latency.`,
    },
    {
      q: 'What are the common update operators in MongoDB?',
      a: `\`$set\` sets fields, \`$unset\` removes them, \`$inc\` increments a number atomically (great for counters and credits), \`$push\` adds to an array, \`$addToSet\` adds only if not already present, and \`$pull\` removes matching items from an array.

These are **atomic on a single document**, so \`$inc\` avoids race conditions you would get by reading, changing and saving in code. \`upsert: true\` creates the document if none matches. With Mongoose, \`findOneAndUpdate\` returns the old document unless you pass \`new: true\`.`,
    },
    {
      q: 'How do you improve MongoDB performance overall?',
      a: `Start with the **schema**: model for your read patterns and avoid unbounded arrays. Then **indexes** following the ESR rule, checked with \`explain()\`, and remove unused ones. Use **projection** to return only needed fields, and \`lean()\` for read-only Mongoose queries.

Use cursor-based pagination instead of large \`skip\`, avoid N+1 queries, and reuse a single **connection pool** instead of reconnecting per request, which matters a lot on serverless like Lambda. Add caching with Redis for hot data, and use replicas or sharding when one server is not enough.`,
    },
  ],
};
