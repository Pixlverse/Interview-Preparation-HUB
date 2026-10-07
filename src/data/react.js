// React.js — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'react',
  title: 'React.js',
  icon: '⚛️',
  description: 'Components, hooks, rendering, performance and the patterns interviewers love to ask about — from JSX basics to Fiber, concurrent rendering and React 19.',
  definitionTitle: 'What is React?',
  definition: `**React** is a JavaScript **library for building user interfaces**, made by Meta. You build the UI from small reusable pieces called **components**. Each component is a function that takes data (**props** and **state**) and returns what should appear on screen (written in **JSX**, which looks like HTML).

When data changes, React works out **what changed** and updates only those parts of the page. You describe *what* the UI should look like, and React handles *how* to update the browser. This style is called **declarative**.

**One-line answer:** "React is a declarative, component-based JavaScript library for building UIs — you describe the UI as a function of state, and React efficiently updates the DOM when that state changes."`,
  topics: [
    {
      id: 'jsx',
      title: 'JSX',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'HTML-like syntax inside JavaScript that a compiler turns into plain function calls that describe the UI.',
      what: `**JSX** lets you write HTML-like tags inside JavaScript. It is not HTML and it is not a string. A tool (Babel, SWC, esbuild) turns it into normal JavaScript before the browser sees it.

- Use \`{ }\` to put any JavaScript **expression** inside JSX: \`{user.name}\`, \`{2 + 2}\`, \`{isAdmin ? 'Yes' : 'No'}\`.
- Attributes are camelCase: \`className\` (not \`class\`), \`htmlFor\` (not \`for\`), \`onClick\`.
- A component must return **one** parent element. Use a **Fragment** (\`<>...</>\`) to group without adding an extra \`<div>\`.

#### Deeper version
Since React 17 the "new JSX transform" compiles \`<h1 className="t">Hi</h1>\` into \`jsx('h1', { className: 't', children: 'Hi' })\`, imported automatically from \`react/jsx-runtime\`. That is why you no longer need \`import React\` in every file. Older code compiled to \`React.createElement(...)\`. Either way, the result is a plain object called a **React element** — a lightweight description like \`{ type: 'h1', props: {...} }\`. React reads these objects to decide what to put on the screen. JSX also **escapes** values by default, which protects you from most XSS attacks.`,
      why: `Writing UI with nested \`createElement\` calls is hard to read. JSX keeps markup and the logic that drives it in one place, looks like the HTML you already know, and still gives you the full power of JavaScript (variables, maps, ternaries).`,
      analogy: `JSX is like a recipe written in friendly words. The compiler is a translator that turns the friendly recipe into exact machine steps. You write "bake a cake"; the machine reads "call jsx('cake', ...)".`,
      code: [
        {
          title: 'JSX basics',
          lang: 'jsx',
          code: `function Greeting({ user }) {
  const isAdmin = user.role === 'admin';

  return (
    <>
      {/* Fragment: groups without an extra DOM node */}
      <h1 className="title">Hello, {user.name}!</h1>
      <p>Role: {isAdmin ? 'Admin' : 'Member'}</p>
      <label htmlFor="email">Email</label>
      <input id="email" style={{ fontSize: 16 }} /> {/* style takes an object */}
    </>
  );
}`,
        },
        {
          title: 'What JSX compiles to',
          lang: 'javascript',
          code: `// You write:
const el = <h1 className="title">Hi</h1>;

// The compiler produces (React 17+ automatic runtime):
import { jsx as _jsx } from 'react/jsx-runtime';
const el2 = _jsx('h1', { className: 'title', children: 'Hi' });

// Result is a plain object, roughly:
// { type: 'h1', props: { className: 'title', children: 'Hi' }, key: null }`,
        },
      ],
      output: `The first component renders an \`<h1>\` with the user's name and a paragraph showing "Admin" or "Member". The Fragment means no extra wrapper \`<div>\` appears in the DOM. The \`style\` prop uses double braces: the outer \`{}\` means "JavaScript here", the inner \`{}\` is the object.

The second block shows that JSX is just sugar: the tag becomes a function call that returns a plain object. React later turns that object into real DOM.`,
      questions: [
        {
          q: 'What is JSX?',
          a: 'A syntax extension that looks like HTML inside JavaScript. It compiles to `jsx()` / `React.createElement()` calls that return plain objects called React elements.',
        },
        {
          q: 'Why do we use className instead of class?',
          a: 'JSX is JavaScript, and `class` is a reserved keyword in JavaScript. JSX attributes map to DOM properties, and the DOM property is `className`.',
        },
        {
          q: 'Why must a component return a single root element?',
          a: 'Because JSX compiles to one function call, and a function can only return one value. Use a Fragment `<>...</>` to wrap siblings without extra DOM.',
        },
        {
          q: 'Can you use if/else inside JSX?',
          a: 'Not directly, because `{}` accepts expressions, not statements. Use a ternary, `&&`, or compute the value with if/else before the `return`.',
        },
      ],
      spoken: `"JSX is a syntax that lets me write HTML-like markup inside JavaScript. It isn't understood by the browser directly — a compiler like Babel or SWC turns each tag into a function call, \`jsx()\` in the new transform or \`React.createElement\` in older code, and that returns a plain object called a React element. Inside JSX I can use any JavaScript expression in curly braces. Some attributes differ from HTML, like \`className\` and \`htmlFor\`. JSX also escapes values by default, which helps protect against XSS."`,
      mistakes: [
        'Saying JSX is HTML or a template string. It is JavaScript that compiles to function calls.',
        'Rendering `{count && <List />}` when `count` is `0` — React prints `0` on screen. Use `count > 0 && ...`.',
        'Writing `style="color: red"`. In JSX `style` takes an object: `style={{ color: \'red\' }}`.',
        'Follow-up trap: "Do you still need `import React` at the top of every file?" Not with the React 17+ automatic JSX runtime; older setups needed it because JSX compiled to `React.createElement`.',
      ],
      takeaway: 'JSX is syntax sugar that compiles to function calls returning plain objects that describe the UI.',
    },
    {
      id: 'components',
      title: 'Components (Function and Class)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Reusable functions that take props and return UI. Modern React uses function components with hooks.',
      what: `A **component** is a reusable piece of UI. In modern React it is just a JavaScript function that takes an object called **props** and returns JSX.

- Component names must start with a **capital letter** (\`<UserCard />\`). Lowercase tags (\`<div>\`) are treated as HTML.
- Components can use other components inside them, like Lego blocks.
- A component should be **pure**: same props and state in, same JSX out, with no side effects during render.

#### Deeper version
Before hooks (React 16.8, 2019), state and lifecycle methods needed **class components** (\`class X extends React.Component\` with \`this.state\` and \`render()\`). Today function components + hooks can do everything except **error boundaries**, which still need a class. React calls your function on every render; the function itself holds no memory between calls — hooks store state on React's internal "fiber" node for that component instance.`,
      why: `Components let you split a big UI into small, testable, reusable parts. A \`Button\` written once can be used in 100 places, and a bug fixed once is fixed everywhere.`,
      analogy: `Components are like Lego bricks. Each brick has a clear shape (its props). You snap small bricks together to build bigger things — a house (page) made of walls (sections) made of bricks (buttons, inputs).`,
      code: [
        {
          title: 'Function component (modern)',
          lang: 'jsx',
          code: `function UserCard({ name, avatarUrl }) {
  return (
    <div className="card">
      <img src={avatarUrl} alt={name} />
      <h3>{name}</h3>
    </div>
  );
}

export default function App() {
  return (
    <main>
      <UserCard name="Asha" avatarUrl="/asha.png" />
      <UserCard name="Ravi" avatarUrl="/ravi.png" />
    </main>
  );
}`,
        },
        {
          title: 'Same thing as a class (legacy style)',
          lang: 'jsx',
          code: `import { Component } from 'react';

class UserCardClass extends Component {
  render() {
    const { name, avatarUrl } = this.props;
    return (
      <div className="card">
        <img src={avatarUrl} alt={name} />
        <h3>{name}</h3>
      </div>
    );
  }
}`,
        },
      ],
      output: `\`App\` renders two cards. React calls \`UserCard\` twice with different props, so you see "Asha" and "Ravi" with their images. The class version produces exactly the same output; it is just older and more verbose.`,
      questions: [
        {
          q: 'Function vs class components?',
          a: 'Both describe UI. Function components are simpler and use hooks for state and effects. Class components use `this.state` and lifecycle methods. New code uses functions; classes are mostly legacy, except for error boundaries.',
        },
        {
          q: 'Why must component names start with a capital letter?',
          a: 'JSX treats lowercase tags as built-in HTML elements (strings) and capitalised tags as variables (your components).',
        },
        {
          q: 'What does "a component must be pure" mean?',
          a: 'Given the same props, state and context, it must return the same JSX and must not change anything outside itself during render (no API calls, no mutating globals). Side effects go in event handlers or effects.',
        },
        {
          q: 'Can a component return null?',
          a: 'Yes. Returning `null` renders nothing. The component still exists and its hooks still run.',
        },
      ],
      spoken: `"A component is a reusable piece of UI. In modern React it's a function that takes props and returns JSX, and its name must start with a capital letter so JSX knows it's a component, not an HTML tag. Components should be pure during render — same inputs, same output, no side effects. Before hooks we used class components for state and lifecycle methods; today I use function components with hooks for almost everything. The one exception is error boundaries, which still need a class."`,
      mistakes: [
        'Defining a component **inside** another component. It gets a new identity every render, so React unmounts and remounts it and its state is lost.',
        'Calling a component like a function (`{UserCard(props)}`) instead of `<UserCard />`. Its hooks then belong to the parent and break the rules of hooks.',
        'Doing side effects (fetching, changing globals) directly in the render body.',
        'Follow-up trap: "Can function components do everything classes can?" Almost — but error boundaries still require a class component (or a library like react-error-boundary).',
      ],
      takeaway: 'A component is a pure function from props to UI; build apps by composing small components.',
    },
    {
      id: 'props',
      title: 'Props and children',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Read-only inputs passed from parent to child, including the special children prop.',
      what: `**Props** (short for "properties") are the inputs of a component. A parent passes them like HTML attributes, and the child receives them as one object.

- Props flow **one way**: parent → child. This is called **one-way data flow**.
- Props are **read-only**. A child must never change its props.
- Anything can be a prop: strings, numbers, objects, functions, even other JSX.
- **\`children\`** is a special prop: whatever you put between the opening and closing tags.

#### Deeper version
A child "talks back" to a parent by calling a **function prop** (\`onSave\`). When the parent re-renders, React calls the child again with a **new props object**, even if the values look the same. That is why objects and functions created inline are "new" each render — important later for \`React.memo\`. Two names are reserved and not passed as normal props: \`key\` always, and \`ref\` in React 18 and older (React 19 passes \`ref\` to function components as a normal prop).`,
      why: `Props make components reusable and configurable. The same \`Button\` can say "Save" or "Delete" and do different things because the parent passes different props. One-way flow makes data easy to trace: to find where a value comes from, you look up the tree.`,
      analogy: `Props are like the order slip a waiter hands to the chef. The chef reads the slip (props) and cooks (renders). The chef does not rewrite the slip. If the chef needs to tell the customer something, they ring a bell the waiter gave them (a callback prop).`,
      code: [
        {
          title: 'Props, defaults, callbacks and children',
          lang: 'jsx',
          code: `function Button({ label, variant = 'primary', onClick }) {
  // variant has a default value if the parent does not pass it
  return (
    <button className={\`btn btn-\${variant}\`} onClick={onClick}>
      {label}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children} {/* whatever is placed between <Card> tags */}
    </section>
  );
}

export default function App() {
  const handleSave = () => console.log('Saved!');
  return (
    <Card title="Profile">
      <p>Edit your details below.</p>
      <Button label="Save" onClick={handleSave} />
      <Button label="Cancel" variant="secondary" />
    </Card>
  );
}`,
        },
      ],
      output: `The page shows a card titled "Profile" with a paragraph and two buttons. "Save" gets class \`btn btn-primary\` (the default) and logs "Saved!" when clicked. "Cancel" gets \`btn btn-secondary\` and does nothing on click because no \`onClick\` was passed. The paragraph and buttons are the \`children\` of \`Card\`.`,
      questions: [
        {
          q: 'What is the difference between props and state?',
          a: 'Props come from the parent and are read-only for the child. State is owned by the component itself and changes over time with a setter. A change to either causes a re-render.',
        },
        {
          q: 'How does a child send data to its parent?',
          a: 'The parent passes a function as a prop, and the child calls it with the data, e.g. `onChange(value)`.',
        },
        {
          q: 'What is prop drilling and how do you avoid it?',
          a: 'Passing a prop through many layers that do not use it, just to reach a deep child. Fix it with composition (pass `children`), Context, or a state library.',
        },
        {
          q: 'What is the children prop?',
          a: 'The content placed between a component\'s opening and closing tags. It lets you build wrapper components like `Card`, `Modal` or `Layout`.',
        },
      ],
      spoken: `"Props are the inputs of a component. The parent passes them like attributes and the child receives them as an object. Data flows one way, from parent to child, and props are read-only — a child never changes them. If a child needs to tell the parent something, the parent passes a callback function as a prop. There's also the special \`children\` prop, which is whatever I put between the tags; I use it a lot for layout and wrapper components like cards and modals."`,
      mistakes: [
        'Mutating props, e.g. `props.items.push(x)`. Props are read-only; ask the parent to change its state instead.',
        'Copying props into state (`useState(props.value)`) and expecting it to update when the prop changes. The initial value is only used once.',
        'Passing `onClick={handleClick()}` — this calls the function during render. Pass `onClick={handleClick}` or `onClick={() => handleClick(id)}`.',
        'Follow-up trap: "Can you read `key` as a prop inside the child?" No. `key` is used by React and is not passed to the component. Pass the id separately if you need it.',
      ],
      takeaway: 'Props are read-only inputs flowing down; callbacks flow data back up.',
    },
    {
      id: 'state-usestate',
      title: 'State and useState',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Component memory that survives re-renders; updating it with the setter tells React to re-render.',
      what: `**State** is a component's memory — data that can change over time, like a counter, form input or "is the menu open". You create it with the \`useState\` hook:

\`const [count, setCount] = useState(0);\`

- \`count\` is the current value. \`setCount\` is the function to change it.
- Calling the setter tells React: "this changed, render again".
- A normal variable is reset on every render and changing it does **not** update the screen. State does both jobs: it is kept and it triggers a re-render.

#### Deeper version
State updates are **not applied immediately**. Calling \`setCount(count + 1)\` schedules a re-render; \`count\` in the current render stays the same (it is a "snapshot"). If the next value depends on the previous one, use the **updater form** \`setCount(c => c + 1)\`. React **batches** several updates in one event into a single re-render. React compares the new value with \`Object.is\`; if it is the same, it can skip the re-render — so for objects and arrays you must create a **new** copy (immutability) instead of mutating. For an expensive initial value, pass a function: \`useState(() => readFromStorage())\` (lazy initialisation runs once).`,
      why: `Without state, the UI could never respond to the user. State gives React a single source of truth: you change data, React updates the DOM for you. Immutability lets React detect changes with a cheap reference check.`,
      analogy: `State is like a scoreboard at a cricket match. You don't repaint the stadium when a run is scored — you update the scoreboard number, and the display updates itself. Each photo you take of the scoreboard (a render) shows the score at that moment, even if it changes a second later.`,
      code: [
        {
          title: 'Counter with the updater form',
          lang: 'jsx',
          code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const addThreeWrong = () => {
    setCount(count + 1); // all three read the same snapshot (0)
    setCount(count + 1);
    setCount(count + 1); // result: 1
  };

  const addThreeRight = () => {
    setCount((c) => c + 1); // each update receives the latest value
    setCount((c) => c + 1);
    setCount((c) => c + 1); // result: +3
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addThreeWrong}>+3 (buggy)</button>
      <button onClick={addThreeRight}>+3 (correct)</button>
    </div>
  );
}`,
        },
        {
          title: 'Updating objects and arrays immutably',
          lang: 'jsx',
          code: `const [user, setUser] = useState({ name: 'Asha', city: 'Pune' });
const [todos, setTodos] = useState([]);

// Object: copy, then change one field
setUser((prev) => ({ ...prev, city: 'Mumbai' }));

// Array: add, remove, update without mutating
setTodos((prev) => [...prev, { id: Date.now(), text: 'Learn React', done: false }]);
setTodos((prev) => prev.filter((t) => t.id !== 42));
setTodos((prev) => prev.map((t) => (t.id === 42 ? { ...t, done: true } : t)));

// WRONG: user.city = 'Mumbai'; setUser(user); -> same reference, React may skip the render`,
        },
      ],
      output: `Starting from 0, clicking "+3 (buggy)" shows **1**, because all three calls use the same \`count\` value (0) from that render's snapshot. Clicking "+3 (correct)" adds **3**, because each updater function gets the result of the previous one. Both cases cause only **one** re-render thanks to batching.

In the second block every update creates a new object or array, so React sees a new reference and re-renders.`,
      questions: [
        {
          q: 'Is setState synchronous or asynchronous?',
          a: 'It schedules an update; the state variable does not change in the current render. React batches updates and re-renders later. If you `console.log(count)` right after `setCount`, you still see the old value.',
        },
        {
          q: 'When should you use the functional updater form?',
          a: 'Whenever the new state depends on the old state, e.g. `setCount(c => c + 1)`. It avoids bugs from stale snapshots and closures.',
        },
        {
          q: 'Why must state be updated immutably?',
          a: 'React compares old and new state by reference (`Object.is`). If you mutate and pass the same object, React may think nothing changed and skip the render. Copies also make undo, memoization and debugging easier.',
        },
        {
          q: 'What is lazy initial state?',
          a: 'Passing a function to `useState(() => expensive())`. React calls it only on the first render instead of every render.',
        },
      ],
      spoken: `"State is a component's memory. I create it with \`useState\`, which gives me the current value and a setter. Calling the setter schedules a re-render — the value in the current render doesn't change, it's like a snapshot. If the new value depends on the old one, I use the updater form, like \`setCount(c => c + 1)\`. React batches multiple updates into one render. And I always update objects and arrays immutably — spread a copy and change it — because React detects changes by comparing references."`,
      mistakes: [
        'Logging state right after setting it and expecting the new value. You see the old snapshot.',
        'Mutating state (`arr.push`, `obj.x = 1`) and then calling the setter with the same reference.',
        'Storing values that can be calculated from other state or props (derived state). Calculate them during render instead.',
        'Follow-up trap: "If I call setCount(5) when count is already 5, does it re-render?" React bails out because `Object.is(5, 5)` is true. It may still call the component once more before bailing out, but children are not re-rendered and no DOM changes are made.',
      ],
      takeaway: 'State is a snapshot per render; update it with the setter, use the updater form for dependent updates, and never mutate.',
    },
    {
      id: 'events',
      title: 'Handling Events',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Pass functions to camelCase props like onClick; React wraps native events in SyntheticEvent objects.',
      what: `In React you handle events by passing a **function** to a camelCase prop: \`onClick\`, \`onChange\`, \`onSubmit\`, \`onKeyDown\`.

- Pass the function, do not call it: \`onClick={handleClick}\`, not \`onClick={handleClick()}\`.
- To pass an argument, wrap it: \`onClick={() => remove(id)}\`.
- The handler receives an **event object**. Use \`e.preventDefault()\` to stop default browser behaviour (like a form reloading the page) and \`e.stopPropagation()\` to stop bubbling to parents.

#### Deeper version
React gives you a **SyntheticEvent** — a wrapper around the native browser event with the same API across browsers (\`e.nativeEvent\` gives the original). React uses **event delegation**: instead of adding a listener to every button, it attaches listeners at the **root container** and routes events to your handlers. Since React 17 this root is your app's root DOM node (before it was \`document\`), which makes it safe to run multiple React versions on one page. Event pooling (reusing event objects) was removed in React 17, so you can read \`e.target\` inside async code now.`,
      why: `Events are how users interact with the UI. React's system gives consistent behaviour across browsers and good performance through delegation, while letting you write handlers right next to the markup.`,
      analogy: `Event delegation is like a hotel reception. Instead of a guard at every room door, one receptionist at the front desk takes every call and forwards it to the right room. Fewer people, same result.`,
      code: [
        {
          title: 'Click, arguments, preventDefault and bubbling',
          lang: 'jsx',
          code: `function TodoList({ todos, onRemove }) {
  const handleSubmit = (e) => {
    e.preventDefault(); // stop the page from reloading
    const text = new FormData(e.currentTarget).get('task');
    console.log('Add:', text);
  };

  return (
    <div onClick={() => console.log('div clicked (bubbled)')}>
      <form onSubmit={handleSubmit}>
        <input name="task" />
        <button type="submit">Add</button>
      </form>

      {todos.map((t) => (
        <button
          key={t.id}
          onClick={(e) => {
            e.stopPropagation(); // the div handler will NOT run
            onRemove(t.id);      // pass an argument via an arrow function
          }}
        >
          Remove {t.text}
        </button>
      ))}
    </div>
  );
}`,
        },
      ],
      output: `Submitting the form logs "Add: <text>" and the page does not reload because of \`preventDefault\`. Clicking the "Add" button also bubbles up, so "div clicked (bubbled)" is logged too. Clicking a "Remove" button calls \`onRemove(id)\` and, because of \`stopPropagation\`, the div's handler does not run.`,
      questions: [
        {
          q: 'What is a SyntheticEvent?',
          a: 'React\'s cross-browser wrapper around the native event. It has the same interface (`target`, `preventDefault`, `stopPropagation`), and `e.nativeEvent` gives the original browser event.',
        },
        {
          q: 'How do you pass an argument to an event handler?',
          a: 'Wrap it in an arrow function: `onClick={() => handleDelete(id)}`, or use a `data-id` attribute and read `e.currentTarget.dataset.id`.',
        },
        {
          q: 'Where does React attach event listeners?',
          a: 'On the root container of the React app (since React 17), using event delegation. Before React 17 they were attached to `document`.',
        },
        {
          q: 'What is the difference between e.target and e.currentTarget?',
          a: '`target` is the element that was actually clicked (could be a child). `currentTarget` is the element the handler is attached to.',
        },
      ],
      spoken: `"In React I handle events by passing a function to a camelCase prop like \`onClick\` or \`onSubmit\`. I pass the function itself, and if I need an argument I wrap it in an arrow function. The handler gets a SyntheticEvent, which is React's cross-browser wrapper, so I can call \`preventDefault\` or \`stopPropagation\` as usual. Under the hood React uses event delegation — since React 17 it attaches listeners to the root container rather than to every element, which is efficient."`,
      mistakes: [
        'Writing `onClick={handleClick()}` — it runs during render, and can cause an infinite loop if it sets state.',
        'Forgetting `e.preventDefault()` in form submit handlers, so the page reloads.',
        'Using `e.target.value` when the click happened on a child element; use `e.currentTarget` for the element with the handler.',
        'Follow-up trap: "Are inline arrow functions in onClick bad for performance?" Usually no. They only matter when passed to a memoized child (`React.memo`), where a new function every render breaks memoization — then use `useCallback`.',
      ],
      takeaway: 'Pass handler functions (not calls) to camelCase props; React delegates events at the root and gives you a SyntheticEvent.',
    },
    {
      id: 'conditional-rendering',
      title: 'Conditional Rendering',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Show different UI based on conditions using if/return, ternaries, && and lookup objects.',
      what: `**Conditional rendering** means showing different UI depending on a condition, like "show a spinner while loading".

The common patterns:
- **Early return** with \`if\`: \`if (loading) return <Spinner />;\`
- **Ternary** inside JSX: \`{isLoggedIn ? <Logout /> : <Login />}\`
- **Logical AND** for "show or nothing": \`{error && <Error msg={error} />}\`
- **Return \`null\`** to render nothing.

#### Deeper version
React ignores \`null\`, \`undefined\`, \`true\` and \`false\` when rendering, but it **does render numbers**, including \`0\` and \`NaN\`. So \`{items.length && <List />}\` shows "0" when the list is empty. Also remember that switching between two **different component types** at the same position unmounts one and mounts the other (state is lost), while the **same type** at the same position keeps its state. For many cases, a lookup object (\`const views = { a: <A />, b: <B /> }\`) is cleaner than nested ternaries.`,
      why: `Real apps have loading, error, empty and success states, logged-in and logged-out views, and permissions. Conditional rendering lets one component handle all of them clearly.`,
      analogy: `It's like a traffic light. Based on one condition (the timer), it shows red, yellow or green — never all at once.`,
      code: [
        {
          title: 'Loading, error, empty and success states',
          lang: 'jsx',
          code: `function Orders({ loading, error, orders, isAdmin }) {
  if (loading) return <p>Loading…</p>;          // early return
  if (error) return <p role="alert">{error}</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div>
      {/* && : render or nothing. Use a boolean, not a number! */}
      {orders.length > 0 && <h2>{orders.length} orders</h2>}

      {/* ternary: one or the other */}
      {isAdmin ? <button>Export CSV</button> : <span>Read-only</span>}

      <ul>
        {orders.map((o) => <li key={o.id}>{o.item}</li>)}
      </ul>
    </div>
  );
}`,
        },
        {
          title: 'Lookup object instead of nested ternaries',
          lang: 'jsx',
          code: `const STATUS_BADGE = {
  paid: <span className="green">Paid</span>,
  pending: <span className="yellow">Pending</span>,
  failed: <span className="red">Failed</span>,
};

function PaymentBadge({ status }) {
  return STATUS_BADGE[status] ?? <span>Unknown</span>;
}`,
        },
      ],
      output: `While \`loading\` is true the component shows only "Loading…". If there is an error it shows the error. With an empty array it shows "No orders yet." Otherwise it shows the count, an admin-only button (or "Read-only") and the list. \`PaymentBadge status="paid"\` renders the green "Paid" badge; an unknown status renders "Unknown".`,
      questions: [
        {
          q: 'What are the ways to conditionally render in React?',
          a: 'Early return with `if`, the ternary operator, logical `&&`, returning `null`, and lookup objects/maps for many cases.',
        },
        {
          q: 'Why does `{count && <Comp />}` sometimes show 0?',
          a: 'Because `0 && x` evaluates to `0`, and React renders numbers. Use `count > 0 && ...` or `!!count && ...`.',
        },
        {
          q: 'Does hiding with CSS differ from not rendering?',
          a: 'Yes. Not rendering unmounts the component (state lost, effects cleaned up). Hiding with CSS keeps it mounted and keeps its state.',
        },
      ],
      spoken: `"For conditional rendering I mostly use three patterns: an early return with \`if\` for loading or error states, a ternary when I need one thing or another, and \`&&\` when it's something or nothing. One gotcha with \`&&\` is that React renders numbers, so if the left side is zero you'll see a 0 on the screen — I always use a real boolean like \`length > 0\`. When there are many cases, I prefer a lookup object over nested ternaries because it reads much better."`,
      mistakes: [
        'Using a number on the left of `&&` and accidentally rendering `0`.',
        'Deeply nested ternaries that nobody can read. Use early returns, a helper function or a lookup object.',
        'Calling hooks after an early return. Hooks must run in the same order every render, so put all hooks **before** any `return`.',
        'Follow-up trap: "If I toggle between `<Input />` in two branches of a ternary, is state kept?" If it is the same component type at the same position, yes — React reuses it. Add different `key`s to force a reset.',
      ],
      takeaway: 'Use early returns, ternaries and boolean-guarded && — and never let a 0 leak into the UI.',
    },
    {
      id: 'lists-keys',
      title: 'Lists and Keys',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Render arrays with map(); give each item a stable, unique key so React can track it between renders.',
      what: `To show a list, you turn an array of data into an array of JSX with \`.map()\`. Every item needs a **\`key\`** prop.

A **key** is a unique, stable ID for each item among its siblings. It tells React "this \`<li>\` is the same item as last time", even if the order changes.

- Good keys: database IDs, UUIDs, slugs.
- Bad keys: \`Math.random()\` (changes every render) and, in many cases, the array **index**.

#### Deeper version
During reconciliation React matches old and new children **by key**. If keys match, React reuses the existing component (and its state and DOM node) and only updates what changed. With index keys, inserting an item at the top shifts every index, so React thinks every item changed: it updates all of them, and any **internal state** (input text, checkbox, focus) sticks to the wrong row. Index is fine only when the list is static: never reordered, filtered or inserted into. Keys only need to be unique among **siblings**, not globally. Changing a component's key on purpose is a trick to **reset** its state (\`<Form key={userId} />\`).`,
      why: `Without keys React would have to compare lists position by position, which is slow and causes bugs with state in reordered lists. Keys make list updates both fast and correct.`,
      analogy: `Keys are like name tags at a conference. If people change seats, you still know who is who by their name tag. If you used seat numbers (the index) instead, everyone would "become" a different person when one person sits at the front.`,
      code: [
        {
          title: 'Rendering a list with stable keys',
          lang: 'jsx',
          code: `function ProductList({ products }) {
  return (
    <ul>
      {products.map((p) => (
        // key goes on the outermost element returned by map
        <li key={p.id}>
          {p.name} — ₹{p.price}
        </li>
      ))}
    </ul>
  );
}`,
        },
        {
          title: 'The index-as-key bug',
          lang: 'jsx',
          code: `import { useState } from 'react';

function Row({ label }) {
  const [note, setNote] = useState(''); // internal state per row
  return (
    <li>
      {label} <input value={note} onChange={(e) => setNote(e.target.value)} />
    </li>
  );
}

export default function App() {
  const [items, setItems] = useState([
    { id: 'a', label: 'Apple' },
    { id: 'b', label: 'Banana' },
  ]);
  const addToTop = () => setItems([{ id: crypto.randomUUID(), label: 'Cherry' }, ...items]);

  return (
    <>
      <button onClick={addToTop}>Add to top</button>
      {/* Try key={i}: typed notes jump to the wrong fruit. key={item.id} is correct. */}
      <ul>{items.map((item, i) => <Row key={item.id} label={item.label} />)}</ul>
    </>
  );
}`,
        },
      ],
      output: `The first block renders one \`<li>\` per product. In the second, type "fresh" next to Apple and click "Add to top". With \`key={item.id}\` the note stays next to Apple. If you change it to \`key={i}\`, Cherry takes index 0, so React gives Cherry the old row 0 state — the note "fresh" now appears next to Cherry. That is the classic index-key bug.`,
      questions: [
        {
          q: 'Why does React need keys?',
          a: 'To identify which items were added, removed or moved between renders, so it can reuse the right components and DOM nodes instead of rebuilding or mixing up state.',
        },
        {
          q: 'When is using the index as a key OK?',
          a: 'Only when the list is static — items are never reordered, inserted, removed or filtered — and items have no internal state. Otherwise use a stable ID.',
        },
        {
          q: 'Why is Math.random() a bad key?',
          a: 'It changes on every render, so React thinks every item is new. It unmounts and remounts all of them, losing state and hurting performance.',
        },
        {
          q: 'How can keys reset a component?',
          a: 'If you change a component\'s key, React treats it as a new component: it unmounts the old one and mounts a fresh one with fresh state. E.g. `<ProfileForm key={userId} />`.',
        },
      ],
      spoken: `"When I render a list I map the array to JSX and give each item a \`key\`. The key tells React which item is which between renders, so it can reuse the right component and DOM node when items move. I use stable IDs from the data. Using the index is risky: if I insert at the top or sort, every index shifts and state like input text ends up on the wrong row. I also use keys deliberately to reset a component — changing the key remounts it with fresh state."`,
      mistakes: [
        'Using index keys in lists that can be sorted, filtered or prepended to.',
        'Generating keys during render with `Math.random()` or `Date.now()`.',
        'Putting the key on an inner element instead of the outermost element returned from `map`. With a Fragment wrapper use `<Fragment key={id}>`.',
        'Follow-up trap: "Do keys need to be globally unique?" No, only unique among siblings in the same list.',
      ],
      takeaway: 'Keys are stable identities for list items — use real IDs, not indexes or random values.',
    },
    {
      id: 'forms-controlled-uncontrolled',
      title: 'Forms: Controlled vs Uncontrolled Components',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Controlled inputs keep their value in React state; uncontrolled inputs keep it in the DOM and you read it with a ref or FormData.',
      what: `There are two ways to handle form inputs in React:

- **Controlled**: React state is the "single source of truth". You pass \`value\` and update it in \`onChange\`. React always knows the current value.
- **Uncontrolled**: the DOM keeps the value. You give a starting value with \`defaultValue\` and read it when needed with a **ref** or \`FormData\` on submit.

#### Deeper version
Controlled inputs re-render the component on every keystroke. That is fine for most forms, but large forms can become slow — which is why libraries like **react-hook-form** use uncontrolled inputs with refs internally. A field must not switch between the two modes: passing \`value={undefined}\` first and a string later gives the warning "A component is changing an uncontrolled input to be controlled". Always start with \`''\` instead. File inputs (\`<input type="file">\`) are always uncontrolled because their value is read-only for security. For checkboxes use \`checked\`/\`defaultChecked\`, not \`value\`. React 19 adds form **Actions** (\`<form action={fn}>\`), which work naturally with uncontrolled inputs and \`FormData\`.`,
      why: `Controlled inputs make instant validation, formatting (like uppercase or card numbers), conditional fields and "disable submit until valid" easy. Uncontrolled inputs are simpler and faster for basic forms and are needed for file inputs and some third-party widgets.`,
      analogy: `A controlled input is like a TV where every channel change goes through a remote you hold — you always know the channel. An uncontrolled input is a TV with buttons on the side; it remembers its own channel, and you look at the screen only when you need to know.`,
      code: [
        {
          title: 'Controlled form with validation',
          lang: 'jsx',
          code: `import { useState } from 'react';

function SignupForm() {
  const [form, setForm] = useState({ email: '', plan: 'free', agree: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const isValid = form.email.includes('@') && form.agree;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting', form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={form.email} onChange={handleChange} />
      <select name="plan" value={form.plan} onChange={handleChange}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
      <label>
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
        I agree
      </label>
      <button disabled={!isValid}>Sign up</button>
    </form>
  );
}`,
        },
        {
          title: 'Uncontrolled form with ref and FormData',
          lang: 'jsx',
          code: `import { useRef } from 'react';

function SearchForm() {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log('query:', data.get('q'));          // read via FormData
    console.log('same via ref:', inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="q" ref={inputRef} defaultValue="react" />
      <input type="file" name="avatar" /> {/* always uncontrolled */}
      <button>Search</button>
    </form>
  );
}`,
        },
      ],
      output: `In the controlled form, every keystroke updates \`form\` state and re-renders, so the "Sign up" button enables itself as soon as the email has "@" and the box is checked. On submit it logs the whole object.

In the uncontrolled form, typing does not re-render anything. On submit it logs "query: react" (or whatever was typed) twice — once from \`FormData\`, once from the ref.`,
      questions: [
        {
          q: 'What is a controlled component?',
          a: 'An input whose value comes from React state (`value`) and is updated through `onChange`. React state is the single source of truth.',
        },
        {
          q: 'When would you choose uncontrolled inputs?',
          a: 'Simple forms where you only need values on submit, file inputs, integrating non-React widgets, or large forms where re-rendering on every keystroke is costly (react-hook-form uses this approach).',
        },
        {
          q: 'What causes the "changing an uncontrolled input to be controlled" warning?',
          a: 'The `value` started as `undefined` or `null` and later became a string. Initialise state with `\'\'` (or `false` for checkboxes).',
        },
        {
          q: 'How do you handle many inputs with one handler?',
          a: 'Give each input a `name` and use a computed key: `setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))`.',
        },
      ],
      spoken: `"A controlled input gets its value from React state and updates it in \`onChange\`, so React is the single source of truth. That makes live validation, formatting and enabling the submit button easy. An uncontrolled input keeps its value in the DOM; I set a \`defaultValue\` and read it with a ref or FormData on submit. Uncontrolled is simpler and avoids re-rendering on every keystroke, which is why react-hook-form uses it. File inputs are always uncontrolled. For most real forms I use react-hook-form with a Zod schema."`,
      mistakes: [
        'Passing `value` without `onChange` — the input becomes read-only and React warns.',
        'Initialising controlled state with `undefined` or `null`, then switching to a string.',
        'Using `value` on checkboxes instead of `checked`.',
        'Follow-up trap: "Is controlled always better?" No. It re-renders on every keystroke; for big forms uncontrolled inputs (or react-hook-form) perform better.',
      ],
      takeaway: 'Controlled = React state owns the value; uncontrolled = the DOM owns it. Pick per form, and never switch modes mid-life.',
    },
    {
      id: 'lifting-state-up',
      title: 'Lifting State Up',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'When siblings need the same data, move the state to their closest common parent and pass it down as props.',
      what: `**Lifting state up** means moving state from a child to its **closest common parent** when two or more components need the same data.

The parent owns the state and passes:
- the **value** down as a prop, and
- a **function** to change it down as a prop.

Now both children always show the same, in-sync data.

#### Deeper version
This follows the "single source of truth" idea: each piece of data should live in exactly one place. The trade-off is that the parent re-renders when the state changes, and if the common parent is far up, you may end up **prop drilling**. When that happens, consider **composition** (passing components as \`children\`), **Context**, or a store (Zustand, Redux). The opposite rule also matters: keep state **as low as possible** (colocation) — only lift it when it must be shared.`,
      why: `If two components keep their own copy of the same data, the copies get out of sync. Lifting the state makes one owner, so updates are predictable and bugs like "the cart badge shows 2 but the cart shows 3" disappear.`,
      analogy: `Two kids share one TV remote. If each had their own remote, they'd fight over the channel. Give the remote to the parent; the kids ask the parent to change the channel, and both always see the same show.`,
      code: [
        {
          title: 'Shared temperature between two inputs',
          lang: 'jsx',
          code: `import { useState } from 'react';

function TemperatureInput({ label, value, onChange }) {
  return (
    <label>
      {label}: <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function Converter() {
  // State lives in the common parent
  const [celsius, setCelsius] = useState('20');
  const fahrenheit = celsius === '' ? '' : String((Number(celsius) * 9) / 5 + 32);

  return (
    <>
      <TemperatureInput label="Celsius" value={celsius} onChange={setCelsius} />
      <TemperatureInput
        label="Fahrenheit"
        value={fahrenheit}
        onChange={(f) => setCelsius(f === '' ? '' : String(((Number(f) - 32) * 5) / 9))}
      />
    </>
  );
}`,
        },
      ],
      output: `The page starts with Celsius = 20 and Fahrenheit = 68. Typing 100 in Celsius updates the parent state, and Fahrenheit shows 212. Typing 32 in Fahrenheit converts back and sets Celsius to 0. Both inputs are always in sync because there is only one piece of state — \`celsius\` — and Fahrenheit is **derived** from it.`,
      questions: [
        {
          q: 'What does lifting state up mean?',
          a: 'Moving shared state to the closest common ancestor of the components that need it, then passing the value and an updater function down as props.',
        },
        {
          q: 'What problem does it solve?',
          a: 'Duplicate state getting out of sync. It creates a single source of truth.',
        },
        {
          q: 'What is the downside, and what are the alternatives?',
          a: 'It can cause prop drilling and wider re-renders. Alternatives: composition with `children`, Context, or an external store like Zustand or Redux.',
        },
      ],
      spoken: `"Lifting state up means that when two components need the same data, I move the state to their closest common parent. The parent passes the value down as a prop and also passes a function so children can request changes. That gives a single source of truth, so the components can never disagree. I keep state as low as possible by default and only lift it when it's really shared. If lifting causes a lot of prop drilling, I look at composition or Context instead."`,
      mistakes: [
        'Keeping two copies of the same state in sibling components and trying to sync them with effects.',
        'Lifting state too high (e.g. to `App`) "just in case", which re-renders the whole tree on every change.',
        'Storing derived values (like Fahrenheit) as extra state instead of computing them.',
        'Follow-up trap: "How do two siblings communicate in React?" Through their common parent: the parent holds state and passes callbacks — or through Context/a store if they are far apart.',
      ],
      takeaway: 'Shared state belongs to the closest common parent — one source of truth, passed down as props.',
    },
    {
      id: 'composition-vs-inheritance',
      title: 'Composition vs Inheritance',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'React reuses UI by putting components inside other components (children, slots), not by extending classes.',
      what: `**Composition** means building components by **combining** other components — passing them as \`children\` or as props. **Inheritance** means creating a component by **extending** another class.

React strongly recommends composition. The React team has said they have not found real cases where component inheritance is better.

Common composition patterns:
- **\`children\`**: a wrapper that does not know what goes inside (\`<Modal>...</Modal>\`).
- **Slots**: several named props that take JSX (\`<Layout header={...} sidebar={...} />\`).
- **Specialisation**: a specific component that renders a generic one with preset props (\`WelcomeDialog\` renders \`Dialog\` with a fixed title).

#### Deeper version
Composition also solves **prop drilling** without Context: if a deep child needs \`user\`, the top component can create \`<Avatar user={user} />\` itself and pass that element down as \`children\`, so the middle layers never see \`user\`. Shared **logic** (not UI) is reused with **custom hooks**, which replaced most HOC and inheritance-style reuse.`,
      why: `Inheritance creates tight coupling and deep, fragile hierarchies. Composition keeps components small and flexible: a \`Card\` works with any content, and you can mix behaviours freely.`,
      analogy: `Composition is like a picture frame: the frame doesn't care which photo goes inside. Inheritance is like welding a photo into a frame — to change the photo, you must build a new frame.`,
      code: [
        {
          title: 'children, slots and specialisation',
          lang: 'jsx',
          code: `function Dialog({ title, children, footer }) {
  return (
    <div className="dialog">
      <h2>{title}</h2>
      <div className="body">{children}</div>   {/* generic content */}
      <div className="footer">{footer}</div>    {/* named "slot" */}
    </div>
  );
}

// Specialisation: a specific dialog built FROM the generic one
function DeleteDialog({ onConfirm }) {
  return (
    <Dialog title="Delete item?" footer={<button onClick={onConfirm}>Delete</button>}>
      <p>This action cannot be undone.</p>
    </Dialog>
  );
}`,
        },
        {
          title: 'Composition avoids prop drilling',
          lang: 'jsx',
          code: `// Instead of App -> Page -> Header -> Avatar passing "user" at every level:
function App({ user }) {
  return (
    <Page header={<Header right={<Avatar user={user} />} />} />
  );
}

function Page({ header }) { return <div>{header}<main>Content</main></div>; }
function Header({ right }) { return <header>Logo {right}</header>; }
function Avatar({ user }) { return <img src={user.avatar} alt={user.name} />; }`,
        },
      ],
      output: `\`DeleteDialog\` renders the generic \`Dialog\` with the title "Delete item?", a warning paragraph as children, and a Delete button in the footer slot. In the second example \`Page\` and \`Header\` never receive \`user\`; they just place the ready-made elements they are given.`,
      questions: [
        {
          q: 'Why does React prefer composition over inheritance?',
          a: 'Composition is more flexible and less coupled. Components can accept any content via `children` or props, and shared logic goes in custom hooks. Inheritance creates rigid class hierarchies.',
        },
        {
          q: 'How do you reuse logic between components without inheritance?',
          a: 'Custom hooks for logic; composition (children, slots) for UI. Older patterns: HOCs and render props.',
        },
        {
          q: 'How can composition reduce prop drilling?',
          a: 'Create the deeply needed element at the top where the data lives and pass the element down as `children` or a slot prop, so intermediate components don\'t need the data.',
        },
      ],
      spoken: `"React favours composition over inheritance. Instead of extending a base component, I build components that accept other components — through \`children\` or named slot props like \`header\` and \`footer\`. A generic \`Dialog\` can then be specialised by a \`DeleteDialog\` that just renders it with preset props. For sharing logic I use custom hooks. Composition also helps avoid prop drilling: I can create the element where the data lives and pass it down already built, so middle components don't need to know about that data."`,
      mistakes: [
        'Building class hierarchies like `class AdminButton extends Button` — hard to change and not idiomatic React.',
        'Reaching for Context immediately for prop drilling, when passing `children` would be simpler.',
        'Thinking `children` can only be text — it can be any JSX, an array, or even a function (render prop).',
        'Follow-up trap: "Is there any place React uses inheritance?" Only `extends React.Component` for class components — and you never extend your own components further.',
      ],
      takeaway: 'Reuse UI by nesting components (children and slots) and logic with custom hooks — not with inheritance.',
    },
    {
      id: 'virtual-dom',
      title: 'Virtual DOM',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A lightweight JavaScript copy of the UI that React compares between renders to apply only the needed real DOM changes.',
      what: `The **DOM** is the browser's tree of real page elements. Changing it is relatively slow because the browser may need to recalculate layout and repaint.

The **Virtual DOM** is a plain JavaScript object tree that **describes** what the UI should look like. When state changes:

1. React renders components and builds a **new** virtual tree.
2. It **compares** (diffs) it with the previous tree.
3. It applies only the **minimum** real DOM changes needed.

#### Deeper version
The term "Virtual DOM" is a bit of marketing — the React team now talks about **React elements** and the **Fiber tree**. The real benefit is not that it is "faster than the DOM" (hand-written DOM code can be faster); it is that you write **declarative** UI ("given this state, the UI looks like this") and React works out the efficient updates for you. The diffing step is called **reconciliation**, and the step that touches the DOM is the **commit** phase. Libraries like Svelte and Solid skip the virtual DOM entirely and compile to direct DOM updates, which shows it is one design choice, not the only way.`,
      why: `Manually tracking which DOM nodes to update after each change is error-prone. The virtual DOM lets you re-describe the whole UI on every change while React keeps real DOM work small and batched.`,
      analogy: `Imagine redecorating a room. Instead of moving heavy furniture around to test ideas, you draw the room on paper (virtual DOM), compare the new drawing with the old one, and then move only the furniture that actually changed (real DOM).`,
      code: [
        {
          title: 'Only the changed text node is updated',
          lang: 'jsx',
          code: `import { useState } from 'react';

function Clock() {
  const [count, setCount] = useState(0);

  return (
    <div className="box">            {/* unchanged: not touched */}
      <h1>Static title</h1>           {/* unchanged: not touched */}
      <p>Clicked {count} times</p>    {/* only this text node changes */}
      <button onClick={() => setCount(count + 1)}>Click</button>
    </div>
  );
}
// Open DevTools > Elements and click: only the number flashes as updated.`,
        },
        {
          title: 'What a "virtual" node looks like',
          lang: 'javascript',
          code: `// <p className="msg">Hi</p> becomes roughly:
const element = {
  type: 'p',
  props: { className: 'msg', children: 'Hi' },
  key: null,
};
console.log(typeof element); // "object" -> cheap to create and compare`,
        },
      ],
      output: `Every click re-runs \`Clock\` and creates a fresh virtual tree. React diffs it against the previous one, sees that only the number inside \`<p>\` changed, and updates just that one text node. In DevTools you will see only that number flash. The second block shows that a "virtual node" is just a small object.`,
      questions: [
        {
          q: 'What is the virtual DOM?',
          a: 'An in-memory tree of plain JavaScript objects describing the UI. React compares the new tree with the old one and applies only the differences to the real DOM.',
        },
        {
          q: 'Is the virtual DOM faster than the real DOM?',
          a: 'Not by itself — it adds work. Its value is letting you write declarative code while React batches and minimises real DOM operations, which is fast enough for most apps.',
        },
        {
          q: 'What is the difference between the virtual DOM and the shadow DOM?',
          a: 'The virtual DOM is a React concept for efficient updates. The shadow DOM is a browser feature (Web Components) for encapsulating styles and markup. They are unrelated.',
        },
      ],
      spoken: `"The virtual DOM is a lightweight JavaScript representation of the UI. When state changes, React re-renders the components into a new tree of elements, compares it with the previous one — that's reconciliation — and then commits only the minimal changes to the real DOM. The real benefit isn't that it beats hand-written DOM code; it's that I can write declarative UI and let React figure out the efficient updates. Internally, modern React represents this as the Fiber tree."`,
      mistakes: [
        'Saying "the virtual DOM makes React faster than plain JavaScript". It makes declarative UI fast enough; it is not magic speed.',
        'Confusing the virtual DOM with the shadow DOM.',
        'Thinking a re-render always means the DOM changes. Re-rendering creates a new virtual tree; the DOM is touched only if something differs.',
        'Follow-up trap: "If the virtual DOM is efficient, why do we need React.memo?" Because rendering components and diffing still cost CPU. Memo skips rendering a subtree entirely when props did not change.',
      ],
      takeaway: 'The virtual DOM is a JS description of the UI that React diffs to make minimal real DOM updates.',
    },
    {
      id: 'rules-of-hooks',
      title: 'Hooks Basics and the Rules of Hooks',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Hooks are functions starting with "use"; call them only at the top level of components or custom hooks, never conditionally.',
      what: `**Hooks** are special functions (names start with \`use\`) that let function components "hook into" React features: state (\`useState\`), side effects (\`useEffect\`), context (\`useContext\`), refs (\`useRef\`) and more.

There are two rules:
1. **Only call hooks at the top level.** Not inside \`if\`, loops, nested functions, or after an early \`return\`.
2. **Only call hooks from React functions** — function components or custom hooks, not from regular functions or class components.

#### Deeper version
React does not identify hooks by name. It stores them as an **ordered list** on the component's fiber, and on each render it matches the 1st call to slot 1, the 2nd to slot 2, and so on. If a hook is skipped in one render (because of an \`if\`), every later hook reads the wrong slot and state gets mixed up. The ESLint plugin \`eslint-plugin-react-hooks\` enforces both rules plus \`exhaustive-deps\` for dependency arrays. One exception: React 19's \`use()\` API can be called inside conditions and loops, because it is not stored by call order the same way — but it must still be called inside a component or hook.`,
      why: `Hooks replaced class components, HOCs and render props for most use cases. They let you reuse stateful logic through custom hooks and keep related logic together (subscribe + unsubscribe in one effect) instead of splitting it across lifecycle methods.`,
      analogy: `React reads your hooks like a teacher taking attendance by seat number, not by name. If one student skips their seat today, everybody after them is marked with the wrong name. So everyone must sit in the same seat, every day.`,
      code: [
        {
          title: 'Wrong vs right',
          lang: 'jsx',
          code: `import { useState, useEffect } from 'react';

// WRONG: conditional hook -> hook order changes between renders
function BadProfile({ userId }) {
  if (!userId) return null;           // early return BEFORE hooks
  const [user, setUser] = useState(null); // sometimes called, sometimes not
  return <p>{user?.name}</p>;
}

// RIGHT: all hooks first, conditions inside them or after them
function GoodProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userId) return;              // condition INSIDE the hook
    fetch(\`/api/users/\${userId}\`).then((r) => r.json()).then(setUser);
  }, [userId]);

  if (!userId) return null;           // early return AFTER hooks is fine
  return <p>{user?.name}</p>;
}`,
        },
      ],
      output: `\`BadProfile\` breaks when \`userId\` goes from empty to a value: the first render called zero hooks, the next calls one, and React throws "Rendered more hooks than during the previous render". \`GoodProfile\` always calls the same hooks in the same order and puts the condition inside the effect, so it works for every \`userId\`.`,
      questions: [
        {
          q: 'What are the rules of hooks?',
          a: 'Call hooks only at the top level (not in conditions, loops or nested functions) and only from function components or custom hooks.',
        },
        {
          q: 'Why can\'t hooks be called conditionally?',
          a: 'React tracks hooks by their call order in each render. Skipping one shifts all later hooks to the wrong stored state.',
        },
        {
          q: 'Which hooks do you use most?',
          a: '`useState`, `useEffect`, `useRef`, `useContext`, `useMemo`, `useCallback`, `useReducer`, plus custom hooks. React 18 added `useId`, `useTransition`, `useDeferredValue` and `useSyncExternalStore`.',
        },
        {
          q: 'How are the rules enforced?',
          a: 'By the `eslint-plugin-react-hooks` rules `rules-of-hooks` and `exhaustive-deps`. Keep them as errors in your lint config.',
        },
      ],
      spoken: `"Hooks are functions starting with \`use\` that let function components use React features like state, effects and context. There are two rules: call them only at the top level — never inside conditions, loops or after an early return — and only call them from components or custom hooks. The reason is that React doesn't know hooks by name; it tracks them by the order they're called. If the order changes between renders, state gets attached to the wrong hook. I rely on the ESLint hooks plugin to enforce this."`,
      mistakes: [
        'Putting an early `return` before some hooks. Move all hooks above any conditional return.',
        'Calling a hook inside an event handler or `useEffect` callback — those are nested functions.',
        'Disabling the `exhaustive-deps` lint rule instead of fixing the dependency problem.',
        'Follow-up trap: "Is there any hook-like API you can call in an if?" Yes, React 19\'s `use()` can be called conditionally, unlike normal hooks.',
      ],
      takeaway: 'Hooks are tracked by call order — always call them unconditionally at the top level.',
    },
    {
      id: 'component-lifecycle',
      title: 'Component Lifecycle (Classes vs Hooks)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Mount, update, unmount — class lifecycle methods and how each maps to hooks.',
      what: `Every component goes through three phases:

1. **Mounting** — it is created and added to the screen.
2. **Updating** — it re-renders because props, state or context changed.
3. **Unmounting** — it is removed from the screen.

Class components have a method for each moment. Function components use **\`useEffect\`** for all three:

- \`componentDidMount\` → \`useEffect(fn, [])\`
- \`componentDidUpdate\` → \`useEffect(fn, [deps])\`
- \`componentWillUnmount\` → the **cleanup** function returned from \`useEffect\`

#### Deeper version
The mapping is not exact. Effects run **after paint**, while \`componentDidMount\` runs before paint (like \`useLayoutEffect\`). Hooks encourage thinking in **synchronisation** ("keep this in sync with \`userId\`") rather than moments. Other class methods: \`shouldComponentUpdate\` → \`React.memo\`; \`getDerivedStateFromProps\` → calculate during render; \`getSnapshotBeforeUpdate\` and \`componentDidCatch\`/\`getDerivedStateFromError\` have **no hook equivalent** (error boundaries still need classes). Old methods like \`componentWillMount\` and \`componentWillReceiveProps\` are deprecated (prefixed \`UNSAFE_\`) because they are unsafe with concurrent rendering.`,
      why: `Interviewers ask this to check you understand what happens when, and that you can read and migrate older class-based codebases.`,
      analogy: `It's like a shop: opening day (mount), daily restocking (update), and closing down (unmount). In a class you have one staff member for each event; with hooks, one manager (\`useEffect\`) handles setup and teardown for each job.`,
      code: [
        {
          title: 'Class lifecycle vs the same logic with hooks',
          lang: 'jsx',
          code: `import { Component, useEffect } from 'react';

class ChatClass extends Component {
  componentDidMount() { connect(this.props.roomId); }
  componentDidUpdate(prevProps) {
    if (prevProps.roomId !== this.props.roomId) {
      disconnect(prevProps.roomId);
      connect(this.props.roomId);
    }
  }
  componentWillUnmount() { disconnect(this.props.roomId); }
  render() { return <h2>Room {this.props.roomId}</h2>; }
}

function ChatHooks({ roomId }) {
  useEffect(() => {
    connect(roomId);                     // mount + whenever roomId changes
    return () => disconnect(roomId);     // before next run + on unmount
  }, [roomId]);
  return <h2>Room {roomId}</h2>;
}

function connect(id) { console.log('connect', id); }
function disconnect(id) { console.log('disconnect', id); }`,
        },
      ],
      output: `Both components behave the same. Mounting with room "a" logs "connect a". Changing to room "b" logs "disconnect a" then "connect b". Unmounting logs "disconnect b". The hook version needs one effect instead of three methods, and you cannot forget the "update" case.`,
      questions: [
        {
          q: 'How do you replicate componentDidMount with hooks?',
          a: '`useEffect(() => { ... }, [])`. Note it runs after paint; if you need to run before paint (e.g. measuring DOM), use `useLayoutEffect`.',
        },
        {
          q: 'How do you replicate componentWillUnmount?',
          a: 'Return a cleanup function from `useEffect`. With `[]` deps it runs on unmount.',
        },
        {
          q: 'Which lifecycle features have no hook equivalent?',
          a: '`getSnapshotBeforeUpdate`, `componentDidCatch` and `getDerivedStateFromError`. Error boundaries still need class components.',
        },
        {
          q: 'What replaced shouldComponentUpdate?',
          a: '`React.memo` for function components (with an optional custom compare function), or `PureComponent` for classes.',
        },
      ],
      spoken: `"A component mounts, updates and unmounts. In classes we had \`componentDidMount\`, \`componentDidUpdate\` and \`componentWillUnmount\`. With hooks, one \`useEffect\` handles all three: it runs after mount, re-runs when dependencies change, and its cleanup runs before the next run and on unmount. It's not a perfect one-to-one mapping — effects run after paint — and I think in terms of synchronising with a value rather than lifecycle moments. Error boundaries are the one thing that still needs a class."`,
      mistakes: [
        'Saying `useEffect(fn, [])` is exactly `componentDidMount`. It runs after paint, and in StrictMode dev it runs twice.',
        'Forgetting the "update" case in classes (handling `roomId` changes) — a classic bug hooks make harder to write.',
        'Using deprecated `componentWillReceiveProps` in new code.',
        'Follow-up trap: "What is the order of effects between parent and child?" Children\'s effects run before the parent\'s, because React commits bottom-up.',
      ],
      takeaway: 'Mount/update/unmount map to one useEffect with deps and cleanup — but think "synchronise", not "lifecycle".',
    },
    {
      id: 'use-effect',
      title: 'useEffect',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Runs side effects (API calls, timers, subscriptions) after React has painted the screen, and cleans them up.',
      what: `\`useEffect\` is a React hook that lets you run code **after** a component renders. We use it for "side effects" — work that reaches outside React, like fetching data, starting a timer, or listening to window events.

It takes two things: a function to run, and a **dependency array** that tells React *when* to run it again.

#### Deeper version
React runs the effect after the browser paints. Before running the effect again (or when the component is removed), React calls the **cleanup** function you returned. React compares each dependency with \`Object.is\`; if none changed, the effect is skipped.`,
      why: `Rendering must stay "pure" — it should only calculate UI from props and state. Anything else (network, timers, DOM listeners) would run on every render and cause bugs. \`useEffect\` gives side effects a safe place to live, plus a cleanup step to avoid memory leaks and race conditions.`,
      analogy: `Think of a shop. Rendering is arranging the shelves. \`useEffect\` is the work you do **after** the shop opens — like turning on the music. The dependency array says "only change the music when the playlist changes". The cleanup is turning the old music off before playing a new song, or when the shop closes.`,
      code: [
        {
          title: 'Fetch data with cleanup',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
      .then((res) => res.json())
      .then(setUser)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    // Cleanup: cancel the old request if userId changes or we unmount
    return () => controller.abort();
  }, [userId]); // run again only when userId changes

  if (!user) return <p>Loading…</p>;
  return <h2>{user.name}</h2>;
}`,
        },
        {
          title: 'The three dependency patterns',
          lang: 'jsx',
          code: `useEffect(() => { /* runs after EVERY render */ });
