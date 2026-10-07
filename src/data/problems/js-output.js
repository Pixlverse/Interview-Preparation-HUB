// Interview problems for the JavaScript Output & Implement stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'js-output',
  problems: [
    {
      id: 'object-keys-numeric-order',
      title: 'In what order does Object.keys return numeric keys?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'objects-references',
      question: `What does this print?

\`\`\`javascript
const obj = { b: 'b', 2: 'two', a: 'a', 1: 'one', '-1': 'minus', '01': 'zero-one', 1.5: 'x' };
console.log(Object.keys(obj).join(' '));
obj[0] = 'zero';
obj.c = 'c';
console.log(Object.keys(obj).join(' '));
console.log(JSON.stringify({ 10: 'a', 9: 'b', z: 'c' }));
\`\`\``,
      hints: [
        `Objects do not always keep insertion order. Some keys are treated specially.`,
        `Keys that look like array indexes (\`0\`, \`1\`, \`2\`, ...) are listed first. Is \`'01'\` or \`'-1'\` an array index?`,
      ],
      solution: `**Output:**

\`\`\`text
1 2 b a -1 01 1.5
0 1 2 b a -1 01 1.5 c
{"9":"b","10":"a","z":"c"}
\`\`\`

**Why:** \`Object.keys\` (and \`for...in\`, \`JSON.stringify\`) use a fixed order:

1. **Integer-like keys** first, in **ascending** number order. These are keys that are a normal whole number written the normal way: \`'0'\`, \`'1'\`, \`'2'\`, \`'10'\`.
2. Then all **other string keys**, in the order you **added** them.
3. (Symbol keys are never listed by \`Object.keys\`.)

\`'-1'\` is negative, \`'01'\` has a leading zero, and \`'1.5'\` is not a whole number. So they are normal strings and keep insertion order. Adding \`0\` later still puts it at the front. In the JSON line, \`9\` comes before \`10\` because they are sorted as numbers, not as text.

**Real-life impact:** if you store data as \`{ [userId]: user }\` with numeric ids, the order you inserted is lost. Use an array or a \`Map\` when order matters. A \`Map\` always keeps insertion order for every key.`,
      followUps: [
        {
          q: `Does a Map have the same rule?`,
          a: `No. A \`Map\` keeps pure insertion order for all keys, numbers included. That is one reason to prefer \`Map\` for ordered key/value data.`,
        },
        {
          q: `Can you rely on this order in JSON sent from your API?`,
          a: `The order is defined in modern JavaScript, but other languages that parse your JSON may not keep it. If order matters, send an array.`,
        },
      ],
    },
    {
      id: 'json-stringify-edge-cases',
      title: 'What does JSON.stringify drop or change?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'objects-references',
      question: `What does this print?

\`\`\`javascript
const data = {
  name: 'Asha',
  age: undefined,
  greet() {},
  id: Symbol('id'),
  score: NaN,
  limit: Infinity,
  list: [undefined, () => 1, Symbol('s'), NaN],
  joined: new Date(0),
  tags: new Set(['a']),
  meta: new Map([['k', 1]]),
};
console.log(JSON.stringify(data));
console.log(JSON.stringify(undefined));
console.log(JSON.stringify({ secret: 1, toJSON() { return 'custom'; } }));
console.log(JSON.stringify('hi'));
try {
  JSON.stringify({ n: 10n });
} catch (e) {
  console.log(e.name);
}
\`\`\``,
      hints: [
        `JSON only knows strings, numbers, booleans, null, arrays and plain objects. What happens to everything else?`,
        `An object property cannot be "skipped" inside an array without changing the indexes. So arrays behave differently from objects.`,
        `\`Date\` has a \`toJSON()\` method. \`Set\` and \`Map\` have no own enumerable properties.`,
      ],
      solution: `**Output:**

\`\`\`text
{"name":"Asha","score":null,"limit":null,"list":[null,null,null,null],"joined":"1970-01-01T00:00:00.000Z","tags":{},"meta":{}}
undefined
"custom"
"hi"
TypeError
\`\`\`

**Why, line by line:**

- **Inside objects**, properties whose value is \`undefined\`, a function or a Symbol are **removed** (\`age\`, \`greet\`, \`id\`).
- **Inside arrays**, the same values become \`null\`, so the indexes stay correct.
- \`NaN\` and \`Infinity\` are not valid JSON numbers, so they become \`null\`.
- \`Date\` has a built-in \`toJSON()\` that returns the ISO string.
- \`Set\` and \`Map\` keep their data internally, not as normal properties, so they become \`{}\`. Convert first: \`[...set]\` or \`Object.fromEntries(map)\`.
- \`JSON.stringify(undefined)\` returns the value \`undefined\` (not the string \`"undefined"\`).
- If an object has a \`toJSON()\` method, its return value is used instead of the object.
- A plain string gets quotes: \`"hi"\`.
- \`BigInt\` cannot be converted and throws a \`TypeError\`.

**Real-life impact:** when you send a form state like \`{ phone: undefined }\` with \`fetch\`, the key silently disappears. Use \`null\` if the server must see the key.`,
      followUps: [
        {
          q: `How do you send a Map or a BigInt as JSON?`,
          a: `Use a replacer: \`JSON.stringify(data, (key, value) => value instanceof Map ? Object.fromEntries(value) : typeof value === 'bigint' ? value.toString() : value)\`.`,
        },
        {
          q: `What does the third argument of JSON.stringify do?`,
          a: `It sets indentation for pretty printing: \`JSON.stringify(obj, null, 2)\` uses 2 spaces per level.`,
        },
      ],
    },
    {
      id: 'optional-chaining-calls',
      title: 'Optional chaining with function calls',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'objects-references',
      question: `What does this print?

\`\`\`javascript
const user = {
  name: 'Asha',
  getAge: null,
  address: null,
  greet() {
    return 'hi ' + this.name;
  },
};
console.log(user.greet?.());
console.log(user.getAge?.());
console.log(user.address?.city.toUpperCase());
console.log(user.profile?.settings.theme);
try {
  user.name?.();
} catch (e) {
  console.log(e.constructor.name);
}
try {
  (user.address?.city).length;
} catch (e) {
  console.log(e.constructor.name);
}
let count = 0;
user.address?.[count++];
user.name?.[count++];
console.log(count);
\`\`\``,
      hints: [
        `\`?.\` only protects against \`null\` and \`undefined\`. It does not check "is this a function?".`,
        `When \`?.\` finds \`null\`/\`undefined\`, it stops the **whole rest of the chain** (this is called short-circuiting). But parentheses end the chain.`,
      ],
      solution: `**Output:**

\`\`\`text
hi Asha
undefined
undefined
undefined
TypeError
TypeError
1
\`\`\`

**Why:**

- \`user.greet?.()\` — \`greet\` exists, so it is called normally (and \`this\` is still \`user\`).
- \`user.getAge?.()\` — \`getAge\` is \`null\`, so the call is skipped and the result is \`undefined\`.
- \`user.address?.city.toUpperCase()\` — \`address\` is \`null\`, so **everything after** \`?.\` is skipped. No error, even though \`.city\` has no \`?.\`.
- \`user.profile?.settings.theme\` — same idea: \`profile\` is \`undefined\`.
- \`user.name?.()\` — \`name\` is a **string**, not \`null\`/\`undefined\`, so JavaScript tries to call it: \`TypeError\` ("is not a function").
- \`(user.address?.city).length\` — the parentheses end the optional chain. The inside gives \`undefined\`, and then \`.length\` on \`undefined\` throws a \`TypeError\`.
- \`user.address?.[count++]\` short-circuits, so \`count++\` **never runs**. \`user.name?.[count++]\` does run it. So \`count\` is \`1\`.`,
      followUps: [
        {
          q: `Can you use optional chaining on the left side of an assignment?`,
          a: `No. \`user?.name = 'x'\` is a SyntaxError. You must check first: \`if (user) user.name = 'x';\`.`,
        },
        {
          q: `What is the difference between ?? and ||?`,
          a: `\`a || b\` falls back for any falsy value (\`0\`, \`''\`, \`false\`). \`a ?? b\` falls back only for \`null\` and \`undefined\`, so \`0 ?? 5\` is \`0\`.`,
        },
      ],
    },
    {
      id: 'comma-operator-labels-asi',
      title: 'Comma operator, labels and a lonely return',
      difficulty: 'easy',
      type: 'output',
      frequency: 'occasional',
      relatedTopic: 'classic-one-liners',
      question: `What does this print?

\`\`\`javascript
const x = (1, 2, 3);
console.log(x);

let i = 0;
const y = (i++, i++, i);
console.log(i, y);

outer: for (let a = 0; a < 3; a++) {
  for (let b = 0; b < 3; b++) {
    if (b === 1) continue outer;
    if (a === 2) break outer;
    console.log(a, b);
  }
}

const make = () => { name: 'Asha' };
console.log(make());

function getConfig() {
  return
  {
    ok: true
  }
}
console.log(getConfig());
\`\`\``,
      hints: [
        `The comma operator evaluates every part from left to right and gives back the **last** value.`,
        `\`name:\` at the start of a statement is a **label**, not an object key. Where does JavaScript see a statement instead of an object?`,
        `JavaScript adds a semicolon automatically after a \`return\` that is alone on its line (Automatic Semicolon Insertion, ASI).`,
      ],
      solution: `**Output:**

\`\`\`text
3
2 2
0 0
1 0
undefined
undefined
\`\`\`

**Why:**

- \`(1, 2, 3)\` evaluates all three and returns the last one: \`3\`.
- \`(i++, i++, i)\` runs both increments, then returns \`i\`, so \`i\` and \`y\` are both \`2\`.
- \`continue outer\` jumps to the **next iteration of the outer loop**, so for each \`a\` only \`b = 0\` prints. When \`a\` is \`2\`, \`break outer\` stops both loops. Output: \`0 0\` and \`1 0\`.
- \`() => { name: 'Asha' }\` — the \`{\` after \`=>\` starts a **function body**, not an object. Inside it, \`name:\` is a label and \`'Asha'\` is a useless expression. The function returns \`undefined\`. To return an object, wrap it: \`() => ({ name: 'Asha' })\`.
- \`return\` followed by a new line: ASI inserts a semicolon, so the function returns \`undefined\`. The \`{ ok: true }\` below is never reached (and is read as a block with a label \`ok\`, so there is no syntax error).

**Rule to remember:** always put the returned value on the same line as \`return\`, and wrap object literals returned from arrows in parentheses.`,
      followUps: [
        {
          q: `Where is the comma operator actually used?`,
          a: `Mostly in \`for\` loops with two counters: \`for (let i = 0, j = n - 1; i < j; i++, j--)\`. Minified code also uses it. In normal code avoid it, because it is hard to read.`,
        },
        {
          q: `Do labels work with blocks other than loops?`,
          a: `Yes, \`break label\` can exit any labeled block (\`myBlock: { ... break myBlock; }\`), but \`continue label\` only works with loops. It is rare in real code.`,
        },
      ],
    },
    {
      id: 'array-creation-tricks',
      title: 'Array(3), Array.from and fill surprises',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'array-quirks',
      question: `What does this print (in Node)?

\`\`\`javascript
console.log(Array(3));
console.log(Array(3).map((_, i) => i));
console.log(Array.from({ length: 3 }, (_, i) => i * 2));
console.log([...Array(3).keys()]);
console.log(Array.of(3), Array('3'));
const grid = new Array(2).fill([]);
grid[0].push('x');
console.log(grid);
console.log(Array.from({ length: 2, 0: 'a', 1: 'b', 2: 'c' }));
\`\`\``,
      hints: [
        `\`Array(3)\` makes an array with length 3 but **no items** inside (holes). How do \`map\` and \`Array.from\` treat holes?`,
        `\`fill(value)\` puts the **same value** in every slot. For an object, "the same value" means the same reference.`,
      ],
      solution: `**Output (Node):**

\`\`\`text
[ <3 empty items> ]
[ <3 empty items> ]
[ 0, 2, 4 ]
[ 0, 1, 2 ]
[ 3 ] [ '3' ]
[ [ 'x' ], [ 'x' ] ]
[ 'a', 'b' ]
\`\`\`

In a browser console the empty array shows as \`[empty × 3]\`.

**Why:**

- \`Array(3)\` sets \`length\` to 3 but creates no elements. These "holes" are not even \`undefined\` values.
- \`map\` **skips holes**, so the result is still 3 holes. This is why \`Array(3).map(...)\` does not work for "make a list of 3 items".
- \`Array.from({ length: 3 }, fn)\` reads indexes 0, 1, 2 from an array-like object. Missing ones are \`undefined\`, and the map function runs for each. This is the clean way to build \`[0, 2, 4]\`.
- \`Array(3).keys()\` iterates **every index**, holes included.
- \`Array.of(3)\` always makes an array of its arguments: \`[3]\`. \`Array('3')\` with a single **non-number** argument also makes \`['3']\`. Only a single number means "length".
- \`new Array(2).fill([])\` puts **one** shared array in both slots. Pushing into \`grid[0]\` changes \`grid[1]\` too. Use \`Array.from({ length: 2 }, () => [])\` to make separate arrays.
- \`Array.from\` respects \`length: 2\`, so index \`2\` (\`'c'\`) is ignored.`,
      followUps: [
        {
          q: `How do you create a 3x3 grid filled with 0?`,
          a: `\`Array.from({ length: 3 }, () => Array(3).fill(0))\`. The inner \`fill(0)\` is fine because numbers are primitives; the outer \`Array.from\` creates a new row each time.`,
        },
        {
          q: `What does [...Array(3)] give?`,
          a: `\`[undefined, undefined, undefined]\`. Spread uses the iterator, which reads every index, so holes become real \`undefined\` values. After that \`map\` works.`,
        },
      ],
    },
    {
      id: 'implement-classnames',
      title: 'Implement classnames()',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'implement-flatten',
      question: `React developers often use the \`classnames\` (or \`clsx\`) package to build a \`className\` string. Write your own \`classNames(...args)\`:

\`\`\`javascript
classNames('btn', { active: true, disabled: false }); // 'btn active'
classNames('a', null, undefined, false, 0, '', 'b');  // 'a b'
classNames(['x', ['y', { z: true }]], { w: 1 });      // 'x y z w'
classNames();                                          // ''
\`\`\`

Rules: strings and numbers are added; falsy values are skipped; for an object, add each key whose value is truthy; arrays can be nested and follow the same rules.`,
      hints: [
        `Loop over the arguments and check the type of each one: string/number, array, or object.`,
        `For arrays, call \`classNames\` again on the array items (recursion) and add the result if it is not empty.`,
        `Collect class names into an array and \`join(' ')\` at the end, so you never get double spaces.`,
      ],
      solution: `**Idea:** walk through every argument, handle each type with its own rule, and collect the names in an array. Recursion handles nested arrays.

\`\`\`javascript
function classNames(...args) {
  const classes = [];
  for (const arg of args) {
    if (!arg) continue; // skip false, null, undefined, 0, ''
    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg); // arrays can nest
      if (inner) classes.push(inner);
    } else if (typeof arg === 'object') {
      for (const key of Object.keys(arg)) {
        if (arg[key]) classes.push(key); // keep keys with truthy values
      }
    }
  }
  return classes.join(' ');
}
console.log(classNames('btn', { active: true, disabled: false }));
console.log(classNames('a', null, undefined, false, 0, '', 'b'));
console.log(classNames(['x', ['y', { z: true }]], { w: 1 }));
console.log(classNames(1, { 'is-open': 'yes' }));
console.log(JSON.stringify(classNames()));
\`\`\`

**Output:**

\`\`\`text
btn active
a b
x y z w
1 is-open
""
\`\`\`

**Why it works:** \`if (!arg) continue\` removes all falsy values in one line. Arrays call the same function, so any nesting depth works. Joining an array avoids extra spaces.

**Complexity:** O(n) where n is the total number of items and object keys.`,
      followUps: [
        {
          q: `How would you use it in a React component?`,
          a: `\`<button className={classNames('btn', { 'btn-primary': primary, 'btn-loading': loading }, className)}>\` — it merges fixed classes, conditional classes and the \`className\` prop from the parent.`,
        },
        {
          q: `How would you remove duplicate class names?`,
          a: `Collect into a \`Set\` instead of an array, then \`[...set].join(' ')\`. A Set keeps the first insertion order and ignores repeats.`,
        },
      ],
    },
    {
      id: 'implement-template-render',
      title: 'Build a tiny template engine render(\'Hi {{name}}\', data)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'objects-references',
      question: `Write \`render(template, data)\` that replaces \`{{key}}\` placeholders with values from \`data\`.

\`\`\`javascript
render('Hi {{name}}!', { name: 'Asha' });
// 'Hi Asha!'
render('{{ user.name }} lives in {{user.address.city}}', {
  user: { name: 'Ravi', address: { city: 'Pune' } },
});
// 'Ravi lives in Pune'
render('Missing: [{{nope}}]', {}); // 'Missing: []'
render('Count: {{count}}', { count: 0 }); // 'Count: 0'
\`\`\`

Support dotted paths and spaces inside the braces. Missing values become an empty string, but \`0\` and \`false\` must still show.`,
      hints: [
        `\`String.prototype.replace\` with a regular expression and a **function** as the second argument lets you compute each replacement.`,
        `A regex like \`/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g\` captures the path inside the braces. \`\\s*\` allows spaces.`,
        `To read \`'user.address.city'\`, split on \`.\` and walk the object with \`reduce\`. Stop safely when a level is \`null\` or \`undefined\`.`,
      ],
      solution: `**Idea:** find every \`{{ path }}\` with a global regex, read the value at that path, and return it as text.

\`\`\`javascript
function getPath(obj, path) {
  return path.split('.').reduce((current, key) => (current == null ? undefined : current[key]), obj);
}

function render(template, data) {
  // {{ name }} or {{user.name}} -- spaces inside the braces are allowed
  return template.replace(/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g, (match, path) => {
    const value = getPath(data, path);
    return value == null ? '' : String(value); // missing -> empty string
  });
}

console.log(render('Hi {{name}}!', { name: 'Asha' }));
console.log(render('{{ user.name }} lives in {{user.address.city}}', { user: { name: 'Ravi', address: { city: 'Pune' } } }));
console.log(render('Missing: [{{nope}}] [{{a.b.c}}]', {}));
console.log(render('Count: {{count}}, ok: {{ok}}', { count: 0, ok: false }));
console.log(render('{{items.1}}', { items: ['a', 'b'] }));
\`\`\`

**Output:**

\`\`\`text
Hi Asha!
Ravi lives in Pune
Missing: [] []
Count: 0, ok: false
b
\`\`\`

**Why it works:** the \`g\` flag replaces all matches. The callback receives the captured path. \`getPath\` returns \`undefined\` as soon as a level is missing, so \`a.b.c\` on \`{}\` does not throw. We check \`value == null\` (only \`null\`/\`undefined\`) instead of \`!value\`, so \`0\` and \`false\` are kept.

**Complexity:** O(template length + total path length).`,
      followUps: [
        {
          q: `Is this safe to put into innerHTML?`,
          a: `No. If \`data\` contains user input like \`<img onerror=...>\`, you create an XSS hole. Escape \`&\`, \`<\`, \`>\`, \`"\` and \`'\` in each value before inserting, or render text with \`textContent\` / React (which escapes for you).`,
        },
        {
          q: `How would you support a default value like {{name | Guest}}?`,
          a: `Change the regex to also capture an optional part after \`|\`, e.g. \`/\\{\\{\\s*([\\w.]+)\\s*(?:\\|\\s*([^}]*?))?\\s*\\}\\}/g\`, and use the default when the value is \`null\`/\`undefined\`.`,
        },
      ],
    },
    {
      id: 'implement-promisify',
      title: 'Implement promisify',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'implement-promise-all',
      question: `Old Node APIs use **error-first callbacks**: the last argument is a function \`(err, result) => {}\`. Write \`promisify(fn)\` that turns such a function into one that returns a Promise (like Node's \`util.promisify\`).

\`\`\`javascript
function readUser(id, cb) {
  setTimeout(() => {
    if (id <= 0) cb(new Error('bad id'));
    else cb(null, { id, name: 'Asha' });
  }, 10);
}
const readUserAsync = promisify(readUser);
await readUserAsync(1); // { id: 1, name: 'Asha' }
await readUserAsync(0); // throws Error: bad id
\`\`\`

It must also keep \`this\` when used as a method.`,
      hints: [
        `\`promisify\` returns a new function. That function returns \`new Promise(...)\`.`,
        `Inside the promise, call the original \`fn\` with the user's arguments **plus** your own callback at the end.`,
        `Your callback calls \`reject(err)\` if there is an error, otherwise \`resolve(result)\`. Use a regular \`function\` and \`fn.call(this, ...)\` to keep \`this\`.`,
      ],
      solution: `**Idea:** wrap the call in a Promise and pass a callback that connects "error-first" to \`reject\` / \`resolve\`.

\`\`\`javascript
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      // add our own callback as the LAST argument
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

function readUser(id, cb) {
  setTimeout(() => {
    if (id <= 0) cb(new Error('bad id'));
    else cb(null, { id, name: 'Asha' });
  }, 10);
}
const readUserAsync = promisify(readUser);
(async () => {
  console.log(await readUserAsync(1));
  try {
    await readUserAsync(0);
  } catch (e) {
    console.log('error:', e.message);
  }
  const db = {
    prefix: 'user-',
    find(id, cb) { cb(null, this.prefix + id); },
  };
  db.findAsync = promisify(db.find);
  console.log(await db.findAsync(7));
})();
\`\`\`

**Output:**

\`\`\`text
{ id: 1, name: 'Asha' }
error: bad id
user-7
\`\`\`

**Why it works:** the original function does not know anything changed; it still receives a callback as its last argument. Our callback translates the result into the promise world. Because the returned function is a normal \`function\`, \`db.findAsync(7)\` gets \`this = db\`, and we pass it on with \`fn.call(this, ...)\`.`,
      followUps: [
        {
          q: `What if the callback gives more than one result, like cb(null, a, b)?`,
          a: `Use rest parameters in the callback: \`(err, ...results) => err ? reject(err) : resolve(results.length > 1 ? results : results[0])\`. Node's \`util.promisify\` uses a special symbol (\`util.promisify.custom\`) for such functions.`,
        },
        {
          q: `In modern Node, do you still need this?`,
          a: `Rarely. Most core modules have promise versions (\`fs/promises\`, \`timers/promises\`, \`stream/promises\`). \`util.promisify\` is still handy for old libraries.`,
        },
      ],
    },
    {
      id: 'implement-get-by-path',
      title: 'Implement lodash get(obj, \'a.b[0].c\', default)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'objects-references',
      question: `Write \`get(obj, path, defaultValue)\` that safely reads a nested value. \`path\` can be a string with dots and \`[index]\`, or an array of keys. If the value is \`undefined\` (or a level is missing), return \`defaultValue\`.

\`\`\`javascript
const data = { user: { posts: [{ title: 'Hello' }], age: 0, nick: null } };
get(data, 'user.posts[0].title');         // 'Hello'
get(data, ['user', 'posts', '0', 'title']); // 'Hello'
get(data, 'user.address.city', 'N/A');    // 'N/A'
get(data, 'user.age', 99);                 // 0   (0 is a real value)
get(data, 'user.nick', 'anon');            // null (only undefined uses the default)
\`\`\``,
      hints: [
        `First turn the path string into an array of keys. \`'posts[0]'\` can become \`'posts.0'\` with a regex replace.`,
        `Walk the keys one by one. If the current value is \`null\` or \`undefined\` before you finish, stop and return the default.`,
      ],
      solution: `**Idea:** normalise the path into a list of keys, then step into the object one key at a time, stopping safely when a level is missing.

\`\`\`javascript
function get(obj, path, defaultValue) {
  // turn 'a[0].b' or ['a', '0', 'b'] into ['a', '0', 'b']
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean);

  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue; // null or undefined in the middle
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}

const data = { user: { posts: [{ title: 'Hello', tags: ['js'] }], age: 0, nick: null } };
console.log(get(data, 'user.posts[0].title'));
console.log(get(data, 'user.posts[0].tags[0]'));
console.log(get(data, ['user', 'posts', '0', 'title']));
console.log(get(data, 'user.address.city', 'N/A'));
console.log(get(data, 'user.age', 99));
console.log(get(data, 'user.nick', 'anon'));
console.log(get(null, 'a', 'def'));
\`\`\`

**Output:**

\`\`\`text
Hello
js
Hello
N/A
0
null
def
\`\`\`

**Why it works:** \`replace(/\\[(\\w+)\\]/g, '.$1')\` turns \`a[0].b\` into \`a.0.b\`; \`split('.')\` gives the keys; \`filter(Boolean)\` removes empty parts (like a leading dot). The \`current == null\` check catches both \`null\` and \`undefined\` in the middle. Like lodash, only a final \`undefined\` falls back to the default — \`0\` and \`null\` are real values.

**Complexity:** O(number of keys in the path).`,
      followUps: [
        {
          q: `Why not just use optional chaining?`,
          a: `\`data?.user?.posts?.[0]?.title ?? 'N/A'\` is perfect when the path is known while writing code. \`get\` is useful when the path is **dynamic**, e.g. it comes from a config, a table column definition, or a form field name like \`'address.city'\`.`,
        },
        {
          q: `How would you write the matching set(obj, path, value)?`,
          a: `Walk the same keys except the last; at each step create a missing level (\`[]\` if the next key is a number, otherwise \`{}\`), then assign the value with the last key.`,
        },
      ],
    },
    {
      id: 'promise-settles-once',
      title: 'A promise settles only once',
      difficulty: 'easy',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'promise-chaining',
      question: `What does this print?

\`\`\`javascript
const p = new Promise((resolve, reject) => {
  console.log('A');
  resolve('first');
  console.log('B');
  reject(new Error('ignored'));
  resolve('second');
  throw new Error('also ignored');
});
p.then((v) => console.log('then', v)).catch((e) => console.log('catch', e.message));

const q = new Promise(() => {
  throw new Error('boom');
});
q.catch((e) => console.log('q caught', e.message));

async function f() {
  throw new Error('async throw');
}
const r = f();
console.log('f returned a promise?', r instanceof Promise);
r.catch((e) => console.log('r caught', e.message));
console.log('C');
\`\`\``,
      hints: [
        `The function you pass to \`new Promise\` (the executor) runs synchronously, right away.`,
        `After the first \`resolve\` or \`reject\`, the promise is "settled". What happens to later calls?`,
      ],
      solution: `**Output:**

\`\`\`text
A
B
f returned a promise? true
C
then first
q caught boom
r caught async throw
\`\`\`

**Why:**

- The executor runs immediately, so \`A\` prints during the synchronous part.
- \`resolve('first')\` settles the promise. It does **not** stop the function, so \`B\` still prints.
- Later \`reject(...)\`, \`resolve('second')\` and even \`throw\` are **ignored**. A promise can only settle once. No error appears anywhere.
- \`q\` throws **before** settling, so the throw becomes a rejection, which \`catch\` handles.
- An \`async\` function never throws synchronously. The error becomes a rejected promise, so \`f()\` returns a promise and the code continues to \`C\`.
- After the synchronous code, the microtasks run in the order they were registered: \`then first\`, \`q caught boom\`, \`r caught async throw\`. The \`.catch\` after \`p.then(...)\` never runs because nothing failed.

**Tip:** write \`return resolve(x)\` or \`return reject(err)\` when you want to stop the executor at that point.`,
      followUps: [
        {
          q: `What happens if you never call resolve or reject?`,
          a: `The promise stays pending forever. Any \`await\` on it waits forever, and its \`.then\` callbacks never run. This is a common bug when an error path in a callback-based API forgets to call \`reject\`.`,
        },
        {
          q: `Is an error thrown inside a setTimeout in the executor caught?`,
          a: `No. That callback runs later, outside the executor, so the throw becomes an uncaught exception. Call \`reject(err)\` inside the timer instead.`,
        },
      ],
    },
    {
      id: 'try-finally-return-values',
      title: 'try/finally — which value is really returned?',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'async-error-handling',
      question: `What does this print?

\`\`\`javascript
function a() {
  let x = 1;
  try {
    return x;
  } finally {
    x = 2;
  }
}

function b() {
  const obj = { v: 1 };
  try {
    return obj;
  } finally {
    obj.v = 2;
  }
}

function c() {
  for (let i = 0; i < 3; i++) {
    try {
      if (i === 1) return 'returned at ' + i;
    } finally {
      if (i === 1) continue;
    }
  }
  return 'loop finished';
}

function d() {
  try {
    throw new Error('boom');
  } finally {
    return 'finally swallowed it';
  }
}

console.log(a());
console.log(b());
console.log(c());
console.log(d());
\`\`\``,
      hints: [
        `When \`return x\` runs, the value is calculated **before** \`finally\` runs. Can \`finally\` change that saved value?`,
        `A \`return\`, \`continue\`, \`break\` or \`throw\` inside \`finally\` replaces whatever was pending (a return or an error).`,
      ],
      solution: `**Output:**

\`\`\`text
1
{ v: 2 }
loop finished
finally swallowed it
\`\`\`

**Why:**

- \`a()\`: \`return x\` saves the value \`1\` first. Then \`finally\` sets \`x = 2\`, but the saved return value is already \`1\`. Primitives are copied.
- \`b()\`: the saved return value is a **reference** to \`obj\`. \`finally\` mutates the same object, so the caller sees \`{ v: 2 }\`.
- \`c()\`: at \`i === 1\`, \`return\` is pending, but \`continue\` inside \`finally\` **cancels** it. The loop continues to the end and returns \`'loop finished'\`.
- \`d()\`: the error is pending, but \`return\` in \`finally\` replaces it. The error is **silently lost**.

**Lesson:** never use \`return\`, \`break\`, \`continue\` or \`throw\` inside \`finally\`. ESLint's \`no-unsafe-finally\` rule catches this. Use \`finally\` only for cleanup (close a connection, hide a spinner, release a lock).`,
      followUps: [
        {
          q: `Does finally run if the try block returns?`,
          a: `Yes. \`finally\` always runs after \`try\` (and \`catch\`), whether they returned, threw, or finished normally. The only exceptions are things like the process being killed.`,
        },
        {
          q: `Where do you use finally in React code?`,
          a: `To reset loading state: \`try { setLoading(true); await save(); } catch (e) { setError(e); } finally { setLoading(false); }\`.`,
        },
      ],
    },
    {
      id: 'promise-finally-return-values',
      title: 'What can Promise.prototype.finally change?',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'promise-chaining',
      question: `What does this print?

\`\`\`javascript
async function show(label, promise) {
  try {
    console.log(label, 'value:', await promise);
  } catch (e) {
    console.log(label, 'error:', e);
  }
}

(async () => {
  await show('A', Promise.resolve(1).finally(() => 2));
  await show('B', Promise.reject('R').finally(() => 'ignored'));
  await show('C', Promise.resolve(1).finally(() => { throw 'F'; }));
  await show('D', Promise.resolve(1).finally(() => Promise.reject('P')));
  const start = Date.now();
  await show('E', Promise.resolve(1).finally(() => new Promise((r) => setTimeout(() => r(99), 100))));
  console.log('E waited?', Date.now() - start >= 90);
})();
\`\`\``,
      hints: [
        `The value **returned** from a \`finally\` callback is normally ignored. The original value or error passes through.`,
        `But there are two ways for \`finally\` to change the outcome: throwing, or returning a promise that rejects.`,
        `If \`finally\` returns a promise that **fulfills**, the chain waits for it, then still passes the original value.`,
      ],
      solution: `**Output:**

\`\`\`text
A value: 1
B error: R
C error: F
D error: P
E value: 1
E waited? true
\`\`\`

**Why:**

- **A:** \`finally(() => 2)\` — the \`2\` is ignored; the original \`1\` passes through.
- **B:** the original rejection \`R\` passes through; \`'ignored'\` is really ignored.
- **C:** throwing inside \`finally\` **replaces** the result with that error (\`F\`).
- **D:** returning a **rejected** promise also replaces the result (\`P\`).
- **E:** returning a pending promise makes the chain **wait** (about 100 ms), but the original value \`1\` is kept, not \`99\`.

So \`finally\` is for cleanup that does not care about the result. It cannot change a success value, but it **can** turn success into failure.`,
      followUps: [
        {
          q: `Does the finally callback receive the value or the error?`,
          a: `No. It gets no arguments, because it runs in both cases. If you need the value, use \`.then\` (and \`.catch\` for errors).`,
        },
        {
          q: `How is this different from finally in try/catch?`,
          a: `In a sync \`try/finally\`, a \`return\` inside \`finally\` overrides the result. In \`Promise.finally\`, a normal return value is ignored; only a throw or a rejected promise overrides it.`,
        },
      ],
    },
    {
      id: 'generator-return-finally',
      title: 'Generators with finally, break and return()',
      difficulty: 'medium',
      type: 'output',
      frequency: 'occasional',
      relatedTopic: 'classic-one-liners',
      question: `What does this print?

\`\`\`javascript
function* gen() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log('cleanup');
  }
}

console.log([...gen()]);

for (const v of gen()) {
  console.log(v);
  if (v === 2) break;
}

const g = gen();
console.log(g.next());
console.log(g.return(42));
console.log(g.next());

function* withReturn() {
  yield 'a';
  return 'b';
}
console.log([...withReturn()]);
\`\`\``,
      hints: [
        `\`for...of\` and spread call \`next()\` until \`done\` is \`true\`. What happens to the generator when a \`for...of\` loop exits early with \`break\`?`,
        `\`g.return(value)\` finishes a paused generator — but its \`finally\` block still runs first.`,
        `Spread and \`for...of\` ignore the value that comes with \`done: true\`.`,
      ],
      solution: `**Output:**

\`\`\`text
cleanup
[ 1, 2, 3 ]
1
2
cleanup
{ value: 1, done: false }
cleanup
{ value: 42, done: true }
{ value: undefined, done: true }
[ 'a' ]
\`\`\`

**Why:**

- \`[...gen()]\` runs the generator to the end. When it finishes, \`finally\` logs \`cleanup\`. Only **then** is the array complete and printed.
- \`for...of\` prints \`1\` and \`2\`. \`break\` makes the loop call the iterator's \`return()\` method, so the generator is closed and \`finally\` still runs: \`cleanup\`. This is how generators clean up resources (like closing a file) even when the consumer stops early.
- \`g.next()\` gives \`{ value: 1, done: false }\`. \`g.return(42)\` resumes the generator as if \`return 42\` were written at the paused \`yield\`, so \`finally\` runs (\`cleanup\`) and the result is \`{ value: 42, done: true }\`.
- After a generator is done, every \`next()\` returns \`{ value: undefined, done: true }\`.
- \`return 'b'\` gives \`{ value: 'b', done: true }\`. Spread stops at \`done: true\` and **ignores** that value, so the array is \`['a']\`.`,
      followUps: [
        {
          q: `How is a generator's return value used then?`,
          a: `\`yield*\` gives it back: \`const result = yield* inner();\` receives the inner generator's \`return\` value. You can also read it from the last \`next()\` call manually.`,
        },
        {
          q: `What does g.throw(err) do?`,
          a: `It resumes the generator by throwing \`err\` at the paused \`yield\`. If the generator has a \`try/catch\` around that \`yield\`, it can catch it and continue; otherwise the generator closes and the error comes out of \`g.throw()\`.`,
        },
      ],
    },
    {
      id: 'class-fields-init-order',
      title: 'Class fields, super() and overridden methods',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'prototypes-classes',
      question: `What does this print?

\`\`\`javascript
class Base {
  name = 'base';
  constructor() {
    console.log('Base sees:', this.name, '|', this.describe());
  }
  describe() {
    return 'Base.describe';
  }
}

class Child extends Base {
  name = 'child';
  extra = 'extra';
  constructor() {
    super();
    console.log('Child sees:', this.name, '|', this.describe());
  }
  describe() {
    return 'Child.describe with ' + this.extra;
  }
}

new Child();

class A {
  greet = () => 'field';
  greet() {
    return 'method';
  }
}
const a = new A();
console.log(a.greet(), A.prototype.greet.call(a));
console.log(Object.hasOwn(a, 'greet'));
\`\`\``,
      hints: [
        `In a child class, when are the child's class fields created: before or after \`super()\` returns?`,
        `Inside the \`Base\` constructor, \`this\` is already the \`Child\` instance. Which \`describe\` does \`this.describe()\` find?`,
        `Class fields are **own properties** of the instance; methods live on the **prototype**. Which one is found first?`,
      ],
      solution: `**Output:**

\`\`\`text
Base sees: base | Child.describe with undefined
Child sees: child | Child.describe with extra
field method
true
\`\`\`

**Why:**

1. \`new Child()\` calls \`Child\`'s constructor, which must call \`super()\` first.
2. Inside \`Base\`, the **Base fields** are set first (\`name = 'base'\`), then the Base constructor body runs. The **Child fields do not exist yet**.
3. \`this.describe()\` looks up the prototype chain of the instance, which starts at \`Child.prototype\`, so \`Child.describe\` runs. But \`this.extra\` is still \`undefined\`.
4. When \`super()\` returns, the Child fields are created: \`name = 'child'\`, \`extra = 'extra'\`. Now everything is set.

For class \`A\`: the arrow field \`greet\` is an **own property** of \`a\`. The method \`greet\` sits on \`A.prototype\`. Own properties win, so \`a.greet()\` returns \`'field'\`. The method still exists and can be called with \`A.prototype.greet.call(a)\`.

**Lesson:** do not call overridable methods from a parent constructor; the child is not fully built yet. Also avoid giving a field and a method the same name.`,
      followUps: [
        {
          q: `Why do people use arrow functions as class fields?`,
          a: `An arrow field captures \`this\` when the instance is created, so you can pass \`this.handleClick\` as a callback without \`bind\`. The cost: every instance gets its own copy of the function (more memory), and it cannot be called with \`super.method()\` from a subclass.`,
        },
        {
          q: `What is the difference between a #private field and a normal field?`,
          a: `A \`#field\` can only be read inside the class body. It is not visible to \`Object.keys\`, \`JSON.stringify\` or outside code, and reading it on the wrong object throws a TypeError.`,
        },
      ],
    },
    {
      id: 'getters-in-spread-and-assign',
      title: 'Class getters, spread copies and Object.assign setters',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'destructuring-spread-getters',
      question: `What does this print (in Node)?

\`\`\`javascript
class User {
  first = 'Asha';
  last = 'Rao';
  get full() {
    return this.first + ' ' + this.last;
  }
}
const u = new User();
console.log(u.full);
console.log({ ...u });
console.log(JSON.stringify(u));

const plain = {
  get full() {
    return 'Ravi K';
  },
};
const copy = { ...plain };
console.log(Object.getOwnPropertyDescriptor(copy, 'full'));

const target = {
  set name(v) {
    console.log('setter got', v);
  },
};
Object.assign(target, { name: 'A' });
const merged = { ...target, ...{ name: 'B' } };
console.log(merged.name);
\`\`\``,
      hints: [
        `Spread and \`JSON.stringify\` only copy **own, enumerable** properties. Where does a class getter live?`,
        `When spread copies an object literal getter, does the copy get a getter or a plain value?`,
        `\`Object.assign\` **assigns** (it triggers setters on the target). Spread **defines** new properties on a new object.`,
      ],
      solution: `**Output:**

\`\`\`text
Asha Rao
{ first: 'Asha', last: 'Rao' }
{"first":"Asha","last":"Rao"}
{
  value: 'Ravi K',
  writable: true,
  enumerable: true,
  configurable: true
}
setter got A
B
\`\`\`

**Why:**

- \`u.full\` runs the getter: \`'Asha Rao'\`.
- A class getter lives on \`User.prototype\`, not on the instance. Spread and \`JSON.stringify\` copy only own enumerable properties, so \`full\` is **missing** in both.
- For an object literal, the getter **is** an own property. Spread **calls** it once and stores the result as a normal data property (\`value: 'Ravi K'\`). The copy no longer has a getter; it will not update later.
- \`Object.assign(target, source)\` does \`target.name = 'A'\`, so the **setter runs**: \`setter got A\`.
- Spread builds a brand-new object and **defines** properties on it, so no setter runs. \`target\`'s \`name\` has only a setter, so reading it gives \`undefined\`, and then \`name: 'B'\` overwrites it. Result: \`B\`.

**Real-life impact:** spreading a class instance (for example a Mongoose document or a class-based model) into React state loses its getters and methods. Convert to a plain object on purpose (for example \`doc.toObject()\` in Mongoose) or keep the instance.`,
      followUps: [
        {
          q: `How do you copy an object including its getters and setters?`,
          a: `\`Object.defineProperties({}, Object.getOwnPropertyDescriptors(obj))\` copies the descriptors themselves. To keep the prototype too: \`Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))\`.`,
        },
        {
          q: `How do you make a class getter show up in JSON?`,
          a: `Add a \`toJSON()\` method: \`toJSON() { return { ...this, full: this.full }; }\`. \`JSON.stringify\` calls it automatically.`,
        },
      ],
    },
    {
      id: 'this-across-event-loop',
      title: 'Losing this across timers, promises and await',
      difficulty: 'medium',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'this-puzzles',
      question: `What does this print?

\`\`\`javascript
const counter = {
  count: 0,
  inc() {
    if (this !== counter) return console.log('lost this');
    this.count += 1;
    console.log('inc ->', this.count);
  },
  async later() {
    await null;
    this.inc();
  },
};

setTimeout(counter.inc, 0);
setTimeout(() => counter.inc(), 0);
Promise.resolve().then(counter.inc);
counter.later();
queueMicrotask(() => counter.inc());
counter.inc();
\`\`\``,
      hints: [
        `First list what runs synchronously, then microtasks (promise callbacks, \`await\` continuations, \`queueMicrotask\`), then timers.`,
        `\`this\` depends on **how** a function is called. \`setTimeout(counter.inc)\` and \`.then(counter.inc)\` pass the function without the object.`,
        `Inside an \`async\` method, \`this\` stays the same after \`await\`.`,
      ],
      solution: `**Output:**

\`\`\`text
inc -> 1
lost this
inc -> 2
inc -> 3
lost this
inc -> 4
\`\`\`

**Why, step by step:**

1. **Sync:** two timers are scheduled. \`.then(counter.inc)\` queues microtask #1. \`counter.later()\` starts and pauses at \`await null\` (queues microtask #2). \`queueMicrotask\` queues #3. Then \`counter.inc()\` runs as a method: \`inc -> 1\`.
2. **Microtask #1:** the promise calls \`inc\` as a plain function. \`this\` is \`undefined\` (or the global object in sloppy mode), not \`counter\`: \`lost this\`.
3. **Microtask #2:** \`later\` resumes. \`await\` keeps the same \`this\`, so \`this.inc()\` works: \`inc -> 2\`.
4. **Microtask #3:** the arrow calls \`counter.inc()\` as a method: \`inc -> 3\`.
5. **Timer 1:** \`setTimeout(counter.inc)\` calls it without the object (Node passes a Timeout object as \`this\`, browsers pass \`window\`): \`lost this\`.
6. **Timer 2:** the arrow calls \`counter.inc()\`: \`inc -> 4\`.

The code checks \`this !== counter\` before touching \`this.count\`, so the output is the same in Node, browsers and strict mode.

**Fix:** pass \`counter.inc.bind(counter)\` or an arrow \`() => counter.inc()\`.`,
      followUps: [
        {
          q: `Why do React class components need bind in the constructor?`,
          a: `Because \`onClick={this.handleClick}\` passes the method without the instance, exactly like \`setTimeout(counter.inc)\`. Binding in the constructor or using an arrow class field fixes \`this\`.`,
        },
        {
          q: `Does an arrow function method on an object literal fix this?`,
          a: `No. An arrow takes \`this\` from the surrounding scope where the object literal is written (often the module), not the object. Use a normal method plus \`bind\`, or call it through the object.`,
        },
      ],
    },
    {
      id: 'symbol-toprimitive-hints',
      title: 'Symbol.toPrimitive, valueOf and toString hints',
      difficulty: 'medium',
      type: 'output',
      frequency: 'occasional',
      relatedTopic: 'coercion-equality',
      question: `What does this print?

\`\`\`javascript
const price = {
  amount: 50,
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    return hint === 'string' ? 'Rs 50' : this.amount;
  },
};
console.log(\`\${price}\`);
console.log(price + 10);
console.log(price * 2);
console.log(price == 50);

const box = {
  valueOf() {
    return 42;
  },
  toString() {
    return 'box';
  },
};
console.log(box + 1, \`\${box}\`, box + '', String(box));
\`\`\``,
      hints: [
        `When an object must become a primitive, JavaScript passes a **hint**: \`'string'\`, \`'number'\` or \`'default'\`. Which operation uses which hint?`,
        `Without \`Symbol.toPrimitive\`: for the \`'string'\` hint, \`toString()\` is tried first; for \`'number'\` and \`'default'\`, \`valueOf()\` is tried first.`,
      ],
      solution: `**Output:**

\`\`\`text
hint: string
Rs 50
hint: default
60
hint: number
100
hint: default
true
43 box 42 box
\`\`\`

**Why:**

- The template literal with \`\${price}\` wants a string: hint \`'string'\` → \`'Rs 50'\`.
- \`price + 10\`: \`+\` can mean "add" or "join strings", so the hint is \`'default'\` → \`50\`, then \`50 + 10 = 60\`.
- \`price * 2\`: \`*\` only works on numbers: hint \`'number'\` → \`100\`.
- \`price == 50\`: loose equality uses \`'default'\` → \`50 == 50\` is \`true\`.
- \`box\` has no \`Symbol.toPrimitive\`, so \`valueOf\`/\`toString\` are used. \`box + 1\` → default hint → \`valueOf()\` → \`42 + 1 = 43\`.
- The template literal with \`\${box}\` → string hint → \`toString()\` → \`'box'\`.
- \`box + ''\` → default hint → \`valueOf()\` → \`42\`, then joined: \`'42'\`. Many people expect \`'box'\` here.
- \`String(box)\` → string hint → \`'box'\`.

**Real-life note:** \`Date\` is special: its default hint behaves like \`'string'\`, so \`new Date() + 1\` gives a long date string with \`1\` at the end, while \`new Date() - 0\` gives the timestamp.`,
      followUps: [
        {
          q: `Where does Symbol.toPrimitive help in real code?`,
          a: `For value objects like \`Money\` or \`Duration\`, so they print nicely in templates and still work in math. In most app code, an explicit method like \`money.format()\` is clearer.`,
        },
        {
          q: `What does [1, 2] + [3] give, and why?`,
          a: `\`'1,23'\`. Arrays have no useful \`valueOf\`, so \`toString()\` is used: \`'1,2' + '3'\`.`,
        },
      ],
    },
    {
      id: 'default-params-and-closure-counters',
      title: 'Default parameters and closure counters',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'scope-shadowing',
      question: `What does this print?

\`\`\`javascript
function addItem(item, list = []) {
  list.push(item);
  return list;
}
console.log(addItem('a'), addItem('b'));

let calls = 0;
function nextId(id = ++calls) {
  return id;
}
console.log(nextId(), nextId(), nextId(10), nextId());

function makeCounter() {
  let n = 0;
  return {
    inc: () => ++n,
    get value() {
      return n;
    },
  };
}
const c1 = makeCounter();
const c2 = makeCounter();
c1.inc();
c1.inc();
c2.inc();
console.log(c1.value, c2.value);

const { inc, value } = c1;
inc();
console.log(value, c1.value);
\`\`\``,
      hints: [
        `In JavaScript, a default parameter expression is evaluated **every time** the function is called without that argument (this is different from Python).`,
        `Each call to \`makeCounter()\` creates a new \`n\`. And destructuring a getter reads its value **once**.`,
      ],
      solution: `**Output:**

\`\`\`text
[ 'a' ] [ 'b' ]
1 2 10 3
2 1
2 3
\`\`\`

**Why:**

- \`list = []\` creates a **new** array on every call, so the two calls do not share a list: \`['a']\` and \`['b']\`.
- \`id = ++calls\` only runs when the argument is missing. Calls 1, 2 and 4 use it (1, 2, 3); call 3 passes \`10\`, so \`++calls\` is skipped.
- Each \`makeCounter()\` call has its own \`n\` (its own closure). \`c1\` was increased twice, \`c2\` once: \`2 1\`.
- \`const { inc, value } = c1\` **reads** the getter once and copies the number \`2\` into \`value\`. \`inc\` is an arrow that still points to the same \`n\`, so calling it makes \`n\` 3. \`value\` stays a snapshot (\`2\`), but \`c1.value\` reads the live value (\`3\`).

**React link:** this snapshot idea is the same reason a stale closure in \`useEffect\` sees an old state value.`,
      followUps: [
        {
          q: `Can a default parameter use an earlier parameter?`,
          a: `Yes: \`function range(start, end = start + 10) {}\`. Parameters are evaluated left to right, so a default can use anything to its left, but not to its right (that is a TDZ ReferenceError).`,
        },
        {
          q: `Does passing null use the default?`,
          a: `No. Only \`undefined\` (or a missing argument) triggers the default. \`f(null)\` gives \`null\`.`,
        },
      ],
    },
    {
      id: 'map-set-key-equality',
      title: 'Object keys vs Map keys vs Set equality',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'objects-references',
      question: `What does this print?

\`\`\`javascript
const obj = {};
obj[1] = 'number';
obj['1'] = 'string';
console.log(Object.keys(obj).length, obj[1]);

const map = new Map();
map.set(1, 'number');
map.set('1', 'string');
console.log(map.size, map.get(1));

const key = { id: 1 };
map.set(key, 'object');
console.log(map.get({ id: 1 }), map.get(key));

const set = new Set([NaN, NaN, 0, -0, '0', {}, {}]);
console.log(set.size);

console.log(NaN === NaN, Object.is(NaN, NaN), Object.is(0, -0));
\`\`\``,
      hints: [
        `Plain object keys are always strings (or Symbols). Map keys keep their real type.`,
        `Map and Set compare keys with "SameValueZero": like \`===\`, but \`NaN\` equals \`NaN\`. Objects are compared by reference.`,
      ],
      solution: `**Output:**

\`\`\`text
1 string
2 number
undefined object
5
false true false
\`\`\`

**Why:**

- \`obj[1]\` and \`obj['1']\` are the **same key** because the number is turned into the string \`'1'\`. The second write overwrites the first: one key, value \`'string'\`.
- A \`Map\` keeps \`1\` and \`'1'\` as **different** keys: size \`2\`, \`get(1)\` is \`'number'\`.
- \`{ id: 1 }\` written twice creates two different objects. \`map.get\` compares by **reference**, so only the exact \`key\` object works.
- In the \`Set\`: \`NaN\` and \`NaN\` count as one value, \`0\` and \`-0\` count as one value, \`'0'\` is a string (different), and the two \`{}\` are different objects. Total: \`NaN, 0, '0', {}, {}\` = **5**.
- \`NaN === NaN\` is \`false\`. \`Object.is\` fixes NaN (\`true\`) but separates \`0\` and \`-0\` (\`false\`).

**Real-life impact:** to remove duplicate objects from an array, a \`Set\` will not help. Deduplicate by a key instead: \`[...new Map(users.map((u) => [u.id, u])).values()]\`.`,
      followUps: [
        {
          q: `When would you choose a Map over a plain object?`,
          a: `When keys are not strings (objects, numbers you want kept as numbers), when you add and remove keys often, when you need \`size\`, or when insertion order must be kept for all keys.`,
        },
        {
          q: `What is a WeakMap for?`,
          a: `A WeakMap only accepts object keys and does not keep them alive. When the key object is garbage collected, the entry disappears. It is good for caching data about objects (like DOM nodes) without memory leaks.`,
        },
      ],
    },
    {
      id: 'implement-promise-any',
      title: 'Implement Promise.any',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'implement-promise-all',
      question: `Write \`promiseAny(items)\` that behaves like \`Promise.any\`:

- It resolves with the value of the **first promise that fulfills**.
- Rejections are ignored **unless every** promise rejects. Then it rejects with an \`AggregateError\` whose \`errors\` array holds all reasons **in input order**.
- An empty input rejects right away with an \`AggregateError\`.
- Plain values count as already-fulfilled promises.

\`\`\`javascript
await promiseAny([delay(30, 'slow'), delay(10, 'fast'), failAfter(5)]); // 'fast'
await promiseAny([Promise.reject(1), 42]);                              // 42
\`\`\``,
      hints: [
        `It is the mirror image of \`Promise.all\`: one success is enough, but you need **all** failures to fail.`,
        `Wrap every item with \`Promise.resolve(item)\`. Pass \`resolve\` directly as the success handler; a promise ignores every resolve after the first.`,
        `Count failures and store each error at its index. When the count equals the input length, reject with \`new AggregateError(errors, message)\`.`,
      ],
      solution: `**Idea:** subscribe to every item. The first success calls \`resolve\`. Each failure is stored by index; when all items have failed, reject with all the errors together.

\`\`\`javascript
function promiseAny(items) {
  return new Promise((resolve, reject) => {
    const list = Array.from(items);
    const errors = new Array(list.length);
    let failed = 0;

    if (list.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    list.forEach((item, i) => {
      Promise.resolve(item).then(
        resolve, // first success wins; later calls to resolve are ignored
        (err) => {
          errors[i] = err; // keep errors in input order
          failed++;
          if (failed === list.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
}

const delay = (ms, v, fail) => new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error(v)) : res(v)), ms));
(async () => {
  console.log(await promiseAny([delay(30, 'slow'), delay(10, 'fast'), delay(5, 'x', true)]));
  try {
    await promiseAny([delay(20, 'e1', true), Promise.reject(new Error('e2'))]);
  } catch (e) {
    console.log(e.constructor.name, e.message, e.errors.map((x) => x.message));
  }
  try {
    await promiseAny([]);
  } catch (e) {
    console.log(e.constructor.name, e.errors.length);
  }
  console.log(await promiseAny([Promise.reject(1), 42]));
})();
\`\`\`

**Output:**

\`\`\`text
fast
AggregateError All promises were rejected [ 'e1', 'e2' ]
AggregateError 0
42
\`\`\`

**Why it works:** a promise can settle only once, so after the first \`resolve\` all later successes and failures are ignored automatically. We use a \`failed\` counter instead of \`errors.length\`, because writing \`errors[2]\` before \`errors[0]\` would make the length look complete too early. \`Array.from(items)\` lets us accept any iterable, like a \`Set\`.

**Complexity:** O(n) setup; it settles as soon as the first success (or the last failure) arrives.`,
      followUps: [
        {
          q: `Promise.any vs Promise.race?`,
          a: `\`race\` settles with the **first settled** promise, success or failure. \`any\` waits for the **first success** and only fails if everything fails. Use \`any\` for "try several mirrors, use whichever answers"; use \`race\` for timeouts.`,
        },
        {
          q: `What is AggregateError?`,
          a: `A built-in Error subclass that holds many errors in its \`errors\` array. \`Promise.any\` uses it so you can see why each attempt failed.`,
        },
      ],
    },
    {
      id: 'implement-async-pipe',
      title: 'pipe / compose that works with async functions',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'promise-chaining',
      question: `\`pipe(f, g, h)(x)\` means \`h(g(f(x)))\`: the output of one function is the input of the next. Write \`pipeAsync(...fns)\` where any function may be **async**. It returns a function that returns a Promise of the final result. Also write \`composeAsync\`, which runs right to left.

\`\`\`javascript
const fetchUser = async (id) => ({ id, name: 'asha' });
const addRole = (user) => ({ ...user, role: 'admin' });          // sync
const upperName = async (user) => ({ ...user, name: user.name.toUpperCase() });

await pipeAsync(fetchUser, addRole, upperName)(7);
// { id: 7, name: 'ASHA', role: 'admin' }
\`\`\`

If any step throws or rejects, the returned promise must reject.`,
      hints: [
        `A sync pipe is \`fns.reduce((value, fn) => fn(value), input)\`. What if \`value\` might be a promise?`,
        `Start the reduce with \`Promise.resolve(input)\` and chain with \`.then(fn)\`. \`.then\` waits for promises and also accepts plain return values.`,
        `Compose is just pipe with the functions in reverse order.`,
      ],
      solution: `**Idea:** turn the list of functions into one promise chain. \`.then(fn)\` waits for the previous step, calls \`fn\`, and works for both sync and async \`fn\`.

\`\`\`javascript
function pipeAsync(...fns) {
  return (input) =>
    fns.reduce(
      (promise, fn) => promise.then(fn), // wait for the previous result, then call the next fn
      Promise.resolve(input)
    );
}
const composeAsync = (...fns) => pipeAsync(...fns.reverse());

// a version with async/await (same behaviour)
function pipeAsync2(...fns) {
  return async (input) => {
    let value = input;
    for (const fn of fns) value = await fn(value);
    return value;
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fetchUser = async (id) => { await sleep(10); return { id, name: 'asha' }; };
const addRole = (user) => ({ ...user, role: 'admin' });
const upperName = async (user) => ({ ...user, name: user.name.toUpperCase() });

(async () => {
  console.log(await pipeAsync(fetchUser, addRole, upperName)(7));
  console.log(await composeAsync(upperName, addRole, fetchUser)(8));
  console.log(await pipeAsync2(fetchUser, addRole)(9));
  console.log(await pipeAsync()(5));
  try {
    await pipeAsync(fetchUser, () => { throw new Error('step failed'); }, addRole)(1);
  } catch (e) { console.log('caught:', e.message); }
})();
\`\`\`

**Output:**

\`\`\`text
{ id: 7, name: 'ASHA', role: 'admin' }
{ id: 8, name: 'ASHA', role: 'admin' }
{ id: 9, name: 'asha', role: 'admin' }
5
caught: step failed
\`\`\`

**Why it works:** \`promise.then(fn)\` calls \`fn\` with the resolved value, and if \`fn\` returns a promise, the chain waits for it. A sync throw inside \`fn\` becomes a rejection, and a rejection skips all later \`.then\` steps, so the caller's \`catch\` sees it. With no functions, the result is just the input.

**Complexity:** O(n) steps; the steps run one after another (they depend on each other, so they cannot run in parallel).`,
      followUps: [
        {
          q: `Where is pipe useful in a MERN app?`,
          a: `In data pipelines and request handling: \`pipeAsync(validate, normalize, saveToDb, toResponseDto)(body)\`. Each small step is easy to test alone.`,
        },
        {
          q: `Why does composeAsync not mutate the caller's array when using reverse()?`,
          a: `\`...fns\` (rest parameters) always creates a fresh array for each call, so \`reverse()\` only changes our own copy. With a passed-in array you should use \`[...fns].reverse()\` or \`toReversed()\`.`,
        },
      ],
    },
    {
      id: 'implement-deep-equal',
      title: 'Implement deepEqual',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'implement-deep-clone',
      question: `Write \`deepEqual(a, b)\` that returns \`true\` when two values have the **same content**, even if they are different objects.

\`\`\`javascript
deepEqual({ a: 1, b: [1, 2, { c: 3 }] }, { b: [1, 2, { c: 3 }], a: 1 }); // true (key order does not matter)
deepEqual({ a: 1 }, { a: 1, b: undefined });                          // false (different keys)
deepEqual([1, 2], { 0: 1, 1: 2, length: 2 });                          // false (array vs object)
deepEqual(NaN, NaN);                                                    // true
deepEqual(new Date(5), new Date(5));                                    // true
\`\`\`

Also handle \`Map\`, nested arrays and circular references without crashing.`,
      hints: [
        `Handle the easy cases first: identical values, then "one of them is not an object" (then they must differ).`,
        `Compare prototypes so \`[]\` is not equal to \`{}\`. Then compare the list of own keys and recurse into each value.`,
        `For circular references, remember which pairs \`(a, b)\` you are already comparing (a \`WeakMap\`). If you see the pair again, return \`true\` for that branch.`,
      ],
      solution: `**Idea:** check primitives and special objects first, then compare keys and recurse. A \`WeakMap\` remembers pairs in progress to stop infinite loops on circular data.

\`\`\`javascript
function deepEqual(a, b, seen = new WeakMap()) {
  // same primitive or same reference; also treat NaN as equal to NaN
  if (a === b || (Number.isNaN(a) && Number.isNaN(b))) return true;

  // anything that is not a non-null object must have matched above
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false; // [] vs {}, Date vs {}

  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.toString() === b.toString();

  // circular references: if we are already comparing a with b, assume equal
  if (seen.get(a) === b) return true;
  seen.set(a, b);

  if (a instanceof Map || a instanceof Set) {
    if (a.size !== b.size) return false;
    if (a instanceof Set) {
      for (const v of a) if (!b.has(v)) return false; // primitives / same refs only
      return true;
    }
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;
    }
    return true;
  }

  const keysA = Reflect.ownKeys(a); // strings + symbols (+ 'length' for arrays)
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key], seen)) return false;
  }
  return true;
}

console.log(deepEqual({ a: 1, b: [1, 2, { c: 3 }] }, { b: [1, 2, { c: 3 }], a: 1 }));
console.log(deepEqual({ a: 1 }, { a: 1, b: undefined }));
console.log(deepEqual([1, 2], { 0: 1, 1: 2, length: 2 }));
console.log(deepEqual(NaN, NaN), deepEqual(0, -0));
console.log(deepEqual(new Date(5), new Date(5)), deepEqual(new Date(5), new Date(6)));
console.log(deepEqual(new Map([['x', { y: 1 }]]), new Map([['x', { y: 1 }]])));
const x = { name: 'x' }; x.self = x;
const y = { name: 'x' }; y.self = y;
console.log(deepEqual(x, y));
console.log(deepEqual([1, [2]], [1, [3]]));
console.log(deepEqual(null, {}), deepEqual(null, null));
\`\`\`

**Output:**

\`\`\`text
true
false
false
true true
true false
true
true
false
false true
\`\`\`

**Why it works:**

- \`a === b\` covers equal primitives and the same reference. NaN is the only value not equal to itself, so we check it separately. With \`===\`, \`0\` and \`-0\` are equal (like lodash \`isEqual\`).
- Different prototypes means different kinds (array vs object, Date vs object).
- Dates compare by time, RegExps by their source and flags.
- \`Reflect.ownKeys\` includes Symbol keys too. Same key count + every key of \`a\` exists in \`b\` + every value equal ⇒ equal.
- The \`seen\` WeakMap breaks cycles: when \`x.self\` leads back to \`x\`, we find the pair already in progress.

**Limitation:** Set members are compared with \`has\`, so a Set of objects only matches when they are the same references.

**Complexity:** O(total number of properties).`,
      followUps: [
        {
          q: `Why does React not use deep equality to decide re-renders?`,
          a: `It is too slow on big trees. React compares with \`Object.is\` (reference equality). That is why you must create new objects/arrays when state changes, and why \`React.memo\` does only a shallow compare.`,
        },
        {
          q: `What is a shallow equal and when do you use it?`,
          a: `It compares only the first level of keys with \`Object.is\`. It is cheap and is used by \`React.memo\`, \`PureComponent\` and many selectors.`,
        },
      ],
    },
    {
      id: 'implement-mini-store',
      title: 'Build a mini Redux-style store with subscribe/unsubscribe',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'implement-event-emitter',
      question: `Write \`createStore(reducer, initialState)\` that returns \`{ getState, dispatch, subscribe }\`:

- \`dispatch(action)\` computes the next state with \`reducer(state, action)\`.
- Listeners are called with \`(newState, prevState)\` **only when the state object actually changed**.
- \`subscribe(listener)\` returns an \`unsubscribe\` function. Calling it twice must be safe, and a listener must be able to unsubscribe **while** listeners are being called.

\`\`\`javascript
const store = createStore(counter, { count: 0 });
const unsub = store.subscribe((s) => console.log('count is', s.count));
store.dispatch({ type: 'inc' }); // count is 1
unsub();
store.dispatch({ type: 'inc' }); // nothing printed
\`\`\``,
      hints: [
        `Keep \`state\` and a \`Set\` of listeners in a closure.`,
        `Compare the old and new state by reference (\`!==\`). That is how React and Redux know something changed.`,
        `Loop over a **copy** of the listeners (\`[...listeners]\`), so removing one during the loop is safe.`,
      ],
      solution: `**Idea:** a closure holds the current state and a set of listeners. \`dispatch\` runs the reducer and notifies listeners if the reference changed. \`subscribe\` returns a closure that removes exactly that listener.

\`\`\`javascript
function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = new Set();

  function getState() {
    return state;
  }

  function subscribe(listener) {
    listeners.add(listener);
    let active = true;
    return function unsubscribe() {
      if (!active) return; // calling twice is safe
      active = false;
      listeners.delete(listener);
    };
  }

  function dispatch(action) {
    const prev = state;
    state = reducer(state, action);
    if (state !== prev) {
      // copy, so listeners that (un)subscribe during the loop do not break it
      [...listeners].forEach((listener) => listener(state, prev));
    }
    return action;
  }

  return { getState, subscribe, dispatch };
}

function counter(state, action) {
  switch (action.type) {
    case 'inc': return { ...state, count: state.count + 1 };
    case 'noop': return state;
    default: return state;
  }
}

const store = createStore(counter, { count: 0 });
const unsubA = store.subscribe((s) => console.log('A sees', s.count));
const unsubB = store.subscribe((s) => {
  console.log('B sees', s.count);
  unsubB(); // B only wants the first change
});
store.dispatch({ type: 'inc' });
store.dispatch({ type: 'noop' });
store.dispatch({ type: 'inc' });
unsubA();
unsubA();
store.dispatch({ type: 'inc' });
console.log('final', store.getState().count);
\`\`\`

**Output:**

\`\`\`text
A sees 1
B sees 1
A sees 2
final 3
\`\`\`

**Why it works:** a \`Set\` gives O(1) add/remove and ignores duplicates. The \`active\` flag makes \`unsubscribe\` idempotent (safe to call many times). The \`noop\` action returns the same object, so no listener runs. B removes itself during the first notification, and because we loop over a copy, A is still called correctly.`,
      followUps: [
        {
          q: `How would you connect this store to React?`,
          a: `Use \`useSyncExternalStore(store.subscribe, store.getState)\`. React calls \`subscribe\` (and the returned unsubscribe on unmount) and re-renders when \`getState()\` returns a new reference.`,
        },
        {
          q: `How would you add middleware like logging?`,
          a: `Wrap dispatch: \`const next = store.dispatch; store.dispatch = (action) => { console.log('before', store.getState()); const r = next(action); console.log('after', store.getState()); return r; };\`. Redux formalises this as \`applyMiddleware\`.`,
        },
      ],
    },
    {
      id: 'implement-setinterval-with-settimeout',
      title: 'Implement setInterval using setTimeout (with clear)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'event-loop-order',
      question: `Write \`mySetInterval(fn, delay, ...args)\` using only \`setTimeout\`. It calls \`fn(...args)\` every \`delay\` ms and returns a \`clear()\` function that stops it. Calling \`clear()\` from **inside** \`fn\` must work.

\`\`\`javascript
let n = 0;
const stop = mySetInterval((label) => {
  n++;
  console.log(label, n);
  if (n === 3) stop();
}, 50, 'tick');
// tick 1, tick 2, tick 3 — then nothing more
\`\`\``,
      hints: [
        `A function that schedules itself again with \`setTimeout\` after each run is a "recursive setTimeout".`,
        `Store the current timer id in a variable outside, so \`clear()\` can cancel the **latest** scheduled timer.`,
        `If \`fn\` calls \`clear()\`, you must not schedule another tick after \`fn\` returns. Use a \`stopped\` flag.`,
      ],
      solution: `**Idea:** each tick runs \`fn\`, then schedules the next tick. \`clear()\` sets a flag and cancels the pending timer.

\`\`\`javascript
function mySetInterval(fn, delay, ...args) {
  let timerId = null;
  let stopped = false;

  function tick() {
    timerId = setTimeout(() => {
      if (stopped) return;
      fn(...args);
      if (!stopped) tick(); // schedule the next one only after this run finished
    }, delay);
  }
  tick();

  return function clear() {
    stopped = true;
    clearTimeout(timerId);
  };
}

let n = 0;
const start = Date.now();
const stop = mySetInterval((label) => {
  n++;
  console.log(label, n);
  if (n === 3) stop(); // can stop from inside the callback
}, 50, 'tick');
setTimeout(() => console.log('total ticks', n, 'elapsed ok?', Date.now() - start >= 150), 300);
\`\`\`

**Output:**

\`\`\`text
tick 1
tick 2
tick 3
total ticks 3 elapsed ok? true
\`\`\`

**Why it works:** \`timerId\` always holds the newest timeout, so \`clearTimeout(timerId)\` cancels the right one. When \`fn\` calls \`stop()\` during tick 3, the \`stopped\` flag prevents \`tick()\` from scheduling tick 4.

**Bonus — why this pattern is useful:** real \`setInterval\` fires every \`delay\` ms even if the previous run is still busy (for example an async poll that takes longer than the interval). Recursive \`setTimeout\` waits for one run to finish before counting the next delay, so calls never pile up.`,
      followUps: [
        {
          q: `How would you poll an API every 5 seconds safely?`,
          a: `Use recursive setTimeout with an async function: \`async function poll() { await fetchStatus(); if (!stopped) timer = setTimeout(poll, 5000); }\`. Requests never overlap, and you can stop in the cleanup of \`useEffect\`.`,
        },
        {
          q: `Is setTimeout(fn, 0) really 0 ms?`,
          a: `No. It runs after the current code and all microtasks finish, and browsers clamp nested timers to at least about 4 ms after a few levels. Background tabs throttle timers even more.`,
        },
      ],
    },
    {
      id: 'promise-resolve-thenable-ticks',
      title: 'Promise.resolve, thenables and extra ticks',
      difficulty: 'hard',
      type: 'output',
      frequency: 'occasional',
      relatedTopic: 'promise-chaining',
      question: `What does this print?

\`\`\`javascript
const p = Promise.resolve(1);
console.log(Promise.resolve(p) === p);
console.log(new Promise((r) => r(p)) === p);

new Promise((r) => r(p)).then(() => console.log('wrapped'));

p.then(() => console.log('direct 1'))
  .then(() => console.log('direct 2'))
  .then(() => console.log('direct 3'));

const thenable = {
  then(resolve) {
    console.log('then() called');
    resolve('T');
  },
};
Promise.resolve(thenable).then((v) => console.log('thenable gave', v));
console.log('sync end');
\`\`\``,
      hints: [
        `\`Promise.resolve(x)\` returns \`x\` itself when \`x\` is already a native promise. \`new Promise(r => r(x))\` always creates a new promise.`,
        `Resolving a promise **with another promise or thenable** is not instant. JavaScript schedules a job that calls \`x.then(...)\`. That costs extra microtask ticks.`,
        `A thenable's \`then\` method is called in a **microtask**, not synchronously.`,
      ],
      solution: `**Output:**

\`\`\`text
true
false
sync end
direct 1
then() called
direct 2
thenable gave T
wrapped
direct 3
\`\`\`

**Why:**

- \`Promise.resolve(p) === p\` is \`true\`: it returns the same native promise.
- \`new Promise((r) => r(p))\` is a **new** promise, so \`false\`.
- \`then() called\` does not print during sync code. Both "resolve with a thenable" cases schedule a job.

Now the microtask queue, tick by tick:

1. **Tick 1:** the important jobs are \`[job: wrapped adopts p, direct 1, job: call thenable.then]\`. (The promise created on line 3 also schedules an "adopt p" job, but nobody listens to it, so it prints nothing.)
   - The first job calls \`p.then(...)\`; \`p\` is already fulfilled, so it queues "fulfill wrapped".
   - \`direct 1\` prints and queues \`direct 2\`.
   - The thenable job prints \`then() called\`; \`resolve('T')\` queues the \`thenable gave\` callback.
2. **Tick 2:** "fulfill wrapped" runs and queues the \`wrapped\` callback. \`direct 2\` prints and queues \`direct 3\`. \`thenable gave T\` prints.
3. **Tick 3:** \`wrapped\` prints, then \`direct 3\`.

So resolving with a promise costs **two extra ticks**. That is why \`wrapped\` comes after \`direct 2\`.

**Practical lesson:** you never need these tick counts in app code — never depend on ordering between independent promise chains. If order matters, chain or \`await\` explicitly.`,
      followUps: [
        {
          q: `Why does return await vs return inside an async function sometimes change ordering?`,
          a: `Returning a promise from an async function makes the outer promise adopt it, which costs extra ticks (like \`r(p)\` here). Modern engines optimise \`await\` on native promises to a single tick, so \`return await p\` can settle slightly earlier. Only matters in puzzles.`,
        },
        {
          q: `What makes something a thenable?`,
          a: `Any object (or function) with a \`then\` method. Promises treat it like a promise: they call its \`then(resolve, reject)\`. This is how promises from different libraries work together.`,
        },
      ],
    },
    {
      id: 'event-loop-mixed-timers-microtasks',
      title: 'Timers that schedule microtasks, microtasks that schedule timers',
      difficulty: 'hard',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'event-loop-order',
      question: `What does this print (Node 11+ or any modern browser)?

\`\`\`javascript
console.log('1');
setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);
setTimeout(() => console.log('4'), 0);

async function job() {
  console.log('5');
  await new Promise((r) => setTimeout(r, 0));
  console.log('6');
}
job();

Promise.resolve()
  .then(() => {
    console.log('7');
    setTimeout(() => console.log('8'), 0);
    queueMicrotask(() => console.log('9'));
  })
  .then(() => console.log('10'));
console.log('11');
\`\`\``,
      hints: [
        `Order of work: all sync code → **all** microtasks → **one** timer callback → all microtasks again → next timer...`,
        `Write down the timer queue in the order timers are **created**: which three timers exist after the sync code, and which one is added later?`,
        `\`await new Promise((r) => setTimeout(r, 0))\` means "continue after a timer". The code after it runs as a microtask right after that timer fires.`,
      ],
      solution: `**Output:**

\`\`\`text
1
5
11
7
9
10
2
3
4
6
8
\`\`\`

**Why, step by step:**

1. **Sync:** \`1\`. Timer T1 (\`2\`) and T2 (\`4\`) are created. \`job()\` prints \`5\`, creates timer T3 (its resolver) and pauses at \`await\`. The \`.then\` callback is queued as a microtask. \`11\`.
2. **Microtasks:** the first \`.then\` prints \`7\`, creates timer T4 (\`8\`) and queues microtask \`9\`. When the callback returns, the next \`.then\` (\`10\`) is queued **after** \`9\`. So: \`7 9 10\`.
3. **T1:** prints \`2\` and queues microtask \`3\`. Microtasks run right after each timer, so \`3\` prints **before** T2.
4. **T2:** \`4\`.
5. **T3:** resolves the promise that \`job\` awaits; its continuation runs as a microtask: \`6\`.
6. **T4:** \`8\` (it was created last).

**Note:** very old Node versions (before 11) ran all expired timers first and then microtasks, which printed \`2 4\` before \`3\`. Modern Node matches browsers.`,
      followUps: [
        {
          q: `Why is this important in real apps?`,
          a: `A long chain of microtasks (for example a recursive promise loop) runs before any timer, click or paint, so it can freeze the UI. Breaking work into chunks with \`setTimeout\` (or \`scheduler.yield()\` where supported) gives the browser a chance to render.`,
        },
        {
          q: `Where does requestAnimationFrame fit?`,
          a: `In browsers, \`requestAnimationFrame\` callbacks run once per frame, just before the paint. They are neither microtasks nor timers, so their order compared to \`setTimeout(fn, 0)\` is not guaranteed. Microtasks still run after each rAF callback.`,
        },
      ],
    },
    {
      id: 'nested-async-await-interleaving',
      title: 'Nested async functions vs a promise chain',
      difficulty: 'hard',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'async-await-order',
      question: `What does this print?

\`\`\`javascript
async function a() {
  console.log('a1');
  await null;
  console.log('a2');
  await null;
  console.log('a3');
}

async function b() {
  console.log('b1');
  await a();
  console.log('b2');
}

b();
Promise.resolve()
  .then(() => console.log('p1'))
  .then(() => console.log('p2'))
  .then(() => console.log('p3'))
  .then(() => console.log('p4'));
console.log('sync');
\`\`\``,
      hints: [
        `An async function runs synchronously until its first \`await\`. \`b()\` calls \`a()\` immediately.`,
        `Every \`await null\` costs one microtask tick. Each \`.then\` in a chain also costs one tick, and the next \`.then\` is only queued when the previous one finished.`,
        `\`await a()\` waits for the promise that \`a()\` returned. That promise fulfills only when \`a\` finishes (after \`a3\`), and then \`b\` needs one more tick.`,
      ],
      solution: `**Output:**

\`\`\`text
b1
a1
sync
a2
p1
a3
p2
b2
p3
p4
\`\`\`

**Why, tick by tick:**

- **Sync:** \`b1\`, then \`a()\` runs: \`a1\`, pauses at \`await null\` (queues \`a\`-continuation). \`a\` returns a pending promise; \`b\` pauses on it. The chain queues \`p1\`. Then \`sync\`.
- **Tick 1:** \`a2\` (then \`a\` pauses again, queues its next step), \`p1\` (queues \`p2\`).
- **Tick 2:** \`a3\`, and \`a\` finishes → its promise fulfills → \`b\`'s continuation is queued. \`p2\` (queues \`p3\`).
- **Tick 3:** \`b2\`, then \`p3\` (queues \`p4\`).
- **Tick 4:** \`p4\`.

**Key idea:** the two "threads" take turns, one step per tick, in the order their next step was queued. \`await\` on a native promise (here \`await a()\`) takes only one tick after that promise fulfills.`,
      followUps: [
        {
          q: `How would you make b2 print before p1?`,
          a: `You cannot while \`a\` has awaits inside it, because \`b2\` must wait for \`a\` to finish. If \`a\` had no \`await\` (and only returned a value), \`b\`'s \`await a()\` would resume in the first tick, before \`p1\`.`,
        },
        {
          q: `Does async/await make code run in parallel?`,
          a: `No. JavaScript runs one piece of code at a time on one thread. \`await\` only pauses the function and lets other queued work run. Real parallel work happens outside (network, disk, worker threads).`,
        },
      ],
    },
    {
      id: 'implement-task-queue-concurrency',
      title: 'Build a TaskQueue with a concurrency limit',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'implement-promise-utilities',
      question: `Build a \`TaskQueue\` class:

- \`new TaskQueue(limit)\` — at most \`limit\` tasks run at the same time.
- \`add(task)\` — \`task\` is a function that returns a promise. \`add\` returns a promise for **that task's own result** (or error). Tasks can be added at any time, even while others run.
- \`onIdle()\` — returns a promise that resolves when nothing is running and nothing is waiting.
- A failing task must not stop the queue.

\`\`\`javascript
const q = new TaskQueue(2);
q.add(() => upload(file1)).then(console.log);
q.add(() => upload(file2));
q.add(() => upload(file3)); // waits until one of the first two finishes
await q.onIdle();
\`\`\`

This is different from "run this fixed array with a limit": the queue lives on, and each caller gets its own promise.`,
      hints: [
        `Keep a \`running\` counter and a \`waiting\` array. Each waiting entry stores the task **plus** the \`resolve\`/\`reject\` of the promise returned by \`add\`.`,
        `Write one private method \`next()\`: while \`running < limit\` and something is waiting, start the next task.`,
        `When any task settles (success or failure), decrease \`running\` and call \`next()\` again. Use \`finally\` for that so errors do not stop the queue.`,
      ],
      solution: `**Idea:** \`add\` does not start the task directly. It puts the task in a waiting line together with the resolve/reject of its own promise. A small scheduler (\`#next\`) starts tasks while there is a free slot, and every finished task frees a slot and calls the scheduler again.

\`\`\`javascript
class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.waiting = []; // tasks not started yet
    this.idleResolvers = [];
  }

  // task = a function that returns a promise. add() returns a promise for ITS result.
  add(task) {
    return new Promise((resolve, reject) => {
      this.waiting.push({ task, resolve, reject });
      this.#next();
    });
  }

  // resolves when nothing is running and nothing is waiting
  onIdle() {
    if (this.running === 0 && this.waiting.length === 0) return Promise.resolve();
    return new Promise((resolve) => this.idleResolvers.push(resolve));
  }

  #next() {
    while (this.running < this.concurrency && this.waiting.length > 0) {
      const { task, resolve, reject } = this.waiting.shift();
      this.running++;
      Promise.resolve()
        .then(task) // also catches a task that throws synchronously
        .then(resolve, reject)
        .finally(() => {
          this.running--;
          this.#next();
          if (this.running === 0 && this.waiting.length === 0) {
            this.idleResolvers.splice(0).forEach((r) => r());
          }
        });
    }
  }
}

const start = Date.now();
const t = () => Math.round((Date.now() - start) / 100) * 100;
const job = (name, ms, fail) => () =>
  new Promise((res, rej) => {
    console.log(t() + 'ms start ' + name);
    setTimeout(() => (fail ? rej(new Error(name + ' failed')) : res(name)), ms);
  });

const q = new TaskQueue(2);
q.add(job('A', 400)).then((v) => console.log(t() + 'ms done ' + v));
q.add(job('B', 200)).then((v) => console.log(t() + 'ms done ' + v));
q.add(job('C', 300, true)).catch((e) => console.log(t() + 'ms error ' + e.message));
q.add(job('D', 200)).then((v) => console.log(t() + 'ms done ' + v));
q.onIdle().then(() => console.log(t() + 'ms all idle'));
\`\`\`

**Output (times rounded to 100 ms):**

\`\`\`text
0ms start A
0ms start B
200ms done B
200ms start C
400ms done A
400ms start D
500ms error C failed
600ms done D
600ms all idle
\`\`\`

**Why it works:**

- A and B start at once (limit 2). C waits.
- B finishes at 200 ms → a slot frees → C starts. A finishes at 400 ms → D starts.
- C fails at 500 ms: only C's own promise rejects; the queue keeps working. D finishes at 600 ms, then \`onIdle\` resolves.
- \`Promise.resolve().then(task)\` also catches a task that **throws synchronously**, turning it into a rejection instead of crashing \`#next\`.
- \`splice(0)\` empties the idle list and returns its items, so each idle waiter is called once.

**Complexity:** \`shift()\` is O(n) on big queues; for thousands of tasks use an index pointer or a linked list.`,
      followUps: [
        {
          q: `Where would you use this in a MERN project?`,
          a: `Uploading many files from the browser with at most 3 at a time; calling a rate-limited third-party API from Node; running many MongoDB updates without opening hundreds of connections at once.`,
        },
        {
          q: `How would you add priorities?`,
          a: `Store a \`priority\` with each waiting entry and pick the highest one in \`#next\` (sort on insert, or use a binary heap for large queues).`,
        },
        {
          q: `How would you add pause() and resume()?`,
          a: `Add a \`paused\` flag. \`#next\` returns early while paused (running tasks finish normally). \`resume()\` clears the flag and calls \`#next()\`.`,
        },
      ],
    },
    {
      id: 'implement-dedupe-cached-fetcher',
      title: 'Dedupe in-flight requests and cache with a TTL',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'implement-memoize',
      question: `Several components ask for the same user at the same time, and your API gets 5 identical requests. Write \`cachedFetcher(fetchFn, { ttl })\` that returns \`get(key)\`:

- Calls for the same key **while a request is in flight** share the same promise (only one real request).
- A successful result is cached for \`ttl\` ms **after it arrives**.
- **Failures are not cached**: the next call tries again.

\`\`\`javascript
const getUser = cachedFetcher(fetchUser, { ttl: 100 });
await Promise.all([getUser(1), getUser(1), getUser(2)]); // 2 real requests, not 3
\`\`\``,
      hints: [
        `Cache the **promise**, not the value. Then even a request that is still running can be shared.`,
        `Store \`{ promise, expiresAt }\`. While in flight, use \`expiresAt = Infinity\`. When it succeeds, set the real expiry time.`,
        `On failure, delete the key from the cache, then re-throw so the caller still gets the error.`,
      ],
      solution: `**Idea:** the cache maps a key to a promise. Anyone asking during the request gets the same promise. Success starts the TTL clock; failure removes the entry.

\`\`\`javascript
function cachedFetcher(fetchFn, { ttl = 1000 } = {}) {
  const cache = new Map(); // key -> { promise, expiresAt }

  return function get(key) {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.promise; // fresh or still in flight

    const promise = Promise.resolve()
      .then(() => fetchFn(key))
      .catch((err) => {
        cache.delete(key); // do not cache failures
        throw err;
      });
    // while in flight, expiresAt = Infinity so everyone shares this promise
    const entry = { promise, expiresAt: Infinity };
    cache.set(key, entry);
    promise.then(
      () => { entry.expiresAt = Date.now() + ttl; }, // start the TTL clock when data arrives
      () => {}
    );
    return promise;
  };
}

let calls = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchUser(id) {
  calls++;
  await sleep(50);
  if (id === 'bad') throw new Error('not found');
  return { id, at: calls };
}

const getUser = cachedFetcher(fetchUser, { ttl: 100 });
(async () => {
  const [a, b, c] = await Promise.all([getUser(1), getUser(1), getUser(2)]);
  console.log(a === b, calls); // shared promise, 2 real calls (1 and 2)
  await getUser(1);
  console.log('cached hit, calls =', calls);
  await sleep(150);
  await getUser(1);
  console.log('after ttl, calls =', calls);
  await getUser('bad').catch((e) => console.log('error:', e.message));
  await getUser('bad').catch((e) => console.log('error again:', e.message));
  console.log('calls =', calls);
})();
\`\`\`

**Output:**

\`\`\`text
true 2
cached hit, calls = 2
after ttl, calls = 3
error: not found
error again: not found
calls = 5
\`\`\`

**Why it works:**

- The three parallel calls create only two cache entries (keys 1 and 2), so \`calls\` is 2 and \`a === b\` (same promise, same object).
- The next \`getUser(1)\` is a cache hit. After the TTL passes, a new request is made (\`calls\` = 3).
- \`'bad'\` fails twice and makes two real requests (4 and 5), because failures delete themselves from the cache.
- \`Promise.resolve().then(() => fetchFn(key))\` makes a sync throw in \`fetchFn\` become a rejection too.
- The extra \`promise.then(..., () => {})\` only updates the expiry; its empty error handler stops an "unhandled rejection" warning on that side branch.

**Memory:** entries are never removed after expiry unless requested again; for many keys add an LRU limit or a periodic cleanup.`,
      followUps: [
        {
          q: `How do React Query / SWR relate to this?`,
          a: `They do exactly this (dedupe by query key, cache with a stale time, refetch on failure) plus more: background refetch, retries, cache invalidation after mutations, and re-render on change.`,
        },
        {
          q: `What is the "thundering herd" problem?`,
          a: `When a popular cache entry expires, many requests hit the database at once. Sharing the in-flight promise (like here) or serving stale data while one request refreshes it (stale-while-revalidate) prevents it.`,
        },
      ],
    },
    {
      id: 'implement-take-latest',
      title: 'Only keep the latest async result (fix a search race condition)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'implement-debounce',
      question: `A search box calls the API on every keystroke. Responses can come back **out of order**: the answer for \`"r"\` may arrive after the answer for \`"rea"\`, and the UI shows wrong results.

Write \`takeLatest(asyncFn)\`. It returns a wrapped function that:

- passes an \`AbortSignal\` as the **last argument** to \`asyncFn\`, and aborts the previous call's signal when a new call starts;
- only lets the **latest** call settle; results and errors of older calls are ignored.

\`\`\`javascript
const latestSearch = takeLatest((q, signal) => fetch('/api/search?q=' + q, { signal }).then((r) => r.json()));
latestSearch('r');
latestSearch('re');
latestSearch('rea').then(render); // only this one renders
\`\`\``,
      hints: [
        `Keep the \`AbortController\` of the last call in a closure. On each new call, \`abort()\` it and create a new one.`,
        `Each call remembers **its own** controller. When its promise settles, check \`controller.signal.aborted\`: if true, a newer call exists, so ignore the result.`,
        `Call \`asyncFn\` right away (not inside \`.then\`), so the request starts immediately and can hear the abort.`,
      ],
      solution: `**Idea:** every call gets its own \`AbortController\`. A new call aborts the previous one (so the network request is really cancelled) and stale results are filtered out by checking the signal.

\`\`\`javascript
function takeLatest(asyncFn) {
  let lastController = null;

  return function (...args) {
    lastController?.abort(); // tell the previous call to stop (if it listens)
    const controller = new AbortController();
    lastController = controller;

    let result;
    try {
      // call right away (not in a microtask) so the request starts now
      result = asyncFn.call(this, ...args, controller.signal);
    } catch (err) {
      result = Promise.reject(err); // a sync throw becomes a rejection
    }

    return new Promise((resolve, reject) => {
      Promise.resolve(result).then(
        (value) => {
          if (!controller.signal.aborted) resolve(value); // only the latest call settles
        },
        (error) => {
          if (!controller.signal.aborted) reject(error); // stale errors are ignored too
        }
      );
    });
  };
}

// fake search: shorter queries are SLOWER, so answers come back out of order
function search(query, signal) {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(id);
      console.log('aborted', query);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const id = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve('results for ' + query);
    }, 300 - query.length * 50);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

const latestSearch = takeLatest(search);
['r', 're', 'rea'].forEach((q) => latestSearch(q).then((r) => console.log(r)));
setTimeout(() => latestSearch('react').then((r) => console.log(r)), 400);
\`\`\`

**Output:**

\`\`\`text
aborted r
aborted re
results for rea
results for react
\`\`\`

**Why it works:**

- \`'r'\` and \`'re'\` are aborted as soon as the next call starts, so their timers (or real \`fetch\` requests) are cancelled.
- \`'rea'\` is the latest at that moment and resolves. Later, \`'react'\` starts; \`'rea'\` has already finished, and the fake search removed its abort listener, so nothing extra happens.
- Even if \`asyncFn\` ignores the signal, the \`aborted\` check still drops stale results, so the UI can never show old data.
- Stale calls stay pending forever (they never resolve or reject). That is fine for UI updates; the promises are garbage collected.

**React version of the same idea:** in \`useEffect\`, create an \`AbortController\`, pass its signal to \`fetch\`, and call \`controller.abort()\` in the cleanup function.`,
      followUps: [
        {
          q: `Debounce or takeLatest — which one for a search box?`,
          a: `Both. Debounce reduces how many requests you send (wait for typing to pause). takeLatest guarantees that the result you show matches the latest query. Debounce alone does not fix out-of-order responses.`,
        },
        {
          q: `Should stale calls reject instead of staying pending?`,
          a: `It is a design choice. Rejecting with an \`AbortError\` lets callers clean up (e.g. hide a spinner), but every caller must then ignore that error. Staying pending keeps callers simple. Document whichever you choose.`,
        },
      ],
    },
  ],
};
