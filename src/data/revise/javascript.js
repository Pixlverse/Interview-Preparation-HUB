// Revise MERN: JavaScript. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'javascript',
  icon: '🟨',
  title: 'JavaScript',
  note: 'Core language: closures, scope, this, the event loop, async code, prototypes and copying.',
  items: [
    {
      q: 'What is a closure?',
      a: `A **closure** is a function that remembers the variables from the scope where it was created, even after that outer function has finished running. In JavaScript every function carries a reference to its outer lexical environment.

We use closures all the time: private variables in a counter, function factories, event handlers that remember an id, and debounce or throttle helpers that keep a timer variable between calls. The one thing to watch is memory, because anything a closure references cannot be garbage collected while the closure is alive.`,
    },
    {
      q: 'Explain the event loop.',
      a: `The **event loop** is how single-threaded JavaScript handles async work. Code runs on the **call stack**; async tasks like timers, network and file I/O are handed to the browser or Node (libuv), and their callbacks wait in queues.

When the stack is empty, the loop first drains the **microtask queue** (promise callbacks, \`queueMicrotask\`), then takes one **macrotask** (like a \`setTimeout\` callback), then drains microtasks again. That is why a resolved promise's \`.then\` runs before a \`setTimeout(fn, 0)\`.`,
    },
    {
      q: 'What is the difference between var, let and const?',
      a: `\`var\` is **function-scoped**, can be redeclared, and is hoisted and initialised to \`undefined\`. \`let\` and \`const\` are **block-scoped**, cannot be redeclared in the same scope, and sit in the **temporal dead zone** until their declaration line runs, so accessing them early throws a ReferenceError.

\`const\` means the binding cannot be reassigned, not that the value is frozen; you can still push to a const array or change an object's property. My default is \`const\`, then \`let\` when I need to reassign, and I avoid \`var\`.`,
    },
    {
      q: 'What is hoisting?',
      a: `**Hoisting** means declarations are processed before the code runs, so they behave as if moved to the top of their scope. Function declarations are hoisted fully, so you can call them before they appear. \`var\` is hoisted but set to \`undefined\`.

\`let\`, \`const\` and \`class\` are also hoisted, but they stay uninitialised in the **temporal dead zone** until the declaration executes, so using them early throws an error. Function expressions and arrow functions follow the rules of the variable they are assigned to.`,
    },
    {
      q: 'How does "this" work in JavaScript?',
      a: `\`this\` is decided by **how a function is called**, not where it is written. As a method (\`obj.fn()\`) it is the object; as a plain call it is \`undefined\` in strict mode (or the global object otherwise); with \`new\` it is the new instance; and \`call\`, \`apply\` and \`bind\` set it explicitly.

**Arrow functions** do not have their own \`this\`; they take it from the surrounding scope. That is why arrows are handy in callbacks inside methods, but you should not use an arrow as an object method if you need \`this\` to be the object.`,
    },
    {
      q: 'What is the difference between == and ===?',
      a: `\`===\` is **strict equality**: it compares value and type with no conversion. \`==\` is **loose equality**: it converts types first, which gives surprises like \`'0' == 0\` being true and \`[] == false\` being true.

I always use \`===\` and \`!==\`. The one place some teams allow \`==\` is \`x == null\`, which checks for both \`null\` and \`undefined\` in one go. For special cases like \`NaN\` or \`+0\` versus \`-0\`, \`Object.is\` is the precise tool.`,
    },
    {
      q: 'What are promises and how is async/await related?',
      a: `A **Promise** is an object representing a value that will be available later. It is **pending**, then either **fulfilled** or **rejected**, and you react with \`.then\`, \`.catch\` and \`.finally\`. It solved callback hell by letting us chain async steps.

**async/await** is syntax on top of promises. An \`async\` function always returns a promise, and \`await\` pauses that function until the promise settles, so async code reads like normal top-to-bottom code. Errors are handled with try/catch. In SkillKeepr's Lambda handlers almost every database and AWS call was awaited this way.`,
    },
    {
      q: 'Promise.all vs allSettled vs race vs any?',
      a: `All four take multiple promises and run them in parallel. **Promise.all** resolves with all results, but rejects as soon as any one fails. **Promise.allSettled** waits for every promise and gives you each one's status and value or reason, so one failure does not hide the others.

**Promise.race** settles with whichever promise settles first, success or failure, which is useful for timeouts. **Promise.any** resolves with the first success and only rejects if all fail. I use \`all\` when everything is required and \`allSettled\` for independent jobs like sending multiple notifications.`,
    },
    {
      q: 'Microtasks vs macrotasks: what runs first?',
      a: `**Microtasks** run first. After the current synchronous code finishes, the engine empties the whole microtask queue, which holds promise callbacks, \`await\` continuations and \`queueMicrotask\`. Only then does it pick the next **macrotask**, like a \`setTimeout\`, \`setInterval\` or I/O callback.

So \`console.log\`, then promise \`.then\`, then \`setTimeout\` is the usual output order. In Node, \`process.nextTick\` runs even before promise microtasks. A practical risk is that an endless chain of microtasks can starve timers and rendering.`,
    },
    {
      q: 'Explain prototypes and prototypal inheritance.',
      a: `Every JavaScript object has a hidden link to another object called its **prototype**. When you read a property that is not on the object, the engine walks up this **prototype chain** until it finds it or reaches \`null\`.

That is how inheritance works in JS: methods live once on the prototype and all instances share them. \`class\` syntax is mostly sugar over this; \`class Dog extends Animal\` sets up the chain for you. You can inspect it with \`Object.getPrototypeOf\` and create objects with a chosen prototype using \`Object.create\`.`,
    },
    {
      q: 'Shallow copy vs deep copy?',
      a: `A **shallow copy** copies only the top level; nested objects are still shared by reference. Spread (\`{...obj}\`, \`[...arr]\`) and \`Object.assign\` are shallow, so changing a nested field in the copy also changes the original.

A **deep copy** duplicates every level. The modern way is \`structuredClone(obj)\`, which handles dates, maps, sets and circular references, but not functions or DOM nodes. \`JSON.parse(JSON.stringify())\` works for plain data but loses dates, \`undefined\` and functions. In React and Redux we usually copy only the path we change rather than deep cloning everything.`,
    },
    {
      q: 'What are debounce and throttle?',
      a: `Both limit how often a function runs. **Debounce** waits until the calls stop for a set time, then runs once; typing in a search box and calling the API only after the user pauses for 300ms is the classic case. **Throttle** runs at most once per interval, no matter how many calls come in, which suits scroll, resize or mouse-move handlers.

Both are built with a closure that keeps a timer or last-run timestamp. For a search feature like SkillKeepr's candidate search, debouncing the input saves a lot of unnecessary requests.`,
    },
    {
      q: 'What is the difference between null and undefined?',
      a: `\`undefined\` means a value **was never assigned**: an uninitialised variable, a missing object property, a function with no return, or a missing argument. \`null\` is an **intentional "no value"** that a developer sets on purpose.

\`typeof undefined\` is \`'undefined'\`, while \`typeof null\` is \`'object'\`, which is a historic bug. They are loosely equal (\`null == undefined\`) but not strictly equal. The \`??\` operator and optional chaining \`?.\` treat both as "nullish", which is very useful for defaults.`,
    },
    {
      q: 'What are arrow functions and how do they differ from normal functions?',
      a: `**Arrow functions** are a shorter function syntax, but the real differences are behavioural. They have no own \`this\`, \`arguments\`, \`super\` or \`new.target\`; they take them from the enclosing scope. They cannot be used as constructors with \`new\`, and they have no \`prototype\` property.

That makes them ideal for callbacks, array methods and React components or handlers. A normal function is better for object methods that need a dynamic \`this\`, or when you need \`arguments\`, though rest parameters cover that now.`,
    },
    {
      q: 'What are call, apply and bind?',
      a: `All three let you control what \`this\` is inside a function. **call** invokes the function immediately with a given \`this\` and arguments listed one by one. **apply** is the same but takes the arguments as an array.

**bind** does not call the function; it returns a **new function** with \`this\` (and optionally some arguments) permanently fixed. Bind was common in class-based React to keep \`this\` in event handlers; today arrow functions and hooks mostly remove that need.`,
    },
    {
      q: 'What is scope and the scope chain?',
      a: `**Scope** is where a variable is visible. JavaScript has **global**, **function** and **block** scope, and it is **lexical**, meaning scope is decided by where the code is written, not where it is called from.

When you use a variable, the engine looks in the current scope, then the outer one, and keeps going up to global; that path is the **scope chain**. If it is not found anywhere, you get a ReferenceError. Closures are simply functions keeping this chain alive.`,
    },
    {
      q: 'What is event delegation and event bubbling?',
      a: `When an event fires on an element, it first goes down from the root in the **capture** phase, then reaches the target, then **bubbles** back up through the ancestors. \`stopPropagation\` stops that travel.

**Event delegation** uses bubbling: instead of attaching a listener to every list item, you attach one to the parent and check \`event.target\` to see which child was clicked. It saves memory and automatically works for items added later. React itself uses delegation by attaching listeners at the root container.`,
    },
    {
      q: 'What are higher-order functions? Explain map, filter and reduce.',
      a: `A **higher-order function** either takes a function as an argument or returns one. Functions are first-class values in JavaScript, so this is natural.

\`map\` transforms each item and returns a new array of the same length. \`filter\` keeps only items where the callback returns true. \`reduce\` folds the array into a single value like a total, an object or a grouped map. All three return new values instead of changing the original array, which fits well with React and Redux immutability.`,
    },
    {
      q: 'What is the difference between synchronous and asynchronous code in JavaScript?',
      a: `**Synchronous** code runs line by line and blocks: the next line waits for the current one. **Asynchronous** code starts a task, like a network call or timer, and continues; the result is handled later through a callback, promise or \`await\`.

Because JavaScript has one main thread, long synchronous work freezes the UI in the browser or blocks all requests in Node. So I/O should be async, and heavy CPU work should be moved to a Web Worker, a worker thread, or a separate service.`,
    },
    {
      q: 'What is currying?',
      a: `**Currying** turns a function that takes several arguments into a chain of functions that each take one, so \`add(a, b)\` becomes \`add(a)(b)\`. It relies on closures to remember earlier arguments.

The benefit is **partial application**: you fix some arguments once and reuse the result, like a \`logWithLevel('error')\` function or a configured validator. Redux middleware uses this shape too: \`store => next => action => ...\`.`,
    },
    {
      q: 'What are the primitive types, and how do primitives differ from objects?',
      a: `JavaScript has seven **primitives**: string, number, bigint, boolean, undefined, symbol and null. Everything else, including arrays and functions, is an **object**.

Primitives are **immutable** and compared by value. Objects are compared **by reference**, so two objects with the same content are not equal unless they are the same object. This is exactly why React and Redux rely on new references to detect changes, and why mutating an object in place does not trigger a re-render.`,
    },
    {
      q: 'What is a memory leak in JavaScript and what causes it?',
      a: `A **memory leak** is memory that is no longer needed but cannot be garbage collected because something still references it. Common causes are event listeners that are never removed, timers or intervals never cleared, closures holding large objects, global variables, and growing caches or maps.

In React, the usual one is a \`useEffect\` that subscribes to a socket or sets an interval without a cleanup function. With WebSocket notifications in SkillKeepr, closing listeners on unmount is exactly the kind of cleanup that matters.`,
    },
    {
      q: 'What are ES modules and how do they differ from CommonJS?',
      a: `**ES modules** use \`import\` and \`export\`, are the official standard, are loaded asynchronously, and are **statically analysable**, which enables tree shaking. **CommonJS** uses \`require\` and \`module.exports\`, loads synchronously at runtime, and was Node's original system.

Modern Node fully supports ESM through \`"type": "module"\` or \`.mjs\` files, and recent versions can even \`require\` ES modules in many cases. Front-end tools like Vite are built around ESM.`,
    },
    {
      q: 'What are generators?',
      a: `A **generator** is a function declared with \`function*\` that can pause and resume. Calling it returns an iterator; each \`next()\` runs until the next \`yield\` and returns that value. The caller can also send values back in through \`next(value)\`.

They are useful for lazy sequences and custom iterators. The big real-world use I know is **Redux-Saga**, which is built on generators: a saga \`yield\`s effect descriptions like \`call\` and \`put\`, and the middleware runs them, which made the async flows in SkillKeepr easy to test.`,
    },
    {
      q: 'What are Map, Set, WeakMap and WeakSet?',
      a: `A **Map** is a key-value collection where keys can be any type, including objects, and it keeps insertion order and has a \`size\`. A **Set** stores unique values, which is a quick way to remove duplicates from an array.

**WeakMap** and **WeakSet** only hold objects as keys or values and hold them **weakly**, so if nothing else references the object it can be garbage collected. They are not iterable. They suit caching or attaching metadata to objects without causing memory leaks.`,
    },
  ],
};
