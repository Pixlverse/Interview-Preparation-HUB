// Interview problems for the Tools stack (Git, npm, linting, team workflow).
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'tools',
  problems: [
    {
      id: 'undo-last-commit-keep-changes',
      title: 'Undo the last commit but keep the changes',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'git-revert-reset',
      question: `You just ran \`git commit\`, then noticed you committed too early: the message is wrong and one file should not be in it. You have **not pushed** yet.

\`\`\`text
$ git log --oneline
4b7df35 wip              <- want to undo this commit
1a2b3c4 init
\`\`\`

How do you undo the commit **without losing any of your changes**? What is the difference between \`--soft\`, \`--mixed\` and \`--hard\` here?`,
      hints: [
        '`HEAD~1` means "the commit before the current one".',
        '`git reset` moves the branch pointer back. The flag decides what happens to your files and the staging area.',
      ],
      solution: `**Idea:** move the branch back one commit with \`git reset\`. Use \`--soft\` to keep everything staged, or the default \`--mixed\` to keep the changes but unstaged.

\`\`\`bash
# Option 1: undo the commit, keep changes STAGED (ready to commit again)
git reset --soft HEAD~1
git status          # files show as "Changes to be committed"

# Option 2: undo the commit, keep changes but UNSTAGED (default = --mixed)
git reset HEAD~1
git status          # files show as modified / untracked

# Then stage only what you want and commit again
git add src/cart.js
git commit -m "feat(cart): add quantity selector"
\`\`\`

**The three modes:**

\`\`\`text
              branch moves back   staging area     your files
--soft        yes                 kept (staged)    kept
--mixed       yes                 cleared          kept
--hard        yes                 cleared          DELETED changes
\`\`\`

**Why it works:** a commit is just a snapshot plus a pointer. \`reset --soft\` and \`--mixed\` only move the pointer (and the staging area), so your work stays on disk. Never use \`--hard\` here — it throws your changes away.

**Only if the message is wrong** (and nothing else), \`git commit --amend -m "new message"\` is quicker.`,
      followUps: [
        {
          q: 'What if you already pushed the commit?',
          a: 'On a shared branch, do not reset — use `git revert <sha>` to add a new "undo" commit. On your own feature branch that nobody else uses, you may reset and then `git push --force-with-lease`.',
        },
        {
          q: 'You ran `git reset --hard HEAD~1` by mistake. Is the commit gone?',
          a: 'Not yet. `git reflog` shows where HEAD was; `git reset --hard HEAD@{1}` brings it back. (Uncommitted changes lost by `--hard` cannot be recovered this way.)',
        },
      ],
    },
    {
      id: 'semver-caret-tilde-ranges',
      title: 'Which versions do ^1.4.2 and ~1.4.2 allow?',
      difficulty: 'easy',
      type: 'output',
      frequency: 'very common',
      relatedTopic: 'semver-package-lock',
      question: `For each range in \`package.json\`, which of these published versions can \`npm install\` pick?

Published versions: \`1.4.1\`, \`1.4.2\`, \`1.4.9\`, \`1.5.0\`, \`1.9.3\`, \`2.0.0\`, \`1.5.0-beta.1\`

\`\`\`json
{
  "dependencies": {
    "a": "^1.4.2",
    "b": "~1.4.2",
    "c": "1.4.2",
    "d": "^0.4.2"
  }
}
\`\`\`

For \`d\`, assume versions \`0.4.2\`, \`0.4.7\`, \`0.5.0\` exist.`,
      hints: [
        'Semantic versioning: MAJOR.MINOR.PATCH. Major = breaking change, minor = new feature, patch = bug fix.',
        '`^` allows changes that do not touch the left-most non-zero number. `~` allows patch changes only.',
        'Pre-release versions (with `-beta`) are not picked by a normal range.',
      ],
      solution: `**Idea:** \`^\` = "compatible" (same major), \`~\` = "about the same" (same minor), no symbol = exact.

\`\`\`text
"^1.4.2"  means >=1.4.2 <2.0.0   -> 1.4.2, 1.4.9, 1.5.0, 1.9.3   (npm picks 1.9.3, the highest)
"~1.4.2"  means >=1.4.2 <1.5.0   -> 1.4.2, 1.4.9                 (npm picks 1.4.9)
"1.4.2"   means exactly 1.4.2    -> 1.4.2
"^0.4.2"  means >=0.4.2 <0.5.0   -> 0.4.2, 0.4.7                 (in 0.x, the minor acts like a major)

Never picked: 1.4.1 (too low), 2.0.0 (new major), 1.5.0-beta.1 (pre-release)
\`\`\`

**Why it works:** in semver, the major number changes when the API breaks, so \`^\` stays inside one major. Below 1.0.0 every minor bump may break things, so \`^0.4.2\` stays inside \`0.4.x\`.

**Important:** the range matters only when the lock file has no entry. With a \`package-lock.json\` and \`npm ci\`, you get the **exact** versions written in the lock file.`,
      followUps: [
        {
          q: 'What does `^0.0.3` allow?',
          a: 'Only `0.0.3`. The left-most non-zero part is the patch, so nothing can change.',
        },
        {
          q: 'A library released a breaking change as a minor version. How does that hurt you, and what protects you?',
          a: 'Someone without a lock file (or running `npm update`) gets the broken version through `^`. The lock file + `npm ci` in CI protect you, and tools like Dependabot/Renovate update versions in separate PRs that run your tests first.',
        },
      ],
    },
    {
      id: 'stash-including-untracked',
      title: 'Switch branches fast: stash your work (including new files)',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'git-stash-cherry-pick',
      question: `You are halfway through a feature: you changed \`cart.js\` and created a **new file** \`coupon.js\` (not added to git yet). Your lead asks you to check a bug on \`main\` **right now**. You do not want to commit half-done work.

\`\`\`text
$ git status --short
 M cart.js
?? coupon.js
\`\`\`

You run \`git stash\`, then \`git status\` still shows \`coupon.js\`. Why? What should you run, and how do you get everything back later?`,
      hints: [
        '`??` means untracked: git has never seen this file. Plain `git stash` only saves tracked files.',
        'Look at `git stash -u` (`--include-untracked`).',
      ],
      solution: `**Idea:** plain \`git stash\` saves only changes to **tracked** files. Use \`-u\` to include untracked files too, and give the stash a name.

\`\`\`bash
# Save everything, including new untracked files, with a label
git stash push -u -m "cart: coupon work in progress"
git status --short            # clean now

# Go fix the bug
git switch main
git pull
# ... look at the bug, maybe create a hotfix branch ...

# Come back and restore your work
git switch feature/coupons
git stash list                # stash@{0}: On feature/coupons: cart: coupon work in progress
git stash pop                 # re-applies the changes AND removes the stash
git status --short
#  M cart.js
# ?? coupon.js
\`\`\`

**Why it works:** \`-u\` tells git to also store untracked files in the stash and remove them from the working folder. \`pop\` = \`apply\` + \`drop\`. If \`pop\` hits a conflict, git keeps the stash so you do not lose it.`,
      followUps: [
        {
          q: 'stash pop vs stash apply?',
          a: '`apply` restores the changes and keeps the stash in the list (useful to apply it on two branches). `pop` restores and deletes it.',
        },
        {
          q: 'Is there an alternative to stashing?',
          a: 'Yes: make a quick WIP commit and undo it later with `git reset HEAD~1`, or use `git worktree add ../hotfix main` to open main in a second folder without touching your current work.',
        },
      ],
    },
    {
      id: 'move-commits-off-main',
      title: 'You committed to main by mistake — move the commits to a new branch',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'git-basics-branching',
      question: `You forgot to create a branch. You made 2 commits on your local \`main\`. You have **not pushed**. \`origin/main\` is still at \`init\`.

\`\`\`text
$ git log --oneline
3ee6267 (HEAD -> main) feat: part 2
9317639 feat: part 1
e1e3656 (origin/main) init
\`\`\`

Move both commits to a new branch \`feature/search\` and make local \`main\` match \`origin/main\` again.`,
      hints: [
        'A branch is just a label pointing at a commit. Creating a branch here puts a label on your latest commit.',
        'After the label exists, you can move `main` back without losing the commits.',
      ],
      solution: `**Idea:** first put a new branch label on the current commit (so the work is safe), then move \`main\` back to \`origin/main\`.

\`\`\`bash
# 1. Make sure you have no uncommitted changes you care about
git status

# 2. New branch pointing at your latest commit (you stay on main)
git branch feature/search

# 3. Move main back to the remote version
git reset --hard origin/main

# 4. Continue working on the feature branch
git switch feature/search
git log --oneline
# 3ee6267 feat: part 2
# 9317639 feat: part 1
# e1e3656 init
\`\`\`

**Why it works:** commits are not "inside" a branch; branches are pointers. After step 2, both \`main\` and \`feature/search\` point to \`3ee6267\`. Step 3 moves only \`main\` back. The commits are still reachable through \`feature/search\`, so nothing is lost.

\`reset --hard\` is safe here because your work is committed and step 1 confirmed nothing is left uncommitted.`,
      followUps: [
        {
          q: 'What if you had already pushed to main?',
          a: 'Then others may have pulled it. Do not reset the shared main. Either keep the commits (if they are fine) or `git revert` them on main, and continue the work on a branch.',
        },
        {
          q: 'How do you stop this from happening again?',
          a: 'Turn on branch protection on GitHub so direct pushes to main are blocked, and many teams add a pre-commit or pre-push hook that refuses commits on main.',
        },
      ],
    },
    {
      id: 'cherry-pick-hotfix-release',
      title: 'Cherry-pick one hotfix to the release branch',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'git-stash-cherry-pick',
      question: `Production runs from \`release/1.0\`. On \`main\` there are new features that are **not ready** for production, plus one bug fix commit you need in production today.

\`\`\`text
main:         release 1.0 -- feat: new stuff -- fix: null check in checkout (6f2afa3)
release/1.0:  release 1.0
\`\`\`

Get **only** the fix into \`release/1.0\`.`,
      hints: [
        'Merging `main` would bring the unfinished feature too.',
        '`git cherry-pick <sha>` copies one commit onto your current branch.',
      ],
      solution: `**Idea:** switch to the release branch and copy just the fix commit with \`cherry-pick\`.

\`\`\`bash
git switch release/1.0
git pull                              # be up to date

# copy one commit; -x adds "(cherry picked from commit ...)" to the message
git cherry-pick -x 6f2afa3

git log --oneline
# 59f6cfa fix: null check in checkout     <- new commit, new sha
# d04ad55 release 1.0

npm test                              # run tests on the release branch!
git push
\`\`\`

**Why it works:** cherry-pick takes the **changes** of that commit and applies them as a new commit on the current branch. The new commit has a different sha, because its parent is different. \`-x\` records where it came from, which helps when someone later asks "is this fix in production?".

If the fix depends on code that only exists on \`main\`, you will get a conflict — resolve it, \`git add\`, then \`git cherry-pick --continue\`.`,
      followUps: [
        {
          q: 'What is the better long-term flow for hotfixes?',
          a: 'Many teams fix on the release branch first (or a hotfix branch from it), deploy, then merge or cherry-pick the fix back to main, so main never misses it.',
        },
        {
          q: 'How do you cherry-pick a range of commits?',
          a: '`git cherry-pick A^..C` picks A through C in order. Use it carefully — many cherry-picks usually mean the branching strategy should change.',
        },
      ],
    },
    {
      id: 'revert-pushed-commit-shared-main',
      title: 'A bad commit is already on shared main — remove it safely',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'git-revert-reset',
      question: `A commit that breaks checkout was merged and **pushed to \`main\`** an hour ago. Five teammates have pulled since, and two more commits came after it.

\`\`\`text
$ git log --oneline
3bca938 c3
9dbe570 feat: bad change      <- remove this
91f074e c1
\`\`\`

A teammate says: "Just \`git reset --hard 91f074e\` and force push." What do you do instead, and why?`,
      hints: [
        'Reset rewrites history. What happens to the five people who already have `9dbe570` and `3bca938`?',
        '`git revert` adds a **new** commit that does the opposite of an old one.',
      ],
      solution: `**Idea:** on a shared branch, never rewrite history. Use \`git revert\` to add a new commit that undoes the bad one. History only moves forward, so nobody's copy breaks.

\`\`\`bash
git switch main
git pull

# Create a new commit that undoes 9dbe570 (c3 stays!)
git revert 9dbe570          # opens the editor; --no-edit keeps the default message

git log --oneline
# e4c8d63 Revert "feat: bad change"
# 3bca938 c3
# 9dbe570 feat: bad change
# 91f074e c1

git push                    # normal push, no force needed
\`\`\`

**Why it works:** revert does not delete \`9dbe570\`; it adds \`e4c8d63\` with the reverse changes. Teammates just pull one more commit.

**Why not reset + force push:**
- It would also throw away \`c3\`, a good commit.
- Everyone who pulled still has the old commits. Their next push can bring the bad commit back, or they hit confusing errors.
- Branch protection on \`main\` usually blocks force pushes anyway.

If the bad change came in through a **merge commit** (a PR merge), use \`git revert -m 1 <merge-sha>\`. \`-m 1\` means "keep the first parent (main) side".`,
      followUps: [
        {
          q: 'Later the feature is fixed. Can you just merge the same branch again?',
          a: 'No — git thinks those commits are already in main (the revert only undid their changes). First revert the revert commit (`git revert e4c8d63`), then add the fix on top. Or make the fix on a fresh branch.',
        },
        {
          q: 'When is reset + force push okay?',
          a: 'On your own branch that nobody else works on (for example cleaning up before a PR). Use `--force-with-lease` so you never overwrite someone else\'s new commits.',
        },
      ],
    },
    {
      id: 'resolve-merge-conflict-markers',
      title: 'Resolve a merge conflict (read the conflict markers)',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'git-merge-conflicts',
      question: `On \`feature/retry\` you added a \`retries\` option. Meanwhile someone changed the timeout on \`main\`. You run \`git merge main\`:

\`\`\`text
$ git merge main
Auto-merging config.js
CONFLICT (content): Merge conflict in config.js
Automatic merge failed; fix conflicts and then commit the result.
\`\`\`

\`\`\`javascript
// config.js now looks like this
export const config = {
  port: 3000,
<<<<<<< HEAD
  timeout: 5000,
  retries: 3,
=======
  timeout: 10000,
>>>>>>> main
};
\`\`\`

Explain what each part means, resolve it correctly, and finish the merge.`,
      hints: [
        'The part between `<<<<<<< HEAD` and `=======` is your branch. The part between `=======` and `>>>>>>> main` is the branch you are merging in.',
        'The right answer is often **not** "pick one side". Here, both changes are wanted.',
        'After editing: `git add` the file, then `git commit`.',
      ],
      solution: `**Idea:** both sides changed the same lines, so git cannot choose. Read both versions, understand **why** each change was made, and write the combined result. Here: keep main's new timeout **and** your new \`retries\`.

\`\`\`text
<<<<<<< HEAD          start of YOUR version (current branch: feature/retry)
  timeout: 5000,
  retries: 3,
=======               divider
  timeout: 10000,     THEIR version (the branch being merged: main)
>>>>>>> main          end of the conflict
\`\`\`

\`\`\`javascript
// config.js after resolving: markers removed, both changes kept
export const config = {
  port: 3000,
  timeout: 10000, // from main (bug fix: longer timeout)
  retries: 3,     // from my branch (new feature)
};
\`\`\`

\`\`\`bash
git diff --check          # warns if any conflict markers are left
npm test                  # make sure the combined code works
git add config.js         # mark the conflict as resolved
git commit --no-edit      # finish the merge with the default message
\`\`\`

**Why it works:** git marks the conflict; \`git add\` tells git "I resolved this file", and the commit records a merge commit with both parents. Running the tests matters: a merge can be "conflict-free" and still broken.

If things go wrong, \`git merge --abort\` returns to the state before the merge.`,
      followUps: [
        {
          q: 'How do you reduce merge conflicts on a team?',
          a: 'Small PRs, merge or rebase from main often, short-lived branches, a formatter (Prettier) so style changes do not conflict, and talking to teammates working in the same files.',
        },
        {
          q: 'What do `git checkout --ours` / `--theirs` do?',
          a: 'They take one whole side for a conflicted file: `git checkout --theirs config.js`. Useful for generated files. Careful: during a **rebase** the meaning of ours/theirs is swapped.',
        },
      ],
    },
    {
      id: 'squash-commits-before-pr',
      title: 'Squash 3 messy commits into one before opening a PR',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'git-merge-vs-rebase',
      question: `Your feature branch has three commits. Your team wants one clean commit per PR.

\`\`\`text
$ git log --oneline main..feature/cart
c3c3c3c fix typo
b2b2b2b wip
a1a1a1a feat: add cart model
\`\`\`

Combine them into a single commit \`feat(cart): add cart model\`. Show two ways. The branch was already pushed (only you work on it).`,
      hints: [
        '`git rebase -i HEAD~3` opens a list where you can change `pick` to `squash` (or `s`).',
        'Another way: `git reset --soft` to where your branch started, then commit once.',
        'Because you changed already-pushed commits, a normal push is rejected.',
      ],
      solution: `**Idea:** rewrite your own branch's last 3 commits into one, then update the remote branch with a safe force push.

**Way 1 — interactive rebase:**

\`\`\`bash
git switch feature/cart
git rebase -i HEAD~3
\`\`\`

The editor shows the oldest commit first. Keep the first, squash the rest into it:

\`\`\`text
pick a1a1a1a feat: add cart model
squash b2b2b2b wip
squash c3c3c3c fix typo
\`\`\`

Save, then edit the combined message to \`feat(cart): add cart model\`.

**Way 2 — soft reset (simpler, no editor list):**

\`\`\`bash
git switch feature/cart
git reset --soft $(git merge-base HEAD main)   # go back to where the branch started, keep all changes staged
git commit -m "feat(cart): add cart model"
\`\`\`

**Then push:**

\`\`\`bash
git push --force-with-lease
\`\`\`

**Why it works:** both ways replace the three commits with one new commit containing the same final code. \`git merge-base HEAD main\` finds the commit where your branch split from main. \`--force-with-lease\` overwrites the remote branch **only if** it is still what you last saw, so you cannot accidentally delete a teammate's push.

**Shortcut many teams use:** GitHub's "Squash and merge" button does this at merge time, so you do not need to rewrite the branch yourself.`,
      followUps: [
        {
          q: 'What is the difference between squash and fixup in rebase -i?',
          a: '`squash` combines the commits and lets you edit the joined message. `fixup` combines them and throws away the fixup commit\'s message. `git commit --fixup <sha>` + `git rebase -i --autosquash` automates this.',
        },
        {
          q: 'Should you squash a branch other people are working on?',
          a: 'No. Rewriting shared commits breaks their copies. Squash only your own branches, or use the squash-merge button at the end.',
        },
      ],
    },
    {
      id: 'package-lock-conflict-npm-ci',
      title: 'package-lock.json merge conflict, and npm ci vs npm install in CI',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'semver-package-lock',
      question: `You added \`zod\` on your branch. A teammate added \`stripe\` on \`main\`. Merging \`main\` gives conflicts in **both** \`package.json\` and \`package-lock.json\` (thousands of lines).

Also, CI has this step, and last week a build broke because a new minor version of a library got installed in CI but not on anyone's laptop:

\`\`\`yaml
- run: npm install
- run: npm test
\`\`\`

1. How do you resolve the lock file conflict?
2. What is wrong with the CI step?`,
      hints: [
        'Do not hand-edit thousands of lock file lines. Fix `package.json` first — it is small.',
        'npm can rebuild/merge the lock file from `package.json` when you run `npm install`.',
        '`npm ci` installs exactly what the lock file says and fails if it does not match `package.json`.',
      ],
      solution: `**Idea:** resolve the small, human file (\`package.json\`) by hand. Let npm regenerate the lock file. In CI, use \`npm ci\` so the install is exact and repeatable.

**1. Resolve the conflict:**

\`\`\`bash
git merge main
# CONFLICT in package.json and package-lock.json

# a) Fix package.json by hand: keep BOTH dependencies
#    "stripe": "^14.0.0",
#    "zod": "^3.23.0",

# b) Let npm rebuild the lock file. npm can resolve conflict markers in
#    package-lock.json itself when package.json is clean:
npm install

# c) Check, test and finish the merge
npm test
git add package.json package-lock.json
git commit --no-edit
\`\`\`

If npm cannot fix it, take main's lock file and let npm add yours on top:

\`\`\`bash
git checkout main -- package-lock.json   # main's version of the lock
npm install                              # adds zod to it
\`\`\`

**2. Fix CI:**

\`\`\`yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
- run: npm ci        # exact versions from package-lock.json
- run: npm test
\`\`\`

**Why it works:**
- \`npm install\` may resolve a range like \`^1.4.2\` to a **newer** version and update the lock file. That is how CI got a version nobody had locally.
- \`npm ci\` deletes \`node_modules\`, installs **exactly** the lock file versions, never writes to the lock file, and **fails** if \`package.json\` and the lock file disagree. Same input → same install, every time.`,
      followUps: [
        {
          q: 'Should package-lock.json be committed?',
          a: 'Yes, for apps — always. It makes installs repeatable for teammates, CI and production. (For a published library, the lock file is not used by people who install it, but committing it still helps your own CI.)',
        },
        {
          q: 'Why is deleting package-lock.json and running npm install a bad fix?',
          a: 'It upgrades every dependency in the whole tree to the newest allowed version at once. You get a huge, unreviewable change and possibly new bugs unrelated to your feature.',
        },
      ],
    },
    {
      id: 'eslint-prettier-husky-lint-staged',
      title: 'Set up ESLint + Prettier + Husky + lint-staged for a team',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'husky-lint-staged',
      question: `In code review, half the comments are about formatting and unused variables. Set up the project so that:

- code is **formatted automatically** in one style,
- common bugs are caught by a **linter**,
- this runs on **every commit**, but only on the files being committed (so it is fast),
- ESLint and Prettier do not fight each other.

Explain what each tool does and show the config.`,
      hints: [
        'Prettier = formatting (spaces, quotes, line breaks). ESLint = code-quality rules (unused vars, missing `await`, hooks rules).',
        '`eslint-config-prettier` turns off ESLint rules that conflict with Prettier.',
        'Husky runs scripts on git hooks (pre-commit). lint-staged runs commands only on staged files.',
      ],
      solution: `**Idea:** Prettier owns formatting, ESLint owns code quality, Husky triggers a pre-commit hook, and lint-staged runs both tools only on the staged files.

\`\`\`bash
npm install -D eslint @eslint/js prettier eslint-config-prettier husky lint-staged
npx husky init        # creates .husky/pre-commit and adds "prepare": "husky" to package.json
\`\`\`

\`\`\`javascript
// eslint.config.js (ESLint 9 "flat config")
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,           // catches real bugs: unused vars, undefined names...
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  prettier,                         // LAST: turns off rules that clash with Prettier
];
\`\`\`

\`\`\`json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,yml}": "prettier --write"
  }
}
\`\`\`

\`\`\`bash
# .husky/pre-commit  (replace the default "npm test" line)
npx lint-staged
\`\`\`

\`\`\`json
// .prettierrc
{ "singleQuote": true, "semi": true, "printWidth": 100 }
\`\`\`

**Why it works:**
- \`prepare\` runs after \`npm install\`, so every teammate gets the hooks automatically.
- lint-staged only touches staged files, so the hook takes a second, not a minute. Fixed files are re-staged automatically.
- \`eslint-config-prettier\` goes last so it can switch off ESLint's style rules — then the two tools never disagree.
- **Hooks can be skipped** (\`git commit --no-verify\`), so also run \`npm run lint\` and \`prettier --check .\` in CI. CI is the real gate; hooks are fast feedback.`,
      followUps: [
        {
          q: 'Why not run the full test suite in pre-commit?',
          a: 'It is slow, so people start using `--no-verify`. Keep pre-commit fast (lint + format). Run tests in a pre-push hook or, better, in CI.',
        },
        {
          q: 'How do you introduce Prettier to a big existing codebase?',
          a: 'Format everything in **one** separate commit, then add that commit\'s sha to `.git-blame-ignore-revs` so `git blame` skips it.',
        },
      ],
    },
    {
      id: 'review-ai-generated-pr',
      title: 'Scenario: review a large AI-generated pull request',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'ai-tools-responsibly',
      question: `A teammate opens a PR: "Added Stripe subscription upgrade/downgrade — generated mostly with an AI assistant." It changes 900 lines in 14 files, including the webhook handler and a Mongo migration. CI is green.

How do you review it? What exactly do you check, and what do you ask the author?`,
      hints: [
        'Green CI only means the existing tests pass. Did the PR add tests for the new behavior?',
        'AI code often looks correct but invents APIs, skips edge cases, or ignores your project\'s patterns.',
        'Payment and data-migration code deserves the most careful review.',
      ],
      solution: `**Idea:** review it like any PR, but stricter: the author must own and understand every line. Focus on **correctness, security, money and data**, not style.

**1. Size and ownership first**
- 900 lines is too big to review well. Ask to split it (for example: migration / webhook / UI).
- Ask the author to explain the flow in the PR description. If they cannot, the PR is not ready.

**2. Correctness and hallucinations**
- Check every external API call against the **real docs** (Stripe method names, parameters, API version). AI tools sometimes invent methods or options.
- Check new dependencies: are they real, maintained, and needed?

**3. Money and webhooks**
- Webhook signature verified with the **raw** body?
- Idempotent: what happens if Stripe sends the same event twice, or out of order?
- Proration and currency in the smallest unit (cents/paise), no floating-point money math.

**4. Security**
- No secrets or keys in code; input validated; the user can only change **their own** subscription (authorization check).

**5. Data migration**
- Can it run twice safely? Is there a rollback plan? Tested on a copy of production-sized data?

**6. Tests**
- New tests for upgrade, downgrade, failed payment and duplicate webhook. Tests must assert real behavior, not just "it was called".

**7. Fits the codebase**
- Uses existing helpers, error handling, logging and naming. AI often re-implements things you already have.

\`\`\`text
Example review comments:
- "stripe.subscriptions.upgrade() is not a Stripe API method — I think this should be
   stripe.subscriptions.update(id, { items: [...], proration_behavior: 'create_prorations' })."
- "What happens if customer.subscription.updated arrives twice? Can we add a test?"
- "Can we split the migration into its own PR so it can be deployed and verified first?"
\`\`\`

**Why it works:** AI speeds up writing code, but review is where you catch the risks it adds. Being specific (links to docs, a failing case) keeps the review kind and useful.`,
      followUps: [
        {
          q: 'Do you treat AI code differently from human code?',
          a: 'The bar is the same: the author owns it and must understand it. In practice I look harder for invented APIs, missing edge cases, duplicated helpers and over-confident tests, because AI code is often plausible-looking.',
        },
        {
          q: 'How do you use AI tools yourself in reviews?',
          a: 'As a second pair of eyes: ask it to list edge cases or explain a tricky diff. I still verify each claim, and I never paste secrets or customer data into a tool that is not approved by the company.',
        },
      ],
    },
    {
      id: 'estimate-story-points',
      title: 'Scenario: estimate "Add Google login" in story points',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'estimation-story-points',
      question: `In sprint planning, the ticket is: **"Users can sign up and log in with Google."** Your app has email/password login (Node + Express + JWT + MongoDB, React frontend). The team uses Fibonacci points (1, 2, 3, 5, 8, 13). A reference story "add a forgot-password email" was a **3**.

Walk through how you would estimate this ticket. What questions do you ask, and what number would you give?`,
      hints: [
        'Story points measure **size relative to other stories**: effort + complexity + uncertainty. They are not hours.',
        'Break the work into parts and look for unknowns (account linking, existing users, mobile).',
        'If the estimate is large or very unsure, split the story or add a time-boxed spike.',
      ],
      solution: `**Idea:** compare with a known story, list the work and the risks, ask questions to remove uncertainty, then give a number and say what it assumes. If it is too big, split it.

**1. Clarifying questions**
- If a user already has an email/password account with the same Gmail address, do we **link** the accounts?
- Web only, or the mobile app too?
- Do we need "Sign in with Apple/GitHub" later? (Then build a generic OAuth layer.)
- Any design ready for the buttons and error states?

**2. Break down the work**

\`\`\`text
- Google Cloud console: OAuth client, redirect URLs for dev/staging/prod   (small)
- Backend: OAuth callback route, verify Google ID token, find-or-create user,
  issue our JWT, account-linking rule                                     (medium, some risk)
- DB: add googleId / provider fields + unique index                         (small)
- Frontend: button, redirect handling, errors                               (small)
- Tests: unit (find-or-create, linking), integration (callback route)       (medium)
- Security review: state parameter (CSRF), token verification              (small, important)
\`\`\`

**3. Compare and estimate**
- It is clearly bigger than forgot-password (3): more parts plus a third-party integration.
- Account linking adds uncertainty.
- My estimate: **8**. If the team also wants mobile, it is more than 8 → **split** it: "Google login on web (5)" and "Account linking for existing users (3)".

**4. In the meeting**
- Use planning poker: everyone shows a number at the same time. If one person says 3 and another 13, they explain — usually someone knows a risk the others missed.

**Why it works:** relative sizing is faster and more reliable than guessing hours. Questions turn hidden unknowns into explicit decisions. Splitting keeps every story small enough to finish in one sprint.`,
      followUps: [
        {
          q: 'Your manager asks "so 8 points is how many days?"',
          a: 'Points are relative, not hours. Use the team\'s **velocity** (average points finished per sprint) to forecast: "We usually finish about 30 points a sprint, so this fits in the sprint along with the other planned work."',
        },
        {
          q: 'What is a spike?',
          a: 'A short, time-boxed research task (for example one day) to remove uncertainty before estimating — like "try the Google ID token verification flow in a test app". Its output is knowledge, not a feature.',
        },
      ],
    },
    {
      id: 'recover-deleted-branch-reflog',
      title: 'Recover a deleted branch (and a hard reset) with reflog',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'git-reflog-bisect',
      question: `Two bad moments in one afternoon. Nothing was ever pushed.

**1.** You ran \`git branch -D feature/payments\` (force delete). It had two commits that are not on \`main\`: "feat: stripe checkout" and "feat: webhooks".

**2.** On another branch you ran \`git reset --hard HEAD~3\` and lost three commits.

\`\`\`text
$ git branch -D feature/payments
Deleted branch feature/payments (was bad5f5a).
\`\`\`

Get both back. Explain why this is possible.`,
      hints: [
        'Deleting a branch deletes the **label**, not the commits. The commits stay in the repository for a while.',
        '`git reflog` is a local diary of every place HEAD has pointed to.',
        'Once you find the sha, create a branch (or reset) to it.',
      ],
      solution: `**Idea:** git keeps a local log (the **reflog**) of where HEAD and branches pointed. "Lost" commits are still in the repository until garbage collection removes them (usually after 30+ days for unreachable entries). Find the sha and point a branch at it again.

**1. Deleted branch**

\`\`\`bash
# Easiest: the delete message printed the sha ("was bad5f5a")
git branch feature/payments bad5f5a

# If that message is gone, search the reflog
git reflog
# 80061b6 HEAD@{0}: checkout: moving from feature/payments to main
# bad5f5a HEAD@{1}: commit: feat: webhooks            <- last commit of the branch
# 43496dc HEAD@{2}: commit: feat: stripe checkout
# 80061b6 HEAD@{3}: checkout: moving from main to feature/payments

git branch feature/payments HEAD@{1}     # or: git branch feature/payments bad5f5a
git log --oneline feature/payments
# bad5f5a feat: webhooks
# 43496dc feat: stripe checkout
# 80061b6 init
\`\`\`

**2. Hard reset**

\`\`\`bash
git reflog
# 1111111 HEAD@{0}: reset: moving to HEAD~3
# 9999999 HEAD@{1}: commit: the last good commit     <- where you were before the reset

git reset --hard HEAD@{1}     # move the branch back to before the reset
\`\`\`

**Why it works:** a commit is only "lost" when nothing points to it. The reflog still points to it, so you can attach a branch again. Look for the entry **just before** the bad command.

**Limits:**
- The reflog is **local only** — it is not pushed, and a fresh clone has none.
- **Uncommitted** changes destroyed by \`reset --hard\` or \`checkout -- file\` are not in the reflog. (If they were staged with \`git add\`, \`git fsck --lost-found\` may still find the file contents.)`,
      followUps: [
        {
          q: 'What does `HEAD@{2}` mean vs `HEAD~2`?',
          a: '`HEAD~2` = two commits back in **history** (parent of parent). `HEAD@{2}` = where HEAD was two **moves** ago according to the reflog (any checkout, reset, commit, rebase).',
        },
        {
          q: 'A rebase went wrong. Can reflog help?',
          a: 'Yes. Find the entry before the rebase started (for example `HEAD@{5}: checkout: moving from ...` or use `ORIG_HEAD` right after) and `git reset --hard` to it.',
        },
      ],
    },
    {
      id: 'git-bisect-find-bug',
      title: 'Find the commit that broke checkout with git bisect',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'occasional',
      relatedTopic: 'git-reflog-bisect',
      question: `The cart total is wrong in production. It was correct in release \`v1.0.0\`. Since then there are **200 commits** on \`main\`. Nobody knows which one broke it.

\`\`\`javascript
// price.js today (somewhere a * became a +)
export const total = (items) => items.reduce((s, i) => s + i.price + i.qty, 0);
\`\`\`

Find the exact commit that introduced the bug, without checking 200 commits by hand. Show both the manual and the automatic way. About how many steps will it take?`,
      hints: [
        'Binary search: test the middle commit; the answer tells you which half has the bug.',
        '`git bisect start <bad> <good>`, then mark each step with `git bisect good` / `git bisect bad`.',
        '`git bisect run <command>` automates it: exit code 0 = good, 1-127 = bad (125 = skip).',
      ],
      solution: `**Idea:** \`git bisect\` does a binary search through history. Each step halves the range, so 200 commits need only about **8 steps** (2^8 = 256).

**Manual way:**

\`\`\`bash
git bisect start HEAD v1.0.0    # bad = HEAD, good = v1.0.0
# git checks out a commit in the middle. Test it (run the app or a test), then:
git bisect good                 # if the total is correct here
git bisect bad                  # if the total is wrong here
# ... repeat ~8 times until git prints:
# 26a1305... is the first bad commit
git bisect reset                # go back to where you started
\`\`\`

**Automatic way:** write a tiny check script that exits 0 when correct and 1 when wrong. Keep it **untracked** (do not commit it), so it stays in your folder while git checks out old commits.

\`\`\`javascript
// bisect-check.mjs  (untracked file in the repo folder)
import { total } from './price.js';

// 2 items of price 10 must cost 20
process.exit(total([{ price: 10, qty: 2 }]) === 20 ? 0 : 1);
\`\`\`

\`\`\`bash
git bisect start HEAD v1.0.0
git bisect run node bisect-check.mjs
# ...
# 26a13058e5bac9e7ffdc2bc63cdf9677f8203ff5 is the first bad commit
# commit 26a1305...
#     change 6
git bisect reset
\`\`\`

**Why it works:** git assumes the history goes good → good → **bad** → bad. Binary search finds the first bad commit in log2(n) steps. With \`run\`, git uses the script's exit code instead of asking you.

**Tips:**
- If a commit cannot be tested (it does not build), run \`git bisect skip\` (or exit with code 125 from the script).
- An existing Jest test works too: \`git bisect run npx jest src/price.test.js\` — but only if that test file exists in the old commits; otherwise use an untracked script.
- Once found, write a regression test for the bug in the fix PR.`,
      followUps: [
        {
          q: 'The "first bad commit" is a huge merge commit. What now?',
          a: 'Bisect can also go into the merged branch: by default it follows all parents, so it will usually point at the commit inside the branch. If it stops at the merge itself, the bug comes from how two changes combine — look at the merge diff and test each side.',
        },
        {
          q: 'Why do small commits make bisect more useful?',
          a: 'Bisect points to one commit. If that commit is small and focused, the cause is obvious. If it changes 40 files, you still have a lot of searching to do.',
        },
      ],
    },
    {
      id: 'committed-env-secrets',
      title: 'You pushed a .env file with real secrets — what now?',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'git-revert-reset',
      question: `You notice that a commit from yesterday added \`.env\` to the repo. It contains the **live** Stripe secret key, the MongoDB Atlas connection string and the JWT secret. It was pushed to GitHub (private repo, 8 people have access) and merged to \`main\`.

What do you do, **in what order**? Is \`git rm .env\` enough?`,
      hints: [
        'Once a secret is pushed, assume someone has copied it. Removing the file does not "un-leak" it.',
        'The most important step does not involve git at all.',
        'Deleting the file in a new commit leaves it in history: anyone can `git checkout` the old commit.',
      ],
      solution: `**Idea:** treat it as a security incident. **Rotate the secrets first** (make the leaked ones useless), then stop tracking the file, then clean history, then prevent it from happening again.

**1. Rotate every secret now (most important)**
- Stripe: roll the secret key in the Dashboard, update it in your hosting env vars, redeploy.
- MongoDB Atlas: change the database user's password (or create a new user), update the connection string.
- JWT secret: change it (this logs everyone out — acceptable).
- Check logs (Stripe, Atlas) for any unusual use since the commit.
- Tell your lead / security team. Follow the company process.

**2. Stop tracking the file**

\`\`\`bash
git rm --cached .env            # remove from git, keep the file on your disk
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: stop tracking .env"
git push
\`\`\`

**3. Remove it from history** (the old commits still contain it)

\`\`\`bash
# git-filter-repo is the tool recommended by the git project (install separately)
git filter-repo --path .env --invert-paths   # rewrite all commits without .env
git remote add origin <repo-url>             # filter-repo removes the remote as a safety step
git push --force --all
git push --force --tags
\`\`\`

- This rewrites **every** commit sha, so coordinate: everyone must re-clone (or hard reset), and open PRs need rebasing.
- GitHub can still show the old commit through cached views, forks or old PR refs. Contact GitHub Support to purge them if needed.

**4. Prevent it next time**
- \`.gitignore\` \`.env\` from day one; commit a \`.env.example\` with fake values.
- Turn on GitHub **secret scanning** and **push protection** (blocks pushes that contain known key formats).
- Add a pre-commit scanner such as \`gitleaks\` or \`git-secrets\`.
- Keep real secrets in a secret manager (AWS Secrets Manager, GCP Secret Manager) or the hosting platform's env vars.

**Why this order:** rewriting history takes time and coordination, while a leaked key can be used in minutes. Rotation closes the hole immediately; the git clean-up is hygiene after that.`,
      followUps: [
        {
          q: 'The commit was only local — never pushed. What changes?',
          a: 'Much simpler: nobody else saw it. Remove it from the commit (`git rm --cached .env`, then `git commit --amend`, or reset/rebase the local commits). Rotation is optional but still wise if the laptop or logs could be shared.',
        },
        {
          q: 'Why `git rm --cached` and not just `git rm`?',
          a: '`--cached` removes the file from git\'s tracking but keeps it on your disk, so your local app still runs. Plain `git rm` deletes the file too.',
        },
      ],
    },
    {
      id: 'rebase-feature-branch-force-with-lease',
      title: 'Update a feature branch: rebase vs merge, and pushing safely',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'git-merge-vs-rebase',
      question: `Your branch \`feature/x\` is 20 commits behind \`main\` and has a conflict with it. A teammate also pushed one commit ("teammate y") to \`feature/x\` this morning, which you have **not** pulled.

1. Should you **merge** \`main\` into your branch or **rebase** onto \`main\`? Explain the trade-off.
2. You choose rebase. Show the commands, including resolving a conflict during the rebase.
3. After rebasing, \`git push\` is rejected. Why? Why is \`--force-with-lease\` safer than \`--force\` here — and when does it stop protecting you?`,
      hints: [
        'Rebase replays your commits on top of the latest main, creating **new** commits (new shas). Merge keeps your commits and adds a merge commit.',
        'During a rebase conflict: fix the file, `git add`, then `git rebase --continue` (not `git commit`).',
        '`--force-with-lease` refuses to overwrite the remote branch if it changed since your last fetch.',
      ],
      solution: `**Idea:** both work. Merge is safe for shared branches; rebase gives a clean, straight history but rewrites your commits, so you must force push — carefully.

**1. Merge vs rebase**

\`\`\`text
merge main into feature/x            rebase feature/x onto main
- adds one merge commit              - replays your commits on top of main (new shas)
- never rewrites history             - straight, linear history; easy to read and bisect
- safe on shared branches            - needs a force push; do not rebase branches others build on
- conflicts resolved once            - conflicts may come once per replayed commit
\`\`\`

Common team rule: **rebase your own local work, merge shared branches.** Since a teammate pushed to this branch, first pull their work.

**2. Rebase with a conflict**

\`\`\`bash
git switch feature/x
git pull --rebase                 # first get the teammate's commit onto your branch
git fetch origin
git rebase origin/main            # replay your commits on top of the latest main

# CONFLICT (content): Merge conflict in src/cart.js
# fix the file (remove <<<<<<< ======= >>>>>>> markers), then:
git add src/cart.js
git rebase --continue             # NOT git commit
# (git rebase --abort goes back to how things were before the rebase)

npm test
\`\`\`

**3. Pushing**

\`\`\`bash
git push                          # rejected: the remote has commits your branch "does not have"
                                  # (the old shas you just replaced)
git push --force-with-lease       # overwrite, but only if the remote is still what you last saw
\`\`\`

If you had **not** pulled the teammate's commit, \`--force-with-lease\` stops you:

\`\`\`text
 ! [rejected]        feature/x -> feature/x (stale info)
error: failed to push some refs to 'origin'
\`\`\`

Plain \`--force\` would have silently deleted "teammate y".

**When the lease stops protecting you:** it compares against your **remote-tracking branch** (\`origin/feature/x\`). If you run \`git fetch\` (or an editor fetches in the background), that ref updates to include the teammate's commit, and the lease now passes — even though you never integrated their work. Add \`--force-if-includes\` (git 2.30+) to also check that your branch actually contains what you fetched.

**Why it works:** the lease is a "compare-and-swap": update the remote only if it still equals the value I expect. That turns a dangerous overwrite into a safe one in the common case.`,
      followUps: [
        {
          q: 'What does `git pull --rebase` do differently from `git pull`?',
          a: 'Plain `pull` = fetch + merge (can create "Merge branch origin/x" commits). `pull --rebase` = fetch + replay your local commits on top, keeping history linear. Many people set `git config --global pull.rebase true`.',
        },
        {
          q: 'You have to fix the same conflict over and over during a long rebase. Any help?',
          a: 'Enable `git config --global rerere.enabled true` ("reuse recorded resolution"): git remembers how you resolved a conflict and re-applies it automatically next time. Or squash your commits first so there is only one to replay.',
        },
      ],
    },
  ],
};
