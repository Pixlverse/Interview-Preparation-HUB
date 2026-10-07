// Interview problems for the Testing stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'testing',
  problems: [
    {
      id: 'unit-test-slugify-test-each',
      title: 'Write unit tests for a slugify function (with test.each)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'jest-basics-matchers',
      question: `Here is a small pure function. (A **pure function** gives the same output for the same input and has no side effects, so it is the easiest thing to test.)

\`\`\`javascript
// slugify.js
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '') // remove symbols
    .replace(/[\\s-]+/g, '-')      // spaces / many dashes -> one dash
    .replace(/^-+|-+$/g, '');      // no dash at the start or end
}
\`\`\`

Write Jest tests for it. Cover the normal case **and** the edge cases. Do not write one \`test()\` per input by copy-paste. Did your tests find any bug?`,
      hints: [
        'List inputs first: a normal sentence, extra spaces, symbols, many dashes, an empty string, wrong type, non-English letters.',
        'Jest has `test.each(table)(name, fn)` to run the same test body for every row of a table.',
        'Try `slugify("Café")`. What do you expect? What do you get?',
      ],
      solution: `**Idea:** put every input/expected pair in a table and use \`test.each\`. Keep the special cases (errors, known bugs) as separate, clearly named tests.

\`\`\`javascript
// slugify.test.js
import { slugify } from './slugify';

describe('slugify', () => {
  // Table-driven test: one row = one case. $input / $expected go into the test name.
  test.each([
    { input: 'Hello World', expected: 'hello-world' },     // normal case
    { input: '  Trim me  ', expected: 'trim-me' },         // spaces at the ends
    { input: 'React & Node!', expected: 'react-node' },    // symbols removed
    { input: 'a---b', expected: 'a-b' },                   // many dashes -> one
    { input: '--x--', expected: 'x' },                     // no dash at the ends
    { input: 'Node.js 22', expected: 'nodejs-22' },        // numbers kept
    { input: '', expected: '' },                           // empty string
  ])('slugify("$input") -> "$expected"', ({ input, expected }) => {
    expect(slugify(input)).toBe(expected);
  });

  test('throws a TypeError when the input is not a string', () => {
    // wrap the call in a function, or Jest cannot catch the error
    expect(() => slugify(null)).toThrow(TypeError);
  });

  test('keeps accented letters as plain letters', () => {
    // This test FAILS today: slugify('Café') returns 'caf'
    expect(slugify('Café')).toBe('cafe');
  });
});
\`\`\`

**Why it works:** \`test.each\` gives one test result per row, so a failure tells you the exact input. Adding a new case is one new line. The edge-case list found a real bug: \`'Café'\` becomes \`'caf'\`, because \`é\` is not in \`a-z\` and is deleted.

Fix: before the other steps, call \`text.normalize('NFD')\` (this splits \`é\` into \`e\` + an accent mark), then remove the accent marks. The symbol-removal step already deletes them, so the result becomes \`'cafe'\`.`,
      followUps: [
        {
          q: 'Why `() => slugify(null)` and not `slugify(null)` inside `expect`?',
          a: 'Without the wrapper, the error is thrown **before** `expect` runs, so the test crashes instead of checking it. The wrapper lets Jest call the function inside a try/catch.',
        },
        {
          q: 'How do you pick edge cases quickly?',
          a: 'Think "empty, one, many, wrong type, boundary, weird characters". For strings: empty, spaces only, symbols, very long, Unicode. For numbers: 0, negative, decimals, NaN.',
        },
      ],
    },
    {
      id: 'async-test-passes-but-should-fail',
      title: 'Debug: this async test always passes',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'jest-async-tests',
      question: `\`getUser(999)\` returns a promise that **rejects** with \`new Error('Not found')\`. A teammate wrote these two tests. Both are green. Someone then broke \`getUser\` so it **resolves** with \`null\` for unknown ids — and both tests are **still green**. Why? Fix them.

\`\`\`javascript
test('rejects for an unknown user (A)', () => {
  expect(getUser(999)).rejects.toThrow('Not found');
});

test('rejects for an unknown user (B)', async () => {
  try {
    await getUser(999);
  } catch (err) {
    expect(err.message).toBe('Not found');
  }
});
\`\`\``,
      hints: [
        'In test A, does Jest know it has to wait for the promise?',
        'In test B, what happens when `getUser` does NOT throw? How many `expect` calls run?',
        'Look at `await` / `return` for A, and `expect.assertions(n)` for B.',
      ],
      solution: `**Idea:** A finishes before the promise settles (nobody waits for it). B has no assertion at all when no error is thrown, and a test with zero failed assertions passes.

\`\`\`javascript
// Fix A: await (or return) the promise assertion, so Jest waits for it
test('rejects for an unknown user (A)', async () => {
  await expect(getUser(999)).rejects.toThrow('Not found');
});

// Fix B (if you want to keep try/catch): say how many assertions must run
test('rejects for an unknown user (B)', async () => {
  expect.assertions(1); // test fails if the catch block never runs
  try {
    await getUser(999);
  } catch (err) {
    expect(err.message).toBe('Not found');
  }
});
\`\`\`

**Why it works:**
- \`.rejects\` / \`.resolves\` return a promise. Without \`await\` or \`return\`, the test function ends right away and Jest marks it green. The real check happens later, when nobody is listening.
- \`expect.assertions(1)\` makes Jest count assertions. If \`getUser\` resolves, the \`catch\` never runs, the count is 0, and the test fails.

The first style (\`await expect(...).rejects\`) is shorter and is the one to prefer.`,
      followUps: [
        {
          q: 'How do you test the success case in one line?',
          a: '`await expect(getUser(1)).resolves.toEqual({ id: 1, name: "Asha" });`',
        },
        {
          q: 'Can a lint rule catch the missing await?',
          a: 'Yes. `eslint-plugin-jest` has `jest/valid-expect` (flags un-awaited `.resolves` / `.rejects`) and `jest/no-conditional-expect` (flags `expect` inside `catch`).',
        },
      ],
    },
    {
      id: 'jest-matchers-which-pass',
      title: 'Which of these assertions pass?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'jest-basics-matchers',
      question: `For each line, say **pass** or **fail**, and why.

\`\`\`javascript
expect(0.1 + 0.2).toBe(0.3);                                 // A
expect({ a: 1 }).toBe({ a: 1 });                             // B
expect({ a: 1 }).toEqual({ a: 1 });                          // C
expect({ a: 1, b: undefined }).toEqual({ a: 1 });            // D
expect({ a: 1, b: undefined }).toStrictEqual({ a: 1 });      // E
expect(NaN).toBe(NaN);                                       // F
expect({ id: 7, name: 'Asha', createdAt: new Date() })
  .toMatchObject({ id: 7, name: 'Asha' });                   // G
expect([1, 2, 3]).toContain(2);                              // H
expect(() => JSON.parse('{')).toThrow();                     // I
\`\`\``,
      hints: [
        '`toBe` uses `Object.is` — the same as `===` except for `NaN` and `-0`.',
        '`toEqual` ignores properties whose value is `undefined`; `toStrictEqual` does not.',
      ],
      solution: `**Answer:**

\`\`\`text
A  fail  0.1 + 0.2 is 0.30000000000000004 (floating point)
B  fail  two different objects; toBe checks identity (same reference)
C  pass  toEqual compares values deeply
D  pass  toEqual ignores keys whose value is undefined
E  fail  toStrictEqual treats "b: undefined" as a real key
F  pass  toBe uses Object.is, and Object.is(NaN, NaN) is true
G  pass  toMatchObject only checks the keys you list
H  pass  2 is an item of the array
I  pass  the function throws a SyntaxError
\`\`\`

**How to fix A:**

\`\`\`javascript
expect(0.1 + 0.2).toBeCloseTo(0.3); // compares with a small tolerance
\`\`\`

**Why it matters:** picking the right matcher is half of writing good tests.
- \`toBe\` for primitives (numbers, strings, booleans).
- \`toEqual\` for objects and arrays.
- \`toStrictEqual\` when \`undefined\` keys or class types matter.
- \`toMatchObject\` when the object has noisy fields (ids, dates) you do not care about.`,
      followUps: [
        {
          q: 'How do you check "any string" or "any date" inside an object?',
          a: 'Use asymmetric matchers: `expect(user).toEqual({ id: expect.any(String), createdAt: expect.any(Date), name: "Asha" })`.',
        },
        {
          q: 'What does `expect(-0).toBe(0)` do?',
          a: 'It fails, because `Object.is(-0, 0)` is false. `toEqual` treats them as different too. This rarely matters, but it can surprise you in math code (for example `Math.round(-0.4)` is `-0`).',
        },
      ],
    },
    {
      id: 'deterministic-date-random',
      title: 'Make a test with Date and Math.random deterministic',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'jest-mocking',
      question: `This function creates a coupon. Its output changes every time it runs, so the test is hard to write. Write a test that checks the **exact** coupon.

\`\`\`javascript
// coupon.js
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function createCoupon() {
  const number = Math.floor(Math.random() * 10000); // 0 - 9999
  return {
    code: 'SAVE-' + String(number).padStart(4, '0'),
    expiresAt: new Date(Date.now() + WEEK_MS).toISOString(),
  };
}
\`\`\``,
      hints: [
        'You can replace `Math.random` for one test with `jest.spyOn(Math, "random")`.',
        'Jest "modern" fake timers also fake `Date`. Look at `jest.setSystemTime()`.',
        'Always undo the fakes after the test so other tests are not affected.',
      ],
      solution: `**Idea:** control the two sources of randomness. Make \`Math.random\` return a fixed number and freeze the clock at a known date.

\`\`\`javascript
// coupon.test.js
import { createCoupon } from './coupon';

describe('createCoupon', () => {
  beforeEach(() => {
    jest.useFakeTimers();                                   // fake timers AND Date
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));  // freeze "now"
    jest.spyOn(Math, 'random').mockReturnValue(0.5);       // 0.5 * 10000 = 5000
  });

  afterEach(() => {
    jest.useRealTimers();    // real clock back
    jest.restoreAllMocks();  // real Math.random back
  });

  test('builds the code and the expiry date', () => {
    expect(createCoupon()).toEqual({
      code: 'SAVE-5000',
      expiresAt: '2026-01-08T00:00:00.000Z', // exactly 7 days later
    });
  });

  test('pads small numbers with zeros', () => {
    Math.random.mockReturnValue(0.0042);      // 42
    expect(createCoupon().code).toBe('SAVE-0042');
  });
});
\`\`\`

**Why it works:** \`jest.spyOn\` swaps the real method for a mock you control and remembers the original, so \`restoreAllMocks\` can put it back. Modern fake timers replace \`Date\` too, so \`Date.now()\` returns the frozen time. With no randomness left, you can assert the exact output.

A cleaner long-term design: pass \`now\` and \`random\` in as parameters (dependency injection). Then the test does not need any mocking.`,
      followUps: [
        {
          q: 'Why is a test that "checks the code matches /SAVE-\\d{4}/" weaker?',
          a: 'It only checks the shape. It would not catch a bug in the padding or in the expiry math. Fixed inputs let you check exact values.',
        },
        {
          q: 'What happens if you forget `restoreAllMocks`?',
          a: 'Later tests (in the same file) still get the fake `Math.random`. That causes confusing, order-dependent failures. Many teams set `restoreMocks: true` in the Jest config.',
        },
      ],
    },
    {
      id: 'snapshot-misuse-review',
      title: 'Review: a 400-line snapshot test that everyone just updates',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'snapshot-testing',
      question: `In code review you see this test for the whole dashboard page. The snapshot file is 400 lines. The team says: "When it fails we just run \`jest -u\`."

\`\`\`javascript
test('Dashboard renders', () => {
  const { container } = render(<Dashboard user={mockUser} orders={mockOrders} />);
  expect(container).toMatchSnapshot();
});
\`\`\`

What is wrong with this test? What would you suggest instead?`,
      hints: [
        'If a test fails for every small CSS or text change, do people still read the failure?',
        'What **behavior** does the user care about on the dashboard? Write tests for that.',
      ],
      solution: `**Idea:** a huge snapshot does not say what "correct" means. It fails on every harmless change, people update it without reading, and then it catches nothing. Replace it with a few focused assertions about behavior.

**Problems:**
- **No intent.** The test name "renders" does not say what must be true.
- **Noisy.** Any class name or wording change breaks it.
- **Rubber-stamped.** \`jest -u\` accepts bugs into the snapshot too.
- **Big diffs** are not reviewed in PRs.

**Better:**

\`\`\`javascript
test('shows the user name and the order count', () => {
  render(<Dashboard user={{ name: 'Asha' }} orders={[{ id: 1 }, { id: 2 }]} />);

  expect(screen.getByRole('heading', { name: /welcome, asha/i })).toBeInTheDocument();
  expect(screen.getByText('2 orders')).toBeInTheDocument();
});

test('shows an empty state when there are no orders', () => {
  render(<Dashboard user={{ name: 'Asha' }} orders={[]} />);
  expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
});

// Small snapshots are fine for stable, serialized output:
test('formats the CSV header', () => {
  expect(buildCsvHeader(['id', 'total'])).toMatchInlineSnapshot(\`"id,total"\`);
});
\`\`\`

**Why it works:** each test checks one thing a user cares about, so a failure means something real. Snapshots stay only where the output is small and stable, and inline snapshots live inside the test so reviewers see them.`,
      followUps: [
        {
          q: 'When is a snapshot test a good choice?',
          a: 'For small, stable output: an error message format, a generated config object, a serialized API response shape. Keep it short enough to review in a PR.',
        },
        {
          q: 'How do you stop snapshots breaking because of dates or ids?',
          a: 'Use property matchers: `expect(order).toMatchSnapshot({ id: expect.any(String), createdAt: expect.any(Date) })`, or freeze time with fake timers.',
        },
      ],
    },
    {
      id: 'test-debounce-fake-timers',
      title: 'Test a debounce function with fake timers',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'jest-async-tests',
      question: `You have a \`debounce(fn, delay)\` function. (It waits until calls stop for \`delay\` ms, then calls \`fn\` once with the latest arguments.)

Write tests that prove:
1. \`fn\` is **not** called before the delay ends.
2. Many quick calls cause **one** call with the **latest** arguments.
3. A new call **restarts** the wait.

The tests must run instantly — no real 300 ms waits.`,
      hints: [
        'Real waiting makes tests slow and flaky. Jest can replace `setTimeout` with a fake clock: `jest.useFakeTimers()`.',
        'Move the fake clock with `jest.advanceTimersByTime(ms)`.',
        'Use `jest.fn()` as `fn`, so you can check `toHaveBeenCalledTimes` and `toHaveBeenCalledWith`.',
      ],
      solution: `**Idea:** fake the clock, call the debounced function, move time forward by hand, and check the mock after each step.

\`\`\`javascript
// debounce.test.js
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('does not call fn before the delay ends', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    jest.advanceTimersByTime(299); // 1 ms too early

    expect(fn).not.toHaveBeenCalled();
  });

  test('many quick calls -> one call with the latest args', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('r');
    debounced('re');
    debounced('react');
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('react');
  });

  test('a new call restarts the wait', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    jest.advanceTimersByTime(200);
    debounced('b');                 // timer restarts here
    jest.advanceTimersByTime(200);  // 400 ms since the first call...
    expect(fn).not.toHaveBeenCalled(); // ...but only 200 ms since the last

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
  });
});
\`\`\`

**Why it works:** with fake timers, \`setTimeout\` callbacks run only when you move the clock. The tests are instant and always give the same result. Checking 299 ms vs 300 ms proves the boundary is exact. \`useRealTimers\` in \`afterEach\` stops the fake clock leaking into other tests.`,
      followUps: [
        {
          q: 'What changes if the code inside the timer uses promises (`await`)?',
          a: 'Use the async versions: `await jest.advanceTimersByTimeAsync(300)` or `await jest.runAllTimersAsync()`. They also let pending promise callbacks run between timers.',
        },
        {
          q: 'How would you test debounce in a React search box?',
          a: 'Render the component, type with `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })`, advance the clock, then assert that the search request was made once with the final text.',
        },
      ],
    },
    {
      id: 'mock-email-service-module',
      title: 'Mock an email service and assert it was called correctly',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'jest-mocking',
      question: `Write unit tests for \`signUp\`. The tests must **not** send real emails or touch a real database.

\`\`\`javascript
// userService.js
import { sendEmail } from './emailService';
import { User } from './models/User';

export async function signUp({ email, name }) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('Email already used');

  const user = await User.create({ email, name });
  await sendEmail({ to: email, template: 'welcome', data: { name } });
  return user;
}
\`\`\`

Test: (1) the happy path sends the welcome email, (2) a duplicate email throws and sends **no** email, (3) what happens when the email service is down.`,
      hints: [
        '`jest.mock("./emailService")` replaces every exported function of that module with a `jest.fn()`.',
        'For the model, pass a factory: `jest.mock("./models/User", () => ({ User: { findOne: jest.fn(), create: jest.fn() } }))`.',
        'Use `mockResolvedValue` / `mockRejectedValue` to control what each mock returns, and clear mocks between tests.',
      ],
      solution: `**Idea:** replace the two dependencies (email and database) with mocks. Then each test sets what the mocks return and checks what \`signUp\` did with them.

\`\`\`javascript
// userService.test.js
import { signUp } from './userService';
import { sendEmail } from './emailService';
import { User } from './models/User';

jest.mock('./emailService'); // automock: sendEmail becomes jest.fn()
jest.mock('./models/User', () => ({
  User: { findOne: jest.fn(), create: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks(); // forget calls from earlier tests
});

test('creates the user and sends the welcome email', async () => {
  User.findOne.mockResolvedValue(null);                       // no existing user
  User.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'Asha' });
  sendEmail.mockResolvedValue(undefined);

  const user = await signUp({ email: 'a@b.com', name: 'Asha' });

  expect(user).toEqual({ id: 'u1', email: 'a@b.com', name: 'Asha' });
  expect(User.create).toHaveBeenCalledWith({ email: 'a@b.com', name: 'Asha' });
  expect(sendEmail).toHaveBeenCalledTimes(1);
  expect(sendEmail).toHaveBeenCalledWith({
    to: 'a@b.com',
    template: 'welcome',
    data: { name: 'Asha' },
  });
});

test('throws for a duplicate email and sends nothing', async () => {
  User.findOne.mockResolvedValue({ id: 'old' });

  await expect(signUp({ email: 'a@b.com', name: 'Asha' }))
    .rejects.toThrow('Email already used');

  expect(User.create).not.toHaveBeenCalled();
  expect(sendEmail).not.toHaveBeenCalled();
});

test('rejects when the email service is down', async () => {
  User.findOne.mockResolvedValue(null);
  User.create.mockResolvedValue({ id: 'u1' });
  sendEmail.mockRejectedValue(new Error('SMTP down'));

  await expect(signUp({ email: 'a@b.com', name: 'Asha' }))
    .rejects.toThrow('SMTP down');
});
\`\`\`

**Why it works:** \`jest.mock\` calls are moved to the top of the file by Jest (this is called **hoisting**), so the imports already get the mocked versions. Each test sets its own return values, and \`clearAllMocks\` resets call counts so tests do not affect each other.

The third test shows a **design question**: right now the user is saved, but signup fails because the email failed. Many teams prefer to catch the email error, log it, and retry later with a queue.`,
      followUps: [
        {
          q: 'clearAllMocks vs resetAllMocks vs restoreAllMocks?',
          a: '`clear` forgets calls. `reset` forgets calls **and** the fake return values. `restore` also puts back the real function, but only for `jest.spyOn` mocks.',
        },
        {
          q: 'Is mocking the User model a good idea here?',
          a: 'For a fast unit test, yes. But it cannot catch schema or query mistakes. Add an integration test with mongodb-memory-server for the real database part.',
        },
        {
          q: 'How do you mock this if the project uses native ES modules (no Babel)?',
          a: 'Hoisting does not work there. Use `jest.unstable_mockModule(...)` and then `await import(...)` the module under test after it, or use Vitest, whose `vi.mock` works with ESM.',
        },
      ],
    },
    {
      id: 'supertest-express-endpoint',
      title: 'Test an Express endpoint with supertest (201 / 400 / 401)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'supertest-api-testing',
      question: `Write integration tests for this endpoint. Use **supertest** (it sends HTTP requests to your Express app without opening a real port) and an **in-memory MongoDB** (\`mongodb-memory-server\`).

\`\`\`javascript
// app.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { Note } from './models/Note'; // mongoose model: { title: String, userId: String }

export const app = express(); // exported WITHOUT app.listen()
app.use(express.json());

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/api/notes', auth, async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' });
  }
  const note = await Note.create({ title, userId: req.user.sub });
  res.status(201).json(note);
});
\`\`\`

Cover: success, missing title, no token, invalid token.`,
      hints: [
        'Start the in-memory database in `beforeAll`, connect mongoose to `mongo.getUri()`, and stop both in `afterAll`.',
        'Make a valid token in the test with `jwt.sign({ sub: "user-1" }, "test-secret")` and set `process.env.JWT_SECRET` to the same secret.',
        'For the success case, also check the database, not only the response.',
      ],
      solution: `**Idea:** run the real app, real middleware and a real (in-memory) database. Only the network and the real MongoDB server are replaced.

\`\`\`javascript
// notes.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from './app';
import { Note } from './models/Note';

let mongo;
const SECRET = 'test-secret';
const token = jwt.sign({ sub: 'user-1' }, SECRET);

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Note.deleteMany({}); // every test starts with an empty collection
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('POST /api/notes', () => {
  test('201: creates a note for the logged-in user', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'Buy milk' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', userId: 'user-1' });

    // the note is really in the database
    const saved = await Note.findById(res.body._id);
    expect(saved.title).toBe('Buy milk');
  });

  test('400: title is missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', 'Bearer ' + token)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title is required' });
    expect(await Note.countDocuments()).toBe(0);
  });

  test('401: no token', async () => {
    const res = await request(app).post('/api/notes').send({ title: 'x' });
    expect(res.status).toBe(401);
  });

  test('401: token signed with a different secret', async () => {
    const badToken = jwt.sign({ sub: 'user-1' }, 'wrong-secret');
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', 'Bearer ' + badToken)
      .send({ title: 'x' });
    expect(res.status).toBe(401);
  });
});
\`\`\`

**Why it works:** exporting \`app\` without \`listen()\` lets supertest bind it to a random free port, so test files can run in parallel. The in-memory database is real MongoDB, so schema and query bugs are caught. \`deleteMany\` in \`afterEach\` keeps tests independent.`,
      followUps: [
        {
          q: 'Why not mock mongoose here?',
          a: 'This is an integration test: the goal is to check that routing, middleware, validation and the database work **together**. Mocking the DB would hide the bugs this test is meant to find.',
        },
        {
          q: 'What other cases would you add?',
          a: 'Expired token (sign with `expiresIn: -10`), title of the wrong type (`{ title: 123 }`), a very long title if there is a limit, and a check that one user cannot see another user\'s notes.',
        },
      ],
    },
    {
      id: 'rtl-login-form',
      title: 'Test a login form with React Testing Library',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'react-testing-library',
      question: `Write tests for this component the way a **user** would use it: typing and clicking, not reading state.

\`\`\`jsx
// LoginForm.jsx
import { useState } from 'react';

export function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setError('');
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err.message); // e.g. "Invalid credentials" from the server
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p role="alert">{error}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}
\`\`\`

Cover: successful submit, empty fields, and a server error.`,
      hints: [
        'Find elements the way users do: `getByLabelText("Email")`, `getByRole("button", { name: /log in/i })`.',
        'Use `const user = userEvent.setup()` and `await user.type(...)` / `await user.click(...)`.',
        'The server error appears **after** a promise, so use `await screen.findByRole("alert")`.',
      ],
      solution: `**Idea:** render the form, act like a user, and check what the user would see (an error message) or what the parent would receive (\`onSubmit\` arguments).

\`\`\`jsx
// LoginForm.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

test('calls onSubmit with email and password', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'asha@test.com');
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.click(screen.getByRole('button', { name: /log in/i }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({ email: 'asha@test.com', password: 'secret123' });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('shows an error and does not submit when fields are empty', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: /log in/i }));

  expect(screen.getByRole('alert')).toHaveTextContent('Email and password are required');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('shows the server error message', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'asha@test.com');
  await user.type(screen.getByLabelText('Password'), 'wrong');
  await user.click(screen.getByRole('button', { name: /log in/i }));

  // findBy* waits (retries) until the element appears
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
});
\`\`\`

**Why it works:**
- Queries by label and role are what real users (and screen readers) use. If someone breaks the label, the test fails, which is good.
- \`user-event\` fires the full chain of events (focus, keydown, input, keyup), like a real browser.
- \`getBy\` throws if missing, \`queryBy\` returns \`null\` (use it to check something is **not** there), \`findBy\` waits for async updates.
- \`toHaveTextContent\` and \`toBeInTheDocument\` come from \`@testing-library/jest-dom\`.`,
      followUps: [
        {
          q: 'Why not test that the `error` state equals some string?',
          a: 'State is an implementation detail. If you refactor to `useReducer` or a form library, a state test breaks even though the user sees the same thing. Test what is on the screen.',
        },
        {
          q: 'How would you test that the button is disabled while submitting?',
          a: 'Make `onSubmit` return a promise you control (`new Promise(r => resolve = r)`), click, assert `toBeDisabled()`, then call `resolve()` and wait for it to be enabled again.',
        },
      ],
    },
    {
      id: 'rtl-component-fetches-data-msw',
      title: 'Test a component that fetches data (loading, success, error)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'mocking-external-apis',
      question: `This component loads users from an API. Test the **loading**, **success** and **error** states. Mock the network with **MSW** (Mock Service Worker — it catches HTTP requests and returns fake responses, so your component code does not change).

\`\`\`jsx
// UserList.jsx
import { useEffect, useState } from 'react';

export function UserList() {
  const [users, setUsers] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('https://api.example.com/users')
      .then((res) => {
        if (!res.ok) throw new Error('Bad status ' + res.status);
        return res.json();
      })
      .then(setUsers)
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p role="alert">Could not load users</p>;
  if (!users) return <p>Loading...</p>;
  return (
    <ul>
      {users.map((u) => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
\`\`\`

Assume the test environment has \`fetch\` (for example Jest with the \`jest-fixed-jsdom\` environment, or Vitest).`,
      hints: [
        'Create an MSW server with a default handler in the test file: `setupServer(http.get(url, () => HttpResponse.json([...])))`.',
        'Start it in `beforeAll`, reset per-test overrides in `afterEach`, close it in `afterAll`.',
        'The data arrives later, so use `findBy...`. For the error case, override the handler with `server.use(...)`.',
      ],
      solution: `**Idea:** the component really calls \`fetch\`. MSW answers that request with fake data. You check the screen before and after the answer arrives.

\`\`\`jsx
// UserList.test.jsx
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';      // MSW v2 API
import { setupServer } from 'msw/node';
import { UserList } from './UserList';

const URL = 'https://api.example.com/users';

// default handler: success
const server = setupServer(
  http.get(URL, () =>
    HttpResponse.json([
      { id: 1, name: 'Asha' },
      { id: 2, name: 'Ravi' },
    ]),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // fail on unknown requests
afterEach(() => server.resetHandlers()); // remove per-test overrides
afterAll(() => server.close());

test('shows loading, then the users', async () => {
  render(<UserList />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  expect(await screen.findByText('Asha')).toBeInTheDocument(); // waits for fetch
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

test('shows an error when the API fails', async () => {
  server.use(
    http.get(URL, () => new HttpResponse(null, { status: 500 })), // only for this test
  );

  render(<UserList />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load users');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});
\`\`\`

**Why it works:** MSW works at the network level, so the test does not care whether the component uses \`fetch\`, axios or React Query. If you later swap the library, the test still passes. \`server.use\` adds a handler only until \`resetHandlers\` runs, so the error test does not affect others. \`onUnhandledRequest: 'error'\` catches requests you forgot to mock.`,
      followUps: [
        {
          q: 'Why MSW instead of `jest.spyOn(global, "fetch")`?',
          a: 'A fetch spy ties the test to `fetch`, and you must fake the whole Response object (`ok`, `json()`). MSW fakes the server, so the real fetch/axios code runs. The same handlers can also be used in the browser during development and in Storybook.',
        },
        {
          q: 'How do you check that the component sent the right query string or body?',
          a: 'Read it inside the handler: `http.get(URL, ({ request }) => { const page = new URL(request.url).searchParams.get("page"); ... })`. Prefer asserting on the result on screen; capture the request only when the request itself is the behavior.',
        },
      ],
    },
    {
      id: 'test-custom-hook-renderhook',
      title: 'Test a custom hook (useLocalStorage) with renderHook',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'testing-hooks-context',
      question: `Write tests for this hook. Hooks can only run inside a component, so you need a way to "host" it in a test.

\`\`\`javascript
// useLocalStorage.js
import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
\`\`\`

Cover: the initial value, reading an existing saved value, and saving a new value.`,
      hints: [
        '`renderHook` from `@testing-library/react` runs a hook inside a tiny test component and gives you `result.current`.',
        'Calling the setter changes React state, so wrap it in `act(() => ...)`.',
        'jsdom has a real `localStorage`. Clear it before each test.',
      ],
      solution: `**Idea:** host the hook with \`renderHook\`, read \`result.current\`, change state inside \`act\`, and check both the returned value and \`localStorage\`.

\`\`\`javascript
// useLocalStorage.test.js
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

beforeEach(() => {
  localStorage.clear(); // no data leaks between tests
});

test('returns the initial value when nothing is saved', () => {
  const { result } = renderHook(() => useLocalStorage('theme', 'light'));

  expect(result.current[0]).toBe('light');
  expect(localStorage.getItem('theme')).toBe('"light"'); // saved as JSON by the effect
});

test('reads an existing saved value', () => {
  localStorage.setItem('theme', JSON.stringify('dark'));

  const { result } = renderHook(() => useLocalStorage('theme', 'light'));

  expect(result.current[0]).toBe('dark');
});

test('updates the value and saves it', () => {
  const { result } = renderHook(() => useLocalStorage('cart', []));

  act(() => {
    result.current[1]([{ id: 1, qty: 2 }]); // call the setter
  });

  expect(result.current[0]).toEqual([{ id: 1, qty: 2 }]);
  expect(JSON.parse(localStorage.getItem('cart'))).toEqual([{ id: 1, qty: 2 }]);
});
\`\`\`

**Why it works:** \`renderHook\` renders a test component that calls your hook. \`result.current\` always holds the latest return value. \`act\` makes React finish the state update and run effects before you assert, so the \`localStorage\` check sees the saved value.

**Edge case worth a test:** if \`localStorage\` contains invalid JSON, \`JSON.parse\` throws and the component crashes. A good follow-up is to add a try/catch in the hook and a test for it.`,
      followUps: [
        {
          q: 'How do you test a hook that needs a Context provider?',
          a: 'Pass a wrapper: `renderHook(() => useCart(), { wrapper: ({ children }) => <CartProvider>{children}</CartProvider> })`.',
        },
        {
          q: 'How do you test the hook when the `key` prop changes?',
          a: 'Use `initialProps` and `rerender`: `const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 0), { initialProps: { k: "a" } }); rerender({ k: "b" });`.',
        },
        {
          q: 'Should every custom hook get its own tests?',
          a: 'Reusable hooks shared across the app — yes. A hook used by one component is often better tested through that component.',
        },
      ],
    },
    {
      id: 'flaky-shared-state-order',
      title: 'Debug: tests pass alone but fail together',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'flaky-tests',
      question: `Each test passes when run alone (\`jest -t "name"\`). When the whole file runs, some fail. If someone reorders the tests, **different** ones fail. Find every problem and fix it.

\`\`\`javascript
import { Cart } from './Cart';
import * as analytics from './analytics';

const cart = new Cart();
const track = jest.spyOn(analytics, 'track').mockImplementation(() => {});

test('adds an item', () => {
  cart.add({ id: 1, price: 10 });
  expect(cart.total()).toBe(10);
  expect(track).toHaveBeenCalledTimes(1);
});

test('empty cart has total 0', () => {
  expect(cart.total()).toBe(0);
});

test('applies a 10% coupon', () => {
  cart.add({ id: 2, price: 100 });
  cart.applyCoupon('SAVE10');
  expect(cart.total()).toBe(90);
  expect(track).toHaveBeenCalledTimes(1);
});
\`\`\``,
      hints: [
        'How many `Cart` objects exist in this file? Who changes it?',
        'Does `track` forget its calls between tests?',
        'Each test should build everything it needs in `beforeEach`.',
      ],
      solution: `**Idea:** the tests share **state** (data that stays between tests). One test leaves data behind, and the next test reads it. That is called **order dependence**.

**The problems:**
1. One \`cart\` for the whole file. After "adds an item", the cart is not empty, so "empty cart has total 0" gets 10. The coupon test gets (10 + 100) * 0.9 = 99, not 90.
2. The \`track\` spy keeps counting. In the coupon test it has 2 calls (one from the first test), so \`toHaveBeenCalledTimes(1)\` fails.
3. The spy is never restored, so it can leak to other code that runs later in this file.

**Fix:**

\`\`\`javascript
import { Cart } from './Cart';
import * as analytics from './analytics';

let cart;
let track;

beforeEach(() => {
  cart = new Cart(); // fresh object for every test
  track = jest.spyOn(analytics, 'track').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks(); // remove the spy and its call history
});

test('adds an item', () => {
  cart.add({ id: 1, price: 10 });
  expect(cart.total()).toBe(10);
  expect(track).toHaveBeenCalledTimes(1);
});

test('empty cart has total 0', () => {
  expect(cart.total()).toBe(0);
});

test('applies a 10% coupon', () => {
  cart.add({ id: 2, price: 100 });
  cart.applyCoupon('SAVE10');
  expect(cart.total()).toBe(90);
  expect(track).toHaveBeenCalledTimes(1);
});
\`\`\`

**Why it works:** each test now starts from the same clean state, so the order does not matter. A good rule: a test must pass alone, in any order, and many times in a row.`,
      followUps: [
        {
          q: 'How can you find order-dependent tests automatically?',
          a: 'Run with `jest --randomize` (Jest 29.2+) to shuffle test order, and `--seed=<n>` to repeat a failing order. Also try running one file alone vs the full suite.',
        },
        {
          q: 'What other shared state causes this?',
          a: 'Database rows not cleaned, module-level caches or singletons, `process.env` changes, fake timers not reset, `localStorage`, and mocked modules with return values set in one test.',
        },
      ],
    },
    {
      id: 'over-mocking-passes-prod-fails',
      title: 'Debug: the test is green, but production returns NaN',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'mocks-stubs-spies-fakes',
      question: `Production shows "Total: NaN" for every order. But this test passes. Why did the test not catch it, and how would you change the testing approach?

\`\`\`javascript
// Order model (mongoose)
const orderSchema = new Schema({
  items: [{ name: String, price: Number, quantity: Number }],
});

// orderService.js
export async function getOrderTotal(orderId) {
  const order = await Order.findById(orderId).lean();
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// orderService.test.js
jest.mock('./models/Order', () => ({
  Order: {
    findById: jest.fn().mockReturnValue({
      lean: () => Promise.resolve({ items: [{ price: 10, qty: 2 }] }),
    }),
  },
}));

test('sums the items', async () => {
  expect(await getOrderTotal('o1')).toBe(20);
});
\`\`\``,
      hints: [
        'Compare the field names in the schema, the service, and the mock.',
        'Who wrote the mock data? What was it based on — the real data or the code?',
        'What kind of test would use the real schema?',
      ],
      solution: `**Idea:** the schema calls the field \`quantity\`, but the code uses \`item.qty\`. The mock was written by looking at the **code**, so it has the same mistake. The test only proves the code agrees with itself. In production \`item.qty\` is \`undefined\`, and \`10 * undefined\` is \`NaN\`.

This is **over-mocking**: you mocked your own database layer, so the test never touched the real data shape.

**Fix the bug:**

\`\`\`javascript
return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
\`\`\`

**Fix the test — use the real model with an in-memory database:**

\`\`\`javascript
// orderService.test.js (no jest.mock)
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Order } from './models/Order';
import { getOrderTotal } from './orderService';

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('sums price * quantity', async () => {
  // Saved through the real schema. A field the schema does not know (like "qty")
  // would be dropped, so the data has the real shape.
  const order = await Order.create({
    items: [
      { name: 'Pen', price: 10, quantity: 2 },
      { name: 'Book', price: 5, quantity: 1 },
    ],
  });

  expect(await getOrderTotal(order._id)).toBe(25);
});
\`\`\`

**Why it works:** the data now goes through the real schema, so the test and production see the same field names. With the old code (\`item.qty\`) this test returns \`NaN\` and fails.

**Rule of thumb:** mock things you do not own and cannot run cheaply (Stripe, email, third-party APIs). For your own database code, prefer a real (in-memory or Docker) database. If you must mock, build fake data from shared factories or TypeScript types, not by copying what the code reads.`,
      followUps: [
        {
          q: 'Would TypeScript have caught this?',
          a: 'Yes, if the service used a type generated from (or matching) the schema, `item.qty` would be a compile error. A mock typed as `any` would still hide it.',
        },
        {
          q: 'How do you avoid the same problem with external APIs you must mock?',
          a: 'Use contract tests (for example Pact), or record real responses once and use them as fixtures. Re-check the fixtures when the API version changes.',
        },
      ],
    },
    {
      id: 'legacy-module-what-to-test-first',
      title: 'Scenario: you must change an 800-line module with no tests',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'tdd',
      question: `You have to add a "student discount" to \`pricing.js\`. It is 800 lines, has no tests, and calculates prices for checkout. Nobody fully understands it. The deadline is this sprint.

What do you test first, and how? Walk the interviewer through your steps.`,
      hints: [
        'Before changing anything, how do you know you did not break the current behavior?',
        'Search for "characterization tests" (also called golden master tests).',
        'You do not need to test all 800 lines — focus on the paths your change touches.',
      ],
      solution: `**Idea:** first **lock in the current behavior** with tests, then make the change in small steps. You are not testing that the code is "right" — you are recording what it does today, so you notice if you change it by accident.

**Steps:**
1. **Find the entry point** used by checkout (for example \`calculatePrice(cart, user)\`) and the paths your change touches.
2. **Collect real inputs:** a normal cart, an empty cart, a cart with a coupon, tax regions, a large quantity. Use anonymized production data or logs if possible.
3. **Write characterization tests:** run each input through the current code and save the output as the expected value.
4. **Make the change** (ideally with TDD: write a failing test for the student discount first).
5. **Refactor only what you need**, with the tests as a safety net. Do not rewrite the whole file this sprint.

\`\`\`javascript
// pricing.characterization.test.js
import { calculatePrice } from './pricing';

const regular = { id: 'u1', type: 'regular', country: 'IN' };
const cases = [
  { name: 'single item', cart: [{ sku: 'A', price: 500, qty: 1 }], user: regular },
  { name: 'many items', cart: [{ sku: 'A', price: 500, qty: 3 }, { sku: 'B', price: 99, qty: 1 }], user: regular },
  { name: 'empty cart', cart: [], user: regular },
  { name: 'coupon', cart: [{ sku: 'A', price: 500, qty: 1 }], user: regular, coupon: 'WELCOME10' },
];

// Snapshots are fine HERE: we only want to detect "the output changed".
test.each(cases)('current behavior: $name', ({ cart, user, coupon }) => {
  expect(calculatePrice(cart, user, coupon)).toMatchSnapshot();
});

// New behavior, written first (TDD): fails until the feature exists
test('students get 15% off', () => {
  const student = { ...regular, type: 'student' };
  const result = calculatePrice([{ sku: 'A', price: 1000, qty: 1 }], student);
  expect(result.discount).toBe(150);
});
\`\`\`

**Why it works:** the characterization tests are a cheap safety net. If your change also changes an old output, the snapshot fails and you decide: bug fix or accident? Once the area is understood, replace snapshots with clear assertions.

**Also say:** check coverage for the lines you touched, ask the product owner for the expected numbers of tricky cases, and pair with whoever knows the module best.`,
      followUps: [
        {
          q: 'What if the code is hard to call in a test (it reads the DB and calls APIs inside)?',
          a: 'Find or create a **seam**: a place to swap a dependency. For example, pass the DB/repository as a parameter, or move the pure calculation into its own function and test that. Make the smallest change needed to get it under test.',
        },
        {
          q: 'A characterization test shows a result that looks wrong. What do you do?',
          a: 'Do not silently "fix" it. Write it down, ask the product owner — other systems may depend on that behavior. Fix it in a separate, clearly named change.',
        },
      ],
    },
    {
      id: 'github-actions-tests-coverage',
      title: 'Design: run tests in GitHub Actions with a coverage threshold',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'tests-in-ci',
      question: `Your Node + Express + MongoDB project has Jest tests, but people forget to run them. Set up CI so that every pull request:

- installs dependencies the same way every time,
- runs lint and tests,
- **fails** if coverage drops below 80% lines,
- cannot be merged if the checks fail.

Show the workflow file and the Jest config.`,
      hints: [
        'Use `npm ci` (installs exactly what is in package-lock.json) instead of `npm install`.',
        'Jest has a `coverageThreshold` option. If coverage is lower, Jest exits with an error.',
        'Blocking the merge is a GitHub setting, not part of the YAML: branch protection with required status checks.',
      ],
      solution: `**Idea:** a workflow runs on every PR. Jest itself enforces the coverage number. Branch protection makes the check required.

\`\`\`yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm            # caches ~/.npm between runs

      - run: npm ci             # clean, exact install from package-lock.json
      - run: npm run lint
      - run: npx jest --ci --coverage   # --ci: never write new snapshots
        env:
          JWT_SECRET: test-secret       # fake values only, never real secrets

      - uses: actions/upload-artifact@v4
        if: always()            # upload the report even when tests fail
        with:
          name: coverage-report
          path: coverage/
\`\`\`

\`\`\`javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/server.js'],
  coverageThreshold: {
    global: { lines: 80, statements: 80, functions: 75, branches: 70 },
  },
  restoreMocks: true,
};
\`\`\`

Then in GitHub: **Settings → Branches → branch protection rule for main → Require status checks to pass → select "test"**.

**Why it works:**
- \`npm ci\` fails if \`package.json\` and the lock file do not match, so CI uses the same versions as your laptop.
- \`--ci\` makes missing snapshots fail instead of being silently written.
- The database comes from \`mongodb-memory-server\` inside the tests, so no extra service is needed. (Alternative: a \`services: mongo:\` container in the job.)
- The required check blocks the merge button until the job is green.`,
      followUps: [
        {
          q: 'Is 100% coverage a good goal?',
          a: 'Usually no. Coverage shows which lines **ran**, not whether they were checked. Chasing 100% leads to weak tests of trivial code. Use a reasonable floor and review test quality in PRs.',
        },
        {
          q: 'The test job takes 15 minutes. How do you speed it up?',
          a: 'Cache dependencies, split tests across machines with a matrix and `jest --shard=1/3`, run only affected tests on PRs (`--changedSince=origin/main`) with a full run on main, and cache the mongodb-memory-server binary.',
        },
      ],
    },
    {
      id: 'test-stripe-webhook-handler',
      title: 'Test a Stripe webhook handler (signature + idempotency)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'testing-webhooks-jobs',
      question: `Stripe calls this endpoint after a payment. Write tests that prove:

1. A request with a **bad signature** is rejected with 400.
2. A valid \`checkout.session.completed\` event marks the order as paid.
3. The **same event sent twice** (Stripe retries!) marks the order paid only **once**. This is called **idempotency**.
4. Other event types are accepted (200) but ignored.

\`\`\`javascript
// webhook.js
import express from 'express';
import Stripe from 'stripe';
import { ProcessedEvent } from './models/ProcessedEvent'; // { eventId: String }
import { markOrderPaid } from './orders';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const app = express();

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer, needed to check the signature
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  if (event.type === 'checkout.session.completed') {
    const seen = await ProcessedEvent.findOne({ eventId: event.id });
    if (!seen) {
      await markOrderPaid(event.data.object.metadata.orderId);
      await ProcessedEvent.create({ eventId: event.id });
    }
  }
  res.json({ received: true });
});
\`\`\``,
      hints: [
        'You do not need Stripe servers. The Stripe SDK can create a valid signature header for tests: `stripe.webhooks.generateTestHeaderString({ payload, secret })`.',
        'Send the payload as a **string** so the raw body matches the signed payload exactly.',
        'Mock `markOrderPaid` to count calls; use mongodb-memory-server for `ProcessedEvent` so the duplicate check is real.',
      ],
      solution: `**Idea:** build a fake Stripe event, sign it with a test secret using the SDK's helper, and post it with supertest. Mock only \`markOrderPaid\` (to count calls). Keep the real duplicate check against an in-memory database.

\`\`\`javascript
// webhook.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { markOrderPaid } from './orders';

jest.mock('./orders', () => ({ markOrderPaid: jest.fn().mockResolvedValue(undefined) }));

const SECRET = 'whsec_test_secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';   // set before the app module loads
process.env.STRIPE_WEBHOOK_SECRET = SECRET;
const { app } = require('./webhook');              // require AFTER the env is set
const stripe = new Stripe('sk_test_fake');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
  jest.clearAllMocks();
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// helper: build + sign + send an event
function sendEvent(event, { secret = SECRET } = {}) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return request(app)
    .post('/webhooks/stripe')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', header)
    .send(payload); // a string is sent as-is (raw)
}

const paidEvent = {
  id: 'evt_123',
  type: 'checkout.session.completed',
  data: { object: { metadata: { orderId: 'order_1' } } },
};

test('400 when the signature is wrong', async () => {
  const res = await sendEvent(paidEvent, { secret: 'whsec_wrong' });
  expect(res.status).toBe(400);
  expect(markOrderPaid).not.toHaveBeenCalled();
});

test('marks the order as paid', async () => {
  const res = await sendEvent(paidEvent);
  expect(res.status).toBe(200);
  expect(markOrderPaid).toHaveBeenCalledWith('order_1');
});

test('the same event twice is processed only once', async () => {
  await sendEvent(paidEvent);
  const second = await sendEvent(paidEvent); // Stripe retry

  expect(second.status).toBe(200);           // still 200, so Stripe stops retrying
  expect(markOrderPaid).toHaveBeenCalledTimes(1);
});

test('ignores other event types', async () => {
  const res = await sendEvent({ ...paidEvent, id: 'evt_9', type: 'customer.created' });
  expect(res.status).toBe(200);
  expect(markOrderPaid).not.toHaveBeenCalled();
});
\`\`\`

**Why it works:**
- \`generateTestHeaderString\` creates the same kind of \`stripe-signature\` header Stripe sends, so the **real** \`constructEvent\` check runs. No mocking of security code.
- The handler reads the env and creates the Stripe client when the module loads. That is why the env is set first and the app is loaded with \`require\` afterwards (\`jest.mock\` is hoisted, but plain assignments are not).
- The duplicate test proves Stripe retries are safe.

**A bug the tests reveal on review:** if two copies of the same event arrive **at the same time**, both can pass \`findOne\` before either \`create\` runs. Fix: a **unique index** on \`eventId\`, and insert first (treat a duplicate-key error as "already processed").`,
      followUps: [
        {
          q: 'Why must the body be raw (not parsed by express.json)?',
          a: 'The signature is computed over the exact bytes Stripe sent. If JSON is parsed and re-stringified, spacing or key order can change and the signature check fails.',
        },
        {
          q: 'How would you test this end-to-end in development?',
          a: 'Use the Stripe CLI: `stripe listen --forward-to localhost:3000/webhooks/stripe` and `stripe trigger checkout.session.completed`. That uses real Stripe test-mode events.',
        },
        {
          q: 'markOrderPaid succeeds but ProcessedEvent.create fails. What happens?',
          a: 'The handler returns 500, Stripe retries, and markOrderPaid runs again. So markOrderPaid itself should be idempotent (for example `updateOne({ _id, status: "pending" }, { status: "paid" })`), or both writes should be in a transaction.',
        },
      ],
    },
    {
      id: 'test-retry-backoff-async-timers',
      title: 'Test retry with exponential backoff (fake timers + promises)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'jest-async-tests',
      question: `Test this helper **without** real waiting. Prove that it waits 100 ms, then 200 ms between tries, succeeds when a later try works, and rejects after the last try fails.

\`\`\`javascript
// retry.js
export async function retry(fn, { retries = 3, baseDelay = 100 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;           // no tries left
      const delay = baseDelay * 2 ** attempt;      // 100, 200, 400...
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
\`\`\`

A teammate tried \`jest.advanceTimersByTime(100)\` and \`fn\` was never called a second time. Explain why, too.`,
      hints: [
        'The `setTimeout` is created only **after** a promise rejects — that is a microtask (a small job that runs after the current code finishes). Has it run yet when you advance the clock?',
        'Jest 29.5+ has `await jest.advanceTimersByTimeAsync(ms)`, which lets promise callbacks run between timer steps.',
        'For the "all fail" case, attach the `.rejects` assertion **before** advancing timers, or Node may report an unhandled rejection.',
      ],
      solution: `**Idea:** use fake timers and the **async** timer functions. They move the clock **and** let pending promise callbacks run, so each new \`setTimeout\` gets created in time.

**Why the sync version failed:** \`fn()\` rejects, but the \`catch\` block (and so the \`setTimeout\`) runs in a microtask. \`jest.advanceTimersByTime(100)\` runs right away, synchronously, before that microtask. At that moment there is no timer to fire.

\`\`\`javascript
// retry.test.js
import { retry } from './retry';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('waits 100ms then 200ms and returns the first success', async () => {
  const fn = jest.fn()
    .mockRejectedValueOnce(new Error('fail 1'))
    .mockRejectedValueOnce(new Error('fail 2'))
    .mockResolvedValue('ok');

  const promise = retry(fn, { retries: 3, baseDelay: 100 });
  expect(fn).toHaveBeenCalledTimes(1);          // first try is immediate

  await jest.advanceTimersByTimeAsync(99);
  expect(fn).toHaveBeenCalledTimes(1);          // not yet: 1 ms early
  await jest.advanceTimersByTimeAsync(1);
  expect(fn).toHaveBeenCalledTimes(2);          // after 100 ms

  await jest.advanceTimersByTimeAsync(199);
  expect(fn).toHaveBeenCalledTimes(2);
  await jest.advanceTimersByTimeAsync(1);
  expect(fn).toHaveBeenCalledTimes(3);          // after 200 more ms

  await expect(promise).resolves.toBe('ok');
});

test('rejects with the last error when every try fails', async () => {
  const fn = jest.fn().mockRejectedValue(new Error('down'));

  const promise = retry(fn, { retries: 2, baseDelay: 100 });
  // Attach the assertion FIRST so the rejection is always handled
  const assertion = expect(promise).rejects.toThrow('down');

  await jest.runAllTimersAsync();               // run 100 ms + 200 ms waits
  await assertion;

  expect(fn).toHaveBeenCalledTimes(3);          // 1 try + 2 retries
});
\`\`\`

**Why it works:** \`advanceTimersByTimeAsync\` gives the promise queue a chance to run before and after each timer, which matches how the real event loop works. Checking 99 ms vs 100 ms proves the exact delays. Attaching \`.rejects\` before running the timers means the promise has a handler at the moment it rejects.`,
      followUps: [
        {
          q: 'What would you change in `retry` for production use?',
          a: 'Add **jitter** (a random part of the delay) so many clients do not retry at the same moment, a max delay cap, and a `shouldRetry(err)` check so you do not retry errors like 400 Bad Request.',
        },
        {
          q: 'How would you test the jitter if it uses Math.random?',
          a: 'Spy on `Math.random` and return a fixed value, or (better) pass a `random` function as an option so the test can inject it.',
        },
      ],
    },
    {
      id: 'flaky-ci-sleep-ports-open-handles',
      title: 'Debug: tests are flaky only in CI and Jest "did not exit"',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'flaky-tests',
      question: `Locally all tests pass. In CI about 1 run in 5 fails, and Jest prints:

\`\`\`text
Jest did not exit one second after the test run has completed.
\`\`\`

Here is a typical test file. List every cause of flakiness or hanging, and fix them.

\`\`\`javascript
// orders.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';
import { emailQueue } from '../src/queue'; // starts a Redis connection on import

let server;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  server = app.listen(3000);
});

test('creating an order sends a confirmation email (in the background)', async () => {
  const res = await request('http://localhost:3000').post('/orders').send({ sku: 'A', qty: 1 });
  expect(res.status).toBe(201);

  await new Promise((r) => setTimeout(r, 500)); // wait for the background job
  const sent = await getSentEmails();
  expect(sent).toHaveLength(1);
});
\`\`\``,
      hints: [
        'Jest runs test **files** in parallel. What happens if two files call `app.listen(3000)`?',
        'Is 500 ms always enough on a slow, shared CI machine?',
        '"Did not exit" means something is still open: a server, a DB connection, a Redis connection, a timer. Try `jest --detectOpenHandles`.',
      ],
      solution: `**Idea:** the tests depend on **timing** and **shared resources**, and they never clean up. CI machines are slower and run files in parallel, so the problems show up there first.

**Causes:**
1. **Fixed port 3000.** Two test files in parallel workers try to use the same port → \`EADDRINUSE\`, random failures.
2. **\`sleep(500)\`.** On a slow CI runner the job may need 700 ms → fails. On a fast laptop it passes.
3. **Shared real database** (\`MONGO_URL\`). Parallel files read and write the same data.
4. **Nothing is closed:** the HTTP server, the mongoose connection and the Redis connection keep Node alive → "Jest did not exit".

**Fix:**

\`\`\`javascript
// orders.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { emailQueue } from '../src/queue';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();  // own DB per test file
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await emailQueue.close();                  // close Redis connection
  await mongoose.disconnect();
  await mongo.stop();
});

// Poll until the condition is true, with a time limit (instead of a fixed sleep)
async function waitFor(check, { timeout = 5000, interval = 50 } = {}) {
  const start = Date.now();
  for (;;) {
    try {
      return await check();
    } catch (err) {
      if (Date.now() - start > timeout) throw err;
      await new Promise((r) => setTimeout(r, interval));
    }
  }
}

test('creating an order sends a confirmation email', async () => {
  // request(app) -> supertest picks a free random port and closes it after
  const res = await request(app).post('/orders').send({ sku: 'A', qty: 1 });
  expect(res.status).toBe(201);

  await waitFor(async () => {
    const sent = await getSentEmails();
    expect(sent).toHaveLength(1);           // retried until it passes or 5s pass
  });
});
\`\`\`

**Why it works:**
- \`request(app)\` uses a random free port, so parallel files never clash.
- \`waitFor\` checks again and again: fast when the job is fast, patient when CI is slow, and it still fails clearly after the timeout.
- Each file has its own in-memory database.
- Closing every connection in \`afterAll\` lets Jest exit. \`--detectOpenHandles\` shows what is still open if it happens again.

**Even better for unit-level tests:** do not run the real queue at all. Test that the route **adds** a job, and test the job handler separately by calling it directly.`,
      followUps: [
        {
          q: 'Why not just add `--forceExit`?',
          a: 'It hides the leak instead of fixing it. Open connections can also make tests affect each other and slow down CI. Use it only as a last resort, after `--detectOpenHandles`.',
        },
        {
          q: 'How do you find flaky tests across many CI runs?',
          a: 'Track failures per test over time (many CI tools show "flaky" tests), re-run a suspect test many times locally (`for i in $(seq 50); do npx jest orders || break; done`), and run with `--randomize` to expose order dependence.',
        },
        {
          q: 'Should you add automatic retries for flaky tests?',
          a: 'Only as a short-term bandage (`jest.retryTimes(2)` with jest-circus). Log every retry and fix the cause; otherwise real bugs that fail "sometimes" get hidden.',
        },
      ],
    },
  ],
};
