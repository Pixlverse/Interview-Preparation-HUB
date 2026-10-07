// PostgreSQL & SQL — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'postgresql',
  title: 'PostgreSQL & SQL',
  icon: '🐘',
  description: 'SQL from the ground up with PostgreSQL: queries, joins, indexes, transactions and isolation, plus window functions, JSONB, pooling and ORMs from a Node.js point of view.',
  definitionTitle: 'What are PostgreSQL and SQL?',
  definition: `**SQL (Structured Query Language)** is the standard language for working with **relational databases**. These store data in **tables** (rows and columns) that are linked to each other through **keys**.

**PostgreSQL (Postgres)** is a powerful, open-source relational database. It is known for strong data correctness (**ACID** transactions), advanced features like JSONB, window functions and full-text search, and reliability.

**One-line answer:** "PostgreSQL is an open-source, ACID-compliant relational database, and SQL is the language used to define, query and change data stored in its related tables."`,
  topics: [
    {
      id: 'sql-basics',
      title: 'SQL Basics: SELECT, INSERT, UPDATE, DELETE',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'The four core commands to read and change rows, plus WHERE to filter, ORDER BY to sort and LIMIT to cut the result.',
      what: `**SQL** (Structured Query Language) is the language we use to talk to a relational database like PostgreSQL. Data lives in **tables**. A table has **columns** (fields like \`name\`, \`email\`) and **rows** (one record each).

The four core commands (often called **CRUD**: Create, Read, Update, Delete):

- \`SELECT\` reads rows.
- \`INSERT\` adds new rows.
- \`UPDATE\` changes existing rows.
- \`DELETE\` removes rows.

Helpers you use with them:

- \`WHERE\` filters which rows are affected.
- \`ORDER BY\` sorts the result (\`ASC\` is default, \`DESC\` for reverse).
- \`LIMIT\` returns only the first N rows. \`OFFSET\` skips rows.

#### Deeper version
SQL is **declarative**: you say *what* you want, not *how* to get it. The **query planner** decides how (which index, which join method).

The written order of a query is not the order it runs. The logical order is: \`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` → \`LIMIT\`. This is why you cannot use a column alias from \`SELECT\` inside \`WHERE\`, but you can use it in \`ORDER BY\`.

PostgreSQL adds a useful extra: \`RETURNING\`. It gives back the rows you just inserted, updated or deleted, so you don't need a second query to get the new \`id\`.

\`NULL\` means "unknown". \`NULL = NULL\` is not true, so you must use \`IS NULL\` / \`IS NOT NULL\`.`,
      why: `Every backend reads and writes data. Even if you use an ORM like Prisma, it generates these exact commands. Knowing raw SQL helps you debug slow queries, read logs, write reports, and answer the "write a query" part of interviews.`,
      analogy: `A table is like an Excel sheet. \`SELECT\` is looking at rows, \`WHERE\` is the filter button, \`ORDER BY\` is the sort button, \`LIMIT\` is "show me only the first 10". \`INSERT\` adds a new row, \`UPDATE\` edits cells, \`DELETE\` removes rows. An \`UPDATE\` without \`WHERE\` is like selecting the whole column and typing over it.`,
      code: [
        {
          title: 'Create a table and do CRUD',
          lang: 'sql',
          code: `CREATE TABLE users (
  id         SERIAL PRIMARY KEY,           -- auto-increment id
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  age        INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create: RETURNING gives back the new row (Postgres feature)
INSERT INTO users (name, email, age)
VALUES ('Asha', 'asha@x.com', 28), ('Ravi', 'ravi@x.com', 35)
RETURNING id, name;

-- Read: filter, sort, take top 10
SELECT id, name, age
FROM users
WHERE age >= 18 AND email LIKE '%@x.com'
ORDER BY age DESC
LIMIT 10;

-- Update: ALWAYS use WHERE
UPDATE users SET age = age + 1 WHERE id = 1 RETURNING *;

-- Delete
DELETE FROM users WHERE email = 'ravi@x.com';`,
        },
        {
          title: 'NULL handling and useful filters',
          lang: 'sql',
          code: `-- Wrong: returns nothing, because NULL = NULL is not true
SELECT * FROM users WHERE age = NULL;

-- Right
SELECT * FROM users WHERE age IS NULL;

-- IN, BETWEEN, ILIKE (case-insensitive LIKE in Postgres)
SELECT * FROM users WHERE id IN (1, 2, 3);
SELECT * FROM users WHERE age BETWEEN 20 AND 30;   -- inclusive
SELECT * FROM users WHERE name ILIKE 'a%';

-- Replace NULL with a default value in the output
SELECT name, COALESCE(age, 0) AS age FROM users;`,
        },
      ],
      output: `The \`INSERT ... RETURNING\` returns two rows like \`(1, 'Asha')\` and \`(2, 'Ravi')\`, so the app knows the new ids right away.

The \`SELECT\` returns adults with an \`@x.com\` email, oldest first, at most 10 rows. The \`UPDATE\` makes Asha 29 and returns her full row. The \`DELETE\` removes Ravi.

In the second block, \`age = NULL\` returns zero rows even if some ages are missing. \`age IS NULL\` returns them correctly. \`COALESCE\` prints \`0\` instead of empty for missing ages.`,
      questions: [
        {
          q: 'What is the order in which a SELECT query is executed?',
          a: 'Logically: `FROM` (and joins), `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `DISTINCT`, `ORDER BY`, then `LIMIT/OFFSET`. That is why a `SELECT` alias cannot be used in `WHERE`.',
        },
        {
          q: 'What is the difference between DELETE, TRUNCATE and DROP?',
          a: '`DELETE` removes chosen rows (can use `WHERE`, fires triggers). `TRUNCATE` quickly removes all rows but keeps the table. `DROP TABLE` removes the table itself, structure and all. In Postgres all three can be rolled back inside a transaction.',
        },
        {
          q: 'Why does `WHERE col = NULL` return nothing?',
          a: 'Because `NULL` means unknown, and comparing anything with unknown gives unknown (not true). Use `IS NULL` or `IS NOT NULL`.',
        },
        {
          q: 'What does RETURNING do?',
          a: 'It is a PostgreSQL feature that returns the affected rows from `INSERT`, `UPDATE` or `DELETE`. It saves a second round trip, for example to get a generated `id`.',
        },
      ],
      spoken: `"SQL has four core commands: SELECT to read, INSERT to add, UPDATE to change and DELETE to remove rows. I filter with WHERE, sort with ORDER BY and limit results with LIMIT. One thing I keep in mind is the logical order: FROM and WHERE run before SELECT, so I can't use a SELECT alias in WHERE. In Postgres I like RETURNING, because it gives me the inserted row's id without another query. I'm also careful with NULL — I use IS NULL, not equals NULL — and I never run UPDATE or DELETE without a WHERE."`,
      mistakes: [
        'Running `UPDATE` or `DELETE` without `WHERE` — it changes every row. Test the `WHERE` with a `SELECT` first, or wrap it in a transaction.',
        'Comparing with `= NULL` instead of `IS NULL`.',
        'Using a `SELECT` alias in `WHERE`. It fails because `WHERE` runs before `SELECT`.',
        'Using `SELECT *` in app code. It fetches columns you do not need and breaks when columns change.',
        'Follow-up trap: "Is the order of rows guaranteed without ORDER BY?" No. Without `ORDER BY` the database can return rows in any order, and it can change between runs.',
      ],
      takeaway: 'SELECT/INSERT/UPDATE/DELETE plus WHERE, ORDER BY and LIMIT cover most daily SQL — and always mind NULL and the WHERE clause.',
    },
    {
      id: 'keys-constraints',
      title: 'Primary Keys, Foreign Keys and Constraints',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Keys identify rows and link tables; constraints (NOT NULL, UNIQUE, CHECK, FOREIGN KEY) let the database reject bad data.',
      what: `- A **primary key** (PK) is a column that uniquely identifies each row. It cannot be \`NULL\` and cannot repeat. Example: \`users.id\`.
- A **foreign key** (FK) is a column that points to a primary key in another table. Example: \`orders.user_id\` points to \`users.id\`. The database makes sure the user really exists.
- **Constraints** are rules the database enforces: \`NOT NULL\`, \`UNIQUE\`, \`CHECK (price > 0)\`, \`DEFAULT\`, \`PRIMARY KEY\`, \`FOREIGN KEY\`.

#### Deeper version
A foreign key gives **referential integrity**: no "orphan" rows. You choose what happens when the parent is deleted:
- \`ON DELETE CASCADE\` — delete the children too.
- \`ON DELETE SET NULL\` — keep the child, clear the link.
- \`ON DELETE RESTRICT\` / default \`NO ACTION\` — block the delete.

Postgres automatically creates an index for \`PRIMARY KEY\` and \`UNIQUE\`, but **not** for foreign key columns. You usually add an index on the FK column yourself, because joins and cascading deletes use it.

**Natural key** = a real-world value (email). **Surrogate key** = a made-up id (\`SERIAL\`, \`BIGINT GENERATED ALWAYS AS IDENTITY\`, or \`UUID\`). Most apps use surrogate keys because real-world values can change.`,
      why: `App code has bugs, and many services may write to the same database. Constraints are the last line of defence. They stop duplicate emails, negative prices and orders pointing to deleted users — even when a race condition slips past your validation code.`,
      analogy: `A primary key is like an Aadhaar or passport number: one per person, never shared. A foreign key is like a delivery slip that must carry a valid customer number — the post office refuses slips with numbers that don't exist.`,
      code: [
        {
          title: 'Tables with keys and constraints',
          lang: 'sql',
          code: `CREATE TABLE users (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE orders (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount   NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status   TEXT NOT NULL DEFAULT 'pending'
           CHECK (status IN ('pending', 'paid', 'refunded'))
);

-- FK columns are NOT indexed automatically: add it yourself
CREATE INDEX idx_orders_user_id ON orders(user_id);`,
        },
        {
          title: 'What the constraints block',
          lang: 'sql',
          code: `INSERT INTO users (email) VALUES ('a@x.com');
INSERT INTO users (email) VALUES ('a@x.com');
-- ERROR: duplicate key value violates unique constraint

INSERT INTO orders (user_id, amount) VALUES (999, 50);
-- ERROR: insert violates foreign key constraint (user 999 does not exist)

INSERT INTO orders (user_id, amount) VALUES (1, -5);
-- ERROR: violates check constraint "orders_amount_check"

DELETE FROM users WHERE id = 1;  -- also deletes user 1's orders (CASCADE)`,
        },
      ],
      output: `The first insert works. The second fails with a unique-constraint error. The order for user 999 fails because that user does not exist. The negative amount fails the \`CHECK\`. Deleting user 1 removes their orders too because of \`ON DELETE CASCADE\`.

In Node, these errors arrive as exceptions with a Postgres error code, for example \`23505\` for unique violation and \`23503\` for foreign key violation. You can catch them and return a friendly 409 or 400.`,
      questions: [
        {
          q: 'What is the difference between a primary key and a unique key?',
          a: 'Both are unique. A table has only one primary key and it cannot be NULL. A table can have many unique constraints, and in Postgres a unique column may hold multiple NULLs (by default).',
        },
        {
          q: 'Does Postgres index foreign keys automatically?',
          a: 'No. It indexes primary keys and unique constraints, but not the referencing FK column. Add an index on it for fast joins and deletes.',
        },
        {
          q: 'SERIAL vs IDENTITY vs UUID for ids?',
          a: '`SERIAL` is the older auto-increment shortcut; `GENERATED ... AS IDENTITY` is the SQL-standard modern form. UUIDs are good when ids are created in many places or must not be guessable, but they are larger and random UUIDs spread inserts across the index.',
        },
        {
          q: 'What does ON DELETE CASCADE do?',
          a: 'When the parent row is deleted, the child rows that reference it are deleted automatically.',
        },
      ],
      spoken: `"A primary key uniquely identifies each row and can't be null. A foreign key links a child row to a parent, like orders.user_id to users.id, and the database guarantees the parent exists. I also use NOT NULL, UNIQUE and CHECK constraints, because app validation alone can't stop race conditions — two requests can both pass an 'email is free' check. The unique constraint is the real guard. One detail I remember: Postgres doesn't index foreign key columns automatically, so I add those indexes myself."`,
      mistakes: [
        'Relying only on app-level validation for uniqueness. Two parallel requests can both pass the check; only a `UNIQUE` constraint is safe.',
        'Forgetting to index foreign key columns, which makes joins and cascading deletes slow.',
        'Using `ON DELETE CASCADE` everywhere without thinking — one delete can wipe a lot of data.',
        'Using email or phone as the primary key. They can change; use a surrogate id and a `UNIQUE` on email.',
        'Follow-up trap: "Can a UNIQUE column have two NULLs?" In Postgres, yes by default, because NULL is not equal to NULL. Newer versions (15+) support `UNIQUE NULLS NOT DISTINCT` to block that.',
      ],
      takeaway: 'Keys give identity and links; constraints make the database itself refuse bad data — your safest validation layer.',
    },
    {
      id: 'joins',
      title: 'Joins: INNER, LEFT, RIGHT, FULL and SELF',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Joins combine rows from two tables using a matching column; the join type decides what happens to rows without a match.',
      what: `A **join** combines rows from two tables using a condition, usually "this id equals that id".

Sample tables:

- \`users\`: (1, Asha), (2, Ravi), (3, Meera)
- \`orders\`: (101, user 1, 500), (102, user 1, 200), (103, user 2, 900), (104, user 9, 50)

Types:
- **INNER JOIN** — only rows that match on both sides.
- **LEFT JOIN** — all rows from the left table, plus matches from the right. No match → right columns are \`NULL\`.
- **RIGHT JOIN** — the mirror of LEFT. Rarely used; people just swap the tables.
- **FULL OUTER JOIN** — all rows from both sides; \`NULL\` where there is no match.
- **SELF JOIN** — a table joined to itself, for example employees and their managers.
- **CROSS JOIN** — every row with every row (a cartesian product).

#### Deeper version
The \`ON\` condition and the \`WHERE\` condition behave differently in outer joins. A filter on the right table in \`WHERE\` removes the \`NULL\` rows and silently turns a LEFT JOIN into an INNER JOIN. Put such filters in \`ON\` instead.

Joins can also **multiply rows**: if one user has 3 orders, that user appears 3 times. Joining two "many" tables at once (orders and reviews) can blow up counts.

Under the hood Postgres picks a join algorithm: **nested loop** (good for small inputs with an index), **hash join** (builds a hash table of one side, good for big equality joins) or **merge join** (both sides sorted). You see the choice in \`EXPLAIN\`.`,
      why: `Relational databases split data into separate tables to avoid repeating it. Joins put it back together for a page or API response: "orders with customer names", "users who never ordered", "employees with their manager".`,
      analogy: `Think of two guest lists for a wedding: one from the bride's family, one from the groom's. INNER JOIN = people on both lists. LEFT JOIN = everyone on the bride's list, with groom-side info if they are also there. FULL JOIN = everyone on either list. A self join is like matching each person on one list to their parent on the same list.`,
      code: [
        {
          title: 'INNER vs LEFT vs FULL on sample data',
          lang: 'sql',
          code: `-- INNER: only matches
SELECT u.name, o.id AS order_id, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id;
-- Asha | 101 | 500
-- Asha | 102 | 200
-- Ravi | 103 | 900

-- LEFT: every user, even without orders
SELECT u.name, o.id AS order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
-- Asha | 101
-- Asha | 102
-- Ravi | 103
-- Meera | NULL

-- Users who never ordered (anti-join)
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;
-- Meera

-- FULL: everything from both sides
SELECT u.name, o.id AS order_id
FROM users u
FULL JOIN orders o ON o.user_id = u.id;
-- ...the 4 rows above, plus: NULL | 104  (order for missing user 9)`,
        },
        {
          title: 'Self join: employee and manager',
          lang: 'sql',
          code: `-- employees(id, name, manager_id)
-- (1, 'CEO', NULL), (2, 'Priya', 1), (3, 'Karan', 2)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
-- CEO   | NULL
-- Priya | CEO
-- Karan | Priya`,
        },
        {
          title: 'The WHERE vs ON trap',
          lang: 'sql',
          code: `-- Looks like LEFT JOIN, but WHERE drops Meera (o.amount is NULL)
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.amount > 300;

-- Keeps every user; only joins orders over 300
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.amount > 300;`,
        },
      ],
      output: `INNER JOIN returns 3 rows: Meera is missing (no orders) and order 104 is missing (no user 9). LEFT JOIN returns 4 rows: Meera appears with \`NULL\`. The anti-join returns only Meera. FULL JOIN returns 5 rows: everything, including the orphan order 104.

In the self join, the CEO has \`NULL\` as manager because of the LEFT JOIN; an INNER JOIN would drop the CEO.

In the trap example, the first query returns only Asha (500) and Ravi (900). The second returns Asha 500 (her order 102 simply does not join), Ravi 900 and Meera NULL: every user is kept, with only the big orders attached.`,
      questions: [
        {
          q: 'What is the difference between INNER JOIN and LEFT JOIN?',
          a: 'INNER JOIN keeps only rows that match in both tables. LEFT JOIN keeps every row from the left table and fills the right side with NULL when there is no match.',
        },
        {
          q: 'How do you find users who have no orders?',
          a: '`LEFT JOIN orders ... WHERE orders.id IS NULL`, or `WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)`. Both are anti-joins.',
        },
        {
          q: 'What is a self join? Give an example.',
          a: 'Joining a table to itself with two aliases. Classic example: employees table where `manager_id` points to another employee, to list each employee with their manager name.',
        },
        {
          q: 'Why did my LEFT JOIN behave like an INNER JOIN?',
          a: 'Because a `WHERE` condition on the right table removed the NULL rows. Move that condition into the `ON` clause.',
        },
        {
          q: 'Why are my counts too high after a join?',
          a: 'Joins multiply rows for one-to-many relations. Joining two child tables at once multiplies them together. Aggregate in a subquery/CTE first, or use `COUNT(DISTINCT ...)`.',
        },
      ],
      spoken: `"A join combines rows from two tables on a condition, usually a foreign key. INNER JOIN keeps only matching rows. LEFT JOIN keeps everything from the left table and puts NULLs where there's no match — I use it with WHERE right.id IS NULL to find things like users with no orders. FULL JOIN keeps unmatched rows from both sides, and a self join links a table to itself, like employees to managers. Two traps I watch for: a WHERE filter on the right table turns a LEFT JOIN into an inner one, and one-to-many joins multiply rows, which can inflate counts."`,
      mistakes: [
        'Filtering the right table in `WHERE` after a `LEFT JOIN`, which removes the unmatched rows.',
        'Forgetting that one-to-many joins duplicate the parent row, then summing or counting wrong.',
        'Missing the `ON` condition (or a wrong one) and accidentally creating a huge cross join.',
        'Not indexing the join column (usually the foreign key), which makes joins slow on big tables.',
        'Follow-up trap: "Is RIGHT JOIN ever needed?" Not really — any RIGHT JOIN can be written as a LEFT JOIN by swapping table order, which most teams prefer for readability.',
      ],
      takeaway: 'INNER = matches only, LEFT = keep all left rows, FULL = keep everything; watch WHERE-vs-ON and row multiplication.',
    },
    {
      id: 'group-by-having',
      title: 'Aggregates, GROUP BY and HAVING',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'GROUP BY squashes rows into groups so you can COUNT/SUM/AVG per group; HAVING filters the groups after they are built.',
      what: `**Aggregate functions** turn many rows into one value: \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`.

\`GROUP BY\` splits rows into groups (for example, one group per user) and runs the aggregate on each group.

- \`WHERE\` filters **rows before** grouping.
- \`HAVING\` filters **groups after** grouping. It can use aggregates, like \`HAVING COUNT(*) > 5\`.

#### Deeper version
Every column in \`SELECT\` must either be inside an aggregate or listed in \`GROUP BY\`. (Postgres allows an exception: if you group by a table's primary key, you can select that table's other columns.)

\`COUNT(*)\` counts rows. \`COUNT(col)\` counts rows where \`col\` is not NULL. \`COUNT(DISTINCT col)\` counts unique values. \`AVG\` and \`SUM\` ignore NULLs.

Postgres also has \`FILTER\` for conditional aggregates: \`COUNT(*) FILTER (WHERE status = 'paid')\`. This replaces the older \`SUM(CASE WHEN ... THEN 1 ELSE 0 END)\` trick. For multi-level totals there are \`GROUPING SETS\`, \`ROLLUP\` and \`CUBE\`.`,
      why: `Dashboards and reports are mostly aggregates: revenue per month, orders per user, active users per country. Doing this in SQL is far faster than pulling every row into Node and looping.`,
      analogy: `Imagine sorting a pile of receipts into one envelope per customer (GROUP BY), then writing the total on each envelope (SUM). WHERE is throwing away torn receipts before sorting. HAVING is throwing away envelopes whose total is too small after sorting.`,
      code: [
        {
          title: 'Orders per user with WHERE and HAVING',
          lang: 'sql',
          code: `-- orders(id, user_id, amount, status, created_at)
SELECT user_id,
       COUNT(*)            AS order_count,
       SUM(amount)         AS total_spent,
       ROUND(AVG(amount), 2) AS avg_order
FROM orders
WHERE status = 'paid'           -- row filter, before grouping
GROUP BY user_id
HAVING SUM(amount) > 1000       -- group filter, after grouping
ORDER BY total_spent DESC;`,
        },
        {
          title: 'Monthly revenue with FILTER',
          lang: 'sql',
          code: `SELECT date_trunc('month', created_at) AS month,
       COUNT(*)                                   AS all_orders,
       COUNT(*) FILTER (WHERE status = 'paid')     AS paid_orders,
       SUM(amount) FILTER (WHERE status = 'paid')  AS revenue,
       COUNT(DISTINCT user_id)                    AS unique_buyers
FROM orders
GROUP BY 1          -- 1 = first column in SELECT
ORDER BY 1;`,
        },
      ],
      output: `The first query returns one row per user who spent more than 1000 on paid orders, with their count, total and average, biggest spender first. Users whose paid total is 1000 or less are removed by \`HAVING\`.

The second query returns one row per month, for example \`2026-01-01 | 120 | 98 | 45210.00 | 61\`: all orders, paid orders, paid revenue and the number of different buyers that month.`,
      questions: [
        {
          q: 'What is the difference between WHERE and HAVING?',
          a: '`WHERE` filters individual rows before grouping and cannot use aggregates. `HAVING` filters groups after `GROUP BY` and can use aggregates like `COUNT(*) > 5`.',
        },
        {
          q: 'COUNT(*) vs COUNT(column)?',
          a: '`COUNT(*)` counts all rows. `COUNT(column)` counts only rows where that column is not NULL.',
        },
        {
          q: 'Why do I get "column must appear in the GROUP BY clause"?',
          a: 'Because you selected a column that is neither grouped nor aggregated, so Postgres does not know which value of it to show for the group. Add it to `GROUP BY` or wrap it in an aggregate.',
        },
        {
          q: 'How do you count conditionally in one query?',
          a: 'Use `COUNT(*) FILTER (WHERE condition)` in Postgres, or `SUM(CASE WHEN condition THEN 1 ELSE 0 END)` in any database.',
        },
      ],
      spoken: `"GROUP BY collapses rows into groups so I can run aggregates like COUNT, SUM and AVG per group — for example revenue per user or orders per month. WHERE filters rows before the grouping, and HAVING filters the groups afterwards, so HAVING is where aggregate conditions like SUM greater than 1000 go. Every selected column must be grouped or aggregated. In Postgres I like the FILTER clause for conditional counts, like paid orders versus all orders in one query, and I remember COUNT of a column skips NULLs."`,
      mistakes: [
        'Putting an aggregate condition in `WHERE` (like `WHERE COUNT(*) > 1`). It must go in `HAVING`.',
        'Using `HAVING` for plain row filters. It works but is slower; filter rows early in `WHERE`.',
        'Forgetting that `AVG` ignores NULLs, so the average may not be what you expect.',
        'Summing after a one-to-many join and double counting.',
        'Follow-up trap: "Can you use a SELECT alias in HAVING?" Not in standard SQL or Postgres — HAVING runs before SELECT, so repeat the expression. (`GROUP BY` and `ORDER BY` do accept aliases in Postgres.)',
      ],
      takeaway: 'WHERE filters rows, GROUP BY makes groups, aggregates summarise them, HAVING filters the groups.',
    },
    {
      id: 'sql-vs-nosql',
      title: 'SQL vs NoSQL (PostgreSQL vs MongoDB)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'SQL databases use fixed tables, joins and strong transactions; NoSQL (like MongoDB) uses flexible documents and scales out easily. Pick by data shape and access patterns.',
      what: `**SQL (relational) databases** like PostgreSQL and MySQL store data in tables with a fixed **schema** (defined columns and types). Tables link with foreign keys and you combine them with joins. They give strong **ACID** transactions.

**NoSQL databases** are everything else:
- **Document** stores: MongoDB (JSON-like documents).
- **Key-value**: Redis, DynamoDB.
- **Wide-column**: Cassandra.
- **Graph**: Neo4j.

They usually have a flexible schema and are built to **scale horizontally** (spread data over many machines).

#### Deeper version
The real difference is **data modelling**. In SQL you normalise (store each fact once) and join at read time. In MongoDB you model around queries and often embed related data in one document, so one read gets everything.

The lines have blurred:
- MongoDB has multi-document ACID transactions (since 4.0) and \`$lookup\` for joins.
- PostgreSQL has \`JSONB\` for flexible documents with indexes.

Scaling: Postgres scales up (bigger machine) and out for reads (read replicas). Writes across many nodes need sharding tools (like Citus) or app-level sharding. MongoDB has built-in sharding.`,
      why: `Interviewers ask this to check you can choose a database for a reason, not by habit. As a MERN developer you should show you know when Postgres is the better fit — money, inventory, complex reports, strong relations — and when Mongo shines.`,
      analogy: `SQL is a well-organised filing cabinet with labelled folders that must follow a template, and cross-references between folders. MongoDB is a set of self-contained boxes: each box holds everything about one thing, in whatever shape you like. The cabinet is great for cross-checking; the boxes are great for grabbing one thing fast.`,
      code: [
        {
          title: 'Same data, two models',
          lang: 'sql',
          code: `-- SQL: normalised, joined at read time
CREATE TABLE users  (id BIGINT PRIMARY KEY, name TEXT);
CREATE TABLE orders (id BIGINT PRIMARY KEY,
                     user_id BIGINT REFERENCES users(id),
                     total NUMERIC(10,2));

SELECT u.name, SUM(o.total)
FROM users u JOIN orders o ON o.user_id = u.id
GROUP BY u.name;`,
        },
        {
          title: 'MongoDB: embedded document',
          lang: 'javascript',
          code: `// One document holds the user and recent orders together
await db.collection('users').insertOne({
  _id: 1,
  name: 'Asha',
  recentOrders: [
    { id: 101, total: 500 },
    { id: 102, total: 200 },
  ],
});

// One read, no join needed
const user = await db.collection('users').findOne({ _id: 1 });
console.log(user.recentOrders.length); // 2`,
        },
      ],
      output: `The SQL version stores each order once and uses a join plus \`GROUP BY\` to total spending per user. The MongoDB version returns the user with their orders in one read, which is fast for a profile page, but updating or reporting across all orders is harder and data may be duplicated.`,
      questions: [
        {
          q: 'When would you choose PostgreSQL over MongoDB?',
          a: 'When data is strongly relational, needs complex joins and reports, or needs strict consistency — payments, orders, inventory, accounting. Also when the schema is stable and integrity rules matter.',
        },
        {
          q: 'When would you choose MongoDB?',
          a: 'When data is naturally document-shaped and read as a whole, the schema changes often, or you need easy horizontal scaling — content, catalogs, event logs, user profiles.',
        },
        {
          q: 'Does NoSQL mean no transactions?',
          a: 'Not anymore. MongoDB supports multi-document ACID transactions, but they are costlier and the data model is meant to need them less often.',
        },
        {
          q: 'Can PostgreSQL store JSON like MongoDB?',
          a: 'Yes, with `JSONB`. You can index and query inside it. Many teams use Postgres with a few JSONB columns instead of a separate document database.',
        },
      ],
      spoken: `"SQL databases like Postgres store data in tables with a fixed schema, link them with foreign keys and give strong ACID transactions, so they're great for relational data like orders and payments. NoSQL like MongoDB stores flexible documents, and I model around the queries — embedding related data so one read gets everything — and it shards easily. The gap is smaller today: Mongo has transactions and Postgres has JSONB. In practice I pick Postgres when integrity and complex reporting matter, and Mongo when data is document-shaped and changes shape often."`,
      mistakes: [
        'Saying "NoSQL is always faster" or "SQL can\'t scale". Both depend on data model, indexes and workload.',
        'Saying "MongoDB has no schema". It has a flexible schema, but your app still has one; you can enforce it with schema validation or Mongoose.',
        'Copying a normalised SQL design into MongoDB and then doing many `$lookup` joins.',
        'Follow-up trap: "How would you store money?" In Postgres use `NUMERIC`, never `FLOAT`, because floats have rounding errors. Or store integer cents.',
      ],
      takeaway: 'Choose by data shape and access patterns: relational + strict integrity → Postgres; document-shaped + flexible + easy sharding → MongoDB.',
    },
    {
      id: 'node-postgres-sql-injection',
      title: 'Querying from Node (pg) and SQL Injection',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Use the pg library with parameterized queries ($1, $2) so user input is sent as data, never glued into the SQL string.',
      what: `**node-postgres** (the \`pg\` npm package) is the standard way to talk to PostgreSQL from Node.js. You send a SQL string and get back \`result.rows\` (an array of objects).

**SQL injection** is an attack where user input changes the meaning of your SQL. It happens when you build SQL by joining strings, like \`"... WHERE email = '" + email + "'"\`.

The fix is **parameterized queries**: write placeholders \`$1\`, \`$2\` in the SQL and pass the values in a separate array. The database treats them as plain values, never as code.

#### Deeper version
With parameters, \`pg\` sends the SQL text and the values separately (the extended query protocol). The server parses the SQL **before** it sees the values, so a value can never become a keyword.

Placeholders work only for **values**. You cannot use \`$1\` for a table name, column name or sort direction. For those, use an **allow-list** in code (for example only \`'asc'\` or \`'desc'\`), or \`pg-format\`-style identifier escaping.

ORMs and query builders (Prisma, Knex, Drizzle) parameterize for you — but their "raw" escape hatches can still be unsafe if you build strings yourself.`,
      why: `SQL injection is one of the most common and most damaging web vulnerabilities (it is in the OWASP Top 10). One unsafe query can leak or delete the whole database. Interviewers expect you to name parameterized queries immediately.`,
      analogy: `String-building SQL is like letting a customer write directly on the cheque you sign — they can add extra zeros. Parameterized queries are like a printed form with fixed boxes: whatever they write stays inside the "amount" box and can't change the rest of the cheque.`,
      code: [
        {
          title: 'Safe vs unsafe queries with pg',
          lang: 'javascript',
          code: `import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// UNSAFE: input becomes part of the SQL
// email = "x' OR '1'='1"  -> returns every user!
async function findUserUnsafe(email) {
  const sql = "SELECT * FROM users WHERE email = '" + email + "'";
  return (await pool.query(sql)).rows;
}

// SAFE: $1 is a placeholder, value is sent separately
async function findUser(email) {
  const { rows } = await pool.query(
    'SELECT id, name, email FROM users WHERE email = $1',
    [email]
  );
  return rows[0] ?? null;
}

// Insert and get the new row back
async function createUser(name, email) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name',
    [name, email]
  );
  return rows[0];
}`,
        },
        {
          title: 'Dynamic sort: allow-list identifiers',
          lang: 'javascript',
          code: `// $1 cannot be used for a column name or ASC/DESC
const SORT_COLUMNS = { name: 'name', created: 'created_at' };

async function listUsers({ sort = 'created', dir = 'desc', limit = 20 }) {
  const column = SORT_COLUMNS[sort] ?? 'created_at';        // allow-list
  const direction = dir === 'asc' ? 'ASC' : 'DESC';         // allow-list
  const sql = 'SELECT id, name FROM users ORDER BY ' + column + ' ' + direction + ' LIMIT $1';
  const { rows } = await pool.query(sql, [Math.min(limit, 100)]);
  return rows;
}`,
        },
      ],
      output: `With the unsafe function, the input \`x' OR '1'='1\` turns the query into \`WHERE email = 'x' OR '1'='1'\`, which is always true, so every user is returned. With the safe version the database looks for a user whose email is literally that whole string, finds none and returns \`null\`.

The sort example only ever puts known column names and \`ASC\`/\`DESC\` into the SQL, so user input cannot inject anything, and the limit is still a parameter.`,
      questions: [
        {
          q: 'What is SQL injection and how do you prevent it?',
          a: 'It is when user input is mixed into SQL text and changes the query. Prevent it with parameterized queries (`$1`, `$2` with a values array), plus least-privilege database users and input validation.',
        },
        {
          q: 'Can you parameterize a table or column name?',
          a: 'No, placeholders are only for values. For identifiers use an allow-list in code or a proper identifier-escaping helper.',
        },
        {
          q: 'Does using an ORM make you fully safe?',
          a: 'Mostly, since ORMs parameterize normal queries. But raw-query helpers can be unsafe if you concatenate strings. In Prisma, `$queryRaw` with a tagged template is parameterized, while `$queryRawUnsafe` is not.',
        },
        {
          q: 'What does pool.query return?',
          a: 'A result object. The useful parts are `rows` (array of row objects), `rowCount` (rows affected) and `fields` (column info).',
        },
      ],
      spoken: `"In Node I use the pg library, usually through a Pool, and I always write parameterized queries — placeholders like dollar-one, dollar-two in the SQL and the values in a separate array. That way the database parses the query first and treats input purely as data, which prevents SQL injection. Placeholders only work for values, so for dynamic things like sort columns I use an allow-list. Even with Prisma I'm careful with raw queries: the tagged template version is safe, but the 'unsafe' string version isn't."`,
      mistakes: [
        'Building SQL with string concatenation or template literals around user input.',
        'Trying to pass a column name or `ASC/DESC` as `$1` — it is treated as a value, so it does not work as expected.',
        'Escaping quotes by hand instead of using parameters. Hand-made escaping always misses a case.',
        'Connecting as a superuser from the app. Use a limited role so an injection can do less damage.',
        'Follow-up trap: "Is input validation enough to stop SQL injection?" No. Validation helps, but parameterized queries are the real fix.',
      ],
      takeaway: 'Never glue user input into SQL — use $1-style parameters for values and allow-lists for identifiers.',
    },
    {
      id: 'subqueries',
      title: 'Subqueries, IN, EXISTS and Correlated Subqueries',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A subquery is a query inside another query; use it for filters, computed values and "exists / not exists" checks.',
      what: `A **subquery** is a \`SELECT\` written inside another query, in brackets. It can appear:

- In \`WHERE\`: \`WHERE id IN (SELECT user_id FROM orders)\`.
- In \`FROM\`: treat a result as a temporary table (needs an alias).
- In \`SELECT\`: compute one value per row (a **scalar subquery**, must return one value).

A **correlated subquery** uses a column from the outer query, so it logically runs once per outer row.

#### Deeper version
\`EXISTS\` returns true as soon as one matching row is found, so it can stop early. \`NOT EXISTS\` is the safe way to write "rows with no match".

**The NOT IN trap:** if the subquery returns even one \`NULL\`, \`x NOT IN (...)\` returns no rows at all, because comparing with NULL gives "unknown". \`NOT EXISTS\` does not have this problem.

The Postgres planner often rewrites \`IN\` and \`EXISTS\` subqueries into joins (semi-joins and anti-joins), so performance is usually similar. Correlated scalar subqueries in \`SELECT\` can still be slow on big tables; a join plus \`GROUP BY\` or a \`LATERAL\` join is often better.`,
      why: `Subqueries let you answer questions in steps: "users who ordered", "products priced above average", "customers with no orders". They are also the building block for interview classics like "second highest salary".`,
      analogy: `A subquery is like asking a colleague a quick side question before answering your boss. "Which customers are VIP?" — "Let me first ask finance who spent over 1 lakh" (the subquery), then you use that list for your answer.`,
      code: [
        {
          title: 'Three places a subquery can go',
          lang: 'sql',
          code: `-- In WHERE: products priced above the average
SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- In FROM: aggregate first, then filter (derived table)
SELECT t.user_id, t.total
FROM (
  SELECT user_id, SUM(amount) AS total
  FROM orders
  GROUP BY user_id
) AS t
WHERE t.total > 1000;

-- In SELECT: correlated scalar subquery (one value per user)
SELECT u.name,
       (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;`,
        },
        {
          title: 'EXISTS vs NOT IN with NULL',
          lang: 'sql',
          code: `-- Users who placed at least one order
SELECT u.name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- Users with no orders: safe
SELECT u.name FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- DANGER: if any orders.user_id is NULL, this returns ZERO rows
SELECT u.name FROM users u
WHERE u.id NOT IN (SELECT user_id FROM orders);`,
        },
      ],
      output: `The first block returns products more expensive than the average, users whose total spending is over 1000, and every user with their order count (0 for users without orders, because \`COUNT\` of no rows is 0).

In the second block, \`EXISTS\` returns buyers and \`NOT EXISTS\` returns non-buyers. The \`NOT IN\` query works until one order has \`user_id = NULL\`; then it silently returns nothing.`,
      questions: [
        {
          q: 'What is a correlated subquery?',
          a: 'A subquery that refers to a column of the outer query, like `WHERE o.user_id = u.id`. Logically it runs once for each outer row.',
        },
        {
          q: 'IN vs EXISTS — which is better?',
          a: 'For positive checks Postgres usually plans them the same. `EXISTS` is clearer for "is there any match" and stops at the first match. For negative checks prefer `NOT EXISTS` over `NOT IN` because of NULLs.',
        },
        {
          q: 'Why can NOT IN return no rows?',
          a: 'If the subquery has a NULL, `x NOT IN (..., NULL)` becomes unknown for every row, so nothing passes the filter.',
        },
        {
          q: 'Subquery or join?',
          a: 'Use whatever reads best; the planner often turns them into the same plan. Use joins when you need columns from both tables; use `EXISTS` when you only need to check presence.',
        },
      ],
      spoken: `"A subquery is a query inside another one. I use them in WHERE for filters like 'price above average', in FROM as a derived table when I want to aggregate first, and in SELECT for one computed value per row. A correlated subquery references the outer row. For 'has a match' checks I use EXISTS, and for 'no match' I use NOT EXISTS rather than NOT IN, because NOT IN returns nothing if the subquery contains a NULL. Postgres usually turns these into semi- or anti-joins, so they're not automatically slow."`,
      mistakes: [
        'Using `NOT IN` with a subquery that can return NULL.',
        'Writing a scalar subquery that returns more than one row — Postgres throws "more than one row returned by a subquery".',
        'Forgetting the alias on a subquery in `FROM` (Postgres requires it in most versions).',
        'Using many correlated subqueries in `SELECT` on large tables instead of one join with `GROUP BY`.',
        'Follow-up trap: "How would you rewrite NOT IN safely?" Use `NOT EXISTS`, or a `LEFT JOIN ... WHERE right.id IS NULL`.',
      ],
      takeaway: 'Subqueries answer questions in steps; prefer EXISTS / NOT EXISTS, and never trust NOT IN with NULLs.',
    },
    {
      id: 'indexes',
      title: 'Indexes: B-tree, GIN, Composite, and When They Are Not Used',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'An index is a sorted lookup structure that makes reads fast but writes slower; know B-tree vs GIN, column order in composite indexes, and why the planner may skip an index.',
      what: `An **index** is an extra data structure that helps the database find rows without reading the whole table. Without an index, Postgres does a **sequential scan** (reads every row).

Main index types in Postgres:

- **B-tree** (the default): sorted tree. Good for \`=\`, \`<\`, \`>\`, \`BETWEEN\`, \`ORDER BY\`, and \`LIKE 'abc%'\` (prefix, with the right collation/operator class).
- **GIN** (Generalized Inverted Index): for values that contain many items — \`JSONB\`, arrays, full-text search.
- Others: **Hash** (only \`=\`), **GiST** (geometry, ranges), **BRIN** (huge tables where data is naturally ordered, like time-series).

A **composite index** covers several columns, like \`(user_id, created_at)\`.

#### Deeper version
**Leftmost prefix rule:** an index on \`(a, b, c)\` helps queries filtering on \`a\`, or \`a\` and \`b\`, or all three. It helps much less for a query only on \`b\`. Put equality columns first, then range/sort columns.

**When an index is not used:**
- The query returns a large part of the table — a sequential scan is cheaper.
- A function or cast wraps the column: \`WHERE lower(email) = ...\` (fix: an **expression index** on \`lower(email)\`).
- \`LIKE '%abc'\` (leading wildcard) on a B-tree. Use a trigram GIN index (\`pg_trgm\`).
- Type mismatch between column and value.
- Table statistics are stale — run \`ANALYZE\`.
- The table is tiny.

Other tools: **partial index** (\`WHERE deleted_at IS NULL\`), **covering index** with \`INCLUDE\` for **index-only scans**, and \`CREATE INDEX CONCURRENTLY\` to build without blocking writes.

**Cost:** every index slows \`INSERT\`/\`UPDATE\`/\`DELETE\` and uses disk. Do not index everything.`,
      why: `Indexes are the number one fix for slow queries. A query that scans 10 million rows can drop from seconds to milliseconds with the right index. Interviewers want to see that you know both the benefit and the cost.`,
      analogy: `An index is the index at the back of a textbook. To find "photosynthesis" you jump to the page number instead of reading the whole book. A composite index is like a phone book sorted by last name, then first name: great for "Sharma, Priya", useless for "everyone named Priya".`,
      code: [
        {
          title: 'Creating the right indexes',
          lang: 'sql',
          code: `-- B-tree (default) for lookups by email
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- Composite: "my orders, newest first"
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
-- Helps:   WHERE user_id = 5 ORDER BY created_at DESC LIMIT 20
-- Helps:   WHERE user_id = 5
-- Not much: WHERE created_at > now() - interval '1 day'  (skips the first column)

-- Expression index for case-insensitive login
CREATE INDEX idx_users_lower_email ON users (lower(email));
-- Now used by: WHERE lower(email) = lower($1)

-- Partial index: only active rows
CREATE INDEX idx_orders_pending ON orders (created_at) WHERE status = 'pending';

-- GIN for JSONB containment queries
CREATE INDEX idx_products_attrs ON products USING GIN (attributes);
-- Used by: WHERE attributes @> '{"color": "red"}'

-- Build on a live table without blocking writes
CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);`,
        },
        {
          title: 'Why is my index ignored?',
          lang: 'sql',
          code: `-- Index on users(email) exists, but:
SELECT * FROM users WHERE lower(email) = 'a@x.com';  -- function on column: not used
SELECT * FROM users WHERE email LIKE '%@gmail.com';  -- leading wildcard: not used

-- Check what the planner does
EXPLAIN SELECT * FROM users WHERE email = 'a@x.com';
-- Index Scan using idx_users_email on users ...

-- Refresh statistics if plans look wrong
ANALYZE users;`,
        },
      ],
      output: `With \`idx_orders_user_created\`, "latest 20 orders of user 5" becomes an index scan that reads about 20 entries instead of the whole table, and no extra sort is needed because the index is already in that order.

\`EXPLAIN\` shows \`Index Scan\` when the index is used and \`Seq Scan\` when it is not. The queries with \`lower(email)\` (without the expression index) and the leading \`%\` wildcard show \`Seq Scan\`.`,
      questions: [
        {
          q: 'How does a B-tree index speed up queries?',
          a: 'It keeps keys sorted in a balanced tree, so finding a value takes a few page reads (logarithmic) instead of scanning all rows. It also returns rows in sorted order, which helps `ORDER BY` and ranges.',
        },
        {
          q: 'Does column order matter in a composite index?',
          a: 'Yes. An index on `(a, b)` works for filters on `a` or on `a` and `b`, but not well for `b` alone. Put equality filter columns first and range or sort columns last.',
        },
        {
          q: 'When would you use a GIN index?',
          a: 'For "contains" style queries on multi-value data: JSONB (`@>`, `?`), arrays, and full-text search (`tsvector`). Also with `pg_trgm` for `LIKE \'%text%\'` searches.',
        },
        {
          q: 'Why might Postgres not use an index that exists?',
          a: 'The query returns many rows so a sequential scan is cheaper, a function or cast wraps the column, a leading wildcard is used, statistics are stale, or the column order of a composite index does not match the query.',
        },
        {
          q: 'What are the downsides of indexes?',
          a: 'They slow down writes (each index is updated on insert/update/delete), use disk and memory, and need maintenance. Unused indexes are pure cost.',
        },
      ],
      spoken: `"An index is a separate structure that lets Postgres find rows without scanning the whole table. The default is a B-tree, which handles equality, ranges and sorting. For JSONB, arrays and full-text search I use GIN. With composite indexes column order matters — equality columns first, then range or sort columns — because of the leftmost prefix rule. The planner may skip an index if the query returns a large share of rows, if I wrap the column in a function, or if statistics are stale, so I always check with EXPLAIN ANALYZE. And I remember indexes cost write speed, so I add them for real query patterns."`,
      mistakes: [
        'Indexing every column "just in case". Each index slows writes and uses memory.',
        'Creating `(created_at, user_id)` when queries filter by `user_id` and sort by `created_at` — wrong column order.',
        'Wrapping indexed columns in functions (`lower(email)`, `date(created_at)`) and wondering why the index is ignored.',
        'Running plain `CREATE INDEX` on a big production table — it blocks writes. Use `CONCURRENTLY`.',
        'Follow-up trap: "Is an index scan always faster than a seq scan?" No. For a large fraction of rows, a sequential scan is faster because it reads pages in order and avoids random jumps.',
      ],
      takeaway: 'Index for your real query patterns, mind composite column order and functions on columns, and verify with EXPLAIN.',
    },
    {
      id: 'normalization',
      title: 'Normalization (1NF, 2NF, 3NF) and Denormalization',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Normalization stores each fact once to avoid update bugs; denormalization copies data on purpose to make reads faster.',
      what: `**Normalization** is organising tables so each fact is stored **once**. This avoids **anomalies** (bugs where copies of the same data disagree).

The normal forms, simply:

1. **1NF** — each cell holds one value (no lists like \`"red,blue"\`), and each row is unique.
2. **2NF** — 1NF, and every non-key column depends on the **whole** primary key (matters when the key has several columns).
3. **3NF** — 2NF, and non-key columns depend **only on the key**, not on other non-key columns.

A short way to remember 3NF: "every column depends on the key, the whole key, and nothing but the key."

**Denormalization** is the opposite: copying data on purpose (like storing \`customer_name\` on orders, or a \`comment_count\` on posts) to make reads faster.

#### Deeper version
The three anomalies normalization prevents:
- **Update anomaly**: a customer's city is stored in 50 order rows; you update 49.
- **Insert anomaly**: you cannot add a new product until someone orders it.
- **Delete anomaly**: deleting the last order also deletes the only record of a customer.

**BCNF** (Boyce-Codd) is a slightly stricter 3NF; rarely asked in detail.

**Denormalization trade-offs:** faster reads and fewer joins, but more storage, harder writes, and the risk of copies drifting apart. Keep copies in sync with transactions, triggers, or background jobs — or use **materialized views**. Some copies are correct on purpose: an order should keep the **price at the time of purchase**, not the current price.`,
      why: `Good normalization keeps data correct as the app grows. Smart denormalization keeps hot pages fast. Interviewers ask this to see if you can design a schema and explain trade-offs, not just recite definitions.`,
      analogy: `Normalization is like keeping one master contact list on your phone instead of writing a friend's number in every chat note. If they change numbers, you update one place. Denormalization is writing their number on a sticky note on your fridge too — faster to find, but you must remember to update it.`,
      code: [
        {
          title: 'From messy to 3NF',
          lang: 'sql',
          code: `-- NOT normalized: lists in a cell, customer data repeated per order
-- orders_bad(order_id, customer_name, customer_city, products)
-- (1, 'Asha', 'Pune', 'Pen,Book')
-- (2, 'Asha', 'Pune', 'Bag')

-- 3NF design
CREATE TABLE customers (
  id   BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT                              -- stored once
);
CREATE TABLE products (
  id    BIGINT PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL
);
CREATE TABLE orders (
  id          BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id)
);
CREATE TABLE order_items (               -- one row per product per order (1NF)
  order_id   BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id),
  quantity   INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,     -- price at purchase time (intentional copy)
  PRIMARY KEY (order_id, product_id)
);`,
        },
        {
          title: 'A deliberate denormalized counter',
          lang: 'sql',
          code: `ALTER TABLE posts ADD COLUMN comment_count INT NOT NULL DEFAULT 0;

-- Keep it in sync in the same transaction as the insert
BEGIN;
INSERT INTO comments (post_id, body) VALUES (42, 'Nice post');
UPDATE posts SET comment_count = comment_count + 1 WHERE id = 42;
COMMIT;`,
        },
      ],
      output: `In the bad table, changing Asha's city means editing every order row, and "Pen,Book" cannot be indexed or joined properly. In the 3NF design the city lives once in \`customers\`, each product in an order is its own row in \`order_items\`, and \`unit_price\` is copied on purpose so old invoices stay correct when prices change.

The counter example lets a feed show comment counts without running \`COUNT(*)\` per post, at the cost of one extra update on every new comment.`,
      questions: [
        {
          q: 'Explain 1NF, 2NF and 3NF simply.',
          a: '1NF: one value per cell, no repeating groups. 2NF: no column depends on only part of a composite key. 3NF: no column depends on another non-key column. Each fact lives in one place.',
        },
        {
          q: 'What problems does normalization solve?',
          a: 'Update, insert and delete anomalies — data getting out of sync because it is stored in many places — plus wasted storage.',
        },
        {
          q: 'When would you denormalize?',
          a: 'When reads are much more frequent than writes and joins or aggregates are a measured bottleneck: counters, feeds, reporting tables, search documents. Keep the copy in sync with transactions, triggers, jobs or a materialized view.',
        },
        {
          q: 'Is storing price on order_items a violation of normalization?',
          a: 'No, because it is a different fact: the price at the time of purchase. The current price lives on the product.',
        },
      ],
      spoken: `"Normalization means storing each fact once so the data can't contradict itself. First normal form means one value per cell, second means no column depends on only part of a composite key, and third means non-key columns depend only on the key, not on each other. That prevents update, insert and delete anomalies. In real systems I normalize first, then denormalize where I've measured a read bottleneck — like a comment count on posts or a reporting table — and I keep the copy in sync with a transaction, trigger or background job."`,
      mistakes: [
        'Storing comma-separated lists in a column instead of a child table (or a proper array/JSONB with a reason).',
        'Denormalizing early "for speed" without measuring, then fighting sync bugs.',
        'Over-normalizing into many tiny tables so every page needs 8 joins.',
        'Treating historical values (price at purchase, address at shipping time) as duplicates and removing them.',
        'Follow-up trap: "Isn\'t MongoDB embedding just denormalization?" Yes, largely — document databases favour denormalized, query-shaped data, and accept the update cost.',
      ],
      takeaway: 'Normalize to keep data correct; denormalize deliberately, with a sync plan, where reads need it.',
    },
    {
      id: 'transactions',
      title: 'Transactions: BEGIN, COMMIT, ROLLBACK',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A transaction groups several statements so they all succeed or all fail together; in Node you must run them on one client from the pool.',
      what: `A **transaction** is a group of SQL statements treated as one unit of work. Either **all** of them are saved, or **none** are.

- \`BEGIN\` starts the transaction.
- \`COMMIT\` saves all changes.
- \`ROLLBACK\` cancels all changes since \`BEGIN\`.

Classic example: transfer money. "Take 100 from A" and "add 100 to B" must both happen, or neither.

Outside an explicit \`BEGIN\`, every single statement in Postgres is its own small transaction (**autocommit**).

#### Deeper version
**Savepoints** let you roll back part of a transaction: \`SAVEPOINT s1\` ... \`ROLLBACK TO s1\`.

In Postgres, once any statement fails inside a transaction, the transaction is **aborted**: every following statement errors until you \`ROLLBACK\`.

**In Node with a pool**, \`pool.query()\` may send each call to a **different connection**. A transaction lives on one connection, so you must \`pool.connect()\` to get one client, run \`BEGIN\` ... \`COMMIT\` on it, and always \`release()\` it in \`finally\`.

Keep transactions **short**. Long transactions hold locks and block cleanup (VACUUM). Never wait for an external API call (Stripe, email, an LLM) while a transaction is open.`,
      why: `Without transactions a crash or error halfway leaves data half-updated: money taken but not delivered, an order without its items, stock reduced for a failed payment. Transactions keep the database consistent.`,
      analogy: `A transaction is like an online shopping cart checkout. You add many items, but nothing is bought until you press "Place order" (COMMIT). If your card fails, the whole order is cancelled (ROLLBACK) — you never end up paying for half the cart.`,
      code: [
        {
          title: 'Money transfer in SQL',
          lang: 'sql',
          code: `BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If anything above failed, run ROLLBACK instead
COMMIT;`,
        },
        {
          title: 'Transaction helper with node-postgres',
          lang: 'javascript',
          code: `import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Runs fn inside one transaction on ONE client
async function withTransaction(fn) {
  const client = await pool.connect();       // same connection for all queries
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');          // undo everything
    throw err;
  } finally {
    client.release();                        // ALWAYS give it back to the pool
  }
}

await withTransaction(async (client) => {
  const { rows } = await client.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING balance',
    [100, 1]
  );
  if (rows.length === 0) throw new Error('Insufficient funds');
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2]);
});`,
        },
        {
          title: 'Same thing with Prisma',
          lang: 'javascript',
          code: `// Interactive transaction: all queries use tx
await prisma.$transaction(async (tx) => {
  await tx.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } });
  await tx.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } });
});`,
        },
      ],
      output: `If both updates succeed, \`COMMIT\` saves them together. If account 1 has less than 100, the first update returns no rows, the code throws, \`ROLLBACK\` runs, and neither balance changes. The client is released back to the pool either way.

The Prisma version behaves the same: if the callback throws, Prisma rolls back.`,
      questions: [
        {
          q: 'What is a transaction?',
          a: 'A group of statements that succeed or fail as one unit. You start with `BEGIN` and end with `COMMIT` (save) or `ROLLBACK` (undo).',
        },
        {
          q: 'Why can\'t you do a transaction with pool.query in pg?',
          a: 'Each `pool.query` may use a different connection, but a transaction belongs to one connection. Use `pool.connect()` to get one client, run all statements on it, then `release()` it.',
        },
        {
          q: 'What happens in Postgres after an error inside a transaction?',
          a: 'The transaction is marked aborted. All further statements fail with "current transaction is aborted" until you `ROLLBACK` (or roll back to a savepoint).',
        },
        {
          q: 'Should you call a payment API inside a database transaction?',
          a: 'No. It keeps locks open for seconds, and you cannot roll back the external call anyway. Commit a "pending" state, call the API, then update the status — and make it idempotent.',
        },
      ],
      spoken: `"A transaction groups statements so they all succeed or all fail — like debiting one account and crediting another. I start with BEGIN and finish with COMMIT, or ROLLBACK on any error. In Node with pg, I get a dedicated client from the pool with pool.connect, because pool.query might hit different connections, and I always release the client in a finally block. With Prisma I use the interactive dollar-transaction. I keep transactions short and never call external APIs like Stripe inside them; I save a pending state, call the API, then update."`,
      mistakes: [
        'Calling `pool.query(\'BEGIN\')` then `pool.query(...)` — the statements may run on different connections, so there is no real transaction.',
        'Forgetting `client.release()` in `finally`, which leaks connections until the pool is exhausted and the app hangs.',
        'Doing slow external work (HTTP calls, file uploads) while a transaction holds row locks.',
        'Not checking the result of a conditional update (`rowCount === 0`) and committing anyway.',
        'Follow-up trap: "Do transactions stop two users from overbooking the last seat?" Not by themselves in READ COMMITTED. You also need a lock (`SELECT ... FOR UPDATE`), an atomic conditional update, a constraint, or a stricter isolation level.',
      ],
      takeaway: 'BEGIN … COMMIT/ROLLBACK makes many statements all-or-nothing — on one client, kept short, with no external calls inside.',
    },
    {
      id: 'acid',
      title: 'ACID Properties',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Atomicity, Consistency, Isolation, Durability — the four guarantees that make database transactions reliable.',
      what: `**ACID** is a list of four promises a database makes about transactions:

- **A — Atomicity:** all or nothing. If one step fails, everything is undone.
- **C — Consistency:** a transaction moves the database from one valid state to another. Rules (constraints, foreign keys, checks) are never broken at commit.
- **I — Isolation:** transactions running at the same time do not mess each other up. Each behaves as if it were (more or less) alone.
- **D — Durability:** once \`COMMIT\` returns, the data survives a crash or power cut.

#### Deeper version
How Postgres delivers each:
- **Atomicity** — every row version is tagged with the transaction id; if the transaction aborts, its row versions are simply never visible.
- **Consistency** — constraints, foreign keys and triggers are checked (some can be \`DEFERRABLE\` until commit). Your app logic also matters.
- **Isolation** — **MVCC** (Multi-Version Concurrency Control) plus locks, with configurable isolation levels. The default (Read Committed) is **not** full isolation; only Serializable behaves like transactions ran one after another.
- **Durability** — the **WAL** (Write-Ahead Log). Changes are written and flushed to the log before commit returns, so after a crash Postgres replays the log.

Note: the "C" in ACID is not the same as the "C" in the CAP theorem. ACID consistency = rules are kept. CAP consistency = every node returns the latest write.`,
      why: `ACID is why we trust relational databases with money, orders and inventory. Knowing which property protects against which failure (crash, concurrency, bad data) helps you design safe systems and explain trade-offs versus NoSQL or eventually consistent stores.`,
      analogy: `Think of an ATM withdrawal. Atomicity: you never get "money deducted but no cash". Consistency: your balance can't go below the allowed limit. Isolation: you and your spouse withdrawing at the same time don't both spend the same rupee. Durability: once the receipt prints, a bank power cut won't undo it.`,
      code: [
        {
          title: 'Seeing atomicity and consistency',
          lang: 'sql',
          code: `CREATE TABLE accounts (
  id      INT PRIMARY KEY,
  balance NUMERIC NOT NULL CHECK (balance >= 0)   -- consistency rule
);
INSERT INTO accounts VALUES (1, 50), (2, 0);

BEGIN;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- works
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- ERROR: violates check
COMMIT;   -- Postgres turns this into ROLLBACK because the transaction failed

SELECT * FROM accounts;
-- 1 | 50
-- 2 | 0     <- the first update was undone too (atomicity)`,
        },
      ],
      output: `The second update would make account 1 negative, so the \`CHECK\` constraint fails. Because of atomicity the whole transaction is undone — including the +100 on account 2. When you send \`COMMIT\` on a failed transaction, Postgres replies with \`ROLLBACK\`. The final table is unchanged: 50 and 0.`,
      questions: [
        {
          q: 'What does ACID stand for?',
          a: 'Atomicity (all or nothing), Consistency (rules always hold), Isolation (concurrent transactions don\'t interfere), Durability (committed data survives crashes).',
        },
        {
          q: 'How does Postgres guarantee durability?',
          a: 'With the Write-Ahead Log. Changes are written to the WAL and flushed to disk before commit returns; after a crash the WAL is replayed.',
        },
        {
          q: 'Is the default isolation in Postgres fully isolated?',
          a: 'No. The default is Read Committed, which allows non-repeatable reads and phantoms. Full isolation is the Serializable level.',
        },
        {
          q: 'Is ACID consistency the same as CAP consistency?',
          a: 'No. ACID consistency means data obeys rules and constraints. CAP consistency means all nodes see the same latest data.',
        },
      ],
      spoken: `"ACID describes what a reliable transaction guarantees. Atomicity means all or nothing — if one statement fails, everything rolls back. Consistency means the database moves between valid states, so constraints and foreign keys always hold. Isolation means concurrent transactions don't corrupt each other; in Postgres that's done with MVCC and isolation levels, and the default Read Committed is not the strongest. Durability means once commit returns, the data survives a crash, which Postgres does with the write-ahead log. I also keep in mind that ACID's C is different from the C in CAP."`,
      mistakes: [
        'Saying isolation means transactions are completely separated by default. Only Serializable gives that; Read Committed allows some anomalies.',
        'Mixing up ACID consistency with CAP consistency.',
        'Thinking ACID protects business rules you never told the database about. If there is no constraint, the database cannot enforce it.',
        'Follow-up trap: "Can you turn off durability in Postgres?" Partly — `synchronous_commit = off` makes commits faster but a crash can lose the last few transactions (the data stays consistent, just slightly behind). Unlogged tables are not crash-safe at all.',
      ],
      takeaway: 'ACID = all-or-nothing, rules always hold, concurrent work stays separate, committed data survives crashes.',
    },
    {
      id: 'ctes',
      title: 'CTEs (WITH) and Recursive CTEs',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A CTE is a named temporary result you define with WITH and use in the main query; a recursive CTE walks trees like org charts and category hierarchies.',
      what: `A **CTE** (Common Table Expression) is a named sub-result you write at the top of a query with \`WITH name AS (...)\`. The main query can then use \`name\` like a table.

It does the same job as a subquery, but it is easier to read: you build the answer in steps, top to bottom.

A **recursive CTE** (\`WITH RECURSIVE\`) refers to itself. It is used for **hierarchies**: org charts, category trees, comment threads, folder paths.

#### Deeper version
A recursive CTE has two parts joined with \`UNION ALL\`:
1. The **anchor** — the starting rows (for example, the CEO).
2. The **recursive part** — joins the table to the rows found so far (employees whose manager is in the result).

Postgres repeats step 2 until no new rows appear. Add a depth column or a cycle check so bad data cannot loop forever (Postgres 14+ also has a \`CYCLE\` clause).

**Performance note:** before Postgres 12, every CTE was an "optimization fence" — always computed fully on its own. Since 12, simple non-recursive CTEs that are used once are inlined into the main query. You can force behaviour with \`AS MATERIALIZED\` or \`AS NOT MATERIALIZED\`.

CTEs can also contain \`INSERT/UPDATE/DELETE ... RETURNING\` (**data-modifying CTEs**), letting you move rows between tables in one statement.`,
      why: `Long reports with nested subqueries are hard to read and debug. CTEs make each step named and testable. Recursive CTEs solve tree problems in one query instead of many round trips from Node.`,
      analogy: `A CTE is like doing rough work on the side of an exam paper: "Step 1: total per user. Step 2: average of totals. Step 3: users above average." A recursive CTE is like tracing a family tree: start with grandpa, find his children, then their children, until there is nobody left.`,
      code: [
        {
          title: 'Readable steps with a CTE',
          lang: 'sql',
          code: `WITH user_totals AS (
  SELECT user_id, SUM(amount) AS total
  FROM orders
  WHERE status = 'paid'
  GROUP BY user_id
),
avg_total AS (
  SELECT AVG(total) AS avg_value FROM user_totals
)
SELECT ut.user_id, ut.total
FROM user_totals ut, avg_total a
WHERE ut.total > a.avg_value
ORDER BY ut.total DESC;`,
        },
        {
          title: 'Recursive CTE: full reporting chain',
          lang: 'sql',
          code: `-- employees(id, name, manager_id)
WITH RECURSIVE org AS (
  -- anchor: start at the top
  SELECT id, name, manager_id, 1 AS depth
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- recursive step: people who report to someone already in org
  SELECT e.id, e.name, e.manager_id, org.depth + 1
  FROM employees e
  JOIN org ON e.manager_id = org.id
  WHERE org.depth < 20            -- safety stop against cycles
)
SELECT repeat('  ', depth - 1) || name AS tree, depth
FROM org
ORDER BY depth, name;`,
        },
      ],
      output: `The first query lists users whose paid total is above the average paid total, biggest first. Each step has a name, so it is easy to run \`user_totals\` alone while debugging.

The recursive query prints the org chart, for example:
\`CEO\` (depth 1), \`  Priya\` (depth 2), \`    Karan\` (depth 3). It starts from the CEO and keeps adding the next level until no one is left.`,
      questions: [
        {
          q: 'What is a CTE and why use it over a subquery?',
          a: 'A named temporary result defined with `WITH`. It makes complex queries readable, lets you reuse a result several times in one query, and supports recursion.',
        },
        {
          q: 'How does a recursive CTE work?',
          a: 'An anchor query gives the starting rows, then a recursive query joined with `UNION ALL` keeps adding rows related to the previous ones until no new rows are produced.',
        },
        {
          q: 'Are CTEs slower than subqueries in Postgres?',
          a: 'Before version 12 they were always materialized, which could block optimizations. Since 12, simple CTEs used once are inlined, so performance is usually the same. Use `MATERIALIZED` / `NOT MATERIALIZED` to control it.',
        },
        {
          q: 'Give real uses of recursive CTEs.',
          a: 'Org charts, category trees in e-commerce, threaded comments, folder paths, bill of materials, and graph walks like "friends of friends".',
        },
      ],
      spoken: `"A CTE is a named, temporary result set I define with WITH at the top of a query, and then use like a table. I use them to break big reports into readable steps. A recursive CTE has an anchor part and a recursive part joined with UNION ALL, and Postgres keeps running the recursive part until no new rows come back — perfect for org charts or category trees. I add a depth limit to guard against cycles. On performance, since Postgres 12 simple CTEs are inlined, so they're not the optimization fence they used to be."`,
      mistakes: [
        'Writing a recursive CTE without a stop condition on data that may contain a cycle — it runs forever (or until memory runs out).',
        'Using `UNION` instead of `UNION ALL` without reason — `UNION` removes duplicates and costs extra work.',
        'Assuming CTE results are cached across queries. A CTE exists only for that one statement.',
        'Follow-up trap: "CTE vs temp table?" A CTE lives for one statement; a temporary table lives for the session, can be indexed and reused across many statements.',
      ],
      takeaway: 'Use WITH to write queries in readable steps, and WITH RECURSIVE to walk trees — always with a stop condition.',
    },
    {
      id: 'views-materialized-views',
      title: 'Views and Materialized Views',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A view is a saved query that runs every time; a materialized view stores the result and must be refreshed.',
      what: `A **view** is a saved \`SELECT\` with a name. You query it like a table, but it stores no data — Postgres runs the underlying query each time.

A **materialized view** runs the query once and **stores the result** on disk. Reading it is fast, but the data is a snapshot. You update it with \`REFRESH MATERIALIZED VIEW\`.

#### Deeper version
**Views** are good for: hiding complex joins, giving a stable "API" over changing tables, and security (grant access to the view but not the base table). Simple views (one table, no aggregates) are **updatable** — you can \`INSERT/UPDATE\` through them.

**Materialized views** are good for: heavy dashboards and reports where slightly stale data is fine.
- You can add indexes on a materialized view.
- Plain \`REFRESH\` locks the view against reads while it rebuilds.
- \`REFRESH MATERIALIZED VIEW CONCURRENTLY\` keeps it readable, but needs a **unique index** on the view.
- Postgres does not refresh it automatically. Use a cron job (\`pg_cron\` or a Node scheduler) or a trigger-based approach.
- Refresh rebuilds the whole result each time (no built-in incremental refresh).`,
      why: `Views keep complex SQL in one place so every service uses the same definition of "active user" or "monthly revenue". Materialized views turn a 5-second analytics query into a 5-millisecond read, which is perfect for admin dashboards.`,
      analogy: `A view is like a saved Google search: every time you click it, it searches again and shows fresh results. A materialized view is like a printed report: instant to read, but it only shows data as of when it was printed until you print again.`,
      code: [
        {
          title: 'View vs materialized view',
          lang: 'sql',
          code: `-- A view: always fresh, runs the join every time
CREATE VIEW active_customer_orders AS
SELECT u.id AS user_id, u.name, o.id AS order_id, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.deleted_at IS NULL;

SELECT * FROM active_customer_orders WHERE user_id = 7;

-- A materialized view: stored snapshot for a dashboard
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT date_trunc('day', created_at)::date AS day,
       SUM(amount) AS revenue,
       COUNT(*)    AS orders
FROM orders
WHERE status = 'paid'
GROUP BY 1;

-- Needed for CONCURRENTLY refresh
CREATE UNIQUE INDEX ON daily_revenue (day);

-- Rebuild without blocking readers (run from a cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;`,
        },
        {
          title: 'Refreshing from Node on a schedule',
          lang: 'javascript',
          code: `import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Refresh every 10 minutes (in production use a real scheduler / pg_cron)
setInterval(async () => {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue');
    console.log('daily_revenue refreshed');
  } catch (err) {
    console.error('refresh failed', err.message);
  }
}, 10 * 60 * 1000);`,
        },
      ],
      output: `Querying \`active_customer_orders\` always shows live data because the join runs at read time. Querying \`daily_revenue\` is very fast because the rows are already computed, but a new paid order will not appear until the next refresh. With \`CONCURRENTLY\`, the dashboard keeps reading the old snapshot while the new one is built.`,
      questions: [
        {
          q: 'What is the difference between a view and a materialized view?',
          a: 'A view stores only the query and runs it each time (always fresh, no speed gain). A materialized view stores the result (fast reads, stale until refreshed, can be indexed).',
        },
        {
          q: 'How do you refresh a materialized view without blocking reads?',
          a: '`REFRESH MATERIALIZED VIEW CONCURRENTLY name` — it requires a unique index on the materialized view.',
        },
        {
          q: 'Does a normal view make queries faster?',
          a: 'No. It is just a saved query; Postgres expands it into the outer query. It helps readability and security, not speed.',
        },
        {
          q: 'When would you use a materialized view instead of a cache like Redis?',
          a: 'When the result is a heavy SQL aggregate that many queries filter or join further, and minute-level staleness is fine. It stays inside the database, can be indexed and queried with SQL.',
        },
      ],
      spoken: `"A view is a saved query — it stores no data and runs fresh every time, so it's for readability, reuse and security, not performance. A materialized view actually stores the result, so reads are fast and I can index it, but it's a snapshot that I have to refresh myself, usually from a cron job. I use REFRESH CONCURRENTLY so readers aren't blocked, which needs a unique index on the view. I'd use one for something like an admin revenue dashboard where data a few minutes old is perfectly fine."`,
      mistakes: [
        'Expecting a normal view to speed up a slow query.',
        'Forgetting that materialized views never refresh on their own.',
        'Using `REFRESH ... CONCURRENTLY` without a unique index — Postgres raises an error.',
        'Refreshing a huge materialized view every few seconds; each refresh recomputes everything.',
        'Follow-up trap: "Can you insert into a view?" Yes, for simple views on one table without aggregates (auto-updatable). For complex views you need `INSTEAD OF` triggers.',
      ],
      takeaway: 'View = saved query (always fresh); materialized view = saved result (fast, but refresh it yourself).',
    },
    {
      id: 'jsonb',
      title: 'JSONB in PostgreSQL',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'JSONB stores JSON in a binary, indexable format, giving you document-style flexibility inside a relational database.',
      what: `Postgres has two JSON column types:

- \`JSON\` stores the text exactly as given (keeps spaces, key order, duplicate keys).
- \`JSONB\` stores a parsed **binary** version. It is slightly slower to write but much faster to query, and it supports indexes. Use \`JSONB\` almost always.

Key operators:
- \`->\` gets a field as JSON. \`->>\` gets it as text.
- \`#>>\` gets a nested path as text.
- \`@>\` "contains": \`attrs @> '{"color":"red"}'\`.
- \`?\` "has key".

#### Deeper version
**Indexing:** a **GIN** index on the whole column speeds up \`@>\`, \`?\`, \`?|\`, \`?&\`. The \`jsonb_path_ops\` variant is smaller and faster but only supports \`@>\` (and JSON path matches). For one hot field, a **B-tree expression index** on \`(data->>'email')\` is often better.

**Updating:** \`jsonb_set\` changes one path, \`||\` merges objects, \`-\` removes a key. Note: Postgres rewrites the whole JSONB value on update, so huge, frequently-updated documents are costly.

**When to use it:** flexible attributes (product specs that differ per category), webhook payloads (Stripe events), settings, LLM tool-call metadata. **When not to:** data you filter, join or constrain often — make those real columns with types, foreign keys and constraints.`,
      why: `It gives MERN developers the MongoDB-like flexibility they are used to, without giving up joins, transactions and constraints for the rest of the data. Many teams avoid running a second database just for "unstructured" fields.`,
      analogy: `A normal table is a form with fixed boxes. A JSONB column is a "notes" box where you can write anything in a structured way — and with a GIN index, Postgres keeps an index of every word in those notes so it can still find things fast.`,
      code: [
        {
          title: 'Store, query and index JSONB',
          lang: 'sql',
          code: `CREATE TABLE products (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL,
  attrs JSONB NOT NULL DEFAULT '{}'
);

INSERT INTO products (name, attrs) VALUES
  ('T-shirt', '{"color": "red", "sizes": ["S","M"], "brand": {"name": "Acme"}}'),
  ('Laptop',  '{"ram_gb": 16, "brand": {"name": "Zen"}}');

-- Read fields
SELECT name,
       attrs->>'color'              AS color,       -- text
       attrs #>> '{brand,name}'     AS brand,       -- nested path as text
       (attrs->>'ram_gb')::int      AS ram          -- cast for numbers
FROM products;

-- Filter with containment (can use the GIN index)
SELECT name FROM products WHERE attrs @> '{"color": "red"}';

-- Has key
SELECT name FROM products WHERE attrs ? 'ram_gb';

CREATE INDEX idx_products_attrs ON products USING GIN (attrs);
CREATE INDEX idx_products_brand ON products ((attrs #>> '{brand,name}'));`,
        },
        {
          title: 'Update parts of a JSONB value',
          lang: 'sql',
          code: `-- Set one nested field
UPDATE products
SET attrs = jsonb_set(attrs, '{brand,name}', '"AcmeX"')
WHERE id = 1;

-- Merge new keys, remove a key
UPDATE products SET attrs = attrs || '{"on_sale": true}' WHERE id = 1;
UPDATE products SET attrs = attrs - 'sizes' WHERE id = 1;`,
        },
      ],
      output: `The select returns \`T-shirt | red | Acme | NULL\` and \`Laptop | NULL | Zen | 16\`. Missing keys simply give \`NULL\`. The containment query returns only the T-shirt, and \`? 'ram_gb'\` returns only the Laptop.

After the updates, the T-shirt's attrs become \`{"color": "red", "brand": {"name": "AcmeX"}, "on_sale": true}\`.

From node-postgres, JSONB columns come back as normal JavaScript objects, and you can pass objects as parameters (\`pg\` serialises them with \`JSON.stringify\`).`,
      questions: [
        {
          q: 'JSON vs JSONB?',
          a: '`JSON` stores raw text (keeps formatting and key order). `JSONB` stores a parsed binary form: faster to query, supports GIN indexes and containment operators. JSONB is the usual choice.',
        },
        {
          q: 'What is the difference between -> and ->>?',
          a: '`->` returns the value as JSONB (good for chaining), `->>` returns it as text (good for comparing or casting).',
        },
        {
          q: 'How do you index JSONB?',
          a: 'A GIN index on the column for `@>` and key-existence queries, or a B-tree expression index on a specific path like `((data->>\'email\'))` for equality and sorting on that field.',
        },
        {
          q: 'When should data be a column instead of JSONB?',
          a: 'When you filter, sort, join or need constraints on it regularly, or need foreign keys. Columns have types, statistics and constraints; JSONB fields do not.',
        },
      ],
      spoken: `"JSONB stores JSON in a parsed binary format, so unlike plain JSON it's fast to query and can be indexed. I read fields with arrow for JSON and double-arrow for text, filter with the containment operator, and add a GIN index for those queries, or an expression index on one hot path. I use it for genuinely flexible data — product attributes, webhook payloads, settings — but anything I filter or join on all the time becomes a real column with a type and constraints. It gives me Mongo-style flexibility while keeping transactions and joins."`,
      mistakes: [
        'Putting everything into one JSONB column and losing types, constraints, foreign keys and good planner statistics.',
        'Comparing `attrs->\'price\' > 100` — `->` returns JSONB, so cast the text form: `(attrs->>\'price\')::numeric > 100`.',
        'Expecting a GIN index to speed up `attrs->>\'color\' = \'red\'`. A plain GIN helps `@>`; use containment or an expression index.',
        'Storing big, frequently updated documents — every update rewrites the whole value.',
        'Follow-up trap: "Is Postgres JSONB a replacement for MongoDB?" For flexible fields alongside relational data, often yes. For huge document workloads needing built-in sharding, MongoDB may still fit better.',
      ],
      takeaway: 'JSONB = flexible, indexable JSON inside Postgres; use it for truly variable data and keep core fields as real columns.',
    },
    {
      id: 'upsert-on-conflict',
      title: 'UPSERT with INSERT ... ON CONFLICT',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'ON CONFLICT lets one atomic statement insert a row or update/skip it if it already exists — no race-prone "check then insert".',
      what: `An **upsert** means "insert, or update if it already exists". Postgres does this with:

\`INSERT ... ON CONFLICT (column) DO UPDATE SET ...\` — update the existing row.
\`INSERT ... ON CONFLICT DO NOTHING\` — skip silently.

The conflict target must match a **unique index or constraint** (or the primary key).

Inside \`DO UPDATE\`, the special name \`EXCLUDED\` means "the row I tried to insert".

#### Deeper version
Why not "SELECT, then INSERT if missing" in Node? Because two requests can both see "missing" and both insert — a **race condition**. \`ON CONFLICT\` is **atomic**: Postgres handles the check and write together using the unique index.

Uses: idempotent webhook handling (store Stripe event id with \`DO NOTHING\`), counters (\`count = table.count + 1\`), syncing data from external APIs.

Notes:
- \`RETURNING\` returns nothing for rows skipped by \`DO NOTHING\`.
- \`DO UPDATE ... WHERE\` lets you update only when something changed (for example, only if the new data is newer).
- Postgres 15+ also has the SQL-standard \`MERGE\` statement for more complex cases.`,
      why: `Sync jobs, webhooks and retries send the same data more than once. Upserts make these operations **idempotent** (safe to repeat) and race-free in one round trip.`,
      analogy: `It is like a hotel check-in desk: "If this guest has a booking, update their room; if not, create a booking." The desk does it in one step, so two receptionists can't create two bookings for the same guest.`,
      code: [
        {
          title: 'Upsert patterns',
          lang: 'sql',
          code: `-- Requires a unique constraint on (user_id, product_id)
CREATE TABLE cart_items (
  user_id    BIGINT,
  product_id BIGINT,
  quantity   INT NOT NULL,
  PRIMARY KEY (user_id, product_id)
);

-- Add to cart: insert, or increase quantity if already there
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES (1, 42, 2)
ON CONFLICT (user_id, product_id)
DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
RETURNING *;

-- Idempotent webhook: store each event id once
INSERT INTO processed_events (event_id) VALUES ('evt_123')
ON CONFLICT (event_id) DO NOTHING
RETURNING event_id;`,
        },
        {
          title: 'Idempotent Stripe webhook in Node',
          lang: 'javascript',
          code: `async function handleStripeEvent(pool, event) {
  const { rows } = await pool.query(
    'INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT (event_id) DO NOTHING RETURNING event_id',
    [event.id]
  );
  if (rows.length === 0) {
    console.log('Duplicate event, skipping', event.id);
    return;
  }
  // First time we see this event: do the real work
  console.log('Processing', event.type);
}`,
        },
      ],
      output: `Running the cart insert twice gives one row with \`quantity = 4\` instead of a duplicate-key error. The first webhook call returns \`evt_123\` and processes it; a retry of the same event returns zero rows, so the handler logs "Duplicate event" and stops.

For full safety, record the event id and do the work in the same transaction, so a crash in the middle doesn't mark an event done that never ran.`,
      questions: [
        {
          q: 'How do you do an upsert in PostgreSQL?',
          a: '`INSERT ... ON CONFLICT (unique_cols) DO UPDATE SET col = EXCLUDED.col`, or `DO NOTHING` to skip duplicates.',
        },
        {
          q: 'What is EXCLUDED?',
          a: 'A special table name inside `DO UPDATE` that refers to the row you tried to insert.',
        },
        {
          q: 'Why not check with SELECT first, then INSERT?',
          a: 'Two concurrent requests can both see "not found" and both insert, causing duplicates or errors. `ON CONFLICT` is atomic.',
        },
        {
          q: 'What does ON CONFLICT need to work?',
          a: 'A unique index, unique constraint or primary key that matches the conflict target columns.',
        },
      ],
      spoken: `"For upserts in Postgres I use INSERT ON CONFLICT. I name the unique columns, then either DO UPDATE — using EXCLUDED to refer to the new values — or DO NOTHING. It's atomic, so it avoids the race you get with select-then-insert in application code. I use it a lot for idempotency: for example storing the Stripe event id with DO NOTHING, and if no row comes back from RETURNING, I know it's a duplicate delivery and skip it. It needs a unique index on the conflict columns."`,
      mistakes: [
        'Using `ON CONFLICT (email)` without a unique index on `email` — Postgres errors: there is no matching constraint.',
        'Writing `SET quantity = quantity + 1` ambiguously; prefix with the table name (`cart_items.quantity`) or use `EXCLUDED`.',
        'Doing select-then-insert in Node and getting duplicates under load.',
        'Expecting `RETURNING` to return the existing row after `DO NOTHING` — it returns nothing for skipped rows.',
        'Follow-up trap: "Does ON CONFLICT DO NOTHING still burn a sequence value?" Yes — the id from a SERIAL/IDENTITY may be consumed even if the row is skipped, so ids can have gaps. Gaps are normal.',
      ],
      takeaway: 'INSERT … ON CONFLICT is the atomic, race-free way to insert-or-update, and a key tool for idempotency.',
    },
    {
      id: 'pagination',
      title: 'Pagination: OFFSET vs Keyset (Cursor)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'LIMIT/OFFSET is simple but slows down on deep pages and can skip rows; keyset pagination uses "after this id" and stays fast.',
      what: `**Offset pagination**: \`LIMIT 20 OFFSET 40\` = page 3. Easy, and supports "jump to page 50".

**Keyset (cursor) pagination**: remember the last row you showed, then ask for rows **after** it: \`WHERE id < 980 ORDER BY id DESC LIMIT 20\`. This is what "infinite scroll" and most APIs (Stripe, GitHub) use.

#### Deeper version
**Why OFFSET gets slow:** \`OFFSET 100000\` still makes Postgres read and throw away 100,000 rows. Deep pages get slower and slower.

**Why OFFSET can be wrong:** if a new row is inserted while the user scrolls, everything shifts by one, so the user sees a duplicate or misses a row.

**Keyset** uses an index to jump straight to the cursor position, so page 1 and page 5000 cost the same. Rules:
- The sort must be **unique and stable**. Sorting by \`created_at\` alone is not unique, so add a tie-breaker: \`ORDER BY created_at DESC, id DESC\` and filter with a **row comparison** \`(created_at, id) < ($1, $2)\`.
- Have a matching composite index: \`(created_at DESC, id DESC)\`.
- Downside: no "jump to page N"; only next/previous.

Encode the cursor (for example base64 of \`created_at|id\`) so clients treat it as an opaque string.`,
      why: `Feeds, order histories and admin tables grow to millions of rows. Keyset pagination keeps them fast and correct; offset is fine for small tables and admin pages that need page numbers.`,
      analogy: `OFFSET is like telling someone "skip the first 500 pages of the book, then read 20" — they still flip through all 500. Keyset is using a bookmark: you open straight to where you stopped.`,
      code: [
        {
          title: 'Offset vs keyset in SQL',
          lang: 'sql',
          code: `-- Offset: simple, slow for deep pages
SELECT id, title, created_at
FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 100000;

-- Keyset: fast at any depth
CREATE INDEX idx_posts_created_id ON posts (created_at DESC, id DESC);

SELECT id, title, created_at
FROM posts
WHERE (created_at, id) < ('2026-03-01 10:00:00+00', 98765)  -- last row of previous page
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
        },
        {
          title: 'Cursor API in Node',
          lang: 'javascript',
          code: `const encode = (row) =>
  Buffer.from(row.created_at.toISOString() + '|' + row.id).toString('base64url');
const decode = (cursor) => {
  const [createdAt, id] = Buffer.from(cursor, 'base64url').toString().split('|');
  return [createdAt, Number(id)];
};

async function listPosts(pool, cursor, limit = 20) {
  const params = [limit + 1];                     // fetch one extra to know if more exist
  let where = '';
  if (cursor) {
    where = 'WHERE (created_at, id) < ($2, $3)';
    params.push(...decode(cursor));
  }
  const { rows } = await pool.query(
    'SELECT id, title, created_at FROM posts ' + where +
    ' ORDER BY created_at DESC, id DESC LIMIT $1',
    params
  );
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  return { items, nextCursor: hasMore ? encode(items[items.length - 1]) : null };
}`,
        },
      ],
      output: `The offset query reads and discards 100,000 rows before returning 20, so it gets slower with every page. The keyset query uses the index to jump straight past the cursor and reads only about 20 rows.

The Node function returns \`{ items, nextCursor }\`. The client sends \`nextCursor\` back to get the next page. When \`nextCursor\` is \`null\`, there are no more posts. Fetching \`limit + 1\` rows is a cheap way to know whether another page exists.`,
      questions: [
        {
          q: 'Why is OFFSET pagination slow on large tables?',
          a: 'Postgres must still read and skip all the offset rows before returning the page, so cost grows with page depth.',
        },
        {
          q: 'What is keyset (cursor) pagination?',
          a: 'Instead of a page number, you pass the sort key of the last row seen and query `WHERE key < last_key ORDER BY key LIMIT n`. With an index it is fast at any depth.',
        },
        {
          q: 'Why add id as a tie-breaker?',
          a: 'Because the sort column (like `created_at`) may not be unique. Without a unique tie-breaker, rows with the same timestamp can be skipped or repeated between pages.',
        },
        {
          q: 'When is OFFSET still fine?',
          a: 'Small tables, admin screens that need "go to page 7", or when deep pages are rare.',
        },
      ],
      spoken: `"Offset pagination with LIMIT and OFFSET is simple and supports page numbers, but Postgres still reads all the skipped rows, so deep pages get slow, and inserts during scrolling cause duplicates or missed rows. For feeds and APIs I use keyset or cursor pagination: I pass the last row's sort key and query rows after it, with an index on the same columns. I always add the id as a tie-breaker and compare with a row comparison on created_at and id. The trade-off is that you can't jump to an arbitrary page."`,
      mistakes: [
        'Paginating without `ORDER BY` — page contents are then random.',
        'Using a non-unique sort key for keyset pagination without a tie-breaker.',
        'Writing `created_at < $1 OR (created_at = $1 AND id < $2)` without a matching index, or forgetting the row-comparison shortcut `(created_at, id) < ($1, $2)`.',
        'Running `COUNT(*)` on a huge table for every page just to show "page 1 of 50,000". Consider an estimate or no total.',
        'Follow-up trap: "How does Prisma do cursor pagination?" With `cursor: { id }`, `skip: 1`, and `take`. It still needs a unique, ordered field.',
      ],
      takeaway: 'OFFSET is easy but slow and shifty at depth; keyset pagination with a unique sort and matching index is fast and stable.',
    },
    {
      id: 'migrations',
      title: 'Database Migrations',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Migrations are versioned, ordered scripts that change the schema, stored in git and applied the same way in every environment.',
      what: `A **migration** is a small file that changes the database **schema** (tables, columns, indexes) — for example "add a \`phone\` column to users". Each migration has a version or timestamp, and they run in order.

A migration tool records which migrations already ran (in a table like \`_prisma_migrations\` or \`knex_migrations\`), so each one runs exactly once per database.

Popular tools in Node: **Prisma Migrate**, **Knex**, **TypeORM**, **Drizzle Kit**, **node-pg-migrate**.

#### Deeper version
**Zero-downtime migrations** matter because during a deploy, old and new app versions run at the same time. Use the **expand and contract** pattern:
1. **Expand**: add the new column/table (nullable or with a default). Old code ignores it.
2. Deploy code that writes to both old and new, and **backfill** old rows in small batches.
3. Switch reads to the new column.
4. **Contract**: in a later release, remove the old column.

Risky operations on big tables:
- Adding an index → use \`CREATE INDEX CONCURRENTLY\` (cannot run inside a transaction; many tools need a special flag or raw SQL for it).
- Adding \`NOT NULL\` to an existing column → scans the table under a strong lock. Safer: add a \`CHECK ... NOT VALID\` constraint, then \`VALIDATE CONSTRAINT\` separately.
- Renaming or dropping a column that running code still uses → breaks the old version.
- Set \`lock_timeout\` so a migration waiting for a lock does not block all traffic behind it.

Adding a column with a constant default is fast in Postgres 11+ (no table rewrite).`,
      why: `Without migrations, every developer and server has a slightly different schema and nobody knows which changes ran in production. Migrations make schema changes reviewable in pull requests, repeatable in CI, and safe to roll out.`,
      analogy: `Migrations are like git commits for your database structure. Each one is a small, ordered change, and the migration table is like the commit log telling you which changes this database already has.`,
      code: [
        {
          title: 'A plain SQL migration pair',
          lang: 'sql',
          code: `-- 20260301_add_phone_to_users.up.sql
ALTER TABLE users ADD COLUMN phone TEXT;     -- nullable: instant, safe

-- Big table index: no write blocking (run outside a transaction)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone ON users (phone);

-- 20260301_add_phone_to_users.down.sql
DROP INDEX CONCURRENTLY IF EXISTS idx_users_phone;
ALTER TABLE users DROP COLUMN phone;`,
        },
        {
          title: 'Prisma Migrate workflow',
          lang: 'bash',
          code: `# 1. Edit schema.prisma (e.g. add: phone String?)
# 2. Create + apply a migration in development
npx prisma migrate dev --name add_phone_to_users

# 3. Commit prisma/migrations/* to git

# 4. In CI/CD, apply pending migrations to production (no prompts, no reset)
npx prisma migrate deploy`,
        },
        {
          title: 'Safe NOT NULL on a big table',
          lang: 'sql',
          code: `SET lock_timeout = '5s';  -- fail fast instead of queueing all traffic

ALTER TABLE users
  ADD CONSTRAINT users_phone_not_null CHECK (phone IS NOT NULL) NOT VALID;  -- quick

-- Later, after backfilling phone for every row:
ALTER TABLE users VALIDATE CONSTRAINT users_phone_not_null;  -- scans, weaker lock`,
        },
      ],
      output: `The up migration adds a nullable column (instant) and builds an index without blocking writes. The down migration undoes both.

With Prisma, \`migrate dev\` generates a SQL file in \`prisma/migrations\` and applies it locally; \`migrate deploy\` applies only the pending files in production and records them in \`_prisma_migrations\`.

The NOT NULL example adds the rule instantly for new rows, then validates old rows later with a lock that does not block normal reads and writes.`,
      questions: [
        {
          q: 'What are database migrations and why use them?',
          a: 'Versioned scripts that change the schema in order. They keep every environment in sync, are reviewed in git, and are applied automatically in CI/CD.',
        },
        {
          q: 'How do you rename a column with zero downtime?',
          a: 'Expand and contract: add the new column, write to both, backfill in batches, switch reads, then drop the old column in a later deploy.',
        },
        {
          q: 'prisma migrate dev vs migrate deploy?',
          a: '`migrate dev` is for development: it creates new migration files and may reset the dev database. `migrate deploy` only applies existing pending migrations — use it in production.',
        },
        {
          q: 'Which migrations are dangerous on large tables?',
          a: 'Non-concurrent index builds, adding NOT NULL or constraints that scan the table, changing column types (table rewrite), and dropping/renaming columns still used by running code.',
        },
      ],
      spoken: `"Migrations are versioned, ordered schema changes kept in git, and a tracking table records which ones have run, so every environment ends up identical. With Prisma I use migrate dev locally and migrate deploy in the pipeline. For production I think about zero downtime: I use expand and contract — add the new column, dual-write, backfill in batches, switch reads, then drop the old one later. I build indexes concurrently, set a lock timeout, and avoid operations that rewrite or lock big tables during peak traffic."`,
      mistakes: [
        'Editing a migration that already ran in production instead of adding a new one.',
        'Renaming or dropping a column in the same deploy as the code change — old pods crash during the rollout.',
        'Running `prisma migrate dev` against production; it can try to reset the database.',
        'Backfilling millions of rows in one `UPDATE`, holding locks and bloating the table. Do it in batches.',
        'Follow-up trap: "Do you always write down migrations?" Many teams roll forward instead (fix with a new migration), because rolling back data changes is often impossible. Still, know how you would undo each step.',
      ],
      takeaway: 'Migrations are git for your schema — ordered, reviewed, automated, and written for zero downtime with expand-and-contract.',
    },
    {
      id: 'connection-pooling',
      title: 'Connection Pooling (pg Pool and PgBouncer)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Opening a Postgres connection is expensive and the server allows only a limited number, so apps reuse a small pool of open connections.',
      what: `Every Postgres connection is a separate **process** on the server. Opening one takes time (network handshake, authentication, TLS) and uses memory. The server also has a limit (\`max_connections\`, often around 100 by default).

A **connection pool** keeps a few connections open and lends them out to requests. When a query finishes, the connection goes back to the pool instead of closing.

- **pg.Pool** — a pool inside your Node process.
- **PgBouncer** — a separate lightweight proxy that pools connections for **many** app instances.

#### Deeper version
**Math matters:** 10 pods × 20 connections each = 200 connections — more than a default Postgres allows. Serverless (Lambda, Vercel functions) is worse: every function instance has its own pool, so connections explode. That is why serverless setups use PgBouncer, RDS Proxy, or a provider's pooled connection URL.

**PgBouncer pool modes:**
- **Session** — a client keeps one server connection until it disconnects. Safest, least sharing.
- **Transaction** — a server connection is given only for one transaction. Best sharing; the common choice. But session features break: session-level \`SET\`, advisory locks held across transactions, \`LISTEN/NOTIFY\`, and (in older PgBouncer versions) named prepared statements. Recent PgBouncer versions added prepared-statement support in transaction mode — check the docs for your version.
- **Statement** — one statement at a time; no multi-statement transactions.

**Pool size:** bigger is not better. A good starting point is a small pool per instance; total connections should stay well below \`max_connections\`. Too many active connections cause CPU and lock contention.`,
      why: `Without pooling, a traffic spike opens hundreds of connections, the database hits its limit and starts refusing them ("too many clients already"), and latency jumps because each request pays the connection cost.`,
      analogy: `A pool is like a taxi stand. Instead of buying a new car for every trip (opening a connection), passengers take the next waiting taxi and it comes back after the ride. PgBouncer is the dispatcher for a whole city, sharing a limited fleet among many neighbourhoods (app servers).`,
      code: [
        {
          title: 'One shared pg Pool per process',
          lang: 'javascript',
          code: `// db.js — create the pool ONCE and import it everywhere
import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                        // max connections in this process
  idleTimeoutMillis: 30000,       // close idle connections after 30s
  connectionTimeoutMillis: 5000,  // fail if no connection within 5s
});

// Errors on idle clients (e.g. DB restart) must be handled or Node crashes
pool.on('error', (err) => console.error('Idle client error', err.message));

// Simple query: pool checks out and releases a client for you
export async function getUser(id) {
  const { rows } = await pool.query('SELECT id, name FROM users WHERE id = $1', [id]);
  return rows[0];
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});`,
        },
        {
          title: 'Minimal PgBouncer config',
          lang: 'ini',
          code: `[databases]
appdb = host=10.0.0.5 port=5432 dbname=appdb

[pgbouncer]
listen_port = 6432
pool_mode = transaction       ; share server connections per transaction
max_client_conn = 2000        ; app-side connections PgBouncer accepts
default_pool_size = 20        ; real Postgres connections per db/user pair
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt`,
        },
      ],
      output: `With the pool, each \`getUser\` call borrows one of at most 10 connections and returns it right after the query. If all 10 are busy, extra requests wait in a queue; if they wait over 5 seconds they get an error instead of hanging forever.

With PgBouncer, thousands of app connections (for example from many serverless functions) share just 20 real Postgres connections, because each one is only borrowed for the length of a transaction. The app connects to port 6432 instead of 5432.`,
      questions: [
        {
          q: 'Why do we need connection pooling?',
          a: 'Opening connections is slow and each one uses server memory, and Postgres limits how many can exist. A pool reuses a small number of open connections across many requests.',
        },
        {
          q: 'What is PgBouncer and when do you need it?',
          a: 'A lightweight external connection pooler. Use it when many app instances or serverless functions together would open more connections than Postgres can handle.',
        },
        {
          q: 'What breaks in PgBouncer transaction mode?',
          a: 'Anything that depends on the same session across transactions: session `SET` commands, session advisory locks, `LISTEN/NOTIFY`, temp tables kept across transactions, and (older versions) named prepared statements.',
        },
        {
          q: 'Is a bigger pool always better?',
          a: 'No. Too many active connections cause contention and memory pressure. Keep pools small and sum them across all instances below `max_connections`.',
        },
      ],
      spoken: `"Each Postgres connection is a server process, so opening one is expensive and there's a hard limit on how many can exist. In Node I create one pg Pool per process, keep the max small, set timeouts, and handle the pool's error event. I also do the math: pods times pool size must stay under max_connections. For serverless or lots of instances I put PgBouncer or RDS Proxy in front, usually in transaction mode, knowing that session features like SET, advisory locks and LISTEN don't work reliably there."`,
      mistakes: [
        'Creating a new `Pool` (or `PrismaClient`) per request — you leak connections fast.',
        'Forgetting to `release()` clients checked out with `pool.connect()`, so the pool runs dry and the app hangs.',
        'Setting `max: 100` per instance across 10 instances and hitting "too many clients".',
        'Using session features (session SET, advisory locks, LISTEN) through PgBouncer in transaction mode.',
        'Follow-up trap: "Why does serverless make this worse?" Each function instance has its own pool and instances scale out quickly, so connection count jumps. Use an external pooler or the provider\'s pooled URL.',
      ],
      takeaway: 'Reuse a small pool of connections per process, and put PgBouncer (or a managed proxy) in front when many instances share one database.',
    },
    {
      id: 'orms-prisma-n-plus-one',
      title: 'ORMs and Prisma vs Raw SQL (and the N+1 Problem)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'ORMs like Prisma give type-safe, productive database access; raw SQL gives full control. Watch out for N+1 queries either way.',
      what: `An **ORM** (Object-Relational Mapper) lets you work with database rows as JavaScript objects instead of writing SQL. **Prisma** is a popular TypeScript ORM: you describe models in \`schema.prisma\`, and it generates a fully typed client.

**Raw SQL** (with \`pg\`) means you write the SQL yourself.

The **N+1 problem**: you run **1** query to get a list (say 50 posts), then **N** more queries — one per item — to get related data (each post's author). That is 51 queries instead of 1 or 2.

#### Deeper version
**ORM pros:** type safety, auto-complete, migrations, less boilerplate, safe parameterization, easy relations.
**ORM cons:** complex reports, window functions, CTEs and some Postgres features are awkward or missing; generated SQL can be inefficient; another layer to debug.

**Raw SQL / query builders (Knex, Kysely, Drizzle) pros:** full control and performance. **Cons:** more code, manual typing, easier to make mistakes.

A common mix: Prisma for 90% of CRUD, and \`prisma.$queryRaw\` (tagged template = parameterized) for heavy reports.

**Fixing N+1:**
- In Prisma: use \`include\` or \`select\` with relations. Prisma loads the relation in a batched query (\`WHERE id IN (...)\`), and newer versions can use a database join (\`relationLoadStrategy\`) — check the current docs for your version.
- In SQL: use a \`JOIN\`, or one \`WHERE id = ANY($1)\` query and match results in memory.
- In GraphQL: use **DataLoader** to batch per request.

Spot it by logging queries (Prisma \`log: ['query']\`) or APM traces showing many identical small queries.`,
      why: `Interviewers want to know you are not "ORM-only" — that you understand the SQL being generated, can drop to raw SQL when needed, and can spot N+1, which is one of the most common real-world performance bugs in Node APIs.`,
      analogy: `N+1 is like a waiter taking one table's order, walking to the kitchen, coming back for the next person's order, walking again — 10 trips for 10 people. Batching is taking everyone's order at once and making one trip.`,
      code: [
        {
          title: 'N+1 and the fix in Prisma',
          lang: 'javascript',
          code: `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['query'] });   // see every SQL query

// BAD: 1 query for posts + 1 query PER post for the author (N+1)
const posts = await prisma.post.findMany({ take: 50 });
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// GOOD: Prisma loads authors in a batched query (not 50 separate ones)
const postsWithAuthors = await prisma.post.findMany({
  take: 50,
  select: {
    id: true,
    title: true,
    author: { select: { id: true, name: true } },
  },
});`,
        },
        {
          title: 'Raw SQL when it is the better tool',
          lang: 'javascript',
          code: `// Tagged template: values become parameters ($1...), safe from injection
const minTotal = 1000;
const topBuyers = await prisma.$queryRaw\`
  SELECT u.id, u.name, SUM(o.amount) AS total,
         RANK() OVER (ORDER BY SUM(o.amount) DESC) AS rank
  FROM users u
  JOIN orders o ON o.user_id = u.id
  GROUP BY u.id
  HAVING SUM(o.amount) > \${minTotal}
\`;

// Same N+1 fix with pg: one JOIN instead of a loop
const { rows } = await pool.query(
  'SELECT p.id, p.title, u.name AS author FROM posts p JOIN users u ON u.id = p.author_id ORDER BY p.id DESC LIMIT 50'
);`,
        },
      ],
      output: `With query logging on, the bad loop prints 51 \`SELECT\` statements. The \`select\` with \`author\` prints about 2 (posts, then authors \`WHERE id IN (...)\`) or a single joined query depending on the Prisma version and settings. Response time drops a lot, especially when the database is far away.

The \`$queryRaw\` example runs a window-function report that would be awkward in the ORM API, while \`minTotal\` is still sent as a parameter.`,
      questions: [
        {
          q: 'What is the N+1 query problem and how do you fix it?',
          a: 'Fetching a list with one query, then one extra query per item for related data. Fix it by eager loading (Prisma `include`/`select`), a SQL `JOIN`, a single `IN (...)` batch query, or DataLoader in GraphQL.',
        },
        {
          q: 'When would you use raw SQL instead of Prisma?',
          a: 'Complex reports, window functions, recursive CTEs, bulk operations, Postgres-specific features, or when the generated query is too slow. Use `$queryRaw` with a tagged template so it stays parameterized.',
        },
        {
          q: 'Pros and cons of ORMs?',
          a: 'Pros: productivity, type safety, migrations, safe queries. Cons: hides SQL, can generate inefficient queries, limited for advanced SQL, extra abstraction to debug.',
        },
        {
          q: 'Why should PrismaClient be a singleton?',
          a: 'Each client has its own connection pool. Creating many (for example on every hot reload in Next.js dev) exhausts database connections. Store one instance (often on `globalThis` in dev).',
        },
      ],
      spoken: `"I like Prisma for everyday CRUD because it's type-safe, handles migrations and parameterizes everything. But I always know the SQL it generates — I turn on query logging — and for heavy reports with window functions or CTEs I drop to queryRaw with a tagged template so it stays safe. The big trap is N+1: loading a list and then querying relations inside a loop, so fifty posts become fifty-one queries. I fix it with include or select for eager loading, a JOIN in raw SQL, or DataLoader in GraphQL."`,
      mistakes: [
        'Awaiting a query inside a `for` loop over results — classic N+1.',
        'Using `$queryRawUnsafe` with string concatenation, reopening SQL injection.',
        'Using `include` to pull entire related tables when you need two fields; prefer `select`.',
        'Creating a new `PrismaClient` per request or per hot reload, exhausting connections.',
        'Follow-up trap: "Does Prisma use JOINs for include?" Traditionally it ran separate batched queries; newer versions can use database-level joins via a relation load strategy. Either way it avoids N+1 — check the docs for your version.',
      ],
      takeaway: 'Use the ORM for productivity, raw SQL for power, and always batch related data to avoid N+1.',
    },
    {
      id: 'window-functions',
      title: 'Window Functions: ROW_NUMBER, RANK, Running Totals, LAG',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Window functions compute values across related rows (rank, running total, previous row) without collapsing them like GROUP BY.',
      what: `A **window function** looks at a group of rows related to the current row, but **keeps every row** in the output. \`GROUP BY\` squashes rows into one per group; window functions do not.

Syntax: \`function() OVER (PARTITION BY ... ORDER BY ...)\`

- \`PARTITION BY\` = split rows into groups (like GROUP BY, but no squashing).
- \`ORDER BY\` (inside \`OVER\`) = the order within each group.

Common functions:
- \`ROW_NUMBER()\` — 1, 2, 3, 4 (always unique).
- \`RANK()\` — ties share a rank, then it skips: 1, 2, 2, 4.
- \`DENSE_RANK()\` — ties share a rank, no gaps: 1, 2, 2, 3.
- \`SUM(x) OVER (ORDER BY date)\` — running total.
- \`LAG(x)\` / \`LEAD(x)\` — value from the previous / next row.

#### Deeper version
The **frame** decides which rows are included for aggregates. With \`ORDER BY\` inside \`OVER\`, the default frame is \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` — so rows with the **same** order value are included together (ties jump at once). Use \`ROWS BETWEEN ...\` for a strict row-by-row running total or moving averages like \`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\` (7-day average).

Window functions run **after** \`WHERE\`, \`GROUP BY\` and \`HAVING\`, so you cannot filter on them in \`WHERE\`. Wrap the query in a CTE or subquery and filter outside (this is the "top N per group" pattern).

Other useful ones: \`NTILE(4)\` (quartiles), \`FIRST_VALUE\`, \`LAST_VALUE\`, \`PERCENT_RANK\`. You can name a window once with \`WINDOW w AS (...)\`.`,
      why: `They solve many real reports in one query: leaderboards, "latest order per user", month-over-month growth, running balances, de-duplication. Without them you would need self-joins or code in Node. They are very common in SQL interview rounds.`,
      analogy: `Think of a class exam result sheet. GROUP BY gives you just "average per section". A window function keeps every student's row but adds a column "rank within my section" — everyone is still listed, with extra context from their group.`,
      code: [
        {
          title: 'Ranking functions side by side',
          lang: 'sql',
          code: `-- scores(student, section, marks)
-- ('A','X',90), ('B','X',85), ('C','X',85), ('D','X',70), ('E','Y',95)
SELECT student, section, marks,
       ROW_NUMBER() OVER (PARTITION BY section ORDER BY marks DESC) AS row_num,
       RANK()       OVER (PARTITION BY section ORDER BY marks DESC) AS rnk,
       DENSE_RANK() OVER (PARTITION BY section ORDER BY marks DESC) AS dense
FROM scores;
-- A | X | 90 | 1 | 1 | 1
-- B | X | 85 | 2 | 2 | 2
-- C | X | 85 | 3 | 2 | 2
-- D | X | 70 | 4 | 4 | 3
-- E | Y | 95 | 1 | 1 | 1`,
        },
        {
          title: 'Running total, LAG and moving average',
          lang: 'sql',
          code: `-- daily_sales(day, amount)
SELECT day,
       amount,
       SUM(amount) OVER (ORDER BY day
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
       amount - LAG(amount) OVER (ORDER BY day)                          AS change_vs_yesterday,
       ROUND(AVG(amount) OVER (ORDER BY day
                         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2)     AS avg_7d
FROM daily_sales
ORDER BY day;
-- 2026-01-01 | 100 | 100 | NULL | 100.00
-- 2026-01-02 | 150 | 250 |   50 | 125.00
-- 2026-01-03 | 120 | 370 |  -30 | 123.33`,
        },
        {
          title: 'Latest order per user (filter outside)',
          lang: 'sql',
          code: `WITH ranked AS (
  SELECT o.*,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM orders o
)
SELECT * FROM ranked WHERE rn = 1;   -- can't use rn in the inner WHERE`,
        },
      ],
      output: `In the ranking example, B and C tie at 85. \`ROW_NUMBER\` still gives them 2 and 3, \`RANK\` gives both 2 and then jumps to 4 for D, and \`DENSE_RANK\` gives both 2 and then 3. Section Y starts again from 1 because of \`PARTITION BY\`.

In the sales example, the running total adds up day by day, \`LAG\` is \`NULL\` on the first day (no previous row), and the 7-day average uses however many days exist so far.

The last query returns exactly one row per user: their newest order.`,
      questions: [
        {
          q: 'Difference between ROW_NUMBER, RANK and DENSE_RANK?',
          a: 'For ties: `ROW_NUMBER` gives unique numbers (1,2,3), `RANK` gives equal ranks and skips (1,2,2,4), `DENSE_RANK` gives equal ranks without gaps (1,2,2,3).',
        },
        {
          q: 'Window function vs GROUP BY?',
          a: '`GROUP BY` collapses rows into one per group. A window function computes over a group but keeps every original row.',
        },
        {
          q: 'Why can\'t you use a window function in WHERE?',
          a: 'Because window functions are computed after `WHERE`, `GROUP BY` and `HAVING`. Put the query in a CTE or subquery and filter in the outer query.',
        },
        {
          q: 'How do you calculate month-over-month growth?',
          a: 'Aggregate per month, then use `LAG(revenue) OVER (ORDER BY month)` and compute `(revenue - prev) / prev`.',
        },
        {
          q: 'What is a window frame?',
          a: 'The set of rows (relative to the current row) that an aggregate window uses, for example `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` for a 7-row moving average.',
        },
      ],
      spoken: `"Window functions calculate across a set of related rows but, unlike GROUP BY, they keep every row. I write function OVER, with PARTITION BY to define groups and ORDER BY for order inside each group. ROW_NUMBER gives unique numbers, RANK leaves gaps after ties, DENSE_RANK doesn't. SUM over an ORDER BY gives running totals, and LAG or LEAD let me compare with the previous or next row, like day-over-day change. Since they run after WHERE, for 'top N per group' I compute ROW_NUMBER in a CTE and filter outside."`,
      mistakes: [
        'Trying `WHERE ROW_NUMBER() OVER (...) = 1` — not allowed; filter in an outer query.',
        'Using `RANK` when you need exactly one row per group; ties return several rows. Use `ROW_NUMBER` with a tie-breaker.',
        'Forgetting `PARTITION BY`, so ranks run across the whole table instead of per group.',
        'Not knowing the default frame is `RANGE`, which treats tied order values as one step in a running total.',
        'Follow-up trap: "Why does LAST_VALUE return the current row?" Because the default frame ends at the current row. Use `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.',
      ],
      takeaway: 'Window functions = aggregates that keep every row; master ROW_NUMBER/RANK/DENSE_RANK, running SUM and LAG.',
    },
    {
      id: 'common-sql-interview-queries',
      title: 'Common SQL Interview Queries (2nd Highest Salary, Duplicates, Top N per Group)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'The classic whiteboard queries: Nth highest salary, finding and deleting duplicates, top N per group, and a few more patterns.',
      what: `Most SQL interview rounds reuse a small set of patterns:

1. **Nth highest value** — second highest salary.
2. **Find duplicates** — \`GROUP BY ... HAVING COUNT(*) > 1\`.
3. **Delete duplicates** but keep one.
4. **Top N per group** — top 3 earners in each department.
5. **Employees earning more than their manager** — self join.
6. **Rows with no match** — customers who never ordered (anti-join).

#### Deeper version
Always ask (or state) how to handle **ties** and **NULLs**:
- "Second highest" usually means the second **distinct** value. \`DISTINCT\` + \`OFFSET 1\` or \`DENSE_RANK() = 2\` handle ties correctly.
- If there is no second value, should it return \`NULL\` or no row? Wrapping in a scalar subquery returns \`NULL\`.
- Top N per group: \`ROW_NUMBER\` gives exactly N rows; \`DENSE_RANK\` includes all ties.

Postgres also offers \`DISTINCT ON (col)\` — keep the first row per group based on \`ORDER BY\`. It is a short way to do "top 1 per group".`,
      why: `These questions test joins, aggregates, subqueries and window functions in a few lines. Interviewers also watch whether you think about ties, NULLs and performance.`,
      analogy: `These are like the standard chess openings: if you know the six or seven main patterns well, you can handle most variations an interviewer throws at you.`,
      code: [
        {
          title: 'Second (or Nth) highest salary',
          lang: 'sql',
          code: `-- employees(id, name, department_id, salary, manager_id)

-- 1. Simple: distinct + offset (returns NULL if none, thanks to the scalar subquery)
SELECT (
  SELECT DISTINCT salary FROM employees
  ORDER BY salary DESC
  OFFSET 1 LIMIT 1
) AS second_highest;

-- 2. Without LIMIT: max below the max
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- 3. Nth with DENSE_RANK (N = 3 here), handles ties
SELECT DISTINCT salary
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t
WHERE rnk = 3;`,
        },
        {
          title: 'Find and delete duplicates',
          lang: 'sql',
          code: `-- Find emails that appear more than once
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Delete duplicates, keep the lowest id per email
DELETE FROM users
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM users
  ) t
  WHERE rn > 1
);

-- Then prevent it from happening again
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);`,
        },
        {
          title: 'Top N per group and other classics',
          lang: 'sql',
          code: `-- Top 3 earners in each department
SELECT department_id, name, salary
FROM (
  SELECT e.*, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn
  FROM employees e
) t
WHERE rn <= 3
ORDER BY department_id, salary DESC;

-- Top 1 per group, Postgres shortcut
SELECT DISTINCT ON (department_id) department_id, name, salary
FROM employees
ORDER BY department_id, salary DESC;

-- Employees who earn more than their manager (self join)
SELECT e.name
FROM employees e
JOIN employees m ON m.id = e.manager_id
WHERE e.salary > m.salary;

-- Department with the highest total salary
SELECT department_id, SUM(salary) AS total
FROM employees
GROUP BY department_id
ORDER BY total DESC
LIMIT 1;`,
        },
      ],
      output: `With salaries 100, 90, 90, 80: query 1 and 2 return 90 (second distinct value), and the DENSE_RANK query with N = 3 returns 80. If the table has only one salary, query 1 returns a single row with \`NULL\` instead of an empty result.

The duplicate finder lists each repeated email with its count. The delete keeps the first (lowest id) row for each email and removes the rest; the unique constraint stops new duplicates.

The top-N query returns up to 3 rows per department. \`DISTINCT ON\` returns exactly one top earner per department.`,
      questions: [
        {
          q: 'Find the second highest salary.',
          a: '`SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);` or `SELECT DISTINCT salary ... ORDER BY salary DESC OFFSET 1 LIMIT 1`, or `DENSE_RANK() = 2`.',
        },
        {
          q: 'How do you find duplicate rows?',
          a: '`GROUP BY` the columns that define a duplicate and keep groups with `HAVING COUNT(*) > 1`.',
        },
        {
          q: 'How do you delete duplicates but keep one?',
          a: 'Number rows per duplicate group with `ROW_NUMBER() OVER (PARTITION BY cols ORDER BY id)` and delete rows where the number is greater than 1. Then add a unique constraint.',
        },
        {
          q: 'How do you get the top 3 per category?',
          a: 'Use `ROW_NUMBER()` (or `DENSE_RANK()` to include ties) partitioned by category in a subquery/CTE, then filter `rn <= 3` outside.',
        },
        {
          q: 'What does DISTINCT ON do?',
          a: 'A Postgres feature that keeps the first row for each distinct value of the given columns, based on the `ORDER BY`. Handy for "latest/top one per group".',
        },
      ],
      spoken: `"For second highest salary I usually write MAX of salary where salary is less than the overall MAX, or use DENSE_RANK equals 2, which generalizes to the Nth and handles ties. I always clarify whether duplicates count. For duplicates I group by the key columns with HAVING COUNT greater than one, and to delete them I number rows with ROW_NUMBER partitioned by those columns and delete everything above 1 — then add a unique constraint. For top N per group I use ROW_NUMBER in a CTE and filter outside, or DISTINCT ON in Postgres for the top one."`,
      mistakes: [
        'Using `ORDER BY salary DESC LIMIT 1 OFFSET 1` without `DISTINCT` — returns the top salary again if two people share it.',
        'Filtering `rn <= 3` in the same `SELECT` that computes `ROW_NUMBER` — must be done in an outer query.',
        'Deleting duplicates without a deterministic `ORDER BY` in the window, so you cannot predict which row survives.',
        'Forgetting to add a unique constraint after cleaning duplicates.',
        'Follow-up trap: "What if there is no second highest salary?" `MAX(...)` with the `WHERE` returns `NULL`; a plain `LIMIT/OFFSET` query returns no rows unless wrapped in a scalar subquery.',
      ],
      takeaway: 'Know the patterns — MAX-below-MAX / DENSE_RANK, GROUP BY HAVING, ROW_NUMBER for dedupe and top-N — and always talk about ties and NULLs.',
    },
    {
      id: 'explain-analyze',
      title: 'EXPLAIN and EXPLAIN ANALYZE (Query Tuning)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'EXPLAIN shows the plan Postgres will use; EXPLAIN ANALYZE actually runs the query and shows real times and row counts, so you can find the slow step.',
      what: `- \`EXPLAIN query\` shows the **plan**: how Postgres intends to run the query (which scans, which joins), with **estimated** costs and rows. It does not run the query.
- \`EXPLAIN ANALYZE query\` **runs** the query and adds the **actual** time and actual rows for each step.
- \`EXPLAIN (ANALYZE, BUFFERS)\` also shows how many data pages came from memory (\`shared hit\`) vs disk (\`read\`).

The plan is a tree. Read it from the **most indented** line (runs first) up to the top.

Common nodes:
- **Seq Scan** — reads the whole table.
- **Index Scan** — uses an index, then fetches rows from the table.
- **Index Only Scan** — answers from the index alone.
- **Bitmap Heap Scan** — collects matches from an index, then reads table pages in order.
- **Nested Loop / Hash Join / Merge Join** — join methods.
- **Sort**, **HashAggregate**, **Limit**.

#### Deeper version
What to look for:
1. **Estimated rows vs actual rows** very different (like 10 vs 500,000) → stale or weak statistics. Run \`ANALYZE\`, or raise statistics for that column.
2. A **Seq Scan with a Filter** that removes most rows on a big table → missing index ("Rows Removed by Filter" is high).
3. **Sort Method: external merge Disk** → the sort spilled to disk; \`work_mem\` too small or a missing index for the ORDER BY.
4. A **Nested Loop** with a big outer side and \`loops=50000\` → often a bad estimate.
5. The node with the largest **actual time** — times are per loop, so multiply by \`loops\`.

\`cost=0.42..8.44\` is in planner units (not milliseconds): startup cost .. total cost.

**Warning:** \`EXPLAIN ANALYZE\` really executes the statement. For \`UPDATE/DELETE\`, wrap it in \`BEGIN; ... ROLLBACK;\`.

To find slow queries in the first place, use the \`pg_stat_statements\` extension and \`log_min_duration_statement\`.`,
      why: `"The API is slow" usually ends at one slow query. EXPLAIN ANALYZE tells you exactly which step is slow and why, so you fix the real problem (an index, a rewrite, fresh stats) instead of guessing.`,
      analogy: `EXPLAIN is like Google Maps showing the route it plans to take with an estimated time. EXPLAIN ANALYZE is actually driving the route with a stopwatch at every turn, so you see where the traffic jam really was.`,
      code: [
        {
          title: 'Before and after an index',
          lang: 'sql',
          code: `EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10;

-- BEFORE (no useful index):
-- Limit  (actual time=310.2..310.2 rows=10 loops=1)
--   ->  Sort  (actual time=310.2..310.2 rows=10 loops=1)
--         Sort Key: created_at DESC
--         ->  Seq Scan on orders  (cost=0.00..45000.00 rows=95 width=64)
--                                 (actual time=0.03..309.8 rows=104 loops=1)
--               Filter: (user_id = 42)
--               Rows Removed by Filter: 1999896
-- Execution Time: 310.4 ms

CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- AFTER:
-- Limit  (actual time=0.03..0.05 rows=10 loops=1)
--   ->  Index Scan using idx_orders_user_created on orders
--         (actual time=0.03..0.05 rows=10 loops=1)
--         Index Cond: (user_id = 42)
-- Execution Time: 0.08 ms`,
        },
        {
          title: 'Safe ANALYZE on writes, and finding slow queries',
          lang: 'sql',
          code: `-- EXPLAIN ANALYZE really runs the UPDATE, so roll it back
BEGIN;
EXPLAIN (ANALYZE, BUFFERS) UPDATE orders SET status = 'archived' WHERE created_at < '2024-01-01';
ROLLBACK;

-- Top queries by total time (needs the pg_stat_statements extension)
-- Column names vary slightly by version (total_exec_time in PG 13+)
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 5;`,
        },
      ],
      output: `Before the index, Postgres reads all 2 million rows, throws away almost all of them ("Rows Removed by Filter: 1999896"), sorts 104 rows and takes about 310 ms. After the composite index, it jumps straight to user 42's newest orders in the right order, reads only 10 entries, and finishes in under a millisecond. No Sort node is needed any more.

The second block shows the plan and buffer usage of the update without keeping its changes, and lists the five queries that use the most total database time.`,
      questions: [
        {
          q: 'What is the difference between EXPLAIN and EXPLAIN ANALYZE?',
          a: '`EXPLAIN` shows the planned steps with estimates and does not run the query. `EXPLAIN ANALYZE` runs it and shows actual times and row counts per step.',
        },
        {
          q: 'What do you look for in a query plan?',
          a: 'Seq scans on big tables with many rows removed by filter, big gaps between estimated and actual rows, sorts spilling to disk, nested loops with many loops, and the step with the highest actual time.',
        },
        {
          q: 'Estimated rows are way off from actual rows. Why, and what do you do?',
          a: 'Statistics are stale or too coarse, or columns are correlated. Run `ANALYZE`, increase the column statistics target, or create extended statistics.',
        },
        {
          q: 'Is it safe to run EXPLAIN ANALYZE on a DELETE?',
          a: 'It really deletes the rows. Wrap it in `BEGIN` ... `ROLLBACK`.',
        },
        {
          q: 'How do you find which queries to optimize?',
          a: 'Use `pg_stat_statements` to rank queries by total or mean time, plus slow-query logging (`log_min_duration_statement`) and APM traces.',
        },
      ],
      spoken: `"When a query is slow, I run EXPLAIN ANALYZE, usually with BUFFERS. Plain EXPLAIN only shows the estimated plan; ANALYZE actually runs it and shows real times and row counts. I read the tree from the innermost node and look for a sequential scan on a big table with lots of rows removed by filter, a big mismatch between estimated and actual rows — which means stale statistics — or sorts spilling to disk. Then I fix it with the right index, a query rewrite, or ANALYZE. To find the slow queries in the first place, I use pg_stat_statements."`,
      mistakes: [
        'Running `EXPLAIN ANALYZE` on an `UPDATE` or `DELETE` in production without a transaction and rollback.',
        'Reading `cost` as milliseconds. It is in abstract planner units; use the actual time from ANALYZE.',
        'Ignoring `loops` — the actual time shown is per loop, so a 0.1 ms step with 50,000 loops costs 5 seconds.',
        'Testing on a tiny dev database. With few rows, Postgres picks Seq Scan correctly and you learn nothing. Test with realistic data volume.',
        'Follow-up trap: "The query is fast in psql but slow from the app. Why?" Different parameters (a generic prepared-statement plan), cold cache vs warm cache, network/pool waiting, or the ORM generating a different query. Log the exact SQL and parameters.',
      ],
      takeaway: 'EXPLAIN shows the plan, EXPLAIN ANALYZE shows reality — compare estimated vs actual and fix the slowest node.',
    },
    {
      id: 'isolation-levels',
      title: 'Isolation Levels and Read Anomalies',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Isolation levels decide how much concurrent transactions can see of each other: Read Committed (default), Repeatable Read, and Serializable.',
      what: `When two transactions run at the same time, strange things can happen. These are called **read anomalies**:

- **Dirty read** — you read another transaction's changes **before it commits** (and it might roll back).
- **Non-repeatable read** — you read the same row twice and get **different values**, because someone committed an update in between.
- **Phantom read** — you run the same query twice and get **new or missing rows**, because someone inserted/deleted in between.
- **Lost update** — two transactions read a value, both change it, and one overwrites the other.

The SQL standard defines four **isolation levels**. Postgres supports:

- **Read Uncommitted** — in Postgres it behaves exactly like Read Committed.
- **Read Committed** (default) — no dirty reads; non-repeatable reads and phantoms can happen.
- **Repeatable Read** — no dirty reads, no non-repeatable reads, and in Postgres no phantoms either.
- **Serializable** — none of the anomalies; the result is as if transactions ran one at a time.

#### Deeper version
Postgres uses **MVCC** (Multi-Version Concurrency Control). Each transaction reads a **snapshot** of committed data:
- **Read Committed**: a new snapshot for **each statement**. Two SELECTs in one transaction can see different data.
- **Repeatable Read**: one snapshot for the **whole transaction**. In Postgres this also prevents phantoms (stronger than the standard requires). If you try to update a row that another transaction changed and committed after your snapshot, you get a **serialization error** and must retry.
- **Serializable**: like Repeatable Read, plus Postgres tracks read/write dependencies (SSI — Serializable Snapshot Isolation) and aborts transactions that could produce a result impossible in any one-at-a-time order. This catches **write skew** (two doctors both going off call because each saw the other on call).

Higher levels mean more safety but more aborted transactions, so your app must **retry** on error code \`40001\` (serialization_failure). Postgres never allows dirty reads at any level.`,
      why: `Concurrency bugs (double booking, overselling stock, wrong balances) only appear under real load and are hard to reproduce. Knowing isolation levels lets you choose the right protection: a stronger level, a lock, or an atomic update.`,
      analogy: `Read Committed is like reading a live scoreboard: each time you look you see the latest final scores. Repeatable Read is taking a photo of the scoreboard when you arrive and reading only the photo. Serializable is a referee who makes sure that, even with many players moving at once, the final result is one that could have happened if they had moved one by one — otherwise someone has to replay their move.`,
      code: [
        {
          title: 'Non-repeatable read in Read Committed',
          lang: 'sql',
          code: `-- Session A                                   -- Session B
BEGIN;  -- READ COMMITTED (default)
SELECT balance FROM accounts WHERE id = 1;   -- 100
                                              BEGIN;
                                              UPDATE accounts SET balance = 50 WHERE id = 1;
                                              COMMIT;
SELECT balance FROM accounts WHERE id = 1;   -- 50  (changed inside A's transaction!)
COMMIT;

-- Same steps with:  BEGIN ISOLATION LEVEL REPEATABLE READ;
-- the second SELECT in A still returns 100 (same snapshot)`,
        },
        {
          title: 'Serializable with retry in Node',
          lang: 'javascript',
          code: `async function runSerializable(pool, fn, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      // 40001 = serialization_failure, 40P01 = deadlock_detected -> safe to retry
      const retryable = err.code === '40001' || err.code === '40P01';
      if (!retryable || attempt === retries) throw err;
    } finally {
      client.release();
    }
  }
}`,
        },
      ],
      output: `In Read Committed, Session A sees 100 and then 50 inside the same transaction — a non-repeatable read. With Repeatable Read, A keeps seeing 100 until it commits, because it reads from one snapshot.

The Node helper runs the work in Serializable mode. If Postgres detects a conflict it raises \`40001\`; the helper rolls back and tries again (up to 3 times), which is the expected pattern for Serializable.`,
      questions: [
        {
          q: 'What is the default isolation level in PostgreSQL?',
          a: 'Read Committed. Each statement sees data committed before that statement began.',
        },
        {
          q: 'Explain dirty, non-repeatable and phantom reads.',
          a: 'Dirty: reading uncommitted changes. Non-repeatable: re-reading a row gives a different value. Phantom: re-running a query returns different rows because of inserts/deletes.',
        },
        {
          q: 'Does Postgres allow dirty reads?',
          a: 'No. Even if you ask for Read Uncommitted, Postgres behaves like Read Committed.',
        },
        {
          q: 'What is write skew and which level prevents it?',
          a: 'Two transactions read overlapping data, each makes a decision, and they update different rows, so together they break a rule (e.g. no doctor left on call). Only Serializable prevents it in Postgres (or explicit locks).',
        },
        {
          q: 'What must your app do when using Serializable?',
          a: 'Catch serialization failures (SQLSTATE `40001`) and retry the whole transaction.',
        },
      ],
      spoken: `"Isolation levels control what concurrent transactions see. The anomalies are dirty reads, non-repeatable reads, phantoms and lost updates. Postgres defaults to Read Committed, where every statement gets a fresh snapshot, so two reads in one transaction can differ. Repeatable Read uses one snapshot for the whole transaction, and in Postgres it also blocks phantoms. Serializable adds conflict detection so the result matches some one-at-a-time order, which even catches write skew. Postgres never allows dirty reads. With the stronger levels my code must retry on serialization errors, code 40001."`,
      mistakes: [
        'Assuming the default level prevents all race conditions. Read Committed allows lost updates if you read in Node and write back.',
        'Using Serializable without retry logic — users see random errors under load.',
        'Saying Postgres Repeatable Read allows phantoms. The SQL standard allows them, but Postgres\'s snapshot implementation prevents them.',
        'Setting the isolation level after the first query in the transaction — it must be set at `BEGIN` (or before the first statement).',
        'Follow-up trap: "How else can you prevent a lost update without Serializable?" Use an atomic update (`SET stock = stock - 1 WHERE stock > 0`), `SELECT ... FOR UPDATE`, or optimistic locking with a version column.',
      ],
      takeaway: 'Postgres defaults to Read Committed; use atomic updates or locks for common races, and Serializable (with retries) for the hard ones.',
    },
    {
      id: 'locks-deadlocks',
      title: 'Locks, SELECT ... FOR UPDATE, and Deadlocks',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Row locks stop two transactions changing the same row at once; FOR UPDATE locks rows you read; deadlocks happen when transactions wait on each other in a circle.',
      what: `A **lock** stops other transactions from doing something conflicting until you finish.

- **Row locks**: \`UPDATE\` and \`DELETE\` lock the rows they change until commit. Another transaction trying to change the same row **waits**.
- Normal \`SELECT\` takes **no row locks** — readers do not block writers, and writers do not block readers (thanks to MVCC).
- \`SELECT ... FOR UPDATE\` reads rows **and** locks them, so nobody else can change or lock them until you commit. This is **pessimistic locking**.

A **deadlock** is when transaction A waits for a lock B holds, while B waits for a lock A holds. Neither can move. Postgres detects this (after \`deadlock_timeout\`, 1 second by default), cancels one transaction with an error, and the other continues.

#### Deeper version
Row lock variants: \`FOR UPDATE\` (strongest), \`FOR NO KEY UPDATE\`, \`FOR SHARE\`, \`FOR KEY SHARE\`.

Useful options:
- \`NOWAIT\` — error immediately if the row is locked.
- \`SKIP LOCKED\` — skip locked rows. Perfect for **job queues**: many workers each grab different jobs without blocking each other.

**Table locks**: DDL like \`ALTER TABLE\` takes an \`ACCESS EXCLUSIVE\` lock that blocks everything, even reads. A waiting ALTER also blocks queries queued behind it — that is why migrations set \`lock_timeout\`.

**Advisory locks** (\`pg_advisory_lock(key)\`) are app-defined locks, e.g. "only one cron instance runs this job".

**Optimistic locking** is the alternative: no lock while reading; add a \`version\` column and \`UPDATE ... WHERE id = $1 AND version = $2\`. If 0 rows change, someone else won — retry or show a conflict.

**Avoiding deadlocks:** lock rows in a **consistent order** (for example, always by ascending id), keep transactions short, and retry on error \`40P01\`.`,
      why: `Booking the last seat, decrementing stock, transferring money, processing a job once — all need correct locking. Interviewers love "two users buy the last item at the same time — what happens?"`,
      analogy: `FOR UPDATE is like picking up the last shirt in a shop and holding it while you decide — others can see it but cannot take it. A deadlock is two people in a narrow corridor, each waiting for the other to step back. The security guard (Postgres) eventually tells one of them to go back.`,
      code: [
        {
          title: 'Prevent overselling with FOR UPDATE',
          lang: 'sql',
          code: `BEGIN;
-- Lock the product row; other buyers wait here until we commit
SELECT stock FROM products WHERE id = 7 FOR UPDATE;
-- app checks: stock > 0 ?
UPDATE products SET stock = stock - 1 WHERE id = 7;
INSERT INTO orders (user_id, product_id) VALUES (1, 7);
COMMIT;

-- Often simpler: one atomic conditional update (no explicit lock needed)
UPDATE products SET stock = stock - 1
WHERE id = 7 AND stock > 0
RETURNING stock;   -- 0 rows returned = sold out`,
        },
        {
          title: 'Job queue with SKIP LOCKED',
          lang: 'javascript',
          code: `// Many workers can run this at once; each gets a different job
async function takeNextJob(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      "SELECT id, payload FROM jobs WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED"
    );
    if (rows.length === 0) { await client.query('COMMIT'); return null; }
    await client.query("UPDATE jobs SET status = 'running' WHERE id = $1", [rows[0].id]);
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`,
        },
        {
          title: 'How a deadlock happens',
          lang: 'sql',
          code: `-- Transaction A                          -- Transaction B
BEGIN;                                     BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = 1;   -- A locks row 1
                                           UPDATE accounts SET balance = balance - 10 WHERE id = 2;  -- B locks row 2
UPDATE accounts SET balance = balance + 10 WHERE id = 2;   -- A waits for B
                                           UPDATE accounts SET balance = balance + 10 WHERE id = 1;  -- B waits for A
-- ERROR: deadlock detected (one of them is cancelled)

-- Fix: always lock in the same order (lowest id first) in every code path`,
        },
      ],
      output: `With \`FOR UPDATE\`, if two customers buy product 7 at the same time, the second one waits at the SELECT until the first commits, then sees the reduced stock. The atomic update does the same in one statement: when stock hits 0, it returns no rows, so the app says "sold out".

With \`SKIP LOCKED\`, five workers calling \`takeNextJob\` at once each receive a different job instead of all fighting for job #1.

In the deadlock example, after about a second Postgres cancels one transaction with "deadlock detected" (SQLSTATE \`40P01\`); the other completes. Locking rows in id order in both transactions prevents it.`,
      questions: [
        {
          q: 'What does SELECT ... FOR UPDATE do?',
          a: 'It reads rows and locks them until the transaction ends, so other transactions cannot update, delete or lock them (they wait). Plain readers are not blocked.',
        },
        {
          q: 'Two users try to buy the last item at the same time. How do you prevent overselling?',
          a: 'An atomic conditional update (`UPDATE ... SET stock = stock - 1 WHERE id = $1 AND stock > 0`) and check rows affected, or lock the row with `FOR UPDATE` inside a transaction. A `CHECK (stock >= 0)` constraint is a good safety net.',
        },
        {
          q: 'What is a deadlock and how do you avoid it?',
          a: 'Two transactions each wait for a lock the other holds. Postgres detects it and aborts one. Avoid it by locking in a consistent order, keeping transactions short, and retrying on deadlock errors.',
        },
        {
          q: 'Optimistic vs pessimistic locking?',
          a: 'Pessimistic locks the row up front (`FOR UPDATE`) — good when conflicts are frequent. Optimistic uses a version column and checks it during update — no waiting, good when conflicts are rare, but needs retry handling.',
        },
        {
          q: 'What is SKIP LOCKED used for?',
          a: 'Queue processing: each worker grabs rows that nobody else has locked, so workers never block on the same job.',
        },
      ],
      spoken: `"Postgres takes row locks automatically on UPDATE and DELETE, but plain SELECTs don't lock, so a read-then-write in my code can race. To prevent that I either do an atomic conditional update, like decrement stock where stock is greater than zero, or I lock the row with SELECT FOR UPDATE inside a transaction. For job queues I use FOR UPDATE SKIP LOCKED so workers don't collide. A deadlock is two transactions waiting on each other; Postgres kills one, so I lock rows in a consistent order, keep transactions short and retry. When conflicts are rare I prefer optimistic locking with a version column."`,
      mistakes: [
        'Reading stock with a plain `SELECT`, checking it in Node, then updating — two requests can both see stock = 1.',
        'Using `FOR UPDATE` outside a transaction — in autocommit mode the lock is released immediately after the statement.',
        'Holding row locks while calling external APIs, making every other request wait.',
        'Locking rows in different orders in different code paths, which causes deadlocks under load.',
        'Follow-up trap: "Does SELECT block UPDATE in Postgres?" No. With MVCC, plain reads and writes do not block each other; only conflicting writes or explicit locks wait.',
      ],
      takeaway: 'Plain reads do not lock — use atomic updates, FOR UPDATE, or version checks for races, and lock in a consistent order to avoid deadlocks.',
    },
    {
      id: 'triggers',
      title: 'Triggers',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A trigger runs a database function automatically before or after INSERT, UPDATE or DELETE on a table.',
      what: `A **trigger** tells Postgres: "whenever this event happens on this table, run this function automatically."

- **Events**: \`INSERT\`, \`UPDATE\`, \`DELETE\`, \`TRUNCATE\`.
- **Timing**: \`BEFORE\` (can change or cancel the row), \`AFTER\` (row is already written; good for side effects like audit logs), \`INSTEAD OF\` (on views).
- **Level**: \`FOR EACH ROW\` (once per changed row) or \`FOR EACH STATEMENT\` (once per statement).

In Postgres a trigger calls a **trigger function** written in PL/pgSQL (Postgres's procedural language) that \`RETURNS trigger\`.

#### Deeper version
Inside a row trigger function you get special variables:
- \`NEW\` — the new row (INSERT/UPDATE).
- \`OLD\` — the old row (UPDATE/DELETE).
- \`TG_OP\` — which operation fired it.

In a \`BEFORE\` row trigger, returning \`NEW\` continues with that (possibly modified) row; returning \`NULL\` silently skips the operation.

Triggers run **inside the same transaction** as the statement. If the trigger fails, the whole statement fails and rolls back.

**Good uses:** \`updated_at\` timestamps, audit/history tables, keeping a denormalized counter in sync, enforcing complex rules.
**Downsides:** "hidden magic" — developers reading Node code don't see them; they slow down bulk writes; chains of triggers are hard to debug. Keep them small and documented in migrations.`,
      why: `Some rules must hold no matter which service, script or admin console writes to the table. Triggers enforce them at the database level, so nobody can forget to update the audit log or the timestamp.`,
      analogy: `A trigger is like a motion-sensor light. You don't switch it on yourself — whenever someone walks in (an INSERT/UPDATE), it turns on automatically. Useful, but confusing if nobody told you it was there.`,
      code: [
        {
          title: 'Auto-update updated_at',
          lang: 'sql',
          code: `CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();   -- modify the row before it is saved
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();   -- PG 11+; older versions: EXECUTE PROCEDURE`,
        },
        {
          title: 'Audit log trigger',
          lang: 'sql',
          code: `CREATE TABLE audit_log (
  id         BIGSERIAL PRIMARY KEY,
  table_name TEXT,
  operation  TEXT,
  old_data   JSONB,
  new_data   JSONB,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_changes()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_data, new_data)
  VALUES (TG_TABLE_NAME, TG_OP,
          CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END,
          CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END);
  RETURN NULL;   -- return value is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_audit
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_changes();`,
        },
      ],
      output: `After the first trigger, any \`UPDATE users SET name = 'X' WHERE id = 1\` also sets \`updated_at\` to the current time, even if the app forgot to.

After the second trigger, every insert, update or delete on \`orders\` adds a row to \`audit_log\` with the operation name and the old/new row as JSON. If writing the audit row fails, the original change is rolled back too, because both run in the same transaction.`,
      questions: [
        {
          q: 'What is a trigger?',
          a: 'A rule that automatically runs a function when an INSERT, UPDATE, DELETE or TRUNCATE happens on a table, before or after the change.',
        },
        {
          q: 'BEFORE vs AFTER triggers?',
          a: 'BEFORE runs before the row is written and can change `NEW` or cancel the row by returning NULL. AFTER runs once the row is written; it is used for side effects like audit logs.',
        },
        {
          q: 'What are OLD and NEW?',
          a: 'Special row variables in row-level trigger functions: `OLD` is the row before the change, `NEW` the row after.',
        },
        {
          q: 'Why do some teams avoid triggers?',
          a: 'They hide logic from application code, make bulk writes slower, and can cause surprising cascades that are hard to debug and test.',
        },
      ],
      spoken: `"A trigger automatically runs a function when rows are inserted, updated or deleted. BEFORE triggers can modify the incoming row through NEW — I use that to set updated_at — and AFTER triggers are good for side effects like writing an audit log with OLD and NEW as JSONB. Triggers run inside the same transaction, so if they fail, the change rolls back. I use them for small, must-always-happen rules, but I keep business logic mostly in the application, because triggers are invisible from the code and can slow down bulk writes."`,
      mistakes: [
        'Putting heavy business logic or slow work in triggers — every write pays for it.',
        'Forgetting `RETURN NEW` in a BEFORE row trigger; returning NULL silently skips the write.',
        'Calling external systems from a trigger. It cannot be rolled back. Use `LISTEN/NOTIFY` or an outbox table instead.',
        'Not documenting triggers, so teammates are surprised by "magic" changes.',
        'Follow-up trap: "Can a trigger cause infinite recursion?" Yes, if a trigger updates the same table and fires itself. Guard with a condition (for example `WHEN (OLD.* IS DISTINCT FROM NEW.*)`) or `pg_trigger_depth()`.',
      ],
      takeaway: 'Triggers auto-run functions on table changes — great for timestamps and audit logs, risky as hidden business logic.',
    },
    {
      id: 'functions-procedures',
      title: 'Stored Functions and Procedures',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Functions and procedures are code stored inside Postgres; functions return values and run inside a query, procedures (PG 11+) are CALLed and can commit transactions.',
      what: `You can store reusable code **inside the database**:

- A **function** (\`CREATE FUNCTION\`) takes inputs and **returns** a value or a set of rows. You use it inside SQL: \`SELECT my_func(5)\`. It runs inside the caller's transaction.
- A **procedure** (\`CREATE PROCEDURE\`, Postgres 11+) is run with \`CALL my_proc()\`. It does not return a value in the same way, but it **can COMMIT or ROLLBACK** inside itself — useful for big batch jobs.

They can be written in plain **SQL** or in **PL/pgSQL** (adds variables, IF, loops, exceptions). Extensions allow other languages too.

#### Deeper version
Function **volatility** tells the planner how it behaves:
- \`IMMUTABLE\` — same input always gives same output, no database reads (for example, math). Required for use in expression indexes.
- \`STABLE\` — same result within one statement (can read tables).
- \`VOLATILE\` (default) — can change anything (like \`random()\`, or functions that write).

\`SECURITY DEFINER\` runs the function with the owner's permissions — powerful for controlled access, but set a safe \`search_path\` to avoid security holes.

**Pros:** one round trip for multi-step logic, logic close to the data, shared by all clients.
**Cons:** harder to version, test, debug and deploy than app code; ties you to Postgres; business logic gets split between Node and SQL. Many Node teams keep business logic in the app and use functions for small, data-heavy pieces. Supabase-style setups use them more heavily (RPC).`,
      why: `Some operations need many queries in a row. Doing them in one database call cuts network round trips and keeps them atomic. Interviewers ask to see whether you understand the trade-off between "logic in the DB" and "logic in the app".`,
      analogy: `A stored function is like a speed-dial button on a phone: instead of dialling all digits (sending many queries) every time, you press one button and the phone does the steps for you.`,
      code: [
        {
          title: 'SQL function and PL/pgSQL function',
          lang: 'sql',
          code: `-- Simple SQL function returning a table
CREATE OR REPLACE FUNCTION user_orders(p_user_id BIGINT)
RETURNS TABLE (order_id BIGINT, amount NUMERIC)
LANGUAGE sql STABLE AS $$
  SELECT id, amount FROM orders WHERE user_id = p_user_id ORDER BY id;
$$;

SELECT * FROM user_orders(42);

-- PL/pgSQL with logic and an error
CREATE OR REPLACE FUNCTION transfer(p_from BIGINT, p_to BIGINT, p_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE accounts SET balance = balance - p_amount
  WHERE id = p_from AND balance >= p_amount;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient funds for account %', p_from;
  END IF;
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;
END;
$$;

SELECT transfer(1, 2, 100);`,
        },
        {
          title: 'Procedure that commits in batches',
          lang: 'sql',
          code: `CREATE OR REPLACE PROCEDURE archive_old_orders()
LANGUAGE plpgsql AS $$
DECLARE
  moved INT;
BEGIN
  LOOP
    WITH batch AS (
      DELETE FROM orders
      WHERE id IN (SELECT id FROM orders WHERE created_at < now() - interval '2 years' LIMIT 5000)
      RETURNING *
    )
    INSERT INTO orders_archive SELECT * FROM batch;
    GET DIAGNOSTICS moved = ROW_COUNT;
    COMMIT;                          -- allowed in procedures, not functions
    EXIT WHEN moved = 0;
  END LOOP;
END;
$$;

CALL archive_old_orders();`,
        },
        {
          title: 'Calling them from Node',
          lang: 'javascript',
          code: `// Functions are called with SELECT, procedures with CALL
const { rows } = await pool.query('SELECT * FROM user_orders($1)', [42]);
await pool.query('SELECT transfer($1, $2, $3)', [1, 2, 100]);
await pool.query('CALL archive_old_orders()');`,
        },
      ],
      output: `\`user_orders(42)\` returns user 42's orders like a table. \`transfer(1, 2, 100)\` moves money in one round trip; if account 1 has too little, \`RAISE EXCEPTION\` aborts it and nothing changes — in Node this arrives as a normal error with the message "Insufficient funds for account 1".

The procedure moves old orders 5,000 at a time and commits after each batch, so it never holds locks on millions of rows. It stops when a batch moves zero rows.`,
      questions: [
        {
          q: 'Function vs procedure in PostgreSQL?',
          a: 'A function returns a value or rows and is used inside queries (`SELECT f()`); it cannot commit. A procedure (PG 11+) is run with `CALL` and can control transactions with `COMMIT`/`ROLLBACK` inside.',
        },
        {
          q: 'What is PL/pgSQL?',
          a: 'Postgres\'s built-in procedural language. It adds variables, IF/ELSE, loops and exception handling on top of SQL.',
        },
        {
          q: 'What do IMMUTABLE, STABLE and VOLATILE mean?',
          a: 'They tell the planner how predictable a function is. IMMUTABLE: same output for same input forever. STABLE: same within one statement. VOLATILE: can change any time. Wrong labels can cause wrong results.',
        },
        {
          q: 'Should business logic live in stored procedures?',
          a: 'It depends. They reduce round trips and keep data rules close to the data, but are harder to test, version and debug. Most Node teams keep core logic in the app and use DB functions selectively.',
        },
      ],
      spoken: `"Postgres lets me store code in the database. Functions return a value or a set of rows and are used inside queries, and they run in the caller's transaction. Procedures, added in version 11, are run with CALL and can commit inside, which is useful for batch jobs like archiving data in chunks. I write them in SQL or PL/pgSQL, and I set volatility correctly — IMMUTABLE, STABLE or VOLATILE. I use them for data-heavy steps that benefit from one round trip, but keep most business logic in Node, where it's easier to test and deploy."`,
      mistakes: [
        'Marking a function `IMMUTABLE` when it reads tables or depends on time zone — the planner may cache wrong results.',
        'Trying to `COMMIT` inside a function. Only procedures can, and only when called outside an explicit transaction block.',
        'Building dynamic SQL in PL/pgSQL with string concatenation. Use `EXECUTE ... USING` and `format()` with `%I`/`%L`.',
        'Not versioning functions in migrations, so production and dev drift apart.',
        'Follow-up trap: "What is SECURITY DEFINER?" The function runs with its owner\'s privileges instead of the caller\'s. Useful for controlled access, but always set `search_path` to avoid privilege escalation.',
      ],
      takeaway: 'Functions return values inside queries; procedures are CALLed and can commit — use them selectively, versioned in migrations.',
    },
    {
      id: 'mvcc-vacuum',
      title: 'MVCC and VACUUM',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Postgres keeps multiple versions of rows so readers never block writers; VACUUM cleans up the old dead versions.',
      what: `**MVCC** (Multi-Version Concurrency Control) is how Postgres lets many transactions read and write at the same time.

- An \`UPDATE\` does not overwrite a row. It writes a **new version** of the row and marks the old one as expired.
- A \`DELETE\` just marks the row as expired.
- Each transaction sees the versions that were valid for its **snapshot**.

So readers see a consistent picture and **never block writers** (and writers never block readers).

The old versions that nobody can see any more are called **dead tuples** (a tuple = a row version). **VACUUM** cleans them up so the space can be reused. **Autovacuum** is a background process that runs VACUUM (and ANALYZE) automatically.

#### Deeper version
Each row version stores \`xmin\` (the transaction that created it) and \`xmax\` (the transaction that deleted/replaced it). Visibility rules compare these with your snapshot.

**Bloat:** if dead tuples pile up faster than vacuum cleans them, tables and indexes grow and queries slow down. Common causes:
- **Long-running transactions** (or "idle in transaction" connections) — vacuum cannot remove versions they might still need.
- Heavy update workloads with autovacuum settings too lazy for big tables.

Types:
- \`VACUUM\` — marks space reusable, runs alongside normal traffic; usually does not shrink the file.
- \`VACUUM FULL\` — rewrites the table to shrink it, but takes an exclusive lock (blocks everything). Tools like \`pg_repack\` do it online.
- \`ANALYZE\` — refreshes planner statistics.

Vacuum also prevents **transaction ID wraparound** (transaction ids are 32-bit and reused), which is why autovacuum must never be disabled.

**HOT updates** (Heap-Only Tuple): if no indexed column changes and there is room on the page, Postgres can skip updating indexes — another reason not to index columns that change constantly.`,
      why: `MVCC is why Postgres handles concurrent reads and writes so well. Understanding vacuum explains real production problems: tables growing huge, queries getting slower over months, and why "idle in transaction" connections are dangerous.`,
      analogy: `MVCC is like a Google Doc's version history. When you edit, a new version is saved; someone reading the old version is not interrupted. VACUUM is the cleaner who deletes old versions that nobody is looking at any more, so the folder doesn't fill up.`,
      code: [
        {
          title: 'See row versions and dead tuples',
          lang: 'sql',
          code: `-- xmin = id of the transaction that created this row version
SELECT xmin, xmax, id, name FROM users WHERE id = 1;

UPDATE users SET name = 'Asha K' WHERE id = 1;
SELECT xmin, id, name FROM users WHERE id = 1;   -- new xmin: a new version was written

-- Which tables have many dead tuples, and when was autovacuum last run?
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 5;

-- Manual cleanup + fresh statistics
VACUUM (VERBOSE, ANALYZE) users;`,
        },
        {
          title: 'Find transactions that block vacuum',
          lang: 'sql',
          code: `-- Long-running or idle-in-transaction sessions keep old versions alive
SELECT pid, state, now() - xact_start AS tx_age, left(query, 60) AS query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start
LIMIT 5;

-- Protect yourself: kill sessions idle inside a transaction for too long
ALTER DATABASE appdb SET idle_in_transaction_session_timeout = '60s';`,
        },
      ],
      output: `After the update, the row shows a different \`xmin\`, proving Postgres wrote a new version instead of changing the old one in place. \`pg_stat_user_tables\` shows tables with the most dead tuples and when autovacuum last cleaned them.

The activity query lists the oldest open transactions. A session that has been "idle in transaction" for hours is a red flag: it blocks vacuum from cleaning up and causes bloat. The timeout setting closes such sessions automatically.`,
      questions: [
        {
          q: 'What is MVCC?',
          a: 'Multi-Version Concurrency Control: updates create new row versions instead of overwriting, and each transaction reads from a snapshot. Readers and writers do not block each other.',
        },
        {
          q: 'Why does Postgres need VACUUM?',
          a: 'Because updates and deletes leave dead row versions. VACUUM makes their space reusable, updates visibility info, and prevents transaction ID wraparound.',
        },
        {
          q: 'VACUUM vs VACUUM FULL?',
          a: 'VACUUM frees space for reuse without blocking normal work. VACUUM FULL rewrites the table to shrink it on disk but locks it exclusively.',
        },
        {
          q: 'What causes table bloat?',
          a: 'Dead tuples piling up faster than vacuum removes them — often from long-running or idle-in-transaction sessions, or autovacuum not tuned for a heavy-update table.',
        },
      ],
      spoken: `"Postgres uses MVCC: an update writes a new version of the row and marks the old one dead, and each transaction reads from its own snapshot. That's why readers don't block writers. The cost is dead row versions, which VACUUM — normally autovacuum — cleans up so the space can be reused; it also prevents transaction ID wraparound. In production I watch for bloat, which is usually caused by long-running or idle-in-transaction connections holding old snapshots. VACUUM FULL can shrink a table but locks it, so I'd use pg_repack instead."`,
      mistakes: [
        'Disabling autovacuum to "save resources" — leads to bloat and, eventually, wraparound emergencies.',
        'Leaving transactions open (for example, a forgotten `BEGIN` in a script or a leaked client), which blocks cleanup.',
        'Running `VACUUM FULL` on a busy production table and locking it for minutes.',
        'Thinking `DELETE` immediately frees disk space. It only marks rows dead; space is reused after vacuum.',
        'Follow-up trap: "Why is an UPDATE in Postgres more expensive than you might expect?" It writes a whole new row version and may update every index (unless it is a HOT update), plus creates vacuum work.',
      ],
      takeaway: 'MVCC keeps old row versions so reads never block writes; VACUUM cleans them — keep autovacuum on and transactions short.',
    },
    {
      id: 'full-text-search',
      title: 'Full-Text Search in Postgres',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'Postgres can do word-based search with ranking using tsvector, tsquery and a GIN index — often enough before reaching for Elasticsearch.',
      what: `\`LIKE '%word%'\` is slow on big tables and dumb about language ("running" does not match "run").

Postgres **full-text search** fixes this:
- \`tsvector\` — a processed list of words (lexemes) from a document, with stemming ("running" → "run") and stop words removed ("the", "a").
- \`tsquery\` — a processed search query.
- \`@@\` — the match operator: \`document_vector @@ query\`.
- \`ts_rank\` — scores how well a row matches, for sorting.

Add a **GIN index** on the \`tsvector\` to make it fast.

#### Deeper version
Store the vector in a **generated column** (Postgres 12+) so it updates automatically, and index it. Use \`setweight\` to make title matches count more than body matches.

\`websearch_to_tsquery\` (Postgres 11+) accepts Google-like input: quotes for phrases, \`or\`, and \`-word\` to exclude. It is safe for raw user input, unlike \`to_tsquery\`, which errors on bad syntax.

For fuzzy matching and typos ("iphnoe"), use the \`pg_trgm\` extension with a trigram GIN index and \`similarity()\` or \`%\`.

When to move to Elasticsearch/OpenSearch/Meilisearch: very large corpora, complex relevance tuning, facets at scale, many languages, or search load you want off the main database. For AI apps, \`pgvector\` adds vector similarity search for embeddings — often combined with full-text search (hybrid search).`,
      why: `Most apps need a search box. Postgres full-text search gives decent, ranked search without running and syncing a separate search cluster.`,
      analogy: `\`LIKE '%word%'\` is reading every page of every book looking for letters. Full-text search is a library catalogue that already lists which books mention each topic, understands that "running" and "run" are the same topic, and ranks the best books first.`,
      code: [
        {
          title: 'Searchable articles',
          lang: 'sql',
          code: `CREATE TABLE articles (
  id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title  TEXT NOT NULL,
  body   TEXT NOT NULL,
  search tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', body),  'B')
  ) STORED
);

CREATE INDEX idx_articles_search ON articles USING GIN (search);

-- User types: postgres indexing -mysql
SELECT id, title,
       ts_rank(search, q) AS rank
FROM articles,
     websearch_to_tsquery('english', 'postgres indexing -mysql') AS q
WHERE search @@ q
ORDER BY rank DESC
LIMIT 10;`,
        },
        {
          title: 'Fuzzy match with pg_trgm',
          lang: 'sql',
          code: `CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- Typo-tolerant search, also speeds up ILIKE '%phone%'
SELECT name, similarity(name, 'iphnoe') AS score
FROM products
WHERE name % 'iphnoe'
ORDER BY score DESC
LIMIT 5;`,
        },
      ],
      output: `The search query returns articles that mention "postgres" and "indexing" (also "indexes", "indexed" through stemming) but not "mysql", with title matches ranked higher than body matches. The GIN index keeps it fast even with millions of rows.

The trigram query finds products like "iPhone 15" even though the user misspelled it, sorted by similarity.`,
      questions: [
        {
          q: 'How do you implement search in Postgres?',
          a: 'Build a `tsvector` (often a generated column), index it with GIN, convert the user input with `websearch_to_tsquery`, match with `@@` and sort by `ts_rank`.',
        },
        {
          q: 'Why not use LIKE \'%term%\'?',
          a: 'A leading wildcard cannot use a normal B-tree index, so it scans the whole table, and it does not understand word forms or ranking.',
        },
        {
          q: 'When would you switch to Elasticsearch?',
          a: 'When you need advanced relevance tuning, facets/aggregations at scale, many languages, huge datasets, or want to move search load off the primary database.',
        },
        {
          q: 'How do you handle typos?',
          a: 'Use the `pg_trgm` extension with a trigram index and `similarity()` or the `%` operator.',
        },
      ],
      spoken: `"Postgres has built-in full-text search. I store a tsvector, usually as a generated column that weights the title above the body, put a GIN index on it, and turn the user's input into a query with websearch_to_tsquery, which safely handles quotes and minus signs. I match with the double-at operator and sort by ts_rank. For typos I add pg_trgm. This covers most app search boxes without running Elasticsearch; I'd only move to a dedicated engine for heavy relevance tuning, facets or very large scale."`,
      mistakes: [
        'Using `LIKE \'%term%\'` on a big table and wondering why it is slow.',
        'Calling `to_tsvector(...)` in the `WHERE` clause without a matching expression index or stored column, so every row is processed per search.',
        'Passing raw user input to `to_tsquery`, which throws syntax errors on input like `a & | b`. Use `websearch_to_tsquery` or `plainto_tsquery`.',
        'Mixing languages: building the vector with `english` and the query with `simple` gives poor matches.',
        'Follow-up trap: "Can Postgres do semantic / AI search?" Yes, with the `pgvector` extension for embedding similarity, often combined with full-text search for hybrid ranking.',
      ],
      takeaway: 'tsvector + GIN + websearch_to_tsquery gives fast, ranked search inside Postgres; add pg_trgm for typos.',
    },
    {
      id: 'replication-partitioning-scaling',
      title: 'Scaling Postgres: Read Replicas, Partitioning and Sharding',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Scale reads with replicas, manage huge tables with partitioning, and shard only when one primary can no longer handle the writes.',
      what: `When one database server is not enough, there are a few tools, usually used in this order:

1. **Optimize first**: indexes, better queries, connection pooling, caching (Redis).
2. **Vertical scaling**: a bigger machine (more CPU, RAM, faster disk).
3. **Read replicas**: copies of the database that receive changes from the **primary**. Send reads to replicas and writes to the primary.
4. **Partitioning**: split one huge table into smaller pieces (for example one per month) inside the **same** database.
5. **Sharding**: split data across **multiple** database servers (for example by \`tenant_id\`).

#### Deeper version
**Replication** in Postgres is usually **streaming replication** of the WAL (write-ahead log).
- **Asynchronous** (common): the primary does not wait for replicas. Fast, but replicas can lag, so a user may not see their own write right after saving (**replication lag**). Fix: read your own writes from the primary for a short time, or route critical reads to the primary.
- **Synchronous**: the primary waits for a replica to confirm. Safer, slower.
- **Logical replication**: replicates selected tables as row changes; used for upgrades and feeding other systems.
- Failover (promoting a replica) is usually handled by the managed service (RDS, Cloud SQL) or tools like Patroni.

**Partitioning** (declarative, Postgres 10+): \`PARTITION BY RANGE\` (dates), \`LIST\` (region), or \`HASH\`. Benefits: **partition pruning** (queries only touch relevant partitions) and instant data removal (\`DROP\` an old partition instead of a huge \`DELETE\`). The partition key should appear in most queries; unique constraints must include the partition key.

**Sharding** adds big complexity: cross-shard joins and transactions are hard, rebalancing is hard. Options: app-level sharding by tenant, or the **Citus** extension.`,
      why: `System design rounds often ask "your Postgres is overloaded — what do you do?" A clear, step-by-step answer (optimize → scale up → replicas → partition → shard) shows senior judgment.`,
      analogy: `Read replicas are like photocopies of a popular textbook in a library: many students can read at once, but corrections are made only in the master copy and copied later. Partitioning is splitting a giant register into one notebook per month. Sharding is opening branch libraries in different cities, each holding different books.`,
      code: [
        {
          title: 'Range partitioning by month',
          lang: 'sql',
          code: `CREATE TABLE events (
  id         BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id    BIGINT NOT NULL,
  type       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, created_at)          -- must include the partition key
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_01 PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE events_2026_02 PARTITION OF events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Only scans events_2026_02 (partition pruning)
SELECT COUNT(*) FROM events
WHERE created_at >= '2026-02-01' AND created_at < '2026-03-01';

-- Retention: drop a whole month instantly instead of DELETE
DROP TABLE events_2026_01;`,
        },
        {
          title: 'Routing reads and writes in Node',
          lang: 'javascript',
          code: `import pg from 'pg';

const primary = new pg.Pool({ connectionString: process.env.PRIMARY_URL, max: 10 });
const replica = new pg.Pool({ connectionString: process.env.REPLICA_URL, max: 10 });

// Writes always go to the primary
export const write = (sql, params) => primary.query(sql, params);

// Reads go to the replica unless we need fresh data (read-your-own-writes)
export const read = (sql, params, { fresh = false } = {}) =>
  (fresh ? primary : replica).query(sql, params);

// Example: right after updating a profile, read from primary
await write('UPDATE users SET name = $1 WHERE id = $2', ['Asha', 1]);
const { rows } = await read('SELECT name FROM users WHERE id = $1', [1], { fresh: true });`,
        },
      ],
      output: `The partitioned \`events\` table looks like one table to the app, but the February query only scans the February partition. Deleting a month of data is an instant \`DROP TABLE\` instead of a slow \`DELETE\` that creates millions of dead rows.

In the Node example, normal reads hit the replica to take load off the primary. The read right after the update uses \`fresh: true\` so the user sees "Asha" even if the replica is a second behind.`,
      questions: [
        {
          q: 'Your Postgres database is overloaded. What steps do you take?',
          a: 'Find the slow queries (pg_stat_statements, EXPLAIN ANALYZE), add indexes and fix queries, add pooling and caching, scale up the machine, add read replicas for read-heavy load, partition huge tables, and only then consider sharding.',
        },
        {
          q: 'What is replication lag and how do you handle it?',
          a: 'With async replication, replicas are slightly behind the primary. Handle it by reading from the primary right after a write (read-your-own-writes), or routing consistency-critical reads to the primary.',
        },
        {
          q: 'Partitioning vs sharding?',
          a: 'Partitioning splits a table into pieces inside one database server. Sharding splits data across multiple servers. Partitioning is much simpler; sharding scales writes but makes joins and transactions across shards hard.',
        },
        {
          q: 'What is partition pruning?',
          a: 'When a query filters on the partition key, Postgres skips partitions that cannot contain matching rows, so it scans less data.',
        },
      ],
      spoken: `"I scale Postgres step by step. First I fix the queries and indexes, add pooling and a Redis cache, and scale the machine up. For read-heavy load I add read replicas through streaming replication, sending writes to the primary and most reads to replicas — while handling replication lag by reading my own writes from the primary. For huge time-based tables I use declarative partitioning, which gives partition pruning and lets me drop old data instantly. Sharding across servers, by tenant for example, is the last step, because cross-shard joins and transactions get really complicated."`,
      mistakes: [
        'Jumping to sharding before fixing indexes and queries.',
        'Reading from a replica right after a write and showing the user stale data.',
        'Choosing a partition key that most queries do not filter on, so every query scans every partition.',
        'Creating thousands of tiny partitions — planning overhead grows.',
        'Follow-up trap: "Are read replicas a backup?" Not really. A bad `DELETE` replicates instantly. You still need backups and point-in-time recovery (WAL archiving).',
      ],
      takeaway: 'Optimize → scale up → replicas for reads → partition big tables → shard last; always plan for replication lag.',
    },
  ],
  rapidFire: [
    { q: 'What is the logical execution order of a SELECT?', a: 'FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT.' },
    { q: 'How do you check for NULL?', a: 'With `IS NULL` / `IS NOT NULL`, never `= NULL`.' },
    { q: 'What does COALESCE do?', a: 'Returns the first non-NULL argument, e.g. `COALESCE(age, 0)`.' },
    { q: 'DELETE vs TRUNCATE?', a: '`DELETE` removes chosen rows one by one and fires row triggers; `TRUNCATE` empties the whole table fast.' },
    { q: 'UNION vs UNION ALL?', a: '`UNION` removes duplicates (extra work); `UNION ALL` keeps all rows and is faster.' },
    { q: 'What does RETURNING do in Postgres?', a: 'Returns the rows affected by INSERT/UPDATE/DELETE, saving a second query.' },
    { q: 'TEXT vs VARCHAR(n) in Postgres?', a: 'Same performance; `VARCHAR(n)` only adds a length check. `TEXT` is common.' },
    { q: 'Which type should store money?', a: '`NUMERIC(p,s)` or integer cents — never `FLOAT`/`REAL`.' },
    { q: 'TIMESTAMP vs TIMESTAMPTZ?', a: 'Use `TIMESTAMPTZ`; it stores an absolute moment (UTC internally) and converts to the session time zone.' },
    { q: 'What is a primary key?', a: 'A unique, non-NULL column (or columns) that identifies each row.' },
    { q: 'Does Postgres auto-index foreign keys?', a: 'No — only primary keys and unique constraints. Index FK columns yourself.' },
    { q: 'What does ON DELETE CASCADE do?', a: 'Deletes child rows automatically when the parent row is deleted.' },
    { q: 'INNER JOIN vs LEFT JOIN?', a: 'INNER keeps only matches; LEFT keeps all left rows with NULLs where no match.' },
    { q: 'How do you find rows with no match in another table?', a: '`LEFT JOIN ... WHERE right.id IS NULL` or `NOT EXISTS`.' },
    { q: 'Why avoid NOT IN with a subquery?', a: 'If the subquery returns any NULL, NOT IN returns no rows.' },
    { q: 'WHERE vs HAVING?', a: 'WHERE filters rows before grouping; HAVING filters groups after aggregation.' },
    { q: 'COUNT(*) vs COUNT(col)?', a: '`COUNT(*)` counts all rows; `COUNT(col)` skips NULLs.' },
    { q: 'What is a correlated subquery?', a: 'A subquery that uses a column from the outer query, logically run per outer row.' },
    { q: 'What is the default index type in Postgres?', a: 'B-tree.' },
    { q: 'Which index for JSONB or arrays?', a: 'GIN.' },
    { q: 'What is the leftmost prefix rule?', a: 'A composite index on (a, b) helps queries on a or a+b, not on b alone.' },
    { q: 'Why might an index be skipped?', a: 'Low selectivity, a function on the column, leading wildcard LIKE, stale stats, or a tiny table.' },
    { q: 'How do you add an index without blocking writes?', a: '`CREATE INDEX CONCURRENTLY`.' },
    { q: 'What is a partial index?', a: 'An index over only rows matching a WHERE, e.g. `WHERE deleted_at IS NULL`.' },
    { q: 'What is 3NF in one line?', a: 'Every non-key column depends on the key, the whole key, and nothing but the key.' },
    { q: 'Why denormalize?', a: 'To speed up hot reads by avoiding joins/aggregates, at the cost of keeping copies in sync.' },
    { q: 'What does ACID stand for?', a: 'Atomicity, Consistency, Isolation, Durability.' },
    { q: 'How does Postgres guarantee durability?', a: 'The Write-Ahead Log (WAL) is flushed to disk before COMMIT returns.' },
    { q: 'How do you run a transaction with pg Pool?', a: '`pool.connect()` one client, BEGIN/COMMIT/ROLLBACK on it, `release()` in finally.' },
    { q: 'Default isolation level in Postgres?', a: 'Read Committed.' },
    { q: 'Does Postgres allow dirty reads?', a: 'No, at any isolation level.' },
    { q: 'What error code means serialization failure?', a: '`40001` — retry the transaction. Deadlock is `40P01`.' },
    { q: 'What does SELECT ... FOR UPDATE do?', a: 'Locks the selected rows until the transaction ends so others cannot change them.' },
    { q: 'What is SKIP LOCKED for?', a: 'Job queues — each worker takes rows nobody else has locked.' },
    { q: 'How do you avoid deadlocks?', a: 'Lock rows in a consistent order, keep transactions short, retry on 40P01.' },
    { q: 'What is optimistic locking?', a: 'Update with `WHERE version = $old`; if 0 rows change, someone else won — retry.' },
    { q: 'Atomic way to prevent overselling?', a: '`UPDATE ... SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock`.' },
    { q: 'How do you upsert in Postgres?', a: '`INSERT ... ON CONFLICT (cols) DO UPDATE SET ... = EXCLUDED....` or `DO NOTHING`.' },
    { q: 'ROW_NUMBER vs RANK vs DENSE_RANK on ties?', a: '1,2,3 vs 1,2,2,4 vs 1,2,2,3.' },
    { q: 'How do you compute a running total?', a: '`SUM(amount) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`.' },
    { q: 'What does LAG do?', a: 'Returns a value from the previous row in the window, e.g. yesterday\'s sales.' },
    { q: 'Top 1 per group shortcut in Postgres?', a: '`DISTINCT ON (group_col) ... ORDER BY group_col, sort_col DESC`.' },
    { q: 'Second highest salary in one line?', a: '`SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);`' },
    { q: 'What is a recursive CTE used for?', a: 'Hierarchies: org charts, category trees, threaded comments.' },
    { q: 'View vs materialized view?', a: 'A view re-runs its query every time; a materialized view stores the result and must be refreshed.' },
    { q: 'What does REFRESH ... CONCURRENTLY need?', a: 'A unique index on the materialized view.' },
    { q: 'JSON vs JSONB?', a: 'JSONB is parsed binary: faster queries and indexable. Use JSONB.' },
    { q: '-> vs ->> on JSONB?', a: '`->` returns JSONB, `->>` returns text.' },
    { q: 'EXPLAIN vs EXPLAIN ANALYZE?', a: 'EXPLAIN shows the estimated plan; ANALYZE runs the query and shows actual times.' },
    { q: 'Which extension finds your slowest queries?', a: '`pg_stat_statements`.' },
    { q: 'How do you stop SQL injection?', a: 'Parameterized queries (`$1`, `$2`) and allow-lists for identifiers.' },
    { q: 'Why use a connection pool?', a: 'Connections are expensive and limited; a pool reuses a few open ones.' },
    { q: 'What is PgBouncer?', a: 'An external connection pooler that lets many clients share few Postgres connections.' },
    { q: 'What is the N+1 problem?', a: 'One query for a list plus one query per item; fix with joins, include/select, or batching.' },
    { q: 'prisma migrate dev vs deploy?', a: '`dev` creates and applies migrations locally; `deploy` applies pending ones in production.' },
    { q: 'What is expand and contract?', a: 'Zero-downtime schema change: add new, dual-write and backfill, switch reads, remove old later.' },
    { q: 'Why is OFFSET pagination slow at depth?', a: 'Postgres still reads and discards all skipped rows; use keyset pagination.' },
    { q: 'What is MVCC?', a: 'Updates write new row versions; each transaction reads a snapshot, so readers don\'t block writers.' },
    { q: 'What does VACUUM do?', a: 'Cleans dead row versions for reuse and prevents transaction ID wraparound.' },
    { q: 'Function vs procedure?', a: 'Functions return values inside queries; procedures are CALLed and can COMMIT.' },
  ],
};
