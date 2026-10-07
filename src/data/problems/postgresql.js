// Interview problems for the PostgreSQL stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'postgresql',
  problems: [
    {
      id: 'employees-earning-more-than-manager',
      title: 'Employees who earn more than their manager',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'joins',
      question: `The \`employees\` table stores every employee. \`manager_id\` points to another row in the **same** table (the boss). The CEO has no manager, so their \`manager_id\` is NULL.

\`\`\`text
employees
 id | name  | salary | manager_id | department
----+-------+--------+------------+-------------
  1 | Asha  | 150000 |       NULL | Engineering
  2 | Ben   |  90000 |          1 | Engineering
  3 | Chen  |  95000 |          2 | Engineering
  4 | Dev   |  60000 |          1 | Sales
  5 | Eva   |  58000 |          4 | Sales
  6 | Farah |  72000 |          4 | Sales
\`\`\`

Write a query that lists every employee who earns **more** than their own manager. Show the employee name, their salary, the manager name and the manager salary.

Expected result:

\`\`\`text
 employee | salary | manager | manager_salary
----------+--------+---------+----------------
 Chen     |  95000 | Ben     |          90000
 Farah    |  72000 | Dev     |          60000
\`\`\``,
      hints: [
        'The manager is also a row in `employees`. How can one query look at two rows of the same table side by side?',
        'Join the table to itself (a "self join"). Give it two aliases: `e` for the employee and `m` for the manager.',
        'Join condition: `m.id = e.manager_id`. Then filter with `WHERE e.salary > m.salary`.',
      ],
      solution: `**Idea:** treat the table as two copies: one copy plays "employee", the other plays "manager". A **self join** connects each employee row to their manager row. Then compare the two salaries.

\`\`\`sql
SELECT
  e.name   AS employee,
  e.salary,
  m.name   AS manager,
  m.salary AS manager_salary
FROM employees e                       -- copy 1: the employee
JOIN employees m ON m.id = e.manager_id -- copy 2: that employee's manager
WHERE e.salary > m.salary              -- keep only "earns more than the boss"
ORDER BY e.name;
\`\`\`

**Why it works:** the join gives one row per (employee, manager) pair, with both salaries on the same row. The \`WHERE\` keeps only rows where the employee wins.

**Edge cases:**
- The CEO (manager_id NULL) has no match, so the inner \`JOIN\` drops them. That is what we want here.
- If you used \`LEFT JOIN\`, the CEO would appear with NULL manager columns, but \`e.salary > NULL\` is not true, so the \`WHERE\` would still remove them.

**Alternative** with a correlated subquery (works, but the join is easier to read and shows the manager name):

\`\`\`sql
SELECT e.name, e.salary
FROM employees e
WHERE e.salary > (SELECT m.salary FROM employees m WHERE m.id = e.manager_id);
\`\`\``,
      followUps: [
        {
          q: 'How would you list every employee with their manager name, including the CEO?',
          a: 'Use `LEFT JOIN employees m ON m.id = e.manager_id`. The CEO row stays, and the manager columns are NULL. You can show a label with `COALESCE(m.name, \'(no manager)\')`.',
        },
        {
          q: 'Which index helps this query on a big table?',
          a: 'The join looks up managers by `id`, which is the primary key, so it already has an index. If you often go the other way ("all reports of manager X"), add an index on `manager_id`.',
        },
      ],
    },
    {
      id: 'customers-with-no-orders',
      title: 'Find customers who never placed an order',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'subqueries',
      question: `You have two tables:

\`\`\`text
customers            orders
 id | name            id  | customer_id | amount
----+------          -----+-------------+--------
  1 | Riya            101 |           1 |    250
  2 | Sam             102 |           1 |    120
  3 | Tara            103 |           3 |    560
  4 | Umar            104 |           3 |     90
\`\`\`

Write a query that returns customers who have **no** orders at all. Show two different ways to do it.

Expected result:

\`\`\`text
 id | name
----+------
  2 | Sam
  4 | Umar
\`\`\``,
      hints: [
        'A normal (inner) JOIN only keeps customers that DO have orders. Which join keeps customers even without a match?',
        'With `LEFT JOIN`, a customer with no orders gets NULL in every `orders` column. Filter on that.',
        'Second way: `WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`.',
      ],
      solution: `**Idea:** we are looking for "rows in A with no partner in B". This is called an **anti-join**. Two common ways to write it.

**Way 1 — LEFT JOIN and look for NULL:**

\`\`\`sql
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id  -- keeps every customer
WHERE o.id IS NULL                          -- no order matched
ORDER BY c.id;
\`\`\`

**Way 2 — NOT EXISTS (usually the clearest):**

\`\`\`sql
SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1                       -- the value does not matter, only "is there a row?"
  FROM orders o
  WHERE o.customer_id = c.id
)
ORDER BY c.id;
\`\`\`

**Why it works:** \`LEFT JOIN\` keeps all customers and fills missing order columns with NULL, so \`o.id IS NULL\` means "no order". \`NOT EXISTS\` asks a yes/no question per customer and stops at the first matching order. Postgres turns both into the same efficient "anti join" plan.

**Trap — avoid \`NOT IN\` with a column that can be NULL:**

\`\`\`sql
-- Looks fine, but returns ZERO rows if any orders.customer_id is NULL
SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);
\`\`\`

\`x NOT IN (1, NULL)\` is "unknown", never true, so every row is filtered out. \`NOT EXISTS\` does not have this problem.

**Index:** put an index on \`orders(customer_id)\`. Foreign key columns are **not** indexed automatically in Postgres.`,
      followUps: [
        {
          q: 'How would you find customers with no orders in the last 90 days?',
          a: 'Add the date filter inside the subquery: `NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at >= now() - interval \'90 days\')`. If you put it in the outer WHERE of a LEFT JOIN version, you would turn it back into an inner join by mistake. For LEFT JOIN, the date filter must go in the ON clause.',
        },
        {
          q: 'Why is NOT IN dangerous here?',
          a: 'If the subquery returns even one NULL, `NOT IN` returns no rows at all, because comparing with NULL gives "unknown". Use `NOT EXISTS` instead.',
        },
      ],
    },
    {
      id: 'department-highest-average-salary',
      title: 'Department with the highest average salary',
      difficulty: 'easy',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'group-by-having',
      question: `Using the same \`employees\` table:

\`\`\`text
 id | name  | salary | department
----+-------+--------+-------------
  1 | Asha  | 150000 | Engineering
  2 | Ben   |  90000 | Engineering
  3 | Chen  |  95000 | Engineering
  4 | Dev   |  60000 | Sales
  5 | Eva   |  58000 | Sales
  6 | Farah |  72000 | Sales
\`\`\`

1. Return the department with the highest average salary, and that average (rounded).
2. Then change the query so that if **two departments tie**, both are returned.

Expected result for part 1:

\`\`\`text
 department  | avg_salary
-------------+------------
 Engineering |     111667
\`\`\``,
      hints: [
        'First get one row per department with `GROUP BY department` and `AVG(salary)`.',
        'For part 1, sort by the average descending and take the first row with `LIMIT 1`.',
        'For ties, `LIMIT 1` cuts one of them off. Rank the groups with `RANK()` and keep rank 1, or compare to the `MAX` of the averages.',
      ],
      solution: `**Idea:** group rows by department, compute the average for each group, then pick the biggest.

**Part 1 — simple version:**

\`\`\`sql
SELECT department, ROUND(AVG(salary)) AS avg_salary
FROM employees
GROUP BY department          -- one row per department
ORDER BY AVG(salary) DESC    -- biggest average first
LIMIT 1;                     -- keep only the top one
\`\`\`

**Part 2 — return all departments that tie for first place:**

\`\`\`sql
WITH dept_avg AS (
  SELECT department,
         AVG(salary) AS avg_salary,
         RANK() OVER (ORDER BY AVG(salary) DESC) AS rnk  -- ties share rank 1
  FROM employees
  GROUP BY department
)
SELECT department, ROUND(avg_salary) AS avg_salary
FROM dept_avg
WHERE rnk = 1;
\`\`\`

**Why it works:** \`GROUP BY\` squashes all rows of a department into one row, and \`AVG\` runs on each group. A window function like \`RANK()\` runs **after** grouping, so it can rank the groups. \`RANK()\` gives tied rows the same number, so all winners have rank 1.

**Edge cases:**
- \`AVG\` ignores NULL salaries. If NULL should count as 0, use \`AVG(COALESCE(salary, 0))\`.
- Round only for display. Compare and sort on the exact value, or two close averages may look tied after rounding.`,
      followUps: [
        {
          q: 'How do you show only departments whose average is above 80,000?',
          a: 'Filter groups with `HAVING`: `GROUP BY department HAVING AVG(salary) > 80000`. `WHERE` filters rows before grouping; `HAVING` filters groups after grouping.',
        },
        {
          q: 'Departments are in a separate `departments` table. How does the query change?',
          a: 'Join first: `FROM employees e JOIN departments d ON d.id = e.department_id GROUP BY d.id, d.name`. Grouping by the id (the primary key) is safe even if two departments share a name.',
        },
      ],
    },
    {
      id: 'employees-above-department-average',
      title: 'Employees who earn more than their department average',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'window-functions',
      question: `Using the \`employees\` table from the previous problems (Engineering average is about 111,667, Sales average is about 63,333):

Return every employee whose salary is **higher than the average salary of their own department**. Show the name, department, salary and the department average.

Expected result:

\`\`\`text
 name  | department  | salary | dept_avg
-------+-------------+--------+----------
 Asha  | Engineering | 150000 |   111667
 Farah | Sales       |  72000 |    63333
\`\`\``,
      hints: [
        'You need two things on the same row: the employee salary and the average of their department.',
        'Option A: a correlated subquery that computes the average for `e.department`.',
        'Option B: a window function `AVG(salary) OVER (PARTITION BY department)` keeps every row and adds the group average next to it. You cannot filter on a window function in WHERE directly, so wrap it in a subquery or CTE.',
      ],
      solution: `**Idea:** put the department average next to each employee, then keep rows where salary is bigger.

**Way 1 — window function (one pass over the table):**

\`\`\`sql
WITH with_avg AS (
  SELECT name, department, salary,
         AVG(salary) OVER (PARTITION BY department) AS dept_avg
         -- PARTITION BY = "compute the average per department,
         -- but do NOT squash rows like GROUP BY does"
  FROM employees
)
SELECT name, department, salary, ROUND(dept_avg) AS dept_avg
FROM with_avg
WHERE salary > dept_avg      -- allowed here because dept_avg is now a normal column
ORDER BY department, name;
\`\`\`

**Way 2 — correlated subquery (easy to read):**

\`\`\`sql
SELECT e.name, e.department, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(x.salary)
  FROM employees x
  WHERE x.department = e.department   -- "correlated": uses the outer row
)
ORDER BY e.department, e.name;
\`\`\`

**Why it works:** a window function adds a calculated column **without** removing rows, so each employee can see their group's average. Window functions are computed after \`WHERE\`, which is why we filter in an outer query.

**Which is better?** The window version scans the table once. The correlated subquery may run the inner query per row (Postgres often optimises it, but not always). Both are fine answers; mention the trade-off.`,
      followUps: [
        {
          q: 'Why can\'t you write `WHERE salary > AVG(salary) OVER (...)`?',
          a: 'SQL runs `WHERE` before window functions are calculated. So the window value does not exist yet at that step. Compute it in a CTE or subquery first, then filter outside.',
        },
        {
          q: 'How would you also show how far above the average each person is, in percent?',
          a: 'Add `ROUND(100.0 * (salary - dept_avg) / dept_avg, 1) AS pct_above`. Use `100.0` (not `100`) so the math is decimal, not integer.',
        },
      ],
    },
    {
      id: 'pivot-order-status-counts',
      title: 'Pivot: count orders per status for each customer',
      difficulty: 'easy',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'group-by-having',
      question: `\`orders\` has a \`status\` column with values \`pending\`, \`shipped\`, \`delivered\`, \`cancelled\`.

\`\`\`text
customers           orders
 id | name           id  | customer_id | status
----+------         -----+-------------+-----------
  1 | Riya           101 |           1 | delivered
  2 | Sam            102 |           1 | cancelled
  3 | Tara           103 |           3 | pending
                     104 |           3 | delivered
                     105 |           1 | delivered
                     106 |           3 | shipped
\`\`\`

For a dashboard, return **one row per customer** with one column per status (a "pivot"). Customers with no orders must still appear with zeros.

Expected result:

\`\`\`text
 name | total | pending | shipped | delivered | cancelled
------+-------+---------+---------+-----------+-----------
 Riya |     3 |       0 |       0 |         2 |         1
 Sam  |     0 |       0 |       0 |         0 |         0
 Tara |     3 |       1 |       1 |         1 |         0
\`\`\``,
      hints: [
        'Customers with zero orders must appear, so start from `customers` and LEFT JOIN `orders`.',
        'You need a count that only counts some rows. Postgres has `COUNT(*) FILTER (WHERE ...)`.',
        'The portable way (works in MySQL too) is `SUM(CASE WHEN o.status = \'pending\' THEN 1 ELSE 0 END)`.',
      ],
      solution: `**Idea:** group by customer, and for each status column count only the rows with that status. This is called **conditional aggregation**.

\`\`\`sql
SELECT
  c.name,
  COUNT(o.id)                                         AS total,     -- COUNT(column) skips NULLs
  COUNT(*) FILTER (WHERE o.status = 'pending')         AS pending,
  COUNT(*) FILTER (WHERE o.status = 'shipped')         AS shipped,
  COUNT(*) FILTER (WHERE o.status = 'delivered')       AS delivered,
  COUNT(*) FILTER (WHERE o.status = 'cancelled')       AS cancelled
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id   -- keep customers with no orders
GROUP BY c.id, c.name
ORDER BY c.id;
\`\`\`

**Portable version** (MySQL, SQL Server, older databases):

\`\`\`sql
SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending
\`\`\`

**Why it works:** each \`FILTER\` decides which rows that one aggregate sees. All columns come from a single pass over the joined rows.

**Edge cases:**
- For total, use \`COUNT(o.id)\`, not \`COUNT(*)\`. With a LEFT JOIN, Sam gets one row full of NULLs, so \`COUNT(*)\` would say 1.
- \`COUNT(*) FILTER (WHERE o.status = 'pending')\` is safe for Sam: \`NULL = 'pending'\` is not true, so it counts 0.
- New status values will not appear automatically. SQL needs the columns known in advance. For truly dynamic columns, return rows (\`GROUP BY customer, status\`) and pivot in the app.`,
      followUps: [
        {
          q: 'How would you get the same numbers as rows instead of columns?',
          a: '`SELECT customer_id, status, COUNT(*) FROM orders GROUP BY customer_id, status;` This is easier when the list of statuses changes, and the frontend can pivot it.',
        },
        {
          q: 'How do you add a "cancel rate" column?',
          a: '`ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = \'cancelled\') / NULLIF(COUNT(o.id), 0), 1)`. `NULLIF(x, 0)` turns 0 into NULL so you never divide by zero.',
        },
      ],
    },
    {
      id: 'running-total-cumulative-sum',
      title: 'Running total (cumulative sum) of daily sales',
      difficulty: 'easy',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'window-functions',
      question: `\`daily_sales\` has one row per day:

\`\`\`text
    day     | amount
------------+--------
 2026-03-01 |    100
 2026-03-02 |     50
 2026-03-03 |      0
 2026-03-04 |    200
 2026-03-05 |     75
\`\`\`

Return each day with a \`running_total\`: the sum of all amounts from the first day up to and including that day.

Expected result:

\`\`\`text
    day     | amount | running_total
------------+--------+---------------
 2026-03-01 |    100 |           100
 2026-03-02 |     50 |           150
 2026-03-03 |      0 |           150
 2026-03-04 |    200 |           350
 2026-03-05 |     75 |           425
\`\`\`

Follow-up in the same interview: a \`payments\` table has many rows per user, sometimes several on the same day. Compute a running total **per user**.`,
      hints: [
        '`SUM(amount)` with `GROUP BY` gives one total. You want a total on every row. Which SQL feature keeps rows and still aggregates?',
        'Use a window: `SUM(amount) OVER (ORDER BY day)`.',
        'Per user: add `PARTITION BY user_id`. If two rows share the same date, add a tie-breaker (`id`) and `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.',
      ],
      solution: `**Idea:** a window function \`SUM(...) OVER (ORDER BY day)\` adds up every row from the start up to the current row, and keeps all rows.

\`\`\`sql
SELECT
  day,
  amount,
  SUM(amount) OVER (ORDER BY day) AS running_total  -- "sum of rows so far"
FROM daily_sales
ORDER BY day;
\`\`\`

**Per user, with several payments on the same day:**

\`\`\`sql
SELECT
  user_id,
  paid_at,
  amount,
  SUM(amount) OVER (
    PARTITION BY user_id                 -- restart the total for each user
    ORDER BY paid_at, id                 -- id breaks ties on the same date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- exactly "row by row"
  ) AS running_total
FROM payments
ORDER BY user_id, paid_at, id;
\`\`\`

**Why it works:** when a window has \`ORDER BY\`, the default frame is "from the first row up to the current row". \`PARTITION BY\` splits the data into separate groups, so each user's total starts again from zero.

**The tie trap:** the default frame is \`RANGE\`, not \`ROWS\`. With \`RANGE\`, all rows with the **same** \`paid_at\` are treated as one step. Two payments of 100 and 60 on the same day would **both** show 160. Using \`ROWS\` plus a unique tie-breaker gives 100, then 160.`,
      followUps: [
        {
          q: 'How do you compute a 7-day moving average?',
          a: '`AVG(amount) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`. This assumes one row per day with no missing days. If days can be missing, first fill them with `generate_series` and a LEFT JOIN, or use `RANGE BETWEEN interval \'6 days\' PRECEDING AND CURRENT ROW`.',
        },
        {
          q: 'How would you find the first day the running total crossed 300?',
          a: 'Put the running total in a CTE, then `SELECT day FROM cte WHERE running_total >= 300 ORDER BY day LIMIT 1`.',
        },
      ],
    },
    {
      id: 'fix-n-plus-one-orm',
      title: 'Debug: the orders page sends 101 queries',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'orms-prisma-n-plus-one',
      question: `An Express endpoint lists the latest 100 orders with the customer name. It is slow, and the database log shows **101 queries** per request.

\`\`\`javascript
// GET /orders  (Prisma)
app.get('/orders', async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  for (const order of orders) {
    order.customer = await prisma.customer.findUnique({
      where: { id: order.customerId },
    });
  }

  res.json(orders);
});
\`\`\`

1. Explain what is wrong and what this problem is called.
2. Fix it with Prisma.
3. Show the plain SQL that the fixed version should run.`,
      hints: [
        'Count the queries: one for the list, then one more inside the loop for each order.',
        'This is the "N+1 query problem". The fix is to fetch all customers in one go, not one by one.',
        'In Prisma use `include: { customer: true }` (or `select`). In SQL, one JOIN, or one `WHERE id = ANY($1)` query.',
      ],
      solution: `**What is wrong:** one query loads 100 orders (the "1"), then the loop runs one query **per order** (the "N" = 100). That is the **N+1 problem**. Each query is fast alone, but 101 network round trips add up. It also gets worse as the page size grows.

**Fix with Prisma — let the ORM load the relation in bulk:**

\`\`\`javascript
app.get('/orders', async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      customer: { select: { id: true, name: true } }, // only the fields we need
    },
  });
  res.json(orders); // 1-2 queries total, no matter how many orders
});
\`\`\`

Prisma runs a second query like \`SELECT ... FROM customers WHERE id IN (...)\` and stitches the results together. That is 2 queries instead of 101.

**Plain SQL — one query with a JOIN:**

\`\`\`sql
SELECT o.id, o.total, o.created_at, c.id AS customer_id, c.name AS customer_name
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.created_at DESC
LIMIT 100;
\`\`\`

**Manual batching** (when you cannot use a JOIN, e.g. data from another service):

\`\`\`javascript
const ids = [...new Set(orders.map((o) => o.customerId))];       // unique ids
const customers = await prisma.customer.findMany({ where: { id: { in: ids } } });
const byId = new Map(customers.map((c) => [c.id, c]));           // O(1) lookup
orders.forEach((o) => { o.customer = byId.get(o.customerId); });
\`\`\`

**Why it works:** the database is good at handling many rows in one query. The slow part is the number of round trips, so we cut it from N+1 to 1 or 2.

**How to spot it:** turn on query logging (Prisma \`log: ['query']\`), and look for the same query repeated with different ids. An index on \`orders(created_at)\` also helps the list query.`,
      followUps: [
        {
          q: 'How does GraphQL make N+1 worse, and what is the fix?',
          a: 'Each field resolver runs per item, so `orders { customer { name } }` calls the customer resolver once per order. The standard fix is DataLoader: it collects all ids requested in one tick and runs a single batched query.',
        },
        {
          q: 'Is a JOIN always better than two queries?',
          a: 'Not always. If one parent has many children (one-to-many), a JOIN repeats the parent columns on every child row, which wastes bandwidth. Two queries (parents, then children `WHERE parent_id IN (...)`) can be lighter. Both are far better than N+1.',
        },
      ],
    },
    {
      id: 'delete-duplicate-rows-keep-lowest-id',
      title: 'Delete duplicate users, keep the one with the lowest id',
      difficulty: 'medium',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'common-sql-interview-queries',
      question: `A bug in signup let the same email be inserted many times:

\`\`\`text
users
 id |  email  | name
----+---------+-------
  1 | a@x.com | Asha
  2 | b@x.com | Ben
  3 | b@x.com | Ben 2
  4 | c@x.com | Chen
  5 | b@x.com | Ben 3
  6 | a@x.com | Asha K
\`\`\`

1. Write **one** \`DELETE\` that removes the duplicates and keeps, for each email, the row with the **lowest id**.
2. Make sure it can never happen again.

Expected table after the delete:

\`\`\`text
 id |  email  | name
----+---------+------
  1 | a@x.com | Asha
  2 | b@x.com | Ben
  4 | c@x.com | Chen
\`\`\``,
      hints: [
        'First write a SELECT that finds the rows to delete. Only then turn it into a DELETE.',
        'Number the rows inside each email group with `ROW_NUMBER() OVER (PARTITION BY email ORDER BY id)`. Everything with number > 1 is a duplicate.',
        'Postgres also has `DELETE ... USING`: delete `u` when another row `d` has the same email and a smaller id.',
      ],
      solution: `**Idea:** for each email, rank the rows by id. Rank 1 is the keeper. Everything else is deleted.

**Way 1 — ROW_NUMBER (works in most databases):**

\`\`\`sql
BEGIN;  -- run inside a transaction so you can check before COMMIT

DELETE FROM users
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
           -- rn = 1 for the lowest id of each email, 2, 3... for the copies
    FROM users
  ) ranked
  WHERE rn > 1
)
RETURNING *;   -- shows what was deleted: ids 3, 5, 6

-- check the result, then:
COMMIT;        -- or ROLLBACK if something looks wrong
\`\`\`

**Way 2 — Postgres DELETE ... USING (a self join):**

\`\`\`sql
DELETE FROM users u
USING users d
WHERE u.email = d.email   -- same email
  AND u.id > d.id;        -- and there is an older row, so u is a copy
\`\`\`

**Step 2 — stop it happening again:** add a unique constraint. Do it **after** the cleanup, or it will fail.

\`\`\`sql
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
-- If "A@x.com" and "a@x.com" should count as the same user:
-- CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));
\`\`\`

**Why it works:** \`PARTITION BY email\` makes a separate numbering per email. Ordering by \`id\` makes the oldest row get number 1. With \`USING\`, a row is deleted only if a smaller-id twin exists, so the smallest one always survives.

**Real-life care:**
- Other tables (orders, sessions) may point to the duplicate ids. Re-point them to the keeper first (\`UPDATE orders SET user_id = keeper_id ...\`), or the foreign key will block the delete.
- On millions of rows, delete in batches to avoid long locks.
- Then fix the app: use \`INSERT ... ON CONFLICT (email) DO NOTHING\` and handle the "email taken" error.`,
      followUps: [
        {
          q: 'What if you want to keep the newest row instead?',
          a: 'Order the other way: `ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC, id DESC)`. Rank 1 is now the newest. The `id DESC` breaks ties when two rows have the same timestamp.',
        },
        {
          q: 'What if the table has no id column at all?',
          a: 'Postgres has a hidden system column `ctid` (the physical row location). `DELETE FROM t a USING t b WHERE a.email = b.email AND a.ctid > b.ctid;` works for a one-time cleanup. Do not store ctid anywhere; it changes after updates and VACUUM FULL.',
        },
      ],
    },
    {
      id: 'month-over-month-revenue-growth',
      title: 'Month-over-month revenue growth with LAG',
      difficulty: 'medium',
      type: 'query',
      frequency: 'very common',
      relatedTopic: 'window-functions',
      question: `\`orders(id, customer_id, amount, status, created_at)\`:

\`\`\`text
  id | amount |  status   | created_at
-----+--------+-----------+------------
 101 |    250 | delivered | 2026-01-05
 102 |    120 | cancelled | 2026-01-20
 103 |    560 | pending   | 2026-02-02
 104 |     90 | delivered | 2026-02-14
 105 |    300 | delivered | 2026-03-03
 106 |    410 | shipped   | 2026-03-21
\`\`\`

Show revenue per month (ignore \`cancelled\` orders), the previous month's revenue, and the growth in percent.

Expected result:

\`\`\`text
  month  | revenue | prev_revenue | growth_pct
---------+---------+--------------+------------
 2026-01 |     250 |         NULL |       NULL
 2026-02 |     650 |          250 |      160.0
 2026-03 |     710 |          650 |        9.2
\`\`\``,
      hints: [
        'Step 1: one row per month. Use `date_trunc(\'month\', created_at)` and `SUM(amount)` in a CTE.',
        'Step 2: `LAG(revenue) OVER (ORDER BY month)` gives the value from the previous row.',
        'Growth = (this - previous) / previous * 100. Protect against dividing by zero with `NULLIF(previous, 0)`.',
      ],
      solution: `**Idea:** first build monthly totals, then use \`LAG\` to look at the previous month's row.

\`\`\`sql
WITH monthly AS (
  SELECT
    date_trunc('month', created_at)::date AS month,  -- 2026-02-14 -> 2026-02-01
    SUM(amount) AS revenue
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY 1
),
with_prev AS (
  SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue  -- value from the row before
  FROM monthly
)
SELECT
  to_char(month, 'YYYY-MM') AS month,
  revenue,
  prev_revenue,
  ROUND(100.0 * (revenue - prev_revenue) / NULLIF(prev_revenue, 0), 1) AS growth_pct
FROM with_prev
ORDER BY month;
\`\`\`

**Why it works:** \`LAG(x)\` reads \`x\` from the previous row in the window order. The first month has no previous row, so it gets NULL, and any math with NULL is NULL. \`NULLIF(prev_revenue, 0)\` turns a 0 into NULL so a month after a zero month gives NULL instead of a "division by zero" error. \`100.0\` forces decimal math.

**Edge case — missing months:** if a month has **no** orders, it has no row, and \`LAG\` would compare March with January. Fill the gaps with a calendar:

\`\`\`sql
WITH months AS (
  SELECT generate_series('2026-01-01'::date, '2026-06-01'::date, interval '1 month')::date AS month
),
monthly AS (
  SELECT m.month, COALESCE(SUM(o.amount), 0) AS revenue
  FROM months m
  LEFT JOIN orders o
    ON date_trunc('month', o.created_at)::date = m.month
   AND o.status <> 'cancelled'          -- filter in ON, so empty months stay
  GROUP BY m.month
)
SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_revenue
FROM monthly ORDER BY month;
\`\`\``,
      followUps: [
        {
          q: 'How would you compare each month with the same month last year?',
          a: 'Use `LAG(revenue, 12) OVER (ORDER BY month)` on a gap-free monthly series. The second argument is how many rows back to look.',
        },
        {
          q: 'What does LEAD do?',
          a: 'The opposite of LAG: it reads from the next row. For example, `LEAD(created_at) OVER (PARTITION BY user_id ORDER BY created_at)` gives the time of each user\'s next order, which helps compute "days until next purchase".',
        },
      ],
    },
    {
      id: 'rank-products-within-category',
      title: 'Rank products by sales inside each category (with ties)',
      difficulty: 'medium',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'window-functions',
      question: `\`products\`:

\`\`\`text
 id |   name   | category | units_sold
----+----------+----------+------------
  1 | iPhone   | Phones   |        500
  2 | Pixel    | Phones   |        300
  3 | Galaxy   | Phones   |        300
  4 | Moto     | Phones   |        120
  5 | MacBook  | Laptops  |        200
  6 | ThinkPad | Laptops  |        150
  7 | XPS      | Laptops  |        150
\`\`\`

For each product, show its rank **inside its category** (most sold = 1) and what percent of the category's units it makes up. Pixel and Galaxy are tied. The product manager says: "Tied products share a rank, and the next product should be rank 3, not rank 4."

Expected result:

\`\`\`text
 category |   name   | units_sold | rank | pct_of_category
----------+----------+------------+------+-----------------
 Laptops  | MacBook  |        200 |    1 |            40.0
 Laptops  | ThinkPad |        150 |    2 |            30.0
 Laptops  | XPS      |        150 |    2 |            30.0
 Phones   | iPhone   |        500 |    1 |            41.0
 Phones   | Galaxy   |        300 |    2 |            24.6
 Phones   | Pixel    |        300 |    2 |            24.6
 Phones   | Moto     |        120 |    3 |             9.8
\`\`\`

Also explain the difference between \`ROW_NUMBER\`, \`RANK\` and \`DENSE_RANK\` using this data.`,
      hints: [
        'The ranking restarts for each category: `PARTITION BY category`.',
        'There are three ranking functions. Which one gives 1, 2, 2, 3 (no gap after a tie)?',
        'For the percent, `SUM(units_sold) OVER (PARTITION BY category)` gives the category total on every row.',
      ],
      solution: `**Idea:** use window functions partitioned by category: one for the rank, one for the category total.

\`\`\`sql
SELECT
  category,
  name,
  units_sold,
  DENSE_RANK() OVER (PARTITION BY category ORDER BY units_sold DESC) AS rank,
  ROUND(
    100.0 * units_sold / SUM(units_sold) OVER (PARTITION BY category),  -- category total
    1
  ) AS pct_of_category
FROM products
ORDER BY category, rank, name;
\`\`\`

**The three ranking functions on the Phones rows:**

\`\`\`text
 name   | units | ROW_NUMBER | RANK | DENSE_RANK
--------+-------+------------+------+------------
 iPhone |  500  |     1      |  1   |     1
 Galaxy |  300  |     2      |  2   |     2
 Pixel  |  300  |     3      |  2   |     2
 Moto   |  120  |     4      |  4   |     3
\`\`\`

- **ROW_NUMBER**: always unique (1, 2, 3, 4). Ties get an arbitrary order unless you add a tie-breaker, e.g. \`ORDER BY units_sold DESC, name\`.
- **RANK**: ties share a number, then it **skips** (1, 2, 2, 4), like Olympic medals.
- **DENSE_RANK**: ties share a number, **no gap** (1, 2, 2, 3). This is what the product manager asked for.

**Why it works:** \`PARTITION BY category\` makes each category its own little table for the window function. The \`SUM ... OVER (PARTITION BY category)\` has no \`ORDER BY\`, so it sums the whole partition, giving the category total on every row.

**Top N per category** is the usual next step: put this in a CTE and filter \`WHERE rank <= 3\`. Remember you cannot filter on a window function in the same \`WHERE\`.`,
      followUps: [
        {
          q: 'You need exactly 2 products per category, even with ties. Which function?',
          a: '`ROW_NUMBER()` with a deterministic tie-breaker, e.g. `ORDER BY units_sold DESC, id`, then `WHERE rn <= 2`. RANK/DENSE_RANK could return more than 2 rows when there are ties.',
        },
        {
          q: 'How do you name the same window once and reuse it?',
          a: 'Use the WINDOW clause: `... RANK() OVER w, DENSE_RANK() OVER w FROM products WINDOW w AS (PARTITION BY category ORDER BY units_sold DESC)`.',
        },
      ],
    },
    {
      id: 'active-this-week-not-last-week',
      title: 'Users active in the last 7 days but not in the 7 days before',
      difficulty: 'medium',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'subqueries',
      question: `\`events(user_id, created_at)\` logs every user action. Growth team asks: "Which users were active in the **last 7 days**, but were **not** active in the **7 days before that**?" (new or returning users).

Assume "now" is \`2026-03-15 00:00\`. So the windows are:
- this week: \`2026-03-08\` up to now
- previous week: \`2026-03-01\` up to (not including) \`2026-03-08\`

\`\`\`text
 user_id |    created_at
---------+------------------
       1 | 2026-03-14 10:00   <- active this week
       1 | 2026-03-05 10:00   <- ...but also last week
       2 | 2026-03-13 09:00
       3 | 2026-03-03 12:00   <- only last week
       4 | 2026-03-10 08:00
       4 | 2026-03-12 08:00
       5 | 2026-02-20 08:00   <- older than both windows
       5 | 2026-03-09 08:00
\`\`\`

Expected result:

\`\`\`text
 user_id
---------
       2
       4
       5
\`\`\``,
      hints: [
        'Split it into two sets: users active this week, and users active the week before. You want the first set minus the second.',
        'SQL has a set operator for "minus": `EXCEPT`. Or use `NOT EXISTS`.',
        'A single-pass option: `GROUP BY user_id` with `HAVING COUNT(*) FILTER (WHERE <this week>) > 0 AND COUNT(*) FILTER (WHERE <last week>) = 0`.',
      ],
      solution: `**Idea:** "this week's users" minus "last week's users". Use half-open time ranges (\`>= start AND < end\`) so no event is counted twice or missed at midnight.

**Way 1 — EXCEPT (reads like the English question):**

\`\`\`sql
SELECT user_id FROM events
WHERE created_at >= now() - interval '7 days'
EXCEPT                                           -- remove users found below
SELECT user_id FROM events
WHERE created_at >= now() - interval '14 days'
  AND created_at <  now() - interval '7 days'
ORDER BY user_id;
\`\`\`

**Way 2 — one scan with conditional counts:**

\`\`\`sql
SELECT user_id
FROM events
WHERE created_at >= now() - interval '14 days'   -- only read the 2 weeks we need
GROUP BY user_id
HAVING COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') > 0
   AND COUNT(*) FILTER (WHERE created_at <  now() - interval '7 days') = 0
ORDER BY user_id;
\`\`\`

(For the sample data, replace \`now()\` with \`timestamptz '2026-03-15'\`. Result: 2, 4, 5.)

**Why it works:** \`EXCEPT\` returns distinct rows from the first query that are not in the second. In way 2, each user becomes one group, and the two \`FILTER\` counts tell us in which week they were active. User 5 shows up because their February event is outside both windows.

**Performance:** an index on \`events(created_at)\` lets Postgres read only the last 14 days. If you use \`NOT EXISTS\` per user, an index on \`events(user_id, created_at)\` is better.

**Edge case:** be clear about time zones. "Last 7 days" in UTC and in the user's local time can differ. Store \`timestamptz\` and decide which zone the business means.`,
      followUps: [
        {
          q: 'How would you count "churned" users instead (active last week, not this week)?',
          a: 'Swap the two sets: users from the previous window `EXCEPT` users from the current window. In the HAVING version, swap the `> 0` and `= 0` conditions.',
        },
        {
          q: 'What is the difference between EXCEPT and EXCEPT ALL?',
          a: '`EXCEPT` removes duplicates (set logic). `EXCEPT ALL` keeps duplicates and subtracts counts. Here we want each user once, so plain `EXCEPT` is right.',
        },
      ],
    },
    {
      id: 'median-salary-per-department',
      title: 'Median salary per department',
      difficulty: 'medium',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'group-by-having',
      question: `Using the \`employees\` table:

\`\`\`text
 name  | salary | department
-------+--------+-------------
 Asha  | 150000 | Engineering
 Ben   |  90000 | Engineering
 Chen  |  95000 | Engineering
 Dev   |  60000 | Sales
 Eva   |  58000 | Sales
 Farah |  72000 | Sales
\`\`\`

1. Return the **median** salary for each department.
2. Return the median of the **whole** company (6 people — an even count).
3. Why might a manager prefer the median over the average here?

Expected result for part 1:

\`\`\`text
 department  | median_salary
-------------+---------------
 Engineering |         95000
 Sales       |         60000
\`\`\``,
      hints: [
        'Median = the middle value after sorting. With an even count it is the average of the two middle values.',
        'Postgres has "ordered-set aggregates": `percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)`.',
        '`percentile_cont` interpolates (averages the two middle values). `percentile_disc` returns an actual value from the data.',
      ],
      solution: `**Idea:** Postgres has a built-in way to get percentiles. The median is the 50th percentile.

\`\`\`sql
-- 1. median per department
SELECT
  department,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary
FROM employees
GROUP BY department
ORDER BY department;

-- 2. median for the whole company (no GROUP BY)
SELECT
  percentile_cont(0.5) WITHIN GROUP (ORDER BY salary) AS median_cont,  -- 81000
  percentile_disc(0.5) WITHIN GROUP (ORDER BY salary) AS median_disc   -- 72000
FROM employees;
\`\`\`

Sorted salaries: 58000, 60000, **72000, 90000**, 95000, 150000. The two middle values are 72000 and 90000.
- \`percentile_cont\` averages them: **81000**. This is the textbook median.
- \`percentile_disc\` returns the first real value at or above the 50% mark: **72000**.

**Why it works:** \`WITHIN GROUP (ORDER BY salary)\` tells the aggregate how to sort each group. \`0.5\` means "the point halfway through".

**Portable version without percentile functions** (e.g. for MySQL):

\`\`\`sql
WITH ranked AS (
  SELECT department, salary,
         ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary) AS rn,
         COUNT(*)     OVER (PARTITION BY department)                 AS cnt
  FROM employees
)
SELECT department, AVG(salary) AS median_salary
FROM ranked
WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)  -- integer division picks 1 or 2 middle rows
GROUP BY department;
\`\`\`

**3. Median vs average:** Asha (150000) pulls the Engineering average up to about 111667, while the median is 95000. The median ignores outliers, so it better shows a "typical" salary.`,
      followUps: [
        {
          q: 'How do you get the 90th percentile response time from a requests table?',
          a: '`SELECT percentile_cont(0.9) WITHIN GROUP (ORDER BY duration_ms) FROM requests WHERE created_at >= now() - interval \'1 hour\';` You can pass an array to get several at once: `percentile_cont(ARRAY[0.5, 0.9, 0.99])`.',
        },
        {
          q: 'Can percentile_cont be used as a window function?',
          a: 'No. In Postgres ordered-set aggregates cannot be used with OVER. Compute it in a grouped subquery and join it back to the rows.',
        },
      ],
    },
    {
      id: 'jsonb-filter-nested-attributes',
      title: 'Filter products by nested JSONB attributes',
      difficulty: 'medium',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'jsonb',
      question: `An e-commerce app stores flexible product attributes in a \`jsonb\` column:

\`\`\`text
 id |  name   | attrs
----+---------+----------------------------------------------------------------------
  1 | Phone X | {"brand":"Acme","specs":{"ram_gb":8,"storage_gb":128},"colors":["black","blue"]}
  2 | Phone Y | {"brand":"Acme","specs":{"ram_gb":12,"storage_gb":256},"colors":["white"]}
  3 | Tab Z   | {"brand":"Zen","specs":{"ram_gb":16,"storage_gb":512},"colors":["blue","grey"]}
  4 | Watch   | {"brand":"Zen","colors":["black"]}
\`\`\`

1. Return products that come in **blue** AND have **at least 8 GB RAM**. Show the brand and RAM as normal columns.
2. Which indexes would make these filters fast on 5 million rows?
3. Update product 1 so its RAM becomes 16, without rewriting the rest of the JSON by hand.

Expected result for part 1:

\`\`\`text
 id |  name   | brand | ram_gb
----+---------+-------+--------
  1 | Phone X | Acme  |      8
  3 | Tab Z   | Zen   |     16
\`\`\``,
      hints: [
        '`->` returns JSON, `->>` returns text. You can chain them: `attrs->\'specs\'->>\'ram_gb\'`.',
        'Text cannot be compared as a number. Cast it: `(attrs->\'specs\'->>\'ram_gb\')::int >= 8`.',
        'For "array contains blue", use the containment operator `@>`: `attrs @> \'{"colors":["blue"]}\'`. A GIN index supports it.',
      ],
      solution: `**Idea:** use \`@>\` (contains) for the color check and extract + cast the nested RAM value for the number comparison.

\`\`\`sql
-- 1. blue products with >= 8 GB RAM
SELECT
  id,
  name,
  attrs->>'brand'                     AS brand,   -- ->> gives text
  (attrs->'specs'->>'ram_gb')::int    AS ram_gb   -- -> goes one level down, then cast
FROM products
WHERE attrs @> '{"colors": ["blue"]}'             -- JSON contains this piece
  AND (attrs->'specs'->>'ram_gb')::int >= 8
ORDER BY id;
\`\`\`

Product 4 has no \`specs\`, so the RAM expression is NULL, and \`NULL >= 8\` is not true. It is filtered out safely, with no error.

**2. Indexes:**

\`\`\`sql
-- GIN index: speeds up @> containment queries on any key
CREATE INDEX products_attrs_gin ON products USING GIN (attrs jsonb_path_ops);

-- B-tree expression index: speeds up range checks on one numeric field
CREATE INDEX products_ram_idx ON products (((attrs->'specs'->>'ram_gb')::int));
\`\`\`

- \`jsonb_path_ops\` makes a smaller, faster GIN index, but it only supports \`@>\` (and JSON path) queries. The default \`jsonb_ops\` also supports the key-exists operators \`?\`, \`?|\`, \`?&\`.
- A GIN index does **not** help \`>=\` on a value. For ranges you need the expression index, and your query must use the **exact same expression**.

**3. Update one nested field:**

\`\`\`sql
UPDATE products
SET attrs = jsonb_set(attrs, '{specs,ram_gb}', '16')  -- path, new JSON value
WHERE id = 1;
\`\`\`

**Why it works:** \`jsonb\` is stored in a parsed binary form, so Postgres can walk into it and index it. \`@>\` asks "is this small JSON a subset of the stored JSON?", which GIN indexes answer quickly.

**Design note:** if a field is filtered in almost every query (like \`brand\` or \`price\`), make it a real column. Keep JSONB for attributes that truly vary by product type.`,
      followUps: [
        {
          q: 'How do you list each color as its own row?',
          a: '`SELECT p.id, c.color FROM products p CROSS JOIN LATERAL jsonb_array_elements_text(p.attrs->\'colors\') AS c(color);` This "unnests" the array, which helps for counting products per color.',
        },
        {
          q: 'How do you find products that have no specs key?',
          a: '`WHERE NOT (attrs ? \'specs\')`. The `?` operator checks if a top-level key exists. In node-postgres, `?` is fine because placeholders are `$1, $2`, but some ORMs treat `?` as a placeholder, so use `jsonb_exists(attrs, \'specs\')` there.',
        },
      ],
    },
    {
      id: 'recursive-cte-org-chart',
      title: 'Recursive CTE: everyone under a manager, with depth and path',
      difficulty: 'medium',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'ctes',
      question: `\`employees(id, name, manager_id)\` forms a tree:

\`\`\`text
 id | name  | manager_id
----+-------+------------
  1 | Asha  |       NULL
  2 | Ben   |          1
  3 | Chen  |          2
  4 | Dev   |          1
  5 | Eva   |          4
  6 | Farah |          4
\`\`\`

1. Print the full org chart with each person's depth (CEO = 0) and their path from the top.
2. Return all people **under** Dev (direct and indirect reports).
3. The tree can be any depth. What protects you from an infinite loop if someone creates a cycle by mistake (A manages B, B manages A)?

Expected result for part 1:

\`\`\`text
 org_chart | depth |        path
-----------+-------+--------------------
 Asha      |     0 | Asha
   Ben     |     1 | Asha > Ben
     Chen  |     2 | Asha > Ben > Chen
   Dev     |     1 | Asha > Dev
     Eva   |     2 | Asha > Dev > Eva
     Farah |     2 | Asha > Dev > Farah
\`\`\``,
      hints: [
        'A normal JOIN only goes one level deep. You need a query that repeats until there are no more children: `WITH RECURSIVE`.',
        'A recursive CTE has two parts joined by `UNION ALL`: the starting rows (the CEO), and a step that joins `employees` to the rows found so far.',
        'Carry extra columns along: `depth + 1` and `path || \' > \' || name`. To stop cycles, keep an array of visited ids and skip ids already in it.',
      ],
      solution: `**Idea:** start at the top (anchor), then repeatedly find the children of the rows found in the previous step, until no new rows appear.

\`\`\`sql
-- 1. full org chart
WITH RECURSIVE chain AS (
  -- anchor: where we start
  SELECT id, name, 0 AS depth, name::text AS path
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- recursive step: children of the rows found so far
  SELECT e.id, e.name, c.depth + 1, c.path || ' > ' || e.name
  FROM employees e
  JOIN chain c ON e.manager_id = c.id
)
SELECT repeat('  ', depth) || name AS org_chart, depth, path
FROM chain
ORDER BY path;
\`\`\`

\`\`\`sql
-- 2. everyone under Dev (id 4), with cycle protection
WITH RECURSIVE reports AS (
  SELECT id, name, 1 AS level, ARRAY[4, id] AS visited
  FROM employees
  WHERE manager_id = 4                          -- direct reports

  UNION ALL

  SELECT e.id, e.name, r.level + 1, r.visited || e.id
  FROM employees e
  JOIN reports r ON e.manager_id = r.id
  WHERE e.id <> ALL (r.visited)                 -- 3. never visit the same person twice
)
SELECT id, name, level FROM reports ORDER BY level, name;
-- Eva (level 1), Farah (level 1)
\`\`\`

**Why it works:** Postgres runs the anchor once. Then it runs the recursive part using only the rows from the last round, adds the new rows, and repeats. When a round returns zero rows, it stops.

**3. Cycles:** without protection, a cycle makes the query run forever (until it runs out of memory). Options:
- Track visited ids in an array, as above.
- Postgres 14+ has a built-in clause: \`CYCLE id SET is_cycle USING path\`.
- Add a safety limit, e.g. \`WHERE r.level < 50\`.
- Better still, prevent cycles when writing data (check in the app or a trigger).

**Index:** add an index on \`employees(manager_id)\`. Each round looks up children by \`manager_id\`.`,
      followUps: [
        {
          q: 'How do you go upwards: the chain of managers above Chen?',
          a: 'Flip the join. Anchor: `WHERE id = 3`. Step: `JOIN up u ON m.id = u.manager_id`. That returns Chen, Ben, Asha.',
        },
        {
          q: 'Where else is this used in real apps?',
          a: 'Category trees and breadcrumbs (Electronics > Phones > Android), nested comment threads, folder structures, and bill-of-materials. For very read-heavy trees, some teams store a materialized path (like `1/4/5`) or use the `ltree` extension.',
        },
      ],
    },
    {
      id: 'lost-update-wallet-balance',
      title: 'Debug: two withdrawals at once make the balance wrong',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'locks-deadlocks',
      question: `A wallet starts with a balance of 100. Two requests each withdraw 30 at the same moment. After both succeed, the balance is **70**, not 40. Sometimes the balance even goes below zero.

\`\`\`javascript
// POST /wallet/withdraw  (node-postgres)
async function withdraw(userId, amount) {
  const { rows } = await pool.query(
    'SELECT balance FROM wallets WHERE user_id = $1', [userId]);
  const balance = Number(rows[0].balance);

  if (balance < amount) throw new Error('Insufficient funds');

  await pool.query(
    'UPDATE wallets SET balance = $1 WHERE user_id = $2',
    [balance - amount, userId]);
}
\`\`\`

1. Explain step by step how the money "disappears".
2. Fix it in two different ways.`,
      hints: [
        'Write the timeline: request A reads 100, request B reads 100, A writes 70, B writes 70. What happened to A\'s change?',
        'This is a "lost update" (read-modify-write race). The app computes the new value from stale data.',
        'Fix 1: let the database do the math in one statement: `SET balance = balance - $1 WHERE ... AND balance >= $1`. Fix 2: lock the row with `SELECT ... FOR UPDATE` inside a transaction.',
      ],
      solution: `**What happens (a "lost update"):**

\`\`\`text
time  request A                     request B
 1    SELECT balance  -> 100
 2                                  SELECT balance  -> 100
 3    UPDATE balance = 70
 4                                  UPDATE balance = 70   <- overwrites A's write
\`\`\`

Both requests read the same old value, and the second write simply replaces the first. Also, the two queries may even run on **different pool connections**, and there is no transaction at all.

**Fix 1 — atomic conditional UPDATE (simplest, best for counters and balances):**

\`\`\`javascript
async function withdraw(userId, amount) {
  // The database reads and writes the row in ONE step, with a row lock.
  const { rowCount, rows } = await pool.query(
    \`UPDATE wallets
        SET balance = balance - $1
      WHERE user_id = $2
        AND balance >= $1           -- check and change together
      RETURNING balance\`,
    [amount, userId]
  );
  if (rowCount === 0) throw new Error('Insufficient funds');
  return Number(rows[0].balance);
}
\`\`\`

When B's UPDATE arrives, it waits for A's row lock. Then it **re-checks** the row with the new value (70), so the result is 40. If the money is not enough, 0 rows are updated.

**Fix 2 — SELECT ... FOR UPDATE inside a transaction** (when you need app logic between read and write):

\`\`\`javascript
async function withdraw(userId, amount) {
  const client = await pool.connect();          // one connection for the whole transaction
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE', // lock the row
      [userId]);
    const balance = Number(rows[0].balance);
    if (balance < amount) throw new Error('Insufficient funds');

    await client.query(
      'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
      [amount, userId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();                           // always give the connection back
  }
}
\`\`\`

\`FOR UPDATE\` makes B's SELECT **wait** until A commits, then B reads 70.

**Safety net:** add \`CHECK (balance >= 0)\` on the table. Even with a bug, the database refuses negative balances.

**Other options:** optimistic locking with a \`version\` column (\`UPDATE ... WHERE id = $1 AND version = $2\`, retry if 0 rows), or \`SERIALIZABLE\` isolation with retries. Also store every movement in a \`wallet_transactions\` ledger table for auditing.`,
      followUps: [
        {
          q: 'Would wrapping the original code in BEGIN/COMMIT fix it?',
          a: 'No. At the default READ COMMITTED level, two transactions can both read 100 with a plain SELECT. You still need `FOR UPDATE`, an atomic UPDATE, or a stricter isolation level like SERIALIZABLE (with retries).',
        },
        {
          q: 'When is optimistic locking better than FOR UPDATE?',
          a: 'When conflicts are rare and the "think time" is long, for example a user editing a form for minutes. You do not hold a lock; you just check the version on save and ask the user to retry if it changed.',
        },
      ],
    },
    {
      id: 'slow-offset-pagination',
      title: 'Debug: page 75,000 of the orders list takes almost a second',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'pagination',
      question: `An admin "infinite scroll" lists orders, newest first, 20 per page. Early pages are instant. Deep pages are slow, and users sometimes see the **same order twice** or miss one while new orders are coming in.

\`\`\`javascript
// GET /orders?page=75000
const page = Number(req.query.page) || 1;
const { rows } = await pool.query(
  'SELECT id, total, created_at FROM orders ORDER BY created_at DESC, id DESC OFFSET $1 LIMIT 20',
  [(page - 1) * 20]
);
\`\`\`

\`EXPLAIN ANALYZE\` for a deep page (2 million rows, index on \`(created_at DESC, id DESC)\`):

\`\`\`text
Limit  (actual time=748.577..748.585 rows=20 loops=1)
  ->  Index Scan using orders_created_id_idx on orders
        (actual time=0.017..720.287 rows=1500020 loops=1)
Execution Time: 748.603 ms
\`\`\`

1. Why is it slow even though an index is used?
2. Why do users see duplicates or missing rows?
3. Rewrite the endpoint to fix both problems.`,
      hints: [
        'Look at `rows=1500020` in the plan. How many rows did Postgres read to return 20?',
        'OFFSET does not "jump". It reads and throws away every skipped row. And if a new order is inserted at the top, every row shifts down by one.',
        'Use keyset (cursor) pagination: remember the last row\'s `(created_at, id)` and ask for rows "after" it with `WHERE (created_at, id) < ($1, $2)`.',
      ],
      solution: `**1. Why slow:** \`OFFSET 1500000\` means "walk past 1.5 million rows, then return 20". The index gives the order, but Postgres still has to step through every skipped entry. The plan shows it: \`rows=1500020\`. Page 1 is fast, page 75,000 is slow. Cost grows with the page number.

**2. Why duplicates/missing rows:** pages are defined by position. If 3 new orders arrive while the user reads page 1, everything shifts down by 3. Page 2 now starts with the last 3 orders of the old page 1 (duplicates). Deletes cause the opposite: rows are skipped.

**3. Fix — keyset (cursor) pagination:**

\`\`\`javascript
// GET /orders?cursor=<opaque string from the previous response>
app.get('/orders', async (req, res) => {
  const limit = 20;
  let rows;

  if (!req.query.cursor) {
    // first page
    ({ rows } = await pool.query(
      'SELECT id, total, created_at FROM orders ORDER BY created_at DESC, id DESC LIMIT $1',
      [limit]));
  } else {
    // decode "where the last page ended"
    const { createdAt, id } = JSON.parse(Buffer.from(req.query.cursor, 'base64url').toString());
    ({ rows } = await pool.query(
      \`SELECT id, total, created_at
         FROM orders
        WHERE (created_at, id) < ($1, $2)   -- strictly after the last row we sent
        ORDER BY created_at DESC, id DESC
        LIMIT $3\`,
      [createdAt, id, limit]));
  }

  const last = rows[rows.length - 1];
  const nextCursor = rows.length === limit
    ? Buffer.from(JSON.stringify({ createdAt: last.created_at, id: last.id })).toString('base64url')
    : null;                                  // null = no more pages

  res.json({ data: rows, nextCursor });
});
\`\`\`

Supporting index (same columns, same order as the ORDER BY):

\`\`\`sql
CREATE INDEX orders_created_id_idx ON orders (created_at DESC, id DESC);
\`\`\`

**Why it works:** \`WHERE (created_at, id) < ($1, $2)\` is a **row comparison**: compare \`created_at\` first, and use \`id\` only to break ties. The index can jump straight to that point and read 20 entries. In tests on the same 2M rows this went from about **750 ms to 0.05 ms**, on any page. New inserts at the top do not shift the cursor, so no duplicates.

**Why \`id\` too:** many orders can share the same \`created_at\`. Without a unique tie-breaker, rows with equal timestamps could be skipped or repeated.

**Trade-off:** keyset cannot jump to "page 5,000" directly. That is fine for infinite scroll and APIs. For an admin table that needs page numbers, keep OFFSET for the first few pages and limit how deep users can go, or add filters.`,
      followUps: [
        {
          q: 'How do you support a "previous page" button with keyset pagination?',
          a: 'Keep the first row of the current page as a "before" cursor. Query with the comparison flipped `(created_at, id) > ($1, $2)` and `ORDER BY created_at ASC, id ASC LIMIT 20`, then reverse the rows in the app.',
        },
        {
          q: 'How does this map to MongoDB?',
          a: 'Same idea: `find({ $or: [{ createdAt: { $lt: c } }, { createdAt: c, _id: { $lt: id } }] }).sort({ createdAt: -1, _id: -1 }).limit(20)` with a compound index on `{ createdAt: -1, _id: -1 }`. `skip()` has the same problem as OFFSET.',
        },
      ],
    },
    {
      id: 'choose-index-from-explain',
      title: 'Read EXPLAIN ANALYZE and choose the right index',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'explain-analyze',
      question: `The "My orders" page is slow. This query runs on every page view, and \`orders\` has 20 million rows:

\`\`\`sql
SELECT id, total, created_at
FROM orders
WHERE customer_id = 4213 AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;
\`\`\`

\`EXPLAIN ANALYZE\` (trimmed):

\`\`\`text
Limit  (actual time=402.1..405.7 rows=15 loops=1)
  ->  Gather Merge  (actual time=402.1..405.7 rows=15 loops=1)
        Workers Launched: 2
        ->  Sort  (actual time=398.7..398.7 rows=5 loops=3)
              Sort Key: created_at DESC
              ->  Parallel Seq Scan on orders  (actual time=40.1..398.6 rows=5 loops=3)
                    Filter: ((customer_id = 4213) AND (status = 'paid'::text))
                    Rows Removed by Filter: 6666662
Execution Time: 405.8 ms
\`\`\`

1. Read the plan out loud. What is the problem?
2. Which index would you create, and why in that column order?
3. A teammate suggests three separate indexes, one on each column. Is that as good?`,
      hints: [
        '"Seq Scan" plus "Rows Removed by Filter: 6.6 million" (per worker) means it read the whole table to find 15 rows.',
        'A composite (multi-column) index can serve the WHERE and the ORDER BY together. Put equality columns first.',
        'Rule of thumb: equality columns (`customer_id`, `status`) first, then the sort/range column (`created_at`).',
      ],
      solution: `**1. Reading the plan** (read it from the most indented line up):
- **Parallel Seq Scan**: 3 processes read the **whole** table.
- **Rows Removed by Filter: 6,666,662** per process (\`loops=3\`), so about 20 million rows were checked and thrown away to find 15.
- **Sort**: then the matches are sorted by \`created_at\`.
- Total: about 400 ms for 15 rows. The problem is "no useful index", not the sort.

**2. The index:**

\`\`\`sql
-- CONCURRENTLY = build without blocking writes (cannot run inside a transaction)
CREATE INDEX CONCURRENTLY orders_customer_status_created_idx
  ON orders (customer_id, status, created_at DESC);

ANALYZE orders;  -- refresh statistics so the planner knows about the data
\`\`\`

New plan (from a real test on 2M rows):

\`\`\`text
Limit  (actual time=0.048..0.050 rows=15 loops=1)
  ->  Bitmap Heap Scan on orders ...
        ->  Bitmap Index Scan on orders_customer_status_created_idx
              Index Cond: ((customer_id = 4213) AND (status = 'paid'::text))
Execution Time: 0.065 ms
\`\`\`

**Why this column order:** a B-tree index is sorted like a phone book: by the first column, then the second, then the third. With \`customer_id\` and \`status\` fixed by \`=\`, all matching entries sit next to each other and are **already sorted** by \`created_at\`. So Postgres can jump to them and, for customers with many orders, read just the first 20 in order with no sort step. If \`created_at\` came first, the matching rows would be scattered across the index.

**Optional — covering index** (avoids visiting the table for each row):

\`\`\`sql
CREATE INDEX CONCURRENTLY orders_cust_status_created_cov_idx
  ON orders (customer_id, status, created_at DESC) INCLUDE (id, total);
-- every selected column is now in the index, so Postgres can use an
-- "Index Only Scan" (it still checks the visibility map, kept fresh by VACUUM)
\`\`\`

**3. Three single-column indexes?** Not as good. Postgres can combine them with a "BitmapAnd", but it must build bitmaps for each, combine them, fetch rows, and still **sort**. One composite index answers the filter and the order in one go. Extra indexes also slow down every INSERT/UPDATE and use disk.

**Checklist to mention:** compare estimated \`rows=\` vs \`actual rows=\` (big gaps mean stale stats, run \`ANALYZE\`); look for Seq Scan on big tables, big "Rows Removed by Filter", and Sort nodes spilling to disk ("external merge").`,
      followUps: [
        {
          q: 'Would an index on (status, customer_id, created_at) work too?',
          a: 'For this exact query, yes, because both are equality filters. But `customer_id` first is more flexible: it also serves queries that filter only by customer. `status` has few distinct values, so an index starting with it is less useful on its own.',
        },
        {
          q: 'Most rows are status = \'paid\'. Could a partial index help?',
          a: 'A partial index only stores rows that match a condition, e.g. `CREATE INDEX ... ON orders (customer_id, created_at DESC) WHERE status = \'pending\'`. It is great for a small "hot" subset (pending orders). For the big majority value it saves little.',
        },
        {
          q: 'Why might Postgres ignore your new index?',
          a: 'Stale statistics, a tiny table (a seq scan is cheaper), the query wrapping the column in a function or cast (`WHERE date(created_at) = ...`), a type mismatch, or the filter matching a large share of the table.',
        },
      ],
    },
    {
      id: 'design-job-portal-schema',
      title: 'Design the database schema for a job portal',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'normalization',
      question: `Design the PostgreSQL schema for a small job portal (like a mini LinkedIn Jobs):

- Companies post jobs. Several recruiters can belong to one company.
- Candidates sign up and apply to jobs with a resume.
- A candidate can apply to the same job **only once**.
- Each job needs a list of skills (React, Node.js...), and candidates search jobs by skill.
- Applications move through stages: applied, screening, interview, offer, rejected, withdrawn.
- Most common screens: "latest open jobs", "jobs with skill X", "my applications" (candidate), "applicants for my job" (recruiter).

Write the \`CREATE TABLE\` statements with keys, constraints and indexes, and explain your choices.`,
      hints: [
        'List the nouns: companies, users, jobs, skills, applications. Then find the many-to-many relationships.',
        'Many-to-many (job ↔ skill, company ↔ recruiter) needs a join table with a composite primary key.',
        '"Apply only once" is a UNIQUE constraint on (job_id, candidate_id). Add indexes for each common screen, and remember foreign keys are not indexed automatically.',
      ],
      solution: `**Idea:** one table per thing (normalized, so each fact is stored once), join tables for many-to-many, and let constraints enforce the business rules instead of trusting app code.

\`\`\`sql
CREATE TABLE companies (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,                 -- for URLs: /companies/acme
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      text NOT NULL,
  full_name  text NOT NULL,
  role       text NOT NULL CHECK (role IN ('candidate', 'recruiter', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_unique ON users (lower(email));  -- case-insensitive unique

-- many-to-many: which recruiters belong to which company
CREATE TABLE company_members (
  company_id bigint NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id    bigint NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  PRIMARY KEY (company_id, user_id)
);

CREATE TABLE jobs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id  bigint NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  posted_by   bigint REFERENCES users(id) ON DELETE SET NULL,  -- keep job if recruiter leaves
  title       text NOT NULL,
  description text NOT NULL,
  location    text,
  is_remote   boolean NOT NULL DEFAULT false,
  salary_min  int,
  salary_max  int,
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);
CREATE INDEX jobs_open_recent_idx ON jobs (created_at DESC) WHERE status = 'open'; -- "latest open jobs"
CREATE INDEX jobs_company_idx     ON jobs (company_id);                              -- FK + company page

CREATE TABLE skills (
  id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- many-to-many: skills required by a job
CREATE TABLE job_skills (
  job_id   bigint NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id int    NOT NULL REFERENCES skills(id),
  PRIMARY KEY (job_id, skill_id)         -- also serves "skills of a job"
);
CREATE INDEX job_skills_skill_idx ON job_skills (skill_id);  -- "jobs with skill X"

CREATE TABLE applications (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id       bigint NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
  candidate_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_url   text NOT NULL,            -- file lives in S3/GCS; store only the link
  status       text NOT NULL DEFAULT 'applied'
               CHECK (status IN ('applied','screening','interview','offer','rejected','withdrawn')),
  applied_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_id)          -- apply only once; also serves "applicants for my job"
);
CREATE INDEX applications_candidate_idx ON applications (candidate_id, applied_at DESC); -- "my applications"
\`\`\`

**Example query — open jobs needing React:**

\`\`\`sql
SELECT j.id, j.title, c.name AS company
FROM jobs j
JOIN companies c ON c.id = j.company_id
WHERE j.status = 'open'
  AND EXISTS (SELECT 1 FROM job_skills js JOIN skills s ON s.id = js.skill_id
              WHERE js.job_id = j.id AND s.name = 'React')
ORDER BY j.created_at DESC
LIMIT 20;
\`\`\`

**Why these choices:**
- **Constraints over app code:** \`UNIQUE (job_id, candidate_id)\` stops double applies even when two requests race. \`CHECK\` stops bad statuses and salary ranges.
- **Join tables** keep skills reusable and searchable. A \`text[]\` of skills on jobs would also work (with a GIN index), but you lose the foreign key and consistent names.
- **Indexes match the screens.** A composite PK or UNIQUE already creates an index whose **first** column is usable, so \`(job_id, candidate_id)\` covers "applicants for job X".
- **Partial index** on open jobs stays small because closed jobs are not in it.
- **Status as text + CHECK** is easy to change with a migration. A Postgres \`ENUM\` type or a lookup table are also fine answers.

**Extensions to mention:** an \`application_events\` table for stage history (who moved it, when); full-text search (\`tsvector\` + GIN) on title/description; soft deletes with \`deleted_at\`.`,
      followUps: [
        {
          q: 'How would you add full-text search on job title and description?',
          a: 'Add a generated column: `search tsvector GENERATED ALWAYS AS (to_tsvector(\'english\', title || \' \' || description)) STORED`, a GIN index on it, and query with `search @@ websearch_to_tsquery(\'english\', $1)`. For very advanced search (typos, facets), teams often add Elasticsearch/OpenSearch.',
        },
        {
          q: 'Why not store a candidate\'s applications as an array inside the users table?',
          a: 'Arrays of ids cannot have foreign keys, cannot easily hold extra data per application (status, date), and every new application rewrites the whole user row. A separate table is normalized and indexable.',
        },
      ],
    },
    {
      id: 'consecutive-login-days-streak',
      title: 'Users who logged in 3 or more days in a row (gaps and islands)',
      difficulty: 'hard',
      type: 'query',
      frequency: 'common',
      relatedTopic: 'window-functions',
      question: `\`logins(user_id, login_at timestamptz)\`. A user can log in many times per day.

\`\`\`text
 user_id |     login_at
---------+------------------
       1 | 2026-03-01 09:00
       1 | 2026-03-01 18:00   <- same day twice
       1 | 2026-03-02 10:00
       1 | 2026-03-03 11:00
       1 | 2026-03-05 08:00   <- streak broken (no 03-04)
       2 | 2026-03-01 09:00
       2 | 2026-03-03 09:00
       2 | 2026-03-04 09:00
       3 | 2026-03-10 07:00
       3 | 2026-03-11 07:00
       3 | 2026-03-12 07:00
       3 | 2026-03-13 07:00
\`\`\`

Find every streak of **3 or more consecutive days**, with its start day, end day and length.

Expected result:

\`\`\`text
 user_id | start_day  |  end_day   | streak_len
---------+------------+------------+------------
       1 | 2026-03-01 | 2026-03-03 |          3
       3 | 2026-03-10 | 2026-03-13 |          4
\`\`\``,
      hints: [
        'First reduce the data to one row per (user, day) with `DISTINCT` and `login_at::date`.',
        'Number each user\'s days with `ROW_NUMBER()`. Now subtract that number (in days) from the date. What do you notice for consecutive days?',
        'For consecutive days, `day - row_number` gives the **same** date. That value is a group key. `GROUP BY user_id, group_key` and keep groups with `COUNT(*) >= 3`.',
      ],
      solution: `**Idea:** this is the classic **gaps and islands** problem. An "island" is a run of consecutive days. Trick: if days go up by 1 and the row number also goes up by 1, then \`day - row_number\` stays constant inside an island.

\`\`\`text
user 1:  day         rn   day - rn
         2026-03-01   1   2026-02-28   <- same key = same streak
         2026-03-02   2   2026-02-28
         2026-03-03   3   2026-02-28
         2026-03-05   4   2026-03-01   <- gap, new key
\`\`\`

\`\`\`sql
WITH days AS (
  -- 1. one row per user per calendar day
  SELECT DISTINCT user_id, login_at::date AS day
  FROM logins
),
grouped AS (
  -- 2. same grp_key for consecutive days
  SELECT
    user_id,
    day,
    day - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY day))::int AS grp_key
    -- date - integer = date, in Postgres
  FROM days
)
-- 3. one row per island
SELECT
  user_id,
  MIN(day)  AS start_day,
  MAX(day)  AS end_day,
  COUNT(*)  AS streak_len
FROM grouped
GROUP BY user_id, grp_key
HAVING COUNT(*) >= 3
ORDER BY user_id, start_day;
\`\`\`

**Why it works:** inside a streak both the date and the row number increase by exactly 1 per row, so their difference does not change. A missing day makes the date jump by 2 while the row number jumps by 1, so the difference changes and a new group starts.

**Edge cases:**
- **Duplicates per day** must be removed first (\`DISTINCT\`), or the row number would grow faster than the date and break the streak.
- **Time zones:** \`login_at::date\` uses the session time zone. For "days" in the user's zone use \`(login_at AT TIME ZONE 'Asia/Kolkata')::date\`.

**Alternative with LAG:** mark a row as "new streak" when \`day - LAG(day) <> 1\`, then a running \`SUM\` of those flags gives the group id. It is longer but works for any "start a new group when X changes" problem.`,
      followUps: [
        {
          q: 'How do you get each user\'s longest streak ever?',
          a: 'Wrap the island query (without the HAVING) in a CTE and take `MAX(streak_len)` per user: `SELECT user_id, MAX(streak_len) FROM streaks GROUP BY user_id`. For the sample: user 1 = 3, user 2 = 2, user 3 = 4.',
        },
        {
          q: 'How do you find the current streak (still going today)?',
          a: 'Keep only islands whose `end_day` is today (or yesterday, if today\'s login may still come). `WHERE end_day >= current_date - 1`.',
        },
      ],
    },
    {
      id: 'prevent-double-booking',
      title: 'Prevent double booking of a hotel room, even under concurrency',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'keys-constraints',
      question: `A booking API stores room reservations:

\`\`\`sql
CREATE TABLE bookings (
  id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id  int NOT NULL,
  guest    text NOT NULL,
  check_in  timestamptz NOT NULL,
  check_out timestamptz NOT NULL
);
\`\`\`

The current code first runs "is there any overlapping booking for this room?" and, if not, inserts. In production two guests sometimes get the **same room for overlapping nights**.

1. Why does the "check then insert" approach fail?
2. Make overlaps **impossible** at the database level. Back-to-back stays (one guest checks out at 11:00, the next checks in at 11:00) must be allowed.
3. How should the Node API react when the database rejects a booking?`,
      hints: [
        'Two requests can both run the check before either inserts. Neither sees the other\'s row.',
        'A UNIQUE constraint only catches equal values, not overlapping ranges. Postgres has a constraint type for "no two rows may overlap": an EXCLUDE constraint.',
        'Store the stay as a `tstzrange` with `[)` bounds (start included, end excluded), and use `EXCLUDE USING gist (room_id WITH =, during WITH &&)`. You need the `btree_gist` extension for the `=` part.',
      ],
      solution: `**1. Why check-then-insert fails:** it is a race condition.

\`\`\`text
request A: SELECT overlaps for room 101 -> none
request B: SELECT overlaps for room 101 -> none   (A has not inserted yet)
request A: INSERT booking
request B: INSERT booking                         -> double booking
\`\`\`

Even inside transactions, at READ COMMITTED neither transaction sees the other's uncommitted row. The rule must live in the database, where it is checked atomically.

**2. Exclusion constraint:**

\`\`\`sql
-- lets a GiST index handle plain "=" on room_id (run once per database)
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id int  NOT NULL,
  guest   text NOT NULL,
  during  tstzrange NOT NULL,          -- one value: [check_in, check_out)
  CONSTRAINT no_double_booking
    EXCLUDE USING gist (
      room_id WITH =,                  -- same room...
      during  WITH &&                  -- ...and ranges overlap  -> rejected
    )
);

INSERT INTO bookings (room_id, guest, during)
VALUES (101, 'Asha', tstzrange('2026-05-01 14:00', '2026-05-03 11:00', '[)'));

-- OK: starts exactly when Asha leaves; '[)' means the end is NOT included
INSERT INTO bookings (room_id, guest, during)
VALUES (101, 'Ben',  tstzrange('2026-05-03 11:00', '2026-05-05 11:00', '[)'));

-- ERROR: conflicting key value violates exclusion constraint "no_double_booking"
INSERT INTO bookings (room_id, guest, during)
VALUES (101, 'Chen', tstzrange('2026-05-02 14:00', '2026-05-04 11:00', '[)'));
\`\`\`

**Why it works:** an exclusion constraint is like UNIQUE, but with your own operators. For every new row Postgres checks, using the GiST index, "is there a row with the same room AND an overlapping range?". This check is safe under concurrency: if two inserts race, the second one waits for the first and then fails.

**3. In the API:** catch the error and return **409 Conflict**.

\`\`\`javascript
app.post('/bookings', async (req, res, next) => {
  const { roomId, guest, checkIn, checkOut } = req.body;
  try {
    await pool.query(
      "INSERT INTO bookings (room_id, guest, during) VALUES ($1, $2, tstzrange($3, $4, '[)'))",
      [roomId, guest, checkIn, checkOut]);
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === '23P01') {          // exclusion_violation
      return res.status(409).json({ error: 'Room is not available for these dates' });
    }
    next(err);
  }
});
\`\`\`

**Other answers you can mention:**
- Lock the room row first (\`SELECT ... FROM rooms WHERE id = $1 FOR UPDATE\`), then check and insert. It works, but every developer must remember to do it.
- \`SERIALIZABLE\` isolation plus retry on error \`40001\`.
- Cancelled bookings: add \`WHERE (status <> 'cancelled')\` to the constraint so they do not block the room.`,
      followUps: [
        {
          q: 'How do you find free rooms for given dates?',
          a: '`SELECT r.id FROM rooms r WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.room_id = r.id AND b.during && tstzrange($1, $2, \'[)\'));` The same GiST index helps this query.',
        },
        {
          q: 'Why use one range column instead of check_in and check_out?',
          a: 'The `&&` (overlaps) operator and the exclusion constraint work on range types. Ranges also make the inclusive/exclusive edges explicit, and Postgres checks that start <= end automatically.',
        },
      ],
    },
    {
      id: 'deadlock-in-money-transfers',
      title: 'Debug: "deadlock detected" in money transfers',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'locks-deadlocks',
      question: `A payments service moves money between accounts. Under load, the logs show:

\`\`\`text
ERROR:  deadlock detected
DETAIL: Process 4123 waits for ShareLock on transaction 9001; blocked by process 4188.
        Process 4188 waits for ShareLock on transaction 9000; blocked by process 4123.
\`\`\`

\`\`\`javascript
async function transfer(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
\`\`\`

1. Explain how two transfers deadlock.
2. Fix it so this deadlock cannot happen.
3. What should the app still do when a deadlock (or similar error) happens?`,
      hints: [
        'Imagine transfer(1 → 2) and transfer(2 → 1) at the same time. Which row does each one lock first?',
        'A deadlock needs a cycle: A waits for B while B waits for A. If everyone takes locks in the same order, a cycle cannot form.',
        'Always lock the smaller account id first, no matter the direction. Then retry the whole transaction on error code `40P01`.',
      ],
      solution: `**1. How it happens:** an \`UPDATE\` locks the row until the transaction ends.

\`\`\`text
T1: transfer(1 -> 2)                 T2: transfer(2 -> 1)
UPDATE account 1   (locks row 1)
                                     UPDATE account 2   (locks row 2)
UPDATE account 2   -> waits for T2
                                     UPDATE account 1   -> waits for T1
            T1 waits for T2, T2 waits for T1  =  deadlock
\`\`\`

Postgres checks for this after \`deadlock_timeout\` (1 second by default), kills one of the transactions with \`deadlock detected\`, and lets the other continue.

**2. Fix — always lock rows in the same order (by id):**

\`\`\`javascript
async function transfer(fromId, toId, amount) {
  if (fromId === toId) throw new Error('Cannot transfer to the same account');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock both rows in a fixed order: smaller id first.
    const [firstId, secondId] = fromId < toId ? [fromId, toId] : [toId, fromId];
    await client.query('SELECT 1 FROM accounts WHERE id = $1 FOR UPDATE', [firstId]);
    await client.query('SELECT 1 FROM accounts WHERE id = $1 FOR UPDATE', [secondId]);

    // Now we own both locks; the order of these updates no longer matters.
    const debit = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1',
      [amount, fromId]);
    if (debit.rowCount === 0) throw new Error('Insufficient funds');

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
\`\`\`

Now both transfer(1 → 2) and transfer(2 → 1) try to lock row 1 first. One wins, the other **waits** (no cycle), and continues after the first commits.

**3. Retry on transient errors:** deadlocks can still come from other code paths, and \`SERIALIZABLE\` transactions can fail with serialization errors. Retry the **whole** transaction a few times:

\`\`\`javascript
const RETRYABLE = new Set(['40P01', '40001']); // deadlock_detected, serialization_failure

async function withRetry(fn, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!RETRYABLE.has(err.code) || i >= attempts) throw err;
      await new Promise((r) => setTimeout(r, 20 * i + Math.random() * 30)); // small jittered backoff
    }
  }
}

await withRetry(() => transfer(1, 2, 30));
\`\`\`

**Why it works:** a deadlock needs a cycle in the "who waits for whom" graph. If every transaction takes locks in one global order, nobody can hold a "later" lock while waiting for an "earlier" one, so no cycle.

**Also good:** keep transactions short (no HTTP calls inside them), and use an idempotency key so a retried transfer request is not applied twice.`,
      followUps: [
        {
          q: 'Can a single UPDATE statement deadlock?',
          a: 'Yes. `UPDATE accounts ... WHERE id IN (1, 2)` locks rows in the order it finds them, which may differ between two statements. Locking first with `SELECT ... WHERE id IN (...) ORDER BY id FOR UPDATE` makes the order predictable.',
        },
        {
          q: 'How do you investigate which queries are blocking each other right now?',
          a: 'Query `pg_stat_activity` with `pg_blocking_pids(pid)` to see who blocks whom, and turn on `log_lock_waits = on` so waits longer than `deadlock_timeout` are logged with the queries involved.',
        },
      ],
    },
    {
      id: 'zero-downtime-not-null-column',
      title: 'Add a NOT NULL column to a 50M-row table with zero downtime',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'migrations',
      question: `Your \`orders\` table has 50 million rows and gets hundreds of writes per second. Product wants a new required column \`currency\` (\`'USD'\`, \`'EUR'\`, \`'INR'\`...). Old rows must get the currency of their **store** (from \`stores.currency\`), not one fixed value.

A teammate's migration:

\`\`\`sql
ALTER TABLE orders ADD COLUMN currency text NOT NULL;
UPDATE orders o SET currency = s.currency FROM stores s WHERE s.id = o.store_id;
\`\`\`

1. What goes wrong with this migration?
2. Plan a safe, zero-downtime rollout, step by step (database **and** app deploys).
3. Is it different if every old row can simply get \`'USD'\`?`,
      hints: [
        'The first statement fails right away on a non-empty table. Why? And even if it worked, what lock does `ALTER TABLE` take, and how long would a 50M-row UPDATE hold row locks?',
        'Use the "expand and contract" pattern: add the column as nullable, make the app write it, backfill in small batches, then enforce NOT NULL.',
        'To enforce NOT NULL without a long lock: `ADD CONSTRAINT ... CHECK (currency IS NOT NULL) NOT VALID`, then `VALIDATE CONSTRAINT`, then `SET NOT NULL` (Postgres 12+ skips the full scan when a valid CHECK proves it).',
      ],
      solution: `**1. What goes wrong:**
- \`ADD COLUMN ... NOT NULL\` with no default **fails**: existing rows would have NULL.
- \`ALTER TABLE\` needs an \`ACCESS EXCLUSIVE\` lock. If a long query is running, the ALTER waits, and **every new query queues behind it**. The site freezes even for a "fast" ALTER.
- One giant \`UPDATE\` of 50M rows runs as one long transaction: it locks every row it touches until the end, creates 50M dead row versions (table bloat), and makes replicas lag.

**2. Safe rollout — expand, migrate, contract:**

\`\`\`sql
-- Step 1 (expand): add a NULLABLE column. Metadata-only, very fast.
SET lock_timeout = '3s';      -- give up instead of blocking the whole site; retry later
ALTER TABLE orders ADD COLUMN currency text;
\`\`\`

**Step 2 (app deploy):** new code writes \`currency\` on every new order and handles NULL when reading old rows (e.g. fall back to the store currency).

\`\`\`sql
-- Step 3: backfill old rows in small batches (run from a script, in a loop)
UPDATE orders o
SET currency = s.currency
FROM stores s
WHERE s.id = o.store_id
  AND o.id IN (
    SELECT id FROM orders
    WHERE currency IS NULL
    ORDER BY id
    LIMIT 5000            -- small batch = short transaction, short row locks
  );
-- repeat until 0 rows updated; sleep a little between batches to protect replicas
\`\`\`

\`\`\`sql
-- Step 4: prove "no NULLs" without a long exclusive lock
ALTER TABLE orders
  ADD CONSTRAINT orders_currency_not_null CHECK (currency IS NOT NULL) NOT VALID;
  -- NOT VALID: checks new rows only; instant

ALTER TABLE orders VALIDATE CONSTRAINT orders_currency_not_null;
  -- scans old rows, but with a lighter lock: reads and writes continue

-- Step 5: real NOT NULL. On Postgres 12+ this uses the valid CHECK and skips the scan.
ALTER TABLE orders ALTER COLUMN currency SET NOT NULL;
ALTER TABLE orders DROP CONSTRAINT orders_currency_not_null;  -- no longer needed
\`\`\`

**Step 6 (contract, app deploy):** remove the NULL fallback code.

**Why it works:** every step is either instant or runs without blocking normal traffic. The app works at every stage, so you can deploy app and database separately and roll back safely. \`lock_timeout\` makes sure a migration never queues the whole site behind it.

**3. If every old row can be \`'USD'\`:** much simpler. Since Postgres 11, adding a column with a **constant** default is metadata-only (no table rewrite):

\`\`\`sql
SET lock_timeout = '3s';
ALTER TABLE orders ADD COLUMN currency text NOT NULL DEFAULT 'USD';  -- instant
\`\`\`

(A **volatile** default like \`DEFAULT gen_random_uuid()\` or \`clock_timestamp()\` still rewrites the whole table.)`,
      followUps: [
        {
          q: 'How do you add an index to this big table without blocking writes?',
          a: '`CREATE INDEX CONCURRENTLY`. It takes longer and cannot run inside a transaction block (many migration tools wrap migrations in one, so disable that for this migration). If it fails, it leaves an INVALID index that you must drop and re-create.',
        },
        {
          q: 'How would you rename a column with zero downtime?',
          a: 'Do not rename in one step. Add the new column, write to both, backfill, switch reads to the new column, stop writing the old one, then drop it later. A direct rename breaks any running app version that still uses the old name.',
        },
      ],
    },
    {
      id: 'serverless-connection-pool-exhaustion',
      title: 'Scenario: "too many clients" after moving the API to serverless',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'connection-pooling',
      question: `You moved a Node API from one EC2 server to AWS Lambda (or Vercel functions). It worked in testing. During a marketing campaign, errors appear:

\`\`\`text
error: sorry, too many clients already
error: remaining connection slots are reserved for non-replication superuser connections
\`\`\`

The database is Postgres on RDS with \`max_connections = 100\`. The handler looks like this:

\`\`\`javascript
import pg from 'pg';

export async function handler(event) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); // default max: 10
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [event.id]);
  return { statusCode: 200, body: JSON.stringify(rows[0]) };
}
\`\`\`

1. Explain why the database runs out of connections.
2. Fix the code.
3. What infrastructure change makes this safe at high traffic?`,
      hints: [
        'Serverless runs one function instance per concurrent request. How many instances run during a spike, and how many connections can each one open?',
        'A new Pool is created on every invocation and never closed. Move the pool outside the handler, and keep `max` very small per instance.',
        'Put a connection pooler between functions and Postgres: RDS Proxy, PgBouncer, or the pooler from Neon/Supabase.',
      ],
      solution: `**1. Why connections run out:**
- Each concurrent request gets its **own** function instance. 300 users at once = up to 300 instances.
- Each invocation creates a **new** \`Pool\` (up to 10 connections) and never calls \`pool.end()\`. Warm instances keep old pools alive, leaking connections.
- Postgres connections are heavy (one OS process each, several MB of memory). \`max_connections = 100\` is reached quickly, and new clients are refused.

On one EC2 server, a single pool of 10-20 connections served everyone. Serverless multiplies the pools.

**2. Fix the code — one tiny pool per instance, reused across invocations:**

\`\`\`javascript
import pg from 'pg';

// Created once per instance (module scope), reused by every warm invocation.
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,                         // one instance handles one request at a time
  idleTimeoutMillis: 10_000,      // close idle connections so frozen instances do not hoard them
  connectionTimeoutMillis: 3_000, // fail fast instead of hanging until the function times out
});

export async function handler(event) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [event.id]);
  return { statusCode: 200, body: JSON.stringify(rows[0] ?? null) };
}
\`\`\`

This is better, but 300 instances × 1 connection is still 300 > 100. So the code fix alone is not enough.

**3. Infrastructure — add a connection pooler:**
- **RDS Proxy** (AWS), **PgBouncer**, or the built-in pooler of Neon/Supabase. Functions connect to the pooler. The pooler keeps a small, fixed set of real Postgres connections (say 40) and shares them.
- In **transaction mode**, a real connection is lent to a client only for the length of one transaction, so thousands of clients can share a few dozen connections.
- Caveats of transaction mode: session features do not survive between transactions (\`SET\` without \`LOCAL\`, session advisory locks, \`LISTEN/NOTIFY\`, and named prepared statements on older PgBouncer versions). For Prisma, use the pooled URL with \`?pgbouncer=true&connection_limit=1\` and a direct URL for migrations.

**Other protections:**
- Cap function concurrency (Lambda reserved concurrency) so you cannot exceed what the pooler can serve.
- Cache hot reads (product by id) in Redis or a CDN so most requests never touch Postgres.
- Monitor \`SELECT count(*) FROM pg_stat_activity\` and alert before the limit.
- Do not just raise \`max_connections\` a lot: each connection uses memory, and too many active ones make Postgres slower.`,
      followUps: [
        {
          q: 'On a normal Node server, how do you know if your pool is leaking connections?',
          a: 'Watch `pool.totalCount`, `pool.idleCount` and `pool.waitingCount`. If waiting keeps growing and idle stays 0, some code calls `pool.connect()` without `client.release()` (often missing in an error path). Always release in `finally`.',
        },
        {
          q: 'How do you choose the pool size for a normal server?',
          a: 'Start small (10-20 per app instance) and make sure instances × pool size stays under `max_connections` minus a reserve for admin tools and migrations. More connections than CPU cores rarely makes Postgres faster; it often makes it slower.',
        },
      ],
    },
  ],
};
