// Machine Coding (React) — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'machine-coding',
  title: 'Machine Coding (React)',
  icon: '⌨️',
  description: 'Build real UI widgets in React under time pressure. Each problem has the full working code, how to build it step by step, and the follow-up questions interviewers ask.',
  definitionTitle: 'What is a machine coding round?',
  definition: `A **machine coding round** is a hands-on interview, usually **60–90 minutes**, where you **build a small working feature** live. Examples are a todo list, autocomplete, modal, pagination or file upload in React.

Interviewers check that it **works**, and also how you **structure components**, manage **state**, handle edge cases (loading, errors, empty states, race conditions), think about **accessibility**, and explain your choices as you code.

**One-line answer:** "A machine coding round is a timed, practical interview where you build a working UI feature from scratch, judged on correctness, code structure, state management, edge cases and clear communication."`,
  topics: [
    {
      id: 'approach-machine-coding',
      title: 'How to approach a machine coding round',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Clarify, plan the component tree and state, build the core flow first, then polish. Talk while you code.',
      what: `A **machine coding round** is an interview where you build a small, working UI feature in 45-90 minutes. Examples: a to-do list, an autocomplete, a modal, a star rating.

The interviewer does not only check if it works. They watch **how** you work:
1. **Clarify** the requirements (ask questions before coding).
2. **Break down** the UI into components.
3. **Design the state** (what data changes, and where it lives).
4. **Build the core flow first**, then add extras (styles, edge cases, accessibility).
5. **Talk** while you code, so they can follow your thinking.

#### Deeper version
Good candidates think in terms of **minimal state**: store only what you cannot calculate. For example, store \`todos\` and \`filter\`, but calculate \`visibleTodos\` during render. This avoids "two sources of truth" bugs.

They also think about **side effects** early: anything that talks to the outside world (fetch, timers, event listeners, observers) goes into \`useEffect\` with a **cleanup**. And for every API call they ask: "What if the response is slow? What if it fails? What if an old response comes back after a new one?" (the **race condition**).

Finally, they leave the code in a state where adding features is easy: small components, clear prop names, a custom hook when logic repeats.`,
      why: `Companies use this round because it is close to real work. It tests:
- **Requirement gathering**: do you build the right thing?
- **React fundamentals**: state, props, effects, keys, controlled inputs.
- **Code quality**: naming, small components, no repeated logic.
- **Edge cases**: empty list, loading, errors, slow network, double clicks.
- **Accessibility**: labels, keyboard support, \`aria-*\` attributes.
- **Time management**: a working simple version beats a half-built fancy one.`,
      analogy: `It is like a cooking show with a timer. A good chef first reads the order ("for how many people? any allergies?"), lays out the ingredients (components and state), cooks the main dish first (the core flow), and only then adds the garnish (styles and extras). A chef who spends 40 minutes on the garnish and serves raw food loses.`,
      code: [
        {
          title: 'Step 1-3: requirements, component tree and state (write this as comments first)',
          lang: 'text',
          code: `PROBLEM: To-do list

CLARIFY (ask out loud, then write down):
- Add, toggle done, delete? Edit? -> yes, yes, yes, nice-to-have
- Filters (all / active / done)? -> yes
- Persist on refresh? -> localStorage, if time allows
- Any API? -> no, local state only

COMPONENT TREE:
App
 └─ TodoApp            (owns all state)
     ├─ AddTodoForm    (input + button)  -> onAdd(text)
     ├─ FilterBar      (3 buttons)       -> onChange(filter)
     └─ TodoList
         └─ TodoItem   (checkbox, text, delete) -> onToggle(id), onDelete(id)

STATE (minimal):
- todos: [{ id, text, done }]
- filter: 'all' | 'active' | 'done'
DERIVED (not state):
- visibleTodos = todos filtered by filter
- remaining = todos.filter(t => !t.done).length

TIME PLAN (60 min):
 0-5   clarify + plan (this note)
 5-30  core flow working (ugly is fine)
30-45  edge cases, a11y, small refactor
45-55  styling + nice-to-haves
55-60  walk through code, mention what you would add next`,
        },
        {
          title: 'Step 4: skeleton first, logic second',
          lang: 'jsx',
          code: `import { useState } from 'react';

// Start with dumb components that only render props.
function AddTodoForm({ onAdd }) {
  return <form onSubmit={(e) => { e.preventDefault(); onAdd('demo'); }}><button>Add</button></form>;
}
function TodoList({ todos }) {
  return <ul>{todos.map((t) => <li key={t.id}>{t.text}</li>)}</ul>;
}

// One parent owns the state and passes callbacks down.
export default function TodoApp() {
  const [todos, setTodos] = useState([]);

  function handleAdd(text) {
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text, done: false }]);
  }

  return (
    <div>
      <h1>Todos</h1>
      <AddTodoForm onAdd={handleAdd} />
      <TodoList todos={todos} />
    </div>
  );
}`,
        },
      ],
      output: `The first block is what you write (or say) in the **first 5 minutes**. It shows the interviewer you understand the problem before touching code. It also gives you a checklist to come back to.

The second block is the **skeleton**: components exist and render, data flows down by props, and events flow up by callbacks. Clicking "Add" already adds an item. From here you fill in real logic one piece at a time and check it in the browser after each piece.

A simple order that works for almost every problem:
1. Hard-code the UI with fake data.
2. Replace fake data with state.
3. Wire up events (click, change, submit).
4. Add effects (fetch, timers, listeners) with cleanup.
5. Handle loading / error / empty states.
6. Add keyboard support and \`aria-*\` attributes.
7. Style it.`,
      questions: [
        {
          q: 'What questions do you ask before you start coding?',
          a: 'Scope (which features are must-have), data source (API or local), edge cases (empty, error, very long lists), whether accessibility and mobile matter, and whether I can use libraries. I write the answers down as a checklist.',
        },
        {
          q: 'How do you decide where state lives?',
          a: 'I put state in the lowest common parent of all components that need it. If only one component needs it, it stays local. Anything that can be calculated from other state is not stored.',
        },
        {
          q: 'What if you cannot finish in time?',
          a: 'I make sure the core flow works first, then I explain clearly what is left and how I would build it. A working basic version plus a clear plan scores better than a broken complete one.',
        },
        {
          q: 'Should you use libraries in a machine coding round?',
          a: 'Usually no, unless the interviewer allows it. They want to see that you can build the logic yourself. I ask first, and I mention which library I would use in production (for example React Hook Form or TanStack Query).',
        },
      ],
      spoken: `"I start by clarifying requirements: the must-have features, the data source, and edge cases like empty or error states. Then I sketch the component tree and decide the minimal state, and I keep derived values out of state. I build a skeleton that renders, then wire up state and events, then effects with proper cleanup. Once the core flow works, I handle loading and errors, add keyboard support and aria attributes, and finally style it. I talk through my decisions the whole time so the interviewer can follow my thinking."`,
      mistakes: [
        'Jumping into code without asking any questions, then building the wrong thing.',
        'Spending the first 20 minutes on CSS. Make it work first, then make it pretty.',
        'Storing derived data in state (like `filteredTodos`), which then goes out of sync with the real list.',
        'Coding in silence. The interviewer cannot give hints or credit if they do not know what you are thinking.',
        'Follow-up trap: "How would this scale to 10,000 items?" Mention virtualization (render only visible rows), memoization, and moving filtering to the server.',
      ],
      takeaway: 'Clarify, plan the tree and minimal state, make the core flow work, then polish — and talk the whole way.',
    },
    {
      id: 'todo-list',
      title: 'Todo List',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Add, toggle, edit, delete and filter todos with immutable state updates and a derived filtered list.',
      what: `**Problem as the interviewer says it:** "Build a todo app. The user can add a todo, mark it done, delete it, and filter by All / Active / Completed. Show how many items are left. Bonus: edit a todo by double-clicking, and save todos so they survive a page refresh."

Requirements checklist:
- Input + Add button. Pressing **Enter** also adds. Empty text is ignored.
- Each item: checkbox (done), text, delete button.
- Filter buttons: All / Active / Completed.
- Counter: "3 items left".
- Bonus: inline edit, "Clear completed", localStorage.

#### Deeper version
The real test is **immutable updates**. React decides to re-render by checking if the state reference changed. If you do \`todos.push(x)\` and then \`setTodos(todos)\`, the array is the same object, so React may skip the update. Always create a new array (\`[...prev, x]\`, \`prev.map(...)\`, \`prev.filter(...)\`).

Use the **functional updater** (\`setTodos(prev => ...)\`) so each update works on the latest state, even when several updates happen quickly. Keep \`filter\` in state, but calculate the visible list during render.`,
      why: `It looks easy, but it checks the basics every React dev must know:
- Controlled inputs (\`value\` + \`onChange\`).
- Immutable array updates (add, update one item, remove).
- Stable, unique **keys** in lists.
- Derived state vs stored state.
- Lifting state up and passing callbacks down.
- Small extras: localStorage with \`useEffect\`, edit mode, accessibility.`,
      analogy: `A todo list is like a paper checklist on the fridge. You never erase and rewrite on the same line in React — you photocopy the list with the change (a new array). The filter is just your eyes choosing which lines to look at; the paper list itself does not change.`,
      code: [
        {
          title: 'TodoApp.jsx — full working component',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

const FILTERS = {
  all: () => true,
  active: (t) => !t.done,
  completed: (t) => t.done,
};

// Read saved todos once, on first render (lazy initial state).
function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem('todos')) || [];
  } catch {
    return [];
  }
}

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);

  function save() {
    const text = draft.trim();
    if (text) onEdit(todo.id, text);
    else setDraft(todo.text); // empty edit -> cancel
    setEditing(false);
  }

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={'Mark "' + todo.text + '" as done'}
      />
      {editing ? (
        <input
          className="edit"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setDraft(todo.text); setEditing(false); }
          }}
          aria-label="Edit todo"
        />
      ) : (
        <span
          className={todo.done ? 'text done' : 'text'}
          onDoubleClick={() => setEditing(true)}
        >
          {todo.text}
        </span>
      )}
      <button onClick={() => onDelete(todo.id)} aria-label={'Delete "' + todo.text + '"'}>
        ✕
      </button>
    </li>
  );
}

export default function TodoApp() {
  const [todos, setTodos] = useState(loadTodos); // pass the function, not loadTodos()
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');

  // Save on every change.
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  function addTodo(e) {
    e.preventDefault(); // stop the form from reloading the page
    const value = text.trim();
    if (!value) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text: value, done: false }]);
    setText('');
  }

  const toggleTodo = (id) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const deleteTodo = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));
  const editTodo = (id, newText) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.done));

  // Derived values: calculated, never stored.
  const visible = todos.filter(FILTERS[filter]);
  const left = todos.filter((t) => !t.done).length;

  return (
    <section className="todo-app">
      <h1>Todos</h1>
      <form onSubmit={addTodo}>
        <label htmlFor="new-todo" className="sr-only">New todo</label>
        <input
          id="new-todo"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      {visible.length === 0 ? (
        <p className="empty">Nothing here.</p>
      ) : (
        <ul>
          {visible.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))}
        </ul>
      )}

      <footer>
        <span>{left} {left === 1 ? 'item' : 'items'} left</span>
        <div role="group" aria-label="Filter todos">
          {Object.keys(FILTERS).map((name) => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              aria-pressed={filter === name}
            >
              {name}
            </button>
          ))}
        </div>
        <button onClick={clearCompleted}>Clear completed</button>
      </footer>
    </section>
  );
}`,
        },
        {
          title: 'todo.css — minimal styles',
          lang: 'css',
          code: `.todo-app { max-width: 420px; margin: 40px auto; font-family: sans-serif; }
