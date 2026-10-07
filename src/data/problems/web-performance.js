// Interview problems for the Web Performance stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'web-performance',
  problems: [
    {
      id: 'render-blocking-scripts',
      title: 'Fix render-blocking scripts in the <head>',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'script-loading',
      question: `Users see a white screen for about 2 seconds on slow phones. Lighthouse says "Eliminate render-blocking resources". Here is the \`<head>\`:

\`\`\`html
<head>
  <link rel="stylesheet" href="/css/app.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700" />
  <script src="https://cdn.example-analytics.com/analytics.js"></script>
  <script src="https://widget.example-chat.com/chat.js"></script>
  <script src="/js/app.js"></script>
</head>
\`\`\`

\`app.js\` needs the DOM. \`analytics.js\` and \`chat.js\` do not depend on anything. Fix it.`,
      hints: [
        'A normal `<script src>` stops HTML parsing until the file is downloaded **and** run. Nothing after it renders.',
        '`defer` = download in parallel, run in order after HTML is parsed. `async` = download in parallel, run as soon as ready (any order).',
        'Does the chat widget need to load at all before the user interacts? And the font: can you connect to its server earlier?',
      ],
      solution: `**Idea:** let the browser keep parsing HTML while scripts download. Use \`defer\` for your app, \`async\` for independent third-party scripts, delay non-essential widgets, and warm up the font connection.

\`\`\`html
<head>
  <!-- Connect early to the font servers (DNS + TCP + TLS before they are needed) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- CSS still blocks rendering on purpose (avoids a flash of unstyled page). Keep it small. -->
  <link rel="stylesheet" href="/css/app.css" />
  <!-- display=swap: show fallback text right away, swap in Inter when it arrives -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" />

  <!-- Our app: download in parallel, run after HTML is parsed, in order -->
  <script src="/js/app.js" defer></script>

  <!-- Independent third party: run whenever ready, never blocks parsing -->
  <script src="https://cdn.example-analytics.com/analytics.js" async></script>
</head>
<body>
  ...
  <script>
    // Chat widget is not needed for first paint: load it when the browser is idle.
    const loadChat = () => {
      const s = document.createElement('script');
      s.src = 'https://widget.example-chat.com/chat.js';
      s.async = true;
      document.body.appendChild(s);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(loadChat, { timeout: 5000 });
    else setTimeout(loadChat, 3000);
  </script>
</body>
\`\`\`

**Why it works:** with \`defer\` and \`async\`, the HTML parser never stops for script downloads, so the page can paint as soon as the CSS is ready. The chat widget (often 200+ KB) no longer competes with your own code on first load. \`preconnect\` saves one or more network round trips for the font.

Note: \`<script type="module">\` is deferred by default, which is why Vite-built apps already behave this way.`,
      followUps: [
        {
          q: 'When must you use defer instead of async?',
          a: 'When scripts depend on each other or on the full DOM. `defer` keeps the order; `async` runs in whatever order files arrive.',
        },
        {
          q: 'Why is CSS render-blocking, and can you fix that?',
          a: 'The browser will not paint without styles, to avoid a flash of unstyled content. Keep critical CSS small (inline the above-the-fold part if needed) and load the rest later or split it per route.',
        },
      ],
    },
    {
      id: 'cache-control-hashed-assets',
      title: 'Set Cache-Control for a Vite/React build',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'http-caching',
      question: `Your React app is built with Vite. The \`dist/\` folder looks like this:

\`\`\`text
dist/index.html
dist/assets/index-4f9c2a1b.js
dist/assets/index-a83d77e0.css
dist/assets/logo-19be2c3d.svg
\`\`\`

Two complaints: (1) "repeat visits are slow, everything downloads again", and (2) after the last deploy, "some users saw a broken old version". Write the Express setup with the right \`Cache-Control\` headers and explain the rule.`,
      hints: [
        'The hash in `index-4f9c2a1b.js` changes whenever the file content changes. So a given URL never changes content.',
        'If `index.html` is cached for a long time, users keep loading old asset names after a deploy.',
        'Hashed files: cache for a year as immutable. `index.html`: always check with the server (`no-cache`).',
      ],
      solution: `**Idea:** **hashed files** never change at the same URL, so cache them "forever". **\`index.html\`** is the entry point that points to the current hashes, so the browser must re-check it every time.

\`\`\`javascript
import express from 'express';
import path from 'node:path';

const app = express();
const dist = path.resolve('dist');

// 1. Hashed assets: 1 year + immutable (browser will not even re-check them)
app.use(
  '/assets',
  express.static(path.join(dist, 'assets'), {
    maxAge: '1y',
    immutable: true,      // -> Cache-Control: public, max-age=31536000, immutable
    index: false,
    fallthrough: false,   // a missing asset is a 404, not index.html
  })
);

// 2. Other static files (favicon, robots.txt): short cache
app.use(express.static(dist, { index: false, maxAge: '1h' }));

// 3. index.html for every app route: always revalidate
app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-cache'); // may store, but must check (ETag) before using
  res.sendFile(path.join(dist, 'index.html'));
});
\`\`\`

**Why it works:** on repeat visits the browser asks only for \`index.html\` (often a tiny \`304 Not Modified\` thanks to the ETag), and loads JS/CSS from its cache with no network request. After a deploy, the new \`index.html\` points at new file names, so users get the new version immediately — no stale mix.

Same idea on S3 + CloudFront: upload \`assets/\` with \`public, max-age=31536000, immutable\` and \`index.html\` with \`no-cache\`. Keep old asset files for a while after deploy so users with an open tab can still lazy-load old chunks.`,
      followUps: [
        {
          q: 'What is the difference between no-cache and no-store?',
          a: '`no-cache` = you may keep a copy but must check with the server before using it. `no-store` = never save it at all (for sensitive data like account pages or bank statements).',
        },
        {
          q: 'What Cache-Control would you use for a JSON API that returns the logged-in user\'s data?',
          a: '`private, no-store` (or `private, no-cache` with ETags). `private` stops CDNs and shared proxies from caching one user\'s data and serving it to another.',
        },
      ],
    },
    {
      id: 'debounce-throttle-scroll-resize',
      title: 'Janky page: fix scroll and resize handlers',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'main-thread-long-tasks',
      question: `A blog page stutters when scrolling and when resizing the window. Find the problems and fix them.

\`\`\`jsx
function ArticlePage() {
  const [showTop, setShowTop] = useState(false);
  const [layout, setLayout] = useState(computeLayout(window.innerWidth));

  useEffect(() => {
    window.addEventListener('scroll', () => {
      setShowTop(window.scrollY > 800);         // runs ~60+ times per second
    });
    window.addEventListener('resize', () => {
      setLayout(computeLayout(window.innerWidth)); // heavy: ~30ms each time
    });
  }, []);

  return <Article layout={layout} showBackToTop={showTop} />;
}
\`\`\``,
      hints: [
        'The listeners are never removed. What happens in React Strict Mode or when the user visits this page 10 times?',
        'Resize fires many times while the user drags. You only need the final size: **debounce**. Scroll needs smooth updates: limit to once per frame.',
        'For "has the user scrolled past X?", `IntersectionObserver` avoids scroll events completely.',
      ],
      solution: `**Idea:** (1) clean up listeners, (2) debounce the heavy resize work, (3) avoid per-scroll-event work — here an \`IntersectionObserver\` on a marker element is the best tool.

\`\`\`jsx
import { useEffect, useRef, useState } from 'react';

function debounce(fn, ms) {
  let id;
  const debounced = (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(id);
  return debounced;
}

function ArticlePage() {
  const [showTop, setShowTop] = useState(false);
  const [layout, setLayout] = useState(() => computeLayout(window.innerWidth)); // lazy init: runs once
  const markerRef = useRef(null);

  // Resize: only recompute after the user stops resizing for 150ms
  useEffect(() => {
    const onResize = debounce(() => setLayout(computeLayout(window.innerWidth)), 150);
    window.addEventListener('resize', onResize);
    return () => {
      onResize.cancel();
      window.removeEventListener('resize', onResize);   // cleanup
    };
  }, []);

  // "Back to top" button: no scroll listener at all.
  // The browser tells us when the marker (placed 800px down) leaves the screen.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setShowTop(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(markerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={markerRef} style={{ position: 'absolute', top: 800, height: 1, width: 1 }} />
      <Article layout={layout} showBackToTop={showTop} />
    </>
  );
}
\`\`\`

**Why it works:** the heavy layout function now runs once per resize gesture instead of dozens of times. The scroll state changes only when the marker crosses the edge of the screen, so React re-renders twice per scroll-down instead of 60 times per second. Removing listeners stops them from piling up.

If you really need a scroll listener (for example a reading-progress bar), mark it \`{ passive: true }\` and update at most once per frame with \`requestAnimationFrame\`.`,
      followUps: [
        {
          q: 'What does `{ passive: true }` do?',
          a: 'It promises the listener will not call `preventDefault()`, so the browser can scroll immediately without waiting for your JavaScript. Chrome already treats touch/wheel listeners on window as passive by default.',
        },
        {
          q: 'Could CSS solve the resize part instead?',
          a: 'Often yes. Media queries, container queries, flexbox and grid adapt layout without any JavaScript. Use JS only when the logic cannot be expressed in CSS.',
        },
      ],
    },
    {
      id: 'responsive-images-srcset',
      title: 'Serve the right image size with srcset and sizes',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'image-optimization',
      question: `A product card shows an image. On desktop the card is 400px wide in a 3-column grid; on phones (under 640px) it is full width. Today every device downloads \`shoe-2400.jpg\` (1.8 MB).

\`\`\`html
<img src="/img/shoe-2400.jpg" alt="Red running shoe" />
\`\`\`

You have these files available: \`shoe-400\`, \`shoe-800\`, \`shoe-1200\`, \`shoe-2400\` in JPEG, WebP and AVIF. Write the markup so each device downloads the smallest good image. Explain how the browser picks.`,
      hints: [
        '`srcset` with `w` descriptors tells the browser how wide each file is. `sizes` tells it how wide the image will be **displayed**.',
        'The browser multiplies the display width by the device pixel ratio (DPR) and picks the smallest file that is big enough.',
        'Use `<picture>` with `<source type="image/avif">` and `image/webp` so modern browsers get modern formats, with JPEG as a fallback.',
      ],
      solution: `**Idea:** give the browser a menu (\`srcset\`) and the display width (\`sizes\`). It does the math for the current screen. Wrap it in \`<picture>\` to offer AVIF/WebP first.

\`\`\`html
<picture>
  <!-- Newest format first; the browser takes the first type it supports -->
  <source
    type="image/avif"
    srcset="/img/shoe-400.avif 400w, /img/shoe-800.avif 800w,
            /img/shoe-1200.avif 1200w, /img/shoe-2400.avif 2400w"
    sizes="(max-width: 640px) 100vw, 400px"
  />
  <source
    type="image/webp"
    srcset="/img/shoe-400.webp 400w, /img/shoe-800.webp 800w,
            /img/shoe-1200.webp 1200w, /img/shoe-2400.webp 2400w"
    sizes="(max-width: 640px) 100vw, 400px"
  />
  <!-- Fallback + the element that actually renders -->
  <img
    src="/img/shoe-800.jpg"
    srcset="/img/shoe-400.jpg 400w, /img/shoe-800.jpg 800w,
            /img/shoe-1200.jpg 1200w, /img/shoe-2400.jpg 2400w"
    sizes="(max-width: 640px) 100vw, 400px"
    width="800" height="800"
    alt="Red running shoe"
    loading="lazy"
    decoding="async"
  />
</picture>
\`\`\`

(\`width\`/\`height\` give the aspect ratio so space is reserved — no layout shift. \`loading="lazy"\` is right for cards in a grid below the fold; do **not** use it for the main hero image.)

**How the browser picks** (examples):

- iPhone, 390px wide, DPR 3: \`sizes\` says 100vw = 390px -> needs 390 x 3 = 1170px -> picks **1200w**.
- Desktop, DPR 1: \`sizes\` says 400px -> needs 400px -> picks **400w**.
- Laptop, DPR 2: 400 x 2 = 800px -> picks **800w**.

**Why it works:** the browser knows the screen and DPR; you know the layout. Together they choose the smallest file that still looks sharp. AVIF/WebP are often 30-50% smaller than JPEG at similar quality.

In Next.js, \`<Image>\` generates the \`srcset\` for you, but you still must pass a correct \`sizes\` prop — without it, it assumes the image may be full screen width and picks bigger files.`,
      followUps: [
        {
          q: 'When do you use `x` descriptors (1x, 2x) instead of `w`?',
          a: 'For images that are always the same CSS size, like a 48px avatar or a logo: `srcset="a-48.png 1x, a-96.png 2x"`. No `sizes` needed.',
        },
        {
          q: 'What if `sizes` is wrong?',
          a: 'The browser trusts it. If you say 100vw but the image shows at 300px, desktops download files 4-6x too big. Check the real rendered width in DevTools.',
        },
      ],
    },
    {
      id: 'fix-cumulative-layout-shift',
      title: 'CLS is 0.35 on the product page — fix it',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'core-web-vitals',
      question: `On a product page, users try to tap "Add to cart" and hit something else because content jumps. Search Console says **CLS 0.35** (poor; good is 0.1 or less). The page:

\`\`\`jsx
<header>...</header>
{showCookieBanner && <CookieBanner />}          {/* appears after 1s, at the top */}
<img src={product.image} alt={product.name} />  {/* no width/height */}
<AdSlot id="pdp-top" />                         {/* ad script fills it after load */}
<h1 className="title">{product.name}</h1>       {/* custom web font, swaps in late */}
<Reviews productId={product.id} />              {/* fetches, renders nothing until loaded */}
<button>Add to cart</button>
\`\`\`

Find every cause of layout shift and fix each one.`,
      hints: [
        'Layout shift happens when something appears or changes size **above** content that is already visible, pushing it down.',
        'The browser cannot reserve space for an image or an ad if it does not know the size in advance.',
        'Fonts: a fallback font with different letter sizes makes text reflow when the real font arrives. Banners: overlay instead of pushing.',
      ],
      solution: `**Idea:** reserve space for everything that loads late, and show late UI **on top of** the page instead of **inside** the flow.

\`\`\`jsx
<header>...</header>

{/* 1. Cookie banner: fixed overlay at the bottom — it does not push content */}
{showCookieBanner && <CookieBanner className="cookie-banner" />}

{/* 2. Image: width + height let the browser reserve the box before the file loads */}
<img src={product.image} alt={product.name} width={800} height={800} className="product-img" />

{/* 3. Ad: reserve the slot's height even before the ad fills it */}
<div className="ad-slot"><AdSlot id="pdp-top" /></div>

<h1 className="title">{product.name}</h1>

{/* 4. Reviews: a skeleton with the same height as the loaded state */}
<Suspense fallback={<div className="reviews-skeleton" />}>
  <Reviews productId={product.id} />
</Suspense>

<button>Add to cart</button>
\`\`\`

\`\`\`css
.cookie-banner { position: fixed; inset: auto 0 0 0; z-index: 50; }   /* overlay */
.product-img   { width: 100%; height: auto; }                          /* keeps aspect ratio */
.ad-slot       { min-height: 250px; }                                  /* the ad's usual size */
.reviews-skeleton { min-height: 320px; }

/* 5. Web font: make the fallback font take the same space as the real one */
@font-face {
  font-family: 'Brand';
  src: url('/fonts/brand.woff2') format('woff2');
  font-display: swap;
}
@font-face {
  font-family: 'Brand Fallback';
  src: local('Arial');
  size-adjust: 104%;          /* tune these so Arial matches Brand's size */
  ascent-override: 92%;
  descent-override: 24%;
}
.title { font-family: 'Brand', 'Brand Fallback', sans-serif; }
\`\`\`

**Why it works:** CLS measures how much **visible** content moves unexpectedly. With reserved boxes (image ratio, ad min-height, skeleton), late content fills space that already exists. The banner floats over content instead of pushing it. The tuned fallback font has the same line sizes, so the swap barely moves text. (Next.js \`next/font\` generates these fallback overrides for you.)

Also: preload the brand font and serve it as \`woff2\` so the swap happens earlier. Shifts within 500ms of a user tap are not counted, but shifts caused by things loading on their own are.`,
      followUps: [
        {
          q: 'How do you find which elements shift?',
          a: 'Chrome DevTools Performance panel shows "Layout shift" entries and highlights the moved nodes. The `web-vitals` library with attribution reports the largest shifting element from real users.',
        },
        {
          q: 'Do CSS animations cause CLS?',
          a: 'Animating `top`, `height` or `margin` moves layout and can count. Animating `transform` and `opacity` does not cause layout shifts, and it is also cheaper for the browser.',
        },
      ],
    },
    {
      id: 'layout-thrashing-loop',
      title: 'Layout thrashing: a loop that freezes the page',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'reflow-layout-thrashing',
      question: `This function makes every card in a 500-card grid as tall as its title + 40px. With 500 cards, it takes ~400ms and the page freezes. The Performance panel shows many purple "Layout" blocks and a warning "Forced reflow".

\`\`\`javascript
function resizeCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    const titleHeight = card.querySelector('.title').offsetHeight;  // READ
    card.style.height = titleHeight + 40 + 'px';                     // WRITE
  });
}
window.addEventListener('resize', resizeCards);
\`\`\`

Why is it slow? Fix it.`,
      hints: [
        'After you **write** a style, the layout is "dirty". The next **read** of a size forces the browser to recalculate layout immediately.',
        'Here that happens 500 times: read, write, read (forced layout), write, read (forced layout)...',
        'Do all reads first, then all writes. Even better: can CSS do this without JavaScript?',
      ],
      solution: `**Idea:** this is **layout thrashing**: mixing reads and writes forces a full layout calculation on every loop step. Batch them — **read everything, then write everything** — so the browser lays out once. And run it at most once per frame.

\`\`\`javascript
function resizeCards() {
  const cards = [...document.querySelectorAll('.card')];

  // Phase 1: READ all sizes (one layout calculation at most)
  const heights = cards.map((card) => card.querySelector('.title').offsetHeight);

  // Phase 2: WRITE all styles (no reads in between -> no forced layout)
  cards.forEach((card, i) => {
    card.style.height = heights[i] + 40 + 'px';
  });
}

// Run at most once per animation frame while resizing
let scheduled = false;
window.addEventListener('resize', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    resizeCards();
  });
});
\`\`\`

**Even better — no JavaScript:** if the goal is "card height = content + spacing", let CSS do it:

\`\`\`css
.card { height: auto; padding-bottom: 40px; }   /* size follows content naturally */
\`\`\`

**Why it works:** the browser batches style changes and computes layout once before the next frame. Reading \`offsetHeight\` right after a write breaks that batching and forces a synchronous layout. Separating the phases changes "500 layouts" into "1 layout". Typically this goes from hundreds of ms down to a few ms.

Properties that force layout when read include \`offsetWidth/Height\`, \`clientWidth\`, \`scrollTop\`, \`getBoundingClientRect()\` and \`getComputedStyle()\`.`,
      followUps: [
        {
          q: 'How would you watch element sizes without polling or resize events?',
          a: 'Use `ResizeObserver`. It reports size changes after layout, in a batch, so you avoid forced reflows.',
        },
        {
          q: 'How do React apps cause layout thrashing?',
          a: 'Usually in `useLayoutEffect` that reads sizes and sets state in many components, or in third-party libraries that measure in a loop. Measure in one place and batch updates.',
        },
      ],
    },
    {
      id: 'reduce-2mb-bundle',
      title: 'The JS bundle is 2 MB — find and shrink it',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'bundle-analysis',
      question: `Your React + Vite dashboard ships one \`index.js\` of **2 MB** (600 KB gzipped). On a mid-range phone, the page takes 6 seconds to become usable. Your manager asks you to "make it smaller this sprint".

Walk through how you find what is big, and the fixes you would apply. Show the key code changes.`,
      hints: [
        'Do not guess — measure. A bundle visualizer shows a map of which packages take the most space.',
        'Typical culprits: a chart library on every page, full `lodash` or `moment` with all locales, big icon packs, a rich-text editor, duplicate versions of one package.',
        'Split by route with `React.lazy`, lazy-load heavy components when they are shown, and import only what you use.',
      ],
      solution: `**Idea:** 1) **measure** with a bundle analyzer, 2) **remove or replace** heavy libraries, 3) **split** the code so each page loads only what it needs, 4) **guard** the result with a size budget in CI.

**Step 1 — measure**

\`\`\`javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: 'stats.html', gzipSize: true, open: true }), // treemap after build
  ],
});
\`\`\`

Say the map shows: \`echarts\` 900 KB (used only on /reports), \`moment\` + locales 300 KB, full \`lodash\` 70 KB, \`react-quill\` 200 KB (only in the "Notes" modal).

**Step 2 & 3 — fix**

\`\`\`jsx
import { lazy, Suspense, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Route-based splitting: each page becomes its own chunk, loaded on navigation
const Overview = lazy(() => import('./pages/Overview'));
const Reports = lazy(() => import('./pages/Reports'));   // echarts now lives only in this chunk
const Settings = lazy(() => import('./pages/Settings'));

export function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Component-level splitting: the editor loads only when the modal opens
const NotesEditor = lazy(() => import('./NotesEditor'));
function NotesButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Notes</button>
      {open && (
        <Suspense fallback={<p>Loading editor...</p>}>
          <NotesEditor />
        </Suspense>
      )}
    </>
  );
}
\`\`\`

\`\`\`javascript
// Import only what you use
// Before: import _ from 'lodash';          -> whole library
import debounce from 'lodash-es/debounce';  // just one function (or write a 5-line debounce)

// Replace moment (large, not tree-shakeable) with date-fns or dayjs
import { format } from 'date-fns';
\`\`\`

**Step 4 — keep it small:** add a budget check (for example \`size-limit\` in CI: "main chunk must stay under 200 KB gzipped") so the next big import fails the build review.

**Why it works:** the first page now downloads only the core app (React, router, the Overview page). Heavy features are fetched on demand. Less JavaScript means less download, parse and execute time — and execution is the slow part on phones.`,
      followUps: [
        {
          q: 'What is tree shaking and why did full lodash not get tree-shaken?',
          a: 'Tree shaking removes unused exports from ES modules at build time. `lodash` is published as CommonJS, so the bundler cannot safely drop parts of it. `lodash-es` is ES modules, so unused functions are removed.',
        },
        {
          q: 'Lazy routes make navigation slower now. How do you fix that?',
          a: 'Prefetch likely next chunks: call the `import()` on link hover or when the browser is idle. Many routers and Next.js do this automatically for visible links.',
        },
        {
          q: 'How do you find duplicate packages?',
          a: 'The visualizer shows the same library twice; `npm ls <package>` shows which dependencies pull different versions. Fix with dependency upgrades or `overrides` in package.json.',
        },
      ],
    },
    {
      id: 'what-happens-type-url',
      title: 'What happens when you type a URL and press Enter?',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'url-to-page',
      question: `Classic question: "What happens, step by step, from typing \`https://shop.example.com\` in the address bar to seeing the page?"

Give a **structured** answer a senior interviewer would like: clear phases, a few key details per phase, and where performance can be improved.`,
      hints: [
        'Split it into phases: browser checks -> DNS -> connection (TCP + TLS) -> HTTP request/response -> rendering.',
        'Rendering itself has steps: HTML -> DOM, CSS -> CSSOM, render tree, layout, paint, composite. JavaScript can block parsing.',
        'For each phase, name one performance lever (CDN, preconnect, caching, defer, smaller CSS...).',
      ],
      solution: `**Idea:** tell it as a story in phases. Keep each phase short, then mention a performance tie-in. Go deeper only where the interviewer asks.

\`\`\`text
1. BROWSER PREP
   - Parse input: URL or search? Add https:// if needed.
   - HSTS list: if the site is HSTS, force HTTPS (no http:// round trip).
   - Check caches: service worker, then HTTP cache. A fresh cached page = no network.

2. DNS — find the IP address
   - Browser cache -> OS cache -> router -> ISP / DNS resolver -> root -> .com -> example.com servers.
   - Perf: DNS can cost 20-120ms. Use dns-prefetch / preconnect for third parties.

3. CONNECTION
   - TCP handshake (1 round trip), then TLS handshake (1 more with TLS 1.3): certificate check, keys agreed.
   - HTTP/3 uses QUIC over UDP: TCP + TLS combined, faster on bad mobile networks.
   - Perf: a CDN close to the user cuts every round trip. Keep connections reused.

4. HTTP REQUEST / RESPONSE
   - GET / with headers (cookies, accept-encoding: br, gzip).
   - CDN edge may answer from cache; otherwise origin server -> app (Node/Next.js) -> DB -> HTML.
   - Response: status, headers (Cache-Control, Content-Encoding: br), HTML body streamed.
   - Perf: TTFB (time to first byte). Improve with caching, SSG/ISR, streaming SSR, Brotli.

5. PARSE & BUILD
   - HTML parser builds the DOM, streaming as bytes arrive.
   - Preload scanner finds <link>, <script>, <img> early and starts downloads.
   - CSS -> CSSOM. CSS is render-blocking.
   - Normal <script> pauses parsing; defer/async do not.

6. RENDER
   - DOM + CSSOM -> render tree (visible nodes only).
   - Layout: compute size and position of each box.
   - Paint: draw pixels into layers. Composite: GPU combines layers on screen.
   - First paint / FCP, then LCP when the biggest content element appears.

7. AFTER LOAD
   - JS runs, React hydrates (attaches event handlers to server HTML), then the page is interactive.
   - Lazy images, analytics, prefetching next routes.
   - Perf: less JS = faster hydration = better INP.
\`\`\`

**Why this answer works:** it is ordered, covers networking **and** rendering, and links each step to a real optimization — showing you can use the knowledge, not just recite it. Offer to "zoom in" on any phase (TLS, DNS, or the rendering pipeline).`,
      followUps: [
        {
          q: 'What changes if the page is a client-side rendered React SPA?',
          a: 'The HTML is almost empty. The browser must download and run the JS bundle, then fetch data, then render. Content appears much later, which hurts LCP. SSR/SSG sends real HTML first.',
        },
        {
          q: 'What happens on the second visit?',
          a: 'DNS is cached, connections may be reused, hashed assets come from the HTTP cache, and only `index.html` is revalidated (often a 304). A service worker can even serve the page offline.',
        },
      ],
    },
    {
      id: 'slow-lcp-landing-page',
      title: 'LCP is 4.5s on the landing page — diagnose and fix',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'core-web-vitals',
      question: `Marketing says the landing page is slow. PageSpeed Insights (field data, mobile) shows **LCP 4.5s** (good is 2.5s or less). The LCP element is the hero image. Current setup:

\`\`\`jsx
// React SPA (client-side rendered), served from a single server in us-east-1
export default function Landing() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: 'url(/images/hero.png)' }}   // 1.4 MB PNG, 2400px wide
    >
      <h1>Ship faster with Example</h1>
    </section>
  );
}
\`\`\`

Most users are in India and Europe on mobile. How do you find where the 4.5s goes, and what do you change? Order your fixes by impact.`,
      hints: [
        'Break LCP into parts: time to first byte (TTFB), delay before the image request starts, image download time, and render delay.',
        'With client-side rendering and a CSS background, when does the browser even **learn** the image exists? (After the JS bundle downloads, runs and renders.)',
        'Make the image discoverable in the initial HTML, give it high priority, make it smaller, and serve everything from a CDN near the user.',
      ],
      solution: `**Idea:** LCP = **TTFB + load delay + load time + render delay**. Measure which part is big, then fix it. Here all four are bad: far server (TTFB), image hidden behind JS + CSS (load delay), 1.4 MB PNG (load time), and React must run before anything paints (render delay).

**Diagnose:** Chrome DevTools Performance panel (with network/CPU throttling) shows the LCP sub-parts; the \`web-vitals\` library with attribution reports them from real users. Expected finding: the hero request starts only after ~2.5s, when the JS bundle has run.

**Fixes, highest impact first:**

\`\`\`html
<!-- 1. Pre-render the page (SSG/SSR) so the hero is in the very first HTML. -->
<!-- 2. Use a real <img> with high priority instead of a CSS background. -->
<section class="hero">
  <img
    src="https://cdn.example.com/hero-1200.avif"
    srcset="https://cdn.example.com/hero-640.avif 640w,
            https://cdn.example.com/hero-1200.avif 1200w,
            https://cdn.example.com/hero-1920.avif 1920w"
    sizes="100vw"
    width="1920" height="900"
    alt=""
    fetchpriority="high"
    decoding="async"
  />
  <h1>Ship faster with Example</h1>
</section>
<!-- Never loading="lazy" on the LCP image: it delays the download. -->
\`\`\`

\`\`\`css
.hero { position: relative; }
.hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }
\`\`\`

3. **Shrink the image:** 1.4 MB PNG -> AVIF/WebP at the right sizes (usually 60-150 KB on mobile).
4. **CDN:** serve HTML and assets from a CDN (CloudFront, Cloudflare, Vercel edge) so users in India/Europe do not cross the ocean for every round trip. Cache the static HTML at the edge.
5. **If the image must stay a CSS background:** add \`<link rel="preload" as="image" href="..." fetchpriority="high">\` in the HTML head so it is found early.
6. **Reduce render delay:** small critical CSS, \`defer\` scripts, \`font-display: swap\` so the heading paints without waiting for fonts.

With Next.js, use \`next/image\` on the hero with its priority/preload option (the prop name changed across versions — check the docs for yours) and a static or ISR page.

**Verify:** compare lab results first, then watch **field** LCP (p75 in CrUX / your RUM) over the next 28 days — that is what Google uses.

**Why it works:** the biggest delay was **discovery**: the browser could not request the image until JS ran. Pre-rendered HTML + \`<img fetchpriority="high">\` starts the download immediately, the CDN cuts latency, and a 10x smaller file downloads fast even on 4G.`,
      followUps: [
        {
          q: 'Lab LCP is 1.8s but field LCP is 4.5s. Why?',
          a: 'Lab tests use one device and network. Real users have slower phones, worse networks, are far from your server, and may see cookie banners or A/B scripts. Field data (p75) is the truth; use lab to debug.',
        },
        {
          q: 'What does `fetchpriority="high"` actually do?',
          a: 'It tells the browser to download this image before other images. By default, images start at low priority until layout shows they are in the viewport.',
        },
        {
          q: 'The LCP element is text, not an image. What then?',
          a: 'Then it is mostly TTFB, render-blocking CSS and fonts. Server-render the text, inline critical CSS, preload the font, and use `font-display: swap` or `optional`.',
        },
      ],
    },
    {
      id: 'poor-inp-heavy-click-handler',
      title: 'Poor INP: the "Apply filters" button freezes the page',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'main-thread-long-tasks',
      question: `A React dashboard shows 20,000 transactions. Clicking **Apply filters** freezes the page for ~900ms: the button does not even show a pressed state. Real-user data shows **INP 950ms** (good is 200ms or less).

\`\`\`jsx
function Transactions({ all }) {
  const [rows, setRows] = useState(all);
  const [filters, setFilters] = useState(defaultFilters);

  function applyFilters() {
    const result = all
      .filter((t) => matches(t, filters))        // ~300ms
      .map(enrichWithCategoryAndFx)              // ~250ms
      .sort((a, b) => b.date - a.date);
    setRows(result);                             // renders 20,000 <tr> (~350ms)
  }

  return (
    <>
      <FilterForm value={filters} onChange={setFilters} />
      <button onClick={applyFilters}>Apply filters</button>
      <table><tbody>{rows.map((r) => <Row key={r.id} row={r} />)}</tbody></table>
    </>
  );
}
\`\`\`

Explain what INP measures and fix the problem.`,
      hints: [
        'INP (Interaction to Next Paint) = time from the click until the browser can paint the next frame. A 900ms task on the main thread blocks that paint.',
        'Give feedback first (show "Filtering..."), then do the heavy work later or elsewhere: a Web Worker, or chunks that yield to the browser.',
        'The render is also huge: 20,000 rows. Mark the update as non-urgent with `useTransition`, and only render visible rows (virtualization).',
      ],
      solution: `**Idea:** the click starts one huge **long task** (filter + map + sort + giant render), so the browser cannot paint anything until it ends. Fix it in three ways: (1) move the data work **off the main thread** (Web Worker), (2) make the React update **non-urgent** so the click can paint right away, (3) **render fewer rows**.

\`\`\`javascript
// filter.worker.js — runs on a separate thread
import { matches, enrichWithCategoryAndFx } from './transactions-logic.js';

let all = [];
self.onmessage = (e) => {
  if (e.data.type === 'init') { all = e.data.rows; return; }   // send the data once
  if (e.data.type === 'filter') {
    const result = all
      .filter((t) => matches(t, e.data.filters))
      .map(enrichWithCategoryAndFx)
      .sort((a, b) => b.date - a.date);
    self.postMessage({ requestId: e.data.requestId, result });
  }
};
\`\`\`

\`\`\`jsx
import { useEffect, useRef, useState, useTransition } from 'react';

function Transactions({ all }) {
  const [rows, setRows] = useState(all);
  const [filters, setFilters] = useState(defaultFilters);
  const [working, setWorking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const workerRef = useRef(null);
  const lastRequest = useRef(0);

  useEffect(() => {
    const worker = new Worker(new URL('./filter.worker.js', import.meta.url), { type: 'module' });
    worker.postMessage({ type: 'init', rows: all });
    worker.onmessage = (e) => {
      if (e.data.requestId !== lastRequest.current) return;   // ignore outdated results
      setWorking(false);
      startTransition(() => setRows(e.data.result));          // non-urgent: can be interrupted
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, [all]);

  function applyFilters() {
    setWorking(true);                                          // cheap update -> paints right away
    lastRequest.current += 1;
    workerRef.current.postMessage({ type: 'filter', filters, requestId: lastRequest.current });
  }

  return (
    <>
      <FilterForm value={filters} onChange={setFilters} />
      <button onClick={applyFilters} disabled={working}>
        {working || isPending ? 'Filtering...' : 'Apply filters'}
      </button>
      {/* Render only visible rows (see the virtualization problem) */}
      <VirtualTable rows={rows} rowHeight={40} height={600} />
    </>
  );
}
\`\`\`

**No worker possible?** Split the loop into chunks and yield between them so the browser can paint and handle input:

\`\`\`javascript
function yieldToMain() {
  if (globalThis.scheduler?.yield) return globalThis.scheduler.yield(); // newer Chromium
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function processInChunks(items, work, budgetMs = 8) {
  const results = [];
  let deadline = performance.now() + budgetMs;
  for (const item of items) {
    results.push(work(item));
    if (performance.now() > deadline) {   // used our time slice -> let the browser breathe
      await yieldToMain();
      deadline = performance.now() + budgetMs;
    }
  }
  return results;
}
\`\`\`

**Why it works:** the click handler now only flips a boolean, so the next frame (button shows "Filtering...") paints within a few ms — that is what INP measures. The 550ms of data work runs on another thread. \`startTransition\` lets React split rendering and drop it if a new click comes in. Virtualization cuts 20,000 rows to ~20 DOM rows, so the final render is cheap too.`,
      followUps: [
        {
          q: 'What is a long task?',
          a: 'Any main-thread task over 50ms. During it the browser cannot respond to input or paint. The Performance panel marks them with a red corner.',
        },
        {
          q: 'What is the cost of a Web Worker?',
          a: 'Data is copied between threads (structured clone), which costs time for big arrays. Send data once and keep it in the worker, or use transferable objects like ArrayBuffer. Workers also cannot touch the DOM.',
        },
        {
          q: 'Should the filtering happen on the server instead?',
          a: 'For 20,000+ rows, often yes: the API filters, sorts and paginates with database indexes, and the client only receives one page. Client-side work suits small data sets or offline use.',
        },
      ],
    },
    {
      id: 'virtualize-infinite-list',
      title: 'Infinite feed gets slower the more you scroll — virtualize it',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'main-thread-long-tasks',
      question: `An activity feed loads 50 items per page as the user scrolls ("infinite scroll"). After 3,000 items, scrolling is choppy and memory is high. DevTools shows ~30,000 DOM nodes.

\`\`\`jsx
function Feed({ items, loadMore, hasMore }) {
  return (
    <div className="feed" onScroll={(e) => {
      const el = e.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200 && hasMore) loadMore();
    }}>
      {items.map((item) => <FeedRow key={item.id} item={item} />)}
    </div>
  );
}
\`\`\`

Rows have a fixed height of 72px; the feed box is 600px tall. Write a virtualized version: only render rows that are visible (plus a small buffer), and keep loading more near the end. Also point out the bug in the current \`loadMore\` logic.`,
      hints: [
        'Only about 600 / 72 = 9 rows are visible at once. Why render 3,000?',
        'Use one tall inner div (items.length x 72px) to keep the scrollbar correct, and absolutely position just the visible rows inside it.',
        'Visible range: `start = floor(scrollTop / rowHeight)`, `end = ceil((scrollTop + height) / rowHeight)`. Add an overscan of a few rows. The old code calls `loadMore` many times while one request is in flight.',
      ],
      solution: `**Idea:** **virtualization** (also called windowing): keep a full-height spacer for the scrollbar, but create DOM only for the rows in view plus a few extra. Trigger \`loadMore\` when the visible range nears the end — but only if a request is not already running.

\`\`\`jsx
import { useEffect, useState } from 'react';

export function VirtualFeed({
  items,
  loadMore,          // async () => void
  hasMore,
  rowHeight = 72,
  height = 600,
  overscan = 5,      // extra rows above/below so fast scrolling does not show blanks
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [loading, setLoading] = useState(false);

  // Which rows are on screen?
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  const visible = items.slice(start, end);

  // Load the next page when we are within 10 rows of the end (one request at a time)
  useEffect(() => {
    if (!hasMore || loading || end < items.length - 10) return;
    setLoading(true);
    loadMore().finally(() => setLoading(false));
  }, [end, items.length, hasMore, loading, loadMore]);

  return (
    <div
      className="feed"
      style={{ height, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* Spacer: makes the scrollbar act like all rows exist */}
      <div style={{ height: items.length * rowHeight, position: 'relative' }}>
        {visible.map((item, i) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: (start + i) * rowHeight,
              left: 0,
              right: 0,
              height: rowHeight,
            }}
          >
            <FeedRow item={item} />
          </div>
        ))}
      </div>
      {loading && <p className="feed-loading">Loading...</p>}
    </div>
  );
}

// Example: scrollTop = 4800, rowHeight = 72, height = 600, overscan = 5
// start = floor(4800 / 72) - 5 = 61, end = ceil(5400 / 72) + 5 = 80 -> only 19 rows in the DOM
\`\`\`

**The bug in the old code:** the scroll event fires many times near the bottom, so \`loadMore\` is called again and again before the first request finishes — duplicate requests and duplicate items. The \`loading\` flag fixes that.

**Why it works:** the DOM size stays around 20 rows no matter if the list has 100 or 100,000 items, so layout, paint and memory stay constant. The tall spacer keeps native scrolling and the scrollbar correct.

In production, use a library like \`@tanstack/react-virtual\` or \`react-window\`: they also handle **variable row heights** (by measuring rows), scroll restoration and keyboard focus, which are hard to get right by hand. Also wrap \`FeedRow\` in \`React.memo\` so rows that stay visible do not re-render on every scroll.`,
      followUps: [
        {
          q: 'What breaks with virtualization?',
          a: 'Ctrl+F browser search cannot find rows that are not rendered, screen readers see fewer items, and scroll position restore needs care. Consider "Load more" pagination or keeping a reasonable maximum when these matter.',
        },
        {
          q: 'Is there a CSS-only alternative?',
          a: '`content-visibility: auto` with `contain-intrinsic-size` lets the browser skip layout/paint for off-screen rows. The nodes still exist (memory), but rendering work drops a lot. Good for long articles; real virtualization is better for huge lists.',
        },
        {
          q: 'How would you trigger loading without a scroll handler?',
          a: 'Put a small "sentinel" element after the last row and watch it with `IntersectionObserver`; when it becomes visible, load the next page.',
        },
      ],
    },
  ],
};
