// Redux & Redux-Saga — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'redux',
  title: 'Redux & Redux-Saga',
  icon: '🟣',
  description: 'Global state management with Redux, Redux Toolkit and RTK Query, then side effects with Redux-Saga: effects, cancellation, channels, error handling and testing.',
  definitionTitle: 'What are Redux and Redux-Saga?',
  definition: `**Redux** is a library for keeping your app's **shared state in one central place** called the **store**. Components don't change that state directly. They **dispatch actions** (plain objects like \`{ type: 'cart/add' }\`), and pure functions called **reducers** calculate the new state. This makes changes predictable and easy to debug. **Redux Toolkit (RTK)** is the modern, shorter way to write Redux.

**Redux-Saga** is a **middleware** (a helper that sits between dispatching an action and the reducer) for handling **side effects** like API calls, using generator functions. It is good for complex flows like cancelling, retrying and debouncing.

**One-line answer:** "Redux is a predictable, centralised state container where actions go through pure reducers, and Redux-Saga is middleware that manages complex async side effects using generator functions."`,
  topics: [
    {
      id: 'redux-principles',
      title: 'The Three Principles of Redux',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'One store holds all state, state is read-only (change it only by dispatching actions), and changes are made by pure reducers.',
      what: `**Redux** is a small library that keeps your app's shared data (the **state**) in one central place, and changes it in a strict, predictable way.

It has three rules:

1. **Single source of truth** — all global state lives in one object inside one **store**.
2. **State is read-only** — you never edit state directly. You **dispatch** (send) an **action**, which is a plain object that describes what happened, like \`{ type: 'cart/itemAdded' }\`.
3. **Changes are made with pure functions** — a **reducer** takes the old state and an action, and returns the new state. "Pure" means: same input gives same output, and no side effects (no API calls, no random numbers, no changing the input).

#### Deeper version
These rules give you **predictability**. Because every change goes through one dispatch → reducer path, you can log every action, replay them, and "time travel" in the DevTools. Because reducers never mutate state, Redux (and react-redux) can detect changes with a cheap reference check (\`oldState !== newState\`) instead of deep comparing objects. Side effects (API calls, timers) are pushed out of reducers into **middleware** like thunks or sagas.`,
      why: `In a big React app many components need the same data: the logged-in user, the cart, notifications. Passing it down through props gets messy, and when many places change the data you lose track of who changed what. Redux gives one place for the data and one way to change it, so bugs are easier to find and behaviour is easier to test.`,
      analogy: `Think of a bank. The **store** is the bank vault with your balance (single source of truth). You cannot walk in and change the number yourself (read-only). You fill a **deposit slip** (the action) and give it to the **teller** (the reducer). The teller follows fixed rules and writes a new balance. Every slip is kept, so you can always see the history.`,
      code: [
        {
          title: 'A pure reducer and an action',
          lang: 'javascript',
          code: `// Action: a plain object describing what happened
const addTodo = { type: 'todos/added', payload: 'Learn Redux' };

// Reducer: (oldState, action) => newState. Pure, no mutation.
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'todos/added':
      return [...state, { text: action.payload, done: false }]; // new array
    default:
      return state; // unknown action -> return the same state
  }
}

const before = [];
const after = todosReducer(before, addTodo);
console.log(after);           // [ { text: 'Learn Redux', done: false } ]
console.log(before === after); // false -> a new object was returned
console.log(before);          // [] -> old state untouched`,
        },
        {
          title: 'An IMPURE reducer (do not do this)',
          lang: 'javascript',
          code: `function badReducer(state = { items: [] }, action) {
  if (action.type === 'items/added') {
    state.items.push(action.payload);       // ❌ mutates old state
    state.id = Math.random();               // ❌ not deterministic
    fetch('/api/log');                      // ❌ side effect
    return state;                           // ❌ same reference -> UI may not update
  }
  return state;
}`,
        },
      ],
      output: `The good reducer returns a **new** array with the new task. \`before === after\` is \`false\`, which is how Redux and React know something changed. The old state \`before\` is still \`[]\`, so history is safe.

The bad reducer changes the old object in place and returns the same reference. Components using \`useSelector\` compare references, see "nothing changed", and may not re-render. It also makes time-travel debugging lie, because old states were changed too.`,
      questions: [
        { q: 'What are the three principles of Redux?', a: 'Single source of truth (one store), state is read-only (change it only by dispatching actions), and changes are made by pure reducer functions.' },
        { q: 'Why must reducers be pure?', a: 'So the result is predictable and testable, and so Redux can detect changes by comparing references. Purity also makes time-travel debugging and replaying actions possible.' },
        { q: 'Where do side effects go in Redux?', a: 'Not in reducers. They go in middleware such as Redux Thunk, Redux-Saga, or the RTK listener middleware, or in RTK Query for data fetching.' },
        { q: 'Does "single store" mean one giant reducer?', a: 'No. You split logic into many slice reducers and combine them with `combineReducers` (or the `reducer` object in `configureStore`). There is still one store and one state tree.' },
      ],
      spoken: `"Redux is built on three principles. First, a single source of truth: all global state lives in one store. Second, state is read-only: the only way to change it is to dispatch an action, which is a plain object describing what happened. Third, changes are made by pure reducers that take the old state and the action and return a new state without mutating anything. These rules make the app predictable. I can log every action, replay it in DevTools, and test reducers as simple functions. Side effects like API calls live in middleware such as thunks or sagas."`,
      mistakes: [
        'Mutating state inside a hand-written reducer (`push`, `state.x = y`) and returning the same object, so the UI does not update.',
        'Putting API calls, `Date.now()` or `Math.random()` inside a reducer. Generate such values in the action creator or a `prepare` callback instead.',
        'Putting everything in Redux, including form input state and modal open flags that only one component uses.',
        'Follow-up trap: "But Redux Toolkit lets me write `state.value++` — isn\'t that mutation?" No. RTK uses Immer, which records your changes on a draft and produces a new immutable state for you.',
      ],
      takeaway: 'One store, change it only by dispatching actions, and compute new state with pure reducers — that is what makes Redux predictable.',
    },
    {
      id: 'store-actions-reducers',
      title: 'Store, Actions, Reducers, Dispatch and Selectors',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'The store holds the state tree, actions describe events, reducers compute new state, dispatch sends an action to the store, and selectors read pieces of it.',
      what: `The core Redux pieces:

- **Action** — a plain object with a \`type\` string and usually a \`payload\` (the data). Example: \`{ type: 'counter/incremented', payload: 5 }\`.
- **Action creator** — a function that returns an action, so you do not type the object by hand every time.
- **Reducer** — a function \`(state, action) => newState\`.
- **Store** — the object that holds the state. It has \`getState()\`, \`dispatch(action)\` and \`subscribe(listener)\`.
- **Dispatch** — the only way to send an action to the store.
- **Selector** — a function that reads one piece of data from the state, e.g. \`const selectCount = (state) => state.counter.value\`. Components read through selectors instead of knowing the whole state shape (more in the "Selectors, Reselect and createSelector" topic).

#### Deeper version
When you call \`dispatch(action)\`, the action first passes through all **middleware**, then reaches the **root reducer**. The root reducer calls each slice reducer with its part of the state (that is what \`combineReducers\` does). The store saves the new state and calls every subscriber. In React, \`react-redux\` is the subscriber: each \`useSelector\` re-runs its selector and re-renders the component only if the selected value changed (by \`===\` by default).

Note: plain \`createStore\` from the \`redux\` package is marked deprecated in newer versions in favour of Redux Toolkit's \`configureStore\`. It still works; the deprecation is a nudge to use RTK.`,
      why: `Knowing the raw pieces explains what Redux Toolkit does for you. Interviewers often ask you to describe the data flow: UI → dispatch → middleware → reducer → store → UI. If you understand that loop, every Redux tool (thunk, saga, RTK Query) becomes "just something that plugs into this loop".`,
      analogy: `A restaurant: the **action** is an order slip ("2 coffees"), **dispatch** is handing the slip to the kitchen window, the **reducer** is the chef's recipe book that turns an order into food, and the **store** is the counter where the finished food (state) sits. Waiters who **subscribe** get notified when something new is on the counter.`,
      code: [
        {
          title: 'Plain Redux store (no React)',
          lang: 'javascript',
          code: `import { createStore, combineReducers } from 'redux';

// Action creators
const increment = (amount) => ({ type: 'counter/incremented', payload: amount });
const login = (name) => ({ type: 'user/loggedIn', payload: name });

// Slice reducers
function counter(state = { value: 0 }, action) {
  if (action.type === 'counter/incremented') return { value: state.value + action.payload };
  return state;
}
function user(state = { name: null }, action) {
  if (action.type === 'user/loggedIn') return { name: action.payload };
  return state;
}

// Root reducer + store
const store = createStore(combineReducers({ counter, user }));

// Selector: read one piece of the state
const selectCount = (state) => state.counter.value;

const unsubscribe = store.subscribe(() => console.log('state:', store.getState()));
store.dispatch(increment(2));
store.dispatch(login('Asha'));
console.log('count:', selectCount(store.getState()));
unsubscribe();`,
        },
        {
          title: 'Connecting to React with hooks',
          lang: 'jsx',
          code: `import { Provider, useSelector, useDispatch } from 'react-redux';

function Counter() {
  const value = useSelector((state) => state.counter.value); // read
  const dispatch = useDispatch();                              // write
  return <button onClick={() => dispatch(increment(1))}>Count: {value}</button>;
}

export default function App() {
  return (
    <Provider store={store}>   {/* makes the store available to all children */}
      <Counter />
    </Provider>
  );
}`,
        },
      ],
      output: `The first example prints:

- \`state: { counter: { value: 2 }, user: { name: null } }\`
- \`state: { counter: { value: 2 }, user: { name: 'Asha' } }\`
- \`count: 2\` (from the selector)

Each \`dispatch\` runs both slice reducers. Only the reducer that knows the action type returns a new value; the other returns its old state unchanged.

In the React example, clicking the button dispatches the action, the store updates, and \`useSelector\` sees a new \`value\`, so only \`Counter\` re-renders.`,
      questions: [
        { q: 'Explain the Redux data flow.', a: 'The UI dispatches an action. It passes through middleware, then the root reducer computes the new state. The store saves it and notifies subscribers. `useSelector` re-reads its value and the component re-renders if it changed.' },
        { q: 'What is an action creator?', a: 'A function that returns an action object, e.g. `const add = (x) => ({ type: "todos/added", payload: x })`. It avoids typos and keeps action shapes consistent. RTK `createSlice` generates them for you.' },
        { q: 'What does combineReducers do?', a: 'It builds one root reducer from several slice reducers. Each slice reducer only receives and returns its own key of the state.' },
        { q: 'Why must every reducer return the current state for unknown actions?', a: 'Because every action goes to every reducer. If a reducer returned `undefined` or a new object for unknown actions, it would break or cause needless re-renders.' },
      ],
      spoken: `"The store holds the whole state tree and exposes getState, dispatch and subscribe. Actions are plain objects with a type and a payload that describe what happened. Reducers are pure functions that take the current state and an action and return the next state. The flow is one-directional: the component dispatches an action, it goes through middleware, the root reducer calculates new state, the store notifies subscribers, and in React useSelector re-renders only the components whose selected data changed. In real projects I use Redux Toolkit, which generates the actions and reducers for me."`,
      mistakes: [
        'Forgetting the `default: return state` case, so the reducer returns `undefined` for unrelated actions.',
        'Putting non-serializable values (class instances, Promises, functions) in actions or state. It breaks DevTools and persistence.',
        'Calling `store.getState()` inside components instead of `useSelector`, so the component never re-renders on changes.',
        'Follow-up trap: "Is dispatch synchronous?" Yes — by default the reducer runs and state is updated before `dispatch` returns. Middleware like thunk can make `dispatch` return a Promise, but the reducer step itself is still synchronous.',
      ],
      takeaway: 'Dispatch an action → middleware → reducer returns new state → store notifies subscribers → UI re-renders.',
    },
    {
      id: 'react-redux-hooks',
      title: 'useSelector and useDispatch (react-redux Hooks)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'useSelector reads a piece of state and re-renders when it changes; useDispatch gives you the dispatch function.',
      what: `\`react-redux\` is the official bridge between React and Redux. You wrap your app in \`<Provider store={store}>\`, then use two hooks:

- \`useSelector(selector)\` — runs your **selector** function (a function that picks data from state) and returns the result. The component re-renders when that result changes.
- \`useDispatch()\` — returns the store's \`dispatch\` function so you can send actions.

#### Deeper version
After every dispatch, react-redux re-runs every mounted \`useSelector\` and compares the new result with the old one using **strict equality** (\`===\`). If you return a **new object or array** each time (like \`state.todos.filter(...)\` or \`{ a, b }\`), the result is never \`===\`, so the component re-renders on **every** action. Fixes: select primitive values separately, pass \`shallowEqual\` as the second argument, or use a memoized selector from \`createSelector\`.

In TypeScript, define typed hooks once: \`useAppSelector\` and \`useAppDispatch\` (with \`RootState\` and \`AppDispatch\` types). Newer react-redux versions offer \`useSelector.withTypes<RootState>()\`; check your version's docs.`,
      why: `Hooks replaced the old \`connect(mapStateToProps, mapDispatchToProps)\` higher-order component. They are shorter, work naturally in function components, and make it clear which state each component depends on — which also makes performance problems easy to spot.`,
      analogy: `\`useSelector\` is a news alert you set on your phone for one topic only ("tell me when my order status changes"). You are not woken up for every news story — only when your topic changes. \`useDispatch\` is the "send message" button to the newsroom.`,
      code: [
        {
          title: 'Reading and writing state',
          lang: 'jsx',
          code: `import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { itemAdded } from './cartSlice';

function CartBadge() {
  // ✅ returns a number -> re-renders only when the count changes
  const count = useSelector((state) => state.cart.items.length);
  return <span>{count}</span>;
}

function CartSummary() {
  // ⚠️ new object every time -> use shallowEqual to compare its fields
  const { total, currency } = useSelector(
    (state) => ({ total: state.cart.total, currency: state.cart.currency }),
    shallowEqual
  );
  return <p>{total} {currency}</p>;
}

function AddButton({ product }) {
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(itemAdded(product))}>Add</button>;
}`,
        },
        {
          title: 'Typed hooks for TypeScript',
          lang: 'typescript',
          code: `// store.ts
export const store = configureStore({ reducer: { cart: cartReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks.ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;`,
        },
      ],
      output: `\`CartBadge\` re-renders only when the number of items changes, because a number compared with \`===\` is stable.

\`CartSummary\` builds a new object every time. Without \`shallowEqual\` it would re-render after **every** action in the whole app. With \`shallowEqual\`, react-redux compares \`total\` and \`currency\` one by one and skips the render when both are the same.

\`AddButton\` dispatches \`itemAdded(product)\`, which updates the cart and triggers the two components above.`,
      questions: [
        { q: 'How does useSelector decide to re-render?', a: 'After each dispatch it re-runs the selector and compares the new result to the previous one with `===`. If they differ, the component re-renders.' },
        { q: 'Why can returning an object from useSelector hurt performance?', a: 'A new object is created on every run, so `===` always fails and the component re-renders on every action. Use separate selectors, `shallowEqual`, or a memoized selector.' },
        { q: 'useSelector vs connect?', a: 'Both subscribe to the store. `connect` is the older HOC API that also memoizes props. Hooks are simpler and the current recommendation, but you must handle memoization yourself.' },
        { q: 'Is the dispatch from useDispatch stable?', a: 'Yes. It is the same function as long as the store does not change, so it is safe to leave out of dependency arrays (though including it is harmless).' },
      ],
      spoken: `"With react-redux I wrap the app in a Provider and then use two hooks. useSelector takes a selector function, returns the selected data, and re-renders the component only if the result changes by strict equality. useDispatch gives me the dispatch function to send actions. The main gotcha is returning a new object or a filtered array from the selector, because that is a new reference every time and causes re-renders on every action. I avoid that by selecting primitives, using shallowEqual, or memoized selectors with createSelector. In TypeScript I create typed useAppSelector and useAppDispatch hooks once."`,
      mistakes: [
        'Selecting the whole state (`useSelector(s => s)`), so the component re-renders on every change anywhere in the store.',
        'Doing `.filter()` or `.map()` inside `useSelector` without memoization — it returns a new array each time.',
        'Using `useSelector` outside a `<Provider>`, which throws an error about missing context.',
        'Follow-up trap: "Does useSelector cause a re-render when an unrelated slice changes?" Only if your selector returns a new reference. The selector runs every time, but the render happens only when the result changes.',
      ],
      takeaway: 'Select the smallest value you need with useSelector, and never return a fresh object or array without memoization.',
    },
    {
      id: 'immutability-immer',
      title: 'Immutability and Immer',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Redux state must never be changed in place; Immer lets you write "mutating" code that safely produces a new immutable state.',
      what: `**Immutability** means you never change an existing object. To "update" it, you make a **copy** with the change. In Redux, reducers must return new objects instead of editing old ones.

Writing copies by hand gets ugly for nested data (lots of \`...spread\`). **Immer** is a library that fixes this. It gives you a **draft** (a proxy copy). You change the draft with normal code like \`draft.user.name = 'Ravi'\`, and Immer builds a brand-new state for you. Redux Toolkit's \`createSlice\` and \`createReducer\` use Immer automatically.

#### Deeper version
Immer wraps your state in an ES6 **Proxy**. It records which paths you touched. At the end, it creates new objects **only along the changed path** and reuses (shares) every untouched branch. This is called **structural sharing**: it is fast and keeps references stable for parts that did not change, so selectors and \`React.memo\` keep working. In development Immer also **freezes** the result, so accidental later mutation throws an error.

Rule inside an Immer reducer: either **mutate the draft** or **return a new value** — never both. Returning \`undefined\` means "use the draft".`,
      why: `Redux and React detect changes by reference (\`===\`). If you mutate, the reference stays the same and the UI does not update. Mutation also breaks time-travel debugging and makes bugs hard to find. Immer gives you the safety of immutability with the readability of simple assignments.`,
      analogy: `Immutability is like Google Docs version history: you never erase the old version; each edit makes a new version. Immer is a helper who lets you scribble on a **photocopy** (the draft). When you are done, they type up a clean new version, reusing all pages you did not touch.`,
      code: [
        {
          title: 'Spread by hand vs Immer',
          lang: 'javascript',
          code: `import { produce } from 'immer';

const state = { user: { name: 'Asha', address: { city: 'Pune' } }, posts: [] };

// Without Immer: copy every level on the path
const next1 = {
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: 'Delhi' } },
};

// With Immer: "mutate" a draft
const next2 = produce(state, (draft) => {
  draft.user.address.city = 'Delhi';
});

console.log(state.user.address.city);   // 'Pune'  -> original untouched
console.log(next2.user.address.city);   // 'Delhi'
console.log(next2.posts === state.posts); // true -> untouched branch is shared`,
        },
        {
          title: 'Immer inside createSlice',
          lang: 'javascript',
          code: `import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    todoAdded(state, action) {
      state.push(action.payload);          // ✅ OK: Immer draft
    },
    todoToggled(state, action) {
      const task = state.find((t) => t.id === action.payload);
      if (task) task.done = !task.done;    // ✅ OK
    },
    allCleared() {
      return [];                           // ✅ OK: return a new value instead
    },
    // ❌ BAD: mutate AND return -> Immer throws an error
    // broken(state) { state.push(1); return state.slice(); }
  },
});`,
        },
      ],
      output: `The original \`state\` still says \`'Pune'\` — nothing was changed in place. \`next2\` has \`'Delhi'\`. \`next2.posts === state.posts\` is \`true\` because Immer reused the untouched \`posts\` array (structural sharing).

In the slice, \`state.push\` and \`task.done = ...\` look like mutation, but they only touch the draft. Immer produces a new immutable array each time.`,
      questions: [
        { q: 'Why does Redux require immutability?', a: 'Redux and react-redux detect changes by reference comparison. Mutating keeps the same reference, so subscribers miss the change. Immutability also enables time travel and predictable debugging.' },
        { q: 'How does Immer work?', a: 'It gives you a Proxy-based draft, records your changes, and produces a new object that copies only the changed path and shares the rest (structural sharing).' },
        { q: 'Can you mutate state and return a value in an RTK reducer?', a: 'No. Either mutate the draft and return nothing, or return a completely new value. Doing both throws an error.' },
        { q: 'Is Immer slower than spread?', a: 'Slightly, because of the Proxy work, but for normal app state the difference is tiny. For very large hot loops you can write plain immutable code.' },
      ],
      spoken: `"Redux needs immutable updates because it detects changes by comparing references. If I mutate the old object, the reference stays the same and components don't re-render, and DevTools history becomes wrong. Writing nested spreads by hand is error-prone, so Redux Toolkit uses Immer. Immer gives me a draft proxy, I write simple assignments like state.items.push, and it produces a new state, copying only the changed path and sharing everything else. The one rule is: either mutate the draft or return a new value, never both."`,
      mistakes: [
        'Reassigning the draft: `state = newValue` does nothing, because it only changes the local variable. Use `return newValue` instead.',
        'Mutating state outside a reducer (for example in a component after `useSelector`). Immer freezes state in development, so this throws.',
        'Thinking spread makes a deep copy. `{ ...obj }` is shallow; nested objects are still shared.',
        'Follow-up trap: "Is `state.push()` in createSlice a mutation?" Not of the real state — it mutates the Immer draft, and Immer produces a new immutable result.',
      ],
      takeaway: 'Never change state in place; let Immer turn "mutating" draft code into a new immutable state with structural sharing.',
    },
    {
      id: 'redux-vs-context',
      title: 'Redux vs React Context',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Context is a way to pass a value down the tree; Redux is a full state manager with selective subscriptions, middleware and DevTools.',
      what: `**React Context** is a way to **pass** a value to deep components without props. It is not a state manager by itself — you usually pair it with \`useState\` or \`useReducer\`.

**Redux** is a **state management** library: one store, actions, reducers, middleware for side effects, DevTools, and fine-grained subscriptions with \`useSelector\`.

Simple rule:
- Small, rarely changing data (theme, locale, logged-in user) → Context is fine.
- Large, frequently changing, shared data with complex updates or side effects → Redux (or another store like Zustand).
- Server data (API cache) → RTK Query or React Query, not hand-written state.

#### Deeper version
The big technical difference is **re-renders**. When a Context value changes, **every** component that calls \`useContext\` for that context re-renders, even if it only uses one field. You can split contexts or memoize, but it gets complex. With Redux, each \`useSelector\` subscribes to just the slice it selects, so only the components whose data changed re-render. Redux also adds middleware (thunk, saga), a strict action log, time-travel debugging and a well-known structure for large teams. The cost is more setup and concepts.`,
      why: `Interviewers ask this to check you do not reach for Redux by habit. A good answer shows you can choose: Context for simple dependency injection, Redux for complex shared client state, and a data-fetching library for server state.`,
      analogy: `Context is a building's **intercom**: when someone speaks, every apartment on that line hears it. Redux is a **subscription service**: each person signs up only for the newsletters they care about, and gets mail only when that newsletter changes.`,
      code: [
        {
          title: 'Context: every consumer re-renders',
          lang: 'jsx',
          code: `const AppContext = createContext(null);

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  // New object each render -> ALL consumers re-render when user OR cart changes
  const value = { user, setUser, cart, setCart };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function Avatar() {
  const { user } = useContext(AppContext); // re-renders on cart changes too!
  return <img src={user?.avatar} alt="" />;
}`,
        },
        {
          title: 'Redux: subscribe to only what you need',
          lang: 'jsx',
          code: `function Avatar() {
  // Re-renders only when the avatar URL changes
  const avatar = useSelector((state) => state.user.avatar);
  return <img src={avatar} alt="" />;
}

function CartCount() {
  const count = useSelector((state) => state.cart.items.length);
  return <span>{count}</span>;
}`,
        },
      ],
      output: `With Context, adding an item to the cart creates a new \`value\` object, so \`Avatar\` re-renders even though the user did not change.

With Redux, adding an item to the cart re-runs both selectors, but only \`CartCount\` gets a new result, so only \`CartCount\` re-renders. \`Avatar\` stays as it is.`,
      questions: [
        { q: 'Is Context a replacement for Redux?', a: 'Not exactly. Context is a transport mechanism for values. Combined with useReducer it can replace Redux for small apps, but it lacks selective subscriptions, middleware and DevTools.' },
        { q: 'When would you choose Redux over Context?', a: 'When many components share state that changes often, updates are complex, you need side-effect handling, or a large team needs predictable patterns and debugging tools.' },
        { q: 'How do you reduce Context re-renders?', a: 'Split into multiple contexts, memoize the value with `useMemo`, separate state and dispatch contexts, or move to a store with selectors.' },
        { q: 'Where should server data live?', a: 'Preferably in a data-fetching cache like RTK Query or React Query, which handle caching, loading and refetching, instead of hand-written reducers.' },
      ],
      spoken: `"Context and Redux solve different problems. Context is a way to pass a value down the tree without prop drilling, and it works well for things that rarely change, like theme or the current user. But when a context value changes, every consumer re-renders. Redux is a full state manager: components subscribe with useSelector to only the slice they need, it has middleware for side effects, and great DevTools. So I use Context for simple, stable values, Redux Toolkit for complex shared client state, and RTK Query or React Query for server data."`,
      mistakes: [
        'Saying "Context is slow". It is fine for low-frequency updates; the problem is re-rendering every consumer on frequent changes.',
        'Putting one big object with everything into a single context, causing app-wide re-renders.',
        'Using Redux for purely local UI state like an input value or a dropdown open flag.',
        'Follow-up trap: "Does Redux use Context internally?" Yes — react-redux passes the **store** through Context, but the store reference never changes, so Context itself does not cause re-renders; `useSelector` subscriptions decide.',
      ],
      takeaway: 'Context passes values; Redux manages state with selective subscriptions — pick based on update frequency and complexity.',
    },
    {
      id: 'redux-toolkit',
      title: 'Redux Toolkit: configureStore and createSlice',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Redux Toolkit (RTK) is the official, modern way to write Redux: configureStore sets up the store, createSlice generates reducers and actions.',
      what: `**Redux Toolkit (RTK)** is the official package for writing Redux today (\`@reduxjs/toolkit\`). It removes most of the old boilerplate.

- \`configureStore({ reducer })\` — creates the store. It combines your reducers, adds the **thunk** middleware, adds safety checks in development, and connects the **Redux DevTools**.
- \`createSlice({ name, initialState, reducers })\` — you write reducer functions once, and RTK **generates** the action types (like \`'cart/itemAdded'\`) and action creators for you. Reducers use Immer, so you can write \`state.items.push(x)\`.

A **slice** is one feature's part of the state, plus its reducers and actions (for example \`cart\`, \`auth\`, \`ui\`).

#### Deeper version
In development, \`configureStore\` adds two check middlewares: one that throws if you **mutate** state, and one that warns if you put **non-serializable** values (Promises, class instances, functions) in state or actions. They are removed in production builds.

\`createSlice\` also has:
- \`extraReducers\` — lets the slice respond to actions it did **not** define (from other slices or from \`createAsyncThunk\`). In RTK 2.x you must use the **builder callback** form (\`builder.addCase(...)\`); the old object form was removed.
- \`prepare\` callbacks — to customise the payload (e.g. add an id with \`nanoid()\` or a timestamp) while keeping the reducer pure.
- \`selectors\` field (added in RTK 2.x) — check the docs for your version.

The \`middleware\` option is a callback: \`(getDefaultMiddleware) => getDefaultMiddleware().concat(logger)\`. Passing a plain array replaces the defaults (and in RTK 2.x the array form is no longer accepted) — so use the callback.`,
      why: `Classic Redux needed separate files for action types, action creators and reducers, plus manual store setup and spread-heavy immutable updates. RTK cuts that code by a large amount, prevents common bugs (accidental mutation), and is what the Redux team officially recommends for all new code.`,
      analogy: `Classic Redux is assembling furniture with loose screws and a hand-drawn manual. Redux Toolkit is the same furniture as a flat-pack kit: pre-drilled holes, labelled parts, and the right tools in the box.`,
      code: [
        {
          title: 'A slice and a store',
          lang: 'javascript',
          code: `import { configureStore, createSlice, nanoid } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], coupon: null },
  reducers: {
    itemAdded: {
      reducer(state, action) {
        state.items.push(action.payload);           // Immer makes this safe
      },
      prepare(product) {
        // keep reducer pure: create id/time here
        return { payload: { ...product, lineId: nanoid(), addedAt: Date.now() } };
      },
    },
    itemRemoved(state, action) {
      state.items = state.items.filter((i) => i.lineId !== action.payload);
    },
    couponApplied(state, action) {
      state.coupon = action.payload;
    },
  },
});

export const { itemAdded, itemRemoved, couponApplied } = cartSlice.actions;

export const store = configureStore({
  reducer: { cart: cartSlice.reducer },
  // middleware: (getDefault) => getDefault().concat(myLogger),
});

store.dispatch(itemAdded({ id: 'p1', name: 'Shoes', price: 50 }));
console.log(itemAdded.type);                    // 'cart/itemAdded'
console.log(store.getState().cart.items.length); // 1`,
        },
        {
          title: 'Using the slice in a component',
          lang: 'jsx',
          code: `import { useSelector, useDispatch } from 'react-redux';
import { itemAdded, itemRemoved } from './cartSlice';

export function ProductRow({ product }) {
  const dispatch = useDispatch();
  const inCart = useSelector((s) => s.cart.items.some((i) => i.id === product.id));

  return (
    <div>
      {product.name}
      <button onClick={() => dispatch(itemAdded(product))}>Add</button>
      {inCart && <small> (in cart)</small>}
    </div>
  );
}`,
        },
      ],
      output: `\`createSlice\` generated the action creator \`itemAdded\` with the type \`'cart/itemAdded'\` (slice name + reducer name). Dispatching it runs \`prepare\` first, which adds \`lineId\` and \`addedAt\`, then the reducer pushes the item into the draft. The store now has one item, so the log prints \`1\`.

In the component, \`inCart\` is a boolean, so the row only re-renders when that boolean flips.`,
      questions: [
        { q: 'What does configureStore do that createStore does not?', a: 'It combines reducers from an object, adds thunk middleware, adds dev-only immutability and serializability checks, and enables Redux DevTools — all with good defaults.' },
        { q: 'What does createSlice generate?', a: 'A reducer function, action creators for each case reducer, and action type strings in the form `sliceName/reducerName`.' },
        { q: 'What is extraReducers for?', a: 'To handle actions defined outside the slice, such as `createAsyncThunk` lifecycle actions or another slice\'s actions. In RTK 2.x it must use the builder callback.' },
        { q: 'Why use a prepare callback?', a: 'To build the payload (ids, timestamps, normalising arguments) outside the reducer, so the reducer stays pure and deterministic.' },
      ],
      spoken: `"Redux Toolkit is the official way to write Redux now. configureStore creates the store with good defaults: it combines reducers, adds thunk, adds development checks for mutation and non-serializable values, and wires up DevTools. createSlice lets me define the initial state and reducer functions in one place, and it generates the action creators and action types for me. Reducers use Immer, so I can write simple mutating code safely. For async actions or actions from other slices I use extraReducers with the builder callback. It removes most of the boilerplate people used to complain about."`,
      mistakes: [
        'Passing `middleware: [logger]` as an array, which drops thunk and the dev checks (and is rejected in RTK 2.x). Use `getDefaultMiddleware().concat(logger)`.',
        'Using the object syntax for `extraReducers` — removed in RTK 2.x. Use `builder.addCase`.',
        'Calling `nanoid()` or `Date.now()` inside the reducer instead of in `prepare`.',
        'Follow-up trap: "Can two slices respond to the same action?" Yes. Any slice can handle any action through `extraReducers` — actions are events, not "setters" owned by one slice.',
      ],
      takeaway: 'Use Redux Toolkit for all new Redux code: configureStore for setup, createSlice for reducers and generated actions.',
    },
    {
      id: 'create-async-thunk',
      title: 'Async Logic with Thunks and createAsyncThunk',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A thunk is a function you dispatch instead of an object; createAsyncThunk wraps an async call and dispatches pending/fulfilled/rejected actions for you.',
      what: `Reducers must be pure, so where do API calls go? One answer is a **thunk**. A thunk is a **function** you dispatch instead of an action object. The thunk middleware sees the function and calls it with \`dispatch\` and \`getState\`, so you can do async work and dispatch real actions when it finishes.

\`createAsyncThunk(type, payloadCreator)\` from RTK makes this easier. You give it an async function. It automatically dispatches three actions:
- \`type/pending\` — when the call starts
- \`type/fulfilled\` — with the returned data on success
- \`type/rejected\` — with the error on failure

You handle these in a slice's \`extraReducers\` to set \`status\` and \`error\`.

#### Deeper version
The payload creator receives \`(arg, thunkAPI)\`. \`thunkAPI\` has \`dispatch\`, \`getState\`, \`rejectWithValue\` (send a custom error payload), and \`signal\` (an \`AbortSignal\` you can pass to \`fetch\`).

Dispatching a thunk returns a **Promise** that always resolves with the final action. Call \`.unwrap()\` on it to get the payload directly or throw the error — handy in components for showing a toast. The returned promise also has \`.abort()\` to cancel. The \`condition\` option can skip the call (for example if data is already loading).`,
      why: `Almost every app fetches data. createAsyncThunk standardises the "loading / success / error" pattern so every request looks the same, removes hand-written action types, and supports cancellation and typed errors.`,
      analogy: `Dispatching a normal action is handing over a finished letter. Dispatching a thunk is handing over a **to-do card** that says "go to the post office, collect the parcel, then tell me". The thunk middleware is the assistant who reads the card and does the errand, reporting back with "started", "done" or "failed".`,
      code: [
        {
          title: 'createAsyncThunk + extraReducers',
          lang: 'javascript',
          code: `import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'user/fetch',
  async (userId, { signal, rejectWithValue }) => {
    const res = await fetch(\`/api/users/\${userId}\`, { signal });
    if (!res.ok) return rejectWithValue({ status: res.status }); // custom error payload
    return res.json(); // becomes action.payload of 'user/fetch/fulfilled'
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchUser.fulfilled, (state, action) => { state.status = 'succeeded'; state.data = action.payload; })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message; // payload if rejectWithValue was used
      });
  },
});
export default userSlice.reducer;`,
        },
        {
          title: 'Dispatching from a component with unwrap',
          lang: 'jsx',
          code: `import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './userSlice';

export function Profile({ id }) {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((s) => s.user);

  useEffect(() => {
    const promise = dispatch(fetchUser(id));
    promise.unwrap().catch((err) => console.log('failed:', err));
    return () => promise.abort(); // cancel if id changes or we unmount
  }, [id, dispatch]);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>Error: {JSON.stringify(error)}</p>;
  return <h2>{data?.name}</h2>;
}`,
        },
      ],
      output: `When \`Profile\` mounts, \`fetchUser(id)\` dispatches \`user/fetch/pending\` → status becomes \`'loading'\`. When the request finishes, \`user/fetch/fulfilled\` puts the user in \`data\`. If the server returns 404, \`rejectWithValue\` causes \`user/fetch/rejected\` with \`{ status: 404 }\` as the payload, and \`.unwrap()\` throws so the \`catch\` logs it.

If \`id\` changes quickly, the cleanup calls \`promise.abort()\`, the \`signal\` cancels the old fetch, and a rejected action with an \`AbortError\` is dispatched.`,
      questions: [
        { q: 'What is a thunk in Redux?', a: 'A function dispatched instead of an action object. The thunk middleware calls it with `dispatch` and `getState`, so it can run async code and dispatch actions later.' },
        { q: 'What actions does createAsyncThunk dispatch?', a: '`pending` when it starts, `fulfilled` with the returned value on success, and `rejected` with the error (or the `rejectWithValue` payload) on failure.' },
        { q: 'What does unwrap() do?', a: 'The dispatched thunk promise always resolves with an action. `.unwrap()` returns the fulfilled payload or throws the rejected error, so you can use try/catch in a component.' },
        { q: 'How do you cancel a createAsyncThunk request?', a: 'Call `.abort()` on the promise returned by dispatch, and pass `thunkAPI.signal` to `fetch` or axios so the real request is cancelled too.' },
      ],
      spoken: `"Reducers can't do async work, so I use thunks. A thunk is a function I dispatch; the thunk middleware calls it with dispatch and getState. In Redux Toolkit I use createAsyncThunk: I give it an action type and an async function, and it automatically dispatches pending, fulfilled and rejected actions. My slice handles those in extraReducers to track status and errors. For custom errors I use rejectWithValue, in components I call unwrap to get the result or catch the error, and I pass the abort signal to fetch so I can cancel stale requests."`,
      mistakes: [
        'Throwing inside the payload creator and expecting `action.payload` to hold the error. A thrown error goes to `action.error` (serialized); use `rejectWithValue` for a custom payload.',
        'Expecting `await dispatch(thunk())` to throw on failure. It resolves with a rejected action; use `.unwrap()` to throw.',
        'Hand-writing the same loading/error state for every request when RTK Query would handle caching for you.',
        'Follow-up trap: "Is thunk included by default?" Yes, `configureStore` adds redux-thunk automatically via `getDefaultMiddleware`.',
      ],
      takeaway: 'createAsyncThunk = async function + automatic pending/fulfilled/rejected actions; use rejectWithValue, unwrap and abort.',
    },
    {
      id: 'redux-middleware',
      title: 'Redux Middleware',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Middleware sits between dispatch and the reducer; it can log, change, delay, block or add side effects to actions.',
      what: `**Middleware** is code that runs **after** you call \`dispatch\` and **before** the action reaches the reducer. Every action passes through each middleware in order, like a pipeline.

Middleware can:
- log actions (redux-logger)
- handle functions instead of objects (redux-thunk)
- run side effects like API calls (redux-saga, listener middleware)
- send errors to a crash reporter
- block or transform actions

#### Deeper version
A middleware has a curried signature: \`store => next => action => { ... }\`.
- \`store\` gives \`getState\` and \`dispatch\`.
- \`next(action)\` passes the action to the **next** middleware (or the reducer at the end). If you do not call \`next\`, the action is swallowed.
- Whatever you \`return\` becomes the return value of \`dispatch\` — that is how thunk makes dispatch return a Promise.

Calling \`store.dispatch\` inside middleware starts the action from the **top** of the chain again; calling \`next\` continues from the current position. Middleware is added with \`applyMiddleware\` (classic) or the \`middleware\` callback in \`configureStore\`.`,
      why: `Reducers must be pure, but real apps need logging, analytics, API calls and error reporting. Middleware gives one central, reusable place for this cross-cutting logic, without touching components or reducers.`,
      analogy: `Middleware is the **airport security line**. Every passenger (action) walks through scanners (middlewares) before reaching the gate (reducer). One scanner logs your name, another checks your bag, another may stop you. Each one decides whether to wave you on to the next step (\`next\`).`,
      code: [
        {
          title: 'Logger and error-reporting middleware',
          lang: 'javascript',
          code: `import { configureStore } from '@reduxjs/toolkit';

const logger = (store) => (next) => (action) => {
  console.log('dispatching', action.type);
  const result = next(action);                 // let the reducer run
  console.log('next state', store.getState());
  return result;                               // becomes dispatch's return value
};

const crashReporter = () => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error('Reducer crashed on', action.type, err);
    throw err;
  }
};

export const store = configureStore({
  reducer: { counter: (s = 0, a) => (a.type === 'inc' ? s + 1 : s) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger, crashReporter),
});

store.dispatch({ type: 'inc' });`,
        },
        {
          title: 'How redux-thunk works (simplified)',
          lang: 'javascript',
          code: `const thunk = ({ dispatch, getState }) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(dispatch, getState); // run the function, return its result
  }
  return next(action);                 // plain object -> pass along
};`,
        },
      ],
      output: `Dispatching \`{ type: 'inc' }\` prints \`dispatching inc\`, then the reducer runs, then \`next state { counter: 1 }\`. The crash reporter wraps the call, so if any reducer throws, the error is logged with the action type.

The thunk example shows the whole idea of redux-thunk in 6 lines: if the "action" is a function, call it; otherwise pass it on.`,
      questions: [
        { q: 'What is the middleware signature?', a: '`store => next => action => {}`. `store` has getState/dispatch, `next` passes the action down the chain, and the inner function handles each action.' },
        { q: 'Difference between next(action) and store.dispatch(action) in middleware?', a: '`next` sends the action to the next middleware in the chain. `store.dispatch` restarts it from the first middleware. Using dispatch for the same action can cause an infinite loop.' },
        { q: 'Does middleware order matter?', a: 'Yes. Actions flow through middleware in the order listed. For example, a logger placed before thunk would log functions too.' },
        { q: 'Name some common middleware.', a: 'redux-thunk, redux-saga, RTK Query\'s API middleware, the RTK listener middleware, redux-logger, and the dev-only immutability/serializability checks.' },
      ],
      spoken: `"Middleware sits between dispatching an action and the reducer receiving it. Its signature is store, then next, then action. Inside I can log, report errors, transform the action, or start side effects, and I call next to pass the action along. If I don't call next, the action never reaches the reducer. Thunk is just a tiny middleware that checks if the action is a function and calls it with dispatch and getState. In Redux Toolkit I add custom middleware with the callback form: getDefaultMiddleware().concat(myMiddleware), so I keep thunk and the dev checks."`,
      mistakes: [
        'Forgetting to `return next(action)`, which breaks the return value of dispatch (for example thunk promises).',
        'Calling `store.dispatch(action)` with the same action inside middleware, causing an infinite loop.',
        'Doing heavy synchronous work in middleware, which slows every single dispatch.',
        'Follow-up trap: "Can middleware modify the state directly?" No. It can only dispatch actions or pass/modify actions; only reducers produce new state.',
      ],
      takeaway: 'Middleware is a pipeline (store => next => action) around dispatch — the home for logging, side effects and async.',
    },
    {
      id: 'reselect-selectors',
      title: 'Selectors, Reselect and createSelector',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Selectors read data from state; createSelector memoizes derived data so it is only recalculated when its inputs change.',
      what: `A **selector** is a function that takes the state and returns some data: \`const selectCart = (state) => state.cart\`. It keeps "where is this data?" in one place.

Some data is **derived** (calculated): the cart total, filtered lists, sorted items. Calculating it in every render is wasteful, and returning a new array each time makes \`useSelector\` re-render too often.

**Reselect** (its \`createSelector\` is re-exported by Redux Toolkit) makes **memoized** selectors. "Memoized" means it remembers the last inputs and result. If the inputs are the same (by \`===\`), it returns the **same cached result** without recalculating.

#### Deeper version
\`createSelector([inputSelector1, inputSelector2], resultFn)\`:
- Input selectors should be simple lookups (\`state => state.items\`).
- \`resultFn\` runs only when one of the input results changes by reference.
- The returned value keeps the same reference while inputs are unchanged, so \`useSelector\` does not re-render.

By default the cache size is **1** (only the last call). If the same selector is used with different arguments in many components (like \`selectItemsByCategory(state, cat)\`), they overwrite each other's cache. Fix: create one selector instance per component with \`useMemo\`, or use larger cache options (newer Reselect versions use \`weakMapMemoize\` by default and accept memoize options — check your version's docs).

Never write an input selector that returns a new value (\`state => state.items.map(...)\`) — that breaks memoization.`,
      why: `Memoized selectors give you two wins: less CPU (expensive filters/sorts run only when needed) and fewer re-renders (stable references). They also keep derived data out of the store, so you store the minimum and compute the rest.`,
      analogy: `A memoized selector is a student who keeps the answer to the last homework problem. If the teacher asks the exact same question again, the student reads the saved answer instead of solving it again. Only when the question changes do they do the work.`,
      code: [
        {
          title: 'Memoized derived data',
          lang: 'javascript',
          code: `import { createSelector } from '@reduxjs/toolkit';

// Input selectors: plain lookups
const selectItems = (state) => state.cart.items;
const selectTaxRate = (state) => state.settings.taxRate;

// Memoized selectors
export const selectSubtotal = createSelector([selectItems], (items) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0)
);

export const selectTotal = createSelector(
  [selectSubtotal, selectTaxRate],
  (subtotal, rate) => Math.round(subtotal * (1 + rate) * 100) / 100
);

export const selectExpensiveItems = createSelector([selectItems], (items) =>
  items.filter((i) => i.price > 100) // new array ONLY when items change
);

const state = { cart: { items: [{ price: 150, qty: 1 }, { price: 20, qty: 2 }] }, settings: { taxRate: 0.1 } };
console.log(selectTotal(state));                                       // 209
console.log(selectExpensiveItems(state) === selectExpensiveItems(state)); // true`,
        },
        {
          title: 'Selector with an argument, used in a component',
          lang: 'jsx',
          code: `import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

const makeSelectByCategory = () =>
  createSelector(
    [(state) => state.products.list, (state, category) => category],
    (list, category) => list.filter((p) => p.category === category)
  );

export function CategoryList({ category }) {
  // one memoized selector per component instance -> no cache fights
  const selectByCategory = useMemo(makeSelectByCategory, []);
  const products = useSelector((state) => selectByCategory(state, category));
  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}`,
        },
      ],
      output: `Subtotal is \`150*1 + 20*2 = 190\`, and with 10% tax the total is \`209\`. Calling \`selectExpensiveItems\` twice with the same state returns the **same** array (\`true\`), because \`items\` did not change, so the filter did not run again.

In \`CategoryList\`, each component gets its own selector instance, so two lists with different categories do not keep wiping each other's cache.`,
      questions: [
        { q: 'What is a memoized selector?', a: 'A selector that caches its last inputs and output. If the inputs are the same by reference, it returns the cached output without recomputing.' },
        { q: 'Why is createSelector useful with useSelector?', a: 'It returns the same reference when data has not changed, so derived arrays/objects do not trigger re-renders on unrelated actions.' },
        { q: 'What is the default cache size of createSelector?', a: 'Historically 1 (only the last call). Newer Reselect versions changed the default memoizer, so check the version; with arguments, per-component selector instances are the safe pattern.' },
        { q: 'Should you store derived data in Redux?', a: 'Usually no. Store the minimal raw state and derive totals, filters and counts with selectors, so there is one source of truth.' },
      ],
      spoken: `"Selectors are functions that read data from the store, so components don't need to know the state shape. For derived data like totals or filtered lists I use createSelector from Reselect, which Redux Toolkit re-exports. It takes input selectors and a result function, and it only recomputes when an input changes by reference; otherwise it returns the cached result. That saves CPU and, more importantly, keeps the same reference so useSelector doesn't re-render. When a selector takes an argument and is used by many components, I create one instance per component with useMemo."`,
      mistakes: [
        'Writing an input selector that transforms data (`state => state.items.filter(...)`), which returns a new array every time and defeats memoization.',
        'Using `createSelector` for a simple lookup like `state => state.user.name` — no benefit, just overhead.',
        'Sharing one argument-based selector across many components with different args, so the cache constantly misses.',
        'Follow-up trap: "Does memoization compare deeply?" No. Reselect compares inputs with `===`. That is why immutable updates matter — a new reference means "changed".',
      ],
      takeaway: 'Keep state minimal, derive the rest with createSelector, and keep input selectors as plain lookups.',
    },
    {
      id: 'normalizing-state',
      title: 'Normalizing State and createEntityAdapter',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Store collections as { ids, entities } lookup tables instead of nested arrays; createEntityAdapter gives ready-made reducers and selectors for that shape.',
      what: `**Normalizing** means storing data like a small database: each item is stored **once**, by its id, and other places refer to it by id.

Instead of:
\`posts: [{ id: 1, author: { id: 7, name: 'Asha' } }, ...]\`

you store:
\`posts: { ids: [1], entities: { 1: { id: 1, authorId: 7 } } }\` and \`users: { ids: [7], entities: { 7: { id: 7, name: 'Asha' } } }\`.

RTK's \`createEntityAdapter\` builds this shape for you and gives ready-made reducer helpers (\`addOne\`, \`addMany\`, \`setAll\`, \`updateOne\`, \`upsertMany\`, \`removeOne\`) and selectors (\`selectAll\`, \`selectById\`, \`selectIds\`, \`selectTotal\`).

#### Deeper version
Why the \`ids\` array **and** the \`entities\` object? \`entities\` gives O(1) lookup by id; \`ids\` keeps the **order** (and can be sorted automatically with the \`sortComparer\` option). Updating one item only creates a new object for that item and the \`entities\` map, so other items keep their references and their components do not re-render.

\`adapter.getInitialState({ status: 'idle' })\` lets you add extra fields next to \`ids\` and \`entities\`. \`adapter.getSelectors(state => state.posts)\` returns selectors bound to that slice. Use \`selectId\` if your id field is not called \`id\` (for example MongoDB's \`_id\`).`,
      why: `Nested, duplicated data causes bugs: if a user's name appears inside 50 posts, you must update 50 places. Finding an item in an array is O(n), and deep nesting makes immutable updates painful. Normalized state fixes all three: one copy, fast lookup, simple updates.`,
      analogy: `It is the difference between writing a friend's phone number on every page of your diary versus keeping one **contacts list** and writing just their name in the diary. When the number changes, you update one place.`,
      code: [
        {
          title: 'Entity adapter slice',
          lang: 'javascript',
          code: `import { createEntityAdapter, createSlice, configureStore } from '@reduxjs/toolkit';

const usersAdapter = createEntityAdapter({
  selectId: (user) => user._id,                         // MongoDB-style id
  sortComparer: (a, b) => a.name.localeCompare(b.name), // keep ids sorted by name
});

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState({ status: 'idle' }),
  reducers: {
    usersLoaded: usersAdapter.setAll,
    userAdded: usersAdapter.addOne,
    userUpdated: usersAdapter.updateOne, // payload: { id, changes }
    userRemoved: usersAdapter.removeOne, // payload: id
  },
});

const store = configureStore({ reducer: { users: usersSlice.reducer } });
const { usersLoaded, userUpdated } = usersSlice.actions;

store.dispatch(usersLoaded([{ _id: 'b', name: 'Ravi' }, { _id: 'a', name: 'Asha' }]));
store.dispatch(userUpdated({ id: 'b', changes: { name: 'Ravi K' } }));

export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors((state) => state.users);

console.log(store.getState().users.ids);                 // ['a', 'b']
console.log(selectUserById(store.getState(), 'b').name); // 'Ravi K'`,
        },
        {
          title: 'Reading one entity in a component',
          lang: 'jsx',
          code: `function UserName({ id }) {
  // O(1) lookup; re-renders only when THIS user object changes
  const user = useSelector((state) => selectUserById(state, id));
  return <span>{user?.name ?? 'Unknown'}</span>;
}`,
        },
      ],
      output: `After \`usersLoaded\`, the state is \`{ ids: ['a', 'b'], entities: { a: {...}, b: {...} }, status: 'idle' }\`. The ids are sorted by name because of \`sortComparer\` (Asha before Ravi), even though Ravi was loaded first.

\`userUpdated\` merges \`changes\` into user \`b\` only. \`selectUserById\` reads it in O(1) and prints \`'Ravi K'\`. A \`UserName\` component for user \`a\` does not re-render, because user \`a\`'s object reference did not change.`,
      questions: [
        { q: 'What is normalized state?', a: 'Storing each entity once in a lookup table keyed by id (plus an ordered ids array), and referencing related data by id instead of nesting copies.' },
        { q: 'Why have both ids and entities?', a: '`entities` gives fast lookup by id; `ids` preserves order and makes it easy to render lists.' },
        { q: 'What does createEntityAdapter provide?', a: 'An initial state shape `{ ids, entities }`, CRUD reducer helpers like addOne/setAll/updateOne/upsertMany/removeOne, sorting, and memoized selectors via getSelectors.' },
        { q: 'Difference between addOne, setOne and upsertOne?', a: '`addOne` ignores an item whose id already exists, `setOne` replaces it fully, and `upsertOne` inserts or shallow-merges into the existing item.' },
      ],
      spoken: `"Normalizing state means treating the Redux store like a small database. Each item is stored once in an entities object keyed by id, with an ids array for ordering, and relations are stored as ids instead of nested copies. That avoids duplicated data, gives O(1) lookups, and makes updates simple. In Redux Toolkit I use createEntityAdapter, which gives me that shape, reducer helpers like setAll, upsertMany and updateOne, optional sorting, and selectors like selectAll and selectById. If my backend uses MongoDB I set selectId to use the underscore id."`,
      mistakes: [
        'Storing the same entity in several slices and forgetting to update all copies.',
        'Forgetting `selectId` when the API uses `_id`, so every item gets `undefined` as its id.',
        'Using `addOne` for refreshed data and wondering why existing items do not update — use `upsertOne`/`setAll`.',
        'Follow-up trap: "Is RTK Query normalized?" No — RTK Query caches each endpoint response separately ("document cache"). You can combine it with an entity adapter in `transformResponse` if you need normalization.',
      ],
      takeaway: 'Store each entity once by id ({ ids, entities }) and let createEntityAdapter handle the CRUD and selectors.',
    },
    {
      id: 'redux-devtools',
      title: 'Redux DevTools and Time-Travel Debugging',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A browser extension that shows every action, the state before and after, diffs, and lets you jump back in time.',
      what: `**Redux DevTools** is a browser extension (Chrome, Firefox, Edge). It connects to your store and shows:
- a list of every dispatched **action**, in order
- the **state** after each action, and a **diff** (what changed)
- the action payload
- a **time-travel** slider to jump to any earlier state

\`configureStore\` connects to it automatically in development. With plain Redux you had to wire it up by hand.

#### Deeper version
Time travel works because reducers are pure and state is immutable: DevTools can recompute or restore any past state. Useful features:
- **Jump / Skip** — jump to a past state, or skip one action to see the app without it.
- **Trace** — with \`devTools: { trace: true }\`, see the code line that dispatched an action (has a performance cost, use only in dev).
- **Dispatch** — send a custom action by hand from the extension.
- **Export / import** — save the action log and share it with a teammate to reproduce a bug.
- \`actionsDenylist\` — hide noisy actions (for example WebSocket ticks).

In production you usually disable it (\`devTools: process.env.NODE_ENV !== 'production'\`) to avoid exposing state.`,
      why: `Bugs in state are hard to find with \`console.log\`. DevTools shows exactly which action changed which field, in what order — so "why is the cart empty?" becomes a 30-second check. It also explains why non-serializable values are discouraged: DevTools cannot show them.`,
      analogy: `It is a **CCTV recording** of your app's state. You can rewind to any moment, see who walked in (which action), and what they moved (the diff).`,
      code: [
        {
          title: 'Configuring DevTools in configureStore',
          lang: 'javascript',
          code: `import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  devTools:
    process.env.NODE_ENV !== 'production'
      ? {
          name: 'Shop App',                     // label in the extension
          trace: true,                          // show where actions were dispatched
          traceLimit: 25,
          actionsDenylist: ['socket/priceTick'], // hide noisy actions
        }
      : false,                                  // off in production
});`,
        },
      ],
      output: `In development the extension shows "Shop App". Every action appears in the left list (except \`socket/priceTick\`). Clicking one shows its payload, the full state and a diff. The Trace tab shows the file and line that dispatched it. In production, DevTools is disabled, so users cannot inspect the store.`,
      questions: [
        { q: 'What is time-travel debugging?', a: 'Moving back and forth through the list of dispatched actions to see the state at any point. It works because reducers are pure and state is immutable.' },
        { q: 'Why should state be serializable?', a: 'So DevTools can display, export and replay it, and so tools like redux-persist can save it. Functions, Promises and class instances cannot be serialized cleanly.' },
        { q: 'Should DevTools be enabled in production?', a: 'Usually no, because it exposes all state to anyone with the extension and adds overhead. Disable it with the `devTools` option.' },
      ],
      spoken: `"Redux DevTools is a browser extension that records every dispatched action with its payload, the resulting state, and a diff. configureStore connects it automatically in development. I can time-travel by jumping to earlier actions, skip actions, dispatch actions manually, and with trace enabled I can see the exact line that dispatched something. This works because reducers are pure and state is immutable and serializable. I usually turn it off in production and use actionsDenylist to hide very noisy actions like socket ticks."`,
      mistakes: [
        'Storing non-serializable values (Dates as objects, Maps, class instances), which show up badly in DevTools and break replay. Store ISO strings or timestamps.',
        'Leaving trace on everywhere — it captures stack traces for every action and slows the app.',
        'Shipping DevTools enabled in production with sensitive data in state.',
        'Follow-up trap: "Can DevTools time-travel effects like API calls?" No. It replays state, not side effects; your API calls and saga side effects are not re-run.',
      ],
      takeaway: 'DevTools turns your action log into a rewindable recording — keep state serializable and disable it in production.',
    },
    {
      id: 'redux-persist',
      title: 'redux-persist: Saving State Across Reloads',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'redux-persist saves chosen slices of the store to storage (like localStorage) and loads them back ("rehydrates") on app start.',
      what: `When you refresh the page, the Redux store starts empty again. **redux-persist** saves parts of the store to a storage engine (\`localStorage\` on web, \`AsyncStorage\` on React Native) and restores them when the app starts. Restoring is called **rehydration**.

Main pieces:
- \`persistReducer(config, reducer)\` — wraps a reducer so its state is saved.
- \`persistStore(store)\` — starts saving and loading.
- \`<PersistGate>\` — a React component that waits until rehydration finishes before rendering the app.
- \`whitelist\` / \`blacklist\` — choose which slices to save.

#### Deeper version
redux-persist dispatches its own actions (\`persist/PERSIST\`, \`persist/REHYDRATE\`, etc.) that contain functions, so with RTK you must tell the serializability check to ignore them. Use \`version\` and \`migrate\` (via \`createMigrate\`) when your state shape changes, or users will load an old, incompatible shape. Use nested persist configs to persist only some fields of a slice.

Do not persist secrets (access tokens in \`localStorage\` are readable by any XSS script), and do not persist server data that should be fresh — let RTK Query or React Query refetch it. Note: the library has had long periods without active maintenance; check its current status, and for simple needs a small \`store.subscribe\` + \`localStorage\` helper may be enough.`,
      why: `Users expect the cart, theme or draft form to survive a refresh or app restart. redux-persist does this with a few lines of config instead of hand-writing save/load logic and timing issues.`,
      analogy: `It is the "save game" feature. When you quit, your progress (chosen slices) is written to the memory card (storage). When you start again, the game loads your save before showing the screen (PersistGate).`,
      code: [
        {
          title: 'Persisting the cart and settings slices',
          lang: 'javascript',
          code: `import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage on web
import cart from './cartSlice';
import settings from './settingsSlice';
import search from './searchSlice';

const rootReducer = combineReducers({ cart, settings, search });

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['cart', 'settings'], // do NOT persist search results
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);`,
        },
        {
          title: 'Waiting for rehydration with PersistGate',
          lang: 'jsx',
          code: `import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

export default function Root() {
  return (
    <Provider store={store}>
      <PersistGate loading={<p>Loading...</p>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
}

// On logout: clear saved data
// await persistor.purge();`,
        },
      ],
      output: `On first load, \`cart\` and \`settings\` are saved to \`localStorage\` under the key \`persist:root\` whenever they change. After a refresh, \`PersistGate\` shows "Loading..." for a moment, \`REHYDRATE\` merges the saved cart and settings into the store, then \`<App />\` renders with the user's cart still there. \`search\` is not in the whitelist, so it starts empty.`,
      questions: [
        { q: 'What is rehydration?', a: 'Loading the saved state from storage back into the Redux store when the app starts, via the `persist/REHYDRATE` action.' },
        { q: 'Why use PersistGate?', a: 'It delays rendering until rehydration is done, so the UI does not flash default state (like an empty cart or logged-out view) before the saved state loads.' },
        { q: 'How do you handle a changed state shape?', a: 'Bump `version` in the persist config and provide a `migrate` function (e.g. with `createMigrate`) that converts old saved state to the new shape.' },
        { q: 'What should you not persist?', a: 'Sensitive tokens (prefer httpOnly cookies), large or fast-changing server data, and transient UI state like loading flags.' },
      ],
      spoken: `"redux-persist saves selected slices of the store to storage, like localStorage on web or AsyncStorage on React Native, and rehydrates them on startup. I wrap the root reducer with persistReducer, call persistStore on the store, and wrap the app in PersistGate so it waits for rehydration. I use a whitelist to persist only things like the cart and settings, not server data. With Redux Toolkit I ignore redux-persist's actions in the serializability check, and when the state shape changes I bump the version and add a migration. I also avoid storing auth tokens in localStorage."`,
      mistakes: [
        'Persisting the whole store, including loading flags — after a refresh the app shows a spinner forever because `status: "loading"` was saved.',
        'Forgetting the `serializableCheck.ignoredActions` setup, which floods the console with warnings.',
        'Changing slice shape without a version/migration, so old saved data crashes the new code.',
        'Follow-up trap: "Is localStorage safe for JWTs?" Any script on the page (for example via XSS) can read it. Prefer httpOnly cookies for tokens.',
      ],
      takeaway: 'Persist only what must survive a reload (whitelist), gate rendering on rehydration, and version your saved shape.',
    },
    {
      id: 'rtk-query',
      title: 'RTK Query: Data Fetching and Caching',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'RTK Query is Redux Toolkit\'s built-in data fetching and caching tool; you define endpoints and get auto-generated hooks with loading, caching and refetching.',
      what: `**RTK Query** is part of Redux Toolkit. It handles **server state**: fetching data, caching it, tracking loading/error, and refetching when needed — without writing thunks, reducers or \`useEffect\`s.

You define an **API slice** with \`createApi\`:
- \`baseQuery\` — how to make requests (usually \`fetchBaseQuery({ baseUrl })\`).
- \`endpoints\` — \`builder.query\` for reading, \`builder.mutation\` for creating/updating/deleting.

RTK Query **generates React hooks** like \`useGetPostsQuery()\` and \`useAddPostMutation()\` that return \`data\`, \`isLoading\`, \`isFetching\`, \`error\` and more.

#### Deeper version
**Caching:** each endpoint + argument combination is one cache entry. If two components call \`useGetPostQuery(5)\`, only **one** request is made (deduplication). When no component uses an entry, it is removed after \`keepUnusedDataFor\` seconds (default 60).

**Tags (cache invalidation):** queries declare \`providesTags\` (e.g. \`['Post']\`), mutations declare \`invalidatesTags\`. After a mutation succeeds, every query with a matching tag refetches automatically.

**Other options:** \`skip\` (do not run yet), \`pollingInterval\`, \`refetchOnMountOrArgChange\`, \`refetchOnFocus\`/\`refetchOnReconnect\` (need \`setupListeners\`), \`transformResponse\`, and **optimistic updates** with \`onQueryStarted\` + \`updateQueryData\`. You must add \`api.reducer\` and \`api.middleware\` to the store.

\`isLoading\` is true only for the **first** load with no data; \`isFetching\` is true for **any** request including background refetches.`,
      why: `Most "Redux state" in real apps was actually copies of server data with hand-written loading flags. RTK Query removes that boilerplate, avoids duplicate requests, and keeps data fresh with tag invalidation — similar to React Query, but integrated into the Redux store and DevTools.`,
      analogy: `RTK Query is a **smart librarian**. You ask for "book #5". If it is on the desk already (cache), you get it immediately. If not, the librarian fetches it once, even if three people asked at the same time. When someone returns an edited copy (mutation), the librarian marks old copies as outdated (invalidate tags) and fetches fresh ones.`,
      code: [
        {
          title: 'Defining an API slice',
          lang: 'javascript',
          code: `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { configureStore } from '@reduxjs/toolkit';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('Authorization', \`Bearer \${token}\`);
      return headers;
    },
  }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    addPost: builder.mutation({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Post'], // refetch getPosts after success
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = api;

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer, auth: (s = { token: null }) => s },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});`,
        },
        {
          title: 'Using the generated hooks',
          lang: 'jsx',
          code: `export function Posts() {
  const { data: posts = [], isLoading, isFetching, error } = useGetPostsQuery();
  const [addPost, { isLoading: isSaving }] = useAddPostMutation();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong</p>;

  return (
    <div>
      <button
        disabled={isSaving}
        onClick={async () => {
          try {
            await addPost({ title: 'New post' }).unwrap();
          } catch (e) {
            alert('Save failed');
          }
        }}
      >
        Add post
      </button>
      {isFetching && <small>Refreshing...</small>}
      <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}`,
        },
      ],
      output: `On mount, \`useGetPostsQuery\` fetches \`/api/posts\` once and caches the result; \`isLoading\` is true until the first data arrives. Clicking "Add post" sends a POST. When it succeeds, the \`'Post'\` tag is invalidated, so \`getPosts\` refetches in the background — \`isFetching\` is true and "Refreshing..." shows, while the old list stays visible. The new post then appears without any manual state update.`,
      questions: [
        { q: 'What problem does RTK Query solve?', a: 'It manages server state: fetching, caching, deduplication, loading/error flags, refetching and invalidation, so you do not write thunks and reducers for every API call.' },
        { q: 'How does cache invalidation work in RTK Query?', a: 'Queries declare `providesTags`, mutations declare `invalidatesTags`. When a mutation succeeds, all queries with a matching tag are refetched.' },
        { q: 'isLoading vs isFetching?', a: '`isLoading` is true only on the first load when there is no data yet. `isFetching` is true for any in-flight request, including background refetches.' },
        { q: 'RTK Query vs React Query?', a: 'Both handle server state well. RTK Query lives inside the Redux store, uses DevTools and fits apps already using Redux; React Query is independent of Redux and has its own ecosystem.' },
        { q: 'How do you do an optimistic update?', a: 'In the mutation\'s `onQueryStarted`, dispatch `api.util.updateQueryData` to change the cache immediately, then `await queryFulfilled` and call `patch.undo()` if it fails.' },
      ],
      spoken: `"RTK Query is the data fetching and caching layer built into Redux Toolkit. I define an API slice with createApi, a base query, and endpoints — queries for reads and mutations for writes — and it generates hooks like useGetPostsQuery. Those hooks give me data, isLoading, isFetching and error, and they deduplicate requests and cache results. For freshness I use tags: queries provide tags and mutations invalidate them, so lists refetch automatically after a create or update. It removes most of the thunk and reducer code we used to write for API calls."`,
      mistakes: [
        'Forgetting to add `api.middleware` to the store — caching, invalidation and polling will not work properly.',
        'Copying RTK Query data into another slice with `useEffect` + dispatch, creating two sources of truth.',
        'Showing a full-page spinner on `isFetching`, which hides data on every background refetch. Use `isLoading` for the first load.',
        'Follow-up trap: "Can you use RTK Query without React?" Yes — import from `@reduxjs/toolkit/query` and use `api.endpoints.getPosts.initiate()` with dispatch. The hooks come from the `/react` entry point.',
      ],
      takeaway: 'Use RTK Query for server data: endpoints in, hooks out, with caching, dedupe and tag-based invalidation for free.',
    },
    {
      id: 'generator-functions',
      title: 'Generator Functions (the Engine of Redux-Saga)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A generator (function*) can pause at each yield and resume later; Redux-Saga uses this to run async flows step by step.',
      what: `A **generator** is a special function written with \`function*\`. Unlike a normal function, it does not run to the end in one go. It can **pause** at each \`yield\` and **resume** later.

Calling a generator does not run its body. It returns an **iterator** object. Each time you call \`iterator.next()\`, the code runs until the next \`yield\`, and you get \`{ value, done }\`.

You can also send a value **into** the generator: \`iterator.next(x)\` makes the paused \`yield\` expression evaluate to \`x\`.

#### Deeper version
This two-way communication is the key to Redux-Saga. Your saga \`yield\`s a plain object that **describes** what to do (an "effect", like "call this API"). The saga **middleware** is the one calling \`.next()\`. It reads the description, does the real work (calls the API, waits for the Promise), then resumes your generator with the result via \`.next(result)\` — or throws an error into it with \`.throw(err)\`, which your \`try/catch\` can catch.

Because your code only **yields descriptions**, it never actually runs the side effect itself. That makes sagas easy to test: you step through the generator and check each yielded object — no mocks needed. Generators also allow **cancellation**: the middleware can call \`.return()\` to stop a generator at its current \`yield\` and still run its \`finally\` block.`,
      why: `Async/await can't be paused from the outside, cancelled cleanly, or inspected step by step. Generators let a library (Redux-Saga) control the execution: it decides when to resume, can cancel, and lets tests drive the flow manually.`,
      analogy: `A generator is like a **TV series on a streaming app**. Pressing "next episode" (\`next()\`) plays until the next cliffhanger (\`yield\`) and pauses. You can stop watching at any time (\`return()\`). Redux-Saga is the person holding the remote: it watches each episode's request ("please fetch the user"), does it, and then presses "next" with the answer.`,
      code: [
        {
          title: 'Basic generator and two-way communication',
          lang: 'javascript',
          code: `function* greeter() {
  const name = yield 'What is your name?'; // pause, send a question out
  const city = yield \`Hi \${name}! Which city?\`;
  return \`\${name} from \${city}\`;
}

const it = greeter();            // nothing runs yet
console.log(it.next());          // { value: 'What is your name?', done: false }
console.log(it.next('Asha'));    // { value: 'Hi Asha! Which city?', done: false }
console.log(it.next('Pune'));    // { value: 'Asha from Pune', done: true }
console.log(it.next());          // { value: undefined, done: true }`,
        },
        {
          title: 'A tiny "saga runner" to show how the middleware works',
          lang: 'javascript',
          code: `// Our generator yields Promises; the runner resolves them and resumes.
function run(genFn) {
  const it = genFn();
  function handle({ value, done }) {
    if (done) return;
    Promise.resolve(value).then(
      (result) => handle(it.next(result)), // resume with the result
      (err) => handle(it.throw(err))       // throw the error into the generator
    );
  }
  handle(it.next()); // start
}

function* loadUser() {
  try {
    const user = yield Promise.resolve({ id: 1, name: 'Asha' });
    console.log('got', user.name);
    yield Promise.reject(new Error('Network down'));
  } catch (e) {
    console.log('caught:', e.message);
  }
}

run(loadUser);`,
        },
      ],
      output: `In the first example, each \`next()\` runs to the next \`yield\`. The value passed into \`next('Asha')\` becomes the result of the first \`yield\`, so \`name\` is \`'Asha'\`. The final \`next\` returns \`done: true\` with the return value.

The runner prints \`got Asha\`, then \`caught: Network down\`. This is exactly the idea behind Redux-Saga: your generator yields something, the runner waits for it, resumes you with the result, or throws the error into your \`try/catch\`.`,
      questions: [
        { q: 'What is a generator function?', a: 'A function declared with `function*` that can pause at `yield` and resume later. Calling it returns an iterator; each `next()` runs to the next yield and returns `{ value, done }`.' },
        { q: 'How do you send a value into a generator?', a: 'Pass it to `next(value)`. The paused `yield` expression evaluates to that value.' },
        { q: 'Why does Redux-Saga use generators instead of async/await?', a: 'The middleware controls when the generator resumes, so it can cancel it, run effects in parallel, and tests can step through it. Yielding plain effect objects also makes sagas testable without mocks.' },
        { q: 'What do it.throw() and it.return() do?', a: '`throw(err)` throws an error at the paused yield (catchable by try/catch). `return(value)` finishes the generator early, running any `finally` block — Redux-Saga uses this idea for cancellation.' },
      ],
      spoken: `"A generator is a function declared with function star that can pause at each yield and resume later. Calling it returns an iterator; every next call runs to the next yield and returns value and done. I can also pass a value into next, which becomes the result of the paused yield. Redux-Saga is built on this. My saga yields plain objects describing effects, like call this API. The saga middleware executes the effect, then resumes my generator with the result, or throws the error into it. That gives sagas cancellation and very easy step-by-step testing."`,
      mistakes: [
        'Thinking calling a generator runs its body. It only creates an iterator; nothing runs until `next()`.',
        'Forgetting the `*` in `function*` — then `yield` is a syntax error. Arrow functions cannot be generators.',
        'Expecting the first `next(value)` to send a value — the first call just starts the generator, so its argument is ignored.',
        'Follow-up trap: "What is yield*?" It delegates to another generator, running it inside the current one, like calling a sub-saga in sequence.',
      ],
      takeaway: 'Generators pause at yield and resume with next(value) — Redux-Saga drives them so your async code becomes controllable and testable.',
    },
    {
      id: 'thunk-vs-saga',
      title: 'Redux Thunk vs Redux-Saga',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Thunks are simple async functions for straightforward calls; sagas are generator-based workers for complex flows like cancellation, races, debouncing and websockets.',
      what: `Both are **middleware** for side effects (API calls, timers), because reducers must stay pure.

**Redux Thunk**: you dispatch a function. It gets \`dispatch\` and \`getState\` and can use \`async/await\`. Simple, small, included in Redux Toolkit by default.

**Redux-Saga**: you write **sagas** — generator functions that **listen** for actions and react to them. They yield **effects** like \`call\`, \`put\`, \`takeLatest\`. Sagas run in the background like separate threads.

Simple rule: thunk for "click → call API → save result". Saga for complex, long-running, event-driven flows.

#### Deeper version
Key differences:
- **Who starts it:** a thunk is started by the component that dispatches it. A saga **watches** for plain actions, so components dispatch plain objects and do not know about the side effect (better decoupling).
- **Concurrency control:** sagas have built-ins — \`takeLatest\` (cancel old), \`takeLeading\`, \`debounce\`, \`throttle\`, \`race\`. With thunks you build this by hand with abort controllers and flags.
- **Cancellation:** sagas can cancel a running task (\`cancel\`, \`race\`), and it runs \`finally\` blocks. Thunks need \`AbortController\`.
- **Testing:** sagas yield plain objects, so you test by stepping the generator. Thunks need mocked API calls and a mock store.
- **Cost:** sagas add a library, generator syntax and a learning curve. Modern RTK also offers \`createListenerMiddleware\`, which covers many "react to an action" cases without sagas.`,
      why: `Interviewers ask this to see whether you can choose the right tool. Picking saga for simple CRUD is over-engineering; picking thunk for websockets, polling, retries and races leads to messy hand-written logic.`,
      analogy: `A thunk is a **phone call you make yourself**: you dial, wait, then act. A saga is a **personal assistant** sitting in the office: they listen for certain events ("whenever the boss asks for a report"), handle it, can cancel an old task when a new request comes, and can wait for whichever happens first — reply or timeout.`,
      code: [
        {
          title: 'Same feature with a thunk',
          lang: 'javascript',
          code: `// Component: dispatch(fetchProducts('shoes'))
export const fetchProducts = (query) => async (dispatch) => {
  dispatch({ type: 'products/fetchStart' });
  try {
    const res = await fetch(\`/api/products?q=\${query}\`);
    const data = await res.json();
    dispatch({ type: 'products/fetchSuccess', payload: data });
  } catch (err) {
    dispatch({ type: 'products/fetchFailure', payload: err.message });
  }
};`,
        },
        {
          title: 'Same feature with a saga (+ free cancellation of old searches)',
          lang: 'javascript',
          code: `import { call, put, takeLatest } from 'redux-saga/effects';

const api = { search: (q) => fetch(\`/api/products?q=\${q}\`).then((r) => r.json()) };

// Component: dispatch({ type: 'products/fetchStart', payload: 'shoes' })
function* fetchProductsSaga(action) {
  try {
    const data = yield call(api.search, action.payload);
    yield put({ type: 'products/fetchSuccess', payload: data });
  } catch (err) {
    yield put({ type: 'products/fetchFailure', payload: err.message });
  }
}

export function* productsWatcher() {
  // if a new search starts, the previous one is cancelled automatically
  yield takeLatest('products/fetchStart', fetchProductsSaga);
}`,
        },
      ],
      output: `Both versions show a loading state, fetch products, and store the result or the error.

The difference shows when the user types fast. With the thunk, every request runs and a slow old response can arrive **last** and overwrite the newer results (a race condition). With the saga, \`takeLatest\` cancels the previous \`fetchProductsSaga\` when a new \`fetchStart\` arrives, so only the latest search can write to the store.`,
      questions: [
        { q: 'When would you choose Redux-Saga over Thunk?', a: 'For complex async flows: cancellation, debouncing, races and timeouts, polling, websockets, multi-step flows like login/logout, or background tasks. For simple request/response, thunk or RTK Query is enough.' },
        { q: 'Why are sagas easier to test?', a: 'Sagas yield plain effect objects (descriptions), so tests can step through the generator and compare objects without running real API calls.' },
        { q: 'Which approach decouples components better?', a: 'Sagas — components dispatch plain actions, and sagas decide what side effects to run. With thunks, the component calls the thunk that contains the logic.' },
        { q: 'What is the modern RTK alternative to sagas?', a: '`createListenerMiddleware` for reacting to actions (with take, delay, cancel helpers), and RTK Query for data fetching. Many new apps no longer need sagas.' },
      ],
      spoken: `"Both thunk and saga handle side effects outside reducers. A thunk is a function I dispatch, written with async/await — it's simple and built into Redux Toolkit, so I use it for straightforward request-response logic. Redux-Saga uses generator functions that watch for actions and yield effects like call and put. It shines for complex flows: takeLatest to cancel stale requests, debounce, race with timeouts, websockets with channels, and long-running background tasks. Sagas are also easy to test because they yield plain objects. The trade-off is more learning curve, so for new projects I'd consider RTK Query and the listener middleware first."`,
      mistakes: [
        'Saying sagas are "better" in general. They are more powerful but heavier; most CRUD apps do fine with thunks or RTK Query.',
        'Using thunks for search-as-you-type without cancellation, causing stale responses to overwrite newer ones.',
        'Using both thunk and saga for the same feature, so the logic is split and hard to follow.',
        'Follow-up trap: "Can you use thunk and saga together?" Yes — RTK keeps thunk by default and you add the saga middleware next to it. Many teams migrate gradually this way.',
      ],
      takeaway: 'Thunk for simple async calls; saga for complex, cancellable, event-driven flows — and consider RTK Query or listeners first.',
    },
    {
      id: 'saga-basic-effects',
      title: 'Saga Setup and Basic Effects: call, put, select, take',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Effects are plain objects that tell the saga middleware what to do: call a function, put (dispatch) an action, select state, or take (wait for) an action.',
      what: `To use Redux-Saga, you create the saga middleware, add it to the store, and **run** a root saga.

Inside a saga you never do side effects directly. You \`yield\` an **effect** — a plain object that **describes** a job. The middleware does the job.

The basic effects:
- \`call(fn, ...args)\` — call a function (usually an API). If it returns a Promise, the saga waits for it. **Blocking.**
- \`put(action)\` — dispatch an action to the store. (Named "put" to avoid clashing with \`dispatch\`.)
- \`select(selector, ...args)\` — read data from the current state.
- \`take(pattern)\` — **pause** until an action matching the pattern is dispatched, and return that action. **Blocking.**

#### Deeper version
"Blocking" means the saga waits on that line until the effect finishes. \`call\` and \`take\` block; \`put\` is effectively non-blocking (it dispatches and moves on); \`fork\` is non-blocking.

\`call\` also supports a context for methods: \`call([obj, obj.method], arg)\` or \`call([obj, 'method'], arg)\`. Using \`call\` instead of calling the function directly is what makes the saga testable: \`yield call(api.getUser, 1)\` yields \`{ CALL: { fn: api.getUser, args: [1] } }\`, which a test can compare.

\`take\` patterns can be a type string, an array of types, a function \`(action) => boolean\`, or \`'*'\` for all actions. The \`take\` effect lets you write flows **in order**, like "wait for LOGIN, then wait for LOGOUT" — something hard to express with callbacks.`,
      why: `Effects keep your saga code declarative: you say **what** should happen, the middleware does it. This gives you testable code, a clear order of steps, and the ability to cancel or race steps later.`,
      analogy: `A saga is a manager writing **instruction cards** instead of doing the work: "Card: call the supplier", "Card: tell the team (put)", "Card: check the stock board (select)", "Card: wait until a customer walks in (take)". The assistant (middleware) does each card and reports back.`,
      code: [
        {
          title: 'Store setup with saga middleware',
          lang: 'javascript',
          code: `import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import userReducer from './userSlice';
import { userWatcher } from './userSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: { user: userReducer },
  middleware: (getDefault) => getDefault({ thunk: false }).concat(sagaMiddleware),
});

function* rootSaga() {
  yield all([userWatcher()]); // start all watchers in parallel
}

sagaMiddleware.run(rootSaga); // must run AFTER the store is created`,
        },
        {
          title: 'call, put, select and take in one saga',
          lang: 'javascript',
          code: `import { call, put, select, take, takeEvery } from 'redux-saga/effects';

const api = {
  getUser: (id, token) =>
    fetch(\`/api/users/\${id}\`, { headers: { Authorization: token } }).then((r) => r.json()),
};
const selectToken = (state) => state.auth.token;

function* loadUser(action) {
  const token = yield select(selectToken);                   // read state
  const user = yield call(api.getUser, action.payload, token); // blocking API call
  yield put({ type: 'user/loaded', payload: user });         // dispatch
}

export function* userWatcher() {
  yield takeEvery('user/load', loadUser);
}

// take: write a flow in order
export function* onboardingFlow() {
  yield take('auth/signedUp');           // wait for sign-up
  yield put({ type: 'ui/showTour' });
  yield take('tour/finished');           // then wait for the tour to end
  yield put({ type: 'ui/showDashboardTips' });
}`,
        },
      ],
      output: `When a component does \`dispatch({ type: 'user/load', payload: 7 })\`, \`takeEvery\` starts \`loadUser\`. It reads the token with \`select\`, waits on \`call\` until the API responds, then \`put\`s \`user/loaded\`, which the reducer saves.

\`onboardingFlow\` pauses at \`take('auth/signedUp')\`. Nothing happens until that action is dispatched. Then it shows the tour and pauses again until \`tour/finished\`. The steps always happen in this order.`,
      questions: [
        { q: 'What is an effect in Redux-Saga?', a: 'A plain JavaScript object that describes an instruction for the middleware, like calling a function or dispatching an action. The middleware executes it and resumes the saga with the result.' },
        { q: 'Why use call(fn, args) instead of fn(args)?', a: 'Calling directly runs the side effect inside the saga and returns a Promise, which is hard to test. `call` yields a description the middleware runs, so tests can assert on the object without mocks.' },
        { q: 'What is the difference between put and dispatch?', a: '`put` is the saga effect that tells the middleware to dispatch an action. It is the saga-friendly, testable way to dispatch.' },
        { q: 'What does take do?', a: 'It pauses the saga until an action matching the pattern is dispatched, then returns that action. It lets you write sequential flows like login → logout.' },
      ],
      spoken: `"To set up Redux-Saga I create the saga middleware, add it to configureStore, and call sagaMiddleware.run with my root saga after the store exists. Inside sagas I yield effects, which are plain objects describing work. call runs a function, usually an API call, and blocks until the Promise resolves. put dispatches an action. select reads from the state using a selector. take pauses until a matching action is dispatched, which is great for writing flows in order. Because sagas only yield descriptions, they're very easy to test."`,
      mistakes: [
        'Calling `sagaMiddleware.run()` before the store is created — it throws because the middleware is not mounted yet.',
        'Writing `yield api.getUser(id)` instead of `yield call(api.getUser, id)`. It still works (sagas can yield Promises), but you lose easy testing and cancellation of the effect.',
        'Writing `call(api.getUser(id))` — this calls the function immediately. Pass the function and args separately.',
        'Follow-up trap: "Is put blocking?" `put` dispatches and continues; use `putResolve` if you need to wait for a Promise returned by dispatch (for example a thunk).',
      ],
      takeaway: 'Sagas yield effect descriptions — call to run, put to dispatch, select to read, take to wait — and the middleware does the work.',
    },
    {
      id: 'take-every-latest-leading',
      title: 'takeEvery vs takeLatest vs takeLeading',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Watcher helpers: takeEvery runs a task for every action, takeLatest keeps only the newest (cancels old), takeLeading ignores new ones while one is running.',
      what: `These are **watcher helpers**. They listen for an action type and start a **worker saga** each time it is dispatched. They differ in how they handle **overlapping** actions:

- \`takeEvery(pattern, worker)\` — start a new worker for **every** action. Many can run at the same time.
- \`takeLatest(pattern, worker)\` — start a new worker and **cancel** the previous one if it is still running. Only the latest wins.
- \`takeLeading(pattern, worker)\` — start a worker, then **ignore** new actions until it finishes. The first one wins.

#### Deeper version
They are built from lower-level effects. Simplified:

- \`takeEvery\` = a loop of \`take\` + \`fork\` (non-blocking start).
- \`takeLatest\` = \`take\` + remember the last task + \`cancel(lastTask)\` before \`fork\`ing a new one.
- \`takeLeading\` = a loop of \`take\` + \`call\` (blocking — so new actions are not taken while it runs; they are simply missed).

Cancelling with \`takeLatest\` stops the **saga**, and you can stop the real HTTP request too by aborting it in a \`finally\` block (see cancellation). Choosing:
- \`takeEvery\` — independent actions: "add to cart", logging, analytics.
- \`takeLatest\` — only the newest result matters: search, filters, loading a page by id.
- \`takeLeading\` — prevent double submit: "pay now", "submit order", refresh token.`,
      why: `Users double-click, type fast, and switch pages quickly. Without the right helper you get duplicate payments, flickering results or stale data overwriting fresh data. Choosing the right helper fixes these race conditions with one word.`,
      analogy: `Ordering at a coffee shop:
- **takeEvery**: the barista makes every order, in parallel.
- **takeLatest**: you keep changing your mind — the barista throws away the half-made drink and only makes your latest choice.
- **takeLeading**: the barista is making your first order and ignores you shouting new orders until it is done.`,
      code: [
        {
          title: 'Choosing the right helper',
          lang: 'javascript',
          code: `import { takeEvery, takeLatest, takeLeading, call, put, all } from 'redux-saga/effects';
import { api } from './api';

function* trackEvent(action) {
  yield call(api.track, action.payload);              // every event matters
}
function* searchProducts(action) {
  const results = yield call(api.search, action.payload);
  yield put({ type: 'search/success', payload: results }); // only newest search
}
function* submitPayment(action) {
  const receipt = yield call(api.pay, action.payload);
  yield put({ type: 'payment/success', payload: receipt }); // no double charge
}

export function* rootSaga() {
  yield all([
    takeEvery('analytics/event', trackEvent),
    takeLatest('search/query', searchProducts),
    takeLeading('payment/submit', submitPayment),
  ]);
}`,
        },
        {
          title: 'How takeEvery and takeLatest work under the hood',
          lang: 'javascript',
          code: `import { take, fork, cancel } from 'redux-saga/effects';

function* myTakeEvery(pattern, worker) {
  while (true) {
    const action = yield take(pattern);
    yield fork(worker, action);          // non-blocking: keep listening
  }
}

function* myTakeLatest(pattern, worker) {
  let lastTask;
  while (true) {
    const action = yield take(pattern);
    if (lastTask) yield cancel(lastTask); // cancel the old one (no-op if finished)
    lastTask = yield fork(worker, action);
  }
}`,
        },
      ],
      output: `If the user types "s", "sh", "sho" quickly, three \`search/query\` actions fire. \`takeLatest\` cancels the first two workers, so only the "sho" result is saved.

If the user double-clicks "Pay", two \`payment/submit\` actions fire. \`takeLeading\` runs the first and ignores the second because the first is still running — no double charge.

Every \`analytics/event\` is tracked because \`takeEvery\` forks a worker for each one.`,
      questions: [
        { q: 'Difference between takeEvery and takeLatest?', a: '`takeEvery` runs a worker for every action concurrently. `takeLatest` cancels any running worker when a new action arrives, so only the latest one completes.' },
        { q: 'When do you use takeLeading?', a: 'When the first request should win and duplicates should be ignored while it runs, e.g. submit/pay buttons or refreshing a token.' },
        { q: 'How would you implement takeLatest yourself?', a: 'Loop forever: `take` the action, `cancel` the last task if it exists, then `fork` the worker and save the new task.' },
        { q: 'Does takeLatest cancel the HTTP request?', a: 'It cancels the saga, so its result is ignored. To abort the actual network request, use an AbortController and call `abort()` in the saga\'s `finally` when `cancelled()` is true.' },
      ],
      spoken: `"These are watcher helpers that start a worker saga when an action is dispatched. takeEvery starts a worker for every action, so they can run in parallel — I use it for independent things like analytics. takeLatest cancels the previous running worker when a new action comes in, so only the latest result is used — perfect for search or loading data by id. takeLeading runs the first one and ignores new actions until it finishes, which prevents double submits on payments. Under the hood they're just take plus fork, with cancel for takeLatest and a blocking call for takeLeading."`,
      mistakes: [
        'Using `takeEvery` for search, so slower old responses overwrite newer results.',
        'Using `takeLatest` for actions where every one matters (like "add item") — some get cancelled and lost.',
        'Thinking `takeLeading` queues the extra actions. It ignores them; use an `actionChannel` if you need a queue.',
        'Follow-up trap: "Is takeLatest blocking?" No. The helper itself forks a background task, so `yield takeLatest(...)` returns immediately and the saga continues.',
      ],
      takeaway: 'takeEvery = all, takeLatest = newest wins (cancel old), takeLeading = first wins (ignore new).',
    },
    {
      id: 'listener-middleware',
      title: 'RTK Listener Middleware (createListenerMiddleware)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A lightweight, built-in RTK way to run side effects in response to actions — async/await instead of generators, covering many saga use cases.',
      what: `\`createListenerMiddleware\` is part of Redux Toolkit. You register **listeners**: "when this action happens (or this condition becomes true), run this async function".

It is like a small, simpler version of Redux-Saga's \`takeEvery\`, but written with normal \`async/await\` instead of generators.

#### Deeper version
\`startListening({ actionCreator | type | matcher | predicate, effect })\`. The \`effect(action, listenerApi)\` gets helpers:
- \`getState\`, \`getOriginalState\`, \`dispatch\`
- \`delay(ms)\` — a cancel-aware wait
- \`cancelActiveListeners()\` — cancel other running copies of this listener (lets you build **debounce** or **takeLatest**)
- \`take(predicate)\` and \`condition(predicate)\` — wait for a future action or state (like saga's \`take\`)
- \`fork(fn)\` — start a child task, and \`signal\` — an \`AbortSignal\` for this run

Add it with \`.prepend(listenerMiddleware.middleware)\` so it runs before the serializability check. It does not have every saga feature (no channels, no built-in \`race\` effect, less mature testing tools), but for many apps it replaces sagas with far less code.`,
      why: `Many teams used sagas only for "after X happens, do Y" logic: save to localStorage after a change, show a toast after an error, debounce an autosave. The listener middleware does all of this with built-in RTK code, no generators, and good TypeScript support.`,
      analogy: `It is an "if this, then that" rule in a smart home app: "When the front door opens (action), turn on the hall light (effect)". Saga is a full home-automation program; the listener is the quick rules screen.`,
      code: [
        {
          title: 'Debounced autosave with a listener',
          lang: 'javascript',
          code: `import { configureStore, createListenerMiddleware, createSlice } from '@reduxjs/toolkit';

const draftSlice = createSlice({
  name: 'draft',
  initialState: { text: '', saved: false },
  reducers: {
    textChanged(state, action) { state.text = action.payload; state.saved = false; },
    saved(state) { state.saved = true; },
  },
});
export const { textChanged, saved } = draftSlice.actions;

const listener = createListenerMiddleware();

listener.startListening({
  actionCreator: textChanged,
  effect: async (action, api) => {
    api.cancelActiveListeners();   // cancel the previous run (debounce)
    await api.delay(800);          // throws if cancelled -> later code skipped
    await fetch('/api/drafts', { method: 'PUT', body: JSON.stringify({ text: api.getState().draft.text }) });
    api.dispatch(saved());
  },
});

export const store = configureStore({
  reducer: { draft: draftSlice.reducer },
  middleware: (getDefault) => getDefault().prepend(listener.middleware),
});`,
        },
      ],
      output: `Each keystroke dispatches \`textChanged\`. Each new run cancels the previous one, and the cancelled run's \`delay\` throws, so it never saves. Only when the user stops typing for 800 ms does a run reach the \`fetch\`, save the latest text, and dispatch \`saved()\`. Result: one request after typing stops, not one per key.`,
      questions: [
        { q: 'What is the listener middleware?', a: 'An RTK middleware that runs async effect callbacks when matching actions are dispatched or a state condition becomes true. It is a lighter alternative to sagas and observables.' },
        { q: 'How do you debounce with the listener middleware?', a: 'Call `listenerApi.cancelActiveListeners()` at the start of the effect, then `await listenerApi.delay(ms)`. Older runs are cancelled before they do the work.' },
        { q: 'Listener middleware vs Redux-Saga?', a: 'Listeners use async/await, are built into RTK and cover most reactive logic. Sagas have more advanced tools (channels, race, rich testing) for very complex flows.' },
      ],
      spoken: `"The listener middleware is Redux Toolkit's built-in way to react to actions with side effects. I call startListening with an action creator or a predicate and an async effect function. The effect gets getState, dispatch, a cancel-aware delay, cancelActiveListeners, and take or condition to wait for future actions. With cancelActiveListeners plus delay I can build debounce or takeLatest behaviour in a few lines. For most apps it covers what we used sagas for, with plain async/await. I'd still pick saga for very complex flows like channels and races."`,
      mistakes: [
        'Adding it with `.concat` instead of `.prepend`, so functions or other non-serializable values in actions get flagged before the listener sees them (the docs recommend prepend).',
        'Forgetting `cancelActiveListeners()` and expecting debounce behaviour — every run would still complete.',
        'Catching the cancellation error in a broad `try/catch` and continuing work after cancel.',
        'Follow-up trap: "Does the listener run before or after the reducer?" After — the effect runs once the action has been processed, so `getState()` already has the new state (`getOriginalState()` gives the old one).',
      ],
      takeaway: 'For "when X happens, do Y" logic in modern RTK, try createListenerMiddleware before reaching for sagas.',
    },
    {
      id: 'redux-state-design',
      title: 'What Belongs in Redux and How to Structure It',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Keep global client state in Redux, server data in RTK Query, local UI state in components, and organise code by feature slices.',
      what: `Not all state belongs in Redux. A simple guide:

- **Local UI state** (input text, modal open, hover) → \`useState\` in the component.
- **Server state** (data from APIs) → RTK Query or React Query, which handle caching.
- **Global client state** used across many screens (auth user, cart, theme, feature flags, wizard progress) → Redux.

Structure code by **feature**, not by type: \`features/cart/cartSlice.js\`, \`features/cart/CartPage.jsx\`, \`features/cart/cartSaga.js\` — instead of one big \`actions/\`, \`reducers/\`, \`sagas/\` folder.

#### Deeper version
Good state shape rules:
- Keep state **minimal** and **derive** the rest with selectors (store \`items\`, compute \`total\`).
- **Normalize** collections (\`{ ids, entities }\`).
- Keep it **serializable** (no class instances, Dates, Maps, functions).
- Model actions as **events** (\`'order/placed'\`), not setters (\`'setOrderStatus'\`); many slices can respond to one event.
- Track request status as one field: \`status: 'idle' | 'loading' | 'succeeded' | 'failed'\` instead of several booleans that can conflict.
- Put logic in reducers ("fat reducers, thin components"), so it is easy to test.`,
      why: `Most Redux pain ("too much boilerplate", "everything re-renders") comes from putting the wrong things in the store or shaping it badly. Interviewers ask this to see if you can design state, not just use the API.`,
      analogy: `Your house: the **fridge** is shared by the family (Redux — global state). Your **pocket** is just for you (local state). The **supermarket** owns the real stock; you keep a small cached copy at home and refresh it when it is old (server state with RTK Query).`,
      code: [
        {
          title: 'Feature-based folder structure',
          lang: 'text',
          code: `src/
  app/
    store.js          # configureStore, root saga/listeners
    hooks.js          # typed useAppSelector / useAppDispatch
  services/
    api.js            # RTK Query createApi (server state)
  features/
    auth/
      authSlice.js    # global client state: user, token status
      authSaga.js
      LoginForm.jsx   # local form state lives here with useState
    cart/
      cartSlice.js
      cartSelectors.js
      CartPage.jsx`,
        },
        {
          title: 'One status field instead of many booleans',
          lang: 'javascript',
          code: `// ❌ can end up isLoading=true AND isError=true at the same time
const bad = { isLoading: false, isError: false, isSuccess: false, data: null };

// ✅ one status, impossible states are impossible
const good = { status: 'idle', data: null, error: null }; // 'idle'|'loading'|'succeeded'|'failed'

// Derived, not stored:
const selectCartCount = (state) => state.cart.items.reduce((n, i) => n + i.qty, 0);`,
        },
      ],
      output: `The folder structure keeps everything for "cart" together, so a developer changing the cart opens one folder. Server data lives in \`services/api.js\`, so slices only hold true client state.

The single \`status\` field can only be one value at a time, so the UI never sees "loading and error" together. The cart count is computed by a selector, so it can never get out of sync with the items.`,
      questions: [
        { q: 'What state should go in Redux?', a: 'Global client state shared across many parts of the app, like the auth user, cart, preferences or multi-step flow progress. Not local UI state, and preferably not raw server cache.' },
        { q: 'How do you structure a Redux codebase?', a: 'By feature ("ducks" / slice files): each feature folder has its slice, selectors, side effects and components, with the store setup in an app folder.' },
        { q: 'Why model actions as events?', a: 'Events describe what happened, so multiple slices can react to the same action. Setter-style actions couple the UI to one reducer and lead to many dispatches for one user action.' },
      ],
      spoken: `"I split state into three types. Local UI state like form inputs stays in useState. Server state goes into RTK Query or React Query, which handle caching and refetching. Only global client state, like the logged-in user, cart, or preferences, goes into Redux. I organise code by feature, so each feature folder has its slice, selectors, sagas and components. For the state shape I keep it minimal, normalized and serializable, derive values with selectors, use one status field instead of several booleans, and name actions as events like order placed."`,
      mistakes: [
        'Putting every piece of state in Redux "because we use Redux".',
        'Storing derived values (totals, filtered lists) and forgetting to update them.',
        'Dispatching many setter actions in a row for one user event instead of one meaningful event action.',
        'Follow-up trap: "Is it OK to have form state in Redux?" Usually not — it changes on every keystroke. Only do it if other parts of the app truly need the draft (for example a multi-step wizard).',
      ],
      takeaway: 'Local state in components, server state in RTK Query, shared client state in Redux — organised by feature.',
    },
    {
      id: 'saga-fork-spawn-all',
      title: 'Saga Concurrency: fork, spawn and all',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'fork starts an attached background task, spawn starts a detached one, and all runs several effects in parallel and waits for all of them.',
      what: `By default, \`yield call(...)\` **blocks** — the saga waits. To do things in the background or in parallel, use:

- \`fork(fn, ...args)\` — start \`fn\` as a **background task** and continue immediately (non-blocking). Returns a **Task** object you can cancel later. The task is **attached** to its parent.
- \`spawn(fn, ...args)\` — like \`fork\`, but the task is **detached**: it lives on its own.
- \`all([...effects])\` — run several effects **in parallel** and wait until **all** finish (like \`Promise.all\`).

#### Deeper version
**Attached (fork) rules:**
- The parent saga does not finish until all its forked children finish.
- If a forked child **throws**, the error bubbles to the parent: the parent and all its other children are **cancelled**. You can't catch a fork's error with try/catch around the \`fork\` line — catch it inside the child.
- If the parent is cancelled, its forks are cancelled too.

**Detached (spawn) rules:** errors do not bubble to the parent, and cancelling the parent does not cancel it. Treat it like a separate root saga.

**all:** if any effect inside \`all\` fails, \`all\` fails immediately and the other running effects are **cancelled** (like \`Promise.all\` plus cancellation). With an object \`all({ user: call(...), posts: call(...) })\` you get named results.

The common root-saga pattern is \`yield all([watcherA(), watcherB()])\`. Downside: one crashing watcher kills the root and every other watcher. A safer pattern spawns each watcher and restarts it on error.`,
      why: `Real flows need parallelism (load user and settings together), background tasks (start polling while continuing), and isolation (one broken feature should not kill all sagas). These three effects are the tools for that.`,
      analogy: `\`fork\` is giving work to your **team member**: if they fail, it is your problem too, and if you leave the project, they leave too. \`spawn\` is hiring an **outside contractor**: their problems do not stop your work. \`all\` is a group project: you wait until **everyone** has submitted their part.`,
      code: [
        {
          title: 'Parallel loading with all, background task with fork',
          lang: 'javascript',
          code: `import { all, call, fork, put, take, cancel } from 'redux-saga/effects';
import { api } from './api';

function* loadDashboard() {
  // parallel: both requests at once, wait for both
  const { user, stats } = yield all({
    user: call(api.getUser),
    stats: call(api.getStats),
  });
  yield put({ type: 'dashboard/loaded', payload: { user, stats } });
}

function* pollNotifications() {
  while (true) {
    const list = yield call(api.getNotifications);
    yield put({ type: 'notifications/set', payload: list });
    yield call(() => new Promise((r) => setTimeout(r, 10000)));
  }
}

export function* dashboardFlow() {
  yield take('dashboard/opened');
  const pollTask = yield fork(pollNotifications); // non-blocking: continue now
  yield call(loadDashboard);                      // blocking
  yield take('dashboard/closed');
  yield cancel(pollTask);                         // stop background polling
}`,
        },
        {
          title: 'Resilient root saga with spawn + restart',
          lang: 'javascript',
          code: `import { all, call, spawn } from 'redux-saga/effects';
import { authWatcher } from './authSaga';
import { cartWatcher } from './cartSaga';

export function* rootSaga() {
  const sagas = [authWatcher, cartWatcher];
  yield all(
    sagas.map((saga) =>
      spawn(function* keepAlive() {
        while (true) {
          try {
            yield call(saga);
            break;                                  // finished normally
          } catch (e) {
            console.error('Saga crashed, restarting', e); // other watchers keep running
          }
        }
      })
    )
  );
}`,
        },
      ],
      output: `When \`dashboard/opened\` is dispatched, \`dashboardFlow\` forks the polling task (it starts in the background) and then loads the user and stats **in parallel** with \`all\`. Total wait time is the slower of the two requests, not the sum. When \`dashboard/closed\` arrives, the polling task is cancelled.

In the root saga, if \`cartWatcher\` throws, only its own \`keepAlive\` loop catches the error and restarts it. \`authWatcher\` is unaffected because each one was spawned (detached).`,
      questions: [
        { q: 'Difference between call and fork?', a: '`call` is blocking: the saga waits for the result. `fork` is non-blocking: it starts a task in the background, returns a Task object, and the saga continues immediately.' },
        { q: 'Difference between fork and spawn?', a: '`fork` creates an attached task: errors bubble to the parent and cancelling the parent cancels it. `spawn` creates a detached task: errors do not bubble and parent cancellation does not affect it.' },
        { q: 'What happens if one effect in all() fails?', a: 'The `all` effect fails with that error right away, and the other effects that are still running are cancelled.' },
        { q: 'Can you catch an error from a forked task with try/catch around fork?', a: 'No. Errors from attached forks bubble to the parent and abort it. Catch errors inside the forked saga itself, or use spawn.' },
      ],
      spoken: `"call is blocking, so for background or parallel work I use fork, spawn and all. fork starts a task without waiting and returns a task object I can cancel later. Forked tasks are attached, so the parent waits for them, their errors bubble up and cancel the parent, and cancelling the parent cancels them. spawn is the detached version, isolated from the parent. all runs effects in parallel and waits for all of them, like Promise.all, and cancels the rest if one fails. In the root saga I often spawn each watcher with a restart loop so one crash doesn't kill everything."`,
      mistakes: [
        'Using `call` for a long-running loop (like polling) and wondering why the code after it never runs. Use `fork`.',
        'Wrapping `yield fork(...)` in try/catch expecting to catch the child\'s errors.',
        'Using `yield all([watcherA(), watcherB()])` in the root and having one bug silently stop every saga.',
        'Follow-up trap: "Does a parent saga finish before its forks?" No. A parent with attached forks only terminates after its own body and all its forks have finished.',
      ],
      takeaway: 'call blocks, fork runs attached in the background, spawn runs detached, all runs in parallel and waits for everything.',
    },
    {
      id: 'saga-race-async-flows',
      title: 'race and Complex Async Flows (Login, Polling, Timeouts)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'race runs effects together and keeps only the first to finish (cancelling the rest); combined with take/fork/cancel it models real flows like login/logout and polling.',
      what: `\`race({ a: effectA, b: effectB })\` starts all the effects at the same time. As soon as **one** finishes, the race ends, you get its result, and the **others are cancelled automatically**. The result object has a value only for the winner.

Typical uses:
- **Timeout:** \`race({ data: call(api.get), timeout: delay(5000) })\`.
- **Stop button:** \`race({ task: call(poll), stop: take('poll/stop') })\`.
- **User cancel:** \`race({ upload: call(uploadFile), cancel: take('upload/cancel') })\`.

#### Deeper version
The real power of sagas is writing a whole **flow** as sequential code with \`take\`, \`fork\`, \`cancel\` and \`race\`. The classic example is login/logout:

1. \`take\` the login request.
2. \`fork\` the authorize task, so we can **also** listen for logout at the same time.
3. \`take\` either logout or login error.
4. If logout arrived while authorize was still running, \`cancel\` the authorize task.
5. Clear the token and loop back to step 1.

This guarantees the order of events (you can't log out before you log in), and reading the code tells you the whole story of the feature. Doing this with thunks needs flags and manual cleanup scattered across files.`,
      why: `Real apps have flows with time limits, user-triggered stops, and steps that must happen in order. \`race\` and the take/fork/cancel pattern let you express these clearly and with automatic cleanup, instead of juggling timers, flags and abort controllers.`,
      analogy: `\`race\` is ordering a taxi on two apps at once: whichever car arrives first, you get in and **cancel** the other. A timeout is racing your taxi against your own patience: if 5 minutes pass first, you walk.`,
      code: [
        {
          title: 'Request with timeout, and polling with a stop action',
          lang: 'javascript',
          code: `import { race, call, put, take, delay } from 'redux-saga/effects';
import { api } from './api';

export function* fetchWithTimeout(action) {
  const { data, timeout } = yield race({
    data: call(api.getReport, action.payload),
    timeout: delay(5000),
  });
  if (timeout) yield put({ type: 'report/failed', payload: 'Request timed out' });
  else yield put({ type: 'report/loaded', payload: data });
}

function* pollOrderStatus(orderId) {
  while (true) {
    const order = yield call(api.getOrder, orderId);
    yield put({ type: 'order/updated', payload: order });
    if (order.status === 'delivered') return;    // finished naturally
    yield delay(3000);
  }
}

export function* orderPollingWatcher() {
  while (true) {
    const { payload: orderId } = yield take('order/startPolling');
    yield race({
      poll: call(pollOrderStatus, orderId),
      stop: take('order/stopPolling'),           // user leaves the page
    });
  }
}`,
        },
        {
          title: 'Login / logout flow with take, fork and cancel',
          lang: 'javascript',
          code: `import { take, fork, cancel, call, put } from 'redux-saga/effects';
import { api } from './api';

function* authorize(credentials) {
  try {
    const { token } = yield call(api.login, credentials);
    yield put({ type: 'auth/loginSuccess', payload: token });
    yield call([localStorage, 'setItem'], 'token', token);
  } catch (err) {
    yield put({ type: 'auth/loginError', payload: err.message });
  }
}

export function* loginFlow() {
  while (true) {
    const { payload } = yield take('auth/loginRequest');
    const task = yield fork(authorize, payload);           // non-blocking
    const action = yield take(['auth/logout', 'auth/loginError']);
    if (action.type === 'auth/logout') yield cancel(task); // logout during login
    yield call([localStorage, 'removeItem'], 'token');
    yield put({ type: 'auth/cleared' });
  }
}`,
        },
      ],
      output: `\`fetchWithTimeout\`: if the API answers in 2 s, \`data\` is set and \`timeout\` is \`undefined\` → \`report/loaded\`. If it takes 8 s, \`delay(5000)\` wins, the API call effect is cancelled, and \`report/failed\` is dispatched.

Polling: after \`order/startPolling\`, the order is fetched every 3 s. If the user dispatches \`order/stopPolling\`, the race cancels \`pollOrderStatus\` immediately. The watcher then waits for the next start.

Login flow: if the user clicks logout while the login request is still running, the authorize task is cancelled, so a late \`loginSuccess\` can never log them back in. The token is removed and the loop waits for the next login.`,
      questions: [
        { q: 'What does the race effect do?', a: 'It runs several effects at once, resolves with the first one to finish, and automatically cancels the losers. The result object only has a value for the winning key.' },
        { q: 'How do you add a timeout to an API call in a saga?', a: '`race({ res: call(api.fn), timeout: delay(ms) })`, then check which key is set.' },
        { q: 'Why fork authorize in the login flow instead of call?', a: 'With `call` the saga would block and could not listen for a logout during the login request. `fork` lets it wait for logout at the same time and cancel the login task.' },
        { q: 'How do you stop a polling saga?', a: 'Race the polling loop against `take("stop")`, or fork it and `cancel` the task when the stop action arrives.' },
      ],
      spoken: `"race starts several effects together and keeps the first one that finishes, automatically cancelling the others. I use it for timeouts, by racing an API call against delay, and for stop actions, by racing a polling loop against take of a stop action. For bigger flows I combine take, fork and cancel. In a login flow I take the login request, fork the authorize task so I can still listen, then take either logout or login error, and if it's logout I cancel the authorize task. The whole feature reads top to bottom, and ordering and cleanup are guaranteed."`,
      mistakes: [
        'Putting a non-blocking effect like `fork` inside `race` — it "finishes" instantly and always wins.',
        'Checking `if (result)` instead of checking which key is set; losers are `undefined`.',
        'Using `call` for the authorize step and missing logout actions dispatched during login.',
        'Follow-up trap: "What happens to the losing effects in a race?" They are cancelled — a cancelled saga jumps to its `finally` block, where you can clean up (e.g. abort the HTTP request).',
      ],
      takeaway: 'race = first one wins, the rest are cancelled; take + fork + cancel let you write whole flows in order.',
    },
    {
      id: 'saga-cancellation',
      title: 'Cancelling Saga Tasks (cancel, cancelled, takeLatest, race)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Sagas can be stopped mid-flight with cancel(task), takeLatest or race; the cancelled saga jumps to finally, where cancelled() lets you clean up.',
      what: `**Cancelling** means stopping a running saga before it finishes. There are three main ways:

1. **Manual:** \`const task = yield fork(worker)\` and later \`yield cancel(task)\`.
2. **takeLatest:** automatically cancels the previous worker when a new action arrives.
3. **race:** automatically cancels the effects that lose (for example the API call when a timeout wins).

When a saga is cancelled, it stops at the current \`yield\` and jumps to its \`finally\` block. Inside \`finally\`, \`yield cancelled()\` returns \`true\` if the saga was cancelled (and not just finished or failed), so you can clean up.

#### Deeper version
Cancellation **propagates downwards**: cancelling a task also cancels the effect it is blocked on (a \`call\` to another saga, a \`race\`, an \`all\`) and all its attached forks. It does not throw an error into the saga — \`catch\` blocks do not run, only \`finally\`.

Important: cancelling a saga does **not** automatically stop a real HTTP request — the Promise keeps running; its result is just ignored. To truly abort, create an \`AbortController\`, pass its \`signal\` to \`fetch\`, and call \`controller.abort()\` in \`finally\` when \`cancelled()\` is true. Redux-Saga also supports attaching a cancel function to a Promise with the \`CANCEL\` symbol from the \`redux-saga\` package; the middleware calls it when the effect is cancelled.

You can also cancel the **current** task from inside with \`yield cancel()\` (no argument).`,
      why: `Without cancellation, stale requests finish and overwrite fresh data, background polling keeps running after the user leaves a page, and logout can be undone by a late login response. Sagas make cleanup reliable because \`finally\` always runs.`,
      analogy: `Cancelling a saga is like cancelling a food delivery order. The app stops tracking it (the saga stops) and you get a chance to run cleanup ("refund", the \`finally\` block). But if you do not also call the restaurant (abort the HTTP request), they may still cook the food — you just ignore it when it arrives.`,
      code: [
        {
          title: 'Cleanup in finally and aborting fetch',
          lang: 'javascript',
          code: `import { call, put, cancelled, takeLatest } from 'redux-saga/effects';

function fetchJson(url, signal) {
  return fetch(url, { signal }).then((r) => r.json());
}

function* searchWorker(action) {
  const controller = new AbortController();
  try {
    yield put({ type: 'search/loading' });
    const data = yield call(fetchJson, \`/api/search?q=\${action.payload}\`, controller.signal);
    yield put({ type: 'search/success', payload: data });
  } catch (err) {
    yield put({ type: 'search/failure', payload: err.message });
  } finally {
    if (yield cancelled()) {
      controller.abort();                          // really stop the HTTP request
      console.log('cancelled search for', action.payload);
    }
  }
}

export function* searchWatcher() {
  yield takeLatest('search/query', searchWorker); // new query cancels the old worker
}`,
        },
        {
          title: 'Manual fork + cancel for a background sync',
          lang: 'javascript',
          code: `import { fork, take, cancel, call, put, delay, cancelled } from 'redux-saga/effects';
import { api } from './api';

function* backgroundSync() {
  try {
    while (true) {
      const changes = yield call(api.pullChanges);
      yield put({ type: 'sync/applied', payload: changes });
      yield delay(15000);
    }
  } finally {
    if (yield cancelled()) yield put({ type: 'sync/stopped' });
  }
}

export function* syncManager() {
  while (yield take('sync/start')) {
    const task = yield fork(backgroundSync);
    yield take('sync/stop');
    yield cancel(task);
  }
}`,
        },
      ],
      output: `Typing "re" then "red" quickly: the "re" worker is cancelled by \`takeLatest\`. It jumps to \`finally\`, \`cancelled()\` is \`true\`, the fetch is aborted and "cancelled search for re" is logged. Its \`catch\` does **not** run, so no false \`search/failure\`. Only "red" reaches \`search/success\`.

Background sync: after \`sync/start\` it pulls changes every 15 s. On \`sync/stop\`, the task is cancelled during its \`delay\` or \`call\`, the \`finally\` runs and \`sync/stopped\` is dispatched.`,
      questions: [
        { q: 'How do you cancel a saga task?', a: 'Keep the Task returned by `fork` and `yield cancel(task)`. `takeLatest` and `race` also cancel tasks automatically.' },
        { q: 'How does a saga know it was cancelled?', a: 'Cancellation jumps to the `finally` block, and `yield cancelled()` returns true there. `catch` does not run on cancellation.' },
        { q: 'Does cancelling a saga cancel the fetch request?', a: 'No, not by itself — the Promise keeps going and the result is ignored. Use an AbortController and abort it in `finally`, or attach a `CANCEL` function to the Promise.' },
        { q: 'Does cancellation propagate to child tasks?', a: 'Yes. Cancelling a task cancels the effect it is blocked on and all its attached forks, all the way down.' },
      ],
      spoken: `"Sagas can be cancelled in three ways: manually by forking a task and calling cancel on it, automatically with takeLatest, which cancels the previous worker, and with race, which cancels the losing effects. When a saga is cancelled it stops at the current yield and jumps to finally, where yield cancelled returns true, so I can clean up, for example abort the fetch with an AbortController or dispatch a stopped action. Catch blocks don't run on cancellation. Cancellation also propagates down to child tasks. Without the abort, the HTTP request would still finish in the background."`,
      mistakes: [
        'Expecting `catch` to run on cancellation — only `finally` runs.',
        'Assuming the network request stops when the saga is cancelled. It does not unless you abort it.',
        'Doing cleanup in `finally` without checking `cancelled()`, so it also runs after normal success.',
        'Follow-up trap: "Can a cancelled saga still dispatch actions?" Yes, inside `finally` it can still `yield put(...)` — that is how you dispatch a "cancelled" or "stopped" action.',
      ],
      takeaway: 'Cancel with cancel/takeLatest/race, clean up in finally with cancelled(), and abort the real request yourself.',
    },
    {
      id: 'saga-debounce-throttle',
      title: 'Debounce and Throttle in Sagas',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'debounce waits until actions stop for N ms before running; throttle runs at most once per N ms. Redux-Saga has both as built-in effects.',
      what: `**Debounce:** wait until the user **stops** doing something for N ms, then run once. Example: search-as-you-type — only search 500 ms after the last keystroke.

**Throttle:** run **at most once every** N ms, no matter how many actions come in. Example: scroll or resize events, "like" button spam, saving cursor position.

Redux-Saga (v1) has built-in effects:
- \`debounce(ms, pattern, worker)\`
- \`throttle(ms, pattern, worker)\`

You can also build them yourself from \`takeLatest\` + \`delay\` (debounce) or \`take\` + \`fork\` + \`delay\` (throttle).

#### Deeper version
**Manual debounce** with \`takeLatest\`: put \`yield delay(500)\` at the **start** of the worker. Every new action cancels the previous worker while it is still sleeping, so only the last one survives the delay. Bonus: it also cancels an in-flight request if a new action arrives during the API call — the built-in \`debounce\` does not cancel an already-started worker.

**Built-in throttle** behaviour: it runs the worker for the first action, then for N ms it keeps at most **one** (the most recent) action in a buffer and runs it when the period ends. So the final value is not lost.

Choosing: debounce for "wait until they are done" (search, autosave, validation); throttle for "regular updates during continuous activity" (scroll position, live drag, progress).`,
      why: `Without debounce, a search box sends a request on every key press — wasting server resources and causing flicker. Without throttle, a scroll handler can dispatch hundreds of actions per second and freeze the UI. These two effects fix it in one line.`,
      analogy: `**Debounce** is an elevator door: it waits until people stop walking in for a few seconds, then closes once. **Throttle** is a turnstile that lets one person through every 2 seconds, however big the crowd.`,
      code: [
        {
          title: 'Built-in debounce and throttle effects',
          lang: 'javascript',
          code: `import { debounce, throttle, call, put, all } from 'redux-saga/effects';
import { api } from './api';

function* searchWorker(action) {
  const results = yield call(api.search, action.payload);
  yield put({ type: 'search/success', payload: results });
}

function* saveScrollWorker(action) {
  yield call(api.saveReadingPosition, action.payload);
}

export function* uiSagas() {
  yield all([
    debounce(500, 'search/query', searchWorker),       // after typing stops
    throttle(1000, 'reader/scrolled', saveScrollWorker), // max once per second
  ]);
}`,
        },
        {
          title: 'Manual debounce with takeLatest + delay (also cancels in-flight requests)',
          lang: 'javascript',
          code: `import { takeLatest, delay, call, put } from 'redux-saga/effects';
import { api } from './api';

function* debouncedSearch(action) {
  yield delay(500);                                   // cancelled if a new query arrives
  if (action.payload.trim().length < 2) return;       // skip tiny queries
  const results = yield call(api.search, action.payload);
  yield put({ type: 'search/success', payload: results });
}

export function* searchWatcher() {
  yield takeLatest('search/query', debouncedSearch);
}`,
        },
      ],
      output: `Typing "shoes" fires 5 \`search/query\` actions within 300 ms. With \`debounce(500, ...)\`, only the last one ("shoes") runs \`searchWorker\`, 500 ms after the last key — **one** API call instead of five.

Scrolling for 3 seconds fires hundreds of \`reader/scrolled\` actions. With \`throttle(1000, ...)\`, the position is saved about once per second, and the latest position is still saved at the end.

In the manual version, each new key cancels the sleeping worker; if the user types again while a request is in flight, that request is cancelled too.`,
      questions: [
        { q: 'Difference between debounce and throttle?', a: 'Debounce runs once after events stop for N ms. Throttle runs at most once every N ms while events keep coming.' },
        { q: 'How do you debounce in Redux-Saga?', a: 'Use the `debounce(ms, pattern, worker)` effect, or `takeLatest` with `yield delay(ms)` as the first line of the worker.' },
        { q: 'When would you use throttle?', a: 'For continuous events where you want regular updates: scroll, resize, drag, mouse move, or rate-limiting a button.' },
        { q: 'Why might takeLatest + delay be better than debounce?', a: 'Because takeLatest also cancels a worker that already started its API call, so stale responses can never be applied. The built-in debounce only delays starting the worker.' },
      ],
      spoken: `"Debounce waits until events stop for a set time and then runs once, which is perfect for search-as-you-type or autosave. Throttle runs at most once per interval while events keep coming, which I use for scroll or resize. Redux-Saga has both as effects: debounce with a time, pattern and worker, and throttle the same way. I can also write debounce manually with takeLatest and a delay at the top of the worker. I often prefer that for search, because takeLatest also cancels an in-flight request, so an old response can never overwrite a newer one."`,
      mistakes: [
        'Mixing up the two: using throttle for search (fires mid-typing) or debounce for scroll (nothing happens until scrolling stops).',
        'Debouncing in the component with a new debounced function each render, so it never actually debounces. Saga-level debounce avoids this.',
        'Putting `delay` **after** the API call in a takeLatest worker — the request is already sent, so nothing is saved.',
        'Follow-up trap: "Does the built-in throttle drop the last action?" No — it keeps the most recent action in a buffer of size one and runs it after the interval.',
      ],
      takeaway: 'Debounce = wait for quiet then run once; throttle = at most once per interval — both are one-line effects in Redux-Saga.',
    },
    {
      id: 'saga-error-handling',
      title: 'Error Handling in Sagas (try/catch, Failure Actions, Retry)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Wrap effects in try/catch, put a failure action for the UI, retry flaky calls with retry() or a backoff loop, and never let errors kill your watchers.',
      what: `Inside a saga, a failed \`call\` (a rejected Promise) **throws** at the \`yield\` line. So you handle errors with normal \`try/catch\`:

1. \`try\` the \`call\`.
2. In \`catch\`, \`put\` a **failure action** (like \`'user/loadFailed'\`) so the reducer can store the error and the UI can show it.
3. Use \`finally\` for cleanup (stop spinners, close resources).

For flaky networks, **retry**: the built-in \`retry(maxTries, delayMs, fn, ...args)\` effect calls \`fn\` again if it fails, up to \`maxTries\` times. For exponential backoff, write a loop with \`delay\`.

#### Deeper version
**Uncaught errors are dangerous.** Errors bubble up the **fork tree**: a worker started by \`takeEvery\`/\`takeLatest\` is an attached fork, so an uncaught error in one worker bubbles up to the watcher and **terminates it** — after that, the feature silently stops working until reload. If the error reaches the root saga, all sagas stop. Rules:
- Every worker has its own try/catch.
- Make the root saga resilient (spawn + restart).
- Use \`createSagaMiddleware({ onError })\` to report uncaught errors to Sentry or similar.

Also decide **what** to retry: retry network errors and 5xx, but not 4xx like 400/401/404 — those will fail again. On 401, dispatch a "session expired" action instead.`,
      why: `In production, APIs fail. Without proper handling, the UI spins forever, users see nothing, and one bad response can kill a watcher so the feature stops working until reload. Good error handling keeps the app responsive and debuggable.`,
      analogy: `Calling a busy support line: if it fails, you **try again** a few times, waiting longer each time (retry with backoff). If it still fails, you **leave a note** for your family ("support is down") — that is the failure action. You do not throw your phone away (killing the watcher).`,
      code: [
        {
          title: 'try/catch + failure action + built-in retry',
          lang: 'javascript',
          code: `import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { api } from './api';

function* loadProfile(action) {
  try {
    yield put({ type: 'profile/loading' });
    // try up to 3 times, 1s apart
    const profile = yield retry(3, 1000, api.getProfile, action.payload);
    yield put({ type: 'profile/loaded', payload: profile });
  } catch (err) {
    yield put({ type: 'profile/loadFailed', payload: err.message, error: true });
  }
}

export function* profileWatcher() {
  yield takeLatest('profile/load', loadProfile); // watcher survives because worker catches
}`,
        },
        {
          title: 'Exponential backoff, only for retryable errors',
          lang: 'javascript',
          code: `import { call, delay, put } from 'redux-saga/effects';

const isRetryable = (err) => !err.status || err.status >= 500; // network or 5xx

export function* callWithBackoff(fn, ...args) {
  const maxTries = 4;
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    try {
      return yield call(fn, ...args);
    } catch (err) {
      if (err.status === 401) {
        yield put({ type: 'auth/sessionExpired' });
        throw err;                                       // do not retry auth errors
      }
      if (!isRetryable(err) || attempt === maxTries) throw err;
      yield delay(500 * 2 ** (attempt - 1));             // 500ms, 1s, 2s
    }
  }
}

// usage inside a worker: const data = yield call(callWithBackoff, api.getOrders, userId);

// Global safety net:
// const sagaMiddleware = createSagaMiddleware({ onError: (e) => Sentry.captureException(e) });`,
        },
      ],
      output: `If \`api.getProfile\` fails twice and works on the third try, the user just sees a slightly longer spinner and then their profile. If it fails all 3 times, \`retry\` throws the last error, the \`catch\` puts \`profile/loadFailed\`, and the reducer can show "Could not load profile". The watcher keeps running, so the user can press "Try again".

With backoff, a 503 is retried after 500 ms, 1 s and 2 s. A 404 fails immediately (not retryable). A 401 dispatches \`auth/sessionExpired\` and stops.`,
      questions: [
        { q: 'How do you handle errors in a saga?', a: 'Wrap `call` in try/catch. A rejected Promise throws at the yield. In catch, `put` a failure action so the UI can react; use finally for cleanup.' },
        { q: 'What happens if a worker saga throws and nobody catches it?', a: 'The error bubbles up the fork tree. It terminates the watcher (and possibly the root saga), so that feature stops responding to actions until reload.' },
        { q: 'How do you retry a failing API call in a saga?', a: 'Use `retry(maxTries, delayMs, fn, ...args)`, or write a loop with try/catch and `delay` for exponential backoff.' },
        { q: 'Which errors should you retry?', a: 'Network errors and 5xx server errors. Not 4xx errors like 400, 401, 403 or 404, which will fail the same way again.' },
      ],
      spoken: `"In sagas, a rejected call throws at the yield line, so I use normal try/catch. In the catch I put a failure action, so the reducer can store the error and the UI can show a message, and I use finally for cleanup. For flaky APIs I use the retry effect, or a loop with exponential backoff that only retries network and 5xx errors, not 4xx. The most important rule is that every worker catches its own errors, because an uncaught error bubbles up and kills the watcher, or even the root saga. I also set onError on the saga middleware to report anything uncaught."`,
      mistakes: [
        'No try/catch in a worker — one failure silently kills the `takeEvery` watcher and the feature stops working.',
        'Retrying 4xx errors (wrong input, unauthorized) — they never succeed and just add load.',
        'Putting only a `console.log` in catch, so the spinner never stops because no failure action is dispatched.',
        'Follow-up trap: "Can you catch an error from a forked task in the parent?" Not with try/catch around `fork`. The error aborts the parent. Catch it inside the forked saga, or use `call` if you need to catch it in the parent.',
      ],
      takeaway: 'Every worker catches its own errors and puts a failure action; retry only retryable errors; never let an error kill a watcher.',
    },
    {
      id: 'saga-channels',
      title: 'Saga Channels: eventChannel for WebSockets, actionChannel for Queues',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Channels let sagas take messages from sources other than Redux actions: eventChannel wraps WebSockets/events, actionChannel queues actions to handle them one by one.',
      what: `Normally \`take\` waits for **Redux actions**. A **channel** is a queue of messages that a saga can \`take\` from — so sagas can listen to **other** sources too.

- \`eventChannel(subscribe)\` — turns an **external event source** (WebSocket, Firebase listener, timer, browser events) into a channel. You subscribe inside it, call \`emit(message)\` for each event, and return an **unsubscribe** function.
- \`actionChannel(pattern)\` — buffers matching **Redux actions** so you can handle them **one at a time, in order** (a queue), instead of in parallel.
- \`channel()\` — a plain channel for communication between sagas (for example a worker pool).

#### Deeper version
With \`eventChannel\`:
- \`yield take(chan)\` blocks until the next message.
- \`emit(END)\` closes the channel; any saga waiting on \`take\` is terminated.
- If you emit an \`Error\` object, the \`take\` throws it, so you can catch it.
- Always close the channel in \`finally\` (\`chan.close()\` calls your unsubscribe), so sockets do not leak when the saga is cancelled.
- Pass a **buffer** (e.g. \`buffers.sliding(100)\`) to control what happens when messages arrive faster than you process them. Without a suitable buffer, messages may be dropped while the saga is busy — check the buffer defaults for your version.

\`actionChannel\` + a \`while(true) { take; call }\` loop gives you **sequential** processing: each action waits for the previous one to finish (useful for ordered writes like "save step 1, then step 2").`,
      why: `Real-time features (chat, live prices, order tracking, notifications) receive data from WebSockets, not from Redux actions. eventChannel lets you handle this push data with the same saga tools: put to the store, cancel on logout, close cleanly. actionChannel solves "process these requests in order" without losing any.`,
      analogy: `An \`eventChannel\` is a **mailbox** fixed outside your house: the postman (WebSocket) drops letters in whenever they arrive, and you (the saga) take them out one by one. \`END\` is a sign saying "no more mail, mailbox closed". \`actionChannel\` is a **ticket queue** at a bank counter: customers wait in line and are served one at a time.`,
      code: [
        {
          title: 'WebSocket with eventChannel (read + write + cleanup)',
          lang: 'javascript',
          code: `import { eventChannel, END, buffers } from 'redux-saga';
import { call, put, take, fork, cancel, cancelled } from 'redux-saga/effects';

function createSocketChannel(socket) {
  return eventChannel((emit) => {
    socket.onmessage = (event) => emit(JSON.parse(event.data));
    socket.onerror = () => emit(new Error('WebSocket error')); // take() will throw this
    socket.onclose = () => emit(END);                            // closes the channel
    return () => socket.close();                                 // unsubscribe
  }, buffers.sliding(100)); // keep the latest 100 messages if we fall behind
}

function* sendMessages(socket) {
  while (true) {
    const { payload } = yield take('chat/send');
    socket.send(JSON.stringify(payload));
  }
}

function* chatSession(url) {
  const socket = new WebSocket(url);
  const chan = yield call(createSocketChannel, socket);
  const writer = yield fork(sendMessages, socket);
  try {
    while (true) {
      const message = yield take(chan);                 // wait for the next server message
      yield put({ type: 'chat/received', payload: message });
    }
  } catch (err) {
    yield put({ type: 'chat/error', payload: err.message });
  } finally {
    yield cancel(writer);
    chan.close();                                       // always clean up the socket
    if (yield cancelled()) yield put({ type: 'chat/disconnected' });
  }
}

export function* chatWatcher() {
  while (true) {
    const { payload: url } = yield take('chat/connect');
    const session = yield fork(chatSession, url);
    yield take(['chat/disconnect', 'auth/logout']);
    yield cancel(session);                              // triggers the finally above
  }
}`,
        },
        {
          title: 'actionChannel: process uploads one at a time, in order',
          lang: 'javascript',
          code: `import { actionChannel, take, call, put } from 'redux-saga/effects';
import { api } from './api';

export function* uploadQueue() {
  const chan = yield actionChannel('files/upload'); // buffers incoming actions
  while (true) {
    const { payload: file } = yield take(chan);
    yield call(api.upload, file);                    // blocking -> strictly one at a time
    yield put({ type: 'files/uploaded', payload: file.name });
  }
}`,
        },
      ],
      output: `On \`chat/connect\`, a WebSocket is opened and wrapped in a channel. Every server message becomes a \`chat/received\` action. A \`chat/send\` action is written to the socket by the forked writer. On \`chat/disconnect\` or logout, the session is cancelled: \`finally\` cancels the writer, closes the channel (which closes the socket) and dispatches \`chat/disconnected\`. If the server closes the socket, \`END\` ends the session saga too.

With \`actionChannel\`, if the user drops 3 files at once, they are uploaded one after another in the same order, and none are lost — unlike \`takeLatest\` (cancels) or \`takeLeading\` (ignores).`,
      questions: [
        { q: 'What is an eventChannel?', a: 'A channel that wraps an external event source. You subscribe inside it, emit messages, and return an unsubscribe function. A saga then uses `take(channel)` to receive the messages one by one.' },
        { q: 'How do you integrate a WebSocket with Redux-Saga?', a: 'Wrap the socket in an eventChannel, loop with `take(chan)` and `put` each message to the store, fork a separate saga that takes "send" actions and writes to the socket, and close the channel in `finally`.' },
        { q: 'What does END do?', a: 'Emitting `END` closes the channel; a saga blocked on `take` for that channel is terminated.' },
        { q: 'What is actionChannel used for?', a: 'To queue Redux actions and process them sequentially, without dropping or cancelling any, e.g. ordered uploads or writes.' },
      ],
      spoken: `"Channels let sagas take messages from sources other than Redux actions. For WebSockets I use eventChannel: inside it I attach the socket's message, error and close handlers, emit each parsed message, emit END on close, and return an unsubscribe that closes the socket. My saga loops with take on the channel and puts each message to the store. A forked saga handles outgoing messages. In finally I close the channel, so cancelling the saga on logout or disconnect always cleans up the socket. For processing actions one by one in order I use actionChannel."`,
      mistakes: [
        'Not closing the channel in `finally`, so the socket stays open after logout (memory and connection leak).',
        'Doing a long blocking `call` in the read loop without a buffer, so incoming messages pile up or are dropped.',
        'Forgetting to return an unsubscribe function from the eventChannel subscriber — it is required.',
        'Follow-up trap: "How do you reconnect after the socket drops?" Wrap the session in a loop: when the channel ends or errors, `delay` with backoff and create a new socket, unless a disconnect action was dispatched.',
      ],
      takeaway: 'Wrap external events in an eventChannel, take from it in a loop, put to the store, and always close it in finally.',
    },
    {
      id: 'testing-sagas',
      title: 'Testing Sagas (Step-by-Step and redux-saga-test-plan)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Test sagas either by stepping the generator and comparing effect objects, or with redux-saga-test-plan to run the saga with mocked calls and assert on results.',
      what: `Sagas are easy to test because they **yield plain effect objects**. There are two styles:

1. **Step-by-step (unit) testing** — call the saga to get the generator, call \`gen.next()\`, and compare the yielded value with the expected effect (\`call(api.getUser, 1)\`). Feed fake results back with \`gen.next(fakeData)\`, or simulate errors with \`gen.throw(error)\`. No real API calls, no mocks.

2. **Integration testing with redux-saga-test-plan** — \`expectSaga(saga, ...args)\` actually **runs** the saga. You \`provide\` fake results for calls, and assert things like "it should put this action" or "final state should be this". The order of effects does not matter, so tests do not break when you refactor.

#### Deeper version
Step-by-step tests are precise but **brittle**: if you add a \`select\` or reorder two effects, the test breaks even if behaviour is correct. To test branches (success vs error) without repeating setup, use \`cloneableGenerator\` from \`@redux-saga/testing-utils\` and \`.clone()\` the generator at the fork point.

\`expectSaga\` features: \`.provide([[matchers.call.fn(api.getUser), fakeUser]])\` to mock by function, \`throwError(err)\` provider for failures, \`.withReducer(reducer)\` + \`.hasFinalState(state)\`, \`.dispatch(action)\` to simulate later actions, and \`.run()\` returns a Promise (it times out with a warning for never-ending watchers, or use \`.silentRun()\`). \`testSaga\` from the same library gives a fluent, ordered unit-test API.`,
      why: `Async logic is where bugs hide: wrong order of actions, missing failure handling, retry loops. Because sagas are generators that yield descriptions, they are among the easiest async code to test — a real advantage over thunks, and a common interview follow-up.`,
      analogy: `Step-by-step testing is checking a recipe **line by line**: "first it says boil water — correct; then add pasta — correct". redux-saga-test-plan is **tasting the final dish**: you do not care about the exact order of steps, only that the result is right.`,
      code: [
        {
          title: 'The saga under test',
          lang: 'javascript',
          code: `// userSaga.js
import { call, put, select } from 'redux-saga/effects';
import { api } from './api';

export const selectToken = (state) => state.auth.token;

export function* loadUser(action) {
  try {
    const token = yield select(selectToken);
    const user = yield call(api.getUser, action.payload, token);
    yield put({ type: 'user/loaded', payload: user });
  } catch (err) {
    yield put({ type: 'user/failed', payload: err.message });
  }
}`,
        },
        {
          title: 'Step-by-step generator test (Jest)',
          lang: 'javascript',
          code: `import { call, put, select } from 'redux-saga/effects';
import { loadUser, selectToken } from './userSaga';
import { api } from './api';

test('loadUser success path', () => {
  const gen = loadUser({ type: 'user/load', payload: 7 });

  expect(gen.next().value).toEqual(select(selectToken));
  expect(gen.next('tok123').value).toEqual(call(api.getUser, 7, 'tok123')); // feed token
  const fakeUser = { id: 7, name: 'Asha' };
  expect(gen.next(fakeUser).value).toEqual(put({ type: 'user/loaded', payload: fakeUser }));
  expect(gen.next().done).toBe(true);
});

test('loadUser error path', () => {
  const gen = loadUser({ type: 'user/load', payload: 7 });
  gen.next();          // select
  gen.next('tok123');  // call
  expect(gen.throw(new Error('500')).value).toEqual(put({ type: 'user/failed', payload: '500' }));
});`,
        },
        {
          title: 'Integration test with redux-saga-test-plan',
          lang: 'javascript',
          code: `import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { loadUser, selectToken } from './userSaga';
import { api } from './api';

test('puts user/loaded with the fetched user', () => {
  const fakeUser = { id: 7, name: 'Asha' };
  return expectSaga(loadUser, { type: 'user/load', payload: 7 })
    .provide([
      [matchers.select(selectToken), 'tok123'],
      [matchers.call.fn(api.getUser), fakeUser],     // mock any call to api.getUser
    ])
    .put({ type: 'user/loaded', payload: fakeUser })
    .run();
});

test('puts user/failed when the API throws', () => {
  return expectSaga(loadUser, { type: 'user/load', payload: 7 })
    .provide([
      [matchers.select(selectToken), 'tok123'],
      [matchers.call.fn(api.getUser), throwError(new Error('Not found'))],
    ])
    .put({ type: 'user/failed', payload: 'Not found' })
    .run();
});`,
        },
      ],
      output: `In the step-by-step test, each \`gen.next()\` returns the next effect object. \`toEqual\` compares the description, not a real API call, so no network is used. Passing \`'tok123'\` and \`fakeUser\` into \`next()\` simulates what the middleware would return. \`gen.throw\` jumps into the \`catch\` and we check the failure \`put\`.

In \`expectSaga\`, the saga really runs. The providers intercept \`select\` and \`call\`, and the test passes if the expected \`put\` happened at any point. If you later add a logging \`put\`, these tests still pass; the step-by-step test would need updating.`,
      questions: [
        { q: 'Why are sagas easy to test?', a: 'They yield plain objects that describe effects. Tests can step through the generator and compare those objects, feeding fake results with `next()` and errors with `throw()`, without mocking the network.' },
        { q: 'What is the downside of step-by-step saga tests?', a: 'They test implementation order, so refactoring (adding or reordering effects) breaks them even when behaviour is correct.' },
        { q: 'What does redux-saga-test-plan give you?', a: '`expectSaga` to run a saga with mocked effects (providers) and assert on puts, calls and final reducer state regardless of order; and `testSaga` for strict ordered unit tests.' },
        { q: 'How do you test both branches of a saga without duplicating steps?', a: 'Use `cloneableGenerator` from `@redux-saga/testing-utils` and `.clone()` the generator at the branching point.' },
      ],
      spoken: `"Sagas are very testable because they yield plain effect objects. The simplest way is step by step: I call the saga to get a generator, call next, and assert the yielded value equals, say, call of api.getUser with the right arguments. I feed fake responses back with next and simulate failures with throw. That's precise but brittle to refactors. For behaviour tests I use redux-saga-test-plan's expectSaga: I provide mocked results for calls and selects, then assert that certain actions were put or that the reducer reached a final state, regardless of effect order."`,
      mistakes: [
        'Calling real APIs in saga tests instead of feeding fake values with `next()` or providers.',
        'Comparing effects with `toBe` instead of `toEqual` — effects are new objects each time, so only deep equality works.',
        'Writing only step-by-step tests for everything, so every small refactor breaks dozens of tests.',
        'Follow-up trap: "How do you test a watcher that runs forever?" Test the worker directly, or use `expectSaga` with `.dispatch(action)` and `.silentRun()` (which stops after a timeout without warnings).',
      ],
      takeaway: 'Step the generator for precise unit tests; use expectSaga with providers for refactor-proof behaviour tests.',
    },
    {
      id: 'redux-nextjs-ssr',
      title: 'Redux with Next.js and Server-Side Rendering',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'On the server, create a new store per request (never a global one), provide it from a client component, and keep server data in Server Components or RTK Query.',
      what: `In a normal React SPA there is one browser and one store. On a server (Next.js), **many users** share the same Node process. If you create the store as a module-level variable, user A's data can leak into user B's page.

So the rules are:
1. Create a **new store per request** with a \`makeStore()\` function.
2. In the App Router, Redux hooks only work in **Client Components** (\`'use client'\`). Create the store once per component tree with \`useRef\` in a \`StoreProvider\` client component.
3. **Server Components** cannot use Redux — fetch data there directly and pass it down, or use it to initialise the store.

#### Deeper version
The Redux docs' Next.js guide recommends: \`makeStore\` returns a fresh \`configureStore\`; a client \`StoreProvider\` keeps it in a \`useRef\` so it is created only once per browser session and can be **initialised** with server data (dispatch an action before first render); and stores should be per-route-safe — do not read Redux state in Server Components.

Also keep in mind: Next.js already caches server data, so ask whether you need Redux at all — often RTK Query/React Query or Server Components cover it, and Redux holds only true client state (cart, UI preferences). Details of the Next.js caching model change between versions, so check the current Next.js and Redux docs.`,
      why: `This is a common real-world bug and a good senior-level interview question: a shared server-side store leaks private data between users. Knowing the per-request pattern shows you understand SSR, not just Redux.`,
      analogy: `A server is like a **hotel**. Each guest (request) must get a **fresh room** (a new store). If you reuse one room for everyone without cleaning it, the next guest finds the last guest's belongings (data leak).`,
      code: [
        {
          title: 'makeStore and a client StoreProvider (App Router)',
          lang: 'tsx',
          code: `// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const makeStore = () => configureStore({ reducer: { cart: cartReducer } }); // new store each call
export type AppStore = ReturnType<typeof makeStore>;

// app/StoreProvider.tsx
'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '../lib/store';
import { cartLoaded } from '../lib/cartSlice';

export default function StoreProvider({ initialCart, children }: { initialCart: unknown[]; children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();                           // once per tree, never global
    storeRef.current.dispatch(cartLoaded(initialCart));       // seed with server data
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}

// app/layout.tsx (Server Component)
// const cart = await getCartFromDb(userId);
// return <StoreProvider initialCart={cart}>{children}</StoreProvider>;`,
        },
      ],
      output: `Each request renders a new \`StoreProvider\`, which creates a new store with \`makeStore()\` and seeds it with that user's cart from the server. On the client, \`useRef\` keeps the same store across re-renders, so state is not reset. No store lives at module level, so one user's cart can never appear in another user's HTML. Server Components fetch data directly and only Client Components use \`useSelector\`.`,
      questions: [
        { q: 'Why not export a single global store in Next.js?', a: 'The server handles many users in one process. A module-level store would be shared between requests and could leak one user\'s data to another.' },
        { q: 'Can you use useSelector in a Server Component?', a: 'No. Redux hooks rely on React context and client state; they only work in Client Components marked `use client`.' },
        { q: 'How do you pass server data into the Redux store?', a: 'Fetch it in a Server Component, pass it as a prop to a client StoreProvider, and dispatch an init action when the store is created (or use preloadedState in makeStore).' },
      ],
      spoken: `"With Next.js the main rule is: never create a global store, because the server handles many users and state would leak between requests. I write a makeStore function and create the store inside a client StoreProvider component, kept in a useRef so it's created only once per tree. Redux hooks only work in client components, so Server Components fetch data directly and pass it down, and I can seed the store with an init action. I also ask whether I need Redux at all there — often server components plus RTK Query cover data, and Redux only holds client state like the cart."`,
      mistakes: [
        'Exporting `const store = configureStore(...)` at module level and using it in SSR.',
        'Trying to read Redux state in a Server Component.',
        'Creating the store directly in the component body without `useRef`, so a new empty store is created on every render.',
        'Follow-up trap: "What about next-redux-wrapper?" It was the common solution for the Pages Router. For the App Router, the Redux docs recommend the per-request makeStore + client provider pattern instead; check the docs for your setup.',
      ],
      takeaway: 'In Next.js, one store per request via makeStore, provided from a client component — never a module-level store.',
    },
  ],
  rapidFire: [
    { q: 'What are the three principles of Redux?', a: 'Single source of truth, state is read-only, and changes are made with pure reducers.' },
    { q: 'What is an action?', a: 'A plain object with a `type` (and usually a `payload`) describing what happened.' },
    { q: 'What is a reducer?', a: 'A pure function `(state, action) => newState` that never mutates its inputs.' },
    { q: 'What three methods does a store expose?', a: '`getState`, `dispatch` and `subscribe`.' },
    { q: 'What does combineReducers do?', a: 'Builds one root reducer where each slice reducer manages its own key of the state.' },
    { q: 'Why must reducers not mutate state?', a: 'Redux and react-redux detect changes by reference; mutation hides changes and breaks time travel.' },
    { q: 'How does useSelector decide to re-render?', a: 'It compares the new selector result to the old one with `===`.' },
    { q: 'What does useDispatch return?', a: 'The store\'s stable `dispatch` function.' },
    { q: 'What is the old alternative to react-redux hooks?', a: 'The `connect(mapStateToProps, mapDispatchToProps)` higher-order component.' },
    { q: 'How do you avoid re-renders when selecting several fields?', a: 'Select them separately, pass `shallowEqual`, or use a memoized selector.' },
    { q: 'What is Redux Toolkit?', a: 'The official, recommended way to write Redux: configureStore, createSlice, createAsyncThunk, RTK Query and more.' },
    { q: 'What does configureStore add by default?', a: 'Thunk middleware, dev-only immutability and serializability checks, and DevTools support.' },
    { q: 'What does createSlice generate?', a: 'A reducer, action creators, and action types like `sliceName/reducerName`.' },
    { q: 'How must extraReducers be written in RTK 2.x?', a: 'With the builder callback: `builder.addCase(...)`.' },
    { q: 'What is a prepare callback for?', a: 'Building the action payload (ids, timestamps) outside the reducer to keep it pure.' },
    { q: 'What is Immer?', a: 'A library that lets you "mutate" a draft and produces a new immutable state with structural sharing.' },
    { q: 'Can you mutate the draft and also return a value?', a: 'No — do one or the other, never both.' },
    { q: 'What is a thunk?', a: 'A function dispatched instead of an action; the thunk middleware calls it with dispatch and getState.' },
    { q: 'What three actions does createAsyncThunk dispatch?', a: '`pending`, `fulfilled` and `rejected`.' },
    { q: 'What does rejectWithValue do?', a: 'Rejects the thunk with a custom payload that lands in `action.payload`.' },
    { q: 'What does .unwrap() do on a thunk result?', a: 'Returns the fulfilled payload or throws the rejected error.' },
    { q: 'What is the middleware signature?', a: '`store => next => action => { ... }`.' },
    { q: 'What happens if middleware never calls next?', a: 'The action never reaches the reducer.' },
    { q: 'What is a memoized selector?', a: 'A selector that returns a cached result when its inputs have not changed by reference.' },
    { q: 'Which function creates memoized selectors?', a: '`createSelector` from Reselect (re-exported by RTK).' },
    { q: 'What shape does createEntityAdapter use?', a: '`{ ids: [], entities: {} }`.' },
    { q: 'What option handles MongoDB `_id` in createEntityAdapter?', a: '`selectId: (item) => item._id`.' },
    { q: 'What is rehydration in redux-persist?', a: 'Loading saved state from storage back into the store on startup.' },
    { q: 'What is PersistGate for?', a: 'It delays rendering until the persisted state has been restored.' },
    { q: 'What is RTK Query for?', a: 'Fetching and caching server data with auto-generated hooks and tag-based invalidation.' },
    { q: 'providesTags vs invalidatesTags?', a: 'Queries provide tags; mutations invalidate them to trigger refetches.' },
    { q: 'isLoading vs isFetching in RTK Query?', a: '`isLoading` is the first load only; `isFetching` is any request, including refetches.' },
    { q: 'Context vs Redux in one line?', a: 'Context passes values (all consumers re-render); Redux manages state with selective subscriptions and middleware.' },
    { q: 'What is the RTK alternative to sagas for reactive logic?', a: '`createListenerMiddleware`.' },
    { q: 'What is a generator function?', a: 'A `function*` that can pause at `yield` and resume with `next(value)`.' },
    { q: 'What does calling a generator return?', a: 'An iterator; the body does not run until `next()` is called.' },
    { q: 'What is a saga effect?', a: 'A plain object describing work (call, put, take...) that the saga middleware executes.' },
    { q: 'call vs fork?', a: '`call` blocks until done; `fork` starts a background task and continues immediately.' },
    { q: 'fork vs spawn?', a: '`fork` is attached (errors bubble, cancels with parent); `spawn` is detached.' },
    { q: 'What does put do?', a: 'Dispatches an action from a saga.' },
    { q: 'What does select do?', a: 'Reads data from the current state using a selector.' },
    { q: 'What does take do?', a: 'Pauses the saga until a matching action is dispatched and returns it.' },
    { q: 'What does all do?', a: 'Runs effects in parallel and waits for all; if one fails, the rest are cancelled.' },
    { q: 'What does race do?', a: 'Runs effects together, keeps the first to finish, and cancels the others.' },
    { q: 'takeEvery vs takeLatest?', a: '`takeEvery` runs every action; `takeLatest` cancels the previous running task.' },
    { q: 'What is takeLeading good for?', a: 'Preventing double submits: it ignores new actions while one is running.' },
    { q: 'How do you add a timeout to a saga call?', a: '`race({ data: call(fn), timeout: delay(ms) })`.' },
    { q: 'Where does a cancelled saga go?', a: 'To its `finally` block, where `yield cancelled()` returns true.' },
    { q: 'Does cancelling a saga abort fetch?', a: 'No — abort it yourself with an AbortController in `finally`.' },
    { q: 'How do you debounce in Redux-Saga?', a: '`debounce(ms, pattern, worker)` or `takeLatest` with `delay` at the start of the worker.' },
    { q: 'What does throttle do in Redux-Saga?', a: 'Runs the worker at most once per interval, keeping the latest action buffered.' },
    { q: 'What happens if a takeEvery worker throws uncaught?', a: 'The error bubbles up and kills the watcher, so the feature stops responding.' },
    { q: 'Which saga effect retries a call?', a: '`retry(maxTries, delayMs, fn, ...args)`.' },
    { q: 'What is an eventChannel used for?', a: 'Wrapping external event sources like WebSockets so sagas can `take` their messages.' },
    { q: 'What does emitting END do?', a: 'Closes the channel and terminates sagas waiting on it.' },
    { q: 'What is actionChannel for?', a: 'Queuing actions so they are processed one at a time, in order.' },
    { q: 'How do you unit test a saga?', a: 'Step the generator with `next()`/`throw()` and compare yielded effects with `toEqual`.' },
    { q: 'What is expectSaga?', a: 'A redux-saga-test-plan API that runs a saga with mocked providers and asserts puts and final state.' },
    { q: 'Why one store per request in Next.js?', a: 'A global server-side store would leak data between users.' },
  ],
};
