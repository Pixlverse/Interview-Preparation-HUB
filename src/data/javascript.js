// JavaScript — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'javascript',
  title: 'JavaScript',
  icon: '🟨',
  description: 'The language behind everything you build. Core ideas first, then async, the event loop, and advanced patterns.',
  definitionTitle: 'What is JavaScript?',
  definition: `**JavaScript (JS)** is the programming language of the web. Every browser can run it, so it is what makes web pages interactive — clicking buttons, showing pop-ups, loading data without refreshing the page. With **Node.js**, the same language also runs on servers.

It is **dynamically typed** (a variable can hold any type of value), **single-threaded** (it does one thing at a time), and **asynchronous** (it can start slow work like a network call and carry on, then handle the result later using the event loop).

**One-line answer:** "JavaScript is a dynamically typed, single-threaded language that runs in every browser and on servers through Node.js, and it handles slow work asynchronously using the event loop."`,
  topics: [
    {
      id: 'data-types',
      title: 'Data Types (Primitives vs Objects)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'JavaScript has 7 primitive types (copied by value) and objects (shared by reference).',
      what: `Every value in JavaScript has a **type**. There are two groups:

- **Primitives** (simple values): \`string\`, \`number\`, \`boolean\`, \`undefined\`, \`null\`, \`bigint\`, \`symbol\`. There are 7.
- **Objects** (everything else): plain objects, arrays, functions, dates, maps, and so on.

Primitives are **copied by value**. Objects are **shared by reference**: the variable holds an "address", not the object itself.

#### Deeper version
Primitives are **immutable**. \`str.toUpperCase()\` does not change \`str\`; it returns a new string. When you call a method on a primitive, JavaScript wraps it in a temporary object (\`String\`, \`Number\`...) for a moment, then throws the wrapper away. This is called **auto-boxing**.

\`typeof\` tells you the type, with two famous quirks: \`typeof null\` is \`"object"\` (an old bug kept for compatibility) and \`typeof function(){}\` is \`"function"\` even though functions are objects. To check for an array, use \`Array.isArray()\`.`,
      why: `Knowing value vs reference explains many real bugs: changing an object inside a function changes it for the caller, \`===\` on two "equal-looking" objects is \`false\`, and React does not re-render when you mutate state in place. It also explains why \`typeof\` checks sometimes lie.`,
      analogy: `A primitive is like a photocopy of a document: you give someone a copy, and their scribbles do not touch yours. An object is like sharing a Google Doc link: you both hold the same link, so when they edit, you see the change.`,
      code: [
        {
          title: 'Value vs reference',
          lang: 'javascript',
          code: `// Primitives: copied by value
let a = 10;
let b = a;   // b gets its own copy
b = 20;
console.log(a); // 10

// Objects: shared by reference
const user1 = { name: 'Asha' };
const user2 = user1;  // same object, two names
user2.name = 'Ravi';
console.log(user1.name); // "Ravi"

// Two different objects are never equal, even with the same content
console.log({ x: 1 } === { x: 1 }); // false`,
        },
        {
          title: 'typeof quirks',
          lang: 'javascript',
          code: `console.log(typeof 'hi');        // "string"
console.log(typeof 42);          // "number"
console.log(typeof 10n);         // "bigint"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object"  <- famous bug
console.log(typeof []);          // "object"
console.log(Array.isArray([]));  // true
console.log(typeof (() => {}));  // "function"
console.log(typeof NaN);         // "number"  <- NaN is a number!`,
        },
      ],
      output: `In the first block, changing \`b\` does not touch \`a\`, because numbers are copied. But changing \`user2.name\` also changes \`user1.name\`, because both variables point to the **same** object. Comparing two separate objects with \`===\` gives \`false\`, because \`===\` compares the references (addresses), not the content.

In the second block, notice \`typeof null\` is \`"object"\`, arrays are \`"object"\`, and \`NaN\` ("Not a Number") is of type \`"number"\`.`,
      questions: [
        {
          q: 'What are the primitive types in JavaScript?',
          a: 'string, number, boolean, undefined, null, bigint and symbol. Everything else is an object.',
        },
        {
          q: 'What is the difference between null and undefined?',
          a: '`undefined` means "no value was given yet" (JavaScript sets it). `null` means "empty on purpose" (you set it). `null == undefined` is true, but `null === undefined` is false.',
        },
        {
          q: 'Why is typeof null "object"?',
          a: 'It is a bug from the first version of JavaScript. Fixing it would break old websites, so it was kept. Check for null with `value === null`.',
        },
        {
          q: 'How do you check if a value is an array?',
          a: 'Use `Array.isArray(value)`. `typeof` returns "object" for arrays, so it cannot tell them apart from plain objects.',
        },
      ],
      spoken: `"JavaScript has seven primitive types: string, number, boolean, undefined, null, bigint and symbol. Everything else is an object, including arrays and functions. The key difference is that primitives are copied by value, while objects are passed by reference. So if I pass an object to a function and change it there, the caller sees the change. That's also why two objects with the same content are not equal with triple equals. And I remember the quirks: typeof null is object, and I use Array.isArray to check arrays."`,
      mistakes: [
        'Saying JavaScript has 5 or 6 primitives. There are 7: do not forget `bigint` and `symbol`.',
        'Using `typeof x === "object"` to check for an object — it is also true for `null` and arrays.',
        'Thinking `const obj2 = obj1` makes a copy. It only copies the reference; use spread or `structuredClone` for a copy.',
        'Follow-up trap: "Is JavaScript pass-by-reference?" No. It is always pass-by-value, but for objects the value is a reference. Re-assigning the parameter inside the function does not change the caller\'s variable.',
      ],
      takeaway: 'Primitives are copied, objects are shared — most "why did my data change?" bugs come from this.',
    },
    {
      id: 'var-let-const',
      title: 'var, let and const',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Three ways to declare variables. Use const by default, let when the value changes, and avoid var.',
      what: `JavaScript gives us three keywords to create a variable: \`var\`, \`let\` and \`const\`.

- \`var\` is the old way (before 2015). It is **function-scoped**: it is visible in the whole function, even outside the \`{ }\` block where you wrote it.
- \`let\` and \`const\` came in ES6 (2015). They are **block-scoped**: they live only inside the nearest \`{ }\`.
- \`const\` means you cannot **re-assign** the variable. It does not mean the value is frozen.

#### Deeper version
All three are "hoisted" (JavaScript knows about them before running the code). But \`var\` starts as \`undefined\`, while \`let\` and \`const\` stay in a **Temporal Dead Zone (TDZ)** until their line runs. Touching them early throws a \`ReferenceError\`.`,
      why: `\`var\` caused real bugs: variables leaked out of \`if\` blocks and \`for\` loops, and you could declare the same name twice by accident. \`let\` and \`const\` fix this by keeping variables inside their block, and \`const\` tells the reader "this will not be re-assigned", which makes code easier to trust.`,
      analogy: `Think of \`var\` as writing on the office whiteboard: everyone in the whole office (the function) can see it. \`let\` is a sticky note on your own desk (the block): only you see it. \`const\` is a sticky note written in pen: you can't rewrite the note, but if it says "my box", you can still put things inside the box.`,
      code: [
        {
          title: 'Block scope and re-assignment',
          lang: 'javascript',
          code: `function demo() {
  if (true) {
    var a = 1;   // function-scoped
    let b = 2;   // block-scoped
    const c = 3; // block-scoped, cannot be re-assigned
  }
  console.log(a);          // 1  -> var leaked out of the if block
  console.log(typeof b);   // "undefined" -> b does not exist here
}
demo();

const user = { name: 'Asha' };
user.name = 'Ravi';        // OK: we change the object, not the variable
console.log(user.name);    // "Ravi"
// user = {};              // TypeError: Assignment to constant variable.`,
        },
        {
          title: 'The classic loop bug',
          lang: 'javascript',
          code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let:', j), 0);
}`,
        },
      ],
      output: `In the first example, \`a\` is printed as \`1\` because \`var\` ignores the \`if\` block. \`b\` does not exist outside its block, so \`typeof b\` is \`"undefined"\`. Changing \`user.name\` works because \`const\` only locks the variable, not the object.

In the loop example the output is \`var: 3\` three times, then \`let: 0\`, \`let: 1\`, \`let: 2\`. With \`var\` there is only **one** \`i\` shared by all callbacks, and by the time they run the loop is done (\`i\` is 3). With \`let\`, each loop round gets its **own new** \`j\`.`,
      questions: [
        {
          q: 'What is the difference between var, let and const?',
          a: '`var` is function-scoped and can be re-declared. `let` and `const` are block-scoped and cannot be re-declared in the same scope. `const` also cannot be re-assigned after it is created.',
        },
        {
          q: 'What is the Temporal Dead Zone?',
          a: 'It is the time between the start of a block and the line where a `let` or `const` variable is declared. The variable exists but you cannot use it yet; reading it throws a `ReferenceError`.',
        },
        {
          q: 'Can you change an object declared with const?',
          a: 'Yes. `const` stops re-assignment of the variable, not changes inside the object. You can add or edit properties. To stop that you need `Object.freeze()` (which is shallow).',
        },
        {
          q: 'Why does a for loop with var and setTimeout print the same number?',
          a: 'Because `var` creates one shared variable for the whole loop. The callbacks run after the loop ends, so they all see the final value. `let` creates a new binding per iteration, so each callback sees its own value.',
        },
      ],
      spoken: `"\`var\`, \`let\` and \`const\` all declare variables, but they differ in scope and re-assignment. \`var\` is function-scoped and gets hoisted with the value \`undefined\`, which can cause bugs like variables leaking out of loops. \`let\` and \`const\` are block-scoped and sit in the Temporal Dead Zone until they are declared, so using them early throws an error. \`const\` can't be re-assigned, but the object it points to can still change. In my code I use \`const\` by default, \`let\` only when the value really changes, and I avoid \`var\`."`,
      mistakes: [
        'Saying `const` makes a value immutable. It only blocks re-assignment; objects and arrays can still be changed.',
        'Saying `let` and `const` are "not hoisted". They are hoisted, but they stay in the Temporal Dead Zone until their declaration line.',
        'Follow-up trap: "What does `typeof` return for a variable in the TDZ?" It throws a `ReferenceError`; it does not return "undefined".',
        'Using `var` inside loops with async callbacks and getting the same final value every time.',
      ],
      takeaway: 'Use `const` by default, `let` when the value must change, and never `var` — block scope prevents a whole class of bugs.',
    },
    {
      id: 'numbers-floating-point',
      title: 'Numbers, NaN, Floating-Point and BigInt',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'All numbers are 64-bit floating point, so 0.1 + 0.2 !== 0.3; integers are only safe up to 2^53 - 1; BigInt handles bigger ones.',
      what: `JavaScript has one main number type, \`number\`. Integers and decimals are the same type: \`5\` and \`5.0\` are equal.

Three things trip people up:
- **Decimals are not exact**: \`0.1 + 0.2\` is \`0.30000000000000004\`.
- **NaN** ("Not a Number") is the result of bad math, like \`'abc' * 2\`. It is of type \`number\` and is not equal to itself.
- **Big integers lose precision** after \`Number.MAX_SAFE_INTEGER\` (9007199254740991, which is 2^53 - 1).

For huge integers, use **BigInt**: \`123n\` or \`BigInt('123')\`.

#### Deeper version
Numbers are stored as **IEEE 754 double-precision** floats: 64 bits split into sign, exponent and fraction. Many decimals (like 0.1) cannot be written exactly in binary, just like 1/3 cannot be written exactly in decimal, so tiny rounding errors appear.

How to deal with it:
- **Money**: store amounts in the smallest unit as integers (paise/cents). Stripe does this: \`amount: 1999\` means 19.99.
- **Comparing decimals**: \`Math.abs(a - b) < Number.EPSILON\` (or a tolerance that fits your scale).
- **Displaying**: \`toFixed(2)\` returns a **string**; \`Intl.NumberFormat\` formats currency properly.

Other details: there is \`Infinity\` and \`-Infinity\` (\`1 / 0\`), and \`-0\` exists (\`Object.is(0, -0)\` is false). BigInt cannot be mixed with normal numbers in math (\`1n + 1\` throws a \`TypeError\`), does not work with \`Math\` methods, and \`JSON.stringify\` throws on it. Large ids from databases (like 64-bit Twitter/Snowflake ids) should be sent as **strings**.`,
      why: `Floating-point errors cause real bugs in carts, invoices and payments. Large numeric ids from APIs silently change their last digits. "Why is 0.1 + 0.2 not 0.3?" is a classic interview opener.`,
      analogy: `Floating point is like measuring with a ruler that only has certain tick marks. Most lengths fall between ticks, so you round to the nearest one. Usually that is fine, but add many rounded measurements and the small errors show up.`,
      code: [
        {
          title: 'Precision problems and fixes',
          lang: 'javascript',
          code: `console.log(0.1 + 0.2);                 // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);         // false
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true

// Money: work in the smallest unit (paise / cents)
const pricePaise = 1999;                // ₹19.99
const totalPaise = pricePaise * 3;      // 5997, exact
console.log((totalPaise / 100).toFixed(2)); // "59.97" (a string)

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
console.log(inr.format(totalPaise / 100));  // "₹59.97"`,
        },
        {
          title: 'NaN, safe integers, BigInt',
          lang: 'javascript',
          code: `const bad = 'abc' * 2;
console.log(bad, typeof bad);       // NaN "number"
console.log(Number.isNaN(bad));     // true

console.log(Number.MAX_SAFE_INTEGER);            // 9007199254740991
console.log(9007199254740992 === 9007199254740993); // true (!) precision lost

const big = 9007199254740993n;      // BigInt literal
console.log(big + 2n);              // 9007199254740995n
console.log(typeof big);            // "bigint"
// big + 1                          // TypeError: Cannot mix BigInt and other types
console.log(Number.isSafeInteger(2 ** 53)); // false`,
        },
      ],
      output: `In the first block, \`0.1 + 0.2\` is slightly more than 0.3, so \`===\` fails, but comparing with a tiny tolerance works. Working in paise keeps the money math exact, and \`Intl.NumberFormat\` prints "₹59.97".

In the second block, bad math gives \`NaN\`, which is still a \`number\`. Above \`MAX_SAFE_INTEGER\`, two different integers become "equal" because the float cannot tell them apart. BigInt keeps exact values, but cannot be mixed with normal numbers.`,
      questions: [
        {
          q: 'Why is 0.1 + 0.2 not equal to 0.3?',
          a: 'Numbers are binary floating point (IEEE 754). 0.1 and 0.2 cannot be stored exactly in binary, so a tiny rounding error appears. Compare with a tolerance, or use integers for money.',
        },
        {
          q: 'How should you handle money in JavaScript?',
          a: 'Store and calculate in the smallest unit as integers (cents/paise), like Stripe does, and format only for display with `Intl.NumberFormat`. Or use a decimal library.',
        },
        {
          q: 'What is Number.MAX_SAFE_INTEGER?',
          a: '2^53 - 1 (9007199254740991). Beyond it, not every integer can be represented exactly. Use BigInt or strings for larger ids.',
        },
        {
          q: 'What is BigInt?',
          a: 'A primitive type for integers of any size, written with an `n` suffix. It cannot be mixed with `number` in arithmetic and is not supported by `JSON.stringify` by default.',
        },
      ],
      spoken: `"JavaScript numbers are 64-bit floating point, so decimals like 0.1 can't be stored exactly, which is why 0.1 plus 0.2 isn't exactly 0.3. For comparisons I use a small tolerance, and for money I always work in the smallest unit as integers, the same way Stripe uses amounts in cents, then format with Intl.NumberFormat. Integers are only safe up to 2 to the 53 minus 1; beyond that I use BigInt or keep ids as strings. And NaN is a number type that isn't equal to itself, so I check it with Number.isNaN."`,
      mistakes: [
        'Doing money math with decimals (`19.99 * 3`) and getting values like `59.97000000000001`.',
        'Forgetting that `toFixed` returns a string, then adding it to another number ("10.00" + 5 = "10.005").',
        'Parsing large 64-bit ids from JSON as numbers — the last digits change. Send them as strings.',
        'Follow-up trap: "What is `typeof NaN`?" `"number"`. And `NaN === NaN` is false, so use `Number.isNaN`.',
      ],
      takeaway: 'Numbers are floats: compare decimals with a tolerance, do money in integers, use BigInt past 2^53.',
    },
    {
      id: 'truthy-falsy',
      title: 'Truthy and Falsy Values',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Only 8 values are falsy (false, 0, -0, 0n, "", null, undefined, NaN); everything else is truthy.',
      what: `When JavaScript needs a true/false answer (in an \`if\`, \`&&\`, \`||\`, \`!\`), it converts the value to a boolean.

- **Falsy** values become \`false\`. There are only 8: \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\` (empty string), \`null\`, \`undefined\`, \`NaN\`.
- **Truthy** values are **everything else**, including \`"0"\`, \`"false"\`, \`[]\` and \`{}\`.

#### Deeper version
\`&&\` and \`||\` do not return \`true\`/\`false\`. They return one of the **original values**:
- \`a || b\` returns \`a\` if it is truthy, otherwise \`b\`.
- \`a && b\` returns \`a\` if it is falsy, otherwise \`b\`.

They also **short-circuit**: if the left side decides the answer, the right side never runs. \`!!value\` (double NOT) is a common way to turn any value into a real boolean, same as \`Boolean(value)\`.`,
      why: `We use truthy checks all the time: \`if (user)\`, \`items.length && <List />\`, \`name || 'Guest'\`. Knowing the exact falsy list prevents bugs like treating a valid \`0\` price or empty string as "missing".`,
      analogy: `Think of a security guard who only has a short "not allowed" list of 8 names. Anyone not on that list gets in — even someone named "0" or someone carrying an empty bag ([]).`,
      code: [
        {
          title: 'Falsy list and surprises',
          lang: 'javascript',
          code: `const values = [false, 0, -0, 0n, '', null, undefined, NaN, '0', 'false', [], {}];

values.forEach((v) => console.log(String(v).padEnd(10), Boolean(v)));
// The first 8 print false; '0', 'false', [] and {} print true`,
        },
        {
          title: '|| and && return values, not booleans',
          lang: 'javascript',
          code: `console.log(null || 'Guest');   // "Guest"
console.log('Asha' || 'Guest'); // "Asha"
console.log(0 || 10);           // 10   <- 0 is falsy, maybe a bug!
console.log(0 ?? 10);           // 0    <- ?? only skips null/undefined

console.log(true && 'shown');   // "shown"
console.log(0 && 'shown');      // 0    <- in React this renders "0"!

console.log(!!'hello');         // true`,
        },
      ],
      output: `The first block prints \`false\` for the 8 falsy values and \`true\` for \`'0'\`, \`'false'\`, \`[]\` and \`{}\`.

In the second block, \`||\` returns the first truthy value, so \`0 || 10\` gives \`10\` — a bug if 0 was a real value. \`??\` keeps \`0\`. \`0 && 'shown'\` returns \`0\`, which is why \`{count && <Badge />}\` in React shows a "0" on the screen.`,
      questions: [
        {
          q: 'List all falsy values.',
          a: '`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy.',
        },
        {
          q: 'Is an empty array truthy or falsy?',
          a: 'Truthy. All objects are truthy, including `[]` and `{}`. To check for an empty array use `arr.length === 0`.',
        },
        {
          q: 'What does `a || b` return?',
          a: 'It returns `a` if `a` is truthy, otherwise `b`. It returns the actual value, not a boolean.',
        },
        {
          q: 'Why does `{count && <Item />}` sometimes show 0 in React?',
          a: 'Because when `count` is `0`, `&&` returns `0`, and React renders numbers. Use `count > 0 && <Item />` instead.',
        },
      ],
      spoken: `"In JavaScript, any value can be used where a boolean is expected. There are only eight falsy values: false, zero, minus zero, zero n for BigInt, empty string, null, undefined and NaN. Everything else is truthy, including empty arrays, empty objects and the string zero. I also remember that the OR and AND operators return the actual values, not booleans, and they short-circuit. That's why I use the nullish coalescing operator when zero or an empty string is a valid value."`,
      mistakes: [
        'Thinking `[]` or `{}` is falsy. They are truthy; check `.length` or `Object.keys(obj).length`.',
        'Using `||` for defaults when `0` or `""` are valid values. Use `??` instead.',
        'Writing `{list.length && <List />}` in React and seeing a stray `0` on screen.',
        'Follow-up trap: "Is `"0"` truthy?" Yes — it is a non-empty string. But `"0" == false` is true because of type coercion. Two different rules!',
      ],
      takeaway: 'Memorize the 8 falsy values; everything else, even `[]` and `"0"`, is truthy.',
    },
    {
      id: 'equality',
      title: '== vs === (Loose vs Strict Equality)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: '=== compares value and type with no conversion; == converts types first and gives surprising results.',
      what: `JavaScript has two ways to check equality:

- \`===\` (**strict equality**): true only if the type **and** value are the same. No conversion.
- \`==\` (**loose equality**): if the types differ, JavaScript first **converts** one or both values, then compares.

So \`5 === '5'\` is \`false\`, but \`5 == '5'\` is \`true\`.

#### Deeper version
Rough rules of \`==\` when types differ:
- \`null == undefined\` is true, and they are not equal to anything else.
- number vs string: the string is turned into a number.
- boolean vs anything: the boolean becomes a number first (\`true\` → 1, \`false\` → 0).
- object vs primitive: the object is turned into a primitive (via \`valueOf\`/\`toString\`).

For objects, both \`==\` and \`===\` compare **references**. \`NaN\` is not equal to anything, not even itself. \`Object.is()\` is a third option: like \`===\`, but \`Object.is(NaN, NaN)\` is true and \`Object.is(0, -0)\` is false. React uses \`Object.is\` to compare state.`,
      why: `\`==\` gives results that are hard to predict, such as \`'' == 0\` being true. Using \`===\` makes comparisons clear and avoids hidden bugs. The one common, accepted use of \`==\` is \`value == null\`, which checks for both \`null\` and \`undefined\` in one go.`,
      analogy: `\`===\` is a strict passport check: name and nationality must both match. \`==\` is a relaxed guard who says "you look similar enough" after translating your ID into another language — sometimes he lets the wrong person in.`,
      code: [
        {
          title: 'Strict vs loose',
          lang: 'javascript',
          code: `console.log(5 === '5');          // false (different types)
console.log(5 == '5');           // true  ('5' -> 5)
console.log(0 == '');            // true  ('' -> 0)
console.log(false == '0');       // true  (false -> 0, '0' -> 0)
console.log(null == undefined);  // true  (special rule)
console.log(null == 0);          // false (null only equals undefined)
console.log(NaN === NaN);        // false
console.log(Object.is(NaN, NaN));// true
console.log([1] == 1);           // true  ([1] -> '1' -> 1)`,
        },
        {
          title: 'The one accepted use of ==',
          lang: 'javascript',
          code: `function greet(name) {
  // true for both null and undefined, but not for '' or 0
  if (name == null) return 'Hello, Guest';
  return \`Hello, \${name}\`;
}
console.log(greet());        // "Hello, Guest"
console.log(greet(null));    // "Hello, Guest"
console.log(greet('Asha'));  // "Hello, Asha"`,
        },
      ],
      output: `The first block shows how \`==\` converts types: \`'5'\` becomes 5, \`''\` becomes 0, \`false\` becomes 0, and \`[1]\` becomes \`'1'\` and then 1. \`null\` only loosely equals \`undefined\`. \`NaN\` is never equal to itself with \`===\`, but \`Object.is\` says true.

In the second block, \`name == null\` catches both missing values in one check.`,
      questions: [
        {
          q: 'What is the difference between == and ===?',
          a: '`===` compares type and value with no conversion. `==` converts the values to a common type first, then compares. Prefer `===`.',
        },
        {
          q: 'How do you check for NaN?',
          a: 'Use `Number.isNaN(x)`. `x === NaN` is always false. The older global `isNaN()` converts first, so `isNaN("abc")` is true, which is misleading.',
        },
        {
          q: 'What is Object.is()?',
          a: 'It is like `===` but treats `NaN` as equal to `NaN` and `+0` as different from `-0`. React uses it to decide if state changed.',
        },
        {
          q: 'Is it ever OK to use ==?',
          a: 'Yes, `x == null` is a common short way to check for both `null` and `undefined`. Otherwise use `===`.',
        },
      ],
      spoken: `"Triple equals is strict: it checks both type and value, with no conversion. Double equals is loose: if the types are different, JavaScript converts them first, which leads to strange results like empty string equal to zero, or false equal to the string zero. So I always use triple equals, except for the pattern value double-equals null, which checks for null and undefined together. For objects, both compare references, not content. And for NaN, I use Number.isNaN, because NaN is not equal to itself."`,
      mistakes: [
        'Comparing objects or arrays with `===` and expecting a content check. It compares references; compare fields or use a deep-equal helper.',
        'Checking `x === NaN`. It is always false; use `Number.isNaN(x)`.',
        'Assuming `null == 0` is true. It is false: `null` loosely equals only `undefined`.',
        'Follow-up trap: "Is `[] == ![]` true?" Yes. `![]` is `false` → 0, and `[]` → `""` → 0, so `0 == 0`. It shows why `==` is avoided.',
      ],
      takeaway: 'Use `===` always (except `x == null`); `==` silently converts types.',
    },
    {
      id: 'scope',
      title: 'Scope and the Scope Chain',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Scope decides where a variable is visible: global, function, or block. Lookups go outward through the scope chain.',
      what: `**Scope** means "where in the code a variable can be used".

- **Global scope**: declared outside everything; visible everywhere.
- **Function scope**: declared inside a function; visible only inside it.
- **Block scope**: \`let\`/\`const\` inside \`{ }\` (if, for, plain blocks); visible only inside that block.

When you use a variable, JavaScript looks in the current scope first, then the outer one, then the next, up to global. This path is the **scope chain**. If it is not found anywhere, you get a \`ReferenceError\`.

#### Deeper version
JavaScript uses **lexical scope** (also called static scope): the scope chain is decided by **where the code is written**, not where a function is called from. This is what makes closures work.

When an inner variable has the same name as an outer one, the inner one **shadows** (hides) the outer one. Also, in modules, top-level variables are scoped to the module, not truly global. In sloppy (non-strict) mode, assigning to an undeclared variable creates an accidental global.`,
      why: `Scope keeps variables from clashing. Without it, every variable in every file would fight for the same name. It also lets us hide details inside functions and modules, which makes code safer and easier to reason about.`,
      analogy: `Think of a house. Your bedroom (block) has your things. The house (function) has shared things. The city (global) has things everyone uses. When you need a pen, you look in your room first, then the house, then the city. You can never look into a neighbour's bedroom.`,
      code: [
        {
          title: 'Scope chain and shadowing',
          lang: 'javascript',
          code: `const city = 'Pune';           // global scope

function house() {
  const room = 'kitchen';      // function scope
  if (true) {
    const item = 'pen';        // block scope
    const city = 'Mumbai';     // shadows the global city
    console.log(item, room, city); // "pen kitchen Mumbai"
  }
  console.log(city);           // "Pune" (the global one)
  // console.log(item);        // ReferenceError: item is not defined
}
house();`,
        },
        {
          title: 'Lexical scope: where it is written matters',
          lang: 'javascript',
          code: `const name = 'global';

function printName() {
  console.log(name); // looks where printName was WRITTEN
}

function run() {
  const name = 'inside run';
  printName(); // called here, but does not see run's name
}

run(); // "global"`,
        },
      ],
      output: `In the first block, the inner block can see its own \`item\`, the function's \`room\`, and its own shadowing \`city\` ("Mumbai"). After the block ends, \`city\` refers to the global "Pune" again, and \`item\` no longer exists.

In the second block, \`printName\` prints "global", because it was defined at the top level. Calling it from inside \`run\` does not change what it can see. That is lexical scope.`,
      questions: [
        {
          q: 'What is lexical scope?',
          a: 'It means a function\'s access to variables is decided by where it is written in the code, not where it is called from.',
        },
        {
          q: 'What is the scope chain?',
          a: 'The ordered list of scopes JavaScript searches to find a variable: current scope first, then each outer scope, up to global.',
        },
        {
          q: 'What is variable shadowing?',
          a: 'When an inner scope declares a variable with the same name as an outer one. Inside, the inner one hides the outer one.',
        },
        {
          q: 'Is the top level of an ES module global?',
          a: 'No. Top-level variables in a module are scoped to that module. Other files only see what you `export`.',
        },
      ],
      spoken: `"Scope is where a variable is visible. JavaScript has global scope, function scope, and block scope for let and const. When I use a variable, the engine looks in the current scope, then moves outward through the scope chain until it reaches global, and throws a ReferenceError if it finds nothing. JavaScript uses lexical scope, which means the chain is fixed by where the function is written, not where it's called. That's the foundation for closures. Inner variables with the same name shadow outer ones."`,
      mistakes: [
        'Thinking scope depends on where a function is called. It depends on where it is written (lexical scope).',
        'Assigning to an undeclared variable (`count = 5`) in sloppy mode, which silently creates a global. Strict mode throws instead.',
        'Assuming `var` respects `if`/`for` blocks. It does not; only `let`/`const` are block-scoped.',
        'Follow-up trap: "Can an outer scope read an inner variable?" No. Lookup only goes outward, never inward.',
      ],
      takeaway: 'Variables are looked up from the inside out, based on where code is written.',
    },
    {
      id: 'hoisting',
      title: 'Hoisting',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Declarations are registered before code runs: var becomes undefined, let/const sit in the TDZ, function declarations are fully available.',
      what: `**Hoisting** means JavaScript sets up your declarations **before** it runs your code. It looks like declarations are "moved to the top".

- \`function\` declarations are hoisted **fully**: you can call them before the line where they are written.
- \`var\` is hoisted and set to \`undefined\`.
- \`let\`, \`const\` and \`class\` are hoisted but **not initialized**: using them early throws a \`ReferenceError\` (the Temporal Dead Zone).

#### Deeper version
Nothing is really moved. JavaScript runs code in two phases for each scope:
1. **Creation phase**: the engine scans the scope and creates memory for all declarations.
2. **Execution phase**: it runs the code line by line.

Function **expressions** and arrow functions follow the rule of their variable. \`var fn = function(){}\` hoists only \`var fn\` as \`undefined\`, so calling \`fn()\` early throws \`TypeError: fn is not a function\`.`,
      why: `Hoisting explains confusing errors like "undefined" vs "ReferenceError" vs "is not a function". It also lets us write helper function declarations at the bottom of a file and use them at the top, which some teams like for readability.`,
      analogy: `Before a class starts, the teacher reads the attendance list (creation phase). She knows every student's name. Students with \`var\` are marked "present but silent" (undefined). Students with \`let\`/\`const\` are "on the list but not in the room yet" — if you call them, you get an error. Function declarations walk in fully ready.`,
      code: [
        {
          title: 'Three different behaviours',
          lang: 'javascript',
          code: `console.log(sayHi()); // "Hi" -> function declarations are fully hoisted
function sayHi() { return 'Hi'; }

console.log(a);       // undefined -> var is hoisted as undefined
var a = 5;

try {
  console.log(b);     // b is in the TDZ
} catch (e) {
  console.log(e.name); // "ReferenceError"
}
let b = 10;`,
        },
        {
          title: 'Function expressions are not hoisted like declarations',
          lang: 'javascript',
          code: `try {
  greet(); // greet is var-hoisted as undefined
} catch (e) {
  console.log(e.message); // "greet is not a function"
}
var greet = function () { console.log('hello'); };

greet(); // "hello" -> works after the assignment`,
        },
      ],
      output: `\`sayHi()\` works before its line because the whole function is hoisted. \`a\` prints \`undefined\` because only the declaration was hoisted, not the value 5. Reading \`b\` throws a \`ReferenceError\` because it is in the Temporal Dead Zone.

In the second block, \`greet\` exists but holds \`undefined\`, so calling it throws a \`TypeError\` ("is not a function"). After the assignment, it works.`,
      questions: [
        {
          q: 'What is hoisting?',
          a: 'JavaScript registers declarations in memory before running the code in a scope. Function declarations are fully available, `var` is `undefined`, and `let`/`const` are in the TDZ.',
        },
        {
          q: 'Are let and const hoisted?',
          a: 'Yes, but they are not initialized. Accessing them before the declaration line throws a `ReferenceError`.',
        },
        {
          q: 'Are arrow functions hoisted?',
          a: 'They follow their variable. With `const fn = () => {}`, `fn` is in the TDZ until that line, so calling it early throws a `ReferenceError`.',
        },
        {
          q: 'Function declaration and var with the same name — which wins?',
          a: 'During creation the function declaration wins. But once the `var` assignment line runs, the variable gets the new value.',
        },
      ],
      spoken: `"Hoisting is how JavaScript prepares a scope before running it. In the creation phase, it registers all declarations. Function declarations are fully hoisted, so I can call them before their line. Var is hoisted but set to undefined. Let, const and class are hoisted too, but they stay uninitialized in the Temporal Dead Zone, so using them early throws a ReferenceError. Function expressions and arrow functions behave like the variable they are stored in, so calling them early fails. Nothing is physically moved — it's the two-phase setup."`,
      mistakes: [
        'Saying "let and const are not hoisted". They are; they are just not initialized (TDZ).',
        'Expecting a function expression or arrow function to be callable before its line.',
        'Saying code is "physically moved to the top". It is a creation phase, not a code move.',
        'Follow-up trap: "What error do you get calling a `var` function expression early?" A `TypeError` (not a function), not a `ReferenceError`.',
      ],
      takeaway: 'Function declarations: fully hoisted. var: hoisted as undefined. let/const/class: hoisted but in the TDZ.',
    },
    {
      id: 'functions',
      title: 'Functions: Declarations, Expressions, First-Class',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Functions are values: you can store them, pass them and return them. Declarations are hoisted; expressions are not.',
      what: `A **function** is a reusable block of code. JavaScript has a few ways to write one:

- **Function declaration**: \`function add(a, b) { return a + b; }\`
- **Function expression**: \`const add = function (a, b) { return a + b; };\`
- **Arrow function**: \`const add = (a, b) => a + b;\`

In JavaScript, functions are **first-class citizens**. That means a function is a normal value: you can put it in a variable, pass it to another function, and return it from a function.

#### Deeper version
Functions are special objects. They have properties like \`name\` and \`length\` (number of declared parameters), and you can even add your own. Parameters can have **default values** (\`function f(x = 1)\`). A function with no \`return\` gives back \`undefined\`.

A **named function expression** (\`const f = function inner() {}\`) gives the function a name visible only inside itself — handy for recursion and clearer stack traces. Non-arrow functions also get an \`arguments\` object (an array-like list of all passed values), but rest parameters (\`...args\`) are the modern choice.`,
      why: `First-class functions make callbacks, event handlers, array methods (\`map\`, \`filter\`), middleware in Express, and React components possible. Picking the right style (declaration vs expression vs arrow) affects hoisting and how \`this\` behaves.`,
      analogy: `A function is like a recipe card. You can keep it in a drawer (variable), hand it to a friend (pass as argument), or have one recipe that produces a new recipe card for you (return a function).`,
      code: [
        {
          title: 'Three ways and default params',
          lang: 'javascript',
          code: `function add(a, b) { return a + b; }           // declaration
const sub = function (a, b) { return a - b; };  // expression
const mul = (a, b) => a * b;                    // arrow

function greet(name = 'Guest') {                // default parameter
  return 'Hello ' + name;
}

console.log(add(2, 3), sub(5, 2), mul(3, 4)); // 5 3 12
console.log(greet());                         // "Hello Guest"
console.log(add.length, add.name);            // 2 "add"`,
        },
        {
          title: 'Functions are values',
          lang: 'javascript',
          code: `// Store in an object
const ops = { add: (a, b) => a + b, mul: (a, b) => a * b };

// Pass as an argument (callback)
function calculate(a, b, operation) {
  return operation(a, b);
}
console.log(calculate(4, 5, ops.add)); // 9
console.log(calculate(4, 5, ops.mul)); // 20

// Return a function
const makeGreeter = (greeting) => (name) => \`\${greeting}, \${name}!\`;
console.log(makeGreeter('Hi')('Asha')); // "Hi, Asha!"`,
        },
      ],
      output: `The first block shows all three styles giving the same kind of result. \`greet()\` uses its default value. \`add.length\` is 2 (two parameters) and \`add.name\` is "add".

In the second block, \`calculate\` receives a function and calls it — that is a callback. \`makeGreeter('Hi')\` returns a new function which we immediately call with "Asha".`,
      questions: [
        {
          q: 'What does "functions are first-class citizens" mean?',
          a: 'Functions are values. You can assign them to variables, pass them as arguments, return them from other functions, and store them in objects or arrays.',
        },
        {
          q: 'Function declaration vs function expression?',
          a: 'A declaration is fully hoisted and can be called before its line. An expression is created when that line runs, so it cannot be called earlier.',
        },
        {
          q: 'What is a callback?',
          a: 'A function passed into another function, to be called later — for example in `setTimeout`, `addEventListener` or `arr.map`.',
        },
        {
          q: 'What does a function return if there is no return statement?',
          a: '`undefined`.',
        },
      ],
      spoken: `"In JavaScript, functions are first-class, which means they're just values. I can store them in variables, pass them as callbacks, and return them from other functions. There are three common ways to write them: declarations, which are fully hoisted; function expressions, which exist only after their line runs; and arrow functions, which are short and don't have their own this. I use declarations for top-level helpers, arrows for callbacks, and default parameters instead of manual checks."`,
      mistakes: [
        'Passing `onClick={handle()}` instead of `onClick={handle}` — the first calls the function immediately and passes its result.',
        'Forgetting `return` in a multi-line function and getting `undefined`.',
        'Using the `arguments` object inside an arrow function — arrows do not have their own `arguments`.',
        'Follow-up trap: "When is a default parameter used?" Only when the argument is `undefined` (missing). Passing `null` does **not** trigger the default.',
      ],
      takeaway: 'Functions are values you can store, pass and return — that is the base of callbacks and functional patterns.',
    },
    {
      id: 'arrow-functions',
      title: 'Arrow Functions',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Short function syntax with no own this, arguments or prototype; this comes from the surrounding code.',
      what: `An **arrow function** is a shorter way to write a function: \`const add = (a, b) => a + b;\`

- With one parameter, brackets are optional: \`x => x * 2\`.
- With a single expression, the result is **returned automatically** (implicit return).
- With \`{ }\` you need to write \`return\` yourself.

The big difference: arrow functions **do not have their own \`this\`**. They use the \`this\` of the code around them.

#### Deeper version
Arrow functions also have:
- no own \`arguments\` object (use \`...args\`),
- no \`prototype\`, so they **cannot be used with \`new\`**,
- no own \`super\` or \`new.target\`.

Their \`this\` is fixed **lexically** when they are created. \`call\`, \`apply\` and \`bind\` cannot change it. That makes them perfect for callbacks inside methods, but wrong as object methods that need \`this\` to be the object.`,
      why: `Before arrows, callbacks inside methods lost \`this\`, so people wrote \`const self = this\` or \`.bind(this)\`. Arrows fix that and make short callbacks (\`arr.map(x => x * 2)\`) much easier to read.`,
      analogy: `A normal function is like a hired worker who asks "who is my boss today?" every time they are called. An arrow function is like a family member who always belongs to the house they were born in — no matter who calls them, their "this" is the same family.`,
      code: [
        {
          title: 'Syntax forms',
          lang: 'javascript',
          code: `const double = x => x * 2;            // implicit return
const add = (a, b) => a + b;
const makeUser = (name) => ({ name }); // wrap object in () to return it
const log = (msg) => {                 // block body needs return
  console.log(msg);
  return msg.length;
};

console.log(double(4));          // 8
console.log(makeUser('Asha'));   // { name: 'Asha' }
console.log(log('hello'));       // logs "hello", then 5`,
        },
        {
          title: 'this: arrow vs normal function',
          lang: 'javascript',
          code: `const timer = {
  seconds: 0,
  startArrow() {
    setTimeout(() => {
      this.seconds++;                 // this = timer (from startArrow)
      console.log('arrow:', this.seconds);
    }, 0);
  },
  badMethod: () => {
    console.log('badMethod this is timer?', this === timer); // false
  },
};

timer.startArrow(); // "arrow: 1"
timer.badMethod();  // false -> arrow as a method does not get the object`,
        },
      ],
      output: `In the first block, \`makeUser\` needs \`({ name })\` in brackets; without them, \`{\` would be read as a function body and return \`undefined\`. \`log\` uses a block body, so it needs an explicit \`return\`.

In the second block, the arrow inside \`setTimeout\` uses the \`this\` of \`startArrow\`, which is \`timer\`, so it prints "arrow: 1". \`badMethod\` is an arrow defined in the object literal, so its \`this\` is the outer (module/global) \`this\`, not \`timer\`.`,
      questions: [
        {
          q: 'How are arrow functions different from normal functions?',
          a: 'They have no own `this`, `arguments`, or `prototype`, cannot be called with `new`, and have shorter syntax with implicit return.',
        },
        {
          q: 'Can you change the this of an arrow function with bind?',
          a: 'No. Arrow functions take `this` from where they are defined; `call`, `apply` and `bind` cannot change it.',
        },
        {
          q: 'When should you NOT use an arrow function?',
          a: 'As an object method that uses `this`, as a constructor, as a prototype method, or as a DOM event handler that needs `this` to be the element.',
        },
        {
          q: 'How do you return an object literal from an arrow function?',
          a: 'Wrap it in parentheses: `() => ({ id: 1 })`.',
        },
      ],
      spoken: `"Arrow functions are a shorter syntax for functions, with implicit return for single expressions. The important difference is that they don't have their own this — they use the this from the surrounding code, and you can't change it with bind or call. That makes them great for callbacks inside methods, like setTimeout or array methods. But I avoid them as object methods that need this, and they can't be used as constructors because they have no prototype. They also don't have an arguments object, so I use rest parameters."`,
      mistakes: [
        'Using an arrow function as an object method and getting `undefined` for `this.something`.',
        'Writing `() => { id: 1 }` and getting `undefined` — the braces are treated as a function body.',
        'Trying `new` on an arrow function — it throws `TypeError: ... is not a constructor`.',
        'Follow-up trap: "Why are arrow class fields used for React handlers?" Because the arrow captures the instance as `this`, so you do not need `.bind(this)` in the constructor.',
      ],
      takeaway: 'Arrows borrow `this` from where they are written — great for callbacks, wrong for methods and constructors.',
    },
    {
      id: 'array-methods',
      title: 'Array Methods: map, filter, reduce and Friends',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'map transforms, filter selects, reduce combines into one value; find, some, every, includes and sort cover the rest.',
      what: `Arrays come with built-in methods that take a **callback** (a function you pass in):

- \`map(fn)\`: makes a **new array** with each item transformed. Same length.
- \`filter(fn)\`: makes a **new array** with only the items where \`fn\` returns true.
- \`reduce(fn, start)\`: walks the array and **combines** everything into one value (a sum, an object, anything).
- \`forEach(fn)\`: just runs \`fn\` for each item; returns \`undefined\`.
- \`find\` / \`findIndex\`: first matching item / its index.
- \`some\` / \`every\`: does at least one / every item match?
- \`includes\`: is this value in the array?

#### Deeper version
\`map\`, \`filter\`, \`reduce\`, \`slice\` and \`concat\` **do not change** the original array. But \`sort\`, \`reverse\`, \`splice\`, \`push\`, \`pop\` **do mutate** it. Newer copies exist: \`toSorted\`, \`toReversed\`, \`toSpliced\` and \`with\` (ES2023) — check browser/Node support for your target.

\`sort()\` without a comparator compares items **as strings**, so \`[10, 1, 2].sort()\` gives \`[1, 10, 2]\`. Always pass \`(a, b) => a - b\` for numbers.

\`reduce\` without a start value uses the first item as the start, and throws on an empty array. \`forEach\` cannot be stopped with \`break\`; use \`for...of\`, \`some\` or \`find\` when you need to stop early.`,
      why: `These methods replace manual \`for\` loops with clear, declarative code: you say **what** you want, not **how** to loop. They do not mutate data, which fits React state and Redux. They are asked in almost every JavaScript interview, and polyfilling them is a favourite question.`,
      analogy: `Think of a fruit factory belt. \`map\` is a machine that peels every fruit. \`filter\` is a worker who throws away bad fruit. \`reduce\` is a blender that turns all the fruit into one smoothie.`,
      code: [
        {
          title: 'map, filter, reduce on real data',
          lang: 'javascript',
          code: `const orders = [
  { id: 1, item: 'Book', price: 300, paid: true },
  { id: 2, item: 'Pen', price: 20, paid: false },
  { id: 3, item: 'Bag', price: 900, paid: true },
];

const names = orders.map((o) => o.item);           // ['Book', 'Pen', 'Bag']
const paid = orders.filter((o) => o.paid);         // orders 1 and 3
const total = paid.reduce((sum, o) => sum + o.price, 0); // 1200

// reduce to an object: group by paid status
const byStatus = orders.reduce((acc, o) => {
  const key = o.paid ? 'paid' : 'unpaid';
  (acc[key] ||= []).push(o.id);
  return acc;
}, {});

console.log(names, total, byStatus); // ... 1200 { paid: [1, 3], unpaid: [2] }`,
        },
        {
          title: 'find, some, every, sort',
          lang: 'javascript',
          code: `const nums = [10, 1, 25, 2];

console.log(nums.find((n) => n > 5));    // 10
console.log(nums.some((n) => n > 20));   // true
console.log(nums.every((n) => n > 0));   // true
console.log(nums.includes(25));          // true

console.log([...nums].sort());               // [1, 10, 2, 25]  string sort!
console.log([...nums].sort((a, b) => a - b)); // [1, 2, 10, 25]
console.log(nums);                           // [10, 1, 25, 2] unchanged (we sorted copies)`,
        },
      ],
      output: `\`map\` returns just the item names. \`filter\` keeps the two paid orders. \`reduce\` adds their prices starting from 0, giving 1200. The second \`reduce\` builds an object that groups ids by status.

In the second block, \`find\` returns the first number above 5 (10). \`sort()\` without a comparator sorts as strings, so "10" comes before "2". With \`(a, b) => a - b\` it sorts numerically. We sorted copies (\`[...nums]\`), so the original stays the same.`,
      questions: [
        {
          q: 'Difference between map and forEach?',
          a: '`map` returns a new array of transformed values. `forEach` returns `undefined` and is only for side effects. Use `map` when you need the result.',
        },
        {
          q: 'How does reduce work?',
          a: 'It calls your function with an accumulator and the current item for every element. Whatever you return becomes the next accumulator. The final accumulator is the result. Always give a start value.',
        },
        {
          q: 'Which array methods mutate the original?',
          a: '`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`. `map`, `filter`, `slice`, `concat` and `reduce` do not.',
        },
        {
          q: 'Why does [10, 1, 2].sort() give [1, 10, 2]?',
          a: 'Default `sort` converts items to strings and compares them as text. Pass a comparator: `sort((a, b) => a - b)`.',
        },
        {
          q: 'Can you break out of forEach?',
          a: 'No (only by throwing). Use `for...of` with `break`, or `some`/`find`/`every`, which stop early.',
        },
      ],
      spoken: `"I use map to transform every item into a new array, filter to keep only the items that match a condition, and reduce to combine an array into a single value, like a total or a grouped object. None of these three change the original array, which is why they fit well with React state. I also use find, some, every and includes for searching. I'm careful with sort, because it mutates the array and sorts as strings by default, so I copy the array first and always pass a comparator for numbers."`,
      mistakes: [
        'Using `map` without returning anything (forgetting `return` in a block body) and getting an array of `undefined`.',
        'Calling `reduce` on a possibly empty array without a start value — it throws a `TypeError`.',
        'Sorting React state directly with `state.sort()` — it mutates state. Copy first or use `toSorted`.',
        'Using `forEach` with an `async` callback and expecting it to wait. It does not; use `for...of` with `await` or `Promise.all(arr.map(...))`.',
        'Follow-up trap: "What does `[\'1\', \'2\', \'3\'].map(parseInt)` return?" `[1, NaN, NaN]`, because `map` passes `(item, index)` and `parseInt` treats the index as the radix.',
      ],
      takeaway: 'map transforms, filter selects, reduce combines — and none of them mutate, unlike sort and splice.',
    },
    {
      id: 'loops-for-in-for-of',
      title: 'Loops: for...in vs for...of',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'for...in loops over object keys (as strings, including inherited ones); for...of loops over values of iterables like arrays, strings, Maps.',
      what: `JavaScript has many loops. Two are easy to mix up:

- \`for...in\` gives you the **keys** (property names) of an object.
- \`for...of\` gives you the **values** of an **iterable** (arrays, strings, Maps, Sets, and more).

Plain objects are **not** iterable, so \`for...of\` on \`{}\` throws an error. Use \`Object.entries(obj)\` to loop over an object with \`for...of\`.

#### Deeper version
\`for...in\` also walks **inherited** enumerable properties from the prototype chain, and array indexes come out as **strings** ("0", "1"). That is why it is a bad fit for arrays.

\`for...of\` uses the **iterator protocol**: it calls \`obj[Symbol.iterator]()\` and keeps calling \`next()\` until \`done\` is true. Any object that implements this can be used with \`for...of\`, spread (\`...\`), and destructuring.

Unlike \`forEach\`, both loops support \`break\`, \`continue\` and \`await\` inside async functions.`,
      why: `Choosing the right loop avoids subtle bugs, such as string indexes or inherited properties showing up. \`for...of\` with \`await\` is also the simple way to run async work one item at a time.`,
      analogy: `\`for...in\` reads the labels on the boxes. \`for...of\` opens the boxes and hands you what is inside.`,
      code: [
        {
          title: 'Keys vs values',
          lang: 'javascript',
          code: `const fruits = ['apple', 'mango'];

for (const i in fruits) console.log(i, typeof i); // "0" string, "1" string
for (const f of fruits) console.log(f);           // "apple", "mango"

const user = { name: 'Asha', role: 'admin' };
for (const key in user) console.log(key);         // "name", "role"
for (const [key, value] of Object.entries(user)) {
  console.log(key, '=', value);                   // "name = Asha", "role = admin"
}
// for (const v of user) {}  // TypeError: user is not iterable`,
        },
        {
          title: 'Sequential async work with for...of',
          lang: 'javascript',
          code: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function processAll(ids) {
  for (const id of ids) {
    await wait(100);          // waits before the next item
    console.log('done', id);
    if (id === 2) break;      // break works, unlike forEach
  }
}
processAll([1, 2, 3]); // "done 1", "done 2"`,
        },
      ],
      output: `With \`for...in\` on the array, we get the indexes as strings "0" and "1". With \`for...of\` we get the actual fruit names. For the object, \`for...in\` gives the keys, and \`Object.entries\` + \`for...of\` gives key/value pairs.

In the async example, each item waits 100ms before the next one starts, and the loop stops after id 2 because of \`break\`.`,
      questions: [
        {
          q: 'Difference between for...in and for...of?',
          a: '`for...in` iterates over enumerable property keys of an object (including inherited ones). `for...of` iterates over values of an iterable like an array, string, Map or Set.',
        },
        {
          q: 'Why not use for...in on arrays?',
          a: 'Indexes come as strings, order is not the main design goal, and it also picks up inherited or extra properties. Use `for...of`, `forEach` or a normal `for` loop.',
        },
        {
          q: 'How do you loop over an object with for...of?',
          a: 'Use `Object.keys(obj)`, `Object.values(obj)` or `Object.entries(obj)`, which return arrays.',
        },
        {
          q: 'How do you run async tasks one after another in a loop?',
          a: 'Use `for...of` with `await` inside an async function. `forEach` does not wait for async callbacks.',
        },
      ],
      spoken: `"for-in loops over the keys of an object, as strings, and it also includes inherited enumerable properties, so I don't use it on arrays. for-of loops over the values of anything iterable, like arrays, strings, Maps and Sets. Plain objects aren't iterable, so for objects I use Object.entries with for-of. One practical reason I like for-of is that it supports break, continue and await, so it's the simple way to run async tasks one by one, which forEach can't do."`,
      mistakes: [
        'Using `for...of` on a plain object and getting "is not iterable".',
        'Using `for...in` on arrays and doing math with string indexes ("0" + 1 = "01").',
        'Expecting `forEach` to support `break` or to wait for `await`.',
        'Follow-up trap: "How do you skip inherited keys in for...in?" Check `Object.hasOwn(obj, key)` (or `obj.hasOwnProperty(key)`), or just use `Object.keys`.',
      ],
      takeaway: '`for...in` = keys of objects, `for...of` = values of iterables.',
    },
    {
      id: 'object-methods',
      title: 'Working with Objects: keys, entries, assign, fromEntries',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Object.keys/values/entries turn objects into arrays; Object.fromEntries turns them back; spread and Object.assign merge.',
      what: `Objects store **key/value pairs**. Some built-in helpers make them easy to work with:

- \`Object.keys(obj)\` → array of keys.
- \`Object.values(obj)\` → array of values.
- \`Object.entries(obj)\` → array of \`[key, value]\` pairs.
- \`Object.fromEntries(pairs)\` → builds an object from pairs (the reverse of \`entries\`).
- \`Object.assign(target, ...sources)\` or \`{ ...a, ...b }\` → merge objects.
- \`Object.hasOwn(obj, key)\` / \`'key' in obj\` → check if a key exists.

#### Deeper version
\`keys\`, \`values\` and \`entries\` only return **own, enumerable, string** keys (no inherited ones, no symbols). \`in\` also checks the prototype chain; \`Object.hasOwn\` does not.

Key order: integer-like keys come first in ascending order, then other string keys in insertion order. Object keys are always strings or symbols — \`obj[1]\` and \`obj['1']\` are the same key. If you need any type as a key, use a \`Map\`.

Both \`Object.assign\` and spread are **shallow**: nested objects are still shared.`,
      why: `Converting an object to an array lets you use \`map\`/\`filter\`/\`reduce\` on it, then convert back with \`fromEntries\`. This is common for transforming API data, building query strings, and cleaning form values.`,
      analogy: `\`Object.entries\` is like taking all the labelled jars off a shelf and lining them up on a table so you can sort and pick. \`Object.fromEntries\` puts the chosen jars back on a new shelf.`,
      code: [
        {
          title: 'Transform an object with entries + fromEntries',
          lang: 'javascript',
          code: `const prices = { apple: 100, mango: 250, kiwi: 80 };

console.log(Object.keys(prices));   // ['apple', 'mango', 'kiwi']
console.log(Object.values(prices)); // [100, 250, 80]

// Add 10% tax and keep only items above 100
const withTax = Object.fromEntries(
  Object.entries(prices)
    .map(([name, p]) => [name, Math.round(p * 1.1)])
    .filter(([, p]) => p > 100)
);
console.log(withTax); // { apple: 110, mango: 275 }`,
        },
        {
          title: 'Merging and checking keys',
          lang: 'javascript',
          code: `const defaults = { theme: 'light', lang: 'en' };
const saved = { theme: 'dark' };

const settings = { ...defaults, ...saved }; // later wins
console.log(settings); // { theme: 'dark', lang: 'en' }

console.log('toString' in settings);           // true (inherited)
console.log(Object.hasOwn(settings, 'toString')); // false
console.log(Object.hasOwn(settings, 'lang'));     // true`,
        },
      ],
      output: `The first block turns the object into pairs, changes the prices, filters, and builds a new object: \`{ apple: 110, mango: 275 }\` (kiwi becomes 88, which is not above 100).

In the second block, spread merges the two objects and \`saved.theme\` wins because it comes last. \`'toString' in settings\` is true because \`in\` looks up the prototype chain; \`Object.hasOwn\` only checks the object's own keys.`,
      questions: [
        {
          q: 'How do you loop over an object\'s keys and values?',
          a: '`for (const [k, v] of Object.entries(obj))`, or `Object.keys(obj).forEach(...)`.',
        },
        {
          q: 'Difference between the in operator and hasOwn?',
          a: '`in` returns true for own and inherited keys. `Object.hasOwn` (or `hasOwnProperty`) is true only for the object\'s own keys.',
        },
        {
          q: 'Object.assign vs spread?',
          a: 'Both do a shallow merge. Spread always creates a new object. `Object.assign` copies into the target you give it (and mutates it) and triggers setters on the target.',
        },
        {
          q: 'How do you check if an object is empty?',
          a: '`Object.keys(obj).length === 0`.',
        },
      ],
      spoken: `"For objects, I use Object.keys, values and entries to turn them into arrays, so I can use map and filter on them, and then Object.fromEntries to rebuild an object. For merging I usually use spread, where later properties win, which is great for applying defaults. I remember these are shallow copies. To check a key, I use Object.hasOwn when I only care about own properties, because the in operator also looks at the prototype chain. And if I need non-string keys, I use a Map instead."`,
      mistakes: [
        'Thinking spread or `Object.assign` deep-copies nested objects. They are shallow.',
        'Using a plain object as a map with keys like numbers or objects — keys become strings (`[object Object]`).',
        'Checking emptiness with `obj === {}` — always false, because it compares references.',
        'Follow-up trap: "Are object keys ordered?" Mostly: integer-like keys first (ascending), then string keys in insertion order. Do not rely on order for logic; use a Map or array if order matters.',
      ],
      takeaway: 'entries → transform as an array → fromEntries is the go-to pattern for reshaping objects.',
    },
    {
      id: 'destructuring',
      title: 'Destructuring',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A short syntax to unpack values from arrays and properties from objects into variables, with defaults and renaming.',
      what: `**Destructuring** lets you pull values out of an object or array into variables in one line.

- Object: \`const { name, age } = user;\` (matched by **key name**)
- Array: \`const [first, second] = list;\` (matched by **position**)

You can also set **defaults**, **rename**, and **skip** items.

#### Deeper version
- Rename: \`const { name: userName } = user;\`
- Default: \`const { role = 'guest' } = user;\` — used only when the value is \`undefined\`.
- Nested: \`const { address: { city } } = user;\` — throws if \`address\` is \`undefined\`.
- Rest: \`const { password, ...safeUser } = user;\` — collects the remaining keys.
- Skip in arrays: \`const [, second] = arr;\`
- Swap: \`[a, b] = [b, a];\`

Array destructuring works on **any iterable** (strings, Maps, Sets), because it uses the iterator protocol. Object destructuring of \`null\` or \`undefined\` throws a \`TypeError\`.`,
      why: `It removes boilerplate (\`const name = user.name\` repeated many times), makes function parameters self-documenting, and is used everywhere in React (\`const { title } = props\`, \`const [count, setCount] = useState(0)\`).`,
      analogy: `Destructuring is like unpacking a suitcase straight into labelled drawers: "shirts go here, socks go there", in one move, instead of taking items out one by one.`,
      code: [
        {
          title: 'Objects: rename, default, nested, rest',
          lang: 'javascript',
          code: `const user = {
  id: 7,
  name: 'Asha',
  password: 'secret',
  address: { city: 'Pune' },
};

const { name: userName, role = 'guest' } = user;
const { address: { city } } = user;
const { password, ...safeUser } = user; // remove password

console.log(userName, role, city); // "Asha" "guest" "Pune"
console.log(safeUser);             // { id: 7, name: 'Asha', address: { city: 'Pune' } }`,
        },
        {
          title: 'Arrays and function parameters',
          lang: 'javascript',
          code: `const [first, , third = 'none'] = ['a', 'b'];
console.log(first, third); // "a" "none"

let x = 1, y = 2;
[x, y] = [y, x];           // swap
console.log(x, y);         // 2 1

// Destructure params with defaults (also default the whole object!)
function createUser({ name, role = 'user' } = {}) {
  return \`\${name ?? 'anonymous'} (\${role})\`;
}
console.log(createUser({ name: 'Ravi' })); // "Ravi (user)"
console.log(createUser());                 // "anonymous (user)"`,
        },
      ],
      output: `The first block renames \`name\` to \`userName\`, uses the default "guest" because \`role\` is missing, pulls \`city\` from the nested object, and uses rest to make a copy of \`user\` without \`password\`.

In the second block, we skip "b" with an empty slot, and \`third\` gets its default because index 2 is missing. The swap works without a temp variable. \`createUser()\` works with no argument because the parameter defaults to \`{}\`.`,
      questions: [
        {
          q: 'What is destructuring?',
          a: 'A syntax to unpack array items (by position) or object properties (by name) into separate variables.',
        },
        {
          q: 'How do you rename and set a default at the same time?',
          a: '`const { role: userRole = \'guest\' } = user;`',
        },
        {
          q: 'How do you swap two variables without a temp?',
          a: '`[a, b] = [b, a];`',
        },
        {
          q: 'Why add `= {}` to a destructured parameter?',
          a: 'So calling the function with no argument does not throw "Cannot destructure property of undefined".',
        },
      ],
      spoken: `"Destructuring is a shorthand to pull values out of arrays and objects into variables. Arrays are matched by position and objects by property name. I use it all the time in React for props and the useState tuple. It supports renaming, default values, nested patterns and a rest pattern, which I use to remove fields like a password before sending a user object. Defaults only apply when the value is undefined, not null. And in function parameters I default the whole object to an empty object so the function doesn't crash when called with nothing."`,
      mistakes: [
        'Destructuring a nested property when the parent might be `undefined` — it throws. Add a default: `{ address: { city } = {} }`.',
        'Expecting defaults to apply for `null`. They only apply for `undefined`.',
        'Starting a line with `{ a } = obj;` without `const`/`let` — wrap it in brackets: `({ a } = obj);`.',
        'Follow-up trap: "Does object rest copy deeply?" No. `...rest` is a shallow copy; nested objects are shared.',
      ],
      takeaway: 'Destructuring unpacks by name (objects) or position (arrays), with defaults, renaming and rest.',
    },
    {
      id: 'spread-rest',
      title: 'Spread and Rest (...)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Same three dots, opposite jobs: spread expands items out, rest collects items in.',
      what: `The \`...\` syntax has two jobs:

- **Spread** expands an array or object **out** into its items: \`[...arr, 4]\`, \`{ ...obj, age: 30 }\`, \`Math.max(...nums)\`.
- **Rest** collects many items **in** to one array or object: \`function sum(...nums)\`, \`const [first, ...others] = arr\`.

Simple rule: on the **right side** or in a function call it is spread; on the **left side** or in parameters it is rest.

#### Deeper version
Array spread works on any **iterable** (strings, Sets, Maps). Object spread copies **own enumerable** properties, and later keys overwrite earlier ones. Both make **shallow** copies — nested objects are shared.

A rest element must be **last**: \`(a, ...b)\` is fine, \`(...a, b)\` is a syntax error. Rest parameters are a real array (unlike the old \`arguments\` object), so you can call \`map\` on them directly.

Spreading a very large array into a function call (\`Math.max(...hugeArray)\`) can hit the engine's argument limit; use \`reduce\` for huge lists.`,
      why: `Spread makes immutable updates easy, which React and Redux depend on: \`setUser({ ...user, name: 'Ravi' })\`. Rest makes flexible functions possible without the clunky \`arguments\` object.`,
      analogy: `Spread is like emptying a bag of marbles onto the table — each marble is now separate. Rest is like sweeping the leftover marbles back into one bag.`,
      code: [
        {
          title: 'Spread: copy, merge, update',
          lang: 'javascript',
          code: `const a = [1, 2];
const b = [3, 4];
const all = [...a, ...b, 5];          // [1, 2, 3, 4, 5]

const unique = [...new Set([1, 1, 2])]; // [1, 2]
const letters = [...'hi'];             // ['h', 'i']

const user = { name: 'Asha', city: 'Pune' };
const updated = { ...user, city: 'Mumbai' }; // new object, user unchanged

console.log(all, unique, letters);
console.log(user.city, updated.city); // "Pune" "Mumbai"
console.log(Math.max(...all));        // 5`,
        },
        {
          title: 'Rest: collect arguments and leftovers',
          lang: 'javascript',
          code: `function sum(...nums) {           // nums is a real array
  return nums.reduce((t, n) => t + n, 0);
}
console.log(sum(1, 2, 3)); // 6

const [head, ...tail] = [10, 20, 30];
console.log(head, tail);   // 10 [20, 30]

const { id, ...rest } = { id: 1, name: 'Pen', price: 20 };
console.log(rest);         // { name: 'Pen', price: 20 }`,
        },
      ],
      output: `Spread joins arrays, removes duplicates via a \`Set\`, splits a string into letters, and creates an updated copy of \`user\` — the original still says "Pune".

Rest collects \`1, 2, 3\` into the array \`nums\`, splits off \`head\` from the rest of the array, and gathers all keys except \`id\` into \`rest\`.`,
      questions: [
        {
          q: 'Difference between spread and rest?',
          a: 'Spread expands an iterable or object into separate items. Rest collects multiple items into one array or object. Same `...` syntax, opposite direction.',
        },
        {
          q: 'Does spread make a deep copy?',
          a: 'No, it is shallow. Nested objects and arrays are still shared. Use `structuredClone` for a deep copy.',
        },
        {
          q: 'Rest parameters vs the arguments object?',
          a: 'Rest is a real array, works in arrow functions, and only includes the extra parameters you name. `arguments` is array-like, not available in arrows, and includes everything.',
        },
        {
          q: 'How do you remove duplicates from an array?',
          a: '`[...new Set(arr)]` — works for primitives (objects are compared by reference).',
        },
      ],
      spoken: `"The three dots do two opposite things. Spread expands an array or object into individual items, so I use it to copy arrays, merge objects and do immutable updates like setting state with the old user spread in plus a new name. Rest collects items into one, like rest parameters in a function, or grabbing the remaining properties during destructuring. The rest element has to be last. The thing I always keep in mind is that spread is a shallow copy, so nested objects are still shared."`,
      mistakes: [
        'Updating nested state with only one level of spread: `{ ...user, address.city: x }` is invalid, and `{ ...user }` alone still shares `address`. Spread each level you change.',
        'Putting the rest element anywhere but last.',
        'Spreading a plain object into an array (`[...obj]`) — throws, because objects are not iterable.',
        'Follow-up trap: "What does `{ ...null }` do?" It gives `{}` — object spread ignores `null`/`undefined`. But `[...null]` throws.',
      ],
      takeaway: 'Spread expands out, rest gathers in — and both copies are shallow.',
    },
    {
      id: 'optional-chaining-nullish',
      title: 'Optional Chaining (?.) and Nullish Coalescing (??)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: '?. safely reads deep values without crashing on null/undefined; ?? gives a default only for null/undefined.',
      what: `Two small operators that make working with "maybe missing" data safe:

- **Optional chaining** \`?.\`: \`user?.address?.city\`. If anything before \`?.\` is \`null\` or \`undefined\`, the whole expression stops and returns \`undefined\` instead of throwing an error.
- **Nullish coalescing** \`??\`: \`value ?? 'default'\`. Returns the right side **only** if the left is \`null\` or \`undefined\`.

#### Deeper version
\`?.\` has three forms: property \`obj?.prop\`, dynamic key \`obj?.[key]\`, and function call \`fn?.()\` (call only if it exists). It **short-circuits**: in \`a?.b.c()\`, if \`a\` is nullish, nothing after it runs.

\`??\` vs \`||\`: \`||\` falls back on **any falsy** value (\`0\`, \`""\`, \`false\`), while \`??\` falls back only on **nullish** values. You cannot mix \`??\` with \`||\` or \`&&\` without brackets — it is a syntax error.

There is also \`??=\` (assign if nullish), \`||=\` and \`&&=\` (logical assignment, ES2021).`,
      why: `API responses often have missing fields. Before \`?.\` we wrote \`user && user.address && user.address.city\`. And \`||\` defaults broke valid values like a quantity of \`0\` or an empty search string. These operators fix both problems with less code.`,
      analogy: `\`?.\` is like asking "Is anyone home?" before walking into each room — if a door is missing, you calmly go back instead of falling through the floor. \`??\` is a backup plan that only kicks in when the thing is truly missing, not just when it is zero or empty.`,
      code: [
        {
          title: 'Safe deep access',
          lang: 'javascript',
          code: `const res = { user: { name: 'Asha', getAge: null } };

console.log(res.user?.address?.city);   // undefined (no crash)
console.log(res.order?.items[0]);       // undefined (short-circuits)
console.log(res.user?.getAge?.());      // undefined (getAge is null, not called)

const key = 'name';
console.log(res.user?.[key]);           // "Asha"
// console.log(res.user.address.city);  // TypeError: Cannot read properties of undefined`,
        },
        {
          title: '?? vs ||',
          lang: 'javascript',
          code: `const settings = { volume: 0, title: '', theme: null };

console.log(settings.volume || 50);  // 50  <- wrong, 0 was valid
console.log(settings.volume ?? 50);  // 0   <- correct
console.log(settings.title ?? 'Untitled'); // ""
console.log(settings.theme ?? 'light');    // "light"

settings.theme ??= 'dark';  // assign only if null/undefined
console.log(settings.theme); // "dark"`,
        },
      ],
      output: `In the first block, every risky access returns \`undefined\` instead of crashing. \`res.order?.items[0]\` stops at \`order\` because it is undefined, so \`items[0]\` is never touched. \`getAge?.()\` does not call \`null\`.

In the second block, \`||\` replaces the valid \`0\` with 50, which is a bug. \`??\` keeps \`0\` and \`""\` and only replaces \`null\`. \`??=\` sets \`theme\` because it was \`null\`.`,
      questions: [
        {
          q: 'What does optional chaining do?',
          a: 'It reads a property or calls a function only if the value before `?.` is not `null`/`undefined`; otherwise it returns `undefined` instead of throwing.',
        },
        {
          q: 'Difference between ?? and ||?',
          a: '`||` uses the fallback for any falsy value (0, "", false, null, undefined, NaN). `??` uses it only for `null` and `undefined`.',
        },
        {
          q: 'How do you call a function only if it exists?',
          a: '`callback?.()` — useful for optional props like `onClose?.()`.',
        },
        {
          q: 'Can you use ?. on the left side of an assignment?',
          a: 'No. `user?.name = "x"` is a syntax error. It is only for reading and calling.',
        },
      ],
      spoken: `"Optional chaining lets me safely access nested data. If any part before the question-dot is null or undefined, the expression just returns undefined instead of throwing 'cannot read properties of undefined'. It works for properties, dynamic keys and function calls, like calling an optional onClose prop. Nullish coalescing gives a default value only when the left side is null or undefined, unlike OR, which also replaces zero, empty string and false. So for things like quantity or volume, where zero is valid, I always use double question mark."`,
      mistakes: [
        'Overusing `?.` everywhere, which hides real bugs where data should never be missing.',
        'Using `||` for numeric or string defaults where `0` or `""` are valid.',
        'Mixing `a ?? b || c` without brackets — it is a syntax error.',
        'Follow-up trap: "What does `null?.x.y.z` return?" `undefined` — the whole chain short-circuits at the first `?.`.',
      ],
      takeaway: 'Use `?.` to read safely and `??` for defaults that respect 0, false and empty strings.',
    },
    {
      id: 'json',
      title: 'JSON Handling (stringify and parse)',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'JSON.stringify turns data into a text string; JSON.parse turns it back. Functions, undefined, Dates and Maps do not survive.',
      what: `**JSON** (JavaScript Object Notation) is a text format for sending data between systems, like your API and your frontend.

- \`JSON.stringify(value)\` → turns an object/array into a JSON **string**.
- \`JSON.parse(text)\` → turns a JSON string back into an object.

JSON is stricter than JavaScript objects: keys must be in **double quotes**, and there are no functions, comments, \`undefined\` or trailing commas.

#### Deeper version
What \`stringify\` does with special values:
- \`undefined\`, functions and symbols in objects are **skipped**; in arrays they become \`null\`.
- \`NaN\` and \`Infinity\` become \`null\`.
- \`Date\` becomes an ISO **string** (and stays a string after \`parse\`).
- \`Map\`, \`Set\` become \`{}\`.
- \`BigInt\` **throws** a \`TypeError\`.
- Circular references **throw** a \`TypeError\`.

Extra options: \`JSON.stringify(obj, replacer, space)\` — \`replacer\` can filter or change values, \`space\` pretty-prints. \`JSON.parse(text, reviver)\` lets you fix values while parsing (for example, turning date strings back into \`Date\` objects). An object can define \`toJSON()\` to control its own output.`,
      why: `Every API call, \`localStorage\` save and message to a Web Worker or server deals with JSON. Knowing what gets lost explains bugs like "my date became a string" or "my field disappeared". \`JSON.parse\` also throws on bad input, so it needs a \`try/catch\`.`,
      analogy: `JSON is like packing furniture into a flat box for shipping. Simple pieces (strings, numbers, arrays) pack fine. But some things (functions, Maps, dates) cannot be flat-packed properly — they either vanish or arrive as a plain description you must rebuild.`,
      code: [
        {
          title: 'What survives stringify',
          lang: 'javascript',
          code: `const data = {
  name: 'Asha',
  age: undefined,           // skipped
  greet() { return 'hi'; }, // skipped
  joined: new Date('2024-01-15T00:00:00Z'), // becomes a string
  tags: new Set(['a']),     // becomes {}
  score: NaN,               // becomes null
};

const text = JSON.stringify(data);
console.log(text);
// {"name":"Asha","joined":"2024-01-15T00:00:00.000Z","tags":{},"score":null}

const back = JSON.parse(text);
console.log(typeof back.joined); // "string" (not a Date anymore)`,
        },
        {
          title: 'Safe parse, pretty print, reviver',
          lang: 'javascript',
          code: `function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback; // bad JSON should not crash the app
  }
}
console.log(safeParse('{bad json}', {})); // {}

console.log(JSON.stringify({ a: 1, b: [1, 2] }, null, 2)); // indented output

const parsed = JSON.parse('{"at":"2024-01-15T00:00:00.000Z"}', (key, value) =>
  key === 'at' ? new Date(value) : value
);
console.log(parsed.at instanceof Date); // true`,
        },
      ],
      output: `In the first block, \`age\` and \`greet\` disappear, the Date becomes an ISO string, the Set becomes \`{}\` and \`NaN\` becomes \`null\`. After parsing, \`joined\` is just a string.

In the second block, \`safeParse\` catches the syntax error and returns the fallback. The \`2\` in \`stringify\` adds 2-space indentation. The reviver turns the \`at\` string back into a real \`Date\`.`,
      questions: [
        {
          q: 'What happens to undefined and functions in JSON.stringify?',
          a: 'In objects, those keys are left out. In arrays, they become `null`.',
        },
        {
          q: 'Is JSON.parse(JSON.stringify(obj)) a good deep copy?',
          a: 'Only for simple data. It loses Dates (become strings), undefined, functions, Maps, Sets, and throws on circular references and BigInt. Prefer `structuredClone`.',
        },
        {
          q: 'How do you handle invalid JSON?',
          a: 'Wrap `JSON.parse` in `try/catch`, because it throws a `SyntaxError` on bad input.',
        },
        {
          q: 'What is toJSON?',
          a: 'A method an object can define. `JSON.stringify` calls it and serializes whatever it returns. `Date` uses this to output an ISO string.',
        },
      ],
      spoken: `"JSON is the text format we use to send data between client and server. JSON.stringify converts a value to a string and JSON.parse converts it back. I keep in mind what gets lost: undefined and functions are dropped, NaN becomes null, Dates become ISO strings, Maps and Sets become empty objects, and BigInt or circular references throw. So I always wrap JSON.parse in try-catch, especially for localStorage or third-party data, and I use a reviver or manual conversion to turn date strings back into Date objects."`,
      mistakes: [
        'Calling `JSON.parse` on untrusted or stored data without `try/catch` — one bad value crashes the page.',
        'Expecting a Date to come back as a `Date` after a round trip. It comes back as a string.',
        'Using `JSON.stringify` to compare objects — key order changes the string, so equal objects can look different.',
        'Follow-up trap: "What does `JSON.stringify(undefined)` return?" It returns `undefined` (not a string), and `JSON.parse(undefined)` then throws.',
      ],
      takeaway: 'JSON only keeps plain data — always try/catch parse, and rebuild Dates yourself.',
    },
    {
      id: 'strict-mode',
      title: 'Strict Mode',
      level: 'basic',
      priority: 'good',
      frequency: 'occasional',
      summary: '"use strict" turns silent mistakes into errors; ES modules and classes are strict automatically.',
      what: `**Strict mode** is a safer version of JavaScript. You turn it on by writing \`'use strict';\` at the top of a file or function.

It changes some silent mistakes into **real errors**, for example:
- Assigning to an undeclared variable throws instead of creating a global.
- \`this\` is \`undefined\` (not the global object) in a plain function call.
- Writing to a read-only property throws.
- Duplicate parameter names are not allowed.

#### Deeper version
More strict-mode changes:
- \`with\` statements are banned.
- \`delete\` on a non-deletable property throws.
- \`eval\` gets its own scope, so it cannot create variables in yours.
- Octal literals like \`010\` are a syntax error.
- Some future keywords (\`implements\`, \`interface\`, \`private\`...) are reserved.

**ES modules** (\`import\`/\`export\`) and **class bodies** are always strict — you do not need the directive. So most modern React/Node ESM code is already strict. Old CommonJS files and plain \`<script>\` tags are not, unless you opt in.`,
      why: `Sloppy mode hides bugs: a typo like \`usrName = 'x'\` silently creates a global variable. Strict mode makes such bugs crash early, which is easier to find. It also lets engines optimize better.`,
      analogy: `Sloppy mode is a teacher who ignores spelling mistakes. Strict mode is a teacher who circles every mistake in red — annoying at first, but your writing gets better.`,
      code: [
        {
          title: 'Mistakes that strict mode catches',
          lang: 'javascript',
          code: `'use strict';

try {
  usrName = 'Asha'; // typo: never declared
} catch (e) {
  console.log(e.name); // "ReferenceError"
}

function showThis() {
  return this;
}
console.log(showThis()); // undefined (sloppy mode would give the global object)

const config = Object.freeze({ port: 3000 });
try {
  config.port = 4000;   // read-only
} catch (e) {
  console.log(e.name);  // "TypeError" (sloppy mode fails silently)
}`,
        },
      ],
      output: `All three mistakes are caught: assigning to an undeclared variable throws a \`ReferenceError\`, a plain function call gets \`this === undefined\`, and writing to a frozen object throws a \`TypeError\`. In sloppy mode, the first would create a global, the second would return \`globalThis\`, and the third would silently do nothing.`,
      questions: [
        {
          q: 'What is strict mode?',
          a: 'An opt-in mode (`\'use strict\'`) that turns silent errors into thrown errors, makes `this` undefined in plain function calls, and bans unsafe features like `with`.',
        },
        {
          q: 'Do I need "use strict" in ES modules?',
          a: 'No. ES modules and class bodies are strict automatically.',
        },
        {
          q: 'What is this inside a normal function call in strict mode?',
          a: '`undefined`. In sloppy mode it is the global object (`window` in browsers).',
        },
      ],
      spoken: `"Strict mode is an opt-in, safer version of JavaScript. It turns silent mistakes into errors — for example, assigning to an undeclared variable throws instead of creating a global, writing to a frozen or read-only property throws, and this is undefined in a plain function call instead of the global object. It also bans things like with and duplicate parameter names. In practice, ES modules and classes are strict automatically, so most modern code I write is already strict without the directive."`,
      mistakes: [
        'Putting `\'use strict\'` after other statements — it must be the first statement in the file or function to work.',
        'Thinking you must add it to ES modules — they are already strict.',
        'Follow-up trap: "Why might old code break when you switch to modules?" Because modules are strict: hidden accidental globals or `this`-as-global tricks start throwing.',
      ],
      takeaway: 'Strict mode turns silent bugs into loud errors — and modules and classes have it on by default.',
    },
    {
      id: 'error-handling',
      title: 'Error Handling (try/catch, custom errors, async errors)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'try/catch/finally handles thrown errors; async errors need await inside try or .catch(); custom errors carry extra info.',
      what: `When something goes wrong, JavaScript **throws** an error. If nobody catches it, the program stops (or the request fails).

- \`try { ... }\` — code that might fail.
- \`catch (err) { ... }\` — runs if an error was thrown. \`err.message\` and \`err.name\` describe it.
- \`finally { ... }\` — always runs (good for cleanup like hiding a spinner).
- \`throw new Error('message')\` — create your own error.

#### Deeper version
**Built-in error types**: \`Error\`, \`TypeError\`, \`ReferenceError\`, \`SyntaxError\`, \`RangeError\`. You can make **custom errors** by extending \`Error\`, adding fields like \`statusCode\`. ES2022 added \`new Error(msg, { cause })\` to wrap a lower-level error.

**Async errors**: \`try/catch\` only catches errors from code that runs **inside** it. A callback in \`setTimeout\` runs later, so the outer \`try\` cannot catch it. For promises, either \`await\` them inside \`try\`, or use \`.catch()\`. A rejected promise with no handler fires an \`unhandledrejection\` event (browser) or \`unhandledRejection\` (Node), and recent Node versions crash the process by default.

\`finally\` runs even if \`try\` or \`catch\` returns — and if \`finally\` itself returns, that value wins.`,
      why: `Real apps talk to networks, databases and users — all of which fail. Good error handling shows a friendly message instead of a white screen, keeps a Node server alive, and logs useful details for debugging. Interviewers test the async part a lot.`,
      analogy: `\`try/catch\` is like a safety net under a trapeze artist. \`finally\` is the crew that cleans up the stage whether the act went well or not. But the net only covers the area under it — a fall that happens later in another tent (an async callback) needs its own net.`,
      code: [
        {
          title: 'Custom error and finally',
          lang: 'javascript',
          code: `class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function getUser(id) {
  if (!id) throw new HttpError(400, 'id is required');
  return { id, name: 'Asha' };
}

try {
  getUser();
} catch (err) {
  if (err instanceof HttpError) console.log(err.status, err.message); // 400 "id is required"
  else throw err; // re-throw errors we do not know how to handle
} finally {
  console.log('cleanup runs always');
}`,
        },
        {
          title: 'Async errors: what try/catch can and cannot catch',
          lang: 'javascript',
          code: `// 1) Cannot catch: the callback runs later, outside the try
try {
  setTimeout(() => { /* throw here would NOT be caught */ }, 0);
} catch (e) { /* never reached for the timer error */ }

// 2) Can catch: await inside try
async function load() {
  try {
    await Promise.reject(new Error('network down'));
  } catch (err) {
    console.log('caught:', err.message); // "caught: network down"
  }
}
load();

// 3) Promise style
fetchData().catch((err) => console.log('caught too:', err.message));
function fetchData() { return Promise.reject(new Error('timeout')); }`,
        },
      ],
      output: `In the first block, \`getUser()\` throws a \`HttpError\`. The \`catch\` checks its type with \`instanceof\` and prints \`400 id is required\`. \`finally\` prints "cleanup runs always" either way.

In the second block, a timer callback would throw outside the \`try\`, so it would not be caught. Awaiting a rejected promise inside \`try\` is caught and prints "caught: network down". The \`.catch()\` version prints "caught too: timeout".`,
      questions: [
        {
          q: 'Does try/catch catch errors in a setTimeout callback?',
          a: 'No. The callback runs later on a new call stack, after the `try` block has finished. Put the `try/catch` inside the callback.',
        },
        {
          q: 'How do you handle errors with async/await?',
          a: 'Wrap the `await` calls in `try/catch`, or add `.catch()` to the returned promise. Without either, the rejection is unhandled.',
        },
        {
          q: 'How do you create a custom error?',
          a: 'Extend `Error`, call `super(message)`, set `this.name`, and add any extra fields such as `status`.',
        },
        {
          q: 'What does finally do?',
          a: 'It always runs after `try`/`catch`, whether there was an error or a `return`. Use it for cleanup such as closing connections or stopping loaders.',
        },
        {
          q: 'Does fetch reject on a 404 or 500?',
          a: 'No. `fetch` only rejects on network failure. You must check `res.ok` and throw yourself for HTTP errors.',
        },
      ],
      spoken: `"I use try, catch and finally to handle errors: try holds risky code, catch handles the failure, and finally runs cleanup no matter what. For async code I await promises inside try-catch, or attach a catch handler, because a rejected promise without a handler becomes an unhandled rejection, which can crash a Node process. I create custom error classes by extending Error, with fields like a status code, so my Express error middleware can send the right response. I also remember fetch doesn't reject on HTTP errors, so I check response.ok."`,
      mistakes: [
        'Catching an error and doing nothing ("swallowing" it) — the bug becomes invisible. At least log it or re-throw.',
        'Forgetting `await` inside `try`: `try { return fetchData(); }` in an async function does not catch the rejection; `return await fetchData()` does.',
        'Throwing strings (`throw "oops"`) — you lose the stack trace. Always throw `Error` objects.',
        'Follow-up trap: "If both try and finally have a return, which wins?" The `finally` return overrides the other one.',
      ],
      takeaway: 'try/catch only catches what runs inside it — await your promises there, and throw real Error objects.',
    },
    {
      id: 'dom-manipulation',
      title: 'DOM Manipulation',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'The DOM is the page as a tree of objects; select with querySelector, change with textContent/classList, create with createElement.',
      what: `The **DOM** (Document Object Model) is the browser's version of your HTML as a tree of JavaScript objects. Changing these objects changes the page.

Common tasks:
- **Select**: \`document.querySelector('.btn')\` (first match), \`querySelectorAll('li')\` (all matches), \`getElementById('app')\`.
- **Change**: \`el.textContent = 'Hi'\`, \`el.classList.add('active')\`, \`el.style.color = 'red'\`, \`el.setAttribute('aria-label', 'Close')\`.
- **Create/insert/remove**: \`document.createElement('li')\`, \`parent.append(child)\`, \`el.remove()\`.
- **Listen**: \`el.addEventListener('click', handler)\`.

#### Deeper version
- \`textContent\` sets plain text (safe). \`innerHTML\` parses HTML — dangerous with user input because of **XSS** (cross-site scripting: attackers injecting scripts).
- \`querySelectorAll\` returns a **static** NodeList; \`getElementsByClassName\` returns a **live** HTMLCollection that updates when the DOM changes.
- Changing the DOM can trigger **reflow** (layout recalculation) and **repaint**. Reading layout values like \`offsetHeight\` right after writing forces a sync reflow ("layout thrashing"). Batch writes, or build nodes in a \`DocumentFragment\` and insert once.
- React avoids most manual DOM work by keeping a virtual DOM and updating only what changed.`,
      why: `Even React developers get asked this: it shows you understand what frameworks do under the hood, and you still need it for refs, focus management, third-party widgets and performance work.`,
      analogy: `The DOM is like a family tree of the page. \`querySelector\` finds a person in the tree, \`textContent\` changes their name tag, \`createElement\` adds a new baby, and \`remove()\` removes someone from the tree.`,
      code: [
        {
          title: 'Build a list safely and efficiently',
          lang: 'html',
          code: `<ul id="list"></ul>
<button class="add">Add</button>

<script>
  const list = document.getElementById('list');
  const items = ['Milk', 'Bread', '<img src=x onerror=alert(1)>'];

  const frag = document.createDocumentFragment(); // build off-screen
  items.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;   // safe: shown as text, not run as HTML
    li.classList.add('item');
    frag.append(li);
  });
  list.append(frag);         // one insert = one layout update

  document.querySelector('.add').addEventListener('click', () => {
    const li = document.createElement('li');
    li.textContent = 'New item';
    list.append(li);
  });
</script>`,
        },
      ],
      output: `The page shows three list items. The third one is displayed as plain text \`<img src=x onerror=alert(1)>\` — no alert runs, because \`textContent\` never parses HTML. All items are added in one go through the fragment, so the browser lays out the list once. Clicking "Add" appends a new item.`,
      questions: [
        {
          q: 'textContent vs innerText vs innerHTML?',
          a: '`textContent` gets/sets raw text (fast, safe). `innerText` is aware of CSS (hidden text is skipped) and triggers layout. `innerHTML` parses HTML and is an XSS risk with user input.',
        },
        {
          q: 'querySelectorAll vs getElementsByClassName?',
          a: '`querySelectorAll` takes any CSS selector and returns a static NodeList. `getElementsByClassName` returns a live HTMLCollection that changes as the DOM changes.',
        },
        {
          q: 'What is reflow and how do you reduce it?',
          a: 'Reflow is the browser recalculating layout. Reduce it by batching DOM changes, using `DocumentFragment`, changing classes instead of many styles, and not reading layout right after writing.',
        },
        {
          q: 'What is a DocumentFragment?',
          a: 'A lightweight container not attached to the page. You build many nodes in it, then insert them in one operation.',
        },
      ],
      spoken: `"The DOM is the browser's tree of objects representing the HTML. I select elements with querySelector, update them with textContent, classList and attributes, and create nodes with createElement and append. For safety I use textContent instead of innerHTML with user data, to avoid XSS. For performance, I batch changes — for example, building items in a DocumentFragment and inserting once — and I avoid reading layout values right after writing, which causes layout thrashing. In React I rarely do this manually, but I use refs for focus and third-party widgets."`,
      mistakes: [
        'Using `innerHTML` with user input — opens an XSS hole.',
        'Running DOM code before the element exists (script in `<head>` without `defer`). Use `defer` or wait for `DOMContentLoaded`.',
        'Appending items one by one in a big loop, causing many layout updates.',
        'Follow-up trap: "Why might looping over a live HTMLCollection while removing items skip some?" Because the collection shrinks as you remove, shifting indexes. Convert to an array first.',
      ],
      takeaway: 'Select, change with textContent/classList, create with createElement — and batch updates to avoid reflow.',
    },
    {
      id: 'events',
      title: 'Event Bubbling, Capturing and Delegation',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Events travel down (capture), hit the target, then bubble up; delegation uses one parent listener for many children.',
      what: `When you click a button, the click event does not only happen on the button. It travels through the page in **three phases**:

1. **Capturing**: from \`window\` down to the target's parent.
2. **Target**: on the element you clicked.
3. **Bubbling**: back up from the target to \`window\`.

By default, \`addEventListener\` listens in the **bubbling** phase. Pass \`{ capture: true }\` to listen while the event goes down.

**Event delegation** means putting **one** listener on a parent and using \`event.target\` to find which child was clicked.

#### Deeper version
- \`event.target\` = the element that was actually clicked. \`event.currentTarget\` = the element the listener is attached to.
- \`event.stopPropagation()\` stops the event moving to other elements. \`stopImmediatePropagation()\` also stops other listeners on the same element.
- \`event.preventDefault()\` stops the browser's default action (like following a link or submitting a form). It does **not** stop propagation.
- Some events do not bubble (\`focus\`, \`blur\`, \`mouseenter\`); use \`focusin\`/\`focusout\` for delegation.
- Use \`target.closest('selector')\` in delegation, because the click may land on a child (like an icon inside a button).
- React attaches its listeners at the app root and uses its own synthetic event system (React 17+ attaches at the root container instead of \`document\`).`,
      why: `Delegation means fewer listeners (better memory), and it automatically works for items added later — great for long lists and dynamic content. Understanding bubbling explains bugs like "clicking the delete button also opened the card".`,
      analogy: `Think of a stone dropped in a lake. Before it hits the water, it passes through the air (capture). It hits the spot (target). Then ripples spread outwards (bubble). Delegation is like having one lifeguard at the edge of the pool watching all the swimmers, instead of one lifeguard per swimmer.`,
      code: [
        {
          title: 'Phases and stopPropagation',
          lang: 'html',
          code: `<div id="card"><button id="del">Delete</button></div>

<script>
  const card = document.getElementById('card');
  const del = document.getElementById('del');

  card.addEventListener('click', () => console.log('card capture'), { capture: true });
  card.addEventListener('click', () => console.log('card bubble (open details)'));
  del.addEventListener('click', (e) => {
    console.log('delete clicked');
    e.stopPropagation(); // do not let the card's bubble listener run
  });
</script>`,
        },
        {
          title: 'Event delegation for a dynamic list',
          lang: 'html',
          code: `<ul id="todos">
  <li data-id="1">Buy milk <button class="remove">x</button></li>
  <li data-id="2">Call mom <button class="remove">x</button></li>
</ul>

<script>
  document.getElementById('todos').addEventListener('click', (e) => {
    const btn = e.target.closest('.remove'); // works even if a child of the button is clicked
    if (!btn) return;                        // click was somewhere else
    const li = btn.closest('li');
    console.log('removing', li.dataset.id);
    li.remove();
  });
  // New <li> items added later work automatically - no new listeners needed.
</script>`,
        },
      ],
      output: `Clicking "Delete" in the first example prints "card capture" (going down), then "delete clicked" (target). The card's bubbling listener does not run because we stopped propagation.

In the second example, one listener on the \`<ul>\` handles every remove button. Clicking the "x" on "Call mom" prints "removing 2" and removes that item. Items added later work too.`,
      questions: [
        {
          q: 'What is event bubbling?',
          a: 'After an event fires on the target element, it travels up through its ancestors to `document` and `window`, triggering their listeners too.',
        },
        {
          q: 'What is event delegation and why use it?',
          a: 'Attaching one listener to a parent and checking `event.target` to handle events from many children. It uses less memory and works for elements added later.',
        },
        {
          q: 'target vs currentTarget?',
          a: '`target` is the element where the event started (what was clicked). `currentTarget` is the element whose listener is running right now.',
        },
        {
          q: 'stopPropagation vs preventDefault?',
          a: '`stopPropagation` stops the event from travelling to other elements. `preventDefault` stops the browser\'s default action like following a link. They are independent.',
        },
      ],
      spoken: `"When an event fires, it goes through three phases: capturing from the window down to the target, the target phase, and then bubbling back up. Listeners run in the bubbling phase by default, unless I pass capture true. Event delegation uses bubbling: I attach one listener on a parent, like a list, and use event.target with closest to find which child was clicked. That saves memory and works for items added later. I use stopPropagation when a nested button shouldn't trigger the parent's click, and preventDefault to stop default actions like form submission."`,
      mistakes: [
        'Using `e.target` directly in delegation when the click can land on a child icon — use `e.target.closest()`.',
        'Thinking `preventDefault` stops bubbling. It does not.',
        'Adding a listener to every item of a 1000-row list instead of one delegated listener.',
        'Follow-up trap: "Does focus bubble?" No. Use `focusin`/`focusout` for delegation, or listen in the capture phase.',
      ],
      takeaway: 'Events capture down, then bubble up — delegation uses the bubble to handle many children with one listener.',
    },
    {
      id: 'script-async-defer',
      title: 'Script Loading: async vs defer',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'A normal script blocks HTML parsing; defer downloads in parallel and runs in order after parsing; async runs as soon as it downloads.',
      what: `How a \`<script>\` tag is loaded changes how fast your page appears.

- **Normal** \`<script src>\`: the browser **stops** reading the HTML, downloads the script, runs it, then continues. This blocks the page.
- \`defer\`: downloads **in parallel** while HTML is parsed, then runs **after** the HTML is fully parsed, **in the order** the scripts appear. Runs before the \`DOMContentLoaded\` event.
- \`async\`: downloads in parallel and runs **as soon as it is ready**, pausing parsing at that moment. **Order is not guaranteed.**

#### Deeper version
- Use \`defer\` for your app code that needs the DOM and depends on other scripts.
- Use \`async\` for independent scripts like analytics or ads that do not depend on anything and that nothing depends on.
- \`<script type="module">\` is **deferred by default**. You can add \`async\` to a module script to run it as soon as it and its imports load.
- \`async\`/\`defer\` only apply to external scripts (with \`src\`); for classic inline scripts they are ignored.
- \`DOMContentLoaded\` fires when the HTML is parsed (and deferred scripts have run). \`load\` fires later, when images, styles and iframes have also loaded.
- Other hints: \`<link rel="preload">\` fetches important files early; \`<link rel="modulepreload">\` does the same for modules. Frameworks like Next.js handle much of this for you (for example, its \`Script\` component with loading strategies — check the docs for the current options).`,
      why: `Blocking scripts in the \`<head>\` delay the first paint and hurt Core Web Vitals. Choosing \`defer\` or \`async\` correctly is a cheap, high-impact performance fix and a common frontend interview question.`,
      analogy: `You are reading a book (parsing HTML). A normal script is someone who makes you stop reading, go to the shop, and come back. \`defer\` is ordering the items online while you keep reading, and opening them in order when you finish the book. \`async\` is opening each parcel the moment it arrives, interrupting your reading, in whatever order they come.`,
      code: [
        {
          title: 'Three loading styles',
          lang: 'html',
          code: `<!doctype html>
<html>
<head>
  <!-- Blocks parsing until downloaded and run (avoid in head) -->
  <script src="/legacy-blocking.js"></script>

  <!-- App code: parallel download, runs after parsing, in order -->
  <script defer src="/vendor.js"></script>
  <script defer src="/app.js"></script>   <!-- always runs after vendor.js -->

  <!-- Independent third-party script: runs whenever ready -->
  <script async src="https://example.com/analytics.js"></script>

  <!-- Module scripts are deferred by default -->
  <script type="module" src="/main.js"></script>
</head>
<body>
  <div id="app"></div>
  <script>
    document.addEventListener('DOMContentLoaded', () => console.log('HTML parsed, deferred scripts done'));
    window.addEventListener('load', () => console.log('images and styles loaded too'));
  </script>
</body>
</html>`,
        },
      ],
      output: `The blocking script pauses parsing until it is downloaded and executed. \`vendor.js\` and \`app.js\` download while the page is parsed and run afterwards, always in that order, so \`app.js\` can use \`vendor.js\`. \`analytics.js\` runs whenever it arrives — maybe before, maybe after the others. The module script behaves like \`defer\`. "HTML parsed..." logs at \`DOMContentLoaded\`; "images and styles loaded too" logs later at \`load\`.`,
      questions: [
        {
          q: 'What is the difference between async and defer?',
          a: 'Both download without blocking parsing. `defer` runs after the HTML is parsed, in document order. `async` runs as soon as it downloads, pausing parsing, with no order guarantee.',
        },
        {
          q: 'Which one would you use for analytics, and which for your app bundle?',
          a: '`async` for independent scripts like analytics; `defer` for app code that needs the DOM or depends on other scripts.',
        },
        {
          q: 'DOMContentLoaded vs load?',
          a: '`DOMContentLoaded` fires when the HTML is parsed and deferred scripts have run. `load` fires after all resources like images and stylesheets have finished loading.',
        },
        {
          q: 'Are module scripts blocking?',
          a: 'No. `type="module"` scripts are deferred by default.',
        },
      ],
      spoken: `"A normal script tag blocks HTML parsing while it downloads and runs. With defer, the script downloads in parallel and runs after the document is parsed, in the order the scripts appear, so I use it for my app bundles. With async, it downloads in parallel but runs as soon as it's ready, interrupting parsing, and order isn't guaranteed, so it's good for independent scripts like analytics. Module scripts are deferred by default. DOMContentLoaded fires after parsing and deferred scripts; load fires after images and styles too."`,
      mistakes: [
        'Using `async` for scripts that depend on each other — they may run in the wrong order.',
        'Putting large blocking scripts in the `<head>` without `defer`.',
        'Adding `defer` to an inline script and expecting it to wait — it is ignored without `src`.',
        'Follow-up trap: "Is putting scripts at the end of body the same as defer?" Similar effect on parsing, but `defer` starts the download earlier (while parsing), so it is usually faster.',
      ],
      takeaway: 'defer = parallel download, ordered run after parsing; async = run as soon as ready, no order.',
    },
    {
      id: 'web-storage-cookies',
      title: 'localStorage vs sessionStorage vs Cookies',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'localStorage persists, sessionStorage dies with the tab, cookies are small and sent to the server with every request.',
      what: `Browsers give three common ways to save small data on the user's side:

- **localStorage**: stays until you delete it (even after closing the browser). About 5MB per site (varies by browser). Only JavaScript can read it.
- **sessionStorage**: same API, but lives only for **that tab**. Closing the tab deletes it.
- **Cookies**: tiny (about 4KB each), have an expiry date, and are **automatically sent to the server** with every matching request.

localStorage and sessionStorage store **strings only**, so you \`JSON.stringify\` objects before saving.

#### Deeper version
Cookie flags that matter for security:
- \`HttpOnly\`: JavaScript cannot read it (\`document.cookie\` will not show it) — protects tokens from XSS.
- \`Secure\`: only sent over HTTPS.
- \`SameSite=Strict|Lax|None\`: controls whether it is sent on cross-site requests — protects against CSRF (a malicious site making requests as you). \`None\` requires \`Secure\`.
- \`Domain\`, \`Path\`, \`Expires\`/\`Max-Age\` control where and how long.

Web Storage is **synchronous** (it can block the main thread with big data) and scoped to the **origin** (protocol + domain + port). Other tabs get a \`storage\` event when localStorage changes, which you can use to sync logout across tabs. For larger or structured data, use **IndexedDB**.`,
      why: `Picking the wrong one is a security problem: storing a JWT in localStorage means any XSS script can steal it, while an \`HttpOnly\` cookie cannot be read by scripts. It also affects UX: theme preferences belong in localStorage; a multi-step form draft might belong in sessionStorage.`,
      analogy: `localStorage is a locker at the gym you rent for the year. sessionStorage is a locker that empties when you leave today. Cookies are a small ID card that you automatically show at the counter (server) every time you walk in.`,
      code: [
        {
          title: 'Web Storage with JSON',
          lang: 'javascript',
          code: `// Save
const prefs = { theme: 'dark', fontSize: 16 };
localStorage.setItem('prefs', JSON.stringify(prefs));
sessionStorage.setItem('step', '2'); // only strings

// Read (always defensively)
function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem('prefs')) ?? { theme: 'light' };
  } catch {
    return { theme: 'light' };
  }
}
console.log(readPrefs().theme); // "dark"

// Remove
localStorage.removeItem('prefs');

// React to changes made in OTHER tabs (e.g. logout everywhere)
window.addEventListener('storage', (e) => {
  if (e.key === 'logout') window.location.href = '/login';
});`,
        },
        {
          title: 'Setting a secure cookie from Node/Express',
          lang: 'javascript',
          code: `// Server side: the browser stores it, JS cannot read it
app.post('/login', (req, res) => {
  const token = createSessionToken(req.body); // your own helper
  res.cookie('session', token, {
    httpOnly: true,     // not visible to document.cookie
    secure: true,       // HTTPS only
    sameSite: 'lax',    // basic CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
  res.json({ ok: true });
});`,
        },
      ],
      output: `In the first block, the object is saved as a JSON string and read back safely; \`readPrefs().theme\` prints "dark". The \`storage\` listener fires only in **other** tabs of the same origin when a key changes there.

In the second block, the server sets an \`HttpOnly\` cookie. The browser sends it automatically with each request to that site, but \`document.cookie\` in the page cannot see it, so an injected script cannot steal it.`,
      questions: [
        {
          q: 'Difference between localStorage, sessionStorage and cookies?',
          a: 'localStorage persists until cleared; sessionStorage is per tab and cleared when the tab closes; cookies are small, have expiry, and are sent to the server with every request.',
        },
        {
          q: 'Where should you store a JWT or session token?',
          a: 'Safest is an `HttpOnly`, `Secure`, `SameSite` cookie so JavaScript (and XSS) cannot read it. localStorage is readable by any script on the page.',
        },
        {
          q: 'Can you store objects in localStorage?',
          a: 'Only as strings. Use `JSON.stringify` to save and `JSON.parse` (in try/catch) to read.',
        },
        {
          q: 'What is SameSite?',
          a: 'A cookie attribute that controls whether the cookie is sent on cross-site requests. `Strict` and `Lax` help prevent CSRF; `None` allows it but needs `Secure`.',
        },
      ],
      spoken: `"localStorage and sessionStorage have the same simple string-based API. localStorage persists until it's cleared, sessionStorage is scoped to one tab and is cleared when the tab closes. Cookies are much smaller, have an expiry, and are sent to the server automatically with every request. For auth, I prefer an HttpOnly, Secure, SameSite cookie, because scripts can't read it, so an XSS bug can't steal the token. I use localStorage for non-sensitive things like theme or UI preferences, always with JSON.stringify and a try-catch around parse."`,
      mistakes: [
        'Storing auth tokens or personal data in localStorage — any XSS can read it.',
        'Saving an object directly: `setItem(\'user\', obj)` stores the string "[object Object]".',
        'Reading localStorage during server-side rendering in Next.js — `window` does not exist on the server. Read it in `useEffect`.',
        'Follow-up trap: "Does an HttpOnly cookie stop CSRF?" No. HttpOnly stops scripts reading it (XSS theft). CSRF is handled by `SameSite` and CSRF tokens.',
      ],
      takeaway: 'Preferences in localStorage, per-tab drafts in sessionStorage, auth in HttpOnly cookies.',
    },
    {
      id: 'type-coercion',
      title: 'Type Coercion',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'JavaScript automatically converts types in operations like +, ==, and if; + prefers strings, other math operators prefer numbers.',
      what: `**Type coercion** means JavaScript automatically converts a value from one type to another.

- **Explicit** (you do it): \`Number('5')\`, \`String(5)\`, \`Boolean(0)\`.
- **Implicit** (JavaScript does it for you): \`'5' * 2\` gives \`10\`, \`'5' + 2\` gives \`'52'\`.

Simple rules:
- \`+\` with **any string** → joins as strings.
- \`-\`, \`*\`, \`/\`, \`%\` → convert to **numbers**.
- \`if\`, \`!\`, \`&&\`, \`||\` → convert to **boolean**.

#### Deeper version
Converting **to number**: \`''\` → 0, \`' 12 '\` → 12, \`'12px'\` → NaN, \`true\` → 1, \`null\` → 0, \`undefined\` → NaN, \`[]\` → 0, \`[5]\` → 5, \`{}\` → NaN.

Converting **objects to primitives** follows \`ToPrimitive\`: it first checks \`Symbol.toPrimitive\`, otherwise it tries \`valueOf()\` and then \`toString()\` (for a "string" hint the order is reversed). That is why \`[] + []\` is \`''\`, and \`[] + {}\` is \`'[object Object]'\`.

\`Number()\` is strict about the whole string; \`parseInt('12px')\` reads from the left and stops at the first bad character, giving 12. Unary plus (\`+value\`) is a short way to convert to a number.`,
      why: `Coercion is behind many "wat" moments in JavaScript and many real bugs: adding form input values gives "1020" instead of 30, because inputs are strings. Interviewers use coercion questions to check how deeply you know the language.`,
      analogy: `Coercion is like an over-helpful translator. When you speak two languages in one sentence, it guesses which one you meant. With \`+\`, it guesses "text" if any word is text. With \`*\`, it guesses "numbers". The guesses are consistent, but not always what you wanted.`,
      code: [
        {
          title: 'Implicit coercion in action',
          lang: 'javascript',
          code: `console.log('5' + 2);      // "52"  (string wins with +)
console.log('5' - 2);      // 3     (- forces numbers)
console.log('5' * '2');    // 10
console.log(true + 1);     // 2     (true -> 1)
console.log(null + 1);     // 1     (null -> 0)
console.log(undefined + 1);// NaN
console.log([] + []);      // ""    (both become "")
console.log([] + {});      // "[object Object]"
console.log(+'');          // 0
console.log(+'12px');      // NaN
console.log(parseInt('12px')); // 12`,
        },
        {
          title: 'A real bug and the fix',
          lang: 'javascript',
          code: `// Form inputs always give strings
const price = '10';
const qty = '20';

console.log(price + qty);                 // "1020"  bug!
console.log(Number(price) + Number(qty)); // 30      fixed

// Control conversion of your own objects
const money = {
  amount: 50,
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? this.amount : \`₹\${this.amount}\`;
  },
};
console.log(+money);      // 50
console.log(\`\${money}\`);   // "₹50"`,
        },
      ],
      output: `The first block shows \`+\` choosing string joining whenever a string is involved, while \`-\` and \`*\` convert to numbers. Arrays become strings first (\`[]\` → \`""\`), and plain objects become \`"[object Object]"\`.

In the second block, adding two input strings joins them into "1020". Converting with \`Number()\` gives 30. The \`Symbol.toPrimitive\` method lets our object decide: as a number it is 50, inside a template string it is "₹50".`,
      questions: [
        {
          q: 'What is type coercion?',
          a: 'Automatic conversion of a value from one type to another, either implicitly by operators (`+`, `==`, `if`) or explicitly with `Number()`, `String()`, `Boolean()`.',
        },
        {
          q: 'Why does "5" + 2 give "52" but "5" - 2 give 3?',
          a: '`+` is also string concatenation, so if either side is a string it joins them. `-` only works on numbers, so it converts the string to a number.',
        },
        {
          q: 'Number() vs parseInt()?',
          a: '`Number` converts the whole value and returns NaN if any part is invalid. `parseInt` reads digits from the start and stops at the first non-digit, so `parseInt("12px")` is 12. Always pass the radix: `parseInt(x, 10)`.',
        },
        {
          q: 'What is [] + {}?',
          a: '`"[object Object]"`. The array becomes `""` and the object becomes `"[object Object]"`, then they are joined.',
        },
      ],
      spoken: `"Type coercion is JavaScript automatically converting types. The plus operator prefers strings, so if either side is a string, it concatenates — that's why adding two form inputs can give '1020'. Other math operators convert to numbers, and conditions convert to booleans. Objects are converted to primitives using Symbol.toPrimitive, or valueOf and toString. In real code I avoid relying on implicit coercion: I convert explicitly with Number or String, use triple equals, and use Number.isNaN to check results."`,
      mistakes: [
        'Adding values from inputs, query params or env variables without converting them to numbers first.',
        'Using `parseInt` without a radix, or using it on floats when you wanted `parseFloat`/`Number`.',
        'Assuming `Number(\'\')` is NaN — it is `0`, which can hide empty input bugs.',
        'Follow-up trap: "What is `0.1 + 0.2 === 0.3`?" False, but that is floating-point precision, not coercion. Compare with a tolerance: `Math.abs(a - b) < Number.EPSILON`.',
      ],
      takeaway: '`+` prefers strings, other operators prefer numbers — convert explicitly and avoid surprises.',
    },
    {
      id: 'execution-context-call-stack',
      title: 'Execution Context and the Call Stack',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Every function call creates an execution context pushed onto the call stack; JavaScript runs one context at a time.',
      what: `An **execution context** is the environment where a piece of code runs. It holds the variables, the scope chain, and the value of \`this\`.

- When your script starts, a **global execution context** is created.
- Every time you **call** a function, a new **function execution context** is created.

The **call stack** keeps track of these contexts. A call **pushes** a context on top; when the function returns, it is **popped** off. JavaScript runs only the context at the top — it is **single-threaded**.

#### Deeper version
Each context is built in two phases:
1. **Creation phase**: set up the variable environment (hoisting happens here — \`var\` as \`undefined\`, functions fully, \`let\`/\`const\` in the TDZ), create the link to the outer scope, and decide \`this\`.
2. **Execution phase**: run the code line by line and assign values.

If functions keep calling each other without returning (like endless recursion), the stack fills up and you get \`RangeError: Maximum call stack size exceeded\` — a **stack overflow**.

The stack is also what you see in an error's **stack trace**. Async callbacks do not run on the current stack; they wait in queues until the stack is empty (see the event loop).`,
      why: `This is the mental model behind hoisting, scope, closures, \`this\` and the event loop. It also helps you read stack traces and understand why heavy synchronous work freezes the page.`,
      analogy: `The call stack is a stack of plates. Each function call puts a new plate on top. You can only wash the top plate. When it is done, you take it off and go back to the plate below.`,
      code: [
        {
          title: 'Watching the stack grow and shrink',
          lang: 'javascript',
          code: `function third() {
  console.log('in third');
  console.trace(); // prints the current call stack
}
function second() { third(); }
function first() { second(); }

first();
// Stack while in third (top to bottom): third -> second -> first -> (global)`,
        },
        {
          title: 'Stack overflow',
          lang: 'javascript',
          code: `function countDown(n) {
  return countDown(n - 1); // no base case: never stops
}

try {
  countDown(5);
} catch (e) {
  console.log(e instanceof RangeError, e.message);
  // true "Maximum call stack size exceeded"
}

// Fixed with a base case
function safeCountDown(n) {
  if (n === 0) return 'done';
  return safeCountDown(n - 1);
}
console.log(safeCountDown(5)); // "done"`,
        },
      ],
      output: `In the first block, \`console.trace()\` shows the stack: \`third\`, called by \`second\`, called by \`first\`, called from the global code. As each function returns, it is removed.

In the second block, the recursion never stops, so the stack grows until the engine throws a \`RangeError\`. With a base case, the recursion stops at 0 and returns "done".`,
      questions: [
        {
          q: 'What is an execution context?',
          a: 'The environment in which code runs, containing its variables, scope chain and `this`. There is one global context and a new one for every function call.',
        },
        {
          q: 'What is the call stack?',
          a: 'A last-in, first-out list of execution contexts. A function call pushes a context; returning pops it. JavaScript always runs the top one.',
        },
        {
          q: 'What causes "Maximum call stack size exceeded"?',
          a: 'Too many nested calls without returning, usually recursion without a correct base case, or two functions calling each other forever.',
        },
        {
          q: 'What are the two phases of an execution context?',
          a: 'Creation (set up variables, scope link and `this` — this is where hoisting happens) and execution (run code line by line).',
        },
      ],
      spoken: `"An execution context is the environment where code runs: its variables, its scope chain and its this. There's a global context, and each function call creates a new one. They are managed by the call stack: calling a function pushes its context, returning pops it, and since JavaScript is single-threaded, only the top one runs. Each context is created in two phases — creation, where hoisting happens, and execution. If recursion has no base case, the stack overflows with a RangeError. Async callbacks only run once this stack is empty."`,
      mistakes: [
        'Thinking async callbacks run "in parallel" on the stack. They wait in a queue until the stack is empty.',
        'Writing recursion without a base case, or with a base case that is never reached.',
        'Confusing the call stack (function calls) with the heap (where objects are stored in memory).',
        'Follow-up trap: "Does JavaScript have tail call optimization?" It is in the ES2015 spec, but in practice only Safari\'s engine implements it. Do not rely on it; convert deep recursion to a loop.',
      ],
      takeaway: 'Each call pushes a context onto one stack; JavaScript only ever runs the top one.',
    },
    {
      id: 'closures',
      title: 'Closures',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A function that remembers the variables from the place where it was created, even after that outer function has finished.',
      what: `A **closure** is a function plus the variables it can "see" from where it was written.

Normally, when a function finishes, its local variables are thrown away. But if an inner function still uses them, JavaScript keeps them alive. The inner function "closes over" those variables — that is why it is called a closure.

#### Deeper version
Every function in JavaScript keeps a hidden link to its **lexical environment** (the scope where it was defined, not where it is called). When the function runs, it looks up variables through this chain of scopes. As long as some function still holds that link, the garbage collector cannot free those variables.`,
      why: `Closures let us:
- **Keep data private** (like a private variable inside a counter).
- **Remember settings** for later (function factories, currying).
- **Keep state** in callbacks, event handlers and timers.
- They power React hooks, \`debounce\`, \`throttle\`, \`memoize\` and the module pattern.`,
      analogy: `Imagine a child leaving home with a backpack. Inside the backpack are things from home (the outer variables). Even after leaving the house (the outer function finished), the child can still open the backpack and use those things. Nobody else can reach into that backpack.`,
      code: [
        {
          title: 'Private counter',
          lang: 'javascript',
          code: `function createCounter() {
  let count = 0; // private: no one outside can touch this directly

  return {
    increment() { count++; return count; },
    decrement() { count--; return count; },
    get value() { return count; },
  };
}

const counter = createCounter();
counter.increment();          // 1
counter.increment();          // 2
console.log(counter.value);   // 2
console.log(counter.count);   // undefined -> count is private

const other = createCounter(); // a brand-new, separate count
console.log(other.increment()); // 1`,
        },
        {
          title: 'Function factory',
          lang: 'javascript',
          code: `function multiplyBy(factor) {
  return (n) => n * factor; // remembers "factor"
}

const double = multiplyBy(2);
const triple = multiplyBy(3);
console.log(double(5)); // 10
console.log(triple(5)); // 15`,
        },
      ],
      output: `\`createCounter()\` finished long ago, but \`increment\` still remembers \`count\` and keeps updating it. Code outside cannot read \`counter.count\` — it is \`undefined\` — so the data is truly private. Each call to \`createCounter()\` makes a **new** closure with its own \`count\`, which is why \`other\` starts again at 1.

In the factory, \`double\` remembers \`factor = 2\` and \`triple\` remembers \`factor = 3\`, so they print \`10\` and \`15\`.`,
      questions: [
        {
          q: 'What is a closure?',
          a: 'A function that remembers the variables from the scope where it was created, even after that outer function has returned.',
        },
        {
          q: 'Give a real use case of closures.',
          a: 'Data privacy (a counter or a module with private state), function factories, `debounce`/`throttle` (they remember the timer id), memoization caches, and event handlers that need some outer value.',
        },
        {
          q: 'How are closures related to React hooks?',
          a: 'Every render creates new functions that close over that render\'s props and state. If a callback or effect keeps an old function, it sees old values — this is the "stale closure" problem.',
        },
        {
          q: 'Can closures cause memory leaks?',
          a: 'Yes. If a long-living closure (like an event listener or timer) holds a reference to a big object, that object cannot be garbage collected. Remove listeners and clear timers when they are not needed.',
        },
      ],
      spoken: `"A closure is when a function remembers the variables from the place it was created, even after the outer function has finished running. JavaScript keeps those variables alive because the inner function still references them. I use closures for private state, like a counter that can't be changed from outside, for function factories, and in utilities like debounce, which remembers its timer between calls. In React, every render's handlers close over that render's state, which is also why we can get stale closures if dependencies are wrong."`,
      mistakes: [
        'Thinking a closure copies the value. It keeps a live **reference** to the variable, so it sees later changes.',
        'Classic trap: `var` in a loop with `setTimeout` — all callbacks share one variable. Fix it with `let` or an IIFE.',
        'Forgetting that closures keep big objects in memory (listeners, timers) and cause leaks.',
        'Follow-up trap: "Is every function a closure?" Technically yes — every function captures its lexical scope. The term usually matters when the inner function outlives the outer one.',
      ],
      takeaway: 'A closure is a function plus its remembered surroundings — it is how JavaScript does private state and "remember this for later".',
    },
    {
      id: 'this-keyword',
      title: 'The this Keyword',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'this is decided by HOW a function is called (except arrows, which take it from where they are written).',
      what: `\`this\` is a special word that points to an object — usually "the object that called the function". Its value is decided **when the function is called**, not when it is written.

Four rules, in order of strength:
1. **new binding**: \`new User()\` → \`this\` is the new object.
2. **Explicit binding**: \`fn.call(obj)\`, \`fn.apply(obj)\`, \`fn.bind(obj)\` → \`this\` is \`obj\`.
3. **Implicit binding**: \`obj.method()\` → \`this\` is \`obj\` (the thing before the dot).
4. **Default binding**: plain \`fn()\` → \`undefined\` in strict mode, the global object in sloppy mode.

**Arrow functions** ignore all of these and use the \`this\` of the surrounding code.

#### Deeper version
The most common bug is **losing \`this\`**: when you take a method off its object (\`const f = obj.method\`) or pass it as a callback (\`setTimeout(obj.method)\`, \`button.addEventListener('click', obj.method)\`), the "dot" is gone, so rule 3 no longer applies.

Other cases:
- In a DOM event listener written as a normal function, \`this\` is the element (\`event.currentTarget\`).
- At the top level of an ES module, \`this\` is \`undefined\`. In a CommonJS file it is \`module.exports\`.
- Inside a class, methods are strict, so a detached method gets \`undefined\`.
- \`globalThis\` is the standard way to get the global object everywhere.`,
      why: `\`this\` lets one function work with many objects (shared methods on prototypes and classes). It is also a top source of bugs ("cannot read property of undefined") in callbacks and old React class components, so interviewers love it.`,
      analogy: `\`this\` is like the word "me". When Asha says "me", it means Asha. When Ravi says the same sentence, "me" means Ravi. The meaning depends on who is speaking (who calls the function), not on who wrote the sentence. Arrow functions are like a recorded message: "me" always means whoever recorded it.`,
      code: [
        {
          title: 'The four rules',
          lang: 'javascript',
          code: `'use strict';

function show() { return this?.name; }

const asha = { name: 'Asha', show };
const ravi = { name: 'Ravi' };

console.log(asha.show());        // "Asha"   (implicit: before the dot)
console.log(show.call(ravi));    // "Ravi"   (explicit)
console.log(show());             // undefined (default, strict mode)

function Person(name) { this.name = name; }
console.log(new Person('Kiran').name); // "Kiran" (new)`,
        },
        {
          title: 'Losing this and three fixes',
          lang: 'javascript',
          code: `'use strict'; // (ES modules are strict automatically)

const counter = {
  count: 0,
  inc() { this.count++; return this.count; },
};

const loose = counter.inc;
try { loose(); } catch (e) { console.log('lost this:', e.message); }

// Fix 1: bind
const bound = counter.inc.bind(counter);
console.log(bound()); // 1

// Fix 2: wrap in an arrow so the call keeps the dot
setTimeout(() => console.log(counter.inc()), 0); // 2

// Fix 3: arrow inside the method uses the method's this
const team = {
  name: 'Core',
  members: ['A', 'B'],
  list() { return this.members.map((m) => \`\${m} of \${this.name}\`); },
};
console.log(team.list()); // ["A of Core", "B of Core"]`,
        },
      ],
      output: `In the first block, the same \`show\` function returns a different name depending on how it is called. With a plain call in strict mode, \`this\` is \`undefined\`, so \`this?.name\` is \`undefined\`.

In the second block, \`loose()\` has no object before the dot, so in strict mode \`this\` is \`undefined\` and \`this.count\` throws (in sloppy mode it would silently touch the global object instead). \`bind\` fixes \`this\` permanently, the arrow wrapper keeps the \`counter.\` call, and the arrow inside \`map\` uses the \`this\` of \`list\`.`,
      questions: [
        {
          q: 'How is the value of this decided?',
          a: 'By how the function is called: `new` → new object; `call/apply/bind` → the given object; `obj.fn()` → `obj`; plain call → `undefined` (strict) or global. Arrow functions use the surrounding `this`.',
        },
        {
          q: 'Why does this become undefined when passing a method as a callback?',
          a: 'Because the function is called without its object (no dot), so the default rule applies. Fix it with `bind`, an arrow wrapper, or arrow class fields.',
        },
        {
          q: 'What is this inside an arrow function?',
          a: 'The same as `this` in the code around it, fixed when the arrow is created. It cannot be changed.',
        },
        {
          q: 'What is this in a DOM event handler?',
          a: 'With a normal function, it is the element the listener is attached to (`event.currentTarget`). With an arrow, it is the outer `this`.',
        },
      ],
      spoken: `"this is decided at call time by how the function is called. If it's called with new, this is the new object. With call, apply or bind, it's whatever I pass. If it's called as obj.method, this is the object before the dot. A plain call gives undefined in strict mode, or the global object in sloppy mode. Arrow functions are the exception — they take this from the surrounding scope. The classic bug is passing a method as a callback, which loses this, and I fix that with bind or an arrow function."`,
      mistakes: [
        'Thinking `this` refers to the function itself or to where the function was written.',
        'Passing `obj.method` to `setTimeout` or `addEventListener` and losing `this`.',
        'Using an arrow function for an object method and expecting `this` to be the object.',
        'Follow-up trap: "Which wins, bind or new?" `new` wins: calling `new` on a bound function ignores the bound `this` (but keeps bound arguments).',
      ],
      takeaway: '`this` = how the function is called (new > bind/call > dot > default); arrows just borrow it.',
    },
    {
      id: 'call-apply-bind',
      title: 'call, apply and bind',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'All three set this: call and apply run the function now (args listed vs array), bind returns a new function for later.',
      what: `These three methods let you **choose** what \`this\` is when a function runs.

- \`fn.call(obj, a, b)\` → runs \`fn\` **now** with \`this = obj\`, arguments listed one by one.
- \`fn.apply(obj, [a, b])\` → runs \`fn\` **now**, arguments as an **array**.
- \`fn.bind(obj, a)\` → does **not** run it. Returns a **new function** with \`this\` fixed to \`obj\` (and optionally some arguments pre-filled).

Memory trick: **A**pply = **A**rray, **C**all = **C**ommas.

#### Deeper version
- A bound function's \`this\` is **permanent**: binding it again or using \`call\` on it does not change \`this\`. Only \`new\` overrides it.
- \`bind\` with extra arguments does **partial application**: \`const add5 = add.bind(null, 5)\`.
- Classic uses: borrowing methods (\`Array.prototype.slice.call(arguments)\`), \`Math.max.apply(null, nums)\` (now usually \`Math.max(...nums)\`), and fixing \`this\` in callbacks.
- They have **no effect on arrow functions'** \`this\`.
- Writing a \`bind\` polyfill is a very common interview task (see the polyfills topic).`,
      why: `They solve the "lost this" problem for callbacks and let you reuse one function with different objects. Many older libraries and React class components depended on \`bind\`. Interviewers use them to test your understanding of \`this\`.`,
      analogy: `Imagine a microphone (the function) that says "Hello, I am {this.name}". \`call\` hands the mic to someone and they speak right now. \`apply\` is the same, but the extra words come in one envelope (array). \`bind\` engraves a name on the mic so whoever picks it up later always speaks as that person.`,
      code: [
        {
          title: 'call vs apply vs bind',
          lang: 'javascript',
          code: `function introduce(greeting, punctuation) {
  return \`\${greeting}, I am \${this.name}\${punctuation}\`;
}

const asha = { name: 'Asha' };

console.log(introduce.call(asha, 'Hi', '!'));     // "Hi, I am Asha!"
console.log(introduce.apply(asha, ['Hello', '.'])); // "Hello, I am Asha."

const ashaIntro = introduce.bind(asha, 'Hey');  // this + first arg fixed
console.log(ashaIntro('?'));                     // "Hey, I am Asha?"

// A bound function cannot be re-bound
const ravi = { name: 'Ravi' };
console.log(ashaIntro.call(ravi, '!'));          // still "Hey, I am Asha!"`,
        },
        {
          title: 'Practical uses',
          lang: 'javascript',
          code: `// 1) Partial application
const multiply = (a, b) => a * b;
const double = multiply.bind(null, 2);
console.log(double(7)); // 14

// 2) Borrowing an array method for an array-like object
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
console.log(Array.prototype.map.call(arrayLike, (x) => x.toUpperCase())); // ['A', 'B']

// 3) Fixing this for a callback
class Clock {
  constructor() { this.ticks = 0; this.tick = this.tick.bind(this); }
  tick() { this.ticks++; console.log('ticks:', this.ticks); }
}
const clock = new Clock();
setTimeout(clock.tick, 0); // "ticks: 1" (works because it was bound)`,
        },
      ],
      output: `In the first block, \`call\` and \`apply\` run the function immediately with \`this = asha\`; only the way arguments are passed differs. \`bind\` returns a new function with \`this\` and "Hey" pre-filled. Calling it with \`.call(ravi)\` still says "Asha" because a bound \`this\` cannot be changed.

In the second block, \`bind(null, 2)\` pre-fills the first argument. \`map.call\` lets an array-like object use an array method. Binding \`tick\` in the constructor means it works even when passed to \`setTimeout\` without its object.`,
      questions: [
        {
          q: 'What is the difference between call, apply and bind?',
          a: '`call` and `apply` invoke the function immediately with a given `this`; `call` takes arguments separately, `apply` takes an array. `bind` returns a new function with `this` (and optional arguments) fixed, to call later.',
        },
        {
          q: 'Can you re-bind a bound function?',
          a: 'No. The first `bind` wins. Later `bind`, `call` or `apply` cannot change `this` (only `new` can).',
        },
        {
          q: 'Do call/apply/bind work on arrow functions?',
          a: 'You can call them, and arguments are passed, but the `this` value is ignored because arrows use lexical `this`.',
        },
        {
          q: 'What is partial application with bind?',
          a: 'Pre-filling some arguments: `const add10 = add.bind(null, 10)` returns a function that only needs the remaining arguments.',
        },
      ],
      spoken: `"call, apply and bind all let me set this explicitly. call and apply invoke the function right away; the only difference is that call takes arguments one by one, and apply takes them as an array. bind doesn't invoke the function — it returns a new function where this, and optionally some arguments, are locked in, which is useful for callbacks and partial application. A bound function's this can't be changed again, except by new. And none of them change this for arrow functions."`,
      mistakes: [
        'Writing `onClick={this.handle.bind(this)}` inside render — creates a new function every render. Bind once in the constructor or use an arrow class field.',
        'Expecting `bind` to call the function immediately.',
        'Trying to re-bind an already bound function to a new object.',
        'Follow-up trap: "Implement bind yourself." Return a function that calls `fn.apply(context, [...preArgs, ...laterArgs])`; for full marks, handle `new` too.',
      ],
      takeaway: 'call = run now with commas, apply = run now with an array, bind = new function for later.',
    },
    {
      id: 'higher-order-functions',
      title: 'Higher-Order Functions',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A function that takes a function as an argument or returns a function — like map, debounce, or middleware.',
      what: `A **higher-order function (HOF)** is a function that does at least one of these:
- **takes** another function as an argument, or
- **returns** a new function.

You already use them: \`arr.map(fn)\`, \`setTimeout(fn)\`, \`addEventListener('click', fn)\`, Express \`app.use(fn)\`.

#### Deeper version
HOFs are the core of **functional programming** in JavaScript. They let you separate **what to do** (the passed function) from **how it is done** (the loop, the timing, the error handling).

Common patterns built from HOFs:
- **Wrappers / decorators**: add behaviour around a function (logging, retry, timing, caching).
- **Function factories**: return a configured function (\`makeValidator(minLength)\`).
- **Composition**: \`compose(f, g)(x)\` = \`f(g(x))\`; \`pipe\` runs left to right.
- **Higher-order components** in React: a function that takes a component and returns a new component.

They work because of **closures**: the returned function remembers the arguments of the outer one.`,
      why: `HOFs remove repeated code. Instead of writing the same try/catch, logging or retry logic in ten places, you write one wrapper and apply it. They make code shorter, reusable and easier to test.`,
      analogy: `A HOF is like a gift-wrapping service. You hand them any gift (a function), and they hand it back wrapped with extra features (a bow, a card) — the gift inside stays the same.`,
      code: [
        {
          title: 'A wrapper that adds logging and timing',
          lang: 'javascript',
          code: `function withTiming(fn) {
  return function (...args) {          // returns a new function
    const start = Date.now();
    const result = fn.apply(this, args); // keep this and arguments
    console.log(\`\${fn.name} took \${Date.now() - start}ms\`);
    return result;
  };
}

function slowSquare(n) {
  for (let i = 0; i < 1e6; i++) {}     // fake work
  return n * n;
}

const timedSquare = withTiming(slowSquare);
console.log(timedSquare(9)); // logs "slowSquare took Xms", then 81`,
        },
        {
          title: 'Compose and pipe',
          lang: 'javascript',
          code: `const pipe = (...fns) => (input) => fns.reduce((acc, fn) => fn(acc), input);

const trim = (s) => s.trim();
const lower = (s) => s.toLowerCase();
const slugify = (s) => s.replace(/\\s+/g, '-');

const toSlug = pipe(trim, lower, slugify);
console.log(toSlug('  Hello World JS  ')); // "hello-world-js"`,
        },
      ],
      output: `In the first block, \`withTiming\` takes \`slowSquare\` and returns a new function that does the same work but also logs how long it took. Calling it prints the timing and returns 81.

In the second block, \`pipe\` takes several functions and returns one function that runs them in order: trim, then lowercase, then replace spaces with dashes, giving "hello-world-js".`,
      questions: [
        {
          q: 'What is a higher-order function?',
          a: 'A function that takes a function as an argument, returns a function, or both. Examples: `map`, `filter`, `setTimeout`, `debounce`.',
        },
        {
          q: 'What is the difference between a callback and a higher-order function?',
          a: 'The callback is the function being passed in. The higher-order function is the one receiving it (or returning a function).',
        },
        {
          q: 'What is function composition?',
          a: 'Combining small functions so the output of one is the input of the next. `compose` runs right to left; `pipe` runs left to right.',
        },
        {
          q: 'What is a Higher-Order Component in React?',
          a: 'A function that takes a component and returns a new component with extra props or behaviour, like `withAuth(Dashboard)`. Hooks have replaced most HOCs.',
        },
      ],
      spoken: `"A higher-order function is a function that takes another function as an argument, or returns one. Array methods like map and filter, setTimeout and addEventListener are all examples. I use them to separate what to do from how it's done — for example, writing a withRetry or withLogging wrapper once and applying it to many API calls, or composing small functions with a pipe helper. They rely on closures, because the returned function remembers the original one. In React, higher-order components are the same idea applied to components."`,
      mistakes: [
        'Losing `this` or arguments inside a wrapper — use `fn.apply(this, args)` or `fn(...args)`.',
        'Forgetting to return the result of the wrapped function, so callers get `undefined`.',
        'Wrapping async functions without `await`/returning the promise, so errors escape the wrapper.',
        'Follow-up trap: "Is `forEach` a higher-order function?" Yes — it takes a callback, even though it returns nothing.',
      ],
      takeaway: 'Functions that take or return functions let you write behaviour once and reuse it everywhere.',
    },
    {
      id: 'iife',
      title: 'IIFE (Immediately Invoked Function Expression)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A function that runs as soon as it is defined, used to create a private scope; modules and blocks replaced most uses.',
      what: `An **IIFE** is a function that is defined and **called immediately**:

\`(function () { /* code */ })();\` or with an arrow: \`(() => { /* code */ })();\`

The outer brackets turn the function into an **expression**, and the final \`()\` calls it.

#### Deeper version
Why the brackets? \`function () {}()\` at the start of a line is read as a function **declaration**, which needs a name and cannot be called directly — a syntax error. Wrapping it makes it an expression.

Before ES6 there was no block scope and no modules, so IIFEs were used to:
- create a **private scope** so variables did not leak into the global scope,
- build the **module pattern** (return an object of public functions, keep the rest private),
- capture loop values with \`var\` (each IIFE call gets its own copy).

Today, ES modules and \`let\`/\`const\` cover most of this. IIFEs are still used for **top-level async code** in older setups (\`(async () => { await ... })()\`), in bundler output, and in some one-off scripts.`,
      why: `It is a classic interview topic because it tests scope knowledge, and you will still see IIFEs in older code, bundled output and quick scripts that need \`await\` at the top level without module support.`,
      analogy: `An IIFE is like a pop-up shop: it opens, does its business, and closes right away. Whatever happened inside stays inside — nothing is left lying around on the street (global scope).`,
      code: [
        {
          title: 'Private scope and the module pattern',
          lang: 'javascript',
          code: `const cart = (function () {
  const items = [];            // private: not reachable from outside

  return {
    add(item) { items.push(item); },
    count() { return items.length; },
  };
})();

cart.add('book');
cart.add('pen');
console.log(cart.count());   // 2
console.log(cart.items);     // undefined (private)`,
        },
        {
          title: 'Async IIFE and the old loop fix',
          lang: 'javascript',
          code: `// Run await at the top level in a non-module script
(async () => {
  const data = await Promise.resolve({ ok: true });
  console.log('loaded:', data.ok); // "loaded: true"
})();

// Pre-ES6 fix for the var loop bug
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log('j =', j), 0);
  })(i);
}
// "j = 0", "j = 1", "j = 2"`,
        },
      ],
      output: `In the first block, \`items\` lives inside the IIFE, so outside code can only use \`add\` and \`count\`; \`cart.items\` is \`undefined\`.

In the second block, the async IIFE prints "loaded: true". In the loop, each IIFE call receives its own \`j\`, so the timers print 0, 1, 2 instead of 3, 3, 3.`,
      questions: [
        {
          q: 'What is an IIFE?',
          a: 'A function expression that runs immediately after it is created: `(function () { ... })()`. It creates a private scope.',
        },
        {
          q: 'Why are the surrounding brackets needed?',
          a: 'They make the parser treat the function as an expression. Without them, a line starting with `function` is a declaration, which cannot be invoked directly.',
        },
        {
          q: 'Are IIFEs still needed today?',
          a: 'Much less. ES modules give file-level scope and `let`/`const` give block scope. They are still handy for an async entry point where top-level await is unavailable.',
        },
      ],
      spoken: `"An IIFE is an immediately invoked function expression — a function wrapped in parentheses and called right away. Before ES6, it was the main way to create a private scope, so variables didn't leak into the global object, and it powered the module pattern, where you return public methods and keep the rest private. It was also used to fix the var-in-loop bug. Today, ES modules and block scope cover most of that, but I still use an async IIFE when I need await at the top level in a script that isn't a module."`,
      mistakes: [
        'Forgetting a semicolon on the previous line — `a = b\\n(function(){})()` is read as calling `b`. Some people start IIFEs with `;` for safety.',
        'Thinking an IIFE is needed for privacy in ES modules — the module already has its own scope.',
        'Follow-up trap: "What does `!function(){}()` do?" The `!` also forces an expression, so it is another IIFE style (the return value is negated and thrown away).',
      ],
      takeaway: 'An IIFE runs once and keeps its variables private — mostly replaced by modules and block scope.',
    },
    {
      id: 'currying',
      title: 'Currying and Partial Application',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Currying turns f(a, b, c) into f(a)(b)(c), so you can pre-fill arguments and build specialised functions.',
      what: `**Currying** changes a function that takes many arguments into a chain of functions that each take **one** argument.

Normal: \`add(1, 2, 3)\` → Curried: \`add(1)(2)(3)\`.

**Partial application** is similar: you fix **some** arguments now and give the rest later, e.g. \`const add10 = add.bind(null, 10)\`.

#### Deeper version
Currying works because of **closures**: each returned function remembers the arguments collected so far.

A generic \`curry\` helper checks how many arguments the original function needs (\`fn.length\`). If enough have been collected, it calls the function; otherwise it returns another function that waits for more. Most real helpers allow several arguments at once: \`curried(1)(2, 3)\`.

Note: \`fn.length\` does not count rest parameters or parameters after the first one with a default value, so a generic \`curry\` does not work well with those.

An "infinite currying" question is also common: \`sum(1)(2)(3)()\` that adds until called with no argument.`,
      why: `Currying helps create reusable, specialised functions from general ones — like a \`logger('error')\` or \`hasRole('admin')\` — and makes function composition easy. It is a popular interview question because it checks closures and recursion together.`,
      analogy: `Ordering a custom pizza step by step: first choose the base, then the sauce, then the toppings. Each step remembers your earlier choices. Partial application is like a "Margherita template" where base and sauce are already chosen — you only pick toppings.`,
      code: [
        {
          title: 'Manual and generic curry',
          lang: 'javascript',
          code: `// Manual curry
const greet = (greeting) => (name) => \`\${greeting}, \${name}!\`;
const sayHi = greet('Hi');
console.log(sayHi('Asha')); // "Hi, Asha!"

// Generic curry helper
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args); // enough args
    return (...more) => curried.apply(this, [...args, ...more]); // wait for more
  };
}

const volume = (l, w, h) => l * w * h;
const cVolume = curry(volume);
console.log(cVolume(2)(3)(4));  // 24
console.log(cVolume(2, 3)(4));  // 24
console.log(cVolume(2)(3, 4));  // 24`,
        },
        {
          title: 'Infinite currying sum',
          lang: 'javascript',
          code: `function sum(a) {
  return function next(b) {
    if (b === undefined) return a; // empty call ends the chain
    a += b;
    return next;
  };
}
console.log(sum(1)(2)(3)()); // 6
console.log(sum(5)());       // 5`,
        },
      ],
      output: `\`greet('Hi')\` returns a function that remembers "Hi"; calling it with "Asha" gives "Hi, Asha!". The generic \`curry\` collects arguments until it has 3 (because \`volume.length\` is 3) and then calls \`volume\`, so every style returns 24.

The infinite \`sum\` keeps adding while it gets numbers, and returns the total when called with no argument: 6 and 5.`,
      questions: [
        {
          q: 'What is currying?',
          a: 'Transforming a function with many arguments into a sequence of functions that each take one argument: `f(a, b, c)` → `f(a)(b)(c)`.',
        },
        {
          q: 'Currying vs partial application?',
          a: 'Currying always splits into single-argument steps. Partial application fixes some arguments now and returns a function for the rest, e.g. using `bind`.',
        },
        {
          q: 'What concept makes currying possible?',
          a: 'Closures. Each inner function remembers the arguments passed to the outer ones.',
        },
        {
          q: 'Where is currying useful in real code?',
          a: 'Creating specialised helpers (`const isAdmin = hasRole(\'admin\')`), event handlers with extra data (`onClick={handleSelect(id)}`), and composing functions with `pipe`.',
        },
      ],
      spoken: `"Currying transforms a function that takes several arguments into a chain of functions that each take one, so add of one, two, three becomes add of one, of two, of three. It works through closures: each function remembers the arguments collected so far. A generic curry helper compares the number of collected arguments with the function's length and either calls it or returns another function. It's useful to create specialised functions, like a logger preset to 'error', and for composition. Partial application is the looser cousin, where I fix some arguments at once, often with bind."`,
      mistakes: [
        'Relying on `fn.length` with default or rest parameters — they are not counted, so the curry helper calls too early or never.',
        'Confusing currying with partial application in the interview — explain both.',
        'Over-currying simple code, making it harder to read for the team.',
        'Follow-up trap: "Make `sum(1)(2)(3)` work without the final `()`." Return a function with a custom `valueOf`/`toString` or `Symbol.toPrimitive`, so `+sum(1)(2)(3)` gives 6.',
      ],
      takeaway: 'Currying = one argument at a time, powered by closures, great for building specialised functions.',
    },
    {
      id: 'deep-vs-shallow-copy',
      title: 'Deep vs Shallow Copy (and structuredClone)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A shallow copy duplicates only the top level (nested objects are shared); a deep copy duplicates everything.',
      what: `When you copy an object, there are two levels of copying:

- **Shallow copy**: a new outer object, but nested objects/arrays are **still shared** with the original. Spread (\`{...obj}\`, \`[...arr]\`), \`Object.assign\`, \`Array.from\`, \`slice\` are all shallow.
- **Deep copy**: everything, at every level, is new. Changing the copy never affects the original.

The modern way to deep copy is \`structuredClone(obj)\`.

#### Deeper version
Deep copy options:
- \`structuredClone(value)\` — built into modern browsers and Node 17+. Handles Dates, Maps, Sets, RegExps, typed arrays and **circular references**. It **cannot** clone functions, DOM nodes or class instances' prototypes (you get a plain object back; methods are lost) and throws \`DataCloneError\` for functions.
- \`JSON.parse(JSON.stringify(obj))\` — old trick. Loses \`undefined\`, functions, \`Symbol\`s; turns Dates into strings; breaks Maps/Sets; throws on circular refs and BigInt.
- A library such as lodash \`cloneDeep\`, or a hand-written recursive function (a common interview task).

In React and Redux we usually do not deep copy everything. We copy **only the path we change** (structural sharing), which is faster.`,
      why: `Shallow copies cause "ghost" bugs: you update a copy and the original changes too, or React does not re-render because a nested object was mutated. Knowing which tool to use is a must for state management.`,
      analogy: `A shallow copy is like photocopying a folder's cover page but keeping the same papers inside — if someone scribbles on a paper, both folders show it. A deep copy photocopies every single page.`,
      code: [
        {
          title: 'Shallow copy bug',
          lang: 'javascript',
          code: `const original = { name: 'Asha', address: { city: 'Pune' } };

const shallow = { ...original };
shallow.name = 'Ravi';            // top level: independent
shallow.address.city = 'Mumbai';  // nested: SHARED!

console.log(original.name);         // "Asha"
console.log(original.address.city); // "Mumbai"  <- original changed`,
        },
        {
          title: 'Deep copy options',
          lang: 'javascript',
          code: `const data = {
  when: new Date('2024-01-01'),
  tags: new Set(['js']),
  nested: { score: 10 },
};
data.self = data; // circular reference

const deep = structuredClone(data);
deep.nested.score = 99;
console.log(data.nested.score);      // 10 (untouched)
console.log(deep.when instanceof Date, deep.tags.has('js')); // true true
console.log(deep.self === deep);     // true (circular ref preserved)

// Structural sharing: copy only the changed path (React-style)
const state = { user: { name: 'Asha', prefs: { theme: 'light' } }, posts: [] };
const next = {
  ...state,
  user: { ...state.user, prefs: { ...state.user.prefs, theme: 'dark' } },
};
console.log(next.posts === state.posts); // true  (unchanged part reused)
console.log(state.user.prefs.theme);     // "light"`,
        },
      ],
      output: `In the first block, changing \`shallow.name\` does not affect the original, but changing \`shallow.address.city\` does, because \`address\` is the same object in both.

In the second block, \`structuredClone\` copies everything — Date, Set, nested object and even the circular reference — so changing \`deep\` leaves \`data\` alone. In the React-style update, only the changed path is copied; \`posts\` is reused, which is cheap and lets React see what changed.`,
      questions: [
        {
          q: 'What is the difference between a shallow and a deep copy?',
          a: 'A shallow copy creates a new top-level object but shares nested objects. A deep copy recursively copies everything, so nothing is shared.',
        },
        {
          q: 'How do you deep copy an object in modern JavaScript?',
          a: 'Use `structuredClone(obj)`. It handles Dates, Maps, Sets and circular references, but not functions or DOM nodes.',
        },
        {
          q: 'What is wrong with JSON.parse(JSON.stringify(obj))?',
          a: 'It drops functions and `undefined`, turns Dates into strings, breaks Map/Set, and throws on circular references and BigInt.',
        },
        {
          q: 'Is the spread operator a deep copy?',
          a: 'No, it only copies one level.',
        },
      ],
      spoken: `"A shallow copy creates a new outer object but nested objects are still shared, so changing a nested value in the copy changes the original too. Spread, Object.assign and slice are all shallow. A deep copy duplicates every level. Today I use structuredClone for that — it handles dates, maps, sets and circular references, though not functions. The JSON stringify trick is lossy. In React state, I usually don't deep clone everything; I spread only the path I'm changing, which keeps unchanged parts shared and makes updates efficient."`,
      mistakes: [
        'Spreading state once and then mutating a nested object — React may not re-render and the old state is corrupted.',
        'Using the JSON trick on data with Dates or `undefined` and losing information silently.',
        'Calling `structuredClone` on objects with functions — it throws a `DataCloneError`.',
        'Follow-up trap: "Does structuredClone keep class instances?" No. You get a plain object without the class prototype, so methods are gone.',
      ],
      takeaway: 'Spread is shallow; use `structuredClone` for real deep copies, and copy only the changed path in React.',
    },
    {
      id: 'immutability-freeze',
      title: 'Immutability, Pure Functions and Object.freeze',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Immutability means creating new values instead of changing old ones; Object.freeze locks an object, but only one level deep.',
      what: `**Immutable** data is data you never change after creating it. To "update" it, you make a **new copy** with the change.

A **pure function** follows two rules: same input → same output, and **no side effects** (it does not change outside data, call APIs, or log). Pure functions love immutable data.

JavaScript tools to lock objects:
- \`Object.freeze(obj)\`: no adding, removing or changing properties.
- \`Object.seal(obj)\`: no adding or removing, but you **can** change existing values.
- \`Object.preventExtensions(obj)\`: no adding; removing and changing are allowed.

#### Deeper version
\`Object.freeze\` is **shallow**: nested objects can still be changed. For full protection you need a recursive **deep freeze**. Changes to a frozen object fail **silently** in sloppy mode and **throw** a \`TypeError\` in strict mode. Check with \`Object.isFrozen(obj)\`.

\`const\` is **not** immutability — it only blocks re-assigning the variable.

Immutable updates enable cheap change detection: if the reference is different, something changed (\`prev !== next\`). This is exactly how React, Redux and \`React.memo\` decide what to re-render. Libraries like **Immer** let you write "mutating" code that produces immutable updates under the hood.`,
      why: `Mutating shared data causes bugs that are hard to trace: one component changes an array and another breaks. Immutability makes data flow predictable, enables undo/redo and time-travel debugging, and is required for React state updates to be detected.`,
      analogy: `Immutability is like editing a Google Doc by "Make a copy" every time instead of overwriting. You always have the old version, and anyone comparing can instantly tell the new copy is different. \`Object.freeze\` is laminating a page — but sticky notes attached to it (nested objects) can still be written on.`,
      code: [
        {
          title: 'freeze is shallow',
          lang: 'javascript',
          code: `'use strict';

const config = Object.freeze({ port: 3000, db: { host: 'localhost' } });

try {
  config.port = 4000;          // top level is frozen
} catch (e) {
  console.log(e.name);         // "TypeError"
}
config.db.host = 'prod-db';    // nested object is NOT frozen
console.log(config.db.host);   // "prod-db"

function deepFreeze(obj) {
  Object.values(obj).forEach((v) => {
    if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
  });
  return Object.freeze(obj);
}
const safe = deepFreeze({ db: { host: 'localhost' } });
console.log(Object.isFrozen(safe.db)); // true`,
        },
        {
          title: 'Pure vs impure, mutable vs immutable',
          lang: 'javascript',
          code: `// Impure: changes the input array (side effect)
function addItemImpure(cart, item) {
  cart.push(item);
  return cart;
}

// Pure: returns a new array, input untouched
const addItem = (cart, item) => [...cart, item];

const cart = ['book'];
const next = addItem(cart, 'pen');
console.log(cart, next);       // ['book'] ['book', 'pen']
console.log(cart === next);    // false -> easy change detection

// Immutable update of an item inside an array
const todos = [{ id: 1, done: false }, { id: 2, done: false }];
const updated = todos.map((t) => (t.id === 2 ? { ...t, done: true } : t));
console.log(todos[1].done, updated[1].done); // false true`,
        },
      ],
      output: `In the first block, changing \`config.port\` throws in strict mode, but \`config.db.host\` changes anyway because \`freeze\` only locks the top level. \`deepFreeze\` walks every nested object and freezes it too.

In the second block, \`addItem\` returns a new array, so \`cart\` stays \`['book']\`, and \`cart !== next\` tells us something changed. The \`map\` update creates a new object only for the changed task.`,
      questions: [
        {
          q: 'What is the difference between Object.freeze and const?',
          a: '`const` prevents re-assigning the variable. `Object.freeze` prevents changing the object\'s properties. They solve different problems.',
        },
        {
          q: 'freeze vs seal vs preventExtensions?',
          a: '`freeze`: no add, delete or change. `seal`: no add or delete, but values can change. `preventExtensions`: only no adding.',
        },
        {
          q: 'Is Object.freeze deep?',
          a: 'No, it is shallow. Nested objects stay mutable unless you freeze them recursively.',
        },
        {
          q: 'What is a pure function?',
          a: 'A function that always returns the same output for the same input and has no side effects such as mutating inputs, network calls or changing globals.',
        },
        {
          q: 'Why does React need immutable updates?',
          a: 'React compares old and new state by reference (`Object.is`). If you mutate and pass the same object, React thinks nothing changed and may skip the re-render.',
        },
      ],
      spoken: `"Immutability means I don't change existing data; I create a new copy with the change. That makes change detection cheap, because a new reference means something changed, which is exactly how React and Redux work. Pure functions fit with this: same input, same output, no side effects. Object.freeze locks an object so properties can't be added, removed or changed, but it's shallow, so nested objects need a deep freeze. And const is different — it only stops re-assignment. For complex nested updates, I like Immer."`,
      mistakes: [
        'Believing `const` makes an object immutable.',
        'Assuming `Object.freeze` protects nested objects.',
        'Mutating React state (`state.items.push(x); setItems(state.items)`) and wondering why the UI does not update.',
        'Follow-up trap: "Does freezing an array stop `push`?" Yes — `push` throws a `TypeError` on a frozen array (in any mode, since it is a method that fails).',
      ],
      takeaway: 'Make new values instead of changing old ones; `Object.freeze` helps but is only shallow.',
    },
    {
      id: 'prototypes',
      title: 'Prototypes and Prototypal Inheritance',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Every object has a hidden link to another object (its prototype); missing properties are looked up along this prototype chain.',
      what: `In JavaScript, objects can **inherit** from other objects directly. Every object has a hidden link called its **prototype**.

When you read \`obj.x\` and \`obj\` does not have \`x\`, JavaScript looks in \`obj\`'s prototype, then that object's prototype, and so on. This path is the **prototype chain**. It ends at \`Object.prototype\`, whose prototype is \`null\`.

That is why \`[1, 2].map\` works: \`map\` is not on your array; it lives on \`Array.prototype\`.

#### Deeper version
Three names that confuse people:
- \`[[Prototype]]\`: the hidden internal link every object has.
- \`obj.__proto__\`: an old getter/setter for that link. Prefer \`Object.getPrototypeOf(obj)\` and \`Object.setPrototypeOf\`.
- \`Fn.prototype\`: a property that only **functions** have. When you call \`new Fn()\`, the new object's \`[[Prototype]]\` is set to \`Fn.prototype\`.

So: \`new User().__proto__ === User.prototype\` is \`true\`.

\`Object.create(proto)\` makes a new object with \`proto\` as its prototype. Methods on the prototype are **shared** by all instances (saving memory), while data set in the constructor is per instance. Writing a property always creates it on the object itself (**shadowing** the prototype one). ES6 \`class\` is mostly syntax on top of this same system.`,
      why: `Prototypes are how JavaScript does inheritance and how built-in methods are shared. Understanding them explains \`class\`, \`instanceof\`, why polyfills work (adding to \`Array.prototype\`), and why you should not modify built-in prototypes in your own apps.`,
      analogy: `The prototype chain is like asking for help in a family. If you do not know a recipe, you ask your mother. If she does not know, she asks her mother. The question goes up the family tree until someone knows, or you reach the top and the answer is "nobody knows" (\`undefined\`).`,
      code: [
        {
          title: 'The prototype chain',
          lang: 'javascript',
          code: `const animal = {
  eats: true,
  describe() { return \`\${this.name} eats: \${this.eats}\`; },
};

const dog = Object.create(animal); // dog's prototype is animal
dog.name = 'Bruno';
dog.barks = true;

console.log(dog.barks);       // true (own property)
console.log(dog.eats);        // true (from animal)
console.log(dog.describe());  // "Bruno eats: true" (this = dog)
console.log(Object.getPrototypeOf(dog) === animal);   // true
console.log(Object.hasOwn(dog, 'eats'));              // false
console.log(Object.getPrototypeOf(Object.prototype)); // null (end of chain)`,
        },
        {
          title: 'Constructor functions and .prototype',
          lang: 'javascript',
          code: `function User(name) {
  this.name = name;                  // per-instance data
}
User.prototype.greet = function () { // shared by all users
  return 'Hi, ' + this.name;
};

const a = new User('Asha');
const b = new User('Ravi');

console.log(a.greet(), b.greet());           // "Hi, Asha" "Hi, Ravi"
console.log(a.greet === b.greet);            // true (one shared function)
console.log(Object.getPrototypeOf(a) === User.prototype); // true
console.log(a instanceof User);              // true`,
        },
      ],
      output: `In the first block, \`dog\` only owns \`name\` and \`barks\`. \`eats\` and \`describe\` are found on \`animal\` through the prototype chain. Inside \`describe\`, \`this\` is still \`dog\` because it was called as \`dog.describe()\`. The chain ends with \`null\`.

In the second block, both users share one \`greet\` function stored on \`User.prototype\`, while each has its own \`name\`. \`instanceof\` checks whether \`User.prototype\` is in \`a\`'s chain.`,
      questions: [
        {
          q: 'What is prototypal inheritance?',
          a: 'Objects inherit directly from other objects through a prototype link. Property lookups that fail on the object continue up the prototype chain.',
        },
        {
          q: 'Difference between __proto__ and prototype?',
          a: '`__proto__` (or `Object.getPrototypeOf`) is the actual prototype link of any object. `prototype` is a property on functions; it becomes the prototype of objects created with `new`.',
        },
        {
          q: 'How does instanceof work?',
          a: '`a instanceof B` checks if `B.prototype` appears anywhere in `a`\'s prototype chain.',
        },
        {
          q: 'Why put methods on the prototype instead of inside the constructor?',
          a: 'Prototype methods are shared by all instances (one copy in memory). Methods created inside the constructor are duplicated for every instance.',
        },
        {
          q: 'What does Object.create(null) do?',
          a: 'Creates an object with no prototype at all — no `toString`, no `hasOwnProperty`. Useful as a pure dictionary.',
        },
      ],
      spoken: `"Every JavaScript object has an internal link to another object, its prototype. When I access a property that the object doesn't have, the engine walks up this prototype chain until it finds it or reaches null. That's how arrays get map and filter from Array.prototype. Functions have a prototype property, and when I call new, the new object's prototype is set to that. Methods on the prototype are shared across instances, which saves memory. ES6 classes are mostly syntax over this same mechanism."`,
      mistakes: [
        'Mixing up `__proto__` (an object\'s link) and `.prototype` (a function\'s property used by `new`).',
        'Adding methods to built-in prototypes (`Array.prototype.myThing`) in app code — it can clash with future features and other libraries.',
        'Thinking writing `dog.eats = false` changes `animal`. It creates an own property on `dog` that shadows the prototype.',
        'Follow-up trap: "Do arrow functions have a prototype?" No — that is why they cannot be used with `new`.',
      ],
      takeaway: 'Objects inherit by linking to other objects; lookups walk the prototype chain until null.',
    },
    {
      id: 'classes',
      title: 'Classes (ES6) and Private Fields',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'class is cleaner syntax over prototypes, with constructor, extends/super, static members, getters/setters and #private fields.',
      what: `A **class** is a blueprint for creating objects.

- \`constructor()\` runs when you call \`new\`; it sets up instance data.
- **Methods** written in the class body are shared (they go on the prototype).
- \`extends\` creates a child class; \`super()\` calls the parent's constructor.
- \`static\` members belong to the class itself, not to instances.
- \`#field\` makes a truly **private** field (ES2022).

#### Deeper version
Classes are mostly **syntactic sugar** over constructor functions and prototypes, but with real differences:
- Class bodies are always in **strict mode**.
- Classes are hoisted but stay in the **TDZ**, so you cannot use them before their line.
- You **must** call a class with \`new\`.
- In a child constructor, you must call \`super()\` **before** using \`this\`.
- Class methods are **non-enumerable**.

**Class fields** (\`count = 0;\` or \`handle = () => {}\`) are created per instance. An arrow-function field captures the instance as \`this\`, which is why it was popular for React event handlers, but each instance gets its own copy of the function.

\`#private\` fields are enforced by the language: \`obj.#secret\` outside the class is a **syntax error**. Use \`#x in obj\` to check if an object has that private field.`,
      why: `Classes give a clear, familiar way to model things like services, errors, and data models. You see them in Node (custom errors, SDK clients like Stripe), TypeScript codebases and older React class components.`,
      analogy: `A class is like a cookie cutter: one shape, many cookies. \`extends\` is a new cutter based on the old one with extra details. A \`#private\` field is the secret recipe written inside the cutter — the cookies use it, but nobody outside can read it.`,
      code: [
        {
          title: 'Inheritance, static, getter, private field',
          lang: 'javascript',
          code: `class Account {
  static bankName = 'JS Bank'; // on the class itself
  #balance = 0;                 // truly private

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    if (amount <= 0) throw new RangeError('Amount must be positive');
    this.#balance += amount;
    return this;                // allows chaining
  }

  get balance() { return this.#balance; } // read-only from outside
}

class SavingsAccount extends Account {
  constructor(owner, rate) {
    super(owner);               // must come before using this
    this.rate = rate;
  }
  addInterest() {
    return this.deposit(this.balance * this.rate);
  }
}

const acc = new SavingsAccount('Asha', 0.1);
acc.deposit(1000).addInterest();
console.log(acc.balance);          // 1100
console.log(Account.bankName);     // "JS Bank"
console.log(acc instanceof Account); // true
// acc.#balance                    // SyntaxError: private field`,
        },
      ],
      output: `\`SavingsAccount\` inherits \`deposit\` and the \`balance\` getter from \`Account\`. After depositing 1000 and adding 10% interest, the balance is 1100. \`bankName\` is read from the class, not the instance. \`acc instanceof Account\` is true because \`Account.prototype\` is in the chain. Trying to read \`#balance\` from outside would not even compile.`,
      questions: [
        {
          q: 'Are JavaScript classes real classes like in Java?',
          a: 'Not exactly. They are mostly syntax over prototypes. Methods still live on the prototype and inheritance still uses the prototype chain.',
        },
        {
          q: 'Why must you call super() before this in a child constructor?',
          a: 'In derived classes, the parent constructor creates the object. Until `super()` runs, `this` does not exist, so using it throws a `ReferenceError`.',
        },
        {
          q: 'How do you make private properties?',
          a: 'Use `#field` syntax. Older ways were naming conventions (`_field`), closures, or WeakMaps.',
        },
        {
          q: 'What is a static method?',
          a: 'A method on the class itself, not on instances — like `Array.isArray` or `Date.now`. Good for factories and utilities.',
        },
      ],
      spoken: `"ES6 classes are a cleaner syntax over JavaScript's prototype system. The constructor sets up instance data, methods go on the prototype and are shared, extends sets up inheritance, and super calls the parent constructor — which must happen before I touch this. Static members belong to the class itself. Modern JavaScript also has real private fields with the hash prefix, which can't be accessed from outside at all. Classes are strict mode and stay in the TDZ until defined. I use them for things like custom errors and service clients."`,
      mistakes: [
        'Forgetting `super()` in a child constructor, or using `this` before it.',
        'Passing a class method as a callback and losing `this` — bind it or use an arrow field.',
        'Thinking `_name` is private. It is just a naming convention; `#name` is truly private.',
        'Follow-up trap: "Method vs arrow class field — what is the memory difference?" Methods are one shared function on the prototype; arrow fields create a new function for every instance.',
      ],
      takeaway: 'Classes are friendly syntax over prototypes — with real privacy through #fields.',
    },
    {
      id: 'modules',
      title: 'Modules: ES Modules vs CommonJS',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'ES modules use import/export and are static and async-friendly; CommonJS uses require/module.exports and loads synchronously.',
      what: `A **module** is a file with its own scope that shares only what it **exports**.

Two systems exist:
- **ES Modules (ESM)**: the standard. \`export\` / \`import\`. Used in browsers, React, Next.js, and modern Node.
- **CommonJS (CJS)**: Node's original system. \`module.exports\` / \`require()\`.

Exports can be **named** (\`export const add\`, imported with \`{ add }\`) or **default** (\`export default fn\`, imported with any name).

#### Deeper version
Key differences:
- **Static vs dynamic**: ESM imports are analysed **before** the code runs, which allows **tree-shaking** (bundlers remove unused exports). \`require\` is a normal function call that can run anywhere, even in an \`if\`.
- **Live bindings**: ESM imports are live, read-only views of the exported variable; CJS gives you a **copy** of whatever \`module.exports\` was at that moment.
- **Loading**: \`require\` is synchronous. ESM supports **top-level await** and async loading.
- **Strict mode**: ESM is always strict. Top-level \`this\` is \`undefined\` in ESM.
- **Globals**: \`__dirname\`/\`__filename\` exist in CJS; in ESM use \`import.meta.url\` (newer Node versions also offer \`import.meta.dirname\` — check your version).
- In Node, a file is ESM if it ends in \`.mjs\` or the nearest \`package.json\` has \`"type": "module"\`.

**Dynamic import** \`import('./x.js')\` returns a promise and works in both systems; it is how code splitting and \`React.lazy\` work. Interop between ESM and CJS has edge cases and has improved across Node versions — check the docs for your Node version.`,
      why: `Modules keep code organised, avoid global variable clashes, and enable bundlers to ship less code. In MERN work you hit this daily: "Cannot use import statement outside a module", mixing \`require\` and \`import\`, or setting up \`type: module\` in Node.`,
      analogy: `A module is like a shop with a display window. Inside, there is a lot of stuff (private code). The window shows only what the owner chooses to sell (exports). ESM is a catalogue you can read before you visit (static); CommonJS is asking the shopkeeper on the spot (dynamic).`,
      code: [
        {
          title: 'ES Modules',
          lang: 'javascript',
          code: `// math.js
export const add = (a, b) => a + b;     // named export
export const PI = 3.14;
export default function square(n) {    // default export (one per file)
  return n * n;
}

// app.js
import square, { add, PI as pi } from './math.js';
console.log(add(2, 3), square(4), pi); // 5 16 3.14

// Lazy load only when needed (code splitting)
const { format } = await import('./heavy-formatter.js'); // top-level await in ESM`,
        },
        {
          title: 'CommonJS',
          lang: 'javascript',
          code: `// math.cjs
const add = (a, b) => a + b;
module.exports = { add };

// app.cjs
const { add } = require('./math.cjs');
console.log(add(2, 3)); // 5

// require can be conditional (it is just a function call)
if (process.env.NODE_ENV !== 'production') {
  const debug = require('./debug-tools.cjs');
  debug.enable();
}`,
        },
      ],
      output: `In the ESM example, \`app.js\` imports the default export under the name \`square\`, two named exports, and renames \`PI\` to \`pi\`. It prints \`5 16 3.14\`. The dynamic import loads \`heavy-formatter.js\` only when that line runs.

In the CJS example, \`require\` returns the \`module.exports\` object, and we destructure \`add\` from it. Because \`require\` is a normal function, it can be used inside an \`if\`.`,
      questions: [
        {
          q: 'Difference between ES modules and CommonJS?',
          a: 'ESM uses `import`/`export`, is static (enables tree-shaking), supports top-level await and live bindings, and is always strict. CJS uses `require`/`module.exports`, is synchronous and dynamic, and is Node\'s older default.',
        },
        {
          q: 'Named vs default export?',
          a: 'Named exports are imported by exact name in braces and you can have many. A default export is one per file and can be imported with any name. Many teams prefer named exports for better refactoring and auto-imports.',
        },
        {
          q: 'What is tree-shaking?',
          a: 'A bundler step that removes exports nobody imports. It works because ESM imports are static and can be analysed before running.',
        },
        {
          q: 'What is dynamic import?',
          a: '`import(\'./file.js\')` loads a module at runtime and returns a promise. It is used for code splitting and lazy loading (e.g. `React.lazy`).',
        },
      ],
      spoken: `"Modules give each file its own scope, sharing only what's exported. ES modules use import and export; they're static, so bundlers can tree-shake unused code, they support top-level await, imports are live bindings, and they're always in strict mode. CommonJS uses require and module.exports; it's synchronous and dynamic, so require can be inside an if, and it's what older Node code uses. In Node, I switch to ESM with type module in package.json or the mjs extension. For lazy loading I use dynamic import, which returns a promise."`,
      mistakes: [
        'Mixing `require` and `import` in the same Node file without understanding the package type — leads to "Cannot use import statement outside a module" or "require is not defined".',
        'Forgetting file extensions in Node ESM imports (`./math` vs `./math.js`) — Node ESM requires the extension; bundlers often do not.',
        'Using `__dirname` in an ES module — it is not defined there.',
        'Follow-up trap: "What happens with circular imports?" Both systems allow them, but you may read a value before it is initialised: `undefined` in CJS, a TDZ `ReferenceError` in ESM. Restructure to avoid cycles.',
      ],
      takeaway: 'ESM (import/export) is the static, tree-shakable standard; CommonJS (require) is Node\'s older dynamic system.',
    },
    {
      id: 'promises',
      title: 'Promises',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A Promise is an object for a future value: pending, then fulfilled or rejected. Chain with then/catch/finally.',
      what: `A **Promise** is an object that represents a value you will get **later** — like the result of an API call.

It has three states:
- **pending**: still waiting.
- **fulfilled**: finished with a value (\`resolve\` was called).
- **rejected**: failed with a reason (\`reject\` was called).

Once fulfilled or rejected, it is **settled** and never changes again.

You react to it with \`.then(onSuccess)\`, \`.catch(onError)\` and \`.finally(onDone)\`.

#### Deeper version
- \`.then()\` **always returns a new promise**. If your callback returns a value, the next \`.then\` receives it. If it returns a promise, the chain **waits** for it. If it throws, the chain jumps to the next \`.catch\`.
- A \`.catch\` in the middle **recovers**: after it, the chain continues as fulfilled with whatever \`catch\` returned.
- \`then\`/\`catch\` callbacks always run **asynchronously** as **microtasks**, even if the promise is already resolved.
- The executor function passed to \`new Promise\` runs **synchronously**, immediately.
- A rejection with no handler causes an "unhandled rejection" warning, and in recent Node versions it crashes the process by default.

Promises replaced **callback hell** (deeply nested callbacks) with flat chains and one place to handle errors.`,
      why: `Every network call, file read, database query and timer in modern JavaScript is promise-based (\`fetch\`, Mongoose, \`fs/promises\`, Stripe SDK). \`async/await\` is built on top of promises, so you must understand them to debug async code.`,
      analogy: `A promise is like a restaurant buzzer. You order (start the async task) and get a buzzer (the promise) immediately. While it is pending, you can do other things. Later it either buzzes "food ready" (fulfilled with your meal) or "sorry, sold out" (rejected with a reason). It only buzzes once.`,
      code: [
        {
          title: 'Creating and using a promise',
          lang: 'javascript',
          code: `function getUser(id) {
  return new Promise((resolve, reject) => {
    console.log('executor runs immediately');
    setTimeout(() => {
      if (id > 0) resolve({ id, name: 'Asha' });
      else reject(new Error('Invalid id'));
    }, 100);
  });
}

getUser(1)
  .then((user) => user.name)                 // return a value -> next then gets it
  .then((name) => console.log('Name:', name))
  .catch((err) => console.log('Error:', err.message))
  .finally(() => console.log('done'));

getUser(-1).catch((err) => console.log('Error:', err.message)); // "Error: Invalid id"`,
        },
        {
          title: 'Chaining and recovery',
          lang: 'javascript',
          code: `Promise.resolve(1)
  .then((n) => n * 2)                            // 2
  .then((n) => { throw new Error('boom at ' + n); })
  .then(() => console.log('skipped'))             // skipped because of the throw
  .catch((err) => { console.log(err.message); return 0; }) // "boom at 2", recover with 0
  .then((n) => console.log('after catch:', n));   // "after catch: 0"`,
        },
      ],
      output: `In the first block, "executor runs immediately" is printed at once (twice, once per call). After 100ms, the first promise resolves; the chain prints "Name: Asha" then "done". The second rejects and prints "Error: Invalid id".

In the second block, the error skips the next \`.then\`, lands in \`.catch\`, which prints "boom at 2" and returns 0. The chain continues and prints "after catch: 0".`,
      questions: [
        {
          q: 'What is a Promise?',
          a: 'An object representing the eventual result of an async operation. It is pending, then either fulfilled with a value or rejected with a reason, and it settles only once.',
        },
        {
          q: 'What does .then() return?',
          a: 'A new promise, which resolves with whatever the callback returns (or follows it if it is a promise), or rejects if the callback throws.',
        },
        {
          q: 'Does the Promise executor run synchronously?',
          a: 'Yes. The function passed to `new Promise` runs immediately. Only the `then`/`catch` callbacks are asynchronous (microtasks).',
        },
        {
          q: 'What is callback hell and how do promises fix it?',
          a: 'Deeply nested callbacks where each async step is inside the previous one. Promises flatten it into a chain with a single `.catch` for errors.',
        },
        {
          q: 'What is the difference between .then(success, failure) and .then(success).catch(failure)?',
          a: 'With two arguments, the failure handler does not catch errors thrown inside the success handler. A separate `.catch` at the end catches errors from the whole chain.',
        },
      ],
      spoken: `"A promise is an object that represents a future value. It starts pending and settles once, either fulfilled with a value or rejected with an error. I consume it with then, catch and finally. Every then returns a new promise, so I can chain steps: returning a value passes it on, returning a promise waits for it, and throwing jumps to the next catch. The executor runs synchronously, but then callbacks always run asynchronously as microtasks. In practice I mostly use async-await, which is built on promises, but I still use Promise.all for parallel work."`,
      mistakes: [
        'Forgetting to `return` inside a `.then` — the next step receives `undefined` and runs before the inner async work finishes.',
        'Nesting `.then` inside `.then` (recreating callback hell) instead of returning and chaining.',
        'Not adding a `.catch` — leads to unhandled rejections.',
        'Wrapping an existing promise in `new Promise` unnecessarily (the "explicit construction anti-pattern").',
        'Follow-up trap: "Can you cancel a promise?" No. A promise cannot be cancelled; you cancel the underlying work instead, e.g. with `AbortController` for `fetch`.',
      ],
      takeaway: 'A promise is a one-time future value; every then returns a new promise, and errors flow down to catch.',
    },
    {
      id: 'async-await',
      title: 'async / await',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Syntax on top of promises: async functions always return a promise, and await pauses the function (not the thread) until a promise settles.',
      what: `\`async\` and \`await\` let you write promise code that **looks synchronous**.

- An \`async\` function **always returns a promise**. Returning \`5\` really returns \`Promise.resolve(5)\`. Throwing really returns a rejected promise.
- \`await promise\` **pauses that function** until the promise settles, then gives you the value (or throws the error).
- Use \`try/catch\` around \`await\` to handle errors.

#### Deeper version
\`await\` pauses only the **current async function**, not the whole program. The rest of the function is scheduled as a **microtask** when the promise settles; meanwhile, the event loop keeps running other code.

**Sequential vs parallel**: \`await a(); await b();\` runs one after another. If \`a\` and \`b\` do not depend on each other, start both first and then await them: \`await Promise.all([a(), b()])\`. This is a very common performance fix.

Other notes:
- \`await\` on a non-promise value just wraps it (\`await 5\` gives 5, but still yields to the microtask queue).
- **Top-level await** works in ES modules.
- \`forEach\` does **not** wait for async callbacks. Use \`for...of\` (sequential) or \`Promise.all\` + \`map\` (parallel).
- \`return await\` matters inside \`try/catch\`: without \`await\`, a rejection is not caught by that \`try\`.`,
      why: `It makes async code readable — no long \`.then\` chains — and lets you use normal \`try/catch\`, \`if\` and loops. It is the standard style in Node/Express handlers, React data fetching and SDK calls.`,
      analogy: `Imagine a chef (the function) waiting for water to boil. With \`await\`, the chef steps aside and lets other chefs use the kitchen (the event loop keeps running). When the water boils, the chef comes back and continues from the same step. The kitchen never freezes.`,
      code: [
        {
          title: 'Basic usage with error handling',
          lang: 'javascript',
          code: `const wait = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));

async function loadDashboard(userId) {
  try {
    const user = await wait(100, { id: userId, name: 'Asha' });
    const orders = await wait(100, [{ id: 1, total: 500 }]);
    return { user, orders };      // resolves the returned promise
  } catch (err) {
    console.error('Failed:', err.message);
    throw err;                    // let the caller decide too
  }
}

loadDashboard(7).then((d) => console.log(d.user.name, d.orders.length)); // "Asha 1"
console.log('this prints first'); // await does not block the thread`,
        },
        {
          title: 'Sequential vs parallel',
          lang: 'javascript',
          code: `const wait = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));

async function sequential() {
  console.time('sequential');
  const a = await wait(300, 'a'); // 300ms
  const b = await wait(300, 'b'); // +300ms
  console.timeEnd('sequential');  // ~600ms
  return [a, b];
}

async function parallel() {
  console.time('parallel');
  const [a, b] = await Promise.all([wait(300, 'a'), wait(300, 'b')]); // both at once
  console.timeEnd('parallel');    // ~300ms
  return [a, b];
}

sequential().then(parallel);`,
        },
      ],
      output: `In the first block, "this prints first" appears before "Asha 1", because \`loadDashboard\` pauses at \`await\` while the rest of the program continues. After about 200ms the function returns, and \`.then\` prints "Asha 1".

In the second block, \`sequential\` takes about 600ms because the second wait only starts after the first finishes. \`parallel\` takes about 300ms because both timers start at the same time.`,
      questions: [
        {
          q: 'What does an async function return?',
          a: 'Always a promise. A returned value becomes the fulfilled value; a thrown error becomes the rejection reason.',
        },
        {
          q: 'Does await block the main thread?',
          a: 'No. It pauses only the current async function. The rest of it continues as a microtask when the promise settles, while other code keeps running.',
        },
        {
          q: 'How do you run two independent awaits in parallel?',
          a: 'Start both promises first, then await them together: `const [a, b] = await Promise.all([getA(), getB()])`.',
        },
        {
          q: 'How do you handle errors with async/await?',
          a: 'Use `try/catch` around the awaits, or call `.catch()` on the promise the async function returns.',
        },
        {
          q: 'Why does await inside forEach not work as expected?',
          a: '`forEach` ignores the promises returned by the async callback, so it does not wait. Use `for...of` for sequential work or `Promise.all(arr.map(...))` for parallel.',
        },
      ],
      spoken: `"async-await is syntax on top of promises. An async function always returns a promise, and await pauses that function until the promise settles, giving me the value or throwing the error, so I can use normal try-catch. It doesn't block the thread; the rest of the function resumes as a microtask. One thing I watch for is accidental sequential awaits: if two calls don't depend on each other, I start them together with Promise.all, which can halve response time in an API handler. And I never use await inside forEach."`,
      mistakes: [
        'Awaiting independent requests one by one — slow. Use `Promise.all`.',
        'Using `await` inside `forEach` and expecting it to wait.',
        'Forgetting `await`, so you get a pending Promise object instead of data (e.g. `if (user.isAdmin)` on a promise).',
        'No `try/catch` (or `.catch`) — unhandled rejections can crash a Node process.',
        'Follow-up trap: "What is the difference between `return promise` and `return await promise` inside try/catch?" Only `return await` lets the local `catch` handle a rejection.',
      ],
      takeaway: 'async returns a promise, await pauses only that function — and use Promise.all for independent work.',
    },
    {
      id: 'promise-combinators',
      title: 'Promise.all, allSettled, race and any',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'all = every one must succeed; allSettled = wait for all, never rejects; race = first to settle; any = first to succeed.',
      what: `Four helpers run many promises **at the same time** and combine the results:

- \`Promise.all([...])\`: waits for **all** to succeed and gives an array of values (same order as input). If **any one fails**, it rejects immediately with that error.
- \`Promise.allSettled([...])\`: waits for **all** to finish, success or failure. **Never rejects.** Gives \`{ status, value }\` or \`{ status, reason }\` for each.
- \`Promise.race([...])\`: settles with the **first** promise to finish — success **or** failure.
- \`Promise.any([...])\`: resolves with the **first success**. Rejects only if **all** fail, with an \`AggregateError\`.

#### Deeper version
- \`all\` "fails fast", but the other promises **keep running** — promises cannot be cancelled. Their results are just ignored.
- Results are always in **input order**, not finish order.
- An empty array: \`all\` and \`allSettled\` resolve to \`[]\`, \`any\` rejects with \`AggregateError\`, and \`race\` stays **pending forever**.
- Non-promise values in the array are treated as already-resolved promises.
- Remember the promises start running when you **create** them, not when you pass them to \`all\`. \`all\` only waits.
- To limit how many run at once (for example, 5 API calls at a time), you need a small concurrency helper or a library such as \`p-limit\`; \`Promise.all\` alone starts everything.`,
      why: `Real apps often load several independent things — user, settings, notifications — and running them in parallel is much faster. Choosing the right helper decides whether one failure breaks the whole page (\`all\`) or just one widget (\`allSettled\`). \`race\` is the classic way to add a timeout.`,
      analogy: `You send four friends to buy ingredients.
- \`all\`: you cook only if all four come back; if one calls saying "shop closed", you cancel dinner right away.
- \`allSettled\`: you wait for everyone, then see who got what.
- \`race\`: you act on whoever calls first, good news or bad.
- \`any\`: you need just one friend to find the item; you only give up if all four fail.`,
      code: [
        {
          title: 'all vs allSettled',
          lang: 'javascript',
          code: `const ok = (v, ms) => new Promise((r) => setTimeout(() => r(v), ms));
const fail = (msg, ms) => new Promise((_, j) => setTimeout(() => j(new Error(msg)), ms));

Promise.all([ok('user', 100), ok('posts', 200)])
  .then((values) => console.log('all:', values)); // all: ['user', 'posts']

Promise.all([ok('user', 100), fail('posts down', 50)])
  .catch((err) => console.log('all failed:', err.message)); // all failed: posts down

Promise.allSettled([ok('user', 100), fail('posts down', 50)])
  .then((results) => console.log(results));
// [ { status: 'fulfilled', value: 'user' },
//   { status: 'rejected', reason: Error: posts down } ]`,
        },
        {
          title: 'race for timeouts, any for fallbacks',
          lang: 'javascript',
          code: `const ok = (v, ms) => new Promise((r) => setTimeout(() => r(v), ms));
const fail = (msg, ms) => new Promise((_, j) => setTimeout(() => j(new Error(msg)), ms));

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}
withTimeout(ok('slow data', 500), 200)
  .catch((e) => console.log('race:', e.message)); // race: Timed out

// First mirror that succeeds wins
Promise.any([fail('mirror A down', 50), ok('mirror B', 100), ok('mirror C', 300)])
  .then((v) => console.log('any:', v)); // any: mirror B

Promise.any([fail('A', 10), fail('B', 20)])
  .catch((e) => console.log(e.constructor.name, e.errors.length)); // AggregateError 2`,
        },
      ],
      output: `In the first block, \`all\` gives both values in input order. When one promise fails, \`all\` rejects right away with "posts down". \`allSettled\` waits for both and reports each outcome.

In the second block, the timeout (200ms) beats the slow data (500ms), so \`race\` rejects with "Timed out". \`any\` ignores mirror A's failure and resolves with "mirror B", the first success. When every promise fails, \`any\` rejects with an \`AggregateError\` holding both errors.`,
      questions: [
        {
          q: 'Difference between Promise.all and Promise.allSettled?',
          a: '`all` rejects as soon as one promise rejects. `allSettled` always waits for every promise and returns the status and value/reason of each — it never rejects.',
        },
        {
          q: 'Difference between race and any?',
          a: '`race` settles with the first promise to settle, even if it is a rejection. `any` waits for the first fulfilment and only rejects (with AggregateError) if all reject.',
        },
        {
          q: 'If Promise.all rejects, do the other promises stop?',
          a: 'No. They keep running; their results are ignored. To stop work you need cancellation, like `AbortController` for `fetch`.',
        },
        {
          q: 'How do you add a timeout to a fetch?',
          a: '`Promise.race` with a timer promise, or better, `AbortSignal.timeout(ms)` / an `AbortController`, which also cancels the request.',
        },
      ],
      spoken: `"All four run promises concurrently and combine them. Promise.all resolves with all values in order, but rejects as soon as one fails, so I use it when everything is required. allSettled waits for all and never rejects, giving each status — great for dashboards where one widget failing shouldn't break the page. race settles with whichever promise finishes first, success or failure, which is the classic timeout pattern. any resolves with the first success and only rejects with an AggregateError if they all fail, which is good for fallbacks like multiple mirrors."`,
      mistakes: [
        'Thinking `Promise.all` runs things in parallel by itself. The work starts when you create the promises; `all` only waits.',
        'Using `all` where partial results are fine — one failure throws away all the good data. Use `allSettled`.',
        'Firing thousands of requests with `Promise.all(bigList.map(fetch))` — can overload APIs or hit rate limits. Batch or limit concurrency.',
        'Follow-up trap: "What does `Promise.race([])` return?" A promise that stays pending forever.',
      ],
      takeaway: 'all = all must pass, allSettled = report everything, race = first to finish, any = first to succeed.',
    },
    {
      id: 'timers-raf',
      title: 'Timers: setTimeout, setInterval and requestAnimationFrame',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'setTimeout runs once after at least X ms, setInterval repeats, requestAnimationFrame runs right before the next screen paint.',
      what: `Three ways to schedule code for later:

- \`setTimeout(fn, ms)\`: run \`fn\` **once**, after **at least** \`ms\` milliseconds. Returns an id; cancel with \`clearTimeout(id)\`.
- \`setInterval(fn, ms)\`: run \`fn\` **again and again** every \`ms\`. Cancel with \`clearInterval(id)\`.
- \`requestAnimationFrame(fn)\` (rAF, browser only): run \`fn\` **right before the browser paints the next frame** — usually about 60 times a second. Cancel with \`cancelAnimationFrame(id)\`.

#### Deeper version
- The delay is a **minimum**, not a promise. The callback is a macrotask, so it waits for the call stack and all microtasks. Browsers clamp nested timers (after several levels) to about 4ms, and **background tabs** throttle timers heavily (often to once per second or less).
- \`setInterval\` does not wait for your callback to finish. If the work is slow or async, calls can pile up or overlap. A **recursive setTimeout** (schedule the next run at the end of the current one) guarantees a gap between runs — better for polling APIs.
- **rAF** is synced with the display refresh rate, pauses in background tabs (saving battery), and gives a high-precision timestamp. Use it for animations and for reading/writing layout once per frame; use CSS transitions when possible.
- In Node, timers return \`Timeout\` objects (not numbers), and there are \`setImmediate\` and \`timers/promises\` (\`await setTimeout(100)\` from \`node:timers/promises\`).`,
      why: `Timers are used for polling, delays, retries with backoff, debounce/throttle and animations. Using the wrong one causes janky animations, overlapping API calls, or leaks when intervals are never cleared.`,
      analogy: `\`setTimeout\` is an alarm that rings once. \`setInterval\` is an alarm that rings every 10 minutes even if you are still busy from the last one. \`requestAnimationFrame\` is a film director saying "action" exactly when the next frame of film is ready.`,
      code: [
        {
          title: 'Polling safely with recursive setTimeout',
          lang: 'javascript',
          code: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let attempts = 0;

// Fake job status API
async function checkJob() {
  attempts++;
  await wait(50);
  return attempts >= 3 ? 'done' : 'pending';
}

function pollJob(intervalMs) {
  let timerId;
  let stopped = false;

  async function tick() {
    const status = await checkJob();       // next call only after this finishes
    console.log('status:', status);
    if (status === 'done' || stopped) return;
    timerId = setTimeout(tick, intervalMs); // schedule the next run
  }

  tick();
  return () => { stopped = true; clearTimeout(timerId); }; // cleanup function
}

const stop = pollJob(200); // "status: pending", "status: pending", "status: done"`,
        },
        {
          title: 'Smooth animation with requestAnimationFrame',
          lang: 'html',
          code: `<div id="box" style="width:40px;height:40px;background:tomato;position:relative"></div>
<script>
  const box = document.getElementById('box');
  const duration = 1000; // ms
  let start;

  function step(timestamp) {
    start ??= timestamp;
    const progress = Math.min((timestamp - start) / duration, 1); // 0 -> 1
    box.style.transform = \`translateX(\${progress * 300}px)\`;
    if (progress < 1) requestAnimationFrame(step); // ask for the next frame
  }
  requestAnimationFrame(step);
</script>`,
        },
      ],
      output: `In the first block, each status check finishes before the next one is scheduled, so calls never overlap. It prints "pending" twice and then "done", and stops. The returned \`stop\` function can cancel polling early (for example in a \`useEffect\` cleanup).

In the second block, the box slides 300px in one second. Because movement is based on the elapsed time, it looks smooth on 60Hz and 120Hz screens, and it pauses automatically when the tab is hidden.`,
      questions: [
        {
          q: 'Is setTimeout(fn, 1000) guaranteed to run after exactly 1 second?',
          a: 'No. It runs after at least 1 second, when the call stack and microtask queue are free. Busy threads, clamping and background-tab throttling can delay it.',
        },
        {
          q: 'setInterval vs recursive setTimeout?',
          a: '`setInterval` fires on a fixed schedule, even if the previous run is still busy, so async work can overlap. Recursive `setTimeout` schedules the next run after the current one finishes, giving a reliable gap.',
        },
        {
          q: 'Why use requestAnimationFrame for animations?',
          a: 'It runs right before each paint, matches the screen refresh rate, avoids wasted frames, and pauses in background tabs. Timers can drift and cause jank.',
        },
        {
          q: 'How do you stop a timer in React?',
          a: 'Save the id and call `clearTimeout`/`clearInterval` in the `useEffect` cleanup.',
        },
      ],
      spoken: `"setTimeout runs a callback once after at least the given delay, and setInterval repeats it. The delay is a minimum, because the callback is a macrotask that waits for the stack and microtasks, and background tabs throttle timers. For polling I prefer a recursive setTimeout over setInterval, so a slow request never overlaps the next one. For animations I use requestAnimationFrame, which runs just before the browser paints, matches the refresh rate and pauses in hidden tabs. And I always clear timers in cleanup to avoid leaks."`,
      mistakes: [
        'Polling an API with `setInterval` — slow responses stack up and overlap.',
        'Forgetting `clearInterval` on unmount, causing leaks and updates on unmounted components.',
        'Animating with `setInterval(fn, 16)` instead of `requestAnimationFrame` — causes jank and wastes battery.',
        'Follow-up trap: "What does setTimeout return?" A numeric id in browsers, but a `Timeout` object in Node. Both are passed to `clearTimeout`.',
      ],
      takeaway: 'setTimeout delays are minimums; poll with recursive setTimeout, animate with requestAnimationFrame, and always clear timers.',
    },
    {
      id: 'event-loop',
      title: 'The Event Loop',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'JavaScript runs one thing at a time; the event loop moves finished async callbacks from queues onto the empty call stack.',
      what: `JavaScript has **one main thread**: it can only run one piece of code at a time. Yet it handles timers, clicks and network calls without freezing. The **event loop** makes this possible.

The parts:
- **Call stack**: where your code runs right now.
- **Web APIs / Node APIs**: the browser or Node handles slow work (timers, network, file I/O) **outside** the JavaScript thread.
- **Queues**: when that slow work finishes, its callback waits in a queue.
- **Event loop**: a loop that keeps checking: "Is the call stack empty? Then take the next callback from a queue and run it."

#### Deeper version
There are two important kinds of queues:
- **Microtask queue**: promise callbacks (\`then\`, \`catch\`, \`finally\`, code after \`await\`), \`queueMicrotask\`, \`MutationObserver\`.
- **Macrotask (task) queue**: \`setTimeout\`, \`setInterval\`, I/O, UI events, \`MessageChannel\`.

One loop "tick" in the browser, simplified:
1. Run one macrotask (the first one is the main script itself).
2. Run **all** microtasks until the queue is empty (including new ones added meanwhile).
3. Render if needed (style, layout, paint; \`requestAnimationFrame\` callbacks run before paint).
4. Repeat.

So microtasks always run before the next timer. **Node.js** has a similar loop but with named phases (timers, poll, check for \`setImmediate\`, close callbacks), and \`process.nextTick\` runs even before promise microtasks.

Because everything shares one thread, a long synchronous task (a big loop, heavy JSON parsing) **blocks** everything: no clicks, no rendering, no other requests in Node.`,
      why: `The event loop explains output-order puzzles, why \`setTimeout(fn, 0)\` is not instant, why heavy code freezes the UI, and why one slow synchronous function can stall a whole Node server. It is one of the most-asked JavaScript interview topics.`,
      analogy: `Imagine a single chef (the main thread) in a restaurant. The chef cooks one dish at a time. Ovens and delivery staff (Web APIs) do slow work in the background. When a dish is ready, a ticket goes on a board (queue). A manager (event loop) watches: whenever the chef's hands are free, the manager gives the next ticket. VIP tickets (microtasks) are always handled before regular tickets (macrotasks).`,
      code: [
        {
          title: 'Classic ordering example',
          lang: 'javascript',
          code: `console.log('1: script start');

setTimeout(() => console.log('5: timeout (macrotask)'), 0);

Promise.resolve()
  .then(() => console.log('3: promise 1 (microtask)'))
  .then(() => console.log('4: promise 2 (microtask)'));

console.log('2: script end');`,
        },
        {
          title: 'Blocking the loop',
          lang: 'javascript',
          code: `setTimeout(() => console.log('timer fired'), 0);

const start = Date.now();
while (Date.now() - start < 2000) {
  // busy loop: blocks the thread for 2 seconds
}
console.log('loop finished');
// "loop finished" after 2s, THEN "timer fired".
// In a browser, clicks and rendering are frozen during those 2s.`,
        },
      ],
      output: `The first block prints in this order: "1: script start", "2: script end", "3: promise 1", "4: promise 2", "5: timeout". Synchronous code runs first. Then the stack is empty, so all microtasks run (both promise callbacks). Only then does the event loop take the timer callback from the macrotask queue.

In the second block, the timer is ready almost immediately, but it cannot run until the busy loop gives back the thread, so "timer fired" appears after 2 seconds.`,
      questions: [
        {
          q: 'What is the event loop?',
          a: 'A mechanism that keeps checking if the call stack is empty and then moves the next queued callback (microtasks first, then a macrotask) onto the stack. It lets single-threaded JavaScript handle async work.',
        },
        {
          q: 'If JavaScript is single-threaded, how does async work happen?',
          a: 'The slow work (timers, network, I/O) is done by the browser or Node\'s background threads. JavaScript only runs the callbacks later, one at a time, via the event loop.',
        },
        {
          q: 'Why is setTimeout(fn, 0) not executed immediately?',
          a: 'It puts `fn` in the macrotask queue. It runs only after the current code finishes and all microtasks are done. Browsers may also clamp nested timers to about 4ms.',
        },
        {
          q: 'How does the Node.js event loop differ from the browser?',
          a: 'Node uses libuv with phases (timers, pending callbacks, poll, check, close). It has `setImmediate` (check phase) and `process.nextTick`, which runs before promise microtasks.',
        },
      ],
      spoken: `"JavaScript runs on a single thread with one call stack. When I start something slow, like a timer or a fetch, the browser or Node handles it in the background, and when it's done, its callback goes into a queue. The event loop waits until the call stack is empty, then runs all the microtasks — promise callbacks and code after await — and then takes the next macrotask, like a timer or an event. In the browser it can render between tasks. That's why promises run before setTimeout zero, and why a long synchronous loop freezes the UI or blocks a Node server."`,
      mistakes: [
        'Saying `setTimeout(fn, 1000)` runs after exactly 1 second. It runs after **at least** 1 second, when the stack and microtasks are clear.',
        'Saying JavaScript is multi-threaded because async exists. The JS code runs on one thread; the environment does background work.',
        'Doing heavy CPU work (image processing, big loops) on the main thread or in an Express handler — it blocks all users. Use Web Workers or worker threads.',
        'Follow-up trap: "Can microtasks starve the event loop?" Yes. If microtasks keep adding new microtasks, timers and rendering never get a turn.',
      ],
      takeaway: 'Stack empties → all microtasks → one macrotask → render → repeat. Never block the one thread.',
    },
    {
      id: 'microtasks-macrotasks',
      title: 'Microtasks vs Macrotasks',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Microtasks (promises, await, queueMicrotask) drain completely before the next macrotask (setTimeout, events, I/O) runs.',
      what: `The event loop has two main waiting lines:

- **Microtasks** (high priority): \`Promise.then/catch/finally\`, the code after \`await\`, \`queueMicrotask(fn)\`, \`MutationObserver\`.
- **Macrotasks** (normal priority, also just called "tasks"): \`setTimeout\`, \`setInterval\`, \`setImmediate\` (Node), I/O callbacks, UI events like clicks, \`MessageChannel\`.

The rule: after each macrotask (and after the main script), the engine runs **every** microtask in the queue — including ones added while it is draining — before it picks the next macrotask.

#### Deeper version
**How \`await\` splits a function**: code before the first \`await\` runs **synchronously**. Everything after it is resumed as a microtask.

**Node.js extras**:
- \`process.nextTick\` callbacks run before promise microtasks (the "nextTick queue" is drained first).
- \`setImmediate\` runs in the "check" phase. In the main module, the order of \`setTimeout(fn, 0)\` vs \`setImmediate\` is **not guaranteed**; inside an I/O callback, \`setImmediate\` always runs first.

**requestAnimationFrame** (browser) is neither: it runs right before the next paint.

Practical uses: \`queueMicrotask\` to run something "right after the current code, before any rendering", and \`setTimeout(fn, 0)\` to yield to the browser so it can paint or handle input.`,
      why: `This is the base of almost every "predict the output" question. It also matters in real code: chains of promise callbacks can delay rendering, and splitting heavy work with \`setTimeout\` lets the browser stay responsive.`,
      analogy: `At a bank, macrotasks are customers in the main line. Microtasks are quick follow-up questions. After serving one customer, the teller answers **all** pending follow-up questions (even new ones that come in meanwhile) before calling the next customer from the main line.`,
      code: [
        {
          title: 'Predict the output',
          lang: 'javascript',
          code: `console.log('A');

setTimeout(() => console.log('B'), 0);

queueMicrotask(() => console.log('C'));

(async () => {
  console.log('D');          // sync part of the async function
  await null;
  console.log('E');          // microtask
  setTimeout(() => console.log('F'), 0);
})();

Promise.resolve().then(() => console.log('G'));

console.log('H');
// Output: A D H C E G B F`,
        },
        {
          title: 'Node.js: nextTick and setImmediate',
          lang: 'javascript',
          code: `// Run with node
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');

// Always: sync, nextTick, promise
// Then "timeout" and "immediate" in an order that can vary in the main module`,
        },
      ],
      output: `First block: sync code prints \`A\`, then \`D\` (the async function runs synchronously until \`await\`), then \`H\`. Now the stack is empty, so microtasks run in the order they were queued: \`C\` (queueMicrotask), \`E\` (after await), \`G\` (promise). \`E\` scheduled a new timer \`F\`. Then macrotasks run in order: \`B\`, then \`F\`. Final: **A D H C E G B F**.

Second block (Node): "sync", then "nextTick" (nextTick queue first), then "promise", then the timer and immediate, whose relative order is not guaranteed at the top level.`,
      questions: [
        {
          q: 'What are microtasks and macrotasks?',
          a: 'Microtasks are high-priority callbacks (promise reactions, `await` continuations, `queueMicrotask`). Macrotasks are timers, I/O and UI events. All microtasks run after each macrotask, before the next one.',
        },
        {
          q: 'Does a promise callback run before setTimeout(fn, 0)?',
          a: 'Yes. Promise callbacks are microtasks, and the microtask queue is fully drained before the event loop picks the next timer.',
        },
        {
          q: 'Which part of an async function runs synchronously?',
          a: 'Everything before the first `await`. The rest runs later as a microtask.',
        },
        {
          q: 'process.nextTick vs setImmediate vs Promise?',
          a: 'In Node, `nextTick` runs first (before promises), then promise microtasks, then later `setImmediate` in the check phase of the loop.',
        },
      ],
      spoken: `"The event loop has two main queues. Microtasks are promise callbacks, code after await, and queueMicrotask. Macrotasks are things like setTimeout, setInterval, I/O and UI events. After the current script or macrotask finishes, the engine drains the whole microtask queue — even new microtasks added during that time — before it runs the next macrotask. So promises always beat setTimeout zero. In an async function, code before the first await runs synchronously. In Node, process.nextTick runs even before promises, and setImmediate runs in the check phase."`,
      mistakes: [
        'Thinking code before the first `await` is asynchronous — it runs immediately.',
        'Assuming `setTimeout` and `setImmediate` have a fixed order in Node\'s main module.',
        'Creating endless microtask loops (a `then` that keeps scheduling another), which freezes rendering just like a `while(true)`.',
        'Follow-up trap: "Is a click handler a microtask?" No, a user event is a macrotask. But the promises inside it create microtasks that run right after the handler.',
      ],
      takeaway: 'Sync code → all microtasks → one macrotask → repeat: promises always beat timers.',
    },
    {
      id: 'fetch-abortcontroller',
      title: 'fetch and AbortController',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'fetch returns a promise for a Response; it only rejects on network errors, so check res.ok. AbortController cancels requests.',
      what: `\`fetch(url, options)\` makes HTTP requests and returns a **promise** of a \`Response\`.

Two steps:
1. \`await fetch(url)\` → gives a \`Response\` (status, headers).
2. \`await res.json()\` (or \`.text()\`, \`.blob()\`) → reads the body.

Important: \`fetch\` **does not reject** on HTTP errors like 404 or 500. It only rejects on **network failure** (offline, DNS, CORS block). You must check \`res.ok\` (true for status 200-299).

**AbortController** lets you **cancel** a request. You pass \`controller.signal\` to \`fetch\`, and calling \`controller.abort()\` stops it. The \`fetch\` promise then rejects with an \`AbortError\`.

#### Deeper version
- To send JSON: \`method: 'POST'\`, \`headers: { 'Content-Type': 'application/json' }\`, \`body: JSON.stringify(data)\`.
- Cookies: same-origin requests send cookies by default; for cross-origin you need \`credentials: 'include'\` (and the server must allow it with CORS headers).
- The body can be read **only once**. Use \`res.clone()\` if you need it twice.
- \`AbortSignal.timeout(ms)\` creates a signal that aborts automatically after a time (it rejects with a \`TimeoutError\`). \`AbortSignal.any([...])\` combines signals. Both are newer — check browser/Node support.
- Node 18+ has \`fetch\` built in.
- The same \`signal\` pattern works for \`addEventListener\` (\`{ signal }\`) to remove listeners, and many libraries (axios, Mongoose operations in some versions) accept it — check their docs.`,
      why: `In React, when a user types fast in a search box or leaves a page, old requests keep running and may update state with stale data ("race conditions"). Aborting them in a \`useEffect\` cleanup fixes this and saves bandwidth. And forgetting the \`res.ok\` check is a classic production bug.`,
      analogy: `\`fetch\` is like ordering food by phone. Getting a reply from the restaurant (a Response) does not mean you got food — they might say "we are closed" (404/500). You must check the reply. AbortController is your "cancel my order" button.`,
      code: [
        {
          title: 'A safe fetch helper',
          lang: 'javascript',
          code: `async function api(url, { method = 'GET', body, signal } = {}) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {                          // 404, 500 etc. do NOT reject on their own
    const text = await res.text();
    throw new Error(\`HTTP \${res.status}: \${text}\`);
  }
  return res.status === 204 ? null : res.json();
}

// Timeout after 5 seconds (newer API; check support)
api('https://jsonplaceholder.typicode.com/todos/1', { signal: AbortSignal.timeout(5000) })
  .then((data) => console.log(data.title))
  .catch((err) => console.log(err.name, err.message));`,
        },
        {
          title: 'Cancel stale requests in React',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, { signal: controller.signal })
      .then((res) => res.json())
      .then(setResults)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err); // ignore our own cancels
      });

    return () => controller.abort(); // runs when query changes or component unmounts
  }, [query]);

  return <ul>{results.map((r) => <li key={r.id}>{r.name}</li>)}</ul>;
}`,
        },
      ],
      output: `In the first block, the helper sends JSON, throws a clear error for non-2xx statuses, handles "204 No Content", and parses JSON otherwise. If the request takes more than 5 seconds, it is aborted and the catch prints a \`TimeoutError\`.

In the React example, every time \`query\` changes, the cleanup aborts the previous request. Only the latest search can update the state, so old slow responses never overwrite new results. The \`AbortError\` is ignored because it is expected.`,
      questions: [
        {
          q: 'Does fetch reject on a 404 or 500 response?',
          a: 'No. It resolves with a Response whose `ok` is false. It only rejects on network errors or aborts. Always check `res.ok` or `res.status`.',
        },
        {
          q: 'How do you cancel a fetch request?',
          a: 'Create an `AbortController`, pass `controller.signal` in the fetch options, and call `controller.abort()`. The fetch rejects with an `AbortError`.',
        },
        {
          q: 'How do you avoid race conditions when fetching in useEffect?',
          a: 'Abort the previous request in the effect cleanup, or use an "ignore" flag set in cleanup so stale responses do not update state. Data libraries like React Query handle this for you.',
        },
        {
          q: 'fetch vs axios?',
          a: 'fetch is built in and lower-level: manual JSON parsing and status checks. axios auto-parses JSON, rejects on non-2xx, has interceptors and upload progress, but adds a dependency.',
        },
      ],
      spoken: `"fetch returns a promise that resolves to a Response object, and I then call res.json to read the body. The common gotcha is that fetch doesn't reject on HTTP errors like 404 or 500 — only on network failures — so I always check res.ok and throw myself. For cancellation I use AbortController: I pass its signal to fetch and call abort when needed. In React I create the controller inside useEffect and abort in the cleanup, which prevents stale responses from overwriting newer data, and I ignore the AbortError in the catch."`,
      mistakes: [
        'Not checking `res.ok`, so error pages get parsed as data or `res.json()` throws a confusing error.',
        'Forgetting `JSON.stringify` and the `Content-Type` header when sending JSON.',
        'Reusing an already-aborted `AbortController` for new requests — once aborted, it stays aborted. Create a new one.',
        'Showing an error toast for `AbortError`, which is your own intentional cancel.',
        'Follow-up trap: "Does aborting stop the server from processing?" Not necessarily. It closes the connection on the client; the server may still finish the work unless it listens for the client disconnecting.',
      ],
      takeaway: 'Always check res.ok, and cancel stale requests with AbortController.',
    },
    {
      id: 'debounce-throttle',
      title: 'Debounce and Throttle',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Debounce waits until calls stop for X ms then runs once; throttle runs at most once every X ms.',
      what: `Both limit how often a function runs when an event fires many times.

- **Debounce**: "Wait until the user **stops** for X ms, then run once." Each new call **resets** the timer. Good for search-as-you-type, auto-save, window resize end.
- **Throttle**: "Run **at most once every** X ms, no matter how many calls." Good for scroll, mousemove, drag, resize while it is happening.

#### Deeper version
Both are built with **closures** (they remember the timer id or the last run time) and **higher-order functions** (they take a function and return a wrapped one).

Variants:
- **Leading** debounce: run on the first call, then ignore until quiet.
- **Trailing** (default): run after the quiet period.
- Throttle with a **trailing** call makes sure the final event is not lost.
- A \`cancel()\` method helps clean up when a component unmounts.

In React, create the debounced function **once** (with \`useMemo\`/\`useRef\` or a custom \`useDebounce\` hook). If you create it inside the component body on every render, each render gets a new timer, and debouncing breaks. Libraries like lodash provide battle-tested versions.`,
      why: `Without them, a search box can fire an API call on every keystroke (10 calls for "javascript"), and a scroll handler can run hundreds of times per second, making the page laggy and burning server/API costs (important for paid LLM or search APIs).`,
      analogy: `**Debounce** is a lift (elevator) door: every time someone new walks in, the door waits again. It only closes after nobody has entered for a few seconds. **Throttle** is a metro train that leaves every 5 minutes no matter how many people are waiting — at most one departure per 5 minutes.`,
      code: [
        {
          title: 'Debounce',
          lang: 'javascript',
          code: `function debounce(fn, delay) {
  let timerId;                         // remembered by the closure
  function debounced(...args) {
    clearTimeout(timerId);             // reset on every call
    timerId = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}

const search = debounce((q) => console.log('API call for:', q), 300);
search('j');
search('ja');
search('jav');  // only this one runs, 300ms after the last call
// "API call for: jav"`,
        },
        {
          title: 'Throttle (with a trailing call)',
          lang: 'javascript',
          code: `function throttle(fn, interval) {
  let lastRun = 0;
  let timerId = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastRun);
    if (remaining <= 0) {
      lastRun = now;
      fn.apply(this, args);              // run right away
    } else if (!timerId) {
      timerId = setTimeout(() => {       // make sure the last call is not lost
        lastRun = Date.now();
        timerId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

const onScroll = throttle(() => console.log('scroll at', Date.now()), 200);
window.addEventListener('scroll', onScroll); // at most ~5 logs per second`,
        },
      ],
      output: `In the debounce example, three quick calls happen. Each one clears the previous timer, so only the last call survives and, 300ms later, prints "API call for: jav". Only one API call instead of three.

In the throttle example, scrolling fires many events, but the function runs at most once every 200ms. The trailing timer makes sure the last position is also handled after scrolling stops.`,
      questions: [
        {
          q: 'What is the difference between debounce and throttle?',
          a: 'Debounce runs the function once after calls stop for a set time. Throttle runs it at most once per set interval while calls continue.',
        },
        {
          q: 'When would you use each?',
          a: 'Debounce: search input, auto-save, form validation, resize end. Throttle: scroll, mousemove, drag, infinite scroll checks, rate-limiting button spam.',
        },
        {
          q: 'Which JavaScript concepts make debounce work?',
          a: 'Closures (to remember the timer id between calls), higher-order functions (it returns a wrapped function), and `setTimeout`/`clearTimeout`.',
        },
        {
          q: 'How do you debounce correctly in React?',
          a: 'Create the debounced function once (`useMemo`/`useRef`) or debounce the value with a `useDebounce` hook, and cancel it in the effect cleanup on unmount.',
        },
      ],
      spoken: `"Both control how often a function runs. Debounce waits until the events stop for a certain time and then runs once — every new call resets the timer — so I use it for search-as-you-type, which cuts API calls from one per keystroke to one per pause. Throttle guarantees the function runs at most once per interval, which is good for scroll or resize handlers. Both are built with closures that remember a timer id or last-run time. In React, I make sure the debounced function is created once, using useMemo or a custom hook."`,
      mistakes: [
        'Creating the debounced function inside a React component body on every render — each render gets a fresh timer, so nothing is debounced.',
        'Losing `this` and arguments in the wrapper — use `fn.apply(this, args)`.',
        'Mixing them up: using debounce for scroll-based animations makes the UI update only after scrolling stops.',
        'Not cancelling pending timers on unmount, so a callback runs on an unmounted component.',
        'Follow-up trap: "Implement a leading-edge debounce." Run immediately if no timer is active, then start a timer that just clears itself; ignore calls while it is active.',
      ],
      takeaway: 'Debounce = after the user stops; throttle = at a steady maximum rate.',
    },
    {
      id: 'memoization',
      title: 'Memoization',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Caching a function\'s results by its inputs so repeated calls with the same input return instantly.',
      what: `**Memoization** means remembering the result of a function for a given input. The next time you call it with the **same input**, you return the saved result instead of calculating again.

It only works safely for **pure functions** (same input → same output, no side effects).

#### Deeper version
A memoize helper uses a **closure** to keep a cache (usually a \`Map\`) and a **key** built from the arguments. For a single primitive argument, the argument itself is the key. For many arguments, people often use \`JSON.stringify(args)\`, but that is slow for big inputs and breaks for functions, \`undefined\` and key order.

Trade-offs:
- It uses **memory**. An unbounded cache can grow forever (a memory leak). Use a size limit (LRU cache) or a \`WeakMap\` when keys are objects.
- Objects are cached **by reference**, so a new object with the same content is a cache miss.
- For async functions, cache the **promise** so parallel calls share one request (and delete it on failure).

In React, \`useMemo\`, \`useCallback\` and \`React.memo\` are memoization tools, but they only remember the **last** inputs, not all of them.`,
      why: `It speeds up expensive work that repeats: recursive algorithms (Fibonacci, DP problems), heavy calculations in render, and repeated API lookups. It is a common interview question and a frequent "implement it" task.`,
      analogy: `Memoization is like a student writing answers to homework questions in a notebook. When the same question comes up again, they look it up instead of solving it from scratch.`,
      code: [
        {
          title: 'A generic memoize',
          lang: 'javascript',
          code: `function memoize(fn) {
  const cache = new Map();               // lives in the closure
  return function (...args) {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const slowSquare = (n) => {
  for (let i = 0; i < 1e7; i++) {}       // pretend this is expensive
  return n * n;
};
const fastSquare = memoize(slowSquare);

console.time('first');  fastSquare(9); console.timeEnd('first');  // slow
console.time('second'); fastSquare(9); console.timeEnd('second'); // almost 0ms`,
        },
        {
          title: 'Memoized recursion and async dedupe',
          lang: 'javascript',
          code: `const fib = memoizeOne((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
function memoizeOne(fn) {
  const cache = new Map();
  return (n) => (cache.has(n) ? cache.get(n) : (cache.set(n, fn(n)), cache.get(n)));
}
console.log(fib(70)); // 190392490709135 - instant; naive recursion would take forever

// Async: share one in-flight request per id
const inflight = new Map();
function getUserOnce(id) {
  if (!inflight.has(id)) {
    const p = fetch(\`/api/users/\${id}\`)
      .then((r) => r.json())
      .catch((err) => { inflight.delete(id); throw err; }); // do not cache failures
    inflight.set(id, p);
  }
  return inflight.get(id);
}`,
        },
      ],
      output: `In the first block, the first call to \`fastSquare(9)\` does the slow loop. The second call finds 81 in the cache and returns almost instantly.

In the second block, memoized Fibonacci computes each \`n\` only once, so \`fib(70)\` returns immediately (naive recursion makes billions of calls). \`getUserOnce\` returns the same promise for repeated calls with the same id, so only one network request is made; failures are removed from the cache so they can be retried.`,
      questions: [
        {
          q: 'What is memoization?',
          a: 'An optimisation that caches a function\'s results by its arguments, returning the cached result for repeated inputs.',
        },
        {
          q: 'When should you NOT memoize?',
          a: 'When the function is impure (depends on time, random, or outside state), when it is already cheap, or when inputs rarely repeat — you pay memory for nothing.',
        },
        {
          q: 'How is useMemo different from a memoize helper?',
          a: '`useMemo` only remembers the result for the last set of dependencies in that component. A memoize helper can remember results for many different inputs.',
        },
        {
          q: 'How do you avoid memory leaks in a memo cache?',
          a: 'Limit its size (LRU eviction), add expiry (TTL), or use a `WeakMap` when keys are objects so entries disappear when the objects are garbage collected.',
        },
      ],
      spoken: `"Memoization is caching a function's result based on its inputs, so repeated calls with the same input skip the work. I implement it with a closure holding a Map, using the argument as the key. It only makes sense for pure functions, and I'm careful about memory — an unbounded cache can leak, so I add a size limit or use a WeakMap for object keys. For async calls I cache the promise to dedupe in-flight requests. In React, useMemo and React.memo are the same idea but only remember the last inputs."`,
      mistakes: [
        'Memoizing impure functions (using `Date.now()`, random, or global state) and returning stale results.',
        'Using `JSON.stringify` keys for huge objects — the key building can cost more than the work saved.',
        'Unbounded caches in long-running Node servers — memory grows forever.',
        'Follow-up trap: "Does `useMemo` guarantee the cached value is kept?" No. React treats it as a performance hint and may throw the cache away; your code must still be correct without it.',
      ],
      takeaway: 'Memoize pure, expensive, repeated work — and put a limit on the cache.',
    },
    {
      id: 'map-set-weakmap-weakset',
      title: 'Map, Set, WeakMap and WeakSet',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Map = key/value with any key type; Set = unique values; Weak versions hold object keys weakly so they can be garbage collected.',
      what: `Four built-in collections:

- **Map**: key → value pairs, like an object, but keys can be **any type** (objects, functions, numbers). Keeps insertion order. Has \`.size\`.
- **Set**: a list of **unique** values. Adding a duplicate does nothing.
- **WeakMap**: like Map, but keys must be **objects** and are held **weakly** — if nothing else references the key object, it can be garbage collected along with its value.
- **WeakSet**: like Set, but only objects, held weakly.

#### Deeper version
**Map vs object**:
- Object keys are only strings/symbols; Map keys can be anything.
- Map has \`size\`, is directly iterable (\`for...of\`), keeps insertion order, and has no inherited keys like \`toString\` (no prototype key clashes).
- Map is optimised for frequent adds/removes. Objects are better for fixed-shape records and JSON.

**Equality**: Map and Set use "SameValueZero": like \`===\` but \`NaN\` equals \`NaN\`. Objects are compared by **reference**, so two \`{ id: 1 }\` objects are two different keys.

**Weak collections**: not iterable, no \`size\`, no \`clear\` — because their content can disappear at any time when the GC runs. Uses: attaching private data or caches to objects (DOM nodes, request objects) without causing memory leaks; marking objects as "already processed".

Newer Set methods like \`union\`, \`intersection\` and \`difference\` exist in recent engines — check support before relying on them.`,
      why: `Set gives you fast de-duplication and \`has\` checks (much faster than \`array.includes\` on big lists). Map is the right tool for caches and lookups with non-string keys. WeakMap prevents memory leaks when you attach data to objects you do not own.`,
      analogy: `A Map is a coat check where any item can be a ticket — a key, a phone, a shoe. A Set is a guest list where each name appears only once. A WeakMap is a coat check that automatically throws away the coat once the owner has left the building for good.`,
      code: [
        {
          title: 'Map and Set basics',
          lang: 'javascript',
          code: `// Set: remove duplicates and fast lookups
const tags = new Set(['js', 'react', 'js']);
tags.add('node');
console.log(tags.size, tags.has('react')); // 3 true
console.log([...tags]);                    // ['js', 'react', 'node']

// Map: object keys
const asha = { id: 1 };
const visits = new Map();
visits.set(asha, 3);
visits.set('total', 10);
console.log(visits.get(asha), visits.size); // 3 2

for (const [key, value] of visits) console.log(key, value);

// Convert between Map and object
const obj = Object.fromEntries(new Map([['a', 1], ['b', 2]])); // { a: 1, b: 2 }
const map = new Map(Object.entries(obj));
console.log(obj, map.get('b')); // { a: 1, b: 2 } 2`,
        },
        {
          title: 'WeakMap for leak-free metadata',
          lang: 'javascript',
          code: `const clickCounts = new WeakMap();

function trackClicks(element) {
  element.addEventListener('click', () => {
    clickCounts.set(element, (clickCounts.get(element) ?? 0) + 1);
    console.log('clicks:', clickCounts.get(element));
  });
}

// If the element is removed from the page and nothing else references it,
// both the element and its count can be garbage collected.
// With a normal Map, the Map itself would keep the element alive forever.

const seen = new WeakSet();
function processOnce(obj) {
  if (seen.has(obj)) return 'already done';
  seen.add(obj);
  return 'processed';
}
const job = {};
console.log(processOnce(job), processOnce(job)); // "processed" "already done"`,
        },
      ],
      output: `In the first block, the Set ignores the duplicate "js", so it has 3 items. The Map uses the \`asha\` object itself as a key. Iterating a Map gives \`[key, value]\` pairs in insertion order. \`Object.fromEntries\` and \`Object.entries\` convert between Maps and plain objects.

In the second block, the WeakMap stores click counts per element without keeping removed elements alive. The WeakSet remembers which objects were processed, so the second call returns "already done".`,
      questions: [
        {
          q: 'When would you use a Map instead of an object?',
          a: 'When keys are not strings (objects, numbers you want to keep as numbers), when you add/remove keys often, when you need the size or guaranteed insertion order, or to avoid prototype key clashes.',
        },
        {
          q: 'What is the difference between Map and WeakMap?',
          a: 'WeakMap keys must be objects and are held weakly, so they can be garbage collected. WeakMap is not iterable and has no size. Map keeps keys alive and is iterable.',
        },
        {
          q: 'How do you remove duplicates from an array?',
          a: '`[...new Set(arr)]` for primitives. For objects, dedupe by a key, e.g. using a Map keyed by `id`.',
        },
        {
          q: 'Why can\'t you iterate a WeakMap?',
          a: 'Its entries can vanish at any time when garbage collection runs, so a list of them would be unreliable. The design also keeps GC timing unobservable.',
        },
      ],
      spoken: `"Map is a key-value collection where keys can be any type, including objects, with a size property and insertion order, so I use it for caches and lookups. Set stores unique values, so it's my go-to for removing duplicates and fast membership checks. WeakMap and WeakSet only accept objects as keys and hold them weakly, meaning if nothing else references the object, it can be garbage collected along with its entry. That makes WeakMap great for attaching metadata or caches to objects like DOM nodes without leaking memory. Weak collections aren't iterable for that reason."`,
      mistakes: [
        'Using bracket syntax on a Map (`map[\'a\'] = 1`) — it sets a normal property, not a Map entry. Use `set`/`get`.',
        'Expecting `JSON.stringify(map)` to work — it gives `{}`. Convert with `Object.fromEntries(map)` first.',
        'Expecting two equal-looking objects to be the same Map key or Set item.',
        'Follow-up trap: "Can a WeakMap have string keys?" No. Keys must be objects (newer engines also allow non-registered symbols — check support). A primitive key throws a `TypeError`.',
      ],
      takeaway: 'Map for any-key lookups, Set for uniqueness, Weak versions to avoid leaks with object keys.',
    },
    {
      id: 'symbol',
      title: 'Symbol',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A primitive that is always unique; used for hidden-ish object keys and for well-known hooks like Symbol.iterator.',
      what: `A **Symbol** is a primitive type whose every value is **unique**. \`Symbol('id') === Symbol('id')\` is \`false\`. The text in brackets is only a description for debugging.

Symbols are mainly used as **object keys** that can never clash with other keys, even ones with the same name.

#### Deeper version
- Symbol keys are **skipped** by \`for...in\`, \`Object.keys\`, and \`JSON.stringify\`. They are not truly private: \`Object.getOwnPropertySymbols(obj)\` and \`Reflect.ownKeys(obj)\` still show them.
- \`Symbol.for('key')\` uses a **global registry**: the same string returns the same symbol everywhere (even across iframes). \`Symbol.keyFor(sym)\` gives back the string.
- **Well-known symbols** let you hook into language behaviour:
  - \`Symbol.iterator\` → make an object work with \`for...of\` and spread.
  - \`Symbol.asyncIterator\` → \`for await...of\`.
  - \`Symbol.toPrimitive\` → control type conversion.
  - \`Symbol.toStringTag\` → change \`Object.prototype.toString\` output.
  - \`Symbol.hasInstance\` → customise \`instanceof\`.
- You cannot use \`new Symbol()\`; just call \`Symbol()\`. Symbols do not auto-convert to strings: \`'a' + Symbol()\` throws; use \`sym.toString()\` or \`sym.description\`.`,
      why: `Libraries use symbols to add metadata to your objects without breaking your keys (React uses \`Symbol.for('react.element')\` to mark elements, which also helps against JSON injection). Well-known symbols are how you make custom iterable data structures.`,
      analogy: `A Symbol is like a key cut by a locksmith that is guaranteed to be one of a kind. Even if two keys are labelled "front door", they will never open each other's lock.`,
      code: [
        {
          title: 'Unique keys and the global registry',
          lang: 'javascript',
          code: `const id1 = Symbol('id');
const id2 = Symbol('id');
console.log(id1 === id2);          // false: always unique
console.log(id1.description);      // "id"

const user = { name: 'Asha', [id1]: 42 };
console.log(user[id1]);            // 42
console.log(Object.keys(user));    // ['name'] (symbol skipped)
console.log(JSON.stringify(user)); // {"name":"Asha"}
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id)]

console.log(Symbol.for('app') === Symbol.for('app')); // true (shared registry)`,
        },
        {
          title: 'Well-known symbol: Symbol.iterator',
          lang: 'javascript',
          code: `const range = {
  from: 1,
  to: 4,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next: () => (current <= last
        ? { value: current++, done: false }
        : { value: undefined, done: true }),
    };
  },
};

console.log([...range]);          // [1, 2, 3, 4]
for (const n of range) console.log(n); // 1 2 3 4`,
        },
      ],
      output: `In the first block, two symbols with the same description are still different. The symbol key is readable with \`user[id1]\`, but hidden from \`Object.keys\` and \`JSON.stringify\`. \`getOwnPropertySymbols\` reveals it. \`Symbol.for\` returns the same symbol for the same name.

In the second block, adding \`Symbol.iterator\` makes the plain \`range\` object work with spread and \`for...of\`.`,
      questions: [
        {
          q: 'What is a Symbol?',
          a: 'A primitive type where every value is unique. Mainly used as non-clashing object keys and for well-known language hooks.',
        },
        {
          q: 'Are symbol properties private?',
          a: 'No. They are hidden from `Object.keys`, `for...in` and JSON, but `Object.getOwnPropertySymbols` and `Reflect.ownKeys` can find them. Use `#private` fields for real privacy.',
        },
        {
          q: 'Symbol() vs Symbol.for()?',
          a: '`Symbol()` always creates a new unique symbol. `Symbol.for(key)` looks up a global registry and returns the same symbol for the same key.',
        },
        {
          q: 'What are well-known symbols?',
          a: 'Built-in symbols like `Symbol.iterator`, `Symbol.asyncIterator` and `Symbol.toPrimitive` that let your objects customise language behaviour.',
        },
      ],
      spoken: `"Symbol is a primitive type where every value is unique, even if two symbols have the same description. I'd use symbols as object keys that can't collide with anything else — they're skipped by Object.keys, for-in and JSON, though they aren't truly private. Symbol.for uses a global registry when I need the same symbol across modules. The most practical part is the well-known symbols, like Symbol.iterator to make my own objects iterable with for-of and spread, or Symbol.toPrimitive to control conversion."`,
      mistakes: [
        'Calling `new Symbol()` — throws a `TypeError`. Use `Symbol()`.',
        'Concatenating a symbol with a string — throws. Use `sym.description` or `String(sym)`.',
        'Thinking symbol keys are private — they can be listed with `Object.getOwnPropertySymbols`.',
        'Follow-up trap: "What does `typeof Symbol()` return?" `"symbol"` — it is one of the 7 primitive types.',
      ],
      takeaway: 'Symbols are guaranteed-unique keys and the hooks (like Symbol.iterator) into language behaviour.',
    },
    {
      id: 'iterators-generators',
      title: 'Iterators and Generators',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'An iterator gives values one at a time via next(); a generator (function*) builds iterators easily and can pause with yield.',
      what: `An **iterator** is an object with a \`next()\` method that returns \`{ value, done }\` each time you call it.

An **iterable** is any object with a \`[Symbol.iterator]()\` method that returns an iterator. Arrays, strings, Maps and Sets are iterables — that is why \`for...of\` and spread work on them.

A **generator** is a special function written with \`function*\`. Inside, \`yield\` **pauses** the function and hands out a value. Calling \`next()\` resumes it until the next \`yield\`. Calling a generator function does not run its body; it returns a generator object (which is both an iterator and an iterable).

#### Deeper version
- Generators are **lazy**: values are produced only when asked for. This allows **infinite sequences** without running out of memory.
- \`gen.next(value)\` can **send** a value back in; it becomes the result of the paused \`yield\` expression.
- \`gen.return(value)\` ends it early; \`gen.throw(err)\` throws inside it at the paused point.
- \`yield*\` delegates to another iterable.
- **Async generators** (\`async function*\`) yield promises and are consumed with \`for await...of\` — useful for paginated APIs and streams (Node readable streams are async iterable).
- Before \`async/await\`, libraries like \`co\` and redux-saga used generators to write async flows; redux-saga still does.`,
      why: `Iterators let any data structure work with \`for...of\`, spread and destructuring. Generators make lazy pipelines, infinite sequences, and step-by-step processes simple. Async generators are great for paging through an API or streaming LLM responses chunk by chunk.`,
      analogy: `A generator is like a Netflix series: it does not play all episodes at once. It plays one episode (yield), pauses, and waits for you to press "next episode" (\`next()\`). It remembers exactly where you stopped.`,
      code: [
        {
          title: 'Generator basics and laziness',
          lang: 'javascript',
          code: `function* idGenerator() {
  let id = 1;
  while (true) {        // infinite, but safe: it is lazy
    yield id++;
  }
}

const ids = idGenerator();
console.log(ids.next()); // { value: 1, done: false }
console.log(ids.next()); // { value: 2, done: false }

function* take(iterable, n) {
  for (const item of iterable) {
    if (n-- <= 0) return;
    yield item;
  }
}
console.log([...take(idGenerator(), 5)]); // [1, 2, 3, 4, 5]

function* twoWay() {
  const name = yield 'What is your name?';
  yield \`Hello, \${name}\`;
}
const talk = twoWay();
console.log(talk.next().value);        // "What is your name?"
console.log(talk.next('Asha').value);  // "Hello, Asha"`,
        },
        {
          title: 'Async generator for paginated APIs',
          lang: 'javascript',
          code: `// Fake API returning pages
async function fetchPage(page) {
  const data = { 1: ['a', 'b'], 2: ['c'], 3: [] };
  return { items: data[page], hasMore: page < 2 };
}

async function* allItems() {
  let page = 1;
  while (true) {
    const { items, hasMore } = await fetchPage(page++);
    yield* items;            // hand out each item of this page
    if (!hasMore) return;
  }
}

(async () => {
  for await (const item of allItems()) {
    console.log(item);       // "a", "b", "c"
  }
})();`,
        },
      ],
      output: `In the first block, the infinite generator only computes ids when \`next()\` is called. \`take\` pulls just 5 values, so the loop stops safely. In \`twoWay\`, the value passed to the second \`next('Asha')\` becomes the result of the first \`yield\`, so it prints "Hello, Asha".

In the second block, the async generator fetches page after page and yields each item. The consumer just uses \`for await...of\` and prints "a", "b", "c" without knowing about pages.`,
      questions: [
        {
          q: 'What is the difference between an iterable and an iterator?',
          a: 'An iterable has a `[Symbol.iterator]()` method. Calling it returns an iterator, which has a `next()` method returning `{ value, done }`.',
        },
        {
          q: 'What is a generator?',
          a: 'A function declared with `function*` that can pause at `yield` and resume later. Calling it returns a generator object that is both an iterator and an iterable.',
        },
        {
          q: 'What does yield do?',
          a: 'It pauses the generator and returns a value to the caller of `next()`. On the next `next(x)`, the function resumes and `yield` evaluates to `x`.',
        },
        {
          q: 'What is for await...of used for?',
          a: 'Looping over async iterables, such as async generators, Node streams, or paginated API helpers, waiting for each value.',
        },
      ],
      spoken: `"An iterator is an object with a next method that returns value and done. An iterable is something with a Symbol.iterator method that gives an iterator — that's what for-of, spread and destructuring use. A generator is a function star that can pause at yield and resume when next is called, so it's an easy way to build iterators. They're lazy, so I can model infinite sequences. Async generators are really practical: I've used the pattern to page through an API, yielding items one by one, and consuming them with for-await-of."`,
      mistakes: [
        'Expecting a generator function to run when called — it only returns a generator object; the body runs on `next()`.',
        'Spreading an infinite generator (`[...idGenerator()]`) — it never ends and crashes. Take a limited number first.',
        'Reusing a finished generator — once `done` is true, it stays done. Create a new one.',
        'Follow-up trap: "Can arrow functions be generators?" No. There is no arrow syntax for generators; use `function*`.',
      ],
      takeaway: 'Iterators hand out values one by one; generators make them easy, lazy and pausable.',
    },
    {
      id: 'getters-setters-descriptors',
      title: 'Getters, Setters and Property Descriptors',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Getters/setters run code when a property is read or written; descriptors control whether a property is writable, enumerable and configurable.',
      what: `**Getters** and **setters** let a property run a function when you read or write it, while it still looks like a normal property.

- \`get fullName() {...}\` runs when you read \`obj.fullName\`.
- \`set fullName(v) {...}\` runs when you write \`obj.fullName = 'x'\`.

Every property also has hidden settings called a **property descriptor**:
- \`writable\`: can the value change?
- \`enumerable\`: does it show up in \`Object.keys\` / \`for...in\`?
- \`configurable\`: can it be deleted or have its settings changed?

#### Deeper version
\`Object.defineProperty(obj, 'key', descriptor)\` creates a property with exact settings. Properties created this way default to \`false\` for all three flags, while normal assignment creates them as \`true\`.

A descriptor is either a **data descriptor** (\`value\`, \`writable\`) or an **accessor descriptor** (\`get\`, \`set\`) — you cannot mix them.

\`Object.getOwnPropertyDescriptor(obj, 'key')\` lets you inspect them. \`Object.freeze\` simply sets every property to \`writable: false, configurable: false\`.

This is how Vue 2's reactivity worked (getters/setters on every property). Vue 3 and MobX moved to **Proxy**, which can also catch new and deleted keys.`,
      why: `Getters give you computed values (like \`fullName\`) with no stale data. Setters let you validate or react to changes. Descriptors let library authors hide internal properties or make constants. Interviewers ask this to test deeper object knowledge.`,
      analogy: `A getter is like a reception desk: when you ask for "the manager", the receptionist goes and fetches the current one. A setter is a receptionist who checks your ID before letting you in. Property descriptors are the rules printed on the door: "read only", "not on the directory", "cannot be removed".`,
      code: [
        {
          title: 'Getters and setters with validation',
          lang: 'javascript',
          code: `const user = {
  first: 'Asha',
  last: 'Rao',
  get fullName() {                 // computed on every read
    return \`\${this.first} \${this.last}\`;
  },
  set fullName(value) {
    const [first, last] = value.split(' ');
    if (!last) throw new Error('Need first and last name');
    this.first = first;
    this.last = last;
  },
};

console.log(user.fullName);   // "Asha Rao"
user.fullName = 'Ravi Kumar';
console.log(user.first);      // "Ravi"`,
        },
        {
          title: 'defineProperty and descriptors',
          lang: 'javascript',
          code: `'use strict';
const config = {};

Object.defineProperty(config, 'apiVersion', {
  value: 'v2',
  writable: false,     // read-only
  enumerable: false,   // hidden from keys/JSON
  configurable: false, // cannot delete or redefine
});
config.env = 'prod';   // normal property: all flags true

console.log(config.apiVersion);          // "v2"
console.log(Object.keys(config));        // ['env']
console.log(JSON.stringify(config));     // {"env":"prod"}
try { config.apiVersion = 'v3'; } catch (e) { console.log(e.name); } // "TypeError"

console.log(Object.getOwnPropertyDescriptor(config, 'env'));
// { value: 'prod', writable: true, enumerable: true, configurable: true }`,
        },
      ],
      output: `In the first block, reading \`fullName\` runs the getter and joins the names. Assigning to it runs the setter, which splits and validates the value, then updates \`first\` and \`last\`.

In the second block, \`apiVersion\` is read-only, hidden from \`Object.keys\` and JSON, and cannot be deleted. Writing to it in strict mode throws a \`TypeError\`. The normal \`env\` property has all flags set to \`true\`.`,
      questions: [
        {
          q: 'What are getters and setters?',
          a: 'Functions that run when a property is read (`get`) or assigned (`set`), so you can compute values or validate input while keeping property syntax.',
        },
        {
          q: 'What is a property descriptor?',
          a: 'The settings of a property: `value`/`writable` (or `get`/`set`), `enumerable` and `configurable`. Read them with `Object.getOwnPropertyDescriptor`.',
        },
        {
          q: 'What are the defaults when using Object.defineProperty?',
          a: '`writable`, `enumerable` and `configurable` all default to `false` — unlike normal assignment, where they are all `true`.',
        },
        {
          q: 'How did Vue 2 reactivity work?',
          a: 'It used `Object.defineProperty` to turn each property into a getter/setter pair that tracked reads and triggered updates on writes. It could not detect new properties, which is one reason Vue 3 uses Proxy.',
        },
      ],
      spoken: `"Getters and setters let a property run code on read or write while it still looks like a normal property — a getter is great for computed values like fullName, and a setter for validation. Under the hood every property has a descriptor with writable, enumerable and configurable flags. Object.defineProperty lets me set them precisely, and note that it defaults them all to false. Object.freeze is really just setting writable and configurable to false on everything. This is also how Vue 2 implemented reactivity before frameworks moved to Proxy."`,
      mistakes: [
        'Setting the same property name inside its own setter (`set name(v) { this.name = v }`) — infinite recursion. Store it in a different field like `_name` or `#name`.',
        'Forgetting that `defineProperty` defaults to non-enumerable and read-only, and then wondering why the property is missing from `Object.keys`.',
        'Putting expensive work in a getter that is read often (e.g. in a render loop).',
        'Follow-up trap: "Does JSON.stringify include getters?" Yes, for own enumerable getters it calls them and includes the result. Getters defined on a class (on the prototype) are not included.',
      ],
      takeaway: 'Getters/setters run code on property access; descriptors decide if a property is writable, visible and removable.',
    },
    {
      id: 'proxy-reflect',
      title: 'Proxy and Reflect',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A Proxy wraps an object and intercepts operations (get, set, delete...) via traps; Reflect performs the default behaviour.',
      what: `A **Proxy** wraps an object and lets you **intercept** what happens to it: reading a property, writing one, deleting, checking \`in\`, calling a function, and more.

\`new Proxy(target, handler)\` — the \`handler\` has **traps** (functions) like \`get\`, \`set\`, \`has\`, \`deleteProperty\`.

**Reflect** is a built-in object with methods matching each trap (\`Reflect.get\`, \`Reflect.set\`...). Inside a trap, you call Reflect to do "the normal thing".

#### Deeper version
- Traps include: \`get\`, \`set\`, \`has\`, \`deleteProperty\`, \`ownKeys\`, \`getOwnPropertyDescriptor\`, \`defineProperty\`, \`apply\` (function calls), \`construct\` (\`new\`), and \`getPrototypeOf\`.
- \`Reflect.set\` returns \`true\`/\`false\` instead of throwing, and passing the \`receiver\` argument keeps getters/inheritance working correctly. That is why \`return Reflect.set(...arguments)\` is the safe default inside a \`set\` trap.
- A \`set\` trap must return \`true\` for success; returning \`false\` throws a \`TypeError\` in strict mode.
- Unlike \`defineProperty\`, a Proxy also sees **new** and **deleted** properties and array index changes — which is why Vue 3 and MobX use it for reactivity.
- Costs: Proxies are slower than plain objects, \`proxy !== target\`, and some built-ins with internal slots (like \`Map\`, \`Date\`, private \`#fields\`) do not work directly through a proxy without extra handling.
- \`Proxy.revocable()\` creates a proxy that can be switched off.`,
      why: `Proxies let you build validation layers, default values, logging, access control, reactive state, and API clients that build URLs from property names — all without changing the original object.`,
      analogy: `A Proxy is like a personal assistant standing in front of a celebrity (the object). Every request goes through the assistant first. They can let it through unchanged (Reflect), change it, log it, or refuse it.`,
      code: [
        {
          title: 'Validation and defaults',
          lang: 'javascript',
          code: `const user = { name: 'Asha', age: 30 };

const safeUser = new Proxy(user, {
  get(target, prop, receiver) {
    if (!(prop in target)) return \`<no \${String(prop)}>\`; // default instead of undefined
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    if (prop === 'age' && (!Number.isInteger(value) || value < 0)) {
      throw new TypeError('age must be a positive integer');
    }
    console.log(\`set \${String(prop)} = \${value}\`);     // logging
    return Reflect.set(target, prop, value, receiver);   // do the normal set
  },
});

console.log(safeUser.email);   // "<no email>"
safeUser.age = 31;             // "set age = 31"
try { safeUser.age = -5; } catch (e) { console.log(e.message); }
console.log(user.age);         // 31 (the real object was updated)`,
        },
        {
          title: 'Tiny reactive store (the idea behind Vue 3)',
          lang: 'javascript',
          code: `function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, key, value, receiver) {
      const ok = Reflect.set(target, key, value, receiver);
      onChange(key, value);              // notify subscribers
      return ok;
    },
    deleteProperty(target, key) {
      const ok = Reflect.deleteProperty(target, key);
      onChange(key, undefined);
      return ok;
    },
  });
}

const state = reactive({ count: 0 }, (k, v) => console.log('render because', k, '=', v));
state.count++;       // "render because count = 1"
state.newKey = 'hi'; // "render because newKey = hi" (new keys are caught too)
delete state.newKey; // "render because newKey = undefined"`,
        },
      ],
      output: `In the first block, reading a missing property returns a friendly default. Setting \`age\` logs the change and updates the real \`user\` object. Setting a negative age throws, so the value stays 31.

In the second block, every change — including adding and deleting keys — calls \`onChange\`, which is how a framework would know to re-render.`,
      questions: [
        {
          q: 'What is a Proxy?',
          a: 'An object that wraps another object and intercepts operations like get, set, delete, `in` and function calls through handler functions called traps.',
        },
        {
          q: 'Why use Reflect inside traps?',
          a: 'Reflect methods perform the default behaviour with the right return values (booleans) and support the `receiver` argument, so getters and inheritance keep working correctly.',
        },
        {
          q: 'Real-world uses of Proxy?',
          a: 'Reactivity (Vue 3, MobX, Immer drafts), validation, default values, logging/debugging, access control, and mocking in tests.',
        },
        {
          q: 'Proxy vs Object.defineProperty for reactivity?',
          a: '`defineProperty` must be applied per existing property and misses new or deleted keys. A Proxy intercepts all operations on the object, including new keys and array index changes.',
        },
      ],
      spoken: `"A Proxy wraps an object and lets me intercept operations on it — reading, writing, deleting, checking with in, even function calls — through handler functions called traps. Reflect has a matching method for each trap, so inside a trap I call Reflect to perform the default behaviour correctly. I'd use proxies for validation, default values, logging, or reactivity — Vue 3 and Immer are built on them, because unlike defineProperty they catch new and deleted properties. The trade-offs are some performance cost and quirks with built-ins like Map and private fields."`,
      mistakes: [
        'Forgetting to `return true` (or the Reflect result) from a `set` trap — in strict mode this throws a `TypeError`.',
        'Calling `target[prop]` instead of `Reflect.get(target, prop, receiver)` — getters then see the wrong `this`.',
        'Proxying a `Map` and calling `proxy.get(...)` — fails with "incompatible receiver" because of internal slots; bind methods to the target.',
        'Follow-up trap: "Is the original object protected?" No. Code holding the original reference bypasses the proxy completely.',
      ],
      takeaway: 'Proxy intercepts object operations; Reflect does the default behaviour — together they power validation and reactivity.',
    },
    {
      id: 'tagged-templates',
      title: 'Template Literals and Tagged Templates',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'A tag function receives the string parts and the values of a template literal separately, so it can build any result.',
      what: `**Template literals** are strings written between backticks. They allow \`\${...}\` expressions inside and can span many lines.

A **tagged template** puts a function name right in front of the backtick string, with no brackets:

\`\`\`js
const greeting = \`Hello \${name}\`;      // normal template literal
const result = tag\`Hello \${name}\`;     // tagged template: calls tag(...)
\`\`\`

The tag function receives:
1. an array of the **plain string parts**, and
2. the **values** of each \`\${...}\` as separate arguments.

It can return anything — a string, an object, a DOM node.

#### Deeper version
- \`strings.length\` is always \`values.length + 1\` (there is a string before, between and after every value, possibly empty).
- \`strings.raw\` gives the raw text with escape sequences not processed. The built-in tag \`String.raw\` uses this to keep backslashes exactly as typed (handy for Windows paths and regex).
- The \`strings\` array is the **same frozen object** every time that call site runs, so libraries can cache work per template.

Real uses: **styled-components** and **Emotion** (\`styled.div\` followed by a CSS template), GraphQL's \`gql\` tag, **lit-html**, safe SQL builders that turn values into parameters instead of string-concatenating them, and i18n helpers.`,
      why: `Tagged templates let libraries build a small language inside JavaScript while keeping values separate from the text. That separation is what makes safe escaping possible — for example, preventing SQL injection or XSS — and it is why styled-components can look at your interpolated props.`,
      analogy: `A normal template literal is a filled-in form that is already glued together. A tagged template hands the tag function the blank form and the answers separately, so it can check, clean or rearrange the answers before filling in the form.`,
      code: [
        {
          title: 'How a tag function sees its input',
          lang: 'javascript',
          code: `function inspect(strings, ...values) {
  console.log(strings);  // [ 'Order ', ' costs ', '!' ]
  console.log(values);   // [ 'Book', 300 ]
  return strings.reduce((out, str, i) => out + str + (i < values.length ? \`[\${values[i]}]\` : ''), '');
}

const item = 'Book';
const price = 300;
console.log(inspect\`Order \${item} costs \${price}!\`); // "Order [Book] costs [300]!"

console.log(String.raw\`C:\\new\\table\`); // "C:\\new\\table" printed literally, no newline/tab`,
        },
        {
          title: 'Safe HTML escaping and a parameterised SQL builder',
          lang: 'javascript',
          code: `const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function html(strings, ...values) {
  return strings.reduce((out, str, i) => out + str + (i < values.length ? escapeHtml(values[i]) : ''), '');
}
const userInput = '<img src=x onerror=alert(1)>';
console.log(html\`<p>\${userInput}</p>\`); // "<p>&lt;img src=x onerror=alert(1)&gt;</p>"

function sql(strings, ...values) {
  const text = strings.reduce((q, str, i) => q + '$' + i + str);
  return { text, values }; // values go to the DB driver separately
}
const id = "1; DROP TABLE users";
console.log(sql\`SELECT * FROM users WHERE id = \${id}\`);
// { text: 'SELECT * FROM users WHERE id = $1', values: [ '1; DROP TABLE users' ] }`,
        },
      ],
      output: `In the first block, the tag receives the three string parts and the two values separately, then joins them with brackets: "Order [Book] costs [300]!". \`String.raw\` keeps \`\\n\` and \`\\t\` as typed instead of turning them into a newline and a tab.

In the second block, \`html\` escapes the user input, so it is shown as text and never runs. \`sql\` replaces each value with a placeholder (\`$1\`) and passes the values separately, which is how parameterised queries prevent SQL injection.`,
      questions: [
        {
          q: 'What is a tagged template?',
          a: 'A template literal with a function in front. The function gets the string parts as an array and the interpolated values as arguments, and returns any result.',
        },
        {
          q: 'Where are tagged templates used in practice?',
          a: 'styled-components/Emotion for CSS, `gql` for GraphQL queries, lit-html for templates, and safe SQL/HTML builders.',
        },
        {
          q: 'What is String.raw?',
          a: 'A built-in tag that returns the raw string without processing escape sequences, useful for regex patterns and Windows paths.',
        },
      ],
      spoken: `"Template literals use backticks and support interpolation and multi-line strings. A tagged template puts a function in front of the literal, and that function receives the static string parts as an array and the interpolated values separately. Because the values come separately, the tag can escape or transform them before building the result — that's how safe SQL builders turn values into parameters, and how styled-components and the gql tag work. String.raw is a built-in tag that keeps backslashes as written."`,
      mistakes: [
        'Building SQL or HTML with plain template literals from user input — that is an injection risk. Use parameters or an escaping tag.',
        'Forgetting that `strings` has one more item than `values` when joining them.',
        'Follow-up trap: "Is calling `tag()` with a template literal inside the brackets the same as a tagged template?" No. With brackets, the function receives one finished string; the tagged form receives the strings array and the values separately.',
      ],
      takeaway: 'A tag function gets the text and the values separately — perfect for safe, custom string building.',
    },
    {
      id: 'garbage-collection',
      title: 'Garbage Collection',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'JavaScript frees memory automatically: anything that cannot be reached from the roots (globals, the stack) gets cleaned up.',
      what: `JavaScript manages memory for you. When you create objects, memory is given automatically. When objects are no longer needed, the **garbage collector (GC)** frees that memory.

How does it know what is "no longer needed"? **Reachability**: an object stays alive if it can be reached from a **root** (global variables, the current call stack, active closures) by following references. If nothing can reach it, it is garbage.

#### Deeper version
Modern engines use **mark-and-sweep**:
1. **Mark**: start from the roots and mark every object you can reach.
2. **Sweep**: free everything that is not marked.

This handles **circular references** fine: two objects pointing to each other but unreachable from any root are both collected. (The very old **reference counting** approach could not, which caused leaks in old Internet Explorer.)

V8 (Chrome, Node) uses a **generational** collector: most objects die young, so new objects live in a small "young generation" that is cleaned often and quickly (minor GC / scavenge). Survivors are moved to the "old generation", which is cleaned less often (major GC). It also does much of the work incrementally and on helper threads to keep pauses short — but GC can still cause small pauses.

You cannot force GC from normal code. \`WeakMap\`, \`WeakSet\`, \`WeakRef\` and \`FinalizationRegistry\` let you hold objects without keeping them alive; \`WeakRef\` and \`FinalizationRegistry\` should be used rarely, because GC timing is unpredictable.

In Node, the old-generation heap has a size limit; you can raise it with \`--max-old-space-size\` (in MB), but that usually hides a leak rather than fixing it.`,
      why: `Knowing how GC decides what to free explains memory leaks: if something you forgot about still references an object, GC must keep it. It also explains why creating many short-lived objects in hot loops can cause GC pauses and jank.`,
      analogy: `Think of balloons tied with strings to people (roots). A balloon held by someone, or tied to another balloon that someone holds, stays. If a balloon's string is not connected to anyone, it floats away (gets collected). Two balloons tied only to each other still float away together.`,
      code: [
        {
          title: 'Reachability in practice',
          lang: 'javascript',
          code: `let user = { name: 'Asha' }; // reachable through the variable "user"
let admin = user;             // two references to the same object

user = null;                  // still reachable through "admin"
admin = null;                 // now unreachable -> can be collected

// Circular references are fine with mark-and-sweep
function makePair() {
  const a = {};
  const b = {};
  a.partner = b;
  b.partner = a;              // a <-> b
  return 'done';
}
makePair(); // after it returns, a and b are unreachable -> both collectable`,
        },
        {
          title: 'Holding without keeping alive: WeakRef (use sparingly)',
          lang: 'javascript',
          code: `let bigData = { rows: new Array(1_000_000).fill(0) };
const ref = new WeakRef(bigData); // does not keep bigData alive

console.log(ref.deref()?.rows.length); // 1000000 (still alive)
bigData = null;                         // only the weak ref remains

// Later (after a GC, timing unknown) ref.deref() may return undefined.
// Always handle that case.
setTimeout(() => console.log('still there?', ref.deref() !== undefined), 1000);`,
        },
      ],
      output: `In the first block, the object stays alive while either \`user\` or \`admin\` points to it. After both are \`null\`, nothing reaches it, so GC can free it. In \`makePair\`, \`a\` and \`b\` point to each other, but once the function returns, no root reaches them, so both are collected.

In the second block, \`WeakRef\` lets us peek at \`bigData\` without keeping it alive. After we drop the strong reference, a later GC may clean it up; whether "still there?" prints \`true\` or \`false\` depends on when the GC runs.`,
      questions: [
        {
          q: 'How does garbage collection work in JavaScript?',
          a: 'Engines use mark-and-sweep: starting from roots (globals, stack, closures), they mark all reachable objects and free the rest.',
        },
        {
          q: 'Can circular references cause leaks?',
          a: 'Not with mark-and-sweep. If the whole cycle is unreachable from roots, it is collected. Old reference-counting collectors had this problem.',
        },
        {
          q: 'What is generational garbage collection?',
          a: 'Objects are split into young and old generations. Young objects are collected often and cheaply, because most objects die young; long-lived ones move to the old generation, which is collected less often.',
        },
        {
          q: 'Can you trigger GC manually?',
          a: 'Not from normal code. Node can expose `global.gc()` with the `--expose-gc` flag for debugging only.',
        },
      ],
      spoken: `"JavaScript is garbage collected. The engine uses mark-and-sweep based on reachability: it starts from roots like global variables, the call stack and active closures, marks everything it can reach, and frees the rest. So circular references aren't a problem as long as the whole group is unreachable. V8 is generational — new objects are collected quickly and often, and survivors move to an old generation. The practical takeaway is that leaks happen when something still references data we no longer need, like a forgotten listener or an ever-growing cache."`,
      mistakes: [
        'Thinking setting a variable to `null` immediately frees memory. It only removes one reference; GC frees it later, if nothing else references it.',
        'Believing circular references always leak in modern JavaScript.',
        'Using `delete` to "free memory" — it removes a property, which only helps if that was the last reference.',
        'Follow-up trap: "What are GC roots?" Global objects, local variables and parameters on the current call stack, and anything captured by live closures or held by the engine (like active timers and listeners).',
      ],
      takeaway: 'If an object cannot be reached from a root, it gets collected — leaks are just forgotten references.',
    },
    {
      id: 'memory-leaks',
      title: 'Memory Leaks',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'A leak is memory you no longer need but still reference — common culprits: listeners, timers, closures, global caches, detached DOM.',
      what: `A **memory leak** is memory that your app no longer needs, but that the garbage collector **cannot free**, because something still references it. Over time memory grows, the app gets slow, and a browser tab or Node server can crash.

Common causes:
1. **Forgotten event listeners** (added but never removed).
2. **Timers** (\`setInterval\`) that are never cleared.
3. **Closures** holding big objects longer than needed.
4. **Global variables** and **ever-growing caches** (a Map that only grows).
5. **Detached DOM nodes**: removed from the page but still referenced in JavaScript.
6. **Subscriptions** (WebSockets, observables, store listeners) not unsubscribed.

#### Deeper version
**In React**: always return a cleanup function from \`useEffect\` for listeners, intervals, subscriptions and in-flight requests (\`AbortController\`).

**In Node**: leaks are more dangerous, because the process lives for days and serves many users. Typical causes: module-level caches without limits, attaching data to long-lived objects per request, adding listeners to a shared \`EventEmitter\` on every request (Node warns with \`MaxListenersExceededWarning\` after 10 by default), and unbounded in-memory queues.

**Finding leaks**:
- Chrome DevTools → **Memory** tab: take a **heap snapshot**, do the action several times, take another, and compare (look at "Detached" DOM nodes and growing object counts). The **Performance** monitor shows the JS heap over time.
- Node: \`process.memoryUsage()\`, \`node --inspect\` with Chrome DevTools heap snapshots, or tools like clinic.js.

**Fixes**: remove listeners (or use \`{ signal }\` / \`{ once: true }\`), clear timers, limit cache size (LRU, TTL), use \`WeakMap\` for object-keyed metadata, and null out references to big data when done.`,
      why: `Leaks are silent: everything works in a quick test, but after an hour of use the tab freezes, or the Node server's memory climbs until it restarts. Senior interviews often ask how you would detect and fix one.`,
      analogy: `A memory leak is like borrowing library books and never returning them. Each book is small, but if you keep doing it, your room fills up and the library runs out of books. The librarian (GC) cannot take them back because your name is still on the card (a reference).`,
      code: [
        {
          title: 'Leaky React effect vs fixed',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

// Leaky: listener and interval live forever, even after unmount
function LeakyWidget() {
  useEffect(() => {
    window.addEventListener('resize', () => console.log(window.innerWidth));
    setInterval(() => console.log('polling...'), 1000);
  }, []);
  return null;
}

// Fixed: clean up everything the effect created
function SafeWidget() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    const id = setInterval(() => console.log('polling...'), 1000);

    return () => {                 // runs on unmount
      window.removeEventListener('resize', onResize); // same function reference
      clearInterval(id);
    };
  }, []);
  return <p>Width: {width}</p>;
}`,
        },
        {
          title: 'Unbounded cache in Node vs a bounded one',
          lang: 'javascript',
          code: `// Leaky: grows with every unique key, forever
