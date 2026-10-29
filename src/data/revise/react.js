// Revise MERN: React. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'react',
  icon: '⚛️',
  title: 'React',
  note: 'Rendering, hooks, state, performance and the modern React 18/19 features.',
  items: [
    {
      q: 'What is the virtual DOM and how does reconciliation work?',
      a: `The **virtual DOM** is a lightweight JavaScript description of the UI. When state changes, React renders a new tree and compares it with the previous one; this comparison is **reconciliation**, or diffing. It then applies only the minimum real DOM changes.

The diff uses two shortcuts: if the element type changes, React throws away that subtree and rebuilds it; and for lists, it uses **keys** to match children. Since React 16 this work is done by the **Fiber** architecture, which can split rendering into chunks and prioritise urgent updates.`,
    },
    {
      q: 'Why are keys important in lists?',
      a: `**Keys** tell React which list item is which between renders, so it can reuse, move or remove the right DOM nodes and keep each item's state attached to the correct item.

Keys must be **stable and unique** among siblings, ideally a database id. Using the array **index** is risky when items are inserted, removed or reordered, because state and input values can end up on the wrong row. A useful trick: changing a component's key on purpose forces React to reset it completely.`,
    },
    {
      q: 'What are the rules of hooks?',
      a: `There are two rules. First, call hooks only at the **top level**, never inside loops, conditions or nested functions. Second, call them only from **React function components or custom hooks**, not from regular functions.

The reason is that React tracks hooks by their **call order** on each render. If a condition skips one hook, every hook after it gets the wrong state. The ESLint plugin \`eslint-plugin-react-hooks\` enforces these rules. The new \`use\` API is the one exception that can be called conditionally.`,
    },
    {
      q: 'Explain useEffect and its dependency array.',
      a: `\`useEffect\` runs **side effects** after React commits the render to the screen: data fetching, subscriptions, timers or manual DOM work. The **dependency array** controls when it re-runs: no array means after every render, an empty array means once after mount, and listed values mean whenever one of them changes.

You can return a **cleanup** function, which runs before the next effect and on unmount, for things like clearing intervals or closing a WebSocket. In development, Strict Mode runs effects twice to expose missing cleanups.`,
    },
    {
      q: 'What is the difference between state and props?',
      a: `**Props** are inputs passed from a parent; the child treats them as **read-only**. **State** is data a component owns and manages itself, and changing it with the setter triggers a re-render.

Data flows **one way**, down through props. If a child needs to change something, the parent passes a callback as a prop. A good rule: if a value can be computed from props or other state, do not store it as state, just calculate it during render.`,
    },
    {
      q: 'useMemo vs useCallback vs React.memo?',
      a: `\`useMemo\` caches a **computed value** between renders until its dependencies change, which is useful for expensive calculations. \`useCallback\` caches a **function reference**, so a child does not see a "new" function every render. \`React.memo\` wraps a **component** so it skips re-rendering when its props are shallowly equal.

They work together: memo on a child is useless if you pass it a fresh function or object each time. I use them where profiling shows a real problem. The **React Compiler** can now add this memoisation automatically.`,
    },
    {
      q: 'What causes a component to re-render?',
      a: `A component re-renders when its **own state changes**, when its **parent re-renders**, or when a **context** it reads changes. Props changing is really a result of the parent re-rendering. A Redux \`useSelector\` also triggers a re-render when the selected value changes.

Re-rendering is not always bad; it is the DOM update that is costly, and React only does that for real differences. To reduce unnecessary renders: keep state close to where it is used, split contexts, use \`React.memo\` with stable props, and select small slices from the store.`,
    },
    {
      q: 'Controlled vs uncontrolled components?',
      a: `In a **controlled** component, React state is the source of truth: the input's \`value\` comes from state and every change goes through \`onChange\`. That makes validation, formatting and conditional logic easy.

In an **uncontrolled** component, the DOM keeps the value and you read it when needed with a **ref** or from \`FormData\` on submit, using \`defaultValue\` for the initial value. Uncontrolled is simpler and faster for big forms, which is why libraries like React Hook Form use it. React 19 form actions also lean on the uncontrolled style.`,
    },
    {
      q: 'What is the Context API and when should you use it?',
      a: `**Context** lets you pass a value deep down the tree without **prop drilling**. You create a context, wrap a part of the tree in its Provider, and any component below reads it with \`useContext\` (or \`use\` in React 19).

It suits values that change rarely: theme, current user, locale, tenant info. The catch is that every consumer re-renders when the value changes, so it is not a full state manager for fast-changing data. For complex shared state with async flows, like in SkillKeepr, we used **Redux with Redux-Saga** instead.`,
    },
    {
      q: 'What is lifting state up?',
      a: `**Lifting state up** means moving state to the **closest common parent** of the components that need it, then passing it down as props along with callbacks to change it.

That gives one source of truth, so two siblings, like a filter panel and a results list, always stay in sync. If you find yourself lifting state through many layers, that is the signal to consider context or a store like Redux instead.`,
    },
    {
      q: 'What are custom hooks?',
      a: `A **custom hook** is a function whose name starts with \`use\` and that calls other hooks. It lets you **reuse stateful logic**, not UI, across components, like \`useDebounce\`, \`useFetch\`, \`useWebSocket\` or \`useAuth\`.

Each component that uses the hook gets its **own independent state**; hooks share logic, not data. They replaced older patterns like higher-order components and render props for most cases, and they make components much cleaner to read and test.`,
    },
    {
      q: 'What is useRef used for?',
      a: `\`useRef\` gives you a mutable object, \`{ current }\`, that **persists across renders** and does **not** cause a re-render when it changes.

It has two main uses: getting a reference to a **DOM node**, for example to focus an input or measure size, and storing **mutable values** that are not shown in the UI, like a timer id, the previous value, or a WebSocket instance. In React 19, function components can accept \`ref\` as a normal prop, so \`forwardRef\` is no longer needed.`,
    },
    {
      q: 'useState vs useReducer?',
      a: `Both manage local state. \`useState\` is best for simple, independent values like a toggle or input text. \`useReducer\` is better when the **next state depends on the previous one in complex ways**, or when several values change together, because all the logic lives in one pure reducer function and you just dispatch actions.

It also makes logic easier to test and is the same mental model as Redux. Also remember state updates are batched, and when the new value depends on the old, use the functional form \`setCount(c => c + 1)\`.`,
    },
    {
      q: 'What are React.lazy and Suspense?',
      a: `\`React.lazy\` lets you **code-split** a component, loading it with a dynamic \`import()\` only when it is first rendered. **Suspense** shows a fallback UI, like a spinner, while that code or data is loading.

Route-level lazy loading is the easiest win for bundle size. Suspense also works with data in modern React, through frameworks or the \`use\` hook reading a promise. Multiple Suspense boundaries let you load parts of a page independently instead of blocking everything.`,
    },
    {
      q: 'What are error boundaries?',
      a: `An **error boundary** is a component that catches JavaScript errors thrown while **rendering** its children, shows a fallback UI, and stops the whole app from crashing to a blank screen.

They must still be **class components** using \`getDerivedStateFromError\` and \`componentDidCatch\`, though most teams use the \`react-error-boundary\` package. They do **not** catch errors in event handlers, async code like \`setTimeout\` or fetch, or server-side rendering; you handle those with try/catch.`,
    },
    {
      q: 'What are the main features in React 18?',
      a: `React 18 brought **concurrent rendering**, where React can pause, interrupt and prioritise renders. On top of it came **automatic batching** for all updates, including those inside promises and timeouts, and the new root API \`createRoot\`.

It added \`useTransition\` and \`startTransition\` to mark updates as non-urgent, \`useDeferredValue\`, \`useId\` for stable ids, and streaming server rendering with Suspense. Strict Mode also started double-running effects in development to catch missing cleanups.`,
    },
    {
      q: 'What is new in React 19?',
      a: `React 19's main theme is **Actions**: you can pass async functions to forms and transitions, and React handles pending state, errors and optimistic updates. New hooks support this: \`useActionState\`, \`useFormStatus\` and \`useOptimistic\`.

It also added the \`use\` API to read promises or context, **ref as a normal prop** so \`forwardRef\` is not needed, rendering \`<title>\` and meta tags directly in components, and stable **Server Components**. The separate **React Compiler** can automatically memoise components.`,
    },
    {
      q: 'What are React Server Components?',
      a: `**Server Components** render only on the server and send their result to the client, so their code never ships to the browser. They can read databases or files directly and are great for data-heavy, non-interactive parts of a page.

They cannot use state, effects or browser APIs. Anything interactive is a **Client Component**, marked with \`'use client'\`. You normally use them through a framework like Next.js. They are different from classic SSR, which still sends all component code for hydration.`,
    },
    {
      q: 'What is useLayoutEffect and how is it different from useEffect?',
      a: `\`useLayoutEffect\` runs **synchronously after the DOM is updated but before the browser paints**. \`useEffect\` runs after the paint, without blocking it.

Use \`useLayoutEffect\` only when you must **measure the DOM** and adjust before the user sees it, like positioning a tooltip, to avoid flicker. Because it blocks painting, overusing it hurts performance, so \`useEffect\` is the default for almost everything else.`,
    },
    {
      q: 'What is prop drilling and how do you avoid it?',
      a: `**Prop drilling** is passing props through many intermediate components that do not use them, just to reach a deep child. It makes code noisy and hard to refactor.

Fixes include **component composition**, where you pass components as \`children\` so the middle layers do not need the data, **Context** for widely used values, and a **state library** like Redux or Zustand for shared app state. Composition is often the simplest and most overlooked fix.`,
    },
    {
      q: 'What is useTransition used for?',
      a: `\`useTransition\` lets you mark a state update as **non-urgent**. React keeps the UI responsive for urgent updates like typing, and renders the transition in the background, which can be interrupted if new input arrives. It gives you an \`isPending\` flag to show a subtle loading state.

A classic case is filtering a big list as the user types: the input updates instantly, and the heavy list render is a transition. In React 19 the callback can also be async, which is the basis of Actions.`,
    },
    {
      q: 'Class components vs function components?',
      a: `**Function components** with hooks are the modern standard. They are shorter, easier to test, and hooks let you share logic through custom hooks instead of HOCs or render props. **Class components** use \`this.state\`, \`setState\` and lifecycle methods like \`componentDidMount\`.

Roughly, \`useEffect\` covers mount, update and unmount lifecycles. Classes still work and are still needed for **error boundaries**, but all new code is written with functions.`,
    },
    {
      q: 'What is a Higher-Order Component?',
      a: `A **Higher-Order Component** is a function that takes a component and returns a new, enhanced component, like \`withAuth(Dashboard)\` that checks login before rendering. It was the main way to reuse logic before hooks.

The downsides are "wrapper hell", unclear prop sources and name collisions. Today **custom hooks** do the same job more cleanly, but you still see HOCs in older code and some libraries, for example \`connect\` in older React-Redux code.`,
    },
    {
      q: 'What is StrictMode?',
      a: `\`StrictMode\` is a development-only wrapper that helps find bugs. It does **not** render any UI and has no effect in production builds.

It **double-invokes** component renders, state initialisers and effects (mount, cleanup, mount again) to expose impure rendering and missing cleanup functions, and warns about deprecated APIs. If an API call fires twice in development, StrictMode is usually why, and the right fix is proper cleanup or caching, not removing StrictMode.`,
    },
    {
      q: 'How do you optimise performance in a large React app?',
      a: `First **measure** with the React DevTools Profiler, then fix the real hotspots. Common tools are **code splitting** with \`lazy\` and Suspense, **memoisation** with \`memo\`, \`useMemo\` and \`useCallback\`, and **virtualising** long lists so only visible rows render.

Also keep state local, split big contexts, select small slices from Redux, debounce expensive inputs, use \`useTransition\` for heavy updates, and optimise images and bundle size. In dashboards with many tables, like the SkillKeepr admin screens, pagination and list virtualisation give the biggest wins.`,
    },
  ],
};
