// Next.js — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.
// Note: Next.js changes fast (especially caching defaults). Topics say clearly when something differs by version.

export default {
  id: 'nextjs',
  title: 'Next.js',
  icon: '▲',
  description: 'The React framework for full-stack apps. Rendering strategies and routing first, then server components, data fetching, server actions, caching, auth and deployment.',
  definitionTitle: 'What is Next.js?',
  definition: `**Next.js** is a **React framework** made by Vercel. React only builds UI. Next.js adds everything else a real website needs: **routing** from folders, **server-side rendering** (building the HTML on the server for speed and SEO), static pages, API endpoints, image and font optimisation, and easy deployment.

So you still write React components, but Next.js decides **where and when** they render — on the server, at build time, or in the browser.

**One-line answer:** "Next.js is a full-stack React framework that adds file-based routing, server-side and static rendering, API routes and built-in optimisations on top of React."`,
  topics: [
    {
      id: 'what-is-nextjs',
      title: 'What is Next.js and Why Use It',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A React framework that adds routing, server rendering, data fetching, API endpoints and build optimizations on top of React.',
      what: `**React** is a library for building UI components. It does not decide how you route pages, fetch data on the server, or build for production.

**Next.js** is a **framework** built on React. It gives you those missing pieces out of the box:
- **File-based routing**: a file in a folder becomes a page (a URL).
- **Server rendering**: HTML can be built on the server, so the user sees content fast and Google can read it.
- **Backend code**: you can write API endpoints and server-only logic in the same project.
- **Optimizations**: image, font and script optimization, code splitting, and caching.

#### Deeper version
Next.js has two routing systems: the older **Pages Router** (\`pages/\` folder) and the newer **App Router** (\`app/\` folder), which is built on **React Server Components**. The App Router is the recommended choice for new apps. Under the hood, Next.js uses a compiler/bundler (Webpack, and now **Turbopack** in newer versions) and runs your server code on Node.js or on the lighter **Edge runtime**. A plain React app made with Vite is a **Single Page App (SPA)**: the server sends an almost empty HTML file and JavaScript builds everything in the browser. Next.js lets you choose, per page, where and when the HTML is built.`,
      why: `With a plain React SPA you must add a router, set up SSR yourself if you need SEO, build a separate Node/Express API, and tune bundles by hand. Next.js solves these with conventions:
- **Better SEO and first load**: the browser gets real HTML, not an empty \`<div id="root">\`.
- **Less setup**: routing, bundling, TypeScript and CSS support are built in.
- **Full stack in one repo**: UI, API routes and server logic live together and share types.
- **Performance by default**: automatic code splitting per route, image and font optimization.`,
      analogy: `React is a box of high-quality LEGO bricks. You can build anything, but you must design the plan yourself. Next.js is a LEGO **kit** with instructions, a base plate, and pre-built parts for the hard pieces (routing, server rendering, images). You still use the same bricks, but you finish faster and with fewer mistakes.`,
      code: [
        {
          title: 'Create an app and see the structure',
          lang: 'bash',
          code: `# Create a new Next.js app (asks about TypeScript, ESLint, Tailwind, App Router)
npx create-next-app@latest my-app
cd my-app
npm run dev        # dev server on http://localhost:3000

# Typical App Router structure:
# app/
#   layout.tsx      -> shared shell (html, body, navbar)
#   page.tsx        -> the "/" page
#   about/page.tsx  -> the "/about" page
#   api/hello/route.ts -> an API endpoint at /api/hello`,
        },
        {
          title: 'Your first page is just a React component',
          lang: 'tsx',
          code: `// app/page.tsx  -> rendered at "/"
export default async function HomePage() {
  // This runs on the SERVER by default (a Server Component),
  // so we can fetch data directly without useEffect.
  const res = await fetch('https://api.github.com/repos/vercel/next.js');
  const repo = await res.json();

  return (
    <main>
      <h1>Hello Next.js</h1>
      <p>Stars: {repo.stargazers_count}</p>
    </main>
  );
}`,
        },
      ],
      output: `Running \`npm run dev\` starts the dev server. Visiting \`/\` renders \`app/page.tsx\`. Because it is a **Server Component**, the fetch happens on the server and the browser receives HTML that already contains the star count. If you "View Source" in the browser, you see the number in the HTML — that is what makes it good for SEO. No \`useEffect\`, no loading spinner, no API key exposed in the browser.`,
      questions: [
        {
          q: 'What is the difference between React and Next.js?',
          a: 'React is a UI library. Next.js is a framework on top of React that adds routing, server rendering, data fetching, API endpoints and production optimizations.',
        },
        {
          q: 'Why would you choose Next.js over a plain React (Vite) app?',
          a: 'When you need SEO, fast first load, server-side logic, or a full-stack app in one repo. For an internal dashboard behind a login, a plain SPA can be enough.',
        },
        {
          q: 'What is the difference between the Pages Router and the App Router?',
          a: 'The Pages Router uses the `pages/` folder with `getServerSideProps`/`getStaticProps`. The App Router uses the `app/` folder, React Server Components, nested layouts, streaming and server actions. The App Router is recommended for new projects.',
        },
        {
          q: 'Is Next.js frontend or backend?',
          a: 'Both. It renders React UI, and it can run server code: route handlers, server actions, middleware and server components. For heavy backends many teams still keep a separate service.',
        },
      ],
      spoken: `"Next.js is a React framework. React only gives me components, but Next.js adds file-based routing, server-side rendering, static generation, API endpoints and built-in optimizations for images, fonts and code splitting. The main reasons I pick it are SEO and fast first load, because the browser gets real HTML, and the full-stack experience, because I can write server logic in the same repo. For new projects I use the App Router, which is built on React Server Components, so data fetching happens on the server by default and less JavaScript goes to the browser."`,
      mistakes: [
        'Saying Next.js "replaces" React. It is built on React; you still write React components.',
        'Thinking every Next.js page is server-rendered on every request. Next.js supports static, dynamic, incremental and client rendering — you choose per route.',
        'Mixing Pages Router and App Router ideas, like using `getServerSideProps` inside the `app/` folder. It does not work there.',
        'Follow-up trap: "When would you NOT use Next.js?" A small internal tool or dashboard behind login with no SEO needs may be simpler as a Vite SPA, or when the team needs a different backend framework.',
      ],
      takeaway: 'Next.js is React plus routing, server rendering, backend code and optimizations — a full-stack framework, not a replacement for React.',
    },
    {
      id: 'rendering-strategies',
      title: 'SSR vs SSG vs ISR vs CSR',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Four ways to build a page: on every request (SSR), at build time (SSG), at build time with timed refresh (ISR), or in the browser (CSR).',
      what: `The big question is: **where and when is the HTML built?**

- **CSR (Client-Side Rendering)**: the server sends an almost empty page. JavaScript in the browser fetches data and builds the UI. (Classic React SPA.)
- **SSR (Server-Side Rendering)**: the server builds fresh HTML **on every request**.
- **SSG (Static Site Generation)**: HTML is built **once at build time** (\`next build\`) and served as a file. Very fast.
- **ISR (Incremental Static Regeneration)**: like SSG, but the page is **re-built in the background** after a set time (for example every 60 seconds), without a full redeploy.

#### Deeper version
ISR uses **stale-while-revalidate**: after the timer runs out, the next visitor still gets the old (stale) page instantly, and Next.js rebuilds the page in the background. Later visitors get the new one. There is also **on-demand revalidation**: you call \`revalidatePath\` or \`revalidateTag\` (App Router) or \`res.revalidate()\` (Pages Router) when data changes, for example from a CMS webhook.

In the **App Router** you do not pick these by function name. A route is **static** by default and becomes **dynamic** (SSR) when it uses request data like \`cookies()\`, \`headers()\`, \`searchParams\`, or uncached fetches. You make it ISR with \`export const revalidate = 60\` or \`fetch(url, { next: { revalidate: 60 } })\`. All server-rendered pages are then **hydrated** in the browser: React attaches event handlers to the HTML so it becomes interactive.`,
      why: `Different pages have different needs:
- **Marketing page, blog post, docs** -> SSG: fastest, cheap, served from a CDN.
- **Product page with prices that change sometimes** -> ISR: fast like static, but stays fairly fresh.
- **User dashboard, cart, search results** -> SSR: must be fresh and personal per request.
- **Highly interactive widget after login (charts, editors)** -> CSR: SEO does not matter, data changes all the time.
Choosing the right one balances **speed, freshness, server cost and SEO**.`,
      analogy: `Think of a bakery:
- **SSG**: bread baked early in the morning. Customers grab it instantly, but it is the same for everyone.
- **ISR**: bread baked in the morning, and every hour the baker quietly bakes a fresh batch to replace it.
- **SSR**: a sandwich made to order for each customer. Fresh and personal, but you wait a bit.
- **CSR**: the bakery gives you the ingredients and a recipe, and you make it at your own table.`,
      code: [
        {
          title: 'App Router: static, ISR and dynamic pages',
          lang: 'tsx',
          code: `// app/about/page.tsx -> SSG: no request data, built at build time
export default function About() {
  return <h1>About us</h1>;
}

// app/products/page.tsx -> ISR: rebuild at most every 60 seconds
export const revalidate = 60;
export default async function Products() {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();
  return <ul>{products.map((p: { id: string; name: string }) => <li key={p.id}>{p.name}</li>)}</ul>;
}

// app/dashboard/page.tsx -> SSR: uses cookies, so it renders per request
import { cookies } from 'next/headers';
export default async function Dashboard() {
  const cookieStore = await cookies(); // async in Next 15+, sync in Next 14
  const theme = cookieStore.get('theme')?.value ?? 'light';
  return <h1>Dashboard ({theme} theme)</h1>;
}`,
        },
        {
          title: 'Pages Router: the same ideas with special functions',
          lang: 'tsx',
          code: `// pages/blog.tsx
// SSG + ISR: runs at build time, then again at most every 60s
export async function getStaticProps() {
  const posts = await fetch('https://api.example.com/posts').then((r) => r.json());
  return { props: { posts }, revalidate: 60 }; // remove "revalidate" for pure SSG
}

// For SSR you would export getServerSideProps instead (runs on every request):
// export async function getServerSideProps(context) { ... }

export default function Blog({ posts }: { posts: { id: string; title: string }[] }) {
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}`,
        },
        {
          title: 'CSR: fetch in the browser (Client Component)',
          lang: 'tsx',
          code: `'use client';
import { useEffect, useState } from 'react';

export default function LivePrice() {
  const [price, setPrice] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/price').then((r) => r.json()).then((d) => setPrice(d.price));
  }, []);
  return <p>{price === null ? 'Loading...' : \`Price: $\${price}\`}</p>;
}`,
        },
      ],
      output: `- \`/about\` is built once during \`next build\`. Every visitor gets the same HTML file from the cache or CDN.
- \`/products\` is built at build time too. After 60 seconds, the next visitor still gets the old page, and Next.js rebuilds it in the background. The visitor after that gets the fresh list.
- \`/dashboard\` reads cookies, so Next.js cannot know the HTML in advance. It renders on every request.
- \`LivePrice\` sends "Loading..." in the HTML, then the browser fetches the price and updates the UI. A search engine may only see "Loading...".

In the \`next build\` output, Next.js marks each route as static or dynamic (the exact symbols and labels vary by version).`,
      questions: [
        {
          q: 'What is the difference between SSR and SSG?',
          a: 'SSR builds the HTML on every request, so it is always fresh but costs server time. SSG builds the HTML once at build time, so it is very fast and CDN-friendly but can be stale.',
        },
        {
          q: 'What is ISR and how does it work?',
          a: 'Incremental Static Regeneration. The page is static, but after a revalidate time the next request triggers a background rebuild. That visitor still gets the stale page; later visitors get the new one (stale-while-revalidate).',
        },
        {
          q: 'How do you make a page SSR in the App Router?',
          a: 'Use request-time data such as `cookies()`, `headers()` or `searchParams`, fetch with `cache: \'no-store\'`, or set `export const dynamic = \'force-dynamic\'`. There is no `getServerSideProps` in the App Router.',
        },
        {
          q: 'Which strategy would you use for an e-commerce product page?',
          a: 'Usually ISR or static with on-demand revalidation: fast like static and good for SEO, and you call `revalidateTag`/`revalidatePath` when the product changes. Stock and cart are fetched dynamically or on the client.',
        },
        {
          q: 'Does SSR mean no JavaScript is sent to the browser?',
          a: 'No. With SSR the HTML comes from the server, but the JavaScript for interactive parts is still sent and the page is hydrated. Server Components reduce this JavaScript, but Client Components still ship JS.',
        },
      ],
      spoken: `"The difference is where and when the HTML is built. With CSR the browser builds it with JavaScript, which is fine for dashboards but weak for SEO. With SSR the server builds fresh HTML on every request, which is good for personalized or always-fresh pages. With SSG the HTML is built once at build time, so it's super fast and served from a CDN. ISR is SSG plus a revalidate timer or on-demand revalidation, so static pages stay fresh without a redeploy. In the App Router, routes are static by default and become dynamic when I use cookies, headers or uncached data."`,
      mistakes: [
        'Thinking ISR updates the page exactly at the timer. It only rebuilds when a request comes after the timer, and that request still gets the stale page.',
        'Using SSR for everything "to be safe". It costs server time and is slower than static. Prefer static or ISR when data does not need to be per-request.',
        'Putting user-specific data in an SSG/ISR page. Every visitor would get the same cached HTML — a privacy bug.',
        'Follow-up trap: "Can one app use all four?" Yes. Next.js decides per route (and even per component or fetch in the App Router).',
        'Follow-up trap: "Is the App Router static by default?" Routes are static unless they use dynamic data, but the fetch caching default changed in Next 15 — always check the build output and your version docs.',
      ],
      takeaway: 'Pick per page: SSG for static content, ISR for mostly-static content that changes, SSR for per-request data, CSR for interactive client-only parts.',
    },
    {
      id: 'routing-pages-vs-app',
      title: 'Routing: Pages Router and App Router',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Folders and files become URLs. Pages Router uses pages/, App Router uses app/ with page.tsx, layout.tsx and other special files.',
      what: `Next.js uses **file-based routing**: you do not write a route table. The file path **is** the URL.

**Pages Router** (\`pages/\` folder):
- \`pages/index.tsx\` -> \`/\`
- \`pages/about.tsx\` -> \`/about\`
- \`pages/blog/[slug].tsx\` -> \`/blog/hello-world\`

**App Router** (\`app/\` folder): **folders** make the URL, and a special file named \`page.tsx\` makes it visible.
- \`app/page.tsx\` -> \`/\`
- \`app/about/page.tsx\` -> \`/about\`
- \`app/blog/[slug]/page.tsx\` -> \`/blog/hello-world\`

#### Deeper version
The App Router has more **special files** per folder:
- \`layout.tsx\`: UI that wraps child pages and **stays mounted** when you navigate (keeps state).
- \`template.tsx\`: like a layout, but **re-mounts** on every navigation.
- \`loading.tsx\`: a loading UI (wraps the page in a React Suspense boundary).
- \`error.tsx\`: an error UI (a React error boundary; must be a Client Component).
- \`not-found.tsx\`: the 404 UI.
- \`route.ts\`: an API endpoint (cannot be in the same folder as \`page.tsx\`).

Other folder tricks:
- \`(marketing)\` — a **route group**: organizes files without adding to the URL.
- \`_components\` — a **private folder**: never becomes a route.
- \`@modal\` — a **parallel route slot**; \`(.)photo\` — an **intercepting route** (advanced).

Both routers can live in one project during migration, but the same URL cannot be defined in both.`,
      why: `File-based routing removes boilerplate: you never forget to register a route and the folder tree shows the site map. The App Router adds **nested layouts** (a dashboard sidebar that does not re-render when you change tabs), built-in loading and error states per segment, and Server Components for less client JavaScript.`,
      analogy: `The \`app/\` folder is like a building. Each folder is a room with a door number (the URL part). \`layout.tsx\` is the hallway and walls that stay the same when you walk between rooms. \`page.tsx\` is the furniture inside a room — without it, the room exists but nobody can visit it. Route groups \`(name)\` are labels on the floor plan that visitors never see.`,
      code: [
        {
          title: 'App Router: folder structure to URLs',
          lang: 'text',
          code: `app/
  layout.tsx                 -> root layout (required, has <html> and <body>)
  page.tsx                   -> /
  about/page.tsx             -> /about
  (marketing)/pricing/page.tsx -> /pricing   (group name not in URL)
  dashboard/
    layout.tsx               -> sidebar shared by all dashboard pages
    page.tsx                 -> /dashboard
    settings/page.tsx        -> /dashboard/settings
    loading.tsx              -> shown while dashboard pages load
  blog/[slug]/page.tsx       -> /blog/any-post
  api/users/route.ts         -> /api/users (API endpoint, no UI)
  _components/Button.tsx     -> private, not a route`,
        },
        {
          title: 'Nested layout that keeps state',
          lang: 'tsx',
          code: `// app/layout.tsx -> root layout, wraps every page
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.tsx -> wraps only /dashboard/*
import Link from 'next/link';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <nav>
        <Link href="/dashboard">Home</Link>
        <Link href="/dashboard/settings">Settings</Link>
      </nav>
      <section>{children}</section> {/* the current page goes here */}
    </div>
  );
}`,
        },
      ],
      output: `Visiting \`/dashboard/settings\` renders: RootLayout -> DashboardLayout -> \`settings/page.tsx\`. When you click from Settings back to Home, only the \`{children}\` part changes. The \`<nav>\` in DashboardLayout is **not** re-mounted, so any state inside it (like an open menu or a scroll position) is kept. \`/pricing\` works even though the file lives in \`(marketing)\`, because route groups are not part of the URL. \`_components/Button.tsx\` can never be visited.`,
      questions: [
        {
          q: 'How does routing work in Next.js?',
          a: 'It is file-based. In the App Router each folder is a URL segment and `page.tsx` makes it public. In the Pages Router each file in `pages/` is a route.',
        },
        {
          q: 'What is the difference between layout.tsx and template.tsx?',
          a: 'A layout stays mounted across navigations and keeps its state. A template creates a new instance on every navigation, so state resets and effects run again.',
        },
        {
          q: 'What are route groups?',
          a: 'Folders in parentheses like `(marketing)`. They organize routes or give a set of routes its own layout without adding anything to the URL.',
        },
        {
          q: 'Can you use both the pages and app directories?',
          a: 'Yes, during an incremental migration. But the same route cannot exist in both, and they use different data-fetching APIs.',
        },
      ],
      spoken: `"Next.js uses file-based routing. In the Pages Router every file in the pages folder becomes a route. In the App Router, folders define URL segments and a page file makes a segment visible. The App Router also has special files: layout for shared UI that stays mounted, loading for a Suspense fallback, error for an error boundary, not-found for 404s, and route for API endpoints. I use route groups in parentheses to organize code or give sections different layouts without changing URLs. For new projects I use the App Router because of nested layouts and Server Components."`,
      mistakes: [
        'Creating `app/about/About.tsx` and expecting `/about` to work. The file must be named `page.tsx` (or `.js`/`.jsx`/`.ts`).',
        'Putting `page.tsx` and `route.ts` in the same folder. They conflict because both try to own that URL.',
        'Forgetting the root `app/layout.tsx` must render `<html>` and `<body>`.',
        'Follow-up trap: "Does a layout re-render when you navigate between its child pages?" It stays mounted and keeps state; only the page part changes. Use `template.tsx` if you want a reset.',
      ],
      takeaway: 'Folders are URLs; `page.tsx` makes them visible, `layout.tsx` wraps and persists, and special files add loading, error and API behaviour.',
    },
    {
      id: 'link-and-navigation',
      title: 'Navigation: next/link, useRouter and redirect',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Use <Link> for client-side navigation with prefetching, useRouter for navigation in code, and redirect() on the server.',
      what: `**\`<Link>\`** from \`next/link\` is the Next.js version of an \`<a>\` tag. It changes the page **without a full browser reload** (client-side navigation), so layouts and state are kept and it feels instant.

**\`useRouter\`** lets you navigate from code, like after a form submit: \`router.push('/dashboard')\`.

**\`redirect()\`** sends the user to another URL from **server** code (Server Components, server actions, route handlers).

#### Deeper version
- In the App Router, import \`useRouter\`, \`usePathname\` and \`useSearchParams\` from **\`next/navigation\`**. In the Pages Router, \`useRouter\` comes from **\`next/router\`**. Mixing them up is a common error.
- \`<Link>\` **prefetches** routes when they enter the viewport (in production). For static routes the whole page can be prefetched; for dynamic routes it prefetches down to the nearest \`loading.tsx\`. The exact prefetch behaviour has changed between versions.
- \`router.refresh()\` re-fetches the Server Components for the current route without losing client state.
- \`redirect()\` works by throwing a special error, so do not call it inside a \`try/catch\` that swallows it. \`permanentRedirect()\` gives a 308. You can also set redirects in \`next.config.js\`.`,
      why: `A normal \`<a>\` tag reloads the whole page: all JavaScript is downloaded and parsed again, and all React state is lost. \`<Link>\` only fetches what changed. Prefetching makes the next page appear almost instantly, which improves user experience and Core Web Vitals.`,
      analogy: `A normal \`<a>\` link is like leaving a shop, walking out to the street, and entering another shop. \`<Link>\` is like walking through an inside door between two rooms of the same shop. Prefetching is the shop assistant opening the next door for you before you reach it.`,
      code: [
        {
          title: 'Link and programmatic navigation (App Router)',
          lang: 'tsx',
          code: `'use client';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();          // e.g. "/products"
  const searchParams = useSearchParams();  // e.g. ?page=2
  const page = searchParams.get('page') ?? '1';

  return (
    <nav>
      {/* Client-side navigation + prefetching */}
      <Link href="/products" className={pathname === '/products' ? 'active' : ''}>
        Products (page {page})
      </Link>

      {/* Navigate from code */}
      <button onClick={() => router.push('/checkout')}>Checkout</button>
      <button onClick={() => router.back()}>Back</button>
      <button onClick={() => router.refresh()}>Refresh server data</button>
    </nav>
  );
}`,
        },
        {
          title: 'redirect() on the server',
          lang: 'tsx',
          code: `// app/account/page.tsx (Server Component)
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AccountPage() {
  const session = (await cookies()).get('session');
  if (!session) {
    redirect('/login'); // throws internally, stops rendering here
  }
  return <h1>Your account</h1>;
}`,
        },
      ],
      output: `Clicking "Products" swaps only the page content. The navbar is not re-mounted and there is no white flash. In production, Next.js prefetches \`/products\` when the link scrolls into view. "Checkout" pushes a new history entry. "Refresh server data" re-runs the Server Components for the current URL while keeping client state like input values.

On \`/account\`, a user with no \`session\` cookie never sees the page: the server responds with a redirect to \`/login\`.`,
      questions: [
        {
          q: 'Why use next/link instead of an <a> tag?',
          a: 'It does client-side navigation without a full page reload, keeps layout state, and prefetches the target route so navigation feels instant.',
        },
        {
          q: 'Where do you import useRouter from in the App Router?',
          a: 'From `next/navigation`. The `next/router` version is for the Pages Router only.',
        },
        {
          q: 'How do you redirect in a Server Component?',
          a: 'Call `redirect(\'/path\')` from `next/navigation`. It throws a special error that Next.js catches, so do not wrap it in a try/catch that hides it.',
        },
        {
          q: 'What does router.refresh() do?',
          a: 'It makes a new request to the server for the current route, re-renders Server Components and merges the result, without losing client-side React state.',
        },
      ],
      spoken: `"For navigation I use the Link component instead of a plain anchor tag. It does client-side navigation, so the page doesn't fully reload and layouts keep their state, and in production it prefetches routes in the viewport so they open almost instantly. When I need to navigate from code, like after a form submit, I use useRouter from next/navigation in a Client Component. On the server, in Server Components or server actions, I call redirect. One thing to remember is that redirect throws internally, so I never put it inside a try/catch that would swallow it."`,
      mistakes: [
        'Importing `useRouter` from `next/router` in the App Router. It fails; use `next/navigation`.',
        'Calling `redirect()` inside `try { } catch { }`. The catch swallows the special redirect error. Call it outside the try block.',
        'Using `useSearchParams` in a statically rendered page without a `<Suspense>` boundary, which can force client rendering up to that boundary or trigger a build warning/error.',
        'Follow-up trap: "Does prefetching happen in development?" Prefetching is a production optimization; in dev you will not see the same behaviour.',
      ],
      takeaway: 'Use `<Link>` for navigation, `useRouter` from `next/navigation` for code-driven navigation, and `redirect()` on the server.',
    },
    {
      id: 'environment-variables',
      title: 'Environment Variables and NEXT_PUBLIC_',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Env vars are server-only by default. Only variables starting with NEXT_PUBLIC_ are inlined into browser JavaScript at build time.',
      what: `**Environment variables** are settings you keep outside your code, like API keys and database URLs. Next.js loads them from \`.env\` files automatically.

The key rule:
- \`DATABASE_URL\`, \`STRIPE_SECRET_KEY\` -> **server only**. The browser never sees them.
- \`NEXT_PUBLIC_API_URL\` -> also available **in the browser**. Use this prefix only for values that are safe to be public.

#### Deeper version
\`NEXT_PUBLIC_\` variables are **inlined at build time**: during \`next build\`, Next.js finds \`process.env.NEXT_PUBLIC_X\` in client code and replaces it with the actual string. So:
- Changing them after the build does nothing for client code; you must **rebuild**.
- One Docker image cannot serve different public values per environment unless you read them at runtime on the server (for example in a Server Component) and pass them down.
- Dynamic access like \`process.env[name]\` is **not** inlined.

Load order (first wins): \`process.env\` set by the system, then \`.env.$(NODE_ENV).local\`, \`.env.local\` (not loaded in test), \`.env.$(NODE_ENV)\`, \`.env\`. Commit \`.env\` or \`.env.example\` with safe defaults; never commit \`.env.local\`. Server-side variables (without the prefix) are read at **runtime** on the server for dynamic code.`,
      why: `Secrets must not live in code or in the browser bundle. Anyone can open DevTools and read your JavaScript. The \`NEXT_PUBLIC_\` prefix is an explicit opt-in, so you cannot leak a secret by accident just by reading it in a component.`,
      analogy: `Server env vars are the safe in the back office: only staff (server code) can open it. \`NEXT_PUBLIC_\` vars are the price tags in the shop window: printed once when the shop is set up (build time), and every customer (browser) can read them.`,
      code: [
        {
          title: '.env.local',
          lang: 'ini',
          code: `# Server only - never sent to the browser
DATABASE_URL=mongodb+srv://user:pass@cluster.example.net/app
STRIPE_SECRET_KEY=sk_test_123

# Public - inlined into client JavaScript at build time
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_123`,
        },
        {
          title: 'Reading them on server vs client',
          lang: 'tsx',
          code: `// app/api/checkout/route.ts (server)
export async function POST() {
  const key = process.env.STRIPE_SECRET_KEY; // OK: runs on the server
  if (!key) return Response.json({ error: 'Missing key' }, { status: 500 });
  return Response.json({ ok: true });
}

// components/ApiBadge.tsx (client)
'use client';
export function ApiBadge() {
  // Replaced with the real string at build time
  const url = process.env.NEXT_PUBLIC_API_URL;
  // process.env.STRIPE_SECRET_KEY would be undefined here
  return <span>API: {url}</span>;
}`,
        },
      ],
      output: `The route handler can read \`STRIPE_SECRET_KEY\` because it runs on the server. In \`ApiBadge\`, \`process.env.NEXT_PUBLIC_API_URL\` becomes the literal string \`"https://api.example.com"\` inside the built JavaScript file. If you tried \`process.env.STRIPE_SECRET_KEY\` in that client file, you would get \`undefined\` — which protects the secret.`,
      questions: [
        {
          q: 'How do you expose an environment variable to the browser in Next.js?',
          a: 'Prefix it with `NEXT_PUBLIC_`. Next.js inlines its value into the client bundle at build time.',
        },
        {
          q: 'Why did changing NEXT_PUBLIC_API_URL on the server not change the app?',
          a: 'Because public variables are baked in during `next build`. You must rebuild, or read the value at runtime on the server and pass it to the client.',
        },
        {
          q: 'Which .env file should hold secrets locally?',
          a: '`.env.local`. It is loaded automatically and should be in `.gitignore`.',
        },
        {
          q: 'How do you make sure a secret never reaches client code?',
          a: 'Do not prefix it with `NEXT_PUBLIC_`, read it only in server code, and add `import \'server-only\'` to modules that use it so importing them from a Client Component fails the build.',
        },
      ],
      spoken: `"In Next.js, environment variables are server-only by default. Things like the database URL or the Stripe secret key are only available in server code like route handlers, server actions and Server Components. If a value must be used in the browser, I prefix it with NEXT_PUBLIC_, and Next.js inlines it into the client bundle at build time. That means anything public is visible to everyone, and changing it needs a rebuild. Locally I keep secrets in .env.local, which is git-ignored, and in production I set them in Vercel or my container environment."`,
      mistakes: [
        'Putting a secret key behind `NEXT_PUBLIC_` "to make it work in the component". Now it is in the public bundle forever.',
        'Expecting `NEXT_PUBLIC_` values to change at runtime in Docker without rebuilding.',
        'Committing `.env.local` to git.',
        'Follow-up trap: "Does `process.env[key]` work in client code?" No. Only literal `process.env.NEXT_PUBLIC_X` references are replaced at build time.',
      ],
      takeaway: 'No prefix = server-only secret; `NEXT_PUBLIC_` = public value baked in at build time.',
    },
    {
      id: 'next-image',
      title: 'Image Optimization with next/image',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'The <Image> component resizes, converts and lazy-loads images automatically and reserves space to prevent layout shift.',
      what: `\`<Image>\` from \`next/image\` is a smarter \`<img>\` tag. It:
- **Resizes** images to the size the device needs (a phone does not download a 4000px photo).
- **Converts** them to modern formats like **WebP** (or AVIF if configured).
- **Lazy-loads** images: they download only when close to the screen.
- **Prevents layout shift**: you give \`width\` and \`height\` (or use \`fill\`), so the browser reserves space before the image loads.

#### Deeper version
- Remote images must be allowed in \`next.config\` with \`images.remotePatterns\`, so nobody can use your server to optimize random URLs.
- The \`sizes\` prop tells the browser how wide the image will be at each screen size, so it picks the right file from the generated \`srcset\`. Without it, \`fill\` images may download a bigger file than needed.
- Use \`priority\` for the main above-the-fold image (often the **LCP** element — Largest Contentful Paint). In newer versions there is also a \`preload\` option and \`priority\` may be deprecated; check the docs for your version.
- Optimization happens **on demand** at the first request, then the result is cached. On Vercel it runs on their image service; when self-hosting it runs on your server (and uses the \`sharp\` library).
- \`placeholder="blur"\` shows a blurry preview while loading (automatic for static imports).`,
      why: `Images are usually the heaviest part of a page. Unoptimized images make pages slow, hurt **Core Web Vitals** (LCP and CLS — Cumulative Layout Shift), and lower SEO ranking. \`next/image\` gives you best practices without building an image pipeline.`,
      analogy: `A plain \`<img>\` is shipping the same huge poster to everyone, even to people with tiny phone screens. \`next/image\` is a print shop that prints the exact size each customer needs, in a lighter paper, and only ships it when they are about to look at it. It also tells the customer in advance how big the frame is, so their wall layout does not jump.`,
      code: [
        {
          title: 'Local, remote and fill images',
          lang: 'tsx',
          code: `import Image from 'next/image';
import hero from '@/public/hero.jpg'; // static import: width/height known automatically

export default function Page() {
  return (
    <>
      {/* Above-the-fold hero: load it early */}
      <Image src={hero} alt="Team at work" priority placeholder="blur" />

      {/* Remote image: width and height are required */}
      <Image
        src="https://images.example.com/avatar/42.png"
        alt="User avatar"
        width={64}
        height={64}
      />

      {/* Fill a parent box (parent must be position: relative) */}
      <div style={{ position: 'relative', width: '100%', height: 300 }}>
        <Image
          src="https://images.example.com/banner.jpg"
          alt="Banner"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
    </>
  );
}`,
        },
        {
          title: 'Allow remote image hosts',
          lang: 'javascript',
          code: `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.example.com', pathname: '/**' },
    ],
  },
};
module.exports = nextConfig;`,
        },
      ],
      output: `The hero image is loaded early (good for LCP) with a blurred preview. The avatar is served at 64px (and 2x for retina) in WebP instead of the original big PNG. The banner fills its box; on a phone the browser downloads a ~100vw-wide version, on desktop a ~50vw-wide version. Images lower down the page load only when the user scrolls near them. If \`images.example.com\` is not in \`remotePatterns\`, Next.js throws an error telling you to configure it.`,
      questions: [
        {
          q: 'What does next/image do better than <img>?',
          a: 'Automatic resizing, modern formats like WebP, lazy loading, a srcset for different screens, and reserved space to avoid layout shift.',
        },
        {
          q: 'Why are width and height required?',
          a: 'So the browser knows the aspect ratio and reserves space before the image loads. This prevents Cumulative Layout Shift. Static imports provide them automatically; `fill` is the alternative.',
        },
        {
          q: 'When do you use the priority prop?',
          a: 'For the most important above-the-fold image, usually the LCP image, so it is not lazy-loaded and is preloaded early. Check your version docs, as newer versions introduced a `preload` prop.',
        },
        {
          q: 'How do you use images from an external domain?',
          a: 'Add the host to `images.remotePatterns` in `next.config`. This is a security measure so your optimizer cannot be abused.',
        },
      ],
      spoken: `"I use the next/image component instead of a plain img tag. It automatically resizes images per device, serves modern formats like WebP, lazy-loads images below the fold and reserves space with width and height, so there is no layout shift. For the hero image I mark it as priority so it loads early, which helps LCP. For responsive images using fill, I always add the sizes prop so the browser downloads the right size. Remote hosts need to be whitelisted in next.config with remotePatterns. When self-hosting, I remember optimization runs on my own server, so I watch CPU."`,
      mistakes: [
        'Using `fill` without a positioned parent (`position: relative`), so the image covers the wrong area.',
        'Leaving out `sizes` on `fill` or responsive images, so the browser downloads a too-large image.',
        'Marking many images as `priority`. Only the few above-the-fold images should be prioritized.',
        'Follow-up trap: "Does next/image work with `output: \'export\'` (static export)?" Not with the default loader, because there is no server to optimize images. Use `unoptimized` or a custom loader (like a CDN).',
      ],
      takeaway: '`next/image` = right size, right format, lazy by default, no layout shift — just give it dimensions and whitelist remote hosts.',
    },
    {
      id: 'next-font',
      title: 'Font Optimization with next/font',
      level: 'basic',
      priority: 'good',
      frequency: 'occasional',
      summary: 'next/font self-hosts Google or local fonts at build time, removes external requests and prevents layout shift.',
      what: `\`next/font\` loads fonts in an optimized way:
- \`next/font/google\` downloads Google Fonts **at build time** and serves them from **your own domain**. The browser never calls Google at runtime.
- \`next/font/local\` does the same for font files you own.

It also sets up fallback fonts so text does not "jump" when the real font arrives.

#### Deeper version
- No runtime request to Google means better privacy (useful for GDPR) and one less DNS/connection to wait for.
- Next.js generates a **size-adjusted fallback font** (using CSS \`size-adjust\`), so the fallback takes up almost the same space as the real font. This reduces **CLS** (layout shift).
- Each font call returns an object with \`className\`, \`style\`, and optionally \`variable\` (a CSS variable, handy with Tailwind).
- Use **variable fonts** when possible; then you do not need to list every weight. Load fonts once (in a layout or a shared file) and reuse the object — calling the loader in many files creates many copies.
- \`display: 'swap'\` is the default, so text shows immediately in the fallback font.`,
      why: `Web fonts often cause two problems: slow text rendering (waiting for a third-party server) and layout shift (the font swaps and text changes size). \`next/font\` fixes both with zero config and keeps the font files cached with your static assets.`,
      analogy: `Using a Google Fonts link is like ordering ink from another city each time someone opens your book. \`next/font\` buys the ink once while printing the book (build time) and keeps it in your own warehouse. It also picks a temporary ink of the same width, so the page layout does not move when the real ink arrives.`,
      code: [
        {
          title: 'Google font in the root layout',
          lang: 'tsx',
          code: `// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${inter.className} \${mono.variable}\`}>
      <body>{children}</body>
    </html>
  );
}
// In CSS: code { font-family: var(--font-mono); }`,
        },
        {
          title: 'Local font file',
          lang: 'tsx',
          code: `// app/fonts.ts
import localFont from 'next/font/local';

export const brand = localFont({
  src: [
    { path: './fonts/Brand-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Brand-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-brand',
});
// Use: <h1 className={brand.className}>Hello</h1>`,
        },
      ],
      output: `At build time, Next.js downloads Inter and Roboto Mono and puts the font files with your static assets. The \`<html>\` tag gets a generated class that applies Inter and defines the \`--font-mono\` CSS variable. In the browser, text first shows in a size-matched fallback font, then swaps to Inter with almost no movement. In the Network tab you see no request to \`fonts.googleapis.com\`.`,
      questions: [
        {
          q: 'What does next/font do?',
          a: 'It self-hosts Google or local fonts at build time, adds size-adjusted fallbacks to avoid layout shift, and removes runtime requests to third-party font servers.',
        },
        {
          q: 'Does next/font/google call Google in the browser?',
          a: 'No. Fonts are downloaded at build time and served from your own domain.',
        },
        {
          q: 'How do you use next/font with Tailwind?',
          a: 'Set the `variable` option, add the variable class on `<html>`, and point Tailwind\'s `fontFamily` (or the CSS theme) at that CSS variable.',
        },
      ],
      spoken: `"I use next/font for fonts. With next/font/google, the font files are downloaded at build time and served from my own domain, so the browser doesn't make extra requests to Google, which helps speed and privacy. It also generates a size-adjusted fallback font, so when the real font loads the text doesn't jump, which keeps CLS low. I usually load the font once in the root layout and expose it as a CSS variable, so I can use it in Tailwind or plain CSS everywhere."`,
      mistakes: [
        'Calling the font loader inside many components. Load it once in a shared file or layout and reuse it.',
        'Still adding a `<link>` to Google Fonts in the head, which defeats the purpose.',
        'Loading every weight of a static font when a variable font would be one file.',
        'Follow-up trap: "Why might the build fail when offline?" `next/font/google` needs to download the font during the build.',
      ],
      takeaway: '`next/font` self-hosts fonts at build time and prevents layout shift — load once, reuse everywhere.',
    },
    {
      id: 'server-vs-client-components',
      title: 'Server Components vs Client Components',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'In the App Router, components run on the server by default. Add "use client" only for interactivity, state, effects or browser APIs.',
      what: `In the App Router there are two kinds of components:

- **Server Components** (the default): run **only on the server**. They can be \`async\`, read the database, use secrets, and fetch data directly. Their JavaScript is **not** sent to the browser.
- **Client Components**: marked with \`'use client'\` at the top of the file. They are pre-rendered to HTML on the server too, then **hydrated** in the browser, so they can use \`useState\`, \`useEffect\`, \`onClick\` and browser APIs like \`window\` and \`localStorage\`.

#### Deeper version
\`'use client'\` marks a **boundary**: that file and everything it imports become part of the client bundle. So put it as **low** in the tree as possible (a small \`LikeButton\`, not the whole page).

Rules for crossing the boundary:
- A Server Component can render a Client Component and pass props, but props must be **serializable** (strings, numbers, plain objects, arrays, Dates, Promises in newer React). Functions cannot be passed — except **server actions**.
- A Client Component **cannot import** a Server Component. But it can receive one as \`children\` or another prop (the "donut" pattern): the server renders it and passes the result in.
- Server Components output a special format called the **RSC payload** (React Server Component payload) that the client uses to build the tree.

Use the \`server-only\` package in modules with secrets so they cannot be imported into client code by mistake. Context providers need \`'use client'\`, so wrap them in a small client provider component and use it in the layout.`,
      why: `Before Server Components, every component's code shipped to the browser, even if it only displayed data. Server Components:
- **Ship less JavaScript** -> faster load, better on slow phones.
- **Fetch data close to the database** -> no extra API layer, no waterfalls from the browser.
- **Keep secrets safe** -> API keys and DB queries never reach the client.
Client Components remain for anything interactive.`,
      analogy: `A restaurant: Server Components are the **kitchen**. It has the fridge (database) and secret recipes (API keys); it cooks and sends finished plates out. Customers never see the kitchen. Client Components are the **table-side extras**: the salt shaker and the button to call the waiter — things the customer interacts with directly. You do not move the whole kitchen to the table just to give someone a salt shaker.`,
      code: [
        {
          title: 'Server page with a small client island',
          lang: 'tsx',
          code: `// app/posts/[id]/page.tsx — Server Component (default)
import { db } from '@/lib/db';         // server-only code, never sent to browser
import { LikeButton } from './LikeButton';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;          // params is a Promise in Next 15+
  const post = await db.post.findById(id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      {/* Pass serializable props only */}
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </article>
  );
}`,
        },
        {
          title: 'The client component',
          lang: 'tsx',
          code: `// app/posts/[id]/LikeButton.tsx
'use client'; // this file and its imports go to the browser

import { useState } from 'react';

export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);

  async function like() {
    setLikes((n) => n + 1); // optimistic update
    await fetch(\`/api/posts/\${postId}/like\`, { method: 'POST' });
  }

  return <button onClick={like}>Like ({likes})</button>;
}`,
        },
        {
          title: 'Passing a Server Component into a Client Component',
          lang: 'tsx',
          code: `// components/Modal.tsx
'use client';
import { useState } from 'react';
export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <div className="modal">{children}</div>}
    </>
  );
}

// app/page.tsx (Server Component)
// <Modal><ServerRenderedCart /></Modal>
// ServerRenderedCart still runs on the server; Modal just receives its output.`,
        },
      ],
      output: `The post title and body are rendered on the server, and \`db\` code never reaches the browser. Only \`LikeButton\`'s code is shipped. The HTML already shows "Like (10)" (pre-rendered), and after hydration the click handler works and the count goes up. In the modal example, \`ServerRenderedCart\` is rendered on the server even though it ends up inside a Client Component, because it was passed as \`children\`, not imported.`,
      questions: [
        {
          q: 'What is the difference between Server and Client Components?',
          a: 'Server Components run only on the server, can be async and access data directly, and send no JS to the browser. Client Components (`\'use client\'`) are pre-rendered and then hydrated, so they can use state, effects, events and browser APIs.',
        },
        {
          q: 'Are Client Components rendered only in the browser?',
          a: 'No. They are also pre-rendered to HTML on the server for the first load, then hydrated in the browser. "Client" means "this code also ships to and runs in the browser".',
        },
        {
          q: 'Can a Client Component import a Server Component?',
          a: 'No. Importing makes it part of the client bundle. Instead, pass the Server Component as `children` or another prop from a Server Component parent.',
        },
        {
          q: 'Where should you put "use client"?',
          a: 'As deep in the tree as possible, on the smallest interactive component, so most of the page stays on the server and ships less JavaScript.',
        },
        {
          q: 'Can you use React Context in Server Components?',
          a: 'No. Context needs client React. Create a small Client Component provider with `\'use client\'` and wrap `children` with it in the layout.',
        },
      ],
      spoken: `"In the App Router, every component is a Server Component by default. It runs only on the server, can be async, can query the database directly and its code isn't sent to the browser. When I need state, effects, event handlers or browser APIs, I add use client to make it a Client Component. Client Components are still pre-rendered on the server and then hydrated. I keep use client at the leaves, like a button or a form, because everything it imports becomes client code. Props from server to client must be serializable, and to nest server content inside a client wrapper I pass it as children."`,
      mistakes: [
        'Putting `\'use client\'` at the top of every page "to make hooks work". You lose the benefits of Server Components.',
        'Passing functions (like an `onClick` handler) from a Server Component to a Client Component. Functions are not serializable — only server actions can be passed.',
        'Importing a module with secrets into a Client Component by accident. Use the `server-only` package to make this a build error.',
        'Follow-up trap: "Does \'use client\' mean the component is not server-rendered?" No. It is still pre-rendered to HTML; it just also ships JS and hydrates.',
        'Follow-up trap: "What is \'use server\' then?" It is not the opposite of \'use client\'. It marks server actions (functions callable from the client), not Server Components.',
      ],
      takeaway: 'Server by default for data and less JS; `\'use client\'` only on the small interactive leaves.',
    },
    {
      id: 'data-fetching',
      title: 'Data Fetching: Pages Router vs App Router',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Pages Router uses getServerSideProps/getStaticProps/getStaticPaths; App Router fetches directly in async Server Components.',
      what: `**Pages Router** uses special exported functions in a page file:
- \`getServerSideProps\`: runs **on every request** on the server (SSR).
- \`getStaticProps\`: runs **at build time** (SSG), optionally with \`revalidate\` (ISR).
- \`getStaticPaths\`: tells Next.js which dynamic pages (like \`/blog/[slug]\`) to pre-build.
The returned \`props\` are passed to the page component.

**App Router**: no special functions. A Server Component is just an \`async\` function that awaits data — with \`fetch\`, an ORM like Prisma, or the MongoDB driver.

#### Deeper version
- In the App Router you control caching **per fetch**: \`fetch(url, { cache: 'force-cache' })\`, \`{ cache: 'no-store' }\`, or \`{ next: { revalidate: 60, tags: ['products'] } }\`. **The default changed**: in Next 14, \`fetch\` was cached by default; from Next 15, it is **not** cached by default. Check the docs for your version.
- For non-fetch data (DB queries) use React's \`cache()\` to dedupe within one request, and \`unstable_cache\` (or the newer \`'use cache'\` directive in recent versions) to cache across requests.
- **Avoid waterfalls**: two \`await\`s in a row run one after the other. Start them together with \`Promise.all\`, or split into components wrapped in \`<Suspense>\` so they stream independently.
- Do not call your own route handlers (\`fetch('/api/...')\`) from Server Components — you are already on the server; call the function directly.
- Client-side fetching is still useful for user-driven, frequently changing data: use **SWR** or **TanStack Query** in Client Components.`,
      why: `The Pages Router model forced data fetching at the page level only, and every prop had to be passed down. The App Router lets **each component fetch its own data** right where it is used, with automatic request deduplication, per-request caching control and streaming. Less prop drilling, less client JavaScript.`,
      analogy: `Pages Router is a waiter who takes the **whole table's order** at the door (one function per page) and brings everything at once. App Router is like each dish being cooked by its own chef (each component fetches its own data) — dishes arrive as they are ready (streaming), and if two dishes need the same sauce, it is made only once (deduplication).`,
      code: [
        {
          title: 'Pages Router: getServerSideProps',
          lang: 'tsx',
          code: `// pages/orders.tsx
import type { GetServerSideProps } from 'next';

type Order = { id: string; total: number };

export const getServerSideProps: GetServerSideProps<{ orders: Order[] }> = async (ctx) => {
  const token = ctx.req.cookies.token;
  if (!token) return { redirect: { destination: '/login', permanent: false } };

  const res = await fetch('https://api.example.com/orders', {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  if (res.status === 404) return { notFound: true };
  return { props: { orders: await res.json() } };
};

export default function Orders({ orders }: { orders: Order[] }) {
  return <ul>{orders.map((o) => <li key={o.id}>{o.total}</li>)}</ul>;
}`,
        },
        {
          title: 'App Router: async Server Component with parallel fetching',
          lang: 'tsx',
          code: `// app/dashboard/page.tsx
async function getUser() {
  const res = await fetch('https://api.example.com/me', { cache: 'no-store' }); // always fresh
  if (!res.ok) throw new Error('Failed to load user'); // caught by error.tsx
  return res.json();
}

async function getStats() {
  const res = await fetch('https://api.example.com/stats', {
    next: { revalidate: 300, tags: ['stats'] }, // cache for 5 minutes, tag for invalidation
  });
  return res.json();
}

export default async function Dashboard() {
  // Start both requests at the same time (no waterfall)
  const [user, stats] = await Promise.all([getUser(), getStats()]);
  return (
    <main>
      <h1>Hi {user.name}</h1>
      <p>Orders this week: {stats.orders}</p>
    </main>
  );
}`,
        },
        {
          title: 'Direct DB access + request deduplication',
          lang: 'typescript',
          code: `// lib/data.ts
import 'server-only';
import { cache } from 'react';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

// cache() dedupes calls with the same args within ONE request
export const getProduct = cache(async (id: string) => {
  const db = client.db('shop');
  return db.collection('products').findOne({ slug: id });
});
// Both generateMetadata and the page can call getProduct(id):
// the database is queried only once per request.`,
        },
      ],
      output: `- **Orders (Pages Router)**: on each request, the server reads the cookie. No token -> a redirect to \`/login\`. A 404 from the API -> the Next.js 404 page. Otherwise the page renders with the orders as props.
- **Dashboard (App Router)**: both fetches start together, so the total wait is the slower of the two, not the sum. The user data is always fresh; stats are cached for 5 minutes and can be refreshed early with \`revalidateTag('stats')\`. If \`getUser\` throws, the nearest \`error.tsx\` shows.
- **getProduct**: called twice during one render, the DB is hit once.`,
      questions: [
        {
          q: 'What is the difference between getServerSideProps and getStaticProps?',
          a: '`getServerSideProps` runs on every request (SSR). `getStaticProps` runs at build time (SSG), and with `revalidate` it becomes ISR.',
        },
        {
          q: 'How do you fetch data in the App Router?',
          a: 'Make the Server Component `async` and await `fetch` or a DB call directly. Control caching with `cache` and `next.revalidate` options or route segment config.',
        },
        {
          q: 'Is fetch cached by default in the App Router?',
          a: 'It depends on the version. In Next 14 fetch was cached by default; in Next 15 the default changed to not cached. Always set the option explicitly when it matters, and check your version docs.',
        },
        {
          q: 'How do you avoid request waterfalls?',
          a: 'Start independent requests together with `Promise.all`, or move each fetch into its own component wrapped in `<Suspense>` so they load and stream in parallel.',
        },
        {
          q: 'Should a Server Component call your own /api route?',
          a: 'No. It adds an extra HTTP hop and can fail at build time. Call the shared data function or DB directly.',
        },
      ],
      spoken: `"In the Pages Router, data fetching is done with special page-level functions: getServerSideProps for every request, getStaticProps for build time, with revalidate for ISR, and getStaticPaths for dynamic pages. In the App Router I just make the Server Component async and await fetch or my database directly, so each component fetches what it needs. Caching is controlled per fetch with options like no-store or revalidate and tags. The default changed in Next 15, so I set it explicitly. I avoid waterfalls with Promise.all or Suspense, and I use React's cache to dedupe DB calls within a request."`,
      mistakes: [
        'Writing `await a(); await b();` for independent data — that is a waterfall. Use `Promise.all`.',
        'Calling `fetch(\'http://localhost:3000/api/x\')` from a Server Component instead of calling the logic directly.',
        'Relying on the fetch caching default without checking your Next.js version, and then serving stale (or uncached) data.',
        'Follow-up trap: "Is React `cache()` a persistent cache?" No. It only dedupes within a single server request. Use the Data Cache (`fetch` options, `unstable_cache`, or `\'use cache\'` in newer versions) to persist across requests.',
        'Follow-up trap: "Can you use getServerSideProps in the app folder?" No. It only works in `pages/`.',
      ],
      takeaway: 'Pages Router: page-level `getServerSideProps`/`getStaticProps`. App Router: `await` data in async Server Components and set caching explicitly per fetch.',
    },
    {
      id: 'dynamic-routes',
      title: 'Dynamic Routes and generateStaticParams',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Square-bracket folders like [slug] match any value; generateStaticParams pre-builds chosen values at build time.',
      what: `A **dynamic route** is a route where part of the URL is a variable. You make one with square brackets:
- \`app/blog/[slug]/page.tsx\` matches \`/blog/hello\`, \`/blog/nextjs-tips\`, etc. The value comes in \`params.slug\`.
- \`app/shop/[...slug]/page.tsx\` is a **catch-all**: matches \`/shop/a\`, \`/shop/a/b/c\` -> \`slug = ['a','b','c']\`.
- \`app/docs/[[...slug]]/page.tsx\` is an **optional catch-all**: also matches \`/docs\` itself.

**\`generateStaticParams\`** returns a list of params to **pre-build at build time** (like \`getStaticPaths\` in the Pages Router).

#### Deeper version
- In **Next 15+**, \`params\` and \`searchParams\` are **Promises**, so you \`await\` them. In Next 14 they were plain objects. (Next 15 kept temporary sync access with warnings for migration.)
- Paths not returned by \`generateStaticParams\` are rendered **on demand** on first visit and then cached (by default). Set \`export const dynamicParams = false\` to return a 404 for unknown paths instead.
- You can return an **empty array** to build nothing at build time and render every page on first request — useful when there are thousands of pages.
- Pages Router equivalent: \`getStaticPaths\` returns \`{ paths, fallback }\` where \`fallback\` is \`false\` (404), \`true\` (show a fallback UI while building) or \`'blocking'\` (wait, then show the page).
- Call \`notFound()\` from \`next/navigation\` when the slug does not exist in your data.`,
      why: `Real apps have many pages with the same layout and different data: products, blog posts, user profiles. You write the page once and the URL decides the data. \`generateStaticParams\` lets you make the popular pages static (fast and SEO-friendly) without building millions of pages.`,
      analogy: `A dynamic route is a letter template: "Dear ____". The blank (\`[slug]\`) is filled by the URL. \`generateStaticParams\` is printing letters in advance for your top 100 customers, while letters for everyone else are printed when they ask, and then kept on file.`,
      code: [
        {
          title: 'Dynamic page with generateStaticParams (Next 15 style)',
          lang: 'tsx',
          code: `// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getAllPosts, getPost } from '@/lib/posts';

// Runs at build time: pre-build these slugs
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.slice(0, 100).map((p) => ({ slug: p.slug })); // top 100 only
}

// Unknown slugs: true (default) = render on demand, false = 404
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export default async function PostPage({ params }: Props) {
  const { slug } = await params; // Next 14: const { slug } = params;
  const post = await getPost(slug);
  if (!post) notFound(); // shows not-found.tsx

  return <article><h1>{post.title}</h1><p>{post.body}</p></article>;
}`,
        },
        {
          title: 'Catch-all and searchParams',
          lang: 'tsx',
          code: `// app/shop/[...slug]/page.tsx
type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Shop({ params, searchParams }: Props) {
  const { slug } = await params;              // /shop/men/shoes -> ['men', 'shoes']
  const { sort = 'popular' } = await searchParams; // ?sort=price
  return <h1>{slug.join(' > ')} sorted by {String(sort)}</h1>;
}`,
        },
      ],
      output: `At build time, Next.js calls \`generateStaticParams\` and builds 100 static blog pages. A visit to \`/blog/old-post\` (not in the list) is rendered on the server on first request and cached for next time. If \`getPost\` returns nothing, the user sees the 404 page. For \`/shop/men/shoes?sort=price\`, the heading is "men > shoes sorted by price". Reading \`searchParams\` makes the shop page dynamic.`,
      questions: [
        {
          q: 'How do you create a dynamic route in the App Router?',
          a: 'Create a folder with square brackets, like `app/blog/[slug]/page.tsx`, and read the value from `params`.',
        },
        {
          q: 'What does generateStaticParams do?',
          a: 'It returns the list of params to pre-render at build time. It replaces `getStaticPaths` from the Pages Router.',
        },
        {
          q: 'What happens to a slug not returned by generateStaticParams?',
          a: 'By default it is rendered on demand at request time and cached. With `export const dynamicParams = false`, it returns 404.',
        },
        {
          q: 'What changed about params in Next.js 15?',
          a: '`params` and `searchParams` became Promises, so you `await` them. Next 14 passed plain objects.',
        },
        {
          q: 'What is the difference between [...slug] and [[...slug]]?',
          a: '`[...slug]` needs at least one segment. `[[...slug]]` is optional, so it also matches the base path with no segments.',
        },
      ],
      spoken: `"Dynamic routes use square-bracket folders, like blog slash slug. The URL value comes in through params, and in Next 15 params is a Promise, so I await it. For catch-all routes I use three dots, and double brackets make it optional. To make dynamic pages static, I export generateStaticParams, which returns the list of slugs to pre-build at build time. For big catalogs I only pre-build the popular ones and let the rest render on demand and get cached. If I want unknown slugs to 404, I set dynamicParams to false, and inside the page I call notFound when data is missing."`,
      mistakes: [
        'Forgetting to `await params` in Next 15+ and getting warnings or errors.',
        'Pre-building every page with `generateStaticParams` for a huge catalog, which makes builds very slow. Build the top pages only.',
        'Not calling `notFound()` when data is missing, so the page crashes with "cannot read property of undefined".',
        'Follow-up trap: "What is the Pages Router equivalent and its fallback options?" `getStaticPaths` with `fallback: false | true | \'blocking\'`.',
      ],
      takeaway: '`[slug]` makes the URL a variable; `generateStaticParams` pre-builds the important values and the rest render on demand.',
    },
    {
      id: 'api-routes-route-handlers',
      title: 'API Routes and Route Handlers',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Backend endpoints inside Next.js: pages/api/* with (req, res) in the Pages Router, app/**/route.ts with Web Request/Response in the App Router.',
      what: `Next.js lets you write **backend endpoints** in the same project.

- **Pages Router — API Routes**: a file in \`pages/api/\`, like \`pages/api/users.ts\`, exports one \`handler(req, res)\` function (Node/Express-like).
- **App Router — Route Handlers**: a \`route.ts\` file, like \`app/api/users/route.ts\`, exports one function **per HTTP method**: \`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`. They use the standard **Web \`Request\` and \`Response\`** APIs.

#### Deeper version
- \`NextRequest\` and \`NextResponse\` extend the Web APIs with helpers like \`req.nextUrl.searchParams\` and \`req.cookies\`.
- Dynamic segments work the same: \`app/api/users/[id]/route.ts\` gets \`{ params }\` as the second argument (a Promise in Next 15+).
- **Caching**: in Next 14, \`GET\` handlers without dynamic APIs could be cached statically. In Next 15, \`GET\` handlers are **not cached by default**; you opt in with \`export const dynamic = 'force-static'\`. Check your version docs.
- Use route handlers for **webhooks** (Stripe), endpoints called by **mobile apps or third parties**, file downloads, and **streaming responses** (like LLM output). For mutations from your own UI, **server actions** are often simpler.
- Stripe webhooks need the **raw body** to verify the signature: in a route handler use \`await req.text()\`. In the Pages Router you disable the body parser with \`export const config = { api: { bodyParser: false } }\`.`,
      why: `Most apps need a few server endpoints: webhooks, auth callbacks, a public API, or a safe proxy to a third-party API so the secret key stays on the server. Having them next to the UI means shared types, one deploy, and no CORS setup for your own frontend.`,
      analogy: `Your Next.js app is a restaurant. Pages are the dining room for guests. Route handlers are the **back door for deliveries**: suppliers (Stripe, mobile apps, other services) come here, drop things off or pick things up, and never walk through the dining room.`,
      code: [
        {
          title: 'App Router route handler (GET + POST)',
          lang: 'typescript',
          code: `// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

const tasks = [{ id: 1, title: 'Learn Next.js', done: false }]; // demo only (in memory)

// GET /api/tasks?done=false
export async function GET(req: NextRequest) {
  const done = req.nextUrl.searchParams.get('done');
  const result = done === null ? tasks : tasks.filter((t) => String(t.done) === done);
  return NextResponse.json(result);
}

// POST /api/tasks  body: { "title": "Ship it" }
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  const task = { id: Date.now(), title: body.title, done: false };
  tasks.push(task);
  return NextResponse.json(task, { status: 201 });
}`,
        },
        {
          title: 'Dynamic route handler and a Stripe webhook',
          lang: 'typescript',
          code: `// app/api/tasks/[id]/route.ts
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // await db.task.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const rawBody = await req.text(); // raw text is required for signature check
  const sig = req.headers.get('stripe-signature')!;
  try {
    const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    if (event.type === 'checkout.session.completed') {
      // mark order as paid
    }
    return Response.json({ received: true });
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }
}`,
        },
        {
          title: 'Pages Router API route',
          lang: 'typescript',
          code: `// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.status(200).json({ message: 'Hello', query: req.query });
}`,
        },
      ],
      output: `- \`GET /api/tasks\` returns the list as JSON; \`GET /api/tasks?done=true\` returns an empty array.
- \`POST /api/tasks\` with no title returns \`400 { "error": "title is required" }\`; with a title it returns \`201\` and the new task.
- \`DELETE /api/tasks/123\` returns \`204 No Content\`.
- The Stripe webhook verifies the signature with the raw body; a fake request gets \`400\`.
- In the Pages Router, a \`POST /api/hello\` returns \`405\` because only GET is allowed. (Methods you do not export in a route handler get a 405 automatically.)`,
      questions: [
        {
          q: 'What is the difference between API Routes and Route Handlers?',
          a: 'API Routes live in `pages/api` and use one `handler(req, res)` function. Route Handlers live in `app/**/route.ts`, export one function per HTTP method, and use Web `Request`/`Response`.',
        },
        {
          q: 'When would you use a route handler instead of a server action?',
          a: 'For endpoints called by external clients: webhooks, mobile apps, third parties, public APIs, file downloads or streaming. Server actions are for mutations from your own React UI.',
        },
        {
          q: 'Are GET route handlers cached?',
          a: 'It depends on the version. In Next 14, GET handlers without dynamic APIs could be cached; in Next 15 they are not cached by default and you opt in with `dynamic = \'force-static\'`. Check your version docs.',
        },
        {
          q: 'How do you handle a Stripe webhook in Next.js?',
          a: 'Create a POST route handler, read the raw body with `req.text()`, and verify it with `stripe.webhooks.constructEvent` and the webhook secret before trusting the event.',
        },
      ],
      spoken: `"Next.js lets me write backend endpoints in the same project. In the Pages Router these are API routes in pages slash api with a req and res handler. In the App Router I use route handlers: a route.ts file that exports GET, POST and other methods, using the standard Web Request and Response objects. I use them for webhooks like Stripe, where I read the raw body to verify the signature, for endpoints used by mobile apps, and for streaming responses like LLM output. For simple form mutations from my own UI, I usually prefer server actions instead."`,
      mistakes: [
        'Putting `route.ts` and `page.tsx` in the same folder; they conflict.',
        'Parsing the Stripe webhook body with `req.json()`, which breaks signature verification. Use the raw text.',
        'Forgetting to validate input and check auth in route handlers — they are public HTTP endpoints.',
        'Storing data in a module-level variable (like the demo `tasks`) in production. Serverless instances do not share memory and restart often; use a database.',
        'Follow-up trap: "Do you need CORS for route handlers?" Not for your own same-origin frontend. For other origins you must set CORS headers yourself (in the handler, `next.config` headers, or middleware).',
      ],
      takeaway: 'Route handlers are your built-in backend endpoints — use them for webhooks and external clients; use server actions for your own forms.',
    },
    {
      id: 'metadata-seo',
      title: 'SEO and the Metadata API',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Export a metadata object or generateMetadata function to set title, description, Open Graph and more; add sitemap.ts and robots.ts.',
      what: `**SEO (Search Engine Optimization)** means helping Google and social apps understand your pages. The basics are a good \`<title>\`, a meta **description**, **Open Graph** tags (the preview card when you share a link), and a **sitemap**.

In the App Router you set these with the **Metadata API**:
- \`export const metadata = { ... }\` for fixed values.
- \`export async function generateMetadata({ params })\` for values that depend on data (like a product name).

Only Server Components (layouts and pages) can export metadata.

#### Deeper version
- Metadata from layouts and pages is **merged**: a page overrides fields from its layout. \`title.template\` (for example \`'%s | MyShop'\`) in the root layout adds a suffix to every page title.
- \`metadataBase\` sets the base URL so relative Open Graph image paths become absolute.
- **File conventions**: \`app/sitemap.ts\`, \`app/robots.ts\`, \`app/opengraph-image.tsx\` (generates OG images with \`ImageResponse\`), \`favicon.ico\`, \`icon.png\`.
- \`generateMetadata\` and the page often need the same data — wrap the loader in React \`cache()\` so it runs once.
- \`alternates.canonical\` sets the canonical URL to avoid duplicate-content issues.
- Pages Router: use \`<Head>\` from \`next/head\` inside the page.
- Real SEO also depends on rendering: static/SSR pages give crawlers real HTML; pure CSR pages are weaker.`,
      why: `Without metadata every page has the same title, search results look bad, and shared links show no preview. Dynamic metadata lets each of 10,000 product pages have its own title, description and image, generated from the same data the page uses.`,
      analogy: `Metadata is the label and cover of a book in a library. The book (page content) might be great, but the librarian (Google) and the visitors (people scrolling social media) first read the title, the short blurb and the cover image. The sitemap is the library catalog that lists every book.`,
      code: [
        {
          title: 'Static and dynamic metadata',
          lang: 'tsx',
          code: `// app/layout.tsx
import type { Metadata } from 'next';
export const metadata: Metadata = {
  metadataBase: new URL('https://myshop.com'),
  title: { default: 'MyShop', template: '%s | MyShop' },
  description: 'Handmade products delivered fast.',
};

// app/products/[slug]/page.tsx
import { cache } from 'react';
const getProduct = cache(async (slug: string) =>
  fetch(\`https://api.myshop.com/products/\${slug}\`).then((r) => r.json())
);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product.name, // becomes "Blue Mug | MyShop"
    description: product.summary,
    alternates: { canonical: \`/products/\${slug}\` },
    openGraph: { images: [product.imageUrl] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug); // deduped with generateMetadata
  return <h1>{product.name}</h1>;
}`,
        },
        {
          title: 'sitemap.ts and robots.ts',
          lang: 'typescript',
          code: `// app/sitemap.ts -> served at /sitemap.xml
import type { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products: { slug: string }[] = await fetch('https://api.myshop.com/products').then((r) => r.json());
  return [
    { url: 'https://myshop.com', lastModified: new Date() },
    ...products.map((p) => ({ url: \`https://myshop.com/products/\${p.slug}\` })),
  ];
}

// app/robots.ts -> served at /robots.txt
export function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/dashboard/' },
    sitemap: 'https://myshop.com/sitemap.xml',
  };
}
// (In a real project robots.ts is its own file with a default export.)`,
        },
      ],
      output: `The product page \`/products/blue-mug\` gets \`<title>Blue Mug | MyShop</title>\`, its own description, a canonical link and an Open Graph image with an absolute URL (thanks to \`metadataBase\`). The product is fetched only once even though both \`generateMetadata\` and the page call \`getProduct\`. \`/sitemap.xml\` lists every product, and \`/robots.txt\` tells crawlers to skip the dashboard.`,
      questions: [
        {
          q: 'How do you set the page title in the App Router?',
          a: 'Export a `metadata` object or a `generateMetadata` function from a `page.tsx` or `layout.tsx` (Server Components only).',
        },
        {
          q: 'When do you use generateMetadata?',
          a: 'When metadata depends on dynamic data, like a product name from the database. It receives `params` and `searchParams`.',
        },
        {
          q: 'How do you avoid fetching data twice for metadata and the page?',
          a: 'Wrap the loader in React `cache()` (fetch calls with the same URL and options are also memoized within a request).',
        },
        {
          q: 'How do you add a sitemap in Next.js?',
          a: 'Create `app/sitemap.ts` that default-exports a function returning the list of URLs. Next.js serves it at `/sitemap.xml`.',
        },
        {
          q: 'Why is Next.js better for SEO than a CRA/Vite SPA?',
          a: 'Pages can be pre-rendered (SSG/SSR), so crawlers get full HTML with content and meta tags without running JavaScript.',
        },
      ],
      spoken: `"For SEO in the App Router I use the Metadata API. For fixed pages I export a metadata object, and for dynamic pages like products I export generateMetadata, which gets the params and returns the title, description, canonical URL and Open Graph images. In the root layout I set metadataBase and a title template so every page gets a consistent suffix. I wrap my data loader in React cache so the page and generateMetadata don't fetch twice. I also add sitemap.ts and robots.ts, which Next.js serves as XML and text. And I make sure important pages are statically or server rendered so crawlers see real HTML."`,
      mistakes: [
        'Exporting `metadata` from a Client Component file. It is ignored or causes an error — it only works in Server Components.',
        'Exporting both `metadata` and `generateMetadata` from the same file. Choose one.',
        'Using relative Open Graph image URLs without `metadataBase`, so social previews break.',
        'Follow-up trap: "Can you use next/head in the App Router?" No. `next/head` is for the Pages Router; the App Router uses the Metadata API.',
      ],
      takeaway: 'Use `metadata`/`generateMetadata` plus `sitemap.ts` and `robots.ts`, and pre-render important pages so crawlers get real HTML.',
    },
    {
      id: 'streaming-loading-error',
      title: 'Streaming, loading.js and error.js',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Send the page in pieces: loading.tsx and <Suspense> show fallbacks while slow parts load; error.tsx catches errors per route segment.',
      what: `**Streaming** means the server sends the page **in pieces**. The fast parts (header, layout) arrive first; slow parts (a big data query) arrive later and pop in when ready.

- **\`loading.tsx\`**: a file you add to a route folder. Next.js shows it **instantly** while the page's data loads. It wraps the page in a React \`<Suspense>\` boundary for you.
- **\`<Suspense fallback={...}>\`**: wrap any slow component to stream just that part.
- **\`error.tsx\`**: a **Client Component** that catches errors in that route segment and shows a friendly message with a "Try again" button.

#### Deeper version
- Under the hood, the server sends the HTML shell, then later sends chunks of HTML plus small scripts that swap the fallback with the real content — all in **one HTTP response**.
- \`error.tsx\` is a React **error boundary**. It gets \`error\` and \`reset\` props (newer versions may name the retry function differently; check the docs). It must have \`'use client'\`.
- An \`error.tsx\` does **not** catch errors from the \`layout.tsx\` in the **same** folder — the layout sits outside the boundary. The parent segment's \`error.tsx\` catches those. \`global-error.tsx\` catches errors in the root layout and must render its own \`<html>\` and \`<body>\`.
- In production, error messages from Server Components are hidden from the client for security; you get a \`digest\` to match server logs.
- \`not-found.tsx\` + \`notFound()\` handle 404s the same way.
- Streaming helps **TTFB** (Time To First Byte) and perceived speed, and Google still gets the full HTML.`,
      why: `Without streaming, a page with one slow query (3 seconds) shows a blank screen for 3 seconds. With streaming, the user sees the layout and most of the content immediately, and only the slow box shows a skeleton. Per-segment error boundaries mean one broken widget does not crash the whole app.`,
      analogy: `A restaurant brings your drinks and bread right away (the shell), then each dish when it is cooked (streamed parts), instead of making you wait at an empty table until the slowest dish is ready. If one dish fails, the waiter apologizes and offers to make it again (\`error.tsx\` with a retry), but the rest of your meal is fine.`,
      code: [
        {
          title: 'loading.tsx, Suspense and a slow component',
          lang: 'tsx',
          code: `// app/dashboard/loading.tsx -> shown instantly while page.tsx loads
export default function Loading() {
  return <p>Loading dashboard...</p>;
}

// app/dashboard/page.tsx
import { Suspense } from 'react';

async function SlowRevenueChart() {
  const res = await fetch('https://api.example.com/revenue', { cache: 'no-store' }); // slow API
  const data = await res.json();
  return <div>Revenue: {data.total}</div>;
}

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1> {/* sent immediately */}
      <Suspense fallback={<div className="skeleton">Loading chart...</div>}>
        <SlowRevenueChart /> {/* streamed in when ready */}
      </Suspense>
    </main>
  );
}`,
        },
        {
          title: 'error.tsx with retry',
          lang: 'tsx',
          code: `// app/dashboard/error.tsx
'use client'; // error boundaries must be Client Components

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error); // send to Sentry or your logger
  }, [error]);

  return (
    <div>
      <h2>Something went wrong loading the dashboard.</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}`,
        },
      ],
      output: `The user opens \`/dashboard\`. The heading "Dashboard" appears right away and the chart area shows "Loading chart...". When the revenue API answers, the real chart replaces the skeleton without a page reload. If the API throws, \`error.tsx\` shows "Something went wrong" inside the dashboard area, while the root layout (navbar etc.) keeps working. Clicking "Try again" re-renders the segment.`,
      questions: [
        {
          q: 'What is streaming in Next.js?',
          a: 'Sending the HTML in chunks. The shell and fast parts arrive first; slow Suspense-wrapped parts are sent later in the same response and replace their fallbacks.',
        },
        {
          q: 'What does loading.tsx do?',
          a: 'It automatically wraps the route\'s page in a Suspense boundary and shows its content instantly while the page loads, including during client navigation.',
        },
        {
          q: 'Why must error.tsx be a Client Component?',
          a: 'Because it is a React error boundary with interactive recovery (`reset`), which needs client-side React.',
        },
        {
          q: 'Does error.tsx catch errors from the layout in the same folder?',
          a: 'No. The layout wraps the error boundary, so its errors bubble to the parent segment\'s error.tsx, or to `global-error.tsx` for the root layout.',
        },
      ],
      spoken: `"Streaming lets Next.js send the page in pieces. The layout and fast content are sent immediately, and slow parts wrapped in Suspense show a fallback and are streamed in later in the same response. Adding a loading.tsx file to a route automatically wraps the page in Suspense, so users get instant feedback on navigation. For errors I add an error.tsx, which is a client error boundary with a reset function to retry. It isolates failures to one segment, so the rest of the app keeps working. For root layout errors there is global-error.tsx."`,
      mistakes: [
        'Wrapping the whole page in one Suspense — you lose the benefit. Wrap each independent slow part separately.',
        'Forgetting `\'use client\'` in `error.tsx`.',
        'Expecting `error.tsx` to catch errors in the same folder\'s `layout.tsx`.',
        'Follow-up trap: "Is streaming bad for SEO?" No. Crawlers receive the full streamed HTML; the content is in the response.',
      ],
      takeaway: 'Use `loading.tsx` and `<Suspense>` to show the fast parts first, and `error.tsx` to fail one segment instead of the whole page.',
    },
    {
      id: 'middleware',
      title: 'Middleware (proxy in newer versions)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Code that runs before a request reaches a route — for redirects, rewrites, auth checks, headers and A/B tests.',
      what: `**Middleware** is a function in a single file at the project root (\`middleware.ts\`, next to \`app/\` or inside \`src/\`). It runs **before** the request reaches your page or API, and it can:
- **Redirect** (send the user to another URL),
- **Rewrite** (show a different page but keep the URL),
- **Set headers or cookies**,
- **Block** the request.

A \`matcher\` config decides which paths it runs on.

#### Deeper version
- **Naming changed**: in **Next.js 16** the file convention was renamed from \`middleware.ts\` to **\`proxy.ts\`** (the function is called \`proxy\`), and \`middleware\` is deprecated. The idea is the same. Check the docs for your version.
- Middleware historically ran on the **Edge runtime** only (fast, but no full Node.js APIs like \`fs\` or most database drivers). Newer versions also support the Node.js runtime for it; check your version docs.
- It runs on **every matched request**, including prefetches, so keep it **small and fast**. Exclude static files and images in the \`matcher\`.
- Use it for **optimistic checks** (is there a session cookie?), not as your only security layer. Always re-check auth close to the data (in server actions, route handlers and data functions). In 2025 a vulnerability (CVE-2025-29927) allowed bypassing middleware with a crafted header in older versions — a strong reason to never rely on middleware alone and to keep Next.js updated.
- One middleware file per project; branch inside it by path.`,
      why: `Some logic must run before rendering for many routes at once: sending logged-out users to \`/login\`, redirecting by country or language, adding security headers, A/B testing, or rewriting old URLs. Doing it in middleware avoids rendering the page at all and keeps the logic in one place.`,
      analogy: `Middleware is the security guard at the building entrance. Before you reach any office (page), the guard checks your badge (cookie), may send you to reception (redirect), quietly sends you to a different room that looks the same from outside (rewrite), or gives you a visitor sticker (header). But each office still locks its own sensitive cabinets — the guard is not the only protection.`,
      code: [
        {
          title: 'Auth redirect + header in middleware.ts',
          lang: 'typescript',
          code: `// middleware.ts (project root). In Next 16+: proxy.ts with "export function proxy"
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const { pathname } = req.nextUrl;

  // 1. Optimistic auth check
  if (pathname.startsWith('/dashboard') && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname); // come back after login
    return NextResponse.redirect(loginUrl);
  }

  // 2. Rewrite: /blog -> served by /news, URL stays /blog
  if (pathname === '/blog') {
    return NextResponse.rewrite(new URL('/news', req.url));
  }

  // 3. Continue, but add a header
  const res = NextResponse.next();
  res.headers.set('x-powered-by-team', 'web');
  return res;
}

// Run only on these paths (skip static files and images)
export const config = {
  matcher: ['/dashboard/:path*', '/blog', '/((?!_next/static|_next/image|favicon.ico).*)'],
};`,
        },
      ],
      output: `- A logged-out user opening \`/dashboard/orders\` is redirected to \`/login?from=/dashboard/orders\` before any page code runs.
- \`/blog\` shows the content of \`/news\`, but the browser address bar still says \`/blog\`.
- Every other matched response gets the extra \`x-powered-by-team\` header.
- Requests for \`/_next/static/...\` files skip middleware completely, so they stay fast.`,
      questions: [
        {
          q: 'What is middleware in Next.js used for?',
          a: 'Running code before a request is handled: redirects, rewrites, auth checks, setting headers/cookies, geolocation or A/B testing.',
        },
        {
          q: 'What is the difference between redirect and rewrite?',
          a: 'A redirect tells the browser to go to a new URL (the address bar changes). A rewrite serves a different route on the server while the URL stays the same.',
        },
        {
          q: 'Which runtime does middleware use?',
          a: 'Traditionally the Edge runtime, so no full Node.js APIs. Newer versions added Node.js runtime support. Check your version docs.',
        },
        {
          q: 'Is middleware enough to protect a route?',
          a: 'No. Use it for fast optimistic redirects, but also verify the session where data is read or changed — in server components, actions and route handlers.',
        },
        {
          q: 'What changed about middleware in Next.js 16?',
          a: 'The file was renamed to `proxy.ts` and the exported function to `proxy`. `middleware.ts` is deprecated but the concept is the same.',
        },
      ],
      spoken: `"Middleware is a single file at the root that runs before a request reaches a route. I use it for redirects, rewrites, setting headers, and quick auth checks, like sending users without a session cookie to the login page. I always set a matcher so it skips static files, because it runs on every matched request. It traditionally runs on the Edge runtime, so I avoid heavy work or database calls there. Importantly, I treat it as an optimistic check only and verify auth again near the data. In Next 16, the file is renamed to proxy.ts, but the idea is the same."`,
      mistakes: [
        'Using middleware as the only auth protection. Always check auth again in the data layer, actions and route handlers.',
        'Doing heavy work (DB queries, big libraries) in middleware, which slows every request.',
        'No `matcher`, so middleware runs on every static asset and image.',
        'Creating multiple middleware files per folder. There is only one per project.',
        'Follow-up trap: "Can middleware read the request body or use Mongoose?" It is meant for headers, cookies and URLs; heavy Node libraries generally do not work on the Edge runtime.',
      ],
      takeaway: 'Middleware is the fast front gate for redirects, rewrites and headers — keep it light and never your only security check.',
    },
    {
      id: 'server-actions',
      title: 'Server Actions',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Async functions marked "use server" that run on the server but can be called from forms and Client Components — mutations without writing an API.',
      what: `A **server action** is an \`async\` function that runs **on the server**, but you can call it from the browser — usually from a \`<form action={...}>\` or a button. You mark it with \`'use server'\`.

Next.js creates a hidden endpoint for it. You do not write \`fetch\` or a route handler. Perfect for **mutations**: create, update, delete.

#### Deeper version
- Define them inline in a Server Component (with \`'use server'\` inside the function) or in a separate file with \`'use server'\` at the top (then any Client Component can import them).
- Forms with server actions work **before JavaScript loads** (progressive enhancement).
- After a mutation, call \`revalidatePath\` or \`revalidateTag\` to refresh cached data, and \`redirect()\` if needed.
- React hooks around actions: \`useActionState\` (React 19; earlier canary was \`useFormState\`) for returned state like validation errors, \`useFormStatus\` for a pending state, \`useOptimistic\` for instant UI.
- **Security**: every server action is a **public HTTP endpoint**. Anyone can call it with any data. Always **validate input** (for example with Zod) and **check auth and permissions** inside the action. Next.js uses unguessable action IDs, checks the Origin header against the Host, and can remove unused actions, but that does not replace your checks.
- Arguments and return values must be serializable. Actions are called one at a time per client (they are queued), so they are not ideal for parallel data fetching. Use them for mutations, not reads.`,
      why: `Before, a simple "add task" needed: an API route, a fetch call, loading state, error handling, and manual cache refresh. Server actions cut this to one function next to the form, with type safety end to end, progressive enhancement, and built-in cache revalidation.`,
      analogy: `A server action is like a pneumatic tube in an old bank. You put a note in the tube at the counter (the form), it shoots straight to the back office (the server), the clerk does the work, and sends back a reply — you never have to walk around the building or know which office door to use. But the back office must still check every note, because anyone can put a note in a tube.`,
      code: [
        {
          title: 'Action in its own file with validation and auth',
          lang: 'typescript',
          code: `// app/tasks/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';      // your auth helper (e.g. Auth.js)
import { db } from '@/lib/db';

const TaskSchema = z.object({ title: z.string().min(1, 'Title is required').max(100) });

export type State = { error?: string; ok?: boolean };

export async function addTask(prevState: State, formData: FormData): Promise<State> {
  const session = await auth();
  if (!session?.user) return { error: 'Please log in' };       // auth check

  const parsed = TaskSchema.safeParse({ title: formData.get('title') });
  if (!parsed.success) return { error: parsed.error.issues[0].message }; // validation

  await db.task.create({ data: { title: parsed.data.title, userId: session.user.id } });
  revalidatePath('/tasks');  // refresh the cached list
  return { ok: true };
}`,
        },
        {
          title: 'Using it in a form with pending state',
          lang: 'tsx',
          code: `// app/tasks/AddTaskForm.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addTask, type State } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus(); // must be inside the <form>
  return <button disabled={pending}>{pending ? 'Adding...' : 'Add'}</button>;
}

export function AddTaskForm() {
  const [state, formAction] = useActionState<State, FormData>(addTask, {});
  return (
    <form action={formAction}>
      <input name="title" placeholder="New task" />
      <SubmitButton />
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
    </form>
  );
}`,
        },
      ],
      output: `The user types a title and clicks "Add". The button shows "Adding..." while the action runs on the server. If the user is not logged in or the title is empty, the action returns an error and it appears in red under the form. On success the task is saved, \`revalidatePath('/tasks')\` clears the cached page, and the list on \`/tasks\` shows the new task in the same round trip — no manual \`fetch\` or \`router.refresh()\` needed.`,
      questions: [
        {
          q: 'What are server actions?',
          a: 'Async functions marked with `\'use server\'` that run on the server and can be called from forms or Client Components. Next.js creates the endpoint for you.',
        },
        {
          q: 'Server actions vs route handlers — when to use which?',
          a: 'Server actions for mutations from your own React UI (forms, buttons). Route handlers for external callers (webhooks, mobile apps, public APIs) or non-React clients.',
        },
        {
          q: 'Are server actions secure by default?',
          a: 'No. They are public endpoints. Validate input, check authentication and authorization inside every action, and never trust IDs sent from the client.',
        },
        {
          q: 'How do you show a loading state for a server action?',
          a: 'Use `useFormStatus` in a child of the form, `useActionState` (its third value is `isPending` in React 19), or `useTransition` when calling the action from an event handler.',
        },
        {
          q: 'How do you update the UI after a server action?',
          a: 'Call `revalidatePath` or `revalidateTag` in the action so the cached data is refreshed, or `redirect()` to another page. For instant feedback use `useOptimistic`.',
        },
      ],
      spoken: `"Server actions are async functions marked with use server that run on the server but can be called directly from a form or a client component. Next.js creates the endpoint behind the scenes, so for mutations I don't need to write an API route and a fetch call. Forms even work before JavaScript loads. After the mutation I call revalidatePath or revalidateTag so the UI shows fresh data. I use useActionState for errors and useFormStatus for pending state. The important thing is security: each action is a public endpoint, so I always validate input with Zod and check the session inside the action."`,
      mistakes: [
        'Skipping auth checks in an action because "only my form calls it". Anyone can call it with crafted requests.',
        'Using server actions for data fetching. They run one at a time and are meant for mutations; fetch data in Server Components instead.',
        'Forgetting to revalidate after a mutation, so the page shows stale data.',
        'Calling `redirect()` inside a try/catch in the action, which swallows the redirect.',
        'Follow-up trap: "Is \'use server\' how you make a Server Component?" No. Components are server by default; \'use server\' only marks server action functions.',
      ],
      takeaway: 'Server actions = type-safe mutations without writing an API — but treat each one as a public endpoint: validate and authorize.',
    },
    {
      id: 'hydration-errors',
      title: 'Hydration and Hydration Errors',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Hydration attaches React to server HTML; an error happens when the first browser render does not match the server HTML.',
      what: `**Hydration** is the step where React, in the browser, takes the HTML that came from the server and "brings it to life" by attaching event handlers and state. For this to work, React's **first render in the browser must produce the same HTML** as the server.

A **hydration error** (or "hydration mismatch") happens when they are different. Common causes:
- Using \`Date.now()\`, \`new Date().toLocaleString()\` or \`Math.random()\` during render.
- Reading \`window\`, \`localStorage\` or \`typeof window !== 'undefined'\` to change what you render.
- **Invalid HTML nesting**, like a \`<div>\` inside a \`<p>\`, or \`<a>\` inside \`<a>\` (the browser "fixes" it and the DOM no longer matches).
- **Browser extensions** that change the HTML (Grammarly, translators, password managers).

#### Deeper version
When there is a mismatch, React may throw away the server HTML for that part and re-render it on the client (slower, may flash), and it logs an error. Fixes:
1. **Render browser-only values after mount**: keep a \`mounted\` state set in \`useEffect\`, so the first client render matches the server.
2. **Skip SSR for a component**: \`dynamic(() => import('./Map'), { ssr: false })\` — note: in the App Router this is only allowed inside a Client Component.
3. **Format dates consistently**: pass a fixed \`timeZone\` and locale, or format on the server and pass the string.
4. **\`suppressHydrationWarning\`** on an element for a known, harmless difference (one level deep only), like a timestamp or the \`<html>\` tag when a theme script adds a class.
5. Fix invalid HTML nesting.`,
      why: `Hydration errors make the page slower (React re-renders on the client), can cause visible flicker, and sometimes break interactivity. They are very common in Next.js interviews because almost every developer hits them with dates, themes or \`localStorage\`.`,
      analogy: `The server sends a printed floor plan of a house (HTML). React arrives and expects the real house to match the plan exactly so it can install the electricity (event handlers). If the plan says "3 windows" but someone (a random number, a browser extension) changed it to 4, the electrician gets confused, tears down that wall and rebuilds it.`,
      code: [
        {
          title: 'The bug and the fix',
          lang: 'tsx',
          code: `'use client';
import { useEffect, useState } from 'react';

// BAD: server time and browser time differ -> hydration mismatch
export function BadClock() {
  return <p>Now: {new Date().toLocaleTimeString()}</p>;
}

// GOOD: first render matches the server, real value after mount
export function GoodClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    setTime(new Date().toLocaleTimeString()); // runs only in the browser
  }, []);
  return <p>Now: {time ?? '--:--'}</p>;
}

// BAD: reads localStorage during render
// const theme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light';`,
        },
        {
          title: 'Client-only component and suppressHydrationWarning',
          lang: 'tsx',
          code: `'use client';
import dynamic from 'next/dynamic';

// Never server-render the map (it uses window)
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export function StoreLocator() {
  return (
    <section>
      <Map />
      {/* A known, harmless difference: allow it on this one element */}
      <time suppressHydrationWarning>{new Date().toISOString()}</time>
    </section>
  );
}`,
        },
      ],
      output: `\`BadClock\`: the server renders "10:00:01", the browser renders "10:00:03" -> React logs a hydration error (something like "Text content does not match server-rendered HTML" — the exact message varies by React version). \`GoodClock\`: both server and first client render show "--:--", so hydration succeeds; a moment later the effect sets the real time. \`Map\` is not in the server HTML at all; the user sees "Loading map..." until the browser loads it. The \`<time>\` mismatch is silenced on purpose.`,
      questions: [
        {
          q: 'What is hydration?',
          a: 'The process where React in the browser attaches event handlers and state to server-rendered HTML, making it interactive.',
        },
        {
          q: 'What causes a hydration mismatch?',
          a: 'The first client render differs from the server HTML: dates, random values, `window`/`localStorage` checks during render, invalid HTML nesting, or browser extensions changing the DOM.',
        },
        {
          q: 'How do you fix a hydration error caused by localStorage?',
          a: 'Render a neutral default first, then read `localStorage` in `useEffect` and update state. Or load the component with `dynamic(..., { ssr: false })`.',
        },
        {
          q: 'When is suppressHydrationWarning OK to use?',
          a: 'Only for a known, harmless difference on a single element, like a timestamp or a class added to `<html>` by a theme script. It does not fix real bugs and works one level deep.',
        },
      ],
      spoken: `"Hydration is when React in the browser takes the server HTML and attaches event handlers to make it interactive. It expects its first render to match the server HTML exactly. A hydration error happens when they differ, usually because of dates or random numbers in render, reading window or localStorage during render, invalid nesting like a div inside a p, or browser extensions. My fixes are: render a stable default and update in useEffect, load browser-only components with dynamic and ssr false, format dates with a fixed timezone, and use suppressHydrationWarning only for small known differences like timestamps."`,
      mistakes: [
        'Using `typeof window !== \'undefined\'` to render different content. The server and client still render different HTML — that is the mismatch.',
        'Adding `suppressHydrationWarning` everywhere to hide real bugs.',
        'Using `dynamic(..., { ssr: false })` inside a Server Component in the App Router — it must be inside a Client Component.',
        'Follow-up trap: "The error only happens for some users — why?" Often a browser extension changing the DOM, or a timezone/locale difference in date formatting.',
      ],
      takeaway: 'The first client render must match the server HTML — move browser-only values into `useEffect` or skip SSR for that component.',
    },
    {
      id: 'authentication',
      title: 'Authentication in Next.js (Middleware, Cookies, Auth.js)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Store the session in an httpOnly cookie, check it optimistically in middleware, and verify it again where data is read or changed. Auth.js (NextAuth) handles providers and sessions.',
      what: `**Authentication** = proving who the user is (login). **Authorization** = what they are allowed to do.

The usual Next.js setup:
1. User logs in. The server creates a **session** and stores a token in an **httpOnly cookie** (JavaScript in the browser cannot read it, which protects against XSS theft).
2. **Middleware** checks if the cookie exists and redirects logged-out users away from protected pages (fast, optimistic check).
3. **Server Components, server actions and route handlers** read the session again and check permissions before touching data (the real check).

**Auth.js** (the new name of **NextAuth.js**) is the most popular library. It supports OAuth providers (Google, GitHub), email links and credentials, and gives you helpers like \`auth()\`, \`signIn()\` and \`signOut()\`.

#### Deeper version
- **Session strategies**: **JWT** (session data is signed/encrypted inside the cookie, no DB lookup, but hard to revoke instantly) vs **database sessions** (cookie holds a session ID, server looks it up, easy to revoke, one DB call per check).
- Cookie settings: \`httpOnly\`, \`secure\` (HTTPS only), \`sameSite: 'lax'\` (CSRF protection), a sensible \`maxAge\`.
- Build a **Data Access Layer (DAL)**: one \`server-only\` module with a \`verifySession()\` function used by every data function. Do not rely on layouts for auth checks — with partial rendering a layout may not re-run on every navigation.
- Auth.js v5 exports \`{ handlers, auth, signIn, signOut }\` from one config file; the API routes are mounted at \`app/api/auth/[...nextauth]/route.ts\`. API details differ between v4 and v5 — check the docs for your version.
- Alternatives: Clerk, Auth0, Supabase Auth, Firebase Auth, Lucia-style custom sessions, or the \`iron-session\`/\`jose\` libraries for your own signed cookies.`,
      why: `Next.js runs code in several places (middleware, server, client), so auth has to work in all of them. Cookies are sent automatically with every request, so the server can know the user during SSR — something \`localStorage\` tokens cannot do. Checking in both middleware and the data layer gives good UX (fast redirects) and real security.`,
      analogy: `An httpOnly cookie is a wristband at a festival. The guard at the gate (middleware) glances at it and turns away people without one. But each bar inside (server action, data function) still scans the wristband before serving drinks, because someone could have sneaked past the gate. Auth.js is the company that prints and checks the wristbands for you.`,
      code: [
        {
          title: 'Auth.js v5 setup',
          lang: 'typescript',
          code: `// auth.ts (project root)
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub], // reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from env
  session: { strategy: 'jwt' },
});

// app/api/auth/[...nextauth]/route.ts
// import { handlers } from '@/auth';
// export const { GET, POST } = handlers;

// middleware.ts — optimistic protection (proxy.ts in Next 16+)
// export { auth as middleware } from '@/auth';
// export const config = { matcher: ['/dashboard/:path*'] };`,
        },
        {
          title: 'Checking the session where data is used',
          lang: 'tsx',
          code: `// app/dashboard/page.tsx (Server Component)
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();          // real check on the server
  if (!session?.user) redirect('/login');

  return (
    <main>
      <h1>Welcome {session.user.name}</h1>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
      >
        <button>Sign out</button>
      </form>
    </main>
  );
}`,
        },
        {
          title: 'Custom cookie session (no library)',
          lang: 'typescript',
          code: `// lib/session.ts
import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(key);
  (await cookies()).set('session', token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
}

export async function verifySession() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { userId: string };
  } catch {
    return null; // expired or tampered
  }
}`,
        },
      ],
      output: `A logged-out user hitting \`/dashboard\` is redirected by middleware before the page renders. If they somehow get past it, \`await auth()\` in the page returns no session and \`redirect('/login')\` runs. A logged-in user sees "Welcome Asha" and can sign out through a server action. In the custom version, \`createSession\` sets a signed, httpOnly cookie valid for 7 days; \`verifySession\` returns \`{ userId }\` or \`null\` if the token is missing, expired or changed.`,
      questions: [
        {
          q: 'How do you implement authentication in Next.js?',
          a: 'Store a session in an httpOnly secure cookie, redirect logged-out users in middleware, and verify the session again in Server Components, server actions and route handlers. Often with Auth.js or a provider like Clerk.',
        },
        {
          q: 'Why use cookies instead of localStorage for tokens in Next.js?',
          a: 'Cookies are sent automatically to the server, so SSR and Server Components know the user. httpOnly cookies also cannot be read by injected JavaScript, unlike localStorage.',
        },
        {
          q: 'JWT session vs database session?',
          a: 'JWT: data is in the signed cookie, no DB lookup, but hard to revoke before expiry. Database session: cookie holds an ID, easy to revoke, but needs a lookup per request.',
        },
        {
          q: 'Why is checking auth only in middleware not enough?',
          a: 'Middleware is an optimistic gate. Server actions and route handlers are callable directly, and bugs or bypasses can happen, so the data layer must verify the session and permissions too.',
        },
        {
          q: 'Should you check auth in a layout?',
          a: 'Not as the only check. Layouts may not re-render on every navigation, so put checks close to the data (pages, actions, a data access layer).',
        },
      ],
      spoken: `"In Next.js I keep the session in an httpOnly, secure, sameSite cookie, so the server knows the user during rendering and JavaScript can't steal it. Middleware does a fast optimistic check and redirects logged-out users from protected routes. Then I verify the session again close to the data, in Server Components, server actions and route handlers, usually through a small server-only data access layer. For providers like Google or GitHub I use Auth.js, previously NextAuth, which gives me an auth helper on the server plus sign-in and sign-out. I pick JWT sessions for simplicity or database sessions when I need instant revocation."`,
      mistakes: [
        'Storing access tokens in `localStorage` — readable by any XSS script and invisible to the server during SSR.',
        'Protecting only the page but not the server action or route handler that changes data.',
        'Relying only on middleware (remember CVE-2025-29927 — a middleware bypass in older versions).',
        'Checking only "is logged in" but not "is allowed" (authorization), e.g. user A editing user B\'s order by changing the ID.',
        'Follow-up trap: "How do you protect against CSRF with cookie auth?" `sameSite=lax` or `strict` cookies, and server actions compare the Origin and Host headers; for custom POST APIs add CSRF tokens or origin checks.',
      ],
      takeaway: 'httpOnly cookie for the session, middleware for fast redirects, and a real auth + permission check next to every data read and write.',
    },
    {
      id: 'deployment',
      title: 'Deployment: Vercel, next start and Standalone Docker',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Deploy to Vercel with zero config, self-host with next build + next start on Node, or use output: standalone for small Docker images. Static export is the no-server option.',
      what: `There are three main ways to run a Next.js app in production:

1. **Vercel** (the company behind Next.js): push to Git, it builds and deploys. Serverless functions, CDN, image optimization and ISR work automatically.
2. **Self-host on Node.js**: run \`next build\` then \`next start\` on any server (EC2, a VM, Render, Railway). All features work, because it is a full Node server.
3. **Docker with standalone output**: set \`output: 'standalone'\` in \`next.config\`. The build creates a small folder with only the files and \`node_modules\` needed to run, plus a \`server.js\`. Great for Kubernetes, AWS ECS, or Google Cloud Run.

There is also **static export** (\`output: 'export'\`): plain HTML/CSS/JS files for S3 or any static host — but no SSR, ISR, server actions, route handlers with dynamic data, middleware, or default image optimization.

#### Deeper version
- The standalone folder does **not** include \`public/\` and \`.next/static\` — copy them in your Dockerfile (or serve them from a CDN).
- When self-hosting with **multiple instances**, each has its own local cache (ISR / data cache on disk). Configure a shared **custom cache handler** (for example Redis) so instances do not serve different versions, and set the same build ID / server actions encryption key across instances. Check the self-hosting docs for your version.
- Image optimization on your own server uses CPU; consider a CDN loader for heavy traffic.
- Put a CDN or reverse proxy (CloudFront, Nginx) in front for static assets and caching.
- Other platforms (Netlify, AWS Amplify, Cloudflare via OpenNext adapters) support Next.js too, with some feature differences.
- Environment: \`NEXT_PUBLIC_\` vars are baked in at **build** time — build the image per environment or read config on the server at runtime.`,
      why: `Knowing the options lets you choose based on cost, control and company rules. Vercel is fastest to start; many companies must run in their own AWS/GCP account, so Docker + standalone is a common interview topic for full-stack engineers.`,
      analogy: `Vercel is staying at a full-service hotel: you just arrive with your bags (code). \`next start\` is renting an apartment: everything works, but you manage the electricity and repairs. Standalone Docker is packing a ready-to-live camper van: only what you need, and you can park it anywhere. Static export is a printed brochure: very cheap to hand out, but it cannot answer questions.`,
      code: [
        {
          title: 'Config and Node self-hosting',
          lang: 'bash',
          code: `# next.config.js
#   module.exports = { output: 'standalone' };

npm ci
npm run build          # next build -> creates .next/
npm run start          # next start -> production server on port 3000
PORT=8080 npm run start  # custom port

# Typically run with a process manager:
# pm2 start npm --name web -- start`,
        },
        {
          title: 'Multi-stage Dockerfile with standalone output',
          lang: 'dockerfile',
          code: `# 1. Install deps and build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Small runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone server + minimal node_modules
COPY --from=builder /app/.next/standalone ./
# static assets are NOT included in standalone - copy them
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "server.js"]`,
        },
      ],
      output: `\`npm run build\` compiles the app and prints a table of routes (static vs dynamic). \`npm run start\` serves it on port 3000. The Docker build uses two stages: the first builds, the second copies only the standalone server and static files, so the final image is much smaller than copying the whole project with all \`node_modules\`. Running the container starts \`node server.js\` listening on \`0.0.0.0:3000\`, ready for Cloud Run, ECS or Kubernetes.`,
      questions: [
        {
          q: 'How do you deploy Next.js outside Vercel?',
          a: 'Run `next build` and `next start` on a Node server, or build a Docker image using `output: \'standalone\'` and run `node server.js`. Static sites can use `output: \'export\'`.',
        },
        {
          q: 'What does output: standalone do?',
          a: 'It traces which files are needed at runtime and copies them, with a minimal `node_modules` and a `server.js`, into `.next/standalone` — ideal for small Docker images.',
        },
        {
          q: 'What do you lose with static export?',
          a: 'Anything that needs a server at request time: SSR, ISR, server actions, middleware, dynamic route handlers, cookies/headers, and default image optimization.',
        },
        {
          q: 'What is a challenge when running multiple self-hosted instances?',
          a: 'Each instance has its own cache, so ISR and the data cache can get out of sync. Use a shared custom cache handler (like Redis) and consistent build settings across instances.',
        },
      ],
      spoken: `"Next.js can be deployed in a few ways. The easiest is Vercel, where you connect the repo and everything, including ISR and image optimization, works out of the box. For self-hosting I run next build and next start on a Node server, and for containers I set output to standalone, which produces a minimal server.js and node_modules, so my Docker image stays small. I remember to copy the public folder and .next/static. With multiple instances, I configure a shared cache handler so ISR stays consistent. If the site is fully static, output export lets me host it on S3 and CloudFront."`,
      mistakes: [
        'Forgetting to copy `public/` and `.next/static` into the standalone Docker image, so CSS, JS and images return 404.',
        'Using `next dev` in production. It is slow and not optimized.',
        'Expecting `NEXT_PUBLIC_` values to change per environment without rebuilding the image.',
        'Using `output: \'export\'` and then wondering why server actions or middleware do not work.',
        'Follow-up trap: "Is Next.js only for Vercel?" No. It is open source and runs anywhere Node.js runs; Vercel just automates the infrastructure.',
      ],
      takeaway: 'Vercel for zero-config, `next start` or standalone Docker for self-hosting, and static export only when you need no server at all.',
    },
    {
      id: 'next-config-redirects-headers',
      title: 'next.config: Redirects, Rewrites and Headers',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'next.config.js sets app-wide options: redirects for moved URLs, rewrites for proxying, custom headers, images, output mode and more.',
      what: `\`next.config.js\` (or \`.mjs\` / \`.ts\` in newer versions) is the settings file for your Next.js app. Some of the most used options:
- **\`redirects\`**: send old URLs to new ones (301/308 permanent or 307 temporary).
- **\`rewrites\`**: map a URL to another path or **another server** without changing the address bar (a simple proxy).
- **\`headers\`**: add HTTP headers (security headers, CORS, caching) to matching paths.
- **\`images\`**, **\`output\`**, **\`basePath\`**, **\`env\`**, **\`experimental\`** flags.

#### Deeper version
- Order of checks (simplified): \`headers\` -> \`redirects\` -> middleware -> \`rewrites\` (beforeFiles) -> filesystem routes (pages, public files) -> \`rewrites\` (afterFiles/fallback). Exact order is in the routing docs.
- Config redirects are **static rules** — good for known moves. For logic (user role, cookies, country), use middleware.
- A rewrite to an external API is a handy way to avoid CORS in the browser: the browser calls \`/api/legacy/...\` on your domain and Next.js forwards it.
- Changing \`next.config\` requires a server restart in dev.
- Security headers commonly added: \`Content-Security-Policy\`, \`X-Frame-Options\`, \`Strict-Transport-Security\`, \`Referrer-Policy\`.`,
      why: `Real sites rename URLs (SEO needs 301s), split old and new backends (rewrites let you migrate gradually), and need security headers on every response. Doing this in config is declarative, fast, and keeps it out of page code.`,
      analogy: `\`next.config\` is the building's rulebook at the reception. "Room 12 moved to room 40" (redirect), "Letters for the old office go to the new office, but keep the old address on the envelope" (rewrite), "Every visitor gets a safety badge" (headers).`,
      code: [
        {
          title: 'Redirects, rewrites and headers',
          lang: 'javascript',
          code: `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old blog URLs -> new structure, permanent (308) for SEO
      { source: '/articles/:slug', destination: '/blog/:slug', permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Browser calls /legacy-api/users -> forwarded to the old Express server
      { source: '/legacy-api/:path*', destination: 'https://old-api.example.com/:path*' },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;`,
        },
      ],
      output: `- \`/articles/hello\` responds with a 308 redirect; the address bar becomes \`/blog/hello\`, and search engines move the ranking to the new URL.
- \`/legacy-api/users\` is fetched from \`https://old-api.example.com/users\`, but the browser only sees your domain — no CORS problem.
- Every response includes \`X-Frame-Options: DENY\` (no embedding in iframes) and the referrer policy header.`,
      questions: [
        {
          q: 'What is the difference between a redirect and a rewrite in next.config?',
          a: 'A redirect changes the URL in the browser (the client makes a new request). A rewrite keeps the URL and serves content from another path or server.',
        },
        {
          q: 'permanent: true vs false?',
          a: '`true` sends 308 (permanent; browsers and search engines cache it). `false` sends 307 (temporary).',
        },
        {
          q: 'When use middleware instead of config redirects?',
          a: 'When the decision depends on the request: cookies, auth, headers, geolocation, or A/B test buckets. Config redirects are static rules.',
        },
      ],
      spoken: `"next.config is where I set app-wide behaviour. I use redirects for moved URLs, with permanent true for SEO-friendly 308s, rewrites to proxy a path to another backend without changing the URL, which also avoids CORS during migrations, and headers to add security headers like X-Frame-Options or a Content Security Policy to every response. It's also where I configure images remote patterns and the output mode like standalone. For anything that depends on cookies or the user, I use middleware instead, because config rules are static."`,
      mistakes: [
        'Using a temporary redirect for a permanent URL change, so search engines keep the old URL.',
        'Putting user-specific logic in config redirects; they cannot read sessions — use middleware.',
        'Forgetting to restart the dev server after changing `next.config`.',
        'Follow-up trap: "Do 308 redirects get cached by browsers?" Yes, permanent redirects can be cached, so test with temporary redirects first.',
      ],
      takeaway: '`next.config` holds static, app-wide rules: redirects for moved URLs, rewrites for proxying, headers for security.',
    },
    {
      id: 'caching-revalidation',
      title: 'Caching and Revalidation (and How Defaults Changed)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'App Router has four caching layers — request memoization, data cache, full route cache, router cache — refreshed with revalidate, revalidatePath and revalidateTag. Defaults changed in Next 15.',
      what: `**Caching** means saving a result so you do not compute or fetch it again. The App Router has **four layers**:

1. **Request memoization** (server, one request): the same \`fetch\` (same URL and options) called many times during **one render** runs only once.
2. **Data Cache** (server, across requests): saves \`fetch\` results so other users and later requests reuse them.
3. **Full Route Cache** (server): saves the rendered **HTML + RSC payload** of static routes, usually at build time.
4. **Router Cache** (browser, in memory): saves visited and prefetched route segments so back/forward and navigation are instant.

**Revalidation** means "throw this cache away and get fresh data":
- **Time-based**: \`fetch(url, { next: { revalidate: 60 } })\` or \`export const revalidate = 60\`.
- **On-demand**: \`revalidatePath('/products')\` or \`revalidateTag('products')\` after a change (in a server action or a webhook).
- **Opt out**: \`fetch(url, { cache: 'no-store' })\` or \`export const dynamic = 'force-dynamic'\`.

#### Deeper version — what changed between versions
**These defaults changed. Always check the caching docs for your exact version.**
- **Next 14**: \`fetch\` was **cached by default** (\`force-cache\`). \`GET\` route handlers could be cached. The client Router Cache kept dynamic pages for about 30 seconds.
- **Next 15**: \`fetch\` is **not cached by default** (you opt in with \`cache: 'force-cache'\` or \`next.revalidate\`). \`GET\` route handlers are **not cached** by default. The Router Cache no longer reuses page segments by default (stale time 0 for pages; layouts and \`loading.tsx\` are still reused for back/forward). A route can still be statically rendered if it uses no dynamic APIs.
- **Newer versions (16+)**: a new opt-in model called **Cache Components** with the \`'use cache'\` directive and \`cacheLife\`/\`cacheTag\`, and changes to the \`revalidateTag\` signature plus a new \`updateTag\` for server actions. The details are still evolving — read the docs for your version before relying on them.

Other key facts:
- \`revalidateTag\`/\`revalidatePath\` invalidate the Data Cache and Full Route Cache; called from a **server action**, they also refresh the Router Cache for the current user. \`router.refresh()\` only refreshes the client Router Cache.
- For non-fetch data (DB queries) use \`unstable_cache\` (older API) or \`'use cache'\` (newer), and React \`cache()\` for per-request dedupe.
- Using \`cookies()\`, \`headers()\`, \`searchParams\` or \`connection()\` makes the route dynamic, skipping the Full Route Cache.`,
      why: `Caching is the main reason Next.js apps are fast and cheap: most pages do not need to hit the database on every request. But wrong caching shows **stale or even another user's data**, and it is the most confusing part of the App Router — so interviewers love it. Knowing the layers lets you debug "why is my page not updating?".`,
      analogy: `Think of a newspaper office:
- **Request memoization**: during writing one edition, if two reporters need the same weather report, they call the weather service once.
- **Data Cache**: the office keeps yesterday's weather report on file for everyone until it expires.
- **Full Route Cache**: whole printed newspapers stacked and ready to hand out.
- **Router Cache**: the copy already in the reader's hand.
- **revalidateTag**: the editor shouts "all stories tagged 'sports' are outdated!" and they are re-printed on the next request.`,
      code: [
        {
          title: 'Explicit fetch caching (works the same on Next 14 and 15)',
          lang: 'tsx',
          code: `// app/products/page.tsx
export default async function Products() {
  // Cache and share across requests; refresh every hour; tag it for on-demand invalidation
  const products = await fetch('https://api.example.com/products', {
    cache: 'force-cache',
    next: { revalidate: 3600, tags: ['products'] },
  }).then((r) => r.json());

  // Never cache (always fresh)
  const stock = await fetch('https://api.example.com/stock', { cache: 'no-store' })
    .then((r) => r.json());

  return <p>{products.length} products, {stock.total} in stock</p>;
}

// Route segment config (applies to the whole route)
// export const revalidate = 3600;          // ISR for the route
// export const dynamic = 'force-dynamic';  // always render per request`,
        },
        {
          title: 'On-demand revalidation from a server action and a webhook',
          lang: 'typescript',
          code: `// app/admin/actions.ts
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updatePrice(id: string, price: number) {
  // ...check auth, then save to the database
  revalidateTag('products');         // every fetch tagged 'products' is stale now
  revalidatePath(\`/products/\${id}\`);  // and this specific page
  // Note: newer versions (16+) changed revalidateTag's options and added updateTag — check docs.
}

// app/api/revalidate/route.ts — called by a CMS webhook
import { NextRequest } from 'next/server';
export async function POST(req: NextRequest) {
  if (req.headers.get('x-secret') !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag('products');
  return Response.json({ revalidated: true, now: Date.now() });
}`,
        },
        {
          title: 'Caching a database query (non-fetch)',
          lang: 'typescript',
          code: `// lib/products.ts
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

export const getFeatured = unstable_cache(
  async () => db.product.findMany({ where: { featured: true } }),
  ['featured-products'],                 // cache key parts
  { revalidate: 600, tags: ['products'] } // 10 minutes, tagged
);
// Newer versions offer 'use cache' + cacheTag/cacheLife instead; check your version.`,
        },
      ],
      output: `The product list is fetched once, shared by all users, and refreshed at most every hour — or immediately when an admin calls \`updatePrice\` or the CMS hits the webhook, because both call \`revalidateTag('products')\`. The stock number is always fresh because of \`no-store\`, which also makes the route dynamic. \`getFeatured\` queries the database at most once every 10 minutes, unless the \`products\` tag is revalidated first. Because the code sets cache options **explicitly**, it behaves the same on Next 14 and 15.`,
      questions: [
        {
          q: 'What are the caching layers in the Next.js App Router?',
          a: 'Request memoization (dedupe within one render), Data Cache (fetch results across requests), Full Route Cache (rendered HTML/RSC of static routes), and the client-side Router Cache.',
        },
        {
          q: 'What changed about caching in Next.js 15?',
          a: '`fetch` and GET route handlers are no longer cached by default, and the client Router Cache no longer reuses page segments by default. You opt in explicitly. Always check the docs for your version.',
        },
        {
          q: 'revalidatePath vs revalidateTag?',
          a: '`revalidatePath` invalidates the cache for a specific route. `revalidateTag` invalidates every cached fetch with that tag, across all routes that use it — more precise for shared data.',
        },
        {
          q: 'My page is not showing updated data. How do you debug it?',
          a: 'Check the build output (static or dynamic?), check fetch cache options and route `revalidate`, confirm the mutation calls `revalidatePath`/`revalidateTag`, and remember the browser Router Cache — a server action revalidation or `router.refresh()` refreshes it.',
        },
        {
          q: 'How do you cache a database query that is not a fetch?',
          a: 'Use `unstable_cache` with keys, revalidate and tags (or `\'use cache\'` in newer versions). Use React `cache()` only for per-request dedupe.',
        },
      ],
      spoken: `"The App Router has four caches. Request memoization dedupes the same fetch within one render. The Data Cache stores fetch results across requests. The Full Route Cache stores the rendered HTML and RSC payload of static routes. And the Router Cache keeps visited segments in the browser. I refresh data with time-based revalidate or on demand with revalidatePath or revalidateTag, usually from a server action or a CMS webhook. The defaults changed a lot: in Next 14 fetch was cached by default, in Next 15 it isn't, and Next 16 adds 'use cache'. So I always set caching explicitly and check the docs for the version."`,
      mistakes: [
        'Assuming the fetch default from a blog post. Next 14 and Next 15 behave differently — set `cache` or `next.revalidate` explicitly.',
        'Caching user-specific data in the shared Data Cache (for example, fetching with a user token and `force-cache`), which can leak data between users.',
        'Calling `revalidatePath` in a Client Component. It only works on the server (server actions, route handlers).',
        'Forgetting the browser Router Cache when debugging "stale after mutation" — the server cache is fresh but the client still shows old segments.',
        'Follow-up trap: "Does `no-store` on one fetch affect the whole page?" Yes. It opts the route into dynamic rendering, so the Full Route Cache is skipped for that route.',
      ],
      takeaway: 'Know the four layers, set caching explicitly per fetch or route, revalidate with tags after mutations, and check your version because defaults changed.',
    },
    {
      id: 'static-vs-dynamic-rendering',
      title: 'Static vs Dynamic Rendering and Route Segment Config',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'App Router routes are static unless they use request-time data; route segment config (dynamic, revalidate, runtime) overrides this.',
      what: `In the App Router you do not choose SSR or SSG by a function name. Next.js decides **per route**:
- **Static rendering**: the route is rendered at build time (or after revalidation) and cached. This is the default.
- **Dynamic rendering**: the route is rendered **on every request**.

A route switches to dynamic when it uses a **Dynamic API**: \`cookies()\`, \`headers()\`, \`searchParams\`, \`connection()\`, \`draftMode()\`, or an uncached data request.

**Route segment config** lets you override this with exports from \`page.tsx\`, \`layout.tsx\` or \`route.ts\`:
- \`export const dynamic = 'auto' | 'force-dynamic' | 'force-static' | 'error'\`
- \`export const revalidate = false | 0 | number\`
- \`export const runtime = 'nodejs' | 'edge'\`
- \`export const dynamicParams = true | false\`

#### Deeper version
- \`dynamic = 'error'\` makes the build **fail** if something dynamic sneaks in — useful to guarantee a page stays static.
- \`force-static\` makes \`cookies()\`/\`headers()\` return empty values instead of making the route dynamic.
- Using a Dynamic API in a **layout** makes every page under it dynamic. Keep cookie reads low in the tree.
- **Partial Prerendering (PPR)**: a newer model where one route has a **static shell** sent instantly from the CDN plus **dynamic holes** (inside \`<Suspense>\`) streamed per request. It started as experimental in Next 14/15 and became part of the Cache Components model in later versions — check the docs for your version before using it.
- Check what happened with \`next build\`: the output lists each route as static or dynamic (labels vary by version).`,
      why: `Static pages are faster and cheaper. One accidental \`cookies()\` call in a shared layout can turn your whole site dynamic and slow it down. Understanding the rules and the segment config lets you control performance on purpose instead of by accident.`,
      analogy: `A static route is a pre-printed menu that everyone gets. A dynamic route is a menu printed fresh for each guest because it shows their name. If the head waiter (layout) insists on writing every guest's name on the cover, then **every** menu in the restaurant must be printed fresh. PPR is a pre-printed menu with one blank box where the waiter writes today's special for you.`,
      code: [
        {
          title: 'Route segment config examples',
          lang: 'tsx',
          code: `// app/pricing/page.tsx -> must stay static, fail the build if not
export const dynamic = 'error';
export default function Pricing() {
  return <h1>Pricing</h1>;
}

// app/feed/page.tsx -> always render per request
export const dynamic = 'force-dynamic';
export default async function Feed() {
  const posts = await fetch('https://api.example.com/feed').then((r) => r.json());
  return <ul>{posts.map((p: { id: string; text: string }) => <li key={p.id}>{p.text}</li>)}</ul>;
}

// app/news/page.tsx -> static, regenerate at most every 10 minutes
export const revalidate = 600;
export default async function News() {
  const items = await fetch('https://api.example.com/news').then((r) => r.json());
  return <p>{items.length} stories</p>;
}`,
        },
        {
          title: 'Keep the dynamic part small',
          lang: 'tsx',
          code: `// app/layout.tsx — do NOT read cookies here (would make every page dynamic)
import { Suspense } from 'react';
import { UserMenu } from './UserMenu';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <Suspense fallback={<span>...</span>}>
            <UserMenu /> {/* reads cookies inside; only this part is dynamic (with PPR) */}
          </Suspense>
        </header>
        {children}
      </body>
    </html>
  );
}`,
        },
      ],
      output: `\`/pricing\` is built once; if someone later adds \`cookies()\` to it, \`next build\` fails with an error, protecting performance. \`/feed\` renders on every request. \`/news\` is static and refreshed in the background every 10 minutes at most. In the layout example, the cookie read is isolated inside \`UserMenu\` behind Suspense. Without PPR, a Dynamic API still makes that route dynamic, but at least the rest of the tree is ready to become a static shell when PPR is enabled.`,
      questions: [
        {
          q: 'What makes an App Router route dynamic?',
          a: 'Using Dynamic APIs like `cookies()`, `headers()`, `searchParams`, `connection()`, uncached data, or setting `dynamic = \'force-dynamic\'` / `revalidate = 0`.',
        },
        {
          q: 'What does export const dynamic = "error" do?',
          a: 'It forces static rendering and makes the build fail if the route uses any dynamic API — a guard to keep a page static.',
        },
        {
          q: 'What is Partial Prerendering?',
          a: 'A rendering model where a route has a static shell served instantly and dynamic parts inside Suspense streamed per request. Its status and API changed across versions, so check the docs.',
        },
        {
          q: 'How do you check if a route is static or dynamic?',
          a: 'Run `next build`; the route table marks each route as static or dynamic. You can also enforce it with `dynamic = \'error\'`.',
        },
      ],
      spoken: `"In the App Router, routes are static by default and Next.js switches a route to dynamic rendering when it detects request-time data, like cookies, headers, searchParams or uncached fetches. I can override that with route segment config: dynamic force-dynamic, force-static, or error, which fails the build if a page that should be static becomes dynamic. Revalidate sets ISR for the whole route and runtime picks Node or Edge. A common mistake is reading cookies in the root layout, which makes the whole app dynamic. Partial Prerendering goes further with a static shell and streamed dynamic holes, but its API depends on the version."`,
      mistakes: [
        'Reading `cookies()` or `headers()` in the root layout, turning every page dynamic.',
        'Setting `force-static` on a page that needs user data — `cookies()` then returns empty values and the page shows wrong content.',
        'Not checking the `next build` output after changes.',
        'Follow-up trap: "Is a dynamic route the same as a [slug] route?" No. `[slug]` is a dynamic *segment* in the URL; it can still be statically rendered with `generateStaticParams`. Dynamic *rendering* is about rendering per request.',
      ],
      takeaway: 'Static by default, dynamic when you touch request data — use segment config to control it and keep dynamic reads low in the tree.',
    },
    {
      id: 'edge-runtime',
      title: 'Edge Runtime vs Node.js Runtime',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Edge runtime is a lightweight Web-API-only environment that starts fast and runs close to users; Node.js runtime supports all Node APIs and npm packages.',
      what: `Next.js server code can run in two **runtimes** (environments):

- **Node.js runtime** (default): full Node.js. You can use \`fs\`, native modules, Mongoose, Prisma with its normal engine, the Stripe SDK — everything.
- **Edge runtime**: a small, fast environment based on **Web APIs** (\`fetch\`, \`Request\`, \`Response\`, \`crypto.subtle\`, streams). It can run in many locations near the user and starts almost instantly. But many Node APIs and npm packages do **not** work there.

You choose per route: \`export const runtime = 'edge'\`.

#### Deeper version
- Edge limits: no \`fs\`, no native addons, limited or no TCP sockets (many classic database drivers need TCP), a **size limit** on the code bundle, and execution-time limits set by the platform. You need HTTP-based databases or drivers made for the edge (for example HTTP data APIs, serverless Postgres drivers).
- Being close to the user only helps if your **data** is also close. If an edge function in Mumbai talks to a database in Virginia, every query crosses the ocean — often slower than a Node function next to the database.
- Middleware has traditionally run on the Edge runtime; newer Next versions also allow Node.js there.
- Platforms change their advice: Vercel, for example, now often recommends the Node.js runtime for most workloads. Check current docs before choosing edge.
- Edge is not available with \`output: 'export'\`, and some features (like ISR) may not be supported with \`runtime = 'edge'\` depending on version.`,
      why: `Edge is great for small, latency-sensitive logic that does not need a nearby database: redirects, geolocation, A/B testing, auth token checks, feature flags, and streaming responses from AI APIs. Node.js is the right default for anything using a database or heavy libraries.`,
      analogy: `The Node.js runtime is the main office with every tool and the file cabinets (database) right there. The Edge runtime is a small kiosk in every neighbourhood: very quick to reach and open instantly, but it only has a few tools. If the kiosk must phone the main office for every answer, the customer is not actually served faster.`,
      code: [
        {
          title: 'An edge route handler (geo + streaming)',
          lang: 'typescript',
          code: `// app/api/hello/route.ts
export const runtime = 'edge'; // run on the Edge runtime

export async function GET(req: Request) {
  // Platform-provided geo headers (example: Vercel sets x-vercel-ip-country)
  const country = req.headers.get('x-vercel-ip-country') ?? 'unknown';

  // Stream a response using Web Streams (works on edge)
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(\`Hello visitor from \${country}\\n\`));
      controller.enqueue(encoder.encode('Streaming works on the edge.\\n'));
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
}`,
        },
        {
          title: 'Node.js runtime for database work (default)',
          lang: 'typescript',
          code: `// app/api/orders/route.ts
export const runtime = 'nodejs'; // the default, written here for clarity

import mongoose from 'mongoose'; // needs TCP sockets -> Node.js runtime

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const count = await mongoose.connection.db!.collection('orders').countDocuments();
  return Response.json({ count });
}`,
        },
      ],
      output: `The edge route responds very fast from a location near the user and streams two lines: "Hello visitor from IN" (if the platform provides the header) and "Streaming works on the edge." The orders route runs on Node.js because Mongoose needs Node APIs and TCP; if you set \`runtime = 'edge'\` there, the build or the request would fail with an unsupported-module error.`,
      questions: [
        {
          q: 'What is the Edge runtime?',
          a: 'A lightweight server environment based on Web APIs that starts quickly and can run near users. It does not support all Node.js APIs or native npm packages.',
        },
        {
          q: 'When would you choose Edge over Node.js?',
          a: 'For small, fast logic that does not need a nearby database: middleware, redirects, geolocation, A/B tests, token checks, or streaming from an external AI API.',
        },
        {
          q: 'Why can edge be slower than Node.js?',
          a: 'If the function is near the user but the database is far away, each query is a long trip. Running Node near the database can be faster overall.',
        },
        {
          q: 'How do you set the runtime for a route?',
          a: 'Export `const runtime = \'edge\'` or `\'nodejs\'` from the page, layout or route handler.',
        },
      ],
      spoken: `"Next.js can run server code on two runtimes. The default is Node.js, which supports everything, like Mongoose, Prisma, the file system and native modules. The Edge runtime is a lighter environment built on Web APIs like fetch, Request, Response and streams. It starts very fast and can run close to the user, but many Node packages don't work and there are size limits. I use edge for lightweight things like redirects, geolocation or streaming AI responses. For database work I stick with Node, because an edge function far from the database is often slower overall."`,
      mistakes: [
        'Choosing edge "because it is faster" while the database is in one region far away.',
        'Importing Node-only packages (fs, Mongoose, bcrypt native) in edge code and getting build errors.',
        'Assuming every feature works on edge. Support for some features differs by version — check the docs.',
        'Follow-up trap: "Is the Edge runtime the same as a CDN cache?" No. A CDN serves cached files; the edge runtime executes your code per request.',
      ],
      takeaway: 'Node.js is the safe default; use Edge only for small, latency-sensitive logic that does not need a faraway database.',
    },
    {
      id: 'performance-optimization',
      title: 'Performance: next/dynamic, next/script and Bundle Size',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Ship less JavaScript: keep components on the server, lazy-load heavy client parts with next/dynamic, load third-party scripts with next/script, and measure with a bundle analyzer.',
      what: `Next.js is fast by default, but big apps still get slow when too much JavaScript is sent to the browser. The main tools:
- **Server Components first**: code that stays on the server costs the browser nothing.
- **\`next/dynamic\`**: lazy-load a heavy Client Component (charts, editors, maps) only when it is rendered, as a separate JS chunk.
- **\`next/script\`**: load third-party scripts (analytics, chat widgets) with a **strategy** so they do not block the page.
- **\`next/image\`** and **\`next/font\`**: avoid heavy images and layout shift.
- **Bundle analyzer**: see which packages make your bundle big.

#### Deeper version
- Next.js already does **automatic code splitting per route**: each page only loads its own code.
- \`next/dynamic\` = \`React.lazy\` + \`Suspense\` with extras (a \`loading\` component and \`ssr: false\` option, which must be used inside a Client Component in the App Router). You can also \`await import('lib')\` inside an event handler to load a library only on click.
- \`next/script\` strategies: \`beforeInteractive\` (critical, rare), \`afterInteractive\` (default, after hydration), \`lazyOnload\` (when the browser is idle), and \`worker\` (experimental, Partytown).
- Watch **barrel files** (\`index.ts\` that re-exports everything) and large icon/utility libraries; \`optimizePackageImports\` in \`next.config\` helps for some packages (check docs).
- Measure with **Core Web Vitals**: LCP (loading), INP (interactivity), CLS (layout shift). \`useReportWebVitals\` or Vercel Speed Insights / Lighthouse.
- Also: stream slow data with Suspense, cache data, avoid waterfalls, and prefer static rendering.`,
      why: `Every kilobyte of JavaScript must be downloaded, parsed and executed — slow on mid-range phones. Users leave slow sites, and Google uses Core Web Vitals in ranking. Interviewers ask "how would you make a slow Next.js page faster?" to see if you know the practical levers.`,
      analogy: `Packing for a trip: Server Components mean leaving things at home that you do not need to carry. \`next/dynamic\` is packing the heavy winter jacket in a separate bag that is only sent if it gets cold. \`next/script\` is telling the hotel to deliver the newspaper after you have checked in, not to block the door while you are arriving.`,
      code: [
        {
          title: 'Lazy-load a heavy chart and a library on demand',
          lang: 'tsx',
          code: `'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Separate chunk; loaded only when <RevenueChart /> is rendered
const RevenueChart = dynamic(() => import('./RevenueChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // the chart library uses window
});

export function Reports() {
  const [show, setShow] = useState(false);

  async function exportCsv() {
    const Papa = (await import('papaparse')).default; // loaded only on click
    const csv = Papa.unparse([{ month: 'Jan', revenue: 100 }]);
    console.log(csv);
  }

  return (
    <>
      <button onClick={() => setShow(true)}>Show chart</button>
      <button onClick={exportCsv}>Export CSV</button>
      {show && <RevenueChart />}
    </>
  );
}`,
        },
        {
          title: 'Third-party scripts and bundle analysis',
          lang: 'tsx',
          code: `// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Loads after the page is interactive, never blocks rendering */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" strategy="afterInteractive" />
        {/* Chat widget: wait until the browser is idle */}
        <Script src="https://widget.example-chat.com/loader.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}

// Bundle analyzer (terminal):
//   npm i -D @next/bundle-analyzer
//   next.config.js: const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
//                   module.exports = withBundleAnalyzer({});
//   ANALYZE=true npm run build`,
        },
      ],
      output: `The first page load does not include the chart library or \`papaparse\`. Clicking "Show chart" downloads the chart chunk and shows "Loading chart..." until it is ready. Clicking "Export CSV" downloads \`papaparse\` only then, and logs \`month,revenue\` / \`Jan,100\`. The analytics script loads after hydration and the chat widget when the browser is idle, so neither delays the first paint. Running the analyzer opens a visual map of your bundles so you can spot the biggest packages.`,
      questions: [
        {
          q: 'How would you make a slow Next.js page faster?',
          a: 'Measure first (Lighthouse, Web Vitals, bundle analyzer). Then: move code to Server Components, lazy-load heavy client parts with next/dynamic, optimize images and fonts, load third-party scripts with next/script, cache/stream data, avoid waterfalls, and prefer static rendering.',
        },
        {
          q: 'What does next/dynamic do?',
          a: 'It lazy-loads a component as a separate chunk, with an optional loading UI and an option to skip server rendering. It is built on React.lazy and Suspense.',
        },
        {
          q: 'What are the next/script strategies?',
          a: '`beforeInteractive`, `afterInteractive` (default), `lazyOnload`, and the experimental `worker`. They control when a third-party script loads relative to hydration.',
        },
        {
          q: 'Does Next.js split code automatically?',
          a: 'Yes, per route. Each page only loads its own JavaScript plus shared chunks. `next/dynamic` lets you split further inside a page.',
        },
      ],
      spoken: `"To make a Next.js app faster, I first measure with Lighthouse, Web Vitals and the bundle analyzer. Then the biggest win is usually sending less JavaScript: keeping most components as Server Components and pushing use client to the leaves. For heavy client-only parts like charts or editors I use next/dynamic so they load as a separate chunk only when needed, and I import big libraries inside event handlers. Third-party scripts go through next/script with afterInteractive or lazyOnload. Then images with next/image, fonts with next/font, and on the data side, caching, streaming and avoiding waterfalls."`,
      mistakes: [
        'Optimizing without measuring — guessing the wrong bottleneck.',
        'Adding analytics with a plain `<script>` in the head, blocking rendering.',
        'Lazy-loading tiny components; each chunk is an extra request. Lazy-load only big things.',
        'Follow-up trap: "Does next/dynamic help for Server Components?" Its main value is splitting Client Component code; Server Components already send no component JS to the browser.',
      ],
      takeaway: 'Measure first, then ship less JS: server by default, lazy-load heavy client parts, and load third-party scripts late.',
    },
    {
      id: 'parallel-intercepting-routes',
      title: 'Parallel Routes and Intercepting Routes',
      level: 'advanced',
      priority: 'rare',
      frequency: 'occasional',
      summary: 'Parallel routes (@slot folders) render several pages in one layout; intercepting routes ((.)folder) show a route inside the current page, like a modal.',
      what: `Two advanced App Router features:

**Parallel routes**: a folder starting with \`@\` (like \`@analytics\`) is a **slot**. The parent layout receives each slot as a prop and can render several independent "pages" at the same time — each with its own loading and error states.

**Intercepting routes**: a folder like \`(.)photo\` lets you "catch" a navigation and show the target route **inside the current page** (for example as a modal), while a direct visit or refresh shows the full page.

#### Deeper version
- Slots are **not** part of the URL. \`app/@team/page.tsx\` and \`app/@analytics/page.tsx\` are both rendered at \`/\`.
- \`children\` is an implicit slot. Add a \`default.tsx\` in each slot as the fallback when the slot has no match for the current URL (especially after a hard refresh). Missing \`default.tsx\` can cause a 404.
- Intercepting conventions work on **route segments**, not file paths: \`(.)\` same level, \`(..)\` one level up, \`(..)(..)\` two levels up, \`(...)\` from the root \`app\`.
- The classic combo: an \`@modal\` slot + an intercepting route = a **modal with its own URL**. Clicking a photo in a feed opens it in a modal (URL \`/photo/1\`, shareable); refreshing that URL shows the full photo page; the back button closes the modal.
- Parallel routes can also do **conditional rendering**, like showing an \`@admin\` or \`@user\` slot based on the role.`,
      why: `Dashboards often have independent sections that should load and fail separately. And "modal with a URL" (like Instagram photos or a login modal) is a common product request that is very hard to do well with only client state — deep links, refresh and back button all need to work.`,
      analogy: `Parallel routes are a TV with picture-in-picture: two channels on one screen, each loading on its own. Intercepting routes are a receptionist who, when you ask for a document from the archive, brings a copy to your desk (the modal) instead of sending you to the archive room. If you walk to the archive room directly (refresh), you see the full original.`,
      code: [
        {
          title: 'Folder structure: dashboard slots + photo modal',
          lang: 'text',
          code: `app/
  dashboard/
    layout.tsx           -> receives { children, team, analytics }
    page.tsx
    @team/page.tsx       -> slot "team"
    @analytics/page.tsx  -> slot "analytics"
    @analytics/loading.tsx
    @analytics/default.tsx
  layout.tsx             -> receives { children, modal }
  @modal/
    default.tsx          -> returns null (no modal open)
    (.)photo/[id]/page.tsx  -> modal version, used on client navigation
  photo/[id]/page.tsx    -> full page, used on direct visit / refresh
  feed/page.tsx          -> links to /photo/1`,
        },
        {
          title: 'Layouts and the modal',
          lang: 'tsx',
          code: `// app/dashboard/layout.tsx
export default function DashboardLayout(props: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <div className="grid">
      {props.children}
      {props.team}       {/* loads independently */}
      {props.analytics}  {/* has its own loading.tsx */}
    </div>
  );
}

// app/@modal/default.tsx
export default function Default() {
  return null;
}

// app/@modal/(.)photo/[id]/page.tsx
import { Modal } from '@/components/Modal'; // a client component that calls router.back() on close
export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Modal><img src={\`/photos/\${id}.jpg\`} alt={\`Photo \${id}\`} /></Modal>;
}`,
        },
      ],
      output: `On \`/dashboard\`, the team and analytics sections render side by side; if analytics is slow, only that box shows its loading UI. In the feed, clicking a link to \`/photo/1\` opens the photo in a modal over the feed, and the URL changes to \`/photo/1\`. Pressing back closes the modal. Refreshing or sharing \`/photo/1\` opens the full \`photo/[id]/page.tsx\` page instead, because there is no previous page to intercept from.`,
      questions: [
        {
          q: 'What are parallel routes?',
          a: 'Named slots created with `@folder` that a layout renders at the same time as props. Each slot can load, error and navigate independently.',
        },
        {
          q: 'What are intercepting routes?',
          a: 'Routes that catch a client-side navigation to another URL and render it inside the current layout, like a modal, using `(.)`, `(..)` or `(...)` folder names. Direct visits render the normal page.',
        },
        {
          q: 'Why do you need default.tsx in a slot?',
          a: 'On a hard refresh Next.js cannot remember the slot\'s active state, so it renders `default.tsx`. Without it, an unmatched slot can cause a 404.',
        },
      ],
      spoken: `"Parallel routes let one layout render multiple pages at the same time using slots, which are folders starting with an at sign. The layout gets each slot as a prop, and each slot has its own loading and error states, which is great for dashboards. Intercepting routes catch a client-side navigation and show the target inside the current page, using folder names like dot in parentheses. Together they give you a modal with a real URL: clicking a photo opens a modal, the URL is shareable, back closes it, and a refresh shows the full page. I always add a default file in each slot."`,
      mistakes: [
        'Forgetting `default.tsx` in a slot, which causes a 404 on hard refresh.',
        'Thinking `(..)` means one folder up in the file system. It is based on route segments, so slots and groups do not count.',
        'Closing the modal by pushing a new URL instead of `router.back()`, which breaks the history.',
        'Follow-up trap: "Are @slots part of the URL?" No. They only change what a layout renders.',
      ],
      takeaway: '`@slot` folders render multiple pages in one layout; `(.)` intercepting routes show a page as a modal while keeping a real, shareable URL.',
    },
  ],
  rapidFire: [
    { q: 'What is Next.js in one line?', a: 'A React framework that adds routing, server rendering, data fetching, backend endpoints and optimizations.' },
    { q: 'What file makes a folder a visible route in the App Router?', a: '`page.tsx` (or .js/.jsx/.ts).' },
    { q: 'What does layout.tsx do?', a: 'Wraps child routes with shared UI and stays mounted across navigations.' },
    { q: 'layout vs template?', a: 'A layout keeps state between navigations; a template re-mounts every time.' },
    { q: 'What is a route group?', a: 'A `(folder)` that organizes routes without adding to the URL.' },
    { q: 'SSR in one line?', a: 'HTML is built on the server for every request.' },
    { q: 'SSG in one line?', a: 'HTML is built once at build time and served as a static file.' },
    { q: 'ISR in one line?', a: 'Static pages that rebuild in the background after a revalidate time or on demand.' },
    { q: 'Pages Router function for SSR?', a: '`getServerSideProps`.' },
    { q: 'Pages Router function for SSG/ISR?', a: '`getStaticProps` (add `revalidate` for ISR).' },
    { q: 'App Router replacement for getStaticPaths?', a: '`generateStaticParams`.' },
    { q: 'Are components server or client by default in the App Router?', a: 'Server Components.' },
    { q: 'How do you make a Client Component?', a: 'Add `\'use client\'` at the top of the file.' },
    { q: 'Are Client Components server-rendered?', a: 'Yes, they are pre-rendered to HTML and then hydrated in the browser.' },
    { q: 'Can you pass a function from a Server to a Client Component?', a: 'No, props must be serializable — except server actions.' },
    { q: 'What does \'use server\' mark?', a: 'Server actions (functions callable from the client), not Server Components.' },
    { q: 'Are server actions public endpoints?', a: 'Yes. Always validate input and check auth inside them.' },
    { q: 'Hook for server action state and errors?', a: '`useActionState` (React 19).' },
    { q: 'Hook for a submit button pending state?', a: '`useFormStatus` from `react-dom`.' },
    { q: 'Where do route handlers live?', a: 'In `route.ts` files inside `app/`, exporting GET, POST, etc.' },
    { q: 'How do you read a raw body for a Stripe webhook in a route handler?', a: '`await req.text()`.' },
    { q: 'What changed about params in Next 15?', a: '`params` and `searchParams` are Promises; you `await` them.' },
    { q: 'What does dynamicParams = false do?', a: 'Returns 404 for params not returned by `generateStaticParams`.' },
    { q: 'Catch-all route syntax?', a: '`[...slug]`; optional catch-all is `[[...slug]]`.' },
    { q: 'What does loading.tsx do?', a: 'Wraps the page in Suspense and shows an instant loading UI.' },
    { q: 'Why must error.tsx be a Client Component?', a: 'It is a React error boundary with a client-side retry.' },
    { q: 'What catches errors in the root layout?', a: '`global-error.tsx`.' },
    { q: 'How do you show a 404 from a Server Component?', a: 'Call `notFound()` from `next/navigation`.' },
    { q: 'How do you redirect on the server?', a: '`redirect()` from `next/navigation` (do not wrap it in try/catch).' },
    { q: 'useRouter import in the App Router?', a: '`next/navigation` (not `next/router`).' },
    { q: 'Why use <Link> over <a>?', a: 'Client-side navigation without full reload, plus prefetching.' },
    { q: 'What does middleware do?', a: 'Runs before a request is handled: redirects, rewrites, headers, quick auth checks.' },
    { q: 'What is middleware called in Next 16?', a: 'Proxy — the file is `proxy.ts`.' },
    { q: 'Is middleware enough for auth?', a: 'No. Verify the session again near the data.' },
    { q: 'Where should session tokens live?', a: 'In httpOnly, secure, sameSite cookies.' },
    { q: 'What is Auth.js?', a: 'The new name of NextAuth.js, a library for OAuth, credentials and sessions in Next.js.' },
    { q: 'How do you expose an env var to the browser?', a: 'Prefix it with `NEXT_PUBLIC_`; it is inlined at build time.' },
    { q: 'What does next/image give you?', a: 'Resizing, modern formats, lazy loading and no layout shift.' },
    { q: 'How do you allow remote images?', a: '`images.remotePatterns` in `next.config`.' },
    { q: 'What does next/font do?', a: 'Self-hosts fonts at build time and adds size-adjusted fallbacks.' },
    { q: 'How do you set a page title in the App Router?', a: 'Export `metadata` or `generateMetadata` from a page or layout.' },
    { q: 'How do you add a sitemap?', a: 'Create `app/sitemap.ts`; it is served at `/sitemap.xml`.' },
    { q: 'Four App Router cache layers?', a: 'Request memoization, Data Cache, Full Route Cache, Router Cache.' },
    { q: 'Is fetch cached by default?', a: 'Next 14: yes. Next 15: no. Check your version and set it explicitly.' },
    { q: 'How do you opt out of caching for one fetch?', a: '`fetch(url, { cache: \'no-store\' })`.' },
    { q: 'revalidatePath vs revalidateTag?', a: 'Path invalidates one route; tag invalidates every fetch with that tag.' },
    { q: 'How do you cache a DB query across requests?', a: '`unstable_cache` (older) or `\'use cache\'` (newer versions).' },
    { q: 'What does React cache() do in Next?', a: 'Dedupes a function call within a single server request.' },
    { q: 'What makes a route dynamic?', a: 'Using `cookies()`, `headers()`, `searchParams`, uncached data or `dynamic = \'force-dynamic\'`.' },
    { q: 'What does export const dynamic = "error" do?', a: 'Fails the build if the route is not fully static.' },
    { q: 'How do you choose the edge runtime?', a: '`export const runtime = \'edge\'`.' },
    { q: 'Main limit of the edge runtime?', a: 'Web APIs only — no `fs`, native modules or many TCP database drivers.' },
    { q: 'What is a hydration error?', a: 'The first client render does not match the server HTML.' },
    { q: 'Quick fix for a localStorage hydration error?', a: 'Read it in `useEffect`, or load the component with `dynamic(..., { ssr: false })`.' },
    { q: 'What does output: "standalone" do?', a: 'Creates a minimal server with only the needed files — ideal for Docker.' },
    { q: 'What must you copy into a standalone Docker image?', a: '`public/` and `.next/static`.' },
    { q: 'What do you lose with output: "export"?', a: 'SSR, ISR, server actions, middleware and default image optimization.' },
    { q: 'What are _app and _document in the Pages Router?', a: '`_app` wraps every page (global layout/providers); `_document` customizes the `<html>` and `<body>` shell. The App Router replaces both with the root layout.' },
    { q: 'What is a parallel route?', a: 'An `@slot` folder rendered by a layout alongside other slots.' },
    { q: 'What is an intercepting route?', a: 'A `(.)folder` that shows a route inside the current page, like a modal.' },
  ],
};
