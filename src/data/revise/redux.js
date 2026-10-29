// Revise MERN: Redux & Redux-Saga. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'redux',
  icon: '🟣',
  title: 'Redux & Redux-Saga',
  note: 'Store, reducers and Redux Toolkit, middleware, thunk vs saga, saga effects, RTK Query and when to skip Redux.',
  items: [
    {
      q: 'What is Redux and why use it?',
      a: `**Redux** is a predictable state container: the whole app's shared state lives in one **store**, components **dispatch actions** to describe what happened, and pure **reducers** compute the next state.

It is useful when a lot of state is shared across many screens, when updates are complex, or when you want strong debugging with Redux DevTools and time-travel. In SkillKeepr we used Redux with **Redux-Saga** to manage things like auth, candidates, jobs and notifications across a large React front-end.`,
    },
    {
      q: 'Explain store, actions, reducers, dispatch and selectors.',
      a: `The **store** holds the state tree. An **action** is a plain object with a \`type\` and usually a \`payload\` that describes an event, like \`candidates/loaded\`. A **reducer** is a pure function \`(state, action) => newState\`.

**dispatch** sends an action to the store, which runs it through middleware and then the reducers. A **selector** is a function that reads a piece of state, like \`state => state.jobs.list\`. In React we use \`useSelector\` to read and \`useDispatch\` to send actions.`,
    },
    {
      q: 'What are the three principles of Redux?',
      a: `First, **single source of truth**: the global state lives in one store as one object tree. Second, **state is read-only**: the only way to change it is to dispatch an action describing what happened.

Third, **changes are made with pure functions**: reducers take the previous state and an action and return a new state, without side effects or mutation. Together these make the app predictable, easy to debug and possible to replay.`,
    },
    {
      q: 'Why must reducers be pure and state immutable?',
      a: `Redux and React-Redux detect changes by **reference comparison**. If you mutate the existing object, the reference stays the same, so components may not re-render and DevTools history breaks.

A **pure** reducer gives the same output for the same input and has no side effects: no API calls, no random values, no dates. That makes reducers easy to test and lets time-travel debugging work. Side effects belong in middleware like thunks or sagas.`,
    },
    {
      q: 'What is Redux Toolkit and why is it recommended?',
      a: `**Redux Toolkit (RTK)** is the official, recommended way to write Redux today. It removes most boilerplate: \`configureStore\` sets up the store with good defaults, and \`createSlice\` generates action creators and action types from your reducers.

It uses **Immer**, so you can write "mutating" code like \`state.items.push(x)\` and it produces a correct immutable update. It also includes \`createAsyncThunk\`, \`createEntityAdapter\`, \`createSelector\`, and **RTK Query** for data fetching. The legacy \`createStore\` is now marked deprecated.`,
    },
    {
      q: 'What does createSlice do?',
      a: `\`createSlice\` takes a **name**, an **initialState** and a **reducers** object, and generates the slice reducer plus matching **action creators** automatically. For example, a \`todos\` slice with an \`added\` reducer gives you the action type \`todos/added\`.

You can also use \`extraReducers\` to respond to actions defined elsewhere, like thunk lifecycle actions. Because it uses Immer, reducers can be written in a mutating style safely. One slice per feature keeps the code organised.`,
    },
    {
      q: 'What does configureStore do?',
      a: `\`configureStore\` creates the store with sensible defaults in one call. It **combines your slice reducers**, adds the default middleware (including **thunk**), and enables **Redux DevTools** automatically.

In development it also adds checks that warn if you **mutate state** or put **non-serialisable values** in state or actions. You can add extra middleware, like the saga middleware, through the \`middleware\` option.`,
    },
    {
      q: 'What is middleware in Redux?',
      a: `**Middleware** sits between \`dispatch\` and the reducer. Every action passes through it, so it can log, modify, delay or stop actions, and, most importantly, run **side effects** like API calls.

Its signature is the curried \`store => next => action => {...}\`, where calling \`next(action)\` passes the action on. Common middleware includes **redux-thunk**, **redux-saga**, loggers, and RTK Query's own middleware. Reducers stay pure because all the async work happens here.`,
    },
    {
      q: 'Redux-Thunk vs Redux-Saga?',
      a: `A **thunk** lets you dispatch a function instead of an object; that function gets \`dispatch\` and \`getState\` and can run async code with async/await. It is simple and built into Redux Toolkit, great for straightforward fetch-and-store logic.

**Redux-Saga** uses **generator functions** that listen for actions and run side effects as declarative effects. It shines for complex flows: cancellation, debouncing, races, retries, polling and background tasks. The cost is more concepts to learn. On SkillKeepr we used **Redux-Saga** because of those multi-step async flows.`,
    },
    {
      q: 'What is Redux-Saga and how does it work?',
      a: `**Redux-Saga** is middleware for side effects built on **generator functions**. A saga \`yield\`s plain **effect objects**, like "call this API" or "dispatch this action", and the saga middleware actually executes them and resumes the generator with the result.

You usually have a **watcher saga** that listens for an action and a **worker saga** that does the work. Because effects are just objects, sagas are easy to test: you step through the generator and check what it yields, without mocking the network.`,
    },
    {
      q: 'Explain the saga effects call, put, take, takeEvery and takeLatest.',
      a: `\`call(fn, ...args)\` runs a function, like an API call, and waits if it returns a promise. \`put(action)\` dispatches an action to the store. \`take(type)\` pauses until a specific action is dispatched. \`select\` reads from the state.

\`takeEvery\` starts a new worker for **every** matching action, running them in parallel. \`takeLatest\` **cancels** any running worker when a new action comes in and keeps only the latest, which is ideal for search or filter requests so stale responses do not overwrite newer ones.`,
    },
    {
      q: 'What are fork, spawn, all and race in Redux-Saga?',
      a: `\`fork\` starts a task in the background **without blocking**; it is **attached**, so errors bubble to the parent and cancelling the parent cancels it. \`spawn\` is the **detached** version, independent of its parent.

\`all([...])\` runs several effects in parallel and waits for all, commonly used in the root saga to start all watchers. \`race\` runs effects and keeps the first to finish, cancelling the rest, which is useful for timeouts or a "cancel" action. \`cancel\` stops a forked task.`,
    },
    {
      q: 'How do you handle errors in Redux-Saga?',
      a: `Inside a worker saga you wrap the effects in a normal **try/catch**. On success you \`put\` a success action; in the catch block you \`put\` a failure action with the error message so the UI can show it, and \`finally\` can handle cleanup or cancellation.

It is important to catch errors in workers, because an uncaught error in a forked task can bubble up and kill the parent watcher, so that feature silently stops working. The \`retry\` effect can retry flaky API calls.`,
    },
    {
      q: 'What is RTK Query?',
      a: `**RTK Query** is the data-fetching and caching tool built into Redux Toolkit. You define an API with endpoints, and it generates hooks like \`useGetJobsQuery\` that handle **loading, error, caching, deduplication and refetching** for you.

It uses **tags** to invalidate cached data after mutations, and supports polling and optimistic updates. It removes most of the hand-written thunks or sagas and reducers for server data. It is similar in purpose to TanStack Query, but integrated with the Redux store.`,
    },
    {
      q: 'Redux vs Context API?',
      a: `**Context** is a way to pass values down the tree; it is not a full state manager. Every consumer re-renders when the value changes, and it has no middleware, DevTools or built-in pattern for side effects.

**Redux** gives a central store, selector-based subscriptions so components only re-render for the data they use, middleware for async logic, and great debugging. Context is fine for theme, auth user or locale. For large, frequently changing shared state, like SkillKeepr's, Redux scales better.`,
    },
    {
      q: 'What is reselect / createSelector and why use memoised selectors?',
      a: `\`createSelector\` from **reselect**, re-exported by Redux Toolkit, creates **memoised selectors**. It recalculates only when its input selectors return new values; otherwise it returns the cached result.

That matters because a selector that does \`filter\` or \`map\` returns a **new array every time**, which makes \`useSelector\` think data changed and re-render the component. Memoised selectors avoid that and also avoid repeating expensive derived calculations, like filtering and sorting a long candidate list.`,
    },
    {
      q: 'When should you NOT use Redux?',
      a: `Skip Redux when the app is **small** or state is mostly **local** to components; \`useState\`, \`useReducer\` and Context are enough. Also, most "state" in many apps is really **server cache**, which TanStack Query or RTK Query handles better than hand-written reducers.

Redux adds concepts and some boilerplate, so it pays off when many components share complex, frequently updated state, or when you need strong debugging and side-effect management. Lighter options like **Zustand** are also popular for medium apps.`,
    },
    {
      q: 'How does useSelector work and how do you avoid unnecessary re-renders?',
      a: `\`useSelector\` subscribes the component to the store. After every dispatched action it runs your selector and compares the result with the previous one using **strict reference equality**; if it changed, the component re-renders.

To avoid extra renders: select the **smallest** piece of state you need, avoid returning new objects or arrays from the selector, use **memoised selectors** with \`createSelector\`, or pass \`shallowEqual\` as the equality function when returning a small object.`,
    },
    {
      q: 'What is the Redux data flow?',
      a: `Redux has a **one-way data flow**. The user interacts with the UI, the component **dispatches an action**, the action passes through **middleware** (where thunks or sagas can run async work and dispatch more actions), then the **reducers** calculate the new state.

The store saves the new state and notifies subscribers; components using \`useSelector\` re-render if their selected data changed. Because every change follows this single path, you can trace any state change in DevTools.`,
    },
    {
      q: 'What is createAsyncThunk?',
      a: `\`createAsyncThunk\` is Redux Toolkit's helper for async logic. You give it an action type and an async function, and it dispatches three lifecycle actions automatically: **pending**, **fulfilled** and **rejected**.

You handle those in a slice's \`extraReducers\` to set loading flags, store data or save an error. It supports \`rejectWithValue\` for custom error payloads and cancellation through an abort signal. It covers most simple async needs without bringing in sagas.`,
    },
    {
      q: 'How would you structure a Redux-Saga setup in a real project?',
      a: `I keep it **feature-based**: each feature folder has its slice or reducer, actions, selectors and a \`sagas\` file with watchers and workers. A **root saga** uses \`all\` to start every feature's watchers, and the store runs it with \`sagaMiddleware.run(rootSaga)\` after adding the middleware.

API calls go through a small service layer that sagas \`call\`. On SkillKeepr this pattern kept flows like loading candidates, running searches and handling notifications organised as the app grew.`,
    },
    {
      q: 'What are channels in Redux-Saga?',
      a: `**Channels** let sagas communicate with sources other than the store. An \`eventChannel\` wraps an external event source, like a **WebSocket** or timer, so a saga can \`take\` events from it in a loop and \`put\` actions to the store.

\`actionChannel\` buffers actions so they can be processed **one at a time** in order, instead of in parallel. Event channels are the standard saga pattern for real-time features, like pushing incoming WebSocket notifications into Redux state.`,
    },
    {
      q: 'What is Immer and how does it help?',
      a: `**Immer** lets you write code that looks like it **mutates** state, such as \`state.user.name = 'A'\` or \`state.list.push(item)\`, while it actually produces a new immutable state behind the scenes using a draft object.

Redux Toolkit uses it inside \`createSlice\` and \`createReducer\`. It removes long nested spread operators and the bugs that come from them. Remember: either mutate the draft or return a new value, not both, and this only works inside Immer-powered reducers.`,
    },
    {
      q: 'How do you normalise state in Redux?',
      a: `**Normalising** means storing data like a database: each entity type in its own table keyed by id, such as \`{ ids: [...], entities: { id: item } }\`, instead of deeply nested or duplicated objects.

It makes updates simple, avoids keeping the same record in two places, and makes lookups fast. Redux Toolkit's \`createEntityAdapter\` gives you this shape plus ready-made reducers like \`addMany\`, \`updateOne\` and \`removeOne\`, and selectors.`,
    },
    {
      q: 'What is Redux DevTools and time-travel debugging?',
      a: `**Redux DevTools** is a browser extension that shows every dispatched action, the state before and after it, and the diff. **Time-travel debugging** means you can jump back to any earlier action and see the UI as it was, or replay actions.

It works because reducers are pure and state is immutable, so each state is a snapshot. \`configureStore\` connects it automatically in development. It makes tracing bugs like "who changed this value?" very quick.`,
    },
  ],
};
