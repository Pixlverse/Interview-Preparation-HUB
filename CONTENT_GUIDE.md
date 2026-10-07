# Content Guide — how to write a stack file

Every stack lives in **one file**: `src/data/<stack-id>.js`. The app picks it up automatically
(see `src/data/index.js`; `STACK_ORDER` there controls the sidebar order).
Look at `src/data/javascript.js` (topics `var-let-const`, `closures`) as the gold-standard example.

## 1. File shape

```js
export default {
  id: 'nodejs',                 // must equal the file name without .js
  title: 'Node.js',
  icon: '🟩',                    // one emoji
  description: 'One or two plain sentences about what this stack covers.',
  definitionTitle: 'What is Node.js?',   // heading of the definition box on the stack page
  definition: `Simple definition of the technology itself (2-3 short paragraphs, jargon explained).

**One-line answer:** "An interview-ready one-sentence definition."`,
  topics: [ /* topic objects, ordered basic -> intermediate -> advanced */ ],
  rapidFire: [ { q: 'One-line question?', a: 'One-line answer.' }, /* 30-60 items */ ],
};
```

## 2. Topic shape (every field is required)

```js
{
  id: 'event-loop',                    // kebab-case, unique inside the file
  title: 'The Event Loop',
  level: 'basic' | 'intermediate' | 'advanced',
  priority: 'must' | 'good' | 'rare',              // shown as Must know / Good to know / Rare
  frequency: 'very common' | 'common' | 'occasional', // how often interviewers ask it
  summary: 'ONE line. Shown on cards and on the front of flip cards.',
  what: `1. What is it? 2-3 very simple sentences. Explain every jargon word.
Then a "#### Deeper version" heading with the more advanced explanation.`,
  why: `2. Why do we use it? The problem it solves.`,
  analogy: `3. A real-life analogy.`,
  code: [                               // 4. Practical example(s): 1-3 short, commented, runnable blocks
    { title: 'Short title', lang: 'javascript', code: `...` },
  ],
  output: `5. What happens / output, in plain words. Walk through the example.`,
  questions: [                          // 6. 3-5 common interview questions
    { q: 'Question?', a: 'Short, simple answer (1-4 sentences, may include `code`).' },
  ],
  spoken: `7. A 30-second answer to say out loud (about 70-110 words, first person, natural speech, in quotes).`,
  mistakes: [                           // 8. 3-5 common mistakes AND follow-up traps
    'Mistake or trap, explained in one or two sentences.',
    'Follow-up trap: "Question the interviewer may ask next?" Short answer.',
  ],
  takeaway: '9. Key takeaway — ONE line.',
}
```

Optional: `tags: ['extra', 'search', 'words']`.

## 3. Text formatting (for what / why / analogy / output / answers / spoken / mistakes)

A tiny Markdown subset is supported:

- Blank line = new paragraph
- Lines starting with `- ` = bullet list; `1. ` = numbered list
- `#### Heading` = small heading (use `#### Deeper version` for the layered explanation)
- `**bold**` and `` `inline code` ``
- Fenced code blocks with a language: ```` ```js ```` ... ```` ``` ```` (use sparingly inside text; prefer the `code` field)

Supported `lang` values for code: `javascript`, `jsx`, `typescript`, `tsx`, `json`, `bash`, `css`, `scss`,
`html`, `sql`, `yaml`, `dockerfile`, `nginx`, `python`, `graphql`, `ini`, `text` (for templates/plain text).

## 4. ⚠️ Escaping rules (the #1 source of broken files)

Text and code are written in JavaScript **template literals** (backticks). Inside a template literal:

| You want to show | Write it as |
| --- | --- |
| a backtick `` ` `` | `` \` `` |
| `${name}` (a template in the example code) | `\${name}` |
| a backslash `\` (e.g. regex `\d`, `\n` in a string) | `\\` (so `\\d`, `\\n`) |

If a string has no backticks, `${` or backslashes, a normal `'single-quoted'` string is fine too
(then escape `'` as `\'`).

After every batch of topics run:

```bash
node scripts/validate-data.mjs <stack-id>
```

It imports the file (catches syntax errors) and checks every required field. Fix all errors (✗).

## 5. Writing rules

1. **Simple English.** Short sentences. Explain every jargon word the first time it appears.
2. **Layers:** simple version first, then `#### Deeper version` for the advanced detail.
3. **Code:** short, correct, commented, runnable. Prefer modern syntax (ES modules, async/await).
4. **Interview-ready:** questions are ones real interviewers ask; answers are short and confident.
5. **No placeholders.** No TODO / TBD / "coming soon". Every topic fully written.
6. **Version honesty:** for version-specific details (React 19, Next.js caching, Node 18 changes, library APIs)
   only state what you are confident about. If unsure, say so plainly in the topic
   (e.g. "Check the current docs — this default changed between versions").
7. **Order:** basic → intermediate → advanced inside the `topics` array.
8. **Completeness audit:** after finishing a stack, list common interview topics for that stack that are still
   missing, and write them too.

## 6. Adding a new topic (quick version)

1. Open `src/data/<stack>.js`.
2. Copy an existing topic object, paste it in the right level position, change `id` and all the text.
3. Run `npm run validate`. The dev server hot-reloads automatically.

## 7. Adding a new stack

1. Create `src/data/<new-id>.js` with the shape above.
2. Add `'<new-id>'` to `STACK_ORDER` in `src/data/index.js` (otherwise it appears at the end).

---

# Interview problems — `src/data/problems/<stack-id>.js`

Each stack can have a list of **practice problems**: real tasks an interviewer gives
("implement debounce", "what does this print?", "fix this re-render bug", "write this aggregation",
"how would you handle a duplicate webhook?"). They appear on the stack's **🧩 Interview Problems** page
and on the global **Practice Problems** page. See `src/data/problems/javascript.js` for the gold-standard example.

## File shape

```js
export default {
  stackId: 'nodejs',          // must equal the file name AND an existing src/data/<stackId>.js
  problems: [ /* problem objects, ordered easy -> medium -> hard */ ],
};
```

## Problem shape

```js
{
  id: 'stream-large-file',               // kebab-case, unique in the file
  title: 'Serve a 2 GB file without running out of memory',
  difficulty: 'easy' | 'medium' | 'hard',
  type: 'coding' | 'output' | 'debug' | 'query' | 'scenario' | 'design',
  //  coding   = write code (function, component, endpoint, middleware…)
  //  output   = predict what code prints
  //  debug    = find and fix the bug in given code
  //  query    = write a DB query / aggregation / SQL
  //  scenario = "what would you do if…" production / practical situation
  //  design   = small design task (API, schema, component architecture, system piece)
  frequency: 'very common' | 'common' | 'occasional',
  relatedTopic: 'streams',                // optional: a topic id from src/data/<stackId>.js
  question: `The problem exactly as an interviewer would state it. Include starter code / sample
input and expected output in fenced code blocks where useful.`,
  hints: ['Hint 1 (gentle nudge)', 'Hint 2 (more direct)', 'Hint 3 (almost the answer)'], // 1-3
  solution: `**Idea:** the approach in one or two plain sentences.

\`\`\`javascript
// full, correct, commented solution
\`\`\`

**Why it works:** short explanation. **Complexity** (when it matters). Mention edge cases.`,
  followUps: [{ q: 'Follow-up the interviewer may ask?', a: 'Short answer.' }],  // 1-3
}
```

The same text formatting and **escaping rules** as topics apply (section 3 and 4 above).

Check problem files with:

```bash
node scripts/validate-problems.mjs <stack-id>     # or: npm run validate  (topics + problems)
```
