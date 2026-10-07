// Interview problems for the Machine Coding (React UI builds) stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'machine-coding',
  problems: [
    {
      id: 'traffic-light',
      title: 'Traffic light with configurable timings',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'stopwatch-countdown',
      question: `Build a \`TrafficLight\` component.

**Requirements:**

- Three lamps stacked vertically: red, yellow, green. Only the active one is lit.
- It cycles **red (4s) → green (3s) → yellow (1s) → red …** forever.
- Durations and order must come from a **config object**, so changing timings needs no code change.
- A **Pause / Resume** button.
- Screen readers should hear the current color as text.
- No timers may keep running after the component unmounts.`,
      hints: [
        `Build order: (1) a config object \`{ red: { duration, next } ... }\`, (2) static UI for the three lamps from \`active\` state, (3) one \`useEffect\` that schedules the next color.`,
        `Use \`setTimeout\`, not \`setInterval\`: each color has a different duration. Put \`active\` in the effect dependencies, so a new timer starts every time the color changes.`,
        `Return \`clearTimeout\` from the effect. For pause, add \`paused\` to the deps and simply do not start a timer while paused.`,
      ],
      solution: `**Idea:** the light is a tiny **state machine**: the current state (\`active\`) plus a table saying how long each state lasts and which state comes next. One effect moves to the next state after the right delay.

\`\`\`jsx
import { useEffect, useState } from 'react';

// Config drives everything: change durations or order without touching the logic.
const LIGHTS = {
  red: { duration: 4000, next: 'green' },
  green: { duration: 3000, next: 'yellow' },
  yellow: { duration: 1000, next: 'red' },
};
const DISPLAY_ORDER = ['red', 'yellow', 'green']; // top to bottom, like a real light

export default function TrafficLight() {
  const [active, setActive] = useState('red');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return; // no timer while paused
    const { duration, next } = LIGHTS[active];
    const id = setTimeout(() => setActive(next), duration);
    return () => clearTimeout(id); // runs when active/paused changes or on unmount
  }, [active, paused]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={styles.housing}>
        {DISPLAY_ORDER.map((color) => (
          <div
            key={color}
            style={{
              ...styles.lamp,
              background: color === active ? color : '#3a3a3a',
              boxShadow: color === active ? \`0 0 20px \${color}\` : 'none',
            }}
          />
        ))}
      </div>

      {/* Screen readers cannot see colors, so announce the state as text */}
      <p aria-live="polite" style={{ margin: 0 }}>
        Light is <strong>{active}</strong>
        {paused ? ' (paused)' : ''}
      </p>

      <button type="button" onClick={() => setPaused((p) => !p)}>
        {paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}

const styles = {
  housing: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 12,
    background: '#111',
    borderRadius: 16,
  },
  lamp: { width: 60, height: 60, borderRadius: '50%', transition: 'background 0.2s' },
};
\`\`\`

**How it works:**

- \`LIGHTS[active]\` gives the duration and the next color. Changing timings or adding a "red+amber" phase only changes the config.
- Every time \`active\` changes, React runs the cleanup (clears the old timer) and the effect again (starts a new one). On unmount, the cleanup also runs, so nothing leaks.
- When \`paused\` is true the effect returns early, so no timer exists. On resume, the current color gets its full duration again.
- The \`aria-live="polite"\` text tells screen-reader users the color, because color alone is not accessible.

**Common mistakes:** using \`setInterval\` with a single delay; forgetting the cleanup (two timers after a re-render); storing the next color in a separate state that can get out of sync.`,
      followUps: [
        {
          q: `How would you resume with the remaining time instead of the full duration?`,
          a: `Store when the current phase started (\`useRef(Date.now())\`). On pause, save \`remaining = duration - (Date.now() - startedAt)\`. On resume, start the timer with \`remaining\` instead of \`duration\`, then reset to full durations for later phases.`,
        },
        {
          q: `How would you show a countdown on the active lamp?`,
          a: `Keep a \`secondsLeft\` state, updated by a 1-second interval inside the same effect (cleared in cleanup). Or store the phase end time and compute \`Math.ceil((endsAt - now) / 1000)\` on each tick.`,
        },
        {
          q: `How would you sync two lights at a crossing?`,
          a: `Lift the state up: one parent owns the phase, and each light derives its color from it (for example, when road A is green, road B is red). One source of truth avoids drift between two timers.`,
        },
      ],
    },
    {
      id: 'chips-tag-input',
      title: 'Chips / tag input',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'todo-list',
      question: `Build a \`TagInput\` (like the "skills" field on job sites).

**Requirements:**

- Typing text and pressing **Enter** or typing a **comma** adds a chip. Pasting \`"a, b, c"\` adds three chips.
- Trim spaces; ignore empty input; no duplicates (case-insensitive); show a message for a duplicate.
- Each chip has an **×** button to remove it. **Backspace** in an empty input removes the last chip.
- Maximum \`max\` tags (default 8); disable the input when the limit is reached.
- Clicking anywhere in the box focuses the input. Labels and buttons must be accessible.`,
      hints: [
        `Build order: (1) state \`tags\` + \`text\`, (2) render chips and a controlled input, (3) \`addTags(raw)\` that splits on commas, trims and dedupes, (4) keyboard handling, (5) error message and limit.`,
        `Handle commas in \`onChange\` (this also covers paste): everything before the last comma becomes tags, the rest stays in the input. Handle Enter and Backspace in \`onKeyDown\`.`,
        `Give each remove button \`aria-label={'Remove ' + tag}\`. Use \`e.stopPropagation()\` on it so the box's click handler does not run too.`,
      ],
      solution: `**Idea:** keep the chips as an array of strings and the input as a separate controlled string. One function \`addTags\` handles Enter, comma and paste the same way.

\`\`\`jsx
import { useId, useRef, useState } from 'react';

export default function TagInput({ initialTags = ['react', 'node'], max = 8 }) {
  const [tags, setTags] = useState(initialTags);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const inputId = useId();

  // Adds one or many comma-separated tags. Returns nothing; updates state.
  function addTags(raw) {
    const parts = raw.split(',').map((t) => t.trim()).filter(Boolean);
    const next = [...tags];
    let message = '';

    for (const part of parts) {
      if (next.length >= max) {
        message = \`You can add at most \${max} tags.\`;
        break;
      }
      const isDuplicate = next.some((t) => t.toLowerCase() === part.toLowerCase());
      if (isDuplicate) message = \`"\${part}" is already added.\`;
      else next.push(part);
    }

    setTags(next);
    setError(message);
  }

  function removeTag(index) {
    setTags((prev) => prev.filter((_, i) => i !== index));
    setError('');
    inputRef.current?.focus(); // keep keyboard users in the input
  }

  function handleChange(e) {
    const value = e.target.value;
    // Typing or pasting a comma turns the text before it into tags
    if (value.includes(',')) {
      const lastComma = value.lastIndexOf(',');
      addTags(value.slice(0, lastComma));
      setText(value.slice(lastComma + 1)); // keep what comes after the last comma
    } else {
      setText(value);
    }
  }

  function handleKeyDown(e) {
    if (e.nativeEvent.isComposing) return; // ignore Enter while typing with an IME (e.g. Japanese)
    if (e.key === 'Enter') {
      e.preventDefault(); // do not submit a surrounding form
      if (text.trim()) {
        addTags(text);
        setText('');
      }
    } else if (e.key === 'Backspace' && text === '' && tags.length > 0) {
      removeTag(tags.length - 1); // Backspace on empty input removes the last chip
    }
  }

  return (
    <div style={{ maxWidth: 420, fontFamily: 'sans-serif' }}>
      <label htmlFor={inputId} style={{ display: 'block', marginBottom: 4 }}>
        Skills ({tags.length}/{max})
      </label>

      {/* Clicking anywhere in the box focuses the input */}
      <div style={styles.box} onClick={() => inputRef.current?.focus()}>
        <ul style={styles.list}>
          {tags.map((tag, i) => (
            <li key={tag} style={styles.chip}>
              {tag}
              <button
                type="button"
                aria-label={\`Remove \${tag}\`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(i);
                }}
                style={styles.remove}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <input
          id={inputId}
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= max ? 'Limit reached' : 'Type and press Enter'}
          disabled={tags.length >= max}
          aria-describedby={error ? \`\${inputId}-error\` : undefined}
          style={styles.input}
        />
      </div>

      {error && (
        <p id={\`\${inputId}-error\`} role="alert" style={{ color: '#b00020', margin: '4px 0 0' }}>
          {error}
        </p>
      )}
    </div>
  );
}

const styles = {
  box: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    border: '1px solid #999',
    borderRadius: 6,
    cursor: 'text',
  },
  list: { display: 'flex', flexWrap: 'wrap', gap: 6, margin: 0, padding: 0, listStyle: 'none' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    background: '#e3ecff',
    borderRadius: 12,
  },
  remove: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, lineHeight: 1 },
  input: { flex: 1, minWidth: 120, border: 'none', outline: 'none', padding: 4 },
};
\`\`\`

**How it works:**

- \`addTags\` builds the next array from the current \`tags\`, checking the limit and duplicates (lowercase compare), then sets tags and the error message once.
- \`onChange\` with a comma: the part before the last comma becomes tags, the part after stays in the input. Pasting a list works for free.
- \`isComposing\` stops Enter from adding a half-typed word for users typing with an IME (Chinese, Japanese, Korean keyboards).
- Chips can use the tag text as \`key\` because duplicates are not allowed.
- \`role="alert"\` reads the error out loud; \`aria-describedby\` links it to the input.`,
      followUps: [
        {
          q: `How would you add suggestions (autocomplete) to this input?`,
          a: `Filter a suggestion list by \`text\`, show it in a \`role="listbox"\` under the input, track the highlighted index with Arrow keys, and on Enter add the highlighted suggestion instead of the raw text.`,
        },
        {
          q: `How would you use it inside a form library like React Hook Form?`,
          a: `Make it controlled from outside: accept \`value\` (array) and \`onChange(nextTags)\` props instead of owning \`tags\`, then wrap it with \`Controller\` so the form stores the array and validates it.`,
        },
        {
          q: `Why not use the index as the key for chips?`,
          a: `When a chip in the middle is removed, every later index shifts, so React may reuse the wrong DOM nodes (wrong focus, wrong animation). A stable unique value (here the tag text) is safer.`,
        },
      ],
    },
    {
      id: 'poll-widget',
      title: 'Poll widget with live results',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'progress-bar',
      question: `Build a \`Poll\` component.

**Requirements:**

- Show a question and option buttons.
- After the user votes: hide the buttons and show **results**: for each option, the percentage, the vote count and a bar. Highlight the user's choice.
- One vote per user; a **"Change my vote"** link removes the vote and shows the buttons again.
- Show the total number of votes. Percentages must not crash when the total is 0.`,
      hints: [
        `Build order: (1) options in state as \`{ id, label, votes }\`, (2) a \`myVote\` state (\`null\` = not voted), (3) voting view, (4) results view, (5) undo.`,
        `Do not store percentages or the total in state. Calculate them during render from the vote counts (derived data).`,
        `Update immutably: \`setItems(prev => prev.map(o => o.id === id ? { ...o, votes: o.votes + 1 } : o))\`.`,
      ],
      solution: `**Idea:** the only real state is the vote counts and which option I chose. Total and percentages are derived on every render, so they can never be wrong.

\`\`\`jsx
import { useState } from 'react';

const INITIAL_OPTIONS = [
  { id: 'react', label: 'React', votes: 12 },
  { id: 'vue', label: 'Vue', votes: 5 },
  { id: 'angular', label: 'Angular', votes: 3 },
  { id: 'svelte', label: 'Svelte', votes: 4 },
];

export default function Poll({ question = 'Which frontend library do you use most?', options = INITIAL_OPTIONS }) {
  const [items, setItems] = useState(options);
  const [myVote, setMyVote] = useState(null); // id of the option I voted for

  const total = items.reduce((sum, o) => sum + o.votes, 0);
  const hasVoted = myVote !== null;

  function vote(id) {
    if (hasVoted) return; // one vote per user
    setItems((prev) => prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o)));
    setMyVote(id);
  }

  function undoVote() {
    setItems((prev) => prev.map((o) => (o.id === myVote ? { ...o, votes: o.votes - 1 } : o)));
    setMyVote(null);
  }

  return (
    <section style={styles.card} aria-labelledby="poll-question">
      <h3 id="poll-question" style={{ marginTop: 0 }}>
        {question}
      </h3>

      {!hasVoted ? (
        // Before voting: one button per option
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((o) => (
            <button key={o.id} type="button" onClick={() => vote(o.id)} style={styles.option}>
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        // After voting: results with bars
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {items.map((o) => {
            const percent = total === 0 ? 0 : Math.round((o.votes / total) * 100);
            const mine = o.id === myVote;
            return (
              <li key={o.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: mine ? 700 : 400 }}>
                  <span>
                    {o.label} {mine && '(your vote)'}
                  </span>
                  <span>
                    {percent}% · {o.votes} {o.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
                {/* The bar is decoration: the text above already says the number */}
                <div style={styles.track} aria-hidden="true">
                  <div style={{ ...styles.fill, width: \`\${percent}%\`, background: mine ? '#2563eb' : '#93c5fd' }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ marginBottom: 0, color: '#555' }} aria-live="polite">
        {total} total votes
        {hasVoted && (
          <>
            {' · '}
            <button type="button" onClick={undoVote} style={styles.link}>
              Change my vote
            </button>
          </>
        )}
      </p>
    </section>
  );
}

const styles = {
  card: { maxWidth: 420, padding: 16, border: '1px solid #ddd', borderRadius: 8, fontFamily: 'sans-serif' },
  option: { padding: '8px 12px', textAlign: 'left', border: '1px solid #bbb', borderRadius: 6, background: '#fff', cursor: 'pointer' },
  track: { height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', transition: 'width 0.4s ease' },
  link: { border: 'none', background: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', padding: 0 },
};
\`\`\`

**How it works:**

- \`hasVoted\` switches between the voting buttons and the results list.
- \`total === 0 ? 0 : Math.round(...)\` avoids \`NaN%\` when nobody has voted.
- The bar is \`aria-hidden\` because the text next to it already gives the number; the width uses a CSS transition for a smooth animation.
- Undo subtracts the vote from the option I chose and resets \`myVote\`.

**Note on rounding:** rounded percentages can add up to 99% or 101%. That is normal; mention it if the interviewer asks.`,
      followUps: [
        {
          q: `How would you make this real with a backend (MERN)?`,
          a: `\`POST /api/polls/:id/vote\` with \`{ optionId }\`. In MongoDB use an atomic update: \`updateOne({ _id, 'options._id': optionId }, { $inc: { 'options.$.votes': 1 } })\`. Store votes per user (a \`votes\` collection with a unique index on \`{ pollId, userId }\`) to stop double voting. On the client, update optimistically and roll back on error.`,
        },
        {
          q: `How would you show live results from other users?`,
          a: `Poll the results endpoint every few seconds, or push updates with WebSockets / Server-Sent Events and merge them into state.`,
        },
      ],
    },
    {
      id: 'image-carousel',
      title: 'Image carousel with autoplay, hover pause and keyboard',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'tabs',
      question: `Build an image \`Carousel\` component.

**Requirements:**

- Shows one slide at a time with a sliding animation. Prev / Next buttons that **wrap around** (last → first).
- Dots to jump to any slide; the current dot is highlighted.
- **Autoplay** every 3 seconds. It **pauses** while the mouse is over the carousel or focus is inside it, and there is a Pause / Play button.
- After a manual change, the next auto-advance waits a full interval.
- **Keyboard:** Left / Right arrows when the carousel is focused.
- Accessible: alt text, labeled buttons, slide "x of n" labels.`,
      hints: [
        `Build order: (1) \`index\` state and a track of slides moved with \`transform: translateX(-index * 100%)\`, (2) prev/next with modulo wrap-around, (3) dots, (4) autoplay effect, (5) pause states, (6) keyboard and ARIA.`,
        `Wrap-around formula that also works for -1: \`((i % count) + count) % count\`.`,
        `For autoplay use \`setTimeout\` inside a \`useEffect\` with \`index\` in the dependencies: every slide change restarts the timer. \`paused = hovered || focused || stoppedByUser\`.`,
      ],
      solution: `**Idea:** the slides sit in one long flex row; showing slide \`i\` is just moving the row left by \`i * 100%\`. A timer effect moves \`index\` forward unless something pauses it.

\`\`\`jsx
import { useEffect, useState } from 'react';

const SLIDES = [
  { id: 1, src: 'https://picsum.photos/id/1015/800/400', alt: 'River between mountains' },
  { id: 2, src: 'https://picsum.photos/id/1016/800/400', alt: 'Canyon at sunset' },
  { id: 3, src: 'https://picsum.photos/id/1018/800/400', alt: 'Green hills and mountains' },
  { id: 4, src: 'https://picsum.photos/id/1019/800/400', alt: 'Beach with blue water' },
];

export default function Carousel({ slides = SLIDES, interval = 3000 }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false); // user pressed the pause button
  const count = slides.length;
  const paused = hovered || focused || stopped;

  const goTo = (i) => setIndex(((i % count) + count) % count); // wraps -1 -> last, count -> 0
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Autoplay. Depending on \`index\` restarts the timer after every change,
  // so a manual click always gets a full \`interval\` before the next auto move.
  useEffect(() => {
    if (paused || count < 2) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearTimeout(id);
  }, [index, paused, count, interval]);

  function handleKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  }

  if (count === 0) return <p>No slides</p>;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Photo gallery"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        // only "unfocus" when focus leaves the whole carousel, not when it moves between its buttons
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      style={styles.root}
    >
      <div style={styles.viewport}>
        {/* aria-live: announce slide changes only when the user is in control (not during autoplay) */}
        <div
          aria-live={paused ? 'polite' : 'off'}
          style={{ ...styles.track, transform: \`translateX(-\${index * 100}%)\` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={\`\${i + 1} of \${count}\`}
              aria-hidden={i !== index}
              style={styles.slide}
            >
              <img src={slide.src} alt={slide.alt} style={styles.img} draggable="false" />
            </div>
          ))}
        </div>

        <button type="button" onClick={prev} aria-label="Previous slide" style={{ ...styles.arrow, left: 8 }}>
          ‹
        </button>
        <button type="button" onClick={next} aria-label="Next slide" style={{ ...styles.arrow, right: 8 }}>
          ›
        </button>
      </div>

      <div style={styles.controls}>
        <button type="button" onClick={() => setStopped((s) => !s)}>
          {stopped ? 'Play' : 'Pause'}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={\`Go to slide \${i + 1}\`}
              aria-current={i === index ? 'true' : undefined}
              style={{ ...styles.dot, background: i === index ? '#333' : '#bbb' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  root: { maxWidth: 800, fontFamily: 'sans-serif', outlineOffset: 4 },
  viewport: { position: 'relative', overflow: 'hidden', borderRadius: 8 },
  track: { display: 'flex', transition: 'transform 0.5s ease' },
  slide: { flex: '0 0 100%' },
  img: { display: 'block', width: '100%', height: 'auto', aspectRatio: '2 / 1', objectFit: 'cover' },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 24,
    cursor: 'pointer',
  },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  dot: { width: 12, height: 12, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer' },
};
\`\`\`

**How it works:**

- **Sliding:** each slide is \`flex: 0 0 100%\`; the track gets \`translateX(-index * 100%)\` with a CSS transition.
- **Autoplay:** because \`index\` is a dependency, every change (auto or manual) clears the old timer and starts a new one, so a manual click always gets a full interval. The functional update \`setIndex(i => ...)\` avoids stale values.
- **Pause:** three separate reasons (hover, focus, user button) are combined. \`onBlur\` checks \`relatedTarget\` so moving focus between buttons inside the carousel does not count as leaving.
- **Accessibility:** \`aria-roledescription="carousel"\` and \`"slide"\`, \`aria-label="2 of 4"\`, hidden slides get \`aria-hidden\`, and the live region is turned off during autoplay so screen readers are not spammed.`,
      followUps: [
        {
          q: `How would you add swipe support on mobile?`,
          a: `Record \`touchstart\` X, compare with \`touchend\` X; if the difference is more than about 50px, call \`next()\` or \`prev()\`. Pointer events (\`onPointerDown/Up\`) work for mouse and touch together.`,
        },
        {
          q: `How would you make it loop infinitely without the visual jump back from last to first?`,
          a: `Clone the first slide at the end (and the last at the start). Slide to the clone with animation, then on \`transitionend\` jump without animation to the real slide.`,
        },
        {
          q: `How would you lazy-load images?`,
          a: `Add \`loading="lazy"\` to images, or only render \`src\` for the current slide and its neighbours. Keep the size with \`aspect-ratio\` so the layout does not jump.`,
        },
      ],
    },
    {
      id: 'toast-notification-system',
      title: 'Toast notification system (context + auto-dismiss)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'modal',
      question: `Build a toast system that any component can use:

\`\`\`jsx
const { show } = useToast();
show('Profile saved', { type: 'success' });
show('Server error', { type: 'error', duration: 5000 });
\`\`\`

**Requirements:**

- \`ToastProvider\` wraps the app; \`useToast()\` returns \`show(message, options)\` and \`dismiss(id)\`.
- Toasts stack in the bottom-right corner, newest at the bottom, at most 3 visible.
- Each toast auto-dismisses after \`duration\` ms (default 3000); \`duration: Infinity\` means it stays. Each has a close button.
- Types \`success | error | info\` with different colors.
- Screen readers announce toasts. No timers may leak.
- Calling \`show\` must not re-render every component that uses \`useToast\`.`,
      hints: [
        `Build order: (1) context + provider with a \`toasts\` array in state, (2) \`show\` and \`dismiss\` with \`useCallback\`, (3) render the stack, (4) a \`Toast\` component that owns its own timer, (5) \`useToast\` hook with an error if used outside the provider.`,
        `Give each toast an id from a \`useRef\` counter. Put the auto-dismiss \`setTimeout\` in the **Toast's** \`useEffect\`, so closing early or unmounting clears it automatically.`,
        `Wrap the context value in \`useMemo\` so its reference only changes when \`show\`/\`dismiss\` change (never, here).`,
      ],
      solution: `**Idea:** the provider owns a list of toasts and exposes stable \`show\` / \`dismiss\` functions through context. Each toast component manages its own timer, which keeps the timer logic local and leak-free.

\`\`\`jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// ---------- 1. Context + provider ----------
const ToastContext = createContext(null);

export function ToastProvider({ children, max = 3 }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { type = 'info', duration = 3000 } = {}) => {
      const id = nextId.current++;
      // newest at the end; keep only the last \`max\` toasts
      setToasts((prev) => [...prev, { id, message, type, duration }].slice(-max));
      return id; // caller can dismiss it early
    },
    [max]
  );

  // useMemo: the value object stays the same between renders,
  // so components that only call show() do not re-render when toasts change
  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* The live region exists from the start, so screen readers announce new toasts */}
      <div role="region" aria-label="Notifications" aria-live="polite" style={styles.stack}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ---------- 2. One toast: owns its own timer ----------
function Toast({ toast, onDismiss }) {
  const { id, message, type, duration } = toast;

  useEffect(() => {
    if (duration === Infinity) return; // sticky toast
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer); // closed early or unmounted -> no stray timer
  }, [id, duration, onDismiss]);

  return (
    // errors interrupt right away (role="alert"); others use the polite region above
    <div role={type === 'error' ? 'alert' : undefined} style={{ ...styles.toast, borderLeftColor: COLORS[type] }}>
      <span>{message}</span>
      <button type="button" aria-label="Close notification" onClick={() => onDismiss(id)} style={styles.close}>
        ×
      </button>
    </div>
  );
}

// ---------- 3. Demo ----------
function Demo() {
  const { show } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8, fontFamily: 'sans-serif' }}>
      <button type="button" onClick={() => show('Profile saved', { type: 'success' })}>
        Success
      </button>
      <button type="button" onClick={() => show('Could not reach the server', { type: 'error', duration: 5000 })}>
        Error
      </button>
      <button type="button" onClick={() => show('You have 3 new messages')}>
        Info
      </button>
      <button type="button" onClick={() => show('This one stays until closed', { duration: Infinity })}>
        Sticky
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}

const COLORS = { success: '#16a34a', error: '#dc2626', info: '#2563eb' };

const styles = {
  stack: {
    position: 'fixed',
    right: 16,
    bottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 1000,
    fontFamily: 'sans-serif',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minWidth: 260,
    padding: '10px 12px',
    background: '#fff',
    borderLeft: '4px solid',
    borderRadius: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  close: { border: 'none', background: 'none', fontSize: 18, cursor: 'pointer' },
};
\`\`\`

**How it works:**

- \`show\` adds \`{ id, message, type, duration }\` and \`.slice(-max)\` keeps only the newest three.
- Each \`Toast\` starts a timer on mount and clears it on unmount. If the user closes it early, the component unmounts and the cleanup cancels the timer.
- \`dismiss\` and \`show\` are wrapped in \`useCallback\` and the value in \`useMemo\`, so consumers like \`Demo\` do **not** re-render when the toast list changes (only the provider does).
- The live region (\`aria-live="polite"\`) exists before any toast appears, which screen readers need to announce new content. Errors use \`role="alert"\` to be announced immediately.
- \`useToast\` throws a clear error if someone forgets the provider.`,
      followUps: [
        {
          q: `How would you pause the timer while the user hovers a toast?`,
          a: `Track \`remaining\` time in a ref. On mouse enter: clear the timer and subtract the elapsed time. On mouse leave: start a new timer with \`remaining\`.`,
        },
        {
          q: `Why might you render the toasts with createPortal?`,
          a: `A portal renders the stack into \`document.body\`, so parent styles like \`overflow: hidden\`, \`transform\` or \`z-index\` stacking contexts cannot clip or hide the toasts.`,
        },
        {
          q: `How do you call show() from outside React (e.g. an axios interceptor)?`,
          a: `Keep a module-level reference: in the provider, \`useEffect(() => { toastRef.current = show; }, [show])\`, and export a function that calls \`toastRef.current?.(...)\`. Libraries like react-hot-toast use a small external store for this.`,
        },
      ],
    },
    {
      id: 'transfer-list',
      title: 'Transfer list (move items between two lists)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'todo-list',
      question: `Build a **transfer list**: two boxes ("Available" and "Selected") with checkboxes, and buttons between them.

**Requirements:**

- Each item has a checkbox. Buttons: **move selected right**, **move selected left**, **move all right**, **move all left**.
- A button is disabled when it has nothing to move.
- Each box has a **"select all"** checkbox that shows the **indeterminate** (dash) state when only some items are ticked, and a counter like \`2/5 selected\`.
- Moved items arrive unticked and keep their labels.`,
      hints: [
        `Build order: (1) \`left\` and \`right\` arrays of \`{ id, label }\`, (2) one \`checked\` Set of ids, (3) a reusable \`ListBox\` component, (4) one generic \`move(items, setFrom, setTo)\`, (5) select-all and indeterminate.`,
        `Derive \`leftChecked = left.filter(i => checked.has(i.id))\` during render; do not store it.`,
        `\`indeterminate\` is not an HTML attribute; set it on the DOM element with a ref: \`ref={el => { if (el) el.indeterminate = some; }}\`.`,
      ],
      solution: `**Idea:** two arrays hold the items; one Set remembers which ids are ticked. Every button is the same \`move\` function with different arguments.

\`\`\`jsx
import { useState } from 'react';

const ITEMS = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Docker'].map(
  (label, i) => ({ id: i + 1, label })
);

export default function TransferList() {
  const [left, setLeft] = useState(ITEMS.slice(0, 5));
  const [right, setRight] = useState(ITEMS.slice(5));
  const [checked, setChecked] = useState(() => new Set()); // ids of ticked items (both sides)

  const leftChecked = left.filter((item) => checked.has(item.id));
  const rightChecked = right.filter((item) => checked.has(item.id));

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev); // never mutate state: copy first
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(items) {
    const allTicked = items.length > 0 && items.every((i) => checked.has(i.id));
    setChecked((prev) => {
      const next = new Set(prev);
      items.forEach((i) => (allTicked ? next.delete(i.id) : next.add(i.id)));
      return next;
    });
  }

  function uncheck(items) {
    setChecked((prev) => {
      const next = new Set(prev);
      items.forEach((i) => next.delete(i.id));
      return next;
    });
  }

  // Moves \`items\` from one side to the other
  function move(items, setFrom, setTo) {
    const ids = new Set(items.map((i) => i.id));
    setFrom((prev) => prev.filter((i) => !ids.has(i.id)));
    setTo((prev) => [...prev, ...items]);
    uncheck(items); // moved items arrive unticked
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontFamily: 'sans-serif' }}>
      <ListBox title="Available" items={left} checked={checked} onToggle={toggle} onToggleAll={toggleAll} />

      <div style={{ display: 'grid', gap: 8 }}>
        <button type="button" aria-label="Move all right" onClick={() => move(left, setLeft, setRight)} disabled={left.length === 0}>
          ≫
        </button>
        <button type="button" aria-label="Move selected right" onClick={() => move(leftChecked, setLeft, setRight)} disabled={leftChecked.length === 0}>
          &gt;
        </button>
        <button type="button" aria-label="Move selected left" onClick={() => move(rightChecked, setRight, setLeft)} disabled={rightChecked.length === 0}>
          &lt;
        </button>
        <button type="button" aria-label="Move all left" onClick={() => move(right, setRight, setLeft)} disabled={right.length === 0}>
          ≪
        </button>
      </div>

      <ListBox title="Selected" items={right} checked={checked} onToggle={toggle} onToggleAll={toggleAll} />
    </div>
  );
}

function ListBox({ title, items, checked, onToggle, onToggleAll }) {
  const tickedCount = items.filter((i) => checked.has(i.id)).length;
  const all = items.length > 0 && tickedCount === items.length;
  const some = tickedCount > 0 && !all;

  return (
    <fieldset style={styles.box}>
      <legend>{title}</legend>
      <label style={styles.header}>
        <input
          type="checkbox"
          checked={all}
          // "indeterminate" (the dash) only exists as a DOM property, so set it through a ref
          ref={(el) => {
            if (el) el.indeterminate = some;
          }}
          onChange={() => onToggleAll(items)}
          disabled={items.length === 0}
        />
        {tickedCount}/{items.length} selected
      </label>

      <ul style={styles.list}>
        {items.length === 0 && <li style={{ color: '#888' }}>Empty</li>}
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={checked.has(item.id)} onChange={() => onToggle(item.id)} /> {item.label}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

const styles = {
  box: { width: 180, minHeight: 240, border: '1px solid #ccc', borderRadius: 6 },
  header: { display: 'block', paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid #eee' },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 },
};
\`\`\`

**How it works:**

- \`checked\` is a Set of ids for both sides, so a tick survives re-renders and is easy to look up (O(1)).
- \`move\` removes the items from one side, appends them to the other, and unticks them. All four buttons reuse it.
- Sets are copied before changing (\`new Set(prev)\`), because React only re-renders when the state **reference** changes.
- \`ListBox\` derives \`all\` / \`some\` from the props, so the header checkbox is always correct. The callback ref sets the DOM-only \`indeterminate\` property.
- \`fieldset\` + \`legend\` give each box an accessible name; button \`aria-label\`s explain the arrow symbols.`,
      followUps: [
        {
          q: `How would you keep the original order when items move back?`,
          a: `Store an \`order\` number (or the original index) on each item and sort each list by it after a move, instead of appending to the end.`,
        },
        {
          q: `How would you add a search box to each list?`,
          a: `Keep a \`filter\` string per box and render \`items.filter(matches)\`. Decide (and say) whether "move all" moves only the filtered items — usually yes.`,
        },
      ],
    },
    {
      id: 'memory-matching-game',
      title: 'Memory card matching game',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'tic-tac-toe',
      question: `Build a **memory game** with 16 cards (8 pairs) in a 4×4 grid.

**Requirements:**

- Cards start face-down in a random order. Click to flip.
- When two cards are face-up: if they match, they stay open; if not, they flip back after 0.8 seconds.
- While a wrong pair is showing, other clicks are ignored. Clicking the same card twice does nothing.
- Count **moves** (one move = two cards flipped). Show a win message.
- A **Restart** button reshuffles and resets everything. No timer may fire after restart or unmount.`,
      hints: [
        `Build order: (1) \`createDeck()\` that doubles the symbols and shuffles them, (2) state: \`cards\`, \`flipped\` (indexes, max 2), \`matched\` (Set of symbols), \`moves\`, (3) render the grid, (4) click logic, (5) flip-back timer, (6) restart.`,
        `Use the Fisher–Yates shuffle. \`array.sort(() => Math.random() - 0.5)\` is not fair.`,
        `Decide match/no-match in the click handler. Only the "flip back after 800 ms" needs a timer: put it in a \`useEffect\` that watches \`flipped\` and clears it in cleanup.`,
      ],
      solution: `**Idea:** a card is face-up if it is in \`flipped\` (this turn) or its symbol is in \`matched\`. The click handler checks the second card; an effect turns a wrong pair back after a short delay.

\`\`\`jsx
import { useEffect, useState } from 'react';

const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍑', '🍍'];

// Fisher–Yates shuffle: fair, O(n). (sort(() => Math.random() - 0.5) is biased.)
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck() {
  return shuffle([...SYMBOLS, ...SYMBOLS]).map((value, i) => ({ id: i, value }));
}

export default function MemoryGame() {
  const [cards, setCards] = useState(createDeck); // lazy init: shuffle only once
  const [flipped, setFlipped] = useState([]); // indexes of face-up, unmatched cards (max 2)
  const [matched, setMatched] = useState(() => new Set()); // matched symbols
  const [moves, setMoves] = useState(0);

  const won = matched.size === SYMBOLS.length;
  const locked = flipped.length === 2; // wait while a wrong pair is shown

  // A wrong pair stays visible for a moment, then turns back
  useEffect(() => {
    if (flipped.length !== 2) return;
    const timer = setTimeout(() => setFlipped([]), 800);
    return () => clearTimeout(timer); // cleanup on restart/unmount
  }, [flipped]);

  function handleClick(index) {
    const card = cards[index];
    if (locked || flipped.includes(index) || matched.has(card.value)) return;

    if (flipped.length === 0) {
      setFlipped([index]);
      return;
    }

    // second card of a turn
    setMoves((m) => m + 1);
    const first = cards[flipped[0]];
    if (first.value === card.value) {
      setMatched((prev) => new Set(prev).add(card.value));
      setFlipped([]); // matched cards stay visible because of \`matched\`
    } else {
      setFlipped([flipped[0], index]); // the effect turns them back
    }
  }

  function restart() {
    setCards(createDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', width: 'fit-content' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>Moves: {moves}</span>
        <button type="button" onClick={restart}>
          Restart
        </button>
      </div>

      <div style={styles.grid}>
        {cards.map((card, i) => {
          const faceUp = flipped.includes(i) || matched.has(card.value);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleClick(i)}
              aria-label={faceUp ? \`Card \${i + 1}: \${card.value}\` : \`Card \${i + 1}: hidden\`}
              disabled={matched.has(card.value)}
              style={{ ...styles.card, background: faceUp ? '#fff' : '#4f46e5' }}
            >
              {faceUp ? card.value : ''}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" style={{ minHeight: 24 }}>
        {won ? \`You won in \${moves} moves!\` : ''}
      </p>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 64px)', gap: 8 },
  card: {
    width: 64,
    height: 64,
    fontSize: 28,
    border: '2px solid #4f46e5',
    borderRadius: 8,
    cursor: 'pointer',
  },
};
\`\`\`

**How it works:**

- \`useState(createDeck)\` passes the function itself (lazy init), so the deck is shuffled once, not on every render.
- \`locked\` (two cards showing) blocks clicks during the 0.8 s delay. Matched cards are disabled.
- A match goes straight into \`matched\`; a miss is stored in \`flipped\` and the effect flips it back. Because the timer lives in an effect with cleanup, restarting or unmounting cancels it.
- Win = \`matched.size === SYMBOLS.length\` (derived, not stored).
- Each card's \`aria-label\` tells screen-reader users whether it is hidden or what it shows.`,
      followUps: [
        {
          q: `How would you add a timer and a best score?`,
          a: `Start a 1-second interval on the first click, stop it when \`won\` becomes true. Save the best moves/time to \`localStorage\` and read it with a lazy \`useState\` initializer.`,
        },
        {
          q: `How would you add a flip animation?`,
          a: `Use two faces in a card with \`transform-style: preserve-3d\`, \`backface-visibility: hidden\`, and rotate the card \`rotateY(180deg)\` when face-up, with a CSS transition.`,
        },
      ],
    },
    {
      id: 'multi-step-form-wizard',
      title: 'Multi-step form wizard with per-step validation',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'form-validation',
      question: `Build a 3-step **signup wizard**: **Account** (email, password) → **Profile** (name, optional age) → **Review** (show the data, submit).

**Requirements:**

- **Next** validates only the current step and shows errors under the fields. You cannot go forward with errors.
- **Back** keeps everything the user typed.
- A step indicator shows where the user is.
- Pressing **Enter** works like Next / Submit.
- Submit shows a loading state, then a success message. Disable buttons while submitting.
- Errors are accessible (linked to inputs), and focus moves to the first invalid field.`,
      hints: [
        `Build order: (1) a \`STEPS\` config with each step's fields and a \`validate(values)\` function, (2) one \`values\` object for all steps, (3) render the current step's fields from config, (4) Next/Back, (5) review + submit.`,
        `Keep **all** values in one state object at the top. Steps only decide which fields to show, so going Back never loses data.`,
        `Use one \`<form onSubmit>\`: on the last step it submits, otherwise it validates and goes to the next step. That makes Enter work automatically.`,
      ],
      solution: `**Idea:** the wizard is one form with a \`step\` number. A config array describes each step, so adding a step means adding config, not new logic.

\`\`\`jsx
import { useState } from 'react';

// Each step lists its fields and a validate function that returns { field: message }
const STEPS = [
  {
    title: 'Account',
    fields: ['email', 'password'],
    validate: (v) => {
      const e = {};
      if (!/^\\S+@\\S+\\.\\S+$/.test(v.email)) e.email = 'Enter a valid email.';
      if (v.password.length < 8) e.password = 'Password must be at least 8 characters.';
      return e;
    },
  },
  {
    title: 'Profile',
    fields: ['name', 'age'],
    validate: (v) => {
      const e = {};
      if (!v.name.trim()) e.name = 'Name is required.';
      if (v.age !== '' && (!Number.isInteger(Number(v.age)) || Number(v.age) < 18))
        e.age = 'Age must be a whole number, 18 or more.';
      return e;
    },
  },
  { title: 'Review', fields: [], validate: () => ({}) },
];

const LABELS = { email: 'Email', password: 'Password', name: 'Full name', age: 'Age (optional)' };
const TYPES = { email: 'email', password: 'password', name: 'text', age: 'number' };

const fakeSubmit = (data) => new Promise((resolve) => setTimeout(() => resolve({ ok: true, data }), 800));

export default function SignupWizard() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ email: '', password: '', name: '', age: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | done

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // clear that field's error as soon as the user edits it
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // pressing Enter also lands here
    const stepErrors = current.validate(values);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      // move focus to the first invalid field so keyboard users see it
      document.getElementById(\`field-\${Object.keys(stepErrors)[0]}\`)?.focus();
      return;
    }
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setStatus('submitting');
    await fakeSubmit(values);
    setStatus('done');
  }

  if (status === 'done') return <p role="status">Account created for {values.email}!</p>;

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 360, fontFamily: 'sans-serif' }}>
      {/* Step indicator */}
      <ol style={styles.steps}>
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === step ? 'step' : undefined}
            style={{ fontWeight: i === step ? 700 : 400, color: i <= step ? '#111' : '#999' }}
          >
            {i + 1}. {s.title}
          </li>
        ))}
      </ol>

      <h3>{current.title}</h3>

      {current.fields.map((field) => (
        <div key={field} style={{ marginBottom: 12 }}>
          <label htmlFor={\`field-\${field}\`} style={{ display: 'block' }}>
            {LABELS[field]}
          </label>
          <input
            id={\`field-\${field}\`}
            name={field}
            type={TYPES[field]}
            value={values[field]}
            onChange={handleChange}
            aria-invalid={Boolean(errors[field])}
            aria-describedby={errors[field] ? \`error-\${field}\` : undefined}
            style={{ width: '100%', padding: 6, borderColor: errors[field] ? '#b00020' : undefined }}
          />
          {errors[field] && (
            <small id={\`error-\${field}\`} style={{ color: '#b00020' }}>
              {errors[field]}
            </small>
          )}
        </div>
      ))}

      {isLast && (
        <dl>
          <dt>Email</dt>
          <dd>{values.email}</dd>
          <dt>Name</dt>
          <dd>{values.name}</dd>
          <dt>Age</dt>
          <dd>{values.age || 'Not given'}</dd>
        </dl>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || status === 'submitting'}>
          Back
        </button>
        <button type="submit" disabled={status === 'submitting'}>
          {isLast ? (status === 'submitting' ? 'Creating…' : 'Create account') : 'Next'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  steps: { display: 'flex', gap: 16, listStyle: 'none', padding: 0 },
};
\`\`\`

**How it works:**

- \`STEPS[step].validate(values)\` returns an object of error messages; an empty object means valid.
- \`noValidate\` turns off the browser's own popups so our messages are shown consistently.
- Editing a field removes only that field's error, so the user sees progress immediately.
- \`aria-invalid\` and \`aria-describedby\` connect each error to its input; focusing the first invalid field helps keyboard and screen-reader users.
- The Back button is \`type="button"\` so it does not submit the form.
- The review step reads from the same \`values\`, so it is always up to date.`,
      followUps: [
        {
          q: `How would you keep progress if the user refreshes the page?`,
          a: `Save \`values\` and \`step\` to \`sessionStorage\` in an effect, and read them in a lazy \`useState\` initializer. Never store the password there — skip sensitive fields.`,
        },
        {
          q: `How would you validate the email is not already taken?`,
          a: `On Next for the Account step, call an async check (\`GET /api/users/exists?email=\`), show a loading state, and add an error if taken. The server must still check again on final submit, since client checks can be skipped.`,
        },
        {
          q: `How would you do this with React Hook Form and Zod?`,
          a: `One schema per step; \`useForm\` with \`zodResolver(stepSchema)\`; call \`trigger(stepFields)\` on Next; keep \`shouldUnregister: false\` so values from earlier steps stay.`,
        },
      ],
    },
    {
      id: 'nested-checkboxes-tree',
      title: 'Nested checkboxes with indeterminate parents',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'nested-comments',
      question: `Render a tree of checkboxes (any depth) from data like this:

\`\`\`javascript
const TREE = [
  { id: 'frontend', label: 'Frontend', children: [
    { id: 'react', label: 'React' },
    { id: 'styling', label: 'Styling', children: [{ id: 'css', label: 'CSS' }] },
  ] },
];
\`\`\`

**Requirements:**

- Checking a parent checks **all** its descendants; unchecking it unchecks them all.
- A parent is **checked** when all its leaves are checked, **indeterminate** (dash) when only some are, and unchecked when none are.
- Works for any depth. Show the list of selected leaves.`,
      hints: [
        `Build order: (1) a recursive \`CheckboxTree\` that renders a \`ul\` and calls itself for \`children\`, (2) a \`getLeafIds(node)\` helper, (3) state, (4) toggle logic, (5) indeterminate.`,
        `Store only the **leaf** ids that are checked. Parent states can be **calculated** from their leaves, so they never get out of sync.`,
        `Toggle a node: get its leaves; if all are checked, remove them all, otherwise add them all.`,
      ],
      solution: `**Idea:** keep one Set of checked leaf ids as the single source of truth. Every parent's checked / indeterminate state is derived from its leaves during render.

\`\`\`jsx
import { useState } from 'react';

const TREE = [
  {
    id: 'frontend',
    label: 'Frontend',
    children: [
      { id: 'react', label: 'React' },
      { id: 'next', label: 'Next.js' },
      {
        id: 'styling',
        label: 'Styling',
        children: [
          { id: 'css', label: 'CSS' },
          { id: 'tailwind', label: 'Tailwind' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    children: [
      { id: 'node', label: 'Node.js' },
      { id: 'mongo', label: 'MongoDB' },
    ],
  },
];

// All leaf ids under a node (a leaf returns itself)
function getLeafIds(node) {
  if (!node.children || node.children.length === 0) return [node.id];
  return node.children.flatMap(getLeafIds);
}

export default function NestedCheckboxes() {
  // Only LEAVES are stored. Parent state is always calculated, so it can never get out of sync.
  const [checked, setChecked] = useState(() => new Set(['react']));

  function toggleNode(node) {
    const leaves = getLeafIds(node);
    const allChecked = leaves.every((id) => checked.has(id));
    setChecked((prev) => {
      const next = new Set(prev);
      // fully checked -> uncheck everything below; otherwise check everything below
      leaves.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <CheckboxTree nodes={TREE} checked={checked} onToggle={toggleNode} />
      <p>Selected: {[...checked].join(', ') || 'nothing'}</p>
    </div>
  );
}

// Recursive component: renders a list, and calls itself for children
function CheckboxTree({ nodes, checked, onToggle }) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: 20, margin: 0 }}>
      {nodes.map((node) => {
        const leaves = getLeafIds(node);
        const count = leaves.filter((id) => checked.has(id)).length;
        const all = count === leaves.length;
        const some = count > 0 && !all;

        return (
          <li key={node.id}>
            <label>
              <input
                type="checkbox"
                checked={all}
                ref={(el) => {
                  if (el) el.indeterminate = some; // the "dash" state is DOM-only
                }}
                onChange={() => onToggle(node)}
              />{' '}
              {node.label}
            </label>
            {node.children && <CheckboxTree nodes={node.children} checked={checked} onToggle={onToggle} />}
          </li>
        );
      })}
    </ul>
  );
}
\`\`\`

**How it works:**

- \`getLeafIds\` walks down recursively with \`flatMap\`. A node with no children is a leaf.
- Toggling any node (leaf or parent) uses the same code: all leaves on → turn them off; otherwise turn them on.
- Each row computes \`count\` of checked leaves: all → checked, some → indeterminate (set through a ref because it is a DOM-only property, and browsers expose it to screen readers as "mixed").
- Because parents are never stored, there is no "sync children to parent" effect and no chance of bugs between them.

**Complexity:** each render calls \`getLeafIds\` per node, which is O(n × depth). For very big trees, precompute a \`leavesById\` map once with \`useMemo\`.`,
      followUps: [
        {
          q: `Why is storing parent checked state a bad idea?`,
          a: `Then you must update parents whenever a child changes and children whenever a parent changes — two sources of truth that can disagree. Derived state removes that whole class of bugs.`,
        },
        {
          q: `How would you add expand / collapse?`,
          a: `Keep a separate Set of expanded node ids. Render children only when expanded, with a button that has \`aria-expanded\`. Checking still works on hidden children because the logic uses data, not the DOM.`,
        },
      ],
    },
    {
      id: 'data-table-sort-filter-paginate',
      title: 'Data table with sorting, search and pagination',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'pagination',
      question: `Build a \`DataTable\` for a list of users (\`id, name, role, city, experience\`).

**Requirements:**

- A **search box** filters rows by any column (case-insensitive).
- Clicking a column header **sorts**: ascending → descending → no sort. Numbers sort as numbers, text alphabetically. Show an arrow.
- **Pagination**: Prev / Next, "Page x of y", and a page-size select (5 / 10 / 20).
- Changing the search or page size goes back to page 1. The page must never be past the last page.
- Show "No results" when nothing matches. The original data must not be mutated.
- Accessible: sortable headers are buttons, with \`aria-sort\`.`,
      hints: [
        `Build order: (1) columns config + static table, (2) search, (3) sort, (4) pagination, (5) edge cases (empty, page reset, clamp), (6) \`useMemo\` and ARIA.`,
        `Think of a pipeline: \`rows → filter → sort → slice\`. Only \`query\`, \`sort\`, \`page\` and \`pageSize\` are state; everything else is derived.`,
        `\`Array.prototype.sort\` mutates. Copy first: \`[...filtered].sort(...)\`. Reset the page inside the change handlers, not in a \`useEffect\`.`,
      ],
      solution: `**Idea:** keep the minimum state (query, sort, page, page size) and compute the visible rows with a filter → sort → paginate pipeline, memoized so typing in the box does not re-sort unnecessarily.

\`\`\`jsx
import { useMemo, useState } from 'react';

// --- sample data (42 rows) ---
const NAMES = ['Asha', 'Ravi', 'Meera', 'John', 'Li', 'Sara', 'Omar'];
const ROLES = ['Frontend', 'Backend', 'Fullstack', 'DevOps'];
const CITIES = ['Pune', 'Delhi', 'Berlin', 'Austin', 'Tokyo', 'Dubai'];
const USERS = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: \`\${NAMES[i % NAMES.length]} \${String.fromCharCode(65 + (i % 26))}.\`,
  role: ROLES[i % ROLES.length],
  city: CITIES[(i * 5) % CITIES.length],
  experience: (i * 7) % 12,
}));

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'role', label: 'Role', type: 'string' },
  { key: 'city', label: 'City', type: 'string' },
  { key: 'experience', label: 'Years', type: 'number' },
];

const NEXT_DIRECTION = { none: 'asc', asc: 'desc', desc: 'none' }; // click cycles through these

export default function DataTable({ rows = USERS, columns = COLUMNS }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, direction: 'none' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. filter -> 2. sort -> 3. paginate. Each step is derived data, not state.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => columns.some((col) => String(row[col.key]).toLowerCase().includes(q)));
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    if (!sort.key || sort.direction === 'none') return filtered;
    const col = columns.find((c) => c.key === sort.key);
    const factor = sort.direction === 'asc' ? 1 : -1;
    // copy first: sort() mutates, and \`filtered\` may be the original rows prop
    return [...filtered].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      const result = col.type === 'number' ? x - y : String(x).localeCompare(String(y));
      return result * factor;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount); // never show an empty page past the end
  const start = (currentPage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  function handleSort(key) {
    setSort((prev) => {
      const direction = prev.key === key ? NEXT_DIRECTION[prev.direction] : 'asc';
      return { key: direction === 'none' ? null : key, direction };
    });
  }

  function handleSearch(e) {
    setQuery(e.target.value);
    setPage(1); // reset in the event handler, not in an effect
  }

  function handlePageSize(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  const arrow = (key) => (sort.key !== key ? '↕' : sort.direction === 'asc' ? '↑' : '↓');
  const ariaSort = (key) =>
    sort.key !== key ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending';

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <input
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Search all columns…"
          aria-label="Search table"
          style={{ flex: 1, padding: 6 }}
        />
        <label>
          Rows{' '}
          <select value={pageSize} onChange={handlePageSize}>
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} aria-sort={ariaSort(col.key)} style={styles.th}>
                {/* a button makes the header keyboard-accessible */}
                <button type="button" onClick={() => handleSort(col.key)} style={styles.sortButton}>
                  {col.label} <span aria-hidden="true">{arrow(col.key)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ ...styles.td, textAlign: 'center' }}>
                No results for “{query}”
              </td>
            </tr>
          ) : (
            visible.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key} style={styles.td}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <nav aria-label="Pagination" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>
        <span>
          Page {currentPage} of {pageCount} ({sorted.length} rows)
        </span>
        <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>
          Next
        </button>
      </nav>
    </div>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { borderBottom: '2px solid #333', textAlign: 'left', padding: 0 },
  sortButton: {
    width: '100%',
    padding: 8,
    border: 'none',
    background: 'none',
    font: 'inherit',
    fontWeight: 700,
    textAlign: 'left',
    cursor: 'pointer',
  },
  td: { borderBottom: '1px solid #ddd', padding: 8 },
};
\`\`\`

**How it works:**

- **Filter:** checks every column's value as text. \`useMemo\` re-runs only when rows, columns or query change.
- **Sort:** a \`{ key, direction }\` object. \`NEXT_DIRECTION\` cycles asc → desc → none. Numbers use \`x - y\`; strings use \`localeCompare\` (correct for accents and case). We sort a **copy**.
- **Pagination:** \`currentPage = Math.min(page, pageCount)\` clamps the page if the data shrinks; \`slice\` takes one page.
- **Resetting the page** in \`handleSearch\` / \`handlePageSize\` avoids an extra render that a \`useEffect\` would cause.
- **Accessibility:** buttons inside \`th\` make sorting keyboard-friendly; \`aria-sort\` tells screen readers the direction; the pagination is a labeled \`nav\`.

**Complexity:** filter O(n·c), sort O(n log n), slice O(page size).`,
      followUps: [
        {
          q: `How would you do this with server-side data (10 million rows in MongoDB)?`,
          a: `Send \`?q=&sort=name&order=asc&page=2&limit=10\` to the API. In MongoDB use a text or regex search on indexed fields, \`.sort()\`, and \`.skip().limit()\` (or range/cursor pagination for deep pages). Return \`{ rows, total }\`. Debounce the search box and cancel stale requests.`,
        },
        {
          q: `How would you keep the table state in the URL?`,
          a: `Read and write \`query\`, \`sort\` and \`page\` with \`useSearchParams\` (React Router / Next.js). Then refresh, back button and sharing a link all keep the same view.`,
        },
        {
          q: `How would you add multi-column sort?`,
          a: `Store an array of \`{ key, direction }\`. In the comparator, loop over the array and return the first non-zero comparison. Shift+click on a header adds a column instead of replacing.`,
        },
      ],
    },
    {
      id: 'kanban-board-buttons',
      title: 'Kanban board — move cards between columns (no drag-and-drop library)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'drag-and-drop-list',
      question: `Build a Kanban board with three columns: **To do**, **In progress**, **Done**.

**Requirements:**

- An input + Add button creates a card in **To do**.
- Each card has buttons: **← / →** to move it to the previous / next column, **↑ / ↓** to reorder it inside its column, and **✕** to delete. Buttons are disabled when the move is impossible.
- Show the card count per column and an empty message.
- The board survives a page refresh (\`localStorage\`).
- Use \`useReducer\` for the board logic, and make every button accessible (screen readers must know which card a button affects).`,
      hints: [
        `Build order: (1) data model, (2) reducer with \`add\`, \`delete\`, \`moveColumn\`, \`reorder\`, (3) render columns by filtering cards, (4) buttons and disabled rules, (5) persistence.`,
        `A simple model: **one array** of cards \`{ id, title, status }\`. The column is \`status\`; the order inside a column is the position in the array.`,
        `For ↑/↓, find the nearest card **with the same status** above or below in the array and swap them. Load from \`localStorage\` with the lazy third argument of \`useReducer\`.`,
      ],
      solution: `**Idea:** one flat array of cards is the whole board. Moving between columns changes \`status\`; reordering swaps two cards of the same column. A reducer keeps every state change in one pure function that is easy to test.

\`\`\`jsx
import { useEffect, useReducer, useState } from 'react';

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

const STORAGE_KEY = 'kanban-cards';

const DEFAULT_CARDS = [
  { id: 1, title: 'Design login page', status: 'todo' },
  { id: 2, title: 'Build /api/auth route', status: 'todo' },
  { id: 3, title: 'Set up MongoDB indexes', status: 'doing' },
  { id: 4, title: 'Write README', status: 'done' },
];

// Cards live in ONE array. A card's column = its status; its order = its position in the array.
function reducer(cards, action) {
  switch (action.type) {
    case 'add': {
      // reducers must be pure: no Date.now()/Math.random() here, so derive the next id from the data
      const nextId = cards.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      return [...cards, { id: nextId, title: action.title, status: 'todo' }];
    }

    case 'delete':
      return cards.filter((c) => c.id !== action.id);

    case 'moveColumn': {
      // dir: -1 = left, +1 = right. The card goes to the END of the new column.
      const card = cards.find((c) => c.id === action.id);
      const col = COLUMNS.findIndex((c) => c.id === card.status);
      const target = COLUMNS[col + action.dir];
      if (!target) return cards; // already in the first/last column
      return [...cards.filter((c) => c.id !== action.id), { ...card, status: target.id }];
    }

    case 'reorder': {
      // dir: -1 = up, +1 = down. Swap with the nearest card in the SAME column.
      const i = cards.findIndex((c) => c.id === action.id);
      let j = i + action.dir;
      while (j >= 0 && j < cards.length && cards[j].status !== cards[i].status) j += action.dir;
      if (j < 0 || j >= cards.length) return cards; // already first/last in its column
      const next = [...cards];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    }

    default:
      throw new Error('Unknown action: ' + action.type);
  }
}

function loadCards() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CARDS;
  } catch {
    return DEFAULT_CARDS; // no localStorage (SSR, private mode) or bad JSON
  }
}

export default function KanbanBoard() {
  const [cards, dispatch] = useReducer(reducer, undefined, loadCards); // lazy init
  const [title, setTitle] = useState('');

  // Save after every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      // storage full or blocked: the board still works in memory
    }
  }, [cards]);

  function handleAdd(e) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    dispatch({ type: 'add', title: clean });
    setTitle('');
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task"
          aria-label="New task title"
          style={{ padding: 6, flex: 1, maxWidth: 300 }}
        />
        <button type="submit">Add</button>
      </form>

      <div style={styles.board}>
        {COLUMNS.map((column, colIndex) => {
          const columnCards = cards.filter((c) => c.status === column.id);
          return (
            <section key={column.id} aria-labelledby={\`col-\${column.id}\`} style={styles.column}>
              <h3 id={\`col-\${column.id}\`} style={{ marginTop: 0 }}>
                {column.title} ({columnCards.length})
              </h3>
              <ul style={styles.list}>
                {columnCards.map((card, i) => (
                  <li key={card.id} style={styles.card}>
                    <span>{card.title}</span>
                    <div style={styles.actions}>
                      <button
                        type="button"
                        aria-label={\`Move "\${card.title}" left\`}
                        disabled={colIndex === 0}
                        onClick={() => dispatch({ type: 'moveColumn', id: card.id, dir: -1 })}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        aria-label={\`Move "\${card.title}" up\`}
                        disabled={i === 0}
                        onClick={() => dispatch({ type: 'reorder', id: card.id, dir: -1 })}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={\`Move "\${card.title}" down\`}
                        disabled={i === columnCards.length - 1}
                        onClick={() => dispatch({ type: 'reorder', id: card.id, dir: 1 })}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        aria-label={\`Move "\${card.title}" right\`}
                        disabled={colIndex === COLUMNS.length - 1}
                        onClick={() => dispatch({ type: 'moveColumn', id: card.id, dir: 1 })}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        aria-label={\`Delete "\${card.title}"\`}
                        onClick={() => dispatch({ type: 'delete', id: card.id })}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
                {columnCards.length === 0 && <li style={{ color: '#888' }}>No cards</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  board: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))', gap: 12 },
  column: { background: '#f3f4f6', borderRadius: 8, padding: 12 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 },
  card: { background: '#fff', borderRadius: 6, padding: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' },
  actions: { display: 'flex', gap: 4, marginTop: 6 },
};
\`\`\`

**How it works:**

- **moveColumn:** finds the next/previous column by index and moves the card to the **end** of the array with the new status, so it appears at the bottom of the new column.
- **reorder:** walks from the card in the given direction, skipping cards of other columns, and swaps with the first match.
- **Pure reducer:** no \`Date.now()\` or \`Math.random()\` inside (React may call reducers twice in Strict Mode); the new id is derived from existing ids.
- **Persistence:** \`useReducer(reducer, undefined, loadCards)\` reads \`localStorage\` once. An effect saves after every change. Both are wrapped in \`try/catch\` (private mode, full storage, bad JSON).
- **Accessibility:** arrow symbols mean nothing to screen readers, so each button has a label like \`Move "Write README" left\`.`,
      followUps: [
        {
          q: `How would you add real drag-and-drop without a library?`,
          a: `Use the HTML5 Drag and Drop API: \`draggable\` on cards, \`onDragStart\` stores the card id in \`e.dataTransfer\`, columns handle \`onDragOver\` (call \`preventDefault\`) and \`onDrop\` dispatches \`moveColumn\`. Keep the buttons too — drag-and-drop alone is not keyboard accessible.`,
        },
        {
          q: `How would you save the board on a server?`,
          a: `Give each card a \`status\` and an \`order\` number in MongoDB. Update optimistically on the client, \`PATCH /api/cards/:id\` with the new status/order, and roll back on error. Fractional order values (between two neighbours) avoid renumbering every card.`,
        },
        {
          q: `Why keep focus on the moved card?`,
          a: `After moving, the button the user pressed is unmounted and focus jumps to the page start. Keep a ref map of card elements and focus the moved card's button in an effect, so keyboard users can keep moving it.`,
        },
      ],
    },
    {
      id: 'virtualized-list',
      title: 'Virtualized list from scratch (10,000 rows, fixed height)',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'infinite-scroll',
      question: `Rendering 10,000 rows makes a page slow (10,000+ DOM nodes). Build a \`VirtualList\` that renders only the rows you can see.

**Requirements:**

- Props: \`items\`, \`rowHeight\` (fixed, e.g. 40px), \`height\` of the box (e.g. 400px), \`overscan\` (extra rows above/below, e.g. 5).
- The scrollbar must look and behave as if all rows exist.
- Only about \`height / rowHeight + 2 × overscan\` rows are in the DOM at any time.
- A "Jump to row" input scrolls to that row.
- No libraries (no react-window).`,
      hints: [
        `Build order: (1) a fixed-height scrolling box, (2) an inner "spacer" div with height \`items.length * rowHeight\`, (3) \`scrollTop\` state from \`onScroll\`, (4) compute \`start\` / \`end\` indexes, (5) render only those rows with absolute positions, (6) jump-to.`,
        `\`firstVisible = Math.floor(scrollTop / rowHeight)\`; \`visibleCount = Math.ceil(height / rowHeight)\`. Add \`overscan\` on both sides and clamp to \`0 … items.length\`.`,
        `Position each rendered row at \`index * rowHeight\` (with \`top\` or \`transform: translateY\`). Use the item id as the key, not the loop index.`,
      ],
      solution: `**Idea:** fake the full height with an empty spacer so scrolling feels normal, and on every scroll calculate which slice of rows is inside the window. Only that slice is rendered, each row placed at its real position.

\`\`\`jsx
import { useRef, useState } from 'react';

const ITEMS = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, text: \`Row #\${i + 1}\` }));

export default function VirtualList({ items = ITEMS, rowHeight = 40, height = 400, overscan = 5 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const totalHeight = items.length * rowHeight; // the full list height, so the scrollbar is correct

  // Which rows are inside the visible window (plus a few extra above/below = overscan)
  const firstVisible = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(height / rowHeight);
  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(items.length, firstVisible + visibleCount + overscan); // exclusive

  const visibleItems = items.slice(start, end);

  function jumpTo(rowNumber) {
    const index = Math.min(Math.max(rowNumber - 1, 0), items.length - 1);
    // setting scrollTop fires onScroll, which updates state
    if (containerRef.current) containerRef.current.scrollTop = index * rowHeight;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', width: 320 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          jumpTo(Number(new FormData(e.currentTarget).get('row')));
        }}
        style={{ marginBottom: 8, display: 'flex', gap: 6 }}
      >
        <input name="row" type="number" min="1" max={items.length} placeholder="Row number" aria-label="Row number" />
        <button type="submit">Jump</button>
      </form>

      {/* 1. Outer box: fixed height, scrolls */}
      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        role="list"
        aria-label={\`\${items.length} rows\`}
        tabIndex={0}
        style={{ height, overflowY: 'auto', position: 'relative', border: '1px solid #ccc' }}
      >
        {/* 2. Spacer: as tall as ALL rows together */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* 3. Only the visible rows, each placed at its real position */}
          {visibleItems.map((item, i) => {
            const index = start + i;
            return (
              <div
                key={item.id}
                role="listitem"
                aria-setsize={items.length}
                aria-posinset={index + 1}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: rowHeight,
                  transform: \`translateY(\${index * rowHeight}px)\`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  boxSizing: 'border-box',
                  borderBottom: '1px solid #eee',
                  background: index % 2 ? '#fafafa' : '#fff',
                }}
              >
                {item.text}
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ color: '#666', fontSize: 13 }}>
        Rendering rows {start + 1}–{end} of {items.length} ({end - start} DOM rows)
      </p>
    </div>
  );
}
\`\`\`

**How it works:**

- **Spacer:** a div as tall as all rows (\`10,000 × 40 = 400,000px\`) gives the browser a correct scrollbar.
- **Window math:** from \`scrollTop\` we know the first visible row. With overscan, about \`10 + 10 = 20\` rows are rendered instead of 10,000. The overscan rows hide blank flashes during fast scrolls.
- **Positioning:** rows are absolutely positioned with \`translateY(index * rowHeight)\`, so they appear exactly where they would be in a full list.
- **Keys:** \`item.id\`, so React keeps the right row content when the window shifts.
- **Jump:** setting \`scrollTop\` on the container fires \`onScroll\`, which updates state — one code path for both.
- **Accessibility:** \`aria-setsize\` and \`aria-posinset\` tell screen readers each row's real position in the full list.

**Complexity:** O(visible rows) per render instead of O(n).`,
      followUps: [
        {
          q: `How would you handle rows with different heights?`,
          a: `Measure rows after they render (a ref + \`ResizeObserver\`), store heights in a map, and keep a prefix-sum array of offsets. Find the first visible row with binary search on the offsets. Use an estimated height for rows not measured yet.`,
        },
        {
          q: `Should onScroll call setState on every event?`,
          a: `It usually works fine because the slice math is cheap. If profiling shows jank, only update when \`start\` actually changes, or batch with \`requestAnimationFrame\`.`,
        },
        {
          q: `What are the downsides of virtualization?`,
          a: `Browser find (Ctrl+F) cannot see rows that are not rendered, screen readers only see the rendered part, and scroll restoration needs extra work. Use it for long lists (hundreds of rows or more), not for 50 items.`,
        },
      ],
    },
  ],
};
