// HR & Behavioral — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.
// Field mapping for this stack:
//   what = what the interviewer is really asking   why = what they want to learn about you
//   code = answer template / STAR outline (lang 'text')   output = full sample answer (first person)
//   questions = variations of the question            spoken = the 30-second version
// Facts come only from Adarsh's resume. Anything personal you must fill in is marked "Adapt:".

export default {
  id: 'hr',
  title: 'HR & Behavioral',
  icon: '🤝',
  description: 'The non-technical rounds: tell me about yourself, why you left, salary, notice period, STAR stories, conflict, failures and the questions you ask back. Templates plus sample answers built from my real resume.',
  definitionTitle: 'What is the HR and behavioural round?',
  definition: `The **HR and behavioural round** checks **how you work**, not what you know technically: communication, teamwork, ownership, handling pressure and conflict, career goals, and whether you fit the team and company. It also covers practical points like **notice period** and **salary**.

The best tool for these answers is the **STAR method**: **S**ituation, **T**ask, **A**ction, **R**esult. It turns a vague answer into a short, specific story with a clear result.

**One-line answer:** "The behavioural round assesses how I work with people and handle real situations — I answer using STAR: Situation, Task, Action, Result — plus practical topics like notice period and salary."`,
  topics: [
    {
      id: 'tell-me-about-yourself',
      title: 'Tell Me About Yourself',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A 60-90 second Present → Past → Future story built from my real resume, ending with why this role.',
      what: `This is almost always the **first question**. The interviewer is not asking for your life story or your hobbies. They are really asking: **"Give me a short, clear summary of who you are professionally, and why you are sitting here today."**

Use the **Present → Past → Future** structure:
1. **Present** — who you are now: "Full Stack Engineer (MERN), 3+ years."
2. **Past** — what you did and the 2-3 best results: Haspaces (June 2023 – September 2026), SkillKeepr and OCTAGNT.
3. **Future** — what you want next, and why this role fits.

#### Deeper version
This answer is also a **steering tool**. Every highlight you mention (Stripe billing, Boolean search, the AI voice agent, the Node 16 → 18 migration) is a "hook" — the interviewer will likely pick one and ask more. So only mention things you can talk about for 5 minutes.

Keep it to **60-90 seconds**. Shorter feels thin, longer loses attention. End with a clear handover line ("...that's why this role caught my attention") so the interviewer knows you are done. Do not repeat the resume line by line — they already have it.`,
      why: `They want to see three things: **communication** (can you summarise clearly?), **self-awareness** (do you know what your strongest work is?), and **fit** (does your direction match this role?). The first 90 seconds also set the mood of the whole interview, so a calm, structured answer makes you look senior.`,
      analogy: `It is like a movie trailer. A trailer does not show the whole film — it shows the best scenes and makes you want to watch more. Your answer shows the best "scenes" of your career so the interviewer asks about exactly those.`,
      code: [
        {
          title: 'Template: Present → Past → Future',
          lang: 'text',
          code: `PRESENT (10-15s)
  "I'm <name>, a <role> with <X> years of experience in <core stack>."

PAST (40-50s)
  "Most recently I was at <company> from <start> to <end>, working on <products>."
  Highlight 1: <what you built> -> <result>
  Highlight 2: <what you built> -> <result>
  Highlight 3: <ownership / reliability example>

FUTURE (15-20s)
  "Now I'm looking for <type of role / scale / domain>.
   That's why <this company / this role> interests me: <one specific reason>."`,
        },
        {
          title: 'Filled-in skeleton for my resume',
          lang: 'text',
          code: `PRESENT  Full Stack Engineer (MERN), 3+ years: React, Next.js, Node, TypeScript, MongoDB.

PAST     Haspaces, Thiruvananthapuram, June 2023 - September 2026
         SKILLKEEPR: multi-tenant HR SaaS -> RBAC, Stripe subscriptions + marketplace,
                     MongoDB Boolean search engine, led Node 16 -> 18 migration,
                     fixed critical production issues within 24 hours
         OCTAGNT:    agentic AI shortlisting -> OpenAI JD generation (~70% less manual effort),
                     AI voice interview agent microservice on GCP (Twilio, Google STT/TTS, Grok Voice),
                     Zoho CRM automation, Docker + AWS S3/Lambda + CI/CD

FUTURE   Own full-stack features end to end at larger scale, especially SaaS + AI.
         Adapt: add one specific reason this company fits (product, domain, scale).`,
        },
      ],
      output: `"Hi, I'm Adarsh. I'm a Full Stack Engineer with a little over three years of experience, mainly in the MERN stack with TypeScript and Next.js.

Most recently I worked at Haspaces in Thiruvananthapuram, from June 2023 to September 2026, on two products. The first was SkillKeepr, a multi-tenant HR SaaS. There I built role-based access control, Stripe subscriptions and a marketplace, and a Boolean search engine on MongoDB so recruiters could run queries like 'React AND Node NOT PHP'. I also led our Node 16 to 18 migration and handled critical production issues, usually fixing them within 24 hours.

The second product was OCTAGNT, an agentic AI platform for shortlisting candidates. I built job description generation with OpenAI, which cut manual effort by around 70%, and a separate AI voice interview agent on GCP using Twilio, Google speech-to-text and text-to-speech, and xAI's Grok Voice. I also automated Zoho CRM onboarding and worked on Docker and AWS deployments.

My role there ended in September, and I'm now looking for a team where I can own full-stack features end to end at a bigger scale — especially in SaaS and AI. That's why this role caught my attention."

(About 80 seconds when spoken calmly.) Adapt: replace the last line with one specific reason for each company.`,
      questions: [
        {
          q: 'Walk me through your resume.',
          a: 'Same structure, but slightly more chronological: BSc Computer Science (2019–2022), then Haspaces (June 2023 – September 2026), the two products, then what you want next.',
        },
        {
          q: 'Tell me something that is not on your resume.',
          a: 'Give a work-relevant human detail: how you learn (for example, daily use of Claude Code and Copilot to prototype faster), or why you enjoy debugging production issues. Adapt: add a real hobby only if it shows a useful trait.',
        },
        {
          q: 'Describe yourself in three words.',
          a: 'Pick three words and back each with one proof. For example: "Ownership (I led the Node migration), calm under pressure (24-hour production fixes), curious (I picked up voice AI for OCTAGNT)."',
        },
        {
          q: 'Can you give me a 30-second version?',
          a: 'Drop the details and keep one highlight per product: "Full Stack MERN engineer, 3+ years. At Haspaces I built Stripe billing and search for an HR SaaS, and an AI voice interview agent for an AI hiring platform. Now I want to own features at bigger scale."',
        },
      ],
      spoken: `"I'm Adarsh, a Full Stack Engineer with over three years in React, Node, TypeScript and MongoDB. From June 2023 to September 2026 I was at Haspaces, working on two products. On SkillKeepr, a multi-tenant HR SaaS, I built role-based access, Stripe subscriptions and a Boolean search engine, and I led our Node 16 to 18 migration. On OCTAGNT, an AI shortlisting platform, I built OpenAI job description generation that cut manual effort by about 70%, and an AI voice interview agent on GCP. Now I want to own full-stack features at a larger scale, which is why this role interests me."`,
      mistakes: [
        'Starting with personal life ("I was born in...", "my hobbies are..."). Start with your professional identity.',
        'Reading the resume line by line, or listing every technology you have ever touched. Pick 3-4 highlights with results.',
        'Going over 2 minutes. If they want more, they will ask.',
        'Mentioning a buzzword you cannot defend. Every hook you drop can become the next question.',
        'Follow-up trap: "You said ~70% less manual effort — how did you measure it?" Have an honest answer ready (for example, time to write a JD before vs after). Adapt: use your real method; never invent a measurement.',
      ],
      takeaway: 'Present → Past → Future in 60-90 seconds, with hooks you are happy to be asked about.',
    },
    {
      id: 'why-leaving',
      title: 'Why Did You Leave Your Last Role?',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'My Haspaces role ended in September 2026. Answer honestly, positively, and point to the future — never blame the employer.',
      what: `The interviewer is really asking: **"Is there a problem I should worry about?"** — Were you fired for performance? Do you fight with managers? Will you leave us in 6 months too?

Your situation: your role at Haspaces **ended in September 2026**. So the question is in the past tense: "Why did you leave?" or "Why are you not working right now?"

A good answer has three parts:
1. **The honest reason, in one neutral sentence.**
2. **What you gained** there (one line).
3. **What you are looking for next** — and how this role fits.

#### Deeper version
Pick the framing that matches your **real** reason. Never invent a reason — HR may call references or check with the old employer.

- **A. Growth / scale:** "I had built a lot end to end and wanted larger scale and deeper product ownership."
- **B. Project or contract ended:** "The work I was hired for reached its natural end, and the role ended in September."
- **C. Relocation / personal:** "I'm moving to <city>, so I decided to look for a role there."

If the honest reason was a layoff or restructuring, say it plainly and without emotion: "The company restructured and my role was affected." Layoffs are common and not your fault. Spend 20% of the answer on the past and 80% on the future.`,
      why: `They want to know if you are **stable**, **professional** and **moving towards something** (not just running away). Criticising your old company is the biggest red flag — the interviewer imagines you saying the same about them one day.`,
      analogy: `It is like explaining why you moved out of your old house. "The landlord was terrible" makes the new landlord nervous. "I needed more space for my growing family" makes sense and sounds positive. Same move, very different impression.`,
      code: [
        {
          title: 'Template (3 sentences)',
          lang: 'text',
          code: `1. REASON (neutral, honest, one line)
   "My role at Haspaces ended in September 2026 <because ...>."

2. GRATITUDE / GAIN (one line)
   "I'm grateful for it — I built <SkillKeepr / OCTAGNT highlights> and grew a lot."

3. FUTURE (two lines)
   "Now I'm looking for <scale / ownership / domain>.
    This role fits because <specific reason>."`,
        },
        {
          title: 'Three framings — choose the one that is TRUE for you',
          lang: 'text',
          code: `A. GROWTH / SCALE
   "After three years I had built billing, search, RBAC and AI features end to end.
    I wanted to work at a bigger scale with deeper product ownership, so I decided to move on."

B. PROJECT / CONTRACT ENDED
   "The products I was working on reached a stable stage and my role came to an end
    in September. It was a good point to take the next step."

C. RELOCATION / PERSONAL
   "I'm relocating to <city> (Adapt), so I wrapped up my work at Haspaces in September
    and I'm now focusing on roles here."

If it was a layoff/restructuring:
   "The company restructured and my role was affected. I left on good terms,
    and I'm happy to share references."   (Adapt: only if true)`,
        },
      ],
      output: `Sample using framing A (growth / scale):

"My role at Haspaces ended in September 2026. I'm really grateful for those three years — I got to build a lot end to end: Stripe billing, a Boolean search engine and RBAC for SkillKeepr, and an AI voice interview agent for OCTAGNT. I also led the Node 16 to 18 migration.

At that point I felt I'd learned a lot from the product and the team, and I wanted to grow into larger scale and deeper product ownership. So I decided to move on and look for a team where I can own features used by many more users. That's what attracted me to this role — <Adapt: one specific reason about this company>."

Notice: one sentence about leaving, one about gratitude, the rest about the future. No complaints.`,
      questions: [
        {
          q: 'Why are you not working right now?',
          a: 'Calm and short: "My role at Haspaces ended in September 2026. Since then I\'ve been preparing for interviews and sharpening my skills (Adapt: what you are actually doing), and I\'m available to join immediately."',
        },
        {
          q: 'Were you laid off / let go?',
          a: 'Answer honestly. If yes: "Yes, the company restructured and my role was affected. It was not performance-related." If no: "No, it was my decision" and give your real reason. Never lie — it can be checked.',
        },
        {
          q: 'Why did you leave without another offer in hand?',
          a: '"The timing of my role ending was clear, and I preferred to give a clean handover rather than rush. It also means I can join immediately." Adapt to your real situation.',
        },
        {
          q: 'Would you go back to your old company?',
          a: 'Keep it warm but forward-looking: "I left on good terms and respect the team, but I\'m looking for a different scale and kind of ownership now."',
        },
      ],
      spoken: `"My role at Haspaces ended in September 2026. I'm grateful for those three years — I built Stripe billing, a Boolean search engine and RBAC for SkillKeepr, an AI voice interview agent for OCTAGNT, and I led a Node migration. By the end, I wanted to grow into larger scale and deeper product ownership, so it was the right time to move on. I left on good terms. Now I'm looking for a team where I can own full-stack features for more users, and that's exactly why this role interests me."`,
      mistakes: [
        'Blaming the old employer, manager or salary ("the management was bad", "they underpaid me"). It is the number one red flag.',
        'Inventing a reason that is not true. References and background checks can expose it, and a lie is worse than any honest reason.',
        'Talking too long about the past. Keep the "why I left" part to one or two sentences and move to the future.',
        'Sounding nervous or defensive about being between jobs. A short gap after a role ends is normal — say it calmly.',
        'Follow-up trap: "So what have you been doing since September?" Have a real answer ready: interview prep, a side project, a course, upskilling in an area. Adapt: only say what you actually did.',
      ],
      takeaway: 'One honest neutral sentence about leaving, one line of gratitude, then talk about the future.',
    },
    {
      id: 'notice-period',
      title: 'Notice Period and Joining Date',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'My role ended in September 2026, so I can join immediately — a real advantage; say it clearly and confidently.',
      what: `The question is simple: **"When can you start?"** In India, most engineers have a 30-90 day notice period, which is a big problem for hiring teams. Your role at Haspaces **ended in September 2026**, so you have **no notice period**.

Say it clearly: "I'm available to join immediately" or "I can join within a week."

#### Deeper version
Being an immediate joiner is a **real advantage**. Recruiters often have urgent positions and get dropped candidates who accept a counter-offer during a 90-day notice. You remove that risk.

But do not use it to look desperate. Do not say "I'll join tomorrow, anything is fine." Give a confident, reasonable date. If you need a few days (documents, relocation), say a specific number: "I can join within 7 days of the offer."

Also be ready for the related HR checks: your **relieving letter** and **experience letter** from Haspaces, last payslips, and the exact last working day (September 2026). Adapt: confirm you have these documents before the HR round.`,
      why: `They are planning: when the seat is filled, when onboarding happens, and whether you might take a counter-offer and back out. A clear, honest date shows you are organised and serious.`,
      analogy: `It is like a taxi that is already outside your door versus one that is 90 minutes away. If both are equally good, everyone picks the one that is already here.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `1. STATUS     "My last working day at <company> was <date>."
2. AVAILABILITY "So I'm available to join immediately / within <N> days of the offer."
3. DOCUMENTS  "I have my relieving and experience letters ready."  (Adapt: only if true)
4. (optional) "Is there a target start date for this position?"`,
        },
      ],
      output: `"My role at Haspaces ended in September 2026, so I don't have a notice period. I'm available to join immediately — realistically within a week of receiving the offer, so I can finish any joining formalities. I have my relieving and experience letters ready. Is there a target start date you have in mind for this position?"

Adapt: if you need to relocate, add "I'd need about <N> days to relocate to <city>."`,
      questions: [
        {
          q: 'What is your notice period?',
          a: '"I don\'t have one — my role ended in September 2026, so I can join immediately, or within a week of the offer."',
        },
        {
          q: 'What is your last working day?',
          a: 'Give the exact date from your relieving letter. Adapt: "My last working day was <date> September 2026."',
        },
        {
          q: 'Are you interviewing elsewhere? Do you have other offers?',
          a: 'Be honest but short: "Yes, I\'m in conversations with a few companies, but this role is one of my top choices because <reason>." Do not invent offers to create pressure.',
        },
        {
          q: 'If we make an offer, how fast can you decide?',
          a: '"Within a couple of days. I\'d just like to review the full offer letter." This is professional and still shows interest.',
        },
      ],
      spoken: `"My role at Haspaces ended in September 2026, so I don't have any notice period. I can join immediately — realistically within a week of receiving the offer, so I have time to complete the joining formalities. I already have my relieving and experience letters ready. If there's a target start date for this role, I'm happy to work around it. That's one advantage of my timing: there's no risk of a long notice period or a counter-offer delaying things."`,
      mistakes: [
        'Sounding desperate: "I can start tomorrow, anything works." Give a calm, specific timeline instead.',
        'Being vague about dates. HR will verify with your relieving letter, so give the exact last working day.',
        'Forgetting to mention documents. Missing relieving or experience letters can delay an offer.',
        'Follow-up trap: "Since you are available immediately, can we lower the offer?" Being available fast is a benefit to them, not a reason to pay less. Keep the salary conversation based on your skills and market range.',
      ],
      takeaway: 'Say "I can join immediately (within a week)" clearly — it is an advantage, not a weakness.',
    },
    {
      id: 'strengths-weaknesses',
      title: 'Strengths and Weaknesses',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Give 2-3 strengths with proof from real projects, and one real (non-fatal) weakness with what you are doing about it.',
      what: `Two classic questions:
- **"What are your strengths?"** — really means: "What will you be good at here, and can you prove it?"
- **"What is your weakness?"** — really means: "Are you self-aware, honest, and do you improve?"

For strengths: **claim + proof + result**. "I take ownership. For example, I led our Node 16 to 18 migration."

For weakness: **real weakness + impact + what you are doing to fix it + progress**.

#### Deeper version
Pick strengths that match the job description. A backend-heavy role? Talk about reliability and the 24-hour production fixes. A product role? Talk about end-to-end ownership like Stripe billing.

For weakness, avoid fake ones ("I'm a perfectionist", "I work too hard") — interviewers hear them every day. Also avoid weaknesses that are core to the job ("I'm bad at JavaScript"). Choose something real but fixable. Good options for a 3-year engineer:
- Saying yes to too many things / not delegating enough.
- Diving into code before writing a short plan or design doc.
- Being less confident in public speaking or big meetings.
- Less depth in one area (for example, large-scale infrastructure or advanced SQL) compared to your main stack.

Adapt: choose the one that is honestly true for you.`,
      why: `They are testing **self-awareness** and **honesty**. A candidate who knows their weak spots and works on them is easier to manage and grows faster. Strengths with proof also help them map you to the right team.`,
      analogy: `It is like a cricket player's profile: "Strong against fast bowling — averaged well on bouncy pitches. Working on spin — doing extra net sessions with a spin coach." Honest, specific, and shows improvement.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `STRENGTH (x2 or x3)
  Claim:  "One of my strengths is <trait>."
  Proof:  "For example, at <company> I <specific action>."
  Result: "<what happened because of it>."

WEAKNESS (x1)
  Real weakness: "Something I'm working on is <weakness>."
  Impact:        "Earlier, this meant <small real consequence>."
  Action:        "So now I <concrete habit / tool / practice>."
  Progress:      "It's improved — <evidence>."`,
        },
        {
          title: 'Filled-in options from my resume',
          lang: 'text',
          code: `STRENGTHS
  Ownership      -> led the Node 16 -> 18 migration on SkillKeepr
  Calm in crises -> fixed critical production issues within 24 hours
  End-to-end     -> built Stripe subscriptions + marketplace, front to back
  Learning fast  -> picked up Twilio + Google STT/TTS + Grok Voice for the AI voice agent

WEAKNESS (pick ONE that is true - Adapt)
  "I used to jump into code before writing a plan."
     -> now I write a short design note / architecture diagram first
        (I did this for SkillKeepr docs)
  "I used to take on too much myself instead of asking for help early."
     -> now I flag risks in stand-up as soon as an estimate looks wrong`,
        },
      ],
      output: `"My biggest strength is ownership. On SkillKeepr I led our Node 16 to 18 migration — I planned it, tested it and saw it through. A second strength is staying calm in production issues: when something critical broke, I usually had it fixed within 24 hours, and I'd write down what happened so it didn't repeat.

A weakness I've been working on is that I used to jump straight into code before writing a plan. On a couple of features that meant rework once I discovered an edge case late. So now I write a short design note or a simple architecture diagram first — I did that for SkillKeepr's architecture documentation — and share it with the team before building. It's made my estimates much more accurate."

Adapt: replace the weakness with your own true one, and use a real example of its impact.`,
      questions: [
        {
          q: 'What is your greatest strength?',
          a: 'One trait + one proof: "Ownership — I led the Node 16 to 18 migration on SkillKeepr from planning to rollout."',
        },
        {
          q: 'What is your biggest weakness?',
          a: 'A real, fixable weakness + what you do about it: "I used to start coding before planning; now I write a short design note first and share it."',
        },
        {
          q: 'What would your last manager say about you?',
          a: 'Use strengths you can prove: "That I take ownership and stay calm when production breaks." Adapt: use real feedback you received if you have it.',
        },
        {
          q: 'What skill do you want to improve in the next year?',
          a: 'Pick something relevant to the job: system design at larger scale, deeper cloud/infra, or testing strategy. Mention how you are learning it.',
        },
      ],
      spoken: `"My main strength is ownership. On SkillKeepr I led our Node 16 to 18 migration end to end, and I built Stripe billing from front to back. I'm also calm under pressure — critical production issues I handled were usually fixed within 24 hours. A weakness I've worked on is jumping into code before planning. Early on, that caused some rework when I found edge cases late. Now I write a short design note or diagram first and share it with the team, and my estimates have become much more accurate."`,
      mistakes: [
        'Fake weaknesses like "I\'m a perfectionist" or "I work too hard". Interviewers see through them instantly.',
        'A weakness that is core to the job ("I\'m not good with JavaScript" for a React role).',
        'Listing strengths as adjectives without proof ("hardworking, team player, quick learner"). Always attach a real example.',
        'Stopping after naming the weakness. Always say what you are doing to fix it.',
        'Follow-up trap: "Give me another weakness." Keep a second one ready (for example, public speaking in big meetings, and how you practise it).',
      ],
      takeaway: 'Strengths need proof; a weakness needs a fix — both must be true.',
    },
    {
      id: 'why-hire-you',
      title: 'Why Should We Hire You?',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Match 2-3 of their needs to 2-3 proven things you have done, and end with immediate availability.',
      what: `The interviewer is really asking: **"Summarise in 30 seconds why you are a good bet for THIS job."** It is a closing pitch.

The formula: **their need → your proof**. Read the job description, pick their top 2-3 needs, and match each with something you have actually done.

#### Deeper version
Do not say "I'm hardworking and passionate" — every candidate says that. Be specific and connect to the role:
- They need full-stack MERN? → SkillKeepr and OCTAGNT, both end to end.
- They need payments? → Stripe subscriptions and marketplace.
- They need AI/LLM work? → OpenAI JD generation (~70% less manual effort) and the voice interview agent.
- They need reliability? → 24-hour production fixes, Node migration.
- They need someone fast? → available to join immediately.

Finish with a short value line: "So I can contribute from the first weeks, not after months of ramp-up." Do not compare yourself to other candidates — you do not know them.`,
      why: `They want to see if **you** understand the role and can connect your experience to it. It also tests confidence: can you sell yourself without being arrogant?`,
      analogy: `It is like a lock and key. The job description is the lock. You do not describe every key you own — you show the one key whose shape matches this lock.`,
      code: [
        {
          title: 'Template: need -> proof',
          lang: 'text',
          code: `"From the job description, you need <need 1>, <need 2> and <need 3>.
  - <need 1>: I <proof from real work + result>.
  - <need 2>: I <proof>.
  - <need 3>: I <proof>.
 On top of that, <extra: immediate joiner / domain knowledge>.
 So I can add value quickly, not after a long ramp-up."`,
        },
      ],
      output: `Sample for a SaaS company hiring a full-stack engineer with AI features:

"From what I understand, you need someone who can own full-stack features in React and Node, work with payments, and help build AI features. That's very close to what I did for the last three years.

On SkillKeepr, a multi-tenant HR SaaS, I built RBAC, Stripe subscriptions and a marketplace, and a Boolean search engine on MongoDB. On OCTAGNT I built OpenAI-based job description generation that reduced manual effort by about 70%, and an AI voice interview agent on GCP. I've also handled production — I led a Node 16 to 18 migration and fixed critical issues within 24 hours.

And since my last role ended in September, I can join immediately. So I can start contributing in the first few weeks."

Adapt: change the three needs to match each company's job description.`,
      questions: [
        {
          q: 'What makes you different from other candidates?',
          a: 'Do not attack others. Point to your mix: "Full-stack MERN plus real payment (Stripe) and AI/LLM production experience — that combination is less common."',
        },
        {
          q: 'Why are you a good fit for this role?',
          a: 'Same formula: their 2-3 needs, your 2-3 proofs, end with availability.',
        },
        {
          q: 'What value will you add in the first 90 days?',
          a: '"First month: learn the codebase and ship small fixes. Second: own a feature end to end. Third: improve something — docs, tests, or a reliability issue I notice." Adapt to the role.',
        },
      ],
      spoken: `"From the job description, you need someone who can own full-stack features in React and Node, handle payments, and build AI features. That's what I've done for three years. On SkillKeepr I built RBAC, Stripe subscriptions and a MongoDB Boolean search engine. On OCTAGNT I built OpenAI job description generation that cut manual effort by about 70%, plus an AI voice interview agent. I've also led a Node migration and handled production issues within 24 hours. And I can join immediately, so I can start adding value quickly."`,
      mistakes: [
        'Generic claims: "I\'m hardworking, passionate and a fast learner." Everyone says it; nobody remembers it.',
        'Listing every skill you have instead of the 2-3 that match this role.',
        'Comparing yourself to other candidates ("I\'m better than the others"). You do not know them, and it sounds arrogant.',
        'Follow-up trap: "But you have never worked at our scale." Answer honestly: "True — but I\'ve owned systems end to end, I learn fast (I picked up voice AI for OCTAGNT), and scale is exactly what I want to grow into."',
      ],
      takeaway: 'Their need → your proof, three times, then "I can join immediately."',
    },
    {
      id: 'why-this-company',
      title: 'Why Do You Want to Join Us?',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Show you researched them: one thing about the product, one about the role, one about how you fit.',
      what: `The interviewer is really asking: **"Did you research us, or are you applying everywhere?"** and **"Will you stay and care about our product?"**

A strong answer has three specific parts:
1. **Product / company** — something real you learned about what they build.
2. **Role** — what in this job excites you.
3. **Fit** — how your experience connects to it.

#### Deeper version
Research before every interview (15-20 minutes is enough):
- Their website and product (sign up for a free trial if there is one).
- Their engineering blog, GitHub, or tech talks — what stack and problems do they have?
- Recent news: funding, launches, new markets.
- The job description: which words repeat? Those are their real needs.
- LinkedIn profiles of the team you would join.

Then connect it to your work. If they are a SaaS company, mention multi-tenancy and Stripe billing from SkillKeepr. If they build AI features, mention OCTAGNT. If they are HR-tech, you already know the domain.

Never answer with only salary, location, or "it's a big brand". Those can be true, but they are not the main answer.`,
      why: `Companies want people who chose them on purpose. Specific reasons show **effort**, **genuine interest** and a better chance you will **stay**. A generic answer tells them you will leave for the next offer.`,
      analogy: `It is like a wedding toast. "You are both great people" is forgettable. "I remember when you two drove 6 hours to watch a cricket match in the rain" shows you actually know them.`,
      code: [
        {
          title: 'Template + research checklist',
          lang: 'text',
          code: `TEMPLATE
  1. Product:  "I looked at <product/feature> and I liked <specific thing>."
  2. Role:     "This role involves <X from JD>, which is the work I enjoy most."
  3. Fit:      "At Haspaces I <related proof>, so I can contribute to <their area>."

RESEARCH CHECKLIST (15-20 min)
  [ ] What do they sell, and to whom?
  [ ] Try the product / read the docs
  [ ] Engineering blog / GitHub / stack in JD
  [ ] Recent news (funding, launches)
  [ ] 2-3 words that repeat in the JD
  [ ] Who interviews me (LinkedIn)`,
        },
      ],
      output: `Sample for a B2B SaaS company that is adding AI features (Adapt: replace the bracketed parts with real research):

"I spent some time on your product, and I liked how <specific feature> handles <problem> for teams. I also read that you're adding AI features to <area>. That's exactly the kind of work I enjoy.

At Haspaces I worked on both sides of that. SkillKeepr was a multi-tenant SaaS where I built RBAC and Stripe subscriptions, so I understand SaaS foundations. And on OCTAGNT I built LLM features in production — OpenAI job description generation and an AI voice interview agent. So I feel I can contribute to both your core product and your AI roadmap fairly quickly. And honestly, the scale you're at is the next step I want in my career."`,
      questions: [
        {
          q: 'What do you know about our company?',
          a: 'Give 2-3 facts: what they build, who uses it, and one recent thing (launch, funding, blog post). Then connect one fact to your experience.',
        },
        {
          q: 'Why this role and not a pure backend or pure frontend role?',
          a: '"I enjoy owning a feature end to end — like Stripe billing on SkillKeepr, from the React pricing page to webhooks in Node. Full-stack lets me do that."',
        },
        {
          q: 'Which other companies are you applying to?',
          a: 'Be honest at a high level: "Mostly product companies in SaaS and AI." No need to name them. Then say why this one is high on your list.',
        },
      ],
      spoken: `"I looked at your product and really liked how <specific feature> solves <problem> for teams. What excites me about this role is that it's full-stack ownership on a SaaS product that's adding AI — and that's exactly my background. At Haspaces I built multi-tenant SaaS features like RBAC and Stripe subscriptions on SkillKeepr, and production AI features on OCTAGNT, like OpenAI job description generation and a voice interview agent. So I can contribute quickly, and your scale is the next step I want."`,
      mistakes: [
        'Generic praise: "You are a great company with a great culture." It shows zero research.',
        'Leading with salary, location or brand name as the main reason.',
        'Getting basic facts wrong (wrong product, confusing them with a competitor). Check before the call.',
        'Follow-up trap: "What would you improve in our product?" Have one small, respectful, specific suggestion ready from trying the product — framed as a question, not criticism.',
      ],
      takeaway: 'Specific product + specific role + your proof = a believable "why us".',
    },
    {
      id: 'five-years',
      title: 'Where Do You See Yourself in 5 Years?',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Show ambition that grows inside this company: deeper technical ownership, then leading and mentoring.',
      what: `The interviewer is really asking: **"Are your goals realistic, and do they match what we can offer? Will you stay?"**

A good answer shows:
- **Direction** — the kind of engineer you want to become.
- **Growth inside the company** — not "starting my own startup" or "moving abroad".
- **Realism** — a natural next step from 3+ years of experience.

#### Deeper version
A natural path from your level: **strong full-stack engineer → senior engineer who owns systems → tech lead / mentor** (or a deep specialist, for example in AI/LLM systems or payments). You do not need a job title; talk about responsibilities: owning architecture decisions, mentoring juniors, being the go-to person for an area.

Connect to your past: you already wrote architecture docs and diagrams on SkillKeepr, and you led a migration. So "owning architecture and leading engineers" is a believable next step.

Keep it flexible: "I want to grow into X, and I think this role is a good path to it." Do not promise to stay forever — nobody believes that.`,
      why: `Hiring costs a lot of time and money. They want someone who will **grow with them** and whose ambitions fit their career ladder. Too little ambition looks lazy; ambitions outside the company look like a flight risk.`,
      analogy: `It is like planning a train journey. They do not need your whole life plan — they want to know your next few stations are on their line, so you will not get off at the first stop.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `1. NEAR TERM (1-2 yrs): "Become a strong owner of <area> here: ship features end to end,
                          understand the product deeply."
2. MID TERM  (3-5 yrs): "Grow into a senior / lead role: own architecture for a domain,
                          mentor juniors, help with technical decisions."
3. LINK:                "I've already started on that path at <company> by <proof>.
                          This role is a good next step because <reason>."`,
        },
      ],
      output: `"In five years I see myself as a senior engineer, or a tech lead, who owns a whole area of the product — not just tickets. In the first year or two here, I want to go deep on your product and ship features end to end. After that, I'd like to take on architecture decisions for a domain and help junior engineers grow.

I've already started in that direction. At Haspaces I led our Node 16 to 18 migration and wrote architecture diagrams and documentation for SkillKeepr. I'd also like to go deeper in AI systems, since I built LLM and voice features on OCTAGNT. This role looks like a good path to both, because <Adapt: reason from the JD — e.g. the team is growing, or AI is on the roadmap>."`,
      questions: [
        {
          q: 'What are your long-term career goals?',
          a: 'Same idea: senior → tech lead or deep specialist, with a link to what you have already started (migration lead, architecture docs).',
        },
        {
          q: 'Do you want to go into management?',
          a: 'Honest and open: "I want to stay hands-on for the next few years and grow into technical leadership — mentoring, design reviews. I\'m open to people management later if it fits." Adapt to your real preference.',
        },
        {
          q: 'How long do you plan to stay with us?',
          a: '"As long as I\'m learning and adding value — and I\'m looking for a place where that can be several years." Do not promise a specific number.',
        },
      ],
      spoken: `"In five years I want to be a senior engineer or tech lead who owns a whole area of the product. In the first year or two, I want to go deep on your product and ship features end to end. After that, I'd like to own architecture for a domain and mentor junior engineers. I've already started on that path — I led a Node migration and wrote architecture documentation at Haspaces. I'm also keen to go deeper on AI systems after OCTAGNT. This role feels like the right next step for both."`,
      mistakes: [
        'Saying "I don\'t know" or "wherever life takes me". It sounds directionless.',
        'Saying you want to start your own company, move abroad, or switch careers. That signals you will leave.',
        'Aiming unrealistically high: "CTO in 5 years" with 3 years of experience.',
        'Follow-up trap: "What if there is no lead position available?" "Leadership for me is more about responsibility than title — owning a domain, mentoring and design reviews. I can grow in those anywhere."',
      ],
      takeaway: 'Senior → lead (or deep specialist), grown inside this company, with proof you have already started.',
    },
    {
      id: 'questions-to-ask',
      title: 'Good Questions to Ask the Interviewer',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Always ask 2-3 thoughtful questions about the team, the work and success in the role — never "no questions".',
      what: `At the end almost every interviewer says: **"Do you have any questions for me?"** It is not a formality. They are checking your **interest**, **curiosity** and **priorities**.

Always ask **2-3 questions**. Match them to the person:
- **Engineer** → codebase, stack, deployments, code review, on-call.
- **Engineering manager** → team, expectations, how success is measured, growth.
- **HR** → process, next steps, onboarding, culture.
- **Founder / CTO** → product direction, biggest challenges, roadmap.

#### Deeper version
The best questions do double duty: they show you think like an owner, **and** they give you real information to decide if you want the job. For example, "What does success look like in the first 90 days?" tells you their expectations and shows you plan to deliver.

A strong closing question: **"Is there anything in my background that makes you unsure about my fit?"** It gives you a chance to fix a doubt before you leave the room. Ask it calmly, and answer any concern briefly.

Avoid questions you could Google, and avoid leading with salary, leave or work hours in a technical round (save those for HR).`,
      why: `"No questions" sounds like low interest. Good questions leave a final strong impression — it is the last thing they remember. And you genuinely need this information to avoid joining the wrong team.`,
      analogy: `An interview is like a first meeting before a business partnership. If only one side asks questions, it is an interrogation. When both sides ask, it becomes a conversation between equals.`,
      code: [
        {
          title: 'Question bank by interviewer',
          lang: 'text',
          code: `ENGINEER
  - What does a normal week look like for someone on this team?
  - How do code reviews and deployments work? How often do you release?
  - What is the biggest technical challenge the team is facing right now?
  - How do you handle production incidents and on-call?

MANAGER
  - What does success look like for this role in the first 90 days?
  - What separates a good engineer from a great one on your team?
  - How do you give feedback and support growth?

HR
  - What are the next steps in the process, and the timeline?
  - How does onboarding work for new engineers?

FOUNDER / CTO
  - What are the main product priorities for the next year?
  - Where do AI features fit in your roadmap?

CLOSER (any round)
  - Is there anything in my background that makes you unsure about my fit?`,
        },
      ],
      output: `Sample at the end of a round with an engineering manager:

"Yes, thank you — I have a few. First, what does success look like for this role in the first 90 days? Second, what's the biggest technical challenge the team is working on right now? I ask because at Haspaces I enjoyed exactly those problems — like the Node 16 to 18 migration and production fixes on SkillKeepr. And finally, is there anything in my background that makes you unsure about my fit? I'd be happy to clarify."

If they raise a concern (for example, "you haven't worked at our scale"), answer in 2-3 calm sentences with proof of how you learn fast.`,
      questions: [
        {
          q: 'Do you have any questions for us?',
          a: 'Always yes. Ask 2-3 from the bank that match the interviewer\'s role.',
        },
        {
          q: 'What should I avoid asking?',
          a: 'Things you can Google ("what does your company do?"), and leading with salary, leave or WFH in a technical round. Ask those in the HR round.',
        },
        {
          q: 'When can I ask about salary and benefits?',
          a: 'In the HR round or when they bring it up. Ask about the full structure: fixed vs variable, benefits, appraisal cycle.',
        },
      ],
      spoken: `"Yes, I do, thank you. First, what does success look like for someone in this role in the first 90 days? Second, what's the biggest technical challenge your team is dealing with right now? At Haspaces I really enjoyed that kind of work — migrations and production issues on SkillKeepr. And last, how does the team handle releases and code reviews? Oh, and one more if there's time: is there anything in my background that makes you unsure about my fit? I'd like the chance to clarify it."`,
      mistakes: [
        'Saying "No, you covered everything." It sounds like low interest.',
        'Asking only about salary, leave, or work hours in a technical round.',
        'Asking something easily found on their website.',
        'Asking ten questions when time is over. Respect the clock — 2-3 is enough.',
        'Follow-up trap: after "Is there anything that makes you unsure?" the interviewer names a real gap. Do not argue. Acknowledge it, give one proof of fast learning, and say how you would close the gap.',
      ],
      takeaway: 'Always ask 2-3 role-specific questions; end with "anything that makes you unsure about my fit?"',
    },
    {
      id: 'remote-work',
      title: 'Working Remotely, Hybrid or On-site',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Show you communicate proactively, document well and stay visible — and be flexible about the work mode.',
      what: `Questions like **"Are you comfortable working remotely?"** or **"Are you OK with working from the office 3 days a week?"** really mean: **"Can you work well without someone watching you, and will you accept our work mode?"**

Show two things:
1. **Flexibility** — you are fine with their model.
2. **Remote habits** — clear updates, written communication, being reachable, documenting decisions.

#### Deeper version
Good remote engineers make their work **visible**:
- Short written stand-up updates: done / doing / blocked.
- Raise blockers early instead of waiting until the deadline.
- Write things down: PR descriptions, decisions, architecture notes. Your SkillKeepr architecture diagrams and docs are good proof.
- Overlap hours with the team, and respond within a reasonable time.
- Use async tools well: tickets, PR comments, recorded demos.

Adapt: say honestly whether your Haspaces role was on-site, hybrid or remote, and what you prefer. If you need to relocate for an on-site role, say so clearly with a timeline.`,
      why: `Remote and hybrid work fail when people go silent. They want to know you can **self-manage**, **communicate clearly** and **build trust** without being in the same room.`,
      analogy: `Working remotely is like being a pilot talking to air traffic control. Nobody can see you, so you report your position regularly. Silence makes everyone nervous, even if you are flying perfectly.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `1. FLEXIBILITY: "I'm comfortable with <remote / hybrid / on-site>."
2. HABITS:      "When remote, I <daily written updates>, <raise blockers early>,
                 <document decisions>."
3. PROOF:       "For example, at <company> I <documentation / async example>."
4. (if needed)  "For on-site, I can relocate to <city> within <N> days."  (Adapt)`,
        },
      ],
      output: `"I'm comfortable with remote, hybrid or on-site — I'll adapt to how the team works best. When I work remotely, I focus on making my work visible: a short written update every day with what's done, what's next and any blockers, and I raise risks early instead of on the deadline.

I also believe in writing things down. At Haspaces I created architecture diagrams and technical documentation for SkillKeepr, which helped people understand the system without needing a meeting. And for things like live interviews with Jitsi and WebSockets, clear written specs made collaboration much easier.

Adapt: add your real work mode at Haspaces and whether you can relocate."`,
      questions: [
        {
          q: 'How do you stay productive at home?',
          a: 'Fixed working hours, a clear daily plan from the ticket board, notifications off during deep-work blocks, and a written update at the end of the day.',
        },
        {
          q: 'How do you handle being blocked when your teammates are offline?',
          a: 'Write the question clearly in the right channel with context, then switch to another task (tests, docs, a different ticket) so the time is not wasted.',
        },
        {
          q: 'Are you willing to relocate / come to office?',
          a: 'Answer honestly with a timeline: "Yes, I can relocate within <N> days." Adapt: only say yes if you mean it.',
        },
      ],
      spoken: `"I'm comfortable with remote, hybrid or on-site, and I'm happy to follow what works for the team. When I'm remote, I make my work visible: a short daily written update — done, next, blocked — and I raise risks early. I also document a lot. At Haspaces I created architecture diagrams and documentation for SkillKeepr, so teammates could understand the system without extra meetings. And since I'm available immediately, I can plan any relocation quickly if it's needed."`,
      mistakes: [
        'Saying "remote only" when the role is hybrid, without discussing it. Be honest early instead of surprising them later.',
        'Talking about remote work as "more free time". Talk about focus and output instead.',
        'Having no examples of written communication or async work.',
        'Follow-up trap: "How would your manager know you are working?" "By my output and updates: tickets moved, PRs merged, a written daily note — not by green dots on Slack."',
      ],
      takeaway: 'Flexible on the mode, strict on communication: updates, early blockers, written decisions.',
    },
    {
      id: 'star-method',
      title: 'The STAR Method (with My Real Stories)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Answer every "tell me about a time..." with Situation, Task, Action, Result — four ready stories from my projects.',
      what: `**Behavioral questions** start with "Tell me about a time when..." or "Give me an example of...". The interviewer believes **past behaviour predicts future behaviour**, so they want a real story, not a theory.

**STAR** is a simple structure for those stories:
- **S — Situation:** the context in 1-2 sentences. Where, when, what was going on.
- **T — Task:** what **you** had to do. Your responsibility or goal.
- **A — Action:** what **you** did, step by step. This is the longest part (about 60%).
- **R — Result:** what happened. A number if you have one, plus what you learned.

#### Deeper version
Tips that make STAR answers strong:
- Say **"I"**, not "we", for the actions. They are hiring you, not your team. (Credit the team once, then explain your part.)
- Keep it to **about 2 minutes**. Situation and Task together should be under 30 seconds.
- Add **L — Learning** at the end (STAR-L): what you would do differently. It shows growth.
- Prepare **4-6 stories** that can answer many questions. One story can cover "pressure", "ownership" and "problem-solving" with a different focus.

Your ready-made stories from the resume:
1. **24-hour production fix** (SkillKeepr) → pressure, problem solving, ownership.
2. **Node 16 → 18 migration** (SkillKeepr) → leadership, planning, risk.
3. **Stripe subscriptions + marketplace** (SkillKeepr) → complex feature, learning, end-to-end ownership.
4. **MongoDB Boolean search engine** (SkillKeepr) → technical challenge, user-focused problem solving.
5. **AI voice interview agent / JD generation** (OCTAGNT) → learning new tech fast, innovation.

Adapt: the resume gives the headline facts. Fill each story with real details you remember (what broke, how long, who was affected). Never invent numbers.`,
      why: `Interviewers use STAR-style questions to check **real experience**, **how you think**, and **what you personally did**. A structured story is easy to follow and easy for them to score. A rambling story makes even great work sound weak.`,
      analogy: `STAR is like a short news report: where it happened (Situation), what the hero needed to do (Task), what they did (Action), and how it ended (Result). Nobody wants a news report that spends five minutes on the weather before the main event.`,
      code: [
        {
          title: 'STAR template + story map',
          lang: 'text',
          code: `S  Situation (1-2 sentences)  : "At <company>, on <product>, <context>."
T  Task      (1 sentence)     : "I was responsible for <goal>."
A  Action    (3-5 steps, "I") : "First I ... Then I ... I also ..."
R  Result    (1-2 sentences)  : "<outcome + number if real>."
L  Learning  (1 sentence)     : "Since then I always <habit>."

STORY MAP (one story -> many questions)
  24h production fix      -> pressure | failure | ownership | debugging
  Node 16 -> 18 migration -> leadership | planning | risk | initiative
  Stripe billing build    -> complex feature | learning | end-to-end
  Boolean search engine   -> technical challenge | user focus | creativity
  AI voice agent (OCTAGNT)-> learning fast | ambiguity | innovation`,
        },
        {
          title: 'Four filled STAR outlines (Adapt the details)',
          lang: 'text',
          code: `1) 24-HOUR PRODUCTION FIX (SkillKeepr)
 S: A critical issue hit production on our multi-tenant HR SaaS; users were affected.
 T: I owned finding the cause and shipping a fix fast.
 A: Reproduced it with logs, isolated the cause, shipped a minimal safe fix,
    verified in production, then wrote a short post-incident note + added a guard/test.
 R: Fixed within 24 hours. Adapt: what broke, how many tenants, what guard you added.

2) NODE 16 -> 18 MIGRATION (SkillKeepr)
 S: Node 16 was reaching end of life; we needed to upgrade safely.
 T: I led the migration.
 A: Audited dependencies, upgraded/replaced incompatible packages, ran the app and
    tests on Node 18 in a branch, updated Docker/CI images, rolled out in steps.
 R: Moved to Node 18. Adapt: any downtime? issues found? how long it took?

3) STRIPE SUBSCRIPTIONS + MARKETPLACE (SkillKeepr)
 S: SkillKeepr needed paid plans and a marketplace.
 T: I built the billing flow end to end.
 A: Designed plans/products in Stripe, built checkout + subscription management,
    handled webhooks (verify signature, idempotent updates), tested with test mode.
 R: Subscriptions + marketplace live. Adapt: plans, edge cases (failed payments, upgrades).

4) MONGODB BOOLEAN SEARCH ENGINE (SkillKeepr)
 S: Recruiters needed precise candidate search like "React AND Node NOT PHP".
 T: I built the Boolean search engine.
 A: Parsed the query (AND / OR / NOT, quotes, brackets) into a tree, converted the
    tree into a MongoDB query, added indexes, tested tricky queries.
 R: Recruiters could run Boolean queries. Adapt: speed, adoption, feedback.`,
        },
      ],
      output: `Full sample — "Tell me about a time you solved a hard technical problem" (story 4):

"**Situation:** At Haspaces I worked on SkillKeepr, a multi-tenant HR SaaS. Recruiters wanted precise candidate search, like 'React AND Node NOT PHP' — the kind of Boolean search they use on job portals.

**Task:** I was responsible for building that Boolean search engine on top of MongoDB.

**Action:** First, I wrote a small parser that took the recruiter's text and understood AND, OR, NOT, quotes and brackets, turning it into a tree. Then I converted that tree into a MongoDB query, using $and, $or and $nor. I added indexes on the searched fields so it stayed fast, and I built a set of tricky test queries — nested brackets, quoted phrases, empty NOT clauses — to make sure the results were right.

**Result:** Recruiters could finally search the way they were used to. Adapt: add real feedback or a speed number if you have one.

**Learning:** I learned to break a 'fuzzy' feature into clear layers — parse, translate, execute — which made it much easier to test."`,
      questions: [
        {
          q: 'Tell me about a time you worked under pressure.',
          a: 'Use the 24-hour production fix story. Focus the Action on staying calm, prioritising the fix, and communicating.',
        },
        {
          q: 'Tell me about a time you took the lead.',
          a: 'Use the Node 16 → 18 migration. Focus on planning, risk checks and step-by-step rollout.',
        },
        {
          q: 'Tell me about a complex feature you built end to end.',
          a: 'Use Stripe subscriptions + marketplace. Mention checkout, subscription states and secure, idempotent webhooks.',
        },
        {
          q: 'Tell me about a time you learned something new quickly.',
          a: 'Use the OCTAGNT AI voice interview agent: Twilio, Google STT/TTS and Grok Voice were new, and you built a working microservice on GCP.',
        },
        {
          q: 'How long should a STAR answer be?',
          a: 'About 1.5-2 minutes. Short Situation and Task, a detailed Action, a clear Result, and one line of Learning.',
        },
      ],
      spoken: `"For behavioral questions I use STAR: Situation, Task, Action, Result. For example — at Haspaces, on SkillKeepr, recruiters wanted Boolean search like 'React AND Node NOT PHP'. I was responsible for building it on MongoDB. I wrote a parser that turned the query into a tree, converted that tree into a MongoDB query with and, or and nor, added indexes, and tested tricky cases like nested brackets. As a result, recruiters could search the way they were used to. The lesson for me was to split fuzzy features into clear, testable layers."`,
      mistakes: [
        'Spending a minute on the Situation and ten seconds on the Action. The Action is what they score.',
        'Saying "we" the whole time. The interviewer cannot tell what you did.',
        'Giving a hypothetical ("I would...") when they asked for a real example ("Tell me about a time...").',
        'Inventing numbers for the Result. If you do not have a real metric, describe the outcome in words.',
        'Follow-up trap: "What would you do differently?" Always prepare a Learning line for every story — it is the most common follow-up.',
      ],
      takeaway: 'Situation and Task short, Action detailed with "I", Result real — and have 4-5 stories ready.',
    },
    {
      id: 'production-failure',
      title: 'Handling a Production Failure',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Stay calm, communicate, stop the bleeding first, then find the root cause and prevent repeats — my 24-hour fixes on SkillKeepr.',
      what: `Questions like **"Tell me about a time production broke"** or **"How do you handle a production incident?"** really ask: **"Do you panic, hide, or blame — or do you calmly fix, communicate and learn?"**

A good incident process, in simple steps:
1. **Acknowledge and communicate** — tell the team / manager you are on it.
2. **Assess impact** — who is affected? How many tenants? Is money or data involved?
3. **Mitigate first** — stop the damage (roll back, feature flag off, hotfix) before the perfect fix.
4. **Find the root cause** — logs, reproduce, check recent deployments.
5. **Fix properly and verify** in production.
6. **Prevent** — add a test, alert, or guard; write a short post-mortem (a "what happened and what we changed" note) with **no blame**.

#### Deeper version
Your resume says you **fixed critical production issues within 24 hours** on SkillKeepr, a multi-tenant SaaS. In multi-tenant systems, one bug can hit many customers at once, or worse, leak data across tenants — so impact assessment comes first.

Useful words to use naturally: **rollback** (going back to the last good version), **hotfix** (a small urgent fix shipped outside the normal release), **root cause** (the real reason, not just the symptom), **post-mortem** / **RCA** (root cause analysis document), **blameless** (focus on the system, not the person).

Adapt: pick one real incident you remember. Note what broke, how you found it, what the fix was, and what guard you added afterwards.`,
      why: `Every system breaks. They want to know you can be trusted with production: calm under pressure, honest communication, focused on users, and you make sure the same thing does not happen again.`,
      analogy: `It is like a doctor in an emergency room. First stop the bleeding (mitigate). Then run tests to find the cause (root cause). Then treat it properly (fix). Then advise the patient so it does not happen again (prevention). You never start with paperwork while the patient bleeds.`,
      code: [
        {
          title: 'Incident playbook (say these steps)',
          lang: 'text',
          code: `1. ACK        -> "I'm on it" in the team channel; tell the manager
2. IMPACT     -> which tenants/users? data or payments involved?
3. MITIGATE   -> rollback / disable feature flag / quick hotfix
4. ROOT CAUSE -> logs, recent deploys, reproduce locally
5. FIX        -> proper fix + test, deploy, verify in prod
6. UPDATE     -> tell stakeholders it's resolved
7. PREVENT    -> test / alert / validation; blameless post-mortem`,
        },
        {
          title: 'STAR outline: 24-hour fix on SkillKeepr (Adapt)',
          lang: 'text',
          code: `S: Critical production issue on SkillKeepr (multi-tenant HR SaaS).
   Adapt: what users saw, e.g. a feature failing for some tenants.
T: I owned the investigation and the fix.
A: - Informed the team and checked impact first
   - Checked logs + recent deployments to narrow the cause
   - Reproduced it locally / in staging
   - Shipped a minimal, safe fix; verified in production
   - Added a test/guard and wrote a short incident note
R: Resolved within 24 hours; the same issue did not come back.
L: Now I check impact first and always add a guard after a fix.`,
        },
      ],
      output: `"On SkillKeepr, our multi-tenant HR SaaS, we had a critical production issue — Adapt: describe what users saw, for example a key feature failing for some tenants.

First, I told the team I was looking into it and checked the impact: which tenants were affected and whether any data or payments were involved. Then I went through the logs and our recent deployments to narrow it down, and reproduced the problem in a test environment. Once I found the root cause — Adapt: the real cause — I shipped a small, safe fix rather than a big refactor, and verified it in production with the affected users' flows.

We had it fully fixed within 24 hours. Afterwards I added a test and a guard so the same issue couldn't come back, and wrote a short incident note for the team. The main lesson for me was: check impact and stop the damage first, then fix the root cause properly."`,
      questions: [
        {
          q: 'What do you do first when production breaks?',
          a: 'Communicate that you are on it and check the impact. Then mitigate (rollback or feature flag) before working on the perfect fix.',
        },
        {
          q: 'Have you ever caused a production bug?',
          a: 'Be honest — most engineers have. Explain it briefly, how you fixed it, and what you changed (tests, review checklist) so it does not repeat.',
        },
        {
          q: 'What is a post-mortem?',
          a: 'A short document after an incident: what happened, timeline, root cause, impact and action items. It should be blameless — focus on fixing the system, not blaming a person.',
        },
        {
          q: 'Rollback or hotfix — how do you choose?',
          a: 'If the last deployment caused it and rollback is safe, roll back first — it is fastest. Use a hotfix when rollback is not possible (for example, a database migration already ran) or the issue is not from the latest deploy.',
        },
      ],
      spoken: `"When production breaks, I stay calm and follow a simple order. First I tell the team I'm on it and check the impact — which tenants are affected, and whether data or payments are involved. Then I stop the damage, with a rollback or a small hotfix. After that I find the real root cause through logs and recent deployments. On SkillKeepr I fixed critical production issues within 24 hours this way. And after every fix, I add a test or guard and write a short blameless note, so the same thing doesn't happen twice."`,
      mistakes: [
        'Jumping into the code without telling anyone. Silence during an incident makes everyone more stressed.',
        'Blaming a teammate or another team in the story. Keep it blameless.',
        'Stopping at "I fixed it". Always add what you did to prevent it from happening again.',
        'Trying the perfect fix while users are still affected, instead of mitigating first.',
        'Follow-up trap: "How did you know it was really fixed?" Mention verifying in production: the user flow works, error logs stop, and (if available) monitoring looks normal.',
      ],
      takeaway: 'Communicate, mitigate, find root cause, fix, prevent — calm and blameless.',
    },
    {
      id: 'tight-deadlines',
      title: 'Handling Tight Deadlines',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Break the work down, cut scope not quality, communicate risks early, and deliver the most important part first.',
      what: `**"How do you handle tight deadlines?"** really asks: **"When time is short, do you panic, cut corners silently, or manage it like a professional?"**

A good approach:
1. **Understand** what is truly required by the date (the "must-haves").
2. **Break it down** into small tasks and estimate.
3. **Prioritise** — must-have first, nice-to-have later.
4. **Communicate early** if it does not fit — offer options, not just bad news.
5. **Protect quality** on the risky parts (payments, auth, data).
6. **Deliver**, then follow up on what was postponed.

#### Deeper version
The key skill is **negotiating scope, not quality**. Instead of "I can't do it", say: "We can ship A and B by Friday, and C next week. Or all three by Wednesday next week. Which is better for the business?" This turns a problem into a choice for the manager.

Things you should never silently cut: security, payment correctness (for example, Stripe webhook handling), data integrity, and basic tests on critical paths. You can cut: polish, extra filters, admin screens, non-critical edge-case UI.

Adapt: pick a real deadline from Haspaces — for example a client demo for OCTAGNT or a launch of a SkillKeepr feature — and how you split the scope.`,
      why: `Deadlines are constant in product companies. They want someone who is **reliable**, **honest about risk early**, and can **make smart trade-offs** without breaking production.`,
      analogy: `It is like packing for a flight when the taxi arrives in 10 minutes. You pack passport, phone, charger and medicines first (must-haves). The extra shoes can come later in a courier. You never leave the passport behind to save time.`,
      code: [
        {
          title: 'Template + scope table',
          lang: 'text',
          code: `STAR
 S: "<feature> had to ship by <date> because <business reason>."
 T: "I was responsible for <part>."
 A: - Broke it into tasks and estimated
    - Split MUST vs NICE-TO-HAVE
    - Told the manager early: "A+B by date, C after"
    - Focused tests on risky parts
 R: "Shipped the core on time; C followed <when>."

SCOPE TABLE
 MUST (ship by date)        | LATER (next iteration)
 ---------------------------+---------------------------
 core user flow             | extra filters / sorting
 payments / auth correct    | UI polish, animations
 tests on critical path     | admin reports`,
        },
      ],
      output: `Sample (Adapt the details to a real deadline you had):

"On OCTAGNT we had a client demo coming up and needed AI job description generation working in time. I was responsible for the feature end to end.

I first listed everything that was asked for and split it into must-haves and nice-to-haves. The must-haves were: generate a good JD from a few inputs with OpenAI, let the recruiter edit it, and save it. The nice-to-haves were things like multiple tone options and templates. I told my manager early: 'I can have the core flow ready for the demo, and the extras the week after.' He agreed.

I focused testing on the parts that could embarrass us in the demo — bad or empty AI responses, timeouts — and added a fallback message. We delivered the core flow on time, the demo went well, and the extras came in the next iteration. Later, that feature cut manual JD writing effort by around 70%."`,
      questions: [
        {
          q: 'What do you do if you realise you will miss a deadline?',
          a: 'Tell the manager as early as possible, explain why, and offer options: reduce scope, move the date, or get help. Never surprise people on the last day.',
        },
        {
          q: 'How do you prioritise when everything is urgent?',
          a: 'Ask what the business impact of each item is, sort by impact and risk, and confirm the order with the manager. Then work one thing at a time.',
        },
        {
          q: 'Have you ever cut corners to meet a deadline?',
          a: 'Be honest: "I\'ve cut scope, not quality. When I did take a shortcut, I logged it as tech debt and fixed it in the next sprint." Adapt: give a real example.',
        },
      ],
      spoken: `**Example story — replace the details with a real situation from your own work before you say this.**

"When a deadline is tight, I first separate must-haves from nice-to-haves, break the work into small tasks, and estimate. If it doesn't fit, I tell my manager early and give options — for example, core flow by Friday and extras next week. I cut scope, not quality, so payments, security and critical tests stay solid. On OCTAGNT, before a client demo, I shipped the core AI job description flow on time with a fallback for bad responses, and delivered the extras in the next iteration."`,
      mistakes: [
        'Saying "I just work late nights and weekends." It sounds like poor planning and is not sustainable.',
        'Waiting until the deadline day to say it will not be ready.',
        'Silently skipping tests or security checks to save time.',
        'Follow-up trap: "What if the manager says everything is a must-have?" "Then I ask which item hurts the business most if it slips, show the estimate, and ask for help or a later date for the rest. I make the trade-off visible."',
      ],
      takeaway: 'Cut scope, not quality — and raise the risk early with options.',
    },
    {
      id: 'handling-conflict',
      title: 'Handling Conflict with a Teammate',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Talk privately, listen first, focus on the problem not the person, use data, and agree on a decision.',
      what: `**"Tell me about a conflict with a coworker"** really asks: **"Are you mature? Can you disagree without damaging the relationship or the project?"**

A good approach:
1. **Talk directly and privately** — not in a group chat or behind their back.
2. **Listen first** — understand their view and their reasons.
3. **Focus on the goal** — "What is best for the users/product?", not "Who is right?".
4. **Use facts** — data, a quick prototype, docs, a small test.
5. **Agree and commit** — reach a decision (or escalate politely if stuck), then fully support it.

#### Deeper version
Most conflicts in engineering are about **approach** (which library, which design), **priorities** (my task vs your task), or **communication** (unclear ownership, late PR reviews). Pick a story where the conflict was **professional, not personal**, and where it ended well.

The phrase **"disagree and commit"** is useful: you share your view honestly, and once the team decides, you support the decision fully even if it was not your choice.

Adapt: choose a real disagreement — for example how to structure a feature in SkillKeepr, an API contract between frontend and backend, or a code review disagreement — and how you resolved it.`,
      why: `Teams fail more often from people problems than technical ones. They want to see **empathy**, **communication** and **maturity** — someone who resolves things instead of escalating every small issue or avoiding it.`,
      analogy: `It is like two people giving a taxi driver different routes. Arguing louder does not help. Open Google Maps (the data), look at the traffic together, and pick the fastest route. Everyone just wants to reach the destination.`,
      code: [
        {
          title: 'STAR template for conflict',
          lang: 'text',
          code: `S: "<teammate/role> and I disagreed about <topic> on <project>."
T: "We needed to decide <decision> before <deadline>."
A: - "I asked to talk 1:1 and listened to their reasons first."
   - "I explained my concern with facts: <data / prototype / docs>."
   - "We found <common goal> and agreed on <decision / compromise>."
R: "<outcome>; we worked well together afterwards."
L: "I learned to <listen first / use data early / talk sooner>."`,
        },
      ],
      output: `Sample (Adapt: replace with your real disagreement):

"On SkillKeepr, a frontend teammate and I disagreed about an API for one of the recruiter screens. He wanted one big endpoint returning everything for the page; I was worried it would get slow and be hard to reuse, especially with multi-tenant data and role-based access on each field.

Instead of arguing in the PR comments, I asked him for a quick call. I listened first — his main concern was too many network calls making the page slow. That was fair. Then I showed him how the big response would grow with every new feature, and how the RBAC checks would get messy.

We agreed on a middle path: a main endpoint for the page's core data, and separate endpoints for the heavy, optional parts that loaded later. Both of our concerns were solved. The page was fast, and the API stayed clean. What I learned is that most disagreements are about different worries, and once you understand the other person's worry, the solution is usually easy."`,
      questions: [
        {
          q: 'How do you handle a difficult coworker?',
          a: 'Assume good intent, talk privately, focus on specific behaviour and its impact (not personality), and look for a shared goal. Escalate only if it keeps affecting the work.',
        },
        {
          q: 'Tell me about a time someone disagreed with your code review.',
          a: 'Explain the reason behind your comment, be open to their view, and if it is a style preference, let it go. If it is a correctness or security issue, hold firm with evidence.',
        },
        {
          q: 'When would you escalate a conflict to your manager?',
          a: 'When you have tried to resolve it directly and it is still blocking the work or affecting the team. Present it as "we need a decision", not as a complaint.',
        },
      ],
      spoken: `**Example story — replace the details with a real situation from your own work before you say this.**

"When I disagree with a teammate, I talk to them directly and privately, and I listen first. On SkillKeepr, a teammate wanted one big API for a recruiter page; I was worried about performance and messy access checks. On a call I learned his real concern was too many network calls. So we agreed on a middle path — core data in one endpoint, heavy optional parts loaded separately. Both concerns were solved. My lesson is that most conflicts are different worries, and once you understand theirs, the answer comes quickly."`,
      mistakes: [
        'Saying "I have never had a conflict." It sounds untrue or like you avoid hard conversations.',
        'Telling a story where you were 100% right and the other person looks foolish.',
        'Choosing a personal or emotional conflict instead of a professional one about work.',
        'Ending the story without a resolution or lesson.',
        'Follow-up trap: "What if they still did not agree?" "Then we would ask the tech lead to decide, and I would fully support the decision — disagree and commit."',
      ],
      takeaway: 'Private talk, listen first, use facts, agree, and commit — the relationship survives the disagreement.',
    },
    {
      id: 'disagree-senior',
      title: 'Disagreeing with a Senior or Manager',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Respectfully raise concerns with data and options, in private; if they still decide otherwise, commit fully.',
      what: `**"Tell me about a time you disagreed with your manager or a senior engineer"** really asks: **"Will you speak up when something is wrong — and can you do it respectfully, without ego?"**

Both extremes are bad:
- Never disagreeing = they cannot trust you to flag risks.
- Fighting every decision = hard to work with.

The right way:
1. **Ask questions first** — maybe they know something you do not (business context, deadlines, past failures).
2. **Raise the concern privately** and early, with **data or a demo**.
3. **Offer options**, not just objections.
4. **Respect the decision** — if they still choose differently, commit and do it well.
5. **Document** the risk if it is serious (a short note or ticket), without "I told you so".

#### Deeper version
Seniors often decide based on **context you cannot see**: client promises, budget, team capacity. So start with curiosity: "Can you help me understand why we chose X?" Often the disagreement disappears.

When it does not, frame it around **risk and users**: "My worry is that if we skip webhook signature checks, someone could fake a payment event." That is hard to dismiss and shows you care about the product, not about winning.

Adapt: use a real example — a design choice, a deadline, a shortcut, or a library decision — where you raised a concern respectfully.`,
      why: `They want engineers who protect the product with honest feedback, but who also respect hierarchy and team decisions. It is a test of **courage plus humility**.`,
      analogy: `It is like a co-pilot and a captain. If the co-pilot sees a problem, they must speak clearly — that is their job. But they say it calmly with the instrument readings, and once the captain decides, they work together, not against each other.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `S: "<senior/manager> proposed <decision> for <project>."
T: "I had a concern about <risk>."
A: - "I asked questions first to understand the reason."
   - "I raised my concern privately with <data / small demo / docs>."
   - "I offered options: <A> or <B>."
   - "They decided <X>; I committed and <made it work / added a safeguard>."
R: "<outcome>."
L: "I learned that <context matters / data convinces better than opinions>."`,
        },
      ],
      output: `Sample (Adapt: replace with a real situation):

"During the Stripe subscription work on SkillKeepr, a senior colleague suggested we update a customer's plan status right after the checkout page redirected back, to save time. My concern was that the redirect isn't reliable — the user can close the tab — and it can be faked, so plan status could be wrong.

I first asked why he preferred it, and the reason was the deadline. So I didn't just say no. I showed him Stripe's recommendation to use webhooks as the source of truth, and I offered a plan: keep the redirect for a fast 'thank you' screen, but update the subscription only from a verified webhook. It only added about a day.

He agreed. Later, that choice saved us when some users closed the browser before the redirect — their subscriptions still activated correctly. I learned that a concern with data and a ready alternative is much easier for a senior to accept than a plain objection."`,
      questions: [
        {
          q: 'What if your manager is clearly wrong?',
          a: 'Ask questions to understand, show evidence in private, offer an alternative. If they still decide, commit — unless it is unethical, illegal, or a serious security issue; then escalate properly.',
        },
        {
          q: 'Have you ever pushed back on a deadline?',
          a: 'Yes — with an estimate and options: "We can ship the core by the date, the rest a week later." Pushback with options is welcome; pushback without options feels like complaining.',
        },
        {
          q: 'Did you ever disagree and turn out to be wrong?',
          a: 'A great story if you have one: shows humility. "I wanted X, the senior chose Y, and Y was better because of context I did not have. Now I ask about context first." Adapt: only if true.',
        },
      ],
      spoken: `**Example story — replace the details with a real situation from your own work before you say this.**

"I do speak up, but respectfully. I start by asking questions, because seniors often have context I don't. If I still have a concern, I raise it privately, with data and an alternative. On SkillKeepr, a senior suggested updating subscription status from the checkout redirect to save time. I showed Stripe's guidance to use verified webhooks as the source of truth, and offered a plan that only added about a day. He agreed. And if a senior decides differently after hearing me, I commit fully to the decision."`,
      mistakes: [
        'Saying "I always agree with my seniors." It sounds like you will not flag real risks.',
        'Telling a story where you went over their head or argued in a public meeting.',
        'Framing the senior as incompetent. Keep it respectful — the issue was the decision, not the person.',
        'Follow-up trap: "What if they ignored your concern and it failed?" "I would help fix it first, then suggest a blameless review. No \'I told you so\' — the goal is the product, not being right."',
      ],
      takeaway: 'Ask first, disagree privately with data and options, then commit to the decision.',
    },
    {
      id: 'working-under-pressure',
      title: 'Working Under Pressure',
      level: 'intermediate',
      priority: 'good',
      frequency: 'very common',
      summary: 'Show a calm system: prioritise, focus on one thing, communicate, and protect quality — with one real story.',
      what: `**"How do you work under pressure?"** really asks: **"When things get stressful, do you stay effective and pleasant to work with?"**

Do not just say "I work well under pressure" — prove it with a **system** and a **story**:
- **Prioritise** — what matters most right now?
- **Focus** — one task at a time, distractions off.
- **Communicate** — short updates so others are not anxious.
- **Protect quality** — no risky shortcuts on critical code.
- **Recover** — after the rush, fix the cause so the same pressure does not repeat.

#### Deeper version
Pressure in engineering usually comes from three places: **incidents** (production is down), **deadlines** (demo or launch), and **many parallel demands** (two products, many stakeholders). You had all three at Haspaces — you worked on two products, SkillKeepr and OCTAGNT, at the same time, and handled critical production issues.

It is fine to admit pressure is uncomfortable. What they want is that it does not make you **careless**, **silent** or **rude**. A small line like "I take a short break to reset, then come back with a list" sounds human and mature.

Adapt: pick one pressured moment (an incident, a client demo, juggling both products) and tell it with STAR.`,
      why: `Startups and product teams have pressure regularly. They want someone who **stays calm**, **keeps quality**, and **keeps others informed**, so the whole team stays calm too.`,
      analogy: `It is like a goalkeeper facing a penalty. Panicking and diving early loses. The good keeper breathes, watches the ball, and makes one clear move. Pressure is the same — slow down your mind, then act decisively.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `SYSTEM (say in 2 lines)
  "Under pressure I prioritise, focus on one thing, communicate often,
   and never skip checks on critical code."

STORY (STAR)
  S: "<incident / deadline / parallel work> on <project>."
  T: "I had to <goal> by <time>."
  A: "I listed tasks by impact, did <most important> first,
      gave updates every <N hours>, kept tests on <critical path>."
  R: "<outcome>."
  L: "Afterwards I <fixed the cause / improved the process>."`,
        },
      ],
      output: `"I handle pressure by slowing down for a minute and making a list. Then I work on the highest-impact item first, keep people updated, and don't take risky shortcuts on critical code.

At Haspaces I worked on two products in parallel — SkillKeepr and OCTAGNT. Adapt: one real moment, for example: a critical production issue on SkillKeepr came in while I had an OCTAGNT task due. I told my manager about the clash right away, and we agreed the production issue came first because customers were affected. I focused on it, shared short updates with the team, and had it fixed within 24 hours. Then I went back to the OCTAGNT work with a slightly adjusted date that everyone already knew about.

What I learned is that pressure gets much smaller once priorities are clear and everyone knows the plan."`,
      questions: [
        {
          q: 'How do you deal with stress?',
          a: 'A short system: make a list, prioritise, take a short break to reset, and talk to the team early. Outside work, a real habit (Adapt: exercise, walks, sport) helps keep energy.',
        },
        {
          q: 'How do you manage working on multiple projects at once?',
          a: 'Clear priorities from the manager, time blocks per project, and visible status on the ticket board. At Haspaces I worked on SkillKeepr and OCTAGNT in parallel this way.',
        },
        {
          q: 'Do you work well with pressure, or do you prefer a calm environment?',
          a: '"I do my best work with clear priorities. Some pressure is normal and I handle it well; when it is constant, I look for the root cause and fix the process."',
        },
      ],
      spoken: `"Under pressure, I first take a minute to list what needs doing, then work on the highest-impact thing first. I keep people updated so nobody has to chase me, and I never take risky shortcuts on critical code. At Haspaces I worked on two products in parallel, and when a critical production issue came up during other work, I agreed priorities with my manager, focused on the fix, and resolved it within 24 hours. For me, pressure becomes manageable as soon as priorities are clear."`,
      mistakes: [
        'Saying "I never feel pressure." It is not believable.',
        'Saying "I work best under pressure" as if you need a crisis to do good work.',
        'Giving a system with no real example.',
        'Follow-up trap: "What do you do when pressure makes you make mistakes?" "I slow down on critical parts, ask for a quick review, and rely on tests — a second pair of eyes is cheap compared to a production bug."',
      ],
      takeaway: 'Pressure answer = calm system (prioritise, focus, communicate) + one real story.',
    },
    {
      id: 'feedback-received',
      title: 'Receiving Feedback and Criticism',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Show you listen without getting defensive, act on feedback, and can show what changed.',
      what: `**"Tell me about a time you received critical feedback"** really asks: **"Are you coachable? Do you get defensive, or do you improve?"**

A good story has four parts:
1. **The feedback** — what someone told you (be specific).
2. **Your first reaction** — honest, but you listened.
3. **What you changed** — a concrete action or new habit.
4. **The result** — how things got better.

#### Deeper version
Good sources of real feedback for an engineer:
- **Code reviews** — "your PRs are too big", "missing tests", "naming is unclear".
- **Manager 1:1s** — "communicate blockers earlier", "estimate more carefully".
- **Production** — a bug that reached users is also feedback.
- **AI-assisted code** — a reviewer pointing out that generated code was not fully understood or tested.

A very believable one for many engineers: **"Your pull requests are too large to review."** The fix: smaller PRs, clear descriptions, screenshots. It shows humility and a concrete habit.

Adapt: pick feedback you really received. If you never got formal feedback, use code review comments.`,
      why: `Every team gives feedback daily through code reviews and 1:1s. They want someone who **listens**, **does not take it personally**, and **improves fast** — that person becomes senior quickly.`,
      analogy: `Feedback is like a car's GPS saying "recalculating". A good driver does not argue with the GPS. They take the new turn and reach the destination faster.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `FEEDBACK  "My <lead/reviewer> told me <specific feedback>."
REACTION  "At first I <honest reaction>, but I saw they had a point because <reason>."
ACTION    "So I started <concrete new habit>."
RESULT    "Since then <improvement: faster reviews / fewer bugs / better estimates>."`,
        },
        {
          title: 'Example options (choose a TRUE one - Adapt)',
          lang: 'text',
          code: `- "Your PRs are too big to review"      -> smaller PRs, clear description, screenshots
- "Tell us about blockers earlier"        -> raise in stand-up the same day
- "Add tests before calling it done"      -> tests on critical paths (e.g. webhooks)
- "Document how this works"               -> architecture diagrams + docs (SkillKeepr)`,
        },
      ],
      output: `Sample (Adapt: use the feedback you really got):

"Early at Haspaces, my lead told me my pull requests were too big — sometimes a whole feature in one PR — and it was slowing down reviews. Honestly, at first I thought one PR per feature was cleaner. But when I looked at how long my PRs waited for review compared to others, he was clearly right.

So I changed how I work. I started splitting features into smaller PRs — for example, for a feature like Stripe subscriptions: one PR for the data model, one for the checkout API, one for webhooks, one for the UI. Each had a short description and screenshots where useful.

Reviews became much faster, reviewers caught more real issues because each PR was focused, and I started doing the same when reviewing others' code. I now actually ask for feedback early, instead of waiting for it."`,
      questions: [
        {
          q: 'How do you react to negative feedback?',
          a: 'Listen fully, ask clarifying questions, thank them, and decide on one concrete change. If I disagree, I explain calmly with reasons — but I do not get defensive.',
        },
        {
          q: 'What is the best feedback you have received?',
          a: 'Pick one that changed how you work (smaller PRs, raising blockers early) and show the change.',
        },
        {
          q: 'How do you give feedback to others?',
          a: 'Specific, private, about the work not the person, with a suggestion: "This function does three things — could we split it so it is easier to test?"',
        },
      ],
      spoken: `**Example story — replace the details with a real situation from your own work before you say this.**

"I try to treat feedback as free help. Early at Haspaces, my lead told me my pull requests were too big and were slowing down reviews. At first I thought one PR per feature was cleaner, but the review times showed he was right. So I started splitting work into smaller PRs — for example data model, API, webhooks and UI separately — each with a clear description. Reviews got faster and caught more real issues. Now I actually ask for feedback early instead of waiting for it."`,
      mistakes: [
        'Saying "I have never received negative feedback." It sounds untrue or like nobody trusts you enough to give it.',
        'Choosing feedback about something serious like honesty or attitude.',
        'Describing the feedback but not what you changed.',
        'Sounding like you still resent the person who gave it.',
        'Follow-up trap: "Was there feedback you disagreed with?" "Yes — I explained my reasoning, we discussed it, and we agreed on a middle ground. Disagreeing calmly is still being coachable."',
      ],
      takeaway: 'Specific feedback → honest reaction → concrete change → visible result.',
    },
    {
      id: 'learning-new-tech',
      title: 'Learning a New Technology Fast',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Show your learning method with the OCTAGNT voice agent: docs, a tiny prototype, then production — using AI tools responsibly.',
      what: `**"How do you learn a new technology quickly?"** or **"Tell me about a time you had to learn something new for a project"** really asks: **"When our stack or problem is new to you, how fast and how safely can you become productive?"**

Show a clear **learning method**:
1. **Understand the goal** — what problem must this tech solve?
2. **Read the official docs / quickstart** — not random blogs first.
3. **Build a tiny prototype** — the smallest working version.
4. **Grow it step by step** — add the real requirements.
5. **Ask and verify** — teammates, community, code review; AI tools to speed up, but you verify what they produce.

#### Deeper version
Your best story is the **OCTAGNT AI Voice Interview Agent**: a standalone microservice on GCP using **Twilio** (phone calls), **Google Speech-to-Text** and **Text-to-Speech**, and **xAI Grok Voice**. That is many new pieces working together in real time.

You also used **Claude Code and GitHub Copilot** daily. Interviewers like hearing that you use AI tools to learn and prototype faster — and also that you **read and test** what they produce instead of copy-pasting blindly.

Adapt: which parts were new to you, how long the first prototype took, and the hardest problem you hit (for example latency or call handling).`,
      why: `Tech changes every year, and every company has a slightly different stack. They want someone who can **ramp up fast** without needing hand-holding, and who learns in a **safe, structured** way.`,
      analogy: `It is like moving to a new city. You do not memorise the whole map first. You learn the route from home to office, then to the supermarket, then explore more each week. Small working routes first, the full map later.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `METHOD   docs -> tiny prototype -> real requirements -> review/verify

STAR
 S: "<project> needed <capability> using <new tech>."
 T: "I had to build <component> and the tech was new to me."
 A: "I read <official docs>, built a small prototype that <did X>,
     then added <real requirements>. I used <AI tools> to speed up
     but tested everything myself."
 R: "<shipped / working in production>."
 L: "<what I would learn first next time>."`,
        },
      ],
      output: `"On OCTAGNT, we wanted an AI voice agent that could call candidates and run a first-round screening interview. Most of the pieces were new to me — Twilio for phone calls, Google Speech-to-Text and Text-to-Speech, and xAI's Grok Voice.

I started with the official docs and built the smallest possible prototype: a Twilio call that played a fixed message. Then I added speech-to-text so I could see what the caller said, then the AI response, then text-to-speech back to the caller. Once that loop worked, I moved it into a standalone microservice on GCP and handled the real problems — keeping latency low so the conversation felt natural, and handling dropped calls.

I used Claude Code and Copilot a lot to explore APIs and write boilerplate faster, but I read and tested everything they produced, especially around call handling.

Adapt: add how long it took and the hardest issue you solved. The lesson: get a tiny end-to-end loop working first, then improve each part."`,
      questions: [
        {
          q: 'What is the last thing you learned?',
          a: 'Give something recent and real, how you learned it, and where you used it. Adapt: for example, a tool or concept you studied since September.',
        },
        {
          q: 'How do you use AI coding tools?',
          a: 'To explore APIs, write boilerplate, explain unfamiliar code and draft tests faster. But I review every line, run it, and never paste secrets or customer data into a tool.',
        },
        {
          q: 'Our stack uses a technology you have not used. How will you ramp up?',
          a: 'Official docs and the team\'s codebase first, a small ticket in the first week, pair with a teammate, and ask good questions early. Mention a past example (the voice agent).',
        },
      ],
      spoken: `"My method is: official docs first, then the smallest working prototype, then add real requirements step by step. On OCTAGNT I had to build an AI voice interview agent, and Twilio, Google speech-to-text, text-to-speech and Grok Voice were all new to me. I started with a Twilio call that just played a message, then added speech-to-text, the AI reply, and speech back. Then I moved it into a microservice on GCP and worked on latency. I used Claude Code and Copilot to move faster, but I tested everything myself."`,
      mistakes: [
        'Saying "I just Google it" or "I watch YouTube tutorials" with no structure.',
        'Saying "I just ask ChatGPT/Claude to write it." Show that you verify and understand AI-generated code.',
        'Choosing a tiny example (learning a new npm package) when you have a bigger one (a real-time voice AI pipeline).',
        'Follow-up trap: "What was the hardest part of the voice agent?" Have one real technical detail ready (for example latency between speech-to-text, the LLM and text-to-speech). Adapt: use what was actually hardest.',
      ],
      takeaway: 'Docs → tiny prototype → real requirements → verify; prove it with the voice agent.',
    },
    {
      id: 'ownership-beyond-scope',
      title: 'Ownership: Going Beyond Your Scope',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Show you notice problems nobody owns and fix them — the Node migration and SkillKeepr architecture docs.',
      what: `Questions like **"Tell me about a time you went beyond your job"**, **"Tell me about something you owned end to end"** or **"Tell me about a time you took initiative"** really ask: **"Do you only finish tickets, or do you care about the whole product?"**

**Ownership** means treating the product like it is yours: noticing problems, fixing them (or raising them), and seeing things through to the end — even when nobody assigned them.

#### Deeper version
Two strong stories from your resume:
- **Node 16 → 18 migration** — upgrades are often ignored until something breaks. Leading it shows initiative and care for the long-term health of the system.
- **Architecture diagrams and technical documentation** for SkillKeepr — documentation is rarely assigned, but it helps the whole team (onboarding, debugging, decisions).

Also good: **end-to-end ownership** of Stripe billing (plan → build → test → monitor) or the voice agent microservice.

Balance is important: going beyond scope does not mean ignoring your assigned work or changing things without telling anyone. Say you **raised it, got buy-in, and did it without hurting your main tasks**.

Adapt: whether the migration and docs were your idea or assigned, and what problem they solved.`,
      why: `Companies, especially startups, need people who **act like owners**. One proactive engineer can prevent outages, speed up onboarding and reduce tech debt — far beyond their own tickets.`,
      analogy: `It is like living in a shared flat. A renter only cleans their own room. An owner notices the leaking tap in the kitchen and gets it fixed before it floods the floor — even though "it is not my room".`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `S: "I noticed <problem nobody owned> on <project>."
T: "It wasn't assigned to me, but it affected <team/users/system>."
A: - "I raised it with <manager> and proposed <plan>."
   - "I did it without dropping my main work by <how>."
   - "I saw it through: <test / rollout / handover>."
R: "<result for the team/product>."`,
        },
        {
          title: 'Filled outline: architecture docs (Adapt)',
          lang: 'text',
          code: `S: SkillKeepr had grown (multi-tenant, RBAC, Stripe, search, Jitsi live interviews)
   but the architecture lived mostly in people's heads.
T: Help the team understand and change the system safely.
A: Drew architecture diagrams (services, data flow, tenants, payments),
   wrote technical docs for key flows, kept them next to the code.
R: Easier onboarding and discussions. Adapt: a real example of it helping.`,
        },
      ],
      output: `"A good example is the Node 16 to 18 migration on SkillKeepr. Node 16 was reaching end of life, which meant no more security updates. Adapt: say whether you proposed it or it was assigned — for example: I raised it with my manager and offered to lead it.

I started by checking every dependency for Node 18 compatibility and listing what needed upgrading or replacing. I tested the app and our tests on Node 18 in a separate branch, updated the Docker images and CI, and then rolled it out step by step so we could roll back if something broke. I did this alongside my normal feature work by planning it in small pieces.

We moved to Node 18 smoothly. Similarly, I created architecture diagrams and documentation for SkillKeepr, because a lot of knowledge lived only in people's heads. Both weren't flashy features, but they made the system safer and easier for the whole team."`,
      questions: [
        {
          q: 'Tell me about a time you took initiative.',
          a: 'Node migration or architecture docs: you saw a problem, proposed a plan, and saw it through.',
        },
        {
          q: 'What is the difference between ownership and doing everything yourself?',
          a: 'Ownership means making sure the outcome happens — sometimes by doing it, sometimes by raising it, asking for help, or delegating. It is about the result, not heroics.',
        },
        {
          q: 'Have you ever fixed something that was not your responsibility?',
          a: 'Yes — but always with visibility: "I told the owner/manager, proposed a fix, and did it after agreement." Never silently change someone else\'s system.',
        },
      ],
      spoken: `"For me ownership means caring about the whole product, not just my tickets. On SkillKeepr, Node 16 was reaching end of life, so I led our migration to Node 18. I checked every dependency, tested in a separate branch, updated Docker and CI, and rolled it out step by step so we could roll back safely. I also created architecture diagrams and documentation, because a lot of knowledge was only in people's heads. Neither was a flashy feature, but both made the system safer and easier for the whole team."`,
      mistakes: [
        'Telling a story where you changed something without telling anyone. That is a risk, not ownership.',
        'A "hero" story where you worked all night alone. It can signal poor planning or poor teamwork.',
        'Neglecting your assigned work for the side initiative.',
        'Follow-up trap: "How did you convince your manager it was worth the time?" Talk about risk and cost: end-of-life Node means no security patches; docs reduce onboarding and debugging time.',
      ],
      takeaway: 'Ownership = notice the problem, raise it, fix it with buy-in, and see it through.',
    },
    {
      id: 'mentoring-juniors',
      title: 'Mentoring Juniors and Helping Teammates',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Show you teach (not just fix), through code reviews, pairing and documentation — and that you are patient.',
      what: `**"Have you mentored anyone?"** or **"How do you help junior developers?"** really asks: **"Are you ready to grow into a senior? Do you make the team better, or just yourself?"**

Good mentoring means:
- **Teaching how to think**, not just giving the answer.
- **Code reviews that explain why** ("this can cause a race condition because...").
- **Pairing** on hard problems.
- **Documentation** that helps many people at once.
- **Patience** and a safe space to ask "silly" questions.

#### Deeper version
With 3+ years, you do not need a formal "mentor" title. Informal mentoring counts: helping a new joiner set up the project, reviewing their PRs, explaining the multi-tenant design or RBAC rules, or walking them through how Stripe webhooks work.

Your **architecture diagrams and technical docs** for SkillKeepr are strong proof: they scale mentoring to everyone.

A useful idea: **"Ask, then guide"**. When a junior is stuck, first ask what they have tried, then give a hint, and only show the full answer if they are still stuck. They learn more, and next time they need you less.

Adapt: only claim mentoring you really did — who (role, not name), what you helped with, and what changed for them.`,
      why: `Seniors are measured partly by how much they **multiply the team**. Companies want people who share knowledge, review kindly, and help new joiners get productive fast.`,
      analogy: `It is the difference between giving someone a fish and teaching them to fish. Fixing a junior's bug feeds them today. Showing them how you debugged it feeds them for the next hundred bugs.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `S: "A <junior / new joiner> on <project> was struggling with <topic>."
T: "I wanted them to become independent on it, not just unblock them."
A: - "I asked what they had tried, then gave hints."
   - "We paired on <hard part>; I explained the why."
   - "In code reviews I explained reasons, not just changes."
   - "I pointed them to <docs/diagrams> I had written."
R: "<they shipped X / needed less help / started reviewing others>."`,
        },
      ],
      output: `Sample (Adapt: use a real person and situation, without naming them):

"At Haspaces, a newer developer joined SkillKeepr and found the multi-tenant setup and role-based access confusing — which data belongs to which tenant, and which role can see what. Instead of just fixing his first few PRs, I walked him through the architecture diagrams I had made, and we paired on his first feature that touched RBAC.

When he got stuck later, I'd first ask what he had tried, then give a hint. In code reviews I explained why — for example, why every query must be scoped to the tenant, because one missing filter could show one company's data to another.

Within a few weeks he was shipping features on his own, and later he was catching tenant-scoping issues in other people's PRs. That was the best sign it worked."`,
      questions: [
        {
          q: 'How do you review a junior\'s code?',
          a: 'Start with what is good, explain the why behind each change, separate must-fix (bugs, security) from suggestions (style), and offer to pair if a change is big.',
        },
        {
          q: 'A junior keeps making the same mistake. What do you do?',
          a: 'Talk privately, explain the impact, and fix the system too: a lint rule, a test, a checklist or a doc — so the mistake is caught automatically.',
        },
        {
          q: 'How do you balance mentoring with your own work?',
          a: 'Set times for questions or pairing, write docs for repeated questions, and use code reviews as teaching. Mentoring is part of the work, not extra.',
        },
      ],
      spoken: `**Example story — replace the details with a real situation from your own work before you say this.**

"I enjoy helping newer developers, and I try to teach the thinking, not just give the answer. At Haspaces, a newer developer on SkillKeepr found the multi-tenant design and role-based access confusing. I walked him through the architecture diagrams I had made, and we paired on his first RBAC feature. When he got stuck, I asked what he had tried and gave hints first. In reviews I explained why — like scoping every query to the tenant. Within a few weeks he was shipping on his own."`,
      mistakes: [
        'Claiming formal mentoring you did not do. Informal help is fine — just describe it honestly.',
        'Describing mentoring as "I fixed their bugs for them." That is unblocking, not mentoring.',
        'Sounding impatient or superior about juniors ("they always ask silly questions").',
        'Follow-up trap: "How do you know your mentoring worked?" Point to a change: they shipped independently, needed less help, or started reviewing others.',
      ],
      takeaway: 'Mentoring = teach the why, ask before telling, and scale it with docs.',
    },
    {
      id: 'salary-expectations',
      title: 'Salary Expectations (India, in LPA)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Research a market range first, give a range (not one number) based on role and skills, and talk total CTC clearly.',
      what: `**"What are your salary expectations?"** or **"What is your expected CTC?"** really asks: **"Are you within our budget, and do you know your market value?"**

Key words in India:
- **CTC** (Cost to Company) — the total yearly cost, including fixed pay, variable/bonus, PF (employer part), insurance, etc. Usually said in **LPA** (lakhs per annum).
- **Fixed** — guaranteed salary. **Variable** — bonus that depends on performance.
- **In-hand** — what reaches your bank account each month after tax and deductions.
- **Current / last CTC** — what you earned in your last role.

The basic rule: **research first, then give a range** that you are happy with even at the bottom.

#### Deeper version
**How to research a range:**
1. Check salary sites (Glassdoor, AmbitionBox, levels.fyi for bigger tech companies) for "Full Stack Engineer / SDE-2, 3-4 years" in the **same city** and **type of company** (startup, product company, MNC, service company — these differ a lot).
2. Read the job post — some list a band.
3. Ask friends and seniors in similar roles; ask recruiters what the band is for the role.
4. Adjust for your skills that add value: full-stack MERN + TypeScript, **payments (Stripe)**, **AI/LLM in production**, cloud (AWS/GCP).
5. Decide three numbers privately: **walk-away** (minimum), **target**, and **stretch**. Your stated range should start around your target, not your minimum.

**How to phrase it:** "Based on my research for full-stack roles with 3+ years and AI and payments experience, I'm looking at around X to Y LPA total CTC. I'm flexible depending on the fixed/variable split and the overall role."

Adapt: fill X and Y from your own research. Do not use numbers from a friend's message without checking several sources.`,
      why: `Companies have a budget band per role. They want to avoid wasting time on a candidate far outside it. A researched, confident range shows professionalism; a random number (too low or too high) can cost you money or the offer.`,
      analogy: `It is like selling a used car. Before you name a price, you check what similar cars (same model, year, kilometres) sell for in your city. Then you quote a fair range — not a number you guessed in the parking lot.`,
      code: [
        {
          title: 'Research worksheet (fill privately)',
          lang: 'text',
          code: `ROLE    : Full Stack Engineer / SDE-2 (MERN), 3+ years
CITY    : <city>                     COMPANY TYPE: <startup / product / MNC / service>

SOURCES               LOW (LPA)   HIGH (LPA)
Glassdoor             ____        ____
AmbitionBox           ____        ____
levels.fyi (if listed)____        ____
Friends / recruiters  ____        ____

MY PREMIUM: payments (Stripe), AI/LLM in production, Node/TS, AWS/GCP
WALK-AWAY : ____ LPA    TARGET : ____ LPA    STRETCH : ____ LPA
SAY RANGE : TARGET to STRETCH     (Adapt: all numbers from your research)`,
        },
        {
          title: 'Phrases to use',
          lang: 'text',
          code: `EXPECTATION
 "Based on my research for full-stack roles with 3+ years in <city>, and my experience
  with payments and AI features, I'm looking at X to Y LPA total CTC."

ASKED EARLY (before you know the role well)
 "I'd like to understand the role and responsibilities first. Could you share the
  band you've budgeted for this position?"

LAST CTC (if asked)
 "My last CTC at Haspaces was <Adapt: real number>. For this role, I'm looking at
  X to Y because <scope / skills / market>."

FLEXIBILITY
 "I'm flexible on the split between fixed and variable, and I'd look at the full offer."`,
        },
      ],
      output: `Sample in an HR round (Adapt: X and Y come from your research — they are placeholders here, not advice):

"Before this, I researched full-stack roles with three to four years of experience in <city>, on Glassdoor, AmbitionBox and by talking to people in similar roles. I also took into account that I bring production experience with Stripe payments and AI features like LLM integrations and a voice agent.

Based on that, I'm looking at around X to Y LPA total CTC. I'm flexible on the split between fixed and variable, and I'd look at the overall offer — the role, growth, and benefits. Could you share the band you have in mind for this position, so we can see if we're aligned?"`,
      questions: [
        {
          q: 'What is your current / last CTC?',
          a: 'Answer honestly — companies may ask for payslips. Then move to your expectation: "My last CTC was <Adapt>. For this role I\'m looking at X to Y because of the scope and my skills."',
        },
        {
          q: 'Why do you expect a hike when you are not currently employed?',
          a: '"My expectation is based on the market value of the role and my skills, not on my employment status. I\'m bringing three years of production experience in SaaS, payments and AI."',
        },
        {
          q: 'Can you give one number instead of a range?',
          a: 'Give a number near the top half of your range: "Around Y LPA." Adapt from your research.',
        },
        {
          q: 'Our budget is lower than your range. Is that OK?',
          a: 'Do not answer instantly. "Could you share the full structure? I\'d like to look at fixed, variable and benefits together before deciding." Then see the negotiation topic.',
        },
      ],
      spoken: `"I've researched the market for full-stack roles with three to four years of experience, using Glassdoor, AmbitionBox and conversations with people in similar roles. I've also factored in my production experience with Stripe payments and AI features. Based on that, I'm looking at around X to Y LPA total CTC — Adapt with your researched range. I'm flexible on the split between fixed and variable, and I'll look at the whole offer, including the role and growth. Could you share the band you have for this position?"`,
      mistakes: [
        'Giving a number without any research, or saying "whatever you think is fair". You will probably be underpaid.',
        'Lying about your last CTC. It is often verified with payslips or the offer letter.',
        'Mixing up CTC and in-hand salary. Always say clearly which one you mean — usually CTC in LPA.',
        'Making your minimum the bottom of your stated range. The company will usually offer the bottom.',
        'Follow-up trap: "Since you are an immediate joiner, can you accept less?" "Availability helps your hiring timeline, but my expectation is based on the role and my skills."',
      ],
      takeaway: 'Research → private walk-away/target/stretch → state a CTC range in LPA starting at your target.',
    },
    {
      id: 'explaining-to-non-technical',
      title: 'Explaining Technical Things to Non-Technical People',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Start with the impact, use simple words and an analogy, skip jargon, and check understanding.',
      what: `**"How would you explain X to a non-technical person?"** or **"Tell me about a time you worked with a non-technical stakeholder"** really asks: **"Can you talk to product managers, sales, HR teams and clients — not just engineers?"**

A simple method:
1. **Start with the impact** — what it means for them (time, money, risk, users).
2. **Use plain words** — no jargon, or explain it in one line.
3. **Use an analogy** — something from daily life.
4. **Give options with trade-offs** — "Fast but simple, or slower but complete."
5. **Check understanding** — "Does that make sense? What would you like to know more about?"

#### Deeper version
You worked on products for HR and recruitment, so many users and stakeholders were non-technical: recruiters using **Boolean search**, HR teams on **SkillKeepr**, clients onboarded through **Zoho CRM** automation for OCTAGNT.

Example: explaining **multi-tenancy** to a client: "Think of an apartment building. Every company has its own locked flat. They share the building — the lifts, the electricity — which keeps costs low, but nobody can enter another company's flat."

Example: explaining a **production issue** to a manager: "Some users couldn't do X for a few hours. It's fixed now. The cause was Y. We added a check so it won't happen again." No stack traces.`,
      why: `Engineers who communicate well with business people make better product decisions and get more trust. It is a key skill for growing into a senior or lead role.`,
      analogy: `It is like a doctor explaining a diagnosis. A good doctor does not say "elevated troponin levels". They say "your heart is under strain; here are two treatment options and what each means for you."`,
      code: [
        {
          title: 'Template: explain anything in 4 lines',
          lang: 'text',
          code: `1. IMPACT  : "What this means for you is <time / money / risk / users>."
2. SIMPLE  : "In simple terms, <one-sentence explanation, no jargon>."
3. ANALOGY : "It's like <daily-life comparison>."
4. CHOICE  : "We can do <A: fast/simple> or <B: complete/slower>. I'd suggest <A/B> because <reason>."
   + "Does that make sense? Anything you'd like more detail on?"`,
        },
      ],
      output: `Sample — explaining the Boolean search feature to recruiters on SkillKeepr (Adapt the details):

"This feature saves you time finding the right candidates. Instead of scrolling through hundreds of profiles, you can type exactly what you want. For example, 'React AND Node NOT PHP' gives you people who know both React and Node, but not PHP.

It's like the filters on a shopping site — 'phones AND under 20,000 NOT refurbished' — just written in one line. You can also use quotes for exact phrases and brackets to group things, like '(React OR Angular) AND Node'.

If you only remember one thing: AND narrows the list, OR widens it, and NOT removes people. Shall I show you a couple of searches on your open roles?"`,
      questions: [
        {
          q: 'Explain an API to a non-technical person.',
          a: '"An API is like a waiter in a restaurant. You do not go into the kitchen; you tell the waiter what you want, and the waiter brings it back. Apps talk to each other the same way."',
        },
        {
          q: 'How do you explain a delay to a product manager?',
          a: 'Impact first, reason in one line, the new plan and options: "Feature X will be 3 days late because payment edge cases took longer. We can ship without the coupon option on time, or everything on Thursday."',
        },
        {
          q: 'How do you handle a stakeholder who keeps changing requirements?',
          a: 'Write down what was agreed, show the cost of each change (time, risk), and agree on priorities together. Shorter iterations and early demos also reduce surprises.',
        },
      ],
      spoken: `"When I explain technical things to non-technical people, I start with what it means for them, then use plain words and an everyday analogy, and finish with clear options. For example, on SkillKeepr I'd explain Boolean search to recruiters like shopping-site filters: AND narrows the list, OR widens it, NOT removes people. Or for multi-tenancy, I'd say every company has its own locked flat in a shared building. And I always check if it made sense, instead of assuming."`,
      mistakes: [
        'Using jargon (endpoints, latency, race condition) without explaining it.',
        'Giving too much detail. Non-technical people need the impact and the decision, not the stack trace.',
        'Sounding condescending ("it\'s really simple, you see...").',
        'Follow-up trap: "Explain <a concept from your resume> to me like I\'m from sales — right now." Practise 2-3 live: multi-tenancy (apartment building), webhooks (a doorbell that rings when something happens), RBAC (office keycards by role).',
      ],
      takeaway: 'Impact first, plain words, one analogy, clear options — then check understanding.',
    },
    {
      id: 'unclear-requirements',
      title: 'Handling Unclear Requirements and Ambiguity',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Ask focused questions, write down assumptions, build a small version first, and get feedback early.',
      what: `**"What do you do when requirements are unclear?"** or **"Tell me about a time you worked with ambiguity"** really asks: **"Will you wait, guess silently, or clarify smartly and keep moving?"**

A good approach:
1. **Ask focused questions** — who is the user? What problem? What does "done" look like?
2. **Write down assumptions** — and share them: "I'm assuming X; tell me if that's wrong."
3. **Build the smallest useful version** (an MVP or prototype).
4. **Show it early** and get feedback.
5. **Iterate** based on real feedback.

#### Deeper version
AI products are full of ambiguity, because "good output" is hard to define. On OCTAGNT, "generate a good job description" or "run a good screening call" are not precise requirements. The way through is examples: ask for 2-3 real JDs the recruiters liked, agree on what must always be included, then build, test with real users, and adjust prompts.

A useful phrase: **"strong opinion, loosely held"** — make a reasonable choice so work moves forward, but change it quickly when you learn more.

Also mention **non-functional requirements** people forget: performance, security, multi-tenant data separation, cost (for example LLM API costs).

Adapt: pick a real ambiguous task — a new AI feature, a client request, a vague bug report.`,
      why: `Real product work is rarely fully specified, especially in startups. They want people who can **create clarity** instead of waiting for perfect instructions or building the wrong thing for weeks.`,
      analogy: `It is like a tailor making a suit. A good tailor does not guess your size and sew the whole suit. They take measurements, make a rough fitting, ask you to try it on, then adjust. Early fittings prevent a finished suit that does not fit.`,
      code: [
        {
          title: 'Template + question checklist',
          lang: 'text',
          code: `STAR
 S: "I got <vague request> on <project>."
 T: "I needed to turn it into something we could build."
 A: "I asked <key questions>, wrote down assumptions, built a small version,
     demoed it early, and changed <X> based on feedback."
 R: "<shipped the right thing / avoided rework>."

CLARIFYING QUESTIONS
 - Who uses it, and what problem does it solve?
 - What does "done" look like? Any example?
 - What is in scope for v1, what can wait?
 - Constraints: deadline, performance, security, cost?
 - Who decides when there is a disagreement?`,
        },
      ],
      output: `"On OCTAGNT, the request was basically 'let AI write job descriptions for recruiters'. That's very open — what is a 'good' JD?

So I asked a few focused questions: who would use it, what inputs they'd have (role, skills, experience level), and could they share a few JDs they considered good. I wrote down my assumptions — for example, that the recruiter must always be able to edit before publishing — and shared them with my manager.

Then I built a small version: a simple form, an OpenAI call with a structured prompt, and an editable result. We showed it early, got feedback about tone and missing sections, and adjusted the prompt and form. Because we iterated early, we didn't build the wrong thing, and the final feature cut manual JD writing effort by around 70%.

Adapt: add the real feedback you got and how you measured the effort reduction."`,
      questions: [
        {
          q: 'What if nobody can answer your questions?',
          a: 'Make a reasonable assumption, write it down, share it, and build in a way that is easy to change. Then confirm as soon as someone is available.',
        },
        {
          q: 'How do you avoid building the wrong thing?',
          a: 'Clarify "done" up front, build the smallest useful version, and demo early and often.',
        },
        {
          q: 'How do you define requirements for an AI feature?',
          a: 'Use real examples of good output, list must-haves (sections, tone, safety), test with real inputs, and keep a human review step.',
        },
      ],
      spoken: `"When requirements are unclear, I don't wait and I don't guess silently. I ask a few focused questions — who is the user, what does done look like, do we have examples — then write down my assumptions and share them. On OCTAGNT, the request was just 'AI should write job descriptions'. I asked for sample JDs recruiters liked, built a small editable version with OpenAI, demoed it early, and adjusted from feedback. That's how we avoided rework, and it ended up cutting manual effort by around 70%."`,
      mistakes: [
        'Waiting for perfect requirements before starting anything.',
        'Building for weeks on assumptions nobody confirmed.',
        'Asking 30 questions at once instead of the 4-5 that matter.',
        'Follow-up trap: "What if the stakeholder changes their mind after you built it?" "That is why I build small and demo early — the cost of change stays low. I also note the change and its impact on the timeline."',
      ],
      takeaway: 'Ask focused questions, write assumptions, build small, demo early.',
    },
    {
      id: 'career-gap',
      title: 'What Have You Been Doing Since Your Last Role?',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A short, honest, productive answer about the time since September 2026 — and that you are ready now.',
      what: `Since your role ended in **September 2026** and today is October 2026, interviewers may ask: **"What have you been doing since you left?"** It really asks: **"Are you staying sharp and serious about your career?"**

A short gap is normal and not a problem. Answer in three parts:
1. **Honest status** — "My role ended in September."
2. **What you are doing productively** — interview prep, revising fundamentals, a project, a course, upskilling.
3. **Ready and focused** — "I'm now looking for the right role and can join immediately."

#### Deeper version
The longer a gap gets, the more important it is to show **active, visible progress**: a small side project on GitHub, a write-up of an architecture you built (without company secrets), a course certificate, contributions to open source, or deepening a skill like system design or AI agents.

Be selective: "I want the next role to be the right fit, so I'm being thoughtful" is a strong line — it shows you are choosing, not desperate.

Adapt: say only what you are really doing. If you took a short rest or handled family matters, you can say "I took a couple of weeks to rest and handle some personal things, and since then I've been..." — that is human and fine.`,
      why: `They want to be sure you are not out of practice and that there is no hidden problem. A calm, productive answer removes that doubt in 20 seconds.`,
      analogy: `It is like an athlete between seasons. Nobody worries that they are not playing a match. They want to know the athlete is still training and will be match-fit.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `1. STATUS  : "My role at Haspaces ended in September 2026."
2. ACTIVITY: "Since then I've been <revising fundamentals / system design>,
              <building or improving a project>, <learning X>."   (Adapt: only true items)
3. FOCUS   : "I'm being selective because I want the right next role,
              and I can join immediately."`,
        },
      ],
      output: `"My role at Haspaces ended in September 2026, so it's been only a few weeks. I've used the time well: I've been revising fundamentals and system design, and going deeper into areas I want to grow in, like AI agents and scalable backends. Adapt: add any real project or course — for example, a small project you are building.

I'm being a bit selective because I want the next role to be a good long-term fit, where I can own full-stack features at a larger scale. And I'm ready to join immediately."`,
      questions: [
        {
          q: 'Why haven\'t you found a job yet?',
          a: '"It\'s only been a few weeks since my role ended, and I\'m being selective about the right fit. I\'m in active conversations with a few companies."',
        },
        {
          q: 'Are you working on anything right now?',
          a: 'Give a real, specific answer: a project, a course, open source, or deep revision. Adapt: only true items.',
        },
        {
          q: 'Did you take a break on purpose?',
          a: 'If yes, say it simply and positively: "I took a short break to rest and plan the next step, and I\'m fully ready now."',
        },
      ],
      spoken: `"My role at Haspaces ended in September 2026, so it's been just a few weeks. I've been using the time to revise fundamentals and system design, and to go deeper into areas I want to grow in, like AI agents and scalable backends. I'm being a little selective because I want the next role to be a long-term fit, where I can own full-stack features at a bigger scale. And the good news for you is that I can join immediately."`,
      mistakes: [
        'Sounding defensive or embarrassed. A few weeks between roles is completely normal.',
        'Saying "nothing much" or "just relaxing".',
        'Inventing courses or projects you did not do. They may ask for details or a link.',
        'Follow-up trap: "Show me the project you mentioned." Only mention projects you can open and explain on the spot.',
      ],
      takeaway: 'Short, honest, productive: "role ended in September, here is what I am doing, I can join now."',
    },
    {
      id: 'salary-negotiation',
      title: 'Negotiating the Offer',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Thank them, ask for the full breakup, negotiate politely with reasons, and get the final offer in writing.',
      what: `Negotiation happens **after** they make an offer. The HR person is really asking: **"Will you accept this, or what will it take?"**

Simple rules:
1. **Thank them and show interest** — never react with disappointment.
2. **Ask for the full breakup** — fixed, variable, joining bonus, ESOPs, benefits, notice period, appraisal cycle.
3. **Take a short time to review** — "Can I get back to you by tomorrow?"
4. **Counter with a reason** — market research, your skills, the scope of the role.
5. **Negotiate the whole package** — if fixed pay cannot move, ask about joining bonus, variable, title, or an early review.
6. **Get it in writing** before you accept.

#### Deeper version
**Your position:** you are an **immediate joiner** — a real advantage for the company. You may not have a "current salary hike" argument, so lean on **market value and skills**: payments (Stripe), AI/LLM features in production, Node/TypeScript, and cloud.

**Good phrases:**
- "I'm really excited about this role. Based on my research and the scope we discussed, I was expecting closer to Y LPA. Is there flexibility on the fixed component?"
- "If the fixed pay is at its limit, could we look at a joining bonus or a performance review at 6 months?"

**Be careful with other offers:** only mention a competing offer if it is real. Bluffing can end the conversation.

Know your **walk-away number** before the call (from the salary expectations research). Negotiate once or twice, politely — not five rounds.

Adapt: Y and any other numbers must come from your own research and real offers.`,
      why: `Companies expect reasonable negotiation; most offers have some room. A polite, reasoned request shows professionalism. Aggressive or emotional negotiation, or accepting instantly without reading, can both hurt you.`,
      analogy: `It is like buying a flat. You do not shout at the builder, and you do not sign the first paper they give you. You read the full cost sheet, ask politely for a better deal or extra parking, and sign only when everything is written down.`,
      code: [
        {
          title: 'Negotiation script',
          lang: 'text',
          code: `1. RECEIVE   "Thank you, I'm really excited about this. Could you share the full
              breakup — fixed, variable, bonus, benefits? I'll get back to you by <day>."

2. COUNTER   "I've reviewed it. Based on my market research for this level and the scope
              — full-stack ownership plus payments and AI experience — I was expecting
              closer to Y LPA. Is there flexibility on the fixed component?"

3. ALTERNATE "If fixed is at its limit, could we consider <joining bonus / higher variable /
              early review at 6 months>?"

4. CLOSE     "Thank you, that works for me. Could you send the revised offer letter?
              I can join immediately once it's signed."

PRIVATE: walk-away ____ LPA | target ____ LPA      (Adapt from your research)`,
        },
      ],
      output: `Sample conversation (Adapt: X and Y are placeholders for your real numbers):

HR: "We'd like to offer you X LPA."

Me: "Thank you so much — I'm really excited about the role and the team. Could you share the full breakup — fixed, variable, and any other benefits? I'll come back to you by tomorrow."

(Next day)

Me: "I've gone through it, thank you. Based on my research for full-stack roles at this level, and the experience I bring with Stripe payments and AI features in production, I was expecting closer to Y LPA. Is there some flexibility on the fixed component? If fixed is limited, I'd also be happy to look at a joining bonus or an early performance review."

HR: "We can move the fixed up a bit and add a joining bonus."

Me: "That sounds good, thank you. Please send me the revised offer letter, and I can join immediately after signing."`,
      questions: [
        {
          q: 'Is this offer acceptable to you?',
          a: 'Do not say yes or no instantly. "Thank you — I\'m excited. Can I see the full breakup and get back to you by tomorrow?"',
        },
        {
          q: 'This is our best offer. Will you accept?',
          a: 'If it is above your walk-away number and the role is right, accept gracefully. If not, ask about non-salary items (joining bonus, early review) once, then decide.',
        },
        {
          q: 'Do you have other offers?',
          a: 'Only state real offers. "I\'m in final rounds with a couple of companies, but this role is my preference." Never invent numbers.',
        },
        {
          q: 'What else can be negotiated besides salary?',
          a: 'Joining bonus, variable %, title/level, early salary review, ESOPs, remote/hybrid days, joining date, relocation support.',
        },
      ],
      spoken: `"When I get an offer, I thank them first and ask for the full breakup — fixed, variable and benefits — and take a day to review it. If it's below my researched range, I counter politely with reasons: market data for this level, and the value I bring with payments and AI experience. If the fixed component can't move, I ask about a joining bonus or an early review. I keep it to one or two rounds, never bluff about other offers, and I always get the final offer in writing before accepting."`,
      mistakes: [
        'Accepting on the call without seeing the full breakup.',
        'Showing disappointment or anger ("That\'s too low!"). Stay warm and professional.',
        'Bluffing about another offer. If they say "then take that one", you lose.',
        'Negotiating many rounds over small amounts — it can sour the relationship.',
        'Follow-up trap: "If we match your number, will you join for sure?" Only say yes if you mean it. Going back on a verbal yes damages your reputation.',
      ],
      takeaway: 'Thank, get the breakup, counter once with reasons, negotiate the package, accept in writing.',
    },
    {
      id: 'biggest-technical-failure',
      title: 'Your Biggest Technical Failure or Mistake',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Tell a real mistake you owned, how you fixed it, and the system change you made so it cannot repeat.',
      what: `**"Tell me about your biggest failure"** or **"a mistake you made"** really asks: **"Are you honest, do you take responsibility, and do you learn?"**

Structure (STAR + learning):
1. **What happened** — the mistake, owned clearly ("I did...").
2. **Impact** — honest but proportionate.
3. **How you fixed it** — quickly and calmly.
4. **What you changed** — a process, test, check or habit so it does not repeat.

#### Deeper version
Choose a failure that is **real and meaningful** but **not catastrophic or unethical**. A good size: a bug that reached production, a wrong estimate, a design you had to rework, or a migration issue.

Good candidates from your work (Adapt: pick one that truly happened):
- A **missed edge case** in Stripe webhooks (for example, events arriving twice or out of order) — fixed with idempotency checks.
- A **missing tenant filter** or permission check in a multi-tenant query, caught in review or testing.
- A **dependency that broke** during the Node 16 → 18 migration, found late.
- An **AI feature** that behaved badly with unexpected inputs (empty or weird responses), fixed with validation and fallbacks.
- **Under-estimating** a feature like the voice agent, because real-time latency was harder than expected.

The most important part is the **system change**: a test, a checklist, a code review rule, monitoring, or a staging step. That turns a failure into a strength.`,
      why: `Everyone makes mistakes. Interviewers fear candidates who hide them or blame others. Owning a mistake and showing what you changed signals **integrity**, **maturity** and **growth** — key traits for anyone trusted with production.`,
      analogy: `It is like a pilot reporting a near-miss. In aviation, reporting your own mistake is praised, because the whole industry learns and adds a new checklist item. Hiding it is what makes flying dangerous.`,
      code: [
        {
          title: 'Template',
          lang: 'text',
          code: `MISTAKE  "On <project>, I <specific mistake> — that was on me."
IMPACT   "It caused <honest, proportionate impact>."
FIX      "I <noticed / was alerted>, <communicated>, and <fixed it> within <time>."
CHANGE   "Then I added <test / check / process / monitoring> so it can't repeat."
LEARNING "Since then I always <habit>."`,
        },
        {
          title: 'Example outline: duplicate webhook events (Adapt - use only if true)',
          lang: 'text',
          code: `MISTAKE  I handled a Stripe webhook assuming each event arrives exactly once.
IMPACT   A retried event processed twice -> a duplicate record / wrong state.
FIX      Found it in logs, corrected the affected data, shipped a fix.
CHANGE   Stored processed event IDs and skipped duplicates (idempotency);
         added a test that sends the same event twice.
LEARNING Treat every external event as "may arrive twice or late".`,
        },
      ],
      output: `Sample (Adapt: replace with a mistake that really happened to you; this example is for structure only):

"One mistake I learned a lot from was in the Stripe integration on SkillKeepr. When I first wrote the webhook handler, I assumed each event would arrive exactly once. But Stripe retries events if it doesn't get a quick success response, so occasionally the same event was processed twice, which created a duplicate record. That was my mistake — I hadn't read the retry behaviour carefully enough.

When I spotted it in the logs, I told my lead, corrected the affected data, and shipped a fix: we now store each processed event ID and skip any event we've already handled. I also added a test that sends the same event twice, and I made the handler respond quickly and do heavier work after.

Since then, whenever I integrate an external system — Stripe, Twilio, Zoho — I assume events can arrive twice, late, or out of order, and design for that from day one."`,
      questions: [
        {
          q: 'Tell me about a project that did not go as planned.',
          a: 'Same structure, but focus on planning: a wrong estimate or scope, what you did to recover, and how you estimate now (smaller tasks, buffer for unknowns like third-party APIs).',
        },
        {
          q: 'Have you ever broken production?',
          a: 'Be honest: "Yes." Give a short story with the fix and the prevention step. Saying "never" is not believable after 3 years.',
        },
        {
          q: 'What would you do differently on SkillKeepr or OCTAGNT?',
          a: 'Pick a reasonable improvement: more automated tests earlier, monitoring/alerts from day one, or writing design docs before building. Adapt: choose what you truly believe.',
        },
      ],
      spoken: `**Example story — replace the details with a real situation from your own work before you say this.**

"One mistake I learned a lot from was in our Stripe integration on SkillKeepr. I first wrote the webhook handler assuming each event arrives once, but Stripe retries events, so occasionally one was processed twice. That was on me. When I spotted it, I told my lead, fixed the affected data, and made the handler idempotent by storing processed event IDs. I also added a test that sends the same event twice. Now, with any external system, I design for duplicate, late and out-of-order events from day one."`,
      mistakes: [
        'Choosing a fake failure ("I worked too hard on a project"). It sounds evasive.',
        'Blaming others: "QA missed it", "the requirements were bad".',
        'Choosing something catastrophic or unethical (a data leak you hid, ignoring security).',
        'Telling a real story you cannot explain technically. The interviewer will dig into the details — use a story you truly lived.',
        'Follow-up trap: "How did you make sure no other handlers had the same problem?" Mention checking other webhook/event handlers for the same pattern and adding the rule to your review checklist.',
      ],
      takeaway: 'Own it, fix it fast, change the system — the "what I changed" part is what they remember.',
    },
    {
      id: 'curveball-questions',
      title: 'Tricky HR Curveballs',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Calm, honest, short answers to awkward questions: why not hire you, only one company, other offers, counter-offers.',
      what: `Sometimes HR or managers ask **awkward questions** on purpose. They are testing how you react: **"Do you stay calm, honest and positive when the question is uncomfortable?"**

Common curveballs:
- "Why should we **not** hire you?"
- "You've worked at only one company. Why?"
- "What will you do if you get a better offer after joining?"
- "Your role ended — were you underperforming?"
- "What do you dislike about your job / your last manager?"
- "Are you applying to other companies?"

The method: **pause, stay calm, be honest, keep it short, and turn it positive**.

#### Deeper version
**Only one company (Haspaces, 3+ years):** this is actually good — it shows stability and depth. "I stayed because I kept getting bigger problems: two products, payments, search, AI, a platform migration."

**Why not hire you:** give a real but small gap and how you would close it: "If you need someone with years of experience at very large scale, I'm earlier in that journey — but I've owned systems end to end and I learn fast."

**What you dislike:** talk about a process issue, not people: "I like clear priorities; when they change often, I make trade-offs visible."

**Underperforming?** Answer the actual question honestly and calmly. Do not over-explain.

**Better offer after joining:** "When I accept an offer, I commit. That's why I take time to evaluate before saying yes."`,
      why: `These questions test **composure**, **honesty** and **professionalism** under mild stress. The content matters less than staying calm and not attacking anyone — including yourself.`,
      analogy: `It is like a bouncer in cricket. The bowler wants to see if you panic. A good batter does not swing wildly — they watch the ball, duck or play it safely, and get ready for the next one.`,
      code: [
        {
          title: 'Answer pattern for any curveball',
          lang: 'text',
          code: `1. PAUSE    take a breath; "That's a fair question."
2. HONEST   one true sentence that answers it directly
3. CONTEXT  one sentence of reason or evidence
4. POSITIVE one sentence that turns to what you offer / the future
(keep it under 30 seconds; do not over-defend)`,
        },
        {
          title: 'Quick lines',
          lang: 'text',
          code: `ONE COMPANY     "3+ years at Haspaces gave me depth: two products, payments, search,
                 AI, a Node migration. Now I want a new scale."
WHY NOT HIRE    "If you need deep experience at very large scale, I'm earlier there -
                 but I've owned systems end to end and I learn fast."
DISLIKE         "Unclear priorities. When it happens I make trade-offs visible."
BETTER OFFER    "Once I accept, I commit. That's why I evaluate carefully before."
OTHER COMPANIES "Yes, a few in SaaS and AI, but this role is high on my list because ..."`,
        },
      ],
      output: `Sample — "You have worked at only one company. Isn't that limiting?"

"That's a fair question. I was at Haspaces from June 2023 to September 2026, and I stayed because the problems kept getting bigger. I worked on two very different products — a multi-tenant HR SaaS with Stripe billing and a Boolean search engine, and an agentic AI platform with a voice interview agent. I also led a Node migration and handled production issues. So it felt like several jobs in one place.

Now I want to apply that at a larger scale, with a new team and new problems, which is exactly why I'm here."

Sample — "Why should we not hire you?"

"If you need someone who has already run systems at very large scale for many years, I'm earlier in that journey. But I've owned real production systems end to end — payments, search, AI — and I learn quickly; I picked up a whole voice-AI stack for OCTAGNT. So I'd close that gap fast."`,
      questions: [
        {
          q: 'What do you dislike about your previous job?',
          a: 'Pick a process, not a person, and show how you handled it: "Priorities sometimes changed quickly; I learned to make trade-offs visible early."',
        },
        {
          q: 'What will you do if you get a better offer after accepting ours?',
          a: '"When I accept an offer, I commit. That\'s why I take time to evaluate carefully before I say yes."',
        },
        {
          q: 'Why should we not hire you?',
          a: 'A small, real gap + how you are closing it. Never say "there is no reason".',
        },
        {
          q: 'Rate yourself out of 10 in JavaScript / React.',
          a: 'Be confident but humble: "Around 7 or 8 — strong in daily production work, and there are always deeper parts of the language and browser I keep learning." Then back it with an example.',
        },
      ],
      spoken: `"With tricky questions, I pause, answer honestly, and keep it short. For example, if someone asks why I've worked at only one company — I was at Haspaces for over three years because the problems kept growing: two different products, Stripe payments, a search engine, AI features and a Node migration. It felt like several roles in one. And if someone asks why they shouldn't hire me, I'd say I'm earlier in working at very large scale, but I've owned production systems end to end and I learn quickly."`,
      mistakes: [
        'Getting defensive or visibly annoyed. Calm is the whole point.',
        'Saying "There is no reason not to hire me." It sounds arrogant and dodges the question.',
        'Criticising a former manager or colleague when asked what you dislike.',
        'Over-explaining. Long, nervous answers make a small question look like a big problem.',
        'Follow-up trap: "Rate yourself 10/10?" Avoid 10 — it invites very hard questions. 7-8 with proof sounds confident and honest.',
      ],
      takeaway: 'Pause, one honest sentence, one reason, one positive turn — under 30 seconds.',
    },
  ],
  rapidFire: [
    { q: 'Ideal length of "Tell me about yourself"?', a: '60-90 seconds: Present → Past → Future, ending with why this role.' },
    { q: 'Best structure for behavioral questions?', a: 'STAR: Situation, Task, Action, Result — plus one line of Learning.' },
    { q: 'Which STAR part should be longest?', a: 'Action — about 60% of the answer, told with "I", not "we".' },
    { q: 'My notice period?', a: 'None — my Haspaces role ended in September 2026, so I can join immediately (within a week of the offer).' },
    { q: 'Why did you leave? (one line)', a: 'One honest neutral sentence, one line of gratitude, then talk about what you want next. Never blame the employer.' },
    { q: 'Three framings for leaving?', a: 'Growth/scale, project or contract ended, or relocation — use only the one that is true.' },
    { q: 'What is CTC?', a: 'Cost to Company: total yearly cost including fixed, variable and benefits, usually in LPA.' },
    { q: 'Range or single number for salary?', a: 'A researched range, starting around your target — never your walk-away number.' },
    { q: 'Where to research salary in India?', a: 'Glassdoor, AmbitionBox, levels.fyi (bigger tech), the job post, friends and recruiters — same city, level and company type.' },
    { q: 'First thing to say when you get an offer?', a: 'Thank them, show interest, and ask for the full breakup before deciding.' },
    { q: 'Can I bluff about another offer?', a: 'No. Only mention real offers — a bluff can end the negotiation.' },
    { q: 'What to negotiate if fixed pay cannot move?', a: 'Joining bonus, variable, title/level, early salary review, ESOPs, work mode.' },
    { q: 'A good weakness?', a: 'Real but fixable, not core to the job — plus what you are doing about it.' },
    { q: 'Worst weakness answer?', a: '"I\'m a perfectionist" or "I work too hard" — interviewers hear it daily.' },
    { q: 'Strength formula?', a: 'Claim + proof + result, e.g. ownership → led the Node 16 → 18 migration.' },
    { q: '"Why should we hire you?" formula?', a: 'Their top 2-3 needs → your proof for each → "and I can join immediately".' },
    { q: '"Why this company?" needs what?', a: 'One real product detail, one role detail, and how your experience fits — from 15-20 minutes of research.' },
    { q: '5-year answer in one line?', a: 'Senior engineer → tech lead or deep specialist, growing inside this company, with proof you have started.' },
    { q: 'Production incident order?', a: 'Communicate, assess impact, mitigate (rollback/flag), root cause, fix, verify, prevent.' },
    { q: 'My production story headline?', a: 'Fixed critical production issues on SkillKeepr within 24 hours, then added guards so they did not repeat.' },
    { q: 'What is a blameless post-mortem?', a: 'An incident write-up that focuses on fixing the system, not blaming a person.' },
    { q: 'Tight deadline rule?', a: 'Cut scope, not quality — and raise the risk early with options.' },
    { q: 'Conflict with a teammate — first step?', a: 'Talk privately and listen first; most conflicts are different worries.' },
    { q: 'Disagreeing with a senior?', a: 'Ask for context, disagree privately with data and options, then commit to the decision.' },
    { q: 'What is "disagree and commit"?', a: 'Share your view honestly, then fully support the team decision once it is made.' },
    { q: 'Best "learn fast" story?', a: 'The OCTAGNT AI voice agent: Twilio, Google STT/TTS and Grok Voice were new; docs → tiny prototype → microservice on GCP.' },
    { q: 'How to talk about AI coding tools?', a: 'They speed up exploring and boilerplate; I review, run and test every line, and never paste secrets.' },
    { q: 'Ownership stories?', a: 'Led the Node 16 → 18 migration; created SkillKeepr architecture diagrams and docs.' },
    { q: 'Mentoring in one line?', a: 'Teach the why, ask what they tried before giving hints, and scale it with docs.' },
    { q: 'Explaining tech to non-tech people?', a: 'Impact first, plain words, one analogy, clear options, then check understanding.' },
    { q: 'Unclear requirements?', a: 'Ask focused questions, write down assumptions, build small, demo early.' },
    { q: '"What have you done since September?"', a: 'Short and true: what you are learning or building, being selective, ready to join now.' },
    { q: 'Biggest failure — key part?', a: 'The system change you made afterwards (test, check, process) so it cannot repeat.' },
    { q: 'Ever broken production?', a: 'Say yes honestly, with the fix and the prevention — "never" is not believable.' },
    { q: 'Only one company — weakness?', a: 'No: 3+ years gave depth — two products, payments, search, AI, a migration.' },
    { q: 'Rate yourself out of 10?', a: '7-8 with proof. A 10 invites the hardest questions.' },
    { q: 'How many questions to ask the interviewer?', a: '2-3, matched to their role. "No questions" sounds like low interest.' },
    { q: 'Best closing question?', a: '"Is there anything in my background that makes you unsure about my fit?"' },
    { q: 'Never say in HR rounds?', a: 'Anything negative about a past employer, invented numbers, or fake offers.' },
    { q: 'What does "Adapt:" mean in this guide?', a: 'Fill in that detail from your real memory — never invent facts or numbers.' },
  ],
};