.todo-app form { display: flex; gap: 8px; }
.todo-app form input { flex: 1; padding: 8px; }
.todo-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
.todo-item .text { flex: 1; cursor: text; }
.todo-item .text.done { text-decoration: line-through; color: #888; }
.todo-app footer { display: flex; justify-content: space-between; margin-top: 12px; }
button[aria-pressed="true"] { font-weight: bold; border-color: #333; }

/* Visually hidden but still read by screen readers */
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}`,
        },
      ],
      output: `**How it works:**
- \`todos\` is an array of \`{ id, text, done }\`. \`text\` is the controlled input. \`filter\` is the chosen tab.
- \`useState(loadTodos)\` passes the function, so localStorage is read **only once** on mount, not on every render.
- Add: the form's \`onSubmit\` handles both the button click and the Enter key. We trim and ignore empty text.
- Toggle / edit use \`map\` and return a **new object** for the changed item. Delete uses \`filter\`.
- \`visible\` and \`left\` are calculated every render. No sync bugs.
- \`TodoItem\` keeps its own \`editing\` and \`draft\` state, because nobody else needs it.
- Keys are stable ids from \`crypto.randomUUID()\`, not array indexes.

**How to build it in the interview (45-60 min):**
1. (5 min) Clarify features and write the state shape.
2. (10 min) Input + add + render list.
3. (10 min) Toggle, delete, counter.
4. (5 min) Filters as derived data.
5. (10 min) Edit mode, clear completed, localStorage.
6. (5-10 min) Labels, \`aria-pressed\`, styling, walk-through.`,
      questions: [
        {
          q: 'Why not use the array index as the key?',
          a: 'When items are deleted or reordered, indexes shift, so React matches the wrong component to the wrong data. The edit input or checkbox state can jump to another row. A stable id avoids this.',
        },
        {
          q: 'Why use `setTodos(prev => ...)` instead of `setTodos([...todos, x])`?',
          a: 'The updater always gets the latest state. If two updates run in the same event or in an async callback, using the outer `todos` can lose one of them because it is a stale value.',
        },
        {
          q: 'How would you persist todos to a backend?',
          a: 'Load in a `useEffect` on mount, and send each change to the API. For a snappy UI, update the state first (optimistic update) and roll back if the request fails.',
        },
        {
          q: 'How would you add drag-to-reorder?',
          a: 'Store the order in the array itself. On drop, remove the item from its old index and insert it at the new one with a copy of the array. Use the HTML5 drag events or a library like dnd-kit in production.',
        },
        {
          q: 'The list has 5,000 todos and typing is slow. What do you do?',
          a: 'Wrap `TodoItem` in `React.memo` and make callbacks stable with `useCallback`, so only changed rows re-render. For very long lists, virtualize (render only visible rows).',
        },
      ],
      spoken: `"I keep three pieces of state in the parent: the todos array, the input text, and the current filter. Each todo has a stable id, a text and a done flag. All updates are immutable and use the functional updater: map to toggle or edit, filter to delete, spread to add. The visible list and the items-left count are derived during render, not stored. The form handles Enter for free through onSubmit. Edit mode is local state in each item. I save to localStorage in an effect and read it once with lazy initial state."`,
      mistakes: [
        'Mutating state: `todos.push(newTodo); setTodos(todos)`. The reference does not change, so React may not re-render.',
        'Using `index` as the key, which breaks edit/checkbox state after deleting an item.',
        'Storing `filteredTodos` in state and forgetting to update it when a todo changes.',
        'Calling `useState(loadTodos())` — this runs the function on every render. Pass `loadTodos` (no parentheses).',
        'Follow-up trap: "Why does the page reload when I press Enter?" A form submits by default. Call `e.preventDefault()` in `onSubmit`.',
      ],
      takeaway: 'Immutable updates with the functional updater, stable ids as keys, and derived filtered lists — that is the whole todo app.',
    },
    {
      id: 'star-rating',
      title: 'Star Rating',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'A reusable rating widget with hover preview, click to select, keyboard support and a controlled API.',
      what: `**Problem as the interviewer says it:** "Build a star rating component. It shows 5 stars. Hovering highlights stars up to the mouse. Clicking sets the rating. Make it reusable: the number of stars and the change handler come from props."

Requirements checklist:
- \`max\` stars (default 5).
- Hover preview; leaving the widget restores the selected value.
- Click selects; clicking the same star again can clear it (ask!).
- Works with keyboard (arrow keys) and screen readers.
- Can be **controlled** (\`value\` + \`onChange\` props).

#### Deeper version
The trick is having **two values**: the saved \`value\` and a temporary \`hover\` value. What you show is \`hover || value\`. When the mouse leaves, \`hover\` goes back to 0, so the saved value shows again.

For accessibility, the best simple pattern is a **radio group**: each star is a radio option ("1 star", "2 stars"...). Screen readers then say "3 of 5 stars, selected". Native radio inputs give arrow-key support for free, but the custom-button version below shows how to add it by hand, which is what interviewers usually want to see.`,
      why: `The interviewer is testing:
- Thinking in **reusable components** with a clean props API.
- Handling **hover vs selected** state without mixing them up.
- Event handling: \`onMouseEnter\`, \`onMouseLeave\`, \`onClick\`, \`onKeyDown\`.
- Controlled vs uncontrolled components.
- Accessibility: \`role\`, \`aria-checked\`, \`aria-label\`, focus management.`,
      analogy: `Think of choosing seats in a cinema app. When you move your finger over seats, they light up as a preview. Only when you tap do they become "your seats". If you move away without tapping, the preview disappears and your real choice shows again.`,
      code: [
        {
          title: 'StarRating.jsx — full working component',
          lang: 'jsx',
          code: `import { useRef, useState } from 'react';

export function StarRating({ max = 5, value, onChange, label = 'Rating' }) {
  const [hover, setHover] = useState(0);
  const starRefs = useRef([]);
  const shown = hover || value; // preview wins while hovering

  function select(n) {
    onChange(n === value ? 0 : n); // clicking the same star clears it
  }

  // Arrow keys move the selection, like a native radio group.
  function handleKeyDown(e) {
    let next = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, value + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, value - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = max;
    else return; // let other keys (Tab) work normally
    e.preventDefault();
    onChange(next);
    starRefs.current[next - 1]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(0)}
      onKeyDown={handleKeyDown}
      style={{ display: 'inline-flex', gap: 4 }}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= shown;
        // Only one star is in the tab order (roving tabindex).
        const tabbable = value ? n === value : n === 1;
        return (
          <button
            key={n}
            ref={(el) => (starRefs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={n + (n === 1 ? ' star' : ' stars')}
            tabIndex={tabbable ? 0 : -1}
            onMouseEnter={() => setHover(n)}
            onClick={() => select(n)}
            style={{
              fontSize: 32,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: filled ? '#f5a623' : '#ccc',
              padding: 0,
            }}
          >
            {filled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}

// Usage: the parent owns the value (controlled component).
export default function App() {
  const [rating, setRating] = useState(3);
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <StarRating value={rating} onChange={setRating} label="Rate this product" />
      <p>You rated: {rating || 'not rated'}</p>
    </div>
  );
}`,
        },
      ],
      output: `**How it works:**
- \`value\` comes from the parent; \`hover\` is local. We render \`shown = hover || value\` stars as filled.
- \`onMouseEnter\` on each star sets \`hover\`. \`onMouseLeave\` on the **wrapper** (not each star) resets it, so moving between stars does not flicker.
- Click calls \`onChange\`. Clicking the selected star again sends \`0\` (clear).
- Keyboard: the group listens for arrow keys, Home and End, updates the value and moves focus to the new star.
- **Roving tabindex**: only one star has \`tabIndex=0\`, so Tab enters the group once and leaves it once, like native radios.
- \`role="radio"\` + \`aria-checked\` + \`aria-label\` make a screen reader say "3 stars, radio button, checked".

**How to build it in the interview (30-45 min):**
1. (5 min) Clarify: max stars, half stars?, clear on re-click?, read-only mode?
2. (10 min) Render stars from \`max\`, click to select.
3. (5 min) Hover preview with \`hover || value\`.
4. (10 min) Keyboard + ARIA.
5. (5 min) Make it controlled and show usage; mention half stars.`,
      questions: [
        {
          q: 'How would you support half stars?',
          a: 'Check where the mouse is inside the star with `e.nativeEvent.offsetX < width / 2`. If it is on the left half, use `n - 0.5`. To draw it, overlay a filled star clipped to 50% width on top of an empty star.',
        },
        {
          q: 'How do you make it read-only?',
          a: 'Add a `readOnly` prop. When true, skip hover and click handlers, render plain spans with `role="img"` and an `aria-label` like "Rated 4 out of 5".',
        },
        {
          q: 'Controlled or uncontrolled — which one did you build and why?',
          a: 'Controlled: the parent passes `value` and `onChange`. It is easy to reset, validate, or submit with a form. I can also support uncontrolled use with a `defaultValue` prop and internal state when `value` is undefined.',
        },
        {
          q: 'Why put `onMouseLeave` on the wrapper and not on each star?',
          a: 'Leaving one star to enter the next would reset hover to 0 for a moment and cause flicker. On the wrapper, hover resets only when the mouse leaves the whole widget.',
        },
      ],
      spoken: `"I keep two values: the selected value, which comes from the parent as a controlled prop, and a local hover value. I render hover-or-value stars as filled, so hovering previews and leaving the wrapper restores the real rating. Clicking calls onChange, and clicking the same star clears it. For accessibility I use a radiogroup with each star as a radio with aria-checked and a label like '3 stars'. Arrow keys change the value and I use a roving tabindex so Tab only stops once in the group."`,
      mistakes: [
        'Storing only one state value, so hovering overwrites the real rating and it is lost when the mouse leaves.',
        'Using `<div onClick>` stars that cannot be focused or used with a keyboard.',
        'Forgetting `type="button"` — inside a form, a plain `<button>` submits the form on click.',
        'Putting `onMouseLeave` on every star, which causes flicker between stars.',
        'Follow-up trap: "What does a screen reader announce for your star?" If you only render "★" it says "black star". Add `aria-label="3 stars"` and `aria-checked`.',
      ],
      takeaway: 'Show `hover || value`, reset hover on the wrapper, and make it a keyboard-friendly radio group with a controlled API.',
    },
    {
      id: 'accordion',
      title: 'Accordion',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Expandable sections with single or multiple open mode, proper button + aria-expanded semantics and keyboard support.',
      what: `**Problem as the interviewer says it:** "Build an accordion (like an FAQ). Each item has a title and content. Clicking a title opens or closes its content. Add a prop so either only one item can be open at a time, or many can be open."

Requirements checklist:
- Data comes in as an array: \`[{ id, title, content }]\`.
- Click a header to toggle.
- \`allowMultiple\` prop: many open vs only one open.
- Accessible: header is a real button, \`aria-expanded\`, \`aria-controls\`.
- Bonus: arrow keys move between headers, smooth open animation.

#### Deeper version
The state design is the key decision. Store the **open ids**, not a boolean on each item. A \`Set\` (or array) of open ids works for both modes:
- Single mode: opening an item replaces the set with just that id.
- Multiple mode: toggle the id in the set.

Because a \`Set\` is mutable, always create a **new** Set before changing it, so React sees a new reference.

For the accessible pattern (from the WAI-ARIA Authoring Practices): each header is a \`<button>\` inside a heading, with \`aria-expanded\` and \`aria-controls\` pointing to the panel id. The panel has \`role="region"\` and \`aria-labelledby\` pointing back to the button.`,
      why: `The interviewer checks:
- **State design**: where open/closed lives and how one prop switches the behaviour.
- **Lifting state up** to the parent (so "only one open" is possible).
- **Semantic HTML**: a button, not a clickable div.
- \`aria-expanded\` / \`aria-controls\` knowledge.
- Clean, reusable component API.`,
      analogy: `It is like a filing cabinet. In "single" mode the cabinet has a lock that lets only one drawer open: opening a new drawer closes the old one. In "multiple" mode there is no lock, and you can pull out as many drawers as you like. The cabinet (parent) keeps track of which drawers are open, not the drawers themselves.`,
      code: [
        {
          title: 'Accordion.jsx — full working component',
          lang: 'jsx',
          code: `import { useId, useRef, useState } from 'react';

export function Accordion({ items, allowMultiple = false, defaultOpen = [] }) {
  const [openIds, setOpenIds] = useState(() => new Set(defaultOpen));
  const headerRefs = useRef([]);
  const baseId = useId(); // unique per accordion, safe with SSR

  function toggle(id) {
    setOpenIds((prev) => {
      const isOpen = prev.has(id);
      if (!allowMultiple) return isOpen ? new Set() : new Set([id]);
      const next = new Set(prev); // copy, never mutate state
      isOpen ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Up/Down/Home/End move focus between headers.
  function onHeaderKeyDown(e, index) {
    const last = items.length - 1;
    let target = null;
    if (e.key === 'ArrowDown') target = index === last ? 0 : index + 1;
    if (e.key === 'ArrowUp') target = index === 0 ? last : index - 1;
    if (e.key === 'Home') target = 0;
    if (e.key === 'End') target = last;
    if (target !== null) {
      e.preventDefault();
      headerRefs.current[target]?.focus();
    }
  }

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        const buttonId = baseId + '-btn-' + item.id;
        const panelId = baseId + '-panel-' + item.id;
        return (
          <div key={item.id} className="accordion-item">
            <h3>
              <button
                id={buttonId}
                ref={(el) => (headerRefs.current[index] = el)}
                className="accordion-header"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onHeaderKeyDown(e, index)}
              >
                <span>{item.title}</span>
                <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="accordion-panel"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const FAQ = [
  { id: 'ship', title: 'How long is shipping?', content: 'Usually 3-5 working days.' },
  { id: 'return', title: 'Can I return an item?', content: 'Yes, within 30 days.' },
  { id: 'pay', title: 'Which payment methods?', content: 'Cards, UPI and PayPal.' },
];

export default function App() {
  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Single mode</h2>
      <Accordion items={FAQ} defaultOpen={['ship']} />
      <h2>Multiple mode</h2>
      <Accordion items={FAQ} allowMultiple />
    </div>
  );
}`,
        },
        {
          title: 'accordion.css',
          lang: 'css',
          code: `.accordion-item { border-bottom: 1px solid #ddd; }
.accordion-item h3 { margin: 0; }
.accordion-header {
  width: 100%; display: flex; justify-content: space-between;
  padding: 12px; font-size: 16px; background: none; border: none;
  cursor: pointer; text-align: left;
}
.accordion-header:focus-visible { outline: 2px solid #4a90e2; }
.accordion-panel { padding: 0 12px 12px; color: #444; }`,
        },
      ],
      output: `**How it works:**
- \`openIds\` is a \`Set\` of open item ids. One state shape supports both modes.
- \`toggle\` in single mode returns either an empty Set (closing) or a Set with only the clicked id. In multiple mode it copies the Set and adds/removes the id.
- \`useId()\` creates unique ids so \`aria-controls\` and \`aria-labelledby\` link the button and its panel, even when two accordions are on the same page.
- The panel uses the \`hidden\` attribute, so closed content is hidden from screen readers too.
- Arrow keys move focus between headers using an array of refs.

**How to build it in the interview (30-45 min):**
1. (5 min) Clarify: single vs multiple, default open, animation?
2. (10 min) Render items, toggle one with a Set.
3. (5 min) Add \`allowMultiple\`.
4. (10 min) ARIA attributes, keyboard focus.
5. (5 min) Styling; mention height animation.`,
      questions: [
        {
          q: 'Why keep open state in the parent and not inside each item?',
          a: 'For "only one open", an item needs to know about the others. That shared knowledge must live in the common parent. Local state per item only works for the multiple mode.',
        },
        {
          q: 'How would you animate the open/close?',
          a: 'A simple way is CSS `grid-template-rows: 0fr` to `1fr` with a transition on a wrapper. The older way is measuring `scrollHeight` with a ref and animating `max-height`. With `hidden` you lose the animation, so you switch to a class-based approach.',
        },
        {
          q: 'How would you make it a compound component (`<Accordion.Item>`)?',
          a: 'Put `openIds` and `toggle` in a Context from `<Accordion>`. `<Accordion.Item>`, `<Accordion.Header>` and `<Accordion.Panel>` read the context. This gives users flexible markup.',
        },
        {
          q: 'Can you use the native `<details>` element instead?',
          a: 'Yes, `<details>`/`<summary>` give toggle and keyboard support for free. Making "only one open" needs JavaScript in older browsers; newer browsers support a shared `name` attribute on `<details>`, but check support before relying on it.',
        },
      ],
      spoken: `"I store a Set of open ids in the parent, because 'only one open' needs shared state. The toggle function checks the allowMultiple prop: in single mode it replaces the Set with just the clicked id, in multiple mode it copies the Set and adds or removes the id. I never mutate the Set in place. Each header is a real button inside a heading with aria-expanded and aria-controls, and the panel is a region labelled by the button. I use useId for unique ids, and arrow keys move focus between headers."`,
      mistakes: [
        'Mutating the Set: `prev.add(id); return prev;` — same reference, so React does not re-render.',
        'Using a clickable `<div>` as the header. It is not focusable and not announced as a button.',
        'Hard-coding ids like `panel-1`, which clash when two accordions render on one page. Use `useId`.',
        'Using an array index as the open key; if items change order, the wrong item opens.',
        'Follow-up trap: "Your content is hidden with CSS `display: none` — is it still accessible?" Hidden content is skipped by screen readers, which is correct when closed; but if you hide it only visually (opacity/height 0) it is still read out, so add `aria-hidden` or `hidden`.',
      ],
      takeaway: 'Store a Set of open ids in the parent, switch behaviour with one prop, and use a real button with aria-expanded.',
    },
    {
      id: 'tabs',
      title: 'Tabs',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'A tab list that switches panels, with tablist/tab/tabpanel roles, aria-selected and arrow-key navigation.',
      what: `**Problem as the interviewer says it:** "Build a Tabs component. It takes a list of tabs, each with a label and content. Clicking a tab shows its content. The first tab is active by default. Make it keyboard accessible."

Requirements checklist:
- Props: \`tabs = [{ id, label, content }]\`, optional \`defaultTab\`, optional \`onChange\`.
- One active tab at a time, clearly highlighted.
- Keyboard: Left/Right arrows move between tabs, Home/End jump to first/last.
- Bonus: disabled tab, lazy rendering of panels, keep active tab in the URL.

#### Deeper version
The ARIA pattern has three roles: \`role="tablist"\` on the wrapper, \`role="tab"\` on each button with \`aria-selected\` and \`aria-controls\`, and \`role="tabpanel"\` on the content with \`aria-labelledby\`.

Tabs use a **roving tabindex**: only the active tab has \`tabIndex=0\`; others have \`-1\`. So pressing Tab moves focus from the tab list straight into the panel, and arrow keys move between tabs. This is how native widgets like radio groups work, and it is what screen-reader users expect.`,
      why: `The interviewer tests:
- A small, clean, reusable API (data in, events out).
- One piece of state (\`activeId\`) driving the whole UI.
- Knowledge of the WAI-ARIA tabs pattern and roving tabindex.
- Optional: compound components with Context, and lazy vs eager panel rendering.`,
      analogy: `Tabs are like the dividers in a ring binder. All the pages are in the binder, but you only look at the section whose divider you opened. The binder remembers one thing: which divider is open.`,
      code: [
        {
          title: 'Tabs.jsx — full working component',
          lang: 'jsx',
          code: `import { useId, useRef, useState } from 'react';

export function Tabs({ tabs, defaultTab, onChange }) {
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id);
  const tabRefs = useRef({});
  const baseId = useId();

  function activate(id) {
    setActiveId(id);
    tabRefs.current[id]?.focus();
    onChange?.(id);
  }

  function onKeyDown(e) {
    const index = tabs.findIndex((t) => t.id === activeId);
    const last = tabs.length - 1;
    let next = null;
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    activate(tabs[next].id);
  }

  const active = tabs.find((t) => t.id === activeId);

  return (
    <div className="tabs">
      <div role="tablist" aria-label="Sections" onKeyDown={onKeyDown} className="tab-list">
        {tabs.map((tab) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              id={baseId + '-tab-' + tab.id}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={baseId + '-panel-' + tab.id}
              tabIndex={selected ? 0 : -1}
              className={selected ? 'tab active' : 'tab'}
              onClick={() => activate(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Only the active panel is rendered (lazy). */}
      {active && (
        <div
          role="tabpanel"
          id={baseId + '-panel-' + active.id}
          aria-labelledby={baseId + '-tab-' + active.id}
          tabIndex={0}
          className="tab-panel"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const tabs = [
    { id: 'profile', label: 'Profile', content: <p>Name, email and avatar.</p> },
    { id: 'billing', label: 'Billing', content: <p>Cards and invoices.</p> },
    { id: 'security', label: 'Security', content: <p>Password and 2FA.</p> },
  ];
  return <Tabs tabs={tabs} onChange={(id) => console.log('tab:', id)} />;
}`,
        },
        {
          title: 'tabs.css',
          lang: 'css',
          code: `.tab-list { display: flex; border-bottom: 1px solid #ddd; }
.tab {
  padding: 10px 16px; background: none; border: none;
  border-bottom: 2px solid transparent; cursor: pointer;
}
.tab.active { border-bottom-color: #4a90e2; font-weight: 600; }
.tab:focus-visible { outline: 2px solid #4a90e2; }
.tab-panel { padding: 16px; }`,
        },
      ],
      output: `**How it works:**
- One state value, \`activeId\`. The active tab gets the \`active\` class, \`aria-selected=true\` and \`tabIndex=0\`.
- Arrow keys on the tab list compute the next index (wrapping around), then \`activate\` sets state, moves focus and calls \`onChange\`.
- Only the active panel renders. Its \`id\` matches the tab's \`aria-controls\`, and it is labelled by the tab.
- The panel has \`tabIndex=0\` so keyboard users can Tab into it even if it has no links.

**How to build it in the interview (30 min):**
1. (5 min) Clarify: lazy or keep panels mounted? Controlled? URL sync?
2. (10 min) Render tabs and panel from \`activeId\`.
3. (10 min) ARIA roles + roving tabindex + arrow keys.
4. (5 min) Style and mention compound components.`,
      questions: [
        {
          q: 'Lazy rendering vs keeping all panels mounted — what is the trade-off?',
          a: 'Lazy rendering is lighter, but a panel loses its state (form input, scroll) when you switch away. Keeping all panels mounted with `hidden` preserves state but renders everything up front. I pick based on the content.',
        },
        {
          q: 'How would you sync the active tab with the URL?',
          a: 'Read the initial tab from the query string (`?tab=billing`) and update it with the router (or `history.replaceState`) when the tab changes. Then refresh and shared links open the same tab.',
        },
        {
          q: 'How would you build `<Tabs><Tabs.List>...` style API?',
          a: 'Use compound components: `<Tabs>` holds `activeId` in Context; `Tabs.Tab` and `Tabs.Panel` read it and register by id. It gives users full control of markup.',
        },
      ],
      spoken: `"Tabs need just one piece of state: the active tab id. I render a tablist with each tab as a button with role tab, aria-selected and aria-controls pointing to its panel, and the panel has role tabpanel labelled by its tab. I use a roving tabindex, so only the active tab is in the Tab order, and arrow keys plus Home and End move between tabs. By default I render only the active panel, but if panels hold form state I keep them mounted and hide them instead."`,
      mistakes: [
        'Using links or divs without roles, so screen readers do not know it is a tab widget.',
        'Giving every tab `tabIndex=0`, so keyboard users must press Tab through every tab.',
        'Unmounting panels with forms and losing the user\'s typed data when switching tabs.',
        'Follow-up trap: "Should arrow keys activate the tab or just move focus?" Both are valid patterns — automatic activation (shown here) is fine when panels are cheap; manual activation (focus moves, Enter/Space selects) is better when panels load slowly.',
      ],
      takeaway: 'One `activeId`, tablist/tab/tabpanel roles, and a roving tabindex with arrow keys.',
    },
    {
      id: 'modal',
      title: 'Modal / Dialog',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A reusable modal rendered in a portal, closing on Escape and backdrop click, trapping focus and restoring it on close.',
      what: `**Problem as the interviewer says it:** "Build a reusable Modal. A button opens it. It shows a title, content and a close button. It closes on the close button, on Escape, and on clicking outside. The page behind should not scroll."

Requirements checklist:
- Controlled: \`isOpen\` and \`onClose\` props, any \`children\`.
- Close on: X button, **Escape**, backdrop click (not on click inside the box).
- Lock body scroll while open.
- Accessible: \`role="dialog"\`, \`aria-modal="true"\`, \`aria-labelledby\`; focus moves into the modal, Tab stays inside (**focus trap**), focus returns to the opening button on close.
- Render above everything (a **portal**).

#### Deeper version
A **portal** (\`createPortal(jsx, document.body)\`) renders the modal into a different DOM node, outside the parent's box. This avoids \`overflow: hidden\` and \`z-index\` problems from parent containers. React events still bubble through the **React tree**, not the DOM tree, so a click inside the portal still reaches React parents.

Every side effect needs **cleanup**: the keydown listener, the body \`overflow\` style, and the focus restore all run when the modal closes or unmounts. Modern browsers also have a native \`<dialog>\` element with \`showModal()\`, which gives a top layer, Escape handling and inert background for free — a good thing to mention.`,
      why: `The interviewer tests:
- **Portals** and why they are needed.
- **useEffect cleanup** (listeners, body styles).
- Event handling details: backdrop click vs inside click, \`e.target === e.currentTarget\`.
- **Accessibility**: focus management is the part most candidates skip.
- Reusable API: controlled props + \`children\`.`,
      analogy: `A modal is like a pop-up shop placed at the front door of a mall. While it is there, you cannot walk into the mall (background blocked), you can only look at things in the shop (focus trap), and when it closes you are put back exactly where you were standing (focus restore).`,
      code: [
        {
          title: 'Modal.jsx — full working component',
          lang: 'jsx',
          code: `import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  // Keep the latest onClose without re-running the effect every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;

    // 1. Move focus into the dialog.
    const first = dialog.querySelector(FOCUSABLE);
    (first || dialog).focus();

    // 2. Lock background scroll.
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 3. Escape closes, Tab is trapped inside.
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) { e.preventDefault(); return; }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);

    // Cleanup: undo everything when closing/unmounting.
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = oldOverflow;
      previouslyFocused?.focus(); // 4. Restore focus.
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      // Close only when the backdrop itself is clicked, not the box.
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="modal"
      >
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog">✕</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setOpen(true)}>Delete account</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Are you sure?">
        <p>This cannot be undone.</p>
        <button onClick={() => setOpen(false)}>Cancel</button>
        <button onClick={() => { alert('Deleted'); setOpen(false); }}>Yes, delete</button>
      </Modal>
    </div>
  );
}`,
        },
        {
          title: 'modal.css',
          lang: 'css',
          code: `.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: #fff; border-radius: 8px; padding: 20px;
  width: min(90vw, 440px); max-height: 85vh; overflow: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.modal:focus { outline: none; }
.modal-header { display: flex; justify-content: space-between; align-items: center; }
.modal-header button { background: none; border: none; font-size: 20px; cursor: pointer; }`,
        },
      ],
      output: `**How it works:**
- When \`isOpen\` is false we return \`null\`. When true, \`createPortal\` puts the backdrop + dialog directly in \`document.body\`.
- The effect runs when the modal opens. It saves the focused element, focuses the first button inside, locks body scroll, and adds a keydown listener.
- Escape calls \`onClose\`. Tab and Shift+Tab wrap between the first and last focusable elements (focus trap).
- The cleanup removes the listener, restores the body overflow and puts focus back on the "Delete account" button.
- Backdrop: \`e.target === e.currentTarget\` is true only when the click starts on the backdrop itself, not on the box. Using \`onMouseDown\` avoids closing when a user drags a text selection from inside to outside.
- \`onCloseRef\` keeps the latest callback without adding \`onClose\` to the dependency array (a new arrow function each render would re-run the effect and steal focus).

**How to build it in the interview (45 min):**
1. (5 min) Clarify close behaviours, nested modals, animation.
2. (10 min) Portal + backdrop + box + close button.
3. (10 min) Escape and backdrop click, scroll lock, cleanup.
4. (15 min) Focus: move in, trap, restore. ARIA attributes.
5. (5 min) Style; mention native \`<dialog>\`.`,
      questions: [
        {
          q: 'Why use a portal for a modal?',
          a: 'A parent with `overflow: hidden`, `transform` or a low `z-index` stacking context can clip or hide the modal. Rendering into `document.body` puts it above the page. React context and events still work through the portal.',
        },
        {
          q: 'How do you stop a click inside the modal from closing it?',
          a: 'Check `e.target === e.currentTarget` on the backdrop handler, so only clicks directly on the backdrop close it. Alternatively call `e.stopPropagation()` on the inner box.',
        },
        {
          q: 'How would you handle nested modals?',
          a: 'Keep a stack of open modals (in Context). Only the top one listens to Escape and traps focus. Body scroll is unlocked only when the stack is empty.',
        },
        {
          q: 'What does the native `<dialog>` element give you?',
          a: '`dialog.showModal()` puts it in the browser top layer, makes the rest of the page inert, and closes on Escape. You still handle backdrop clicks and restore focus yourself in some cases, so test it.',
        },
        {
          q: 'How would you animate the close?',
          a: 'Keep the modal mounted for the animation length: set a "closing" state, add an exit CSS class, and unmount on `animationend` or after a timeout.',
        },
      ],
      spoken: `"I build the modal as a controlled component with isOpen and onClose, rendered through createPortal into the body so parent overflow or z-index cannot clip it. When it opens, one effect saves the previously focused element, moves focus inside, locks body scroll, and adds a keydown listener for Escape and a Tab focus trap. The cleanup undoes all of that and restores focus. Backdrop clicks close it only when target equals currentTarget. For accessibility it has role dialog, aria-modal and aria-labelledby pointing to the title."`,
      mistakes: [
        'Adding a `keydown` listener without removing it in cleanup — every open adds another listener.',
        'Closing on any click in the backdrop handler, so clicking inside the box also closes the modal.',
        'Forgetting to restore focus, so keyboard users are dropped at the top of the page after closing.',
        'Putting `onClose` in the effect dependencies when the parent passes a new arrow function each render — the effect re-runs on every parent render and focus jumps.',
        'Follow-up trap: "Does a click inside a portal bubble to the React parent?" Yes. React events bubble through the React component tree, even though the DOM node is elsewhere.',
      ],
      takeaway: 'Portal + controlled props + one effect with full cleanup + focus in, trapped and restored.',
    },
    {
      id: 'pagination',
      title: 'Pagination',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Server-side pagination with page buttons, ellipsis, prev/next, loading/error states and ignored stale responses.',
      what: `**Problem as the interviewer says it:** "Fetch products from an API and show 10 per page. Add Prev / Next buttons and page numbers. If there are many pages, show something like 1 … 4 5 6 … 20."

Requirements checklist:
- Fetch one page at a time: \`?limit=10&skip=(page-1)*10\`.
- Show loading and error states.
- Prev / Next disabled at the ends.
- Page numbers with ellipsis around the current page.
- Accessible: \`<nav aria-label="Pagination">\`, \`aria-current="page"\`.
- Bonus: keep page in the URL, cache visited pages, page size selector.

#### Deeper version
Two parts: **data fetching** and **page-number math**.

For fetching, the \`page\` is the only input. A \`useEffect\` with \`[page]\` fetches when it changes. If the user clicks fast (page 2, then 3), the page-2 response may arrive **after** page 3 and overwrite it. That is a **race condition**. Fix it with an \`ignore\` flag set in cleanup, or with \`AbortController\` to cancel the old request.

For page numbers, keep a pure helper function: always show the first and last page, a window around the current page, and \`'…'\` where numbers are skipped. A pure function is easy to test and explain.`,
      why: `The interviewer tests:
- Data fetching in \`useEffect\` with loading, error and **race-condition** handling.
- Deriving \`totalPages\` from the API's \`total\`.
- Pure helper logic (page range with ellipsis) and edge cases (1 page, last page).
- Disabled states and accessible navigation.`,
      analogy: `Pagination is like reading a long book one page at a time instead of carrying the whole library. The page bar at the bottom is the table of contents: it shows the first chapter, the last chapter, and the chapters near where you are, with "…" for the ones in between.`,
      code: [
        {
          title: 'Pagination.jsx — full working component (dummyjson API)',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

const PAGE_SIZE = 10;

// Pure helper: [1, '…', 4, 5, 6, '…', 20]
export function getPageItems(current, total, siblings = 1) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const items = [1];
  if (start > 2) items.push('…');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push('…');
  items.push(total);
  return items;
}

export default function ProductPages() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ products: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const skip = (page - 1) * PAGE_SIZE;
    fetch('https://dummyjson.com/products?limit=' + PAGE_SIZE + '&skip=' + skip + '&select=title,price', {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((json) => {
        setData({ products: json.products, total: json.total });
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // old request cancelled: ignore
        setError(err.message);
        setLoading(false);
      });

    // Cancel this request if page changes before it finishes.
    return () => controller.abort();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Products</h1>

      {error && <p role="alert">Could not load: {error}</p>}

      <ul aria-busy={loading} style={{ opacity: loading ? 0.5 : 1, minHeight: 260 }}>
        {data.products.map((p) => (
          <li key={p.id}>{p.title} — \${p.price}</li>
        ))}
      </ul>

      <nav aria-label="Pagination" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
          ‹ Prev
        </button>
        {getPageItems(page, totalPages).map((item, i) =>
          item === '…' ? (
            <span key={'gap-' + i} aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              onClick={() => setPage(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={'Page ' + item}
              style={{ fontWeight: item === page ? 'bold' : 'normal' }}
            >
              {item}
            </button>
          )
        )}
        <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
          Next ›
        </button>
      </nav>
    </div>
  );
}`,
        },
        {
          title: 'Quick check of the helper',
          lang: 'javascript',
          code: `console.log(getPageItems(1, 5));   // [1, 2, 3, 4, 5]
console.log(getPageItems(1, 20));  // [1, 2, '…', 20]
console.log(getPageItems(5, 20));  // [1, '…', 4, 5, 6, '…', 20]
console.log(getPageItems(20, 20)); // [1, '…', 19, 20]`,
        },
      ],
      output: `**How it works:**
- \`page\` is the single source of truth. The effect depends on \`[page]\` and fetches \`limit\`/\`skip\` for that page.
- Each run creates an \`AbortController\`. If \`page\` changes before the fetch ends, cleanup calls \`abort()\`; the old promise rejects with \`AbortError\`, which we ignore. So an old page can never overwrite a newer one.
- \`totalPages\` is derived from \`total\`, never stored.
- While loading we keep the old list on screen and dim it. This avoids the list "jumping" to empty between pages.
- \`getPageItems\` is pure. With 20 pages and current 5 it returns \`[1, '…', 4, 5, 6, '…', 20]\`.
- The price uses \`\${p.price}\` in JSX text — the first \`$\` is a literal dollar sign, then \`{p.price}\` is the JSX expression.
- \`aria-current="page"\` tells screen readers which page is active.

**How to build it in the interview (45 min):**
1. (5 min) Clarify: server or client pagination? page size? URL sync?
2. (10 min) Fetch page 1 and render the list.
3. (10 min) Prev/Next + effect on \`[page]\` + abort cleanup.
4. (10 min) \`getPageItems\` with ellipsis; test edge cases out loud.
5. (10 min) Loading/error UI, a11y, styling.`,
      questions: [
        {
          q: 'Client-side vs server-side pagination?',
          a: 'Client-side: fetch everything once and `slice` it — fine for a few hundred rows. Server-side: fetch one page at a time — needed for large data. Server-side needs the total count from the API.',
        },
        {
          q: 'Offset vs cursor pagination?',
          a: 'Offset (`skip/limit`) allows jumping to any page but gets slow on big tables and can show duplicates when rows are inserted. Cursor (`after=lastId`) is stable and fast but only supports next/previous. Feeds use cursors; admin tables use offsets.',
        },
        {
          q: 'How do you cache pages you have already visited?',
          a: 'Keep a `useRef(new Map())` keyed by page. Before fetching, check the map; after fetching, store the result. In production I would use TanStack Query, which caches by query key.',
        },
        {
          q: 'How do you keep the page in the URL?',
          a: 'Read `page` from `URLSearchParams` (or the router) on load and update the query string when it changes. Refresh and the back button then work.',
        },
      ],
      spoken: `"I keep the current page as the single piece of state and derive total pages from the API's total. An effect on page fetches that page with limit and skip, and uses an AbortController so if the user clicks quickly, the old request is cancelled and can't overwrite the new data. I keep the old list visible and dimmed while loading to avoid layout jumps. The page buttons come from a small pure helper that returns the first page, the last page, a window around the current one, and ellipses. The nav has aria-label and the current button has aria-current."`,
      mistakes: [
        'No race-condition handling: fast clicks show page 2 data while the UI says page 3.',
        'Storing `totalPages` in separate state and letting it go stale.',
        'Not disabling Prev on page 1 or Next on the last page, so `page` goes to 0 or past the end.',
        'Using the index as key for ellipsis and numbers together, so React mixes up items; give gaps their own key.',
        'Follow-up trap: "What happens if the total shrinks and the current page no longer exists?" Clamp it: `if (page > totalPages) setPage(totalPages)` after data loads.',
      ],
      takeaway: 'Page is the only state; fetch per page with abort cleanup, and build page numbers with a pure, testable helper.',
    },
    {
      id: 'progress-bar',
      title: 'Progress Bar (and a Queue of Bars)',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'A clamped, accessible progress bar component, then the classic follow-up: add bars that fill one after another with at most N running at once.',
      what: `**Problem as the interviewer says it:** "Build a ProgressBar component that takes a value from 0 to 100. Then add a button 'Add bar'. Each click adds a bar that fills from 0 to 100% in 2 seconds. Follow-up: only 3 bars may fill at the same time; the rest wait in a queue."

Requirements checklist:
- \`<ProgressBar value={n} />\`: clamps to 0-100, shows the percent, animates smoothly.
- Accessible: \`role="progressbar"\` with \`aria-valuenow\`, \`aria-valuemin\`, \`aria-valuemax\` and a label.
- "Add bar" adds a new bar that starts filling.
- Concurrency limit: max 3 bars filling at once; next one starts when one finishes.

#### Deeper version
Part one is a pure display component. Use \`Math.min(100, Math.max(0, value))\` so bad input cannot break the layout, and animate with a CSS \`transition\` on width (or \`transform: scaleX()\`, which is cheaper for the browser because it does not trigger layout).

Part two is a **scheduling** problem. Keep all bars in one array: \`{ id, progress }\`. One interval "ticks" the world: on each tick it walks the array and advances only the first 3 bars that are not finished. That single rule gives you the queue for free — when a bar reaches 100, the next waiting bar becomes one of "the first 3 unfinished" on the next tick.

The interval runs only while there is work (\`hasWork\` in the effect dependencies), and its cleanup clears it.`,
      why: `The interviewer tests:
- A small reusable, accessible component with input clamping.
- Animation basics (CSS transitions vs JS).
- Timers with cleanup and the functional updater.
- **Concurrency limits** — the same idea as limiting parallel uploads or API calls.
- Deriving "what is running" from data instead of storing extra flags.`,
      analogy: `Think of a bank with 3 counters. Customers (bars) join one line. Only 3 can be served at once; when one finishes, the next person in line walks to the free counter. The manager does not keep a separate list of "who is at a counter" — she just looks at the line and serves the first 3 who are not done.`,
      code: [
        {
          title: 'ProgressBars.jsx — component + queued bars with a concurrency limit',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

const LIMIT = 3;       // max bars filling at once
const STEP = 5;        // percent per tick
const TICK_MS = 100;   // 100 ms * (100 / 5) = 2 seconds per bar

export function ProgressBar({ value, label = 'Progress' }) {
  const percent = Math.min(100, Math.max(0, Math.round(value))); // clamp bad input
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      style={{ height: 20, background: '#eee', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}
    >
      <div
        style={{
          width: percent + '%',
          height: '100%',
          background: percent === 100 ? '#2ecc71' : '#4a90e2',
          transition: 'width ' + TICK_MS + 'ms linear',
          color: '#fff', fontSize: 12, textAlign: 'right', paddingRight: percent ? 6 : 0,
          boxSizing: 'border-box',
        }}
      >
        {percent}%
      </div>
    </div>
  );
}

export default function ProgressBars() {
  const [bars, setBars] = useState([]);
  const hasWork = bars.some((b) => b.progress < 100);

  useEffect(() => {
    if (!hasWork) return; // no interval when everything is done
    const id = setInterval(() => {
      setBars((prev) => {
        let running = 0;
        return prev.map((b) => {
          if (b.progress >= 100) return b;     // finished
          if (running >= LIMIT) return b;      // waiting in the queue
          running++;
          return { ...b, progress: Math.min(100, b.progress + STEP) };
        });
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [hasWork]);

  const addBar = () => setBars((prev) => [...prev, { id: crypto.randomUUID(), progress: 0 }]);

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button onClick={addBar}>Add bar</button>{' '}
      <button onClick={() => setBars([])}>Clear</button>
      <div style={{ marginTop: 16 }}>
        {bars.map((b, i) => (
          <ProgressBar key={b.id} value={b.progress} label={'Task ' + (i + 1)} />
        ))}
      </div>
    </div>
  );
}`,
        },
      ],
      output: `**How it works:**
- \`ProgressBar\` clamps and rounds the value, sets the inner width as a percentage, and animates with a CSS transition. The ARIA attributes let a screen reader say "Task 2, progress bar, 45%".
- \`bars\` is the only state. \`hasWork\` is derived: is any bar below 100?
- The effect starts one interval when there is work and clears it when there is none (or on unmount).
- Each tick uses the functional updater and walks the bars in order. Finished bars are skipped, the first 3 unfinished bars move forward 5%, and the rest wait. So the queue and the limit come from one simple loop.
- Click "Add bar" 6 times: bars 1-3 fill together; when they finish, bars 4-6 start.

**How to build it in the interview (30-40 min):**
1. (5 min) Clarify duration, limit, what "done" looks like.
2. (10 min) \`ProgressBar\` with clamping, transition and ARIA.
3. (10 min) "Add bar" + interval that fills all bars.
4. (10 min) Add the limit rule in the tick; make the interval run only while there is work.`,
      questions: [
        {
          q: 'Why animate `transform: scaleX()` instead of `width`?',
          a: 'Changing `width` makes the browser recalculate layout every frame. `transform` can be done by the compositor (often on the GPU) without layout, so it is smoother. For one small bar, width is fine and simpler.',
        },
        {
          q: 'How would you do it with CSS only, no interval?',
          a: 'Render the inner bar with a CSS animation from `width: 0` to `100%` over 2s, and listen to `onAnimationEnd` to mark the bar done. The queue then starts a bar by setting a `started` flag, and the limit counts started-but-not-done bars.',
        },
        {
          q: 'How is this related to real apps?',
          a: 'It is the same pattern as limiting parallel uploads or API calls (a concurrency pool). Keep a list of jobs, run up to N, start the next when one finishes.',
        },
        {
          q: 'What should a progress bar show if progress is unknown?',
          a: 'Use an indeterminate bar (an animated stripe) and leave out `aria-valuenow`, so assistive tech knows the value is unknown.',
        },
      ],
      spoken: `"The ProgressBar itself is a pure component: it clamps the value between 0 and 100, sets the inner width with a CSS transition, and exposes role progressbar with aria-valuenow, min and max. For the queue I keep one array of bars with an id and progress. One interval ticks only while some bar is unfinished, and on each tick it uses the functional updater to advance only the first three unfinished bars. That loop gives me the queue and the concurrency limit without any extra state, and the cleanup clears the interval."`,
      mistakes: [
        'Starting one `setInterval` per bar and never clearing them when bars are removed or the component unmounts.',
        'Keeping a separate `runningIds` state that goes out of sync with the bars.',
        'Not clamping the value, so `value={120}` overflows the track.',
        'Using `setBars(bars.map(...))` inside the interval — `bars` is stale from the render that created the interval.',
        'Follow-up trap: "Your interval runs forever even when all bars are full — is that a problem?" Yes, it wastes CPU and battery. Derive `hasWork` and only run the interval while it is true.',
      ],
      takeaway: 'Clamp and label the bar; for queued bars, one interval advances only the first N unfinished items — the limit falls out of the data.',
    },
    {
      id: 'debounced-search',
      title: 'Debounced Search',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Search as the user types, but call the API only after they pause, and never let an old response win.',
      what: `**Problem as the interviewer says it:** "Build a search box for users. As the user types, show matching results from an API. Do not call the API on every keystroke — wait until the user stops typing for 400 ms. Show loading, empty and error states."

Requirements checklist:
- Controlled input; results list below.
- **Debounce**: one request after the user pauses, not one per key.
- Empty query: clear results, no request.
- Loading, "No results", and error messages.
- Old responses must not overwrite new ones (race condition).
- Bonus: write a reusable \`useDebounce\` hook; cancel in-flight requests.

#### Deeper version
**Debounce** means "wait until things go quiet". Each new keystroke cancels the previous timer and starts a new one. Only the last timer fires.

In React the clean way is to debounce the **value**, not the function: \`const debounced = useDebounce(query, 400)\`. A \`useEffect\` sets a timeout to copy \`query\` into \`debounced\`, and the cleanup clears that timeout when \`query\` changes. Then a second effect fetches when \`debounced\` changes.

Debouncing reduces requests, but it does **not** fix race conditions: a slow response for "jo" can still arrive after a fast one for "john". So the fetch effect also needs an \`AbortController\` (or an \`ignore\` flag) in its cleanup.`,
      why: `This is one of the most common React rounds because it tests:
- Timers + \`useEffect\` cleanup.
- Writing a **custom hook**.
- **Race conditions** with \`AbortController\`.
- Async UI states: idle, loading, success, empty, error.
- Understanding debounce vs throttle.`,
      analogy: `Debounce is like a lift (elevator) door. Every time someone walks in, the door timer resets. The lift only leaves after nobody has entered for a few seconds. One trip for the whole group, not one trip per person.`,
      code: [
        {
          title: 'UserSearch.jsx — useDebounce + abortable fetch',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';

// Reusable hook: returns "value", but only after it stops changing for "delay" ms.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // new keystroke -> cancel the old timer
  }, [value, delay]);
  return debounced;
}

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const debouncedQuery = useDebounce(query.trim(), 400);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    setStatus('loading');

    fetch('https://dummyjson.com/users/search?q=' + encodeURIComponent(debouncedQuery) + '&limit=10', {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        setResults(data.users);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setStatus('error');
      });

    return () => controller.abort(); // a newer query cancels this request
  }, [debouncedQuery]);

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <label htmlFor="user-search">Search users</label>
      <input
        id="user-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a name, e.g. emily"
        style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
      />

      {/* aria-live announces status changes to screen readers */}
      <p aria-live="polite" style={{ color: '#666' }}>
        {status === 'loading' && 'Searching…'}
        {status === 'error' && 'Something went wrong. Try again.'}
        {status === 'success' && results.length === 0 && 'No users found.'}
        {status === 'success' && results.length > 0 && results.length + ' results'}
      </p>

      <ul>
        {results.map((u) => (
          <li key={u.id}>
            {u.firstName} {u.lastName} — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
        },
        {
          title: 'A plain debounce function (often asked as a warm-up)',
          lang: 'javascript',
          code: `function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);                         // cancel the previous call
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const log = debounce((q) => console.log('search:', q), 300);
log('r'); log('re'); log('rea'); log('react');
// after 300 ms, only one line: "search: react"`,
        },
      ],
      output: `**How it works:**
- Every keystroke updates \`query\` (so the input stays responsive).
- \`useDebounce\` starts a 400 ms timer. If another key comes first, cleanup clears the timer. Only after a pause does \`debouncedQuery\` change.
- The fetch effect runs only when \`debouncedQuery\` changes. Empty query resets to idle with no request.
- Each fetch has its own \`AbortController\`. If a new debounced query arrives while the old request is still running, cleanup aborts it. The aborted promise rejects with \`AbortError\`, which we ignore.
- \`status\` is one value instead of separate \`loading\`/\`error\` booleans, so impossible combos (loading AND error) cannot happen.
- \`aria-live="polite"\` makes screen readers read "Searching…" and "5 results".

Typing "emily" quickly → one request for "emily" after 400 ms, not five.

**How to build it in the interview (30-45 min):**
1. (5 min) Clarify delay, min characters, API shape.
2. (10 min) Input + fetch on change (no debounce yet) + render.
3. (10 min) Add \`useDebounce\` and explain cleanup.
4. (10 min) AbortController, status states, aria-live.
5. (5 min) Mention caching, min length, highlighting.`,
      questions: [
        {
          q: 'Debounce vs throttle?',
          a: 'Debounce waits until calls stop, then runs once (search box, resize end). Throttle runs at most once every N ms while calls keep coming (scroll position, mouse move).',
        },
        {
          q: 'Why not just wrap the onChange handler with `debounce()`?',
          a: 'You can, but you must keep the same debounced function across renders with `useMemo` or `useRef`; otherwise each render creates a new debounce with a new timer and it never works. You also need to cancel it on unmount. Debouncing the value with a hook avoids these traps.',
        },
        {
          q: 'Does debounce prevent race conditions?',
          a: 'No. It only reduces how many requests are sent. Two requests can still be in flight, and the older one can finish last. You need `AbortController` or an ignore flag.',
        },
        {
          q: 'How would you cache results?',
          a: 'Keep a `Map` in a `useRef` keyed by the query. Check it before fetching and store results after. Typing "react", deleting a letter and retyping it then costs no extra request.',
        },
        {
          q: 'What about `useDeferredValue`?',
          a: '`useDeferredValue` lets React render an expensive list with lower priority, which helps for slow local filtering. It does not wait a fixed time, so it does not reduce network calls. For API calls I still debounce.',
        },
      ],
      spoken: `"I keep the input fully controlled so typing feels instant, and I debounce the value with a small useDebounce hook: an effect sets a timeout and its cleanup clears it, so only the value after a pause comes out. A second effect fetches when the debounced value changes. Debouncing alone doesn't stop race conditions, so each request has an AbortController that the cleanup aborts when a newer query arrives. I model the UI as one status value — idle, loading, success or error — and announce it with aria-live."`,
      mistakes: [
        'Calling `debounce(fn)` inside the component body without `useMemo`/`useRef` — a new debounced function each render means it never debounces.',
        'Forgetting `clearTimeout` in cleanup, so every keystroke still fires a request after the delay.',
        'Not handling out-of-order responses; the screen shows results for an old query.',
        'Treating `AbortError` as a real error and flashing "Something went wrong".',
        'Follow-up trap: "Is 0 ms debounce the same as no debounce?" No — it still waits for the next macrotask and drops all but the last call in the same tick, but it is pointless for typing.',
      ],
      takeaway: 'Debounce the value with a timer + cleanup, and still abort old requests — debouncing alone does not fix races.',
    },
    {
      id: 'form-validation',
      title: 'Form with Validation',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A signup form with one values object, a pure validate function, errors shown on blur and submit, and accessible error messages.',
      what: `**Problem as the interviewer says it:** "Build a signup form with name, email, password and confirm password. Validate it: all required, valid email, password at least 8 characters with a number, and passwords must match. Show errors under each field. Disable the button while submitting."

Requirements checklist:
- Show an error **after** the user leaves a field (blur), not while they are still typing the first letter.
- On submit: validate everything, show all errors, focus the first invalid field.
- Submit button shows "Creating…" and is disabled while the request runs.
- Show a success or server error message.
- Accessible: labels, \`aria-invalid\`, \`aria-describedby\` linking each input to its error.

#### Deeper version
Keep it simple with **three objects**: \`values\`, \`touched\` and \`errors\`. Better still, do not store \`errors\` at all — compute them with a **pure function** \`validate(values)\` on every render. Then errors can never get out of sync with values.

What you **show** is \`touched[field] && errors[field]\`. On submit, mark every field as touched so all errors appear.

Client-side validation is only for user experience. The server must validate again, because anyone can skip your JavaScript and call the API directly.`,
      why: `Forms are everywhere in real apps. The interviewer checks:
- One generic \`handleChange\` using the input \`name\` instead of one handler per field.
- Derived errors vs stored errors.
- UX timing: when to show errors (touched / submitted).
- Async submit: loading state, double-submit prevention, server errors.
- Accessibility of error messages.`,
      analogy: `It is like a passport office counter. The officer does not shout "wrong!" while you are still filling the form. They check each box after you finish it, and at the end they check the whole form again before stamping. And the head office checks it once more (server validation) — they do not just trust the counter.`,
      code: [
        {
          title: 'SignupForm.jsx — full working component',
          lang: 'jsx',
          code: `import { useRef, useState } from 'react';

const INITIAL = { name: '', email: '', password: '', confirm: '' };

// Pure function: same values in -> same errors out. Easy to test.
export function validate(v) {
  const errors = {};
  if (!v.name.trim()) errors.name = 'Name is required.';
  if (!v.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v.email)) errors.email = 'Enter a valid email.';
  if (v.password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (!/\\d/.test(v.password)) errors.password = 'Add at least one number.';
  if (v.confirm !== v.password) errors.confirm = 'Passwords do not match.';
  return errors;
}

// Fake API: resolves after 1s, rejects for a taken email.
function fakeSignup(values) {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (values.email === 'taken@test.com') reject(new Error('This email is already registered.'));
      else resolve({ id: 1 });
    }, 1000)
  );
}

function Field({ label, name, type = 'text', value, error, onChange, onBlur, inputRef }) {
  const errorId = name + '-error';
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        ref={inputRef}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        style={{ display: 'block', width: '100%', padding: 8, borderColor: error ? 'crimson' : '#ccc' }}
      />
      {error && (
        <p id={errorId} style={{ color: 'crimson', margin: '4px 0 0', fontSize: 14 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function SignupForm() {
  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState(null); // { type, text }
  const refs = useRef({});

  const errors = validate(values); // derived on every render
  const show = (name) => (touched[name] ? errors[name] : undefined);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value })); // one handler for all fields
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // block double submit
    setTouched({ name: true, email: true, password: true, confirm: true });

    const firstInvalid = Object.keys(INITIAL).find((k) => errors[k]);
    if (firstInvalid) {
      refs.current[firstInvalid]?.focus();
      return;
    }

    setSubmitting(true);
    setServerMsg(null);
    try {
      await fakeSignup(values);
      setServerMsg({ type: 'success', text: 'Account created!' });
      setValues(INITIAL);
      setTouched({});
    } catch (err) {
      setServerMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldProps = (name) => ({
    name,
    value: values[name],
    error: show(name),
    onChange: handleChange,
    onBlur: handleBlur,
    inputRef: (el) => (refs.current[name] = el),
  });

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 360, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Sign up</h1>
      <Field label="Full name" {...fieldProps('name')} />
      <Field label="Email" type="email" {...fieldProps('email')} />
      <Field label="Password" type="password" {...fieldProps('password')} />
      <Field label="Confirm password" type="password" {...fieldProps('confirm')} />

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create account'}
      </button>

      {serverMsg && (
        <p role={serverMsg.type === 'error' ? 'alert' : 'status'}
           style={{ color: serverMsg.type === 'error' ? 'crimson' : 'green' }}>
          {serverMsg.text}
        </p>
      )}
    </form>
  );
}`,
        },
      ],
      output: `**How it works:**
- \`values\` holds all fields in one object. \`handleChange\` uses \`e.target.name\` with a computed key \`[name]\`, so one handler serves every input.
- \`errors\` is not state. \`validate(values)\` runs each render, so errors always match the current values.
- An error is shown only if that field is \`touched\` (blurred at least once). Typing the first letter of an email does not flash "invalid email".
- Submit marks all fields touched, finds the first invalid field and focuses it. If valid, it calls the fake API, disables the button and shows "Creating…".
- \`finally\` always turns \`submitting\` off, even when the API fails.
- \`noValidate\` turns off the browser's own popups so our messages are consistent. Each input has \`aria-invalid\` and \`aria-describedby\` pointing to its error text, so screen readers read the error with the field.
- Try \`taken@test.com\` to see the server error path.

**How to build it in the interview (45 min):**
1. (5 min) Clarify rules and when to show errors.
2. (10 min) Inputs with one \`values\` object + generic \`handleChange\`.
3. (10 min) \`validate\` function + show on submit.
4. (10 min) \`touched\` on blur, focus first error, async submit states.
5. (10 min) ARIA, styling, mention server validation and libraries.`,
      questions: [
        {
          q: 'Controlled or uncontrolled inputs for a big form?',
          a: 'Controlled is simple and gives instant validation, but every keystroke re-renders the form. For very large forms, uncontrolled inputs with refs (what React Hook Form does) re-render less. For an interview, controlled is clearer.',
        },
        {
          q: 'How would you add async validation, like "username taken"?',
          a: 'On blur (or debounced on change), call the API and store the result in a separate `asyncErrors` state. Use an AbortController or ignore flag so an old check cannot overwrite a newer one. Merge it with the sync errors for display.',
        },
        {
          q: 'Why validate on the server too?',
          a: 'Client validation is for UX only. A user can turn off JavaScript or call the API directly with curl, so the server must check every rule again.',
        },
        {
          q: 'How do you stop double submits?',
          a: 'Disable the button while `submitting` and return early in the handler if already submitting. On the server, idempotency keys protect payments and other critical actions.',
        },
        {
          q: 'How would you scale this to 20 forms in an app?',
          a: 'Extract a `useForm({ initialValues, validate, onSubmit })` hook that returns values, errors, touched and handlers. Or use React Hook Form with a schema library like Zod for shared client/server rules.',
        },
      ],
      spoken: `"I keep all field values in one object with one generic change handler that uses the input's name. Errors are derived from a pure validate function on each render, so they can't go out of sync. I track touched fields so errors appear after blur, not on the first keystroke, and on submit I mark everything touched and focus the first invalid field. Submitting sets a flag that disables the button and blocks double submits, with finally to reset it. Each input has a label, aria-invalid, and aria-describedby pointing to its error. And I always say: the server must validate again."`,
      mistakes: [
        'Storing `errors` in state and forgetting to recompute it on some change path.',
        'Showing every error on page load before the user has touched anything.',
        'Writing one `useState` + one handler per field, which does not scale and repeats code.',
        'Not resetting the loading flag on failure (no `finally`), so the button stays disabled forever.',
        'Follow-up trap: "Is `type="email"` enough validation?" No — browsers accept addresses like `a@b`, the rules vary, and with `noValidate` it does nothing. Validate yourself and on the server.',
      ],
      takeaway: 'One values object, errors derived from a pure validate function, shown when touched — and always validate again on the server.',
    },
    {
      id: 'autocomplete',
      title: 'Autocomplete / Typeahead',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Debounced suggestions with caching, race-condition safety, keyboard navigation and the ARIA combobox pattern.',
      what: `**Problem as the interviewer says it:** "Build an autocomplete input. As the user types, show up to 8 suggestions from an API in a dropdown. The user can pick one with the mouse or with arrow keys + Enter. Escape closes the list. Highlight the matching part of each suggestion."

Requirements checklist:
- Debounced API calls (300 ms), minimum 2 characters.
- Dropdown with loading / no results states.
- **Keyboard**: ArrowDown / ArrowUp move the highlight, Enter selects, Escape closes.
- Mouse: hover highlights, click selects; clicking outside closes.
- **Cache** results per query so repeated queries are instant.
- No stale results (race conditions).
- Accessible: ARIA **combobox** pattern.

#### Deeper version
This is "debounced search" plus a **keyboard-driven list**. Extra state: \`activeIndex\` (which option is highlighted, \`-1\` for none) and \`open\`.

Focus **stays in the input** the whole time. We do not move real focus to the options. Instead we tell screen readers which option is active with \`aria-activedescendant="option-3"\` on the input. The input has \`role="combobox"\`, \`aria-expanded\`, \`aria-controls\` (the list id) and \`aria-autocomplete="list"\`. The list has \`role="listbox"\` and each item has \`role="option"\` with \`aria-selected\`.

A common bug: clicking an option first **blurs** the input, the blur closes the list, and the click lands on nothing. Fix it with \`onMouseDown={e => e.preventDefault()}\` on the list, so the input never loses focus.`,
      why: `It is probably the most asked frontend machine-coding problem because it combines everything:
- Debouncing and effect cleanup.
- Race conditions and caching.
- Keyboard handling with an index that wraps.
- Focus/blur timing bugs.
- The combobox ARIA pattern.
- Performance thinking (cache, min length, limit).`,
      analogy: `It is like a helpful shop assistant. You start saying a product name, and after you pause, they hold up a few matching items. You can point at one (mouse) or say "next, next, that one" (arrow keys + Enter). If you have asked about the same thing before, they remember the answer (cache) instead of going to the store room again.`,
      code: [
        {
          title: 'Autocomplete.jsx — full working component',
          lang: 'jsx',
          code: `import { useEffect, useId, useRef, useState } from 'react';

const MIN_CHARS = 2;

// Bold the part of "text" that matches "query" (no regex needed).
function Highlight({ text, query }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1 || !query) return text;
  return (
    <>
      {text.slice(0, i)}
      <strong>{text.slice(i, i + query.length)}</strong>
      {text.slice(i + query.length)}
    </>
  );
}

export default function Autocomplete({ onSelect = (item) => console.log('selected', item) }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cache = useRef(new Map()); // query -> results, survives re-renders
  const listId = useId();

  const term = query.trim().toLowerCase();

  useEffect(() => {
    if (term.length < MIN_CHARS) {
      setItems([]);
      setLoading(false);
      return;
    }
    // Cache hit: no debounce, no request.
    if (cache.current.has(term)) {
      setItems(cache.current.get(term));
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          'https://dummyjson.com/products/search?q=' + encodeURIComponent(term) + '&limit=8&select=title',
          { signal: controller.signal }
        );
        const data = await res.json();
        cache.current.set(term, data.products);
        setItems(data.products);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') setItems([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    // New keystroke: cancel the timer AND any request in flight.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  function choose(item) {
    setQuery(item.title);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(item);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); // stop the cursor jumping to the end
      setOpen(true);
      setActiveIndex((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (items.length ? (i <= 0 ? items.length - 1 : i - 1) : -1));
    } else if (e.key === 'Enter' && open && activeIndex >= 0) {
      e.preventDefault();
      choose(items[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showList = open && term.length >= MIN_CHARS;
  const optionId = (i) => listId + '-opt-' + i;

  return (
    <div style={{ position: 'relative', width: 320, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <label htmlFor={listId + '-input'}>Search products</label>
      <input
        id={listId + '-input'}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          // Keep focus in the input so blur does not close the list before click.
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: 'absolute', left: 0, right: 0, margin: 0, padding: 0,
            listStyle: 'none', border: '1px solid #ccc', background: '#fff', zIndex: 10,
          }}
        >
          {loading && <li style={{ padding: 8, color: '#888' }}>Loading…</li>}
          {!loading && items.length === 0 && <li style={{ padding: 8, color: '#888' }}>No results</li>}
          {!loading &&
            items.map((item, i) => (
              <li
                key={item.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(item)}
                style={{ padding: 8, cursor: 'pointer', background: i === activeIndex ? '#e8f0fe' : 'transparent' }}
              >
                <Highlight text={item.title} query={query.trim()} />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}`,
        },
      ],
      output: `**How it works:**
- \`term\` (trimmed, lowercased query) drives one effect. Under 2 characters: clear and stop.
- **Cache first**: a \`Map\` in a \`useRef\` stores results per term. A hit sets items instantly with no timer and no request.
- Otherwise the effect starts a 300 ms timer (debounce) and creates an \`AbortController\`. The cleanup clears the timer and aborts the request, so only the latest term can ever set \`items\`. That handles both debouncing and race conditions in one place.
- Keyboard: ArrowDown/Up change \`activeIndex\` with wrap-around (\`% length\`). \`preventDefault\` stops the text cursor from jumping. Enter picks the active item. Escape closes.
- \`aria-activedescendant\` points at the highlighted option's id, so screen readers announce it while real focus stays in the input.
- \`onMouseDown\` + \`preventDefault\` on the list keeps the input focused, so \`onBlur\` does not close the list before \`onClick\` runs.
- \`Highlight\` bolds the matched part using \`indexOf\` and \`slice\` — no regex escaping problems with characters like \`(\` or \`+\`.

**How to build it in the interview (60 min):**
1. (5 min) Clarify: API, min chars, max results, what happens on select.
2. (10 min) Input + fetch + render list.
3. (10 min) Debounce + abort in one effect cleanup.
4. (10 min) Cache with \`useRef(Map)\`.
5. (15 min) Keyboard nav, blur/click fix, close on Escape.
6. (10 min) ARIA combobox, highlight, loading/empty states.`,
      questions: [
        {
          q: 'Why store the cache in `useRef` and not `useState`?',
          a: 'Changing the cache should not trigger a re-render, and it must survive re-renders. `useRef` gives a stable mutable box. For an app-wide cache, I would move it to a module-level Map or a library like TanStack Query.',
        },
        {
          q: 'Why does clicking an option sometimes do nothing?',
          a: 'The input blurs on mousedown, `onBlur` closes the list, and the option is removed before `click` fires. Prevent default on the list\'s mousedown so focus never leaves the input.',
        },
        {
          q: 'How would you limit the cache size?',
          a: 'Use an LRU (least recently used) cache: a `Map` keeps insertion order, so on each hit delete and re-set the key, and when size goes over the limit delete `map.keys().next().value` (the oldest).',
        },
        {
          q: 'How do you make it work for 1 million local items instead of an API?',
          a: 'Pre-build a lowercase index, filter with a limit and stop early once you have 8 matches, use `useDeferredValue` to keep typing smooth, and for big lists consider a trie or a Web Worker.',
        },
        {
          q: 'How would you scroll the active option into view in a long list?',
          a: 'In an effect on `activeIndex`, call `document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: \'nearest\' })`.',
        },
      ],
      spoken: `"One effect keyed on the trimmed query handles everything: if the query is too short it clears; if the cache has it, it uses the cached results; otherwise it sets a 300 millisecond timer and an AbortController, and the cleanup clears both. So I get debouncing and race-condition safety together. The cache is a Map in a ref. Keyboard support uses an activeIndex that wraps with ArrowUp and ArrowDown, Enter selects and Escape closes. Focus stays in the input, which is a combobox with aria-activedescendant pointing at the highlighted option, and I prevent default on the list mousedown so blur doesn't close it before the click."`,
      mistakes: [
        'Only debouncing and not aborting/ignoring old requests — fast typists see results for an older query.',
        'Moving real DOM focus to each option, which breaks typing; use `aria-activedescendant` instead.',
        'Closing on `onBlur` without the mousedown fix, so mouse selection randomly fails.',
        'Not resetting `activeIndex` when results change, so Enter selects an index that no longer exists.',
        'Follow-up trap: "Why `e.preventDefault()` on ArrowUp/ArrowDown?" In a text input those keys move the cursor to the start/end; preventing it keeps the caret where the user left it.',
      ],
      takeaway: 'Debounce + abort in one effect cleanup, cache in a ref, keyboard via activeIndex, and the combobox ARIA pattern with focus kept in the input.',
    },
    {
      id: 'infinite-scroll',
      title: 'Infinite Scroll',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Load the next page when a sentinel at the bottom becomes visible, using IntersectionObserver, with no duplicate or double loads.',
      what: `**Problem as the interviewer says it:** "Show a list of products. Load 20 at first. When the user scrolls near the bottom, load the next 20 automatically. Stop when there is no more data. Show a loader while fetching and handle errors with a retry button."

Requirements checklist:
- Fetch page by page (\`limit\` + \`skip\`), **append** to the list.
- Trigger the next load when the bottom is near (not on every scroll pixel).
- Never load the same page twice; never load while a load is running.
- Stop when everything is loaded ("You've reached the end").
- Loading, error + retry.

#### Deeper version
The old way was a \`scroll\` listener that checks \`scrollTop + clientHeight >= scrollHeight - 200\`. It fires many times per second and needs throttling.

The modern way is an **IntersectionObserver**: put an empty \`<div>\` (a **sentinel**) after the last item and ask the browser to tell you when it enters the screen. \`rootMargin: '200px'\` fires a little before it is visible, so loading starts early.

The tricky part is **stale closures** and **double loads**. A clean trick: only create the observer when we are allowed to load (\`!loading && hasMore && !error\`). Put those in the effect dependencies. While loading, there is no observer, so it cannot fire twice. When loading finishes, a new observer is created; if the sentinel is still on screen (short page), it fires again right away and loads more until the screen is full.`,
      why: `The interviewer tests:
- **IntersectionObserver** knowledge (vs scroll listeners).
- Appending data with the functional updater.
- Preventing **duplicate requests** and handling StrictMode double effects.
- Effect cleanup (\`observer.disconnect()\`).
- Edge cases: end of data, errors, short first page.
- Follow-ups on performance: virtualization for thousands of rows.`,
      analogy: `Imagine a waiter watching your plate. When you are close to finishing (the sentinel comes into view), they bring the next dish. They don't bring a new dish every time you lift your fork (scroll event), and they don't bring two dishes at once while the kitchen is still cooking (loading guard). When the menu is finished, they stop.`,
      code: [
        {
          title: 'InfiniteProducts.jsx — full working component',
          lang: 'jsx',
          code: `import { useEffect, useRef, useState } from 'react';

const LIMIT = 20;

export default function InfiniteProducts() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const sentinelRef = useRef(null);

  // 1. Fetch whenever "page" changes (or the user retries).
  useEffect(() => {
    let ignore = false; // guards against StrictMode double-run and unmount
    setLoading(true);
    setError(null);

    fetch('https://dummyjson.com/products?limit=' + LIMIT + '&skip=' + page * LIMIT + '&select=title,price,thumbnail')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (ignore) return;
        setItems((prev) => [...prev, ...data.products]); // append, don't replace
        setHasMore((page + 1) * LIMIT < data.total);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, retryCount]);

  // 2. Watch the sentinel only when we are allowed to load more.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading || !hasMore || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPage((p) => p + 1);
      },
      { rootMargin: '200px' } // start loading 200px before the bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasMore, error]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Products</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((p) => (
          <li key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderBottom: '1px solid #eee' }}>
            <img src={p.thumbnail} alt="" width={48} height={48} loading="lazy" />
            <span>{p.title}</span>
          </li>
        ))}
      </ul>

      <div aria-live="polite" style={{ textAlign: 'center', padding: 16 }}>
        {loading && 'Loading more…'}
        {error && (
          <>
            Failed to load ({error}).{' '}
            <button onClick={() => setRetryCount((c) => c + 1)}>Retry</button>
          </>
        )}
        {!hasMore && !loading && "You've reached the end."}
      </div>

      {/* The sentinel: when this is near the screen, load the next page */}
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </div>
  );
}`,
        },
        {
          title: 'The old way: scroll listener (know it, but prefer the observer)',
          lang: 'javascript',
          code: `function isNearBottom(offset = 200) {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  return scrollTop + clientHeight >= scrollHeight - offset;
}

// Must be throttled, because "scroll" fires many times per second.
let waiting = false;
window.addEventListener('scroll', () => {
  if (waiting) return;
  waiting = true;
  setTimeout(() => {
    waiting = false;
    if (isNearBottom()) console.log('load next page');
  }, 200);
});`,
        },
      ],
      output: `**How it works:**
- Effect 1 fetches the page for the current \`page\` number and **appends** with \`setItems(prev => [...prev, ...new])\`. The \`ignore\` flag stops a cancelled run from appending — in React 18+ StrictMode (development), effects run twice on mount, and without the flag page 0 would be appended twice.
- \`hasMore\` is computed from the API's \`total\`.
- Effect 2 creates an \`IntersectionObserver\` only when \`!loading && hasMore && !error\`. While loading, no observer exists, so no double loads. The cleanup calls \`disconnect()\`.
- When a load finishes, \`loading\` flips to false, effect 2 runs again with a fresh observer. If the sentinel is already visible, it fires at once and loads the next page — this fills tall screens automatically.
- Retry bumps \`retryCount\`, which re-runs effect 1 for the same page.
- \`loading="lazy"\` on images and \`alt=""\` (decorative image; the title is the text) keep it fast and accessible.

**How to build it in the interview (45 min):**
1. (5 min) Clarify page size, API, end-of-list UI, errors.
2. (10 min) Fetch first page, render list.
3. (15 min) Sentinel + IntersectionObserver + \`page\` increment + append.
4. (10 min) Guards: loading, hasMore, ignore flag; end message.
5. (5 min) Error + retry, explain virtualization as next step.`,
      questions: [
        {
          q: 'Why IntersectionObserver instead of a scroll listener?',
          a: 'The browser does the visibility math off the main thread work path and calls you only when the sentinel crosses the threshold. A scroll listener fires dozens of times per second, needs throttling, and forces layout reads.',
        },
        {
          q: 'How do you prevent loading the same page twice?',
          a: 'Do not observe while loading, and use an ignore flag or AbortController in the fetch effect. Optionally also dedupe by id when appending: `new Map([...prev, ...next].map(p => [p.id, p]))`.',
        },
        {
          q: 'The list has 10,000 items now and scrolling is slow. What next?',
          a: 'Use **virtualization** (windowing): only render the rows visible on screen plus a small buffer, using a library like react-window or TanStack Virtual. The DOM stays small no matter how long the list is.',
        },
        {
          q: 'How do you restore the scroll position when the user comes back?',
          a: 'Keep the loaded items in a cache (Context, store or TanStack Query) and save `window.scrollY` before leaving; restore both on return. Without the cached data, there is nothing to scroll back to.',
        },
        {
          q: 'Infinite scroll vs "Load more" button vs pagination?',
          a: 'Infinite scroll suits feeds. A "Load more" button is better when there is a footer or for accessibility, because the user controls it. Pagination is best when users need to jump to or share a specific page.',
        },
      ],
      spoken: `"I fetch by page number in one effect and append with the functional updater, using an ignore flag so StrictMode or an unmount can't append twice. For the trigger I put a sentinel div after the list and watch it with an IntersectionObserver with a 200 pixel root margin. I only create the observer when I'm not loading, there's more data and there's no error, so it can't fire twice, and the cleanup disconnects it. When a load finishes the observer is recreated, which also fills tall screens. For very long lists I'd add virtualization."`,
      mistakes: [
        'Replacing the list instead of appending (`setItems(data.products)`), so old items disappear.',
        'Observer callback reading `loading` from a stale closure, causing two loads for one scroll.',
        'No `hasMore` check, so it keeps requesting empty pages forever.',
        'Forgetting `observer.disconnect()` in cleanup, leaving observers alive after unmount.',
        'Follow-up trap: "Why do I see the first 20 items twice in development?" StrictMode runs effects twice on mount; without an ignore flag or abort, both runs append. Fix the effect, do not remove StrictMode.',
      ],
      takeaway: 'Sentinel + IntersectionObserver created only when allowed to load, append with the functional updater, and guard the fetch with an ignore flag.',
    },
    {
      id: 'stopwatch-countdown',
      title: 'Stopwatch and Countdown Timer',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Timers that stay accurate by using timestamps, keep the interval id in a ref, and always clear the interval in cleanup.',
      what: `**Problem as the interviewer says it:** "Build a stopwatch with Start, Stop, Reset and Lap. Show minutes, seconds and hundredths. Then build a countdown timer: the user enters seconds, presses Start, can Pause and Resume, and sees 'Time's up!' at zero."

Requirements checklist:
- Display \`mm:ss.cc\` (stopwatch) and \`mm:ss\` (countdown).
- Start / Stop / Reset; Lap records the current time.
- Pause and resume continue from the same value.
- Stays accurate even if the tab is in the background.
- No leaked intervals after unmount.

#### Deeper version
The naive approach is \`setInterval(() => setTime(t => t + 10), 10)\`. It **drifts**: browsers do not promise exact timing, and background tabs slow timers down (often to once per second or less). After a few minutes the display is wrong.

The accurate approach: **store timestamps, not ticks**. Save when the run started (\`Date.now()\`), and on each tick compute \`elapsed = savedBefore + (Date.now() - startedAt)\`. The interval only decides how often we **redraw**; the value always comes from the real clock. For a countdown, save the end time: \`remaining = endAt - Date.now()\`.

Values that do not need to trigger a render (start timestamp, end timestamp) live in **refs**. The interval itself lives in a \`useEffect\` that depends on \`running\`, so cleanup clears it automatically.`,
      why: `The interviewer checks:
- \`setInterval\` + \`useEffect\` cleanup (classic leak).
- **Stale closures** inside intervals (the "counter stuck at 1" bug).
- \`useRef\` vs \`useState\`: what needs a re-render and what does not.
- Accuracy thinking: drift and background tabs.
- Formatting with \`padStart\`.`,
      analogy: `A naive timer is like counting "one Mississippi, two Mississippi" in your head — you slowly drift, and if you get distracted (background tab) you lose count. An accurate timer is like writing down the clock time when you started and looking at the wall clock whenever someone asks. The answer is always right, no matter how often you look.`,
      code: [
        {
          title: 'Stopwatch.jsx — timestamp-based, with laps',
          lang: 'jsx',
          code: `import { useEffect, useRef, useState } from 'react';

function format(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  const pad = (n) => String(n).padStart(2, '0');
  return pad(minutes) + ':' + pad(seconds) + '.' + pad(hundredths); // 01:05.42
}

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // what we display
  const [laps, setLaps] = useState([]);
  const startedAt = useRef(0); // Date.now() when the current run started
  const before = useRef(0);    // total ms from earlier runs (before pausing)

  const now = () => before.current + (Date.now() - startedAt.current);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(now()), 30); // redraw ~33 times/sec
    return () => clearInterval(id); // stop ticking on pause or unmount
  }, [running]);

  function start() {
    startedAt.current = Date.now();
    setRunning(true);
  }
  function stop() {
    before.current = now(); // bank the time so far
    setElapsed(before.current);
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    before.current = 0;
    setElapsed(0);
    setLaps([]);
  }
  function lap() {
    setLaps((prev) => [now(), ...prev]); // read the real clock, not the last render
  }

  return (
    <div style={{ fontFamily: 'monospace', textAlign: 'center', marginTop: 40 }}>
      <div role="timer" aria-live="off" style={{ fontSize: 48 }}>{format(elapsed)}</div>
      {running ? <button onClick={stop}>Stop</button> : <button onClick={start}>Start</button>}
      <button onClick={lap} disabled={!running}>Lap</button>
      <button onClick={reset} disabled={running || elapsed === 0}>Reset</button>
      <ol>
        {laps.map((t, i) => (
          <li key={laps.length - i}>{format(t)}</li>
        ))}
      </ol>
    </div>
  );
}`,
        },
        {
          title: 'Countdown.jsx — pause/resume with an end timestamp',
          lang: 'jsx',
          code: `import { useEffect, useRef, useState } from 'react';

export default function Countdown() {
  const [input, setInput] = useState('10');
  const [remaining, setRemaining] = useState(0); // ms
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, endAt.current - Date.now());
      setRemaining(left);
      if (left === 0) {
        setRunning(false); // effect cleanup clears the interval
        setDone(true);
      }
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    const ms = remaining > 0 ? remaining : Number(input) * 1000; // resume or fresh start
    if (!ms) return;
    endAt.current = Date.now() + ms;
    setRemaining(ms);
    setDone(false);
    setRunning(true);
  }

  const secs = Math.ceil(remaining / 1000);
  const label = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: 40 }}>
      <label>
        Seconds{' '}
        <input type="number" min="1" value={input} disabled={running}
               onChange={(e) => setInput(e.target.value)} style={{ width: 80 }} />
      </label>
      <div role="timer" style={{ fontSize: 48, margin: 16 }}>{label}</div>
      {running ? (
        <button onClick={() => setRunning(false)}>Pause</button>
      ) : (
        <button onClick={start}>{remaining > 0 ? 'Resume' : 'Start'}</button>
      )}
      <button onClick={() => { setRunning(false); setRemaining(0); setDone(false); }}>Reset</button>
      {done && <p role="status">Time's up!</p>}
    </div>
  );
}`,
        },
      ],
      output: `**Stopwatch — how it works:**
- \`startedAt\` (ref) stores when the current run began; \`before\` (ref) stores time banked from earlier runs. Refs, because changing them should not re-render.
- \`now()\` = banked time + time since start. It always reads the **real clock**, so there is no drift, even if the tab was in the background.
- The interval only calls \`setElapsed(now())\` to redraw. It lives in an effect on \`[running]\`, so stopping or unmounting clears it automatically.
- Stop banks the time into \`before\`. Start sets a fresh \`startedAt\`. Lap uses \`now()\`, not \`elapsed\`, so it is exact.
- \`format\` pads each part to two digits with \`padStart\`: \`01:05.42\`.

**Countdown — how it works:**
- Start saves \`endAt = Date.now() + ms\`. Each tick computes \`endAt - Date.now()\`.
- Pause just sets \`running=false\`; \`remaining\` keeps the value. Resume uses \`remaining\` to compute a new \`endAt\`.
- At zero we set \`running=false\` and \`done=true\`; the effect cleans up the interval and "Time's up!" appears.
- \`Math.ceil\` makes the display show "00:01" until the last second really ends.

**How to build it in the interview (45 min):** stopwatch first (25 min): display + start/stop with refs, then lap and reset. Countdown (15 min) reusing the same pattern. Last 5 min: explain drift and cleanup.`,
      questions: [
        {
          q: 'Why does `setInterval(() => setCount(count + 1), 1000)` get stuck at 1?',
          a: 'The interval is created once and its callback closes over the first render\'s `count` (0). It keeps setting 0 + 1. Use the updater `setCount(c => c + 1)` or compute from timestamps.',
        },
        {
          q: 'Why store the interval or timestamps in `useRef`?',
          a: 'They must survive re-renders but changing them should not cause one. State would cause extra renders; a normal variable would reset on each render.',
        },
        {
          q: 'Why is the tick-counting approach inaccurate?',
          a: 'Timers are not exact and are throttled in background tabs, so ticks are missed or late. Deriving from `Date.now()` (or `performance.now()`) always gives the true elapsed time.',
        },
        {
          q: 'How would you make a reusable `useInterval` hook?',
          a: 'Store the latest callback in a ref updated every render, and set up `setInterval(() => savedCallback.current(), delay)` in an effect on `[delay]`. Passing `null` as the delay pauses it.',
        },
      ],
      spoken: `"I don't count ticks, because intervals drift and get throttled in background tabs. Instead I store timestamps in refs: when the run started and how much time was banked before. On each tick I compute the elapsed time from Date.now and set state just to redraw. The interval lives in an effect that depends on running, so pausing or unmounting clears it in the cleanup. Lap reads the real clock directly. For the countdown I store the end time, compute remaining on each tick, and pause just keeps the remaining value for resume."`,
      mistakes: [
        'Starting `setInterval` in the component body or a click handler without ever clearing it — intervals stack up and the timer speeds up.',
        'Using `setTime(time + 10)` inside the interval, which reads a stale `time` from the first render.',
        'Counting ticks instead of using timestamps, so the time drifts and is wrong after the tab was hidden.',
        'Keeping the interval id in state, causing extra renders and stale ids in cleanup.',
        'Follow-up trap: "Is `Date.now()` safe if the user changes their system clock?" No — use `performance.now()` for elapsed time; it is monotonic (never jumps back).',
      ],
      takeaway: 'Derive time from timestamps stored in refs, use the interval only to redraw, and clear it in effect cleanup.',
    },
    {
      id: 'otp-input',
      title: 'OTP Input',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'N single-digit boxes with auto-advance, smart backspace, arrow keys and paste-to-fill, driven by one array in state and an array of refs.',
      what: `**Problem as the interviewer says it:** "Build a 6-digit OTP input. Each box takes one digit. Typing moves to the next box. Backspace on an empty box goes back. Pasting '123456' fills all boxes. When all 6 are filled, call onComplete with the code."

Requirements checklist:
- \`length\` prop (default 6), \`onComplete(code)\` prop.
- Digits only.
- Auto-focus next box after typing; Backspace on empty box moves back and clears it.
- Left/Right arrow keys move between boxes.
- Paste fills from the first box.
- Mobile: numeric keyboard and SMS autofill.

#### Deeper version
State is **one array** of strings, like \`['1', '2', '', '', '', '']\`. Focus is not state — it is handled with an **array of refs** (\`useRef([])\`) and calling \`.focus()\` on the right input.

Typing over a filled box: the input briefly contains two characters ("37"). Take the **last** character, so the new digit wins.

For mobile, \`inputMode="numeric"\` shows the number pad, and \`autoComplete="one-time-code"\` lets iOS/Android suggest the code from SMS. The autofill usually goes into the first box as the whole code, so the change handler should treat multi-character input like a paste.`,
      why: `The interviewer checks:
- Managing **multiple inputs** with one array state.
- **Refs for focus management** (array of refs).
- Keyboard event handling (\`onKeyDown\` vs \`onChange\`).
- Paste handling with \`clipboardData\`.
- Small details: digits only, mobile keyboard, accessibility labels.`,
      analogy: `It is like a row of six small parking spots. Each car (digit) takes one spot, and the attendant (focus) walks you to the next free spot automatically. If you reverse out of an empty spot (Backspace), the attendant walks you back one spot. A bus of six cars (paste) is parked in one go.`,
      code: [
        {
          title: 'OtpInput.jsx — full working component',
          lang: 'jsx',
          code: `import { useRef, useState } from 'react';

export function OtpInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(() => Array(length).fill(''));
  const inputs = useRef([]);

  const focusBox = (i) => inputs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  // Put digits into the boxes starting at "start". Used by typing, paste and SMS autofill.
  function fill(start, digits) {
    const next = [...values];
    let i = start;
    for (const d of digits) {
      if (i >= length) break;
      next[i++] = d;
    }
    setValues(next);
    focusBox(i); // box after the last filled one
    if (next.every(Boolean)) onComplete?.(next.join(''));
  }

  function handleChange(i, e) {
    const digits = e.target.value.replace(/\\D/g, ''); // digits only
    if (!digits) return;
    if (digits.length === 1 || digits.length === 2) {
      // Typing (2 chars = typed over an existing digit; keep the new one).
      fill(i, digits.slice(-1));
    } else {
      fill(0, digits); // autofill of the whole code
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...values];
      if (next[i]) {
        next[i] = ''; // clear this box
      } else if (i > 0) {
        next[i - 1] = ''; // empty box: go back and clear previous
        focusBox(i - 1);
      }
      setValues(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(i + 1);
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\\D/g, '').slice(0, length);
    if (digits) fill(0, digits);
  }

  return (
    <div role="group" aria-label="One-time code" style={{ display: 'flex', gap: 8 }}>
      {values.map((v, i) => (
        <input
          key={i} // fixed-length list that never reorders: index key is fine here
          ref={(el) => (inputs.current[i] = el)}
          value={v}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()} // typing replaces the digit
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={'Digit ' + (i + 1) + ' of ' + length}
          style={{ width: 44, height: 52, fontSize: 24, textAlign: 'center' }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState('');
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Enter the code we sent you</h2>
      <OtpInput onComplete={setCode} />
      {code && <p role="status">Verifying {code}…</p>}
    </div>
  );
}`,
        },
      ],
      output: `**How it works:**
- \`values\` is one array of 6 strings. Each input is controlled by \`values[i]\`.
- \`inputs\` is an array of refs, filled by callback refs. \`focusBox\` clamps the index and focuses that box.
- \`fill(start, digits)\` is the one place that writes digits. Typing calls it with one digit, paste and SMS autofill call it with many. It focuses the next box and calls \`onComplete\` when every box is filled.
- In \`handleChange\`, non-digits are removed with \`/\\D/g\`. If the box already had "3" and the user types "7", the value is "37"; we keep the last char.
- Backspace is handled in \`onKeyDown\` because an empty input fires no change event. If the box has a digit, clear it; if it is empty, move back and clear the previous one.
- \`onFocus\` selects the content, so typing simply replaces it.
- Each box has an \`aria-label\` like "Digit 2 of 6", and the group is labelled "One-time code".

**How to build it in the interview (30-40 min):**
1. (5 min) Clarify length, paste, mobile autofill, what onComplete does.
2. (10 min) Render N inputs from an array; type to fill + auto-advance.
3. (10 min) Backspace and arrows in \`onKeyDown\`.
4. (5 min) Paste handler via \`fill\`.
5. (5 min) inputMode, autoComplete, labels, styling.`,
      questions: [
        {
          q: 'Why handle Backspace in `onKeyDown` and not in `onChange`?',
          a: 'If the box is already empty, pressing Backspace does not change the value, so `onChange` never fires. `onKeyDown` fires for every key press.',
        },
        {
          q: 'Is using the index as key OK here?',
          a: 'Yes. The list has a fixed length and never reorders, adds or removes items, so index keys are stable. The rule against index keys is about dynamic lists.',
        },
        {
          q: 'Why not use `type="number"`?',
          a: 'Number inputs allow `e`, `+`, `-` and `.`, show spinners, and can drop leading zeros. `inputMode="numeric"` with a text input gives the number pad without those problems.',
        },
        {
          q: 'How would you add a "Resend code in 30s" link?',
          a: 'Add a countdown using an end timestamp and an interval in an effect with cleanup. Disable the link until it reaches zero, then reset the timer on click.',
        },
      ],
      spoken: `"I store the code as one array of strings and keep an array of refs for focus. All writes go through one fill function that places digits starting at an index, moves focus to the next box, and calls onComplete when every box is filled. Typing keeps only the last digit so typing over a box works, and paste or SMS autofill strip non-digits and fill from the start. Backspace and arrow keys are handled in onKeyDown, because an empty box fires no change event. For mobile I use inputMode numeric and autocomplete one-time-code, and each box has an aria-label."`,
      mistakes: [
        'Handling Backspace only in `onChange`, so it does nothing on empty boxes.',
        'Calling `onComplete` inside a `setValues` updater function — updaters must be pure and may run twice in StrictMode.',
        'Allowing letters or more than one character per box.',
        'Using `type="number"`, which accepts "e" and loses leading zeros.',
        'Follow-up trap: "Where should the OTP be validated?" Only on the server, with an expiry time and a limit on attempts. The client only collects digits.',
      ],
      takeaway: 'One array of values, an array of refs for focus, one fill function for type/paste/autofill, and Backspace in onKeyDown.',
    },
    {
      id: 'tic-tac-toe',
      title: 'Tic-Tac-Toe',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A game board from one array, with turn, winner and draw all derived from state, plus undo history and an N x N follow-up.',
      what: `**Problem as the interviewer says it:** "Build tic-tac-toe for two players on one screen. X goes first. Clicking an empty cell places the current mark. Show whose turn it is, announce the winner or a draw, and add a Restart button. Bonus: undo / move history, and make the board size configurable."

Requirements checklist:
- 3x3 grid; clicks on filled cells or after the game ends do nothing.
- Status: "Next: X", "Winner: O", or "Draw".
- Highlight the winning line.
- Restart; bonus undo (history).
- Bonus: N x N board where you need N in a row.

#### Deeper version
The whole game is **one array** of cells (\`null | 'X' | 'O'\`). Everything else is **derived**:
- Whose turn: count the filled cells. Even count → X, odd → O.
- Winner: check the winning lines.
- Draw: no winner and no empty cells.

Storing \`xIsNext\` or \`winner\` in state is a common source of bugs (they get out of sync). For undo, store **history**: an array of boards. The current board is the last one; undo pops it. This is the same idea as React's official tutorial and as Redux time travel.

For N x N, generate the lines instead of hard-coding them: N rows, N columns and 2 diagonals.`,
      why: `The interviewer tests:
- Minimal state and **derived values**.
- Immutable updates of arrays (copy then set one cell).
- Breaking UI into \`Board\` / \`Cell\` components.
- Clean game logic in pure functions (easy to test).
- Scaling thinking: N x N, history, maybe an AI opponent.`,
      analogy: `The board is like a photo of the game. You never draw on the old photo; each move takes a new photo with one more mark. Undo just means going back to the previous photo. Whose turn it is and who won can be read from the photo itself — you don't need a separate notebook.`,
      code: [
        {
          title: 'TicTacToe.jsx — full working component (N x N, history)',
          lang: 'jsx',
          code: `import { useState } from 'react';

// Build every winning line for an n x n board (rows, columns, 2 diagonals).
function getLines(n) {
  const lines = [];
  for (let r = 0; r < n; r++) lines.push(Array.from({ length: n }, (_, c) => r * n + c));
  for (let c = 0; c < n; c++) lines.push(Array.from({ length: n }, (_, r) => r * n + c));
  lines.push(Array.from({ length: n }, (_, i) => i * n + i));
  lines.push(Array.from({ length: n }, (_, i) => i * n + (n - 1 - i)));
  return lines;
}

function getWinner(board, lines) {
  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((i) => board[i] === first)) return { player: first, line };
  }
  return null;
}

export default function TicTacToe({ size = 3 }) {
  const [history, setHistory] = useState(() => [Array(size * size).fill(null)]);
  const board = history[history.length - 1];

  // Everything below is derived from "board" — no extra state.
  const lines = getLines(size);
  const winner = getWinner(board, lines);
  const filled = board.filter(Boolean).length;
  const isDraw = !winner && filled === board.length;
  const current = filled % 2 === 0 ? 'X' : 'O';

  function play(i) {
    if (board[i] || winner) return; // ignore filled cells and finished games
    const next = [...board];
    next[i] = current;
    setHistory((h) => [...h, next]);
  }

  const undo = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const restart = () => setHistory([Array(size * size).fill(null)]);

  const status = winner ? 'Winner: ' + winner.player : isDraw ? "It's a draw" : 'Next player: ' + current;

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: 40 }}>
      <p role="status" aria-live="polite" style={{ fontSize: 20 }}>{status}</p>
      <div
        role="group"
        aria-label="Tic-tac-toe board"
        style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(' + size + ', 64px)', gap: 4 }}
      >
        {board.map((cell, i) => {
          const isWinning = winner?.line.includes(i);
          const row = Math.floor(i / size) + 1;
          const col = (i % size) + 1;
          return (
            <button
              key={i}
              onClick={() => play(i)}
              disabled={Boolean(cell) || Boolean(winner)}
              aria-label={'Row ' + row + ', column ' + col + ', ' + (cell || 'empty')}
              style={{
                width: 64, height: 64, fontSize: 32, cursor: 'pointer',
                background: isWinning ? '#c8f7c5' : '#fff', color: '#222',
              }}
            >
              {cell}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={undo} disabled={history.length === 1}>Undo</button>{' '}
        <button onClick={restart}>Restart</button>
      </div>
    </div>
  );
}`,
        },
      ],
      output: `**How it works:**
- \`history\` is an array of boards. The current board is the last item. Each move copies the board, sets one cell, and pushes the new board.
- \`current\` (X or O) comes from the number of filled cells. \`winner\` comes from checking all lines. \`isDraw\` = no winner and the board is full. None of these are stored.
- \`getLines(size)\` builds rows, columns and diagonals for any size, so \`<TicTacToe size={4} />\` works without changing logic.
- \`play\` ignores clicks on filled cells and after a win. Cells are also \`disabled\` for the same reason.
- Undo removes the last board; restart resets history.
- Each cell is a button with a label like "Row 2, column 3, X", and the status line is \`aria-live\` so players hear "Winner: X".

**How to build it in the interview (40 min):**
1. (5 min) Clarify: 2 players local, N x N?, history?
2. (10 min) Grid from an array + click to place + derived turn.
3. (10 min) Winner/draw with lines; highlight winning line.
4. (10 min) History + undo + restart.
5. (5 min) Generalize to N x N, mention AI with minimax.`,
      questions: [
        {
          q: 'Why not store `xIsNext` in state?',
          a: 'It can be calculated from the board (even filled count means X). Storing it adds a second source of truth that can get out of sync — for example after undo.',
        },
        {
          q: 'How would you check the winner efficiently on a big board?',
          a: 'Only check the lines through the last move: its row, its column and the diagonals if it is on them. That is O(n) per move instead of checking every line.',
        },
        {
          q: 'How would you add a computer opponent?',
          a: 'After the human moves, compute the AI move in an effect or in the same handler. A simple AI picks a winning move, else blocks, else takes the center or a random cell. A perfect AI uses the minimax algorithm.',
        },
        {
          q: 'How would you let players jump to any past move?',
          a: 'Keep `history` and a `step` index. Render the board at `history[step]`. A new move slices history to `step + 1` and appends, which drops the "future" moves.',
        },
      ],
      spoken: `"The only state is a history array of boards; the current board is the last one. Whose turn it is, the winner and a draw are all derived: the turn from the filled count, the winner by checking lines, and a draw when the board is full with no winner. Each move copies the board and appends it, so undo is just removing the last entry. I generate winning lines from the size, so the same code works for N by N. Cells are buttons with labels like 'Row 1, column 2, empty', and the status uses aria-live."`,
      mistakes: [
        'Mutating the board array (`board[i] = "X"`) so React does not re-render, and history entries all point to the same array.',
        'Storing `winner` and `xIsNext` in state and forgetting to update one of them.',
        'Allowing moves after someone has won.',
        'Hard-coding the 8 winning lines, then being stuck when asked for a 4x4 board.',
        'Follow-up trap: "Is index as key OK for the cells?" Yes — the cells are a fixed-size grid that never reorders, so the index is a stable identity here.',
      ],
      takeaway: 'Store only the board history; derive turn, winner and draw, and generate win lines from the board size.',
    },
    {
      id: 'file-upload-progress',
      title: 'File Upload with Progress',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Pick or drop files, validate them, upload each with a real progress bar via XMLHttpRequest, and support cancel and retry.',
      what: `**Problem as the interviewer says it:** "Build a file uploader. The user can pick files or drag and drop them. Only images and PDFs up to 5 MB are allowed. Each file uploads with its own progress bar. The user can cancel an upload or retry a failed one."

Requirements checklist:
- \`<input type="file" multiple>\` + drag-and-drop zone.
- Validate type and size **before** uploading; show the reason if rejected.
- Each file shows name, size, a progress bar, and status: uploading / done / error / cancelled.
- Cancel (abort) and Retry per file.
- Uploads run in parallel; cancel all on unmount.

#### Deeper version
**Why XMLHttpRequest?** The \`fetch\` API does not give **upload** progress events in a simple, widely supported way. \`XMLHttpRequest\` does: \`xhr.upload.onprogress\` gives \`loaded\` and \`total\` bytes. And \`xhr.abort()\` cancels. (Axios uses XHR in the browser, which is why its \`onUploadProgress\` works.)

**State shape:** an array of upload entries \`{ id, file, progress, status, error }\`. The abort functions are not UI data, so they live in a **ref** (\`Map\` of id → abort function). Updates to one entry use a small helper with the functional updater, because progress events arrive many times and from many files at once — reading a stale array would lose updates.

**Production notes:** large files are uploaded in **chunks** (resumable uploads) or directly to cloud storage (S3/GCS) with a **pre-signed URL** from your backend, so files do not pass through your Node server.`,
      why: `The interviewer tests:
- Browser APIs: \`File\`, \`FormData\`, drag-and-drop events, \`XMLHttpRequest\` progress.
- Managing a **list of async jobs**, each with its own status.
- Functional updates under many rapid events.
- **Cancellation** and cleanup on unmount.
- Validation UX and accessibility (keyboard-usable drop zone, progress semantics).
- Real-world knowledge: pre-signed URLs, chunking, server-side validation.`,
      analogy: `It is like sending parcels at a post office with a live tracker for each parcel. The clerk checks each parcel's size and contents first (validation). Each parcel has its own tracking bar. You can call back one parcel (cancel) or resend a lost one (retry). For huge parcels, you send them straight to the warehouse with a pre-paid label (pre-signed URL) instead of through the small local office.`,
      code: [
        {
          title: 'FileUploader.jsx — full working component',
          lang: 'jsx',
          code: `import { useEffect, useRef, useState } from 'react';

const UPLOAD_URL = 'https://httpbin.org/post'; // public echo endpoint; use your own API in real apps
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

// Upload one file with XHR so we get upload progress + abort.
function uploadWithProgress(file, onProgress) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Server error ' + xhr.status));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new DOMException('Cancelled', 'AbortError'));

    const body = new FormData();
    body.append('file', file);
    xhr.open('POST', UPLOAD_URL);
    xhr.send(body);
  });
  return { promise, abort: () => xhr.abort() };
}

function validate(file) {
  if (!ALLOWED.includes(file.type)) return 'Only PNG, JPEG, WEBP or PDF files.';
  if (file.size > MAX_BYTES) return 'File is larger than 5 MB.';
  return null;
}

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? (bytes / 1024).toFixed(0) + ' KB' : (bytes / 1024 / 1024).toFixed(1) + ' MB';

export default function FileUploader() {
  const [uploads, setUploads] = useState([]);
  const [dragging, setDragging] = useState(false);
  const aborters = useRef(new Map()); // id -> abort()
  const inputRef = useRef(null);

  // Update one entry safely, even with many progress events per second.
  const patch = (id, changes) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...changes } : u)));

  async function start(id, file) {
    patch(id, { status: 'uploading', progress: 0, error: null });
    const { promise, abort } = uploadWithProgress(file, (progress) => patch(id, { progress }));
    aborters.current.set(id, abort);
    try {
      await promise;
      patch(id, { status: 'done', progress: 100 });
    } catch (err) {
      patch(id, err.name === 'AbortError' ? { status: 'cancelled' } : { status: 'error', error: err.message });
    } finally {
      aborters.current.delete(id);
    }
  }

  function addFiles(fileList) {
    const entries = [...fileList].map((file) => {
      const error = validate(file);
      return { id: crypto.randomUUID(), file, progress: 0, status: error ? 'rejected' : 'queued', error };
    });
    setUploads((list) => [...list, ...entries]);
    entries.filter((e) => e.status === 'queued').forEach((e) => start(e.id, e.file));
  }

  // Cancel every running upload if the component unmounts.
  useEffect(() => {
    const map = aborters.current;
    return () => map.forEach((abort) => abort());
  }, []);

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }} // needed to allow drop
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        style={{
          border: '2px dashed ' + (dragging ? '#4a90e2' : '#bbb'),
          background: dragging ? '#eef5ff' : '#fafafa',
          padding: 32, textAlign: 'center', borderRadius: 8,
        }}
      >
        <p>Drag files here, or</p>
        <button type="button" onClick={() => inputRef.current.click()}>Choose files</button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED.join(',')}
          hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} // allow re-picking same file
        />
        <p style={{ fontSize: 12, color: '#777' }}>PNG, JPEG, WEBP or PDF, up to 5 MB each</p>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {uploads.map((u) => (
          <li key={u.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{u.file.name} ({formatSize(u.file.size)})</span>
              <span>
                {u.status === 'uploading' && (
                  <button onClick={() => aborters.current.get(u.id)?.()}>Cancel</button>
                )}
                {(u.status === 'error' || u.status === 'cancelled') && (
                  <button onClick={() => start(u.id, u.file)}>Retry</button>
                )}
              </span>
            </div>
            {u.status !== 'rejected' && (
              <progress
                value={u.progress}
                max={100}
                aria-label={'Upload progress for ' + u.file.name}
                style={{ width: '100%' }}
              />
            )}
            <small role={u.error ? 'alert' : undefined} style={{ color: u.error ? 'crimson' : '#555' }}>
              {u.status === 'uploading' && u.progress + '%'}
              {u.status === 'done' && 'Uploaded ✓'}
              {u.status === 'cancelled' && 'Cancelled'}
              {u.error}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
        },
        {
          title: 'Fake upload for offline practice (same shape as uploadWithProgress)',
          lang: 'javascript',
          code: `// Swap this in to test the UI without a network.
function fakeUpload(file, onProgress) {
  let progress = 0;
  let timer;
  let rejectFn;
  const promise = new Promise((resolve, reject) => {
    rejectFn = reject;
    timer = setInterval(() => {
      progress = Math.min(100, progress + 10);
      onProgress(progress);
      if (progress === 100) {
        clearInterval(timer);
        Math.random() < 0.2 ? reject(new Error('Random failure')) : resolve();
      }
    }, 200);
  });
  return {
    promise,
    abort: () => {
      clearInterval(timer);
      rejectFn(new DOMException('Cancelled', 'AbortError'));
    },
  };
}`,
        },
      ],
      output: `**How it works:**
- Files come from the hidden input (via the "Choose files" button, which is keyboard-focusable) or from the drop zone. \`onDragOver\` must call \`preventDefault()\`, otherwise the browser will not allow a drop and will open the file instead.
- \`addFiles\` validates each file. Rejected files are shown with a reason and never uploaded. Valid files start uploading in parallel.
- \`uploadWithProgress\` wraps XHR in a Promise and returns \`{ promise, abort }\`. Progress events call \`patch(id, { progress })\`.
- \`patch\` uses the functional updater so 10 files sending progress events at once never overwrite each other's updates.
- The abort function is kept in a ref Map, not in state. Cancel calls it; XHR fires \`onabort\` → status "cancelled". Retry calls \`start\` again with the same file.
- Unmount cleanup aborts all running uploads.
- \`e.target.value = ''\` resets the input so picking the same file again still fires \`onChange\`.
- \`<progress>\` is a native progress bar that screen readers understand; it gets an \`aria-label\` with the file name.

**How to build it in the interview (60 min):**
1. (5 min) Clarify types, sizes, parallel vs one-by-one, endpoint.
2. (10 min) File input + list of selected files with names and sizes.
3. (10 min) Validation + rejected state.
4. (15 min) XHR upload with progress + status per file.
5. (10 min) Cancel/retry with the aborters ref; unmount cleanup.
6. (10 min) Drag-and-drop zone, styles; mention pre-signed URLs and chunking.`,
      questions: [
        {
          q: 'Why XMLHttpRequest and not fetch?',
          a: 'XHR has `xhr.upload.onprogress` for upload progress, which fetch does not offer in a simple, widely supported way. Fetch is fine for download progress via streams, and for uploads without a progress bar.',
        },
        {
          q: 'How would you limit to 3 uploads at a time?',
          a: 'Keep a queue. Start up to 3; when one finishes (in `finally`), start the next queued file. In the state, `queued` entries wait until a slot is free.',
        },
        {
          q: 'How do you upload very large files (1 GB)?',
          a: 'Split the file with `file.slice(start, end)` into chunks (for example 5-10 MB) and upload each chunk, so a failure only retries one chunk. S3 multipart upload does this. Track progress as chunks done / total.',
        },
        {
          q: 'What is a pre-signed URL and why use it?',
          a: 'The backend creates a short-lived URL that lets the browser upload one file directly to S3/GCS. Big files skip your Node server, which saves bandwidth and memory. The backend still controls the key, type and size.',
        },
        {
          q: 'How would you show an image preview?',
          a: 'Use `URL.createObjectURL(file)` as the `src` of an `<img>`, and call `URL.revokeObjectURL(url)` when the item is removed or the component unmounts, to free memory.',
        },
      ],
      spoken: `"I keep an array of upload entries with id, file, progress and status, and I validate type and size before anything is sent. Each valid file uploads in parallel through a small XHR wrapper, because XHR gives upload progress events and abort. Progress updates go through a patch helper with the functional updater so many events don't overwrite each other. Abort functions live in a ref Map, which powers Cancel, and Retry just restarts the same file. Unmount aborts everything. In production I'd upload directly to S3 with pre-signed URLs and chunk large files."`,
      mistakes: [
        'Using `setUploads(uploads.map(...))` inside progress callbacks: `uploads` is stale, so updates from different files overwrite each other.',
        'Forgetting `preventDefault()` in `onDragOver`, so the drop never fires and the browser opens the file.',
        'Storing XHR objects or abort functions in state; they are not UI data and cause extra renders. Use a ref.',
        'Trusting `accept` and client validation. `accept` is only a hint in the file picker; the server must check type and size again.',
        'Follow-up trap: "Why does selecting the same file twice do nothing?" The input value did not change, so no change event fires. Reset `e.target.value = \'\'` after reading the files.',
      ],
      takeaway: 'Validate first, upload each file via XHR for progress and abort, update entries with the functional updater, and keep abort handles in a ref.',
    },
    {
      id: 'nested-comments',
      title: 'Nested Comments (Recursive Tree)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Render a comment tree with a recursive component, and add/delete replies at any depth with immutable recursive updates.',
      what: `**Problem as the interviewer says it:** "Build a comment section like Reddit. Each comment can have replies, and replies can have replies, to any depth. Users can add a top-level comment, reply to any comment, delete a comment, and collapse a thread."

Requirements checklist:
- Data is a tree: \`{ id, author, text, replies: [...] }\`.
- Indent each level; show a "Reply" box under the comment being replied to.
- Delete removes the comment (and its replies — ask!).
- Collapse / expand a thread, showing the reply count.
- Bonus: max depth, edit, votes, sorting.

#### Deeper version
**Rendering** a tree is easy with a **recursive component**: \`<Comment>\` renders its text and then maps its \`replies\` to more \`<Comment>\`s. Pass \`depth\` down to indent and to limit nesting.

**Updating** a tree is the hard part. You cannot write \`comment.replies.push(...)\` — that mutates state. You need a recursive function that returns a **new tree**: copy each node on the path down to the target and change the target.

For large or real apps, a **normalized** (flat) shape is often better: \`{ byId: { 1: { id, text, parentId, childIds } }, rootIds: [1, 3] }\`. Then adding a reply touches only two records — no recursion — and you can update one comment without copying the tree. Mention this trade-off.`,
      why: `The interviewer tests:
- **Recursion** in both rendering and data updates.
- **Immutable updates** of nested data.
- Where state lives: the tree in the parent; "is replying" and "collapsed" local to each comment.
- Data modelling: nested vs normalized.
- UX details: auto-focus the reply box, empty input guard, accessible collapse button.`,
      analogy: `A comment thread is like a family tree. Every person (comment) can have children (replies), who can have their own children. To draw it, you use the same rule at every level: "draw this person, then draw each child a little to the right." To add a baby to someone deep in the tree, you follow the branches down from the top until you find the parent.`,
      code: [
        {
          title: 'Comments.jsx — full working component',
          lang: 'jsx',
          code: `import { useState } from 'react';

const MAX_DEPTH = 4;

const INITIAL = [
  {
    id: '1', author: 'Asha', text: 'Great article!',
    replies: [{ id: '2', author: 'Ravi', text: 'Agreed, the examples helped.', replies: [] }],
  },
  { id: '3', author: 'Meera', text: 'Can you cover testing next?', replies: [] },
];

// ---------- Pure recursive helpers (never mutate) ----------
function addReply(nodes, parentId, reply) {
  return nodes.map((n) =>
    n.id === parentId
      ? { ...n, replies: [...n.replies, reply] }
      : { ...n, replies: addReply(n.replies, parentId, reply) }
  );
}

function removeComment(nodes, id) {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, replies: removeComment(n.replies, id) }));
}

function countAll(nodes) {
  return nodes.reduce((sum, n) => sum + 1 + countAll(n.replies), 0);
}

// ---------- Small form used for top-level and replies ----------
function CommentForm({ label, submitLabel, onSubmit, onCancel, autoFocus }) {
  const [text, setText] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text.trim());
        setText('');
      }}
      style={{ margin: '8px 0' }}
    >
      <label style={{ display: 'block', fontSize: 12, color: '#666' }}>
        {label}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus={autoFocus}
          rows={2}
          style={{ display: 'block', width: '100%' }}
        />
      </label>
      <button type="submit" disabled={!text.trim()}>{submitLabel}</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}

// ---------- Recursive comment ----------
function Comment({ comment, depth, onReply, onDelete }) {
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const count = comment.replies.length;

  return (
    <li style={{ listStyle: 'none', marginTop: 8, paddingLeft: depth ? 12 : 0, borderLeft: depth ? '2px solid #e3e3e3' : 'none' }}>
      <p style={{ margin: 0 }}>
        <strong>{comment.author}</strong> {comment.text}
      </p>
      <div style={{ display: 'flex', gap: 6, fontSize: 13 }}>
        {depth < MAX_DEPTH && (
          <button onClick={() => setReplying((r) => !r)} aria-expanded={replying}>Reply</button>
        )}
        <button onClick={() => onDelete(comment.id)}>Delete</button>
        {count > 0 && (
          <button onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed}>
            {collapsed ? 'Show' : 'Hide'} {count} {count === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {replying && (
        <CommentForm
          label={'Reply to ' + comment.author}
          submitLabel="Post reply"
          autoFocus
          onSubmit={(text) => { onReply(comment.id, text); setReplying(false); }}
          onCancel={() => setReplying(false)}
        />
      )}

      {count > 0 && !collapsed && (
        <ul style={{ paddingLeft: 12, margin: 0 }}>
          {comment.replies.map((r) => (
            <Comment key={r.id} comment={r} depth={depth + 1} onReply={onReply} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Comments() {
  const [comments, setComments] = useState(INITIAL);

  const newComment = (text) => ({ id: crypto.randomUUID(), author: 'You', text, replies: [] });

  const handleAdd = (text) => setComments((prev) => [...prev, newComment(text)]);
  const handleReply = (parentId, text) => setComments((prev) => addReply(prev, parentId, newComment(text)));
  const handleDelete = (id) => setComments((prev) => removeComment(prev, id));

  return (
    <section style={{ maxWidth: 560, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>{countAll(comments)} comments</h2>
      <CommentForm label="Add a comment" submitLabel="Post" onSubmit={handleAdd} />
      <ul style={{ padding: 0 }}>
        {comments.map((c) => (
          <Comment key={c.id} comment={c} depth={0} onReply={handleReply} onDelete={handleDelete} />
        ))}
      </ul>
    </section>
  );
}`,
        },
        {
          title: 'The normalized alternative (flat map, no recursion to update)',
          lang: 'javascript',
          code: `// Same data, stored flat. Children are referenced by id.
const state = {
  byId: {
    1: { id: '1', author: 'Asha', text: 'Great article!', parentId: null, childIds: ['2'] },
    2: { id: '2', author: 'Ravi', text: 'Agreed.', parentId: '1', childIds: [] },
  },
  rootIds: ['1'],
};

// Adding a reply touches only the new node and its parent.
function addReplyFlat(state, parentId, node) {
  const parent = state.byId[parentId];
  return {
    ...state,
    byId: {
      ...state.byId,
      [node.id]: { ...node, parentId, childIds: [] },
      [parentId]: { ...parent, childIds: [...parent.childIds, node.id] },
    },
  };
}`,
        },
      ],
      output: `**How it works:**
- \`comments\` (the whole tree) lives in the top component. All changes go through pure helpers with the functional updater.
- \`addReply\` walks the tree: if a node is the parent, it returns a copy with the new reply added; otherwise it returns a copy with \`addReply\` applied to its replies. The result is a brand-new tree, so React re-renders.
- \`removeComment\` filters the node out at every level (removing its whole sub-thread).
- \`<Comment>\` renders itself, then \`<Comment>\` for each reply with \`depth + 1\`. Recursion stops naturally at comments with no replies.
- \`replying\` and \`collapsed\` are local state — no other component needs them.
- \`MAX_DEPTH\` hides the Reply button deep in the tree to keep the layout readable.
- The collapse button has \`aria-expanded\`, and every textarea has a label.

**How to build it in the interview (45-60 min):**
1. (5 min) Clarify depth, delete behaviour, sorting, API.
2. (10 min) Render the static tree with a recursive component.
3. (15 min) Add top-level comment and reply with \`addReply\`.
4. (10 min) Delete and collapse.
5. (5-10 min) Max depth, a11y, mention normalized state and lazy-loading replies.`,
      questions: [
        {
          q: 'What happens to replies when a parent comment is deleted?',
          a: 'It is a product decision. Here the whole sub-thread is removed. Reddit-style apps keep the node and replace the text with "[deleted]" so replies still make sense — that is a soft delete with an `isDeleted` flag.',
        },
        {
          q: 'Nested tree vs normalized state — which would you use?',
          a: 'Nested is simplest to render and fine for small threads. Normalized (`byId` + `childIds`) makes updates O(1) without recursion and lets you update one comment without copying the tree. For large, frequently changing threads I would normalize.',
        },
        {
          q: 'How would you load replies lazily from an API?',
          a: 'Each comment stores `replyCount` and a `repliesLoaded` flag. "Show 5 replies" fetches `/comments?parentId=id` and inserts the results under that node. The API returns one level at a time.',
        },
        {
          q: 'How do you avoid re-rendering the whole tree on every change?',
          a: 'Wrap `Comment` in `React.memo` and keep `onReply`/`onDelete` stable with `useCallback`. With the nested helpers, only nodes on the changed path get new objects if you return untouched nodes as-is; the normalized shape makes this even easier.',
        },
      ],
      spoken: `"The tree lives in the top component, and I render it with a recursive Comment component that maps its replies into more Comment components with depth plus one. Updates use pure recursive helpers — addReply copies nodes down to the parent and appends, and removeComment filters at every level — so I never mutate state. Reply-box and collapse state are local to each comment. I limit depth for readability and add aria-expanded on toggles. For big threads I'd switch to normalized state with byId and childIds so updates don't need recursion."`,
      mistakes: [
        'Mutating a nested node (`parent.replies.push(reply)`) — React sees the same root array and may not re-render.',
        'Keeping "replying" state in the root as one boolean, so opening one reply box opens them all.',
        'Using array index as key in replies; deleting one reply shifts focus and draft text to another comment.',
        'Unlimited nesting that squeezes text into a 30px column on mobile.',
        'Follow-up trap: "Can a recursive component crash?" Yes, with circular data or a very deep tree. Validate data from the API and cap depth; React itself has no recursion limit you will hit in normal comment trees.',
      ],
      takeaway: 'Render the tree with a recursive component, update it with pure recursive helpers (or normalize it), and keep per-comment UI state local.',
    },
    {
      id: 'drag-and-drop-list',
      title: 'Drag-and-Drop Sortable List',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Reorder a list with native HTML5 drag events and a keyboard alternative, using one pure moveItem helper and live announcements.',
      what: `**Problem as the interviewer says it:** "Build a list where users can reorder items by dragging them. Show where the item will drop. Don't use a library. Bonus: make it work with the keyboard."

Requirements checklist:
- Each item is draggable; the drop position is highlighted.
- On drop, the order updates.
- Keyboard: pick up an item with Space, move it with arrow keys, drop with Space.
- Announce changes for screen readers ("Moved 'Write tests' to position 2 of 5").
- Bonus: persist the order, drag between two lists (Kanban).

#### Deeper version
The **HTML5 Drag and Drop API** works with events:
- \`draggable\` attribute on the item.
- \`dragstart\` on the dragged item: remember which item (index or id). Firefox needs \`e.dataTransfer.setData(...)\` or the drag does not start.
- \`dragover\` on the target: you **must** call \`e.preventDefault()\` to allow dropping. Fires many times per second.
- \`drop\` on the target: reorder.
- \`dragend\` on the source: always fires (even if dropped outside) — reset state here.

The reorder itself is one pure function: \`moveItem(list, from, to)\` — copy, remove at \`from\`, insert at \`to\`.

Native DnD has limits: it does not work well on most touch screens and has no keyboard support. That is why production apps use libraries like **dnd-kit**, built on pointer events with keyboard sensors. In the interview, building a keyboard alternative shows you care about accessibility.`,
      why: `The interviewer tests:
- Knowledge of browser event APIs beyond clicks.
- Separating the **pure reorder logic** from the event handling.
- Transient UI state (dragging, over index) vs real data (the list).
- Accessibility: a non-mouse way to do the same task, plus \`aria-live\` announcements.
- Awareness of mobile and library trade-offs.`,
      analogy: `It is like rearranging books on a shelf. You pull one book out (dragstart), move your hand along the shelf while a gap opens where it will go (dragover highlight), and push it into the new gap (drop). The keyboard mode is like asking a librarian: "pick up this book, move it one left, one more, put it down."`,
      code: [
        {
          title: 'SortableList.jsx — full working component',
          lang: 'jsx',
          code: `import { useEffect, useRef, useState } from 'react';

// Pure helper: returns a new array with the item moved.
export function moveItem(list, from, to) {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

const INITIAL = [
  { id: 'a', text: 'Design the API' },
  { id: 'b', text: 'Write the code' },
  { id: 'c', text: 'Write tests' },
  { id: 'd', text: 'Code review' },
  { id: 'e', text: 'Deploy' },
];

export default function SortableList() {
  const [items, setItems] = useState(INITIAL);
  const [dragIndex, setDragIndex] = useState(null); // mouse drag source
  const [overIndex, setOverIndex] = useState(null); // mouse drop target
  const [grabbed, setGrabbed] = useState(null);     // keyboard: picked item index
  const [message, setMessage] = useState('');       // screen reader announcement
  const handleRefs = useRef([]);

  // Keep focus on the grabbed item as it moves.
  useEffect(() => {
    if (grabbed !== null) handleRefs.current[grabbed]?.focus();
  }, [grabbed, items]);

  // ----- Mouse (HTML5 drag and drop) -----
  function onDragStart(e, index) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index)); // required by Firefox
  }
  function onDragOver(e, index) {
    e.preventDefault(); // allow drop
    if (overIndex !== index) setOverIndex(index);
  }
  function onDrop(e, index) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      setItems((list) => moveItem(list, dragIndex, index));
      setMessage('Moved "' + items[dragIndex].text + '" to position ' + (index + 1) + ' of ' + items.length);
    }
  }
  function onDragEnd() {
    setDragIndex(null); // always runs, even if dropped outside the list
    setOverIndex(null);
  }

  // ----- Keyboard alternative -----
  function onHandleKeyDown(e, index) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (grabbed === null) {
        setGrabbed(index);
        setMessage('Picked up "' + items[index].text + '". Use arrow keys to move, Space to drop.');
      } else {
        setMessage('Dropped "' + items[grabbed].text + '" at position ' + (grabbed + 1) + '.');
        setGrabbed(null);
      }
    } else if (grabbed !== null && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const to = e.key === 'ArrowUp' ? grabbed - 1 : grabbed + 1;
      if (to < 0 || to >= items.length) return;
      setItems((list) => moveItem(list, grabbed, to));
      setGrabbed(to);
      setMessage('Moved to position ' + (to + 1) + ' of ' + items.length);
    } else if (e.key === 'Escape' && grabbed !== null) {
      setGrabbed(null);
      setMessage('Stopped moving.');
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <p id="dnd-help" style={{ fontSize: 13, color: '#666' }}>
        Drag items to reorder, or focus a handle and press Space, then the arrow keys.
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, index) => {
          const isOver = overIndex === index && dragIndex !== index;
          return (
            <li
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={(e) => onDrop(e, index)}
              onDragEnd={onDragEnd}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 10, marginBottom: 6,
                background: grabbed === index ? '#fff7d6' : '#fff',
                border: '1px solid #ddd',
                borderTop: isOver ? '3px solid #4a90e2' : '1px solid #ddd',
                opacity: dragIndex === index ? 0.4 : 1,
                cursor: 'grab',
              }}
            >
              <button
                ref={(el) => (handleRefs.current[index] = el)}
                type="button"
                aria-label={'Reorder "' + item.text + '", position ' + (index + 1) + ' of ' + items.length}
                aria-describedby="dnd-help"
                aria-pressed={grabbed === index}
                onKeyDown={(e) => onHandleKeyDown(e, index)}
                style={{ cursor: 'grab', border: 'none', background: 'none', fontSize: 18 }}
              >
                ⠿
              </button>
              {item.text}
            </li>
          );
        })}
      </ul>
      <p aria-live="assertive" style={{ position: 'absolute', left: -9999 }}>{message}</p>
    </div>
  );
}`,
        },
      ],
      output: `**How it works:**
- \`items\` is the real data. \`dragIndex\`, \`overIndex\` and \`grabbed\` are temporary UI state.
- **Mouse:** \`dragstart\` saves the source index and calls \`setData\` (Firefox needs it). \`dragover\` calls \`preventDefault()\` so dropping is allowed, and stores the hovered index to draw a blue line on top of it. \`drop\` calls \`moveItem\`. \`dragend\` always clears the drag state, even if the user drops outside.
- **Keyboard:** each row has a handle button. Space/Enter picks it up (\`aria-pressed=true\`, yellow background). Arrow keys call \`moveItem\` and update \`grabbed\` to the new index. An effect moves focus to the handle at the new position, because the DOM node under focus changes after reordering. Space drops, Escape stops.
- **Announcements:** \`message\` is rendered in a visually hidden \`aria-live\` region, so screen reader users hear "Moved to position 2 of 5".
- Keys are item ids, not indexes, so React moves the right DOM nodes when the order changes.
- \`moveItem([a,b,c,d,e], 0, 2)\` returns \`[b,c,a,d,e]\`.

**How to build it in the interview (45-60 min):**
1. (5 min) Clarify: one list or many, mobile needed, library allowed?
2. (5 min) Write and test \`moveItem\` out loud.
3. (15 min) Drag events + drop indicator.
4. (15 min) Keyboard mode + focus effect + live region.
5. (5-10 min) Styling; mention dnd-kit, touch support and persisting order.`,
      questions: [
        {
          q: 'Why must `dragover` call `preventDefault()`?',
          a: 'By default, most elements are not drop targets. Cancelling `dragover` tells the browser "this element accepts a drop". Without it, the `drop` event never fires.',
        },
        {
          q: 'Why does native drag and drop fail on phones?',
          a: 'Most mobile browsers do not fire HTML5 drag events for touch. You need pointer/touch events (track `pointerdown`, `pointermove`, `pointerup` and compute the target from coordinates) or a library like dnd-kit that does this.',
        },
        {
          q: 'How would you persist the order?',
          a: 'Store a numeric `position` per item on the server and send the new order after a drop (debounced). Using fractional positions (insert between 1 and 2 as 1.5) means only the moved item needs updating.',
        },
        {
          q: 'How would you support dragging between two lists (Kanban)?',
          a: 'Keep `{ todo: [...], doing: [...] }`. On dragstart save `{ listId, index }`. On drop, remove from the source list and insert into the target list at the drop index, in one state update.',
        },
        {
          q: 'How do you make the drag smoother for long lists?',
          a: 'Avoid re-rendering every row on every `dragover` (only set state when the index changes, as here), memoize rows, and for very long lists use virtualization plus a library with auto-scroll.',
        },
      ],
      spoken: `"I separate the logic from the events: a pure moveItem function copies the array, removes the item at the old index and inserts it at the new one. For the mouse I use native drag events: dragstart saves the source index and sets data for Firefox, dragover prevents default to allow a drop and tracks the hover index for an indicator, drop calls moveItem, and dragend always resets. Because native DnD has no keyboard or touch support, I add a handle button: Space picks up, arrows move, Space drops, with focus following the item and an aria-live region announcing each move."`,
      mistakes: [
        'Forgetting `e.preventDefault()` in `onDragOver`, so `onDrop` never fires.',
        'Using the index as key — after reordering, React reuses the wrong DOM nodes and focus or input state jumps.',
        'Mutating the array with `splice` directly on state instead of on a copy.',
        'Resetting drag state only in `onDrop`, so dropping outside the list leaves an item stuck half-transparent. Use `onDragEnd`.',
        'Follow-up trap: "Is mouse drag-and-drop accessible if items have tabIndex?" No — focusable is not operable. Keyboard users need a real way to move items (buttons or arrow-key mode) and screen readers need announcements.',
      ],
      takeaway: 'One pure moveItem helper, native drag events with preventDefault on dragover and reset on dragend, plus a keyboard mode with live announcements.',
    },
  ],
  rapidFire: [
    { q: 'First thing to do in a machine coding round?', a: 'Clarify requirements and write a short checklist before coding.' },
    { q: 'What order should you build features in?', a: 'Core flow first, then edge cases and accessibility, then styling.' },
    { q: 'What is "minimal state"?', a: 'Store only what you cannot calculate; derive everything else during render.' },
    { q: 'Should filtered lists live in state?', a: 'No. Compute them from the source list and the filter on each render.' },
    { q: 'How do you update one item in an array in state?', a: '`setList(prev => prev.map(x => x.id === id ? { ...x, ...changes } : x))`.' },
    { q: 'Why use the functional updater `setX(prev => ...)`?', a: 'It always gets the latest state, so rapid or async updates are not lost.' },
    { q: 'When is index as key acceptable?', a: 'Only for static lists that never reorder, insert or delete (like OTP boxes or a game grid).' },
    { q: 'How do you avoid a race condition in a fetch effect?', a: 'Abort the old request with AbortController (or set an ignore flag) in the effect cleanup.' },
    { q: 'Does debouncing fix race conditions?', a: 'No. It reduces requests, but an older response can still arrive last.' },
    { q: 'Debounce vs throttle in one line?', a: 'Debounce runs after calls stop; throttle runs at most once per interval while calls continue.' },
    { q: 'Why does a debounced function created in the component body not work?', a: 'A new debounced function (with a new timer) is created on every render; keep it in `useRef`/`useMemo` or debounce the value instead.' },
    { q: 'Which error should you ignore after `controller.abort()`?', a: 'The `AbortError` — it is expected, not a real failure.' },
    { q: 'Why do effects run twice in development?', a: 'React StrictMode mounts, unmounts and re-mounts to reveal missing cleanup. Fix the cleanup, not StrictMode.' },
    { q: 'Where do you keep an interval id, cache or abort handle?', a: 'In `useRef` — it survives re-renders without causing them.' },
    { q: 'Why does `setInterval(() => setCount(count + 1))` get stuck?', a: 'The callback closes over the first `count` (stale closure). Use `setCount(c => c + 1)`.' },
    { q: 'How do you keep a timer accurate?', a: 'Derive elapsed time from timestamps (`Date.now()`/`performance.now()`), not from counting ticks.' },
    { q: 'Best way to detect "near the bottom" for infinite scroll?', a: 'An IntersectionObserver on a sentinel element with a `rootMargin`.' },
    { q: 'How do you stop double loads in infinite scroll?', a: 'Only observe while not loading and `hasMore` is true, and guard the fetch with an ignore flag.' },
    { q: 'Why render a modal in a portal?', a: 'So parent `overflow`, `transform` or `z-index` cannot clip or hide it.' },
    { q: 'Three focus rules for a modal?', a: 'Move focus in on open, trap Tab inside, and restore focus to the opener on close.' },
    { q: 'How do you close a modal only on backdrop click?', a: 'Check `e.target === e.currentTarget` in the backdrop handler.' },
    { q: 'Which ARIA attribute links a header button to its panel?', a: '`aria-controls` (plus `aria-expanded` for open state).' },
    { q: 'What is a roving tabindex?', a: 'Only the active item has `tabIndex=0`, others `-1`; arrow keys move focus within the group.' },
    { q: 'In an autocomplete, where does focus stay?', a: 'In the input; `aria-activedescendant` points to the highlighted option.' },
    { q: 'Why does clicking an autocomplete option sometimes fail?', a: 'Input blur closes the list before the click; `preventDefault` on the list\'s `mousedown` fixes it.' },
    { q: 'Should form errors be stored in state?', a: 'Usually no — derive them from a pure `validate(values)` function.' },
    { q: 'When should a field show its error?', a: 'After it is touched (blurred) or after a submit attempt, not on the first keystroke.' },
    { q: 'How do you link an input to its error message?', a: '`aria-invalid="true"` and `aria-describedby` pointing at the error element id.' },
    { q: 'Why can\'t you rely on client-side validation?', a: 'Anyone can bypass it; the server must validate again.' },
    { q: 'How do you get upload progress in the browser?', a: 'Use `XMLHttpRequest` and `xhr.upload.onprogress` (Axios uses XHR for this).' },
    { q: 'Why reset `input.value = ""` after reading files?', a: 'So choosing the same file again still fires a change event.' },
    { q: 'What must `onDragOver` do to allow a drop?', a: 'Call `e.preventDefault()`.' },
    { q: 'How do you update a nested comment tree immutably?', a: 'A recursive helper that copies nodes on the path and returns a new tree — or normalize to `byId` + `childIds`.' },
    { q: 'How do you get unique ids for ARIA links in reusable components?', a: '`useId()` — unique per component instance and safe with server rendering.' },
    { q: 'What do you do with a list of 10,000 rows?', a: 'Virtualize it (render only visible rows) with react-window or TanStack Virtual.' },
    { q: 'How do you cache API results per query?', a: 'A `Map` in a `useRef` keyed by query (or TanStack Query in production).' },
    { q: 'How do you model async UI status cleanly?', a: 'One `status` value: idle | loading | success | error, instead of several booleans.' },
    { q: 'How do you announce dynamic changes to screen readers?', a: 'Render the message inside an `aria-live` region (polite for status, assertive for urgent).' },
  ],
};
