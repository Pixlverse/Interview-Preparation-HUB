// Interview problems for the UI Libraries stack (Tailwind, MUI, Mantine, headless libraries).
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'ui-libraries',
  problems: [
    {
      id: 'tailwind-responsive-card-dark-mode',
      title: 'Build a responsive profile card with Tailwind + dark mode',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'tailwind-utility-first',
      question: `Using only Tailwind classes, build a profile card (React/JSX) that:

- is **stacked** (avatar above text) on phones and **side by side** from the \`sm\` breakpoint up,
- has a max width of \`md\`, rounded corners, a border and a soft shadow,
- supports **dark mode** with a \`.dark\` class on \`<html>\`,
- has a "Follow" button with hover and visible keyboard focus styles.

Say what config you need for class-based dark mode in **Tailwind v3** and in **Tailwind v4**.

\`\`\`jsx
<ProfileCard name="Asha Rao" role="Frontend Engineer" avatar="/asha.jpg" />
\`\`\``,
      hints: [
        'Tailwind is mobile first: classes without a prefix are for all sizes; `sm:` means "from 640px up".',
        'Start with `flex flex-col` and switch with `sm:flex-row`.',
        'Every colour needs a `dark:` partner, e.g. `bg-white dark:bg-slate-900`. Use `focus-visible:` for keyboard focus.',
      ],
      solution: `**Idea:** write the mobile layout first, add \`sm:\` classes for wider screens, and pair every colour with a \`dark:\` version.

\`\`\`jsx
export function ProfileCard({ name, role, avatar }) {
  return (
    <article
      className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border
                 border-slate-200 bg-white p-6 text-center shadow-sm
                 sm:flex-row sm:text-left
                 dark:border-slate-700 dark:bg-slate-900"
    >
      <img
        src={avatar}
        alt=""                       // decorative: the name is right next to it
        width={80}
        height={80}
        className="size-20 shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
          {name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{role}</p>
      </div>

      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                   hover:bg-indigo-700
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2
                   dark:focus-visible:ring-offset-slate-900
                   dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        Follow
      </button>
    </article>
  );
}
\`\`\`

**Class-based dark mode config:**

\`\`\`javascript
// Tailwind v3 — tailwind.config.js
module.exports = {
  darkMode: 'class', // ('selector' in 3.4.1+). Default is 'media' = follows the OS
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
};
\`\`\`

\`\`\`css
/* Tailwind v4 — in your main CSS file (no JS config needed) */
@import "tailwindcss";

/* By default v4 dark: follows the OS. This makes it follow a .dark class instead */
@custom-variant dark (&:where(.dark, .dark *));
\`\`\`

**Why it works:**

- \`flex-col\` applies everywhere; \`sm:flex-row\` overrides it from 640px. Same for \`text-center\` -> \`sm:text-left\`.
- \`min-w-0 flex-1\` lets the text block shrink so \`truncate\` can add "..." for long names (flex items do not shrink below content width by default).
- \`shrink-0\` keeps the avatar from being squashed. \`size-20\` = width and height 5rem (v3.4+ and v4).
- \`dark:\` classes apply when \`.dark\` is on an ancestor (with the config above).
- \`focus-visible:\` shows the ring only for keyboard users, not on mouse click.`,
      followUps: [
        {
          q: 'The className is getting very long. How do you keep it readable?',
          a: 'Extract a React component (the real unit of reuse), split classes over lines, use the Prettier Tailwind plugin to sort them, and use `cva` for variants. Avoid moving everything into `@apply` — it brings back the naming problem Tailwind solves.',
        },
        {
          q: 'How would you avoid repeating dark: on every colour?',
          a: 'Use semantic CSS variables: define `--color-surface` for light and dark, register it as a Tailwind colour (`@theme` in v4, `theme.extend.colors` in v3), and write `bg-surface` once. The variable changes with the theme.',
        },
      ],
    },
    {
      id: 'tailwind-class-conflict-which-wins',
      title: 'Which Tailwind class wins: px-4 or px-8?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'tailwind-best-practices',
      question: `A shared Button lets callers pass extra classes. What padding and background does the second button get? Is it reliable? How do you fix it?

\`\`\`jsx
function Button({ className = '', ...props }) {
  return (
    <button
      className={'px-4 py-2 bg-blue-600 text-white rounded ' + className}
      {...props}
    />
  );
}

<Button>Save</Button>
<Button className="px-8 bg-red-600">Delete</Button>
\`\`\``,
      hints: [
        'Does the browser care about the order of classes inside the `class` attribute?',
        'When two classes set the same property with the same specificity, the one that comes **later in the CSS file** wins.',
        'There is a small library that removes conflicting Tailwind classes, keeping the last one.',
      ],
      solution: `**Idea:** the order of class names in \`class="..."\` **does not matter**. Both \`px-4\` and \`px-8\` have the same specificity (one class), so the winner is whichever rule Tailwind happened to put **later in the generated CSS**. You do not control that, so the result is unreliable — it may look right today and break when classes change.

\`\`\`text
Rendered HTML:  class="px-4 py-2 bg-blue-600 text-white rounded px-8 bg-red-600"
Browser:        both px-4 and px-8 match -> same specificity (0,1,0)
                -> later rule in the stylesheet wins (decided by Tailwind's
                   sort order, not by your className order)
Result:         unpredictable. Often the "wrong" one wins.
\`\`\`

**Fix: merge classes with \`tailwind-merge\`** (+ \`clsx\` for conditions). It removes earlier conflicting classes so only one remains.

\`\`\`jsx
// lib/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs)); // clsx: join/condition, twMerge: last conflict wins
}
\`\`\`

\`\`\`jsx
import { cn } from './lib/cn';

function Button({ className, ...props }) {
  return (
    <button
      className={cn('px-4 py-2 bg-blue-600 text-white rounded', className)}
      {...props}
    />
  );
}

// <Button className="px-8 bg-red-600" />
// -> class="py-2 text-white rounded px-8 bg-red-600"   (px-4 and bg-blue-600 removed)
\`\`\`

**Why it works:** \`twMerge\` understands Tailwind groups — it knows \`px-4\` and \`px-8\` both set horizontal padding, and that \`p-4\` overrides both \`px-*\` and \`py-*\`. It keeps the **last** one, so the caller's class always wins, independent of the CSS file order.`,
      followUps: [
        {
          q: 'Why not just use the ! important modifier (!px-8)?',
          a: 'It works once, but then nobody can override it later, and you start an "important" war. `tailwind-merge` keeps the cascade clean. (Note: v3 writes `!px-8`, v4 writes `px-8!` at the end.)',
        },
        {
          q: 'Does tailwind-merge know my custom classes?',
          a: 'Custom colours like `bg-brand-500` are detected automatically. Custom font sizes (`text-huge`) can be confused with text colours — register them with `extendTailwindMerge` so it knows which group they belong to.',
        },
      ],
    },
    {
      id: 'choose-tailwind-mui-mantine',
      title: 'Pick Tailwind, MUI or Mantine for 3 projects',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'choosing-ui-library',
      question: `For each project, which UI approach would you choose and why? Mention one risk of your choice.

1. **Internal admin panel** for the ops team: lots of data tables with sorting/filtering, forms and date pickers. 2 developers, 4 weeks, no designer.
2. **Public marketing site + SaaS app** in Next.js (App Router). A designer made a unique brand look in Figma. SEO and page speed are top priorities.
3. **Startup MVP** dashboard in React: needs to look good fast, but the founders want a custom feel later. Needs forms, notifications, modals and hooks like "use local storage" and "use media query".`,
      hints: [
        'Think: who decides the look (Material Design, a designer, or "good defaults")? How many complex widgets are needed?',
        'Complex widgets like data grids and date pickers take weeks to build well. Which library has them ready?',
        'Runtime CSS-in-JS (Emotion) adds JS and needs client components in the Next.js App Router. Zero-runtime styling helps performance.',
      ],
      solution: `**Idea:** match the library to (a) how custom the design is, (b) how many complex widgets you need, and (c) performance / SSR needs.

\`\`\`text
Project                   Choice                                Main reason
------------------------  ------------------------------------  ------------------------------------
1. Admin panel            MUI (+ MUI X DataGrid, Date Pickers)  Ready complex widgets, no designer needed
2. Marketing + SaaS       Tailwind + headless (Radix/shadcn/ui) Full design control, tiny CSS, RSC-friendly
3. Startup MVP            Mantine                                Good defaults + 100+ components + hooks
\`\`\`

**1. Admin panel -> MUI.** Data grids, date pickers, autocomplete and dialogs are ready and accessible. Material Design looks "fine" without a designer. Speed of delivery matters more than unique looks.
*Risk:* bundle size and Emotion runtime; everyone's app looks "Material". Advanced DataGrid features (grouping, Excel export) are in the paid MUI X Pro/Premium plans.

**2. Marketing + SaaS -> Tailwind + headless components.** Tailwind generates only the classes you use (small static CSS, no runtime), works in Server Components, and makes it easy to match a custom Figma design. Radix (or shadcn/ui, which copies Radix + Tailwind code into your repo) gives accessible dialogs, menus and tabs without imposing a look.
*Risk:* you build and maintain more yourself; needs team discipline (shared components, \`cn\` helper, design tokens).

**3. Startup MVP -> Mantine.** Nice-looking defaults, a big component set, \`@mantine/form\`, \`@mantine/notifications\`, and \`@mantine/hooks\` (\`useLocalStorage\`, \`useMediaQuery\`, \`useDisclosure\`). Since v7 it uses plain CSS (CSS Modules), no runtime CSS-in-JS, and is easy to theme later.
*Risk:* smaller ecosystem than MUI; major versions have had breaking changes (v6 -> v7 changed the styling system).

**Why it works:** there is no "best" library — interviewers want to hear trade-offs: time to market vs design freedom vs performance vs maintenance.`,
      followUps: [
        {
          q: 'Can you mix Tailwind with MUI?',
          a: 'Yes, but plan it: use Tailwind for layout/spacing and MUI for widgets, and control CSS order so Tailwind can override MUI (MUI\'s `StyledEngineProvider injectFirst` in v5/v6, or CSS `@layer` with `enableCssLayer` in newer versions). Mixing two theming systems means keeping colours in sync — share tokens.',
        },
        {
          q: 'What questions would you ask before choosing?',
          a: 'Is there a designer / existing design system? SSR or SPA? Which complex components are needed? Team experience? Bundle budget? Long-term maintenance and license costs (e.g. MUI X Pro)?',
        },
      ],
    },
    {
      id: 'tailwind-classes-not-applied',
      title: 'Debug: some Tailwind classes are not applied',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'tailwind-utility-first',
      question: `Three bugs reported in a Tailwind project:

1. The \`Badge\` colour is missing — no background at all.
2. Classes used inside a shared package \`@acme/ui\` (in \`node_modules\`) have no styles.
3. A new folder \`src/features/\` was added; none of its classes work (Tailwind v3 project).

\`\`\`jsx
// Badge.jsx
function Badge({ color, children }) {
  // color is "green" | "red" | "yellow"
  return <span className={\`bg-\${color}-100 text-\${color}-800 rounded px-2\`}>{children}</span>;
}
\`\`\`

\`\`\`javascript
// tailwind.config.js (v3)
module.exports = {
  content: ['./src/components/**/*.{js,jsx}', './src/pages/**/*.{js,jsx}'],
};
\`\`\`

Explain the root cause and fix all three, for both **v3** and **v4**.`,
      hints: [
        'Tailwind does not run your code. It scans your source files as plain text, looking for complete class names.',
        'Does the text `bg-green-100` appear anywhere in Badge.jsx?',
        'v3 only scans the `content` paths. v4 detects sources automatically but ignores `node_modules` and `.gitignore`d files; add more with `@source`.',
      ],
      solution: `**Idea:** Tailwind builds CSS by **scanning files as text** for complete class names. If a full class name never appears in a scanned file, no CSS is generated for it.

**Bug 1 — dynamic class names.** \`bg-\${color}-100\` is built at runtime. The scanner only sees \`bg-\${color}-100\`, never \`bg-green-100\`. Fix: write the **full** class names in a lookup object.

\`\`\`jsx
// Every full class name is now in the source text, so Tailwind finds them
const colorClasses = {
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
};

function Badge({ color = 'green', children }) {
  return (
    <span className={'rounded px-2 ' + colorClasses[color]}>
      {children}
    </span>
  );
}
\`\`\`

**Bugs 2 and 3 — files not scanned.**

\`\`\`javascript
// Tailwind v3 — tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',                     // all of src, incl. features/
    './node_modules/@acme/ui/dist/**/*.{js,mjs}',      // the shared package
  ],
};
\`\`\`

\`\`\`css
/* Tailwind v4 — main CSS file. src/ is detected automatically. */
@import "tailwindcss";

/* node_modules is ignored by default, so point at the package explicitly */
@source "../node_modules/@acme/ui";
\`\`\`

**Why it works:**

- The scanner is a fast text search, not a JavaScript runtime. Lookup objects keep every full class name visible as a plain string.
- In v3, \`content\` is the whole list of scanned files — a new folder outside the globs is invisible. Use a broad glob like \`./src/**/*\`.
- In v4, automatic detection skips \`node_modules\` and anything in \`.gitignore\` (for speed). \`@source\` adds extra paths. You can also \`@source inline("bg-red-100")\` to force classes (the v4 version of v3's \`safelist\`).

**Quick debug checklist:** is the full class name in the source? Is the file inside \`content\` / not ignored? Did the dev server restart after config changes? Is the class spelled right (the Tailwind VS Code extension highlights unknown classes)?`,
      followUps: [
        {
          q: 'Why not just safelist all colour classes?',
          a: 'Safelisting many patterns (e.g. every colour x every shade) can add hundreds of KB of CSS you never use. Safelist only small, known sets — like classes that come from a CMS.',
        },
        {
          q: 'Are dynamic values with arbitrary classes also a problem?',
          a: 'Yes. `w-[${width}px]` does not work either. For truly dynamic values use an inline style or a CSS variable: `style={{ "--w": width + "px" }}` with the class `w-[var(--w)]` (v4 also supports the shorthand `w-(--w)`).',
        },
      ],
    },
    {
      id: 'button-variants-cva-tailwind-merge',
      title: 'Typed Button with variants using cva + tailwind-merge',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'tailwind-best-practices',
      question: `Build a reusable \`<Button>\` in React + TypeScript + Tailwind:

- \`variant\`: \`primary\` | \`secondary\` | \`danger\` | \`ghost\` (default \`primary\`)
- \`size\`: \`sm\` | \`md\` | \`lg\` (default \`md\`)
- \`loading\` prop: shows a spinner, disables the button
- accepts all normal \`<button>\` props, and a \`className\` that can **safely override** anything
- TypeScript should error on \`variant="danger2"\`.

\`\`\`tsx
<Button>Save</Button>
<Button variant="danger" size="sm" onClick={remove}>Delete</Button>
<Button variant="ghost" className="w-full" loading>Loading...</Button>
\`\`\``,
      hints: [
        '`cva` (class-variance-authority) maps variant props to class strings and can give you the TypeScript types with `VariantProps`.',
        'Combine `cva` output with the caller\'s `className` through `cn()` = `twMerge(clsx(...))` so the caller wins conflicts.',
        'Extend `React.ButtonHTMLAttributes<HTMLButtonElement>` so `onClick`, `type`, `aria-*` all work. Default `type="button"` to avoid accidental form submits.',
      ],
      solution: `**Idea:** describe all variants **once** in a \`cva\` config. \`cva\` returns a function that builds the right class string, and \`VariantProps\` turns the config into TypeScript types. \`cn\` merges in the caller's classes safely.

\`\`\`tsx
// components/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  // Base classes shared by all buttons
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  type = 'button',      // safer default than the HTML default "submit"
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)} // caller wins
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

export { buttonVariants }; // reuse the styles on a <Link> that should look like a button
\`\`\`

**Why it works:**

- \`cva\` keeps variant logic in one readable object instead of nested ternaries. Adding a variant = one new line.
- \`VariantProps<typeof buttonVariants>\` gives \`variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | null\`, so \`variant="danger2"\` is a type error.
- \`cn\` puts \`className\` **last**, and \`twMerge\` drops conflicting earlier classes, so \`className="h-14"\` really replaces \`h-10\`.
- Every class name is written out in full, so the Tailwind scanner finds them all.
- \`disabled || loading\` prevents double submits; \`aria-busy\` tells assistive tech it is working. The spinner is \`aria-hidden\` because the button text already explains the action.

In React 19 \`ref\` is a normal prop, so it is passed through \`...props\`. In React 18 wrap the component with \`forwardRef\`.`,
      followUps: [
        {
          q: 'How would you style a Next.js <Link> to look like this button?',
          a: 'Call `buttonVariants({ variant: "secondary" })` in the Link\'s className. shadcn/ui also uses an `asChild` prop with Radix `Slot` to render the button styles onto a child element.',
        },
        {
          q: 'What are compoundVariants?',
          a: 'Classes applied only for a **combination** of variants, e.g. `{ variant: "ghost", size: "sm", class: "px-2" }`. Useful when one pairing needs a special tweak.',
        },
      ],
    },
    {
      id: 'tailwind-custom-theme-v3-v4',
      title: 'Add brand colours and fonts to Tailwind (v3 config vs v4 @theme)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'tailwind-dark-mode-theme',
      question: `Your designer gives you brand tokens:

\`\`\`text
brand-50  #eef2ff     brand-500 #6366f1     brand-700 #4338ca
font: "Inter" for body, "Cal Sans" for headings
extra breakpoint: 3xl = 1920px
\`\`\`

You need classes like \`bg-brand-500\`, \`text-brand-700\`, \`font-display\` and \`3xl:grid-cols-6\`, **while keeping** Tailwind's default colours. Show how to do it in **Tailwind v3** and in **Tailwind v4**. Then make \`brand-500\` switch to a lighter value in dark mode.`,
      hints: [
        'In v3, `theme.colors` REPLACES the defaults. `theme.extend.colors` ADDS to them.',
        'In v4 there is no JS config by default: you declare CSS variables inside `@theme` and Tailwind creates utilities from their names (`--color-*`, `--font-*`, `--breakpoint-*`).',
        'For dark mode, point the token at a CSS variable you change under `.dark`.',
      ],
      solution: `**Idea:** v3 = JavaScript config (\`theme.extend\`). v4 = CSS-first config (\`@theme\` variables). In both, the **name** of the token becomes the class name.

**Tailwind v3**

\`\`\`javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {                       // extend = keep the default palette
      colors: {
        brand: {
          50: '#eef2ff',
          // Uses a CSS variable so dark mode can change it (see CSS below)
          500: 'rgb(var(--brand-500) / <alpha-value>)', // keeps bg-brand-500/50 working
          700: '#4338ca',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cal Sans"', 'Inter', 'sans-serif'],
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
};
\`\`\`

\`\`\`css
/* globals.css (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root  { --brand-500: 99 102 241; }    /* #6366f1 as "R G B" */
.dark  { --brand-500: 129 140 248; }   /* lighter indigo for dark backgrounds */
\`\`\`

**Tailwind v4**

\`\`\`css
/* app.css (v4) */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-brand-50: #eef2ff;
  --color-brand-500: #6366f1;
  --color-brand-700: #4338ca;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Cal Sans", "Inter", sans-serif;

  --breakpoint-3xl: 120rem;   /* 1920px — v4 uses rem for breakpoints */
}

/* Dark mode: just override the variable — every brand-500 utility follows */
.dark {
  --color-brand-500: #818cf8;
}
\`\`\`

**Usage (same in both):**

\`\`\`jsx
<h1 className="font-display text-4xl text-brand-700 dark:text-brand-50">Hello</h1>
<div className="grid grid-cols-2 3xl:grid-cols-6">...</div>
<button className="bg-brand-500 hover:bg-brand-500/90 text-white">Buy</button>
\`\`\`

**Why it works:**

- **v3:** \`extend\` merges with the default theme; putting keys directly under \`theme\` would delete all default colours. The \`<alpha-value>\` placeholder lets opacity modifiers like \`/50\` still work with a CSS variable.
- **v4:** every variable in \`@theme\` in a known namespace (\`--color-\`, \`--font-\`, \`--breakpoint-\`, \`--spacing\`...) creates utilities **and** stays available as a normal CSS variable (\`var(--color-brand-500)\`). Utilities reference the variable, so overriding it under \`.dark\` changes the colour everywhere. Opacity modifiers work automatically (via \`color-mix()\`).
- To **replace** all default colours in v4, reset the namespace first: \`--color-*: initial;\`.`,
      followUps: [
        {
          q: 'Can a v4 project still use a JS config file?',
          a: 'Yes, for migration: add `@config "./tailwind.config.js";` in the CSS. New projects should prefer `@theme`. The official upgrade tool (`npx @tailwindcss/upgrade`) converts most v3 configs.',
        },
        {
          q: 'Why define colours as CSS variables at all?',
          a: 'They can change at runtime (dark mode, per-tenant branding in a SaaS) without rebuilding CSS, and other tools (charts, MUI, inline styles) can read the same values.',
        },
      ],
    },
    {
      id: 'mui-brand-theme',
      title: 'MUI theme: brand colours, typography and component overrides',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'mui-theming',
      question: `You are starting a Material UI (v6/v7) app. Product wants:

- primary \`#4F46E5\` (indigo), secondary \`#F59E0B\` (amber), plus an extra palette colour called **\`brand\`** (\`#0EA5E9\`) usable as \`<Button color="brand">\`,
- font "Inter"; buttons should **not** be UPPERCASE,
- all buttons: no shadow, pill shape; all text fields: \`size="small"\` by default,
- rounded corners of 10px across components.

Write the theme in TypeScript and wire it into the app. TypeScript must accept \`color="brand"\`.`,
      hints: [
        '`createTheme` has sections: `palette`, `typography`, `shape`, and `components` (for per-component `defaultProps` and `styleOverrides`).',
        'A custom palette colour needs `palette.augmentColor` (to compute light/dark/contrastText) and TypeScript **module augmentation**.',
        'Wrap the app in `ThemeProvider` and add `CssBaseline` for a consistent base (body background, font, box-sizing).',
      ],
      solution: `**Idea:** put every design decision in **one** theme object. Palette and typography handle global looks; \`components\` changes defaults and styles for specific components, so pages do not repeat \`sx\` everywhere.

\`\`\`tsx
// theme.ts
import { createTheme } from '@mui/material/styles';

// 1. Tell TypeScript about the new palette colour
declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    brand: true; // allows <Button color="brand">
  }
}

// 2. Build the base theme first so we can use augmentColor
let theme = createTheme({
  palette: {
    primary: { main: '#4F46E5' },
    secondary: { main: '#F59E0B' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // no UPPERCASE buttons
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10, // used by Paper, Card, TextField, ...
  },
});

// 3. Add the custom colour (MUI computes light, dark and contrastText)
theme = createTheme(theme, {
  palette: {
    brand: theme.palette.augmentColor({
      color: { main: '#0EA5E9' },
      name: 'brand',
    }),
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true, // no shadow
      },
      styleOverrides: {
        root: {
          borderRadius: 999, // pill shape
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

export default theme;
\`\`\`

\`\`\`tsx
// main.tsx (Vite) — in Next.js App Router, also wrap with AppRouterCacheProvider
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline /> {/* normalises styles and applies theme background + font */}
    <App />
  </ThemeProvider>
);

// Usage
<Button variant="contained" color="brand">Upgrade</Button>
<TextField label="Email" /> {/* already small */}
\`\`\`

**Why it works:**

- \`palette.primary.main\` is enough — MUI generates \`light\`, \`dark\` and a readable \`contrastText\`.
- \`augmentColor\` does the same for a custom colour. Calling \`createTheme(theme, {...})\` a second time lets us use helpers from the first theme.
- **Module augmentation** extends MUI's TypeScript interfaces, so \`theme.palette.brand\` and \`color="brand"\` type-check.
- \`defaultProps\` changes the **default value of a prop** for every instance (\`size="small"\`). \`styleOverrides\` changes **styles** of a component slot (\`root\`). Both live in one place, so the whole app stays consistent.
- Remember to actually load Inter (e.g. \`next/font\` or \`@fontsource/inter\`) — \`fontFamily\` only names it.`,
      followUps: [
        {
          q: 'How do you add dark mode to this theme in MUI v6+?',
          a: 'Use `colorSchemes: { light: {...}, dark: { palette: {...} } }` and `cssVariables: true` in `createTheme`. Toggle with the `useColorScheme()` hook. CSS variables avoid the flash of the wrong theme during SSR (add `InitColorSchemeScript`).',
        },
        {
          q: 'Where would you put a style for only the "contained" Button?',
          a: 'Use `variants` in the component config: `MuiButton: { variants: [{ props: { variant: "contained" }, style: {...} }] }`. In v6+ you can also use the `variants` array inside `styleOverrides.root`.',
        },
      ],
    },
    {
      id: 'mui-sx-to-styled-refactor',
      title: 'Refactor heavy MUI sx usage into styled() components',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'mui-sx-styled-overrides',
      question: `This product list renders **200 cards**. Every card repeats the same large \`sx\` object, and some styles are copy-pasted into 3 other pages. Refactor it. Explain when you would keep \`sx\` and when you would use \`styled()\`.

\`\`\`tsx
{products.map((p) => (
  <Card
    key={p.id}
    sx={{
      p: { xs: 2, md: 3 },
      borderRadius: 2,
      border: 1,
      borderColor: p.featured ? 'primary.main' : 'divider',
      boxShadow: 'none',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 4 },
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}
  >
    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{p.name}</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 'auto' }}>{p.price}</Typography>
  </Card>
))}
\`\`\``,
      hints: [
        '`sx` is great for one-off tweaks. Styles that repeat across many instances or pages are better as a named component.',
        '`styled(Card)` takes a function `({ theme }) => ({...})`. Use `theme.spacing()`, `theme.palette`, `theme.breakpoints.up()`.',
        'For a custom prop like `featured`, use `shouldForwardProp` so it is not passed to the DOM (React warns about unknown attributes).',
      ],
      solution: `**Idea:** move the repeated, shared styles into a **named styled component** (defined once, outside render). Keep \`sx\` only for small one-off tweaks.

\`\`\`tsx
// ProductCard.tsx
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

type CardProps = { featured?: boolean };

const StyledCard = styled(Card, {
  // "featured" is only for styling — do not forward it to the DOM
  shouldForwardProp: (prop) => prop !== 'featured',
})<CardProps>(({ theme, featured }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,   // sx "borderRadius: 2" meant 2 x theme radius
  border: '1px solid',
  borderColor: featured ? theme.palette.primary.main : theme.palette.divider,
  boxShadow: 'none',
  transition: theme.transitions.create('box-shadow'),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const ProductName = styled(Typography)({
  fontWeight: 700,
  fontSize: 18,
});

export function ProductCard({ product }: { product: Product }) {
  return (
    <StyledCard featured={product.featured}>
      <ProductName>{product.name}</ProductName>
      {/* one-off tweak: sx is fine here */}
      <Typography sx={{ color: 'text.secondary', mt: 'auto' }}>{product.price}</Typography>
    </StyledCard>
  );
}

// List
{products.map((p) => <ProductCard key={p.id} product={p} />)}
\`\`\`

**Why it works:**

- \`styled()\` is created **once** at module level. Emotion generates one class per unique style result (here: two — featured or not) and reuses it for all 200 cards. A big \`sx\` object is re-processed for each card on every render, which costs more on large lists.
- The component has a **name** (\`ProductCard\`), so the other 3 pages import it instead of copying styles.
- \`shouldForwardProp\` stops \`featured="true"\` from reaching the HTML.
- **Unit gotcha:** in \`sx\`, \`borderRadius: 2\` means 2 x \`theme.shape.borderRadius\` and \`p: 2\` means \`theme.spacing(2)\`. In \`styled()\`, plain numbers are **pixels**, so you call the theme helpers yourself.

**Rule of thumb:**

- \`sx\` — one-off, small, page-specific tweaks; quick prototyping.
- \`styled()\` — reused styles, a named building block, prop-based styles, performance-sensitive lists.
- **theme \`components\` overrides** — when **every** Card in the app should look this way.`,
      followUps: [
        {
          q: 'How do you target a child slot like the MUI Button icon from styled()?',
          a: 'Use the global class names: `"& .MuiButton-startIcon": {...}`, or better the generated classes object: `import { buttonClasses } from "@mui/material/Button";` then use it as a computed key: `["& ." + buttonClasses.startIcon]: {...}` (safe if class names ever change). Many components also accept `slotProps` for slot-level props.',
        },
        {
          q: 'Is MUI moving away from Emotion?',
          a: 'MUI is building **Pigment CSS**, a zero-runtime CSS-in-JS engine that extracts `styled()` and `sx` to static CSS at build time (useful for React Server Components). Today Emotion is still the default; check your MUI version before relying on Pigment.',
        },
      ],
    },
    {
      id: 'mantine-signup-form-validation',
      title: 'Mantine sign-up form with validation and server errors',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'mantine',
      question: `Using **Mantine v7+** (\`@mantine/core\` + \`@mantine/form\`), build a sign-up form:

- fields: email, password, confirm password, "I accept the terms" checkbox,
- rules: valid email, password >= 8 chars, passwords match, terms checked,
- validate a field when the user **leaves** it (blur), and everything on submit,
- show a loading state on the button while submitting,
- if the API says "email already registered", show that error **under the email field**.

\`\`\`typescript
// You have this API helper
async function signUp(data: { email: string; password: string }): Promise<void>;
// It throws { field: 'email', message: 'Email already registered' } on a duplicate
\`\`\``,
      hints: [
        '`useForm({ initialValues, validate })` — each validate function returns an error string or `null`. It gets `(value, values)`, so you can compare with another field.',
        'Spread `form.getInputProps("email")` on the input. For checkboxes pass `{ type: "checkbox" }`. With `mode: "uncontrolled"` also add `key={form.key("email")}`.',
        '`form.onSubmit(handler)` only calls the handler if validation passes. `form.setFieldError(field, message)` shows a server error.',
      ],
      solution: `**Idea:** \`useForm\` holds the values, rules and errors. \`getInputProps\` wires each Mantine input (value, onChange, onBlur, **error**). Server errors go into the same error state with \`setFieldError\`.

\`\`\`tsx
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Checkbox, Button, Stack } from '@mantine/core';

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export function SignUpForm() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',               // fewer re-renders (v7 default is controlled)
    validateInputOnBlur: true,          // validate a field when the user leaves it
    initialValues: { email: '', password: '', confirmPassword: '', terms: false },
    validate: {
      email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : 'Enter a valid email'),
      password: (value) => (value.length >= 8 ? null : 'Use at least 8 characters'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
      terms: (value) => (value ? null : 'You must accept the terms'),
    },
  });

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await signUp({ email: values.email, password: values.password });
      form.reset();
    } catch (err: any) {
      if (err?.field) {
        form.setFieldError(err.field, err.message); // shows under that field
      } else {
        form.setFieldError('email', 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          withAsterisk
          key={form.key('email')}
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          description="At least 8 characters"
          autoComplete="new-password"
          withAsterisk
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          withAsterisk
          key={form.key('confirmPassword')}
          {...form.getInputProps('confirmPassword')}
        />
        <Checkbox
          label="I accept the terms"
          key={form.key('terms')}
          {...form.getInputProps('terms', { type: 'checkbox' })}
        />
        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </Stack>
    </form>
  );
}
\`\`\`

**Why it works:**

- \`getInputProps\` returns \`defaultValue/value\`, \`onChange\`, \`onBlur\`, \`onFocus\` and \`error\`. Mantine inputs render the error text under the field and set \`aria-invalid\` and \`aria-describedby\` for screen readers.
- The \`confirmPassword\` rule gets all \`values\`, so it can compare fields.
- \`form.onSubmit\` validates everything first; the handler runs only when the form is valid. Errors appear on every invalid field at once.
- \`setFieldError\` puts server errors in the same place as client errors, so the UI stays consistent.
- \`{ type: 'checkbox' }\` makes \`getInputProps\` use \`checked\` instead of \`value\`.
- \`Button loading\` shows a spinner and disables the button, preventing double submits.

**Always validate on the server too** (e.g. with the same Zod schema).`,
      followUps: [
        {
          q: 'How would you share validation rules with the backend?',
          a: 'Write a Zod schema once in a shared package and use it on both sides. On the client, plug it in with a resolver, e.g. `validate: zodResolver(schema)` from `mantine-form-zod-resolver`; on the server, call `schema.parse(body)`.',
        },
        {
          q: 'Controlled vs uncontrolled mode in @mantine/form?',
          a: 'Controlled stores values in React state, so every keystroke re-renders the whole form. Uncontrolled (recommended for big forms) keeps values in refs and only re-renders when needed; that is why you must pass `key={form.key(path)}` and read values with `form.getValues()`.',
        },
      ],
    },
    {
      id: 'accessible-confirm-dialog-library',
      title: 'Accessible "Delete project?" dialog — build it or use a library?',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'a11y-component-libraries',
      question: `A junior dev built a delete-confirmation modal with a \`div\`, \`position: fixed\` and an \`onClick\` on the backdrop. QA found: Tab moves focus to the page **behind** the modal, Escape does nothing, screen readers do not announce it, the page scrolls behind it, and after closing, focus jumps to the top of the page.

1. List everything an accessible modal dialog must do.
2. Rebuild it with a headless library (Radix) styled with Tailwind.
3. Explain why using a library is usually better than building this yourself.`,
      hints: [
        'Think about focus (where it goes on open, staying inside, where it returns on close), keyboard (Escape), screen-reader roles and labels, and the background (inert, no scroll).',
        'For destructive confirmations, WAI-ARIA has a special role: `alertdialog`. Radix has a matching `AlertDialog` component.',
        'Radix gives behaviour and ARIA; you give the styles with Tailwind classes. Use `asChild` to keep your own button components.',
      ],
      solution: `**Idea:** a modal dialog has many hidden rules (focus management, ARIA, scroll lock, portals). Headless libraries like Radix, React Aria or Headless UI implement and test all of them, and you only add styles.

**1. What an accessible modal must do:**

- \`role="dialog"\` (or \`alertdialog\` for destructive confirms) and \`aria-modal="true"\`.
- An accessible name and description: \`aria-labelledby\` -> title, \`aria-describedby\` -> text.
- On open: move focus **into** the dialog (for a destructive action, to the **safe** button: Cancel).
- **Trap focus**: Tab / Shift+Tab cycle inside the dialog only.
- **Escape** closes it.
- The background is **inert** (not focusable, hidden from screen readers) and does **not scroll**.
- On close: **return focus** to the button that opened it.
- Rendered in a **portal** at the end of \`<body>\` so no parent \`overflow\`/\`z-index\`/\`transform\` breaks it.

**2. Radix AlertDialog + Tailwind:**

\`\`\`tsx
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export function DeleteProjectDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog.Root>
      {/* asChild: Radix adds its props/handlers to OUR button instead of rendering its own */}
      <AlertDialog.Trigger asChild>
        <button className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
          Delete project
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />

        <AlertDialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2
                     rounded-xl bg-white p-6 shadow-xl focus:outline-none
                     motion-safe:animate-in motion-safe:fade-in"
        >
          {/* Linked automatically via aria-labelledby / aria-describedby */}
          <AlertDialog.Title className="text-lg font-semibold">
            Delete "Marketing site"?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-slate-600">
            This permanently deletes the project and its 12 pages. This cannot be undone.
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            {/* AlertDialog focuses Cancel first: the safe choice */}
            <AlertDialog.Cancel asChild>
              <button className="rounded-lg px-4 py-2 hover:bg-slate-100">Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Yes, delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
\`\`\`

(\`motion-safe:animate-in fade-in\` comes from the \`tailwindcss-animate\` / \`tw-animate-css\` plugin; drop it if you do not use one. \`motion-safe:\` skips the animation for reduced-motion users.)

**Why it works:** Radix handles \`role="alertdialog"\`, \`aria-modal\`, the label/description ids, focus trap, Escape, scroll lock, hiding the rest of the page from assistive tech, the portal, and returning focus to the trigger. \`AlertDialog\` (unlike \`Dialog\`) does **not** close when you click the overlay — a misclick should not confirm or cancel a destructive action by accident.

**3. Why a library:** each rule above has edge cases (nested dialogs, iOS VoiceOver, scroll lock on iOS Safari, focus return when the trigger was removed, portals + SSR). Library authors test across browsers and screen readers. Building it yourself takes days and usually misses something. MUI \`Dialog\` and Mantine \`Modal\` give the same behaviour if you use those libraries. Native \`<dialog>\` with \`showModal()\` is also a solid option today (top layer, focus, Escape, inert background) — but you still handle scroll lock and some styling quirks yourself.`,
      followUps: [
        {
          q: 'How would you test this dialog?',
          a: 'With React Testing Library: open it, assert `getByRole("alertdialog", { name: /delete/i })`, check focus is on Cancel, press Escape and assert it closed and focus returned to the trigger. Add axe (jest-axe / Playwright axe) for automated checks and do one manual screen-reader pass.',
        },
        {
          q: 'The dialog should open from code (e.g. after a failed API call). How?',
          a: 'Make it controlled: `<AlertDialog.Root open={open} onOpenChange={setOpen}>` and set `open` from your logic. Without a Trigger, make sure focus still returns somewhere sensible on close (Radix `onCloseAutoFocus` lets you choose).',
        },
      ],
    },
    {
      id: 'mui-bundle-size-too-big',
      title: 'Debug: the MUI app bundle is 2 MB',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'bundle-size-tree-shaking',
      question: `A React + MUI app (Vite in production, \`@mui/material\` v6) ships a **2.1 MB** main JS bundle, and the dashboard's LCP on mobile is 6 s. You find this code. Find the problems, fix them, and explain how you would **measure** before and after.

\`\`\`tsx
// IconByName.tsx — icons come from the CMS by name
import * as Icons from '@mui/icons-material';

export function IconByName({ name }: { name: string }) {
  const Icon = (Icons as any)[name];
  return Icon ? <Icon /> : null;
}
\`\`\`

\`\`\`tsx
// App.tsx
import { DataGridPremium } from '@mui/x-data-grid-premium';    // used only on /reports
import { DatePicker } from '@mui/x-date-pickers';               // used only on /settings
import moment from 'moment';                                     // used for 1 date format
import { Button, TextField, Dialog } from '@mui/material';

const routes = [
  { path: '/reports', element: <ReportsPage /> },
  { path: '/settings', element: <SettingsPage /> },
];
\`\`\``,
      hints: [
        'Tree-shaking removes exports that are never used. But if you look up an export **by a runtime string**, the bundler cannot know which ones you need.',
        'Code used only on one route does not need to be in the first bundle. Think `React.lazy` + dynamic `import()`.',
        'Is the `@mui/material` named import actually a problem in a production build? Measure with a bundle analyzer before guessing.',
      ],
      solution: `**Idea:** first **measure**, then remove the biggest offenders: (1) the dynamic icon lookup that pulls in **every** icon, (2) heavy route-only components in the main bundle, (3) heavy utility libraries.

**Measure first:**

\`\`\`bash
# Vite: visual treemap of what is inside each chunk
npx vite-bundle-visualizer
# Next.js: ANALYZE=true next build  (with @next/bundle-analyzer)
\`\`\`

The treemap would show \`@mui/icons-material\` as the biggest block (2,000+ icons), then MUI X, then moment (with all locales).

**Fix 1 — icon map instead of \`import *\` + string lookup:**

\`\`\`tsx
// Only the icons the CMS is allowed to use are bundled
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import ChartIcon from '@mui/icons-material/BarChart';

const ICONS = {
  home: HomeIcon,
  settings: SettingsIcon,
  chart: ChartIcon,
} as const;

type IconName = keyof typeof ICONS;

export function IconByName({ name }: { name: string }) {
  const Icon = ICONS[name as IconName];
  return Icon ? <Icon /> : null; // unknown names render nothing
}
\`\`\`

**Fix 2 — lazy-load route-only heavy pages:**

\`\`\`tsx
import { lazy, Suspense } from 'react';

// Each becomes its own chunk, downloaded only when the route is visited
const ReportsPage = lazy(() => import('./pages/ReportsPage'));   // imports DataGridPremium inside
const SettingsPage = lazy(() => import('./pages/SettingsPage')); // imports DatePicker inside

const routes = [
  { path: '/reports', element: <Suspense fallback={<PageSkeleton />}><ReportsPage /></Suspense> },
  { path: '/settings', element: <Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense> },
];
\`\`\`

**Fix 3 — replace moment** (~70 KB+ gzipped with locales, not tree-shakable) with \`Intl.DateTimeFormat\` for simple formatting, or \`date-fns\` / \`dayjs\` (which MUI X pickers also support via adapters).

\`\`\`tsx
const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(d); // 0 KB
\`\`\`

**What is NOT the problem:** \`import { Button, TextField, Dialog } from '@mui/material'\` is fine in a **production** build — MUI ships ES modules marked side-effect free, so Vite/webpack tree-shake unused components. Path imports (\`@mui/material/Button\`) mainly speed up the **dev server**. (Next.js does this automatically with \`optimizePackageImports\`, which includes MUI packages by default.)

**Why it works:** a bundler can only drop code it can **prove** is unused. \`Icons[name]\` could be any icon, so it keeps all of them. An explicit map makes the used set static. \`import()\` creates split points, so the first load only contains what the first screen needs — which improves LCP and INP on slow phones.

**Measure after:** compare the treemap and gzipped sizes, run Lighthouse on a throttled mobile profile, and add a size budget in CI (e.g. \`size-limit\`) so the bundle does not grow back.`,
      followUps: [
        {
          q: 'How would the same issue look in a Next.js App Router app?',
          a: 'Page-level code splitting is automatic per route, but a heavy import inside a shared layout or a shared client component still lands on every page. Use `next/dynamic` for heavy client-only widgets (charts, data grids), and keep components as Server Components when they do not need interactivity so their JS is not shipped at all.',
        },
        {
          q: 'What does "sideEffects: false" in package.json mean?',
          a: 'It tells the bundler that importing a module does nothing except define exports. So if none of its exports are used, the whole file can be dropped. CSS imports are side effects, so packages list them as exceptions (e.g. `"sideEffects": ["*.css"]`).',
        },
      ],
    },
    {
      id: 'design-tokens-multi-app',
      title: 'Design a design-token system shared by 3 apps',
      difficulty: 'hard',
      type: 'design',
      frequency: 'occasional',
      relatedTopic: 'design-systems-tokens',
      question: `Your company has three products:

- a Next.js marketing site using **Tailwind v4**,
- an admin app using **MUI**,
- a React Native mobile app.

Brand colours, spacing and fonts drift apart — the "primary blue" is 3 slightly different blues. Leadership also wants **dark mode** everywhere and maybe **white-label themes** for enterprise customers.

Design a design-token system: where tokens live, their structure, how they reach each app, how dark mode / white-label works, and how changes are released safely.`,
      hints: [
        'Use one **source of truth** in a tool-neutral format (JSON / W3C Design Tokens format) and **generate** platform outputs from it (e.g. Style Dictionary).',
        'Use layers: primitive tokens (`blue-600`) -> semantic tokens (`color.action.primary`) -> optional component tokens (`button.primary.bg`). Apps use semantic tokens.',
        'Themes (dark, customer brands) only re-map the **semantic** layer. Ship tokens as a versioned npm package with visual regression tests.',
      ],
      solution: `**Idea:** one source of truth for tokens, in layers, built into each platform's format by a pipeline, and shipped as a versioned package. Apps only use **semantic** tokens, so themes can change values without touching components.

**1. Structure — three layers**

\`\`\`json
{
  "primitive": {
    "blue":  { "600": { "$value": "#2563eb", "$type": "color" },
               "400": { "$value": "#60a5fa", "$type": "color" } },
    "space": { "2": { "$value": "8px", "$type": "dimension" },
               "4": { "$value": "16px", "$type": "dimension" } }
  },
  "semantic": {
    "color": {
      "action":  { "primary": { "$value": "{primitive.blue.600}" } },
      "surface": { "default": { "$value": "{primitive.white}" } },
      "text":    { "default": { "$value": "{primitive.gray.900}" } }
    }
  },
  "component": {
    "button": { "primary": { "bg": { "$value": "{semantic.color.action.primary}" } } }
  }
}
\`\`\`

- **Primitive** = the raw palette ("what colours exist"). Apps never use them directly.
- **Semantic** = meaning ("what the colour is for"). This is what apps use.
- **Component** = optional, for special cases.

**2. Themes** — extra files that override only the semantic layer:

\`\`\`text
tokens/
  primitive.json
  semantic.light.json      color.action.primary -> blue.600
  semantic.dark.json       color.action.primary -> blue.400  (lighter on dark)
  brands/acme.json         color.action.primary -> acme-red.600  (white-label)
\`\`\`

**3. Build pipeline** (Style Dictionary or similar) generates:

\`\`\`text
@company/tokens (npm package)
├── css/variables.css     :root { --color-action-primary: #2563eb; }
│                         [data-theme="dark"] { --color-action-primary: #60a5fa; }
├── tailwind/theme.css    @theme { --color-action-primary: var(--color-action-primary); }
├── mui/theme.ts          palette.primary.main = 'var(--color-action-primary)' (via cssVariables)
└── native/tokens.ts      export const colors = { light: {...}, dark: {...} }
\`\`\`

**4. How each app uses it**

- **Tailwind v4:** import \`variables.css\` + \`theme.css\`, write \`bg-action-primary\`. Dark mode and brands change the CSS variables at runtime — no rebuild.
- **MUI:** the generated theme file plugs into \`createTheme\` (with \`cssVariables: true\` in v6+ so MUI also reads CSS variables).
- **React Native** (no CSS variables): a JS object per theme, chosen with \`useColorScheme()\` and a context provider.
- **White-label:** the server picks a brand (by subdomain or org setting) and sets \`data-brand="acme"\` on \`<html>\`; the brand's CSS file overrides the semantic variables.

**5. Process and safety**

- Tokens are edited by design (Figma Variables / Tokens Studio -> pull request to the tokens repo) and reviewed by engineers.
- **Semver:** renaming/removing a token = major; new token = minor; value tweak = patch. Changelog generated automatically.
- CI: validate token references, check **contrast** of text/background pairs for every theme, and run **visual regression** tests (Storybook + Chromatic or Playwright screenshots) in consuming apps.
- Lint rule / Tailwind config that blocks raw hex colours in app code, so drift cannot come back.

**Why it works:** components depend on **meaning** (\`action.primary\`), not values (\`#2563eb\`). Changing the brand blue, adding dark mode or adding a customer theme is a token change in one place; the pipeline updates all three platforms consistently.`,
      followUps: [
        {
          q: 'Why not let apps use primitive tokens like blue-600 directly?',
          a: 'Then dark mode and white-label need code changes in every component ("blue-600 here should be blue-400 in dark"). Semantic tokens move that decision into the theme files.',
        },
        {
          q: 'How do you roll out a breaking token rename across 3 apps?',
          a: 'Release a minor version where the old name is an alias of the new one and marked deprecated (with a lint warning). Apps migrate at their own pace (a codemod helps). Remove the alias in the next major version.',
        },
        {
          q: 'Would you also share components, not just tokens?',
          a: 'Tokens are the cheapest shared layer and work across Tailwind, MUI and React Native. Sharing components only makes sense within one tech stack (e.g. a React + Tailwind/Radix UI package for the web apps). Start with tokens, add components where duplication hurts.',
        },
      ],
    },
  ],
};