const cache = new Map();
function getReportLeaky(key) {
  if (!cache.has(key)) cache.set(key, buildReport(key));
  return cache.get(key);
}

// Bounded: simple LRU using Map insertion order
const MAX = 500;
const lru = new Map();
function getReport(key) {
  if (lru.has(key)) {
    const value = lru.get(key);
    lru.delete(key);          // move to the "most recent" end
    lru.set(key, value);
    return value;
  }
  const value = buildReport(key);
  lru.set(key, value);
  if (lru.size > MAX) lru.delete(lru.keys().next().value); // drop the oldest
  return value;
}

function buildReport(key) { return { key, data: new Array(1000).fill(key) }; }
console.log(process.memoryUsage().heapUsed); // watch this number over time`,
        },
      ],
      output: `In the React example, \`LeakyWidget\` adds a listener and an interval each time it mounts and never removes them, so after mounting and unmounting it a few times, several intervals keep logging and old closures stay in memory. \`SafeWidget\` returns a cleanup that removes the exact same listener function and clears the interval.

In the Node example, the leaky cache grows with every new key forever. The LRU version keeps at most 500 entries by deleting the oldest one, so memory stays flat.`,
      questions: [
        {
          q: 'What causes memory leaks in JavaScript?',
          a: 'Keeping references to data you no longer need: forgotten listeners, uncleared timers, closures over big objects, global variables, unbounded caches, detached DOM nodes and open subscriptions.',
        },
        {
          q: 'How do you find a memory leak in the browser?',
          a: 'Use Chrome DevTools Memory tab: take heap snapshots before and after repeating an action, compare them, and look for growing objects or detached DOM nodes. Check the retainers to see what holds them.',
        },
        {
          q: 'How do you prevent leaks in React?',
          a: 'Return a cleanup function from `useEffect` that removes listeners, clears timers, unsubscribes and aborts fetches.',
        },
        {
          q: 'How do you debug a memory leak in Node?',
          a: 'Watch `process.memoryUsage()` / metrics over time, run with `--inspect`, take heap snapshots at intervals, and compare which objects keep growing. Look for module-level caches and listeners added per request.',
        },
      ],
      spoken: `"A memory leak is when we keep a reference to something we don't need anymore, so the garbage collector can't free it. The common causes I watch for are event listeners and intervals that are never removed, subscriptions not unsubscribed, closures holding large objects, detached DOM nodes, and caches that only grow — that last one is a big one in Node servers. In React I always return cleanups from useEffect. To find leaks, I take heap snapshots in Chrome DevTools before and after repeating an action and compare what's growing, and in Node I use the inspector and memory metrics."`,
      mistakes: [
        'Calling `removeEventListener` with a new arrow function — it must be the exact same function reference that was added.',
        'Using a module-level `Map` or array as a cache in Node with no size limit or expiry.',
        'Raising Node\'s memory limit (`--max-old-space-size`) instead of finding the leak.',
        'Follow-up trap: "What is a detached DOM node?" An element removed from the page but still referenced by JavaScript (a variable, array or closure), so it and its children stay in memory.',
      ],
      takeaway: 'Every listener, timer and subscription you start needs a matching cleanup — and every cache needs a limit.',
    },
    {
      id: 'web-workers',
      title: 'Web Workers',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Run heavy JavaScript on a background thread so the main (UI) thread stays smooth; communicate with postMessage.',
      what: `JavaScript normally runs on **one main thread**, which also handles the UI. Heavy work (big calculations, parsing large files) freezes the page.

A **Web Worker** runs a JavaScript file on a **separate background thread**. The main page and the worker talk by sending **messages**:
- \`worker.postMessage(data)\` to send.
- \`onmessage\` / \`addEventListener('message')\` to receive.

#### Deeper version
- Workers have **no access to the DOM**, \`window\` or \`document\`. They can use \`fetch\`, timers, \`IndexedDB\`, WebSockets and more.
- Data is **copied** using the **structured clone algorithm** (like \`structuredClone\`). Functions cannot be sent. For large binary data, **transfer** an \`ArrayBuffer\` instead of copying: \`postMessage(buf, [buf])\` moves ownership instantly (the sender can no longer use it).
- Kinds of workers:
  - **Dedicated worker**: one page, one worker.
  - **Shared worker**: shared by several tabs of the same origin (support varies by browser).
  - **Service worker**: a special worker that sits between the page and the network — used for offline caching, push notifications and PWAs. It has its own lifecycle and is not meant for heavy computation.
- Module workers: \`new Worker(url, { type: 'module' })\` allows \`import\`.
- \`SharedArrayBuffer\` + \`Atomics\` allow shared memory, but require cross-origin isolation headers.
- In **Node.js**, the equivalent is the \`worker_threads\` module, used for CPU-heavy work so the event loop is not blocked.`,
      why: `Users notice freezes above about 100ms. Workers keep the UI responsive while doing image processing, CSV/Excel parsing, encryption, search indexing, or running ML/LLM models in the browser. In Node, worker threads keep an API server responsive during CPU-heavy tasks.`,
      analogy: `The main thread is a shop cashier who must keep serving customers. A Web Worker is a helper in the back room doing the heavy inventory count. They pass notes through a small window (postMessage). The helper cannot touch the shop floor (the DOM).`,
      code: [
        {
          title: 'Main thread (main.js)',
          lang: 'javascript',
          code: `// Create the worker (module workers can use import)
const worker = new Worker(new URL('./prime-worker.js', import.meta.url), { type: 'module' });

worker.onmessage = (event) => {
  console.log('Primes found:', event.data.count); // UI stayed responsive meanwhile
  worker.terminate();                              // free the thread when done
};
worker.onerror = (err) => console.error('Worker failed:', err.message);

worker.postMessage({ limit: 5_000_000 }); // send work (data is copied)
console.log('Main thread is free to handle clicks and animations');`,
        },
        {
          title: 'Worker thread (prime-worker.js)',
          lang: 'javascript',
          code: `// No DOM here: no window, no document
self.onmessage = (event) => {
  const { limit } = event.data;
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) count++;
  }
  self.postMessage({ count }); // send the result back
};`,
        },
      ],
      output: `The main thread creates the worker and immediately logs "Main thread is free...". The worker counts primes up to 5 million on its own thread, so buttons and animations keep working. When it finishes, it posts \`{ count }\` back, the main thread logs "Primes found: 348513", and the worker is terminated.`,
      questions: [
        {
          q: 'What is a Web Worker?',
          a: 'A way to run JavaScript on a background thread, separate from the main UI thread, communicating via `postMessage`.',
        },
        {
          q: 'Can a Web Worker access the DOM?',
          a: 'No. Workers have no `window` or `document`. They send results back and the main thread updates the DOM.',
        },
        {
          q: 'Web Worker vs Service Worker?',
          a: 'A Web Worker is for heavy computation for a page. A Service Worker acts as a network proxy for the whole site, enabling offline caching, background sync and push notifications.',
        },
        {
          q: 'How is data passed to a worker?',
          a: 'It is copied with the structured clone algorithm. Large `ArrayBuffer`s can be transferred instead (zero-copy), which moves ownership to the worker.',
        },
        {
          q: 'What is the Node.js equivalent?',
          a: 'The `worker_threads` module, used to run CPU-heavy code without blocking the event loop.',
        },
      ],
      spoken: `"Since JavaScript runs on one main thread that also handles the UI, heavy computation freezes the page. Web Workers let me run a script on a background thread. We communicate through postMessage, and data is copied using structured cloning, or transferred for large ArrayBuffers. Workers can't touch the DOM, so the worker computes and the main thread updates the UI. I'd use it for things like parsing large CSV files or image processing. Service Workers are different — they're a network proxy for offline caching. In Node, the equivalent is worker_threads."`,
      mistakes: [
        'Trying to use `document` or `window` inside a worker — they do not exist there.',
        'Sending huge objects back and forth on every frame — the copying cost can be worse than the work saved. Transfer buffers or batch messages.',
        'Using workers for tiny tasks — creating a worker and messaging has overhead.',
        'Follow-up trap: "Does async/await make CPU-heavy code non-blocking?" No. async only helps with waiting (I/O). A CPU-heavy loop still blocks the thread; you need a worker.',
      ],
      takeaway: 'Move heavy CPU work to a worker; the main thread stays free for the UI.',
    },
    {
      id: 'polyfills-bind-map-reduce',
      title: 'Polyfills: bind, map, filter and reduce',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'A polyfill is code that adds a missing built-in feature; writing them for bind, map and reduce is a classic interview task.',
      what: `A **polyfill** is code that adds a feature to environments that do not have it, written using older features. For example, adding \`Array.prototype.includes\` to an old browser.

In interviews, "write a polyfill for X" really means "implement X yourself", to test your understanding of \`this\`, prototypes, callbacks and closures. We name them \`myMap\`, \`myBind\` etc. so we do not overwrite the real ones.

#### Deeper version
Rules of a good polyfill:
- **Check first**: only add it if it is missing — \`if (!Array.prototype.includes) { ... }\`.
- **Match the spec**: same arguments, same return value, same edge cases. For arrays: the callback gets \`(element, index, array)\`, there is an optional \`thisArg\`, and **holes** in sparse arrays are skipped (\`i in arr\`).
- \`reduce\` without an initial value uses the first element as the start, and throws a \`TypeError\` for an empty array.
- \`bind\` must support **partial arguments** and ideally work with \`new\` (then \`this\` should be the new object, not the bound one).
- In real projects, tools like **core-js** (often via Babel's preset-env) add polyfills based on the browsers you target. A **transpiler** (Babel) rewrites new **syntax**; a **polyfill** adds missing **APIs**. You cannot polyfill syntax such as \`?.\`.`,
      why: `This is one of the most frequent hands-on JavaScript interview tasks. It proves you understand how built-ins work under the hood, and it is also the real-world way new features reach older browsers.`,
      analogy: `A polyfill is like a universal travel adapter. Your new laptop charger (new code) expects a certain socket (feature). If the hotel (old browser) does not have it, the adapter fills the gap so everything works the same.`,
      code: [
        {
          title: 'map, filter and reduce',
          lang: 'javascript',
          code: `Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this); // skip holes
  }
  return result;
};

Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);
  }
  return result;
};

Array.prototype.myReduce = function (callback, ...rest) {
  let i = 0;
  let acc;
  if (rest.length > 0) {
    acc = rest[0];                               // initial value given
  } else {
    while (i < this.length && !(i in this)) i++; // find first real element
    if (i >= this.length) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[i++];
  }
  for (; i < this.length; i++) {
    if (i in this) acc = callback(acc, this[i], i, this);
  }
  return acc;
};

console.log([1, 2, 3].myMap((n) => n * 2));          // [2, 4, 6]
console.log([1, 2, 3, 4].myFilter((n) => n % 2));    // [1, 3]
console.log([1, 2, 3].myReduce((a, b) => a + b));    // 6
console.log([1, 2, 3].myReduce((a, b) => a + b, 10)); // 16`,
        },
        {
          title: 'bind (with partial args and new support)',
          lang: 'javascript',
          code: `Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFn = this;
  if (typeof originalFn !== 'function') throw new TypeError('Bind must be called on a function');

  function bound(...callArgs) {
    // If called with new, ignore context and use the new object
    const isNew = this instanceof bound;
    return originalFn.apply(isNew ? this : context, [...boundArgs, ...callArgs]);
  }
  // Keep the prototype chain so instanceof works with new
  if (originalFn.prototype) bound.prototype = Object.create(originalFn.prototype);
  return bound;
};

function greet(greeting, mark) { return \`\${greeting}, \${this.name}\${mark}\`; }
const hi = greet.myBind({ name: 'Asha' }, 'Hi');
console.log(hi('!')); // "Hi, Asha!"

function Point(x, y) { this.x = x; this.y = y; }
const PointAtX1 = Point.myBind(null, 1);
const p = new PointAtX1(2);
console.log(p.x, p.y, p instanceof Point); // 1 2 true`,
        },
      ],
      output: `\`myMap\` doubles each number, \`myFilter\` keeps odd numbers, and \`myReduce\` sums to 6 (or 16 with an initial value of 10). All three skip holes in sparse arrays and pass \`(element, index, array)\` like the real methods. \`myReduce\` throws on an empty array without an initial value, same as the built-in.

\`myBind\` fixes \`this\` to \`{ name: 'Asha' }\` and pre-fills "Hi", so \`hi('!')\` returns "Hi, Asha!". When the bound function is used with \`new\`, it ignores the bound context and builds a real \`Point\`: \`1 2 true\`.`,
      questions: [
        {
          q: 'What is a polyfill?',
          a: 'Code that implements a missing built-in feature using older features, so newer code runs in older environments.',
        },
        {
          q: 'Polyfill vs transpiler?',
          a: 'A transpiler (Babel, TypeScript) converts new syntax to older syntax. A polyfill adds missing APIs like `Promise` or `Array.prototype.flat` at runtime. Syntax cannot be polyfilled.',
        },
        {
          q: 'Why use a normal function, not an arrow, for prototype polyfills?',
          a: 'Because `this` must be the array or function the method is called on. Arrow functions would take `this` from the outer scope.',
        },
        {
          q: 'What edge cases should a reduce polyfill handle?',
          a: 'No initial value (use the first element), empty array without an initial value (throw TypeError), sparse arrays (skip holes), and passing index and array to the callback.',
        },
      ],
      spoken: `"A polyfill implements a missing built-in feature so modern code works in older environments. In interviews, writing one shows I understand this, prototypes and callbacks. For map, I add a function to Array.prototype, use a regular function so this is the array, loop over it, call the callback with element, index and array, and return a new array. For reduce, the key edge case is no initial value: I start with the first element, and throw a TypeError for an empty array. For bind, I return a function that applies the original with the saved context and merged arguments, and handle new."`,
      mistakes: [
        'Using an arrow function for the polyfill, so `this` is not the array.',
        'Forgetting the "no initial value" and "empty array" cases in `reduce`.',
        'In `bind`, forgetting to merge bound arguments with call-time arguments.',
        'Overwriting the real built-in in shared code — always guard with `if (!Array.prototype.x)` or use your own name in interviews.',
        'Follow-up trap: "Write a polyfill for call without using call/apply." Temporarily attach the function to the context with a unique `Symbol` key, call it as `context[key](...args)`, then delete the key.',
      ],
      takeaway: 'A polyfill re-creates a built-in exactly — same arguments, same return, same edge cases.',
    },
    {
      id: 'polyfill-promise',
      title: 'Polyfills: Promise and Promise.all',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'A minimal Promise keeps a state, a value and a list of callbacks; then returns a new promise and runs callbacks as microtasks.',
      what: `Writing your own simple \`Promise\` shows you really understand how promises work. A basic version needs:

1. A **state**: "pending", "fulfilled" or "rejected" — and it can change **only once**.
2. A **value** (or error reason).
3. A **list of callbacks** registered by \`then\` while still pending.
4. \`resolve\` and \`reject\` functions passed to the executor.
5. \`then\` that **returns a new promise**, so chaining works.

#### Deeper version
Spec details that interviewers like to see:
- The executor runs **synchronously**; if it throws, the promise rejects.
- \`then\` callbacks always run **asynchronously** — use \`queueMicrotask\` to match real promises.
- If a \`then\` callback returns a value, the next promise resolves with it; if it **returns a promise (or "thenable")**, the next promise **adopts** its state; if it throws, the next promise rejects.
- If \`onFulfilled\`/\`onRejected\` is not a function, the value/error **passes through** to the next promise.
- \`catch(fn)\` is just \`then(undefined, fn)\`. \`finally\` runs a callback and passes the original value/error through.

The full rules are in the **Promises/A+** specification. The version below covers the main behaviour; a production polyfill (like the one in core-js) handles more edge cases, such as resolving a promise with itself.

\`Promise.all\` polyfill: return a new promise, keep a results array and a counter, put each result at its **original index**, resolve when the counter equals the length, and reject on the first error. Handle the empty array (resolve with \`[]\`).`,
      why: `"Implement Promise" and "implement Promise.all" are two of the most common senior JavaScript interview tasks. They test state machines, closures, microtasks and chaining all at once.`,
      analogy: `Your own promise is like building a restaurant buzzer from scratch: a light that can only switch on once (state), a slot for the order number (value), and a list of people to notify (callbacks). Whoever asks after the light is on gets told right away.`,
      code: [
        {
          title: 'A minimal Promise',
          lang: 'javascript',
          code: `class MyPromise {
  #state = 'pending';
  #value = undefined;
  #handlers = [];

  constructor(executor) {
    const settle = (state, value) => {
      if (this.#state !== 'pending') return;        // settle only once
      if (state === 'fulfilled' && value && typeof value.then === 'function') {
        return value.then(resolve, reject);         // adopt a thenable
      }
      this.#state = state;
      this.#value = value;
      this.#handlers.forEach((h) => h());           // run queued callbacks
    };
    const resolve = (v) => settle('fulfilled', v);
    const reject = (e) => settle('rejected', e);
    try { executor(resolve, reject); } catch (e) { reject(e); }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const run = () => queueMicrotask(() => {      // always async
        const cb = this.#state === 'fulfilled' ? onFulfilled : onRejected;
        if (typeof cb !== 'function') {             // pass-through
          return this.#state === 'fulfilled' ? resolve(this.#value) : reject(this.#value);
        }
        try { resolve(cb(this.#value)); } catch (e) { reject(e); }
      });
      if (this.#state === 'pending') this.#handlers.push(run);
      else run();
    });
  }

  catch(onRejected) { return this.then(undefined, onRejected); }

  finally(fn) {
    return this.then(
      (v) => MyPromise.resolve(fn()).then(() => v),
      (e) => MyPromise.resolve(fn()).then(() => { throw e; })
    );
  }

  static resolve(v) { return v instanceof MyPromise ? v : new MyPromise((r) => r(v)); }
  static reject(e) { return new MyPromise((_, j) => j(e)); }
}

new MyPromise((resolve) => setTimeout(() => resolve(2), 100))
  .then((n) => n * 10)
  .then((n) => { throw new Error('at ' + n); })
  .catch((e) => e.message)
  .finally(() => console.log('cleanup'))
  .then(console.log); // "cleanup", then "at 20"`,
        },
        {
          title: 'Promise.all',
          lang: 'javascript',
          code: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const list = Array.from(items);
    const results = new Array(list.length);
    let done = 0;
    if (list.length === 0) return resolve([]);     // edge case

    list.forEach((item, index) => {
      Promise.resolve(item)                         // also accepts plain values
        .then((value) => {
          results[index] = value;                   // keep input order
          if (++done === list.length) resolve(results);
        })
        .catch(reject);                             // first error wins
    });
  });
}

