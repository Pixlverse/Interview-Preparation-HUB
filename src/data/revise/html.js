// Revise MERN: HTML. 20 likely interview questions with short spoken-style answers.
export default {
  id: 'html',
  icon: '📄',
  title: 'HTML',
  note: 'Semantic HTML, the DOM, accessibility, the head, forms, storage and how the browser loads and renders a page.',
  items: [
    {
      q: 'What is semantic HTML and why does it matter?',
      a: `**Semantic HTML** means using elements that describe their meaning, like \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<button>\` and \`<footer>\`, instead of \`<div>\` everywhere.

It matters for three reasons: **accessibility** (screen readers understand the page structure and can jump between landmarks), **SEO** (search engines understand the content better), and **maintainability** (the code is easier to read). A real \`<button>\` also gives you keyboard focus and Enter/Space support for free, which a clickable \`<div>\` does not.`,
    },
    {
      q: 'What is the DOM?',
      a: `The **DOM** (Document Object Model) is the browser's in-memory **tree of objects** built from the HTML. Each element, attribute and piece of text becomes a node. JavaScript reads and changes the page through it, with things like \`document.querySelector\` and \`element.classList.add\`.

The HTML file is just the starting text; the DOM is the live version. React keeps its own virtual tree and updates only the DOM nodes that actually changed, because direct DOM updates that cause layout are relatively expensive.`,
    },
    {
      q: 'When do you use <button> and when <a>?',
      a: `A **link (\`<a href>\`)** **navigates** to another page or URL. A **\`<button>\`** **does an action** on the current page: submit a form, open a modal, add to cart.

Getting this right matters for accessibility and behaviour. Links can be opened in a new tab and are announced as links; buttons work with Enter and Space and are announced as buttons. A \`<div onClick>\` is neither, so keyboard and screen reader users can't use it. Inside a form, set \`type="button"\` on buttons that should not submit.`,
    },
    {
      q: 'How do you make a website accessible?',
      a: `Start with **semantic HTML** and proper headings in order. Every image needs meaningful \`alt\` text, every input needs a \`<label>\`, and everything must work with the **keyboard** with a visible focus style. Text needs enough **colour contrast** (WCAG AA is 4.5:1 for normal text).

Use **ARIA** only when no native element fits, like \`aria-expanded\` on a custom dropdown. Respect \`prefers-reduced-motion\`. I check with Lighthouse or axe, and by navigating with only the Tab key.`,
    },
    {
      q: 'What is ARIA and when should you use it?',
      a: `**ARIA** (Accessible Rich Internet Applications) is a set of attributes that tell screen readers what a custom widget is and what state it is in: \`role="dialog"\`, \`aria-expanded="true"\`, \`aria-label="Close"\`, \`aria-live="polite"\` for messages that appear.

The first rule of ARIA is: **don't use ARIA if a native HTML element can do the job.** A real \`<button>\` is better than \`<div role="button">\`. Wrong ARIA is worse than none, because it gives screen reader users false information.`,
    },
    {
      q: 'What are the important tags in the HTML head, for SEO and performance?',
      a: `\`<meta charset="utf-8">\`, the **viewport** meta tag for mobile, a unique \`<title>\` and **meta description** per page, a **canonical** link to avoid duplicate pages, and **Open Graph** tags so links preview nicely when shared.

For performance: \`<link rel="preload">\` for the key font or hero image, \`preconnect\` to important third-party origins, and stylesheets in the head. For SEO overall, server-rendered HTML (like Next.js) helps search engines see the content without running JavaScript.`,
    },
    {
      q: 'What is the difference between async and defer on a script tag?',
      a: `Both download the script **without blocking** HTML parsing. The difference is when they run.

**defer** runs the script **after** the HTML is fully parsed, in the order the scripts appear. It is the right choice for most app code. **async** runs the script **as soon as it downloads**, in any order, possibly before parsing finishes. That suits independent scripts like analytics. A plain \`<script>\` stops parsing until it downloads and runs.`,
    },
    {
      q: 'What is the critical rendering path?',
      a: `It is the browser's steps to turn HTML, CSS and JavaScript into pixels: parse HTML into the **DOM**, parse CSS into the **CSSOM**, combine them into the **render tree**, calculate **layout** (sizes and positions), then **paint** and **composite** the layers.

CSS is **render-blocking**, and normal \`<script>\` tags block HTML parsing. To speed up the first render: inline critical CSS, load scripts with \`defer\` or \`async\`, keep the page light, and preload the key font or hero image.`,
    },
    {
      q: 'What happens when you type a URL and press Enter?',
      a: `The browser finds the server's IP through **DNS**, opens a **TCP** connection and does the **TLS** handshake for HTTPS, then sends an **HTTP request**. The server (often through a CDN and load balancer) returns the HTML.

The browser then parses the HTML into the DOM, downloads CSS, JavaScript and images it finds, builds the CSSOM and render tree, does layout and paint, and runs scripts. Caching, CDNs, compression and \`defer\` on scripts all exist to make one of these steps faster.`,
    },
    {
      q: 'What does <!DOCTYPE html> do?',
      a: `It tells the browser the page is modern **HTML5**, so it renders in **standards mode**. Without it, browsers fall back to **quirks mode**, which copies old, buggy behaviour from the 1990s (for example, a different box model), so layouts break in strange ways.

It must be the very first line of the document. It is not an HTML tag; it is an instruction to the browser.`,
    },
    {
      q: 'What new features did HTML5 bring?',
      a: `**Semantic elements** (\`header\`, \`nav\`, \`main\`, \`article\`, \`section\`, \`footer\`), native \`<audio>\` and \`<video>\` without plugins, \`<canvas>\` and inline **SVG** for graphics, and new **input types** like \`email\`, \`date\` and \`range\` with built-in validation.

It also came with browser APIs: **localStorage and sessionStorage**, geolocation, drag and drop, **WebSockets**, Web Workers, and the History API that single-page apps use for routing.`,
    },
    {
      q: 'What is the difference between <section>, <article> and <div>?',
      a: `An **\`<article>\`** is self-contained content that would make sense on its own, like a blog post, a product card or a comment. A **\`<section>\`** is a themed part of a page, usually with its own heading, like "Pricing" or "FAQ".

A **\`<div>\`** has **no meaning** at all; it is just a box for styling or layout. Use \`div\` when no semantic element fits, but don't use it for everything.`,
    },
    {
      q: 'What are forms best practices in HTML?',
      a: `Every input needs a connected \`<label>\`. Use the right **input types** (\`email\`, \`tel\`, \`number\`, \`date\`) so phones show the right keyboard, plus \`autocomplete\` attributes so browsers can fill them. Built-in validation (\`required\`, \`minlength\`, \`pattern\`) gives quick feedback.

Show clear error messages next to the field, linked with \`aria-describedby\`. Wrap inputs in a real \`<form>\` with a submit \`<button>\` so Enter works. And always **validate again on the server**, because client-side checks can be bypassed.`,
    },
    {
      q: 'What is the difference between localStorage, sessionStorage and cookies?',
      a: `**localStorage** keeps data with no expiry, per origin, about 5MB, and it is only readable by JavaScript. **sessionStorage** is the same but is cleared when the tab closes. **Cookies** are small (about 4KB), are **sent to the server with every request**, and can have an expiry.

For security, auth tokens are safer in **HttpOnly, Secure, SameSite cookies**, because JavaScript can't read them, so an XSS attack can't steal them. localStorage is fine for non-sensitive preferences like the theme.`,
    },
    {
      q: 'What are data- attributes?',
      a: `**\`data-*\` attributes** let you store custom information on an HTML element, like \`<li data-user-id="42">\`. JavaScript reads them with \`element.dataset.userId\`, and CSS can select them with \`[data-state="open"]\`.

They are useful for passing small bits of data to scripts, for event delegation (one handler reads which item was clicked), and as stable selectors for tests (\`data-testid\`). They should not hold sensitive data, because anyone can see them in the page source.`,
    },
    {
      q: 'How do you optimise images on a website?',
      a: `Use modern formats like **WebP** or **AVIF**, serve the right size with \`srcset\` and \`sizes\` so phones don't download desktop images, and compress them. Add \`loading="lazy"\` for images below the fold, but **not** for the main hero image, which should load early (\`fetchpriority="high"\`).

Always set \`width\` and \`height\` (or \`aspect-ratio\`) so the browser reserves space and the page doesn't jump (CLS). Use a CDN, and use SVG for icons and logos.`,
    },
    {
      q: 'What are reflow (layout) and repaint, and how do you avoid expensive ones?',
      a: `**Reflow** (layout) happens when the size or position of elements changes, so the browser recalculates the geometry, often for a large part of the page. **Repaint** happens when only appearance changes, like a colour, which is cheaper.

To keep things smooth: animate only \`transform\` and \`opacity\`, which the GPU can composite without layout. Avoid reading layout values (like \`offsetHeight\`) right after writing styles in a loop, which causes "layout thrashing". Batch DOM changes, and reserve space for images to prevent layout shift.`,
    },
    {
      q: 'Canvas vs SVG: what is the difference?',
      a: `**SVG** is **vector** and part of the DOM: every shape is an element you can style with CSS, attach events to, and that stays sharp at any size. It is great for icons, logos, charts and diagrams with a limited number of shapes.

**Canvas** is a **bitmap** you draw on with JavaScript, pixel by pixel. It doesn't keep shapes as objects, so it is much faster for thousands of moving objects, games, image editing or heavy visualisations, but it is harder to make accessible.`,
    },
    {
      q: 'What is an iframe, and what are the security concerns?',
      a: `An **\`<iframe>\`** embeds another web page inside yours, like a YouTube video, a map, a payment form or a video call (Jitsi can be embedded this way).

The risks go both ways. Content you embed could run scripts, so use the **\`sandbox\`** attribute to limit what it can do, and \`allow\` to grant only needed features like camera. Your own site could be framed by an attacker for **clickjacking**, so send \`X-Frame-Options\` or the CSP \`frame-ancestors\` header to control who can frame you.`,
    },
    {
      q: 'What are Web Components and the Shadow DOM?',
      a: `**Web Components** are browser-native reusable components, built from three parts: **custom elements** (your own tag like \`<user-card>\`), the **Shadow DOM**, and **\`<template>\`** for reusable markup. They work in any framework or without one.

The **Shadow DOM** gives a component its own private DOM and CSS, so outside styles don't leak in and its styles don't leak out. Browsers use it for built-in elements like \`<video>\` controls. In React apps we usually use React components instead, but design systems shared across frameworks often use Web Components.`,
    },
  ],
};
