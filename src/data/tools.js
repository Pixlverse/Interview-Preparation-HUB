// Tools & Workflow — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'tools',
  title: 'Tools & Workflow',
  icon: '🛠️',
  description: 'The daily tools and team habits of a working engineer: Git, GitHub, linting, package managers, build tools, Agile, documentation and using AI tools responsibly.',
  definitionTitle: 'What are developer tools and workflow?',
  definition: `These are the **everyday tools and team habits** around writing code:

- **Git**, for version control (tracking every change and working on branches)
- **GitHub**, for pull requests and code review
- **ESLint** and **Prettier**, for code quality and formatting
- **npm**, **yarn** or **pnpm**, for packages
- **Vite** or **Webpack**, as bundlers
- **Agile/Scrum** with **Jira**, for planning work in sprints
- AI assistants like **Claude Code** and **GitHub Copilot**

**One-line answer:** "Developer workflow is the tooling and process — Git, code review, linting, package managers, bundlers, Agile and AI assistants — that lets a team ship good code consistently."`,
  topics: [
    {
      id: 'git-basics-branching',
      title: 'Git Basics and Branching',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Git tracks snapshots of your code. You stage changes, commit them, and work on branches so features stay separate until they are merged.',
      what: `**Git** is a version control system. It saves **snapshots** (commits) of your project so you can see history, undo mistakes and work with others.

Three places your changes live:
1. **Working directory** — the files you are editing.
2. **Staging area (index)** — changes you picked for the next commit (\`git add\`).
3. **Repository** — saved commits (\`git commit\`).

A **branch** is a separate line of work. \`main\` is the stable branch. You create \`feature/login\` to build something without touching \`main\`. When it is ready, you merge it back (usually through a pull request).

A **remote** (like GitHub) is a shared copy. \`git push\` sends your commits; \`git pull\` gets others' commits.

#### Deeper version
A commit is a snapshot plus metadata (author, message, parent commit), identified by a **SHA hash**. A branch is just a **movable pointer** (a tiny file) to one commit — that is why creating branches is instant and cheap. **HEAD** points to the branch (or commit) you are on now.

\`git pull\` = \`git fetch\` (download new commits) + \`git merge\` (or rebase, if configured). \`git fetch\` alone is safe: it updates \`origin/main\` but does not change your files.

\`git switch\` (create/move between branches) and \`git restore\` (discard file changes) are newer, clearer commands that split up the old, overloaded \`git checkout\`.`,
      why: `Without version control, you cannot safely undo a bad change, see who changed what and why, or let five developers work on the same code at once. Branches let each feature or bug fix be developed, reviewed and tested on its own.`,
      analogy: `Git is like a save system in a video game. Each commit is a save point you can go back to. A branch is starting a second save slot to try a risky path — if it goes well, you bring that progress into your main game; if not, you just delete the slot.`,
      code: [
        {
          title: 'Daily Git commands',
          lang: 'bash',
          code: `git clone git@github.com:acme/shop.git   # copy the repo
git switch -c feature/login              # create and move to a new branch

git status                               # what changed?
git add src/login.js                     # stage one file (git add -p = pick parts)
git commit -m "feat(auth): add login form"
git push -u origin feature/login         # push and set upstream

git fetch origin                         # download others' work, safe
git switch main && git pull              # update local main
git log --oneline --graph --all          # see branch history
git diff                                 # unstaged changes
git diff --staged                        # staged changes`,
        },
      ],
      output: `You clone the project, create \`feature/login\`, edit files, stage only what you want, and commit with a clear message. \`git push -u\` uploads the branch and remembers its remote, so next time just \`git push\` works.

\`git log --oneline --graph --all\` draws a small picture of branches and commits, which is great for understanding where you are. \`git diff\` vs \`git diff --staged\` shows what is not yet staged vs what will go into the next commit.`,
      questions: [
        {
          q: 'What is the difference between git fetch and git pull?',
          a: '`git fetch` downloads new commits from the remote but does not change your branch. `git pull` is fetch plus merge (or rebase) into your current branch.',
        },
        {
          q: 'What is the staging area?',
          a: 'A middle step between your edited files and a commit. You choose exactly which changes go into the next commit with `git add`.',
        },
        {
          q: 'What is a branch in Git, technically?',
          a: 'A lightweight movable pointer to a commit. Creating one is instant because Git only writes a reference, not a copy of the files.',
        },
        {
          q: 'What is HEAD?',
          a: 'A pointer to what you have checked out now — usually a branch. "Detached HEAD" means it points directly to a commit, not a branch.',
        },
      ],
      spoken: `"Git tracks snapshots of the project as commits. I edit files, stage what I want with git add, and commit with a clear message. Every feature or fix gets its own branch from main, like feature slash login, which is cheap because a branch is just a pointer to a commit. I push the branch and open a pull request. I use git fetch to safely see what others pushed, and git pull to bring it into my branch. I also like git add dash p to stage only part of a file, so each commit stays focused."`,
      mistakes: [
        'Working directly on `main` instead of a feature branch.',
        'Running `git add .` without checking `git status`, and committing `.env` files or debug code. Keep a good `.gitignore`.',
        'Huge commits with messages like "fix" or "changes". Small, focused commits are easier to review and revert.',
        'Follow-up trap: "What is a detached HEAD and is it dangerous?" You are on a commit, not a branch. New commits there are easy to lose when you switch away — create a branch (`git switch -c name`) to keep them.',
      ],
      takeaway: 'Stage, commit small, branch for every change — a branch is just a cheap pointer to a commit.',
    },
    {
      id: 'git-merge-conflicts',
      title: 'Resolving Merge Conflicts',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A conflict happens when two branches change the same lines. Git marks both versions in the file; you choose the final code, test it, then add and commit.',
      what: `A **merge conflict** happens when Git cannot combine two changes automatically — usually because both branches changed the **same lines** of a file, or one deleted a file the other changed.

Git stops and marks the file:

\`\`\`text
<<<<<<< HEAD
const TAX = 0.18;
=======
const TAX = 0.12;
>>>>>>> feature/new-tax
\`\`\`

- Between \`<<<<<<< HEAD\` and \`=======\` is **your current branch**.
- Between \`=======\` and \`>>>>>>>\` is the **incoming** change.

To resolve: edit the file to the correct final code, remove the markers, \`git add\` the file, and finish with \`git commit\` (merge) or \`git rebase --continue\` (rebase).

#### Deeper version
Git does a **three-way merge**: it compares both versions with their **common ancestor** (merge base). If only one side changed a line, Git takes it automatically. Only when **both** sides changed the same area does it ask you.

Helpful tools:
- \`git status\` lists conflicted files.
- \`git merge --abort\` / \`git rebase --abort\` returns to the state before you started.
- \`git checkout --ours file\` or \`--theirs file\` takes one whole side (careful: during a rebase, "ours" and "theirs" are swapped, because you are replaying your commits onto the other branch).
- \`git config merge.conflictstyle diff3\` (or \`zdiff3\` in newer Git) also shows the original base version, which makes it easier to understand **why** the lines differ.
- VS Code's merge editor shows "Accept Current / Incoming / Both".

Resolving is not just picking a side. Sometimes the right answer combines both changes. After resolving, **run the tests and the app**, because code can merge "cleanly" in text but still be broken in logic.

Prevention: keep branches short-lived, pull/rebase from main often, keep PRs small, and let Prettier format code so formatting changes do not cause fake conflicts.`,
      why: `Conflicts are a normal part of teamwork, and every developer must handle them calmly. Interviewers want to see you resolve them safely — understanding both changes, talking to the other author if needed, and testing — instead of blindly accepting one side and deleting someone's work.`,
      analogy: `Two people edit the same paragraph of a shared document while offline. When they sync, the app cannot know which sentence is right, so it shows both versions side by side and asks a human to write the final paragraph.`,
      code: [
        {
          title: 'Resolve a conflict during a merge',
          lang: 'bash',
          code: `git switch feature/new-tax
git merge main
# CONFLICT (content): Merge conflict in src/tax.js

git status                 # shows: both modified: src/tax.js
# open src/tax.js, decide the correct code, delete the <<< === >>> markers

npm test                   # make sure the combined code works
git add src/tax.js
git commit                 # Git pre-fills the merge commit message

# Changed your mind before committing?
git merge --abort`,
        },
        {
          title: 'Same conflict during a rebase',
          lang: 'bash',
          code: `git switch feature/new-tax
git rebase main
# CONFLICT in src/tax.js -> fix the file

git add src/tax.js
git rebase --continue      # replay the next commit (may conflict again)
# or: git rebase --abort   # go back to how it was before the rebase

git push --force-with-lease  # branch history changed, so a normal push is rejected`,
        },
      ],
      output: `In the merge flow, Git pauses and marks \`src/tax.js\` as "both modified". After you edit the file, run the tests and \`git add\` it, \`git commit\` creates a merge commit that joins both histories.

In the rebase flow, Git replays your commits one by one on top of \`main\`. Each commit can stop with a conflict; you fix, \`git add\`, and \`git rebase --continue\`. Because the commit hashes change, you push with \`--force-with-lease\`, which refuses to overwrite the remote if someone else pushed in the meantime.`,
      questions: [
        {
          q: 'What causes a merge conflict?',
          a: 'Two branches changing the same lines of the same file, or one branch deleting or renaming a file the other changed. Git cannot decide automatically, so it asks you.',
        },
        {
          q: 'How do you resolve a merge conflict?',
          a: 'Run `git status` to find conflicted files, edit each to the correct final code and remove markers, run tests, `git add` the files, then `git commit` or `git rebase --continue`.',
        },
        {
          q: 'How do you cancel a merge that went wrong?',
          a: '`git merge --abort` (or `git rebase --abort`) returns the branch to the state before the operation started.',
        },
        {
          q: 'How do you reduce merge conflicts in a team?',
          a: 'Short-lived branches, small PRs, frequent syncing with main, automatic formatting with Prettier, and talking to teammates working in the same files.',
        },
      ],
      spoken: `"A conflict happens when two branches change the same lines, so Git can't merge them automatically. I run git status to see the conflicted files, open each one, and look at both sides between the markers. I don't just accept one side — I understand both changes and sometimes combine them, and if it's not clear I ask the other author. Then I remove the markers, run the tests, git add the file, and commit or continue the rebase. If things get messy, git merge abort takes me back. To avoid conflicts, I keep branches short-lived and sync with main often."`,
      mistakes: [
        'Accepting "ours" or "theirs" for the whole file without reading, and deleting a teammate\'s work.',
        'Committing files that still contain `<<<<<<<` markers. Search for them, and let a linter or hook catch them.',
        'Not running tests after resolving. Text can merge cleanly while the logic is broken.',
        'Follow-up trap: "During a rebase, what does --ours mean?" It is swapped: "ours" is the branch you are rebasing onto (e.g. main), and "theirs" is your commit being replayed.',
      ],
      takeaway: 'A conflict is Git asking a human: read both sides, write the correct final code, test, then add and continue.',
    },
    {
      id: 'github-pr-workflow',
      title: 'GitHub Workflow: Pull Requests, Reviews and Branch Protection',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Branch from main, push, open a pull request, pass CI and review, then merge (squash, merge or rebase). Branch protection enforces the rules.',
      what: `The standard team workflow on GitHub:

1. Create a branch from \`main\`: \`feature/JIRA-123-login\`.
2. Commit and push.
3. Open a **Pull Request (PR)** — a request to merge your branch into \`main\`, with a description.
4. **CI** runs (lint, tests, build) and teammates **review**. They comment, request changes or approve.
5. Fix comments, push again; the PR updates automatically.
6. **Merge**, then delete the branch. Deploy happens from \`main\` (often automatically).

**Branch protection rules** on \`main\` enforce this: no direct pushes, at least one approval, required CI checks must pass, branch must be up to date, conversations resolved.

#### Deeper version
Three merge options on GitHub:
- **Merge commit** — keeps every commit and adds a merge commit. Full history, but noisy.
- **Squash and merge** — combines all PR commits into **one** commit on main. Clean, linear history; one PR = one commit, easy to revert. Very common.
- **Rebase and merge** — replays each commit onto main without a merge commit. Linear, keeps individual commits.

Other useful GitHub features:
- **Draft PRs** — share early work for feedback without asking for a formal review.
- **CODEOWNERS** file — auto-requests review from the owners of certain folders (e.g. payments team for \`/src/payments\`).
- **PR templates** (\`.github/pull_request_template.md\`) — a checklist in every PR description.
- **Linking issues** — "Closes #42" closes the issue when the PR merges.
- **Required status checks** and **merge queues** (where available) to keep main always green.
- **Rulesets** — a newer, more flexible way to define branch rules; availability and options depend on your GitHub plan, so check the docs.`,
      why: `This flow makes sure every change to \`main\` is reviewed and tested, gives a written record of why changes were made, and keeps \`main\` always deployable. Branch protection removes the "someone pushed straight to main on Friday evening" problem.`,
      analogy: `A PR is like submitting an article to an editor. You write it in your own draft (branch), submit it (PR), the spell-checker runs automatically (CI), the editor gives feedback (review), and only an approved article is printed in the newspaper (main).`,
      code: [
        {
          title: 'From branch to merged PR with the gh CLI',
          lang: 'bash',
          code: `git switch -c feature/SHOP-123-coupon-codes
# ...code, commit...
git push -u origin feature/SHOP-123-coupon-codes

gh pr create --title "feat(cart): support coupon codes" \\
  --body "Closes SHOP-123. Adds coupon validation and discount display." \\
  --reviewer asha,ravi --draft

gh pr ready            # mark as ready for review
gh pr checks           # see CI status
gh pr merge --squash --delete-branch`,
        },
        {
          title: '.github/CODEOWNERS',
          lang: 'text',
          code: `# Default owners for everything
*                    @acme/web-team
# Payments code always needs a payments engineer to review
/src/payments/       @acme/payments-team
# Infra files
/.github/workflows/  @acme/devops`,
        },
      ],
      output: `The branch is pushed and a draft PR is created with a title, a linked ticket and reviewers. When it is ready, CI runs and reviewers are notified. Because of CODEOWNERS, a change under \`src/payments/\` automatically requests the payments team.

Branch protection keeps the "Merge" button disabled until the required checks pass and approvals are given. \`--squash\` turns all commits into one clean commit on main, and \`--delete-branch\` cleans up afterwards.`,
      questions: [
        {
          q: 'Describe your Git/GitHub workflow.',
          a: 'Feature branch from main, small commits, push, open a PR with a clear description, CI runs, at least one review, fix comments, squash-merge into main, delete the branch, and main deploys automatically.',
        },
        {
          q: 'What is branch protection?',
          a: 'Rules on important branches like main: no direct pushes, required approvals, required CI checks, up-to-date branches, and resolved conversations before merging.',
        },
        {
          q: 'Squash and merge vs merge commit vs rebase and merge?',
          a: 'Squash makes one commit per PR (clean, easy to revert). Merge commit keeps all commits plus a merge commit (full history). Rebase and merge keeps each commit but in a linear history.',
        },
        {
          q: 'What is CODEOWNERS?',
          a: 'A file that maps paths to people or teams. GitHub automatically requests their review on PRs touching those paths, and branch protection can require their approval.',
        },
      ],
      spoken: `"I branch from main for every change, using the ticket number in the branch name. I push and open a pull request with a clear description, a linked ticket, and testing steps — sometimes as a draft to get early feedback. CI runs lint, type checks and tests, and at least one teammate reviews. Main is protected: no direct pushes, required approvals and required checks, and CODEOWNERS pulls in the right reviewers for sensitive areas like payments. We usually squash and merge, so each PR becomes one clean commit that's easy to revert, and then delete the branch."`,
      mistakes: [
        'Pushing directly to main because "it is a tiny fix".',
        'Long-living PRs that drift from main and collect conflicts.',
        'PR descriptions that are empty, so reviewers must guess what and why.',
        'Follow-up trap: "With squash merges, why do you still care about commit messages?" The PR title usually becomes the squash commit message, so it must follow your convention (e.g. Conventional Commits) — and good branch commits help reviewers follow the work.',
      ],
      takeaway: 'Branch, PR, CI, review, squash-merge — and branch protection makes that the only way into main.',
    },
    {
      id: 'conventional-commits',
      title: 'Commit Messages and Conventional Commits',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'A standard commit format like "feat(auth): add Google login" that makes history readable and lets tools create changelogs and version bumps automatically.',
      what: `A good commit message explains **what** changed and **why**, in a short subject line.

**Conventional Commits** is a popular format:

\`\`\`text
type(scope): short description

optional body: why, details

optional footer: BREAKING CHANGE: ..., Closes #42
\`\`\`

Common types:
- \`feat\` — a new feature
- \`fix\` — a bug fix
- \`docs\`, \`style\` (formatting), \`refactor\`, \`perf\`, \`test\`
- \`build\` (build system, dependencies), \`ci\`, \`chore\` (other maintenance)

Examples: \`feat(cart): add coupon codes\`, \`fix(api): return 404 for missing order\`.

#### Deeper version
Because the format is machine-readable, tools can:
- **Generate changelogs** automatically.
- **Decide the next version** (semantic versioning): \`fix\` → patch, \`feat\` → minor, \`BREAKING CHANGE\` footer or \`!\` after the type (\`feat!:\`) → major. Tools: semantic-release, release-please, changesets (changesets uses its own files instead of commit parsing).
- **Enforce** the format with **commitlint** in a Git hook (\`commit-msg\`) or in CI on the PR title.

Writing tips: use the imperative mood ("add", not "added"), keep the subject around 50-72 characters, and put the **why** in the body. One logical change per commit.`,
      why: `History like "fix", "wip", "final final" is useless when you are hunting a bug six months later. Clear, consistent messages make \`git log\` and \`git blame\` actually helpful, and the conventional format lets you automate releases and changelogs.`,
      analogy: `Commit messages are like labels on moving boxes. "Stuff" tells you nothing. "Kitchen – plates (fragile)" tells you what is inside, where it goes and how to handle it. Conventional Commits is a labelling standard the whole team uses, so even a robot can sort the boxes.`,
      code: [
        {
          title: 'Good vs bad messages',
          lang: 'text',
          code: `Bad:  fixed stuff
Bad:  WIP
Bad:  updated files

Good: fix(auth): refresh token before it expires

      Users were logged out after 15 minutes because we refreshed
      only after a 401. Now we refresh 60s before expiry.

      Closes SHOP-231

Good: feat(api)!: return paginated results from GET /orders

      BREAKING CHANGE: response is now { items, nextCursor } instead of an array.`,
        },
        {
          title: 'Enforce with commitlint',
          lang: 'bash',
          code: `npm install -D @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# with Husky (see the Git hooks topic):
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg

git commit -m "added login"        # rejected: type may not be empty
git commit -m "feat: add login"    # accepted`,
        },
      ],
      output: `The good messages tell a future reader the area (\`auth\`, \`api\`), the kind of change, and the reason. The \`!\` and \`BREAKING CHANGE\` footer warn API consumers and tell release tools to bump the **major** version.

With commitlint in the \`commit-msg\` hook, "added login" is rejected before the commit is created, and "feat: add login" passes. Release tools reading these commits can then produce a changelog section "Features: add login".`,
      questions: [
        {
          q: 'What are Conventional Commits?',
          a: 'A commit message format `type(scope): description`, with types like feat, fix, docs, refactor, test, chore, and a `BREAKING CHANGE` footer. It makes history readable and enables automated changelogs and versioning.',
        },
        {
          q: 'How do Conventional Commits relate to semantic versioning?',
          a: '`fix` means a patch release, `feat` a minor release, and a breaking change (`!` or `BREAKING CHANGE:`) a major release. Tools like semantic-release use this to bump versions automatically.',
        },
        {
          q: 'How do you enforce a commit format?',
          a: 'commitlint in a Husky `commit-msg` hook locally, and a CI check on the PR title when the team squash-merges.',
        },
        {
          q: 'What makes a good commit message?',
          a: 'A short imperative subject that says what changed, a body that explains why, a reference to the ticket, and one logical change per commit.',
        },
      ],
      spoken: `"I follow Conventional Commits: type, optional scope, and a short description, like feat(cart): add coupon codes, or fix(api): return 404 for missing orders. I write the subject in the imperative, keep it short, and explain the why in the body with the ticket number. Breaking changes get an exclamation mark or a BREAKING CHANGE footer. The nice part is automation: tools like semantic-release or release-please can generate the changelog and bump the version. We enforce it with commitlint in a Husky commit-msg hook, and a check on the PR title since we squash-merge."`,
      mistakes: [
        'Messages like "fix" or "changes" that explain nothing.',
        'Mixing a refactor, a feature and a formatting change in one commit.',
        'Marking breaking API changes as `feat` or `fix`, so consumers get a breaking change in a minor release.',
        'Follow-up trap: "Is `chore` the right type for a dependency upgrade that fixes a security bug?" Many teams use `fix(deps):` or `build(deps):` for that, because it changes runtime behaviour; `chore` is for maintenance that does not affect users. Follow your team\'s convention.',
      ],
      takeaway: 'type(scope): what — plus why in the body; consistent messages make history useful and releases automatic.',
    },
    {
      id: 'eslint-prettier',
      title: 'ESLint and Prettier',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'ESLint finds bugs and bad patterns in code; Prettier formats code automatically. Use both, and let Prettier own formatting so they do not fight.',
      what: `- **ESLint** is a **linter**: it reads your code and finds problems — unused variables, missing \`await\`, React hook rule violations, \`==\` instead of \`===\`. Some problems it can auto-fix.
- **Prettier** is a **formatter**: it rewrites code into one consistent style — quotes, semicolons, line length, indentation. It does not care about logic.

Simple rule: **ESLint for code quality, Prettier for formatting.**

You run them in the editor (format on save), in a pre-commit hook, and in CI.

#### Deeper version
ESLint has built-in **rules** plus **plugins** that add more: \`@typescript-eslint\`, \`eslint-plugin-react-hooks\` (the famous \`exhaustive-deps\` rule), \`eslint-plugin-jsx-a11y\` (accessibility), \`eslint-plugin-import\`. Next.js ships its own ESLint config.

Since ESLint v9 the default config format is **flat config** (\`eslint.config.js\`, an array of config objects). Older projects use \`.eslintrc.*\`, which is deprecated. Expect both in interviews and real codebases.

To avoid conflicts, turn off ESLint's formatting rules with \`eslint-config-prettier\`, and run Prettier separately. (Running Prettier **as an ESLint rule** via \`eslint-plugin-prettier\` works but is slower and noisier; most teams now run them separately.)

Rule severity: \`"off"\`, \`"warn"\`, \`"error"\`. In CI, \`eslint --max-warnings=0\` makes warnings fail the build so they do not pile up.

Newer all-in-one tools like **Biome** (lint + format, written in Rust) are growing; the concepts are the same.`,
      why: `Without these tools, code reviews fill up with comments about semicolons and spacing, every file looks different, and simple bugs (a missing dependency in useEffect, an unused import, a floating promise) reach production. Automation makes style a non-discussion and catches bugs for free.`,
      analogy: `Prettier is an automatic text formatter that makes every page in a book use the same font and margins. ESLint is the editor who reads for mistakes: "this sentence has no verb", "you mentioned a character who never appears". You want both, and you do not want the formatter arguing with the editor about margins.`,
      code: [
        {
          title: 'eslint.config.js (flat config) for React + TypeScript',
          lang: 'javascript',
          code: `import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
    },
  },
  prettier, // last: turns off rules that clash with Prettier
];`,
        },
        {
          title: '.prettierrc',
          lang: 'json',
          code: `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}`,
        },
        {
          title: 'package.json scripts',
          lang: 'json',
          code: `{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}`,
        },
      ],
      output: `With this setup, ESLint reports real problems: using \`==\`, breaking the rules of hooks, a \`console.log\` left behind, or a missing effect dependency. \`eslint-config-prettier\` at the end switches off any ESLint rules about formatting, so the two tools never disagree.

\`npm run format\` rewrites files to single quotes, trailing commas and 100-character lines. In CI, \`format:check\` and \`lint\` fail the build if anyone skipped them locally.`,
      questions: [
        {
          q: 'What is the difference between ESLint and Prettier?',
          a: 'ESLint is a linter that finds code-quality problems and possible bugs. Prettier is an opinionated formatter that only changes how code looks. Use ESLint for logic and Prettier for style.',
        },
        {
          q: 'How do you stop ESLint and Prettier from conflicting?',
          a: 'Add `eslint-config-prettier` last in the ESLint config to disable formatting rules, and run Prettier as its own step.',
        },
        {
          q: 'What is ESLint flat config?',
          a: 'The newer config format (`eslint.config.js`) that exports an array of config objects and imports plugins directly. It is the default since ESLint v9; `.eslintrc` is the older, deprecated format.',
        },
        {
          q: 'Where do you run linting and formatting?',
          a: 'In the editor on save, on staged files in a pre-commit hook (lint-staged), and in CI as the final gate.',
        },
      ],
      spoken: `"ESLint and Prettier do different jobs. ESLint is a linter — it catches real problems like unused variables, the rules of hooks, missing effect dependencies, or using double equals. Prettier is a formatter — it just makes the code look the same everywhere. I use eslint-config-prettier so ESLint's formatting rules are turned off and the tools don't fight. They run on save in the editor, on staged files with Husky and lint-staged, and in CI with max-warnings zero. That way code reviews focus on logic, not on spacing or quotes."`,
      mistakes: [
        'Letting ESLint and Prettier both handle formatting, so they fight and files flip back and forth.',
        'Disabling rules with `// eslint-disable-next-line` everywhere instead of fixing the issue or changing the rule for the team.',
        'Ignoring warnings for months until there are 2,000 of them. Use `--max-warnings=0` in CI.',
        'Follow-up trap: "Is the `exhaustive-deps` warning safe to ignore?" Usually no — a missing dependency causes stale values. If you really need to skip it, the code often needs a ref, a functional update, or `useCallback` instead.',
      ],
      takeaway: 'ESLint catches bugs, Prettier formats — run both automatically and let eslint-config-prettier keep them from fighting.',
    },
    {
      id: 'semver-package-lock',
      title: 'Semantic Versioning and package-lock (^ vs ~, npm ci)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Versions are MAJOR.MINOR.PATCH. ^ allows minor and patch updates, ~ allows only patch. The lock file pins exact versions; npm ci installs exactly those.',
      what: `**Semantic versioning (semver)** gives every package version three numbers: \`MAJOR.MINOR.PATCH\`, like \`4.18.2\`.

- **PATCH** (4.18.**3**) — bug fixes, nothing breaks.
- **MINOR** (4.**19**.0) — new features, still backward compatible.
- **MAJOR** (**5**.0.0) — breaking changes; you may need to change your code.

In \`package.json\` you give a **range**:
- \`"express": "^4.18.2"\` — caret: any \`4.x.x\` that is \`>= 4.18.2\` (minor + patch updates). This is npm's default.
- \`"express": "~4.18.2"\` — tilde: any \`4.18.x\` \`>= 4.18.2\` (patch updates only).
- \`"express": "4.18.2"\` — exact version only.

**package-lock.json** records the **exact** version of every package (including dependencies of dependencies) that was installed. Commit it.

**npm ci** installs exactly what the lock file says, from a clean \`node_modules\`. Use it in CI and Docker.

#### Deeper version
Special case: for \`0.x\` versions, the caret is stricter. \`^0.2.3\` means \`>=0.2.3 <0.3.0\`, because in \`0.x\` a minor bump may be breaking.

\`npm install\` vs \`npm ci\`:
- \`npm install\` may update the lock file (when \`package.json\` changed or ranges allow), and keeps existing \`node_modules\`.
- \`npm ci\` deletes \`node_modules\`, never writes the lock file, and **fails** if \`package.json\` and the lock file do not match. Faster and reproducible.

Other useful pieces:
- \`dependencies\` (needed at runtime) vs \`devDependencies\` (only for building/testing: Jest, ESLint, TypeScript). \`npm ci --omit=dev\` for production images.
- \`peerDependencies\` — "I need the host app to provide this", like a React component library needing \`react\`.
- \`npm outdated\`, \`npm update\`, \`npm audit\` (known vulnerabilities), and bots like **Dependabot** or **Renovate** to open upgrade PRs.
- \`overrides\` (npm) / \`resolutions\` (Yarn) force a version of a nested dependency, e.g. to patch a vulnerability.`,
      why: `Without a lock file, two developers (or CI and production) can install different versions from the same \`package.json\`, causing "works on my machine" bugs. Semver ranges let you get safe fixes easily, and the lock file plus \`npm ci\` makes every install reproducible.`,
      analogy: `\`package.json\` is a shopping list that says "milk, any brand, 1-2 litres". \`package-lock.json\` is the receipt that says exactly "Amul Gold 1L, batch 4512". \`npm ci\` is buying exactly what is on the receipt, so every kitchen cooks with the same ingredients.`,
      code: [
        {
          title: 'Ranges in package.json',
          lang: 'json',
          code: `{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "~8.1.0",
    "stripe": "14.10.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^9.0.0"
  },
  "overrides": {
    "semver": "7.5.4"
  }
}`,
        },
        {
          title: 'Commands you should know',
          lang: 'bash',
          code: `npm install stripe            # adds "^x.y.z" and updates the lock file
npm install -D jest           # devDependency
npm install stripe@14.10.0 --save-exact

npm ci                        # CI/Docker: exact, clean, fails on mismatch
npm ci --omit=dev             # production install without devDependencies

npm outdated                  # what is behind
npm audit                     # known vulnerabilities
npm ls semver                 # who depends on which version`,
        },
      ],
      output: `With these ranges:
- \`express ^4.18.2\` may install 4.19.x or 4.21.x, but never 5.0.0.
- \`mongoose ~8.1.0\` may install 8.1.5, but not 8.2.0.
- \`stripe 14.10.0\` installs exactly that.
- \`overrides\` forces every nested copy of \`semver\` to 7.5.4 (for example, to fix a vulnerability in a sub-dependency).

The lock file records the exact versions chosen, so \`npm ci\` on CI installs the same tree as your laptop. If someone edited \`package.json\` but forgot to commit the updated lock file, \`npm ci\` fails instead of silently installing something different.`,
      questions: [
        {
          q: 'What is the difference between ^ and ~ in package.json?',
          a: '`^1.2.3` allows minor and patch updates (`<2.0.0`). `~1.2.3` allows only patch updates (`<1.3.0`). For `0.x` versions the caret is stricter and only allows patches.',
        },
        {
          q: 'Why commit package-lock.json?',
          a: 'It records the exact installed version of every package, including nested ones, so every developer, CI run and production build gets the same dependency tree.',
        },
        {
          q: 'npm install vs npm ci?',
          a: '`npm install` resolves ranges, may update the lock file and reuses node_modules. `npm ci` removes node_modules, installs exactly the lock file and fails if it does not match package.json. Use `npm ci` in CI and Docker.',
        },
        {
          q: 'What is a peerDependency?',
          a: 'A dependency the host project must provide, not the package itself. A React UI library lists `react` as a peer so the app does not end up with two copies of React.',
        },
        {
          q: 'How do you fix a vulnerability in a nested dependency?',
          a: 'Update the parent package if a fixed version exists; otherwise use `overrides` (npm) or `resolutions` (Yarn) to force a safe version, then test. `npm audit` and Dependabot help find these.',
        },
      ],
      spoken: `"Semver is major, minor, patch: patches fix bugs, minors add features without breaking anything, and majors can break the API. In package.json, caret allows minor and patch updates, which is npm's default, and tilde allows only patches. Because ranges can resolve differently over time, we always commit package-lock.json, which pins the exact tree. In CI and Docker I use npm ci, which installs exactly the lock file from scratch and fails if it's out of sync with package.json. For upgrades we use Dependabot and npm audit, and overrides when a nested dependency needs a security fix."`,
      mistakes: [
        'Not committing the lock file, or adding it to `.gitignore`.',
        'Using `npm install` in CI or Docker, which can produce a different tree than local.',
        'Thinking `^` protects you from everything. Authors sometimes ship breaking changes in minor versions by mistake; the lock file is your real protection.',
        'Putting build tools like TypeScript or Jest in `dependencies`, bloating the production install.',
        'Follow-up trap: "Should a library commit its lock file?" Yes, for its own development and CI. But consumers do not use a library\'s lock file — they resolve its ranges themselves — so a library\'s ranges must be correct.',
      ],
      takeaway: 'MAJOR.MINOR.PATCH; ^ = minor updates, ~ = patch only; commit the lock file and use npm ci for exact, repeatable installs.',
    },
    {
      id: 'agile-scrum',
      title: 'Agile and Scrum (sprints and ceremonies)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Agile means shipping small pieces often and adapting to feedback. Scrum organises this into sprints with planning, daily stand-up, review and retrospective.',
      what: `**Agile** is a way of working: build software in **small pieces**, show them to users **often**, get feedback, and **adapt** the plan. It is the opposite of planning everything for a year and delivering it all at the end (often called "waterfall").

**Scrum** is the most common Agile framework. Work happens in **sprints** — fixed periods, usually **2 weeks**.

**Roles:**
- **Product Owner (PO)** — decides **what** to build and in what order; owns the backlog.
- **Scrum Master** — helps the team follow the process and removes blockers.
- **Developers** — the team that builds, tests and ships (developers, QA, designers).

**Ceremonies (events):**
1. **Sprint Planning** — pick backlog items for the sprint and agree a sprint goal.
2. **Daily Stand-up** (Daily Scrum, ~15 min) — what I did, what I will do, any blockers.
3. **Sprint Review** — demo finished work to stakeholders, get feedback.
4. **Retrospective** — the team discusses what went well, what did not, and what to improve.
5. **Backlog Refinement** (grooming) — clarify and estimate upcoming stories (an ongoing activity, often a regular meeting).

**Artifacts:** Product Backlog, Sprint Backlog, and the Increment (working software).

#### Deeper version
Key concepts:
- **User story** — "As a [user], I want [goal], so that [benefit]", with **acceptance criteria** (conditions that must be true to call it done).
- **Definition of Done (DoD)** — the team's checklist for every item: code reviewed, tests passing, deployed to staging, docs updated.
- **Velocity** — how many story points the team usually completes per sprint; used for planning, not for comparing teams or people.
- **Kanban** — another Agile method with no sprints: a continuous flow of work on a board with **WIP (work-in-progress) limits**. Good for support/ops work. Many teams mix both ("Scrumban").

In practice, a good answer in interviews shows you care about the **goal** behind the ceremonies: fast feedback, visible blockers, and continuous improvement — not just attending meetings.`,
      why: `Requirements change, especially in startups. Short sprints let the team deliver value early, learn from real users, and change direction cheaply. Regular ceremonies make problems visible early instead of at the deadline.`,
      analogy: `Planning a road trip the Agile way: instead of fixing every stop for 10 days in advance, you plan the next 2 days (a sprint), drive, check what everyone enjoyed (review and retro), and plan the next 2 days with what you learned. Each morning you quickly check fuel and directions (stand-up).`,
      code: [
        {
          title: 'A user story with acceptance criteria',
          lang: 'text',
          code: `Story: SHOP-123 Coupon codes at checkout
As a returning customer,
I want to apply a coupon code at checkout,
so that I get my discount without contacting support.

Acceptance criteria (Given / When / Then):
- Given a valid code SAVE20, when I apply it, then the total drops by 20%.
- Given an expired code, when I apply it, then I see "This code has expired".
- Only one coupon can be used per order.

Definition of Done:
[ ] Code reviewed and merged   [ ] Unit + integration tests
[ ] Deployed to staging        [ ] PO accepted on staging`,
        },
        {
          title: 'A good daily stand-up update',
          lang: 'text',
          code: `Yesterday: Finished the coupon validation API (SHOP-123), PR is up.
Today:     Building the checkout UI for coupons; will pair with Asha on Stripe discounts.
Blockers:  Need the final error copy from design - @PO can you check today?`,
        },
      ],
      output: `The user story says **who** wants **what** and **why**, and the acceptance criteria make "done" testable — QA and developers can turn each Given/When/Then line straight into a test. The Definition of Done is the same for every story.

The stand-up update is short, focused on progress toward the sprint goal, and makes the blocker visible with a clear owner. Long technical discussions are taken offline after the stand-up.`,
      questions: [
        {
          q: 'What are the Scrum ceremonies?',
          a: 'Sprint Planning, Daily Stand-up, Sprint Review, and Sprint Retrospective, plus ongoing Backlog Refinement. All happen inside a fixed-length sprint, usually two weeks.',
        },
        {
          q: 'What is the difference between Sprint Review and Retrospective?',
          a: 'The Review is about the product: demo the work to stakeholders and get feedback. The Retrospective is about the process: the team discusses how to work better next sprint.',
        },
        {
          q: 'Scrum vs Kanban?',
          a: 'Scrum uses fixed sprints, roles and ceremonies. Kanban is a continuous flow with WIP limits and no sprints. Kanban fits support and unpredictable work; Scrum fits planned product work.',
        },
        {
          q: 'What is a Definition of Done?',
          a: 'A shared checklist that every item must meet to count as done — for example reviewed, tested, deployed to staging, and accepted by the PO.',
        },
        {
          q: 'What do you do if a story cannot be finished in the sprint?',
          a: 'Raise it early in stand-up, discuss with the PO, split the story if possible, and move the unfinished part back to the backlog. Do not mark half-done work as done.',
        },
      ],
      spoken: `"I've worked in Scrum teams with two-week sprints. In sprint planning we pick stories from a prioritised backlog and agree a sprint goal. We have a short daily stand-up to share progress and blockers, a sprint review where we demo to stakeholders, and a retrospective to improve how we work. Stories have clear acceptance criteria, and we have a shared Definition of Done — reviewed, tested and on staging. For me the value of Agile is fast feedback: shipping small pieces, learning from users, and raising problems early instead of on deadline day."`,
      mistakes: [
        'Turning stand-up into a 45-minute problem-solving meeting. Keep it short and take discussions offline.',
        'Treating velocity as a performance score for individuals or comparing teams by it.',
        'Saying "we do Agile" but planning everything months ahead and never adapting.',
        'Skipping retrospectives or never acting on what they find.',
        'Follow-up trap: "Who decides how the work is done — the PO or the team?" The PO decides what and in what order; the developers decide how to build it and how much they can take into the sprint.',
      ],
      takeaway: 'Agile = small, frequent, feedback-driven delivery; Scrum = sprints with planning, stand-up, review and retro.',
    },
    {
      id: 'jira',
      title: 'Jira: Issues, Boards and Workflow',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Jira tracks work as issues (epics, stories, tasks, bugs, sub-tasks) on Scrum or Kanban boards, linked to branches and PRs so progress is visible.',
      what: `**Jira** (by Atlassian) is a tool to plan and track team work.

**Issue types** (the usual hierarchy):
- **Epic** — a big feature, split into many stories ("Checkout v2").
- **Story** — a user-facing piece of value ("Apply coupon at checkout").
- **Task** — technical work that is not a user story ("Upgrade Node to 20").
- **Bug** — something broken.
- **Sub-task** — a smaller step inside a story or task.

Each issue has a **key** like \`SHOP-123\`, a status, an assignee, priority, story points and comments.

**Boards:**
- **Scrum board** — backlog + active sprint, with sprint reports (burndown, velocity).
- **Kanban board** — columns like To Do → In Progress → Code Review → QA → Done, often with WIP limits.

#### Deeper version
Developer habits that make Jira useful:
- Put the **issue key** in the branch name and commit/PR title (\`feature/SHOP-123-coupons\`, \`feat(cart): coupons [SHOP-123]\`). With the GitHub/Bitbucket integration, the issue shows linked branches, commits, PRs and build status automatically.
- Move tickets yourself so the board reflects reality; add short comments on decisions and blockers.
- A good bug report: steps to reproduce, expected vs actual, environment (browser, version), screenshots/logs, request ID, severity.
- **JQL** (Jira Query Language) lets you build filters, for example "my open bugs this sprint".
- **Burndown chart** — remaining work in the sprint over time; a flat line means work is stuck or not being updated.

Other tools with the same ideas: Linear, GitHub Projects, ClickUp, Azure Boards.`,
      why: `Without a shared tracker, nobody knows what is being worked on, what is blocked, or how close a release is. Jira gives the team, PO and managers one place for priorities and status, and links the code to the reason it was written.`,
      analogy: `Jira is a restaurant's order board. Every order (issue) has a number, moves from "received" to "cooking" to "served", and the head chef can see at a glance which orders are late and which cook is overloaded.`,
      code: [
        {
          title: 'Useful JQL filters',
          lang: 'sql',
          code: `-- My open work in the current sprint
assignee = currentUser() AND sprint in openSprints() AND statusCategory != Done

-- High-priority bugs created in the last 7 days
project = SHOP AND issuetype = Bug AND priority in (Highest, High) AND created >= -7d
ORDER BY priority DESC, created ASC

-- Stories in an epic that are still not done
"Epic Link" = SHOP-100 AND statusCategory != Done`,
        },
        {
          title: 'A good bug report',
          lang: 'text',
          code: `SHOP-245 [Bug] Coupon total wrong when cart has a free item

Steps:     1. Add "Pen" (Rs 0, promo) and "Book" (Rs 500)  2. Apply SAVE20
Expected:  Total Rs 400
Actual:    Total Rs 380 (discount applied twice)
Env:       Production, Chrome 129, release 2024.10.3, requestId 9f1c-...
Severity:  High - customers are over-discounted
Attachments: screenshot, network log`,
        },
      ],
      output: `The JQL filters can be saved and added to a dashboard, so each person sees their own sprint work and the team sees fresh critical bugs. JQL looks like SQL but only queries Jira issues. (Note: field names like "Epic Link" vary between Jira setups — newer Jira Cloud projects often use \`parent\` instead — so check your instance.)

The bug report has everything a developer needs to reproduce and prioritise the bug without asking follow-up questions, including a request ID to find the exact logs.`,
      questions: [
        {
          q: 'What is the difference between an epic, a story and a task?',
          a: 'An epic is a large feature made of many stories. A story is a piece of user-facing value. A task is technical work without direct user value. Sub-tasks split any of them into steps.',
        },
        {
          q: 'How do you link code to Jira tickets?',
          a: 'Include the issue key in branch names, commit messages and PR titles. The Jira–GitHub integration then shows commits, PRs and builds on the ticket.',
        },
        {
          q: 'What makes a good bug ticket?',
          a: 'Clear title, steps to reproduce, expected vs actual result, environment and version, logs/screenshots or request ID, and severity/impact.',
        },
        {
          q: 'What does a burndown chart show?',
          a: 'Remaining work in the sprint over time. Ideally it trends down to zero by the end; a flat or rising line shows blocked work or scope added mid-sprint.',
        },
      ],
      spoken: `"I've used Jira for sprint planning and daily tracking. Work is organised as epics broken into stories, tasks and bugs, each with acceptance criteria and story points. I put the ticket key in my branch name and PR title, so the Jira ticket automatically shows the linked PR and build status. I keep my tickets updated on the board and add short comments on decisions or blockers, so the PO doesn't need to ask. When I log bugs I include steps to reproduce, expected versus actual, the environment and a request ID for the logs."`,
      mistakes: [
        'Not updating ticket status, so the board shows a false picture.',
        'Vague bug reports like "checkout broken" with no steps or environment.',
        'Making stories so big they cannot finish in one sprint. Split them by user value.',
        'Follow-up trap: "Story vs task — when is something a story?" If a user or customer gets value from it on its own, it is a story; if it is internal technical work (upgrade, refactor, CI setup), it is a task.',
      ],
      takeaway: 'Jira turns work into trackable issues — keep tickets updated, link them to your code, and write bugs others can reproduce.',
    },
    {
      id: 'git-merge-vs-rebase',
      title: 'Git Merge vs Rebase',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Merge joins two histories with a merge commit and keeps everything as it was. Rebase replays your commits on top of another branch for a straight, linear history — but rewrites hashes.',
      what: `Both commands bring changes from one branch into another. They differ in **how the history looks**.

- **Merge** (\`git merge main\`) — creates a new **merge commit** that ties the two branches together. Nothing is rewritten. History shows exactly what happened, including the branching.
- **Rebase** (\`git rebase main\`) — takes your commits, and **replays** them one by one on top of the latest \`main\`, as if you had started your branch from there. History becomes a **straight line**. Your commits get **new hashes**.

The golden rule: **never rebase commits that others have already pulled** (shared/public branches like \`main\`). Rebasing your own feature branch before merging is fine.

#### Deeper version
**Fast-forward merge:** if \`main\` has no new commits since you branched, Git just moves the \`main\` pointer forward — no merge commit. \`--no-ff\` forces a merge commit anyway.

**Interactive rebase** (\`git rebase -i HEAD~4\`) lets you clean up your own commits before a PR: \`squash\`/\`fixup\` (combine), \`reword\` (change message), \`drop\`, reorder. (Interactive rebasing opens an editor, so it is used locally.)

After rebasing a branch you already pushed, you must force-push. Use \`git push --force-with-lease\`, which refuses to overwrite the remote if someone else pushed in the meantime (plain \`--force\` would silently delete their work).

\`git pull --rebase\` rebases your local commits on top of the remote instead of creating "Merge branch 'main' of ..." commits. Many teams set \`git config pull.rebase true\`.

Trade-offs:
- Merge: safe, true history, but noisy graph with many merge commits.
- Rebase: clean linear history, easier \`git log\` and \`git bisect\`, but rewrites history and you may resolve the same conflict several times (once per commit).`,
      why: `Teams need a consistent way to integrate work. Knowing when to merge and when to rebase keeps history readable without the danger of rewriting commits other people depend on. It is one of the most common Git interview questions.`,
      analogy: `Merging is like two rivers joining: you can still see both rivers on the map and the point where they meet. Rebasing is like rewriting your travel diary as if you left home a day later — the story is neater, but the dates in it are no longer the original ones, so do not do it to a diary others have already copied.`,
      code: [
        {
          title: 'Merge vs rebase on the same branch',
          lang: 'bash',
          code: `# main:     A---B---C
# feature:       \\---D---E

# Option 1: merge main into feature
git switch feature
git merge main
# feature:  A---B---C-------M      (M = merge commit)
#                \\---D---E--/

# Option 2: rebase feature onto main
git switch feature
git rebase main
# feature:  A---B---C---D'---E'    (D' and E' are new commits with new hashes)
git push --force-with-lease`,
        },
        {
          title: 'Clean up your commits before a PR',
          lang: 'bash',
          code: `git rebase -i HEAD~3
# Editor opens:
# pick 1a2b3c feat(cart): add coupon model
# fixup 4d5e6f fix typo
# fixup 7a8b9c address review comments
# -> result: one clean commit "feat(cart): add coupon model"

git config --global pull.rebase true   # pull = fetch + rebase`,
        },
      ],
      output: `With **merge**, your commits D and E keep their hashes and a merge commit M joins the histories. With **rebase**, D and E are replayed after C as new commits D' and E', and the history is a straight line — then you force-push safely with \`--force-with-lease\`.

The interactive rebase turns three messy commits ("fix typo", "address review comments") into one clean commit before review. (In the comments, the backslash characters just draw the branch lines.)`,
      questions: [
        {
          q: 'What is the difference between merge and rebase?',
          a: 'Merge combines branches with a merge commit and keeps history unchanged. Rebase replays your commits on top of another branch, creating new commits and a linear history.',
        },
        {
          q: 'When should you not rebase?',
          a: 'On shared or public branches that others have pulled, like main or a shared feature branch. Rewriting those commits breaks other people\'s history.',
        },
        {
          q: 'What is the difference between --force and --force-with-lease?',
          a: '`--force` overwrites the remote branch no matter what. `--force-with-lease` only overwrites it if it still matches what you last fetched, so you do not delete a teammate\'s new commits.',
        },
        {
          q: 'What is a fast-forward merge?',
          a: 'When the target branch has no new commits, Git just moves its pointer forward to your latest commit. No merge commit is created.',
        },
        {
          q: 'What is interactive rebase used for?',
          a: 'Editing your own local history: squashing, rewording, reordering or dropping commits — usually to clean up a branch before opening or merging a PR.',
        },
      ],
      spoken: `"Merge and rebase both integrate changes, but differently. Merge creates a merge commit and keeps the real history exactly as it happened. Rebase replays my commits on top of the latest main, giving a clean linear history, but it rewrites commit hashes. So my rule is: I rebase my own feature branch to keep it up to date and clean — sometimes with an interactive rebase to squash fixup commits — and then force-push with force-with-lease. I never rebase shared branches like main. On GitHub we usually squash-merge PRs, so main stays linear anyway."`,
      mistakes: [
        'Rebasing `main` or a branch teammates are using, then force-pushing over their work.',
        'Using `git push --force` instead of `--force-with-lease`.',
        'Thinking rebase "loses" commits. It creates new copies; the old ones are still reachable through `git reflog` for a while.',
        'Follow-up trap: "Why might rebase make you solve the same conflict several times?" Because it replays each commit separately. `git rerere` (reuse recorded resolution) can remember and reapply your resolutions.',
      ],
      takeaway: 'Merge keeps true history, rebase makes it linear by rewriting your commits — rebase your own branch, never a shared one.',
    },
    {
      id: 'git-revert-reset',
      title: 'Git Revert vs Reset (soft, mixed, hard)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'revert adds a new commit that undoes an old one — safe for shared branches. reset moves the branch pointer back: --soft keeps changes staged, --mixed keeps them unstaged, --hard deletes them.',
      what: `Two ways to "undo" commits:

**\`git revert <commit>\`** — creates a **new commit** that does the opposite of the old one. History is **not** rewritten. Safe on shared branches like \`main\`. This is how you undo a bad deploy.

**\`git reset <commit>\`** — moves your **branch pointer back** to an older commit, as if later commits never happened. It **rewrites history**, so use it only on local/unshared work. Three modes:

- \`--soft\` — move back; the undone changes stay **staged**. Good for "redo my last commit message" or "combine my last 3 commits into one".
- \`--mixed\` (default) — move back; changes stay in your files but **unstaged**.
- \`--hard\` — move back and **throw away** the changes in your files. Dangerous.

#### Deeper version
Think of three areas: **HEAD/branch** (commits), **index** (staging), **working directory** (files):
- \`--soft\` changes only the branch pointer.
- \`--mixed\` changes the pointer and the index.
- \`--hard\` changes the pointer, the index and the working directory.

Related commands:
- \`git restore file\` — discard uncommitted changes in a file. \`git restore --staged file\` — unstage it.
- \`git commit --amend\` — change the last commit (message or content). Also rewrites history.
- Reverting a **merge commit** needs \`-m 1\` to say which parent is the "mainline": \`git revert -m 1 <merge-sha>\`. Note: if you later want to bring that branch back, you must "revert the revert", because Git thinks those commits are already merged.

Even after \`reset --hard\`, committed work can usually be recovered with \`git reflog\` (see the reflog topic). **Uncommitted** changes lost with \`--hard\` cannot be recovered by Git.`,
      why: `Everyone makes mistakes: a broken commit on main, a commit on the wrong branch, a secret committed by accident. Choosing revert vs reset correctly means you fix the mistake without breaking teammates' history or losing work.`,
      analogy: `Revert is like publishing a correction in tomorrow's newspaper: yesterday's paper still exists, but the correction cancels the mistake. Reset is like pulling yesterday's paper from the shelves and pretending it was never printed — fine if nobody bought a copy yet, a disaster if they did.`,
      code: [
        {
          title: 'Undo a bad commit on main (shared) — revert',
          lang: 'bash',
          code: `git log --oneline
# 9c1d2e3 feat: new pricing (broke checkout!)
# 4b5a6f7 fix: header alignment

git revert 9c1d2e3          # creates "Revert 'feat: new pricing'"
git push                    # normal push, no history rewrite

git revert -m 1 <merge-sha> # reverting a merge commit`,
        },
        {
          title: 'Fix local, unpushed commits — reset',
          lang: 'bash',
          code: `# Combine my last 3 local commits into one
git reset --soft HEAD~3     # changes stay staged
git commit -m "feat(cart): coupon codes"

# Undo last commit but keep the edits to re-stage selectively
git reset HEAD~1            # same as --mixed

# Throw away everything since the last commit (careful!)
git reset --hard HEAD

# Committed on main by mistake (not pushed): move it to a branch
git switch -c feature/coupons   # new branch keeps the commit
git switch main
git reset --hard origin/main    # main back to the remote state`,
        },
      ],
      output: `\`git revert 9c1d2e3\` adds a new commit that removes the pricing change. The bad commit stays in history, teammates just pull normally, and you can see exactly what was undone and when.

\`reset --soft HEAD~3\` moves the branch back three commits but keeps all their changes staged, so one \`git commit\` turns them into a single commit. \`reset HEAD~1\` (mixed) keeps the edits in your files but unstaged. The last example rescues a commit made on \`main\` by mistake: the new branch still points to it, and \`main\` is reset to match the remote.`,
      questions: [
        {
          q: 'What is the difference between git revert and git reset?',
          a: '`revert` makes a new commit that undoes a previous one, without rewriting history — safe for shared branches. `reset` moves the branch pointer back and rewrites history — only for local, unpushed work.',
        },
        {
          q: 'Explain reset --soft, --mixed and --hard.',
          a: 'All move the branch back. `--soft` keeps changes staged. `--mixed` (default) keeps them in files but unstaged. `--hard` discards them from staging and files.',
        },
        {
          q: 'A bad commit is already on main and deployed. What do you do?',
          a: 'Use `git revert` on that commit, push, and let CI deploy the revert. Do not reset and force-push main.',
        },
        {
          q: 'You ran git reset --hard by mistake. Can you get the commits back?',
          a: 'Yes, if they were committed: find the old commit in `git reflog` and `git reset --hard <sha>` or create a branch at it. Uncommitted changes are gone.',
        },
      ],
      spoken: `"Revert and reset both undo things, but very differently. git revert creates a new commit that does the opposite of an old commit, so history isn't rewritten — that's what I use on main or any shared branch, for example to roll back a bad deploy. git reset moves the branch pointer back and rewrites history, so I only use it on my own local commits. Soft keeps the changes staged, which I use to squash my last few commits; mixed, the default, keeps them unstaged; and hard throws them away. If I reset hard by mistake, I can usually recover committed work with git reflog."`,
      mistakes: [
        'Using `git reset --hard` and force-pushing on main to undo a deployed commit. Use `git revert`.',
        'Running `reset --hard` with uncommitted work you wanted to keep. Stash or commit first.',
        'Thinking revert deletes the commit. It adds a new opposite commit; the original stays in history.',
        'Follow-up trap: "You committed an API key and pushed it. Is git revert enough?" No — the key is still in history. Rotate (revoke) the key immediately; then remove it from history with a tool like git filter-repo if needed.',
      ],
      takeaway: 'Shared history? revert. Local unpushed history? reset — soft keeps staged, mixed keeps files, hard deletes.',
    },
    {
      id: 'git-stash-cherry-pick',
      title: 'Git Stash and Cherry-pick',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'stash puts unfinished changes on a shelf so you can switch tasks; cherry-pick copies one specific commit from another branch onto yours.',
      what: `**\`git stash\`** saves your uncommitted changes in a temporary storage area and gives you a clean working directory. Later you bring them back.

Typical use: you are in the middle of a feature and an urgent bug comes in. Stash, switch branch, fix the bug, come back, unstash.

- \`git stash push -m "wip coupons"\` — save (add \`-u\` to include new untracked files).
- \`git stash list\` — see all stashes.
- \`git stash pop\` — re-apply the latest and remove it from the list.
- \`git stash apply stash@{1}\` — re-apply but keep it in the list.
- \`git stash drop\` — delete one.

**\`git cherry-pick <sha>\`** takes **one commit** from anywhere and applies a copy of it to your current branch.

Typical use: a bug fix was committed on \`develop\`, and you need **only that fix** on the \`release\` branch, not all the other unfinished work.

#### Deeper version
Stash details:
- By default stash does **not** include untracked (new) files — use \`-u\`, or \`-a\` to include ignored files too.
- \`git stash pop\` can conflict; if it does, the stash is **kept** so you do not lose it. Resolve and then \`git stash drop\`.
- \`git stash branch new-branch\` creates a branch from the commit where you stashed and applies the stash there — useful when the original branch moved a lot.
- Stashes are local only and easy to forget. For anything longer than a few hours, a "WIP" commit on a branch is safer.

Cherry-pick details:
- The new commit has a **different hash** (it is a copy with a new parent).
- \`git cherry-pick A..B\` picks a range (excluding A); \`-x\` adds "(cherry picked from commit ...)" to the message, which helps tracking.
- Conflicts are resolved like a rebase: fix, \`git add\`, \`git cherry-pick --continue\` (or \`--abort\`).
- Overusing cherry-pick creates duplicate commits on different branches and confusing history. Prefer merging the fix branch when possible; cherry-pick is best for hotfixes and backports.`,
      why: `Real work is full of interruptions and multiple release lines. Stash lets you switch context without making messy half-commits. Cherry-pick lets you ship one urgent fix to production or an older version without dragging along unrelated, untested changes.`,
      analogy: `Stash is like putting your half-finished puzzle into a box so you can use the table for dinner, then taking it out again later. Cherry-pick is like copying one recipe from a friend's cookbook into yours, instead of taking the whole book.`,
      code: [
        {
          title: 'Stash for an urgent fix',
          lang: 'bash',
          code: `# Working on feature/coupons, files are half-done
git stash push -u -m "wip: coupon UI"
git switch main && git pull
git switch -c hotfix/login-crash
# ...fix, commit, push, open PR...

git switch feature/coupons
git stash list               # stash@{0}: On feature/coupons: wip: coupon UI
git stash pop                # changes are back, stash removed`,
        },
        {
          title: 'Cherry-pick a fix onto a release branch',
          lang: 'bash',
          code: `git log develop --oneline
# a1b2c3d fix(payments): handle 3DS timeout   <- need this in release
# e4f5a6b feat: new dashboard (not ready)

git switch release/2.4
git cherry-pick -x a1b2c3d
# On conflict: fix files, then
#   git add . && git cherry-pick --continue
git push`,
        },
      ],
      output: `In the stash example, your unfinished coupon work (including new files, thanks to \`-u\`) is safely shelved, the working directory is clean for the hotfix, and \`git stash pop\` brings everything back exactly as it was.

In the cherry-pick example, only the 3DS timeout fix is copied to \`release/2.4\`; the unfinished dashboard stays on \`develop\`. The new commit has a different hash, and \`-x\` adds a line pointing to the original commit, so it is easy to trace.`,
      questions: [
        {
          q: 'What does git stash do?',
          a: 'It saves uncommitted changes to a local stack and cleans your working directory, so you can switch branches. `git stash pop` or `apply` brings them back.',
        },
        {
          q: 'stash pop vs stash apply?',
          a: '`pop` applies the stash and removes it from the list (unless there is a conflict). `apply` applies it but keeps it, so you can reuse it.',
        },
        {
          q: 'What is cherry-pick and when do you use it?',
          a: 'It copies a specific commit onto the current branch. Use it for hotfixes and backports — getting one fix to a release branch without other changes.',
        },
        {
          q: 'Why are untracked files not stashed?',
          a: 'By default stash only saves tracked files. Use `git stash -u` to include untracked files, or `-a` to also include ignored ones.',
        },
      ],
      spoken: `"I use git stash when I need to switch context quickly — for example an urgent bug comes in while my feature is half-done. I stash with dash u so new files are included, fix the bug on its own branch, then come back and pop the stash. For anything longer I prefer a WIP commit, because stashes are easy to forget. I use cherry-pick to copy one specific commit to another branch, mostly for hotfixes or backports to a release branch. I add dash x so the message records the original commit, and I avoid overusing it because it duplicates commits."`,
      mistakes: [
        'Forgetting `-u`, then finding new files were not stashed and got mixed into the other branch.',
        'Keeping many old unnamed stashes for weeks. Name them (`-m`) and clean up, or use WIP commits.',
        'Cherry-picking a commit that depends on other commits that are not on the target branch, causing broken builds.',
        'Follow-up trap: "If you cherry-pick a fix and later merge the full branch, do you get the fix twice?" Git usually sees the change is already there and merges cleanly, but you will have two commits with different hashes for the same change — and conflicts are possible if the code changed around it.',
      ],
      takeaway: 'Stash = temporary shelf for unfinished work; cherry-pick = copy one commit to another branch — great for hotfixes, not for daily merging.',
    },
    {
      id: 'git-branching-strategies',
      title: 'Branching Strategies: Git Flow vs GitHub Flow vs Trunk-Based',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Git Flow uses long-lived develop and release branches; GitHub Flow uses short feature branches off main; trunk-based merges tiny changes into main daily, often behind feature flags.',
      what: `A **branching strategy** is the team's agreement on which branches exist and how code moves to production.

**1. Git Flow** (more formal):
- \`main\` — production releases only.
- \`develop\` — integration branch for the next release.
- \`feature/*\` from develop, \`release/*\` to stabilise a release, \`hotfix/*\` from main for urgent fixes.
- Good for software with **scheduled versioned releases** (mobile apps, desktop apps, libraries supporting old versions).

**2. GitHub Flow** (simple):
- Only \`main\` + short-lived \`feature\` branches.
- Open a PR, review, merge into main, deploy main.
- Great for web apps that deploy often.

**3. Trunk-based development**:
- Everyone merges **small** changes into \`main\` (the "trunk") at least daily.
- Branches live hours, not weeks.
- Unfinished features are hidden behind **feature flags**.
- Needs strong CI and good test coverage.

#### Deeper version
**Feature flags** (toggles) separate **deploy** from **release**: the code is in production but switched off, and you turn it on for internal users, then 10% of users, then everyone. Tools: LaunchDarkly, Unleash, GrowthBook, or a simple config/DB flag. Remember to delete old flags — they become technical debt.

Why many teams move from Git Flow to trunk-based/GitHub Flow: long-lived branches cause big painful merges ("merge hell"), slow feedback and risky "big bang" releases. Research such as the DORA/Accelerate reports links trunk-based development with better delivery performance.

Environments often map to branches or tags: \`main\` → staging automatically, a tag \`v1.4.0\` or a manual approval → production. Preview deployments per PR (Vercel, Netlify) are common with GitHub Flow.

There is no single right answer. Choose based on release style: continuous deployment → GitHub Flow / trunk-based; multiple supported versions → something closer to Git Flow.`,
      why: `Without a clear strategy, teams get long-lived branches, surprise conflicts, and confusion about what is in production. The right strategy makes releases predictable and keeps integration pain low.`,
      analogy: `Git Flow is like publishing a printed book: drafts, an editing stage, a print run, and separate errata for old editions. Trunk-based is like a live blog: small updates go out all day, and unfinished sections are simply hidden until they are ready (feature flags).`,
      code: [
        {
          title: 'GitHub Flow / trunk-based day',
          lang: 'bash',
          code: `git switch main && git pull
git switch -c feat/coupon-api       # short-lived: hours to 1-2 days
# small change + tests, behind a flag if not ready for users
git push -u origin feat/coupon-api
gh pr create --fill                 # CI + review
gh pr merge --squash                # main auto-deploys to staging, then prod`,
        },
        {
          title: 'A simple feature flag',
          lang: 'javascript',
          code: `// flags.js — could also come from LaunchDarkly, Unleash or the database
const flags = {
  newCheckout: { enabled: true, percent: 10, allowUsers: ['internal-qa'] },
};

export function isEnabled(name, user) {
  const f = flags[name];
  if (!f || !f.enabled) return false;
  if (f.allowUsers.includes(user.id)) return true;
  // stable bucket: same user always gets the same answer
  const bucket = [...user.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 100;
  return bucket < f.percent;
}

// usage in a route or component
// if (isEnabled('newCheckout', req.user)) return newCheckout(req, res);
// return oldCheckout(req, res);`,
        },
      ],
      output: `In the first example, a developer creates a short branch, opens a PR the same day, and squash-merges into \`main\`, which deploys automatically — the GitHub Flow / trunk-based rhythm.

In the flag example, the new checkout code is already deployed but only QA users and about 10% of other users see it. The bucket is based on the user ID, so the same user always gets the same experience. If something goes wrong, you set \`enabled: false\` — no redeploy or Git revert needed.`,
      questions: [
        {
          q: 'Git Flow vs trunk-based development?',
          a: 'Git Flow uses long-lived develop and release branches with planned releases. Trunk-based development merges small changes into main at least daily, uses feature flags for unfinished work, and relies on strong CI.',
        },
        {
          q: 'Which strategy would you use for a SaaS web app?',
          a: 'GitHub Flow or trunk-based: short-lived branches, PRs into main, automatic deploys, and feature flags. Git Flow adds overhead that continuous deployment does not need.',
        },
        {
          q: 'What are feature flags and why use them?',
          a: 'Runtime switches that turn features on or off without deploying. They let you merge unfinished work safely, roll out gradually, A/B test, and turn off a broken feature instantly.',
        },
        {
          q: 'How do you handle a hotfix in GitHub Flow?',
          a: 'Branch from main, fix with a test, fast-tracked PR and review, merge, and deploy. In Git Flow, you branch `hotfix/*` from main and merge it back into both main and develop.',
        },
      ],
      spoken: `"It depends on how the product ships. For the web apps I've worked on, we used GitHub Flow, close to trunk-based: short-lived feature branches off main, small PRs with CI and review, squash-merge, and main deploys automatically to staging and then production. Unfinished features go behind feature flags, so we can merge early and roll out gradually. Git Flow, with develop, release and hotfix branches, makes more sense for versioned releases like mobile apps or libraries. Long-lived branches are the main thing I try to avoid, because they cause painful merges."`,
      mistakes: [
        'Using full Git Flow for a small web team that deploys daily — lots of ceremony for no benefit.',
        'Feature branches that live for weeks and end in a huge, risky merge.',
        'Never removing old feature flags, so the code fills with dead branches of logic.',
        'Follow-up trap: "Doesn\'t trunk-based mean pushing directly to main without review?" Not necessarily. Most teams still use very short-lived branches with quick PR reviews and required CI; the key is small, frequent merges.',
      ],
      takeaway: 'Ship continuously? Short branches into main plus feature flags. Ship versions? Git Flow-style release branches.',
    },
    {
      id: 'husky-lint-staged',
      title: 'Git Hooks with Husky and lint-staged',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Git hooks run scripts at moments like pre-commit. Husky shares hooks through the repo; lint-staged runs ESLint and Prettier only on the files you are committing.',
      what: `A **Git hook** is a script Git runs automatically at certain moments:
- \`pre-commit\` — before a commit is created (lint, format).
- \`commit-msg\` — check the commit message (commitlint).
- \`pre-push\` — before pushing (run tests or type-check).

Hooks normally live in \`.git/hooks\`, which is **not** committed, so a team cannot share them easily.

**Husky** fixes this: hooks live in a committed \`.husky/\` folder and are installed automatically when someone runs \`npm install\` (through the \`prepare\` script).

**lint-staged** runs commands only on **staged files** (the ones in this commit), not the whole project. So the pre-commit hook takes seconds, not minutes.

#### Deeper version
Setup (Husky v9 style; older versions used \`husky install\` and different file headers — check the docs for your version):
1. \`npm install -D husky lint-staged\`
2. \`npx husky init\` — creates \`.husky/pre-commit\` and adds \`"prepare": "husky"\` to package.json.
3. Put \`npx lint-staged\` in \`.husky/pre-commit\`.
4. Configure lint-staged in package.json.

lint-staged also re-stages files that were fixed (e.g. Prettier rewrites them), so the fixed version is what gets committed.

Important: hooks are a **convenience, not security**. Anyone can skip them with \`git commit --no-verify\`, and they do not run for edits made in the GitHub web UI. **CI must run the same checks** as the final gate.

Keep hooks fast: lint and format in \`pre-commit\`; slower things (full tests, type-check of the whole project) in \`pre-push\` or only in CI. Slow hooks make people use \`--no-verify\` all the time.

Alternatives: lefthook, simple-git-hooks, or the pre-commit framework (Python ecosystem).`,
      why: `Catching lint errors, formatting issues and bad commit messages **before** they reach a PR saves review time and failed CI runs. Husky makes sure every developer on the team has the same hooks without manual setup.`,
      analogy: `A pre-commit hook is like a spell-checker that runs when you press "Send" on an email. lint-staged means it only checks the email you are sending, not your whole mailbox. And CI is the company mail server that checks again, in case someone turned off their spell-checker.`,
      code: [
        {
          title: 'Setup commands and hook files',
          lang: 'bash',
          code: `npm install -D husky lint-staged
npx husky init                       # creates .husky/ and the "prepare" script

# .husky/pre-commit
echo "npx lint-staged" > .husky/pre-commit

# .husky/commit-msg (with commitlint installed)
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg

# .husky/pre-push (slower checks)
echo "npm run typecheck && npm test -- --onlyChanged" > .husky/pre-push`,
        },
        {
          title: 'lint-staged config in package.json',
          lang: 'json',
          code: `{
  "scripts": {
    "prepare": "husky",
    "typecheck": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{json,md,css,yml}": "prettier --write"
  }
}`,
        },
      ],
      output: `When a developer runs \`git commit\`:
1. The \`pre-commit\` hook runs lint-staged.
2. lint-staged runs ESLint with \`--fix\` and Prettier only on the staged JS/TS files, and Prettier on staged JSON/MD/CSS/YAML.
3. If ESLint still finds an error, the commit is **blocked** and the error is shown. Fixed files are re-staged automatically.
4. The \`commit-msg\` hook checks the message format.

On \`git push\`, the type-check and tests related to changed files run. New team members get all hooks automatically after \`npm install\` because of the \`prepare\` script.`,
      questions: [
        {
          q: 'What are Git hooks?',
          a: 'Scripts Git runs at certain events, like pre-commit, commit-msg and pre-push. They can block the action if the script fails.',
        },
        {
          q: 'Why use Husky instead of plain .git/hooks?',
          a: '`.git/hooks` is not committed, so it cannot be shared. Husky stores hooks in the repo and installs them automatically via the `prepare` script.',
        },
        {
          q: 'What does lint-staged do?',
          a: 'Runs linters and formatters only on files staged for the current commit, which keeps pre-commit hooks fast, and re-stages any auto-fixed files.',
        },
        {
          q: 'If you have hooks, do you still need lint in CI?',
          a: 'Yes. Hooks can be skipped with `--no-verify` and do not run for web edits or some tools. CI is the real gate.',
        },
      ],
      spoken: `"I use Husky to share Git hooks through the repo, so everyone gets them automatically after npm install. The pre-commit hook runs lint-staged, which runs ESLint with fix and Prettier only on the staged files, so it takes a couple of seconds. A commit-msg hook runs commitlint for Conventional Commits, and pre-push runs a type-check and related tests. I keep hooks fast, otherwise people bypass them with no-verify. And I treat hooks as a convenience — CI runs the same checks again, because hooks can always be skipped."`,
      mistakes: [
        'Running the whole test suite in pre-commit. It is slow and people start using `--no-verify`.',
        'Relying on hooks as the only quality gate. They are easy to skip; CI must repeat the checks.',
        'Forgetting the `prepare` script, so new developers never get the hooks installed.',
        'Follow-up trap: "lint-staged ran ESLint on one file — can it miss errors?" Yes, for cross-file problems like a type error caused in another file. That is why a full type-check runs in pre-push or CI.',
      ],
      takeaway: 'Husky shares hooks, lint-staged keeps them fast by checking only staged files — and CI repeats everything as the real gate.',
    },
    {
      id: 'npm-yarn-pnpm',
      title: 'npm vs Yarn vs pnpm',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'All three install packages from the npm registry. npm ships with Node; Yarn added speed and workspaces early; pnpm saves disk space with a shared store and a strict node_modules.',
      what: `All three are **package managers**: they read \`package.json\`, download packages from the npm registry, and create \`node_modules\` and a lock file.

- **npm** — comes with Node. Lock file: \`package-lock.json\`. Has workspaces (v7+). The safe default.
- **Yarn** — created by Facebook to be faster and more reliable than old npm. Lock file: \`yarn.lock\`. **Yarn Classic (v1)** works like npm with \`node_modules\`. **Yarn Berry (v2+)** adds Plug'n'Play (no \`node_modules\` folder by default) and other changes.
- **pnpm** — "performant npm". Lock file: \`pnpm-lock.yaml\`. Stores every package version **once** on disk in a global content-addressable store and **links** it into projects. Very fast and saves a lot of disk space. Excellent workspace (monorepo) support.

#### Deeper version
**How pnpm's \`node_modules\` is different:** npm and Yarn Classic "hoist" (flatten) packages to the top of \`node_modules\`. This means your code can accidentally import a package you never listed in \`package.json\` — a **phantom dependency** — because some other package installed it. It works until that other package changes.

pnpm creates a **strict** structure: only your direct dependencies are at the top level; everything else is linked inside \`node_modules/.pnpm\`. Phantom dependencies fail immediately. (Some old tools expect a flat layout; pnpm has settings like \`node-linker=hoisted\` for those.)

**Corepack** (bundled with Node versions for some time; check your Node version, as its bundling status has been changing) can pin the package manager version with the \`"packageManager"\` field in \`package.json\`, so everyone uses the same one.

Command mapping:
- install all: \`npm ci\` / \`yarn install --frozen-lockfile\` (Classic) or \`--immutable\` (Berry) / \`pnpm install --frozen-lockfile\`
- add: \`npm i x\` / \`yarn add x\` / \`pnpm add x\`
- run script: \`npm run dev\` / \`yarn dev\` / \`pnpm dev\`
- one-off binary: \`npx\` / \`yarn dlx\` / \`pnpm dlx\`

**Rule:** one package manager per project, and commit only **its** lock file.`,
      why: `Package managers affect install speed in CI, disk usage on laptops, and correctness (phantom dependencies). In monorepos the choice matters even more. Interviewers want to hear trade-offs, not "X is the best".`,
      analogy: `npm and Yarn give every project its own full set of books (copies in each \`node_modules\`). pnpm builds one central library on your computer and gives each project a shelf of shortcuts to it — and it only puts the books you actually asked for on your shelf, so you cannot accidentally read a book you never borrowed.`,
      code: [
        {
          title: 'Same tasks in all three',
          lang: 'bash',
          code: `# install exactly from the lock file (CI)
npm ci
yarn install --frozen-lockfile     # Yarn Classic; Berry uses --immutable
pnpm install --frozen-lockfile

# add a dependency / dev dependency
npm install zod        && npm install -D vitest
yarn add zod           && yarn add -D vitest
pnpm add zod           && pnpm add -D vitest

# run a script and a one-off tool
npm run build   && npx prisma generate
yarn build      && yarn dlx prisma generate
pnpm build      && pnpm dlx prisma generate`,
        },
        {
          title: 'Pin the package manager',
          lang: 'json',
          code: `{
  "name": "shop",
  "packageManager": "pnpm@9.12.0",
  "engines": { "node": ">=20" }
}`,
        },
      ],
      output: `All three do the same jobs with slightly different commands. In CI you always use the "frozen/immutable" install so the lock file is never changed silently.

With \`"packageManager"\` set (and Corepack enabled), running \`yarn\` or \`npm\` by mistake in this project gives a warning or error, and everyone uses pnpm 9.12.0. \`engines\` documents the required Node version.`,
      questions: [
        {
          q: 'npm vs Yarn vs pnpm — what are the main differences?',
          a: 'npm is the default with Node. Yarn was faster early and has different modes (Classic, and Berry with Plug\'n\'Play). pnpm uses a global content-addressable store with links, so it is fast and saves disk, and it has a strict node_modules that prevents phantom dependencies.',
        },
        {
          q: 'What is a phantom dependency?',
          a: 'A package your code imports but that is not in your package.json. It only works because another package installed it and npm hoisted it. pnpm\'s strict layout blocks this.',
        },
        {
          q: 'Can you mix package managers in one project?',
          a: 'You should not. Each has its own lock file and resolution; mixing them causes different installs. Pick one, commit its lock file, and pin it with the `packageManager` field.',
        },
        {
          q: 'Why is pnpm popular for monorepos?',
          a: 'Shared store saves space when many packages use the same dependencies, installs are fast, workspace support is strong (`workspace:*` protocol, filtering like `pnpm --filter web build`), and strictness catches missing dependencies.',
        },
      ],
      spoken: `"All three install from the same npm registry; the differences are speed, disk usage and how node_modules is built. npm ships with Node and is the safe default. Yarn pushed speed and workspaces early, and Yarn Berry adds Plug'n'Play. pnpm stores every version once in a global store and links it into projects, so it's fast and uses much less disk, and its strict node_modules stops phantom dependencies — importing something you never declared. For monorepos I like pnpm workspaces. Whatever we choose, I keep one package manager per repo, commit its lock file, and pin it with the packageManager field."`,
      mistakes: [
        'Committing both `package-lock.json` and `yarn.lock` or `pnpm-lock.yaml`.',
        'Importing a package that is not in `package.json` because it "just works" — a phantom dependency that breaks later.',
        'Saying "pnpm is always better" without trade-offs (some tools expect a flat node_modules).',
        'Follow-up trap: "What is npx?" It runs a package binary — from local node_modules or downloaded temporarily — without installing it globally, like `npx create-next-app`.',
      ],
      takeaway: 'Same registry, different installers: npm is default, pnpm is fast and strict, Yarn has its own modes — pick one per repo and commit its lock file.',
    },
    {
      id: 'vite-vs-webpack',
      title: 'Vite vs Webpack (bundlers and dev servers)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Webpack bundles everything before serving, even in dev. Vite serves native ES modules in dev (very fast start and HMR) and uses a bundler for production builds.',
      what: `A browser app has hundreds of files: JS/TS, JSX, CSS, images, packages from \`node_modules\`. A **bundler** turns them into a few optimised files for the browser. It also runs a **dev server** with **HMR** (Hot Module Replacement — update the page without a full reload).

**Webpack**:
- The long-time standard (Create React App used it; Next.js historically used it).
- In dev, it **bundles the whole app first**, then serves it. Big apps can take a long time to start.
- Extremely configurable with **loaders** (transform files, e.g. \`babel-loader\`, \`css-loader\`) and **plugins**. Supports Module Federation (micro-frontends).

**Vite**:
- In dev, it does **not bundle your code**. The browser loads files as native **ES modules**, and Vite transforms each file on request. Dependencies from \`node_modules\` are pre-bundled once with **esbuild** (very fast, written in Go).
- Result: dev server starts almost instantly and HMR stays fast as the app grows.
- For production it bundles with **Rollup** (tree-shaking, code splitting). Newer Vite versions are moving to **Rolldown**, a Rust-based bundler — check the docs for your version.
- Simple config, sensible defaults. The default for many new React projects (CRA is deprecated).

#### Deeper version
Why not serve unbundled code in production too? Hundreds of separate module requests and deep import chains are slow on real networks, and production needs minification, tree-shaking, code splitting and hashed file names for caching. So Vite uses a different strategy for dev (speed) and prod (optimised output). A rare downside: small dev/prod differences can appear, so always test the production build (\`vite build && vite preview\`).

Key bundler concepts interviewers ask about:
- **Tree-shaking** — removing unused exports (works best with ES modules).
- **Code splitting** — splitting into chunks loaded on demand (\`import()\`, \`React.lazy\`).
- **Content hashing** — \`app.3f9a1c.js\` so browsers can cache files forever and fetch new ones after a deploy.
- **Source maps** — map minified code back to the original for debugging.
- **Environment variables** — Vite exposes only variables prefixed \`VITE_\` via \`import.meta.env\`; Webpack apps often use \`process.env\` with DefinePlugin. Anything exposed to the browser is public — never put secrets there.

Others: **Turbopack** (Rust, by Vercel, used in Next.js dev and increasingly builds), **Rspack** (Rust, Webpack-compatible), **esbuild**, **Parcel**.`,
      why: `Slow dev servers waste minutes every day for every developer. Bundler output directly affects page load speed for users. Understanding what the bundler does helps you fix slow builds, large bundles and env-variable mistakes.`,
      analogy: `Webpack in dev is a restaurant that cooks the entire menu before opening the doors — opening takes a long time. Vite cooks each dish only when a customer orders it, so the doors open instantly. For a big catering event (production), both prepare everything in advance and pack it neatly.`,
      code: [
        {
          title: 'vite.config.ts',
          lang: 'typescript',
          code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' }, // avoid CORS in dev
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: { manualChunks: { vendor: ['react', 'react-dom'] } },
    },
  },
});

