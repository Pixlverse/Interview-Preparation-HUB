# 📘 Interview Prep Guide

A personal, offline study guide for MERN / full-stack interviews. Every topic is explained in simple English,
from basic to advanced, with small practical examples. Topics in every stack follow the same 9-part structure:

1. What is it? · 2. Why do we use it? · 3. Real-life analogy · 4. Practical example · 5. What happens / output ·
6. Common interview questions · 7. 30-second spoken answer · 8. Common mistakes & follow-up traps · 9. Key takeaway

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run validate` | Check every content file for missing fields and syntax errors |

No backend and no external APIs. Your progress (learned topics, bookmarks, theme) is saved in your browser's
`localStorage`, so it stays on this browser only.

## Deploy for free

It's a static site (no backend), so any free static host works. `npm run build` produces the `dist/` folder.

**Vercel** (`vercel.json` is included so page links and refreshes work):

```bash
npx vercel          # first time: log in, accept the detected Vite settings
npx vercel --prod   # publish to your production URL
```

Or push the folder to GitHub and import the repo at vercel.com → New Project (framework: Vite).

**Netlify / Cloudflare Pages**: build command `npm run build`, output folder `dist`.
`public/_redirects` is included so page links and refreshes work.

Notes:
- Progress, bookmarks and solved problems are saved in each browser's localStorage, so they don't sync between devices.
- The site includes your resume answers and HR notes (salary, "why I left"). Anyone with the URL can read them, so keep the link private.

## Features

- **Stack definition**: every stack page opens with a "What is …?" box — a simple definition plus a one-line interview answer.
- **Interview problems**: every stack has a 🧩 problems page with real interview tasks (coding, predict-the-output, find-the-bug, queries, scenarios, small designs). Hints open one at a time, then the full solution and follow-up questions. Mark problems solved; a global **Practice Problems** page lets you filter across all stacks.
- **Sidebar** with every stack and a progress bar for each. Click a stack to expand its topics (basic → intermediate → advanced, with a coloured level dot).
- **Topic page**: one topic at a time, with level badge, priority tag (Must know / Good to know / Rare), how often it is asked, and Previous / Next buttons (or use the ← → keys).
- **Mark as learned** checkbox with progress per stack and overall (Dashboard).
- **Bookmarks** (☆ "Revise later") and a Bookmarks page.
- **Filters** by level, priority and learned / not learned (stack pages, Bookmarks, Quick Revise).
- **Global search** across all stacks (press `/` to focus it).
- **Quick Revise**: flip cards. Front = one-line summary, back = the 30-second interview answer. Shuffle supported.
- **Rapid Fire**: one-line Q&A for a whole stack for last-minute revision.
- **Dark / light mode**, mobile friendly, syntax-highlighted code blocks with a Copy button.

## Project structure

```
src/
  data/               ← ALL content lives here, one file per stack
    index.js          ← registry: loads every stack file, sets sidebar order (STACK_ORDER)
    javascript.js, react.js, nodejs.js, …
    problems/         ← interview problems, one file per stack (problems/<stack-id>.js)
  components/         ← Sidebar, TopicCard, CodeBlock, ProgressBar, FlipCard, SearchBar, RichText, …
  pages/              ← Home, Stack, Topic, Bookmarks, QuickRevise, RapidFire, Search
  context/StudyContext.jsx  ← learned / bookmarks / theme (saved to localStorage)
  lib/                ← search, filters, storage helpers
scripts/validate-data.mjs   ← content checker
CONTENT_GUIDE.md      ← full format reference for writing topics
PROGRESS.md           ← which stacks are finished
```

## How to add a new topic

1. Open the stack file, e.g. `src/data/react.js`.
2. Copy an existing topic object inside `topics: [ … ]` and paste it where it belongs
   (keep the order basic → intermediate → advanced).
3. Change the fields:

```js
{
  id: 'my-new-topic',            // unique, kebab-case (used in the URL)
  title: 'My New Topic',
  level: 'intermediate',         // basic | intermediate | advanced
  priority: 'must',              // must | good | rare
  frequency: 'common',           // very common | common | occasional
  summary: 'One line shown on cards and flip cards.',
  what: `Simple explanation.

#### Deeper version
The advanced detail.`,
  why: `The problem it solves.`,
  analogy: `A real-life comparison.`,
  code: [{ title: 'Example', lang: 'javascript', code: `console.log('hi');` }],
  output: `What happens when the code runs.`,
  questions: [{ q: 'Question?', a: 'Short answer.' }],   // 3-5
  spoken: `"A 30-second answer to say out loud."`,
  mistakes: ['A common mistake.', 'Follow-up trap: "…?" Answer.'],
  takeaway: 'One-line key takeaway.',
}
```

4. Run `npm run validate` to check it. The dev server reloads automatically.

**Escaping tip:** text is written inside backtick strings. Inside them write `` \` `` for a backtick,
`\${` for a literal `${`, and `\\` for a backslash. See `CONTENT_GUIDE.md` for the full rules and formatting
(bullets, **bold**, `inline code`, fenced code blocks).

You can also add quick one-liners to a stack's `rapidFire: [{ q, a }]` list.

## How to add an interview problem

Open `src/data/problems/<stack-id>.js` and add an object to `problems: [ … ]`:

```js
{
  id: 'my-problem',
  title: 'Short title',
  difficulty: 'medium',            // easy | medium | hard
  type: 'coding',                  // coding | output | debug | query | scenario | design
  frequency: 'common',             // very common | common | occasional
  relatedTopic: 'closures',        // optional topic id in the same stack
  question: `The problem statement (code blocks allowed).`,
  hints: ['First nudge', 'Bigger nudge'],
  solution: `Explanation plus a fenced code block.`,
  followUps: [{ q: 'Follow-up?', a: 'Answer.' }],
}
```

Then run `npm run validate`. Full format: "Interview problems" section in `CONTENT_GUIDE.md`.

## How to add a new stack

1. Create `src/data/<new-id>.js`:

```js
export default {
  id: '<new-id>',            // must equal the file name
  title: 'My Stack',
  icon: '📦',
  description: 'What this stack covers.',
  definitionTitle: 'What is My Stack?',   // shown as a box at the top of the stack page
  definition: `Simple definition…

**One-line answer:** "…"`,
  topics: [ /* … */ ],
  rapidFire: [ /* … */ ],
};
```

2. Add `'<new-id>'` to `STACK_ORDER` in `src/data/index.js` to choose its place in the sidebar.

## Notes on accuracy

Some topics depend on library versions (React 19, Next.js caching defaults, Node 18 changes, Stripe/LLM SDKs).
Where the details change between versions, the topic says so — always double-check against the current
official docs before quoting an exact default in an interview.
