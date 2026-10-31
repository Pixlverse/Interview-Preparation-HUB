// Revise MERN: HTML & CSS. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'html-css',
  icon: '🎨',
  title: 'HTML & CSS',
  note: 'Semantic HTML, accessibility, the box model, layout with Flexbox and Grid, specificity, responsive design and CSS performance.',
  items: [
    {
      q: 'What is semantic HTML and why does it matter?',
      a: `**Semantic HTML** means using elements that describe their meaning, like \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<button>\` and \`<footer>\`, instead of \`<div>\` everywhere.

It matters for three reasons: **accessibility** (screen readers understand the page structure and can jump between landmarks), **SEO** (search engines understand the content better), and **maintainability** (the code is easier to read). A real \`<button>\` also gives you keyboard focus and Enter/Space support for free, which a clickable \`<div>\` does not.`,
    },
    {
      q: 'Explain the CSS box model.',
      a: `Every element is a box made of four layers: **content**, then **padding**, then **border**, then **margin** on the outside. Padding is space inside the border; margin is space outside it.

By default (\`box-sizing: content-box\`), \`width\` sets only the content, so padding and border make the box bigger than you expect. With \`box-sizing: border-box\`, the width includes padding and border, which is much easier to reason about. Most projects set \`border-box\` on everything with a global reset.`,
    },
    {
      q: 'How does CSS specificity work?',
      a: `When several rules target the same element, the browser picks the one with the highest **specificity**. Roughly: **inline styles** beat **IDs**, IDs beat **classes, attributes and pseudo-classes**, and those beat **element names and pseudo-elements**. If specificity is equal, the rule that comes **later** wins.

\`!important\` overrides normal rules, but it makes CSS hard to maintain, so I avoid it. I keep specificity low and flat by using single classes (like BEM or utility classes), so styles are predictable and easy to override.`,
    },
    {
      q: 'Flexbox vs Grid: when do you use which?',
      a: `**Flexbox** is **one-dimensional**: it lays items out in a row **or** a column. It is great for navbars, button groups, centring something, and spacing items along one line.

**Grid** is **two-dimensional**: rows **and** columns at the same time. It is better for page layouts, card grids and dashboards where items must line up in both directions. I often use both together: Grid for the overall page, Flexbox inside each component.`,
    },
    {
      q: 'How do you centre a div horizontally and vertically?',
      a: `The simplest modern way is Flexbox on the parent: \`display: flex; justify-content: center; align-items: center;\`. With Grid it is even shorter: \`display: grid; place-items: center;\`.

For horizontal centring of a block with a width, \`margin: 0 auto\` still works. For an element on top of other content, \`position: absolute; inset: 0; margin: auto;\` with a set size, or \`top: 50%; left: 50%; transform: translate(-50%, -50%)\`.`,
    },
    {
      q: 'Explain the position values: static, relative, absolute, fixed and sticky.',
      a: `**static** is the default, following the normal flow. **relative** stays in the flow but can be nudged with top/left, and it becomes the reference point for absolutely positioned children. **absolute** is taken out of the flow and placed relative to the nearest positioned ancestor.

**fixed** is placed relative to the viewport and stays put when you scroll, like a floating button. **sticky** acts normal until you scroll past a threshold, then sticks, like a table header or sidebar.`,
    },
    {
      q: 'What is the difference between display: none, visibility: hidden and opacity: 0?',
      a: `\`display: none\` removes the element completely: it takes **no space**, and screen readers ignore it. \`visibility: hidden\` hides it but it **still takes its space**, and it can't be clicked.

\`opacity: 0\` makes it invisible, but it **still takes space and can still be clicked** and focused. That is why it is used for fade animations. To hide something visually but keep it for screen readers, use a "visually hidden" class (like \`sr-only\`).`,
    },
    {
      q: 'How do you build a responsive website?',
      a: `I design **mobile-first**: base styles for small screens, then \`@media (min-width: ...)\` queries to add layout for bigger screens. I use **flexible units** (\`%\`, \`rem\`, \`vw\`, \`fr\`), Flexbox and Grid that wrap naturally, and \`max-width\` so content doesn't stretch too far.

Other essentials: the viewport meta tag, responsive images with \`srcset\` and \`sizes\`, \`clamp()\` for fluid font sizes, and **container queries** when a component should adapt to its container, not the whole screen. I test at real device widths in DevTools.`,
    },
    {
      q: 'What is the difference between em, rem, px, % and vw/vh?',
      a: `**px** is a fixed size. **rem** is relative to the **root** font size (usually 16px), so it scales when the user changes their browser font size. That's why I use \`rem\` for font sizes and spacing. **em** is relative to the **current element's** font size, so it compounds when nested.

**%** is relative to the parent, and **vw/vh** are 1% of the viewport's width or height. On mobile, \`dvh\` (dynamic viewport height) avoids the jump caused by the browser's address bar.`,
    },
    {
      q: 'What are pseudo-classes and pseudo-elements?',
      a: `A **pseudo-class** selects an element in a certain **state** or position: \`:hover\`, \`:focus-visible\`, \`:disabled\`, \`:first-child\`, \`:nth-child(2n)\`, \`:not()\`, and the newer \`:has()\`, which can style a parent based on its children.

A **pseudo-element** styles a **part** of an element, or adds generated content: \`::before\`, \`::after\`, \`::placeholder\`, \`::first-line\`. Pseudo-classes use one colon and pseudo-elements use two.`,
    },
    {
      q: 'How do you make a website accessible?',
      a: `Start with **semantic HTML** and proper headings in order. Every image needs meaningful \`alt\` text, every input needs a \`<label>\`, and everything must work with the **keyboard** with a visible focus style. Text needs enough **colour contrast** (WCAG AA is 4.5:1 for normal text).

Use **ARIA** only when no native element fits, like \`aria-expanded\` on a custom dropdown. Respect \`prefers-reduced-motion\`. I check with Lighthouse or axe, and by navigating with only the Tab key.`,
    },
    {
      q: 'What is the critical rendering path?',
      a: `It is the browser's steps to turn HTML, CSS and JavaScript into pixels: parse HTML into the **DOM**, parse CSS into the **CSSOM**, combine them into the **render tree**, calculate **layout** (sizes and positions), then **paint** and **composite** the layers.

CSS is **render-blocking**, and normal \`<script>\` tags block HTML parsing. To speed up the first render: inline critical CSS, load scripts with \`defer\` or \`async\`, keep the page light, and preload the key font or hero image.`,
    },
    {
      q: 'What is the difference between async and defer on a script tag?',
      a: `Both download the script **without blocking** HTML parsing. The difference is when they run.

**defer** runs the script **after** the HTML is fully parsed, in the order the scripts appear. It is the right choice for most app code. **async** runs the script **as soon as it downloads**, in any order, possibly before parsing finishes. That suits independent scripts like analytics. A plain \`<script>\` stops parsing until it downloads and runs.`,
    },
    {
      q: 'What are reflow (layout) and repaint, and how do you avoid expensive ones?',
      a: `**Reflow** (layout) happens when the size or position of elements changes, so the browser recalculates the geometry, often for a large part of the page. **Repaint** happens when only appearance changes, like a colour, which is cheaper.

To keep things smooth: animate only \`transform\` and \`opacity\`, which the GPU can composite without layout. Avoid reading layout values (like \`offsetHeight\`) right after writing styles in a loop, which causes "layout thrashing". Batch DOM changes, and reserve space for images to prevent layout shift.`,
    },
    {
      q: 'What is z-index and what is a stacking context?',
      a: `\`z-index\` controls which positioned element appears on top when they overlap; a higher value is in front. It only works on positioned elements, or on flex and grid items.

A **stacking context** is a group that is layered as one unit. It is created by things like \`position\` with a \`z-index\`, \`opacity\` below 1, \`transform\` or \`isolation: isolate\`. A child can never escape its parent's stacking context, which is why \`z-index: 9999\` sometimes "doesn't work". The usual fix is to render the modal in a **portal** at the end of \`<body>\`.`,
    },
    {
      q: 'What is the difference between block, inline and inline-block?',
      a: `**Block** elements (\`div\`, \`p\`, \`h1\`) start on a new line and take the full width, and you can set width, height and vertical margins. **Inline** elements (\`span\`, \`a\`, \`strong\`) sit within the text line, take only the space they need, and ignore width, height and vertical margins.

**inline-block** sits in the line like inline, but accepts width, height and padding like block, which is useful for badges or buttons inside text.`,
    },
    {
      q: 'What are CSS custom properties (variables), and how do they differ from SCSS variables?',
      a: `**CSS custom properties** (\`--brand: #4f46e5;\` used as \`var(--brand)\`) live in the browser at **runtime**. They follow the cascade, can be changed per element or in a media query, and can be updated with JavaScript. That is what makes **dark mode and theming** easy.

**SCSS variables** (\`$brand\`) exist only at **build time**: they are replaced with fixed values when the CSS is compiled. I use custom properties for theme tokens, and SCSS features like mixins and nesting where a project uses SCSS.`,
    },
    {
      q: 'What is SCSS, and what features does it add?',
      a: `**SCSS** is a CSS preprocessor: you write an extended syntax and it compiles to plain CSS. It adds **variables**, **nesting**, **mixins** (reusable blocks of styles with parameters), **partials and imports** to split files, **functions** and **extends**.

Modern CSS now has native variables and nesting, so SCSS is less essential than before, but it is still common in existing projects. The main warning is deep nesting, which creates long, very specific selectors that are hard to override.`,
    },
    {
      q: 'How do you style components in a React app? CSS Modules, Tailwind or CSS-in-JS?',
      a: `**CSS Modules** scope class names to one file automatically, so there are no clashes. **Tailwind** uses small utility classes in the markup: very fast to build with and a consistent design system, but long class lists. **CSS-in-JS** (styled-components, Emotion) writes styles in JavaScript with props, but has a runtime cost and works poorly with React Server Components.

Component libraries like **Mantine** (which I used on SkillKeepr) give ready accessible components with theming. I pick based on the team and the project, and keep one approach per codebase.`,
    },
    {
      q: 'What is the difference between localStorage, sessionStorage and cookies?',
      a: `**localStorage** keeps data with no expiry, per origin, about 5MB, and it is only readable by JavaScript. **sessionStorage** is the same but is cleared when the tab closes. **Cookies** are small (about 4KB), are **sent to the server with every request**, and can have an expiry.

For security, auth tokens are safer in **HttpOnly, Secure, SameSite cookies**, because JavaScript can't read them, so an XSS attack can't steal them. localStorage is fine for non-sensitive preferences like the theme.`,
    },
    {
      q: 'What are the important tags in the HTML head, for SEO and performance?',
      a: `\`<meta charset="utf-8">\`, the **viewport** meta tag for mobile, a unique \`<title>\` and **meta description** per page, a **canonical** link to avoid duplicate pages, and **Open Graph** tags so links preview nicely when shared.

For performance: \`<link rel="preload">\` for the key font or hero image, \`preconnect\` to important third-party origins, and stylesheets in the head. For SEO overall, server-rendered HTML (like Next.js) helps search engines see the content without running JavaScript.`,
    },
    {
      q: 'How do you optimise images on a website?',
      a: `Use modern formats like **WebP** or **AVIF**, serve the right size with \`srcset\` and \`sizes\` so phones don't download desktop images, and compress them. Add \`loading="lazy"\` for images below the fold, but **not** for the main hero image, which should load early (\`fetchpriority="high"\`).

Always set \`width\` and \`height\` (or \`aspect-ratio\`) so the browser reserves space and the page doesn't jump (CLS). Use a CDN, and use SVG for icons and logos.`,
    },
    {
      q: 'What is the difference between CSS transitions and animations?',
      a: `A **transition** animates a property **between two states** when something changes, like a hover: \`transition: transform 200ms ease\`. It needs a trigger.

An **animation** uses \`@keyframes\` with as many steps as you like, can run **on its own**, loop and alternate, like a loading spinner. For both, animate \`transform\` and \`opacity\` for smooth 60fps motion, and respect \`prefers-reduced-motion\` for users who turn motion off.`,
    },
    {
      q: 'What are forms best practices in HTML?',
      a: `Every input needs a connected \`<label>\`. Use the right **input types** (\`email\`, \`tel\`, \`number\`, \`date\`) so phones show the right keyboard, plus \`autocomplete\` attributes so browsers can fill them. Built-in validation (\`required\`, \`minlength\`, \`pattern\`) gives quick feedback.

Show clear error messages next to the field, linked with \`aria-describedby\`. Wrap inputs in a real \`<form>\` with a submit \`<button>\` so Enter works. And always **validate again on the server**, because client-side checks can be bypassed.`,
    },
    {
      q: 'What is BEM, and why use a CSS naming convention?',
      a: `**BEM** stands for Block, Element, Modifier: \`.card\` (block), \`.card__title\` (an element inside it), \`.card--featured\` (a variation). Each class name says what it belongs to, and everything uses one class, so specificity stays low and flat.

A naming convention prevents style clashes and "who else uses this class?" fear in big projects. Today, CSS Modules or Tailwind solve the same problem by scoping, but BEM is still common in plain CSS and SCSS codebases.`,
    },
  ],
};