useEffect(() => { /* runs ONCE after the first render */ }, []);
useEffect(() => { /* runs when a or b changes */ }, [a, b]);`,
        },
      ],
      output: `On the first render, React shows "Loading…", paints the screen, then runs the effect, which starts the fetch. When the data arrives, \`setUser\` causes a re-render that shows the name.

If \`userId\` changes from 1 to 2, React first runs the cleanup (aborting request 1), then runs the effect again for user 2. This prevents the old, slower response from overwriting the new one.`,
      questions: [
        {
          q: 'What does the dependency array do?',
          a: 'It tells React when to re-run the effect. No array: after every render. Empty `[]`: only after the first render. `[a, b]`: whenever `a` or `b` changes.',
        },
        {
          q: 'When does the cleanup function run?',
          a: 'Before the effect runs again (because a dependency changed) and when the component unmounts.',
        },
        {
          q: 'Why does my effect run twice in development?',
          a: 'React 18+ StrictMode mounts, unmounts and mounts again in development to help you find missing cleanups. It does not happen in production.',
        },
        {
          q: 'Can the effect function itself be async?',
          a: 'No, because an async function returns a Promise and React expects either nothing or a cleanup function. Define an async function inside the effect and call it.',
        },
      ],
      spoken: `"\`useEffect\` is where I put side effects — things like API calls, subscriptions and timers — so that rendering stays pure. It runs after React paints the screen. The dependency array controls when it re-runs: every render, only once with an empty array, or when specific values change. If the effect returns a function, React uses it as cleanup before the next run and on unmount. For example, when fetching data I use an AbortController and abort in the cleanup, so an old response can't overwrite a newer one."`,
      mistakes: [
        'Leaving out dependencies to "make it run once". This creates stale closures and bugs. Follow the lint rule.',
        'Putting objects or functions created during render in the dependency array — they are new every render, so the effect runs every time. Use `useMemo`/`useCallback` or move them inside the effect.',
        'Forgetting cleanup for subscriptions, intervals and event listeners, which causes memory leaks.',
        'Using `useEffect` to compute values from props/state. Just calculate them during render (or with `useMemo`).',
        'Follow-up trap: "useEffect vs useLayoutEffect?" `useLayoutEffect` runs before the browser paints, so use it only when you must measure the DOM to avoid a flicker.',
      ],
      takeaway: '`useEffect` syncs your component with the outside world after render — always get the dependencies right and always clean up.',
    },
    {
      id: 'use-ref',
      title: 'useRef',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A mutable box ({ current }) that survives re-renders without causing them — for DOM access and storing values.',
      what: `\`useRef\` gives you an object \`{ current: initialValue }\` that stays the **same object** for the whole life of the component.

Two main uses:
1. **Access a DOM element** — pass it as \`ref={myRef}\` and React puts the DOM node in \`myRef.current\` (focus an input, scroll, measure size).
2. **Store a value that should not cause a re-render** — a timer ID, the previous value, a "has this run" flag.

Changing \`ref.current\` does **not** re-render the component.

#### Deeper version
Think of state vs ref: **state** is for data that should appear on screen (changing it re-renders); a **ref** is an escape hatch for data React doesn't need to render. Don't read or write \`ref.current\` **during render** (except for lazy init) — the value can be out of sync with what's on screen, and it breaks purity. Read it in effects and event handlers. Refs are also used to avoid **stale closures**: keep the latest callback in a ref and read \`ref.current\` inside a long-lived interval. You can pass a **callback ref** (\`ref={(node) => ...}\`) to run code when the node attaches; in React 19 a callback ref may return a cleanup function. To ref a custom component, use \`forwardRef\` (React 18) or just the \`ref\` prop (React 19).`,
      why: `Some things are imperative (focus, scroll, media playback, third-party libraries) and some values must persist without triggering renders (timers, previous values). \`useRef\` handles both without fighting React.`,
      analogy: `A ref is like a sticky note on the back of your laptop. You can write on it and read it whenever you want, and it stays there between meetings, but writing on it doesn't make anyone redo the presentation (no re-render).`,
      code: [
        {
          title: 'Focus an input and store a timer id',
          lang: 'jsx',
          code: `import { useRef, useState } from 'react';

function Stopwatch() {
  const inputRef = useRef(null);      // DOM ref
  const intervalRef = useRef(null);   // value ref (no re-render on change)
  const [seconds, setSeconds] = useState(0);

  const start = () => {
    if (intervalRef.current) return;  // already running
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };
  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (
    <div>
      <input ref={inputRef} placeholder="Lap name" />
      <button onClick={() => inputRef.current.focus()}>Focus input</button>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}`,
        },
        {
          title: 'Remember the previous value',
          lang: 'jsx',
          code: `import { useEffect, useRef } from 'react';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; // runs AFTER render, so during render we still hold the old value
  }, [value]);
  return ref.current;
}

function Price({ price }) {
  const prev = usePrevious(price);
  return <p>Now ₹{price} (was ₹{prev ?? '-'})</p>;
}`,
        },
      ],
      output: `Clicking "Focus input" moves the cursor into the input without any re-render. "Start" saves the interval ID in \`intervalRef.current\`; the seconds count up because \`setSeconds\` re-renders. Clicking "Start" twice does not create two intervals thanks to the guard. "Stop" clears the interval using the saved ID.

\`Price\` with price 100 then 120 shows "Now ₹120 (was ₹100)".`,
      questions: [
        {
          q: 'What is the difference between useRef and useState?',
          a: 'Both persist across renders. Updating state triggers a re-render and the new value appears in the next render. Updating `ref.current` is immediate and does not re-render.',
        },
        {
          q: 'Why doesn\'t changing ref.current update the UI?',
          a: 'React doesn\'t track refs. It is just a mutable object; nothing tells React to re-render.',
        },
        {
          q: 'When is ref.current set for a DOM element?',
          a: 'During the commit phase, before layout effects and effects run. It is `null` during the first render and set back to `null` when the element unmounts.',
        },
        {
          q: 'What is a callback ref?',
          a: 'A function passed to `ref` that React calls with the DOM node when it attaches (and with `null` when it detaches, or it calls the returned cleanup in React 19). Useful for measuring a node as soon as it appears.',
        },
      ],
      spoken: `"\`useRef\` gives me a mutable object with a \`current\` property that stays the same across renders, and changing it does not trigger a re-render. I use it for two things: getting access to DOM elements, like focusing an input or measuring size, and storing values that shouldn't cause renders, like an interval ID or the previous value of a prop. The rule I follow is: if it's shown on screen, it's state; if it's just bookkeeping, it's a ref. I avoid reading or writing refs during render."`,
      mistakes: [
        'Using a ref for data that is displayed — the screen won\'t update when it changes.',
        'Reading `ref.current` of a DOM element during the first render — it is still `null`.',
        'Writing `ref.current = x` in the render body, which breaks purity and behaves oddly in concurrent rendering.',
        'Follow-up trap: "Can you put ref.current in a useEffect dependency array?" It won\'t work as expected — mutating a ref doesn\'t trigger a render, so the effect isn\'t re-checked. Use a callback ref or state instead.',
      ],
      takeaway: 'useRef = a persistent box that doesn\'t trigger renders — for DOM nodes and behind-the-scenes values.',
    },
    {
      id: 're-render-causes',
      title: 'What Causes a Re-render',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A component re-renders when its state changes, its parent re-renders, or a context it reads changes.',
      what: `A **re-render** means React calls your component function again to get fresh JSX. It happens when:

1. Its **state** changes (\`setState\` with a new value).
2. Its **parent re-renders** — by default **all children re-render too**, even if their props didn't change.
3. A **context** it reads with \`useContext\` changes value.
4. A custom hook it uses changes its internal state.

Note: **props changing is not a separate trigger.** Props only change because the parent re-rendered.

#### Deeper version
"Re-render" is not the same as "DOM update". React re-runs the function, diffs the result, and touches the DOM only if something differs. Re-renders become a problem only when they are **expensive** or **very frequent**. To limit them:
- **Move state down** close to where it's used, so fewer components re-render.
- **Pass components as \`children\`** — elements created by a parent that didn't re-render are the same objects, so React skips them.
- **\`React.memo\`** to skip a child whose props are shallowly equal, plus \`useMemo\`/\`useCallback\` to keep those props stable.
- **Split contexts** so consumers only subscribe to what they need.
Use the **React DevTools Profiler** ("Highlight updates when components render" and "Why did this render?") to find causes.`,
      why: `Most React performance problems come from unnecessary re-renders. Knowing the exact triggers lets you fix them with structure rather than sprinkling \`useMemo\` everywhere.`,
      analogy: `When a team lead (parent) calls a meeting, everyone on the team (children) has to show up, even if the topic doesn't concern them. \`React.memo\` is like a team member who checks the agenda first and skips the meeting if nothing relevant changed.`,
      code: [
        {
          title: 'Parent re-render re-renders children; moving state down fixes it',
          lang: 'jsx',
          code: `import { useState } from 'react';

function SlowChart() {
  console.log('SlowChart rendered'); // imagine heavy work here
  return <div>📈 chart</div>;
}

// BEFORE: typing re-renders SlowChart on every keystroke
function DashboardBefore() {
  const [query, setQuery] = useState('');
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <SlowChart />
    </>
  );
}

// AFTER: state moved into its own component -> SlowChart is not re-rendered
function SearchBox() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
function DashboardAfter() {
  return (
    <>
      <SearchBox />
      <SlowChart />
    </>
  );
}`,
        },
      ],
      output: `In \`DashboardBefore\`, typing "abc" logs "SlowChart rendered" three extra times, because the state lives in the parent and every parent render re-renders all children. In \`DashboardAfter\`, only \`SearchBox\` re-renders while you type; "SlowChart rendered" is logged only once on mount. No \`memo\` needed — just better state placement.`,
      questions: [
        {
          q: 'What triggers a re-render in React?',
          a: 'A state change in the component, its parent re-rendering, or a change in a context it consumes. Props changes happen only as a result of the parent re-rendering.',
        },
        {
          q: 'Does a child re-render if its props did not change?',
          a: 'Yes, by default. When a parent renders, all its children render too. `React.memo` makes a child skip rendering when its props are shallowly equal.',
        },
        {
          q: 'Is a re-render the same as a DOM update?',
          a: 'No. A re-render calls the component and diffs the output; the DOM is only updated if something changed.',
        },
        {
          q: 'How do you find out why a component re-rendered?',
          a: 'React DevTools Profiler (with "Record why each component rendered"), highlight updates, or a temporary `console.log`. Libraries like why-did-you-render also help.',
        },
      ],
      spoken: `"A component re-renders for three reasons: its own state changed, its parent re-rendered, or a context it reads changed. A common misconception is that props changing triggers it — but props only change because the parent rendered, and by default children re-render even if their props are identical. A re-render isn't necessarily a DOM update; React diffs and commits only differences. When re-renders are costly, I first move state down or pass components as children, and only then reach for React.memo with stable props."`,
      mistakes: [
        'Believing a child re-renders only when its props change. Without `memo`, it re-renders whenever the parent does.',
        'Wrapping everything in `useMemo`/`useCallback` without `React.memo` on the child — the stable props don\'t help anyone.',
        'Putting fast-changing state (like mouse position or input text) high up in the tree.',
        'Follow-up trap: "Does calling setState with the same value re-render?" React bails out if `Object.is` says it is the same, though it may run the component once more before bailing out.',
      ],
      takeaway: 'State, parent render and context trigger re-renders — fix waste with state placement first, memo second.',
    },
    {
      id: 'reconciliation',
      title: 'Reconciliation and the Diffing Algorithm',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'How React compares the old and new element trees to decide the smallest set of DOM changes.',
      what: `**Reconciliation** is the process React uses to compare the previous UI tree with the new one and decide what to change in the real DOM.

Comparing two trees perfectly is very slow (roughly O(n³)). React uses two simple rules (**heuristics**) to do it in O(n) — linear time:

1. **Different type → replace.** If an element changes type (\`<div>\` → \`<span>\`, or \`<Login>\` → \`<Signup>\`), React destroys the old subtree (state lost) and builds a new one.
2. **Keys identify children.** In lists, React matches old and new children by \`key\`, so it can reuse and move them instead of recreating them.

If the type is the same, React keeps the DOM node / component instance and only updates the changed attributes or props.

#### Deeper version
State is tied to a component's **position in the tree** (type + position + key), not to the variable name or JSX line. That explains several "surprises":
- Rendering \`<Counter />\` in both branches of a ternary at the same spot **keeps** its state.
- Defining a component inside another creates a **new type** on each render, so it remounts every time.
- Changing a \`key\` forces a remount — a clean way to reset a form.

In modern React, reconciliation happens on **Fiber** nodes during the **render phase** (interruptible), and the resulting changes are applied in the **commit phase** (synchronous).`,
      why: `Knowing these rules explains why keys matter, why state "resets" unexpectedly, and how to structure components so React can reuse as much as possible.`,
      analogy: `Imagine checking two versions of a building plan. If a room changed from "kitchen" to "bedroom", you rebuild that room. If it's still a kitchen with a new colour, you just repaint. Rooms have name plates (keys), so if they were reordered, you move them instead of rebuilding.`,
      code: [
        {
          title: 'Same type keeps state, different type resets it',
          lang: 'jsx',
          code: `import { useState } from 'react';

function Counter({ label }) {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{label}: {n}</button>;
}

export default function App() {
  const [isVip, setIsVip] = useState(false);
  return (
    <>
      <label>
        <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} /> VIP
      </label>

      {/* Same type, same position -> state is KEPT when toggling */}
      {isVip ? <Counter label="VIP" /> : <Counter label="Guest" />}

      {/* Different key -> treated as a new component -> state RESETS */}
      {isVip ? <Counter key="vip" label="VIP2" /> : <Counter key="guest" label="Guest2" />}

      {/* Different wrapper type -> subtree destroyed -> state RESETS */}
      {isVip ? <div><Counter label="A" /></div> : <section><Counter label="A" /></section>}
    </>
  );
}`,
        },
      ],
      output: `Click each button a few times, then toggle VIP. The first counter keeps its number (only the label changes) because it is the same component type at the same position. The second resets to 0 because the key changed. The third also resets to 0 because its parent changed from \`<section>\` to \`<div>\`, so React threw away the whole subtree.`,
      questions: [
        {
          q: 'What is reconciliation?',
          a: 'React\'s process of diffing the new element tree against the previous one to work out the minimal DOM updates.',
        },
        {
          q: 'What assumptions does the diffing algorithm make?',
          a: 'Elements of different types produce different trees (so replace them), and keys identify stable children across renders. This makes the diff O(n).',
        },
        {
          q: 'Why does my component\'s state reset unexpectedly?',
          a: 'Usually because its type or position changed — a different parent element, a component defined inside another component, or a changed key.',
        },
        {
          q: 'What are the render and commit phases?',
          a: 'Render phase: React calls components and diffs (pure, can be paused or restarted in concurrent mode). Commit phase: React applies DOM changes, sets refs and runs layout effects (synchronous, cannot be interrupted).',
        },
      ],
      spoken: `"Reconciliation is how React compares the new tree of elements with the previous one and figures out the minimum DOM changes. A full tree diff would be O(n cubed), so React uses two heuristics to make it linear: if the element type changes, it throws away the old subtree and builds a new one; and in lists it uses keys to match children. State is tied to the component's type and position in the tree, which is why changing a parent tag or a key resets state. The work happens in the render phase, and DOM changes are applied in the commit phase."`,
      mistakes: [
        'Thinking state belongs to the JSX line or variable. It belongs to the position and type in the tree.',
        'Declaring components inside other components, which makes a new type every render and remounts the child.',
        'Using unstable keys, which forces remounts and loses state.',
        'Follow-up trap: "Is reconciliation the same as Fiber?" No. Reconciliation is the diffing idea; Fiber is the engine (data structure and scheduler) that performs it incrementally since React 16.',
      ],
      takeaway: 'Same type + same position (+ same key) = reused; anything else = rebuilt.',
    },
    {
      id: 'react-memo',
      title: 'React.memo',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Wraps a component so it skips re-rendering when its props are shallowly equal to last time.',
      what: `\`React.memo\` is a **higher-order component** that remembers (memoizes) a component's last output. When the parent re-renders, React compares the new props with the old ones. If all props are the **same**, React skips rendering the child and reuses the previous result.

\`const UserRow = memo(function UserRow({ user }) { ... });\`

#### Deeper version
The comparison is **shallow**: each prop is compared with \`Object.is\`. Primitives (\`'a' === 'a'\`) compare by value, but objects, arrays and functions compare by **reference**. So \`<Row style={{ color: 'red' }} onClick={() => ...} />\` creates new references each render and **breaks** memo. Fix it with \`useMemo\` for objects/arrays and \`useCallback\` for functions, or move constants outside the component. \`children\` passed as JSX is also a new object each render, so memo rarely helps components that take children. You can pass a custom compare function as the second argument: \`memo(Comp, (prev, next) => prev.id === next.id)\` — return \`true\` to **skip** the render. Memo does **not** stop re-renders from the component's own state or from context it reads. The **React Compiler** can add this kind of memoization automatically in projects that enable it.`,
      why: `In big lists, dashboards and charts, a parent update (like typing in a search box) can re-render hundreds of children. \`memo\` lets unchanged children skip that work.`,
      analogy: `\`React.memo\` is like a student who keeps last week's homework. If the teacher gives exactly the same question again, the student hands in the old answer instead of solving it again. But if the question paper is reprinted (a new object), the student thinks it's a new question — even if the words are the same.`,
      code: [
        {
          title: 'memo works only with stable props',
          lang: 'jsx',
          code: `import { memo, useCallback, useState } from 'react';

const TodoItem = memo(function TodoItem({ item, onToggle }) {
  console.log('render', item.text);
  return (
    <li onClick={() => onToggle(item.id)}>
      {item.done ? '✅' : '⬜'} {item.text}
    </li>
  );
});

export default function TaskList() {
  const [items, setItems] = useState([
    { id: 1, text: 'Write tests', done: false },
    { id: 2, text: 'Deploy', done: false },
  ]);
  const [filter, setFilter] = useState('');

  // Stable function reference -> memo can skip unchanged rows
  const onToggle = useCallback((id) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  return (
    <>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ul>
        {items.map((item) => <TodoItem key={item.id} item={item} onToggle={onToggle} />)}
      </ul>
    </>
  );
}`,
        },
      ],
      output: `On mount both rows log "render". Typing in the filter input re-renders \`TaskList\` but logs nothing, because each \`item\` object and \`onToggle\` are the same references, so \`memo\` skips both rows. Clicking "Deploy" logs only "render Deploy" — the map creates a new object just for that item; "Write tests" keeps its old object and is skipped. Without \`useCallback\`, every keystroke would re-render every row.`,
      questions: [
        {
          q: 'What does React.memo do?',
          a: 'It skips re-rendering a component when its props are shallowly equal to the previous props.',
        },
        {
          q: 'Why might React.memo not work?',
          a: 'Because a prop is a new object, array or function each render (inline `{}` / `() => {}`), or the component re-renders due to its own state or a context change.',
        },
        {
          q: 'What is the second argument of memo?',
          a: 'A custom `arePropsEqual(prev, next)` function. Return `true` to skip the render. Use carefully — wrong comparisons cause stale UI.',
        },
        {
          q: 'Should you wrap every component in memo?',
          a: 'No. Comparing props costs time and memory, and it adds complexity. Use it for components that render often with the same props and are expensive, after measuring.',
        },
      ],
      spoken: `"\`React.memo\` wraps a component and skips its re-render when the new props are shallowly equal to the old ones. Shallow means each prop is compared by reference, so it only works if objects and functions passed in are stable — that's where \`useMemo\` and \`useCallback\` come in. It doesn't block re-renders from the component's own state or context. I don't wrap everything; I use it after profiling, typically for list rows, charts or heavy components whose parent updates often."`,
      mistakes: [
        'Wrapping a component in `memo` but passing inline objects or arrow functions — memo never skips.',
        'Expecting `memo` to stop re-renders caused by context or the component\'s own state.',
        'Writing a custom comparator that ignores a changing prop (like a callback), causing stale UI.',
        'Follow-up trap: "React.memo vs useMemo?" `React.memo` memoizes a whole component\'s render based on props; `useMemo` memoizes a value inside a component.',
      ],
      takeaway: 'React.memo skips renders on shallow-equal props — useless unless the props are stable.',
    },
    {
      id: 'use-memo',
      title: 'useMemo',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Caches the result of a calculation between renders and recomputes it only when dependencies change.',
      what: `\`useMemo\` remembers the **result** of a calculation so React doesn't redo it on every render.

\`const visible = useMemo(() => filterTodos(todos, tab), [todos, tab]);\`

React runs the function on the first render. On later renders, if \`todos\` and \`tab\` are the same (compared with \`Object.is\`), it returns the cached result instead of running it again.

Two main uses:
1. **Skip expensive calculations** (filtering/sorting thousands of items, heavy maths).
2. **Keep a stable reference** for an object or array that is passed to a \`memo\` child or used in a dependency array.

#### Deeper version
\`useMemo\` is a **performance hint**, not a guarantee — React may throw the cache away (for example, for offscreen content), so your code must still be correct without it. It has a cost: storing the value and comparing deps on every render. For cheap calculations (adding numbers, mapping 20 items) it is usually not worth it. To decide, measure with \`console.time\` or the Profiler; a common rule of thumb is that work taking about **1ms or more** may be worth memoizing. The function must be **pure** — no side effects inside. With the **React Compiler** enabled, a lot of manual \`useMemo\` becomes unnecessary.`,
      why: `Without it, every keystroke in an unrelated input could re-sort a 10,000-row table. It also prevents effects and memoized children from re-running just because an object was recreated.`,
      analogy: `\`useMemo\` is like a calculator with a memory button. If you ask the same sum with the same numbers, it shows the saved answer. Change any number and it calculates again.`,
      code: [
        {
          title: 'Skip an expensive filter + stable object',
          lang: 'jsx',
          code: `import { useMemo, useState } from 'react';

function ProductTable({ products }) {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Recomputed only when products or search change — NOT when darkMode toggles
  const filtered = useMemo(() => {
    console.log('filtering…');
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.price - b.price);
  }, [products, search]);

  // Stable object reference for a memoized child or an effect dependency
  const tableStyle = useMemo(() => ({ background: darkMode ? '#111' : '#fff' }), [darkMode]);

  return (
    <div style={tableStyle}>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <button onClick={() => setDarkMode((d) => !d)}>Toggle theme</button>
      <p>{filtered.length} products</p>
    </div>
  );
}`,
        },
      ],
      output: `"filtering…" is logged on mount and every time you type in the search box. Toggling the theme re-renders the component but does **not** log "filtering…", because \`products\` and \`search\` didn't change, so the cached array is returned. \`tableStyle\` keeps the same object until \`darkMode\` changes.`,
      questions: [
        {
          q: 'What does useMemo do?',
          a: 'It caches a computed value and recalculates it only when one of its dependencies changes.',
        },
        {
          q: 'useMemo vs useCallback?',
          a: '`useMemo` caches the **result** of calling a function. `useCallback` caches the **function itself**. `useCallback(fn, deps)` is the same as `useMemo(() => fn, deps)`.',
        },
        {
          q: 'When should you NOT use useMemo?',
          a: 'For cheap calculations, or values not passed to memoized children or dependency arrays. The overhead and complexity outweigh the benefit.',
        },
        {
          q: 'Can you rely on useMemo to only run once?',
          a: 'No. It is a performance optimisation; React may discard the cache. Never put side effects or "run once" logic in it.',
        },
      ],
      spoken: `"\`useMemo\` caches the result of a calculation between renders and only recomputes it when its dependencies change. I use it for two reasons: to skip genuinely expensive work, like filtering and sorting a big list, and to keep a stable reference for an object or array that I pass to a memoized child or put in an effect's dependency array. I don't use it for cheap things because it has its own cost. And it's only a hint, so the code must still work correctly without it."`,
      mistakes: [
        'Memoizing trivial calculations everywhere, adding noise and overhead.',
        'Missing dependencies, so the cached value is stale.',
        'Putting side effects (API calls, setState) inside `useMemo`. That belongs in an effect or event handler.',
        'Follow-up trap: "Is useMemo a semantic guarantee?" No — the docs call it a performance optimisation; React may recompute it, so correctness must not depend on it.',
      ],
      takeaway: 'useMemo caches a computed value by its deps — use it for expensive work and stable references, not everything.',
    },
    {
      id: 'use-callback',
      title: 'useCallback',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Returns the same function reference between renders until its dependencies change.',
      what: `In JavaScript, every time a component renders, functions defined inside it are **brand-new functions** (new references), even if the code is identical.

\`useCallback\` keeps the **same function** between renders until a dependency changes:

\`const handleSave = useCallback(() => save(id), [id]);\`

It is useful only when the function's **identity matters**:
1. It is passed to a child wrapped in \`React.memo\`.
2. It is used in a dependency array of \`useEffect\`, \`useMemo\` or another \`useCallback\`.
3. It is returned from a custom hook that others may use in dependency arrays.

#### Deeper version
\`useCallback\` does **not** make the function faster, and it does not stop the inline function from being created each render — React just throws away the new one and returns the cached one. Without a memoized consumer, it is pure overhead. A common trap is a **stale closure**: if you leave a value out of deps, the cached function keeps reading the old value. Use the **updater form** of setState to drop state from deps (\`setCount(c => c + 1)\` needs \`[]\`). For "always latest value but stable identity" (event-like callbacks inside effects), React 19.2 added \`useEffectEvent\`; check the current docs for its status in your version.`,
      why: `Without it, a new function every render breaks \`React.memo\` on children and makes effects that depend on the function re-run every time (sometimes in an infinite loop).`,
      analogy: `It's like giving a friend your phone number. If you get a new number every day (a new function each render), your friend has to update their contacts every day (the child re-renders). \`useCallback\` keeps the same number until something important changes.`,
      code: [
        {
          title: 'Stable callback for a memoized child',
          lang: 'jsx',
          code: `import { memo, useCallback, useState } from 'react';

const SaveButton = memo(function SaveButton({ onSave }) {
  console.log('SaveButton rendered');
  return <button onClick={onSave}>Save</button>;
});

export default function Editor({ docId }) {
  const [text, setText] = useState('');

  // Same function until docId changes; text read via a parameter, not closure
  const handleSave = useCallback(() => {
    console.log('saving doc', docId);
  }, [docId]);

  return (
    <>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <SaveButton onSave={handleSave} />
    </>
  );
}`,
        },
        {
          title: 'Function used inside an effect',
          lang: 'jsx',
          code: `import { useCallback, useEffect, useState } from 'react';

function Results({ query }) {
  const [data, setData] = useState([]);

  const load = useCallback(async () => {
    const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
    setData(await res.json());
  }, [query]); // new function only when query changes

  useEffect(() => {
    load();
  }, [load]); // safe: does not re-run on every render

  return <p>{data.length} results</p>;
}`,
        },
      ],
      output: `In the first example, typing in the textarea re-renders \`Editor\`, but "SaveButton rendered" is logged only once, because \`handleSave\` is the same reference and \`SaveButton\` is memoized. In the second, the effect runs once on mount and again only when \`query\` changes. Without \`useCallback\`, \`load\` would be new every render, the effect would run after every render, and \`setData\` would cause an endless loop.`,
      questions: [
        {
          q: 'What problem does useCallback solve?',
          a: 'It keeps a function\'s reference stable between renders, so memoized children don\'t re-render and effects that depend on the function don\'t re-run needlessly.',
        },
        {
          q: 'Does useCallback improve performance by itself?',
          a: 'No. It only helps when something compares the function by reference (a `memo` child or a dependency array). Otherwise it adds overhead.',
        },
        {
          q: 'How can useCallback cause a stale closure?',
          a: 'If a value used inside is missing from the deps, the cached function keeps the value from the render it was created in. Include all deps, or use the updater form / a ref.',
        },
        {
          q: 'How would you write useCallback using useMemo?',
          a: '`useMemo(() => fn, deps)` — returning the function instead of calling it.',
        },
      ],
      spoken: `"Every render creates new function instances, so a callback passed to a child is a new reference each time. \`useCallback\` returns the same function until its dependencies change. It only matters when someone cares about the reference — a child wrapped in \`React.memo\`, or a \`useEffect\` that lists the function as a dependency. On its own it doesn't speed anything up. I make sure the dependency array is complete to avoid stale closures, and I use the functional updater form of setState so I can keep the deps small."`,
      mistakes: [
        'Wrapping every handler in `useCallback` "for performance" with no memoized consumer.',
        'Leaving state out of deps to keep the function stable, then reading stale state.',
        'Using `useCallback` on a child that is not wrapped in `memo` and expecting fewer renders.',
        'Follow-up trap: "Does useCallback prevent the function from being created?" No — the inline function is still created every render; React just returns the cached one.',
      ],
      takeaway: 'useCallback keeps a function\'s identity stable — only useful when a memo child or dependency array cares.',
    },
    {
      id: 'use-reducer',
      title: 'useReducer',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Manages complex state with a pure reducer function: dispatch actions, get the next state.',
      what: `\`useReducer\` is an alternative to \`useState\` for **complex state logic**. Instead of calling setters directly, you **dispatch actions** that describe what happened, and a **reducer** function decides the new state.

\`const [state, dispatch] = useReducer(reducer, initialState);\`

- A **reducer** is a pure function: \`(state, action) => newState\`.
- An **action** is usually an object like \`{ type: 'added', item }\`.
- All update logic lives in one place, outside the component.

#### Deeper version
Choose \`useReducer\` when the next state depends on the previous one in many ways, when several values change together (e.g. \`status\`, \`data\`, \`error\`), or when the update logic is big enough to test on its own. The reducer must be **pure** and **immutable** — return a new object, never mutate. \`dispatch\` is **stable** (same identity every render), so it's safe to pass down or put in deps without \`useCallback\`. \`useReducer\` + Context is a common "mini Redux" pattern: put \`state\` in one context and \`dispatch\` in another so components that only dispatch don't re-render on state changes. You can pass a third argument \`init\` for lazy initialisation.`,
      why: `With many \`useState\` calls and setters spread across handlers, it's easy to create impossible states (like \`loading: true\` and \`error\` at the same time). A reducer centralises transitions, makes them predictable and easy to unit-test.`,
      analogy: `A reducer is like a bank teller. You don't change your balance yourself; you hand over a slip ("deposit ₹500"). The teller follows fixed rules and gives you the new balance. Every change goes through the same window, so it's easy to audit.`,
      code: [
        {
          title: 'Shopping cart reducer',
          lang: 'jsx',
          code: `import { useReducer } from 'react';

const initialState = { items: [], coupon: null };

function cartReducer(state, action) {
  switch (action.type) {
    case 'added': {
      const exists = state.items.find((i) => i.id === action.item.id);
      const items = exists
        ? state.items.map((i) => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state.items, { ...action.item, qty: 1 }];
      return { ...state, items };
    }
    case 'removed':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'couponApplied':
      return { ...state, coupon: action.code };
    default:
      throw new Error(\`Unknown action: \${action.type}\`);
  }
}

export default function Cart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div>
      <button onClick={() => dispatch({ type: 'added', item: { id: 1, name: 'Book', price: 300 } })}>
        Add book
      </button>
      <button onClick={() => dispatch({ type: 'removed', id: 1 })}>Remove book</button>
      <p>Items: {state.items.length} · Total: ₹{total}</p>
    </div>
  );
}`,
        },
      ],
      output: `Clicking "Add book" twice dispatches two \`added\` actions: the first adds the book with \`qty: 1\`, the second increases it to 2. The screen shows "Items: 1 · Total: ₹600". "Remove book" filters it out and shows "Items: 0 · Total: ₹0". An unknown action type throws an error, which catches typos early.`,
      questions: [
        {
          q: 'When do you choose useReducer over useState?',
          a: 'When state is complex (objects with related fields), the next state depends on the previous in many ways, or you want update logic centralised and testable outside the component.',
        },
        {
          q: 'What makes a good reducer?',
          a: 'It is pure (no API calls, no randomness), returns new objects instead of mutating, and handles every action type (throwing or returning state for unknown ones).',
        },
        {
          q: 'Is dispatch stable?',
          a: 'Yes. `dispatch` has the same identity for the life of the component, so you can pass it down or omit it from deps safely.',
        },
        {
          q: 'useReducer + Context vs Redux?',
          a: 'useReducer + Context works for moderate shared state. Redux Toolkit adds middleware, DevTools time travel, selectors that avoid unnecessary re-renders, and a well-known structure for large apps.',
        },
      ],
      spoken: `"\`useReducer\` is for state with complex update logic. Instead of calling setters all over the component, I dispatch actions like \`{ type: 'added', item }\`, and a pure reducer function takes the current state and the action and returns the new state. All transitions live in one place, which avoids impossible states and is easy to unit-test. \`dispatch\` is stable, so I can pass it down freely. For app-wide state I sometimes pair it with Context, or move to Redux Toolkit or Zustand when it grows."`,
      mistakes: [
        'Mutating state inside the reducer (`state.items.push(...)`) and returning the same object.',
        'Doing side effects (fetch, localStorage) in the reducer. Do them in event handlers or effects and dispatch the result.',
        'Forgetting to return state in some branch, so state becomes `undefined`.',
        'Follow-up trap: "Why does my reducer run twice in development?" StrictMode calls reducers twice to detect impurity. A pure reducer gives the same result, so it is harmless.',
      ],
      takeaway: 'useReducer moves complex state transitions into one pure, testable function driven by actions.',
    },
    {
      id: 'context-api',
      title: 'Context API and useContext',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Shares a value with any component deep in the tree without passing props through every level.',
      what: `**Context** lets a parent make a value available to **every component below it**, no matter how deep, without passing props through each level (prop drilling).

Three steps:
1. **Create** it: \`const ThemeContext = createContext('light');\`
2. **Provide** a value: \`<ThemeContext.Provider value={theme}>...</ThemeContext.Provider>\` (in React 19 you can also write \`<ThemeContext value={theme}>\`).
3. **Read** it anywhere below: \`const theme = useContext(ThemeContext);\`

Good fits: theme, logged-in user, language, feature flags — data that many components need and that changes rarely.

#### Deeper version
When the Provider's \`value\` changes (compared with \`Object.is\`), **every component that reads that context re-renders**, even if it only uses one field, and \`React.memo\` cannot stop it. Two common performance fixes:
- **Memoize the value**: \`value={useMemo(() => ({ user, login }), [user])}\` — otherwise a new object every render re-renders all consumers.
- **Split contexts**: separate fast-changing data from stable data (e.g. \`StateContext\` and \`DispatchContext\`).

Context is a **transport** mechanism, not a state manager — the state still lives in \`useState\`/\`useReducer\`. For frequently changing global state used by many components, a store with **selectors** (Zustand, Redux Toolkit, Jotai) avoids re-rendering everyone. If no Provider is above, \`useContext\` returns the **default value** given to \`createContext\`.`,
      why: `Passing \`user\` through 6 components that don't use it is noisy and fragile. Context gives deep components direct access to shared data.`,
      analogy: `Context is like Wi-Fi in a house. The router (Provider) broadcasts the signal, and any device in any room (component) can connect to it directly — no need to run a cable through every room. But when the router restarts (value changes), every connected device notices.`,
      code: [
        {
          title: 'Auth context with a custom hook',
          lang: 'jsx',
          code: `import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Memoize so consumers don't re-render on every AuthProvider render
  const value = useMemo(
    () => ({
      user,
      login: (name) => setUser({ name }),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook: nicer API + clear error if the Provider is missing
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function Navbar() {
  const { user, login, logout } = useAuth();
  return user
    ? <button onClick={logout}>Logout {user.name}</button>
    : <button onClick={() => login('Asha')}>Login</button>;
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
    </AuthProvider>
  );
}`,
        },
      ],
      output: `At first \`user\` is \`null\`, so \`Navbar\` shows "Login". Clicking it calls \`login('Asha')\` from context, which updates state in \`AuthProvider\`. A new \`value\` is created (because \`user\` changed), every consumer re-renders, and the button now shows "Logout Asha". If you used \`useAuth()\` outside the provider, you'd get a clear error instead of a confusing \`undefined\`.`,
      questions: [
        {
          q: 'What problem does Context solve?',
          a: 'Prop drilling — passing data through many intermediate components that don\'t need it.',
        },
        {
          q: 'What happens when a context value changes?',
          a: 'All components that read that context with `useContext` re-render, even if wrapped in `React.memo` and even if they use a part of the value that didn\'t change.',
        },
        {
          q: 'Is Context a replacement for Redux?',
          a: 'Not exactly. Context only passes values down; it has no selectors, middleware or DevTools. It\'s great for low-frequency global data. For complex or frequently-updated global state, use Redux Toolkit, Zustand or similar.',
        },
        {
          q: 'How do you optimise Context performance?',
          a: 'Memoize the provider value, split contexts by update frequency (e.g. state vs dispatch), keep providers as low as possible, or use a store with selectors.',
        },
      ],
      spoken: `"Context lets me share data like the current user or theme with any component below a Provider, without prop drilling. I create a context, wrap part of the tree in a Provider with a value, and read it with \`useContext\` — usually through a small custom hook like \`useAuth\` that throws if the provider is missing. The catch is performance: when the value changes, every consumer re-renders. So I memoize the value, split contexts by how often they change, and for fast-changing global state I use something like Zustand or Redux Toolkit with selectors."`,
      mistakes: [
        'Passing a new object literal as `value` every render, re-rendering all consumers.',
        'Putting all global state in one giant context, so any change re-renders the whole app.',
        'Using Context for state that changes very frequently (like mouse position or a text input).',
        'Follow-up trap: "Does React.memo stop a context consumer from re-rendering?" No. Context updates bypass memo for components that read the context.',
      ],
      takeaway: 'Context removes prop drilling for rarely-changing shared data — memoize the value and split contexts to avoid mass re-renders.',
    },
    {
      id: 'custom-hooks',
      title: 'Custom Hooks',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Your own functions starting with "use" that bundle hooks to reuse stateful logic between components.',
      what: `A **custom hook** is a normal JavaScript function whose name starts with \`use\` and which calls other hooks inside. It lets you **extract and reuse logic** — not UI — across components.

Examples: \`useFetch\`, \`useDebounce\`, \`useLocalStorage\`, \`useOnlineStatus\`, \`useAuth\`.

The name must start with \`use\` so React (and the lint plugin) know the rules of hooks apply.

#### Deeper version
Custom hooks share **logic, not state**. Two components that call \`useCounter()\` each get their **own independent** state — the hook's code just runs inside each component. To share the same data, lift it up or use Context/a store. Hooks re-run on every render of the component that uses them, so they should be fast and their returned functions are often wrapped in \`useCallback\` so consumers can put them in deps. Custom hooks replaced most **HOCs** and **render props** because they don't add wrapper components to the tree and don't collide on prop names. Test them with \`renderHook\` from React Testing Library.`,
      why: `Without custom hooks you copy the same \`useState\` + \`useEffect\` boilerplate (loading, error, cleanup) into many components. A custom hook writes it once, gives it a clear name, and makes components shorter and easier to read.`,
      analogy: `A custom hook is like a recipe card. Two cooks can follow the same recipe, but each makes their own dish in their own kitchen. Sharing the recipe doesn't mean sharing the food.`,
      code: [
        {
          title: 'useDebounce + useLocalStorage',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // reset the timer if value changes quickly
  }, [value, delay]);
  return debounced;
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// Usage
function Search() {
  const [query, setQuery] = useLocalStorage('lastQuery', '');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) console.log('Search API for', debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`,
        },
      ],
      output: `Typing "react" quickly updates \`query\` on every key (and saves it to localStorage), but the debounced value updates only 500ms after you stop typing, so "Search API for react" is logged **once** instead of five times. Refreshing the page restores "react" in the input from localStorage.`,
      questions: [
        {
          q: 'What is a custom hook?',
          a: 'A function whose name starts with `use` and that calls other hooks, used to reuse stateful logic across components.',
        },
        {
          q: 'Do two components using the same custom hook share state?',
          a: 'No. Each call gets its own independent state. To share state, use Context, a store, or lift state up.',
        },
        {
          q: 'Why must the name start with "use"?',
          a: 'So React tooling (lint rules, DevTools) knows it is a hook and the rules of hooks apply inside it.',
        },
        {
          q: 'Custom hooks vs HOCs and render props?',
          a: 'Hooks reuse logic without adding wrapper components, avoid prop name collisions and "wrapper hell", and are easier to type and compose.',
        },
      ],
      spoken: `"A custom hook is just a function starting with \`use\` that calls other hooks. I use them to pull reusable logic out of components — things like \`useDebounce\`, \`useLocalStorage\`, \`useAuth\` or a data-fetching hook. An important detail is that hooks share logic, not state: two components calling the same hook each get their own state. Custom hooks mostly replaced HOCs and render props because they don't add extra components to the tree. I test them with \`renderHook\` from React Testing Library."`,
      mistakes: [
        'Expecting two components using the same hook to share data.',
        'Naming a function `useSomething` that calls no hooks (misleading) or a hook-using function without the `use` prefix (lint can\'t check it).',
        'Returning new objects/functions every render from a hook, which breaks consumers\' memoization and deps.',
        'Follow-up trap: "Can a custom hook return JSX?" It can, but then it\'s really a component in disguise. Hooks should return data and functions; components return UI.',
      ],
      takeaway: 'Custom hooks reuse stateful logic, not state — each caller gets its own copy.',
    },
    {
      id: 'stale-closures',
      title: 'Stale Closures in React',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A callback or effect that captured old state/props from an earlier render and keeps using those old values.',
      what: `Every render creates new functions, and each function **remembers the values from the render it was created in** (that's a closure). A **stale closure** happens when an old function keeps running — in a \`setInterval\`, an event listener, or a memoized callback — and keeps seeing **old** state or props.

Classic symptom: a counter in \`setInterval\` that goes 0 → 1 → 1 → 1 forever.

#### Deeper version
Each render has its own snapshot of props and state. An effect with \`[]\` deps captures the **first** render's values forever. Fixes, from best to most specific:
1. **Functional updater**: \`setCount(c => c + 1)\` — no need to read \`count\` at all.
2. **Correct dependencies**: include the value so the effect/callback is recreated (follow \`exhaustive-deps\`).
3. **Ref for latest value**: store the value or callback in a ref (\`latestRef.current = value\`, updated in an effect) and read \`ref.current\` inside the long-lived function.
4. **\`useReducer\`**: the reducer always receives current state.
5. **\`useEffectEvent\`** (added in React 19.2; check your version's docs) for reading latest values inside an effect without making them dependencies.`,
      why: `Stale closures are one of the most common React bugs and a favourite interview question, because they test whether you understand closures, renders as snapshots, and dependency arrays together.`,
      analogy: `It's like a photo of a clock. The clock keeps moving, but your photo always shows 10:00. A stale closure is code that keeps looking at the photo instead of the real clock.`,
      code: [
        {
          title: 'The bug and three fixes',
          lang: 'jsx',
          code: `import { useEffect, useRef, useState } from 'react';

function BuggyTimer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // "count" is always 0 from the first render
    }, 1000);
    return () => clearInterval(id);
  }, []); // effect never re-runs, closure never refreshes
  return <p>{count}</p>; // shows 0, 1, 1, 1, ...
}

function FixedTimer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 1000); // fix 1: updater
    return () => clearInterval(id);
  }, []);
  return <p>{count}</p>; // 0, 1, 2, 3, ...
}

function LoggerWithRef({ userName }) {
  const latestName = useRef(userName);
  useEffect(() => {
    latestName.current = userName; // fix 3: keep the latest value in a ref
  }, [userName]);

  useEffect(() => {
    const id = setInterval(() => console.log('Hi', latestName.current), 5000);
    return () => clearInterval(id);
  }, []); // interval created once but always logs the current name
  return null;
}`,
        },
      ],
      output: `\`BuggyTimer\` shows 1 after the first second and then stays at 1, because the interval callback always computes \`0 + 1\`. \`FixedTimer\` counts 1, 2, 3… because the updater receives the latest state. \`LoggerWithRef\` keeps a single interval but logs the current \`userName\` even after the prop changes. (Fix 2 — adding \`count\` to deps — also works, but recreates the interval every second.)`,
      questions: [
        {
          q: 'What is a stale closure in React?',
          a: 'A function created in an earlier render that still runs later and reads that render\'s old props or state.',
        },
        {
          q: 'Why does a setInterval counter get stuck at 1?',
          a: 'The effect with `[]` captured `count = 0`, so the callback always sets `0 + 1`. Use `setCount(c => c + 1)` or add `count` to the deps.',
        },
        {
          q: 'How do refs help with stale closures?',
          a: 'A ref is one mutable object shared across renders. Updating `ref.current` with the latest value lets a long-lived callback always read fresh data.',
        },
        {
          q: 'How does the exhaustive-deps lint rule relate?',
          a: 'It warns when a value used inside an effect/callback is missing from deps — exactly the situation that creates stale closures.',
        },
      ],
      spoken: `"Each render in React is a snapshot, and functions created in that render close over its props and state. A stale closure is when an old function — say inside a \`setInterval\` with an empty dependency array — keeps running and reads old values. The classic example is a counter stuck at 1. I fix it with the functional updater, by adding the right dependencies, or by storing the latest value in a ref when I need a long-lived listener. Following the exhaustive-deps lint rule prevents most of these bugs."`,
      mistakes: [
        'Silencing `exhaustive-deps` with a comment instead of fixing the dependency.',
        'Reading state inside `setTimeout` after `setState` and expecting the new value.',
        'Adding every value to deps of an interval effect, which tears down and recreates the interval constantly — use the updater or a ref instead.',
        'Follow-up trap: "Why does an alert in setTimeout show the old count after I clicked several times?" Because the timeout closure captured the count from the render in which it was scheduled.',
      ],
      takeaway: 'Renders are snapshots — use updaters, correct deps or refs so long-lived callbacks see fresh values.',
    },
    {
      id: 'you-might-not-need-an-effect',
      title: 'Derived State and "You Might Not Need an Effect"',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Calculate values during render and handle user actions in event handlers instead of syncing state with effects.',
      what: `A very common anti-pattern is using \`useEffect\` + \`setState\` to compute something from other state or props:

\`useEffect(() => setFullName(first + ' ' + last), [first, last]);\`

This causes an **extra render** and can show stale values for a moment. Instead, just **calculate it during render**:

\`const fullName = first + ' ' + last;\`

Rules of thumb:
- If a value can be **calculated** from props/state → compute it (use \`useMemo\` if expensive).
- If something happens **because the user did something** (clicked Buy) → put it in the **event handler**.
- Use effects only to **sync with external systems** (network, DOM APIs, subscriptions, timers).

#### Deeper version
To **reset all state** when a prop changes (e.g. switching user profiles), pass a \`key\` (\`<Profile key={userId} />\`) instead of an effect that clears state. Chains of effects that set state that triggers other effects are a sign the logic should move into one event handler or a reducer. Data fetching in effects is allowed but has pitfalls (race conditions, no caching), which is why frameworks and libraries like TanStack Query are recommended.`,
      why: `Unnecessary effects make components slower (extra renders), harder to follow, and buggy (flashes of stale UI, loops). Interviewers use this to see if you understand React's data flow.`,
      analogy: `If you know the length and width of a room, you don't keep a separate notebook with the area and update it later — you just multiply when you need it.`,
      code: [
        {
          title: 'Before and after',
          lang: 'jsx',
          code: `import { useMemo, useState } from 'react';

// BEFORE: redundant state + effect (extra render, can be stale)
// const [visible, setVisible] = useState([]);
// useEffect(() => setVisible(todos.filter(t => !t.done)), [todos]);

function TaskList({ tasks }) {
  const [showDone, setShowDone] = useState(false);

  // AFTER: derived during render, memoized because the list may be large
  const visible = useMemo(
    () => (showDone ? tasks : tasks.filter((t) => !t.done)),
    [tasks, showDone]
  );

  // User action -> logic in the event handler, not in an effect
  const handleCheckout = async () => {
    await fetch('/api/checkout', { method: 'POST' });
    alert('Order placed!');
  };

  return (
    <>
      <label><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show done</label>
      <ul>{visible.map((t) => <li key={t.id}>{t.text}</li>)}</ul>
      <button onClick={handleCheckout}>Checkout</button>
    </>
  );
}

// Reset state on prop change with a key instead of an effect:
// <EditProfile key={userId} userId={userId} />`,
        },
      ],
      output: `The list updates in the same render as the checkbox change — there is no in-between render where the list is out of date. Checkout runs only when the button is clicked, not when some state happens to change. Changing \`key\` on \`EditProfile\` throws away its old state and mounts a fresh form.`,
      questions: [
        {
          q: 'What is derived state and why avoid storing it?',
          a: 'A value that can be computed from existing props/state. Storing it duplicates data, causes extra renders, and can get out of sync. Compute it during render.',
        },
        {
          q: 'When should you use an effect?',
          a: 'To synchronise with something outside React: network requests, subscriptions, timers, browser APIs, third-party widgets.',
        },
        {
          q: 'How do you reset a component\'s state when a prop changes?',
          a: 'Give it a `key` based on that prop. React remounts it with fresh state.',
        },
      ],
      spoken: `"A lot of effects in real code aren't needed. If a value can be calculated from props or state, I just compute it during render — with \`useMemo\` if it's expensive — instead of storing it in state and syncing it with an effect, which causes extra renders and stale flashes. If something happens because the user clicked, it goes in the event handler. I keep effects for syncing with external systems like the network, subscriptions or browser APIs. And to reset state on a prop change I use a \`key\` rather than an effect."`,
      mistakes: [
        'Syncing props into state with `useEffect(() => setX(props.x), [props.x])`.',
        'Chaining effects that set state which triggers other effects.',
        'Running "on submit" logic in an effect watching a `submitted` flag instead of in the submit handler.',
        'Follow-up trap: "How would you notify a parent when child state changes?" Call the parent\'s callback in the same event handler that updates the state, not in an effect.',
      ],
      takeaway: 'Compute what you can during render, act in event handlers, and save effects for the outside world.',
    },
    {
      id: 'use-layout-effect',
      title: 'useLayoutEffect',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Like useEffect but runs synchronously after DOM changes and before the browser paints — for measuring layout without flicker.',
      what: `\`useLayoutEffect\` has the same API as \`useEffect\`, but it runs at a different time:

- \`useEffect\` → runs **after** the browser paints the screen (non-blocking).
- \`useLayoutEffect\` → runs **after React updates the DOM but before the browser paints** (blocking).

Use it when you must **measure the DOM** (size, position) and then update state **before** the user sees anything — for example positioning a tooltip so it doesn't flash in the wrong place.

#### Deeper version
Because it blocks painting, heavy work inside \`useLayoutEffect\` makes the app feel slow — prefer \`useEffect\` by default. State updates inside it are processed **synchronously** before paint, so the user sees only the final result. During server-side rendering it does nothing (there's no layout on the server), and older React versions warned about it in SSR. There is also \`useInsertionEffect\`, which runs even earlier and is meant only for CSS-in-JS libraries to inject styles.`,
      why: `With \`useEffect\`, measuring and repositioning happens after paint, so the user may briefly see the element in the wrong place (a flicker). \`useLayoutEffect\` avoids that visible jump.`,
      analogy: `\`useEffect\` is like rearranging a shop's display after customers walk in — they see the mess for a second. \`useLayoutEffect\` is rearranging it just before opening the doors.`,
      code: [
        {
          title: 'Position a tooltip without flicker',
          lang: 'jsx',
          code: `import { useLayoutEffect, useRef, useState } from 'react';

function Tooltip({ text, targetRect }) {
  const ref = useRef(null);
  const [top, setTop] = useState(0);

  useLayoutEffect(() => {
    const { height } = ref.current.getBoundingClientRect(); // measure
    // If there is no room above the target, show it below instead
    const above = targetRect.top - height;
    setTop(above < 0 ? targetRect.bottom : above);         // runs before paint
  }, [targetRect]);

  return (
    <div ref={ref} style={{ position: 'fixed', top, left: targetRect.left }}>
      {text}
    </div>
  );
}`,
        },
      ],
      output: `React renders the tooltip with \`top: 0\`, updates the DOM, then runs the layout effect before painting. The effect measures the tooltip's height and sets the correct \`top\`. React re-renders synchronously, and only then does the browser paint — so the user only ever sees the tooltip in the right place. With \`useEffect\` you might see it flash at the top of the screen first.`,
      questions: [
        {
          q: 'What is the difference between useEffect and useLayoutEffect?',
          a: '`useEffect` runs after paint and does not block it. `useLayoutEffect` runs after DOM mutations but before paint, blocking it — used for DOM measurement to avoid flicker.',
        },
        {
          q: 'When should you use useLayoutEffect?',
          a: 'Only when you need to read layout (sizes, positions, scroll) and synchronously re-render before the user sees the screen: tooltips, popovers, scroll restoration, animations\' starting positions.',
        },
        {
          q: 'Why not always use useLayoutEffect?',
          a: 'It blocks the browser from painting, so slow code inside it delays the whole update. It also does nothing on the server.',
        },
      ],
      spoken: `"\`useLayoutEffect\` has the same signature as \`useEffect\`, but it fires after React has changed the DOM and before the browser paints. That makes it right for measuring layout — like the size of a tooltip — and adjusting position before the user sees anything, so there's no flicker. Because it blocks painting, I keep it small and only use it when \`useEffect\` causes a visible jump. By default I always start with \`useEffect\`."`,
      mistakes: [
        'Using `useLayoutEffect` for data fetching or other work that doesn\'t need to block paint.',
        'Doing heavy calculations inside it and making every update janky.',
        'Expecting it to run during SSR.',
        'Follow-up trap: "What runs first: useLayoutEffect or useEffect?" useLayoutEffect (and ref attachment) during commit, then the browser paints, then useEffect.',
      ],
      takeaway: 'useLayoutEffect = measure and fix the DOM before paint; use it rarely and keep it fast.',
    },
    {
      id: 'use-id',
      title: 'useId',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Generates a unique, stable ID that is the same on server and client — for linking labels and ARIA attributes.',
      what: `\`useId\` (React 18+) returns a unique string ID for a component instance, like \`:r1:\`. It stays the same across re-renders.

Use it to connect elements for **accessibility**: \`<label htmlFor={id}>\` with \`<input id={id}>\`, or \`aria-describedby\`.

#### Deeper version
Why not \`Math.random()\` or a global counter? With **server-side rendering**, the server and client must produce the **same** IDs, or hydration will complain about a mismatch. \`useId\` builds the ID from the component's **position in the tree**, so it matches on both sides. The exact format of the generated string has changed between React versions — never depend on it or use it in CSS selectors. Do **not** use \`useId\` for list **keys** — keys should come from your data. For several related IDs, call it once and add suffixes: \`\${id}-email\`, \`\${id}-password\`.`,
      why: `Reusable components (like a \`TextField\`) need unique IDs per instance so two copies on the same page don't clash, and SSR apps need those IDs to match between server and client.`,
      analogy: `It's like seat numbers printed on concert tickets: the box office (server) and the usher (client) see the same number for the same seat, because it's based on where the seat is, not on a random draw.`,
      code: [
        {
          title: 'Accessible reusable input',
          lang: 'jsx',
          code: `import { useId } from 'react';

function TextField({ label, hint, ...inputProps }) {
  const id = useId(); // unique per instance, SSR-safe

  return (
    <div>
      <label htmlFor={\`\${id}-input\`}>{label}</label>
      <input id={\`\${id}-input\`} aria-describedby={\`\${id}-hint\`} {...inputProps} />
      <small id={\`\${id}-hint\`}>{hint}</small>
    </div>
  );
}

export default function Signup() {
  return (
    <>
      <TextField label="Email" hint="We never share it" type="email" />
      <TextField label="Password" hint="At least 8 characters" type="password" />
    </>
  );
}`,
        },
      ],
      output: `Both \`TextField\`s get different IDs (something like \`:r0:-input\` and \`:r1:-input\`), so clicking each label focuses the correct input, and screen readers read the right hint for each input. The IDs are identical in the server HTML and on the client, so hydration has no mismatch.`,
      questions: [
        {
          q: 'What is useId for?',
          a: 'Generating unique IDs for accessibility attributes (`htmlFor`, `aria-*`) that are stable across renders and match between server and client.',
        },
        {
          q: 'Why not use Math.random() for IDs?',
          a: 'It changes every render and differs between server and client, causing hydration mismatches and broken label links.',
        },
        {
          q: 'Can you use useId for list keys?',
          a: 'No. Keys should come from your data. useId gives one ID per component instance, not per item.',
        },
      ],
      spoken: `"\`useId\` was added in React 18 to generate unique IDs that are stable across renders and identical on the server and client. I use it in reusable form components to connect labels and inputs or \`aria-describedby\` hints, so two instances on the same page don't clash. It's SSR-safe because the ID is based on the component's position in the tree rather than randomness. I don't use it for list keys — those should come from data."`,
      mistakes: [
        'Using `useId` to generate keys for list items.',
        'Using `Math.random()` or a module-level counter for IDs in SSR apps.',
        'Relying on the exact string format (e.g. in CSS selectors); it can change between versions.',
        'Follow-up trap: "Is the ID globally unique across separate React roots?" Only within one app/root by default; multiple roots can set an `identifierPrefix` option to avoid clashes.',
      ],
      takeaway: 'useId gives SSR-safe, stable IDs for accessibility — not for keys.',
    },
    {
      id: 'strict-mode',
      title: 'StrictMode',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A development-only wrapper that double-runs renders and effects to expose impure code and missing cleanups.',
      what: `\`<StrictMode>\` is a wrapper component that turns on **extra checks in development only**. It renders nothing visible and has **no effect in production**.

In development it:
- **Renders components twice** to find impure render logic.
- **Runs effects twice** (mount → unmount → mount) to find missing cleanups.
- Warns about **deprecated APIs** (like \`UNSAFE_componentWillMount\`, string refs, legacy context).

#### Deeper version
The double effect run was added in React 18 to prepare for features where React may **unmount and remount** a component while keeping its state (like Offscreen / \`<Activity>\` in newer React and Fast Refresh). If your effect breaks when run twice — e.g. sends two analytics events or opens two WebSocket connections without closing one — it's missing a cleanup. Double rendering also calls reducers, \`useState\` initialisers and \`useMemo\` functions twice. In React 18, the second render's \`console.log\` was dimmed in DevTools; behaviour of logs has varied between versions. It's common to wrap the whole app: \`<StrictMode><App /></StrictMode>\`.`,
      why: `Bugs from impure renders and missing cleanups often appear only in edge cases (fast navigation, concurrent rendering). StrictMode makes them show up immediately while you develop.`,
      analogy: `StrictMode is like a driving instructor who makes you park twice in a row. If you can only park correctly once by luck, the second try reveals it. In the real driving test (production), the instructor isn't there.`,
      code: [
        {
          title: 'Enable StrictMode and write effects that survive it',
          lang: 'jsx',
          code: `// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ChatRoom.jsx
import { useEffect } from 'react';

export function ChatRoom({ roomId }) {
  useEffect(() => {
    const socket = new WebSocket(\`wss://chat.example.com/\${roomId}\`);
    console.log('connect', roomId);
    return () => {
      socket.close();               // cleanup makes the double run harmless
      console.log('disconnect', roomId);
    };
  }, [roomId]);
  return <h2>Room {roomId}</h2>;
}`,
        },
      ],
      output: `In development the console shows "connect general", "disconnect general", "connect general" on mount — StrictMode ran the effect, cleaned it up and ran it again. Because the cleanup closes the socket, only one connection stays open. In a production build you see just one "connect general".`,
      questions: [
        {
          q: 'Why do my effects run twice in development?',
          a: 'StrictMode in React 18+ deliberately mounts, unmounts and remounts components in dev to check that effects clean up properly. It doesn\'t happen in production.',
        },
        {
          q: 'Does StrictMode affect production?',
          a: 'No. All its checks are development-only.',
        },
        {
          q: 'How should you fix a double API call caused by StrictMode?',
          a: 'Don\'t remove StrictMode. Add cleanup (AbortController or an "ignore" flag) or move fetching to a library like TanStack Query or a framework loader that handles caching and dedupe.',
        },
      ],
      spoken: `"StrictMode is a development-only tool. It double-invokes render functions to catch impure code, and since React 18 it also mounts, unmounts and remounts components so effects run twice — which exposes missing cleanups. It also warns about deprecated APIs. None of this happens in production. When I see a double API call in dev, I don't remove StrictMode; I add proper cleanup with an AbortController or use a data-fetching library that dedupes requests."`,
      mistakes: [
        'Removing StrictMode to "fix" double effects instead of adding cleanups.',
        'Using a `useRef` flag to block the second run — it hides real bugs that will appear in production edge cases.',
        'Thinking StrictMode slows down production or shows anything visible.',
        'Follow-up trap: "Is the double render a performance problem?" No, it only happens in development builds.',
      ],
      takeaway: 'StrictMode double-runs things in dev to expose impure renders and missing cleanups — fix the code, keep the mode.',
    },
    {
      id: 'error-boundaries',
      title: 'Error Boundaries',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Class components that catch render errors in their children and show a fallback UI instead of a blank screen.',
      what: `By default, if any component throws an error **while rendering**, React removes the **whole app** from the screen (blank page). An **error boundary** is a component that catches those errors in the tree below it and shows a **fallback UI** instead.

You can only write one as a **class component**, using:
- \`static getDerivedStateFromError(error)\` → update state to show the fallback.
- \`componentDidCatch(error, info)\` → log the error (e.g. to Sentry).

Most teams use the small **react-error-boundary** library, which wraps this in a nicer API.

#### Deeper version
Error boundaries catch errors during **rendering, lifecycle methods and constructors** of children. They do **not** catch errors in:
- **event handlers** (use try/catch),
- **async code** (\`setTimeout\`, promises),
- **server-side rendering**,
- errors thrown **in the boundary itself**.

To surface an async error to a boundary, you can store it in state and throw it during render (react-error-boundary provides \`showBoundary\` for this). Place boundaries at several levels: one around the whole app, and smaller ones around widgets (a broken chart shouldn't kill the page). Combine with \`<Suspense>\`: Suspense handles "loading", error boundaries handle "failed". React 19 also added root-level options \`onCaughtError\` and \`onUncaughtError\` on \`createRoot\` for reporting.`,
      why: `One bug in a small widget shouldn't crash the whole product. Error boundaries contain the damage and give users a way to recover ("Try again"), while still reporting the error.`,
      analogy: `An error boundary is like a circuit breaker in your house. If the kitchen toaster short-circuits, only the kitchen goes dark — the rest of the house keeps its lights on.`,
      code: [
        {
          title: 'Hand-written error boundary',
          lang: 'jsx',
          code: `import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true }; // show fallback on next render
  }

  componentDidCatch(error, info) {
    console.error('Logged to monitoring:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <p>Something went wrong.</p>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}`,
        },
        {
          title: 'Using react-error-boundary',
          lang: 'jsx',
          code: `import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Chart failed: {error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

function BrokenChart() {
  throw new Error('Bad data'); // simulated render error
}

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      <ErrorBoundary FallbackComponent={Fallback}>
        <BrokenChart />
      </ErrorBoundary>
      <p>Other widgets still work.</p>
    </main>
  );
}`,
        },
      ],
      output: `The dashboard shows the heading, "Chart failed: Bad data" with a Retry button, and "Other widgets still work." Only the chart area is replaced by the fallback; the rest of the page renders normally. Without a boundary, the whole page would be blank.`,
      questions: [
        {
          q: 'What is an error boundary?',
          a: 'A class component implementing `getDerivedStateFromError` and/or `componentDidCatch` that catches render errors in its children and displays a fallback.',
        },
        {
          q: 'What errors do error boundaries NOT catch?',
          a: 'Errors in event handlers, async code (timeouts, promises), SSR, and errors in the boundary itself.',
        },
        {
          q: 'Can you write an error boundary with hooks?',
          a: 'No, there is no hook equivalent yet. Use a class or the `react-error-boundary` library.',
        },
        {
          q: 'Where should you place error boundaries?',
          a: 'At the app root as a last resort, and around independent sections (routes, widgets) so a failure is isolated.',
        },
      ],
      spoken: `"An error boundary catches errors thrown while rendering its children and shows a fallback instead of unmounting the whole app. It has to be a class component with \`getDerivedStateFromError\` for the fallback and \`componentDidCatch\` for logging, though in practice I use the react-error-boundary library. It doesn't catch errors in event handlers or async code, so those still need try/catch. I place one at the root and smaller ones around routes and widgets so one broken chart doesn't take down the page."`,
      mistakes: [
        'Expecting a boundary to catch an error thrown in `onClick` or in a `fetch().then()`.',
        'Having only one boundary at the root, so any error replaces the whole app.',
        'Not reporting errors from `componentDidCatch` to a monitoring tool.',
        'Follow-up trap: "In development I still see the error overlay even though my boundary caught it — why?" The dev overlay shows caught errors too; in production only the fallback appears.',
      ],
      takeaway: 'Error boundaries are circuit breakers for render errors — use several, and handle event/async errors separately.',
    },
    {
      id: 'portals',
      title: 'Portals',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Render children into a different DOM node (like document.body) while keeping them in the same React tree.',
      what: `A **portal** renders a component's output into a **different place in the DOM**, outside its parent's DOM element:

\`createPortal(children, document.body)\`

Used for **modals, tooltips, dropdowns, toasts** — things that must appear above everything and must not be clipped by a parent with \`overflow: hidden\` or a low \`z-index\`.

#### Deeper version
Even though the DOM node lives elsewhere, the portal is still part of the **React tree** where you wrote it. That means:
- It can read **context** from its React parents.
- **Events bubble through the React tree**, not the DOM tree. A click inside a portal modal triggers \`onClick\` on the React parent that rendered the portal, even though in the DOM the modal is in \`body\`.

For accessibility, modals also need focus management (trap focus, return focus on close), \`role="dialog"\`, \`aria-modal\`, and closing on Escape. The native \`<dialog>\` element with \`showModal()\` is now a good alternative because the browser puts it in a "top layer" automatically.`,
      why: `CSS stacking contexts and \`overflow: hidden\` on ancestors can cut off or hide pop-ups. Portals move the DOM node to a safe place while keeping the component logically where it belongs in your code.`,
      analogy: `A portal is like a TV in your living room showing a live feed from the kitchen. The cooking (the component) belongs to the kitchen's team (React tree), but you see it in a different room (DOM location).`,
      code: [
        {
          title: 'Modal with createPortal',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body // rendered here in the DOM
  );
}

export default function Card() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ overflow: 'hidden', height: 50 }} onClick={() => console.log('Card saw the click')}>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <Modal onClose={() => setOpen(false)}>Hello from a portal!</Modal>}
    </div>
  );
}`,
        },
      ],
      output: `Clicking "Open" shows the modal as a child of \`<body>\`, so the card's \`overflow: hidden\` and 50px height do not clip it. Clicking the modal's Close button closes it and still logs "Card saw the click", because events bubble through the React tree (Modal is a React child of Card). Pressing Escape also closes it.`,
      questions: [
        {
          q: 'What is a portal used for?',
          a: 'Rendering UI like modals, tooltips and dropdowns into another DOM container (often `document.body`) to escape parent overflow and z-index issues.',
        },
        {
          q: 'How do events behave in a portal?',
          a: 'They bubble through the React component tree, not the DOM tree. A parent React component receives events from inside its portal.',
        },
        {
          q: 'Does a portal have access to context?',
          a: 'Yes. It stays in the same React tree, so context, state and props work normally.',
        },
      ],
      spoken: `"A portal lets me render a component's DOM into a different node, usually \`document.body\`, using \`createPortal\`. I use it for modals, tooltips and toasts so they aren't clipped by a parent's \`overflow: hidden\` or stuck under a stacking context. The interesting part is that it's still in the same React tree, so it can read context, and events bubble up through React parents even though the DOM node is elsewhere. For modals I also handle focus trapping, Escape to close and ARIA attributes."`,
      mistakes: [
        'Assuming DOM event bubbling: a parent\'s `onClick` will fire for clicks inside the portal — stop propagation if needed.',
        'Forgetting accessibility: focus trap, `aria-modal`, returning focus, Escape key.',
        'Calling `createPortal` during SSR when `document` doesn\'t exist; render portals only on the client.',
        'Follow-up trap: "Do you need a portal to fix z-index issues?" Not always — sometimes fixing the stacking context works — but portals are the reliable fix when a parent clips content.',
      ],
      takeaway: 'Portals change where the DOM goes, not where the component lives in React — context and events still follow the React tree.',
    },
    {
      id: 'lazy-suspense-code-splitting',
      title: 'Code Splitting with React.lazy and Suspense',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Load component code only when needed with lazy() and dynamic import(), and show a fallback with Suspense while it loads.',
      what: `**Code splitting** means breaking your JavaScript bundle into smaller files (**chunks**) that load **on demand**, instead of sending the whole app on the first visit.

In React you do it with:
- \`React.lazy(() => import('./Settings'))\` — loads the component's file the first time it renders.
- \`<Suspense fallback={<Spinner />}>\` — shows the fallback while the code is downloading.

The best place to split is usually **by route** (each page is a chunk), then **heavy components** (charts, editors, maps) that aren't needed immediately.

#### Deeper version
\`import()\` is a **dynamic import**: bundlers (Vite, webpack) see it and create a separate chunk. \`lazy\` expects the module to have a **default export** (for a named export: \`lazy(() => import('./X').then(m => ({ default: m.Chart })))\`). Declare lazy components at the **module top level**, not inside components, or they'll reload every render. \`Suspense\` works with anything that "suspends": lazy components, Suspense-enabled data fetching (TanStack Query's \`useSuspenseQuery\`, Next.js server components, React 19 \`use(promise)\`). If loading **fails** (network error), the error goes to the nearest **error boundary**. You can **preload** on hover by calling the import function early. Wrapping updates in \`startTransition\` keeps the old UI visible instead of flashing the fallback again.`,
      why: `Large bundles slow down the first load (Time to Interactive), especially on mobile. Code splitting sends users only the code for what they're looking at, improving Core Web Vitals.`,
      analogy: `It's like a streaming service. You don't download every movie before watching one — you stream the one you choose, and a loading spinner shows while it buffers.`,
      code: [
        {
          title: 'Route-level and component-level splitting',
          lang: 'jsx',
          code: `import { lazy, Suspense, useState } from 'react';

// Declared at module level (NOT inside a component)
const Settings = lazy(() => import('./pages/Settings'));
const RevenueChart = lazy(() => import('./components/RevenueChart'));

// Named export -> map it to default
const Editor = lazy(() => import('./components/Editor').then((m) => ({ default: m.Editor })));

// Optional: start downloading early (e.g. on hover)
const preloadChart = () => import('./components/RevenueChart');

export default function App() {
  const [page, setPage] = useState('home');
  const [showChart, setShowChart] = useState(false);

  return (
    <>
      <button onClick={() => setPage('settings')}>Settings</button>
      <button onMouseEnter={preloadChart} onClick={() => setShowChart(true)}>Show chart</button>

      <Suspense fallback={<p>Loading page…</p>}>
        {page === 'settings' ? <Settings /> : <p>Home</p>}
      </Suspense>

      {showChart && (
        <Suspense fallback={<p>Loading chart…</p>}>
          <RevenueChart />
        </Suspense>
      )}
    </>
  );
}`,
        },
      ],
      output: `On first load, the Settings, chart and editor code are **not** downloaded. Clicking "Settings" makes the browser fetch a separate chunk (visible in the Network tab), shows "Loading page…" for a moment, then renders the page. Hovering "Show chart" starts downloading the chart chunk early, so clicking it may show the chart with little or no "Loading chart…" delay.`,
      questions: [
        {
          q: 'What is code splitting and why do it?',
          a: 'Splitting the bundle into smaller chunks loaded on demand. It reduces the initial JavaScript, so the first page loads and becomes interactive faster.',
        },
        {
          q: 'How do React.lazy and Suspense work together?',
          a: '`lazy` returns a component that loads its code via dynamic `import()` on first render. While loading it "suspends", and the nearest `Suspense` shows its fallback.',
        },
        {
          q: 'How do you handle a failed chunk load?',
          a: 'Wrap the lazy component in an error boundary that shows a retry option. This often happens after a new deploy when old chunk files were removed.',
        },
        {
          q: 'Where should you split code?',
          a: 'Start at routes, then large, rarely-used components (modals, charts, rich text editors). Avoid splitting tiny components — each chunk is an extra request.',
        },
      ],
      spoken: `"Code splitting means sending only the JavaScript the user needs right now. In React I use \`React.lazy\` with a dynamic \`import()\`, which makes the bundler create a separate chunk, and I wrap it in \`Suspense\` with a fallback while it loads. I usually split by route first, then heavy components like charts or editors, and I sometimes preload on hover. Since a chunk can fail to load, especially after a deploy, I put an error boundary around it. Frameworks like Next.js do route splitting automatically."`,
      mistakes: [
        'Calling `lazy()` inside a component body — a new lazy component every render remounts and reloads.',
        'Forgetting a `Suspense` boundary above a lazy component, which makes React throw an error.',
        'Over-splitting into dozens of tiny chunks, causing request waterfalls.',
        'Follow-up trap: "Does React.lazy work with server-side rendering?" Modern React (18+) supports lazy and Suspense in streaming SSR; frameworks like Next.js provide their own helpers (e.g. `next/dynamic`). Check your framework\'s docs.',
      ],
      takeaway: 'lazy + dynamic import splits the bundle; Suspense shows a fallback; an error boundary handles failed loads.',
    },
    {
      id: 'hocs',
      title: 'Higher-Order Components (HOCs)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A function that takes a component and returns a new component with extra props or behaviour.',
      what: `A **higher-order component (HOC)** is a **function** that takes a component and returns a **new, enhanced component**:

\`const EnhancedComponent = withSomething(BaseComponent);\`

It's the component version of a higher-order function. HOCs were the main way to reuse logic before hooks: \`withRouter\`, Redux's \`connect\`, \`withAuth\`, \`withLogger\`.

#### Deeper version
HOC rules and pitfalls:
- **Pass through unrelated props** with \`{...props}\` so the wrapped component still gets everything.
- **Don't apply HOCs inside render** — a new component type every render remounts the subtree.
- **Refs don't pass through automatically** in React 18 and older; use \`forwardRef\` (React 19 passes \`ref\` as a normal prop).
- Set a **displayName** (\`withAuth(Profile)\`) for nicer DevTools.
- Problems: "wrapper hell" (deep nesting in DevTools), **prop name collisions** between multiple HOCs, and it's unclear where a prop comes from.

Today **custom hooks** are preferred for logic reuse. HOCs are still useful for cross-cutting wrappers like route guards, analytics, or wrapping third-party components, and you'll see them in older codebases.`,
      why: `They let you add the same behaviour (auth checks, logging, data injection) to many components without changing each component's code.`,
      analogy: `An HOC is like a phone case. You put your phone (component) inside, and now it has extra features — a card holder, a stand — but it's still the same phone inside.`,
      code: [
        {
          title: 'withAuth guard HOC',
          lang: 'jsx',
          code: `import { useAuth } from './AuthContext';

function withAuth(WrappedComponent, { redirectTo = '/login' } = {}) {
  function WithAuth(props) {
    const { user } = useAuth();
    if (!user) {
      return <a href={redirectTo}>Please log in</a>;
    }
    // Pass through all props, plus inject "user"
    return <WrappedComponent {...props} user={user} />;
  }
  WithAuth.displayName = \`withAuth(\${WrappedComponent.displayName || WrappedComponent.name})\`;
  return WithAuth;
}

function Billing({ user, plan }) {
  return <p>{user.name} is on the {plan} plan</p>;
}

// Created ONCE at module level, not inside a render
export const ProtectedBilling = withAuth(Billing);
// Usage: <ProtectedBilling plan="Pro" />`,
        },
      ],
      output: `If nobody is logged in, \`<ProtectedBilling plan="Pro" />\` shows "Please log in". When \`user\` is \`{ name: 'Asha' }\`, it renders \`Billing\` with both \`plan\` (passed through) and \`user\` (injected), showing "Asha is on the Pro plan". In React DevTools it appears as \`withAuth(Billing)\`.`,
      questions: [
        {
          q: 'What is a higher-order component?',
          a: 'A function that takes a component and returns a new component that adds props or behaviour, e.g. `withAuth(Profile)`.',
        },
        {
          q: 'What are the downsides of HOCs?',
          a: 'Wrapper nesting, prop name collisions, unclear prop sources, refs not forwarded automatically, and static methods not copied. Hooks avoid most of these.',
        },
        {
          q: 'HOCs vs custom hooks — which do you prefer?',
          a: 'Custom hooks for logic reuse. HOCs for wrapping a component with extra UI or guards, or when working with class components and older libraries.',
        },
      ],
      spoken: `"A higher-order component is a function that takes a component and returns a new one with extra behaviour — like \`withAuth\` that shows a login link if there's no user, or Redux's old \`connect\`. The HOC should pass through all props, set a display name, and be created once at module level, not inside render. HOCs have downsides — wrapper hell and prop collisions — so for sharing logic I prefer custom hooks today, but HOCs still make sense for things like route guards or wrapping third-party components."`,
      mistakes: [
        'Creating the HOC inside a component\'s render (`const X = withAuth(Y)` in the body) — remounts on every render.',
        'Not spreading `{...props}`, so the wrapped component loses props.',
        'Two HOCs injecting a prop with the same name and silently overwriting each other.',
        'Follow-up trap: "Does a ref on the HOC reach the inner component?" Not in React 18 and older — the ref points to the wrapper unless you use `forwardRef`. In React 19 `ref` is a normal prop, so spreading props passes it through.',
      ],
      takeaway: 'An HOC wraps a component to add behaviour — useful, but custom hooks are the modern default for logic reuse.',
    },
    {
      id: 'render-props',
      title: 'Render Props',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A component takes a function prop and calls it to decide what to render, sharing its internal data with the caller.',
      what: `A **render prop** is a prop whose value is a **function that returns JSX**. The component does some work (track the mouse, fetch data, manage toggle state) and then calls that function with the results, letting the **caller decide what to render**.

\`<MouseTracker render={({ x, y }) => <p>{x}, {y}</p>} />\`

Often the function is passed as \`children\` instead ("function as children").

#### Deeper version
Render props were popular before hooks (React Router v4/v5, Formik, Downshift). Hooks now solve most of the same problems more simply — \`useMouse()\` instead of \`<Mouse render={...} />\`. Render props are still useful when the component must **control where** something is rendered, for example list virtualizers (\`renderItem\`), headless UI libraries, or giving a child access to data scoped inside a specific part of the tree. Downsides: deeply nested callbacks ("callback pyramid") and an inline function each render (breaks memoization of the child).`,
      why: `They separate **behaviour** (what the component knows) from **presentation** (how it looks), so the same logic can be reused with completely different UIs.`,
      analogy: `It's like a caterer who brings the food but lets you choose how to plate it. The caterer (component) provides the ingredients (data); your function decides the presentation.`,
      code: [
        {
          title: 'Render prop vs the equivalent hook',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

// Render prop version
function WindowWidth({ children }) {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return children(width); // caller decides what to render
}

// Hook version of the same logic
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export default function Layout() {
  const width = useWindowWidth();
  return (
    <>
      <WindowWidth>{(w) => <p>Render prop says: {w}px</p>}</WindowWidth>
      <p>Hook says: {width}px</p>
      {width < 768 ? <p>Mobile menu</p> : <p>Desktop menu</p>}
    </>
  );
}`,
        },
      ],
      output: `Both lines show the same width (e.g. "1280px") and update together as you resize the window. Below 768px the page shows "Mobile menu". The render-prop component calls \`children(width)\`, so the parent controls the markup; the hook version gives the same data with less nesting.`,
      questions: [
        {
          q: 'What is a render prop?',
          a: 'A function prop that a component calls to render UI, passing in its internal data — e.g. `renderItem={(item) => <Row item={item} />}`.',
        },
        {
          q: 'How do hooks compare to render props?',
          a: 'Hooks share the same logic without extra components or nested callbacks, so they replaced most render-prop use cases.',
        },
        {
          q: 'Where are render props still useful?',
          a: 'When a component controls where/when items render: virtualized lists (`renderItem`), headless UI components, form libraries\' `Controller render={...}`.',
        },
      ],
      spoken: `"A render prop is a function prop that a component calls to render something, passing in its internal data. That way the component owns the behaviour — like tracking window size — and the caller owns the UI. It was a big pattern before hooks; libraries like Formik and older React Router used it. Today I'd usually write a custom hook instead, but render props are still handy when a component controls where things render, like \`renderItem\` in a virtualized list or react-hook-form's \`Controller\`."`,
      mistakes: [
        'Nesting several render-prop components and creating unreadable "callback pyramids".',
        'Passing an inline render function to a `memo` component and expecting it to skip renders.',
        'Thinking "render prop" means the prop must be named `render` — any function prop used to render counts, including `children`.',
        'Follow-up trap: "Render props vs HOCs?" Both share logic. Render props make the data flow visible in JSX; HOCs inject props invisibly. Hooks beat both for most cases.',
      ],
      takeaway: 'Render props share behaviour by letting the caller supply the UI function — mostly replaced by hooks, still great for renderItem-style APIs.',
    },
    {
      id: 'react-router-v6',
      title: 'React Router v6',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Client-side routing: map URLs to components with nested routes, params, navigation hooks and protected routes.',
      what: `**React Router** lets a single-page app show different components for different URLs **without a full page reload**.

Key pieces in v6:
- \`<BrowserRouter>\` + \`<Routes>\` + \`<Route path="/users/:id" element={<User />} />\`
- \`<Link to="/about">\` / \`<NavLink>\` for navigation (no reload).
- \`useParams()\` reads URL params (\`:id\`), \`useSearchParams()\` reads \`?q=...\`.
- \`useNavigate()\` navigates in code (after a form submit).
- **Nested routes** + \`<Outlet />\` render child pages inside a shared layout.

#### Deeper version
Changes from v5: \`<Switch>\` → \`<Routes>\`, \`component=\` → \`element={<X />}\`, \`useHistory\` → \`useNavigate\`, routes are matched by **best match** (order doesn't matter), and \`<Redirect>\` → \`<Navigate>\`. Version **6.4** added the **data router** (\`createBrowserRouter\` + \`<RouterProvider>\`) with **loaders** (fetch data before rendering a route), **actions** (handle form submissions), \`errorElement\`, and \`useLoaderData\`. These remove many fetch-in-effect waterfalls. **React Router v7** has since been released (it merged with Remix and adds a framework mode); most v6 APIs carry over, but check the current docs for upgrade details. Protected routes are usually a layout route that checks auth and returns \`<Navigate to="/login" replace />\`.`,
      why: `Users expect real URLs: bookmarking, sharing links, using the back button. A router keeps the URL and the UI in sync while keeping SPA speed.`,
      analogy: `The router is like a building's reception directory. You say the room number (URL) and it sends you to the right room (component), while the lobby and hallways (layout) stay the same.`,
      code: [
        {
          title: 'Data router with layout, params and a protected route',
          lang: 'jsx',
          code: `import {
  createBrowserRouter, RouterProvider, Outlet, Link, Navigate,
  useParams, useNavigate, useLoaderData,
} from 'react-router-dom';

function Layout() {
  return (
    <>
      <nav><Link to="/">Home</Link> | <Link to="/users/7">User 7</Link></nav>
      <Outlet /> {/* child routes render here */}
    </>
  );
}

function RequireAuth() {
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

function UserPage() {
  const { id } = useParams();
  const user = useLoaderData();          // data loaded BEFORE render
  const navigate = useNavigate();
  return (
    <div>
      <h2>User {id}: {user.name}</h2>
      <button onClick={() => navigate('/')}>Back home</button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <p>Page not found or failed to load.</p>,
    children: [
      { index: true, element: <h1>Home</h1> },
      { path: 'login', element: <h1>Login</h1> },
      {
        element: <RequireAuth />, // layout route acting as a guard
        children: [
          {
            path: 'users/:id',
            element: <UserPage />,
            loader: ({ params }) => fetch(\`/api/users/\${params.id}\`),
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}`,
        },
      ],
      output: `Visiting \`/\` shows the nav and "Home". Clicking "User 7" changes the URL to \`/users/7\` without a reload. If there's no token, \`RequireAuth\` redirects to \`/login\` (with \`replace\`, so Back doesn't loop). If logged in, the loader fetches \`/api/users/7\` first, then \`UserPage\` renders with the data via \`useLoaderData\`. Unknown URLs or loader errors show the \`errorElement\`.`,
      questions: [
        {
          q: 'What changed from React Router v5 to v6?',
          a: '`Switch` → `Routes`, `component` → `element`, `useHistory` → `useNavigate`, `Redirect` → `Navigate`, relative nested routes with `Outlet`, and best-match ranking instead of first-match.',
        },
        {
          q: 'How do you create a protected route?',
          a: 'A wrapper/layout route that checks auth and renders `<Outlet />` (or children) when allowed, otherwise `<Navigate to="/login" replace />`.',
        },
        {
          q: 'What are loaders and actions?',
          a: 'Data-router features (6.4+). A loader fetches data before a route renders (`useLoaderData`); an action handles form submissions for a route. They avoid fetch-in-effect waterfalls.',
        },
        {
          q: 'Link vs a normal <a> tag?',
          a: '`Link` changes the URL with the History API and renders the new route without reloading the page. `<a>` does a full page load and loses app state.',
        },
      ],
      spoken: `"React Router maps URLs to components in a single-page app without reloading the page. In v6 I define routes with \`element\`, use nested routes with an \`Outlet\` for shared layouts, read params with \`useParams\` and navigate in code with \`useNavigate\`. Since 6.4 I prefer the data router — \`createBrowserRouter\` with loaders, actions and an \`errorElement\` — so data loads before the page renders. For protected routes I use a layout route that redirects with \`Navigate\` when the user isn't logged in. v7 is out now and mostly compatible."`,
      mistakes: [
        'Using `<a href>` for internal links, causing full page reloads.',
        'Forgetting `<Outlet />` in a layout, so nested routes never show.',
        'Using `navigate()` during render instead of in an effect/handler, or not using `replace` on auth redirects.',
        'Follow-up trap: "Is client-side route protection enough for security?" No. It only hides UI. The API must check authentication and authorisation on every request.',
      ],
      takeaway: 'Routes map URLs to elements; nest with Outlet, guard with Navigate, and load data with loaders.',
    },
    {
      id: 'tanstack-query',
      title: 'TanStack Query (React Query)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A server-state library that fetches, caches, dedupes, refetches and syncs API data so you don\'t hand-write it with useEffect.',
      what: `**TanStack Query** (formerly React Query) manages **server state** — data that lives on your backend and is shown in the UI. Instead of \`useEffect\` + \`useState\` for loading, error and data, you write:

\`const { data, isPending, error } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });\`

It gives you for free: **caching**, **deduping** (10 components asking for the same data → 1 request), **background refetching**, **retries**, **pagination/infinite queries**, and **mutations** with cache invalidation.

#### Deeper version
Key ideas:
- **queryKey**: an array that identifies the data, like \`['user', id]\`. When it changes, a new query runs. Include every variable the fetch depends on.
- **staleTime**: how long data is "fresh" (default 0 → refetch on mount/window focus). **gcTime** (called \`cacheTime\` before v5): how long unused data stays in memory (default 5 minutes).
- **Mutations**: \`useMutation\` for POST/PUT/DELETE; on success, call \`queryClient.invalidateQueries({ queryKey: ['todos'] })\` to refetch, or update the cache directly. **Optimistic updates** use \`onMutate\` to update the cache first and roll back in \`onError\`.
- **Server state vs client state**: TanStack Query handles API data; keep UI state (modals, form inputs) in \`useState\`/Zustand. This split often removes the need for Redux.
In v5 the loading flag for "no data yet" is \`isPending\` (v4 used \`isLoading\` for this). API names change between major versions, so check the docs for your version.`,
      why: `Hand-written fetch effects miss caching, race-condition handling, retries, refetch-on-focus and dedupe. TanStack Query solves these with a few lines and makes the UI feel instant with cached data.`,
      analogy: `It's like a smart assistant who remembers answers. Ask "what's the weather?" and they answer from memory immediately, then quietly double-check in the background and update you if it changed.`,
      code: [
        {
          title: 'Query + mutation with invalidation',
          lang: 'jsx',
          code: `import {
  QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } }, // fresh for 30s
});

const fetchProjects = async () => {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to load'); // throw so Query sees the error
  return res.json();
};

function Projects() {
  const qc = useQueryClient();
  const { data, isPending, error } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const addProject = useMutation({
    mutationFn: (name) =>
      fetch('/api/projects', { method: 'POST', body: JSON.stringify({ name }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }), // refetch list
  });

  if (isPending) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <ul>{data.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
      <button disabled={addProject.isPending} onClick={() => addProject.mutate('New project')}>
        Add
      </button>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Projects />
    </QueryClientProvider>
  );
}`,
        },
      ],
      output: `First visit: "Loading…", then the list. Navigating away and back within 30 seconds shows the cached list instantly with **no** request (data is still fresh). After 30 seconds, it shows cached data immediately and refetches in the background. Clicking "Add" disables the button while the POST runs, then invalidates \`['projects']\`, which refetches and shows the new project.`,
      questions: [
        {
          q: 'Why use TanStack Query instead of useEffect for fetching?',
          a: 'It handles caching, deduping, retries, background refetching, race conditions, pagination and mutations with invalidation — all things you\'d otherwise build and debug yourself.',
        },
        {
          q: 'What is the difference between staleTime and gcTime?',
          a: '`staleTime`: how long data counts as fresh (no refetch). `gcTime`: how long inactive cached data is kept in memory before being garbage collected.',
        },
        {
          q: 'What is a query key?',
          a: 'An array that uniquely identifies the cached data, like `[\'user\', id]`. Different keys = different cache entries; changing the key triggers a new fetch.',
        },
        {
          q: 'How do you do optimistic updates?',
          a: 'In `useMutation`\'s `onMutate`, cancel ongoing queries, snapshot the old data, update the cache with `setQueryData`; roll back in `onError`; invalidate in `onSettled`.',
        },
      ],
      spoken: `"TanStack Query is my default for server state. Instead of writing \`useEffect\` with loading and error states, I call \`useQuery\` with a query key and a fetch function, and I get caching, deduping, retries and background refetching. Query keys identify the data, so I include every variable the fetch depends on. For writes I use \`useMutation\` and invalidate the related queries on success, or do optimistic updates with rollback. I keep server state there and only UI state in React state or Zustand, which usually removes the need for Redux."`,
      mistakes: [
        'Leaving a variable out of the query key (e.g. `[\'user\']` instead of `[\'user\', id]`), so different users share one cache entry.',
        'Not throwing on non-2xx responses — `fetch` doesn\'t throw on 404/500, so Query thinks it succeeded.',
        'Copying query data into `useState` and keeping it in sync manually.',
        'Follow-up trap: "Why does my data refetch every time I focus the window?" Default `staleTime` is 0 and `refetchOnWindowFocus` is on. Raise `staleTime` or disable it if the data rarely changes.',
      ],
      takeaway: 'TanStack Query treats API data as a cache keyed by queryKey — fetch with useQuery, change with useMutation, then invalidate.',
    },
    {
      id: 'react-hook-form',
      title: 'react-hook-form',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A form library using uncontrolled inputs and refs for fast forms, with easy validation (often with Zod).',
      what: `**react-hook-form** (RHF) is a popular library for building forms. It registers inputs as **uncontrolled** fields (using refs), so typing does **not** re-render the whole form on every keystroke.

Main API:
- \`useForm()\` → returns \`register\`, \`handleSubmit\`, \`formState: { errors, isSubmitting }\`, \`reset\`, \`watch\`.
- \`{...register('email', { required: 'Email is required' })}\` connects an input.
- \`handleSubmit(onValid)\` validates first, then calls your function with the form data.

#### Deeper version
- **Schema validation**: with \`@hookform/resolvers\`, use a **Zod** (or Yup) schema: \`useForm({ resolver: zodResolver(schema) })\`. With TypeScript you can infer form types from the schema (\`z.infer<typeof schema>\`) and reuse the same schema on the server.
- **Controlled UI libraries** (MUI, React Select, date pickers) use \`<Controller>\` or \`useController\`.
- **Dynamic lists** of fields use \`useFieldArray\`.
- \`watch\` subscribes to values (causes re-renders); \`getValues\` reads without subscribing.
- \`mode\` controls when validation runs (\`onSubmit\` by default, or \`onBlur\`, \`onChange\`, \`onTouched\`).`,
      why: `Large forms with controlled inputs re-render on every key and need lots of boilerplate for errors, touched state and submission. RHF gives better performance and much less code.`,
      analogy: `Controlled forms are like a teacher checking each word as you write. RHF is like a teacher who lets you write the whole answer and then checks it all at once when you hand it in (or when you leave a field, if you ask).`,
      code: [
        {
          title: 'Signup form with Zod validation',
          lang: 'jsx',
          code: `import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), mode: 'onBlur' });

  const onSubmit = async (data) => {
    await fetch('/api/signup', { method: 'POST', body: JSON.stringify(data) });
    reset(); // clear the form after success
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="email" placeholder="Email" {...register('email')} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <input type="password" placeholder="Password" {...register('password')} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <button disabled={isSubmitting}>{isSubmitting ? 'Signing up…' : 'Sign up'}</button>
    </form>
  );
}`,
        },
      ],
      output: `Typing does not re-render the component. When you leave the email field with "abc", "Enter a valid email" appears (because \`mode: 'onBlur'\`). Clicking "Sign up" with a 5-character password shows "At least 8 characters" and \`onSubmit\` is **not** called. With valid data, the button shows "Signing up…" while the request runs, then the form resets.`,
      questions: [
        {
          q: 'Why is react-hook-form fast?',
          a: 'It uses uncontrolled inputs registered by ref, so the DOM holds values and the form doesn\'t re-render on every keystroke; it re-renders only for things you subscribe to (like errors).',
        },
        {
          q: 'How do you use RHF with a UI library\'s controlled component?',
          a: 'Wrap it in `<Controller name="..." control={control} render={({ field }) => <Select {...field} />} />` or use `useController`.',
        },
        {
          q: 'How do you validate with a schema?',
          a: 'Pass `resolver: zodResolver(schema)` to `useForm`. Errors show up in `formState.errors`, and you can share the Zod schema with the backend.',
        },
      ],
      spoken: `"For non-trivial forms I use react-hook-form. It registers inputs as uncontrolled fields with refs, so typing doesn't re-render the whole form — that's why it's fast. I spread \`register('field')\` on inputs, wrap my submit with \`handleSubmit\`, and read \`errors\` and \`isSubmitting\` from \`formState\`. For validation I plug in a Zod schema through \`zodResolver\`, which also gives me TypeScript types and lets me reuse the schema on the Node backend. For controlled components like MUI selects I use \`Controller\`."`,
      mistakes: [
        'Calling `watch()` on the whole form at the top level, which re-renders on every change and cancels the performance benefit.',
        'Spreading `register` onto a custom component that does not forward the ref to the real input.',
        'Validating only on the client. Always validate again on the server.',
        'Follow-up trap: "How do you set values from an API after load?" Use `reset(data)` (or `defaultValues` when data is ready) rather than setting each field manually.',
      ],
      takeaway: 'react-hook-form = uncontrolled, ref-based forms with schema validation — less code, fewer re-renders.',
    },
    {
      id: 'testing-react',
      title: 'Testing React Apps (Strategy and Tools)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Unit, integration and E2E tests with Jest/Vitest, React Testing Library, MSW and Playwright/Cypress.',
      what: `Testing a React app usually has three layers:

1. **Unit tests** — a single function, hook or small component (Jest or **Vitest**).
2. **Integration tests** — several components working together, rendered in a fake DOM (**jsdom**) with **React Testing Library (RTL)**. This is where most React tests live.
3. **End-to-end (E2E) tests** — a real browser clicking through the real app (**Playwright** or **Cypress**).

A popular guideline is the "**testing trophy**": mostly integration tests, some unit and E2E tests, plus static checks (TypeScript, ESLint) at the base.

#### Deeper version
- **Mock the network, not your components**: **MSW (Mock Service Worker)** intercepts \`fetch\` at the network level, so your real data-fetching code runs in tests.
- **Mock modules** only for things you can't control (time, randomness, analytics): \`vi.mock\` / \`jest.mock\`, fake timers with \`vi.useFakeTimers()\`.
- **Test behaviour, not implementation** — don't assert on state variables or internal function calls; assert on what the user sees.
- **Snapshot tests** are easy to write but often approved blindly; use them sparingly.
- **Coverage** is a guide, not a goal; 100% coverage doesn't mean correct behaviour.
- In CI, run unit/integration tests on every PR and E2E on critical flows (login, checkout, payment).`,
      why: `Tests let you refactor and upgrade (React versions, libraries) with confidence, and catch regressions before users do. Interviewers want to know you test real behaviour, not just chase coverage numbers.`,
      analogy: `Unit tests check each brick, integration tests check a wall made of bricks, and E2E tests walk through the finished house to make sure the doors open.`,
      code: [
        {
          title: 'Mocking an API with MSW in a Vitest + RTL test',
          lang: 'jsx',
          code: `// UserList.test.jsx
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import UserList from './UserList';

const server = setupServer(
  http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Asha' }]))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('shows users from the API', async () => {
  render(<UserList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText('Asha')).toBeInTheDocument(); // waits for fetch
});

test('shows an error when the API fails', async () => {
  server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));
  render(<UserList />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
});`,
        },
      ],
      output: `The first test renders \`UserList\`, sees "Loading…", and \`findByText\` waits until MSW's fake response arrives and "Asha" is rendered. The second test overrides the handler to return a 500, and checks that an alert with an error message appears. The component's real \`fetch\` code runs in both tests — only the network is faked. (\`toBeInTheDocument\` comes from \`@testing-library/jest-dom\`, set up in a test setup file.)`,
      questions: [
        {
          q: 'How do you test React applications?',
          a: 'Static checks (TypeScript, ESLint), unit tests for logic and hooks, integration tests with React Testing Library for components, and E2E tests with Playwright/Cypress for critical user flows.',
        },
        {
          q: 'How do you mock API calls in component tests?',
          a: 'Prefer MSW to intercept requests at the network level so real fetching code runs. Alternatively mock the API module with `vi.mock`/`jest.mock`.',
        },
        {
          q: 'What is the difference between unit, integration and E2E tests?',
          a: 'Unit: one isolated piece. Integration: several pieces together (components + hooks + mocked network). E2E: the full app in a real browser against a real or staging backend.',
        },
        {
          q: 'What should you NOT test?',
          a: 'Implementation details (internal state, private functions, which hook was called) and third-party library internals. Test user-visible behaviour.',
        },
      ],
      spoken: `"I think in layers. TypeScript and ESLint catch a lot statically. Then most of my tests are integration tests with React Testing Library and Vitest or Jest, where I render a component, interact like a user and assert on what's on screen. I mock the network with MSW rather than mocking components, so my real fetching code runs. Pure logic and custom hooks get unit tests, and critical flows like login and checkout get Playwright E2E tests in CI. I focus on behaviour, not implementation details or coverage numbers."`,
      mistakes: [
        'Testing implementation details (state values, function call counts) so tests break on every refactor.',
        'Mocking child components and the network so heavily that the test proves nothing.',
        'Relying mostly on snapshot tests that are approved without reading.',
        'Follow-up trap: "Jest or Vitest?" Both have almost the same API. Vitest is faster and natural for Vite projects; Jest is common in older and CRA/Next setups. RTL works with both.',
      ],
      takeaway: 'Mostly integration tests with RTL, network mocked with MSW, E2E for critical paths — always test behaviour.',
    },
    {
      id: 'react-testing-library',
      title: 'React Testing Library (RTL)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Render components and test them the way users use them: find by role/text, interact with userEvent, assert on the screen.',
      what: `**React Testing Library** helps you test components **the way a user uses them**. You render a component, find elements by what users see (role, label, text), interact with them, and check the result.

Guiding principle: "The more your tests resemble the way your software is used, the more confidence they can give you."

Core tools:
- \`render(<Comp />)\` — renders into a fake DOM.
- \`screen.getByRole('button', { name: /save/i })\` — find elements.
- \`userEvent\` (from \`@testing-library/user-event\`) — realistic typing and clicking.
- \`expect(...).toBeInTheDocument()\` — matchers from \`jest-dom\`.

#### Deeper version
**Query types**:
- \`getBy...\` — element must exist now; throws if not found.
- \`queryBy...\` — returns \`null\` if not found; use to assert something is **absent**.
- \`findBy...\` — returns a **Promise**; waits (default ~1s) for async UI.
- \`...AllBy\` variants return arrays.

**Query priority**: \`getByRole\` (best, also checks accessibility) → \`getByLabelText\` → \`getByPlaceholderText\` → \`getByText\` → \`getByTestId\` (last resort). Use \`userEvent.setup()\` and \`await\` each interaction (v14+). Wrap providers (router, query client, theme) in a custom \`render\` helper. Test custom hooks with \`renderHook\`. Avoid manual \`act()\` in most cases — RTL wraps render and events in \`act\` for you; an "act warning" usually means you forgot to \`await\` an async update.`,
      why: `Tests based on what users see survive refactors (renaming state, switching to useReducer) and also push you towards accessible markup, because \`getByRole\` only finds properly labelled elements.`,
      analogy: `RTL tests are like a mystery shopper. They don't inspect the shop's back office (internal state); they walk in, look for the "Pay" button, click it, and check they got a receipt.`,
      code: [
        {
          title: 'Testing a login form',
          lang: 'jsx',
          code: `// LoginForm.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import LoginForm from './LoginForm';

test('submits email and password', async () => {
  const user = userEvent.setup();
  const onLogin = vi.fn().mockResolvedValue(undefined);
  render(<LoginForm onLogin={onLogin} />);

  await user.type(screen.getByLabelText(/email/i), 'asha@example.com');
  await user.type(screen.getByLabelText(/password/i), 'secret123');
  await user.click(screen.getByRole('button', { name: /log in/i }));

  expect(onLogin).toHaveBeenCalledWith({ email: 'asha@example.com', password: 'secret123' });
  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});

test('shows no error before submitting', () => {
  render(<LoginForm onLogin={vi.fn()} />);
  // queryBy returns null instead of throwing -> good for "not present"
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});`,
        },
      ],
      output: `The first test types into inputs found by their labels, clicks the button found by its accessible name, checks that \`onLogin\` received the right data, then waits with \`findByText\` for a "Welcome" message that appears after the async login. The second test proves no error alert is shown initially; using \`getByRole\` there would throw instead of passing.`,
      questions: [
        {
          q: 'What is the difference between getBy, queryBy and findBy?',
          a: '`getBy` throws if missing (use for things that must exist). `queryBy` returns null (use to assert absence). `findBy` returns a promise that waits for the element (use for async UI).',
        },
        {
          q: 'Why prefer getByRole over getByTestId?',
          a: 'Roles reflect how users and assistive technologies find elements, so tests are more realistic and also catch accessibility issues. Test IDs are invisible to users and a last resort.',
        },
        {
          q: 'userEvent vs fireEvent?',
          a: '`fireEvent` dispatches a single DOM event. `userEvent` simulates real interactions (focus, keydown, input, keyup, click) and is recommended.',
        },
        {
          q: 'What does the "not wrapped in act(...)" warning mean?',
          a: 'A state update happened after the test finished interacting, usually an async update. Await it with `findBy`/`waitFor` or await the userEvent call.',
        },
      ],
      spoken: `"React Testing Library is built on the idea of testing like a user. I render the component, find elements by role or label — \`getByRole\` is my first choice because it also checks accessibility — interact with \`userEvent\`, and assert on what's visible. I use \`getBy\` for things that must exist, \`queryBy\` to assert something isn't there, and \`findBy\` for async results. I avoid test IDs and internal state. For providers like the router or React Query, I write a custom render helper."`,
      mistakes: [
        'Using `getBy` to check something is absent — it throws. Use `queryBy` with `.not.toBeInTheDocument()`.',
        'Forgetting to `await` `userEvent` calls (v14+) or `findBy` queries, causing flaky tests and act warnings.',
        'Using `container.querySelector` or test IDs everywhere instead of accessible queries.',
        'Follow-up trap: "How do you test a component that uses React Router or React Query?" Wrap it in `MemoryRouter` / a fresh `QueryClientProvider` (with retries off) in a custom render helper.',
      ],
      takeaway: 'Query by role, act with userEvent, await async UI — test what the user sees, not how the component works inside.',
    },
    {
      id: 'xss-dangerously-set-inner-html',
      title: 'XSS and dangerouslySetInnerHTML',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'React escapes text by default; dangerouslySetInnerHTML and javascript: URLs bypass that, so sanitize untrusted HTML.',
      what: `**XSS (Cross-Site Scripting)** is an attack where someone injects malicious JavaScript into your page — for example in a comment — and it runs in other users' browsers, stealing tokens or acting as them.

React protects you by default: anything you put in \`{ }\` is **escaped**, so \`<script>\` in a string is shown as text, not executed.

\`dangerouslySetInnerHTML={{ __html: html }}\` turns that protection **off** and inserts raw HTML. The scary name is on purpose.

#### Deeper version
Ways XSS still happens in React apps:
- \`dangerouslySetInnerHTML\` with **unsanitized** user content (CMS, markdown, rich-text editors). Sanitize with **DOMPurify** first.
- **\`javascript:\` URLs** in \`href\`/\`src\` from user input (\`<a href={userUrl}>\`). React has warned about \`javascript:\` URLs since 16.9 and newer versions block them, but you should still **validate URLs** (allow only \`http:\`/\`https:\`).
- Direct DOM access via refs (\`ref.current.innerHTML = ...\`) and third-party libraries.
- **SSR**: injecting JSON into a \`<script>\` tag without escaping \`<\`.
- Spreading user-controlled objects as props (\`{...userProps}\`).

Defence in depth: a **Content Security Policy (CSP)** header, **HttpOnly cookies** for auth tokens (JS can't read them), and server-side validation.`,
      why: `One XSS hole can let an attacker take over accounts. Interviewers want to know you understand React's default protection **and** the escape hatches that remove it.`,
      analogy: `React's escaping is like a bank teller who reads every note out loud instead of following instructions written on it. \`dangerouslySetInnerHTML\` is telling the teller "do whatever the note says" — fine only if you've checked the note first.`,
      code: [
        {
          title: 'Escaped by default vs sanitized raw HTML',
          lang: 'jsx',
          code: `import DOMPurify from 'dompurify';

const userComment = '<img src=x onerror="alert(\\'hacked\\')"> Nice post!';

// 1) SAFE: React escapes it -> shown as plain text
function CommentText() {
  return <p>{userComment}</p>;
}

// 2) DANGEROUS: raw HTML from a user -> the onerror script would run
function CommentUnsafe() {
  return <p dangerouslySetInnerHTML={{ __html: userComment }} />;
}

// 3) SAFE ENOUGH: sanitize first, keep allowed tags only
function CommentSanitized() {
  const clean = DOMPurify.sanitize(userComment); // strips onerror
  return <p dangerouslySetInnerHTML={{ __html: clean }} />;
}

// Validate user-provided links
function SafeLink({ url, children }) {
  const isSafe = /^https?:\\/\\//i.test(url);
  return isSafe ? <a href={url} rel="noopener noreferrer" target="_blank">{children}</a> : <span>{children}</span>;
}`,
        },
      ],
      output: `\`CommentText\` shows the literal text \`<img src=x onerror=...> Nice post!\` — nothing runs. \`CommentUnsafe\` inserts a real \`<img>\` whose \`onerror\` fires and shows "hacked" — that is XSS. \`CommentSanitized\` keeps the \`<img>\` but removes the \`onerror\` attribute, so it just shows "Nice post!" with a broken image. \`SafeLink\` renders a link only for http/https URLs; \`javascript:alert(1)\` becomes plain text.`,
      questions: [
        {
          q: 'How does React prevent XSS?',
          a: 'It escapes all values embedded in JSX, so strings are rendered as text, never as HTML or script.',
        },
        {
          q: 'When would you use dangerouslySetInnerHTML?',
          a: 'To render trusted or sanitized HTML, e.g. CMS content or rendered markdown. Always sanitize untrusted input with a library like DOMPurify first.',
        },
        {
          q: 'Is a React app immune to XSS?',
          a: 'No. `dangerouslySetInnerHTML`, `javascript:` URLs, direct DOM manipulation via refs, unsafe third-party code and SSR data injection can all introduce XSS.',
        },
        {
          q: 'Where should you store auth tokens to limit XSS damage?',
          a: 'In HttpOnly, Secure, SameSite cookies, which JavaScript cannot read. Tokens in localStorage can be stolen by any injected script.',
        },
      ],
      spoken: `"XSS is when an attacker gets their script to run in another user's browser. React helps a lot by escaping everything in JSX, so a script in a string is rendered as text. \`dangerouslySetInnerHTML\` turns that off, so I only use it with trusted content or after sanitizing with DOMPurify. I also validate user-provided URLs so \`javascript:\` links can't slip in, avoid writing \`innerHTML\` through refs, and add defence in depth: a Content Security Policy and HttpOnly cookies for tokens so even a successful XSS can't read them."`,
      mistakes: [
        'Rendering markdown/CMS HTML with `dangerouslySetInnerHTML` without sanitizing.',
        'Trusting user-provided URLs in `href` without checking the protocol.',
        'Storing JWTs in localStorage and assuming React\'s escaping is enough.',
        'Follow-up trap: "Does sanitizing on the client replace sanitizing on the server?" No. Validate and sanitize on the server too — other clients or APIs may consume the same data.',
      ],
      takeaway: 'React escapes by default; every escape hatch (raw HTML, URLs, refs) needs sanitizing or validation.',
    },
    {
      id: 'state-management',
      title: 'State Management: Local, Context, Redux Toolkit, Zustand',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Pick the right home for each kind of state: local, URL, server cache, Context, or a global store.',
      what: `"Which state management do you use?" is a classic question. The best answer starts by splitting state into **kinds**:

1. **Local UI state** — a modal is open, input text → \`useState\` / \`useReducer\`.
2. **Server state** — data from your API → **TanStack Query**, SWR, RTK Query, or framework loaders.
3. **URL state** — filters, page number, selected tab → the URL (\`useSearchParams\`), so it's shareable.
4. **Global client state** — theme, auth user, cart, multi-step wizard → **Context** (rarely changing) or a store like **Zustand** or **Redux Toolkit** (frequently changing / complex).
5. **Form state** → react-hook-form.

#### Deeper version
- **Redux Toolkit (RTK)** is the official, modern way to write Redux: \`configureStore\`, \`createSlice\` (uses Immer so you can write "mutating" code safely), RTK Query for data, great DevTools (time-travel), and middleware. Good for large teams needing strict structure.
- **Zustand** is tiny: a hook-based store with **selectors**, so components re-render only when the selected slice changes. Very little boilerplate.
- **Context** has no selectors — every consumer re-renders when the value changes — so it's best for low-frequency data.
- Others: **Jotai** / **Recoil**-style atoms, MobX (observables).
Rule: keep state as **local** as possible; reach for global stores only for truly shared client state. Moving server data to TanStack Query often shrinks the "global" store dramatically.`,
      why: `Putting everything in one global store makes apps slow and hard to change; keeping everything local causes prop drilling and duplicated fetches. Choosing per kind of state gives the simplest working setup.`,
      analogy: `Think of a house: personal items stay in your room (local state), shared things go in the living room (global store), the fridge is restocked from the shop (server cache), and the house address is on the door for anyone to find (URL state).`,
      code: [
        {
          title: 'Zustand store with selectors',
          lang: 'jsx',
          code: `import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  clear: () => set({ items: [] }),
}));

function CartBadge() {
  // Selector: re-renders only when the item count changes
  const count = useCartStore((s) => s.items.length);
  return <span>🛒 {count}</span>;
}

function AddButton({ product }) {
  const addItem = useCartStore((s) => s.addItem); // functions are stable
  return <button onClick={() => addItem(product)}>Add</button>;
}`,
        },
        {
          title: 'Redux Toolkit slice',
          lang: 'jsx',
          code: `import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    added(state, action) {
      state.items.push(action.payload); // Immer makes this immutable under the hood
    },
  },
});

const store = configureStore({ reducer: { cart: cartSlice.reducer } });

function Badge() {
  const count = useSelector((s) => s.cart.items.length);
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(cartSlice.actions.added({ id: 1 }))}>Cart: {count}</button>;
}

export default function App() {
  return <Provider store={store}><Badge /></Provider>;
}`,
        },
      ],
      output: `With Zustand, clicking "Add" updates the store; only components whose selected value changed (the badge count) re-render. With Redux Toolkit, clicking the button dispatches \`cart/added\`, the slice "pushes" the item (Immer creates a new immutable state), and \`useSelector\` re-renders \`Badge\` with "Cart: 1". You can watch every action in Redux DevTools.`,
      questions: [
        {
          q: 'How do you decide where state should live?',
          a: 'By type: local UI → useState; server data → TanStack Query; shareable filters → URL; rarely-changing app-wide data → Context; complex or frequently-changing shared client state → Zustand/Redux Toolkit.',
        },
        {
          q: 'Context vs Redux?',
          a: 'Context only passes a value down and re-renders all consumers on change. Redux (Toolkit) is a full store with selectors, middleware and DevTools, so components re-render only for the data they select.',
        },
        {
          q: 'Why might you choose Zustand over Redux Toolkit?',
          a: 'Less boilerplate, no provider required, selector-based re-renders, tiny bundle. Redux Toolkit wins when you want strict conventions, middleware and powerful DevTools for a large team.',
        },
        {
          q: 'What does Immer do in Redux Toolkit?',
          a: 'It lets you write code that looks like mutation inside `createSlice` reducers, and produces a new immutable state behind the scenes.',
        },
      ],
      spoken: `"I start by separating kinds of state. Local UI state stays in \`useState\`. Server data goes into TanStack Query, which handles caching. Filters and pagination go in the URL so links are shareable. For global client state, I use Context only for rarely-changing things like theme or the auth user, because every consumer re-renders on change. For complex or frequently changing shared state — like a cart or editor — I use Zustand for its simplicity and selectors, or Redux Toolkit on larger teams that want strict structure and DevTools."`,
      mistakes: [
        'Putting server data into Redux and hand-writing loading/error/caching logic.',
        'Using a single Context for all global state and re-rendering the whole app on every change.',
        'Selecting a new object in a selector (`useStore(s => ({ a: s.a, b: s.b }))`) without a shallow compare, causing re-renders every time.',
        'Follow-up trap: "Is Redux dead?" No — Redux Toolkit is still widely used, especially in large codebases. But many apps no longer need it once server state moves to TanStack Query.',
      ],
      takeaway: 'Choose a home per kind of state — local, server cache, URL, Context, or store — and keep it as local as possible.',
    },
    {
      id: 'typescript-with-react',
      title: 'TypeScript with React',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Type props, state, events, refs, hooks and generic components to catch bugs at compile time.',
      what: `TypeScript adds **types** to your React code so mistakes (a missing prop, a wrong event type) are caught **before** the code runs.

Common patterns:
- **Props**: \`type ButtonProps = { label: string; onClick?: () => void };\`
- **Children**: \`children: React.ReactNode\` (anything renderable).
- **State**: \`useState<User | null>(null)\` when the initial value doesn't show the full type.
- **Events**: \`(e: React.ChangeEvent<HTMLInputElement>) => ...\`, \`React.FormEvent<HTMLFormElement>\`.
- **Refs**: \`useRef<HTMLInputElement>(null)\`.

#### Deeper version
- Prefer typing props directly (\`function Button(props: ButtonProps)\`) over \`React.FC\`; \`React.FC\` used to add \`children\` implicitly (removed in React 18 types) and is now mostly a style choice.
- Extend native element props: \`type Props = React.ComponentProps<'button'> & { variant: 'primary' | 'ghost' }\`.
- **Discriminated unions** model mutually exclusive props: \`{ status: 'error'; error: string } | { status: 'ok'; data: User }\`.
- **Generic components**: \`function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode })\`.
- Type context with a default of \`null\` and a custom hook that throws if missing, so consumers get a non-null type.
- Infer types from Zod schemas (\`z.infer\`) to share them with the backend.`,
      why: `In a large codebase, types act as live documentation and make refactors safe: rename a prop and the compiler shows every place to fix. For a MERN developer, sharing types between frontend and Node backend avoids API mismatches.`,
      analogy: `TypeScript is like labelled sockets and plugs. A 3-pin plug just won't go into a 2-pin socket, so you find the problem when building, not when the power is on.`,
      code: [
        {
          title: 'Typed props, state, events and a generic list',
          lang: 'tsx',
          code: `import { useRef, useState, type ComponentProps, type ReactNode } from 'react';

type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };

function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button className={\`btn-\${variant}\`} {...rest} />;
}

type User = { id: string; name: string };

function UserSearch() {
  const [user, setUser] = useState<User | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ id: '1', name: e.target.value });
  };

  return (
    <>
      <input ref={inputRef} onChange={onChange} />
      <Button onClick={() => inputRef.current?.focus()}>Focus</Button>
      <p>{user?.name ?? 'No user'}</p>
    </>
  );
}

// Generic component: T is inferred from "items"
function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => ReactNode }) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

// <List items={[{ id: '1', name: 'Asha' }]} renderItem={(u) => u.name} />  // u is typed as { id, name }`,
        },
      ],
      output: `\`Button\` accepts every native button prop (\`onClick\`, \`disabled\`, \`type\`...) plus \`variant\`; passing \`variant="big"\` is a compile error. In \`UserSearch\`, \`user\` is \`User | null\`, so TypeScript forces the \`?.\` check. In \`List\`, \`renderItem\`'s parameter is automatically typed from the \`items\` you pass in.`,
      questions: [
        {
          q: 'How do you type children?',
          a: '`children: React.ReactNode` — it accepts JSX, strings, numbers, arrays, null and more.',
        },
        {
          q: 'Should you use React.FC?',
          a: 'It\'s optional. Many teams type props directly on the function parameter because it\'s simpler and works with generics. Since React 18 types, `React.FC` no longer adds `children` automatically.',
        },
        {
          q: 'How do you type an input change event?',
          a: '`React.ChangeEvent<HTMLInputElement>`. For forms: `React.FormEvent<HTMLFormElement>`; for clicks: `React.MouseEvent<HTMLButtonElement>`.',
        },
        {
          q: 'How do you reuse native element props?',
          a: '`React.ComponentProps<\'button\'>` (or `ComponentPropsWithoutRef`) and intersect with your own props.',
        },
      ],
      spoken: `"With TypeScript in React I type props with a type alias on the function parameter, use \`React.ReactNode\` for children, and give \`useState\` a generic when the initial value is null. Events have specific types like \`ChangeEvent<HTMLInputElement>\`, and refs are \`useRef<HTMLInputElement>(null)\`. For design-system components I extend native props with \`ComponentProps<'button'>\`. I like discriminated unions for loading, error and success states, and generic components for lists and tables. I also infer types from Zod schemas so frontend and backend share them."`,
      mistakes: [
        'Using `any` for props or API responses, which turns off the safety net.',
        'Typing children as `JSX.Element`, which rejects strings, arrays and null.',
        'Forgetting that `useRef<HTMLDivElement>(null).current` can be `null` and must be checked.',
        'Follow-up trap: "type or interface for props?" Both work. Interfaces can be extended/merged; types handle unions better. Pick one convention per codebase.',
      ],
      takeaway: 'Type props, state, events and refs explicitly; extend native props and use unions/generics for safe, reusable components.',
    },
    {
      id: 'infinite-scroll',
      title: 'Infinite Scroll',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Load the next page automatically when the user nears the bottom, usually with IntersectionObserver and cursor pagination.',
      what: `**Infinite scroll** loads more items automatically as the user scrolls down (like Instagram or Twitter), instead of "Page 1, 2, 3" buttons.

The modern approach:
1. Put an invisible **sentinel** element at the end of the list.
2. Watch it with **IntersectionObserver** (a browser API that tells you when an element enters the screen).
3. When it becomes visible, **fetch the next page** and append it.

#### Deeper version
- Prefer **IntersectionObserver** over \`scroll\` event listeners — scroll handlers fire constantly and need throttling.
- Prefer **cursor-based pagination** (\`?after=lastId\`) over offset (\`?page=3\`) for feeds: new items inserted at the top don't cause duplicates or skipped items.
- Guard against **duplicate requests** (don't fetch while already fetching) and stop when \`hasNextPage\` is false.
- **TanStack Query's \`useInfiniteQuery\`** handles pages, cursors, \`fetchNextPage\`, \`hasNextPage\` and \`isFetchingNextPage\` for you (v5 requires an \`initialPageParam\`).
- For very long lists, combine with **virtualization** so the DOM doesn't grow forever.
- Accessibility/UX: keep a "Load more" button fallback, preserve scroll position on back navigation, and don't put important links in a footer the user can never reach.`,
      why: `It keeps users engaged and avoids loading thousands of items up front. Interviewers ask it to check you know IntersectionObserver, pagination strategies and how to avoid duplicate fetches.`,
      analogy: `It's like a waiter who sees you're about to finish your plate and brings the next dish just in time, instead of putting the whole menu on the table at once.`,
      code: [
        {
          title: 'useInfiniteQuery + IntersectionObserver',
          lang: 'jsx',
          code: `import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchPosts = async ({ pageParam }) => {
  const res = await fetch(\`/api/posts?cursor=\${pageParam ?? ''}&limit=20\`);
  if (!res.ok) throw new Error('Failed');
  return res.json(); // { items: [...], nextCursor: 'abc' | null }
};

export default function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined, // undefined = no more pages
  });

  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '300px' } // start loading a bit before the bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <p>Loading…</p>;
  if (status === 'error') return <p>Could not load posts.</p>;

  return (
    <>
      {data.pages.flatMap((page) => page.items).map((post) => (
        <article key={post.id}>{post.title}</article>
      ))}
      <div ref={sentinelRef} />
      {isFetchingNextPage && <p>Loading more…</p>}
      {!hasNextPage && <p>You're all caught up.</p>}
    </>
  );
}`,
        },
      ],
      output: `The first 20 posts load. When the empty sentinel \`<div>\` comes within 300px of the viewport, the observer calls \`fetchNextPage\`, "Loading more…" appears, and the next 20 posts are appended using the cursor from the last page. When the API returns \`nextCursor: null\`, \`hasNextPage\` becomes false, the observer is not attached, and "You're all caught up." is shown.`,
      questions: [
        {
          q: 'How would you implement infinite scroll?',
          a: 'Render a sentinel at the end of the list, observe it with IntersectionObserver, and fetch the next page when it\'s visible — guarding against duplicate fetches and stopping when there are no more pages.',
        },
        {
          q: 'Why IntersectionObserver instead of a scroll listener?',
          a: 'The browser tells you only when visibility changes, off the main scroll handler path. Scroll listeners fire many times per second and need throttling and manual maths.',
        },
        {
          q: 'Cursor vs offset pagination?',
          a: 'Offset (`page=3`) can skip or duplicate items when new data is inserted. Cursor (`after=lastId`) continues from a specific item, so it\'s stable for live feeds and faster on large tables.',
        },
      ],
      spoken: `"For infinite scroll I put a sentinel element after the list and watch it with IntersectionObserver, usually with a root margin so loading starts a bit early. When it's visible and we're not already fetching, I load the next page. I use cursor-based pagination from the backend so new items don't cause duplicates. In practice I use TanStack Query's \`useInfiniteQuery\`, which tracks pages, the next cursor and loading flags. For really long feeds I combine it with virtualization so the DOM stays small."`,
      mistakes: [
        'Using a raw scroll listener without throttling, hurting performance.',
        'Not guarding against firing `fetchNextPage` multiple times while a request is in flight.',
        'Using offset pagination for a live feed and showing duplicates.',
        'Follow-up trap: "What happens to performance after 5,000 items?" The DOM gets huge and scrolling lags — add list virtualization so only visible rows are rendered.',
      ],
      takeaway: 'Sentinel + IntersectionObserver + cursor pagination (+ virtualization for long feeds) = smooth infinite scroll.',
    },
    {
      id: 'list-virtualization',
      title: 'List Virtualization (Windowing)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Render only the rows visible on screen (plus a small buffer) so huge lists stay fast.',
      what: `If you render 10,000 rows, the browser creates 10,000+ DOM nodes. That makes the first render slow, uses lots of memory and makes scrolling janky.

**Virtualization** (also called **windowing**) renders **only the rows you can see** plus a few extra above and below. As you scroll, it reuses those few DOM nodes for new rows. A tall empty container keeps the scrollbar the correct size.

Popular libraries: **TanStack Virtual**, **react-window**, **react-virtuoso**.

#### Deeper version
How it works: given the scroll position, container height and row height, the library calculates the visible index range (\`start = floor(scrollTop / rowHeight)\`), renders those rows with absolute positioning (\`transform: translateY(...)\`), and sets the inner container's height to \`totalRows * rowHeight\`. **Overscan** renders a few extra rows to avoid blank flashes during fast scrolls. **Variable-height** rows need measuring (TanStack Virtual's \`measureElement\`, or react-virtuoso handles it automatically). Trade-offs: browser **Ctrl+F** can't find off-screen rows, and accessibility needs care (\`aria-rowcount\`, \`aria-rowindex\`). For simple cases, CSS \`content-visibility: auto\` can skip rendering work for off-screen sections without a library. Use virtualization when lists have hundreds to thousands of rows; for 50 items it adds complexity for no benefit.`,
      why: `Tables, chat histories, logs and feeds often have thousands of items. Virtualization keeps render time and memory almost constant no matter how long the list is.`,
      analogy: `It's like a train window. The train passes thousands of trees, but you only ever see the few in the window frame. The window (DOM) stays the same size; only the view inside changes.`,
      code: [
        {
          title: 'TanStack Virtual with 10,000 rows',
          lang: 'jsx',
          code: `import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const rows = Array.from({ length: 10_000 }, (_, i) => ({ id: i, label: \`Row #\${i}\` }));

export default function BigList() {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // row height in px
    overscan: 5,            // extra rows above/below the viewport
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      {/* Full-height spacer keeps the scrollbar correct */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((v) => (
          <div
            key={rows[v.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: v.size,
              transform: \`translateY(\${v.start}px)\`,
            }}
          >
            {rows[v.index].label}
          </div>
        ))}
      </div>
    </div>
  );
}`,
        },
      ],
      output: `The scroll box is 400px tall with a scrollbar sized for 10,000 rows (360,000px). Only about 11 visible rows plus 5 overscan rows on each side exist in the DOM at any time — check DevTools Elements. Scrolling to "Row #9000" is instant because React only renders ~20 rows at that position.`,
      questions: [
        {
          q: 'What is list virtualization?',
          a: 'Rendering only the items currently visible in a scroll container (plus a small buffer) and faking the full height, so huge lists stay fast.',
        },
        {
          q: 'When should you use it?',
          a: 'When lists have hundreds or thousands of rows and you see slow renders, high memory or janky scrolling. Not for small lists.',
        },
        {
          q: 'What are the downsides?',
          a: 'More complex code, tricky variable heights, browser find-in-page can\'t see hidden rows, and extra accessibility work.',
        },
      ],
      spoken: `"Virtualization, or windowing, means rendering only the rows that are visible plus a small overscan buffer. The library calculates which indexes are on screen from the scroll position, absolutely positions just those rows, and uses a spacer with the full height so the scrollbar looks right. I've used TanStack Virtual and react-window for big tables and chat logs. It keeps DOM size constant, but adds complexity — variable row heights need measuring, and browser find doesn't see off-screen rows — so I only use it for genuinely large lists."`,
      mistakes: [
        'Virtualizing small lists, adding complexity without benefit.',
        'Giving the scroll container no fixed height, so everything renders anyway.',
        'Using the virtual index as the key when items can be reordered — use the item\'s real id.',
        'Follow-up trap: "React.memo vs virtualization for a 10k list?" Memo reduces re-render cost but all 10k DOM nodes still exist; virtualization reduces the number of nodes. They can be combined.',
      ],
      takeaway: 'Virtualization keeps huge lists fast by rendering only what\'s on screen.',
    },
    {
      id: 'performance-optimization',
      title: 'React Performance Optimization',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Measure first, then reduce re-renders, shrink bundles, virtualize lists and keep the main thread free.',
      what: `Performance work in React has a simple rule: **measure first, then fix the biggest problem**.

Main areas:
1. **Fewer / cheaper re-renders** — move state down, pass components as \`children\`, \`React.memo\` + \`useMemo\`/\`useCallback\`, split Context.
2. **Less JavaScript** — code splitting with \`lazy\`, tree-shaking, replace heavy libraries (moment → date-fns/dayjs), analyse the bundle.
3. **Less DOM** — virtualize long lists, paginate.
4. **Faster data** — cache with TanStack Query, prefetch, avoid request waterfalls, use SSR/streaming where it helps.
5. **Responsive UI** — \`useTransition\`/\`useDeferredValue\` for heavy updates, debounce inputs, Web Workers for CPU-heavy work.
6. **Assets** — optimise images (lazy loading, modern formats, correct sizes), fonts.

#### Deeper version
Tools: **React DevTools Profiler** (which components render, how long, why), Chrome **Performance** panel (long tasks > 50ms), **Lighthouse** and **Core Web Vitals** (LCP, INP, CLS), and bundle analysers (\`rollup-plugin-visualizer\`, \`webpack-bundle-analyzer\`). Always profile a **production build** — dev mode is much slower. Common culprits: context providers with new object values each render, huge components that hold all state, unstable keys, expensive calculations in render, and effects that set state in a loop. The **React Compiler** (stable since late 2025 — check the docs for current status and setup) automatically memoizes components and values, reducing the need for manual \`memo\`/\`useMemo\`/\`useCallback\`, but structural fixes still matter.`,
      why: `Slow apps lose users and conversions, and INP (responsiveness) is now a Core Web Vital that affects SEO. Interviewers want a structured approach, not a list of hooks.`,
      analogy: `It's like fixing a slow restaurant. First you watch where time goes (profiling). Maybe the chef cooks every dish from scratch (re-renders), the menu is too heavy to carry (bundle), or too many tables are set at once (DOM). Fix the real bottleneck, not everything.`,
      code: [
        {
          title: 'Common fixes in one place',
          lang: 'jsx',
          code: `import { lazy, memo, Suspense, useCallback, useDeferredValue, useMemo, useState } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart')); // 1. code split heavy UI

const Row = memo(function Row({ item, onSelect }) {    // 2. skip unchanged rows
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

export default function Products({ products }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const deferredQuery = useDeferredValue(query);        // 3. keep typing responsive

  const filtered = useMemo(                             // 4. cache expensive work
    () => products.filter((p) => p.name.toLowerCase().includes(deferredQuery.toLowerCase())),
    [products, deferredQuery]
  );

  const onSelect = useCallback((id) => setSelected(id), []); // 5. stable prop for memo

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{filtered.map((p) => <Row key={p.id} item={p} onSelect={onSelect} />)}</ul>
      {selected && (
        <Suspense fallback={<p>Loading chart…</p>}>
          <HeavyChart productId={selected} />
        </Suspense>
      )}
    </>
  );
}`,
        },
        {
          title: 'Measure with the Profiler API',
          lang: 'jsx',
          code: `import { Profiler } from 'react';

function onRender(id, phase, actualDuration) {
  // phase: "mount" | "update" | "nested-update"
  if (actualDuration > 16) console.warn(\`\${id} \${phase} took \${actualDuration.toFixed(1)}ms\`);
}

export function App({ children }) {
  return <Profiler id="ProductsPage" onRender={onRender}>{children}</Profiler>;
}`,
        },
      ],
      output: `Typing stays smooth because the expensive filter uses the deferred query, which React can update at lower priority. Rows that didn't change skip rendering thanks to \`memo\` and the stable \`onSelect\`. The chart code downloads only after a product is selected. The \`Profiler\` logs a warning whenever the page's render takes longer than one frame (~16ms), telling you where to look next.`,
      questions: [
        {
          q: 'How do you approach a slow React app?',
          a: 'Reproduce it, profile a production build with React DevTools and the Performance panel, find the biggest bottleneck (re-renders, bundle size, DOM size, network), fix that, and measure again.',
        },
        {
          q: 'What techniques reduce unnecessary re-renders?',
          a: 'Colocate state, lift content into `children`, split contexts and memoize their values, `React.memo` with stable props via `useMemo`/`useCallback`, and stable keys.',
        },
        {
          q: 'How do you reduce bundle size?',
          a: 'Route-level code splitting, lazy-loading heavy components, tree-shakable imports, removing or replacing heavy dependencies, and checking with a bundle analyser.',
        },
        {
          q: 'What does the React Compiler change?',
          a: 'It automatically memoizes components and values at build time, so much manual `memo`/`useMemo`/`useCallback` becomes unnecessary. It requires code that follows the rules of React. Check the current docs for setup and status.',
        },
      ],
      spoken: `"I always start by measuring — a production build with the React DevTools Profiler and Chrome's Performance tab — to see whether the problem is re-renders, bundle size, DOM size or network. For re-renders I first fix structure: move state down, pass content as children, split contexts. Then I use \`React.memo\` with stable props where the profiler shows value. For bundle size I code-split routes and heavy components. Long lists get virtualized, data gets cached with TanStack Query, and heavy updates use \`useDeferredValue\` or \`useTransition\` to keep typing responsive."`,
      mistakes: [
        'Optimising without measuring, or profiling in development mode.',
        'Adding `useMemo`/`useCallback` everywhere, which adds cost and noise without `memo` consumers.',
        'Ignoring the network and bundle and focusing only on re-renders.',
        'Follow-up trap: "What is INP?" Interaction to Next Paint — a Core Web Vital that measures how quickly the page responds to user input. Long JavaScript tasks hurt it; `useTransition` and breaking up work help.',
      ],
      takeaway: 'Measure first; fix structure before memoizing; attack bundle, DOM and network as well as re-renders.',
    },
    {
      id: 'forwardref-useimperativehandle',
      title: 'forwardRef and useImperativeHandle',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Pass a ref through your component to an inner DOM node, and optionally expose a small custom API instead of the node.',
      what: `By default (React 18 and older), you **cannot** put a \`ref\` on your own function component — \`ref\` is not passed as a prop. \`forwardRef\` fixes that: it gives your component a second argument, \`ref\`, which you attach to an inner element.

\`const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);\`

\`useImperativeHandle\` goes one step further: instead of exposing the whole DOM node, you expose only **specific methods** (like \`focus()\` and \`clear()\`).

#### Deeper version
**React 19 change**: function components now receive \`ref\` as a **normal prop**, so you can write \`function Input({ ref, ...props }) { return <input ref={ref} {...props} />; }\` without \`forwardRef\`. \`forwardRef\` still works in React 19, and the React team has said it will be deprecated in a future version — check the docs for the current status. \`useImperativeHandle(ref, () => ({ focus, clear }), [deps])\` is an **escape hatch**: prefer props for anything that can be expressed declaratively (\`isOpen\` instead of \`modalRef.current.open()\`). Good uses: focusing, scrolling, selecting text, triggering animations, and component libraries that wrap DOM elements.`,
      why: `Reusable components (design-system inputs, buttons) must allow parents to focus or measure them, just like native elements. Exposing a limited handle keeps the component's internals private.`,
      analogy: `\`forwardRef\` is like a receptionist passing your call straight to the person you asked for. \`useImperativeHandle\` is a receptionist who says "you can leave a message or book a meeting" — only specific actions, not full access to the office.`,
      code: [
        {
          title: 'forwardRef (React 18) and ref as a prop (React 19)',
          lang: 'jsx',
          code: `import { forwardRef, useRef } from 'react';

// React 18 style
const TextInput = forwardRef(function TextInput(props, ref) {
  return <input ref={ref} className="input" {...props} />;
});

// React 19 style: ref is just a prop
function TextInput19({ ref, ...props }) {
  return <input ref={ref} className="input" {...props} />;
}

export default function Form() {
  const inputRef = useRef(null);
  return (
    <>
      <TextInput ref={inputRef} placeholder="Name" />
      <button onClick={() => inputRef.current.focus()}>Focus name</button>
    </>
  );
}`,
        },
        {
          title: 'Expose a limited API with useImperativeHandle',
          lang: 'jsx',
          code: `import { forwardRef, useImperativeHandle, useRef } from 'react';

const VideoPlayer = forwardRef(function VideoPlayer({ src }, ref) {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current.play(),
    pause: () => videoRef.current.pause(),
    // the parent cannot reach videoRef.current directly
  }), []);

  return <video ref={videoRef} src={src} width={320} />;
});

export default function Lesson() {
  const playerRef = useRef(null);
  return (
    <>
      <VideoPlayer ref={playerRef} src="/intro.mp4" />
      <button onClick={() => playerRef.current.play()}>Play</button>
      <button onClick={() => playerRef.current.pause()}>Pause</button>
    </>
  );
}`,
        },
      ],
      output: `Clicking "Focus name" focuses the real \`<input>\` inside \`TextInput\`, because the ref was forwarded to it. In the video example, \`playerRef.current\` is the object \`{ play, pause }\`, not the \`<video>\` element. The buttons play and pause the video, but the parent can't, for example, change \`currentTime\` or styles directly.`,
      questions: [
        {
          q: 'Why do we need forwardRef?',
          a: 'In React 18 and earlier, `ref` is not passed to function components as a prop. `forwardRef` lets a component receive the ref and attach it to an inner DOM node or component.',
        },
        {
          q: 'What changed about refs in React 19?',
          a: 'Function components receive `ref` as a regular prop, so `forwardRef` is no longer needed for new code. Ref callbacks can also return a cleanup function.',
        },
        {
          q: 'What is useImperativeHandle for?',
          a: 'Customising what a parent gets through a ref — exposing selected methods like `focus()` or `scrollToTop()` instead of the full DOM node.',
        },
      ],
      spoken: `"Normally a parent can't put a ref on my function component, because in React 18 and older \`ref\` isn't passed as a prop. \`forwardRef\` solves that by giving the component the ref so I can attach it to an inner input, which is essential for design-system components. In React 19, \`ref\` is simply a prop, so \`forwardRef\` isn't needed for new code. \`useImperativeHandle\` lets me expose a small API — like \`play\` and \`pause\` — instead of the raw DOM node. I treat it as an escape hatch and prefer props when possible."`,
      mistakes: [
        'Using imperative handles for things that should be props (like `open()` instead of `isOpen`).',
        'Forgetting that in React 18 a ref on a plain function component without `forwardRef` is `null` and React warns.',
        'Omitting the dependency array of `useImperativeHandle`, recreating the handle each render.',
        'Follow-up trap: "Do I need to remove forwardRef when upgrading to React 19?" No, it still works; you can migrate gradually (React provides a codemod).',
      ],
      takeaway: 'forwardRef passes refs to inner nodes (not needed in React 19); useImperativeHandle exposes a minimal API — use both sparingly.',
    },
    {
      id: 'compound-components',
      title: 'Compound Components',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A set of components that work together and share implicit state through Context, like <Tabs>, <Tabs.List>, <Tabs.Panel>.',
      what: `**Compound components** are a group of components designed to be used **together**, like HTML's \`<select>\` and \`<option>\`. The parent owns the state, and the children read it **implicitly** (through Context) — the user doesn't pass state to each child by hand.

\`\`\`jsx
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="billing">Billing</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="profile">...</Tabs.Panel>
</Tabs>
\`\`\`

#### Deeper version
This pattern gives the user full control over **markup and order** (put the tab list at the bottom, add icons, wrap tabs in tooltips) while the component keeps control over **behaviour**. It's used by headless UI libraries such as Radix UI, Headless UI, Reach UI and React Aria. Implementation: create a context in the parent, provide \`{ active, setActive }\`, and have each child read it with a custom hook that throws if used outside the parent. Add support for both **controlled** (\`value\` + \`onValueChange\`) and **uncontrolled** (\`defaultValue\`) usage, and wire up ARIA roles (\`tablist\`, \`tab\`, \`tabpanel\`) and keyboard navigation for accessibility.`,
      why: `A single \`<Tabs tabs={[...]} />\` component with a big config prop becomes rigid and grows endless props (\`tabIcon\`, \`tabClassName\`, \`renderTabFooter\`...). Compound components give a flexible, readable API.`,
      analogy: `It's like a TV remote and the TV. The buttons (children) don't need wires to each other — they all talk to the same TV (shared context), and you can arrange the buttons however you like on the remote.`,
      code: [
        {
          title: 'Tabs built as compound components',
          lang: 'jsx',
          code: `import { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
  return ctx;
}

function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}

function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ value, children }) {
  const { active, setActive } = useTabs();
  return (
    <button role="tab" aria-selected={active === value} onClick={() => setActive(value)}>
      {children}
    </button>
  );
}

function Panel({ value, children }) {
  const { active } = useTabs();
  return active === value ? <div role="tabpanel">{children}</div> : null;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = Panel;

export default function Settings() {
  return (
    <Tabs defaultValue="profile">
      <Tabs.List>
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="billing">💳 Billing</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="profile">Edit your name and photo.</Tabs.Panel>
      <Tabs.Panel value="billing">Manage your Stripe subscription.</Tabs.Panel>
    </Tabs>
  );
}`,
        },
      ],
      output: `The page shows two tabs with "Profile" selected and its panel text visible. Clicking "💳 Billing" calls \`setActive('billing')\` from context; the Profile panel returns \`null\` and the Billing panel shows "Manage your Stripe subscription." The user of \`Tabs\` never passes \`active\` or \`setActive\` manually. Using \`<Tabs.Tab>\` outside \`<Tabs>\` throws a clear error.`,
      questions: [
        {
          q: 'What are compound components?',
          a: 'Components that work together and share implicit state via Context, giving users control over structure while the parent controls behaviour — e.g. `Tabs`, `Accordion`, `Select`.',
        },
        {
          q: 'How do the children get the shared state?',
          a: 'The parent provides it with a Context provider; each child reads it with `useContext` (usually through a custom hook that validates the provider exists).',
        },
        {
          q: 'What are the benefits over a config-object API?',
          a: 'Flexible markup and order, fewer props, easier customisation, and a readable declarative API.',
        },
      ],
      spoken: `"Compound components are a group of components that share state implicitly, like \`Tabs\`, \`Tabs.Tab\` and \`Tabs.Panel\`. The parent holds the state and provides it through Context, and each child reads it with a custom hook that throws if it's used outside the parent. The user gets full control over layout and content without passing state around, which is why libraries like Radix use this pattern. When I build one I support both controlled and uncontrolled modes and add the right ARIA roles and keyboard handling."`,
      mistakes: [
        'Relying on `React.Children.map` and `cloneElement` to inject props — it breaks when children are wrapped in other elements. Context is more robust.',
        'Not validating that children are used inside the parent, leading to confusing `undefined` errors.',
        'Forgetting accessibility roles and keyboard navigation for tabs, menus and accordions.',
        'Follow-up trap: "How would you make it controlled?" Accept optional `value` and `onValueChange` props; if `value` is provided use it, otherwise fall back to internal state.',
      ],
      takeaway: 'Compound components share parent state through Context so users compose the markup while the parent owns the behaviour.',
    },
    {
      id: 'fiber-architecture',
      title: 'Fiber Architecture',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'React\'s internal engine (since React 16) that splits rendering into small units of work that can be paused, prioritised and resumed.',
      what: `**Fiber** is the internal engine React has used since **React 16**. It replaced the older "stack reconciler".

The old reconciler rendered the whole tree in **one go**, using recursion. Once it started, it couldn't stop — a big update could freeze the page.

Fiber breaks rendering into **small units of work**, one per component (each unit is called a **fiber**). Between units React can **pause**, let the browser handle user input, and then **continue** — or throw the work away if something more important comes in.

#### Deeper version
A **fiber** is a JavaScript object for one component instance. It stores the component \`type\`, \`key\`, props, the **hooks list** (the linked list where your \`useState\` values live), pointers to \`child\`, \`sibling\` and \`return\` (parent), and **flags** describing needed DOM changes. React keeps two trees: the **current** tree (on screen) and the **work-in-progress** tree (being built) — this is called **double buffering**. Work happens in two phases:
- **Render phase** — walk the tree, call components, diff. **Interruptible**, no side effects (this is why render must be pure).
- **Commit phase** — apply DOM changes, attach refs, run layout effects, then schedule effects. **Synchronous**, cannot be interrupted.

Updates get **priorities** (called **lanes** internally): a click or keypress is urgent, a \`startTransition\` update is not. This is the foundation that makes **concurrent rendering**, \`useTransition\`, Suspense and streaming SSR possible.`,
      why: `Without Fiber, React couldn't keep the UI responsive during big updates, and features like transitions, Suspense and concurrent rendering wouldn't exist.`,
      analogy: `The old reconciler was like a chef who must finish a 2-hour dish before answering the door. Fiber is a chef who cooks in small steps and checks the door between steps — if a VIP arrives (a click), they serve them first and then continue cooking.`,
      code: [
        {
          title: 'A simplified fiber node and work loop (conceptual)',
          lang: 'javascript',
          code: `// Conceptual only — not React's real source code.
const fiber = {
  type: 'UserCard',          // component function or 'div'
  key: null,
  pendingProps: { id: 7 },
  memoizedState: null,       // head of the hooks linked list (useState, useEffect...)
  child: null,               // first child fiber
  sibling: null,             // next sibling fiber
  return: null,              // parent fiber
  alternate: null,           // the matching fiber in the other tree (current <-> work-in-progress)
  flags: 0,                  // what to do in commit: Placement, Update, Deletion...
};

// Interruptible work loop (simplified idea behind concurrent rendering)
function workLoop(deadline) {
  let next = getNextUnitOfWork();
  while (next && deadline.timeRemaining() > 1) {
    next = performUnitOfWork(next); // render ONE component, return the next fiber
  }
  if (next) requestIdleCallback(workLoop); // yield to the browser, continue later
  else commitRoot();                        // all done: apply DOM changes in one go
}

function getNextUnitOfWork() { return null; }
function performUnitOfWork() { return null; }
function commitRoot() { console.log('commit'); }`,
        },
      ],
      output: `This is a mental model, not runnable React internals. Each component becomes a fiber object linked to its parent, child and sibling, so React can walk the tree **without recursion** and stop anywhere. The work loop processes one fiber at a time and yields to the browser when time runs out. (React actually uses its own scheduler, not \`requestIdleCallback\`.) Only when the whole tree is done does it commit all DOM changes at once, so users never see a half-updated UI.`,
      questions: [
        {
          q: 'What is React Fiber?',
          a: 'The reconciliation engine introduced in React 16. It represents each component as a fiber node and splits rendering into small, interruptible units of work with priorities.',
        },
        {
          q: 'Why did React move to Fiber?',
          a: 'The old stack reconciler was synchronous and recursive, so large updates blocked the main thread. Fiber enables pausing, prioritising and resuming work — the base for concurrent features.',
        },
        {
          q: 'What are the render and commit phases?',
          a: 'Render: compute what changed (pure, interruptible, may run more than once). Commit: apply DOM updates and run layout effects (synchronous, runs once per update).',
        },
        {
          q: 'Where are hook values stored?',
          a: 'On the component\'s fiber, as a linked list in call order. That\'s why hooks must be called in the same order every render.',
        },
      ],
      spoken: `"Fiber is React's reconciliation engine since React 16. Each component instance gets a fiber object that holds its type, props, hooks state and links to its parent, child and sibling. Because the tree is a linked structure, React can process one unit of work at a time and pause to let the browser handle input, then resume or discard the work. Rendering is split into an interruptible render phase and a synchronous commit phase. Fiber also assigns priorities to updates, which is what makes concurrent features like \`useTransition\` and Suspense possible."`,
      mistakes: [
        'Saying Fiber "makes React faster". It makes React more **responsive** by scheduling work; total work may be similar.',
        'Thinking the commit phase can be interrupted. Only the render phase can.',
        'Putting side effects in render, which can run several times or be thrown away under Fiber.',
        'Follow-up trap: "Is concurrent rendering on by default in React 18?" Concurrent features are opt-in per update (e.g. `startTransition`, `useDeferredValue`, Suspense). With `createRoot`, normal updates still render synchronously.',
      ],
      takeaway: 'Fiber turns rendering into small, prioritised, interruptible units of work — the foundation of concurrent React.',
    },
    {
      id: 'react-18-concurrent-batching',
      title: 'React 18: Concurrent Features and Automatic Batching',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'createRoot, automatic batching everywhere, transitions, Suspense on the server and new hooks.',
      what: `React 18 (released March 2022) was mainly about **concurrent rendering** — React can prepare several versions of the UI and **interrupt** less important work to handle urgent updates.

What's new:
1. **\`createRoot\`** replaces \`ReactDOM.render\`. You need it to use the new features.
2. **Automatic batching**: multiple \`setState\` calls are combined into **one** re-render **everywhere** — including inside \`setTimeout\`, promises and native event handlers. Before 18, batching only happened inside React event handlers.
3. **Transitions**: \`startTransition\` / \`useTransition\` mark updates as non-urgent.
4. **\`useDeferredValue\`**: show a lagging copy of a value for heavy UI.
5. **Suspense improvements** + **streaming SSR** with selective hydration.
6. New hooks: \`useId\`, \`useSyncExternalStore\` (for store libraries), \`useInsertionEffect\` (for CSS-in-JS).
7. **StrictMode** now double-runs effects in development.

#### Deeper version
Concurrency is **opt-in per update**: normal updates are still urgent; only updates wrapped in a transition (or deferred values) can be interrupted. To opt **out** of automatic batching for a specific case (e.g. you need to read the DOM right after a state update), use \`flushSync(() => setX(1))\` from \`react-dom\`. On the server, \`renderToPipeableStream\` streams HTML in chunks: parts wrapped in \`<Suspense>\` can arrive later, and **selective hydration** hydrates the part the user interacts with first. \`useSyncExternalStore\` exists because concurrent rendering could cause **tearing** — different components showing different values of the same external store during one render.`,
      why: `Big apps had janky typing and slow initial loads. Automatic batching cuts wasted renders; transitions keep inputs responsive; streaming SSR gets HTML to users faster.`,
      analogy: `Automatic batching is like a waiter collecting all orders from a table before going to the kitchen, instead of running back after each person orders — even if the table orders over the phone (setTimeout/promise), not just in person.`,
      code: [
        {
          title: 'createRoot and automatic batching',
          lang: 'jsx',
          code: `import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  console.log('render', count, flag);

  const handleClick = () => {
    fetch('/api/ping').finally(() => {
      // React 18: batched into ONE render (React 17: two renders here)
      setCount((c) => c + 1);
      setFlag((f) => !f);
    });
  };

  const handleUrgent = () => {
    flushSync(() => setCount((c) => c + 1)); // render immediately
    // DOM is already updated here
    setFlag((f) => !f);                       // separate render
  };

  return (
    <>
      <button onClick={handleClick}>Batched</button>
      <button onClick={handleUrgent}>flushSync</button>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);`,
        },
      ],
      output: `Clicking "Batched" logs "render" **once** after the fetch finishes, because React 18 batches the two updates even inside a promise callback. In React 17 with \`ReactDOM.render\` it would log twice. Clicking "flushSync" logs "render" twice: \`flushSync\` forces the first update to render and commit immediately, then the second update renders separately.`,
      questions: [
        {
          q: 'What is automatic batching?',
          a: 'React 18 groups multiple state updates into a single re-render everywhere — in timeouts, promises and native handlers — not just in React event handlers.',
        },
        {
          q: 'How do you opt out of batching?',
          a: 'Wrap the update in `flushSync` from `react-dom`, which renders and commits synchronously.',
        },
        {
          q: 'What is concurrent rendering?',
          a: 'React\'s ability to prepare UI updates in the background, interrupt them for urgent work (like typing) and discard outdated work. You opt in per update with transitions, deferred values and Suspense.',
        },
        {
          q: 'What do you need to do to upgrade to React 18?',
          a: 'Switch from `ReactDOM.render` to `createRoot`, fix StrictMode double-effect issues (missing cleanups), and update libraries using external stores to `useSyncExternalStore`.',
        },
      ],
      spoken: `"React 18's big theme is concurrent rendering. You switch to \`createRoot\`, and then you get automatic batching everywhere — multiple setState calls in a promise or timeout become one render, not just in event handlers. You can opt out with \`flushSync\`. Concurrency is opt-in per update: \`useTransition\` and \`useDeferredValue\` mark work as non-urgent so React can interrupt it for typing. It also brought streaming SSR with Suspense and selective hydration, plus new hooks like \`useId\` and \`useSyncExternalStore\`, and the StrictMode double effect run in dev."`,
      mistakes: [
        'Saying React 18 makes every render concurrent. Only transitions/deferred updates are interruptible.',
        'Keeping `ReactDOM.render` and expecting React 18 features — it runs in legacy mode.',
        'Relying on reading the DOM right after `setState` outside React events; with batching, use `flushSync` or an effect.',
        'Follow-up trap: "What is tearing?" When different components show different values from the same external store in one render because rendering was interrupted. `useSyncExternalStore` prevents it.',
      ],
      takeaway: 'React 18 = createRoot, batching everywhere, opt-in concurrent updates, streaming SSR and new hooks.',
    },
    {
      id: 'use-transition-deferred-value',
      title: 'useTransition and useDeferredValue',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Mark updates as non-urgent so React keeps typing and clicks responsive while heavy UI renders in the background.',
      what: `Some updates are **urgent** (typing in an input, clicking a button) and some are **not urgent** (filtering a huge list, switching to a heavy tab). React 18 lets you tell them apart:

- **\`useTransition\`** — wrap a **state update** in \`startTransition\`. React renders it at low priority and can interrupt it. You also get \`isPending\` to show a hint.
- **\`useDeferredValue\`** — take a **value** and get a "lagging" copy that updates at low priority. Useful when you don't control the state update (e.g. it comes from props).

#### Deeper version
Use \`useTransition\` when you **own the setter**; use \`useDeferredValue\` when you only **receive the value**. Rules and details:
- Do **not** wrap controlled input updates in a transition — the input itself must update urgently. Update the input state normally and transition (or defer) the expensive part.
- Transitions are interruptible: if the user types again, React drops the outdated render and starts the new one.
- During a transition, React keeps showing the **old UI** instead of a Suspense fallback, which avoids flashes of spinners when navigating.
- Neither hook makes rendering faster; they make the app **feel** responsive. The slow component should usually be wrapped in \`memo\` so the deferred value actually skips work during urgent renders.
- **React 19**: \`startTransition\` accepts **async functions** ("Actions"), and \`isPending\` stays true until the async work finishes.
- Unlike debounce, there's no fixed delay: on a fast device the deferred render happens almost instantly.`,
      why: `Without them, typing into a search box that filters 20,000 rows freezes because every keystroke triggers a heavy render. These hooks keep the input smooth (and improve INP).`,
      analogy: `At an airport, passengers with a flight in 10 minutes (urgent updates) go through the fast lane, while others (transitions) wait in the normal lane. If a passenger's plans change, they leave the queue and rejoin with new plans (interrupted render).`,
      code: [
        {
          title: 'useTransition for a heavy tab switch',
          lang: 'jsx',
          code: `import { useState, useTransition } from 'react';

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [isPending, startTransition] = useTransition();

  const selectTab = (next) => {
    startTransition(() => {
      setTab(next); // low priority: clicks stay responsive while the heavy tab renders
    });
  };

  return (
    <>
      <button onClick={() => selectTab('overview')}>Overview</button>
      <button onClick={() => selectTab('reports')}>Reports (slow)</button>
      {isPending && <span> Loading…</span>}
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {tab === 'overview' ? <p>Overview</p> : <SlowReports />}
      </div>
    </>
  );
}

function SlowReports() {
  const start = performance.now();
  while (performance.now() - start < 300) { /* simulate 300ms of render work */ }
  return <p>Reports ready</p>;
}`,
        },
        {
          title: 'useDeferredValue for search results',
          lang: 'jsx',
          code: `import { memo, useDeferredValue, useState } from 'react';

const Results = memo(function Results({ query }) {
  const items = Array.from({ length: 20000 }, (_, i) => \`Item \${i}\`)
    .filter((x) => x.includes(query));
  return <p>{items.length} matches for "{query}"</p>;
});

export default function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query); // lags behind while typing
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <Results query={deferredQuery} />
      </div>
    </>
  );
}`,
        },
      ],
      output: `In the first example, clicking "Reports" shows "Loading…" and dims the old content while the slow tab renders in the background; clicking "Overview" during that time interrupts it immediately. In the second example, the input updates instantly on every key. \`Results\` re-renders with the deferred query a moment later, and the results look faded while they're stale.`,
      questions: [
        {
          q: 'useTransition vs useDeferredValue?',
          a: '`useTransition` wraps a state update you control and gives `isPending`. `useDeferredValue` wraps a value (e.g. from props) and gives a lagging version. Both mark work as low priority.',
        },
        {
          q: 'How is useDeferredValue different from debouncing?',
          a: 'Debounce waits a fixed time and always delays. Deferred values have no fixed delay, render as soon as the device is free, and can be interrupted by newer input.',
        },
        {
          q: 'Can you put a controlled input update inside startTransition?',
          a: 'No — the input would feel laggy. Keep the input update urgent and transition/defer the expensive render.',
        },
        {
          q: 'What changed with transitions in React 19?',
          a: '`startTransition` can take an async function (an Action). `isPending` stays true until it completes, which powers form Actions and `useActionState`.',
        },
      ],
      spoken: `"\`useTransition\` and \`useDeferredValue\` let me mark work as non-urgent. With \`useTransition\` I wrap a state update in \`startTransition\`, React renders it at low priority and can interrupt it, and I get \`isPending\` to show a hint — great for heavy tab switches or navigation. \`useDeferredValue\` gives me a lagging copy of a value, which I use for search results while keeping the input instant. They don't make rendering faster, they keep the UI responsive. In React 19, transitions also accept async functions, which is the basis of Actions."`,
      mistakes: [
        'Wrapping the input\'s own state update in `startTransition`, making typing lag.',
        'Using `useDeferredValue` without `memo` on the slow child, so it still re-renders on every urgent update.',
        'Expecting transitions to speed up slow code — fix truly slow code too (memoize, virtualize).',
        'Follow-up trap: "Does startTransition delay the update like setTimeout?" No. It runs right away but at lower priority and is interruptible; it\'s not a timer.',
      ],
      takeaway: 'Transitions and deferred values keep urgent interactions snappy by rendering heavy updates at low, interruptible priority.',
    },
    {
      id: 'use-sync-external-store',
      title: 'useSyncExternalStore',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'The official hook for subscribing to data outside React (stores, browser APIs) safely under concurrent rendering.',
      what: `\`useSyncExternalStore\` (React 18+) lets a component read data that lives **outside React** — a Redux/Zustand store, \`navigator.onLine\`, \`window.matchMedia\`, \`localStorage\` — and re-render when it changes.

\`const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);\`

- \`subscribe(callback)\` — start listening; return an unsubscribe function.
- \`getSnapshot()\` — return the current value.
- \`getServerSnapshot()\` — value to use during SSR and hydration.

#### Deeper version
Why not just \`useEffect\` + \`useState\`? With concurrent rendering, React may pause in the middle of a render. If the external store changes during that pause, some components could render the old value and others the new one — called **tearing**. \`useSyncExternalStore\` guarantees all components see the **same** snapshot. \`getSnapshot\` must return a **cached/immutable** value: if it returns a new object each call (\`{ ...state }\`), React sees a change every time and loops ("The result of getSnapshot should be cached"). Define \`subscribe\` outside the component (or memoize it) so React doesn't resubscribe on each render. Most app developers use it indirectly — Redux, Zustand and others use it under the hood.`,
      why: `It gives a correct, simple way to connect React to any external source of truth, including browser APIs, without tearing bugs or manual effect wiring.`,
      analogy: `It's like everyone in a meeting looking at the same shared screen instead of each person checking their own phone at slightly different times — nobody quotes a different number.`,
      code: [
        {
          title: 'Online status hook',
          lang: 'jsx',
          code: `import { useSyncExternalStore } from 'react';

// Defined outside the component -> stable references
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}
const getSnapshot = () => navigator.onLine;     // returns a primitive: safe
const getServerSnapshot = () => true;           // assume online during SSR

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function StatusBar() {
  const online = useOnlineStatus();
  return <p>{online ? '✅ Online' : '❌ Offline — changes will sync later'}</p>;
}`,
        },
      ],
      output: `\`StatusBar\` shows "✅ Online". If you switch DevTools to "Offline", the browser fires an \`offline\` event, React calls \`getSnapshot\`, sees \`false\`, and re-renders to show "❌ Offline — changes will sync later". On the server it renders the online version, matching \`getServerSnapshot\`.`,
      questions: [
        {
          q: 'What problem does useSyncExternalStore solve?',
          a: 'Safely subscribing to external (non-React) data under concurrent rendering, preventing tearing where components show different versions of the same data.',
        },
        {
          q: 'Why must getSnapshot return a cached value?',
          a: 'React compares snapshots with `Object.is`. A new object every call looks like a change every time, causing infinite re-renders.',
        },
        {
          q: 'Do you use it directly?',
          a: 'Mostly in small custom hooks for browser APIs or a hand-written store. Libraries like Redux and Zustand use it internally.',
        },
      ],
      spoken: `"\`useSyncExternalStore\` is the React 18 hook for reading data that lives outside React, like a store or browser APIs such as online status. I give it a subscribe function, a getSnapshot function and optionally a server snapshot for SSR. The reason it exists is concurrent rendering: with plain effects, a store could change mid-render and different components would show different values — tearing. This hook prevents that. The main gotcha is that getSnapshot must return a cached value, not a new object every time."`,
      mistakes: [
        'Returning a new object/array from `getSnapshot` each call, causing an infinite loop.',
        'Defining `subscribe` inline in the component, causing resubscription every render.',
        'Using it for data that should simply be React state.',
        'Follow-up trap: "What is tearing?" Different parts of the UI showing different values of the same external data in a single render, possible when rendering is interrupted.',
      ],
      takeaway: 'useSyncExternalStore is the tear-free bridge from external stores and browser APIs into React.',
    },
    {
      id: 'hydration',
      title: 'SSR and Hydration',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'The server sends ready HTML; hydration attaches React\'s event handlers and state to it on the client — both must render the same output.',
      what: `**Server-Side Rendering (SSR)** means the server runs your React components and sends **ready-made HTML**. The user sees content quickly, and search engines can read it.

But that HTML is "dry" — buttons don't work yet. **Hydration** is when React loads on the client, renders the same components again, and **attaches event handlers and state** to the existing HTML instead of rebuilding it.

\`hydrateRoot(document.getElementById('root'), <App />)\`

#### Deeper version
The client's first render **must match** the server HTML. If not, you get a **hydration mismatch** error, and React may throw away the server HTML and re-render on the client (slow, and can flash). Common causes:
- \`Date.now()\`, \`Math.random()\`, or locale/time-zone formatting that differs between server and client.
- Reading \`window\`, \`localStorage\` or \`navigator\` during render.
- Invalid HTML nesting (\`<div>\` inside \`<p>\`), which the browser silently "fixes".
- Browser extensions modifying the DOM.

Fixes: move browser-only logic into \`useEffect\` (runs only on the client), render a placeholder first then update after mount, use \`useId\` for IDs, or \`suppressHydrationWarning\` for unavoidable one-element differences like timestamps. React 18 added **streaming SSR** and **selective hydration**: \`<Suspense>\` boundaries can stream in later and hydrate independently, prioritising what the user clicks. Frameworks (Next.js, Remix/React Router) handle this setup for you. React Server Components go further by sending components that never hydrate at all.`,
      why: `SSR improves first paint, SEO and social link previews. Hydration makes that HTML interactive without throwing it away. Understanding mismatches is essential for Next.js work.`,
      analogy: `SSR is like a restaurant sending a photo-perfect plated dish (HTML) right away. Hydration is the waiter arriving with cutlery so you can actually eat (interactivity). If the dish on your plate doesn't match the order slip the waiter has (mismatch), they take it back and remake it.`,
      code: [
        {
          title: 'A hydration mismatch and the fix',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

// BAD: server and client produce different text
function GreetingBad() {
  const hour = new Date().getHours();           // server time zone vs user time zone
  return <p>{hour < 12 ? 'Good morning' : 'Good evening'}</p>;
}

// GOOD: same first render on both sides, then update on the client
function GreetingGood() {
  const [greeting, setGreeting] = useState('Hello'); // identical on server and client
  useEffect(() => {
    const hour = new Date().getHours();               // runs only in the browser
    setGreeting(hour < 12 ? 'Good morning' : 'Good evening');
  }, []);
  return <p>{greeting}</p>;
}

// BAD: window doesn't exist on the server
// const width = window.innerWidth;  -> ReferenceError during SSR`,
        },
        {
          title: 'Client entry for an SSR app',
          lang: 'jsx',
          code: `// entry-client.jsx
import { hydrateRoot } from 'react-dom/client';
import App from './App';

// Attach to the server-rendered HTML instead of creating it from scratch
hydrateRoot(document.getElementById('root'), <App />);`,
        },
      ],
      output: `With \`GreetingBad\`, a server in UTC might render "Good morning" while a user in India at 8 pm renders "Good evening" — React reports a hydration mismatch. \`GreetingGood\` renders "Hello" on both sides, so hydration succeeds; right after, the effect runs in the browser and updates to the correct greeting for the user's local time.`,
      questions: [
        {
          q: 'What is hydration?',
          a: 'The process where client-side React takes over server-rendered HTML: it renders the same tree, matches it to the existing DOM, and attaches event handlers and state.',
        },
        {
          q: 'What causes hydration mismatches?',
          a: 'Different output between server and client: dates/random values, browser-only APIs during render, locale differences, invalid HTML nesting, or extensions changing the DOM.',
        },
        {
          q: 'How do you render browser-only content safely?',
          a: 'Render a neutral placeholder first and switch in `useEffect` after mount, or use a client-only dynamic import (e.g. `next/dynamic` with `ssr: false` in Next.js).',
        },
        {
          q: 'What is selective hydration?',
          a: 'In React 18 streaming SSR, Suspense boundaries hydrate independently, and React prioritises hydrating the part the user is interacting with.',
        },
      ],
      spoken: `"With SSR the server renders HTML so users see content fast and search engines can index it. Hydration is React on the client rendering the same tree and attaching event handlers and state to that existing HTML instead of recreating it. The key rule is the first client render must match the server output. Mismatches usually come from dates, random values, \`window\` or \`localStorage\` in render, or invalid HTML nesting. I fix them by moving browser-only logic into \`useEffect\` or a client-only component. React 18 also streams HTML and hydrates Suspense boundaries selectively."`,
      mistakes: [
        'Reading `window`/`localStorage` during render in SSR code.',
        'Using `suppressHydrationWarning` to hide real bugs — it only works one level deep and is for unavoidable differences.',
        'Rendering `<div>` inside `<p>` (invalid nesting) and getting confusing mismatches.',
        'Follow-up trap: "Is the page interactive as soon as HTML arrives?" No. It\'s visible, but clicks do nothing until the JavaScript loads and hydration completes — which is why bundle size still matters with SSR.',
      ],
      takeaway: 'SSR sends HTML; hydration makes it interactive — the client\'s first render must match the server exactly.',
    },
    {
      id: 'react-server-components',
      title: 'React Server Components (RSC)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Components that run only on the server, can access data directly and ship zero JavaScript; client components handle interactivity.',
      what: `**React Server Components (RSC)** are components that **run only on the server** (at build time or request time). Their code is **never sent to the browser**.

- A Server Component can be \`async\` and **fetch data directly** (query MongoDB, read files, call APIs with secret keys).
- It cannot use state, effects, or event handlers (\`useState\`, \`onClick\`) — there's no interactivity on the server.
- **Client Components** are marked with \`'use client'\` at the top of the file. They work like normal React components (state, effects, events) and are hydrated in the browser.

You use them through a framework — most commonly the **Next.js App Router**, where components are Server Components by default.

#### Deeper version
- **SSR vs RSC**: SSR renders components to HTML, but all their code still ships and hydrates. RSC components **never hydrate** and add **zero** client JavaScript; the server sends a special serialized format (the "RSC payload") that React merges into the tree.
- **Boundaries**: \`'use client'\` marks an entry point — that file and everything it imports become client code. Server Components can render Client Components and pass them **serializable props** (no functions, except Server Actions). Client Components can't import Server Components, but can receive them as \`children\`.
- **Server Functions / Server Actions**: functions marked \`'use server'\` that client code can call (e.g. from a form \`action\`) and that run on the server.
- Server Components and Server Actions are **stable in React 19**, but the low-level APIs that bundlers/frameworks use to implement them can still change between minor versions, so in practice you rely on your framework. Check your framework's docs for caching and data-fetching behaviour, which has changed between Next.js versions.`,
      why: `They reduce bundle size (heavy libraries like markdown parsers stay on the server), remove client–server request waterfalls, keep secrets on the server, and let you fetch data right where it's used.`,
      analogy: `Server Components are like a restaurant kitchen: the cooking (data access, heavy work) happens in the back and you only receive the finished plate. Client Components are the salt and pepper on your table — small things you can interact with yourself.`,
      code: [
        {
          title: 'Next.js App Router: server page + client button',
          lang: 'jsx',
          code: `// app/products/page.jsx — Server Component (default, no directive)
import { db } from '@/lib/db';               // server-only code, never shipped
import AddToCart from './AddToCart';

export default async function ProductsPage() {
  const products = await db.product.findMany({ take: 20 }); // direct DB access
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name} — ₹{p.price}
          <AddToCart productId={p.id} />      {/* serializable props only */}
        </li>
      ))}
    </ul>
  );
}

// app/products/AddToCart.jsx — Client Component
'use client';
import { useState } from 'react';

export default function AddToCart({ productId }) {
  const [added, setAdded] = useState(false);
  return (
    <button onClick={() => setAdded(true)} disabled={added}>
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}`,
        },
      ],
      output: `The server runs \`ProductsPage\`, queries the database and sends the rendered list. The database code and the page component's JavaScript never reach the browser. Only \`AddToCart\` is shipped and hydrated, so each button works: clicking it changes to "Added ✓". (In a real project these are two separate files; \`'use client'\` must be the first line of its file.)`,
      questions: [
        {
          q: 'What is the difference between SSR and Server Components?',
          a: 'SSR renders components to HTML on the server, but their code still ships and hydrates. Server Components run only on the server and send no JavaScript for themselves; they never hydrate.',
        },
        {
          q: 'What can\'t Server Components do?',
          a: 'Use state, effects, browser APIs or event handlers. Anything interactive must be a Client Component (`\'use client\'`).',
        },
        {
          q: 'What does \'use client\' actually do?',
          a: 'It marks a module as a client boundary: that file and its imports are bundled for the browser. It does not mean "render only on the client" — Client Components are still SSR\'d to HTML.',
        },
        {
          q: 'Can a Client Component render a Server Component?',
          a: 'Not by importing it, but a Server Component can be passed into a Client Component as `children` or another prop.',
        },
      ],
      spoken: `"React Server Components run only on the server, so their code never ships to the browser. They can be async and fetch data directly from a database with secrets, which removes client-side waterfalls and shrinks bundles. They can't use state, effects or event handlers — interactive pieces are Client Components marked with \`'use client'\`, which are still server-rendered to HTML and then hydrated. Server Components can pass serializable props or children to Client Components. In practice I use them through the Next.js App Router, where components are server by default."`,
      mistakes: [
        'Thinking `\'use client\'` means "client-only rendering". Client Components are still pre-rendered on the server.',
        'Putting `\'use client\'` at the top of the app, turning everything into client code and losing the benefits.',
        'Passing functions or class instances as props from Server to Client Components (they must be serializable).',
        'Follow-up trap: "Are Server Components the same as Server Actions?" No. Server Components render UI on the server; Server Actions (`\'use server\'`) are functions the client can call to run code on the server.',
      ],
      takeaway: 'Server Components do data and heavy work on the server with zero client JS; Client Components handle interactivity.',
    },
    {
      id: 'react-19-features',
      title: 'React 19: Actions, useActionState, useOptimistic, use() and More',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Async transitions (Actions), form actions, useActionState, useFormStatus, useOptimistic, use(), ref as a prop, and the React Compiler.',
      what: `**React 19** became stable in **December 2024**. Its main theme is making **data mutations and forms** easier.

- **Actions** — functions that run inside a transition and can be **async**. React tracks pending state, errors and optimistic updates for you.
- **Form actions** — \`<form action={fn}>\`: React calls \`fn(formData)\` on submit, and resets uncontrolled fields after success.
- **\`useActionState(action, initialState)\`** → \`[state, formAction, isPending]\`. The action receives \`(previousState, formData)\` and returns the new state (e.g. an error message). (It was called \`useFormState\` in canary builds.)
- **\`useFormStatus()\`** (from \`react-dom\`) — a child component inside a form can read \`{ pending }\` of that form.
- **\`useOptimistic(state, updateFn)\`** — show an optimistic value while an action runs; it falls back to the real state when the action finishes.
- **\`use(resource)\`** — read a **promise** (suspends until it resolves) or a **context**. Unlike hooks, it can be called inside \`if\` and loops.
- **\`ref\` as a prop** for function components (\`forwardRef\` no longer needed), and ref callbacks can return a cleanup.
- **\`<Context value={...}>\`** can be used directly as the provider.
- **Document metadata**: \`<title>\`, \`<meta>\`, \`<link>\` rendered anywhere are hoisted to \`<head>\`; plus stylesheet precedence and preloading APIs (\`preload\`, \`preinit\`).
- Better hydration error messages, and Server Components / Server Actions are stable.

#### Deeper version
**React Compiler**: a separate, **opt-in** build-time tool (e.g. \`babel-plugin-react-compiler\`) that automatically memoizes components and values, reducing manual \`memo\`/\`useMemo\`/\`useCallback\`. It was released as a stable **1.0 in late 2025**; it is **not** bundled into React 19 itself. It requires code that follows the rules of React. Later 19.x releases added more features (for example, React 19.2 added \`<Activity>\` and \`useEffectEvent\`). Because these details move quickly, **check react.dev for the current status** before stating them in an interview. Upgrading from 18 also removed some long-deprecated APIs (\`ReactDOM.render\`, \`propTypes\` checks for function components, string refs, legacy context).`,
      why: `Before React 19, every form needed manual \`isLoading\`, \`error\` and optimistic-update state plus \`preventDefault\` boilerplate. Actions make the common "submit → pending → result/error" flow built in, and work with Server Actions in frameworks.`,
      analogy: `Actions are like a courier service with tracking. You hand over the parcel (form data), and the app automatically shows "in transit" (pending), "delivered" (new state) or "failed" (error). \`useOptimistic\` is like marking it "delivered" on your list immediately because it nearly always arrives — and fixing it if it doesn't.`,
      code: [
        {
          title: 'Form action with useActionState and useFormStatus',
          lang: 'jsx',
          code: `import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

async function subscribe(prevState, formData) {
  const email = formData.get('email');
  const res = await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
  if (!res.ok) return { error: 'Could not subscribe. Try again.' };
  return { message: \`Subscribed \${email}!\` };
}

function SubmitButton() {
  const { pending } = useFormStatus(); // reads the parent <form>'s status
  return <button disabled={pending}>{pending ? 'Subscribing…' : 'Subscribe'}</button>;
}

export default function Newsletter() {
  const [state, formAction, isPending] = useActionState(subscribe, {});

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <SubmitButton />
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p>{state.message}</p>}
      {isPending && <small>Talking to the server…</small>}
    </form>
  );
}`,
        },
        {
          title: 'useOptimistic and use()',
          lang: 'jsx',
          code: `import { use, useOptimistic, useState, Suspense } from 'react';

function Comments({ initial, sendComment }) {
  const [comments, setComments] = useState(initial);
  const [optimistic, addOptimistic] = useOptimistic(
    comments,
    (current, newText) => [...current, { id: 'temp', text: newText, sending: true }]
  );

  async function action(formData) {
    const text = formData.get('text');
    addOptimistic(text);                  // shows instantly
    const saved = await sendComment(text); // real request
    setComments((c) => [...c, saved]);     // real state replaces the optimistic one
  }

  return (
    <form action={action}>
      <ul>{optimistic.map((c) => <li key={c.id}>{c.text}{c.sending && ' (sending…)'}</li>)}</ul>
      <input name="text" />
    </form>
  );
}

// use(): read a promise created OUTSIDE render (e.g. passed from a parent/server)
function UserName({ userPromise }) {
  const user = use(userPromise); // suspends until resolved
  return <h2>{user.name}</h2>;
}

export function Profile({ userPromise }) {
  return (
    <Suspense fallback={<p>Loading user…</p>}>
      <UserName userPromise={userPromise} />
    </Suspense>
  );
}`,
        },
      ],
      output: `Submitting the newsletter form calls \`subscribe\` with the form data. While it runs, \`SubmitButton\` shows "Subscribing…" (via \`useFormStatus\`) and \`isPending\` is true. Then the returned object becomes \`state\`, showing either the success message or the error. No \`useState\` for loading, no \`preventDefault\`.

In \`Comments\`, the new comment appears instantly with "(sending…)". When the request finishes, the real list (with the saved comment) replaces the optimistic one; if it throws, the optimistic item disappears and the error goes to the nearest error boundary. \`UserName\` shows "Loading user…" until the promise resolves.`,
      questions: [
        {
          q: 'What are Actions in React 19?',
          a: 'Async functions used in transitions (via `startTransition`, `<form action>`, or `useActionState`). React manages pending state, errors, optimistic updates and form resets for them.',
        },
        {
          q: 'What does useActionState return?',
          a: '`[state, formAction, isPending]`. You pass `formAction` to a form; the action gets `(prevState, formData)` and its return value becomes the new state.',
        },
        {
          q: 'How is use() different from other hooks?',
          a: 'It reads a promise or context and can be called conditionally or in loops. For promises it suspends until resolved; the promise should be created outside render (or cached), not inline.',
        },
        {
          q: 'Is the React Compiler part of React 19?',
          a: 'No. It\'s a separate opt-in build tool that auto-memoizes components. It reached a stable 1.0 in late 2025; check the docs for current setup and support.',
        },
      ],
      spoken: `"React 19, stable since December 2024, focuses on mutations and forms through Actions — async functions that run in a transition, so React tracks pending state for me. I can pass a function to a form's \`action\`, use \`useActionState\` to get the result state and \`isPending\`, \`useFormStatus\` in a child button, and \`useOptimistic\` to show updates instantly. There's also \`use()\` for reading promises and context, \`ref\` as a regular prop, metadata tags hoisted to the head, and stable Server Components. The React Compiler is separate and opt-in; it reached 1.0 in late 2025."`,
      mistakes: [
        'Creating a new promise inside render and passing it to `use()` — it suspends forever because each render creates a new promise. Create it outside render or cache it.',
        'Calling `useFormStatus` in the same component that renders the `<form>` — it only reads a parent form, so put it in a child component.',
        'Saying the React Compiler ships with React 19 or is on by default — it\'s a separate opt-in tool.',
        'Follow-up trap: "Do you still need react-hook-form with form Actions?" Actions handle submission and pending state; complex client-side validation, field arrays and dirty tracking are still easier with a form library.',
      ],
      takeaway: 'React 19 = Actions for async mutations (form actions, useActionState, useFormStatus, useOptimistic), use(), ref as a prop; the Compiler is separate.',
    },
    {
      id: 'folder-structure',
      title: 'Folder Structure for Large React Apps',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Organise by feature (domain), keep shared UI separate, define clear public APIs and import rules.',
      what: `For small apps, grouping by **type** works: \`components/\`, \`hooks/\`, \`pages/\`. As the app grows, each folder gets huge and one feature's code is spread across five places.

For large apps, group by **feature** (also called domain or module):

- \`features/auth/\`, \`features/billing/\`, \`features/projects/\` — each has its own components, hooks, API calls, types and tests.
- \`components/ui/\` (or \`shared/\`) — generic, reusable pieces (Button, Modal) with **no business logic**.
- \`lib/\` — configured clients (API client, query client, Stripe).
- \`app/\` or \`routes/\` — route definitions and providers.

#### Deeper version
Good rules:
- **Colocation**: keep files close to where they are used (component + test + styles together).
- **Public API per feature**: each feature exposes an \`index.ts\`; other features import only from it, not from deep internal files.
- **Dependency direction**: \`shared\` → used by \`features\` → used by \`app\`. Features should not import each other freely; enforce with ESLint (\`import/no-restricted-paths\` or \`eslint-plugin-boundaries\`).
- **Absolute imports** with path aliases (\`@/features/auth\`) instead of \`../../../\`.
- Be careful with big barrel files — they can slow down bundlers/tests and hurt tree-shaking.
- Methodologies like **Feature-Sliced Design** formalise this. In **Next.js App Router**, the \`app/\` folder is routing; keep feature code in \`src/features\` and keep route files thin.
There's no single correct structure — consistency and clear boundaries matter more than the exact names.`,
      why: `In a big team, structure decides how fast people find code, how safely they can change it, and whether features can be deleted or split out cleanly. Interviewers ask this to judge senior-level thinking.`,
      analogy: `Type-based folders are like a supermarket that puts all red items in one aisle and all boxes in another — easy to set up, hard to shop. Feature-based folders are like departments (bakery, dairy) where everything for one purpose is together.`,
      code: [
        {
          title: 'Feature-based structure',
          lang: 'text',
          code: `src/
├─ app/                     # app shell: router, providers, layouts
│  ├─ router.tsx
│  └─ providers.tsx         # QueryClientProvider, AuthProvider, Theme
├─ features/
│  ├─ auth/
│  │  ├─ components/LoginForm.tsx
│  │  ├─ hooks/useAuth.ts
│  │  ├─ api/auth.api.ts    # fetch functions + TanStack Query hooks
│  │  ├─ types.ts
│  │  └─ index.ts           # PUBLIC API: export only what others may use
│  ├─ billing/
│  │  ├─ components/PlanPicker.tsx
│  │  ├─ api/stripe.api.ts
│  │  └─ index.ts
│  └─ projects/...
├─ components/ui/           # Button, Modal, Input — no business logic
├─ hooks/                   # truly generic hooks (useDebounce, useMediaQuery)
├─ lib/                     # apiClient.ts, queryClient.ts, env.ts
├─ pages/ or routes/        # thin route components that compose features
└─ test/                    # test utils, MSW handlers`,
        },
        {
          title: 'Using a feature\'s public API',
          lang: 'tsx',
          code: `// features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { useAuth } from './hooks/useAuth';
// internal helpers are NOT exported

// routes/LoginPage.tsx — thin route that composes features
import { LoginForm } from '@/features/auth';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <Card>
      <LoginForm />
    </Card>
  );
}`,
        },
      ],
      output: `Everything about authentication lives in \`features/auth\`. Other code imports only from \`@/features/auth\`, so the auth team can rename or move internal files without breaking anyone. Route files stay small and just compose features with shared UI. Deleting a feature means deleting one folder.`,
      questions: [
        {
          q: 'How do you structure a large React application?',
          a: 'By feature/domain: each feature folder owns its components, hooks, API calls, types and tests, with an `index.ts` public API. Shared UI, generic hooks and library setup live in separate shared folders.',
        },
        {
          q: 'Type-based vs feature-based structure?',
          a: 'Type-based (`components/`, `hooks/`) is fine for small apps. Feature-based scales better because related code is together and boundaries are clear.',
        },
        {
          q: 'How do you stop features from depending on each other\'s internals?',
          a: 'Expose a public API per feature, use path aliases, and enforce import rules with ESLint (restricted paths / boundaries plugins).',
        },
      ],
      spoken: `"For small apps I'm fine with folders by type, but for large apps I organise by feature. Each feature — auth, billing, projects — owns its components, hooks, API calls, types and tests, and exposes a small public API through an index file. Generic UI like buttons and modals lives in a shared components folder without business logic, and library setup like the API client lives in \`lib\`. Route files stay thin and just compose features. I enforce import boundaries with ESLint and use path aliases, so the structure stays clean as the team grows."`,
      mistakes: [
        'One giant `components/` folder with hundreds of files and no grouping.',
        'Features importing deep internal files from other features, creating hidden coupling.',
        'Putting business logic (API calls, Stripe logic) inside generic UI components.',
        'Follow-up trap: "Where do shared types between frontend and backend go?" In a shared package (monorepo workspace) or generated from an API schema (OpenAPI/tRPC/Zod), not copied by hand.',
      ],
      takeaway: 'Group by feature, share only generic pieces, expose public APIs, and enforce boundaries with lint rules.',
    },
  ],
  rapidFire: [
    { q: 'What does JSX compile to?', a: '`jsx()` calls (React 17+ runtime) or `React.createElement()`, which return plain objects called React elements.' },
    { q: 'What is a Fragment?', a: 'A wrapper (`<>...</>`) that groups children without adding an extra DOM node.' },
    { q: 'Why must components start with a capital letter?', a: 'JSX treats lowercase tags as HTML elements and capitalised ones as components.' },
    { q: 'Props vs state?', a: 'Props come from the parent and are read-only; state is owned by the component and changed with a setter.' },
    { q: 'What is the children prop?', a: 'Whatever is placed between a component\'s opening and closing tags.' },
    { q: 'Is setState synchronous?', a: 'No. It schedules a re-render; the current render keeps the old value.' },
    { q: 'When should you use the updater form of setState?', a: 'Whenever the next state depends on the previous state: `setCount(c => c + 1)`.' },
    { q: 'Why update state immutably?', a: 'React detects changes by reference (`Object.is`); mutating keeps the same reference.' },
    { q: 'What is lazy initial state?', a: 'Passing a function to `useState(() => compute())` so it runs only on the first render.' },
    { q: 'Where does React attach event listeners?', a: 'On the root container (since React 17), using event delegation.' },
    { q: 'Why does `{0 && <A />}` render 0?', a: 'Because `0 && x` is `0`, and React renders numbers. Use a boolean condition.' },
    { q: 'Why are keys needed in lists?', a: 'To identify items between renders so React reuses the right components and state.' },
    { q: 'When is index as key OK?', a: 'Only for static lists that never reorder, insert, delete or filter.' },
    { q: 'How do you reset a component\'s state?', a: 'Change its `key`; React unmounts and mounts a fresh instance.' },
    { q: 'Controlled vs uncontrolled input?', a: 'Controlled: value lives in React state. Uncontrolled: value lives in the DOM, read with a ref or FormData.' },
    { q: 'What is lifting state up?', a: 'Moving shared state to the closest common parent and passing it down as props.' },
    { q: 'What is prop drilling?', a: 'Passing props through many layers that don\'t use them, just to reach a deep child.' },
    { q: 'What is the virtual DOM?', a: 'A JavaScript description of the UI that React diffs to make minimal real DOM updates.' },
    { q: 'What is reconciliation?', a: 'React\'s diffing process that compares old and new element trees to decide DOM changes.' },
    { q: 'What happens if an element\'s type changes?', a: 'React destroys the old subtree (losing state) and builds a new one.' },
    { q: 'What are the rules of hooks?', a: 'Call hooks only at the top level and only from components or custom hooks.' },
    { q: 'Why can\'t hooks be called conditionally?', a: 'React matches hooks by call order; skipping one shifts all the rest.' },
    { q: 'What does an empty dependency array mean?', a: 'Run the effect only once, after the first render (plus cleanup on unmount).' },
    { q: 'When does an effect\'s cleanup run?', a: 'Before the effect re-runs and when the component unmounts.' },
    { q: 'Why do effects run twice in development?', a: 'StrictMode mounts, unmounts and remounts to catch missing cleanups. Not in production.' },
    { q: 'Can a useEffect callback be async?', a: 'No. Define an async function inside the effect and call it.' },
    { q: 'useEffect vs useLayoutEffect?', a: '`useEffect` runs after paint; `useLayoutEffect` runs before paint and blocks it — for DOM measurement.' },
    { q: 'useRef vs useState?', a: 'Both persist across renders; changing state re-renders, changing `ref.current` does not.' },
    { q: 'What triggers a re-render?', a: 'Own state change, parent re-render, or a consumed context changing.' },
    { q: 'Does a child re-render when the parent does?', a: 'Yes, by default, unless it is wrapped in `React.memo` and its props are shallowly equal.' },
    { q: 'What does React.memo compare?', a: 'Props, shallowly, using `Object.is` for each prop.' },
    { q: 'useMemo vs useCallback?', a: '`useMemo` caches a computed value; `useCallback` caches a function reference.' },
    { q: 'When to use useReducer?', a: 'For complex state with many related fields or transitions; it centralises logic in a pure reducer.' },
    { q: 'What happens when a context value changes?', a: 'Every component reading that context re-renders, even inside `React.memo`.' },
    { q: 'How do you optimise Context?', a: 'Memoize the value, split contexts by update frequency, or use a store with selectors.' },
    { q: 'Do two components using the same custom hook share state?', a: 'No. Each call gets its own independent state.' },
    { q: 'What is a stale closure?', a: 'A callback from an old render that keeps reading old props or state.' },
    { q: 'What is derived state?', a: 'A value computable from props/state; calculate it during render instead of storing it.' },
    { q: 'What is useId for?', a: 'SSR-safe unique IDs for accessibility attributes, not for list keys.' },
    { q: 'What do error boundaries NOT catch?', a: 'Errors in event handlers, async code, SSR, and the boundary itself.' },
    { q: 'Can error boundaries be written with hooks?', a: 'No, they need a class component (or the react-error-boundary library).' },
    { q: 'Do events bubble out of a portal?', a: 'Yes, through the React tree, not the DOM tree.' },
    { q: 'What does React.lazy need?', a: 'A function returning a dynamic `import()` of a module with a default export, plus a Suspense boundary.' },
    { q: 'What is an HOC?', a: 'A function that takes a component and returns a new, enhanced component.' },
    { q: 'What is a render prop?', a: 'A function prop the component calls to render UI with its internal data.' },
    { q: 'useHistory in React Router v6?', a: 'Replaced by `useNavigate`.' },
    { q: 'staleTime vs gcTime in TanStack Query?', a: '`staleTime`: how long data is fresh; `gcTime`: how long unused cache is kept.' },
    { q: 'Why is react-hook-form fast?', a: 'It uses uncontrolled inputs with refs, so typing doesn\'t re-render the whole form.' },
    { q: 'getBy vs queryBy vs findBy?', a: '`getBy` throws if missing, `queryBy` returns null, `findBy` waits asynchronously.' },
    { q: 'How does React prevent XSS?', a: 'It escapes all values rendered in JSX; `dangerouslySetInnerHTML` bypasses this.' },
    { q: 'What is list virtualization?', a: 'Rendering only the visible rows of a long list plus a small buffer.' },
    { q: 'What is automatic batching?', a: 'React 18 combines multiple state updates into one render everywhere, even in promises and timeouts.' },
    { q: 'useTransition vs useDeferredValue?', a: '`useTransition` marks a state update as non-urgent; `useDeferredValue` gives a lagging copy of a value.' },
    { q: 'What is Fiber?', a: 'React\'s engine since v16 that splits rendering into interruptible, prioritised units of work.' },
    { q: 'What is a hydration mismatch?', a: 'When the client\'s first render differs from the server HTML, e.g. due to dates or `window` usage.' },
    { q: 'SSR vs Server Components?', a: 'SSR renders HTML but ships and hydrates the code; Server Components never ship their JS to the client.' },
    { q: 'What does useActionState return?', a: '`[state, formAction, isPending]`.' },
    { q: 'Can use() be called conditionally?', a: 'Yes, unlike other hooks, it can be called inside conditions and loops.' },
    { q: 'Is forwardRef needed in React 19?', a: 'Not for new code — function components receive `ref` as a normal prop.' },
    { q: 'Is the React Compiler part of React 19?', a: 'No, it\'s a separate opt-in build tool that auto-memoizes; check the docs for current status.' },
  ],
};
