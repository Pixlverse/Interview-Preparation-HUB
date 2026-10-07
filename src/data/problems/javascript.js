// Interview problems for the JavaScript stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'javascript',
  problems: [
    {
      id: 'closure-loop-output',
      title: 'What does this loop print?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'closures',
      question: `What is printed, and how do you fix it so it prints \`0 1 2\`?

\`\`\`javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
\`\`\``,
      hints: [
        'How many `i` variables exist when you use `var`? One per loop, or one in total?',
        'When do the `setTimeout` callbacks actually run — during the loop or after it finishes?',
      ],
      solution: `**Output:**

\`\`\`text
3
3
3
\`\`\`

**Why:** \`var\` is function-scoped, so there is only **one** \`i\` shared by all three callbacks. The callbacks run after the loop has finished, when \`i\` is already \`3\`.

**Fix 1 — use \`let\`** (a new \`i\` for every iteration):

\`\`\`javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0 1 2
}
\`\`\`

**Fix 2 — capture the value with an IIFE** (the pre-ES6 way):

\`\`\`javascript
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i); // 0 1 2
}
\`\`\``,
      followUps: [
        {
          q: 'Can you fix it without let or an IIFE?',
          a: 'Yes: `setTimeout` accepts extra arguments that are passed to the callback — `setTimeout((j) => console.log(j), 100, i)`.',
        },
        {
          q: 'Why does let fix it?',
          a: 'For `for (let ...)` loops, the spec creates a fresh binding of `i` for every iteration and copies the value in, so each closure captures its own `i`.',
        },
      ],
    },
    {
      id: 'sort-default-output',
      title: 'Why does sort() put 100 before 25?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'array-methods',
      question: `What does this print? Then fix both sorts so numbers go small → big and words go A → Z ignoring case.

\`\`\`javascript
const nums = [10, 1, 5, 100, 25];
console.log(nums.sort());

const words = ['banana', 'apple', 'Cherry'];
console.log(words.sort());

console.log(nums);
\`\`\``,
      hints: [
        'With no argument, `sort()` turns every item into a **string** before comparing.',
        'Strings are compared character by character using their code numbers. Uppercase letters have smaller codes than lowercase ones.',
        'Does `sort()` return a new array, or change the original one?',
      ],
      solution: `**Output:**

\`\`\`text
[ 1, 10, 100, 25, 5 ]
[ 'Cherry', 'apple', 'banana' ]
[ 1, 10, 100, 25, 5 ]
\`\`\`

**Why:**

- The default \`sort()\` compares items as **strings**. As text, \`"100"\` comes before \`"25"\` because \`"1"\` is smaller than \`"2"\` — just like a dictionary.
- In character codes, \`"C"\` (67) is smaller than \`"a"\` (97), so \`'Cherry'\` comes first.
- \`sort()\` **changes the original array** (it sorts "in place") and returns the same array. That is why the last line prints the sorted numbers too.

**Fix:**

\`\`\`javascript
const nums = [10, 1, 5, 100, 25];
// Compare function: negative -> a first, positive -> b first, 0 -> keep order
console.log([...nums].sort((a, b) => a - b)); // [ 1, 5, 10, 25, 100 ]

const words = ['banana', 'apple', 'Cherry'];
// localeCompare knows about letters; sensitivity 'base' ignores case
console.log([...words].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
// [ 'apple', 'banana', 'Cherry' ]

console.log(nums); // [ 10, 1, 5, 100, 25 ] — untouched, because we sorted a copy
\`\`\`

**Why it works:** \`a - b\` gives a negative number when \`a\` is smaller, so smaller numbers move first. Copying with \`[...nums]\` before sorting keeps the original array safe (important for React state).`,
      followUps: [
        {
          q: 'How do you sort numbers in descending order?',
          a: 'Swap the subtraction: `(a, b) => b - a`.',
        },
        {
          q: 'Is there a sort that does not mutate?',
          a: 'Yes, `arr.toSorted(compareFn)` (ES2023) returns a new sorted array. It works in modern browsers and recent Node versions; on older runtimes use `[...arr].sort(...)`.',
        },
        {
          q: 'How do you sort an array of objects by price?',
          a: '`products.toSorted((a, b) => a.price - b.price)`. For strings use `a.name.localeCompare(b.name)`.',
        },
      ],
    },
    {
      id: 'object-reference-output',
      title: 'Predict the output: object references',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'data-types',
      question: `What are the four values printed?

\`\`\`javascript
const a = { count: 1 };
const b = a;
b.count = 2;
console.log(a.count);

let c = { count: 1 };
let d = c;
d = { count: 5 };
console.log(c.count);

function update(obj) {
  obj.count = 10;
  obj = { count: 20 };
}
const e = { count: 1 };
update(e);
console.log(e.count);

console.log({ x: 1 } === { x: 1 });
\`\`\``,
      hints: [
        'A variable that holds an object does not hold the object itself. It holds a **reference** (an address) to it.',
        'Changing a property (`b.count = 2`) changes the shared object. Re-assigning the variable (`d = {...}`) only points that one variable somewhere else.',
      ],
      solution: `**Output:**

\`\`\`text
2
1
10
false
\`\`\`

**Why:**

1. \`b = a\` copies the **reference**, not the object. Both names point to the same object, so \`b.count = 2\` is visible through \`a\`.
2. \`d = { count: 5 }\` makes \`d\` point to a **new** object. \`c\` still points to the old one, so it stays \`1\`.
3. Inside \`update\`, \`obj\` starts as a copy of the reference. \`obj.count = 10\` changes the shared object. Then \`obj = { count: 20 }\` only re-points the local variable — the caller never sees it. So \`e.count\` is \`10\`.
4. \`===\` on objects compares **references**, not contents. Two separate object literals are two different objects, so the result is \`false\`.

**Simple rule:** "Mutating" (changing a property) is shared. "Re-assigning" (using \`=\` on the variable) is not.`,
      followUps: [
        {
          q: 'Is JavaScript pass-by-reference?',
          a: 'No. It is always pass-by-value, but for objects the value being copied is a reference. That is why mutation is visible to the caller but re-assignment is not.',
        },
        {
          q: 'How would you compare two objects by content?',
          a: 'Write a deep-equal function (compare keys and values recursively) or use a library like `lodash.isEqual`. `JSON.stringify(a) === JSON.stringify(b)` works only for simple data and fails if key order differs.',
        },
        {
          q: 'Why does this matter in React?',
          a: 'React compares state with `Object.is` (reference check). If you mutate an object and set the same reference, React thinks nothing changed and may skip the re-render. Always create a new object: `setUser({ ...user, name })`.',
        },
      ],
    },
    {
      id: 'hoisting-tdz-output',
      title: 'Predict the output: hoisting and the TDZ',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'hoisting',
      question: `What are the four lines printed?

\`\`\`javascript
console.log(a);
var a = 1;

console.log(greet());
function greet() {
  return 'hi';
}

try {
  console.log(b);
} catch (err) {
  console.log(err.name);
}
let b = 2;

try {
  sayBye();
} catch (err) {
  console.log(err.name);
}
var sayBye = function () {
  return 'bye';
};
\`\`\``,
      hints: [
        '"Hoisting" means the engine registers all declarations before running the code. But what value does each kind of declaration start with?',
        '`var` starts as `undefined`. A function declaration starts as the full function. `let`/`const` start "uninitialized" — touching them early throws.',
        'For `sayBye`, only the `var sayBye` part is hoisted, not the function on the right side.',
      ],
      solution: `**Output:**

\`\`\`text
undefined
hi
ReferenceError
TypeError
\`\`\`

**Why:**

1. \`var a\` is hoisted and set to \`undefined\`. The \`= 1\` happens later, on its own line.
2. A **function declaration** is hoisted together with its body, so you can call \`greet()\` before the line where it is written.
3. \`let b\` is hoisted too, but it stays in the **TDZ** (Temporal Dead Zone — the time between the start of the scope and the \`let\` line). Reading it there throws a \`ReferenceError\`.
4. \`var sayBye\` is hoisted as \`undefined\`. Calling \`undefined()\` is a \`TypeError\` ("sayBye is not a function"), not a ReferenceError.

**Simple rule:** function declarations are fully ready early; \`var\` is "there but undefined"; \`let\`/\`const\` are "there but locked" until their line runs.`,
      followUps: [
        {
          q: 'What changes if you write const sayBye = function () {...} instead?',
          a: 'Calling it early would throw a `ReferenceError` (TDZ) instead of a `TypeError`, because `const` is locked until its line runs.',
        },
        {
          q: 'Are classes hoisted?',
          a: 'Class declarations are hoisted like `let`: they are in the TDZ until the declaration runs, so `new Foo()` before `class Foo {}` throws a ReferenceError.',
        },
      ],
    },
    {
      id: 'implement-once',
      title: 'Implement once(fn)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'closures',
      question: `Write \`once(fn)\`. It returns a new function that calls \`fn\` only the **first** time. Every later call returns the result of that first call without running \`fn\` again.

\`\`\`javascript
const init = once((name) => {
  console.log('connecting to', name);
  return 42;
});

console.log(init('db')); // connecting to db, then 42
console.log(init('db')); // 42  (no second "connecting")
\`\`\`

Real use: initialize an SDK or a DB connection only once, or stop a "Pay" button from charging twice.`,
      hints: [
        'You need two remembered values between calls: "has it run?" and "what did it return?". A closure can hold both.',
        'Use a regular `function` for the wrapper and call `fn.apply(this, args)` so `this` still works.',
      ],
      solution: `**Idea:** keep a \`called\` flag and the \`result\` in a closure. The first call runs \`fn\` and saves the result; later calls just return it.

\`\`\`javascript
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;                   // set BEFORE calling, so a re-entrant call cannot run fn twice
      result = fn.apply(this, args);   // keep "this" and the arguments
      fn = null;                       // let the original function be garbage collected
    }
    return result;
  };
}

// Test
const init = once((name) => {
  console.log('connecting to', name);
  return 42;
});
console.log(init('db')); // connecting to db / 42
console.log(init('db')); // 42
\`\`\`

**Why it works:** \`called\` and \`result\` live in the closure, so every call of the returned function sees the same values. After the first run, the \`if\` is skipped forever.

**Edge case:** if \`fn\` throws, \`called\` is already \`true\`, so it will not retry. If you want "retry on error", set \`called = true\` only after \`fn\` succeeds.`,
      followUps: [
        {
          q: 'How would you make an async once, so parallel callers share one in-flight request?',
          a: 'Store the **promise**, not the value: `if (!promise) promise = fn(...args); return promise;`. All callers await the same promise. If it rejects, reset `promise = null` so the next call can retry.',
        },
        {
          q: 'How is this different from memoize?',
          a: '`once` ignores the arguments after the first call. `memoize` caches a separate result for each different set of arguments.',
        },
      ],
    },
    {
      id: 'get-by-path',
      title: 'Implement get(obj, path, defaultValue)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'optional-chaining-nullish',
      question: `Write \`get(obj, path, defaultValue)\` like lodash's \`_.get\`. The path is a string and may contain array indexes.

\`\`\`javascript
const user = {
  profile: { name: 'Asha', tags: ['admin', 'dev'] },
  orders: [{ id: 'o1', total: 0 }],
};

get(user, 'profile.name');          // 'Asha'
get(user, 'profile.tags[1]');       // 'dev'
get(user, 'orders[0].total');       // 0   (a real 0, not the default!)
get(user, 'profile.age', 18);       // 18
get(user, 'address.city', 'N/A');   // 'N/A'  (no crash)
\`\`\``,
      hints: [
        'First turn the path into a list of keys: `\'orders[0].total\'` → `[\'orders\', \'0\', \'total\']`. A regex can change `[0]` into `.0`.',
        'Walk down the object one key at a time. If you hit `null` or `undefined` on the way, stop and return the default.',
        'Only use the default when the final value is `undefined`. Do not use `||`, or a real `0` or `\'\'` would be replaced.',
      ],
      solution: `**Idea:** split the path into keys, then step into the object key by key. Stop safely when a step is missing.

\`\`\`javascript
function get(obj, path, defaultValue) {
  // 'orders[0].total' -> 'orders.0.total' -> ['orders', '0', 'total']
  const keys = path.replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean);

  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue; // null or undefined: cannot go deeper
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}

// Test
const user = {
  profile: { name: 'Asha', tags: ['admin', 'dev'] },
  orders: [{ id: 'o1', total: 0 }],
};
console.log(get(user, 'profile.name'));        // Asha
console.log(get(user, 'profile.tags[1]'));     // dev
console.log(get(user, 'orders[0].total'));     // 0
console.log(get(user, 'profile.age', 18));     // 18
console.log(get(user, 'address.city', 'N/A')); // N/A
\`\`\`

**Why it works:** the regex turns every \`[something]\` into \`.something\`, so one \`split('.')\` gives all keys. \`current == null\` is true for both \`null\` and \`undefined\`, which is exactly when we must stop. Checking \`=== undefined\` at the end keeps real falsy values like \`0\`, \`''\` and \`false\`.

**Complexity:** O(k) time, where k is the number of keys in the path.`,
      followUps: [
        {
          q: 'How would you write set(obj, path, value)?',
          a: 'Walk the keys except the last one. If a step is missing, create it: an array if the next key is a number (`/^\\d+$/`), otherwise an object. Then assign the value at the last key.',
        },
        {
          q: 'Why not just use optional chaining?',
          a: '`user?.profile?.tags?.[1]` is great when the path is known when you write the code. `get` is for paths that come as **strings at runtime**, e.g. from a config file or form field names like `"address.city"`.',
        },
      ],
    },
    {
      id: 'implement-group-by',
      title: 'Implement groupBy',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'array-methods',
      question: `Write \`groupBy(items, keyOrFn)\`. The second argument is either a property name or a function that returns the group name.

\`\`\`javascript
const orders = [
  { id: 1, status: 'paid', amount: 500 },
  { id: 2, status: 'pending', amount: 200 },
  { id: 3, status: 'paid', amount: 300 },
];

groupBy(orders, 'status');
// { paid: [order1, order3], pending: [order2] }

groupBy([1.2, 1.8, 2.5], Math.floor);
// { '1': [1.2, 1.8], '2': [2.5] }
\`\`\``,
      hints: [
        'Build one result object. For every item, work out its group name, then push the item into that group.',
        'If the second argument is a string, turn it into a function first: `(item) => item[key]`.',
      ],
      solution: `**Idea:** loop once. For each item, find its group key and push it into \`result[key]\`, creating the array the first time.

\`\`\`javascript
function groupBy(items, keyOrFn) {
  // Normalise: always work with a function
  const getKey = typeof keyOrFn === 'function' ? keyOrFn : (item) => item[keyOrFn];

  return items.reduce((groups, item) => {
    const key = getKey(item);
    (groups[key] ||= []).push(item); // create the array the first time, then push
    return groups;
  }, {});
}

// Test
const orders = [
  { id: 1, status: 'paid', amount: 500 },
  { id: 2, status: 'pending', amount: 200 },
  { id: 3, status: 'paid', amount: 300 },
];
console.log(groupBy(orders, 'status'));
console.log(groupBy([1.2, 1.8, 2.5], Math.floor)); // { '1': [ 1.2, 1.8 ], '2': [ 2.5 ] }
\`\`\`

**Why it works:** \`reduce\` carries one \`groups\` object through the loop. \`||=\` only assigns when \`groups[key]\` is empty, so each group array is created once.

**Complexity:** O(n) time, O(n) extra memory.

**Edge case:** object keys are always strings, so the number \`1\` becomes \`'1'\`. If you need real keys (numbers, objects), group into a \`Map\` instead.`,
      followUps: [
        {
          q: 'Is there a built-in?',
          a: 'Yes, `Object.groupBy(items, fn)` and `Map.groupBy(items, fn)` were added in ES2024. They only take a function. Check that your target browsers / Node version support them before relying on them.',
        },
        {
          q: 'How would you get the total amount per status instead of the list?',
          a: 'Same loop, but add instead of push: `totals[key] = (totals[key] ?? 0) + item.amount`.',
        },
      ],
    },
    {
      id: 'floating-point-money-bug',
      title: 'Fix the cart total bug (0.1 + 0.2)',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'numbers-floating-point',
      question: `A customer reports that the checkout page says "Mismatch". Find the bug and fix it properly for a payments app (think Stripe).

\`\`\`javascript
function cartTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return total;
}

const total = cartTotal([
  { price: 0.1, qty: 1 },
  { price: 0.2, qty: 1 },
]);

if (total === 0.3) console.log('Total is $0.30');
else console.log('Mismatch:', total);
\`\`\``,
      hints: [
        'Run `console.log(0.1 + 0.2)` and look closely at the result.',
        'Numbers in JavaScript are binary floating-point. Some decimals like 0.1 cannot be stored exactly.',
        'How does Stripe expect amounts? (Hint: in the smallest unit, like cents.)',
      ],
      solution: `**The bug:** it prints \`Mismatch: 0.30000000000000004\`. JavaScript numbers are stored in binary (IEEE 754 double). \`0.1\` and \`0.2\` cannot be stored exactly in binary, so their sum is a tiny bit off. Comparing with \`===\` fails, and adding many prices makes the error grow.

**Fix:** keep money as **integers in the smallest unit** (cents / paise). Integers are exact. Only format to a decimal string when you show it.

\`\`\`javascript
// Prices stored in cents (integers)
function cartTotalCents(items) {
  let total = 0;
  for (const item of items) {
    total += item.priceCents * item.qty; // integer math: always exact
  }
  return total;
}

const totalCents = cartTotalCents([
  { priceCents: 10, qty: 1 },
  { priceCents: 20, qty: 1 },
]);

console.log(totalCents === 30); // true

// Format only for display
const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  .format(totalCents / 100);
console.log(formatted); // $0.30
\`\`\`

**Why it works:** whole numbers up to \`Number.MAX_SAFE_INTEGER\` (about 9 quadrillion) are stored exactly, so adding cents never drifts. This is also why the Stripe API takes \`amount: 1999\` for $19.99.

**If you must compare decimals:** compare with a small tolerance: \`Math.abs(a - b) < Number.EPSILON\`, or round first. But for money, integers are the right answer.`,
      followUps: [
        {
          q: 'What about discounts like 15% that create fractions of a cent?',
          a: 'Calculate, then round to a whole cent at a clear point with one rule (e.g. `Math.round(cents * 0.85)`), and do it the same way on server and client. For heavy financial math use a decimal library (decimal.js, big.js) or store as integers in the DB.',
        },
        {
          q: 'Why is toFixed(2) not enough?',
          a: '`toFixed` returns a **string** for display and has its own rounding surprises (e.g. `(1.005).toFixed(2)` is `"1.00"`). It hides the problem on screen but does not make the math exact.',
        },
      ],
    },
    {
      id: 'mutating-sort-bug',
      title: 'Fix the bug: the original list keeps changing',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'immutability-freeze',
      question: `\`getCheapest\` returns the right answer, but after calling it the product list on the page shows in a different order. Why? Fix it.

\`\`\`javascript
const prices = [30, 10, 20];

function getCheapest(list) {
  return list.sort((a, b) => a - b)[0];
}

console.log(getCheapest(prices)); // 10  (correct)
console.log(prices);              // expected [30, 10, 20]
\`\`\``,
      hints: [
        'Print `prices` after the call. Is it still `[30, 10, 20]`?',
        'Some array methods change the array they are called on. Which ones? (`sort`, `reverse`, `splice`, `push`...)',
      ],
      solution: `**The bug:** \`sort()\` sorts the array **in place**. \`list\` is a reference to the same array as \`prices\`, so the caller's array is now \`[10, 20, 30]\`. In React, this is worse: you mutated state directly, so the UI can go out of sync.

**Fix — do not mutate the input:**

\`\`\`javascript
const prices = [30, 10, 20];

// Option 1: copy first, then sort the copy
function getCheapest(list) {
  return [...list].sort((a, b) => a - b)[0];
}

// Option 2 (better here): we only need the minimum, no sorting at all
function getCheapestFast(list) {
  return Math.min(...list); // O(n) instead of O(n log n)
}

console.log(getCheapest(prices));     // 10
console.log(getCheapestFast(prices)); // 10
console.log(prices);                  // [ 30, 10, 20 ]  — unchanged
\`\`\`

**Why it works:** \`[...list]\` makes a new (shallow) array, so sorting it does not touch the original. \`Math.min\` never needed sorting in the first place.

**Mutating methods to watch for:** \`sort\`, \`reverse\`, \`splice\`, \`push\`, \`pop\`, \`shift\`, \`unshift\`, \`fill\`. Non-mutating versions (ES2023): \`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\`.`,
      followUps: [
        {
          q: 'Is Math.min(...list) safe for huge arrays?',
          a: 'Spreading passes every item as a function argument, and engines limit argument count (very large arrays, roughly 100k+ items, can throw RangeError). For big arrays use a loop or `list.reduce((m, x) => (x < m ? x : m))`.',
        },
        {
          q: 'How can you catch accidental mutation during development?',
          a: '`Object.freeze(prices)` makes `sort` throw a TypeError. Also, TypeScript `readonly number[]` stops you from calling `sort` on it at compile time.',
        },
      ],
    },
    {
      id: 'implement-debounce',
      title: 'Implement debounce',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'debounce-throttle',
      question: `Write a function \`debounce(fn, delay)\`. It returns a new function that waits until calls have **stopped** for \`delay\` milliseconds, then calls \`fn\` once with the **latest** arguments.

\`\`\`javascript
const log = debounce((q) => console.log('search:', q), 300);
log('r'); log('re'); log('rea'); log('react');
// after 300ms of silence -> prints only: search: react
\`\`\`

Keep \`this\` working when the debounced function is used as a method.`,
      hints: [
        'You need to remember a timer between calls. Which JavaScript feature lets a function remember a variable? (closures)',
        'On every call: clear the old timer with `clearTimeout`, then start a new `setTimeout`.',
        'Use a regular `function` (not an arrow) for the returned function so you can capture `this`, then call `fn.apply(this, args)`.',
      ],
      solution: `**Idea:** every new call cancels the previous timer and starts a fresh one. Only the last call "survives" long enough to fire.

\`\`\`javascript
function debounce(fn, delay) {
  let timerId; // remembered between calls (closure)

  return function (...args) {
    clearTimeout(timerId);               // cancel the previous scheduled call
    timerId = setTimeout(() => {
      fn.apply(this, args);              // keep "this" and pass the latest args
    }, delay);
  };
}

// Test
const log = debounce((q) => console.log('search:', q), 300);
log('r'); log('re'); log('rea'); log('react');
// prints after ~300ms: search: react
\`\`\`

**Why it works:** \`timerId\` lives in the closure, so all calls share it. Each call clears the old timeout, so \`fn\` runs only after the user stops calling for \`delay\` ms. The arrow function inside \`setTimeout\` keeps the outer \`this\`.

**Complexity:** O(1) time per call, O(1) memory.`,
      followUps: [
        {
          q: 'How would you add a `cancel()` method?',
          a: 'Attach it to the returned function: `debounced.cancel = () => clearTimeout(timerId);`. React components call it in the cleanup of `useEffect`.',
        },
        {
          q: 'What is a "leading" debounce?',
          a: 'It fires on the **first** call immediately, then ignores calls until things are quiet for `delay` ms. Track with a flag: if there is no active timer, call `fn` right away.',
        },
        {
          q: 'Debounce vs throttle?',
          a: 'Debounce waits for a pause and fires once (search box). Throttle fires at most once every N ms during continuous activity (scroll, resize).',
        },
      ],
    },
    {
      id: 'implement-throttle',
      title: 'Implement throttle',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'debounce-throttle',
      question: `Write \`throttle(fn, wait)\`. The returned function runs \`fn\` **at most once every \`wait\` ms**, no matter how often it is called. The first call should run right away.

\`\`\`javascript
const onScroll = throttle(() => console.log('save scroll position'), 1000);
window.addEventListener('scroll', onScroll);
// user scrolls for 3 seconds -> logs about 3 times, not 300 times
\`\`\`

Bonus: make sure the **last** call is not lost (a "trailing" call), so the final scroll position is saved.`,
      hints: [
        'Remember the time of the last run (`Date.now()`). On each call, check if enough time has passed.',
        'For the trailing call: if a call comes in too early, schedule one `setTimeout` for the remaining time and keep the latest arguments.',
      ],
      solution: `**Idea:** store when \`fn\` last ran. If \`wait\` ms have passed, run now. If not, schedule one trailing run for the moment the window ends, using the latest arguments.

\`\`\`javascript
function throttle(fn, wait) {
  let lastRun = 0;       // time of the last real call
  let timerId = null;    // pending trailing call
  let lastArgs, lastThis;

  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - lastRun);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      // Enough time passed: run immediately (leading call)
      clearTimeout(timerId);
      timerId = null;
      lastRun = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timerId) {
      // Too early: schedule ONE trailing call for when the window ends
      timerId = setTimeout(() => {
        lastRun = Date.now();
        timerId = null;
        fn.apply(lastThis, lastArgs); // uses the most recent arguments
      }, remaining);
    }
  };
}

// Test: call every 50ms for 1 second, throttled to 300ms
const start = Date.now();
const log = throttle((i) => console.log(Math.round((Date.now() - start) / 100) * 100, 'ms -> call', i), 300);
let i = 0;
const id = setInterval(() => {
  log(++i);
  if (i === 20) clearInterval(id);
}, 50);
// Logs roughly at 0, 300, 600, 900 ms and a final trailing call with i = 20
\`\`\`

**Why it works:** \`lastRun\` makes sure runs are at least \`wait\` apart. The single \`timerId\` guarantees we never schedule more than one trailing call, and \`lastArgs\` makes that call use the newest data.

**Complexity:** O(1) per call.`,
      followUps: [
        {
          q: 'When would you pick throttle over debounce?',
          a: 'Throttle for continuous events where you want regular updates while they happen (scroll position, resize, mouse move, sending typing indicators). Debounce when you only care about the final value after a pause (search input, autosave).',
        },
        {
          q: 'Is there a browser-native way to throttle visual updates?',
          a: '`requestAnimationFrame`: run the work at most once per frame (about every 16ms at 60fps). It is the best choice for animations and scroll-linked visuals.',
        },
      ],
    },
    {
      id: 'reduce-polyfill',
      title: 'Write Array.prototype.myReduce, then build map and filter with it',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'polyfills-bind-map-reduce',
      question: `1. Implement \`Array.prototype.myReduce(callback, initialValue)\` that behaves like the real \`reduce\`.
2. Then implement \`myMap\` and \`myFilter\` **using only \`myReduce\`** (no loops).

\`\`\`javascript
[1, 2, 3].myReduce((sum, x) => sum + x, 0);  // 6
[1, 2, 3].myReduce((sum, x) => sum + x);     // 6  (no initial value)
[].myReduce((sum, x) => sum + x);            // TypeError
[1, 2, 3].myMap((x) => x * 2);               // [2, 4, 6]
[1, 2, 3, 4].myFilter((x) => x % 2 === 0);   // [2, 4]
\`\`\``,
      hints: [
        'The tricky part is "no initial value": then the first element becomes the accumulator and the loop starts at index 1.',
        'Use `arguments.length` (or a rest parameter length) to know whether `initialValue` was passed — `undefined` can be a real initial value.',
        'The callback gets 4 arguments: `(accumulator, currentValue, index, array)`.',
      ],
      solution: `**Idea:** loop over the array, feeding the accumulator back into the callback each time. Handle the "no initial value" case carefully.

\`\`\`javascript
Array.prototype.myReduce = function (callback, ...rest) {
  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');

  const arr = this;
  let i = 0;
  let acc;

  if (rest.length > 0) {
    acc = rest[0]; // initial value given (even if it is undefined)
  } else {
    // No initial value: use the first existing element (skip holes like [, 1])
    while (i < arr.length && !(i in arr)) i++;
    if (i >= arr.length) throw new TypeError('Reduce of empty array with no initial value');
    acc = arr[i++];
  }

  for (; i < arr.length; i++) {
    if (i in arr) acc = callback(acc, arr[i], i, arr); // skip holes, like the real one
  }
  return acc;
};

// map and filter built on top of reduce
Array.prototype.myMap = function (fn, thisArg) {
  return this.myReduce((out, x, i, arr) => {
    out.push(fn.call(thisArg, x, i, arr));
    return out;
  }, []);
};

Array.prototype.myFilter = function (fn, thisArg) {
  return this.myReduce((out, x, i, arr) => {
    if (fn.call(thisArg, x, i, arr)) out.push(x);
    return out;
  }, []);
};

// Tests
console.log([1, 2, 3].myReduce((s, x) => s + x, 0));    // 6
console.log([1, 2, 3].myReduce((s, x) => s + x));       // 6
console.log([1, 2, 3].myMap((x) => x * 2));             // [ 2, 4, 6 ]
console.log([1, 2, 3, 4].myFilter((x) => x % 2 === 0)); // [ 2, 4 ]
try {
  [].myReduce((s, x) => s + x);
} catch (e) {
  console.log(e.message); // Reduce of empty array with no initial value
}
\`\`\`

**Why it works:** \`reduce\` is the most general array loop: it carries one value (the accumulator) from step to step. If the accumulator is an array, you can "push" mapped or filtered items into it — that is exactly \`map\` and \`filter\`.

**Edge cases:** empty array without initial value throws; holes in sparse arrays are skipped (\`i in arr\`); \`undefined\` as an explicit initial value is respected.

**Complexity:** O(n).`,
      followUps: [
        {
          q: 'Why is it risky to add methods to Array.prototype in real apps?',
          a: 'All arrays share the prototype, so your method can clash with a future built-in or a library (this really happened with `Array.prototype.flatten`, which is why the standard method is called `flat`). Real polyfills check `if (!Array.prototype.x)` first. In app code, prefer plain helper functions.',
        },
        {
          q: 'Why use a normal function, not an arrow function, for the polyfill?',
          a: 'Arrow functions do not have their own `this`. We need `this` to be the array the method was called on.',
        },
        {
          q: 'Can reduce implement other things?',
          a: 'Yes: sum, max, groupBy, flatten, counting (`{ apple: 2 }`), and even running promises in sequence: `tasks.reduce((p, t) => p.then(t), Promise.resolve())`.',
        },
      ],
    },
    {
      id: 'bind-polyfill',
      title: 'Implement Function.prototype.myBind',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'call-apply-bind',
      question: `Write \`myBind\` so it works like the real \`bind\`: it fixes \`this\` and supports **partial arguments** (some arguments now, the rest later).

\`\`\`javascript
const user = { name: 'Asha' };
function greet(greeting, punctuation) {
  return greeting + ', ' + this.name + punctuation;
}

const hi = greet.myBind(user, 'Hi');
console.log(hi('!'));   // Hi, Asha!
\`\`\`

Follow-up: solve it once using \`apply\`, then once **without** \`call\`/\`apply\`/\`bind\`.`,
      hints: [
        'Inside `myBind`, `this` is the function you want to bind (because you call `greet.myBind(...)`).',
        'Return a new function that merges the saved arguments with the new ones: `[...savedArgs, ...laterArgs]`.',
        'Without `apply`: temporarily put the function on the object as a property, call it as a method (`obj.fn()`), then delete it. A `Symbol` key avoids name clashes.',
      ],
      solution: `**Idea:** save the original function, the \`this\` value and the early arguments in a closure. Return a function that calls the original with everything combined.

\`\`\`javascript
// Version 1: with apply
Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFn = this; // the function myBind was called on
  if (typeof originalFn !== 'function') throw new TypeError('myBind must be called on a function');

  return function (...laterArgs) {
    return originalFn.apply(context, [...boundArgs, ...laterArgs]);
  };
};

// Version 2: without call/apply/bind — use the "method call" rule of this
Function.prototype.myBind2 = function (context, ...boundArgs) {
  const originalFn = this;

  return function (...laterArgs) {
    const ctx = context == null ? globalThis : Object(context); // Object() wraps primitives
    const key = Symbol('fn');          // unique key: cannot overwrite a real property
    ctx[key] = originalFn;             // ctx.fn = greet
    const result = ctx[key](...boundArgs, ...laterArgs); // called as a method -> this === ctx
    delete ctx[key];                   // clean up
    return result;
  };
};

// Tests
const user = { name: 'Asha' };
function greet(greeting, punctuation) {
  return greeting + ', ' + this.name + punctuation;
}
console.log(greet.myBind(user, 'Hi')('!'));        // Hi, Asha!
console.log(greet.myBind2(user, 'Hello')('?'));    // Hello, Asha?
console.log(greet.myBind(user)('Hey', '.'));       // Hey, Asha.
\`\`\`

**Why it works:** the returned function is a closure that remembers \`originalFn\`, \`context\` and \`boundArgs\`. Version 2 uses the basic rule of \`this\`: when you call \`obj.method()\`, \`this\` is \`obj\`.

**Complexity:** O(n) in the number of arguments per call.`,
      followUps: [
        {
          q: 'What happens with the real bind when you use new on the bound function?',
          a: '`new` wins: `this` becomes the new object and the bound `this` is ignored (bound arguments still apply). A full polyfill checks `this instanceof boundFn` inside the returned function and, if true, calls the original with the new object instead of `context`. It also sets the prototype.',
        },
        {
          q: 'Can you re-bind a bound function?',
          a: 'No. `fn.bind(a).bind(b)` still uses `a`. The first bind wins because the inner call always uses the first saved context.',
        },
        {
          q: 'Where do you use bind in real code?',
          a: 'Passing methods as callbacks (`button.addEventListener("click", this.handleClick.bind(this))`), old React class components, and partial application like `const log = console.log.bind(console, "[api]")`.',
        },
      ],
    },
    {
      id: 'compose-pipe',
      title: 'Implement compose and pipe',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'higher-order-functions',
      question: `Write \`pipe(...fns)\` and \`compose(...fns)\`.

- \`pipe(f, g, h)(x)\` means \`h(g(f(x)))\` — run **left to right**.
- \`compose(f, g, h)(x)\` means \`f(g(h(x)))\` — run **right to left**.

\`\`\`javascript
const trim = (s) => s.trim();
const lower = (s) => s.toLowerCase();
const slugify = (s) => s.replace(/\\s+/g, '-');

const makeSlug = pipe(trim, lower, slugify);
makeSlug('  Hello World JS ');   // 'hello-world-js'
\`\`\`

Bonus: write \`pipeAsync\` where some functions return promises.`,
      hints: [
        'The output of one function is the input of the next. That is a "carry a value through a list" problem — which array method does that?',
        '`pipe` uses `reduce`; `compose` uses `reduceRight`.',
        'For async: the accumulator becomes a promise. Chain with `.then(fn)` (or `await` inside an async reducer).',
      ],
      solution: `**Idea:** start with the input value and pass it through each function in order, using \`reduce\`.

\`\`\`javascript
const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);

const compose = (...fns) => (input) => fns.reduceRight((value, fn) => fn(value), input);

// Async version: every step may return a value or a promise
const pipeAsync = (...fns) => (input) =>
  fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(input));

// Tests
const trim = (s) => s.trim();
const lower = (s) => s.toLowerCase();
const slugify = (s) => s.replace(/\\s+/g, '-');

console.log(pipe(trim, lower, slugify)('  Hello World JS '));    // hello-world-js
console.log(compose(slugify, lower, trim)('  Hello World JS ')); // hello-world-js

const fetchUser = async (id) => ({ id, name: 'Asha' }); // pretend API call
const getName = (user) => user.name;
pipeAsync(fetchUser, getName, lower)(7).then(console.log);      // asha
\`\`\`

**Why it works:** \`reduce\` keeps one value and updates it with each function. \`reduceRight\` does the same but starts from the end. In the async version the value is always a promise, and \`.then(fn)\` works whether \`fn\` returns a value or a promise.

**Edge case:** with no functions, \`pipe()(x)\` just returns \`x\` — a nice "identity" default.`,
      followUps: [
        {
          q: 'Where do you see compose in real projects?',
          a: 'Express/Koa middleware chains, Redux `compose` for store enhancers, wrapping React components with several HOCs, and data-cleaning steps in Node scripts.',
        },
        {
          q: 'How would you support functions that take more than one argument at the start?',
          a: 'Let only the first function take many arguments: `(...args) => rest.reduce((v, fn) => fn(v), first(...args))`.',
        },
      ],
    },
    {
      id: 'implement-curry',
      title: 'Implement curry (and the infinite sum)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'currying',
      question: `Part 1: write \`curry(fn)\`. The curried function keeps collecting arguments until it has as many as \`fn\` expects, then calls \`fn\`.

\`\`\`javascript
const add3 = (a, b, c) => a + b + c;
const curried = curry(add3);

curried(1)(2)(3);   // 6
curried(1, 2)(3);   // 6
curried(1)(2, 3);   // 6
\`\`\`

Part 2 (very popular): write \`sum\` so that \`sum(1)(2)(3)()\` returns \`6\` for any number of calls. An empty call \`()\` means "stop and give me the total".`,
      hints: [
        '`fn.length` tells you how many parameters `fn` declares.',
        'Return a function that gathers arguments. If you have enough, call `fn`; otherwise return another gathering function (recursion).',
        'For `sum`: return a function that, when called with no argument, returns the running total, otherwise returns `sum(total + next)`.',
      ],
      solution: `**Idea:** keep collecting arguments in a closure. When the count reaches \`fn.length\`, call the original.

\`\`\`javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);  // enough arguments: call the real function
    }
    // not enough yet: return a function that waits for more
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

// Part 2: infinite currying, ends with an empty call
function sum(a) {
  return function next(b) {
    if (b === undefined) return a;  // () -> return the total
    return sum(a + b);              // keep going with the new total
  };
}

// Tests
const add3 = (a, b, c) => a + b + c;
const curried = curry(add3);
console.log(curried(1)(2)(3)); // 6
console.log(curried(1, 2)(3)); // 6
console.log(curried(1)(2, 3)); // 6
console.log(sum(1)(2)(3)());   // 6
console.log(sum(5)());         // 5

// Real-world style use
const log = curry((level, scope, msg) => console.log('[' + level + '] ' + scope + ': ' + msg));
const apiError = log('error')('api');
apiError('payment failed'); // [error] api: payment failed
\`\`\`

**Why it works:** each call returns a new closure holding the arguments so far. Only when there are enough does the real function run. \`sum\` carries the running total forward in \`a\`.

**Edge case:** \`fn.length\` does not count rest parameters (\`...args\`) or parameters with default values, so \`curry\` cannot know when to stop for those functions.`,
      followUps: [
        {
          q: 'Currying vs partial application?',
          a: 'Currying turns `f(a, b, c)` into `f(a)(b)(c)` — one argument at a time. Partial application fixes some arguments now and returns a function for the rest, e.g. `add3.bind(null, 1)`.',
        },
        {
          q: 'Can you make sum(1)(2)(3) work without the final ()?',
          a: 'Only with a trick: return a function whose `valueOf`/`toString` (or `Symbol.toPrimitive`) returns the total, so `+sum(1)(2)(3)` or `sum(1)(2) == 3` works. It is clever but confusing — say so in the interview.',
        },
      ],
    },
    {
      id: 'implement-memoize',
      title: 'Implement memoize (including async)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'memoization',
      question: `Write \`memoize(fn, resolver?)\`. It caches results by arguments. Calling it again with the same arguments returns the cached value without running \`fn\`.

\`\`\`javascript
const slowSquare = (n) => {
  console.log('computing', n);
  return n * n;
};
const fastSquare = memoize(slowSquare);
fastSquare(4); // computing 4 -> 16
fastSquare(4); // 16 (no log)
\`\`\`

Then: what happens if \`fn\` is an **async** function (like an API call) and it is called 3 times at once? Make sure only **one** request is made, and that a failed request is not cached forever.`,
      hints: [
        'Use a `Map` as the cache. You need a key built from the arguments: `JSON.stringify(args)` is the simple choice; a custom `resolver` lets callers decide.',
        'For async, cache the **promise** itself, right away, before it settles. Parallel callers then share it.',
        'Attach a `.catch` that deletes the cache entry, so the next call can retry.',
      ],
      solution: `**Idea:** turn the arguments into a cache key. If the key is in the \`Map\`, return the saved value; otherwise compute, save and return.

\`\`\`javascript
function memoize(fn, resolver = (...args) => JSON.stringify(args)) {
  const cache = new Map();

  function memoized(...args) {
    const key = resolver(...args);
    if (cache.has(key)) return cache.get(key);   // has() so cached undefined/0 still count

    const result = fn.apply(this, args);
    cache.set(key, result);

    // If fn returned a promise, remove it from the cache when it fails
    if (result && typeof result.then === 'function') {
      result.catch(() => cache.delete(key));
    }
    return result;
  }

  memoized.cache = cache; // lets callers clear it: memoized.cache.clear()
  return memoized;
}

// Sync test
const fastSquare = memoize((n) => {
  console.log('computing', n);
  return n * n;
});
console.log(fastSquare(4)); // computing 4 / 16
console.log(fastSquare(4)); // 16

// Async test: three parallel calls -> one "request"
let requests = 0;
const getUser = memoize(async (id) => {
  requests++;
  await new Promise((r) => setTimeout(r, 50)); // fake network delay
  return { id, name: 'User ' + id };
});

Promise.all([getUser(1), getUser(1), getUser(1)]).then((users) => {
  console.log(users[0].name, '| requests made:', requests); // User 1 | requests made: 1
});
\`\`\`

**Why it works:** the closure keeps one \`Map\` for the life of the memoized function. Because the async version stores the **promise** immediately, the 2nd and 3rd callers get the same pending promise instead of starting new requests. Deleting on failure means errors are not cached.

**Trade-offs:** the cache grows forever. In real apps add a size limit (LRU) or a time limit (TTL). \`JSON.stringify\` keys fail for functions, \`Map\`s and circular objects, and treat \`{a:1,b:2}\` and \`{b:2,a:1}\` as different.`,
      followUps: [
        {
          q: 'When should you NOT memoize?',
          a: 'When the function is impure (depends on time, random values or outside state), when it is already cheap, or when inputs are almost always different — then the cache only wastes memory.',
        },
        {
          q: 'How do you memoize by object identity instead of content?',
          a: 'Use a `WeakMap` with the object as the key. It does not keep the object alive, so entries disappear when the object is garbage collected.',
        },
        {
          q: 'How does this relate to React useMemo?',
          a: '`useMemo` caches only the **last** result per component and recomputes when a dependency changes (by `Object.is`). It is a one-slot memo, not a growing cache.',
        },
      ],
    },
    {
      id: 'flatten-with-depth',
      title: 'Flatten a nested array (with depth)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'array-methods',
      question: `Write \`flatten(arr, depth = Infinity)\` without using \`Array.prototype.flat\`.

\`\`\`javascript
const data = [1, [2, [3, [4, [5]]]], 6];

flatten(data);      // [1, 2, 3, 4, 5, 6]
flatten(data, 1);   // [1, 2, [3, [4, [5]]], 6]
flatten(data, 2);   // [1, 2, 3, [4, [5]], 6]
\`\`\`

Then: can you do it **without recursion** (for very deep arrays that could overflow the call stack)?`,
      hints: [
        'Loop over items. If an item is an array and depth is still above 0, flatten it with `depth - 1` and add its items; otherwise add the item as-is.',
        'Use `Array.isArray` to detect arrays.',
        'Iterative version: use a stack of `[item, depth]` pairs. Pop, and if it is an array with depth left, push its children back.',
      ],
      solution: `**Idea:** walk the array. When you meet a nested array and still have depth left, go one level deeper.

\`\`\`javascript
// Recursive version
function flatten(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1)); // go one level deeper
    } else {
      result.push(item);
    }
  }
  return result;
}

// Iterative version with an explicit stack (no recursion)
function flattenIterative(arr, depth = Infinity) {
  // Stack holds [value, remainingDepth]; reversed so we pop items in original order
  const stack = arr.map((item) => [item, depth]).reverse();
  const result = [];

  while (stack.length) {
    const [item, d] = stack.pop();
    if (Array.isArray(item) && d > 0) {
      // push children in reverse so the first child is popped first
      for (let i = item.length - 1; i >= 0; i--) stack.push([item[i], d - 1]);
    } else {
      result.push(item);
    }
  }
  return result;
}

// Tests
const data = [1, [2, [3, [4, [5]]]], 6];
console.log(JSON.stringify(flatten(data)));             // [1,2,3,4,5,6]
console.log(JSON.stringify(flatten(data, 1)));          // [1,2,[3,[4,[5]]],6]
console.log(JSON.stringify(flatten(data, 2)));          // [1,2,3,[4,[5]],6]
console.log(JSON.stringify(flattenIterative(data)));    // [1,2,3,4,5,6]
console.log(JSON.stringify(flattenIterative(data, 1))); // [1,2,[3,[4,[5]]],6]
\`\`\`

**Why it works:** each level of nesting uses up one unit of \`depth\`. When depth hits 0, deeper arrays are kept as they are. The iterative version does the same work with our own stack instead of the call stack.

**Complexity:** O(n) time where n is the total number of items at all levels.

**Edge case:** the real \`flat()\` removes holes in sparse arrays (\`[1, , 2].flat()\` gives \`[1, 2]\`); \`for...of\` turns holes into \`undefined\` instead. Mention it if asked.`,
      followUps: [
        {
          q: 'What is the one-liner with reduce?',
          a: '`const flat = (a, d = Infinity) => d > 0 ? a.reduce((acc, x) => acc.concat(Array.isArray(x) ? flat(x, d - 1) : x), []) : a.slice();`',
        },
        {
          q: 'How would you flatten a nested object instead, like { a: { b: 1 } } → { "a.b": 1 }?',
          a: 'Same recursion: for each key, if the value is a plain object, recurse with the prefix `parentKey + "."`; otherwise write `result[prefix + key] = value`.',
        },
      ],
    },
    {
      id: 'event-loop-order-output',
      title: 'Predict the order: setTimeout vs promises vs await',
      difficulty: 'medium',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'microtasks-macrotasks',
      question: `In what order are the numbers printed?

\`\`\`javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
  .then(() => console.log('3'))
  .then(() => console.log('4'));

queueMicrotask(() => console.log('5'));

(async () => {
  console.log('6');
  await null;
  console.log('7');
})();

console.log('8');
\`\`\``,
      hints: [
        'First, all normal (synchronous) code runs top to bottom. An `async` function runs synchronously **until its first `await`**.',
        'Then the **microtask** queue is emptied completely: promise callbacks, `queueMicrotask`, and code after `await`.',
        'Only after that does one **macrotask** (like a `setTimeout` callback) run. A `.then` chained on another `.then` is queued only when the first one finishes.',
      ],
      solution: `**Output:**

\`\`\`text
1 6 8 3 5 7 4 2
\`\`\`

**Step by step:**

1. **Synchronous code:** \`1\`. \`setTimeout\` schedules \`2\` as a macrotask. \`.then(3)\` is queued as a microtask (the promise is already resolved). \`queueMicrotask\` queues \`5\`. The async function prints \`6\`, hits \`await null\`, and queues "the rest of the function" (\`7\`) as a microtask. Then \`8\`.
2. **Microtask queue** (in order): \`3\`, \`5\`, \`7\`. When \`3\` runs, its promise resolves, so \`.then(4)\` is added to the **end** of the queue. The queue is not empty yet, so \`4\` runs too.
3. **Macrotask:** finally \`2\` from \`setTimeout\`.

**The rule to say in the interview:** sync code → all microtasks (including new ones added while draining) → one macrotask → microtasks again → ...`,
      followUps: [
        {
          q: 'Why does setTimeout(fn, 0) not run immediately?',
          a: 'The `0` is a minimum delay, not a promise. The callback goes to the macrotask queue and only runs after the current script and all microtasks finish. Browsers may also clamp nested timers to about 4ms.',
        },
        {
          q: 'Can microtasks block the page?',
          a: 'Yes. If a microtask keeps scheduling another microtask forever, the event loop never reaches rendering or timers, so the page freezes. A `setTimeout` loop does not freeze it because the browser can render between macrotasks.',
        },
        {
          q: 'Where does process.nextTick go in Node?',
          a: 'In Node, the `process.nextTick` queue is processed before the promise microtask queue, so a `nextTick` callback runs before `.then` callbacks queued at the same time.',
        },
      ],
    },
    {
      id: 'lost-this-callback-bug',
      title: 'Fix the bug: this is undefined inside a callback',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'this-keyword',
      question: `This code crashes. Explain why and give at least three fixes.

\`\`\`javascript
class Cart {
  constructor() {
    this.items = [];
  }
  add(item) {
    this.items.push(item);
  }
  addMany(list) {
    list.forEach(this.add);
  }
}

const cart = new Cart();
cart.addMany(['apple', 'milk']);
// TypeError: Cannot read properties of undefined (reading 'items')
\`\`\``,
      hints: [
        '`this` is decided by **how a function is called**, not where it is written.',
        '`list.forEach(this.add)` passes the function by itself. How does `forEach` call it — as `cart.add(item)` or as plain `add(item)`?',
        'Class bodies run in strict mode, so a plain call gets `this === undefined`.',
      ],
      solution: `**The bug:** \`this.add\` only passes the **function**, not the object it belongs to. \`forEach\` later calls it as a plain function: \`add(item)\`. In strict mode (class code is always strict) a plain call has \`this === undefined\`, so \`this.items\` crashes.

**Fixes:**

\`\`\`javascript
class Cart {
  constructor() {
    this.items = [];
  }
  add(item) {
    this.items.push(item);
  }

  // Fix 1: arrow function — it uses the "this" of addMany, which is the cart
  addMany(list) {
    list.forEach((item) => this.add(item));
  }

  // Fix 2: bind creates a copy of add with "this" locked to the cart
  addMany2(list) {
    list.forEach(this.add.bind(this));
  }

  // Fix 3: forEach accepts a "thisArg" as its second argument
  addMany3(list) {
    list.forEach(this.add, this);
  }
}

// Fix 4: define the method as an arrow-function class field (one copy per instance)
class Cart2 {
  items = [];
  add = (item) => {
    this.items.push(item);
  };
  addMany(list) {
    list.forEach(this.add); // works now: add always uses this instance
  }
}

const cart = new Cart();
cart.addMany(['apple']);
cart.addMany2(['milk']);
cart.addMany3(['bread']);
console.log(cart.items); // [ 'apple', 'milk', 'bread' ]

const cart2 = new Cart2();
cart2.addMany(['eggs']);
console.log(cart2.items); // [ 'eggs' ]
\`\`\`

**Why they work:** arrow functions do not have their own \`this\` — they take it from the surrounding code. \`bind\` returns a function with \`this\` fixed forever. The class-field arrow is created in the constructor, so it captures the instance.

**Trade-off of Fix 4:** each instance gets its own copy of \`add\` (more memory, not on the prototype, harder to mock in tests). Fine for UI handlers, not for thousands of objects.`,
      followUps: [
        {
          q: 'Where does this same bug show up in real apps?',
          a: '`button.addEventListener("click", this.handleClick)` (then `this` is the button), `setTimeout(obj.method, 100)`, passing `this.method` as a prop in old React class components, and destructuring a method: `const { add } = cart; add(1);`.',
        },
        {
          q: 'What would happen outside strict mode?',
          a: 'A plain call would get `this === globalThis` (`window` in browsers). Then `this.items` is `undefined` and `.push` throws a different error — or worse, the code silently writes to a global variable.',
        },
      ],
    },
    {
      id: 'async-foreach-bug',
      title: 'Fix the bug: await inside forEach',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'async-await',
      question: `The log says "all saved" before anything is saved, and an API error is never caught. Why? Fix it two ways: one save at a time, and all saves in parallel.

\`\`\`javascript
const saveUser = (u) =>
  new Promise((resolve) => setTimeout(() => {
    console.log('saved', u);
    resolve();
  }, 100));

async function saveAll(users) {
  try {
    users.forEach(async (u) => {
      await saveUser(u);
    });
    console.log('all saved');
  } catch (err) {
    console.log('failed', err);
  }
}

saveAll(['a', 'b', 'c']);
// all saved
// saved a
// saved b
// saved c
\`\`\``,
      hints: [
        '`forEach` ignores what its callback returns. What does an `async` callback return?',
        'The `await` is inside the small arrow function, not inside `saveAll`. So `saveAll` itself never waits.',
        'Use `for...of` with `await` (one by one), or `await Promise.all(users.map(...))` (all at once).',
      ],
      solution: `**The bug:** each \`async\` callback returns a promise, but \`forEach\` throws those promises away and returns right away. So \`saveAll\` prints "all saved" immediately. The \`try/catch\` also cannot catch errors from those promises, because \`saveAll\` never awaits them — a failure becomes an **unhandled rejection** (in recent Node versions that crashes the process by default).

**Fix 1 — one at a time (sequential), with \`for...of\`:**

\`\`\`javascript
const saveUser = (u) =>
  new Promise((resolve) => setTimeout(() => {
    console.log('saved', u);
    resolve();
  }, 100));

async function saveAllSequential(users) {
  for (const u of users) {
    await saveUser(u); // waits for each save before starting the next
  }
  console.log('all saved (sequential)');
}

// Fix 2 — all at once (parallel), with Promise.all
async function saveAllParallel(users) {
  await Promise.all(users.map((u) => saveUser(u))); // map KEEPS the promises
  console.log('all saved (parallel)');
}

(async () => {
  try {
    await saveAllSequential(['a', 'b', 'c']); // ~300ms total
    await saveAllParallel(['x', 'y', 'z']);   // ~100ms total
  } catch (err) {
    console.log('failed', err); // now errors are really caught
  }
})();
\`\`\`

**Why it works:** \`for...of\` runs inside the async function itself, so \`await\` pauses \`saveAll\`. \`map\` returns the array of promises, and \`Promise.all\` waits for all of them and rejects if any one fails.

**Which one to pick:** sequential when order matters or the API has strict rate limits; parallel when the calls are independent (much faster). For hundreds of items, use a **concurrency limit** (e.g. 5 at a time) so you do not flood the API or DB.`,
      followUps: [
        {
          q: 'What if you want every result, even when some saves fail?',
          a: 'Use `Promise.allSettled`. It never rejects; it gives `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` for each item, so you can report which ones failed.',
        },
        {
          q: 'Do map, filter and reduce have the same problem?',
          a: '`filter` and `some`/`every` do: an async callback returns a promise, which is always truthy, so `filter` keeps everything. `map` is fine as long as you `await Promise.all` on the result. `reduce` works if you chain the promise accumulator.',
        },
      ],
    },
    {
      id: 'promise-with-timeout',
      title: 'Add a timeout to any promise',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'promise-combinators',
      question: `A payment provider API sometimes hangs forever. Write \`withTimeout(promise, ms)\` that rejects with \`Error('Timed out')\` if the promise does not settle within \`ms\` milliseconds. Otherwise it resolves or rejects exactly like the original.

\`\`\`javascript
const slow = new Promise((r) => setTimeout(() => r('done'), 500));
await withTimeout(slow, 100);  // throws Error: Timed out
await withTimeout(slow, 1000); // 'done'
\`\`\`

Also: why should you clear the timer, and does this actually stop the slow request?`,
      hints: [
        'Make a second promise that only rejects after `ms`. Then race the two.',
        '`Promise.race` settles as soon as the first promise settles.',
        'Use `.finally` to `clearTimeout`, so a finished request does not leave a timer running.',
      ],
      solution: `**Idea:** race the real promise against a "timer promise" that rejects after \`ms\`. Whichever settles first wins.

\`\`\`javascript
function withTimeout(promise, ms, message = 'Timed out') {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout])
    .finally(() => clearTimeout(timerId)); // always clean up the timer
}

// Tests
const sleep = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));

(async () => {
  try {
    await withTimeout(sleep(500, 'done'), 100);
  } catch (err) {
    console.log(err.message); // Timed out
  }
  console.log(await withTimeout(sleep(50, 'done'), 1000)); // done
})();
\`\`\`

**Why it works:** \`Promise.race\` returns the first result. If the real promise finishes first, its value (or error) passes through. If the timer fires first, we get the timeout error.

**Why clear the timer:** without \`clearTimeout\`, every call leaves a timer alive. In Node, a pending timer keeps the process (or a serverless function) running until it fires, and in busy servers they pile up.

**Important:** this does **not** stop the slow operation. The request keeps running in the background; we just stop waiting for it. To really cancel a \`fetch\`, pass an \`AbortSignal\`:

\`\`\`javascript
// Modern browsers and recent Node versions support AbortSignal.timeout
async function fetchWithTimeout(url, ms) {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) }); // aborts the real request
  return res.json();
}
\`\`\``,
      followUps: [
        {
          q: 'When the timeout fires for a payment call, is it safe to just retry?',
          a: 'Not blindly: the first request may have succeeded on the server. Use an **idempotency key** (Stripe supports an `Idempotency-Key` header) so a retry with the same key cannot charge twice.',
        },
        {
          q: 'What is the difference between Promise.race and Promise.any?',
          a: '`race` settles with the first promise to settle, success or failure. `any` waits for the first **success** and only rejects (with an `AggregateError`) if all of them fail.',
        },
      ],
    },
    {
      id: 'promise-all-polyfill',
      title: 'Implement Promise.all and Promise.allSettled',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'promise-combinators',
      question: `Write \`promiseAll(items)\` and \`promiseAllSettled(items)\` without using the built-in versions.

Rules for \`promiseAll\`:
- Results keep the **same order** as the input, even if later promises finish first.
- Items can be plain values (not promises).
- It rejects as soon as **any** item rejects.
- An empty array resolves to \`[]\`.

\`\`\`javascript
promiseAll([fetchUser(), 42, fetchOrders()]).then(console.log);
// [user, 42, orders]
\`\`\``,
      hints: [
        'Return a `new Promise((resolve, reject) => ...)`. Count how many items have finished.',
        'Save each result at its index: `results[i] = value`. Do not use `push` — finish order is not input order.',
        'Wrap every item in `Promise.resolve(item)` so plain values work too.',
      ],
      solution: `**Idea:** subscribe to every item. Store each result at its own index and count completions. When the count equals the length, resolve. Reject on the first error.

\`\`\`javascript
function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const list = Array.from(items);          // works for any iterable
    const results = new Array(list.length);
    let done = 0;

    if (list.length === 0) return resolve([]); // nothing to wait for

    list.forEach((item, i) => {
      Promise.resolve(item)                    // plain values become resolved promises
        .then((value) => {
          results[i] = value;                  // keep input order
          done++;
          if (done === list.length) resolve(results);
        })
        .catch(reject);                        // first rejection wins; later calls are ignored
    });
  });
}

function promiseAllSettled(items) {
  // Turn every item into a promise that never rejects, then reuse promiseAll
  return promiseAll(
    Array.from(items, (item) =>
      Promise.resolve(item).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      ),
    ),
  );
}

// Tests
const delay = (ms, v, fail) =>
  new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error(v)) : res(v)), ms));

promiseAll([delay(100, 'slow'), 42, delay(10, 'fast')]).then(console.log);
// [ 'slow', 42, 'fast' ]  — input order, not finish order

promiseAll([delay(50, 'ok'), delay(10, 'boom', true)]).catch((e) => console.log('rejected:', e.message));
// rejected: boom

promiseAllSettled([delay(10, 'ok'), delay(20, 'bad', true)]).then((r) =>
  console.log(r.map((x) => x.status)), // [ 'fulfilled', 'rejected' ]
);

promiseAll([]).then((r) => console.log('empty:', r)); // empty: []
\`\`\`

**Why it works:** a promise can only settle once, so after the first \`reject\` all other \`resolve\`/\`reject\` calls are ignored automatically. The \`done\` counter (not \`results.length\`) tells us when everything finished, because assigning \`results[2]\` first would already make the length 3.

**Complexity:** O(n). All items run in parallel — \`promiseAll\` does not start them, it only waits for them.`,
      followUps: [
        {
          q: 'Does Promise.all cancel the other promises when one fails?',
          a: 'No. Promises cannot be cancelled. The others keep running; their results are just ignored. To really stop work, share an `AbortController` and call `abort()` in the catch.',
        },
        {
          q: 'How would you write Promise.race?',
          a: '`new Promise((res, rej) => { for (const p of items) Promise.resolve(p).then(res, rej); })` — the first one to settle wins. With an empty array it stays pending forever, like the real one.',
        },
        {
          q: 'How would you write Promise.any?',
          a: 'Mirror of `all`: resolve on the first success; collect errors by index and, when all have failed, reject with `new AggregateError(errors, "All promises were rejected")`.',
        },
      ],
    },
    {
      id: 'event-emitter',
      title: 'Build an EventEmitter (on, off, once, emit)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'classes',
      question: `Implement a small \`EventEmitter\` class, like the one in Node.js:

- \`on(event, listener)\` — subscribe; return a function that unsubscribes.
- \`off(event, listener)\` — unsubscribe.
- \`once(event, listener)\` — listener runs only one time.
- \`emit(event, ...args)\` — call all listeners in the order they were added; return \`true\` if there were any.

\`\`\`javascript
const bus = new EventEmitter();
const unsubscribe = bus.on('order', (id) => console.log('email for', id));
bus.once('order', (id) => console.log('first order bonus', id));

bus.emit('order', 'A1'); // email for A1, first order bonus A1
bus.emit('order', 'A2'); // email for A2
unsubscribe();
bus.emit('order', 'A3'); // (nothing)
\`\`\``,
      hints: [
        'Store listeners in a `Map` from event name to an array of functions.',
        'For `once`, register a small wrapper that calls `off` on itself and then calls the real listener. Remember the original so `off(event, original)` still works.',
        'In `emit`, loop over a **copy** of the array. Otherwise a listener that removes itself (like `once`) shifts the array while you loop and the next listener is skipped.',
      ],
      solution: `**Idea:** keep a \`Map<eventName, listener[]>\`. \`on\` pushes, \`off\` removes, \`emit\` calls each listener with the arguments.

\`\`\`javascript
class EventEmitter {
  #events = new Map(); // private field: eventName -> array of listeners

  on(event, listener) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push(listener);
    return () => this.off(event, listener); // handy unsubscribe function
  }

  off(event, listener) {
    const list = this.#events.get(event);
    if (!list) return;
    // match the listener itself, or a once-wrapper created for it
    const i = list.findIndex((l) => l === listener || l.original === listener);
    if (i !== -1) list.splice(i, 1);
    if (list.length === 0) this.#events.delete(event);
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);   // remove first, so it can never run twice
      listener.apply(this, args);
    };
    wrapper.original = listener;  // lets off(event, listener) find it
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    const list = this.#events.get(event);
    if (!list) return false;
    for (const listener of [...list]) {  // copy: listeners may remove themselves
      listener.apply(this, args);
    }
    return true;
  }
}

// Tests
const bus = new EventEmitter();
const unsubscribe = bus.on('order', (id) => console.log('email for', id));
bus.once('order', (id) => console.log('first order bonus', id));

bus.emit('order', 'A1'); // email for A1 / first order bonus A1
bus.emit('order', 'A2'); // email for A2
unsubscribe();
console.log(bus.emit('order', 'A3')); // false — no listeners left
\`\`\`

**Why it works:** the \`Map\` groups listeners by event. Copying the array in \`emit\` makes the loop safe even if a listener calls \`off\`. The \`original\` property links a \`once\` wrapper back to the user's function.

**Complexity:** \`on\` O(1), \`off\` O(k), \`emit\` O(k) where k is the number of listeners for that event.`,
      followUps: [
        {
          q: 'What happens if one listener throws?',
          a: 'In this version (and in Node), the error stops `emit` and the remaining listeners do not run. You could wrap each call in try/catch and report errors, or emit an `"error"` event. Node throws if an `"error"` event is emitted with no listener.',
        },
        {
          q: 'How can an EventEmitter cause a memory leak?',
          a: 'Every listener keeps its closure alive. If you subscribe on every request or every component mount and never unsubscribe, listeners pile up. Node warns with `MaxListenersExceededWarning` when more than 10 listeners are added for one event.',
        },
      ],
    },
    {
      id: 'memory-leak-listeners',
      title: 'Memory keeps growing after switching pages',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'memory-leaks',
      question: `In a single-page app, users report the dashboard gets slower and slower. In Chrome's Task Manager the tab's memory grows every time they open and close the chart page. Here is the chart code. Find the leaks, fix them, and explain how you would confirm the fix.

\`\`\`javascript
function mountChart(el) {
  const points = new Array(1_000_000).fill(0); // big data
  window.addEventListener('resize', () => redraw(el, points));
  setInterval(() => refresh(el, points), 5000);
}

function unmountChart(el) {
  window.removeEventListener('resize', () => redraw(el, points));
  el.remove();
}
\`\`\``,
      hints: [
        'What still points to `points` after `unmountChart` runs? Think about the global `window` and the timer list.',
        '`removeEventListener` only works if you pass the **same function object**. Is a new arrow function the same object?',
        'Return a cleanup function from `mountChart` that removes exactly what it added.',
      ],
      solution: `**What leaks:**

1. **The resize listener is never removed.** \`removeEventListener\` gets a brand-new arrow function, which is a different object from the one that was added, so nothing is removed. (Also, \`points\` is not even in scope in \`unmountChart\`.) \`window\` lives forever, it holds the listener, the listener's closure holds \`el\` and the 1-million-item \`points\` array.
2. **The interval is never cleared.** The timer keeps its callback (and its closure) alive and keeps calling \`refresh\` on a removed element.
3. Every open/close adds one more of each, so memory and CPU grow with every visit.

**Fix — keep references and return one cleanup function:**

\`\`\`javascript
function mountChart(el) {
  const points = new Array(1_000_000).fill(0);
  const controller = new AbortController();

  const onResize = () => redraw(el, points);
  // Passing a signal: calling controller.abort() removes this listener
  window.addEventListener('resize', onResize, { signal: controller.signal });

  const intervalId = setInterval(() => refresh(el, points), 5000);

  // The caller (router / component) calls this when leaving the page
  return function cleanup() {
    controller.abort();          // removes every listener added with this signal
    clearInterval(intervalId);   // stops the timer and frees its closure
    el.remove();
  };
}

// Usage
const cleanup = mountChart(document.querySelector('#chart'));
// ...later, when the user leaves the page:
cleanup();
\`\`\`

In React, the same idea is the cleanup function returned from \`useEffect\`.

**Why it works:** after \`cleanup()\`, nothing long-lived (window, timer list) points to the closure anymore. The garbage collector can now free \`points\` and the detached element.

**How to confirm:** Chrome DevTools → **Memory** tab → take a heap snapshot, open and close the page a few times, force garbage collection (trash-can icon), take another snapshot and compare. Search for "Detached" to find DOM elements that were removed from the page but are still held in memory. Before the fix, the count and size grow each round; after the fix, they stay flat.`,
      followUps: [
        {
          q: 'What are other common JavaScript memory leaks?',
          a: 'Global variables, caches/Maps that only grow, closures holding big objects, detached DOM nodes stored in variables, unsubscribed WebSocket/EventEmitter listeners, and in Node, per-request data stored in module-level arrays.',
        },
        {
          q: 'When would a WeakMap help?',
          a: 'When you attach extra data to an object you do not own (e.g. a DOM node). A WeakMap does not keep its keys alive, so when the node is gone, the entry can be collected automatically.',
        },
      ],
    },
    {
      id: 'async-await-tricky-order',
      title: 'Tricky order: returning a promise from an async function',
      difficulty: 'hard',
      type: 'output',
      frequency: 'occasional',
      relatedTopic: 'event-loop',
      question: `Senior-level puzzle. In what order are the letters printed?

\`\`\`javascript
async function first() {
  console.log('A');
  await second();
  console.log('B');
}
async function second() {
  console.log('C');
}
async function third() {
  console.log('D');
  return Promise.resolve('x'); // returns a promise from an async function
}

console.log('E');
setTimeout(() => console.log('F'), 0);
first();
third().then(() => console.log('G'));
Promise.resolve()
  .then(() => console.log('H'))
  .then(() => console.log('I'))
  .then(() => console.log('J'))
  .then(() => console.log('L'));
console.log('K');
\`\`\``,
      hints: [
        'Sync part first. Remember: calling an async function runs its body synchronously until the first `await` (or the end).',
        'Count microtask "ticks". `await` on an already-resolved native promise costs 1 tick. Each `.then` in a chain costs 1 tick after the previous one.',
        'When an async function **returns a promise**, its own promise must "adopt" that inner promise. That costs **2 extra ticks** before the outer `.then` can be queued.',
      ],
      solution: `**Output:**

\`\`\`text
E A C D K B H I G J L F
\`\`\`

**Step by step:**

**Synchronous phase:** \`E\`. \`setTimeout\` schedules \`F\` (macrotask). \`first()\` prints \`A\`, calls \`second()\` which prints \`C\` and returns a resolved promise; \`await\` queues "rest of first" (\`B\`). \`third()\` prints \`D\` and returns a promise. The \`H\` callback is queued. Then \`K\`.

**Microtask ticks:**

- **Tick 1:** \`B\`, third's "adopt the inner promise" job, \`H\`. These queue: the inner promise's \`.then\`, and \`I\`.
- **Tick 2:** the inner \`.then\` fires and finally resolves third's promise; \`I\`. These queue: \`G\`, \`J\`.
- **Tick 3:** \`G\`, \`J\`. This queues \`L\`.
- **Tick 4:** \`L\`.

Then the macrotask \`F\`.

**Why G is late:** \`return Promise.resolve('x')\` inside an \`async\` function does not resolve the outer promise immediately. The engine has to subscribe to the inner promise (1 tick) and that subscription has to fire (1 more tick). Only then is the outer promise resolved and \`G\` queued. If \`third\` returned a plain value (\`return 'x'\`), \`G\` would print right after \`H\`.

**Practical takeaway:** you almost never rely on this in real code — but it shows you understand that \`await\`/\`.then\` callbacks are just microtasks scheduled in a very exact order.`,
      followUps: [
        {
          q: 'Is return await promise any different from return promise inside an async function?',
          a: 'Behavior is the same for the caller, but `return await` inside a `try` lets the `catch` handle a rejection — with plain `return`, the rejection skips your `catch`. Modern engines also optimise `return await`, so it is not slower in practice.',
        },
        {
          q: 'Where would the order change in Node with process.nextTick?',
          a: 'A `process.nextTick` callback queued in the sync phase would run before all of these promise microtasks, right after `K`.',
        },
      ],
    },
    {
      id: 'implement-deep-equal',
      title: 'Implement deepEqual(a, b)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'equality',
      question: `Write \`deepEqual(a, b)\` that returns \`true\` when two values have the same content.

\`\`\`javascript
deepEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }); // true  (key order does not matter)
deepEqual([1, 2], { 0: 1, 1: 2 });                   // false (array vs object)
deepEqual(NaN, NaN);                                  // true
deepEqual(new Date('2024-01-01'), new Date('2024-01-01')); // true
deepEqual({ a: undefined }, {});                      // false (different keys)
deepEqual(
  { user: { tags: ['x'] } },
  { user: { tags: ['y'] } },
);                                                    // false
\`\`\`

Bonus: do not crash on circular objects.`,
      hints: [
        'Start with the easy cases: if `Object.is(a, b)` is true, return true (this also makes `NaN` equal `NaN`). If either is not an object, return false.',
        'Both must be the same kind: compare `Object.getPrototypeOf(a)` and `Object.getPrototypeOf(b)`. Handle `Date` by comparing `getTime()`.',
        'Compare key counts, then recurse into each key. For circular objects, remember pairs you are already comparing in a `WeakMap`.',
      ],
      solution: `**Idea:** handle primitives with \`Object.is\`. For objects, check they are the same type, have the same keys, and that every value is deep-equal (recursion).

\`\`\`javascript
function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;                       // same value / same reference / NaN

  // If either is a primitive (or null) and they were not Object.is equal -> different
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  // Must be the same kind of object (array vs plain object vs Date...)
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.toString() === b.toString();

  // Circular protection: if we are already comparing a with b, assume equal for now
  if (seen.get(a) === b) return true;
  seen.set(a, b);

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false; // key missing in b
    if (!deepEqual(a[key], b[key], seen)) return false;
  }
  return true;
}

// Tests
console.log(deepEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }));           // true
console.log(deepEqual([1, 2], { 0: 1, 1: 2 }));                             // false
console.log(deepEqual(NaN, NaN));                                           // true
console.log(deepEqual(new Date('2024-01-01'), new Date('2024-01-01')));     // true
console.log(deepEqual({ a: undefined }, {}));                               // false
console.log(deepEqual({ user: { tags: ['x'] } }, { user: { tags: ['y'] } })); // false

const x = { name: 'x' }; x.self = x;
const y = { name: 'x' }; y.self = y;
console.log(deepEqual(x, y));                                               // true, no crash
\`\`\`

**Why it works:** \`Object.is\` covers primitives and the "same reference" shortcut. The prototype check rejects array-vs-object and Date-vs-object. Comparing key counts plus "every key of a exists in b with an equal value" proves both have exactly the same keys. The \`WeakMap\` stops infinite recursion on cycles.

**Complexity:** O(n) where n is the total number of values in both structures.

**Not covered (say it out loud):** \`Map\`/\`Set\` contents, symbol keys, typed arrays and non-enumerable properties. Libraries like \`lodash.isEqual\` handle these.`,
      followUps: [
        {
          q: 'Should 0 and -0 be equal?',
          a: '`Object.is(0, -0)` is false, so this version says they differ. If you want `===` behavior for them, add a check: `if (typeof a === "number" && typeof b === "number") return a === b || (a !== a && b !== b);`.',
        },
        {
          q: 'Where is deep equality used in React?',
          a: 'React itself uses shallow, reference-based checks (`Object.is`) for state, props in `memo`, and hook dependencies — deep checks would be too slow on every render. Libraries sometimes use deep-equal for things like form "is dirty" checks.',
        },
      ],
    },
    {
      id: 'implement-deep-clone',
      title: 'Implement deepClone (Date, Map, Set, circular refs)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'deep-vs-shallow-copy',
      question: `Write \`deepClone(value)\`. Changing the copy must never change the original.

It must handle: primitives, arrays, plain objects, \`Date\`, \`Map\`, \`Set\`, and **circular references** (an object that points to itself).

\`\`\`javascript
const original = {
  name: 'Asha',
  createdAt: new Date('2024-01-01'),
  tags: new Set(['admin']),
  prefs: new Map([['theme', 'dark']]),
  address: { city: 'Pune' },
};
original.self = original;

const copy = deepClone(original);
copy.address.city = 'Delhi';
original.address.city;          // 'Pune'
copy.self === copy;             // true  (the cycle points to the copy)
copy.createdAt instanceof Date; // true
\`\`\`

Also: why not just \`JSON.parse(JSON.stringify(obj))\`?`,
      hints: [
        'Primitives (and functions) can be returned as they are. For objects, check the type and create a new empty container of the same type.',
        'Recurse into children: array items, object keys, Map entries, Set values.',
        'For cycles, keep a `WeakMap` from "original object" to "its copy". If you meet the same original again, return the copy you already made — and save the copy in the map **before** recursing.',
      ],
      solution: `**Idea:** walk the structure recursively and build new containers. A \`WeakMap\` remembers which originals were already copied, so cycles and shared references are reused instead of looping forever.

\`\`\`javascript
function deepClone(value, seen = new WeakMap()) {
  // Primitives and functions: nothing to copy
  if (value === null || typeof value !== 'object') return value;

  if (seen.has(value)) return seen.get(value); // already copied: reuse (handles cycles)

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);                     // register BEFORE recursing
    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)));
    return copy;
  }

  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    value.forEach((v) => copy.add(deepClone(v, seen)));
    return copy;
  }

  // Arrays and plain objects (keeps the prototype, e.g. class instances)
  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {  // includes symbol keys
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}

// Tests
const original = {
  name: 'Asha',
  createdAt: new Date('2024-01-01'),
  tags: new Set(['admin']),
  prefs: new Map([['theme', 'dark']]),
  address: { city: 'Pune' },
};
original.self = original;

const copy = deepClone(original);
copy.address.city = 'Delhi';
copy.tags.add('dev');

console.log(original.address.city);            // Pune
console.log(original.tags.has('dev'));         // false
console.log(copy.self === copy);               // true
console.log(copy.createdAt instanceof Date);   // true
console.log(copy.prefs.get('theme'));          // dark
\`\`\`

**Why it works:** every object gets a brand-new container, and every child is cloned the same way. Saving the copy in \`seen\` before visiting children means that when a child points back to a parent, we return the parent's copy instead of recursing forever.

**Why not JSON?** \`JSON.parse(JSON.stringify(obj))\`: turns \`Date\` into a string, drops \`undefined\` and functions, turns \`Map\`/\`Set\` into \`{}\`, \`NaN\`/\`Infinity\` into \`null\`, and **throws** on circular references.

**In real code:** use the built-in \`structuredClone(value)\` (modern browsers and Node 17+). It handles Date, Map, Set, cycles and more. It throws on functions and DOM nodes, and does not keep class prototypes.`,
      followUps: [
        {
          q: 'Why use a WeakMap and not a Map for "seen"?',
          a: 'A `WeakMap` does not keep its keys alive, so it never prevents the original objects from being garbage collected. It also only accepts objects as keys, which is exactly what we store.',
        },
        {
          q: 'What about very deep structures?',
          a: 'Recursion can overflow the call stack (thousands of levels). Rewrite it with an explicit stack/queue of `[original, copy]` pairs to make it iterative.',
        },
        {
          q: 'Is the spread operator a deep copy?',
          a: 'No. `{ ...obj }` and `[...arr]` are shallow: only the top level is new; nested objects are still shared references.',
        },
      ],
    },
    {
      id: 'lru-cache',
      title: 'Design an LRU cache with O(1) get and put',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'map-set-weakmap-weakset',
      question: `Build an \`LRUCache\` (Least Recently Used). It holds at most \`capacity\` items. When it is full and you add a new key, it removes the item that was **used least recently**.

- \`get(key)\` → value or \`-1\`. Reading a key counts as "using" it.
- \`put(key, value)\` → insert or update. Updating also counts as using.
- Both must be **O(1)** on average.

\`\`\`javascript
const cache = new LRUCache(2);
cache.put(1, 'one');
cache.put(2, 'two');
cache.get(1);        // 'one'  -> now 1 is most recent
cache.put(3, 'three'); // full: removes key 2 (least recently used)
cache.get(2);        // -1
cache.get(3);        // 'three'
\`\`\`

Real use: caching API responses or DB lookups in a Node server without memory growing forever.`,
      hints: [
        'You need two things fast: look up by key, and know which key is the oldest. A JavaScript `Map` remembers **insertion order**.',
        'To mark a key as "recently used", delete it and set it again — it moves to the end.',
        'The oldest key is the first one: `map.keys().next().value`.',
      ],
      solution: `**Idea:** a \`Map\` keeps keys in insertion order. Treat the **end** as "most recent" and the **start** as "least recent". Re-inserting a key on every access moves it to the end.

\`\`\`javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // key -> value, ordered oldest -> newest
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);       // move to the end = most recently used
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key); // update: remove old position
    this.map.set(key, value);

    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value; // first key = least recently used
      this.map.delete(oldestKey);
    }
  }
}

// Tests
const cache = new LRUCache(2);
cache.put(1, 'one');
cache.put(2, 'two');
console.log(cache.get(1));   // one
cache.put(3, 'three');       // evicts 2
console.log(cache.get(2));   // -1
console.log(cache.get(3));   // three
cache.put(1, 'ONE');         // update, 1 becomes newest
cache.put(4, 'four');        // evicts 3
console.log([...cache.map.keys()]); // [ 1, 4 ]
\`\`\`

**Why it works:** \`Map\` \`get\`, \`set\`, \`delete\` and reading the first key are all O(1) on average, and the spec guarantees iteration in insertion order. So "delete + set" is an O(1) "move to newest".

**Classic version (if the interviewer says "no Map ordering"):** a **hash map + doubly linked list**. The hash map gives O(1) lookup of a node; the list keeps the order. On access, unlink the node and move it to the head; on eviction, remove the tail. Both operations only change a few pointers, so they are O(1).`,
      followUps: [
        {
          q: 'How would you add a TTL (expire after N seconds)?',
          a: 'Store `{ value, expiresAt }`. In `get`, if `Date.now() > expiresAt`, delete the key and return -1. Optionally sweep expired keys periodically. Libraries like `lru-cache` on npm support both size and TTL.',
        },
        {
          q: 'Your Node app runs on 4 servers. Is an in-memory LRU enough?',
          a: 'Each server has its own cache, so data can differ between servers and is lost on restart. For shared caching use Redis (it can evict with an LRU policy). In-memory LRU is still great as a fast first layer for hot data.',
        },
      ],
    },
    {
      id: 'retry-with-backoff',
      title: 'Retry a failing async call with exponential backoff',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'async-await',
      question: `A third-party API (for example an LLM or payment API) sometimes fails with 429 (rate limit) or 503 (temporarily down). Write \`retry(fn, options)\`:

- Calls \`fn()\` (which returns a promise).
- On failure, waits and tries again, up to \`retries\` extra times.
- The wait doubles each time: 200ms, 400ms, 800ms... ("exponential backoff"), plus a little randomness ("jitter").
- Only retries errors that are worth retrying (a \`shouldRetry(err)\` option). A 400 "bad request" should fail immediately.
- If all attempts fail, reject with the **last** error.

\`\`\`javascript
const data = await retry(() => callApi(), {
  retries: 3,
  baseDelay: 200,
  shouldRetry: (err) => [429, 503].includes(err.status),
});
\`\`\``,
      hints: [
        'A simple `for` loop with `try/await/catch` inside an async function is the easiest structure.',
        'Delay for attempt n (starting at 0): `baseDelay * 2 ** n`. Add jitter: multiply by a random number between 0.5 and 1.5, or add `Math.random() * baseDelay`.',
        'Re-throw right away if it is the last attempt or `shouldRetry(err)` is false.',
      ],
      solution: `**Idea:** loop over attempts. Return on success. On failure, decide whether to give up; if not, sleep for an increasing delay and try again.

\`\`\`javascript
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retry(fn, { retries = 3, baseDelay = 200, maxDelay = 10_000, shouldRetry = () => true, onRetry } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);                 // "await" so errors land in catch
    } catch (err) {
      const isLast = attempt >= retries;
      if (isLast || !shouldRetry(err)) throw err; // give up: pass the real error up

      // exponential backoff: 200, 400, 800... capped, with random jitter (50%-150%)
      const backoff = Math.min(maxDelay, baseDelay * 2 ** attempt);
      const delay = Math.round(backoff * (0.5 + Math.random()));
      onRetry?.(err, attempt + 1, delay);
      await sleep(delay);
    }
  }
}

// Fake flaky API: fails twice with 503, then succeeds
let calls = 0;
function callApi() {
  calls++;
  if (calls < 3) {
    const err = new Error('Service unavailable');
    err.status = 503;
    return Promise.reject(err);
  }
  return Promise.resolve({ ok: true });
}

(async () => {
  const data = await retry(callApi, {
    retries: 3,
    baseDelay: 100,
    shouldRetry: (err) => [429, 503].includes(err.status),
    onRetry: (err, n, ms) => console.log('retry #' + n + ' after ~' + ms + 'ms (' + err.status + ')'),
  });
  console.log(data, 'after', calls, 'calls'); // { ok: true } after 3 calls

  // A 400 is not retried
  const badRequest = () => Promise.reject(Object.assign(new Error('Bad request'), { status: 400 }));
  try {
    await retry(badRequest, { shouldRetry: (err) => err.status >= 500 || err.status === 429 });
  } catch (err) {
    console.log('gave up immediately:', err.message); // gave up immediately: Bad request
  }
})();
\`\`\`

**Why it works:** \`return await fn()\` inside \`try\` means a rejection is caught by our \`catch\`. The doubling delay gives a struggling server time to recover. **Jitter** spreads retries out, so 1,000 clients that failed at the same moment do not all retry at the same moment (the "thundering herd" problem).

**Edge cases:** only retry **idempotent** operations (safe to repeat) — or send an idempotency key for payments. Respect a \`Retry-After\` header from 429 responses when the API sends one. Cap the delay (\`maxDelay\`) so it never waits minutes.`,
      followUps: [
        {
          q: 'What is a circuit breaker and how is it different?',
          a: 'Retry handles one call. A circuit breaker watches many calls: after too many failures it "opens" and fails fast for a while without calling the service at all, then lets a few test calls through. It protects both you and the struggling service.',
        },
        {
          q: 'How would you let the caller cancel the retries?',
          a: 'Accept an `AbortSignal`. Check `signal.aborted` before each attempt, pass the signal into `fn` (e.g. to `fetch`), and make `sleep` reject when the signal fires (listen to its `abort` event).',
        },
      ],
    },
    {
      id: 'promise-pool-concurrency',
      title: 'Run async tasks with a concurrency limit',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'promise-combinators',
      question: `You need to resize 500 images (or call an API for 500 users). \`Promise.all\` on all of them at once would overload the server or hit rate limits. Write \`runWithLimit(tasks, limit)\`:

- \`tasks\` is an array of functions that return promises (they must not start until you call them).
- At most \`limit\` tasks run at the same time.
- As soon as one finishes, the next one starts.
- Resolve with all results **in the original order**. Reject if any task fails.

\`\`\`javascript
const tasks = [300, 100, 200, 50].map((ms, i) => () =>
  new Promise((r) => setTimeout(() => r('task' + i), ms)));

await runWithLimit(tasks, 2); // ['task0', 'task1', 'task2', 'task3']
\`\`\``,
      hints: [
        'Why are tasks functions and not promises? Because a promise is already running when it exists. A function lets you decide **when** to start.',
        'Start `limit` "workers". Each worker is an async loop: take the next task index, run it, store the result at that index, repeat until no tasks are left.',
        'A shared `nextIndex` counter is safe because JavaScript runs one piece of code at a time — `nextIndex++` cannot be interrupted.',
      ],
      solution: `**Idea:** create \`limit\` workers that share one queue (a counter into the tasks array). Each worker keeps pulling the next task until the queue is empty. Waiting for all workers with \`Promise.all\` means waiting for all tasks.

\`\`\`javascript
async function runWithLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0; // shared queue position

  async function worker() {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;          // claim a task (safe: JS is single-threaded)
      results[i] = await tasks[i]();  // run it; store in the original position
    }
  }

  const workerCount = Math.min(limit, tasks.length);
  await Promise.all(Array.from({ length: workerCount }, worker)); // rejects if any task throws
  return results;
}

// Test: track how many run at the same time
let running = 0;
let maxRunning = 0;
const start = Date.now();
const tasks = [300, 100, 200, 50].map((ms, i) => async () => {
  running++;
  maxRunning = Math.max(maxRunning, running);
  await new Promise((r) => setTimeout(r, ms));
  running--;
  return 'task' + i;
});

runWithLimit(tasks, 2).then((results) => {
  console.log(results);                          // [ 'task0', 'task1', 'task2', 'task3' ]
  console.log('max at once:', maxRunning);       // max at once: 2
  console.log('took ~' + Math.round((Date.now() - start) / 50) * 50 + 'ms'); // took ~350ms
});
\`\`\`

**Timeline with limit 2:** task0 (300ms) and task1 (100ms) start. At 100ms task1 ends, its worker starts task2 (ends at 300ms). At 300ms both task0 and task2 end; task3 starts and ends at 350ms. Total ≈ 350ms instead of 650ms sequential.

**Why it works:** there are never more than \`limit\` workers, and each worker runs one task at a time, so at most \`limit\` tasks are in flight. Writing to \`results[i]\` keeps the input order.

**Edge cases:** an empty task list resolves to \`[]\`. When one task fails, \`Promise.all\` rejects right away, but tasks already running are not stopped. If you want every result even when some fail, wrap each task call in try/catch and store \`{ status, value | reason }\` like \`allSettled\`.`,
      followUps: [
        {
          q: 'Which libraries do this in real projects?',
          a: '`p-limit` / `p-map` on npm. Many SDKs and job queues (like BullMQ workers) also have a concurrency option. Writing it yourself is the interview test; in production a small well-tested library is fine.',
        },
        {
          q: 'How is this different from batching (chunks of 5 with Promise.all)?',
          a: 'Batching waits for the **slowest** task in each batch before starting the next batch, so slots sit idle. A pool starts a new task the moment any slot is free, so it finishes sooner.',
        },
        {
          q: 'Limit concurrency vs rate limit — same thing?',
          a: 'No. Concurrency = how many at the same time. Rate limit = how many per time window (e.g. 10 per second). An API with "60 requests/minute" needs a rate limiter (token bucket) even if each call is fast.',
        },
      ],
    },
    {
      id: 'cancel-stale-requests',
      title: 'Search shows old results: cancel stale requests with AbortController',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'fetch-abortcontroller',
      question: `A product search box calls the API on every (debounced) input change. Users type "iphone", but sometimes the list shows results for "iph". The network tab shows the "iph" request was slow and finished **after** the "iphone" request.

\`\`\`javascript
async function onSearchInput(query) {
  const res = await fetch('/api/search?q=' + encodeURIComponent(query));
  const data = await res.json();
  renderResults(data); // whichever response arrives LAST wins
}
\`\`\`

1. What is this bug called and why does debounce not fully fix it?
2. Fix it so only the latest query can render, and older requests are really cancelled.
3. Make the fix reusable: a \`latestOnly(asyncFn)\` wrapper that gives each call an \`AbortSignal\` and aborts the previous call.`,
      hints: [
        'This is a **race condition**: two async operations finish in a different order than they started.',
        'Keep the `AbortController` of the current request outside the function. Before starting a new request, call `abort()` on the old one.',
        'An aborted `fetch` rejects with an error whose `name` is `"AbortError"`. Ignore that one; handle real errors normally.',
      ],
      solution: `**1. The bug:** it is a **race condition** ("out-of-order responses"). Debounce reduces how many requests are sent, but if the user pauses, types again, and the first request is slower, two requests are still in flight and the slower, **older** one can finish last and overwrite the screen.

**2 + 3. Fix with a reusable wrapper:** every new call aborts the previous one. The aborted \`fetch\` really stops (the browser cancels the HTTP request), and its promise rejects with \`AbortError\`, so its \`renderResults\` never runs.

\`\`\`javascript
// Wraps an async function so only the latest call matters
function latestOnly(asyncFn) {
  let controller = null;

  return async function (...args) {
    controller?.abort();                // cancel the previous call, if any
    controller = new AbortController();
    const { signal } = controller;
    return asyncFn(...args, signal);    // the function must pass the signal on (to fetch)
  };
}

const search = latestOnly(async (query, signal) => {
  const res = await fetch('/api/search?q=' + encodeURIComponent(query), { signal });
  if (!res.ok) throw new Error('Search failed: ' + res.status);
  return res.json();
});

async function onSearchInput(query) {
  try {
    const data = await search(query);
    renderResults(data);
  } catch (err) {
    if (err.name === 'AbortError') return; // expected: a newer search replaced this one
    showError(err);                        // real failure
  }
}
\`\`\`

**Test of the idea in Node** (a fake \`fetch\` with random delays that respects the signal):

\`\`\`javascript
function latestOnly(asyncFn) {
  let controller = null;
  return async function (...args) {
    controller?.abort();
    controller = new AbortController();
    return asyncFn(...args, controller.signal);
  };
}

// fake API: slower for shorter queries, and listens to the abort signal
function fakeFetch(query, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve('results for ' + query), 300 - query.length * 40);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

const search = latestOnly(fakeFetch);
for (const q of ['i', 'iph', 'iphone']) {
  search(q)
    .then((data) => console.log('render:', data))
    .catch((err) => console.log('cancelled:', q, '(' + err.name + ')'));
}
// cancelled: i (AbortError)
// cancelled: iph (AbortError)
// render: results for iphone
\`\`\`

**Why it works:** the closure keeps exactly one "current" controller. Starting a new call aborts the old one, so at most one request is alive and only the latest can resolve. Unlike just ignoring old responses, aborting also saves bandwidth and server work.

**In React:** create the controller inside \`useEffect\` and call \`controller.abort()\` in the cleanup. Libraries like TanStack Query do this kind of cancellation for you (they pass a \`signal\` to your query function).`,
      followUps: [
        {
          q: 'What if the async work is not fetch (e.g. a library without signal support)?',
          a: 'Use a request id: `const id = ++latestId;` before the call, and after `await` check `if (id !== latestId) return;`. The old work still finishes, but its result is ignored.',
        },
        {
          q: 'Can one AbortController cancel several things?',
          a: 'Yes. Pass the same `signal` to several fetches, to `addEventListener(..., { signal })`, and to Node APIs that accept it. One `abort()` stops them all — great for "user left the page" cleanup.',
        },
        {
          q: 'Does aborting on the client stop the work on the server?',
          a: 'Not automatically. The server sees the connection close (in Node, the request emits `close`); it must listen for that and stop expensive work (e.g. cancel the DB query or LLM stream) itself.',
        },
      ],
    },
    {
      id: 'implement-my-promise',
      title: 'Implement a simple Promise class (then, catch, chaining)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'polyfill-promise',
      question: `Implement \`MyPromise\` with:

- \`new MyPromise((resolve, reject) => ...)\`
- \`then(onFulfilled, onRejected)\` that returns a **new** promise (so you can chain).
- \`catch(onRejected)\`
- Callbacks always run **asynchronously** (as microtasks), even if the promise is already settled.
- If a callback returns a promise (or thenable), the chain waits for it.

\`\`\`javascript
new MyPromise((resolve) => setTimeout(() => resolve(1), 100))
  .then((x) => x + 1)
  .then((x) => new MyPromise((r) => setTimeout(() => r(x * 10), 50)))
  .then((x) => { throw new Error('boom ' + x); })
  .catch((err) => console.log(err.message)); // boom 20
\`\`\``,
      hints: [
        'State: `"pending" | "fulfilled" | "rejected"`, plus `value`. Once settled it can never change.',
        'While pending, `then` must save the callbacks in a list. When the promise settles, run every saved callback. Use `queueMicrotask` to run them asynchronously.',
        '`then` returns `new MyPromise((resolve, reject) => ...)`. Inside, call the user callback in `try/catch`, and resolve the new promise with its return value. Let `resolve` itself handle thenables: if the value has a `.then`, call it with `resolve` and `reject`.',
      ],
      solution: `**Idea:** a promise is a small state machine plus a list of "what to do when settled". \`then\` creates the next promise in the chain and connects the result of the callback to it.

\`\`\`javascript
class MyPromise {
  #state = 'pending';
  #value;
  #handlers = []; // callbacks waiting for settlement

  constructor(executor) {
    let called = false; // resolve/reject only work once
    const resolve = (value) => {
      if (called) return;
      called = true;
      this.#resolveWith(value);
    };
    const reject = (reason) => {
      if (called) return;
      called = true;
      this.#settle('rejected', reason);
    };
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err); // a throw inside the executor rejects the promise
    }
  }

  #resolveWith(value) {
    if (value === this) return this.#settle('rejected', new TypeError('Cannot resolve promise with itself'));
    // Adopt thenables: wait for them instead of resolving with the object itself
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      let then;
      try {
        then = value.then;
      } catch (err) {
        return this.#settle('rejected', err);
      }
      if (typeof then === 'function') {
        let done = false;
        try {
          then.call(
            value,
            (v) => { if (!done) { done = true; this.#resolveWith(v); } },
            (r) => { if (!done) { done = true; this.#settle('rejected', r); } },
          );
        } catch (err) {
          if (!done) { done = true; this.#settle('rejected', err); }
        }
        return;
      }
    }
    this.#settle('fulfilled', value);
  }

  #settle(state, value) {
    if (this.#state !== 'pending') return; // can only settle once
    this.#state = state;
    this.#value = value;
    this.#handlers.forEach((h) => this.#runHandler(h));
    this.#handlers = [];
  }

  #runHandler({ onFulfilled, onRejected, resolve, reject }) {
    queueMicrotask(() => {               // always async, like real promises
      const callback = this.#state === 'fulfilled' ? onFulfilled : onRejected;
      if (typeof callback !== 'function') {
        // No callback for this case: pass the value/error down the chain
        return this.#state === 'fulfilled' ? resolve(this.#value) : reject(this.#value);
      }
      try {
        resolve(callback(this.#value));  // the return value feeds the next promise
      } catch (err) {
        reject(err);                     // a throw rejects the next promise
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === 'pending') this.#handlers.push(handler);
      else this.#runHandler(handler);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    return value instanceof MyPromise ? value : new MyPromise((res) => res(value));
  }
}

// Tests
new MyPromise((resolve) => setTimeout(() => resolve(1), 100))
  .then((x) => x + 1)
  .then((x) => new MyPromise((r) => setTimeout(() => r(x * 10), 50)))
  .then((x) => { throw new Error('boom ' + x); })
  .catch((err) => console.log(err.message)); // boom 20

MyPromise.resolve('sync?').then(console.log);
console.log('this prints first');            // callbacks are async

new MyPromise((_, reject) => reject(new Error('lost?')))
  .then((x) => x * 2)                          // skipped: no rejection handler
  .catch((e) => console.log('caught:', e.message)); // caught: lost?

MyPromise.resolve(5).then(async (x) => x + 1).then((x) => console.log('works with real promises:', x)); // 6
\`\`\`

**Why it works:**

- The state can only change once (\`#settle\` returns if not pending).
- \`then\` always returns a new promise whose \`resolve\`/\`reject\` are called with the callback's result — that is what makes chaining work.
- If a callback is missing, the value or error "falls through" to the next \`then\`, which is how one \`.catch\` at the end handles errors from any step.
- \`#resolveWith\` follows thenables, so returning a promise from a callback makes the chain wait for it — this also makes it compatible with real promises and \`async\` functions.

**Not included:** \`finally\`, the static combinators, and unhandled-rejection tracking — mention them if time is short.`,
      followUps: [
        {
          q: 'Why must then callbacks run asynchronously even for an already-resolved promise?',
          a: 'Consistency. If they sometimes ran synchronously, code after `.then(...)` would sometimes run before and sometimes after the callback (the "Zalgo" problem). Always-async makes the order predictable.',
        },
        {
          q: 'How would you add finally?',
          a: '`finally(fn) { return this.then((v) => MyPromise.resolve(fn()).then(() => v), (e) => MyPromise.resolve(fn()).then(() => { throw e; })); }` — it runs `fn` either way and passes the original value or error through.',
        },
      ],
    },
  ],
};