// In app code: only VITE_ variables are exposed (and they are PUBLIC)
// const apiUrl = import.meta.env.VITE_API_URL;`,
        },
        {
          title: 'Equivalent idea in webpack.config.js',
          lang: 'javascript',
          code: `const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.jsx',
  output: { filename: '[name].[contenthash].js', clean: true },
  module: {
    rules: [
      { test: /\\.[jt]sx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
  plugins: [new HtmlWebpackPlugin({ template: './index.html' })],
  devServer: { port: 3000, proxy: [{ context: ['/api'], target: 'http://localhost:4000' }] },
  devtool: 'source-map',
};`,
        },
      ],
      output: `The Vite config is short: the React plugin, a dev proxy so \`/api\` calls go to the Node server on port 4000 without CORS problems, source maps, and a separate \`vendor\` chunk for React so it can be cached separately.

The Webpack config does similar work but you wire up more yourself: Babel for JSX/TS, loaders for CSS, the HTML plugin and content-hashed file names. Webpack's flexibility is powerful, but more config means more to maintain.`,
      questions: [
        {
          q: 'Why is Vite faster than Webpack in development?',
          a: 'Vite serves source files as native ES modules and transforms them on demand, and pre-bundles dependencies with esbuild. Webpack bundles the whole app before serving, which grows slower as the app grows.',
        },
        {
          q: 'What does Vite use for production builds?',
          a: 'Rollup (with newer versions moving to the Rust-based Rolldown). It produces optimised, tree-shaken, code-split bundles.',
        },
        {
          q: 'What is tree-shaking?',
          a: 'Removing unused exports from the final bundle. It relies on static ES module imports/exports, which is why CommonJS code tree-shakes poorly.',
        },
        {
          q: 'How do environment variables work in Vite?',
          a: 'Only variables starting with `VITE_` are exposed to client code through `import.meta.env`. They are embedded in the bundle, so they are public — never put secrets there.',
        },
        {
          q: 'What are Webpack loaders and plugins?',
          a: 'Loaders transform individual files (Babel for JSX, css-loader for CSS). Plugins hook into the whole build process (generate HTML, define env variables, analyse bundles).',
        },
      ],
      spoken: `"Webpack bundles the whole app before it serves anything, even in development, so large apps start slowly. Vite instead serves source files as native ES modules and transforms each one only when the browser requests it, with dependencies pre-bundled by esbuild, so the dev server starts almost instantly and HMR stays fast. For production Vite uses Rollup to produce optimised, tree-shaken, code-split bundles. I use Vite for new React projects because of the speed and simple config. Webpack is still everywhere in older apps and is very flexible with loaders and plugins, including module federation."`,
      mistakes: [
        'Putting secrets in `VITE_` (or `NEXT_PUBLIC_`) variables. Everything in the client bundle is public.',
        'Only testing in dev mode. Always test the production build (`vite build && vite preview`).',
        'Saying "Vite does not bundle". It does not bundle your source in dev, but it does bundle for production.',
        'Follow-up trap: "Your production bundle is huge — what do you check?" Run a bundle analyser, lazy-load routes with `import()`, replace heavy libraries (moment → date-fns/dayjs), import only what you use, and check for duplicate packages.',
      ],
      takeaway: 'Webpack bundles first then serves; Vite serves ES modules on demand in dev and bundles with Rollup for production — fast dev, optimised prod.',
    },
    {
      id: 'babel-transpiling',
      title: 'Babel and Transpiling (with SWC, esbuild and tsc)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Babel converts modern JavaScript, JSX and TypeScript into code that target browsers or Node can run. Presets choose what to convert; polyfills add missing features.',
      what: `**Babel** is a **transpiler** (a source-to-source compiler). It reads modern code and writes out older or plain JavaScript.

It converts things like:
- **JSX** → \`React.createElement(...)\` or the new \`jsx()\` runtime calls.
- **TypeScript** → JavaScript (it just **removes** the types).
- New syntax (optional chaining \`?.\`, class fields) → older syntax for old browsers.

You configure it with **presets** (bundles of plugins):
- \`@babel/preset-env\` — converts syntax based on your target browsers (from \`browserslist\`).
- \`@babel/preset-react\` — JSX.
- \`@babel/preset-typescript\` — TypeScript.

#### Deeper version
**Syntax vs features:** Babel can rewrite **syntax** (arrow functions, \`?.\`), but it cannot create missing **built-in features** (like \`Promise\`, \`Array.prototype.at\`, \`structuredClone\`) — those need **polyfills** (code that adds the feature at runtime), usually from **core-js**. \`preset-env\` with \`useBuiltIns: 'usage'\` adds only the polyfills your code needs.

**Babel does not type-check.** It strips TypeScript types without checking them. Run \`tsc --noEmit\` separately (in CI or the editor) to catch type errors.

How Babel works: **parse** code into an AST (Abstract Syntax Tree, a tree describing the code) → **transform** the AST with plugins → **generate** new code (plus source maps).

Where you still meet Babel: Jest (via \`babel-jest\`), older Webpack/CRA projects, React Native, and custom code transforms. Faster tools now do the same job in many setups:
- **SWC** (Rust) — used by Next.js by default instead of Babel (Next.js falls back to Babel if you add a Babel config).
- **esbuild** (Go) — used by Vite in development and by many build tools.
- **tsc** — the TypeScript compiler: type-checks **and** can emit JS.

**browserslist** (in package.json or \`.browserslistrc\`) is shared by Babel, Autoprefixer and others to decide which browsers to support.`,
      why: `You want to write modern, readable code (JSX, TypeScript, latest syntax) but still run it in every browser your users have and in tools like Jest. Babel and its faster cousins make that possible without you writing old-style code by hand.`,
      analogy: `Babel is a translator. You write a speech in modern slang (new JavaScript and JSX), and the translator rewrites it into formal language every audience understands (older JavaScript). But a translator cannot give the audience new knowledge — if they do not know what a "smartphone" is, you must also hand them a leaflet explaining it (a polyfill).`,
      code: [
        {
          title: 'babel.config.js (e.g. for Jest in a React + TS project)',
          lang: 'javascript',
          code: `module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }], // Jest runs in Node
    ['@babel/preset-react', { runtime: 'automatic' }],     // no "import React" needed
    '@babel/preset-typescript',                             // strips types only!
  ],
};`,
        },
        {
          title: 'What Babel outputs',
          lang: 'jsx',
          code: `// INPUT (modern)
const name = user?.profile?.name ?? 'Guest';
const Hello = () => <h1 className="title">Hi {name}</h1>;

// OUTPUT (roughly, for old targets with the automatic JSX runtime)
// var _user$profile;
// var name = (user === null || user === void 0 ? void 0 :
//   (_user$profile = user.profile) === null || _user$profile === void 0 ? void 0 :
//   _user$profile.name) ?? 'Guest';      // ?? is also rewritten for very old targets
// var Hello = function () {
//   return _jsx("h1", { className: "title", children: ["Hi ", name] });
// };`,
        },
      ],
      output: `With the config above, Jest can run JSX and TypeScript test files: \`preset-env\` targets the current Node version (so very little is converted), \`preset-react\` turns JSX into \`_jsx\` calls automatically, and \`preset-typescript\` removes type annotations.

The second block shows the idea: optional chaining becomes explicit null checks and JSX becomes function calls. The exact output depends on your targets — the more modern the targets, the less Babel changes.`,
      questions: [
        {
          q: 'What is Babel?',
          a: 'A JavaScript transpiler that converts modern syntax, JSX and TypeScript into JavaScript that your target environments can run, using presets and plugins.',
        },
        {
          q: 'What is the difference between transpiling and polyfilling?',
          a: 'Transpiling rewrites syntax at build time (like `?.` or arrow functions). Polyfilling adds missing built-in features at runtime (like `Promise` or `Array.prototype.at`), usually via core-js.',
        },
        {
          q: 'Does Babel check TypeScript types?',
          a: 'No. `@babel/preset-typescript` only removes types. You need `tsc --noEmit` to type-check.',
        },
        {
          q: 'Why do Next.js and Vite not use Babel by default?',
          a: 'Speed. Next.js uses SWC (Rust) and Vite uses esbuild (Go) for transforms, which are many times faster than Babel (JavaScript). Babel is still used when you need a custom Babel plugin.',
        },
      ],
      spoken: `"Babel is a transpiler. It takes modern JavaScript, JSX and TypeScript and turns them into JavaScript that our target browsers or Node can run. Presets decide what gets converted — preset-env uses browserslist targets, preset-react handles JSX and preset-typescript strips types. Two things I keep in mind: Babel only rewrites syntax, so missing features like Promise need polyfills from core-js; and it doesn't type-check, so we run tsc separately. Today I mostly meet Babel in Jest and older Webpack setups — Next.js uses SWC and Vite uses esbuild because they're much faster."`,
      mistakes: [
        'Thinking Babel type-checks TypeScript. Type errors slip into the build unless `tsc --noEmit` runs.',
        'Expecting Babel to add missing APIs like `fetch` or `Promise` in old browsers without polyfills.',
        'Adding a `.babelrc` to a Next.js project by accident, which disables SWC and slows builds.',
        'Follow-up trap: "What is an AST?" An Abstract Syntax Tree — a tree representation of code. Babel, ESLint, Prettier and codemods all parse code into an AST, change or inspect it, and print it back.',
      ],
      takeaway: 'Babel rewrites modern syntax for older targets; polyfills add missing features; tsc does the type-checking — and SWC/esbuild now do the same job faster.',
    },
    {
      id: 'estimation-story-points',
      title: 'Estimation and Story Points',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Story points estimate relative effort, complexity and uncertainty, not hours. Teams use planning poker and the Fibonacci scale, and split anything too big.',
      what: `**Estimation** helps a team decide how much work fits in a sprint and roughly when a feature can ship.

**Story points** measure the **relative size** of a story compared to others — combining **effort**, **complexity** and **uncertainty (risk)**. They are **not hours**.

- Teams often use a Fibonacci-like scale: **1, 2, 3, 5, 8, 13, 21**. The gaps grow because bigger work is less certain.
- Pick a **reference story** ("adding a field to a form = 2") and compare others to it.
- **Planning poker**: everyone shows their number at the same time. If numbers differ a lot (2 vs 8), the highest and lowest explain their thinking. Often someone knows a hidden risk.
- Anything **13 or above** is usually too big — **split** it.

#### Deeper version
Why relative points instead of hours?
- People are better at comparing ("this is about twice that") than predicting absolute time.
- A senior and a junior disagree on hours but often agree on relative size.
- Points include uncertainty; hours pretend to be precise.

**Velocity** = average points completed per sprint (use the last 3-5 sprints). It is for **forecasting** ("about 30 points per sprint, so this 120-point epic is roughly 4 sprints"), not for judging people. Velocity is only comparable **inside one team**.

Splitting stories well: split by **user value** (vertical slices through UI, API and DB), not by layers. "Pay with saved card" and "Pay with new card" are better than "backend for payments" and "frontend for payments".

Other approaches: **T-shirt sizes** (S/M/L/XL) for roadmap-level estimates, **#NoEstimates** (just count similarly-sized items), and giving **ranges with confidence** for deadlines ("2-3 weeks, 80% confident").

When asked "how long will this take?" as an engineer: break it down, list unknowns, give a range, add time for testing/review/deployment, and **update early** when you learn something new.`,
      why: `Without estimates, teams overcommit, miss sprint goals and lose stakeholders' trust. Good estimation exposes risk early ("this needs a Stripe Connect spike first") and makes planning conversations honest.`,
      analogy: `Story points are like describing hikes as "easy, medium, hard" instead of in exact minutes. A fit hiker and a beginner disagree on minutes, but both agree the mountain trail is about three times harder than the park walk. And after a few trips, you know your group usually does about "10 difficulty points" per day — that is velocity.`,
      code: [
        {
          title: 'Breaking down an estimate',
          lang: 'text',
          code: `Story: "Users can pay with a saved card" (SHOP-310)

Reference: "Add phone field to profile" = 2 points

Breakdown & risks:
- API: list saved cards from Stripe customer         small, known
- UI: card picker + default card                     medium
- Handle 3D Secure / authentication_required          UNKNOWN -> risk
- Tests (unit, integration with Stripe mock)          medium
- Review + deploy + QA on staging                      small

Planning poker: 3, 5, 5, 13
-> The 13 voter: "3DS on off-session payments needs a new flow."
-> Decision: 1 spike (timeboxed, 1 day) + story re-estimated after = 5 or 8`,
        },
      ],
      output: `The breakdown makes the hidden work visible: testing, review and the risky 3D Secure flow. Planning poker revealed one person knew about the 3DS complexity; without the discussion, the team would have estimated 5 and been surprised mid-sprint.

The team creates a **spike** — a short, time-boxed research task — to remove the uncertainty, and re-estimates afterwards with better information.`,
      questions: [
        {
          q: 'What are story points?',
          a: 'A relative measure of the size of a story, combining effort, complexity and uncertainty. They are not hours; they are compared against reference stories.',
        },
        {
          q: 'Why use Fibonacci numbers?',
          a: 'The growing gaps show that bigger work has more uncertainty, and they stop pointless debates like 7 vs 8. Large numbers signal that a story should be split.',
        },
        {
          q: 'What is velocity and how should it be used?',
          a: 'The average points a team completes per sprint. It is for forecasting and sprint planning within one team, not for comparing teams or measuring individuals.',
        },
        {
          q: 'What do you do when you realise mid-sprint that your estimate was wrong?',
          a: 'Tell the team and PO early (stand-up), explain what you learned, and agree on options: split the story, cut scope, or move part to the next sprint.',
        },
        {
          q: 'What is a spike?',
          a: 'A time-boxed research or prototype task to reduce uncertainty before estimating or building something, for example trying a new API.',
        },
      ],
      spoken: `"We estimate in story points, which measure relative size — effort, complexity and risk — not hours. We compare against a reference story and use planning poker with Fibonacci numbers. The useful part is the discussion when votes differ: often someone knows a hidden risk, like 3D Secure for saved-card payments. Anything 13 or bigger we split into smaller vertical slices, and if there's a big unknown we do a time-boxed spike first. Velocity helps us forecast, not judge people. And if I discover mid-sprint that something is bigger, I raise it in stand-up right away."`,
      mistakes: [
        'Converting points to hours ("1 point = 4 hours"). Then they are just hours with extra steps.',
        'Using velocity to compare teams or rate individual developers. It encourages point inflation.',
        'Forgetting testing, code review, deployment and edge cases when estimating.',
        'Staying silent when a task is running late, and announcing it on the last day of the sprint.',
        'Follow-up trap: "Your manager asks for an exact date for a big feature. What do you say?" Give a range with a confidence level based on the breakdown and known risks, say what would change it, and update the estimate as the unknowns are resolved.',
      ],
      takeaway: 'Story points are relative size including risk — discuss differences, split big stories, spike unknowns, and raise surprises early.',
    },
    {
      id: 'technical-documentation',
      title: 'Writing Technical Documentation (READMEs, ADRs, Diagrams)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A good README gets a new developer running in minutes; ADRs record why big decisions were made; simple architecture diagrams show how the pieces connect.',
      what: `Documentation is writing that helps other people (and future you) understand and use the code.

Three types every team needs:

**1. README** — the front door of a repo. It should answer:
- What is this project? (one paragraph)
- How do I run it locally? (prerequisites, \`.env\` setup, commands)
- How do I run tests, lint and build?
- How is it deployed? Where are the main folders?

**2. ADR (Architecture Decision Record)** — a short document for **one important decision**: "Use MongoDB for the order service", "Use Stripe Checkout instead of a custom form". It records the **context**, the **decision**, the **options considered**, and the **consequences**.

**3. Architecture diagrams** — boxes and arrows showing how services, databases, queues and third parties connect, and how a request flows.

#### Deeper version
Good documentation habits:
- **Docs as code** — keep docs in the repo (Markdown in \`/docs\`), review them in PRs, update them in the same PR as the code change.
- **ADRs are never edited after acceptance**; if the decision changes, write a new ADR that "supersedes" the old one. This keeps the history of **why**.
- **Diagrams as code** — Mermaid (rendered natively by GitHub in Markdown), PlantUML or Structurizr, so diagrams are versioned and diffable. The **C4 model** gives levels: Context (system + users + external systems), Container (apps, DBs, queues), Component, Code. Usually the first two are enough.
- **API docs** — OpenAPI/Swagger generated from code or schemas, plus example requests (a Postman collection).
- **Runbooks** — step-by-step guides for on-call: "Stripe webhooks failing — check X, then Y".
- **Comments** explain **why**, not what. The code already says what.
- Write for the reader: short sentences, headings, copy-pasteable commands, a "Troubleshooting" section with errors people actually hit.`,
      why: `Without docs, onboarding takes weeks, knowledge lives in one person's head, and the team re-argues old decisions because nobody remembers why they were made. Good docs make teams faster and less dependent on any single person — and writing them clearly is a skill interviewers value for senior roles.`,
      analogy: `A README is the instruction leaflet in a furniture box: what is inside and how to put it together. An ADR is a note in the family recipe book: "We use less sugar since 2023 because Grandpa is diabetic" — so nobody "fixes" the recipe back. A diagram is the map at the entrance of a shopping mall.`,
      code: [
        {
          title: 'README skeleton',
          lang: 'text',
          code: `# Shop API
Node/Express + MongoDB API for orders, payments (Stripe) and coupons.

## Quick start
1. Node 20+, Docker
2. cp .env.example .env        # fill STRIPE_SECRET_KEY (test key), MONGO_URI
3. docker compose up -d mongo
4. npm ci && npm run dev       # http://localhost:4000/health

## Scripts
npm test | npm run lint | npm run build

## Project structure
src/routes  src/services  src/models  src/jobs

## Deployment
Merge to main -> GitHub Actions -> AWS ECS (staging) -> manual approval -> prod

## Troubleshooting
"MongoServerSelectionError" -> is the mongo container running?

## Docs
docs/adr/  docs/architecture.md  docs/runbooks/`,
        },
        {
          title: 'An ADR and a Mermaid diagram',
          lang: 'text',
          code: `# ADR-007: Use Stripe Checkout instead of a custom card form
Status: Accepted (2024-03-12)

## Context
We need card payments quickly. A custom form increases our PCI scope.

## Options
1. Custom form with Stripe Elements - full UI control, more work
2. Stripe Checkout (hosted page) - fast, PCI handled by Stripe, less control

## Decision
Option 2 for launch. Revisit when we need custom upsells in checkout.

## Consequences
+ Live in 1 sprint, minimal PCI scope
- Limited styling; redirect away from our site

---- docs/architecture.md (GitHub renders this) ----
flowchart LR
  User --> Web[React app]
  Web --> API[Express API]
  API --> DB[(MongoDB)]
  API --> Stripe[Stripe]
  Stripe -- webhooks --> API`,
        },
      ],
      output: `The README lets a new developer go from clone to a running API in a few commands, and points to deeper docs. The ADR explains a decision that might look strange later ("why don't we have our own payment form?"), including the trade-offs and when to revisit it.

The Mermaid diagram (inside a \`mermaid\` fenced block in a Markdown file) is drawn by GitHub as boxes and arrows: user → React → API → MongoDB and Stripe, with webhooks coming back. Because it is text, it is updated in the same PR as the code.`,
      questions: [
        {
          q: 'What should a good README contain?',
          a: 'What the project is, how to run it locally (prerequisites, env setup, commands), how to test and build, the folder structure, deployment, troubleshooting, and links to deeper docs.',
        },
        {
          q: 'What is an ADR?',
          a: 'An Architecture Decision Record: a short document capturing one significant decision — context, options, decision and consequences — kept in the repo so the reasoning is not lost.',
        },
        {
          q: 'How do you keep documentation up to date?',
          a: 'Keep it in the repo next to the code, update it in the same PR, include doc checks in the PR template, and generate what you can (OpenAPI, diagrams as code).',
        },
        {
          q: 'How do you draw architecture diagrams?',
          a: 'Start with a C4 context and container view: users, apps, databases, queues and third parties with labelled arrows. Use Mermaid or similar so diagrams are versioned in Git.',
        },
      ],
      spoken: `"I treat docs as code: they live in the repo and get updated in the same PR as the change. Every repo has a README that gets a new developer running in minutes — what it is, env setup, the commands, tests and deployment, plus a troubleshooting section. For important decisions, like choosing Stripe Checkout over a custom form, I write a short ADR with the context, options, decision and trade-offs, so nobody has to guess later. And I keep simple architecture diagrams in Mermaid, mostly C4 context and container level, so they're versioned and easy to update."`,
      mistakes: [
        'A README that only says "npm start", with no env setup, so every new developer asks the same questions.',
        'Docs in a separate wiki that nobody updates when the code changes.',
        'Comments that repeat what the code does instead of explaining why.',
        'Huge diagrams with every class and function. Start with the high-level view.',
        'Follow-up trap: "Who reads ADRs if nobody updates them?" ADRs are not meant to be updated — they are a historical log. When a decision changes, you write a new ADR that supersedes the old one.',
      ],
      takeaway: 'README to get started, ADRs for the why behind decisions, diagrams-as-code for the big picture — all kept in the repo and updated with the code.',
    },
    {
      id: 'debugging-tools',
      title: 'Debugging Tools: Browser DevTools, Node Inspector and VS Code',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Use breakpoints instead of console.log guessing: Chrome DevTools for the frontend (Network, Sources, Performance, React DevTools), node --inspect and VS Code for the backend.',
      what: `**Debugging** is finding out **why** code behaves differently from what you expect. \`console.log\` works, but proper tools are much faster.

**Frontend — Chrome DevTools:**
- **Elements** — inspect HTML and CSS live.
- **Console** — errors, warnings, run JS.
- **Network** — every request: URL, status, headers, payload, response, timing. First place to look for API bugs (CORS, 401, wrong body).
- **Sources** — set **breakpoints**, step through code line by line, inspect variables.
- **Performance** and **Lighthouse** — slow rendering, long tasks, Core Web Vitals.
- **Application** — cookies, localStorage, service workers.
- **React DevTools** extension — component tree, props, state, and the **Profiler** to find unnecessary re-renders.

**Backend — Node:**
- \`node --inspect src/server.js\` then open \`chrome://inspect\`, or use the VS Code debugger.
- \`debugger;\` statement pauses execution when a debugger is attached.

#### Deeper version
Breakpoint types:
- **Line breakpoint** — pause on a line.
- **Conditional breakpoint** — pause only when \`order.total < 0\`.
- **Logpoint** — print a message without editing code.
- **Exception breakpoint** — pause on thrown (or uncaught) errors.
- **DOM / XHR breakpoints** in Chrome — pause when an element changes or a request to a URL is made.

When paused: **step over** (next line), **step into** (go inside a function), **step out**, inspect the **call stack** and **scope** variables, and use the console in the current scope.

A good debugging process:
1. **Reproduce** reliably (write a failing test if you can).
2. **Narrow down** — check the Network tab: is the bug in the frontend or the API? Check logs with the request ID.
3. **Form a hypothesis** and test it with a breakpoint.
4. **Fix**, add a regression test, and check you did not break anything.

For production issues you cannot attach a debugger: use logs, Sentry stack traces with source maps, and metrics. For memory leaks use heap snapshots (DevTools Memory tab, or \`--inspect\` + heap snapshot for Node). \`git bisect\` finds which commit introduced a bug.`,
      why: `Developers spend a large part of their time debugging. Using breakpoints, the Network tab and profilers turns hours of random \`console.log\` guessing into minutes of systematic investigation. Interviewers often ask "how would you debug X?" to see this process.`,
      analogy: `console.log debugging is like finding a leak by putting buckets everywhere and checking later. A debugger is like pausing time: you freeze the house at the exact moment water appears, walk around and look at every pipe.`,
      code: [
        {
          title: 'VS Code launch.json for Node and Jest',
          lang: 'json',
          code: `{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "program": "\${workspaceFolder}/src/server.js",
      "envFile": "\${workspaceFolder}/.env",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug current Jest file",
      "program": "\${workspaceFolder}/node_modules/jest/bin/jest.js",
      "args": ["\${file}", "--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}`,
        },
        {
          title: 'Inspector from the terminal and debugger statement',
          lang: 'javascript',
          code: `// Terminal:
//   node --inspect src/server.js        -> open chrome://inspect, click "inspect"
//   node --inspect-brk src/server.js    -> pause on the first line

export function applyDiscount(order, coupon) {
  if (order.total < 0) {
    debugger; // pauses here when DevTools or VS Code is attached
  }
  return order.total * (1 - coupon.percent / 100);
}`,
        },
      ],
      output: `With the launch config, pressing F5 in VS Code starts the API (or the current Jest file) with the debugger attached. Breakpoints set by clicking in the editor gutter pause execution, and you can inspect \`req.body\`, the call stack and variables. \`--runInBand\` runs Jest tests in one process so breakpoints work reliably. (\`\${workspaceFolder}\` and \`\${file}\` are VS Code variables.)

With \`node --inspect\`, Chrome's DevTools connect to the Node process. The \`debugger\` statement only pauses when a debugger is attached; otherwise it does nothing — but remove it before committing (ESLint's \`no-debugger\` rule catches it).`,
      questions: [
        {
          q: 'How do you debug a Node.js application?',
          a: 'Run it with `node --inspect` and attach Chrome DevTools or the VS Code debugger, set breakpoints (conditional if needed), step through and inspect variables. Combine with structured logs for production issues.',
        },
        {
          q: 'An API call from the React app fails. How do you debug it?',
          a: 'Open the Network tab: check the URL, method, status, request payload, headers and response. A CORS error, 401 or 400 tells you where to look. Then check the server logs using the request ID, and reproduce with Postman or a test.',
        },
        {
          q: 'How do you find unnecessary re-renders in React?',
          a: 'Use the React DevTools Profiler to record an interaction and see which components rendered and why, then fix with memoization, moving state down, or stable props.',
        },
        {
          q: 'What is a conditional breakpoint?',
          a: 'A breakpoint that only pauses when an expression is true, like `user.id === \'42\'`. Useful in loops or busy endpoints.',
        },
      ],
      spoken: `"I start by reproducing the bug reliably, ideally with a failing test. For frontend issues, the Network tab is usually my first stop — status code, payload, headers — and React DevTools and the Profiler for state and re-render problems. For the backend I run Node with the inspector through VS Code, set breakpoints, often conditional ones, and step through while watching variables. In production I can't attach a debugger, so I rely on structured logs with request IDs and Sentry stack traces with source maps. Once fixed, I add a regression test so it doesn't come back."`,
      mistakes: [
        'Adding dozens of `console.log` lines and forgetting to remove them. Use breakpoints and logpoints.',
        'Changing code randomly until it works, without understanding the cause.',
        'Debugging the frontend when the Network tab shows the API returned a 500 — find which side is wrong first.',
        'Follow-up trap: "Your breakpoints in Jest are never hit — why?" Jest runs tests in worker processes and transforms code. Use `--runInBand` and make sure source maps are enabled so breakpoints map to your source files.',
      ],
      takeaway: 'Reproduce, narrow down with the Network tab and logs, confirm with breakpoints, then lock the fix with a test.',
    },
    {
      id: 'ai-tools-responsibly',
      title: 'How I Use AI Tools (Claude Code, GitHub Copilot) Responsibly',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'I use AI assistants to move faster on boilerplate, tests, refactors and exploring code — but I review every line, never share secrets, rely on tests as a safety net, respect licensing, and know when not to use them.',
      what: `AI coding tools are now normal in development work. Examples:
- **GitHub Copilot** — inline autocomplete and chat in the editor.
- **Claude Code** — an agent in the terminal/IDE that can read the codebase, edit files, run commands and tests when I approve.
- Chat assistants for explaining errors, concepts and design options.

How I use them (first person, practical):
- **Boilerplate and repetitive code** — CRUD routes, Zod schemas, TypeScript types from a JSON sample, test scaffolding.
- **Writing tests** — I ask for edge cases I might miss, then I check each test actually asserts the right thing.
- **Understanding unfamiliar code** — "explain this module and where X is called".
- **Refactors and migrations** — repetitive changes across many files, done in small steps with tests running.
- **Debugging help** — paste the error and the relevant code (with secrets removed) and ask for hypotheses.
- **Docs** — first drafts of READMEs, PR descriptions and comments, which I then edit.

My rules:
1. **I review every line** as if a new teammate wrote it. I am responsible for the code, not the tool.
2. **Never paste secrets** (API keys, tokens, customer data, \`.env\` files) into prompts, and follow company policy on which tools are approved.
3. **Tests are my safety net** — AI code must pass the same tests, lint and review as any code.
4. **Licensing** — be careful with large verbatim snippets; use tool settings that filter matches to public code where available, and follow the company's policy.
5. **Know when not to use it.**

#### Deeper version
Where AI output often goes wrong (so I check extra carefully):
- **Hallucinated APIs** — functions, options or packages that do not exist, or old versions of an API. I check the official docs. A made-up package name can even be a security risk if someone publishes a malicious package with that name ("slopsquatting"), so I verify packages before installing.
- **Security** — missing auth checks, SQL/NoSQL injection, unsafe \`eval\`, weak crypto, secrets in code, overly permissive CORS.
- **Subtle logic** — off-by-one, timezones, money in floating point, race conditions, missing \`await\`.
- **Outdated patterns** — class components, deprecated Next.js or Mongoose APIs.

When I do **not** use it (or use it very carefully):
- Security-critical code (auth, payments, encryption) — I write or review it deeply myself, with the docs open.
- When I do not understand the domain yet — I learn first, otherwise I cannot judge the output.
- With confidential code or data on tools my company has not approved.
- For learning a new concept — I write it myself first so I actually learn.

Working with agents like Claude Code: give clear context (the goal, constraints, conventions), ask for a plan before changes, keep tasks small, review the diff, run tests, and do not approve commands I do not understand.`,
      why: `Interviewers increasingly ask this. They want to know you are productive with AI tools **and** responsible: that you will not ship code you do not understand, leak secrets, or introduce security bugs. A clear, practical answer shows maturity.`,
      analogy: `An AI assistant is like a very fast, very well-read junior pair programmer who sometimes confidently makes things up. You give it clear tasks, you review everything it hands you, you never give it the keys to the safe, and you sign off on the work yourself.`,
      code: [
        {
          title: 'A good prompt vs a weak prompt',
          lang: 'text',
          code: `Weak:
  "write a coupon api"

Good:
  Context: Express + Mongoose + Zod, TypeScript, tests with Jest + supertest
  and mongodb-memory-server. Follow the pattern in src/routes/orders.ts.
  Task: POST /coupons/apply { code, cartId } -> returns new total.
  Rules: coupon must be active and not expired; one coupon per cart;
  percent off, max discount cap; money stored in paise (integers).
  Auth: user must own the cart (403 otherwise).
  First: show me a short plan. Then: write the route, service and tests
  for valid, expired, already-applied, wrong owner and invalid body cases.`,
        },
        {
          title: 'My review checklist for AI-generated code',
          lang: 'text',
          code: `[ ] I understand every line and could explain it in review
[ ] Every API, option and package actually exists in the version we use (checked docs)
[ ] No secrets, keys or customer data in prompts or code
[ ] Input validation, auth and ownership checks are present
[ ] Edge cases: empty, null, large values, timezones, money as integers
[ ] Errors are handled and logged (no swallowed catch blocks)
[ ] Tests exist, fail without the change, pass with it
[ ] Lint, type-check and CI are green
[ ] No large verbatim copy of external code with unclear license`,
        },
      ],
      output: `The good prompt gives the tool the stack, an existing file to copy conventions from, exact business rules, the security requirement and the test cases — and asks for a plan first. The result needs far less fixing, and asking for tests in the same task gives an automatic check.

The checklist is what I go through before I open a PR with AI-assisted code. It is the same bar as human-written code, with extra attention on the things AI often gets wrong: invented APIs, missing auth checks and subtle edge cases.`,
      questions: [
        {
          q: 'How do you use AI tools in your development workflow?',
          a: 'For boilerplate, test scaffolding, refactors, explaining unfamiliar code and debugging ideas. I give clear context, keep tasks small, review every line, and make sure tests and CI pass before I open a PR.',
        },
        {
          q: 'What are the risks of AI-generated code?',
          a: 'Hallucinated or outdated APIs, subtle logic bugs, security holes like missing auth or injection, licensing issues with copied code, and leaking secrets or confidential code through prompts.',
        },
        {
          q: 'When would you avoid using AI assistance?',
          a: 'For security-critical code without deep review, when I do not yet understand the domain well enough to judge the output, with confidential data on unapproved tools, and when I am trying to learn a concept myself.',
        },
        {
          q: 'How do you make sure AI-generated code is correct?',
          a: 'I read and understand every line, check APIs against official docs, run and extend tests (including making sure they fail without the change), run lint and type checks, and put it through normal code review.',
        },
        {
          q: 'Who is responsible for AI-generated code?',
          a: 'I am. If I commit it, it is my code. The tool is an assistant; the review, testing and accountability stay with the developer.',
        },
      ],
      spoken: `"I use AI tools like Claude Code and Copilot every day, but with clear rules. They're great for boilerplate, test scaffolding, repetitive refactors, and getting a quick explanation of unfamiliar code. I give them clear context — the stack, conventions, business rules — and ask for a plan before changes. Then I review every line like it came from a new teammate, check any API I don't recognise against the docs, and make sure tests, lint and CI pass. I never paste secrets or customer data, and I only use approved tools. For auth, payments or anything I don't fully understand yet, I slow down and own it myself."`,
      mistakes: [
        'Merging AI-generated code you cannot explain. If a reviewer asks "why?", "the AI wrote it" is not an answer.',
        'Pasting `.env` files, API keys or production data into a prompt.',
        'Installing a package the AI suggested without checking it exists and is the real, maintained one.',
        'Trusting AI-written tests without checking they assert the right thing — tests that always pass protect nothing.',
        'Follow-up trap: "Doesn\'t AI make junior skills like debugging less important?" No — it makes them more important. You need strong fundamentals to judge, debug and secure the output, and to notice when the tool is confidently wrong.',
      ],
      takeaway: 'AI makes me faster, not less responsible: clear context in, every line reviewed, no secrets shared, tests and CI as the safety net.',
    },
    {
      id: 'git-reflog-bisect',
      title: 'Recovering Work with git reflog (and finding bugs with git bisect)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'reflog is your local history of where HEAD has been — it rescues commits "lost" by reset, rebase or a deleted branch. bisect binary-searches history to find the commit that introduced a bug.',
      what: `**\`git reflog\`** (reference log) records every time **HEAD** moved on **your machine**: commits, checkouts, resets, rebases, merges. Even if a commit no longer belongs to any branch, the reflog still remembers its hash for a while.

That makes it the **undo button** for scary mistakes:
- \`git reset --hard\` to the wrong commit.
- A rebase that went badly.
- A branch deleted with \`git branch -D\`.

Steps: run \`git reflog\`, find the line **before** the mistake, then \`git reset --hard <sha>\` or create a branch there: \`git branch rescue <sha>\`.

**\`git bisect\`** finds **which commit introduced a bug** using binary search. You mark one commit "good" and one "bad"; Git checks out the middle one; you test and mark it; it halves the range again. Among 1,000 commits, you find the culprit in about 10 steps.

#### Deeper version
Reflog details:
- It is **local only** — not pushed, not shared. A fresh clone has an empty reflog.
- Entries expire (by default around 90 days for reachable entries and 30 days for unreachable ones; configurable). Unreachable commits are eventually removed by garbage collection (\`git gc\`).
- Syntax: \`HEAD@{2}\` = where HEAD was two moves ago. \`git reflog show feature/x\` shows one branch's log.
- Reflog cannot recover changes that were **never committed** (or staged — staged blobs can sometimes be found with \`git fsck --lost-found\`, but do not count on it).

Bisect details:
- \`git bisect run <command>\` automates it: Git runs your script (e.g. a test) at each step; exit code 0 = good, non-zero = bad.
- \`git bisect skip\` for commits that do not build.
- \`git bisect reset\` returns you to where you started.
- It works best with small, buildable commits — another reason for clean history.`,
      why: `Knowing reflog turns "I just destroyed two days of work" into a two-minute fix, which makes you calmer with powerful commands like rebase and reset. Bisect finds regressions in large histories mechanically, instead of guessing which of 200 commits broke the checkout.`,
      analogy: `The reflog is like your browser history: even if you closed a tab and lost the bookmark (deleted the branch), the history still has the page address, so you can open it again. Bisect is the "guess the number" game — "higher or lower?" — which finds the answer among 1,000 options in about 10 guesses.`,
      code: [
        {
          title: 'Rescue commits after a bad reset',
          lang: 'bash',
          code: `git reset --hard HEAD~3        # oops: 3 commits "gone"

git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~3
# 9f8e7d6 HEAD@{1}: commit: feat(cart): coupon totals   <- want this back
# 5c4b3a2 HEAD@{2}: commit: feat(cart): coupon model

git reset --hard 9f8e7d6       # branch is back where it was
# or, safer: keep current state and create a rescue branch
git branch rescue/coupons HEAD@{1}

# Deleted a branch by mistake? Find its last commit in reflog and recreate it:
git branch feature/coupons 9f8e7d6`,
        },
        {
          title: 'Find the commit that broke a test',
          lang: 'bash',
          code: `git bisect start
git bisect bad                 # current commit is broken
git bisect good v2.3.0         # this release worked

# Automatic: Git runs the test at each step (exit 0 = good)
git bisect run npx jest src/cart/total.test.js

# Output ends with something like:
# 7e6d5c4 is the first bad commit
# fix(cart): round discount before tax

git bisect reset               # back to where you started`,
        },
      ],
      output: `After the accidental reset, \`git reflog\` shows HEAD's history. \`HEAD@{1}\` is where you were before the reset, so resetting back to \`9f8e7d6\` restores all three commits. Creating a rescue branch is an even safer way: nothing is overwritten, and you can compare.

In the bisect example, Git checks out commits between \`v2.3.0\` and now, runs the Jest file at each one, and in a few steps prints the first bad commit — here a rounding change in the discount code. Then \`git bisect reset\` puts you back on your branch.`,
      questions: [
        {
          q: 'What is git reflog?',
          a: 'A local log of every position HEAD (and each branch) has pointed to. It lets you find and restore commits that are no longer on any branch after a reset, rebase or branch deletion.',
        },
        {
          q: 'You deleted a branch with unmerged commits. How do you recover it?',
          a: 'Find the last commit of that branch in `git reflog` (or in the delete message, which prints the SHA) and run `git branch <name> <sha>`.',
        },
        {
          q: 'Can reflog recover uncommitted changes?',
          a: 'No. Reflog tracks commits that HEAD pointed to. Changes that were never committed are not in it — commit or stash before risky commands.',
        },
        {
          q: 'What is git bisect?',
          a: 'A binary search over commit history to find the commit that introduced a bug. You mark good and bad commits (or use `git bisect run` with a test script) and Git narrows it down.',
        },
      ],
      spoken: `"git reflog is my safety net. It's a local log of everywhere HEAD has been, so even after a bad reset, a messy rebase or deleting a branch, I can find the old commit hash and reset back to it or create a rescue branch. It only works for committed work and it's local, so I commit or stash before risky operations. For regressions I use git bisect: I mark a known good release and the current bad commit, and with git bisect run and a failing test, Git binary-searches the history and tells me exactly which commit introduced the bug."`,
      mistakes: [
        'Panicking and re-cloning the repo after a bad reset — which throws away the reflog that could have saved you.',
        'Expecting reflog to work on a teammate\'s machine or on GitHub. It is local only.',
        'Running risky commands with uncommitted changes; reflog cannot bring those back.',
        'Follow-up trap: "How long are lost commits kept?" Until their reflog entries expire and garbage collection runs — commonly around 30 days for unreachable commits by default, but it is configurable, so recover soon.',
      ],
      takeaway: 'If it was committed, reflog can probably bring it back; if a bug appeared somewhere in history, bisect will find the commit.',
    },
    {
      id: 'monorepos',
      title: 'Monorepos: Workspaces, Turborepo and Nx',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'One repo holds many apps and packages (web, api, shared types/UI). Workspaces link them locally; Turborepo or Nx add task orchestration, caching and "only build what changed".',
      what: `A **monorepo** is one Git repository that contains **several projects**, for example:

\`\`\`text
apps/web        (Next.js)
apps/api        (Express)
packages/ui     (shared React components)
packages/types  (shared TypeScript types / Zod schemas)
\`\`\`

The opposite is **polyrepo**: one repo per project.

**Workspaces** (npm, Yarn or pnpm) are the base layer:
- One install for all projects, one lock file.
- Local packages are **linked**: \`apps/web\` can import \`@acme/types\` directly, and changes are visible instantly without publishing to npm.

**Turborepo** and **Nx** add a build system on top:
- Run tasks (\`build\`, \`test\`, \`lint\`) across all packages in the right **dependency order**.
- **Caching**: if a package and its inputs have not changed, reuse the previous result instead of running again.
- **Affected only**: run tests just for what changed in this PR.

#### Deeper version
Benefits:
- **Shared code without publishing** — API and frontend share the same Zod schemas and types, so a contract change is caught by the type-checker in one PR.
- **Atomic changes** — change the API and its clients in the same commit/PR.
- One set of tooling: ESLint, Prettier, TS config, CI.

Costs:
- CI can get slow without caching and affected-only runs.
- Needs clear ownership (CODEOWNERS) and boundaries, or everything imports everything.
- Tooling complexity: TypeScript project references, build order, Docker images that only include what each app needs (\`turbo prune\` helps here).

Turborepo vs Nx:
- **Turborepo** (Vercel) — simple, focused on task running + local and remote caching, configured with \`turbo.json\`.
- **Nx** — more features: project graph visualisation, code generators, module boundary lint rules, plugins for many frameworks; more to learn.

**Remote caching** shares the cache between developers and CI, so a build done once in CI does not need to run again on your laptop.

Package manager matters: pnpm workspaces with the \`workspace:*\` protocol are a popular choice.`,
      why: `Full-stack teams often have a web app, an API, maybe an admin panel and a mobile app sharing types and utilities. Copy-pasting types between repos leads to drift and bugs; publishing internal packages for every change is slow. A monorepo with good tooling keeps everything in sync and CI fast.`,
      analogy: `A monorepo is one big office building where all teams work on different floors. Sharing documents is easy (just walk upstairs), and a building manager (Turborepo/Nx) makes sure each floor is cleaned only if someone actually used it today — instead of cleaning the whole building every night.`,
      code: [
        {
          title: 'pnpm workspace + package wiring',
          lang: 'yaml',
          code: `# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"

# apps/api/package.json (shown as YAML-style notes)
#   "name": "@acme/api",
#   "dependencies": { "@acme/types": "workspace:*" }
#
# packages/types/package.json
#   "name": "@acme/types",
#   "main": "./dist/index.js", "types": "./dist/index.d.ts"`,
        },
        {
          title: 'turbo.json and commands',
          lang: 'json',
          code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}`,
        },
        {
          title: 'Running tasks',
          lang: 'bash',
          code: `pnpm turbo build                       # build everything in dependency order, cached
pnpm turbo test --filter=@acme/api     # only the api (and what it depends on)
pnpm turbo lint --filter=...[origin/main]   # only packages changed since main
pnpm --filter @acme/web add zod        # add a dependency to one app`,
        },
      ],
      output: `\`pnpm-workspace.yaml\` tells pnpm which folders are packages. \`"workspace:*"\` links \`@acme/types\` from the local folder instead of npm.

In \`turbo.json\`, \`"dependsOn": ["^build"]\` means "build my dependencies first" — so \`@acme/types\` builds before \`@acme/api\` and \`@acme/web\`. \`outputs\` tells Turbo what to cache. On the second \`turbo build\` with no changes, Turbo replays cached results ("FULL TURBO") in a fraction of the time. The \`--filter=...[origin/main]\` form runs tasks only for packages changed since main. (The top-level key was \`pipeline\` in Turborepo 1.x and \`tasks\` in 2.x — check your version.)`,
      questions: [
        {
          q: 'What is a monorepo and why use one?',
          a: 'One repository containing multiple apps and packages. It makes sharing code (types, UI, utils) easy, allows atomic changes across frontend and backend, and gives one consistent tooling setup.',
        },
        {
          q: 'What do Turborepo and Nx add on top of workspaces?',
          a: 'Task orchestration in dependency order, local and remote caching of task results, and running tasks only for affected packages. Nx also offers generators, a project graph and module boundary rules.',
        },
        {
          q: 'What are the downsides of a monorepo?',
          a: 'Slower CI without caching, more complex tooling, the risk of tangled dependencies without clear boundaries, and larger repos to clone. Access control per project is also harder than with separate repos.',
        },
        {
          q: 'How do you share types between a React app and an Express API in a monorepo?',
          a: 'Create a package like `@acme/types` (or shared Zod schemas), depend on it with `workspace:*` from both apps, and build it first via the task pipeline.',
        },
      ],
      spoken: `"A monorepo keeps several apps and packages in one repository — for example a Next.js web app, an Express API, and shared packages for types, Zod schemas and UI components. Workspaces, I prefer pnpm, link the local packages so both apps import the same types without publishing anything. On top of that, Turborepo or Nx run tasks in dependency order, cache results locally and remotely, and only run what changed, which keeps CI fast. The trade-offs are more tooling complexity and the need for clear boundaries and ownership, so I'd only choose it when code is genuinely shared."`,
      mistakes: [
        'Putting unrelated projects in a monorepo with no shared code — all cost, no benefit.',
        'No caching or affected-only runs, so every PR rebuilds and tests everything.',
        'Letting any package import anything, creating a tangled dependency graph. Use boundaries (Nx rules, ESLint import rules).',
        'Follow-up trap: "Monorepo means monolith?" No. A monorepo is about where code is stored; you can still deploy many independent services from it.',
      ],
      takeaway: 'Monorepo = many projects, one repo; workspaces link them, Turborepo/Nx make it fast with ordering, caching and affected-only runs.',
    },
  ],
  rapidFire: [
    { q: 'git fetch vs git pull?', a: 'fetch downloads commits only; pull = fetch + merge (or rebase).' },
    { q: 'What is the staging area?', a: 'Where you pick changes for the next commit with `git add`.' },
    { q: 'What is a branch technically?', a: 'A movable pointer to a commit.' },
    { q: 'What is HEAD?', a: 'A pointer to what you have checked out, usually a branch.' },
    { q: 'What is a detached HEAD?', a: 'HEAD points to a commit, not a branch — create a branch to keep new commits.' },
    { q: 'Merge vs rebase in one line?', a: 'Merge adds a merge commit and keeps history; rebase replays commits for a linear history.' },
    { q: 'Golden rule of rebasing?', a: 'Never rebase commits others have already pulled.' },
    { q: '--force vs --force-with-lease?', a: 'with-lease refuses to overwrite if the remote has commits you have not fetched.' },
    { q: 'What is a fast-forward merge?', a: 'The branch pointer just moves forward; no merge commit.' },
    { q: 'How do you abort a bad merge?', a: '`git merge --abort` (or `git rebase --abort`).' },
    { q: 'What do conflict markers mean?', a: 'Between `<<<<<<<` and `=======` is your side; between `=======` and `>>>>>>>` is incoming.' },
    { q: 'revert vs reset?', a: 'revert adds an undo commit (safe on shared branches); reset moves the branch back (local only).' },
    { q: 'reset --soft?', a: 'Moves the branch back; changes stay staged.' },
    { q: 'reset --mixed?', a: 'The default; changes stay in files but unstaged.' },
    { q: 'reset --hard?', a: 'Moves back and discards staged and file changes.' },
    { q: 'How do you recover a commit after reset --hard?', a: 'Find it in `git reflog` and reset or branch to it.' },
    { q: 'Does stash include new files by default?', a: 'No; use `git stash -u`.' },
    { q: 'stash pop vs apply?', a: 'pop applies and removes; apply keeps the stash.' },
    { q: 'What does cherry-pick do?', a: 'Copies one commit onto the current branch with a new hash.' },
    { q: 'What does git bisect do?', a: 'Binary-searches history to find the commit that introduced a bug.' },
    { q: 'Git Flow vs trunk-based?', a: 'Git Flow: develop/release branches; trunk-based: tiny merges to main daily with feature flags.' },
    { q: 'What is a feature flag?', a: 'A runtime switch that turns a feature on or off without deploying.' },
    { q: 'What is branch protection?', a: 'Rules on main: no direct push, required reviews and CI checks.' },
    { q: 'What is CODEOWNERS?', a: 'A file mapping paths to required reviewers.' },
    { q: 'Squash and merge?', a: 'All PR commits become one commit on main.' },
    { q: 'Conventional Commit example?', a: '`feat(cart): add coupon codes`' },
    { q: 'How do you mark a breaking change in Conventional Commits?', a: '`!` after the type or a `BREAKING CHANGE:` footer.' },
    { q: 'What does Husky do?', a: 'Shares Git hooks via the repo and installs them on npm install.' },
    { q: 'What does lint-staged do?', a: 'Runs linters only on staged files.' },
    { q: 'Can Git hooks be skipped?', a: 'Yes, with `--no-verify` — so CI must repeat the checks.' },
    { q: 'ESLint vs Prettier?', a: 'ESLint finds code problems; Prettier formats code.' },
    { q: 'How to stop ESLint and Prettier conflicting?', a: 'Add `eslint-config-prettier` last in the ESLint config.' },
    { q: 'What is ESLint flat config?', a: 'The `eslint.config.js` format, default since ESLint v9.' },
    { q: 'Semver parts?', a: 'MAJOR (breaking).MINOR (features).PATCH (fixes).' },
    { q: '^1.2.3 allows?', a: 'Any 1.x.x version >= 1.2.3.' },
    { q: '~1.2.3 allows?', a: 'Any 1.2.x version >= 1.2.3.' },
    { q: 'Why commit package-lock.json?', a: 'So everyone installs the exact same dependency tree.' },
    { q: 'npm ci vs npm install?', a: 'ci installs exactly from the lock file, clean, and fails on mismatch.' },
    { q: 'What is a peerDependency?', a: 'A dependency the host app must provide, like react for a UI library.' },
    { q: 'What is a phantom dependency?', a: 'Importing a package not listed in your package.json; pnpm blocks it.' },
    { q: 'Why is pnpm space-efficient?', a: 'One global content-addressable store, linked into projects.' },
    { q: 'What is npx?', a: 'Runs a package binary without installing it globally.' },
    { q: 'Why is Vite fast in dev?', a: 'It serves native ES modules on demand and pre-bundles deps with esbuild.' },
    { q: 'What does Vite use for production builds?', a: 'Rollup (moving to Rolldown in newer versions).' },
    { q: 'What is tree-shaking?', a: 'Removing unused exports from the bundle.' },
    { q: 'Are VITE_ env variables secret?', a: 'No — they are embedded in the client bundle and public.' },
    { q: 'What does Babel do?', a: 'Transpiles modern JS, JSX and TS into JS your targets can run.' },
    { q: 'Does Babel type-check TypeScript?', a: 'No; run `tsc --noEmit`.' },
    { q: 'Transpile vs polyfill?', a: 'Transpile rewrites syntax; polyfill adds missing runtime features.' },
    { q: 'What do Turborepo and Nx add to workspaces?', a: 'Task ordering, caching and affected-only runs.' },
    { q: 'Scrum ceremonies?', a: 'Sprint planning, daily stand-up, sprint review, retrospective (plus refinement).' },
    { q: 'Sprint review vs retrospective?', a: 'Review = the product (demo); retro = the process (how we work).' },
    { q: 'What is a Definition of Done?', a: 'The team checklist every item must meet to count as done.' },
    { q: 'What are story points?', a: 'Relative size: effort, complexity and uncertainty — not hours.' },
    { q: 'What is velocity used for?', a: 'Forecasting within one team, not judging people.' },
    { q: 'What is a spike?', a: 'A time-boxed research task to reduce uncertainty.' },
    { q: 'Epic vs story vs task?', a: 'Epic = big feature; story = user value; task = technical work.' },
    { q: 'What is an ADR?', a: 'A short record of one architecture decision: context, options, decision, consequences.' },
    { q: 'First rule when using AI coding tools?', a: 'Review and understand every line before it is merged.' },
    { q: 'What must never go into an AI prompt?', a: 'Secrets, keys, customer data or confidential code on unapproved tools.' },
  ],
};
