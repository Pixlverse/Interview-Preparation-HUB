// Revise MERN: Claude & AI-assisted development. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'claude',
  icon: '✳️',
  title: 'Claude Code & AI Workflow',
  note: 'How you use Claude day to day: planning, CLAUDE.md, skills, subagents, MCP, hooks, and keeping the output trustworthy.',
  items: [
    {
      q: 'How do you use AI tools like Claude in your daily development?',
      a: `I use **Claude Code** in the terminal as a pair programmer. It reads the codebase, plans a change, edits files and runs commands like tests and the type checker. I use it most for exploring unfamiliar code, scaffolding features, writing tests, debugging from logs, and repetitive refactors.

I stay the owner of the code: I give clear context, review every diff, and run the tests myself before anything is committed. It makes me faster, but the decisions and the responsibility stay with me.`,
    },
    {
      q: 'How do you plan a new project with Claude before writing any code?',
      a: `I start in **plan mode** and describe the goal, the users, the stack and the constraints. I ask Claude to ask me clarifying questions and to propose the data model, the API endpoints, the folder structure and a step-by-step build order. I edit that plan until I agree with it, and save it as a markdown spec in the repo.

Then we build **one small step at a time**: scaffold, then the data models, then one feature end to end with tests, checking each step before the next. Planning first avoids the AI confidently building the wrong thing.`,
    },
    {
      q: 'What is plan mode?',
      a: `**Plan mode** is a read-only mode in Claude Code. Claude can read files and research, but it cannot edit files or run changing commands. It explores the code and comes back with a plan, which I approve or correct before any change is made.

I switch to it with **Shift+Tab**. I use it for anything bigger than a small fix: a new feature, a refactor across many files, or a bug where I am not yet sure of the cause.`,
    },
    {
      q: 'What is CLAUDE.md and what do you put in it?',
      a: `**CLAUDE.md** is a markdown file that Claude Code loads automatically at the start of every session. It is the project's standing instructions. Running \`/init\` creates a first version from the codebase.

I keep it short and useful: how to build, test and lint, the folder structure, coding conventions, things to never do (like committing \`.env\` files or editing generated code) and important design decisions. There is one per project in the repo root, which the team shares through git, and a personal one in \`~/.claude/CLAUDE.md\` for my own preferences.`,
    },
    {
      q: 'What is a skill in Claude Code, and how do you add one?',
      a: `A **skill** is a reusable set of instructions for a specific kind of task, like "how we write a migration" or "our release checklist". It is a folder with a **SKILL.md** file, which has a short YAML header (a \`name\` and a \`description\`) and then the instructions, plus optional scripts or templates.

I put project skills in \`.claude/skills/<name>/SKILL.md\` (shared through git) or personal ones in \`~/.claude/skills/\`. Claude only sees the descriptions at first, and loads the full skill when a task matches, or when I call it with \`/name\`. So the description must clearly say **when** to use it.`,
    },
    {
      q: 'What is the difference between CLAUDE.md, a skill and a subagent?',
      a: `**CLAUDE.md** is always loaded: short rules that apply to every task. A **skill** is loaded only when needed: detailed instructions for one type of task, so it doesn't fill the context all the time.

A **subagent** is a separate helper with its **own context window**, its own instructions and optionally limited tools. It does a side job, like searching the codebase or reviewing a diff, and returns only a summary, which keeps my main session clean.`,
    },
    {
      q: 'What are subagents and when would you use them?',
      a: `A **subagent** is a separate Claude instance that the main session hands a task to. It works in its own context and reports back a short result. Custom ones are markdown files in \`.claude/agents/\`, with a description, a system prompt and the allowed tools.

I use them for work that would flood the main conversation (searching many files, reading long logs), for **parallel** independent tasks, and for a fresh review that isn't biased by the main session's reasoning. I don't use them for small tasks, because each one costs extra tokens.`,
    },
    {
      q: 'What is MCP (Model Context Protocol)?',
      a: `**MCP** is an open standard for connecting AI tools to outside systems. An **MCP server** exposes tools and data, for example GitHub, a database, Jira, Figma or a browser, and Claude can call them during a session.

In Claude Code I add one with \`claude mcp add\` or a \`.mcp.json\` file in the project. Then I can say "read the Jira ticket and fix it" or "check the latest rows in the staging database". I only connect servers I trust, with the least access they need, because the AI can act through them.`,
    },
    {
      q: 'What are hooks in Claude Code?',
      a: `**Hooks** are shell commands that run automatically at certain moments, for example before a tool runs, after a file is edited, or when Claude finishes. They are set in \`settings.json\`.

They are useful because they always run, unlike instructions the model might forget. Examples: run Prettier and ESLint after every edit, block commands like \`rm -rf\` or edits to \`.env\` files, or run the tests when Claude says it's done. CLAUDE.md is "please do this"; a hook is "this always happens".`,
    },
    {
      q: 'How do you write a good prompt for a coding task?',
      a: `I give it what a new teammate would need: **the goal**, **where** in the code (file names or a similar example to copy), **constraints** (libraries to use or avoid, patterns to follow), and **how to know it's done**, like "tests pass and the type check is clean".

Vague prompts get generic code. "Add pagination to \`GET /api/candidates\` using the cursor style we use in \`jobs.ts\`, keep the response shape, and add a test" works much better than "add pagination". For UI work I also paste a screenshot of the design.`,
    },
    {
      q: 'How do you manage the context window in long sessions?',
      a: `The context window is the model's working memory, and quality drops when it fills with old, unrelated material. I keep **one task per session** and use \`/clear\` when I switch to an unrelated task.

For a long task I use \`/compact\`, which summarises the conversation so far. I point Claude at the exact files instead of letting it read everything, use subagents for big searches, and keep important decisions in files (a spec or CLAUDE.md) rather than only in the chat.`,
    },
    {
      q: 'How do you make sure AI-generated code is correct?',
      a: `I treat it like a pull request from a fast junior developer. I **read the diff**, run the **tests, type checker and linter**, and run the feature myself. I ask Claude to write tests first or alongside the code, and to explain any part I don't understand.

I watch for the usual problems: APIs or packages that don't exist, missing error handling, security gaps, and changes outside the task. Nothing gets committed that I couldn't explain in a code review.`,
    },
    {
      q: 'What are the risks of using AI coding tools, and how do you handle them?',
      a: `The main risks are **hallucinated APIs**, subtle bugs that look right, **security issues** like missing input validation, **leaking secrets or company code**, and becoming dependent on it without understanding the code.

I handle them with reviews and tests, by giving it the real docs or code to follow, with permission rules that block risky commands and \`.env\` files, by following the company's AI policy about what code can be shared, and by making sure I understand everything I merge.`,
    },
    {
      q: 'How do permissions work in Claude Code?',
      a: `By default Claude **asks before** editing files or running commands. I can approve once, or allow a command permanently. Rules live in \`settings.json\` under **allow**, **ask** and **deny**: for example allow \`npm test\` and \`git status\`, and deny reading \`.env\` or running \`git push\`.

There are also **permission modes**: normal, auto-accept edits, and plan mode (read-only). I keep risky actions like pushing, deploying or deleting on "ask", so I always see them first.`,
    },
    {
      q: 'How do you use Claude for debugging?',
      a: `I give it the **evidence**: the exact error, the stack trace, logs, the request that failed and the steps to reproduce. Then I ask it to find the cause **before** fixing anything, ideally by writing a failing test that shows the bug.

A good pattern is "explain why this happens, then fix the root cause, not the symptom". I also ask it to check whether the same bug exists anywhere else in the code. Then I verify the fix with the test and in the running app.`,
    },
    {
      q: 'How do you use Claude to write tests?',
      a: `I point it at the code and an existing test file to copy the style, and list the cases: happy path, edge cases, errors and permissions. I ask it to **run the tests** and show they pass, and to check one fails when I break the code on purpose. That proves the test really tests something.

For a bug fix I use test-first: write a failing test that reproduces the bug, then fix the code until it passes. That stops the AI from writing tests that just match whatever the code does.`,
    },
    {
      q: 'How do you onboard Claude onto an existing, large codebase?',
      a: `First \`/init\` to generate a CLAUDE.md, which I then edit. Then I ask questions before asking for changes: "how does authentication flow through this app?", "where is billing handled?". This is also the fastest way for **me** to learn a new codebase.

For changes, I name the files or a similar existing feature to copy, so the new code follows the project's patterns instead of generic ones. Large changes go in steps, each reviewed and tested.`,
    },
    {
      q: 'How do you use Claude for a big refactor or migration?',
      a: `I plan first: Claude finds every place affected and writes a migration plan with the order of steps and the risks. We do one module or a small batch at a time, and run the type checker and tests after each step, committing in small pieces so any step can be reverted.

For a migration like upgrading a Node version or a major library, I ask it to read the official migration guide and list the breaking changes that apply to our code before touching anything.`,
    },
    {
      q: 'Can Claude Code run in CI or automation?',
      a: `Yes. **Headless mode** (\`claude -p "prompt"\`) runs one task without the interactive UI and prints the result, so it can be used in scripts and pipelines. There is also an official **GitHub Actions** integration, where you mention Claude on a PR or issue and it reviews code or opens a fix.

In CI I keep it limited: read-only reviews or small, clearly scoped tasks, with restricted tools and permissions. A human still approves what gets merged.`,
    },
    {
      q: 'How do you work on several tasks at once with Claude?',
      a: `I use **git worktrees**: separate working folders for separate branches of the same repo, so two Claude sessions can work on two features without changing each other's files. Each session has its own clear task.

Inside one session, independent work like researching two parts of the code can go to **subagents** in parallel. I still review each branch separately before merging.`,
    },
    {
      q: 'How do you choose which Claude model to use, and how do you control cost?',
      a: `I use the strongest model for planning, architecture and hard debugging, and a faster, cheaper model like **Haiku** for simple, high-volume tasks. In OCTAGNT we used Claude Haiku at temperature 0 for consistent, low-cost scoring.

For cost: keep the context small (\`/clear\` between tasks), don't paste huge files or logs when a part is enough, avoid unnecessary subagents, and use prompt caching on the API for repeated long prompts. \`/cost\` and usage dashboards show what is being spent.`,
    },
    {
      q: 'What is the difference between Claude Code and tools like GitHub Copilot autocomplete?',
      a: `**Autocomplete** suggests the next lines while I type in one file. It is fast for small things, but I still drive every step.

**Claude Code** is an **agent**: I give it a task, and it reads many files, plans, edits across the project, runs tests and fixes failures in a loop. It is better for whole features, refactors and investigations. I use both: autocomplete for typing speed, the agent for multi-step work.`,
    },
    {
      q: 'How do you give feedback to Claude when its output is wrong?',
      a: `I'm specific about what is wrong and what I want instead, ideally with evidence: the failing test output, an error message, or a screenshot. "The button overlaps the text on mobile at 375px" works better than "it looks bad".

If it goes in the wrong direction I press **Esc** to stop it, and correct it early instead of letting it finish. If a session gets confused after several attempts, I \`/clear\` and start fresh with a better prompt. If the same correction keeps coming up, I add it to CLAUDE.md.`,
    },
    {
      q: 'How do you keep company code and secrets safe when using AI tools?',
      a: `I follow the company's AI policy about which tools and repos are allowed. I never paste API keys, passwords or customer data into prompts. I use **deny rules** so Claude can't read \`.env\` files or secrets folders, and keep secrets in a secrets manager, not in code.

I also check that AI-written code doesn't log sensitive data or hard-code credentials, and I review any MCP server's access before connecting it.`,
    },
    {
      q: 'When would you NOT use AI to write the code?',
      a: `When I don't understand the problem well enough to judge the answer, since then I can't review it. Also for very sensitive code (authentication, payments, encryption), where I write or review it line by line against the official docs, and when the change is so small that explaining it takes longer than doing it.

I also avoid it when the goal is for me to learn something deeply. There I use it to explain things, not to write the solution for me.`,
    },
  ],
};
