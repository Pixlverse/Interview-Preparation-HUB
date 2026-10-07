// Web Performance & Browser — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'web-performance',
  title: 'Web Performance & Browser',
  icon: '🚀',
  description: 'How the browser turns code into pixels, what happens when you type a URL, and how to make pages load and respond fast: caching, CDNs, lazy loading, code splitting, images, Core Web Vitals and measuring.',
  definitionTitle: 'What is web performance?',
  definition: `**Web performance** is how **fast and smooth** a website feels: how quickly content appears, how fast it responds to clicks, and whether things jump around while loading.

It depends on how the browser **renders** a page (HTML → DOM, CSS → CSSOM, then layout, paint and composite), and on what you send it: bundle size, images, caching, CDNs and lazy loading. Google measures it with **Core Web Vitals**: **LCP** (loading), **INP** (responsiveness) and **CLS** (visual stability).

**One-line answer:** "Web performance is how quickly and smoothly a page loads and responds, measured by Core Web Vitals and improved through caching, code splitting, lazy loading, image optimisation and CDNs."`,
  topics: [
    {
      id: 'browser-rendering',
      title: 'How a Browser Renders a Page (Critical Rendering Path)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'HTML becomes the DOM, CSS becomes the CSSOM, they combine into the render tree, then the browser does layout, paint and composite.',
      what: `When the browser gets HTML, it goes through these steps to show pixels:

1. **Parse HTML → DOM.** The DOM (Document Object Model) is a tree of all elements.
2. **Parse CSS → CSSOM.** The CSSOM is a tree of all style rules.
3. **Render tree.** DOM + CSSOM combined, only with **visible** elements (\`display: none\` is left out).
4. **Layout** (also called reflow). Work out the exact size and position of every box.
5. **Paint.** Fill in pixels: text, colors, borders, shadows, images — often into several layers.
6. **Composite.** Put the layers together in the right order and show them on screen (the GPU helps here).

This sequence is called the **Critical Rendering Path**.

#### Deeper version
- **CSS is render-blocking.** The browser will not paint until it has the CSS, otherwise it would show unstyled content and then jump.
- **Normal \`<script>\` is parser-blocking.** When the parser meets \`<script src>\`, it stops building the DOM, downloads and runs the script, then continues — because the script might change the DOM. \`defer\` and \`async\` change this.
- A **preload scanner** looks ahead in the HTML and starts downloading images, scripts and CSS early, even while the main parser is blocked.
- After the first render, changes cause some steps to run again:
  - Change geometry (\`width\`, \`top\`, adding elements) → **layout + paint + composite** (most expensive).
  - Change only looks (\`color\`, \`background\`) → **paint + composite**.
  - Change \`transform\` or \`opacity\` on its own layer → often **composite only** (cheapest). That is why smooth animations use transform and opacity.
- All this, plus your JavaScript, runs on the **main thread**. If JS is busy, the page cannot render or respond.`,
      why: `Knowing the pipeline tells you **why** pages are slow: big CSS files delay first paint, sync scripts in the \`<head>\` block parsing, and animating \`top\`/\`left\` triggers layout every frame. Almost every performance fix maps to one step here.`,
      analogy: `Building a house from plans. The HTML is the room list (DOM), the CSS is the interior design book (CSSOM). You combine them into a final plan of rooms that will actually be built (render tree), measure every wall (layout), paint the walls (paint), then assemble pre-painted panels into the house (composite). Moving a wall means re-measuring everything; moving a painting on the wall is cheap.`,
      code: [
        {
          title: 'A page that renders fast',
          lang: 'html',
          code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- CSS is render-blocking: keep it small, load it early -->
  <link rel="stylesheet" href="/styles.css" />
  <!-- defer: download in parallel, run after HTML is parsed, in order -->
  <script src="/app.js" defer></script>
</head>
<body>
  <h1>Hello</h1>
  <img src="/hero.webp" width="1200" height="600" alt="Hero" />
</body>
</html>`,
        },
        {
          title: 'Cheap vs expensive animation',
          lang: 'css',
          code: `/* Expensive: changes geometry -> layout + paint every frame */
.box-slow { position: relative; transition: left 300ms; }
.box-slow:hover { left: 100px; }

/* Cheap: transform/opacity can be composited, often on the GPU */
.box-fast { transition: transform 300ms, opacity 300ms; }
.box-fast:hover { transform: translateX(100px); opacity: 0.8; }`,
        },
      ],
      output: `In the HTML, the browser starts downloading \`styles.css\` and \`app.js\` early. Because the script has \`defer\`, the parser does not stop; the full DOM is built, CSS arrives, the page paints, and then \`app.js\` runs. The image has \`width\` and \`height\`, so layout reserves space and nothing jumps when it loads.

In the CSS, hovering \`.box-slow\` recalculates layout on every animation frame and can stutter on slow phones. \`.box-fast\` moves the same distance using only compositing, so it stays smooth at 60 frames per second.`,
      questions: [
        {
          q: 'Explain the critical rendering path.',
          a: 'Parse HTML into the DOM, parse CSS into the CSSOM, combine them into the render tree, run layout to compute positions and sizes, paint pixels into layers, and composite the layers onto the screen.',
        },
        {
          q: 'Why is CSS render-blocking?',
          a: 'The browser needs the styles to know how things look and where they go. Painting without them would show unstyled content and then jump, so it waits for CSS in the head.',
        },
        {
          q: 'What is the difference between reflow and repaint?',
          a: 'Reflow (layout) recalculates positions and sizes and is expensive. Repaint redraws pixels without changing geometry, like a color change. Reflow is always followed by repaint.',
        },
        {
          q: 'Why animate transform and opacity?',
          a: 'They can usually be handled in the composite step without layout or paint, often on the GPU, so they stay smooth.',
        },
      ],
      spoken: `"The browser parses HTML into the DOM and CSS into the CSSOM, then combines them into the render tree, which contains only visible elements. Then it runs layout to calculate sizes and positions, paints pixels into layers, and composites those layers to the screen. CSS blocks rendering and normal scripts block parsing, so I keep critical CSS small and use defer for scripts. After load, changing geometry triggers layout again, which is expensive, so for animations I stick to transform and opacity, which can be composited cheaply."`,
      mistakes: [
        'Saying the render tree contains every DOM node. Elements with `display: none` are not in it (but `visibility: hidden` ones are, because they still take space).',
        'Putting large synchronous scripts in the `<head>` without `defer`, which blocks parsing.',
        'Animating `width`, `height`, `top` or `left` instead of `transform`.',
        'Follow-up trap: "Does JavaScript block rendering?" A normal script blocks HTML parsing, and any long JS task blocks the main thread so the browser cannot render or respond until it finishes.',
      ],
      takeaway: 'DOM + CSSOM → render tree → layout → paint → composite; most performance fixes make one of these steps cheaper or earlier.',
    },
    {
      id: 'url-to-page',
      title: 'What Happens When You Type a URL',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'URL parsing, cache checks, DNS lookup, TCP + TLS handshakes, HTTP request, server work, response, then parsing and rendering.',
      what: `The classic interview question. The simple story:

1. **You type** \`https://shop.example.com/products\` and press Enter. The browser checks if it is a URL or a search term.
2. **Cache checks.** Maybe there is a cached page or a service worker can answer. HSTS may force HTTPS.
3. **DNS lookup.** Turn the name \`shop.example.com\` into an IP address (like \`93.184.215.14\`).
4. **TCP connection.** A three-way handshake (SYN, SYN-ACK, ACK) to the server's IP on port 443.
5. **TLS handshake.** Agree on encryption and check the server's certificate.
6. **HTTP request.** \`GET /products\` with headers (cookies, accept, user-agent).
7. **Server side.** Load balancer → web server → app (Node/Next.js) → database → builds a response.
8. **HTTP response.** Status (\`200\`), headers (\`Content-Type\`, \`Cache-Control\`), and the HTML body.
9. **Rendering.** Parse HTML → DOM, find CSS/JS/images and fetch them, build CSSOM, layout, paint, composite.
10. **JavaScript runs.** The SPA hydrates or mounts, fetches more data, and the page becomes interactive.

#### Deeper version
- **DNS in detail:** browser cache → OS cache (and hosts file) → the **recursive resolver** (your ISP or 1.1.1.1/8.8.8.8). On a miss, it asks a **root** server → the **TLD** server (\`.com\`) → the domain's **authoritative** server, which returns the A/AAAA record. Results are cached for the record's **TTL**.
- **CDN:** often DNS points to a CDN edge near you, which may answer from cache without reaching your origin server.
- **HTTP versions:** HTTP/2 multiplexes many requests on one TCP connection. **HTTP/3** runs on **QUIC** (over UDP), combining transport and TLS setup into fewer round trips and avoiding TCP head-of-line blocking.
- **TLS 1.3** needs one round trip; resumed sessions can be faster. **Connection reuse** (keep-alive) avoids repeating handshakes.
- **Redirects** (\`http\` → \`https\`, \`example.com\` → \`www\`) each cost a full round trip.
- On the server side you can mention reverse proxy (Nginx), load balancing, auth middleware, caching (Redis) and the database.`,
      why: `It checks if you understand the full stack — networking, security, servers and the browser — and how each step adds delay. It is also the base for all performance work: DNS, connection setup, server time (TTFB), download size and rendering are the things you optimize.`,
      analogy: `Sending someone to buy a book. You look up the shop's address in the phone book (DNS), drive there and knock (TCP), show ID and agree on a secret language (TLS), ask for the book (HTTP request), the shop gets it from the warehouse (server and DB), hands it over (response), and you open it and read it (rendering).`,
      code: [
        {
          title: 'Watch each step from the terminal',
          lang: 'bash',
          code: `# DNS: name -> IP
dig +short shop.example.com

# Timing of each phase with curl
curl -o /dev/null -s -w "dns: %{time_namelookup}s\\ntcp: %{time_connect}s\\ntls: %{time_appconnect}s\\nttfb: %{time_starttransfer}s\\ntotal: %{time_total}s\\n" https://example.com/`,
        },
        {
          title: 'Read the same timings in the browser',
          lang: 'javascript',
          code: `// Run in the DevTools console after a page loads
const [nav] = performance.getEntriesByType('navigation');
console.table({
  dns: nav.domainLookupEnd - nav.domainLookupStart,
  tcpAndTls: nav.connectEnd - nav.connectStart,
  tls: nav.secureConnectionStart ? nav.connectEnd - nav.secureConnectionStart : 0,
  ttfb: nav.responseStart - nav.requestStart,
  download: nav.responseEnd - nav.responseStart,
  domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
  load: nav.loadEventEnd - nav.startTime,
});`,
        },
      ],
      output: `\`dig\` prints the IP address(es) for the domain. The \`curl\` command prints cumulative times, for example \`dns: 0.012s\`, \`tcp: 0.030s\`, \`tls: 0.070s\`, \`ttfb: 0.180s\`, \`total: 0.200s\` — so you can see whether DNS, the connection, the server (TTFB = time to first byte) or the download is slow.

The browser snippet shows the same phases in milliseconds from the Navigation Timing API, plus when \`DOMContentLoaded\` and \`load\` fired. Values are 0 when the connection was reused or DNS was cached.`,
      questions: [
        {
          q: 'What happens when you type a URL and press Enter?',
          a: 'Parse the URL, check caches and HSTS, DNS lookup, TCP handshake, TLS handshake, send the HTTP request, the server processes it and responds, then the browser parses HTML, loads sub-resources, builds DOM and CSSOM, does layout, paint and composite, and runs JavaScript.',
        },
        {
          q: 'How does DNS resolution work?',
          a: 'Browser and OS caches first, then a recursive resolver. On a miss, the resolver asks a root server, then the TLD server, then the authoritative server for the domain, and caches the answer for its TTL.',
        },
        {
          q: 'What is TTFB?',
          a: 'Time To First Byte: time from sending the request until the first byte of the response arrives. It includes network latency and server processing time.',
        },
        {
          q: 'What changes with HTTP/2 and HTTP/3?',
          a: 'HTTP/2 multiplexes many requests over one connection with header compression. HTTP/3 uses QUIC over UDP, with faster connection setup and no TCP head-of-line blocking.',
        },
      ],
      spoken: `"First the browser parses the URL and checks caches, including HSTS to force HTTPS. Then DNS resolves the domain to an IP — browser cache, OS, recursive resolver, and if needed root, TLD and authoritative servers. Next comes the TCP handshake and the TLS handshake, where the certificate is verified. The browser sends the HTTP request, which might hit a CDN or go through a load balancer to my Node server and database. The response comes back with headers and HTML. The browser builds the DOM and CSSOM, fetches CSS, JS and images, does layout, paint and composite, and finally JavaScript makes the page interactive."`,
      mistakes: [
        'Skipping TLS or DNS details — interviewers usually want each network step named.',
        'Forgetting the rendering part. The answer is not complete at "the server sends HTML".',
        'Saying DNS always goes to the root servers. Most lookups are answered from a cache.',
        'Follow-up trap: "Where can you save time in this flow?" CDN (shorter distance, cache), connection reuse and preconnect, fewer redirects, HTTP/2 or 3, faster server response, smaller and fewer render-blocking resources.',
      ],
      takeaway: 'URL → cache → DNS → TCP → TLS → HTTP request → server → response → parse → render → JS; each step is a place to lose or win time.',
    },
    {
      id: 'lazy-loading',
      title: 'Lazy Loading (images, iframes, React.lazy)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Load things only when they are needed: offscreen images and iframes with loading="lazy", and components with React.lazy + Suspense.',
      what: `**Lazy loading** means: do not load something until the user is likely to need it.

- **Images and iframes:** add \`loading="lazy"\`. The browser loads them only when they get close to the viewport (the visible part of the page).
- **JavaScript components:** \`React.lazy(() => import('./Chart'))\` loads the component's code only when it first renders. Wrap it in \`<Suspense>\` to show a fallback while it loads.
- **Data and anything else:** an \`IntersectionObserver\` tells you when an element becomes visible, so you can load it then (infinite scroll, heavy widgets).

#### Deeper version
- **Never lazy-load the LCP image** (the big hero image at the top). It delays your most important paint. For the hero, use eager loading and even \`fetchpriority="high"\`.
- Always set \`width\` and \`height\` (or CSS \`aspect-ratio\`) on lazy images so space is reserved and the layout does not jump (CLS).
- Native \`loading="lazy"\` is supported in all modern browsers. The exact distance from the viewport where loading starts is chosen by the browser.
- \`React.lazy\` needs a **default export** (or a small wrapper that maps a named export to \`default\`).
- Put an **Error Boundary** around lazy components — a chunk can fail to load (for example after a new deploy deletes old files).
- Lazy loading on interaction: load a heavy library (like a rich text editor or PDF viewer) only when the user clicks a button. You can also **preload on hover** to hide the delay.
- Next.js: \`next/image\` lazy-loads by default unless you mark it as priority (check your version's docs, the prop name changed in recent versions), and \`next/dynamic\` is its lazy component helper.`,
      why: `Most pages load lots of things the user never sees: images far down the page, YouTube embeds, admin-only widgets. Loading them upfront wastes bandwidth, CPU and memory, and competes with the important content. Lazy loading makes the first view faster, especially on mobile.`,
      analogy: `A restaurant does not cook every dish on the menu when you sit down. It cooks what you order, when you order it. Lazy loading is cooking to order — but the starter you will surely eat (the hero image) is ready on the table.`,
      code: [
        {
          title: 'Native lazy images and iframes',
          lang: 'html',
          code: `<!-- Hero (LCP) image: load immediately, high priority -->
<img src="/hero.webp" width="1200" height="600" alt="Product" fetchpriority="high" />

<!-- Below the fold: load when the user scrolls near it -->
<img src="/review-1.webp" width="400" height="300" alt="Review" loading="lazy" decoding="async" />

<!-- Heavy embed: lazy too -->
<iframe src="https://www.youtube.com/embed/VIDEO_ID" width="560" height="315"
        loading="lazy" title="Demo video"></iframe>`,
        },
        {
          title: 'React.lazy with Suspense',
          lang: 'jsx',
          code: `import { lazy, Suspense, useState } from 'react';

// The chart code (and its big library) is split into its own chunk
const SalesChart = lazy(() => import('./SalesChart'));

export default function Dashboard() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        onMouseEnter={() => import('./SalesChart')} // warm up the chunk on hover
        onClick={() => setShow(true)}
      >
        Show sales chart
      </button>
      {show && (
        <Suspense fallback={<p>Loading chart...</p>}>
          <SalesChart />
        </Suspense>
      )}
    </div>
  );
}`,
        },
        {
          title: 'IntersectionObserver for anything',
          lang: 'javascript',
          code: `const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    loadComments(entry.target);           // your function: fetch and render
    observer.unobserve(entry.target);     // only once
  }
}, { rootMargin: '200px' });              // start 200px before it is visible

observer.observe(document.querySelector('#comments'));`,
        },
      ],
      output: `On page load the browser downloads only the hero image and the images and iframe near the screen. The review image and the YouTube embed start loading when the user scrolls close to them. Because sizes are set, the page does not jump.

In the dashboard, the chart chunk is not in the main bundle. Hovering the button starts downloading it; clicking shows "Loading chart..." for a moment (often not at all, thanks to the hover warm-up) and then the chart. The observer loads comments when the \`#comments\` section is within 200px of the viewport, then stops watching.`,
      questions: [
        {
          q: 'What is lazy loading?',
          a: 'Delaying the loading of resources (images, iframes, code, data) until they are needed, usually when they come near the viewport or when the user interacts.',
        },
        {
          q: 'Should you lazy-load every image?',
          a: 'No. Never lazy-load above-the-fold images, especially the LCP image. That makes LCP worse. Lazy-load only offscreen content.',
        },
        {
          q: 'How does React.lazy work?',
          a: 'It takes a function that returns a dynamic `import()`. The bundler splits that module into a separate chunk, which is fetched the first time the component renders. Suspense shows a fallback while it loads.',
        },
        {
          q: 'What happens if a lazy chunk fails to load?',
          a: 'The lazy component throws an error. Catch it with an Error Boundary and offer a retry or a page reload (common after a deploy removed old chunks).',
        },
      ],
      spoken: `"Lazy loading means loading things only when they are needed. For images and iframes I use the native loading lazy attribute, but never on the hero or LCP image — that one gets fetchpriority high instead. I always set width and height so there is no layout shift. For code, I use React.lazy with a dynamic import and Suspense, so heavy components like charts or editors become separate chunks, and I sometimes preload them on hover. For other content I use IntersectionObserver. I wrap lazy components in an error boundary in case a chunk fails to load."`,
      mistakes: [
        'Lazy-loading the LCP hero image, which delays the most important paint.',
        'Lazy images without width/height, causing layout shift when they load.',
        'Lazy-loading tiny components. Each chunk is an extra request; split only meaningful, heavy pieces.',
        'Follow-up trap: "Can you use React.lazy with named exports?" Not directly — it expects a default export. Use `lazy(() => import(\'./x\').then((m) => ({ default: m.Chart })))`.',
      ],
      takeaway: 'Lazy-load what is offscreen or behind a click — and never the hero image.',
    },
    {
      id: 'image-optimization',
      title: 'Image Optimization (formats, srcset, sizes)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Serve the right format (AVIF/WebP), the right size for each screen (srcset + sizes), compressed, with dimensions set.',
      what: `Images are often the **heaviest** part of a page. Four simple rules:

1. **Right format.** Photos: **AVIF** or **WebP** (much smaller than JPEG at the same quality). Logos/icons: **SVG**. Screenshots with text: PNG or WebP. Avoid huge GIFs — use video (MP4/WebM) instead.
2. **Right size.** Do not send a 3000px image to a 400px phone screen. Use **\`srcset\`** to offer several sizes and **\`sizes\`** to tell the browser how wide it will be shown.
3. **Compress.** Quality around 70-80 is usually invisible to users.
4. **Set dimensions** (\`width\`/\`height\`) to avoid layout shift.

#### Deeper version
- **\`srcset\` with \`w\` descriptors** lists files and their real widths. **\`sizes\`** describes the display width per screen size (\`(max-width: 600px) 100vw, 50vw\`). The browser picks the best file using the screen width and device pixel ratio.
- **\`<picture>\`** with \`<source type="image/avif">\` lets the browser pick the first format it supports, with a JPEG fallback.
- **Art direction:** \`<source media="...">\` in \`<picture>\` to show a different crop on mobile.
- **Priority:** the LCP image gets \`fetchpriority="high"\` and no lazy loading. Consider \`<link rel="preload" as="image">\` if it is found late (for example a CSS background).
- **Image CDNs** (Cloudinary, imgix, CloudFront + Lambda, Vercel/Next.js image optimization) resize and convert on the fly using URL parameters and the \`Accept\` header.
- \`decoding="async"\` lets decoding happen off the critical path.
- Build-time tools: **sharp** (Node), squoosh, svgo for SVGs.
- Next.js \`next/image\` handles srcset, lazy loading and modern formats for you.`,
      why: `Images usually make up a big share of page weight and are often the LCP element. Shrinking them is one of the fastest, biggest wins for load time, data costs on mobile and Core Web Vitals.`,
      analogy: `Sending a photo by post: you would not mail a wall-sized poster to someone with a tiny photo frame. srcset is offering several print sizes and letting the receiver pick the one that fits their frame; AVIF/WebP is better paper that weighs less for the same picture.`,
      code: [
        {
          title: 'Responsive, modern-format image',
          lang: 'html',
          code: `<picture>
  <source type="image/avif"
          srcset="/img/hero-480.avif 480w, /img/hero-960.avif 960w, /img/hero-1600.avif 1600w"
          sizes="(max-width: 600px) 100vw, 50vw" />
  <source type="image/webp"
          srcset="/img/hero-480.webp 480w, /img/hero-960.webp 960w, /img/hero-1600.webp 1600w"
          sizes="(max-width: 600px) 100vw, 50vw" />
  <!-- Fallback for old browsers; width/height prevent layout shift -->
  <img src="/img/hero-960.jpg" width="1600" height="900" alt="Team at work"
       fetchpriority="high" decoding="async" />
</picture>`,
        },
        {
          title: 'Generate sizes and formats with sharp (Node)',
          lang: 'javascript',
          code: `import sharp from 'sharp';

const widths = [480, 960, 1600];
for (const w of widths) {
  await sharp('src/hero.jpg').resize({ width: w }).avif({ quality: 50 }).toFile('public/img/hero-' + w + '.avif');
  await sharp('src/hero.jpg').resize({ width: w }).webp({ quality: 75 }).toFile('public/img/hero-' + w + '.webp');
}
await sharp('src/hero.jpg').resize({ width: 960 }).jpeg({ quality: 78, mozjpeg: true }).toFile('public/img/hero-960.jpg');`,
        },
      ],
      output: `A phone 400px wide with a 2x screen needs about 800 real pixels. The browser reads \`sizes\` (100vw on small screens), sees AVIF support, and downloads \`hero-960.avif\` — maybe 60 KB instead of a 900 KB original JPEG. A desktop showing the image at half width on a big screen may pick \`hero-1600.avif\`. Older browsers fall back to WebP or the JPEG. The sharp script creates all these files at build time.`,
      questions: [
        {
          q: 'How do you optimize images on a website?',
          a: 'Use modern formats (AVIF/WebP), serve responsive sizes with srcset and sizes, compress, set width and height, lazy-load offscreen images, prioritize the LCP image, and use an image CDN.',
        },
        {
          q: 'What is the difference between srcset and sizes?',
          a: '`srcset` lists available files and their widths. `sizes` tells the browser how wide the image will be displayed at different screen sizes, so it can pick the best file before CSS is loaded.',
        },
        {
          q: 'When would you use the picture element?',
          a: 'To offer different formats with fallbacks (AVIF, WebP, JPEG) or different crops for different screens (art direction).',
        },
        {
          q: 'WebP vs AVIF?',
          a: 'Both are much smaller than JPEG. AVIF usually compresses better but encodes slower. WebP has the widest support. Many sites serve AVIF with a WebP or JPEG fallback.',
        },
      ],
      spoken: `"Images are usually the heaviest part of a page, so I optimize them first. I serve modern formats like AVIF or WebP through the picture element with a JPEG fallback, and I use srcset with sizes so phones download small files and desktops get larger ones. I compress to around 75 quality, always set width and height to avoid layout shift, lazy-load offscreen images, and give the hero image fetchpriority high. In Next.js, next/image does most of this; otherwise I use sharp at build time or an image CDN."`,
      mistakes: [
        'Using srcset with `w` descriptors but no `sizes` — the browser then assumes 100vw and often downloads a too-large file.',
        'Serving one huge image and scaling it down with CSS.',
        'Using animated GIFs for big animations instead of MP4/WebM video.',
        'Follow-up trap: "Is the alt attribute about performance?" No, it is accessibility and SEO — but always include it; empty `alt=""` for purely decorative images.',
      ],
      takeaway: 'Right format, right size per screen, compressed, with dimensions — and the hero image first.',
    },
    {
      id: 'cdn',
      title: 'CDN (Content Delivery Network)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'A network of servers around the world that cache your content close to users, cutting latency and load on your origin server.',
      what: `A **CDN** is a big network of servers (called **edge** servers or PoPs — points of presence) in many cities around the world.

When a user asks for a file, the nearest edge answers. If the edge has it in cache (a **cache hit**), it returns it right away. If not (a **cache miss**), it fetches it once from your **origin** server, stores it, and serves the next users from cache.

Examples: CloudFront (AWS), Cloud CDN (GCP), Cloudflare, Fastly, Akamai. Vercel and Netlify include one.

#### Deeper version
- **What to cache:** static assets (JS, CSS, images, fonts) for a long time. HTML and API responses can be cached too, but carefully and for short times.
- **Cache control:** the CDN follows \`Cache-Control\` headers (\`s-maxage\` is for shared caches like CDNs; \`max-age\` for browsers). Many CDNs also let you set rules in their console.
- **Cache key:** what makes two requests "the same" (URL, some headers, query string). Adding cookies or too many headers to the key kills the hit rate.
- **Invalidation:** purging files after a deploy is slow and sometimes costs money. Prefer **hashed file names** (\`app.3f9a2c.js\`) so new deploys use new URLs.
- **stale-while-revalidate:** serve a slightly old copy instantly while fetching a fresh one in the background.
- **Extra benefits:** TLS handled at the edge, HTTP/2 and HTTP/3, compression, DDoS protection, WAF rules, and **edge functions** (run code near the user, such as redirects, A/B tests, auth checks).
- **Never cache personalized responses publicly.** A page with one user's data cached at the CDN could be shown to another user. Use \`Cache-Control: private\` or \`no-store\` for them.`,
      why: `Physics: a request from Mumbai to a server in Virginia takes a long round trip, and pages need many round trips. A nearby edge cuts that to a few milliseconds, handles traffic spikes, and reduces load and bandwidth costs on your servers.`,
      analogy: `A CDN is like a chain of local convenience stores. Instead of everyone driving to the one central factory (origin), each neighborhood store keeps popular items on the shelf. If an item is not there, the store orders it once from the factory and then has it for the next customer.`,
      code: [
        {
          title: 'Cache headers from Express for a CDN',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

// Hashed assets (app.3f9a2c.js): cache for a year, never change
app.use('/assets', express.static('dist/assets', { immutable: true, maxAge: '1y' }));

// Public, non-personal API data: browser 60s, CDN 5 min, serve stale while refreshing
app.get('/api/products', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json(await getProducts());
});

// Personal data: never store in shared caches
app.get('/api/me', requireAuth, (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json(req.user);
});`,
        },
        {
          title: 'Check if the CDN served from cache',
          lang: 'bash',
          code: `# Header names differ by CDN: x-cache (CloudFront), cf-cache-status (Cloudflare), age
curl -sI https://cdn.example.com/assets/app.3f9a2c.js | grep -iE 'x-cache|cf-cache-status|age|cache-control'`,
        },
      ],
      output: `The first request for \`app.3f9a2c.js\` is a miss: the edge fetches it from Express and caches it. All later users near that edge get a hit, often in a few milliseconds; the \`curl\` output shows something like \`x-cache: Hit from cloudfront\` and an \`age\` header. Product data is cached at the edge for 5 minutes and in browsers for 1 minute, and for 10 more minutes the CDN may serve the old copy while it refreshes. \`/api/me\` is never cached by the CDN.`,
      questions: [
        {
          q: 'What is a CDN and why use it?',
          a: 'A distributed network of edge servers that cache content near users. It reduces latency, offloads the origin, absorbs traffic spikes and often adds TLS, compression and DDoS protection.',
        },
        {
          q: 'How do you handle cache invalidation on deploy?',
          a: 'Use content-hashed file names for assets so each deploy creates new URLs, and cache them forever. Keep HTML short-cached or revalidated so it points to the new files. Purge only when needed.',
        },
        {
          q: 'What is the difference between max-age and s-maxage?',
          a: '`max-age` applies to all caches including the browser; `s-maxage` overrides it for shared caches like CDNs and proxies.',
        },
        {
          q: 'Can you cache API responses at the CDN?',
          a: 'Yes, for public data that is the same for everyone, with short TTLs and stale-while-revalidate. Never cache user-specific responses in a shared cache.',
        },
      ],
      spoken: `"A CDN is a network of edge servers around the world that cache content close to users. On a cache hit the edge answers in milliseconds; on a miss it fetches from my origin once and caches it. I put all static assets behind a CDN with hashed file names and one-year immutable caching, so deploys never need purges. HTML and public API data get short TTLs with stale-while-revalidate, and anything personal is marked private or no-store. CDNs also give TLS at the edge, HTTP/3, compression and DDoS protection."`,
      mistakes: [
        'Caching personalized pages or API responses publicly, leaking one user\'s data to others.',
        'Using the same file name for changed assets and fighting stale caches with manual purges.',
        'Including cookies or every query parameter in the cache key, which destroys the hit rate.',
        'Follow-up trap: "Does a CDN help a fully dynamic API?" Still somewhat: TLS and connection setup happen near the user and routes to the origin are optimized, but the big win is for cacheable content.',
      ],
      takeaway: 'Put static assets on a CDN with hashed names and long caching; cache public data briefly; never cache personal data publicly.',
    },
    {
      id: 'http-caching',
      title: 'Browser and HTTP Caching (Cache-Control, ETag)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Cache-Control decides how long a response may be reused; ETag/Last-Modified let the browser revalidate cheaply with a 304.',
      what: `**HTTP caching** lets the browser (and CDNs) keep a copy of a response and reuse it, so the next visit is faster or needs no download at all.

Two ideas:
- **Freshness:** "this copy is good for N seconds". Set by \`Cache-Control: max-age=N\`. While fresh, the browser uses it **without asking the server**.
- **Revalidation:** when the copy is old (stale), the browser asks "has it changed?" using an **ETag** (a version fingerprint) or **Last-Modified** date. If not changed, the server replies **304 Not Modified** with no body — tiny and fast.

#### Deeper version
Main \`Cache-Control\` directives:
- \`max-age=31536000, immutable\` — fresh for a year and will never change. For **hashed** assets like \`app.3f9a2c.js\`.
- \`no-cache\` — you **may** store it, but must revalidate before every use. Good for HTML. (The name is confusing!)
- \`no-store\` — never store it anywhere. For sensitive data.
- \`private\` — only the browser may cache it, not CDNs. \`public\` — shared caches may store it.
- \`s-maxage\` — freshness for shared caches (CDNs).
- \`stale-while-revalidate=N\` — use the stale copy immediately and refresh in the background.

Request side: the browser sends \`If-None-Match: "etag"\` or \`If-Modified-Since\`; the server compares and returns 304 or 200.

The **standard strategy for SPAs**:
- \`index.html\`: \`no-cache\` (always check, so new deploys show up).
- Hashed JS/CSS/fonts/images: \`max-age=31536000, immutable\`.

Other browser caches: **memory cache** (current tab), **disk cache** (HTTP cache), **service worker cache** (Cache API, you control it in code, used by PWAs), and the **bfcache** (back/forward cache, keeps whole pages in memory for instant back navigation). Data caches like React Query or SWR are app-level, not HTTP caching.`,
      why: `The fastest request is the one never made. Good caching makes repeat visits nearly instant, cuts server load and bandwidth, and avoids users being stuck with old JavaScript after a deploy when it is done right.`,
      analogy: `Milk in your fridge. \`max-age\` is the expiry date: before it, you drink it without thinking. After it, you smell it (revalidate with the ETag) — if it is fine (304), keep using it; if not, buy fresh (200). \`no-store\` is "do not put this in the fridge at all".`,
      code: [
        {
          title: 'SPA caching strategy in Express',
          lang: 'javascript',
          code: `import express from 'express';
import path from 'node:path';
const app = express();

// Vite/webpack output: dist/assets/index-3f9a2c.js (hashed names)
app.use('/assets', express.static('dist/assets', {
  maxAge: '1y',
  immutable: true,          // Cache-Control: public, max-age=31536000, immutable
}));

// HTML must always be revalidated so users get the new asset links
app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.resolve('dist/index.html')); // Express adds ETag + Last-Modified
});`,
        },
        {
          title: 'Revalidation with ETag (manual example)',
          lang: 'javascript',
          code: `import crypto from 'node:crypto';

app.get('/api/settings', async (req, res) => {
  const settings = await getSettings();
  const body = JSON.stringify(settings);
  const etag = '"' + crypto.createHash('sha1').update(body).digest('hex') + '"';

  res.set({ ETag: etag, 'Cache-Control': 'private, no-cache' });
  if (req.get('if-none-match') === etag) return res.status(304).end(); // nothing changed
  res.type('json').send(body);
});`,
        },
      ],
      output: `First visit: the browser downloads \`index.html\` and the hashed JS/CSS. Second visit: the JS/CSS come straight from disk cache with no network request (DevTools shows "(disk cache)" or "(memory cache)"). \`index.html\` is revalidated: the browser sends \`If-None-Match\`, gets \`304\` if nothing changed. After a deploy, the HTML changes, the server sends a new 200, and it points to new hashed files, which are downloaded fresh.

For \`/api/settings\`, the second request sends the ETag; if settings did not change, the response is an empty \`304\`. (Express already generates weak ETags for many responses by default; this shows the idea by hand.)`,
      questions: [
        {
          q: 'What is the difference between no-cache and no-store?',
          a: '`no-cache` allows storing but requires revalidation with the server before each use. `no-store` forbids storing the response at all.',
        },
        {
          q: 'How do ETags work?',
          a: 'The server sends an ETag (a version identifier) with the response. Later the browser sends it back in `If-None-Match`. If it still matches, the server returns 304 Not Modified without a body.',
        },
        {
          q: 'How do you cache a React SPA correctly?',
          a: 'Hashed static assets get `max-age=31536000, immutable`. `index.html` gets `no-cache` so it is revalidated and always points to the latest hashed files.',
        },
        {
          q: 'What is stale-while-revalidate?',
          a: 'A directive that lets a cache serve an expired response immediately while it fetches a fresh copy in the background, for a limited extra time.',
        },
        {
          q: 'What is the bfcache?',
          a: 'The back/forward cache: the browser keeps a full snapshot of a page in memory so back and forward navigation is instant. Things like `unload` listeners can make a page ineligible.',
        },
      ],
      spoken: `"HTTP caching has two parts: freshness and revalidation. Cache-Control max-age says how long the browser may reuse a response without asking. When it is stale, the browser revalidates with ETag or Last-Modified and the server can answer 304 with no body. For SPAs my strategy is: hashed JS, CSS and images get a one-year immutable cache, and index.html gets no-cache so every deploy is picked up. Personal data uses private or no-store. I also remember no-cache doesn't mean don't cache — it means always revalidate."`,
      mistakes: [
        'Thinking `no-cache` means "do not cache". It means "cache, but revalidate every time".',
        'Long-caching `index.html`, so users keep loading old JS after a deploy.',
        'Long-caching files without content hashes in their names, so updates never reach users.',
        'Follow-up trap: "Why do I still see the old version after deploy even with hashes?" Usually the HTML (or a service worker) is cached. Check the HTML headers and the service worker update flow.',
      ],
      takeaway: 'Hashed assets: cache forever; HTML: always revalidate; private data: private or no-store.',
    },
    {
      id: 'script-loading',
      title: 'Render-Blocking Resources and async vs defer',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Normal scripts block HTML parsing. defer runs scripts in order after parsing; async runs them as soon as they arrive. Keep critical CSS small.',
      what: `By default, when the HTML parser meets \`<script src="app.js">\`, it **stops**, downloads the script, runs it, and only then continues. That delays the whole page.

Two attributes fix this:
- **\`defer\`** — download in parallel with parsing, run **after** the HTML is fully parsed, **in the order** they appear. Best for your app code.
- **\`async\`** — download in parallel, run **as soon as it arrives** (pausing the parser for a moment), in **any order**. Best for independent scripts like analytics.

\`<script type="module">\` is deferred by default.

#### Deeper version
- \`defer\` scripts run before the \`DOMContentLoaded\` event. \`async\` scripts may run before or after it.
- **CSS is render-blocking** by default: the page will not paint until stylesheets in the head are loaded. Keep them small; consider inlining **critical CSS** (styles for the first screen) and loading the rest later.
- A stylesheet with a \`media\` that does not match (\`media="print"\`) does not block rendering.
- A script also waits for CSS loaded before it, because it might read styles. So a slow stylesheet can delay scripts too.
- **Fonts:** use \`font-display: swap\` (or \`optional\`) so text shows right away with a fallback font instead of being invisible.
- **Third-party scripts** (chat widgets, tag managers, A/B testing) are a top cause of slow pages. Load them with \`async\`/\`defer\`, after interaction, or with a facade (a fake button that loads the real widget on click).
- \`DOMContentLoaded\` = HTML parsed and deferred scripts run. \`load\` = everything including images finished.`,
      why: `Render-blocking resources directly delay First Contentful Paint and LCP. Moving a single big script from blocking to \`defer\` can make the first paint appear much earlier. It is a very common interview question because it shows you understand how the parser works.`,
      analogy: `Reading a recipe book (HTML). A normal script is a note saying "stop reading, go to the shop, come back, then continue". \`defer\` is "send someone to the shop now, and use the items after you finish reading". \`async\` is "send someone to the shop; when they come back, pause reading briefly and use the item immediately".`,
      code: [
        {
          title: 'Choosing blocking, defer and async',
          lang: 'html',
          code: `<head>
  <!-- Critical CSS inline: first screen can paint without waiting -->
  <style>header{height:64px;background:#111;color:#fff}</style>

  <!-- Full stylesheet: still render-blocking, keep it small -->
  <link rel="stylesheet" href="/main.css" />

  <!-- App code: runs after parsing, in order -->
  <script src="/vendor.js" defer></script>
  <script src="/app.js" defer></script>

  <!-- Independent analytics: run whenever ready -->
  <script src="https://analytics.example.com/a.js" async></script>

  <!-- ES modules are deferred by default -->
  <script type="module" src="/main.js"></script>
</head>`,
        },
        {
          title: 'Fonts without invisible text',
          lang: 'css',
          code: `@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap; /* show fallback text now, swap to Inter when loaded */
}
body { font-family: 'Inter', system-ui, sans-serif; }`,
        },
        {
          title: 'Load a third-party widget only on interaction',
          lang: 'javascript',
          code: `const button = document.querySelector('#chat-button');
button.addEventListener('click', () => {
  const s = document.createElement('script');
  s.src = 'https://chat.example.com/widget.js'; // heavy script loads only when needed
  s.async = true;
  document.head.appendChild(s);
}, { once: true });`,
        },
      ],
      output: `The header paints quickly with inline critical CSS once \`main.css\` arrives. \`vendor.js\` and \`app.js\` download in parallel with parsing and run in order after the HTML is done, just before \`DOMContentLoaded\`. Analytics runs whenever it arrives and does not depend on the others. With \`font-display: swap\`, text is visible right away in the system font and switches to Inter later. The chat widget's JavaScript is not downloaded at all unless the user clicks the button.`,
      questions: [
        {
          q: 'What is the difference between async and defer?',
          a: 'Both download in parallel. `defer` runs after parsing, in document order. `async` runs as soon as downloaded, in any order, and can interrupt parsing. Use defer for app code, async for independent scripts.',
        },
        {
          q: 'What is a render-blocking resource?',
          a: 'A resource the browser must load before it can paint, mainly CSS in the head and synchronous scripts in the head.',
        },
        {
          q: 'DOMContentLoaded vs load?',
          a: '`DOMContentLoaded` fires when HTML is parsed and deferred scripts have run. `load` fires when all resources, including images and iframes, are loaded.',
        },
        {
          q: 'What is critical CSS?',
          a: 'The minimal CSS needed to render the first visible part of the page, inlined in the HTML so the first paint does not wait for the full stylesheet.',
        },
      ],
      spoken: `"A normal script tag blocks HTML parsing while it downloads and runs. With defer, the script downloads in parallel and runs after parsing, in order, so I use it for app code. With async, it runs as soon as it arrives, in any order, which is fine for independent things like analytics. Module scripts are deferred by default. CSS is render-blocking, so I keep it small and sometimes inline critical CSS. I use font-display swap for fonts and load heavy third-party widgets only on interaction."`,
      mistakes: [
        'Using `async` for scripts that depend on each other — they may run in the wrong order.',
        'Putting `defer` on inline scripts. It only works on scripts with a `src`.',
        'Ignoring third-party scripts; they often cost more than your own bundle.',
        'Follow-up trap: "Is putting scripts at the end of body the same as defer?" Similar effect on parsing, but with `defer` in the head the download starts earlier, so defer is usually better.',
      ],
      takeaway: 'defer your app scripts, async independent ones, keep CSS lean, and delay third parties.',
    },
    {
      id: 'code-splitting',
      title: 'Code Splitting (dynamic import, route-based splitting)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Break one big JavaScript bundle into smaller chunks loaded on demand, usually per route and for heavy features.',
      what: `By default a bundler (Vite, webpack) can put all your code into **one big file**. Every user downloads everything — even the admin pages they will never open.

**Code splitting** breaks the bundle into **chunks**. The browser loads only what the current page needs, and loads the rest later.

The tool is the **dynamic \`import()\`**: \`import('./Chart')\` returns a Promise. Bundlers see it and automatically create a separate chunk.

Common places to split:
- **Per route** (each page is a chunk) — the biggest, easiest win.
- **Heavy features** — charts, rich text editors, maps, PDF tools, date libraries.
- **Rarely used code** — modals, admin panels, settings.

#### Deeper version
- **Vendor chunks:** libraries change less often than your code. Splitting them into their own chunk(s) means a code change does not bust the cache for React itself. Vite/Rollup use \`build.rollupOptions.output.manualChunks\`; webpack uses \`optimization.splitChunks\`.
- **Too many tiny chunks** is also bad: more requests and waterfalls. Aim for meaningful chunks.
- **Waterfalls:** a lazy route that then lazily loads data that then lazily loads a component is slow. Preload the chunk and fetch data in parallel (router loaders help).
- **Prefetch likely next routes** on hover or when idle so navigation feels instant.
- **Tree shaking** (removing unused exports) works best with ES modules. Import only what you need (\`import debounce from 'lodash-es/debounce'\` instead of all of lodash).
- **Next.js** splits per route automatically; use \`next/dynamic\` for component-level splitting. In the App Router, Server Components send no component JS to the client, which reduces bundles further.`,
      why: `JavaScript is the most expensive resource byte-for-byte: it must be downloaded, parsed, compiled and executed on the main thread. Smaller initial bundles mean faster load, faster interactivity and better INP, especially on mid-range phones.`,
      analogy: `Moving into a new house: you do not bring every box on day one. You bring the kitchen and bedroom boxes first (the current route), and fetch the garage boxes (admin pages) only when you actually need the garage.`,
      code: [
        {
          title: 'Route-based splitting with React Router',
          lang: 'jsx',
          code: `import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // in the main bundle: first page users see

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="spinner" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}`,
        },
        {
          title: 'Load a heavy library only when used',
          lang: 'javascript',
          code: `// Exporting a PDF is rare: do not ship the library in the main bundle
async function exportPdf(data) {
  const { jsPDF } = await import('jspdf'); // separate chunk, loaded on first click
  const doc = new jsPDF();
  doc.text('Report: ' + data.title, 10, 10);
  doc.save('report.pdf');
}`,
        },
        {
          title: 'Vendor chunks in Vite',
          lang: 'javascript',
          code: `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'], // rarely changes -> long cache
          charts: ['recharts'],                               // only pages that import it load it
        },
      },
    },
  },
});`,
        },
      ],
      output: `After \`vite build\` you will see separate files like \`Dashboard-a1b2c3.js\`, \`Admin-d4e5f6.js\`, \`react-9f8e7d.js\` and \`charts-1a2b3c.js\`. Visiting \`/\` downloads only the main bundle and the React chunk. Navigating to \`/dashboard\` fetches the Dashboard chunk (shown in the Network tab) and briefly shows the spinner. \`jspdf\` is downloaded only when someone clicks export. After a code change in Settings, only that chunk's hash changes, so users keep the cached React chunk.`,
      questions: [
        {
          q: 'What is code splitting?',
          a: 'Splitting the JavaScript bundle into smaller chunks that load on demand, using dynamic `import()`, so users download only the code needed for what they are doing.',
        },
        {
          q: 'Where do you split first?',
          a: 'At routes, then heavy and rarely used features like charts, editors, maps and admin pages.',
        },
        {
          q: 'What is the difference between code splitting and tree shaking?',
          a: 'Tree shaking removes code that is never used. Code splitting keeps used code but loads it later, in separate chunks.',
        },
        {
          q: 'Can code splitting make things slower?',
          a: 'Yes, with too many tiny chunks or request waterfalls. Balance chunk size and preload chunks that are likely needed next.',
        },
      ],
      spoken: `"Code splitting means breaking one big JavaScript bundle into chunks that load on demand. The mechanism is dynamic import, which the bundler turns into a separate file. I split by route first using React.lazy and Suspense, then split heavy features like charts, editors or PDF export so they load only when used. I put stable vendor libraries in their own chunk for better caching. I watch out for too many tiny chunks and waterfalls, and I prefetch likely next routes. In Next.js, route splitting is automatic and I use next/dynamic for components."`,
      mistakes: [
        'Lazy-loading the first page the user sees, which adds a delay for no benefit.',
        'Importing a whole library (`import _ from \'lodash\'`) when you use one function.',
        'Creating dozens of tiny chunks that cause request waterfalls.',
        'Follow-up trap: "Why do users get a blank page after deploy when clicking a link?" Old HTML references chunks that the new deploy deleted. Keep old assets for a while or catch chunk load errors and reload.',
      ],
      takeaway: 'Ship only the code the current screen needs: split by route, then by heavy feature, with sensible chunk sizes.',
    },
    {
      id: 'bundle-analysis',
      title: 'Bundle Analysis (visualizer, webpack-bundle-analyzer, source-map-explorer)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Use a treemap tool to see what is inside your JavaScript bundle, find heavy or duplicate dependencies, and fix them.',
      what: `Before optimizing a bundle, you need to **see** what is in it. Bundle analyzers draw a **treemap**: each box is a module, and bigger boxes are bigger files.

Popular tools:
- **rollup-plugin-visualizer** — works with Vite and Rollup.
- **webpack-bundle-analyzer** — for webpack (and Next.js through \`@next/bundle-analyzer\`).
- **source-map-explorer** — works with any bundler that produces source maps.

Typical findings: a giant library used for one function, two versions of the same package, all of \`moment\` locales, a big icon pack, or server-only code that leaked into the client.

#### Deeper version
- Look at **three sizes**: **stat** (raw source), **parsed** (after minification — what the browser parses) and **gzip/brotli** (what travels over the network). Parse/execute cost depends on the parsed size; download time depends on the compressed size.
- **Common fixes:**
  - Replace heavy libraries: \`moment\` → \`date-fns\` or \`dayjs\`; full \`lodash\` → \`lodash-es\` per-function imports or native JS.
  - Import icons one by one instead of whole packs.
  - Dedupe versions (\`npm ls <pkg>\`, \`npm dedupe\`, or overrides).
  - Move rarely used code behind dynamic \`import()\`.
  - Check that libraries are ES modules and side-effect free so tree shaking works.
- **Performance budgets:** fail CI if the main bundle grows past a limit (tools like \`size-limit\` or bundler size warnings).
- Check a package's cost **before** installing it (sites like bundlephobia show approximate size).`,
      why: `Bundles grow quietly — one \`npm install\` can add hundreds of KB. Analyzers turn a vague "the app is slow" into a concrete list: "this chart library is 40% of our main bundle". It is the first step of any bundle-size work.`,
      analogy: `Packing for a flight and your bag is overweight. You empty it onto the bed to see what is heavy: three pairs of shoes (duplicate packages), a full encyclopedia when you needed one page (a whole library for one function). The analyzer is emptying the bag onto the bed.`,
      code: [
        {
          title: 'Vite + rollup-plugin-visualizer',
          lang: 'javascript',
          code: `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'stats.html', // open this file after building
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
});`,
        },
        {
          title: 'Other analyzers',
          lang: 'bash',
          code: `# Any bundler with source maps (enable build.sourcemap in Vite first)
npx source-map-explorer 'dist/assets/*.js'

# webpack: generate stats, then open the analyzer
npx webpack --profile --json > stats.json
npx webpack-bundle-analyzer stats.json

# Next.js: with @next/bundle-analyzer configured in next.config.js
ANALYZE=true npm run build`,
        },
        {
          title: 'A typical fix found by the analyzer',
          lang: 'javascript',
          code: `// Before: pulls the whole library (~70 KB min+gzip for lodash)
// import _ from 'lodash';
// const run = _.debounce(save, 300);

// After: only the function you use (tree-shakable ES module build)
import debounce from 'lodash-es/debounce';
const run = debounce(save, 300);`,
        },
      ],
      output: `After \`vite build\`, \`stats.html\` opens a treemap. You might see \`node_modules/moment\` taking a huge block with all its locales, or \`lodash\` imported whole. Hovering a box shows its stat, parsed, gzip and brotli sizes. After switching to \`lodash-es/debounce\`, rebuilding shows that box shrink to a few KB. \`source-map-explorer\` gives a similar view per output file using the source maps.`,
      questions: [
        {
          q: 'How do you find out why your bundle is large?',
          a: 'Run a bundle analyzer (rollup-plugin-visualizer, webpack-bundle-analyzer or source-map-explorer), look at the treemap for the biggest modules and duplicates, then replace, split or remove them.',
        },
        {
          q: 'What is the difference between parsed and gzip size?',
          a: 'Parsed is the minified size the browser must parse and execute. Gzip/brotli is the compressed size sent over the network. Both matter: one for download time, one for CPU time.',
        },
        {
          q: 'What is a performance budget?',
          a: 'A limit, like "main JS under 200 KB gzipped", checked automatically in CI so regressions are caught before release.',
        },
        {
          q: 'Why might tree shaking not remove unused code?',
          a: 'The library uses CommonJS instead of ES modules, it has side effects, or you import the whole default export instead of named pieces.',
        },
      ],
      spoken: `"When a bundle is too big, I first measure what is in it. With Vite I use rollup-plugin-visualizer, with webpack or Next.js the bundle analyzer, and source-map-explorer works with anything that has source maps. The treemap shows the heaviest modules — often a date library with all locales, a whole lodash import, icon packs, or duplicate versions. Then I replace or split them, check tree shaking works, and add a size budget in CI so the bundle doesn't quietly grow again. I look at both parsed size and gzip size."`,
      mistakes: [
        'Optimizing by guessing instead of measuring with an analyzer.',
        'Looking only at gzip size and ignoring parse and execute cost of the minified code.',
        'Shipping source maps publicly without thinking — fine for many apps, but they expose your source; upload them privately to error tools if needed.',
        'Follow-up trap: "The analyzer shows React twice — why?" Two versions in the dependency tree (a library pins a different version). Check with `npm ls react` and dedupe or align versions.',
      ],
      takeaway: 'Measure the bundle with a treemap, fix the biggest boxes first, and guard the result with a size budget.',
    },
    {
      id: 'resource-hints',
      title: 'Resource Hints: preload, prefetch, preconnect, dns-prefetch',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'preload = needed now, fetch early; prefetch = maybe needed next, fetch when idle; preconnect = open the connection to an origin early.',
      what: `**Resource hints** are \`<link>\` tags that tell the browser about work it can start early.

- **\`preload\`** — "this page **definitely** needs this file soon, fetch it now with high priority". For resources the browser discovers late: fonts referenced in CSS, the hero image set as a CSS background, a key script.
- **\`prefetch\`** — "the **next** page will probably need this, fetch it at low priority when idle". For the next route's chunk.
- **\`preconnect\`** — "we will talk to this other origin soon; do DNS + TCP + TLS now". For your API, CDN, or font host.
- **\`dns-prefetch\`** — only the DNS lookup. Cheaper, used as a fallback or for many origins.
- **\`modulepreload\`** — like preload, for ES modules (also parses them).

#### Deeper version
- \`preload\` needs \`as\` (\`as="font"\`, \`as="image"\`, \`as="style"\`, \`as="script"\`). Fonts need \`crossorigin\` even on the same origin, or the font is downloaded twice.
- Unused preloads waste bandwidth, and Chrome warns in the console if a preloaded file is not used within a few seconds. **Preload only a few critical things.**
- **Preconnect** only to 2-4 important origins. Each open connection costs CPU and is closed if unused for a while.
- **\`fetchpriority\`** (\`high\`/\`low\`/\`auto\`) on \`img\`, \`link\` and \`script\` adjusts priority without changing discovery. Great for the LCP image.
- **Speculation Rules API** (Chromium) can prefetch or even prerender whole next pages; support and syntax are still evolving, so check current docs.
- Hints can also be sent as an HTTP \`Link\` header. **103 Early Hints** lets the server send them before the final response is ready (support depends on your CDN/server).
- Frameworks do much of this: Vite adds \`modulepreload\` for chunks, Next.js prefetches links in the viewport.`,
      why: `The browser can only fetch what it knows about. Many critical files are found late (a font inside a CSS file inside the HTML), and each new origin needs its own handshakes. Hints remove these waits, often saving hundreds of milliseconds on LCP.`,
      analogy: `Planning a dinner party. \`preload\` is buying the main ingredients this morning because you will definitely cook them. \`prefetch\` is picking up dessert for tomorrow if you have spare time. \`preconnect\` is calling the caterer early so the line is open when you need to place the order.`,
      code: [
        {
          title: 'Hints in the document head',
          lang: 'html',
          code: `<head>
  <!-- Open connections early to origins we will use right away -->
  <link rel="preconnect" href="https://api.example.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="dns-prefetch" href="https://analytics.example.com" />

  <!-- Critical font used above the fold (crossorigin is required for fonts) -->
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />

  <!-- Hero image that is a CSS background (found late otherwise) -->
  <link rel="preload" href="/img/hero.webp" as="image" fetchpriority="high" />

  <!-- Next page's chunk: low priority, when idle -->
  <link rel="prefetch" href="/assets/Checkout-3f9a2c.js" />
</head>`,
        },
        {
          title: 'Prefetch a route chunk on hover (React)',
          lang: 'jsx',
          code: `import { lazy } from 'react';
import { Link } from 'react-router-dom';

const loadCheckout = () => import('./pages/Checkout');
export const Checkout = lazy(loadCheckout);

export function CartButton() {
  // Start downloading the chunk when the user shows intent
  return <Link to="/checkout" onMouseEnter={loadCheckout} onFocus={loadCheckout}>Checkout</Link>;
}`,
        },
      ],
      output: `In the Network panel, the font and hero image start downloading right at the beginning instead of after the CSS is parsed, so text and the LCP image show sooner. Connections to the API and font origins are already open, so the first API call skips DNS, TCP and TLS time. The checkout chunk downloads at "Lowest" priority after the important work. Hovering the Checkout link fetches its chunk, so clicking feels instant.`,
      questions: [
        {
          q: 'Preload vs prefetch?',
          a: 'Preload is for resources the current page needs soon (high priority). Prefetch is for resources a future navigation may need (low priority, when idle).',
        },
        {
          q: 'When would you use preconnect?',
          a: 'For a few third-party or API origins you will definitely request early, so DNS, TCP and TLS are done before the first request.',
        },
        {
          q: 'Why do font preloads need crossorigin?',
          a: 'Fonts are always fetched in CORS mode. Without `crossorigin` the preload does not match the real request, and the font is downloaded twice.',
        },
        {
          q: 'Can preload hurt performance?',
          a: 'Yes. Preloading too many or unused files competes with truly critical resources and wastes bandwidth.',
        },
      ],
      spoken: `"Resource hints tell the browser about work it can do early. Preload is for things the current page definitely needs but discovers late, like a font inside CSS or a hero background image — fonts need the crossorigin attribute. Prefetch fetches things the next page will probably need, at low priority. Preconnect does DNS, TCP and TLS early for important origins like my API or CDN, and dns-prefetch does just the lookup. I use them sparingly, a few critical items only, and I use fetchpriority high on the LCP image."`,
      mistakes: [
        'Preloading many files "just in case", which delays the really critical ones.',
        'Forgetting `as` or `crossorigin` on preloads, causing double downloads.',
        'Preconnecting to ten origins; each connection costs CPU and is dropped if unused.',
        'Follow-up trap: "Does prefetch slow down the current page?" It should not much — it is low priority and runs when idle — but on slow mobile data it still uses bandwidth, so prefetch only likely next steps.',
      ],
      takeaway: 'preload = now and critical, prefetch = next and likely, preconnect = warm up the connection — use each sparingly.',
    },
    {
      id: 'compression-http2',
      title: 'Compression (gzip, Brotli) and HTTP/2, HTTP/3',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Compress text responses with Brotli or gzip, and serve over HTTP/2 or HTTP/3 so many files share one fast connection.',
      what: `Two cheap, big wins at the network level:

**Compression.** Text files (HTML, CSS, JS, JSON, SVG) shrink a lot when compressed — often 70-80% smaller.
- **gzip** — old, supported everywhere.
- **Brotli (br)** — usually smaller than gzip for the same content. Supported by all modern browsers over HTTPS.
- The browser says what it supports with \`Accept-Encoding: gzip, deflate, br\`; the server answers with \`Content-Encoding: br\`.
- Do **not** compress images like JPEG/PNG/WebP or videos — they are already compressed.

**HTTP/2 and HTTP/3.**
- **HTTP/1.1** handles one request at a time per connection, so browsers open ~6 connections per origin and files queue up.
- **HTTP/2** sends many requests at once over **one** connection (**multiplexing**) and compresses headers.
- **HTTP/3** runs on **QUIC** over UDP. Faster setup and a lost packet does not block all the other streams.

#### Deeper version
- **Static vs dynamic compression:** pre-compress build files at the highest level once (\`.br\`, \`.gz\` files) and serve them; for dynamic API responses, use a moderate level so CPU cost stays low.
- Usually the **CDN or reverse proxy** (Nginx, CloudFront, Cloudflare) compresses, not Node. If you compress in Node, use the \`compression\` middleware.
- **HTTP/2 changes old tricks:** domain sharding and huge concatenated bundles were HTTP/1.1 hacks. With HTTP/2, a few medium-sized chunks work well. (Very many tiny files still have overhead.)
- **HTTP/2 Server Push** is deprecated and removed from major browsers; use **preload** and **103 Early Hints** instead.
- TCP **head-of-line blocking:** in HTTP/2 one lost TCP packet stalls all streams on that connection. QUIC in HTTP/3 fixes this per stream — this matters on mobile networks with packet loss.
- Browsers only use HTTP/2 and HTTP/3 over HTTPS.
- Security note: compressing responses that mix secrets with attacker-controlled input can leak data (BREACH attack); this is rare in practice but worth knowing.`,
      why: `A 600 KB JavaScript file might travel as about 150 KB with Brotli — a huge difference on mobile. HTTP/2 or 3 removes request queuing, which matters for apps loading dozens of files. Both are often just configuration.`,
      analogy: `Compression is vacuum-packing clothes before shipping — same clothes, much smaller box. HTTP/1.1 is a single-lane road where cars wait in line; HTTP/2 is a multi-lane highway on one road; HTTP/3 is a highway where one broken-down car does not block every lane.`,
      code: [
        {
          title: 'Compression in Express (when no proxy does it)',
          lang: 'javascript',
          code: `import express from 'express';
import compression from 'compression';

const app = express();
app.use(compression({ threshold: 1024 })); // skip tiny responses (< 1 KB)

app.get('/api/report', async (req, res) => {
  res.json(await buildLargeReport()); // JSON is compressed automatically
});`,
        },
        {
          title: 'Nginx: HTTP/2, gzip and pre-compressed files',
          lang: 'nginx',
          code: `server {
  listen 443 ssl;
  http2 on;                      # older Nginx versions use: listen 443 ssl http2;
  server_name app.example.com;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;
  gzip_static on;                # serve app.js.gz if it exists next to app.js

  # brotli needs the ngx_brotli module:
  # brotli on; brotli_static on;

  location /assets/ {
    root /var/www/app;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}`,
        },
        {
          title: 'Check what the server sends',
          lang: 'bash',
          code: `curl -sI -H 'Accept-Encoding: br, gzip' https://app.example.com/assets/app.js | grep -i content-encoding
curl -sI --http2 https://app.example.com | head -1   # e.g. "HTTP/2 200"`,
        },
      ],
      output: `With compression on, a 500 KB JSON report goes over the wire at maybe 60-100 KB (exact numbers depend on the data); the browser decompresses it automatically. The first \`curl\` shows \`content-encoding: br\` or \`gzip\`. The second shows \`HTTP/2 200\` when HTTP/2 is enabled. In Chrome DevTools, the Network panel "Protocol" column (right-click headers to enable it) shows \`h2\` or \`h3\`.`,
      questions: [
        {
          q: 'gzip vs Brotli?',
          a: 'Both compress text. Brotli usually gives smaller files, especially at high levels for static assets, and is supported by all modern browsers over HTTPS. gzip is the universal fallback.',
        },
        {
          q: 'What does HTTP/2 improve over HTTP/1.1?',
          a: 'Multiplexing many requests on one connection, header compression, and stream prioritization, so there is no need for many parallel connections or domain sharding.',
        },
        {
          q: 'What is HTTP/3?',
          a: 'HTTP over QUIC, which runs on UDP. It has faster connection setup with built-in TLS 1.3 and avoids TCP head-of-line blocking, which helps on lossy mobile networks.',
        },
        {
          q: 'Should you compress images with gzip?',
          a: 'No. JPEG, PNG, WebP, AVIF and video are already compressed. Gzipping them wastes CPU for almost no gain.',
        },
      ],
      spoken: `"At the network level I make sure text responses — HTML, CSS, JS, JSON, SVG — are compressed with Brotli or gzip, ideally pre-compressed at build time and served by the CDN or Nginx, so Node does not burn CPU. That often cuts JavaScript size by about 70 percent. I also serve over HTTP/2 or HTTP/3. HTTP/2 multiplexes many requests on one connection, so old tricks like domain sharding aren't needed. HTTP/3 runs on QUIC over UDP, connects faster and avoids head-of-line blocking. Server push is deprecated, so I use preload or Early Hints instead."`,
      mistakes: [
        'Compressing already-compressed formats like images and videos.',
        'Using maximum Brotli level on dynamic responses, which costs a lot of CPU per request.',
        'Recommending HTTP/2 Server Push — it has been removed from major browsers.',
        'Follow-up trap: "With HTTP/2, should we stop bundling completely?" No. Thousands of tiny modules still have overhead; use a moderate number of well-sized chunks.',
      ],
      takeaway: 'Compress text with Brotli/gzip at the edge and serve over HTTP/2 or 3 — cheap configuration, big savings.',
    },
    {
      id: 'core-web-vitals',
      title: 'Core Web Vitals (LCP, INP, CLS)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Google\'s three user-centered metrics: LCP (loading), INP (responsiveness) and CLS (visual stability), judged at the 75th percentile of real users.',
      what: `**Core Web Vitals** are three metrics from Google that measure how a page **feels** to real users:

- **LCP — Largest Contentful Paint** (loading). When the biggest image or text block in the viewport appears. **Good: 2.5 s or less.**
- **INP — Interaction to Next Paint** (responsiveness). How long the page takes to visually respond after a click, tap or key press, looking at the slowest interactions. **Good: 200 ms or less.** INP replaced **FID** (First Input Delay) as a Core Web Vital in March 2024.
- **CLS — Cumulative Layout Shift** (visual stability). How much content jumps around unexpectedly. **Good: 0.1 or less.** (It is a score, not seconds.)

Google looks at the **75th percentile** of real visits: at least 75% of page loads should be "good". They are also a (small) search ranking signal.

#### Deeper version
**Improve LCP** — break it into parts: TTFB → resource load delay → resource load time → render delay.
- Fast server/TTFB (CDN, caching, SSR/SSG).
- Make the LCP image discoverable early: a real \`<img>\` in the HTML (not set by JS later), \`fetchpriority="high"\`, never \`loading="lazy"\`, preload if it is a CSS background.
- Smaller images (AVIF/WebP, srcset), less render-blocking CSS/JS, fast fonts.

**Improve INP** — an interaction has input delay + processing time + presentation delay.
- Break up **long tasks** (over 50 ms) on the main thread; yield to the browser.
- Ship less JavaScript; reduce hydration cost; avoid heavy work in event handlers.
- In React: \`useTransition\` / \`useDeferredValue\` for non-urgent updates, memoization, list virtualization.
- Show instant feedback (spinner, pressed state) before slow work.

**Improve CLS**
- Always set \`width\`/\`height\` or \`aspect-ratio\` on images, videos, iframes and ad slots.
- Reserve space for content injected later (banners, cookie bars, embeds).
- Use \`font-display\` plus matching fallback font metrics to reduce font-swap shifts.
- Animate with \`transform\`, not \`top\`/\`height\`.
- Shifts within 500 ms after a user input do not count.

**Lab vs field:** Lighthouse gives **lab** numbers (one simulated run). **Field** data (CrUX, the web-vitals library, RUM tools) shows what real users experience — and that is what Google uses.`,
      why: `They turn "the site feels slow" into three numbers that match real user pain: waiting for content, laggy clicks and jumping layouts. They affect SEO, conversions and are a standard way teams set performance goals — so interviewers love them.`,
      analogy: `Visiting a restaurant. LCP: how long until your main dish arrives. INP: how quickly the waiter reacts when you raise your hand. CLS: whether someone keeps moving your plate while you are trying to eat.`,
      code: [
        {
          title: 'Fixes for each metric in markup',
          lang: 'html',
          code: `<!-- LCP: hero image in the HTML, high priority, not lazy -->
<img src="/img/hero-960.avif" srcset="/img/hero-480.avif 480w, /img/hero-960.avif 960w"
     sizes="100vw" width="960" height="540" alt="Hero" fetchpriority="high" />

<!-- CLS: reserve space for things that load later -->
<div class="ad-slot" style="min-height: 250px"></div>
<iframe src="https://www.youtube.com/embed/VIDEO_ID" style="aspect-ratio: 16 / 9; width: 100%"
        loading="lazy" title="Video"></iframe>`,
        },
        {
          title: 'INP: keep the interaction responsive (React)',
          lang: 'jsx',
          code: `import { useState, useTransition } from 'react';

export function ProductSearch({ products }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(products);
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    const value = e.target.value;
    setQuery(value);                 // urgent: the input updates immediately
    startTransition(() => {          // non-urgent: React can interrupt this work
      setResults(products.filter((p) => p.name.toLowerCase().includes(value.toLowerCase())));
    });
  }

  return (
    <>
      <input value={query} onChange={onChange} placeholder="Search" />
      {isPending && <small>Updating...</small>}
      <ul>{results.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
    </>
  );
}`,
        },
      ],
      output: `The hero image starts loading as soon as the HTML arrives, with high priority, so LCP happens earlier. The ad slot and video keep their space before content loads, so nothing below them jumps (CLS stays near 0).

In the search box, typing updates the input instantly because \`setQuery\` is urgent. The expensive filtering of a big list happens inside a transition, which React can pause if the user keeps typing, so the next paint after each key press is quick and INP stays low.`,
      questions: [
        {
          q: 'What are the Core Web Vitals?',
          a: 'LCP (loading, good at 2.5 s or less), INP (responsiveness, good at 200 ms or less) and CLS (visual stability, good at 0.1 or less), measured at the 75th percentile of real users.',
        },
        {
          q: 'What replaced FID and why?',
          a: 'INP replaced FID in March 2024. FID only measured the input delay of the first interaction; INP measures the full time to the next paint across interactions, so it reflects real responsiveness better.',
        },
        {
          q: 'How do you improve LCP?',
          a: 'Reduce TTFB (CDN, caching), make the LCP resource discoverable and high priority (no lazy loading, fetchpriority high, preload), optimize its size, and remove render-blocking CSS/JS.',
        },
        {
          q: 'What causes CLS and how do you fix it?',
          a: 'Images and embeds without dimensions, injected banners and ads, and font swaps. Fix with width/height or aspect-ratio, reserved space, and careful font loading.',
        },
        {
          q: 'Lab data vs field data?',
          a: 'Lab data (Lighthouse) is one controlled, simulated run — good for debugging. Field data (CrUX, web-vitals RUM) comes from real users on real devices — that is what counts for Core Web Vitals.',
        },
      ],
      spoken: `"Core Web Vitals are three user-centered metrics. LCP measures loading — when the largest content element appears — and should be under 2.5 seconds. INP measures responsiveness — the delay from an interaction to the next paint — good is under 200 milliseconds; it replaced FID in 2024. CLS measures unexpected layout shifts and should be under 0.1. They are judged at the 75th percentile of real users. For LCP I fix TTFB and prioritize the hero image; for INP I break up long tasks and ship less JavaScript; for CLS I reserve space with dimensions."`,
      mistakes: [
        'Still calling FID a Core Web Vital. INP replaced it in March 2024.',
        'Optimizing only the Lighthouse score. Real-user field data can be very different, especially on slow phones.',
        'Lazy-loading or JS-injecting the LCP image.',
        'Follow-up trap: "Lighthouse does not show INP — why?" INP needs real interactions. Lighthouse navigation mode reports Total Blocking Time (TBT) as a lab proxy; measure INP in the field or with DevTools while interacting.',
      ],
      takeaway: 'LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile — and measure them on real users.',
    },
    {
      id: 'measuring-performance',
      title: 'Measuring Performance (Lighthouse, Performance panel, web-vitals)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Use Lighthouse for quick lab audits, the DevTools Performance panel to find the exact slow code, and the web-vitals library to collect real-user data.',
      what: `Rule number one: **measure first, then optimize.**

Three main tools:
- **Lighthouse** (in Chrome DevTools, PageSpeed Insights, or CLI). Loads the page in a simulated slow phone and gives scores and a list of fixes. Quick and repeatable. This is **lab data**.
- **Chrome DevTools Performance panel.** Record a page load or an interaction and see a timeline: network requests, main-thread tasks, long tasks (red corners), layout and paint, and the exact functions that were slow. This is how you find **the cause**.
- **web-vitals library.** A small script that measures LCP, INP and CLS (plus FCP and TTFB) for **real users** and sends them to your analytics. This is **field data** (also called RUM — Real User Monitoring).

#### Deeper version
- **PageSpeed Insights** shows both lab (Lighthouse) and field data from **CrUX** (Chrome User Experience Report) for popular URLs.
- **Throttle** CPU (4x-6x slowdown) and network in DevTools to see what mid-range phones experience. Your laptop lies.
- **Network panel:** waterfall, sizes, cache status, priorities, blocking requests. **Coverage panel:** how much JS/CSS is unused.
- **React DevTools Profiler:** which components rendered, why, and how long.
- **User Timing API:** \`performance.mark()\` and \`performance.measure()\` to time your own code; marks appear in the Performance panel.
- **PerformanceObserver** can watch entries like \`longtask\`, \`largest-contentful-paint\`, \`layout-shift\`, \`resource\`.
- **Lighthouse CI** runs audits on every PR to catch regressions. Combine with bundle size budgets.
- RUM tools: Vercel Speed Insights, Datadog RUM, Sentry, New Relic — or your own endpoint with the web-vitals library.
- Lighthouse scores vary run to run; compare medians of several runs.`,
      why: `Without numbers you optimize the wrong thing. Lab tools help you debug and prevent regressions; field data tells you what real users on real devices actually feel. Interviewers want to hear that you measure before and after a change.`,
      analogy: `A car check-up. Lighthouse is the quick test drive at the garage on a standard track. The Performance panel is putting the engine on a diagnostic machine to find the exact faulty part. web-vitals is a tracker in every customer's car telling you how it drives on real roads.`,
      code: [
        {
          title: 'Collect real-user Core Web Vitals with web-vitals',
          lang: 'javascript',
          code: `import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,       // 'LCP', 'INP', 'CLS', ...
    value: metric.value,     // ms for LCP/INP/FCP/TTFB, unitless score for CLS
    rating: metric.rating,   // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,           // unique per page load
    page: location.pathname,
  });
  // sendBeacon survives the page being closed; fall back to fetch keepalive
  if (!navigator.sendBeacon('/api/vitals', body)) {
    fetch('/api/vitals', { method: 'POST', body, keepalive: true });
  }
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);`,
        },
        {
          title: 'Time your own code with the User Timing API',
          lang: 'javascript',
          code: `performance.mark('filter-start');
const visible = bigList.filter((item) => item.active && item.score > 50);
performance.mark('filter-end');

const m = performance.measure('filter products', 'filter-start', 'filter-end');
console.log(m.name, Math.round(m.duration) + 'ms'); // also shows in the Performance panel

// Watch for long tasks (> 50 ms) on the main thread
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) console.warn('Long task:', Math.round(entry.duration) + 'ms');
}).observe({ type: 'longtask', buffered: true });`,
        },
        {
          title: 'Lighthouse from the command line',
          lang: 'bash',
          code: `npx lighthouse https://app.example.com --only-categories=performance --view
# CI: run on every PR and fail if scores or budgets regress
npx @lhci/cli autorun`,
        },
      ],
      output: `For each real visit, your \`/api/vitals\` endpoint receives records like \`{"name":"LCP","value":2140,"rating":"good","page":"/products"}\`. CLS and INP are reported when the page is hidden or unloaded, which is why \`sendBeacon\` is used. Aggregating the 75th percentile per page shows which pages need work.

The User Timing example logs something like \`filter products 37ms\` and shows a labeled bar in the Performance panel. The long-task observer warns whenever the main thread is blocked for more than 50 ms (supported in Chromium browsers). Lighthouse opens an HTML report with scores and opportunities.`,
      questions: [
        {
          q: 'How do you measure the performance of a web app?',
          a: 'Lab: Lighthouse and the DevTools Performance panel with CPU and network throttling. Field: real-user monitoring with the web-vitals library or a RUM tool, plus CrUX data. Then compare before and after each change.',
        },
        {
          q: 'How do you find what makes an interaction slow?',
          a: 'Record it in the Performance panel, look for long tasks on the main thread, expand the flame chart to find the heavy functions, and use React Profiler to see unnecessary re-renders.',
        },
        {
          q: 'Why might Lighthouse say 95 but users complain?',
          a: 'Lighthouse is one simulated load of one page. Real users have slower devices and networks, logged-in states, and interactions after load. Field data shows that reality.',
        },
        {
          q: 'What is a long task?',
          a: 'Any main-thread task over 50 ms. During it the browser cannot respond to input or render, which hurts INP.',
        },
      ],
      spoken: `"I always measure before optimizing. For a quick lab check I run Lighthouse, ideally a few times, and for the real cause I record in the DevTools Performance panel with CPU throttling, looking for long tasks and expensive layout. For React I add the Profiler. Lab data is not enough, so I collect field data with the web-vitals library — LCP, INP and CLS — send it with sendBeacon, and look at the 75th percentile per page. I also add Lighthouse CI and bundle budgets so regressions are caught in pull requests."`,
      mistakes: [
        'Testing only on a fast laptop with no CPU or network throttling.',
        'Treating one Lighthouse run as the truth — scores vary; use medians and field data.',
        'Sending vitals with a normal `fetch` on page hide, which may be cancelled; use `sendBeacon` or `keepalive`.',
        'Follow-up trap: "Lighthouse shows great LCP but field LCP is poor — why?" Real users may have slow devices, far locations, cold caches, or see different content (logged-in pages, personalized heroes). Check field data per page and device type.',
      ],
      takeaway: 'Lighthouse to spot, Performance panel to diagnose, web-vitals to see what real users feel.',
    },
    {
      id: 'reflow-layout-thrashing',
      title: 'Reflow, Repaint and Layout Thrashing',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Changing geometry forces layout (reflow); reading layout right after writing forces it synchronously. Batch reads, then writes, and animate with transform.',
      what: `- **Reflow (layout):** the browser recalculates the size and position of elements. Triggered by changes to geometry: \`width\`, \`height\`, \`margin\`, font size, adding/removing elements, window resize.
- **Repaint:** the browser redraws pixels without changing layout: \`color\`, \`background\`, \`visibility\`.
- **Composite only:** \`transform\` and \`opacity\` on a layer — the cheapest.

Normally the browser is lazy and smart: it **batches** your style changes and does layout once, right before the next frame.

**Layout thrashing** breaks this. If you **write** a style and then **read** a layout value (\`offsetHeight\`, \`getBoundingClientRect()\`, \`scrollTop\`), the browser must do layout **right now** to give you a correct answer. Doing this in a loop — write, read, write, read — forces many layouts in one frame.

#### Deeper version
- Properties that force synchronous layout when read after a change include \`offsetWidth/Height/Top/Left\`, \`clientWidth/Height\`, \`scrollWidth/Height/Top\`, \`getBoundingClientRect()\`, \`getComputedStyle()\` (for layout-dependent values), and \`innerText\`.
- **Fix pattern:** read everything first, then write everything. Or schedule writes inside \`requestAnimationFrame\`. Libraries like fastdom formalize this.
- **requestAnimationFrame** runs your callback just before the next paint — the right place for visual updates.
- **CSS containment** (\`contain: layout paint\`) and \`content-visibility: auto\` limit how much of the page needs layout or rendering (\`content-visibility\` skips rendering offscreen sections).
- \`will-change: transform\` hints the browser to promote an element to its own layer; use it sparingly — each layer uses memory.
- Large DOMs (thousands of nodes) make every layout slower — **virtualize** long lists (react-window, TanStack Virtual).
- In React, reading layout belongs in \`useLayoutEffect\` (runs before paint), and you should avoid reading layout on every render.`,
      why: `Layout thrashing is a classic cause of janky scrolling, slow animations and poor INP. A loop that forces 500 layouts in one frame can freeze the page for hundreds of milliseconds. The fix is usually small once you understand it.`,
      analogy: `A tailor taking measurements. Normally you list all the changes (shorten sleeves, take in waist) and the tailor re-measures once. Layout thrashing is asking "how long is the sleeve now?" after every single stitch — the tailor must stop and measure the whole suit again each time.`,
      code: [
        {
          title: 'Thrashing vs batched reads and writes',
          lang: 'javascript',
          code: `const cards = [...document.querySelectorAll('.card')];

// BAD: write then read inside the loop -> forced layout every iteration
for (const card of cards) {
  card.style.height = 'auto';                      // write
  const h = card.offsetHeight;                     // read -> forces layout NOW
  card.style.height = h + 20 + 'px';               // write
}

// GOOD: all reads first, then all writes -> one layout
for (const card of cards) card.style.height = 'auto';      // writes
const heights = cards.map((card) => card.offsetHeight);    // one forced layout, then cached
cards.forEach((card, i) => { card.style.height = heights[i] + 20 + 'px'; }); // writes`,
        },
        {
          title: 'Smooth visual updates with requestAnimationFrame',
          lang: 'javascript',
          code: `const bar = document.querySelector('.progress');
let ticking = false;

window.addEventListener('scroll', () => {
  if (ticking) return;                 // at most one update per frame
  ticking = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? scrollY / max : 0;
    bar.style.transform = 'scaleX(' + pct + ')'; // composite-only, no layout
    ticking = false;
  });
}, { passive: true });                 // passive: we never call preventDefault`,
        },
        {
          title: 'Skip rendering offscreen sections',
          lang: 'css',
          code: `.long-section {
  content-visibility: auto;          /* skip layout/paint while offscreen */
  contain-intrinsic-size: auto 800px; /* estimated height so the scrollbar stays stable */
}`,
        },
      ],
      output: `With 200 cards, the bad loop forces up to 200 layouts in one frame; the Performance panel shows purple "Layout" blocks with a warning "Forced reflow". The good version does one layout for the reads and one for the final writes — often many times faster.

The scroll handler updates the progress bar at most once per frame, inside \`requestAnimationFrame\`, and uses \`transform\`, so scrolling stays smooth. \`content-visibility: auto\` lets the browser skip work for long offscreen sections, making the first render faster.`,
      questions: [
        {
          q: 'What is the difference between reflow and repaint?',
          a: 'Reflow recalculates layout (sizes and positions) and is expensive; it is followed by a repaint. Repaint only redraws pixels, for changes like color that do not affect layout.',
        },
        {
          q: 'What is layout thrashing?',
          a: 'Repeatedly writing styles and then reading layout properties, forcing the browser to do synchronous layout many times in one frame.',
        },
        {
          q: 'How do you avoid it?',
          a: 'Batch all DOM reads before writes, schedule visual writes in `requestAnimationFrame`, cache measured values, and use transform/opacity for animations.',
        },
        {
          q: 'What does requestAnimationFrame do?',
          a: 'It runs a callback right before the browser\'s next repaint, usually about 60 times per second, which is the ideal time for visual updates. It pauses in background tabs.',
        },
      ],
      spoken: `"Reflow is when the browser recalculates layout — sizes and positions — and it is expensive. Repaint just redraws pixels, and transform and opacity can often skip both and only composite. The browser normally batches changes, but if I write a style and then read something like offsetHeight, it has to do layout immediately. Doing that in a loop is layout thrashing. I fix it by batching reads before writes, doing visual updates in requestAnimationFrame, animating with transform, and for long pages using virtualization or content-visibility."`,
      mistakes: [
        'Reading `offsetHeight` or `getBoundingClientRect()` inside a loop that also changes styles.',
        'Doing heavy work directly in scroll or resize handlers instead of throttling to one update per frame.',
        'Adding `will-change` to many elements, which wastes memory and can slow things down.',
        'Follow-up trap: "Does changing `visibility: hidden` cause reflow?" Usually only repaint, because the element still takes space. `display: none` removes it from layout, so it causes reflow.',
      ],
      takeaway: 'Read, then write; update visuals in requestAnimationFrame; animate with transform — and the browser stays at 60 fps.',
    },
    {
      id: 'main-thread-long-tasks',
      title: 'Main Thread, Long Tasks, Web Workers and List Virtualization',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'The main thread does JS, layout and paint. Break long tasks into chunks, move heavy work to Web Workers, and virtualize long lists to keep the page responsive.',
      what: `The browser's **main thread** does almost everything for your page: runs JavaScript, handles clicks, calculates styles and layout, and paints. It can do **one thing at a time**.

A **long task** is any task over **50 ms**. While it runs, the page cannot respond to clicks or update the screen — the user feels lag (bad INP).

Three main fixes:
- **Break up work** into small pieces and **yield** to the browser between them, so it can handle input and paint.
- **Move heavy work off the main thread** with a **Web Worker** (a background thread for JS: parsing big files, image processing, heavy calculations).
- **Do less work:** render only what is visible. For a list of 10,000 rows, **virtualization** renders only the ~20 rows on screen.

#### Deeper version
- **Yielding:** \`await new Promise((r) => setTimeout(r, 0))\` gives the browser a chance to run input handlers and render. Newer Chromium versions have \`scheduler.yield()\`, which continues your work with higher priority after yielding; check browser support and use a fallback.
- **Web Workers** cannot touch the DOM. They talk to the page with \`postMessage\` (data is copied, or **transferred** for ArrayBuffers). Good for CPU work; not useful for DOM work.
- **React tools:** \`useTransition\` and \`useDeferredValue\` mark updates as non-urgent so React (concurrent rendering) can pause them for user input. \`React.memo\`, \`useMemo\` and stable props cut wasted re-renders. Avoid huge context providers that re-render everything.
- **Debounce and throttle** input handlers (search, resize, scroll) so expensive work runs less often.
- **Hydration cost:** SSR pages still need JS to hydrate, which can create long tasks on load. Less client JS (Server Components, islands, partial hydration) helps.
- **Third-party scripts** often create long tasks too; audit them in the Performance panel.
- \`requestIdleCallback\` runs low-priority work when the browser is idle (not supported in every browser, so feature-detect).`,
      why: `Slow interactions are now the most common performance complaint in big React apps — not load time. INP directly measures this. Knowing how to find and break up long tasks is what separates senior front-end engineers in performance interviews.`,
      analogy: `The main thread is a single cashier in a shop. If one customer wants to pay for 500 items one by one (long task), the whole queue waits. Fixes: let others pay between every 20 items (yielding), open a second counter in the back for bulk orders (Web Worker), and only scan items actually in the basket (virtualization).`,
      code: [
        {
          title: 'Break a long loop into chunks and yield',
          lang: 'javascript',
          code: `function yieldToMain() {
  // Use scheduler.yield() where supported, otherwise fall back to setTimeout
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function processRows(rows, handleRow) {
  let lastYield = performance.now();
  for (const row of rows) {
    handleRow(row);
    if (performance.now() - lastYield > 40) { // stay under the 50 ms long-task limit
      await yieldToMain();                   // let the browser handle clicks and paint
      lastYield = performance.now();
    }
  }
}`,
        },
        {
          title: 'Heavy work in a Web Worker (Vite syntax)',
          lang: 'javascript',
          code: `// csv-worker.js — runs on a background thread, no DOM access
self.onmessage = (event) => {
  const text = event.data;
  const rows = text.split('\\n').map((line) => line.split(','));
  const total = rows.reduce((sum, r) => sum + Number(r[2] || 0), 0);
  self.postMessage({ count: rows.length, total });
};

// main.js — the page stays responsive while the worker parses
const worker = new Worker(new URL('./csv-worker.js', import.meta.url), { type: 'module' });
worker.onmessage = (e) => console.log('Parsed', e.data.count, 'rows, total', e.data.total);
const file = document.querySelector('#csv').files[0];
worker.postMessage(await file.text());`,
        },
        {
          title: 'Virtualize a long list with react-window',
          lang: 'jsx',
          code: `import { FixedSizeList } from 'react-window';

// Renders ~15 DOM rows at a time instead of 10,000
export function OrdersList({ orders }) {
  return (
    <FixedSizeList height={600} width="100%" itemCount={orders.length} itemSize={48}>
      {({ index, style }) => (
        <div style={style}>{orders[index].id} — {orders[index].customer}</div>
      )}
    </FixedSizeList>
  );
}
// Note: react-window's API changed in newer major versions; check its docs.`,
        },
      ],
      output: `\`processRows\` handles thousands of rows but pauses every ~40 ms, so clicks still respond and the page keeps painting; the Performance panel shows many short tasks instead of one red long task.

The worker parses a large CSV off the main thread; the page stays fully interactive and then logs something like \`Parsed 200000 rows, total 5321890\`.

The virtualized list keeps only the visible rows (plus a few extra) in the DOM. Scrolling re-uses them, so a 10,000-order list renders instantly and scrolls smoothly, instead of creating 10,000 DOM nodes.`,
      questions: [
        {
          q: 'What is a long task and why does it matter?',
          a: 'A main-thread task longer than 50 ms. During it the browser cannot respond to input or render, which causes lag and worse INP.',
        },
        {
          q: 'When would you use a Web Worker?',
          a: 'For CPU-heavy work that does not need the DOM: parsing big files, data processing, image manipulation, encryption, search indexes. It runs on a separate thread and communicates via postMessage.',
        },
        {
          q: 'What is list virtualization?',
          a: 'Rendering only the items visible in the viewport (plus a small buffer) and recycling DOM nodes while scrolling. Libraries: react-window, react-virtuoso, TanStack Virtual.',
        },
        {
          q: 'How does useTransition help responsiveness?',
          a: 'It marks a state update as non-urgent. React keeps urgent updates (like typing) fast and can interrupt the transition rendering if new input arrives.',
        },
        {
          q: 'Debounce vs throttle?',
          a: 'Debounce waits until events stop for a period, then runs once (search input). Throttle runs at most once per interval while events continue (scroll, resize).',
        },
      ],
      spoken: `"The main thread runs JavaScript, handles input and does rendering, one thing at a time. Any task over 50 milliseconds is a long task and blocks interactions, which shows up as bad INP. To fix it, I first find long tasks in the Performance panel. Then I break work into chunks and yield to the browser, move heavy CPU work like CSV parsing into a Web Worker, and do less work — virtualizing long lists, memoizing expensive components, and using useTransition for non-urgent updates. I also debounce or throttle frequent events and check third-party scripts."`,
      mistakes: [
        'Thinking `async`/`await` makes CPU work non-blocking. Async code still runs on the main thread; only waiting (I/O) is non-blocking.',
        'Trying to update the DOM from a Web Worker — workers have no DOM access.',
        'Rendering thousands of rows and blaming React instead of virtualizing.',
        'Follow-up trap: "Is a Web Worker always faster?" No. Copying large data with postMessage has a cost, and starting a worker takes time. Use transferable objects for big buffers and keep workers for genuinely heavy work.',
      ],
      takeaway: 'Keep every main-thread task under 50 ms: chunk and yield, offload to workers, and render only what is visible.',
    },
  ],
  rapidFire: [
    { q: 'Steps of the critical rendering path?', a: 'DOM, CSSOM, render tree, layout, paint, composite.' },
    { q: 'Is CSS render-blocking?', a: 'Yes, stylesheets in the head block the first paint.' },
    { q: 'Does display: none appear in the render tree?', a: 'No. visibility: hidden does, because it still takes space.' },
    { q: 'Cheapest properties to animate?', a: 'transform and opacity.' },
    { q: 'First network step after typing a URL?', a: 'DNS lookup (after checking caches) to get the IP address.' },
    { q: 'Order of DNS lookup on a miss?', a: 'Recursive resolver asks root, then TLD, then the authoritative server.' },
    { q: 'What is TTFB?', a: 'Time To First Byte — from request sent to first response byte received.' },
    { q: 'What does TLS add to a connection?', a: 'Encryption, integrity and server identity via certificates.' },
    { q: 'async vs defer in one line?', a: 'defer runs in order after parsing; async runs as soon as it loads, in any order.' },
    { q: 'Are module scripts deferred by default?', a: 'Yes.' },
    { q: 'DOMContentLoaded vs load?', a: 'DOMContentLoaded = HTML parsed; load = all resources including images loaded.' },
    { q: 'no-cache vs no-store?', a: 'no-cache stores but always revalidates; no-store never stores.' },
    { q: 'What status means "not modified"?', a: '304.' },
    { q: 'What header carries the ETag back to the server?', a: 'If-None-Match.' },
    { q: 'How to cache hashed assets?', a: 'Cache-Control: public, max-age=31536000, immutable.' },
    { q: 'How to cache index.html in an SPA?', a: 'no-cache, so it is revalidated on every visit.' },
    { q: 's-maxage is for?', a: 'Shared caches like CDNs and proxies.' },
    { q: 'What is stale-while-revalidate?', a: 'Serve the stale copy now and refresh it in the background.' },
    { q: 'What is a CDN cache hit?', a: 'The edge server already has the file and serves it without contacting the origin.' },
    { q: 'Best way to bust CDN caches on deploy?', a: 'Content-hashed file names.' },
    { q: 'Native lazy loading attribute?', a: 'loading="lazy" on img and iframe.' },
    { q: 'Should the LCP image be lazy?', a: 'Never. Give it fetchpriority="high" instead.' },
    { q: 'What does React.lazy need?', a: 'A function returning a dynamic import of a module with a default export, rendered inside Suspense.' },
    { q: 'What creates a separate chunk?', a: 'A dynamic import() call.' },
    { q: 'Code splitting vs tree shaking?', a: 'Splitting loads code later; tree shaking removes unused code.' },
    { q: 'Bundle analyzer for Vite?', a: 'rollup-plugin-visualizer.' },
    { q: 'Bundler-agnostic analyzer?', a: 'source-map-explorer (uses source maps).' },
    { q: 'Lighter alternatives to moment?', a: 'date-fns or dayjs (or native Intl).' },
    { q: 'preload vs prefetch?', a: 'preload = current page, high priority; prefetch = likely next page, low priority.' },
    { q: 'What does preconnect do?', a: 'Performs DNS, TCP and TLS to an origin early.' },
    { q: 'Why crossorigin on font preloads?', a: 'Fonts load in CORS mode; without it the font downloads twice.' },
    { q: 'Best photo formats today?', a: 'AVIF and WebP, with a JPEG fallback.' },
    { q: 'srcset vs sizes?', a: 'srcset lists files and widths; sizes says how wide the image will display.' },
    { q: 'How to prevent image layout shift?', a: 'Set width and height or aspect-ratio.' },
    { q: 'Brotli vs gzip?', a: 'Brotli is usually smaller; gzip is the universal fallback.' },
    { q: 'Main benefit of HTTP/2?', a: 'Multiplexing many requests over one connection.' },
    { q: 'HTTP/3 runs on?', a: 'QUIC over UDP.' },
    { q: 'Is HTTP/2 Server Push recommended?', a: 'No, it is deprecated; use preload or 103 Early Hints.' },
    { q: 'Three Core Web Vitals?', a: 'LCP, INP and CLS.' },
    { q: 'Good LCP threshold?', a: '2.5 seconds or less.' },
    { q: 'Good INP threshold?', a: '200 milliseconds or less.' },
    { q: 'Good CLS threshold?', a: '0.1 or less.' },
    { q: 'What replaced FID?', a: 'INP, in March 2024.' },
    { q: 'At which percentile are vitals judged?', a: 'The 75th percentile of page loads.' },
    { q: 'Lab vs field data?', a: 'Lab = simulated (Lighthouse); field = real users (CrUX, RUM, web-vitals).' },
    { q: 'Library to measure vitals in production?', a: 'web-vitals (onLCP, onINP, onCLS).' },
    { q: 'How to send metrics when the page closes?', a: 'navigator.sendBeacon or fetch with keepalive.' },
    { q: 'What is a long task?', a: 'A main-thread task over 50 ms.' },
    { q: 'Lab proxy for INP in Lighthouse?', a: 'Total Blocking Time (TBT).' },
    { q: 'What is layout thrashing?', a: 'Alternating style writes and layout reads, forcing many synchronous layouts.' },
    { q: 'Best place for visual DOM updates?', a: 'Inside requestAnimationFrame.' },
    { q: 'Can a Web Worker access the DOM?', a: 'No; it communicates with postMessage.' },
    { q: 'What is list virtualization?', a: 'Rendering only visible rows; e.g. react-window or TanStack Virtual.' },
    { q: 'Debounce vs throttle?', a: 'Debounce runs after events stop; throttle runs at most once per interval.' },
  ],
};
