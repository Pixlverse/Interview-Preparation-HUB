// TypeScript — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'typescript',
  title: 'TypeScript',
  icon: '🔷',
  description: 'JavaScript with types. Start with annotations, unions and narrowing, then generics, utility types, React/Node typing, and advanced type-level tricks like mapped and conditional types.',
  definitionTitle: 'What is TypeScript?',
  definition: `**TypeScript (TS)** is JavaScript **with types added**. You write normal JavaScript, plus labels like \`name: string\` or \`age: number\`. A tool called the TypeScript compiler checks those labels **before your code runs** and warns you about mistakes, like passing a number where a string was expected.

The types are only for checking. The compiler removes them and outputs plain JavaScript, which is what the browser or Node actually runs.

**One-line answer:** "TypeScript is a typed superset of JavaScript — it adds static types that catch bugs at compile time, then compiles down to plain JavaScript."`,
  topics: [
    {
      id: 'ts-basics-inference',
      title: 'TypeScript Basics: Annotations and Type Inference',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'TypeScript adds types to JavaScript and checks them before the code runs. It can often guess (infer) the types for you.',
      what: `**TypeScript (TS)** is JavaScript plus **types**. A type says what kind of value something is: a \`string\`, a \`number\`, an object with certain keys, and so on.

- A **type annotation** is when you write the type yourself: \`let age: number = 30\`.
- **Type inference** is when TypeScript guesses the type from the value: \`let age = 30\` is already a \`number\`.
- The TS **compiler** (\`tsc\`) checks your code and then removes all types, giving plain JavaScript.

#### Deeper version
Types exist only at **compile time** (while checking the code). At runtime there are no types — this is called **type erasure**. That is why TS cannot validate data coming from an API by itself.

Inference is smart. \`const x = 'hi'\` gets the **literal type** \`'hi'\` (it can never change), while \`let x = 'hi'\` gets the wider type \`string\`. This "widening" matters later for unions and \`as const\`.

Best practice: annotate **function parameters** and **public return types**; let TS infer local variables.`,
      why: `JavaScript only shows type bugs when the code runs — often in production. TypeScript catches them while you type: wrong property names, missing arguments, calling a method on \`undefined\`. It also gives great autocomplete and makes refactoring safe, because renaming a field shows every place that breaks.`,
      analogy: `TypeScript is like a spell-checker for your code. It underlines mistakes while you write. When you print the letter (run the code), the red lines are gone — the spell-checker does not travel with the letter.`,
      code: [
        {
          title: 'Annotations vs inference',
          lang: 'typescript',
          code: `// Annotation: we write the type
let userName: string = 'Asha';

// Inference: TS guesses "number"
let count = 10;
// count = 'ten'; // Error: Type 'string' is not assignable to type 'number'.

// const gets a literal type, let gets a wide type
const role = 'admin'; // type: 'admin'
let mode = 'dark';    // type: string

// Annotate params and return types of functions
function add(a: number, b: number): number {
  return a + b;
}
add(2, 3);     // OK
// add(2, '3'); // Error: Argument of type 'string' is not assignable to parameter of type 'number'.

// Arrays and objects
const tags: string[] = ['ts', 'react'];
const user: { id: number; email?: string } = { id: 1 }; // "?" = optional`,
        },
      ],
      output: `\`count\` was inferred as \`number\`, so giving it a string is a compile error. \`role\` has the exact type \`'admin'\` because it is a \`const\`. Calling \`add(2, '3')\` fails before the code ever runs. After compiling, all the \`: number\` and \`: string\` parts disappear and only plain JavaScript is left.`,
      questions: [
        {
          q: 'What is TypeScript and why use it?',
          a: 'A superset of JavaScript that adds static types. It catches bugs at compile time, gives better autocomplete, and makes large codebases safer to refactor. It compiles to plain JavaScript.',
        },
        {
          q: 'What is type inference?',
          a: 'TypeScript working out the type from the value or context, so you don\'t have to write it. Example: `let n = 5` is inferred as `number`.',
        },
        {
          q: 'Do TypeScript types exist at runtime?',
          a: 'No. Types are erased during compilation. To check data at runtime (like an API body) you need real code — `typeof` checks or a library like Zod.',
        },
        {
          q: 'When should you write type annotations?',
          a: 'On function parameters, exported function return types, and when inference gives a wrong or too-wide type. Let TS infer simple local variables.',
        },
      ],
      spoken: `"TypeScript is JavaScript with static types. The compiler checks my code before it runs, so I catch things like a typo in a property name or passing a string where a number is expected. Then it erases all the types and outputs plain JavaScript. A lot of the time I don't write types myself, because TypeScript infers them from values. I usually annotate function parameters and the return types of exported functions, and let inference handle local variables. One key point: types don't exist at runtime, so for API input I still validate with something like Zod."`,
      mistakes: [
        'Thinking TypeScript checks data at runtime. It does not — types are erased, so external data must be validated with code.',
        'Annotating everything, even `const x: number = 5`. It adds noise; let inference work for obvious cases.',
        'Mixing up `const` literal types and `let` wide types, then being surprised when `let mode = \'dark\'` is not accepted where `\'dark\' | \'light\'` is required.',
        'Follow-up trap: "Is TypeScript a different language from JavaScript?" It is a superset: any valid JS is (mostly) valid TS, and TS compiles down to JS.',
      ],
      takeaway: 'TypeScript checks types at compile time and erases them at runtime — annotate the edges, let inference do the rest.',
    },
    {
      id: 'structural-typing',
      title: 'Structural Typing (Duck Typing) and Excess Property Checks',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'TypeScript compares types by their shape, not their name. If it has the right properties, it fits.',
      what: `TypeScript uses **structural typing**. Two types are compatible if they have the same **shape** (the same properties with the same types). The name of the type does not matter.

So if a function wants \`{ name: string }\`, any object that has a \`name\` string is accepted — even if it has extra fields.

#### Deeper version
Languages like Java and C# use **nominal typing** (types must match by name). TypeScript does not.

There is one special rule: **excess property checking**. When you pass a **fresh object literal** (written directly in place), TS complains about unknown extra properties, because it is probably a typo. If you first store the object in a variable, the check is skipped and extra properties are allowed.

If you really need "same shape but different meaning" (like \`UserId\` vs \`OrderId\`), you use **branded types** (covered later).`,
      why: `JavaScript code passes plain objects around everywhere. Structural typing fits this style: you describe what you need, and any object that has it works. It also makes testing easy — a mock object just needs the right shape.`,
      analogy: `A power socket does not care about the brand of your charger. If the plug has the right shape, it fits. Structural typing is the same: shape over name.`,
      code: [
        {
          title: 'Shape matters, not name',
          lang: 'typescript',
          code: `interface Person { name: string }
interface Pet { name: string }

function greet(p: Person) {
  return 'Hello ' + p.name;
}

const dog: Pet = { name: 'Bruno' };
greet(dog); // OK: Pet has the same shape as Person

const employee = { name: 'Asha', salary: 5000 };
greet(employee); // OK: extra "salary" is allowed from a variable

// greet({ name: 'Ravi', salary: 5000 });
// Error: Object literal may only specify known properties,
// and 'salary' does not exist in type 'Person'.`,
        },
      ],
      output: `\`greet(dog)\` works even though \`dog\` is a \`Pet\`, because both types have \`name: string\`. Passing \`employee\` works because extra fields are fine for a variable. But the inline object literal with \`salary\` fails — that is the excess property check catching a likely typo.`,
      questions: [
        {
          q: 'What is structural typing?',
          a: 'Type compatibility based on the shape (properties and their types), not on the type\'s name. If an object has everything the type needs, it is accepted.',
        },
        {
          q: 'Why does an extra property error only sometimes?',
          a: 'Excess property checks run only on fresh object literals. If the object is stored in a variable first, extra properties are allowed because the object might be used elsewhere.',
        },
        {
          q: 'How do you make two same-shaped types incompatible?',
          a: 'Use a branded type, e.g. `type UserId = string & { __brand: \'UserId\' }`. Now a plain string or an `OrderId` cannot be passed where a `UserId` is needed.',
        },
      ],
      spoken: `"TypeScript uses structural typing, which means it checks the shape of a value, not the name of its type. If a function needs an object with a name string, any object with a name string works, even if it has extra fields. That fits how JavaScript passes plain objects around. The one exception is excess property checking: if I pass an object literal directly, TypeScript flags unknown properties because they're probably typos. If I need nominal-style safety, like not mixing up user IDs and order IDs, I use branded types."`,
      mistakes: [
        'Expecting TypeScript to reject an object just because it was declared as a different interface. Same shape means compatible.',
        'Confusing the excess property error with "extra properties are never allowed". They are allowed when the value is not a fresh literal.',
        'Follow-up trap: "Is a class instance compatible with an interface it does not `implements`?" Yes, if the shape matches. `implements` is only a check, not a requirement. (Classes with `private` fields are the exception — they compare more strictly.)',
      ],
      takeaway: 'TypeScript checks shapes, not names — and only fresh object literals get the extra-property check.',
    },
    {
      id: 'types-vs-interfaces',
      title: 'type vs interface',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Both describe object shapes. interface can be extended and merged; type can also describe unions, tuples and other complex types.',
      what: `\`interface\` and \`type\` (a **type alias**) are very similar, and most of the time you can use either one. The main differences are what they can describe and **how they extend** another shape.

#### interface: extends
Interfaces build on each other with the \`extends\` keyword (like inheritance in classes). If a property clashes, TypeScript **shows an error** straight away.

\`\`\`typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Clash: name was string, now number
interface Cat extends Animal {
  name: number; // ❌ Error: Interface 'Cat' incorrectly extends interface 'Animal'
}
\`\`\`

#### type: & (intersection)
Types combine with \`&\` ("this **and** that"). If a property clashes, there is **no error at that line**. TypeScript quietly merges them, and the property can become \`never\` (a type no value can have).

\`\`\`typescript
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
};

// Clash: name is string & number → never
type Cat = Animal & { name: number };
const tom: Cat = { name: 'Tom' }; // ❌ Error only here: 'string' is not assignable to 'never'
\`\`\`

#### Quick rule
- Describing an **object or class shape**? Either works; many teams prefer \`interface\`.
- Need a **union**, tuple or other complex type (\`'admin' | 'user'\`)? Only \`type\` can do it.

#### Deeper version
Key differences:
- **Declaration merging:** writing \`interface User\` twice merges both into one. Writing \`type User\` twice is an error. Merging is how libraries let you add fields to things like \`Window\` or Express \`Request\`.
- **Extending:** interfaces use \`extends\`; types use **intersection** \`&\`. When two extended interfaces clash on a property, you get a clear error. With \`&\`, conflicts can silently become \`never\`.
- **Power:** only \`type\` can do unions, mapped types, conditional types and template literal types.
- **Performance:** for very large codebases, the TS team has said interface \`extends\` can be faster for the compiler than big intersections — a small detail, but a nice thing to mention.`,
      why: `You need names for your data shapes so you can reuse them across components, API handlers and database models. Knowing which keyword to pick keeps code consistent and lets you use features like merging (for library augmentation) or unions (for state).`,
      analogy: `An \`interface\` is like a job description that HR can add more lines to later (merging). A \`type\` is like a label you can stick on anything — a box, a list, or "either this or that" — but once printed, you cannot add lines to the same label.`,
      code: [
        {
          title: 'Same object, two ways',
          lang: 'typescript',
          code: `interface UserI {
  id: number;
  name: string;
}

type UserT = {
  id: number;
  name: string;
};

// Extending
interface AdminI extends UserI { role: 'admin' }
type AdminT = UserT & { role: 'admin' };

// Only "type" can do unions and tuples
type Status = 'idle' | 'loading' | 'success' | 'error';
type Point = [number, number];`,
        },
        {
          title: 'Declaration merging (interface only)',
          lang: 'typescript',
          code: `interface Config { apiUrl: string }
interface Config { timeout: number } // merges with the one above

const cfg: Config = { apiUrl: '/api', timeout: 5000 }; // needs both

type Settings = { theme: string };
// type Settings = { lang: string };
// Error: Duplicate identifier 'Settings'.`,
        },
      ],
      output: `\`UserI\` and \`UserT\` are interchangeable for normal use. \`Status\` and \`Point\` can only be written with \`type\`. In the second example the two \`Config\` interfaces merge into one shape with both \`apiUrl\` and \`timeout\`, while declaring \`Settings\` twice is a compile error.`,
      questions: [
        {
          q: 'What is the difference between type and interface?',
          a: 'Both describe object shapes. Interfaces support declaration merging and `extends`. Types can describe anything — unions, tuples, primitives, mapped and conditional types — but cannot be re-opened.',
        },
        {
          q: 'Which one do you use by default?',
          a: 'A common rule: `interface` for object shapes and public APIs (they can be extended and merged), `type` for unions, tuples and computed types. Being consistent in the team matters more than the choice.',
        },
        {
          q: 'What is declaration merging and when is it useful?',
          a: 'Two `interface` declarations with the same name combine into one. It is used to augment library types, like adding `user` to Express `Request` or a custom property to `Window`.',
        },
        {
          q: 'Can a class implement a type alias?',
          a: 'Yes, as long as the type is an object shape (not a union). `class A implements SomeType {}` works.',
        },
      ],
      spoken: `"Both type and interface let me name a shape, and for a plain object they behave almost the same. The differences: interfaces support declaration merging, so I can re-open them — that's how we augment library types like Express Request. Interfaces extend with the extends keyword. Type aliases are more flexible: they can describe unions, tuples, primitives, and mapped or conditional types, but they can't be merged. In practice I use interfaces for object shapes and props, and type for unions like a status field or for utility-based types."`,
      mistakes: [
        'Saying "interfaces are only for classes". They are mainly for object shapes in general.',
        'Trying to write a union with `interface`. Unions need `type`.',
        'Accidentally merging two interfaces with the same name in a global file and getting surprising required fields.',
        'Follow-up trap: "What happens if two intersected types have the same key with different types?" The property becomes the intersection of both, e.g. `string & number`, which is `never` — no value can satisfy it.',
      ],
      takeaway: 'Use interface for extendable object shapes, type for unions and anything computed — and know that only interfaces merge.',
    },
    {
      id: 'unions-intersections',
      title: 'Union and Intersection Types',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A union (A | B) means "one of these". An intersection (A & B) means "all of these at once".',
      what: `- A **union type** \`A | B\` means the value is **either** \`A\` **or** \`B\`. Example: \`string | number\`.
- An **intersection type** \`A & B\` means the value is **both** \`A\` **and** \`B\` — it has all properties of both.

**Literal unions** are very common: \`type Size = 'sm' | 'md' | 'lg'\` — only these three strings are allowed.

#### Deeper version
With a union, you can only use what is **common** to all members until you **narrow** it (check which one it is). For \`string | number\`, you cannot call \`.toUpperCase()\` directly, because numbers don't have it.

With object types, intersections **combine** properties. With primitives, \`string & number\` is impossible, so it becomes \`never\`.

A funny-but-asked detail: on a union of objects, you can only access keys that exist on **every** member. On an intersection, you can access keys from **any** member.`,
      why: `Real data is often "one of several things": an ID that can be a string or number, a status that is one of a few words, an API response that is success or error. Unions model this exactly. Intersections let you build bigger types from small reusable pieces, like \`User & Timestamps\`.`,
      analogy: `A union is a menu choice: "tea **or** coffee" — you get one, and you must check which before you drink. An intersection is a combo meal: "burger **and** fries" — you get everything.`,
      code: [
        {
          title: 'Union with narrowing',
          lang: 'typescript',
          code: `type Id = string | number;

function formatId(id: Id): string {
  // id.toUpperCase();
  // Error: Property 'toUpperCase' does not exist on type 'number'.
  if (typeof id === 'string') {
    return id.toUpperCase(); // here id is string
  }
  return id.toFixed(0);      // here id is number
}

type Size = 'sm' | 'md' | 'lg';
let s: Size = 'md';
// s = 'xl'; // Error: Type '"xl"' is not assignable to type 'Size'.`,
        },
        {
          title: 'Intersection to combine shapes',
          lang: 'typescript',
          code: `type Timestamps = { createdAt: Date; updatedAt: Date };
type Product = { id: string; price: number };

type ProductDoc = Product & Timestamps;

const p: ProductDoc = {
  id: 'p1',
  price: 499,
  createdAt: new Date(),
  updatedAt: new Date(),
}; // must have ALL four fields

type Impossible = string & number; // never`,
        },
      ],
      output: `In \`formatId\`, TS blocks \`toUpperCase()\` until we check \`typeof id === 'string'\`. Inside that \`if\`, \`id\` is a \`string\`; after it, TS knows it must be a \`number\`. \`s = 'xl'\` fails because \`'xl'\` is not in the union. \`ProductDoc\` requires all four fields, and \`string & number\` collapses to \`never\`.`,
      questions: [
        {
          q: 'What is the difference between a union and an intersection?',
          a: 'A union `A | B` is one of the types. An intersection `A & B` is all of the types at once — for objects it has the properties of both.',
        },
        {
          q: 'Why can\'t you call a string method on a string | number?',
          a: 'Because TS only allows members that exist on every union member. You must narrow first, e.g. with `typeof x === \'string\'`.',
        },
        {
          q: 'What is a literal type?',
          a: 'A type that is one exact value, like `\'admin\'` or `42`. A union of literals (`\'admin\' | \'user\'`) works like a lightweight enum.',
        },
        {
          q: 'What is string & number?',
          a: '`never`, because no value can be both a string and a number.',
        },
      ],
      spoken: `"A union type, written with a pipe, means the value is one of several types — like string or number, or a set of literal strings such as 'idle', 'loading', 'error'. Before using it I narrow it with typeof, in, or a discriminant field, and then TypeScript knows the exact type in each branch. An intersection, written with an ampersand, means the value has all the types at once, so for objects it combines their properties — I use it for things like adding timestamps to a model. If intersected primitives conflict, the result becomes never."`,
      mistakes: [
        'Mixing up the meaning: thinking `A | B` gives you all properties of A and B. That is `&`.',
        'Using a union value without narrowing and fighting "property does not exist" errors with `as`.',
        'Intersecting object types with conflicting property types and getting a hidden `never` field.',
        'Follow-up trap: "For a union of two object types, which keys can you access?" Only the keys common to all members, until you narrow.',
      ],
      takeaway: 'Union = one of them (narrow before use); intersection = all of them combined.',
    },
    {
      id: 'unknown-vs-any',
      title: 'any vs unknown',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'any turns off type checking. unknown is the safe version: you must check the type before using it.',
      what: `- \`any\` means "I don't care about the type". TS stops checking. You can call any method, read any property — even if it crashes at runtime.
- \`unknown\` means "I don't know the type yet". You can store anything in it, but you **cannot use it** until you **narrow** it (check what it is).

#### Deeper version
Both are **top types** — every value can be assigned to them. The difference is what you can do **after**:
- \`any\` can be assigned to every other type too, so it **spreads** silently through your code ("any is contagious").
- \`unknown\` can only be assigned to \`unknown\` or \`any\` until narrowed.

In a \`catch (err)\` block, \`err\` is \`unknown\` when \`useUnknownInCatchVariables\` is on (it is part of \`strict\` since TS 4.4). \`JSON.parse()\` and \`res.json()\` return \`any\` by default, which is a common place where \`any\` sneaks in.`,
      why: `Data from the outside world — API responses, \`JSON.parse\`, user input, errors — has no guaranteed type. \`unknown\` forces you to check before you trust it, which prevents runtime crashes. \`any\` is an escape hatch for migrations or truly dynamic code, but too much of it removes the whole point of TypeScript.`,
      analogy: `\`any\` is like eating food from a box with no label without looking. \`unknown\` is the same unlabeled box, but you must open it and check before you eat.`,
      code: [
        {
          title: 'any lets bugs through, unknown stops them',
          lang: 'typescript',
          code: `let a: any = 'hello';
a.toFixed(2); // No compile error... but crashes at runtime: a.toFixed is not a function

let u: unknown = 'hello';
// u.toUpperCase(); // Error: 'u' is of type 'unknown'.

if (typeof u === 'string') {
  console.log(u.toUpperCase()); // OK after narrowing -> "HELLO"
}

// any spreads; unknown does not
const n1: number = a; // allowed (dangerous)
// const n2: number = u; // Error: Type 'unknown' is not assignable to type 'number'.`,
        },
        {
          title: 'Safe error handling with unknown',
          lang: 'typescript',
          code: `async function loadUser() {
  try {
    const res = await fetch('/api/user');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err: unknown) {
    // err could be anything: Error, string, object...
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed:', message);
    return null;
  }
}`,
        },
      ],
      output: `With \`any\`, \`a.toFixed(2)\` compiles but throws a TypeError when it runs. With \`unknown\`, TS refuses \`u.toUpperCase()\` until we prove \`u\` is a string; then it prints \`HELLO\`. In the catch block we check \`instanceof Error\` before reading \`.message\`, so even \`throw 'oops'\` is handled safely.`,
      questions: [
        {
          q: 'What is the difference between any and unknown?',
          a: 'Both accept any value. `any` disables checking, so you can do anything with it. `unknown` forces you to narrow the type before using it, so it is type-safe.',
        },
        {
          q: 'When is any acceptable?',
          a: 'During a JS-to-TS migration, for quick prototypes, or for truly dynamic code where typing is not worth it. Prefer `unknown` and narrow, and keep `any` rare and visible (lint rule `no-explicit-any`).',
        },
        {
          q: 'What is the type of err in a catch block?',
          a: 'It is `unknown` with `strict` (via `useUnknownInCatchVariables`), otherwise `any`. Anything can be thrown in JS, so you must check, e.g. `err instanceof Error`.',
        },
        {
          q: 'What is implicit any?',
          a: 'When TS cannot infer a type (like an unannotated parameter) it falls back to `any`. `noImplicitAny` (part of `strict`) turns that into an error.',
        },
      ],
      spoken: `"Both any and unknown can hold any value, but they behave very differently. any switches off type checking — I can call anything on it and it also leaks into other variables, so bugs slip through to runtime. unknown is the type-safe version: I can store anything, but I have to narrow it first with typeof, instanceof, or a type guard before using it. I use unknown for external data like JSON, API responses, and caught errors. any I keep for migrations or rare escape hatches, and I keep noImplicitAny on."`,
      mistakes: [
        'Using `any` for API responses and then trusting fields that may not exist.',
        'Reading `err.message` in a catch block without checking `err instanceof Error` first.',
        'Silencing an `unknown` with `as SomeType` instead of actually checking it — that is the same as `any` with extra steps.',
        'Follow-up trap: "What is the opposite of unknown?" `never` is the bottom type (no value fits it), while `unknown` is the top type (every value fits it).',
      ],
      takeaway: 'Prefer unknown over any: accept anything, but prove the type before you use it.',
    },
    {
      id: 'enums',
      title: 'Enums (and Their Alternatives)',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Enums give names to a fixed set of values. Many teams prefer string literal unions or "as const" objects instead.',
      what: `An **enum** is a named set of constants, like \`Role.Admin\` and \`Role.User\`.

- **Numeric enum:** values are numbers, starting at 0 by default.
- **String enum:** each member has a string value you choose.

Unlike most TS features, an enum **creates real JavaScript code** (an object) at runtime.

#### Deeper version
- Numeric enums have a **reverse mapping**: \`Direction[0]\` gives \`'Up'\`. String enums do not.
- Numeric enums are loosely checked in older TS versions (any number could be assigned). TS 5.0 made enums stricter, but string enums or unions are still clearer.
- \`const enum\` is inlined at compile time (no runtime object), but it does not work well with tools that compile file-by-file (Babel, esbuild, \`isolatedModules\`).
- Newer Node.js versions can run \`.ts\` files by **stripping types**, and that mode does not support enums (they need code generation). Check the current Node docs, as this area is changing.

The popular alternatives are a **string literal union** (\`'admin' | 'user'\`) or an **\`as const\` object** — both are plain JavaScript-friendly.`,
      why: `Fixed sets of values (roles, order statuses, payment states) appear everywhere. Giving them names avoids "magic strings" and typos. Knowing the trade-offs between enums and unions is a classic interview discussion.`,
      analogy: `An enum is like the floor buttons in a lift: you can only press the floors that exist. A literal union is the same idea, written as a simple list on a sticky note instead of a whole button panel.`,
      code: [
        {
          title: 'Numeric and string enums',
          lang: 'typescript',
          code: `enum Direction { Up, Down, Left, Right } // 0, 1, 2, 3
console.log(Direction.Up); // 0
console.log(Direction[0]); // "Up" (reverse mapping, numeric only)

enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Shipped = 'SHIPPED',
}

function canShip(s: OrderStatus) {
  return s === OrderStatus.Paid;
}
canShip(OrderStatus.Paid); // true
// canShip('PAID');
// Error: Argument of type '"PAID"' is not assignable to parameter of type 'OrderStatus'.`,
        },
        {
          title: 'Common alternatives: union and as const',
          lang: 'typescript',
          code: `// 1) String literal union: zero runtime code
type Role = 'admin' | 'editor' | 'viewer';
const r: Role = 'admin';

// 2) as const object: runtime values + a type
const ORDER_STATUS = {
  Pending: 'PENDING',
  Paid: 'PAID',
} as const;

type OrderStatusValue = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
// 'PENDING' | 'PAID'

function isPaid(s: OrderStatusValue) {
  return s === ORDER_STATUS.Paid;
}
isPaid('PAID'); // OK: plain strings work`,
        },
      ],
      output: `\`Direction.Up\` prints \`0\` and \`Direction[0]\` prints \`"Up"\` thanks to the reverse mapping. With a string enum, passing the raw string \`'PAID'\` is an error — you must use \`OrderStatus.Paid\`. The \`as const\` version gives you both a runtime object and a union type \`'PENDING' | 'PAID'\`, and plain strings are accepted.`,
      questions: [
        {
          q: 'What is an enum in TypeScript?',
          a: 'A named set of constant values. It is one of the few TS features that generates JavaScript code — a real object at runtime.',
        },
        {
          q: 'Numeric vs string enums?',
          a: 'Numeric enums auto-number from 0 and have reverse mapping. String enums need explicit values, are more readable in logs and JSON, and have no reverse mapping.',
        },
        {
          q: 'Why do some teams avoid enums?',
          a: 'They add runtime code, `const enum` breaks with isolated-module tools, they are not "just JavaScript", and a string literal union or `as const` object does the same job more simply.',
        },
        {
          q: 'What is a const enum?',
          a: 'An enum whose values are inlined at compile time, so no object is emitted. It can cause problems with Babel/esbuild and with `isolatedModules`.',
        },
      ],
      spoken: `"An enum is a named set of constants, like order statuses. Numeric enums start at zero and have a reverse mapping, and string enums need explicit values, which I prefer because they read well in logs and the database. Unlike most TypeScript features, enums generate real JavaScript. Because of that, and because const enums don't play well with tools like esbuild, many teams — including mine — prefer string literal unions, or an as const object when we also need the values at runtime. That gives the same safety with plain JavaScript."`,
      mistakes: [
        'Using numeric enums for data stored in a database. If someone reorders members, the stored numbers now mean something else. Use string values.',
        'Thinking enums disappear at compile time like other types. Regular enums emit a runtime object.',
        'Using `const enum` in a project compiled by Babel, esbuild or SWC and getting broken imports.',
        'Follow-up trap: "How do you get a union type from an as const object?" `typeof OBJ[keyof typeof OBJ]`.',
      ],
      takeaway: 'Enums name a fixed set of values but emit runtime code — string unions or as const objects are the lighter, popular alternative.',
    },
    {
      id: 'type-narrowing',
      title: 'Type Narrowing',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Narrowing is how TypeScript goes from a wide type (string | number) to an exact one, using normal checks like typeof, instanceof and in.',
      what: `**Narrowing** means making a type more specific. When you write a normal JavaScript check, TypeScript reads it and **updates the type** inside that branch.

Common ways to narrow:
- \`typeof x === 'string'\` — for primitives.
- \`x instanceof Date\` — for classes.
- \`'email' in user\` — checks if a property exists.
- **Truthiness**: \`if (user)\` removes \`null\` and \`undefined\`.
- **Equality**: \`if (status === 'done')\`.

#### Deeper version
TypeScript does **control flow analysis**: it follows \`if\`, \`else\`, \`return\`, \`switch\` and \`throw\` to know the type at every line. After an early \`return\`, the rest of the function has the narrowed type.

Watch out:
- \`typeof null === 'object'\`, so \`typeof x === 'object'\` does **not** remove \`null\`.
- Truthiness also removes \`0\` and \`''\`, which may be valid values.
- Narrowing on an object property can be "forgotten" after a function call or inside a callback, because TS cannot be sure the object was not changed. Copy the value into a \`const\` to keep the narrowing.`,
      why: `Unions are everywhere (\`User | null\`, \`string | number\`, API success or error). Narrowing lets you use them safely without casting. It is the everyday skill that makes TypeScript feel natural instead of annoying.`,
      analogy: `It is like a security check at an airport. Everyone starts as "passenger". After checking the boarding pass, you are now "passenger for gate 12" and can go to that gate only.`,
      code: [
        {
          title: 'The main narrowing tools',
          lang: 'typescript',
          code: `type Input = string | number | Date | null;

function describe(x: Input): string {
  if (x === null) return 'nothing';          // equality
  if (typeof x === 'string') return x.trim(); // x: string
  if (x instanceof Date) return x.toISOString(); // x: Date
  return x.toFixed(2);                       // x: number (only one left)
}

type Card = { kind: 'card'; last4: string };
type Upi = { kind: 'upi'; vpa: string };

function label(p: Card | Upi) {
  if ('last4' in p) return 'Card ****' + p.last4; // p: Card
  return 'UPI ' + p.vpa;                           // p: Upi
}`,
        },
        {
          title: 'Truthiness trap',
          lang: 'typescript',
          code: `function showQty(qty: number | undefined) {
  if (!qty) return 'No quantity'; // BUG: 0 is treated as "no quantity"
  return 'Qty: ' + qty;
}
console.log(showQty(0)); // "No quantity" (wrong)

function showQtyFixed(qty: number | undefined) {
  if (qty === undefined) return 'No quantity';
  return 'Qty: ' + qty;
}
console.log(showQtyFixed(0)); // "Qty: 0"`,
        },
      ],
      output: `In \`describe\`, each check removes one type. After the string and Date checks, only \`number\` is left, so \`x.toFixed(2)\` is allowed without any cast. In \`label\`, the \`in\` check splits Card from Upi. The truthiness example shows a real bug: \`!qty\` treats \`0\` as missing, while \`qty === undefined\` is exact.`,
      questions: [
        {
          q: 'What is type narrowing?',
          a: 'Refining a wide type to a more specific one inside a code branch, based on runtime checks like `typeof`, `instanceof`, `in`, equality or truthiness.',
        },
        {
          q: 'Why doesn\'t typeof x === "object" remove null?',
          a: 'Because in JavaScript `typeof null` is `"object"`. You must also check `x !== null`.',
        },
        {
          q: 'What is control flow analysis?',
          a: 'TypeScript tracking the type of a variable through `if`, `return`, `switch` and `throw`, so after an early return the variable keeps its narrowed type.',
        },
        {
          q: 'How do you narrow when typeof/instanceof are not enough?',
          a: 'Use the `in` operator, a discriminant field (discriminated union), or a custom type guard function that returns `value is Type`.',
        },
      ],
      spoken: `"Narrowing is how TypeScript turns a wide type into a specific one inside a branch. I just write normal JavaScript checks — typeof for primitives, instanceof for classes, the in operator for object shapes, or an equality check on a field — and TypeScript's control flow analysis updates the type. After an early return, the rest of the function keeps the narrowed type. Two traps I watch for: typeof null is 'object', and truthiness checks drop zero and empty strings. When built-in checks aren't enough, I write a custom type guard."`,
      mistakes: [
        'Using `if (!value)` for numbers or strings and accidentally treating `0` or `\'\'` as missing.',
        'Forgetting that `typeof x === \'object\'` still allows `null`.',
        'Using `instanceof` on plain objects or interfaces — interfaces do not exist at runtime, so you cannot `instanceof` them.',
        'Follow-up trap: "Why is my narrowed property back to the union inside a callback?" TS cannot prove the object wasn\'t changed before the callback runs. Store it in a `const` first.',
      ],
      takeaway: 'Write normal JS checks and TypeScript narrows the type for you — just know the typeof null and truthiness traps.',
    },
    {
      id: 'readonly',
      title: 'readonly, Readonly Arrays and Immutability',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'readonly stops a property or array from being changed — but only at compile time, and only one level deep.',
      what: `The \`readonly\` keyword marks a property that **cannot be re-assigned** after it is created.

- On a property: \`readonly id: string\`.
- On an array: \`readonly string[]\` or \`ReadonlyArray<string>\` — no \`push\`, \`pop\`, \`splice\`, or index assignment.
- \`Readonly<T>\` is a utility type that makes **all** properties of \`T\` readonly.

#### Deeper version
- \`readonly\` is a **compile-time** check only. At runtime the object can still be changed (use \`Object.freeze\` if you need runtime protection).
- It is **shallow**: \`readonly user: { name: string }\` stops replacing \`user\`, but \`user.name\` can still change. For deep immutability you write a recursive \`DeepReadonly<T>\` type.
- A mutable array can be passed where a \`readonly\` array is expected, but **not** the other way around.
- \`readonly\` (TS) is different from \`const\` (JS): \`const\` is about the **variable**, \`readonly\` is about a **property**.`,
      why: `Accidental mutation causes real bugs — especially in React, where mutating state or props breaks re-renders. Marking data as readonly documents intent and makes the compiler catch mutation. Function parameters like \`readonly Item[]\` promise the caller "I won't change your array".`,
      analogy: `It is like a "view only" Google Doc link. You can read everything, but the edit buttons are greyed out. However, someone with the original file (runtime JS) can still change it.`,
      code: [
        {
          title: 'readonly properties and arrays',
          lang: 'typescript',
          code: `interface User {
  readonly id: string;
  name: string;
}

const u: User = { id: 'u1', name: 'Asha' };
u.name = 'Ravi'; // OK
// u.id = 'u2'; // Error: Cannot assign to 'id' because it is a read-only property.

function total(prices: readonly number[]): number {
  // prices.push(10); // Error: Property 'push' does not exist on type 'readonly number[]'.
  return prices.reduce((sum, p) => sum + p, 0);
}
console.log(total([100, 250])); // 350`,
        },
        {
          title: 'Readonly<T> is shallow',
          lang: 'typescript',
          code: `type Settings = { theme: string; limits: { max: number } };

const s: Readonly<Settings> = { theme: 'dark', limits: { max: 10 } };
// s.theme = 'light'; // Error: Cannot assign to 'theme' because it is a read-only property.
s.limits.max = 99;    // Allowed! readonly is only one level deep

// A simple deep version
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};`,
        },
      ],
      output: `Changing \`u.name\` works, but changing \`u.id\` is a compile error. \`total\` cannot push into \`prices\` and prints \`350\`. In the second block, \`s.theme\` is protected but \`s.limits.max = 99\` compiles, because \`Readonly\` only protects the top level. \`DeepReadonly\` fixes that by applying itself recursively.`,
      questions: [
        {
          q: 'What is the difference between readonly and const?',
          a: '`const` stops re-assigning a variable (JS, runtime). `readonly` stops re-assigning a property (TS, compile time only).',
        },
        {
          q: 'Is readonly deep?',
          a: 'No, it is shallow. Nested objects can still be changed. Use a recursive `DeepReadonly` type or `as const` for literals.',
        },
        {
          q: 'Does readonly protect the object at runtime?',
          a: 'No. Types are erased. For runtime protection use `Object.freeze` (also shallow).',
        },
        {
          q: 'Can you pass a string[] where readonly string[] is expected?',
          a: 'Yes. A mutable array is safe to treat as read-only. The reverse is an error, because the function might mutate it.',
        },
      ],
      spoken: `"readonly marks a property or array so it can't be re-assigned or mutated, and the compiler enforces it. On arrays it removes methods like push and splice. Readonly of T makes every property readonly. Two things to remember: it's only compile time — at runtime the object is still mutable unless I use Object.freeze — and it's shallow, so nested objects can still change. I use readonly arrays on function parameters to promise I won't mutate the caller's data, which is especially useful with React state."`,
      mistakes: [
        'Believing `readonly` makes data immutable at runtime.',
        'Expecting `Readonly<T>` to protect nested objects.',
        'Confusing `readonly` (property) with `const` (variable binding).',
        'Follow-up trap: "Can a readonly property be set in a class?" Yes — in its declaration or inside the constructor, but not after.',
      ],
      takeaway: 'readonly is a shallow, compile-time-only promise of no mutation — great for parameters and state.',
    },
    {
      id: 'generics',
      title: 'Generics',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Generics are type parameters: write one function or type that works for many types while keeping full type safety.',
      what: `A **generic** is a type **variable** — a placeholder like \`T\` that gets filled in when you use the function or type.

Instead of writing \`firstString\`, \`firstNumber\` and \`firstUser\`, you write one \`first<T>(arr: T[]): T\`. TypeScript fills \`T\` from the arguments.

You already use generics: \`Array<string>\`, \`Promise<User>\`, \`useState<number>()\`.

#### Deeper version
- **Constraints** limit what \`T\` can be: \`<T extends { id: string }>\` means "any type that has an \`id\`".
- **Defaults**: \`<T = string>\` is used when nothing is given or inferred.
- **Multiple params**: \`<K extends keyof T, T>\` connects types, e.g. "K must be a key of T".
- TS usually **infers** \`T\` from arguments, so you rarely write \`fn<string>(...)\` yourself.
- A generic is only useful if \`T\` appears in **two places** (e.g. input and output). If it appears once, a normal type is enough.
- In \`.tsx\` files, an arrow generic \`<T>() =>\` can be confused with JSX; write \`<T,>() =>\` or \`<T extends unknown>() =>\`.`,
      why: `Without generics you either duplicate code for each type or use \`any\` and lose type safety. Generics give reusable code (API clients, hooks, lists, repositories) that still returns the exact type, so autocomplete and errors keep working.`,
      analogy: `A generic is like a lunch box with a label slot. The box is the same every day; you just slide in a label: "rice", "pasta", "salad". Whatever you put in, you know exactly what you will get out.`,
      code: [
        {
          title: 'Generic function with inference and constraint',
          lang: 'typescript',
          code: `function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([1, 2, 3]);      // T = number -> n: number | undefined
const s = first(['a', 'b']);     // T = string

// Constraint: T must have an id
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}
const users = [{ id: 'u1', name: 'Asha' }];
const found = findById(users, 'u1'); // found: { id: string; name: string } | undefined
// findById([1, 2], '1');
// Error: Type 'number' is not assignable to type '{ id: string; }'.`,
        },
        {
          title: 'Generic API response and fetch helper',
          lang: 'typescript',
          code: `type ApiResponse<T> = {
  data: T;
  error: string | null;
};

async function getJson<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) return { data: null as T, error: 'HTTP ' + res.status };
  const data = (await res.json()) as T; // trust boundary: validate in real apps
  return { data, error: null };
}

type Product = { id: string; price: number };
const result = await getJson<Product[]>('/api/products');
result.data.map((p) => p.price); // p is Product`,
        },
        {
          title: 'keyof constraint links two parameters',
          lang: 'typescript',
          code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: 'Asha', age: 30 };
const age = getProp(user, 'age');   // number
// getProp(user, 'email');
// Error: Argument of type '"email"' is not assignable to parameter of type '"name" | "age"'.`,
        },
      ],
      output: `\`first\` returns \`number | undefined\` for a number array and \`string | undefined\` for a string array — same code, exact types. \`findById\` refuses an array of numbers because they have no \`id\`. \`getJson<Product[]>\` gives typed \`result.data\`, so \`p.price\` autocompletes. \`getProp(user, 'age')\` returns \`number\`, and an unknown key is a compile error.`,
      questions: [
        {
          q: 'What are generics and why use them?',
          a: 'Type parameters that let one function, class or type work with many types while keeping type safety. They avoid duplication and avoid `any`.',
        },
        {
          q: 'What does T extends something mean in a generic?',
          a: 'It is a constraint: `T` can be any type, as long as it is assignable to that something. It lets you safely use properties of `T` inside the function.',
        },
        {
          q: 'How do you type a function that returns a property of an object?',
          a: '`function get<T, K extends keyof T>(obj: T, key: K): T[K]`. `K` must be a key of `T` and the return type is the type of that key.',
        },
        {
          q: 'Do you have to pass the generic type explicitly?',
          a: 'Usually no — TS infers it from the arguments. You pass it explicitly when it cannot be inferred, like `useState<User | null>(null)` or `getJson<Product[]>(url)`.',
        },
      ],
      spoken: `"Generics are type parameters. Instead of writing the same function for strings, numbers and users, or giving up with any, I write it once with a placeholder T, and TypeScript fills it in from the arguments. I add constraints with extends, like T extends an object with an id, so I can safely read item.id. A pattern I use a lot is K extends keyof T to tie a key parameter to an object. In real code I use generics for API response wrappers, fetch helpers, custom hooks and repository classes, so the exact type flows through."`,
      mistakes: [
        'Using a generic that appears only once, like `function log<T>(x: T): void`. A plain `unknown` parameter is simpler.',
        'Writing `<T>` arrow functions in `.tsx` files — the parser reads it as JSX. Use `<T,>`.',
        'Thinking `getJson<User>()` validates the data. It only tells TS to trust it; the server can still send anything.',
        'Follow-up trap: "What is the difference between `T extends string` in a generic and in a conditional type?" In a generic it is a constraint; in a conditional type (`T extends string ? A : B`) it is a test.',
      ],
      takeaway: 'Generics are function parameters for types — write once, keep exact types, and constrain with extends.',
    },
    {
      id: 'never-type',
      title: 'The never Type and Exhaustive Checks',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'never means "this can never happen". It is used for functions that never return and for exhaustive switch checks.',
      what: `\`never\` is the type with **no values at all**. If something has type \`never\`, it should be impossible to reach.

You see \`never\` in three places:
1. A function that **never returns** — it always throws or loops forever.
2. After you have **narrowed away every option** in a union — nothing is left.
3. Impossible types, like \`string & number\`.

#### Deeper version
\`never\` is the **bottom type**: it can be assigned to every type, but nothing (except \`never\`) can be assigned to it. That second rule is what makes **exhaustive checks** work: if you add a new member to a union and forget to handle it, the leftover value is no longer \`never\`, so assigning it to a \`never\` variable becomes a compile error.

In conditional types, returning \`never\` **removes** a member from a union. That is how \`Exclude\` and \`NonNullable\` work.

Note: a function with no return statement returns \`void\`, not \`never\`. \`never\` is only for functions that cannot finish normally.`,
      why: `When a union grows (a new order status, a new payment method), you want the compiler to point at every \`switch\` that doesn't handle it yet. The \`never\` exhaustive check turns "forgot a case" from a production bug into a compile error.`,
      analogy: `\`never\` is like the "lost and found" box at the end of sorting mail. If every letter went into the right slot, the box stays empty. If a letter ends up there, an alarm rings (compile error) — you forgot a slot.`,
      code: [
        {
          title: 'Exhaustive switch with never',
          lang: 'typescript',
          code: `type PaymentStatus = 'pending' | 'succeeded' | 'failed';

function assertNever(value: never): never {
  throw new Error('Unhandled value: ' + value);
}

function statusMessage(s: PaymentStatus): string {
  switch (s) {
    case 'pending':   return 'Waiting for payment';
    case 'succeeded': return 'Paid!';
    case 'failed':    return 'Payment failed';
    default:
      return assertNever(s); // s is never here
  }
}

// If someone adds 'refunded' to PaymentStatus and forgets a case:
// Error: Argument of type '"refunded"' is not assignable to parameter of type 'never'.`,
        },
        {
          title: 'Functions that never return',
          lang: 'typescript',
          code: `function fail(message: string): never {
  throw new Error(message);
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) fail('Missing env var ' + name);
  return value; // TS knows value is string here, because fail() never returns
}`,
        },
      ],
      output: `In the switch, every case returns, so in \`default\` the variable \`s\` has type \`never\`. If a new status like \`'refunded'\` is added, \`s\` in \`default\` becomes \`'refunded'\`, and passing it to \`assertNever\` fails to compile — the compiler points straight to the missing case. In \`getEnv\`, because \`fail\` returns \`never\`, TS knows that after the \`if\` the value must be a \`string\`.`,
      questions: [
        {
          q: 'What is the never type?',
          a: 'The type with no possible values. It is used for functions that never return, for impossible states after full narrowing, and for removing members in conditional types.',
        },
        {
          q: 'What is the difference between void and never?',
          a: '`void` means a function returns nothing useful but does finish. `never` means it never finishes normally — it throws or loops forever.',
        },
        {
          q: 'How do you do an exhaustive check?',
          a: 'In the `default` branch, assign the value to a `never` variable or pass it to `assertNever(x: never)`. If a case is missing, the value is not `never` and compilation fails.',
        },
        {
          q: 'What is string & number?',
          a: '`never`, because no value can be both.',
        },
      ],
      spoken: `"never is the type with no values — it represents something that can't happen. A function that always throws returns never. More usefully, after I've handled every member of a union, the remaining type is never, and I use that for exhaustive checks: in the default case of a switch I pass the value to an assertNever function that accepts never. If a teammate later adds a new status and forgets to handle it, the build fails right there. It's also how conditional types filter unions — returning never drops a member."`,
      mistakes: [
        'Typing a function with no return as `never`. That is `void`; `never` is only for functions that cannot complete.',
        'Leaving out the `default: assertNever(x)` and relying on memory to update every switch.',
        'Using `default: return null` in a switch over a union — it silently swallows new cases.',
        'Follow-up trap: "Why is `never` assignable to everything?" Because it has no values, so the promise "every value of never is also a string" is trivially true. That is what "bottom type" means.',
      ],
      takeaway: 'never is the empty type — use it with assertNever so a forgotten union case becomes a compile error.',
    },
    {
      id: 'type-guards',
      title: 'Custom Type Guards (is) and Assertion Functions (asserts)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A type guard is a function returning "value is Type". It does a runtime check and tells TypeScript the result.',
      what: `Sometimes \`typeof\` and \`instanceof\` are not enough — for example, checking that an \`unknown\` value is a \`User\` object. A **user-defined type guard** is a function whose return type is \`value is SomeType\`.

- If it returns \`true\`, TypeScript narrows the value to \`SomeType\` in that branch.
- If it returns \`false\`, TypeScript narrows it to "not SomeType" in the else branch.

#### Deeper version
- **Assertion functions** use \`asserts value is Type\`. They return nothing; they **throw** if the check fails. After calling them, the value is narrowed for the rest of the scope.
- \`asserts value\` (without "is") narrows away falsy values, like Node's \`assert(value)\`.
- TypeScript **trusts** your guard. If the logic is wrong, TS will happily narrow to the wrong type — the guard is only as good as its code.
- Guards work great with \`.filter\`: \`items.filter(isDefined)\` turns \`(T | undefined)[]\` into \`T[]\`. Since TS 5.5, TS can **infer** a type predicate for simple arrow functions like \`x => x !== undefined\`, so \`.filter(x => x !== undefined)\` narrows too. Older versions needed an explicit guard.`,
      why: `Data from APIs, \`localStorage\`, webhooks (like Stripe events) or LLM responses arrives as \`unknown\`. A type guard is a reusable, named runtime check that also teaches the compiler the type, so the rest of your code is safe without \`as\` casts.`,
      analogy: `A type guard is a bouncer checking IDs at a club. Once the bouncer says "yes, 18+", everyone inside treats you as an adult. But if the bouncer is careless, the club still trusts him — so the bouncer must do a real check.`,
      code: [
        {
          title: 'value is Type',
          lang: 'typescript',
          code: `type User = { id: string; email: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'email' in value && typeof value.email === 'string'
  );
}

const data: unknown = JSON.parse('{"id":"u1","email":"a@b.com"}');
if (isUser(data)) {
  console.log(data.email); // data: User -> "a@b.com"
}

// Filtering out undefined
function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}
const ids = ['a', undefined, 'b'].filter(isDefined); // string[]`,
        },
        {
          title: 'asserts value is Type',
          lang: 'typescript',
          code: `function assertIsString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(name + ' must be a string');
  }
}

function handle(body: { name?: unknown }) {
  assertIsString(body.name, 'name');
  // From here on, body.name is string
  return body.name.toUpperCase();
}
console.log(handle({ name: 'asha' })); // "ASHA"
// handle({ name: 42 }) -> throws Error: name must be a string`,
        },
      ],
      output: `\`isUser(data)\` does real runtime checks; inside the \`if\`, \`data\` is a \`User\`, so \`data.email\` prints \`a@b.com\`. \`filter(isDefined)\` returns \`string[]\` instead of \`(string | undefined)[]\`. \`assertIsString\` either throws or lets the code continue with \`body.name\` narrowed to \`string\`, so \`handle({ name: 'asha' })\` prints \`ASHA\`.`,
      questions: [
        {
          q: 'What is a user-defined type guard?',
          a: 'A function with a return type like `value is User`. It runs a runtime check and, when it returns true, TS narrows the value to that type.',
        },
        {
          q: 'What is the difference between `is` and `asserts`?',
          a: 'A guard with `is` returns a boolean and narrows inside an `if`. An assertion function with `asserts x is T` returns nothing, throws on failure, and narrows for all code after the call.',
        },
        {
          q: 'Does TypeScript verify your type guard is correct?',
          a: 'No. It trusts the return type. A wrong check gives wrong types, so guards must be written carefully or generated by a schema library like Zod.',
        },
        {
          q: 'How do you remove undefined from an array type with filter?',
          a: 'Pass a type guard: `.filter((x): x is T => x !== undefined)`. In TS 5.5+ a simple `x => x !== undefined` is inferred as a guard automatically.',
        },
      ],
      spoken: `"A custom type guard is a function whose return type is 'value is SomeType'. It runs a real runtime check, and when it returns true TypeScript narrows the value in that branch. I use them for unknown data — API responses, webhook payloads, JSON from localStorage. There's also the asserts form: an assertion function throws if the check fails and narrows the value for the rest of the scope. One important thing: TypeScript trusts the guard completely, so if my check is wrong the types are wrong. For complex shapes I prefer a schema library like Zod."`,
      mistakes: [
        'Writing a guard that only checks one field but claims the whole type — TS will trust it and you get runtime crashes.',
        'Using `as User` instead of a guard. `as` checks nothing at runtime.',
        'Forgetting the `value !== null` check, since `typeof null === \'object\'`.',
        'Follow-up trap: "Can an arrow function be a type guard?" Yes: `const isStr = (x: unknown): x is string => typeof x === \'string\'`.',
      ],
      takeaway: 'A type guard is a runtime check that also teaches the compiler — but TypeScript trusts it blindly, so make the check real.',
    },
    {
      id: 'assertion-vs-guard',
      title: 'Type Assertion (as, !) vs Type Guard',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A type assertion (as) tells the compiler "trust me" with no runtime check. A type guard actually checks the value.',
      what: `- A **type assertion** \`value as User\` tells TypeScript: "I know better, treat this as a User." It does **nothing at runtime**. If you are wrong, the code crashes later.
- The **non-null assertion** \`value!\` says "this is not null or undefined" — also no check.
- A **type guard** runs real code (\`typeof\`, \`in\`, a custom \`is\` function) and only narrows when the check passes.

#### Deeper version
TS only allows an assertion when the types **overlap** enough. \`'hello' as number\` is an error. People force it with a **double assertion**: \`value as unknown as number\` — a red flag in code review.

Assertions are fine when you really know more than the compiler:
- \`document.getElementById('root') as HTMLCanvasElement\` (you control the HTML).
- \`as const\` (a special assertion that makes literals readonly — not a "trust me").
- Test fixtures.

The old angle-bracket syntax \`<User>value\` also works, but not in \`.tsx\` files because it clashes with JSX. Use \`as\`.`,
      why: `Interviewers ask this to see if you understand that types are erased. Overusing \`as\` and \`!\` is one of the most common ways TypeScript code still crashes at runtime. Knowing when to assert and when to check shows maturity.`,
      analogy: `An assertion is a person saying "trust me, this bridge is safe" — you walk across without looking. A type guard is an engineer actually inspecting the bridge first.`,
      code: [
        {
          title: 'as and ! vs a real check',
          lang: 'typescript',
          code: `type User = { name: string };

const raw: unknown = JSON.parse('{"title":"oops"}');

// Assertion: compiles, but wrong at runtime
const u1 = raw as User;
console.log(u1.name.toUpperCase());
// Runtime: TypeError: Cannot read properties of undefined (reading 'toUpperCase')

// Guard: checks first
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'name' in x && typeof x.name === 'string';
}
if (isUser(raw)) {
  console.log(raw.name.toUpperCase()); // safe
} else {
  console.log('Not a user'); // this runs
}`,
        },
        {
          title: 'Non-null assertion and double assertion',
          lang: 'typescript',
          code: `const el = document.getElementById('app');   // HTMLElement | null
// el.innerHTML = 'Hi'; // Error: 'el' is possibly 'null'.

el!.innerHTML = 'Hi';  // "!" = trust me, not null (crashes if it IS null)

if (el) el.innerHTML = 'Hi'; // safer: real check

// const n = 'hello' as number;
// Error: Conversion of type 'string' to type 'number' may be a mistake...
const n = 'hello' as unknown as number; // compiles, but it's a lie`,
        },
      ],
      output: `The JSON has \`title\`, not \`name\`. \`raw as User\` compiles fine, but \`u1.name\` is \`undefined\`, so \`.toUpperCase()\` throws a TypeError at runtime. The guard version checks first and prints \`Not a user\`. In the second block, \`el!\` silences the null error but will crash if the element is missing, while \`if (el)\` is safe. The double assertion compiles but gives a string typed as a number.`,
      questions: [
        {
          q: 'What is the difference between a type assertion and a type guard?',
          a: 'An assertion (`as`) only changes the compile-time type with no runtime check. A guard runs a real check and narrows the type only if it passes.',
        },
        {
          q: 'What does the ! operator do in TypeScript?',
          a: 'It is the non-null assertion: it removes `null` and `undefined` from the type. It does not check anything at runtime.',
        },
        {
          q: 'What is a double assertion?',
          a: '`x as unknown as T`. It forces any conversion past TS\'s overlap check. It is almost always a sign of a design problem.',
        },
        {
          q: 'When is `as` acceptable?',
          a: 'When you truly know more than the compiler — DOM elements you control, narrowing after a validated parse, test data, or `as const`.',
        },
      ],
      spoken: `"A type assertion, written with as, tells the compiler 'trust me, this is a User'. It changes only the compile-time type and does nothing at runtime, so if I'm wrong the code crashes later. The non-null exclamation mark is the same idea for null. A type guard actually checks the value — with typeof, in, or a custom 'is' function — and only narrows when the check passes. So for external data I always use guards or schema validation, and I keep as for cases where I genuinely know more than the compiler, like a DOM element I control."`,
      mistakes: [
        'Casting API data with `as` and believing it is validated.',
        'Sprinkling `!` to silence "possibly null" errors instead of handling the null case.',
        'Using `as unknown as X` to escape a type error instead of fixing the types.',
        'Follow-up trap: "Is `as const` a type assertion?" Technically yes, but it is a safe one: it narrows to literal, readonly types instead of claiming an unrelated type.',
      ],
      takeaway: 'as and ! are promises with no proof; type guards are proof — use guards for anything from outside your code.',
    },
    {
      id: 'discriminated-unions',
      title: 'Discriminated Unions',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A union of object types that all share one literal field (like type or status). Checking that field tells TypeScript exactly which shape you have.',
      what: `A **discriminated union** (also called a **tagged union**) is a union of object types where every member has a **common field** with a different **literal value**. This field is the **discriminant** (the "tag").

\`\`\`typescript
type Result =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };
\`\`\`

When you check \`result.status === 'success'\`, TypeScript knows \`data\` exists. In the other branch, it knows \`message\` exists.

#### Deeper version
- The discriminant must be a **literal type** (\`'success'\`, \`1\`, \`true\`), not just \`string\`.
- Works with \`if\`, \`switch\` and early returns, and pairs perfectly with the \`never\` exhaustive check.
- Since TS 4.6 you can **destructure** the discriminant first (\`const { status } = result\`) and still narrow, when the object is a \`const\` parameter or variable.
- It is the best way to model **state machines** and **"make impossible states impossible"**: instead of \`{ loading: boolean; error?: string; data?: T }\` (where \`loading: true\` and \`data\` could both be set by mistake), each state has exactly its own fields.
- Redux actions, \`useReducer\` actions, Stripe webhook events (\`event.type\`) and LLM tool-call messages all follow this pattern.`,
      why: `Without it you get objects full of optional fields and endless \`?.\` checks, and nothing stops invalid combinations. A discriminated union makes each state explicit, gives perfect narrowing, and with an exhaustive check the compiler tells you when a new state is not handled.`,
      analogy: `Think of parcels with a colored sticker: red means "fragile", blue means "documents", green means "food". The courier looks at the sticker first, and then knows exactly how to handle what's inside.`,
      code: [
        {
          title: 'Request state without impossible combinations',
          lang: 'typescript',
          code: `type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function render(state: RequestState<string[]>): string {
  switch (state.status) {
    case 'idle':    return 'Click to load';
    case 'loading': return 'Loading...';
    case 'success': return state.data.join(', '); // data exists here
    case 'error':   return 'Error: ' + state.error; // error exists here
    default: {
      const unreachable: never = state; // exhaustive check
      return unreachable;
    }
  }
}

console.log(render({ status: 'success', data: ['a', 'b'] })); // "a, b"
// render({ status: 'success' });
// Error: Property 'data' is missing in type '{ status: "success"; }'...`,
        },
        {
          title: 'Typed reducer actions',
          lang: 'typescript',
          code: `type CartAction =
  | { type: 'add'; productId: string; qty: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' };

type Cart = Record<string, number>;

function cartReducer(cart: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'add':
      return { ...cart, [action.productId]: (cart[action.productId] ?? 0) + action.qty };
    case 'remove': {
      const { [action.productId]: _removed, ...rest } = cart;
      return rest;
    }
    case 'clear':
      return {};
  }
}`,
        },
      ],
      output: `\`render\` prints \`a, b\` for the success state. In each \`case\`, TS knows which fields exist, so \`state.data\` is only allowed in the success branch. Creating \`{ status: 'success' }\` without \`data\` is a compile error, so impossible states cannot be built. In the reducer, \`action.qty\` is only available in the \`'add'\` case, and because every case returns, TS knows the function always returns a \`Cart\`.`,
      questions: [
        {
          q: 'What is a discriminated union?',
          a: 'A union of object types that share a common property with a unique literal value per member. Checking that property narrows the union to one member.',
        },
        {
          q: 'Why is it better than one object with optional fields?',
          a: 'It prevents impossible states (like loading and error at the same time), removes optional-chaining noise, and enables exhaustive checks.',
        },
        {
          q: 'Where do you use them in real projects?',
          a: 'Reducer and Redux actions, async request state, API result types (success | error), webhook events like Stripe `event.type`, and form or payment steps.',
        },
        {
          q: 'What type can the discriminant be?',
          a: 'A literal type — string, number or boolean literals. A plain `string` field cannot discriminate.',
        },
      ],
      spoken: `"A discriminated union is a union of object types where each member has a shared field — usually type or status — with a different literal value. When I switch on that field, TypeScript narrows to exactly one member, so only the fields that exist in that state are available. I use it for async state — idle, loading, success with data, error with a message — so impossible combinations like loading plus error can't even be built. Reducer actions and webhook events work the same way. I pair it with a never check in the default case, so new states can't be forgotten."`,
      mistakes: [
        'Using a plain `string` for the tag. It must be a literal type for narrowing to work.',
        'Modelling state as `{ isLoading: boolean; error?: string; data?: T }`, which allows invalid combinations.',
        'Destructuring fields before checking the tag (e.g. `const { data } = state`) — `data` does not exist on every member, so TS errors.',
        'Follow-up trap: "How do you make sure every case is handled?" Add a `default` branch that assigns the value to `never` (or calls `assertNever`).',
      ],
      takeaway: 'Give each state its own shape plus a literal tag — TypeScript narrows on the tag and impossible states disappear.',
    },
    {
      id: 'keyof-typeof',
      title: 'keyof, typeof and Indexed Access Types',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'keyof gets the keys of a type as a union. typeof (in a type position) gets the type of a value. T[K] gets the type of a property.',
      what: `Three small operators that let you **build types from other types or values**:

- \`keyof T\` gives a **union of the keys** of type \`T\`. For \`{ name: string; age: number }\` it is \`'name' | 'age'\`.
- \`typeof value\` (used in a **type** position) gives the **type of a JavaScript value**. Great for getting a type from a config object or a function.
- \`T[K]\` — **indexed access** — gives the type of property \`K\` on \`T\`. \`User['email']\` is \`string\`.

#### Deeper version
- JavaScript also has a runtime \`typeof\` (returns \`"string"\`, \`"object"\`...). TS decides which one you mean by **position**: after \`:\` or in a \`type\` it is the type operator; in normal code it is the JS operator.
- \`keyof\` of a type with an index signature \`{ [k: string]: X }\` is \`string | number\` (because JS turns number keys into strings).
- Combine them: \`typeof obj[keyof typeof obj]\` = union of all **values** of an object.
- \`T[number]\` on an array or tuple type gives the **element type**: \`(typeof roles)[number]\`.
- These are the building blocks of mapped types and utility types like \`Pick\` and \`Record\`.`,
      why: `They keep a **single source of truth**. Define a config or constant once, and derive the types from it, so they never get out of sync. Add a key to the object, and every type that uses \`keyof typeof\` updates automatically.`,
      analogy: `\`typeof\` is like taking a photo of a real room to get its floor plan. \`keyof\` is reading the list of room names from the floor plan. \`T[K]\` is asking "what is in the kitchen?"`,
      code: [
        {
          title: 'keyof and indexed access',
          lang: 'typescript',
          code: `type User = { id: string; email: string; age: number };

type UserKey = keyof User;        // 'id' | 'email' | 'age'
type Email = User['email'];       // string
type IdOrAge = User['id' | 'age']; // string | number

function sortBy<T>(items: T[], key: keyof T): T[] {
  return [...items].sort((a, b) => (a[key] > b[key] ? 1 : -1));
}
const users: User[] = [
  { id: '2', email: 'b@x.com', age: 40 },
  { id: '1', email: 'a@x.com', age: 25 },
];
sortBy(users, 'age');     // OK
// sortBy(users, 'name');
// Error: Argument of type '"name"' is not assignable to parameter of type 'keyof User'.`,
        },
        {
          title: 'typeof: types from values',
          lang: 'typescript',
          code: `const config = {
  apiUrl: 'https://api.example.com',
  retries: 3,
  features: { chat: true },
};

type Config = typeof config;
// { apiUrl: string; retries: number; features: { chat: boolean } }

type ConfigKey = keyof typeof config; // 'apiUrl' | 'retries' | 'features'

const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'

function createUser(name: string) {
  return { name, createdAt: new Date() };
}
type NewUser = ReturnType<typeof createUser>; // { name: string; createdAt: Date }`,
        },
      ],
      output: `\`keyof User\` is the union \`'id' | 'email' | 'age'\`, so \`sortBy\` accepts \`'age'\` but rejects \`'name'\`. \`User['email']\` is \`string\`. In the second block, \`typeof config\` copies the object's shape into a type, \`(typeof ROLES)[number]\` turns the readonly array into a union of its items, and \`ReturnType<typeof createUser>\` derives a type from a function — no duplicated type definitions.`,
      questions: [
        {
          q: 'What does keyof do?',
          a: 'It produces a union of the property names of a type. `keyof { a: 1; b: 2 }` is `\'a\' | \'b\'`.',
        },
        {
          q: 'What is the difference between TS typeof and JS typeof?',
          a: 'JS `typeof` runs at runtime and returns a string like `"number"`. TS `typeof` is used in type positions and returns the full static type of a value.',
        },
        {
          q: 'How do you get a union of an array\'s values as a type?',
          a: 'Declare it with `as const`, then use `(typeof arr)[number]`.',
        },
        {
          q: 'What is an indexed access type?',
          a: '`T[K]` — the type of property `K` in `T`, e.g. `User[\'id\']`. With `number` on an array type, it gives the element type.',
        },
      ],
      spoken: `"keyof, typeof and indexed access let me derive types instead of duplicating them. keyof gives me a union of a type's keys, which I use to constrain parameters — like a sortBy function that only accepts real field names. typeof in a type position gives me the type of a value, so I can define a config object or a constant array once and get its type for free. Indexed access, T bracket K, gives the type of one property. Together, like typeof ROLES bracket number with as const, they keep a single source of truth."`,
      mistakes: [
        'Writing `keyof config` on a value. `keyof` needs a type, so it must be `keyof typeof config`.',
        'Forgetting `as const` and getting `string` instead of a union from `(typeof arr)[number]`.',
        'Mixing up runtime `typeof` (returns a string) with type-level `typeof`.',
        'Follow-up trap: "Why does `keyof` sometimes include `number`?" For a string index signature, keys can be numbers too, because JS converts numeric keys to strings, so `keyof { [k: string]: X }` is `string | number`.',
      ],
      takeaway: 'keyof = keys as a union, typeof = type of a value, T[K] = type of a property — use them to derive types from one source of truth.',
    },
    {
      id: 'utility-types',
      title: 'Utility Types (Partial, Pick, Omit, Record and more)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Built-in generic types that transform other types: make fields optional, pick some, drop some, build maps, get return types, and more.',
      what: `TypeScript ships with ready-made **utility types**. They take a type and return a new one.

**Object shape helpers**
- \`Partial<T>\` — all properties optional. Great for update/patch data.
- \`Required<T>\` — all properties required.
- \`Readonly<T>\` — all properties readonly.
- \`Pick<T, 'a' | 'b'>\` — keep only these keys.
- \`Omit<T, 'a'>\` — remove these keys.
- \`Record<K, V>\` — an object whose keys are \`K\` and values are \`V\`.

**Union helpers**
- \`Exclude<U, X>\` — remove members of \`U\` that match \`X\`.
- \`Extract<U, X>\` — keep only members that match \`X\`.
- \`NonNullable<T>\` — remove \`null\` and \`undefined\`.

**Function and Promise helpers**
- \`ReturnType<typeof fn>\` — the return type of a function.
- \`Parameters<typeof fn>\` — a tuple of its parameter types.
- \`Awaited<T>\` — the type a Promise resolves to (unwraps nested Promises).

#### Deeper version
They are not magic — they are written with **mapped** and **conditional** types:
- \`Partial<T> = { [K in keyof T]?: T[K] }\`
- \`Pick<T, K extends keyof T> = { [P in K]: T[P] }\`
- \`Exclude<T, U> = T extends U ? never : T\` (it **distributes** over each union member).
- \`Omit<T, K> = Pick<T, Exclude<keyof T, K>>\`.

Note: \`Omit\`'s \`K\` is \`keyof any\`, so \`Omit<User, 'tpyo'>\` does **not** error on a typo — \`Pick\` does. \`Omit\` on a union type also does not distribute: it merges the union into one shape, which can surprise you.

Other handy ones: \`InstanceType\`, \`ConstructorParameters\`, \`NoInfer\` (TS 5.4+), \`Uppercase\`/\`Lowercase\`/\`Capitalize\` for strings.`,
      why: `Real apps have many related shapes for one entity: the DB document, the create input (no \`_id\`), the update input (all optional), the public response (no \`password\`). Utility types derive all of them from one base type, so changing the base updates everything.`,
      analogy: `Utility types are like photo filters. You take one photo (your base type) and apply "crop" (\`Pick\`), "erase" (\`Omit\`), "blur everything to optional" (\`Partial\`) — without retaking the photo.`,
      code: [
        {
          title: 'Deriving API shapes from one model',
          lang: 'typescript',
          code: `interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

type CreateUserInput = Omit<User, '_id'>;          // everything except _id
type UpdateUserInput = Partial<Omit<User, '_id'>>; // all optional for PATCH
type PublicUser = Omit<User, 'password'>;          // safe to send to client
type UserPreview = Pick<User, '_id' | 'name'>;     // small list item

const patch: UpdateUserInput = { name: 'New Name' }; // OK, others optional

type RolePermissions = Record<User['role'], string[]>;
const perms: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read'],
}; // missing a role would be an error`,
        },
        {
          title: 'Union and function helpers',
          lang: 'typescript',
          code: `type Status = 'draft' | 'published' | 'archived' | null;

type Visible = Exclude<Status, 'archived' | null>; // 'draft' | 'published'
type OnlyArchived = Extract<Status, 'archived'>;   // 'archived'
type NotNull = NonNullable<Status>;                 // 'draft' | 'published' | 'archived'

async function fetchOrder(id: string, withItems: boolean) {
  return { id, total: 999, items: withItems ? ['p1'] : [] };
}

type FetchArgs = Parameters<typeof fetchOrder>;  // [id: string, withItems: boolean]
type FetchRet = ReturnType<typeof fetchOrder>;   // Promise<{ id: string; total: number; items: string[] }>
type Order = Awaited<FetchRet>;                  // { id: string; total: number; items: string[] }

type Full = Required<{ a?: number; b?: string }>; // { a: number; b: string }`,
        },
        {
          title: 'How Partial and Pick are built',
          lang: 'typescript',
          code: `type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>;`,
        },
      ],
      output: `From one \`User\` interface we derive four shapes. \`patch\` only needs \`name\` because \`Partial\` made every field optional. \`Record<User['role'], string[]>\` forces exactly the keys \`admin\` and \`user\`. In the second block, \`Exclude\` and \`Extract\` filter the union, \`NonNullable\` removes \`null\`, \`Parameters\` gives a tuple, \`ReturnType\` gives the Promise type, and \`Awaited\` unwraps it to the actual order object. The third block shows that these helpers are just mapped and conditional types.`,
      questions: [
        {
          q: 'What is the difference between Pick and Omit?',
          a: '`Pick<T, K>` keeps only the listed keys. `Omit<T, K>` keeps everything except the listed keys. `Pick` checks that keys exist; `Omit` does not.',
        },
        {
          q: 'When would you use Partial?',
          a: 'For update/PATCH payloads, optional config objects, or form state where fields are filled gradually.',
        },
        {
          q: 'What is Record used for?',
          a: 'To type an object map: `Record<string, number>` for a dictionary, or `Record<Role, Permission[]>` to force one entry per union member.',
        },
        {
          q: 'How do you get the resolved type of an async function?',
          a: '`Awaited<ReturnType<typeof fn>>`.',
        },
        {
          q: 'Difference between Exclude and Omit?',
          a: '`Exclude` works on union members (`Exclude<\'a\' | \'b\', \'a\'>` is `\'b\'`). `Omit` works on object keys.',
        },
      ],
      spoken: `"Utility types are built-in generics that transform types. The ones I use daily are Partial for update payloads, Pick and Omit to create smaller shapes — like a public user type that omits the password — and Record for maps, such as permissions per role. For unions there's Exclude, Extract and NonNullable. For functions, ReturnType and Parameters, and Awaited to unwrap a Promise, so Awaited of ReturnType of an async function gives me its real result. Under the hood they're just mapped and conditional types, which I can write myself when I need something custom."`,
      mistakes: [
        'Expecting `Omit<User, \'pasword\'>` (typo) to error. It does not — `Omit` accepts any key. Use `Pick` or a stricter custom Omit if you need that check.',
        'Using `Partial<T>` for the create input and accidentally allowing empty objects.',
        'Mixing up `Exclude` (union members) and `Omit` (object keys).',
        'Using `ReturnType` on an async function and forgetting the result is still a `Promise` — wrap it in `Awaited`.',
        'Follow-up trap: "Is Partial deep?" No, only the top level. Nested objects stay required; you would need a recursive `DeepPartial`.',
      ],
      takeaway: 'Define one base type and derive the rest with Partial, Pick, Omit, Record, ReturnType and friends — never copy-paste shapes.',
    },
    {
      id: 'as-const',
      title: 'as const (Const Assertions)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'as const freezes a value\'s type: literals stay exact, arrays become readonly tuples, and objects become deeply readonly.',
      what: `By default TypeScript **widens** types: \`let x = 'admin'\` becomes \`string\`, and \`['a', 'b']\` becomes \`string[]\`.

Adding \`as const\` says "treat this value as a constant, exactly as written":
- String and number values keep their **literal types** (\`'admin'\`, not \`string\`).
- Arrays become **readonly tuples** (\`readonly ['a', 'b']\`).
- Object properties become **readonly**, all the way down.

#### Deeper version
- \`as const\` is a **compile-time** thing. It does not freeze the object at runtime (\`Object.freeze\` does that, shallowly).
- It is the standard way to make **enum-like** objects and to get unions from arrays: \`(typeof ARR)[number]\`.
- It helps tuple return values: a custom hook returning \`[value, setValue] as const\` gives a typed tuple instead of an array of a union.
- TS 5.0 added **const type parameters**: \`function f<const T>(x: T)\` infers literal types for arguments as if the caller wrote \`as const\`.`,
      why: `Without it, constants lose their exact values and become plain \`string\` or \`number\`, so they can't be used where a specific union is required. \`as const\` keeps one source of truth for values and types — routes, roles, event names, config keys.`,
      analogy: `It is like laminating a printed note. Normally the note says "a role" in pencil and anyone can rewrite it. Laminated, it says exactly "admin" forever, and nobody can change it.`,
      code: [
        {
          title: 'Widening vs as const',
          lang: 'typescript',
          code: `const routes1 = { home: '/', profile: '/profile' };
// type: { home: string; profile: string }

const routes2 = { home: '/', profile: '/profile' } as const;
// type: { readonly home: '/'; readonly profile: '/profile' }

// routes2.home = '/x'; // Error: Cannot assign to 'home' because it is a read-only property.

type Route = (typeof routes2)[keyof typeof routes2]; // '/' | '/profile'

const SIZES = ['sm', 'md', 'lg'] as const; // readonly ['sm', 'md', 'lg']
type Size = (typeof SIZES)[number];        // 'sm' | 'md' | 'lg'`,
        },
        {
          title: 'Tuple return from a custom hook',
          lang: 'tsx',
          code: `import { useState } from 'react';

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((v) => !v);
  return [on, toggle] as const; // readonly [boolean, () => void]
  // without as const: (boolean | (() => void))[] -> useless
}

function Menu() {
  const [open, toggleOpen] = useToggle();
  return <button onClick={toggleOpen}>{open ? 'Close' : 'Open'}</button>;
}`,
        },
      ],
      output: `\`routes1\` has plain \`string\` values, but \`routes2\` keeps the exact paths and is readonly, so assigning to \`routes2.home\` is a compile error. \`Route\` becomes \`'/' | '/profile'\` and \`Size\` becomes \`'sm' | 'md' | 'lg'\`. In the hook, \`as const\` makes the return a tuple, so \`open\` is \`boolean\` and \`toggleOpen\` is a function — without it, both would be "boolean or function".`,
      questions: [
        {
          q: 'What does as const do?',
          a: 'It makes TS infer the narrowest type: literal values instead of string/number, readonly tuples instead of arrays, and readonly properties on objects (recursively).',
        },
        {
          q: 'Does as const freeze the object at runtime?',
          a: 'No. It only affects types. Use `Object.freeze` for runtime protection.',
        },
        {
          q: 'Why use as const in a custom hook\'s return?',
          a: 'So the returned array is typed as a tuple with fixed positions, like `[boolean, () => void]`, instead of an array of a union type.',
        },
        {
          q: 'What is a const type parameter?',
          a: 'A TS 5.0 feature: `function f<const T>(x: T)` infers literal types for `T` as if the caller had written `as const`.',
        },
      ],
      spoken: `"as const tells TypeScript to infer the narrowest possible type. String values stay as their literal values, arrays become readonly tuples, and object properties become readonly. I use it to build enum-like objects and constant arrays, then derive a union type from them with typeof and keyof or the number index, so values and types come from one place. It's also handy for custom hooks that return a tuple. It's compile-time only, so it doesn't freeze anything at runtime."`,
      mistakes: [
        'Thinking `as const` freezes the object at runtime.',
        'Forgetting it on a constant array, so `(typeof ARR)[number]` is just `string`.',
        'Passing an `as const` array to a function expecting a mutable `string[]` — it fails, because readonly arrays are not assignable to mutable ones. Type the parameter as `readonly string[]`.',
        'Follow-up trap: "How is `as const` different from `const`?" `const` stops re-assigning the variable; `as const` makes the value\'s type literal and readonly deep inside.',
      ],
      takeaway: 'as const keeps values exact and readonly — the easiest way to turn constants into union types.',
    },
    {
      id: 'satisfies',
      title: 'The satisfies Operator',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'satisfies checks that a value matches a type without changing the value\'s own (more specific) inferred type.',
      what: `\`satisfies\` (added in **TS 4.9**) checks a value against a type, but **keeps the value's own inferred type**.

Compare:
- \`const a: Config = {...}\` — the variable's type **becomes** \`Config\`. You lose the specific details.
- \`const a = {...} satisfies Config\` — TS **checks** it matches \`Config\`, but \`a\` keeps its exact type.

#### Deeper version
The problem with a plain annotation: if \`Config\` says \`Record<string, string | number>\`, then after annotation every property is \`string | number\` and any key is allowed — even typos you later read.

With \`satisfies\`:
- You get **validation**: missing keys, wrong value types and (for object literals) extra keys are errors.
- You keep **precise types**: \`port\` stays \`number\`, so \`port.toFixed()\` works without narrowing, and only real keys autocomplete.

It combines nicely with \`as const\`: \`{...} as const satisfies Config\` gives readonly literal types **and** a shape check.

Difference from \`as\`: \`as\` can lie and silences errors; \`satisfies\` never changes the type and reports errors.`,
      why: `Config objects, route maps, theme tokens and lookup tables need both: a check that they are complete and correct, and precise types when you use them. Before \`satisfies\`, you had to pick one.`,
      analogy: `It is like a teacher checking your homework against the rubric and handing it back unchanged. An annotation is like the teacher rewriting your homework onto the generic rubric form — correct, but your specific answers get blurred.`,
      code: [
        {
          title: 'Annotation vs satisfies',
          lang: 'typescript',
          code: `type Theme = Record<'primary' | 'secondary', string | [number, number, number]>;

// With annotation: the type becomes Theme, details are lost
const t1: Theme = { primary: '#0af', secondary: [255, 0, 0] };
// t1.primary.toUpperCase();
// Error: Property 'toUpperCase' does not exist on type 'string | [number, number, number]'.

// With satisfies: checked AND precise
const t2 = { primary: '#0af', secondary: [255, 0, 0] } satisfies Theme;
t2.primary.toUpperCase();    // OK: primary is string
t2.secondary.map((n) => n);  // OK: secondary is a tuple/array

// const t3 = { primary: '#0af' } satisfies Theme;
// Error: Property 'secondary' is missing in type '{ primary: string; }'...`,
        },
        {
          title: 'Typed route map that keeps exact keys',
          lang: 'typescript',
          code: `type RouteDef = { path: string; auth: boolean };

const routes = {
  home: { path: '/', auth: false },
  dashboard: { path: '/dashboard', auth: true },
} satisfies Record<string, RouteDef>;

routes.dashboard.path; // OK, autocompletes "home" | "dashboard"
// routes.settings;
// Error: Property 'settings' does not exist on type '{ home: ...; dashboard: ...; }'.

type RouteName = keyof typeof routes; // 'home' | 'dashboard'`,
        },
      ],
      output: `With the annotation, \`t1.primary\` is the wide \`string | [number, number, number]\`, so \`toUpperCase\` is not allowed. With \`satisfies\`, \`t2.primary\` stays \`string\` and the call works, while a missing key still fails. In the route map, \`satisfies Record<string, RouteDef>\` checks each route, but \`keyof typeof routes\` is still exactly \`'home' | 'dashboard'\`, so \`routes.settings\` is an error.`,
      questions: [
        {
          q: 'What does satisfies do?',
          a: 'It checks that an expression matches a type, without changing the expression\'s inferred type. You get validation plus precise types.',
        },
        {
          q: 'satisfies vs type annotation?',
          a: 'An annotation sets the variable\'s type to the annotated type (losing details). `satisfies` only checks and keeps the narrower inferred type.',
        },
        {
          q: 'satisfies vs as?',
          a: '`as` overrides the type and can hide errors. `satisfies` never overrides and reports mismatches.',
        },
        {
          q: 'Which TypeScript version added satisfies?',
          a: 'TypeScript 4.9.',
        },
      ],
      spoken: `"satisfies, added in TypeScript 4.9, checks that a value matches a type but keeps the value's own inferred type. With a normal annotation, the variable becomes that type, so I lose detail — for example, a Record of string makes every key look valid. With satisfies I still get errors for missing or wrong fields, but the keys and value types stay precise, so autocomplete and narrowing work. I use it for config objects, theme tokens and route maps, often together with as const. Unlike as, it can't hide a mistake."`,
      mistakes: [
        'Using `as Config` to "check" a config object. `as` does not check completeness and can hide mistakes.',
        'Annotating with `Record<string, X>` and then losing autocomplete for the real keys.',
        'Expecting `satisfies` to change the type of the variable. It does not — it only validates.',
        'Follow-up trap: "When would you still use a plain annotation?" When you want the variable to be the wider type, for example a `let` you plan to re-assign with other valid values later.',
      ],
      takeaway: 'satisfies = "check it, but don\'t change it" — validation with precise inferred types.',
    },
    {
      id: 'function-overloads',
      title: 'Function Types and Overloads',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Function types describe parameters and return types. Overloads give one function several typed call signatures.',
      what: `**Function types** describe a function's shape: \`(a: number, b: number) => number\`. You use them for callbacks and props like \`onChange\`.

Other function basics:
- Optional parameter: \`(name?: string)\`.
- Default parameter: \`(retries = 3)\` — type inferred as \`number\`.
- Rest parameter: \`(...ids: string[])\`.
- \`void\` return: the function returns nothing useful.

**Overloads** let one function have **several call signatures**. Example: \`parse(x: string): Date\` and \`parse(x: number): Date\` with different behavior, or a return type that depends on the argument.

#### Deeper version
An overloaded function has:
1. **Overload signatures** — the public versions callers see (no body).
2. One **implementation signature** — with a body, must be compatible with all overloads. Callers **cannot** call it directly.

TS picks the **first matching** overload top-to-bottom, so put the most specific first.

Often, a **union parameter** or a **generic with a conditional return type** is simpler than overloads. Use overloads when the return type really depends on the input in a way unions cannot express.

\`this\` can also be typed as a fake first parameter: \`function fn(this: HTMLButtonElement)\`.`,
      why: `Callbacks, event handlers and library APIs need precise function types. Overloads let a single API (like \`createElement('div')\` returning \`HTMLDivElement\`) give exact return types for each input, which is how many DOM and library types are written.`,
      analogy: `Overloads are like a coffee machine with three buttons: "espresso", "latte", "tea". It is one machine, but each button promises a different drink. The machine inside (implementation) handles all three.`,
      code: [
        {
          title: 'Function types for callbacks',
          lang: 'typescript',
          code: `type Validator = (value: string) => boolean;

const isEmail: Validator = (v) => v.includes('@'); // v is inferred as string

function validateAll(values: string[], check: Validator): boolean {
  return values.every(check);
}
console.log(validateAll(['a@b.com', 'x@y.com'], isEmail)); // true

function retry(fn: () => Promise<void>, times = 3, ...tags: string[]): void {
  console.log('retrying', times, tags);
}`,
        },
        {
          title: 'Overloads: return type depends on input',
          lang: 'typescript',
          code: `// Overload signatures (what callers see)
function getItem(id: string): { id: string; name: string };
function getItem(ids: string[]): { id: string; name: string }[];
// Implementation signature (hidden from callers)
function getItem(input: string | string[]) {
  if (Array.isArray(input)) {
    return input.map((id) => ({ id, name: 'Item ' + id }));
  }
  return { id: input, name: 'Item ' + input };
}

const one = getItem('a');          // { id: string; name: string }
const many = getItem(['a', 'b']);  // { id: string; name: string }[]
// getItem(42);
// Error: No overload matches this call.`,
        },
      ],
      output: `\`validateAll\` prints \`true\` because both values contain \`@\`. In the overload example, passing a string returns a single object type, and passing an array returns an array type — callers get the exact return type without checks. \`getItem(42)\` fails because no overload accepts a number, and the implementation signature is not visible to callers.`,
      questions: [
        {
          q: 'How do you type a callback parameter?',
          a: 'With a function type: `(value: string) => boolean`, either inline or as a named `type`. Parameter types of an assigned arrow function are then inferred.',
        },
        {
          q: 'What are function overloads?',
          a: 'Multiple call signatures for one function, followed by one implementation. TS picks the first signature that matches the call and uses its return type.',
        },
        {
          q: 'Can callers use the implementation signature directly?',
          a: 'No. Only the overload signatures are visible. The implementation must be compatible with all of them.',
        },
        {
          q: 'When would you avoid overloads?',
          a: 'When a union parameter or a generic gives the same result more simply. Overloads are best when the return type truly depends on which input form was used.',
        },
      ],
      spoken: `"Function types describe parameters and return types, like a Validator that takes a string and returns a boolean, and I use them for callbacks and props such as onChange. Overloads let one function have several public signatures — for example, getItem with a string returns one item, and with an array returns an array. I write the overload signatures first, then a single implementation that handles all cases; callers only see the overloads, and TypeScript picks the first that matches. If a simple union or generic can do the job, I prefer that because it's easier to maintain."`,
      mistakes: [
        'Expecting the implementation signature to be callable. It is hidden; add an overload for every allowed call.',
        'Ordering overloads from general to specific, so the specific one is never chosen.',
        'Using overloads when a single union parameter would do.',
        'Follow-up trap: "Why does a callback typed `() => void` accept a function that returns a value?" A `void` return type in a function type means "the caller will ignore the result", so returning something is allowed. This is why `arr.forEach(x => list.push(x))` compiles.',
      ],
      takeaway: 'Type callbacks with function types; use overloads only when the return type truly depends on the input form.',
    },
    {
      id: 'classes-abstract',
      title: 'Classes, Access Modifiers and Abstract Classes',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'TS adds public/private/protected, readonly fields, parameter properties, implements, and abstract classes that cannot be created directly.',
      what: `TypeScript adds type features on top of JavaScript classes:

- **Access modifiers:** \`public\` (default, anyone), \`protected\` (the class and its subclasses), \`private\` (only this class).
- **Parameter properties:** \`constructor(private db: Db) {}\` declares and assigns a field in one go.
- **implements:** \`class A implements Logger\` makes TS check that the class has everything the interface needs.
- **Abstract classes:** marked \`abstract\`. You **cannot** do \`new\` on them. They can have real methods **and** \`abstract\` methods (no body) that subclasses **must** write.

#### Deeper version
- TS \`private\` is **compile-time only**. At runtime the field is a normal property (\`obj['secret']\` still works). JavaScript's \`#secret\` fields are **truly private** at runtime. Many teams prefer \`#\` for real privacy.
- **Abstract class vs interface:** an interface is only a type (erased, no code). An abstract class is real JavaScript: it can hold shared code, fields and constructor logic. A class can \`implements\` many interfaces but \`extends\` only one class.
- \`override\` keyword (TS 4.3+) marks methods that replace a parent method; with \`noImplicitOverride\`, forgetting it is an error. This catches typos when the parent method is renamed.
- \`strictPropertyInitialization\` requires every field to be set in the constructor (or marked with \`!\` or made optional).
- Parameter properties are a TS-only syntax that generates code. Node's type-stripping mode does not support them (check the current Node docs).`,
      why: `Backend code (services, repositories, payment providers, NestJS) often uses classes. Access modifiers protect internal state, and abstract classes let you share common logic while forcing each subclass to fill in the specific parts — the **Template Method** pattern.`,
      analogy: `An abstract class is like a franchise manual. It says "every store greets customers this way and uses this billing system (shared code), but **you** must design your own menu (abstract method)". You cannot open "the manual" as a store — only real franchises.`,
      code: [
        {
          title: 'Abstract base with shared logic',
          lang: 'typescript',
          code: `abstract class PaymentProvider {
  constructor(protected readonly apiKey: string) {} // parameter property

  // Shared logic for every provider
  async pay(amount: number): Promise<string> {
    if (amount <= 0) throw new Error('Invalid amount');
    const id = await this.charge(amount);
    return 'Paid ' + amount + ' (ref ' + id + ')';
  }

  // Each provider must implement this
  protected abstract charge(amount: number): Promise<string>;
}

class StripeProvider extends PaymentProvider {
  protected async charge(amount: number): Promise<string> {
    // a real app would call the Stripe SDK here with this.apiKey
    return 'pi_' + amount;
  }
}

const provider = new StripeProvider('sk_test_123');
provider.pay(500).then(console.log); // "Paid 500 (ref pi_500)"

// new PaymentProvider('x');
// Error: Cannot create an instance of an abstract class.
// provider.apiKey;
// Error: Property 'apiKey' is protected and only accessible within class 'PaymentProvider' and its subclasses.`,
        },
        {
          title: 'private vs #private and implements',
          lang: 'typescript',
          code: `interface Logger {
  log(msg: string): void;
}

class ConsoleLogger implements Logger {
  private count = 0;  // TS-only privacy
  #secret = 'hidden'; // real JS privacy

  log(msg: string) {
    this.count++;
    console.log('[' + this.count + '] ' + msg);
  }
}

const l = new ConsoleLogger();
l.log('hi');            // "[1] hi"
// l.count;            // Error: Property 'count' is private...
console.log((l as any).count); // 1 -> still reachable at runtime
// (l as any).#secret is a syntax error: # fields cannot be reached from outside`,
        },
      ],
      output: `\`StripeProvider\` inherits \`pay\` and only writes \`charge\`. \`provider.pay(500)\` prints \`Paid 500 (ref pi_500)\`. Creating the abstract class directly and reading the protected \`apiKey\` from outside are compile errors. In the second block, TS blocks \`l.count\`, but a cast to \`any\` still reads \`1\` at runtime, while the \`#secret\` field is truly unreachable.`,
      questions: [
        {
          q: 'What is an abstract class?',
          a: 'A class that cannot be instantiated directly. It can contain implemented methods and abstract methods that subclasses must implement.',
        },
        {
          q: 'Abstract class vs interface?',
          a: 'An interface is only a type with no runtime code. An abstract class is real JS that can hold shared code, fields and a constructor. A class can implement many interfaces but extend only one class.',
        },
        {
          q: 'private vs #private?',
          a: 'TS `private` is checked only at compile time; the field is still visible at runtime. `#field` is JavaScript\'s native private field and is enforced at runtime.',
        },
        {
          q: 'What are parameter properties?',
          a: 'A shortcut: `constructor(private repo: Repo) {}` declares the field and assigns the argument in one step.',
        },
      ],
      spoken: `"TypeScript adds public, protected and private modifiers, readonly fields, and parameter properties, so constructor(private db) both declares and assigns. An abstract class can't be instantiated; it holds shared logic and declares abstract methods that subclasses must implement. For example, a payment provider base class handles validation, and each provider implements its own charge method. Compared to an interface, an abstract class has real runtime code. One thing I point out: TS private is compile-time only, while JavaScript's hash private fields are enforced at runtime."`,
      mistakes: [
        'Believing TS `private` hides data at runtime. Use `#field` for real privacy.',
        'Using an abstract class when there is no shared code — an interface is lighter.',
        'Forgetting to initialize fields and getting `strictPropertyInitialization` errors, then silencing them all with `!`.',
        'Follow-up trap: "Can an abstract class have a constructor?" Yes. Subclasses call it with `super(...)`; you just cannot call `new` on the abstract class itself.',
      ],
      takeaway: 'Abstract classes share code and force subclasses to fill in the gaps; TS private is compile-time, # is runtime.',
    },
    {
      id: 'tsconfig',
      title: 'tsconfig.json Essentials',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'tsconfig.json tells the compiler which files to check and how: target JS version, module system, strictness, paths and output.',
      what: `\`tsconfig.json\` is the settings file for TypeScript. It sits in the project root and controls:

- **Which files** to include (\`include\`, \`exclude\`, \`files\`).
- **How strict** the checks are (\`strict\` and friends).
- **What JavaScript** to output (\`target\`, \`module\`, \`outDir\`) — or no output at all (\`noEmit\`) when another tool builds the code.

#### Deeper version
The options you should be able to explain:
- \`target\` — which JS version to output (e.g. \`ES2022\`). Older targets down-level syntax.
- \`lib\` — which built-in type definitions exist (\`DOM\`, \`ES2022\`...). Without \`DOM\`, \`document\` is unknown.
- \`module\` / \`moduleResolution\` — how imports are written and found. \`bundler\` (TS 5.0+) suits Vite/Next/webpack apps; \`NodeNext\` suits real Node ESM/CJS packages and requires file extensions in relative ESM imports.
- \`strict\` — turns on the strict family of checks. Always on for new projects.
- \`jsx\` — how JSX is handled (\`react-jsx\` for the modern runtime, \`preserve\` when another tool transforms it, like Next.js).
- \`esModuleInterop\` — smoother default imports from CommonJS packages (\`import express from 'express'\`).
- \`skipLibCheck\` — skip checking \`.d.ts\` files in \`node_modules\` — faster builds.
- \`baseUrl\` / \`paths\` — import aliases like \`@/components\`. TS only **checks** them; your bundler or runtime must also resolve them.
- \`isolatedModules\` — ensures each file can be compiled alone (needed for Babel, esbuild, SWC).
- \`noEmit\` — type-check only. Common in Vite/Next projects where another tool compiles.
- \`resolveJsonModule\` — allows importing \`.json\` files.
- \`extends\` — inherit from a base config (e.g. \`@tsconfig/node20\`).

Defaults and recommended values change between TS versions (a major release can change several defaults), so check the docs for your version.`,
      why: `Most "it works on my machine" TypeScript problems are config problems: wrong module setting, missing \`DOM\` lib, path aliases that TS accepts but Node can't resolve. Interviewers ask about tsconfig to see if you have actually set up a project, not just used one.`,
      analogy: `tsconfig is the settings panel of a camera. Same camera (compiler), but you choose the mode: how sharp (strict), which format to save (target/module), and which folder to save into (outDir).`,
      code: [
        {
          title: 'Typical Node/Express API config',
          lang: 'json',
          code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`,
        },
        {
          title: 'Typical React + Vite app config (type-check only)',
          lang: 'json',
          code: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}`,
        },
      ],
      output: `The Node config compiles \`src\` into \`dist\` as modern JavaScript, using Node's ESM/CJS rules and strict checks. The React config does not output anything (\`noEmit\`) — Vite builds the code, and \`tsc\` is only used to type-check. \`paths\` lets you write \`import Button from '@/components/Button'\`, but Vite also needs the same alias in its own config.`,
      questions: [
        {
          q: 'What does tsconfig.json do?',
          a: 'It defines the project\'s root files and compiler options: strictness, target JS version, module system, JSX handling, output folder and path aliases.',
        },
        {
          q: 'What is the difference between target and lib?',
          a: '`target` is the JS version the output is written in. `lib` is which built-in APIs TS knows about (like `DOM` or `ES2022` methods). They are related but separate.',
        },
        {
          q: 'Why do path aliases work in the editor but fail at runtime?',
          a: 'TS only uses `paths` for type-checking; it does not rewrite imports. The bundler (Vite/webpack) or a runtime tool must be configured with the same aliases.',
        },
        {
          q: 'What does skipLibCheck do?',
          a: 'It skips type-checking `.d.ts` files (mainly in `node_modules`). Builds are faster and you avoid errors from conflicting library types.',
        },
        {
          q: 'Why use noEmit?',
          a: 'When another tool (Vite, Next.js, esbuild, SWC) compiles the code, `tsc` is only needed for type-checking, so it should not output files.',
        },
      ],
      spoken: `"tsconfig.json controls what TypeScript checks and how. The key options I set are strict true, target for the output JS version, lib for which APIs exist like DOM, and module plus moduleResolution — bundler for Vite or Next apps, NodeNext for Node services. In frontend projects I usually set noEmit because Vite or Next compiles the code and tsc just type-checks, with isolatedModules on. I add skipLibCheck for speed, paths for aliases — remembering the bundler needs the same aliases — and often noUncheckedIndexedAccess for safer array and record access."`,
      mistakes: [
        'Adding `paths` aliases and expecting Node or Vite to understand them automatically.',
        'Forgetting `"DOM"` in `lib` and getting "Cannot find name \'document\'".',
        'Using `module: "NodeNext"` and writing relative ESM imports without the `.js` extension — Node needs it.',
        'Turning `strict` off to "fix" errors in a new project. Fix the types instead.',
        'Follow-up trap: "Does `tsc` bundle your code?" No. It type-checks and transpiles file-by-file; bundling is done by tools like Vite, webpack or esbuild.',
      ],
      takeaway: 'Know strict, target, lib, module/moduleResolution, jsx, noEmit, paths and skipLibCheck — and that TS checks paths but does not rewrite them.',
    },
    {
      id: 'strict-mode-flags',
      title: 'Strict Mode and Important Compiler Flags',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: '"strict": true turns on a family of safety checks like strictNullChecks and noImplicitAny. A few extra flags are worth adding on top.',
      what: `\`"strict": true\` is one switch that turns on a **group** of safety checks. The most important:

- \`strictNullChecks\` — \`null\` and \`undefined\` are separate types. You must handle them before use. (Without it, every type silently allows \`null\`.)
- \`noImplicitAny\` — error when TS cannot infer a type and would fall back to \`any\`.
- \`strictFunctionTypes\` — stricter checks on function parameter types.
- \`strictPropertyInitialization\` — class fields must be set in the constructor.
- \`strictBindCallApply\` — checks \`bind\`, \`call\` and \`apply\` arguments.
- \`noImplicitThis\` — error when \`this\` has an unknown type.
- \`useUnknownInCatchVariables\` — \`catch (err)\` gives \`unknown\` instead of \`any\`.
- \`alwaysStrict\` — emits \`"use strict"\` in output.

#### Deeper version
New TS versions sometimes **add** flags to the \`strict\` family, so upgrading can surface new errors. That is intended. You can still turn off one flag: \`"strict": true, "strictPropertyInitialization": false\`.

Useful flags **not** included in \`strict\`:
- \`noUncheckedIndexedAccess\` — \`arr[0]\` and \`record[key]\` become \`T | undefined\`. Catches many real bugs.
- \`exactOptionalPropertyTypes\` — \`{ a?: string }\` means "missing", not "can be set to undefined".
- \`noImplicitReturns\`, \`noFallthroughCasesInSwitch\`, \`noImplicitOverride\`, \`noUnusedLocals\`, \`noUnusedParameters\`.

**Migrating a JS codebase:** start with \`allowJs\` and \`strict: false\`, convert files gradually, then turn on strict flags one by one (\`noImplicitAny\` first, then \`strictNullChecks\`).`,
      why: `Without strict mode, TypeScript misses the most common runtime crash in JavaScript: "Cannot read properties of undefined". \`strictNullChecks\` alone catches a huge number of bugs. Interviewers use this topic to check whether you work in real, safe TS or in "JavaScript with some annotations".`,
      analogy: `\`strict\` is like turning on all the safety features in a car at once: seatbelt alarm, lane assist, parking sensors. Extra flags like \`noUncheckedIndexedAccess\` are optional extras, like a blind-spot monitor.`,
      code: [
        {
          title: 'What strictNullChecks and noUncheckedIndexedAccess catch',
          lang: 'typescript',
          code: `type User = { name: string };
const users: User[] = [];

// strictNullChecks: find() can return undefined
const u = users.find((x) => x.name === 'Asha');
// console.log(u.name); // Error: 'u' is possibly 'undefined'.
console.log(u?.name ?? 'not found'); // "not found"

// noUncheckedIndexedAccess: array index can be undefined
const first = users[0]; // with the flag: User | undefined
// first.name;          // Error: 'first' is possibly 'undefined'.
if (first) console.log(first.name);

// noImplicitAny
// function greet(name) { return 'Hi ' + name; }
// Error: Parameter 'name' implicitly has an 'any' type.`,
        },
        {
          title: 'Recommended strict setup',
          lang: 'json',
          code: `{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
}`,
        },
      ],
      output: `With \`strictNullChecks\`, \`u.name\` is an error because \`find\` may return \`undefined\`; the safe version prints \`not found\`. Without \`noUncheckedIndexedAccess\`, \`users[0]\` would be typed as \`User\` even though the array is empty — a hidden crash. With the flag, TS forces a check. \`noImplicitAny\` flags the untyped \`name\` parameter.`,
      questions: [
        {
          q: 'What does "strict": true enable?',
          a: 'A family of checks: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict` (and newer versions may add more).',
        },
        {
          q: 'What is strictNullChecks?',
          a: 'It makes `null` and `undefined` separate types, so you must handle them before using a value. Without it, any type silently accepts null.',
        },
        {
          q: 'Is noUncheckedIndexedAccess part of strict?',
          a: 'No, it must be enabled separately. It makes index access return `T | undefined`, which catches out-of-range and missing-key bugs.',
        },
        {
          q: 'How would you migrate a large JS project to strict TS?',
          a: 'Enable `allowJs`, convert files gradually, start with loose settings, then turn on strict flags one by one — usually `noImplicitAny` then `strictNullChecks` — fixing errors per folder.',
        },
      ],
      spoken: `"strict true turns on a whole family of checks. The most valuable is strictNullChecks, which makes null and undefined separate types, so TypeScript catches 'cannot read property of undefined' before it happens. noImplicitAny stops silent anys, and useUnknownInCatchVariables makes caught errors unknown. On top of strict I like noUncheckedIndexedAccess, which makes array and record lookups possibly undefined, and noImplicitOverride. When migrating an old JavaScript codebase, I'd enable allowJs, convert gradually, and switch strict flags on one by one."`,
      mistakes: [
        'Starting a new project with `strict: false`. It is much harder to turn on later.',
        'Assuming `noUncheckedIndexedAccess` is part of `strict`. It is not.',
        'Fixing every strict error with `!` or `as any` instead of handling the null case.',
        'Follow-up trap: "Why can upgrading TypeScript break the build when strict is on?" New versions may add checks to the strict family or improve inference, which can surface new errors. Pin the TS version and upgrade on purpose.',
      ],
      takeaway: 'Always use strict — strictNullChecks is the big win — and add noUncheckedIndexedAccess on top.',
    },
    {
      id: 'ts-with-react',
      title: 'TypeScript with React (Props, State, Events, Refs, Children)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Type props with an interface, let useState infer (or pass a generic), use React event types, and type refs with the element type.',
      what: `The everyday React typing patterns:

- **Props:** an \`interface\` or \`type\` for the props object.
- **children:** \`children: React.ReactNode\` (anything React can render).
- **State:** \`useState(0)\` infers \`number\`. For \`null\` starts, pass a generic: \`useState<User | null>(null)\`.
- **Events:** \`React.ChangeEvent<HTMLInputElement>\`, \`React.MouseEvent<HTMLButtonElement>\`, \`React.FormEvent<HTMLFormElement>\`.
- **Refs:** \`useRef<HTMLInputElement>(null)\` for DOM elements.

#### Deeper version
- **Extend native props:** \`React.ComponentProps<'button'>\` (or \`ComponentPropsWithoutRef<'button'>\`) gives all normal button props, so your \`<Button>\` accepts \`onClick\`, \`disabled\`, \`type\` and so on.
- **React.FC:** older versions of the React types added \`children\` to every \`FC\` automatically; React 18's types removed that. Many teams just type props on a normal function — simpler and works with generics.
- **useReducer:** type the state and use a **discriminated union** for actions.
- **Generic components:** \`function List<T>(props: { items: T[]; render: (item: T) => React.ReactNode })\`.
- **Refs:** a DOM ref created with \`null\` is read-only for you and filled by React. A ref used as a mutable box (like a timer id) is typed with its value: \`useRef<number | null>(null)\`.
- **React 19:** \`ref\` can be passed as a normal prop to function components (so \`forwardRef\` is often not needed), and \`useRef\` requires an argument in the React 19 types. Type details differ between \`@types/react\` versions — when unsure, hover the prop in your editor to see the expected event or ref type.`,
      why: `React is where most frontend TS is written. Typed props give autocomplete for every component and catch wrong or missing props across the app. Event and ref types are the most common source of "what type do I put here?" questions in interviews.`,
      analogy: `Typed props are like an order form for a component. The form lists every field, marks which are required, and refuses wrong entries — so the kitchen (component) always gets what it expects.`,
      code: [
        {
          title: 'Props, children and native props',
          lang: 'tsx',
          code: `import type { ReactNode, ComponentProps } from 'react';

interface CardProps {
  title: string;
  subtitle?: string;   // optional
  children: ReactNode; // anything renderable
}

function Card({ title, subtitle, children }: CardProps) {
  return (
    <section>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </section>
  );
}

// Button that accepts every normal <button> prop + a variant
type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };

function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button className={'btn-' + variant} {...rest} />;
}

// <Card>Hi</Card>
// Error: Property 'title' is missing in type '{ children: string; }' but required in type 'CardProps'.`,
        },
        {
          title: 'State, events and refs',
          lang: 'tsx',
          code: `import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';

type User = { id: string; email: string };

function SignupForm({ onDone }: { onDone: (user: User) => void }) {
  const [email, setEmail] = useState('');                 // inferred: string
  const [user, setUser] = useState<User | null>(null);    // explicit: starts null
  const inputRef = useRef<HTMLInputElement>(null);        // DOM ref

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.includes('@')) {
      inputRef.current?.focus(); // current may be null
      return;
    }
    const created = { id: crypto.randomUUID(), email };
    setUser(created);
    onDone(created);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} value={email} onChange={handleChange} />
      <button type="submit">Sign up</button>
      {user && <p>Welcome {user.email}</p>}
    </form>
  );
}`,
        },
        {
          title: 'Generic list component',
          lang: 'tsx',
          code: `import type { ReactNode } from 'react';

type ListProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

function List<T>({ items, getKey, renderItem }: ListProps<T>) {
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
}

// T is inferred as { id: string; name: string }
<List
  items={[{ id: '1', name: 'Pen' }]}
  getKey={(p) => p.id}
  renderItem={(p) => <b>{p.name}</b>}
/>;`,
        },
      ],
      output: `\`<Card>\` without \`title\` fails to compile. \`Button\` accepts \`onClick\`, \`disabled\` and every other native prop plus \`variant\`. In the form, \`email\` is inferred as \`string\`, \`user\` is \`User | null\`, the change handler knows \`e.target.value\` is a string, and \`inputRef.current\` must be null-checked before \`focus()\`. In the generic list, \`p\` is automatically typed from \`items\`, so \`p.name\` autocompletes.`,
      questions: [
        {
          q: 'How do you type children?',
          a: 'Use `children: React.ReactNode` — it covers elements, strings, numbers, arrays, fragments, null and more. `JSX.Element`/`ReactElement` is narrower (one element only).',
        },
        {
          q: 'How do you type an input onChange handler?',
          a: '`(e: React.ChangeEvent<HTMLInputElement>) => void`. Then `e.target.value` is a string. For forms use `React.FormEvent<HTMLFormElement>`, for clicks `React.MouseEvent<HTMLButtonElement>`.',
        },
        {
          q: 'How do you type useState that starts as null?',
          a: 'Pass a generic: `useState<User | null>(null)`. Otherwise TS infers the type as just `null` and you cannot set a user later.',
        },
        {
          q: 'Should you use React.FC?',
          a: 'It is optional. Typing props directly on a function is simpler, works with generic components, and is what many teams prefer. Since React 18 types, `FC` no longer adds `children` automatically.',
        },
        {
          q: 'How do you make a component accept all native button props?',
          a: 'Extend `React.ComponentProps<\'button\'>` (or `ComponentPropsWithoutRef<\'button\'>`) and spread the rest onto the `<button>`.',
        },
      ],
      spoken: `"For React I type props with an interface and destructure them in a normal function — I usually skip React.FC. children is React.ReactNode. useState infers simple types, and when the initial value is null I pass a generic like User or null. For events I use React's types, like ChangeEvent of HTMLInputElement, so e.target.value is typed. For DOM refs I use useRef of HTMLInputElement with null and check current before using it. For reusable components I extend ComponentProps of 'button' so they accept all native props, and I write generic components when the item type varies."`,
      mistakes: [
        '`useState(null)` without a generic — the state is stuck as type `null`.',
        'Typing children as `JSX.Element`, then passing a string or two elements and getting errors. Use `ReactNode`.',
        'Using the DOM `Event` type instead of `React.ChangeEvent` — then `e.target.value` is not available.',
        'Writing `<T>(props) =>` arrow generic components in `.tsx` — the parser reads `<T>` as JSX. Use `<T,>` or a function declaration.',
        'Follow-up trap: "Why is `ref.current` possibly null?" Because React fills it only after the element mounts and sets it back to null on unmount, so you must check it.',
      ],
      takeaway: 'Interface for props, ReactNode for children, generic for null-start state, React event types for handlers, element types for refs.',
    },
    {
      id: 'ts-with-node-express',
      title: 'TypeScript with Node and Express (req, res, env)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Type Express handlers with Request/Response generics, add custom fields to req via declaration merging, and validate env variables at startup.',
      what: `For Node/Express apps you need:
- \`@types/node\` and \`@types/express\` (Express 4 has no built-in types; check whether your Express version ships its own).
- **Handlers:** \`(req: Request, res: Response, next: NextFunction)\`.
- **Typed params, body and query:** \`Request<Params, ResBody, ReqBody, Query>\`.
- **Typed response:** \`Response<ResBody>\` so \`res.json()\` only accepts the right shape.
- **Custom fields** like \`req.user\` (added by auth middleware) via **declaration merging**.
- **Environment variables:** \`process.env.X\` is \`string | undefined\`. Validate them once at startup.

#### Deeper version
- The generic order for \`Request\` is **Params, ResBody, ReqBody, ReqQuery**. A common pattern: \`Request<{ id: string }, unknown, CreateOrderBody>\`.
- Typing \`req.body\` does **not** validate it. The client can send anything. Validate with Zod (or similar) and use the parsed result.
- To add \`req.user\`, augment the Express namespace in a \`.d.ts\` file: \`declare global { namespace Express { interface Request { user?: AuthUser } } }\`. The file must be included by \`tsconfig\`.
- An **error-handling middleware** has 4 parameters: \`(err, req, res, next)\`; Express detects it by that count.
- Running TS in Node: compile with \`tsc\`, or use a runner such as \`tsx\` or \`ts-node\` in development. Newer Node versions can run \`.ts\` files directly by stripping types (with limits like no enums) — check the current Node docs for your version.`,
      why: `The backend is where bad input causes the worst bugs — wrong IDs, missing fields, crashed servers. Typing requests and responses keeps your API contract in one place, and validated env config stops the app from starting with a missing \`STRIPE_SECRET_KEY\` instead of failing later at checkout.`,
      analogy: `Typed handlers are like labeled pipes in a building: this pipe carries water, that one gas. Validation is the inspector at the main valve who checks what actually flows in — labels alone don't stop bad stuff from entering.`,
      code: [
        {
          title: 'Typed route with validated body',
          lang: 'typescript',
          code: `import express, { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

const CreateOrderSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive(),
});
type CreateOrderBody = z.infer<typeof CreateOrderSchema>; // { productId: string; qty: number }

type OrderResponse = { id: string; total: number } | { error: string };

app.post(
  '/orders/:storeId',
  (req: Request<{ storeId: string }, OrderResponse, CreateOrderBody>, res: Response<OrderResponse>) => {
    const parsed = CreateOrderSchema.safeParse(req.body); // real runtime check
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body' });
    }
    const { productId, qty } = parsed.data;
    res.status(201).json({ id: req.params.storeId + '-' + productId, total: qty * 100 });
    // res.json({ ok: true }); // Error: Object literal may only specify known properties...
  }
);

// Error middleware: 4 params
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unknown error';
  res.status(500).json({ error: message });
});`,
        },
        {
          title: 'Adding req.user with declaration merging',
          lang: 'typescript',
          code: `// src/types/express.d.ts
export {}; // makes this file a module

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'admin' | 'user' };
    }
  }
}

// src/middleware/auth.ts
// import type { Request, Response, NextFunction } from 'express';
// export function requireAdmin(req: Request, res: Response, next: NextFunction) {
//   if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
//   next();
// }`,
        },
        {
          title: 'Validated, typed env config',
          lang: 'typescript',
          code: `import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),       // env values are strings -> coerce
  MONGODB_URI: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
});

// Crash at startup if anything is missing or wrong
export const env = EnvSchema.parse(process.env);
// env.PORT is number, env.MONGODB_URI is string (not string | undefined)`,
        },
      ],
      output: `In the route, \`req.params.storeId\` is a \`string\` and \`res.json()\` only accepts \`OrderResponse\` shapes. The body is checked with \`safeParse\`; bad input returns 400 instead of crashing. The \`.d.ts\` file adds \`user\` to every Express \`Request\`, so \`req.user?.role\` type-checks in middleware. The env schema runs once at startup: a missing \`MONGODB_URI\` stops the app immediately with a clear error, and afterwards \`env.PORT\` is a real number.`,
      questions: [
        {
          q: 'How do you type req.body in Express?',
          a: 'Use the third generic of `Request`: `Request<Params, ResBody, ReqBody>`. But that is only a type — still validate the body at runtime, e.g. with Zod, and use the parsed data.',
        },
        {
          q: 'How do you add a user property to Request?',
          a: 'Augment the global `Express.Request` interface in a `.d.ts` file with `declare global { namespace Express { interface Request { user?: User } } }` and make sure tsconfig includes it.',
        },
        {
          q: 'Why is process.env.X typed as string | undefined?',
          a: 'Because any variable may be missing at runtime. Validate env at startup (Zod or manual checks) and export a typed config object.',
        },
        {
          q: 'How do you run a TypeScript Node app?',
          a: 'Build with `tsc` and run the JS output in production. In development use a runner like `tsx` or `ts-node`. Recent Node versions can also strip types natively, with limitations.',
        },
      ],
      spoken: `"In Express I type handlers with Request and Response from @types/express. Request takes generics for params, response body, request body and query, and Response takes the response body type so res.json is checked. But a typed body isn't a validated body, so I parse it with Zod and use the parsed result. For things like req.user from auth middleware, I augment the Express Request interface in a d.ts file using declaration merging. For environment variables, I validate process.env once at startup with a schema, so the app fails fast and the rest of the code gets a typed config."`,
      mistakes: [
        'Typing `req.body` as `CreateOrderBody` and never validating it.',
        'Reading `process.env.KEY!` all over the code instead of validating once at startup.',
        'Writing the `.d.ts` augmentation but not including it in `tsconfig` (or forgetting `export {}`), so `req.user` still errors.',
        'Getting the `Request` generic order wrong. It is Params, ResBody, ReqBody, Query.',
        'Follow-up trap: "Why does my error middleware never run?" Express only treats middleware with exactly 4 parameters as error handlers — keep `next` even if unused.',
      ],
      takeaway: 'Type Express with Request/Response generics, augment Request for custom fields, and validate body and env at runtime.',
    },
    {
      id: 'declaration-files',
      title: 'Declaration Files (.d.ts), @types and Module Augmentation',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: '.d.ts files contain only types — no code. They describe JavaScript libraries, globals and non-code imports to TypeScript.',
      what: `A **declaration file** (\`.d.ts\`) has **only type information**, no runnable code. It tells TS "this thing exists and has this shape".

Where they come from:
- **Bundled with the library** (e.g. \`axios\`, \`zod\` ship their own types).
- **DefinitelyTyped** — community types installed as \`@types/xyz\` (e.g. \`@types/express\`, \`@types/node\`).
- **Your own** — for untyped packages, global variables, or file imports like \`.svg\` and \`.css\`.

#### Deeper version
Key syntax:
- \`declare\` — "this exists at runtime, don't generate code": \`declare const API_URL: string;\`
- \`declare module 'some-lib' { ... }\` — types for an untyped package. A shorthand \`declare module 'some-lib';\` makes all its imports \`any\`.
- \`declare module '*.svg' { const src: string; export default src; }\` — wildcard modules for asset imports.
- \`declare global { ... }\` — add to the global scope (inside a module file; add \`export {}\` if the file has no imports/exports).
- **Module augmentation** — re-open an existing module's interface to add fields (e.g. Express \`Request\`, a theme type in a UI library). It relies on interface **declaration merging**.

Other points:
- \`"declaration": true\` in tsconfig makes \`tsc\` generate \`.d.ts\` files for your own library.
- A \`.d.ts\` file is a **script** (global) if it has no top-level \`import\`/\`export\`, and a **module** if it has one. This decides whether \`declare\` adds globals or not — the cause of many "my type isn't found" bugs.
- Vite projects have \`vite-env.d.ts\` with \`/// <reference types="vite/client" />\`, which types \`import.meta.env\` and asset imports.`,
      why: `Most of the npm ecosystem was written in JavaScript. Declaration files let TypeScript understand those libraries, your global variables, and non-JS imports — without rewriting anything. You will need to write one the first time a package has no types.`,
      analogy: `A \`.d.ts\` file is like a user manual for a machine. The manual has no motor or gears inside (no code); it just tells you what buttons exist and what they do, so you can use the machine correctly.`,
      code: [
        {
          title: 'Types for an untyped package, assets and globals',
          lang: 'typescript',
          code: `// src/types/global.d.ts

// 1) An untyped npm package
declare module 'legacy-slugify' {
  export default function slugify(text: string, sep?: string): string;
}

// 2) Asset imports
declare module '*.svg' {
  const src: string;
  export default src;
}

// 3) A global injected by a script tag
declare global {
  interface Window {
    analytics?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

export {}; // makes this file a module so "declare global" is allowed`,
        },
        {
          title: 'Using them',
          lang: 'typescript',
          code: `import slugify from 'legacy-slugify';
import logo from './logo.svg';

const slug: string = slugify('Hello World'); // typed
console.log(logo);                            // string path

window.analytics?.track('signup', { plan: 'pro' }); // typed global
// window.analytics?.track(123);
// Error: Argument of type 'number' is not assignable to parameter of type 'string'.`,
        },
      ],
      output: `The \`.d.ts\` file adds no JavaScript. It just tells TS that \`legacy-slugify\` exports a function returning a string, that \`.svg\` imports are strings, and that \`window.analytics\` may exist. The second file then gets full autocomplete and errors — passing a number as the event name fails at compile time.`,
      questions: [
        {
          q: 'What is a .d.ts file?',
          a: 'A declaration file containing only type information. It describes the shape of JS code, globals or modules so TS can type-check code that uses them.',
        },
        {
          q: 'What is @types?',
          a: 'The npm scope for DefinitelyTyped, a community repo of type definitions for JS libraries that don\'t ship their own, e.g. `@types/express`.',
        },
        {
          q: 'A package has no types. What do you do?',
          a: 'Check for an `@types/` package. If none exists, write `declare module \'pkg\'` in a `.d.ts` file — with real types for the parts you use, or the shorthand form as a quick fix.',
        },
        {
          q: 'What is module augmentation?',
          a: 'Re-opening an existing module or global interface to add fields, using declaration merging — like adding `user` to Express `Request` or a custom field to `Window`.',
        },
      ],
      spoken: `"A d.ts file holds only types, no code. It's how TypeScript understands JavaScript libraries — either the library ships its own, or I install them from DefinitelyTyped as @types packages. When a package has no types I write a declare module block with the functions I actually use. I also use d.ts files for asset imports like SVGs, for globals on window, and for module augmentation — for example adding user to the Express Request interface. One gotcha is that a d.ts with an import or export becomes a module, so globals need declare global."`,
      mistakes: [
        'Putting `declare global` in a file with no import/export (it must be a module) — or adding an import to a global script file and losing the globals.',
        'Writing `declare module \'pkg\';` everywhere — it makes the package `any` and hides real errors.',
        'Creating a `.d.ts` file that `tsconfig` does not include, so TS never sees it.',
        'Follow-up trap: "Does `declare` generate code?" No. It only tells TS that something exists at runtime; you must make sure it really does.',
      ],
      takeaway: '.d.ts files are type-only manuals for JS code, globals and assets — use @types first, write your own when needed.',
    },
    {
      id: 'runtime-validation',
      title: 'Runtime Validation and Type Safety at the Boundaries (Zod)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Types disappear at runtime, so data from APIs, forms, env and LLMs must be validated. A schema library like Zod gives both the check and the type.',
      what: `TypeScript checks **your code**, not **your data**. Anything that comes from outside — HTTP requests, \`fetch\` responses, \`localStorage\`, env variables, webhooks, LLM JSON output — is unchecked at runtime, even if you wrote a type for it.

The fix is **runtime validation** at the **boundaries** (the places where data enters your app). Schema libraries like **Zod** let you write the rules once and get:
1. A function that checks data at runtime (\`schema.parse\` / \`safeParse\`).
2. A TypeScript type **inferred** from the same schema (\`z.infer<typeof schema>\`).

#### Deeper version
- \`parse\` throws on bad data; \`safeParse\` returns \`{ success: true, data }\` or \`{ success: false, error }\` — a discriminated union.
- Once data passes the boundary, the inside of your app can trust the types completely.
- Other libraries do the same job (Valibot, Yup, io-ts, ArkType). The idea matters more than the library.
- For APIs shared between frontend and backend, the same schema can validate the form on the client and the body on the server.
- For LLM structured output, validating the model's JSON with a schema (and retrying on failure) is the standard safety step.
- **Branded types** pair well with validation: a function \`toEmail(s: string): Email\` that validates and returns \`string & { __brand: 'Email' }\` means an \`Email\` can only come from a checked value.

Zod's API has changed between major versions (v3 to v4 changed some method names and error formats) — check the docs for the version you use.`,
      why: `"I typed the API response, so it must be right" is one of the most common TS misunderstandings. A backend change, a null field, or a model returning bad JSON breaks the app at runtime even though it compiled. Validation at the edges turns those into handled, clear errors.`,
      analogy: `TypeScript is the building plan that shows where every room is. Runtime validation is the security desk at the entrance that checks every visitor. The plan cannot stop a stranger from walking in — the desk can.`,
      code: [
        {
          title: 'One schema = runtime check + type',
          lang: 'typescript',
          code: `import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  tags: z.array(z.string()).default([]),
});

type Product = z.infer<typeof ProductSchema>;
// { id: string; name: string; price: number; tags: string[] }

async function getProduct(id: string): Promise<Product> {
  const res = await fetch('/api/products/' + id);
  const json: unknown = await res.json();
  return ProductSchema.parse(json); // throws a clear error if the API sent bad data
}

const result = ProductSchema.safeParse({ id: 'p1', name: '', price: -5 });
if (!result.success) {
  console.log(result.error.issues.map((i) => i.path.join('.') + ': ' + i.message));
  // e.g. [ 'name: ...too small...', 'price: ...too small...' ] (exact text depends on the Zod version)
} else {
  console.log(result.data.price); // typed as number
}`,
        },
        {
          title: 'Branded type created only by validation',
          lang: 'typescript',
          code: `type Email = string & { readonly __brand: 'Email' };

function toEmail(input: string): Email {
  if (!/^[^@\\s]+@[^@\\s]+$/.test(input)) throw new Error('Invalid email');
  return input as Email; // the only place we assert
}

function sendWelcome(to: Email) {
  console.log('Sending to', to);
}

sendWelcome(toEmail('asha@example.com')); // OK
// sendWelcome('asha@example.com');
// Error: Argument of type 'string' is not assignable to parameter of type 'Email'.`,
        },
      ],
      output: `\`getProduct\` returns a real \`Product\` only if the JSON matches; otherwise \`parse\` throws with details instead of letting bad data spread. The \`safeParse\` call fails because \`name\` is empty and \`price\` is negative, and logs the problem paths. In the second block, \`sendWelcome\` only accepts an \`Email\`, which can only be produced by \`toEmail\` — so every email reaching it has been checked.`,
      questions: [
        {
          q: 'If I type an API response, is it safe?',
          a: 'No. The type is just a promise to the compiler. The server can send anything. Validate the response at runtime and only then treat it as that type.',
        },
        {
          q: 'What does z.infer do?',
          a: 'It creates a TypeScript type from a Zod schema, so the runtime rules and the static type come from one source and never drift apart.',
        },
        {
          q: 'parse vs safeParse?',
          a: '`parse` returns the data or throws. `safeParse` never throws; it returns a result object with `success` and either `data` or `error`.',
        },
        {
          q: 'What is a branded type?',
          a: 'A type like `string & { __brand: \'Email\' }`. It behaves like a string but plain strings are not assignable to it, so you can force values to pass through a validator first.',
        },
      ],
      spoken: `"TypeScript only checks my code, not the data coming in, because types are erased at runtime. So at every boundary — request bodies, API responses, env variables, webhook payloads, and especially LLM JSON output — I validate with a schema library like Zod. The nice part is z.infer: the schema gives me both the runtime check and the TypeScript type, so they can't drift. I use parse when invalid data should throw and safeParse when I want to handle errors myself. Inside the app, after validation, I can trust the types fully."`,
      mistakes: [
        'Writing `const data = (await res.json()) as User` and calling it type-safe.',
        'Writing a type and a schema separately by hand, so they slowly drift apart. Infer the type from the schema.',
        'Validating deep inside business logic instead of once at the boundary.',
        'Follow-up trap: "Doesn\'t validation slow things down?" It costs a little CPU, but it runs once per input and prevents corrupt data in your database. For hot paths you can validate only the fields you use.',
      ],
      takeaway: 'Types protect code, schemas protect data — validate at the boundaries and infer the type from the schema.',
    },
    {
      id: 'mapped-types',
      title: 'Mapped Types',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'A mapped type loops over the keys of a type and builds a new type, optionally changing each property or its key name.',
      what: `A **mapped type** creates a new object type by **looping over keys**, like a \`for...in\` loop for types:

\`\`\`typescript
type Flags<T> = { [K in keyof T]: boolean };
\`\`\`

For every key \`K\` of \`T\`, the new type has a property \`K\` of type \`boolean\`. \`Partial\`, \`Readonly\`, \`Pick\` and \`Record\` are all mapped types.

#### Deeper version
- **Modifiers:** add or remove \`readonly\` and \`?\` with \`+\` / \`-\`. \`-?\` makes properties required (that's how \`Required<T>\` works); \`-readonly\` makes them mutable.
- **Value transform:** \`T[K]\` gives the original property type, so you can wrap it: \`{ [K in keyof T]: Promise<T[K]> }\`.
- **Key remapping with \`as\`** (TS 4.1+): \`[K in keyof T as NewKey]\`. You can rename keys with template literal types or **filter** keys by remapping them to \`never\`.
- Mapped types over \`keyof T\` are **homomorphic** — they keep the original optional/readonly modifiers.
- Combined with conditional types, you can do things like "pick only the function properties" or "make only some keys optional".`,
      why: `When you have one base type, you often need variations: a form-errors type with the same keys, a "dirty fields" type, getter names, a version with only string fields. Mapped types generate these automatically, so they stay in sync when the base type changes.`,
      analogy: `A mapped type is like a mail-merge. You have one list of names (keys) and a template ("Dear {name}, your value is ..."), and it generates one line per name automatically.`,
      code: [
        {
          title: 'Basic mapped types and modifiers',
          lang: 'typescript',
          code: `type SignupForm = { email: string; password: string; age?: number };

// Same keys, different value type
type FormErrors = { [K in keyof SignupForm]?: string };
// { email?: string; password?: string; age?: string }

type Touched = { [K in keyof SignupForm]: boolean };
// { email: boolean; password: boolean; age?: boolean }  (age keeps its "?")

// Remove modifiers
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type AllRequired<T> = { [K in keyof T]-?: T[K] };
type R = AllRequired<SignupForm>; // age: number (required now)

const errors: FormErrors = { email: 'Invalid email' }; // OK`,
        },
        {
          title: 'Key remapping with as',
          lang: 'typescript',
          code: `type User = { name: string; age: number; save: () => void };

// Rename keys: name -> getName
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type UserGetters = Getters<Pick<User, 'name' | 'age'>>;
// { getName: () => string; getAge: () => number }

// Filter keys: keep only non-function properties
type DataOnly<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
type UserData = DataOnly<User>; // { name: string; age: number }`,
        },
      ],
      output: `\`FormErrors\` has the same keys as the form but every value is an optional string, and \`Touched\` keeps \`age\` optional because mapping over \`keyof T\` preserves modifiers. \`AllRequired\` uses \`-?\` to make \`age\` required. In the second block, \`as\` with a template literal renames keys to \`getName\`/\`getAge\`, and remapping function keys to \`never\` drops \`save\`.`,
      questions: [
        {
          q: 'What is a mapped type?',
          a: 'A type that iterates over a union of keys (often `keyof T`) with `[K in ...]` and builds a new property for each one.',
        },
        {
          q: 'How is Partial implemented?',
          a: '`type Partial<T> = { [K in keyof T]?: T[K] }`.',
        },
        {
          q: 'What does -? or -readonly mean?',
          a: 'They remove the optional or readonly modifier from every property. `Required<T>` uses `-?`.',
        },
        {
          q: 'How do you rename or filter keys in a mapped type?',
          a: 'Use key remapping with `as`: `[K in keyof T as NewName]`. Map to a template literal to rename, or to `never` to drop the key.',
        },
      ],
      spoken: `"A mapped type loops over keys to build a new type — basically a for-in loop at the type level. The syntax is K in keyof T, and for each key I decide the new value type, often based on T of K. That's exactly how Partial, Readonly, Pick and Record are built. I can add or remove modifiers with plus and minus, like minus question mark to make everything required. Since TS 4.1 I can remap keys with as, which lets me rename keys using template literal types, like generating getName, or filter keys out by mapping them to never."`,
      mistakes: [
        'Forgetting `string & K` inside template literals — `keyof T` can include `number` and `symbol`, which `Capitalize` does not accept.',
        'Writing a mapped type over a union of keys that is not `keyof T` and being surprised that optional modifiers are not preserved.',
        'Building very deep recursive mapped types that slow down the editor.',
        'Follow-up trap: "What is the difference between `Record<K, V>` and a mapped type?" `Record` is a mapped type: `{ [P in K]: V }`. It just has a fixed value type for every key.',
      ],
      takeaway: 'Mapped types are for-loops over keys — use them (with as and +/- modifiers) to generate variations of a base type.',
    },
    {
      id: 'conditional-types',
      title: 'Conditional Types',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'T extends U ? X : Y — an if/else for types. With unions it runs once per member (distributive).',
      what: `A **conditional type** chooses a type based on a condition:

\`\`\`typescript
type IsString<T> = T extends string ? 'yes' : 'no';
\`\`\`

Read it as: "if \`T\` is assignable to \`string\`, the result is \`'yes'\`, otherwise \`'no'\`." It is a ternary (\`? :\`) for types.

#### Deeper version
- **Distributive:** when \`T\` is a **naked type parameter** and you pass a union, the condition runs **for each member** separately, and the results are joined. \`IsString<string | number>\` = \`'yes' | 'no'\`.
- This is how \`Exclude<T, U> = T extends U ? never : T\` filters unions — members that match become \`never\` and disappear.
- **Stop distribution** by wrapping both sides in a tuple: \`[T] extends [string] ? ...\`. Useful for checks like "is this exactly \`never\`?".
- \`never\` passed to a distributive conditional gives \`never\` (an empty union has nothing to loop over).
- Conditional types often use \`infer\` to pull out a part of a type (next topic).
- They can be **recursive**, e.g. a \`DeepPartial\` or unwrapping nested arrays.`,
      why: `They let one generic type behave differently depending on the input — like a function return type that depends on the argument, or filtering a union. Most advanced library types (Prisma, tRPC, React Hook Form, Zod) are built from conditional types.`,
      analogy: `A conditional type is like a sorting machine at a recycling plant: "if it's metal, put it in bin A; otherwise bin B". With a mixed bag (a union), the machine checks each item one by one.`,
      code: [
        {
          title: 'Basic and distributive conditional types',
          lang: 'typescript',
          code: `type IsString<T> = T extends string ? 'yes' : 'no';

type A = IsString<'hi'>;            // 'yes'
type B = IsString<42>;              // 'no'
type C = IsString<string | number>; // 'yes' | 'no' (distributed)

// Filtering a union (how Exclude works)
type MyExclude<T, U> = T extends U ? never : T;
type D = MyExclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'

// Stop distribution with [ ]
type IsStringStrict<T> = [T] extends [string] ? 'yes' : 'no';
type E = IsStringStrict<string | number>; // 'no'

type IsNever<T> = [T] extends [never] ? true : false;
type F = IsNever<never>; // true`,
        },
        {
          title: 'Return type that depends on input',
          lang: 'typescript',
          code: `type ApiResult<T> = T extends 'list' ? string[] : T extends 'count' ? number : never;

function query<T extends 'list' | 'count'>(kind: T): ApiResult<T> {
  // TS can't check a conditional return inside the body, so we assert here
  return (kind === 'list' ? ['a', 'b'] : 2) as ApiResult<T>;
}

const names = query('list');  // string[]
const total = query('count'); // number

// Recursive: flatten nested arrays
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
type G = Flatten<number[][][]>; // number`,
        },
      ],
      output: `\`IsString\` gives \`'yes'\` or \`'no'\`. With a union it runs per member, giving \`'yes' | 'no'\`. \`MyExclude\` drops \`'a'\` by turning it into \`never\`. Wrapping in \`[T]\` stops distribution, so \`string | number\` as a whole is not a string — \`'no'\`. In the second block, \`query('list')\` returns \`string[]\` and \`query('count')\` returns \`number\`, and \`Flatten\` keeps unwrapping arrays until it reaches \`number\`.`,
      questions: [
        {
          q: 'What is a conditional type?',
          a: 'A type of the form `T extends U ? X : Y`. If `T` is assignable to `U`, the result is `X`, otherwise `Y`.',
        },
        {
          q: 'What is a distributive conditional type?',
          a: 'When the checked type is a naked type parameter and receives a union, the condition is applied to each member separately and the results are unioned.',
        },
        {
          q: 'How do you prevent distribution?',
          a: 'Wrap both sides in a tuple: `[T] extends [U] ? X : Y`.',
        },
        {
          q: 'How is Exclude implemented?',
          a: '`type Exclude<T, U> = T extends U ? never : T` — matching members become `never` and vanish from the union.',
        },
      ],
      spoken: `"A conditional type is an if-else for types: T extends U, question mark, X, colon, Y. If T is assignable to U I get X, otherwise Y. The important detail is distribution: when T is a bare type parameter and I pass a union, it runs for each member and unions the results — that's exactly how Exclude and NonNullable filter unions, by returning never for matches. If I don't want that, I wrap both sides in square brackets. I combine conditional types with infer to extract parts of types, and use them for return types that depend on arguments."`,
      mistakes: [
        'Not realizing a conditional type distributes over unions, and getting `\'yes\' | \'no\'` instead of one answer.',
        'Checking `T extends never` to detect never — it returns `never` for `never`. Use `[T] extends [never]`.',
        'Expecting TS to narrow a conditional return type inside the function body. It cannot; an assertion (or overloads) is usually needed in the implementation.',
        'Follow-up trap: "Why is `T extends U` in a conditional different from a generic constraint?" A constraint restricts what `T` can be; a conditional just tests it and picks a branch.',
      ],
      takeaway: 'Conditional types are type-level ternaries that distribute over unions — the engine behind Exclude, NonNullable and most library magic.',
    },
    {
      id: 'infer-keyword',
      title: 'The infer Keyword',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'infer captures a part of a type inside a conditional type — like pattern matching to pull out a return type, element type or Promise value.',
      what: `\`infer\` is used **only inside the \`extends\` part of a conditional type**. It says: "if the type matches this pattern, **capture** this piece into a new type variable."

\`\`\`typescript
type ElementType<T> = T extends (infer E)[] ? E : never;
// ElementType<string[]> = string
\`\`\`

Here \`infer E\` grabs whatever is inside the array.

#### Deeper version
- \`ReturnType\` is built with infer: \`T extends (...args: any[]) => infer R ? R : any\`.
- \`Parameters\`: \`T extends (...args: infer P) => any ? P : never\`.
- \`Awaited\` is a more careful recursive version of \`T extends Promise<infer V> ? V : T\` (it also handles any "thenable").
- You can infer from **tuples** (\`[infer First, ...infer Rest]\`), **template literals** (a pattern like \`\${infer Head}/\${infer Tail}\` inside backticks), and **object properties** (\`{ data: infer D }\`).
- **infer with a constraint** (TS 4.7+): \`infer N extends number\` only matches if the captured part is a number.
- If the same \`infer\` variable appears in several positions, TS combines the candidates (union for most positions, intersection for parameter positions).`,
      why: `Libraries and your own helpers often need "the type inside something": the data type of an API wrapper, the props of a component, the item type of an array, the resolved value of a promise. \`infer\` extracts it instead of making you write it twice.`,
      analogy: `\`infer\` is like a cookie cutter with a hole in the middle. You press it onto a type; if the outside shape matches, whatever is inside the hole is what you keep.`,
      code: [
        {
          title: 'Building common helpers with infer',
          lang: 'typescript',
          code: `type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type ElementType<T> = T extends readonly (infer E)[] ? E : never;
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;

function createSession() {
  return { token: 'abc', expiresAt: 123 };
}

type Session = MyReturnType<typeof createSession>; // { token: string; expiresAt: number }
type Tag = ElementType<['a', 'b']>;                // 'a' | 'b'
type N = UnwrapPromise<Promise<number>>;           // number
type S = UnwrapPromise<string>;                    // string (not a Promise)

// Extract the data type from an API wrapper
type ApiResponse<T> = { data: T; status: number };
type DataOf<R> = R extends { data: infer D } ? D : never;
type Users = DataOf<ApiResponse<{ id: string }[]>>; // { id: string }[]`,
        },
        {
          title: 'Tuples and constrained infer',
          lang: 'typescript',
          code: `type First<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;
type Last<T extends unknown[]> = T extends [...unknown[], infer L] ? L : never;

type A = First<[string, number, boolean]>; // string
type B = Last<[string, number, boolean]>;  // boolean

// infer with an extends constraint (syntax: TS 4.7+, literal number result: TS 4.8+)
type ToNumber<S> = S extends \`\${infer N extends number}\` ? N : never;
type C = ToNumber<'42'>;  // 42
type D = ToNumber<'abc'>; // never`,
        },
      ],
      output: `\`MyReturnType\` captures the function's return object as \`Session\`. \`ElementType\` captures the tuple members as \`'a' | 'b'\`. \`UnwrapPromise\` returns \`number\` for a Promise and leaves \`string\` as is. \`DataOf\` pattern-matches \`{ data: infer D }\` to get the payload type. In the second block, tuple patterns grab the first and last element types, and \`infer N extends number\` turns the string \`'42'\` into the number literal type \`42\` but gives \`never\` for \`'abc'\`.`,
      questions: [
        {
          q: 'What does infer do?',
          a: 'Inside the `extends` clause of a conditional type, it declares a type variable that captures part of the matched type, which you can use in the true branch.',
        },
        {
          q: 'How is ReturnType implemented?',
          a: '`type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any`.',
        },
        {
          q: 'Can you use infer outside a conditional type?',
          a: 'No. It is only valid in the `extends` part of a conditional type.',
        },
        {
          q: 'How do you get the element type of an array?',
          a: '`T extends (infer E)[] ? E : never`, or simply `T[number]` for arrays and tuples.',
        },
      ],
      spoken: `"infer is pattern matching for types. It only works inside the extends clause of a conditional type, and it captures a piece of the matched type into a new variable. For example, T extends a function returning infer R gives me R — that's literally how ReturnType is written. Parameters and Awaited work the same way. I use it to extract things like the data type from an API response wrapper, the element type of an array, or the first item of a tuple. Since TS 4.7 I can add a constraint, like infer N extends number."`,
      mistakes: [
        'Trying to use `infer` outside a conditional type — it is a syntax error.',
        'Forgetting the false branch result: if the pattern doesn\'t match, you get whatever is after `:`, often `never`, which can silently erase types.',
        'Writing a custom helper with infer when a built-in already exists (`ReturnType`, `Parameters`, `Awaited`, `InstanceType`).',
        'Follow-up trap: "What is the difference between `T[number]` and `infer E` for arrays?" Both give the element type; `T[number]` is simpler, `infer` is needed when you also want to check the shape or capture several parts.',
      ],
      takeaway: 'infer = "capture this part" inside a conditional type — the tool behind ReturnType, Parameters and Awaited.',
    },
    {
      id: 'template-literal-types',
      title: 'Template Literal Types',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Build string types with backtick syntax, like `on${Capitalize<Event>}`. Unions inside them expand to every combination.',
      what: `**Template literal types** (TS 4.1+) use the same backtick syntax as JavaScript template strings, but at the **type** level:

\`\`\`typescript
type Greeting = \`hello \${string}\`; // any string starting with "hello "
\`\`\`

You can put literal types, unions, \`string\`, \`number\` and other types inside \`\${ }\`.

#### Deeper version
- **Unions expand** into every combination: the template \`\${'sm' | 'lg'}-\${'red' | 'blue'}\` (in backticks) becomes \`'sm-red' | 'sm-blue' | 'lg-red' | 'lg-blue'\`. Big unions can explode in size, so be careful.
- **Built-in string helpers** (intrinsic types): \`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`.
- With **key remapping** in mapped types, you can generate method names like \`onClick\`, \`getName\`.
- With **infer**, you can **parse** strings at the type level — for example, extract \`:id\` params from a route like \`'/users/:id'\`. This is how some typed routers work.
- Patterns like \`\${number}px\` (in backticks) validate string formats (only for literal values known at compile time).`,
      why: `Many APIs are string-based: event names, CSS values, route paths, i18n keys, env var names. Template literal types catch typos in those strings and generate related names automatically, instead of keeping long hand-written unions in sync.`,
      analogy: `It is like a label printer with blanks: "Size: ___, Color: ___". Give it a list of sizes and colors, and it prints every possible label for you.`,
      code: [
        {
          title: 'Combinations and string helpers',
          lang: 'typescript',
          code: `type Size = 'sm' | 'md' | 'lg';
type Color = 'primary' | 'danger';

type ButtonClass = \`btn-\${Size}-\${Color}\`;
// 'btn-sm-primary' | 'btn-sm-danger' | 'btn-md-primary' | ... (6 total)

const cls: ButtonClass = 'btn-md-danger'; // OK
// const bad: ButtonClass = 'btn-xl-danger';
// Error: Type '"btn-xl-danger"' is not assignable to type 'ButtonClass'.

type DomEvent = 'click' | 'focus';
type HandlerName = \`on\${Capitalize<DomEvent>}\`; // 'onClick' | 'onFocus'

type CssLength = \`\${number}px\` | \`\${number}rem\`;
const w: CssLength = '12px'; // OK
// const h: CssLength = '12';  // Error: Type '"12"' is not assignable to type 'CssLength'.`,
        },
        {
          title: 'Parsing route params with infer',
          lang: 'typescript',
          code: `type RouteParams<Path extends string> =
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof RouteParams<Rest>]: string }
    : Path extends \`\${string}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

type P = RouteParams<'/users/:userId/orders/:orderId'>;
// { userId: string; orderId: string }

function buildPath<T extends string>(path: T, params: RouteParams<T>): string {
  let out: string = path;
  for (const [key, value] of Object.entries(params as Record<string, string>)) {
    out = out.replace(':' + key, value);
  }
  return out;
}

console.log(buildPath('/users/:userId/orders/:orderId', { userId: 'u1', orderId: 'o9' }));
// "/users/u1/orders/o9"
// buildPath('/users/:userId', {});
// Error: Property 'userId' is missing in type '{}' but required in type '{ userId: string; }'.`,
        },
      ],
      output: `\`ButtonClass\` expands into all 6 size-color combinations, so \`'btn-xl-danger'\` is rejected. \`Capitalize\` turns event names into \`'onClick' | 'onFocus'\`. \`CssLength\` accepts \`'12px'\` but not \`'12'\`. In the second block, \`RouteParams\` reads the path string at the type level and builds \`{ userId: string; orderId: string }\`, so \`buildPath\` forces you to pass exactly the params in the URL and prints \`/users/u1/orders/o9\`.`,
      questions: [
        {
          q: 'What are template literal types?',
          a: 'String types built with backtick syntax at the type level, e.g. `user-${number}` written inside backticks. They can combine literal types, unions and primitives.',
        },
        {
          q: 'What happens with unions inside a template literal type?',
          a: 'They expand into the cross product of all combinations — two unions of 3 and 2 members give 6 strings.',
        },
        {
          q: 'What are Uppercase, Capitalize and friends?',
          a: 'Built-in intrinsic string types that transform string literal types: `Uppercase<\'a\'>` is `\'A\'`, `Capitalize<\'click\'>` is `\'Click\'`.',
        },
        {
          q: 'Give a real use case.',
          a: 'Typed event handler names (`on${Capitalize<E>}`), CSS units, i18n keys like `auth.${string}`, and extracting route params from a path string in typed routers.',
        },
      ],
      spoken: `"Template literal types bring JavaScript's backtick strings to the type level. I can write something like on plus Capitalize of an event name, and TypeScript generates onClick and onFocus. When I put unions inside, they expand into every combination, which is great for things like button class names — but it can blow up with big unions. Combined with infer, I can even parse strings at the type level, for example pulling userId and orderId out of a route path so a buildPath function requires exactly those params. I mostly see them in typed routers, i18n keys and design-system props."`,
      mistakes: [
        'Combining several large unions and creating thousands of members, which slows the compiler (TS also has a limit on union size).',
        'Expecting a `${number}px` template type to validate runtime strings from users. It only checks values known at compile time.',
        'Using `Capitalize<K>` on `keyof T` without `string & K`, since keys can be numbers or symbols.',
        'Follow-up trap: "Are template literal types available at runtime?" No — like all types they are erased. You still need runtime checks for dynamic strings.',
      ],
      takeaway: 'Template literal types build and parse string types — great for event names, CSS units and typed routes, but watch union explosion.',
    },
    {
      id: 'decorators',
      title: 'Decorators (TS 5 Standard vs Legacy experimentalDecorators)',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'Decorators are functions that wrap or annotate classes and their members using @syntax. TS 5.0 supports the new standard; frameworks like NestJS and Angular still use the legacy version.',
      what: `A **decorator** is a function you attach with \`@\` to a class, method, field or accessor to **add behavior** — logging, validation, routing, dependency injection. Example: \`@Get('/users')\` in NestJS.

There are **two different decorator systems** in TypeScript:

1. **Legacy / experimental decorators** — turned on with \`"experimentalDecorators": true\`. This is the older design used by **Angular, NestJS, TypeORM, class-validator** and others. Often used with \`"emitDecoratorMetadata": true\` so DI frameworks can read constructor parameter types at runtime.
2. **Standard (ECMAScript) decorators** — supported since **TypeScript 5.0** without any flag. They follow the TC39 decorators proposal.

#### Deeper version
The two are **not compatible**:
- **Signatures differ.** Legacy method decorators get \`(target, propertyKey, descriptor)\`. Standard decorators get \`(value, context)\`, where \`context\` has \`kind\`, \`name\`, \`addInitializer\` and more.
- **Parameter decorators** (like \`@Inject()\` on a constructor parameter) exist only in the legacy system. Standard decorators do not support them (as of TS 5.0).
- \`emitDecoratorMetadata\` works only with legacy decorators. TS 5.2 added support for the newer **decorator metadata** proposal (\`Symbol.metadata\`) for standard decorators.
- If \`experimentalDecorators\` is on, TS uses the **legacy** behavior for the whole project.
- JavaScript engines are adding native support gradually; until then TypeScript compiles decorators into helper code. Check the current status for your target runtime.

Rule of thumb: if your framework (NestJS, Angular, TypeORM) asks for \`experimentalDecorators\`, keep using it. For new standalone code, the standard version is the future.`,
      why: `Decorators remove repeated boilerplate — logging every method call, registering routes, marking classes as injectable. You will meet them in NestJS and Angular codebases, and interviewers like to check that you know the legacy-vs-standard split, because mixing them up causes confusing errors.`,
      analogy: `A decorator is like gift-wrapping. The gift (your method) stays the same, but the wrapping adds something around it — a card, a ribbon, a "fragile" sticker (logging, validation, metadata).`,
      code: [
        {
          title: 'Standard decorator (TS 5.0+, no flag)',
          lang: 'typescript',
          code: `// A method decorator that logs calls
function log<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log('Calling ' + name + ' with', args);
    return target.call(this, ...args);
  };
}

class Cart {
  total = 0;

  @log
  add(price: number) {
    this.total += price;
    return this.total;
  }
}

new Cart().add(250);
// Calling add with [ 250 ]
// returns 250`,
        },
        {
          title: 'Legacy decorator (experimentalDecorators: true) — NestJS style',
          lang: 'typescript',
          code: `// tsconfig: { "experimentalDecorators": true, "emitDecoratorMetadata": true }

function LogLegacy(target: object, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (this: unknown, ...args: unknown[]) {
    console.log('Calling ' + key + ' with', args);
    return original.apply(this, args);
  };
  return descriptor;
}

class OrderService {
  @LogLegacy
  place(id: string) {
    return 'placed ' + id;
  }
}

// What you'll see in NestJS (legacy decorators under the hood):
// @Controller('orders')
// export class OrdersController {
//   constructor(@Inject(OrderService) private orders: OrderService) {} // parameter decorator: legacy only
//   @Get(':id') findOne(@Param('id') id: string) { ... }
// }`,
        },
      ],
      output: `In the standard version, \`@log\` receives the original method and a \`context\` object, and returns a new function that logs \`Calling add with [ 250 ]\` before running the real method, which returns \`250\`. The legacy version does the same thing through the property descriptor — the old \`(target, key, descriptor)\` signature. The NestJS snippet shows parameter decorators like \`@Param\` and \`@Inject\`, which only exist in the legacy system.`,
      questions: [
        {
          q: 'What is a decorator?',
          a: 'A function applied with `@` to a class or class member that can wrap, replace or annotate it — used for logging, DI, routing and validation.',
        },
        {
          q: 'What is the difference between experimentalDecorators and TS 5 decorators?',
          a: 'Legacy decorators (`experimentalDecorators`) are an older TS-specific design with a `(target, key, descriptor)` signature, parameter decorators and `emitDecoratorMetadata`. TS 5.0 added standard ECMAScript decorators with a `(value, context)` signature, no flag needed, but no parameter decorators.',
        },
        {
          q: 'Which do NestJS and Angular use?',
          a: 'They rely on the legacy `experimentalDecorators` system (plus metadata for DI). Keep the flag on in those projects; check the framework docs for any migration.',
        },
        {
          q: 'What does emitDecoratorMetadata do?',
          a: 'With legacy decorators, it emits runtime type info (like constructor parameter types) that DI containers read via `reflect-metadata`. It does not work with standard decorators.',
        },
      ],
      spoken: `"A decorator is a function attached with the at sign to a class or member to add behavior — logging, routing, dependency injection. In TypeScript there are two systems. The legacy one, enabled with experimentalDecorators, is what NestJS, Angular and TypeORM use; it supports parameter decorators and emitDecoratorMetadata for DI. TypeScript 5.0 added standard ECMAScript decorators that work without a flag and have a different signature — the value plus a context object — but they don't support parameter decorators. They aren't interchangeable, so in a Nest project I keep the legacy flag on."`,
      mistakes: [
        'Saying "decorators need `experimentalDecorators`". Since TS 5.0, standard decorators work without it — the flag selects the legacy system.',
        'Copying a legacy `(target, key, descriptor)` decorator into a project using standard decorators (or the reverse) and getting signature errors.',
        'Expecting parameter decorators like `@Inject()` to work with standard decorators.',
        'Follow-up trap: "Can decorators be used on plain functions?" No — only on classes and class members (methods, accessors, fields, and in legacy mode, parameters).',
      ],
      takeaway: 'Decorators wrap classes and members; TS 5 has standard decorators, while NestJS/Angular still use legacy experimentalDecorators — they are not interchangeable.',
    },
  ],
  rapidFire: [
    { q: 'Do TypeScript types exist at runtime?', a: 'No. They are erased during compilation; only plain JavaScript runs.' },
    { q: 'What is type inference?', a: 'TypeScript working out a type from the value or context so you don\'t have to write it.' },
    { q: 'What type does `const x = \'hi\'` get?', a: 'The literal type `\'hi\'`. With `let` it widens to `string`.' },
    { q: 'Is TypeScript structurally or nominally typed?', a: 'Structurally — types are compatible if their shapes match.' },
    { q: 'When does the excess property check run?', a: 'Only on fresh object literals passed or assigned directly to a typed target.' },
    { q: 'type or interface for a union?', a: '`type`. Interfaces cannot describe unions.' },
    { q: 'What does `A | B` mean?', a: 'A union: the value is one of A or B. Narrow before using member-specific fields.' },
    { q: 'What does `A & B` mean?', a: 'An intersection: the value has everything from both A and B.' },
    { q: 'any vs unknown in one line?', a: '`any` turns off checking; `unknown` accepts anything but must be narrowed before use.' },
    { q: 'What is the type of `err` in `catch` with strict on?', a: '`unknown` (via `useUnknownInCatchVariables`).' },
    { q: 'void vs never?', a: '`void` returns nothing but finishes; `never` never finishes (throws or loops forever).' },
    { q: 'What is `never` used for in a switch?', a: 'An exhaustive check: in `default`, the value must be `never`, or compilation fails.' },
    { q: 'Do enums generate JavaScript?', a: 'Yes, regular enums emit a runtime object (`const enum` is inlined).' },
    { q: 'Popular alternative to enums?', a: 'A string literal union, or an `as const` object plus `typeof OBJ[keyof typeof OBJ]`.' },
    { q: 'Name four ways to narrow a type.', a: '`typeof`, `instanceof`, the `in` operator, and equality/discriminant checks (also truthiness and type guards).' },
    { q: 'Why does `typeof x === \'object\'` not remove null?', a: 'Because `typeof null` is `"object"` in JavaScript.' },
    { q: 'What does a custom type guard return?', a: 'A type predicate like `value is User`.' },
    { q: 'Does `as User` check anything at runtime?', a: 'No. A type assertion only changes the compile-time type.' },
    { q: 'What is the `!` postfix operator?', a: 'The non-null assertion: it removes `null | undefined` from the type without checking.' },
    { q: 'What is a discriminated union?', a: 'A union of object types sharing a literal "tag" field, used to narrow to one member.' },
    { q: 'What does `keyof { a: 1; b: 2 }` give?', a: '`\'a\' | \'b\'`.' },
    { q: 'How do you get a union from a constant array?', a: 'Declare it `as const`, then use `(typeof arr)[number]`.' },
    { q: 'Partial vs Required?', a: '`Partial` makes all properties optional; `Required` makes all required.' },
    { q: 'Pick vs Omit?', a: '`Pick` keeps listed keys; `Omit` removes listed keys.' },
    { q: 'Exclude vs Omit?', a: '`Exclude` removes union members; `Omit` removes object keys.' },
    { q: 'What does `Record<K, V>` create?', a: 'An object type with keys `K` and values `V`.' },
    { q: 'How do you get the resolved type of an async function?', a: '`Awaited<ReturnType<typeof fn>>`.' },
    { q: 'What does `NonNullable<T>` do?', a: 'Removes `null` and `undefined` from `T`.' },
    { q: 'readonly vs const?', a: '`const` locks a variable binding; `readonly` locks a property, at compile time only.' },
    { q: 'What does `as const` do?', a: 'Infers literal, readonly types: exact strings/numbers, readonly tuples and readonly object properties.' },
    { q: 'satisfies vs annotation?', a: '`satisfies` checks the type but keeps the narrower inferred type; an annotation replaces it.' },
    { q: 'What is a generic constraint?', a: '`T extends X` — `T` can be any type assignable to `X`.' },
    { q: 'How do you write a generic arrow function in a .tsx file?', a: '`const fn = <T,>(x: T) => x` — the comma stops it being read as JSX.' },
    { q: 'Can callers call an overload\'s implementation signature?', a: 'No, only the overload signatures are visible.' },
    { q: 'TS `private` vs `#private`?', a: 'TS `private` is compile-time only; `#private` is enforced at runtime.' },
    { q: 'Can you instantiate an abstract class?', a: 'No. Only concrete subclasses can be created with `new`.' },
    { q: 'What does `strict: true` mainly enable?', a: 'strictNullChecks, noImplicitAny, strictFunctionTypes and other strict-family checks.' },
    { q: 'Is `noUncheckedIndexedAccess` part of strict?', a: 'No, you enable it separately.' },
    { q: 'target vs lib?', a: '`target` is the output JS version; `lib` is which built-in API types are available.' },
    { q: 'Does `tsc` rewrite `paths` aliases?', a: 'No. Your bundler or runtime must resolve them too.' },
    { q: 'Why use `noEmit`?', a: 'When another tool (Vite, Next.js, esbuild) compiles the code and `tsc` only type-checks.' },
    { q: 'What is `isolatedModules` for?', a: 'It ensures each file can be compiled on its own, as Babel, esbuild and SWC require.' },
    { q: 'What is `import type`?', a: 'An import used only for types; it is fully removed from the output JavaScript.' },
    { q: 'How do you type React children?', a: '`children: React.ReactNode`.' },
    { q: 'How do you type an input change handler?', a: '`(e: React.ChangeEvent<HTMLInputElement>) => void`.' },
    { q: 'How do you type state that starts as null?', a: '`useState<User | null>(null)`.' },
    { q: 'How do you type a DOM ref?', a: '`useRef<HTMLInputElement>(null)` and null-check `ref.current`.' },
    { q: 'Generic order of Express `Request`?', a: '`Request<Params, ResBody, ReqBody, Query>`.' },
    { q: 'How do you add `req.user` in Express?', a: 'Augment `Express.Request` inside `declare global` in a `.d.ts` file.' },
    { q: 'Why validate `process.env`?', a: 'Every env var is `string | undefined`; validating at startup fails fast and gives a typed config.' },
    { q: 'What is a .d.ts file?', a: 'A type-only declaration file describing JS code, globals or modules.' },
    { q: 'What is @types?', a: 'DefinitelyTyped community type packages for JS libraries, e.g. `@types/express`.' },
    { q: 'What does `z.infer` give you?', a: 'A TypeScript type derived from a Zod schema.' },
    { q: 'What is a mapped type?', a: 'A type that loops over keys, e.g. `{ [K in keyof T]: T[K] }`.' },
    { q: 'What does `-?` do in a mapped type?', a: 'Removes the optional modifier, making properties required.' },
    { q: 'What is a distributive conditional type?', a: 'A conditional on a naked type parameter that runs once per union member.' },
    { q: 'How do you stop distribution?', a: 'Wrap both sides in a tuple: `[T] extends [U]`.' },
    { q: 'Where can `infer` be used?', a: 'Only in the `extends` clause of a conditional type.' },
    { q: 'Do TS 5 standard decorators need `experimentalDecorators`?', a: 'No. That flag switches to the legacy decorator system used by NestJS and Angular.' },
    { q: 'Do standard decorators support parameter decorators?', a: 'No, parameter decorators are a legacy-only feature.' },
  ],
};
