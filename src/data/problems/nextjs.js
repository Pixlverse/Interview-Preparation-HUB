// Interview problems for the Next.js stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.
// Code uses the App Router. Where behaviour differs between Next.js 14 / 15 / 16, the text says so.

export default {
  stackId: 'nextjs',
  problems: [
    {
      id: 'choose-rendering-strategy',
      title: 'Pick SSR, SSG, ISR or CSR for each page',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'rendering-strategies',
      question: `You are building an online shop in Next.js. For each page, choose a rendering strategy and explain why in one sentence:

1. **Marketing landing page** (changes once a month).
2. **Blog post pages** (500 posts, editors publish a few new posts a day, small typo fixes happen).
3. **Product page** (needs good SEO; price changes rarely, but **stock count** changes every few seconds).
4. **User dashboard** (orders of the logged-in user, private, no SEO needed).
5. **Search results page** (\`/search?q=shoes\`, depends on the query string).

Quick reminder of the words:
- **SSG** (Static Site Generation) = HTML built once at build time.
- **ISR** (Incremental Static Regeneration) = static HTML that is rebuilt in the background after a time or on demand.
- **SSR** (Server-Side Rendering) = HTML built on the server for **every** request.
- **CSR** (Client-Side Rendering) = the browser fetches data with JavaScript after the page loads.`,
      hints: [
        'Ask two questions for each page: does it need SEO? How often does the data change, and is it the same for every user?',
        'A page can mix strategies: the main page can be static while one small part is fetched on the client or streamed.',
      ],
      solution: `**Idea:** match the strategy to (a) how fresh the data must be, (b) whether it is the same for all users, and (c) whether search engines need the HTML.

1. **Landing page → SSG.** Same for everyone, rarely changes. Fastest possible: served from a CDN.
2. **Blog posts → ISR (+ on-demand revalidation).** Static speed and SEO, but new posts and typo fixes appear without a full rebuild.
3. **Product page → ISR for the page + live stock on the client (or streamed).** Name, price, images and description are SEO content and change rarely, so cache them. Stock changes every few seconds, so fetch only that small part fresh.
4. **Dashboard → SSR (dynamic) or CSR.** Private and per-user, so it cannot be cached and shared. No SEO needed.
5. **Search results → SSR (dynamic).** Depends on the query string, so it cannot be pre-built. SSR also lets Google index popular searches.

In the App Router this looks like:

\`\`\`tsx
// Blog post: static, rebuilt at most every hour, or right away via revalidatePath()
export const revalidate = 3600;

// Product page: cached product data, fresh stock in a small client component
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetch(\`https://api.shop.com/products/\${id}\`, {
    next: { revalidate: 300, tags: [\`product-\${id}\`] }, // cached for 5 min, explicit on purpose
  }).then((r) => r.json());

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <StockBadge productId={id} /> {/* 'use client' component that polls /api/stock */}
    </main>
  );
}
\`\`\`

**Why it works:** you pay the cost of server rendering only where data is truly per-request. Everything else is served from a cache, which gives fast TTFB (Time To First Byte = how long until the first byte of the response arrives) and good SEO.

**Edge cases:** a dashboard behind login gets nothing from SSG. A product page that is fully SSR "just because of stock" makes every visit slow — a common over-engineering answer.`,
      followUps: [
        {
          q: 'How do you make the blog post update immediately when an editor clicks Publish?',
          a: 'Call `revalidatePath(\'/blog/[slug]\', \'page\')` or `revalidateTag(\'posts\')` from a CMS webhook route handler or a server action. Time-based ISR is only the safety net.',
        },
        {
          q: 'What makes an App Router page dynamic (SSR) automatically?',
          a: 'Using request-time APIs such as `cookies()`, `headers()`, `searchParams`, or an uncached fetch (`cache: \'no-store\'`). You can also force it with `export const dynamic = \'force-dynamic\'`.',
        },
      ],
    },
    {
      id: 'env-var-undefined-in-browser',
      title: 'Environment variable is undefined in the browser',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'environment-variables',
      question: `A developer added this to \`.env.local\`:

\`\`\`bash
API_URL=https://api.example.com
STRIPE_SECRET_KEY=sk_live_123
\`\`\`

And this client component:

\`\`\`tsx
'use client';

export default function Products() {
  const load = async () => {
    const res = await fetch(\`\${process.env.API_URL}/products\`);
    console.log(await res.json());
  };
  return <button onClick={load}>Load</button>;
}
\`\`\`

In the browser the request goes to \`undefined/products\`. In a server component \`process.env.API_URL\` works fine. Explain why and fix it. Should \`STRIPE_SECRET_KEY\` also get the fix?`,
      hints: [
        'The browser does not have a `process.env`. How does Next.js get values into the browser bundle at all?',
        'Only variables with a special prefix are copied into client code at build time.',
      ],
      solution: `**Idea:** Next.js only puts env vars that start with **\`NEXT_PUBLIC_\`** into the JavaScript that is sent to the browser. All other env vars stay on the server. This protects secrets.

\`\`\`bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com   # safe to show to anyone
STRIPE_SECRET_KEY=sk_live_123                  # server only. NEVER add NEXT_PUBLIC_
\`\`\`

\`\`\`tsx
'use client';

export default function Products() {
  const load = async () => {
    // Replaced by the real string at BUILD time
    const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/products\`);
    console.log(await res.json());
  };
  return <button onClick={load}>Load</button>;
}
\`\`\`

**Why it works:** at build time Next.js finds \`process.env.NEXT_PUBLIC_...\` in client code and replaces it with the literal value ("inlining"). Without the prefix there is nothing to replace, so it is \`undefined\`.

**Do not** add the prefix to \`STRIPE_SECRET_KEY\`. Anyone could read it in the JS bundle. Use it only in server code (server components, route handlers, server actions).

**Edge cases:**
- Because the value is inlined at **build** time, changing \`NEXT_PUBLIC_API_URL\` on the server after the build does nothing. You must rebuild (important for Docker images used in many environments).
- Dynamic lookups like \`process.env[name]\` are **not** inlined. Write the full name.
- Restart \`next dev\` after editing \`.env.local\`.`,
      followUps: [
        {
          q: 'How do you use one Docker image for staging and production if public vars are baked in at build?',
          a: 'Read the value on the server at runtime (server component or route handler reads a normal env var) and pass it to the client as a prop, or expose a small `/api/config` endpoint. Then the image is environment-agnostic.',
        },
        {
          q: 'How do you stop server-only code (with secrets) from being imported into a client component by mistake?',
          a: 'Add `import \'server-only\'` at the top of that module. The build fails if a client component imports it.',
        },
      ],
    },
    {
      id: 'next-image-layout-shift',
      title: 'Fix layout shift and a slow hero image with next/image',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'next-image',
      question: `Lighthouse reports a bad **CLS** (Cumulative Layout Shift = how much the page jumps while loading) and a slow **LCP** (Largest Contentful Paint = when the biggest element, here the hero image, appears). Find the problems and fix them.

\`\`\`tsx
export default function Hero() {
  return (
    <section>
      <img src="https://cdn.example.com/hero.jpg" style={{ width: '100%' }} />
      <h1>Summer sale</h1>
    </section>
  );
}

export function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.imageUrl} />
      <p>{product.name}</p>
    </div>
  );
}
\`\`\``,
      hints: [
        'The browser does not know how tall an image is until it downloads it. What happens to the text below it?',
        '`next/image` needs either `width` + `height`, or `fill` inside a parent with a size and `position: relative`.',
        'The hero is above the fold. It should load first, not lazily.',
      ],
      solution: `**Idea:** reserve the image space **before** it loads (width/height or aspect ratio), serve right-sized modern images, and load the hero image with high priority.

\`\`\`tsx
import Image from 'next/image';
import heroImg from '@/public/hero.jpg'; // static import: Next knows width/height automatically

export default function Hero() {
  return (
    <section>
      <Image
        src={heroImg}
        alt="Summer sale banner"
        priority          // preload it: it is the LCP element (Next 16 renames this to "preload")
        sizes="100vw"     // it is full width on every screen
        style={{ width: '100%', height: 'auto' }}
        placeholder="blur" // works automatically for static imports
      />
      <h1>Summer sale</h1>
    </section>
  );
}

export function ProductCard({ product }: { product: { imageUrl: string; name: string } }) {
  return (
    <div className="card">
      {/* Parent has a fixed aspect ratio, so space is reserved before load */}
      <div style={{ position: 'relative', aspectRatio: '1 / 1' }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill                                   // fill the parent box
          sizes="(max-width: 768px) 50vw, 25vw"  // tells the browser which width to download
          style={{ objectFit: 'cover' }}
        />
      </div>
      <p>{product.name}</p>
    </div>
  );
}
\`\`\`

\`\`\`javascript
// next.config.js — remote images must be allowed explicitly
module.exports = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }],
  },
};
\`\`\`

**Why it works:**
- **CLS:** with \`width\`/\`height\` (or a parent with \`aspectRatio\` + \`fill\`) the browser reserves the box, so text does not jump.
- **LCP:** \`priority\` adds a preload and turns off lazy loading for the hero. \`sizes\` lets the browser pick a small file on phones. Next also converts to WebP/AVIF.
- **alt** text is required for accessibility and SEO.

**Edge cases:** do not put \`priority\` on every image — then nothing is really prioritised. Without \`sizes\`, a \`fill\` image may download a file far bigger than needed.`,
      followUps: [
        {
          q: 'Why is a remote image blocked with an error until you change next.config?',
          a: 'The image optimizer runs on your server. Without an allow-list, anyone could use your server to resize images from any site. `remotePatterns` limits which hosts are allowed.',
        },
        {
          q: 'When would you not use next/image?',
          a: 'For tiny SVG icons, or when images are already optimized by an external CDN (you can set a custom `loader` or `unoptimized`). Self-hosted setups also need enough CPU for the optimizer.',
        },
      ],
    },
    {
      id: 'loading-and-error-boundaries',
      title: 'Add a loading state and an error screen to a route',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'streaming-loading-error',
      question: `The page \`app/orders/page.tsx\` fetches orders from a slow API (2-3 seconds). Users stare at a blank screen, and when the API fails they see the default crash page.

\`\`\`tsx
// app/orders/page.tsx
export default async function OrdersPage() {
  const res = await fetch('https://api.example.com/orders', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load orders');
  const orders: { id: string; total: number }[] = await res.json();
  return <ul>{orders.map((o) => <li key={o.id}>{o.id}: \${o.total}</li>)}</ul>;
}
\`\`\`

1. Show a skeleton while it loads.
2. Show a friendly error with a **Try again** button when it fails.
3. Show a custom 404 if an order id does not exist on \`/orders/[id]\`.`,
      hints: [
        'Next.js has special file names in a route folder that wrap the page automatically.',
        '`error.tsx` must be a client component. It receives `error` and `reset` props.',
        'Call `notFound()` from `next/navigation` to render the nearest `not-found.tsx`.',
      ],
      solution: `**Idea:** use the App Router file conventions. \`loading.tsx\` becomes a React **Suspense** fallback and \`error.tsx\` becomes a React **error boundary** around the page — you do not write those wrappers yourself.

\`\`\`tsx
// app/orders/loading.tsx — shown instantly while page.tsx is awaiting data
export default function Loading() {
  return (
    <ul aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="skeleton-row" />
      ))}
    </ul>
  );
}
\`\`\`

\`\`\`tsx
// app/orders/error.tsx — must be a Client Component (error boundaries use client features)
'use client';

import { useEffect } from 'react';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error); // send to Sentry or your logger here
  }, [error]);

  return (
    <div role="alert">
      <p>We could not load your orders.</p>
      {/* reset() re-renders the segment and tries again */}
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// app/orders/[id]/page.tsx
import { notFound } from 'next/navigation';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params is a Promise in Next 15+ (awaiting also works in 14)
  const res = await fetch(\`https://api.example.com/orders/\${id}\`, { cache: 'no-store' });
  if (res.status === 404) notFound(); // renders the closest not-found.tsx
  if (!res.ok) throw new Error('Failed to load order');
  const order = await res.json();
  return <h1>Order {order.id}</h1>;
}
\`\`\`

\`\`\`tsx
// app/orders/[id]/not-found.tsx
export default function OrderNotFound() {
  return <p>That order does not exist.</p>;
}
\`\`\`

**Why it works:** Next.js wraps the page like \`<ErrorBoundary fallback={<Error/>}><Suspense fallback={<Loading/>}><Page/></Suspense></ErrorBoundary>\`. The layout (header, sidebar) stays visible and interactive, and the loading UI is **streamed** immediately.

**Edge cases:**
- \`error.tsx\` does **not** catch errors in the \`layout.tsx\` of the same folder (the boundary is inside the layout). Use the parent's \`error.tsx\`, or \`global-error.tsx\` for the root layout.
- In production the error message is hidden for server errors; only a \`digest\` id is sent, so you do not leak secrets.`,
      followUps: [
        {
          q: 'How do you show the page header instantly but stream only the slow orders list?',
          a: 'Move the slow fetch into its own async component and wrap it in `<Suspense fallback={<Skeleton/>}>` inside the page. The rest of the page renders right away.',
        },
        {
          q: 'Does reset() refetch server data?',
          a: 'It re-renders the segment on the client. If the error came from a server component, also call `router.refresh()` (inside `startTransition`) so the server component runs again.',
        },
      ],
    },
    {
      id: 'fix-hydration-errors',
      title: 'Fix three hydration errors',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'hydration-errors',
      question: `The console shows "Hydration failed because the server rendered HTML didn't match the client". **Hydration** = React in the browser attaches event handlers to the HTML that the server sent; it expects to produce the **same** HTML. Find the three bugs and fix them.

\`\`\`tsx
'use client';

export default function Header() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768; // bug 1
  return (
    <header>
      <p>
        Last updated: {new Date().toLocaleTimeString()}   {/* bug 2 */}
      </p>
      <p>
        <div className="badge">{isMobile ? 'Mobile' : 'Desktop'}</div>  {/* bug 3 */}
      </p>
    </header>
  );
}
\`\`\``,
      hints: [
        'A client component is still rendered on the server first. What is `window` there? What time is it there?',
        'The HTML parser in the browser does not allow a `<div>` inside a `<p>`. It "fixes" the HTML, so the DOM no longer matches.',
        'Render the same thing on the first client render as on the server, then update in `useEffect`.',
      ],
      solution: `**Idea:** the first client render must equal the server render. Browser-only values (window size, current time, localStorage) must be read **after** hydration, in \`useEffect\`.

\`\`\`tsx
'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  // Bug 1: start with a value that is the same on server and client
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  // Bug 2: time is also a browser-only value here
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    // Runs only in the browser, AFTER hydration
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    setTime(new Date().toLocaleTimeString());
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <header>
      <p>Last updated: {time ?? '—'}</p>
      {/* Bug 3: a <div> cannot live inside a <p>. Use a <span> (or make the outer tag a <div>) */}
      <p>
        <span className="badge">{isMobile === null ? '' : isMobile ? 'Mobile' : 'Desktop'}</span>
      </p>
    </header>
  );
}
\`\`\`

**Why it works:**
1. On the server \`typeof window\` is \`'undefined'\`, so the server said "Desktop" while a phone said "Mobile". Now both start with \`null\`.
2. The server's time and the browser's time differ (and time zones may differ). Now the time appears after hydration.
3. The browser auto-closes \`<p>\` before a \`<div>\`, so the real DOM differs from React's tree. Valid nesting fixes it.

**Other fixes you can mention:**
- For a single text node that is **expected** to differ (like a timestamp), \`<time suppressHydrationWarning>\` silences the warning. It works one level deep only — do not use it to hide real bugs.
- For layout differences, prefer **CSS media queries** over JS — no mismatch and no flash.
- A whole widget that only makes sense in the browser can be loaded with \`dynamic(() => import('./Map'), { ssr: false })\`. In Next 15+ this call must be inside a client component.
- Browser extensions that edit the HTML (password managers, translators) can also cause mismatches — test in an incognito window.`,
      followUps: [
        {
          q: 'Is useEffect + useState the only way? It causes a second render.',
          a: 'For external browser stores, `useSyncExternalStore` with a `getServerSnapshot` is the "correct" React way. For pure layout, CSS media queries avoid JS entirely.',
        },
        {
          q: 'Why are hydration errors more than a warning?',
          a: 'React may throw away the server HTML and re-render on the client, losing the SSR speed benefit, and event handlers may attach to the wrong elements.',
        },
      ],
    },
    {
      id: 'dynamic-route-static-params-metadata',
      title: 'Build a blog post page with generateStaticParams and generateMetadata',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'dynamic-routes',
      question: `Build \`/blog/[slug]\` in the App Router. A headless CMS has these endpoints:

\`\`\`text
GET https://cms.example.com/posts          -> [{ slug, title }]
GET https://cms.example.com/posts/:slug    -> { slug, title, excerpt, coverUrl, html } or 404
\`\`\`

Requirements:
1. Pre-build all **existing** posts at build time.
2. A **new** post published after the build must still work (not 404).
3. Each page has its own \`<title>\`, description and Open Graph image (the preview card on Slack / LinkedIn).
4. Unknown slugs show a 404 page.
5. Content refreshes at most every hour.
6. Do not call the CMS twice for the same post in one request (once for metadata, once for the page).`,
      hints: [
        '`generateStaticParams` returns the list of `{ slug }` objects to pre-render.',
        '`dynamicParams = true` (the default) lets Next render unknown slugs on demand and then cache them.',
        'Wrap your data function in React `cache()` so `generateMetadata` and the page share one result per request.',
      ],
      solution: `**Idea:** \`generateStaticParams\` pre-renders the known slugs, \`dynamicParams\` handles new ones on first visit, \`generateMetadata\` builds SEO tags from the same data, and \`revalidate\` turns it into ISR.

\`\`\`tsx
// app/blog/[slug]/page.tsx
import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Post = { slug: string; title: string; excerpt: string; coverUrl: string; html: string };
type Props = { params: Promise<{ slug: string }> }; // a Promise in Next 15+ (await also works in 14)

export const revalidate = 3600;    // ISR: rebuild a page at most once per hour
export const dynamicParams = true; // new slugs are rendered on first request, then cached

// cache() = one call per request, even if metadata AND page ask for the same slug
const getPost = cache(async (slug: string): Promise<Post | null> => {
  const res = await fetch(\`https://cms.example.com/posts/\${slug}\`, {
    next: { revalidate: 3600, tags: ['posts', \`post-\${slug}\`] }, // explicit, so it is cached in 14, 15 and 16
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(\`CMS error \${res.status}\`); // goes to error.tsx
  return res.json();
});

// Runs at BUILD time: which pages to pre-render
export async function generateStaticParams() {
  const posts: { slug: string }[] = await fetch('https://cms.example.com/posts', {
    cache: 'force-cache',
  }).then((r) => r.json());
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: \`/blog/\${slug}\` }, // needs metadataBase in the root layout
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverUrl],
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug); // same request -> served from cache(), no 2nd CMS call
  if (!post) notFound();            // renders not-found.tsx with a 404 status

  return (
    <article>
      <h1>{post.title}</h1>
      {/* HTML from a trusted CMS only. Sanitize it if authors are not trusted. */}
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
\`\`\`

\`\`\`tsx
// app/layout.tsx (part of it) — makes relative URLs in metadata absolute
export const metadata = { metadataBase: new URL('https://myblog.com') };
\`\`\`

**Why it works:**
- At build, every slug from the list becomes static HTML.
- A slug not in the list is rendered on the first request (because \`dynamicParams\` is true), then cached like the others.
- \`fetch\` calls with the same URL and options are also memoized during one render, but \`cache()\` works for **any** function (a MongoDB query too), so it is the safer habit.
- \`notFound()\` stops rendering and returns a real **404** status, which tells Google not to index the page.

**Edge cases:** with 50,000 posts, building all of them is slow. Return only the top 1,000 popular slugs from \`generateStaticParams\` and let the rest be built on demand.`,
      followUps: [
        {
          q: 'What does dynamicParams = false change?',
          a: 'Only slugs returned by generateStaticParams are allowed. Any other slug returns 404 without calling the CMS. Good for a fixed set like country codes.',
        },
        {
          q: 'The editor fixes a typo and wants it live now, not in an hour. How?',
          a: 'Add a CMS webhook route handler that checks a secret and calls `revalidateTag(\'post-\' + slug)` (in Next 16 also pass a cache profile, e.g. `revalidateTag(tag, \'max\')`) or `revalidatePath(\'/blog/\' + slug)`.',
        },
        {
          q: 'How would you add a dynamic OG image instead of the CMS cover?',
          a: 'Add `opengraph-image.tsx` in the route folder that returns an `ImageResponse` from `next/og`. Next wires the meta tag automatically.',
        },
      ],
    },
    {
      id: 'route-handler-with-validation',
      title: 'Write a GET/POST route handler with input validation',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'api-routes-route-handlers',
      question: `Create \`app/api/tasks/route.ts\`:

- \`GET /api/tasks?page=2&limit=20\` — returns the logged-in user's tasks, paginated. Bad or missing numbers fall back to safe defaults. \`limit\` max is 100.
- \`POST /api/tasks\` with JSON \`{ "title": "Buy milk", "dueDate": "2026-12-01" }\` — creates a task.
  - Invalid JSON → \`400\`.
  - \`title\` must be 1-200 characters, \`dueDate\` optional ISO date → otherwise \`400\` with a list of field errors.
  - Not logged in → \`401\`.
  - Success → \`201\` with the created task.

Assume you have \`getSession()\` (returns \`{ userId }\` or \`null\`) and a \`db\` with \`tasks.find\` / \`tasks.create\` helpers. Use Zod for validation.`,
      hints: [
        'A route handler exports functions named after HTTP methods: `export async function GET(request)`.',
        '`request.json()` throws on invalid JSON — wrap it in try/catch.',
        'Use `schema.safeParse()` so validation returns a result instead of throwing.',
      ],
      solution: `**Idea:** one file, one exported function per HTTP method. Check auth first, then parse and validate input, then do the work, and return the right status code each time.

\`\`\`typescript
// app/api/tasks/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// Per-user data must never be cached and shared. Explicit, so it is the same in Next 14/15/16.
export const dynamic = 'force-dynamic';

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  dueDate: z.coerce.date().optional(), // "2026-12-01" -> Date, invalid -> error
});

// Turn a query param into a safe integer between min and max
function toInt(value: string | null, fallback: number, min: number, max: number) {
  const n = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const page = toInt(params.get('page'), 1, 1, 10_000);
  const limit = toInt(params.get('limit'), 20, 1, 100);

  const { items, total } = await db.tasks.find({
    userId: session.userId,         // only THIS user's tasks
    skip: (page - 1) * limit,
    limit,
  });

  return NextResponse.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body must be valid JSON' }, { status: 400 });
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        fields: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
      { status: 400 },
    );
  }

  // Never trust a userId from the body. Take it from the session.
  const task = await db.tasks.create({ ...parsed.data, userId: session.userId });
  return NextResponse.json(task, { status: 201 });
}
\`\`\`

**Why it works:**
- \`safeParse\` gives typed, trimmed data or a list of issues. Zod also drops unknown keys by default, so a client cannot sneak in \`isAdmin: true\`.
- \`toInt\` clamps the numbers, so \`?limit=999999\` or \`?page=abc\` cannot hurt the database.
- Order of checks: **401 → 400 → work → 201**. The user id always comes from the session.

**Edge cases:** an empty body, a JSON array instead of an object (Zod rejects it), very large bodies (put a size limit at the proxy / platform), and the Next 14 gotcha: a \`GET\` handler that uses nothing dynamic could be **cached at build time** — here \`force-dynamic\` and the session read prevent that.`,
      followUps: [
        {
          q: 'When should you use a route handler instead of a server action?',
          a: 'Route handlers are for things outside your React UI: webhooks (Stripe), a public or mobile API, file downloads, or GET endpoints. Server actions are for mutations triggered from your own forms and buttons.',
        },
        {
          q: 'How do you add a PATCH /api/tasks/:id?',
          a: 'Create `app/api/tasks/[id]/route.ts` and export `PATCH(request, { params })`. `params` is a Promise in Next 15+. Check that the task belongs to the session user before updating (otherwise any user can edit any task — an IDOR bug).',
        },
      ],
    },
    {
      id: 'middleware-protect-dashboard',
      title: 'Protect /dashboard with middleware and a session cookie',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'middleware',
      question: `Users must be logged in to see anything under \`/dashboard\`. Login sets an **httpOnly** cookie named \`session\` that holds a signed JWT (JSON Web Token).

Write middleware that:
1. Runs only for \`/dashboard\` and its sub-pages.
2. Redirects to \`/login?from=/dashboard/billing\` (the page they wanted) if the cookie is missing or the JWT is invalid/expired.
3. Lets the request continue if the token is valid.

Then explain why this alone is **not enough** security.`,
      hints: [
        'The file is `middleware.ts` at the project root (renamed to `proxy.ts` in Next.js 16). Use `export const config = { matcher: [...] }`.',
        'Read the cookie with `request.cookies.get(\'session\')?.value`.',
        'Middleware traditionally runs on the Edge runtime, so use an Edge-friendly JWT library like `jose`, not `jsonwebtoken`.',
      ],
      solution: `**Idea:** middleware runs **before** the route. Check the cookie there and redirect early. Then still check auth again next to the data.

\`\`\`typescript
// middleware.ts  (Next.js 16: file proxy.ts, function named "proxy" — same logic)
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (token) {
    try {
      await jwtVerify(token, secret); // checks signature AND expiry ("exp")
      return NextResponse.next();     // valid -> continue to the page
    } catch {
      // invalid or expired -> fall through to the redirect
    }
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete('session'); // clean up a bad cookie
  return response;
}

// Only run for /dashboard and everything under it
export const config = {
  matcher: ['/dashboard/:path*'],
};
\`\`\`

\`\`\`typescript
// On the login page / action: only follow "from" if it is a local path (avoid open redirects)
function safeRedirect(from: string | null) {
  return from && from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard';
}
\`\`\`

**Why it works:** the \`matcher\` keeps the middleware off every other route (it runs on every matched request, including prefetches, so it must stay fast). \`jwtVerify\` checks the signature with the secret, so a user cannot forge a token.

**Why it is not enough:**
- Middleware is an **optimistic** check — a fast first gate. A bug in the matcher (forgot \`/api/dashboard-data\`?) or a framework bug can skip it. In 2025, CVE-2025-29927 let attackers bypass middleware in unpatched versions with a special header.
- Server actions and route handlers are **public HTTP endpoints**. They must check the session themselves.
- So: check again in a **Data Access Layer** (a \`verifySession()\` helper called by every data function, server action and route handler).

**Edge cases:** do not do slow database lookups in middleware. Keep the session cookie \`httpOnly\`, \`secure\` and \`sameSite: 'lax'\`.`,
      followUps: [
        {
          q: 'How would you also send logged-in users away from /login to /dashboard?',
          a: 'Add `/login` to the matcher and branch on `request.nextUrl.pathname`: if the token is valid and the path is `/login`, `NextResponse.redirect(new URL(\'/dashboard\', request.url))`.',
        },
        {
          q: 'Why jose and not jsonwebtoken?',
          a: '`jsonwebtoken` uses Node.js crypto APIs that the Edge runtime does not have. `jose` uses the Web Crypto API, which works on Edge and Node.',
        },
      ],
    },
    {
      id: 'server-action-form-revalidate',
      title: 'Create a todo with a server action and refresh the list',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'server-actions',
      question: `\`app/todos/page.tsx\` is a server component that lists todos from the database. Add a form that creates a todo **without writing an API route**.

Requirements:
- Validate the title on the server (1-100 chars) and show the error under the input.
- Disable the button while saving.
- After saving, the list shows the new todo without a full page reload.
- Only logged-in users can create todos.

You have \`db.todo.findMany({ userId })\`, \`db.todo.create(data)\` and \`getSession()\`.`,
      hints: [
        'A function marked `\'use server\'` can be passed to `<form action={...}>`.',
        'After writing to the DB, call `revalidatePath(\'/todos\')` so Next renders the page again with fresh data.',
        'React 19 `useActionState` gives you the returned state (errors) and a pending flag. (Next 14 used `useFormState` from react-dom.)',
      ],
      solution: `**Idea:** a **server action** is an async function that runs on the server but can be called from a form. It validates, writes, then calls \`revalidatePath\`. The client form uses \`useActionState\` to show errors and a pending state.

\`\`\`typescript
// app/todos/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Max 100 characters'),
});

export type FormState = { error?: string };

export async function createTodo(_prev: FormState, formData: FormData): Promise<FormState> {
  // 1. Auth: a server action is a public POST endpoint, always check
  const session = await getSession();
  if (!session) return { error: 'Please log in again' };

  // 2. Validate: never trust the browser
  const parsed = schema.safeParse({ title: formData.get('title') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // 3. Write
  await db.todo.create({ title: parsed.data.title, userId: session.userId });

  // 4. Throw away the cached /todos page so it re-renders with the new todo
  revalidatePath('/todos');
  return {};
}
\`\`\`

\`\`\`tsx
// app/todos/TodoForm.tsx
'use client';

import { useActionState } from 'react';
import { createTodo, type FormState } from './actions';

export function TodoForm() {
  // state = what the action returned last time, pending = true while it runs
  const [state, formAction, pending] = useActionState<FormState, FormData>(createTodo, {});

  return (
    <form action={formAction}>
      <input name="title" placeholder="What to do?" aria-describedby="title-error" />
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Add'}</button>
      {state.error && <p id="title-error" role="alert">{state.error}</p>}
    </form>
  );
}
\`\`\`

\`\`\`tsx
// app/todos/page.tsx (Server Component)
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { TodoForm } from './TodoForm';

export default async function TodosPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const todos = await db.todo.findMany({ userId: session.userId });

  return (
    <main>
      <TodoForm />
      <ul>{todos.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
    </main>
  );
}
\`\`\`

**Why it works:** the form posts to the action (Next creates a hidden endpoint for it). \`revalidatePath\` clears the server cache for \`/todos\`, and because it is called inside a server action, Next sends the fresh page back **in the same response**, so the list updates without a reload. The form even works before JavaScript loads (progressive enhancement).

**Edge cases:** React 19 resets uncontrolled form inputs after a form action finishes — nice on success, but on a validation error the typed text is gone. Return the submitted value in \`state\` and use it as \`defaultValue\` if you want to keep it. Also, the action's id is public — never skip the auth check because "the button is hidden".`,
      followUps: [
        {
          q: 'How would you show the new todo instantly, before the server responds?',
          a: 'Use React `useOptimistic` in a client list component: add a temporary todo when the form submits; it is replaced by the real list after `revalidatePath` returns.',
        },
        {
          q: 'revalidatePath vs revalidateTag?',
          a: '`revalidatePath` clears one route (or layout). `revalidateTag` clears every cached fetch that was tagged, across all pages that used it — better when the same data shows on many pages. In Next 16, server actions can also use `updateTag` for read-your-own-writes.',
        },
      ],
    },
    {
      id: 'use-client-boundary-mistakes',
      title: 'Debug a broken Server/Client Component boundary',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'server-vs-client-components',
      question: `This code has **four** problems. Some crash the build, some crash at runtime, one is a security risk. Find and fix them.

\`\`\`tsx
// lib/products.ts
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGODB_URI!);
export async function getProducts() {
  return client.db('shop').collection('products').find().toArray(); // docs have _id: ObjectId
}
export function formatPrice(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}
\`\`\`

\`\`\`tsx
// app/products/page.tsx  (Server Component)
import { getProducts } from '@/lib/products';
import ProductList from './ProductList';

export default async function Page() {
  const products = await getProducts();
  return <ProductList products={products} onSelect={(id) => console.log('selected', id)} />;
}
\`\`\`

\`\`\`tsx
// app/products/ProductList.tsx
'use client';
import { useState } from 'react';
import { formatPrice } from '@/lib/products';

export default async function ProductList({ products, onSelect }) {
  const [selected, setSelected] = useState(null);
  return products.map((p) => (
    <button key={p._id} onClick={() => { setSelected(p._id); onSelect(p._id); }}>
      {p.name} – {formatPrice(p.priceCents)}
    </button>
  ));
}
\`\`\``,
      hints: [
        'Props sent from a Server Component to a Client Component travel over the network. What cannot be turned into data?',
        'Look at the `import` in the client file. What else does that module bring into the browser bundle?',
        'Can a Client Component be an `async` function?',
      ],
      solution: `**The four problems:**

1. **Passing a function** (\`onSelect\`) from a Server to a Client Component. Props must be **serializable** (strings, numbers, plain objects, arrays, Dates…). Error: "Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'". Fix: define the handler inside the client component (or pass a server action if it must run on the server).
2. **MongoDB \`ObjectId\` is a class instance**, not a plain object, so it cannot be passed as a prop either ("Only plain objects can be passed to Client Components"). Fix: map documents to plain objects (\`_id.toString()\`).
3. **Client file imports \`lib/products.ts\`**, which imports \`mongodb\` and reads \`MONGODB_URI\`. The whole module goes into the browser bundle: the build fails on Node-only modules, and in the worst case secrets or DB code leak. Fix: move \`formatPrice\` to a pure util file and mark the DB file \`server-only\`.
4. **\`async\` Client Component.** Client Components cannot be async functions. Fix: remove \`async\` (data already comes in via props).

\`\`\`typescript
// lib/format.ts — pure, safe for both server and client
export function formatPrice(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}
\`\`\`

\`\`\`typescript
// lib/products.ts
import 'server-only'; // build error if a client component ever imports this file
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export type ProductDTO = { id: string; name: string; priceCents: number };

export async function getProducts(): Promise<ProductDTO[]> {
  const docs = await client.db('shop').collection('products').find().toArray();
  // DTO = Data Transfer Object: only the fields the UI needs, as plain values
  return docs.map((d) => ({ id: d._id.toString(), name: d.name, priceCents: d.priceCents }));
}
\`\`\`

\`\`\`tsx
// app/products/page.tsx (Server Component)
import { getProducts } from '@/lib/products';
import ProductList from './ProductList';

export default async function Page() {
  const products = await getProducts();
  return <ProductList products={products} />; // only plain data crosses the boundary
}
\`\`\`

\`\`\`tsx
// app/products/ProductList.tsx
'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import type { ProductDTO } from '@/lib/products'; // type-only import is erased, safe

export default function ProductList({ products }: { products: ProductDTO[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return products.map((p) => (
    <button
      key={p.id}
      aria-pressed={selected === p.id}
      onClick={() => {
        setSelected(p.id);
        console.log('selected', p.id); // handler lives on the client now
      }}
    >
      {p.name} – {formatPrice(p.priceCents)}
    </button>
  ));
}
\`\`\`

**Why it works:** the server/client line is a **network boundary**. Only serializable data goes across. Mapping to a DTO also stops you from accidentally sending private fields (like \`costPrice\` or a user's \`passwordHash\`) to the browser.`,
      followUps: [
        {
          q: 'If a layout has "use client" at the top, what happens to its children?',
          a: 'Every component it imports becomes client code. But Server Components passed in as `children` props stay Server Components. That is the pattern: keep "use client" on small leaf components.',
        },
        {
          q: 'How can a Client Component render a Server Component?',
          a: 'It cannot import one, but it can receive it as a prop (usually `children`) from a Server Component parent: `<ClientTabs><ServerStats /></ClientTabs>`.',
        },
      ],
    },
    {
      id: 'where-does-it-log',
      title: 'Where does each console.log print?',
      difficulty: 'medium',
      type: 'output',
      frequency: 'common',
      relatedTopic: 'server-vs-client-components',
      question: `A user opens \`/\` in the browser for the first time (a full page load, production build, page is dynamic). For each log **A-E**, say whether it prints in the **server terminal**, the **browser console**, or **both**.

\`\`\`tsx
// app/page.tsx (no "use client")
import Counter from './Counter';

export default async function Home() {
  console.log('A: Home render');
  return <Counter start={5} />;
}
\`\`\`

\`\`\`tsx
// app/Counter.tsx
'use client';
import { useEffect, useState } from 'react';

console.log('B: Counter module loaded');

export default function Counter({ start }: { start: number }) {
  const [n, setN] = useState(start);
  console.log('C: Counter render');

  useEffect(() => {
    console.log('D: Counter effect');
  }, []);

  return <button onClick={() => { console.log('E: clicked'); setN(n + 1); }}>{n}</button>;
}
\`\`\`

Then the user clicks the button once. What prints?`,
      hints: [
        'Server Components run only on the server. Their code is never sent to the browser.',
        '"use client" does NOT mean "only in the browser". Client components are also rendered to HTML on the server for the first load.',
        'Effects and event handlers never run during server rendering.',
      ],
      solution: `**Answer:**

\`\`\`text
A: Home render            -> server only
B: Counter module loaded  -> both (module is evaluated on the server for SSR, and again in the browser)
C: Counter render         -> both (SSR to HTML on the server, then render during hydration in the browser)
D: Counter effect         -> browser only (effects run after hydration)
E: clicked                -> browser only, after the click
\`\`\`

After the click the browser prints \`E: clicked\` and then \`C: Counter render\` again (state changed, so it re-renders). Nothing new prints on the server.

**Why:**
- **Server Components** (A) run on the server; the browser only receives their output (the RSC payload), never their code.
- **Client Components** (B, C) are rendered twice on a first load: once on the server to make fast HTML, once in the browser to **hydrate** (attach event handlers).
- \`useEffect\` and event handlers (D, E) are browser-only by design. That is why browser APIs like \`window\` and \`localStorage\` belong there.

**Edge cases:** in development React Strict Mode runs effects twice (mount, unmount, mount) and double-invokes renders, so you may see D and C twice in the browser. On a later **client-side navigation** to this page (via \`<Link>\`), the server runs A again to produce the RSC payload, but C is only rendered in the browser.`,
      followUps: [
        {
          q: 'So where should you put code that reads localStorage in a client component?',
          a: 'Inside `useEffect` (or an event handler). Reading it during render crashes on the server ("localStorage is not defined") or causes a hydration mismatch.',
        },
        {
          q: 'Does a secret used in a Server Component end up in the browser?',
          a: 'No. The code and env vars stay on the server. Only the rendered result and the props you pass to Client Components are sent — so do not pass secrets as props.',
        },
      ],
    },
    {
      id: 'stale-data-after-update',
      title: 'Data is still old after an update',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'caching-revalidation',
      question: `An admin edits a product price with this client component. The API call succeeds and the database has the new price, but \`/products\` (and the product page) still show the **old** price, even after a normal reload. The app runs Next.js 14.

\`\`\`tsx
// app/products/page.tsx (Server Component)
export default async function ProductsPage() {
  const products = await fetch('https://api.shop.com/products').then((r) => r.json());
  return <ProductTable products={products} />;
}
\`\`\`

\`\`\`tsx
// app/admin/EditPrice.tsx
'use client';
export function EditPrice({ id }: { id: string }) {
  async function save(formData: FormData) {
    await fetch(\`/api/products/\${id}\`, {
      method: 'PATCH',
      body: JSON.stringify({ price: Number(formData.get('price')) }),
    });
    alert('Saved!');
  }
  return <form action={save}><input name="price" /><button>Save</button></form>;
}
\`\`\`

Explain why the data is stale and fix it so that the new price shows right after saving, while keeping the product list cached for normal traffic.`,
      hints: [
        'In Next.js 14, what is the default cache behaviour of `fetch` in a Server Component? (It changed in 15.)',
        'Who tells the cache that the product data is now old?',
        'Tag the fetch, and invalidate the tag after the write — preferably from a server action.',
      ],
      solution: `**Why it is stale:** in **Next.js 14**, \`fetch\` in a Server Component is cached by default (\`force-cache\`) in the **Data Cache**, and the page itself is pre-rendered once into the **Full Route Cache**. The PATCH changes the database but nothing tells Next that the cached result is old, so every visitor keeps getting the build-time price. (In **Next.js 15+** \`fetch\` is not cached by default, but the page can still be statically rendered at build time — so you can hit the same bug. Being explicit avoids surprises in every version.)

**Idea:** cache on purpose with a **tag**, and invalidate that tag right after the write.

\`\`\`tsx
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await fetch('https://api.shop.com/products', {
    cache: 'force-cache',                 // explicit: cached in 14, 15 and 16
    next: { tags: ['products'] },         // label this cached data
  }).then((r) => r.json());
  return <ProductTable products={products} />;
}
\`\`\`

\`\`\`typescript
// app/admin/actions.ts
'use server';

import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function updatePrice(id: string, formData: FormData) {
  await requireAdmin();                                   // server actions are public endpoints
  const price = Number(formData.get('price'));
  if (!Number.isFinite(price) || price <= 0) return { error: 'Invalid price' };

  const res = await fetch(\`https://api.shop.com/products/\${id}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price }),
  });
  if (!res.ok) return { error: 'Save failed' };

  revalidateTag('products'); // Next 14/15. In Next 16: revalidateTag('products', 'max') or updateTag('products')
  return { ok: true };
}
\`\`\`

\`\`\`tsx
// app/admin/EditPrice.tsx
'use client';
import { updatePrice } from './actions';

export function EditPrice({ id }: { id: string }) {
  const save = updatePrice.bind(null, id); // pre-fill the id argument
  return (
    <form action={save}>
      <input name="price" type="number" step="0.01" />
      <button>Save</button>
    </form>
  );
}
\`\`\`

**Why it works:** \`revalidateTag('products')\` marks every cached fetch with that tag as stale, on **every page** that used it (list page, product page, home page). The next request fetches fresh data. Because it runs inside a server action, the admin's own browser Router Cache is refreshed in the same response too.

**Other valid fixes:**
- Keep the API route, but call \`revalidateTag\` **inside the route handler** after the DB write, then call \`router.refresh()\` in the client to refresh the current view.
- \`revalidatePath('/products')\` if only one page shows the data.
- \`cache: 'no-store'\` if the page really must always be live — but then every visit hits the API.`,
      followUps: [
        {
          q: 'What does router.refresh() do, and why is it not enough alone?',
          a: 'It re-fetches the current route from the server and updates the client without losing client state. But if the server still has a cached result, it just gets the same stale data. It refreshes the browser Router Cache, not the server Data Cache.',
        },
        {
          q: 'The data comes from MongoDB directly, not fetch. How do you tag it?',
          a: 'Wrap the query in `unstable_cache(fn, keyParts, { tags: [\'products\'] })` (Next 14/15), or in Next 16 with Cache Components use a `\'use cache\'` function with `cacheTag(\'products\')`.',
        },
      ],
    },
    {
      id: 'fix-data-fetching-waterfall',
      title: 'Fix a slow page caused by a request waterfall',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'data-fetching',
      question: `This dashboard takes about **3 seconds** to show anything. Each API call takes ~1 second, and none depends on another.

\`\`\`tsx
// app/dashboard/page.tsx
export default async function Dashboard() {
  const user = await getUser();            // 1s
  const orders = await getOrders();        // 1s
  const recommendations = await getRecs(); // 1s (slow, least important)

  return (
    <>
      <Header user={user} />
      <Orders orders={orders} />
      <Recommendations items={recommendations} />
    </>
  );
}
\`\`\`

1. Make the total wait ~1 second.
2. Then make the header and orders appear **before** the recommendations are ready.`,
      hints: [
        'Each `await` waits for the previous one to finish. Can you start all three at once?',
        'For step 2: move the slow fetch into its own async Server Component and wrap it in `<Suspense>`.',
      ],
      solution: `**Idea:** a **waterfall** = requests that run one after another although they could run together. Start independent requests in parallel with \`Promise.all\`, then **stream** the slow, less important part with Suspense.

**Step 1 — parallel:**

\`\`\`tsx
export default async function Dashboard() {
  // All three start immediately; total time = the slowest one (~1s)
  const [user, orders, recommendations] = await Promise.all([getUser(), getOrders(), getRecs()]);
  return (
    <>
      <Header user={user} />
      <Orders orders={orders} />
      <Recommendations items={recommendations} />
    </>
  );
}
\`\`\`

**Step 2 — parallel + streaming:**

\`\`\`tsx
import { Suspense } from 'react';

export default async function Dashboard() {
  const [user, orders] = await Promise.all([getUser(), getOrders()]);

  return (
    <>
      <Header user={user} />
      <Orders orders={orders} />
      {/* The page is sent without waiting for this. The fallback shows first,
          then the real HTML is streamed in when getRecs() resolves. */}
      <Suspense fallback={<p>Loading recommendations…</p>}>
        <RecommendationsSection />
      </Suspense>
    </>
  );
}

// An async Server Component that fetches its own data
async function RecommendationsSection() {
  const items = await getRecs();
  return <Recommendations items={items} />;
}
\`\`\`

**Why it works:** \`Promise.all\` starts all promises before awaiting, so the waits overlap. With Suspense, Next sends the HTML in chunks: the shell and important parts first, the slow part later in the same response. The user sees content faster, even though the total work is the same.

**Edge cases:**
- \`Promise.all\` fails fast: if \`getRecs\` throws, the whole page fails. Streaming it in its own Suspense boundary (with an \`error.tsx\` or an error boundary around it) isolates the failure.
- If one call **does** depend on another (orders need \`user.id\`), it must stay sequential — but you can still start unrelated calls in parallel.`,
      followUps: [
        {
          q: 'Promise.all vs Promise.allSettled here?',
          a: '`allSettled` never rejects; you get each result or error and can render a partial page. Use it when some sections are optional.',
        },
        {
          q: 'Why is "fetch in a client useEffect" often slower than this?',
          a: 'The browser must download JS, hydrate, then start requests — and nested components often create client-side waterfalls. Server fetching starts immediately, close to the data.',
        },
      ],
    },
    {
      id: 'stripe-webhook-route-handler',
      title: 'Handle a Stripe webhook in a route handler',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'api-routes-route-handlers',
      question: `After Stripe Checkout, Stripe sends a \`checkout.session.completed\` webhook (an HTTP POST from Stripe to your server). Write \`app/api/webhooks/stripe/route.ts\` that:

1. **Verifies** the request really came from Stripe (signature check).
2. Marks the order as paid using \`session.metadata.orderId\`.
3. Is **idempotent**: Stripe may send the same event more than once. Processing it twice must not double-ship the order.
4. Responds fast with the correct status codes.
5. Refreshes the cached \`/orders\` data.

What is the most common bug people hit with webhook signature checks in Next.js?`,
      hints: [
        'Stripe signs the **raw** request body. If you parse JSON first and re-stringify it, the bytes change and the signature fails.',
        'Use `await request.text()` and `stripe.webhooks.constructEvent(rawBody, signature, secret)`.',
        'Store processed event ids (unique index) or make the DB update conditional (`status: "pending"` → `"paid"`).',
      ],
      solution: `**Idea:** read the **raw body**, verify the signature, ignore duplicates, update the order with a conditional write, then return \`200\` quickly.

\`\`\`typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

export const runtime = 'nodejs'; // Stripe SDK + DB driver need Node.js, not Edge

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  // 1. RAW body. Do NOT call request.json() — the signature is over the exact bytes.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    // Bad signature -> 400. A forged request gets nothing. (A real event failing here means a wrong secret.)
    return new Response(\`Webhook error: \${(err as Error).message}\`, { status: 400 });
  }

  // 2. Idempotency: record the event id. A unique index on eventId makes a 2nd insert fail.
  const isNew = await db.webhookEvents.insertIfAbsent({ eventId: event.id, type: event.type });
  if (!isNew) return Response.json({ received: true, duplicate: true }); // already handled

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId && session.payment_status === 'paid') {
        // 3. Conditional update: only pending -> paid. Safe even if two copies race.
        await db.orders.updateOne(
          { _id: orderId, status: 'pending' },
          { $set: { status: 'paid', paidAt: new Date(), stripeSessionId: session.id } },
        );
        revalidateTag('orders'); // Next 16: revalidateTag('orders', 'max')
      }
    }
    // Other event types: acknowledge and ignore
    return Response.json({ received: true });
  } catch (err) {
    // Our own failure: forget the event id so Stripe's retry can process it again
    await db.webhookEvents.delete({ eventId: event.id });
    console.error('Stripe webhook failed', event.id, err);
    return new Response('Server error', { status: 500 }); // 5xx -> Stripe retries later
  }
}
\`\`\`

**Why it works:**
- \`constructEvent\` recomputes the HMAC signature from the raw body + your webhook secret. Only Stripe knows the secret, so fakes are rejected.
- Two layers of idempotency: the unique \`eventId\` record skips duplicates, and the \`status: 'pending'\` filter makes the update a no-op if the order is already paid.
- **Status codes:** \`2xx\` = done. Any other status counts as a failure and Stripe retries with backoff (for up to about 3 days in live mode). Use \`400\` for bad signatures and \`500\` for your own errors, so the logs show which side failed.

**Most common bug:** calling \`await request.json()\` (or using Pages Router API routes without disabling the body parser), then passing \`JSON.stringify(body)\` to \`constructEvent\`. The bytes differ (spacing, key order), so every event fails with "No signatures found matching the expected signature".

**Edge cases:** do slow work (emails, PDF invoices) in a background job, not inside the webhook — Stripe expects a fast response. Webhook events can arrive **out of order**; read the current state from Stripe or your DB instead of trusting order. Middleware must not block this path (no auth cookie on Stripe's request).`,
      followUps: [
        {
          q: 'Why not just mark the order paid on the Checkout success page redirect?',
          a: 'The user may close the tab before the redirect, and anyone can open the success URL by hand. The webhook is the server-to-server source of truth; the success page should only read the status.',
        },
        {
          q: 'How do you test this locally?',
          a: 'Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. It prints a temporary webhook secret, and `stripe trigger checkout.session.completed` sends a test event.',
        },
      ],
    },
    {
      id: 'slow-ttfb-scenario',
      title: 'Product page has a 2.5 second TTFB — what do you do?',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'static-vs-dynamic-rendering',
      question: `Your Next.js product page (\`/products/[id]\`) has a **TTFB** (Time To First Byte) of about 2.5 seconds in production. Marketing wants it under 300 ms. The page:

- reads \`cookies()\` to show "Hi, Adarsh" and the cart count in the header,
- fetches the product from an API with \`cache: 'no-store'\`,
- fetches reviews (slow, ~1.2 s) and then related products (~0.8 s) one after the other,
- runs on serverless functions in \`us-east-1\`, while the MongoDB cluster is in \`ap-south-1\` (Mumbai).

Walk through how you would **find** the cause and **fix** it.`,
      hints: [
        'Measure first: which part of the 2.5 s is waiting for data, and which is cold start or network distance?',
        'One `cookies()` call makes the whole route dynamic, so nothing on the page can be served from the static cache.',
        'Split the page: cached, shared product content vs per-user bits vs slow optional bits.',
      ],
      solution: `**Idea:** measure, then make the expensive shared part **static/cached**, push per-user and slow parts out of the critical path (client or streamed), and put the server next to the database.

**1. Measure (do not guess)**
- Look at the build output: is the route marked **dynamic (ƒ)** or **static (○)**?
- Add timing logs or OpenTelemetry spans around each fetch. Check platform logs for **cold starts** (first request to a sleeping serverless function).
- Compare TTFB from different regions.

**2. Likely causes here**
- \`cookies()\` makes the **whole route dynamic** → rendered on every request, no Full Route Cache.
- \`cache: 'no-store'\` on product data that changes rarely → API hit on every visit.
- **Waterfall**: reviews (1.2 s) then related (0.8 s) = 2 s of waiting in series.
- **Region mismatch**: every DB round trip goes US ↔ India (~200+ ms each).

**3. Fixes**

\`\`\`tsx
// app/products/[id]/page.tsx
import { Suspense } from 'react';

export const revalidate = 300; // product content is ISR: same HTML for every visitor

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetch(\`https://api.shop.com/products/\${id}\`, {
    next: { revalidate: 300, tags: [\`product-\${id}\`] }, // cached + revalidated on change
  }).then((r) => r.json());

  return (
    <main>
      <ProductDetails product={product} />
      {/* slow, below the fold: streamed, NOT blocking the first byte of the shell */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={id} />
      </Suspense>
      <Suspense fallback={<RelatedSkeleton />}>
        <Related productId={id} />
      </Suspense>
    </main>
  );
}
\`\`\`

- **Remove \`cookies()\` from the page.** Render the greeting and cart count in a small client component that calls \`/api/me\` after load (or, on Next 15+ with Partial Prerendering / Next 16 Cache Components, put the personalized part in a dynamic hole inside Suspense while the rest stays static).
- **Cache the product** with ISR + tag; call \`revalidateTag\` from the admin/webhook when it changes.
- **Parallel + stream** reviews and related products, each in its own Suspense boundary (or cache them too — reviews rarely need to be live to the second).
- **Co-locate** the function region with the database (deploy functions to \`ap-south-1\`, or add a read replica near users). Reuse the DB connection across invocations (create the client outside the handler).
- \`generateStaticParams\` for the top-selling products so they are built before the first visitor.

**Result:** the shell comes from the cache/CDN (tens of ms TTFB). Personal data and reviews fill in afterwards.

**Trade-offs to mention:** ISR means the price can be stale for up to 5 minutes unless you revalidate on change — for prices, always revalidate on change, and re-check the price on the server at checkout.`,
      followUps: [
        {
          q: 'Would moving to the Edge runtime fix it?',
          a: 'Not by itself. Edge runs close to the user, but if every request still goes to a database in Mumbai, you just moved the waiting. Edge helps when data is also at the edge or cached.',
        },
        {
          q: 'How do you check if a route is static or dynamic?',
          a: 'Run `next build`: the route table marks static (○), SSG (●) and dynamic (ƒ) routes. You can also set `export const dynamic = \'error\'` to make the build fail if something makes the route dynamic.',
        },
      ],
    },
    {
      id: 'seo-for-product-pages',
      title: 'Design SEO for 100k product pages',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'metadata-seo',
      question: `An e-commerce site has **100,000 products** at \`/products/[slug]\`. Product pages get almost no Google traffic. Design the SEO setup in the App Router:

- titles, descriptions and social preview cards,
- telling Google about all pages,
- rich results (price and stars in search results),
- duplicate URLs (\`/products/shoe?color=red\`, \`/products/shoe?utm_source=x\`),
- out-of-stock and deleted products.

Show the key code.`,
      hints: [
        'Google needs real HTML with content. How is each page rendered?',
        'Next.js has file conventions for `sitemap.ts` and `robots.ts`. One sitemap file can hold at most 50,000 URLs.',
        'Rich results come from JSON-LD (structured data in a `<script type="application/ld+json">`).',
      ],
      solution: `**Idea:** server-render (ISR) every product with unique metadata, tell Google where pages are (sitemaps), describe the product in structured data, point duplicates at one **canonical** URL, and return correct status codes.

**1. Rendering + metadata**

\`\`\`tsx
// app/products/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/products'; // wrapped in React cache()

export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: \`\${p.name} – Buy online | MyShop\`,
    description: p.shortDescription.slice(0, 155),
    alternates: { canonical: \`/products/\${p.slug}\` }, // ignores ?color= and ?utm_ params
    openGraph: { title: p.name, description: p.shortDescription, images: [p.images[0]] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound(); // real 404 for deleted products

  // Structured data for rich results (price, stock, rating)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.images,
    description: p.shortDescription,
    sku: p.sku,
    offers: {
      '@type': 'Offer',
      price: p.price.toFixed(2),
      priceCurrency: 'INR',
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: \`https://myshop.com/products/\${p.slug}\`,
    },
    ...(p.reviewCount > 0 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewCount },
    }),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // escape "<" so a product name cannot close the script tag (XSS)
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <h1>{p.name}</h1>
      {/* real text content, images with alt text, breadcrumbs, internal links to categories */}
    </main>
  );
}
\`\`\`

**2. Sitemaps (split, because one file holds max 50,000 URLs)**

\`\`\`typescript
// app/products/sitemap.ts -> served at /products/sitemap/0.xml, /products/sitemap/1.xml ...
import type { MetadataRoute } from 'next';
import { countProducts, getProductSlugs } from '@/lib/products';

const PER_FILE = 50_000;

export async function generateSitemaps() {
  const total = await countProducts();
  return Array.from({ length: Math.ceil(total / PER_FILE) }, (_, id) => ({ id }));
}

// In Next 16 "id" arrives as a Promise; in 14/15 it is a number. await works for both.
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const page = Number(await id);
  const products = await getProductSlugs({ skip: page * PER_FILE, limit: PER_FILE });
  return products.map((p) => ({
    url: \`https://myshop.com/products/\${p.slug}\`,
    lastModified: p.updatedAt,
  }));
}
\`\`\`

\`\`\`typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/cart', '/checkout', '/api/'] },
    sitemap: [
      'https://myshop.com/products/sitemap/0.xml',
      'https://myshop.com/products/sitemap/1.xml', // list each file (or build the list from the count)
    ],
  };
}
\`\`\`

**3. Status rules**
- **Out of stock:** keep the page (200), mark \`OutOfStock\` in JSON-LD, show alternatives. Removing it loses ranking.
- **Deleted forever:** 404 (or a **301 permanent redirect** to the replacement/category via \`permanentRedirect()\` or \`next.config\` redirects).
- **Slug changed:** 301 from the old slug.

**Why it works:** Google gets fast, complete HTML; each URL has a unique title; duplicates collapse to one canonical URL so ranking is not split; sitemaps help discovery of 100k pages; JSON-LD unlocks price/stock/star snippets.

**Pitfalls:** content loaded only on the client (Google may not wait), the same title on every page, canonical tags pointing to the wrong place, and slow pages (Core Web Vitals are a ranking signal).`,
      followUps: [
        {
          q: 'Faceted filters create millions of URLs (/shoes?size=9&color=red). How do you handle them?',
          a: 'Canonical to the main category for most combinations, add `robots: { index: false }` to low-value filter pages, and only create real indexable pages for filters people actually search for (e.g. /shoes/red).',
        },
        {
          q: 'How do you verify it works?',
          a: 'Google Search Console (coverage, sitemaps, rich results report), the Rich Results Test for the JSON-LD, and View Source to confirm the content is in the server HTML.',
        },
      ],
    },
    {
      id: 'auth-in-app-router-design',
      title: 'Design authentication for an App Router app',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'authentication',
      question: `Design login and authorization for a SaaS dashboard built with the App Router. Roles: \`member\` and \`admin\`. Admin pages live under \`/admin\`.

Answer:
1. Where is the session stored, and how?
2. Where exactly do you check auth (middleware, layouts, pages, server actions, route handlers)? Why not just in one place?
3. Show a reusable helper for checking the session and role, and use it in a page and a server action.
4. How do you log out?`,
      hints: [
        'Layouts do not re-render on every navigation between their child pages, so an auth check only in a layout can be skipped.',
        'Server actions and route handlers are public HTTP endpoints — anyone can call them with curl.',
        'Centralize checks in a Data Access Layer (DAL): a `verifySession()` helper wrapped in React `cache()`.',
      ],
      solution: `**Idea:** **defence in depth**. A fast optimistic check in middleware for good UX, and a **real** check next to every piece of data and every mutation, through one shared helper.

**1. Session storage**
- After login, store a session id (database sessions) or a signed/encrypted JWT in a cookie: \`httpOnly\` (JS cannot read it, so XSS cannot steal it), \`secure\`, \`sameSite: 'lax'\`, with an expiry.
- Libraries such as Auth.js (NextAuth), Clerk, Lucia-style DB sessions or iron-session do this for you.

**2. Where to check**
- **Middleware / proxy:** optimistic redirect if there is no cookie (fast, no DB). Not trusted alone.
- **Data Access Layer (DAL):** every function that reads private data calls \`verifySession()\`. This is the real gate.
- **Server actions and route handlers:** check session **and** role inside each one, because they can be called directly.
- **Pages:** call the helper, redirect if needed. **Do not** rely only on \`layout.tsx\`: layouts are not re-run on client-side navigation between sibling pages, and a page's data can be fetched without the layout.

**3. The helper**

\`\`\`typescript
// lib/dal.ts
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session'; // verifies the JWT / looks up the DB session
import { db } from '@/lib/db';

export type Session = { userId: string; role: 'member' | 'admin' };

// cache(): many components can call this in one request; it runs once
export const verifySession = cache(async (): Promise<Session> => {
  const token = (await cookies()).get('session')?.value; // cookies() is async in Next 15+
  const session = token ? await decrypt(token) : null;
  if (!session) redirect('/login');
  return session;
});

export async function requireAdmin(): Promise<Session> {
  const session = await verifySession();
  if (session.role !== 'admin') redirect('/forbidden'); // or throw / return 403 in an API
  return session;
}

// Data functions check auth themselves and return only safe fields (DTO)
export const getTeamBilling = cache(async () => {
  const session = await requireAdmin();
  return db.billing.findForUser(session.userId, { select: { plan: true, seats: true } });
});
\`\`\`

\`\`\`tsx
// app/admin/billing/page.tsx
import { getTeamBilling } from '@/lib/dal';

export default async function BillingPage() {
  const billing = await getTeamBilling(); // redirects if not admin
  return <p>Plan: {billing.plan} ({billing.seats} seats)</p>;
}
\`\`\`

\`\`\`typescript
// app/admin/actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/dal';
import { db } from '@/lib/db';

export async function removeMember(memberId: string) {
  const admin = await requireAdmin();                 // checked HERE, not just on the page
  await db.members.remove({ id: memberId, teamOwnerId: admin.userId }); // scope by owner too
  revalidatePath('/admin/members');
}
\`\`\`

**4. Logout**

\`\`\`typescript
'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export async function logout() {
  const store = await cookies();
  const token = store.get('session')?.value;
  if (token) await db.sessions.delete({ token }); // DB sessions: revoke on the server too
  store.delete('session');
  redirect('/login');
}
\`\`\`

**Why it works:** even if middleware is misconfigured or bypassed, no private data and no mutation is reachable without passing \`verifySession\`. \`cache()\` keeps it cheap. \`server-only\` keeps the DAL out of client bundles.

**Trade-offs:** stateless JWTs are fast but hard to revoke immediately (use short expiry + refresh, or a deny-list). Database sessions are easy to revoke but need a lookup per request.`,
      followUps: [
        {
          q: 'How does a client component know who is logged in?',
          a: 'Read the session in a Server Component (layout) and pass only safe fields (name, role) as props or via a small context provider. Never ship the token itself to client JS.',
        },
        {
          q: 'Hiding the "Delete" button for members — is that authorization?',
          a: 'No, that is only UX. The server action must still check the role, because anyone can call it directly.',
        },
      ],
    },
  ],
};
