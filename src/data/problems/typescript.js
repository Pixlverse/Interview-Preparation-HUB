// Interview problems for the TypeScript stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'typescript',
  problems: [
    {
      id: 'fix-possibly-undefined',
      title: 'Fix "Object is possibly undefined" the right way',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'type-narrowing',
      question: `This code does not compile. TypeScript shows two errors.

\`\`\`typescript
type User = { id: number; name: string; email?: string };

const users: User[] = [
  { id: 1, name: 'Asha', email: 'asha@shop.com' },
  { id: 2, name: 'Ravi' },
];

function getEmailDomain(id: number): string {
  const user = users.find((u) => u.id === id);
  return user.email.split('@')[1];
  //     ~~~~ 'user' is possibly 'undefined'.
  //          ~~~~~~~~~~ 'user.email' is possibly 'undefined'.
}
\`\`\`

A teammate "fixed" it like this: \`return user!.email!.split('@')[1];\`

1. Why is that a bad fix?
2. Fix it properly.`,
      hints: [
        '`find()` returns `User | undefined`. What happens at runtime when you call `getEmailDomain(99)` or `getEmailDomain(2)`?',
        'The `!` (non-null assertion) only silences the compiler. It adds no check at runtime.',
        'Check the value first (`if (!user) ...`). After the check, TypeScript "narrows" the type to `User`. Then decide: return `undefined`, or throw?',
      ],
      solution: `**Idea:** the error is TypeScript telling the truth. \`find()\` can return nothing, and \`email\` is optional. Handle those cases with a real check, so the type gets **narrowed** (made more specific) after the check.

**Why \`!\` is bad:** \`user!\` means "trust me, this is never undefined". It removes the error but not the bug. \`getEmailDomain(99)\` still crashes with \`Cannot read properties of undefined\`. You moved the error from compile time to production.

\`\`\`typescript
type User = { id: number; name: string; email?: string };

const users: User[] = [
  { id: 1, name: 'Asha', email: 'asha@shop.com' },
  { id: 2, name: 'Ravi' },
];

// Fix 1: be honest in the return type and narrow with early returns
function getEmailDomain(id: number): string | undefined {
  const user = users.find((u) => u.id === id); // User | undefined
  if (!user) return undefined;                 // below this line: user is User
  if (!user.email) return undefined;           // below this line: user.email is string
  return user.email.split('@')[1];
}

// Fix 2: the same thing in one line with optional chaining (?.)
const getEmailDomainShort = (id: number): string | undefined =>
  users.find((u) => u.id === id)?.email?.split('@')[1];

// Fix 3: if a missing user is truly a bug, throw a clear error
function getEmailDomainOrThrow(id: number): string {
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error(\`User \${id} not found\`);
  if (!user.email) throw new Error(\`User \${id} has no email\`);
  return user.email.split('@')[1] ?? '';
}

console.log(getEmailDomain(1));      // 'shop.com'
console.log(getEmailDomainShort(2)); // undefined (no crash)
console.log(getEmailDomainOrThrow(1));
\`\`\`

**Why it works:** \`if (!user) return\` is a check TypeScript understands. After it, the type is \`User\`, not \`User | undefined\`. The caller now sees \`string | undefined\` and must handle the "no domain" case too.

**Edge case:** \`split('@')[1]\` is typed as \`string\`, but it can be \`undefined\` at runtime (no \`@\` in the string). With the \`noUncheckedIndexedAccess\` flag on, TypeScript would warn you about that too.`,
      followUps: [
        {
          q: 'When is `!` acceptable?',
          a: 'Rarely — only when you know something the compiler cannot see, for example a value set in a lifecycle hook just before use. Even then, a check with a clear error message is usually better.',
        },
        {
          q: 'What does `noUncheckedIndexedAccess` do?',
          a: 'It makes `arr[i]` and `obj[key]` (for index signatures) return `T | undefined`. It catches "index out of range" bugs, but adds more checks to your code.',
        },
      ],
    },
    {
      id: 'as-const-derive-union',
      title: 'Keep a list and its union type in sync with as const',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'as-const',
      question: `You have a list of roles used in a dropdown. You also need a \`Role\` type. Today they are written twice and they drift apart.

\`\`\`typescript
const ROLES = ['admin', 'editor', 'viewer'];
type Role = 'admin' | 'editor' | 'viewer'; // written by hand, easy to forget
\`\`\`

1. Derive \`Role\` from \`ROLES\` so you write the values only once.
2. Write \`isRole(value: string): value is Role\` to check input from a query string.
3. Do the same for an object: \`const STATUS = { ACTIVE: 'active', BANNED: 'banned' }\` → \`type Status = 'active' | 'banned'\`.`,
      hints: [
        'Hover over `ROLES`. Its type is `string[]` — the exact values are lost. How do you tell TypeScript to keep them?',
        '`as const` makes the array a readonly tuple of literal types. Then `(typeof ROLES)[number]` gives "the type of any element".',
        'For the object: `(typeof STATUS)[keyof typeof STATUS]` gives the union of all values.',
      ],
      solution: `**Idea:** \`as const\` tells TypeScript "these values will never change", so it keeps the exact literal types (\`'admin'\` instead of \`string\`). Then you **read** the type out of the value.

\`\`\`typescript
// 1. Array -> union
const ROLES = ['admin', 'editor', 'viewer'] as const;
// typeof ROLES is: readonly ['admin', 'editor', 'viewer']

type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'

// 2. Type guard for untrusted input (like req.query.role)
function isRole(value: string): value is Role {
  // ROLES is a tuple of literals, so .includes() would only accept a Role.
  // Widen it to readonly string[] just for this check.
  return (ROLES as readonly string[]).includes(value);
}

const fromQuery: string = 'editor';
if (isRole(fromQuery)) {
  const role: Role = fromQuery; // OK, narrowed to Role
  console.log('valid role', role);
}

// 3. Object -> union of values
const STATUS = { ACTIVE: 'active', BANNED: 'banned' } as const;
type StatusKey = keyof typeof STATUS;            // 'ACTIVE' | 'BANNED'
type Status = (typeof STATUS)[keyof typeof STATUS]; // 'active' | 'banned'

function setStatus(s: Status) {
  console.log(s);
}
setStatus(STATUS.BANNED); // OK
setStatus('active');      // OK - plain strings work too
// @ts-expect-error - 'deleted' is not a Status
setStatus('deleted');

// Bonus: add a new role in ONE place and the type updates automatically.
console.log(ROLES.length);
\`\`\`

**Why it works:** without \`as const\`, TypeScript "widens" \`'admin'\` to \`string\` because arrays can be changed later. \`as const\` makes everything \`readonly\` and literal. \`T[number]\` is an **indexed access type**: "the type you get when you index the array with any number".

**Edge case:** the cast inside \`isRole\` is safe because we only *read*. It is the standard pattern, since \`includes\` on a literal tuple only accepts that tuple's types.`,
      followUps: [
        {
          q: 'Why not just use an enum?',
          a: 'An `as const` object is plain JavaScript, has no special enum rules, and accepts plain string literals like `\'active\'`. A string enum forces callers to import and use `Status.Active`. Many teams prefer `as const` for this reason.',
        },
        {
          q: 'Can I also get a runtime list from a type?',
          a: 'No. Types are erased when compiled. That is why you start from the value (runtime) and derive the type, never the other way round.',
        },
      ],
    },
    {
      id: 'type-safe-get-keyof',
      title: 'Type-safe get(obj, key) and pluck(items, key)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'keyof-typeof',
      question: `Type these two helpers so that:

- a wrong key is a compile error,
- the return type is the exact type of that property (not \`any\`).

\`\`\`javascript
function get(obj, key) {
  return obj[key];
}

function pluck(items, key) {
  return items.map((item) => item[key]);
}

const product = { id: 7, title: 'Mouse', price: 499, tags: ['usb'] };
get(product, 'price');      // should be number
get(product, 'colour');     // should be an error
pluck([product], 'title');  // should be string[]
\`\`\``,
      hints: [
        'You need two generic type parameters: one for the object, one for the key.',
        '`keyof T` is the union of the keys of `T`. Constrain the key with `K extends keyof T`.',
        'The type of the value is `T[K]` (an indexed access type).',
      ],
      solution: `**Idea:** let TypeScript infer the object type \`T\`, then only allow keys that exist on it with \`K extends keyof T\`. The value type is \`T[K]\`.

\`\`\`typescript
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const product = { id: 7, title: 'Mouse', price: 499, tags: ['usb'] };

const price = get(product, 'price');      // number
const tags = get(product, 'tags');        // string[]
const titles = pluck([product], 'title'); // string[]

// @ts-expect-error - 'colour' is not a key of product
get(product, 'colour');

console.log(price, tags, titles);
\`\`\`

**Why it works:** when you call \`get(product, 'price')\`, TypeScript infers \`T\` = the product type and \`K\` = the literal \`'price'\` (not just \`string\`, because of the \`extends keyof T\` constraint). Then \`T[K]\` = \`number\`. The editor even autocompletes the key.

**Edge case:** if you pass a key that is a \`string\` variable (not a literal), it will not compile, because a random string may not be a key. That is the point.`,
      followUps: [
        {
          q: 'What does `get(product, Math.random() > 0.5 ? \'id\' : \'title\')` return?',
          a: '`K` becomes `\'id\' | \'title\'`, so `T[K]` is `number | string`. Indexed access with a union gives a union of the property types.',
        },
        {
          q: 'How would you type a nested path like `get(obj, \'user.address.city\')`?',
          a: 'With recursive template literal types that build all valid dotted paths. It is possible but heavy on the compiler; libraries like react-hook-form do this with a `Path<T>` type.',
        },
      ],
    },
    {
      id: 'generic-fetch-json',
      title: 'Type a generic fetchJson<T> helper',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'generics',
      question: `Convert this helper to TypeScript. The caller should be able to say what shape of data they expect and get proper types back.

\`\`\`javascript
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.json();
}

const todo = await fetchJson('https://jsonplaceholder.typicode.com/todos/1');
todo.titel; // typo - no error today because res.json() returns any
\`\`\`

Also: throw an error object that keeps the HTTP \`status\`, so callers can check for 404.`,
      hints: [
        'Add a type parameter: `fetchJson<T>(...)`. What should the function return?',
        '`res.json()` returns `Promise<any>`. You need to turn that `any` into `T`.',
        'Make a small `HttpError` class that extends `Error` and has a `status` field. Check it with `instanceof`.',
      ],
      solution: `**Idea:** a type parameter \`T\` lets the **caller** choose the result type. The function returns \`Promise<T>\`.

\`\`\`typescript
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new HttpError(res.status, \`Request failed: \${res.status} \${res.statusText}\`);
  }
  // res.json() is Promise<any>. We *promise* it is T - TypeScript does not check this.
  return (await res.json()) as T;
}

type Todo = { id: number; title: string; completed: boolean };

async function main() {
  try {
    const todo = await fetchJson<Todo>('https://jsonplaceholder.typicode.com/todos/1');
    console.log(todo.title.toUpperCase()); // typed: string
    // @ts-expect-error - typo is now caught
    console.log(todo.titel);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      console.log('Not found');
    } else {
      throw err;
    }
  }
}

main();
\`\`\`

**Why it works:** \`fetchJson<Todo>(...)\` sets \`T = Todo\`, so the result is \`Promise<Todo>\` and every property access is checked. \`HttpError\` is a normal class, so \`instanceof\` narrows \`err\` (which is \`unknown\` in a catch block) to \`HttpError\`.

**Important limit:** \`<T>\` is a **promise, not a check**. If the API sends \`{ name: ... }\` instead of \`{ title: ... }\`, TypeScript will not know. For data from outside (APIs, forms, env), validate at runtime — see the follow-up.`,
      followUps: [
        {
          q: 'How do you make it actually safe at runtime?',
          a: 'Pass a validator: `fetchJson<T>(url: string, parse: (data: unknown) => T)` and return `parse(await res.json())`. With Zod: `fetchJson(url, TodoSchema.parse)` — then `T` is inferred from the schema and the data is really checked.',
        },
        {
          q: 'Why `init?: RequestInit` and not `any`?',
          a: '`RequestInit` is the built-in type for fetch options (method, headers, body). You get autocomplete and typo checks for free.',
        },
        {
          q: 'What is the type of `err` in `catch (err)`?',
          a: '`unknown` with `strict` on (the `useUnknownInCatchVariables` flag). You must narrow it (`instanceof`) before using it.',
        },
      ],
    },
    {
      id: 'any-hides-bug',
      title: 'Find the bug that any is hiding',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'unknown-vs-any',
      question: `The order total shows \`NaN\` in production. The code compiles with no errors. Find the bug, and change the types so the compiler would have caught it.

\`\`\`typescript
// Data from the orders API
const raw = '{"id":"o1","items":[{"sku":"A1","price":250,"quantity":2},{"sku":"B7","price":100,"quantity":1}]}';

function getTotal(order: any) {
  return order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.qty,
    0,
  );
}

const order = JSON.parse(raw);
console.log(getTotal(order)); // NaN
\`\`\``,
      hints: [
        'Compare the property names in the JSON with the names used in `reduce`.',
        '`any` turns off all checking. `item.qty` is allowed even though it does not exist.',
        'Create an `Order` type. Treat `JSON.parse` output as `unknown`, not `any`.',
      ],
      solution: `**The bug:** the API sends \`quantity\`, the code reads \`item.qty\`. \`item.qty\` is \`undefined\`, and \`250 * undefined\` is \`NaN\`. Because \`order\` and \`item\` are \`any\`, TypeScript checks nothing.

**Fix:** describe the data with a type. Then the typo is a compile error.

\`\`\`typescript
type OrderItem = { sku: string; price: number; quantity: number };
type Order = { id: string; items: OrderItem[] };

function getTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getTotalWithTypo(order: Order): number {
  // @ts-expect-error - Property 'qty' does not exist on type 'OrderItem'
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// Treat parsed JSON as unknown, check it, THEN use it as Order.
function isOrder(value: unknown): value is Order {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as { id?: unknown; items?: unknown };
  return (
    typeof v.id === 'string' &&
    Array.isArray(v.items) &&
    v.items.every(
      (i: unknown) =>
        typeof i === 'object' && i !== null &&
        typeof (i as OrderItem).price === 'number' &&
        typeof (i as OrderItem).quantity === 'number',
    )
  );
}

const raw = '{"id":"o1","items":[{"sku":"A1","price":250,"quantity":2},{"sku":"B7","price":100,"quantity":1}]}';
const data: unknown = JSON.parse(raw);
if (isOrder(data)) {
  console.log(getTotal(data)); // 600
}
console.log(typeof getTotalWithTypo);
\`\`\`

**Why it works:** with real types, every property access is checked. Notice we also removed the annotations inside \`reduce\` — TypeScript infers \`sum: number\` and \`item: OrderItem\` from \`Order\`. \`unknown\` forces you to check before use; \`any\` lets you skip the check and silently spreads to everything it touches.`,
      followUps: [
        {
          q: 'How do you stop `any` from coming back into the codebase?',
          a: 'Turn on `strict` (includes `noImplicitAny`), and use the ESLint rules `@typescript-eslint/no-explicit-any` and `no-unsafe-*`. They flag both written `any` and `any` leaking from libraries like `JSON.parse`.',
        },
        {
          q: 'any vs unknown in one line?',
          a: '`any` = "turn off type checking". `unknown` = "I do not know yet — check before you use it".',
        },
      ],
    },
    {
      id: 'satisfies-vs-annotation',
      title: 'satisfies vs a type annotation: which lines error?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'satisfies',
      question: `For each of the four marked lines, say: does it compile? If yes, what is the type?

\`\`\`typescript
type Theme = Record<string, string | number>;

const a: Theme = { primary: '#0099ff', spacing: 8 };
const b = { primary: '#0099ff', spacing: 8 } satisfies Theme;

a.primary.toUpperCase(); // (1)
b.primary.toUpperCase(); // (2)
a.secondary;             // (3)
b.secondary;             // (4)
\`\`\``,
      hints: [
        'An annotation (`: Theme`) replaces the inferred type with `Theme`. What is the type of any property of `Record<string, string | number>`?',
        '`satisfies` checks the value against `Theme` but keeps the precise inferred type.',
      ],
      solution: `**Answers:**

- **(1) Error.** \`a\` has type \`Theme\`, so \`a.primary\` is \`string | number\`. \`toUpperCase\` does not exist on \`number\`.
- **(2) OK.** \`b\` keeps its inferred type \`{ primary: string; spacing: number }\`, so \`b.primary\` is \`string\`.
- **(3) OK, type \`string | number\`.** \`Record<string, ...>\` says "any string key exists". TypeScript cannot know \`secondary\` is missing. (At runtime it is \`undefined\`.)
- **(4) Error.** \`b\` only has \`primary\` and \`spacing\`. Property \`secondary\` does not exist.

\`\`\`typescript
type Theme = Record<string, string | number>;

const a: Theme = { primary: '#0099ff', spacing: 8 };
const b = { primary: '#0099ff', spacing: 8 } satisfies Theme;

// @ts-expect-error (1) Property 'toUpperCase' does not exist on type 'string | number'
a.primary.toUpperCase();
b.primary.toUpperCase();          // (2) fine: string
const s: string | number = a.secondary; // (3) compiles, but undefined at runtime
// @ts-expect-error (4) Property 'secondary' does not exist
b.secondary;

// satisfies still CHECKS the value:
const c = {
  primary: '#0099ff',
  // @ts-expect-error - boolean is not string | number
  rounded: true,
} satisfies Theme;

console.log(s, c);
\`\`\`

**Why it works:** an annotation says "this variable **is** a \`Theme\`" — you lose the details. \`satisfies\` says "check that this value **fits** \`Theme\`, but remember what it really is". Rule of thumb: use \`satisfies\` for config objects and lookup maps where you want both checking and precise types.`,
      followUps: [
        {
          q: 'Can `satisfies` catch a typo in a key?',
          a: 'Yes, if the target type has fixed keys. `{ primray: \'red\' } satisfies Record<\'primary\' | \'secondary\', string>` errors on the typo and on the missing key.',
        },
        {
          q: 'When is an annotation still better?',
          a: 'When you want the variable to be exactly that wider type, for example a `let` that will be reassigned later, or a public API value you do not want callers to depend on details of.',
        },
      ],
    },
    {
      id: 'type-react-button-props',
      title: 'Type a reusable React Button and an input handler',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'ts-with-react',
      question: `Convert this component to TypeScript. Requirements:

- \`variant\` can only be \`'primary'\` or \`'secondary'\` (default \`'primary'\`).
- \`loading\` disables the button.
- All normal \`<button>\` props (\`onClick\`, \`type\`, \`aria-label\`, ...) must still work without listing them by hand.
- Also type the \`onChange\` handler of the search box.

\`\`\`jsx
export function Button({ variant = 'primary', loading = false, children, ...rest }) {
  return (
    <button {...rest} disabled={rest.disabled || loading} className={'btn btn-' + variant}>
      {loading ? 'Loading...' : children}
    </button>
  );
}

export function Search({ onSearch }) {
  const handleChange = (e) => onSearch(e.target.value);
  return <input onChange={handleChange} />;
}
\`\`\``,
      hints: [
        'React has a helper type that gives you all props of a native element: `ComponentPropsWithoutRef<\'button\'>`.',
        'Combine it with your own props using `&` (intersection).',
        'For the input event: `React.ChangeEvent<HTMLInputElement>`.',
      ],
      solution: `**Idea:** reuse React's built-in prop types for the native element, and add only your custom props on top.

\`\`\`tsx
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...rest // everything else: onClick, type, aria-*, etc.
}: ButtonProps) {
  return (
    <button {...rest} disabled={disabled || loading} className={\`btn btn-\${variant}\`}>
      {loading ? 'Loading...' : children}
    </button>
  );
}

type SearchProps = { onSearch: (query: string) => void };

export function Search({ onSearch }: SearchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value); // e.target is HTMLInputElement, so .value is string
  };
  return <input onChange={handleChange} />;
}

// Usage
export function Toolbar() {
  return (
    <>
      <Button onClick={() => console.log('saved')} type="submit">Save</Button>
      <Button variant="secondary" loading aria-label="Refresh">Refresh</Button>
      {/* @ts-expect-error - 'danger' is not a valid variant */}
      <Button variant="danger">Delete</Button>
      <Search onSearch={(q) => console.log(q)} />
    </>
  );
}
\`\`\`

**Why it works:** \`ComponentPropsWithoutRef<'button'>\` already includes \`children\`, \`disabled\`, \`onClick\` (typed as a mouse event on a button) and every HTML attribute. The \`&\` adds our custom props. \`children\` is \`ReactNode\`, which accepts text, elements, arrays and \`null\`.

**Tip:** if you write the handler inline (\`onChange={(e) => ...}\`), you do not need any annotation — TypeScript infers the event type from the \`onChange\` prop. You only annotate when the handler is a separate function.`,
      followUps: [
        {
          q: 'How do you type `children` when you write props from scratch?',
          a: '`children: React.ReactNode` (or `children?:` if optional). `ReactNode` covers strings, numbers, elements, arrays, `null` and `undefined`. Use `ReactElement` only if you need exactly one element.',
        },
        {
          q: 'Should I use `React.FC`?',
          a: 'It is optional. Typing the props parameter directly (as above) is the common style today. `React.FC` no longer adds `children` automatically since React 18 types.',
        },
        {
          q: 'How do you forward a ref to the inner button?',
          a: 'In React 19, `ref` is a normal prop: use `ComponentPropsWithRef<\'button\'>` and pass `ref` through. In React 18, wrap the component in `forwardRef<HTMLButtonElement, ButtonProps>`.',
        },
      ],
    },
    {
      id: 'api-state-discriminated-union',
      title: 'Model API loading state with a discriminated union',
      difficulty: 'medium',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'discriminated-unions',
      question: `A teammate wrote this type for data-fetching state:

\`\`\`typescript
type UsersState = {
  loading: boolean;
  error?: string;
  data?: { id: string; name: string }[];
};
\`\`\`

1. What is wrong with it? Give an example of an "impossible" state it allows.
2. Redesign it as a generic \`AsyncState<T>\` with four states: idle, loading, success, error.
3. Write a \`render(state)\` function with a \`switch\` that the compiler forces you to update if someone adds a new state later.`,
      hints: [
        'Can `loading: true`, `error: \'x\'` and `data: [...]` all exist at the same time with this type? Should they?',
        'Use a union of object types that share one literal field, like `status: \'loading\'`. That field is the "discriminant".',
        'In the `default` branch, assign the value to a variable of type `never`. If a case is missing, that assignment fails to compile.',
      ],
      solution: `**1. The problem:** three independent fields give 2 × 2 × 2 = 8 combinations, but only 4 make sense. Nothing stops \`{ loading: true, error: 'Timeout', data: [...] }\`. Every component must also guess: "if \`data\` exists, is it fresh, or left over from before the error?"

**2 + 3. The fix:** one field (\`status\`) says which state we are in, and each state carries only the data that belongs to it.

\`\`\`typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

type User = { id: string; name: string };

// Helper: the compiler errors here if a case is ever forgotten
function assertNever(value: never): never {
  throw new Error(\`Unhandled state: \${JSON.stringify(value)}\`);
}

function render(state: AsyncState<User[]>): string {
  switch (state.status) {
    case 'idle':
      return 'Click "Load" to fetch users';
    case 'loading':
      return 'Loading...';
    case 'success':
      // Narrowed: state.data exists here (and only here)
      return state.data.map((u) => u.name).join(', ');
    case 'error':
      return \`Error: \${state.error}\`;
    default:
      return assertNever(state); // state is "never" if all cases are handled
  }
}

// Impossible states are now impossible:
// @ts-expect-error - 'data' does not exist on the loading state
const bad: AsyncState<User[]> = { status: 'loading', data: [] };

console.log(render({ status: 'success', data: [{ id: '1', name: 'Asha' }] }), bad);
\`\`\`

**Why it works:** checking \`state.status\` narrows the union to one member, so \`state.data\` is only reachable in the \`'success'\` branch. After all four cases, nothing is left, so \`state\` has type \`never\`. If someone adds \`{ status: 'refreshing'; data: T }\`, then \`state\` in \`default\` is the refreshing object, which is **not** assignable to \`never\` → compile error pointing at the exact switch to update.`,
      followUps: [
        {
          q: 'How would you use this with `useState` in React?',
          a: '`const [state, setState] = useState<AsyncState<User[]>>({ status: \'idle\' });` then `setState({ status: \'loading\' })`, and later `setState({ status: \'success\', data })`. JSX can `switch` on `state.status` the same way.',
        },
        {
          q: 'What if I want to keep old data while re-fetching?',
          a: 'Add an explicit state for it: `{ status: \'refreshing\'; data: T }`. The point is that each allowed combination is named on purpose. TanStack Query models this with `status` plus `isFetching`.',
        },
      ],
    },
    {
      id: 'narrow-unknown-json',
      title: 'Safely parse unknown JSON into a User',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'type-guards',
      question: `Write \`parseUser(json: string)\` without using \`any\` or \`as User\`.

- Invalid JSON must not crash the app.
- Valid JSON with the wrong shape must be rejected.
- The caller gets either the typed user or an error message.

\`\`\`typescript
type User = { id: number; name: string; email: string; roles: string[] };

parseUser('{"id":1,"name":"Asha","email":"a@x.com","roles":["admin"]}'); // ok
parseUser('{"id":"1","name":"Asha"}');  // rejected: id is a string, fields missing
parseUser('not json');                   // rejected: invalid JSON
\`\`\``,
      hints: [
        'Store the result of `JSON.parse` in a variable typed `unknown`. Wrap it in try/catch.',
        'Write a type guard `isUser(value: unknown): value is User` that checks every field with `typeof` / `Array.isArray`.',
        'Return a discriminated union: `{ ok: true; value: User } | { ok: false; error: string }`.',
      ],
      solution: `**Idea:** treat outside data as \`unknown\`. Check it step by step with a **type guard** — a function whose return type \`value is User\` tells TypeScript "if I return true, the value is a User".

\`\`\`typescript
type User = { id: number; name: string; email: string; roles: string[] };

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// Small reusable guard: "is this a plain object?"
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    Array.isArray(value.roles) &&
    value.roles.every((r) => typeof r === 'string')
  );
}

function parseUser(json: string): Result<User> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
  if (!isUser(data)) {
    return { ok: false, error: 'JSON does not match the User shape' };
  }
  return { ok: true, value: data }; // data is User here - no cast needed
}

const result = parseUser('{"id":1,"name":"Asha","email":"a@x.com","roles":["admin"]}');
if (result.ok) {
  console.log(result.value.roles.join(', ')); // fully typed
} else {
  console.log(result.error);
}
console.log(parseUser('{"id":"1","name":"Asha"}'));
console.log(parseUser('not json'));
\`\`\`

**Why it works:** \`isRecord\` narrows \`unknown\` to \`Record<string, unknown>\`, so we can read \`value.id\` (its type is \`unknown\`) and check it with \`typeof\`. Each \`&&\` narrows further. The \`Result\` union forces the caller to check \`ok\` before touching \`value\`.

**Edge cases:** \`null\` (because \`typeof null === 'object'\`) and arrays are rejected by \`isRecord\`. Extra fields are allowed — decide if that is fine for your API.

**Warning:** a type guard is only as good as its body. If \`isUser\` forgets to check \`email\`, TypeScript still trusts it. That is why teams use a schema library for this.`,
      followUps: [
        {
          q: 'How does Zod do the same thing?',
          a: 'Define `const UserSchema = z.object({ id: z.number(), name: z.string(), email: z.string().email(), roles: z.array(z.string()) })`, get the type with `type User = z.infer<typeof UserSchema>`, and call `UserSchema.safeParse(data)`. One source of truth for both the type and the runtime check.',
        },
        {
          q: 'What is an assertion function?',
          a: '`function assertUser(v: unknown): asserts v is User { if (!isUser(v)) throw new Error(\'Bad user\'); }`. After calling it, `v` is a `User` for the rest of the scope — no `if` needed. Good when invalid data should stop the flow.',
        },
      ],
    },
    {
      id: 'implement-utility-types',
      title: 'Write your own Partial, Pick, Omit, Readonly and Record',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'mapped-types',
      question: `Without using the built-in utility types, implement:

- \`MyPartial<T>\` — all properties optional
- \`MyRequired<T>\` — all properties required
- \`MyReadonly<T>\` — all properties readonly
- \`MyPick<T, K>\` — only keys \`K\`
- \`MyRecord<K, V>\` — object with keys \`K\` and values \`V\`
- \`MyExclude<T, U>\` — remove \`U\` from a union
- \`MyOmit<T, K>\` — all keys except \`K\`

\`\`\`typescript
type User = { id: number; name: string; email?: string };

type A = MyPick<User, 'id' | 'name'>; // { id: number; name: string }
type B = MyOmit<User, 'email'>;       // { id: number; name: string }
\`\`\``,
      hints: [
        'A mapped type loops over keys: `{ [K in keyof T]: T[K] }`. Add `?` or `readonly` in front, or `-?` to remove optional.',
        'For Pick, loop over `K` instead of `keyof T`, and constrain `K extends keyof T`.',
        'Exclude is a conditional type: `T extends U ? never : T`. It runs once for each member of the union. Omit = Pick + Exclude.',
      ],
      solution: `**Idea:** most utility types are **mapped types** (loop over keys and change each property) or **conditional types** (an if/else at the type level).

\`\`\`typescript
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };       // -? removes "optional"
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyRecord<K extends PropertyKey, V> = { [P in K]: V }; // PropertyKey = string | number | symbol
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends PropertyKey> = MyPick<T, MyExclude<keyof T, K>>;

// ---- Tests: these lines only compile if the types are exactly equal ----
type Equal<X, Y> =
  (<G>() => G extends X ? 1 : 2) extends (<G>() => G extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type User = { id: number; name: string; email?: string };

type T1 = Expect<Equal<MyPartial<User>, Partial<User>>>;
type T2 = Expect<Equal<MyRequired<User>, Required<User>>>;
type T3 = Expect<Equal<MyReadonly<User>, Readonly<User>>>;
type T4 = Expect<Equal<MyPick<User, 'id' | 'name'>, { id: number; name: string }>>;
type T5 = Expect<Equal<MyRecord<'a' | 'b', number>, { a: number; b: number }>>;
type T6 = Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>;
type T7 = Expect<Equal<MyOmit<User, 'email'>, { id: number; name: string }>>;

// Real use: an update function that accepts any subset of fields except id
function updateUser(id: number, patch: MyPartial<MyOmit<User, 'id'>>) {
  console.log(id, patch);
}
updateUser(1, { name: 'Asha' });
// @ts-expect-error - id cannot be changed
updateUser(1, { id: 2 });

export type { T1, T2, T3, T4, T5, T6, T7 };
\`\`\`

**Why it works:**

- \`[K in keyof T]\` loops over every key. \`T[K]\` is the original value type. Because it maps over \`keyof T\` ("homomorphic"), it also **keeps** existing \`?\` and \`readonly\` modifiers.
- \`MyExclude<'a' | 'b' | 'c', 'a'>\` is a **distributive** conditional type: it runs for \`'a'\` (→ \`never\`), \`'b'\` (→ \`'b'\`), \`'c'\` (→ \`'c'\`), and \`never\` disappears from a union.
- \`MyOmit\` uses \`K extends PropertyKey\` (not \`keyof T\`) — the built-in \`Omit\` does the same, so you can omit keys that may not exist.`,
      followUps: [
        {
          q: 'Why is `Omit` sometimes surprising with union types?',
          a: '`keyof (A | B)` is only the keys **shared** by A and B, so `Omit<A | B, \'x\'>` loses the other keys and the union. Use a distributive version: `type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never`.',
        },
        {
          q: 'How would you write `Mutable<T>` (remove readonly)?',
          a: '`type Mutable<T> = { -readonly [K in keyof T]: T[K] }`. The `-` removes a modifier, just like `-?`.',
        },
      ],
    },
    {
      id: 'returntype-awaited-infer',
      title: 'Build ReturnType, Parameters and Awaited with infer',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'infer-keyword',
      question: `You have a service function. You do not want to write the \`User\` type by hand — you want to **derive** it from the function.

\`\`\`typescript
async function getUser(id: string, withPosts: boolean) {
  return { id, name: 'Asha', posts: withPosts ? ['Hello'] : [] };
}
\`\`\`

Without using the built-ins, write:

- \`MyReturnType<F>\` — the return type of a function
- \`MyParameters<F>\` — the parameters as a tuple
- \`MyAwaited<T>\` — unwrap a Promise (also nested ones like \`Promise<Promise<number>>\`)

Then derive \`type User\` = the resolved value of \`getUser\`.`,
      hints: [
        'Use a conditional type that matches a function shape: `F extends (...args: any[]) => infer R ? R : never`.',
        '`infer` declares a new type variable inside the pattern that TypeScript fills in for you.',
        'For Awaited, match `PromiseLike<infer U>` and call `MyAwaited<U>` again (recursion) to unwrap nested promises.',
      ],
      solution: `**Idea:** \`infer\` is "pattern matching" for types. You describe a shape and put \`infer X\` where the part you want sits. If the type matches, \`X\` is filled in.

\`\`\`typescript
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type MyParameters<F> = F extends (...args: infer P) => any ? P : never;
type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T;

async function getUser(id: string, withPosts: boolean) {
  return { id, name: 'Asha', posts: withPosts ? ['Hello'] : [] };
}

type GetUserArgs = MyParameters<typeof getUser>;   // [id: string, withPosts: boolean]
type GetUserResult = MyReturnType<typeof getUser>; // Promise<{ id: string; name: string; posts: string[] }>
type User = MyAwaited<GetUserResult>;              // { id: string; name: string; posts: string[] }

// ---- Tests ----
type Equal<X, Y> =
  (<G>() => G extends X ? 1 : 2) extends (<G>() => G extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type T1 = Expect<Equal<GetUserArgs, [id: string, withPosts: boolean]>>;
type T2 = Expect<Equal<User, { id: string; name: string; posts: string[] }>>;
type T3 = Expect<Equal<MyAwaited<Promise<Promise<number>>>, number>>;
type T4 = Expect<Equal<MyReturnType<() => void>, void>>;

// Real use: a function that accepts exactly what getUser returns
function renderUser(user: User): string {
  return \`\${user.name} has \${user.posts.length} posts\`;
}

getUser('1', true).then((u) => console.log(renderUser(u)));
export type { T1, T2, T3, T4 };
\`\`\`

**Why it works:**

- \`typeof getUser\` turns the **value** (function) into its **type**.
- \`MyReturnType\`: "if \`F\` is a function, call its return type \`R\` and give it back".
- \`MyAwaited\` calls itself until the type is no longer promise-like, so \`Promise<Promise<number>>\` → \`Promise<number>\` → \`number\`.

**About \`any[]\` here:** this is one of the few fine places for \`any\` — it only describes "a function with any arguments" inside a pattern. It never leaks into values.`,
      followUps: [
        {
          q: 'How do you get the element type of an array?',
          a: '`type ElementOf<T> = T extends readonly (infer E)[] ? E : never;` Or simply `T[number]`.',
        },
        {
          q: 'Where is this useful in real projects?',
          a: 'Deriving types from code you do not control: `Awaited<ReturnType<typeof prisma.user.findMany>>`, the return of a Next.js server action, a Redux store (`ReturnType<typeof store.getState>`), or the props of a third-party component (`ComponentProps<typeof X>`).',
        },
      ],
    },
    {
      id: 'typed-event-emitter',
      title: 'Typed event emitter: on(event, handler)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'generics',
      question: `Build a small event emitter class where the **event name decides the payload type**.

\`\`\`typescript
type AppEvents = {
  login: { userId: string };
  logout: { reason: 'manual' | 'expired' };
  cartUpdated: { items: number; total: number };
};

const bus = new TypedEmitter<AppEvents>();

bus.on('login', (p) => console.log(p.userId)); // p is { userId: string }
bus.emit('cartUpdated', { items: 2, total: 998 });

bus.emit('login', { id: 'x' });   // should be an error (wrong payload)
bus.on('signup', () => {});       // should be an error (unknown event)
\`\`\`

\`on\` should return an "unsubscribe" function.`,
      hints: [
        'Make the class generic over the event map: `class TypedEmitter<E extends Record<string, unknown>>`.',
        'Each method is generic over the key: `on<K extends keyof E>(event: K, handler: (payload: E[K]) => void)`.',
        'Store handlers in a mapped type: `{ [K in keyof E]?: Array<(payload: E[K]) => void> }`.',
      ],
      solution: `**Idea:** the event map type is the single source of truth. Every method takes a key \`K\` and uses \`E[K]\` as the payload type.

\`\`\`typescript
type Handler<T> = (payload: T) => void;

class TypedEmitter<E extends Record<string, unknown>> {
  // For each event, an optional list of handlers for THAT event's payload
  private handlers: { [K in keyof E]?: Handler<E[K]>[] } = {};

  on<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    (this.handlers[event] ??= []).push(handler);
    return () => this.off(event, handler); // unsubscribe
  }

  off<K extends keyof E>(event: K, handler: Handler<E[K]>): void {
    this.handlers[event] = this.handlers[event]?.filter((h) => h !== handler);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.handlers[event]?.forEach((h) => h(payload));
  }
}

type AppEvents = {
  login: { userId: string };
  logout: { reason: 'manual' | 'expired' };
  cartUpdated: { items: number; total: number };
};

const bus = new TypedEmitter<AppEvents>();

const unsubscribe = bus.on('login', (p) => console.log('welcome', p.userId));
bus.on('cartUpdated', ({ items, total }) => console.log(items, total));

bus.emit('login', { userId: 'u1' });
bus.emit('logout', { reason: 'expired' });
unsubscribe();

// @ts-expect-error - wrong payload for 'login'
bus.emit('login', { id: 'x' });
// @ts-expect-error - 'signup' is not an event
bus.on('signup', () => {});
\`\`\`

**Why it works:** when you call \`bus.on('login', ...)\`, \`K\` is inferred as the literal \`'login'\`, so \`E[K]\` is \`{ userId: string }\` and the handler parameter is typed without any annotation. The same \`K\` links the name and payload in \`emit\`.

**Gotcha:** use a \`type\` alias for the event map, not an \`interface\`. Interfaces do not get an implicit index signature, so they do not satisfy \`Record<string, unknown>\`. (Alternative constraint: \`E extends object\`.)`,
      followUps: [
        {
          q: 'How do you support events with no payload, like `bus.emit(\'ready\')`?',
          a: 'Use a rest tuple: `emit<K extends keyof E>(event: K, ...args: E[K] extends undefined ? [] : [payload: E[K]])`. Then `ready: undefined` events take no second argument.',
        },
        {
          q: 'How would you type Node\'s built-in EventEmitter the same way?',
          a: 'In recent @types/node versions `EventEmitter` accepts a generic event map: `new EventEmitter<{ login: [userId: string] }>()`, where each value is the tuple of listener arguments. Check your @types/node version.',
        },
      ],
    },
    {
      id: 'function-overloads-find',
      title: 'Function overloads: one function, different return types',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'function-overloads',
      question: `Write \`findUsers\` so that the return type depends on the input:

\`\`\`typescript
const one = findUsers(1);        // type: User | undefined
const many = findUsers([1, 2]);  // type: User[]
\`\`\`

With a single signature like \`(input: number | number[]): User | User[] | undefined\`, every caller has to check the type again. Fix that.`,
      hints: [
        'TypeScript lets you write several signatures (overloads) above one implementation.',
        'The implementation signature must be compatible with all overloads, and callers cannot see it.',
        'Inside the implementation, narrow with `Array.isArray(input)`.',
      ],
      solution: `**Idea:** declare one **overload signature** per use case. Callers only see the overloads; the last signature (with the body) handles all of them.

\`\`\`typescript
type User = { id: number; name: string };

const db = new Map<number, User>([
  [1, { id: 1, name: 'Asha' }],
  [2, { id: 2, name: 'Ravi' }],
]);

// Overload signatures (what callers see)
function findUsers(id: number): User | undefined;
function findUsers(ids: number[]): User[];
// Implementation signature (hidden from callers) + body
function findUsers(input: number | number[]): User | User[] | undefined {
  if (Array.isArray(input)) {
    return input
      .map((id) => db.get(id))
      .filter((u): u is User => u !== undefined); // type guard keeps User[]
  }
  return db.get(input);
}

const one = findUsers(1);       // User | undefined
const many = findUsers([1, 2]); // User[]
console.log(one?.name, many.length);

// Gotcha: a value that is a union does not match either overload
declare const idOrIds: number | number[];
// @ts-expect-error - No overload matches this call
findUsers(idOrIds);
\`\`\`

**Why it works:** TypeScript checks overloads **top to bottom** and picks the first one that matches the call. \`findUsers(1)\` matches the first, \`findUsers([1, 2])\` the second.

**Gotcha shown at the end:** a \`number | number[]\` argument matches neither overload. If callers need that, add a third overload: \`function findUsers(input: number | number[]): User | User[] | undefined;\`.

**Note:** the body is **not** checked against each overload separately. If you return \`User[]\` for a single id by mistake, TypeScript will not catch it — keep overload bodies simple.`,
      followUps: [
        {
          q: 'Can you do this with generics instead?',
          a: 'Yes: `function findUsers<T extends number | number[]>(input: T): T extends number[] ? User[] : User | undefined`. But the body then needs casts, because TypeScript cannot narrow `T` inside. Overloads are usually easier to read here.',
        },
        {
          q: 'When should you NOT use overloads?',
          a: 'When the return type is the same for all inputs — just use a union parameter. Overloads are for when the input decides the output type.',
        },
      ],
    },
    {
      id: 'dangerous-type-assertions',
      title: 'Debug: three wrong uses of as',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'assertion-vs-guard',
      question: `This code compiles with zero errors, but crashes or misbehaves at runtime. Find the three bugs caused by \`as\` and fix each one.

\`\`\`typescript
type User = { id: number; name: string; address: { city: string } };
type Settings = { theme: 'dark' | 'light'; pageSize: number };

// Bug 1
function loadUser(raw: string): User {
  return JSON.parse(raw) as User;
}
console.log(loadUser('{"id":1,"name":"Asha"}').address.city);

// Bug 2
const settings = {} as Settings;
console.log(settings.pageSize * 2);

// Bug 3
const port = process.env.PORT as unknown as number;
console.log(port + 1); // PORT=3000 prints "30001"
\`\`\``,
      hints: [
        '`as` never changes the value at runtime. It only changes what the compiler believes.',
        'For each line, ask: "what is the real value here?" (`address` is missing, `{}` is empty, env values are strings).',
        'Replace the casts with: a runtime check, a complete object literal with an annotation, and a real conversion (`Number(...)`).',
      ],
      solution: `**Idea:** \`as\` is you telling the compiler "trust me". When you are wrong, the bug appears at runtime. Replace each cast with code that makes the type **true**.

- **Bug 1:** the JSON has no \`address\`, so \`.address.city\` throws \`Cannot read properties of undefined\`.
- **Bug 2:** \`{} as Settings\` claims the fields exist. \`settings.pageSize\` is \`undefined\`, so the result is \`NaN\`.
- **Bug 3:** \`as unknown as number\` (a "double cast") forces any type into any other. The value is still the string \`'3000'\`, so \`+ 1\` does string concatenation.

\`\`\`typescript
type User = { id: number; name: string; address: { city: string } };
type Settings = { theme: 'dark' | 'light'; pageSize: number };

// Fix 1: check the data, do not assume it
function isUser(v: unknown): v is User {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>; // safe: we only read and check
  const addr = o.address as Record<string, unknown> | null | undefined;
  return (
    typeof o.id === 'number' &&
    typeof o.name === 'string' &&
    typeof addr === 'object' && addr !== null &&
    typeof addr.city === 'string'
  );
}

function loadUser(raw: string): User | null {
  const data: unknown = JSON.parse(raw);
  return isUser(data) ? data : null;
}
console.log(loadUser('{"id":1,"name":"Asha"}')?.address.city ?? 'no address');

// Fix 2: annotate a COMPLETE object. A missing field is now a compile error.
const settings: Settings = { theme: 'light', pageSize: 20 };
// @ts-expect-error - Property 'pageSize' is missing
const broken: Settings = { theme: 'dark' };
console.log(settings.pageSize * 2, broken);

// Fix 3: convert, then validate
function readPort(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
const port = readPort(process.env.PORT, 3000);
console.log(port + 1); // 3001
\`\`\`

**Why it works:** an annotation (\`: Settings\`) asks the compiler to **check** the value; \`as Settings\` asks it to **stop checking**. A type guard and \`Number()\` produce values that really match their types.

**Rule of thumb:** \`as\` is OK when you know more than the compiler and it is provable nearby (like \`as const\`, or narrowing a DOM element you just created). \`as unknown as X\` in app code is almost always a bug.`,
      followUps: [
        {
          q: 'Why does TypeScript allow `{} as Settings` but not `"hello" as number`?',
          a: 'A single `as` is allowed only if one type is assignable to the other ("sufficiently overlaps"). `{}` and `Settings` overlap; `string` and `number` do not. The double cast through `unknown` bypasses this safety check.',
        },
        {
          q: 'How do you validate all env variables at startup?',
          a: 'Parse `process.env` once with a schema (e.g. Zod: `z.object({ PORT: z.coerce.number(), DATABASE_URL: z.string().url() })`) and export the typed result. The app fails fast at boot instead of failing later.',
        },
      ],
    },
    {
      id: 'enum-pitfalls-output',
      title: 'Enum pitfalls: what does this print?',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'enums',
      question: `Answer for each line: compile error, or what is printed?

\`\`\`typescript
enum Status { Active, Inactive }
enum Color { Red = 'RED', Green = 'GREEN' }

console.log(Object.keys(Status));   // (1)
console.log(Object.values(Color));  // (2)
console.log(Status[0]);             // (3)
const c: Color = 'RED';             // (4)
const s: Status = 1;                // (5)
\`\`\`

Then suggest an alternative many teams use instead of enums.`,
      hints: [
        'Enums are one of the few TypeScript features that create real JavaScript code. Numeric enums get a **reverse mapping** (number → name).',
        'String enums have no reverse mapping, and a plain string is not accepted where the enum type is expected.',
        'Numeric enum members are numbers at runtime. Is `1` one of the known values of `Status`?',
      ],
      solution: `**Answers:**

\`\`\`text
(1) [ '0', '1', 'Active', 'Inactive' ]
(2) [ 'RED', 'GREEN' ]
(3) Active
(4) Compile error: Type '"RED"' is not assignable to type 'Color'.
(5) Compiles. 1 is Status.Inactive.
\`\`\`

**Why:** a numeric enum compiles to an object with **both directions**: \`Status.Active = 0\` and \`Status[0] = 'Active'\`. So \`Object.keys\` returns 4 keys, which surprises people who loop over an enum to build a dropdown. String enums have no reverse mapping, so (2) is clean. String enums are "nominal": only \`Color.Red\` is accepted, not the string \`'RED'\` — even though they are equal at runtime. For (5), since TypeScript 5.0 a numeric literal must match a member value, so \`1\` is fine but \`5\` would be an error.

\`\`\`typescript
enum Status { Active, Inactive }
enum Color { Red = 'RED', Green = 'GREEN' }

console.log(Object.keys(Status));  // [ '0', '1', 'Active', 'Inactive' ]
console.log(Object.values(Color)); // [ 'RED', 'GREEN' ]
console.log(Status[0]);            // 'Active'
// @ts-expect-error - a plain string is not assignable to a string enum
const c: Color = 'RED';
const s: Status = 1;               // OK
// @ts-expect-error - 5 is not a value of Status (TS 5.0+)
const s2: Status = 5;

// Alternative: as const object + derived union type
const ORDER_STATUS = { Pending: 'pending', Paid: 'paid', Shipped: 'shipped' } as const;
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]; // 'pending' | 'paid' | 'shipped'

function ship(status: OrderStatus) {
  console.log('status:', status);
}
ship(ORDER_STATUS.Paid); // OK
ship('shipped');         // OK - plain strings from an API work too
console.log(Object.values(ORDER_STATUS)); // [ 'pending', 'paid', 'shipped' ] - no surprises
console.log(c, s, s2);
\`\`\`

**Why the alternative is popular:** it is plain JavaScript (works with tools that only strip types, like Node's type stripping or \`isolatedModules\` builds), plain strings from JSON fit the type, and \`Object.values\` gives exactly the values.`,
      followUps: [
        {
          q: 'What is a `const enum` and why is it risky?',
          a: 'A `const enum` is inlined at compile time (no object is emitted). Tools that compile one file at a time (Babel, esbuild, SWC — `isolatedModules`) cannot see other files to inline the values, so it breaks across files. Avoid it in apps and libraries.',
        },
        {
          q: 'Are enums ever a good choice?',
          a: 'They are fine when the whole team uses them consistently, especially string enums. The main costs are runtime code, the reverse-mapping surprise for numeric enums, and the nominal behavior with plain strings.',
        },
      ],
    },
    {
      id: 'typed-usereducer-cart',
      title: 'Type a React cart with useReducer and useRef',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'ts-with-react',
      question: `Build a typed shopping cart with \`useReducer\`. Actions:

- \`add\` — add an item (or increase \`qty\` if it is already in the cart)
- \`remove\` — remove by \`id\`
- \`setQty\` — set a quantity (0 removes the item)
- \`clear\` — empty the cart

Rules:

- \`dispatch({ type: 'remove' })\` without an \`id\` must be a compile error.
- Adding a new action type later must force you to handle it in the reducer.
- Also focus a "coupon" \`<input>\` with \`useRef\` when the cart is cleared.`,
      hints: [
        'Write the actions as a discriminated union on `type`. Each action carries only the fields it needs.',
        'Type the reducer as `(state: CartState, action: CartAction): CartState`. `useReducer` infers everything else from it.',
        'For the DOM ref: `useRef<HTMLInputElement>(null)`, and use `ref.current?.focus()` because it can be null.',
      ],
      solution: `**Idea:** a discriminated union of actions makes \`dispatch\` type-safe, and a \`never\` check in the reducer makes it exhaustive.

\`\`\`tsx
import { useReducer, useRef } from 'react';

type CartItem = { id: string; name: string; price: number; qty: number };
type CartState = { items: CartItem[] };

type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'qty'> }
  | { type: 'remove'; id: string }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'clear' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const exists = state.items.some((i) => i.id === action.item.id);
      return {
        items: exists
          ? state.items.map((i) => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i))
          : [...state.items, { ...action.item, qty: 1 }],
      };
    }
    case 'remove':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'setQty':
      return {
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i))
          .filter((i) => i.qty > 0),
      };
    case 'clear':
      return { items: [] };
    default: {
      const unhandled: never = action; // compile error if a case is missing
      return unhandled;
    }
  }
}

export function Cart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const couponRef = useRef<HTMLInputElement>(null);

  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const clearCart = () => {
    dispatch({ type: 'clear' });
    couponRef.current?.focus(); // current can be null before mount
  };

  return (
    <div>
      <button onClick={() => dispatch({ type: 'add', item: { id: 'm1', name: 'Mouse', price: 499 } })}>
        Add mouse
      </button>
      {state.items.map((i) => (
        <p key={i.id}>
          {i.name} x {i.qty}
          <button onClick={() => dispatch({ type: 'remove', id: i.id })}>Remove</button>
        </p>
      ))}
      <p>Total: {total}</p>
      <input ref={couponRef} placeholder="Coupon" />
      <button onClick={clearCart}>Clear</button>
    </div>
  );
}

export function badDispatch(dispatch: (a: CartAction) => void) {
  // @ts-expect-error - 'remove' needs an id
  dispatch({ type: 'remove' });
}
\`\`\`

**Why it works:** inside \`case 'remove'\`, TypeScript narrows \`action\` to \`{ type: 'remove'; id: string }\`, so \`action.id\` is safe. \`useReducer\` reads the reducer's types, so \`state\` is \`CartState\` and \`dispatch\` only accepts \`CartAction\`. The \`never\` line turns "forgot a case" into a compile error.

**Edge case:** \`setQty\` with \`0\` removes the item thanks to the \`filter\`. Negative values should be validated in the UI.`,
      followUps: [
        {
          q: 'How do you type `useState` when the initial value is null?',
          a: 'Pass the type explicitly: `useState<User | null>(null)`. Without it, TypeScript infers the type `null` and you can never set a user.',
        },
        {
          q: 'What is the difference between a DOM ref and a "value" ref?',
          a: 'A DOM ref starts as `null` and React fills it: `useRef<HTMLInputElement>(null)`. A value ref stores your own mutable data, like a timer id: `useRef<number | undefined>(undefined)`, and you assign `ref.current` yourself.',
        },
      ],
    },
    {
      id: 'typed-express-route',
      title: 'Type an Express route: params, body, query and req.user',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'ts-with-node-express',
      question: `Type this Express route handler so that \`req.params\`, \`req.body\`, \`req.query\` and the JSON response are all typed. Auth middleware sets \`req.user\` — make that typed too, without casting in every handler.

\`\`\`javascript
app.patch('/users/:id', async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const updated = await usersService.update(req.params.id, req.body, req.query.notify === 'true');
  res.json(updated);
});
\`\`\``,
      hints: [
        '`Request` is generic: `Request<Params, ResBody, ReqBody, Query>`. `Response<ResBody>` is generic too.',
        'To add `req.user` everywhere, use declaration merging: `declare global { namespace Express { interface Request { user?: ... } } }`.',
        'Types do not validate the body at runtime. Mention how you would check it.',
      ],
      solution: `**Idea:** fill in Express's generic parameters for this route, and add \`user\` to Express's global \`Request\` interface once (module augmentation).

\`\`\`typescript
import express, { type NextFunction, type Request, type Response } from 'express';

// 1. Add req.user to EVERY request (usually in src/types/express.d.ts)
type AuthUser = { id: string; role: 'admin' | 'user' };
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// 2. Types for this route
type UserParams = { id: string };                  // params are always strings
type UpdateUserBody = { name?: string; email?: string };
type UpdateUserQuery = { notify?: string };        // query values are strings too
type UserDto = { id: string; name: string; email: string };
type ErrorBody = { error: string };

const usersService = {
  async update(id: string, patch: UpdateUserBody, notify: boolean): Promise<UserDto> {
    console.log('notify?', notify);
    return { id, name: patch.name ?? 'Asha', email: patch.email ?? 'a@x.com' };
  },
};

function requireAuth(req: Request, res: Response<ErrorBody>, next: NextFunction) {
  // A real app would verify a JWT here
  req.user = { id: '1', role: 'user' };
  next();
}

const app = express();
app.use(express.json());

app.patch(
  '/users/:id',
  requireAuth,
  async (
    req: Request<UserParams, UserDto | ErrorBody, UpdateUserBody, UpdateUserQuery>,
    res: Response<UserDto | ErrorBody>,
  ) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (user.role !== 'admin' && user.id !== req.params.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const updated = await usersService.update(req.params.id, req.body, req.query.notify === 'true');
    res.json(updated);
    // res.json({ wrong: true }) would be a compile error
  },
);

app.listen(3000);
\`\`\`

**Why it works:** the generics tell Express what each part looks like, so \`req.params.id\` is \`string\`, \`req.body.name\` is \`string | undefined\`, and \`res.json(...)\` only accepts \`UserDto | ErrorBody\`. The \`declare global\` block merges a new field into Express's own \`Request\` interface, so every handler sees \`req.user\`.

**Important:** \`req.body\` is typed, but nobody checked it. A client can send \`{ "name": 123 }\`. Validate with a schema (Zod) in a middleware, and derive the body type from the schema with \`z.infer\`.

**Edge case:** \`user\` is optional (\`user?\`) because routes without the auth middleware do not have it. That forces a check instead of a crash.`,
      followUps: [
        {
          q: 'Why `return;` after `res.status(...).json(...)` instead of `return res...`?',
          a: 'It keeps the handler return type as `void` / `Promise<void>`, which is what handler types and lint rules (like `no-misused-promises`) expect. `return res.json()` returns the Response object; it usually compiles too, so this is mostly about clarity and consistency.',
        },
        {
          q: 'How do you type environment variables?',
          a: 'Validate `process.env` once at startup with a schema and export a typed `env` object. Do not augment `ProcessEnv` with required fields — that only lies to the compiler.',
        },
      ],
    },
    {
      id: 'deep-partial-readonly',
      title: 'Write DeepPartial and DeepReadonly',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'conditional-types',
      question: `\`Partial<T>\` and \`Readonly<T>\` only work one level deep. Write \`DeepPartial<T>\` and \`DeepReadonly<T>\` that work on nested objects and arrays.

\`\`\`typescript
type Settings = {
  theme: { mode: 'dark' | 'light'; accent: string };
  notifications: { email: boolean; channels: string[] };
  updatedAt: Date;
  onChange: (key: string) => void;
};

// DeepPartial: allow patches like { theme: { mode: 'dark' } }
// DeepReadonly: settings.theme.mode = 'x' and settings.notifications.channels.push('x') must both fail
\`\`\`

Be careful: functions and \`Date\` should be kept as they are.`,
      hints: [
        'Use recursion: a mapped type that calls `DeepPartial<T[K]>` for each property.',
        'Use a conditional type to stop at primitives, functions and built-in objects like `Date`.',
        'Arrays need their own branch: `T extends readonly (infer U)[]`. For readonly use `ReadonlyArray<DeepReadonly<U>>`.',
      ],
      solution: `**Idea:** a recursive conditional type. If \`T\` is a "leaf" (primitive, function, Date), return it unchanged. If it is an array, transform the element type. If it is an object, map every key and recurse.

\`\`\`typescript
type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type Leaf = Primitive | Date | RegExp | ((...args: any[]) => unknown);

type DeepPartial<T> =
  T extends Leaf ? T
  : T extends readonly (infer U)[] ? DeepPartial<U>[]
  : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type DeepReadonly<T> =
  T extends Leaf ? T
  : T extends readonly (infer U)[] ? ReadonlyArray<DeepReadonly<U>>
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type Settings = {
  theme: { mode: 'dark' | 'light'; accent: string };
  notifications: { email: boolean; channels: string[] };
  updatedAt: Date;
  onChange: (key: string) => void;
};

// DeepPartial in use: a nested patch
function patchSettings(current: Settings, patch: DeepPartial<Settings>): Settings {
  return {
    ...current,
    updatedAt: patch.updatedAt ?? current.updatedAt, // Date is a leaf: kept whole
    theme: { ...current.theme, ...patch.theme },
    notifications: {
      email: patch.notifications?.email ?? current.notifications.email,
      channels: patch.notifications?.channels ?? current.notifications.channels,
    },
  };
}

const current: Settings = {
  theme: { mode: 'light', accent: '#09f' },
  notifications: { email: true, channels: ['push'] },
  updatedAt: new Date(),
  onChange: (key) => console.log('changed', key),
};

const next = patchSettings(current, { theme: { mode: 'dark' } }); // only one nested field
// @ts-expect-error - 'blue' is not a valid mode
patchSettings(current, { theme: { mode: 'blue' } });

// DeepReadonly in use: freeze-like typing
const frozen: DeepReadonly<Settings> = next;
function compileErrorsOnly() {
  // never called - these lines only show the compile errors
  // @ts-expect-error - mode is readonly
  frozen.theme.mode = 'light';
  // @ts-expect-error - push does not exist on readonly arrays
  frozen.notifications.channels.push('sms');
}
frozen.updatedAt.getTime(); // Date methods still work
frozen.onChange('theme');   // functions still callable

console.log(next.theme.mode, typeof compileErrorsOnly); // 'dark'
\`\`\`

**Why it works:**

- The conditional type is **distributive**: for a union like \`string | Date\`, it runs on each member separately.
- The \`Leaf\` check comes first. Without it, \`Date\` would hit the \`object\` branch and all its methods would become optional or readonly copies.
- Functions are objects too, so they must be in \`Leaf\`, otherwise they become non-callable mapped objects.
- Arrays get their own branch so they stay arrays (\`string[]\` → \`ReadonlyArray<string>\`) instead of mapped objects.

**Note:** \`DeepReadonly\` is a compile-time promise only. For runtime safety too, combine it with \`Object.freeze\` (recursively).`,
      followUps: [
        {
          q: 'Why might a DeepPartial on a huge type slow down the editor?',
          a: 'Recursive types are expanded lazily, but deep or very wide types (like big generated API types) can create many instantiations. Keep them for config and patch objects, not everything.',
        },
        {
          q: 'How would you handle Map and Set?',
          a: 'Add branches before the object branch: `T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>` and `T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>>`.',
        },
      ],
    },
    {
      id: 'route-params-template-literal',
      title: 'Extract route params from "/users/:id" with template literal types',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'template-literal-types',
      question: `Write a type \`RouteParams<Path>\` and a function \`buildUrl(path, params)\` so that the params object is checked against the path string.

\`\`\`typescript
buildUrl('/users/:userId/posts/:postId', { userId: '7', postId: '42' }); // OK -> '/users/7/posts/42'
buildUrl('/users/:userId', {});                    // error: userId missing
buildUrl('/users/:userId', { userid: '7' });       // error: typo
buildUrl('/health', {});                           // OK, no params
\`\`\``,
      hints: [
        'Template literal types can pattern-match strings, like a regex for types. Write a pattern with a backtick string that contains `:${infer Param}/${infer Rest}`.',
        'First build a **union of names** (`\'userId\' | \'postId\'`) with recursion on `Rest`. Then map it: `{ [K in Names]: string }`.',
        'You need two cases: a param followed by `/more`, and a param at the very end.',
      ],
      solution: `**Idea:** walk through the string at the type level. Each step finds the next \`:name\`, takes the name, and continues on the rest of the path. Collect the names into a union, then turn the union into an object type.

\`\`\`typescript
type ParamNames<Path extends string> =
  // ":name/" in the middle -> take name, continue with the rest
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | ParamNames<Rest>
    // ":name" at the end
    : Path extends \`\${string}:\${infer Param}\`
      ? Param
      : never; // no params left

type RouteParams<Path extends string> = { [K in ParamNames<Path>]: string };

type A = ParamNames<'/users/:userId/posts/:postId'>; // 'userId' | 'postId'
type B = RouteParams<'/users/:userId'>;              // { userId: string }
type C = RouteParams<'/health'>;                     // {}

function buildUrl<P extends string>(path: P, params: RouteParams<P>): string {
  // Runtime: replace every ":name" with its encoded value
  return path.replace(/:(\\w+)/g, (_, name: string) =>
    encodeURIComponent((params as Record<string, string>)[name] ?? ''),
  );
}

console.log(buildUrl('/users/:userId/posts/:postId', { userId: '7', postId: '42' })); // /users/7/posts/42
console.log(buildUrl('/health', {}));
// @ts-expect-error - userId is missing
buildUrl('/users/:userId', {});
// @ts-expect-error - 'userid' is a typo
buildUrl('/users/:userId', { userid: '7' });

export type { A, B, C };
\`\`\`

**Why it works:** \`infer\` inside a template literal type matches the shortest possible text before the next fixed part. For \`'/users/:userId/posts/:postId'\`: step 1 matches \`Param = 'userId'\`, \`Rest = 'posts/:postId'\`. Step 2 on the rest: no \`/\` after the param, so the second branch gives \`'postId'\`. The mapped type \`{ [K in 'userId' | 'postId']: string }\` builds the object.

**Why \`P extends string\`:** it makes TypeScript infer the **literal** path (\`'/users/:userId'\`), not just \`string\`. With plain \`string\` there are no params to find.

**The cast inside:** at runtime \`params\` is just an object; the cast is local and safe because the types were already checked at the call site.`,
      followUps: [
        {
          q: 'Where do real libraries use this?',
          a: 'Express types have `RouteParameters<Route>` so `app.get(\'/users/:id\', (req) => req.params.id)` is typed. React Router and type-safe routers (TanStack Router, Hono) use the same idea.',
        },
        {
          q: 'How would you support optional params like `:id?`?',
          a: 'Add a branch: if `Param` ends with a question mark (match it with a template literal type and `infer Name`), put `Name` in an "optional names" union, and build `{ [K in Required]: string } & { [K in Optional]?: string }`.',
        },
      ],
    },
    {
      id: 'event-handler-props-key-remapping',
      title: 'Generate onClick / onChange handler props from an event map',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'mapped-types',
      question: `A component library defines its events in one place:

\`\`\`typescript
type DropdownEvents = {
  open: void;
  select: { value: string; label: string };
  search: string;
};
\`\`\`

1. Write \`HandlerProps<E>\` that produces optional props named \`onOpen\`, \`onSelect\`, \`onSearch\` with the right payload types.
2. Write \`EventName<P>\` that does the reverse: \`'onSelect'\` → \`'select'\`.
3. Write \`Getters<T>\` that turns \`{ name: string; age: number }\` into \`{ getName: () => string; getAge: () => number }\`.`,
      hints: [
        'Mapped types can rename keys with `as`: `{ [K in keyof E as NewName]: ... }`.',
        'The new name is a template literal type: the text `on` followed by `${Capitalize<K & string>}`, inside backticks. `K & string` is needed because keys can also be numbers or symbols.',
        'For the reverse, pattern-match the text `on${infer Name}` with a template literal type, then return `Uncapitalize<Name>` (or `never` if it does not match).',
      ],
      solution: `**Idea:** **key remapping** (\`as\` inside a mapped type) lets you compute a new key name from the old one. Template literal types plus the built-in \`Capitalize\` / \`Uncapitalize\` do the string work.

\`\`\`typescript
type DropdownEvents = {
  open: void;
  select: { value: string; label: string };
  search: string;
};

// 1. event map -> optional handler props
type HandlerProps<E> = {
  [K in keyof E as \`on\${Capitalize<K & string>}\`]?: (payload: E[K]) => void;
};

type DropdownProps = HandlerProps<DropdownEvents> & { items: string[] };
// { onOpen?: (payload: void) => void; onSelect?: (payload: {...}) => void; onSearch?: (payload: string) => void }

// 2. reverse: handler prop name -> event name
type EventName<P> = P extends \`on\${infer Name}\` ? Uncapitalize<Name> : never;
type E1 = EventName<'onSelect'>;              // 'select'
type E2 = EventName<keyof DropdownProps>;     // 'open' | 'select' | 'search' ('items' is dropped)

// 3. getters
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};

function makeGetters<T extends object>(obj: T): Getters<T> {
  const result: Record<string, () => unknown> = {};
  for (const key of Object.keys(obj) as (keyof T & string)[]) {
    result[\`get\${key[0]!.toUpperCase()}\${key.slice(1)}\`] = () => obj[key];
  }
  return result as Getters<T>; // the runtime loop builds exactly this shape
}

const person = makeGetters({ name: 'Asha', age: 30 });
const n: string = person.getName();
const a: number = person.getAge();
function compileErrorsOnly() {
  // never called - only shows the compile error
  // @ts-expect-error - no getEmail
  person.getEmail();
}

// Using the generated props
function createDropdown(props: DropdownProps) {
  props.onOpen?.();
  props.onSelect?.({ value: props.items[0] ?? '', label: 'First' });
}
createDropdown({ items: ['a'], onSelect: (p) => console.log(p.label) });
// @ts-expect-error - payload of onSearch is a string, not a number
createDropdown({ items: [], onSearch: (q: number) => console.log(q) });

console.log(n, a, typeof compileErrorsOnly); // 'Asha' 30
export type { E1, E2 };
\`\`\`

**Why it works:**

- The \`as\` clause (the template literal type with \`on\${Capitalize<K & string>}\`) renames each key; the value type still uses the original \`K\`, so payloads stay linked.
- If the \`as\` clause produces \`never\`, the key is **removed**. That is how you filter keys (e.g. keep only function props).
- \`EventName\` is distributive, so on a union of keys it returns a union of names, and non-matching keys (\`items\`) become \`never\` and disappear.
- \`payload: void\` lets you call \`onOpen()\` with no argument.

**The cast in \`makeGetters\`:** TypeScript cannot follow string building at runtime, so we cast once at the end. Keep such casts in small, tested helpers.`,
      followUps: [
        {
          q: 'How do you keep only the keys whose value is a function?',
          a: '`type FunctionKeys<T> = { [K in keyof T as T[K] extends (...a: any[]) => unknown ? K : never]: T[K] }`. Returning `never` from `as` drops the key.',
        },
        {
          q: 'What other intrinsic string types exist?',
          a: '`Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize`. They are built into the compiler and work on string literal types.',
        },
      ],
    },
    {
      id: 'migrate-js-to-ts',
      title: 'Migrate a large JavaScript codebase to TypeScript',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'strict-mode-flags',
      question: `You join a team with a 2-year-old MERN app: about 300 JavaScript files (Express API + React frontend), no types, a few bugs every sprint caused by wrong data shapes. The team must keep shipping features. You cannot stop for a "big rewrite".

How would you move this codebase to TypeScript? Explain the order of steps, the \`tsconfig\` settings you would start with, how you turn on \`strict\` without a 5,000-error wall, and how you stop the team from adding new \`any\`.`,
      hints: [
        'TypeScript can compile `.js` and `.ts` files side by side. Which tsconfig option allows that?',
        'Start loose, then tighten one flag at a time. Which files would you convert first — leaf utilities or big React pages?',
        'Think about CI: type-check on every PR, and lint rules that block new problems while old code is still loose.',
      ],
      solution: `**Idea:** migrate **gradually**. JS and TS live together, you convert file by file, and you raise strictness in small steps. Every step is a small PR that keeps the app working.

#### Step 1 — Set up TypeScript next to the JS (day 1)

\`\`\`json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "noImplicitAny": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "noEmit": true
  },
  "include": ["src"]
}
\`\`\`

- \`allowJs\`: \`.ts\` files can import \`.js\` files and the other way round.
- \`noEmit\`: \`tsc\` only type-checks. The existing build (Vite / esbuild / tsx / Babel) keeps producing the output, so nothing changes for deployment.
- Add \`"typecheck": "tsc --noEmit"\` to package.json and run it in CI from day 1.
- Install \`@types/*\` for libraries (\`@types/express\`, \`@types/node\`...).

#### Step 2 — Types for the shared data first

The bugs come from wrong data shapes, so start there: write types for \`User\`, \`Order\`, API request/response bodies. Even better, write **Zod schemas** at the API boundary and derive types with \`z.infer\` — that fixes real bugs, not only types.

#### Step 3 — Convert files from the leaves up

Rename \`.js\` → \`.ts\`/\`.tsx\` starting with files that import nothing else from the app (utils, constants, services, hooks), then go up to routes and pages. Rule for the team: "every file you touch for a feature, you convert" (the boy-scout rule). For files you cannot convert yet, add \`// @ts-check\` and JSDoc types:

\`\`\`javascript
// @ts-check
/** @param {{ price: number, quantity: number }[]} items */
export function getTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
\`\`\`

#### Step 4 — Turn on strict, one flag at a time

1. \`noImplicitAny\` — fix per folder.
2. \`strictNullChecks\` — usually the most errors, and the most real bugs found ("possibly undefined").
3. The rest of \`strict\` (\`strictFunctionTypes\`, \`useUnknownInCatchVariables\`...), then switch to \`"strict": true\`.
4. Optional extras later: \`noUncheckedIndexedAccess\`, \`noImplicitOverride\`.

When a flag gives hundreds of errors, enable it, then mark the existing errors with \`// @ts-expect-error\` (a script can do this) so CI is green. New code must be clean, and the list of suppressions only goes down. Track the count on a dashboard.

#### Step 5 — Block regressions

- ESLint with \`typescript-eslint\`: \`no-explicit-any\` as an error for new code.
- Prefer \`unknown\` + type guards at boundaries; review any \`as\` in PRs.
- Finally remove \`allowJs\` when no \`.js\` files are left.

**Why it works:** the app ships every day, each PR is small and reviewable, and you get value early (types for data shapes catch the real bugs first). Turning flags on one by one turns a 5,000-error wall into many small tasks.`,
      followUps: [
        {
          q: 'Why not convert everything in one big PR?',
          a: 'It blocks every other branch (merge conflicts everywhere), is impossible to review, and mixes "renaming" with "real bug fixes". Gradual migration keeps risk low and shows value early.',
        },
        {
          q: 'A library has no types at all. What do you do?',
          a: 'Check for `@types/<lib>` first. If none exists, write a small `declare module \'lib-name\'` in a `.d.ts` file with only the functions you use. As a last resort, `declare module \'lib-name\';` makes it `any` — keep that temporary.',
        },
        {
          q: 'How do you convince the team or manager?',
          a: 'Show numbers: bugs caused by wrong data shapes in the last quarter, and the ones `strictNullChecks` found in the first folder. Explain that the migration never blocks feature work.',
        },
      ],
    },
    {
      id: 'type-safe-api-client',
      title: 'Design a type-safe API client shared by frontend and backend',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'template-literal-types',
      question: `Your Next.js frontend calls your Express API. Today every call is \`fetch('/api/users/' + id)\` with a hand-written type, and the types drift from the backend.

Design a small typed client from **one route contract**:

\`\`\`typescript
await api('GET /users');                                    // User[]
await api('GET /users/:id', { params: { id: '42' } });      // User
await api('POST /users', { body: { name: 'Asha' } });       // User

api('GET /users/:id');                       // error: params required
api('POST /users', { body: { title: 'x' } }); // error: wrong body
api('GET /posts');                           // error: unknown route
\`\`\`

Explain how the backend would use the same contract.`,
      hints: [
        'Start with one type that maps a route key like `\'GET /users/:id\'` to `{ response: User }` (plus `body` when needed). This is the contract.',
        'The return type is `ApiRoutes[K][\'response\']`. Extract param names from the path part with template literal types.',
        'To make the options argument required only when needed, use a rest parameter whose tuple type is chosen by a conditional type.',
      ],
      solution: `**Idea:** one **contract type** lists every route with its body and response. The client is a single generic function: the route key \`K\` decides the params, the body, and the return type. The backend imports the same contract, so both sides break at compile time if they disagree.

\`\`\`typescript
// ---- shared/contract.ts (shared package in a monorepo) ----
type User = { id: string; name: string };
type NewUser = { name: string };

type ApiRoutes = {
  'GET /users': { response: User[] };
  'GET /users/:id': { response: User };
  'POST /users': { body: NewUser; response: User };
  'DELETE /users/:id': { response: { deleted: true } };
};

// ---- type helpers ----
type RouteKey = keyof ApiRoutes;
type PathOf<K> = K extends \`\${string} \${infer P}\` ? P : never; // 'GET /users/:id' -> '/users/:id'

type ParamNames<Path extends string> =
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\` ? Param | ParamNames<Rest>
  : Path extends \`\${string}:\${infer Param}\` ? Param
  : never;

// [X] extends [never] checks "is X never?" without distributing
type ParamsPart<K extends RouteKey> =
  [ParamNames<PathOf<K>>] extends [never]
    ? { params?: undefined }
    : { params: Record<ParamNames<PathOf<K>>, string> };

type BodyPart<K extends RouteKey> =
  ApiRoutes[K] extends { body: infer B } ? { body: B } : { body?: undefined };

type RequestOptions<K extends RouteKey> = ParamsPart<K> & BodyPart<K>;

// Options are optional only when nothing inside them is required
type Args<K extends RouteKey> =
  {} extends RequestOptions<K> ? [options?: RequestOptions<K>] : [options: RequestOptions<K>];

type ResponseOf<K extends RouteKey> = ApiRoutes[K]['response'];

// ---- the client ----
const BASE_URL = 'https://api.example.com';

async function api<K extends RouteKey>(route: K, ...args: Args<K>): Promise<ResponseOf<K>> {
  const [method, path] = route.split(' ') as [string, string];
  // Types were checked at the call site; inside, a loose shape is enough
  const opts = (args[0] ?? {}) as { params?: Record<string, string>; body?: unknown };

  const url = path.replace(/:(\\w+)/g, (_, name: string) =>
    encodeURIComponent(opts.params?.[name] ?? ''),
  );
  const res = await fetch(BASE_URL + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  if (!res.ok) throw new Error(\`\${route} failed with \${res.status}\`);
  return (await res.json()) as ResponseOf<K>;
}

// ---- usage ----
async function demo() {
  const users = await api('GET /users');                               // User[]
  const user = await api('GET /users/:id', { params: { id: '42' } });  // User
  const created = await api('POST /users', { body: { name: 'Asha' } }); // User
  console.log(users.length, user.name, created.id);

  // @ts-expect-error - params are required for this route
  api('GET /users/:id');
  // @ts-expect-error - body does not match NewUser
  api('POST /users', { body: { title: 'x' } });
  // @ts-expect-error - unknown route
  api('GET /posts');
}

// ---- backend side: handlers must return what the contract says ----
type Handler<K extends RouteKey> = (input: RequestOptions<K>) => Promise<ResponseOf<K>>;

const getUserHandler: Handler<'GET /users/:id'> = async ({ params }) => {
  return { id: params.id, name: 'Asha' }; // returning a wrong shape is a compile error
};

demo();
getUserHandler({ params: { id: '1' } }).then(console.log);
\`\`\`

**Why it works:**

- \`K\` is inferred from the route string, so autocomplete lists only real routes.
- \`ParamNames\` reads \`:id\` from the path; \`BodyPart\` uses \`infer\` to pick the body type if the route has one.
- \`[X] extends [never]\`: a bare \`X extends never\` would **distribute** over \`never\` (an empty union) and return \`never\`. Wrapping both sides in a tuple turns that off.
- The rest parameter \`...args: Args<K>\` makes the second argument required only for routes with params or a body.

**Design trade-offs to mention:**

- Types alone do not validate responses. For untrusted data, store Zod schemas in the contract instead of types and parse both requests (server) and responses (client).
- Off-the-shelf options: **tRPC** (no contract file; types flow directly from server code — needs a TypeScript backend), **ts-rest** / **Zod + OpenAPI** (contract-first, works with REST), or **OpenAPI codegen** (\`openapi-typescript\`) when the backend is in another language.`,
      followUps: [
        {
          q: 'Why is there a cast inside `api`?',
          a: 'Inside a generic function, `Args<K>` is a deferred conditional type — TypeScript cannot narrow it per route. The public signature is fully checked; the small internal cast is the usual price, kept in one tested place.',
        },
        {
          q: 'How would you add query parameters?',
          a: 'Add an optional `query` field to routes that accept it, e.g. `{ query: { page?: number }; response: User[] }`, a `QueryPart<K>` like `BodyPart`, and build the query string with `URLSearchParams`.',
        },
        {
          q: 'tRPC or a REST contract — which would you pick?',
          a: 'tRPC if both sides are TypeScript in one repo and no public API is needed — least boilerplate. A REST/OpenAPI contract if other clients (mobile, partners) consume the API or the backend is not TypeScript.',
        },
      ],
    },
  ],
};
