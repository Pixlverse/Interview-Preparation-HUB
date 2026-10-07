// Interview problems for the Resume / Projects stack.
// Hard, probing follow-ups about my own work (OCTAGNT and SkillKeepr) — the kind that check I really built it.
// See CONTENT_GUIDE.md ("Interview problems") for the format.
// "Adapt:" notes mark places where you must fill in your real details. Never invent numbers.

export default {
  stackId: 'resume',
  problems: [
    {
      id: 'validate-70-percent-claim',
      title: 'How did you measure the ~70% reduction in JD writing effort?',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'jd-generation-openai',
      question: `Your resume says the OpenAI job description generator reduced manual effort by about **70%**.

"How did you measure that? What was the baseline? How do you know the recruiters did not just spend the saved time fixing the AI output?"`,
      hints: [
        'The interviewer is testing honesty, not maths. Say clearly whether the number is measured or estimated.',
        'Structure: baseline (before) → after → how the number was calculated → limits of the number.',
        'Finish with how you would measure it properly with data (timestamps, edit size, adoption).',
      ],
      solution: `**Idea:** be honest about where the number came from, show you understand what a good measurement looks like, and do not defend a number harder than the data allows.

\`\`\`text
1. WHAT "EFFORT" MEANS
   "Effort = the time a recruiter spends to get a JD ready to publish.
    Before: writing from scratch. After: fill a short form, generate, review, edit."

2. HOW I GOT ~70%   (Adapt: say only what really happened)
   "It is an approximate figure. We compared the typical time to write a JD
    by hand with the time to generate and edit one, based on recruiter
    feedback and a small sample."

3. THE 'FIXING' QUESTION
   "Good point — the 'after' time includes review and editing.
    The draft is structured JSON (summary, responsibilities, requirements),
    so editing is mostly small changes, not rewriting."

4. HOW I WOULD MEASURE IT PROPERLY
   - Timestamps: form opened -> JD published, before vs after the feature.
   - Edit size: how much of the AI draft survives in the published JD.
   - Adoption: % of JDs created with the generator vs manual.
   - Use the median, not the average (one slow JD skews the average).
\`\`\`

A small example of the "edit size" metric — how much of the AI draft survived:

\`\`\`javascript
// Rough "how much did the recruiter keep?" metric using word overlap.
function keptRatio(aiDraft, published) {
  const words = (s) => s.toLowerCase().split(' ').filter(Boolean);
  const draft = new Set(words(aiDraft));
  const final = words(published);
  const kept = final.filter((w) => draft.has(w)).length;
  return final.length ? kept / final.length : 0;
}

const draft = 'We are hiring a Node.js developer with 3 years of experience in MongoDB and AWS';
const published = 'We are hiring a Node.js developer with 3+ years of experience in MongoDB, Docker and AWS';
console.log(keptRatio(draft, published).toFixed(2)); // 0.81 -> most of the draft was kept
\`\`\`

**Why it works:** interviewers do not expect lab-grade data from a product team. They want to see that you know the difference between an estimate and a measurement, and that you would not hide it.`,
      followUps: [
        {
          q: 'So the number is not exact?',
          a: '"Correct, it is an approximate figure from comparing typical times. I keep it as \'about 70%\' on purpose. With timestamps from created to published I could make it precise." Adapt: if you did have timestamp data, say so.',
        },
        {
          q: 'Did quality drop when recruiters used AI drafts?',
          a: 'A human always reviews and edits before publishing, and the output is forced into a fixed structure, so the format is consistent. Adapt: mention any recruiter feedback you remember.',
        },
      ],
    },
    {
      id: 'ai-tools-without-lowering-quality',
      title: 'How did you use Claude Code and Copilot without lowering code quality?',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'ai-coding-tools-responsibly',
      question: `"You mention Claude Code and GitHub Copilot on your resume. Many teams found AI tools make code worse — bigger PRs, subtle bugs, code nobody understands. How did you make sure that did not happen in OCTAGNT? Give me a concrete example."`,
      hints: [
        'Show rules you follow, not tool features. "I own every line I commit" is the core message.',
        'Split work into: where AI helps a lot, where you are careful, and where you do not let it decide.',
        'Have one honest example where the AI was wrong and you caught it.',
      ],
      solution: `**Idea:** AI writes drafts; I stay the engineer responsible. I use clear rules and the same review bar as for human code.

\`\`\`text
MY RULES
1. I own every line. If I cannot explain a line in review, it does not go in.
2. Small, focused changes. I ask for one function or one test file at a time,
   not "build the feature". Small diffs are easy to review.
3. Tests first or tests together. AI-written code must pass tests I trust.
4. Same PR review as human code. No "the AI wrote it" excuse.
5. No secrets or customer data in prompts.

WHERE AI HELPS A LOT
- Boilerplate: routes, DTOs/validation schemas, Dockerfiles, CI YAML.
- Writing test cases and edge cases I might miss.
- Explaining unfamiliar code or a library quickly.
- Mechanical refactors (rename, extract function) across files.

WHERE I AM CAREFUL (I write or deeply review myself)
- Security: auth, tenant filters, webhook signature checks.
- Money: billing, plan limits.
- Concurrency and retries: race conditions are easy to get subtly wrong.

EXAMPLE  (Adapt: replace with a real one you remember)
"An AI suggestion used an API option that did not exist in our library
 version. Tests failed, I checked the docs and fixed it. Since then I always
 check version-specific APIs against the official docs."
\`\`\`

**Why it works:** the interviewer wants to hear that speed did not replace judgement. Rules + a real example are much stronger than "I always review the code".`,
      followUps: [
        {
          q: 'Did AI tools actually make you faster? By how much?',
          a: 'Do not invent a number. Say: "Yes, mostly for boilerplate, tests and exploring code. I did not measure it precisely." Adapt: give a real example of a task that became faster.',
        },
        {
          q: 'How do you stop the codebase becoming inconsistent with AI code?',
          a: 'Linting and formatting in CI, shared patterns the AI is shown (an existing file as an example), and review that rejects code which does not match project conventions.',
        },
      ],
    },
    {
      id: 'production-incident-24h-walkthrough',
      title: 'Walk me through a production incident you fixed within 24 hours',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'production-issues-24h',
      question: `"Your resume says you resolved critical production issues within 24 hours. Pick one. Walk me through it from the moment you heard about it to the moment it was closed. What did you do in the first 30 minutes?"`,
      hints: [
        'Use a clear incident timeline: detect → assess impact → mitigate → find root cause → fix → prevent.',
        'Mitigation (stop the bleeding) comes BEFORE the perfect fix. Say this out loud.',
        'End with what you changed so it cannot happen again (test, alert, doc).',
      ],
      solution: `**Idea:** tell it as a timeline. Interviewers score how calm and structured you were, not how clever the bug was.

\`\`\`text
STRUCTURE (6 steps, about 2 minutes when spoken)

1. DETECT     How did we find out? (alert, customer ticket, error spike)
2. IMPACT     Who is affected and how badly? (all tenants? payments? login?)
              -> decides priority and who to tell.
3. MITIGATE   Stop the damage first: roll back, disable a feature flag,
              pause a job, hotfix a guard. Tell stakeholders the status.
4. ROOT CAUSE Logs, recent deploys, reproduce locally with the same data shape.
              Ask "what changed?" first.
5. FIX        Small, tested fix. Deploy. Verify with real metrics/logs.
              Repair any bad data the bug created.
6. PREVENT    Regression test, alert, validation, short write-up.

FIRST 30 MINUTES
- Confirm it is real and see how big it is.
- Check the last deploy and recent config changes.
- Decide: roll back or hotfix? (Rollback if the last deploy is suspect.)
- Post a short update to the team / support.

EXAMPLE SHELL  (Adapt: fill with a real incident you handled)
"Recruiters reported <symptom>. It affected <scope>.
 I first <mitigation> so users were unblocked within <time>.
 Root cause: <one sentence>. I fixed it by <fix>, cleaned up <data>,
 and added <test/alert> so it would be caught earlier next time."
\`\`\`

Good realistic root causes to think about (pick only one that really happened to you): a missing \`await\`, a webhook not handled, a query without an index after data grew, a breaking change after a dependency upgrade, an expired third-party token.`,
      followUps: [
        {
          q: 'How did you know the fix really worked?',
          a: 'I checked the same signal that showed the problem — error rate, logs, the affected user flow — after deploying, and confirmed with the person who reported it.',
        },
        {
          q: 'Did you do a post-mortem?',
          a: 'A short blameless write-up: what happened, impact, root cause, what we changed. Adapt: say whether your team did this formally or informally.',
        },
        {
          q: 'What if you could not find the root cause in 24 hours?',
          a: 'Keep the mitigation in place, add logging around the suspect area, share what is known and unknown, and set the next check-in time. Being clear is better than guessing.',
        },
      ],
    },
    {
      id: 'stripe-webhook-signature-fails',
      title: 'Stripe webhook signature verification always fails — find the bug',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'stripe-subscriptions-marketplace',
      question: `In SkillKeepr every Stripe webhook returns 400 with "No signatures found matching the expected signature for payload". The secret is correct in the dashboard. Find the bug.

\`\`\`javascript
import express from 'express';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json()); // parse JSON for all routes

app.post('/webhooks/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    handleEvent(event);
    res.sendStatus(200);
  } catch (err) {
    res.status(400).send(err.message);
  }
});
\`\`\``,
      hints: [
        'The signature is calculated over the exact bytes Stripe sent.',
        'What does `express.json()` do to `req.body` before your route runs?',
        'The webhook route needs the raw body. Mount it before the JSON parser.',
      ],
      solution: `**Bug:** \`express.json()\` runs first and turns the body into a JavaScript object. \`constructEvent\` needs the **raw bytes**. Re-serialising the object changes spacing and key order, so the signature never matches.

**Fix:** give the webhook route \`express.raw()\` and register it **before** the global JSON parser.

\`\`\`javascript
import express from 'express';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1) Webhook route FIRST, with the raw body (a Buffer)
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,                            // Buffer, untouched
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,   // the secret of THIS endpoint
    );
  } catch (err) {
    return res.status(400).send('Invalid signature');
  }
  res.sendStatus(200);                     // answer fast
  queueEvent(event);                       // heavy work in the background
});

// 2) JSON parser for everything else
app.use(express.json());
\`\`\`

**Other common causes of the same error:**
- Using the **Stripe CLI** secret (\`whsec_...\` printed by \`stripe listen\`) in production, or the dashboard secret locally. Each endpoint has its own secret.
- A proxy or API gateway that rewrites the body.
- Test-mode secret with live-mode events (or the reverse).`,
      followUps: [
        {
          q: 'Why not just skip verification in development?',
          a: 'Because then the code path that matters most is never tested. Use `stripe listen --forward-to localhost:PORT/webhooks/stripe`; it gives a local signing secret so verification works locally too.',
        },
        {
          q: 'Why answer 200 before processing?',
          a: 'Stripe waits for a response and retries on timeouts or non-2xx. Long processing in the request causes duplicate deliveries. Store or queue the event, answer, then process (and make processing idempotent).',
        },
      ],
    },
    {
      id: 'rbac-new-role-without-deploy',
      title: 'Design RBAC so a new role can be added without a deploy',
      difficulty: 'medium',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'rbac-four-modules',
      question: `SkillKeepr has four modules: HR, Talent, Recruiter and Admin. A customer asks: "We need a new role, *Hiring Manager*, who can view candidates and leave feedback but cannot see salary data or billing."

"Design the RBAC so this role can be created **without a code deploy**. Show the data model and the check in the API."`,
      hints: [
        'Separate **permissions** (fixed in code, because code enforces them) from **roles** (data, editable per tenant).',
        'The API checks permissions, never role names. `if (role === "admin")` is what forces deploys.',
        'Think about caching the role → permissions lookup and how the frontend knows what to show.',
      ],
      solution: `**Idea:** permissions are a fixed list in code (\`candidate:read\`, \`billing:manage\`...). Roles are **documents in the database** that hold a list of permissions, per tenant. Routes check a permission, not a role. A new role is just a new document created from the admin UI.

\`\`\`javascript
// permissions.js — the ONLY part that needs code (code must enforce them)
const PERMISSIONS = [
  'candidate:read', 'candidate:write', 'candidate:salary:read',
  'feedback:write', 'job:write', 'billing:manage', 'user:manage',
];

// Role documents (MongoDB) — per tenant, editable in the Admin module
const roles = [
  { tenantId: 't1', name: 'Recruiter', permissions: ['candidate:read', 'candidate:write', 'job:write', 'feedback:write'] },
  // Created at runtime by the customer's admin — no deploy:
  { tenantId: 't1', name: 'Hiring Manager', permissions: ['candidate:read', 'feedback:write'] },
];

// Validate when an admin creates/edits a role
function validateRole(role) {
  const unknown = role.permissions.filter((p) => !PERMISSIONS.includes(p));
  if (unknown.length) throw new Error('Unknown permissions: ' + unknown.join(', '));
}

// Express-style middleware: checks a PERMISSION, never a role name
function requirePermission(permission) {
  return (req, res, next) => {
    const role = roles.find((r) => r.tenantId === req.user.tenantId && r.name === req.user.role);
    if (role && role.permissions.includes(permission)) return next();
    res.statusCode = 403;
    res.end('Forbidden');
  };
}

// Field-level rule: hide salary unless allowed
function shapeCandidate(candidate, perms) {
  if (perms.includes('candidate:salary:read')) return candidate;
  const { expectedSalary, currentSalary, ...safe } = candidate;
  return safe;
}

// Demo
validateRole(roles[1]);
const req = { user: { tenantId: 't1', role: 'Hiring Manager' } };
const res = { end: (m) => console.log(res.statusCode, m) };
requirePermission('candidate:read')(req, res, () => console.log('candidate:read -> allowed'));
requirePermission('billing:manage')(req, res, () => console.log('allowed'));
console.log(shapeCandidate({ name: 'Asha', expectedSalary: 1200000 }, roles[1].permissions));
\`\`\`

**Design points to say out loud:**
- **Roles are data, permissions are code.** A new *role* needs no deploy. A brand-new *permission* (a new kind of action) does, because some code must enforce it — that is honest and expected.
- **Check permissions, not roles:** \`requirePermission('candidate:read')\`, never \`if (role === 'Recruiter')\`.
- **Tenant-scoped roles:** each company can have its own roles; system default roles are templates copied at signup.
- **Field-level rules** (salary) are permissions too, applied when shaping the response.
- **Plan + role:** a feature is allowed only if the **role** has the permission **and** the tenant's **plan** includes the module.
- **Caching:** cache role → permissions per tenant (in memory or Redis) and clear it when an admin edits a role.
- **Frontend:** the \`/me\` endpoint returns the permission list; the UI hides buttons with it. The server still checks every request.

Adapt: say how SkillKeepr really stored roles — fixed roles in code, or roles in the database. If they were fixed, present this as "how I would make it configurable".`,
      followUps: [
        {
          q: 'Should permissions go inside the JWT?',
          a: 'Usually only the user id, tenant id and role id. If permissions are in the token, a role change does not apply until the token expires. Look them up (with a cache) on each request instead.',
        },
        {
          q: 'How do you stop an admin from giving themselves more power than allowed?',
          a: 'A user can only grant permissions they already have, and some permissions (like `billing:manage`) can only be held by the account owner role. Every role change is written to an audit log.',
        },
      ],
    },
    {
      id: 'plan-limit-race-condition',
      title: 'Plan limit is bypassed by two requests at the same time — fix it',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'stripe-subscriptions-marketplace',
      question: `The Basic plan allows **5 active job posts**. A tenant with 4 posts clicked "Publish" on two jobs at the same moment (two browser tabs) and ended up with **6**. Find the bug and fix it.

\`\`\`javascript
async function publishJob(tenantId, jobId) {
  const plan = await getPlanForTenant(tenantId);           // { limits: { activeJobs: 5 } }
  const active = await Job.countDocuments({ tenantId, status: 'active' });

  if (active >= plan.limits.activeJobs) {
    throw new LimitError('Upgrade your plan to publish more jobs');
  }

  await Job.updateOne({ _id: jobId, tenantId }, { status: 'active' });
}
\`\`\``,
      hints: [
        'Both requests read the count before either one writes. This is a "check-then-act" race.',
        'The check and the increment must be ONE atomic database operation.',
        'Keep a usage counter document and use a conditional `$inc` with `findOneAndUpdate`.',
      ],
      solution: `**Bug:** a **check-then-act race**. Request A counts 4, request B counts 4, both pass the check, both publish. Reading and writing are two separate steps, so anything can happen between them.

**Fix:** keep a usage counter per tenant and make "check the limit and reserve a slot" a **single atomic update**. MongoDB applies one \`findOneAndUpdate\` on one document atomically, so only one request can move the counter from 4 to 5.

\`\`\`javascript
async function publishJob(tenantId, jobId) {
  const plan = await getPlanForTenant(tenantId);
  const limit = plan.limits.activeJobs;

  // 1) Reserve a slot atomically: only matches if there is room left
  const usage = await Usage.findOneAndUpdate(
    { tenantId, activeJobs: { $lt: limit } },
    { $inc: { activeJobs: 1 } },
    { new: true },
  );
  if (!usage) throw new LimitError('Upgrade your plan to publish more jobs');

  // 2) Do the real work; give the slot back if it fails
  try {
    const r = await Job.updateOne(
      { _id: jobId, tenantId, status: { $ne: 'active' } }, // do not count twice
      { status: 'active' },
    );
    if (r.modifiedCount === 0) throw new Error('Job not found or already active');
  } catch (err) {
    await Usage.updateOne({ tenantId }, { $inc: { activeJobs: -1 } });
    throw err;
  }
}
// Closing or deleting an active job does: $inc: { activeJobs: -1 }
\`\`\`

**Why it works:** the filter \`activeJobs: { $lt: limit }\` and the \`$inc\` happen together on one document. The second request finds no matching document and gets \`null\`.

**Edge cases to mention:**
- **Counter drift:** if a process crashes between the steps, the counter can be off. A small nightly job recounts real active jobs and fixes the counter.
- **Usage doc must exist:** create it at signup. Do not \`upsert\` here — with the \`$lt\` filter, an upsert could create a second usage document when the limit is reached.
- **Alternative:** a MongoDB transaction (count + update inside a session) also works but needs a replica set and is heavier for a hot path.

Adapt: say how SkillKeepr really tracked usage (counter document, or counting on each request) and whether you saw this race in practice.`,
      followUps: [
        {
          q: 'Would a unique index help here?',
          a: 'Not for "max 5". Unique indexes stop duplicates (for example, the same event processed twice), not counts above a number. For limits you need an atomic counter or a transaction.',
        },
        {
          q: 'Should the frontend also check the limit?',
          a: 'Yes, to show an "Upgrade" message early. But it is only for user experience — the server check is the real one.',
        },
      ],
    },
    {
      id: 'downgrade-over-seat-limit',
      title: 'A tenant downgrades mid-cycle but has more users than the new plan allows',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'stripe-subscriptions-marketplace',
      question: `A SkillKeepr tenant on the **Pro** plan (20 seats) has **12 active users**. In the middle of the billing month they downgrade to **Basic** (5 seats).

"What happens to billing? What happens to the 7 extra users? Walk me through the rules and the code."`,
      hints: [
        'Two separate questions: money (proration, when the change applies) and access (what the extra users can do).',
        'Never delete customer data because of a downgrade.',
        'Common pattern: apply downgrades at the end of the period, and let the admin choose who to deactivate.',
      ],
      solution: `**Idea:** separate **billing** from **entitlements** (what the tenant is allowed to use). Downgrades take effect at the **end of the current period**. Before that date, the admin must bring usage under the new limit; if they do not, the account goes into a safe **over-limit mode** — nothing is deleted.

\`\`\`text
BILLING
- Upgrade   -> immediate, with proration (they pay the difference now).
- Downgrade -> scheduled for the period end. They already paid for Pro this
               month, so they keep Pro until then. No refunds to calculate.
  (Stripe: change the subscription at period end, e.g. with a subscription
   schedule, or update it with proration turned off when the period ends.)

ACCESS (the 7 extra users)
1. At downgrade time: show "You have 12 users, Basic allows 5.
   Choose 7 users to deactivate before <period end>."
2. Until period end: everything works (they are still on Pro).
3. At period end, if still over the limit:
   - Over-limit mode: no new users can be added.
   - The admin picks who stays. Until then, keep the account owner and
     admins active, others become read-only/inactive by a clear rule
     (for example, most recently active first).
   - Data is never deleted. Upgrading again restores access instantly.
\`\`\`

The entitlement check, written so it works for any limit:

\`\`\`javascript
function entitlementState(plan, usage) {
  const over = {};
  for (const [key, limit] of Object.entries(plan.limits)) {
    if ((usage[key] ?? 0) > limit) over[key] = usage[key] - limit;
  }
  return {
    overLimit: Object.keys(over).length > 0,
    over,                                    // how many to remove per resource
    canAdd: (key) => (usage[key] ?? 0) < (plan.limits[key] ?? 0),
  };
}

const basic = { name: 'Basic', limits: { seats: 5, activeJobs: 5 } };
const state = entitlementState(basic, { seats: 12, activeJobs: 3 });
console.log(state.overLimit, state.over);      // true { seats: 7 }
console.log('add user?', state.canAdd('seats'));        // false
console.log('add job?', state.canAdd('activeJobs'));    // true
\`\`\`

**Why it works:** customers are never surprised by data loss, billing stays simple (no mid-cycle refunds for downgrades), and the same function handles seats, job posts and any future limit.

Adapt: say what SkillKeepr really did on downgrade — immediate with proration, or at period end — and how over-limit users were handled.`,
      followUps: [
        {
          q: 'What if the tenant downgrades and then upgrades again in the same month?',
          a: 'Cancel the scheduled downgrade. Because nothing was deleted and the change was not applied yet, they simply stay on Pro.',
        },
        {
          q: 'Where does the "current plan" live — Stripe or your DB?',
          a: 'Stripe is the source of truth for money. Our database keeps a copy of plan, status and limits, updated by webhooks, so access checks are fast and do not call Stripe on every request.',
        },
      ],
    },
    {
      id: 'node18-upgrade-broke-production',
      title: 'The Node 18 upgrade broke a dependency in production — rollback and fix plan',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'node-16-to-18-migration',
      question: `"You led the Node 16 → 18 migration. Imagine the new image goes live and one service starts crashing on startup with an error from a native module (for example \`bcrypt\` or \`sharp\`): *was compiled against a different Node.js version*. Staging was fine. What do you do, step by step?"`,
      hints: [
        'First restore service (rollback), then investigate. Say this order clearly.',
        'Native modules are compiled for one Node ABI version. Where were they compiled — on the build machine or inside the image?',
        'Ask: why did staging not catch it? The fix includes the process, not just the package.',
      ],
      solution: `**Idea:** roll back fast, then find why production differs from staging, fix the build, and add a check so it cannot happen again.

\`\`\`text
1. ROLL BACK (minutes)
   - Redeploy the previous image tag (Docker images are immutable, so the
     old Node 16 image is still there). For Lambda: point the alias back
     to the previous version.
   - Confirm health checks and error rates are back to normal.
   - Tell the team: "Rolled back, service is up, investigating."

2. FIND THE CAUSE
   - Error says the native module was built for a different Node version.
     Native addons are compiled for one Node ABI (binary interface).
   - Likely: node_modules was built OUTSIDE the image (on CI with Node 16,
     or copied from the host) and then copied into a node:18 image.
     Or a cache restored an old node_modules.
   - Why staging passed: staging built the image differently / had a fresh
     cache. Compare the two build logs.

3. FIX
   - Install dependencies INSIDE the image, with the same Node version:
     a multi-stage Dockerfile that runs "npm ci" in a node:18 stage.
   - Add node_modules to .dockerignore so the host copy never leaks in.
   - Upgrade the native package to a version that supports Node 18.
   - Pin the version in "engines" and .nvmrc; CI uses the same version.

4. RE-RELEASE SAFELY
   - Same image goes to staging, then production (build once, deploy many).
   - Roll out one service at a time; watch errors and memory for a while.

5. PREVENT
   - CI check: start the container and hit /health before publishing it.
   - Short note in the migration doc: "always npm ci inside the image".
\`\`\`

\`\`\`dockerfile
# Dependencies are compiled inside the same Node version that runs them
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
CMD ["node", "src/server.js"]
\`\`\`

**Why it works:** the rollback limits the damage; the build fix removes the real cause (binaries built for another Node version); the health check in CI catches the same class of problem next time.

Adapt: describe the real breaking changes you met in the migration (OpenSSL 3 errors in old build tools, \`localhost\` resolving to IPv6 \`::1\`, a library that needed upgrading). Do not claim a production incident that did not happen — you can say "this is how I would handle it".`,
      followUps: [
        {
          q: 'How do you roll back if the migration also changed the database?',
          a: 'Avoid that: a runtime upgrade should not change data. If a schema change is needed, make it backward compatible (expand first, contract later) so the old version still runs.',
        },
        {
          q: 'Why not upgrade straight to Node 20?',
          a: 'Adapt to your situation. A reasonable answer: we chose the smallest safe jump that got us onto a supported LTS with all our key libraries ready; the same process makes the next jump easier.',
        },
      ],
    },
    {
      id: 'voice-agent-why-microservice',
      title: 'Why a separate microservice for the voice agent? What did it cost you?',
      difficulty: 'medium',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'octagnt-why-x-over-y',
      question: `"You built the AI Voice Interview Agent as a standalone microservice on GCP, while the rest of OCTAGNT is a separate backend. Why not just add it to the main backend? What are the real costs of your choice, and how did you pay for them?"`,
      hints: [
        'Give reasons tied to how a live voice call behaves: long-lived WebSockets, streaming audio, latency, different scaling.',
        'Then list the costs honestly: network hop, auth between services, debugging across services, more deployments.',
        'Strong answers say how each cost was reduced.',
      ],
      solution: `**Idea:** a phone call is a very different workload from normal API requests. Splitting it out gave isolation and independent scaling. It also added real costs, which I handled on purpose.

\`\`\`text
WHY SEPARATE
1. Different workload  - Each call holds a WebSocket open for minutes and
                         streams audio both ways. Normal API requests last
                         milliseconds. Mixing them makes scaling and timeouts hard.
2. Failure isolation   - A bug or overload in audio handling cannot take
                         down login, jobs or the dashboard.
3. Independent scaling - Scale by number of live calls, not by web traffic.
4. Latency             - Runs on GCP close to Google STT/TTS.
5. Independent deploys - Change prompts/voice logic without redeploying
                         the main app.
6. Smaller blast radius for secrets - Twilio and speech credentials live
                         only in this service.

COSTS  ->  HOW I HANDLED THEM
- Extra network hop          -> only at call start/end, never per audio chunk.
- Service-to-service auth    -> authenticated calls between services
                                (Adapt: API key / signed token / GCP IAM).
- Debugging across services  -> a correlation id (callId) in every log line
                                on both sides.
- Data consistency           -> results sent back once the call ends;
                                the receiver is idempotent (same callId twice
                                = no duplicate).
- More infra and CI          -> Docker image + its own pipeline, same template
                                as the main backend.
- Contract changes           -> versioned request/response shape.

WHEN I WOULD NOT SPLIT
- If it were simple request/response logic with the same scaling needs,
  a module inside the main backend is cheaper.
\`\`\`

Adapt: confirm how the services really talked (HTTP + webhook, Pub/Sub, polling) and which GCP service hosted it (Cloud Run, GKE, Compute Engine). Long WebSocket calls affect that choice — for example Cloud Run has a request timeout you must set high enough for a whole call.`,
      followUps: [
        {
          q: 'What happens to the main app if the voice service is down?',
          a: 'Everything else keeps working. Starting a voice screening fails with a clear status ("could not start, retry"), and the recruiter can retry later. Adapt: say what your system did.',
        },
        {
          q: 'How do you scale a service with long-lived WebSockets?',
          a: 'Scale on concurrent calls (not CPU only), limit calls per instance, drain instances gracefully on deploy so live calls finish, and keep any shared state outside the instance.',
        },
      ],
    },
    {
      id: 'test-stripe-end-to-end',
      title: 'How would you test the Stripe integration end to end?',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'testing-and-quality',
      question: `"Billing bugs cost real money. How do you test SkillKeepr's Stripe integration — subscriptions, upgrades, renewals, failed payments, coupons and webhooks — without waiting a month for a renewal?"`,
      hints: [
        'Use layers: unit tests for your own logic, integration tests against Stripe test mode, and a manual checklist for the UI.',
        'Stripe has tools for this: test mode, test cards, the Stripe CLI (`listen` and `trigger`) and test clocks.',
        'List the scenarios that break most often: failed renewal, duplicate webhook, downgrade, coupon expiry.',
      ],
      solution: `**Idea:** test **my** logic in fast unit tests, and test the **real flow** against Stripe **test mode**, using test clocks to move time forward.

\`\`\`text
LAYER 1 — UNIT TESTS (fast, no network)
- "event -> entitlement" mapping: given a saved Stripe event JSON fixture,
  does the tenant get the right plan, status and limits?
- Idempotency: the same event processed twice changes nothing the 2nd time.
- Out-of-order events: an older event must not overwrite newer state.
- Limit checks and proration display maths in our code.

LAYER 2 — INTEGRATION WITH STRIPE TEST MODE
- Test API keys, test products and prices.
- Stripe CLI forwards real test webhooks to my local server.
- Test clocks: attach a customer to a clock and move it forward a month
  to trigger a real renewal invoice — no waiting.
- Test cards:
    4242 4242 4242 4242  -> payment succeeds
    4000 0025 0000 3155  -> needs 3D Secure authentication
    4000 0000 0000 0341  -> card attaches, but later charges fail
                            (perfect for a failed renewal)

LAYER 3 — SCENARIO CHECKLIST (before each billing release)
[ ] New subscription -> features unlock
[ ] Upgrade mid-cycle -> proration line, higher limits at once
[ ] Downgrade -> applied at period end, over-limit handling
[ ] Renewal succeeds -> period dates updated
[ ] Renewal fails -> past_due, warning banner, access rules after retries
[ ] Coupon applied / expired
[ ] Add-on bought and removed
[ ] Duplicate webhook and wrong signature -> handled safely
\`\`\`

\`\`\`bash
# Forward test-mode webhooks to the local server
stripe listen --forward-to localhost:4000/webhooks/stripe

# Fire individual events at the handler
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.updated
\`\`\`

**Why it works:** unit tests catch logic mistakes in seconds; test mode and test clocks prove the real Stripe flow; the checklist covers what the UI shows the user.

Adapt: say which of these layers you really had in SkillKeepr (for example Jest unit tests + manual test-mode checks) and which you would add.`,
      followUps: [
        {
          q: 'How do you make sure test mode never touches live data?',
          a: 'Separate keys and webhook secrets per environment from environment variables, a startup check that refuses live keys outside production, and separate Stripe products per mode.',
        },
        {
          q: 'How would you catch a webhook you forgot to handle?',
          a: 'Log every unhandled event type with a warning and review them. Only subscribe the endpoint to the events you actually handle, so the list is explicit.',
        },
      ],
    },
    {
      id: 'llm-json-output-crashes',
      title: 'JD generation crashes on some AI responses — fix the parsing',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'llm-in-production',
      question: `The JD generator works most of the time, but a few times a day the API returns 500 with a \`SyntaxError\` thrown by \`JSON.parse\`. Sometimes the UI also shows an empty "Requirements" section. What is wrong and how do you make it robust?

\`\`\`javascript
async function generateJd(input) {
  const completion = await openai.chat.completions.create({
    model: process.env.JD_MODEL,
    messages: [
      { role: 'system', content: 'Write a job description as JSON.' },
      { role: 'user', content: JSON.stringify(input) },
    ],
  });
  return JSON.parse(completion.choices[0].message.content);
}
\`\`\``,
      hints: [
        'An LLM returns text. Sometimes that text is wrapped in a Markdown code fence, or is cut off, or has missing fields.',
        'Ask the API for JSON mode / a JSON schema, and still validate the result yourself.',
        'Decide what happens on failure: retry once, then return a clear error — never a 500 with a stack trace.',
      ],
      solution: `**Bugs:**
1. The model sometimes wraps JSON in a Markdown code fence or adds a sentence before it, so \`JSON.parse\` throws.
2. Even valid JSON is never **checked**: a missing \`requirements\` array reaches the UI as an empty section.
3. No retry, no timeout, no friendly error.

**Fix:** (a) ask for structured output (OpenAI supports \`response_format\` with JSON mode or a JSON schema), (b) extract and **validate** anyway, (c) retry once, then fail clearly.

\`\`\`javascript
// Pull the JSON object out of the text, even if it is wrapped in extra text
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('No JSON object found');
  return JSON.parse(text.slice(start, end + 1));
}

// Small hand-written validator (in the real app a schema library like zod)
function validateJd(jd) {
  const errors = [];
  if (typeof jd.summary !== 'string' || jd.summary.length < 20) errors.push('summary');
  for (const key of ['responsibilities', 'requirements']) {
    if (!Array.isArray(jd[key]) || jd[key].length === 0) errors.push(key);
  }
  if (errors.length) throw new Error('Invalid fields: ' + errors.join(', '));
  return jd;
}

async function generateJd(input, callModel, maxAttempts = 2) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const text = await callModel(input);  // uses response_format JSON + a timeout
      return validateJd(extractJson(text));
    } catch (err) {
      lastError = err;                       // log it with a request id
    }
  }
  const e = new Error('Could not generate a JD right now. Please try again.');
  e.status = 502;
  e.cause = lastError;
  throw e;
}

// Demo: first answer is wrapped in a code fence AND misses "requirements"; retry succeeds
const fence = '\\u0060'.repeat(3);
const answers = [
  fence + 'json\\n{"summary":"We need a backend engineer for our hiring platform.","responsibilities":["Build APIs"]}\\n' + fence,
  'Here you go: {"summary":"We need a backend engineer for our hiring platform.","responsibilities":["Build APIs"],"requirements":["3+ years Node.js"]}',
];
const fakeModel = async () => answers.shift();
generateJd({ title: 'Backend Engineer' }, fakeModel).then((jd) => console.log(jd.requirements));
\`\`\`

**Why it works:** structured output makes bad JSON rare; \`extractJson\` handles the common wrapper text; the validator guarantees the UI always gets every section; one retry fixes most random failures, and the user gets a clear message instead of a crash.

Adapt: say what your real code did — JSON mode, a schema library, retries — and which model setting you used.`,
      followUps: [
        {
          q: 'What if the output is cut off in the middle?',
          a: 'Check `finish_reason`. If it is `length`, the answer hit the token limit: raise `max_tokens` a little or ask for shorter sections, then retry.',
        },
        {
          q: 'How do you stop prompt injection through the job inputs?',
          a: 'Put user inputs in the user message as data (JSON), keep rules in the system message, limit input length, validate the output shape, and always have a human review before publishing.',
        },
      ],
    },
    {
      id: 'zoho-token-refresh-single-flight',
      title: 'Ten parallel Zoho calls all try to refresh the token at once — fix it',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'zoho-crm-provisioning',
      question: `Zoho CRM uses OAuth: a short-lived **access token** (about one hour) and a long-lived **refresh token**. When the access token expires, ten parallel lead-creation calls all get 401 and all call the refresh endpoint at the same time. Zoho rate-limits token refreshes, so some fail.

Write a \`getAccessToken()\` helper that:
- refreshes a little **before** expiry,
- makes sure only **one** refresh runs at a time (others wait for it),
- lets a caller force a refresh after a 401, and retry once.`,
      hints: [
        'Store the in-flight refresh **promise**, not just the token. Everyone who arrives during the refresh awaits the same promise.',
        'Clear the stored promise in `finally`, so a failed refresh can be tried again later.',
        'Refresh when less than ~5 minutes are left, so a token never expires in the middle of a request.',
      ],
      solution: `**Idea:** "single-flight" refresh. The first caller starts the refresh and saves the promise. Every other caller awaits that same promise.

\`\`\`javascript
function createTokenManager(refreshFn, skewMs = 5 * 60 * 1000) {
  let token = null;      // { value, expiresAt }
  let inFlight = null;   // the running refresh promise, shared by all callers

  async function refresh() {
    if (!inFlight) {
      inFlight = refreshFn()
        .then((t) => { token = t; return t.value; })
        .finally(() => { inFlight = null; });
    }
    return inFlight;
  }

  async function getAccessToken({ force = false } = {}) {
    const fresh = token && token.expiresAt - Date.now() > skewMs;
    if (!force && fresh) return token.value;
    return refresh();
  }

  // Wrap an API call: on 401, force ONE refresh and retry once
  async function withAuth(call) {
    const res = await call(await getAccessToken());
    if (res.status !== 401) return res;
    return call(await getAccessToken({ force: true }));
  }

  return { getAccessToken, withAuth };
}

// Demo with a fake refresh endpoint
let refreshCalls = 0;
const fakeRefresh = async () => {
  refreshCalls++;
  await new Promise((r) => setTimeout(r, 50));
  return { value: 'token-' + refreshCalls, expiresAt: Date.now() + 60 * 60 * 1000 };
};
const tm = createTokenManager(fakeRefresh);
const tokens = await Promise.all(Array.from({ length: 10 }, () => tm.getAccessToken()));
console.log('refresh calls:', refreshCalls, 'tokens:', new Set(tokens).size); // 1 and 1
\`\`\`

**Why it works:** JavaScript runs one piece of code at a time in a process, so the check \`if (!inFlight)\` and the assignment happen together. All ten callers share one network request.

**Edge cases:**
- **Several server instances** each refresh on their own. That is usually fine; if Zoho limits become a problem, keep the token in a shared store (for example Redis) with a short lock.
- Store the refresh token **encrypted**, never in logs.
- If the refresh token itself is invalid (revoked), stop retrying and alert — a human must reconnect the integration.`,
      followUps: [
        {
          q: 'Why refresh 5 minutes early instead of waiting for a 401?',
          a: 'It avoids a failed request on every expiry and avoids long multi-step jobs failing in the middle. The 401 retry stays as a safety net for clock differences or revoked tokens.',
        },
        {
          q: 'What if the refresh call fails?',
          a: 'The `finally` clears `inFlight`, all waiting callers get the error, and the next call tries again. Add a backoff and an alert if it keeps failing.',
        },
      ],
    },
    {
      id: 'websocket-signalling-room-leak',
      title: 'Anyone can join any live interview — find the signalling bug',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'occasional',
      relatedTopic: 'jitsi-live-interviews',
      question: `This is the WebSocket signalling server for SkillKeepr live interviews (Jitsi handles the media). A security review found two problems: a user from another company joined an interview by guessing its id, and candidates sometimes see "participant joined" messages from **other** interviews. Find and fix the bugs.

\`\`\`javascript
import { Server } from 'socket.io';
const io = new Server(httpServer);

io.on('connection', (socket) => {
  socket.on('join-interview', ({ interviewId, name }) => {
    socket.join(interviewId);
    io.emit('participant-joined', { interviewId, name });
  });

  socket.on('signal', ({ interviewId, payload }) => {
    socket.to(interviewId).emit('signal', payload);
  });
});
\`\`\``,
      hints: [
        'Who is this socket? Nothing checks identity on connection.',
        'Is the user allowed in THIS interview, for THIS tenant? Nothing checks that either.',
        'Look at `io.emit` — who receives it?',
      ],
      solution: `**Bugs:**
1. **No authentication** — any connection is accepted.
2. **No authorisation** — anyone who knows (or guesses) an \`interviewId\` can join. The tenant is never checked.
3. \`io.emit\` sends to **every connected socket** on the server — that is the cross-interview leak. It should go only to the room.
4. \`signal\` trusts the \`interviewId\` from the client, even for rooms the socket never joined.

**Fix:**

\`\`\`javascript
import { Server } from 'socket.io';
const io = new Server(httpServer);

// 1) Authenticate during the handshake
io.use(async (socket, next) => {
  try {
    socket.data.user = await verifyJwt(socket.handshake.auth.token); // { id, tenantId, name }
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

const roomName = (tenantId, interviewId) => \`tenant:\${tenantId}:interview:\${interviewId}\`;

io.on('connection', (socket) => {
  const user = socket.data.user;

  socket.on('join-interview', async ({ interviewId }, ack) => {
    // 2) Authorise: interview must belong to the user's tenant AND list them
    const interview = await Interview.findOne({
      _id: interviewId,
      tenantId: user.tenantId,
      participantIds: user.id,
    });
    if (!interview) return ack?.({ ok: false, error: 'not allowed' });

    const room = roomName(user.tenantId, interviewId);
    await socket.join(room);
    socket.data.room = room;
    // 3) Only this room hears about it (and not the sender)
    socket.to(room).emit('participant-joined', { name: user.name });
    ack?.({ ok: true });
  });

  // 4) Use the room stored on the server, not the id sent by the client
  socket.on('signal', ({ payload }) => {
    if (!socket.data.room) return;
    socket.to(socket.data.room).emit('signal', payload);
  });
});
\`\`\`

**Also worth saying:** candidates are not tenant users — give them a **short-lived, single-interview token** in their invite link instead of a normal login. Use **random, unguessable** meeting room names for Jitsi too, and (if self-hosted) enable Jitsi JWT authentication so the media room has the same protection as signalling.

Adapt: say which library you really used (socket.io or plain \`ws\`) and how users were authenticated.`,
      followUps: [
        {
          q: 'How do you scale this signalling server to several instances?',
          a: 'Rooms live in each instance\'s memory, so use an adapter that shares events between instances (for socket.io, the Redis adapter) and sticky sessions on the load balancer.',
        },
        {
          q: 'How would you test the fix?',
          a: 'Automated test: connect as a user from tenant B and try to join tenant A\'s interview — expect `not allowed`. Connect two interviews and assert no events cross between them.',
        },
      ],
    },
    {
      id: 'private-candidate-files-s3',
      title: 'Keep candidate resumes in S3 private across tenants',
      difficulty: 'medium',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'docker-aws-cicd',
      question: `Candidates upload resumes (PDF/DOCX) and recruiters download them. "Design the upload and download flow on AWS S3. How do you make sure a file is never public, a recruiter from tenant A can never download tenant B's file, and a 2 GB upload cannot hurt your server?"`,
      hints: [
        'The bucket stays private. Access happens through short-lived **presigned URLs** created by your API after a permission check.',
        'Put the tenant in the object key, but do not rely on the key alone — check the database record.',
        'Let the browser upload directly to S3, so big files never pass through your Node server.',
      ],
      solution: `**Idea:** private bucket + tenant-prefixed keys + presigned URLs created only after an auth check. The file bytes go straight between the browser and S3.

\`\`\`text
UPLOAD
Browser --(1) "I want to upload resume.pdf, 300 KB"--> API
API: check user + tenant, check type/size, create File record (status: pending)
API --(2) presigned POST (5 min, max size, content type)--> Browser
Browser --(3) upload bytes directly--> S3  tenants/<tenantId>/candidates/<id>/<uuid>.pdf
S3 event --(4)--> Lambda: verify type, (virus scan / parse), mark File "ready"

DOWNLOAD
Browser --(1) GET /files/:id--> API
API: File.findOne({ _id, tenantId: user.tenantId }) + permission check
API --(2) presigned GET (short expiry, e.g. a few minutes)--> Browser
Browser --(3) downloads directly--> S3
\`\`\`

\`\`\`javascript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.FILES_BUCKET;
const ALLOWED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function createUpload(user, candidateId, contentType) {
  if (!ALLOWED.includes(contentType)) throw new Error('File type not allowed');
  const key = \`tenants/\${user.tenantId}/candidates/\${candidateId}/\${randomUUID()}\`;
  await FileRecord.create({ tenantId: user.tenantId, candidateId, key, status: 'pending' });
  return createPresignedPost(s3, {
    Bucket: BUCKET,
    Key: key,
    Conditions: [
      ['content-length-range', 1, 10 * 1024 * 1024],   // max 10 MB, enforced by S3
      ['eq', '$Content-Type', contentType],
    ],
    Fields: { 'Content-Type': contentType },
    Expires: 300,                                        // seconds
  });
}

export async function createDownload(user, fileId) {
  // Tenant check in the DATABASE, not just trusting the key
  const file = await FileRecord.findOne({ _id: fileId, tenantId: user.tenantId, status: 'ready' });
  if (!file) throw new Error('Not found');
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: file.key }), { expiresIn: 300 });
}
\`\`\`

**Key points:**
- **Block Public Access** on the bucket, encryption at rest, HTTPS only.
- Random UUID file names — never the user's file name in the key.
- Return "Not found" (not "Forbidden") for other tenants' files, so ids cannot be probed.
- The size limit is enforced by S3 itself through the presigned POST policy.

Adapt: say what you really used S3 and Lambda for in your projects; present the rest as "how I would design it".`,
      followUps: [
        {
          q: 'Why not stream the upload through the Node server?',
          a: 'Big files use server memory, bandwidth and time, and block other work. Direct upload with a presigned URL keeps the API small and fast; the API only controls permission.',
        },
        {
          q: 'A presigned download URL leaks in a chat. What is the risk?',
          a: 'Anyone with the link can download until it expires, so keep expiry short (minutes) and generate a new one each time. Log who generated each link.',
        },
      ],
    },
    {
      id: 'rebuild-skillkeepr-today',
      title: 'If you rebuilt SkillKeepr today, what would you change?',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'improvements-both-projects',
      question: `"Knowing what you know now, if you started SkillKeepr again from zero, what would you keep and what would you do differently? Be specific."`,
      hints: [
        'Start with what you would KEEP — it shows the original decisions were reasonable.',
        'Give 3-4 specific changes, each with the problem it solves. Avoid "I would use microservices" without a reason.',
        'Do not trash the old team or code. Frame changes as learning from scale and real usage.',
      ],
      solution: `**Idea:** keep → change (with reasons) → what I would NOT change just because it is trendy.

\`\`\`text
KEEP
- MongoDB with a shared database and tenantId on every document:
  simple to run, and fits the flexible candidate profiles.
- Stripe as the source of truth for money; our DB as a fast copy.
- Modular monolith for the core app — the team was small, one deploy is simpler.

CHANGE  (each one solves a real pain)
1. Tenant isolation at the data layer from day one
   -> an automatic tenant filter (plugin + request context) that fails closed,
      instead of relying on every query remembering tenantId.
2. A separate "entitlements" module
   -> one place answers "can this tenant do X?" (plan + add-ons + usage limits).
      Billing webhooks only update it. Features only read it.
3. Search on a real search engine earlier
   -> Boolean search on aggregation works, but ranking and typo tolerance
      are easier with Atlas Search / OpenSearch once data grows.
4. Reliable background work
   -> a job queue for webhooks, emails and provisioning, with retries and
      a dead-letter list, instead of doing work inside requests.
5. TypeScript and contract tests
   -> catch shape mismatches between frontend, backend and Stripe events.
6. Observability early
   -> structured logs with tenantId and requestId, and alerts on error rate.

NOT CHANGE
- I would not split into many microservices on day one. The cost is high and
  the team size did not need it.
\`\`\`

Adapt: pick the 3-4 changes that match pains you really saw. If one of these already existed in SkillKeepr, say so and drop it from the list.`,
      followUps: [
        {
          q: 'Which one change would give the most value?',
          a: 'The automatic tenant filter — a data leak between companies is the most serious failure a multi-tenant HR product can have, and the fix is cheap if done early.',
        },
        {
          q: 'Why did the team not do these from the start?',
          a: 'Early on, the priority was shipping features to learn what customers need. Many of these only pay off at a larger size. That is a normal trade-off, not a mistake.',
        },
      ],
    },
    {
      id: 'boolean-query-compiler',
      title: 'Write the Boolean search compiler: query string → MongoDB $match',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'boolean-search-engine',
      question: `"You built a Boolean search engine. Show me. Write a function that turns a recruiter query into a MongoDB \`$match\` filter."

\`\`\`text
Input : (react OR angular) AND node NOT php location:"Kochi"
Rules : NOT binds tightest, then AND, then OR. Brackets override.
        Two terms next to each other = AND (implicit AND).
        Quoted text = phrase. field:value = field filter (only skill, title, location).
Output: a MongoDB filter using $and / $or / $nor
\`\`\`

Reject bad input (unclosed bracket or quote, unknown field) with a clear error. Do not allow regex injection.`,
      hints: [
        'Three steps: tokenize (split into words, quotes, brackets, operators) → parse into a tree → compile the tree into Mongo.',
        'Recursive descent: one function per precedence level — parseOr calls parseAnd, parseAnd calls parseNot, parseNot calls parsePrimary.',
        'In parseAnd, if the next token starts a new term (word, phrase, field, "(" or NOT) without an AND, treat it as an implicit AND.',
      ],
      solution: `**Idea:** tokenize → parse with recursive descent (one function per precedence level) → compile the tree. Words match a normalised \`keywords\` array (fast, indexable). Phrases use an **escaped** regex, so user text can never become a regex pattern or a Mongo operator.

\`\`\`javascript
const FIELDS = { skill: 'skills', title: 'titleWords', location: 'location' }; // whitelist
const OPS = ['AND', 'OR', 'NOT'];
const escapeRegex = (s) => s.replace(/[.*+?^$()|[\\]{}\\\\]/g, '\\\\$&');

function tokenize(input) {
  const tokens = [];
  let i = 0;
  const readQuoted = () => {
    const end = input.indexOf('"', i + 1);
    if (end === -1) throw new Error('Unclosed quote');
    const text = input.slice(i + 1, end);
    i = end + 1;
    return text;
  };
  while (i < input.length) {
    const ch = input[i];
    if (ch === ' ') { i++; continue; }
    if (ch === '(' || ch === ')') { tokens.push({ type: ch }); i++; continue; }
    if (ch === '"') { tokens.push({ type: 'PHRASE', value: readQuoted() }); continue; }
    let j = i;
    while (j < input.length && !' ()"'.includes(input[j])) j++;
    const word = input.slice(i, j);
    i = j;
    if (OPS.includes(word)) tokens.push({ type: word });
    else if (word.includes(':')) {
      const [field, rest] = [word.slice(0, word.indexOf(':')), word.slice(word.indexOf(':') + 1)];
      const value = rest || (input[i] === '"' ? readQuoted() : '');
      if (!value) throw new Error('Missing value for ' + field);
      tokens.push({ type: 'FIELD', field: field.toLowerCase(), value });
    } else tokens.push({ type: 'TERM', value: word });
  }
  if (tokens.length > 50) throw new Error('Query too long');
  return tokens;
}

function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const startsTerm = (t) => t && ['TERM', 'PHRASE', 'FIELD', '(', 'NOT'].includes(t.type);

  function parseOr() {
    const children = [parseAnd()];
    while (peek()?.type === 'OR') { pos++; children.push(parseAnd()); }
    return children.length === 1 ? children[0] : { op: 'OR', children };
  }
  function parseAnd() {
    const children = [parseNot()];
    while (peek()?.type === 'AND' || startsTerm(peek())) {
      if (peek().type === 'AND') pos++;        // explicit AND
      children.push(parseNot());               // or implicit AND
    }
    return children.length === 1 ? children[0] : { op: 'AND', children };
  }
  function parseNot() {
    if (peek()?.type === 'NOT') { pos++; return { op: 'NOT', child: parseNot() }; }
    return parsePrimary();
  }
  function parsePrimary() {
    const t = tokens[pos++];
    if (!t) throw new Error('Unexpected end of query');
    if (t.type === '(') {
      const node = parseOr();
      if (tokens[pos++]?.type !== ')') throw new Error('Missing )');
      return node;
    }
    if (['TERM', 'PHRASE', 'FIELD'].includes(t.type)) return t;
    throw new Error('Unexpected ' + t.type);
  }

  const tree = parseOr();
  if (pos < tokens.length) throw new Error('Unexpected ' + tokens[pos].type);
  return tree;
}

function compile(node) {
  switch (node.op || node.type) {
    case 'AND': return { $and: node.children.map(compile) };
    case 'OR': return { $or: node.children.map(compile) };
    case 'NOT': return { $nor: [compile(node.child)] };
    case 'TERM': return { keywords: node.value.toLowerCase() };
    case 'PHRASE': return { profileText: { $regex: escapeRegex(node.value), $options: 'i' } };
    case 'FIELD': {
      const path = FIELDS[node.field];
      if (!path) throw new Error('Unknown field: ' + node.field);
      return { [path]: node.value.toLowerCase() };
    }
  }
}

const buildFilter = (tenantId, q) => ({ tenantId, status: 'active', ...compile(parse(tokenize(q))) });

console.log(JSON.stringify(buildFilter('t1', '(react OR angular) AND node NOT php location:"Kochi"'), null, 1));
console.log(JSON.stringify(compile(parse(tokenize('"node.js (senior)"')))));
for (const bad of ['(react OR node', 'salary:100', 'react AND']) {
  try { buildFilter('t1', bad); } catch (e) { console.log(bad, '->', e.message); }
}
\`\`\`

**Why it works:**
- Precedence comes from the call chain: \`parseOr → parseAnd → parseNot → parsePrimary\`. The deeper the function, the tighter the operator binds, so \`a OR b AND c\` becomes \`a OR (b AND c)\`.
- **Safety:** fields are whitelisted, phrases are regex-escaped (\`node.js (senior)\` is matched literally), values are plain strings so a user cannot inject \`$where\` or \`$regex\`, and long queries are rejected.
- **Speed:** \`tenantId\` and \`status\` are equality filters on a compound index; terms hit a multikey index on \`keywords\` (a lowercase array saved with each profile).

**Complexity:** O(n) in the number of tokens for tokenize, parse and compile.

Adapt: say how your real version matched terms (regex on fields, a normalised keywords array, or a text index).`,
      followUps: [
        {
          q: 'Why $nor for NOT instead of $not?',
          a: '`$not` works on one field\'s operator expression; `$nor: [subFilter]` negates a whole sub-filter, including nested AND/OR groups — exactly what NOT ( ... ) needs.',
        },
        {
          q: 'How do you stop a huge or deeply nested query from hurting the database?',
          a: 'Limit the number of tokens and the nesting depth, set `maxTimeMS` on the query, and always start with the indexed tenant + status filter so the expensive part runs on fewer documents.',
        },
        {
          q: 'How would you test the parser?',
          a: 'Table-driven unit tests: input string → expected filter, covering precedence, implicit AND, nested brackets, phrases, field filters and every error message.',
        },
      ],
    },
    {
      id: 'boolean-search-slow-5m',
      title: 'Your Boolean search is slow on 5 million candidates — what do you do?',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'boolean-search-engine',
      question: `"Your Boolean search worked well for small tenants. Now one big tenant has **5 million** candidate profiles. A search like \`(react OR node) AND NOT php\` takes many seconds, and recruiters complain. What do you do — in what order?"`,
      hints: [
        'Measure first: `explain("executionStats")` — compare `totalDocsExamined` with `nReturned`.',
        'Usual suspects: case-insensitive regex on free text, NOT clauses (cannot use indexes well), `$skip` pagination, counting every match.',
        'Fix in layers: indexes and query shape → normalised fields → pagination and counts → a real search engine if needed.',
    ],
      solution: `**Idea:** measure, find what makes the database scan too many documents, fix the cheap things first, and move to a search engine only when MongoDB queries are no longer the right tool.

\`\`\`text
STEP 1 — MEASURE
- Slow query log / profiler: which queries, how often, how slow.
- explain("executionStats") on a real slow query:
    totalDocsExamined 2,000,000 vs nReturned 20  -> scanning, not seeking.
    Stage COLLSCAN -> no useful index at all.

STEP 2 — LIKELY CAUSES IN A BOOLEAN SEARCH
- Case-insensitive regex (/react/i) cannot use an index efficiently
  -> scans every profile of the tenant.
- NOT php ($nor) cannot narrow the search; it only removes rows.
- $skip pagination: page 500 still reads all earlier rows.
- Counting all matches for "12,345 results" scans everything again.

STEP 3 — FIXES, CHEAPEST FIRST
1. Selective equality filters first, on a compound index (ESR rule):
   { tenantId: 1, status: 1, updatedAt: -1 }
2. Replace regex on words with a NORMALISED array saved on write:
   keywords: ["react", "node", "mongodb"]  (lowercase, trimmed, synonyms)
   -> exact matches use a multikey index { tenantId: 1, keywords: 1 }.
   Keep regex only for quoted phrases, after the indexed filters.
3. Keyset pagination: "updatedAt < last seen" instead of $skip.
4. Cheap counts: stop counting at a cap ("1,000+ results").
5. Return only the fields the list shows (projection).
6. maxTimeMS on search queries so one bad query cannot hold resources.
7. Cache very common searches per tenant for a short time.

STEP 4 — IF STILL TOO SLOW: A SEARCH ENGINE
- MongoDB Atlas Search (Lucene) or OpenSearch/Elasticsearch: inverted
  index, Boolean must/should/mustNot, ranking, typo tolerance.
- Keep MongoDB as the source of truth; sync profiles to the search index.
\`\`\`

\`\`\`javascript
// mongosh — run on the real collection
db.candidates.createIndex({ tenantId: 1, keywords: 1, updatedAt: -1 });

db.candidates.find(
  {
    tenantId: ObjectId('...'),
    status: 'active',
    keywords: { $in: ['react', 'node'] },  // uses the multikey index
    $nor: [{ keywords: 'php' }],           // filters what is left
    updatedAt: { $lt: lastSeenUpdatedAt }, // keyset pagination
  },
  { name: 1, title: 1, skills: 1, updatedAt: 1 },
).sort({ updatedAt: -1 }).limit(20).maxTimeMS(2000).explain('executionStats');
// Goal: IXSCAN, and totalDocsExamined close to nReturned
\`\`\`

**Why it works:** the database is fast when it can **seek** with an index and slow when it must **scan**. Every step moves work from scanning to seeking, or avoids work completely (counts, deep pages).

Adapt: say which of these you did in SkillKeepr (compound indexes and pipeline order are on your resume) and which are "next steps I would take". Do not claim a 5M-row tenant if you did not have one.`,
      followUps: [
        {
          q: 'How do you keep the keywords array correct?',
          a: 'Build it in one function on every create/update of a profile (lowercase, trim, apply a synonym map like "js" → "javascript"). Run a one-time backfill script for old documents, in batches.',
        },
        {
          q: 'How do you keep MongoDB and a search engine in sync?',
          a: 'Use MongoDB change streams (or an outbox + queue) to push changes to the index, make the sync idempotent, and run a periodic re-index to repair drift. Atlas Search does this sync for you.',
        },
      ],
    },
    {
      id: 'search-relevance-typo-tolerance',
      title: 'Add relevance ranking and typo tolerance to your candidate search',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'boolean-search-engine',
      question: `"Recruiters say: results come back in no useful order, and searching \`reactjs\` or \`recat\` finds nothing. How would you add **relevance ranking** and **typo tolerance** to your Boolean search, without breaking strict Boolean logic for power users?"`,
      hints: [
        'Boolean logic decides WHICH documents match. Ranking decides the ORDER. Keep them separate.',
        'Quick win without new infra: compute a score in the aggregation with `$addFields` and sort by it.',
        'Typo tolerance needs fuzzy matching (edit distance) — a search engine (Atlas Search / OpenSearch) does this well. Also synonyms.',
      ],
      solution: `**Idea:** keep the Boolean filter as the **gate** (what matches), then **score** what passed. Typo tolerance and synonyms belong in a search engine; MongoDB aggregation can do a simple score today.

**Option 1 — score in the aggregation (no new infra):**

\`\`\`javascript
// The Boolean $match stays exactly as before; ranking only adds a score
function rankedPipeline(filter, terms) {
  return [
    { $match: filter },                           // the Boolean gate
    { $addFields: {
        score: { $add: [
          // +3 for each searched term in the job title
          ...terms.map((t) => ({ $cond: [{ $in: [t, '$titleWords'] }, 3, 0] })),
          // +2 for each term in the skills list
          ...terms.map((t) => ({ $cond: [{ $in: [t, '$skills'] }, 2, 0] })),
          // +1 if the profile was updated in the last 90 days
          { $cond: [{ $gte: ['$updatedAt', new Date(Date.now() - 90 * 864e5)] }, 1, 0] },
        ] },
    } },
    { $sort: { score: -1, updatedAt: -1 } },
    { $limit: 20 },
  ];
}
console.log(JSON.stringify(rankedPipeline({ tenantId: 't1', keywords: 'react' }, ['react']), null, 1).slice(0, 400));
\`\`\`

Limit: sorting by a computed score cannot use an index, so it only works well when the Boolean gate leaves a manageable number of documents.

**Option 2 — a search engine (Atlas Search shown; OpenSearch is similar):**

\`\`\`text
$search: {
  compound: {
    must:    [ text: { query: "node",  path: "skills" } ],            -> strict AND
    mustNot: [ text: { query: "php",   path: "skills" } ],            -> strict NOT
    should:  [ text: { query: "react", path: "title", score: boost 3 },
               text: { query: "react", path: "skills",
                       fuzzy: { maxEdits: 1, prefixLength: 2 } } ]    -> ranking + typos
  }
}
+ a synonym mapping: reactjs = react.js = react, js = javascript
\`\`\`

**Design decisions to say out loud:**
- **Strict by default for Boolean users.** Fuzzy matching only on \`should\` clauses (ranking), or behind a "include similar terms" toggle — so \`NOT php\` never fuzzily excludes \`phpunit\`.
- \`prefixLength: 2\` keeps the first letters exact: fewer wrong matches, faster.
- **Synonyms** fix more real problems than fuzzy (reactjs vs react, js vs javascript).
- **"Did you mean…"** when there are zero results is a cheap, safe alternative.
- **Measure relevance:** track which results recruiters open or shortlist (click position). If good candidates are on page 3, the weights are wrong.

Adapt: if SkillKeepr did not have ranking, present this as your proposal and say why it was not needed earlier.`,
      followUps: [
        {
          q: 'How does fuzzy matching work underneath?',
          a: 'It uses edit distance (Levenshtein): the number of single-letter inserts, deletes or swaps to turn one word into another. "recat" → "react" is one transposition, which Lucene-based engines count as one edit by default.',
        },
        {
          q: 'How do you tune the weights?',
          a: 'Start simple (title > skills > other text, recent profiles slightly higher), log searches and what recruiters open or shortlist, and adjust using a small set of real queries with known good results.',
        },
      ],
    },
    {
      id: 'stripe-webhook-duplicate-out-of-order',
      title: 'A Stripe webhook arrives twice or out of order — walk me through your handler',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'stripe-subscriptions-marketplace',
      question: `"Stripe can send the same event more than once, and events can arrive out of order — for example \`customer.subscription.updated\` (plan = Pro) arrives **after** a later \`customer.subscription.updated\` (plan = Basic). Show me a webhook handler for SkillKeepr that is safe against both. What happens if your handler crashes halfway?"`,
      hints: [
        'Duplicates: remember processed `event.id`s with a **unique index**, so a duplicate insert fails.',
        'Out of order: do not trust the event payload order. Re-fetch the current object from Stripe, or compare a timestamp before writing.',
        'Crash halfway: the event must be retried — so do not mark it "done" until the work succeeded, and make every step safe to repeat.',
      ],
      solution: `**Idea:** three defences. (1) **Signature** check. (2) **Idempotency** with a unique \`eventId\` record. (3) **Ordering**: for subscription events, fetch the **latest** subscription from Stripe and write that — so the order of events stops mattering.

\`\`\`javascript
// POST /webhooks/stripe — mounted with express.raw() BEFORE express.json()
export async function stripeWebhook(req, res) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Invalid signature');
  }

  // Idempotency: unique index on eventId -> second insert throws E11000
  try {
    await WebhookEvent.create({ eventId: event.id, type: event.type, status: 'processing' });
  } catch (err) {
    if (err.code !== 11000) throw err;
    const seen = await WebhookEvent.findOne({ eventId: event.id });
    if (seen.status === 'done') return res.sendStatus(200);   // true duplicate: ignore
    // status 'failed' or stuck 'processing' -> fall through and try again
  }

  try {
    await handleEvent(event);
    await WebhookEvent.updateOne({ eventId: event.id }, { status: 'done' });
    res.sendStatus(200);
  } catch (err) {
    await WebhookEvent.updateOne({ eventId: event.id }, { status: 'failed', error: err.message });
    res.sendStatus(500);                                       // Stripe will retry
  }
}

async function handleEvent(event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      // Ordering: ignore the payload snapshot, read the CURRENT state
      const sub = await stripe.subscriptions.retrieve(event.data.object.id);
      await syncSubscription(sub);
      break;
    }
    case 'invoice.payment_failed':
      await markPastDue(event.data.object.subscription);
      break;
    default:
      logger.warn({ type: event.type }, 'Unhandled Stripe event');
  }
}

// Idempotent: setting the same state twice gives the same result
async function syncSubscription(sub) {
  await Tenant.updateOne(
    { stripeCustomerId: sub.customer },
    { $set: {
        'billing.subscriptionId': sub.id,
        'billing.status': sub.status,
        'billing.priceId': sub.items.data[0].price.id,
        'billing.currentPeriodEnd': new Date(sub.current_period_end * 1000),
        'billing.syncedAt': new Date(),
    } },
  );
}
\`\`\`

**Why it works:**
- **Duplicates:** the unique index makes "have I seen this?" atomic — two copies arriving at the same time cannot both pass.
- **Out of order:** each subscription event triggers "go and read the truth", and the write is a full \`$set\` of the current state, so an old event can only ever write the newest state.
- **Crash halfway:** the record stays \`processing\`/\`failed\`, we return 500 (or time out), Stripe retries, and because \`syncSubscription\` is idempotent, redoing it is safe.

**Alternative to re-fetching:** store the event's \`created\` timestamp on the tenant and only apply an event if it is newer — fewer API calls, but timestamps are in seconds, so two events in the same second need care. Re-fetching is simpler to reason about.

**Field note:** check the field paths against your Stripe API version — some fields (like the period end) have moved between versions.

Adapt: say which events SkillKeepr really handled and whether processing happened inline or in a queue.`,
      followUps: [
        {
          q: 'Handlers can be slow. Should you still do the work inside the request?',
          a: 'Better: verify, save the raw event (status pending), return 200, and let a worker process it with retries. The idempotency record works the same way. A periodic job re-processes stuck or failed events.',
        },
        {
          q: 'What if you miss a webhook completely (server down for hours)?',
          a: 'Stripe retries for days, but also run a reconciliation job: list recently changed subscriptions from the Stripe API and sync them. Webhooks are the fast path; reconciliation is the safety net.',
        },
      ],
    },
    {
      id: 'tenant-isolation-guarantee',
      title: 'How do you guarantee tenant A never sees tenant B\'s data? Show the code',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'multi-tenant-design',
      question: `"SkillKeepr is multi-tenant with a shared database. One developer writes \`Candidate.findById(req.params.id)\` and forgets the tenant filter — now any customer can read another customer's candidates by changing the id in the URL. How do you make that mistake **impossible** (or at least caught), not just 'remembered'? Show code."`,
      hints: [
        'Put the current tenant into a per-request context (Node AsyncLocalStorage) once, in middleware.',
        'A Mongoose plugin adds `tenantId` to every query and aggregation automatically, and throws if there is no tenant — fail closed.',
        'Add defence in depth: indexes starting with tenantId, cross-tenant tests, and tenant in cache keys, file paths and socket rooms.',
      ],
      solution: `**Idea:** take the decision away from each developer. The tenant comes from the verified token, is stored in a request context, and a database plugin applies it to **every** query. No context → the query **throws**.

\`\`\`javascript
// tenantContext.js
import { AsyncLocalStorage } from 'node:async_hooks';
export const als = new AsyncLocalStorage();

// Express middleware — AFTER auth has verified the JWT
export function tenantMiddleware(req, res, next) {
  als.run({ tenantId: req.user.tenantId }, next);   // never from a header or body
}

// Explicit, searchable escape hatch for super-admin jobs
export const withoutTenant = (fn) => als.run({ bypassTenant: true }, fn);

// tenantPlugin.js — applied to every tenant-owned schema
import mongoose from 'mongoose';

const QUERY_OPS = ['find', 'findOne', 'countDocuments', 'updateOne', 'updateMany',
  'deleteOne', 'deleteMany', 'findOneAndUpdate', 'findOneAndDelete', 'replaceOne'];

function currentTenant() {
  const ctx = als.getStore();
  if (ctx?.bypassTenant) return null;
  if (!ctx?.tenantId) throw new Error('No tenant context — refusing to query'); // fail closed
  return ctx.tenantId;
}

export function tenantPlugin(schema) {
  schema.add({ tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true } });

  schema.pre(QUERY_OPS, function () {
    const tenantId = currentTenant();
    if (tenantId) this.where({ tenantId });   // findById uses findOne -> covered too
  });

  schema.pre('aggregate', function () {
    const tenantId = currentTenant();
    // aggregate does not cast types: convert to ObjectId ourselves
    if (tenantId) this.pipeline().unshift({ $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } });
  });

  schema.pre('save', function () {
    const tenantId = currentTenant();
    if (this.isNew && tenantId) this.tenantId = tenantId;
    else if (tenantId && !this.tenantId.equals(tenantId)) throw new Error('Cross-tenant write');
  });
}

// Usage: the "forgotten filter" is now safe
// Candidate.findById(id)  ->  { _id: id, tenantId: <current tenant> }  -> null for other tenants
\`\`\`

**Defence in depth (say these too):**
- **Compound indexes start with \`tenantId\`** — isolation and speed together.
- **Tests that attack:** create data in tenant A, log in as tenant B, call every \`/:id\` endpoint, expect 404.
- \`insertMany\`, \`bulkWrite\` and raw driver calls skip some hooks — ban raw access in lint rules or wrap it.
- Same rule outside MongoDB: tenant prefix in **S3 keys**, **cache keys**, **WebSocket rooms**, and \`tenantId\` in every **log line**.
- Return **404, not 403** for other tenants' ids, so ids cannot be probed.

Adapt: this topic in your notes says to confirm whether SkillKeepr used a plugin like this. If tenant filters were added by hand in services, say so honestly and present the plugin as the improvement you would make.`,
      followUps: [
        {
          q: 'Why AsyncLocalStorage instead of passing tenantId to every function?',
          a: 'Passing it everywhere works but relies on every call remembering it. AsyncLocalStorage keeps the value for the whole async chain of one request, so the plugin can read it without any function signature changes.',
        },
        {
          q: 'When would you choose a database per tenant instead?',
          a: 'When a big customer needs contractual isolation, data residency in a region, or very different load. Many SaaS products use shared by default and dedicated databases for enterprise tenants (hybrid).',
        },
        {
          q: 'What about background jobs that have no request?',
          a: 'The job reads the tenantId from its payload and runs inside `als.run({ tenantId }, ...)`. Jobs that truly span tenants use the explicit `withoutTenant` helper, which is easy to find in code review.',
        },
      ],
    },
    {
      id: 'voice-agent-latency',
      title: 'Your voice agent takes 2.5 seconds to reply — reduce it',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'voice-agent-pipeline',
      question: `"Candidates on your AI Voice Interview Agent say it feels slow: after they stop talking, there is about **2.5 seconds** of silence before the agent answers. The pipeline is Twilio Media Streams → Google STT → LLM → Google TTS → back to Twilio. How do you find where the time goes, and how do you bring it down?"`,
      hints: [
        'First break the 2.5 s into stages with timestamps per turn: end of speech → final transcript → first LLM token → first TTS audio → first audio sent to Twilio.',
        'The biggest wins are usually: faster end-of-speech detection, streaming the LLM, and starting TTS on the first sentence instead of the full reply.',
        'Also: region placement, warm connections/instances, shorter replies, and pre-generated audio for fixed questions.',
      ],
      solution: `**Idea:** measure each stage, then **overlap** the stages (stream instead of wait) and remove fixed delays. Users feel the time to the **first** sound, not the time to the full answer.

\`\`\`text
1. MEASURE (per turn, logged with callId)
   t0 candidate stops speaking (last voice audio)
   t1 STT final transcript         -> endpointing delay   = t1 - t0
   t2 first LLM token              -> LLM first-token time = t2 - t1
   t3 first TTS audio bytes        -> TTS first-byte time  = t3 - t2
   t4 first audio frame to Twilio  -> our own overhead     = t4 - t3
   Look at p50 and p95, not one call.

2. FIX THE BIGGEST STAGE FIRST
   STT / end of speech
   - Streaming recognition with interim results; tune how long a pause
     counts as "done". Too short = cutting people off; test with real calls.
   - Send 8 kHz mulaw straight through: no conversion step.
   LLM
   - Stream tokens. Keep the system prompt and history short (summarise old
     turns). Limit reply length: an interviewer asks one short question.
   - A faster model for turn-taking; heavy scoring after the call.
   TTS
   - Start TTS on the FIRST SENTENCE while the LLM is still writing the rest.
   - Pre-generate and cache audio for fixed lines (greeting, standard
     questions, "thank you").
   Infra
   - Run in a region close to Twilio's media region and Google's speech APIs.
   - Reuse clients (gRPC/HTTP keep-alive); keep minimum warm instances so a
     call never waits for a cold start.

3. HIDE WHAT IS LEFT
   - A short natural filler ("Okay, got it.") from cached audio while the
     real answer is being generated.
\`\`\`

The "speak the first sentence early" trick, as code:

\`\`\`javascript
// Turn a stream of LLM tokens into sentences, so TTS can start on sentence 1
async function* sentences(tokenStream, minLength = 20) {
  let buffer = '';
  for await (const token of tokenStream) {
    buffer += token;
    const last = Math.max(buffer.lastIndexOf('. '), buffer.lastIndexOf('? '), buffer.lastIndexOf('! '));
    if (last >= minLength) {
      yield buffer.slice(0, last + 1).trim();
      buffer = buffer.slice(last + 2);
    }
  }
  if (buffer.trim()) yield buffer.trim();
}

// Demo with a fake token stream (each token arrives 30 ms apart)
async function* fakeLlm() {
  const text = 'Thanks for sharing that. Can you tell me about a project where you used Node.js? Take your time.';
  for (const word of text.split(' ')) {
    await new Promise((r) => setTimeout(r, 30));
    yield word + ' ';
  }
}

const start = Date.now();
for await (const s of sentences(fakeLlm())) {
  console.log(\`\${Date.now() - start}ms -> TTS: "\${s}"\`); // first sentence goes out long before the end
}
\`\`\`

**Why it works:** without streaming, the delay is STT + full LLM + full TTS. With streaming, it becomes STT + first sentence of the LLM + first chunk of TTS — and the rest is generated while the candidate is already listening.

Adapt: give your real before/after numbers only if you measured them. Otherwise say "I measured each stage and the biggest part was X". Also say exactly how xAI Grok Voice fitted in (for example as a speech-to-speech option that removes the separate STT/TTS steps).`,
      followUps: [
        {
          q: 'Why not just make the end-of-speech timeout very short?',
          a: 'People pause to think, especially in interviews. A very short timeout makes the agent interrupt them. Tune it with real calls, and treat "thinking" pauses differently from finished answers if the STT gives you that signal.',
        },
        {
          q: 'Does a speech-to-speech model change this?',
          a: 'Yes: a voice model that takes audio in and gives audio out removes the separate STT and TTS hops, which can cut latency a lot. The trade-off is less control over each step (transcripts, voice choice, prompts).',
        },
      ],
    },
    {
      id: 'voice-agent-barge-in',
      title: 'The candidate interrupts the AI mid-sentence — how is barge-in handled?',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'voice-agent-pipeline',
      question: `"Your agent is reading a long question. Halfway through, the candidate starts answering. What happens? Walk me through how your system stops talking, what happens to the audio already sent to Twilio, and what the AI 'remembers' it said."`,
      hints: [
        'Keep STT listening while the agent speaks. Speech detected during playback = barge-in.',
        'Twilio has already buffered audio. Bidirectional Media Streams accept a `clear` message to drop it, and `mark` messages tell you how far playback got.',
        'Cancel the in-flight LLM and TTS work, and save only the part of the reply that was actually played into the conversation history.',
      ],
      solution: `**Idea:** listen all the time. When the candidate speaks while the agent is talking: (1) **clear** Twilio's audio buffer, (2) **cancel** LLM/TTS work in progress, (3) **truncate** the agent's message in the history to what was really heard, (4) handle the new user turn.

\`\`\`text
Twilio <--ws--> our service
  inbound "media" (candidate audio) -> always sent to STT, even while speaking
  outbound "media" (agent audio)    -> after each sentence we send a "mark"
  Twilio echoes "mark" back         -> that sentence finished playing

Barge-in detected (STT interim text with real words while agent speaking):
  1. send { event: "clear", streamSid }  -> Twilio drops queued audio NOW
  2. abort LLM stream + TTS requests     -> AbortController
  3. history: keep only sentences whose marks came back
  4. state = LISTENING; wait for the final transcript; next turn
\`\`\`

\`\`\`javascript
class TurnManager {
  constructor(sendToTwilio, streamSid) {
    this.send = sendToTwilio;
    this.streamSid = streamSid;
    this.state = 'LISTENING';
    this.history = [];
    this.pending = [];   // sentences sent but not yet confirmed as played
    this.played = [];    // sentences confirmed by Twilio "mark" events
    this.abort = null;
  }

  startSpeaking() {
    this.state = 'SPEAKING';
    this.abort = new AbortController();  // passed to the LLM + TTS calls
    this.pending = [];
    this.played = [];
    return this.abort.signal;
  }

  sendSentence(text, audioBase64) {
    const name = 's' + this.pending.length;
    this.pending.push({ name, text });
    this.send({ event: 'media', streamSid: this.streamSid, media: { payload: audioBase64 } });
    this.send({ event: 'mark', streamSid: this.streamSid, mark: { name } });
  }

  onMark(name) {                         // Twilio says: audio up to this mark has played
    const s = this.pending.find((p) => p.name === name);
    if (s) this.played.push(s.text);
    if (this.played.length === this.pending.length) this.finishTurn(false);
  }

  onInterimTranscript(text) {
    // Ignore noise and short backchannels like "mm" or "ok"
    if (this.state !== 'SPEAKING' || text.trim().split(' ').length < 2) return;
    this.send({ event: 'clear', streamSid: this.streamSid });  // drop buffered audio
    this.abort.abort();                                           // stop LLM + TTS
    this.finishTurn(true);
  }

  finishTurn(interrupted) {
    const said = this.played.join(' ');
    if (said) this.history.push({ role: 'assistant', content: said + (interrupted ? ' [interrupted]' : '') });
    this.state = 'LISTENING';
  }
}

// Demo
const sent = [];
const tm = new TurnManager((m) => sent.push(m.event), 'MZ123');
const signal = tm.startSpeaking();
tm.sendSentence('Thanks for joining today.', 'AAA=');
tm.sendSentence('Can you walk me through your last project and your exact role in it?', 'BBB=');
tm.onMark('s0');                               // first sentence finished playing
tm.onInterimTranscript('yes so my last');      // candidate starts talking
console.log(sent, 'aborted:', signal.aborted);
console.log(tm.history);                        // only the sentence that was heard
\`\`\`

**Why it works:** \`clear\` stops the sound at once; aborting saves LLM/TTS cost; marks tell us what the candidate really heard, so the LLM does not believe it asked a question the candidate never heard.

**Edge cases:** echo or background noise (require a few words or a minimum speech duration), the candidate saying "mm-hmm" (do not stop), and the candidate talking over the very first greeting (let short fixed lines finish).

Adapt: say how your agent really handled interruptions — or, if it did not, say "the first version used strict turn-taking; this is how I would add barge-in".`,
      followUps: [
        {
          q: 'How do you tell a real interruption from "mm-hmm"?',
          a: 'Thresholds: a minimum number of words or speech duration, and a small list of backchannel words to ignore. Voice-activity detection plus STT confidence together reduce false stops.',
        },
        {
          q: 'Why does the history matter?',
          a: 'If the model thinks it finished the question, it may judge the answer against a question the candidate never heard. Truncating keeps the conversation honest and the evaluation fair.',
        },
      ],
    },
    {
      id: 'zoho-partial-provisioning-recovery',
      title: 'Zoho token expired during provisioning and half the workspace was created — recover',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'zoho-crm-provisioning',
      question: `"When a client signs up for OCTAGNT, your system creates a lead in Zoho CRM and provisions the client workspace (tenant, admin user, defaults, welcome email). One day the Zoho token expired halfway: the tenant and admin were created, but the Zoho step failed and the welcome email never went out. The client is half-created. How do you recover this one — and how do you design it so a retry is always safe?"`,
      hints: [
        'Model provisioning as a list of named steps saved in a job document (a simple saga). Each step records its result.',
        'Each step must be idempotent: "find or create" using a stable key (signup id, email), and store external ids (like the Zoho lead id).',
        'Recovery = re-run the job from the first incomplete step. Add retries with backoff and an alert when a job is stuck.',
      ],
      solution: `**Idea:** provisioning is a **resumable job**. Every step is idempotent and saves its output. A failure leaves the job in a known state, and "retry" simply continues from where it stopped.

\`\`\`text
FOR THIS CLIENT (now)
1. Check the job record: which steps are done, which failed and why.
2. Fix the cause (token refresh / reconnect the Zoho integration).
3. Re-run the job: done steps are skipped, Zoho lead + email run now.
4. Verify in Zoho and in the app; tell the account owner it is complete.
(No manual DB edits, no deleting and starting over.)

DESIGN (so it is always safe)
- ProvisioningJob { signupId, steps: { name, status, result, attempts } }
- Steps run in order; each one checks "already done?" before acting.
- External calls use a stable key: search Zoho lead by email/signupId
  before creating; save the lead id in the job.
- 401 from Zoho -> force token refresh, retry once. Other errors ->
  retry with backoff; after N tries -> status "needs attention" + alert.
- If the client cancels, compensation steps undo what was created.
\`\`\`

\`\`\`javascript
// Resumable, idempotent provisioning runner (in memory for the demo)
async function runProvisioning(job, steps) {
  for (const step of steps) {
    const state = (job.steps[step.name] ??= { status: 'pending', attempts: 0 });
    if (state.status === 'done') continue;               // skip finished work
    try {
      state.attempts++;
      state.result = await step.run(job);                // must be idempotent
      state.status = 'done';
    } catch (err) {
      state.status = 'failed';
      state.error = err.message;
      job.status = 'failed';
      return job;                                        // stop; retry resumes here
    }
  }
  job.status = 'done';
  return job;
}

// Fake external systems
const db = { tenants: new Map() };
const zoho = { leads: new Map(), tokenValid: false };
const emails = [];

const steps = [
  { name: 'createTenant', run: async (job) => {
      if (!db.tenants.has(job.signupId)) db.tenants.set(job.signupId, { name: job.company });
      return { tenantId: job.signupId };
  } },
  { name: 'createZohoLead', run: async (job) => {
      if (!zoho.tokenValid) throw new Error('Zoho 401: invalid oauth token');
      if (!zoho.leads.has(job.email)) zoho.leads.set(job.email, { id: 'lead-' + job.signupId }); // find-or-create
      return { leadId: zoho.leads.get(job.email).id };
  } },
  { name: 'sendWelcomeEmail', run: async (job) => {
      if (!emails.includes(job.email)) emails.push(job.email);
      return { sent: true };
  } },
];

const job = { signupId: 'su_42', company: 'Acme', email: 'admin@acme.test', steps: {} };
await runProvisioning(job, steps);
console.log('1st run:', job.status, job.steps.createZohoLead.error);
zoho.tokenValid = true;                                  // token refreshed / reconnected
await runProvisioning(job, steps);
console.log('2nd run:', job.status, 'tenants:', db.tenants.size, 'leads:', zoho.leads.size, 'emails:', emails.length);
\`\`\`

**Why it works:** the job remembers progress, so a retry never repeats finished work, and every step is "find or create", so even repeating a step (for example after a crash right after the Zoho call but before saving) does not create duplicates.

Adapt: describe how your real provisioning was structured (one function, a queue, a job table) and what really happened when Zoho failed. If you did not have this, present it as the improvement.`,
      followUps: [
        {
          q: 'Why not wrap everything in a database transaction?',
          a: 'A transaction only covers our own database. Zoho and the email provider are outside it, so they cannot be rolled back automatically. That is why we use resumable steps and compensating actions (a saga).',
        },
        {
          q: 'Should the client wait for provisioning to finish?',
          a: 'No. Create the job, show "Setting up your workspace", and run it in the background with retries. The UI polls or gets a notification when it is done.',
        },
      ],
    },
    {
      id: 'scale-jitsi-500-interviews',
      title: 'Scale the Jitsi live interview feature to 500 concurrent interviews',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'jitsi-live-interviews',
      question: `"Today SkillKeepr's live interviews use Jitsi for audio/video and your own WebSocket server for signalling. A large customer plans a hiring drive with **500 interviews at the same time**, 2-4 people each. What breaks first, and how do you scale it?"`,
      hints: [
        'Separate the two systems: the media path (Jitsi Videobridge, TURN) and your signalling/app path (WebSocket server, API).',
        'Small rooms help: each interview fits on one bridge, so you scale by adding bridges. Load-test one bridge to know its real capacity.',
        'Signalling across several instances needs a shared pub/sub (for example Redis) and sticky sessions. Recording is the expensive part.',
      ],
      solution: `**Idea:** media and signalling scale differently. Media is heavy (bandwidth and CPU) and scales by adding **Jitsi Videobridges**. Signalling is light but stateful and scales with **shared pub/sub**. Then load-test before the event.

\`\`\`text
WHAT BREAKS FIRST (in order of likelihood)
1. Media: a single Jitsi Videobridge (JVB) runs out of bandwidth/CPU.
2. Network: candidates behind strict firewalls cannot connect without TURN.
3. Signalling: one WebSocket server process holds all rooms in memory.
4. Recording (if used): each Jibri recorder runs a full browser — one
   recording per Jibri instance, so 500 recordings = 500 recorders.

MEDIA (Jitsi)
- Interviews are small (2-4 people) -> each room lives on ONE bridge.
  Jicofo (the conference focus) spreads new rooms across bridges.
- Run a pool of JVBs; autoscale on bridge stress/CPU and bandwidth.
- Load-test one bridge with realistic rooms (e.g. 3 people, 720p) to learn
  rooms-per-bridge, then plan bridges for 500 rooms + headroom.
- Lower default video quality / simulcast so bridges forward less data.
- TURN servers (coturn) on 443 for corporate networks.
- Alternative: a managed Jitsi service (JaaS) and pay per use, instead
  of running bridges ourselves for one peak event.

SIGNALLING (our WebSocket server)
- Several instances behind a load balancer with sticky sessions.
- Shared pub/sub (e.g. socket.io Redis adapter) so a message reaches a
  room even if participants are on different instances.
- Keep room state in Redis/DB, not only in memory; reconnect logic on
  the client.

APP / API
- Interview start = JWT for the room, created by the API (cheap).
- Precreate interview records; avoid heavy queries at join time.
- Rate-limit join retries so a reconnect storm cannot overload the API.

BEFORE THE DAY
- Load test: script 500 rooms with fake participants (headless browsers
  or Jitsi's testing tools), watch bridge CPU, packet loss, join time.
- Dashboards + alerts: rooms per bridge, join failures, reconnects.
- Runbook: add bridges, lower video quality, fallback to audio-only.
\`\`\`

**Why it works:** small rooms make the media problem "add more bridges", which is horizontal and predictable. Shared pub/sub removes the in-memory limit of a single signalling server. Load testing turns guesses into numbers.

Adapt: say whether SkillKeepr used self-hosted Jitsi, meet.jit.si or JaaS, whether interviews were recorded, and how signalling was deployed. Do not quote a bridge capacity you did not test — say "we would load-test to find it".`,
      followUps: [
        {
          q: 'Why not peer-to-peer WebRTC for 1-to-1 interviews?',
          a: 'Jitsi already uses peer-to-peer mode for two participants by default, which takes load off the bridge. It switches to the bridge when a third person joins. Some strict networks still need TURN.',
        },
        {
          q: 'How do you make it reliable if a bridge dies mid-interview?',
          a: 'Jicofo moves the conference to another bridge; clients reconnect, usually with a short drop. The signalling server and UI should show "reconnecting" and keep the interview state (notes, timer) on the server, not in the call.',
        },
      ],
    },
  ],
};
