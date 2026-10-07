// Interview problems for the Redux stack (Redux Toolkit, react-redux, redux-saga, RTK Query).
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'redux',
  problems: [
    {
      id: 'cart-slice',
      title: 'Write a shopping cart slice with a totals selector',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'redux-toolkit',
      question: `Using Redux Toolkit's \`createSlice\`, build a \`cart\` slice with these actions:

- \`addItem({ id, name, price })\` — adds the product, or increases quantity by 1 if it is already in the cart.
- \`removeItem(id)\` — removes the product.
- \`setQuantity({ id, quantity })\` — sets the quantity; \`0\` or less removes the item.
- \`clearCart()\`.

Also write selectors for the **item count** and the **subtotal**. Prices are in cents (paise) as integers.

\`\`\`javascript
dispatch(addItem({ id: 'p1', name: 'Shirt', price: 50000 }));
dispatch(addItem({ id: 'p1', name: 'Shirt', price: 50000 }));
dispatch(addItem({ id: 'p2', name: 'Cap', price: 19900 }));
dispatch(setQuantity({ id: 'p2', quantity: 3 }));
// count = 5, subtotal = 159700
\`\`\``,
      hints: [
        'Store items in an object keyed by id (`items: { p1: {...} }`) so lookups are O(1).',
        'Inside `createSlice` reducers you can "mutate" the state — Immer turns it into an immutable update.',
        'Totals are derived data. Do not store them in state; compute them in a selector (memoized with `createSelector`).',
      ],
      solution: `**Idea:** keep only the minimal data (the items) in state. Everything you can calculate (count, subtotal) goes in selectors.

\`\`\`javascript
// features/cart/cartSlice.js
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = { items: {} }; // { [productId]: { id, name, price, quantity } }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { id, name, price } = action.payload;
      const existing = state.items[id];
      if (existing) {
        existing.quantity += 1;            // "mutation" is safe: Immer makes a copy
      } else {
        state.items[id] = { id, name, price, quantity: 1 };
      }
    },
    removeItem(state, action) {
      delete state.items[action.payload];  // payload is the id
    },
    setQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items[id];
      if (!item) return;                    // unknown id: do nothing
      if (quantity <= 0) delete state.items[id];
      else item.quantity = Math.floor(quantity);
    },
    clearCart() {
      return initialState;                  // returning a new value replaces the state
    },
  },
});

export const { addItem, removeItem, setQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// ---- Selectors ----
const selectItemsById = (state) => state.cart.items;

// Memoized: Object.values creates a new array, so only recompute when items change
export const selectCartItems = createSelector([selectItemsById], (byId) => Object.values(byId));

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((n, i) => n + i.quantity, 0),
);

export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0),
);
\`\`\`

\`\`\`jsx
// Usage in a component
const count = useSelector(selectCartCount);
const subtotal = useSelector(selectCartSubtotal);
const dispatch = useDispatch();
<button onClick={() => dispatch(addItem(product))}>Add to cart ({count})</button>
\`\`\`

**Why it works:** \`createSlice\` generates action creators and action types (\`cart/addItem\`) for you. Immer records the "mutations" and produces a new state object, so React-Redux sees a new reference and re-renders. Keeping totals out of state means they can never get out of sync with the items.

**Edge cases:** integer cents avoid floating-point errors (\`0.1 + 0.2 !== 0.3\`). Never trust the client total at checkout — the server recalculates prices.

**Complexity:** add/remove/update are O(1); totals are O(n) but only recomputed when the cart changes.`,
      followUps: [
        {
          q: 'Why can you either mutate the draft OR return a new value, but not both?',
          a: 'Immer uses one or the other. If you mutate the draft and also return a different object, Immer throws an error because it cannot know which one you meant.',
        },
        {
          q: 'How would you keep the cart after a page reload?',
          a: 'Use redux-persist with a whitelist of `[\'cart\']`, or save `state.cart` to localStorage in a store subscriber / listener middleware (throttled) and load it as preloadedState.',
        },
      ],
    },
    {
      id: 'mutating-state-plain-reducer',
      title: 'The UI does not update after dispatch',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'immutability-immer',
      question: `This **plain** reducer (no Redux Toolkit) is used in an old part of the app. The action is dispatched, Redux DevTools shows the action, but the todo list on screen does not change. Find the bugs and fix them without using Immer.

\`\`\`javascript
const initialState = { todos: [], filter: 'all' };

function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/added':
      state.todos.push(action.payload);
      return state;
    case 'todos/toggled': {
      const todo = state.todos.find((t) => t.id === action.payload);
      todo.done = !todo.done;
      return state;
    }
    case 'filter/changed':
      return { ...state, filter: action.payload };
  }
}
\`\`\``,
      hints: [
        'React-Redux decides whether to re-render by comparing references with `===`. Is `state.todos` a new array after `push`?',
        'Every level you change needs a new copy: the state object, the array, and the changed todo.',
        'What does this reducer return for an action it does not know?',
      ],
      solution: `**Bugs:**
1. \`push\` changes the **same** array and the same state object is returned. \`useSelector\` compares old and new values with \`===\` — same reference means "nothing changed", so no re-render.
2. \`todo.done = !todo.done\` mutates the todo object in place (same problem, and it also breaks time-travel debugging in DevTools).
3. No \`default\` case: for any other action the reducer returns \`undefined\`, which wipes the state (Redux even throws for undefined on init).
4. (Minor) \`toggled\` crashes if the id does not exist.

\`\`\`javascript
const initialState = { todos: [], filter: 'all' };

function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/added':
      // new state object + new array
      return { ...state, todos: [...state.todos, action.payload] };

    case 'todos/toggled':
      return {
        ...state,
        // map returns a new array; only the changed todo gets a new object
        todos: state.todos.map((t) =>
          t.id === action.payload ? { ...t, done: !t.done } : t,
        ),
      };

    case 'filter/changed':
      return { ...state, filter: action.payload };

    default:
      return state; // unknown action: return the SAME state (no re-render)
  }
}
\`\`\`

**Why it works:** each changed level gets a new reference, unchanged items keep their old reference. Components selecting unchanged data do not re-render; components selecting changed data do.

**The modern answer:** in Redux Toolkit's \`createSlice\`, the original "mutating" code would be correct, because Immer turns it into the copy-based code above. RTK also adds a dev-only middleware that **throws** when you mutate state outside a reducer.`,
      followUps: [
        {
          q: 'Why does Redux insist on immutability at all?',
          a: 'Cheap change detection (`===` instead of deep compare), predictable reducers (pure functions), and time-travel debugging (old states stay untouched).',
        },
        {
          q: 'Is a spread copy a deep copy?',
          a: 'No, it is shallow. Nested objects are still shared. That is fine as long as you also copy every nested level you change.',
        },
      ],
    },
    {
      id: 'useselector-new-object-rerender',
      title: 'useSelector causes a re-render on every action',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'react-redux-hooks',
      question: `The React Profiler shows \`<Header>\` re-rendering on **every** dispatched action in the app, even ones that have nothing to do with the user or cart. In development the console also warns: *"Selector unknown returned a different result when called with the same parameters"*.

\`\`\`jsx
function Header() {
  const { user, cartCount } = useSelector((state) => ({
    user: state.auth.user,
    cartCount: state.cart.ids.length,
  }));

  const unread = useSelector((state) =>
    state.notifications.items.filter((n) => !n.read),
  );

  return <nav>{user?.name} · Cart ({cartCount}) · {unread.length} new</nav>;
}
\`\`\`

Why does it happen, and how do you fix it (give at least two ways)?`,
      hints: [
        '`useSelector` runs your selector after every action and compares the result with the previous one using `===`.',
        'Is `{...}` === `{...}`? Is `arr.filter(...)` === `arr.filter(...)`?',
      ],
      solution: `**Why:** after every dispatched action, \`useSelector\` runs the selector again and compares the new result with the old one using **strict equality** (\`===\`). The object literal \`{ user, cartCount }\` and the result of \`.filter()\` are **brand-new references** every time, so they are never \`===\` to the previous ones. React-Redux thinks the data changed and re-renders.

**Fix 1 — select primitives / existing references separately:**

\`\`\`jsx
function Header() {
  const user = useSelector((state) => state.auth.user);             // same reference until it changes
  const cartCount = useSelector((state) => state.cart.ids.length);  // a number: === works
  const unreadCount = useSelector(
    (state) => state.notifications.items.filter((n) => !n.read).length, // return a number, not an array
  );
  return <nav>{user?.name} · Cart ({cartCount}) · {unreadCount} new</nav>;
}
\`\`\`

**Fix 2 — memoize derived data with \`createSelector\`:**

\`\`\`javascript
import { createSelector } from '@reduxjs/toolkit';

const selectNotifications = (state) => state.notifications.items;

// Returns the SAME array reference until notifications.items changes
export const selectUnread = createSelector([selectNotifications], (items) =>
  items.filter((n) => !n.read),
);
\`\`\`

**Fix 3 — \`shallowEqual\` for an object of picked fields:**

\`\`\`jsx
import { shallowEqual, useSelector } from 'react-redux';

const { user, cartCount } = useSelector(
  (state) => ({ user: state.auth.user, cartCount: state.cart.ids.length }),
  shallowEqual, // compares each field with === instead of the whole object
);
\`\`\`

**Why it works:** the selector now returns the same value (or reference) when the relevant data did not change, so the \`===\` check passes and the component skips the re-render.

**Rule of thumb:** a selector should return either a value straight from state or a memoized derived value. Never build new objects/arrays inline unless you also pass an equality function.`,
      followUps: [
        {
          q: 'Does a re-render of Header re-render its children?',
          a: 'Yes, by default all children re-render too, unless they are wrapped in `React.memo` and receive the same props. That is why one bad selector high in the tree is expensive.',
        },
        {
          q: 'What does that development warning check?',
          a: 'React-Redux (v8.1+) runs your selector twice with the same state in dev mode. If the two results are not `===`, the selector is creating new references and will cause extra renders.',
        },
      ],
    },
    {
      id: 'non-serializable-value-warning',
      title: 'Fix "A non-serializable value was detected"',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'redux-toolkit',
      question: `After moving to Redux Toolkit, the console shows:

\`\`\`text
A non-serializable value was detected in an action, in the path: \`payload.createdAt\`.
A non-serializable value was detected in the state, in the path: \`booking.file\`.
\`\`\`

\`\`\`javascript
dispatch(bookingCreated({ id: 'b1', createdAt: new Date() }));
dispatch(fileSelected(event.target.files[0])); // a File object stored in state.booking.file
\`\`\`

1. Why does Redux care? 2. Fix both. 3. A teammate wants to silence the whole check in \`configureStore\`. Is that OK? When is ignoring specific actions correct?`,
      hints: [
        '"Serializable" = can be turned into plain JSON and back without losing anything (strings, numbers, booleans, null, plain objects, arrays).',
        'A `Date` can be stored as an ISO string or a timestamp number.',
        'Big browser objects (File, Blob, class instances, Promises, functions) should live outside Redux — keep only an id or metadata in state.',
      ],
      solution: `**1. Why it matters:** Redux DevTools, time-travel, redux-persist and SSR hydration all need to save and restore state as plain data. A \`Date\`, \`File\`, \`Map\`, Promise or class instance loses its type (or breaks) when serialized, and it can be mutated outside of reducers. RTK's \`configureStore\` adds a **dev-only** middleware that warns about this.

**2. Fixes:**

\`\`\`javascript
// Store dates as ISO strings (or Date.now() numbers)
dispatch(bookingCreated({ id: 'b1', createdAt: new Date().toISOString() }));

// Format when displaying
const label = new Date(booking.createdAt).toLocaleString();
\`\`\`

\`\`\`javascript
// Keep the File OUTSIDE Redux. Store only plain metadata in state.
const fileRegistry = new Map(); // module-level, or a ref in the component that uploads

function onFileChange(event) {
  const file = event.target.files[0];
  const fileId = crypto.randomUUID();
  fileRegistry.set(fileId, file);
  dispatch(fileSelected({ fileId, name: file.name, size: file.size, type: file.type }));
}
// The upload thunk reads fileRegistry.get(fileId), uploads, then dispatches the URL.
\`\`\`

**3. Do not turn the check off globally.** Ignore only known, safe cases. The classic one is **redux-persist**, whose internal actions carry functions:

\`\`\`javascript
import { configureStore } from '@reduxjs/toolkit';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
\`\`\`

**Why it works:** state is plain JSON again, so DevTools, persistence and server-to-client hydration work. The \`File\` still exists, just not inside the store.`,
      followUps: [
        {
          q: 'Does this check run in production?',
          a: 'No. The serializable and immutability check middlewares are only added in development builds, so they do not slow down production.',
        },
        {
          q: 'createAsyncThunk rejected actions contain an Error — why no warning?',
          a: 'createAsyncThunk converts thrown errors into a plain `SerializedError` object (`{ name, message, stack }`) in `action.error`, so it stays serializable.',
        },
      ],
    },
    {
      id: 'redux-vs-context-vs-tanstack',
      title: 'Redux, Context or TanStack Query for this app?',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'redux-vs-context',
      question: `You are starting three projects. For each, choose how to manage state (React Context, Redux Toolkit, RTK Query, TanStack Query, or plain \`useState\`) and justify it:

1. A marketing site with a dark-mode toggle and a logged-in user name in the header.
2. An admin dashboard that is 90% lists and forms backed by a REST API (fetch, cache, refetch, pagination).
3. A trading/booking app where many screens edit the same complex client data (a multi-step itinerary builder with undo), plus live WebSocket price updates and lots of async flows.

Also: what is the most common **wrong** reason people give for adding Redux?`,
      hints: [
        'Separate **server state** (data owned by the backend: cache it, refetch it) from **client state** (UI and data owned by the browser).',
        'Context is a way to pass a value down, not a state manager — every consumer re-renders when the value changes.',
      ],
      solution: `**Idea:** pick the tool by the **kind** of state, not by habit.

1. **Marketing site → Context + useState.** Two values that rarely change. Redux would be pure ceremony. Context re-renders all consumers on change, but theme/user change rarely, so it is fine.
2. **Admin dashboard → TanStack Query (or RTK Query).** Almost all state is **server state**: it needs caching, loading/error flags, refetch on focus, pagination, invalidation after mutations. A data-fetching library gives all that in a few lines; hand-writing it in Redux slices means lots of boilerplate. If the team already uses Redux, **RTK Query** is the natural fit (same store, same DevTools).
3. **Complex trading/booking app → Redux Toolkit** (+ RTK Query for REST, + sagas or listener middleware for WebSockets and long-running flows). Many screens edit the same client data; you need predictable updates, undo (easy with immutable history), DevTools time-travel, middleware for side effects, and fine-grained subscriptions with selectors so a price tick does not re-render the whole app.

**Wrong reason for Redux:** "to avoid prop drilling" or "to store API responses". Prop drilling is solved by composition or Context; API responses are better handled by a server-state cache (TanStack Query / RTK Query).

**Good interview phrasing:** "I use React state first, Context for low-frequency global values, a server-state library for API data, and Redux Toolkit when there is a lot of shared, frequently-updated client state or complex async flows."`,
      followUps: [
        {
          q: 'Why can Context be slow for frequently changing values?',
          a: 'Every component that calls `useContext` re-renders when the provider value changes, with no way to subscribe to only part of it. Redux `useSelector` re-renders only components whose selected slice changed.',
        },
        {
          q: 'What about Zustand?',
          a: 'A small store with selector-based subscriptions and little boilerplate — great for medium apps. Redux Toolkit wins when you want strict patterns, middleware, DevTools time-travel and a large team convention.',
        },
      ],
    },
    {
      id: 'async-thunk-loading-error',
      title: 'Fetch products with createAsyncThunk (loading, error, no duplicates)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'create-async-thunk',
      question: `Write a \`products\` slice that loads \`GET /api/products?category=shoes\` with \`createAsyncThunk\`.

Requirements:
- State: \`items\`, \`status\` (\`'idle' | 'loading' | 'succeeded' | 'failed'\`), \`error\`.
- Show the **server's** error message (the API returns \`{ message }\` with a 4xx/5xx status), not just "Request failed".
- Do not start a second request if one is already loading.
- If the user switches category quickly (shoes → bags), a **late** response for shoes must not overwrite bags.
- A component should load data on mount.`,
      hints: [
        '`fetch` does not throw on 404/500. Check `res.ok` and use `rejectWithValue(...)` to send your own error payload.',
        'The `condition` option can cancel a thunk before it starts: return `false` when already loading.',
        'Every thunk call gets a unique `action.meta.requestId`. Save the latest one in state when pending and ignore results from older ones.',
      ],
      solution: `**Idea:** \`createAsyncThunk\` dispatches \`pending\`, then \`fulfilled\` or \`rejected\` automatically. Handle the three in \`extraReducers\`. Use \`rejectWithValue\` for API errors, \`condition\` to block duplicates, and \`requestId\` to ignore stale responses.

\`\`\`javascript
// features/products/productsSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (category, { rejectWithValue, signal }) => {
    // signal: aborts the HTTP request if promise.abort() is called
    const res = await fetch(\`/api/products?category=\${encodeURIComponent(category)}\`, { signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // becomes action.payload of the rejected action
      return rejectWithValue(data.message ?? \`Request failed (\${res.status})\`);
    }
    return data; // becomes action.payload of the fulfilled action
  },
  {
    // Runs BEFORE the thunk. Returning false = do not dispatch anything.
    condition: (category, { getState }) => {
      const { status, category: current } = getState().products;
      return !(status === 'loading' && current === category);
    },
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null, category: null, currentRequestId: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.category = action.meta.arg;               // the argument passed to the thunk
        state.currentRequestId = action.meta.requestId; // remember the LATEST request
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return; // stale -> ignore
        state.status = 'succeeded';
        state.items = action.payload;
        state.currentRequestId = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return; // stale -> ignore
        state.status = 'failed';
        // payload = our rejectWithValue message; error.message = network / thrown error
        state.error = action.payload ?? action.error.message;
        state.currentRequestId = null;
      });
  },
});

export default productsSlice.reducer;
\`\`\`

\`\`\`jsx
// ProductList.jsx
function ProductList({ category }) {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts(category)); // a 2nd call for the same category is blocked by condition
  }, [dispatch, category]);

  if (status === 'loading') return <Spinner />;
  if (status === 'failed') return <p role="alert">{error}</p>;
  return items.map((p) => <ProductCard key={p.id} product={p} />);
}
\`\`\`

**Why it works:**
- \`rejectWithValue\` lets the server's message reach the reducer as \`action.payload\`.
- \`condition\` stops a duplicate request (React 18 Strict Mode mounts effects twice in dev — this also helps there).
- Only the response whose \`requestId\` matches the latest \`pending\` is applied, so a slow "shoes" response cannot overwrite "bags".

**Edge cases:**
- Do not combine \`condition\` with "abort in the effect cleanup" here. In React Strict Mode (dev) the effect runs, is cleaned up (abort), and runs again — the second call is blocked by \`condition\` because the state still says \`loading\`, and the first was aborted, so nothing loads. Pick one strategy: \`condition\` + \`requestId\` (shown), or abort + no \`condition\`.
- If you need the result in the component, \`await dispatch(fetchProducts(c)).unwrap()\` returns the payload or throws the rejected value.`,
      followUps: [
        {
          q: 'Why not just use RTK Query here?',
          a: 'You probably should for plain fetching: it gives caching, dedupe, loading flags and refetching for free. createAsyncThunk is better for one-off workflows (checkout, upload) or when the result must be merged into an existing slice.',
        },
        {
          q: 'What does unwrap() do?',
          a: 'The promise returned by dispatching a thunk always resolves with the final action. `unwrap()` turns it back into a normal promise: resolves with the payload, or throws the error/rejectWithValue value — handy with try/catch in a submit handler.',
        },
      ],
    },
    {
      id: 'memoized-selector-with-params',
      title: 'Write a memoized "visible todos" selector',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'reselect-selectors',
      question: `A todo app with 5,000 todos is slow. Every keystroke in an unrelated search box re-renders the list.

\`\`\`javascript
// state: { todos: { items: [...] }, ui: { searchText: '' } }
const selectVisibleTodos = (state, filter) =>
  state.todos.items
    .filter((t) => (filter === 'done' ? t.done : filter === 'active' ? !t.done : true))
    .sort((a, b) => b.createdAt - a.createdAt);

function TodoList({ filter }) {
  const todos = useSelector((state) => selectVisibleTodos(state, filter));
  return todos.map((t) => <TodoRow key={t.id} todo={t} />);
}
\`\`\`

1. Explain why typing in the search box re-renders \`TodoList\`.
2. Rewrite the selector with \`createSelector\` so it takes the \`filter\` argument and only recalculates when the todos or the filter change.
3. Two lists on the same screen use different filters. Does memoization still work?`,
      hints: [
        '`.filter()` and `.sort()` return new arrays every time. Compare that with how `useSelector` decides to re-render.',
        'Input selectors can read extra arguments: `(state, filter) => filter`.',
        'Reselect 4 had a cache size of 1; Reselect 5 (Redux Toolkit 2) caches by argument using WeakMaps.',
      ],
      solution: `**1. Why:** every action (including each \`searchText\` keystroke) re-runs the selector. It builds a **new array** each time, so \`useSelector\`'s \`===\` check fails and \`TodoList\` (plus 5,000 rows, if not memoized) re-renders. It also re-filters and re-sorts 5,000 items for nothing.

**2. Memoized selector:**

\`\`\`javascript
import { createSelector } from '@reduxjs/toolkit'; // re-exports reselect

const selectTodoItems = (state) => state.todos.items;
const selectFilterArg = (state, filter) => filter; // second argument passed to the selector

export const selectVisibleTodos = createSelector(
  [selectTodoItems, selectFilterArg],
  // "result function": runs ONLY when items or filter change (by reference / value)
  (items, filter) =>
    items
      .filter((t) => (filter === 'done' ? t.done : filter === 'active' ? !t.done : true))
      .sort((a, b) => b.createdAt - a.createdAt), // filter() made a copy, so sort() is safe
);

function TodoList({ filter }) {
  const todos = useSelector((state) => selectVisibleTodos(state, filter));
  return todos.map((t) => <TodoRow key={t.id} todo={t} />);
}

const TodoRow = React.memo(function TodoRow({ todo }) {
  return <li>{todo.title}</li>;
});
\`\`\`

**Why it works:** typing changes \`state.ui\`, not \`state.todos.items\`. The input selectors return the same \`items\` reference and the same \`filter\`, so \`createSelector\` returns the **cached array** — same reference, \`===\` passes, no re-render. \`React.memo\` on rows means toggling one todo re-renders only that row.

**3. Two lists with different filters:**
- **Reselect 5 / RTK 2:** the default \`weakMapMemoize\` keeps a cache entry per argument combination, so \`'done'\` and \`'active'\` both stay cached.
- **Reselect 4 / RTK 1:** cache size was **1**. Two components with different filters keep evicting each other, so it recalculates every time. Fix: create one selector **per component instance**:

\`\`\`javascript
// Factory: each component gets its own memoized selector
const makeSelectVisibleTodos = () => createSelector([selectTodoItems, selectFilterArg], (items, filter) => /* same */ items);

function TodoList({ filter }) {
  const selectVisible = useMemo(makeSelectVisibleTodos, []);
  const todos = useSelector((state) => selectVisible(state, filter));
  // ...
}
\`\`\`

**Edge cases:** a common mistake is an input selector that itself creates a new value, e.g. \`(state) => state.todos.items.map(...)\` — then memoization never hits. Input selectors should just pick values.`,
      followUps: [
        {
          q: 'Why never sort state.todos.items directly in a selector?',
          a: '`sort()` mutates the array in place — that would mutate Redux state (and RTK would throw in dev). Copy first (`filter`, `slice()` or `toSorted()`).',
        },
        {
          q: 'How can you check that a selector is memoized?',
          a: 'Reselect selectors have `.recomputations()`. Call the selector twice with the same state and check it is still 1. Reselect 5 also warns in dev if the result function returns its input unchanged (identity function check).',
        },
      ],
    },
    {
      id: 'normalize-with-entity-adapter',
      title: 'Normalize nested API data with createEntityAdapter',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'normalizing-state',
      question: `The API returns posts with the author and comments **nested** inside:

\`\`\`json
[
  { "id": "p1", "title": "Hello", "createdAt": "2026-01-02",
    "author": { "id": "u1", "name": "Asha" },
    "comments": [{ "id": "c1", "text": "Nice", "author": { "id": "u2", "name": "Ravi" } }] },
  { "id": "p2", "title": "Redux", "createdAt": "2026-01-03",
    "author": { "id": "u2", "name": "Ravi" },
    "comments": [{ "id": "c2", "text": "Thanks", "author": { "id": "u1", "name": "Asha" } }] }
]
\`\`\`

Storing this as-is causes bugs: when Ravi renames himself, his name must be updated in many places. **Normalize** it into \`posts\`, \`users\` and \`comments\` slices using \`createEntityAdapter\`, sorted newest post first. Then write a selector that returns one post with its author name and comments for the UI.`,
      hints: [
        'Normalized = each entity stored once, in a lookup table by id. Other entities refer to it by id (`authorId`).',
        '`createEntityAdapter` gives you `{ ids: [], entities: {} }` state plus `setAll`, `upsertMany`, `updateOne` and selectors.',
        'Several slices can respond to the same `fetchPosts.fulfilled` action in their `extraReducers`.',
      ],
      solution: `**Idea:** flatten the response once (in the thunk), then let each slice store its own entity type with an adapter. Join them back together in a memoized selector.

\`\`\`javascript
// features/posts/normalize.js — plain function, easy to unit test
export function normalizePosts(apiPosts) {
  const users = {};
  const comments = [];
  const posts = apiPosts.map(({ author, comments: postComments, ...post }) => {
    users[author.id] = author;
    for (const { author: commenter, ...c } of postComments) {
      users[commenter.id] = commenter;
      comments.push({ ...c, postId: post.id, authorId: commenter.id });
    }
    return { ...post, authorId: author.id, commentIds: postComments.map((c) => c.id) };
  });
  return { posts, users: Object.values(users), comments };
}
\`\`\`

\`\`\`javascript
// features/posts/postsSlice.js
import { createAsyncThunk, createEntityAdapter, createSlice, createSelector } from '@reduxjs/toolkit';
import { normalizePosts } from './normalize';

export const fetchPosts = createAsyncThunk('posts/fetch', async () => {
  const res = await fetch('/api/posts');
  return normalizePosts(await res.json()); // payload = { posts, users, comments }
});

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt), // keeps ids sorted, newest first
});
const usersAdapter = createEntityAdapter();
const commentsAdapter = createEntityAdapter();

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({ status: 'idle' }), // { ids: [], entities: {}, status }
  reducers: {},
  extraReducers: (b) =>
    b.addCase(fetchPosts.fulfilled, (state, action) => {
      state.status = 'succeeded';
      postsAdapter.setAll(state, action.payload.posts);
    }),
});

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState(),
  reducers: {
    userRenamed: (state, action) =>
      usersAdapter.updateOne(state, { id: action.payload.id, changes: { name: action.payload.name } }),
  },
  extraReducers: (b) =>
    b.addCase(fetchPosts.fulfilled, (state, action) => {
      usersAdapter.upsertMany(state, action.payload.users); // merge, do not wipe other users
    }),
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState: commentsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (b) =>
    b.addCase(fetchPosts.fulfilled, (state, action) => {
      commentsAdapter.upsertMany(state, action.payload.comments);
    }),
});

// ---- Selectors ----
export const { selectAll: selectAllPosts, selectById: selectPostById } =
  postsAdapter.getSelectors((state) => state.posts);
const { selectEntities: selectUserEntities } = usersAdapter.getSelectors((state) => state.users);
const { selectEntities: selectCommentEntities } = commentsAdapter.getSelectors((state) => state.comments);

// Join for the UI. Memoized per postId (Reselect 5 caches per argument).
export const selectPostView = createSelector(
  [selectPostById, selectUserEntities, selectCommentEntities],
  (post, users, comments) =>
    post && {
      ...post,
      authorName: users[post.authorId]?.name,
      comments: post.commentIds.map((id) => ({
        ...comments[id],
        authorName: users[comments[id]?.authorId]?.name,
      })),
    },
);
// usage: useSelector((state) => selectPostView(state, postId))
\`\`\`

**Why it works:** each user exists **once** in \`users.entities\`. \`userRenamed\` updates one place and every post and comment shows the new name. Lookups by id are O(1) instead of searching arrays, and updating one comment does not create new references for unrelated posts, so fewer components re-render.

**Edge cases:** use \`upsertMany\` (merge) for shared entities like users, and \`setAll\` only when the response is the complete list. Libraries like \`normalizr\` can do the flattening for deeply nested data.`,
      followUps: [
        {
          q: 'What if the id field is called _id (MongoDB)?',
          a: 'Pass `selectId: (entity) => entity._id` to `createEntityAdapter`, or map `_id` to `id` in the normalize step.',
        },
        {
          q: 'Does RTK Query normalize data like this?',
          a: 'No. RTK Query caches each endpoint + argument result as-is (document cache). If you need shared normalized entities, use `transformResponse` with an entity adapter, or keep normalization in slices.',
        },
      ],
    },
    {
      id: 'rtk-query-cache-tags',
      title: 'RTK Query: list refreshes automatically after add, edit and delete',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'rtk-query',
      question: `Build an RTK Query API slice for tasks:

- \`getTasks\` → \`GET /tasks\` (list)
- \`getTask(id)\` → \`GET /tasks/:id\`
- \`addTask(body)\` → \`POST /tasks\`
- \`updateTask({ id, ...patch })\` → \`PATCH /tasks/:id\`
- \`deleteTask(id)\` → \`DELETE /tasks/:id\`

After any mutation, the right queries must **refetch automatically** — but editing task 5 should not refetch the detail page of task 9. Also send a Bearer token from \`state.auth.token\` on every request. Show it used in a component.`,
      hints: [
        'Queries `providesTags`, mutations `invalidatesTags`. When a tag is invalidated, every query that provided it refetches.',
        'Use a special `{ type: \'Task\', id: \'LIST\' }` tag for "the list as a whole" and `{ type: \'Task\', id }` for each item.',
        '`fetchBaseQuery` has a `prepareHeaders(headers, { getState })` option.',
      ],
      solution: `**Idea:** RTK Query caches every query result. Tags are labels that connect queries and mutations: queries say "I contain Task 5 and the Task LIST", mutations say "Task 5 changed" and RTK Query refetches only the affected queries.

\`\`\`javascript
// services/tasksApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('Authorization', \`Bearer \${token}\`);
      return headers;
    },
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => '/tasks',
      // the list provides one tag per task + a LIST tag
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Task', id })),
        { type: 'Task', id: 'LIST' },
      ],
    }),
    getTask: builder.query({
      query: (id) => \`/tasks/\${id}\`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    addTask: builder.mutation({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }], // a new item -> only the list changes
    }),
    updateTask: builder.mutation({
      query: ({ id, ...patch }) => ({ url: \`/tasks/\${id}\`, method: 'PATCH', body: patch }),
      // refetches getTask(id) AND the list (the list provided this id's tag too)
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({ url: \`/tasks/\${id}\`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
\`\`\`

\`\`\`javascript
// store.js — the API needs its reducer AND its middleware (cache lifetimes, refetching)
export const store = configureStore({
  reducer: { auth: authReducer, [tasksApi.reducerPath]: tasksApi.reducer },
  middleware: (gDM) => gDM().concat(tasksApi.middleware),
});
\`\`\`

\`\`\`jsx
function TaskList() {
  const { data: tasks = [], isLoading, isError, isFetching } = useGetTasksQuery();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  if (isLoading) return <Spinner />;           // first load only
  if (isError) return <p role="alert">Could not load tasks</p>;

  return (
    <ul style={{ opacity: isFetching ? 0.6 : 1 }}> {/* refetch in the background */}
      {tasks.map((t) => (
        <li key={t.id}>
          <input
            type="checkbox"
            checked={t.done}
            onChange={() => updateTask({ id: t.id, done: !t.done })}
          />
          {t.title}
          <button disabled={isDeleting} onClick={() => deleteTask(t.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

**Why it works:** after \`updateTask({ id: 5 })\`, the tag \`Task:5\` is invalidated. \`getTasks\` (which provided \`Task:5\`) and \`getTask(5)\` refetch; \`getTask(9)\` does not. Adding a task invalidates only \`Task:LIST\`.

**Edge cases:** if a query failed, \`result\` is \`undefined\` — the \`result = []\` default keeps \`providesTags\` from crashing. Many components using \`useGetTasksQuery()\` share **one** request and one cache entry (deduplication).`,
      followUps: [
        {
          q: 'isLoading vs isFetching?',
          a: '`isLoading` is true only for the first load when there is no data yet. `isFetching` is true for any request in flight, including background refetches — use it for a subtle indicator while showing old data.',
        },
        {
          q: 'How long does RTK Query keep unused data?',
          a: '60 seconds by default after the last component using it unmounts (`keepUnusedDataFor`). You can also refetch on focus/reconnect with `setupListeners(store.dispatch)` and the `refetchOnFocus` option.',
        },
      ],
    },
    {
      id: 'redux-persist-exclude-sensitive',
      title: 'Persist the cart and settings, but never the auth token',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'redux-persist',
      question: `The store has these slices: \`auth\` (\`{ user, accessToken }\`), \`cart\`, \`settings\` (theme, language), \`checkout\` (card form in progress), and an RTK Query \`api\` cache.

Set up **redux-persist** so that:
- \`cart\` and \`settings\` survive a reload,
- from \`auth\` only \`user\` (name, avatar) is kept — the **access token never goes to localStorage**,
- \`checkout\` and the API cache are never persisted,
- the app does not flash "logged out" / empty cart before data is loaded,
- logging out clears what was persisted,
- you can change the stored shape later without crashing old users.

Explain why storing the token in localStorage is a risk.`,
      hints: [
        'Use `whitelist` in the root config, and a **nested** persist config for the `auth` slice with its own whitelist.',
        'Wrap the app in `<PersistGate>` so it waits for REHYDRATE.',
        'redux-persist dispatches actions with functions inside — tell RTK\'s serializable check to ignore them.',
      ],
      solution: `**Idea:** persist with an **allow-list** (whitelist), not a deny-list, so new slices are private by default. Use a nested config to keep only safe fields of \`auth\`.

\`\`\`javascript
// store.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore, persistReducer, createMigrate,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage on the web

// Only "user" from auth. accessToken stays in memory only.
const authPersistConfig = { key: 'auth', storage, whitelist: ['user'] };

const migrations = {
  // v2 renamed settings.lang -> settings.language
  2: (state) => ({
    ...state,
    settings: { ...state.settings, language: state.settings?.lang ?? 'en' },
  }),
};

const rootPersistConfig = {
  key: 'root',
  version: 2,
  storage,
  whitelist: ['cart', 'settings'], // auth is handled by its own nested config
  migrate: createMigrate(migrations),
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer), // nested persist
  cart: cartReducer,
  settings: settingsReducer,
  checkout: checkoutReducer,                 // not in whitelist -> never saved
  [api.reducerPath]: api.reducer,            // not in whitelist -> never saved
});

export const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: (gDM) =>
    gDM({
      // persist actions carry functions; ignore ONLY these actions
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);
\`\`\`

\`\`\`jsx
// main.jsx — wait for saved state before rendering the app
import { PersistGate } from 'redux-persist/integration/react';

<Provider store={store}>
  <PersistGate loading={<SplashScreen />} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
\`\`\`

\`\`\`javascript
// logout thunk
export const logout = () => async (dispatch) => {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' }); // clear httpOnly refresh cookie
  await persistor.purge();                 // wipe persisted storage
  dispatch({ type: 'auth/loggedOut' });    // slices reset themselves on this action
  dispatch(api.util.resetApiState());      // drop cached private API data
};
\`\`\`

**Why it works:** only whitelisted keys are written. The nested config means \`auth.accessToken\` is never saved. \`PersistGate\` delays rendering until \`REHYDRATE\`, so there is no flash. \`version\` + \`migrate\` upgrade old saved data instead of crashing.

**Why not the token in localStorage:** any JavaScript on the page can read localStorage. One XSS bug (or a compromised npm package / third-party script) can steal the token and use it from anywhere. Safer pattern: short-lived access token **in memory**, and a long-lived refresh token in an **httpOnly, secure, sameSite** cookie that JS cannot read; on reload, call \`/api/refresh\` to get a new access token.

**Edge cases:** do not persist things that become wrong over time (loading flags, prices). For carts, re-validate prices and stock with the server on load.`,
      followUps: [
        {
          q: 'How does this work with Next.js SSR?',
          a: 'localStorage does not exist on the server. Create the persisted store only on the client (or use a storage that no-ops on the server), and expect the first server render to have no persisted data.',
        },
        {
          q: 'Why is a whitelist safer than a blacklist?',
          a: 'With a blacklist, any new slice a teammate adds is persisted automatically — including sensitive ones. With a whitelist, nothing is persisted unless someone chooses it.',
        },
      ],
    },
    {
      id: 'middleware-order-output',
      title: 'What does this middleware chain print?',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'redux-middleware',
      question: `What is printed? Then: what changes if the middleware order is \`applyMiddleware(thunk, logger)\`?

\`\`\`javascript
import { createStore, applyMiddleware } from 'redux';

const reducer = (state = { count: 0 }, action) =>
  action.type === 'inc' ? { count: state.count + 1 } : state;

const logger = (store) => (next) => (action) => {
  console.log('logger before:', action.type);
  const result = next(action);
  console.log('logger after:', store.getState().count);
  return result;
};

const thunk = (store) => (next) => (action) =>
  typeof action === 'function' ? action(store.dispatch, store.getState) : next(action);

const store = createStore(reducer, applyMiddleware(logger, thunk));

store.dispatch((dispatch) => {
  console.log('thunk start');
  dispatch({ type: 'inc' });
  console.log('thunk end');
});
\`\`\``,
      hints: [
        'Middleware runs in the order given: `logger` sees every dispatched thing first, even a function.',
        '`next(action)` passes to the NEXT middleware. `store.dispatch(action)` (used inside the thunk) starts again from the FIRST middleware.',
        'What is `.type` of a function?',
      ],
      solution: `**Output with \`applyMiddleware(logger, thunk)\`:**

\`\`\`text
logger before: undefined
thunk start
logger before: inc
logger after: 1
thunk end
logger after: 1
\`\`\`

**Step by step:**
1. We dispatch a **function**. \`logger\` is first, so it logs \`action.type\` of a function → \`undefined\`.
2. \`logger\` calls \`next(fn)\` → \`thunk\` sees a function and calls it: \`thunk start\`.
3. Inside, \`dispatch({ type: 'inc' })\` is the **full** \`store.dispatch\`, so the action starts from the top of the chain again: \`logger before: inc\` → thunk passes it on with \`next\` → reducer runs (count = 1) → \`logger after: 1\`.
4. \`thunk end\`.
5. Back in the outer \`logger\` call: \`next(fn)\` returned, so it prints \`logger after: 1\`.

**Output with \`applyMiddleware(thunk, logger)\`:**

\`\`\`text
thunk start
logger before: inc
logger after: 1
thunk end
\`\`\`

Now \`thunk\` handles the function first and never passes it on, so the logger only sees real (plain object) actions.

**Takeaway:** middleware is an onion: code before \`next()\` runs on the way in, code after \`next()\` runs on the way out. Put middleware that **transforms** special things (thunks, promises) **before** loggers. That is why Redux Toolkit's \`getDefaultMiddleware()\` puts thunk first and you \`.concat()\` loggers after.`,
      followUps: [
        {
          q: 'Write the shape of a middleware from memory and explain each layer.',
          a: '`store => next => action => {...}`. `store` gives `getState` and `dispatch` (setup once), `next` is the next middleware or the real reducer dispatch (setup once), and the inner function runs for every action.',
        },
        {
          q: 'What does dispatch return for a thunk?',
          a: 'Whatever the thunk function returns — often a promise. That is why `await dispatch(fetchSomething())` works.',
        },
      ],
    },
    {
      id: 'saga-search-debounce-takelatest',
      title: 'Search-as-you-type saga: debounce and cancel stale requests',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'saga-debounce-throttle',
      question: `A search box dispatches \`search/changed\` with the text on every keystroke. Write the saga so that:

1. It waits until the user stops typing for **300 ms** before calling the API.
2. If a new keystroke arrives while a request is already running, the old request is **cancelled** — its result must never show up.
3. Queries shorter than 2 characters clear the results without calling the API.
4. Errors dispatch \`search/failed\`.
5. The cancelled HTTP request is actually aborted (not just ignored).

\`\`\`javascript
// available
api.search(query, signal) // returns a Promise of results, supports AbortController signal
searchSucceeded(results), searchFailed(message), searchCleared()
\`\`\``,
      hints: [
        '`takeLatest` cancels the previous worker task when a new matching action arrives.',
        'Put `yield delay(300)` at the start of the worker. If another keystroke comes during the delay, takeLatest cancels this worker before it reaches the API call.',
        'In a `finally` block, `yield cancelled()` tells you if the task was cancelled. Use it to call `controller.abort()`.',
      ],
      solution: `**Idea:** \`takeLatest\` + \`delay\` = debounce **and** cancellation in one. Every keystroke restarts the worker; only the last one survives the 300 ms wait, and a newer keystroke also kills an in-flight request.

\`\`\`javascript
// features/search/searchSaga.js
import { call, cancelled, delay, put, takeLatest } from 'redux-saga/effects';
import { api } from '../../api';
import { searchChanged, searchSucceeded, searchFailed, searchCleared } from './searchSlice';

function* handleSearch(action) {
  const query = action.payload.trim();

  if (query.length < 2) {
    yield put(searchCleared());
    return;
  }

  yield delay(300); // debounce: a new keystroke cancels us while we wait here

  const controller = new AbortController();
  try {
    const results = yield call(api.search, query, controller.signal);
    yield put(searchSucceeded(results));
  } catch (error) {
    yield put(searchFailed(error.message));
  } finally {
    if (yield cancelled()) {
      controller.abort(); // a newer search started: stop the HTTP request too
    }
  }
}

export function* watchSearch() {
  // starts handleSearch for each action, cancelling the previous one if still running
  yield takeLatest(searchChanged.type, handleSearch);
}
\`\`\`

**Why it works:**
- Typing "react" fires 5 actions. Each one cancels the previous \`handleSearch\` while it sits in \`delay(300)\`. Only the "react" worker reaches \`call(api.search)\`.
- If the user types again while "react" is loading, takeLatest cancels it. A cancelled saga jumps to \`finally\`, \`cancelled()\` is true, and we abort the fetch. The stale result is never \`put\`.
- Cancellation is **not** an error, so the \`catch\` block does not run — no false "search failed".

**Why not the \`debounce\` helper?** \`yield debounce(300, searchChanged.type, worker)\` waits for silence, but it does **not** cancel a worker that is already running. A slow response for "rea" could arrive after "react" and overwrite it. \`takeLatest + delay\` solves both problems.`,
      followUps: [
        {
          q: 'How would you do this without sagas?',
          a: 'RTK Query with a debounced input value (`useDebounce` hook) — it drops stale results automatically. Or the listener middleware: `listenerApi.cancelActiveListeners()` then `await listenerApi.delay(300)`.',
        },
        {
          q: 'How do you test the debounce?',
          a: 'Step through the generator: first `next()` returns `delay(300)`. Calling `gen.return()` simulates cancellation and you can check that the finally block runs. Or use redux-saga-test-plan with `.provide()` to mock `call`.',
        },
      ],
    },
    {
      id: 'saga-retry-with-backoff',
      title: 'Retry a failed API call with exponential backoff',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'saga-error-handling',
      question: `\`api.fetchInvoices()\` sometimes fails with \`503 Service Unavailable\` or a network error. Write a reusable saga helper that:

- retries up to **3** times,
- waits **500 ms, 1 s, 2 s** (exponential backoff) plus a small random **jitter** between tries,
- retries only **temporary** errors (network errors, 5xx, 429) — a \`400\` or \`401\` must fail immediately,
- re-throws the last error so the caller can dispatch a failure action.

Errors from the API have an \`error.status\` number; network errors have no status. Use it in \`loadInvoicesSaga\`.`,
      hints: [
        'A `for` loop with `try/catch` inside a generator works just like normal code; `yield delay(ms)` pauses.',
        'Wait time: `baseMs * 2 ** attempt`. Add `Math.random() * baseMs` as jitter.',
        'Call the helper with `yield call(helper, ...)` or delegate with `yield* helper(...)`.',
      ],
      solution: `**Idea:** loop; try the call; on a retryable error wait longer each time; give up after the limit by re-throwing.

\`\`\`javascript
import { call, delay, put, takeLatest } from 'redux-saga/effects';

const isRetryable = (err) =>
  err.status === undefined ||   // network error / timeout
  err.status >= 500 ||          // server is having trouble
  err.status === 429;           // rate limited, try again later

export function* callWithRetry(fn, args = [], { retries = 3, baseMs = 500 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return yield call(fn, ...args); // success: return the result to the caller
    } catch (err) {
      if (!isRetryable(err) || attempt >= retries) throw err; // give up
      // 500, 1000, 2000 ms + up to baseMs of random jitter
      const wait = baseMs * 2 ** attempt + Math.floor(Math.random() * baseMs);
      yield delay(wait);
    }
  }
}

function* loadInvoicesSaga() {
  try {
    const invoices = yield call(callWithRetry, api.fetchInvoices, [], { retries: 3 });
    yield put(invoicesLoaded(invoices));
  } catch (err) {
    yield put(invoicesFailed(err.message)); // after all retries, or a non-retryable error
  }
}

export function* watchInvoices() {
  yield takeLatest(invoicesRequested.type, loadInvoicesSaga);
}
\`\`\`

**Trace** (with jitter set to 0): \`503\` → wait 500 → \`503\` → wait 1000 → success → \`invoicesLoaded\`. With a \`400\`: no retry, \`invoicesFailed\` immediately.

**Why it works:** generators keep the loop state between \`yield\`s, so the retry logic reads like synchronous code. Exponential backoff gives a struggling server time to recover; **jitter** spreads out retries so thousands of clients do not all hit the server at the same moment (the "thundering herd").

**Built-in option:** \`yield retry(3, 1000, api.fetchInvoices)\` from \`redux-saga/effects\` retries with a **fixed** delay and retries **every** error, so the custom helper is better when you need backoff and error filtering.

**Edge cases:** only retry **idempotent** requests (GET, or POST with an idempotency key) — retrying a payment POST could charge twice. Because the worker runs under \`takeLatest\`, a new request cancels the retry loop, even during a \`delay\`.`,
      followUps: [
        {
          q: 'How would you honour a Retry-After header on 429?',
          a: 'Attach `retryAfterMs` to the error when the response is 429, and in the catch use `yield delay(err.retryAfterMs ?? computedWait)`.',
        },
        {
          q: 'yield call(helper) vs yield* helper()?',
          a: 'Both run the helper. `yield call(gen)` shows up as a separate effect (easy to mock in tests). `yield*` inlines the generator, so tests see its inner effects directly.',
        },
      ],
    },
    {
      id: 'saga-step-by-step-test',
      title: 'Write step-by-step unit tests for a checkout saga',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'testing-sagas',
      question: `Write Jest tests for this saga **without** running a real store or API. Cover: the happy path, the empty-cart path, and the API failure path.

\`\`\`javascript
import { call, put, select } from 'redux-saga/effects';

export function* placeOrderSaga(action) {
  try {
    const cart = yield select(selectCart);
    if (cart.items.length === 0) {
      yield put(orderFailed('Cart is empty'));
      return;
    }
    const order = yield call(api.createOrder, cart, action.payload.address);
    yield put(orderPlaced(order));
    yield put(cartCleared());
  } catch (error) {
    yield put(orderFailed(error.message));
  }
}
\`\`\`

Then show the same happy path with \`redux-saga-test-plan\` and explain when you prefer each style.`,
      hints: [
        'Effects like `call(fn, a)` are plain objects. Calling the generator gives an iterator; `gen.next(value)` returns the next effect and sends `value` back as the result of the previous `yield`.',
        'Use `gen.throw(error)` to simulate the API call failing.',
        'Check `gen.next().done === true` at the end.',
      ],
      solution: `**Idea:** a saga only **describes** what to do by yielding effect objects. In a test you play the role of the saga middleware: compare each yielded effect, then feed back a fake result.

\`\`\`javascript
// placeOrderSaga.test.js
import { call, put, select } from 'redux-saga/effects';
import { placeOrderSaga } from './placeOrderSaga';

const action = { type: 'orders/placeRequested', payload: { address: 'Pune' } };
const cart = { items: [{ id: 'p1', quantity: 2 }] };
const order = { id: 'o1' };

describe('placeOrderSaga', () => {
  it('places the order and clears the cart', () => {
    const gen = placeOrderSaga(action);

    expect(gen.next().value).toEqual(select(selectCart));
    // feed the fake cart back as the result of select()
    expect(gen.next(cart).value).toEqual(call(api.createOrder, cart, 'Pune'));
    // feed the fake order back as the result of call()
    expect(gen.next(order).value).toEqual(put(orderPlaced(order)));
    expect(gen.next().value).toEqual(put(cartCleared()));
    expect(gen.next().done).toBe(true);
  });

  it('fails fast when the cart is empty (no API call)', () => {
    const gen = placeOrderSaga(action);
    gen.next(); // select
    expect(gen.next({ items: [] }).value).toEqual(put(orderFailed('Cart is empty')));
    expect(gen.next().done).toBe(true);
  });

  it('dispatches orderFailed when the API throws', () => {
    const gen = placeOrderSaga(action);
    gen.next();       // select
    gen.next(cart);   // call(api.createOrder)
    // simulate the promise rejecting: jump into the catch block
    expect(gen.throw(new Error('Payment declined')).value).toEqual(
      put(orderFailed('Payment declined')),
    );
    expect(gen.next().done).toBe(true);
  });
});
\`\`\`

**Integration style with redux-saga-test-plan:**

\`\`\`javascript
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

it('places the order (integration style)', () =>
  expectSaga(placeOrderSaga, action)
    .provide([
      [matchers.select(selectCart), cart],                 // fake select result
      [matchers.call.fn(api.createOrder), order],          // fake API result
    ])
    .put(orderPlaced(order))
    .put(cartCleared())
    .run());
\`\`\`

**Why it works:** \`call(api.createOrder, cart, 'Pune')\` just returns \`{ type: 'CALL', payload: { fn, args } }\`, so \`toEqual\` can compare it — no network, no mocks of fetch. That is the big testability win of sagas over thunks.

**When to use which:**
- **Step-by-step:** precise, no extra library, but brittle — swapping the order of two independent effects breaks the test even though behaviour is the same.
- **expectSaga:** tests the **outcome** (these actions were put) and ignores order and internal steps. Better for refactoring; preferred for most real tests.`,
      followUps: [
        {
          q: 'How do you test the finally/cancel branch?',
          a: 'Call `gen.return()` after the step where cancellation could happen. With real redux-saga you would also mock `cancelled()` to return true: `gen.next(true)` after it yields `cancelled()`.',
        },
        {
          q: 'How do you test a saga together with its reducer?',
          a: '`expectSaga(saga).withReducer(rootReducer).hasFinalState({...}).run()` checks the final state after all puts.',
        },
      ],
    },
    {
      id: 'rtk-query-optimistic-update',
      title: 'Optimistic update with rollback in RTK Query',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'rtk-query',
      question: `In the task list (cached by a \`getTasks\` query with no arguments), ticking a checkbox calls \`PATCH /tasks/:id\`. The server takes ~800 ms, so the checkbox feels laggy.

Make the checkbox update **instantly** (optimistic update). If the request fails, put the checkbox back and show a toast. After success, make sure the cache matches the server.

\`\`\`javascript
toggleTask: builder.mutation({
  query: ({ id, done }) => ({ url: \`/tasks/\${id}\`, method: 'PATCH', body: { done } }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }],
}),
\`\`\``,
      hints: [
        'Mutations have an `onQueryStarted(arg, { dispatch, queryFulfilled })` lifecycle that runs as soon as the mutation starts.',
        '`api.util.updateQueryData(endpointName, queryArg, draft => {...})` edits a cached query result with Immer and returns an object with `undo()`.',
        'Await `queryFulfilled` in try/catch: on error call `patch.undo()`.',
      ],
      solution: `**Idea:** change the cached list **before** the request finishes, keep the "undo" handle, and roll back if the server says no.

\`\`\`javascript
// inside createApi({ endpoints: (builder) => ({ ... }) })
toggleTask: builder.mutation({
  query: ({ id, done }) => ({ url: \`/tasks/\${id}\`, method: 'PATCH', body: { done } }),

  async onQueryStarted({ id, done }, { dispatch, queryFulfilled }) {
    // 1. Optimistically edit the cached getTasks result (arg is undefined: getTasks takes none)
    const patch = dispatch(
      tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
        const task = draft.find((t) => t.id === id);
        if (task) task.done = done; // Immer draft: mutation is fine
      }),
    );

    try {
      // 2. Wait for the server
      const { data: saved } = await queryFulfilled;
      // 3. Sync with what the server actually saved (e.g. updatedAt, completedBy)
      dispatch(
        tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
          const index = draft.findIndex((t) => t.id === id);
          if (index !== -1) draft[index] = saved;
        }),
      );
    } catch {
      // 4. Failed: roll back exactly our change and tell the user
      patch.undo();
      dispatch(showToast('Could not update the task. Please try again.'));
    }
  },
  // No invalidatesTags: we already updated the cache, so a refetch would only cause a flicker.
}),
\`\`\`

\`\`\`jsx
const [toggleTask] = useToggleTaskMutation();
<input type="checkbox" checked={task.done} onChange={() => toggleTask({ id: task.id, done: !task.done })} />
\`\`\`

**Why it works:** \`updateQueryData\` produces Immer patches. \`patch.undo()\` applies the **inverse patches**, so only this change is reverted — other updates that happened meanwhile are kept. Every component using \`useGetTasksQuery()\` re-renders instantly from the cache.

**Edge cases:**
- **Two quick toggles** on the same task: requests can finish out of order. Sending the **target value** (\`done: true/false\`) instead of "toggle" keeps the final state correct; for full safety, keep invalidation on error only, or refetch after the last pending mutation settles.
- If the same task also lives in other cached queries (\`getTask(id)\`, a filtered list), patch those too, or fall back to \`invalidatesTags\` for them.
- **Pessimistic update** (the alternative): wait for the server, then \`updateQueryData\` with the response — no rollback needed, but slower UI. Use it for money and anything users must not see "fake" success for.`,
      followUps: [
        {
          q: 'When should you NOT use optimistic updates?',
          a: 'When failure is common or costly to show wrongly: payments, bookings with limited stock, anything with server-side validation that often rejects. Show a pending state instead.',
        },
        {
          q: 'How do you do optimistic updates without RTK Query?',
          a: 'Dispatch the change immediately, keep the previous value, call the API in a thunk, and on failure dispatch a rollback action with the previous value. RTK Query just automates the patch/undo bookkeeping.',
        },
      ],
    },
    {
      id: 'saga-cancel-polling-on-logout',
      title: 'Poll orders every 5 seconds and stop on logout',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'saga-race-async-flows',
      question: `After login, the dashboard must poll \`api.fetchOrders()\` every **5 seconds**. Requirements:

1. Polling starts on \`polling/start\` and stops on \`polling/stop\` **or** \`auth/logout\`.
2. When it stops, an in-flight request must be cancelled, and **no** \`orders/updated\` action may arrive after logout (it would show the old user's data).
3. One failed request must not kill the polling loop.
4. A second \`polling/start\` while already polling must not start a second loop.
5. Bonus: pause while the browser tab is hidden.

Write the sagas.`,
      hints: [
        'A worker with `while (true) { call; put; delay(5000) }` is the poll loop. Put try/catch around the API call, inside the loop.',
        '`race({ poll: call(pollWorker), stop: take([...]) })` — when `stop` wins, redux-saga automatically cancels the losing effect (the poll task).',
        'A watcher shaped `while (true) { yield take(start); yield race(...) }` cannot start a second loop: while the race runs, it is not listening for `start`.',
      ],
      solution: `**Idea:** a loop task for polling, and a watcher that **races** it against the stop actions. The loser of a race is cancelled automatically, including any \`call\` or \`delay\` it is waiting on.

\`\`\`javascript
import { call, delay, put, race, take, cancelled } from 'redux-saga/effects';

function* pollOrders() {
  try {
    while (true) {
      try {
        const orders = yield call(api.fetchOrders);
        yield put(ordersUpdated(orders));
      } catch (err) {
        // one failure does not stop the loop
        yield put(ordersPollFailed(err.message));
      }
      yield delay(5000);
    }
  } finally {
    if (yield cancelled()) {
      yield put(pollingStopped()); // e.g. hide the "live" badge
    }
  }
}

export function* watchPolling() {
  while (true) {
    yield take('polling/start');
    // While this race runs, we are NOT listening for polling/start -> no duplicate loops
    yield race({
      poll: call(pollOrders),
      stop: take(['polling/stop', 'auth/logout']),
    });
    // stop won: pollOrders was cancelled (pending call/delay included)
  }
}
\`\`\`

**Bonus: pause while the tab is hidden** — turn the browser event into actions with an \`eventChannel\` and stop/start with the same race:

\`\`\`javascript
import { eventChannel } from 'redux-saga';
import { fork } from 'redux-saga/effects';

function visibilityChannel() {
  return eventChannel((emit) => {
    const handler = () => emit(document.hidden ? 'hidden' : 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  });
}

function* watchVisibility() {
  const channel = yield call(visibilityChannel);
  while (true) {
    const state = yield take(channel);
    yield put({ type: state === 'hidden' ? 'polling/stop' : 'polling/start' });
  }
}
// rootSaga: yield all([fork(watchPolling), fork(watchVisibility)])
\`\`\`

(In a real app, only dispatch \`polling/start\` on "visible" if the user is still logged in — check with \`select\`.)

**Why it works:**
- When \`auth/logout\` arrives, \`race\` cancels \`pollOrders\`. If it was inside \`call(api.fetchOrders)\`, the result is thrown away, so \`ordersUpdated\` can never be dispatched afterwards. The \`finally\` block runs for cleanup.
- Cancellation is not an error — the inner \`catch\` does not run.
- The \`take → race\` loop structure gives "only one poller at a time" for free.

**Alternative with fork/cancel:**

\`\`\`javascript
function* watchPollingWithFork() {
  while (true) {
    yield take('polling/start');
    const task = yield fork(pollOrders);
    yield take(['polling/stop', 'auth/logout']);
    yield cancel(task); // import cancel from redux-saga/effects
  }
}
\`\`\`

Same behaviour; \`race\` is shorter, \`fork\` is handy when you need the task handle elsewhere.`,
      followUps: [
        {
          q: 'To really abort the HTTP request (not just ignore it), what do you add?',
          a: 'Create an `AbortController` before the call, pass `signal` to fetch, and in `finally` check `yield cancelled()` and call `controller.abort()`. Or return a promise with a `[CANCEL]` method that redux-saga calls on cancellation.',
        },
        {
          q: 'Should the slice also clear orders on logout?',
          a: 'Yes. Cancelling stops new data; the reducers should also reset on `auth/logout` (e.g. a root reducer that returns `undefined` state for that action) so the old user\'s data disappears.',
        },
      ],
    },
    {
      id: 'saga-websocket-event-channel',
      title: 'Live prices over WebSocket with eventChannel',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'saga-channels',
      question: `A trading screen receives price updates over a WebSocket (\`wss://prices.example.com\`). Messages look like \`{"symbol":"AAPL","price":191.2}\`. Write sagas that:

1. Connect on \`socket/connect\`, disconnect on \`socket/disconnect\` or \`auth/logout\`.
2. Dispatch \`prices/updated\` for each message.
3. If the connection drops, reconnect with backoff (1 s, 2 s, 4 s … max 30 s).
4. Do not leak listeners or sockets.
5. Handle bad JSON without crashing.

Why can you not just \`yield put(...)\` inside \`socket.onmessage\`?`,
      hints: [
        '`yield` only works inside the generator function itself, not inside a callback. You need a bridge from callbacks to the saga.',
        '`eventChannel(emit => { ...; return unsubscribe })` turns callbacks into a channel you can `take` from. `emit(END)` closes it.',
        'Wrap the read loop in a `race` with `take(\'socket/disconnect\')`, and close the channel in `finally`.',
      ],
      solution: `**Idea:** \`eventChannel\` converts WebSocket callbacks into a stream the saga can \`take\` from in a loop. A \`race\` ends the loop on disconnect, and a \`finally\` always closes the channel (which unsubscribes and closes the socket). An outer loop reconnects with backoff.

\`\`\`javascript
import { END, buffers, eventChannel } from 'redux-saga';
import { call, delay, put, race, take, takeLatest } from 'redux-saga/effects';

const URL = 'wss://prices.example.com';

// Promise that resolves when the socket is open
function openSocket(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.onopen = () => resolve(ws);
    ws.onerror = () => reject(new Error('WebSocket connection failed'));
  });
}

function createSocketChannel(socket) {
  return eventChannel(
    (emit) => {
      socket.onmessage = (event) => {
        try {
          emit(JSON.parse(event.data));
        } catch {
          // bad JSON: skip this message instead of killing the stream
        }
      };
      socket.onclose = () => emit(END); // END closes the channel -> the reading loop stops
      // unsubscribe function: called when channel.close() is called
      return () => {
        socket.onmessage = null;
        socket.onclose = null;
        socket.close();
      };
    },
    buffers.sliding(100), // keep the latest 100 messages if the saga is busy
  );
}

function* readMessages(channel) {
  while (true) {
    const message = yield take(channel); // after END, this saga simply terminates
    yield put(pricesUpdated(message));
  }
}

function* socketFlow() {
  let attempt = 0;
  while (true) {
    let channel;
    try {
      const socket = yield call(openSocket, URL);
      attempt = 0;                      // connected: reset backoff
      yield put(socketConnected());
      channel = yield call(createSocketChannel, socket);

      const { stop } = yield race({
        closed: call(readMessages, channel),            // ends when the server closes
        stop: take(['socket/disconnect', 'auth/logout']),
      });
      if (stop) return;                 // user asked to disconnect -> no reconnect
    } catch (err) {
      yield put(socketError(err.message));
    } finally {
      if (channel) channel.close();     // always unsubscribe + close socket (also on cancel)
    }

    // Connection lost -> reconnect with exponential backoff, capped at 30 s
    attempt += 1;
    yield put(socketReconnecting(attempt));
    yield delay(Math.min(30_000, 1000 * 2 ** (attempt - 1)));
  }
}

export function* watchSocket() {
  yield takeLatest('socket/connect', socketFlow); // a new connect replaces the old flow
}
\`\`\`

**Why \`put\` in \`onmessage\` does not work:** \`yield\` is only valid directly inside the generator. A callback is a separate normal function that runs later; the saga cannot pause or resume there. The channel is the bridge: callbacks \`emit\`, the saga \`take\`s.

**Why it works:**
- \`race\` cancels \`readMessages\` when the user disconnects; when the server closes, \`END\` ends \`readMessages\` and the race finishes with \`closed\`.
- \`finally\` runs on success, error **and** cancellation (e.g. takeLatest restarting), so listeners and sockets never leak.
- A sliding buffer means a burst of messages is not lost while the saga is busy with a \`put\`; very old ones are dropped first.

**Performance edge case:** 100 updates per second = 100 Redux updates per second. Batch them: collect messages for ~100 ms (e.g. with \`actionChannel\` + \`flush\`, or a buffer in the channel) and dispatch one \`pricesUpdated([...])\`. Store prices normalized by symbol so only the changed rows re-render.`,
      followUps: [
        {
          q: 'How do you send messages (subscribe to a symbol) over the same socket?',
          a: 'Fork a second loop inside socketFlow: `yield fork(function* () { while (true) { const a = yield take(\'prices/subscribe\'); socket.send(JSON.stringify({ subscribe: a.payload })); } })`. Forked tasks are cancelled when the parent is cancelled.',
        },
        {
          q: 'eventChannel vs actionChannel?',
          a: '`eventChannel` brings **outside** events (sockets, timers, DOM) into sagas. `actionChannel` buffers **Redux actions** so a saga can process them one at a time in order (a queue).',
        },
      ],
    },
    {
      id: 'kanban-board-state-design',
      title: 'Design the Redux state for a Trello-like board',
      difficulty: 'hard',
      type: 'design',
      frequency: 'occasional',
      relatedTopic: 'redux-state-design',
      question: `Design the Redux state for a Kanban board (like Trello): boards → lists → cards. Users drag cards within a list and between lists; many people edit the same board, and changes arrive over a WebSocket.

Answer:
1. The state shape (what goes in Redux, what does not).
2. A \`cardMoved\` reducer: \`{ cardId, fromListId, toListId, toIndex }\`.
3. How the move is saved to the server so the UI is instant but stays correct.
4. Which components subscribe to what, so dragging one card does not re-render the whole board.`,
      hints: [
        'Normalize: `lists` and `cards` as entity tables. Order lives in `list.cardIds` (an array of ids).',
        'Moving a card = remove its id from one `cardIds` array and insert it into another.',
        'Each `<Card id>` component selects only its own card by id; each `<List>` selects only its `cardIds`.',
      ],
      solution: `**1. State shape**

\`\`\`javascript
{
  boards: { ids: ['b1'], entities: { b1: { id: 'b1', title: 'Sprint 12', listIds: ['l1', 'l2'] } } },
  lists:  { ids: ['l1', 'l2'], entities: {
    l1: { id: 'l1', boardId: 'b1', title: 'To do', cardIds: ['a', 'b', 'c'] },
    l2: { id: 'l2', boardId: 'b1', title: 'Done',  cardIds: ['d'] },
  } },
  cards:  { ids: ['a', 'b', 'c', 'd'], entities: {
    a: { id: 'a', listId: 'l1', title: 'Login page', position: 1000 /* server order key */ },
    // ...
  } },
  sync: { pendingMoves: {} }, // cardId -> previous location, for rollback
}
\`\`\`

**Not in Redux:** drag preview position and hover state (local component state or the drag library), open/closed modals of one component, form inputs while typing.

**2. The reducer** (createSlice + Immer):

\`\`\`javascript
// in the lists/board slice; \`toIndex\` is the index AFTER removing the card (what drag libraries give you)
cardMoved(state, action) {
  const { cardId, fromListId, toListId, toIndex } = action.payload;
  const from = state.lists.entities[fromListId];
  const to = state.lists.entities[toListId];
  const card = state.cards.entities[cardId];
  if (!from || !to || !card) return;

  const fromIndex = from.cardIds.indexOf(cardId);
  if (fromIndex === -1) return;                 // stale event: card is not there anymore

  from.cardIds.splice(fromIndex, 1);            // remove
  const index = Math.max(0, Math.min(toIndex, to.cardIds.length)); // clamp
  to.cardIds.splice(index, 0, cardId);          // insert
  card.listId = toListId;
},
\`\`\`

Examples: move \`a\` to index 2 in the same list → \`['b', 'c', 'a']\`. Move \`b\` to \`l2\` index 0 → \`l1: ['a', 'c']\`, \`l2: ['b', 'd']\`.

**3. Saving the move (optimistic + rollback)**

\`\`\`javascript
export const moveCard = (move) => async (dispatch, getState) => {
  const before = getState().lists.entities[move.fromListId].cardIds.indexOf(move.cardId);
  dispatch(cardMoved(move)); // instant UI
  try {
    // Send a stable "position" (e.g. midpoint between neighbours: (prev + next) / 2),
    // so the server only updates ONE card row, not the whole list order.
    await api.moveCard(move.cardId, { listId: move.toListId, index: move.toIndex });
  } catch {
    // roll back: move it back to where it was
    dispatch(cardMoved({ cardId: move.cardId, fromListId: move.toListId, toListId: move.fromListId, toIndex: before }));
    dispatch(showToast('Move failed'));
  }
};
\`\`\`

Remote moves from the WebSocket dispatch the **same** \`cardMoved\` action (ignore echoes of your own move by checking a client-generated \`moveId\`). Because the reducer validates and clamps, out-of-date events do not corrupt state; a periodic or on-reconnect refetch of the board fixes any drift.

**4. Rendering**

\`\`\`jsx
const List = React.memo(function List({ listId }) {
  const cardIds = useSelector((s) => s.lists.entities[listId].cardIds); // same array ref unless THIS list changes
  return cardIds.map((id) => <Card key={id} cardId={id} />);
});

const Card = React.memo(function Card({ cardId }) {
  const card = useSelector((s) => s.cards.entities[cardId]); // only this card
  return <div>{card.title}</div>;
});
\`\`\`

Moving a card changes two \`cardIds\` arrays and one card. Immer creates new references only for those, so just the two lists and the moved card re-render — not the other 500 cards.

**Why it works:** normalized tables give O(1) lookups and one source of truth for each card; order is a simple array of ids; the same action handles local and remote moves.`,
      followUps: [
        {
          q: 'Why store order in list.cardIds instead of sorting cards by position in a selector?',
          a: 'Both work. cardIds makes moves and rendering simple (no sorting on every change). The server can still use a numeric `position` (fractional indexing) to persist order with a single-row update.',
        },
        {
          q: 'How would you add undo/redo?',
          a: 'Keep a history stack of past board states (cheap thanks to structural sharing) or of inverse actions; libraries like redux-undo wrap a reducer with `past/present/future`.',
        },
      ],
    },
  ],
};
