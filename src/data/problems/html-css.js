// Interview problems for the HTML & CSS stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'html-css',
  problems: [
    {
      id: 'center-a-div-four-ways',
      title: 'Center a div — show 4 different ways',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'centering-a-div',
      question: `Center the \`.box\` both **horizontally and vertically** inside \`.parent\`. Show at least **4 different ways** and say when you would pick each one.

\`\`\`html
<div class="parent">
  <div class="box">I am centered</div>
</div>
\`\`\`

\`\`\`css
.parent {
  height: 300px;
  border: 1px solid #ccc;
}
.box {
  width: 150px;
  padding: 1rem;
  background: #2563eb;
  color: white;
}
\`\`\``,
      hints: [
        'Two modern ways use the parent: make it a flex container or a grid container.',
        'One older way uses `position: absolute` on the child plus a `transform`.',
        'Inside a flex or grid parent, `margin: auto` on the child eats all free space on every side.',
      ],
      solution: `**Idea:** you either tell the **parent** how to place its child (flex / grid), or you move the **child** itself (absolute + transform, or auto margins).

\`\`\`css
/* Way 1 — Flexbox (most common, works for 1+ children) */
.parent {
  display: flex;
  justify-content: center; /* horizontal (main axis) */
  align-items: center;     /* vertical (cross axis)  */
}

/* Way 2 — Grid (shortest) */
.parent {
  display: grid;
  place-items: center; /* = align-items + justify-items */
}

/* Way 3 — Absolute + transform (works without knowing the box size) */
.parent {
  position: relative; /* the box is positioned against this */
}
.box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* pull back by half of its own size */
}

/* Way 4 — margin: auto inside a flex (or grid) parent */
.parent {
  display: flex;
}
.box {
  margin: auto; /* free space is shared equally on all 4 sides */
}
\`\`\`

**When to pick which:**

- **Flexbox** — your default. Good when you also need a gap between items or a row/column of items.
- **Grid \`place-items\`** — shortest code. Great for one child (icons, empty states, loaders).
- **Absolute + transform** — for overlays on top of other content (a badge on an image, a spinner on a card). The box is taken out of normal flow.
- **\`margin: auto\`** — handy when only one child should be centered, or to push one item away (e.g. \`margin-left: auto\` pushes a "Logout" button to the right).

**Why it works:** flex and grid have alignment properties for both axes. \`top/left: 50%\` moves the box's **top-left corner** to the middle, and \`translate(-50%, -50%)\` moves it back by half of its **own** width and height, so its center lands in the middle.

**Bonus — only horizontal:** \`margin: 0 auto\` on a block element with a width. In normal block flow, \`margin: auto\` does **not** center vertically.`,
      followUps: [
        {
          q: 'Why does margin: 0 auto not center vertically in a normal block?',
          a: 'In normal block layout, vertical `auto` margins compute to `0`. Only in flex and grid containers (or for absolutely positioned elements with `inset: 0` and a fixed size) do vertical auto margins share the free space.',
        },
        {
          q: 'What is a downside of the transform method?',
          a: 'The element leaves normal flow, so the parent does not grow around it. Also, if the final position lands on half pixels, text can look slightly blurry on some screens.',
        },
      ],
    },
    {
      id: 'specificity-which-color-wins',
      title: 'Specificity puzzle — which color wins?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'specificity',
      question: `What color is the text "Hello" in each case? Explain using specificity scores.

\`\`\`html
<div id="app" class="card">
  <p class="text highlight">Hello</p>
</div>
\`\`\`

**Case A:**

\`\`\`css
#app p               { color: red; }
.card .text.highlight { color: blue; }
div.card p.text      { color: green; }
\`\`\`

**Case B:** same as A, plus this rule at the very top of the file:

\`\`\`css
.highlight { color: orange !important; }
\`\`\`

**Case C:** only these two rules exist:

\`\`\`css
#app { color: purple; }
p    { color: black; }
\`\`\``,
      hints: [
        'Write each selector as (IDs, classes/attributes/pseudo-classes, elements). Compare left to right, like version numbers.',
        'One ID beats any number of classes.',
        'Inherited values (from a parent) have no specificity at all. Any rule that targets the element directly wins over inheritance.',
      ],
      solution: `**Idea:** score each selector as **(IDs, classes, elements)** and compare from the left. \`!important\` jumps above normal rules. Inheritance always loses to a direct rule.

\`\`\`text
Case A
  #app p                 -> (1, 0, 1)   <- winner: it has an ID
  .card .text.highlight  -> (0, 3, 0)
  div.card p.text        -> (0, 2, 2)
  Result: red

Case B
  .highlight { color: orange !important }  -> important declarations
  beat all normal declarations, no matter the specificity or order.
  Result: orange

Case C
  #app { color: purple }  -> sets color on the DIV, the <p> only inherits it
  p    { color: black }   -> targets the <p> directly
  Result: black  (a direct rule always beats an inherited value)
\`\`\`

**Why it works:**

- Compare the first number first. \`(1,0,1)\` beats \`(0,3,0)\` because 1 ID > 0 IDs — the class count does not matter. Even \`(0,15,0)\` loses to one ID.
- Source order only matters when two selectors have the **same** score.
- In case B the \`!important\` rule is at the top of the file, but order does not matter here: important declarations are in a higher "layer" of the cascade than normal ones.
- In case C the specificity of \`#app\` does not help the \`<p>\`, because that rule does not select the \`<p>\`.

**Order of strength (simplified):** \`!important\` > inline \`style=""\` > IDs > classes / attributes / pseudo-classes > elements / pseudo-elements > inherited values.`,
      followUps: [
        {
          q: 'What specificity do :is(), :not() and :where() have?',
          a: '`:is()` and `:not()` take the specificity of their **most specific** argument (`:is(#a, .b)` counts as an ID). `:where()` always has **zero** specificity, which makes it great for default styles that are easy to override.',
        },
        {
          q: 'Why is !important considered a code smell?',
          a: 'It breaks the normal cascade. The only way to beat it is another `!important` with higher specificity, so it starts an "arms race". Use it only for utility classes (like `.hidden`) or to override third-party CSS you cannot change.',
        },
        {
          q: 'Does the universal selector * add specificity?',
          a: 'No. `*` and combinators (`>`, `+`, `~`, space) add nothing. `* p` has the same score as `p`: (0,0,1).',
        },
      ],
    },
    {
      id: 'truncate-text-ellipsis',
      title: 'Truncate text with "..." (one line and 3 lines)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'box-model',
      question: `You have a product card. Make:

1. The **title** stay on one line and end with "..." if it is too long.
2. The **description** show at most **3 lines**, then "...".

\`\`\`html
<article class="card">
  <h3 class="card__title">Ultra Comfortable Wireless Noise Cancelling Headphones with 40h Battery</h3>
  <p class="card__desc">Long description text that goes on and on for many lines ...</p>
</article>
\`\`\`

\`\`\`css
.card {
  width: 260px;
}
\`\`\``,
      hints: [
        'For one line you need 3 properties together: stop wrapping, hide the overflow, and draw the ellipsis.',
        '`text-overflow: ellipsis` only works if the element has a limited width and `overflow` is not `visible`.',
        'For multiple lines, look up `-webkit-line-clamp`. It needs `display: -webkit-box` and `-webkit-box-orient: vertical`.',
      ],
      solution: `**Idea:** single line = no wrap + hide overflow + ellipsis. Multi-line = the line-clamp trick, which every modern browser supports.

\`\`\`css
/* 1. One line with "..." */
.card__title {
  white-space: nowrap;      /* keep everything on one line */
  overflow: hidden;         /* hide what does not fit */
  text-overflow: ellipsis;  /* show "..." at the cut */
}

/* 2. Max 3 lines with "..." */
.card__desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;    /* number of lines to show */
  line-clamp: 3;            /* standard name, for the future */
  overflow: hidden;
}
\`\`\`

\`\`\`html
<!-- Give users a way to read the full title -->
<h3 class="card__title" title="Ultra Comfortable Wireless Noise Cancelling Headphones with 40h Battery">
  Ultra Comfortable Wireless Noise Cancelling Headphones with 40h Battery
</h3>
\`\`\`

**Why it works:** \`text-overflow\` only decides **how** hidden text looks — it needs \`nowrap\` (so text overflows sideways) and \`overflow: hidden\` (so there is something to cut). The block's width comes from the card (260px). \`-webkit-line-clamp\` is an old WebKit feature that all browsers adopted; it cuts after N lines and adds the ellipsis.

**Edge cases:**

- If the title is inside a **flex item**, the ellipsis may not appear because flex items do not shrink below their content width. Add \`min-width: 0\` to the flex item.
- Truncated text is still in the HTML, so screen readers and search engines read the full text. That is good.
- Do not truncate important info (like price) — users cannot see it.`,
      followUps: [
        {
          q: 'The ellipsis does not show on an inline <span>. Why?',
          a: '`overflow` and a width do not apply to plain inline elements. Make it `display: block` or `inline-block` (and give it a max-width), or put it in a block parent.',
        },
        {
          q: 'How can you show the full text on demand?',
          a: 'Toggle a class that removes the clamp (`-webkit-line-clamp: unset`) with a "Read more" button. Use a real `<button>` with `aria-expanded` so it works with keyboard and screen readers.',
        },
      ],
    },
    {
      id: 'responsive-video-aspect-ratio',
      title: 'Make a YouTube embed keep 16:9 at every width',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'responsive-design',
      question: `This embedded video looks fine on desktop, but on mobile it overflows the screen or gets squashed. Make it **fill the container width** and always keep a **16:9** shape.

\`\`\`html
<div class="video">
  <iframe
    width="560" height="315"
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="Product demo"
    allowfullscreen></iframe>
</div>
\`\`\``,
      hints: [
        'Modern CSS has a property that sets width:height ratio directly.',
        'Let the wrapper own the shape, and let the iframe fill 100% of the wrapper.',
        'The old trick (for very old browsers) used `padding-top: 56.25%` — padding in % is based on the width.',
      ],
      solution: `**Idea:** the wrapper takes the full width and gets \`aspect-ratio: 16 / 9\`, so its height is calculated from its width. The iframe just fills the wrapper.

\`\`\`css
.video {
  width: 100%;
  aspect-ratio: 16 / 9;   /* height = width * 9 / 16 */
}

.video iframe {
  width: 100%;            /* overrides the width="560" attribute */
  height: 100%;           /* overrides the height="315" attribute */
  border: 0;
  display: block;         /* removes the small gap under inline elements */
}
\`\`\`

**The old way** (you may see it in older codebases):

\`\`\`css
.video {
  position: relative;
  padding-top: 56.25%;   /* 9 / 16 = 0.5625 — % padding is based on WIDTH */
  height: 0;
}
.video iframe {
  position: absolute;
  inset: 0;              /* top/right/bottom/left: 0 */
  width: 100%;
  height: 100%;
}
\`\`\`

**Why it works:** \`aspect-ratio\` lets the browser compute the missing dimension. Since only the width is set (100% of the parent), the height becomes width x 9/16. CSS beats the HTML \`width\`/\`height\` attributes because attributes are only "presentational hints" with the lowest priority.

**Keep the \`title\` attribute** on the iframe — screen readers announce it so users know what the frame contains.`,
      followUps: [
        {
          q: 'What happens if you set both width and height together with aspect-ratio?',
          a: 'If both width and height are fixed, `aspect-ratio` is ignored. It only works when at least one dimension is `auto`.',
        },
        {
          q: 'How do you make an image fill a 1:1 box without stretching?',
          a: 'Give the img `aspect-ratio: 1; width: 100%; object-fit: cover;`. `object-fit: cover` crops the image to fill the box while keeping its own proportions.',
        },
      ],
    },
    {
      id: 'faq-accordion-details-summary',
      title: 'Build an FAQ accordion with no JavaScript',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'semantic-html',
      question: `Build an FAQ section where each question opens and closes its answer when clicked. Requirements:

- **No JavaScript.**
- Works with keyboard (Tab + Enter/Space) and screen readers.
- Show a "+" icon that turns into "−" when open (hide the default triangle).
- Bonus: only one answer open at a time.`,
      hints: [
        'HTML has a built-in element for "click to show more". It has a child for the clickable title.',
        'The open state is shown with an `open` attribute — you can style `details[open]`.',
        'The default triangle is the `summary` list marker. Hide it with `list-style: none` (plus a WebKit pseudo-element for older Safari).',
      ],
      solution: `**Idea:** \`<details>\` + \`<summary>\` is a native disclosure widget. The browser handles clicks, keyboard, focus and screen-reader state for free.

\`\`\`html
<section class="faq" aria-labelledby="faq-title">
  <h2 id="faq-title">Frequently asked questions</h2>

  <!-- Same "name" = only one open at a time (exclusive accordion) -->
  <details class="faq__item" name="faq">
    <summary>How long does shipping take?</summary>
    <p>Usually 3-5 business days.</p>
  </details>

  <details class="faq__item" name="faq">
    <summary>Can I return an item?</summary>
    <p>Yes, within 30 days of delivery.</p>
  </details>
</section>
\`\`\`

\`\`\`css
.faq__item {
  border-bottom: 1px solid #e5e7eb;
}

.faq__item summary {
  list-style: none;            /* hide default triangle */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
  font-weight: 600;
}
.faq__item summary::-webkit-details-marker {
  display: none;               /* hide triangle in older Safari */
}

.faq__item summary::after {
  content: "+";
  font-size: 1.25rem;
}
.faq__item[open] summary::after {
  content: "−";                /* minus sign when open */
}

.faq__item summary:focus-visible {
  outline: 2px solid #2563eb;  /* clear keyboard focus */
  outline-offset: 4px;
}
\`\`\`

**Why it works:** \`<summary>\` is focusable and toggles its \`<details>\` on click, Enter and Space. The browser adds or removes the \`open\` attribute, so CSS can style the open state. Screen readers announce it as "expanded / collapsed".

**The \`name\` attribute** groups details elements so opening one closes the others. It is supported in current Chrome, Edge, Safari and Firefox (2024+). In older browsers they simply work independently — a safe fallback.

**Bonus:** the browser's find-in-page (Ctrl/Cmd+F) can search text inside closed \`<details>\` in Chrome and opens them automatically.`,
      followUps: [
        {
          q: 'Can you animate the opening?',
          a: 'Simple option: animate the content with `@keyframes` (fade/slide in) when `[open]` is set. Newer browsers support `::details-content` and `interpolate-size: allow-keywords` to animate height to `auto`; older ones just open instantly, which is fine.',
        },
        {
          q: 'When would you build a custom accordion with JS instead?',
          a: 'When the design needs things details cannot do easily — for example controlled state from React, "expand all" buttons or complex animations. Then use a `<button aria-expanded aria-controls>` for each header and a region for each panel.',
        },
      ],
    },
    {
      id: 'loading-spinner-reduced-motion',
      title: 'CSS loading spinner that respects reduced motion',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'animations-keyframes',
      question: `Build a round loading spinner with **only CSS** (one element, no images). Then:

1. Make it accessible — a screen reader user should know something is loading.
2. Respect users who turned on **"Reduce motion"** in their OS settings.

\`\`\`html
<div class="spinner"></div>
\`\`\``,
      hints: [
        'A circle with a light border on all sides and a coloured border on one side looks like a spinner when it rotates.',
        'Use `@keyframes` that go to `transform: rotate(360deg)` with `linear infinite` timing.',
        'There is a media query for the OS motion setting: `prefers-reduced-motion`.',
      ],
      solution: `**Idea:** a bordered circle with one coloured side, rotated forever with \`@keyframes\`. Add a hidden text label for screen readers and a calmer animation for reduced-motion users.

\`\`\`html
<div class="spinner" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
\`\`\`

\`\`\`css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;        /* light ring */
  border-top-color: #2563eb;        /* the coloured "arc" */
  border-radius: 50%;               /* make it a circle */
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);      /* transform = cheap, runs on the GPU */
  }
}

/* Users who asked the OS for less motion */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: pulse 2s ease-in-out infinite; /* gentle fade, no spinning */
  }
}

@keyframes pulse {
  50% {
    opacity: 0.4;
  }
}

/* Hidden visually, but still read by screen readers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
\`\`\`

**Why it works:**

- Only one border side has a colour, so rotating the circle looks like a moving arc.
- \`linear\` timing keeps the speed constant (no "jerk" at each turn).
- Animating \`transform\` (and \`opacity\`) does not cause layout or paint each frame, so it stays smooth.
- \`role="status"\` is a polite live region: screen readers announce "Loading..." without interrupting the user.
- \`prefers-reduced-motion: reduce\` matches when the user turned on "Reduce motion" (macOS/iOS) or "Show animations: off" (Windows). People with vestibular disorders can feel sick from motion. We still show **something** (a soft pulse), because the user must know the app is working.

**Note:** do not use \`display: none\` for the label — that hides it from screen readers too.`,
      followUps: [
        {
          q: 'How would you turn off ALL animations for reduced-motion users in a big app?',
          a: 'A global rule inside `@media (prefers-reduced-motion: reduce)`: `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`. Using a tiny duration instead of `none` keeps `animationend` events firing for JS that waits on them.',
        },
        {
          q: 'How do you check this setting in JavaScript?',
          a: '`window.matchMedia("(prefers-reduced-motion: reduce)").matches`. Listen to its `change` event to react if the user changes it while the page is open — useful for JS animation libraries.',
        },
      ],
    },
    {
      id: 'responsive-card-grid-no-media-queries',
      title: 'Responsive card grid without media queries',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'css-grid',
      question: `Build a product grid that:

- shows as many columns as fit, each card **at least 250px** wide,
- stretches cards to fill the row (no empty gap on the right),
- becomes 1 column on small phones **without horizontal scroll** (even on a 230px wide screen),
- uses **no media queries**.

\`\`\`html
<ul class="grid">
  <li class="card">...</li>
  <li class="card">...</li>
  <!-- any number of cards -->
</ul>
\`\`\`

Also explain: what is the difference between \`auto-fit\` and \`auto-fill\` here?`,
      hints: [
        'Grid can repeat a column definition "as many times as fits": `repeat(auto-fit, ...)`.',
        'Each column should be "at least 250px, at most 1 share of the space": `minmax(250px, 1fr)`.',
        'On a screen narrower than 250px, a 250px minimum overflows. Wrap the minimum in `min(250px, 100%)`.',
      ],
      solution: `**Idea:** let the grid calculate the number of columns. \`repeat(auto-fit, minmax(MIN, 1fr))\` means "fit as many columns of at least MIN as possible, then share the leftover space equally".

\`\`\`css
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.5rem;
  /* As many columns as fit. Each: at least 250px (or 100% if the
     screen is smaller), at most an equal share of the free space. */
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
}

.card {
  display: flex;
  flex-direction: column;  /* lets a button stick to the bottom with margin-top: auto */
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
}
\`\`\`

**How the browser does it (container 1000px wide, gap 24px):**

\`\`\`text
How many 250px columns fit?  3 columns = 3*250 + 2*24 = 798px  (fits)
                             4 columns = 4*250 + 3*24 = 1072px (too wide)
-> 3 columns, each = (1000 - 48) / 3 = 317px
\`\`\`

**auto-fit vs auto-fill** (only different when there are **few** items):

\`\`\`text
Container fits 4 columns, but you only have 2 cards:

auto-fill: [card][card][ empty ][ empty ]   -> keeps empty tracks, cards stay narrow
auto-fit:  [   card   ][   card   ]          -> collapses empty tracks, cards stretch
\`\`\`

**Why it works:** \`minmax(250px, 1fr)\` sets a minimum and a maximum for each column. \`auto-fit\` creates as many columns as fit, then collapses the unused ones so \`1fr\` columns grow. \`min(250px, 100%)\` picks the smaller value, so on a 230px screen the minimum becomes 230px and nothing overflows.`,
      followUps: [
        {
          q: 'How would you make all cards in a row the same height, with the button at the bottom?',
          a: 'Grid items in the same row already stretch to equal height (`align-items: stretch` is the default). Make the card a flex column and give the button `margin-top: auto` so it is pushed to the bottom.',
        },
        {
          q: 'When would you still use a media query?',
          a: 'When the layout must change in a non-linear way — e.g. the sidebar moves above the content, or the number of columns must be exact (exactly 2 on tablet, 4 on desktop). Container queries (`@container`) are even better when a component should react to its own box size instead of the screen.',
        },
      ],
    },
    {
      id: 'sticky-header-footer-at-bottom',
      title: 'Sticky header + footer that stays at the bottom on short pages',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'positioning',
      question: `On pages with little content (like "404" or an empty cart), the footer floats in the middle of the screen with white space under it. Fix the layout so that:

1. The footer is at the **bottom of the screen** on short pages, and after the content on long pages (not fixed over the content).
2. The header **sticks to the top** while you scroll.

\`\`\`html
<body>
  <header class="site-header">Logo · Nav</header>
  <main>Short content</main>
  <footer class="site-footer">© 2026</footer>
</body>
\`\`\``,
      hints: [
        'The body must be at least as tall as the screen. Which CSS unit is "100% of the viewport height"?',
        'Make body a grid with three rows: header (auto), main (takes all leftover space), footer (auto).',
        '`position: sticky; top: 0` keeps the header at the top. It needs a `top` value, and no ancestor with `overflow: hidden`.',
      ],
      solution: `**Idea:** make the body at least one screen tall and split it into 3 rows. The middle row (\`main\`) grows to fill the gap, which pushes the footer down. The header uses \`position: sticky\`.

\`\`\`css
body {
  margin: 0;
  min-height: 100vh;    /* fallback for old browsers */
  min-height: 100dvh;   /* better on mobile (see the 100vh problem) */
  display: grid;
  grid-template-rows: auto 1fr auto; /* header | main grows | footer */
}

.site-header {
  position: sticky;
  top: 0;               /* stick when it reaches the top edge */
  z-index: 10;          /* stay above page content while scrolling */
  background: white;    /* otherwise content shows through */
  border-bottom: 1px solid #e5e7eb;
}
\`\`\`

**Flexbox version** (same result):

\`\`\`css
body {
  margin: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;              /* take all the free space */
}
\`\`\`

**Why it works:**

- \`min-height\` (not \`height\`) lets the page **grow** when content is long. With \`height: 100vh\`, long content would overflow.
- \`1fr\` / \`flex: 1\` gives all extra space to \`main\`, so the footer is pushed to the bottom on short pages. On long pages there is no extra space, so the footer just follows the content.
- \`position: sticky\` acts like \`relative\` until you scroll to \`top: 0\`, then acts like \`fixed\` — but it stays inside its parent (here \`body\`, which is the full page height), so it sticks for the whole page.

**Common bug:** sticky stops working if any ancestor has \`overflow: hidden\`, \`overflow: auto\` or \`overflow: scroll\` — that ancestor becomes the scroll box the header sticks inside. Use \`overflow: clip\` if you only need to cut off overflow.`,
      followUps: [
        {
          q: 'Why not use position: fixed for the footer?',
          a: 'A fixed footer is always visible and sits **on top** of the content, so you must add padding to avoid hiding the last items. The task wants it at the bottom only on short pages, which is the normal "sticky footer" pattern above.',
        },
        {
          q: 'Anchor links scroll the heading under the sticky header. How do you fix it?',
          a: 'Add `scroll-margin-top` equal to the header height on the target elements (e.g. `h2 { scroll-margin-top: 80px; }`), or `scroll-padding-top` on `html`.',
        },
      ],
    },
    {
      id: 'holy-grail-layout-grid',
      title: 'Holy-grail layout with CSS Grid (mobile first)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'css-grid',
      question: `Build the classic "holy grail" layout:

\`\`\`text
Desktop (>= 768px):                 Mobile:
+---------------------------+       +---------+
|          header           |       | header  |
+------+------------+-------+       +---------+
| nav  |    main    | aside |       |  nav    |
|200px |  flexible  | 200px |       |  main   |
+------+------------+-------+       |  aside  |
|          footer           |       | footer  |
+---------------------------+       +---------+
\`\`\`

- The footer stays at the bottom on short pages.
- The main column must not overflow when it contains a wide table or long URL.
- Keep the HTML in a logical order for screen readers.

\`\`\`html
<div class="page">
  <header>...</header>
  <nav>...</nav>
  <main>...</main>
  <aside>...</aside>
  <footer>...</footer>
</div>
\`\`\``,
      hints: [
        '`grid-template-areas` lets you "draw" the layout with names, and change the drawing in a media query.',
        'Start with the mobile layout (one column) and add the 3-column version inside `@media (min-width: 768px)`.',
        '`1fr` has a hidden minimum of `auto` (the content width). Use `minmax(0, 1fr)` so the middle column can shrink.',
      ],
      solution: `**Idea:** name each area, draw the mobile layout first, and redraw it for wide screens. Only the CSS changes — the HTML order stays logical.

\`\`\`css
.page {
  min-height: 100dvh;
  display: grid;
  gap: 1rem;
  /* Mobile: one column, stacked in source order */
  grid-template-areas:
    "header"
    "nav"
    "main"
    "aside"
    "footer";
  grid-template-rows: auto auto 1fr auto auto; /* main row grows */
}

header { grid-area: header; }
nav    { grid-area: nav; }
main   { grid-area: main; }
aside  { grid-area: aside; }
footer { grid-area: footer; }

@media (min-width: 768px) {
  .page {
    /* minmax(0, 1fr): the middle column may shrink below its content width */
    grid-template-columns: 200px minmax(0, 1fr) 200px;
    grid-template-areas:
      "header header header"
      "nav    main   aside"
      "footer footer footer";
    grid-template-rows: auto 1fr auto;
  }
}

/* Wide tables scroll inside a wrapper: <div class="table-scroll"><table>...</table></div>
   (better than display: block on the table, which can remove table semantics) */
.table-scroll {
  overflow-x: auto;
}
main {
  overflow-wrap: anywhere; /* long URLs wrap */
}
\`\`\`

**Why it works:**

- \`grid-template-areas\` is like a map: each string is a row, each word is a cell. Repeating a name (\`header header header\`) makes that area span columns.
- The \`1fr\` **row** gives leftover height to the middle row, so the footer sits at the bottom on short pages.
- A plain \`1fr\` column means \`minmax(auto, 1fr)\` — it cannot get smaller than its widest content. A wide table would push the page wider than the screen. \`minmax(0, 1fr)\` removes that minimum.
- The HTML stays in reading order (header, nav, main, aside, footer). Never reorder visually in a way that confuses keyboard users, because Tab follows the **HTML** order, not the visual order.`,
      followUps: [
        {
          q: 'How would you hide the aside on mobile but keep the grid working?',
          a: 'Remove `"aside"` from the mobile `grid-template-areas` and set `aside { display: none; }` in the base styles, then `display: block` inside the media query. Grid areas without an element simply stay empty.',
        },
        {
          q: 'Grid or Flexbox for this layout?',
          a: 'Grid. It is a two-dimensional layout (rows **and** columns must line up). Flexbox is better for one-dimensional things like the nav links inside the header.',
        },
      ],
    },
    {
      id: 'semantic-rewrite-div-soup',
      title: 'Rewrite a "div soup" page with semantic HTML',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'semantic-html',
      question: `A teammate wrote this blog page. It looks fine, but it has bad accessibility and SEO. Rewrite it with semantic HTML and list every problem you fixed.

\`\`\`html
<div class="header">
  <div class="logo" onclick="location.href='/'">MyBlog</div>
  <div class="menu">
    <div class="link" onclick="location.href='/posts'">Posts</div>
    <div class="link" onclick="location.href='/about'">About</div>
  </div>
</div>
<div class="content">
  <div class="post">
    <div class="title">Learning CSS Grid</div>
    <div class="date">March 3, 2026</div>
    <img src="grid.png">
    <div class="text">Grid is a 2D layout system...</div>
    <div class="btn" onclick="share()">Share</div>
  </div>
</div>
<div class="sidebar">Related posts...</div>
<div class="footer">© 2026 MyBlog</div>
\`\`\``,
      hints: [
        'Clickable divs are not focusable with Tab and are not announced as links or buttons. What element navigates? What element performs an action?',
        'Look for the landmark elements: header, nav, main, article, aside, footer.',
        'Every page needs a heading structure (one h1) and every content image needs alt text.',
      ],
      solution: `**Idea:** use elements that **say what they are**. Links (\`<a>\`) go to a URL, buttons (\`<button>\`) do an action, and landmarks (\`header\`, \`nav\`, \`main\`...) let screen-reader users jump around the page.

\`\`\`html
<header class="site-header">
  <!-- A link, because it navigates. Works with Tab, Enter, middle-click, "open in new tab" -->
  <a class="logo" href="/">MyBlog</a>

  <nav aria-label="Main">
    <ul class="menu">
      <li><a href="/posts" aria-current="page">Posts</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main id="content">
  <article class="post">
    <header>
      <h1>Learning CSS Grid</h1>
      <!-- Machine-readable date for search engines and tools -->
      <time datetime="2026-03-03">March 3, 2026</time>
    </header>

    <img
      src="grid.png"
      alt="A 3 by 3 grid with the middle cell highlighted"
      width="800" height="450">

    <p>Grid is a 2D layout system...</p>

    <!-- A button, because it does an action and does not navigate -->
    <button type="button" class="btn" onclick="share()">Share</button>
  </article>
</main>

<aside aria-labelledby="related-title">
  <h2 id="related-title">Related posts</h2>
  ...
</aside>

<footer class="site-footer">
  <p>&copy; 2026 MyBlog</p>
</footer>
\`\`\`

**What was fixed:**

1. **Clickable divs -> \`<a>\` and \`<button>\`.** Divs are not in the Tab order, do not react to Enter/Space, and are announced as plain text. Links also get right-click "open in new tab" and are crawled by Google.
2. **Landmarks:** \`header\`, \`nav\`, \`main\`, \`aside\`, \`footer\`. Screen-reader users can jump straight to "main" or "navigation".
3. **Nav links in a \`<ul>\`** — screen readers announce "list, 2 items", so users know how many links there are.
4. **Headings:** the post title is an \`<h1>\` and the sidebar title an \`<h2>\`. Headings are the #1 way screen-reader users skim a page, and they help SEO.
5. **\`<article>\`** for a self-contained post (could be shared or put in a feed).
6. **\`<time datetime>\`** for a machine-readable date.
7. **\`alt\` text** on the image, plus \`width\`/\`height\` to prevent layout shift.
8. **\`aria-current="page"\`** tells assistive tech which link is the current page.
9. **\`&copy;\`** inside a \`<p>\`, so the footer text is a real paragraph.

**Why it works:** semantic elements come with built-in roles, keyboard behaviour and meaning. You get accessibility and SEO "for free" instead of rebuilding them with ARIA and JavaScript.`,
      followUps: [
        {
          q: 'What alt text should a purely decorative image have?',
          a: 'An empty `alt=""`. Screen readers then skip it. Leaving out `alt` entirely is wrong — some screen readers will read the file name instead.',
        },
        {
          q: 'Can you have more than one <header> or <nav> on a page?',
          a: 'Yes. `<header>` can be used inside an `<article>` or `<section>`. With multiple `<nav>` elements, give each a different `aria-label` ("Main", "Footer") so screen-reader users can tell them apart. There should be only one visible `<main>`.',
        },
        {
          q: 'Why not just add role="button" and tabindex="0" to the div?',
          a: 'You would also need to handle Enter and Space keys, focus styles, and disabled state yourself. The first rule of ARIA: if a native element does the job, use it.',
        },
      ],
    },
    {
      id: 'fix-layout-shift-images',
      title: 'Fix layout shift (CLS) caused by images and ads',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'core-web-vitals',
      question: `Lighthouse says your blog page has a **CLS of 0.32** (bad). Users complain that text "jumps" while the page loads and they tap the wrong link. Find the causes in this code and fix them.

\`\`\`html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
</head>
<body>
  <div id="ad-slot"></div>              <!-- an ad script fills this after 1s -->
  <h1>My post</h1>
  <img src="/hero.jpg" class="hero">
  <p>First paragraph...</p>
  <img src="/chart.png" class="inline-img">
</body>
\`\`\`

\`\`\`css
.hero, .inline-img {
  width: 100%;
}
\`\`\``,
      hints: [
        'Before an image downloads, how tall does the browser think it is? What happens to the text under it when it arrives?',
        'The browser can reserve space if it knows the image ratio. Which two HTML attributes give it that?',
        'Late-loading ads and web fonts can also move content. Reserve space for the ad; think about how the font swap changes text size.',
      ],
      solution: `**Idea:** CLS happens when something appears or changes size **after** content below it is already shown. Fix it by telling the browser the size **in advance**.

\`\`\`html
<head>
  <!-- Connect early to the font server -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
</head>
<body>
  <!-- 1. Reserve the ad's height before the ad loads -->
  <div id="ad-slot" class="ad-slot"></div>

  <h1>My post</h1>

  <!-- 2. width + height = the image's real pixel size (only the RATIO matters).
       The hero is the LCP image: load it eagerly with high priority. -->
  <img src="/hero.jpg" class="hero" width="1200" height="600"
       alt="Laptop on a desk" fetchpriority="high">

  <p>First paragraph...</p>

  <!-- Below-the-fold image: lazy-load, still with width/height -->
  <img src="/chart.png" class="inline-img" width="800" height="500"
       alt="Bar chart of page speed before and after" loading="lazy">
</body>
\`\`\`

\`\`\`css
.hero, .inline-img {
  width: 100%;
  height: auto;          /* IMPORTANT: keep the ratio, don't force 500px tall */
}

.ad-slot {
  min-height: 250px;     /* the ad's usual height (e.g. 300x250 banner) */
}

/* 3. Make the fallback font take the same space as Inter
      so the swap does not reflow the text */
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%;     /* tune so Arial has Inter's width */
}
body {
  font-family: "Inter", "Inter Fallback", sans-serif;
}
\`\`\`

**Why it works:**

- With \`width\` and \`height\` attributes, the browser computes \`aspect-ratio: 1200 / 600\` **before** the file downloads. Combined with CSS \`width: 100%; height: auto\`, it reserves the correct box at any screen size. Without them, the image starts 0px tall and pushes text down when it loads.
- The ad container has a fixed minimum height, so filling it later does not move the heading.
- A fallback font with similar metrics (\`size-adjust\`) means the text takes nearly the same space before and after the web font arrives. Next.js \`next/font\` does this automatically.

**Also check:** banners/cookie bars inserted at the top (put them as overlays at the bottom instead), and animations that change \`top\`/\`height\` (use \`transform\`, which does not count as layout shift).`,
      followUps: [
        {
          q: 'Does a layout shift right after a user click count toward CLS?',
          a: 'No. Shifts within 500ms after a user input (click, tap, key press) are excluded, because the user expects the page to change. Shifts while loading or scrolling do count.',
        },
        {
          q: 'Why should you NOT lazy-load the hero image?',
          a: 'It is usually the LCP element (largest thing on screen). `loading="lazy"` delays it until layout is known, which makes LCP slower. Load it eagerly, maybe with `fetchpriority="high"` or a `<link rel="preload">`.',
        },
      ],
    },
    {
      id: 'flex-item-overflow-min-width',
      title: 'Debug: long text pushes the button out of a flex row',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'flexbox',
      question: `This user row should show the avatar, the name (cut with "..." if too long) and a "Follow" button that **always stays visible**. With a long name, the ellipsis never shows and the button is pushed outside the card. Why? Fix it.

\`\`\`html
<div class="user-row">
  <img class="avatar" src="a.jpg" alt="" width="40" height="40">
  <div class="info">
    <p class="name">Maximilian Alexander Featherstonehaugh-Wolfeschlegelstein</p>
  </div>
  <button>Follow</button>
</div>
\`\`\`

\`\`\`css
.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 320px;
}
.info {
  flex: 1;
}
.name {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
\`\`\``,
      hints: [
        'A flex item has a default minimum width. What is it — 0, or something based on its content?',
        'The default is `min-width: auto`, which for flex items means "not smaller than my content". The content is one very long unbreakable line.',
        'Also: should the avatar ever shrink?',
      ],
      solution: `**Idea:** flex items have \`min-width: auto\` by default, which means they **refuse to shrink below their content's width**. The nowrap name is very wide, so \`.info\` stays wide and pushes the button out. Allow it to shrink with \`min-width: 0\`.

\`\`\`css
.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 320px;
}

.avatar {
  flex-shrink: 0;   /* never squash the avatar */
  border-radius: 50%;
}

.info {
  flex: 1;          /* take the free space... */
  min-width: 0;     /* ...and allow shrinking below the text width (THE FIX) */
}

.name {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

button {
  flex-shrink: 0;   /* the button keeps its full size */
}
\`\`\`

**Why it works:**

- \`flex: 1\` means "grow and shrink", but shrinking stops at the item's **minimum** size. For flex items, \`min-width: auto\` = the min-content width. With \`white-space: nowrap\`, that is the whole name (~500px).
- \`min-width: 0\` lets \`.info\` shrink to whatever space is left. Now \`.name\` is narrower than its text, so \`overflow: hidden\` + \`text-overflow: ellipsis\` can kick in.
- \`flex-shrink: 0\` on the avatar and button protects them from being squeezed when space is tight.

**Same bug in Grid:** a \`1fr\` column means \`minmax(auto, 1fr)\`. Fix it with \`minmax(0, 1fr)\` or \`min-width: 0\` on the grid item.

**Same bug with long URLs** (no nowrap): use \`overflow-wrap: anywhere\` so the browser can break the word.`,
      followUps: [
        {
          q: 'Would overflow: hidden on .info also fix it?',
          a: 'Yes. For flex items, any `overflow` other than `visible` makes the automatic minimum size 0. But `min-width: 0` states the intent more clearly and does not clip focus outlines or shadows inside.',
        },
        {
          q: 'What does flex: 1 expand to?',
          a: '`flex: 1 1 0%` — grow 1, shrink 1, basis 0. All `flex: 1` siblings share the free space equally, no matter their content.',
        },
      ],
    },
    {
      id: 'margin-collapse-debug',
      title: 'Debug: the gap appears outside the box (margin collapse)',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'bfc-margin-collapse',
      question: `Two bugs in one page:

**Bug 1:** You want 40px of blue space above the heading **inside** the hero. Instead, the hero is pushed 40px down from the nav and there is **no** blue space above the heading.

**Bug 2:** The two cards have \`margin-bottom: 30px\` and \`margin-top: 20px\`. You expected a 50px gap, but it is 30px.

\`\`\`html
<nav class="nav">...</nav>
<section class="hero">
  <h1 class="hero__title">Welcome</h1>
</section>

<div class="card a">A</div>
<div class="card b">B</div>
\`\`\`

\`\`\`css
.hero { background: navy; color: white; }
.hero__title { margin-top: 40px; }

.card.a { margin-bottom: 30px; }
.card.b { margin-top: 20px; }
\`\`\`

Explain what is happening and give fixes.`,
      hints: [
        'In normal block flow, vertical margins that touch each other "collapse" into one.',
        'Between siblings, the result is the bigger margin, not the sum. Between a parent and its first child, the child margin can "leak" out of the parent if nothing separates them.',
        'Padding, a border, `display: flow-root`, or making the parent a flex/grid container stops the leak.',
      ],
      solution: `**Idea:** this is **margin collapsing**. Vertical margins of block elements in normal flow merge when they touch. The merged margin = the **largest** one (not the sum).

\`\`\`text
Bug 1 — parent / first child:
  .hero has no padding, no border  -> the h1's 40px top margin touches
  the hero's own top margin -> they merge and the 40px ends up OUTSIDE
  the hero (above the blue box).

Bug 2 — siblings:
  30px (bottom of A) and 20px (top of B) touch -> max(30, 20) = 30px.
\`\`\`

**Fixes for bug 1** (pick one):

\`\`\`css
/* Best: use padding for space INSIDE a box */
.hero { padding-top: 40px; }
.hero__title { margin-top: 0; }

/* Or: make the hero a new block formatting context (BFC) */
.hero { display: flow-root; }  /* margins can't leak out of a BFC */

/* Or: flex / grid containers never collapse margins with children */
.hero { display: flex; flex-direction: column; }
\`\`\`

**Fixes for bug 2:**

\`\`\`css
/* Use a single direction for margins (e.g. only margin-bottom) — simplest */
.card { margin: 0 0 1.5rem; }

/* Or: put the cards in a flex/grid container and use gap (no collapsing) */
.cards {
  display: grid;
  gap: 50px;
}
\`\`\`

**Why it works:** collapsing only happens between **block** boxes in normal flow when **nothing** (padding, border, inline content, clearance) sits between the margins. Padding/border separate them. A new BFC (\`flow-root\`, \`overflow\` other than visible, flex/grid containers) keeps child margins inside. In flex and grid layouts, margins never collapse, and \`gap\` is the modern way to space items.

**Rules to remember:** only **vertical** margins collapse, never horizontal. Margins of floats, absolutely positioned and inline-block elements do not collapse.`,
      followUps: [
        {
          q: 'Can an empty element collapse its own margins?',
          a: 'Yes. An empty block with no height, padding or border lets its top and bottom margins collapse into one (the bigger), and that can also merge with neighbours.',
        },
        {
          q: 'What happens with a negative margin in a collapse?',
          a: 'The result is the largest positive margin plus the most negative one. E.g. 30px and -10px collapse to 20px.',
        },
      ],
    },
    {
      id: 'mobile-100vh-bug',
      title: 'Debug: 100vh hero is cut off on mobile',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'css-units',
      question: `Your full-screen hero has a "Get started" button at the bottom. On desktop it is perfect. On iPhone Safari and Android Chrome, the button is **hidden behind the browser's address/tool bar** until the user scrolls. Why, and how do you fix it?

\`\`\`css
.hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
\`\`\``,
      hints: [
        'Mobile browsers show and hide their toolbars when you scroll. So the visible height changes. Which of those heights does `vh` use?',
        'On mobile, `100vh` = the height when the toolbars are **hidden** (the largest size).',
        'New units exist: `svh`, `lvh`, `dvh` (small, large, dynamic viewport height).',
      ],
      solution: `**Idea:** on mobile, \`100vh\` is the viewport height **with the toolbars hidden** (the biggest possible). When the page first loads, the toolbars are visible, so the real visible area is smaller and the bottom of the hero sits behind them. Use the new viewport units.

\`\`\`css
.hero {
  /* Fallback for old browsers */
  min-height: 100vh;
  /* Modern browsers: the height that is visible right now */
  min-height: 100dvh;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* Respect the iPhone home-indicator area */
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
\`\`\`

\`\`\`html
<!-- Needed for env(safe-area-inset-*) to have values on iPhone -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
\`\`\`

**The three new units:**

\`\`\`text
svh  small  viewport height  = toolbars SHOWN   (smallest, never hidden behind bars)
lvh  large  viewport height  = toolbars HIDDEN  (same as old vh on mobile)
dvh  dynamic viewport height = changes live as toolbars show / hide
\`\`\`

**Why it works:** the browser reads declarations top to bottom; old browsers ignore \`100dvh\` (unknown value) and keep \`100vh\`. Modern browsers use \`dvh\`, which matches the visible area. Using \`min-height\` instead of \`height\` lets the hero grow if the content is taller (small phones, large font settings).

**Which unit to choose:**

- \`dvh\` — fits exactly, but the element resizes while the user scrolls (can cause jank / re-layout).
- \`svh\` — stable and always fully visible. Good default for a hero.
- The old JS hack (\`--vh\` from \`window.innerHeight\` on resize) is no longer needed.`,
      followUps: [
        {
          q: 'Does 100vw have a similar problem?',
          a: 'On desktop, yes: `100vw` includes the vertical scrollbar width, so a `width: 100vw` element causes a horizontal scrollbar. Use `width: 100%` instead.',
        },
        {
          q: 'How do you handle the on-screen keyboard covering an input?',
          a: 'Viewport units do not shrink for the keyboard by default. Use the `interactive-widget=resizes-content` viewport setting (Chrome) or the `visualViewport` JS API, and scroll the focused input into view.',
        },
      ],
    },
    {
      id: 'accessible-form-errors',
      title: 'Accessible sign-up form with hints and error messages',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'forms-validation',
      question: `Build a sign-up form (email + password) where:

- every input has a visible label,
- each input has a hint ("At least 8 characters") that screen readers also read,
- on submit, invalid fields show a **custom** error message under the input (not the browser's default bubble),
- screen-reader users hear the error, and focus moves to the **first** invalid field,
- the errors update while the user fixes them.

Use plain HTML + CSS + a little JavaScript (no libraries).`,
      hints: [
        '`<label for="id">` connects a label to an input. `aria-describedby` connects extra text (hint, error) — it can list several ids.',
        'Keep the browser rules (`required`, `type="email"`, `minlength`) but add `novalidate` on the form so you can show your own messages. Read `input.validity` to know what is wrong.',
        'Set `aria-invalid="true"` on bad fields. Focusing the first invalid input makes the screen reader read its label, its error and its hint.',
      ],
      solution: `**Idea:** use real labels, link hint and error text with \`aria-describedby\`, keep native validation rules but show your own messages, and move focus to the first error.

\`\`\`html
<form id="signup" novalidate>
  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required
           aria-describedby="email-error">
    <p id="email-error" class="error"></p>
  </div>

  <div class="field">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="new-password"
           required minlength="8"
           aria-describedby="password-hint password-error">
    <p id="password-hint" class="hint">At least 8 characters.</p>
    <p id="password-error" class="error"></p>
  </div>

  <button type="submit">Create account</button>
</form>
\`\`\`

\`\`\`css
.field { display: grid; gap: 0.25rem; margin-bottom: 1rem; }
.hint  { margin: 0; color: #4b5563; font-size: 0.875rem; }
.error { margin: 0; color: #b91c1c; font-size: 0.875rem; }
.error:empty { display: none; }               /* no empty gap when valid */

input[aria-invalid="true"] {
  border-color: #b91c1c;                      /* not ONLY colour: the text explains too */
}
input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
\`\`\`

\`\`\`javascript
const form = document.getElementById('signup');

// Our own messages for each kind of problem
const messages = {
  email: {
    valueMissing: 'Enter your email address.',
    typeMismatch: 'Enter an email like name@example.com.',
  },
  password: {
    valueMissing: 'Enter a password.',
    tooShort: 'Password must be at least 8 characters.',
  },
};

function validateField(input) {
  const errorEl = document.getElementById(input.id + '-error');
  const fieldMessages = messages[input.name];

  // Find the first failing rule, e.g. "valueMissing"
  const failed = Object.keys(fieldMessages).find((rule) => input.validity[rule]);

  if (failed) {
    errorEl.textContent = fieldMessages[failed];
    input.setAttribute('aria-invalid', 'true');
    return false;
  }
  errorEl.textContent = '';
  input.removeAttribute('aria-invalid');
  return true;
}

form.addEventListener('submit', (event) => {
  const inputs = [...form.querySelectorAll('input')];
  const results = inputs.map(validateField);         // validate ALL fields

  if (results.includes(false)) {
    event.preventDefault();
    inputs[results.indexOf(false)].focus();          // go to the first error
  }
});

// Update errors live, but only after the user has already seen them
form.addEventListener('input', (event) => {
  if (event.target.getAttribute('aria-invalid') === 'true') {
    validateField(event.target);
  }
});
\`\`\`

**Why it works:**

- \`<label for>\` gives the input an accessible name, and clicking the label focuses the input (bigger tap target).
- \`aria-describedby="password-hint password-error"\` makes screen readers read both texts after the label. When the error is empty it adds nothing.
- \`novalidate\` turns off the default bubbles, but \`required\`, \`type="email"\` and \`minlength\` still fill \`input.validity\`, so we reuse the browser's rules.
- Focusing the first invalid input announces: "Password, edit text, invalid, Password must be at least 8 characters. At least 8 characters."
- \`aria-invalid\` drives the red border, so state and style never get out of sync. The text message means we do not rely on colour alone.
- Live re-validation only for fields already marked invalid — so we do not shout "invalid email" while the user is still typing the first letters.

**Always validate on the server too** — client checks are only for user experience.`,
      followUps: [
        {
          q: 'Why not put role="alert" on every error message?',
          a: 'With 5 errors, the screen reader would interrupt itself 5 times at once. Moving focus to the first invalid field is calmer. For long forms, show an error summary at the top (a list of links to each field) and focus that summary.',
        },
        {
          q: 'Is a placeholder a valid replacement for a label?',
          a: 'No. Placeholders disappear when you type, often have low contrast, and are not reliably announced as the name. Use a visible label; a placeholder can show an example value.',
        },
        {
          q: 'How does this map to React Hook Form?',
          a: 'Same ideas: `register` the input, show `errors.email.message` in an element with an id, and set `aria-invalid={!!errors.email}` and `aria-describedby`. RHF focuses the first invalid field by default (`shouldFocusError: true`).',
        },
      ],
    },
    {
      id: 'mobile-first-responsive-navbar',
      title: 'Mobile-first navbar with an accessible hamburger menu',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'mobile-first',
      question: `Build a site header:

- **Mobile (< 768px):** logo on the left, a hamburger button on the right. Tapping it shows the links stacked vertically under the header.
- **Desktop (>= 768px):** no hamburger; links shown in a row on the right.
- Accessible: screen readers know if the menu is open, Escape closes it, keyboard focus is visible.
- Write the CSS **mobile first**.
- If JavaScript fails to load, users must still reach the links.`,
      hints: [
        'Mobile first = base CSS is for phones, then `@media (min-width: 768px)` adds desktop styles.',
        'The button needs `aria-expanded="true/false"` and `aria-controls="<nav id>"`. You can style the menu from the button state with `[aria-expanded="true"] + .nav`.',
        'For the no-JS case: only hide the menu when JS is running — e.g. add a `js` class to `<html>` from a script and scope the hiding rule to `.js`.',
      ],
      solution: `**Idea:** one source of truth — the button's \`aria-expanded\` attribute. JS only flips that attribute; CSS shows/hides the menu based on it. Base styles are for mobile; the media query upgrades to desktop.

\`\`\`html
<html class="no-js">
<head>
  <!-- Runs immediately: marks that JS is available -->
  <script>document.documentElement.className = 'js';</script>
</head>
<body>
  <header class="site-header">
    <a class="logo" href="/">Shop</a>

    <button class="menu-toggle" type="button"
            aria-expanded="false" aria-controls="primary-nav">
      <span class="visually-hidden">Menu</span>
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>

    <nav id="primary-nav" class="nav" aria-label="Main">
      <ul class="nav__list">
        <li><a href="/" aria-current="page">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
</body>
</html>
\`\`\`

\`\`\`css
/* ---------- Mobile (base) ---------- */
.site-header {
  display: flex;
  flex-wrap: wrap;                 /* lets the nav drop to a new line */
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}

.menu-toggle {
  display: none;                   /* no JS = no button (it could not work) */
  background: none;
  border: 0;
  padding: 0.5rem;                 /* 24px icon + padding = 40px+ tap target */
  cursor: pointer;
}
.js .menu-toggle { display: inline-flex; }

.nav {
  flex-basis: 100%;                /* full-width row under logo + button */
}
.js .nav { display: none; }        /* hide only when JS can open it */
.js .menu-toggle[aria-expanded="true"] + .nav { display: block; }

.nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.nav__list a {
  display: block;
  padding: 0.75rem 0;              /* big tap targets on phones */
}
.nav__list a[aria-current="page"] { font-weight: 700; }

.menu-toggle:focus-visible,
.nav__list a:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* ---------- Desktop ---------- */
@media (min-width: 768px) {
  .js .menu-toggle { display: none; }
  .nav,
  .js .nav {
    display: block;                /* always visible, whatever the button state */
    flex-basis: auto;
  }
  .nav__list {
    flex-direction: row;
    gap: 1.5rem;
  }
  .nav__list a { padding: 0.5rem 0; }
}

.visually-hidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
\`\`\`

\`\`\`javascript
const toggle = document.querySelector('.menu-toggle');

function setOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
}

toggle.addEventListener('click', () => {
  setOpen(toggle.getAttribute('aria-expanded') !== 'true');
});

// Escape closes the menu and puts focus back on the button
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    toggle.focus();
  }
});
\`\`\`

**Why it works:**

- **Mobile first:** phones get the simple base CSS; desktops add a few rules with \`min-width\`. Less CSS to override, and phones do not download/parse desktop-only layout first.
- **\`aria-expanded\`** tells screen readers "Menu, button, collapsed/expanded". Styling from the same attribute means the visual state and the announced state can never disagree.
- **\`.js\` scoping** = progressive enhancement. Without JS, the button is hidden and the links are simply shown stacked — still usable.
- **Specificity check:** on desktop, \`.js .nav\` (0,2,0) beats the base \`.js .nav\` hide rule because it comes later in the file with equal specificity. The \`[aria-expanded="true"]\` rule also says \`block\`, so no conflict.
- A real \`<button>\` gives Enter/Space and focus for free; the SVG is \`aria-hidden\` and the hidden "Menu" text is the accessible name.`,
      followUps: [
        {
          q: 'Should the menu trap focus like a modal?',
          a: 'Not for a simple dropdown nav under the header — the rest of the page is still usable. If it becomes a full-screen overlay that covers the page, treat it like a modal: trap focus, make the background `inert`, and close on Escape.',
        },
        {
          q: 'Why min-width media queries instead of max-width?',
          a: 'With `min-width` the base styles serve the smallest screens and you **add** complexity as space grows. With `max-width` you write desktop first and then **undo** things for mobile, which leads to more overrides and specificity fights.',
        },
        {
          q: 'How would you animate the menu opening?',
          a: '`display` cannot transition in older browsers. Use `grid-template-rows: 0fr -> 1fr` on a wrapper with `overflow: hidden`, or transform/opacity. Turn the animation off inside `prefers-reduced-motion: reduce`.',
        },
      ],
    },
    {
      id: 'modal-behind-header-stacking-context',
      title: 'Debug: modal with z-index 9999 shows behind the header',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'z-index-stacking-context',
      question: `The modal's backdrop has \`z-index: 9999\`, but the sticky header (\`z-index: 100\`) is still drawn **on top** of it. Raising the modal to \`z-index: 999999\` does not help. Explain why and fix it.

\`\`\`html
<header class="header">Logo</header>

<main class="page">
  <!-- product list... -->
  <div class="backdrop">
    <div class="modal" role="dialog" aria-modal="true">Are you sure?</div>
  </div>
</main>
\`\`\`

\`\`\`css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.page {
  position: relative;
  z-index: 1;          /* added last year to fix a dropdown bug */
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgb(0 0 0 / 0.5);
}
\`\`\`

Bonus: a teammate "fixes" it by changing \`.page\` to \`transform: translateZ(0)\` (no z-index). Now the backdrop no longer covers the whole screen. Why?`,
      hints: [
        'z-index is not global. It only compares elements inside the same **stacking context**.',
        'Which properties create a new stacking context? (`position` + `z-index`, `opacity < 1`, `transform`, `filter`, `isolation: isolate`, ...)',
        'If `.page` is "layer 1" and the header is "layer 100", can anything inside `.page` ever go above the header?',
      ],
      solution: `**Idea:** \`.page\` has \`position: relative; z-index: 1\`, so it creates a **stacking context**. Everything inside it — including the backdrop — is flattened into \`.page\`'s layer, which is \`z-index: 1\`. The header is \`100\` in the root context. \`1 < 100\`, so the whole page (with the modal) is under the header. The 9999 only counts **inside** \`.page\`.

\`\`\`text
Root stacking context
├── .header   z-index: 100         <- drawn on top
└── .page     z-index: 1           <- a closed "box"
     └── .backdrop z-index: 9999   <- only competes with siblings inside .page
\`\`\`

**Fix 1 (best in React): render the modal outside \`.page\`** — at the end of \`<body>\` with a portal.

\`\`\`jsx
import { createPortal } from 'react-dom';

function ConfirmModal({ open, children }) {
  if (!open) return null;
  // Rendered as a direct child of <body>, so it lives in the ROOT stacking context
  return createPortal(
    <div className="backdrop">
      <div className="modal" role="dialog" aria-modal="true">{children}</div>
    </div>,
    document.body
  );
}
\`\`\`

**Fix 2 (modern HTML): use \`<dialog>\` with \`showModal()\`** — it goes into the browser's **top layer**, which is above every z-index on the page, no matter where the element is in the DOM.

\`\`\`html
<dialog id="confirm">
  <p>Are you sure?</p>
  <form method="dialog"><button>Close</button></form>
</dialog>
<script>document.getElementById('confirm').showModal();</script>
\`\`\`

\`\`\`css
dialog::backdrop {
  background: rgb(0 0 0 / 0.5);   /* the top layer has its own backdrop */
}
\`\`\`

\`showModal()\` also gives focus trapping, Escape to close and makes the rest of the page inert.

**Fix 3 (if you must keep the markup):** remove \`z-index: 1\` from \`.page\` (or fix the old dropdown another way) so \`.page\` stops being a stacking context.

**Bonus answer — \`transform\`:** a \`transform\` (also \`filter\`, \`perspective\`, \`contain: paint\`) does two things: it creates a stacking context **and** it becomes the **containing block for \`position: fixed\` children**. So \`.backdrop\` with \`position: fixed; inset: 0\` now fills \`.page\`, not the viewport, and it scrolls with the page.

**Why it works:** the browser paints in layers. A stacking context is a sealed group; its children are sorted inside it, then the whole group is placed among its siblings using the group's own z-index. To be above the header, the modal must be in the same (or a higher) context as the header — the root, or the top layer.`,
      followUps: [
        {
          q: 'List some properties that create a stacking context.',
          a: '`position` relative/absolute with a `z-index` other than `auto`; `position: fixed` or `sticky`; flex/grid children with `z-index`; `opacity` < 1; `transform`, `filter`, `backdrop-filter`, `perspective`, `clip-path`, `mask`; `isolation: isolate`; `mix-blend-mode`; `will-change` on those properties; `contain: layout/paint`.',
        },
        {
          q: 'How do you stop z-index wars in a big codebase?',
          a: 'Keep a small z-index scale in tokens (e.g. `--z-dropdown: 10; --z-sticky: 100; --z-modal: 1000; --z-toast: 1100`), render overlays through portals or the top layer, and use `isolation: isolate` on components so their inner z-indexes stay local.',
        },
      ],
    },
    {
      id: 'scss-breakpoint-mixin-bem-button',
      title: 'SCSS breakpoint mixin + BEM button with variants',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'scss-mixins-extend-use',
      question: `Your team uses SCSS (Dart Sass, \`@use\` modules) and BEM. Write:

1. A **breakpoint mixin** so developers write \`@include up(md) { ... }\` instead of raw media queries. It must **fail the build** on an unknown name like \`up(tablet)\`.
2. A **BEM button** with:
   - block \`.btn\`, element \`.btn__icon\`,
   - colour modifiers \`--primary\`, \`--secondary\`, \`--danger\` generated from **one map** (no copy-paste),
   - size modifiers \`--sm\`, \`--lg\`,
   - \`--block\` = full width on mobile, normal width from \`md\` up,
   - proper disabled and keyboard-focus styles.

\`\`\`html
<button class="btn btn--primary btn--lg">
  <svg class="btn__icon" aria-hidden="true">...</svg>
  Save
</button>
\`\`\``,
      hints: [
        'Store breakpoints in a map and read them with `map.get` (from `@use "sass:map"`). Use `@error` when the value is null, and `@content` for the block the caller passes in.',
        'Inside `.btn { }`, `&--#{$name}` produces `.btn--primary`. Loop over a map of maps with `@each $name, $colors in $variants`.',
        'Hover should not apply to disabled buttons: `&:hover:not(:disabled)`. Use `:focus-visible` for a keyboard-only focus ring.',
      ],
      solution: `**Idea:** keep design values in maps, generate repeated CSS with \`@each\`, and wrap media queries in a mixin with \`@content\`. BEM gives flat, predictable class names (all specificity 0,1,0).

\`\`\`scss
// _breakpoints.scss
@use 'sass:map';

$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
);

// Mobile-first: styles apply from this width UP
@mixin up($name) {
  $value: map.get($breakpoints, $name);

  @if $value == null {
    // Stops the build with a clear message
    @error "Unknown breakpoint '#{$name}'. Use one of: #{map.keys($breakpoints)}";
  }

  @media (min-width: $value) {
    @content; // the styles the caller wrote inside { }
  }
}
\`\`\`

\`\`\`scss
// _button.scss
@use 'sass:map';
@use 'breakpoints' as bp;

$variants: (
  primary:   (bg: #2563eb, text: #ffffff, hover: #1d4ed8),
  secondary: (bg: #e5e7eb, text: #111827, hover: #d1d5db),
  danger:    (bg: #dc2626, text: #ffffff, hover: #b91c1c),
);

.btn {
  // Block: shared base styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  font-weight: 600;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 150ms ease;

  // Element
  &__icon {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
  }

  // Colour modifiers, generated from the map
  @each $name, $colors in $variants {
    &--#{$name} {
      background-color: map.get($colors, bg);
      color: map.get($colors, text);

      &:hover:not(:disabled) {
        background-color: map.get($colors, hover);
      }
    }
  }

  // Size modifiers
  &--sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
  &--lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  // Full width on phones, normal width from md
  &--block {
    width: 100%;

    @include bp.up(md) {
      width: auto;
    }
  }

  // States
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
\`\`\`

**Compiled output (part of it):**

\`\`\`css
.btn--primary { background-color: #2563eb; color: #ffffff; }
.btn--primary:hover:not(:disabled) { background-color: #1d4ed8; }
.btn--block { width: 100%; }
@media (min-width: 768px) { .btn--block { width: auto; } }
\`\`\`

**Why it works:**

- \`@content\` injects the caller's block inside the media query, so \`@include bp.up(md) { width: auto; }\` becomes a real \`@media\` rule (Sass "bubbles" it out of \`.btn--block\`).
- \`@error\` makes a typo like \`up(tablet)\` fail at compile time instead of silently doing nothing.
- \`&--#{$name}\` uses interpolation to build class names, so adding a new variant = one new line in the map.
- With BEM every selector is one class (0,1,0), so modifiers win by **order** and you never need \`!important\` or deep nesting.
- \`@use ... as bp\` namespaces the mixin (\`bp.up\`), so names from different files never clash (the old \`@import\` is deprecated).`,
      followUps: [
        {
          q: 'Mixin vs @extend — when to use which?',
          a: 'A mixin copies the declarations (can take arguments, works inside media queries). `@extend` adds your selector to another rule\'s selector list (smaller CSS, but can create surprising selector chains and cannot extend across media queries). Most teams prefer mixins or plain shared classes.',
        },
        {
          q: 'How would you make the colours themeable at runtime (dark mode)?',
          a: 'Sass variables disappear after compile. Output CSS custom properties instead: `.btn--primary { background: var(--btn-primary-bg); }` and set `--btn-primary-bg` per theme. Sass can still generate those variables from the map.',
        },
      ],
    },
    {
      id: 'dark-mode-css-variables-no-flash',
      title: 'Dark mode with CSS variables, system default and no flash',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'css-variables',
      question: `Design a theming setup for a website with these requirements:

1. Colours are defined **once** as CSS variables; components never hard-code colours.
2. By default, follow the user's **OS setting** (light/dark).
3. A toggle lets the user choose **System / Light / Dark**; the choice is saved.
4. No "flash" of the wrong theme when the page loads (e.g. white screen for a dark-mode user).
5. Native controls (scrollbars, inputs, checkboxes) also match the theme.`,
      hints: [
        'Put semantic tokens (`--color-bg`, `--color-text`) on `:root`, and override them for dark mode.',
        'Use `@media (prefers-color-scheme: dark)` for the system default, and a `data-theme` attribute on `<html>` for the user\'s explicit choice.',
        'The flash happens because JS that reads localStorage runs after the first paint. Put a tiny blocking `<script>` in `<head>` that sets `data-theme` before the body renders. `color-scheme` handles native controls.',
      ],
      solution: `**Idea:** semantic CSS variables + three layers of priority: explicit user choice (\`data-theme\` on \`<html>\`) > OS setting (\`prefers-color-scheme\`) > light default. A tiny inline script applies the saved choice **before** the first paint.

\`\`\`html
<head>
  <!-- Runs before the body is painted: no flash -->
  <script>
    try {
      var saved = localStorage.getItem('theme');           // 'light' | 'dark' | null
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.dataset.theme = saved;
      }
    } catch (e) { /* storage blocked: just follow the OS */ }
  </script>
  <link rel="stylesheet" href="/styles.css">
</head>
\`\`\`

\`\`\`css
/* 1. Light tokens (default) */
:root {
  color-scheme: light dark;        /* native controls follow the OS by default */
  --color-bg: #ffffff;
  --color-surface: #f3f4f6;
  --color-text: #111827;
  --color-muted: #4b5563;
  --color-primary: #2563eb;
  --color-border: #e5e7eb;
}

/* 2. Dark tokens — used for the OS setting, unless the user forced light */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #0b1120;
    --color-surface: #1f2937;
    --color-text: #f9fafb;
    --color-muted: #9ca3af;
    --color-primary: #60a5fa;      /* lighter blue for contrast on dark */
    --color-border: #374151;
  }
}

/* 3. Explicit user choice */
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-bg: #0b1120;
  --color-surface: #1f2937;
  --color-text: #f9fafb;
  --color-muted: #9ca3af;
  --color-primary: #60a5fa;
  --color-border: #374151;
}
:root[data-theme="light"] {
  color-scheme: light;
}

/* Components only use tokens */
body {
  background: var(--color-bg);
  color: var(--color-text);
}
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
\`\`\`

\`\`\`javascript
// Toggle: value is 'system' | 'light' | 'dark'
function setTheme(choice) {
  const root = document.documentElement;
  if (choice === 'system') {
    delete root.dataset.theme;               // fall back to prefers-color-scheme
    localStorage.removeItem('theme');
  } else {
    root.dataset.theme = choice;
    localStorage.setItem('theme', choice);
  }
}
\`\`\`

**Why it works:**

- **Semantic names** (\`--color-surface\`, not \`--gray-100\`) mean components do not care which theme is active. Switching theme = changing ~6 variables in one place.
- **Priority:** \`:root[data-theme="dark"]\` and the media query both beat plain \`:root\` (higher specificity / later). \`:not([data-theme="light"])\` stops the OS dark rule when the user picked light.
- **No flash:** an inline script in \`<head>\` is **blocking**, so \`data-theme\` is set before the body paints. A React \`useEffect\` would run after paint — too late.
- **\`color-scheme\`** tells the browser to draw scrollbars, form controls and the default page background in the right theme.
- The dark values are duplicated once (media query + attribute). The modern \`light-dark()\` CSS function removes that: \`--color-bg: light-dark(#ffffff, #0b1120);\` picks a value based on the active \`color-scheme\` (Baseline since 2024).

**In Next.js:** the \`next-themes\` package does exactly this (inline script + \`data-theme\`/class), and you add \`suppressHydrationWarning\` on \`<html>\` because the attribute differs between server and client.`,
      followUps: [
        {
          q: 'Why not store the theme in a cookie instead?',
          a: 'A cookie lets the **server** render the right `data-theme` directly in the HTML, so you need no inline script and no hydration mismatch. It is a good choice for SSR apps; localStorage is simpler for static sites.',
        },
        {
          q: 'What about images and shadows in dark mode?',
          a: 'Shadows barely show on dark backgrounds — use lighter surfaces or borders for depth. For images, use `<picture>` with `<source media="(prefers-color-scheme: dark)">` for logos, or lower brightness slightly with a token-based `filter`.',
        },
        {
          q: 'How do you make sure dark mode colours are accessible?',
          a: 'Check contrast for every text/background token pair (4.5:1 for normal text, 3:1 for large text and UI borders). Avoid pure #000 with pure #fff — very high contrast causes glare; slightly softer values read better.',
        },
      ],
    },
  ],
};
