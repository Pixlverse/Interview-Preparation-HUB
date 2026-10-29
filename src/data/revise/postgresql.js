// Revise MERN: PostgreSQL & SQL. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'postgresql',
  icon: '🐘',
  title: 'PostgreSQL & SQL',
  note: 'Relational basics, joins, indexes, transactions, query tuning and when to pick SQL over MongoDB.',
  items: [
    {
      q: 'SQL vs NoSQL: when would you choose PostgreSQL over MongoDB?',
      a: `I pick **PostgreSQL** when the data is relational, needs strong consistency and multi-row transactions, or needs flexible querying with joins and aggregates, like billing, users and jobs. I pick **MongoDB** when documents are self-contained, the schema changes often, and I mostly read whole documents by key.

In practice I used both: SkillKeepr runs on MongoDB with one database per company, and OCTAGNT uses FastAPI with PostgreSQL. Postgres also has **JSONB**, so it covers many "flexible document" needs without giving up joins and ACID.`,
    },
    {
      q: 'What are the different types of joins?',
      a: `A join combines rows from two tables on a matching condition. **INNER JOIN** returns only rows that match in both tables. **LEFT JOIN** returns all rows from the left table, with NULLs where the right side has no match. **RIGHT JOIN** is the mirror image, and **FULL OUTER JOIN** returns everything from both sides.

There is also **CROSS JOIN**, which gives every combination, and a **self join**, where a table is joined to itself, for example employees to their managers. A common use of LEFT JOIN is finding rows with no match, by filtering \`WHERE right.id IS NULL\`.`,
    },
    {
      q: 'What is a primary key and a foreign key?',
      a: `A **primary key** uniquely identifies each row in a table. It must be unique and not null, and Postgres automatically creates a unique index for it. A **foreign key** is a column that points to the primary key of another table, and the database enforces that the referenced row exists.

Foreign keys protect **referential integrity**: you cannot insert an order for a customer that does not exist. You can also set actions like \`ON DELETE CASCADE\` or \`ON DELETE SET NULL\`. One tip: Postgres does not auto-index foreign key columns, so you usually add that index yourself.`,
    },
    {
      q: 'What is an index and how does a B-tree index work?',
      a: `An **index** is a separate data structure that lets the database find rows without scanning the whole table, like the index at the back of a book. The default in Postgres is a **B-tree**, a balanced sorted tree, so lookups, range queries and ORDER BY on the indexed column are fast, in roughly logarithmic time.

The trade-off is that every insert, update and delete must also update the index, and it uses disk space. So I index columns used in WHERE, JOIN and ORDER BY, not every column. Postgres also has GIN for JSONB and full-text, and composite indexes where column order matters.`,
    },
    {
      q: 'What is normalization? Explain 1NF, 2NF and 3NF.',
      a: `**Normalization** means organising tables to remove duplicate data so updates do not create inconsistencies. **1NF**: every column holds a single atomic value and there are no repeating groups. **2NF**: it is in 1NF and every non-key column depends on the whole primary key, not just part of a composite key.

**3NF**: it is in 2NF and non-key columns depend only on the key, not on other non-key columns. For example, storing a customer's city in every order row breaks 3NF; you move it to a customers table. The short rule is "the key, the whole key, and nothing but the key".`,
    },
    {
      q: 'What is denormalization and when would you use it?',
      a: `**Denormalization** means deliberately duplicating data to make reads faster, at the cost of more storage and more work keeping copies in sync. You do it when a normalized design needs too many joins on a hot read path.

Examples are storing a precomputed count or total, copying a customer name onto an invoice, or using a materialized view for a dashboard. I start normalized, measure, and only denormalize where reads are slow, and I make sure there is one clear place that updates the copied data, such as a transaction or a trigger.`,
    },
    {
      q: 'What does ACID mean?',
      a: `ACID is the set of guarantees a transaction gives. **Atomicity**: all statements succeed or none do. **Consistency**: the data moves from one valid state to another, respecting constraints. **Isolation**: concurrent transactions do not see each other's half-done work. **Durability**: once committed, the data survives a crash, because Postgres writes it to the write-ahead log first.

The classic example is a money transfer: debit one account and credit another. Without atomicity, a crash in the middle could lose money. Billing and credits are exactly where I want these guarantees.`,
    },
    {
      q: 'What is a transaction, and what are the isolation levels?',
      a: `A **transaction** groups statements between \`BEGIN\` and \`COMMIT\` so they succeed or fail together; \`ROLLBACK\` undoes them. Isolation levels control what concurrent transactions can see. **Read Committed** is the Postgres default: each statement sees data committed before it started. **Repeatable Read** gives the whole transaction one snapshot. **Serializable** makes transactions behave as if they ran one by one.

Higher levels prevent anomalies like non-repeatable reads, phantom reads and lost updates, but can fail with serialization errors that the app must retry. Postgres treats Read Uncommitted as Read Committed, so dirty reads never happen.`,
    },
    {
      q: 'What is the N+1 query problem and how do you fix it?',
      a: `**N+1** is when you run one query to fetch a list, then one extra query per item to fetch related data, so 100 items become 101 queries. It usually comes from ORMs lazy-loading relations inside a loop, and it gets slow fast because of round trips.

The fix is to fetch related data in one go: a **JOIN**, or a single \`WHERE id IN (...)\` query, or the ORM's eager-loading option, like \`selectinload\` or \`joinedload\` in SQLAlchemy or \`include\` in Prisma. I spot it by logging queries or seeing many identical queries in a trace.`,
    },
    {
      q: 'How do you find and fix a slow query? What does EXPLAIN ANALYZE do?',
      a: `\`EXPLAIN\` shows the plan Postgres intends to use; \`EXPLAIN ANALYZE\` actually runs the query and shows real row counts and time for each step. I look for **sequential scans** on big tables, estimated rows far from actual rows, expensive sorts, and nested loops over many rows.

Typical fixes are adding the right index or composite index, rewriting the query to avoid functions on indexed columns, selecting fewer columns, adding LIMIT with pagination, and running \`ANALYZE\` so statistics are fresh. Before that, I find slow queries using \`pg_stat_statements\` or slow-query logs.`,
    },
    {
      q: 'What is the difference between WHERE and HAVING?',
      a: `**WHERE** filters individual rows before grouping, so it cannot use aggregate functions. **HAVING** filters groups after \`GROUP BY\`, so it can use aggregates like \`COUNT\` or \`SUM\`.

For example, to find customers with more than five paid orders, I use \`WHERE status = 'paid'\` to filter rows, then \`GROUP BY customer_id HAVING COUNT(*) > 5\` to filter groups. Putting row filters in WHERE is also faster, because fewer rows reach the grouping step.`,
    },
    {
      q: 'How do GROUP BY and aggregate functions work?',
      a: `**GROUP BY** collapses rows that share the same values into one row per group, and aggregate functions like \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\` and \`MAX\` compute one value per group. Every selected column must either be in the GROUP BY or inside an aggregate.

For example, counting candidates per job is \`SELECT job_id, COUNT(*) FROM candidates GROUP BY job_id\`. Useful extras are \`COUNT(DISTINCT x)\`, the \`FILTER (WHERE ...)\` clause for conditional counts, and \`string_agg\` or \`json_agg\` to collect values into one field.`,
    },
    {
      q: 'What are window functions?',
      a: `**Window functions** compute a value across a set of related rows but, unlike GROUP BY, they keep every row. You write them with \`OVER (PARTITION BY ... ORDER BY ...)\`.

Common ones are \`ROW_NUMBER\`, \`RANK\` and \`DENSE_RANK\` for ranking, \`LAG\` and \`LEAD\` to compare with the previous or next row, and running totals with \`SUM(...) OVER (ORDER BY date)\`. A classic interview use is "top 3 candidates per job": rank with \`ROW_NUMBER() OVER (PARTITION BY job_id ORDER BY score DESC)\` and keep rank 3 or less.`,
    },
    {
      q: 'What is row locking and SELECT ... FOR UPDATE?',
      a: `\`SELECT ... FOR UPDATE\` reads rows and **locks** them until the transaction ends, so other transactions that try to update or lock those rows must wait. It prevents the lost-update problem, where two requests read the same balance and both write back a wrong value.

I use it for things like deducting credits or claiming a job from a queue table. Add \`SKIP LOCKED\` to let multiple workers grab different rows without waiting, and \`NOWAIT\` to fail immediately instead. An alternative is a single atomic update like \`UPDATE ... SET credits = credits - 1 WHERE credits > 0\`.`,
    },
    {
      q: 'What is a deadlock and how do you avoid it?',
      a: `A **deadlock** happens when two transactions each hold a lock the other needs, so neither can continue. Postgres detects this, aborts one of them with a deadlock error, and lets the other finish.

To avoid it, I lock rows in a **consistent order** everywhere, for example always by id ascending, keep transactions **short**, avoid user or network calls inside a transaction, and lock what I need up front. Since deadlocks can still happen occasionally, the application should catch that error and **retry** the transaction.`,
    },
    {
      q: 'What is connection pooling and why does it matter?',
      a: `Opening a Postgres connection is expensive because each one is a separate server process, and the server has a hard \`max_connections\` limit. A **connection pool** keeps a set of open connections and lends them to requests, then takes them back, instead of connecting every time.

In app code, the driver or ORM has a pool, like SQLAlchemy's async engine in OCTAGNT. With many instances or serverless functions, you add an external pooler like **PgBouncer** or **RDS Proxy**, so hundreds of app workers share a small number of real database connections.`,
    },
    {
      q: 'What are CTEs?',
      a: `A **CTE**, or Common Table Expression, is a named temporary result you define with \`WITH name AS (...)\` and then use in the main query. It makes long queries readable by breaking them into steps, like "first find active jobs, then count their candidates".

A **recursive CTE** (\`WITH RECURSIVE\`) can walk hierarchies such as an org chart or category tree. Since Postgres 12, simple CTEs can be inlined by the planner, so they are usually no slower than subqueries; you can force the old behaviour with \`MATERIALIZED\`.`,
    },
    {
      q: 'What is JSONB and when would you use it?',
      a: `**JSONB** is Postgres's binary JSON type. It stores JSON in a parsed form, so you can query inside it with operators like \`->\`, \`->>\` and \`@>\`, and index it with a **GIN** index. Plain \`JSON\` stores the raw text and is slower to query.

I use it for semi-structured data that varies, like settings or AI output, while keeping core fields as normal columns. In OCTAGNT, the results of Claude's job analysis are saved on the job as JSON columns. If you filter on a field often, it is usually better to promote it to a real column.`,
    },
    {
      q: 'What is the difference between DELETE, TRUNCATE and DROP?',
      a: `**DELETE** removes rows one by one, can have a WHERE clause, fires row triggers and is fully transactional, but is slow on huge tables and leaves dead rows for VACUUM. **TRUNCATE** removes all rows at once by resetting the table's storage, so it is very fast; it can reset identity sequences and does not fire row-level delete triggers.

**DROP** removes the table itself, structure included. In Postgres, TRUNCATE can be rolled back inside a transaction, unlike some other databases. TRUNCATE also needs \`CASCADE\` if other tables reference it with foreign keys.`,
    },
    {
      q: 'What are database migrations and how do you manage them?',
      a: `**Migrations** are versioned scripts that change the schema step by step, such as adding a table or column, kept in source control so every environment can be brought to the same version. Each migration has an "up" and usually a "down".

OCTAGNT uses **Alembic** with SQLAlchemy; in Node you would use Prisma Migrate, Knex or TypeORM. For safe production changes, I make them backward compatible: add a nullable column first, deploy code, backfill, then add constraints. I avoid long table locks, for example by using \`CREATE INDEX CONCURRENTLY\`.`,
    },
    {
      q: 'What is an ORM? What are its pros and cons?',
      a: `An **ORM** (Object-Relational Mapper) maps tables to classes or models in code, so you work with objects instead of writing SQL by hand. Examples are SQLAlchemy in Python, and Prisma, Sequelize, TypeORM or Drizzle in Node.

Pros: faster development, type safety, migrations, and protection from SQL injection through parameterised queries. Cons: hidden inefficient queries like N+1, less control over complex queries, and a learning curve. My approach is to use the ORM for normal CRUD and drop to raw SQL for heavy reporting or tricky queries.`,
    },
    {
      q: 'What is a view, and what is a materialized view?',
      a: `A **view** is a saved query that you can select from like a table. It stores no data; every time you query it, the underlying query runs. It is useful to hide complexity or expose only certain columns.

A **materialized view** stores the result physically, so reads are fast, but the data is only as fresh as the last \`REFRESH MATERIALIZED VIEW\`. With \`CONCURRENTLY\` and a unique index, you can refresh without blocking readers. I would use one for dashboards or reports where slightly stale data is fine.`,
    },
    {
      q: 'How do you prevent SQL injection?',
      a: `SQL injection happens when user input is concatenated into a SQL string, so an attacker can change the query. The main fix is **parameterised queries**, where the SQL and the values are sent separately, like \`WHERE email = $1\`, so input is always treated as data.

ORMs and query builders do this by default. On top of that, I validate input, never build table or column names from user input without a whitelist, and give the app's database user only the privileges it needs. Row-level security can add another layer for multi-tenant data.`,
    },
    {
      q: 'What is MVCC and what does VACUUM do?',
      a: `**MVCC** (Multi-Version Concurrency Control) is how Postgres lets readers and writers work at the same time without blocking each other. An update does not overwrite a row; it writes a new version and marks the old one dead. Each transaction sees the versions that match its snapshot.

The downside is that dead rows pile up. **VACUUM** cleans them so the space can be reused, and **autovacuum** does this automatically in the background. If autovacuum falls behind on busy tables, you get table bloat and slower queries, so it sometimes needs tuning.`,
    },
    {
      q: 'What is row-level security in PostgreSQL?',
      a: `**Row-Level Security (RLS)** lets you attach policies to a table so that every query automatically sees only the rows the policy allows, even if the application forgets a WHERE clause. You enable it per table and write a policy, for example "tenant_id equals the current tenant setting".

OCTAGNT uses this for multi-tenancy: tenants share one PostgreSQL database, each row has a tenant id, and RLS policies filter by the current tenant. That contrasts with SkillKeepr, where each company gets its own MongoDB database, which gives stronger isolation but more databases to manage.`,
    },
  ],
};
