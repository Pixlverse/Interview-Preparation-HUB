// HTML5, CSS3 & SCSS — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'html-css',
  title: 'HTML5, CSS3 & SCSS',
  icon: '🎨',
  description: 'The building blocks of every web page. Semantic HTML and accessibility first, then layout (box model, flexbox, grid), responsive design, SCSS, and how the browser actually paints your page.',
  definitionTitle: 'What are HTML, CSS and SCSS?',
  definition: `- **HTML (HyperText Markup Language)** describes the **structure and meaning** of a page: headings, paragraphs, buttons, forms, images.
- **CSS (Cascading Style Sheets)** describes how that page **looks**: colours, sizes, spacing, layout (Flexbox, Grid) and animations.
- **SCSS** is a more powerful way to write CSS. It adds variables, nesting, mixins and file splitting, and is compiled into normal CSS.

Think of a house: HTML is the walls and rooms, CSS is the paint and furniture, SCSS is a smarter toolkit for doing the painting.

**One-line answer:** "HTML gives a page its structure and meaning, CSS controls how it looks and is laid out, and SCSS is a CSS preprocessor that adds variables, nesting and mixins."`,
  topics: [
    {
      id: 'semantic-html',
      title: 'Semantic HTML',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Use tags that describe the meaning of the content (header, nav, main, article, button) instead of div for everything.',
      what: `**Semantic HTML** means choosing the HTML tag that says **what the content is**, not only how it looks.

- \`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\` describe page areas.
- \`<article>\` is a stand-alone piece (a blog post, a product card). \`<section>\` is a group of related content with a heading.
- \`<button>\` is for actions, \`<a>\` is for navigation (going to another URL).
- A \`<div>\` or \`<span>\` has **no meaning**. It is just a box.

#### Deeper version
Browsers build an **accessibility tree** from your HTML. Each semantic tag gives an element a **role** (for example \`<nav>\` has role "navigation", \`<button>\` has role "button"). Screen readers use these roles to let users jump between landmarks, list all headings, or press a button with the keyboard. A \`<div onclick>\` has no role, is not focusable with Tab, and does not react to Enter or Space — you would have to rebuild all of that by hand with \`role\`, \`tabindex\` and key handlers. Headings (\`<h1>\`–\`<h6>\`) should form a logical outline: one \`<h1>\` per page, and do not skip levels just to get a smaller font.`,
      why: `- **Accessibility:** screen readers and keyboard users get correct behaviour for free.
- **SEO:** search engines understand which part is the main content, the navigation, the article title.
- **Readable code:** \`<nav>\` is easier to understand than \`<div class="nav-wrapper-2">\`.
- **Less code:** a real \`<button>\` already handles focus, Enter, Space and disabled state.`,
      analogy: `A semantic page is like a book with a real table of contents, chapter titles and an index. A page of only \`<div>\`s is like a book where every line is the same plain text — a human can guess the structure, but a blind reader or a search engine cannot.`,
      code: [
        {
          title: 'A semantic page layout',
          lang: 'html',
          code: `<body>
  <header>
    <a href="/" class="logo">ShopNow</a>
    <nav aria-label="Main">
      <ul>
        <li><a href="/products">Products</a></li>
        <li><a href="/cart">Cart</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <h1>Running Shoes</h1>
    <article>
      <h2>Air Runner 2</h2>
      <p>Light shoe for daily runs.</p>
      <button type="button">Add to cart</button>
    </article>
  </main>

  <footer>
    <p>&copy; 2026 ShopNow</p>
  </footer>
</body>`,
        },
        {
          title: 'div vs button',
          lang: 'html',
          code: `<!-- Bad: no role, not focusable, Enter key does nothing -->
<div class="btn" onclick="save()">Save</div>

<!-- Good: focusable, works with Enter/Space, announced as "button" -->
<button type="button" onclick="save()">Save</button>`,
        },
      ],
      output: `The first page looks the same as a div-only page, but now a screen reader can say "navigation landmark", "main landmark", "heading level 1: Running Shoes". A user can jump straight to \`<main>\` and skip the menu. Google sees the \`<h1>\` and the \`<article>\` as the important content.

In the second example the \`<div>\` cannot be reached with the Tab key and pressing Enter does nothing. The \`<button>\` works with the mouse, Tab, Enter and Space with zero extra code.`,
      questions: [
        {
          q: 'What is semantic HTML and why does it matter?',
          a: 'Using tags that describe meaning, like `<nav>`, `<main>`, `<article>` and `<button>`. It helps accessibility (screen readers get roles and landmarks), SEO, and code readability.',
        },
        {
          q: 'What is the difference between `<section>` and `<article>`?',
          a: '`<article>` is content that makes sense on its own and could be shared alone (a post, a comment, a product card). `<section>` groups related content inside a page and usually has a heading.',
        },
        {
          q: 'When do you use `<a>` vs `<button>`?',
          a: '`<a href>` when the user goes to another URL (navigation). `<button>` when the user does an action on the same page (submit, open modal, add to cart).',
        },
        {
          q: 'What is wrong with `<div onClick>` in React?',
          a: 'It is not focusable, not announced as a button, and does not respond to Enter/Space. Use a real `<button>` instead.',
        },
      ],
      spoken: `"Semantic HTML means using tags that describe what the content is — like header, nav, main, article and button — instead of putting divs everywhere. The browser uses these tags to build the accessibility tree, so screen readers can announce landmarks and headings, and keyboard users get focus and Enter key support for free. It also helps SEO because search engines can find the main content and titles. In my React projects I always use a real button for actions and an anchor or Link for navigation, and I keep one h1 per page with a logical heading order."`,
      mistakes: [
        'Using `<div>` or `<span>` with `onClick` for buttons. You lose keyboard support and the button role.',
        'Choosing heading tags by font size (jumping from `<h1>` to `<h4>`). Pick the level by structure and style it with CSS.',
        'Using `<a>` without `href` as a button, or `<button>` to navigate to another page.',
        'Follow-up trap: "Does semantic HTML change how the page looks?" Mostly no. The value is meaning for browsers, assistive tech and search engines, not visuals.',
      ],
      takeaway: 'Pick the tag that describes the meaning — you get accessibility, SEO and keyboard support for free.',
    },
    {
      id: 'html5-features',
      title: 'HTML5 Essentials: doctype, data attributes, media, storage',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'What HTML5 added: a simple doctype, semantic tags, native audio/video/canvas, new input types, data-* attributes, and web storage APIs.',
      what: `**HTML5** is the current living standard of HTML. The main things it brought:

- **Simple doctype:** \`<!DOCTYPE html>\` — tells the browser to use **standards mode** (not old "quirks mode").
- **Semantic tags:** \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<footer>\`, \`<figure>\`.
- **Native media:** \`<video>\`, \`<audio>\` (no Flash plugin), \`<canvas>\` and inline \`<svg>\` for graphics.
- **New input types:** \`email\`, \`date\`, \`number\`, \`range\`, \`color\`, plus validation attributes like \`required\`.
- **data-* attributes:** store custom data on an element: \`<button data-product-id="42">\`.
- **Web APIs** that came with it: \`localStorage\`, \`sessionStorage\`, Geolocation, Web Workers, drag and drop, history API.

#### Deeper version
- **Quirks mode:** without the doctype, browsers emulate old buggy behaviour (for example, a different box model on some elements). Always start with \`<!DOCTYPE html>\`.
- **data-* in JavaScript:** \`el.dataset.productId\` (dashes become camelCase). In CSS: \`[data-state="open"]\` selectors — many headless UI libraries style states this way.
- **localStorage vs sessionStorage vs cookies:** localStorage persists until cleared (about 5MB per origin, synchronous, strings only). sessionStorage lasts for one tab session. Cookies are small (about 4KB), sent to the server on every request, and can be \`HttpOnly\` (not readable by JS). Never put auth tokens in localStorage if you can avoid it — any XSS can read them; an \`HttpOnly\` cookie is safer.
- \`<dialog>\` (with \`showModal()\`) and \`<details>\`/\`<summary>\` give native modals and accordions with built-in accessibility.`,
      why: `Interviewers ask "what is new in HTML5" and "localStorage vs cookies" to check fundamentals. Native elements like \`<dialog>\`, \`<details>\` and \`<video>\` save a lot of JavaScript and are accessible by default.`,
      analogy: `HTML5 is like a phone getting a big update: features that needed separate apps (plugins like Flash, jQuery date pickers) now come built in — camera, video player, calendar.`,
      code: [
        {
          title: 'HTML5 page skeleton with native elements',
          lang: 'html',
          code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Demo</title>
</head>
<body>
  <video src="/intro.mp4" controls width="640" poster="/intro.jpg">
    Your browser does not support video.
  </video>

  <details>
    <summary>Shipping info</summary>
    <p>Free shipping on orders over $50.</p>
  </details>

  <button data-product-id="42" data-variant="red">Add to cart</button>

  <dialog id="confirm">
    <p>Added to cart!</p>
    <form method="dialog"><button>Close</button></form>
  </dialog>
</body>
</html>`,
        },
        {
          title: 'dataset, dialog and storage in JavaScript',
          lang: 'javascript',
          code: `const btn = document.querySelector('[data-product-id]');
const dialog = document.querySelector('#confirm');

btn.addEventListener('click', () => {
  const { productId, variant } = btn.dataset;   // "42", "red" (always strings)

  const cart = JSON.parse(localStorage.getItem('cart') ?? '[]');
  cart.push({ productId: Number(productId), variant });
  localStorage.setItem('cart', JSON.stringify(cart)); // storage holds strings only

  dialog.showModal(); // native modal: focus moves in, Escape closes it
});`,
        },
      ],
      output: `The page renders in standards mode thanks to the doctype. The video has native play controls with no library. The "Shipping info" line expands and collapses on click or Enter with zero JavaScript.

Clicking "Add to cart" reads \`productId\` and \`variant\` from the data attributes, saves the cart to \`localStorage\` as a JSON string (it survives page reloads), and opens the native dialog. The dialog's \`<form method="dialog">\` closes it when the button is clicked, and Escape also closes it.`,
      questions: [
        {
          q: 'What does `<!DOCTYPE html>` do?',
          a: 'It tells the browser to render in standards mode. Without it, browsers use quirks mode, which copies old, inconsistent behaviour.',
        },
        {
          q: 'localStorage vs sessionStorage vs cookies?',
          a: 'localStorage persists until cleared; sessionStorage lasts for the tab session; both are about 5MB and not sent to the server. Cookies are small, sent with every request, and can be HttpOnly and Secure.',
        },
        {
          q: 'What are data attributes used for?',
          a: 'Storing custom data on elements (`data-id="42"`), read via `element.dataset.id` in JS or `[data-id]` selectors in CSS.',
        },
        {
          q: 'Name some new features of HTML5.',
          a: 'Semantic tags, native audio/video, canvas, new input types and validation, data attributes, web storage, `<dialog>` and `<details>`.',
        },
      ],
      spoken: `"HTML5 gave us a simple doctype that triggers standards mode, semantic tags like header, nav, main and article, native audio, video and canvas so we don't need plugins, new input types with built-in validation, and data attributes for custom data that I read with dataset. It also came with APIs like localStorage and sessionStorage. I know localStorage persists and sessionStorage is per tab, while cookies are sent to the server — so for auth I prefer HttpOnly cookies over localStorage because of XSS. I also like native dialog and details for accessible modals and accordions."`,
      mistakes: [
        'Forgetting the doctype and getting strange layout differences from quirks mode.',
        'Storing objects in localStorage without `JSON.stringify` — you get the string "[object Object]".',
        'Storing JWTs in localStorage without considering XSS risk.',
        'Follow-up trap: "What type does `dataset` return for `data-count=5`?" Always a string ("5"). Convert it with `Number()`.',
      ],
      takeaway: 'Always use the HTML5 doctype, prefer native elements (video, dialog, details), and know storage trade-offs.',
    },
    {
      id: 'box-model',
      title: 'The Box Model',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Every element is a box made of content, padding, border and margin. box-sizing decides whether width includes padding and border.',
      what: `Every HTML element is drawn as a rectangle box. From inside to outside it has four layers:

1. **Content** — the text or image.
2. **Padding** — space inside the box, around the content.
3. **Border** — the line around the padding.
4. **Margin** — space outside the box, pushing other boxes away.

By default (\`box-sizing: content-box\`), \`width\` sets only the content. Padding and border are **added on top**. With \`box-sizing: border-box\`, \`width\` includes content + padding + border.

#### Deeper version
- Margin is **not** part of the element's size in either mode. It is outside space.
- Vertical margins between block elements can **collapse**: two touching margins of 20px and 30px become 30px, not 50px. This does not happen in flex or grid containers.
- Padding takes the element's background colour. Margin is always transparent.
- Percentage padding and margin (even top/bottom) are calculated from the **width** of the parent, which is why the old "padding-top: 56.25%" trick made 16:9 boxes (today we use \`aspect-ratio\`).`,
      why: `Almost every "why is my layout 2px too wide" or "why does this overflow" bug comes from the box model. Knowing it lets you predict the real size of an element. Most teams set \`border-box\` globally so that \`width: 300px\` really means 300px on screen.`,
      analogy: `Think of a framed photo on a wall. The photo is the **content**. The white card around the photo is the **padding**. The wooden frame is the **border**. The empty wall space you leave between frames is the **margin**.`,
      code: [
        {
          title: 'content-box vs border-box',
          lang: 'css',
          code: `.a {
  box-sizing: content-box; /* the default */
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  /* real width = 200 + 20*2 + 5*2 = 250px */
}

.b {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  /* real width = 200px (content shrinks to 150px) */
}

/* Common global reset used in most projects */
*,
*::before,
*::after {
  box-sizing: border-box;
}`,
        },
        {
          title: 'Margin collapse',
          lang: 'css',
          code: `/* Two stacked block elements */
.first  { margin-bottom: 20px; }
.second { margin-top: 30px; }
/* Gap between them is 30px, NOT 50px (margins collapse) */

/* In a flex column, margins do NOT collapse -> gap is 50px */
.list { display: flex; flex-direction: column; }`,
        },
      ],
      output: `\`.a\` takes 250px on screen because padding and border are added to the 200px width. \`.b\` takes exactly 200px; the browser makes the content area smaller (150px) to fit padding and border inside.

In the margin example, the larger margin wins (30px) when the elements are normal blocks. Inside a flex container both margins are kept, so the gap is 50px. Many developers use \`gap\` in flex/grid to avoid this confusion completely.`,
      questions: [
        {
          q: 'Explain the CSS box model.',
          a: 'Every element is a box: content, then padding, then border, then margin. Width and height apply to the content by default; with `border-box` they include padding and border.',
        },
        {
          q: 'What does `box-sizing: border-box` do?',
          a: 'It makes `width` and `height` include padding and border. So a 200px wide box stays 200px even if you add padding. It makes layouts much easier to reason about.',
        },
        {
          q: 'What is margin collapsing?',
          a: 'When vertical margins of block elements touch, they merge into one margin equal to the larger one. It does not happen with horizontal margins, or inside flex and grid containers.',
        },
        {
          q: 'What is the difference between padding and margin?',
          a: 'Padding is space inside the border and shows the background colour. Margin is space outside the border, is transparent, and can be negative.',
        },
      ],
      spoken: `"Every element in CSS is a box with four layers: content, padding, border and margin. By default, with content-box, the width only covers the content, so padding and border get added on top, which often causes overflow bugs. I always set box-sizing border-box globally, so the width includes padding and border and a 300px card is really 300px. Margin is outside space and is not part of the size. One gotcha is margin collapse — vertical margins of normal block elements merge into the bigger one — which doesn't happen in flex or grid, so I usually prefer gap there."`,
      mistakes: [
        'Forgetting that `content-box` adds padding and border to the width, so a `width: 100%` element with padding overflows its parent.',
        'Expecting two vertical margins to add up. In normal flow they collapse into the larger one.',
        'Thinking margin is included in `border-box` width. It never is.',
        'Follow-up trap: "Can margin be negative? Can padding?" Margin can be negative (it pulls elements closer or overlaps). Padding cannot be negative.',
      ],
      takeaway: 'Content → padding → border → margin; set `box-sizing: border-box` everywhere so widths mean what they say.',
    },
    {
      id: 'display-values',
      title: 'display: block, inline, inline-block, none',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'display decides how a box sits in the page: on its own line (block), inside text (inline), or a mix (inline-block).',
      what: `The \`display\` property tells the browser **how an element takes space**.

- \`block\` — starts on a new line and takes the full width. You can set width, height, margin, padding. Examples: \`<div>\`, \`<p>\`, \`<h1>\`.
- \`inline\` — flows inside a line of text, like a word. Width and height are **ignored**. Top/bottom margin does not push other lines. Examples: \`<span>\`, \`<a>\`, \`<strong>\`.
- \`inline-block\` — sits inside the line like inline, but respects width, height and all margins.
- \`none\` — removes the element from the page completely. It takes no space.
- \`flex\` and \`grid\` — turn the element into a layout container for its children.

#### Deeper version
Modern CSS describes display as two parts: the **outer** type (how the box behaves with its siblings: block or inline) and the **inner** type (how it lays out its children: flow, flex, grid). So \`display: inline-flex\` means "behave like inline outside, flex inside". \`display: none\` vs \`visibility: hidden\`: \`none\` removes the box (no space, not in the accessibility tree); \`visibility: hidden\` keeps the space but makes it invisible; \`opacity: 0\` keeps the space **and** still receives clicks.`,
      why: `Many layout bugs are display bugs: "why can't I set height on my span?", "why are my links on separate lines?", "why is there a small gap under my image?". Knowing display values lets you fix these fast and choose the right way to hide things.`,
      analogy: `Block elements are like paragraphs in a book — each one starts a new line. Inline elements are like words — they sit next to each other in the line. Inline-block is like an emoji or a small picture placed in the middle of a sentence: it sits in the line, but it has its own fixed size.`,
      code: [
        {
          title: 'Comparing display values',
          lang: 'css',
          code: `span.tag {
  display: inline;
  width: 100px;   /* ignored for inline elements */
  padding: 4px;   /* left/right push neighbours; top/bottom just overlap lines */
}

span.badge {
  display: inline-block;
  width: 100px;   /* respected */
  height: 30px;   /* respected */
  margin: 8px;    /* all four sides respected */
}

.hidden-none   { display: none; }        /* gone, no space, not read by screen readers */
.hidden-vis    { visibility: hidden; }   /* invisible, keeps its space */
.hidden-fade   { opacity: 0; }           /* invisible, keeps space, still clickable */`,
        },
        {
          title: 'Fixing the gap under an image',
          lang: 'css',
          code: `/* Images are inline by default and sit on the text baseline,
   leaving a few pixels below for letters like "g" and "y". */
img {
  display: block;   /* removes the baseline gap */
  max-width: 100%;
}`,
        },
      ],
      output: `The \`.tag\` span ignores \`width: 100px\` because inline elements size to their content. The \`.badge\` span becomes a 100x30 box that still sits in the text line.

The three hiding classes look the same (nothing visible), but behave differently: \`display: none\` collapses the space, \`visibility: hidden\` leaves an empty hole, and \`opacity: 0\` leaves a hole that can still be clicked. Setting images to \`display: block\` removes the small gap under them.`,
      questions: [
        {
          q: 'What is the difference between inline, block and inline-block?',
          a: 'Block starts on a new line and takes full width. Inline flows in text and ignores width/height. Inline-block flows in text but respects width, height and margins.',
        },
        {
          q: '`display: none` vs `visibility: hidden` vs `opacity: 0`?',
          a: '`none` removes the element and its space. `visibility: hidden` hides it but keeps its space. `opacity: 0` hides it, keeps space and still gets clicks and focus.',
        },
        {
          q: 'Why can I not set height on a `<span>`?',
          a: 'A span is inline by default, and inline boxes ignore width and height. Change it to `inline-block` or `block`.',
        },
        {
          q: 'What does `inline-flex` mean?',
          a: 'The element behaves like an inline element on the outside (sits in a line) but lays out its children with flexbox on the inside.',
        },
      ],
      spoken: `"The display property controls how an element takes space. Block elements like div and p start on a new line and take the full width. Inline elements like span and a flow inside text and ignore width and height. Inline-block is a mix: it sits in the line but respects size and margins. Then flex and grid turn the element into a layout container. For hiding, display none removes the element and its space, visibility hidden keeps the space, and opacity zero keeps the space and is still clickable — which matters for accessibility and for animations."`,
      mistakes: [
        'Trying to set `width` or `height` on an inline element and wondering why nothing changes.',
        'Hiding something with `opacity: 0` and forgetting it can still be clicked and focused with Tab.',
        'Using `display: none` on content that should still be read by screen readers. Use a "visually hidden" class instead.',
        'Follow-up trap: "Can you animate `display: none`?" Classic transitions cannot animate it. Animate `opacity`/`transform` and toggle visibility, or check current browser support for newer features like `transition-behavior: allow-discrete`.',
      ],
      takeaway: 'Block = own line, inline = inside text, inline-block = inside text with a real size; choose how to hide based on space and clicks.',
    },
    {
      id: 'css-units',
      title: 'CSS Units: px, %, em, rem, vh/vw',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'px is fixed, % is relative to the parent, em to the element font size, rem to the root font size, vh/vw to the screen.',
      what: `CSS has **absolute** and **relative** units.

- \`px\` — a fixed size. \`16px\` is always 16px (in CSS pixels).
- \`%\` — relative to the **parent** (for width, relative to the parent's width).
- \`em\` — relative to the **current element's font size**. If font-size is 20px, \`2em\` = 40px.
- \`rem\` — relative to the **root** (\`<html>\`) font size. Browsers default to 16px, so \`1rem\` = 16px.
- \`vw\` / \`vh\` — 1% of the viewport (screen) width / height.

#### Deeper version
- \`em\` **compounds**: a list with \`font-size: 1.2em\` inside another list with \`1.2em\` becomes 1.44 times bigger. \`rem\` does not compound, which is why it is preferred for font sizes and spacing.
- Using \`rem\` respects the user's browser font setting. If a user sets their default font to 20px for readability, your whole \`rem\`-based UI scales with it. Hard-coded \`px\` fonts ignore that choice.
- On mobile, \`100vh\` can be taller than the visible area because the browser toolbar shows and hides. Newer units fix this: \`dvh\` (dynamic), \`svh\` (small), \`lvh\` (large).
- \`clamp(min, preferred, max)\` combines units: \`font-size: clamp(1rem, 2.5vw, 2rem)\` grows with the screen but never goes below 1rem or above 2rem.`,
      why: `Picking the right unit makes your UI **scale** correctly on different screens and for users who change their font size. Interviewers ask this to see if you understand accessibility and responsive design, not just pixel-perfect mockups.`,
      analogy: `\`px\` is like saying "make it 10 cm long" — always the same. \`%\` is "half of the table". \`em\` is "twice the size of this shirt's text". \`rem\` is "twice the size of the house's standard text" — one rule for the whole house, so it never stacks up.`,
      code: [
        {
          title: 'em compounds, rem does not',
          lang: 'css',
          code: `html { font-size: 16px; }        /* browser default, usually left alone */

.parent { font-size: 1.5em; }    /* 16 * 1.5 = 24px */
.parent .child-em  { font-size: 1.5em; }  /* 24 * 1.5 = 36px (compounds) */
.parent .child-rem { font-size: 1.5rem; } /* 16 * 1.5 = 24px (from root) */

.button {
  font-size: 1rem;
  padding: 0.5em 1em;  /* em here = scales with the button's own font size */
}`,
        },
        {
          title: 'Fluid sizes with clamp and dvh',
          lang: 'css',
          code: `h1 {
  /* at least 1.75rem, grows with screen width, at most 3rem */
  font-size: clamp(1.75rem, 4vw + 1rem, 3rem);
}

.hero {
  min-height: 100vh;   /* fallback for older browsers */
  min-height: 100dvh;  /* follows the real visible height on mobile */
}`,
        },
      ],
      output: `\`.child-em\` ends up 36px because it multiplies its parent's already-enlarged 24px. \`.child-rem\` is 24px because it always looks at the root 16px. The button padding uses \`em\` so that a bigger button automatically gets bigger padding.

The \`h1\` smoothly changes size as the window resizes but stays between 28px and 48px. The hero uses \`100dvh\` so it fits the real visible screen on phones; older browsers ignore the line they do not understand and use the \`100vh\` fallback.`,
      questions: [
        {
          q: 'What is the difference between em and rem?',
          a: '`em` is relative to the current element\'s font size and compounds when nested. `rem` is relative to the root `<html>` font size, so it is predictable everywhere.',
        },
        {
          q: 'Why use rem instead of px for font sizes?',
          a: 'rem respects the user\'s browser font-size setting, which is important for accessibility. It also makes scaling the whole UI easy by changing one root value.',
        },
        {
          q: 'What is the problem with 100vh on mobile?',
          a: 'Mobile browser toolbars change the visible height, so 100vh can be taller than the visible area and cause scrolling. Use `100dvh` (with a 100vh fallback).',
        },
        {
          q: 'What does clamp() do?',
          a: '`clamp(min, preferred, max)` returns the preferred value but never smaller than min or larger than max. Great for fluid typography.',
        },
      ],
      spoken: `"px is a fixed size, percent is relative to the parent, em is relative to the element's own font size, rem is relative to the root html font size, and vw and vh are percentages of the viewport. I use rem for font sizes and most spacing because it doesn't compound like em and it respects the user's browser font settings, which is an accessibility win. I use em for things like button padding that should scale with that button's text. For fluid headings I like clamp, and on mobile I use dvh instead of vh because of the toolbar height problem."`,
      mistakes: [
        'Nesting `em` font sizes and getting huge text because they multiply.',
        'Setting `html { font-size: 62.5% }` and then forgetting every component depends on it. It works, but it is a team-wide decision, not a quick hack.',
        'Using `100vh` for full-screen mobile layouts and getting an unwanted scrollbar.',
        'Follow-up trap: "What is percentage padding relative to?" The parent\'s **width**, even for padding-top and padding-bottom.',
      ],
      takeaway: 'rem for fonts and spacing, % and fr for layout, em for things that scale with their own text, dvh for mobile full height.',
    },
    {
      id: 'specificity',
      title: 'Specificity and the Cascade',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'When two rules target the same element, the more specific selector wins; if equal, the one written later wins.',
      what: `The **cascade** is how the browser decides which CSS rule wins when several rules style the same element.

**Specificity** is a score for each selector. Think of it as three numbers **(IDs, classes, elements)**:
- ID selector \`#header\` → (1, 0, 0)
- Class, attribute, pseudo-class \`.btn\`, \`[type="text"]\`, \`:hover\` → (0, 1, 0)
- Element and pseudo-element \`div\`, \`::before\` → (0, 0, 1)

Compare from left to right. One ID beats any number of classes. If the scores are equal, the rule written **later** wins.

#### Deeper version
The full order the browser checks is:
1. **Origin and importance** — \`!important\` declarations beat normal ones.
2. **Cascade layers** (\`@layer\`) — rules in later layers beat earlier layers, no matter the specificity. Unlayered styles beat layered ones.
3. **Specificity**.
4. **Order of appearance** — last one wins.

Inline styles (\`style="..."\`) beat any selector. \`!important\` beats inline styles. The universal selector \`*\` and combinators (\`>\`, \`+\`, \`~\`) add **zero**. \`:where()\` always has zero specificity; \`:is()\` and \`:not()\` take the specificity of their most specific argument.`,
      why: `"My CSS is not applying" is the most common CSS question at work. Understanding specificity stops you from fighting it with \`!important\`, and helps you override component library styles (MUI, Bootstrap) in a clean way.`,
      analogy: `Think of a sports ranking: gold medals first, then silver, then bronze. A team with 1 gold beats a team with 10 silvers. IDs are gold, classes are silver, elements are bronze. If two teams have the exact same medals, the one who finished later (written later in the CSS) wins the tie.`,
      code: [
        {
          title: 'Who wins?',
          lang: 'html',
          code: `<style>
  p { color: black; }                 /* (0,0,1) */
  .note { color: blue; }              /* (0,1,0) */
  #intro { color: green; }            /* (1,0,0) */
  p.note.warning { color: orange; }   /* (0,2,1) */
  .note { color: purple; }            /* (0,1,0) -> later than blue */
</style>

<p id="intro" class="note warning">Hello</p>
<!-- Result: green, because the ID (1,0,0) beats (0,2,1) -->

<p class="note">Second</p>
<!-- Result: purple, same specificity as blue, but written later -->`,
        },
        {
          title: 'Low-specificity overrides with :where and @layer',
          lang: 'css',
          code: `/* Library-like base styles with ZERO specificity: easy to override */
:where(.card) { padding: 16px; border: 1px solid #ddd; }

/* Order layers once: later layers win */
@layer reset, base, components;

@layer base {
  a { color: blue; }
}
@layer components {
  a { color: teal; }  /* wins over base even with the same specificity */
}`,
        },
      ],
      output: `The first paragraph is **green**. It matches four rules, but \`#intro\` has an ID, and one ID beats any number of classes. The second paragraph is **purple**: both \`.note\` rules have the same score, so the one written later wins.

In the second block, any normal \`.card { padding: 0 }\` easily overrides the \`:where(.card)\` rule because \`:where\` adds zero specificity. Links are teal because the \`components\` layer is declared after \`base\`.`,
      questions: [
        {
          q: 'How is CSS specificity calculated?',
          a: 'Count IDs, then classes/attributes/pseudo-classes, then elements/pseudo-elements, as three numbers like (1,2,0). Compare left to right. Inline styles beat selectors, and `!important` beats both.',
        },
        {
          q: 'Why should you avoid `!important`?',
          a: 'It breaks the normal cascade. The only way to override it is another `!important` with higher specificity, which leads to a war of `!important`s. Fix the selector or use layers instead.',
        },
        {
          q: 'What is the specificity of `ul li a:hover`?',
          a: '(0,1,3): one pseudo-class and three elements.',
        },
        {
          q: 'Does the order of classes in the HTML `class` attribute matter?',
          a: 'No. `class="a b"` and `class="b a"` are the same. Only the order of the rules in the CSS matters when specificity is equal.',
        },
      ],
      spoken: `"Specificity is how the browser decides which rule wins when multiple rules target the same element. I think of it as three numbers: IDs, then classes, attributes and pseudo-classes, then elements. One ID beats any number of classes, and if the scores tie, the rule written later wins. Inline styles beat selectors, and important beats everything, which is why I avoid it. To keep CSS maintainable I stick to single-class selectors like BEM, and for overrides I use where or cascade layers instead of escalating specificity."`,
      mistakes: [
        'Thinking the order of classes in the HTML attribute matters. Only order in the stylesheet matters.',
        'Using IDs for styling. Their high specificity makes them hard to override later.',
        'Reaching for `!important` first instead of understanding why the rule lost.',
        'Follow-up trap: "Do 11 classes beat 1 ID?" No. Specificity is not a base-10 number; any ID beats any number of classes.',
      ],
      takeaway: 'IDs beat classes beat elements; ties go to the last rule — keep selectors flat and avoid `!important`.',
    },
    {
      id: 'pseudo-classes-elements',
      title: 'Pseudo-classes and Pseudo-elements',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Pseudo-classes (:hover) style an element in a certain state; pseudo-elements (::before) style a part of an element or add fake content.',
      what: `- A **pseudo-class** starts with one colon (\`:\`). It selects an element when it is in a **state** or **position**. Examples: \`:hover\`, \`:focus\`, \`:disabled\`, \`:first-child\`, \`:nth-child(2n)\`, \`:not(.active)\`.
- A **pseudo-element** starts with two colons (\`::\`). It styles a **part** of an element or creates a fake child. Examples: \`::before\`, \`::after\`, \`::placeholder\`, \`::first-line\`, \`::selection\`.

\`::before\` and \`::after\` need a \`content\` property (even \`content: ""\`) or they do not appear.

#### Deeper version
- \`:focus-visible\` shows a focus ring only when the user is using the keyboard, not on mouse click. It is the modern, accessible way to style focus.
- \`:nth-child(an+b)\` counts all siblings; \`:nth-of-type\` counts only siblings of the same tag.
- \`:has()\` is a "parent selector": \`.card:has(img)\` selects cards that contain an image. It is supported in all modern browsers now, but check support if you target old browsers.
- \`:is()\` and \`:where()\` group selectors. \`:where()\` adds zero specificity.
- Pseudo-elements are not real DOM nodes. JavaScript cannot select them, and screen readers may or may not read their \`content\`, so do not put important text in them.`,
      why: `They let you style states and decorations **without extra HTML or JavaScript**: hover effects, zebra-striped tables, required-field stars, custom checkboxes, tooltips, and focus rings for keyboard users.`,
      analogy: `A pseudo-class is like saying "the person **who is currently** speaking" — same person, special state. A pseudo-element is like a sticker you put **on** a box — it is not a new box, it is decoration attached before or after the content.`,
      code: [
        {
          title: 'Common pseudo-classes',
          lang: 'css',
          code: `/* State */
.btn:hover { background: #2563eb; }
.btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Position */
tr:nth-child(even) { background: #f3f4f6; }   /* zebra rows */
li:last-child { border-bottom: none; }

/* Logic */
input:not([type="checkbox"]) { width: 100%; }
.card:has(img) { padding-top: 0; }             /* parent selector */

/* Form validation states */
input:invalid:not(:placeholder-shown) { border-color: red; }`,
        },
        {
          title: 'Pseudo-elements',
          lang: 'css',
          code: `/* Required star without extra HTML */
label.required::after {
  content: " *";
  color: red;
}

/* Decorative underline */
.title::before {
  content: "";            /* required, even if empty */
  display: block;
  width: 40px;
  height: 4px;
  background: #2563eb;
  margin-bottom: 8px;
}

input::placeholder { color: #9ca3af; }
::selection { background: #fde68a; }`,
        },
      ],
      output: `Buttons turn blue on hover and show an orange ring only when focused with the keyboard. Every even table row gets a grey background. Inputs that are invalid show a red border, but only after the user has typed something (\`:not(:placeholder-shown)\`), so the form does not look broken on first load.

Labels with \`required\` get a red star added by CSS, and every \`.title\` gets a small blue bar above it — all without touching the HTML.`,
      questions: [
        {
          q: 'What is the difference between a pseudo-class and a pseudo-element?',
          a: 'A pseudo-class (`:hover`) selects an element in a certain state. A pseudo-element (`::before`) styles a part of an element or adds generated content. One colon vs two colons.',
        },
        {
          q: 'Why is my `::before` not showing?',
          a: 'Usually because `content` is missing. Add `content: ""`. Also note it does not work on replaced elements like `<img>` and `<input>`.',
        },
        {
          q: '`:focus` vs `:focus-visible`?',
          a: '`:focus` applies on any focus, including mouse clicks. `:focus-visible` applies when the browser thinks a visible ring is needed, mainly keyboard use. Never remove focus styles without a replacement.',
        },
        {
          q: '`:nth-child` vs `:nth-of-type`?',
          a: '`:nth-child(2)` is the second child of any type. `:nth-of-type(2)` is the second child of that specific tag type.',
        },
      ],
      spoken: `"A pseudo-class uses one colon and targets an element in a specific state or position, like hover, focus-visible, disabled, or nth-child. A pseudo-element uses two colons and styles part of an element or adds generated content, like before, after, or placeholder. Before and after need a content property to show up. I use them a lot for decorations and states without extra markup. For accessibility I use focus-visible so keyboard users always get a clear focus ring, and newer selectors like has give us a real parent selector."`,
      mistakes: [
        'Forgetting `content: ""` on `::before`/`::after`.',
        'Putting important text in `::before`/`::after`. It is not selectable and screen-reader support varies.',
        'Writing `outline: none` on focus without a replacement style. Keyboard users then cannot see where they are.',
        'Follow-up trap: "Can `::before` be used on an `<img>` or `<input>`?" No, these are replaced or void elements and do not render generated content.',
      ],
      takeaway: 'One colon = state of an element, two colons = part of an element; always keep a visible focus style.',
    },
    {
      id: 'positioning',
      title: 'Positioning: static, relative, absolute, fixed, sticky',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'position decides where a box is placed: in normal flow (static/relative), against an ancestor (absolute), the screen (fixed), or scroll-based (sticky).',
      what: `The \`position\` property, with \`top\`, \`right\`, \`bottom\`, \`left\`, controls where an element sits.

- \`static\` — the default. Normal flow. \`top/left\` do nothing.
- \`relative\` — stays in normal flow (keeps its space) but can be **nudged** with \`top/left\`. Most often used to become the reference point for absolute children.
- \`absolute\` — **removed from normal flow** (no space kept). Placed relative to the nearest **positioned ancestor** (any ancestor with position other than static). If none, relative to the page.
- \`fixed\` — removed from flow and placed relative to the **viewport** (screen). It stays put when you scroll.
- \`sticky\` — acts like relative until you scroll past a threshold (\`top: 0\`), then sticks like fixed — but only inside its parent.

#### Deeper version
The box an absolute element is placed against is called its **containing block**. It is usually the nearest positioned ancestor, but an ancestor with \`transform\`, \`filter\` or \`perspective\` also becomes the containing block — even for \`position: fixed\`. That is why a "fixed" modal inside an animated (transformed) parent suddenly scrolls with the page. Sticky fails silently when any ancestor has \`overflow: hidden/auto\` (it sticks inside that scroll box instead), when you forget \`top\`, or when the parent is not taller than the sticky element.`,
      why: `You need positioning for badges on avatars, dropdown menus, tooltips, modals, sticky headers, and "back to top" buttons. These UI patterns appear in almost every app and in many machine-coding rounds.`,
      analogy: `Imagine people in a cinema. **Static** people sit in their seats. **Relative** people stay in their seat but lean a bit left — their seat is still theirs. **Absolute** people stand up and stand at a spot measured from the nearest "marked" row. **Fixed** is a sign stuck to the screen itself — it does not move. **Sticky** is a person who walks with you down the aisle until they reach the wall of their section.`,
      code: [
        {
          title: 'Badge on an avatar (relative + absolute)',
          lang: 'css',
          code: `.avatar {
  position: relative;   /* becomes the reference box for children */
  width: 48px;
  height: 48px;
}

.avatar .badge {
  position: absolute;   /* removed from flow */
  top: -4px;            /* measured from .avatar, not the page */
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: red;
}`,
        },
        {
          title: 'Sticky header and fixed button',
          lang: 'css',
          code: `.table-header {
  position: sticky;
  top: 0;               /* REQUIRED: where it should stick */
  background: white;    /* otherwise rows show through */
  z-index: 1;
}

.back-to-top {
  position: fixed;      /* relative to the screen */
  bottom: 24px;
  right: 24px;
}`,
        },
      ],
      output: `The badge appears at the top-right corner of the avatar. Without \`position: relative\` on \`.avatar\`, the badge would fly to the top-right of the whole page (or another positioned ancestor).

The table header scrolls normally until it reaches the top of its scroll area, then stays there while rows scroll under it. The back-to-top button stays in the bottom-right corner of the screen at all times.`,
      questions: [
        {
          q: 'Difference between relative, absolute and fixed?',
          a: 'Relative keeps its space and moves from its normal spot. Absolute is removed from flow and placed against the nearest positioned ancestor. Fixed is removed from flow and placed against the viewport.',
        },
        {
          q: 'Why is my sticky element not sticking?',
          a: 'Common causes: no `top` value, an ancestor with `overflow: hidden/auto`, or the parent is not tall enough to scroll inside. Sticky only works inside its parent.',
        },
        {
          q: 'Absolute element is positioned against the wrong box. Why?',
          a: 'It uses the nearest ancestor with a non-static position (or a transform). Add `position: relative` to the intended parent.',
        },
        {
          q: 'Sticky vs fixed?',
          a: 'Fixed is always pinned to the viewport and leaves normal flow. Sticky stays in flow and only pins while its parent is on screen.',
        },
      ],
      spoken: `"Position controls how an element is placed. Static is the default normal flow. Relative keeps the element's space but lets me nudge it, and mostly I use it to make a parent the reference for absolute children. Absolute removes the element from flow and positions it against the nearest positioned ancestor — perfect for badges and dropdowns. Fixed pins to the viewport, like a chat button. Sticky behaves normally until you scroll to a threshold and then sticks, but only inside its parent, and it breaks if an ancestor has overflow hidden. Also, a transform on an ancestor changes the containing block even for fixed elements."`,
      mistakes: [
        'Using `position: absolute` without a positioned parent, so the element jumps to the page corner.',
        'Writing `position: sticky` without `top`, or inside a parent with `overflow: hidden`.',
        'Putting a fixed modal inside a parent that has `transform`, so it no longer covers the screen. Render modals in a portal at `<body>` level.',
        'Follow-up trap: "Does absolute keep the space of the element?" No. Absolute and fixed are removed from normal flow; siblings move into the empty space.',
      ],
      takeaway: 'Relative parent + absolute child for overlays; fixed for the screen; sticky needs `top` and no overflow-clipping ancestor.',
    },
    {
      id: 'flexbox',
      title: 'Flexbox',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A one-dimensional layout system to line items up in a row or a column, share free space, and align them.',
      what: `**Flexbox** lays out items along **one direction** at a time: a row or a column.

Put \`display: flex\` on a parent (the **flex container**). Its direct children become **flex items**.

- \`flex-direction\` — \`row\` (default) or \`column\`. This is the **main axis**. The other direction is the **cross axis**.
- \`justify-content\` — aligns items along the **main** axis (\`flex-start\`, \`center\`, \`space-between\`...).
- \`align-items\` — aligns items along the **cross** axis (\`stretch\` default, \`center\`...).
- \`gap\` — space between items.
- \`flex-wrap: wrap\` — lets items go to a new line when there is no room.

#### Deeper version
Each item has \`flex: <grow> <shrink> <basis>\`.
- \`flex-basis\` — the starting size before free space is shared.
- \`flex-grow\` — how much of the **extra** space it takes (as a ratio).
- \`flex-shrink\` — how much it shrinks when there is **not enough** space.

\`flex: 1\` means \`1 1 0%\`: start from 0 and share space equally. \`flex: auto\` means \`1 1 auto\`: start from content size, then share the extra. A common bug: a flex item with long text will not shrink below its content width, because flex items have \`min-width: auto\` by default. Fix it with \`min-width: 0\` (or \`overflow: hidden\`). \`align-content\` aligns **lines** when wrapping, while \`align-items\` aligns items within a line.`,
      why: `Before flexbox we used floats and hacks for simple things like "put these buttons in a row and center them vertically". Flexbox makes navbars, toolbars, cards, form rows and centering easy and responsive.`,
      analogy: `Think of people sitting on a bench. \`justify-content\` decides how they spread along the bench (bunched at one end, in the middle, or evenly spaced). \`align-items\` decides how they sit vertically (all sitting tall, or all centered). \`flex-grow\` is how willing each person is to spread out and take extra room.`,
      code: [
        {
          title: 'A navbar',
          lang: 'css',
          code: `.navbar {
  display: flex;
  justify-content: space-between; /* logo left, links right */
  align-items: center;            /* vertically centered */
  gap: 16px;
  padding: 12px 24px;
}

.navbar .links {
  display: flex;
  gap: 12px;
}`,
        },
        {
          title: 'Sidebar + content, and the min-width fix',
          lang: 'css',
          code: `.layout { display: flex; }

.sidebar {
  flex: 0 0 240px;   /* don't grow, don't shrink, 240px wide */
}

.content {
  flex: 1;           /* take all the remaining space */
  min-width: 0;      /* allow long text/tables to shrink instead of overflow */
}

.cards {
  display: flex;
  flex-wrap: wrap;   /* go to next line when full */
  gap: 16px;
}
.cards > .card { flex: 1 1 250px; } /* at least ~250px, then grow */`,
        },
      ],
      output: `The navbar puts the logo on the far left and links on the far right, all vertically centered, with 16px between them.

In the layout, the sidebar stays exactly 240px and the content fills the rest. Because of \`min-width: 0\`, a long URL or wide table inside \`.content\` will not push the page wider than the screen. The cards sit in rows; when a row cannot fit another 250px card, it wraps to the next line, and the cards in each row stretch to fill the width.`,
      questions: [
        {
          q: 'What is the difference between justify-content and align-items?',
          a: '`justify-content` aligns along the main axis (the flex-direction). `align-items` aligns along the cross axis. If you switch to `flex-direction: column`, they swap visual directions.',
        },
        {
          q: 'What does `flex: 1` mean?',
          a: 'It is shorthand for `flex-grow: 1; flex-shrink: 1; flex-basis: 0%`. The item starts from zero size and shares free space equally with other `flex: 1` items.',
        },
        {
          q: 'Why does my flex item overflow instead of shrinking?',
          a: 'Flex items have `min-width: auto`, so they will not shrink below their content size. Set `min-width: 0` on the item.',
        },
        {
          q: 'align-items vs align-content?',
          a: '`align-items` aligns items inside each line. `align-content` aligns the lines themselves and only matters when items wrap onto multiple lines.',
        },
      ],
      spoken: `"Flexbox is a one-dimensional layout system — it arranges items in a row or a column. I set display flex on the parent, then justify-content controls alignment on the main axis and align-items on the cross axis, and gap adds spacing. On the children, the flex shorthand sets grow, shrink and basis; flex 1 means share the free space equally. I use it for navbars, toolbars, form rows and centering. A common gotcha is that flex items won't shrink below their content because min-width is auto, so I add min-width zero for things like long text."`,
      mistakes: [
        'Mixing up main and cross axis after changing `flex-direction` to `column`.',
        'Using margins on every child for spacing instead of `gap`.',
        'Forgetting `min-width: 0` and getting horizontal overflow from long text inside a flex child.',
        'Follow-up trap: "Is `flex: 1` the same as `flex-grow: 1`?" No. `flex: 1` also sets basis to 0%, so items end up equal width; `flex-grow: 1` alone keeps basis `auto`, so bigger content gets a bigger box.',
      ],
      takeaway: 'Flexbox = one direction; justify on the main axis, align on the cross axis, and `min-width: 0` fixes most overflow bugs.',
    },
    {
      id: 'centering-a-div',
      title: 'Centering a div (all the ways)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Flexbox or grid place-items for most cases; margin auto for horizontal; absolute + transform for overlays; text-align for inline content.',
      what: `"How do you center a div?" is a classic warm-up question. There are several correct answers, each for a different situation.

1. **Flexbox:** \`display: flex; justify-content: center; align-items: center\` on the parent.
2. **Grid:** \`display: grid; place-items: center\` on the parent. The shortest way.
3. **Margin auto:** \`margin: 0 auto\` with a set width — horizontal only, for block elements.
4. **Absolute + transform:** \`top: 50%; left: 50%; transform: translate(-50%, -50%)\` — for overlays and modals.
5. **text-align: center** — centers **inline** content (text, inline-block, images) inside a block.

#### Deeper version
- Vertical centering needs the parent to **have a height** (e.g. \`min-height: 100vh\`). Without it, the parent is only as tall as its content, so there is nothing to center within.
- \`margin: auto\` also works inside a flex or grid container in **both** directions, because auto margins absorb free space there.
- \`position: absolute; inset: 0; margin: auto;\` plus a fixed width and height also centers an element without transform.
- The \`translate(-50%, -50%)\` trick moves the element back by **half of its own size**, which is why it works for unknown sizes. It can cause blurry text on half pixels in some browsers.`,
      why: `It tests whether you know several layout tools and can choose the right one: a page loader, a modal, a button label, an empty-state message. Giving 3-4 methods with when to use each shows real experience.`,
      analogy: `Hanging a picture in the middle of a wall: you can measure equal space on both sides (margin auto), use a laser level that does it for you (flex/grid), or put a nail at the exact middle and then shift the picture back by half its own width (absolute + translate).`,
      code: [
        {
          title: 'The main methods',
          lang: 'css',
          code: `/* 1. Flexbox */
.parent-flex {
  display: flex;
  justify-content: center;  /* horizontal */
  align-items: center;      /* vertical */
  min-height: 100vh;        /* parent needs height for vertical centering */
}

/* 2. Grid - shortest */
.parent-grid {
  display: grid;
  place-items: center;
  min-height: 100vh;
}

/* 3. Horizontal only */
.box-margin {
  width: 600px;
  margin: 0 auto;
}

/* 4. Absolute + transform (unknown size overlay) */
.parent-rel { position: relative; }
.box-abs {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 5. Inline content */
.text-center { text-align: center; }`,
        },
        {
          title: 'Modal centered on screen',
          lang: 'html',
          code: `<div class="overlay">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="t">
    <h2 id="t">Delete item?</h2>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;                 /* top/right/bottom/left = 0 */
    display: grid;
    place-items: center;      /* centers the modal */
    background: rgb(0 0 0 / 0.5);
  }
  .modal { background: white; padding: 24px; border-radius: 8px; }
</style>`,
        },
      ],
      output: `Every method puts the box in the middle, but with different rules. Flex and grid center in both directions and work with any child size. Margin auto only centers horizontally and needs a width. Absolute + transform works even when you do not know the size, because \`-50%\` in \`translate\` refers to the element itself.

The modal example covers the whole screen with a dark overlay (\`inset: 0\`) and grid centers the white box both ways in just two lines.`,
      questions: [
        {
          q: 'How do you center a div horizontally and vertically?',
          a: 'Easiest: on the parent, `display: grid; place-items: center` or `display: flex; justify-content: center; align-items: center`. The parent needs a height for vertical centering.',
        },
        {
          q: 'Why does `margin: 0 auto` not center vertically?',
          a: 'In normal block flow, auto vertical margins resolve to 0. Auto margins only absorb vertical space inside flex/grid or with absolute positioning and a set size.',
        },
        {
          q: 'Why use `translate(-50%, -50%)`?',
          a: '`top: 50%; left: 50%` puts the element\'s top-left corner at the center. Translate -50% moves it back by half its own width and height, so its center lines up.',
        },
        {
          q: 'My vertical centering does not work. Why?',
          a: 'Usually the parent has no height, so it is exactly as tall as the child. Give the parent a height or `min-height`.',
        },
      ],
      spoken: `"There are a few ways and I pick based on the case. My default is grid with place-items center on the parent, or flex with justify-content and align-items center — both center in both directions. For horizontal centering of a fixed-width block, margin zero auto works. For overlays with unknown size, I use absolute positioning at fifty percent and translate minus fifty percent, which shifts it back by half its own size. And text-align center is for inline content. The common bug is forgetting the parent needs a height for vertical centering."`,
      mistakes: [
        'Forgetting the parent needs a height, then thinking `align-items: center` is broken.',
        'Using `margin: auto` on an inline element or an element without a width.',
        'Using `text-align: center` to center a block-level div. It centers the inline content inside, not the box.',
        'Follow-up trap: "What does `place-items` do in flexbox?" Nothing useful — `justify-items` is ignored in flex. `place-items: center` is a grid trick; in flex use `justify-content` + `align-items`.',
      ],
      takeaway: 'Grid `place-items: center` or flex center for most cases; margin auto for horizontal; absolute + translate for overlays.',
    },
    {
      id: 'forms-validation',
      title: 'Forms and Validation',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Use labels, the right input types and built-in validation attributes, style with :invalid/:user-invalid, and always validate again on the server.',
      what: `HTML forms have **built-in validation**. You add attributes and the browser blocks submit and shows a message.

- \`required\` — field cannot be empty.
- \`type="email" | "url" | "number" | "tel" | "date"\` — checks format and shows the right mobile keyboard.
- \`minlength\`, \`maxlength\`, \`min\`, \`max\`, \`step\` — length and number limits.
- \`pattern\` — a regular expression the value must match.
- Every input needs a \`<label>\` connected with \`for\` / \`id\` (or by wrapping the input).

#### Deeper version
- The **Constraint Validation API** in JavaScript: \`input.checkValidity()\`, \`input.validity.valueMissing\`, \`input.setCustomValidity('message')\`, \`form.reportValidity()\`.
- \`novalidate\` on the form turns off the browser popups so you can show your own messages (common in React with React Hook Form or Zod), while still using the same attributes.
- \`:invalid\` matches immediately on page load (an empty required field is invalid), which looks bad. \`:user-invalid\` matches only after the user interacts; it is supported in modern browsers. A common fallback is \`:invalid:not(:placeholder-shown)\`.
- \`autocomplete\` values (\`email\`, \`current-password\`, \`one-time-code\`) help password managers and autofill.
- Client-side validation is for **user experience only**. Anyone can bypass it, so the server must validate again.`,
      why: `Forms are where users give you money and data (sign-up, checkout, Stripe payment pages). Good forms are accessible, give clear errors, and do not lose data. Built-in validation gives a lot for free and works even before JavaScript loads.`,
      analogy: `Client-side validation is like a receptionist checking that your form is filled in before you join the queue — it saves time. Server-side validation is the officer who actually approves it — you can never skip that step, because people can walk past the receptionist.`,
      code: [
        {
          title: 'Accessible form with built-in validation',
          lang: 'html',
          code: `<form action="/signup" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />

  <label for="pwd">Password</label>
  <input id="pwd" name="password" type="password" required minlength="8"
         autocomplete="new-password" aria-describedby="pwd-hint" />
  <p id="pwd-hint">At least 8 characters.</p>

  <label for="pin">PIN code</label>
  <input id="pin" name="pin" inputmode="numeric" pattern="[0-9]{6}"
         title="Six digits" />

  <label>
    <input type="checkbox" name="terms" required /> I accept the terms
  </label>

  <button type="submit">Create account</button>
</form>

<style>
  input:user-invalid { border: 2px solid #dc2626; }
</style>`,
        },
        {
          title: 'Custom messages with the Constraint Validation API',
          lang: 'javascript',
          code: `const form = document.querySelector('form');
const pwd = document.querySelector('#pwd');

pwd.addEventListener('input', () => {
  if (pwd.validity.tooShort) {
    pwd.setCustomValidity('Password needs at least 8 characters.');
  } else {
    pwd.setCustomValidity(''); // empty string = valid again
  }
});

form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity(); // shows the messages
  }
});`,
        },
      ],
      output: `If the user clicks submit with an empty email, the browser stops the submit and shows "Please fill out this field". A short password shows our custom message. The PIN only accepts six digits, and on phones \`inputmode="numeric"\` opens the number keypad. Fields get a red border only **after** the user has interacted with them, thanks to \`:user-invalid\`.

Screen readers read the label "Email" when the input is focused and also read the hint "At least 8 characters" for the password because of \`aria-describedby\`.`,
      questions: [
        {
          q: 'Is client-side validation enough?',
          a: 'No. It is only for user experience. It can be bypassed with DevTools or by calling the API directly, so the server must always validate too.',
        },
        {
          q: 'Why connect a label to an input?',
          a: 'Screen readers read the label when the input is focused, and clicking the label focuses the input (a bigger click target, great for checkboxes).',
        },
        {
          q: 'What does `novalidate` do?',
          a: 'It disables the browser\'s automatic validation popups on submit. You keep the attributes and show your own error UI with JavaScript.',
        },
        {
          q: 'What is the difference between `type="number"` and `inputmode="numeric"`?',
          a: '`type="number"` creates a number input with spinners and numeric value rules. `inputmode="numeric"` keeps it a text field but shows a number keyboard — better for PINs, card numbers and OTPs that are not real numbers.',
        },
      ],
      spoken: `"For forms I start with semantic HTML: every input has a label linked with for and id, and I use the right input types like email and tel so mobile shows the right keyboard. Then I use built-in validation attributes like required, minlength and pattern. In React I usually add novalidate and use a library like React Hook Form with a Zod schema to show custom inline errors, and I link error text with aria-describedby. But client validation is only for UX — I always validate again on the server, because anyone can bypass the browser."`,
      mistakes: [
        'Using `placeholder` as the label. It disappears when typing and is often low contrast. Always use a real `<label>`.',
        'Trusting client-side validation and skipping server validation.',
        'Styling `:invalid` so every empty required field is red on page load. Use `:user-invalid` or a "touched" state.',
        'Follow-up trap: "Should a credit card number use `type=number`?" No. It is not a math number (leading zeros, spaces, no spinners). Use `inputmode="numeric"` with `autocomplete="cc-number"`.',
      ],
      takeaway: 'Label every input, use the right types and attributes, show errors after interaction, and always re-validate on the server.',
    },
    {
      id: 'accessibility',
      title: 'Accessibility (ARIA, alt text, keyboard, contrast)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Make the site usable for everyone: semantic HTML first, alt text, full keyboard support, visible focus, enough contrast, and ARIA only to fill gaps.',
      what: `**Accessibility (a11y)** means people with disabilities can use your site — blind users with screen readers, people who use only a keyboard, people with low vision or colour blindness.

The main checks:
- **Semantic HTML** — real buttons, links, headings, labels, landmarks.
- **Alt text** — \`<img alt="...">\` describes the image. Decorative images get \`alt=""\` so screen readers skip them.
- **Keyboard** — everything works with Tab, Shift+Tab, Enter, Space, Escape. Focus is always visible.
- **Contrast** — text must be readable. WCAG AA asks for at least **4.5:1** for normal text and **3:1** for large text.
- **ARIA** — extra attributes (\`aria-label\`, \`aria-expanded\`, \`role\`) that describe custom widgets to screen readers.

#### Deeper version
- **First rule of ARIA:** do not use ARIA if a native element can do the job. ARIA only changes what is **announced** — it does not add keyboard behaviour. \`role="button"\` on a div still needs \`tabindex="0"\` and Enter/Space handlers.
- **Name, role, state:** every control needs an accessible name (label text, \`aria-label\` or \`aria-labelledby\`), a role, and its state (\`aria-expanded\`, \`aria-checked\`, \`aria-selected\`).
- **Live regions:** \`aria-live="polite"\` (or \`role="status"\`) makes screen readers announce dynamic changes like "Item added to cart".
- **Focus management** in SPAs: when a modal opens, move focus into it, trap Tab inside, close on Escape, and return focus to the button that opened it. On route change, move focus to the new page heading.
- \`tabindex="0"\` adds an element to the tab order; \`tabindex="-1"\` makes it focusable only by script; positive values break the natural order — avoid them.
- Respect \`prefers-reduced-motion\` for users who get sick from animation.
- Test with Lighthouse/axe, keyboard only, and a real screen reader (VoiceOver on Mac, NVDA on Windows).`,
      why: `About 1 in 6 people live with some disability. Accessibility is also a **legal requirement** in many countries (ADA in the US, the European Accessibility Act in the EU), and it improves SEO and usability for everyone (keyboard power users, people on bright screens outdoors).`,
      analogy: `Accessibility is like building a ramp next to the stairs of a shop. Wheelchair users need it, but parents with prams and delivery people also love it. ARIA is like a sign that says "Ramp" — useful, but a sign alone does not build the ramp. You still need the real thing (keyboard support).`,
      code: [
        {
          title: 'Images, icon buttons and live regions',
          lang: 'html',
          code: `<!-- Informative image: describe it -->
<img src="chart.png" alt="Sales grew 40% from January to March" />

<!-- Decorative image: empty alt so screen readers skip it -->
<img src="divider.svg" alt="" />

<!-- Icon-only button needs an accessible name -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false"><!-- X icon --></svg>
</button>

<!-- Toggle with state -->
<button type="button" aria-expanded="false" aria-controls="faq1">
  What is your refund policy?
</button>
<div id="faq1" hidden>30 days, no questions asked.</div>

<!-- Announce dynamic updates -->
<p role="status" aria-live="polite" id="cart-msg"></p>`,
        },
        {
          title: 'Visible focus, hidden text and reduced motion',
          lang: 'css',
          code: `/* Never remove focus without a replacement */
:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

/* Hidden visually, still read by screen readers */
.sr-only {
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

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`,
        },
      ],
      output: `A screen reader says "Sales grew 40% from January to March, image" for the chart and says nothing for the divider. The close button is announced as "Close dialog, button" instead of just "button". The FAQ button is announced as "collapsed"; your JavaScript should flip \`aria-expanded\` to \`true\` and remove \`hidden\` when opened. Writing text into the \`role="status"\` paragraph makes the screen reader say it without moving focus.

Keyboard users always see a blue ring on the focused element. The \`.sr-only\` class hides text from the eyes but not from screen readers. Users who set "reduce motion" in their OS get almost no animation.`,
      questions: [
        {
          q: 'What is the first rule of ARIA?',
          a: 'Do not use ARIA if a native HTML element already gives you the semantics and behaviour. A real `<button>` is always better than `<div role="button">`.',
        },
        {
          q: 'When should alt text be empty?',
          a: 'For decorative images that add no information (dividers, background shapes). `alt=""` tells screen readers to skip it. Never omit the attribute completely, or the file name may be read.',
        },
        {
          q: 'How do you make a modal accessible?',
          a: 'Use `role="dialog"` with `aria-modal="true"` and a label, move focus into it on open, trap Tab inside, close on Escape, and return focus to the trigger on close. The native `<dialog>` element with `showModal()` gives much of this for free.',
        },
        {
          q: 'What contrast ratio does WCAG AA require?',
          a: '4.5:1 for normal text, 3:1 for large text (about 24px, or 18.66px bold) and for UI components like input borders and icons.',
        },
        {
          q: 'aria-label vs aria-labelledby vs aria-describedby?',
          a: '`aria-label` gives a name as a string. `aria-labelledby` uses the text of another element as the name. `aria-describedby` adds extra description (like hint or error text) read after the name.',
        },
      ],
      spoken: `"For accessibility I start with semantic HTML, because native buttons, links, labels and landmarks give screen reader support and keyboard behaviour for free. Then I check alt text — descriptive for meaningful images and empty for decorative ones — and make sure everything works with only the keyboard and has a visible focus ring. I check colour contrast against WCAG AA, 4.5 to 1 for normal text. I use ARIA only to fill gaps, like aria-expanded on toggles, aria-label on icon buttons, and live regions for toasts. For modals I manage focus. I test with Lighthouse, axe, and VoiceOver."`,
      mistakes: [
        'Adding `role="button"` to a div and thinking it is done. It still needs `tabindex="0"` and Enter/Space handling.',
        'Writing alt text like "image of..." or using the file name. Describe the meaning, and keep it short.',
        'Removing focus outlines (`outline: none`) for design reasons without adding another visible focus style.',
        'Using colour alone to show errors or status (red border only). Add text or an icon too.',
        'Follow-up trap: "Does `aria-hidden=true` on an element remove it from tab order?" No. It hides it from screen readers only; a focusable element inside can still get focus, which is confusing. Use `inert` or remove focusability too.',
      ],
      takeaway: 'Native HTML first, then alt text, keyboard + visible focus, contrast, and ARIA only to fill the gaps.',
    },
    {
      id: 'css-grid',
      title: 'CSS Grid',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A two-dimensional layout system: define rows and columns on the parent, then place items into the cells.',
      what: `**CSS Grid** lays out items in **rows and columns at the same time** (two dimensions).

Put \`display: grid\` on the parent and define tracks:
- \`grid-template-columns: 200px 1fr 1fr\` — three columns. \`fr\` means "a fraction of the free space".
- \`grid-template-rows\` — the same for rows.
- \`gap\` — space between rows and columns.
- \`repeat(3, 1fr)\` — shortcut for \`1fr 1fr 1fr\`.

Children fill cells automatically, or you place them with \`grid-column: 1 / 3\` (from line 1 to line 3, so it spans 2 columns).

#### Deeper version
- **Responsive without media queries:** \`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))\` creates as many 220px+ columns as fit. \`auto-fit\` is the same, but collapses empty tracks so items stretch to fill the row when there are few items.
- \`minmax(min, max)\` sets a size range for a track.
- **Named areas:** \`grid-template-areas\` lets you draw the layout with words ("header header" / "sidebar main").
- **Implicit grid:** items beyond the defined rows create new rows sized by \`grid-auto-rows\`.
- \`justify-items\` / \`align-items\` align items inside their cells; \`place-items\` sets both.
- **Subgrid:** \`grid-template-columns: subgrid\` lets a nested grid reuse the parent's tracks, which keeps card titles and buttons aligned across cards. It is supported in modern browsers.`,
      why: `Page layouts (header, sidebar, main, footer), dashboards, photo galleries and card lists are naturally two-dimensional. Grid does them with a few lines, and the layout is controlled from the parent, so the HTML stays clean.`,
      analogy: `Grid is like a spreadsheet or a chessboard. You first draw the rows and columns, then put each piece in a cell, and a piece can cover several cells. Flexbox is more like a single shelf where items line up one after another.`,
      code: [
        {
          title: 'Page layout with named areas',
          lang: 'css',
          code: `.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100vh;
  gap: 16px;
}
.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }

/* On small screens: one column, just redraw the areas */
@media (max-width: 768px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-areas: "header" "main" "sidebar" "footer";
  }
}`,
        },
        {
          title: 'Responsive card grid with no media query',
          lang: 'css',
          code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

/* A featured card spans two columns */
.cards .featured {
  grid-column: span 2;
}`,
        },
      ],
      output: `The page has a header across the top, a 240px sidebar and a flexible main area, and a footer at the bottom. The footer stays at the bottom even with little content because the middle row is \`1fr\` and the page has \`min-height: 100vh\`. On phones the media query redraws the areas into one column — no HTML changes.

The card grid shows as many columns as fit at 220px or more: maybe 4 on a laptop, 2 on a tablet, 1 on a phone. The featured card takes two columns.`,
      questions: [
        {
          q: 'What does `fr` mean?',
          a: 'A fraction of the **free** space in the grid container after fixed sizes and gaps are taken out. `1fr 2fr` gives the second column twice the free space of the first.',
        },
        {
          q: 'auto-fill vs auto-fit?',
          a: 'Both create as many columns as fit. `auto-fill` keeps empty tracks, so few items stay at their minimum size. `auto-fit` collapses empty tracks, so few items stretch to fill the row.',
        },
        {
          q: 'How do you make an item span multiple columns?',
          a: 'Use `grid-column: span 2`, or line numbers like `grid-column: 1 / 3`, or `1 / -1` to span the full width.',
        },
        {
          q: 'What is grid-template-areas?',
          a: 'A way to name regions of the grid with strings and place children with `grid-area: name`. It makes layouts readable and easy to rearrange in media queries.',
        },
      ],
      spoken: `"CSS Grid is a two-dimensional layout system — I define rows and columns on the parent and place children into cells. I use fr units to share free space, repeat and minmax to keep it short, and gap for spacing. My favourite pattern is repeat auto-fill with minmax 220 pixels and 1fr, which gives a responsive card grid without any media queries. For page layouts I use grid-template-areas, so I can literally see the layout in the CSS and rearrange it for mobile by redrawing the areas. Items can span columns with grid-column span."`,
      mistakes: [
        'Confusing `auto-fill` and `auto-fit` and getting items that do not stretch (or stretch too much).',
        'Using percentages plus `gap` and getting overflow. `fr` already subtracts the gaps; percentages do not.',
        'Forgetting that grid line numbers start at 1, and `-1` means the last line.',
        'Follow-up trap: "Can a grid item also be a flex container?" Yes. Nesting is normal: grid for the page, flex inside a card.',
      ],
      takeaway: 'Grid = rows and columns together; `repeat(auto-fill, minmax(x, 1fr))` is the one-line responsive grid.',
    },
    {
      id: 'grid-vs-flexbox',
      title: 'Grid vs Flexbox: how to decide',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Flexbox for one direction and content-driven sizes; Grid for two directions and layout-driven structure. They work great together.',
      what: `Both are modern layout tools. The simple rule:

- **Flexbox = one dimension.** Items in a row **or** a column. Sizes come from the **content** ("content-out"). Great for navbars, button groups, centering, a row of tags.
- **Grid = two dimensions.** Rows **and** columns together. Sizes come from the **layout** you define on the parent ("layout-in"). Great for page layouts, galleries, dashboards, forms with aligned labels.

#### Deeper version
A better question to ask yourself: **"Do I want items to line up in both directions?"**
- With \`flex-wrap\`, each line is independent. The last row of cards may stretch wider than the rows above. If you want columns that line up, that is a grid job.
- Grid can overlap items (place two items in the same cell), which flex cannot do without positioning.
- Flex is better when you do not know how many items there are and want each to take its natural size (tags, chips, breadcrumbs).
- Grid is better when the parent should control the structure, and children should just drop into it.
- In practice: **Grid for the macro layout (page, sections), Flexbox for micro layout (inside components).**`,
      why: `Interviewers ask this to see if you have real layout experience, not just memorised properties. Picking the right tool means less CSS, fewer media queries and fewer alignment bugs.`,
      analogy: `Flexbox is like people standing in a queue — one line, everyone takes the space they need. Grid is like a cinema hall with numbered rows and seats — the structure exists first, and people are placed into seats.`,
      code: [
        {
          title: 'Same cards, two results',
          lang: 'css',
          code: `/* Flex wrap: last row items stretch to fill their own line */
.cards-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.cards-flex > * { flex: 1 1 200px; }
/* With 5 cards on a 3-per-row screen, the last 2 cards become wider. */

/* Grid: every card lines up in fixed columns */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
/* With 5 cards, the last row has 2 cards at the same width as above. */`,
        },
        {
          title: 'Grid outside, flex inside',
          lang: 'css',
          code: `/* Macro: page structure */
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}

/* Micro: inside each card */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}`,
        },
      ],
      output: `With flex wrap and 5 cards, the first row has 3 cards and the second row has 2 cards that grow wider to fill the line — the columns do not line up. With grid, the second row has 2 cards of the same width as the cards above, and an empty space where the 6th card would be.

The dashboard example shows the usual combination: grid creates the 3 equal columns, and flex aligns the title and action button inside each card header.`,
      questions: [
        {
          q: 'When would you use Grid over Flexbox?',
          a: 'When I need control in two directions (rows and columns lining up), like page layouts, galleries and dashboards. Flexbox for one-direction lines of items, like navbars and button groups.',
        },
        {
          q: 'Can you replace Flexbox with Grid everywhere?',
          a: 'Technically you can do a lot with grid, but flex is simpler for content-sized items in a line, wrapping chips, and distributing space between unknown numbers of items.',
        },
        {
          q: 'Why do my wrapped flex items not line up in columns?',
          a: 'Each flex line is sized independently. If you need aligned columns, use grid.',
        },
      ],
      spoken: `"My rule of thumb is: Flexbox is one-dimensional and content-driven, Grid is two-dimensional and layout-driven. If items just need to sit in a row or column and take their natural size — like a navbar, toolbar, or tags — I use flex. If I need things to line up in both rows and columns — like a page layout, a gallery or a dashboard — I use grid. A clear sign is flex-wrap: wrapped lines don't align into columns, so I switch to grid. In real projects I combine them: grid for the page structure, flex inside components."`,
      mistakes: [
        'Building a card gallery with flex-wrap and then fighting the uneven last row.',
        'Using grid for a simple row of buttons where flex with `gap` is one line.',
        'Thinking you must choose one for the whole app. They are meant to be nested.',
        'Follow-up trap: "Which one is faster?" Performance difference is negligible for normal UIs. Choose by layout needs, not speed.',
      ],
      takeaway: 'One direction and content-sized → Flexbox; rows and columns that must align → Grid; usually both together.',
    },
    {
      id: 'responsive-design',
      title: 'Responsive Design',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'One site that adapts to any screen size, using the viewport meta tag, fluid layouts, flexible images and media queries.',
      what: `**Responsive design** means one website that looks good and works well on phones, tablets, laptops and big screens.

It rests on a few pillars:
1. **The viewport meta tag** — tells mobile browsers to use the real device width.
2. **Fluid layouts** — use \`%\`, \`fr\`, \`flex\`, \`max-width\` instead of fixed pixel widths.
3. **Flexible images** — \`max-width: 100%; height: auto\` so images never overflow.
4. **Media queries** — change the layout at certain widths (breakpoints).
5. **Relative units** — \`rem\`, \`clamp()\` for text and spacing.

#### Deeper version
- Without \`<meta name="viewport" content="width=device-width, initial-scale=1">\`, phones pretend to be about 980px wide and zoom out, so your media queries never trigger.
- Modern responsive CSS needs fewer breakpoints: \`flex-wrap\`, \`repeat(auto-fill, minmax())\` and \`clamp()\` adapt continuously.
- **Container queries** (\`@container\`) let a component respond to the width of its **parent**, not the whole screen. A card can be horizontal in a wide main area and vertical in a narrow sidebar, using the same CSS. They are supported in all modern browsers.
- Responsive images (\`srcset\`, \`<picture>\`) send smaller files to small screens (covered in its own topic).
- Touch targets should be at least about 44x44px (a common guideline from Apple and WCAG) so fingers can tap them.`,
      why: `More than half of web traffic is mobile. Google uses **mobile-first indexing** (it ranks you using your mobile version). A layout that breaks on phones loses users, sales and SEO.`,
      analogy: `Responsive design is like water: pour it into a glass, a bottle or a bowl, and it takes the shape of the container. A fixed-width site is like ice — it only fits one shape.`,
      code: [
        {
          title: 'The essentials',
          lang: 'html',
          code: `<head>
  <!-- Without this, media queries won't work properly on phones -->
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>

<style>
  img, video { max-width: 100%; height: auto; }

  .container {
    width: 100%;
    max-width: 1200px;   /* fluid up to a limit */
    margin-inline: auto;
    padding-inline: 16px;
  }

  h1 { font-size: clamp(1.75rem, 4vw, 3rem); }
</style>`,
        },
        {
          title: 'Container query: component adapts to its parent',
          lang: 'css',
          code: `.card-wrapper {
  container-type: inline-size;  /* make this a query container */
}

.card { display: grid; gap: 12px; }

/* When the WRAPPER (not the screen) is at least 500px wide */
@container (min-width: 500px) {
  .card {
    grid-template-columns: 160px 1fr; /* image left, text right */
  }
}`,
        },
      ],
      output: `With the viewport tag, a 390px-wide phone really lays the page out at 390px. Images shrink to fit their containers and keep their aspect ratio. The container is full width on phones and stops at 1200px on big screens, centered. The heading grows smoothly between 28px and 48px.

The card stacks image and text vertically by default. When placed in a wrapper that is 500px or wider, it switches to image-left, text-right — even if the screen itself is large but the card is in a narrow sidebar, it stays stacked.`,
      questions: [
        {
          q: 'What is responsive design?',
          a: 'Building one site that adapts its layout to any screen size using fluid layouts, flexible images, relative units and media queries.',
        },
        {
          q: 'Why do you need the viewport meta tag?',
          a: 'Without it, mobile browsers render the page at a fake desktop width (around 980px) and zoom out, so text is tiny and media queries do not match.',
        },
        {
          q: 'What are container queries and why are they useful?',
          a: 'They let a component change style based on its parent container\'s size instead of the viewport. That makes components truly reusable in different layouts.',
        },
        {
          q: 'Responsive vs adaptive design?',
          a: 'Responsive uses fluid layouts that change continuously. Adaptive serves a few fixed layouts for specific screen sizes (sometimes different HTML). Responsive is the common modern approach.',
        },
      ],
      spoken: `"Responsive design means one codebase that works on every screen size. The basics are the viewport meta tag, fluid layouts with flex, grid, percentages and max-width, images with max-width 100 percent, and relative units like rem and clamp. Then I add media queries at breakpoints where the design actually breaks, usually mobile-first with min-width. Today I also use container queries, so a component like a card adapts to the space it's given instead of the whole screen. And I keep touch targets large enough for fingers."`,
      mistakes: [
        'Forgetting the viewport meta tag, so the site looks zoomed out on phones.',
        'Setting fixed widths like `width: 1200px` instead of `max-width`.',
        'Picking breakpoints by device names (iPhone, iPad) instead of where the content breaks.',
        'Follow-up trap: "Is hiding content on mobile with display none responsive design?" It works visually but the content is still downloaded. Better to design content for mobile first and load heavy parts conditionally.',
      ],
      takeaway: 'Viewport tag + fluid layout + flexible images + relative units + media/container queries = responsive.',
    },
    {
      id: 'media-queries',
      title: 'Media Queries',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'CSS rules that apply only when a condition is true: screen width, orientation, dark mode, reduced motion, hover support, print.',
      what: `A **media query** wraps CSS rules in a condition. The rules apply only when the condition is true.

\`\`\`css
@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; }
}
\`\`\`

Common conditions:
- \`min-width\` / \`max-width\` — viewport width.
- \`orientation: landscape\` / \`portrait\`.
- \`prefers-color-scheme: dark\` — the user's OS is in dark mode.
- \`prefers-reduced-motion: reduce\` — the user wants less animation.
- \`hover: hover\` and \`pointer: coarse\` — mouse vs touch device.
- \`print\` — styles for printing.

#### Deeper version
- **Range syntax** (newer, supported in modern browsers): \`@media (width >= 768px)\` and \`@media (400px <= width < 1024px)\`. It reads more naturally and avoids the "1px overlap" problem of \`max-width: 767px\` vs \`min-width: 768px\`.
- Combine with \`and\`, a comma for "or", and \`not\`.
- Media queries do **not** add specificity, so order matters: a query placed earlier in the file can be overridden by a normal rule placed later.
- Use \`em\` in breakpoints if you want them to respect user zoom/font settings consistently across browsers; many teams just use px — both are common.
- \`window.matchMedia('(min-width: 768px)')\` lets JavaScript react to the same queries (e.g. a \`useMediaQuery\` hook in React).`,
      why: `They are the main tool to change layouts across screen sizes and to respect user preferences like dark mode and reduced motion. Hover queries stop "sticky hover" bugs on touch devices.`,
      analogy: `A media query is like a dress code rule: "If it is raining, wear a raincoat. If it is cold, add a jacket." The person is the same; what they wear depends on the conditions.`,
      code: [
        {
          title: 'Breakpoints and user preferences',
          lang: 'css',
          code: `/* Mobile-first base styles */
.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }

@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}

/* Dark mode from the OS setting */
@media (prefers-color-scheme: dark) {
  :root { --bg: #0b1120; --text: #e5e7eb; }
}

/* Only add hover effects on devices that can hover */
@media (hover: hover) {
  .card:hover { transform: translateY(-4px); }
}

/* Print: hide navigation, show link URLs */
@media print {
  nav, .no-print { display: none; }
  a::after { content: " (" attr(href) ")"; }
}`,
        },
        {
          title: 'Same query in JavaScript',
          lang: 'javascript',
          code: `const mq = window.matchMedia('(min-width: 768px)');

function update(e) {
  console.log(e.matches ? 'Desktop layout' : 'Mobile layout');
}

update(mq);                          // run once now
mq.addEventListener('change', update); // run again when it changes`,
        },
      ],
      output: `On a phone the grid has 1 column; at 768px it becomes 2 columns; at 1024px it becomes 4. If the user's OS is in dark mode, the CSS variables switch to dark colours. Cards only lift on hover on mouse devices, so phones do not get stuck in the hover state after a tap. When printing, the nav is hidden and links show their URL.

The JavaScript prints "Mobile layout" or "Desktop layout" on load and again each time the window crosses 768px.`,
      questions: [
        {
          q: 'min-width vs max-width media queries?',
          a: '`min-width` applies from that width **and up** (used in mobile-first). `max-width` applies from that width **and down** (used in desktop-first).',
        },
        {
          q: 'How do you support dark mode with CSS only?',
          a: 'Use `@media (prefers-color-scheme: dark)` to change CSS variables. For a manual toggle, also set a class or `data-theme` attribute on `<html>` from JavaScript.',
        },
        {
          q: 'How do you avoid hover effects on touch devices?',
          a: 'Wrap them in `@media (hover: hover)` so only devices with a real hover pointer get them.',
        },
        {
          q: 'Do media queries increase specificity?',
          a: 'No. A rule inside a media query has the same specificity as outside. Source order decides ties, so put media queries after base rules.',
        },
      ],
      spoken: `"Media queries apply CSS only when a condition is true. Mostly I use min-width breakpoints in a mobile-first style — base styles for phones, then add columns at 768 and 1024 pixels. But they're not only about width: I use prefers-color-scheme for dark mode, prefers-reduced-motion to turn off heavy animation, hover hover to avoid sticky hover on touch screens, and print styles. Media queries don't add specificity, so I always write them after the base rules. In React I can use matchMedia for the same checks in JavaScript."`,
      mistakes: [
        'Putting media queries **before** the base rules, so the base rules override them.',
        'Overlapping breakpoints like `max-width: 768px` and `min-width: 768px`, so both apply at exactly 768px.',
        'Too many device-specific breakpoints instead of a few content-based ones.',
        'Follow-up trap: "Media query vs container query?" Media queries look at the viewport (or device features); container queries look at a parent element\'s size.',
      ],
      takeaway: 'Media queries switch styles by screen size and user preferences; write them mobile-first with min-width, after base rules.',
    },
    {
      id: 'mobile-first',
      title: 'Mobile-First Design',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Write base CSS for small screens, then add styles for bigger screens with min-width media queries.',
      what: `**Mobile-first** means you design and write CSS for the **smallest screen first**. The base styles (outside any media query) are for phones. Then you **add** styles for bigger screens with \`min-width\` media queries.

The opposite is **desktop-first**: write for big screens, then override with \`max-width\` queries for small screens.

#### Deeper version
Why mobile-first CSS is usually simpler:
- Small-screen layouts are simpler (one column, stacked). Adding complexity for bigger screens means you mostly **add** rules, not **undo** them.
- Desktop-first often leads to "reset" rules like \`float: none; width: auto;\` in many places.
- Phones (often slower devices on slower networks) parse less overriding CSS.

Mobile-first is also a **product mindset**: on a small screen you must decide what content really matters, which often improves the desktop version too. Tailwind CSS is mobile-first by design: \`md:flex\` means "flex from the md breakpoint and up".`,
      why: `Most users are on phones, and Google indexes the mobile version of your site. Mobile-first CSS is shorter, has fewer overrides, and forces clear content priorities.`,
      analogy: `It is like packing for a trip. If you start with a small backpack (mobile), you only take what matters, then add extra bags for a longer trip (desktop). If you start with a huge suitcase and then try to fit it into a backpack, you spend a lot of time taking things out.`,
      code: [
        {
          title: 'Mobile-first vs desktop-first',
          lang: 'css',
          code: `/* ---------- Mobile-first (recommended) ---------- */
.nav { display: flex; flex-direction: column; gap: 8px; }

@media (min-width: 768px) {
  .nav { flex-direction: row; gap: 24px; }   /* only ADD for bigger screens */
}

/* ---------- Desktop-first (more overrides) ---------- */
.nav-d { display: flex; flex-direction: row; gap: 24px; }

@media (max-width: 767px) {
  .nav-d { flex-direction: column; gap: 8px; } /* UNDO desktop styles */
}`,
        },
        {
          title: 'Mobile-first in Tailwind',
          lang: 'html',
          code: `<!-- base = mobile; md: and lg: apply from those widths UP -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
  <div>Card</div>
  <div>Card</div>
</div>`,
        },
      ],
      output: `Both CSS versions give the same result: a vertical nav on phones and a horizontal one from 768px. In the mobile-first one, the base is the simple case and the media query just adds. In the desktop-first one, the phone version has to undo desktop values.

In the Tailwind example, phones see one column, tablets (md) see two, and large screens (lg) see four. There is no \`sm:\` needed for the phone layout — unprefixed classes **are** the mobile styles.`,
      questions: [
        {
          q: 'What is mobile-first design?',
          a: 'Writing base styles for small screens and adding styles for larger screens with `min-width` media queries.',
        },
        {
          q: 'Why is mobile-first preferred?',
          a: 'Less overriding CSS, simpler base layout, better performance on phones, and it forces you to prioritise content. It also matches Google\'s mobile-first indexing.',
        },
        {
          q: 'In Tailwind, does `sm:` mean "on small screens"?',
          a: 'No. It means "from the sm breakpoint and up". Unprefixed classes apply to all sizes, including the smallest.',
        },
      ],
      spoken: `"Mobile-first means I write the base CSS for the smallest screen, and then use min-width media queries to add layout for larger screens. The mobile layout is usually simpler, so I'm mostly adding rules instead of undoing them, which keeps the CSS shorter and avoids overrides. It also forces me to decide what content matters most. Tailwind works the same way — unprefixed classes are for mobile and md or lg prefixes apply from that size upward. Since most traffic is mobile and Google indexes the mobile version, it's the default I use."`,
      mistakes: [
        'Thinking Tailwind `sm:` targets phones. It targets sm **and up**; phones use the unprefixed classes.',
        'Calling a site mobile-first just because it works on phones, while the CSS is full of `max-width` overrides.',
        'Designing only on a desktop monitor and checking mobile at the end.',
        'Follow-up trap: "Is desktop-first ever OK?" Yes — for internal admin tools used only on desktops it can be practical. Be consistent in one codebase.',
      ],
      takeaway: 'Base styles for phones, `min-width` queries to add for bigger screens — fewer overrides and clearer priorities.',
    },
    {
      id: 'css-variables',
      title: 'CSS Variables (Custom Properties)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Live variables in the browser (--brand: blue; color: var(--brand)) that cascade, can change at runtime, and power theming and dark mode.',
      what: `**CSS variables** (official name: **custom properties**) let you store a value once and reuse it.

- Define: \`--brand: #2563eb;\` (must start with two dashes).
- Use: \`color: var(--brand);\`
- Fallback: \`var(--brand, blue)\` uses \`blue\` if \`--brand\` is not set.
- Usually defined on \`:root\` (the \`<html>\` element) so the whole page can use them.

#### Deeper version
- They **cascade and inherit** like normal properties. You can redefine \`--brand\` inside \`.dark\` or \`.card\`, and only that part of the page changes.
- They are **live at runtime**: JavaScript can change them with \`element.style.setProperty('--brand', 'red')\`, and every use updates. This is the big difference from SCSS variables, which disappear at compile time.
- They are case-sensitive and are plain text until used, so \`--size: 20\` with \`width: var(--size)px\` does **not** work. Use \`calc(var(--size) * 1px)\`.
- \`@property\` can register a typed variable (e.g. \`<color>\`, \`<length>\`), which allows the browser to **animate** it. Supported in modern browsers.
- They are the base of most design-token systems and of Tailwind v4's theme, MUI's CSS variables mode and Mantine's theming.`,
      why: `They make theming (brand colours, dark mode, white-label apps) easy: change a few variables, the whole UI updates without rebuilding CSS. They also remove repeated magic values.`,
      analogy: `CSS variables are like the settings on a TV remote. Change "brightness" once and every channel looks brighter. SCSS variables are like the settings chosen at the factory — fixed once the TV is built.`,
      code: [
        {
          title: 'Theme with dark mode',
          lang: 'css',
          code: `:root {
  --bg: #ffffff;
  --text: #111827;
  --brand: #2563eb;
  --radius: 8px;
  --space: 16px;
}

[data-theme="dark"] {
  --bg: #0b1120;       /* only the variables change */
  --text: #e5e7eb;
}

body {
  background: var(--bg);
  color: var(--text);
}

.button {
  background: var(--brand);
  border-radius: var(--radius);
  padding: calc(var(--space) / 2) var(--space);
}

/* Local override: this section has a different brand colour */
.promo { --brand: #db2777; }`,
        },
        {
          title: 'Change variables from JavaScript',
          lang: 'javascript',
          code: `// Toggle theme
const root = document.documentElement;
const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
root.dataset.theme = next;

// Set a user-picked brand colour at runtime
root.style.setProperty('--brand', '#16a34a');

// Read the current value
const brand = getComputedStyle(root).getPropertyValue('--brand').trim();
console.log(brand); // "#16a34a"`,
        },
      ],
      output: `All colours come from variables. Setting \`data-theme="dark"\` on \`<html>\` swaps only the variable values, and the whole page goes dark without new CSS rules. Buttons inside \`.promo\` turn pink, because the variable is redefined there and children inherit it.

The JavaScript flips the theme and changes the brand colour live. Every button updates instantly, and reading the value back prints \`#16a34a\`.`,
      questions: [
        {
          q: 'CSS variables vs SCSS variables?',
          a: 'SCSS variables are replaced at build time and do not exist in the browser. CSS variables live in the browser, cascade, inherit, and can change at runtime with JavaScript or media queries.',
        },
        {
          q: 'How do you implement dark mode with CSS variables?',
          a: 'Define colour variables on `:root`, redefine them under `[data-theme="dark"]` or `@media (prefers-color-scheme: dark)`, and use only the variables in components.',
        },
        {
          q: 'Why does `width: var(--size)px` not work?',
          a: 'Variables are substituted as tokens, so it does not join into "20px". Store the unit in the variable or use `calc(var(--size) * 1px)`.',
        },
        {
          q: 'Can you animate a CSS variable?',
          a: 'Not smoothly by default, because the browser does not know its type. Register it with `@property` and a syntax like `<color>`, then it can be transitioned.',
        },
      ],
      spoken: `"CSS custom properties are variables that live in the browser. I define them on root, like dash dash brand, and use them with var. The key difference from SCSS variables is that they cascade and can change at runtime — I can redefine them inside a class, a media query, or set them from JavaScript. That makes theming and dark mode really simple: components only use variables, and switching a data-theme attribute on html swaps all the values. I usually use SCSS or Tailwind for build-time things and CSS variables for anything that changes at runtime."`,
      mistakes: [
        'Forgetting the two dashes, or treating names as case-insensitive (`--Brand` and `--brand` are different).',
        'Gluing units after a variable (`var(--x)px`). Use `calc()` or include the unit.',
        'Using SCSS variables for a runtime theme toggle — they no longer exist in the browser.',
        'Follow-up trap: "What happens if a variable is invalid where it is used?" The property becomes invalid at computed-value time and falls back to the inherited or initial value, not to the previous declaration.',
      ],
      takeaway: 'CSS variables are live, cascading values — the simplest way to do theming and dark mode.',
    },
    {
      id: 'transforms-transitions',
      title: 'Transforms and Transitions',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'transform moves, scales or rotates an element visually; transition animates a property change smoothly from A to B.',
      what: `- **transform** changes how an element is **drawn**: \`translate\` (move), \`scale\` (resize), \`rotate\`, \`skew\`. It does **not** change the layout — other elements do not move.
- **transition** animates a change between two values when something triggers it (hover, a class added by JavaScript).

\`transition: transform 200ms ease-out;\` means: when \`transform\` changes, animate it over 200 milliseconds with an ease-out curve.

#### Deeper version
- **Performance:** \`transform\` and \`opacity\` can usually be animated by the **compositor** (often on the GPU) without recalculating layout or repainting. Animating \`width\`, \`height\`, \`top\`, \`left\` or \`margin\` triggers layout on every frame and can stutter. So move with \`translate\`, not \`left\`.
- \`will-change: transform\` hints the browser to prepare a separate layer. Use it sparingly; too many layers use lots of memory.
- \`transform-origin\` sets the pivot point (default: center).
- Order matters: \`translate(50px) rotate(45deg)\` is different from \`rotate(45deg) translate(50px)\`.
- A transformed element creates a new **stacking context** and becomes the **containing block** for fixed and absolute children.
- Newer individual properties \`translate\`, \`scale\`, \`rotate\` (supported in modern browsers) can be set and transitioned separately.
- You cannot transition \`display\` or \`height: auto\` the classic way. Common tricks: animate \`max-height\`, use \`grid-template-rows: 0fr\` → \`1fr\`, or JavaScript.`,
      why: `Small motion makes a UI feel responsive and polished: button press feedback, card hover lifts, sliding drawers, toast notifications. Doing it with transform and opacity keeps it smooth at 60fps, even on mid-range phones.`,
      analogy: `\`transform\` is like moving a projection on a wall with your hands — the furniture in the room does not move. \`transition\` is the dimmer switch on a light: instead of on/off instantly, it fades smoothly.`,
      code: [
        {
          title: 'Hover lift and button press',
          lang: 'css',
          code: `.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);          /* move up, layout unchanged */
  box-shadow: 0 10px 20px rgb(0 0 0 / 0.15);
}

.button:active {
  transform: scale(0.97);               /* tiny "press" effect */
}

.icon-arrow {
  transition: transform 150ms;
}
.open .icon-arrow {
  transform: rotate(180deg);            /* chevron flips when open */
}`,
        },
        {
          title: 'Slide-in drawer (good vs bad)',
          lang: 'css',
          code: `/* GOOD: transform only -> smooth */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  transform: translateX(100%);       /* hidden off screen */
  transition: transform 300ms ease;
}
.drawer.open { transform: translateX(0); }

/* BAD: animating "right" triggers layout every frame */
.drawer-bad { position: fixed; right: -320px; transition: right 300ms; }
.drawer-bad.open { right: 0; }`,
        },
      ],
      output: `Hovering a card moves it 4px up with a softer shadow, over 200ms. The cards below do not jump, because transform does not affect layout. Clicking a button shrinks it slightly while pressed. The arrow icon rotates when its parent gets the \`open\` class.

Both drawers look the same, but the transform version is smoother on slow devices because the browser can move an existing layer instead of recalculating layout 60 times per second.`,
      questions: [
        {
          q: 'Why animate transform instead of top/left?',
          a: 'Changing top/left triggers layout and paint every frame. Transform (and opacity) can usually be handled by the compositor, so it is much smoother.',
        },
        {
          q: 'Does transform affect the layout of other elements?',
          a: 'No. The element keeps its original space in the layout; only its drawing moves.',
        },
        {
          q: 'How do you animate height to auto?',
          a: 'Classic transitions cannot animate to `auto`. Options: animate `max-height`, use grid rows from `0fr` to `1fr`, measure with JavaScript, or use a library. Newer CSS features for this exist, but check current browser support.',
        },
        {
          q: 'What does will-change do?',
          a: 'It tells the browser a property will change soon, so it can prepare (often a separate layer). Overusing it wastes memory, so add it only where needed.',
        },
      ],
      spoken: `"Transform changes how an element is drawn — translate, scale, rotate — without changing layout, so neighbours don't move. Transition animates a property change smoothly, like on hover or when JavaScript toggles a class. For performance I stick to animating transform and opacity, because the browser can do them on the compositor without layout or paint, so they stay smooth. Animating top, left, width or height causes layout every frame. One gotcha: a transform on a parent creates a new stacking context and breaks position fixed for children."`,
      mistakes: [
        'Animating `left`, `top`, `width` or `margin` and getting janky animations.',
        'Using `transition: all`. It animates properties you did not expect and can hurt performance; list the properties.',
        'Adding `will-change` to many elements "for speed", which uses extra memory.',
        'Follow-up trap: "Why did my position: fixed child stop being fixed?" An ancestor has a `transform`, which makes it the containing block. Move the element out (e.g. a React portal).',
      ],
      takeaway: 'Move things with transform, fade with opacity, and transition only the properties you list.',
    },
    {
      id: 'animations-keyframes',
      title: 'CSS Animations (@keyframes)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: '@keyframes define multi-step animations that can run on their own, loop, and be paused — unlike transitions, which need a trigger.',
      what: `A **CSS animation** has two parts:
1. \`@keyframes name { from {...} to {...} }\` — the steps of the animation (you can also use percentages: \`0%\`, \`50%\`, \`100%\`).
2. \`animation: name 1s ease-in-out infinite;\` — applies it to an element.

**Transition vs animation:**
- A **transition** goes from A to B and needs a **trigger** (hover, class change).
- An **animation** can have **many steps**, start on its own when the page loads, **loop**, reverse and pause.

#### Deeper version
The \`animation\` shorthand includes:
- \`animation-duration\`, \`animation-timing-function\` (\`ease\`, \`linear\`, \`cubic-bezier()\`, \`steps()\`),
- \`animation-delay\`, \`animation-iteration-count\` (\`infinite\`),
- \`animation-direction\` (\`alternate\` goes back and forth),
- \`animation-fill-mode\` (\`forwards\` keeps the last frame after it ends; \`both\` also applies the first frame during the delay),
- \`animation-play-state\` (\`paused\`/\`running\`).

JavaScript can listen to \`animationend\`. The **Web Animations API** (\`element.animate([...], {...})\`) gives the same power from JavaScript. Libraries like Framer Motion (now called Motion) build on these ideas for React. Always respect \`prefers-reduced-motion\`.`,
      why: `Loading spinners, skeleton shimmer, pulsing notifications, attention-seeking badges and entrance effects all need animations that run without user action or that have more than two steps.`,
      analogy: `A transition is a door that slides open when you walk up to it (needs a trigger, goes from closed to open). A keyframe animation is a cuckoo clock: it runs on its own schedule, goes through several steps, and repeats.`,
      code: [
        {
          title: 'Spinner and skeleton shimmer',
          lang: 'css',
          code: `@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes shimmer {
  0%   { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
.skeleton {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 400px 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .spinner, .skeleton { animation: none; }
}`,
        },
        {
          title: 'Entrance animation that keeps the final state',
          lang: 'css',
          code: `@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.toast {
  /* name | duration | easing | delay | fill-mode */
  animation: fade-up 300ms ease-out 100ms both;
}`,
        },
      ],
      output: `The spinner rotates forever at a constant speed (\`linear\`), with one blue segment on a grey ring. The skeleton bar shows a light band sliding across it in a loop, which tells users content is loading. Users with reduced motion get static versions.

The toast waits 100ms, then fades and slides up into place. Because of \`both\`, it stays invisible during the delay (first frame applied) and stays visible at the end (last frame kept). Without \`forwards\`/\`both\`, it would jump back to the original styles after the animation.`,
      questions: [
        {
          q: 'Difference between transition and animation?',
          a: 'Transitions animate between two states and need a trigger. Animations use `@keyframes`, can have many steps, start automatically, loop and be paused.',
        },
        {
          q: 'What does animation-fill-mode: forwards do?',
          a: 'It keeps the styles of the last keyframe after the animation finishes instead of jumping back to the original styles.',
        },
        {
          q: 'How do you make an animation smooth?',
          a: 'Animate only `transform` and `opacity`, keep durations short for UI (150-400ms), use easing, and avoid animating layout properties.',
        },
        {
          q: 'How do you run code after a CSS animation ends?',
          a: 'Listen for the `animationend` event (or `transitionend` for transitions) on the element.',
        },
      ],
      spoken: `"CSS animations use keyframes to define steps, and the animation property to apply them with a duration, easing, delay, iteration count and fill mode. The difference from transitions is that a transition goes between two states and needs a trigger, while an animation can have many steps, start by itself and loop — like spinners and skeleton loaders. I keep animations on transform and opacity for performance, use fill-mode forwards or both so entrance animations keep their final state, and I always add a prefers-reduced-motion rule to disable them for users who need it."`,
      mistakes: [
        'Forgetting `animation-fill-mode`, so the element jumps back after the animation ends.',
        'Animating `width` or `left` in a loop, which hurts performance.',
        'Ignoring `prefers-reduced-motion` — large motion can cause nausea for some users.',
        'Follow-up trap: "What is `steps()` used for?" It makes the animation jump in discrete steps instead of smoothly, useful for sprite-sheet animations or a typing effect.',
      ],
      takeaway: 'Transitions for A→B on a trigger; @keyframes for multi-step, automatic or looping motion — on transform and opacity.',
    },
    {
      id: 'z-index-stacking-context',
      title: 'z-index and Stacking Context',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'z-index orders overlapping elements, but only inside the same stacking context — a child can never escape its parent\'s context.',
      what: `\`z-index\` decides which element is **on top** when elements overlap. Bigger number = closer to the viewer.

Rules:
- It works on **positioned** elements (\`relative\`, \`absolute\`, \`fixed\`, \`sticky\`) and on flex/grid **children**.
- It only compares elements **inside the same stacking context**.

A **stacking context** is like a separate layer group. Everything inside it is stacked together, and then the whole group is placed as **one unit** in its parent.

#### Deeper version
Things that create a new stacking context (common ones):
- The root \`<html>\`.
- \`position\` relative/absolute with a \`z-index\` other than \`auto\`.
- \`position: fixed\` or \`sticky\` (always).
- \`opacity\` less than 1.
- \`transform\`, \`filter\`, \`perspective\`, \`clip-path\`, \`mask\`, \`backdrop-filter\`.
- \`isolation: isolate\`.
- \`will-change\` with one of those properties.
- Flex or grid children with \`z-index\` not \`auto\`.

That is why \`z-index: 9999\` sometimes "does nothing": the element is inside a parent that has, for example, \`z-index: 1\` or a \`transform\`. The child's 9999 only counts **inside** that parent. The parent as a whole is compared with its siblings using its own value. Solution: fix the parent's stacking, or render the overlay at the top level (React portal to \`<body>\`).`,
      why: `Modals hidden behind headers, dropdowns cut under the next section, tooltips behind cards — these are daily bugs. Understanding stacking contexts fixes them properly instead of adding \`z-index: 999999\`.`,
      analogy: `Think of folders on a desk. Each folder is a stacking context. Inside folder A, a page marked "999" is on top of the other pages in **folder A**. But if folder B is lying on top of folder A, every page in folder B covers every page in folder A, no matter what number the pages have.`,
      code: [
        {
          title: 'Why z-index: 9999 loses',
          lang: 'html',
          code: `<div class="header">Header</div>
<div class="content">
  <div class="dropdown">Dropdown menu</div>
</div>

<style>
  .header {
    position: relative;
    z-index: 2;
  }
  .content {
    position: relative;
    z-index: 1;               /* creates a stacking context */
  }
  .dropdown {
    position: absolute;
    z-index: 9999;            /* only "9999 inside .content" */
  }
</style>
<!-- The dropdown stays BEHIND .header, because .content (1) < .header (2) -->`,
        },
        {
          title: 'Fix: z-index scale and isolation',
          lang: 'css',
          code: `/* 1. A small shared scale instead of random numbers */
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
}

/* 2. Create a local context on purpose so inner z-indexes don't leak */
.card {
  isolation: isolate;
}
.card .badge { position: absolute; z-index: 1; } /* only within the card */

/* 3. Modals: render at body level (React portal) and use the modal layer */
.modal-root { position: fixed; inset: 0; z-index: var(--z-modal); }`,
        },
      ],
      output: `In the first example the dropdown is hidden behind the header, even with 9999. The browser first compares \`.header\` (2) with \`.content\` (1): the header wins. The dropdown's 9999 only matters among siblings inside \`.content\`.

The fix uses a small named z-index scale, \`isolation: isolate\` to keep a component's internal z-indexes local, and portals for modals so they are not trapped inside any parent's stacking context.`,
      questions: [
        {
          q: 'Why does z-index not work on my element?',
          a: 'Either the element is not positioned (and not a flex/grid child), or it is inside a parent stacking context that is below another element. z-index only competes within the same context.',
        },
        {
          q: 'What creates a stacking context?',
          a: 'The root, positioned elements with a z-index, fixed/sticky elements, opacity below 1, transform, filter, isolation: isolate, and some others like will-change.',
        },
        {
          q: 'How do you make sure a modal is always on top?',
          a: 'Render it in a portal directly under `<body>` so no parent context traps it, and give it a high z-index from a shared scale.',
        },
        {
          q: 'What does `isolation: isolate` do?',
          a: 'It creates a new stacking context without needing position or z-index, keeping a component\'s inner z-index values from mixing with the outside.',
        },
      ],
      spoken: `"z-index controls which overlapping element is on top, but only within the same stacking context. A stacking context is created by things like a positioned element with a z-index, opacity below one, transform, filter, or isolation isolate. Everything inside is flattened and stacked as one unit in its parent. That's why z-index 9999 sometimes does nothing — the parent itself is below something else. I fix it by checking the parent chain in DevTools, using a small shared z-index scale, and rendering modals and toasts through a portal at body level."`,
      mistakes: [
        'Adding bigger and bigger z-index numbers instead of finding which parent creates the stacking context.',
        'Setting `z-index` on a `position: static` element (outside flex/grid) — it has no effect.',
        'Adding `opacity: 0.99` or a `transform` for an animation and accidentally creating a new stacking context.',
        'Follow-up trap: "Can a child with z-index 1000 appear above its parent\'s sibling with z-index 2 if the parent has z-index 1?" No. The child is stuck inside the parent\'s context.',
      ],
      takeaway: 'z-index only competes inside one stacking context — find the parent that creates it instead of raising the number.',
    },
    {
      id: 'bem',
      title: 'BEM Naming',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Block__Element--Modifier: a class naming convention that keeps CSS flat, readable and conflict-free.',
      what: `**BEM** stands for **Block, Element, Modifier**. It is a naming rule for CSS classes.

- **Block** — a stand-alone component: \`.card\`
- **Element** — a part of the block, joined with two underscores: \`.card__title\`, \`.card__image\`
- **Modifier** — a variation or state, joined with two dashes: \`.card--featured\`, \`.card__button--disabled\`

You style everything with **one class**, not long nested selectors.

#### Deeper version
- BEM keeps **specificity flat** (always one class = (0,1,0)), so any rule can be overridden easily and order is predictable.
- The name tells you where the HTML lives: \`.card__title\` belongs inside \`.card\`.
- Elements are not nested in the name: use \`.card__title\`, not \`.card__header__title\`, even if the title is inside the header.
- Modifiers are used **together with** the base class: \`class="card card--featured"\`.
- In SCSS, BEM pairs well with \`&\`: \`.card { &__title {} &--featured {} }\`.
- Today CSS Modules, CSS-in-JS and Tailwind solve naming conflicts automatically, so BEM is less needed in React apps. It is still common in plain CSS/SCSS projects, design systems and WordPress-style sites.`,
      why: `In big projects, global CSS class names clash (two different \`.title\` styles). Deep selectors like \`.sidebar ul li a span\` are fragile and high specificity. BEM fixes both with a simple naming rule everyone on the team can follow.`,
      analogy: `BEM is like a full postal address: "Card building (block), Title room (element), the big version (modifier)". Nobody confuses it with the "Title room" in another building.`,
      code: [
        {
          title: 'HTML with BEM classes',
          lang: 'html',
          code: `<article class="card card--featured">
  <img class="card__image" src="shoe.jpg" alt="Red running shoe" />
  <h3 class="card__title">Air Runner 2</h3>
  <p class="card__price">$120</p>
  <button class="card__button card__button--disabled" disabled>Sold out</button>
</article>`,
        },
        {
          title: 'BEM in SCSS with &',
          lang: 'scss',
          code: `.card {
  padding: 16px;
  border: 1px solid #e5e7eb;

  &__image { width: 100%; border-radius: 8px; }   // .card__image
  &__title { font-size: 1.125rem; }               // .card__title
  &__price { color: #16a34a; }                    // .card__price

  &__button {                                     // .card__button
    background: #2563eb;

    &--disabled { background: #9ca3af; }          // .card__button--disabled
  }

  &--featured { border-color: #f59e0b; }          // .card--featured
}`,
        },
      ],
      output: `The SCSS compiles to flat, single-class selectors: \`.card__image\`, \`.card__title\`, \`.card__button--disabled\`, \`.card--featured\` and so on. Every selector has the same low specificity, so there are no surprise overrides. The featured card gets an orange border, and the disabled button is grey. Reading the HTML, you know exactly which CSS file and block each class belongs to.`,
      questions: [
        {
          q: 'What does BEM stand for?',
          a: 'Block, Element, Modifier. `.block__element--modifier`.',
        },
        {
          q: 'Why use BEM?',
          a: 'It avoids class name conflicts, keeps specificity flat (one class), and makes the relation between HTML and CSS obvious.',
        },
        {
          q: 'Do you still need BEM with React?',
          a: 'Less so. CSS Modules, CSS-in-JS and Tailwind scope styles automatically. BEM is still useful with plain global CSS or SCSS.',
        },
        {
          q: 'How do you name an element inside an element?',
          a: 'Do not chain elements. Use `.card__title` even if the title is inside `.card__header`. Each element belongs to the block.',
        },
      ],
      spoken: `"BEM is a naming convention: Block, Element, Modifier. The block is the component, like card. Elements are its parts, joined with double underscore, like card underscore underscore title. Modifiers are variations, joined with double dash, like card dash dash featured. The main benefit is that every selector is a single class, so specificity stays flat and predictable, and names don't clash across the app. In SCSS I write it with the ampersand. In React projects I often get the same benefit from CSS Modules or Tailwind, but on plain SCSS codebases BEM is my default."`,
      mistakes: [
        'Chaining elements like `.card__header__title`. Keep elements one level under the block.',
        'Using a modifier class alone (`class="card--featured"`) without the base `card` class.',
        'Nesting BEM selectors in SCSS (`.card .card__title`) and raising specificity for no reason.',
        'Follow-up trap: "Is BEM a CSS feature?" No, it is only a naming convention. The browser treats them as normal class names.',
      ],
      takeaway: 'BEM = `.block__element--modifier`, one class per selector — readable, flat and conflict-free.',
    },
    {
      id: 'scss-basics',
      title: 'SCSS Basics: variables, nesting, partials',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'SCSS is CSS with superpowers (variables, nesting, partials, mixins) that compiles to plain CSS at build time.',
      what: `**Sass** is a CSS **preprocessor**: you write in an extended language, and a compiler turns it into normal CSS that the browser understands. **SCSS** is its most popular syntax — any valid CSS is also valid SCSS.

Main features:
- **Variables:** \`$primary: #2563eb;\` then \`color: $primary;\`
- **Nesting:** write child selectors inside the parent. \`&\` means "the parent selector".
- **Partials:** files starting with \`_\` like \`_buttons.scss\`. They are not compiled alone; you load them into a main file.
- **Mixins, functions, loops, maths** (next topic covers mixins, \`@extend\` and \`@use\`).

#### Deeper version
- SCSS variables exist **only at compile time**. After build, the browser sees only the final values. For runtime theming use CSS variables (you can set CSS variables from SCSS: \`--brand: #{$primary};\`).
- \`#{...}\` is **interpolation**: it inserts a value into a selector, property name or string.
- Variables follow block scope; \`!default\` sets a value only if none was set (great for libraries that let users configure them).
- Do not nest deeper than about 3 levels. Deep nesting creates long, high-specificity selectors that are hard to override.
- The official compiler today is **Dart Sass** (the \`sass\` npm package). LibSass and node-sass are deprecated. Vite and Next.js support \`.scss\` files once \`sass\` is installed.
- Native CSS now has nesting too (supported in modern browsers), and CSS variables replace many SCSS variable uses, so some teams drop Sass. SCSS still adds mixins, functions, loops and modules.`,
      why: `Large stylesheets get repetitive. SCSS lets you reuse values, organise styles into many small files, and write less repetitive code, while still shipping plain CSS. Many existing codebases and component libraries (Bootstrap) use it.`,
      analogy: `SCSS is like writing a recipe with shortcuts ("add the usual sauce"). The compiler is the cook who expands every shortcut into full steps. The guest (browser) only ever sees the final dish, never the shortcuts.`,
      code: [
        {
          title: 'Variables, nesting and &',
          lang: 'scss',
          code: `// _variables.scss  (a partial)
$primary: #2563eb;
$radius: 8px;
$space: 16px;

// _buttons.scss
@use 'sass:color';
@use 'variables' as *;

.btn {
  padding: $space * 0.5 $space;
  border-radius: $radius;
  background: $primary;

  &:hover { background: color.adjust($primary, $lightness: -10%); } // .btn:hover
  &:disabled { opacity: 0.5; }          // .btn:disabled
  &--outline {                           // .btn--outline
    background: transparent;
    border: 1px solid $primary;
  }
  .icon { margin-right: 4px; }          // .btn .icon
}

// Expose an SCSS value as a CSS variable for runtime use
:root { --brand: #{$primary}; }`,
        },
        {
          title: 'Partials loaded into a main file',
          lang: 'scss',
          code: `// styles/main.scss -> compiled to main.css
@use 'variables';
@use 'buttons';
@use 'cards';

// Folder structure:
// styles/
//   _variables.scss
//   _buttons.scss
//   _cards.scss
//   main.scss`,
        },
      ],
      output: `The compiler produces plain CSS like \`.btn { padding: 8px 16px; border-radius: 8px; background: #2563eb; }\`, \`.btn:disabled {...}\`, \`.btn--outline {...}\` and \`.btn .icon {...}\`. The \`$\` variables are gone in the output. \`:root { --brand: #2563eb; }\` is created through interpolation, so JavaScript can still read and change the colour at runtime.

\`main.scss\` combines all partials into one \`main.css\`. The underscore files are never output on their own.`,
      questions: [
        {
          q: 'What is SCSS and how is it different from CSS?',
          a: 'A superset of CSS that adds variables, nesting, partials, mixins, functions and loops. It compiles to plain CSS at build time; browsers never run SCSS.',
        },
        {
          q: 'SCSS variables vs CSS variables?',
          a: 'SCSS variables are replaced at compile time and cannot change at runtime. CSS variables live in the browser, cascade and can change with JavaScript or media queries.',
        },
        {
          q: 'What is a partial?',
          a: 'An SCSS file whose name starts with `_`. It is not compiled to its own CSS file; it is loaded into another file with `@use` or `@forward`.',
        },
        {
          q: 'What does `&` mean in SCSS?',
          a: 'It refers to the parent selector. `&:hover` becomes `.btn:hover`, and `&--outline` becomes `.btn--outline`.',
        },
      ],
      spoken: `"SCSS is a CSS preprocessor syntax — it adds variables, nesting, partials, mixins and functions, and compiles to normal CSS at build time with Dart Sass. I use variables for design values, nesting with the ampersand for states and BEM modifiers, and partials — files starting with an underscore — to split styles into small modules loaded with use. I keep nesting shallow so specificity doesn't explode. One key point is that SCSS variables disappear after compile, so for runtime theming like dark mode I output CSS custom properties from SCSS."`,
      mistakes: [
        'Nesting 5-6 levels deep to mirror the HTML, creating huge selectors like `.page .main .list .item a span`.',
        'Expecting SCSS variables to change at runtime (e.g. for a dark mode toggle).',
        'Still using `node-sass`, which is deprecated. Use the `sass` (Dart Sass) package.',
        'Follow-up trap: "Does SCSS make the CSS faster in the browser?" No. The browser gets plain CSS either way; SCSS only helps the developer. Bad nesting can even make the output bigger.',
      ],
      takeaway: 'SCSS = variables, nesting and partials compiled to plain CSS; keep nesting shallow and use CSS variables for runtime values.',
    },
    {
      id: 'scss-mixins-extend-use',
      title: 'SCSS Mixins, @extend, @use and @forward',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Mixins copy a reusable block of styles (with arguments); @extend shares a selector; @use/@forward is the modern module system that replaces @import.',
      what: `- **Mixin** — a reusable block of styles, like a function that outputs CSS. Define with \`@mixin name($arg) { ... }\`, use with \`@include name(value)\`.
- **@extend** — makes one selector **share** the styles of another. \`.error { @extend .alert; }\` adds \`.error\` to the \`.alert\` rule.
- **Placeholder selector** \`%name\` — a selector that is never output alone; it exists only to be extended.
- **@use** — loads another SCSS file as a **module** with its own namespace: \`@use 'colors';\` then \`colors.$primary\`.
- **@forward** — re-exports a module, so one "index" file can expose many partials.

#### Deeper version
**Mixin vs @extend:**
- A mixin **copies** the declarations into every place you include it. It can take arguments and a content block (\`@content\`). Output can be bigger, but it is predictable.
- \`@extend\` **groups selectors** together (\`.alert, .error { ... }\`). Output is smaller, but it can create unexpected long selector lists, it does not work across media queries, and it changes the order of rules. Many teams prefer mixins (or placeholders only) for this reason.

**@use vs @import:**
- \`@import\` puts everything into one global scope, can load the same file many times, and makes it hard to know where a variable came from. It is **deprecated** in recent Dart Sass versions and planned for removal in a future major version (check the Sass docs for the exact timeline).
- \`@use\` loads each file **once**, gives it a **namespace**, keeps private members (names starting with \`-\` or \`_\`) private, and allows configuration with \`@use 'theme' with ($primary: red)\`.
- Built-in modules use it too: \`@use 'sass:math';\` then \`math.div(10px, 2)\` (the \`/\` operator for division is deprecated).`,
      why: `Mixins remove repeated patterns (media queries, truncation, focus rings). The module system keeps big style codebases organised and avoids "which file defined this variable?" problems. Interviewers ask "mixin vs extend" and "@use vs @import" to check you know modern Sass.`,
      analogy: `A **mixin** is a stamp: every time you use it, you print a fresh copy of the pattern on the page. **@extend** is adding your name to an existing group chat: you share the same messages instead of copying them. **@use** is importing a library in JavaScript with a name, instead of dumping all its variables into the global window.`,
      code: [
        {
          title: 'Mixins with arguments and @content',
          lang: 'scss',
          code: `@use 'sass:map';

$breakpoints: (sm: 640px, md: 768px, lg: 1024px);

// Mixin with @content: wrap any styles in a media query
@mixin up($bp) {
  @media (min-width: map.get($breakpoints, $bp)) {
    @content;
  }
}

// Mixin with arguments and a default value
@mixin truncate($lines: 1) {
  overflow: hidden;
  @if $lines == 1 {
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
  }
}

.card__title {
  @include truncate(2);
  font-size: 1rem;

  @include up(md) { font-size: 1.25rem; }
}`,
        },
        {
          title: '@extend with a placeholder, and @use/@forward',
          lang: 'scss',
          code: `// _alerts.scss
%alert-base {               // never output on its own
  padding: 12px 16px;
  border-radius: 6px;
}
.alert-success { @extend %alert-base; background: #dcfce7; }
.alert-error   { @extend %alert-base; background: #fee2e2; }
// Output: .alert-success, .alert-error { padding...; border-radius... }

// _colors.scss
$primary: #2563eb !default;   // can be configured by the user

// abstracts/_index.scss
@forward 'colors';
@forward 'mixins';

// main.scss
@use 'abstracts' as a with ($primary: #7c3aed);
.btn { background: a.$primary; }  // namespaced access`,
        },
      ],
      output: `\`.card__title\` gets the two-line truncation styles copied into it, and a media query \`@media (min-width: 768px) { .card__title { font-size: 1.25rem; } }\` is generated by the \`up\` mixin.

The alerts share one rule \`.alert-success, .alert-error { padding: 12px 16px; border-radius: 6px; }\`, then each adds its own background. \`%alert-base\` itself never appears in the CSS. In \`main.scss\`, \`@use ... with\` overrides the \`!default\` colour, so \`.btn\` gets \`#7c3aed\`, accessed through the \`a.\` namespace.`,
      questions: [
        {
          q: 'Mixin vs @extend?',
          a: 'A mixin copies its styles into each place and can take arguments. @extend groups selectors to share one rule — smaller output but can create unexpected selectors and does not work across media queries. I prefer mixins, or @extend only with placeholders.',
        },
        {
          q: 'Why is @use preferred over @import?',
          a: '@use loads a file once, namespaces its members, keeps private ones private and allows configuration. @import dumps everything into the global scope and is deprecated in Dart Sass.',
        },
        {
          q: 'What is a placeholder selector?',
          a: 'A selector starting with `%`. It produces no CSS on its own and exists only to be extended.',
        },
        {
          q: 'What does @content do in a mixin?',
          a: 'It inserts the block of styles passed by the caller in that spot — perfect for media query or state wrappers.',
        },
      ],
      spoken: `"A mixin is a reusable block of styles that can take arguments — I include it with at-include, and it copies the declarations in. I use mixins for breakpoints with at-content, text truncation and focus rings. At-extend instead shares a selector, so the output groups selectors together; it's smaller but can produce surprising selectors and doesn't work across media queries, so I only extend placeholder selectors. For file loading I use at-use and at-forward instead of at-import: use gives each file a namespace, loads it once, and allows configuration with with. At-import is deprecated in Dart Sass."`,
      mistakes: [
        'Using `@extend` on regular classes everywhere and getting giant, hard-to-debug selector lists.',
        'Trying to `@extend` a selector from inside a media query — Sass does not allow extending outside selectors across media boundaries.',
        'Using `/` for division. Use `math.div()` from `sass:math`.',
        'Follow-up trap: "With @use, why is my variable undefined?" Members are namespaced: use `colors.$primary`, or `@use \'colors\' as *` to drop the namespace.',
      ],
      takeaway: 'Mixins copy styles (with arguments), @extend shares selectors (use with placeholders), and @use/@forward replace @import.',
    },
    {
      id: 'script-async-defer',
      title: 'Script loading: async vs defer',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A normal script blocks HTML parsing; async runs as soon as it downloads (any order); defer runs after parsing, in order.',
      what: `When the browser reads (parses) HTML and finds a \`<script src>\`, what happens depends on the attributes:

- **No attribute** — parsing **stops**, the script downloads and runs, then parsing continues. This blocks the page.
- **async** — downloads **in parallel** with parsing. Runs **as soon as it is downloaded**, pausing parsing for that moment. Order between async scripts is **not guaranteed**.
- **defer** — downloads in parallel. Runs **after the HTML is fully parsed**, just before \`DOMContentLoaded\`, **in the order** they appear.

#### Deeper version
- Use **defer** for your app code that needs the DOM or depends on other scripts (order matters).
- Use **async** for independent third-party scripts (analytics, ads) that do not depend on anything and nothing depends on them.
- \`<script type="module">\` is **deferred by default**. You can add \`async\` to a module to run it as soon as it and its imports are ready.
- \`async\` and \`defer\` only work for **external** scripts (\`src\`); they are ignored on inline classic scripts.
- Old advice was "put scripts at the end of \`<body>\`". \`defer\` in \`<head>\` is better: the download starts earlier while parsing continues.
- CSS can also block: a script that runs may wait for earlier stylesheets to load, because the script might read styles.
- Related hints: \`<link rel="preload">\` (download now, use soon), \`<link rel="preconnect">\` (open the connection early). In Next.js, the \`<Script strategy="...">\` component wraps these choices.`,
      why: `Render-blocking scripts delay the first paint and hurt Core Web Vitals (LCP). Choosing async/defer correctly is one of the easiest performance wins, and it is a very common interview question.`,
      analogy: `You are reading a book (parsing HTML). A **normal script** is a friend who makes you stop reading, go to the shop with them, and wait. **async** is ordering food delivery: you keep reading, but the moment it arrives you stop to eat, whenever that is. **defer** is ordering food for later: you keep reading, and you eat only after finishing the chapter, in the order you ordered.`,
      code: [
        {
          title: 'The three options',
          lang: 'html',
          code: `<head>
  <!-- Blocks parsing: avoid in <head> -->
  <script src="/legacy.js"></script>

  <!-- Independent third-party: order does not matter -->
  <script async src="https://example-analytics.com/tag.js"></script>

  <!-- App code: runs after HTML is parsed, in this order -->
  <script defer src="/vendor.js"></script>
  <script defer src="/app.js"></script>   <!-- can use vendor.js safely -->

  <!-- ES modules are deferred by default -->
  <script type="module" src="/main.js"></script>
</head>`,
        },
        {
          title: 'Proving the order',
          lang: 'javascript',
          code: `// app.js (loaded with defer)
console.log('app.js runs, DOM ready?', document.readyState); // "interactive"
console.log(document.querySelector('#root') !== null);       // true

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fires AFTER all deferred scripts ran');
});`,
        },
      ],
      output: `\`legacy.js\` stops the parser until it downloads and runs, delaying everything. The analytics script downloads in the background and runs whenever it is ready — maybe before, maybe after the app scripts. \`vendor.js\` and \`app.js\` download in parallel but run in order after parsing, so \`app.js\` can safely use \`vendor.js\` and find \`#root\` in the DOM. The logs show \`readyState\` is \`"interactive"\`, and \`DOMContentLoaded\` fires after the deferred scripts.`,
      questions: [
        {
          q: 'Difference between async and defer?',
          a: 'Both download in parallel with parsing. async runs as soon as it downloads, in any order. defer runs after parsing finishes, in document order, before DOMContentLoaded.',
        },
        {
          q: 'Which one would you use for analytics? For your app bundle?',
          a: 'async for independent analytics; defer (or type="module") for the app bundle because it needs the DOM and may depend on other scripts.',
        },
        {
          q: 'Are module scripts blocking?',
          a: 'No, `type="module"` scripts are deferred by default.',
        },
        {
          q: 'Why was it common to put scripts at the end of body?',
          a: 'So they did not block parsing of the content above. `defer` in the head is better because the download starts earlier.',
        },
      ],
      spoken: `"By default, a script tag blocks HTML parsing — the browser stops, downloads, runs it, then continues. With async, the script downloads in parallel and runs as soon as it arrives, so the order is not guaranteed — that's good for independent things like analytics. With defer, it also downloads in parallel but runs only after the HTML is parsed, in document order, right before DOMContentLoaded — that's what I use for app code. Module scripts are deferred by default. In Next.js I use the Script component's strategy prop to make the same choice."`,
      mistakes: [
        'Using `async` for scripts that depend on each other (like a library and a plugin), causing random "X is not defined" errors.',
        'Adding `defer` to an inline script and expecting it to wait — it is ignored without `src`.',
        'Thinking `defer` scripts run after images load. They run before `DOMContentLoaded`; the `load` event (images, etc.) comes later.',
        'Follow-up trap: "What if a script has both async and defer?" Modern browsers use async; defer was a fallback for very old browsers.',
      ],
      takeaway: 'Use defer for app code (ordered, after parsing), async for independent third-party scripts, and never block the parser.',
    },
    {
      id: 'seo-meta-tags',
      title: 'SEO and Meta Tags',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Help search engines and social apps understand your page: title, meta description, canonical, Open Graph, structured data, and semantic, fast HTML.',
      what: `**SEO (Search Engine Optimisation)** is making your pages easy for search engines to find, understand and rank.

Key tags in \`<head>\`:
- \`<title>\` — the clickable title in search results. Unique per page.
- \`<meta name="description">\` — the short summary under the title in results.
- \`<meta name="viewport">\` — needed for mobile-friendliness.
- \`<link rel="canonical">\` — tells Google which URL is the "real" one when the same content has several URLs.
- \`<meta name="robots" content="noindex">\` — keeps a page out of search results.
- **Open Graph** (\`og:title\`, \`og:image\`...) and **Twitter/X cards** — control the preview card when someone shares the link on social apps and chat apps.

#### Deeper version
- **Content signals:** one clear \`<h1>\`, logical headings, descriptive link text (not "click here"), alt text, semantic HTML.
- **Technical signals:** fast pages (Core Web Vitals), HTTPS, mobile-friendly, \`sitemap.xml\` and \`robots.txt\`, clean URLs, no broken links.
- **Structured data:** JSON-LD (\`<script type="application/ld+json">\`) using schema.org types (Product, Article, FAQ) can enable rich results like star ratings and prices.
- **SPAs and SEO:** a client-only React app sends almost empty HTML; Google can run JavaScript but it is slower and less reliable, and social preview bots usually do **not** run JavaScript at all. SSR/SSG (Next.js) sends full HTML. In the Next.js App Router, you set these tags with the \`metadata\` export or \`generateMetadata\`.
- \`<meta name="keywords">\` is ignored by Google today.`,
      why: `Organic search traffic is free and long-lasting. For e-commerce, blogs and SaaS landing pages, missing titles, broken previews or a client-only render can cost real money. Engineers own the technical part of SEO.`,
      analogy: `Meta tags are the label on a jar in a big store. The product inside may be great, but without a clear label (title), a short description, and a single shelf location (canonical), shoppers and store staff (search engines) cannot find or recommend it.`,
      code: [
        {
          title: 'A well-formed head',
          lang: 'html',
          code: `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Air Runner 2 – Light Running Shoe | ShopNow</title>
  <meta name="description" content="Light, breathable running shoe for daily training. Free returns within 30 days." />
  <link rel="canonical" href="https://shopnow.example/products/air-runner-2" />

  <!-- Social sharing preview -->
  <meta property="og:type" content="product" />
  <meta property="og:title" content="Air Runner 2" />
  <meta property="og:description" content="Light running shoe for daily training." />
  <meta property="og:image" content="https://shopnow.example/img/air-runner-2.jpg" />
  <meta name="twitter:card" content="summary_large_image" />

  <!-- Structured data for rich results -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Air Runner 2",
    "offers": { "@type": "Offer", "price": "120.00", "priceCurrency": "USD" }
  }
  </script>
</head>`,
        },
        {
          title: 'Same thing in Next.js App Router',
          lang: 'tsx',
          code: `// app/products/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params; // params is a Promise in recent Next.js versions
  return {
    title: 'Air Runner 2 | ShopNow',
    description: 'Light running shoe for daily training.',
    alternates: { canonical: '/products/' + slug },
    openGraph: { title: 'Air Runner 2', images: ['/img/air-runner-2.jpg'] },
  };
}`,
        },
      ],
      output: `In Google, the result shows "Air Runner 2 – Light Running Shoe | ShopNow" with the description below it. If the same product is reachable at \`?ref=email\` URLs, the canonical tag tells Google to rank only the clean URL. Shared on WhatsApp, Slack or LinkedIn, the link shows a card with the title, description and big image. The JSON-LD may let Google show the price in results.

In Next.js, the \`generateMetadata\` function produces the same tags on the server, so they are in the initial HTML. (Whether \`params\` is a Promise depends on your Next.js version — it is in Next 15+.)`,
      questions: [
        {
          q: 'Which meta tags matter most for SEO?',
          a: '`<title>`, `meta description`, `viewport`, canonical link, and robots when needed. Plus Open Graph tags for social previews. The keywords meta tag is ignored by Google.',
        },
        {
          q: 'What is a canonical URL?',
          a: 'A `<link rel="canonical">` that tells search engines the preferred URL when the same content is available at several URLs, so ranking signals are not split.',
        },
        {
          q: 'Why is a client-side-only React app worse for SEO?',
          a: 'The initial HTML is mostly empty. Google can render JS but it is delayed and less reliable, and social preview bots usually do not run JS. SSR or SSG sends complete HTML.',
        },
        {
          q: 'What is structured data?',
          a: 'JSON-LD using schema.org vocabulary that describes the page (product, article, FAQ). It can unlock rich results like ratings and prices.',
        },
      ],
      spoken: `"For SEO, I make sure every page has a unique title and meta description, the viewport tag, and a canonical link to avoid duplicate content. For social sharing I add Open Graph and Twitter card tags with a good image. On the content side, semantic HTML, one h1, good headings, alt text and descriptive links. Technically, speed and Core Web Vitals matter, plus a sitemap and robots.txt. For React apps, I prefer Next.js with SSR or SSG so the HTML arrives complete, and I use the metadata API there. I also add JSON-LD structured data for products and articles."`,
      mistakes: [
        'Using the same `<title>` and description on every page.',
        'Building marketing pages as a client-only SPA and wondering why link previews are blank.',
        'Forgetting canonical tags on pages with tracking parameters or filters, creating duplicate content.',
        'Follow-up trap: "Does adding `meta keywords` help ranking?" No, Google has ignored it for many years.',
      ],
      takeaway: 'Unique title + description, canonical, Open Graph, semantic fast HTML, and server-rendered content are the engineer\'s SEO basics.',
    },
    {
      id: 'responsive-images',
      title: 'Responsive Images (srcset, sizes, picture, lazy loading)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Send the right image size and format for each screen with srcset/sizes and <picture>, lazy-load below-the-fold images, and always set width/height.',
      what: `Images are usually the heaviest part of a page. **Responsive images** let the browser download a **smaller file on small screens** and a modern format when supported.

- \`srcset\` — a list of the same image in different widths: \`hero-480.jpg 480w, hero-1200.jpg 1200w\`.
- \`sizes\` — tells the browser how wide the image will be shown, so it can pick from \`srcset\`.
- \`<picture>\` with \`<source>\` — offer modern formats (AVIF, WebP) with a JPEG fallback, or different crops for mobile ("art direction").
- \`loading="lazy"\` — do not download until the image is near the viewport.
- \`width\` and \`height\` attributes — let the browser reserve space before the image loads.

#### Deeper version
- The browser chooses from \`srcset\` using \`sizes\` and the device pixel ratio (a 2x screen at 400px CSS width wants an ~800px image).
- **Never lazy-load the LCP image** (usually the hero). Instead, load it eagerly and add \`fetchpriority="high"\`. Lazy-loading it delays LCP.
- \`width\`/\`height\` attributes (or CSS \`aspect-ratio\`) prevent **layout shift (CLS)**. The browser computes the aspect ratio from them even if CSS makes the image fluid.
- \`decoding="async"\` lets image decoding happen off the main path.
- In Next.js, \`next/image\` generates \`srcset\`, lazy-loads by default, and has a \`priority\` prop for the hero image (newer versions may name this differently — check the docs for your version).`,
      why: `Sending a 3000px desktop image to a phone wastes data and slows LCP. Missing dimensions cause content to jump (bad CLS). Responsive images are one of the biggest and easiest performance wins.`,
      analogy: `It is like a clothes shop that keeps the same shirt in S, M, L and XL. Instead of giving everyone the XL (biggest file), you tell the shop your size (\`sizes\`) and it hands you the right one (\`srcset\`).`,
      code: [
        {
          title: 'srcset + sizes, and the hero image',
          lang: 'html',
          code: `<!-- Hero (likely the LCP element): eager + high priority -->
<img
  src="/img/hero-1200.jpg"
  srcset="/img/hero-600.jpg 600w, /img/hero-1200.jpg 1200w, /img/hero-2000.jpg 2000w"
  sizes="100vw"
  width="1200" height="600"
  alt="Runner on a mountain trail at sunrise"
  fetchpriority="high"
/>

<!-- Product thumbnails below the fold: lazy -->
<img
  src="/img/shoe-400.jpg"
  srcset="/img/shoe-400.jpg 400w, /img/shoe-800.jpg 800w"
  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
  width="400" height="400"
  alt="Red running shoe, side view"
  loading="lazy"
  decoding="async"
/>`,
        },
        {
          title: 'Modern formats with <picture>',
          lang: 'html',
          code: `<picture>
  <source type="image/avif" srcset="/img/team.avif" />
  <source type="image/webp" srcset="/img/team.webp" />
  <!-- Fallback for browsers that support neither -->
  <img src="/img/team.jpg" width="800" height="500" alt="Our team at the 2026 offsite" loading="lazy" />
</picture>

<style>
  img { max-width: 100%; height: auto; } /* fluid, keeps aspect ratio */
</style>`,
        },
      ],
      output: `A phone 400px wide at 2x density shows the hero at full width, so it needs about 800px and picks \`hero-1200.jpg\` (the smallest that is big enough) instead of the 2000px one. The hero starts downloading with high priority. Thumbnails take 25% of the width on desktop, 50% on tablets and 100% on phones, and they load only when the user scrolls near them.

The \`<picture>\` example gives AVIF to browsers that support it, WebP to others, and JPEG as the last fallback. Thanks to \`width\`/\`height\`, the space for each image is reserved before it loads, so text does not jump.`,
      questions: [
        {
          q: 'What do srcset and sizes do?',
          a: '`srcset` lists image files and their widths. `sizes` says how wide the image will display at different viewport widths. The browser combines them with pixel density to pick the best file.',
        },
        {
          q: 'Should you lazy-load every image?',
          a: 'No. Lazy-load images below the fold. The LCP (hero) image should load eagerly, ideally with `fetchpriority="high"`.',
        },
        {
          q: 'Why add width and height to images?',
          a: 'So the browser can reserve the right space before the image loads, preventing layout shift (CLS).',
        },
        {
          q: 'When do you use `<picture>` instead of `srcset`?',
          a: 'When you need different formats (AVIF/WebP fallback) or different crops per screen size (art direction). For simple resolution switching, `srcset` + `sizes` is enough.',
        },
      ],
      spoken: `"Images are usually the heaviest thing on a page, so I use srcset and sizes to let the browser pick the right resolution for the screen and pixel density, and picture with source elements to serve AVIF or WebP with a JPEG fallback. I always set width and height so the browser reserves space and there's no layout shift. Below-the-fold images get loading lazy, but never the hero image — that's usually the LCP element, so I load it eagerly with fetchpriority high. In Next.js, the Image component handles most of this for me."`,
      mistakes: [
        'Lazy-loading the hero/LCP image and making LCP worse.',
        'Using `srcset` with `w` descriptors but no `sizes`, so the browser assumes 100vw and downloads files that are too big.',
        'Leaving out `width`/`height`, causing layout shift when images load.',
        'Follow-up trap: "Does CSS `display: none` stop an `<img>` from downloading?" No, the image is usually still downloaded. Use `<picture>` sources with media conditions or conditional rendering instead.',
      ],
      takeaway: 'srcset + sizes for resolution, `<picture>` for formats, width/height for no shifts, lazy below the fold, priority for the hero.',
    },
    {
      id: 'styling-approaches-react',
      title: 'Styling in React: global CSS, CSS Modules, CSS-in-JS, Tailwind',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Ways to scope and organise styles in React apps, each with trade-offs in runtime cost, DX and server-component support.',
      what: `In a React app, you must decide **how styles are written and scoped** (kept from leaking into other components).

- **Global CSS / SCSS** — classic stylesheets. Simple, but all class names are global, so you need a naming rule like BEM.
- **CSS Modules** — \`Button.module.css\`. Class names are made **unique automatically** at build time (\`.btn\` becomes something like \`Button_btn__x7a2\`). Zero runtime cost.
- **CSS-in-JS** — styles written in JavaScript (styled-components, Emotion). Easy dynamic styles from props, but often generate CSS **at runtime** in the browser.
- **Utility-first (Tailwind)** — small single-purpose classes in the markup (\`flex p-4 text-sm\`). CSS is generated at build time from the classes you use.

#### Deeper version
- **Runtime CSS-in-JS** (styled-components, Emotion) adds JavaScript work on every render and needs special setup for SSR. With React Server Components (Next.js App Router), runtime CSS-in-JS only works inside Client Components, which pushed many teams toward zero-runtime options: CSS Modules, Tailwind, or zero-runtime CSS-in-JS like vanilla-extract or Panda CSS.
- MUI uses Emotion by default; check the current MUI docs for their newer zero-runtime/static-extraction options, as this area is changing.
- **Dynamic values** without CSS-in-JS: pass a CSS variable via the style prop — \`style={{ '--progress': '40%' }}\` — and use \`var(--progress)\` in CSS Modules or Tailwind arbitrary values.
- Choosing: team size, design system, need for SSR/RSC, and whether you use a component library all matter more than personal taste.`,
      why: `Styling choices affect bundle size, performance, maintainability and how easily new developers can work in the codebase. Interviewers want to hear trade-offs, not "X is the best".`,
      analogy: `Global CSS is a shared kitchen where everyone labels their food carefully (BEM). CSS Modules gives every person their own fridge with an auto-label. CSS-in-JS is a personal chef who cooks your style on demand (flexible, but costs time each meal). Tailwind is a buffet of small ready-made dishes you combine on your plate.`,
      code: [
        {
          title: 'CSS Modules with a dynamic CSS variable',
          lang: 'jsx',
          code: `// ProgressBar.module.css
// .track { height: 8px; background: #e5e7eb; border-radius: 4px; }
// .fill  { height: 100%; width: var(--progress); background: #2563eb; }
// .done  { background: #16a34a; }

import styles from './ProgressBar.module.css';

export function ProgressBar({ value }) {
  const done = value >= 100;
  return (
    <div className={styles.track}>
      <div
        className={done ? styles.fill + ' ' + styles.done : styles.fill}
        style={{ '--progress': value + '%' }}   // dynamic value, no CSS-in-JS
      />
    </div>
  );
}`,
        },
        {
          title: 'Same component in styled-components and Tailwind',
          lang: 'jsx',
          code: `// styled-components (runtime CSS-in-JS)
import styled from 'styled-components';
const Fill = styled.div\`
  height: 100%;
  width: \${(p) => p.$value}%;
  background: \${(p) => (p.$value >= 100 ? '#16a34a' : '#2563eb')};
\`;

// Tailwind (utility classes, built at compile time)
export function ProgressBarTw({ value }) {
  return (
    <div className="h-2 rounded bg-gray-200">
      <div
        className={'h-full rounded ' + (value >= 100 ? 'bg-green-600' : 'bg-blue-600')}
        style={{ width: value + '%' }}
      />
    </div>
  );
}`,
        },
      ],
      output: `All three versions draw the same progress bar. In CSS Modules, the class names are unique per file, and the width comes from a CSS variable set through the \`style\` prop. In styled-components, the CSS is created in the browser from the props (the \`$value\` transient prop is not passed to the DOM). In Tailwind, the classes are fixed strings that Tailwind finds at build time, and only the width is dynamic via \`style\`.`,
      questions: [
        {
          q: 'What problem do CSS Modules solve?',
          a: 'Global class name collisions. Class names are scoped to the file by generating unique names at build time, with no runtime cost.',
        },
        {
          q: 'What are the downsides of runtime CSS-in-JS?',
          a: 'Extra JavaScript and work during render, more complex SSR, and it only works in Client Components with React Server Components.',
        },
        {
          q: 'How do you pass dynamic values without CSS-in-JS?',
          a: 'Set a CSS variable in the `style` prop and read it with `var()` in your CSS, or toggle classes.',
        },
        {
          q: 'Which approach would you pick for a new Next.js App Router project?',
          a: 'Usually Tailwind or CSS Modules (zero runtime, RSC-friendly), possibly with a headless component library. It depends on the team and design system.',
        },
      ],
      spoken: `"In React there are four main styling approaches. Global CSS or SCSS with BEM is simple but global. CSS Modules scope class names per file at build time with zero runtime. Runtime CSS-in-JS like styled-components or Emotion is great for prop-driven styles but adds runtime cost and only works in client components with server components. And utility-first Tailwind generates CSS at build time from the classes I use. For new Next.js projects I usually go with Tailwind or CSS Modules, and for dynamic values I pass CSS variables through the style prop."`,
      mistakes: [
        'Saying one approach is always best. Talk about trade-offs: runtime cost, SSR/RSC support, team experience.',
        'Using runtime CSS-in-JS inside React Server Components and getting errors.',
        'Building Tailwind class names with string concatenation of partial names (`"bg-" + color`). Tailwind cannot detect them; write full class names.',
        'Follow-up trap: "Do CSS Modules support global styles?" Yes, with `:global(.className)` inside a module file, or a separate global stylesheet.',
      ],
      takeaway: 'Pick styling by trade-offs: CSS Modules/Tailwind for zero runtime, CSS-in-JS for prop-driven styles, global CSS with BEM for simple sites.',
    },
    {
      id: 'critical-rendering-path',
      title: 'Critical Rendering Path',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'The steps the browser takes from HTML bytes to pixels: DOM, CSSOM, render tree, layout, paint, composite — and how to make them faster.',
      what: `The **Critical Rendering Path (CRP)** is the list of steps the browser must do before it can show the first pixels:

1. **Parse HTML → DOM** (Document Object Model, a tree of elements).
2. **Parse CSS → CSSOM** (CSS Object Model, a tree of styles).
3. **Combine into the render tree** — only visible elements, each with its final styles (\`display: none\` elements are left out).
4. **Layout** (also called reflow) — calculate the size and position of every box.
5. **Paint** — fill in pixels: text, colours, borders, shadows, images.
6. **Composite** — put painted layers together in the right order and show them on screen.

#### Deeper version
- **CSS is render-blocking:** the browser will not render anything until the CSSOM is built, otherwise you would see unstyled content flash. So big CSS files delay first paint.
- **JavaScript is parser-blocking:** a normal \`<script>\` pauses DOM building. Scripts may also wait for earlier CSS, because they could read styles. This is why \`defer\`/\`async\` matter.
- The **preload scanner** looks ahead in the HTML and starts downloading images, scripts and CSS early, even while the parser is blocked. Hiding resources inside CSS or JavaScript (e.g. a hero image set from JS) hides them from this scanner.
- Ways to optimise the CRP:
  - Reduce critical resources: inline small **critical CSS** for above-the-fold content, load the rest later.
  - Reduce bytes: minify, compress (gzip/Brotli), remove unused CSS.
  - Shorten the critical path: \`defer\` scripts, \`preload\` key fonts/hero image, \`preconnect\` to important origins.
  - Server-render HTML (SSR/SSG) so content arrives in the first response.`,
      why: `Every millisecond before first paint is time users stare at a blank screen. Understanding the CRP explains **why** performance advice works (defer scripts, inline critical CSS, preload the hero) and helps you improve FCP and LCP.`,
      analogy: `Building a house: you need the floor plan (DOM) and the interior design guide (CSSOM) before you can make the final build plan (render tree). Then you measure where every wall goes (layout), paint the walls (paint), and finally assemble prefab rooms in place (composite). If the design guide arrives late, the builders wait.`,
      code: [
        {
          title: 'An optimised head for fast first paint',
          lang: 'html',
          code: `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Open connections early to important third-party origins -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- Small critical CSS inline: no extra request before first paint -->
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
    .hero { min-height: 60vh; display: grid; place-items: center; }
  </style>

  <!-- Download the hero image early -->
  <link rel="preload" as="image" href="/img/hero-1200.jpg" fetchpriority="high" />

  <!-- Full stylesheet (still render-blocking; keep it small) -->
  <link rel="stylesheet" href="/css/main.css" />

  <!-- Non-blocking JavaScript -->
  <script defer src="/js/app.js"></script>
</head>`,
        },
        {
          title: 'Measuring first paints in the browser',
          lang: 'javascript',
          code: `// Run in the console or app code
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, Math.round(entry.startTime), 'ms');
  }
}).observe({ type: 'paint', buffered: true });
// Logs: "first-paint 312 ms", "first-contentful-paint 312 ms" (numbers vary)`,
        },
      ],
      output: `With this head, the browser can paint the hero layout as soon as the small inline CSS and \`main.css\` are ready. The hero image download starts immediately thanks to \`preload\`. The JavaScript downloads in parallel but never blocks parsing (\`defer\`). The font connection is warmed up early.

The PerformanceObserver logs when the first paint and first contentful paint happened, so you can measure the effect of your changes. In DevTools, the Performance panel shows each CRP step (Parse HTML, Recalculate Style, Layout, Paint, Composite Layers) on a timeline.`,
      questions: [
        {
          q: 'Explain the critical rendering path.',
          a: 'HTML is parsed into the DOM, CSS into the CSSOM, they combine into the render tree, then the browser does layout, paint and composite to show pixels.',
        },
        {
          q: 'Why is CSS render-blocking?',
          a: 'The browser needs the CSSOM to know how things look. Rendering without it would show unstyled content and then jump, so it waits.',
        },
        {
          q: 'How do you optimise the critical rendering path?',
          a: 'Inline critical CSS, minify and compress, defer non-critical JS, preload key resources like the hero image and fonts, preconnect to origins, and server-render the HTML.',
        },
        {
          q: 'Is an element with `display: none` in the render tree?',
          a: 'No. It is in the DOM but not in the render tree. `visibility: hidden` elements are in the render tree because they still take space.',
        },
      ],
      spoken: `"The critical rendering path is how the browser turns HTML, CSS and JavaScript into pixels. It parses HTML into the DOM and CSS into the CSSOM, combines them into a render tree of visible elements, then calculates layout, paints pixels and composites layers. CSS is render-blocking and normal scripts are parser-blocking, so to optimise I inline critical CSS, keep the main CSS small, defer JavaScript, preload the hero image and fonts, and preconnect to key origins. Server-side rendering also helps because real content arrives in the first HTML response."`,
      mistakes: [
        'Saying JavaScript is render-blocking and CSS is not. CSS blocks rendering; classic scripts block parsing.',
        'Loading the hero image from JavaScript or a CSS background, hiding it from the preload scanner.',
        'Preloading too many resources, which competes for bandwidth and slows the truly critical ones.',
        'Follow-up trap: "What is the difference between DOMContentLoaded and load?" DOMContentLoaded fires when HTML is parsed and deferred scripts ran; load fires after all resources like images and stylesheets finish.',
      ],
      takeaway: 'DOM + CSSOM → render tree → layout → paint → composite; ship less critical CSS/JS and start key downloads early.',
    },
    {
      id: 'reflow-repaint',
      title: 'Reflow vs Repaint (and compositing)',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Reflow recalculates sizes and positions (expensive); repaint redraws pixels without layout changes (cheaper); composite-only changes are cheapest.',
      what: `After the first render, changes to the page cost different amounts of work:

- **Reflow (layout)** — the browser recalculates the **size and position** of elements. Triggered by changing width, height, margin, padding, font size, adding/removing DOM nodes, or resizing the window. It can affect many elements (children, siblings, parents), so it is **expensive**.
- **Repaint** — the browser redraws pixels **without** changing layout. Triggered by changing colour, background, box-shadow, visibility. **Cheaper** than reflow.
- **Composite only** — changes to \`transform\` and \`opacity\` (on their own layer) can often skip layout and paint. **Cheapest.**

A reflow always leads to a repaint. A repaint does not need a reflow.

#### Deeper version
**Layout thrashing** (forced synchronous layout) is the classic bug: reading a layout value (\`offsetHeight\`, \`getBoundingClientRect()\`, \`scrollTop\`, \`getComputedStyle\`) right after writing a style forces the browser to do layout **immediately**. Doing this read-write-read-write in a loop forces a layout on every step.

Fixes:
- **Batch reads, then batch writes.**
- Use \`requestAnimationFrame\` for visual updates.
- Change a class once instead of many inline styles.
- Use \`transform\`/\`opacity\` for animation.
- For long lists, virtualise (render only visible rows).
- \`contain: layout paint\` or \`content-visibility: auto\` can limit how far layout and paint spread (check browser support for \`content-visibility\`).`,
      why: `Janky scrolling, slow animations and laggy typing are often caused by unnecessary reflows. Knowing what triggers them lets you write smooth UIs and helps the INP (responsiveness) metric.`,
      analogy: `Rearranging furniture in a room (reflow) means moving many items and checking everything still fits. Repainting a wall (repaint) changes how it looks but nothing moves. Sliding a picture frame along a rail (composite) is the easiest — nothing else is touched.`,
      code: [
        {
          title: 'Layout thrashing and the fix',
          lang: 'javascript',
          code: `const boxes = document.querySelectorAll('.box');

// BAD: read -> write -> read -> write ... forces layout on every loop
boxes.forEach((box) => {
  const width = box.offsetWidth;          // READ (forces layout)
  box.style.height = width / 2 + 'px';    // WRITE (invalidates layout)
});

// GOOD: all reads first, then all writes -> one layout
const widths = Array.from(boxes, (box) => box.offsetWidth); // READ all
requestAnimationFrame(() => {
  boxes.forEach((box, i) => {
    box.style.height = widths[i] / 2 + 'px';                 // WRITE all
  });
});`,
        },
        {
          title: 'Cheap vs expensive changes',
          lang: 'css',
          code: `/* Reflow + repaint: size/position changes */
.panel.open { width: 400px; margin-left: 20px; }

/* Repaint only: looks change, layout does not */
.panel.active { background: #eff6ff; box-shadow: 0 0 0 2px #2563eb; }

/* Usually composite only: smooth even on slow devices */
.panel.slide-in { transform: translateX(0); opacity: 1; }

/* Limit the impact of changes inside a widget */
.widget { contain: layout paint; }`,
        },
      ],
      output: `In the bad loop with 100 boxes, the browser may calculate layout up to 100 times, because each \`offsetWidth\` read needs fresh layout after the previous write. In the good version, it does one layout for all reads and one more after all writes. In the DevTools Performance panel, the bad version shows many purple "Layout" blocks with a "Forced reflow" warning.

In the CSS, \`.open\` causes reflow, \`.active\` only repaints, and \`.slide-in\` can usually be handled by the compositor.`,
      questions: [
        {
          q: 'What is the difference between reflow and repaint?',
          a: 'Reflow recalculates layout (sizes and positions) and is expensive. Repaint redraws pixels when only appearance changes. Every reflow causes a repaint, not the other way around.',
        },
        {
          q: 'What triggers a reflow?',
          a: 'Changing size, position, fonts or content, adding/removing elements, resizing the window, and reading layout properties like `offsetHeight` after a write.',
        },
        {
          q: 'What is layout thrashing?',
          a: 'Alternating DOM reads and writes in a loop, forcing the browser to do layout synchronously many times. Fix it by batching reads then writes.',
        },
        {
          q: 'Which properties are cheapest to animate?',
          a: '`transform` and `opacity`, because the browser can often update them on the compositor without layout or paint.',
        },
      ],
      spoken: `"Reflow, or layout, is when the browser recalculates the size and position of elements — triggered by things like changing width, margin, font size or adding DOM nodes. It's expensive because it can affect many elements. Repaint is redrawing pixels when only appearance changes, like colour or shadow, which is cheaper. Transform and opacity changes can often skip both and just composite. The classic performance bug is layout thrashing — reading offsetHeight after writing styles in a loop — so I batch reads before writes, use requestAnimationFrame, and animate with transforms."`,
      mistakes: [
        'Reading `offsetHeight` or `getBoundingClientRect()` inside a loop that also writes styles.',
        'Animating `top`/`left`/`width` instead of `transform`.',
        'Setting many inline styles one by one instead of toggling one class.',
        'Follow-up trap: "Does changing `visibility` cause reflow?" Usually only repaint, because the element keeps its space. `display: none` causes reflow because the space changes.',
      ],
      takeaway: 'Layout changes are expensive, paint is cheaper, transform/opacity is cheapest — and never interleave DOM reads and writes.',
    },
    {
      id: 'core-web-vitals',
      title: 'Core Web Vitals: LCP, INP, CLS',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Google\'s three user-experience metrics: loading (LCP), responsiveness (INP, which replaced FID in March 2024) and visual stability (CLS).',
      what: `**Core Web Vitals** are three metrics Google uses to measure real user experience. They are also a (small) ranking signal in search.

- **LCP — Largest Contentful Paint** (loading): when the biggest image or text block in the viewport appears. **Good: 2.5 seconds or less.**
- **INP — Interaction to Next Paint** (responsiveness): how long the page takes to visually respond after a click, tap or key press, looking at nearly all interactions (roughly the worst one). **Good: 200 ms or less.** INP **replaced FID** (First Input Delay) as a Core Web Vital in **March 2024**.
- **CLS — Cumulative Layout Shift** (visual stability): how much visible content jumps around unexpectedly. **Good: 0.1 or less.**

Google judges them at the **75th percentile** of real page loads: 75% of your users should get a "good" score.

#### Deeper version
**Fixing LCP:** server-render the content, use a CDN, optimise and size images, preload the hero image and add \`fetchpriority="high"\`, never lazy-load the LCP image, reduce render-blocking CSS/JS, and speed up the server (TTFB).

**Fixing INP:** INP = input delay + processing time + time to the next paint. Keep the main thread free: split long tasks (over 50ms) with \`await\` yields or \`scheduler.yield()\` where supported, move heavy work to Web Workers, debounce expensive handlers, use React \`startTransition\`/\`useDeferredValue\` for non-urgent updates, virtualise long lists, and reduce third-party scripts. FID only measured the delay before the **first** interaction started, so it missed slow handlers; INP measures the full response for all interactions.

**Fixing CLS:** set \`width\`/\`height\` or \`aspect-ratio\` on images, videos and iframes, reserve space for ads and embeds, avoid inserting content above existing content (banners), use \`font-display\` and matched fallback fonts to limit font swap shifts, and animate with \`transform\` instead of layout properties. Shifts within 500ms of a user input do not count.

**Lab vs field data:** Lighthouse is lab data (one simulated load; it cannot measure real INP, it uses Total Blocking Time as a proxy). Field data comes from real users: Chrome UX Report (CrUX), PageSpeed Insights, Search Console, or the \`web-vitals\` library.`,
      why: `These metrics reflect what users feel: "Is it loading?", "Does it react when I click?", "Why did the button jump?". Better vitals mean better conversion and SEO. Interviewers for senior frontend roles often ask how you measured and improved them.`,
      analogy: `Ordering at a restaurant: **LCP** is how long until your main dish arrives. **INP** is how fast the waiter responds every time you raise your hand. **CLS** is whether someone keeps moving your plate while you are eating.`,
      code: [
        {
          title: 'Measuring real-user vitals with the web-vitals library',
          lang: 'javascript',
          code: `// npm install web-vitals
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics(metric) {
  // metric.name: "LCP" | "INP" | "CLS", metric.value, metric.rating: "good" | "needs-improvement" | "poor"
  const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating });
  navigator.sendBeacon('/analytics', body); // survives page unload
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);`,
        },
        {
          title: 'Fixing INP: yield during long work',
          lang: 'javascript',
          code: `// A long task blocks the main thread -> clicks feel frozen (bad INP)
function processAllSync(items) {
  items.forEach(heavyWork);
}

// Better: give the browser a chance to paint and handle input between chunks
const yieldToMain = () =>
  globalThis.scheduler?.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0));

async function processAll(items) {
  for (let i = 0; i < items.length; i++) {
    heavyWork(items[i]);
    if (i % 50 === 0) await yieldToMain(); // break into small tasks
  }
}

function heavyWork(item) {
  // some CPU work per item
  let x = 0;
  for (let j = 0; j < 10000; j++) x += j * item;
  return x;
}`,
        },
        {
          title: 'Fixing CLS: reserve space',
          lang: 'css',
          code: `img, video { max-width: 100%; height: auto; } /* with width/height attributes in HTML */

.video-embed { aspect-ratio: 16 / 9; width: 100%; }

.ad-slot { min-height: 250px; } /* reserve the ad's space before it loads */

@font-face {
  font-family: 'Brand';
  src: url('/fonts/brand.woff2') format('woff2');
  font-display: swap;            /* text shows immediately with a fallback */
}`,
        },
      ],
      output: `The first snippet reports each metric from real users with its value and a rating like "good" or "poor", so you can see your 75th percentile in your own dashboard.

In the INP example, the synchronous version may block the main thread for a second, so a click during that time waits. The chunked version yields every 50 items, so the browser can handle the click and paint in between — the page feels responsive.

The CSS reserves space for images, embeds and ads before they load, so content below them does not jump, keeping CLS low.`,
      questions: [
        {
          q: 'What are the Core Web Vitals and their good thresholds?',
          a: 'LCP ≤ 2.5s (loading), INP ≤ 200ms (responsiveness), CLS ≤ 0.1 (visual stability), measured at the 75th percentile of real users.',
        },
        {
          q: 'Why did INP replace FID?',
          a: 'FID only measured the input delay of the first interaction. INP measures the full time to the next paint for nearly all interactions, so it catches slow event handlers and slow renders. It became a Core Web Vital in March 2024.',
        },
        {
          q: 'How would you improve a poor LCP?',
          a: 'Find the LCP element, then: server-render it, optimise and preload the image with fetchpriority high, do not lazy-load it, cut render-blocking CSS/JS, use a CDN and improve TTFB.',
        },
        {
          q: 'What causes CLS and how do you fix it?',
          a: 'Images and embeds without dimensions, ads, late-injected banners and font swaps. Fix with width/height or aspect-ratio, reserved space, and careful font loading.',
        },
        {
          q: 'Lab data vs field data?',
          a: 'Lab data (Lighthouse) is a simulated test, good for debugging. Field data (CrUX, web-vitals) comes from real users and is what Google uses. Lighthouse cannot measure INP directly; it uses Total Blocking Time as a proxy.',
        },
      ],
      spoken: `"Core Web Vitals are Google's three user-experience metrics. LCP measures loading — when the largest content appears — and should be under 2.5 seconds. INP measures responsiveness — the time from an interaction to the next paint — and should be under 200 milliseconds. It replaced FID in March 2024, because FID only looked at the delay of the first input. CLS measures layout shift and should be under 0.1. They're judged at the 75th percentile of real users. I measure field data with the web-vitals library, and I fix LCP with image priority and SSR, INP by breaking up long tasks, and CLS by reserving space."`,
      mistakes: [
        'Still calling FID a Core Web Vital. INP replaced it in March 2024.',
        'Only checking Lighthouse on a fast laptop. Real users on mid-range phones have very different numbers; use field data.',
        'Lazy-loading the hero image, which directly hurts LCP.',
        'Inserting a cookie banner or promo bar at the top after load, pushing content down (CLS).',
        'Follow-up trap: "Is a good Lighthouse score enough to pass Core Web Vitals?" No. Google uses field data from real Chrome users (CrUX) at the 75th percentile.',
      ],
      takeaway: 'LCP ≤ 2.5s, INP ≤ 200ms (replaced FID in 2024), CLS ≤ 0.1 — measured on real users at the 75th percentile.',
    },
    {
      id: 'bfc-margin-collapse',
      title: 'Block Formatting Context (BFC) and Floats',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'A BFC is an isolated layout area: it contains floats, stops margin collapse with its children, and does not overlap floats.',
      what: `A **Block Formatting Context (BFC)** is a region of the page where block boxes are laid out **independently** from the outside.

An element that creates a BFC:
1. **Contains its floats** — its height includes floated children (no "collapsed parent").
2. **Stops margin collapse** between itself and its children.
3. **Does not overlap** a floated sibling — it sits next to it.

The modern, clean way to create one: \`display: flow-root\`.

#### Deeper version
Other things that create a BFC: \`overflow\` other than \`visible\` (e.g. \`hidden\`, \`auto\`), \`float\`, \`position: absolute/fixed\`, \`display: inline-block\`, \`display: flex/grid\` (for their children: flex and grid items each establish their own formatting context), \`contain: layout\`, and table cells.

**Floats** (\`float: left\`) were the old layout tool. A floated element is taken partly out of flow, and text wraps around it. Its parent no longer counts its height, so the parent "collapses". Old fixes were the **clearfix** hack (\`::after { content: ""; display: table; clear: both; }\`) or \`overflow: hidden\` (which also clips shadows and dropdowns). Today: use \`display: flow-root\`, and use flex/grid for layout. Floats are still the right tool for wrapping text around an image.

Margin collapse also happens between a parent and its **first/last child** when there is no border, padding or BFC between them — the child's top margin "leaks" out of the parent.`,
      why: `This explains old, confusing bugs: a parent with zero height around floated children, a child's margin pushing the parent down instead of creating space inside, or text flowing under a float. It shows a deep understanding of CSS for senior interviews.`,
      analogy: `A BFC is like a fenced garden. Whatever happens inside the fence (floats, margins) stays inside, and the fence grows to hold everything. Without the fence, things spill out to the neighbours.`,
      code: [
        {
          title: 'Collapsed parent and the flow-root fix',
          lang: 'html',
          code: `<div class="gallery">
  <img class="thumb" src="a.jpg" alt="Photo A" />
  <img class="thumb" src="b.jpg" alt="Photo B" />
</div>

<style>
  .thumb { float: left; width: 120px; margin: 8px; }

  /* Problem: .gallery has height 0, its border collapses into a line */
  .gallery { border: 2px solid #ddd; }

  /* Fix (modern): create a BFC so it contains the floats */
  .gallery { display: flow-root; }

  /* Old clearfix you may see in legacy code */
  .clearfix::after { content: ""; display: table; clear: both; }
</style>`,
        },
        {
          title: 'Child margin leaking out of the parent',
          lang: 'css',
          code: `.card { background: #f3f4f6; }
.card h2 { margin-top: 24px; }
/* The 24px margin appears ABOVE .card (outside its background), not inside */

/* Any of these keep the margin inside the card: */
.card { display: flow-root; }     /* new BFC */
/* or: .card { padding-top: 1px; } */
/* or: .card { display: flex; flex-direction: column; } */`,
        },
      ],
      output: `Without the fix, the gallery's border appears as a thin line above the images because the floated images do not add to its height. With \`display: flow-root\`, the gallery grows to wrap the images and the border surrounds them.

In the second example, the heading's 24px top margin collapses through the card and pushes the whole card down, leaving the grey background starting at the heading. Creating a BFC (or adding padding/border, or using flex) keeps the margin inside the card.`,
      questions: [
        {
          q: 'What is a Block Formatting Context?',
          a: 'An isolated layout region where blocks are laid out independently. It contains floats, prevents margin collapse with children, and does not overlap floats.',
        },
        {
          q: 'How do you create a BFC?',
          a: 'Cleanest is `display: flow-root`. Also `overflow: hidden/auto`, floats, absolute positioning, inline-block, and flex/grid containers for their items.',
        },
        {
          q: 'What is a clearfix?',
          a: 'An old hack using `::after { content: ""; display: table; clear: both; }` so a parent contains its floated children. `display: flow-root` replaces it.',
        },
      ],
      spoken: `"A block formatting context is an isolated layout area. When an element creates one, it contains its floated children so it doesn't collapse to zero height, it stops margin collapse between itself and its children, and it won't overlap a neighbouring float. Today the cleanest way to create one is display flow-root, which replaced the old clearfix hack and overflow hidden trick. In practice I rarely use floats for layout anymore — flex and grid handle that — but this explains a lot of legacy CSS bugs, like a child's margin leaking out of its parent."`,
      mistakes: [
        'Using `overflow: hidden` to contain floats and accidentally clipping dropdowns and shadows. Prefer `display: flow-root`.',
        'Using floats for page layout in new code instead of flex or grid.',
        'Not knowing why a child\'s top margin pushes the parent down (parent-child margin collapse).',
        'Follow-up trap: "Do margins collapse inside a flex container?" No. Flex and grid items never have collapsing margins.',
      ],
      takeaway: '`display: flow-root` creates a BFC: it contains floats and stops margins leaking — the modern replacement for clearfix.',
    },
  ],
  rapidFire: [
    { q: 'What is semantic HTML?', a: 'Using tags that describe meaning (nav, main, article, button) instead of generic divs.' },
    { q: 'How many h1 tags should a page have?', a: 'Usually one, describing the main topic of the page.' },
    { q: 'What does the doctype do?', a: 'Puts the browser in standards mode instead of quirks mode.' },
    { q: 'a vs button?', a: '`<a href>` navigates to a URL; `<button>` performs an action.' },
    { q: 'When should alt be empty?', a: 'For purely decorative images, so screen readers skip them.' },
    { q: 'First rule of ARIA?', a: 'Do not use ARIA if a native HTML element can do the job.' },
    { q: 'WCAG AA contrast for normal text?', a: 'At least 4.5:1 (3:1 for large text).' },
    { q: 'What does aria-live do?', a: 'Makes screen readers announce content changes in that region.' },
    { q: 'focus vs focus-visible?', a: '`:focus-visible` shows focus styles mainly for keyboard users; `:focus` matches every focus.' },
    { q: 'Box model layers, inside to out?', a: 'Content, padding, border, margin.' },
    { q: 'What does box-sizing: border-box do?', a: 'Makes width and height include padding and border.' },
    { q: 'Do vertical margins add up?', a: 'Not in normal flow; they collapse into the larger one. They do not collapse in flex or grid.' },
    { q: 'display: none vs visibility: hidden?', a: '`none` removes the element and its space; `hidden` keeps the space.' },
    { q: 'em vs rem?', a: '`em` is relative to the element font size (compounds); `rem` to the root font size.' },
    { q: 'What does clamp() do?', a: 'Returns a preferred value limited between a minimum and a maximum.' },
    { q: 'Why 100dvh over 100vh on mobile?', a: '`dvh` follows the real visible height as browser toolbars show and hide.' },
    { q: 'Specificity order?', a: 'Inline styles > IDs > classes/attributes/pseudo-classes > elements; ties go to the later rule.' },
    { q: 'Specificity of :where()?', a: 'Always zero.' },
    { q: 'Pseudo-class vs pseudo-element?', a: 'One colon selects a state (`:hover`); two colons style a part or add content (`::before`).' },
    { q: 'Why is ::before not showing?', a: 'It needs a `content` property, even `content: ""`.' },
    { q: 'What is absolute positioned relative to?', a: 'The nearest ancestor with a non-static position (or a transform), else the initial containing block.' },
    { q: 'Why does sticky not stick?', a: 'Missing `top`, or an ancestor has overflow hidden/auto, or the parent is too short.' },
    { q: 'Flexbox main vs cross axis?', a: 'Main follows flex-direction (justify-content); cross is perpendicular (align-items).' },
    { q: 'What does flex: 1 mean?', a: '`flex-grow: 1; flex-shrink: 1; flex-basis: 0%` — share free space equally.' },
    { q: 'Flex item overflowing with long text?', a: 'Add `min-width: 0` to the item.' },
    { q: 'What is the fr unit?', a: 'A fraction of the free space in a grid container.' },
    { q: 'auto-fill vs auto-fit?', a: '`auto-fit` collapses empty tracks so items stretch; `auto-fill` keeps them.' },
    { q: 'Grid or flex for a page layout?', a: 'Grid (two dimensions); flex for one-direction component internals.' },
    { q: 'Shortest way to center a div?', a: 'Parent: `display: grid; place-items: center`.' },
    { q: 'Why translate(-50%, -50%) when centering?', a: 'It moves the element back by half its own size so its center sits at 50%/50%.' },
    { q: 'Why do you need the viewport meta tag?', a: 'Without it, phones render at a fake desktop width and zoom out.' },
    { q: 'Mobile-first media query keyword?', a: '`min-width` — base styles for mobile, add styles for bigger screens.' },
    { q: 'Media query vs container query?', a: 'Media queries look at the viewport; container queries look at a parent element size.' },
    { q: 'How to avoid hover effects on touch screens?', a: 'Wrap them in `@media (hover: hover)`.' },
    { q: 'CSS variable vs SCSS variable?', a: 'CSS variables live in the browser and can change at runtime; SCSS variables are replaced at compile time.' },
    { q: 'Cheapest properties to animate?', a: '`transform` and `opacity`.' },
    { q: 'Transition vs animation?', a: 'Transition goes A to B on a trigger; @keyframes animations have many steps, can autoplay and loop.' },
    { q: 'animation-fill-mode: forwards?', a: 'Keeps the last keyframe styles after the animation ends.' },
    { q: 'Why does z-index 9999 not work?', a: 'The element is trapped in a parent stacking context that sits below something else.' },
    { q: 'Name three things that create a stacking context.', a: 'Positioned element with z-index, opacity < 1, transform (also filter, isolation: isolate).' },
    { q: 'What does BEM stand for?', a: 'Block, Element, Modifier: `.block__element--modifier`.' },
    { q: 'What is a SCSS partial?', a: 'A file starting with `_` that is not compiled alone; it is loaded with `@use`.' },
    { q: 'Mixin vs @extend?', a: 'Mixins copy styles and accept arguments; @extend groups selectors to share one rule.' },
    { q: '@use vs @import?', a: '`@use` namespaces and loads once; `@import` is global and deprecated in Dart Sass.' },
    { q: 'How to divide in modern Sass?', a: '`math.div(a, b)` from `@use \'sass:math\'`.' },
    { q: 'async vs defer?', a: 'async runs when downloaded (any order); defer runs after parsing, in order.' },
    { q: 'Are module scripts blocking?', a: 'No, `type="module"` is deferred by default.' },
    { q: 'What is a canonical URL?', a: 'The preferred URL for duplicate content, set with `<link rel="canonical">`.' },
    { q: 'Do social preview bots run JavaScript?', a: 'Usually not — server-render your Open Graph tags.' },
    { q: 'Should you lazy-load the hero image?', a: 'No. Load it eagerly with `fetchpriority="high"`; it is often the LCP element.' },
    { q: 'Why set width and height on images?', a: 'So the browser reserves space and avoids layout shift (CLS).' },
    { q: 'Critical rendering path steps?', a: 'DOM, CSSOM, render tree, layout, paint, composite.' },
    { q: 'Is CSS render-blocking?', a: 'Yes. The browser waits for the CSSOM before first render.' },
    { q: 'Reflow vs repaint?', a: 'Reflow recalculates layout (expensive); repaint redraws pixels only (cheaper).' },
    { q: 'What is layout thrashing?', a: 'Interleaving DOM reads and writes so layout is forced many times; batch reads then writes.' },
    { q: 'Core Web Vitals thresholds?', a: 'LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at the 75th percentile.' },
    { q: 'What replaced FID?', a: 'INP (Interaction to Next Paint), in March 2024.' },
    { q: 'Modern replacement for clearfix?', a: '`display: flow-root`.' },
    { q: 'localStorage vs cookie for auth tokens?', a: 'Prefer HttpOnly, Secure cookies; localStorage is readable by any XSS.' },
  ],
};
