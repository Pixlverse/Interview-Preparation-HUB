// Revise MERN: TypeScript. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'typescript',
  icon: '🔷',
  title: 'TypeScript',
  note: 'Core TypeScript concepts, the type system, and using TS with React and Node/Express.',
  items: [
    {
      q: 'Why use TypeScript instead of plain JavaScript?',
      a: `TypeScript adds **static types** on top of JavaScript, so many bugs are caught at compile time instead of in production. It compiles down to plain JavaScript, so it runs anywhere JS runs.

The real wins are safer refactoring, great editor autocomplete, and types acting as living documentation for the team. On SkillKeepr all our Lambda services were written in TypeScript, and renaming a field across many handlers was safe because the compiler showed every place that broke.`,
    },
    {
      q: 'What is the difference between type and interface?',
      a: `Both describe the shape of an object, and for most object shapes they are interchangeable. The differences: an **interface** can be reopened and merged (declaration merging) and is extended with \`extends\`. A **type alias** can describe anything, including unions, tuples, primitives and mapped or conditional types.

My rule of thumb: use \`interface\` for public object contracts like props or API models, and \`type\` when I need unions, intersections or utility-type tricks. The key point is to be consistent within a codebase.`,
    },
    {
      q: 'What is the difference between any, unknown and never?',
      a: `**any** switches off type checking completely, so you can do anything with the value and the compiler stays silent. **unknown** is the safe version: anything can be assigned to it, but you must narrow it with a check before using it.

**never** means a value that can never exist, like the return type of a function that always throws, or the leftover type after every case of a union is handled. I use \`unknown\` for things like parsed JSON or caught errors, and avoid \`any\` except as a temporary escape hatch.`,
    },
    {
      q: 'What are generics and why are they useful?',
      a: `Generics let you write a function, class or type that works with **many types while keeping type safety**. You pass a type parameter, like \`T\`, and TypeScript tracks it through the code.

For example, an \`ApiResponse<T>\` type can wrap any payload, and a \`fetchJson<T>()\` helper returns a properly typed result instead of \`any\`. You can also add constraints like \`T extends { id: string }\` so the generic only accepts types with certain fields. It is how you get reuse without losing types.`,
    },
    {
      q: 'Explain union and intersection types.',
      a: `A **union** (\`A | B\`) means the value is one of several types, for example \`string | number\` or \`'admin' | 'recruiter'\`. You must narrow it before using type-specific members.

An **intersection** (\`A & B\`) means the value has all members of both types at once, which is a common way to combine shapes, like a base user type plus extra fields. Simple way to remember: union is "either", intersection is "both".`,
    },
    {
      q: 'What is type narrowing and what are type guards?',
      a: `**Narrowing** is how TypeScript refines a broad type to a more specific one inside a code block, based on runtime checks. Common guards are \`typeof\`, \`instanceof\`, the \`in\` operator, equality checks, and checking a discriminant field like \`kind\` or \`status\`.

You can also write a **custom type guard**, a function whose return type is \`value is User\`. When it returns true, TypeScript treats the value as that type. This is very handy for validating API data or error objects.`,
    },
    {
      q: 'What are utility types? Explain Partial, Pick, Omit, Record and ReturnType.',
      a: `Utility types are built-in helpers that **transform existing types** so you do not repeat yourself. **Partial<T>** makes all fields optional, great for update payloads. **Pick<T, K>** keeps only some keys, and **Omit<T, K>** removes some, like dropping \`password\` from a user type.

**Record<K, V>** builds an object type with keys K and values V, for example a map of role to permissions. **ReturnType<F>** extracts the return type of a function, useful when you want to type something based on what a function already returns.`,
    },
    {
      q: 'What are discriminated unions?',
      a: `A **discriminated union** is a union of object types that all share a literal field, like \`type\` or \`status\`, with a different value in each. Checking that field lets TypeScript narrow to the exact variant automatically.

It is perfect for things like API states (loading, success, error) or Redux actions. Combined with a \`switch\` and a \`never\` check in the default case, the compiler tells you when you forgot to handle a new variant, which is called **exhaustiveness checking**.`,
    },
    {
      q: 'How do you type props and hooks in a React component?',
      a: `I define the props with an **interface or type** and annotate the function parameter, like \`function Card({ title }: CardProps)\`. Children are typed as \`React.ReactNode\`. Many teams now avoid \`React.FC\` and just type props directly.

For hooks, \`useState\` usually infers the type, but for null initial values I pass a generic like \`useState<User | null>(null)\`. \`useRef<HTMLInputElement>(null)\` types DOM refs, and event handlers use types like \`React.ChangeEvent<HTMLInputElement>\`. We did this across the SkillKeepr React front-ends.`,
    },
    {
      q: 'What does strict mode do in tsconfig?',
      a: `\`"strict": true\` turns on a **family of stricter checks** at once. The most important is \`strictNullChecks\`, which means \`null\` and \`undefined\` are not silently allowed everywhere, so you must handle them. Others include \`noImplicitAny\`, strict function types and checking that class properties are initialized.

It feels annoying at first, but it catches the classic "cannot read property of undefined" bugs at compile time. For any new project I always turn strict mode on from day one, because enabling it later is painful.`,
    },
    {
      q: 'Enums vs union of string literals: which do you prefer?',
      a: `A **union of string literals**, like \`'active' | 'paused'\`, is usually my default. It has zero runtime cost, works naturally with JSON from APIs, and gives the same autocomplete and safety.

A regular **enum** generates a real JavaScript object at runtime and numeric enums can accept unexpected numbers. Enums are fine when you want a named set you can iterate over, but many teams now prefer literal unions or an \`as const\` object instead.`,
    },
    {
      q: 'What does as const do?',
      a: `\`as const\` is a **const assertion**. It tells TypeScript to infer the narrowest possible type: strings become literal types, arrays become readonly tuples, and object properties become readonly.

A common pattern is an object like \`const ROLES = { ADMIN: 'admin', HR: 'hr' } as const\`, then deriving a union with \`typeof ROLES[keyof typeof ROLES]\`. That gives you an enum-like object at runtime and a literal union type, with one source of truth.`,
    },
    {
      q: 'What are keyof and typeof in TypeScript?',
      a: `**keyof** takes an object type and gives a union of its keys. For a \`User\` with \`id\` and \`email\`, \`keyof User\` is \`'id' | 'email'\`. It is great for generic helpers like a typed \`getField(obj, key)\`.

**typeof** in a type position gets the type of an existing value, so you can derive types from real objects or functions instead of writing them twice. Together they are used a lot, for example \`keyof typeof config\` to get the keys of a constant object.`,
    },
    {
      q: 'How do you type the Express request and response in Node?',
      a: `Express types come from \`@types/express\`. \`Request\` is generic, so you can type params, response body, request body and query, like \`Request<{ id: string }, {}, CreateUserBody>\`. \`Response<T>\` types what you send back.

To add custom fields, like \`req.user\` after auth middleware, you use **declaration merging**: augment the \`Express.Request\` interface in a \`.d.ts\` file. Remember that types do not validate anything at runtime, so the body still needs real validation, for example with Zod.`,
    },
    {
      q: 'Why do you need Zod if you already have TypeScript?',
      a: `TypeScript types are **erased at compile time**, so they cannot check data that arrives at runtime from a request, a webhook or a third-party API. **Zod** validates the actual data against a schema and throws or returns clear errors if it does not match.

The nice part is \`z.infer<typeof schema>\`, which derives the TypeScript type from the schema, so validation and types never drift apart. I treat every external input as \`unknown\` until a schema like this has parsed it.`,
    },
    {
      q: 'What is a declaration file (.d.ts)?',
      a: `A **.d.ts file** contains only type information, no runtime code. It describes the shape of JavaScript code so TypeScript can type-check against it.

Libraries ship them so you get types, and for libraries that do not, the community publishes them as \`@types/package-name\` on DefinitelyTyped. You also write your own to declare global variables, augment existing modules like Express, or declare types for non-code imports such as \`*.svg\` files.`,
    },
    {
      q: 'What are optional chaining and nullish coalescing?',
      a: `**Optional chaining** (\`?.\`) safely reads a nested property or calls a method; if anything along the way is \`null\` or \`undefined\`, it returns \`undefined\` instead of throwing. Example: \`user?.address?.city\`.

**Nullish coalescing** (\`??\`) gives a default only when the left side is \`null\` or \`undefined\`, unlike \`||\` which also replaces \`0\`, \`''\` and \`false\`. These are JavaScript features that TypeScript understands, and they pair nicely with strict null checks.`,
    },
    {
      q: 'What is type inference?',
      a: `**Type inference** means TypeScript works out the type for you from the value or context, so you do not have to annotate everything. \`const count = 5\` is inferred as a number, and return types are inferred from the function body.

Good practice is to let inference do the easy work and add explicit types at **boundaries**: function parameters, exported functions, API responses and component props. That keeps code clean while still giving clear contracts where it matters.`,
    },
    {
      q: 'What is the difference between type assertion and type casting?',
      a: `A **type assertion** (\`value as User\`) only tells the compiler "trust me, this is a User". It does **not** convert or check anything at runtime, unlike casting in languages like Java.

So assertions are risky: if you are wrong, you get runtime bugs with no warning. I prefer narrowing with type guards or validating with a schema. The non-null assertion \`!\` is similar, it just removes \`null\` from the type, so I use it rarely.`,
    },
    {
      q: 'What are mapped and conditional types?',
      a: `A **mapped type** creates a new type by looping over the keys of another, like \`{ [K in keyof T]?: T[K] }\`, which is exactly how \`Partial\` is built. You can add or remove \`readonly\` and optional modifiers.

A **conditional type** chooses a type based on a condition, like \`T extends string ? 'text' : 'other'\`, and with \`infer\` it can pull types out of others, which is how \`ReturnType\` works. Day to day I mostly use them through utility types rather than writing them from scratch.`,
    },
    {
      q: 'How does TypeScript handle function overloading?',
      a: `TypeScript lets you write several **overload signatures** for one function, followed by a single implementation that handles all cases. Callers see only the overload signatures, so they get precise return types based on the arguments they pass.

In practice, a union parameter or a generic is often simpler and easier to maintain. I reach for overloads only when the return type really depends on the input type in a way generics cannot express cleanly.`,
    },
    {
      q: 'What is structural typing in TypeScript?',
      a: `TypeScript uses **structural typing**, also called duck typing: two types are compatible if their shapes match, regardless of their names. If an object has all the fields a \`User\` needs, it can be used as a \`User\`.

This is different from nominal typing in Java or C#. A side effect is that two IDs, like \`UserId\` and \`CompanyId\`, are interchangeable if both are just strings, so some teams use **branded types** to keep them apart.`,
    },
    {
      q: 'How do you migrate a JavaScript project to TypeScript?',
      a: `Do it **gradually**. Add a \`tsconfig.json\` with \`allowJs\`, so JS and TS files live together, then convert files one by one, starting with shared utilities and data models that everything else depends on.

Start with looser settings if needed and tighten toward \`strict\` over time, installing \`@types\` packages as you go. Avoid the trap of sprinkling \`any\` everywhere; mark temporary ones with a comment so you can find and remove them later.`,
    },
    {
      q: 'What are access modifiers, readonly and abstract classes in TypeScript?',
      a: `**Access modifiers** \`public\`, \`private\` and \`protected\` control who can use class members, but they are compile-time only; for real runtime privacy JavaScript has \`#private\` fields. **readonly** stops a property from being reassigned after it is set.

An **abstract class** cannot be instantiated directly and can declare abstract methods that subclasses must implement. In MERN codebases I see these less than in Java-style code, since most React and Node code is function-based.`,
    },
    {
      q: 'What is the satisfies operator?',
      a: `\`satisfies\`, added in TypeScript 4.9, checks that a value **matches a type without changing its inferred type**. With a normal annotation, you lose the specific literal types; with \`satisfies\`, you keep them while still getting the error if the shape is wrong.

A good example is a config or route map: \`const routes = { ... } satisfies Record<string, Route>\`. You get validation that every entry is a valid route, and autocomplete on the exact keys you wrote.`,
    },
  ],
};
