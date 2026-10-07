// Interview problems for the React stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'react',
  problems: [
    {
      id: 'use-toggle-hook',
      title: 'Write a useToggle hook',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'custom-hooks',
      question: `Write a custom hook \`useToggle\` for on/off state (open menus, show password, dark mode).

\`\`\`jsx
function PasswordField() {
  const [visible, toggleVisible] = useToggle(false);
  return (
    <>
      <input type={visible ? 'text' : 'password'} />
      <button onClick={toggleVisible}>{visible ? 'Hide' : 'Show'}</button>
    </>
  );
}
\`\`\`

Requirements:
- \`useToggle(initial)\` returns \`[value, toggle]\`.
- \`toggle\` must be safe to pass straight to \`onClick\`.
- \`toggle\` should keep the same identity between renders (so memoized children don't re-render).`,
      hints: [
        'A custom hook is just a function whose name starts with `use` and that calls other hooks. Start with `useState`.',
        'To flip the value safely, use the updater form: `setValue(v => !v)`. Then you do not need to read the current value.',
        'Wrap `toggle` in `useCallback` with an empty dependency array. Why is it safe to have no dependencies?',
      ],
      solution: `**Idea:** keep a boolean in \`useState\` and expose a stable \`toggle\` function that flips it with the updater form.

\`\`\`jsx
import { useState, useCallback } from 'react';

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  // Updater form: React gives us the latest value, so no dependencies are needed.
  // useCallback keeps the same function between renders.
  const toggle = useCallback(() => setValue((v) => !v), []);

  return [value, toggle];
}
\`\`\`

**Why it works:** \`setValue(v => !v)\` always flips the **latest** value, even if \`toggle\` is called twice quickly. Because \`toggle\` never reads \`value\` directly, it can have an empty dependency array and stay the same function forever.

**Why toggle ignores its arguments:** \`onClick={toggle}\` calls \`toggle(event)\`. If \`toggle\` accepted "the next value" as an argument, it would receive the event object (which is truthy) and set the state to an object. That is a common bug.`,
      followUps: [
        {
          q: 'How would you also allow forcing the value on or off?',
          a: 'Return extra helpers: `const setOn = useCallback(() => setValue(true), [])` and `setOff`. Or return `setValue` itself as the third item. Do not overload `toggle` with an argument because of the event-object problem.',
        },
        {
          q: 'Why return an array instead of an object?',
          a: 'An array lets the caller pick any names (`const [isOpen, toggleOpen] = useToggle()`), like `useState`. Objects are better when a hook returns many values, because order no longer matters.',
        },
      ],
    },
    {
      id: 'use-previous-hook',
      title: 'Write a usePrevious hook',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'use-ref',
      question: `Write \`usePrevious(value)\`. It returns the value from the **previous** render.

\`\`\`jsx
function Price({ amount }) {
  const prevAmount = usePrevious(amount);
  const trend = prevAmount === undefined ? '' : amount > prevAmount ? 'up' : 'down';
  return <span>{amount} {trend}</span>;
}
// render 1: amount 100 -> prevAmount undefined
// render 2: amount 120 -> prevAmount 100
\`\`\``,
      hints: [
        'You need to store something between renders **without** causing a new render. Which hook does that?',
        'An effect runs **after** the render is shown. If you save the value inside an effect, what does the render read?',
      ],
      solution: `**Idea:** store the value in a ref, and update the ref in an effect. The effect runs after rendering, so during the render the ref still holds the old value.

\`\`\`jsx
import { useEffect, useRef } from 'react';

export function usePrevious(value) {
  const ref = useRef(undefined);

  useEffect(() => {
    ref.current = value; // runs AFTER this render is committed
  });

  return ref.current; // still the value from the last render
}
\`\`\`

**Why it works:** order of events per render: (1) the component reads \`ref.current\` (old value), (2) React updates the screen, (3) the effect saves the new value for next time. Changing a ref does not trigger a render, so there is no loop.

**Edge case:** if the component re-renders for another reason (a different state changed), "previous render" and "previous different value" are not the same. With this hook, after an unrelated re-render \`prevAmount\` equals \`amount\`.`,
      followUps: [
        {
          q: 'The React docs say not to read refs during render. Is there a "pure" version?',
          a: 'Yes. Store the last value in state and compare during render: `const [prev, setPrev] = useState(value); const [last, setLast] = useState(undefined); if (value !== prev) { setLast(prev); setPrev(value); } return last;`. React allows setting state during render for the same component; it re-runs the render immediately. This tracks the previous **different** value.',
        },
        {
          q: 'Why not just use a normal variable instead of a ref?',
          a: 'A normal variable inside the component is re-created on every render, so it forgets its value. A variable outside the component would be shared by every instance of the component.',
        },
      ],
    },
    {
      id: 'counter-with-usereducer',
      title: 'Build a counter with useReducer',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'use-reducer',
      question: `Build a counter with \`useReducer\` (not \`useState\`):

- Buttons: **+**, **-**, **Reset**.
- A number input "step" (default 1). + and - change the count by the step.
- Reset sets count back to 0 and step back to 1.

Explain why \`useReducer\` can be a better fit than two \`useState\` calls here.`,
      hints: [
        'Write the reducer first: a pure function `(state, action) => newState`. Use a `switch` on `action.type`.',
        'The state can be one object: `{ count: 0, step: 1 }`. Always return a **new** object.',
        'The step input gives a string. Convert it with `Number(...)` before dispatching.',
      ],
      solution: `**Idea:** put all the counter logic in one pure reducer function. The component only **describes what happened** (\`dispatch({ type: 'increment' })\`).

\`\`\`jsx
import { useReducer } from 'react';

const initialState = { count: 0, step: 1 };

// Pure function: same input -> same output, no side effects.
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.step };
    case 'reset':
      return initialState;
    default:
      throw new Error('Unknown action: ' + action.type);
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <h2>{state.count}</h2>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>

      <label>
        Step:
        <input
          type="number"
          value={state.step}
          onChange={(e) => dispatch({ type: 'setStep', step: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
\`\`\`

**Why it works:** the reducer reads \`state.step\` from the **latest** state, so + always uses the current step. Reset changes two values in one action, which is easy to forget with separate \`useState\` calls.

**Why useReducer here:** the next state depends on several values, and the update rules live in one place. The reducer is a plain function, so you can unit-test it without rendering anything.`,
      followUps: [
        {
          q: 'How do you test the reducer?',
          a: 'Call it directly: `expect(reducer({ count: 1, step: 5 }, { type: \'increment\' })).toEqual({ count: 6, step: 5 })`. No React needed.',
        },
        {
          q: 'Is `dispatch` stable between renders?',
          a: 'Yes. React guarantees `dispatch` (like `setState`) keeps the same identity, so you can pass it down or leave it out of dependency arrays.',
        },
        {
          q: 'When would you still choose useState?',
          a: 'For one or two independent simple values (a boolean, an input string). A reducer adds ceremony that only pays off when updates are related or complex.',
        },
      ],
    },
    {
      id: 'mutating-state-array',
      title: 'Debug: the list does not update when I add an item',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'state-usestate',
      question: `Clicking **Add** does nothing on screen, but \`console.log(items)\` shows the new item is there. Why? Fix it, and also fix \`toggleDone\`.

\`\`\`jsx
function ShoppingList() {
  const [items, setItems] = useState([{ id: 1, name: 'Milk', done: false }]);
  const [text, setText] = useState('');

  function addItem() {
    items.push({ id: Date.now(), name: text, done: false });
    setItems(items);
    console.log(items); // the new item IS here
  }

  function toggleDone(id) {
    const item = items.find((i) => i.id === id);
    item.done = !item.done;
    setItems([...items]);
  }

  return (/* input + button + list of items */);
}
\`\`\``,
      hints: [
        'How does React decide if state changed? Does it look inside the array, or compare something simpler?',
        'React compares old and new state with `Object.is`. `items.push(...)` keeps the **same** array reference.',
        'In `toggleDone`, the array is new, but the item object inside is the old one, mutated. Why can that still cause bugs?',
      ],
      solution: `**Idea:** React only re-renders if the new state is a **different reference** (\`Object.is(oldState, newState)\` is false). \`push\` changes the same array, so React thinks nothing changed and skips the render. Always create new arrays and objects.

\`\`\`jsx
function addItem() {
  // New array with the old items + the new one
  setItems((prev) => [...prev, { id: Date.now(), name: text, done: false }]);
  setText('');
}

function toggleDone(id) {
  // New array, and a NEW object only for the item that changed
  setItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
  );
}

function removeItem(id) {
  setItems((prev) => prev.filter((item) => item.id !== id));
}
\`\`\`

**Why it works:** \`[...prev, x]\`, \`map\` and \`filter\` return new arrays, so React sees a change. The updater form \`prev => ...\` also avoids stale values if two updates happen quickly.

**Why the old \`toggleDone\` is still wrong:** it mutates the old item object. Anything that compares objects (\`React.memo\` rows, \`useMemo\` dependencies, previous-state snapshots) sees the "same" object and may skip updating. It also breaks "undo" features because the old state was changed too.`,
      followUps: [
        {
          q: 'Which array methods mutate and which return a new array?',
          a: 'Mutating: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`. Non-mutating: `map`, `filter`, `slice`, `concat`, spread `[...a]`, and the newer `toSorted`, `toReversed`, `toSpliced`, `with`.',
        },
        {
          q: 'How would you update deeply nested state without lots of spreading?',
          a: 'Flatten the state shape (store items by id), or use a library like Immer (`useImmer` or Redux Toolkit uses it). Immer lets you write "mutating" code on a draft and produces a new immutable object for you.',
        },
      ],
    },
    {
      id: 'onclick-called-during-render',
      title: 'Debug: "Too many re-renders" error on a button',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'events',
      question: `This component crashes with **"Too many re-renders. React limits the number of renders to prevent an infinite loop."** Find the bug(s) and fix them.

\`\`\`jsx
function Cart({ items, onRemove }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={setCount(count + 1)}>Clicked {count}</button>
      {items.map((item) => (
        <div key={item.id}>
          {item.name}
          <button onClick={onRemove(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
\`\`\``,
      hints: [
        '`onClick` needs a **function**. What does `setCount(count + 1)` give you — a function, or the result of calling one?',
        'Writing `fn(x)` inside JSX runs it right now, while rendering. Setting state during render starts a new render, which runs it again...',
      ],
      solution: `**Idea:** \`onClick={setCount(count + 1)}\` **calls** \`setCount\` during render. That schedules another render, which calls it again — an infinite loop. Pass a function instead.

\`\`\`jsx
function Cart({ items, onRemove }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* Pass a function. React calls it later, on click. */}
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>
      {items.map((item) => (
        <div key={item.id}>
          {item.name}
          {/* Need an argument? Wrap in an arrow function. */}
          <button onClick={() => onRemove(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
\`\`\`

**Why it works:** \`() => setCount(...)\` is a function **value**. Creating it does nothing; React only runs it when the click happens.

**The second bug** (\`onClick={onRemove(item.id)}\`) is just as bad: it would remove every item during render. If \`onRemove\` sets state in the parent, you get the same loop.

**Rule:** \`onClick={handleClick}\` (no parentheses) or \`onClick={() => handleClick(arg)}\`. Never \`onClick={handleClick()}\`.`,
      followUps: [
        {
          q: 'Is creating a new arrow function on every render a performance problem?',
          a: 'Almost never. Creating small functions is very cheap. It only matters if you pass it to a `React.memo` child, because a new function breaks the memo; then use `useCallback`.',
        },
        {
          q: 'How else can you pass the id without an arrow function?',
          a: 'Use a data attribute: `<button data-id={item.id} onClick={handleRemove}>` and read `e.currentTarget.dataset.id` in the handler. Note that dataset values are strings.',
        },
      ],
    },
    {
      id: 'zero-rendered-on-screen',
      title: 'Debug: a random "0" appears on the page',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'conditional-rendering',
      question: `When the user has no notifications, the header shows a stray **0** next to the logo. Why? Fix it.

\`\`\`jsx
function Header({ notifications }) {
  return (
    <header>
      <Logo />
      {notifications.length && <Badge count={notifications.length} />}
    </header>
  );
}
\`\`\``,
      hints: [
        'What does `0 && <Badge />` evaluate to in plain JavaScript?',
        'React renders nothing for `false`, `null`, `undefined` and `true`. What about the number `0`?',
      ],
      solution: `**Idea:** \`a && b\` returns \`a\` when \`a\` is falsy. So \`0 && <Badge />\` returns **0**, not \`false\`. React skips booleans, \`null\` and \`undefined\`, but it **does** render numbers, so you see "0".

\`\`\`jsx
function Header({ notifications }) {
  return (
    <header>
      <Logo />
      {/* Make the left side a real boolean */}
      {notifications.length > 0 && <Badge count={notifications.length} />}

      {/* Other safe options: */}
      {/* {!!notifications.length && <Badge ... />} */}
      {/* {notifications.length ? <Badge ... /> : null} */}
    </header>
  );
}
\`\`\`

**Why it works:** \`notifications.length > 0\` is \`true\` or \`false\`, and React renders nothing for \`false\`.

**Same trap:** \`NaN && ...\` renders "NaN", and \`''\` (empty string) renders an empty text node. Watch out with \`price && ...\` when price can be 0.`,
      followUps: [
        {
          q: 'What happens with this bug in React Native?',
          a: 'It is worse: React Native throws "Text strings must be rendered within a <Text> component" because a bare `0` is text outside `<Text>`. The app crashes instead of showing a stray character.',
        },
        {
          q: 'When should you use a ternary instead of &&?',
          a: 'When you have an "else" branch (`loading ? <Spinner /> : <List />`), or when the condition is not clearly a boolean. Some teams use a lint rule to force booleans on the left of &&.',
        },
      ],
    },
    {
      id: 'derived-state-in-effect',
      title: 'Debug: state copied in useEffect shows stale values',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'you-might-not-need-an-effect',
      question: `A reviewer says this component has "unnecessary state and an unnecessary effect". The list also flickers: for one frame it shows the old filtered list. What is wrong and how do you fix it?

\`\`\`jsx
function ProductList({ products }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(products);

  useEffect(() => {
    setFiltered(
      products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    );
  }, [products, query]);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>{filtered.length} results</p>
      {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
    </>
  );
}
\`\`\``,
      hints: [
        'Can `filtered` be calculated from things you already have (`products` and `query`)?',
        'Count the renders when the user types one letter: the render from `setQuery`, then the effect runs and calls `setFiltered`...',
      ],
      solution: `**Idea:** \`filtered\` is **derived** data — it can always be computed from \`products\` and \`query\`. Don't store it in state; compute it during render.

\`\`\`jsx
import { useMemo, useState } from 'react';

function ProductList({ products }) {
  const [query, setQuery] = useState('');

  // Computed during render: always in sync, no extra render.
  const q = query.toLowerCase();
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q));

  // Only if filtering is truly expensive (measure first!):
  // const filtered = useMemo(
  //   () => products.filter((p) => p.name.toLowerCase().includes(q)),
  //   [products, q]
  // );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>{filtered.length} results</p>
      {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
    </>
  );
}
\`\`\`

**Why the old code was bad:**
- **Two renders per keystroke:** render 1 shows the new \`query\` with the **old** \`filtered\` (the flicker), then the effect runs, sets state, and render 2 fixes it.
- **Two sources of truth:** \`filtered\` can drift out of sync with \`products\`.
- More code, harder to read.

**Rule of thumb:** if you can calculate it from props or state, it is not state. Effects are for syncing with things **outside** React (network, DOM APIs, timers, subscriptions).`,
      followUps: [
        {
          q: 'When do you actually need useMemo here?',
          a: 'When the calculation is slow (thousands of items, heavy work) and the component re-renders often for other reasons. Measure with the React Profiler or `console.time` first; for small lists plain computation is fine.',
        },
        {
          q: 'How would you reset some state when a prop changes, without an effect?',
          a: 'Give the component a `key` from that prop (`<Profile key={userId} />`) so React creates a fresh instance with fresh state.',
        },
      ],
    },
    {
      id: 'batching-render-count-output',
      title: 'Output: how many renders, and what is the count?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'react-18-concurrent-batching',
      question: `No StrictMode. The page loads, then the user clicks the button **once**. What is logged? What number does the button show?

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  console.log('render', count);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log('clicked', count);
  }

  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

**Part 2:** what changes if each line is \`setCount((c) => c + 1)\`?`,
      hints: [
        'Inside one render, `count` is a constant. What is its value during this click handler?',
        'React batches state updates made in the same event. It re-renders once, after the handler finishes.',
        'The updater form `c => c + 1` receives the result of the previous update in the queue.',
      ],
      solution: `**Output (part 1):**

\`\`\`text
render 0
clicked 0
render 1
\`\`\`

The button shows **1**.

**Why:**
- \`count\` is a snapshot. In this render it is \`0\`, so all three calls are \`setCount(0 + 1)\` — "set it to 1" three times.
- \`setCount\` does not change \`count\` immediately, so \`clicked 0\` is logged.
- React **batches** the three updates and renders **once** after the handler ends.

**Output (part 2) with \`setCount((c) => c + 1)\`:**

\`\`\`text
render 0
clicked 0
render 3
\`\`\`

React queues three updater functions and runs them in order: 0 → 1 → 2 → 3. Still **one** render, and \`count\` inside the handler is still \`0\`.

**React 18+ detail:** batching now also happens inside \`setTimeout\`, promises and native event listeners (automatic batching). Before React 18, updates inside a \`setTimeout\` caused one render per \`setCount\` call.`,
      followUps: [
        {
          q: 'How do you read the new value right after setting it?',
          a: 'Compute it first: `const next = count + 1; setCount(next); doSomething(next);`. Or react to it in an effect that depends on `count`.',
        },
        {
          q: 'How do you force React to render immediately, without batching?',
          a: 'Wrap the update in `flushSync(() => setCount(1))` from `react-dom`. It is rarely needed — for example, to measure the DOM right after an update. It hurts performance if overused.',
        },
      ],
    },
    {
      id: 'strictmode-double-effect-output',
      title: 'Output: why does my effect run twice?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'strict-mode',
      question: `The app is wrapped in \`<StrictMode>\` and runs in development. The \`Chat\` component mounts once. What is logged? What is logged in a production build?

\`\`\`jsx
function Chat({ roomId }) {
  useEffect(() => {
    console.log('connect', roomId);
    return () => console.log('disconnect', roomId);
  }, [roomId]);

  return <h1>Room {roomId}</h1>;
}

// <StrictMode><Chat roomId="general" /></StrictMode>
\`\`\`

A teammate "fixed" the double log by adding a \`useRef\` flag so the effect body only runs once. Is that a good fix?`,
      hints: [
        'In development, StrictMode mounts, unmounts and re-mounts each component one extra time.',
        'What is StrictMode trying to prove about your effect? Think about the user leaving and coming back to the page.',
      ],
      solution: `**Development with StrictMode:**

\`\`\`text
connect general
disconnect general
connect general
\`\`\`

**Production:**

\`\`\`text
connect general
\`\`\`

**Why:** in development (React 18+), StrictMode runs **setup → cleanup → setup** right after the first mount. It is a stress test: it checks that your cleanup really undoes the setup. If your effect is correct, the user can't see a difference — one connection stays open in both cases.

**The useRef flag is a bad fix.** It hides the symptom but not the bug. If the effect has no proper cleanup, the same leak will happen in production when the user navigates away and back, or when \`roomId\` changes. The correct fix is a correct cleanup:

\`\`\`jsx
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect(); // undo exactly what setup did
}, [roomId]);
\`\`\`

**For data fetching**, a double request in dev is fine if you ignore or abort the first one in cleanup (or use a library like TanStack Query, which caches and dedupes).`,
      followUps: [
        {
          q: 'What else does StrictMode do in development?',
          a: 'It calls component functions, initializers and reducers twice to find impure code, warns about some deprecated APIs, and runs the extra effect cycle. None of this happens in production.',
        },
        {
          q: 'Is there a case where running setup twice is a real problem?',
          a: 'Yes, for things that must happen once per app load, like analytics "page opened" or initializing a global SDK. Move those outside components (module level) or guard them with a module-level flag, not a per-component ref.',
        },
      ],
    },
    {
      id: 'use-debounce-hook',
      title: 'Write a useDebounce hook for a search box',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'custom-hooks',
      question: `A search box calls the API on every keystroke. Write \`useDebounce(value, delay)\` that returns the value only after the user **stops typing** for \`delay\` ms, and use it so the API is called once per pause.

\`\`\`jsx
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  // fetch results when debouncedQuery changes
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
\`\`\``,
      hints: [
        'Keep a second piece of state: the "settled" value. Update it later with `setTimeout`.',
        'Every time `value` changes, the effect should cancel the old timer. Where does cancelling go in an effect?',
        'The cleanup function runs before the next effect run, so `return () => clearTimeout(id)` cancels the previous timer.',
      ],
      solution: `**Idea:** when \`value\` changes, start a timer that copies it into \`debounced\` state. If \`value\` changes again before the timer fires, the effect cleanup cancels the timer. Only the last value "survives".

\`\`\`jsx
import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // cancel if value changes or component unmounts
  }, [value, delay]);

  return debounced;
}

// Usage
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    fetch('/api/search?q=' + encodeURIComponent(debouncedQuery), { signal: controller.signal })
      .then((res) => res.json())
      .then(setResults)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return () => controller.abort(); // drop a slow old response
  }, [debouncedQuery]);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{results.map((r) => <li key={r.id}>{r.title}</li>)}</ul>
    </>
  );
}
\`\`\`

**Why it works:** the input stays fast because \`query\` updates on every key. The fetch effect depends on \`debouncedQuery\`, which only changes after 400 ms of quiet. The \`AbortController\` handles the other problem: an old, slow response arriving after a newer one.

**Edge cases:** cleanup also runs on unmount, so no state update fires after the component is gone. Empty query → clear results without calling the API.`,
      followUps: [
        {
          q: 'How would you debounce a callback instead of a value?',
          a: 'Write `useDebouncedCallback(fn, delay)`: keep the timer id and the latest `fn` in refs, return a stable function (via `useCallback` or `useMemo`) that clears and restarts the timer, and clear the timer in an unmount cleanup.',
        },
        {
          q: 'Why not just wrap the handler with lodash debounce inside the component?',
          a: '`debounce(fn)` written in the component body creates a **new** debounced function on every render, so each keystroke gets its own timer and nothing is debounced. You would need `useMemo`/`useRef` to keep one instance and cancel it on unmount.',
        },
        {
          q: 'Debounce or useDeferredValue?',
          a: '`useDeferredValue` keeps the UI responsive for expensive **rendering** but has no fixed delay, so it does not reduce network calls. Use debounce for API calls.',
        },
      ],
    },
    {
      id: 'use-local-storage-hook',
      title: 'Write a useLocalStorage hook',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'custom-hooks',
      question: `Write \`useLocalStorage(key, initialValue)\`. It works like \`useState\`, but the value survives a page refresh.

\`\`\`jsx
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [recent, setRecent] = useLocalStorage('recent-searches', []);
  // ...
}
\`\`\`

Handle: objects/arrays (not only strings), broken JSON in storage, Safari private mode / full storage (\`setItem\` can throw), and server-side rendering (Next.js has no \`window\` on the server).`,
      hints: [
        'Read localStorage only **once**, on the first render. `useState` accepts a function for that (lazy initial state).',
        'Use `JSON.stringify` to save and `JSON.parse` to read. Both can fail — wrap them in try/catch.',
        'Writing to storage is a side effect. Do it in a `useEffect` that depends on `[key, value]`.',
      ],
      solution: `**Idea:** \`useState\` holds the value. A lazy initializer reads storage once on the first render. An effect writes the value back whenever it changes.

\`\`\`jsx
import { useEffect, useState } from 'react';

function readStorage(key, initialValue) {
  if (typeof window === 'undefined') return initialValue; // server render
  try {
    const saved = window.localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : initialValue;
  } catch {
    return initialValue; // broken JSON or storage blocked
  }
}

export function useLocalStorage(key, initialValue) {
  // Lazy initializer: runs only on the first render, not on every render
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked (private mode). Keep working in memory.
    }
  }, [key, value]);

  return [value, setValue]; // setValue supports the updater form, like useState
}
\`\`\`

**Why it works:**
- The lazy initializer avoids reading and parsing storage on every render.
- Returning React's own \`setValue\` means \`setRecent(prev => [...prev, q])\` works out of the box.
- try/catch keeps the app alive when storage is broken.

**Edge cases:**
- **SSR hydration:** on the server the hook returns \`initialValue\`, but on the client the first render may read a different saved value. That causes a hydration mismatch warning. Fix: start with \`initialValue\` and read storage inside a \`useEffect\` after mount (or render that part only on the client).
- **Key changes:** this simple version does not re-read storage when \`key\` changes. Use \`key\` as a component \`key\` or add logic for it if needed.`,
      followUps: [
        {
          q: 'How do you sync the value across browser tabs?',
          a: 'Listen to the `storage` event on `window` in an effect. It fires in **other** tabs when a key changes. If `event.key === key`, parse `event.newValue` and call `setValue`. Remove the listener in cleanup.',
        },
        {
          q: 'Two components use the same key in the same tab. Do they stay in sync?',
          a: 'No. Each has its own `useState`, and the `storage` event does not fire in the same tab. For shared state, lift it up into context, or build the hook on `useSyncExternalStore` with a small store that notifies all subscribers.',
        },
        {
          q: 'What should you never put in localStorage?',
          a: 'Secrets like auth tokens if you can avoid it — any XSS script can read localStorage. Prefer httpOnly cookies for session tokens.',
        },
      ],
    },
    {
      id: 'use-on-click-outside-hook',
      title: 'Write useOnClickOutside to close a dropdown',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'use-ref',
      question: `Write \`useOnClickOutside(ref, handler)\`. It calls \`handler\` when the user clicks or taps **outside** the element in \`ref\`.

\`\`\`jsx
function Dropdown() {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useOnClickOutside(boxRef, () => setOpen(false));

  return (
    <div ref={boxRef}>
      <button onClick={() => setOpen((o) => !o)}>Menu</button>
      {open && <ul className="menu">...</ul>}
    </div>
  );
}
\`\`\`

The caller passes an inline arrow as \`handler\` (a new function every render). Your hook should not remove and re-add the document listener on every render because of that.`,
      hints: [
        'Add a listener on `document` in an effect. Inside it, use `ref.current.contains(event.target)` to check if the click was inside.',
        'Remove the listener in the effect cleanup.',
        'To avoid re-subscribing when `handler` changes, store the latest handler in a ref and call `handlerRef.current(event)` from the listener.',
      ],
      solution: `**Idea:** one listener on \`document\`. If the clicked element is not inside our element, call the handler. Keep the latest handler in a ref so the listener can stay the same.

\`\`\`jsx
import { useEffect, useRef } from 'react';

export function useOnClickOutside(ref, handler) {
  // Always points at the newest handler, without re-subscribing
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    function listener(event) {
      const el = ref.current;
      // Ignore clicks inside the element (or if it is not mounted)
      if (!el || el.contains(event.target)) return;
      handlerRef.current(event);
    }

    // mousedown/touchstart fire before click, so the menu closes right away
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref]); // ref objects are stable, so this runs once
}
\`\`\`

**Why it works:** \`contains\` returns true for the element itself and anything nested inside it. The listener is added once on mount and removed on unmount, so there is no leak. The handler ref means an inline arrow from the caller does not cause the listener to be re-added on every render.

**Simpler version:** putting \`handler\` in the dependency array also works correctly — it just re-adds the listener every render when the caller passes an inline function. Saying this trade-off out loud scores points.`,
      followUps: [
        {
          q: 'The menu is rendered in a portal (outside the box in the DOM). What breaks?',
          a: 'Clicks inside the portal menu are not inside `boxRef` in the DOM, so the hook treats them as "outside" and closes the menu. Fix: accept several refs (button and portal menu) and ignore the click if any of them contains the target.',
        },
        {
          q: 'Why not use the `click` event?',
          a: '`click` fires after mouseup, so the menu closes slightly later, and a drag that starts inside and ends outside can close it. `mousedown`/`pointerdown` feels more natural for dropdowns. Some libraries use `pointerdown` to cover mouse, touch and pen in one event.',
        },
        {
          q: 'What else should close a dropdown for accessibility?',
          a: 'The Escape key, and moving focus out of it (focusout). Focus should go back to the trigger button when it closes.',
        },
      ],
    },
    {
      id: 'stale-closure-set-interval',
      title: 'Debug: timer stuck at 1 (stale closure in setInterval)',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'stale-closures',
      question: `This timer shows **1** and then never changes. Why? Fix it. Then add a "speed" prop: the timer adds \`step\` (a prop) every second.

\`\`\`jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{seconds}s</p>;
}
\`\`\``,
      hints: [
        'The effect runs once (empty dependency array). Which render\'s `seconds` does the interval callback remember?',
        'The callback was created in the first render, where `seconds` is 0. So every tick does `setSeconds(0 + 1)`.',
        'Use the updater form so you do not need to read `seconds` at all.',
      ],
      solution: `**Idea:** the interval callback is a **closure** created during the first render. It captured \`seconds = 0\` forever. Every tick calls \`setSeconds(0 + 1)\`, so the value stays 1. This is a "stale closure".

**Fix 1 — updater function (best here):**

\`\`\`jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1); // React passes the latest value
    }, 1000);
    return () => clearInterval(id);
  }, []); // correct: the effect reads nothing from render

  return <p>{seconds}s</p>;
}
\`\`\`

**With a \`step\` prop:**

\`\`\`jsx
function Timer({ step = 1 }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + step), 1000);
    return () => clearInterval(id);
  }, [step]); // the effect reads step, so it is a dependency

  return <p>{seconds}s</p>;
}
\`\`\`

**Why it works:** with the updater form, React gives the callback the current state, so the closure never needs a fresh \`seconds\`. When \`step\` changes, the effect cleans up the old interval and starts a new one that sees the new \`step\`.

**Trade-off:** restarting the interval resets the 1-second rhythm when \`step\` changes. If that matters, keep \`step\` in a ref (\`stepRef.current = step\`) and read \`stepRef.current\` inside the interval — see the \`useInterval\` hook problem.

**Note:** the ESLint rule \`react-hooks/exhaustive-deps\` would have warned about the missing \`seconds\` dependency. Don't silence it — fix the code.`,
      followUps: [
        {
          q: 'Why not just add `seconds` to the dependency array?',
          a: 'It works, but the interval is cleared and re-created every second (it behaves like a setTimeout). The updater form is cleaner and keeps one interval.',
        },
        {
          q: 'Where else do stale closures show up?',
          a: 'Event listeners added once in an effect (reading old state), `setTimeout` callbacks ("alert shows the old message"), `useCallback`/`useMemo` with missing dependencies, and subscriptions to WebSockets.',
        },
      ],
    },
    {
      id: 'infinite-effect-object-deps',
      title: 'Debug: useEffect fetches in an infinite loop',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'use-effect',
      question: `The Network tab shows hundreds of requests per second to \`/api/users\`. Why? Fix it.

\`\`\`jsx
function UserList({ role }) {
  const [users, setUsers] = useState([]);
  const filters = { role, active: true };

  useEffect(() => {
    const params = new URLSearchParams(filters);
    fetch('/api/users?' + params)
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, [filters]);

  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\``,
      hints: [
        'React compares dependencies with `Object.is`. Is `filters` the same object on the next render?',
        'Follow the cycle: render → new `filters` object → effect runs → `setUsers` (a new array) → render → ...',
        'Depend on primitive values (`role`) and build the object inside the effect.',
      ],
      solution: `**Idea:** \`filters\` is a **new object on every render**. \`Object.is(oldFilters, newFilters)\` is always false, so the effect runs after every render. The effect sets state with a new array, which causes a render, which creates a new \`filters\`... an infinite loop.

\`\`\`jsx
function UserList({ role }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Build the object INSIDE the effect, depend on the primitive
    const params = new URLSearchParams({ role, active: 'true' });
    const controller = new AbortController();

    fetch('/api/users?' + params, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [role]); // a string: equal across renders unless it really changes

  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

**Why it works:** \`role\` is a string, so it compares by value. The effect runs only on mount and when \`role\` really changes.

**Other fixes:**
- If the object must live outside the effect, memoize it: \`const filters = useMemo(() => ({ role, active: true }), [role]);\`
- If it never changes, move it outside the component (a module constant).
- The same bug happens with **functions** in deps (\`fetchUsers\` defined in the component). Move the function inside the effect or wrap it in \`useCallback\`.`,
      followUps: [
        {
          q: 'What if the object comes from the parent as a prop?',
          a: 'The parent may create it inline each render. Either ask the parent to memoize it, or depend on its fields in the child: `useEffect(..., [filters.role, filters.active])`.',
        },
        {
          q: 'How would TanStack Query handle this?',
          a: '`useQuery({ queryKey: [\'users\', { role }], queryFn })` hashes the query key **by value**, so a new-but-equal object does not refetch. It also adds caching, dedupe and cancellation.',
        },
      ],
    },
    {
      id: 'index-as-key-input-bug',
      title: 'Debug: typed text jumps to the wrong row',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'lists-keys',
      question: `The user types a note into the input next to "Fix bug". Then they click **Add to top**. Now the note appears next to the **new** task instead of "Fix bug". Why? Fix it.

\`\`\`jsx
function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 'a1', title: 'Write tests' },
    { id: 'b2', title: 'Fix bug' },
  ]);

  function addToTop() {
    const id = crypto.randomUUID();
    setTasks([{ id, title: 'New task' }, ...tasks]);
  }

  return (
    <>
      <button onClick={addToTop}>Add to top</button>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            {task.title} <input placeholder="notes" />
          </li>
        ))}
      </ul>
    </>
  );
}
\`\`\``,
      hints: [
        'React uses `key` to decide which old component matches which new one. After adding to the top, which task has key 0?',
        'The `<input>` is uncontrolled: its text lives in the DOM element, which React reuses based on the key.',
      ],
      solution: `**Idea:** keys tell React "this item is the same item as last time". With \`key={index}\`, after adding to the top, the new task gets key 0, "Write tests" gets key 1, and "Fix bug" gets key 2. React reuses the DOM \`<li>\` with key 1 (and its typed input text) for whatever item now has index 1. The titles move, but the input state stays at the old position.

\`\`\`jsx
{tasks.map((task) => (
  // Stable, unique id from the data
  <li key={task.id}>
    {task.title} <input placeholder="notes" />
  </li>
))}
\`\`\`

**Why it works:** with \`key={task.id}\`, React knows "Fix bug" is still \`b2\`. It moves the existing \`<li>\` (with its input) and creates a fresh one only for the new task.

**When is index OK as a key?** Only if the list is static: never reordered, filtered, or added to in the middle/top, **and** rows have no state (inputs, checkboxes, component state).

**Don't do this:** \`key={Math.random()}\` or \`key={crypto.randomUUID()}\` in render. A new key every render makes React destroy and re-create every row, which is slow and wipes the input text on every keystroke. Create ids **once**, when the item is created.`,
      followUps: [
        {
          q: 'What if the data has no id?',
          a: 'Generate one when the item is created or fetched (e.g. `crypto.randomUUID()` while mapping the API response into state), not during render. Or use a truly unique field like an email or slug.',
        },
        {
          q: 'How can keys be used on purpose to reset a component?',
          a: 'Changing the `key` of a component tells React it is a new one, so it unmounts the old one and mounts a fresh one with clean state. Example: `<EditForm key={selectedUserId} />` resets the form when you pick another user.',
        },
      ],
    },
    {
      id: 'missing-effect-cleanup-leak',
      title: 'Debug: the app gets slower every time I open the page',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'use-effect',
      question: `Users navigate between pages many times. After a while the app is slow, and the console shows the resize handler running many times per resize event. Find the leaks and fix them.

\`\`\`jsx
function WindowInfo() {
  const [width, setWidth] = useState(window.innerWidth);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
  }, []);

  useEffect(() => {
    setInterval(async () => {
      const res = await fetch('/api/health');
      setOnline(res.ok);
    }, 5000);
  }, []);

  return <p>{width}px — {online ? 'online' : 'offline'}</p>;
}
\`\`\``,
      hints: [
        'When `WindowInfo` unmounts, does anything remove the resize listener or stop the interval?',
        'An effect can return a cleanup function. React runs it on unmount (and before the effect re-runs).',
        'To remove a listener, you must pass the **same** function to `removeEventListener`. An inline arrow can\'t be removed later.',
      ],
      solution: `**Idea:** both effects start something that lives outside React (a window listener and an interval) but never stop it. Each mount adds one more listener and one more interval. They keep running after the component is gone, calling \`setState\` on a dead component and holding memory.

\`\`\`jsx
function WindowInfo() {
  const [width, setWidth] = useState(window.innerWidth);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Named function so we can remove the SAME one later
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/health');
        if (!cancelled) setOnline(res.ok);
      } catch {
        if (!cancelled) setOnline(false);
      }
    }, 5000);

    return () => {
      cancelled = true;     // ignore a request that finishes after unmount
      clearInterval(id);    // stop future ticks
    };
  }, []);

  return <p>{width}px — {online ? 'online' : 'offline'}</p>;
}
\`\`\`

**Why it works:** every setup now has a matching cleanup. Mount → subscribe, unmount → unsubscribe. The \`cancelled\` flag covers a request that was already in flight when the component unmounted.

**Checklist of things that need cleanup:** \`addEventListener\`, \`setInterval\`/\`setTimeout\`, WebSocket/EventSource connections, third-party subscriptions (Firebase, Redux \`subscribe\`), \`IntersectionObserver\`/\`ResizeObserver\`, and in-flight fetches (\`AbortController\`).

**Tip:** StrictMode in development mounts → unmounts → mounts once. Without cleanup you would see two listeners right away, which makes these leaks easy to catch.`,
      followUps: [
        {
          q: 'React used to warn "Can\'t perform a React state update on an unmounted component". Where did it go?',
          a: 'React 18 removed that warning because it was often a false alarm (e.g. a fetch finishing after unmount is harmless). Real leaks — subscriptions that are never removed — still matter; you find them with cleanup discipline and memory profiling.',
        },
        {
          q: 'How do you find a memory leak in a React app?',
          a: 'Chrome DevTools → Memory tab: take a heap snapshot, navigate to and away from the page several times, take another snapshot and compare. Look for detached DOM nodes and growing listener counts (Elements → Event Listeners panel).',
        },
      ],
    },
    {
      id: 'fetch-race-condition',
      title: 'Debug: the profile shows the wrong user (race condition)',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'use-effect',
      question: `A user clicks quickly: user 1, then user 2. Sometimes the page shows "user 2" selected in the sidebar but **user 1's** profile. Why? Fix it.

\`\`\`jsx
function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/users/' + userId)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]);

  if (!user) return <Spinner />;
  return <h1>{user.name}</h1>;
}
\`\`\``,
      hints: [
        'Two requests are in flight. Do network responses always come back in the order you sent them?',
        'When `userId` changes, React runs the old effect\'s cleanup first. What could the cleanup do to the old request?',
        'Use `AbortController` (or an `ignore` flag) in the cleanup.',
      ],
      solution: `**Idea:** request 1 is slow, request 2 is fast. Request 2 finishes first and shows user 2. Then request 1 finishes and **overwrites** it with user 1. The last response wins, not the last request. Fix: when \`userId\` changes, cancel or ignore the old request in the effect cleanup.

\`\`\`jsx
function Profile({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setUser(null);   // show the spinner for the new user
    setError(null);

    fetch('/api/users/' + userId, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        if (err.name === 'AbortError') return; // we cancelled it on purpose
        setError(err);
      });

    // Runs when userId changes (before the next effect) and on unmount
    return () => controller.abort();
  }, [userId]);

  if (error) return <p>Could not load user.</p>;
  if (!user) return <Spinner />;
  return <h1>{user.name}</h1>;
}
\`\`\`

**Why it works:** when \`userId\` goes 1 → 2, React calls the cleanup of the "user 1" effect, which aborts request 1. Its promise rejects with an \`AbortError\`, which we ignore, so it can never call \`setUser\`. Aborting also saves bandwidth.

**Alternative — ignore flag** (works for any promise, not only fetch):

\`\`\`jsx
useEffect(() => {
  let ignore = false;
  getUser(userId).then((data) => {
    if (!ignore) setUser(data); // only the latest effect may set state
  });
  return () => {
    ignore = true;
  };
}, [userId]);
\`\`\``,
      followUps: [
        {
          q: 'Abort vs ignore flag — which is better?',
          a: 'Abort actually cancels the network request (saves bandwidth and server work) but only works for APIs that accept a signal (fetch, axios). The ignore flag works with any promise but the request still completes. You can combine them.',
        },
        {
          q: 'How do libraries solve this?',
          a: 'TanStack Query and SWR key data by the query key (`[\'user\', userId]`), so a late response for user 1 lands in user 1\'s cache entry and never shows on user 2\'s screen. TanStack Query also passes an `AbortSignal` to your query function.',
        },
      ],
    },
    {
      id: 'react-memo-not-working',
      title: 'Debug: React.memo does not stop re-renders',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'react-memo',
      question: `\`Chart\` is slow, so a teammate wrapped it in \`React.memo\`. But the Profiler shows it still re-renders on **every keystroke** in the search input. Why? Fix it without removing the search input.

\`\`\`jsx
const Chart = React.memo(function Chart({ data, options, onPointClick }) {
  // expensive drawing
});

function Dashboard({ sales }) {
  const [query, setQuery] = useState('');

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Chart
        data={sales.filter((s) => s.amount > 0)}
        options={{ color: 'blue', showGrid: true }}
        onPointClick={(point) => console.log(point)}
      />
    </>
  );
}
\`\`\``,
      hints: [
        '`React.memo` compares each prop with `Object.is`. Which props are new objects/functions on every render?',
        'All three are new on every render: the filtered array, the options object, and the arrow function.',
        'Constants can move outside the component. Derived values use `useMemo`. Functions use `useCallback`.',
      ],
      solution: `**Idea:** \`React.memo\` does a shallow compare: "is each prop the same reference as last time?". Every render of \`Dashboard\` creates a **new** array (\`filter\`), a **new** options object, and a **new** function. So every prop "changed", and memo does nothing.

\`\`\`jsx
// 1. Never changes -> move it out of the component (created once)
const CHART_OPTIONS = { color: 'blue', showGrid: true };

const Chart = React.memo(function Chart({ data, options, onPointClick }) {
  // expensive drawing
});

function Dashboard({ sales }) {
  const [query, setQuery] = useState('');

  // 2. Derived from props -> useMemo, recomputed only when sales changes
  const positiveSales = useMemo(() => sales.filter((s) => s.amount > 0), [sales]);

  // 3. Function prop -> useCallback keeps the same function
  const handlePointClick = useCallback((point) => {
    console.log(point);
  }, []);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Chart data={positiveSales} options={CHART_OPTIONS} onPointClick={handlePointClick} />
    </>
  );
}
\`\`\`

**Why it works:** typing changes only \`query\`. All three props keep the same references, so the shallow compare passes and \`Chart\` skips rendering.

**Even simpler fix — move state down:** put the input and its \`query\` state in its own \`SearchBox\` component. Then typing re-renders only \`SearchBox\`, and \`Dashboard\`/\`Chart\` don't re-render at all, with no memo needed.

**Other memo breakers:** passing \`children\` JSX (\`<Chart><Legend /></Chart>\` creates new elements each render), spreading \`{...props}\` from a parent that builds new objects, and reading a context that changes.`,
      followUps: [
        {
          q: 'Should you wrap every component in React.memo?',
          a: 'No. The prop comparison has a cost, and it only helps if props are actually stable. Use it for components that are expensive to render and re-render often with the same props. Measure with the Profiler first.',
        },
        {
          q: 'What does React Compiler change here?',
          a: 'React Compiler (an opt-in build-time tool) automatically memoizes components and values, so much of this manual useMemo/useCallback work goes away. Check the current docs for how to enable it in your setup; understanding the reference-equality problem still matters for interviews.',
        },
        {
          q: 'Can you give React.memo a custom comparison?',
          a: 'Yes: `React.memo(Component, (prevProps, nextProps) => isEqual)`. Return true to **skip** the render. Be careful: if you forget a prop, the component shows stale data.',
        },
      ],
    },
    {
      id: 'effect-order-parent-child-output',
      title: 'Output: render and effect order for parent and child',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'use-layout-effect',
      question: `No StrictMode. \`<Parent />\` mounts for the first time. Write the logs in order.

\`\`\`jsx
function Child() {
  console.log('Child render');
  useLayoutEffect(() => console.log('Child layout effect'));
  useEffect(() => console.log('Child effect'));
  return <p>child</p>;
}

function Parent() {
  console.log('Parent render');
  useLayoutEffect(() => console.log('Parent layout effect'));
  useEffect(() => console.log('Parent effect'));
  return <Child />;
}
\`\`\`

Bonus: what is logged when \`<Parent />\` is removed, if every effect returns a cleanup that logs "... cleanup"?`,
      hints: [
        'Rendering goes top-down: a parent must render to know which children exist.',
        'Effects run bottom-up: a parent\'s effect can expect its children to be ready.',
        'All layout effects run (synchronously, before paint) before any normal `useEffect`.',
      ],
      solution: `**Output:**

\`\`\`text
Parent render
Child render
Child layout effect
Parent layout effect
Child effect
Parent effect
\`\`\`

**Why:**
1. **Render phase (top-down):** \`Parent\` runs first, returns \`<Child />\`, then React calls \`Child\`.
2. **Commit:** React updates the DOM.
3. **Layout effects (bottom-up):** run synchronously after the DOM update but **before the browser paints**. The child goes first, so when the parent's effect runs, the child's DOM and effects are ready.
4. **Passive effects (\`useEffect\`, bottom-up):** run after that, usually after the browser has painted.

**Bonus — unmount:**

\`\`\`text
Parent layout effect cleanup
Child layout effect cleanup
Parent effect cleanup
Child effect cleanup
\`\`\`

On unmount, React runs cleanups **parent first, then child** — all layout cleanups, then all passive cleanups.

**When to use useLayoutEffect:** to measure the DOM (sizes, positions) and adjust before paint, so the user never sees a flicker — e.g. positioning a tooltip. It blocks painting, so use \`useEffect\` for everything else.`,
      followUps: [
        {
          q: 'On a re-render (not mount), what order do cleanup and setup happen in?',
          a: 'For each effect type, React first runs the cleanups of the effects that changed (from the previous render), then the new setups. Layout effect cleanup+setup happens before paint; passive effect cleanup+setup happens afterwards.',
        },
        {
          q: 'Why does useLayoutEffect warn during server rendering?',
          a: 'There is no DOM and no layout on the server, so the effect can\'t run there. Older React versions printed a warning; the common fix is to use `useEffect` or render the measuring component only on the client.',
        },
      ],
    },
    {
      id: 'controlled-form-validation',
      title: 'Build a sign-up form with validation',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'forms-controlled-uncontrolled',
      question: `Build a sign-up form with **email**, **password** and **confirm password**, without a form library.

- Email: required, must look like an email.
- Password: at least 8 characters.
- Confirm: must match the password.
- Show an error only after the user leaves a field (blur) **or** tries to submit — not while they type the first letter.
- Disable the button and show "Signing up…" while submitting. Show a server error if the API call fails.`,
      hints: [
        'Keep all values in one state object, and use the input `name` attribute to update the right field.',
        'Errors can be **calculated** from the values on every render — no separate errors state needed. Keep a `touched` object to decide when to **show** them.',
        'On submit: `e.preventDefault()`, mark every field as touched, and stop if there are errors.',
      ],
      solution: `**Idea:** controlled inputs store values in state. A pure \`validate\` function derives errors from values. A \`touched\` map controls when to show each error.

\`\`\`jsx
import { useState } from 'react';

const initialValues = { email: '', password: '', confirm: '' };

// Pure function: easy to unit test
function validate(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!/^\\S+@\\S+\\.\\S+$/.test(values.email)) errors.email = 'Enter a valid email';
  if (values.password.length < 8) errors.password = 'Use at least 8 characters';
  if (values.confirm !== values.password) errors.confirm = 'Passwords do not match';
  return errors;
}

export function SignupForm({ onSignup }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = validate(values); // derived on every render
  const hasErrors = Object.keys(errors).length > 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser's full page reload
    setTouched({ email: true, password: true, confirm: true });
    if (hasErrors || submitting) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onSignup({ email: values.email, password: values.password });
      setValues(initialValues);
      setTouched({});
    } catch (err) {
      setServerError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  // Show an error only for touched fields
  const errorFor = (name) => (touched[name] ? errors[name] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={values.email}
        onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errorFor('email')} />
      {errorFor('email') && <p role="alert">{errorFor('email')}</p>}

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" value={values.password}
        onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errorFor('password')} />
      {errorFor('password') && <p role="alert">{errorFor('password')}</p>}

      <label htmlFor="confirm">Confirm password</label>
      <input id="confirm" name="confirm" type="password" value={values.confirm}
        onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errorFor('confirm')} />
      {errorFor('confirm') && <p role="alert">{errorFor('confirm')}</p>}

      {serverError && <p role="alert">{serverError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Signing up…' : 'Sign up'}
      </button>
    </form>
  );
}
\`\`\`

**Why it works:**
- One \`handleChange\` serves all inputs thanks to \`[name]: value\` (computed property name).
- Errors are derived, so they are never out of sync with the values.
- \`touched\` makes the form friendly: no red text before the user has finished a field.
- \`submitting\` blocks double submits; \`finally\` always re-enables the button.
- \`noValidate\` turns off the browser's own popups so our messages are used; \`role="alert"\` makes screen readers announce errors.

**Remember:** client validation is for UX only. The server must validate again.`,
      followUps: [
        {
          q: 'This form re-renders on every keystroke. When does that matter, and what would you use instead?',
          a: 'For small forms it is fine. For big forms (50+ fields) use react-hook-form: it uses uncontrolled inputs with refs, so typing does not re-render the whole form, and it supports schema validation (Zod/Yup).',
        },
        {
          q: 'How would you share validation rules with the Node backend?',
          a: 'Define a Zod schema in a shared package and use it on both sides: `schema.safeParse(values)` on the client for messages and in the API route to reject bad input. One source of truth.',
        },
      ],
    },
    {
      id: 'theme-toggle-context',
      title: 'Build a dark/light theme toggle with Context',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'context-api',
      question: `Build a theme system:

- \`<ThemeProvider>\` wraps the app.
- Any component can call \`useTheme()\` to get \`{ theme, toggleTheme }\`.
- The theme is saved in localStorage and applied to \`<html data-theme="dark">\` so CSS can use it.
- Using \`useTheme()\` outside the provider should throw a clear error.
- Avoid needless re-renders of all consumers when the provider's parent re-renders.`,
      hints: [
        'Create the context with `createContext(null)`, hold the theme with `useState` inside the provider.',
        'Syncing to `document.documentElement` and localStorage is a side effect → `useEffect`.',
        'If you pass `{ theme, toggleTheme }` as a new object each render, every consumer re-renders. Use `useMemo` and `useCallback`.',
      ],
      solution: `**Idea:** a provider component owns the state and shares it through context. A custom hook hides \`useContext\` and checks the provider exists.

\`\`\`jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // storage blocked -> fall through
  }
  // Respect the OS setting on the first visit
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme); // lazy init

  useEffect(() => {
    document.documentElement.dataset.theme = theme; // <html data-theme="dark">
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    []
  );

  // Same object until theme changes -> consumers don't re-render for nothing
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

// Usage
function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</button>;
}
\`\`\`

\`\`\`css
:root { --bg: #fff; --text: #111; }
:root[data-theme='dark'] { --bg: #111; --text: #eee; }
body { background: var(--bg); color: var(--text); }
\`\`\`

**Why it works:** every component that calls \`useTheme()\` re-renders only when \`value\` changes, which happens only when \`theme\` changes. CSS variables do the actual styling, so switching themes is cheap.

**Note:** in React 19 you can render \`<ThemeContext value={value}>\` directly instead of \`<ThemeContext.Provider>\`.`,
      followUps: [
        {
          q: 'In Next.js (SSR), the page flashes light before switching to dark. Why and how do you fix it?',
          a: 'The server doesn\'t know the saved theme, so it renders the default, and React applies the real theme only after hydration. Fix: a tiny inline script in `<head>` that reads localStorage and sets `data-theme` before the first paint (libraries like next-themes do this), or store the theme in a cookie the server can read.',
        },
        {
          q: 'When is Context a bad choice for state?',
          a: 'For values that change very often (mouse position, typing in a big form) consumed by many components — all consumers re-render on every change. Split contexts (state vs actions), or use a store with selectors like Zustand or Redux.',
        },
      ],
    },
    {
      id: 'protected-routes-react-router',
      title: 'Protect routes so only logged-in users can see them',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'react-router-v6',
      question: `Using React Router v6, protect \`/dashboard\` and \`/settings\`:

- Not logged in → redirect to \`/login\`.
- After login, send the user back to the page they originally wanted.
- While the auth check is still loading (e.g. calling \`/api/me\`), don't flash the login page.
- Bonus: \`/admin\` only for users with role \`admin\`.

Assume a \`useAuth()\` hook that returns \`{ user, loading }\`.`,
      hints: [
        'Make a layout route component that renders `<Outlet />` if the user is allowed, otherwise `<Navigate />`.',
        'Pass the current location in navigation state: `<Navigate to="/login" state={{ from: location }} replace />`.',
        'Check `loading` first and return a spinner, so you don\'t redirect before you know the answer.',
      ],
      solution: `**Idea:** a guard component used as a **layout route**. All protected routes are nested inside it. It decides: show a spinner, redirect, or render the child route via \`<Outlet />\`.

\`\`\`jsx
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

function RequireAuth({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />; // don't decide too early

  if (!user) {
    // replace: the protected URL is not kept in history, so "Back" works nicely
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />; // render the matched child route
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<Forbidden />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route element={<RequireAuth roles={['admin']} />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  async function handleLogin(credentials) {
    await login(credentials);
    navigate(from, { replace: true }); // back to where the user wanted to go
  }

  return <LoginForm onSubmit={handleLogin} />;
}
\`\`\`

**Why it works:** the guard runs before any protected page renders. Using a layout route means you write the check **once** for many pages. Saving \`from\` in navigation state lets login send the user back.

**Important:** this is **UX only**. Anyone can change JavaScript in the browser. The API must check the session/token and the role on every request; the frontend guard just avoids showing pages the user can't use.`,
      followUps: [
        {
          q: 'How would you do this with React Router data loaders?',
          a: 'In a loader of a parent route, check auth and `throw redirect(\'/login\')` (or return it) before the page renders. This avoids rendering and then redirecting, and the check runs before data fetching starts.',
        },
        {
          q: 'How is this done in Next.js?',
          a: 'Use middleware to redirect unauthenticated requests before the page loads, and also check the session in server components / route handlers that read protected data. Check the current Next.js docs, as the recommended pattern has changed across versions.',
        },
      ],
    },
    {
      id: 'page-rerenders-on-keystroke',
      title: 'Scenario: the whole page lags while typing',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 're-render-causes',
      question: `A product page has a search input at the top, a big product grid, a sidebar with filters, and a chart. Typing in the search input feels laggy — each key appears late. The React Profiler shows the **whole page** re-renders on every keystroke.

\`\`\`jsx
function ProductPage({ products }) {
  const [search, setSearch] = useState('');
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <Sidebar />
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <SalesChart products={products} />
      <ProductGrid products={filtered} />
    </Layout>
  );
}
\`\`\`

How do you investigate and fix it? Give concrete steps.`,
      hints: [
        'A state change re-renders the component that owns the state and all its children. Who owns `search`?',
        'Which parts actually need `search`? Only the grid. Can the state live closer to them?',
        'If the grid itself is the slow part, look at `useDeferredValue` (keep typing fast, render the grid a bit later).',
      ],
      solution: `**Idea:** \`search\` lives at the top of the page, so every keystroke re-renders \`Sidebar\`, \`SalesChart\` and \`ProductGrid\`. First **measure**, then make the re-render smaller, then make the remaining work cheaper.

**Step 1 — measure.** React DevTools Profiler → record while typing → see which components render and how long they take. Turn on "Highlight updates when components render".

**Step 2 — move the state down (colocation).** Only the input and the grid need \`search\`:

\`\`\`jsx
function ProductPage({ products }) {
  return (
    <Layout>
      <Sidebar />
      <SalesChart products={products} />    {/* no longer re-renders on typing */}
      <SearchableGrid products={products} />
    </Layout>
  );
}

function SearchableGrid({ products }) {
  const [search, setSearch] = useState('');
  // Keep the input instant; let the heavy grid lag behind a little
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, deferredSearch]);

  return (
    <>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <ProductGrid products={filtered} />
    </>
  );
}

// Memo so it skips rendering while deferredSearch hasn't caught up yet
const ProductGrid = React.memo(function ProductGrid({ products }) {
  return products.map((p) => <ProductCard key={p.id} product={p} />);
});
\`\`\`

**Step 3 — make the heavy part cheaper:**
- \`useDeferredValue\`: React renders the urgent update (the input) first and the grid in the background; new keystrokes interrupt old background renders.
- \`React.memo\` on expensive children with stable props.
- Virtualize the grid if it has hundreds of items (render only what is visible).
- If search hits the server, **debounce** the request.

**Step 4 — check other causes:** a context provider above the page whose \`value\` is a new object every render; inline objects passed to memoized components; heavy work in render (sorting, formatting dates) that should be memoized.`,
      followUps: [
        {
          q: 'What is the "children as props" trick?',
          a: 'If a stateful wrapper receives expensive parts as `children`, those elements are created by the parent, so when the wrapper\'s state changes, React re-uses the same `children` elements and doesn\'t re-render them. It is a way to avoid re-renders without memo.',
        },
        {
          q: 'useDeferredValue vs useTransition?',
          a: 'Both mark work as non-urgent. `useTransition` wraps the **state update** you control (`startTransition(() => setFilter(x))`). `useDeferredValue` wraps a **value** you receive (e.g. a prop or state you can\'t wrap). Neither adds a fixed delay like debounce.',
        },
      ],
    },
    {
      id: 'prop-drilling-five-levels',
      title: 'Scenario: a prop is drilled through 5 components',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'composition-vs-inheritance',
      question: `The \`user\` object is passed like this: \`App → Layout → Sidebar → Menu → MenuFooter → Avatar\`. Only \`Avatar\` uses it. The middle components just pass it on. A teammate wants to add Redux to "fix" it.

What options do you have, and which would you choose? Show code for your preferred fix.`,
      hints: [
        'Before reaching for global state: can `App` render `<Avatar user={user} />` itself and pass the element down?',
        'If many unrelated components need `user`, Context is built exactly for that.',
        'A global store adds value when state is updated from many places or needs selectors/devtools — not just to avoid passing props.',
      ],
      solution: `**Idea:** prop drilling is not always bad — it is explicit. It hurts when many layers pass props they don't use. Fix in this order: **composition → Context → a store**.

**Option 1 — composition (pass elements, not data).** The middle components accept \`children\` or "slot" props. The data is used where it lives.

\`\`\`jsx
function App() {
  const user = useCurrentUser();
  return (
    <Layout sidebar={<Sidebar footer={<Avatar user={user} />} />}>
      <Dashboard />
    </Layout>
  );
}

function Layout({ sidebar, children }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

function Sidebar({ footer }) {
  return (
    <nav>
      <Menu />
      <div className="menu-footer">{footer}</div>
    </nav>
  );
}
\`\`\`

\`Layout\` and \`Sidebar\` no longer know about \`user\` at all.

**Option 2 — Context**, when many components at different depths need it (current user, theme, locale):

\`\`\`jsx
const UserContext = createContext(null);

function App() {
  const user = useCurrentUser();
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}

function Avatar() {
  const user = useContext(UserContext); // read it directly, no drilling
  return <img src={user.avatarUrl} alt={user.name} />;
}
\`\`\`

**Option 3 — a store (Zustand, Redux Toolkit)**, when the state is updated from many places, changes often, or you need selectors (subscribe to only part of the state) and devtools.

**My choice here:** composition first — it is free and keeps components reusable. If \`user\` is needed in 5+ places across the app, Context. Redux only if there are other reasons for it; it is too heavy just for this.`,
      followUps: [
        {
          q: 'What is the downside of Context here?',
          a: 'Components that read the context are tied to the provider (harder to reuse/test without it), and every consumer re-renders when the value changes. For data that rarely changes, like the current user, that\'s fine.',
        },
        {
          q: 'If the user comes from the API, what about TanStack Query?',
          a: 'Then it is **server state**. `useQuery({ queryKey: [\'me\'], queryFn: fetchMe })` can be called in `Avatar` directly; the cache dedupes requests, so every component can read it without drilling or a separate store.',
        },
      ],
    },
    {
      id: 'use-interval-hook',
      title: 'Write a useInterval hook (pause, change speed, no stale state)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'custom-hooks',
      question: `Write \`useInterval(callback, delay)\`:

- Calls \`callback\` every \`delay\` ms.
- \`delay = null\` pauses it.
- The callback can read the **latest** props/state (no stale closures).
- Changing the callback must **not** restart the timer; changing \`delay\` should.

\`\`\`jsx
function Clock({ step }) {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);

  useInterval(() => setCount(count + step), running ? 1000 : null);

  return <button onClick={() => setRunning((r) => !r)}>{count}</button>;
}
\`\`\``,
      hints: [
        'The caller passes a new callback every render. If you put it in the effect deps, the interval restarts every render.',
        'Store the latest callback in a ref. The interval calls `savedCallback.current()` — always the newest function.',
        'The effect that sets up `setInterval` depends only on `delay`. If `delay === null`, set up nothing.',
      ],
      solution: `**Idea:** separate "what to run" from "when to run". The **what** (callback) is kept fresh in a ref on every render. The **when** (interval) is set up in an effect that depends only on \`delay\`.

\`\`\`jsx
import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // After every render, remember the newest callback.
  // It sees the newest props and state through its closure.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return; // paused: no interval

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id); // on delay change, pause, or unmount
  }, [delay]);
}
\`\`\`

**Why it works:**
- The interval's own function never changes; it just calls \`savedCallback.current\`, which was updated after the last render. So \`count + step\` uses the latest values — no stale closure.
- New callback each render → only the ref changes, the interval keeps running with the same rhythm.
- \`delay\` changes or becomes \`null\` → the cleanup clears the old interval and a new one starts (or none).

**Edge cases:** \`delay = 0\` is a valid delay, so check \`delay === null\` (not \`!delay\`). Cleanup on unmount prevents leaks.

**Newer React:** React 19.2 added \`useEffectEvent\` for exactly this "latest callback" pattern (\`const onTick = useEffectEvent(callback)\`). Check the docs for your version; the ref pattern works everywhere.`,
      followUps: [
        {
          q: 'Why is setInterval inaccurate, and how would you build an accurate countdown?',
          a: 'Timers are delayed when the main thread is busy, and browsers throttle them in background tabs. For a countdown, store the **end timestamp** and on each tick compute `remaining = end - Date.now()`, so drift never accumulates.',
        },
        {
          q: 'Why update the ref in an effect and not directly during render?',
          a: 'Writing refs during render is a side effect; in concurrent rendering, a render can be thrown away, and the ref would point to a callback from a render that never committed. Updating in an effect (or layout effect) only uses committed renders.',
        },
      ],
    },
    {
      id: 'use-fetch-hook',
      title: 'Write a useFetch hook with abort, errors and refetch',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'custom-hooks',
      question: `Write \`useFetch(url)\` that returns \`{ data, error, loading, refetch }\`.

- Fetch when \`url\` changes. If \`url\` is \`null\`, do nothing (useful for "wait until we have an id").
- Treat HTTP errors (404, 500) as errors — \`fetch\` does not reject for them.
- No race conditions: a slow old response must never overwrite a newer one.
- No state updates after unmount.
- \`refetch()\` loads the same URL again.

\`\`\`jsx
function Orders({ customerId }) {
  const { data, error, loading, refetch } = useFetch(
    customerId ? '/api/customers/' + customerId + '/orders' : null
  );
  // ...
}
\`\`\``,
      hints: [
        'One effect with `[url]` in its dependencies. Create an `AbortController` inside and abort it in the cleanup.',
        'Check `res.ok` and throw if it is false. In `catch`, ignore errors whose `name` is `AbortError`.',
        'For `refetch`, keep a counter in state and add it to the effect dependencies. `refetch` just increments it.',
      ],
      solution: `**Idea:** one effect owns the request. Its cleanup aborts the request, which fixes both race conditions and updates after unmount. A "reload counter" in the dependencies lets us re-run the effect on demand.

\`\`\`jsx
import { useCallback, useEffect, useState } from 'react';

export function useFetch(url) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(url) });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!url) {
      setState({ data: null, error: null, loading: false });
      return;
    }

    const controller = new AbortController();
    // Keep old data while loading (nicer UI than a blank screen)
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status); // fetch only rejects on network errors
        return res.json();
      })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return; // cancelled on purpose: url changed or unmounted
        setState((prev) => ({ ...prev, error, loading: false }));
      });

    return () => controller.abort();
  }, [url, reloadCount]);

  // Stable function: safe to pass to memoized children or effect deps
  const refetch = useCallback(() => setReloadCount((c) => c + 1), []);

  return { ...state, refetch };
}
\`\`\`

**Why it works:**
- **Race condition:** when \`url\` changes, React runs the old effect's cleanup first, aborting the old request. Its promise rejects with \`AbortError\`, which we ignore, so it can never set state.
- **Unmount:** the same cleanup runs on unmount.
- **HTTP errors:** \`fetch\` resolves for 404/500, so we check \`res.ok\` ourselves.
- **One state object** for data/error/loading means they always change together — no render where \`loading\` is false but \`data\` is not set yet.
- **refetch:** bumping \`reloadCount\` changes a dependency, so the effect runs again for the same URL.

**Why only \`url\` (no options object)?** Options like headers would be a new object every render → infinite refetch loop. If you add options, the caller must memoize them, or you depend on a serialized key.`,
      followUps: [
        {
          q: 'What does this hook still lack compared to TanStack Query?',
          a: 'Caching (show cached data instantly when coming back), deduping (two components, one request), background refetch on window focus, retries with backoff, pagination helpers, and mutations with cache invalidation. In production apps I would use TanStack Query or SWR.',
        },
        {
          q: 'How would you add a timeout?',
          a: 'Combine signals: `AbortSignal.any([controller.signal, AbortSignal.timeout(8000)])` in modern browsers, or start a `setTimeout` that calls `controller.abort()` and clear it in cleanup. A timeout abort has the name `TimeoutError` with `AbortSignal.timeout`, so show it as an error, not ignore it.',
        },
        {
          q: 'How would you type it in TypeScript?',
          a: '`function useFetch<T>(url: string | null): { data: T | null; error: Error | null; loading: boolean; refetch: () => void }`. Note that `res.json()` is not validated — use Zod to check the shape at runtime if the API is not fully trusted.',
        },
      ],
    },
    {
      id: 'use-media-query-hook',
      title: 'Write useMediaQuery (SSR-safe, no tearing)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'use-sync-external-store',
      question: `Write \`useMediaQuery(query)\` that returns \`true\`/\`false\` and updates live when the screen size changes.

\`\`\`jsx
function Nav() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <HamburgerMenu /> : <FullMenu />;
}
\`\`\`

First write a simple version with \`useState\` + \`useEffect\`. Then improve it with \`useSyncExternalStore\` and explain why that is better. It must not crash during server rendering (Next.js).`,
      hints: [
        '`window.matchMedia(query)` returns an object with `.matches` and a `change` event.',
        'The browser is an "external store": React doesn\'t own the value. `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` is the hook for that.',
        '`subscribe` must be stable (or React re-subscribes every render). Wrap it in `useCallback` with `[query]`.',
      ],
      solution: `**Simple version (works, but has small issues):**

\`\`\`jsx
function useMediaQuerySimple(query) {
  const [matches, setMatches] = useState(false); // false on server and first render
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches); // correct value after mount
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
\`\`\`

Issues: the first paint always uses \`false\`, then flips (a visible flash on mobile), and it needs an extra render.

**Better version with \`useSyncExternalStore\`:**

\`\`\`jsx
import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  // How to listen for changes. Stable per query.
  const subscribe = useCallback(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query]
  );

  // How to read the current value on the client (must return a primitive or cached value)
  const getSnapshot = () => window.matchMedia(query).matches;

  // What to use during server rendering and hydration
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
\`\`\`

**Why it is better:**
- On a client-only render, the **first** render already has the right value — no flash, no extra render.
- During SSR and hydration, React uses \`getServerSnapshot\` so server and client HTML match, then updates to the real value.
- It prevents **tearing**: in concurrent rendering, all components read the same snapshot during one render, so two components can't show different answers.
- \`getSnapshot\` returns a boolean, so React can compare it with \`Object.is\` cheaply. (Returning a new object each time would cause an infinite loop.)

**Note:** old Safari versions only had \`mql.addListener\`. If you must support them, fall back to it.`,
      followUps: [
        {
          q: 'Should you use JS media queries or CSS media queries?',
          a: 'Use CSS for styling and layout (no JS, no hydration issue). Use the hook only when you need to render **different components** (e.g. a drawer vs a sidebar) or change behavior.',
        },
        {
          q: 'What other things are good fits for useSyncExternalStore?',
          a: 'Browser APIs (online status, `document.visibilityState`, localStorage shared between components) and your own small stores. State libraries like Zustand and Redux use it internally.',
        },
      ],
    },
    {
      id: 'tabs-compound-components',
      title: 'Build an accessible Tabs component (compound components)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'compound-components',
      question: `Build a reusable \`Tabs\` component with this API:

\`\`\`jsx
<Tabs defaultValue="profile" onChange={(v) => console.log(v)}>
  <Tabs.List>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="billing">Billing</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="profile"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel value="billing"><BillingForm /></Tabs.Panel>
</Tabs>
\`\`\`

Requirements: the parts can be placed anywhere inside \`<Tabs>\` (even wrapped in other divs); support both **uncontrolled** (\`defaultValue\`) and **controlled** (\`value\` + \`onChange\`) use; correct ARIA roles; ids must not clash if two Tabs are on the page.`,
      hints: [
        'The parts need shared state without prop drilling. Use a Context created by `Tabs`.',
        'Controlled vs uncontrolled: if `value` prop is defined, use it; otherwise use internal state seeded from `defaultValue`.',
        'Use `useId()` in `Tabs` to make a unique prefix for the tab/panel ids.',
      ],
      solution: `**Idea:** \`Tabs\` owns the active value and shares it via Context. \`Tab\` reads it to show "selected" and to change it; \`Panel\` reads it to decide whether to render. Static properties (\`Tabs.Tab\`) group the parts.

\`\`\`jsx
import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';

const TabsContext = createContext(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* components must be used inside <Tabs>');
  return ctx;
}

export function Tabs({ value, defaultValue, onChange, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internalValue;
  const baseId = useId(); // unique per Tabs instance

  const select = useCallback(
    (next) => {
      if (!isControlled) setInternalValue(next); // uncontrolled: we own the state
      onChange?.(next);                          // always tell the parent
    },
    [isControlled, onChange]
  );

  const ctx = useMemo(() => ({ active, select, baseId }), [active, select, baseId]);

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ value, children }) {
  const { active, select, baseId } = useTabsContext();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={baseId + '-tab-' + value}
      aria-selected={selected}
      aria-controls={baseId + '-panel-' + value}
      tabIndex={selected ? 0 : -1} // only the active tab is in the Tab order
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { active, baseId } = useTabsContext();
  if (active !== value) return null; // unmount hidden panels
  return (
    <div role="tabpanel" id={baseId + '-panel-' + value} aria-labelledby={baseId + '-tab-' + value}>
      {children}
    </div>
  );
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
\`\`\`

**Why it works:**
- Context lets parts communicate at any depth, so the user decides the layout (that is the point of compound components — flexible markup, shared logic).
- The controlled/uncontrolled switch matches how native inputs work (\`value\` vs \`defaultValue\`).
- \`useId\` makes ids unique and stable between server and client (no hydration mismatch).
- \`useMemo\` on the context value avoids re-rendering every part when the parent re-renders for unrelated reasons.

**Trade-off:** returning \`null\` for hidden panels resets their state (a half-filled form is lost when switching tabs). If you need to keep it, render all panels and use the \`hidden\` attribute instead.`,
      followUps: [
        {
          q: 'How would you add keyboard support?',
          a: 'The ARIA tabs pattern: Left/Right arrows move to the previous/next tab (wrapping around), Home/End jump to first/last. Handle `onKeyDown` on the tablist, keep an ordered list of tab values (register them via context or read them from the DOM), select the new one and call `.focus()` on its button.',
        },
        {
          q: 'Compound components vs a config prop like `tabs={[{ label, content }]}`?',
          a: 'A config prop is simpler and great for uniform tabs. Compound components win when consumers need custom markup: icons, badges, wrappers, or panels placed elsewhere in the layout. Libraries like Radix use the compound pattern for that flexibility.',
        },
      ],
    },
    {
      id: 'slow-list-ten-thousand-rows',
      title: 'Scenario: a table with 10,000 rows is very slow',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'list-virtualization',
      question: `An admin page renders 10,000 orders in a table. The first load freezes the page for 2 seconds, scrolling is janky, and checking a row's checkbox takes almost a second to show.

1. Why is it slow?
2. What would you do, in what order?
3. Write a simple fixed-height **virtual list** without a library to show you understand how it works.`,
      hints: [
        'The browser has to create, style and lay out every DOM node — 10,000 rows × ~10 cells is ~100,000 nodes.',
        'Clicking one checkbox: does the parent re-render all 10,000 rows?',
        'Virtualization: only render the rows inside the visible window. You need `scrollTop`, the row height, and the viewport height.',
      ],
      solution: `**1. Why it is slow:**
- **Too many DOM nodes.** React and the browser create, style, and lay out every row, even the 9,980 the user can't see.
- **Re-rendering everything.** Selection state lives in the parent, so toggling one checkbox re-renders all 10,000 rows.
- Possibly heavy work per row in render (date formatting, currency formatting).

**2. What to do (in order):**
1. **Question the requirement:** does the user need 10,000 rows at once? Server-side **pagination** or infinite scroll + filters is often the best fix.
2. **Virtualize** (windowing): render only the ~20 visible rows plus a few extra. Libraries: TanStack Virtual, react-window, react-virtuoso.
3. **Stop full re-renders:** \`React.memo\` the row, pass stable callbacks (\`useCallback\`), and keep selection as a \`Set\` of ids so each row gets a simple \`selected\` boolean prop.
4. **Precompute** formatted values once (when data arrives), not in every render.
5. Measure with the React Profiler and Chrome Performance tab before and after.

**3. A minimal virtual list (fixed row height):**

\`\`\`jsx
import { memo, useState } from 'react';

const ROW_HEIGHT = 40;      // every row is exactly 40px tall
const VIEWPORT_HEIGHT = 400;
const OVERSCAN = 5;         // extra rows above/below so fast scrolling doesn't show blanks

export function VirtualList({ items }) {
  const [scrollTop, setScrollTop] = useState(0);

  // Which rows are visible right now?
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const end = Math.min(items.length, Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + OVERSCAN);
  const visibleItems = items.slice(start, end);

  return (
    <div
      style={{ height: VIEWPORT_HEIGHT, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* Full-height spacer so the scrollbar looks like all rows exist */}
      <div style={{ height: items.length * ROW_HEIGHT, position: 'relative' }}>
        {visibleItems.map((item, i) => (
          <Row key={item.id} item={item} top={(start + i) * ROW_HEIGHT} />
        ))}
      </div>
    </div>
  );
}

const Row = memo(function Row({ item, top }) {
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: ROW_HEIGHT }}>
      {item.customer} — {item.total}
    </div>
  );
});
\`\`\`

**Why it works:** at \`scrollTop = 4000\`, \`start = 95\` and \`end = 115\`, so only ~20 rows exist in the DOM instead of 10,000. The tall spacer keeps the scrollbar correct, and each row is absolutely positioned at \`index × ROW_HEIGHT\`. Work per scroll is O(visible rows), not O(all rows).

**Trade-offs of virtualization:** browser Ctrl+F can't find rows that aren't rendered; variable row heights need measuring (libraries handle this); screen readers need correct \`aria-rowcount\`/\`aria-rowindex\` on tables.`,
      followUps: [
        {
          q: 'What is CSS `content-visibility: auto` and can it help?',
          a: 'It tells the browser to skip layout and painting for off-screen elements. It can speed up long pages with no JS changes, but React still creates all the DOM nodes, so for 10,000 interactive rows virtualization is still better.',
        },
        {
          q: 'How do you keep "select all" fast?',
          a: 'Store selection as a `Set` of ids (or an "all selected except these ids" flag for huge server-side lists). Select-all then becomes one state change, and memoized rows only re-render if their own `selected` boolean changed.',
        },
      ],
    },
    {
      id: 'seo-for-react-spa',
      title: 'Scenario: our React SPA does not show up well on Google',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'hydration',
      question: `The marketing team says product pages of our Create-React-App/Vite SPA rank badly, and links shared on WhatsApp/LinkedIn/Slack show no title or image preview.

Explain why, and what you would change. Compare the options and say what you would pick for (a) product pages and (b) the logged-in dashboard.`,
      hints: [
        'Look at "View page source" of an SPA. What HTML does a crawler or a link-preview bot receive?',
        'Link-preview bots usually do not run JavaScript at all. They only read meta tags in the initial HTML.',
        'Server-side rendering (SSR) or static generation (SSG) sends real HTML with content and meta tags.',
      ],
      solution: `**Why:** an SPA sends an almost empty HTML file (\`<div id="root"></div>\` + a script). The content and the \`<title>\`/meta tags appear only after JavaScript runs and fetches data.
- Google can render JavaScript, but it is slower and less reliable (rendering may be delayed, errors or slow APIs mean empty content).
- Social preview bots (Open Graph for WhatsApp, LinkedIn, Slack, X) generally **do not run JavaScript**, so they see no title, description or image.
- Big JS bundles also hurt Core Web Vitals (LCP), which affects ranking.

**Options:**
1. **SSR / SSG with a framework (Next.js, Remix/React Router framework mode, Astro):** the server sends full HTML with content and meta tags. Best fix for public pages.
2. **Static generation (SSG/ISR):** pre-build product pages as HTML; very fast and cacheable on a CDN. Good when content changes not every second.
3. **Prerendering service / build-time prerender:** a headless browser snapshots pages for bots. A stop-gap for a legacy SPA — more moving parts, and serving different content to bots must be done carefully.
4. **Meta tags per route in the SPA** (React 19 can render \`<title>\` and \`<meta>\` inside components and hoists them to \`<head>\`; earlier: react-helmet). Helps Google a bit, but **not** preview bots, because it still needs JS.

**Example — Next.js App Router product page with metadata:**

\`\`\`jsx
// app/products/[slug]/page.jsx
export async function generateMetadata({ params }) {
  const { slug } = await params; // params is a Promise in recent Next.js versions
  const product = await getProduct(slug);
  return {
    title: product.name + ' | MyShop',
    description: product.summary,
    openGraph: { images: [product.imageUrl] },
    alternates: { canonical: '/products/' + slug },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug); // runs on the server; HTML includes the content
  return <ProductDetails product={product} />;
}
\`\`\`

**Also:** a \`sitemap.xml\`, \`robots.txt\`, canonical URLs, real \`<a href>\` links (not \`onClick\` navigation), semantic HTML (\`h1\`, \`alt\` text), and structured data (JSON-LD for products).

**My pick:** (a) product pages → Next.js with SSG/ISR or SSR + per-page metadata. (b) Logged-in dashboard → keep it client-rendered; Google can't and shouldn't index it, so SSR adds cost for no SEO gain. Mark it \`noindex\`.`,
      followUps: [
        {
          q: 'What is hydration and what can go wrong?',
          a: 'The server sends HTML, then React in the browser attaches event handlers to it ("hydration"). If the client renders something different (e.g. `Date.now()`, `window` checks, random ids), you get a hydration mismatch warning and React may re-render that part on the client.',
        },
        {
          q: 'How do you check what the crawler sees?',
          a: 'Use "View page source" (not DevTools Elements), `curl` the URL, Google Search Console\'s URL Inspection tool, and the debug tools of Facebook/LinkedIn for Open Graph previews.',
        },
      ],
    },
    {
      id: 'dashboard-architecture-design',
      title: 'Design: folder and component architecture for a large dashboard',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'folder-structure',
      question: `You are the first frontend engineer on a SaaS analytics dashboard (React + TypeScript). It will have: auth, a home page with 8–10 widgets (charts, KPIs, tables), reports, billing (Stripe), team settings with roles, and later an AI assistant panel. 5 more developers will join in 6 months.

Design the folder structure and the main architecture decisions: where state lives, how data is fetched, how widgets are isolated, and how you keep the codebase consistent as the team grows.`,
      hints: [
        'Group by **feature** (billing, reports, team) rather than by file type (all components in one folder, all hooks in another).',
        'Split state by kind: server data, URL state, global client state, local UI state. Each has a best tool.',
        'One broken widget should not crash the whole page. What React feature isolates failures?',
      ],
      solution: `**Idea:** feature-based folders with clear boundaries, a small shared layer, the right tool for each kind of state, and isolated widgets that load and fail independently.

**Folder structure:**

\`\`\`text
src/
  app/                    # app shell: providers, router, layouts, error pages
    providers.tsx         # QueryClientProvider, ThemeProvider, AuthProvider
    router.tsx
  features/
    auth/                 # login, useAuth, RequireAuth
    dashboard/
      widgets/
        revenue-chart/    # component + hook + types + test together
        active-users/
      DashboardPage.tsx
      widgetRegistry.ts   # list of widgets and their config
    reports/
    billing/              # Stripe checkout, invoices, plan limits
    team/                 # members, roles, invites
    assistant/            # AI panel (lazy loaded)
    each feature has:     # components/  api/  hooks/  types.ts  index.ts (public API)
  shared/
    ui/                   # Button, Modal, Table, Card (design system, no business logic)
    lib/                  # apiClient, formatters, date utils
    hooks/                # useDebounce, useMediaQuery
    types/
\`\`\`

**Rules that keep it consistent:**
- A feature exposes only what is in its \`index.ts\`. Other features import from there, never from deep inside. \`shared/\` never imports from \`features/\`. (Enforce with ESLint import rules.)
- Colocate: a widget's component, data hook, types and tests live in one folder, so deleting a widget = deleting a folder.

**State, by kind:**

- **Server state** (KPIs, reports, invoices) → TanStack Query: cache, refetch, dedupe.
- **URL state** (date range, selected team, filters) → search params: shareable, back button works.
- **Global client state** (sidebar open, current workspace) → Context or a small Zustand store.
- **Local UI state** (dropdown open, form input) → \`useState\` / react-hook-form.

**Widget isolation:**

\`\`\`tsx
function WidgetFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card title={title}>
      {/* One widget failing shows a small error box, not a blank page */}
      <ErrorBoundary fallback={<WidgetError />}>
        <Suspense fallback={<WidgetSkeleton />}>{children}</Suspense>
      </ErrorBoundary>
    </Card>
  );
}
\`\`\`

Each widget fetches its **own** data with its own query key (\`['kpi', 'revenue', range]\`), so widgets load in parallel and refresh independently. Heavy chart libraries and the AI panel are loaded with \`React.lazy\` so the first page stays small.

**Cross-cutting pieces:** a typed \`apiClient\` (auth header, 401 → logout, error format) generated or validated from the backend contract; role checks via a \`<Can permission="billing:manage">\` component (with the backend enforcing the real rules); a shared design system in \`shared/ui\`; and testing with RTL for features + Playwright for key flows (login, checkout).`,
      followUps: [
        {
          q: 'Why feature folders instead of components/, hooks/, services/ at the top?',
          a: 'Type folders grow huge and spread one feature across many places, so every change touches 5 folders. Feature folders keep related code together, make ownership clear for a growing team, and make code easy to delete or move.',
        },
        {
          q: 'When would you split this into a monorepo or micro-frontends?',
          a: 'A monorepo (Turborepo/Nx) is useful when you share code with other apps (marketing site, admin tool) — e.g. a shared `ui` and `types` package. Micro-frontends only when separate teams must deploy independently; they add a lot of complexity, so not for a 6-person team.',
        },
      ],
    },
    {
      id: 'choose-state-management',
      title: 'Design: choose state management for an e-commerce app',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'state-management',
      question: `You are building an e-commerce frontend: product listing with filters and sorting, product details, a cart (visible in the header on every page, works for guests), the logged-in user, checkout with Stripe, and order history.

The team asks: "Should we just use Redux for everything?" Decide where each piece of state should live and justify it. Show code for the cart.`,
      hints: [
        'Classify each piece: does it come from the server? Should it be in the URL? Is it shared by many components? Is it only for one component?',
        'Filters and sort order are perfect for the URL: shareable links and the back button work for free.',
        'The cart is client state shared across the app and must survive refresh for guests.',
      ],
      solution: `**Idea:** there is no single "state" — there are different **kinds** of state, and each has a best home. Redux for everything means hand-writing caching and loading logic that other tools give you for free.

- **Products, product details, order history, current user** → **TanStack Query** (server state). Why: caching, loading/error states, refetch, dedupe.
- **Filters, sort, page, search** → **URL search params**. Why: shareable links, refresh-safe, back button works.
- **Cart** → a **small global store** (Zustand or Redux Toolkit), persisted to localStorage and synced to the server when logged in. Why: used everywhere (header badge, cart page, checkout).
- **Checkout form** → **react-hook-form** + Zod. Why: validation with few re-renders.
- **Modal open, hover, accordion** → **useState** in the component. Why: nobody else cares.

**Cart store with Zustand (persisted for guests):**

\`\`\`jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(
  persist(
    (set) => ({
      items: [], // [{ productId, name, price, qty }]
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return {
            items: [...state.items, { productId: product.id, name: product.name, price: product.price, qty: 1 }],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart' } // localStorage key
  )
);

// Header: subscribes only to the count, so it re-renders only when the count changes
function CartBadge() {
  const count = useCart((state) => state.items.reduce((sum, i) => sum + i.qty, 0));
  return <span>{count}</span>;
}
\`\`\`

**Filters in the URL (React Router):**

\`\`\`jsx
function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') ?? 'popular';

  function changeSort(value) {
    const next = new URLSearchParams(searchParams);
    next.set('sort', value);
    next.delete('page'); // new sort -> back to page 1
    setSearchParams(next);
  }
  // useQuery({ queryKey: ['products', Object.fromEntries(searchParams)], ... }) reads the same params
}
\`\`\`

**Important for checkout:** prices in the cart are for display only. The server must re-read prices from the database when creating the Stripe Checkout Session / PaymentIntent — never trust client prices.

**Answer to "Redux for everything?":** No. Redux Toolkit is a fine choice for the cart if the team knows it (with RTK Query it can also handle server state). But splitting by kind of state removes most global state, so what is left is small.`,
      followUps: [
        {
          q: 'How do you merge a guest cart with the user\'s saved cart after login?',
          a: 'After login, send the local cart to an API endpoint that merges it with the server cart (e.g. sum quantities, check stock and current prices), then replace the local store with the server result and treat the server as the source of truth from then on.',
        },
        {
          q: 'Zustand vs Context for the cart?',
          a: 'Context re-renders every consumer on any cart change. Zustand lets components subscribe to a slice with a selector (the badge only re-renders when the count changes), has built-in persist middleware, and works outside React components too.',
        },
        {
          q: 'How would you make "Add to cart" feel instant if the cart is on the server?',
          a: 'Optimistic update: update the UI immediately, send the request, and roll back with an error toast if it fails. TanStack Query mutations (`onMutate` / `onError`) or React 19 `useOptimistic` support this.',
        },
      ],
    },
  ],
};
