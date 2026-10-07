// Testing & Quality — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'testing',
  title: 'Testing & Quality',
  icon: '🧪',
  description: 'How to prove your code works and keep it working: Jest, React Testing Library, API tests, mocks, E2E, CI, code review and production monitoring.',
  definitionTitle: 'What is software testing?',
  definition: `**Software testing** means writing code (or running checks) that **proves your code works** and keeps working after changes.

- **Unit tests** check one small function.
- **Integration tests** check parts working together, like an API plus its database.
- **E2E (end-to-end) tests** click through the real app like a user.

Tools include **Jest** and **React Testing Library** for unit tests, **supertest** and **Postman** for APIs, and **Cypress** or **Playwright** for E2E. Quality also covers code reviews, logging and monitoring.

**One-line answer:** "Testing is automatically verifying that code behaves correctly — through unit, integration and end-to-end tests — so we catch bugs early and can change code with confidence."`,
  topics: [
    {
      id: 'test-pyramid-trophy',
      title: 'Test Pyramid and Testing Trophy',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Many fast unit tests, fewer integration tests, very few slow E2E tests. The trophy says: put most effort into integration tests.',
      what: `There are three main kinds of automated tests:

- **Unit test** — tests one small piece (one function, one component) alone.
- **Integration test** — tests several pieces working together (an API route + the database, a form + its validation).
- **E2E (end-to-end) test** — tests the whole app like a real user, in a real browser, from login to checkout.

The **test pyramid** says: write **many** unit tests at the bottom, **some** integration tests in the middle, and **few** E2E tests at the top. Lower tests are fast and cheap. Higher tests are slow but give more confidence.

#### Deeper version
The **testing trophy** (an idea made popular by Kent C. Dodds) changes the shape for modern web apps:

1. **Static** checks at the base — TypeScript and ESLint catch typos and type bugs for free.
2. **Unit** tests — for pure logic (price calculation, date helpers).
3. **Integration** tests — the biggest part. They test how users and code really use your units together.
4. **E2E** — a few, for the most important flows.

The main idea of both shapes is the same: **balance cost and confidence**. A test is valuable when it would fail if a real user would see a bug, and pass when the code is fine. Tests that check internal details break on every refactor and give little confidence.`,
      why: `Without a plan, teams end up with an "ice-cream cone": lots of slow, flaky E2E tests and manual testing, and almost no unit tests. The suite takes 40 minutes and fails randomly. The pyramid and trophy help you put each check at the **cheapest level** that still catches the bug.`,
      analogy: `Think of building a car. You test each bolt and part on its own (unit). Then you test the engine with the gearbox (integration). Finally a driver takes the full car on the road (E2E). You do not road-test the car just to check one bolt — that would be slow and expensive.`,
      code: [
        {
          title: 'Same feature, three levels',
          lang: 'javascript',
          code: `// UNIT: a pure function, no network, no DB. Runs in milliseconds.
import { calcTotal } from './cart.js';
test('calcTotal adds 18% tax', () => {
  expect(calcTotal([{ price: 100, qty: 2 }], 0.18)).toBe(236);
});

// INTEGRATION: real Express app + in-memory DB, called over HTTP with supertest.
import request from 'supertest';
import app from './app.js';
test('POST /cart/items saves an item', async () => {
  const res = await request(app).post('/cart/items').send({ sku: 'A1', qty: 1 });
  expect(res.status).toBe(201);
});

// E2E: a real browser clicks through the real UI (Playwright).
// test('user can checkout', async ({ page }) => {
//   await page.goto('/');
//   await page.getByRole('button', { name: 'Add to cart' }).click();
//   await page.getByRole('link', { name: 'Checkout' }).click();
//   await expect(page.getByText('Order placed')).toBeVisible();
// });`,
        },
      ],
      output: `The unit test checks only the math. It runs in a few milliseconds and tells you exactly which function is broken. The integration test checks that the route, validation and database work together — slower, but closer to reality. The E2E test (commented here because it needs a running app and a browser) proves the full checkout works for a user, but it takes seconds and can break for many reasons.

A healthy suite has many of the first kind, a good number of the second, and only a handful of the third.`,
      questions: [
        {
          q: 'What is the test pyramid?',
          a: 'A guideline for how many tests of each type to write: many fast unit tests at the bottom, fewer integration tests in the middle, and very few slow E2E tests at the top.',
        },
        {
          q: 'What is the testing trophy and how is it different?',
          a: 'It adds static analysis (TypeScript, ESLint) at the base and makes integration tests the largest part. The idea is that integration tests give the best confidence for the cost in modern web apps.',
        },
        {
          q: 'Why not only write E2E tests? They test everything.',
          a: 'They are slow, expensive to maintain, and flaky. When one fails, it is hard to know which part broke. You use a few for critical flows and cover details at lower levels.',
        },
        {
          q: 'How do you decide what level to test something at?',
          a: 'Pick the lowest, cheapest level that would still catch the bug. Pure logic goes in unit tests, API + DB behaviour in integration tests, and only critical user journeys (login, payment) in E2E.',
        },
      ],
      spoken: `"The test pyramid says we should have many fast unit tests, a smaller number of integration tests, and only a few end-to-end tests, because higher tests are slower and more fragile. For modern web apps I like the testing trophy idea: TypeScript and ESLint as a free base, unit tests for pure logic, and most of my effort in integration tests, like supertest against an Express app with an in-memory Mongo, or React Testing Library tests of a full form. Then I keep a few Playwright tests for critical flows like login and Stripe checkout."`,
      mistakes: [
        'Building an "ice-cream cone": many manual and E2E tests, few unit tests. The suite becomes slow and flaky.',
        'Writing unit tests that check internal details (private state, exact function calls). They break on every refactor and catch few real bugs.',
        'Chasing a number of tests instead of confidence. Ten good integration tests can be worth more than a hundred shallow unit tests.',
        'Follow-up trap: "So is the pyramid wrong?" No. Both shapes share one idea: put each check at the cheapest level that still gives confidence. The trophy is just tuned for UI-heavy apps.',
      ],
      takeaway: 'Many cheap tests, few expensive ones — and always test what the user or caller actually sees.',
    },
    {
      id: 'test-structure-aaa',
      title: 'Writing Good Tests: AAA, Naming and Setup/Teardown',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Arrange, Act, Assert. One behaviour per test, clear names, and fresh state for every test using beforeEach/afterEach.',
      what: `A good test is short and easy to read. Most good tests follow **AAA**:

1. **Arrange** — set up the data and objects you need.
2. **Act** — do the one thing you are testing.
3. **Assert** — check the result.

Jest gives you **hooks** to share setup:
- \`beforeAll\` / \`afterAll\` — run once for the whole file (for example, connect to a test DB).
- \`beforeEach\` / \`afterEach\` — run before/after **every** test (for example, clear the DB, reset mocks).

\`describe\` groups related tests. \`test\` (or its alias \`it\`) is one test case.

#### Deeper version
Good tests are **isolated**: each test creates its own data and does not depend on the order of other tests. If test B only passes because test A ran first, your suite will break when tests run in parallel or in a different order.

Test **behaviour, not implementation**. Name tests as sentences about behaviour: "returns 404 when the user does not exist" is better than "test getUser 2". A good name tells you what broke without reading the code.`,
      why: `Tests are code too, and you read them far more often than you write them. When a test fails at 2 a.m. in CI, a clear name and a simple AAA body tell you in seconds what broke. Shared hidden state between tests is one of the biggest causes of random failures.`,
      analogy: `A test is like a science experiment. Arrange = prepare the lab with clean equipment. Act = do the experiment once. Assert = write down if the result matches what you expected. And you clean the lab (teardown) before the next experiment, so old chemicals do not mess up the next result.`,
      code: [
        {
          title: 'AAA with describe and hooks',
          lang: 'javascript',
          code: `// cart.js
export class Cart {
  items = [];
  add(item) { this.items.push(item); }
  total() { return this.items.reduce((sum, i) => sum + i.price * i.qty, 0); }
}

// cart.test.js
import { Cart } from './cart.js';

describe('Cart', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart(); // fresh cart for EVERY test -> no shared state
  });

  test('total is 0 for an empty cart', () => {
    expect(cart.total()).toBe(0);
  });

  test('total multiplies price by quantity', () => {
    // Arrange
    cart.add({ price: 50, qty: 2 });
    cart.add({ price: 10, qty: 1 });
    // Act
    const total = cart.total();
    // Assert
    expect(total).toBe(110);
  });
});`,
        },
      ],
      output: `Jest prints something like:

- Cart
  - ✓ total is 0 for an empty cart
  - ✓ total multiplies price by quantity

Because \`beforeEach\` makes a new \`Cart\` before each test, the second test does not see items from any other test. You could run them in any order and both would pass.`,
      questions: [
        {
          q: 'What is the AAA pattern?',
          a: 'Arrange, Act, Assert. Set up the data, perform the action under test, then check the result. It keeps every test short and readable.',
        },
        {
          q: 'What is the difference between beforeAll and beforeEach?',
          a: '`beforeAll` runs once before all tests in the file or `describe` block. `beforeEach` runs before every single test. Use `beforeAll` for expensive setup like starting a DB, and `beforeEach` to reset state.',
        },
        {
          q: 'What makes a test "isolated"?',
          a: 'It creates its own data, does not depend on other tests running first, and cleans up after itself. It passes alone and in any order.',
        },
        {
          q: 'Should a test have only one assertion?',
          a: 'Not strictly. It should test one behaviour. Several `expect` calls are fine if they all check the same behaviour, like status code and body of one response.',
        },
      ],
      spoken: `"I structure tests with Arrange, Act, Assert: set up the data, do one action, check the result. I name tests as sentences about behaviour, like 'returns 404 when the user does not exist', so a failure explains itself. I keep tests isolated: I use beforeEach to create fresh data and reset mocks, and afterAll to close connections like a test database. Every test should pass alone and in any order. I also try to test behaviour, not implementation details, so refactoring the code does not break the tests."`,
      mistakes: [
        'Sharing one mutable object between tests without resetting it. Tests pass alone but fail together.',
        'Testing many behaviours in one long test. When it fails, you do not know which behaviour broke.',
        'Forgetting teardown (closing DB connections, servers). Jest then warns "did not exit one second after the test run" or hangs.',
        'Follow-up trap: "What is `test.only` and `test.skip`?" `only` runs just that test, `skip` skips it. Never commit `.only` — it silently skips the rest of the suite in CI.',
      ],
      takeaway: 'One behaviour per test, AAA inside, fresh state every time — then failures explain themselves.',
    },
    {
      id: 'jest-basics-matchers',
      title: 'Jest Basics: Unit Tests and Matchers',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Jest is a test runner plus an assertion library. You write test() blocks and check results with expect(value).matcher().',
      what: `**Jest** is a popular JavaScript testing framework. It does three jobs in one tool:

- **Runner** — finds files like \`*.test.js\` and runs them.
- **Assertions** — \`expect(value).toBe(5)\` checks a result.
- **Mocking** — fake functions and modules (covered in the next topics).

A **matcher** is the method after \`expect\`. Common ones:
- \`toBe\` — exact equality (uses \`Object.is\`), for numbers, strings, booleans.
- \`toEqual\` — deep equality for objects and arrays.
- \`toStrictEqual\` — like \`toEqual\` but also checks \`undefined\` properties and class types.
- \`toBeTruthy\`, \`toBeNull\`, \`toBeUndefined\`, \`toBeDefined\`.
- \`toContain\` (array item / substring), \`toMatch\` (regex), \`toHaveLength\`, \`toHaveProperty\`.
- \`toThrow\` — the function throws.
- \`.not\` flips any matcher: \`expect(x).not.toBe(0)\`.

#### Deeper version
Jest runs each test **file** in its own isolated environment (a separate module registry), and runs files in **parallel** using worker processes. Tests inside one file run in order.

The \`testEnvironment\` setting decides what globals exist: \`node\` for backend code, \`jsdom\` for React code that needs \`document\` and \`window\`. Since Jest 27 the default is \`node\`, so React tests must set \`jsdom\` (and install \`jest-environment-jsdom\` on newer versions).

For floating-point math use \`toBeCloseTo\` because \`0.1 + 0.2\` is not exactly \`0.3\`. For partial checks use \`expect.objectContaining\`, \`expect.any(String)\` and \`expect.arrayContaining\`.

**Vitest** has an almost identical API and is common in Vite projects; most Jest knowledge transfers directly.`,
      why: `Manual testing does not scale. Every time you change code, you would need to click through the app again. Unit tests check your logic in milliseconds, on every save and every pull request, and act as living documentation of how a function should behave.`,
      analogy: `\`expect\` is like a quality inspector on a factory line. Each matcher is a different checklist: "is it exactly 5?" (\`toBe\`), "does it look the same as the sample?" (\`toEqual\`), "does it contain a screw?" (\`toContain\`). If the check fails, the inspector stops the line and tells you exactly what was wrong.`,
      code: [
        {
          title: 'Common matchers',
          lang: 'javascript',
          code: `// utils.js
export const slugify = (s) => s.trim().toLowerCase().split(' ').join('-');
export const makeUser = (name) => ({ name, role: 'user', createdAt: new Date() });
export function divide(a, b) {
  if (b === 0) throw new Error('Cannot divide by zero');
  return a / b;
}

// utils.test.js
import { slugify, makeUser, divide } from './utils.js';

test('slugify makes URL-friendly text', () => {
  expect(slugify(' Hello World ')).toBe('hello-world');
});

test('makeUser returns a user object', () => {
  const user = makeUser('Asha');
  expect(user).toEqual({ name: 'Asha', role: 'user', createdAt: expect.any(Date) });
  expect(user).toHaveProperty('role', 'user');
});

test('objects need toEqual, not toBe', () => {
  expect({ a: 1 }).toEqual({ a: 1 });   // passes: same shape
  expect({ a: 1 }).not.toBe({ a: 1 });  // different references
});

test('divide throws on zero', () => {
  expect(() => divide(1, 0)).toThrow('Cannot divide by zero'); // wrap in a function!
});

test('floating point', () => {
  expect(0.1 + 0.2).toBeCloseTo(0.3);
});`,
        },
        {
          title: 'Run Jest',
          lang: 'bash',
          code: `npx jest                 # run all tests
npx jest utils           # run files matching "utils"
npx jest --watch         # re-run on file change
npx jest -t "slugify"    # run tests whose name matches`,
        },
      ],
      output: `All five tests pass. Key points:

- \`toBe\` works for the string because strings compare by value.
- \`toEqual\` compares the object shape. \`expect.any(Date)\` says "any Date is fine", so the changing timestamp does not break the test.
- \`{ a: 1 }\` is \`toEqual\` to another \`{ a: 1 }\` but **not** \`toBe\`, because they are two different objects in memory.
- For \`toThrow\` we pass a **function** \`() => divide(1, 0)\`. If we called \`divide(1, 0)\` directly, the error would be thrown before \`expect\` could catch it, and the test would crash.`,
      questions: [
        {
          q: 'What is the difference between toBe and toEqual?',
          a: '`toBe` checks exact identity with `Object.is` — good for primitives. `toEqual` recursively compares values, so two different objects with the same shape are equal.',
        },
        {
          q: 'How do you test that a function throws?',
          a: 'Wrap the call in a function: `expect(() => fn()).toThrow(\'message\')`. For async functions use `await expect(fn()).rejects.toThrow()`.',
        },
        {
          q: 'What is the difference between toEqual and toStrictEqual?',
          a: '`toStrictEqual` also fails if one object has a key with value `undefined` that the other does not have, and it checks that class instances have the same type. `toEqual` ignores those.',
        },
        {
          q: 'How does Jest find test files?',
          a: 'By default it looks for files ending in `.test.js` / `.spec.js` (and ts/jsx/tsx) or files inside `__tests__` folders. You can change this with `testMatch` in the config.',
        },
      ],
      spoken: `"Jest is a test runner, assertion library and mocking tool in one. I write test blocks, group them with describe, and check results with expect and a matcher. The ones I use most are toBe for primitives, toEqual for objects and arrays, toHaveProperty, toContain, and toThrow — where I must wrap the call in a function. For values that change, like dates or IDs, I use asymmetric matchers like expect.any(Date). Jest runs each file in isolation and in parallel, and I set the environment to jsdom for React tests and node for backend tests."`,
      mistakes: [
        'Using `toBe` to compare objects or arrays. It checks the reference, so it fails even when contents match. Use `toEqual`.',
        'Writing `expect(divide(1, 0)).toThrow()`. The error is thrown before `expect` runs. Wrap it: `expect(() => divide(1, 0)).toThrow()`.',
        'Comparing floats with `toBe` (`0.1 + 0.2`). Use `toBeCloseTo`.',
        'Follow-up trap: "Does `toEqual` care about `undefined` properties?" No — `{ a: 1, b: undefined }` equals `{ a: 1 }`. Use `toStrictEqual` if that matters.',
      ],
      takeaway: 'Jest = runner + expect + mocks; use toBe for primitives, toEqual for objects, and wrap throwing calls in a function.',
    },
    {
      id: 'jest-async-tests',
      title: 'Testing Async Code in Jest',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Make the test async and await the promise, or use resolves/rejects. Otherwise Jest finishes before your code does.',
      what: `Most backend code is **async**: it waits for a database, an API or a timer. A test must **wait** for that work to finish before it checks the result.

The simple rule: make the test function \`async\` and use \`await\`.

\`\`\`js
test('gets user', async () => {
  const user = await getUser(1);
  expect(user.name).toBe('Asha');
});
\`\`\`

Other ways:
- \`await expect(promise).resolves.toEqual(...)\`
- \`await expect(promise).rejects.toThrow(...)\`
- Return the promise from the test (older style).

#### Deeper version
If you forget \`await\` or \`return\`, Jest sees the test function finish synchronously and marks it **passed**, even if the promise later rejects. This is a "false positive" — the most dangerous kind of test bug.

\`expect.assertions(n)\` tells Jest "this test must run exactly n assertions". It protects tests where the \`expect\` is inside a \`catch\` block that might never run.

For timers (\`setTimeout\`, debounce, retries) use **fake timers**: \`jest.useFakeTimers()\` and then \`jest.advanceTimersByTime(ms)\` so the test does not really wait. The default timeout per test is 5 seconds; you can change it with a third argument to \`test\` or \`jest.setTimeout\`.`,
      why: `Async bugs are very common in Node and React apps: missing \`await\`, unhandled rejections, wrong error handling. If your tests do not wait correctly, they pass while the code is broken, which is worse than having no test because it gives false confidence.`,
      analogy: `It is like ordering food and checking the plate. If you check the table the moment you order (no \`await\`), the plate is empty — but a lazy inspector writes "all good" anyway. \`await\` means "wait until the food actually arrives, then inspect it".`,
      code: [
        {
          title: 'async/await, resolves and rejects',
          lang: 'javascript',
          code: `// userService.js
const users = { 1: { id: 1, name: 'Asha' } };
export async function getUser(id) {
  await new Promise((r) => setTimeout(r, 10)); // pretend DB delay
  if (!users[id]) throw new Error('User not found');
  return users[id];
}

// userService.test.js
import { getUser } from './userService.js';

test('returns the user', async () => {
  const user = await getUser(1);
  expect(user.name).toBe('Asha');
});

test('resolves style', async () => {
  await expect(getUser(1)).resolves.toEqual({ id: 1, name: 'Asha' });
});

test('throws for unknown id', async () => {
  await expect(getUser(99)).rejects.toThrow('User not found');
});

test('try/catch style needs expect.assertions', async () => {
  expect.assertions(1); // fails if the catch block never runs
  try {
    await getUser(99);
  } catch (err) {
    expect(err.message).toBe('User not found');
  }
});`,
        },
        {
          title: 'Fake timers for a debounce',
          lang: 'javascript',
          code: `function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

test('debounce calls once after the delay', () => {
  jest.useFakeTimers();
  const fn = jest.fn();
  const debounced = debounce(fn, 300);

  debounced('a');
  debounced('b');
  expect(fn).not.toHaveBeenCalled();

  jest.advanceTimersByTime(300);       // no real waiting
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith('b');
  jest.useRealTimers();
});`,
        },
      ],
      output: `All tests pass. \`await\` makes Jest wait for the 10 ms fake DB delay. The \`rejects\` test passes because \`getUser(99)\` throws "User not found".

In the try/catch test, \`expect.assertions(1)\` is a safety net: if someone changes \`getUser\` so it no longer throws, the catch block never runs, zero assertions happen, and Jest fails the test instead of silently passing.

In the timer test, the two quick calls are merged. After moving the fake clock forward 300 ms, \`fn\` was called **once** with the **last** argument \`'b'\` — and the test took almost no real time.`,
      questions: [
        {
          q: 'How do you test async code in Jest?',
          a: 'Make the test `async` and `await` the result, or use `await expect(promise).resolves` / `.rejects`. Jest then waits for the promise before finishing the test.',
        },
        {
          q: 'What happens if you forget await in an async test?',
          a: 'The test function finishes before the promise settles, so Jest may mark it as passed even if the promise rejects later. It is a false positive.',
        },
        {
          q: 'What is expect.assertions used for?',
          a: 'It makes sure a given number of assertions ran. It is useful when `expect` is inside a `catch` or callback that might never execute.',
        },
        {
          q: 'How do you test code that uses setTimeout?',
          a: 'Use `jest.useFakeTimers()`, trigger the code, then `jest.advanceTimersByTime(ms)` or `jest.runAllTimers()`. Restore with `jest.useRealTimers()`.',
        },
      ],
      spoken: `"For async code I make the test function async and await the call, or use expect with resolves or rejects — and I always await those too. If I forget, Jest can finish the test before the promise rejects and report a false pass, which is the worst kind of bug. When I test errors with try and catch, I add expect.assertions so the test fails if the catch never runs. For timers, like a debounce or retry with backoff, I use Jest fake timers and advanceTimersByTime, so the test is fast and does not depend on real time."`,
      mistakes: [
        'Writing `expect(promise).rejects.toThrow()` without `await`. The assertion runs too late and the test passes anyway.',
        'Using real `setTimeout` waits in tests. They slow the suite and cause flaky results. Use fake timers.',
        'Mixing the `done` callback with `async` functions. Pick one style; modern code uses async/await.',
        'Follow-up trap: "Fake timers and promises together hang — why?" A promise callback runs as a microtask, not a timer. You may need `await jest.advanceTimersByTimeAsync(ms)` (available in newer Jest versions) or flush promises between timer steps.',
      ],
      takeaway: 'Always await async work in tests — a missing await turns a failing test into a fake pass.',
    },
    {
      id: 'react-testing-library',
      title: 'React Testing Library Basics (queries by role, user-event)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Render a component, find elements the way a user would (by role and label), interact with user-event, and assert on what is on screen.',
      what: `**React Testing Library (RTL)** helps you test React components the way a **user** uses them. You do not check state or props. You check what is **on the screen**.

The basic steps:
1. \`render(<Component />)\` — put the component into a fake DOM (jsdom).
2. Find elements with \`screen\` queries, best first:
   - \`getByRole('button', { name: 'Save' })\` — by accessibility role and visible name.
   - \`getByLabelText('Email')\` — form fields by their label.
   - \`getByText('Welcome')\` — plain text.
   - \`getByTestId('cart-count')\` — last option, when nothing else works.
3. Interact with \`@testing-library/user-event\`: \`await user.click(button)\`, \`await user.type(input, 'hi')\`.
4. Assert with matchers from \`@testing-library/jest-dom\`: \`toBeInTheDocument()\`, \`toBeDisabled()\`, \`toHaveValue()\`.

#### Deeper version
There are three query families:
- \`getBy...\` — returns the element or **throws** if not found. Use for things that must be there now.
- \`queryBy...\` — returns \`null\` if not found. Use to assert something is **not** there.
- \`findBy...\` — returns a **promise**, retries until the element appears (default about 1 second). Use for async UI, like data loaded from an API.

Each has an \`...AllBy...\` version for many elements.

**user-event vs fireEvent:** \`fireEvent.click\` dispatches one DOM event. \`user-event\` simulates the full real interaction (focus, pointer down/up, keydown, input, click), so it catches more bugs. In user-event v14, calls are async — create a session with \`userEvent.setup()\` and \`await\` each action.

Querying by role also pushes you toward **accessible** HTML: if \`getByRole('button')\` cannot find your button, a screen reader probably cannot either.`,
      why: `Tests that check internal state (like Enzyme's \`wrapper.state()\`) break when you refactor, for example from class to hooks or from useState to useReducer, even if the UI still works. RTL tests break only when the **user experience** breaks, so you can refactor with confidence.`,
      analogy: `RTL tests like a real customer in a shop. The customer does not open the cash register to check the code inside. They look for the "Pay" button, press it, and check that a receipt appears. If the shop changes its back-office software but the customer still gets a receipt, the test still passes.`,
      code: [
        {
          title: 'Testing a login form',
          lang: 'jsx',
          code: `// LoginForm.jsx
import { useState } from 'react';
export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return setError('Enter a valid email');
    onLogin(email);
  };
  return (
    <form onSubmit={submit}>
      <label htmlFor="email">Email</label>
      <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Log in</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

// LoginForm.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

test('shows an error for an invalid email', async () => {
  const user = userEvent.setup();
  render(<LoginForm onLogin={jest.fn()} />);

  await user.type(screen.getByLabelText('Email'), 'asha');
  await user.click(screen.getByRole('button', { name: 'Log in' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
});

test('calls onLogin with the email', async () => {
  const user = userEvent.setup();
  const onLogin = jest.fn();
  render(<LoginForm onLogin={onLogin} />);

  await user.type(screen.getByLabelText('Email'), 'asha@test.com');
  await user.click(screen.getByRole('button', { name: /log in/i }));

  expect(onLogin).toHaveBeenCalledWith('asha@test.com');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});`,
        },
        {
          title: 'Async UI with findBy',
          lang: 'jsx',
          code: `// UserName fetches /api/me and shows the name
test('shows the user name after loading', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ name: 'Asha' }),
  });
  render(<UserName />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  // findBy waits and retries until the text appears
  expect(await screen.findByText('Asha')).toBeInTheDocument();
});`,
        },
      ],
      output: `First test: the user types "asha" (no @) and clicks "Log in". The component sets an error, and the paragraph with \`role="alert"\` shows "Enter a valid email". The test finds it by role, like a screen reader would.

Second test: with a valid email, \`onLogin\` (a Jest mock) is called with \`'asha@test.com'\`. \`queryByRole('alert')\` returns \`null\`, so \`not.toBeInTheDocument()\` passes. We used \`queryBy\` here because \`getBy\` would throw when the element is missing.

Async test: "Loading..." is shown first. \`findByText\` keeps checking until "Asha" appears after the mocked fetch resolves.`,
      questions: [
        {
          q: 'What is the difference between getBy, queryBy and findBy?',
          a: '`getBy` returns the element or throws. `queryBy` returns `null` if missing, so it is used to assert absence. `findBy` returns a promise and waits for the element to appear, for async UI.',
        },
        {
          q: 'Why prefer getByRole over getByTestId?',
          a: 'Role queries match how users and assistive technology find elements, so the test is closer to real use and also checks accessibility. Test IDs are invisible to users and should be a last resort.',
        },
        {
          q: 'What is the difference between user-event and fireEvent?',
          a: '`fireEvent` dispatches a single DOM event. `user-event` simulates the full sequence a real user causes (focus, keydown, input, click), so it is more realistic. Modern user-event is async, so you `await` it.',
        },
        {
          q: 'What is the guiding principle of React Testing Library?',
          a: '"The more your tests resemble the way your software is used, the more confidence they can give you." Test behaviour on the screen, not implementation details like state.',
        },
        {
          q: 'How do you test a custom hook?',
          a: 'Use `renderHook` from `@testing-library/react`, then read `result.current`, and wrap state updates in `act`. Often it is simpler to test the hook through a small component that uses it.',
        },
      ],
      spoken: `"React Testing Library lets me test components the way a user uses them. I render the component, find elements with screen queries — preferably getByRole with a name, or getByLabelText for form fields — interact using user-event, and assert with jest-dom matchers like toBeInTheDocument. I use getBy when the element must exist, queryBy to check something is absent, and findBy for async content after an API call. I avoid testing state or internal functions, so when I refactor a component, the tests only fail if the user experience actually breaks."`,
      mistakes: [
        'Using `getBy` to check that something is not there. It throws. Use `queryBy` with `not.toBeInTheDocument()`.',
        'Forgetting to `await` user-event actions or `findBy` queries in newer versions, which causes act() warnings and flaky tests.',
        'Using `getByTestId` everywhere. It hides accessibility problems and does not match how users find things.',
        'Wrapping everything in `act()` manually. RTL `render`, user-event and `findBy`/`waitFor` already handle it; extra act calls usually hide a real missing await.',
        'Follow-up trap: "What does the act() warning mean?" A state update happened that the test did not wait for. Usually you need to `await` a `findBy` or `waitFor` for the final UI state.',
      ],
      takeaway: 'Find elements like a user (role, label, text), interact with user-event, and assert on the screen — not on state.',
    },
    {
      id: 'postman-api-testing',
      title: 'API Testing with Postman (collections, environments, Newman)',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Postman sends HTTP requests, groups them in collections, swaps URLs and tokens with environments, checks responses with test scripts, and runs in CI with Newman.',
      what: `**Postman** is an app for calling APIs by hand and with simple automated checks.

- **Request** — method, URL, headers, body. You click Send and see the response.
- **Collection** — a folder of saved requests, like "Auth", "Orders", "Payments". You can share it with the team.
- **Environment** — a set of **variables** like \`{{baseUrl}}\` and \`{{token}}\`. Switch from "Local" to "Staging" and every request uses the new values.
- **Test scripts** — small JavaScript snippets that run **after** a response, using \`pm.test\` and \`pm.expect\`.
- **Pre-request scripts** — run **before** the request (for example, create a timestamp or sign a request).
- **Newman** — the command-line runner for collections, so you can run them in CI.

#### Deeper version
Variables have **scopes**: global, collection, environment, data (from a CSV/JSON file in a runner), and local. The narrowest scope wins.

You can **chain** requests: the login test script saves the token with \`pm.environment.set('token', ...)\`, and the next requests use \`Bearer {{token}}\`. The **Collection Runner** runs all requests in order, optionally once per row of a data file (data-driven tests).

Postman is great for exploring and documenting APIs and for smoke tests. For deep, fast regression tests that live next to the code, many teams prefer **supertest + Jest** inside the repo, because those tests run with the code, can seed a database, and are reviewed in pull requests. Do not commit real secrets into exported collections or environments.`,
      why: `Frontend and backend developers, QA and product people can all use the same shared collection to understand and try the API. With test scripts and Newman, those same requests become a quick automated smoke test after each deploy.`,
      analogy: `A collection is a recipe book. An environment is your kitchen: home kitchen (local) or restaurant kitchen (staging). The same recipe works in both because "oven" and "salt" are variables. Test scripts are the taste check after each dish. Newman is a robot chef that cooks the whole book every night without you.`,
      code: [
        {
          title: 'Postman test script (Tests tab)',
          lang: 'javascript',
          code: `// Runs after the "POST {{baseUrl}}/auth/login" request
pm.test('status is 200', () => {
  pm.response.to.have.status(200);
});

pm.test('returns a token', () => {
  const body = pm.response.json();
  pm.expect(body).to.have.property('token');
  pm.expect(body.token).to.be.a('string');
  // Save it for the next requests: Authorization: Bearer {{token}}
  pm.environment.set('token', body.token);
});

pm.test('responds fast', () => {
  pm.expect(pm.response.responseTime).to.be.below(500);
});`,
        },
        {
          title: 'Run the collection in CI with Newman',
          lang: 'bash',
          code: `npm install -g newman
newman run orders.postman_collection.json \\
  -e staging.postman_environment.json \\
  --env-var "password=$TEST_USER_PASSWORD" \\
  --reporters cli,junit \\
  --reporter-junit-export results.xml`,
        },
      ],
      output: `After login, Postman runs three checks: status 200, a string token in the body, and a response time under 500 ms. The token is saved into the environment, so the next request (for example, "GET {{baseUrl}}/orders" with \`Bearer {{token}}\`) is authenticated automatically.

In CI, Newman runs the whole collection against staging. The secret password comes from a CI secret, not from the file. If any \`pm.test\` fails, Newman exits with a non-zero code and the pipeline goes red. The JUnit XML report can be shown in the CI dashboard.`,
      questions: [
        {
          q: 'What is the difference between a collection and an environment in Postman?',
          a: 'A collection is a saved group of requests. An environment is a set of variables (base URL, tokens) so the same collection can run against local, staging or production.',
        },
        {
          q: 'How do you chain requests in Postman?',
          a: 'In the test script of the first request, read the response and save a value with `pm.environment.set`. Later requests use it as `{{variable}}`.',
        },
        {
          q: 'What is Newman?',
          a: 'The command-line runner for Postman collections. It lets you run API tests in CI and exits with a failure code when a test fails.',
        },
        {
          q: 'Postman or supertest — which do you use for API tests?',
          a: 'Both, for different jobs. Postman for exploring, sharing and smoke-testing deployed APIs. Supertest with Jest for fast regression tests that live in the repo and run on every pull request.',
        },
      ],
      spoken: `"I use Postman to explore and share APIs. I organise requests into collections, and use environments for things like baseUrl and tokens, so the same collection works locally and on staging. In the Tests tab I write pm.test assertions for status codes, response shape and response time, and I chain requests by saving the login token to an environment variable. To automate it, I run the collection with Newman in CI after a deploy as a smoke test. For deeper regression tests that live with the code, I use supertest and Jest."`,
      mistakes: [
        'Hard-coding URLs and tokens in each request instead of using environment variables.',
        'Exporting and committing environments that contain real API keys or passwords. Use CI secrets and `--env-var`.',
        'Only checking the status code. Also check the body shape and important fields.',
        'Follow-up trap: "What is the difference between the initial and current value of a variable?" The initial value is synced and shared with the team; the current value stays local. Secrets should only live in the current value or a vault.',
      ],
      takeaway: 'Collections hold requests, environments hold variables, test scripts check responses, and Newman runs it all in CI.',
    },
    {
      id: 'code-review',
      title: 'Code Review Best Practices',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Small PRs, clear descriptions, automated checks first, and kind, specific comments about correctness, design, tests and security.',
      what: `**Code review** means another developer reads your change (a pull request) before it is merged. They look for bugs, unclear code, missing tests and security problems.

As an **author**:
- Keep the PR **small** and focused on one thing (a good target is a few hundred lines).
- Write a clear description: what, why, how to test, screenshots for UI.
- Review your own diff first. Make sure CI is green.

As a **reviewer**:
- Check **correctness** first, then design, tests, security, readability.
- Be kind and specific. Ask questions instead of commanding.
- Label small things as "nit:" (optional), so the author knows what is blocking.
- Let tools (ESLint, Prettier, TypeScript, tests) handle style. Humans focus on logic.

#### Deeper version
A useful review checklist:
1. Does it do what the ticket asks? Edge cases: empty lists, null, large inputs, timezones, concurrent requests.
2. Errors: are failures handled and logged? Any unhandled promise?
3. Security: input validation, auth checks on every route, no secrets in code, no SQL/NoSQL injection, no sensitive data in logs.
4. Performance: N+1 queries, missing indexes, unbounded loops, huge payloads, unnecessary re-renders.
5. Tests: do they cover the new behaviour and the bug that was fixed?
6. Readability and naming; will the next person understand it?
7. Backward compatibility: API contracts, DB migrations, feature flags.

Good teams also review **fast** (within a day), because slow reviews create big, risky PRs and merge conflicts.`,
      why: `Reviews catch bugs before users do, spread knowledge so no one is the only person who knows a module, and keep the codebase consistent. They are also how juniors learn and seniors stay honest.`,
      analogy: `Code review is like a second pair of eyes on a letter before you send it to a client. You might be sure it is perfect, but a colleague spots the wrong date in seconds — and they say it nicely, so you are happy to fix it.`,
      code: [
        {
          title: 'A good PR description template',
          lang: 'text',
          code: `## What
Add retry with exponential backoff to the Stripe webhook handler.

## Why
Webhooks failed during a short DB outage and events were lost (JIRA-412).

## How
- Wrap the handler in withRetry(fn, { retries: 3, baseMs: 200 })
- Store processed event IDs to make the handler idempotent

## How to test
1. npm test -- webhook
2. stripe trigger payment_intent.succeeded (twice) -> only one order created

## Risks
Retries add up to ~1.4s latency in the worst case.`,
        },
        {
          title: 'Review comments: weak vs strong',
          lang: 'text',
          code: `Weak:   "This is wrong."
Strong: "If items is empty, reduce() has no initial value and throws.
         Could we pass 0 as the initial value? Test idea: total([]) === 0."

Weak:   "Rename this."
Strong: "nit: 'data' is a bit vague here - maybe 'unpaidInvoices'? Not blocking."

Weak:   "Security issue."
Strong: "This route reads req.params.userId but never checks it matches
         req.user.id, so any logged-in user can read another user's orders.
         Blocking - can we add the ownership check and a test for 403?"`,
        },
      ],
      output: `The PR description lets a reviewer understand the change in one minute: the problem, the approach, how to verify it, and the risks.

The strong comments explain the **problem**, the **impact** and a **suggestion**, and they say clearly what is blocking and what is just a "nit". This makes reviews faster and less personal: the discussion is about the code, not the person.`,
      questions: [
        {
          q: 'What do you look for when reviewing a PR?',
          a: 'Correctness and edge cases first, then error handling, security (auth, validation, secrets), performance (N+1 queries, re-renders), tests, and finally readability. Style is left to linters.',
        },
        {
          q: 'How do you handle disagreement in a code review?',
          a: 'Keep it about the code, explain the reason and trade-off, and ask questions. If it is not resolved quickly, talk on a call or follow the team convention, and record the decision. Do not block on personal taste.',
        },
        {
          q: 'How big should a pull request be?',
          a: 'Small enough to review well in one sitting — usually a few hundred lines and one logical change. Split big features with feature flags or stacked PRs.',
        },
        {
          q: 'What should a good PR description contain?',
          a: 'What changed, why (link to ticket), how it was done, how to test it, screenshots for UI, and any risks or migration steps.',
        },
      ],
      spoken: `"As an author, I keep PRs small and focused, review my own diff first, make sure CI is green, and write a description with what, why, how to test and any risks. As a reviewer, I check correctness and edge cases first, then error handling, security like auth checks and input validation, performance like N+1 queries, and whether tests cover the change. I leave style to ESLint and Prettier. I try to be specific and kind — I explain the problem and suggest a fix — and I mark small things as nits so the author knows what is blocking."`,
      mistakes: [
        'Opening a 2,000-line PR. Reviewers skim it, and real bugs get through.',
        'Arguing about formatting in reviews. Automate it with Prettier and ESLint so humans focus on logic.',
        'Approving without running or understanding the code ("LGTM" culture).',
        'Comments that attack the person ("you always...") instead of describing the code problem.',
        'Follow-up trap: "What do you do if a senior pushes back on your review comment?" Explain the concrete risk with an example or a failing test case. If they still disagree and it is not a correctness or security issue, accept it and move on.',
      ],
      takeaway: 'Small PRs, clear descriptions, tools for style, humans for logic — and comments that are specific and kind.',
    },
    {
      id: 'jest-mocking',
      title: 'Jest Mocking: jest.fn, jest.mock and jest.spyOn',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'jest.fn makes a fake function, jest.mock replaces a whole module, and jest.spyOn watches (and optionally replaces) one method on a real object.',
      what: `**Mocking** means replacing a real dependency (email service, payment API, database) with a fake one you control in the test.

Jest has three main tools:

- \`jest.fn()\` — creates a **fake function**. It records every call and you can choose what it returns.
- \`jest.mock('./module')\` — replaces **every export** of a module with fakes, for every file that imports it in this test file.
- \`jest.spyOn(object, 'method')\` — wraps **one existing method**. By default it still calls the real method but records calls. You can also change what it returns.

Useful mock methods:
- \`mockReturnValue(x)\`, \`mockResolvedValue(x)\` (returns a resolved promise), \`mockRejectedValue(err)\`
- \`mockImplementation((a) => ...)\` and the \`...Once\` versions for one call
- Matchers: \`toHaveBeenCalled()\`, \`toHaveBeenCalledTimes(n)\`, \`toHaveBeenCalledWith(args)\`

#### Deeper version
\`jest.mock\` calls are **hoisted** to the top of the file by Jest's Babel transform, so they run before the imports. That is why the factory function cannot use normal outer variables (only ones whose names start with \`mock\`).

Resetting:
- \`mockClear()\` — clears recorded calls.
- \`mockReset()\` — clears calls **and** removes the fake implementation.
- \`mockRestore()\` — for spies: puts the **original** method back.
- Config options \`clearMocks\`, \`resetMocks\` and \`restoreMocks\` do this automatically between tests.

With **native ES modules** (no Babel), module mocking needs \`jest.unstable_mockModule\` and dynamic \`import()\`. Most projects use Babel or ts-jest, where \`jest.mock\` works as shown.

Rule of thumb: mock at the **boundaries** of your system (network, email, payment, time, randomness). Do not mock your own small helpers — then the test only checks your mocks.`,
      why: `Real dependencies make tests slow, flaky and expensive: you do not want to send real emails or charge a real card on every test run. Mocks also let you create hard cases on demand, like "Stripe is down" or "the email service times out".`,
      analogy: `A mock is a stunt double in a film. The real actor (the payment API) is expensive and must not get hurt, so a double does the scene. The director (your test) tells the double exactly what to do and later checks the footage: "Did the double jump twice, at the right moment?"`,
      code: [
        {
          title: 'jest.fn and jest.mock',
          lang: 'javascript',
          code: `// emailService.js
export async function sendEmail(to, subject) { /* calls a real email API */ }

// signup.js
import { sendEmail } from './emailService.js';
export async function signup(user, db) {
  const saved = await db.save(user);
  await sendEmail(user.email, 'Welcome!');
  return saved;
}

// signup.test.js
import { signup } from './signup.js';
import { sendEmail } from './emailService.js';

jest.mock('./emailService.js'); // every export becomes a jest.fn()

beforeEach(() => jest.clearAllMocks());

test('saves the user and sends a welcome email', async () => {
  const db = { save: jest.fn().mockResolvedValue({ id: 1, email: 'a@b.com' }) };

  const result = await signup({ email: 'a@b.com' }, db);

  expect(result).toEqual({ id: 1, email: 'a@b.com' });
  expect(db.save).toHaveBeenCalledTimes(1);
  expect(sendEmail).toHaveBeenCalledWith('a@b.com', 'Welcome!');
});

test('fails if the email service fails', async () => {
  sendEmail.mockRejectedValueOnce(new Error('SMTP down'));
  const db = { save: jest.fn().mockResolvedValue({ id: 2 }) };
  await expect(signup({ email: 'x@y.com' }, db)).rejects.toThrow('SMTP down');
});`,
        },
        {
          title: 'jest.spyOn for Date and console',
          lang: 'javascript',
          code: `test('spy on Date.now and restore it', () => {
  const spy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
  expect(Date.now()).toBe(1700000000000);
  spy.mockRestore(); // real Date.now is back
});

test('logs a warning', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  console.warn('low stock');
  expect(warn).toHaveBeenCalledWith('low stock');
  warn.mockRestore();
});`,
        },
      ],
      output: `In the first test, \`db.save\` is a \`jest.fn\` that resolves to a fake user, and \`sendEmail\` is auto-mocked by \`jest.mock\`, so no real email is sent. We check the return value and that both fakes were called with the right arguments.

In the second test, \`mockRejectedValueOnce\` makes \`sendEmail\` fail just once, and we check that \`signup\` passes the error up.

In the spy tests, \`Date.now\` returns a fixed time so the test is predictable, and \`console.warn\` is silenced but still recorded. \`mockRestore()\` puts the real methods back so other tests are not affected.`,
      questions: [
        {
          q: 'What is the difference between jest.fn, jest.mock and jest.spyOn?',
          a: '`jest.fn` creates a standalone fake function. `jest.mock` replaces a whole module\'s exports with fakes. `jest.spyOn` wraps one method on an existing object, keeps the real behaviour by default, and can be restored.',
        },
        {
          q: 'What is the difference between mockClear, mockReset and mockRestore?',
          a: '`mockClear` clears call history. `mockReset` also removes any fake implementation. `mockRestore` (for spies) also puts back the original function.',
        },
        {
          q: 'Why can a jest.mock factory not use variables from the test file?',
          a: 'Because Jest hoists `jest.mock` above the imports, the factory runs before those variables exist. Jest only allows outer variables whose names start with `mock`.',
        },
        {
          q: 'What should you mock and what should you not mock?',
          a: 'Mock things at the edges: network calls, payment providers, email, time and randomness. Avoid mocking your own internal functions, or the test only proves your mocks work.',
        },
      ],
      spoken: `"I use jest.fn when I need a fake function, for example a callback or an injected repository. I use jest.mock to replace a whole module, like an email or Stripe client, so no real calls happen. And I use jest.spyOn when I want to watch or temporarily replace one method on a real object, like Date.now or console.error, and then restore it. I set mockResolvedValue or mockRejectedValue to simulate success and failure. I reset mocks between tests, and I only mock at the boundaries — network, time, payments — not my own small helpers."`,
      mistakes: [
        'Forgetting to reset mocks between tests, so call counts and fake return values leak into the next test. Use `clearMocks`/`restoreMocks` in the config.',
        'Mocking everything, including internal helpers. The test then passes even when the real code is broken.',
        'Calling `jest.spyOn` without `mockRestore`, which leaves a global like `Date.now` faked for other tests in the file.',
        'Follow-up trap: "Your jest.mock works in one test file — does it affect other test files?" No. Each test file has its own module registry, so mocks are per file.',
      ],
      takeaway: 'jest.fn = fake function, jest.mock = fake module, jest.spyOn = watch a real method — mock only at the edges and always reset.',
    },
    {
      id: 'mocks-stubs-spies-fakes',
      title: 'Mocks vs Stubs vs Spies vs Fakes (Test Doubles)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'All are "test doubles". A stub returns canned answers, a spy records calls, a mock checks expected calls, and a fake is a simple working version.',
      what: `A **test double** is any object that stands in for a real dependency in a test (the name comes from "stunt double"). There are a few kinds:

- **Dummy** — passed in but never used, just to fill a parameter.
- **Stub** — returns **fixed answers**. "When asked for user 1, return Asha." You do not check how it was called.
- **Spy** — **records** how it was called (arguments, count), often while calling the real code.
- **Mock** — an object with **expectations** about how it must be called. The test fails if the calls are wrong.
- **Fake** — a **simple working implementation**, like an in-memory database instead of MongoDB.

#### Deeper version
The key difference is **state verification vs behaviour verification**:
- With stubs and fakes you check the **result** (state): "the order total is 110".
- With mocks and spies you check the **interaction** (behaviour): "sendEmail was called once with this address".

In Jest these lines blur: \`jest.fn()\` can act as a stub (\`mockReturnValue\`), a spy (records calls), or a mock (you assert \`toHaveBeenCalledWith\`). \`jest.spyOn\` is a spy that can become a stub. \`mongodb-memory-server\` or a \`Map\`-based repository is a fake.

Prefer state checks when possible. Interaction checks are right when the interaction **is** the behaviour — like "we must send exactly one email" or "we must call Stripe with an idempotency key". Too many interaction checks make tests fragile.`,
      why: `Interviewers ask this to see if you understand **why** you replace a dependency, not just how. Picking the right double makes tests simpler and less fragile: a fake DB lets you test real queries; a stub is enough when you just need data back; a mock is for when the call itself matters.`,
      analogy: `Think of a film set. A **dummy** is a mannequin in the background. A **stub** is an actor who only says one fixed line. A **spy** is a hidden camera that records what everyone does. A **mock** is an actor with a strict script — if they say the wrong line, the director stops the scene. A **fake** is a cheaper but working prop car that really drives, just not on a highway.`,
      code: [
        {
          title: 'The same dependency, four doubles',
          lang: 'javascript',
          code: `// orderService.js
export async function placeOrder(repo, mailer, order) {
  const saved = await repo.save(order);
  await mailer.send(order.email, 'Order ' + saved.id + ' confirmed');
  return saved;
}

// orderService.test.js
import { placeOrder } from './orderService.js';

// STUB: returns a canned answer, we do not check its calls
const stubRepo = { save: async (o) => ({ ...o, id: 'o1' }) };

// FAKE: a small but real in-memory implementation
class FakeRepo {
  rows = new Map();
  async save(o) { const id = 'o' + (this.rows.size + 1); this.rows.set(id, o); return { ...o, id }; }
}

test('stub + spy: email is sent with the order id', async () => {
  const mailer = { send: jest.fn() }; // SPY/MOCK: records calls
  await placeOrder(stubRepo, mailer, { email: 'a@b.com' });
  expect(mailer.send).toHaveBeenCalledWith('a@b.com', 'Order o1 confirmed'); // behaviour check
});

test('fake: order is really stored', async () => {
  const repo = new FakeRepo();
  await placeOrder(repo, { send: async () => {} }, { email: 'a@b.com' });
  expect(repo.rows.size).toBe(1); // state check
});`,
        },
      ],
      output: `In the first test, the **stub** repo just returns an order with id \`o1\`. The mailer is a \`jest.fn\` that records calls, and we assert the interaction: the email went to \`a@b.com\` with the right text.

In the second test, the **fake** repo really stores data in a \`Map\`. We do not care how \`save\` was called; we check the **state** — one order is stored. The empty \`send\` function is a dummy-like stub because we do not care about email here.`,
      questions: [
        {
          q: 'What is the difference between a mock and a stub?',
          a: 'A stub provides canned answers so the code can run; you check the result. A mock has expectations about how it is called, and the test checks those calls.',
        },
        {
          q: 'What is a fake? Give an example.',
          a: 'A simplified working implementation of a dependency, like an in-memory repository, SQLite instead of Postgres, or mongodb-memory-server instead of a real MongoDB cluster.',
        },
        {
          q: 'What is a spy?',
          a: 'A double that records calls (arguments, count, return values), often while still calling the real function. `jest.spyOn` is the Jest version.',
        },
        {
          q: 'When should you verify interactions instead of state?',
          a: 'When the interaction is the actual behaviour, like sending exactly one email, publishing an event, or calling a payment API. Otherwise prefer checking the result, because it is less fragile.',
        },
      ],
      spoken: `"They are all test doubles — objects that replace a real dependency in a test. A stub just returns fixed data so the code can run. A spy records how it was called. A mock is set up with expectations, and the test fails if the calls do not match. A fake is a lightweight working version, like an in-memory repository or mongodb-memory-server. In Jest, jest.fn can play all of these roles. I prefer checking state with stubs and fakes, and I only verify interactions when the call itself matters, like sending an email or charging a card."`,
      mistakes: [
        'Using the word "mock" for everything. It is fine casually, but in interviews show you know the difference.',
        'Verifying every internal call. Tests become tightly coupled to implementation and break on refactor.',
        'Building a fake that behaves differently from the real thing (for example, no unique index). Tests pass but production fails.',
        'Follow-up trap: "Is jest.spyOn a mock or a spy?" It is a spy by default (calls the real method). Add `mockImplementation` or `mockReturnValue` and it also acts as a stub.',
      ],
      takeaway: 'Stub = canned answers, spy = records calls, mock = expected calls, fake = small working version; prefer checking results over calls.',
    },
    {
      id: 'supertest-api-testing',
      title: 'Testing Express APIs with supertest',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'supertest sends real HTTP requests to your Express app in memory, so you can test routes, middleware, validation and status codes without starting a server.',
      what: `**supertest** is a library for testing HTTP servers. You give it your Express \`app\`, and it sends requests to it and lets you check the response.

\`\`\`js
const res = await request(app).get('/api/users/1');
expect(res.status).toBe(200);
\`\`\`

You do **not** need to call \`app.listen()\`. supertest starts the app on a temporary port for each request and closes it after.

A supertest test is usually an **integration test**: it goes through routing, middleware (auth, validation, JSON parsing), the controller and often a test database.

#### Deeper version
To make the app testable, **split** creating the app from starting the server:
- \`app.js\` builds and exports the Express app.
- \`server.js\` imports it, connects to the DB and calls \`listen\`.

Then tests import \`app.js\` only. This also avoids "port already in use" errors when Jest runs files in parallel.

Useful patterns:
- \`.set('Authorization', 'Bearer ' + token)\` for auth headers.
- \`.send({ ... })\` sends a JSON body; \`.query({ page: 2 })\` adds query params.
- \`request.agent(app)\` keeps cookies between requests (for session login).
- Test the **unhappy paths** too: 400 for bad input, 401 without a token, 403 for another user\'s data, 404 for missing items, 409 for duplicates.`,
      why: `Most backend bugs live in the glue between parts: a missing middleware, a wrong status code, a validation rule, an auth check that is not applied. Unit tests of controllers miss these. supertest checks the API exactly as a client sees it, but fast enough to run on every pull request.`,
      analogy: `supertest is like a mystery shopper who visits your shop through the front door. They do not look inside the kitchen. They order, pay and check what they get. If the door is locked (auth) or the order is wrong (400), they notice right away.`,
      code: [
        {
          title: 'app.js — testable Express app',
          lang: 'javascript',
          code: `import express from 'express';
export const app = express();
app.use(express.json());

const tasks = [];

function auth(req, res, next) {
  if (req.headers.authorization !== 'Bearer test-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/tasks', auth, (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const task = { id: tasks.length + 1, title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});
// server.js (not used in tests): app.listen(3000)`,
        },
        {
          title: 'tasks.test.js',
          lang: 'javascript',
          code: `import request from 'supertest';
import { app } from './app.js';

const AUTH = { Authorization: 'Bearer test-token' };

describe('POST /tasks', () => {
  test('201 creates a task', async () => {
    const res = await request(app).post('/tasks').set(AUTH).send({ title: 'Write tests' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), title: 'Write tests', done: false });
  });

  test('400 when title is missing', async () => {
    const res = await request(app).post('/tasks').set(AUTH).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  test('401 without a token', async () => {
    await request(app).post('/tasks').send({ title: 'x' }).expect(401);
  });
});

test('GET /tasks/:id returns 404 for unknown id', async () => {
  const res = await request(app).get('/tasks/999');
  expect(res.status).toBe(404);
});`,
        },
      ],
      output: `All four tests pass without starting a real server:

- The happy path returns 201 and a task. \`toMatchObject\` checks only the fields we care about, and \`expect.any(Number)\` accepts any id.
- An empty body returns 400 with an error mentioning "title".
- Without the header, the \`auth\` middleware returns 401 — this proves the middleware is actually attached to the route.
- An unknown id returns 404.

Notice \`.expect(401)\` — supertest has its own built-in assertion style too, and it works with \`await\`.`,
      questions: [
        {
          q: 'What is supertest and why use it?',
          a: 'A library that sends HTTP requests to an Express (or any Node HTTP) app in memory. It tests routes end to end inside the backend — middleware, validation, status codes — without running a separate server.',
        },
        {
          q: 'Why separate app.js and server.js?',
          a: 'So tests can import the app without calling `listen` or connecting to production resources. It avoids port conflicts and lets tests control setup like a test database.',
        },
        {
          q: 'How do you test authenticated routes?',
          a: 'Create a test user and token in `beforeAll` (or sign a JWT with the test secret) and send it with `.set(\'Authorization\', \'Bearer \' + token)`. Also test that the route returns 401 without it and 403 for another user\'s resource.',
        },
        {
          q: 'Is a supertest test a unit or integration test?',
          a: 'Usually an integration test, because it exercises routing, middleware and controller together, often with a real test database.',
        },
      ],
      spoken: `"For Express APIs I use supertest with Jest. I export the app from app.js without calling listen, so tests can import it and supertest can send real HTTP requests in memory. I test the happy path and the important error paths: 400 for validation, 401 with no token, 403 when a user accesses someone else's data, and 404. I usually run these against mongodb-memory-server so the real Mongoose queries run. These integration tests catch the bugs that unit tests miss, like a middleware that was never attached to a route."`,
      mistakes: [
        'Importing a file that calls `app.listen()` in tests. You get open handles and "port in use" errors.',
        'Only testing the happy path. Most security bugs are in missing 401/403 checks.',
        'Checking the whole response body with `toEqual` including timestamps and generated IDs. Use `toMatchObject` and `expect.any`.',
        'Follow-up trap: "Jest says it did not exit after the tests — why?" Something is still open: a DB connection, a server, or a timer. Close them in `afterAll`. `--detectOpenHandles` helps find it.',
      ],
      takeaway: 'Export the app, hit it with supertest, and test every status code a real client can get — especially 400, 401, 403 and 404.',
    },
    {
      id: 'mocking-databases',
      title: 'Mocking Databases: mongodb-memory-server and Repository Mocks',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'For integration tests run a real throwaway MongoDB in memory; for unit tests inject a fake or mocked repository instead of mocking Mongoose itself.',
      what: `Your code talks to a database. In tests you have three choices:

1. **Real throwaway database** — \`mongodb-memory-server\` downloads a real MongoDB binary and starts it in memory for the tests. Your real Mongoose models and queries run. Data is gone when tests end.
2. **Repository mock / fake** — if your code uses a small data layer (\`userRepo.findByEmail()\`), the test passes a fake repo instead. No DB at all.
3. **Docker test DB** — a real MongoDB/Postgres container (for example in CI with a service container or Testcontainers). Closest to production.

Avoid mocking Mongoose methods one by one (\`User.findOne = jest.fn()\`). It is fragile and does not test your real queries.

#### Deeper version
A typical setup with \`mongodb-memory-server\`:
- \`beforeAll\`: start the server, \`mongoose.connect(mongod.getUri())\`.
- \`afterEach\`: delete all documents from every collection so tests stay isolated.
- \`afterAll\`: \`mongoose.disconnect()\` and \`mongod.stop()\`.

Limits: the first run downloads a binary (cache it in CI). Some features (transactions) need a **replica set** — use \`MongoMemoryReplSet\`. Indexes must be built (\`Model.init()\` or \`syncIndexes()\`) before you test unique constraints.

The **repository pattern** helps unit tests: business logic depends on an interface (\`save\`, \`findById\`), not on Mongoose. Then you can inject a fake in unit tests and the real Mongo repository in integration tests. This is dependency injection — passing dependencies in instead of importing them directly.`,
      why: `Database bugs are common: wrong filter, missing \`await\`, unique index violation, wrong population. Mocking each Mongoose call hides those bugs. A real in-memory DB catches them while keeping tests fast and independent from any shared dev database that other people change.`,
      analogy: `Testing with a shared dev database is like practising cooking in a restaurant kitchen during dinner service — other cooks keep moving your ingredients. \`mongodb-memory-server\` gives you your own private kitchen that appears when you start and disappears when you finish.`,
      code: [
        {
          title: 'Jest setup with mongodb-memory-server',
          lang: 'javascript',
          code: `// test/db.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export async function connect() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function clear() {
  const { collections } = mongoose.connection;
  for (const key in collections) await collections[key].deleteMany({});
}

export async function close() {
  await mongoose.disconnect();
  await mongod.stop();
}

// user.test.js
import { connect, clear, close } from './test/db.js';
import { User } from '../models/User.js'; // email has unique: true

beforeAll(connect);
afterEach(clear);
afterAll(close);

test('rejects a duplicate email', async () => {
  await User.init(); // make sure the unique index is built
  await User.create({ email: 'a@b.com' });
  await expect(User.create({ email: 'a@b.com' })).rejects.toThrow(/duplicate key/);
});`,
        },
        {
          title: 'Unit test with an injected fake repository',
          lang: 'javascript',
          code: `// registerUser.js — depends on a repo interface, not on Mongoose
export async function registerUser(repo, { email }) {
  if (await repo.findByEmail(email)) throw new Error('Email already used');
  return repo.create({ email, plan: 'free' });
}

// registerUser.test.js
import { registerUser } from './registerUser.js';

function makeFakeRepo(existing = []) {
  const rows = [...existing];
  return {
    findByEmail: async (email) => rows.find((r) => r.email === email) || null,
    create: async (data) => { rows.push(data); return { id: rows.length, ...data }; },
  };
}

test('creates a free user', async () => {
  const user = await registerUser(makeFakeRepo(), { email: 'a@b.com' });
  expect(user).toEqual({ id: 1, email: 'a@b.com', plan: 'free' });
});

test('blocks a duplicate email', async () => {
  const repo = makeFakeRepo([{ email: 'a@b.com' }]);
  await expect(registerUser(repo, { email: 'a@b.com' })).rejects.toThrow('Email already used');
});`,
        },
      ],
      output: `In the first example, a real MongoDB runs in memory. The second \`User.create\` with the same email fails with a MongoDB "E11000 duplicate key" error, which proves the unique index really works — a mocked \`create\` could never show this. \`afterEach(clear)\` empties all collections, so the next test starts clean.

In the second example there is no database at all. The fake repo keeps rows in an array. The tests run in about a millisecond and check only the business rule: new users are free, and duplicates are blocked.`,
      questions: [
        {
          q: 'How do you test code that uses MongoDB?',
          a: 'For integration tests, use mongodb-memory-server (or a Docker MongoDB in CI) so real Mongoose queries run, and clear collections between tests. For unit tests of business logic, inject a fake or mocked repository.',
        },
        {
          q: 'Why not just mock Mongoose methods with jest.fn?',
          a: 'You end up re-implementing Mongoose in mocks, the tests are fragile (chained calls like `find().sort().limit()`), and they do not catch real query, schema or index bugs.',
        },
        {
          q: 'How do you keep database tests isolated?',
          a: 'Each test file gets its own DB (or database name), and you delete data in `afterEach`. Each test creates the data it needs instead of relying on seeds from other tests.',
        },
        {
          q: 'What do you need for testing MongoDB transactions in memory?',
          a: 'Transactions need a replica set, so use `MongoMemoryReplSet` instead of `MongoMemoryServer`.',
        },
      ],
      spoken: `"For MongoDB, I avoid mocking Mongoose calls one by one, because chained queries are painful to mock and the tests miss real bugs. For integration tests I use mongodb-memory-server: I start it in beforeAll, connect Mongoose to its URI, clear all collections after each test, and stop it in afterAll. That runs my real schemas, indexes and queries. For pure business logic I keep a small repository layer and inject a fake repository, so those unit tests run in milliseconds with no database. In CI I cache the Mongo binary so the download does not slow the pipeline."`,
      mistakes: [
        'Pointing tests at the shared development database. Tests become flaky and can delete real data.',
        'Not clearing data between tests, so one test\'s documents break another test.',
        'Testing unique constraints before indexes are built — the duplicate insert succeeds and the test is confusing. Call `Model.init()` first.',
        'Follow-up trap: "Is mongodb-memory-server a mock?" Not really — it is a real MongoDB process running in memory. It is a fake environment, not a mocked API, which is why it catches real query bugs.',
      ],
      takeaway: 'Real in-memory Mongo for integration tests, injected fake repositories for unit tests — do not hand-mock Mongoose.',
    },
    {
      id: 'mocking-external-apis',
      title: 'Mocking External APIs with nock and MSW',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Intercept outgoing HTTP calls at the network layer: nock for Node, MSW for both browser and Node. Your real fetch/axios code still runs.',
      what: `Your app calls other services: Stripe, OpenAI, a weather API. In tests you do not want real calls (slow, costly, flaky, rate-limited).

Instead of mocking your \`fetch\` function, you can **intercept the HTTP request** itself:

- **nock** (Node only) — "when a GET to api.github.com/users/asha happens, reply with this JSON". Your real axios/fetch code runs; only the network is faked.
- **MSW (Mock Service Worker)** — define **handlers** like \`http.get('/api/user', ...)\`. In the browser it uses a Service Worker; in Node (Jest, Vitest) it intercepts requests at the module level. The same handlers can be reused for tests, Storybook and local development.

#### Deeper version
Why intercept at the network layer instead of \`jest.mock('axios')\`?
- Your real HTTP code runs: URL building, headers, query strings, JSON parsing, error handling.
- You can switch from axios to fetch and the tests still pass.
- You can simulate real failures: 500 errors, timeouts, network errors, slow responses.

Good practices:
- Block real network calls in tests (\`nock.disableNetConnect()\`, or MSW \`onUnhandledRequest: 'error'\`) so a forgotten mock fails loudly.
- Reset handlers after each test (\`server.resetHandlers()\`, \`nock.cleanAll()\`).
- In MSW, override a handler inside one test with \`server.use(...)\` to test an error case.

Note: MSW v2 changed its API (\`http\` and \`HttpResponse\` replaced \`rest\` and \`res(ctx...)\`). Check which version your project uses. Also, nock historically patched Node's \`http\` module; support for native \`fetch\` (undici) depends on the nock version, so check the docs if you use fetch.`,
      why: `Third-party APIs are the most common cause of slow and flaky tests. Network-level mocks keep tests fast and deterministic, and let you test how your code handles the bad days: Stripe returns 500, OpenAI rate-limits you with 429, a request times out.`,
      analogy: `It is like a receptionist who catches every outgoing phone call. When you dial "Stripe", the receptionist answers in Stripe's voice with a prepared reply. Your phone (your HTTP code) works exactly as usual — it just never reaches the real company.`,
      code: [
        {
          title: 'nock in a Node test',
          lang: 'javascript',
          code: `import nock from 'nock';
import axios from 'axios';

async function getRepoCount(user) {
  const { data } = await axios.get('https://api.github.com/users/' + user);
  return data.public_repos;
}

beforeAll(() => nock.disableNetConnect()); // no real calls allowed
afterEach(() => nock.cleanAll());
afterAll(() => nock.enableNetConnect());

test('returns repo count', async () => {
  nock('https://api.github.com').get('/users/asha').reply(200, { public_repos: 12 });
  await expect(getRepoCount('asha')).resolves.toBe(12);
});

test('throws on server error', async () => {
  nock('https://api.github.com').get('/users/asha').reply(500);
  await expect(getRepoCount('asha')).rejects.toThrow(/500/);
});`,
        },
        {
          title: 'MSW v2 with React Testing Library',
          lang: 'javascript',
          code: `// mocks/handlers.js
import { http, HttpResponse } from 'msw';
export const handlers = [
  http.get('/api/me', () => HttpResponse.json({ name: 'Asha' })),
];

// jest.setup.js
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
export const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Profile.test.jsx — override for one test
import { http, HttpResponse } from 'msw';
import { server } from './jest.setup';
test('shows an error when the API fails', async () => {
  server.use(http.get('/api/me', () => new HttpResponse(null, { status: 500 })));
  render(<Profile />);
  expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
});`,
        },
      ],
      output: `With nock, the first test gets \`{ public_repos: 12 }\` without touching GitHub. The second test gets a 500, axios throws "Request failed with status code 500", and the test checks it. Because of \`disableNetConnect\`, any request without a matching nock fails right away instead of silently calling the real API.

With MSW, all tests get Asha by default. The error test overrides \`/api/me\` to return 500 only for that test, and the component shows its error message. \`resetHandlers\` removes the override afterwards.`,
      questions: [
        {
          q: 'How do you test code that calls a third-party API?',
          a: 'Intercept the HTTP request with nock (Node) or MSW (browser and Node) and return prepared responses, including error cases. For unit tests, you can also inject a mocked client.',
        },
        {
          q: 'Why is MSW often preferred over mocking fetch or axios directly?',
          a: 'It intercepts at the network level, so your real request code runs and tests do not care which HTTP library you use. The same handlers work in tests, Storybook and local development.',
        },
        {
          q: 'How do you make sure no real API calls happen in tests?',
          a: 'Use `nock.disableNetConnect()` or MSW `onUnhandledRequest: \'error\'`. Any unexpected request then fails the test loudly.',
        },
        {
          q: 'How would you test retry logic for an API that sometimes fails?',
          a: 'Mock the first call to return 500 or 429 and the second to return 200 (nock interceptors are used once by default; in MSW use a counter or `{ once: true }`). Then assert the final result and the number of calls, with fake timers for the backoff delay.',
        },
      ],
      spoken: `"I don't let tests call real third-party APIs. In Node tests I use nock or MSW to intercept the HTTP request and reply with prepared JSON, and I disable real network access so a missing mock fails loudly. In React tests I use MSW handlers, which I can also reuse in Storybook and local dev. I like this more than mocking axios directly, because my real request code still runs — headers, URLs, error handling. I always test unhappy paths too, like a 500, a 429 rate limit, or a timeout, and check that my retry and fallback logic works."`,
      mistakes: [
        'Letting tests call real APIs (Stripe test mode, OpenAI). Tests become slow, flaky and cost money.',
        'Only mocking success responses. Real APIs fail; test 4xx, 5xx, timeouts and malformed JSON.',
        'Forgetting to reset handlers, so an error override leaks into the next test.',
        'Follow-up trap: "Mocks can drift from the real API — how do you handle that?" Keep mock data close to real recorded responses, use typed SDKs, and add contract tests or a small number of real sandbox tests that run separately (for example nightly).',
      ],
      takeaway: 'Fake the network, not your code: nock or MSW let your real HTTP code run against controlled responses — including failures.',
    },
    {
      id: 'snapshot-testing',
      title: 'Snapshot Testing',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Jest saves the output of a component or value to a file and fails if it changes later. Good for small, stable outputs; bad when snapshots are huge.',
      what: `A **snapshot test** saves a "photo" of some output the first time it runs. Next time, Jest compares the new output with the saved one. If they are different, the test fails.

\`\`\`js
expect(render(<Badge />).container).toMatchSnapshot();
\`\`\`

- First run: Jest writes the snapshot into a \`__snapshots__\` folder.
- Later runs: Jest compares. Different = fail.
- If the change is **intended**, update snapshots with \`jest -u\` (or press \`u\` in watch mode).

\`toMatchInlineSnapshot()\` writes the snapshot **inside the test file**, which is easier to review.

#### Deeper version
Snapshots answer "did anything change?", not "is it correct?". The first snapshot is only as good as the person who checked it.

Good uses:
- Small, stable outputs: a formatted error message, a generated config object, a CLI output, a small presentational component.
- Serialized data structures, like the JSON a function builds for an API.

Bad uses:
- Huge component trees. Diffs are hundreds of lines, people stop reading them and just run \`jest -u\`. The test becomes noise.
- Output with dynamic values (dates, random IDs). Use property matchers: \`toMatchSnapshot({ id: expect.any(String) })\`.

Snapshot files must be **committed** and reviewed in pull requests like code. In CI, Jest does not write new snapshots when run with \`--ci\`, so a missing snapshot fails the build.

Visual regression testing (Playwright screenshots, Chromatic, Percy) is a different idea — it compares real pixel images of the UI.`,
      why: `Snapshots are a very cheap way to detect unexpected changes in output that would be boring to assert field by field. They work well as a safety net for stable outputs and refactors.`,
      analogy: `It is like taking a photo of your living room before guests arrive. Afterwards you compare a new photo with the old one. You will notice if the vase moved — but the photo cannot tell you whether the vase was in a good place to begin with.`,
      code: [
        {
          title: 'File snapshot and inline snapshot',
          lang: 'javascript',
          code: `// buildInvoice.js
export const buildInvoice = (order) => ({
  id: crypto.randomUUID(),
  total: order.items.reduce((s, i) => s + i.price * i.qty, 0),
  currency: 'INR',
  lines: order.items.map((i) => i.name + ' x' + i.qty),
});

// buildInvoice.test.js
import { buildInvoice } from './buildInvoice.js';

const order = { items: [{ name: 'Pen', price: 10, qty: 3 }] };

test('invoice shape (property matcher for the random id)', () => {
  expect(buildInvoice(order)).toMatchSnapshot({ id: expect.any(String) });
});

test('inline snapshot is easy to review', () => {
  const { id, ...rest } = buildInvoice(order);
  expect(rest).toMatchInlineSnapshot();
  // After the first run, Jest fills it in automatically, e.g.:
  // toMatchInlineSnapshot(\`
  //   {
  //     "currency": "INR",
  //     "lines": [ "Pen x3" ],
  //     "total": 30,
  //   }
  // \`)
});`,
        },
        {
          title: 'Updating snapshots',
          lang: 'bash',
          code: `npx jest              # compare with saved snapshots
npx jest -u           # accept changes (only when the change is intended!)
npx jest --ci         # in CI: never write new snapshots, fail instead`,
        },
      ],
      output: `On the first run, Jest saves the invoice to \`__snapshots__/buildInvoice.test.js.snap\`, replacing the random \`id\` with \`Any<String>\` so it does not change every run. The inline snapshot is written straight into the test file.

If someone later changes \`currency\` to \`'USD'\`, both tests fail and Jest shows a diff: \`- "INR"\` / \`+ "USD"\`. If the change was intended, the developer runs \`jest -u\` and the reviewer sees the snapshot change in the pull request.`,
      questions: [
        {
          q: 'What is snapshot testing?',
          a: 'Jest saves serialized output on the first run and compares future runs against it. Any difference fails the test until you either fix the code or update the snapshot.',
        },
        {
          q: 'What are the downsides of snapshot tests?',
          a: 'They do not prove correctness, large snapshots are hard to review, and teams get used to running `jest -u` without reading the diff. They also break on any harmless markup change.',
        },
        {
          q: 'How do you handle dynamic values like dates or IDs in snapshots?',
          a: 'Use property matchers like `toMatchSnapshot({ createdAt: expect.any(Date) })`, mock time with fake timers, or remove the field before snapshotting.',
        },
        {
          q: 'Should snapshot files be committed?',
          a: 'Yes. They are part of the test and must be reviewed in pull requests. Run Jest with `--ci` in pipelines so missing snapshots fail instead of being written.',
        },
      ],
      spoken: `"Snapshot testing saves the output of something, like a component or a generated object, the first time the test runs, and then fails if the output changes. It is cheap and good for small, stable outputs like error messages, config objects or small presentational components. The risk is large snapshots that nobody reads, so people just run jest -u and the test stops protecting anything. I keep snapshots small, prefer inline snapshots, use property matchers for dynamic values like IDs, and I still write explicit assertions for the behaviour that really matters."`,
      mistakes: [
        'Snapshotting a whole page component. The diff is huge, nobody reviews it, and it fails on every tiny markup change.',
        'Running `jest -u` to "fix" a failing test without reading the diff. You may accept a real bug.',
        'Using snapshots instead of real assertions for behaviour, like "clicking Save calls the API".',
        'Follow-up trap: "Is snapshot testing the same as visual regression testing?" No. Jest snapshots compare serialized text. Visual regression tools compare screenshots (pixels) of the rendered UI.',
      ],
      takeaway: 'Snapshots detect change, not correctness — keep them small, review their diffs, and never run jest -u blindly.',
    },
    {
      id: 'code-coverage',
      title: 'Code Coverage',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Coverage shows which lines, branches and functions ran during tests. It finds untested code, but 100% coverage does not mean bug-free.',
      what: `**Code coverage** measures how much of your code was executed while the tests ran. Run it with \`jest --coverage\`.

Jest reports four numbers:
- **Statements** — % of statements that ran.
- **Branches** — % of \`if/else\`, \`? :\`, \`&&\`, \`||\` and \`switch\` paths that ran. Usually the most useful number.
- **Functions** — % of functions called at least once.
- **Lines** — % of lines that ran.

It also creates an HTML report (\`coverage/lcov-report/index.html\`) that highlights uncovered lines in red.

#### Deeper version
Coverage tells you what code was **run**, not what was **checked**. A test that calls a function but has no \`expect\` still gives 100% coverage. So coverage is a good tool to **find gaps**, and a bad **target**.

You can set a minimum in the Jest config with \`coverageThreshold\`. If coverage drops below it, Jest exits with an error and CI fails. Many teams use a sensible global number (often 70-85%) and require higher coverage on critical modules like payments and auth.

Jest collects coverage with Babel instrumentation by default; it can also use V8's built-in coverage (\`coverageProvider: 'v8'\`), which is faster but can report slightly different numbers.

Related idea: **mutation testing** (for example Stryker) changes your code on purpose ("mutants", like \`>\` to \`>=\`) and checks whether tests fail. It measures test **quality**, not just coverage.`,
      why: `Coverage reports quickly show forgotten areas: an error branch nobody tested, a whole file with zero tests. A threshold in CI stops coverage from slowly dropping as the team adds code without tests.`,
      analogy: `Coverage is like a map of which rooms a security guard walked through. It shows rooms nobody visited — useful! But walking through a room does not mean the guard actually checked the windows were locked.`,
      code: [
        {
          title: 'jest.config.js with thresholds',
          lang: 'javascript',
          code: `export default {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts', '!src/server.js'],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 75, functions: 80, lines: 80, statements: 80 },
    './src/payments/': { branches: 90, lines: 95 }, // stricter for money code
  },
};`,
        },
        {
          title: '100% coverage, zero checking',
          lang: 'javascript',
          code: `export function discount(total, isMember) {
  return isMember ? total * 0.9 : total;
}

// This "test" covers every line and both branches...
test('discount runs', () => {
  discount(100, true);
  discount(100, false);
});
// ...but asserts nothing. If someone changes 0.9 to 0.5, it still passes.

// A real test:
test('members get 10% off', () => {
  expect(discount(100, true)).toBe(90);
  expect(discount(100, false)).toBe(100);
});`,
        },
      ],
      output: `\`npx jest --coverage\` prints a table per file with the four percentages and the uncovered line numbers. If the global branch coverage is 72%, Jest prints "coverage threshold for branches (75%) not met" and exits with code 1, so CI fails.

The second example shows the trap: the first test gives 100% coverage for \`discount\` but would never catch a wrong discount. Only the second test actually protects the behaviour.`,
      questions: [
        {
          q: 'What does code coverage measure?',
          a: 'How much of the code ran during tests: statements, branches, functions and lines. Branch coverage is usually the most useful because it shows untested if/else paths.',
        },
        {
          q: 'Is 100% coverage a good goal?',
          a: 'Not usually. It does not prove correctness, and the last few percent often cost a lot for little value. Use coverage to find important untested code, and aim higher only for critical modules.',
        },
        {
          q: 'How do you enforce coverage in CI?',
          a: 'Set `coverageThreshold` in the Jest config and run `jest --coverage` in the pipeline. Jest exits with an error when a threshold is not met.',
        },
        {
          q: 'What is mutation testing?',
          a: 'A tool changes small parts of your code (mutants) and runs your tests. If tests still pass, the mutant "survived", which shows weak assertions. Stryker is a common JS tool.',
        },
      ],
      spoken: `"Code coverage shows how much of my code ran during the tests — statements, branches, functions and lines. I run jest with coverage in CI and set thresholds, usually around 80 percent globally and higher for critical code like payments and auth. But I treat coverage as a tool to find gaps, not as the goal, because it shows what code ran, not what was actually checked. A test with no assertions can still give 100 percent. Branch coverage is the number I look at most, because missed error branches are where bugs hide."`,
      mistakes: [
        'Treating coverage as a quality score. High coverage with weak assertions gives false confidence.',
        'Writing silly tests just to hit a number, which makes the suite slower and harder to maintain.',
        'Including generated files, config or the server entry point in coverage, which skews the numbers. Use `collectCoverageFrom`.',
        'Follow-up trap: "Line coverage is 100% but branch coverage is 80% — how?" A single line can contain several branches, like `a && b` or a ternary. All lines ran, but not every path through them.',
      ],
      takeaway: 'Coverage finds untested code; assertions prove behaviour — use thresholds as a floor, not as the goal.',
    },
    {
      id: 'integration-vs-e2e',
      title: 'Unit vs Integration vs E2E Tests',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Unit = one piece alone. Integration = several real pieces together (API + DB). E2E = the whole deployed system through a real browser like a user.',
      what: `The difference is **how much real stuff** runs in the test.

- **Unit test** — one function or component. Dependencies are faked. Milliseconds.
- **Integration test** — several real parts together. Example: \`POST /orders\` through Express, validation, service and a real (in-memory) MongoDB, with only Stripe faked. Or a React form with its real child components and a mocked API (MSW).
- **E2E (end-to-end) test** — the full system as a user sees it: real browser, real frontend, real backend, real database, often a staging environment. Tools: Playwright, Cypress.

#### Deeper version
There is no perfect line between them; teams define them a bit differently. A useful way to think: **what is real and what is faked?**

- **Unit:** real = one function; faked = everything else.
- **Integration:** real = your code + DB + framework; faked = third-party services.
- **E2E:** real = everything; faked = maybe payment or email sandboxes.

Trade-offs:
- Unit: fast, precise failure messages, but can miss "glue" bugs.
- Integration: best confidence per cost for most web apps.
- E2E: highest confidence, but slow, expensive and flaky; failures are harder to debug.

Typical split for a MERN app: unit tests for pure logic (pricing, validation helpers), integration tests for every API route and important React screens, and a small E2E suite for critical journeys: sign up, login, checkout, the main AI feature.`,
      why: `Interviewers ask this to check you can design a sensible test strategy, not just write \`expect\`. Picking the right level saves hours of CI time and avoids both blind spots and flaky suites.`,
      analogy: `Building a house: a unit test checks one brick is strong. An integration test checks the wall built from bricks and cement holds weight. An E2E test is a family actually living in the finished house for a day: water, power, doors, everything.`,
      code: [
        {
          title: 'One feature, three levels',
          lang: 'javascript',
          code: `// UNIT — pure logic, nothing else
test('applyCoupon gives 20% off with SAVE20', () => {
  expect(applyCoupon(500, 'SAVE20')).toBe(400);
});

// INTEGRATION — Express + validation + real in-memory Mongo; Stripe faked with nock
test('POST /orders stores an order with the discounted total', async () => {
  nock('https://api.stripe.com').post('/v1/payment_intents').reply(200, { id: 'pi_1', status: 'succeeded' });
  const res = await request(app).post('/orders').set(auth).send({ sku: 'BOOK', coupon: 'SAVE20' });
  expect(res.status).toBe(201);
  expect(await Order.countDocuments({ total: 400 })).toBe(1);
});

// E2E — Playwright against staging, real browser
// test('user can buy a book with a coupon', async ({ page }) => {
//   await page.goto('https://staging.example.com');
//   await page.getByRole('button', { name: 'Buy' }).click();
//   await page.getByLabel('Coupon').fill('SAVE20');
//   await page.getByRole('button', { name: 'Pay' }).click();
//   await expect(page.getByText('Thank you for your order')).toBeVisible();
// });`,
        },
      ],
      output: `The unit test runs in about a millisecond and only proves the discount math. The integration test proves the route, validation, the discount logic and the database write work together, with Stripe faked so it stays fast. The E2E test (commented, needs a deployed app) proves the real user flow works in a real browser, including the frontend calling the backend correctly.

If the unit test fails, you know exactly which function is wrong. If only the E2E test fails, the bug could be anywhere — that is why you want lower-level tests too.`,
      questions: [
        {
          q: 'What is the difference between integration and E2E tests?',
          a: 'Integration tests check several parts of your code working together, usually inside one service with some external parts faked. E2E tests run the full system through the real UI, like a user, with as little faked as possible.',
        },
        {
          q: 'Which tests do you write most of in a MERN app?',
          a: 'Integration tests: supertest against Express with an in-memory Mongo, and RTL tests of real screens with MSW. Plus unit tests for pure logic and a small E2E suite for critical flows.',
        },
        {
          q: 'Why are E2E tests flaky?',
          a: 'They depend on many moving parts: network, timing, animations, test data, third-party services and environment health. Any of them can fail randomly.',
        },
        {
          q: 'What would you cover with E2E tests?',
          a: 'Only critical, money-making or high-risk journeys: sign up, login, checkout and payment, and the core feature of the product. Everything else is covered lower.',
        },
      ],
      spoken: `"The difference is how much of the real system runs. A unit test checks one function or component with dependencies faked. An integration test runs several real parts together — for example a supertest call through Express, validation and a real in-memory Mongo, with only Stripe mocked. An E2E test drives the whole deployed app in a real browser, like a user. In my projects most tests are integration tests, because they give the best confidence for the cost. I keep unit tests for pure logic and a small Playwright suite for critical flows like login and checkout."`,
      mistakes: [
        'Calling a test with everything mocked an "integration test". If the DB and framework are mocked, it is really a unit test.',
        'Trying to cover every edge case with E2E tests. Cover edge cases at unit/integration level and keep E2E for the main paths.',
        'Letting E2E tests depend on each other (test 2 uses the user created by test 1).',
        'Follow-up trap: "What is a smoke test?" A tiny set of quick checks (often E2E or API) run right after a deploy to confirm the main things work — the app loads, login works, health check is OK.',
      ],
      takeaway: 'Unit = one piece, integration = real pieces together, E2E = the whole app like a user — most value usually sits in integration.',
    },
    {
      id: 'cypress-playwright',
      title: 'E2E Testing with Cypress and Playwright',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Both drive a real browser through your app. Playwright: multi-browser, parallel, async/await. Cypress: great interactive runner, runs inside the browser.',
      what: `**Cypress** and **Playwright** are tools that open a real browser, click and type like a user, and check what appears on screen.

**Playwright** (by Microsoft):
- Supports Chromium, Firefox and WebKit (Safari engine).
- Normal \`async/await\` code. Multiple tabs, multiple users, iframes.
- Runs tests in parallel by default. Built-in trace viewer, screenshots and videos.

**Cypress**:
- Very friendly interactive runner: you watch the test run and "time travel" through each step.
- Runs **inside** the browser next to your app. Commands are chained (\`cy.get().click()\`) and queued, not normal promises.
- Great for frontend-focused teams; parallel runs are typically set up through its paid cloud service or CI splitting.

Both **auto-wait**: they wait for an element to appear and be ready before clicking, so you rarely need manual sleeps.

#### Deeper version
Good E2E practices (both tools):
- **Select by role/label/text**, like RTL: \`page.getByRole('button', { name: 'Pay' })\`. Use \`data-testid\` when needed. Avoid CSS classes that change with styling.
- **Log in through the API**, not the UI, for every test except the login test. Save the session (Playwright \`storageState\`, Cypress \`cy.session\`) to save time.
- **Seed test data** through an API or DB script before each test; do not depend on data from other tests.
- **Stub flaky third parties** (\`page.route\` / \`cy.intercept\`) when they are not what you are testing.
- **Never use fixed sleeps** (\`waitForTimeout(3000)\`). Wait for a condition instead.
- Turn on traces/videos on failure in CI, and use limited retries only as a safety net while you fix the root cause.

Playwright has grown very popular in recent years for new projects, but both are solid; the right answer in an interview is the trade-offs, not a winner.`,
      why: `Unit and integration tests cannot prove the full system works: frontend + backend + DB + auth + deployment config. E2E tests catch things like a wrong API URL in production config, a broken CORS header, or a button hidden behind a cookie banner.`,
      analogy: `An E2E tool is a robot customer. It walks into your shop (opens the browser), picks products, pays and checks the receipt — exactly what a human would do, but every night, without getting bored.`,
      code: [
        {
          title: 'Playwright test',
          lang: 'typescript',
          code: `import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth/user.json' }); // already logged in (saved session)

test('user can add a book to the cart and checkout', async ({ page }) => {
  await page.goto('/books');
  await page.getByRole('button', { name: 'Add "Clean Code" to cart' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('1'); // auto-waits

  // Fake the payment provider so the test is stable
  await page.route('**/api/payments', (route) =>
    route.fulfill({ status: 200, json: { status: 'succeeded' } }),
  );

  await page.getByRole('link', { name: 'Checkout' }).click();
  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
});`,
        },
        {
          title: 'Same flow in Cypress',
          lang: 'javascript',
          code: `describe('checkout', () => {
  beforeEach(() => {
    cy.session('user', () => {
      cy.request('POST', '/api/login', { email: 'e2e@test.com', password: 'secret' });
    });
    cy.intercept('POST', '/api/payments', { statusCode: 200, body: { status: 'succeeded' } }).as('pay');
  });

  it('adds a book and pays', () => {
    cy.visit('/books');
    cy.contains('button', 'Add "Clean Code" to cart').click();
    cy.get('[data-testid="cart-count"]').should('have.text', '1');
    cy.contains('a', 'Checkout').click();
    cy.contains('button', 'Pay now').click();
    cy.wait('@pay');
    cy.contains('h1', 'Order confirmed').should('be.visible');
  });
});`,
        },
      ],
      output: `Both tests open a real browser with a logged-in session, add a book, check the cart badge shows 1, fake the payment call, and confirm the "Order confirmed" heading is visible.

Notice there are no sleeps: \`toHaveText\` (Playwright) and \`should\` (Cypress) retry until the condition is true or a timeout is hit. Faking only the payment route keeps the rest of the stack real while removing the most flaky, external part.`,
      questions: [
        {
          q: 'Cypress vs Playwright — how do you choose?',
          a: 'Playwright: multiple browsers including WebKit, multi-tab and multi-user, parallel by default, standard async/await. Cypress: excellent interactive debugging and a developer-friendly runner. Choose based on browser needs, team experience and CI setup.',
        },
        {
          q: 'How do you avoid logging in through the UI in every E2E test?',
          a: 'Log in once through the API and reuse the session: Playwright `storageState` or Cypress `cy.session`. Only the login test itself uses the login form.',
        },
        {
          q: 'How do you make E2E tests less flaky?',
          a: 'Use auto-waiting assertions instead of sleeps, stable role/test-id selectors, isolated seeded data per test, stub unstable third parties, and record traces on failure to find root causes.',
        },
        {
          q: 'What is auto-waiting?',
          a: 'Before acting or asserting, the tool waits until the element exists, is visible, enabled and stable, retrying up to a timeout. This removes most manual waits.',
        },
      ],
      spoken: `"I've used both Cypress and Playwright for E2E tests. Both drive a real browser and auto-wait for elements. Playwright supports Chromium, Firefox and WebKit, runs tests in parallel and uses normal async-await, and its trace viewer is great for debugging CI failures. Cypress has a very nice interactive runner. In either tool I select elements by role or test id, log in through the API and reuse the session, seed data per test, stub unstable third parties like payments, and never use fixed sleeps. I keep the E2E suite small and focused on critical flows like login and checkout."`,
      mistakes: [
        'Using `cy.wait(5000)` or `page.waitForTimeout(5000)`. It is slow and still flaky. Wait for a condition.',
        'Selecting by CSS classes like `.btn-primary-2`, which change when styling changes.',
        'Logging in through the UI in every test, which makes the suite slow.',
        'Follow-up trap: "Are Cypress commands promises? Can you await them?" No. Cypress commands are queued and run later; you chain them with `.then()` and `.should()`, not `await`.',
      ],
      takeaway: 'E2E tools act like a robot user — keep the suite small, use stable selectors, API logins and auto-waits, never sleeps.',
    },
    {
      id: 'tdd',
      title: 'TDD: Red, Green, Refactor',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Write a failing test first (red), write the simplest code to pass (green), then clean up the code with the test as a safety net (refactor).',
      what: `**TDD (Test-Driven Development)** means you write the test **before** the code, in small loops:

1. **Red** — write a small test for the next behaviour. Run it. It fails (because the code does not exist yet).
2. **Green** — write the **simplest** code that makes it pass. Do not add extra features.
3. **Refactor** — clean up names, remove duplication, improve design. Run tests again; they must stay green.

Repeat with the next small behaviour.

#### Deeper version
TDD is really a **design** technique. Writing the test first forces you to think about the API from the caller\'s side: what goes in, what comes out, what errors happen. Code written this way tends to be smaller, more modular and easier to test, because untestable code is painful to write test-first.

Seeing the test fail first matters: it proves the test can actually catch a problem. A test that has never failed might be testing nothing.

Where TDD shines: pure business logic, bug fixes (write a test that reproduces the bug first), algorithms, parsers, validation rules.

Where it is harder: exploratory UI work, spikes and prototypes when you do not know yet what you are building, and heavy third-party integrations. Many teams use TDD selectively, not for every line. Being honest about this in an interview sounds more experienced than claiming you TDD everything.`,
      why: `TDD gives fast feedback, keeps code simple (you only write what a test needs), and leaves a full test suite behind as a side effect. It is especially powerful for bug fixes: the failing test proves the bug exists and stays as a guard against it coming back (a regression test).`,
      analogy: `TDD is like writing the exam questions before studying. First you write the question you must be able to answer (red). Then you learn just enough to answer it (green). Then you organise your notes neatly (refactor). You never study things that are not on the exam.`,
      code: [
        {
          title: 'TDD a password rule in three loops',
          lang: 'javascript',
          code: `// LOOP 1 — RED: test first; validatePassword does not exist yet -> fails
test('rejects passwords shorter than 8 characters', () => {
  expect(validatePassword('abc')).toEqual({ ok: false, reason: 'too short' });
});
// GREEN: simplest code
// export const validatePassword = (p) =>
//   p.length < 8 ? { ok: false, reason: 'too short' } : { ok: true };

// LOOP 2 — RED: a new rule
test('requires at least one number', () => {
  expect(validatePassword('abcdefgh')).toEqual({ ok: false, reason: 'needs a number' });
});

// LOOP 3 — RED: the happy path
test('accepts a valid password', () => {
  expect(validatePassword('abcdefg1')).toEqual({ ok: true });
});

// GREEN + REFACTOR: final, clean version — all three tests pass
const rules = [
  { check: (p) => p.length >= 8, reason: 'too short' },
  { check: (p) => /[0-9]/.test(p), reason: 'needs a number' },
];
function validatePassword(p) {
  const failed = rules.find((r) => !r.check(p));
  return failed ? { ok: false, reason: failed.reason } : { ok: true };
}`,
        },
      ],
      output: `Loop 1: the first test fails (red) because the function does not exist. The one-line ternary makes it pass (green).

Loop 2: "abcdefgh" is long enough, so the simple version returns \`{ ok: true }\` and the new test fails (red). We add the number rule (green).

Loop 3 plus refactor: once the if/else grows, we refactor into a \`rules\` array. All three tests still pass, which proves the refactor did not change behaviour. Adding a new rule later is one new test plus one new line.`,
      questions: [
        {
          q: 'What is TDD?',
          a: 'Test-Driven Development: write a failing test, write the minimum code to pass it, then refactor while keeping tests green. Repeat in small steps.',
        },
        {
          q: 'Why should you see the test fail first?',
          a: 'To prove the test can detect the missing behaviour. A test that passes before the code exists is probably testing the wrong thing.',
        },
        {
          q: 'Do you use TDD all the time?',
          a: 'Be honest and practical: I use it for business logic, validation, algorithms and bug fixes. For exploratory UI work or prototypes, I often write tests right after the code once the design is clear.',
        },
        {
          q: 'How does TDD help with bug fixes?',
          a: 'First write a test that reproduces the bug and fails. Fix the code until it passes. The test stays in the suite as a regression test so the bug cannot come back silently.',
        },
      ],
      spoken: `"TDD is red, green, refactor. I write a small failing test for the next behaviour, then the simplest code to make it pass, then I clean up the design while the tests stay green. It pushes me to think about the API from the caller's side and keeps the code small. I use it most for business logic like pricing or validation rules, and always for bug fixes — I first write a test that reproduces the bug, then fix it, so it never comes back. For exploratory UI or prototypes I'm more flexible and add tests once the design settles."`,
      mistakes: [
        'Writing a big test, then a big implementation. TDD works in very small steps.',
        'Skipping the refactor step, so the code passes but stays messy.',
        'Writing more code than the test needs ("I will need this later"). Let the next test drive it.',
        'Follow-up trap: "What is BDD?" Behaviour-Driven Development is a style of TDD that describes behaviour in business language, often as Given/When/Then scenarios (tools like Cucumber), so non-developers can read the specs.',
      ],
      takeaway: 'Red, green, refactor in tiny steps — the test drives the design, and every bug fix starts with a failing test.',
    },
    {
      id: 'tests-in-ci',
      title: 'Running Tests in CI',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Every push and pull request runs install, lint, type-check, tests and build on a clean machine. Branch protection blocks merging when anything fails.',
      what: `**CI (Continuous Integration)** means every push or pull request is automatically checked on a clean server. Common tools: GitHub Actions, GitLab CI, CircleCI, Jenkins.

A typical Node pipeline:
1. Check out the code.
2. Install exact dependencies with \`npm ci\`.
3. Lint (ESLint) and type-check (\`tsc --noEmit\`).
4. Run unit and integration tests (with coverage).
5. Build the app.
6. (Optional) Run E2E tests against a preview or staging deploy.

If any step fails, the pull request shows a red ✗ and **branch protection** stops it from being merged.

#### Deeper version
Making CI fast and reliable:
- **Cache** dependencies (\`actions/setup-node\` with \`cache: 'npm'\`) and binaries like the MongoDB memory server or Playwright browsers.
- **Run jobs in parallel** (lint, unit tests, E2E as separate jobs) and **shard** big suites (\`jest --shard=1/3\`, \`playwright test --shard=1/4\`).
- Use a **matrix** to test several Node versions if you publish a library.
- Use **service containers** for a real MongoDB/Redis/Postgres when needed.
- Keep secrets in the CI secret store, never in the repo. Pull requests from forks do not get secrets by default.
- Upload artifacts on failure: coverage reports, JUnit XML, Playwright traces and screenshots.
- Fail fast: run quick checks first.
- \`CI=true\` is set automatically by most providers; Jest then runs in CI mode (no watch, no writing new snapshots).`,
      why: `"It works on my machine" is not proof. CI runs the same checks for every change on a clean environment, so broken code is caught before it reaches main, and nobody has to remember to run the tests.`,
      analogy: `CI is the security check at an airport. Every passenger (commit) goes through the same scanner, every time, no matter how trusted they are. If something is wrong, they do not board the plane (merge into main).`,
      code: [
        {
          title: '.github/workflows/ci.yml',
          lang: 'yaml',
          code: `name: CI
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
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npx jest --ci --coverage --shard=\${{ matrix.shard }}/2
        env:
          JWT_SECRET: \${{ secrets.TEST_JWT_SECRET }}
      - run: npm run build
    strategy:
      matrix:
        shard: [1, 2]

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/`,
        },
      ],
      output: `On every pull request, GitHub starts two copies of the \`test\` job (shard 1 and 2), each running half of the Jest tests after lint, type-check and install. The JWT secret comes from GitHub secrets. If they pass, the \`e2e\` job runs Playwright. If E2E fails, the HTML report with traces and screenshots is uploaded so you can see what went wrong.

With branch protection requiring these checks, the "Merge" button stays disabled until everything is green.`,
      questions: [
        {
          q: 'What steps does your CI pipeline run?',
          a: 'Install with `npm ci`, lint, type-check, unit and integration tests with coverage, build, and then E2E tests on a preview or staging environment. Failure in any step blocks the merge.',
        },
        {
          q: 'Why use npm ci instead of npm install in CI?',
          a: '`npm ci` installs exactly what is in package-lock.json, fails if it does not match package.json, and starts from a clean node_modules. It is faster and reproducible.',
        },
        {
          q: 'How do you make a slow test suite faster in CI?',
          a: 'Cache dependencies and binaries, run jobs in parallel, shard tests across machines, run only affected tests in monorepos, and move slow E2E tests to a separate job or schedule.',
        },
        {
          q: 'How do you handle secrets in CI tests?',
          a: 'Store them in the CI secret store and pass them as environment variables. Use separate test credentials, never production keys, and never print them in logs.',
        },
      ],
      spoken: `"In my projects every pull request runs a GitHub Actions pipeline: npm ci for a clean, exact install, then ESLint, a TypeScript type-check, Jest unit and integration tests with coverage, and the build. E2E tests with Playwright run in a separate job, and I upload traces and screenshots when they fail. I cache npm and binaries, and shard the test suite when it grows. Secrets come from the CI secret store, not the repo. Branch protection requires these checks to pass, so nothing broken can be merged into main."`,
      mistakes: [
        'Using `npm install` in CI, which can update the lock file and give different versions than local.',
        'Putting secrets in the workflow file or printing env variables in logs.',
        'Letting a flaky test stay "allowed to fail" forever. People start ignoring red builds.',
        'Follow-up trap: "What is the difference between continuous delivery and continuous deployment?" Delivery: every change is always ready to release, but a human presses the button. Deployment: every change that passes the pipeline goes to production automatically.',
      ],
      takeaway: 'CI runs the same lint, type-check, tests and build on every PR — and branch protection makes green the only way to merge.',
    },
    {
      id: 'testing-hooks-context',
      title: 'Testing Custom Hooks, Context and Providers',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Use renderHook for custom hooks, and a custom render helper that wraps components in the providers they need (router, React Query, theme, auth).',
      what: `Real components rarely live alone. They need **providers**: a router, a React Query client, a Redux store, an auth or theme context. If you render them without these, they crash.

Two common tools:

- **Custom render** — a helper that wraps the component in all needed providers. Tests call \`renderWithProviders(<Cart />)\` instead of \`render(<Cart />)\`.
- **renderHook** — from \`@testing-library/react\`. It runs a custom hook inside a tiny test component and gives you \`result.current\` (the latest return value).

#### Deeper version
For hooks that change state, wrap the update in \`act()\` so React applies it before you assert. For async hooks (data fetching), use \`await waitFor(() => expect(result.current.isSuccess).toBe(true))\`.

For **React Query**, create a **new QueryClient per test** and turn off retries (\`retry: false\`), otherwise failed requests retry and tests become slow, and cache leaks between tests.

For **Redux Toolkit**, create a fresh store per test with \`configureStore\` and optional \`preloadedState\`.

For the **router**, wrap with \`MemoryRouter\` (React Router) and pass \`initialEntries\` to start on a specific URL. In Next.js App Router, \`next/navigation\` hooks usually need to be mocked in unit tests; check the current Next.js testing docs because the recommended setup changes between versions.

Often the best test of a hook is through a **real component** that uses it — that is closer to how users experience it. Use \`renderHook\` for reusable hooks with logic of their own.`,
      why: `Most real bugs appear when components work with their context: wrong cache key, a provider missing, a hook returning stale data. A shared custom render keeps every test short and makes sure test setup matches the real app.`,
      analogy: `A component is like a phone app that needs Wi-Fi, a login and location access to work. A custom render is a "test phone" that already has all of these switched on, so every test can just open the app and use it.`,
      code: [
        {
          title: 'renderHook for a custom hook',
          lang: 'jsx',
          code: `// useCounter.js
import { useState } from 'react';
export function useCounter(start = 0) {
  const [count, setCount] = useState(start);
  return { count, inc: () => setCount((c) => c + 1), reset: () => setCount(start) };
}

// useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('increments and resets', () => {
  const { result } = renderHook(() => useCounter(5));
  act(() => result.current.inc());
  expect(result.current.count).toBe(6);
  act(() => result.current.reset());
  expect(result.current.count).toBe(5);
});`,
        },
        {
          title: 'A custom render with providers',
          lang: 'jsx',
          code: `// test-utils.jsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/auth';

export function renderWithProviders(ui, { route = '/', user = { name: 'Asha' } } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

// Header.test.jsx
test('shows the logged-in user name', () => {
  renderWithProviders(<Header />, { user: { name: 'Ravi' } });
  expect(screen.getByText('Hi, Ravi')).toBeInTheDocument();
});`,
        },
      ],
      output: `In the hook test, \`result.current.count\` starts at 5, becomes 6 after \`inc\`, and goes back to 5 after \`reset\`. \`act\` makes React finish the state update before we read \`result.current\`.

In the provider test, \`Header\` gets a fresh QueryClient (no shared cache, no retries), a fake user from context and a router on \`/\`. It renders "Hi, Ravi". Every test file can reuse \`renderWithProviders\` with different options instead of repeating the wrappers.`,
      questions: [
        {
          q: 'How do you test a custom React hook?',
          a: 'With `renderHook` from `@testing-library/react`: read `result.current`, wrap state updates in `act`, and use `waitFor` for async results. Or test it through a component that uses it.',
        },
        {
          q: 'How do you test a component that needs a router, store or context?',
          a: 'Write a custom render helper that wraps the component in the needed providers — a fresh store/QueryClient per test, MemoryRouter with a start route, and a test value for context.',
        },
        {
          q: 'Why create a new QueryClient in every test?',
          a: 'To avoid cached data leaking between tests, and to set `retry: false` so error cases fail fast instead of retrying.',
        },
        {
          q: 'What does act() do?',
          a: 'It makes sure React processes all state updates and effects from an action before your assertions run. RTL helpers already wrap their actions in act, so you mainly need it with renderHook calls.',
        },
      ],
      spoken: `"For custom hooks I use renderHook from React Testing Library, call the returned functions inside act, and assert on result.current. For async hooks I use waitFor. For components that need context, I keep a renderWithProviders helper that wraps them in a fresh QueryClient with retries off, a Redux store if needed, an auth context and a MemoryRouter with a starting route. That keeps tests short, avoids cache leaking between tests, and makes the setup match the real app. If a hook is only used by one component, I usually test it through that component instead."`,
      mistakes: [
        'Sharing one QueryClient or Redux store across tests, so state leaks and tests depend on order.',
        'Leaving React Query retries on, which makes error tests slow and sometimes time out.',
        'Reading `result.current` into a variable and expecting it to update. Always read `result.current` again after an update.',
        'Follow-up trap: "Where did renderHook come from?" It used to be in `@testing-library/react-hooks`; it is now part of `@testing-library/react` (v13.1+), and the old package is deprecated for React 18+.',
      ],
      takeaway: 'renderHook for reusable hooks, a custom render with fresh providers for components — never share stores between tests.',
    },
    {
      id: 'logging-monitoring',
      title: 'Logging, Monitoring and Error Tracking (Sentry)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Structured JSON logs with request IDs, metrics and alerts on what users feel, and error tracking (Sentry) with stack traces — so you find production bugs before users report them.',
      what: `Tests catch bugs **before** release. Logging and monitoring catch bugs **after** release, in production.

- **Logging** — writing events: "user 42 paid order 99", "Stripe call failed". Use a logger like **pino** or **winston**, not \`console.log\`.
- **Structured logs** — logs as JSON with fields (\`level\`, \`msg\`, \`userId\`, \`requestId\`), so you can search "all errors for requestId abc".
- **Log levels** — \`debug\`, \`info\`, \`warn\`, \`error\`, \`fatal\`. Production usually shows \`info\` and above.
- **Metrics** — numbers over time: requests per second, error rate, latency (p95), CPU, memory.
- **Alerts** — rules that notify the on-call person: "error rate above 2% for 5 minutes".
- **Error tracking** — tools like **Sentry** catch exceptions with stack trace, browser, user and release version, and group duplicates.

#### Deeper version
The three pillars of **observability**: **logs** (what happened), **metrics** (how much/how fast) and **traces** (the path of one request across services). OpenTelemetry is the common open standard for traces and metrics.

Good practices:
- Add a **request/correlation ID** to every log line of a request (and pass it to downstream services) so you can follow one request.
- **Never log secrets or personal data**: passwords, tokens, full card numbers. Use redaction (pino has a \`redact\` option).
- Alert on **symptoms users feel** (error rate, latency, failed payments), not on every warning — too many alerts cause "alert fatigue" and people ignore them.
- Upload **source maps** to Sentry so minified frontend stack traces become readable; tag errors with the **release** so you know which deploy broke things.
- Use **SLOs** (service level objectives), for example "99.9% of checkout requests succeed", to decide when to alert.
- Health check endpoints (\`/health\`) for load balancers and uptime monitors.

Common tools: CloudWatch (AWS), Cloud Logging/Monitoring (GCP), Datadog, Grafana + Prometheus + Loki, ELK, Sentry.`,
      why: `No test suite catches everything. Real users, real data and real traffic find new bugs. Without good logs and alerts you learn about problems from angry customers, and you cannot debug them because you do not know what happened.`,
      analogy: `Logs are a plane's black box: a detailed record of what happened. Metrics are the cockpit dashboard: speed, height, fuel. Alerts are the warning lights and alarms. Sentry is the mechanic's report that says exactly which part failed and on which flight.`,
      code: [
        {
          title: 'Structured logging with pino and a request ID',
          lang: 'javascript',
          code: `import express from 'express';
import pino from 'pino';
import { randomUUID } from 'node:crypto';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'password', 'card.number'], // never log secrets
});

const app = express();
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  req.log = logger.child({ requestId: req.id }); // every line carries the id
  res.setHeader('x-request-id', req.id);
  next();
});

app.post('/orders', async (req, res) => {
  req.log.info({ userId: 42, items: 3 }, 'creating order');
  try {
    // ... create order ...
    res.status(201).json({ ok: true });
  } catch (err) {
    req.log.error({ err }, 'order creation failed');
    res.status(500).json({ error: 'Something went wrong', requestId: req.id });
  }
});`,
        },
        {
          title: 'Sentry in an Express app',
          lang: 'javascript',
          code: `// instrument.js — load this before other imports (check Sentry docs for your SDK version)
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.GIT_SHA,   // which deploy caused the error
  tracesSampleRate: 0.1,          // send 10% of performance traces
});

// app.js
import * as Sentry from '@sentry/node';
// ... routes ...
Sentry.setupExpressErrorHandler(app); // after all routes (recent SDK versions)

// Inside code you can also report handled errors with extra context:
// Sentry.captureException(err, { tags: { feature: 'checkout' }, user: { id: userId } });`,
        },
      ],
      output: `A log line from pino looks like:

\`{"level":30,"time":1700000000000,"requestId":"9f1c...","userId":42,"items":3,"msg":"creating order"}\`

Because it is JSON, CloudWatch or Datadog can filter by \`requestId\` and show every line of that one request. The \`authorization\` header and passwords are replaced with \`[Redacted]\`. When a user reports an error, they can share the \`requestId\` from the response.

When an unhandled error happens, Sentry receives it with the stack trace, environment, release (git SHA) and request info, groups it with similar errors, and can alert the team in Slack. Note the exact Express setup function has changed across Sentry SDK major versions, so check the docs for your version.`,
      questions: [
        {
          q: 'What is structured logging and why use it?',
          a: 'Logging events as JSON objects with fields instead of plain text. Log tools can then filter and aggregate by field — for example all errors for one requestId or userId.',
        },
        {
          q: 'What is the difference between logging, monitoring and error tracking?',
          a: 'Logging records individual events. Monitoring tracks metrics over time and alerts on thresholds. Error tracking (like Sentry) captures exceptions with stack traces and context and groups them.',
        },
        {
          q: 'What should you never log?',
          a: 'Passwords, tokens, API keys, full card numbers, and unnecessary personal data. Use redaction in the logger and review logs in code review.',
        },
        {
          q: 'How do you debug one failing request across several services?',
          a: 'Use a correlation/request ID that is created at the edge, passed in headers to every service and added to every log line. Distributed tracing (OpenTelemetry) shows the full path and timing.',
        },
        {
          q: 'What would you alert on?',
          a: 'User-facing symptoms: error rate, high p95 latency, failed payments, health checks failing, queue backlog. Not on every single warning, to avoid alert fatigue.',
        },
      ],
      spoken: `"In production I use a structured logger like pino, so every log line is JSON with fields like level, message, userId and a request ID. That ID is added by middleware, returned in the response header and passed to other services, so I can follow one request end to end in CloudWatch or Datadog. I redact secrets like auth headers and passwords. For errors I use Sentry with the release version and source maps, so I see the exact stack trace and which deploy caused it. And I set alerts on user-facing symptoms like error rate, latency and failed payments, not on every warning."`,
      mistakes: [
        'Using `console.log` strings everywhere. They are hard to search and have no levels or context.',
        'Logging full request bodies with passwords, tokens or card data.',
        'Alerting on everything, so the team gets used to ignoring alerts.',
        'Shipping frontend code to Sentry without source maps, so stack traces point to minified code.',
        'Follow-up trap: "What is the difference between p50 and p95 latency?" p50 is the median request. p95 means 95% of requests are faster than this value — it shows the slow experience that averages hide.',
      ],
      takeaway: 'Structured logs with request IDs, metrics with symptom-based alerts, and Sentry with releases and source maps — that is how you see production.',
    },
    {
      id: 'contract-testing-pact',
      title: 'Contract Testing (Pact)',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'The consumer writes down exactly what it expects from an API (the contract); the provider runs that contract against its real code. Catches breaking API changes without full E2E.',
      what: `When a frontend or one microservice (**consumer**) calls another service (**provider**), both sides must agree on the API shape: URLs, fields, types, status codes. That agreement is the **contract**.

**Contract testing** checks the agreement automatically:

1. **Consumer test** — the consumer team writes a test with **Pact**: "when I call GET /users/1, I expect 200 with \`{ id: number, name: string }\`". Pact starts a mock provider, runs the consumer code against it, and saves the expectations into a **pact file** (JSON).
2. **Provider verification** — the provider team runs that pact file against the **real** provider API. If the provider removed \`name\` or changed it to \`fullName\`, verification fails.

#### Deeper version
This is called **consumer-driven contract testing**: consumers say what they actually use, so providers know which changes are safe. A provider can freely add fields or change fields nobody uses.

**Pact Broker** (or PactFlow) stores pact files and verification results. The \`can-i-deploy\` command checks, before a deploy, whether this version of a service is compatible with the versions of other services already in production.

**Provider states** ("given user 1 exists") let the provider set up the right data before each interaction is verified.

Contract tests vs E2E: contract tests run fast and independently for each service, without deploying everything together. They check **shape and agreement**, not business logic.

When it is worth it: many services owned by different teams, or public/mobile clients you cannot update instantly. For a single MERN app in one repo, shared TypeScript types, OpenAPI schemas or tRPC often give similar safety more cheaply.`,
      why: `In microservices, the classic bug is: team B renames a field, all of B's tests pass, and team A's service breaks in production. E2E tests across all services could catch it, but they are slow and fragile. Contract tests catch it in minutes, in the provider's own CI.`,
      analogy: `It is like a written agreement between a restaurant and its vegetable supplier: "every Monday, 20 kg tomatoes, in boxes of 5 kg". The restaurant writes what it needs. Before the supplier changes its box size, it checks the agreement. Nobody needs to do a full dinner service to find out the boxes no longer fit the shelves.`,
      code: [
        {
          title: 'Consumer test (pact-js, V3 style)',
          lang: 'javascript',
          code: `import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { getUser } from './userClient.js'; // our real API client
const { like, integer } = MatchersV3;

const provider = new PactV3({ consumer: 'web-app', provider: 'user-service' });

test('gets a user by id', () => {
  provider
    .given('user 1 exists')
    .uponReceiving('a request for user 1')
    .withRequest({ method: 'GET', path: '/users/1' })
    .willRespondWith({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { id: integer(1), name: like('Asha') }, // type matters, not exact value
    });

  return provider.executeTest(async (mockServer) => {
    const user = await getUser(mockServer.url, 1);
    expect(user.name).toBe('Asha');
  });
});
// Writes pacts/web-app-user-service.json`,
        },
        {
          title: 'Provider verification and can-i-deploy',
          lang: 'bash',
          code: `# In user-service CI: verify all pacts from the broker against the running provider
# (usually done with the Verifier class in a test file; options vary by Pact version)

# Before deploying web-app to production:
pact-broker can-i-deploy --pacticipant web-app --version $GIT_SHA --to-environment production`,
        },
      ],
      output: `The consumer test runs our real \`getUser\` client against Pact's mock server. If it passes, Pact writes a pact file saying: "web-app needs GET /users/1 to return 200 with an integer \`id\` and a string \`name\`".

In the provider's CI, the verifier replays that request against the real user-service (after setting up the state "user 1 exists"). If someone renamed \`name\` to \`fullName\`, verification fails before deploy. \`can-i-deploy\` asks the broker whether these exact versions are known to work together.`,
      questions: [
        {
          q: 'What is contract testing?',
          a: 'Testing the agreement between a consumer and a provider of an API. The consumer records what it expects; the provider verifies its real API meets those expectations.',
        },
        {
          q: 'What does "consumer-driven" mean?',
          a: 'The contracts come from the consumers and include only what they actually use. Providers then know exactly which fields and endpoints they cannot break.',
        },
        {
          q: 'How is contract testing different from E2E testing?',
          a: 'Contract tests run each side separately and fast, checking only request/response shape. E2E tests deploy everything together and check full user flows; they are slower and more fragile.',
        },
        {
          q: 'When would you not use Pact?',
          a: 'For a small app with one backend and one frontend in the same repo. Shared TypeScript types, OpenAPI validation or tRPC usually give enough safety with less setup.',
        },
      ],
      spoken: `"Contract testing checks the agreement between an API consumer and provider. With Pact, the consumer writes a test describing the requests it makes and the response shape it needs. Pact runs our real client against a mock and saves that as a pact file. The provider team then verifies the pact against their real API in CI, so if they rename a field we depend on, their build fails before deploy. A Pact Broker stores contracts, and can-i-deploy checks compatibility. It's most useful with many services and teams; in a single repo, shared types or OpenAPI are often enough."`,
      mistakes: [
        'Putting exact values in the contract instead of type matchers, so it breaks whenever test data changes.',
        'Using contract tests to check business logic. They check shape and agreement; logic belongs in the provider\'s own tests.',
        'Adding Pact to a small single-team app where shared types would be simpler.',
        'Follow-up trap: "Who owns the contract?" The consumer writes it, but both teams own the relationship — the provider must run verification in CI, or the contract protects nothing.',
      ],
      takeaway: 'Consumers write down what they need, providers prove they still provide it — catching breaking API changes without full E2E.',
    },
    {
      id: 'flaky-tests',
      title: 'Flaky Tests: Causes and Fixes',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'A flaky test passes and fails on the same code. Common causes: timing, shared state, test order, real network, dates and randomness. Find the root cause instead of adding retries.',
      what: `A **flaky test** sometimes passes and sometimes fails, **without any code change**. It is dangerous because people stop trusting the test suite and start clicking "re-run" without reading failures.

Most common causes:
- **Timing / race conditions** — the test checks before async work finishes; fixed \`sleep\` values.
- **Shared state** — tests use the same DB rows, global variables or mocks that were not reset.
- **Test order** — test B only passes if test A ran first.
- **Real network / third parties** — slow or down APIs.
- **Time and randomness** — \`new Date()\`, timezones, \`Math.random()\`, test at midnight or month end.
- **Resource limits in CI** — slower machines, parallel workers fighting over ports or the same database.
- **UI animations** and elements not yet ready (E2E).

#### Deeper version
How to investigate:
1. **Reproduce**: run the test many times in a loop (\`for i in {1..50}; do npx jest file || break; done\`), run in band (\`--runInBand\`) vs in parallel, and with a random order (\`--randomize\` in newer Jest versions).
2. **Collect evidence**: CI logs, Playwright traces and screenshots, timestamps.
3. **Fix the root cause**:
   - Replace sleeps with "wait for condition" (\`findBy\`, \`waitFor\`, Playwright auto-waiting assertions).
   - Give every test its own data (unique emails with a random suffix, clean DB per test or per worker).
   - Freeze time with fake timers / \`jest.setSystemTime\`; set \`TZ=UTC\` in the test environment.
   - Mock the network; seed random generators.
   - Always \`await\` promises; close connections in \`afterAll\`.
4. **Quarantine** if you cannot fix it right now: move it to a separate non-blocking job, create a ticket with an owner, and fix it soon. Do not delete it silently or leave it forever.

**Retries** (\`jest.retryTimes\`, Playwright \`retries\`) hide the problem. They are acceptable as a short-term safety net for E2E, but track tests that only pass on retry — Playwright marks them as "flaky" in the report.`,
      why: `One flaky test can make a whole team ignore red builds, and then real failures get merged. Flaky tests also waste hours of CI time and developer attention. Fixing flakiness is a common interview topic because it shows real-world testing experience.`,
      analogy: `A flaky test is like a smoke alarm that sometimes goes off when you make toast. After a few false alarms, everyone takes out the battery — and then the real fire is not detected. The fix is a better alarm, not ignoring it.`,
      code: [
        {
          title: 'Three flaky patterns and their fixes',
          lang: 'javascript',
          code: `// 1) TIMING — flaky: checks after a guessed delay
test('flaky: shows results', async () => {
  render(<Search />);
  await user.type(screen.getByRole('searchbox'), 'pen');
  await new Promise((r) => setTimeout(r, 500)); // maybe enough, maybe not
  expect(screen.getByText('Pen')).toBeInTheDocument();
});
// fixed: wait for the condition
test('stable: shows results', async () => {
  render(<Search />);
  await user.type(screen.getByRole('searchbox'), 'pen');
  expect(await screen.findByText('Pen')).toBeInTheDocument();
});

// 2) SHARED DATA — flaky when tests run in parallel against one DB
// await User.create({ email: 'test@x.com' }); // unique index clash between tests
const uniqueEmail = () => 'user-' + crypto.randomUUID() + '@test.com';
// await User.create({ email: uniqueEmail() });

// 3) DATES — flaky at midnight or month end
test('stable: trial ends in 14 days', () => {
  jest.useFakeTimers().setSystemTime(new Date('2025-01-31T10:00:00Z'));
  expect(trialEndDate().toISOString()).toBe('2025-02-14T10:00:00.000Z');
  jest.useRealTimers();
});`,
        },
        {
          title: 'Hunting a flaky test',
          lang: 'bash',
          code: `# run one file 30 times; stop at the first failure
for i in $(seq 1 30); do npx jest checkout.test.js --silent || break; done

# serial vs parallel: if it only fails in parallel, suspect shared state
npx jest --runInBand

# Playwright: repeat a test and keep traces
npx playwright test checkout.spec.ts --repeat-each=20 --trace=on`,
        },
      ],
      output: `1. The sleep-based test passes on a fast laptop and fails on a busy CI machine. \`findByText\` retries until the text appears, so it passes on both.
2. Two tests creating \`test@x.com\` at the same time hit the unique index in parallel runs. A unique email per test removes the clash.
3. \`trialEndDate()\` (which adds 14 days to now) depends on the real clock. With the time frozen at 31 January, the result is always 14 February, even when the test runs at midnight.

The loop commands give you a quick failure rate: if it fails 3 times out of 30, you have reproduced the flake and can test your fix the same way.`,
      questions: [
        {
          q: 'What is a flaky test and why is it a problem?',
          a: 'A test that passes and fails on the same code. It destroys trust in CI: people re-run or ignore red builds, so real bugs get through, and it wastes time.',
        },
        {
          q: 'What are common causes of flaky tests?',
          a: 'Timing and race conditions, fixed sleeps, shared state between tests, test-order dependence, real network calls, dates/timezones/randomness, and limited CI resources.',
        },
        {
          q: 'How do you fix a flaky test?',
          a: 'Reproduce it by running it many times, find the root cause, then fix it: wait for conditions, isolate data, mock time and network, and clean up resources. Quarantine with an owner if it cannot be fixed immediately.',
        },
        {
          q: 'Are retries a good solution?',
          a: 'Only as a temporary safety net, mostly for E2E. Retries hide real race conditions, which may also exist in production. Track and fix tests that pass only on retry.',
        },
      ],
      spoken: `"A flaky test passes and fails on the same code, which is dangerous because the team stops trusting CI. The usual causes are timing issues like fixed sleeps, shared data between tests, order dependence, real network calls, and dates or randomness. When I find one, I first reproduce it by running it in a loop, and compare running in band versus in parallel. Then I fix the root cause: wait for conditions with findBy or Playwright assertions, give each test unique data, freeze time, and mock the network. If I can't fix it right away, I quarantine it with a ticket and owner rather than just adding retries."`,
      mistakes: [
        'Adding `retries: 3` and calling it fixed. The race condition is still there, and might be a real production bug.',
        'Increasing sleep times. The test gets slower and still fails on a busier machine.',
        'Deleting or skipping the test without a ticket, so the behaviour loses coverage forever.',
        'Follow-up trap: "The test only fails in CI, never locally — what do you check?" Differences in speed, parallel workers, timezone, environment variables, Node version, data left over from other tests, and real network access in CI.',
      ],
      takeaway: 'Flaky tests come from timing, shared state, time and network — reproduce in a loop, fix the root cause, and never just add sleeps or retries.',
    },
    {
      id: 'testing-webhooks-jobs',
      title: 'Testing Webhooks, Queues and Background Jobs',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Test webhook handlers by sending signed fake events (and the same event twice); test jobs by calling the job function directly, and test retries and idempotency.',
      what: `Some code does not run because a user clicked something:
- **Webhooks** — another service (Stripe, GitHub) calls **your** API when something happens ("payment succeeded").
- **Background jobs / queues** — work done later by a worker (BullMQ, SQS, a cron job): sending emails, generating PDFs, calling an LLM.

How to test them:
1. **Keep the logic in a plain function** (\`handlePaymentSucceeded(event)\`, \`processInvoiceJob(data)\`). Unit/integration test that function directly — no queue needed.
2. **Test the webhook route** with supertest: a valid signature returns 200, a bad signature returns 400.
3. **Test idempotency**: send the **same event twice** and check only one order is created.
4. **Test failure and retry**: make a dependency fail and check the job throws (so the queue retries it) or is marked failed.

#### Deeper version
Stripe signs webhooks with a secret; your route verifies it with \`stripe.webhooks.constructEvent(rawBody, signature, secret)\`. Note this needs the **raw** request body, not parsed JSON — a classic production bug. In tests, Stripe's SDK provides \`stripe.webhooks.generateTestHeaderString(...)\` to create a valid signature header for a payload. For manual testing, the Stripe CLI can forward real test events to localhost (\`stripe listen\` and \`stripe trigger\`).

Webhook providers **retry** and may deliver events **more than once** and **out of order**. So handlers must be **idempotent**: store processed event IDs (unique index) and skip duplicates.

For queues, run a real Redis in CI (service container) for a few integration tests of the queue wiring, but test the job logic itself without the queue. Use fake timers for delayed jobs and backoff.`,
      why: `Payment and async flows are where money and data get lost: double orders from duplicate webhooks, missed emails from swallowed errors, jobs that never retry. These bugs are hard to see in normal UI testing, so they need targeted tests.`,
      analogy: `A webhook is like a courier ringing your doorbell with a parcel. You must check the courier's ID (signature), sign once, and if the same courier rings again with the same parcel number, you should say "already received" instead of paying twice.`,
      code: [
        {
          title: 'Idempotent webhook handler + tests',
          lang: 'javascript',
          code: `// handlePaymentSucceeded.js
export async function handlePaymentSucceeded(event, { ProcessedEvent, Order }) {
  try {
    await ProcessedEvent.create({ _id: event.id }); // unique _id -> duplicates throw
  } catch (err) {
    if (err.code === 11000) return { skipped: true }; // already handled
    throw err;
  }
  const pi = event.data.object;
  await Order.updateOne({ paymentIntentId: pi.id }, { status: 'paid' });
  return { skipped: false };
}

// handlePaymentSucceeded.test.js (with mongodb-memory-server running)
import { handlePaymentSucceeded } from './handlePaymentSucceeded.js';
import { ProcessedEvent, Order } from './models.js';

const event = { id: 'evt_1', type: 'payment_intent.succeeded', data: { object: { id: 'pi_1' } } };

test('marks the order as paid once, even if the event arrives twice', async () => {
  await Order.create({ paymentIntentId: 'pi_1', status: 'pending' });

  const first = await handlePaymentSucceeded(event, { ProcessedEvent, Order });
  const second = await handlePaymentSucceeded(event, { ProcessedEvent, Order });

  expect(first.skipped).toBe(false);
  expect(second.skipped).toBe(true);
  expect((await Order.findOne({ paymentIntentId: 'pi_1' })).status).toBe('paid');
});`,
        },
        {
          title: 'Signature check on the route with supertest',
          lang: 'javascript',
          code: `import Stripe from 'stripe';
import request from 'supertest';
import { app } from './app.js'; // route uses express.raw({ type: 'application/json' })

const stripe = new Stripe('sk_test_dummy');
const secret = process.env.STRIPE_WEBHOOK_SECRET; // test value set in jest setup
const event = { id: 'evt_2', type: 'payment_intent.succeeded', data: { object: { id: 'pi_2' } } };

test('accepts a correctly signed event', async () => {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  await request(app).post('/webhooks/stripe')
    .set('stripe-signature', header).set('Content-Type', 'application/json')
    .send(payload).expect(200);
});

test('rejects a bad signature', async () => {
  await request(app).post('/webhooks/stripe')
    .set('stripe-signature', 't=1,v1=bad').set('Content-Type', 'application/json')
    .send(JSON.stringify(event)).expect(400);
});`,
        },
      ],
      output: `In the idempotency test, the first call saves \`evt_1\` and marks the order paid. The second call fails to insert \`evt_1\` again (duplicate key error 11000), so the handler returns \`skipped: true\` and does nothing. The order is paid exactly once.

In the route tests, the generated header makes \`constructEvent\` succeed and the route returns 200. A fake signature makes verification throw, and the route returns 400. If the app accidentally used \`express.json()\` before this route, the first test would fail too — catching the raw-body bug before production.`,
      questions: [
        {
          q: 'How do you test a Stripe webhook handler?',
          a: 'Put the logic in a function and test it with fake events. Test the route with supertest using a generated valid signature and an invalid one. Use the Stripe CLI to send real test events locally.',
        },
        {
          q: 'Why must webhook handlers be idempotent, and how do you test it?',
          a: 'Providers retry and can send the same event more than once. Store processed event IDs with a unique index and skip duplicates. Test by sending the same event twice and checking the side effect happened once.',
        },
        {
          q: 'How do you test a background job?',
          a: 'Test the job processor as a plain async function with its dependencies injected or mocked. Check success, that failures throw so the queue retries, and use fake timers for delays. Add a few integration tests with a real Redis/queue for the wiring.',
        },
        {
          q: 'Why does Stripe signature verification need the raw body?',
          a: 'The signature is computed over the exact bytes Stripe sent. If a JSON parser changes the body first (spacing, key order), the signature no longer matches.',
        },
      ],
      spoken: `"For webhooks and jobs I keep the business logic in plain functions, so I can test them without Stripe or a queue. For a Stripe webhook I test three things: a correctly signed event returns 200, a bad signature returns 400, and the same event sent twice only creates one side effect — because Stripe can retry and deliver duplicates. I make handlers idempotent by storing processed event IDs with a unique index. For queue jobs I test the processor directly, check that failures throw so the queue retries, and use fake timers for backoff. Locally I use the Stripe CLI to trigger real test events."`,
      mistakes: [
        'Parsing the webhook body with `express.json()` before signature verification. Verification fails in production.',
        'Not testing duplicate events, then creating two orders when the provider retries.',
        'Catching and swallowing errors inside a job, so the queue thinks it succeeded and never retries.',
        'Follow-up trap: "What if events arrive out of order (refund before payment)?" Do not assume order; check current state before changing it, or fetch the latest object from the provider API, and test that case explicitly.',
      ],
      takeaway: 'Test async flows as plain functions, verify signatures, and always send the same event twice — idempotency is the real test.',
    },
    {
      id: 'load-performance-testing',
      title: 'Load and Performance Testing (k6, Artillery)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Simulate many users hitting your API to measure latency, throughput and error rate, find bottlenecks, and check your system meets its targets before real traffic arrives.',
      what: `Functional tests ask "does it work?". **Performance tests** ask "does it still work **fast** when many people use it?".

Types:
- **Load test** — expected normal traffic (for example 200 users at once). Does it meet targets?
- **Stress test** — push beyond normal until it breaks. Where is the limit, and how does it fail?
- **Spike test** — sudden jump (a sale starts, a push notification goes out).
- **Soak test** — normal load for hours. Finds memory leaks and slow resource exhaustion.

Common tools: **k6** (scripts in JavaScript), **Artillery** (YAML or JS), JMeter, Locust. For frontend speed: Lighthouse and Core Web Vitals.

#### Deeper version
Key numbers:
- **Throughput** — requests per second the system handles.
- **Latency percentiles** — p50, p95, p99. Averages hide slow users; p95/p99 show them.
- **Error rate** — percentage of failed requests.

Set **thresholds** (for example "p95 under 300 ms and errors under 1%") so the test passes or fails automatically and can run in CI or before big releases.

Good practice:
- Test against a **production-like** environment (same instance size, DB indexes, data volume), never production itself without planning.
- Watch server metrics during the test (CPU, memory, event loop lag, DB slow queries, connection pool) — the load tool shows symptoms, the metrics show the cause.
- Typical Node/Mongo bottlenecks: missing indexes, N+1 queries, blocking the event loop with CPU work (big JSON, sync crypto), small DB connection pool, no caching, third-party rate limits.
- Mock or sandbox paid third parties (Stripe, OpenAI) so the test does not cost money or get you rate-limited.`,
      why: `Many apps work perfectly with 5 testers and fall over on launch day. Load testing finds bottlenecks early, tells you how many servers you need, and proves that a performance fix actually helped.`,
      analogy: `Before opening a new bridge, engineers drive heavy trucks over it and measure how much it bends. They do not wait for rush hour to find out. A load test is those trucks for your API.`,
      code: [
        {
          title: 'k6 load test with thresholds',
          lang: 'javascript',
          code: `// load-test.js — run with: k6 run load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp up to 50 virtual users
    { duration: '3m', target: 200 },  // hold at higher load
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests under 300 ms
    http_req_failed: ['rate<0.01'],   // less than 1% errors
  },
};

export default function () {
  const res = http.get(__ENV.BASE_URL + '/api/products?page=1');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has products': (r) => r.json('items').length > 0,
  });
  sleep(1); // think time between user actions
}`,
        },
      ],
      output: `k6 runs virtual users that each call the products API about once per second, ramping from 0 to 50, then 200, then back down. At the end it prints a summary: total requests, requests per second, \`http_req_duration\` with avg/p90/p95, and the failure rate.

If p95 is 450 ms, the threshold fails and k6 exits with a non-zero code — so in CI the job goes red. Then you check server metrics: for example, a missing index on \`category\` makes MongoDB scan the whole collection, and adding it brings p95 down to 120 ms.`,
      questions: [
        {
          q: 'What is the difference between load, stress, spike and soak testing?',
          a: 'Load: expected traffic. Stress: beyond the limit to find the breaking point. Spike: a sudden jump in users. Soak: steady load for a long time to find leaks.',
        },
        {
          q: 'Why look at p95 or p99 instead of average latency?',
          a: 'Averages hide the slow requests. p95 means 95% of requests are faster than that value, so it shows what your slowest normal users experience.',
        },
        {
          q: 'Your API is slow under load. How do you find the bottleneck?',
          a: 'Run a load test while watching metrics: CPU, memory, event loop lag, DB slow query log and connection pool usage. Common fixes are indexes, removing N+1 queries, caching, moving CPU work off the event loop, and scaling horizontally.',
        },
        {
          q: 'Which tools have you used for load testing?',
          a: 'k6 or Artillery for APIs (scripted, thresholds, CI-friendly), and Lighthouse for frontend performance. Mention any real bottleneck you found and fixed.',
        },
      ],
      spoken: `"Load testing checks how the system behaves with many users, not just whether it works. I've used k6, where I write a JavaScript script, ramp virtual users up in stages, and set thresholds like p95 latency under 300 milliseconds and error rate under one percent, so it can pass or fail in CI. I look at p95 and p99 rather than averages. While it runs I watch server metrics — CPU, event loop lag, Mongo slow queries and connection pool — because the tool shows the symptom and the metrics show the cause. Missing indexes and N+1 queries are the usual culprits."`,
      mistakes: [
        'Load testing a tiny dev environment with an empty database and drawing conclusions about production.',
        'Looking only at average latency, which hides the slow tail.',
        'Calling real paid APIs (Stripe, OpenAI) during a load test — costs money and hits rate limits.',
        'Running a load test against production without warning the team or the hosting provider.',
        'Follow-up trap: "Throughput went up but latency also went up — is that bad?" Not always; it can mean the system is near capacity and requests are queueing. Find the point where latency starts rising sharply — that is your practical limit.',
      ],
      takeaway: 'Load tests measure p95 latency, throughput and errors under realistic traffic — set thresholds, and watch server metrics to find the real bottleneck.',
    },
  ],
  rapidFire: [
    { q: 'What are the three main test levels?', a: 'Unit, integration and end-to-end (E2E).' },
    { q: 'What does the test pyramid recommend?', a: 'Many unit tests, fewer integration tests, very few E2E tests.' },
    { q: 'What does the testing trophy emphasise?', a: 'Static checks at the base and most effort on integration tests.' },
    { q: 'What does AAA stand for?', a: 'Arrange, Act, Assert.' },
    { q: 'beforeAll vs beforeEach?', a: '`beforeAll` runs once per file/block; `beforeEach` runs before every test.' },
    { q: 'toBe vs toEqual?', a: '`toBe` checks identity (Object.is); `toEqual` checks deep equality.' },
    { q: 'How do you assert a function throws?', a: 'Wrap it: `expect(() => fn()).toThrow()`.' },
    { q: 'How do you assert an async function rejects?', a: '`await expect(fn()).rejects.toThrow()`.' },
    { q: 'What does expect.assertions(n) do?', a: 'Fails the test unless exactly n assertions ran.' },
    { q: 'How do you test setTimeout without waiting?', a: 'Use `jest.useFakeTimers()` and `jest.advanceTimersByTime(ms)`.' },
    { q: 'What is jest.fn()?', a: 'A fake function that records calls and can return what you choose.' },
    { q: 'What does jest.mock() do?', a: 'Replaces all exports of a module with mocks for that test file.' },
    { q: 'What does jest.spyOn() do?', a: 'Wraps an existing method to record calls, optionally replacing it; restore with `mockRestore`.' },
    { q: 'mockReset vs mockRestore?', a: '`mockReset` clears calls and implementation; `mockRestore` also puts the original method back.' },
    { q: 'Stub vs mock?', a: 'A stub returns canned data; a mock checks how it was called.' },
    { q: 'What is a fake?', a: 'A simple working implementation, like an in-memory DB or repository.' },
    { q: 'getBy vs queryBy vs findBy?', a: 'getBy throws if missing, queryBy returns null, findBy waits (promise).' },
    { q: 'Best RTL query to use first?', a: '`getByRole` with an accessible name.' },
    { q: 'user-event vs fireEvent?', a: 'user-event simulates full real interactions; fireEvent dispatches one DOM event.' },
    { q: 'How do you test a custom hook?', a: '`renderHook` from `@testing-library/react`, with `act` for updates.' },
    { q: 'What does supertest do?', a: 'Sends HTTP requests to your Express app in memory for API tests.' },
    { q: 'Why export app separately from server.listen?', a: 'So tests can import the app without opening a real port.' },
    { q: 'What is mongodb-memory-server?', a: 'A real MongoDB that runs in memory for tests and disappears afterwards.' },
    { q: 'Which class do you need to test Mongo transactions in memory?', a: '`MongoMemoryReplSet`, because transactions need a replica set.' },
    { q: 'nock vs MSW?', a: 'nock intercepts HTTP in Node; MSW intercepts in browser and Node with reusable handlers.' },
    { q: 'How do you block real network calls in tests?', a: '`nock.disableNetConnect()` or MSW `onUnhandledRequest: \'error\'`.' },
    { q: 'What does `jest -u` do?', a: 'Updates (overwrites) failing snapshots with the new output.' },
    { q: 'Main risk of snapshot tests?', a: 'Large snapshots nobody reviews, accepted blindly with `jest -u`.' },
    { q: 'Which coverage metric is most useful?', a: 'Branch coverage — it shows untested if/else paths.' },
    { q: 'Does 100% coverage mean no bugs?', a: 'No. It shows code ran, not that results were checked.' },
    { q: 'What is mutation testing?', a: 'Changing code on purpose to see if tests catch it (e.g. Stryker).' },
    { q: 'What are the TDD steps?', a: 'Red (failing test), Green (make it pass), Refactor.' },
    { q: 'First step when fixing a bug with TDD?', a: 'Write a test that reproduces the bug and fails.' },
    { q: 'Cypress vs Playwright in one line?', a: 'Playwright: multi-browser, parallel, async/await; Cypress: great interactive runner, chained commands.' },
    { q: 'How to log in quickly in E2E tests?', a: 'Log in via API and reuse the session (`storageState` / `cy.session`).' },
    { q: 'Why avoid fixed sleeps in tests?', a: 'They are slow and still flaky; wait for a condition instead.' },
    { q: 'What is a flaky test?', a: 'A test that passes and fails on the same code.' },
    { q: 'Top causes of flakiness?', a: 'Timing, shared state, test order, real network, dates and randomness.' },
    { q: 'Are retries a fix for flaky tests?', a: 'No, only a temporary safety net; fix the root cause.' },
    { q: 'What is contract testing?', a: 'Consumer records expected API shape; provider verifies its real API against it (Pact).' },
    { q: 'What does Pact can-i-deploy check?', a: 'Whether a service version is compatible with versions already in the target environment.' },
    { q: 'Postman collection vs environment?', a: 'Collection = saved requests; environment = variables like baseUrl and token.' },
    { q: 'What is Newman?', a: 'The CLI runner for Postman collections, used in CI.' },
    { q: 'How do you save a token in a Postman test script?', a: '`pm.environment.set(\'token\', pm.response.json().token)`.' },
    { q: 'Why `npm ci` in CI?', a: 'Clean, exact install from the lock file; fails if it does not match package.json.' },
    { q: 'What blocks merging a PR with failing tests?', a: 'Branch protection with required status checks.' },
    { q: 'How do you speed up a big test suite in CI?', a: 'Caching, parallel jobs and sharding (`--shard`).' },
    { q: 'What is structured logging?', a: 'Logs as JSON with fields, so they can be filtered and searched.' },
    { q: 'Why add a request ID to logs?', a: 'To follow one request across all log lines and services.' },
    { q: 'What does Sentry do?', a: 'Captures errors with stack traces, context and release, groups them, and alerts.' },
    { q: 'Why upload source maps to Sentry?', a: 'So minified frontend stack traces show original file names and lines.' },
    { q: 'What should alerts be based on?', a: 'User-facing symptoms: error rate, latency, failed payments.' },
    { q: 'p95 latency means?', a: '95% of requests are faster than this value.' },
    { q: 'Load vs stress test?', a: 'Load = expected traffic; stress = beyond the limit to find the breaking point.' },
    { q: 'How do you test webhook idempotency?', a: 'Send the same event twice and check the side effect happened once.' },
    { q: 'Ideal size of a pull request?', a: 'Small and focused — one logical change, usually a few hundred lines.' },
    { q: 'What should humans focus on in code review?', a: 'Correctness, security, design and tests — leave style to linters.' },
  ],
};