const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
promiseAll([delay(300, 'a'), 'b', delay(100, 'c')]).then(console.log); // ['a', 'b', 'c']
promiseAll([delay(100, 'a'), Promise.reject(new Error('fail'))])
  .catch((e) => console.log(e.message)); // "fail"`,
        },
      ],
      output: `In the first block, after 100ms the promise resolves with 2. The chain multiplies it to 20, throws, \`catch\` turns the error into its message, \`finally\` logs "cleanup" and passes the value through, and the last \`then\` logs "at 20". Callbacks run through \`queueMicrotask\`, so they are async like the real thing.

In the second block, \`promiseAll\` returns \`['a', 'b', 'c']\` in **input order**, even though 'c' finished before 'a'. Plain values like 'b' are accepted. When one promise rejects, the whole thing rejects with "fail".`,
      questions: [
        {
          q: 'What are the key parts of a Promise implementation?',
          a: 'A state that changes only once, a stored value, a queue of callbacks for when it is pending, resolve/reject functions, and a `then` that returns a new promise and runs callbacks asynchronously.',
        },
        {
          q: 'Why must then return a new promise?',
          a: 'So that chaining works: each step\'s return value (or thrown error) decides the state of the next promise in the chain.',
        },
        {
          q: 'How do you keep the result order in Promise.all?',
          a: 'Store each result at its original index (`results[index] = value`) and count completions, instead of pushing results as they arrive.',
        },
        {
          q: 'Why run then callbacks in a microtask?',
          a: 'The spec requires `then` callbacks to always run asynchronously, even for already-settled promises, so behaviour is consistent. Real promises use the microtask queue.',
        },
      ],
      spoken: `"To implement a promise, I keep three things: a state that can only move from pending once, the settled value, and a list of handlers registered while pending. The constructor runs the executor synchronously with resolve and reject, and catches errors. then returns a new promise; its callback runs in a microtask, and whatever it returns resolves the next promise, or adopts it if it's a promise, while a throw rejects it. For Promise.all, I return a new promise, store each result by index, count completions, resolve when all are done, and reject on the first error."`,
      mistakes: [
        'Letting the state change more than once (calling resolve after reject should do nothing).',
        'Running `then` callbacks synchronously when the promise is already settled — real promises are always async.',
        'In `Promise.all`, pushing results in finish order instead of saving them by index.',
        'Forgetting the empty-array case in `Promise.all` (it must resolve with `[]` immediately).',
        'Follow-up trap: "Implement Promise.allSettled." Same pattern as `all`, but never reject: store `{ status: \'fulfilled\', value }` or `{ status: \'rejected\', reason }` at each index and resolve when all are done.',
      ],
      takeaway: 'A promise is a once-only state machine with a callback queue; then returns a new promise and runs async.',
    },
  ],
  rapidFire: [
    { q: 'Which keyword should you use by default?', a: '`const`. Use `let` only when the value must be re-assigned.' },
    { q: 'Is `let` hoisted?', a: 'Yes, but it stays in the Temporal Dead Zone until its line runs.' },
    { q: 'How many primitive types does JavaScript have?', a: 'Seven: string, number, boolean, undefined, null, bigint, symbol.' },
    { q: 'What is `typeof null`?', a: '`"object"` — a historic bug kept for compatibility.' },
    { q: 'How do you check for an array?', a: '`Array.isArray(value)`.' },
    { q: 'Is JavaScript pass-by-reference?', a: 'No, always pass-by-value; for objects the value is a reference.' },
    { q: 'Name the falsy values.', a: '`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.' },
    { q: 'Is `[]` truthy?', a: 'Yes. All objects, including empty arrays and objects, are truthy.' },
    { q: '`==` vs `===`?', a: '`===` compares type and value; `==` converts types first.' },
    { q: 'When is `==` acceptable?', a: '`x == null` to check for both null and undefined.' },
    { q: 'How do you check for NaN?', a: '`Number.isNaN(x)` — `NaN === NaN` is false.' },
    { q: 'Why is `0.1 + 0.2 !== 0.3`?', a: 'Binary floating point cannot store those decimals exactly.' },
    { q: 'Largest safe integer?', a: '`Number.MAX_SAFE_INTEGER` = 2^53 - 1; use BigInt beyond it.' },
    { q: 'What does `"5" + 2` give?', a: '`"52"` — `+` concatenates if either side is a string.' },
    { q: 'What does `"5" - 2` give?', a: '`3` — `-` converts to numbers.' },
    { q: 'What is lexical scope?', a: 'Variable access is decided by where code is written, not where it is called.' },
    { q: 'Calling a `var` function expression early gives?', a: '`TypeError: ... is not a function` (the variable is undefined).' },
    { q: 'What is a closure in one line?', a: 'A function that remembers variables from the scope where it was created.' },
    { q: 'Do closures copy values?', a: 'No, they hold a live reference to the variables.' },
    { q: 'What decides `this`?', a: 'How the function is called: new > call/apply/bind > obj.method() > plain call.' },
    { q: 'Do arrow functions have their own `this`?', a: 'No, they use the `this` of the surrounding scope.' },
    { q: 'call vs apply?', a: 'Both invoke now; call takes arguments one by one, apply takes an array.' },
    { q: 'What does bind return?', a: 'A new function with `this` (and optional arguments) permanently fixed.' },
    { q: 'Can an arrow function be used with `new`?', a: 'No — it has no prototype and is not a constructor.' },
    { q: 'map vs forEach?', a: '`map` returns a new array; `forEach` returns undefined.' },
    { q: 'Why does `[10, 1, 2].sort()` give `[1, 10, 2]`?', a: 'Default sort compares as strings; pass `(a, b) => a - b`.' },
    { q: 'Does spread deep copy?', a: 'No, it is shallow. Use `structuredClone` for a deep copy.' },
    { q: '`??` vs `||`?', a: '`??` falls back only for null/undefined; `||` for any falsy value.' },
    { q: 'for...in vs for...of?', a: 'for...in gives object keys; for...of gives values of iterables.' },
    { q: 'How do you safely parse JSON?', a: 'Wrap `JSON.parse` in try/catch.' },
    { q: 'What happens to a Date in JSON round trip?', a: 'It becomes an ISO string and stays a string after parse.' },
    { q: 'What is the prototype chain?', a: 'The chain of linked objects JavaScript searches when a property is missing, ending at null.' },
    { q: '`__proto__` vs `prototype`?', a: '`__proto__` is an object\'s actual link; `prototype` is a function\'s property used by `new`.' },
    { q: 'How do you make a truly private class field?', a: 'Prefix it with `#`, e.g. `#balance`.' },
    { q: 'Is Object.freeze deep?', a: 'No, it is shallow.' },
    { q: 'ESM vs CommonJS in one line?', a: 'ESM: static import/export, tree-shakable; CJS: dynamic, synchronous require.' },
    { q: 'What are the three promise states?', a: 'Pending, fulfilled, rejected.' },
    { q: 'Does the Promise executor run synchronously?', a: 'Yes; only then/catch callbacks are async.' },
    { q: 'What does an async function return?', a: 'Always a promise.' },
    { q: 'Does `await` block the thread?', a: 'No, it pauses only the current async function.' },
    { q: 'Why not use `await` inside forEach?', a: 'forEach does not wait; use for...of or Promise.all with map.' },
    { q: 'Promise.all vs allSettled?', a: 'all rejects on the first failure; allSettled waits for all and never rejects.' },
    { q: 'Promise.race vs Promise.any?', a: 'race: first to settle (even a rejection); any: first to fulfil.' },
    { q: 'What runs first: a promise callback or setTimeout 0?', a: 'The promise callback (microtask).' },
    { q: 'Name some microtasks.', a: 'Promise callbacks, code after await, queueMicrotask, MutationObserver.' },
    { q: 'In Node, what runs before promise microtasks?', a: '`process.nextTick` callbacks.' },
    { q: 'Does fetch reject on a 404?', a: 'No — check `res.ok`. It only rejects on network errors or abort.' },
    { q: 'How do you cancel a fetch?', a: 'Pass an AbortController signal and call `controller.abort()`.' },
    { q: 'Debounce vs throttle?', a: 'Debounce runs after calls stop; throttle runs at most once per interval.' },
    { q: 'Map vs plain object?', a: 'Map allows any key type, has size, and keeps insertion order.' },
    { q: 'Why use a WeakMap?', a: 'Object keys are held weakly, so entries do not prevent garbage collection.' },
    { q: 'Are Symbol keys private?', a: 'No, `Object.getOwnPropertySymbols` reveals them; they are just hidden from keys/JSON.' },
    { q: 'What does a generator return when called?', a: 'A generator object (an iterator); the body runs on `next()`.' },
    { q: 'What does `Reflect` do in a Proxy trap?', a: 'Performs the default operation correctly.' },
    { q: 'How does GC decide what to free?', a: 'Mark-and-sweep: anything unreachable from roots is collected.' },
    { q: 'Top causes of memory leaks?', a: 'Forgotten listeners, uncleared timers, unbounded caches, detached DOM nodes.' },
    { q: 'Can a Web Worker access the DOM?', a: 'No; it communicates with the main thread via postMessage.' },
    { q: 'async vs defer scripts?', a: 'defer runs in order after parsing; async runs whenever it downloads.' },
    { q: 'Where should auth tokens live in the browser?', a: 'In an HttpOnly, Secure, SameSite cookie — not localStorage.' },
    { q: 'Polyfill vs transpiler?', a: 'A polyfill adds missing APIs at runtime; a transpiler rewrites new syntax.' },
  ],
};
