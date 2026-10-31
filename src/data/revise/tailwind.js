// Revise MERN: Tailwind CSS. 10 likely interview questions with short spoken-style answers.
export default {
  id: 'tailwind',
  icon: '🌬️',
  title: 'Tailwind CSS',
  note: 'Utility-first styling, how Tailwind builds its CSS, variants, dark mode, theming (v4 and v3) and keeping class lists tidy.',
  items: [
    {
      q: 'What is Tailwind CSS, and what does "utility-first" mean?',
      a: `**Tailwind** is a CSS framework of small, single-purpose classes like \`flex\`, \`p-4\`, \`text-lg\` and \`bg-indigo-600\`. You style elements by combining these classes directly in the markup, instead of writing your own CSS classes in a separate file.

"Utility-first" means utilities are the main way to style, not an afterthought. The classes come from one design scale (spacing, colours, font sizes), so the UI stays consistent, and you rarely leave the component file.`,
    },
    {
      q: 'What are the pros and cons of Tailwind?',
      a: `**Pros:** very fast to build with, a consistent design system out of the box, no naming of classes, no unused or dead CSS piling up, styles live next to the markup so changes are safe, and the final CSS is small.

**Cons:** long class lists can make markup hard to read, there is a learning curve for the class names, and repeated patterns need to be pulled into components. Some people dislike mixing styles into HTML. In a React app the component model solves most of the repetition problem.`,
    },
    {
      q: 'Tailwind vs CSS Modules vs CSS-in-JS vs a component library: how do you choose?',
      a: `**Tailwind** is utility classes: fast and consistent. **CSS Modules** are normal CSS files with class names scoped to one component, which suits teams who like plain CSS. **CSS-in-JS** (styled-components, Emotion) writes styles in JavaScript with props, but adds a runtime cost and works poorly with React Server Components.

A **component library** like **Mantine** (which I used on SkillKeepr) gives ready, accessible components with theming. I pick based on the team and project, and keep one main approach per codebase.`,
    },
    {
      q: 'How does Tailwind keep the final CSS file small?',
      a: `Tailwind **scans your source files** for class names and generates CSS **only for the classes you actually use**. So even though thousands of utilities are possible, the production CSS usually stays small.

In Tailwind v4 this detection is automatic, and the engine (called Oxide) is much faster. In v3 you listed the files to scan in the \`content\` option of \`tailwind.config.js\`. Combined with minification and compression, the CSS for a whole app is often only a few kilobytes.`,
    },
    {
      q: 'Why does a dynamic class like bg-${color}-500 not work in Tailwind?',
      a: `Because Tailwind finds classes by **reading your source code as plain text** at build time. It never runs your JavaScript, so it can't know that \`bg-\${color}-500\` becomes \`bg-red-500\`. That class is never generated, and the style silently doesn't apply.

The fix is to always write **complete class names**, for example a map: \`const colors = { red: 'bg-red-500', green: 'bg-green-500' }\` and then \`colors[color]\`. For truly dynamic values like a user-chosen colour, use an inline style or a CSS variable.`,
    },
    {
      q: 'How do responsive design and hover/focus states work in Tailwind?',
      a: `With **variants** as prefixes. Responsive prefixes are **mobile-first**: \`text-sm md:text-base lg:text-lg\` means small by default, larger from the \`md\` breakpoint up. State prefixes work the same way: \`hover:bg-indigo-700\`, \`focus-visible:ring-2\`, \`disabled:opacity-50\`.

They can be combined, like \`md:hover:underline\`. \`group-hover:\` styles a child when its parent is hovered, and \`peer-checked:\` styles an element based on a sibling's state, for example a custom checkbox.`,
    },
    {
      q: 'How do you add dark mode with Tailwind?',
      a: `Use the **\`dark:\`** variant: \`bg-white dark:bg-slate-900 text-slate-900 dark:text-white\`. By default it follows the operating system setting (\`prefers-color-scheme\`).

For a manual toggle, switch to a **class strategy**: dark styles apply when a \`dark\` class is on the \`<html>\` element. In v4 you set this with \`@custom-variant dark\`, and in v3 with \`darkMode: 'class'\` in the config. The toggle adds or removes the class and saves the choice, usually in localStorage.`,
    },
    {
      q: 'How do you customise the Tailwind theme, like brand colours and fonts?',
      a: `In **Tailwind v4** the configuration is **CSS-first**: inside an \`@theme\` block you define variables like \`--color-brand: #59aa99;\` or \`--font-heading: "Fraunces", serif;\`, and classes like \`bg-brand\` and \`font-heading\` are created automatically. They are also real CSS variables you can use anywhere.

In **v3** you extended \`theme.extend\` in \`tailwind.config.js\`. Either way, putting the brand tokens in the theme keeps every screen on the same palette instead of hard-coded hex values.`,
    },
    {
      q: 'What are arbitrary values in Tailwind, and when should you avoid them?',
      a: `**Arbitrary values** let you use a one-off value in square brackets when the scale doesn't have it: \`w-[37px]\`, \`top-[117px]\`, \`bg-[#1d393c]\`, \`grid-cols-[200px_1fr]\`. They are handy for pixel-exact layouts or rare cases.

Overusing them defeats the point of Tailwind, because you lose the consistent design scale. If the same value appears more than once or twice, add it to the **theme** as a token instead.`,
    },
    {
      q: 'How do you handle long or repeated class lists in Tailwind?',
      a: `The main answer is **components**: if a button style repeats, make a \`<Button>\` component, so the classes live in one place. For conditional classes, use helpers like \`clsx\`, and **tailwind-merge** to resolve conflicts like \`p-2\` vs \`p-4\` when a parent passes extra classes. **cva** (class-variance-authority) manages variants like size and colour neatly.

\`@apply\` can bundle utilities into a CSS class, but it is best used sparingly, for example for styling third-party HTML you don't control.`,
    },
  ],
};
