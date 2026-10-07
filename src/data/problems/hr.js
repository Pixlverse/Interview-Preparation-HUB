// Interview problems for the HR / Behavioural stack.
// Situational "what would you do if..." questions with first-person model answers.
// See CONTENT_GUIDE.md ("Interview problems") for the format.
// Every example story is marked "Adapt: replace with a real situation". Never invent facts.

export default {
  stackId: 'hr',
  problems: [
    {
      id: 'gap-since-september-2026',
      title: 'Why is there a gap since September 2026?',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'career-gap',
      question: `"Your resume says Haspaces, June 2023 to September 2026. It is now a few weeks later and you have not joined anywhere. What happened, and what have you been doing?"`,
      hints: [
        'Keep it short: honest status → what you are doing productively → you are ready now.',
        'Do not over-explain or sound defensive. A gap of weeks is normal.',
        'Never criticise the old company. Only mention activities that are true.',
      ],
      solution: `**Framework:** STATUS → ACTIVITY → READY. About 20-30 seconds.

\`\`\`text
STATUS
"My role at Haspaces ended in September 2026, after a little over
 three years there."
 (Adapt: one neutral line on why — e.g. "I wanted a bigger challenge"
  or "the role ended" — only if it is true. Keep it positive.)

ACTIVITY  (Adapt: say only what you are really doing)
"Since then I've been using the time well: revising system design and
 Node.js internals, writing up the architecture of the systems I built —
 the Boolean search engine and the Stripe billing flow — and practising
 with <a project / course / topic>."

READY
"I'm being selective because I want the right next role, where I can
 keep building SaaS and AI features end to end. I can join immediately."
\`\`\`

**What the interviewer is checking:** is there a hidden problem, and are you still sharp? A calm, specific answer closes the topic. Then **stop talking** and let them move on.`,
      followUps: [
        {
          q: 'Were you laid off / did you resign?',
          a: 'Answer the exact question honestly in one sentence, with no blame, then return to what you are looking for next. Adapt: use your real reason.',
        },
        {
          q: 'What if this search takes many months?',
          a: 'Show visible progress: a small project on GitHub, a written case study of your work (no company secrets), or a certification. "Here is what I built since then" beats any explanation.',
        },
      ],
    },
    {
      id: 'estimate-task-never-done',
      title: 'You are asked to estimate a task you have never done before',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'unclear-requirements',
      question: `"Your manager asks: 'How long will it take to add Google Calendar sync to the interview scheduler?' You have never used the Google Calendar API. What do you say in the meeting, and what do you do next?"`,
      hints: [
        'Do not give a confident number on the spot, and do not refuse to estimate. Give a range plus a time-boxed spike.',
        'Break the task into parts you know and parts you do not know.',
        'Say what would change the estimate (risks, assumptions).',
      ],
      solution: `**Framework:** honest range now → short spike → firm estimate with assumptions → update early if it changes.

\`\`\`text
IN THE MEETING
"I haven't used the Calendar API yet, so let me give a rough range and
 firm it up quickly. Give me half a day to do a spike, and I'll come back
 with a proper estimate and the risks."

THE SPIKE (time-boxed, e.g. half a day)
- Read the docs; build the smallest working thing: OAuth consent +
  create one event.
- List the parts:
    known    : API endpoint, DB fields, UI button, tests
    unknown  : OAuth scopes/consent review, token refresh, time zones,
               two-way sync (webhooks/push), rate limits
- Estimate each part. Add buffer for the unknowns.

THE ANSWER
"One-way sync (we create events in their calendar): about X days.
 Two-way sync (changes in Google update our app): extra Y days, because
 of push notifications and conflict handling. Main risks: OAuth review
 and time zones. I'll update you on day 2 if anything changes."
\`\`\`

I have done this before when I integrated tools that were new to me, like Twilio Media Streams or Zoho CRM. Adapt: replace with a real situation where you estimated something new and how close you were.`,
      followUps: [
        {
          q: 'Your manager says: "Just give me a number now."',
          a: 'Give a range with the assumption stated: "Probably 3 to 6 days, depending on whether we need two-way sync. I will narrow it down by tomorrow." A range is honest; a single guess is not.',
        },
        {
          q: 'How do you get better at estimating?',
          a: 'Compare estimates with actual time after each task, break work into pieces smaller than a day or two, and always list unknowns separately.',
        },
      ],
    },
    {
      id: 'review-junior-pr-many-issues',
      title: 'A junior\'s pull request has many issues — how do you review it?',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'mentoring-juniors',
      question: `"A junior developer opens a large PR for a new feature. You find 25 problems: a missing tenant filter, no tests, inconsistent naming, a huge function, and some style issues. How do you review it?"`,
      hints: [
        'Separate blockers (security, correctness) from suggestions (style, naming). Do not give 25 equal comments.',
        'For a big or confusing PR, talk first (a short call), then write comments.',
        'Explain the "why" and point to examples, so the junior learns the rule, not just the fix.',
      ],
      solution: `**Framework:** prioritise → talk → teach → follow up.

\`\`\`text
1. PRIORITISE THE ISSUES
   Blockers (must fix): the missing tenant filter (data leak between
     companies), no tests for the main flow, a bug in error handling.
   Should fix: the huge function -> split; inconsistent naming.
   Nits (optional): style -> let the linter/formatter handle these,
     not my comments.

2. TALK FIRST
   "Hey, nice progress on this. Can we do a 15-minute call? There are a
    couple of important things that are easier to explain live."
   On the call: the 2-3 blockers and why they matter.

3. WRITE CLEAR COMMENTS
   - Label them: [blocker], [suggestion], [nit].
   - Explain why: "Without tenantId here, a user from company A can read
     company B's candidates by changing the id."
   - Link an example in our code that does it right.
   - Praise what is good. Specific praise is useful feedback too.

4. FOLLOW UP
   - Suggest splitting future work into smaller PRs.
   - If the same issue keeps appearing, fix the system: add a lint rule,
     a checklist in the PR template, or a short doc.
\`\`\`

Adapt: replace with a real situation where you reviewed or helped a teammate — for example catching a missing tenant filter or an unverified webhook — and what changed afterwards.`,
      followUps: [
        {
          q: 'Would you just fix it yourself to save time?',
          a: 'For a real emergency, maybe — and I would explain the fix afterwards. Normally no: fixing it myself is faster today but the junior learns nothing and the same issue comes back next week.',
        },
        {
          q: 'What if the junior gets defensive?',
          a: 'Keep it about the code, not the person; ask questions ("what happens if the id belongs to another tenant?") so they find the issue themselves; and acknowledge good decisions.',
        },
      ],
    },
    {
      id: 'estimate-wrong-by-2x',
      title: 'You realise your earlier estimate was wrong by 2x',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'tight-deadlines',
      question: `"You estimated a feature at 5 days. On day 3 you realise it will take about 10 days — a third-party API is more complex than you thought. The client demo is planned for the end of the week. What do you do?"`,
      hints: [
        'Tell people early — the moment you know, not on day 5.',
        'Come with options, not just bad news: cut scope, move the date, add help, or a phased release.',
        'Explain what you learned so the next estimate is better.',
      ],
      solution: `**Framework:** inform early → explain briefly → offer options → agree → learn.

\`\`\`text
1. INFORM EARLY (same day)
   "I need to flag a risk on the feature. I estimated 5 days; it is closer
    to 10. The API needs <reason>, which I did not know when estimating."

2. OPTIONS (with my recommendation)
   A) Cut scope: demo the main flow by Friday; the edge cases and
      reporting come next week.               <- I recommend this
   B) Keep full scope, move the demo by one week.
   C) Add a teammate on the independent part (UI or tests) —
      only helps if the work splits cleanly.

3. AGREE AND COMMIT
   Manager / client picks. I confirm the new plan in writing and give
   short daily updates until it is done.

4. LEARN
   "Next time I do a half-day spike on any unfamiliar third-party API
    before estimating."
\`\`\`

**STAR shell — Adapt: replace with a real situation**

\`\`\`text
S: An integration (e.g. Zoho / Twilio) turned out bigger than estimated.
T: Deliver something useful for the planned date.
A: Flagged it on day <n>, proposed a smaller first release, delivered it.
R: The demo happened on time with the core flow; the rest shipped <when>.
\`\`\``,
      followUps: [
        {
          q: 'Why not just work extra hours and keep quiet?',
          a: 'Sometimes a little extra effort is fine, but hiding a 2x miss is risky: quality drops, and if I still miss, people find out at the worst moment. Managers can plan around bad news; they cannot plan around surprises.',
        },
        {
          q: 'How do you stop this from happening again?',
          a: 'Spike unknown parts first, estimate in small pieces, add a buffer for external dependencies, and check progress against the estimate at the halfway point.',
        },
      ],
    },
    {
      id: 'teammate-missing-deadlines',
      title: 'A teammate keeps missing deadlines and it blocks your work',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'handling-conflict',
      question: `"You are building the frontend for a feature. A teammate owns the API you depend on. For the third sprint in a row, their part is late, and your work is blocked. What do you do?"`,
      hints: [
        'Start with a private, curious conversation — assume there is a reason (overload, unclear requirements, personal issue).',
        'Unblock yourself meanwhile: agree an API contract and use a mock.',
        'Escalate only after talking to them, and frame it as a delivery risk, not a complaint about a person.',
      ],
      solution: `**Framework:** unblock myself → talk privately → help → escalate the risk (not the person) if needed.

\`\`\`text
1. UNBLOCK MYSELF NOW
   - Agree the API contract together (request/response shape, errors).
   - Build the frontend against a mock (MSW / a JSON stub), so I am not
     waiting. Switching to the real API later is small.

2. PRIVATE, CURIOUS CONVERSATION
   "Hey, I noticed the API has slipped a few times and I'm planning my
    work around it. Is something getting in the way? Can I help?"
   Listen. Common reasons: too many parallel tasks, unclear requirements,
   a hard technical problem, something personal.

3. HELP WHERE I CAN
   - Pair on the hard part, take a small piece (validation, tests),
     or clarify requirements with the product owner together.
   - Agree smaller milestones: "endpoint A by Tuesday, B by Thursday".

4. IF IT STILL SLIPS
   Raise it in stand-up / with the lead as a delivery risk:
   "The feature depends on these endpoints; at this pace we'll miss the
    date. Can we re-prioritise or get help?" — facts, not blame.
\`\`\`

Adapt: replace with a real situation — for example when you depended on another developer's work or a third-party team — and what you did to keep moving.`,
      followUps: [
        {
          q: 'What if your manager asks you directly about the teammate?',
          a: 'Share facts about the work (dates, dependencies, impact), not opinions about the person. Mention that I already spoke to them and what we agreed.',
        },
        {
          q: 'What if the teammate is senior to you?',
          a: 'Same steps, with respect: ask how I can help and propose the contract-plus-mock plan. Seniority does not change the delivery risk, so it still gets raised if needed.',
        },
      ],
    },
    {
      id: 'client-changes-requirements-before-demo',
      title: 'The client changes requirements a day before the demo',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'unclear-requirements',
      question: `"It is the day before a client demo of the new candidate shortlisting screen. The client emails: 'Actually, recruiters need to filter by notice period and see a score breakdown, not one score.' What do you do?"`,
      hints: [
        'Do not panic-code all night, and do not say a flat no. First understand the real need behind the change.',
        'Split it: what can be shown safely by tomorrow vs what needs proper work.',
        'Agree the plan with your manager / product owner and set expectations with the client before the demo.',
      ],
      solution: `**Framework:** understand → size it → options → agree → protect the demo.

\`\`\`text
1. UNDERSTAND (same morning)
   Ask, through the product owner or directly if that is our process:
   "What decision will recruiters make with the score breakdown?
    Is the notice-period filter needed for the demo, or for launch?"

2. SIZE IT QUICKLY
   - Notice-period filter: data already exists -> small change, low risk.
   - Score breakdown: needs the scoring to return parts, plus new UI
     -> real work, and risky to rush.

3. OPTIONS FOR MY MANAGER
   A) Demo tomorrow as planned + the small filter (if tested in time).
      Show the score breakdown as a mock-up / design, build it next sprint.
   B) Move the demo by a few days and show everything working.
   I recommend A: the demo stays stable and the client sees we listened.

4. AGREE AND COMMUNICATE
   Manager confirms; we reply to the client today, not during the demo:
   "Tomorrow you'll see X working and the design for Y; Y ships on <date>."

5. PROTECT THE DEMO
   No risky changes late at night. Test the demo flow end to end, keep a
   backup (recorded walk-through), deploy the last change early.
\`\`\`

Adapt: replace with a real situation — for example a late change on OCTAGNT or SkillKeepr — and what was shown at the demo.`,
      followUps: [
        {
          q: 'What if the client insists everything must be in tomorrow\'s demo?',
          a: 'Explain the trade-off clearly: rushing the scoring change risks a broken demo and wrong scores. Offer the mock-up plus a firm date. The final decision is with my manager / product owner, and I support it.',
        },
        {
          q: 'How do you avoid late changes in future?',
          a: 'Show work earlier and more often (short check-ins with a clickable preview), and write down acceptance criteria before building.',
        },
      ],
    },
    {
      id: 'legacy-codebase-no-docs',
      title: 'You are given an unfamiliar legacy codebase with no documentation',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'learning-new-tech',
      question: `"On your first week, you are given a 6-year-old Node.js service with no docs, few tests, and the original author has left. You must fix a bug in the billing logic by next week. How do you approach it?"`,
      hints: [
        'Explore with a goal: follow the one flow you need (request → route → service → database), not the whole codebase.',
        'Make it safe before changing it: reproduce the bug and write a test that captures current behaviour.',
        'Leave it better than you found it: write down what you learned.',
      ],
      solution: `**Framework:** run it → trace one flow → pin behaviour with tests → small change → document.

\`\`\`text
1. RUN IT
   Get it running locally (README, Dockerfile, CI config, package.json
   scripts tell you how). Note every step that was missing from docs.

2. TRACE ONE FLOW (not the whole system)
   Start from the bug: which endpoint or job? Follow it:
   route -> middleware -> service -> DB queries -> external calls (Stripe).
   Tools: search for the route string, debugger breakpoints, logs,
   git log / git blame to see WHY lines changed, old PRs and tickets.
   AI tools help me summarise unfamiliar files fast; I verify by running.

3. ASK PEOPLE
   Someone still knows things: support, product, the person who reviewed
   the old PRs. 15 minutes with them can save a day.

4. PIN BEHAVIOUR, THEN CHANGE
   - Reproduce the bug with a failing test.
   - Add tests around the code I touch (characterisation tests: they
     record what the code does today).
   - Make the smallest fix; tests go green; nothing else changes.

5. DOCUMENT
   A short doc: how to run it, the billing flow diagram, gotchas I found.
   The next person starts faster.
\`\`\`

At Haspaces I wrote architecture diagrams and technical documentation, so step 5 is a habit for me. Adapt: replace with a real situation where you worked in unfamiliar code — for example during the Node 16 → 18 migration across services.`,
      followUps: [
        {
          q: 'Would you refactor the messy code while fixing the bug?',
          a: 'Only small refactors directly around the fix, and only with tests in place. A big rewrite goes in a separate, planned task — mixing it with a billing bug fix makes both risky.',
        },
        {
          q: 'What if you find a second, more serious bug while reading?',
          a: 'Write it down, tell the team with evidence, and agree a priority. Do not silently fix it in the same PR.',
        },
      ],
    },
    {
      id: 'disagree-tech-lead-architecture',
      title: 'You disagree with the architecture chosen by the tech lead',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'disagree-senior',
      question: `"Your tech lead decides that the new AI voice feature should be added inside the main backend. You believe it should be a separate service, because calls hold long-lived WebSocket connections. How do you handle it?"`,
      hints: [
        'Disagree with data and trade-offs, in the right forum, early — not in a hallway after the decision.',
        'Understand their reasons first; they may know constraints you do not (team size, deadlines, cost).',
        '"Disagree and commit": once decided, support it fully, and suggest a way to revisit with data.',
      ],
      solution: `**Framework:** understand → make my case with trade-offs → propose a test or a checkpoint → commit.

\`\`\`text
1. UNDERSTAND FIRST
   "Can you help me understand the main reasons for keeping it in the
    main backend?" Maybe: faster delivery, small team, one deploy.

2. MAKE MY CASE (short written note + a conversation)
   - Concern: each call holds a WebSocket for minutes and streams audio;
     web requests last milliseconds. Load or a bug in audio handling could
     slow down login and dashboards for everyone.
   - Options with costs:
     A) Inside main backend: fastest now; shared scaling and failures.
     B) Separate service: isolation and own scaling; more infra, auth
        between services.
   - Proposal: build it as a separate MODULE with a clean interface inside
     the backend now, so it can be moved out later with little effort.

3. AGREE ON A CHECKPOINT
   "Can we load-test 20 parallel calls before launch and decide based on
    the result?"

4. COMMIT
   If the lead still decides A, I build A properly and do not say
   "I told you so". If the data later shows a problem, I bring the data.
\`\`\`

Adapt: replace with a real situation where you disagreed with a senior's technical choice, and say honestly how it ended — including if they were right.`,
      followUps: [
        {
          q: 'What if you were sure they were wrong and it was a security issue?',
          a: 'Security and data-loss issues are different: I would put the risk in writing, with evidence, and escalate if needed. For normal design trade-offs, I disagree and commit.',
        },
        {
          q: 'Tell me about a time you were the one who was wrong.',
          a: 'Have a real, honest example ready, where someone else\'s idea was better and you said so. Adapt: use a real one; it shows maturity.',
        },
      ],
    },
    {
      id: 'two-offers-decide-negotiate',
      title: 'You have two offers — how do you decide and negotiate?',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'salary-negotiation',
      question: `"You have two offers. Company A pays more. Company B pays less, but the work (AI products, ownership of a service) excites you more. Company B's HR asks: 'Do you have other offers? What would it take for you to join us?' How do you decide and what do you say?"`,
      hints: [
        'Decide with clear criteria first (work, growth, team, stability, total pay), not only the CTC number.',
        'Be honest that you have another offer — without bluffing or giving every detail.',
        'Ask for something specific and reasonable, and be clear you want to join if it can be matched or closed.',
      ],
      solution: `**Framework:** compare on criteria → decide what you want → negotiate honestly and specifically.

\`\`\`text
1. COMPARE (a simple table for myself)
                      A           B
   The work           ok          AI products, own a service  <- matters most
   Growth / learning  medium      high
   Team / manager     ?           met them, strong
   Total pay          higher      lower (fixed + variable + benefits)
   Stability, notice  ...         ...
   Compare TOTAL compensation, not just the headline CTC: fixed vs
   variable, joining bonus, ESOPs, insurance, learning budget.

2. DECIDE
   If B is my first choice, I tell B that clearly — it gives them a
   reason to stretch.

3. WHAT I SAY TO B'S HR
   "Yes, I have another offer at a higher figure. Honestly, your role is
    my first choice because of the work on <AI product> and the ownership.
    If you can bring the fixed pay closer to <number>, I'm ready to accept
    and can join immediately."
   - Specific number, with a reason. No bluffing about offers I do not have.
   - If the fixed pay cannot move: ask about a joining bonus, an early
     salary review (e.g. after 6 months), or ESOPs.

4. CLOSE CLEANLY
   Get the final offer in writing. Inform company A politely and quickly.
\`\`\`

Adapt: use your real expected range from your own research (your notes on salary expectations in LPA). Never state a figure you would not accept.`,
      followUps: [
        {
          q: 'HR asks you to share the other offer letter.',
          a: 'It is fine to share the figure; sharing the letter itself is your choice. Many candidates say: "I can share the numbers; the letter is confidential to that company."',
        },
        {
          q: 'What if B says this is the final number?',
          a: 'Decide based on the criteria table, not pride. If the work and growth matter more than the difference, accept and say so positively.',
        },
      ],
    },
    {
      id: 'led-without-authority',
      title: 'Tell me about a time you led without authority',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'ownership-beyond-scope',
      question: `"You were not a manager or tech lead. Tell me about a time you led something — got people to follow a plan — without formal authority."`,
      hints: [
        'Use STAR. The "Action" part must show influence: a clear plan, written docs, making it easy for others, earning trust.',
        'The Node 16 → 18 migration you led is a strong candidate story; so is writing architecture docs others used.',
        'End with a measurable or visible result, and what you learned about influence.',
      ],
      solution: `**Framework:** STAR, with the Action showing HOW you influenced people.

\`\`\`text
S  Node 16 was reaching end of life, so our services needed to move to
   Node 18. Nobody was formally assigned to lead it.
   (Adapt: confirm how you came to lead it.)

T  Plan and drive the upgrade across services without breaking production,
   while other developers were busy with feature work.

A  - Wrote a short migration plan: list of services, risky dependencies,
     order of rollout, rollback steps. Shared it for feedback first.
   - Did the hardest part myself (dependency upgrades, breaking changes)
     so others only had small, clear tasks.
   - Wrote a checklist and documented the gotchas I found, so anyone could
     upgrade a service the same way.
   - Gave short updates in stand-up; asked owners of each service to review
     their part instead of telling them what to do.

R  We moved to Node 18 with <result: e.g. no major incident / on time>.
   (Adapt: give the real outcome. Do not invent numbers.)

LEARNED
   People follow a plan when it is clear, written, and makes their work
   easier — not because someone has a title.
\`\`\`

Adapt: replace with a real situation if the migration is not your best example — architecture documentation, or driving the fix of a critical production issue with other teams, also work well.`,
      followUps: [
        {
          q: 'Did anyone push back? How did you handle it?',
          a: 'Adapt: a real example. A good pattern: someone worried about risk during a busy release, so the rollout order was changed to start with low-risk services and their concern was addressed.',
        },
        {
          q: 'Would you want a formal lead role next?',
          a: 'Answer honestly: for example, "I want to grow toward technical ownership — leading designs and mentoring — while staying hands-on."',
        },
      ],
    },
    {
      id: 'feedback-you-think-is-unfair',
      title: 'You get feedback in a review that you think is unfair',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'feedback-received',
      question: `"In your performance review, your manager says: 'You are technically strong, but you don't communicate progress enough — I often find out about problems late.' You feel this is unfair because you were heads-down fixing those problems. How do you respond?"`,
      hints: [
        'Do not argue in the moment. Listen, ask for specific examples, and thank them.',
        'Separate intent from impact: you meant well, but the manager experienced surprises.',
        'Turn it into a concrete change and check back later.',
      ],
      solution: `**Framework:** listen → ask for examples → find the part that is true → act → check back.

\`\`\`text
1. IN THE MEETING
   "Thanks for telling me. Can you give me one or two examples, so I
    understand exactly what you'd like to see?"
   Do not defend or explain yet. Take notes.

2. REFLECT (after the meeting)
   My intent: fix the problem first, then report.
   Their experience: surprises, no chance to plan or warn the client.
   Both are true. The feedback is about impact, so it is fair.

3. ACT — SPECIFIC CHANGES
   - Flag risks the same day I find them, even before I have a fix:
     "Found an issue with X, investigating, next update at 4 pm."
   - A short written update at the end of each day on bigger tasks.
   - During incidents: update every fixed interval, even if it is
     "no news yet".

4. CHECK BACK
   After a month: "I've been doing daily updates and flagging risks
   early. Is this closer to what you need?"
\`\`\`

Adapt: replace with a real piece of feedback you received and what you changed. If part of the feedback really was wrong, it is fine to say "I shared the context calmly afterwards" — but show you acted on the part that was right.`,
      followUps: [
        {
          q: 'What if the feedback is simply factually wrong?',
          a: 'Ask for examples, then share facts calmly in a follow-up (with dates, PRs, messages), not in an emotional moment. Still ask: "What could I do so this impression does not happen again?"',
        },
        {
          q: 'What is the most useful feedback you have received?',
          a: 'Adapt: a real one. Good answers show a specific change in behaviour and its result.',
        },
      ],
    },
    {
      id: 'two-urgent-requests-same-time',
      title: 'Two people give you urgent work at the same time',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'working-under-pressure',
      question: `"Your product manager wants a plan-limit change for a big customer by tomorrow. At the same time, the support lead says a recruiter cannot see search results, and it's 'urgent'. You cannot do both today. What do you do?"`,
      hints: [
        'Assess impact and urgency quickly for each — how many users, money, data, deadlines.',
        'Do not silently choose. Make the conflict visible to the people who own priorities.',
        'Often you can do a quick unblock on one (a workaround) and then focus on the other.',
      ],
      solution: `**Framework:** assess → quick triage → make the trade-off visible → execute → communicate.

\`\`\`text
1. ASSESS (10-15 minutes)
   Search bug: one recruiter or all? A data problem (e.g. missing
     tenant data) or a UI glitch? Is there a workaround?
   Plan-limit change: what happens if it ships the day after tomorrow?
     Is there a contract or a demo tied to it?

2. QUICK TRIAGE
   If the search bug affects many users or looks like a data/security
   issue -> it goes first (production issues usually beat new work).
   If it is one user with a workaround -> give support the workaround
   now, fix it right after the plan change.

3. MAKE IT VISIBLE
   Message both people (and my manager if needed):
   "Both requests came in today. Search issue affects <scope>; plan
    change is needed by <time>. My plan: <order>. If the priority should
    be different, let me know and I'll switch."

4. EXECUTE AND UPDATE
   Do the first one fully, update both people when it is done, then the
   second.
\`\`\`

Adapt: replace with a real situation — for example a production issue arriving during a feature deadline — and how you decided.`,
      followUps: [
        {
          q: 'What if both people are senior to you and both insist?',
          a: 'Then the decision belongs to the person who owns priorities (my manager or the product owner). I give them the facts and impact for each, and follow their call.',
        },
        {
          q: 'How do you avoid this happening all the time?',
          a: 'A visible list of priorities agreed with the manager, and a clear rule for production issues (for example an on-call rotation), so not everything lands on one person.',
        },
      ],
    },
    {
      id: 'unsafe-feature-by-friday',
      title: 'Your manager asks you to ship a feature you think is unsafe by Friday',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'disagree-senior',
      question: `"It is Wednesday. Your manager wants the new subscription add-on purchase flow live by Friday for a client. You know the Stripe webhook handling is not idempotent yet and there are no tests for failed payments — customers could be charged twice or get features they did not pay for. Your manager says: 'Just ship it, we'll fix it later.' What do you do?"`,
      hints: [
        'Do not refuse and do not silently comply. Make the risk concrete: who is hurt, how, how likely.',
        'Find a smaller safe version that meets the real goal by Friday (scope cut, feature flag, manual step).',
        'If the decision is still to ship, get it in writing with the known risks and a plan to fix them.',
      ],
      solution: `**Framework:** make the risk concrete → offer a safe alternative → let the owner decide with full information → protect users either way.

\`\`\`text
1. MAKE THE RISK CONCRETE (short, calm, with facts)
   "I want to hit Friday too. One concern: if Stripe sends the same
    webhook twice — which it can — we could activate the add-on twice or
    miss a failed payment. That means wrong charges or free access, and
    support tickets with a paying client."

2. OFFER OPTIONS THAT STILL HIT FRIDAY
   A) Ship Friday, but add the minimum safety I can do in 2 days:
      idempotency on event id + a test for duplicate and failed payment.
      Cut something else (e.g. the coupon support) to make room.
   B) Ship Friday for THIS client only behind a feature flag, and check
      every purchase by hand (reconcile with Stripe daily) until the fix.
   C) Ship the full version next Wednesday.
   My recommendation: A.

3. LET THE OWNER DECIDE
   The manager owns the business trade-off. I make sure they decide with
   the full picture — and I write the risk down in the ticket or an email.

4. WHATEVER IS DECIDED
   - Add monitoring/alerts on the risky part (duplicate events, payment
     failures).
   - Create the follow-up tasks with a date, not "later".
   - If it were clearly illegal or a serious security/data risk to users,
     I would escalate above my manager. A normal trade-off, I accept.
\`\`\`

Adapt: replace with a real situation where you pushed back on a risky shortcut (billing, security, data) and what happened.`,
      followUps: [
        {
          q: 'What if your manager says "I hear you, ship it anyway"?',
          a: 'Then I ship it, with the risk documented, extra monitoring, and the fix scheduled. Disagreeing is my job; the business decision is theirs — unless it is unethical or illegal.',
        },
        {
          q: 'Isn\'t this just perfectionism?',
          a: 'No — I separate "nice to have" from "can hurt users or money". I happily ship imperfect UI on a deadline. I push back only on risks like double charging or data leaks.',
        },
      ],
    },
    {
      id: 'broke-production-friday-evening',
      title: 'You broke production on a Friday evening',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'production-failure',
      question: `"You deployed a change at 6 pm on Friday. At 7 pm, support reports that recruiters cannot log in. Your manager is offline. What exactly do you do in the next hour — and what happens on Monday?"`,
      hints: [
        'Own it immediately. Restore service first (rollback), investigate second.',
        'Communicate early and on a schedule: support, the team channel, your manager.',
        'Monday: blameless post-mortem with concrete prevention — including "why did we deploy on Friday evening?".',
      ],
      solution: `**Framework:** own → restore → communicate → fix properly → prevent.

\`\`\`text
NEXT HOUR
1. CONFIRM AND OWN (5 min)
   Check error logs/alerts; my deploy is the most likely cause.
   Post in the team channel: "Login is failing since my 6 pm deploy.
   I'm rolling back now. Next update in 15 minutes."

2. RESTORE (10-15 min)
   Roll back to the previous version (previous image / release).
   Verify: log in myself, check error rate, ask support to confirm.
   If rollback is not possible (e.g. a data migration ran), apply the
   smallest safe hotfix or turn off the feature flag.

3. COMMUNICATE
   - Support: "Fixed at <time>, users can log in again. Please ask
     affected users to refresh."
   - Manager: a short message with impact, cause (if known), status —
     even if they are offline, they will see it.
   - If it is serious and not fixed in ~30 min, call the on-call / lead.

4. CHECK THE DAMAGE
   Any data written wrongly during the hour? Any tenants affected more?

MONDAY
5. ROOT CAUSE + PROPER FIX, reviewed and tested, deployed at a safe time.
6. BLAMELESS POST-MORTEM (short doc)
   What happened, impact, timeline, root cause, what we change:
   - a test for the login flow in CI / a smoke test after deploy
   - a rule: no non-urgent deploys late on Friday
   - a staging check that matches production config
\`\`\`

Adapt: replace with a real situation if you have one (it does not need to be a Friday). Interviewers value an honest story of a mistake you owned far more than "I never broke production".`,
      followUps: [
        {
          q: 'Why did you deploy at 6 pm on a Friday?',
          a: 'Answer honestly. If it was a mistake, say so and what rule changed. If it was urgent (a client deadline), say that and that the lesson was to have a quick rollback and a smoke test ready.',
        },
        {
          q: 'Would you tell the client it was your fault?',
          a: 'Communication to clients goes through the agreed person (manager / account owner). Internally I take full ownership. Externally the message is: what happened, impact, it is fixed, what we changed.',
        },
      ],
    },
  ],
};
