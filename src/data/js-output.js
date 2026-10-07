// JS Output & Implement-it — "what is the output?" puzzles and classic implement-it-yourself problems.
// Topics ordered basic -> intermediate -> advanced. See CONTENT_GUIDE.md for the topic format.
// Every puzzle output in this file was produced by actually running the code with Node.js.

export default {
  id: 'js-output',
  title: 'JS Output & Implement-it',
  icon: '🧠',
  description: 'Classic "what does this print?" puzzles grouped by theme (closures, hoisting, coercion, this, event loop, promises, prototypes) plus the implement-it-yourself problems interviewers love: debounce, throttle, deep clone, LRU cache, Promise.all and more.',
  definitionTitle: 'What are output and implement-it questions?',
  definition: `**"What is the output?" questions** show you a short JavaScript snippet and ask what it prints. They test whether you really understand **hoisting, closures, \`this\`, type coercion and the event loop** (the order in which promises and timers run).

**"Implement-it-yourself" questions** ask you to write common utilities from scratch, such as **debounce, throttle, deep clone, Promise.all, curry, memoize, an LRU cache or an event emitter**. They show you understand how these tools work inside.

**One-line answer:** "Output questions test how well you can predict JavaScript's behaviour — scope, hoisting, this, coercion, the event loop — and implement-it questions test whether you can build core utilities like debounce or Promise.all yourself."`,
  topics: [
    {
      id: 'closures-in-loops',
      title: 'Output: Closures in Loops (var vs let + setTimeout)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'With var, all callbacks share ONE variable and see its final value; with let, each loop round gets a NEW variable.',
      what: `A **closure** is a function that remembers the variables around it, even after the outer code has finished. The function does not copy the value. It keeps a **live link** to the variable.

The rule you must know:
- \`var\` is **function-scoped**. A \`for (var i ...)\` loop has only **one** \`i\` for the whole loop. Every callback links to that same \`i\`.
- \`let\` is **block-scoped**. A \`for (let i ...)\` loop creates a **new** \`i\` for every round (iteration). Each callback links to its own copy.
- \`setTimeout\` callbacks run **later**, after the loop has completely finished.

So with \`var\`, by the time the callbacks run, the loop is done and \`i\` is already at its final value.

#### Deeper version
The spec has a special rule for \`for (let ...)\` loops: at the start of every iteration, the engine creates a fresh **lexical environment** (a new scope box) and copies the current value of \`i\` into it. That is why each closure sees a different value. This only happens when \`let\` is declared **in the loop head**. If you declare \`let i\` above the loop and just use it in the loop, there is still only one binding, and you get the same bug as \`var\`.

Before \`let\` existed (ES5), the fix was an **IIFE** (Immediately Invoked Function Expression): a function you call right away and pass \`i\` into. Function parameters are new variables, so each call captures its own value. Another fix: \`setTimeout(fn, 0, i)\` passes \`i\` as an argument.`,
      why: `This is probably the most asked JavaScript output question. It checks three things at once: do you understand **closures**, the difference between **var and let scope**, and that **setTimeout is async** (runs after the current code). Real bugs look exactly like this: event handlers attached in a loop that all use the last value.`,
      analogy: `Imagine three people each get a note that says "look at the whiteboard". There is **one** whiteboard (\`var\`). By the time they read it, someone has written "3" on it, so all three read 3.

With \`let\`, each person gets **their own small whiteboard** with the number written at that moment: 0, 1, 2. Later, each reads their own board.`,
      code: [
        {
          title: 'Puzzle 1: var in a loop with setTimeout',
          lang: 'javascript',
          code: `for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 0);
}`,
        },
        {
          title: 'Puzzle 2: the same loop with let',
          lang: 'javascript',
          code: `for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 0);
}`,
        },
        {
          title: 'Puzzle 3: the old IIFE fix',
          lang: 'javascript',
          code: `for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j);
    }, 0);
  })(i);
}`,
        },
        {
          title: 'Puzzle 4: storing functions in an array (no setTimeout)',
          lang: 'javascript',
          code: `var fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i * 10);
}
console.log(fns.map((f) => f()));`,
        },
        {
          title: 'Puzzle 5: let, but declared outside the loop',
          lang: 'javascript',
          code: `let i = 0;
for (; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
3
3
3
\`\`\`
There is only one \`i\`. The loop runs to the end first (i becomes 3, which stops the loop). Then the three callbacks run and all read the same \`i\`, which is 3.

**Puzzle 2 output:**
\`\`\`text
0
1
2
\`\`\`
\`let\` in the loop head creates a new \`i\` for each round. Each callback closes over its own \`i\`.

**Puzzle 3 output:**
\`\`\`text
0
1
2
\`\`\`
The IIFE is called immediately with the current \`i\`. Its parameter \`j\` is a brand-new variable for each call, so each callback remembers a different \`j\`.

**Puzzle 4 output:**
\`\`\`text
[ 30, 30, 30 ]
\`\`\`
No async code here, but the result is the same idea. The arrow functions are **called after the loop finished**, when \`i\` is 3. So every function returns \`3 * 10\`. (A browser console shows it as \`[30, 30, 30]\`.)

**Puzzle 5 output:**
\`\`\`text
3
3
3
\`\`\`
The trap: \`let\` alone does not fix it. The magic "new binding per iteration" only happens when \`let\` is declared **inside the for head**. Here there is one \`i\`, shared by all callbacks.`,
      questions: [
        {
          q: 'Why does the var loop print 3, 3, 3?',
          a: '`var` creates one function-scoped variable. All callbacks close over that same variable, and they run after the loop finishes, when `i` is 3.',
        },
        {
          q: 'Give three ways to make it print 0, 1, 2.',
          a: 'Use `let` in the loop head; wrap the body in an IIFE that takes `i` as a parameter; or pass `i` as the third argument: `setTimeout(console.log, 0, i)`. Using `forEach` also works because each callback call has its own parameter.',
        },
        {
          q: 'Does setTimeout(fn, 0) run immediately?',
          a: 'No. It schedules `fn` as a task (macrotask). It runs only after the current code and all microtasks finish, so the loop always completes first.',
        },
        {
          q: 'Is a closure a copy of the value?',
          a: 'No. A closure keeps a reference to the variable itself. If the variable changes later, the closure sees the new value.',
        },
      ],
      spoken: `"When I see a loop with setTimeout, I ask two questions. First, how many variables are there? With var there is only one i for the whole loop, but let in the loop head creates a fresh i for every iteration. Second, when do the callbacks run? setTimeout always runs after the current code, so the loop is already finished. With var, every callback reads the final value, so I get 3, 3, 3. With let I get 0, 1, 2. The fix is let, an IIFE, or passing i as an argument."`,
      mistakes: [
        'Thinking `setTimeout(fn, 0)` runs right away. It always waits until the current script is done.',
        'Saying the var loop prints `2, 2, 2`. The loop stops when `i < 3` is false, so the final value is 3, not 2.',
        'Believing any `let` fixes the bug. Only `let` declared in the `for (...)` head gets a new binding per iteration (Puzzle 5).',
        'Follow-up trap: "What if the delay is i * 1000?" The timing changes (callbacks fire at 0s, 1s, 2s), but with `var` they still all print 3.',
      ],
      takeaway: 'var = one shared variable (all callbacks see the last value); let in the for head = a new variable per iteration.',
    },
    {
      id: 'hoisting-puzzles',
      title: 'Output: Hoisting, TDZ and Function Expressions',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'var is hoisted as undefined, function declarations are hoisted fully, let/const are hoisted but locked in the TDZ.',
      what: `**Hoisting** means: before your code runs, JavaScript scans the scope and registers all declarations. It feels like declarations are "moved to the top".

The rules you must know:
- \`var x = 5\` → the **name** is hoisted and set to \`undefined\`. The \`= 5\` stays where it is.
- \`function foo() {}\` (a **function declaration**) → hoisted **completely**. You can call it before the line.
- \`var foo = function () {}\` (a **function expression**) → only \`var foo\` is hoisted, as \`undefined\`. Calling it early gives **TypeError: foo is not a function**.
- \`let\` / \`const\` / \`class\` → hoisted, but **not initialized**. Touching them before the line gives **ReferenceError**. This zone is called the **TDZ (Temporal Dead Zone)**.

#### Deeper version
Each scope is set up in two phases. In the **creation phase**, the engine creates bindings: \`var\` bindings get \`undefined\`, function declarations get the full function object, and \`let\`/\`const\` bindings are created but left **uninitialized**. In the **execution phase**, code runs line by line and assignments happen.

When a function declaration and a \`var\` have the **same name**, the function wins during creation (the \`var\` is ignored because the name already exists). But the later assignment line \`foo = 1\` still runs and overwrites it. A local \`var\` also **shadows** an outer variable for the **whole** function body, even the lines above the \`var\`.`,
      why: `Interviewers use hoisting puzzles to see if you understand **how the engine prepares a scope** before running it. It also explains real bugs: calling a function expression too early, or reading a variable that is unexpectedly \`undefined\` because a local \`var\` shadows a global one.`,
      analogy: `Think of a teacher taking attendance before class starts. She writes every student's name on the board (hoisting).
- \`var\` students: name on the board, but their seat is empty (\`undefined\`) until they walk in.
- Function declarations: arrive early, fully ready.
- \`let\`/\`const\` students: name on the board with a "do not disturb" sign. If you call on them before they arrive, the teacher gets angry (ReferenceError).`,
      code: [
        {
          title: 'Puzzle 1: reading a var before it is assigned',
          lang: 'javascript',
          code: `console.log(a);
var a = 5;
console.log(a);`,
        },
        {
          title: 'Puzzle 2: declaration vs expression',
          lang: 'javascript',
          code: `console.log(typeof greet);
console.log(typeof hello);

function greet() {}
var hello = function () {};`,
        },
        {
          title: 'Puzzle 3: calling a function expression too early',
          lang: 'javascript',
          code: `try {
  hello();
} catch (e) {
  console.log(e.name + ': ' + e.message);
}

var hello = function () {
  console.log('hello');
};`,
        },
        {
          title: 'Puzzle 4: let and the TDZ',
          lang: 'javascript',
          code: `try {
  console.log(x);
} catch (e) {
  console.log(e.name + ': ' + e.message);
}

let x = 10;
console.log(x);`,
        },
        {
          title: 'Puzzle 5: local var shadows the outer one',
          lang: 'javascript',
          code: `var name = 'outer';

function show() {
  console.log(name);
  var name = 'inner';
  console.log(name);
}

show();`,
        },
        {
          title: 'Puzzle 6: function and var with the same name',
          lang: 'javascript',
          code: `console.log(typeof foo);

var foo = 1;
function foo() {}

console.log(typeof foo);`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
undefined
5
\`\`\`
\`var a\` is hoisted and set to \`undefined\`. The assignment \`a = 5\` happens on line 2.

**Puzzle 2 output:**
\`\`\`text
function
undefined
\`\`\`
\`greet\` is a function declaration, so it is hoisted with its body. \`hello\` is a \`var\`, so at that moment it is only \`undefined\`.

**Puzzle 3 output:**
\`\`\`text
TypeError: hello is not a function
\`\`\`
\`hello\` exists (it is \`undefined\`), so it is **not** a ReferenceError. Calling \`undefined()\` is a TypeError.

**Puzzle 4 output:**
\`\`\`text
ReferenceError: Cannot access 'x' before initialization
10
\`\`\`
\`x\` is in the TDZ until the \`let x = 10\` line runs. (Chrome shows the same message. Firefox says "can't access lexical declaration 'x' before initialization".)

**Puzzle 5 output:**
\`\`\`text
undefined
inner
\`\`\`
Inside \`show\`, the local \`var name\` is hoisted to the top of the function. It **shadows** (hides) the outer \`name\` for the whole function, so the first log reads the local one, which is still \`undefined\`.

**Puzzle 6 output:**
\`\`\`text
function
number
\`\`\`
In the creation phase the function declaration wins, so \`foo\` starts as a function. Then the line \`foo = 1\` runs and overwrites it with a number.`,
      questions: [
        {
          q: 'What is hoisting?',
          a: 'Before code runs, the engine registers all declarations in a scope. `var` becomes `undefined`, function declarations are fully available, and `let`/`const`/`class` exist but are uninitialized (TDZ).',
        },
        {
          q: 'Are let and const hoisted?',
          a: 'Yes, but they are not initialized. Accessing them before the declaration line throws a ReferenceError. That period is the Temporal Dead Zone.',
        },
        {
          q: 'Why does calling a function expression early give TypeError and not ReferenceError?',
          a: 'Because the `var` name exists (hoisted as `undefined`). You are calling `undefined`, which is a TypeError. With `const hello = () => {}` you would get a ReferenceError instead (TDZ).',
        },
        {
          q: 'Is typeof safe in the TDZ?',
          a: 'No. `typeof x` on an undeclared variable returns "undefined", but `typeof x` before `let x` in the same scope throws a ReferenceError.',
        },
      ],
      spoken: `"For hoisting puzzles I mentally split the code into two phases. In the creation phase, var names are registered as undefined, function declarations are registered with their full body, and let and const are registered but stay uninitialized in the temporal dead zone. Then the execution phase runs line by line. So reading a var early gives undefined, calling a function declaration early works, calling a function expression early is a TypeError, and touching let or const early is a ReferenceError. I also watch for a local var that shadows a global one."`,
      mistakes: [
        'Saying `let` and `const` are "not hoisted". They are hoisted but uninitialized; that is exactly why the TDZ error exists.',
        'Expecting Puzzle 5 to print "outer" first. The local `var name` shadows the outer variable for the whole function body.',
        'Mixing up the errors: function expression via `var` → TypeError; via `let`/`const` → ReferenceError.',
        'Follow-up trap: "Are class declarations hoisted?" Yes, like `let`: they are in the TDZ, so `new Foo()` before `class Foo {}` throws a ReferenceError.',
      ],
      takeaway: 'var → undefined, function declaration → ready to call, let/const/class → TDZ ReferenceError.',
    },
    {
      id: 'typeof-quirks',
      title: 'Output: typeof and Type-Check Quirks',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'typeof null is "object", typeof NaN is "number", arrays are "object" — use Array.isArray and === null instead.',
      what: `\`typeof\` is an operator that returns a **string** naming the type of a value.

The results you must memorize:
- \`typeof 1\` → "number", \`typeof NaN\` → **"number"** (NaN means "Not a Number", but its type is number)
- \`typeof 'a'\` → "string", \`typeof true\` → "boolean", \`typeof undefined\` → "undefined"
- \`typeof null\` → **"object"** (a famous old bug)
- \`typeof []\` → "object", \`typeof {}\` → "object"
- \`typeof function () {}\` → "function", \`typeof class {}\` → "function"
- \`typeof Symbol()\` → "symbol", \`typeof 10n\` → "bigint"
- \`typeof notDeclared\` → "undefined" (no error)

#### Deeper version
\`typeof null === 'object'\` comes from the first JavaScript engine: values were stored with a type tag, and the tag for objects was 0. \`null\` was the null pointer (all zeros), so it looked like an object. It could not be fixed later without breaking websites.

\`typeof\` always returns a string, so \`typeof typeof x\` is always "string". Wrapper objects created with \`new Number(5)\` are objects, but calling \`Number('5')\` **without** \`new\` converts and returns a primitive. To check types reliably: \`Array.isArray(x)\`, \`x === null\`, \`Number.isNaN(x)\`, and \`Object.prototype.toString.call(x)\` which returns strings like "[object Date]".`,
      why: `These questions test whether you know the language's sharp edges. In real code, a wrong type check (like \`typeof x === 'object'\` letting \`null\` through) causes "Cannot read properties of null" crashes. Interviewers want to hear the safe alternatives.`,
      analogy: `\`typeof\` is like a quick airport scanner. It is fast and usually right, but it labels some things strangely: it calls an empty tray (\`null\`) a "bag" (object), and it puts lists (arrays) in the same "bag" bin as everything else. For exact checks you use a special scanner, like \`Array.isArray\`.`,
      code: [
        {
          title: 'Puzzle 1: the classic typeof list',
          lang: 'javascript',
          code: `console.log(typeof null);
console.log(typeof undefined);
console.log(typeof NaN);
console.log(typeof []);
console.log(typeof function () {});`,
        },
        {
          title: 'Puzzle 2: typeof typeof',
          lang: 'javascript',
          code: `console.log(typeof typeof 1);
console.log(typeof typeof undefined);`,
        },
        {
          title: 'Puzzle 3: less common types',
          lang: 'javascript',
          code: `console.log(typeof notDeclaredAnywhere);
console.log(typeof class Person {});
console.log(typeof Symbol('id'));
console.log(typeof 10n);`,
        },
        {
          title: 'Puzzle 4: wrappers vs conversion',
          lang: 'javascript',
          code: `console.log(typeof new Number(5));
console.log(typeof Number('5'));
console.log(new Number(5) === 5);
console.log(Number('5') === 5);`,
        },
        {
          title: 'Puzzle 5: better checks',
          lang: 'javascript',
          code: `console.log(Array.isArray([]));
console.log(null instanceof Object);
console.log(Object.prototype.toString.call(null));
console.log(Object.prototype.toString.call(new Date()));`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
object
undefined
number
object
function
\`\`\`
\`null\` is "object" (historic bug), NaN is a number, arrays are objects, functions get their own label.

**Puzzle 2 output:**
\`\`\`text
string
string
\`\`\`
The inner \`typeof\` returns a string ("number" or "undefined"). The outer \`typeof\` of any string is "string".

**Puzzle 3 output:**
\`\`\`text
undefined
function
symbol
bigint
\`\`\`
\`typeof\` on an undeclared variable does **not** throw. Classes are just special functions.

**Puzzle 4 output:**
\`\`\`text
object
number
false
true
\`\`\`
\`new Number(5)\` creates a wrapper **object**, and an object is never \`===\` a primitive. \`Number('5')\` without \`new\` just converts to the primitive 5.

**Puzzle 5 output:**
\`\`\`text
true
false
[object Null]
[object Date]
\`\`\`
\`null\` has no prototype chain, so \`instanceof Object\` is false even though \`typeof null\` says "object". \`Object.prototype.toString\` gives a precise tag.`,
      questions: [
        {
          q: 'Why is typeof null "object"?',
          a: 'A bug from the first version of JavaScript: objects had type tag 0 and null was stored as all zeros. It was never fixed because it would break existing websites.',
        },
        {
          q: 'How do you check if a value is an array?',
          a: 'Use `Array.isArray(value)`. `typeof` returns "object" for arrays. `instanceof Array` can fail across iframes because each frame has its own Array constructor.',
        },
        {
          q: 'How do you check for a real object (not null, not array)?',
          a: '`value !== null && typeof value === \'object\' && !Array.isArray(value)`.',
        },
        {
          q: 'What is the difference between isNaN and Number.isNaN?',
          a: '`isNaN` converts first, so `isNaN(\'abc\')` is true. `Number.isNaN` does not convert, so it is true only for the actual NaN value.',
        },
      ],
      spoken: `"typeof returns a string, and I have the tricky results memorized: typeof null is object because of an old bug, typeof NaN is number, arrays are object, and functions and classes are function. typeof on a variable that was never declared returns undefined without throwing, but inside a TDZ it throws. Because typeof is unreliable for some values, in real code I use Array.isArray for arrays, strict equality for null, Number.isNaN for NaN, and Object.prototype.toString when I need the exact built-in type."`,
      mistakes: [
        'Checking `typeof x === \'object\'` and then reading `x.prop`. If `x` is `null` this crashes. Always check `x !== null` too.',
        'Using `new Number`, `new String` or `new Boolean`. They create objects, and `new Boolean(false)` is truthy.',
        'Saying `typeof NaN` is "NaN". There is no such type; it is "number".',
        'Follow-up trap: "What does typeof document.all return?" "undefined" in browsers, a deliberate legacy exception. Mention it only if asked.',
      ],
      takeaway: 'typeof null is "object", typeof NaN is "number", arrays are "object" — use Array.isArray, === null and Number.isNaN for real checks.',
    },
    {
      id: 'coercion-equality',
      title: 'Output: Type Coercion and Equality',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: '+ with a string concatenates, other math operators convert to numbers, and == converts types before comparing.',
      what: `**Type coercion** means JavaScript automatically converts a value from one type to another, for example a string to a number.

The rules you must know:
- \`+\` with **any string** (or an object that becomes a string) → **string concatenation**: \`'5' + 2\` is "52".
- \`-\`, \`*\`, \`/\` → always convert to **numbers**: \`'5' - 2\` is 3.
- Number conversion: \`true\` → 1, \`false\` → 0, \`null\` → 0, \`undefined\` → NaN, \`''\` → 0, \`[]\` → 0.
- Objects and arrays become strings first: \`[]\` → "", \`[1,2]\` → "1,2", \`{}\` → "[object Object]".
- \`===\` (strict) never converts. \`==\` (loose) converts types first.
- \`null == undefined\` is true, but \`null\` is **not** \`==\` to 0, false or "".
- \`NaN\` is not equal to anything, not even itself.

#### Deeper version
When an object meets an operator, JavaScript calls **ToPrimitive**: it tries \`valueOf()\`, and if that does not give a primitive, it tries \`toString()\` (for \`+\` the default hint is used, which for normal objects ends in \`toString\`). Arrays return themselves from \`valueOf\`, so they fall back to \`toString\`, which joins items with commas.

\`==\` follows the **Abstract Equality** algorithm: if one side is a boolean, convert it to a number first; if one side is an object and the other a primitive, convert the object to a primitive; if string vs number, convert the string to a number. That is why \`[] == false\` becomes \`'' == 0\` → \`0 == 0\` → true. Relational operators like \`>=\` use number conversion, so \`null >= 0\` is true even though \`null == 0\` is false. \`Object.is\` is like \`===\` but treats \`NaN\` as equal to itself and \`0\` and \`-0\` as different.`,
      why: `Coercion bugs are real: form inputs are strings, so \`'10' + 5\` gives "105" instead of 15. Interviewers ask these to see if you know **why** to use \`===\`, and whether you can explain the conversion steps instead of guessing.`,
      analogy: `Think of \`==\` as a friendly translator. Before comparing, it translates both people into the same language, and sometimes the translation is surprising. \`===\` is a strict guard: if you do not speak the same language (type), you are not equal. No translation.`,
      code: [
        {
          title: 'Puzzle 1: adding arrays and objects',
          lang: 'javascript',
          code: `console.log([] + {});
console.log([] + []);
console.log([1, 2] + [3]);
console.log({} + []);`,
        },
        {
          title: 'Puzzle 2: plus vs minus with strings',
          lang: 'javascript',
          code: `console.log('5' - 2);
console.log('5' + 2);
console.log('5' * '2');
console.log(true + 1);
console.log(null + 1);
console.log(undefined + 1);
console.log(1 + 2 + '3');
console.log('1' + 2 + 3);`,
        },
        {
          title: 'Puzzle 3: null, undefined and NaN',
          lang: 'javascript',
          code: `console.log(null == undefined);
console.log(null === undefined);
console.log(null == 0);
console.log(null >= 0);
console.log(NaN == NaN);
console.log(Object.is(NaN, NaN));`,
        },
        {
          title: 'Puzzle 4: loose equality surprises',
          lang: 'javascript',
          code: `console.log([] == false);
console.log([] == ![]);
console.log('' == 0);
console.log('0' == false);
console.log([1] == 1);
console.log({} == '[object Object]');`,
        },
        {
          title: 'Puzzle 5: numbers and truthiness',
          lang: 'javascript',
          code: `console.log(0.1 + 0.2 === 0.3);
console.log(0.1 + 0.2);
console.log(!!'false');
console.log(!!'');
console.log(+'');
console.log(+'12px');`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
[object Object]

1,23
[object Object]
\`\`\`
Arrays and objects become strings: \`[]\` → "", \`{}\` → "[object Object]", \`[1,2]\` → "1,2". Then \`+\` joins strings. The second line is an **empty string** (an empty line). Note: if you type \`{} + []\` as a **statement** directly in a browser console, you may see \`0\`, because \`{}\` is read as an empty code block and the line becomes \`+[]\`. Inside \`console.log(...)\` it is an expression, so you get "[object Object]".

**Puzzle 2 output:**
\`\`\`text
3
52
10
2
1
NaN
33
123
\`\`\`
\`-\` and \`*\` convert to numbers. \`+\` with a string concatenates. \`true\` → 1, \`null\` → 0, \`undefined\` → NaN. \`+\` goes left to right: \`1 + 2\` is 3, then \`3 + '3'\` is "33"; but \`'1' + 2\` is "12", then "12" + 3 is "123".

**Puzzle 3 output:**
\`\`\`text
true
false
false
true
false
true
\`\`\`
\`null == undefined\` is a special rule (true). \`null == 0\` is false because \`==\` does not convert \`null\` to a number. But \`>=\` does convert: \`0 >= 0\` is true. NaN is never equal to NaN with \`==\` or \`===\`, but \`Object.is\` says true.

**Puzzle 4 output:**
\`\`\`text
true
true
true
true
true
true
\`\`\`
All true! \`[] == false\` → \`'' == 0\` → \`0 == 0\`. \`[] == ![]\`: \`![]\` is false (an array is truthy), so it is the same as the first line. \`'0' == false\` → \`0 == 0\`. \`[1] == 1\` → \`'1' == 1\` → \`1 == 1\`. \`{}\` converts to "[object Object]".

**Puzzle 5 output:**
\`\`\`text
false
0.30000000000000004
true
false
0
NaN
\`\`\`
Floating-point math cannot store 0.1 and 0.2 exactly. Any non-empty string is truthy, even "false". Unary \`+\` converts to a number: "" → 0, "12px" → NaN (use \`parseInt\` for that).`,
      questions: [
        {
          q: 'What is the difference between == and ===?',
          a: '`===` compares value and type with no conversion. `==` converts the types first using coercion rules. Prefer `===`; the one common exception is `x == null`, which checks for both null and undefined.',
        },
        {
          q: 'Why is [] == ![] true?',
          a: '`![]` is false because arrays are truthy. Then `[] == false` → false becomes 0, `[]` becomes "" then 0, so `0 == 0` is true.',
        },
        {
          q: 'How do you compare 0.1 + 0.2 with 0.3 safely?',
          a: 'Compare with a tolerance: `Math.abs(a - b) < Number.EPSILON`. For money, store integer cents (or use a decimal library).',
        },
        {
          q: 'Which values are falsy?',
          a: '`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else, including `[]`, `{}` and "0", is truthy.',
        },
      ],
      spoken: `"For coercion puzzles I follow a few rules. Plus with any string concatenates; minus, times and divide always convert to numbers. Objects become strings first, so an empty array is an empty string and an object is the text 'object Object'. With double equals, booleans become numbers first, then objects become primitives, then strings become numbers. null only loosely equals undefined, and NaN equals nothing. In real code I use triple equals everywhere, except x == null when I want to catch both null and undefined."`,
      mistakes: [
        'Thinking `null == 0` is true. `null` is only loosely equal to `undefined` (and itself).',
        'Forgetting that `+` is evaluated left to right: `1 + 2 + \'3\'` is "33", not "123".',
        'Treating `"false"` or `"0"` as falsy. Every non-empty string is truthy.',
        'Follow-up trap: "What does {} + [] give?" Inside an expression it is "[object Object]"; typed as a statement in a console it can be `0` because `{}` is parsed as a block.',
      ],
      takeaway: '+ with a string concatenates, other operators convert to numbers, and == translates types — so use === by default.',
    },
    {
      id: 'objects-references',
      title: 'Output: Objects, References and Copies',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Objects are passed by sharing a reference: mutating through a copy of the reference changes the original, reassigning does not.',
      what: `**Primitives** (numbers, strings, booleans, null, undefined, symbols, bigints) are stored as plain values. Copying them copies the value.

**Objects** (including arrays and functions) live somewhere in memory, and a variable only holds a **reference** — like an address — to that object. Copying the variable copies the **address**, not the object.

The rules you must know:
- \`const b = a\` → \`a\` and \`b\` point to the **same** object. Change \`b.x\` and you see it in \`a.x\`.
- Inside a function, **mutating** a parameter (\`obj.x = 1\`) changes the caller's object. **Reassigning** it (\`obj = {}\`) only changes the local variable.
- \`{ ...obj }\` and \`Object.assign\` make a **shallow** copy: top-level values are copied, nested objects are still shared.
- \`===\` on objects compares **references**, not content. \`{} === {}\` is false.
- \`const\` stops reassignment, not mutation.

#### Deeper version
JavaScript is always **pass-by-value**, but for objects the value being passed is the reference. People call this **pass-by-sharing**. That is why reassigning a parameter never affects the caller.

Object keys can only be **strings or symbols**. If you use an object as a key in a normal object, it is converted to the string "[object Object]", so two different objects collide on the same key. Use a \`Map\` when keys must be objects. For a full independent copy, use \`structuredClone(obj)\` (built into modern browsers and Node 17+), which handles nested objects, Dates, Maps, Sets and circular references, but not functions.`,
      why: `This is the root of many React bugs: mutating state instead of creating a new object, so React does not re-render because the reference did not change. Interviewers ask these puzzles to check you understand references, shallow vs deep copies, and why immutability matters.`,
      analogy: `An object is a house. A variable holding it is a piece of paper with the house address. \`const b = a\` photocopies the paper, not the house. If you paint the house using either paper, both people see the new color. If you erase your paper and write a new address, the old house is not affected.`,
      code: [
        {
          title: 'Puzzle 1: two variables, one object',
          lang: 'javascript',
          code: `const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n);`,
        },
        {
          title: 'Puzzle 2: mutate vs reassign inside a function',
          lang: 'javascript',
          code: `function change(obj) {
  obj.n = 10;
  obj = { n: 20 };
  obj.n = 30;
}

const o = { n: 1 };
change(o);
console.log(o.n);`,
        },
        {
          title: 'Puzzle 3: spread is a shallow copy',
          lang: 'javascript',
          code: `const user = { name: 'Asha', address: { city: 'Pune' } };
const copy = { ...user };

copy.name = 'Ravi';
copy.address.city = 'Delhi';

console.log(user.name, user.address.city);`,
        },
        {
          title: 'Puzzle 4: objects as keys of a plain object',
          lang: 'javascript',
          code: `const k1 = { id: 1 };
const k2 = { id: 2 };
const store = {};

store[k1] = 'first';
store[k2] = 'second';

console.log(store[k1]);
console.log(Object.keys(store));`,
        },
        {
          title: 'Puzzle 5: comparing objects and const',
          lang: 'javascript',
          code: `console.log({} === {});
console.log([1] == [1]);

const x = {};
const y = x;
console.log(x === y);

const list = [1, 2];
list.push(3);
console.log(list);

try {
  list = [];
} catch (e) {
  console.log(e.name + ': ' + e.message);
}`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
2
\`\`\`
\`a\` and \`b\` hold the same reference. Changing the object through \`b\` is visible through \`a\`.

**Puzzle 2 output:**
\`\`\`text
10
\`\`\`
\`obj.n = 10\` mutates the caller's object. Then \`obj = { n: 20 }\` only points the **local** variable to a new object, so \`obj.n = 30\` changes that new object, not \`o\`.

**Puzzle 3 output:**
\`\`\`text
Asha Delhi
\`\`\`
Spread copies the top level, so \`name\` is independent. But \`address\` is a nested object: the copy holds the **same** reference, so changing the city changes the original.

**Puzzle 4 output:**
\`\`\`text
second
[ '[object Object]' ]
\`\`\`
Both objects are converted to the string "[object Object]", so they are the **same key**. The second assignment overwrites the first. Use a \`Map\` for object keys.

**Puzzle 5 output:**
\`\`\`text
false
false
true
[ 1, 2, 3 ]
TypeError: Assignment to constant variable.
\`\`\`
Two separate object literals are two different references. \`x\` and \`y\` share one reference. \`const\` allows \`push\` (mutation) but blocks \`list = []\` (reassignment).`,
      questions: [
        {
          q: 'Is JavaScript pass-by-value or pass-by-reference?',
          a: 'Always pass-by-value. For objects, the value passed is a reference, so mutation is shared but reassignment is not. This is called pass-by-sharing.',
        },
        {
          q: 'What is the difference between a shallow and a deep copy?',
          a: 'A shallow copy copies only the top level; nested objects are still shared. A deep copy copies every level, so nothing is shared. Use `structuredClone` for a deep copy.',
        },
        {
          q: 'Why does JSON.parse(JSON.stringify(obj)) not always work for deep copy?',
          a: 'It drops functions and `undefined`, turns Dates into strings, loses Map/Set, turns NaN/Infinity into null, and throws on circular references.',
        },
        {
          q: 'How does this relate to React?',
          a: 'React compares state by reference. If you mutate an object and set the same reference, React may skip the re-render. Always create a new object: `setUser({ ...user, name })`.',
        },
      ],
      spoken: `"For object puzzles I remember that a variable holds a reference, like an address, not the object itself. Assigning one variable to another copies the address, so both see mutations. Inside a function, mutating a parameter affects the caller, but reassigning it only changes the local variable, because JavaScript is pass-by-sharing. Spread and Object.assign are shallow, so nested objects stay shared. For a real deep copy I use structuredClone. This is also why in React I always return new objects instead of mutating state."`,
      mistakes: [
        'Thinking spread makes a deep copy. Nested objects and arrays are still shared.',
        'Expecting `obj = {...}` inside a function to change the caller\'s variable. It only rebinds the local parameter.',
        'Believing `const` makes an object immutable. Use `Object.freeze` for that (and it is shallow too).',
        'Follow-up trap: "Does Object.freeze freeze nested objects?" No. It is shallow; you need a recursive deep-freeze.',
      ],
      takeaway: 'Variables hold references to objects: mutation is shared, reassignment is local, and spread is only a shallow copy.',
    },
    {
      id: 'scope-shadowing',
      title: 'Output: Scope, Shadowing and Lexical Scope',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'let/const are block-scoped, var is function-scoped, inner names shadow outer ones, and functions see the scope where they were written.',
      what: `**Scope** is the area of code where a variable can be used.

The rules you must know:
- \`let\` and \`const\` live inside the nearest \`{ }\` **block**.
- \`var\` ignores blocks. It lives in the nearest **function** (or the global scope).
- **Shadowing**: an inner variable with the same name hides the outer one inside that inner scope.
- **Lexical scope**: a function looks up variables where it was **written**, not where it is **called**.
- Assigning to a name that was never declared (in non-strict mode) creates an **accidental global** variable.

#### Deeper version
Every scope has a link to its parent scope. Looking up a variable walks this **scope chain** from the inside out until it finds the name. This chain is fixed when the function is **defined** (lexical or static scope). JavaScript does not use dynamic scope, so the caller's local variables are invisible to the called function.

The classic \`var a = b = 10\` line is parsed as \`var a = (b = 10)\`. Only \`a\` is declared; \`b = 10\` assigns to an undeclared name, which creates a global in sloppy mode and throws a ReferenceError in **strict mode**. ES modules and classes are always strict, so the accidental-global behavior only appears in classic scripts and CommonJS files without \`'use strict'\`.`,
      why: `Scope questions show whether you can predict where a variable comes from. Real bugs include leaking \`var\` out of an \`if\` block, accidental globals from a missing \`let\`, and thinking a function can see the caller's variables.`,
      analogy: `Scopes are like rooms inside a house inside a city. When you look for something, you search your room first, then the house, then the city. If your room has its own "TV", you use it and never see the living-room TV (shadowing). And you always search **your own** house, not the house of whoever phoned you (lexical scope).`,
      code: [
        {
          title: 'Puzzle 1: block shadowing with let',
          lang: 'javascript',
          code: `let x = 1;
{
  let x = 2;
  console.log(x);
}
console.log(x);`,
        },
        {
          title: 'Puzzle 2: var leaks out of a block',
          lang: 'javascript',
          code: `if (true) {
  var y = 'inside';
  let z = 'block only';
}
console.log(y);
console.log(typeof z);`,
        },
        {
          title: 'Puzzle 3: var a = b = 10',
          lang: 'javascript',
          code: `(function () {
  var a = b = 10;
})();

console.log(typeof a);
console.log(typeof b);`,
        },
        {
          title: 'Puzzle 4: lexical scope, not call-site scope',
          lang: 'javascript',
          code: `const value = 'global';

function printValue() {
  console.log(value);
}

function run() {
  const value = 'local';
  printValue();
}

run();`,
        },
        {
          title: 'Puzzle 5: each closure gets its own scope',
          lang: 'javascript',
          code: `function makeCounter() {
  let count = 0;
  return {
    inc: () => ++count,
    get: () => count,
  };
}

const c1 = makeCounter();
const c2 = makeCounter();
c1.inc();
c1.inc();
c2.inc();
console.log(c1.get(), c2.get());`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
2
1
\`\`\`
The inner \`let x\` lives only inside the braces and shadows the outer one there. Outside, the outer \`x\` is untouched.

**Puzzle 2 output:**
\`\`\`text
inside
undefined
\`\`\`
\`var\` ignores the \`if\` block, so \`y\` is visible outside. \`z\` is block-scoped; outside the block it does not exist, and \`typeof\` on a missing name returns "undefined" without throwing.

**Puzzle 3 output:**
\`\`\`text
undefined
number
\`\`\`
It runs as \`var a = (b = 10)\`. \`a\` is local to the function, so it is gone outside. \`b\` was never declared, so it became an **accidental global**. In strict mode (or an ES module), this code throws \`ReferenceError: b is not defined\` instead.

**Puzzle 4 output:**
\`\`\`text
global
\`\`\`
\`printValue\` was **written** at the top level, so it looks up \`value\` there. The \`value\` inside \`run\` is invisible to it.

**Puzzle 5 output:**
\`\`\`text
2 1
\`\`\`
Each call to \`makeCounter\` creates a new \`count\` variable. \`c1\` and \`c2\` have separate, private counters. This is the module/private-state pattern.`,
      questions: [
        {
          q: 'What is the difference between function scope and block scope?',
          a: '`var` is function-scoped: it is visible in the whole function. `let`/`const` are block-scoped: they exist only inside the nearest `{ }`.',
        },
        {
          q: 'What is lexical scope?',
          a: 'A function resolves variables based on where it was written in the code, not where it is called. The scope chain is decided at definition time.',
        },
        {
          q: 'What is shadowing? Is it bad?',
          a: 'An inner variable with the same name as an outer one hides the outer one. It is legal, but it can confuse readers, so linters often warn about it (`no-shadow`).',
        },
        {
          q: 'How do you prevent accidental globals?',
          a: 'Use strict mode (`\'use strict\'`, or ES modules which are strict by default) and always declare with `let`/`const`. Linters also catch it.',
        },
      ],
      spoken: `"I treat scopes like nested boxes. let and const belong to the nearest block, var belongs to the nearest function, and when a name is used, JavaScript searches outward along the scope chain. Inner names shadow outer ones. The important part is that the chain is lexical: a function sees the variables where it was written, not where it's called. I also watch for the var a = b = 10 trap, where b becomes an accidental global in sloppy mode and throws in strict mode."`,
      mistakes: [
        'Thinking a called function can see the caller\'s local variables. Scope is lexical, not dynamic.',
        'Expecting `typeof z` outside its block to throw. Outside the block the name simply does not exist, so `typeof` returns "undefined".',
        'Forgetting that `var a = b = 10` only declares `a`.',
        'Follow-up trap: "What changes in strict mode for Puzzle 3?" It throws `ReferenceError: b is not defined`, because strict mode forbids assigning to undeclared variables.',
      ],
      takeaway: 'Block scope for let/const, function scope for var, and functions always look up variables where they were written.',
    },
    {
      id: 'array-quirks',
      title: 'Output: Array Quirks (sort, map(parseInt), holes, length)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Default sort compares strings, map passes (value, index, array), holes are skipped, and sort mutates the array.',
      what: `Arrays have a few built-in behaviors that surprise people.

The rules you must know:
- \`arr.sort()\` with no function converts items to **strings** and sorts alphabetically. So 10 comes before 5.
- \`sort\` changes (mutates) the original array and returns the **same** array.
- \`map\`, \`forEach\` and \`filter\` call your function with **three** arguments: \`(value, index, array)\`.
- \`parseInt(string, radix)\` takes a second argument, the **radix** (number base). That is why \`['1','2','3'].map(parseInt)\` breaks.
- An array can have **holes** (empty slots), like \`[1, , 3]\`. \`forEach\` and \`map\` skip them.
- Setting \`arr.length\` smaller cuts the array. Writing to a far index creates holes.

#### Deeper version
\`map(parseInt)\` calls \`parseInt('1', 0)\`, \`parseInt('2', 1)\`, \`parseInt('3', 2)\`. Radix 0 means "guess", so it is base 10 → 1. Radix 1 is invalid → NaN. In base 2 only the digits 0 and 1 exist, so "3" → NaN. Fix: \`map(Number)\` or \`map((s) => parseInt(s, 10))\`.

Holes are different from \`undefined\`: a hole means the index does not exist (\`1 in arr\` is false). Older methods (\`forEach\`, \`map\`, \`filter\`, \`reduce\`) skip holes, while newer ones like \`Array.from\`, spread, \`find\` and \`includes\` treat holes as \`undefined\`. \`indexOf\` uses \`===\`, so it cannot find NaN; \`includes\` uses **SameValueZero**, so it can. ES2023 added non-mutating versions: \`toSorted\`, \`toReversed\`, \`toSpliced\` and \`with\` (Node 20+, modern browsers).`,
      why: `Sorting numbers wrong is a real production bug (prices, scores, IDs). \`map(parseInt)\` is a favorite trick question that checks you know callback arguments. Mutation from \`sort\`/\`reverse\` matters in React because sorting state in place breaks re-renders.`,
      analogy: `Default \`sort\` is like sorting files in a folder by name: "file10" comes before "file5" because it compares character by character. To sort by size, you must give it a rule (a compare function).`,
      code: [
        {
          title: 'Puzzle 1: default sort on numbers',
          lang: 'javascript',
          code: `console.log([10, 1, 5, 100].sort());
console.log([10, 1, 5, 100].sort((a, b) => a - b));`,
        },
        {
          title: 'Puzzle 2: map with parseInt',
          lang: 'javascript',
          code: `console.log(['1', '2', '3'].map(parseInt));
console.log(['1', '2', '3'].map(Number));`,
        },
        {
          title: 'Puzzle 3: holes in arrays',
          lang: 'javascript',
          code: `const arr = [1, , 3];
console.log(arr.length);
arr.forEach((x) => console.log(x));
console.log(arr.map((x) => x * 2));
console.log(1 in arr);`,
        },
        {
          title: 'Puzzle 4: playing with length',
          lang: 'javascript',
          code: `const a = [1, 2, 3];
a.length = 1;
console.log(a);
a[4] = 5;
console.log(a.length);
console.log(a);`,
        },
        {
          title: 'Puzzle 5: sort mutates, indexOf vs includes',
          lang: 'javascript',
          code: `const nums = [3, 1, 2];
const sorted = nums.sort();
console.log(nums);
console.log(sorted === nums);

console.log([NaN].indexOf(NaN));
console.log([NaN].includes(NaN));

try {
  [].reduce((acc, x) => acc + x);
} catch (e) {
  console.log(e.name + ': ' + e.message);
}`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
[ 1, 10, 100, 5 ]
[ 1, 5, 10, 100 ]
\`\`\`
Without a compare function, numbers become strings: "1" < "10" < "100" < "5" alphabetically. With \`(a, b) => a - b\`, a negative result puts \`a\` first, so it sorts numerically.

**Puzzle 2 output:**
\`\`\`text
[ 1, NaN, NaN ]
[ 1, 2, 3 ]
\`\`\`
\`map\` passes the index as the second argument, which \`parseInt\` reads as the radix: \`parseInt('1', 0)\` → 1, \`parseInt('2', 1)\` → NaN (invalid base), \`parseInt('3', 2)\` → NaN (3 is not a binary digit). \`Number\` ignores extra arguments.

**Puzzle 3 output:**
\`\`\`text
3
1
3
[ 2, <1 empty item>, 6 ]
false
\`\`\`
The hole counts toward \`length\` but \`forEach\` skips it, and \`map\` keeps the hole in the result. \`1 in arr\` is false because index 1 does not exist. (A browser shows \`[2, empty, 6]\`.)

**Puzzle 4 output:**
\`\`\`text
[ 1 ]
5
[ 1, <3 empty items>, 5 ]
\`\`\`
Setting \`length = 1\` deletes everything after index 0. Writing to index 4 makes the length 5 and leaves indexes 1-3 as holes.

**Puzzle 5 output:**
\`\`\`text
[ 1, 2, 3 ]
true
-1
true
TypeError: Reduce of empty array with no initial value
\`\`\`
\`sort\` sorts **in place** and returns the same array. \`indexOf\` uses \`===\`, and \`NaN === NaN\` is false; \`includes\` uses SameValueZero, which matches NaN. \`reduce\` on an empty array with no initial value throws, so always pass one: \`reduce(fn, 0)\`.`,
      questions: [
        {
          q: 'Why does [10, 1, 5].sort() give [1, 10, 5]?',
          a: 'The default sort converts items to strings and compares them by UTF-16 code units, so "10" comes before "5". Pass `(a, b) => a - b` for numbers.',
        },
        {
          q: 'How do you sort without mutating the original array?',
          a: 'Use `[...arr].sort(fn)` or, in modern environments, `arr.toSorted(fn)`.',
        },
        {
          q: 'Explain ["1","2","3"].map(parseInt).',
          a: '`map` passes (value, index), so it calls `parseInt("1", 0)`, `parseInt("2", 1)`, `parseInt("3", 2)`, giving 1, NaN, NaN. Use `map(Number)`.',
        },
        {
          q: 'Is sort stable in JavaScript?',
          a: 'Yes. Since ES2019 the spec requires `Array.prototype.sort` to be stable: equal items keep their original order.',
        },
      ],
      spoken: `"With array puzzles I check three things. First, does the method mutate? sort, reverse and splice change the original array, which matters a lot for React state. Second, what arguments does the callback get? map passes value, index and array, which is why map with parseInt breaks: the index becomes the radix. Third, the default sort compares strings, so I always pass a compare function like a minus b for numbers. I also remember that holes are skipped by forEach and map, and that includes can find NaN but indexOf cannot."`,
      mistakes: [
        'Calling `.sort()` on numbers without a compare function.',
        'Sorting React state in place: `items.sort()` mutates state. Use `[...items].sort()` or `toSorted()`.',
        'Using `reduce` without an initial value; it throws on empty arrays and has a different first call.',
        'Follow-up trap: "What does the compare function need to return?" A negative number to put a first, positive to put b first, 0 to keep order. Returning a boolean (`a > b`) is a common bug.',
      ],
      takeaway: 'Default sort is alphabetical and in place, map passes (value, index, array), and holes are skipped by the classic methods.',
    },
    {
      id: 'this-puzzles',
      title: 'Output: this (Method Extraction, Arrow vs Regular, bind/call)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A regular function\'s this is decided by HOW it is called; an arrow function takes this from where it was written.',
      what: `\`this\` is a special keyword that points to "the object the function is working on".

For a **regular function**, \`this\` is decided **at call time**, by how you call it:
1. \`obj.method()\` → \`this\` is \`obj\` (the thing before the dot).
2. \`fn()\` with no dot → \`this\` is \`undefined\` in strict mode, or the global object in sloppy mode.
3. \`fn.call(x)\`, \`fn.apply(x)\`, \`fn.bind(x)\` → \`this\` is \`x\`.
4. \`new Fn()\` → \`this\` is the brand-new object.

An **arrow function** has **no own \`this\`**. It uses the \`this\` of the code around it, where it was **written**. \`call\`, \`apply\` and \`bind\` cannot change it.

#### Deeper version
"Method extraction" is the classic bug: \`const f = obj.method; f()\` loses the dot, so \`this\` is lost. The same thing happens when you pass a method as a callback: \`setTimeout(obj.method, 0)\` or \`button.addEventListener('click', obj.method)\`. Fixes: \`obj.method.bind(obj)\`, a wrapper arrow \`() => obj.method()\`, or class fields with arrow functions.

\`bind\` returns a new function with \`this\` locked forever. Binding it again does nothing: the first bind wins. Priority when several rules apply: \`new\` > explicit bind > \`call/apply\` > method call > default. Arrow functions sit outside this list because they never have their own \`this\`.

Environment note: at the top level, \`this\` is \`window\` in a browser classic script, \`module.exports\` (an empty object) in Node CommonJS, and \`undefined\` in ES modules. The outputs below come from Node CommonJS without strict mode.`,
      why: `\`this\` bugs appear everywhere: React class components (\`this.handleClick\` losing \`this\`), event handlers, callbacks passed to libraries, and timers. Interviewers want you to state the call-site rule clearly and know when arrows help.`,
      analogy: `A regular function is like the word "me" in a letter: who "me" is depends on **who reads it out loud** (who calls it). An arrow function is like a letter where the name was already **printed at the top** when it was written. It does not matter who reads it later.`,
      code: [
        {
          title: 'Puzzle 1: losing this by extracting a method',
          lang: 'javascript',
          code: `const user = {
  firstName: 'Asha',
  greet() {
    console.log('Hi ' + this.firstName);
  },
};

user.greet();
const greet = user.greet;
greet();`,
        },
        {
          title: 'Puzzle 2: arrow function as an object method',
          lang: 'javascript',
          code: `const obj = {
  firstName: 'Ravi',
  regular() {
    return this.firstName;
  },
  arrow: () => this.firstName,
};

console.log(obj.regular());
console.log(obj.arrow());`,
        },
        {
          title: 'Puzzle 3: nested function inside a method',
          lang: 'javascript',
          code: `const team = {
  teamName: 'Core',
  members: ['A', 'B'],
  showOld() {
    this.members.forEach(function (m) {
      console.log(m + ' of ' + this.teamName);
    });
  },
  showNew() {
    this.members.forEach((m) => {
      console.log(m + ' of ' + this.teamName);
    });
  },
};

team.showOld();
team.showNew();`,
        },
        {
          title: 'Puzzle 4: this inside setTimeout callbacks',
          lang: 'javascript',
          code: `const timer = {
  label: 'T1',
  start() {
    setTimeout(function () {
      console.log(this.label);
    }, 0);
    setTimeout(() => {
      console.log(this.label);
    }, 0);
  },
};

timer.start();`,
        },
        {
          title: 'Puzzle 5: call, apply and bind',
          lang: 'javascript',
          code: `function intro(greeting) {
  return greeting + ', I am ' + this.firstName;
}
const person = { firstName: 'Meera' };

console.log(intro.call(person, 'Hello'));
console.log(intro.apply(person, ['Hey']));

const bound = intro.bind(person);
console.log(bound.call({ firstName: 'Other' }, 'Hi'));

const twice = intro.bind({ firstName: 'First' }).bind({ firstName: 'Second' });
console.log(twice('Yo'));`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
Hi Asha
Hi undefined
\`\`\`
\`user.greet()\` has a dot, so \`this\` is \`user\`. \`greet()\` has no dot, so in sloppy mode \`this\` is the global object, which has no \`firstName\`. In **strict mode** or an ES module, \`this\` is \`undefined\` and it throws \`TypeError: Cannot read properties of undefined (reading 'firstName')\`.

**Puzzle 2 output:**
\`\`\`text
Ravi
undefined
\`\`\`
The arrow function takes \`this\` from the surrounding code, which is the **top level**, not \`obj\`. An object literal does not create a \`this\` scope. In Node CommonJS the top-level \`this\` is \`module.exports\` (\`{}\`); in a browser script it is \`window\`. Both lack \`firstName\`, so you get \`undefined\`. In an ES module, top-level \`this\` is \`undefined\`, so it would throw a TypeError.

**Puzzle 3 output:**
\`\`\`text
A of undefined
B of undefined
A of Core
B of Core
\`\`\`
The regular \`function (m)\` is called by \`forEach\` with no object, so its \`this\` is not \`team\`. The arrow function borrows \`this\` from \`showNew\`, which was called as \`team.showNew()\`. (Old fixes: \`const self = this\`, or pass \`this\` as the second argument of \`forEach\`.)

**Puzzle 4 output:**
\`\`\`text
undefined
T1
\`\`\`
The regular callback is called by the timer system, not by \`timer\`, so \`this.label\` is \`undefined\` (in Node, \`this\` is a Timeout object; in a browser, \`window\`). The arrow callback uses \`this\` from \`start\`, which is \`timer\`.

**Puzzle 5 output:**
\`\`\`text
Hello, I am Meera
Hey, I am Meera
Hi, I am Meera
Yo, I am First
\`\`\`
\`call\` passes arguments one by one, \`apply\` passes them as an array. A bound function ignores the \`this\` given by \`call\`. Binding twice does nothing: the **first** bind wins.`,
      questions: [
        {
          q: 'How is the value of this decided?',
          a: 'For regular functions, by the call site: `new` → new object; `call/apply/bind` → the given object; `obj.fn()` → `obj`; plain `fn()` → undefined (strict) or global. Arrow functions take `this` from the surrounding scope.',
        },
        {
          q: 'What is the difference between call, apply and bind?',
          a: '`call(thisArg, a, b)` and `apply(thisArg, [a, b])` invoke immediately. `bind(thisArg)` returns a new function with `this` fixed, to call later.',
        },
        {
          q: 'Why should you not use arrow functions as object methods?',
          a: 'Arrows do not get `this` from the object; they use the outer `this`. So `this.prop` inside an arrow method does not point to the object.',
        },
        {
          q: 'Can you change this of an arrow function with call or bind?',
          a: 'No. Arrow functions ignore the `thisArg` of `call`, `apply` and `bind`. Their `this` is fixed lexically.',
        },
      ],
      spoken: `"For a regular function, I look at the call site, not the definition. If there is a dot, this is the object before the dot. If it's called with call, apply or bind, this is whatever was passed. With new, it's the new object. A plain call with no dot gives undefined in strict mode or the global object in sloppy mode. Arrow functions are different: they have no own this and borrow it from where they were written. So I use arrows for callbacks inside methods, and regular methods on objects."`,
      mistakes: [
        'Using an arrow function as an object method and expecting `this` to be the object.',
        'Passing `obj.method` as a callback (to setTimeout, an event listener, or a promise `.then`) and losing `this`.',
        'Thinking `bind` can be overridden by a second `bind` or by `call`. The first bind wins (only `new` can override it).',
        'Follow-up trap: "What is this at the top level?" `window` in a browser classic script, `module.exports` in Node CommonJS, `undefined` in an ES module.',
      ],
      takeaway: 'Regular function: this = who calls it. Arrow function: this = where it was written. bind locks it for good.',
    },
    {
      id: 'event-loop-order',
      title: 'Output: Event Loop Order (setTimeout vs Promise vs queueMicrotask)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Synchronous code first, then ALL microtasks (promises, queueMicrotask), then ONE macrotask (setTimeout), then microtasks again.',
      what: `JavaScript runs on **one thread**: it does one thing at a time. The **event loop** decides what runs next.

There are three "lines" of work:
1. **Call stack** — the normal, synchronous code running right now.
2. **Microtask queue** — promise callbacks (\`.then\`, \`.catch\`, \`.finally\`), code after \`await\`, and \`queueMicrotask\`.
3. **Macrotask (task) queue** — \`setTimeout\`, \`setInterval\`, I/O, UI events.

The rule you must know: **run all synchronous code → empty the WHOLE microtask queue → run ONE macrotask → empty microtasks again → repeat.**

So \`Promise.then\` always beats \`setTimeout(fn, 0)\`.

#### Deeper version
- The function you pass to \`new Promise(executor)\` runs **synchronously**, right away. Only the \`.then\` callbacks are async.
- An \`async\` function runs synchronously **until its first \`await\`**. The rest of the function is scheduled as a microtask.
- Microtasks added while microtasks are running are run in the **same** drain, before any timer. (That means an endless chain of microtasks can freeze the page.)
- A \`setTimeout\` scheduled inside a microtask goes to the **end** of the timer queue.
- **Node only:** \`process.nextTick\` callbacks run in their own queue, which Node empties **before** the promise queue — when the current operation finishes. In a CommonJS file, \`nextTick\` prints before promises. In an ES module (\`.mjs\`), the top-level code itself runs inside a microtask, so the promise often prints first. Browsers render (paint) between macrotasks, never in the middle of the microtask drain.`,
      why: `Event loop ordering is one of the most common senior-level JavaScript questions. It proves you understand async code: why UI freezes, why state updates appear "late", and why a \`setTimeout(0)\` is not instant. Node interviews add \`process.nextTick\` and \`setImmediate\`.`,
      analogy: `A chef (the single thread) cooks the current order (sync code). Sticky notes on the counter are **urgent small tasks** (microtasks) — the chef does every sticky note before taking the next order, even new sticky notes added meanwhile. Orders waiting at the door (macrotasks like setTimeout) are taken **one at a time**, and after each order the chef checks the sticky notes again.`,
      code: [
        {
          title: 'Puzzle 1: the classic four lines',
          lang: 'javascript',
          code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
        },
        {
          title: 'Puzzle 2: queueMicrotask vs promise vs timeout',
          lang: 'javascript',
          code: `setTimeout(() => console.log('timeout'), 0);
queueMicrotask(() => console.log('microtask'));
Promise.resolve().then(() => console.log('promise'));
console.log('sync');`,
        },
        {
          title: 'Puzzle 3: the Promise executor is synchronous',
          lang: 'javascript',
          code: `console.log('A');

new Promise((resolve) => {
  console.log('B');
  resolve();
  console.log('C');
}).then(() => console.log('D'));

console.log('E');`,
        },
        {
          title: 'Puzzle 4: nested timers and promises',
          lang: 'javascript',
          code: `setTimeout(() => {
  console.log('t1');
  Promise.resolve().then(() => console.log('p inside t1'));
}, 0);

setTimeout(() => console.log('t2'), 0);

Promise.resolve().then(() => {
  console.log('p1');
  setTimeout(() => console.log('t inside p1'), 0);
});`,
        },
        {
          title: 'Puzzle 5: async function runs sync until await',
          lang: 'javascript',
          code: `async function run() {
  console.log('a');
  await null;
  console.log('b');
}

console.log('start');
run();
console.log('end');`,
        },
        {
          title: 'Puzzle 6 (Node only): process.nextTick vs promise',
          lang: 'javascript',
          code: `Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
1
4
3
2
\`\`\`
Sync logs first (1, 4). Then the microtask queue (3). Then the timer (2).

**Puzzle 2 output:**
\`\`\`text
sync
microtask
promise
timeout
\`\`\`
\`queueMicrotask\` and \`.then\` both go to the **same** microtask queue, so they run in the order they were added. The timeout runs last.

**Puzzle 3 output:**
\`\`\`text
A
B
C
E
D
\`\`\`
The executor runs immediately, so B and C are sync. \`resolve()\` does not stop the function, so C still prints. Only the \`.then\` callback (D) waits for the microtask queue.

**Puzzle 4 output:**
\`\`\`text
p1
t1
p inside t1
t2
t inside p1
\`\`\`
1. After the (empty) sync code, microtasks run: **p1**, which schedules a third timer at the end of the timer queue.
2. Take one timer: **t1**. It queues a microtask.
3. Microtasks are drained before the next timer: **p inside t1**.
4. Next timer: **t2**. Last timer: **t inside p1**.

**Puzzle 5 output:**
\`\`\`text
start
a
end
b
\`\`\`
\`run()\` runs synchronously until \`await\`, so "a" prints before "end". Everything after \`await\` is a microtask, so "b" prints after the sync code.

**Puzzle 6 output:**
\`\`\`text
sync
nextTick
promise
\`\`\`
In a Node **CommonJS** file, the \`nextTick\` queue is drained before the promise queue. Careful: if you run the same code as an **ES module** (\`.mjs\`), Node prints \`sync\`, \`promise\`, \`nextTick\`, because module code already runs inside the microtask phase. \`process.nextTick\` does not exist in browsers.`,
      questions: [
        {
          q: 'What is the difference between microtasks and macrotasks?',
          a: 'Microtasks (promise callbacks, await continuations, queueMicrotask) run right after the current sync code, and the whole queue is drained. Macrotasks (setTimeout, setInterval, I/O, events) run one per loop turn, with a full microtask drain after each.',
        },
        {
          q: 'Does setTimeout(fn, 0) run after 0 ms?',
          a: 'No. It means "at least 0 ms". It runs after the current code and all microtasks. Browsers also clamp nested timers to at least about 4 ms.',
        },
        {
          q: 'Is the function inside new Promise async?',
          a: 'No. The executor runs synchronously during `new Promise(...)`. Only `.then/.catch/.finally` callbacks are async.',
        },
        {
          q: 'Can microtasks block rendering?',
          a: 'Yes. The browser cannot paint until the microtask queue is empty. A promise chain that keeps adding microtasks can freeze the page, unlike chained setTimeouts which let the browser render between them.',
        },
      ],
      spoken: `"I solve event loop puzzles in passes. First pass: I print everything synchronous, remembering that a Promise executor and the start of an async function up to the first await are synchronous. Second pass: I drain the microtask queue — then callbacks, code after await, queueMicrotask — in the order they were queued, including any new microtasks they add. Third pass: I take one macrotask, like a setTimeout callback, run it, and drain microtasks again before the next timer. In Node, process.nextTick runs even before promises in CommonJS."`,
      mistakes: [
        'Thinking `new Promise(fn)` runs `fn` later. The executor is synchronous.',
        'Running all timers before the microtasks created inside the first timer. After **each** macrotask, the microtask queue is drained.',
        'Assuming `resolve()` works like `return`. Code after `resolve()` in the executor still runs.',
        'Follow-up trap: "setTimeout vs setImmediate in Node — which runs first?" From the main module it is not guaranteed (depends on timing). Inside an I/O callback, `setImmediate` always runs first.',
      ],
      takeaway: 'Sync code → all microtasks (promises, await, queueMicrotask) → one macrotask (setTimeout) → microtasks again.',
    },
    {
      id: 'promise-chaining',
      title: 'Output: Promise Chaining, catch, finally and Combinators',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Each .then returns a NEW promise with the value you return; a catch recovers the chain; finally passes the value through.',
      what: `A **promise** is an object that represents a value that will be ready later. You read the value with \`.then\`.

The rules you must know:
- Every \`.then\` / \`.catch\` / \`.finally\` returns a **new promise**. That is what makes chaining work.
- The value you **return** from a \`.then\` becomes the input of the next \`.then\`. No \`return\` → the next one gets \`undefined\`.
- A thrown error (or rejected promise) **skips** every \`.then\` until it reaches a \`.catch\`.
- After \`.catch\` handles an error, the chain is **healthy again**: the next \`.then\` runs with whatever \`catch\` returned.
- \`.finally\` gets no argument, and its return value is **ignored**: the original value or error passes through.
- \`.then\` with a non-function argument (like \`.then(2)\`) is ignored, and the value passes through.

#### Deeper version
If you return a **promise** (or any "thenable") from a \`.then\`, the chain waits for it and uses its result. This "unwrapping" costs extra microtask ticks (about two), which is why, in interleaving puzzles, a chain that returns \`Promise.resolve(x)\` falls behind a chain that returns plain values.

Two independent chains interleave: each \`.then\` callback is queued only when the previous step settles, so chains advance one step per round, like \`1, 3, 2, 4\`.

The combinators:
- \`Promise.all\` → all values in order, or rejects with the **first** error (fail-fast).
- \`Promise.allSettled\` → never rejects; gives \`{ status, value | reason }\` for each.
- \`Promise.race\` → settles like the **first** promise to settle (success or failure).
- \`Promise.any\` → first **success**; rejects with an \`AggregateError\` only if all fail.`,
      why: `Most real Node and React code is async. Interviewers check if you know where a value goes, where an error is caught, and why a missing \`return\` breaks a chain. The combinator differences come up when you design parallel API calls (for example, fetching a dashboard's widgets).`,
      analogy: `A promise chain is a relay race. Each runner (\`.then\`) receives the baton (value) from the one before and hands a baton to the next. If a runner falls (error), the next runners are skipped until the medic (\`.catch\`) helps; after that, the race continues. \`.finally\` is the cleaning crew: it does its job but never touches the baton.`,
      code: [
        {
          title: 'Puzzle 1: forgetting to return',
          lang: 'javascript',
          code: `Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => {
    console.log(x);
  })
  .then((x) => console.log(x));`,
        },
        {
          title: 'Puzzle 2: then with non-function arguments',
          lang: 'javascript',
          code: `Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then((v) => console.log(v));`,
        },
        {
          title: 'Puzzle 3: errors, recovery and finally',
          lang: 'javascript',
          code: `Promise.reject(new Error('boom'))
  .then(() => console.log('then 1'))
  .catch((e) => {
    console.log('caught ' + e.message);
    return 'recovered';
  })
  .then((v) => console.log('then 2 ' + v))
  .finally(() => console.log('finally'));`,
        },
        {
          title: 'Puzzle 4: finally passes values and errors through',
          lang: 'javascript',
          code: `Promise.resolve('A')
  .finally(() => 'B')
  .then((v) => console.log(v));

Promise.reject(new Error('X'))
  .finally(() => console.log('cleanup'))
  .catch((e) => console.log('caught ' + e.message));`,
        },
        {
          title: 'Puzzle 5: two chains interleave',
          lang: 'javascript',
          code: `Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2));

Promise.resolve()
  .then(() => console.log(3))
  .then(() => console.log(4));`,
        },
        {
          title: 'Puzzle 6: all, allSettled, any, race',
          lang: 'javascript',
          code: `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

(async () => {
  try {
    await Promise.all([1, Promise.resolve(2), Promise.reject(new Error('3 failed'))]);
  } catch (e) {
    console.log('all: ' + e.message);
  }

  const settled = await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error('no'))]);
  console.log(settled.map((r) => r.status));

  console.log('any: ' + (await Promise.any([Promise.reject(new Error('a')), Promise.resolve('b')])));
  console.log('race: ' + (await Promise.race([wait(20, 'slow'), wait(10, 'fast')])));
})();`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
2
undefined
\`\`\`
The second \`.then\` logs 2 but returns nothing, so the third \`.then\` receives \`undefined\`.

**Puzzle 2 output:**
\`\`\`text
1
\`\`\`
\`.then\` ignores anything that is not a function — even a promise. The original value 1 passes straight through to the last callback.

**Puzzle 3 output:**
\`\`\`text
caught boom
then 2 recovered
finally
\`\`\`
The rejection skips "then 1". \`catch\` handles it and returns "recovered", so the chain is fulfilled again. \`finally\` runs at the end.

**Puzzle 4 output:**
\`\`\`text
cleanup
A
caught X
\`\`\`
\`finally\`'s return value ("B") is ignored, so the next \`.then\` still gets "A". On the second chain, \`finally\` runs its cleanup and the error **keeps going** to \`catch\`. The order is about ticks: both \`finally\` callbacks run in the first round, then "A" and "caught X" come one round later.

**Puzzle 5 output:**
\`\`\`text
1
3
2
4
\`\`\`
Only the first \`.then\` of each chain is queued at the start. When 1 finishes, 2 is queued **behind** 3. Chains advance one step per round.

**Puzzle 6 output:**
\`\`\`text
all: 3 failed
[ 'fulfilled', 'rejected' ]
any: b
race: fast
\`\`\`
\`Promise.all\` rejects with the first error. \`allSettled\` reports every result. \`any\` ignores failures and takes the first success. \`race\` takes the first one to settle (the 10 ms promise).`,
      questions: [
        {
          q: 'What does .then return?',
          a: 'A new promise. It resolves with the value your callback returns, adopts the state of a promise you return, or rejects if your callback throws.',
        },
        {
          q: 'What is the difference between .then(success, failure) and .then(success).catch(failure)?',
          a: 'With two arguments, `failure` does not catch errors thrown inside `success`. With `.catch` at the end, errors from `success` are caught too.',
        },
        {
          q: 'Promise.all vs Promise.allSettled?',
          a: '`all` fails fast on the first rejection and gives only the error. `allSettled` waits for everything and gives the status of each — good for "show what loaded, report what failed".',
        },
        {
          q: 'Does Promise.all cancel the other promises when one fails?',
          a: 'No. Promises cannot be cancelled. The other operations keep running; their results are just ignored. Use AbortController to really cancel fetch calls.',
        },
      ],
      spoken: `"With promise chains I track the value step by step. Each then returns a new promise, and whatever I return becomes the next value — if I forget to return, the next step gets undefined. An error skips all thens until the nearest catch, and after the catch the chain continues normally with its return value. finally runs for both cases but passes the original value or error through. For interleaving puzzles I remember each chain advances one step per microtask round. And I pick all, allSettled, any or race based on whether I need fail-fast, every result, first success, or first settled."`,
      mistakes: [
        'Forgetting `return` inside `.then`, so the next step gets `undefined` (or the chain does not wait for an inner promise).',
        'Nesting `.then` inside `.then` instead of returning the inner promise and chaining flat.',
        'Thinking `.finally(() => newValue)` changes the result. It is ignored (unless `finally` throws or returns a rejected promise).',
        'Follow-up trap: "What happens to an unhandled rejection?" Browsers log an "Uncaught (in promise)" error; in Node 15+ an unhandled rejection crashes the process by default.',
      ],
      takeaway: 'Return values flow down the chain, errors jump to the nearest catch, catch recovers, finally passes things through.',
    },
    {
      id: 'destructuring-spread-getters',
      title: 'Output: Defaults, Destructuring, Spread and Getters',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Defaults apply only for undefined (not null), later spread keys win, and spread copies a getter\'s VALUE, not the getter.',
      what: `Modern syntax has small rules that puzzles love to test.

The rules you must know:
- **Default values** (\`function f(a = 10)\` or \`const { a = 1 } = obj\`) are used **only when the value is \`undefined\`**. \`null\`, \`0\` and \`''\` do **not** trigger the default.
- **Destructuring** pulls values out of objects/arrays: \`const { b: renamed } = obj\` renames; \`const [first, , third] = arr\` skips; \`...rest\` collects the remainder.
- **Spread** \`{ ...a, ...b }\` copies keys left to right, so **later keys win**, even if the later value is \`undefined\`.
- A **getter** (\`get balance() {}\`) runs code when you read a property. A **setter** runs when you assign one.
- Spreading an object **calls** its getters and copies the **result** as a plain value.

#### Deeper version
Default parameters are evaluated **at call time**, left to right, and can use earlier parameters: \`(a = 10, b = a * 2)\`. A function's \`.length\` counts only the parameters **before** the first one with a default.

Spread only copies **own, enumerable** properties. Spreading a string into an object gives index keys; spreading \`null\` or \`undefined\` into an object gives \`{}\` (no error), but spreading them into an **array** throws, because array spread needs an iterable.

Destructuring from \`undefined\` or \`null\` throws a TypeError, so nested destructuring needs a default for the parent: \`const { p: { q } = {} } = obj\`.`,
      why: `These features are everywhere in React and Node code: props with defaults, options objects merged with spread, config destructuring. A wrong assumption — like expecting \`null\` to use the default, or a spread to override "only if defined" — creates subtle bugs, so interviewers test it.`,
      analogy: `A default value is like a spare key under the mat: it is used **only if there is no key at all** (undefined). If someone gave you a broken key (null), you are stuck with the broken key.

Spread is like stacking transparent sheets: each sheet on top covers what is below it, even if the top sheet has an empty box written in that spot.`,
      code: [
        {
          title: 'Puzzle 1: default parameters',
          lang: 'javascript',
          code: `function f(a = 10, b = a * 2) {
  return [a, b];
}

console.log(f());
console.log(f(undefined, 5));
console.log(f(null));
console.log(f(0));
console.log(f.length);`,
        },
        {
          title: 'Puzzle 2: destructuring defaults and renaming',
          lang: 'javascript',
          code: `const { a = 1, b: renamed = 2, c = 3 } = { a: undefined, b: null };
console.log(a, renamed, c);`,
        },
        {
          title: 'Puzzle 3: spread order and odd values',
          lang: 'javascript',
          code: `const defaults = { theme: 'light', size: 'md' };
const opts = { ...defaults, theme: 'dark', ...{ size: undefined } };
console.log(opts);

console.log({ ...'hi' });
console.log({ ...null });
console.log([...'hi']);`,
        },
        {
          title: 'Puzzle 4: getters, setters and spread',
          lang: 'javascript',
          code: `const account = {
  _balance: 100,
  get balance() {
    console.log('getter ran');
    return this._balance;
  },
  set balance(v) {
    if (v < 0) {
      console.log('rejected');
      return;
    }
    this._balance = v;
  },
};

account.balance = -5;
console.log(account.balance);

const copy = { ...account };
copy._balance = 1;
console.log(copy.balance);`,
        },
        {
          title: 'Puzzle 5: swap, skip, rest and nested defaults',
          lang: 'javascript',
          code: `let x = 1;
let y = 2;
[x, y] = [y, x];
console.log(x, y);

const [first, , third = 'T', ...rest] = [1, 2, undefined, 4, 5];
console.log(first, third, rest);

const { p: { q } = {} } = {};
console.log(q);`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
[ 10, 20 ]
[ 10, 5 ]
[ null, 0 ]
[ 0, 0 ]
0
\`\`\`
Defaults kick in only for \`undefined\`. \`null\` is a real value, so \`a\` stays \`null\`, and \`null * 2\` is 0. \`0\` is also a real value. \`f.length\` is 0 because it counts parameters before the first default.

**Puzzle 2 output:**
\`\`\`text
1 null 3
\`\`\`
\`a\` is \`undefined\` → default 1. \`b\` is \`null\` → **no** default, \`renamed\` is \`null\`. \`c\` is missing → default 3.

**Puzzle 3 output:**
\`\`\`text
{ theme: 'dark', size: undefined }
{ '0': 'h', '1': 'i' }
{}
[ 'h', 'i' ]
\`\`\`
Later keys override earlier ones, **even with \`undefined\`**. Spreading a string into an object uses indexes as keys. Spreading \`null\` into an object is silently ignored.

**Puzzle 4 output:**
\`\`\`text
rejected
getter ran
100
getter ran
100
\`\`\`
The setter rejects -5, so the balance stays 100. Reading calls the getter. The spread **calls the getter once** and stores the plain value 100 in \`copy.balance\`. Changing \`copy._balance\` no longer affects it, because \`copy\` has no getter.

**Puzzle 5 output:**
\`\`\`text
2 1
1 T [ 4, 5 ]
undefined
\`\`\`
Array destructuring swaps without a temp variable. The empty slot skips index 1. Index 2 is \`undefined\`, so the default "T" is used. The nested default \`= {}\` prevents "Cannot read properties of undefined".`,
      questions: [
        {
          q: 'When does a default parameter apply?',
          a: 'Only when the argument is `undefined` (missing or passed as undefined). `null`, `0`, `false` and `""` are real values and skip the default.',
        },
        {
          q: 'How do you merge options so that undefined values do not override defaults?',
          a: 'Filter them first, for example `Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))`, then spread. Plain spread lets `undefined` override.',
        },
        {
          q: 'Does spread copy getters?',
          a: 'No. Spread reads each property, so getters run and their current value is copied as a normal data property. Use `Object.getOwnPropertyDescriptors` with `Object.defineProperties` to copy getters.',
        },
        {
          q: 'What is the difference between ?? and ||?',
          a: '`a || b` uses b for any falsy a (0, "", false too). `a ?? b` uses b only for null or undefined. So `0 ?? 5` is 0 but `0 || 5` is 5.',
        },
      ],
      spoken: `"For destructuring and default puzzles, my main rule is: defaults only apply to undefined. Null, zero and empty string are real values, so they stay. With spread, keys are copied left to right and later keys win, even if the later value is undefined — that's a common bug when merging config. Getters run when the property is read, and spread reads them, so a spread copy gets a frozen value, not the getter. For safe nested destructuring I add a default object for the parent so I don't crash on undefined."`,
      mistakes: [
        'Expecting `null` to trigger a default value. Use `??` when you also want to handle null.',
        'Destructuring a nested object without a parent default: `const { a: { b } } = {}` throws a TypeError.',
        'Assuming `{ ...defaults, ...opts }` ignores undefined values in `opts`. It does not.',
        'Follow-up trap: "Is object spread a deep merge?" No. Nested objects are replaced as a whole (and shared by reference), not merged.',
      ],
      takeaway: 'Defaults fill only undefined, later spread keys win, and spread turns getters into plain values.',
    },
    {
      id: 'prototypes-classes',
      title: 'Output: Prototypes and Classes',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Objects look up missing properties on their prototype chain; classes are syntax over prototypes with strict-mode methods.',
      what: `Every object has a hidden link to another object called its **prototype**. If you read a property that the object does not have, JavaScript looks at the prototype, then the prototype's prototype, and so on. This is the **prototype chain**. It ends at \`Object.prototype\`, whose prototype is \`null\`.

The rules you must know:
- \`new Person()\` creates an object whose prototype is \`Person.prototype\`.
- Methods on \`Person.prototype\` are **shared** by all instances, not copied.
- **Writing** a property always creates it on the object itself (**own property**). It **shadows** the prototype's property.
- \`class\` is mostly **syntax sugar** over this same prototype system.
- \`static\` methods live on the class itself, not on instances.

#### Deeper version
\`instanceof\` checks whether \`Constructor.prototype\` appears anywhere in the object's prototype chain **right now**. So if you replace \`Fn.prototype\` with a new object after creating an instance, the old instance is no longer \`instanceof Fn\`, and it does not see the new methods.

Classes differ from constructor functions in important ways: class code always runs in **strict mode** (so an extracted method has \`this === undefined\`); classes must be called with \`new\`; class declarations are in the TDZ; and in a subclass constructor you must call \`super()\` before using \`this\`. **Class fields** (\`count = 0\`, \`handle = () => {}\`) are created on each instance, so an arrow-function field captures the instance and is safe to pass as a callback, at the cost of one function per instance.`,
      why: `Prototypes explain how methods, inheritance, \`instanceof\` and even built-ins like \`Array.prototype.map\` work. Interviewers use these puzzles to check you understand what classes actually do under the hood, and the strict-mode \`this\` trap in class methods (very common in React class components).`,
      analogy: `The prototype is like a family recipe book. You do not copy the book into every kitchen; each kitchen just has a link to the shared book. If you write your own version of a recipe on your fridge (own property), you use yours first. If the family replaces the whole book with a new one, kitchens that still point to the old book keep using the old recipes.`,
      code: [
        {
          title: 'Puzzle 1: the prototype chain',
          lang: 'javascript',
          code: `function Person(name) {
  this.name = name;
}
Person.prototype.hi = function () {
  return 'Hi ' + this.name;
};

const p = new Person('Asha');
console.log(p.hi());
console.log(p.hasOwnProperty('hi'));
console.log(Object.getPrototypeOf(p) === Person.prototype);
console.log(Object.getPrototypeOf(Person.prototype) === Object.prototype);`,
        },
        {
          title: 'Puzzle 2: own properties shadow the prototype',
          lang: 'javascript',
          code: `function Car() {}
Car.prototype.wheels = 4;

const c1 = new Car();
const c2 = new Car();
c1.wheels = 3;
Car.prototype.wheels = 6;

console.log(c1.wheels, c2.wheels);
delete c1.wheels;
console.log(c1.wheels);`,
        },
        {
          title: 'Puzzle 3: replacing the prototype object',
          lang: 'javascript',
          code: `function Dog() {}
const d1 = new Dog();

Dog.prototype = {
  bark() {
    return 'woof';
  },
};
const d2 = new Dog();

console.log(typeof d1.bark, d2.bark());
console.log(d1 instanceof Dog, d2 instanceof Dog);`,
        },
        {
          title: 'Puzzle 4: classes, super and static',
          lang: 'javascript',
          code: `class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + ' makes a sound';
  }
  static create(name) {
    return new this(name);
  }
}

class Dog extends Animal {
  speak() {
    return super.speak() + ' (woof)';
  }
}

const d = Dog.create('Rex');
console.log(d.speak());
console.log(d instanceof Animal);
console.log(typeof d.create);

class Broken extends Animal {
  constructor() {
    this.x = 1;
  }
}
try {
  new Broken();
} catch (e) {
  console.log(e.name);
}`,
        },
        {
          title: 'Puzzle 5: methods vs arrow fields in a class',
          lang: 'javascript',
          code: `class Counter {
  count = 0;
  inc() {
    this.count++;
    return this.count;
  }
  incArrow = () => {
    this.count++;
    return this.count;
  };
}

const c = new Counter();
const { inc, incArrow } = c;

console.log(incArrow());
try {
  inc();
} catch (e) {
  console.log(e.name + ': ' + e.message);
}
console.log(Object.keys(c));`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
Hi Asha
false
true
true
\`\`\`
\`hi\` is not on \`p\` itself; it is found on \`Person.prototype\`. The chain is \`p → Person.prototype → Object.prototype → null\`.

**Puzzle 2 output:**
\`\`\`text
3 6
6
\`\`\`
\`c1.wheels = 3\` creates an **own** property on \`c1\` that shadows the prototype. \`c2\` has no own property, so it sees the live prototype value 6. After \`delete\`, \`c1\` falls back to the prototype again.

**Puzzle 3 output:**
\`\`\`text
undefined woof
false true
\`\`\`
\`d1\` still links to the **old** prototype object, which has no \`bark\`. \`instanceof\` checks the **current** \`Dog.prototype\`, which is not in \`d1\`'s chain, so it is false.

**Puzzle 4 output:**
\`\`\`text
Rex makes a sound (woof)
true
undefined
ReferenceError
\`\`\`
\`static create\` uses \`new this(name)\`; called as \`Dog.create\`, \`this\` is \`Dog\`, so we get a Dog. \`super.speak()\` calls the parent method. Static methods are not on instances, so \`d.create\` is \`undefined\`. A subclass constructor must call \`super()\` before touching \`this\`, otherwise it throws a ReferenceError ("Must call super constructor in derived class before accessing 'this'...").

**Puzzle 5 output:**
\`\`\`text
1
TypeError: Cannot read properties of undefined (reading 'count')
[ 'count', 'incArrow' ]
\`\`\`
The arrow field captured the instance when it was created, so it still works after extraction. \`inc\` is a prototype method; extracted, it is called with no object, and since class bodies are **strict**, \`this\` is \`undefined\`. Fields are own properties, but methods live on the prototype, so \`Object.keys\` shows only \`count\` and \`incArrow\`.`,
      questions: [
        {
          q: 'What is the prototype chain?',
          a: 'Each object links to a prototype object. Missing properties are looked up along that chain until `Object.prototype`, then `null`. This is how inheritance and shared methods work in JavaScript.',
        },
        {
          q: 'What is the difference between __proto__ and prototype?',
          a: '`prototype` is a property on constructor functions/classes: the object that new instances will link to. `__proto__` (better: `Object.getPrototypeOf(obj)`) is the actual link on an object.',
        },
        {
          q: 'Are classes in JavaScript real classes?',
          a: 'They are mostly syntax over prototypes, with extra rules: strict mode, must use `new`, TDZ hoisting, `super`, private `#fields` and static blocks.',
        },
        {
          q: 'Why would you use an arrow function class field?',
          a: 'To auto-bind `this`, so the method can be passed as a callback (like an onClick handler). The trade-off: each instance gets its own function, and it is not on the prototype (harder to override or mock).',
        },
      ],
      spoken: `"I think of prototypes as a lookup chain. When I read a property, JavaScript checks the object, then its prototype, and so on until Object.prototype. Writing a property always creates it on the object itself, which shadows the prototype. Classes are built on the same system: methods go on the prototype and are shared, while class fields are created on every instance. Two traps I watch for: class code is strict, so an extracted method has this undefined, and a subclass constructor must call super before using this."`,
      mistakes: [
        'Thinking methods are copied to each instance. Prototype methods are shared; only fields and constructor assignments are per instance.',
        'Using `for...in` and being surprised by inherited enumerable properties. Use `Object.keys` or check `hasOwnProperty` (or `Object.hasOwn`).',
        'Forgetting `super()` in a subclass constructor before using `this`.',
        'Follow-up trap: "How would you create an object with no prototype?" `Object.create(null)` — useful for safe dictionaries, because it has no inherited keys like `toString`.',
      ],
      takeaway: 'Property reads walk the prototype chain, writes create own properties, and classes are strict-mode syntax over prototypes.',
    },
    {
      id: 'implement-flatten',
      title: 'Implement: Flatten an Array (with depth)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Recursively copy items into a result array; when an item is an array and depth > 0, flatten it with depth - 1.',
      what: `**Problem:** write \`flatten(arr, depth)\` that works like the built-in \`Array.prototype.flat(depth)\`.

- \`flatten([1, [2, [3, [4]]], 5])\` → \`[1, 2, 3, 4, 5]\` (default depth: flatten everything)
- \`flatten([1, [2, [3, [4]]], 5], 1)\` → \`[1, 2, [3, [4]], 5]\` (only one level)

**Requirements:**
- Do not change (mutate) the input array.
- Support a \`depth\` argument (default \`Infinity\` in our version; the native \`flat()\` defaults to 1).
- Non-array items (numbers, strings, objects) are kept as they are.

The idea: walk through each item. If it is an array **and** we still have depth left, flatten it with one less depth and add its items. Otherwise add the item itself.

#### Deeper version
The recursive version is the cleanest answer, but very deep nesting (thousands of levels) can overflow the call stack, and \`result.push(...bigArray)\` can also hit the maximum argument limit for huge arrays. An **iterative** version uses your own stack instead of the call stack: pop an item, if it is an array push its children back, otherwise collect it. It handles any depth.

Small detail: the native \`flat()\` **removes holes** (\`[1, , 3].flat()\` → \`[1, 3]\`), while a \`for...of\` loop reads a hole as \`undefined\`. Use \`arr.forEach\` (which skips holes) if you want to match native behavior exactly.`,
      why: `Flatten is a warm-up favorite: it checks recursion, \`Array.isArray\`, and whether you can handle a parameter like depth cleanly. It also opens follow-ups about stack overflow and iterative solutions. In real work you flatten nested API data, menu trees and grouped results.`,
      analogy: `Imagine boxes inside boxes. You open the big box and take things out one by one. If a thing is a box and you are still allowed to open boxes (depth left), you open it too. If not, you put the closed box on the table as it is.`,
      code: [
        {
          title: 'Recursive solution with depth',
          lang: 'javascript',
          code: `function flatten(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      // open this box with one less level allowed
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
        },
        {
          title: 'Iterative solution (no recursion, any depth)',
          lang: 'javascript',
          code: `function flattenIterative(arr) {
  const stack = [...arr];
  const result = [];
  while (stack.length) {
    const next = stack.pop(); // take from the end
    if (Array.isArray(next)) {
      stack.push(...next); // put children back on the stack
    } else {
      result.push(next);
    }
  }
  return result.reverse(); // we collected from the end, so reverse
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `const input = [1, [2, [3, [4]]], 5];

console.log(flatten(input));
console.log(flatten(input, 1));
console.log(flatten(input, 2));
console.log(input.flat(1)); // native, for comparison
console.log(flattenIterative(input));
console.log(flatten(['a', ['b'], { c: [1] }]));
console.log(JSON.stringify(input)); // unchanged`,
        },
      ],
      output: `**Test output:**
\`\`\`text
[ 1, 2, 3, 4, 5 ]
[ 1, 2, [ 3, [ 4 ] ], 5 ]
[ 1, 2, 3, [ 4 ], 5 ]
[ 1, 2, [ 3, [ 4 ] ], 5 ]
[ 1, 2, 3, 4, 5 ]
[ 'a', 'b', { c: [ 1 ] } ]
[1,[2,[3,[4]]],5]
\`\`\`

**How it works, line by line:**
1. \`flatten(input)\` uses depth \`Infinity\`, so every nested array is opened.
2. With depth 1, only the first level is opened; \`[3, [4]]\` stays as one item. It matches native \`flat(1)\`.
3. Depth 2 opens two levels, so only \`[4]\` remains nested.
4. The iterative version gives the same full result without recursion.
5. Objects are not arrays, so \`{ c: [1] }\` is kept as is — we never look inside objects.
6. The input is unchanged because we always build a new \`result\` array.

**Complexity:** O(n) time, where n is the total number of items at all levels (each item is visited once). Extra space O(n) for the result, plus O(d) call-stack depth for the recursive version (d = nesting depth).`,
      questions: [
        {
          q: 'Can you write it with reduce?',
          a: '`const flat = (arr, d = Infinity) => arr.reduce((acc, x) => Array.isArray(x) && d > 0 ? acc.concat(flat(x, d - 1)) : acc.concat([x]), []);` — shorter, but `concat` creates new arrays each step, so it is slower for big inputs.',
        },
        {
          q: 'What is the risk with the recursive version?',
          a: 'Very deep nesting can cause "Maximum call stack size exceeded". The iterative version with an explicit stack avoids this.',
        },
        {
          q: 'How would you flatten a nested object into dot-notation keys?',
          a: 'Recurse over `Object.entries`, building keys like `prefix + "." + key`; when the value is a plain object recurse, otherwise set `result[fullKey] = value`. Same pattern, different container.',
        },
        {
          q: 'How would you match the native behavior for holes?',
          a: 'Use `arr.forEach` instead of `for...of`, because `forEach` skips holes, just like native `flat` removes them.',
        },
      ],
      spoken: `"I'd solve it recursively. I create a result array and loop through the input. If an item is an array and I still have depth left, I call flatten on it with depth minus one and push its items; otherwise I push the item itself. The default depth is Infinity so everything is flattened. It's O(n) time over all nested items, and it never mutates the input. If the interviewer worries about very deep nesting, I'd switch to an iterative version with my own stack, so I can't overflow the call stack."`,
      mistakes: [
        'Using `typeof item === \'object\'` to detect arrays. Objects would be treated as arrays; use `Array.isArray`.',
        'Forgetting to decrease depth in the recursive call, so depth has no effect.',
        'Mutating the input (for example with `splice`) instead of building a new array.',
        'Follow-up trap: "What is the default depth of native flat()?" It is 1, not Infinity. Use `flat(Infinity)` to flatten fully.',
      ],
      takeaway: 'Loop, and if the item is an array with depth left, recurse with depth - 1; otherwise push it — O(n), no mutation.',
    },
    {
      id: 'implement-memoize',
      title: 'Implement: memoize',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Wrap a function with a Map cache keyed by its arguments, so repeated calls with the same input return the saved result.',
      what: `**Problem:** write \`memoize(fn)\` that returns a new function. The first time it is called with some arguments it runs \`fn\` and **saves** (caches) the result. The next time it is called with the **same arguments**, it returns the saved result without running \`fn\` again.

**Requirements:**
- Works for any number of arguments.
- Keeps \`this\` (so it works on methods).
- Optional: let the caller give a custom **key resolver** function.

**Memoization** only makes sense for **pure functions**: the same input always gives the same output, with no side effects.

#### Deeper version
The tricky part is the **cache key**. \`JSON.stringify(args)\` is simple and works for numbers, strings and plain data, but it fails for functions, treats different object references with the same content as equal, and is slow for big objects. For a single object argument you can use a \`WeakMap\` keyed by the object reference (and it lets the object be garbage-collected). A resolver lets the caller decide: \`memoize(getUser, (id) => id)\`.

A memoized **recursive** function must call the memoized version of itself, otherwise only the outer call is cached. For async functions you can cache the **promise**, so parallel calls share one request — but delete the entry if the promise rejects, or you will cache the failure forever. Unbounded caches can leak memory, so real code adds a size limit (LRU) or a time-to-live.`,
      why: `Memoize tests closures (the cache lives in a closure), higher-order functions, and awareness of trade-offs (memory vs speed, cache keys). It is the idea behind React's \`useMemo\`, \`React.memo\`, and selector libraries like Reselect.`,
      analogy: `Memoization is like a student who writes answers in a notebook. When the teacher asks "what is 17 × 23?" the first time, the student calculates it and writes it down. The next time the same question comes, the student just reads the notebook.`,
      code: [
        {
          title: 'Solution',
          lang: 'javascript',
          code: `function memoize(fn, resolver) {
  const cache = new Map();

  return function memoized(...args) {
    // build a key from the arguments (or let the caller decide)
    const key = resolver ? resolver.apply(this, args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args); // keep "this" for methods
    cache.set(key, result);
    return result;
  };
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `let calls = 0;
const slowSquare = (n) => {
  calls++;
  return n * n;
};
const fastSquare = memoize(slowSquare);

console.log(fastSquare(4), fastSquare(4), fastSquare(5));
console.log('real calls:', calls);

// recursive: must call the memoized version
const fib = memoize((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(50));

// custom resolver: only the id matters
let fetches = 0;
const getUser = memoize(
  (id, opts) => {
    fetches++;
    return { id };
  },
  (id) => id
);
getUser(1, { a: 1 });
getUser(1, { a: 2 });
console.log('fetches:', fetches);`,
        },
      ],
      output: `**Test output:**
\`\`\`text
16 16 25
real calls: 2
12586269025
fetches: 1
\`\`\`

**How it works, line by line:**
1. \`fastSquare(4)\` → key "[4]" is not in the cache, so \`slowSquare\` runs and the result 16 is saved.
2. The second \`fastSquare(4)\` finds "[4]" in the cache and returns 16 without running \`slowSquare\`.
3. \`fastSquare(5)\` is a new key, so it runs. Total real calls: **2**.
4. \`fib(50)\` would take minutes without memoization (about 2^50 calls). With it, each \`n\` is computed once, so it is instant.
5. The resolver uses only \`id\`, so the second \`getUser(1, ...)\` is a cache hit even with different options.

**Complexity:** a cache hit is O(1) for the Map lookup, plus the cost of building the key (O(size of args) with \`JSON.stringify\`). Memory grows with the number of distinct inputs.`,
      questions: [
        {
          q: 'When should you NOT memoize?',
          a: 'When the function is impure (depends on time, random values, or external state), when inputs rarely repeat, or when the function is already cheap — the cache costs memory and key-building time.',
        },
        {
          q: 'How would you memoize an async function?',
          a: 'Cache the promise itself so concurrent calls share one request. Add `.catch(() => cache.delete(key))` so a failed request is not cached forever.',
        },
        {
          q: 'How do you stop the cache from growing forever?',
          a: 'Limit its size with an LRU policy, add a TTL (expire entries after some time), or use a `WeakMap` when keys are objects so entries disappear with the objects.',
        },
        {
          q: 'Why is JSON.stringify a weak cache key?',
          a: 'It cannot handle functions or circular objects, ignores `undefined` in objects, treats different objects with the same content as equal, and is slow for large inputs.',
        },
      ],
      spoken: `"Memoize returns a wrapper function that closes over a Map. On each call, I build a key from the arguments — by default JSON.stringify of the args, or a custom resolver if the caller provides one. If the key is in the cache I return the saved value; otherwise I call the original function with apply, so this is preserved, store the result and return it. It only works for pure functions. In production I'd also think about cache size limits, and for async functions I'd cache the promise but remove it on failure."`,
      mistakes: [
        'Memoizing impure functions (like ones using `Date.now()` or random values), so stale results are returned.',
        'In a recursive function, calling the original instead of the memoized version, so inner calls are not cached.',
        'Using `cache[key]` with a plain object and checking `if (cache[key])`: a cached `0`, `false` or `""` looks like a miss. Use `Map` and `has`.',
        'Follow-up trap: "What does React.memo memoize?" It memoizes a component render based on a shallow comparison of the previous props only (a cache of size one), not every input ever seen.',
      ],
      takeaway: 'Memoize = closure + Map cache keyed by the arguments; great for pure, expensive, repeated calls.',
    },
    {
      id: 'implement-curry',
      title: 'Implement: curry (fixed and variadic)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Collect arguments across calls until you have enough (fn.length), then call the original function; variadic curry stops on an empty call.',
      what: `**Currying** means turning \`f(a, b, c)\` into \`f(a)(b)(c)\`: a chain of functions that each take some arguments.

**Problem 1:** write \`curry(fn)\` so that, for \`add3 = (a, b, c) => a + b + c\`:
- \`curry(add3)(1)(2)(3)\`, \`curry(add3)(1, 2)(3)\` and \`curry(add3)(1)(2, 3)\` all return 6.

**Problem 2 (variadic):** write \`sum\` that takes **any** number of calls and stops on an empty call: \`sum(1)(2)(3)()\` → 6, \`sum(1, 2)(3, 4)()\` → 10.

The idea: keep **collecting arguments** in a closure. When you have enough (Problem 1) or you get an empty call (Problem 2), compute the answer.

#### Deeper version
For a fixed-arity curry, \`fn.length\` tells how many parameters the function declares. Careful: \`length\` does not count rest parameters (\`...args\`) or parameters after the first default value, so curry cannot work on such functions without an explicit arity argument.

A variadic curry cannot know when you are "done", so it needs a signal: an empty call \`()\`, or a conversion. The conversion trick makes the returned function also behave like a number by defining \`valueOf\` (or \`Symbol.toPrimitive\`): \`+sum(1)(2)(3)\` → 6. Each call should create a **new** function holding its own arguments, so partial results can be reused safely: \`const add5 = sum(5); add5(1)(); add5(2)();\`.`,
      why: `Currying checks closures, recursion, \`fn.length\`, and \`apply\`. It is used for **partial application** — making specialized functions from general ones, like \`const logError = log('error')\` — and in functional libraries (Lodash \`curry\`, Ramda). The \`sum(1)(2)(3)()\` version is a very common interview question.`,
      analogy: `Currying is like ordering a custom pizza at a counter. You say "large" (first call), then "thin crust" (second call), then "extra cheese" (third call). The cook writes each choice down and starts baking only when the order is complete.`,
      code: [
        {
          title: 'Fixed-arity curry',
          lang: 'javascript',
          code: `function curry(fn) {
  return function curried(...args) {
    // enough arguments? call the real function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // not yet: return a function that collects more
    return function (...next) {
      return curried.apply(this, [...args, ...next]);
    };
  };
}`,
        },
        {
          title: 'Variadic sum: stop on empty call (plus valueOf trick)',
          lang: 'javascript',
          code: `function sum(...args) {
  const total = args.reduce((a, b) => a + b, 0);
  return function next(...more) {
    if (more.length === 0) return total; // empty call -> done
    return sum(total, ...more);
  };
}

// Alternative: no empty call needed, convert with + or ==
function add(...args) {
  const fn = (...more) => add(...args, ...more);
  fn.valueOf = () => args.reduce((a, b) => a + b, 0);
  return fn;
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `const add3 = (a, b, c) => a + b + c;
const curriedAdd = curry(add3);

console.log(curriedAdd(1)(2)(3));
console.log(curriedAdd(1, 2)(3));
console.log(curriedAdd(1)(2, 3));
console.log(curriedAdd(1, 2, 3));

const addTen = curriedAdd(10);
console.log(addTen(1)(1), addTen(5, 5));

console.log(sum(1)(2)(3)());
console.log(sum(1, 2)(3, 4)());
const add5 = sum(5);
console.log(add5(1)(), add5(2)());

console.log(+add(1)(2)(3));
console.log(add(1, 2)(3) == 6);`,
        },
      ],
      output: `**Test output:**
\`\`\`text
6
6
6
6
12 20
6
10
6 7
6
true
\`\`\`

**How it works, line by line:**
1. \`add3.length\` is 3. \`curriedAdd(1)\` has 1 argument, so it returns a collector. Each later call adds arguments until there are 3, then \`add3\` runs.
2. Any grouping works — \`(1, 2)(3)\` or \`(1)(2, 3)\` — because we just count collected arguments.
3. \`addTen\` is a **partial application**: it remembers 10 and can be reused (12 and 20).
4. \`sum\` keeps a running total. A call with arguments returns a new function; an empty call returns the number.
5. \`add5\` is reused twice without the calls affecting each other, because each step creates new closures.
6. \`+add(...)\` and \`== 6\` force a number conversion, which calls our \`valueOf\`.

**Complexity:** each call is O(k) for copying k collected arguments; the final call is O(n) to add them up.`,
      questions: [
        {
          q: 'What is the difference between currying and partial application?',
          a: 'Currying turns an n-argument function into a chain of single-argument (or few-argument) calls. Partial application fixes some arguments now and returns a function for the rest. Our curry supports both styles.',
        },
        {
          q: 'Why does curry fail for (...args) => {} functions?',
          a: 'Rest parameters are not counted in `fn.length`, so length is 0 and the function is called immediately. Accept an explicit arity: `curry(fn, arity = fn.length)`.',
        },
        {
          q: 'How can sum(1)(2)(3) work without the final ()?',
          a: 'Return a function with a custom `valueOf` or `Symbol.toPrimitive`, so when it is used as a number (`+`, `==`, template math) it converts to the total.',
        },
        {
          q: 'Where is currying useful in real code?',
          a: 'Creating reusable, configured functions: `const logError = log("error")`, event handler factories like `handleChange("email")`, and composing functions in pipelines.',
        },
      ],
      spoken: `"For a fixed curry, I return a function that collects arguments. If the collected count reaches fn.length, I call the original with apply; otherwise I return another function that merges the old and new arguments and calls curried again. That lets any grouping work, like one, then two arguments. For the infinite sum version there's no length, so I need a stop signal: an empty call returns the total, or I can override valueOf so the function converts to a number. The key concept underneath is closures holding the collected arguments."`,
      mistakes: [
        'Storing arguments in one shared array outside the closure, so reusing a partial function mixes calls together.',
        'Forgetting that `fn.length` ignores rest and default parameters.',
        'Not handling several arguments per call (`curried(1, 2)(3)`), which interviewers often test.',
        'Follow-up trap: "What does console.log(add(1)(2)) print for the valueOf version?" It prints the function (for example `[Function: fn]`), not 6 — console.log does not call `valueOf`. You need `+` or `==` to convert.',
      ],
      takeaway: 'Curry = keep collecting arguments in a closure until you have enough (fn.length) or get an empty call.',
    },
    {
      id: 'implement-debounce',
      title: 'Implement: debounce',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Restart a timer on every call; run the function only after the calls stop for "delay" ms (with the latest arguments).',
      what: `**Debounce** means: "wait until the user **stops** doing something, then run once".

**Problem:** write \`debounce(fn, delay)\` that returns a new function. Every call **cancels** the previous timer and starts a new one. \`fn\` runs only when no new call has happened for \`delay\` milliseconds.

**Requirements:**
- Use the **latest** arguments.
- Keep \`this\` (so it works as a method).
- Bonus: a \`cancel()\` method, and a \`leading\` option (run on the first call instead of the last).

Classic use: a search box. Without debounce, typing "react" fires 5 API calls. With a 300 ms debounce, it fires **one** call after the user pauses.

#### Deeper version
The whole trick is a closure holding \`timerId\`. Each call does \`clearTimeout(timerId)\` and \`timerId = setTimeout(...)\`. To keep \`this\`, the returned function must be a **regular function** (not an arrow), and inside the timer we call \`fn.apply(this, args)\` from an arrow callback, which borrows \`this\` from the wrapper.

**Leading** mode runs immediately on the first call and then ignores calls until things are quiet for \`delay\` ms. **Trailing** (the default) runs at the end. Lodash supports both, plus \`maxWait\` (run at least every N ms even if calls never stop — that is basically throttle). In React, create the debounced function **once** (with \`useMemo\` or \`useRef\`), otherwise every render creates a new debounce with a new timer and it never works; and cancel it on unmount.`,
      why: `Debounce is one of the most asked implementation questions for frontend roles. It tests closures, timers, \`this\` and \`apply\`. It is also practical: search-as-you-type, auto-save, window resize handlers and form validation all use it.`,
      analogy: `An elevator door: every time someone walks in, the door timer restarts. The door closes (the function runs) only when nobody has entered for a few seconds.`,
      code: [
        {
          title: 'Solution (trailing, with cancel)',
          lang: 'javascript',
          code: `function debounce(fn, delay) {
  let timerId = null;

  function debounced(...args) {
    clearTimeout(timerId); // cancel the previous plan
    timerId = setTimeout(() => {
      timerId = null;
      fn.apply(this, args); // arrow keeps "this" of debounced
    }, delay);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
  };

  return debounced;
}`,
        },
        {
          title: 'Variant with a leading option',
          lang: 'javascript',
          code: `function debounceLeading(fn, delay) {
  let timerId = null;
  return function (...args) {
    if (timerId === null) {
      fn.apply(this, args); // first call in a burst runs now
    }
    clearTimeout(timerId);
    // stay "busy" until calls stop for delay ms
    timerId = setTimeout(() => {
      timerId = null;
    }, delay);
  };
}`,
        },
        {
          title: 'Tests (simulated typing)',
          lang: 'javascript',
          code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const search = debounce((q) => console.log('search: ' + q), 100);
  search('r');
  await sleep(30);
  search('re');
  await sleep(30);
  search('rea');
  await sleep(200); // pause -> fires once with latest value
  search('react');
  await sleep(200);

  const save = debounce(() => console.log('saved'), 50);
  save();
  save.cancel();
  await sleep(100); // nothing printed: cancelled

  const box = {
    name: 'box',
    log: debounce(function () {
      console.log('this.name = ' + this.name);
    }, 20),
  };
  box.log();
  await sleep(50);

  const click = debounceLeading((n) => console.log('leading: ' + n), 100);
  click(1);
  click(2);
  click(3);
  await sleep(200);
  click(4);
}

main();`,
        },
      ],
      output: `**Test output:**
\`\`\`text
search: rea
search: react
this.name = box
leading: 1
leading: 4
\`\`\`

**How it works, line by line:**
1. \`search('r')\` starts a 100 ms timer. 30 ms later, \`search('re')\` **clears** it and starts a new one. Same for "rea".
2. Then nobody calls for 200 ms, so the last timer fires with the **latest** args: "search: rea". "r" and "re" never run.
3. "react" is a new burst after a pause, so it fires on its own.
4. \`save.cancel()\` clears the pending timer, so "saved" never prints.
5. \`box.log()\` is called as a method. The wrapper is a regular function, so \`this\` is \`box\`, and \`fn.apply(this, args)\` passes it on.
6. Leading mode: \`click(1)\` runs immediately; 2 and 3 are inside the quiet window and ignored. After 200 ms of silence, \`click(4)\` runs immediately again.

**Complexity:** O(1) time and memory per call — just one timer at a time.`,
      questions: [
        {
          q: 'What is the difference between debounce and throttle?',
          a: 'Debounce waits for a pause and runs once at the end (or start). Throttle runs at most once every N ms during continuous activity. Search box → debounce; scroll/resize tracking → throttle.',
        },
        {
          q: 'How do you add a leading option?',
          a: 'If no timer is active, call `fn` immediately. Always reset the timer; when it fires, just clear the "busy" state (and optionally call `fn` again with the latest args if trailing is also enabled and calls happened).',
        },
        {
          q: 'How do you use debounce correctly in React?',
          a: 'Create it once: `const debounced = useMemo(() => debounce(save, 300), [])` (or keep it in a ref), and call `debounced.cancel()` in a `useEffect` cleanup on unmount. Creating it inside the render body makes a new timer each render.',
        },
        {
          q: 'How would you return a promise with the result?',
          a: 'Keep the pending resolvers; when the timer fires, run `fn`, then resolve all pending promises with the result (or resolve only the latest one). Lodash does not do this; libraries like p-debounce do.',
        },
      ],
      spoken: `"Debounce returns a wrapper that closes over a timer id. Every time the wrapper is called, I clear the existing timer and set a new one for the delay. So the real function only runs when calls stop for that long, and it gets the latest arguments. I make the wrapper a regular function and call fn.apply with this and args inside an arrow callback, so it works on methods too. I usually add a cancel method, and a leading option if the action should fire on the first event, like preventing double submits."`,
      mistakes: [
        'Using an arrow function for the returned wrapper and then losing `this` when it is used as a method.',
        'Forgetting `clearTimeout`, which turns it into a plain delay where every call still runs.',
        'Creating the debounced function inside a React component body, so each render gets a new timer and debounce never works.',
        'Follow-up trap: "What happens to the results of skipped calls?" They are simply dropped. Only the last call\'s arguments are used, so do not debounce actions where every call matters (like analytics events), unless you batch them.',
      ],
      takeaway: 'Debounce = clear the timer and start a new one on every call; run once after the calls stop.',
    },
    {
      id: 'implement-throttle',
      title: 'Implement: throttle',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Run at most once per interval: run now if enough time passed, otherwise schedule one trailing call with the latest arguments.',
      what: `**Throttle** means: "run at most **once every N milliseconds**, no matter how many times you are called".

**Problem:** write \`throttle(fn, interval)\`. If calls happen continuously (like scroll events, 60+ per second), \`fn\` should run at a steady, limited rate.

**Requirements:**
- The first call runs immediately (**leading**).
- Calls inside the interval are not lost forever: the **latest** one runs at the end of the interval (**trailing**), so the final state is never missed.
- Keep \`this\` and arguments.

#### Deeper version
The simplest throttle uses a timestamp: \`if (now - last >= interval) { last = now; fn() }\`. It is leading-only, so the **last** call in a burst can be dropped — bad for "save final scroll position" style use cases.

The full version combines a timestamp with one pending timer:
1. Compute \`remaining = interval - (now - lastRun)\`.
2. If \`remaining <= 0\`, run now and record the time.
3. Otherwise, if no timer is pending, schedule one for \`remaining\` ms that runs with the **latest** saved arguments.
4. Later calls in the window only update the saved arguments.

For animations, \`requestAnimationFrame\` throttling (at most once per frame) is often better than a fixed millisecond interval.`,
      why: `Throttle is the partner question to debounce. Interviewers want you to explain the difference and implement it with correct timing. Real uses: scroll and resize handlers, mouse-move tracking, infinite scroll checks, rate-limiting button spam, and progress updates.`,
      analogy: `A security guard lets **one** person through the gate every 10 seconds. If many people arrive, the first goes in right away, and the guard remembers the **most recent** person waiting and lets them in when the 10 seconds are up. Everyone else in between is turned away.`,
      code: [
        {
          title: 'Simple throttle (leading only)',
          lang: 'javascript',
          code: `function throttleSimple(fn, interval) {
  let lastRun = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn.apply(this, args);
    }
  };
}`,
        },
        {
          title: 'Full throttle (leading + trailing)',
          lang: 'javascript',
          code: `function throttle(fn, interval) {
  let lastRun = 0;
  let timerId = null;
  let lastArgs;
  let lastThis;

  return function throttled(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastRun);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      // enough time passed: run right now
      clearTimeout(timerId);
      timerId = null;
      lastRun = now;
      fn.apply(this, args);
    } else if (timerId === null) {
      // inside the window: schedule ONE trailing call
      timerId = setTimeout(() => {
        lastRun = Date.now();
        timerId = null;
        fn.apply(lastThis, lastArgs); // latest arguments
      }, remaining);
    }
  };
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const simple = throttleSimple((x) => console.log('simple: ' + x), 100);
  simple('a');
  await sleep(10);
  simple('b');
  await sleep(20);
  simple('c');
  await sleep(250);
  simple('d');

  await sleep(50);

  const full = throttle((x) => console.log('full: ' + x), 100);
  full('a');
  await sleep(10);
  full('b');
  await sleep(20);
  full('c');
  await sleep(250);
  full('d');
}

main();`,
        },
      ],
      output: `**Test output:**
\`\`\`text
simple: a
simple: d
full: a
full: c
full: d
\`\`\`

**How it works, line by line:**
1. Simple: "a" runs immediately. "b" (10 ms) and "c" (30 ms) are inside the 100 ms window and are **dropped**. "d" comes after the window, so it runs.
2. Full: "a" runs immediately (leading).
3. "b" arrives inside the window, so a trailing timer is scheduled for the rest of the window (about 90 ms).
4. "c" also arrives inside the window. A timer already exists, so we only save "c" as the latest arguments.
5. At ~100 ms the timer fires with the **latest** args: "full: c". Nothing is lost at the end of the burst.
6. "d" comes long after, so it runs immediately.

**Complexity:** O(1) time and memory per call.`,
      questions: [
        {
          q: 'When do you use throttle instead of debounce?',
          a: 'When you need regular updates during continuous activity: scroll position, resize layout, drag, mouse tracking. Debounce would wait until the activity stops, which feels laggy there.',
        },
        {
          q: 'Why add a trailing call?',
          a: 'Without it, the last event in a burst can be dropped, so the UI ends in a stale state (for example, the final scroll position is never processed).',
        },
        {
          q: 'How would you throttle with requestAnimationFrame?',
          a: 'Keep a flag: if a frame is not already scheduled, call `requestAnimationFrame(() => { scheduled = false; fn(...latestArgs) })`. This runs at most once per frame, synced with painting.',
        },
        {
          q: 'How would you add leading/trailing options?',
          a: 'With `leading: false`, set `lastRun = now` on the first call instead of running, so it waits for the trailing timer. With `trailing: false`, never schedule the timer — that is the simple version.',
        },
      ],
      spoken: `"Throttle limits a function to once per interval. My version keeps the time of the last run and at most one pending timer. On each call I compute how much of the interval is left. If none is left, I run immediately and save the time. If we're still inside the window, I save the latest arguments and, if no timer is pending, schedule one for the remaining time. That gives a leading call for responsiveness and a trailing call so the final event is never lost. I use it for scroll and resize handlers."`,
      mistakes: [
        'Mixing up throttle and debounce. Debounce waits for silence; throttle fires at a steady rate during activity.',
        'Writing a leading-only throttle and losing the final event of a burst.',
        'Scheduling a new timer on every call inside the window, which creates many trailing calls.',
        'Follow-up trap: "Is setTimeout timing exact?" No. Timers fire after at least the delay; a busy main thread or background tab throttling can delay them, so throttle intervals are approximate.',
      ],
      takeaway: 'Throttle = at most one run per interval: run now if the window passed, else schedule one trailing run with the latest args.',
    },
    {
      id: 'classic-one-liners',
      title: 'Output: Classic Trick One-Liners (baNaNa, chained assignment, generators)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Small famous tricks: Math.max() is -Infinity, trailing commas, a.x = a = {}, sloppy-mode arguments, named function expressions and generator next(value).',
      what: `Some puzzles do not fit one theme. They test small, famous rules. The ones you must know:

- \`Math.max()\` with no arguments is **-Infinity**, and \`Math.min()\` is **Infinity** (the "starting value" before any comparison).
- A **trailing comma** in an array literal does not add an item: \`[, , ,]\` has length 3, not 4.
- Unary \`+\` converts to a number: \`+'a'\` is \`NaN\`. That is the "baNaNa" trick.
- In \`a.x = a = { n: 2 }\`, the left side \`a.x\` is decided **before** the right side runs, so it writes to the **old** object.
- The **name** of a named function expression (\`const fn = function foo() {}\`) is visible only **inside** that function.
- A **generator** (\`function*\`) pauses at each \`yield\`. The value you pass to \`next(value)\` becomes the result of the **previous** \`yield\`.

#### Deeper version
**Assignment order:** JavaScript evaluates the **target reference** of an assignment from left to right before evaluating the value. In \`a.x = a = { n: 2 }\`, the engine first remembers "property x of the object a points to now", then runs \`a = { n: 2 }\`, then writes the new object into \`x\` of the **old** object. So the old object (still reachable as \`b\`) gets \`x\`, and the new \`a\` does not.

**arguments mapping:** in sloppy mode, for functions with simple parameters (no defaults, rest or destructuring), \`arguments[0]\` and the first parameter are **linked**: changing one changes the other. In strict mode, or with any default/rest parameter, they are independent. Arrow functions have no \`arguments\` at all.

**Generators:** the first \`next()\` runs until the first \`yield\`; its argument is ignored because no \`yield\` is waiting yet. Each later \`next(v)\` resumes and makes the paused \`yield\` expression evaluate to \`v\`.`,
      why: `These are the "gotcha" questions that appear in quick screening rounds and online tests. Each one checks a real rule: evaluation order, coercion, scope of function names, and how generators communicate (the idea behind async/await and Redux-Saga).`,
      analogy: `\`a.x = a = { n: 2 }\` is like writing a delivery label first ("to: the house on Main Street"), then the family moves to a new house, and the parcel is still delivered to the **old** house on Main Street. The label was decided before they moved.`,
      code: [
        {
          title: 'Puzzle 1: Math.max(), trailing commas and baNaNa',
          lang: 'javascript',
          code: `console.log(Math.max(), Math.min());
console.log([, , ,].length);
console.log('b' + 'a' + +'a' + 'a');`,
        },
        {
          title: 'Puzzle 2: chained assignment',
          lang: 'javascript',
          code: `let a = { n: 1 };
const b = a;

a.x = a = { n: 2 };

console.log(a.x);
console.log(b.x);`,
        },
        {
          title: 'Puzzle 3: arguments and delete on arrays',
          lang: 'javascript',
          code: `function f(x) {
  arguments[0] = 99;
  return x;
}
console.log(f(1));

const arr = [1, 2, 3];
delete arr[1];
console.log(arr, arr.length);`,
        },
        {
          title: 'Puzzle 4: named function expressions',
          lang: 'javascript',
          code: `const fn = function foo() {
  return typeof foo;
};

console.log(fn());
console.log(typeof foo);
console.log(fn.name);`,
        },
        {
          title: 'Puzzle 5: generators and next(value)',
          lang: 'javascript',
          code: `function* gen() {
  const x = yield 1;
  console.log('got ' + x);
  yield x * 2;
}

const g = gen();
console.log(g.next('ignored').value);
console.log(g.next(5).value);
console.log(g.next().done);`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
-Infinity Infinity
3
baNaNa
\`\`\`
\`Math.max\` starts from -Infinity and looks for something bigger; with no arguments nothing is bigger. The last comma in \`[, , ,]\` is a trailing comma, so there are 3 holes. \`+'a'\` is NaN, which becomes the text "NaN" when joined: "ba" + "NaN" + "a".

**Puzzle 2 output:**
\`\`\`text
undefined
{ n: 2 }
\`\`\`
The target \`a.x\` was locked to the **old** object before \`a\` was reassigned. So the old object (\`b\`) gets \`x = { n: 2 }\`, and the new \`a\` has no \`x\`.

**Puzzle 3 output:**
\`\`\`text
99
[ 1, <1 empty item>, 3 ] 3
\`\`\`
In sloppy mode with simple parameters, \`arguments[0]\` and \`x\` are linked, so \`x\` becomes 99 (in strict mode it would return 1). \`delete\` on an array leaves a **hole** and does not change the length — use \`splice\` to really remove an item.

**Puzzle 4 output:**
\`\`\`text
function
undefined
foo
\`\`\`
The name \`foo\` exists only inside the function body (useful for recursion). Outside, there is no \`foo\`. The function's \`.name\` is "foo".

**Puzzle 5 output:**
\`\`\`text
1
got 5
10
true
\`\`\`
The first \`next\` runs to \`yield 1\` (its argument is ignored). \`next(5)\` resumes, so \`x\` is 5; it logs "got 5" and yields 10. The last \`next\` finishes the function, so \`done\` is true.`,
      questions: [
        {
          q: 'Why is Math.max() -Infinity?',
          a: 'It is the identity value for "maximum": any real number compared with -Infinity wins. With no arguments, nothing replaces it.',
        },
        {
          q: 'How do you remove an item from an array correctly?',
          a: 'Use `arr.splice(index, 1)` (mutates) or `arr.filter((_, i) => i !== index)` / `arr.toSpliced(index, 1)` (new array). `delete` leaves a hole.',
        },
        {
          q: 'What is a generator used for?',
          a: 'Lazy sequences (produce values on demand), custom iterators, and pausing/resuming logic. Async/await was built on the same idea, and libraries like Redux-Saga use generators.',
        },
        {
          q: 'Do arrow functions have arguments?',
          a: 'No. They use the `arguments` of the nearest regular function. Use rest parameters `(...args)` instead.',
        },
      ],
      spoken: `"For these one-liner tricks I slow down and apply the exact rule rather than guessing. Math.max with no input is minus Infinity because that's its starting value. A trailing comma doesn't create an element. Unary plus on a letter gives NaN, which is the baNaNa joke. For chained assignment, I remember the left-hand target is resolved first, so a.x writes to the old object. And with generators, the value passed to next becomes the result of the yield that was waiting, so the first next's argument is ignored."`,
      mistakes: [
        'Counting the trailing comma as an extra element: `[1, 2, 3,].length` is 3.',
        'Thinking `a.x = a = {...}` sets `x` on the new object.',
        'Using `delete arr[i]` to remove an array item.',
        'Follow-up trap: "What does console.log(0.1 * 3) print?" 0.30000000000000004 — the same floating-point issue as 0.1 + 0.2.',
      ],
      takeaway: 'Apply the exact rule: identity values, left-to-right assignment targets, local function-expression names, and next(value) feeding the previous yield.',
    },
    {
      id: 'implement-array-polyfills',
      title: 'Implement: map, filter and reduce Polyfills',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Add methods to Array.prototype that loop over existing indexes, call the callback with (value, index, array), and handle reduce\'s optional initial value.',
      what: `A **polyfill** is your own implementation of a built-in feature (originally used to add new features to old browsers).

**Problem:** write \`myMap\`, \`myFilter\` and \`myReduce\` on \`Array.prototype\` so they behave like the real methods.

**Requirements:**
- Do not mutate the original array; return a new array (map, filter) or a single value (reduce).
- Call the callback with **(value, index, array)**. map/filter also accept a \`thisArg\`.
- Skip **holes** like the real methods (\`index in array\`).
- \`reduce\`: if no initial value is given, use the **first element** as the start and begin from the second. If the array is empty and there is no initial value, throw a TypeError.

#### Deeper version
Inside a method on \`Array.prototype\`, \`this\` is the array the method was called on, so these must be **regular functions**, not arrows. To detect "no initial value" you cannot check \`initial === undefined\` (someone may pass \`undefined\` on purpose); check \`arguments.length < 2\` instead.

The real \`map\` creates a result with the **same length** and leaves holes where the source had holes. Reading the length **once** before the loop means items pushed during the loop are not visited — the spec does the same.

In real projects, avoid modifying built-in prototypes (it can clash with future standard methods — the famous "SmooshGate" issue with \`Array.prototype.flatten\`). In an interview, it is the expected format.`,
      why: `Polyfill questions check that you truly understand the methods you use every day, plus \`this\`, prototypes and edge cases (holes, empty reduce, thisArg). They are among the most common JavaScript machine-coding warm-ups.`,
      analogy: `\`map\` is a photocopier with a filter: each page goes in, a changed page comes out, same number of pages. \`filter\` is a bouncer: only pages that pass the check get through. \`reduce\` is a blender: all pages go in and one smoothie comes out.`,
      code: [
        {
          title: 'Solution',
          lang: 'javascript',
          code: `Array.prototype.myMap = function (callback, thisArg) {
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      // skip holes
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};

Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

Array.prototype.myReduce = function (callback, initialValue) {
  const len = this.length;
  let i = 0;
  let acc;

  if (arguments.length >= 2) {
    acc = initialValue;
  } else {
    // no initial value: start with the first existing element
    while (i < len && !(i in this)) i++;
    if (i >= len) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[i];
    i++;
  }

  for (; i < len; i++) {
    if (i in this) acc = callback(acc, this[i], i, this);
  }
  return acc;
};`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `const nums = [1, 2, 3, 4];

console.log(nums.myMap((n) => n * 2));
console.log(nums.myMap((n, i) => n + i));
console.log(nums.myFilter((n) => n % 2 === 0));
console.log(nums.myReduce((sum, n) => sum + n, 0));
console.log(nums.myReduce((sum, n) => sum + n));
console.log([[1], [2, 3]].myReduce((acc, arr) => acc.concat(arr), []));

const multiplier = { factor: 10 };
console.log(nums.myMap(function (n) { return n * this.factor; }, multiplier));

console.log([1, , 3].myMap((n) => n * 2));

try {
  [].myReduce((a, b) => a + b);
} catch (e) {
  console.log(e.name + ': ' + e.message);
}
console.log(nums);`,
        },
      ],
      output: `**Test output:**
\`\`\`text
[ 2, 4, 6, 8 ]
[ 1, 3, 5, 7 ]
[ 2, 4 ]
10
10
[ 1, 2, 3 ]
[ 10, 20, 30, 40 ]
[ 2, <1 empty item>, 6 ]
TypeError: Reduce of empty array with no initial value
[ 1, 2, 3, 4 ]
\`\`\`

**How it works, line by line:**
1. \`myMap\` creates a same-length result and fills each index with the callback result.
2. The callback receives the index too, so \`n + i\` gives 1, 3, 5, 7.
3. \`myFilter\` pushes only items where the callback returns a truthy value.
4. \`myReduce\` with 0 as the initial value adds everything: 10.
5. Without an initial value, the first element (1) is the start and the loop begins at index 1. Same answer, one fewer call.
6. Reduce can build any shape — here it flattens one level.
7. \`thisArg\` sets \`this\` inside a **regular** callback (arrows would ignore it).
8. Holes are preserved, just like the native \`map\`.
9. Empty array + no initial value throws the same TypeError as the native method.
10. The original array is unchanged.

**Complexity:** each method is O(n) time. map and filter use O(n) extra space; reduce uses O(1) extra (besides what your callback builds).`,
      questions: [
        {
          q: 'Why can\'t these be arrow functions?',
          a: 'Arrow functions do not have their own `this`. A prototype method needs `this` to be the array it was called on, which only regular functions get.',
        },
        {
          q: 'Why check arguments.length in reduce instead of initialValue === undefined?',
          a: 'Because a caller may pass `undefined` on purpose as the initial value. `arguments.length` tells you whether it was passed at all.',
        },
        {
          q: 'How would you implement forEach or find?',
          a: '`forEach`: the same loop as map but return `undefined`. `find`: loop and return the first item where the callback is truthy, else `undefined` (note: `find` does visit holes, as `undefined`).',
        },
        {
          q: 'Should you add methods to Array.prototype in production?',
          a: 'Generally no. It can clash with future standard methods or other libraries. Use standalone utility functions instead, or real polyfills (like core-js) that follow the spec exactly.',
        },
      ],
      spoken: `"I'd add regular functions on Array.prototype, so this is the array. For map, I create a result of the same length, loop over the indexes, skip holes with the in operator, and set each slot to callback.call(thisArg, value, index, array). Filter is the same loop but pushes the item when the callback is truthy. Reduce is the interesting one: if an initial value was passed — I check arguments.length, not undefined — I start with it; otherwise I take the first element and start from the next index, and throw a TypeError on an empty array."`,
      mistakes: [
        'Writing the methods as arrow functions, so `this` is not the array.',
        'Passing only the value to the callback and forgetting `(value, index, array)`.',
        'In reduce, always starting from index 0 even when using the first element as the initial value (counts the first item twice).',
        'Follow-up trap: "What does [1, 2, 3].map(parseInt) give with your polyfill?" The same `[1, NaN, NaN]`, because it passes the index as the second argument, exactly like the real map.',
      ],
      takeaway: 'Loop over existing indexes, call the callback with (value, index, array), and handle reduce\'s missing initial value with arguments.length.',
    },
    {
      id: 'async-await-order',
      title: 'Output: async/await Ordering (advanced event loop)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'An async function is sync until its first await; each await resumes in a microtask; forEach does not wait for async callbacks.',
      what: `\`async/await\` is nicer syntax for promises, so the same event loop rules apply.

The rules you must know:
- An \`async\` function runs **synchronously until the first \`await\`**.
- \`await x\` pauses the function. The rest of the function continues later as a **microtask**, even if \`x\` is not a promise (\`await null\` still pauses).
- Calling an async function without \`await\` does **not** wait for it. The caller continues immediately.
- An async function always returns a **promise**.
- \`array.forEach(async ...)\` does **not** wait. \`forEach\` ignores the promises your callback returns. Use \`for...of\` with \`await\` (one by one) or \`Promise.all\` with \`map\` (in parallel).

#### Deeper version
Modern engines (V8 since about 2019, and the spec after the "await optimization") make \`await nativePromise\` cost **one** microtask tick. But **returning** a promise from an async function (\`return somePromise\` without \`await\`) costs about **three** ticks, because the outer promise has to "adopt" the inner one through an extra \`then\` job. That is why, in Puzzle 3, the async value prints after \`t2\`. You almost never rely on this in real code, but it explains surprising puzzle answers.

The big practical lesson is **sequential vs parallel**: two \`await\`s in a row run one after another (total time = sum). Starting both and awaiting \`Promise.all\` runs them at the same time (total time = the slowest).`,
      why: `Senior interviews love these because they show whether you really understand what \`await\` does — not just how to write it. The \`forEach\` + async bug and the "sequential awaits make my API slow" problem are both very common in real Node and React code.`,
      analogy: `\`await\` is like putting a bookmark in a book and going to help someone else. You do not stand still waiting. When the thing you were waiting for is ready, you join the **short urgent line** (microtasks) to continue reading from your bookmark.`,
      code: [
        {
          title: 'Puzzle 1: the famous async ordering question',
          lang: 'javascript',
          code: `async function a1() {
  console.log('a1 start');
  await a2();
  console.log('a1 end');
}
async function a2() {
  console.log('a2');
}

console.log('script start');
setTimeout(() => console.log('setTimeout'), 0);
a1();
new Promise((resolve) => {
  console.log('p1');
  resolve();
}).then(() => console.log('p2'));
console.log('script end');`,
        },
        {
          title: 'Puzzle 2: several awaits vs a then chain',
          lang: 'javascript',
          code: `async function f() {
  console.log(1);
  await undefined;
  console.log(2);
  await undefined;
  console.log(3);
}

f();
Promise.resolve()
  .then(() => console.log('a'))
  .then(() => console.log('b'));
console.log('sync');`,
        },
        {
          title: 'Puzzle 3: returning a promise from an async function',
          lang: 'javascript',
          code: `async function getValue() {
  return Promise.resolve('v');
}

getValue().then((v) => console.log('async ' + v));

Promise.resolve()
  .then(() => console.log('t1'))
  .then(() => console.log('t2'))
  .then(() => console.log('t3'))
  .then(() => console.log('t4'));`,
        },
        {
          title: 'Puzzle 4: async inside forEach vs for...of',
          lang: 'javascript',
          code: `async function withForEach() {
  [1, 2, 3].forEach(async (n) => {
    await null;
    console.log('item ' + n);
  });
  console.log('forEach done');
}

async function withForOf() {
  for (const n of [1, 2]) {
    await null;
    console.log('for-of item ' + n);
  }
  console.log('for-of done');
}

(async () => {
  await withForEach();
  await withForOf();
})();`,
        },
        {
          title: 'Puzzle 5: sequential vs parallel awaits',
          lang: 'javascript',
          code: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const round = (ms) => Math.round(ms / 100) * 100;

(async () => {
  let start = Date.now();
  await wait(100);
  await wait(100);
  console.log('sequential ~' + round(Date.now() - start) + 'ms');

  start = Date.now();
  await Promise.all([wait(100), wait(100)]);
  console.log('parallel ~' + round(Date.now() - start) + 'ms');
})();`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
script start
a1 start
a2
p1
script end
a1 end
p2
setTimeout
\`\`\`
Sync pass: "script start", then \`a1()\` runs until its \`await\`, which first **calls** \`a2()\` synchronously ("a2"). The Promise executor is sync ("p1"), then "script end". Microtasks: the \`await\` continuation was queued first ("a1 end"), then \`.then\` ("p2"). Finally the timer. (Very old engines printed "p2" before "a1 end"; modern Chrome and Node give this order.)

**Puzzle 2 output:**
\`\`\`text
1
sync
2
a
3
b
\`\`\`
Each \`await\` is one microtask hop, and each \`.then\` is one hop. The two "chains" take turns: 2, a, 3, b.

**Puzzle 3 output:**
\`\`\`text
t1
t2
async v
t3
t4
\`\`\`
Returning a promise (not a plain value) from an async function needs extra ticks to unwrap it, so "async v" lands after t2. With \`return 'v'\` it would print right after t1.

**Puzzle 4 output:**
\`\`\`text
forEach done
item 1
item 2
item 3
for-of item 1
for-of item 2
for-of done
\`\`\`
\`forEach\` fires three async callbacks and **does not wait** for them, so "forEach done" prints first. \`for...of\` with \`await\` really pauses on each item, so "for-of done" prints last.

**Puzzle 5 output:**
\`\`\`text
sequential ~200ms
parallel ~100ms
\`\`\`
Two awaits in a row wait one after the other. \`Promise.all\` starts both timers at the same time.`,
      questions: [
        {
          q: 'What does an async function return?',
          a: 'Always a promise. A returned value becomes the fulfilled value; a thrown error becomes a rejection.',
        },
        {
          q: 'Why does await inside forEach not work as expected?',
          a: '`forEach` ignores the promises returned by the callback, so nothing waits. Use `for...of` with `await` for sequential work or `await Promise.all(arr.map(async ...))` for parallel work.',
        },
        {
          q: 'How do you run two independent API calls in parallel with async/await?',
          a: 'Start both, then await together: `const [user, orders] = await Promise.all([getUser(), getOrders()])`. Awaiting them one by one doubles the time.',
        },
        {
          q: 'Does await block the whole thread?',
          a: 'No. It pauses only that async function. The thread keeps running other code, and the function resumes later as a microtask.',
        },
      ],
      spoken: `"With async functions I remember three things. First, the body runs synchronously until the first await, and any function called in the await expression also runs synchronously. Second, everything after an await resumes as a microtask, so it comes after the current sync code but before timers. Third, nothing waits for an async function unless someone awaits it — that's why forEach with async callbacks finishes immediately. In real code this matters for performance: independent calls should go through Promise.all instead of sequential awaits."`,
      mistakes: [
        'Using `async` callbacks with `forEach`, `map` without `Promise.all`, or `filter`, and expecting the outer code to wait.',
        'Awaiting independent requests one by one, which makes the total time the sum instead of the maximum.',
        'Thinking `await` blocks the thread. Only the current async function pauses.',
        'Follow-up trap: "How do you run async tasks in parallel but limit concurrency to N?" Use a small pool: start N workers that each pull the next task from a shared index until none are left (or a library like p-limit).',
      ],
      takeaway: 'async runs sync until the first await, each await resumes as a microtask, and forEach never waits.',
    },
    {
      id: 'async-error-handling',
      title: 'Output: async/await Error Handling',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'try/catch only catches a rejected promise if you AWAIT it inside the try; un-awaited rejections escape and become unhandled.',
      what: `With async code, an error is a **rejected promise**. A normal \`try/catch\` only sees errors that happen while it is running.

The rules you must know:
- \`try { await p } catch {}\` catches a rejection of \`p\`, because \`await\` turns the rejection into a thrown error **inside** the try.
- \`try { return p } catch {}\` (no \`await\`) does **not** catch it. The promise is returned, and it rejects later, after the try block is gone. Use \`return await p\` inside try/catch.
- Calling an async function that throws does **not** throw synchronously. It returns a rejected promise.
- A rejection with no \`.catch\` and no \`await\` becomes an **unhandled rejection**.
- \`finally\` always runs. If \`finally\` itself returns a value, that value **wins** over the try/catch return.

#### Deeper version
In Node 15 and later, an unhandled promise rejection **crashes the process** by default (\`--unhandled-rejections=throw\`). You can observe them with \`process.on('unhandledRejection', ...)\`, which is useful for logging but should not replace real handling. Browsers fire an \`unhandledrejection\` event on \`window\` and log "Uncaught (in promise)".

\`Promise.all\` rejects with the first error, but the other promises **keep running** — their results or errors are just ignored. (If another one rejects later, \`Promise.all\` has already attached a handler, so it is not reported as unhandled.)

Errors in a \`.catch\` handler start a new rejection that flows to the **next** \`.catch\`. An error thrown inside a \`setTimeout\` callback cannot be caught by a \`try/catch\` around the \`setTimeout\` call, because it runs later in a different call stack.`,
      why: `Unhandled rejections crash Node servers and silently break UIs. Interviewers check whether you know where to put \`try/catch\`, the \`return await\` rule, and how errors behave with \`Promise.all\`. This is daily work in Express handlers, payment webhooks and API calls.`,
      analogy: `\`try/catch\` is a safety net under a trapeze, but it is only there **while you are on the stage**. If you say "I'll do my jump later" (a promise you do not await) and leave, the net is packed away. When you finally jump, nobody catches you. \`await\` keeps you on stage until the jump is done.`,
      code: [
        {
          title: 'Puzzle 1: return vs return await inside try',
          lang: 'javascript',
          code: `async function fails() {
  throw new Error('oops');
}

async function noAwait() {
  try {
    return fails();
  } catch (e) {
    console.log('caught inside (no await)');
  }
}

async function withAwait() {
  try {
    return await fails();
  } catch (e) {
    console.log('caught inside: ' + e.message);
    return 'fallback';
  }
}

(async () => {
  try {
    await noAwait();
  } catch (e) {
    console.log('caught outside: ' + e.message);
  }
  console.log('value: ' + (await withAwait()));
})();`,
        },
        {
          title: 'Puzzle 2: sync try/catch around an async call',
          lang: 'javascript',
          code: `process.on('unhandledRejection', (e) => {
  console.log('unhandled: ' + e.message);
});

async function boom() {
  throw new Error('boom');
}

try {
  boom();
  console.log('no sync error');
} catch (e) {
  console.log('sync catch: ' + e.message);
}

boom().catch((e) => console.log('promise catch: ' + e.message));`,
        },
        {
          title: 'Puzzle 3: finally can override a return',
          lang: 'javascript',
          code: `function f() {
  try {
    return 'try';
  } finally {
    console.log('finally runs');
  }
}

function g() {
  try {
    throw new Error('x');
  } catch (e) {
    return 'catch';
  } finally {
    return 'finally';
  }
}

console.log(f());
console.log(g());`,
        },
        {
          title: 'Puzzle 4: Promise.all fails fast, others keep running',
          lang: 'javascript',
          code: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    await Promise.all([
      wait(10).then(() => 'a'),
      wait(20).then(() => {
        throw new Error('b failed');
      }),
      wait(40).then(() => {
        console.log('c still finished');
        return 'c';
      }),
    ]);
  } catch (e) {
    console.log('caught: ' + e.message);
  }
})();`,
        },
        {
          title: 'Puzzle 5: throwing inside catch',
          lang: 'javascript',
          code: `Promise.resolve()
  .then(() => {
    throw new Error('first');
  })
  .catch((e) => {
    console.log('1: ' + e.message);
    throw new Error('second');
  })
  .then(() => console.log('skipped'))
  .catch((e) => console.log('2: ' + e.message));`,
        },
      ],
      output: `**Puzzle 1 output:**
\`\`\`text
caught outside: oops
caught inside: oops
value: fallback
\`\`\`
In \`noAwait\`, \`fails()\` returns a rejected promise without throwing, so the inner try sees nothing; the caller gets the rejection. In \`withAwait\`, \`await\` throws the error **inside** the try, so the inner catch handles it and returns a fallback.

**Puzzle 2 output:**
\`\`\`text
no sync error
promise catch: boom
unhandled: boom
\`\`\`
Calling an async function never throws synchronously, so the sync \`catch\` is skipped. The first \`boom()\` promise has no handler, so it becomes an unhandled rejection (reported after the microtasks finish). Without the \`process.on\` listener, Node 15+ would print the error and **exit with a crash**.

**Puzzle 3 output:**
\`\`\`text
finally runs
try
finally
\`\`\`
\`finally\` runs before the function really returns. In \`g\`, \`return\` inside \`finally\` **replaces** the "catch" return value (linters warn about this: \`no-unsafe-finally\`).

**Puzzle 4 output:**
\`\`\`text
caught: b failed
c still finished
\`\`\`
\`Promise.all\` rejects as soon as "b" fails (at ~20 ms). The "c" task was already running and still finishes at ~40 ms. There is no cancellation.

**Puzzle 5 output:**
\`\`\`text
1: first
2: second
\`\`\`
The first \`catch\` handles "first" but throws "second", so the chain is rejected again: "skipped" is skipped, and the next \`catch\` handles it.`,
      questions: [
        {
          q: 'Why use return await inside try/catch?',
          a: 'Without `await`, the promise is returned before it settles, so a later rejection skips the catch block. `return await` makes the rejection throw inside the try. Outside try/catch, plain `return p` is fine.',
        },
        {
          q: 'What happens to an unhandled promise rejection in Node?',
          a: 'Since Node 15, the process crashes by default. You should always handle rejections; `process.on("unhandledRejection")` is a last-resort logger.',
        },
        {
          q: 'How do you handle errors in Express async route handlers?',
          a: 'Wrap with try/catch and call `next(err)`, or use a wrapper like `const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)`. Express 5 forwards rejected promises to the error handler automatically.',
        },
        {
          q: 'How do you get results from Promise.all even when some fail?',
          a: 'Use `Promise.allSettled`, or attach `.catch` to each promise first: `Promise.all(tasks.map((p) => p.catch((e) => ({ error: e }))))`.',
        },
      ],
      spoken: `"The key rule is that try/catch only catches what is awaited inside it. If I return a promise without await inside a try block, the rejection happens after the try is gone, so I use return await there. Calling an async function never throws synchronously — it returns a rejected promise — so if nobody awaits it or adds a catch, it becomes an unhandled rejection, which crashes Node 15 and later. I also remember that Promise.all fails fast but doesn't cancel the other tasks, and that a return inside finally overrides everything."`,
      mistakes: [
        'Writing `return promise` inside try/catch and expecting the catch to handle its rejection.',
        'Fire-and-forget async calls (`sendEmail(user)` with no await or catch) that crash the server when they fail.',
        'Wrapping `setTimeout` or an event callback in try/catch from the outside; the callback runs later on a different stack.',
        'Follow-up trap: "Should every await have its own try/catch?" No. Usually catch at a boundary (route handler, top-level task, error boundary) and only catch locally when you can recover, retry or add context.',
      ],
      takeaway: 'Only awaited promises are caught by try/catch — use return await inside try, and never leave a rejection unhandled.',
    },
    {
      id: 'implement-promise-all',
      title: 'Implement: Promise.all (and allSettled, race)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Return a new promise; resolve each input, store results by index, count completions, resolve when the count hits zero, reject on the first error.',
      what: `**Problem:** write \`promiseAll(items)\` that behaves like \`Promise.all\`.

**Requirements:**
- Takes an array (or any iterable) of promises **and plain values**.
- Resolves with an array of results in the **same order as the input**, not the order they finish.
- Rejects immediately with the **first** error (fail-fast).
- An empty input resolves immediately with \`[]\`.

The idea: create a new promise. For each item, wait for it, put its result at the **same index**, and count how many are done. When all are done, resolve. If any fails, reject.

#### Deeper version
- Wrap each item with \`Promise.resolve(item)\`, so plain values and "thenables" (objects with a \`then\` method) work too.
- Use a **counter**, not \`results.length\`: assigning \`results[5]\` first makes the length 6 even though only one result arrived.
- Calling \`reject\` (or \`resolve\`) more than once is harmless: a promise settles only once. That is what makes fail-fast simple — later rejections are ignored.
- Use \`Array.from(iterable)\` to support any iterable (Set, generator).

The same skeleton builds the other combinators: **allSettled** stores \`{ status, value/reason }\` and never rejects; **race** resolves or rejects with whichever settles first; **any** resolves with the first success and rejects with an \`AggregateError\` if all fail.`,
      why: `This is a top senior-frontend and Node question. It tests promises, closures, order preservation, edge cases (empty array, plain values) and error handling. It shows you understand how a library feature really works.`,
      analogy: `A teacher collects homework from a class. She has a list with a slot for each student's name (index). Papers arrive in any order, but she puts each paper in its student's slot. When the "papers received" count equals the class size, she submits the bundle. If one student says "I lost it" (rejection), she stops and reports the problem right away.`,
      code: [
        {
          title: 'Solution: promiseAll',
          lang: 'javascript',
          code: `function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const results = new Array(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      resolve(results); // empty input -> []
      return;
    }

    items.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          results[index] = value; // keep input order
          remaining -= 1;
          if (remaining === 0) resolve(results);
        },
        reject // first error wins; later calls are ignored
      );
    });
  });
}`,
        },
        {
          title: 'Bonus: allSettled and race',
          lang: 'javascript',
          code: `function promiseAllSettled(iterable) {
  return promiseAll(
    Array.from(iterable).map((item) =>
      Promise.resolve(item).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason })
      )
    )
  );
}

function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    for (const item of iterable) {
      Promise.resolve(item).then(resolve, reject);
    }
  });
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `const delay = (ms, value, fail = false) =>
  new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error(value)) : res(value)), ms));

(async () => {
  console.log(await promiseAll([delay(30, 'slow'), delay(10, 'fast'), 42]));
  console.log(await promiseAll([]));

  try {
    await promiseAll([delay(10, 'ok'), delay(20, 'boom', true), delay(5, 'x', true)]);
  } catch (e) {
    console.log('rejected with: ' + e.message);
  }

  const settled = await promiseAllSettled([delay(5, 'yes'), delay(5, 'no', true)]);
  console.log(settled.map((r) => r.status + ':' + (r.value || r.reason.message)));

  console.log(await promiseRace([delay(20, 'turtle'), delay(5, 'rabbit')]));
})();`,
        },
      ],
      output: `**Test output:**
\`\`\`text
[ 'slow', 'fast', 42 ]
[]
rejected with: x
[ 'fulfilled:yes', 'rejected:no' ]
rabbit
\`\`\`

**How it works, line by line:**
1. "fast" finishes first, but it is stored at index 1, so the result keeps the **input order**: slow, fast, 42. The plain value 42 works because of \`Promise.resolve(item)\`.
2. Empty input resolves immediately with \`[]\` (without the early return, it would hang forever, because the counter never reaches zero inside a callback).
3. The 5 ms "x" failure happens first, so we reject with "x". The later "boom" rejection is ignored, because a promise settles only once.
4. \`allSettled\` turns every outcome into an object, so it never rejects.
5. \`race\` settles with the fastest: "rabbit".

**Complexity:** O(n) time and O(n) space for n inputs. Total wait time is the slowest promise (they run in parallel), or the first failure.`,
      questions: [
        {
          q: 'Why use a counter instead of checking results.length?',
          a: 'Assigning `results[2]` before `results[0]` makes `length` 3 immediately. The counter counts real completions.',
        },
        {
          q: 'Why wrap items in Promise.resolve?',
          a: 'So plain values and thenables work the same as promises. `Promise.resolve(42).then(...)` simply gives 42.',
        },
        {
          q: 'How would you implement Promise.any?',
          a: 'Same skeleton, reversed: resolve on the first success; store errors by index and count failures; when all have failed, reject with `new AggregateError(errors, "All promises were rejected")`.',
        },
        {
          q: 'How would you add a concurrency limit (run at most N at once)?',
          a: 'Take functions that return promises instead of promises. Start N workers; each worker loops: take the next index, `await` the task, store the result, until no tasks remain. Then `await Promise.all(workers)`.',
        },
      ],
      spoken: `"I return a new Promise. Inside, I convert the input to an array, create a results array of the same length and a remaining counter. If it's empty I resolve right away. Then for each item I call Promise.resolve on it, so plain values work too. On success I store the value at its original index and decrement the counter; when it hits zero, I resolve with the results. On failure I call reject directly — the first rejection wins and later calls are ignored because a promise can settle only once. allSettled and race reuse the same idea."`,
      mistakes: [
        'Pushing results in completion order instead of storing them by index.',
        'Forgetting the empty-array case, which leaves the promise pending forever.',
        'Using `results.length === items.length` as the "done" check.',
        'Follow-up trap: "Does your promiseAll start the promises?" No. Promises are already running when you pass them in. To control when work starts (for limits or retries), accept functions that return promises.',
      ],
      takeaway: 'New promise + results by index + a counter: resolve when the counter hits zero, reject on the first error.',
    },
    {
      id: 'implement-deep-clone',
      title: 'Implement: Deep Clone (arrays, Date, Map/Set, circular refs)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Recursively copy objects and arrays, special-case Date/RegExp/Map/Set, and use a WeakMap of already-copied objects to handle circular references.',
      what: `**Problem:** write \`deepClone(value)\` that returns a fully independent copy. Changing anything in the copy, at any depth, must not change the original.

**Requirements:**
- Primitives are returned as is.
- Plain objects and arrays are copied recursively.
- \`Date\`, \`RegExp\`, \`Map\` and \`Set\` are copied as the **same type**.
- **Circular references** (an object that points back to itself) must not cause infinite recursion, and the copy must keep the same shape (the copy points to the copy).
- Functions are kept by reference (functions cannot be truly cloned).

#### Deeper version
The circular-reference trick: keep a \`WeakMap\` called \`seen\` from **original object → its copy**. Before cloning an object, check \`seen\`. If it is there, return the existing copy. Important: register the copy in \`seen\` **before** cloning the children, otherwise a child that points back to the parent would recurse forever.

Use \`Object.create(Object.getPrototypeOf(value))\` to keep the prototype, so cloned class instances still have their methods. Copy symbol keys too (\`Object.getOwnPropertySymbols\`). Limitations of this version: getters become plain values, non-enumerable properties are skipped, and class instances with private \`#fields\` cannot be copied from outside.

In real code, prefer the built-in \`structuredClone(value)\`: it handles Date, Map, Set, RegExp, typed arrays and circular references, but throws on functions and DOM nodes and does not keep class prototypes. \`JSON.parse(JSON.stringify(x))\` is the weakest option.`,
      why: `Deep clone tests recursion, type checking, and edge-case thinking (circular refs, special objects). It connects to real issues: accidental shared state, immutable updates in Redux/React, and why spread is only shallow.`,
      analogy: `Copying a family tree. You copy each person once. If you meet someone you have already copied (a cousin who appears in two branches, or a loop), you do not copy them again — you just draw a line to the copy you already made. The \`seen\` map is your "already copied" checklist.`,
      code: [
        {
          title: 'Solution',
          lang: 'javascript',
          code: `function deepClone(value, seen = new WeakMap()) {
  // primitives and functions are returned as they are
  if (value === null || typeof value !== 'object') return value;

  // circular or shared reference: reuse the copy we already made
  if (seen.has(value)) return seen.get(value);

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);
    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)));
    return copy;
  }

  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    value.forEach((v) => copy.add(deepClone(v, seen)));
    return copy;
  }

  // arrays and objects (keep the prototype for class instances)
  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy); // register BEFORE recursing (circular refs)

  const keys = [...Object.keys(value), ...Object.getOwnPropertySymbols(value)];
  for (const key of keys) {
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `const original = {
  name: 'Asha',
  tags: ['a', 'b'],
  address: { city: 'Pune' },
  joined: new Date('2024-01-01'),
  roles: new Set(['admin']),
  meta: new Map([['plan', { tier: 'pro' }]]),
  greet() {
    return 'hi';
  },
};
original.self = original; // circular reference

const copy = deepClone(original);
copy.address.city = 'Delhi';
copy.tags.push('c');
copy.meta.get('plan').tier = 'free';

console.log(original.address.city, original.tags.length, original.meta.get('plan').tier);
console.log(copy.joined instanceof Date, copy.joined !== original.joined);
console.log(copy.roles.has('admin'), copy.roles !== original.roles);
console.log(copy.self === copy, copy.self !== original);
console.log(copy.greet === original.greet);

class Point {
  constructor(x) {
    this.x = x;
  }
  double() {
    return this.x * 2;
  }
}
console.log(deepClone(new Point(21)).double());`,
        },
      ],
      output: `**Test output:**
\`\`\`text
Pune 2 pro
true true
true true
true true
true
42
\`\`\`

**How it works, line by line:**
1. Changing the copy's nested \`address\`, \`tags\` and the object **inside the Map** does not touch the original: "Pune 2 pro".
2. The Date is a new Date object with the same time.
3. The Set is a new Set with the same items.
4. \`copy.self\` points to the **copy**, not the original. Without the \`seen\` WeakMap, \`original.self\` would cause infinite recursion ("Maximum call stack size exceeded").
5. Functions are shared by reference (\`true\`).
6. The class instance keeps its prototype, so \`double()\` still works.

**Complexity:** O(n) time and space, where n is the number of values in the whole structure; each object is cloned once thanks to \`seen\`.`,
      questions: [
        {
          q: 'Why a WeakMap and not a Map for seen?',
          a: 'Both work for one call. A WeakMap holds keys weakly, so it never prevents garbage collection, and it only accepts objects, which is exactly what we store. It is the safe default.',
        },
        {
          q: 'What does structuredClone not support?',
          a: 'Functions, DOM nodes, and some objects like Errors in older environments. It also drops class prototypes (instances become plain objects) and does not copy getters/setters as accessors.',
        },
        {
          q: 'Why register the copy in seen before cloning children?',
          a: 'If a child points back to the parent, the recursive call must find the parent\'s copy already in `seen`. Registering after the loop would recurse forever.',
        },
        {
          q: 'How is this different from JSON.parse(JSON.stringify(obj))?',
          a: 'The JSON trick loses functions, undefined, Symbols, Map/Set, turns Dates into strings, NaN into null, and throws on circular references. Our version handles all of these (except it shares functions).',
        },
      ],
      spoken: `"I'd write a recursive function with a WeakMap called seen. Primitives and functions are returned as they are. For objects, I first check seen, which handles circular and shared references. Then I special-case Date and RegExp by creating new instances, and Map and Set by creating new collections and cloning each entry. For arrays and plain objects, I create an empty copy with the same prototype, register it in seen before recursing, and clone every own key including symbols. In production I'd use structuredClone unless I need to keep prototypes or functions."`,
      mistakes: [
        'Not handling circular references, which crashes with a stack overflow.',
        'Registering the copy in `seen` after cloning children, which still loops forever on cycles.',
        'Treating Date, Map and Set as plain objects: a Date "copy" becomes an empty object with no time.',
        'Follow-up trap: "Is typeof value === \'object\' enough to detect objects?" No: `null` also returns "object", so check `value === null` first.',
      ],
      takeaway: 'Recurse with a WeakMap of seen objects (register before recursing), and special-case Date, RegExp, Map and Set.',
    },
    {
      id: 'implement-lru-cache',
      title: 'Implement: LRU Cache (O(1) with Map)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'A Map remembers insertion order: on get, delete and re-insert to mark as recent; on put over capacity, delete the first (oldest) key.',
      what: `An **LRU (Least Recently Used) cache** keeps a limited number of items. When it is full and a new item comes in, it removes the item that was **used least recently**.

**Problem:** build \`LRUCache(capacity)\` with:
- \`get(key)\` → the value, or \`-1\` if missing. Reading marks the key as **most recently used**.
- \`put(key, value)\` → insert or update. If the size goes over capacity, evict the least recently used key.
- Both operations must be **O(1)** (constant time).

The trick: a JavaScript \`Map\` remembers the **order in which keys were inserted**. So the **first** key in the Map is the oldest, and the **last** is the newest. To "touch" a key, delete it and set it again — it moves to the end.

#### Deeper version
\`map.keys().next().value\` gives the first (least recently used) key in O(1). \`delete\` and \`set\` are O(1) on average. So both operations are O(1).

In languages without an ordered hash map (or if the interviewer says "do not rely on Map order"), the classic design is a **hash map + doubly linked list**: the map points from key to a list node; the list keeps nodes ordered from most to least recent. Moving a node to the front and removing the tail are O(1) pointer changes. Dummy **head** and **tail** nodes remove edge cases.

Real uses: caching API responses, database query results, image thumbnails, and the \`lru-cache\` npm package used in many Node projects. Next.js and many CDNs use LRU-style eviction internally.`,
      why: `LRU Cache (LeetCode 146) is one of the most popular design questions. It tests data-structure choice, O(1) reasoning and careful edge cases (update existing key, capacity 1). It also links to real caching decisions in backend work.`,
      analogy: `A small desk that fits only 3 books. Every time you read a book, you put it on top of the pile. When you need space for a new book, you remove the one at the **bottom** — the one you have not touched for the longest time.`,
      code: [
        {
          title: 'Solution with Map (O(1))',
          lang: 'javascript',
          code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // oldest key first, newest key last
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key); // move to the end = most recently used
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value; // first key = LRU
      this.map.delete(oldestKey);
    }
  }
}`,
        },
        {
          title: 'Classic version: hash map + doubly linked list',
          lang: 'javascript',
          code: `class LRUCacheList {
  constructor(capacity) {
    this.capacity = capacity;
    this.nodes = new Map(); // key -> node
    this.head = { prev: null, next: null }; // dummy: most recent side
    this.tail = { prev: this.head, next: null }; // dummy: least recent side
    this.head.next = this.tail;
  }
  #remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  #addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    const node = this.nodes.get(key);
    if (!node) return -1;
    this.#remove(node);
    this.#addToFront(node);
    return node.value;
  }
  put(key, value) {
    const existing = this.nodes.get(key);
    if (existing) this.#remove(existing);
    const node = { key, value, prev: null, next: null };
    this.#addToFront(node);
    this.nodes.set(key, node);
    if (this.nodes.size > this.capacity) {
      const lru = this.tail.prev;
      this.#remove(lru);
      this.nodes.delete(lru.key);
    }
  }
}`,
        },
        {
          title: 'Tests (LeetCode 146 example)',
          lang: 'javascript',
          code: `for (const Cache of [LRUCache, LRUCacheList]) {
  const cache = new Cache(2);
  const out = [];
  cache.put(1, 'one');
  cache.put(2, 'two');
  out.push(cache.get(1)); // 1 becomes most recent
  cache.put(3, 'three'); // evicts 2
  out.push(cache.get(2));
  cache.put(4, 'four'); // evicts 1
  out.push(cache.get(1), cache.get(3), cache.get(4));
  cache.put(3, 'THREE'); // update existing key
  out.push(cache.get(3));
  console.log(Cache.name + ': ' + out.join(', '));
}`,
        },
      ],
      output: `**Test output:**
\`\`\`text
LRUCache: one, -1, -1, three, four, THREE
LRUCacheList: one, -1, -1, three, four, THREE
\`\`\`

**How it works, line by line:**
1. Put 1 and 2. Order (oldest → newest): 1, 2.
2. \`get(1)\` returns "one" and moves 1 to the end: 2, 1.
3. \`put(3)\` makes the size 3 > 2, so the first key (2) is evicted: 1, 3.
4. \`get(2)\` → -1 (gone).
5. \`put(4)\` evicts the oldest, which is now 1: 3, 4. So \`get(1)\` → -1, \`get(3)\` → "three", \`get(4)\` → "four".
6. \`put(3, 'THREE')\` updates an existing key without evicting anything.
Both implementations give the same result.

**Complexity:** \`get\` and \`put\` are O(1). Space is O(capacity).`,
      questions: [
        {
          q: 'Why is a Map enough for O(1) LRU in JavaScript?',
          a: 'Map keeps insertion order. Delete + set moves a key to the end in O(1), and `map.keys().next().value` gives the oldest key in O(1).',
        },
        {
          q: 'Why a doubly linked list in the classic version, not a singly linked list?',
          a: 'To remove a node from the middle in O(1), you need its previous node. A doubly linked list stores `prev`, so no search is needed.',
        },
        {
          q: 'How would you add a TTL (expiry time)?',
          a: 'Store `{ value, expiresAt }`. On `get`, if `Date.now() > expiresAt`, delete it and return -1. Optionally run a periodic cleanup for entries never read again.',
        },
        {
          q: 'LRU vs LFU?',
          a: 'LRU evicts the item not used for the longest time. LFU (Least Frequently Used) evicts the item used the fewest times. LFU protects popular items but is more complex and slow to adapt to changes.',
        },
      ],
      spoken: `"In JavaScript I'd build it on a Map, because a Map remembers insertion order. The first key is the least recently used and the last is the most recent. In get, if the key exists I delete it and set it again, which moves it to the end, and return the value. In put, I delete the key if it exists, set it, and if the size is over capacity I delete the first key from map.keys(). Everything is O(1). If they don't want me to rely on Map ordering, I'd use a hash map plus a doubly linked list with dummy head and tail nodes."`,
      mistakes: [
        'Forgetting to move a key to "most recent" on `get` — then it is just a FIFO queue, not LRU.',
        'Not deleting before re-setting an existing key in `put`: `map.set` on an existing key keeps its **old** position.',
        'Using an array and `indexOf`/`splice` to track order, which makes operations O(n).',
        'Follow-up trap: "Is your cache safe for concurrent requests?" JavaScript runs one operation at a time, so the data structure is safe; but two requests can both miss and both fetch the same data (a "cache stampede"), so cache the in-flight promise.',
      ],
      takeaway: 'Map keeps insertion order: delete + set to mark recent, evict map.keys().next().value — O(1) for both operations.',
    },
    {
      id: 'implement-event-emitter',
      title: 'Implement: Event Emitter (on, off, once, emit)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Keep a Map of event name → list of listeners; once wraps the listener so it removes itself; emit calls a copy of the list.',
      what: `An **event emitter** lets parts of your code talk without knowing each other. One part **emits** (announces) an event; others **listen** for it. This is the **publish/subscribe (pub/sub)** pattern. Node's \`EventEmitter\` and the browser's \`addEventListener\` work this way.

**Problem:** build a class with:
- \`on(event, listener)\` → subscribe.
- \`off(event, listener)\` → unsubscribe.
- \`once(event, listener)\` → subscribe for **one** call only.
- \`emit(event, ...args)\` → call every listener of that event with the arguments, in the order they were added. Return \`true\` if there were listeners.

#### Deeper version
- Store listeners in a \`Map\` of event name → array of functions.
- \`once\` wraps the listener in a function that first removes itself, then calls the original. To let \`off(event, original)\` remove a \`once\` listener **before** it fires, save the original on the wrapper (Node uses a \`listener\` property for this).
- In \`emit\`, loop over a **copy** of the array. If a listener removes itself (like \`once\`) or adds listeners during emit, changing the live array while looping would skip or repeat listeners.
- Return \`this\` from \`on/off/once\` to allow chaining.

Node's real EventEmitter has extras: the special \`'error'\` event (emitting it with no listener **throws**), a max-listeners warning (default 10) to detect memory leaks, and \`prependListener\`. Forgetting to call \`off\` is a classic memory leak in long-running apps and React effects.`,
      why: `This question checks class design, closures, \`this\`, and careful edge cases (removing during emit, \`once\` + \`off\`). It is how Node streams, sockets and many libraries work, so it shows you understand the pattern behind real APIs.`,
      analogy: `A YouTube channel. Viewers **subscribe** (on) and **unsubscribe** (off). When a new video is posted (emit), every current subscriber gets a notification. A "notify me once" viewer (once) gets the next notification and is then automatically unsubscribed.`,
      code: [
        {
          title: 'Solution',
          lang: 'javascript',
          code: `class EventEmitter {
  constructor() {
    this.events = new Map(); // eventName -> [listeners]
  }

  on(name, listener) {
    if (!this.events.has(name)) this.events.set(name, []);
    this.events.get(name).push(listener);
    return this; // allow chaining
  }

  off(name, listener) {
    const list = this.events.get(name);
    if (!list) return this;
    // remove the last matching listener (also matches once-wrappers)
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].original === listener) {
        list.splice(i, 1);
        break;
      }
    }
    if (list.length === 0) this.events.delete(name);
    return this;
  }

  once(name, listener) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      listener.apply(this, args);
    };
    wrapper.original = listener; // so off(name, listener) works too
    return this.on(name, wrapper);
  }

  emit(name, ...args) {
    const list = this.events.get(name);
    if (!list || list.length === 0) return false;
    // copy: listeners may remove themselves while we loop
    [...list].forEach((listener) => listener.apply(this, args));
    return true;
  }
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `const emitter = new EventEmitter();
const greet = (name) => console.log('hello ' + name);
const shout = (name) => console.log('HEY ' + name.toUpperCase());

emitter.on('join', greet).on('join', shout);
emitter.once('join', (name) => console.log('first join only: ' + name));

console.log(emitter.emit('join', 'asha'));
emitter.off('join', shout);
emitter.emit('join', 'ravi');

const neverRuns = () => console.log('should not print');
emitter.once('leave', neverRuns);
emitter.off('leave', neverRuns); // remove a once-listener before it fires
console.log(emitter.emit('leave'));`,
        },
      ],
      output: `**Test output:**
\`\`\`text
hello asha
HEY ASHA
first join only: asha
true
hello ravi
false
\`\`\`

**How it works, line by line:**
1. Two \`on\` listeners and one \`once\` listener are registered for "join" (chaining works because \`on\` returns \`this\`).
2. The first \`emit\` calls all three in order and returns \`true\`. The \`once\` wrapper removes itself **before** calling the original.
3. After \`off('join', shout)\` only \`greet\` is left, so the second emit prints just "hello ravi".
4. \`off('leave', neverRuns)\` finds the once-wrapper through its \`original\` property and removes it, so the "leave" event has no listeners and \`emit\` returns \`false\`.

**Complexity:** \`on\` is O(1); \`off\` and \`emit\` are O(k), where k is the number of listeners for that event.`,
      questions: [
        {
          q: 'Why loop over a copy of the listeners in emit?',
          a: 'A listener may call `off` (like a `once` wrapper does) or `on` while we are looping. Changing the live array during the loop can skip the next listener. A copy gives a stable snapshot.',
        },
        {
          q: 'How does once work?',
          a: 'It registers a wrapper function. When the event fires, the wrapper first removes itself with `off`, then calls the original listener with the arguments.',
        },
        {
          q: 'What happens in Node if you emit "error" with no listener?',
          a: 'Node throws the error (crashing the process if uncaught). That is why streams and sockets should always have an error listener.',
        },
        {
          q: 'Why can event listeners cause memory leaks?',
          a: 'The emitter holds references to listeners and everything they close over. If you add listeners repeatedly (for example in a React effect without cleanup) and never call `off`, they pile up. Node warns after 10 listeners per event.',
        },
      ],
      spoken: `"I keep a Map from event name to an array of listeners. on pushes the listener and returns this for chaining. off finds the listener and removes it, and it also matches once-wrappers through an original property. once registers a wrapper that removes itself first and then calls the real listener. emit gets the list, returns false if it's empty, and otherwise calls each listener with apply, looping over a copy so that listeners removing themselves don't break the loop. In real apps, the main risk is forgetting to unsubscribe, which leaks memory."`,
      mistakes: [
        'Looping over the live listener array in `emit` while `once` removes items, which skips listeners.',
        'Not keeping a link from the `once` wrapper to the original listener, so `off(event, original)` cannot remove it.',
        'Using `filter` in `off`, which removes **all** copies of a listener added twice; Node removes only the most recently added one.',
        'Follow-up trap: "Are listeners called synchronously or asynchronously?" Synchronously, in registration order, during `emit`. Use `setImmediate` or `queueMicrotask` inside a listener if you need async work.',
      ],
      takeaway: 'Map of event → listeners; once = self-removing wrapper; emit iterates a copy and calls each listener with the args.',
    },
    {
      id: 'implement-call-apply-bind',
      title: 'Implement: call, apply and bind Polyfills',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'call/apply: temporarily attach the function to the target object under a Symbol key and call it; bind: return a function that applies later and supports new.',
      what: `**Problem:** write \`myCall\`, \`myApply\` and \`myBind\` on \`Function.prototype\`.

- \`fn.myCall(obj, a, b)\` → runs \`fn\` right now with \`this = obj\`.
- \`fn.myApply(obj, [a, b])\` → the same, but arguments come as an array.
- \`fn.myBind(obj, a)\` → returns a **new function** that, when called later, runs \`fn\` with \`this = obj\` and \`a\` already filled in (partial application).

The trick for call/apply: \`this\` is decided by the call site. If we temporarily put the function **on** the object and call it as \`obj.fn()\`, then \`this\` is \`obj\`. Then we remove it again.

#### Deeper version
- Use a **Symbol** as the temporary key, so we never overwrite a real property of the object.
- If \`thisArg\` is \`null\` or \`undefined\`, sloppy-mode functions use the global object; use \`globalThis\`. Wrap primitives with \`Object(thisArg)\` so \`fn.myCall('hi')\` works.
- Clean up in \`finally\`, so the temporary key is removed even if the function throws.
- **bind and new:** if a bound function is called with \`new\`, the bound \`this\` is **ignored** and a new object is created, but the preset arguments are still used. Inside the bound function, \`new.target\` tells us it was called with \`new\`.
- Real bind also sets the \`name\` ("bound fn") and \`length\`; interviewers rarely require that.`,
      why: `This checks deep understanding of \`this\`: the call-site rule, why binding works, and how \`new\` interacts with bind. It often follows a \`this\` output question in the same interview.`,
      analogy: `call/apply is like lending your microphone to a guest speaker for one sentence: you hand it over (attach the function), they speak (call), and you take it back (delete). bind is like recording a voice message addressed to one person: whenever it is played later, it is always for that person.`,
      code: [
        {
          title: 'Solution',
          lang: 'javascript',
          code: `Function.prototype.myCall = function (thisArg, ...args) {
  const ctx = thisArg == null ? globalThis : Object(thisArg);
  const key = Symbol('fn'); // unique key, never clashes
  ctx[key] = this; // "this" is the function myCall was called on
  try {
    return ctx[key](...args); // called as ctx.fn() -> this = ctx
  } finally {
    delete ctx[key];
  }
};

Function.prototype.myApply = function (thisArg, args = []) {
  return this.myCall(thisArg, ...args);
};

Function.prototype.myBind = function (thisArg, ...preset) {
  const fn = this;
  return function bound(...later) {
    if (new.target) {
      // called with new: ignore thisArg, keep preset args
      return new fn(...preset, ...later);
    }
    return fn.myApply(thisArg, [...preset, ...later]);
  };
};`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `function intro(greeting, punct) {
  return greeting + ', I am ' + this.name + punct;
}
const asha = { name: 'Asha' };

console.log(intro.myCall(asha, 'Hello', '!'));
console.log(intro.myApply(asha, ['Hi', '.']));

const hey = intro.myBind(asha, 'Hey');
console.log(hey('?'));
console.log(Object.keys(asha)); // no leftover temp key

function Point(x, y) {
  this.x = x;
  this.y = y;
}
const PointAtX5 = Point.myBind({ ignored: true }, 5);
const p = new PointAtX5(7);
console.log(p.x, p.y, p instanceof Point);

console.log(Math.max.myApply(null, [3, 9, 4]));`,
        },
      ],
      output: `**Test output:**
\`\`\`text
Hello, I am Asha!
Hi, I am Asha.
Hey, I am Asha?
[ 'name' ]
5 7 true
9
\`\`\`

**How it works, line by line:**
1. \`myCall\` attaches \`intro\` to \`asha\` under a Symbol key, calls it as a method (so \`this\` is \`asha\`), then deletes the key.
2. \`myApply\` just spreads the array into \`myCall\`.
3. \`myBind\` returns a function that remembers \`asha\` and the preset "Hey"; later it adds "?".
4. \`Object.keys(asha)\` shows only "name": the temporary key was removed (and Symbols are not listed anyway).
5. Calling the bound \`Point\` with \`new\` ignores the bound object and builds a real \`Point\` with the preset \`x = 5\`.
6. \`null\` as thisArg works: \`Math.max\` does not use \`this\`.

**Complexity:** O(n) in the number of arguments (copying them); otherwise constant.`,
      questions: [
        {
          q: 'Why use a Symbol as the temporary key?',
          a: 'A Symbol is unique, so it can never overwrite an existing property like `fn` on the object, and it does not show up in `Object.keys` or `for...in`.',
        },
        {
          q: 'What happens if you call a bound function with new?',
          a: 'The bound `this` is ignored; `new` creates a fresh object as usual. Preset arguments are still applied. Our polyfill handles it with `new.target`.',
        },
        {
          q: 'Can you rebind a bound function?',
          a: 'No. `bound.bind(other)` creates another wrapper, but the inner call still uses the first `thisArg`. The first bind wins.',
        },
        {
          q: 'How did people write apply before spread syntax existed?',
          a: 'They built a string like `ctx.fn(args[0], args[1])` and used `eval`, or used `new Function`. Spread makes it clean today.',
        },
      ],
      spoken: `"For call, I rely on the call-site rule for this. I take the target object — globalThis if it's null, or Object of it for primitives — attach the function under a unique Symbol key, call it as a method so this is the target, and delete the key in a finally block. apply is the same with an array of arguments. bind returns a new function that stores the target and preset arguments and calls apply later with the preset plus new arguments. I also check new.target, because calling a bound function with new should ignore the bound this."`,
      mistakes: [
        'Using a normal string key like `ctx.fn`, which can overwrite a real property.',
        'Forgetting to delete the temporary key (or not using `finally`, so an error leaves it behind).',
        'Writing myBind with an arrow function inside and ignoring the `new` case.',
        'Follow-up trap: "Does your myCall work on arrow functions?" It runs them, but arrows ignore `this` from any call style — the same as the native `call`.',
      ],
      takeaway: 'call/apply = attach the function to the target under a Symbol and call it as a method; bind = return a wrapper that applies later (and respects new).',
    },
    {
      id: 'implement-promise-utilities',
      title: 'Implement: sleep, timeout, retry with backoff and a concurrency pool',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Small promise helpers every backend needs: wrap setTimeout in a promise, race against a timer, loop with exponential backoff, and run tasks with N workers.',
      what: `These four helpers come up in Node and full-stack interviews, often as "how would you call a flaky third-party API safely?".

1. **sleep(ms)** → a promise that resolves after \`ms\` milliseconds.
2. **withTimeout(promise, ms)** → rejects if the promise does not settle within \`ms\`.
3. **retry(fn, options)** → call an async function; if it fails, wait and try again, up to N retries. **Exponential backoff** means the wait doubles each time (100 ms, 200 ms, 400 ms...).
4. **promisePool(tasks, limit)** → run many async tasks but at most \`limit\` at the same time, and return results in input order.

#### Deeper version
- **Timeout:** use \`Promise.race([promise, timer])\`, and clear the timer in \`finally\` so it does not keep the Node process alive. Note: a timeout does not **cancel** the original work. For \`fetch\`, use \`AbortController\` (or \`AbortSignal.timeout(ms)\`) to really cancel.
- **Retry:** only retry errors that may succeed next time (network errors, 429, 5xx), not 400 or 401. Add **jitter** (a random extra delay) so many clients do not retry at the same moment ("thundering herd"). Only retry **idempotent** operations — or use an idempotency key, like Stripe does, for payments.
- **Pool:** tasks must be **functions** that return promises, because a promise starts running as soon as it is created. Start \`limit\` workers; each loops, takes the next index from a shared counter, awaits that task and stores the result. Because JavaScript is single-threaded, \`next++\` is safe without locks.`,
      why: `Real integrations (Stripe, OpenAI/LLM APIs, Twilio, S3) fail sometimes, rate-limit you, or hang. Interviewers want to see that you can make calls resilient and avoid overloading a service by firing 1,000 requests at once.`,
      analogy: `Retry with backoff is like calling a busy friend: if they do not pick up, you wait 1 minute, then 2, then 4, instead of calling non-stop. The pool is like a bank with 2 counters: 10 customers wait in one line, and whenever a counter is free, the next customer goes.`,
      code: [
        {
          title: 'Solution',
          lang: 'javascript',
          code: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timed out after ' + ms + 'ms')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function retry(fn, { retries = 3, delay = 100, factor = 2 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries) throw err; // out of retries
      await sleep(delay * factor ** attempt); // 100, 200, 400...
    }
  }
}

async function promisePool(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const index = next++; // safe: single-threaded
      results[index] = await tasks[index]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}`,
        },
        {
          title: 'Tests',
          lang: 'javascript',
          code: `(async () => {
  // timeout
  console.log(await withTimeout(sleep(10).then(() => 'fast enough'), 100));
  try {
    await withTimeout(sleep(200), 50);
  } catch (e) {
    console.log(e.message);
  }

  // retry: fails twice, then succeeds
  const flaky = async (attempt) => {
    if (attempt < 2) {
      console.log('attempt ' + attempt + ' failed');
      throw new Error('network');
    }
    return 'ok on attempt ' + attempt;
  };
  console.log(await retry(flaky, { retries: 3, delay: 10 }));

  try {
    await retry(async () => {
      throw new Error('always down');
    }, { retries: 1, delay: 10 });
  } catch (e) {
    console.log('gave up: ' + e.message);
  }

  // pool: 5 tasks, at most 2 running at once
  let running = 0;
  let maxRunning = 0;
  const makeTask = (id, ms) => async () => {
    running++;
    maxRunning = Math.max(maxRunning, running);
    await sleep(ms);
    running--;
    return 'task' + id;
  };
  const tasks = [makeTask(1, 30), makeTask(2, 10), makeTask(3, 20), makeTask(4, 10), makeTask(5, 10)];
  console.log(await promisePool(tasks, 2));
  console.log('max running: ' + maxRunning);
})();`,
        },
      ],
      output: `**Test output:**
\`\`\`text
fast enough
Timed out after 50ms
attempt 0 failed
attempt 1 failed
ok on attempt 2
gave up: always down
[ 'task1', 'task2', 'task3', 'task4', 'task5' ]
max running: 2
\`\`\`

**How it works, line by line:**
1. The 10 ms promise wins the race against the 100 ms timer, and \`finally\` clears the timer.
2. The 200 ms sleep loses to the 50 ms timer, so we get the timeout error.
3. \`retry\` calls \`flaky\` with attempt 0 and 1 (both fail, waiting 10 ms then 20 ms), and attempt 2 succeeds.
4. With \`retries: 1\`, the function is tried twice in total, then the last error is thrown.
5. The pool starts 2 workers. Whenever one finishes a task, it takes the next index. Results are stored by index, so the order matches the input even though tasks finish in a different order.
6. The counter proves no more than 2 tasks ran at the same time.

**Complexity:** the pool does O(n) work for n tasks; total time is roughly (sum of task times) / limit. Retry waits a total of about delay × (2^retries − 1) in the worst case.`,
      questions: [
        {
          q: 'Does withTimeout cancel the original operation?',
          a: 'No. It only stops waiting. The original work keeps running. To really cancel a fetch, pass an `AbortController` signal (or `AbortSignal.timeout(ms)`).',
        },
        {
          q: 'Which errors should you retry?',
          a: 'Temporary ones: network errors, timeouts, 429 Too Many Requests (respect the Retry-After header), and 5xx. Do not retry 4xx client errors like 400, 401 or 404.',
        },
        {
          q: 'Why add jitter to backoff?',
          a: 'If many clients fail at the same time, pure exponential backoff makes them all retry at the same moments. Random jitter spreads the retries out and protects the server.',
        },
        {
          q: 'Why does the pool take functions instead of promises?',
          a: 'A promise starts running the moment it is created. To control when work starts (and limit concurrency), you need functions you can call later.',
        },
      ],
      spoken: `"For flaky APIs I use small promise helpers. sleep wraps setTimeout in a promise. withTimeout races the real promise against a timer that rejects, and clears the timer in finally — though to truly cancel a fetch I'd use AbortController. retry loops with try/catch, awaiting the function, and on failure sleeps with exponential backoff until retries run out, then rethrows. For bulk work, I use a pool: N workers share an index counter and each pulls the next task, so at most N run at once and results stay in order."`,
      mistakes: [
        'Retrying non-idempotent operations like payments without an idempotency key, which can charge a customer twice.',
        'Passing already-created promises to a "pool": they all start immediately, so there is no real limit.',
        'Forgetting to clear the timeout timer, which keeps a Node process or Lambda alive longer than needed.',
        'Follow-up trap: "Promise.all on 10,000 requests — what can go wrong?" You may hit rate limits, socket limits or memory pressure, and one failure rejects everything. Use a pool with a concurrency limit and allSettled-style result handling.',
      ],
      takeaway: 'sleep = promisified setTimeout, timeout = race with a timer, retry = loop with exponential backoff, pool = N workers pulling from a shared index.',
    },
  ],
  rapidFire: [
    { q: "What does `typeof null` return?", a: "\"object\" — a historic bug; check `x === null` instead." },
    { q: "What does `typeof NaN` return?", a: "\"number\". Use `Number.isNaN(x)` to detect NaN." },
    { q: "What does `typeof []` return?", a: "\"object\". Use `Array.isArray(x)`." },
    { q: "What does `typeof typeof 1` return?", a: "\"string\" — typeof always returns a string." },
    { q: "What does `typeof notDeclared` return?", a: "\"undefined\", no error (but inside a TDZ it throws)." },
    { q: "What does `typeof class {}` return?", a: "\"function\" — classes are special functions." },
    { q: "What is `[] + []`?", a: "An empty string \"\"." },
    { q: "What is `[] + {}`?", a: "\"[object Object]\"." },
    { q: "What is `'5' - 2` and `'5' + 2`?", a: "3 and \"52\": minus converts to numbers, plus with a string concatenates." },
    { q: "What is `1 + 2 + '3'` vs `'1' + 2 + 3`?", a: "\"33\" vs \"123\" — plus is evaluated left to right." },
    { q: "What is `true + true`?", a: "2 (true becomes 1)." },
    { q: "What is `null + 1` and `undefined + 1`?", a: "1 and NaN: null becomes 0, undefined becomes NaN." },
    { q: "What is `null == undefined`? And `null === undefined`?", a: "true and false." },
    { q: "What is `null == 0` and `null >= 0`?", a: "false and true: == has a special null rule, but >= converts null to 0." },
    { q: "What is `NaN === NaN`?", a: "false. `Object.is(NaN, NaN)` is true." },
    { q: "What is `Object.is(0, -0)`?", a: "false (while `0 === -0` is true)." },
    { q: "What is `[] == ![]`?", a: "true: ![] is false, then [] → \"\" → 0 and false → 0." },
    { q: "What is `'0' == false`?", a: "true: both become 0. But `!!'0'` is also true — any non-empty string is truthy." },
    { q: "What is `0.1 + 0.2 === 0.3`?", a: "false; the sum is 0.30000000000000004." },
    { q: "What is `+'12px'` vs `parseInt('12px')`?", a: "NaN vs 12: unary plus needs the whole string to be numeric, parseInt reads digits until it stops." },
    { q: "What is `Number([])`, `Number([5])` and `Number({})`?", a: "0, 5 and NaN." },
    { q: "What is `[10, 1, 5].sort()`?", a: "[1, 10, 5] — default sort compares strings. Use `(a, b) => a - b`." },
    { q: "What is `['1','2','3'].map(parseInt)`?", a: "[1, NaN, NaN] — the index is passed as the radix." },
    { q: "What is `[,,,].length`?", a: "3 — the last comma is a trailing comma." },
    { q: "What is `Math.max()` with no arguments?", a: "-Infinity (and `Math.min()` is Infinity)." },
    { q: "What is `[NaN].indexOf(NaN)` vs `[NaN].includes(NaN)`?", a: "-1 vs true: includes uses SameValueZero." },
    { q: "What is `{} === {}`?", a: "false — two different references." },
    { q: "What is `0 || 'a'` vs `0 ?? 'a'`?", a: "\"a\" vs 0: ?? only falls back on null or undefined." },
    { q: "What is `'b' + 'a' + +'a' + 'a'`?", a: "\"baNaNa\" — +'a' is NaN." },
    { q: "What is `1 < 2 < 3` vs `3 > 2 > 1`?", a: "true vs false: `3 > 2` is true, and `true > 1` is `1 > 1`, false." },
    { q: "What is `'10' < '9'`?", a: "true — two strings compare character by character, and '1' < '9'." },
    { q: "Loop: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` prints?", a: "3, 3, 3. With let: 0, 1, 2." },
    { q: "`console.log(a); var a = 5;` prints?", a: "undefined — var is hoisted as undefined." },
    { q: "`console.log(x); let x = 5;` does what?", a: "Throws ReferenceError: Cannot access 'x' before initialization (TDZ)." },
    { q: "Calling `var f = function(){}` before its line gives?", a: "TypeError: f is not a function (f is undefined)." },
    { q: "Order of: log('1'); setTimeout(log '2'); Promise.then(log '3'); log('4')?", a: "1, 4, 3, 2 — sync, then microtasks, then timers." },
    { q: "Is the function inside `new Promise(fn)` sync or async?", a: "Synchronous. Only .then/.catch/.finally callbacks are async." },
    { q: "Where does an async function pause?", a: "At the first await; everything before it runs synchronously." },
    { q: "Does `arr.forEach(async ...)` wait for the callbacks?", a: "No. Use for...of with await, or Promise.all with map." },
    { q: "What does `Promise.resolve(1).then(2).then(console.log)` print?", a: "1 — non-function arguments to then are ignored." },
    { q: "What does `.finally(() => 'B')` do to a promise holding 'A'?", a: "Nothing: the chain still resolves with 'A'." },
    { q: "Extracted method `const f = obj.greet; f()` — what is this?", a: "undefined in strict mode/modules (TypeError on access), the global object in sloppy mode." },
    { q: "Arrow function as an object method: what is this?", a: "The outer (lexical) this, not the object." },
    { q: "`fn.bind(a).bind(b)()` — which this is used?", a: "a — the first bind wins." },
    { q: "`let a = {n:1}; const b = a; a.x = a = {n:2};` what is b.x?", a: "{ n: 2 } — the target a.x was resolved on the old object; a.x is undefined." },
    { q: "Does `{ ...obj }` deep copy?", a: "No, it is shallow. Use structuredClone for a deep copy." },
    { q: "Does a default parameter apply for null?", a: "No, only for undefined." },
    { q: "`try { return p } catch {}` inside an async function — is a rejection of p caught?", a: "No. Use `return await p` inside try/catch." },
    { q: "What does `delete arr[1]` do to an array's length?", a: "Nothing — it leaves a hole. Use splice to remove." },
    { q: "What does Node do with an unhandled promise rejection (v15+)?", a: "Crashes the process by default." },
  ],
};
