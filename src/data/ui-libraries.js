// UI Libraries — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'ui-libraries',
  title: 'UI Libraries',
  icon: '🧩',
  description: 'Tailwind CSS, Mantine and Material UI in practice: utility classes, theming, component overrides, headless vs styled libraries, accessibility, bundle size, design tokens, and how to choose.',
  definitionTitle: 'What are UI libraries?',
  definition: `A **UI library** gives you ready-made styling tools or components, so you don't build every button, modal and form from scratch.

- **Tailwind CSS** is a **utility-first** CSS framework. You style elements with small classes like \`p-4 text-lg bg-blue-500\` directly in your markup.
- **Mantine** and **Material UI (MUI)** are **component libraries**. They give you finished, accessible React components (buttons, dialogs, tables, date pickers) with a theme system.

**One-line answer:** "UI libraries speed up building interfaces — Tailwind gives utility classes for custom designs, while Mantine and MUI give ready-made, themeable React components."`,
  topics: [
    {
      id: 'tailwind-utility-first',
      title: 'Tailwind CSS: the utility-first idea',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Style by combining small single-purpose classes (flex, p-4, text-sm) in your markup; Tailwind generates only the CSS you actually use.',
      what: `**Tailwind CSS** is a **utility-first** CSS framework. Instead of writing a \`.card\` class in a CSS file, you put many tiny classes directly on the element:

\`\`\`html
<div class="rounded-lg bg-white p-6 shadow-md">...</div>
\`\`\`

Each class does **one thing**: \`p-6\` = padding, \`rounded-lg\` = border radius, \`shadow-md\` = box shadow.

Key features:
- **Responsive prefixes:** \`md:flex\` means "flex from the md breakpoint and up". It is mobile-first. Default breakpoints: \`sm\` 640px, \`md\` 768px, \`lg\` 1024px, \`xl\` 1280px, \`2xl\` 1536px.
- **State variants:** \`hover:\`, \`focus-visible:\`, \`disabled:\`, \`active:\`, \`group-hover:\`, \`peer-invalid:\`.
- **Arbitrary values:** \`w-[37px]\`, \`bg-[#1da1f2]\`, \`grid-cols-[200px_1fr]\` when the scale does not have what you need.
- **A design scale:** spacing, colours and font sizes come from a consistent theme, so the UI stays consistent.

#### Deeper version
- Tailwind **scans your source files** for class names and generates CSS only for the classes it finds. This is why the final CSS is small, and also why **class names must be complete strings** in your code: \`'bg-' + color + '-500'\` will not be found. Use a map of full class names instead.
- In Tailwind v3 you list the files to scan in \`content\` inside \`tailwind.config.js\`. In Tailwind v4 (released early 2025), source detection is automatic, and setup is one CSS line: \`@import "tailwindcss";\`.
- Utilities have low, equal specificity (single classes), so there are no specificity wars. Variants stack: \`dark:md:hover:bg-gray-700\`.
- \`group\` and \`peer\` let a child react to a parent's state (\`group-hover:\`) or an element react to a sibling's state (\`peer-checked:\`).
- v4 also has built-in container queries (\`@container\` on the parent, \`@md:\` on children). In v3 that needed a plugin.`,
      why: `- **Speed:** you style without switching files or inventing class names.
- **Consistency:** everyone uses the same spacing and colour scale.
- **Small CSS:** only used classes are shipped, and the CSS stops growing as the app grows, because classes are reused.
- **Safe to change:** deleting a component deletes its styles too; no dead CSS left in a global file.
- **Zero runtime:** works great with React Server Components and SSR.`,
      analogy: `Traditional CSS is like cooking a custom dish for every guest. Tailwind is like a well-stocked spice rack with labelled jars: you build each dish by combining the same small, standard ingredients. Every dish tastes consistent, and you never buy a spice you do not use.`,
      code: [
        {
          title: 'A responsive card in Tailwind',
          lang: 'jsx',
          code: `export function ProductCard({ name, price, image }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:p-6">
      {/* column on phones, row from md (768px) and up */}
      <img src={image} alt={name} className="h-40 w-full rounded-lg object-cover md:w-40" />

      <div className="flex flex-1 flex-col justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-green-600">\${price}</p>

        <button
          type="button"
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white
                     hover:bg-blue-700 focus-visible:outline focus-visible:outline-2
                     focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}`,
        },
        {
          title: 'Dynamic classes: the right way',
          lang: 'jsx',
          code: `// BAD: Tailwind cannot see "bg-red-500" in the source, so it is never generated
const bad = (color) => 'bg-' + color + '-500';

// GOOD: full class names exist as strings in the code
const statusClasses = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export function Badge({ status, children }) {
  return (
    <span className={'rounded px-2 py-0.5 text-xs font-medium ' + statusClasses[status]}>
      {children}
    </span>
  );
}`,
        },
      ],
      output: `On phones the card stacks the image above the text with 16px padding. From 768px (\`md:\`) it switches to a row with the image 160px wide and 24px padding. The button darkens on hover, shows a visible outline only for keyboard focus, and fades when disabled. The price shows as "$120" (the \`$\` is plain text in JSX).

In the badge example, the bad helper produces a class Tailwind never generated, so the badge has no colour. The map version works because Tailwind sees every full class name in the file and generates them.`,
      questions: [
        {
          q: 'What does utility-first mean?',
          a: 'Styling with many small single-purpose classes (`p-4`, `flex`, `text-sm`) composed in the markup, instead of writing custom semantic classes in a CSS file.',
        },
        {
          q: 'Does Tailwind make the CSS bundle huge?',
          a: 'No. It scans your files and only generates the classes you use, so production CSS is usually small and stops growing as you reuse classes.',
        },
        {
          q: 'What does `md:flex` mean?',
          a: '"Apply `display: flex` from the md breakpoint (768px by default) and up." Tailwind is mobile-first: unprefixed classes apply to all sizes.',
        },
        {
          q: 'Why does `bg-${color}-500` not work?',
          a: 'Tailwind finds classes by scanning source text at build time. A dynamically built string never appears as a complete class name, so it is not generated. Use a lookup object of full class names.',
        },
        {
          q: 'What are group and peer?',
          a: 'Add `group` to a parent and use `group-hover:` on children to react to the parent\'s hover. Add `peer` to an element and use `peer-checked:` or `peer-invalid:` on a later sibling to react to its state.',
        },
      ],
      spoken: `"Tailwind is a utility-first CSS framework: instead of writing custom classes in a stylesheet, I compose small single-purpose classes like flex, p-4 and text-sm right in the JSX. It's mobile-first, so md colon flex means flex from 768 pixels up, and it has state variants like hover and focus-visible. Tailwind scans my source files and only generates the classes I use, so the CSS stays small and there's no runtime cost, which works nicely with server components. The one rule is that class names must be complete strings — I use lookup maps instead of building class names dynamically."`,
      mistakes: [
        'Building class names with string concatenation (`"text-" + size`). Tailwind cannot detect them.',
        'Thinking `sm:` means "small screens only". It means sm **and up**.',
        'Using arbitrary values everywhere (`p-[13px]`), which defeats the consistent design scale.',
        'Follow-up trap: "Isn\'t this just inline styles?" No. Utilities use a constrained design scale, support hover/focus/responsive variants and media queries, and are reused classes — inline styles can do none of that.',
      ],
      takeaway: 'Tailwind = compose small utility classes, mobile-first prefixes, and only the CSS you use is generated — keep class names as full strings.',
    },
    {
      id: 'tailwind-dark-mode-theme',
      title: 'Tailwind: dark mode and theme customisation (v3 vs v4)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Customise colours, fonts and breakpoints in tailwind.config.js (v3) or with CSS @theme variables (v4), and add dark: styles via media query or a class.',
      what: `**Customising the theme** means adding your brand colours, fonts and breakpoints so classes like \`bg-brand-500\` exist.

- **Tailwind v3:** you edit a JavaScript file, \`tailwind.config.js\`, under \`theme.extend\`.
- **Tailwind v4:** configuration moved into **CSS**. You write \`@theme { --color-brand-500: ...; }\` in your main CSS file, and Tailwind creates the classes **and** real CSS variables.

**Dark mode** uses the \`dark:\` variant: \`bg-white dark:bg-gray-900\`.
- By default, \`dark:\` follows the operating system setting (\`prefers-color-scheme\`).
- For a manual toggle button, you switch it to a **class strategy**: dark styles apply when \`<html class="dark">\` is set.

#### Deeper version
- **v3 dark mode toggle:** \`darkMode: 'class'\` in the config (v3.4 also added \`'selector'\`, which is the newer name for the same idea).
- **v4 dark mode toggle:** override the variant in CSS: \`@custom-variant dark (&:where(.dark, .dark *));\`.
- **v4 setup:** \`@import "tailwindcss";\` plus a build integration (the Vite plugin \`@tailwindcss/vite\` or the PostCSS plugin \`@tailwindcss/postcss\`). Content detection is automatic. v4 can still load a legacy JS config with \`@config "./tailwind.config.js";\` while you migrate.
- In v4, theme values are exposed as CSS variables (\`var(--color-brand-500)\`), so you can use them in plain CSS and change them at runtime.
- Avoid the "flash of wrong theme" on page load: set the \`dark\` class with a tiny inline script in \`<head>\` **before** React hydrates (libraries like \`next-themes\` do this).
- Version details move fast — confirm exact syntax in the Tailwind docs for the version your project uses.`,
      why: `Every real project has brand colours, fonts and often a dark mode. Interviewers want to know you can set up a theme properly instead of sprinkling arbitrary values like \`bg-[#7c3aed]\` everywhere, and that you know v4 changed how config works.`,
      analogy: `The theme is the paint catalogue for your building. In v3 the catalogue was a separate notebook (JS config). In v4 the catalogue is printed right on the wall of the paint shop (CSS \`@theme\`), so everyone, including plain CSS, can read it. Dark mode is a light switch: either automatic by the time of day (OS setting) or a manual switch on the wall (the \`dark\` class).`,
      code: [
        {
          title: 'Tailwind v3: tailwind.config.js',
          lang: 'javascript',
          code: `// tailwind.config.js (Tailwind v3)
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // files to scan
  darkMode: 'class',            // toggle with <html class="dark">
  theme: {
    extend: {                   // extend = keep defaults, add ours
      colors: {
        brand: { 50: '#f5f3ff', 500: '#7c3aed', 700: '#6d28d9' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      screens: { '3xl': '1920px' },
    },
  },
  plugins: [],
};`,
        },
        {
          title: 'Tailwind v4: CSS-first config with @theme',
          lang: 'css',
          code: `/* src/index.css (Tailwind v4) */
@import "tailwindcss";

/* Manual dark mode toggle via a .dark class instead of the OS setting */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-brand-50: #f5f3ff;
  --color-brand-500: #7c3aed;  /* creates bg-brand-500, text-brand-500, ... */
  --color-brand-700: #6d28d9;
  --font-sans: "Inter", sans-serif;
  --breakpoint-3xl: 120rem;    /* creates the 3xl: variant */
}

/* Theme values are real CSS variables, usable anywhere */
.chart-line { stroke: var(--color-brand-500); }`,
        },
        {
          title: 'Using the theme and toggling dark mode',
          lang: 'jsx',
          code: `export function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="rounded-md bg-brand-500 px-3 py-1.5 text-white hover:bg-brand-700
                 dark:bg-brand-50 dark:text-brand-700"
    >
      Toggle theme
    </button>
  );
}`,
        },
      ],
      output: `Both the v3 config and the v4 \`@theme\` block create the same classes: \`bg-brand-500\`, \`text-brand-700\`, \`font-sans\` using Inter, and a new \`3xl:\` breakpoint. In v4 you also get CSS variables such as \`--color-brand-500\`, which the \`.chart-line\` rule uses directly.

Clicking the toggle adds or removes \`dark\` on \`<html>\`. Because of the class strategy, the \`dark:\` classes switch the button to a light purple background with dark purple text. The choice is saved in localStorage so an inline head script can restore it on the next visit without a flash.`,
      questions: [
        {
          q: 'How do you add a custom brand colour in Tailwind?',
          a: 'v3: add it under `theme.extend.colors` in `tailwind.config.js`. v4: define `--color-brand-500` (etc.) inside `@theme` in your CSS. Both generate `bg-brand-500` style classes.',
        },
        {
          q: 'What is the difference between `theme` and `theme.extend` in v3?',
          a: '`theme.extend` adds to the default scale. Putting keys directly in `theme` replaces the defaults, so you would lose all the built-in colours for that key.',
        },
        {
          q: 'How does dark mode work in Tailwind?',
          a: 'Use `dark:` variants. By default they follow `prefers-color-scheme`. For a manual toggle, use the class strategy (`darkMode: \'class\'` in v3, a `@custom-variant dark` in v4) and toggle `class="dark"` on `<html>`.',
        },
        {
          q: 'What changed in Tailwind v4?',
          a: 'CSS-first configuration with `@theme`, one-line setup with `@import "tailwindcss"`, automatic content detection, theme values exposed as CSS variables, built-in container queries, and a much faster engine. Old JS configs can still be loaded with `@config`.',
        },
      ],
      spoken: `"To customise Tailwind I add brand tokens to the theme. In Tailwind v3 that's tailwind.config.js under theme.extend, so I keep the defaults and add brand colours, fonts and breakpoints. In v4 the config moved into CSS: I import tailwindcss and define variables inside an at-theme block, like color-brand-500, which generates the utilities and also exposes real CSS variables. For dark mode I use the dark variant; by default it follows the OS, and for a toggle I switch to a class strategy and put a dark class on html, set early by a head script to avoid a flash."`,
      mistakes: [
        'Putting custom colours directly under `theme` (not `extend`) in v3 and losing all default colours.',
        'Following a v3 tutorial in a v4 project (or the reverse) and wondering why `tailwind.config.js` or `@theme` is ignored. Check which version is installed.',
        'Setting the dark class in a React `useEffect`, which causes a flash of the light theme on load.',
        'Follow-up trap: "Where do you configure content paths in v4?" Usually nowhere — detection is automatic. You can add extra sources with `@source` if a file is not detected.',
      ],
      takeaway: 'v3 configures in tailwind.config.js, v4 in CSS with @theme; dark: follows the OS by default, or a `.dark` class for a toggle.',
    },
    {
      id: 'headless-vs-styled',
      title: 'Headless vs Styled Component Libraries',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Styled libraries (MUI, Mantine) give ready-made looks; headless libraries (Radix, Headless UI, React Aria) give behaviour and accessibility with no styles.',
      what: `Component libraries come in two flavours:

- **Styled libraries** — components arrive **with a design**. You get a finished-looking Button, Modal, DatePicker. You customise through a theme. Examples: **Material UI (MUI)**, **Mantine**, Chakra UI, Ant Design.
- **Headless libraries** — components arrive with **behaviour and accessibility only**: keyboard navigation, focus management, ARIA attributes, open/close state. **No styles.** You bring your own (often Tailwind). Examples: **Radix UI**, **Headless UI**, **React Aria**, Ark UI. TanStack Table is a headless table.

#### Deeper version
- **shadcn/ui** is a popular middle path: it is not an npm dependency you import. A CLI **copies component source code** into your project, built on headless primitives (originally Radix) and styled with Tailwind. You own and edit the code. (Its underlying primitives and options have been evolving — check its current docs.)
- Headless APIs are often **compound components**: \`<Dialog.Root>\`, \`<Dialog.Trigger>\`, \`<Dialog.Content>\`, and they expose state through \`data-state="open"\` attributes you can style.
- **Trade-offs:**
  - Styled = fastest to build, consistent, but harder to match a unique brand design, more CSS/JS shipped, and you fight overrides.
  - Headless = full design control and smaller footprint, but you must style everything and keep the design consistent yourself.
- The hard part of components is not looks but **behaviour**: a combobox or menu needs correct ARIA roles, typeahead, arrow keys, focus return, scroll locking, portal rendering. Headless libraries solve exactly that.`,
      why: `Choosing between them affects speed of delivery, how closely you can match the designer's Figma, accessibility quality and bundle size. It is a common system-design-for-frontend question: "Which component library would you pick and why?"`,
      analogy: `A styled library is a fully furnished apartment: move in today, but changing the furniture style is work. A headless library is an apartment with all plumbing, wiring and locks done perfectly, but empty walls: you decorate it exactly how you want. shadcn/ui is a furniture kit delivered to your home that you assemble and can modify freely.`,
      code: [
        {
          title: 'Styled: a Mantine modal (looks done out of the box)',
          lang: 'jsx',
          code: `import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function DeleteDialog() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button color="red" onClick={open}>Delete</Button>
      <Modal opened={opened} onClose={close} title="Delete project?" centered>
        <Button color="red" onClick={close}>Yes, delete</Button>
      </Modal>
    </>
  );
}`,
        },
        {
          title: 'Headless: a Radix dialog styled with Tailwind',
          lang: 'jsx',
          code: `import * as Dialog from '@radix-ui/react-dialog';

export function DeleteDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md bg-red-600 px-4 py-2 text-white">
        Delete
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2
                     rounded-xl bg-white p-6 shadow-xl data-[state=open]:animate-in"
        >
          <Dialog.Title className="text-lg font-semibold">Delete project?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            This cannot be undone.
          </Dialog.Description>
          <Dialog.Close className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white">
            Yes, delete
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}`,
        },
      ],
      output: `Both dialogs behave the same for users: clicking Delete opens a modal, focus moves inside, Tab stays trapped in the dialog, Escape closes it, and focus returns to the Delete button. Screen readers announce it as a dialog with its title.

The Mantine version looks finished with almost no code, using Mantine's design. The Radix version has no styles of its own — every visual detail comes from our Tailwind classes, so it can match any design exactly. The \`data-[state=open]:\` variant styles the open state Radix exposes. (\`animate-in\` comes from the \`tailwindcss-animate\` style plugins used by shadcn/ui; without such a plugin, write your own animation.)`,
      questions: [
        {
          q: 'What is a headless UI library?',
          a: 'A library that provides component logic, state, keyboard handling and accessibility, but no styles. You style it yourself. Examples: Radix UI, Headless UI, React Aria.',
        },
        {
          q: 'When would you choose a styled library like MUI?',
          a: 'For admin panels, internal tools, MVPs, or when the design follows that library\'s style (e.g. Material Design) and speed matters more than a unique look.',
        },
        {
          q: 'What is shadcn/ui and how is it different?',
          a: 'A collection of components you copy into your codebase via a CLI, built on headless primitives and Tailwind. You own the code instead of installing a versioned dependency.',
        },
        {
          q: 'Why not build every component yourself from scratch?',
          a: 'Accessible behaviour (focus trapping, keyboard navigation, ARIA, positioning) is hard and easy to get wrong. Headless libraries give you that tested behaviour while you keep design control.',
        },
      ],
      spoken: `"Styled libraries like MUI and Mantine give you finished components with a design and a theming system — they're the fastest way to build, especially for dashboards and internal tools. Headless libraries like Radix, Headless UI or React Aria give you only the behaviour and accessibility — focus management, keyboard support, ARIA — with zero styles, so I can style them with Tailwind to match a custom design exactly. shadcn/ui sits in between: it copies Radix-based, Tailwind-styled components into my repo so I own them. For a unique brand, I go headless; for speed, styled."`,
      mistakes: [
        'Building complex widgets (combobox, menu, date picker) from scratch and missing keyboard and screen-reader support.',
        'Picking a styled library for a highly custom brand design, then spending weeks overriding its styles.',
        'Thinking "headless" means "no accessibility". The opposite: accessibility is the main thing headless libraries provide.',
        'Follow-up trap: "Is shadcn/ui a component library you install?" Not in the usual way — it copies source code into your project. You get full control but also own updates and bug fixes.',
      ],
      takeaway: 'Styled = speed and a ready design; headless = behaviour + accessibility with full design control; shadcn/ui = headless code you own.',
    },
    {
      id: 'tailwind-best-practices',
      title: 'Tailwind best practices: clsx, tailwind-merge, components, @apply',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Keep Tailwind maintainable: extract components (not CSS classes), combine classes with clsx + tailwind-merge (cn helper), use variant maps, and use @apply sparingly.',
      what: `Long class strings can get messy. The main tools to keep them clean:

- **Extract React components**, not CSS classes. If a button style repeats, make a \`<Button>\` component. The class string lives in one place.
- **clsx** — builds a class string from conditions: \`clsx('px-4', isActive && 'bg-blue-600')\`.
- **tailwind-merge** (\`twMerge\`) — resolves **conflicting** Tailwind classes so the last one wins: \`twMerge('px-2 px-4')\` → \`'px-4'\`.
- A small **\`cn()\` helper** combines both. It is the standard pattern in shadcn/ui projects.
- **Variants:** a map of full class names per variant/size, or the \`cva\` library (class-variance-authority).
- **Prettier plugin** (\`prettier-plugin-tailwindcss\`) sorts classes in a consistent order automatically.

#### Deeper version
**Why tailwind-merge is needed:** in CSS, the winner between two classes with equal specificity is decided by their order **in the stylesheet**, not in the \`class\` attribute. So \`className="p-2 p-4"\` might render with \`p-2\` — whichever Tailwind wrote later in the CSS. When a component has default classes and accepts a \`className\` prop for overrides, you need \`twMerge\` so the caller's class really wins.

**@apply trade-offs:** \`@apply\` copies utilities into a custom CSS class: \`.btn { @apply rounded px-4 py-2; }\`.
- Good for: styling HTML you do not control (CMS/markdown content, third-party widgets), or very small global bases.
- Bad when overused: you are back to inventing class names and maintaining CSS files, losing the main benefit of Tailwind. The Tailwind team itself recommends components over \`@apply\` for reuse.
- In v4, using \`@apply\` inside separate CSS modules or component \`<style>\` blocks may need \`@reference\` to import theme context — check the docs for your setup.`,
      why: `Without these patterns, Tailwind projects end up with duplicated 20-class strings, broken overrides ("why is my className prop ignored?") and inconsistent variants. Interviewers ask about this to see if you have used Tailwind at scale, not just in a tutorial.`,
      analogy: `clsx is a checklist: "add this item if the condition is true". tailwind-merge is a referee: if two classes fight over the same property (two paddings), it keeps only the last one. Extracting a component is like creating a recipe card so nobody re-types the ingredients list every time.`,
      code: [
        {
          title: 'The cn() helper',
          lang: 'typescript',
          code: `// lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Examples
cn('px-4 py-2', false && 'hidden', 'bg-blue-600');   // "px-4 py-2 bg-blue-600"
cn('px-4 py-2 bg-blue-600', 'bg-red-600');           // "px-4 py-2 bg-red-600" (conflict resolved)
cn('text-sm', { 'font-bold': true, italic: false }); // "text-sm font-bold"`,
        },
        {
          title: 'A Button component with variants (cva) and overrides',
          lang: 'tsx',
          code: `import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-12 px-6 text-lg' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  // caller's className wins over defaults thanks to twMerge inside cn
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

// Usage: <Button variant="danger" size="sm" className="w-full">Delete</Button>`,
        },
        {
          title: '@apply: fine for content you do not control',
          lang: 'css',
          code: `/* Styling HTML from a CMS / markdown renderer, where you cannot add classes */
.prose-content a {
  @apply font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800;
}

/* Avoid: recreating a whole component library with @apply.
   .btn-primary { @apply ...20 utilities... }  -> prefer a <Button> component */`,
        },
      ],
      output: `\`cn()\` drops falsy values (clsx) and removes conflicts (twMerge), so \`bg-red-600\` replaces \`bg-blue-600\` instead of both being present and the stylesheet order deciding.

The \`Button\` has one source of truth for its styles. \`<Button variant="danger" size="sm" className="w-full">\` renders a small red full-width button. If a caller passes \`className="px-8"\`, it correctly replaces the default \`px-3\`/\`px-4\` instead of fighting it.

The \`@apply\` rule styles links inside CMS content where adding utility classes to each \`<a>\` is impossible.`,
      questions: [
        {
          q: 'Why do you need tailwind-merge?',
          a: 'Because conflicting classes like `p-2 p-4` are resolved by stylesheet order, not attribute order. twMerge removes the earlier conflicting class so overrides passed via `className` actually win.',
        },
        {
          q: 'clsx vs tailwind-merge?',
          a: 'clsx joins classes conditionally. tailwind-merge resolves Tailwind conflicts. They solve different problems and are usually combined in a `cn()` helper.',
        },
        {
          q: 'What are the trade-offs of @apply?',
          a: 'It is useful for content you cannot add classes to, but overusing it brings back custom class names and CSS files, losing Tailwind\'s benefits. Prefer extracting components.',
        },
        {
          q: 'How do you handle long class strings?',
          a: 'Extract components, use variant maps or cva, sort with the Prettier plugin, and split very long strings across lines.',
        },
      ],
      spoken: `"To keep Tailwind maintainable, I extract repeated styles into React components rather than CSS classes, so the class string lives in one place. I use a cn helper that combines clsx, for conditional classes, with tailwind-merge, which resolves conflicts — that's important because two padding classes are resolved by stylesheet order, not the order in className, so without twMerge a caller's override might silently lose. For variants I use cva or a simple map. I use apply only for things like CMS content where I can't add classes, and the Prettier plugin keeps class order consistent."`,
      mistakes: [
        'Passing `className` overrides without `twMerge`, then being surprised the default class still wins.',
        'Recreating Bootstrap with `@apply` (`.btn`, `.card`, `.input` in CSS) and losing the point of Tailwind.',
        'Copy-pasting the same 15-class string across many files instead of making a component.',
        'Follow-up trap: "Does the order of classes in className decide which wins?" No. Order in the generated stylesheet decides. That is exactly why tailwind-merge exists.',
      ],
      takeaway: 'Reuse with components, combine with `cn()` = clsx + tailwind-merge, use variants for options, and keep @apply for content you cannot touch.',
    },
    {
      id: 'mantine',
      title: 'Mantine: components, hooks, theming, forms',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A full React UI kit: 100+ styled components, a big hooks library, createTheme/MantineProvider theming, and @mantine/form for forms.',
      what: `**Mantine** is a React component library with a modern look and a strong developer experience. It is split into packages:

- \`@mantine/core\` — components: Button, TextInput, Select, Modal, Table, Tabs, AppShell (page layout), Grid, Stack, Group and many more.
- \`@mantine/hooks\` — useful hooks that work even without Mantine components: \`useDisclosure\`, \`useDebouncedValue\`, \`useMediaQuery\`, \`useLocalStorage\`, \`useClickOutside\`, \`useHotkeys\`.
- \`@mantine/form\` — form state and validation.
- Extras: \`@mantine/dates\`, \`@mantine/notifications\`, \`@mantine/charts\`, \`@mantine/spotlight\` and more.

You wrap the app in \`<MantineProvider theme={theme}>\` and import Mantine's CSS once.

#### Deeper version
- **Styling engine:** since **v7**, Mantine dropped Emotion (runtime CSS-in-JS) and uses **plain CSS files and CSS Modules** with CSS variables. That means no runtime styling cost and better support for server rendering. You must import \`@mantine/core/styles.css\`. (Older v6 tutorials using \`sx\` and \`createStyles\` are outdated.)
- **Theme:** \`createTheme({ primaryColor, colors, fontFamily, defaultRadius, components })\`. Custom colours must be **10 shades** (index 0 lightest to 9 darkest).
- **Styles API:** customise inner parts of a component with \`classNames\` or \`styles\` props, e.g. \`classNames={{ input: classes.input, label: classes.label }}\`. Defaults for every instance go in \`theme.components\`.
- **Style props:** shorthand props like \`mt="md"\`, \`p="lg"\`, \`c="dimmed"\`, \`fw={500}\`.
- **Color scheme:** \`defaultColorScheme="auto"\` on the provider, \`useMantineColorScheme()\` to toggle, and \`<ColorSchemeScript />\` in \`<head>\` for SSR to avoid a flash.
- **Forms:** \`useForm({ initialValues, validate })\`, spread \`form.getInputProps('email')\` on inputs, submit with \`form.onSubmit(handler)\`. Newer versions also offer an uncontrolled mode for performance — check the docs for your version. It also integrates with Zod via a resolver package.
- Mantine moves fast (v7, v8...). Confirm APIs for your installed major version.`,
      why: `Mantine lets a small team build a polished dashboard or SaaS app quickly: rich components, dark mode, forms, notifications and hooks in one consistent ecosystem, with less CSS-in-JS overhead than older libraries.`,
      analogy: `Mantine is like a well-equipped modular kitchen from one brand: cabinets (components), appliances (hooks), and a recipe book (form helpers) that all fit together. You can still repaint the cabinet doors (theme) to match your home.`,
      code: [
        {
          title: 'Provider and theme',
          lang: 'tsx',
          code: `// main.tsx
import '@mantine/core/styles.css';           // required since v7
import { MantineProvider, createTheme } from '@mantine/core';
import { createRoot } from 'react-dom/client';
import App from './App';

const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    // 10 shades, light (0) -> dark (9)
    brand: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa',
            '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
  },
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: { defaultProps: { size: 'md' } },  // default for every Button
  },
});

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme} defaultColorScheme="auto">
    <App />
  </MantineProvider>
);`,
        },
        {
          title: 'A form with @mantine/form and hooks',
          lang: 'tsx',
          code: `import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';

export function SignupForm() {
  const [loading, { open: start, close: stop }] = useDisclosure(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\\S+@\\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length >= 8 ? null : 'At least 8 characters'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    start();
    await fetch('/api/signup', { method: 'POST', body: JSON.stringify(values) });
    stop();
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm" maw={360}>
        <TextInput label="Email" withAsterisk {...form.getInputProps('email')} />
        <PasswordInput label="Password" withAsterisk {...form.getInputProps('password')} />
        <Button type="submit" loading={loading}>Create account</Button>
      </Stack>
    </form>
  );
}`,
        },
      ],
      output: `The whole app uses the purple \`brand\` palette as its primary colour, Inter font and medium radius. Every \`<Button>\` defaults to size md. The colour scheme follows the OS setting.

In the form, \`getInputProps\` wires \`value\`, \`onChange\`, \`error\` and blur handling into each input. Submitting with a bad email shows "Invalid email" under the field (with correct ARIA linking) and does not call the handler. With valid data, the button shows a spinner while the request runs, controlled by \`useDisclosure\`.`,
      questions: [
        {
          q: 'How do you theme Mantine?',
          a: 'Create a theme with `createTheme` (primaryColor, colors with 10 shades, fonts, radius, component defaults) and pass it to `<MantineProvider>`.',
        },
        {
          q: 'How did Mantine v7 change styling?',
          a: 'It removed Emotion and moved to native CSS / CSS Modules with CSS variables. You import its CSS file and customise with `classNames`, `styles`, and CSS modules. No runtime CSS-in-JS.',
        },
        {
          q: 'How do forms work in Mantine?',
          a: '`useForm` holds values, errors and validation rules. `form.getInputProps(\'field\')` connects an input, and `form.onSubmit` validates before calling your handler.',
        },
        {
          q: 'Name some useful Mantine hooks.',
          a: '`useDisclosure` (open/close state), `useDebouncedValue`, `useMediaQuery`, `useLocalStorage`, `useClickOutside`, `useHotkeys`, `useIntersection`.',
        },
      ],
      spoken: `"Mantine is a React UI library with a large set of polished components, a separate hooks package, and a forms package. I set it up with MantineProvider and a theme from createTheme, where I define the primary colour as ten shades, fonts, radius and default props for components. Since version 7 it uses plain CSS and CSS modules instead of Emotion, so there's no runtime styling cost and it plays well with SSR — I just import its stylesheet. For forms I use useForm with getInputProps and validation rules, and hooks like useDisclosure and useDebouncedValue are handy even outside Mantine components."`,
      mistakes: [
        'Forgetting to import `@mantine/core/styles.css` in v7+, so components render unstyled.',
        'Following v6 tutorials (`createStyles`, `sx` prop) in a v7+ project.',
        'Defining a custom colour with fewer than 10 shades.',
        'Follow-up trap: "How do you avoid a dark-mode flash with SSR in Next.js?" Render `<ColorSchemeScript />` in the document head so the scheme is set before hydration.',
      ],
      takeaway: 'Mantine = components + hooks + forms in one ecosystem; theme with createTheme, and since v7 it styles with plain CSS, not CSS-in-JS.',
    },
    {
      id: 'mui-theming',
      title: 'Material UI: theming with createTheme and ThemeProvider',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Define palette, typography, spacing, breakpoints and component defaults in createTheme, then provide it with ThemeProvider to the whole app.',
      what: `**Material UI (MUI)** is the most widely used React component library. It implements Google's **Material Design**.

Theming in MUI:
1. Create a theme with \`createTheme({...})\`.
2. Wrap your app in \`<ThemeProvider theme={theme}>\`.
3. Add \`<CssBaseline />\` for a consistent CSS reset and background colour.

The theme holds:
- \`palette\` — colours: \`primary\`, \`secondary\`, \`error\`, \`background\`, \`text\`, and \`mode: 'light' | 'dark'\`.
- \`typography\` — font family and variants (\`h1\`...\`body2\`, \`button\`).
- \`spacing\` — base unit (default 8px), so \`theme.spacing(2)\` = 16px.
- \`breakpoints\` — \`xs, sm, md, lg, xl\` (0, 600, 900, 1200, 1536px by default).
- \`shape.borderRadius\` and \`components\` (default props and style overrides — next topic).

#### Deeper version
- You only define \`main\` for a palette colour; MUI computes \`light\`, \`dark\` and \`contrastText\` automatically.
- **Dark mode:** the classic way is two themes (\`mode: 'light'\` / \`'dark'\`) switched with state. Newer MUI versions (v6+) add \`colorSchemes: { light: true, dark: true }\` and a CSS-variables mode (\`cssVariables: true\`) which switch schemes without re-rendering everything and avoid a flash on SSR. Check the docs for your version.
- **TypeScript:** to add custom palette colours or theme keys, use **module augmentation** (\`declare module '@mui/material/styles'\`) so \`theme.palette.brand\` is typed.
- \`responsiveFontSizes(theme)\` makes typography scale with breakpoints.
- Nested \`ThemeProvider\`s can override the theme for one section of the app.
- MUI's default styling engine is **Emotion** (runtime CSS-in-JS). In the Next.js App Router you need MUI's integration package (\`@mui/material-nextjs\`) for SSR styles, and MUI components are client components. MUI is also working on zero-runtime options — check the current docs.`,
      why: `A good theme means you set brand colours, fonts and shapes **once**, and every MUI component (and your own components using the theme) follows them. It avoids one-off overrides everywhere and makes dark mode a single switch.`,
      analogy: `The MUI theme is a brand style guide given to every employee on day one. Instead of telling each person "our blue is #1976d2" separately, everyone reads the same guide. ThemeProvider is the HR department handing that guide to the whole company.`,
      code: [
        {
          title: 'Creating and providing a theme',
          lang: 'tsx',
          code: `import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo, useState } from 'react';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // useMemo: don't recreate the theme on every render
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#7c3aed' },   // light/dark/contrastText are computed
          secondary: { main: '#0ea5e9' },
        },
        typography: {
          fontFamily: 'Inter, Roboto, sans-serif',
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: { borderRadius: 10 },
        spacing: 8,                        // theme.spacing(2) === '16px'
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />                      {/* reset + background from the palette */}
      <button onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}>
        Toggle {mode === 'light' ? 'dark' : 'light'} mode
      </button>
      {children}
    </ThemeProvider>
  );
}`,
        },
        {
          title: 'Typed custom palette colour (module augmentation)',
          lang: 'typescript',
          code: `// theme.d.ts
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette { brand: Palette['primary']; }
  interface PaletteOptions { brand?: PaletteOptions['primary']; }
}

// Allow <Button color="brand">
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides { brand: true; }
}

// Then in createTheme: palette: { brand: { main: '#f59e0b' } }`,
        },
      ],
      output: `Every MUI component now uses purple as \`primary\`, Inter as the font, 10px corners, and buttons without uppercase text. \`CssBaseline\` sets the page background and text colour from the palette. Clicking the toggle switches \`mode\`, a new theme is created (once, thanks to \`useMemo\`), and the whole app flips to dark colours.

With the augmentation file, TypeScript accepts \`theme.palette.brand.main\` and \`<Button color="brand">\` with no type errors.`,
      questions: [
        {
          q: 'How do you customise MUI\'s look globally?',
          a: 'Create a theme with `createTheme` (palette, typography, spacing, shape, components) and wrap the app in `ThemeProvider`, usually with `CssBaseline`.',
        },
        {
          q: 'How does dark mode work in MUI?',
          a: 'Set `palette.mode: \'dark\'` (classic approach: switch between two themes), or in newer versions use `colorSchemes` with CSS variables so the switch happens without a full re-render.',
        },
        {
          q: 'What does `theme.spacing(2)` return?',
          a: '`16px` with the default 8px spacing unit. It keeps spacing consistent across the app.',
        },
        {
          q: 'How do you add a custom colour to the palette with TypeScript?',
          a: 'Add it in `createTheme` and use module augmentation on `@mui/material/styles` (Palette and PaletteOptions) so it is typed; augment component color overrides to use it as a prop.',
        },
      ],
      spoken: `"In MUI I theme the app once with createTheme — palette colours, where I usually just set main and MUI computes light, dark and contrast text — plus typography, spacing, border radius and breakpoints. Then I wrap the app in ThemeProvider with CssBaseline for a consistent reset. For dark mode, the classic way is switching palette mode between two memoised themes; newer versions support colorSchemes with CSS variables, which avoids flashes on SSR. In TypeScript, I use module augmentation to add custom colours like brand so they're fully typed."`,
      mistakes: [
        'Creating the theme inside the component body without `useMemo`, re-creating it on every render.',
        'Forgetting `CssBaseline`, so the dark mode background stays white.',
        'Hard-coding colours in components (`#7c3aed`) instead of using `theme.palette.primary.main` or `"primary.main"`.',
        'Follow-up trap: "Does MUI work in React Server Components?" MUI components use client-side features (Emotion context, state), so they render in client components; use MUI\'s Next.js integration for SSR styles.',
      ],
      takeaway: 'MUI theming = createTheme (palette, typography, spacing, components) + ThemeProvider + CssBaseline; never hard-code brand values.',
    },
    {
      id: 'mui-sx-styled-overrides',
      title: 'Material UI: sx prop, styled() and component overrides',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Three ways to customise MUI: sx for one-off styles, styled() for reusable styled components, and theme.components for global defaults and overrides.',
      what: `MUI gives three main ways to change styles. Pick by **scope**:

1. **\`sx\` prop** — one-off styles on a single element. It understands theme values: \`sx={{ p: 2, bgcolor: 'primary.main', borderRadius: 1 }}\`. It supports responsive objects: \`display: { xs: 'none', md: 'block' }\`.
2. **\`styled()\`** — create a **reusable** styled component: \`const Card = styled(Paper)(({ theme }) => ({ padding: theme.spacing(3) }))\`.
3. **Theme \`components\`** — change **every** instance of a component across the app: \`defaultProps\` (default prop values) and \`styleOverrides\` (CSS for internal slots like \`root\`).

#### Deeper version
- **sx shorthands:** \`m\`, \`p\`, \`mx\`, \`py\` (spacing multiplied by \`theme.spacing\`), \`bgcolor\`, \`color: 'text.secondary'\`, \`borderRadius\` (multiplied by \`theme.shape.borderRadius\`). You can target nested parts with selectors: \`'& .MuiButton-startIcon': { mr: 0.5 }\`, and states: \`'&:hover': {...}\`.
- **Slots and global class names:** each component has named slots (\`root\`, \`input\`, \`label\`...) and stable class names (\`.MuiButton-root\`, \`.Mui-disabled\`, \`.Mui-focused\`). Overrides target these. Many components accept \`slotProps\` to pass props to inner parts (older APIs used \`componentsProps\`/\`InputProps\` — names changed across versions, check the docs).
- **Variants:** \`theme.components.MuiButton.variants\` lets you define a new variant (e.g. \`variant: 'dashed'\`), with TypeScript augmentation.
- **Performance:** \`sx\` and \`styled\` are processed by Emotion at runtime. \`sx\` is fine for most cases, but in very hot paths (thousands of list rows) prefer \`styled\` components or plain classes.
- **Avoid** deep CSS selectors against MUI's internal DOM structure; it can change between versions. Prefer slots, \`slotProps\`, and theme overrides.`,
      why: `Real projects must match a designer's spec, not default Material Design. Knowing which tool to use keeps overrides consistent and avoids a mess of \`!important\` and duplicated styles.`,
      analogy: `\`sx\` is a sticky note on one document ("make this one bold"). \`styled()\` is a template you reuse for a type of document. Theme overrides are changing the company's default template so every new document follows it.`,
      code: [
        {
          title: 'sx prop with theme values and responsive styles',
          lang: 'tsx',
          code: `import { Box, Button, Typography } from '@mui/material';

export function Hero() {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 6 },                 // 16px on phones, 48px from md
        bgcolor: 'background.paper',
        borderRadius: 2,                     // 2 * theme.shape.borderRadius
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
      }}
    >
      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
        Grow faster
      </Typography>
      <Button
        variant="contained"
        sx={{ alignSelf: 'center', '&:hover': { boxShadow: 4 } }}
      >
        Start free trial
      </Button>
    </Box>
  );
}`,
        },
        {
          title: 'styled() for a reusable component',
          lang: 'tsx',
          code: `import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  borderLeft: '4px solid ' + theme.palette.primary.main,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

// <StatCard elevation={0}>Revenue: $12,400</StatCard>`,
        },
        {
          title: 'Global defaults and overrides in the theme',
          lang: 'tsx',
          code: `import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,     // every Button: no shadow
        variant: 'contained',
      },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 999 }, // pill buttons
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.secondary.main,
          },
        }),
      },
    },
  },
});`,
        },
      ],
      output: `The Hero box has 16px padding and stacks vertically on phones, and 48px padding in a row from 900px (\`md\`). The heading uses the primary colour, and the button gets a stronger shadow on hover — all from theme values, so dark mode and brand changes apply automatically.

\`StatCard\` is a reusable Paper with a coloured left border and smaller padding on small screens. With the theme overrides, every \`<Button>\` in the app is a flat, contained, pill-shaped button with normal-case text, every \`TextField\` is small and full width, and focused outlined inputs get the secondary colour border — without touching any component code.`,
      questions: [
        {
          q: 'When do you use sx vs styled vs theme overrides?',
          a: '`sx` for one-off tweaks on a single element; `styled()` for a reusable custom component; theme `components` (defaultProps/styleOverrides) when every instance in the app should change.',
        },
        {
          q: 'How does sx know about the theme?',
          a: 'It resolves shorthand keys and string paths against the theme: `p: 2` uses `theme.spacing`, `color: \'primary.main\'` reads the palette, and responsive objects use theme breakpoints.',
        },
        {
          q: 'How do you style an inner part of an MUI component?',
          a: 'Use the component\'s slot overrides in the theme (`styleOverrides.input`), `slotProps`, or target its stable class names like `.MuiOutlinedInput-notchedOutline` in `sx`.',
        },
        {
          q: 'Is the sx prop bad for performance?',
          a: 'It is processed at runtime by Emotion. It is fine for normal use, but for very large lists, a `styled` component or static classes perform better.',
        },
      ],
      spoken: `"MUI gives me three levels of customisation. The sx prop is for one-off styles on a single element, and it understands the theme — p 2 means two spacing units, colour primary.main reads the palette, and I can pass responsive objects with breakpoints. styled is for reusable components, like a StatCard built on Paper with access to the theme. And theme components with defaultProps and styleOverrides change every instance globally — for example, all buttons without uppercase text and elevation. I avoid deep selectors into MUI internals and use slots and class names like Mui-focused instead."`,
      mistakes: [
        'Repeating the same `sx` object on many components instead of using `styled()` or a theme override.',
        'Using `!important` to beat MUI styles instead of targeting the right slot or state class like `.Mui-disabled`.',
        'Writing `sx={{ padding: 2 }}` and expecting `2px`. In sx, `padding: 2` uses theme spacing (16px). Use a string like `\'2px\'` for raw values.',
        'Follow-up trap: "Where do MUI\'s `.Mui-focused` and `.Mui-disabled` come from?" They are global state classes MUI adds, meant to be used together with the component class for overrides.',
      ],
      takeaway: 'sx for one element, styled() for reusable pieces, theme components for app-wide defaults — all reading from the theme.',
    },
    {
      id: 'a11y-component-libraries',
      title: 'Accessibility in Component Libraries',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Libraries give accessible behaviour (focus, keyboard, ARIA) for free, but you still must provide labels, alt text, contrast and correct usage.',
      what: `Good component libraries (MUI, Mantine, Radix, React Aria, Headless UI) build **accessibility into the components**:
- Modals trap focus, close on Escape and return focus.
- Menus, tabs and selects support arrow keys and typeahead.
- Correct ARIA roles and states (\`aria-expanded\`, \`aria-selected\`, \`role="dialog"\`).
- Form inputs connect labels, descriptions and error messages.

**But a library cannot do everything.** You are still responsible for:
- Giving every input a **label** and every icon-only button an **accessible name**.
- **Alt text** for images.
- **Colour contrast** of your theme (custom brand colours can fail contrast).
- Using the **right component** (a Link for navigation, a Button for actions).
- Keeping **visible focus** styles when you customise.

#### Deeper version
- **Customisation can break accessibility:** removing focus outlines in overrides, replacing a native \`<button>\` with a \`Box onClick\`, or hiding a label visually with \`display: none\` (which also hides it from screen readers — use a visually-hidden style instead).
- **Polymorphic components** (\`component="a"\` in MUI/Mantine, \`asChild\` in Radix) let you render a link that looks like a button. Use them so the HTML element matches the behaviour.
- **Theme contrast:** MUI computes \`contrastText\` for palette colours, but always verify brand colours with a checker (WCAG AA 4.5:1 for normal text).
- **Testing:** use \`eslint-plugin-jsx-a11y\`, axe (browser extension or \`jest-axe\`/Playwright axe), keyboard-only manual testing, and a screen reader. Testing Library queries like \`getByRole('button', { name: 'Save' })\` also check accessibility indirectly — if you cannot find it by role and name, neither can a screen reader.
- **React Aria** (Adobe) is known for especially thorough accessibility and internationalisation behaviour; Radix and Headless UI are also strong.`,
      why: `Accessible behaviour for complex widgets is very hard to build correctly. Libraries save huge effort, but teams often assume "we use MUI, so we are accessible" and still ship unlabelled icon buttons and low-contrast themes. Interviewers want to hear that you know the split of responsibility.`,
      analogy: `A component library is like a car with ABS brakes and airbags already installed. That is a big safety win. But you still have to wear the seat belt, keep the mirrors clean and drive carefully — the car cannot do that for you.`,
      code: [
        {
          title: 'What you still must provide',
          lang: 'tsx',
          code: `import { IconButton, TextField, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export function Row() {
  return (
    <>
      {/* BAD: icon-only button with no accessible name -> announced as just "button" */}
      <IconButton><DeleteIcon /></IconButton>

      {/* GOOD: aria-label gives it a name; Tooltip helps sighted mouse users too */}
      <Tooltip title="Delete invoice">
        <IconButton aria-label="Delete invoice"><DeleteIcon /></IconButton>
      </Tooltip>

      {/* GOOD: label + helper/error text are wired to the input by MUI */}
      <TextField label="Invoice number" helperText="Format: INV-0001" />
    </>
  );
}`,
        },
        {
          title: 'Right element for the job (polymorphic components)',
          lang: 'tsx',
          code: `import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';

// Navigation that LOOKS like a button but IS a link (correct semantics)
export const GoToBilling = () => (
  <Button component={Link} to="/billing">Billing</Button>
);

// Radix asChild: merge behaviour onto your own element instead of adding a wrapper
export const HelpTip = () => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button type="button" aria-label="Help">?</button>
      </Tooltip.Trigger>
      <Tooltip.Content>Opens the help center</Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
);`,
        },
        {
          title: 'Automated check in tests',
          lang: 'typescript',
          code: `// Row.test.tsx (Vitest/Jest + Testing Library + jest-axe)
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Row } from './Row';

it('has an accessible delete button and no axe violations', async () => {
  const { container } = render(<Row />);
  expect(screen.getByRole('button', { name: 'Delete invoice' })).toBeInTheDocument();
  expect(await axe(container)).toHaveNoViolations(); // needs expect.extend(toHaveNoViolations) in setup
});`,
        },
      ],
      output: `A screen reader announces the first IconButton only as "button" — useless. The second is announced as "Delete invoice, button". The TextField is announced with its label and helper text, because MUI connects them with \`id\`s and \`aria-describedby\`.

The Mantine Button renders a real \`<a href="/billing">\` with button styles, so it works with middle-click and "open in new tab". Radix's \`asChild\` puts tooltip behaviour on our own \`<button>\` without wrapping it in another button.

In the test, axe would report the unlabelled IconButton as a violation ("Buttons must have discernible text"), so the test fails until it is fixed.`,
      questions: [
        {
          q: 'If we use MUI, is our app automatically accessible?',
          a: 'No. MUI handles behaviour like focus and ARIA in its components, but you must still provide labels, alt text, accessible names for icon buttons, enough contrast and correct element choice.',
        },
        {
          q: 'How do you render a link that looks like a button in MUI or Mantine?',
          a: 'Use the polymorphic `component` prop: `<Button component={Link} to="/x">` (or `href` in MUI). Radix uses `asChild`. The HTML stays a real link.',
        },
        {
          q: 'How do you test accessibility of components?',
          a: 'Lint with jsx-a11y, run axe in unit or e2e tests, query by role and name in Testing Library, and test manually with keyboard and a screen reader.',
        },
      ],
      spoken: `"Component libraries give me a big accessibility head start — modals trap focus and close on Escape, menus and tabs support arrow keys, and ARIA roles and states are set correctly. But it's a shared responsibility. I still have to label inputs, give icon-only buttons an aria-label, write alt text, check my brand colours for contrast, and use the right element — for example, Button with component equals Link for navigation. Customising can also break things, like removing focus outlines. I catch issues with jsx-a11y, axe in tests, getByRole queries, and keyboard testing."`,
      mistakes: [
        'Icon-only buttons without `aria-label`.',
        'Removing the focus ring in a theme override for design reasons.',
        'Using a Button with `onClick={() => navigate(...)}` for navigation instead of a link — breaks open-in-new-tab and semantics.',
        'Follow-up trap: "Is a Tooltip enough as the accessible name for an icon button?" Do not rely on it; some tooltip implementations do label the trigger, but an explicit `aria-label` is clear and reliable.',
      ],
      takeaway: 'Libraries give accessible behaviour; you still own labels, alt text, contrast, correct elements and visible focus.',
    },
    {
      id: 'forms-with-ui-libraries',
      title: 'Forms with UI Libraries (React Hook Form + Zod)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Connect library inputs to React Hook Form with register (native-like inputs) or Controller (controlled components like MUI Select or date pickers), validated by a Zod schema.',
      what: `Most teams use **React Hook Form (RHF)** for form state and **Zod** for validation rules, together with their UI library's inputs.

- \`register('email')\` — connects a **native-like** input (one that forwards \`ref\`, \`name\`, \`onChange\`, \`onBlur\`). Works with plain inputs, Tailwind/shadcn inputs and many library text inputs.
- \`<Controller>\` — wraps a **controlled** component that does not expose a native input ref in the usual way (MUI \`Select\`, \`Autocomplete\`, date pickers, Mantine \`Select\`). It gives you \`field.value\` and \`field.onChange\` to pass in.
- \`zodResolver(schema)\` — RHF validates with a Zod schema, and you get TypeScript types from the same schema with \`z.infer\`.

#### Deeper version
- RHF is **uncontrolled by default**: values live in the DOM/refs, so typing does not re-render the whole form. That is why it is fast for large forms. \`Controller\` makes one field controlled.
- Show errors with the library's own props: MUI \`error\` + \`helperText\`, Mantine \`error\`. This also wires \`aria-invalid\` and \`aria-describedby\`.
- One Zod schema can be **shared** with the server (e.g. a Next.js server action or Express route) so client and server validation never drift — and the server must validate anyway.
- Mantine has its own \`@mantine/form\`; MUI has none, so RHF is the usual choice there. shadcn/ui ships a Form wrapper built on RHF.
- Package names and resolver APIs change over versions (for example, Zod 4 and newer resolvers) — check the RHF and Zod docs for your versions.`,
      why: `Forms are a big part of real apps (sign-up, checkout, settings, admin CRUD). Knowing how to plug a component library into a form library cleanly — with types and accessible errors — is a very practical interview topic.`,
      analogy: `React Hook Form is the form's manager, Zod is the rulebook, and the UI library inputs are the counters customers talk to. \`register\` is for counters that already speak the manager's language. \`Controller\` is a translator for counters that speak a different language (controlled components).`,
      code: [
        {
          title: 'MUI + React Hook Form + Zod',
          lang: 'tsx',
          code: `import { zodResolver } from '@hookform/resolvers/zod';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  plan: z.enum(['free', 'pro'], { message: 'Pick a plan' }),
});
type FormValues = z.infer<typeof schema>;   // { email: string; plan: 'free' | 'pro' }

export function SignupForm() {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', plan: 'free' } });

  const onSubmit = async (data: FormValues) => {
    await fetch('/api/signup', { method: 'POST', body: JSON.stringify(data) });
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Text input: register works because TextField forwards the ref to the input */}
      <TextField
        label="Email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      {/* Select is controlled: use Controller */}
      <Controller
        name="plan"
        control={control}
        render={({ field }) => (
          <TextField select label="Plan" {...field} error={!!errors.plan} helperText={errors.plan?.message}>
            <MenuItem value="free">Free</MenuItem>
            <MenuItem value="pro">Pro</MenuItem>
          </TextField>
        )}
      />

      <Button type="submit" variant="contained" disabled={isSubmitting}>Sign up</Button>
    </Stack>
  );
}`,
        },
      ],
      output: `Typing in the email field does not re-render the whole form (uncontrolled). On submit, Zod validates: an invalid email shows "Enter a valid email" in red under the field, and the input gets \`aria-invalid\`. The plan select is controlled through \`Controller\`, so MUI receives \`value\` and \`onChange\` correctly. With valid data, \`onSubmit\` receives a fully typed object, and the button is disabled while the request runs.`,
      questions: [
        {
          q: 'register vs Controller in React Hook Form?',
          a: '`register` connects inputs that forward a ref and native events (uncontrolled, fastest). `Controller` wraps controlled components like MUI Select, Autocomplete or date pickers, giving them `value` and `onChange`.',
        },
        {
          q: 'Why use Zod with React Hook Form?',
          a: 'One schema gives validation rules, error messages and TypeScript types (`z.infer`), and it can be reused on the server.',
        },
        {
          q: 'Why is React Hook Form fast?',
          a: 'It is uncontrolled by default, so keystrokes do not re-render the whole form; it subscribes only to what you read (like specific errors).',
        },
      ],
      spoken: `"With component libraries I usually use React Hook Form with a Zod schema through zodResolver. For inputs that forward refs, like MUI TextField or shadcn inputs, I spread register. For controlled components like MUI Select, Autocomplete or date pickers, I use Controller, which hands me value and onChange. I show errors through the library's own props, like error and helperText in MUI, so ARIA is wired correctly. The Zod schema also gives me TypeScript types with z.infer, and I reuse the same schema on the server, because server validation is still required."`,
      mistakes: [
        'Using `register` on a controlled component like MUI `Autocomplete`, so the value never updates. Use `Controller`.',
        'Duplicating validation rules in the UI and the API instead of sharing one schema.',
        'Showing errors with a custom `<p>` that is not linked to the input, instead of the library\'s error/helper props.',
        'Follow-up trap: "Does client validation with Zod replace server validation?" No — the server must validate again, ideally with the same schema.',
      ],
      takeaway: 'register for ref-forwarding inputs, Controller for controlled ones, Zod for rules + types shared with the server.',
    },
    {
      id: 'bundle-size-tree-shaking',
      title: 'Bundle Size and Tree-Shaking with UI Libraries',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Ship only the components you use: ES module imports, tree-shaking, careful icon imports, lazy-loading heavy widgets, and measuring with a bundle analyzer.',
      what: `**Bundle size** is how much JavaScript (and CSS) the user must download. Big UI libraries can add a lot if used carelessly.

**Tree-shaking** is when the bundler (Vite/Rollup, webpack, Turbopack, esbuild) removes code you never import. It works when:
- The library ships **ES modules** (\`import\`/\`export\`).
- You import **only what you need**: \`import { Button } from '@mui/material'\`.
- The library marks files as having no side effects (\`"sideEffects": false\` in its \`package.json\`).

Main techniques:
1. Import named components, not whole libraries.
2. Be careful with **icon libraries** (thousands of icons).
3. **Lazy-load** heavy components (rich text editors, charts, date pickers) with \`React.lazy\` or \`next/dynamic\`.
4. **Measure** with a bundle analyzer before and after.

#### Deeper version
- **Production vs development:** named imports from a barrel file (\`@mui/material\` or \`@mui/icons-material\`) tree-shake fine in production builds, but in development they can make startup and HMR slow because the dev server processes the whole barrel. MUI suggests path imports (\`import Button from '@mui/material/Button'\`) or tooling to fix dev speed. Next.js has \`optimizePackageImports\` in \`next.config\` for this (several popular libraries are optimised by default — check the docs).
- **Side effects:** importing a CSS file is a side effect. Libraries that need global CSS (Mantine's \`styles.css\`) ship it separately; Mantine also offers per-component CSS files if you want to load less.
- **Runtime cost is not only bytes:** a runtime CSS-in-JS library (Emotion) adds its own runtime plus style work during render. Tailwind and CSS-Modules-based libraries add zero styling runtime.
- **Tailwind CSS size:** only used classes are generated (v3 \`content\` setting, v4 automatic detection). Dynamically built class names break this.
- **Analyze:** \`rollup-plugin-visualizer\` for Vite, \`@next/bundle-analyzer\` for Next.js, \`source-map-explorer\` for any build. Sites like bundlephobia show a package's size before you install it.
- **Watch for duplicates:** two versions of the same library (or both moment and date-fns) can sneak in through dependencies.`,
      why: `JavaScript is the most expensive asset per byte: it must be downloaded, parsed and executed on the main thread, which hurts LCP and INP, especially on mid-range phones. Interviewers ask this to see if you think about performance when choosing and using libraries.`,
      analogy: `A UI library is a huge toolbox. Tree-shaking is packing only the tools you need for today's job into your bag. Lazy-loading is leaving the heavy power drill in the van until you actually need it. The bundle analyzer is weighing your bag to see what is making it heavy.`,
      code: [
        {
          title: 'Import patterns',
          lang: 'tsx',
          code: `// GOOD: named imports (tree-shaken in production)
import { Button, TextField } from '@mui/material';

// GOOD for dev speed: path imports
import DeleteIcon from '@mui/icons-material/Delete';

// BAD: pulls a whole utility library into the bundle
// import _ from 'lodash';
// GOOD: import just the function (or use lodash-es / native code)
import debounce from 'lodash/debounce';

// Lazy-load a heavy widget only when it is shown
import { lazy, Suspense, useState } from 'react';
const RichTextEditor = lazy(() => import('./RichTextEditor'));

export function Notes() {
  const [editing, setEditing] = useState(false);
  return editing ? (
    <Suspense fallback={<p>Loading editor...</p>}>
      <RichTextEditor />
    </Suspense>
  ) : (
    <Button onClick={() => setEditing(true)} startIcon={<DeleteIcon />}>Edit notes</Button>
  );
}

const onSearch = debounce((q: string) => console.log('search', q), 300);
export { onSearch, TextField };`,
        },
        {
          title: 'Next.js: analyzer and optimised package imports',
          lang: 'javascript',
          code: `// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

export default withBundleAnalyzer({
  experimental: {
    // rewrites barrel imports to direct imports (check docs: some libs are included by default)
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
});

// Run: ANALYZE=true npm run build  -> opens a treemap of every chunk`,
        },
      ],
      output: `The first file only ships \`Button\`, \`TextField\`, one icon and one lodash function, not the whole libraries. The rich text editor lives in its own chunk that downloads only when the user clicks "Edit notes", so the initial page is lighter and faster to become interactive.

Running the build with \`ANALYZE=true\` opens a treemap where each library is a box sized by its bytes. You can spot a giant icon pack, a duplicate date library, or an editor that should be lazy-loaded.`,
      questions: [
        {
          q: 'What is tree-shaking?',
          a: 'Removing unused exports from the final bundle. It needs ES modules, imports of only what you use, and libraries that declare no side effects.',
        },
        {
          q: 'Are named imports from `@mui/material` bad for bundle size?',
          a: 'Not in production — they tree-shake. They can slow down development builds, so path imports or `optimizePackageImports` help dev speed.',
        },
        {
          q: 'How do you find what is making your bundle big?',
          a: 'Use a bundle analyzer (`@next/bundle-analyzer`, `rollup-plugin-visualizer`, `source-map-explorer`) and check packages on bundlephobia before adding them.',
        },
        {
          q: 'How do you reduce the cost of a heavy component like a chart or editor?',
          a: 'Lazy-load it with `React.lazy`/`next/dynamic` so it is a separate chunk that loads only when needed, and consider a lighter alternative.',
        },
      ],
      spoken: `"To keep bundles small with UI libraries, I rely on tree-shaking — importing only named components so the bundler drops the rest, which works because modern libraries ship ES modules and mark themselves side-effect free. I'm careful with icon packs and utility libraries, and I lazy-load heavy widgets like editors, charts and date pickers with React.lazy or next dynamic. I also remember runtime cost — runtime CSS-in-JS adds work during render, while Tailwind or CSS-module based libraries don't. And I measure: a bundle analyzer before and after, and bundlephobia before adding a dependency."`,
      mistakes: [
        'Importing the whole of lodash or moment for one function.',
        'Never measuring — guessing which library is heavy instead of opening a bundle analyzer.',
        'Building Tailwind class names dynamically, so they are missing (or force safelisting everything).',
        'Follow-up trap: "Does tree-shaking remove unused CSS?" Not automatically. JS tree-shaking removes JS exports; CSS needs its own approach (Tailwind\'s class detection, CSS Modules per component, or per-component CSS imports).',
      ],
      takeaway: 'Import only what you use, lazy-load heavy widgets, prefer zero-runtime styling, and always measure with a bundle analyzer.',
    },
    {
      id: 'ui-libraries-ssr-rsc',
      title: 'UI Libraries with SSR and React Server Components (Next.js)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Zero-runtime styling (Tailwind, CSS Modules, Mantine v7+) fits Server Components best; runtime CSS-in-JS (Emotion, styled-components) needs client components and SSR setup.',
      what: `In the Next.js **App Router**, components are **Server Components** by default: they render on the server and send no component JavaScript to the browser. Server Components cannot use state, effects or React context.

This matters for UI libraries:
- **Tailwind / CSS Modules** — just class names and static CSS. Work everywhere, including Server Components.
- **Mantine (v7+)** — styles are plain CSS. Interactive components still need \`'use client'\` (they use hooks/context), but there is no runtime CSS-in-JS to set up.
- **MUI / Chakra / styled-components (Emotion-based)** — styles are generated at runtime using React context, so components run as **client components**, and you need an integration so styles are collected during server rendering (otherwise you get a flash of unstyled content).

#### Deeper version
- **Why runtime CSS-in-JS struggles:** it needs React context (not available in Server Components) and must inject \`<style>\` tags during streaming SSR. Libraries solve this with a registry/cache provider using \`useServerInsertedHTML\`. MUI provides \`@mui/material-nextjs\` with \`AppRouterCacheProvider\`.
- **Providers pattern:** create a \`providers.tsx\` file with \`'use client'\` that wraps \`ThemeProvider\`/\`MantineProvider\`, and use it in the root \`layout.tsx\` (a Server Component). The children can still be Server Components — they are passed through as already-rendered content.
- **Push \`'use client'\` down the tree:** keep pages and layouts as Server Components that fetch data, and mark only interactive leaves (a form, a modal) as client components. This keeps shipped JavaScript small.
- **Hydration mismatches:** reading \`window\`, \`localStorage\` or media queries during render produces different server/client HTML. Use the libraries' SSR helpers (\`ColorSchemeScript\` in Mantine, CSS variables color schemes in MUI) and avoid client-only values during the first render.
- This area changes quickly (MUI's zero-runtime work, library updates). Check each library's current Next.js guide.`,
      why: `Many teams now build on Next.js App Router. Picking a library that fights Server Components leads to more client JavaScript, setup pain, and flashes of unstyled content. Interviewers ask this to see if you understand modern React rendering, not just components.`,
      analogy: `Server Components are like a printed restaurant menu delivered ready to read. Tailwind styles are already printed on it. Runtime CSS-in-JS is like a menu whose colours are painted by a waiter at your table — it needs a waiter (client JavaScript and context) present, and you may see a plain menu for a moment before the paint arrives.`,
      code: [
        {
          title: 'Client providers wrapper used by a server layout',
          lang: 'tsx',
          code: `// app/providers.tsx
'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'; // path depends on your Next.js version
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>          {/* collects Emotion styles during SSR */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

// app/layout.tsx  (Server Component - no 'use client')
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`,
        },
        {
          title: 'Keep pages on the server, make only leaves client',
          lang: 'tsx',
          code: `// app/orders/page.tsx  (Server Component: fetches data, ships no JS for itself)
import { OrderFilters } from './OrderFilters';

export default async function OrdersPage() {
  const res = await fetch('https://api.example.com/orders', { cache: 'no-store' });
  const orders: { id: string; total: number }[] = await res.json();

  return (
    <main className="mx-auto max-w-3xl p-6">          {/* Tailwind works on the server */}
      <h1 className="text-2xl font-bold">Orders</h1>
      <OrderFilters />                                  {/* interactive client leaf */}
      <ul className="mt-4 divide-y">
        {orders.map((o) => (
          <li key={o.id} className="py-2">#{o.id} — {o.total}</li>
        ))}
      </ul>
    </main>
  );
}

// app/orders/OrderFilters.tsx
'use client';
import { useState } from 'react';
export function OrderFilters() {
  const [status, setStatus] = useState('all');
  return (
    <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-4 rounded border p-2">
      <option value="all">All</option>
      <option value="paid">Paid</option>
    </select>
  );
}`,
        },
      ],
      output: `The root layout stays a Server Component, while the providers file is a client boundary that sets up MUI's theme and collects its runtime styles during server rendering, so the first HTML already includes the CSS and there is no unstyled flash.

On the orders page, the data fetch and the list are rendered on the server and styled with Tailwind classes — no JavaScript is shipped for them. Only \`OrderFilters\` is hydrated in the browser because it uses state.`,
      questions: [
        {
          q: 'Can you use MUI in React Server Components?',
          a: 'MUI components rely on runtime styling and context, so they run as client components. You wrap providers in a `\'use client\'` file and use MUI\'s Next.js integration for SSR styles.',
        },
        {
          q: 'Why do Tailwind and CSS Modules fit Server Components well?',
          a: 'They are just static CSS and class names, with no runtime or context, so they work in server and client components alike and add no JavaScript.',
        },
        {
          q: 'How do you use a context-based provider in the App Router?',
          a: 'Put it in a separate file marked `\'use client\'` and render it in the server `layout.tsx`, passing children through.',
        },
        {
          q: 'What causes a flash of unstyled content with CSS-in-JS and SSR?',
          a: 'Styles generated at runtime are not included in the server HTML. A style registry/cache provider collects them during SSR and inserts them into the HTML stream.',
        },
      ],
      spoken: `"In the Next.js App Router, components are server components by default, and they can't use context or state. That favours zero-runtime styling: Tailwind and CSS Modules work everywhere, and Mantine since v7 uses plain CSS too. Runtime CSS-in-JS libraries like MUI with Emotion need to run as client components, so I put the ThemeProvider in a providers file marked use client, render it from the server layout, and use MUI's Next.js cache provider so styles are collected during SSR. I keep pages and data fetching on the server and push use client down to the interactive leaves."`,
      mistakes: [
        'Marking the root layout or every page `\'use client\'` just to make a provider work, which ships far more JavaScript.',
        'Skipping the SSR style integration for Emotion-based libraries and getting a flash of unstyled content.',
        'Reading `localStorage` or `window.matchMedia` during render for theme selection, causing hydration mismatches.',
        'Follow-up trap: "If a client component renders server component children, do the children become client components?" No. Children passed as props are rendered on the server and passed through; only what is imported inside the client file becomes client code.',
      ],
      takeaway: 'Zero-runtime styling fits Server Components; runtime CSS-in-JS needs a client providers file plus an SSR style registry.',
    },
    {
      id: 'design-systems-tokens',
      title: 'Design Systems and Design Tokens',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'A design system is the shared set of rules, tokens and components for a product; tokens are named design values (colours, spacing, radius) used everywhere instead of raw values.',
      what: `A **design system** is everything a team shares to build a consistent UI:
- **Design tokens** — named values: \`color.primary\`, \`space.4\`, \`radius.md\`, \`font.size.lg\`.
- **Components** — Button, Input, Modal built from those tokens.
- **Guidelines** — when to use what, accessibility rules, writing tone.
- **Tooling** — Figma library, Storybook, documentation site.

**Design tokens** are the smallest pieces. Instead of writing \`#7c3aed\` in 50 files, you write \`var(--color-primary)\` or \`bg-primary\`. Change the token once, and the whole product updates.

#### Deeper version
Tokens are usually organised in **layers**:
1. **Primitive (global) tokens** — the raw palette and scales: \`purple-600 = #7c3aed\`, \`space-4 = 16px\`. No meaning yet.
2. **Semantic (alias) tokens** — meaning, pointing to primitives: \`color-primary = purple-600\`, \`color-danger = red-600\`, \`color-bg-surface = white\`. **Themes (light/dark, brands) swap at this layer.**
3. **Component tokens** (optional) — \`button-primary-bg = color-primary\`.

Components should use **semantic** tokens, never primitives directly. That is what makes dark mode and white-labelling cheap.

Pipeline: tokens are stored in a platform-neutral format (JSON; a W3C Design Tokens Community Group format exists), often synced from **Figma Variables**, then transformed by a tool such as **Style Dictionary** into CSS variables, a Tailwind theme, a MUI/Mantine theme object, iOS and Android files.

Every library has a token layer: Tailwind's theme (\`@theme\` in v4), MUI's \`createTheme\`, Mantine's \`createTheme\`. A custom design system often = tokens + a headless library + your styling (e.g. Radix + Tailwind), documented in **Storybook** with visual regression tests.`,
      why: `Without a design system, every team picks slightly different blues, paddings and button styles. The product looks inconsistent, designers and developers argue over pixels, and rebrands or dark mode take months. Tokens make consistency the default and change cheap.`,
      analogy: `Design tokens are like a company's official paint codes. Primitives are the paint tins ("Purple 600"). Semantic tokens are the rules ("doors are painted Primary"). If the company rebrands, they change which tin "Primary" points to, and every door in every office changes — nobody repaints each door by hand.`,
      code: [
        {
          title: 'Layered tokens as CSS variables',
          lang: 'css',
          code: `:root {
  /* 1. Primitives: raw values, no meaning */
  --purple-600: #7c3aed;
  --purple-200: #ddd6fe;
  --gray-50: #f9fafb;
  --gray-900: #111827;
  --red-600: #dc2626;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius-md: 8px;

  /* 2. Semantic: meaning, mapped to primitives (light theme) */
  --color-primary: var(--purple-600);
  --color-danger: var(--red-600);
  --color-bg: var(--gray-50);
  --color-text: var(--gray-900);
}

[data-theme="dark"] {
  /* Themes only remap SEMANTIC tokens */
  --color-primary: var(--purple-200);
  --color-bg: var(--gray-900);
  --color-text: var(--gray-50);
}

/* 3. Components use semantic tokens only */
.button-primary {
  background: var(--color-primary);
  color: var(--color-bg);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}`,
        },
        {
          title: 'One token source feeding Tailwind v4 and MUI',
          lang: 'tsx',
          code: `// tokens.ts - single source of truth (often generated from Figma / Style Dictionary)
export const tokens = {
  color: { primary: '#7c3aed', danger: '#dc2626', surface: '#ffffff' },
  radius: { md: 8 },
  font: { sans: 'Inter, sans-serif' },
} as const;

// MUI theme built from tokens
import { createTheme } from '@mui/material/styles';
export const muiTheme = createTheme({
  palette: { primary: { main: tokens.color.primary }, error: { main: tokens.color.danger } },
  shape: { borderRadius: tokens.radius.md },
  typography: { fontFamily: tokens.font.sans },
});

/* Tailwind v4: the same values exposed in CSS (generated by a build script)
@theme {
  --color-primary: #7c3aed;
  --color-danger: #dc2626;
  --radius-md: 8px;
  --font-sans: Inter, sans-serif;
}
*/`,
        },
      ],
      output: `In the CSS example, \`.button-primary\` never mentions a hex value. In light mode it is purple on a light background. Setting \`data-theme="dark"\` on \`<html>\` remaps only the semantic tokens, so the button becomes light purple and the page dark — no component CSS changes.

In the second example, one token file feeds the MUI theme (and, via a small build step, Tailwind's \`@theme\`). If the brand purple changes, you edit one value and every MUI component and Tailwind class updates.`,
      questions: [
        {
          q: 'What are design tokens?',
          a: 'Named, platform-neutral design values (colours, spacing, typography, radius, shadows) used instead of hard-coded values, so design decisions live in one place.',
        },
        {
          q: 'Primitive vs semantic tokens?',
          a: 'Primitives are raw values (`purple-600`). Semantic tokens give meaning (`color-primary`, `color-danger`) and point to primitives. Components use semantic tokens; themes swap the semantic mapping.',
        },
        {
          q: 'How would you build a design system for a React app?',
          a: 'Define tokens (ideally synced from Figma), output them as CSS variables/Tailwind theme, build accessible components on a headless library, document them in Storybook, and add visual regression and a11y tests.',
        },
        {
          q: 'How do tokens make dark mode or white-labelling easy?',
          a: 'You only remap semantic tokens per theme or brand. Components stay untouched because they only reference semantic names.',
        },
      ],
      spoken: `"A design system is the shared language of a product — tokens, components, guidelines and tooling like Figma and Storybook. Design tokens are named values like color-primary or space-4 that replace hard-coded values. I organise them in layers: primitives like purple-600, semantic tokens like color-primary or color-danger that point to primitives, and sometimes component tokens. Components only use semantic tokens, so dark mode or a rebrand is just remapping the semantic layer. Tokens can be synced from Figma and transformed with Style Dictionary into CSS variables, a Tailwind theme, or an MUI theme."`,
      mistakes: [
        'Using primitive tokens (`purple-600`) directly in components, so dark mode needs component changes.',
        'Naming tokens by looks instead of purpose (`--blue-button`), which breaks when the brand colour changes.',
        'Calling a component library a design system without tokens, guidelines or documentation.',
        'Follow-up trap: "Should every value be a token?" No. Tokenise repeated design decisions; one-off layout values (a specific max-width for one page) can stay local.',
      ],
      takeaway: 'Tokens are named design decisions in layers (primitive → semantic → component); components use semantic tokens so themes are just remaps.',
    },
    {
      id: 'choosing-ui-library',
      title: 'Choosing a UI Library: Tailwind vs Mantine vs MUI',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Pick by project needs: MUI for Material-style admin apps, Mantine for fast full-featured SaaS dashboards, Tailwind (+ headless/shadcn) for custom brand designs.',
      what: `There is no single best library. You choose by **project needs**:

**Tailwind CSS (+ headless components / shadcn/ui)**
- Best for: custom brand designs, marketing sites, products where the design is unique.
- Pros: full design control, zero runtime, small CSS, great with Next.js Server Components.
- Cons: you build (or copy) components yourself; complex widgets need a headless library.

**Mantine**
- Best for: SaaS dashboards and internal tools that need many components fast (forms, dates, notifications, modals, charts).
- Pros: huge component and hooks set, modern look, plain CSS since v7 (no runtime CSS-in-JS), good TypeScript.
- Cons: smaller ecosystem than MUI; heavily custom designs still need styling work.

**Material UI (MUI)**
- Best for: enterprise and admin apps, especially if the design follows Material Design; teams that want a mature, very widely used library. MUI X adds advanced Data Grid and Date Pickers (some advanced features are paid).
- Pros: mature, huge community, strong accessibility, powerful theming.
- Cons: Material look is recognisable and harder to fully rebrand; runtime CSS-in-JS (Emotion) by default adds runtime cost and needs client components in the App Router.

#### Deeper version
Questions to ask before choosing:
1. **Design:** Is there a custom design in Figma (→ Tailwind/headless) or is "clean and standard" fine (→ Mantine/MUI)?
2. **Component needs:** Data grids, date ranges, rich forms? (→ MUI X, Mantine dates, or dedicated libraries like TanStack Table / AG Grid.)
3. **Rendering:** Next.js App Router with mostly Server Components? Zero-runtime options are simpler.
4. **Team:** What does the team already know? Hiring market? A familiar library often beats a "better" unfamiliar one.
5. **Accessibility and i18n:** RTL support, screen-reader quality (React Aria and Radix are strong here).
6. **Long-term cost:** licence (MUI X Pro/Premium), upgrade history and breaking changes, bundle size, how much you will fight overrides.

**Combining is fine:** Tailwind for layout + a headless library for widgets is very common. Mixing two big **styled** libraries (MUI + Mantine) in one app is usually a mistake: two themes, two styling engines, inconsistent look, bigger bundle.`,
      why: `This is one of the most common frontend interview questions for full stack engineers: "Which UI library would you use and why?" A good answer shows trade-off thinking, not brand loyalty, and connects the choice to design, performance, team and product needs.`,
      analogy: `Choosing a UI library is like choosing a house. **MUI** is a large, well-known apartment complex: reliable, full of facilities, but every apartment looks similar. **Mantine** is a modern furnished apartment with every appliance included. **Tailwind + headless** is building your own house with high-quality prefab parts: it looks exactly how you want, but you assemble more yourself.`,
      code: [
        {
          title: 'The same button in each approach',
          lang: 'tsx',
          code: `// MUI: Material look, themed via createTheme
import { Button as MuiButton } from '@mui/material';
export const SaveMui = () => <MuiButton variant="contained">Save</MuiButton>;

// Mantine: modern look, themed via createTheme + MantineProvider
import { Button as MantineButton } from '@mantine/core';
export const SaveMantine = () => <MantineButton>Save</MantineButton>;

// Tailwind: you own every visual decision
export const SaveTw = () => (
  <button
    type="button"
    className="rounded-md bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700
               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
  >
    Save
  </button>
);`,
        },
        {
          title: 'A quick decision guide',
          lang: 'text',
          code: `Need a unique brand design (marketing site, consumer product)?
  -> Tailwind + headless (Radix / React Aria) or shadcn/ui

Building an admin panel / internal tool quickly, Material look is OK?
  -> MUI (+ MUI X Data Grid / Date Pickers if needed)

Building a SaaS dashboard fast, want many components + hooks + forms, modern look?
  -> Mantine

Next.js App Router, mostly Server Components, performance critical?
  -> Prefer zero-runtime styling: Tailwind / CSS Modules / Mantine v7+

Big existing codebase already on one library?
  -> Stay with it unless there is a strong reason; migrations are expensive.

Avoid: two big styled libraries in one app.`,
        },
      ],
      output: `All three render a "Save" button, but the trade-off is visible: MUI and Mantine give a finished, accessible button in one line with their own design language and theming system. The Tailwind version needs more classes, but every pixel matches your design exactly and there is no library runtime.

The decision guide turns the choice into questions about design, product type, rendering model and team, which is exactly how to answer this question in an interview.`,
      questions: [
        {
          q: 'Which UI library would you choose for a new project and why?',
          a: 'It depends. For a custom-designed Next.js product I would use Tailwind with a headless library or shadcn/ui. For a fast admin tool, MUI or Mantine. I decide based on design needs, components required, rendering model, team experience and long-term cost.',
        },
        {
          q: 'What are the downsides of MUI?',
          a: 'The Material look is hard to fully rebrand, runtime CSS-in-JS adds cost and needs client components in the App Router, and some advanced MUI X features are paid.',
        },
        {
          q: 'Why might you choose Mantine over MUI?',
          a: 'A modern non-Material look, a very rich set of components and hooks, built-in forms and dates, and plain CSS styling (since v7) with no runtime CSS-in-JS.',
        },
        {
          q: 'Can you use Tailwind together with MUI or Mantine?',
          a: 'Yes, for layout and small tweaks, but you need to manage CSS ordering/specificity between them and keep one source of design tokens. Mixing two big styled libraries is usually not recommended.',
        },
      ],
      spoken: `"I don't think there's one best library — I choose based on the project. If there's a custom brand design, especially on Next.js with server components, I go with Tailwind plus a headless library like Radix, often through shadcn/ui, because I get full control and zero runtime. For an internal admin tool where speed matters and a Material look is fine, MUI is mature and has the Data Grid. For a SaaS dashboard where I want lots of components, hooks and forms with a modern look, Mantine is great. I also weigh team experience, accessibility, licensing and bundle size, and I avoid mixing two styled libraries."`,
      mistakes: [
        'Answering with personal preference only ("I like Tailwind") without trade-offs.',
        'Choosing MUI for a highly custom design and then fighting the Material styles everywhere.',
        'Mixing MUI and Mantine (or Chakra) in one app, doubling themes, styling engines and bundle size.',
        'Ignoring licence costs of advanced components (e.g. some MUI X Data Grid features are paid).',
        'Follow-up trap: "Is Tailwind a component library?" No. It is a styling framework. Pair it with headless components or shadcn/ui for behaviour like modals and menus.',
      ],
      takeaway: 'Custom design → Tailwind + headless; fast admin → MUI; feature-rich modern dashboard → Mantine — and justify it with design, rendering, team and cost.',
    },
  ],
  rapidFire: [
    { q: 'What does utility-first mean?', a: 'Styling by composing small single-purpose classes in markup instead of custom CSS classes.' },
    { q: 'How does Tailwind keep CSS small?', a: 'It scans source files and generates only the classes you actually use.' },
    { q: 'What does md:flex mean?', a: 'Apply flex from the md breakpoint (768px) and up — Tailwind is mobile-first.' },
    { q: 'Why does a dynamically built Tailwind class not work?', a: 'Tailwind only finds complete class names in source text; use a map of full class names.' },
    { q: 'Where is Tailwind configured in v3 vs v4?', a: 'v3: `tailwind.config.js`; v4: in CSS with `@import "tailwindcss"` and `@theme`.' },
    { q: 'theme vs theme.extend in Tailwind v3?', a: '`extend` adds to the defaults; plain `theme` keys replace them.' },
    { q: 'Default Tailwind dark mode strategy?', a: 'Follows `prefers-color-scheme`; switch to a class strategy for a manual toggle.' },
    { q: 'How to enable a class-based dark mode in v4?', a: '`@custom-variant dark (&:where(.dark, .dark *));` in your CSS.' },
    { q: 'What does tailwind-merge do?', a: 'Removes conflicting Tailwind classes so the last one wins (`px-2 px-4` → `px-4`).' },
    { q: 'What is the cn() helper?', a: '`twMerge(clsx(inputs))` — conditional classes plus conflict resolution.' },
    { q: 'When is @apply appropriate?', a: 'For HTML you cannot add classes to (CMS/markdown content); otherwise extract components.' },
    { q: 'What is cva?', a: 'class-variance-authority: defines variant/size class maps for components in a typed way.' },
    { q: 'Headless vs styled library?', a: 'Headless gives behaviour and accessibility without styles; styled gives a finished design.' },
    { q: 'Name three headless libraries.', a: 'Radix UI, Headless UI, React Aria (also Ark UI, TanStack Table).' },
    { q: 'What is shadcn/ui?', a: 'Components copied into your repo via a CLI, built on headless primitives and Tailwind.' },
    { q: 'How did Mantine v7 change styling?', a: 'Dropped Emotion; uses plain CSS / CSS Modules with CSS variables.' },
    { q: 'What must you import for Mantine v7+ to look right?', a: '`@mantine/core/styles.css`.' },
    { q: 'How many shades does a custom Mantine colour need?', a: 'Ten (index 0 lightest to 9 darkest).' },
    { q: 'Mantine form field wiring?', a: '`{...form.getInputProps(\'email\')}` with `useForm({ initialValues, validate })`.' },
    { q: 'Mantine hook for open/close state?', a: '`useDisclosure`.' },
    { q: 'How do you theme MUI?', a: '`createTheme` + `ThemeProvider` (+ `CssBaseline`).' },
    { q: 'MUI default breakpoints?', a: 'xs 0, sm 600, md 900, lg 1200, xl 1536.' },
    { q: 'What is theme.spacing(2) in MUI by default?', a: '16px (8px base unit).' },
    { q: 'sx vs styled vs theme overrides?', a: 'sx for one element, styled() for reusable components, theme components for app-wide defaults.' },
    { q: 'What do defaultProps and styleOverrides do in an MUI theme?', a: 'Set default prop values and override slot styles for every instance of a component.' },
    { q: 'How to add a typed custom palette colour in MUI?', a: 'Module augmentation of `@mui/material/styles` Palette/PaletteOptions.' },
    { q: 'MUI default styling engine?', a: 'Emotion (runtime CSS-in-JS).' },
    { q: 'Do UI libraries make your app accessible automatically?', a: 'Partly — you still own labels, alt text, contrast, aria-label on icon buttons and correct elements.' },
    { q: 'How do you render a link styled as a button?', a: 'Polymorphic prop: `component={Link}` (MUI/Mantine) or `asChild` (Radix).' },
    { q: 'register vs Controller in React Hook Form?', a: '`register` for ref-forwarding inputs; `Controller` for controlled components like MUI Select.' },
    { q: 'What is tree-shaking?', a: 'The bundler removing unused ES module exports from the final bundle.' },
    { q: 'How to load a heavy chart or editor cheaply?', a: 'Lazy-load it with `React.lazy` or `next/dynamic`.' },
    { q: 'Tools to inspect bundle size?', a: '`@next/bundle-analyzer`, `rollup-plugin-visualizer`, `source-map-explorer`, bundlephobia.' },
    { q: 'Which styling approaches fit Server Components best?', a: 'Zero-runtime ones: Tailwind, CSS Modules, Mantine v7+ CSS.' },
    { q: 'How to use a context provider in the App Router?', a: 'Put it in a `\'use client\'` providers file and render it from the server layout.' },
    { q: 'What are design tokens?', a: 'Named design values (colour, spacing, radius) used instead of hard-coded values.' },
    { q: 'Primitive vs semantic tokens?', a: 'Primitives are raw values; semantic tokens give meaning and point to primitives.' },
    { q: 'Which token layer do themes swap?', a: 'The semantic layer.' },
    { q: 'Tool to transform tokens to many platforms?', a: 'Style Dictionary (often fed from Figma Variables).' },
    { q: 'Should you mix MUI and Mantine in one app?', a: 'Usually no — two themes, two styling engines, inconsistent UI and a bigger bundle.' },
  ],
};
