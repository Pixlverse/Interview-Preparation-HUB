// My Resume & Projects — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.
// Source of truth: Adarsh's resume. Numbers that are not on the resume are NOT invented here.
// Wherever a detail is unknown, an "Adapt:" note tells you what to fill in from your own memory.

export default {
  id: 'resume',
  title: 'My Resume & Projects',
  icon: '💼',
  description: 'Questions interviewers ask about my own work at Haspaces — OCTAGNT and SkillKeepr — with first-person sample answers, simplified code, and "Adapt:" notes to fill in from memory.',
  definitionTitle: 'What is this section?',
  definition: `This section prepares you for **questions about your own work** — your resume, **OCTAGNT** and **SkillKeepr**. Interviewers use these questions to check that you **really built** what you claim, that you understand **why** you made each decision, and that you can explain trade-offs, problems you solved, scale and security.

Every answer is written in **first person** so you can practise saying it out loud. Look for **"Adapt:"** notes and fill them in with your real details. Never invent numbers.

**One-line answer:** "These are deep-dive questions on my real projects — what I built, how it works, why I chose each approach, what went wrong, and what I'd improve."`,
  topics: [
    {
      id: 'walk-through-resume',
      title: 'Walk Me Through Your Resume',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A 60-90 second story: who I am, where I worked, the two products I built (SkillKeepr and OCTAGNT), and what I want next.',
      what: `This is usually the **first question** in any interview. The interviewer wants a short, clear story of your career, not a reading of every line on the page.

A good answer has four parts:
1. **Who I am**: one line, "Full Stack Engineer, 3+ years, React, Node.js/TypeScript, plus Python services more recently."
2. **Where I worked**: Haspaces, Thiruvananthapuram, from June 2023 to September 2026.
3. **What I built**: two products.
   - **SkillKeepr**: a multi-tenant HR & recruitment SaaS. TypeScript services on **AWS Lambda** (Serverless Framework), **one MongoDB database per company**, React + Redux-Saga + Mantine front-ends.
   - **OCTAGNT**: an AI candidate-shortlisting platform. A **Python FastAPI + PostgreSQL** backend, a scoring engine, an **AI voice interview microservice** (Twilio + Google Speech-to-Text + Claude + Google Text-to-Speech), and a React + Vite UI.
4. **What I want next**: the kind of role you want, and why this company fits.

#### Deeper version
The interviewer is also checking **communication**: can you summarise, choose the important parts, and leave "hooks" they can ask about? Each hook (multi-tenancy, Stripe billing, Boolean search, live interviews, the voice agent) is a door to a topic you have prepared, so you are **steering the interview** toward your strengths.

**Resume note:** say only what the code supports. In the OCTAGNT code the LLM is **Anthropic Claude**, and voice runs on **Twilio + Google STT/TTS**; there is no OpenAI or xAI Grok in it. If your resume says OpenAI or Grok, be ready to explain where that was used, or update the resume so it matches what you can defend.

Keep it to about 60-90 seconds and end with a clear handover line.`,
      why: `First impressions matter. A clear walkthrough shows you understand your own work at a high level and sets the agenda for the rest of the interview. A rambling answer makes the interviewer pick topics at random, often ones you prepared less.`,
      analogy: `It is like a movie trailer. It does not show the whole film, only the best scenes, so the audience wants to watch more. Your walkthrough shows the best "scenes" of your career, so the interviewer asks about exactly those.`,
      code: [
        {
          title: 'Answer skeleton (fill and practise out loud)',
          lang: 'text',
          code: `1. Intro (10s)
   "I'm Adarsh, a Full Stack Engineer with 3+ years in React, Node.js/TypeScript,
    and more recently Python (FastAPI) services."

2. Company (10s)
   "I worked at Haspaces in Thiruvananthapuram from June 2023 to September 2026."

3. Product 1 - SkillKeepr (25s)
   multi-tenant HR SaaS on AWS Lambda | one MongoDB database per company
   role/permission system | Stripe subscriptions + add-on marketplace
   Boolean candidate search | live video interviews (Jitsi) + WebSocket notifications

4. Product 2 - OCTAGNT (20s)
   AI shortlisting platform (FastAPI + Postgres) | AI voice interview microservice
   (Twilio -> Google STT -> Claude -> Google TTS) | Zoho CRM lead-to-workspace automation
   Docker -> ECR -> ECS deploys

5. Close (10s)
   "Now I want to own full-stack features end to end, especially around SaaS and AI."`,
        },
      ],
      output: `If you follow the skeleton, you speak for about 75 seconds. The interviewer now has clear hooks: multi-tenancy, permissions, Stripe, Boolean search, live interviews and the voice agent. Most will pick one of these next, and each has its own deep-dive topic in this guide.`,
      questions: [
        {
          q: 'Walk me through your resume.',
          a: `Use the four-part skeleton: who I am, Haspaces (June 2023 – September 2026), the two products with 2-3 highlights each, and what I want next. Keep it under 90 seconds.`,
        },
        {
          q: 'Tell me about yourself.',
          a: `Same structure, with one human line at the start, such as finishing a BSc in Computer Science in 2022 and moving straight into full-stack work.`,
        },
        {
          q: 'Why are you looking for a change?',
          a: `Keep it positive and forward-looking: "I've grown a lot building SaaS and AI features end to end; now I want bigger scale / a product with X." Adapt: give your real reason, never criticise your old company.`,
        },
        {
          q: 'Which of your projects are you most proud of?',
          a: `Pick one and give a reason, for example the AI voice interview agent: a real-time system where speech-to-text, the LLM and text-to-speech all had to stream to keep the conversation natural.`,
        },
      ],
      spoken: `"I'm Adarsh, a Full Stack Engineer with over three years of experience in React, Node.js with TypeScript, and more recently Python services. From June 2023 to September 2026 I worked at Haspaces on two products. SkillKeepr is a multi-tenant HR and recruitment SaaS running on AWS Lambda, with a separate MongoDB database per company, Stripe subscriptions, Boolean candidate search and live video interviews. OCTAGNT is an AI shortlisting platform with a FastAPI and Postgres backend and an AI voice interview service built on Twilio, Google speech and Claude. Now I want to own full-stack features at a bigger scale."`,
      mistakes: [
        `Reading the resume line by line. The interviewer already has it; give the story and the highlights.`,
        `Going over two minutes. Long answers lose attention and leave less time for the topics you prepared.`,
        `Naming a tool you cannot defend. If you say "OpenAI" or "Grok" but the system you describe uses Claude and Google speech, a technical follow-up will expose the mismatch.`,
        `Follow-up trap: "You said ~70% less manual effort, how did you measure that?" Have an honest answer ready, or drop the number. Never say a figure you cannot explain.`,
      ],
      takeaway: 'A 75-second trailer of your career with clear, defensible hooks; you choose the next questions.',
    },
    {
      id: 'octagnt-60-seconds',
      title: 'OCTAGNT in 60 Seconds',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'OCTAGNT is an AI candidate-shortlisting platform: it analyses the job, scores every resume through a step-by-step pipeline, and phones candidates with an AI voice screener.',
      what: `**OCTAGNT** is an **AI candidate shortlisting platform** for recruiters. A recruiter creates a job, uploads resumes, and the platform tells them who to shortlist and why.

The main parts:
- **Job analysis with Claude** (Anthropic): pulls out skills, checks how clear the job description is, and suggests probe questions the recruiter can approve.
- **A scoring pipeline**: every resume goes through ordered steps (parse the resume, trust checks, scoring on several dimensions) and ends with a score and a tier (shortlist, hold, reject).
- **An AI voice interviewer**: a separate service that phones the candidate (Twilio), listens (Google Speech-to-Text), thinks (Claude), speaks (Google Text-to-Speech), and sends back a scored transcript.
- **Zoho CRM**: new free-plan leads from Zoho get their own workspace automatically.
- **Stripe** billing with credits per plan.

Tech: **Python FastAPI** services with **PostgreSQL**, a **React + Vite + TypeScript** UI, deployed on **AWS** (Docker images on ECS).

#### Deeper version
Think of it as a funnel: job created → job analysed → resumes uploaded to S3 → queued on SQS → pipeline scores each candidate → strong or unclear candidates get an AI phone screen → the voice result is merged back into the score → recruiter sees a ranked queue with reasons.

The backend is split into an **API** (users, jobs, candidates, billing, database), a stateless **scoring engine** (all the scoring logic, no database), and a **voice service** (phone calls). They talk over internal HTTP with a service token.

Adapt: say which parts you personally owned (for example the voice service and the Zoho integration) and which you supported.`,
      why: `Interviewers ask this to check you understand the **product**, not just your tickets. Start with the business problem: recruiters spend hours reading resumes and making first-round calls. OCTAGNT does that first pass for them, consistently, at any hour.`,
      analogy: `OCTAGNT is like a tireless junior recruiter: it reads the job brief, reads every CV against it, rings the promising people for a quick chat, and hands the senior recruiter a ranked list with notes.`,
      code: [
        {
          title: 'The product flow in one picture',
          lang: 'text',
          code: `Recruiter creates job
      |
      v
[ Job analysis ]  -- Claude -->  skills, clarity, probe questions (recruiter approves)
      |
      v
Resumes uploaded (S3)  -->  SQS queue  -->  pipeline workers
      |
      v
[ Scoring engine ]  parse -> trust checks -> dimension scores -> tier
      |
      v
[ AI voice screen ]  Twilio call -> STT -> Claude -> TTS   (separate service)
      |
      v
Voice result merged into score  -->  recruiter's ranked queue

Business side: Zoho lead (free plan) --> workspace auto-provisioned`,
        },
      ],
      output: `Use the diagram as your map. Start with the recruiter, walk down the funnel, and name your part at each box. If the interviewer stops you at a box (voice, scoring, Zoho), jump to that deep-dive topic.`,
      questions: [
        {
          q: 'What is OCTAGNT, in simple words?',
          a: `An AI platform that helps recruiters shortlist faster: it analyses the job, scores every resume step by step, and does a first-round AI phone screen, then gives a ranked list with reasons.`,
        },
        {
          q: 'What does "agentic" mean here?',
          a: `The system carries out a multi-step task on its own, like running a whole screening call and deciding what to ask next, instead of answering one prompt and stopping.`,
        },
        {
          q: 'What stack was it built on?',
          a: `Python FastAPI services with PostgreSQL, a React + Vite + TypeScript frontend, Anthropic Claude for the AI parts, Twilio and Google speech for voice, all deployed on AWS ECS with Docker.`,
        },
        {
          q: 'What was your biggest contribution?',
          a: `Adapt: name what you owned most, for example the voice interview service or the Zoho provisioning flow, and who you worked with.`,
        },
      ],
      spoken: `"OCTAGNT is an AI platform that helps recruiters shortlist candidates. A recruiter creates a job, and we use Claude to analyse it: the key skills, how clear it is, and probe questions they can approve. Resumes go through a step-by-step scoring pipeline that gives each candidate a score and a tier. For promising candidates, our AI voice service phones them, runs a short screening conversation and sends back a scored transcript. New clients from Zoho get a workspace automatically. It's Python FastAPI and PostgreSQL on AWS, with a React frontend."`,
      mistakes: [
        `Listing technologies without the business problem. Start with "recruiters spend hours on first-pass screening".`,
        `Calling it "just a ChatGPT wrapper". Show the engineering: a scoring pipeline, real-time phone audio, integrations and provisioning.`,
        `Naming the wrong tools. The code uses Claude (Anthropic), Python FastAPI and AWS ECS. Make sure your resume and answer say the same thing.`,
        `Follow-up trap: "Why is voice a separate service?" Because it holds long-lived WebSocket connections with real-time audio and scales differently from normal API requests.`,
      ],
      takeaway: 'OCTAGNT = analyse the job, score every resume, AI phone screen, ranked shortlist — Python FastAPI on AWS with Claude.',
    },
    {
      id: 'skillkeepr-60-seconds',
      title: 'SkillKeepr in 60 Seconds',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'SkillKeepr is a multi-tenant HR & recruitment SaaS on AWS Lambda — a database per company, role-based access, Stripe billing with add-ons, Boolean search and live Jitsi interviews.',
      what: `**SkillKeepr** is an **HR & Recruitment SaaS** (Software as a Service — companies pay a subscription and use it in the browser).

It is **multi-tenant**: many client companies (tenants) use the same product, but **each company gets its own MongoDB database**, so one company can never see another's data.

How it is built:
- **Backend:** TypeScript services running as **AWS Lambda functions** behind **API Gateway**, deployed with the **Serverless Framework**. There is an admin/recruiter service, a talent (candidate) service, and a **cloud-admin** service for the people who run the platform. Shared code lives in a shared **core** library used by every service.
- **Frontend:** **React 18 + Redux + Redux-Saga + Mantine**, with separate apps for admins/recruiters, talent and cloud admin, sharing a core UI library.

What I worked on:
- **Role-based access control** across the modules (Admin, Recruiter Admin, Recruiter, Collaborator, and the Talent side).
- **Stripe subscription billing** and a **marketplace of add-ons** (extra seats, storage, interview and resume-parsing credits) with **plan-based limits**.
- A **Boolean candidate search** (AND / OR / NOT, quotes, brackets) on MongoDB.
- **Live video interviews** with **Jitsi**, plus **WebSocket** features like a shared live code editor and notifications.
- Upgrades, production fixes, and architecture docs.

#### Deeper version
A request flows like this: the browser calls API Gateway → a Lambda function runs the controller → a service holds the business rules → a repository talks to **that company's** database. Heavy work runs in the background: **SQS FIFO queues** for resume parsing and AI scoring, **Step Functions** for scheduled reminder emails, and **AWS Batch** for long CRM syncs.

Adapt: say which of these pieces you personally built versus extended, and add one line on who the customers were (size, industry).`,
      why: `This is usually the bigger product on your resume, so most deep questions start here. A clear 60-second picture — serverless backend, one database per tenant, roles, billing, search, interviews — shows you understand the whole system, not just one screen.`,
      analogy: `SkillKeepr is like a block of serviced offices. Every company gets its **own locked office** (its own database). Keycards decide which rooms each person can open (roles and permissions). The rent plan decides how many desks and meeting rooms you get, and you can buy extras from the front desk (the add-on marketplace).`,
      code: [
        {
          title: 'The product in one picture (simplified)',
          lang: 'text',
          code: `  acme.admin.app.com   globex.admin.app.com      (one subdomain per company)
          |                     |
          v                     v
   React apps (admin / talent / cloud-admin)  ── cookies + x-tenant-id header
          |
     API Gateway (REST + WebSocket)
          |
   Lambda functions:  admin service | talent service | cloud-admin service
          |                     |
   [ Acme's MongoDB ]    [ Globex's MongoDB ]      (one database per company)

   Background: SQS FIFO (parsing, AI scoring) · Step Functions (reminders) · AWS Batch (CRM sync)
   Billing: Stripe subscriptions + add-ons     Video: Jitsi (JaaS)     Files: S3`,
        },
      ],
      output: `Walk through the picture top to bottom: **subdomain** tells us the company → **API Gateway + Lambda** run the code → the request reaches **that company's own database**. Then name the side systems: queues, billing, video and file storage.`,
      questions: [
        {
          q: 'What is SkillKeepr?',
          a: `A multi-tenant HR and recruitment SaaS. Companies subscribe to a plan and get recruiting, talent and admin features, with role-based access, Stripe billing with add-ons, Boolean candidate search, and live video interviews.`,
        },
        {
          q: 'How is it deployed?',
          a: `Serverless: TypeScript Lambda functions behind API Gateway, deployed with the Serverless Framework. React apps are built and served from S3 behind CloudFront.`,
        },
        {
          q: `How do you keep one company's data away from another?`,
          a: `Each company has its own MongoDB database. The company is found from the subdomain, and every request connects to that company's database only. The login token also carries the company id and must match.`,
        },
        {
          q: 'What was the hardest feature?',
          a: `Pick the one you know best: Stripe billing (keeping our plan records in sync with Stripe across payments, renewals and failures) or the Boolean search (turning a user query into a MongoDB query that stays fast).`,
        },
      ],
      spoken: `"SkillKeepr is a multi-tenant HR and recruitment SaaS. The backend is TypeScript on AWS Lambda behind API Gateway, deployed with the Serverless Framework, and every client company gets its own MongoDB database, chosen from the company's subdomain on each request. The frontend is React with Redux-Saga and Mantine. I worked on role-based access across the recruiter and admin modules, Stripe subscription billing with an add-on marketplace and plan limits, a Boolean candidate search on MongoDB, and live Jitsi video interviews with WebSocket features like a shared code editor."`,
      mistakes: [
        `Saying "every document has a tenantId". In SkillKeepr isolation is a **separate database per company**, not a filter on a shared collection.`,
        `Calling the backend "Express" or "Hapi". The services are **Lambda handlers** deployed with the Serverless Framework.`,
        `Mixing up roles and plan limits. Roles = what a **user** may do. Plan limits = what the **company** has paid for. Both are checked.`,
        `Follow-up trap: "Why serverless for this?" No servers to manage, scales per request, and you pay per use — but you must handle cold starts and reuse database connections between calls.`,
      ],
      takeaway: 'SkillKeepr = serverless TypeScript on Lambda, one MongoDB per company, role and plan checks on every request, plus billing, search and live interviews.',
    },
    {
      id: 'role-ownership',
      title: 'What Was Your Role and Ownership?',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Say clearly which parts you personally designed and built, which you contributed to, and how you worked with the team, without claiming the whole system.',
      what: `Interviewers ask this to separate **"I built it"** from **"my team built it"**. Be specific: name the features you owned end to end, the ones you contributed to, and the ones you only used.

A clear way to structure it:
- **Owned** (I designed and built it): Adapt: e.g. the Stripe subscription + add-on checkout flow, the Boolean search parser, the live interview join flow, the voice-call pipeline pieces you wrote.
- **Contributed** (I built parts or fixed and extended it): Adapt: e.g. permission checks, Zoho sync, CI pipelines.
- **Used / integrated** (built by others, I called it): e.g. the external resume-parsing and AI scoring services that SkillKeepr calls over HTTP.

#### Deeper version
It helps to know how the systems were split, because ownership usually follows those lines:
- **SkillKeepr** has separate services for the HR/recruiter side, the candidate side and a super-admin "cloud admin" side, each deployed as AWS Lambda functions, plus shared code (a core service library and a core UI library) used by all of them.
- **OCTAGNT** has an API service (FastAPI + Postgres), a stateless scoring engine, a voice service and a React UI, deployed as containers on AWS ECS.

So a precise answer sounds like: "On SkillKeepr I owned billing in the HR service and the matching super-admin screens; on OCTAGNT I worked mostly on the API and the voice service." Adapt: replace with what you really owned.

Ownership also includes **non-code work**: reviewing PRs, writing docs and diagrams, handling production issues, and talking to product about trade-offs.`,
      why: `Most systems are team efforts. Interviewers trust candidates who are honest about scope and can still go deep on their part. Claiming everything sounds unbelievable and invites hard questions about parts you did not touch.`,
      analogy: `It is like a group cooking competition. "Our team won" is nice, but the judge wants to know: did you make the sauce, chop the vegetables, or just plate it? Saying "I made the sauce, and here is my recipe" is far more convincing.`,
      code: [
        {
          title: 'Ownership map to fill in (practise out loud)',
          lang: 'text',
          code: `SkillKeepr (TypeScript on AWS Lambda, MongoDB per tenant, React + Redux-Saga + Mantine)
  Owned:        ______________________  (e.g. Stripe checkout + add-ons, Boolean search)
  Contributed:  ______________________  (e.g. permission decorators, interview join flow)
  Integrated:   external AI scoring / resume parsing services, Zoho CRM, 8x8 Jitsi

OCTAGNT (FastAPI + Postgres, voice microservice, React + Vite)
  Owned:        ______________________  (e.g. parts of the voice call pipeline)
  Contributed:  ______________________  (e.g. Zoho lead intake, CI pipelines)
  Integrated:   Twilio, Google Speech-to-Text / Text-to-Speech, Anthropic Claude

Non-code: PR reviews | architecture docs | production fixes | mentoring`,
        },
      ],
      output: `Filled in, this gives a 45-second answer that names your own work precisely. The interviewer can then pick any "owned" item for a deep dive, and you will be on home ground.`,
      questions: [
        {
          q: 'Which part of the system did you personally build?',
          a: `Name 2-3 features you owned end to end and one sentence on how each works. Adapt: use your real list from the map above.`,
        },
        {
          q: 'How big was the team and how was work split?',
          a: `Adapt: give the real team size and split. Explain that the split followed the service boundaries (HR service, candidate service, super-admin service, shared core; or API, engine, voice, UI).`,
        },
        {
          q: `Did you design it or implement someone else's design?`,
          a: `Be honest. "I designed the add-on checkout flow myself; the overall service split was already in place when I joined." Partial design ownership is still good.`,
        },
        {
          q: 'What did you do beyond writing code?',
          a: `PR reviews, architecture diagrams and docs, fixing production issues, and helping teammates. Adapt: give one concrete example.`,
        },
      ],
      spoken: `"I worked across both products, but I'll be precise about what was mine. On SkillKeepr, which runs as TypeScript Lambda services with a MongoDB database per company, I owned features like (Adapt: e.g. the Stripe add-on checkout and the Boolean search), and contributed to the permission system and interview flows. On OCTAGNT, a FastAPI and Postgres platform with a separate voice service, I worked mainly on (Adapt: your parts). Beyond code, I reviewed pull requests, wrote architecture docs and handled production issues."`,
      mistakes: [
        `Saying "I built the whole platform." Nobody believes it, and every follow-up on a part you did not build hurts you.`,
        `Being so modest that you never say "I". Use "I" for your work and "we" for team work.`,
        `Describing a technology you never touched. If the voice service used Google speech and Claude, do not describe a different stack.`,
        `Follow-up trap: "What would have broken if you left?" Name the areas where you were the main person who understood the code.`,
      ],
      takeaway: 'Owned, contributed, integrated: three honest buckets that make every claim defensible.',
    },
    {
      id: 'most-challenging-project',
      title: 'Tell Me About Your Most Challenging Project',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Use STAR: the AI voice interview agent is a strong pick, because it was real-time, streaming and full of edge cases (latency, interruptions, voicemail, silence).',
      what: `Use the **STAR** format: **Situation, Task, Action, Result**. Pick a project with real technical difficulty and where you did meaningful work.

A strong pick is the **OCTAGNT AI voice interview agent**:
- **Situation**: recruiters could not personally phone every candidate for a first screening.
- **Task**: build a phone agent that calls the candidate, asks the screening questions, listens, follows up naturally and sends back a scored result.
- **Action**: a separate voice service. Twilio places the call and streams live audio over a WebSocket; Google Speech-to-Text transcribes it in streaming mode; voice-activity detection decides when the candidate has finished; Claude writes the next reply, streamed sentence by sentence; Google Text-to-Speech speaks each sentence; the reply plays back while the next sentence is still being generated. After the call, the recording goes to S3, Claude analyses the transcript, and a webhook sends the result to the main API.
- **Result**: Adapt: real outcomes (calls per day, recruiter time saved, candidate feedback). Do not invent numbers.

#### Deeper version
What made it hard (good things to say):
- **Latency**: every stage adds delay, so everything streams, and the first audio is sent at the first natural pause in the reply, not after the whole answer.
- **Turn-taking**: the system must wait long enough for the candidate to finish, but not so long that it feels slow. The wait adapts to how the candidate is speaking.
- **Interruptions (barge-in)**: if the candidate talks over the agent, the agent stops, clears queued audio and listens.
- **Messy reality**: voicemail and answering machines, long silences, wrong person answering, the candidate wanting to hang up.
- **Reliability**: the result webhook retries, and a watchdog catches calls that never connected.

Alternative pick: SkillKeepr's **Stripe subscriptions and add-on marketplace**, where the challenge was keeping Stripe and the database in sync across purchases, renewals, add-ons and failed payments.`,
      why: `This question tests problem solving, ownership and how you handle complexity. A STAR answer with concrete technical details proves you did the work and understood the trade-offs.`,
      analogy: `It is like a live translator on a phone call. They must listen, understand, answer and speak without long pauses, stop when the other person interrupts, and cope when the line is bad or a machine answers. Doing all that smoothly is the real challenge.`,
      code: [
        {
          title: 'STAR notes to practise',
          lang: 'text',
          code: `S: Recruiters can't phone every applicant for first-round screening.
T: Build an AI phone screener that asks the job's questions and returns a scored summary.
A: Twilio call + WebSocket audio stream
   -> streaming speech-to-text + voice-activity detection (when did they stop?)
   -> LLM reply streamed sentence by sentence
   -> text-to-speech per sentence, played while the next is generated
   -> barge-in, silence timeouts, voicemail detection
   -> after call: recording to S3, transcript analysis, webhook with retries to the API
R: Adapt: real outcome (volume, time saved, feedback). No invented numbers.`,
        },
      ],
      output: `This answer takes about two minutes. It shows a clear problem, the hard parts, the decisions you made and the result, and it invites follow-ups on latency, interruptions and reliability, which are covered in the voice agent topic.`,
      questions: [
        {
          q: 'What was the hardest technical problem in it?',
          a: `Keeping the conversation natural: low latency through streaming at every stage, and correct turn-taking so the agent neither interrupts the candidate nor leaves long silences.`,
        },
        {
          q: 'What would you do differently?',
          a: `Build an end-to-end test harness with recorded calls earlier, and add better metrics for latency per stage from day one.`,
        },
        {
          q: 'How did you test something that depends on phone calls?',
          a: `Unit tests for the pure logic (turn detection timing, prompt building, scoring, webhook sending), local S3 emulation for storage, and real test calls through a script for the full path.`,
        },
        {
          q: 'What was your personal contribution?',
          a: `Adapt: name the exact pieces you built (e.g. the streaming reply pipeline, barge-in, or the post-call webhook).`,
        },
      ],
      spoken: `"My most challenging project was the AI voice interview agent in OCTAGNT. Recruiters couldn't call every candidate, so we built a phone screener. Twilio places the call and streams the audio to our service, Google speech-to-text transcribes it live, and Claude writes each reply, which we stream sentence by sentence into text-to-speech so the candidate hears the start quickly. The hard parts were latency, knowing when the candidate had really finished speaking, handling interruptions, and edge cases like voicemail and silence. After the call we analyse the transcript and send the result to the main platform."`,
      mistakes: [
        `Choosing a project that was hard only because of deadlines or people. Pick a technical challenge.`,
        `Skipping the Result. Always end with an outcome, even a qualitative one.`,
        `Saying "we" for everything. Make your own actions clear.`,
        `Follow-up trap: "Why not just use a ready-made voice AI platform?" Talk about control over the question flow, cost per call, and owning the scoring; but admit that a managed platform is faster to start with.`,
      ],
      takeaway: 'Use STAR on a genuinely hard, real-time system and be precise about the hard parts and your role.',
    },
    {
      id: 'handling-code-reviews',
      title: 'How Do You Handle Code Reviews?',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Small PRs, a clear checklist (correctness, security, tenant safety, tests), kind and specific comments, and no ego when receiving feedback.',
      what: `A **code review** is when another engineer reads your change (a pull request, or PR) before it is merged. The goal is to catch bugs, share knowledge and keep the code consistent.

Code reviews are on your resume. Talk about both sides:
- **When I review**: I check that it works, is safe, is tested, and is easy to read. I write kind, specific comments and explain *why*.
- **When I am reviewed**: I keep PRs small, write a clear description, and treat comments as help, not attack.

#### Deeper version
A useful review order:
1. **Understand the goal** — read the ticket and the PR description first.
2. **Correctness** — edge cases, error handling, async mistakes (missing \`await\`).
3. **Security** — auth checks, input validation, secrets in code.
4. **Multi-tenant safety** (very important in SkillKeepr) — is every query scoped by \`tenantId\`? Is there an RBAC check?
5. **Tests** — is the new logic covered?
6. **Readability** — naming, small functions. Style nitpicks go last and are marked as "nit".

When AI tools wrote some of the code (Claude Code, Copilot), I review it with the same checklist — the author is still responsible.`,
      why: `Code reviews prevent bugs reaching production and spread knowledge across the team. Interviewers ask because it shows how you collaborate and how you handle disagreement.`,
      analogy: `A code review is like a second doctor reading your X-ray. The first doctor is skilled, but a fresh pair of eyes catches what tired eyes missed. A good second doctor explains what they saw — they don't just say "wrong".`,
      code: [
        {
          title: 'A real-style review comment: missing tenant scope',
          lang: 'javascript',
          code: `// ❌ Code in the PR
router.get('/candidates/:id', async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  res.json(candidate);
});

// 💬 My comment:
// "Blocking: this finds a candidate by id only, so a user from tenant A
//  could read tenant B's candidate if they guess an id. Can we scope by
//  tenantId and add the RBAC check? Suggestion below."

// ✅ Suggested change
router.get(
  '/candidates/:id',
  requirePermission('recruiter:candidates:read'),
  async (req, res) => {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId, // only this company's data
    });
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    res.json(candidate);
  }
);`,
        },
      ],
      output: `The comment does three things: it labels the severity ("Blocking"), explains the real risk (cross-tenant data leak), and offers a fix. The fixed route returns \`404\` for another tenant's id — it does not even reveal that the record exists.`,
      questions: [
        {
          q: 'What do you look for in a code review?',
          a: 'Correctness and edge cases first, then security (auth, validation, tenant scoping), then tests, then readability. Style nits come last and are clearly marked as non-blocking.',
        },
        {
          q: 'How do you handle disagreement in a review?',
          a: 'I explain my reason with facts — a bug, a benchmark, a doc. If it is a style preference, I let it go. If we still disagree, we have a short call or ask the tech lead. The goal is the best code, not winning.',
        },
        {
          q: 'How do you make your own PRs easy to review?',
          a: 'Small, focused PRs, a description with what/why/how to test, screenshots for UI, and tests included. I self-review the diff before asking anyone.',
        },
        {
          q: 'How do you review AI-generated code?',
          a: 'Exactly like human code, but extra careful about made-up APIs, missing error handling and security checks. Whoever opens the PR owns the code.',
        },
      ],
      spoken: `"I see code reviews as a way to catch bugs and share knowledge, not to judge people. When I review, I first read the ticket so I know the goal. Then I check correctness and edge cases, security, and — since our SaaS was multi-tenant — that every query is scoped by tenant and has the right permission check. Then tests, and then readability. I label comments as blocking or nit, and I always explain why. When I'm the author, I keep PRs small, write a clear description, and self-review first. If someone disagrees, I discuss it calmly; the best solution wins, not me."`,
      mistakes: [
        'Only commenting on style. Reviews that miss a real bug but argue about semicolons waste everyone\'s time — use a linter for style.',
        'Huge PRs. A 2,000-line PR gets a quick "LGTM" and hides bugs. Split the work.',
        'Taking review comments personally, or writing harsh comments. Comment on the code, not the person.',
        'Follow-up trap: "Tell me about a bug you caught in review." Have one ready — a missing tenant filter, a missing `await`, or an unverified webhook are realistic examples. Adapt: use a real one if you remember it.',
      ],
      takeaway: 'Review for correctness, security and tenant safety first; be kind and specific; keep your own PRs small.',
    },
    {
      id: 'octagnt-architecture',
      title: 'OCTAGNT Architecture in Plain Words',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A React UI, a FastAPI + PostgreSQL API, a stateless FastAPI scoring engine and a FastAPI voice service, connected over internal HTTP, with SQS for resume processing and everything running on AWS ECS.',
      what: `OCTAGNT has **four parts**:

1. **UI** — React + Vite + TypeScript. Redux-Saga and React Query for data, Tailwind with shadcn-style components. Built into static files and served from S3 behind CloudFront. It talks only to the API, using login cookies.
2. **API** — Python **FastAPI** with **PostgreSQL** (SQLAlchemy async + Alembic migrations). Owns users, tenants, jobs, candidates, billing and the pipeline runs.
3. **Scoring engine** — a **stateless** FastAPI service. No database. The API sends it data, it returns scores. All the scoring logic and most Claude calls live here.
4. **Voice service** — a FastAPI service for AI phone screens (Twilio + Google speech + Claude).

How they connect:
- API → engine and API → voice: **internal HTTP** with a service token.
- Voice → API: **webhooks** when a call connects, ends, and when the scored result is ready.
- Resume processing: uploads go to **S3**, a message goes on **SQS**, and worker processes pick it up and run the pipeline.

#### Deeper version
- **Multi-tenancy:** one shared PostgreSQL database; each row has a tenant id, and PostgreSQL **Row-Level Security** policies filter rows by the current tenant.
- **Pipeline:** the API runs about 15 ordered steps and calls the engine once per step, so the UI can show live progress. At the end the engine computes a weighted score and a tier.
- **Background work:** SQS workers (a priority queue for UI uploads, a standard queue for bulk), plus scheduled jobs for usage reports, credit refills and a watchdog for stuck calls.
- **Deployment:** each backend is a Docker image pushed to ECR and run on ECS. The voice service also uses Google Cloud for speech, signing in from AWS with Workload Identity Federation (no stored Google key).

Adapt: say which of the four parts you worked in day to day.`,
      why: `Splitting it this way keeps each part simple. The API owns data, the engine is pure logic that is easy to test and scale, and the voice service can hold long phone calls without slowing normal web requests. A stateless engine means you can add instances freely.`,
      analogy: `A hospital: the reception desk (API) keeps all the records, the lab (engine) only runs tests on samples you send it and keeps nothing, and the phone clinic (voice service) does call-based check-ups and sends the notes back to reception.`,
      code: [
        {
          title: 'The parts and how they talk',
          lang: 'text',
          code: `React UI (S3 + CloudFront)
     | cookies, JSON
     v
FastAPI API  ---- PostgreSQL (row-level security per tenant)
  |   |   \\
  |   |    \\-- S3 (resumes)  +  SQS --> pipeline workers
  |   |
  |   +--HTTP + service token--> Scoring engine (stateless, Claude)
  |
  +--HTTP + service token--> Voice service (Twilio, Google STT/TTS, Claude)
                                  |
                                  +--webhooks--> API (call status, scored result)`,
        },
        {
          title: 'Calling the engine from the API (simplified)',
          lang: 'python',
          code: `# The API keeps one shared HTTP client per service, created at startup.
async def run_step(step: str, payload: dict) -> dict:
    resp = await engine_client.post(
        f"/score/step/{step}",
        json=payload,
        headers={"X-Service-Token": settings.service_token},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()   # scores for this step; the API saves them and updates progress`,
        },
      ],
      output: `The first block shows which part owns what. The second shows the pattern the API uses: one HTTP call per pipeline step to the stateless engine, then the API saves the result and updates progress the UI can show.`,
      questions: [
        {
          q: 'Why keep the scoring engine stateless?',
          a: `It only computes. With no database it is easy to test, easy to scale (add more copies), and it cannot corrupt data. The API stays the single owner of the data.`,
        },
        {
          q: 'How do the services talk to each other?',
          a: `Internal HTTP with a service token. The voice service reports back to the API with webhooks. Resume processing uses S3 plus an SQS queue and worker processes.`,
        },
        {
          q: 'How is tenant data kept separate?',
          a: `Every row has a tenant id, and PostgreSQL row-level security policies only return rows for the current tenant. Roles then limit what each user can do inside the tenant.`,
        },
        {
          q: 'Why SQS for resume processing?',
          a: `Parsing and scoring many resumes is slow. A queue lets the upload return quickly, spreads the work over workers, and retries if a worker dies (the message becomes visible again).`,
        },
      ],
      spoken: `"OCTAGNT has four parts. A React and TypeScript frontend, a FastAPI API with PostgreSQL that owns all the data, a stateless FastAPI scoring engine, and a separate FastAPI voice service for AI phone screens. The API calls the engine and the voice service over internal HTTP with a service token, and the voice service reports back with webhooks. Resume uploads go to S3 and onto an SQS queue, and workers run the scoring pipeline step by step. Tenants share one PostgreSQL database, separated with row-level security. Everything runs as Docker containers on AWS ECS."`,
      mistakes: [
        `Saying it is a Node or MongoDB app. OCTAGNT's current code is Python FastAPI with PostgreSQL.`,
        `Calling the engine a "microservice with its own DB". It is stateless on purpose — the API owns the data.`,
        `Forgetting the queue. Resume processing is asynchronous through SQS workers, not done inside the upload request.`,
        `Follow-up trap: "What if the engine is down?" The step fails and the run can be retried, because the API keeps the run state and the queue redelivers work.`,
      ],
      takeaway: 'UI → API (owns data) → stateless engine + voice service over HTTP, SQS for heavy work, row-level security for tenants, all on ECS.',
    },
    {
      id: 'jd-generation-openai',
      title: 'AI Job Description Analysis & Generation (Claude)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'OCTAGNT sends the job description to Claude with strict JSON-only prompts to extract skills, rate clarity, build context and suggest probe questions, which recruiters then review and edit.',
      what: `When a recruiter adds a job (typed or uploaded as PDF/DOCX), OCTAGNT uses **Claude** (Anthropic) to understand it:

1. **Parse** — an uploaded file is turned into plain text.
2. **Extract skills** — which skills are required, and how important each one is (tiers).
3. **Clarity check** — is the job description clear and complete, and what is missing?
4. **Context** — a structured summary of the role used later by scoring.
5. **Probe questions** — suggested screening and "deal-breaker" questions for the voice interview.

The recruiter **reviews and edits** the suggested probe questions. If they regenerate, their edits are kept and merged.

Results are saved on the job in PostgreSQL as **JSON columns**, so later steps (scoring, voice) can read them.

**Resume note:** your resume says this used **OpenAI** and "generated" job descriptions. In the OCTAGNT code, the model is **Anthropic Claude**, and the feature **analyses** the job description. Prompt-based JD *generation* exists in **SkillKeepr** (sent to a separate AI service and returned by callback). Align your resume and answer with what you actually built.

#### Deeper version
- **Model settings:** a small, fast Claude model with **temperature 0**, so the same input gives the same output.
- **Structured output by prompt:** the prompt says "return ONLY valid JSON" and shows the exact format. The code then cleans the reply (removes code fences, finds the JSON object) and parses it.
- **Reliability:** up to **3 attempts with backoff** on rate limits (429) and server errors (5xx / overloaded).
- **Cost:** token usage is counted per request and stored, so the team can see spend per feature.
- Adapt: the "~70% less manual effort" number is from your resume; be ready to say how it was measured.`,
      why: `Recruiters often write vague job descriptions. If the AI pulls out clear skills and good screening questions first, the rest of the pipeline (scoring and the voice screen) has something solid to compare candidates against.`,
      analogy: `It is like an experienced hiring manager reading a rough job brief and handing back a checklist: "these are the must-have skills, this part is unclear, and here are five questions to ask on the phone."`,
      code: [
        {
          title: 'Asking Claude for JSON and parsing it safely (simplified)',
          lang: 'python',
          code: `PROMPT = """Extract the skills from this job description.
Return ONLY valid JSON in this format:
{"must_have": ["..."], "nice_to_have": ["..."]}

Job description:
{jd}"""

async def extract_skills(jd: str) -> dict:
    for attempt in range(3):
        try:
            text = await claude(PROMPT.format(jd=jd), temperature=0)
            return parse_json(text)          # strip code fences, find the {...}, json.loads
        except (RateLimited, ServerError):
            await asyncio.sleep(2 ** attempt)  # back off, then retry
    raise AIUnavailable("skill extraction failed")`,
        },
      ],
      output: `The function asks Claude for JSON only, with temperature 0 for stable answers. If Claude is rate-limited or overloaded it waits 1s, 2s, 4s and retries. The reply is cleaned and parsed into a dictionary that is saved on the job.`,
      questions: [
        {
          q: 'How did you get structured data out of the LLM?',
          a: `A strict prompt that says "return only JSON" with an example format, temperature 0, and a small parser that strips code fences and extracts the JSON object. A next step would be the API's schema-enforced tool output.`,
        },
        {
          q: 'How did you handle LLM failures?',
          a: `Retries with exponential backoff on 429 and 5xx, a timeout, and a clear error if all attempts fail, so the recruiter sees "try again" instead of a broken page.`,
        },
        {
          q: 'Can the recruiter change what the AI produced?',
          a: `Yes. Probe questions are suggestions. Recruiters edit them, and regenerating merges with their edits instead of overwriting them.`,
        },
        {
          q: 'Which model did you use and why?',
          a: `A small, fast Claude model. These are short extraction tasks, so speed and cost matter more than the biggest model.`,
        },
      ],
      spoken: `"When a recruiter adds a job, we use Claude to analyse it. It extracts the required skills and their importance, rates how clear the description is, builds a structured summary for scoring, and suggests screening questions. We use temperature zero and a strict JSON-only prompt, then parse the reply, with retries and backoff if the API is rate-limited. The results are saved on the job, and recruiters can edit the suggested questions; regenerating keeps their edits. That gives the rest of the pipeline a clear target to score candidates against."`,
      mistakes: [
        `Saying OpenAI when the code uses Claude. Interviewers may ask detailed follow-ups, so match the real tool.`,
        `Trusting the model output blindly. Always parse and validate the JSON and handle failure.`,
        `Using a high temperature for extraction. Extraction should be repeatable, so use 0.`,
        `Follow-up trap: "What if the JSON is broken?" The parser fails, the call is retried, and after the last attempt the user gets a clear error.`,
      ],
      takeaway: 'Claude + temperature 0 + JSON-only prompt + parsing + retries turns a rough JD into skills, clarity and probe questions recruiters can edit.',
    },
    {
      id: 'voice-agent-pipeline',
      title: 'AI Voice Interview Agent: Twilio → STT → Claude → TTS',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'The voice service phones the candidate with Twilio, streams the audio over a WebSocket, transcribes it with Google STT, replies with streamed Claude text spoken by Google TTS, then scores the call and sends the result back by webhook.',
      what: `The voice agent runs a **short screening phone call** with a candidate. Step by step:

1. **Start:** the API checks the candidate has **consented**, takes one **voice credit**, and asks the voice service to call. It sends the candidate's name, the screening questions and a mode (**basic** or **forensic**, with deeper probe questions).
2. **Call:** the voice service places an **outbound Twilio call**. When it is answered, Twilio opens a **WebSocket** and streams the live audio both ways.
3. **Listen:** the audio (8 kHz phone audio) is converted and sent to **Google Speech-to-Text** in streaming mode. A **voice activity detector** decides when the candidate has finished speaking.
4. **Think:** the transcript goes to **Claude**, which asks the questions in order and handles follow-ups.
5. **Speak:** Claude's reply is streamed **sentence by sentence** into **Google Text-to-Speech**, and the audio is sent back to Twilio so the candidate hears it.
6. **End:** Claude marks the end of the interview, the agent says goodbye and hangs up. Long silence also ends the call politely.
7. **After:** the recording is saved to **S3**, the transcript is analysed and scored with Claude, and the result goes back to the API by **webhook**, which merges it into the candidate's score.

**Resume note:** your resume mentions **xAI Grok Voice**. The voice code uses **Claude** for the conversation and **Google** for speech; Grok does not appear. Align your resume and answer with what you actually built.

#### Deeper version
- **Who writes the questions:** the scoring engine builds them from the candidate's weaker scores plus probe questions the recruiter approved — rule-based, not free-form AI.
- **Turn detection:** a voice activity detector on short audio frames plus **adaptive endpointing** (a shorter or longer wait depending on context), so the agent neither cuts people off nor pauses awkwardly.
- **Barge-in:** if the candidate starts talking while the agent is speaking, the agent stops, tells Twilio to **clear** queued audio, and listens.
- **Latency:** the three stages overlap — the first audio is sent at the first phrase break while Claude is still writing the rest.
- **Answering machines:** Twilio's machine detection spots voicemail; the agent can leave a short message and skip analysis.
- **Reliability:** long speech streams are restarted before Google's time limit, the result webhook is retried, and a watchdog on the API side cleans up calls that never connected.`,
      why: `Recruiters cannot personally call hundreds of candidates for a first round. The agent screens consistently at any hour and gives the recruiter a transcript, a recording and a score to decide faster.`,
      analogy: `A relay race with four runners: Twilio (ears and mouth), Speech-to-Text (writes down what was said), Claude (decides what to say), Text-to-Speech (says it out loud). It only feels natural if each runner starts before the previous one has fully stopped — that is streaming.`,
      code: [
        {
          title: 'Twilio tells our service where to stream the audio (simplified)',
          lang: 'python',
          code: `@app.post("/twilio/voice")
async def answer_call(call_id: str):
    # Twilio asks what to do when the call connects:
    # "open a WebSocket to us and stream the audio".
    twiml = f"""<Response><Connect>
      <Stream url="wss://{{PUBLIC_HOST}}/media-stream/{call_id}" />
    </Connect></Response>"""
    return Response(content=twiml, media_type="text/xml")`,
        },
        {
          title: 'One conversation turn (simplified)',
          lang: 'python',
          code: `async def on_candidate_finished(text: str):
    history.append({"role": "user", "content": text})

    async for sentence in claude.stream_sentences(history):   # stream, sentence by sentence
        if candidate_started_talking():                        # barge-in
            await twilio.clear(stream_sid)                     # drop queued audio
            return
        audio = await google_tts(sentence)                     # text -> 8 kHz phone audio
        await twilio.send_audio(stream_sid, audio)

    if reply_says_end_call():
        await say_goodbye_and_hang_up()`,
        },
      ],
      output: `The first block is the hand-off: when Twilio connects the call, we reply with instructions to stream audio to our WebSocket. The second shows one turn: the candidate's words go to Claude, each sentence is spoken as soon as it is ready, and if the candidate interrupts we clear the queued audio and listen again.`,
      questions: [
        {
          q: 'Walk me through one turn of the conversation.',
          a: `Twilio streams audio to our WebSocket, Google STT transcribes it, voice activity detection decides the candidate has finished, Claude streams a reply, Google TTS speaks each sentence, and the audio goes back to Twilio.`,
        },
        {
          q: 'How did you keep latency low?',
          a: `Streaming at every stage: interim STT results, Claude streamed sentence by sentence, and TTS starting on the first phrase while Claude keeps writing. The stages run in parallel.`,
        },
        {
          q: 'How do you handle interruptions?',
          a: `Barge-in: if speech is detected while the agent is talking, we cancel the current reply, tell Twilio to clear queued audio, and listen.`,
        },
        {
          q: 'What happens after the call?',
          a: `The recording goes to S3, Claude analyses and scores the transcript (with a simple fallback if the AI call fails), and a webhook sends the result to the API, which merges it into the candidate's score.`,
        },
        {
          q: 'How is consent and cost handled?',
          a: `The API only places a call if the candidate has consented, takes a voice credit per call, and a watchdog cleans up calls that never connect.`,
        },
      ],
      spoken: `"The voice agent does a short screening call. The API checks consent, takes a credit and asks the voice service to call. We place an outbound Twilio call, and Twilio streams the audio to our WebSocket. Google Speech-to-Text transcribes it, voice activity detection decides when the candidate has finished, and Claude replies. We stream Claude's reply sentence by sentence into Google Text-to-Speech, so the first words play quickly. If the candidate interrupts, we clear the queued audio and listen. After the call we store the recording, score the transcript and send the result back by webhook."`,
      mistakes: [
        `Naming tools the code does not use (Grok, OpenAI). The conversation model is Claude; speech is Google.`,
        `Waiting for the full LLM reply before speaking. That adds seconds of silence; stream sentence by sentence.`,
        `Forgetting the phone audio format: Twilio sends 8 kHz mu-law audio, which must be converted for STT and produced again for playback.`,
        `Ignoring voicemail. Without machine detection the agent would "interview" an answering machine and waste AI calls.`,
        `Follow-up trap: "What if the scoring AI fails after the call?" Each analysis step has a heuristic fallback, and the result webhook is retried.`,
      ],
      takeaway: 'Twilio stream → Google STT → Claude (streamed) → Google TTS → back to Twilio, with barge-in, endpointing, voicemail detection and a scored webhook at the end.',
    },
    {
      id: 'zoho-crm-provisioning',
      title: 'Zoho CRM: Lead Intake & Workspace Provisioning',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Zoho sends new leads to an intake webhook; free-plan leads are provisioned automatically (tenant + owner + credits + one-time activation code) and their status is pushed back to Zoho as they activate and engage.',
      what: `Sales leads live in **Zoho CRM**. OCTAGNT connects to it in **both directions**.

**Zoho → OCTAGNT (new lead):**
1. Zoho calls our **lead-intake webhook**, protected by a shared secret.
2. We save the raw payload (for debugging) and **upsert** the lead by its Zoho lead id, so a repeated call does not create duplicates.
3. We route by plan: **free-plan** leads are provisioned automatically; paid-plan leads go to the sales team.

**Provisioning (what it really means):**
1. A durable **provisioning queue row** is written first, then a background task does the work (so nothing is lost if it fails half-way).
2. If the same customer already exists, we reuse it.
3. Otherwise we call the **normal signup logic**: create a **tenant** (workspace with its own URL slug) and an **owner** user with the free plan's starting **credits**.
4. Instead of a password, the owner gets a **one-time 6-digit code** (only its hash is stored) and an **activation link**, which Zoho sends to the customer.

**OCTAGNT → Zoho (lifecycle):** as the customer moves along, we update the lead in Zoho: **Provisioned → Activated** (first login) **→ Engaged** (first job created), plus monthly credit refills.

#### Deeper version
- **OAuth:** we use Zoho's **refresh-token** flow. The access token is cached for most of its lifetime behind a lock, so many requests do not refresh at the same time, and it is dropped and refreshed on a 401.
- **Updates** go out as background tasks so a slow Zoho API never slows the user.
- **Reusing signup** means provisioned accounts are identical to self-signup accounts — one code path to test.`,
      why: `Without this, sales had to copy leads by hand and someone had to create each trial workspace. Automating it means a free-plan lead can start using the product within minutes, and sales can see in Zoho who actually activated.`,
      analogy: `A hotel booking desk: the travel agent (Zoho) sends the booking, the hotel prepares the room and a key code (provisioning), and the hotel tells the agent "checked in" and "used the restaurant" (status updates) so they know the guest is happy.`,
      code: [
        {
          title: 'Lead intake and provisioning (simplified)',
          lang: 'python',
          code: `@router.post("/zoho/lead-intake")
async def lead_intake(payload: dict, background: BackgroundTasks, x_zoho_secret: str = Header()):
    if not secrets.compare_digest(x_zoho_secret, settings.zoho_secret):
        raise HTTPException(401)

    lead = await upsert_lead(zoho_lead_id=payload["id"], data=payload)   # no duplicates
    if lead.plan == "Free":
        job = await queue_provisioning(lead)          # durable row first
        background.add_task(provision, job.id)        # then do the work
    return {"ok": True}

async def provision(job_id):
    lead = await load(job_id)
    tenant, owner = await signup_user(lead.email, lead.company, plan="free")  # same as self-signup
    code = generate_six_digit_code()
    await save_code_hash(owner, sha256(code))
    await zoho.update_lead(lead.zoho_id, status="Provisioned", activation_link=link_for(owner))`,
        },
      ],
      output: `The webhook checks the secret in constant time, upserts the lead, and for free-plan leads writes a durable job and runs provisioning in the background. Provisioning reuses normal signup, stores only the hash of the one-time code, and tells Zoho the lead is provisioned.`,
      questions: [
        {
          q: 'How do you avoid duplicate leads if Zoho retries?',
          a: `We upsert by the Zoho lead id, and provisioning checks for an existing customer first, so a repeated webhook does not create a second workspace.`,
        },
        {
          q: 'How did you handle Zoho authentication?',
          a: `OAuth refresh-token flow. We cache the access token and refresh it behind a lock, and refresh again if Zoho returns 401.`,
        },
        {
          q: 'Why reuse the normal signup code?',
          a: `So provisioned accounts behave exactly like self-signup accounts, with one tested code path for tenant, owner and credits.`,
        },
        {
          q: 'Why not send a password?',
          a: `A one-time short code plus an activation link is safer; we only store a hash of the code, and the customer sets their own password.`,
        },
      ],
      spoken: `"Zoho calls our lead-intake webhook, which checks a shared secret and upserts the lead by its Zoho id. Free-plan leads are provisioned automatically: we write a durable queue row, then a background task reuses our normal signup to create the workspace and the owner with free credits. The owner gets a one-time code and an activation link instead of a password. Then we push status back to Zoho — provisioned, activated on first login, engaged on the first job — using OAuth with a cached refresh token."`,
      mistakes: [
        `Doing provisioning inside the webhook request. Zoho may time out and retry; save a durable job and do the work in the background.`,
        `Creating duplicates on retries. Always upsert by the external id.`,
        `Refreshing the OAuth token on every call. Cache it and refresh once, behind a lock.`,
        `Follow-up trap: "What if provisioning fails half-way?" The durable queue row records it, so it can be retried without losing the lead.`,
      ],
      takeaway: 'Zoho webhook → upsert lead → durable job → reuse signup (tenant, owner, credits, one-time code) → push lifecycle status back to Zoho.',
    },
    {
      id: 'docker-aws-cicd',
      title: 'Docker, AWS (ECS, S3, SQS) and CI/CD',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Each OCTAGNT backend is a multi-stage Docker image; GitHub Actions runs lint, type checks and tests; AWS CodeBuild builds and pushes to ECR and deploys to ECS; the UI is built to S3 behind CloudFront.',
      what: `**Docker:** each Python service (API, engine, voice) has a **multi-stage Dockerfile** on a slim Python image. The production stage runs as a **non-root user**, has a **health check**, and a small init process so the app shuts down cleanly. On start, the API runs **database migrations** and seed data, then starts the server.

**CI (every pull request / branch):** GitHub Actions runs:
- Python: **ruff** (lint), **mypy** (strict types), **pytest** (the API also runs integration tests against a real PostgreSQL).
- UI: **eslint**, TypeScript check, Prettier, **Vitest**, contract tests; **Playwright** for end-to-end tests.

**CD (deploy):** AWS **CodeBuild**:
1. Build the Docker image (production stage) and tag it with the version, environment and commit.
2. Push it to **ECR** (AWS's image registry).
3. Fill the environment settings from **Secrets Manager**.
4. Register a new **ECS task definition** and update the ECS service, which rolls out the new containers.

**UI:** built with Vite, uploaded to **S3**, then a **CloudFront** cache invalidation.

**Other AWS:** **S3** for resumes (presigned uploads) and call recordings, **SQS** for resume processing, **Secrets Manager** for credentials, **CloudWatch** for logs.

#### Deeper version
- **Environments:** develop, QA, demo, staging and production, each with its own image tag.
- **The voice service** also needs Google speech. It signs in to Google Cloud **from AWS** with **Workload Identity Federation**, so no long-lived Google key is stored.
- **Presigned uploads:** the browser uploads resumes straight to S3 with a short-lived URL, so large files never pass through the API.
- **Resume note:** your resume mentions **Lambda**. OCTAGNT runs on **ECS**, not Lambda; SkillKeepr is the Lambda (Serverless) project. Adapt your answer.`,
      why: `Docker gives the same environment everywhere. CI catches bugs and type errors before merge. Automated image builds and ECS deploys make releases repeatable and easy to roll back by redeploying an older image tag.`,
      analogy: `Docker is a sealed lunchbox that tastes the same wherever you open it. CI is the quality check at the factory gate. ECR is the warehouse of finished lunchboxes, and ECS is the delivery fleet that swaps old ones for new ones.`,
      code: [
        {
          title: 'Multi-stage Dockerfile (simplified)',
          lang: 'dockerfile',
          code: `FROM python:3.12-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS production
COPY src ./src
RUN useradd -m app
USER app                                   # never run as root
HEALTHCHECK CMD curl -f http://localhost:4000/health || exit 1
CMD ["./startup.sh"]                       # migrate, seed, then start uvicorn`,
        },
        {
          title: 'Deploy pipeline in steps',
          lang: 'text',
          code: `GitHub Actions (CI):  ruff -> mypy -> pytest           (UI: eslint -> tsc -> vitest)
CodeBuild (CD):       docker build (production stage)
                      -> tag v{version}-{env}-{commit}
                      -> push to ECR
                      -> env from Secrets Manager
                      -> new ECS task definition -> update ECS service
UI:                   vite build -> S3 sync -> CloudFront invalidation`,
        },
      ],
      output: `The Dockerfile installs dependencies once, copies the code, switches to a non-root user and adds a health check. The pipeline shows the order: test in GitHub Actions, then build, tag, push to ECR and roll out on ECS; the UI goes to S3 and CloudFront.`,
      questions: [
        {
          q: 'Why multi-stage Docker builds?',
          a: `Build tools and test dependencies stay in earlier stages, so the production image is smaller and has less attack surface.`,
        },
        {
          q: 'How does a deploy work?',
          a: `CodeBuild builds and tags the image, pushes it to ECR, then registers a new ECS task definition and updates the service, which replaces the old containers.`,
        },
        {
          q: 'How do you roll back?',
          a: `Redeploy the previous image tag (or previous task definition revision). Images are immutable and tagged with version and commit.`,
        },
        {
          q: 'Where are secrets kept?',
          a: `In AWS Secrets Manager, injected at deploy time, never in the image or the repo.`,
        },
      ],
      spoken: `"Each backend service has a multi-stage Dockerfile on slim Python, running as a non-root user with a health check, and the API runs migrations on start. GitHub Actions runs ruff, mypy and pytest on every change, and the UI runs eslint, type checks and Vitest. For deploys, CodeBuild builds the image, tags it with the version and commit, pushes it to ECR and rolls out a new task definition on ECS. Secrets come from Secrets Manager. The React UI is built to S3 behind CloudFront. S3 also stores resumes and call recordings, and SQS queues resume processing."`,
      mistakes: [
        `Saying the backend runs on Lambda. OCTAGNT runs on ECS containers.`,
        `Baking secrets into the Docker image. Inject them at deploy time from Secrets Manager.`,
        `Running containers as root. Use a non-root user in the production stage.`,
        `Follow-up trap: "How do database migrations run safely on deploy?" They run on container start with Alembic before the server starts; migrations should be backward-compatible so old and new containers can overlap.`,
      ],
      takeaway: 'Multi-stage Docker → GitHub Actions checks → CodeBuild → ECR → ECS; UI → S3 + CloudFront; S3, SQS and Secrets Manager for the rest.',
    },
    {
      id: 'ai-coding-tools-responsibly',
      title: 'Using Claude Code & GitHub Copilot Responsibly',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'AI tools speed up coding, tests and reviews, but the team kept guardrails: written context and prompt guides for consistent tests, CI checks, an advisory AI PR review, and humans owning every merge.',
      what: `Both teams used AI coding tools, with **guardrails** so speed did not cost quality.

How they were used:
- **Writing code faster**: boilerplate, refactors, migrations and first drafts of features, which a developer then reviews and edits.
- **Writing tests**: SkillKeepr kept **testing guides and prompt templates** that explain the architecture (handler → controller → service → repository), what to mock and which test categories to cover, so AI-generated Jest tests follow one consistent style.
- **Code review**: OCTAGNT's CI includes a **governance check** and an **advisory Claude Code review** on pull requests. It comments, but a human still approves and merges.
- **Debugging and exploration**: explaining unfamiliar code, tracing a flow across services, drafting docs.

Guardrails:
- AI output is a **draft**: it must pass lint, type checks and tests in CI like any other code.
- **No secrets or customer data** in prompts.
- A human **reads and understands** every change before merging; "the AI wrote it" is never an excuse.
- Project instruction files give the AI the **team's conventions**, so suggestions match the codebase.

#### Deeper version
Where AI helps most: repetitive code, tests for existing behaviour, translating between languages (useful when an API was rewritten from Node/Express to Python/FastAPI), and first drafts of documentation.

Where to be careful: security-sensitive code (auth, payments, webhooks), subtle concurrency, and anything where the AI may invent an API that does not exist. Always check against official docs and tests.`,
      why: `Most teams now use AI tools. Interviewers want to know you use them productively and safely, and that you still understand and own your code.`,
      analogy: `An AI assistant is like a very fast junior developer who never gets tired but sometimes confidently gets things wrong. You give it clear instructions, review everything it writes, and never let it merge on its own.`,
      code: [
        {
          title: 'A test-writing prompt template (simplified)',
          lang: 'text',
          code: `Context: Lambda handler -> controller -> service -> repository.
Task: write Jest tests for SubscriptionService.cancel().
Rules:
- Mock the repository layer and the DB connection, not the service itself.
- Cover: success, already cancelled, not found, permission denied, DB error.
- Follow the existing describe/it naming style.
Output: one spec file, no changes to source code.`,
        },
        {
          title: 'Advisory AI review in CI (simplified)',
          lang: 'yaml',
          code: `on: pull_request
jobs:
  governance:
    steps:
      - run: ./ci/check-governance.sh      # required checks
      - name: AI review (advisory)
        run: claude-review --comment-only  # comments on the PR, never blocks or merges`,
        },
      ],
      output: `The template makes AI-written tests predictable: the AI knows the layers, what to mock and which cases to cover, so the output looks like the team's own tests. The CI job shows the review is advisory: it adds comments, while required checks and human approval still decide the merge.`,
      questions: [
        {
          q: 'How do you use AI tools in your work?',
          a: `For drafts of code and tests, refactors, docs and understanding unfamiliar code. Everything goes through review and CI like normal code.`,
        },
        {
          q: 'How do you stop AI from adding bugs?',
          a: `Treat output as a draft: read it, run tests and type checks, and be extra careful with auth, payments and concurrency.`,
        },
        {
          q: 'Did your team use AI in code review?',
          a: `Yes, as an advisory reviewer in CI that comments on pull requests; humans still approve and merge.`,
        },
        {
          q: 'What should never go into a prompt?',
          a: `Secrets, credentials and customer personal data.`,
        },
      ],
      spoken: `"I use Claude Code and Copilot for drafts, refactors, tests and understanding unfamiliar code, but I treat everything as a draft. In SkillKeepr we wrote testing guides and prompt templates describing our layers and what to mock, so AI-generated Jest tests matched our style. In OCTAGNT, CI ran an advisory Claude Code review on pull requests, alongside the normal lint, type checks and tests. A human still reviewed and merged everything, and we never put secrets or customer data in prompts."`,
      mistakes: [
        `Merging AI output you do not understand.`,
        `Pasting secrets, keys or customer data into prompts.`,
        `Trusting AI on security-critical code (auth, payments) without careful review and tests.`,
        `Follow-up trap: "Doesn't AI make developers worse?" Only if you stop reviewing and learning; used with guardrails it removes repetitive work so you focus on design.`,
      ],
      takeaway: 'AI writes drafts; context files, CI checks and human review decide what ships.',
    },
    {
      id: 'skillkeepr-architecture',
      title: 'SkillKeepr Architecture in Plain Words',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Serverless TypeScript services on Lambda + API Gateway, a shared core library, one MongoDB per tenant, React + Redux-Saga apps, and queues/Step Functions/Batch for background work.',
      what: `SkillKeepr is split into a few **services** and a few **frontend apps**, all sharing common code.

**Backend services** (TypeScript, each one a set of **AWS Lambda** functions behind **API Gateway**, deployed with the **Serverless Framework**):
- **Admin service** — the biggest one, for HR and recruiters: jobs, candidates, interviews, talent pool, integrations, billing and AI scoring.
- **Talent service** — the candidate side: profile builder, applying for jobs, joining interviews.
- **Cloud-admin service** — for the team that runs the platform: client companies, plans, add-ons, audit logs.
- A shared **core** library (added to each service as a git submodule) holds models, repositories and helpers, so every service works the same way.

**Inside a service** the flow is: **handler → controller → service → repository → database**. Each controller method is protected by an **authorizer** that checks the login and permissions first.

**Frontend:** React 18 apps for admin, talent and cloud-admin, built on a shared **core UI** library: Redux + **Redux-Saga** for data loading, **Mantine** for components, and a small fetch wrapper that sends cookies and the company id with every call.

#### Deeper version
- **Database:** MongoDB with Mongoose. **Each company has its own database.** Connections are cached per company so warm Lambdas reuse them instead of reconnecting.
- **Background work:**
  - **SQS FIFO queues** for resume parsing and AI scoring, so long jobs don't block the API.
  - **Step Functions** on a schedule for interview reminder emails.
  - **AWS Batch** for long CRM syncs.
- **Real time:** an **API Gateway WebSocket API** pushes notifications and powers the live code editor in interviews.
- **Files:** S3 with **presigned URLs** (short-lived links), so browsers upload and download directly.
- **Infra:** Terraform for networking, CloudFront, certificates and DNS; CodeBuild pipelines deploy services and UIs.

Adapt: say which services you mostly worked in.`,
      why: `Interviewers ask "draw the architecture" to see whether you understand the system beyond your own tickets. Knowing why it is serverless, how tenants are separated, and where background work runs shows real ownership.`,
      analogy: `It is like a hospital with separate departments (services) that all follow the same hospital rulebook (the shared core library). Every patient's records are kept in that patient family's own cabinet (a database per company). The reception desk (API Gateway) checks your ID before sending you to a department, and the lab (queues) handles slow tests in the background.`,
      code: [
        {
          title: 'Request flow inside one service (simplified)',
          lang: 'typescript',
          code: `// handler.ts — API Gateway calls a Lambda handler
export const jobs = (event) => JobController.handle(event);

// controller — routes by method/action, guarded by the authorizer
class JobController {
  @Authorizer.authenticateAdmin('MANAGE_JOBS.R')   // login + tenant + plan + permission
  static async list(event) {
    const jobs = await JobService.list(event.queryStringParameters);
    return ok(jobs);
  }
}

// service — business rules only
class JobService {
  static list(filters) { return JobRepository.find(filters); }
}

// repository — talks to THIS company's database connection
class JobRepository {
  static find(filters) { return getJobModel(currentConnection()).find(filters); }
}`,
        },
      ],
      output: `A request for jobs hits API Gateway, which runs the Lambda handler. The authorizer checks the user before anything else. Then the controller calls the service, the service calls the repository, and the repository queries the **current company's** database.`,
      questions: [
        {
          q: 'Why Lambda instead of a long-running Node server?',
          a: `No servers to patch, automatic scaling per request, and paying only for usage. The trade-offs are cold starts, time limits per call, and needing to reuse database connections between calls.`,
        },
        {
          q: 'How is code shared between services?',
          a: `A shared core library with models, repositories, auth and helpers, added to each service as a git submodule. The UIs share a core UI library the same way.`,
        },
        {
          q: 'How do you run slow jobs like resume parsing?',
          a: `The API puts a message on an SQS FIFO queue and returns quickly. A worker Lambda processes messages in order per group and saves progress, and the UI is notified when it is done.`,
        },
        {
          q: 'How does the frontend load data?',
          a: `Redux-Saga handles side effects: a saga calls the API through a small fetch wrapper (cookies included, company id header added), then dispatches success or failure actions.`,
        },
      ],
      spoken: `"SkillKeepr is serverless. Each backend service is a set of TypeScript Lambda functions behind API Gateway, deployed with the Serverless Framework: an admin service for recruiters, a talent service for candidates, and a cloud-admin service for running the platform. They share a core library for models, repositories and auth. Inside a service it's handler, controller, service, repository. Every company has its own MongoDB database, and we cache connections per company across warm Lambdas. Slow work like resume parsing and AI scoring goes through SQS FIFO queues, reminders run on Step Functions, and the React apps use Redux-Saga and Mantine."`,
      mistakes: [
        `Drawing one shared database with a tenantId filter. SkillKeepr uses **one database per company**.`,
        `Forgetting connection reuse. Opening a new MongoDB connection on every Lambda call is slow and can exhaust connections; caching per company fixes this.`,
        `Not knowing where background work runs. Name the queue, the scheduler (Step Functions) and Batch.`,
        `Follow-up trap: "What happens on a cold start?" The function boots, loads code, and opens the company's database connection once; later warm calls reuse it.`,
      ],
      takeaway: 'Lambda services + shared core library + one MongoDB per company + queues for slow work + React/Redux-Saga apps.',
    },
    {
      id: 'multi-tenant-design',
      title: 'Multi-Tenant Design & Tenant Isolation',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: `SkillKeepr isolates companies with a separate MongoDB database per tenant: the subdomain picks the tenant, each request connects to that tenant's database, and the JWT's tenant must match.`,
      what: `**Multi-tenant** means many customer companies use one product. The big design question is **how to keep their data apart**. There are three common options:
1. **Shared database, shared tables**, with a \`tenantId\` on every record.
2. **Shared database, separate schema** per tenant.
3. **Separate database per tenant.**

**SkillKeepr uses option 3: each company has its own MongoDB database.**

How a request finds the right database:
1. Every company has its **own subdomain** (for example \`acme.admin...\`).
2. The React app reads the company from the subdomain and sends it on every call in an **\`x-tenant-id\` header**.
3. On the backend, a wrapper first checks the request comes from an allowed origin, then **sets the current tenant**.
4. It looks up that tenant's **connection details** (kept in secure storage, not in code) and opens — or **reuses** — a Mongoose connection to **that company's database**.
5. Models are created on that connection, so every query automatically runs against the right database.
6. The **login token (JWT) also carries the tenant id**, and the authorizer **rejects** the request if it does not match the header.

#### Deeper version
- **Connection caching:** Lambda containers stay warm between calls. A connection manager keeps a map of tenant → connection, so the second request for the same company reuses the open connection instead of reconnecting.
- **Why a database per tenant?** Strong isolation (a forgotten filter can't leak data), easy per-customer backup/restore or deletion, and data can be placed per customer. The cost: more databases to manage, migrations must run on **every** tenant database, and too many open connections if you have very many tenants.
- **Migrations and seeding** therefore run per tenant (scripted with Ansible jobs and migrate-mongo).
- **Platform-level data** (client companies, plans, add-ons) lives with the **cloud-admin** service, separate from tenant data.

Resume note: older notes in this hub said "tenantId on every document". That is **not** how SkillKeepr works — use the database-per-tenant explanation.

Adapt: say which parts you built (connection manager, tenant routing, per-tenant migrations).`,
      why: `Data leaks between customers are the worst bug a SaaS can have. Interviewers want to hear a concrete isolation strategy, how the tenant is identified on each request, and the trade-offs you accepted.`,
      analogy: `A shared-table design is one big filing cabinet where every folder has a company sticker — one wrong drawer and you see someone else's file. A database per tenant is giving every company **its own locked cabinet**. The receptionist (the subdomain + header) hands you the key to your cabinet only, and the guard checks your badge (JWT) matches that key.`,
      code: [
        {
          title: 'Choosing the tenant database per request (simplified)',
          lang: 'typescript',
          code: `const connections = new Map<string, Connection>(); // survives between warm Lambda calls

export async function withTenant(event, handler) {
  const tenantId = event.headers['x-tenant-id'];
  if (!tenantId) return badRequest('Missing tenant');

  let conn = connections.get(tenantId);
  if (!conn) {
    const details = await loadTenantConnectionDetails(tenantId); // from secure storage
    conn = await mongoose.createConnection(details.uri).asPromise();
    connections.set(tenantId, conn);
  }
  setCurrentConnection(conn); // repositories build models on this connection
  return handler(event);
}

// in the authorizer: the token must belong to the same company
if (decodedToken.tenantId !== event.headers['x-tenant-id']) return unauthorized();`,
        },
      ],
      output: `The first request for a company opens a connection to that company's database and caches it. Later requests for the same company reuse it. Every model and query runs on that connection, and a token from another company is rejected.`,
      questions: [
        {
          q: 'What are the ways to build multi-tenancy, and which did you use?',
          a: `Shared tables with a tenantId, a schema per tenant, or a database per tenant. SkillKeepr used a database per tenant for strong isolation.`,
        },
        {
          q: 'How is the tenant identified on each request?',
          a: `From the subdomain: the frontend sends it in an x-tenant-id header, the backend connects to that tenant's database, and the JWT's tenant id must match the header.`,
        },
        {
          q: 'What are the downsides of a database per tenant?',
          a: `More databases to operate, migrations and indexes must be applied to every tenant, and many tenants means many open connections. Cross-tenant reports are also harder.`,
        },
        {
          q: 'How do you avoid reconnecting on every Lambda call?',
          a: `Keep a cache of open connections per tenant outside the handler, so warm containers reuse them.`,
        },
      ],
      spoken: `"In SkillKeepr each client company has its own MongoDB database. The company comes from the subdomain; the frontend sends it in an x-tenant-id header, and on the backend a wrapper looks up that company's connection details and opens or reuses a Mongoose connection, which we cache per tenant across warm Lambda calls. Models are built on that connection, so queries can only reach that company's data. The JWT also carries the tenant id and must match the header. The trade-off is operational: migrations and indexes have to run on every tenant database."`,
      mistakes: [
        `Describing a tenantId filter when the real design is a database per tenant.`,
        `Trusting the header alone. The token's tenant must also match, or a user could point their request at another company.`,
        `Forgetting that migrations, indexes and seed data must be applied to **every** tenant database.`,
        `Follow-up trap: "How would this scale to 10,000 tenants?" Connection counts become the limit; you would pool smarter, shard tenants across clusters, or move small tenants to a shared model.`,
      ],
      takeaway: `Subdomain → x-tenant-id → that tenant's own database (cached connection) → token tenant must match.`,
    },
    {
      id: 'rbac-four-modules',
      title: 'RBAC Across the Admin, Recruiter & Talent Modules',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: `Roles (Admin, Recruiter Admin, Recruiter, Collaborator, Talent) map to permission keys like MODULE.C/R/U/D; a decorator authorizer checks login, tenant, account status, plan and permission before every action, and the UI hides what you can't use.`,
      what: `**RBAC** (Role-Based Access Control) means: users get **roles**, roles get **permissions**, and every action checks the permission.

**The roles in SkillKeepr:** **Admin**, **Recruiter Admin**, **Recruiter**, **Collaborator** (for example an interviewer brought in for one round), and **Talent** (the candidate side, with its own login). There is also a separate **cloud-admin** role for the team that runs the platform.

**Permissions** are keys in the form \`MODULE.ACTION\`, for example \`MANAGE_JOBS.R\` (read jobs) or \`MANAGE_JOBS.C\` (create). A role-permission record lists which keys each role has.

**How a request is checked** — a **decorator** on each controller method runs these steps in order:
1. Verify the **JWT** (from an HttpOnly cookie).
2. Check the token's **company matches** the request's company.
3. Check the user is still **active**.
4. Check the **company's plan/payment status** (if the subscription lapsed, only admins can get in, to fix billing).
5. Check the **permission key** for that action against the user's role.

**In the UI**, a private route only opens a page if the **module is switched on for the plan**, the user **has the permission**, and the account is not blocked; otherwise it shows a "no access" page. Hooks like \`usePermissions\` hide buttons the user can't use.

#### Deeper version
- RBAC answers "**what may this user do?**". **Plan limits** answer "**what has this company paid for?**" (seats, interviews, parsing credits). Both are checked, in different places.
- Some rules are **ownership** rules, not role rules: for interviews, only the candidate of that interview, or a recruiter/collaborator on that round, may join.
- Tokens: a short-lived **access token** and a longer **refresh token**, both in **HttpOnly, SameSite=Strict cookies**, so JavaScript cannot read them.
- Candidates use separate auth (including social login), so talent users can never reach admin endpoints.

Resume note: your resume says "RBAC across HR, Talent, Recruiter and Admin modules". The code's roles are Admin, Recruiter Admin, Recruiter, Collaborator and Talent. Describe it with these real roles.

Adapt: say which parts you built — the authorizer, permission keys, or the UI guards.`,
      why: `Access control bugs are security bugs. Interviewers want to see that checks happen **on the server for every request**, not just by hiding buttons, and that you can separate user permissions from company plan limits.`,
      analogy: `Think of a hotel. Your **keycard** (JWT) proves who you are. The front desk checks you're staying in **this** hotel (tenant match) and haven't checked out (active user). The hotel's **membership level** decides whether the spa is open at all (plan). Your **room type** decides which floors your card opens (role permissions).`,
      code: [
        {
          title: 'A permission-checking decorator (simplified)',
          lang: 'typescript',
          code: `export function authenticateAdmin(permission?: string) {
  return (target, key, descriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (event) {
      const user = verifyAccessToken(readCookie(event, 'accessToken'));   // 1. login
      if (user.tenantId !== event.headers['x-tenant-id']) return unauthorized(); // 2. tenant
      if (!(await isActive(user.id))) return unauthorized();             // 3. active user
      if (!(await planIsActive()) && user.role !== 'Admin') return forbidden(); // 4. plan
      if (permission && !(await roleHas(user.roleId, permission))) return forbidden(); // 5. permission
      event.user = user;
      return original.call(this, event);
    };
  };
}

class JobController {
  @authenticateAdmin('MANAGE_JOBS.C')
  static async create(event) { /* ... */ }
}`,
        },
      ],
      output: `Before \`create\` runs, the decorator checks the login, the company, the user's status, the plan and finally whether the role has \`MANAGE_JOBS.C\`. Any failed step returns 401 or 403 and the handler never runs.`,
      questions: [
        {
          q: 'How did you implement RBAC?',
          a: `Roles map to permission keys like MODULE.C/R/U/D. A decorator on each controller method verifies the JWT, checks the tenant and user status, checks the plan, then checks the permission key for the role.`,
        },
        {
          q: 'Is hiding buttons in the UI enough?',
          a: `No. The UI hides what you can't use for a nicer experience, but the server checks every request; that is the real security.`,
        },
        {
          q: 'What is the difference between roles and plan limits?',
          a: `Roles decide what a user may do. Plan limits decide what the company has paid for, like seats or interview credits. Both are checked.`,
        },
        {
          q: '401 vs 403?',
          a: `401 when we don't know who you are (missing or invalid token). 403 when we know you, but you are not allowed to do this.`,
        },
      ],
      spoken: `"In SkillKeepr users have roles — Admin, Recruiter Admin, Recruiter, Collaborator, and Talent on the candidate side — and roles map to permission keys like MANAGE_JOBS.C or .R. Every controller method has an authorizer decorator that verifies the JWT from an HttpOnly cookie, checks the token's company matches the request, checks the user is active, checks the company's plan is in good standing, and finally checks the permission key. The React apps mirror this with private routes and permission hooks, but the server check is the real gate."`,
      mistakes: [
        `Only describing the UI side. The server must check every request.`,
        `Mixing up roles and plan limits.`,
        `Inventing roles. Use the real ones: Admin, Recruiter Admin, Recruiter, Collaborator, Talent (plus cloud-admin for the platform team).`,
        `Follow-up trap: "How do you stop a recruiter reading another recruiter's interview?" Ownership checks on the record itself (is this user on this round?), not just the role.`,
      ],
      takeaway: 'Roles → permission keys → a decorator that checks login, tenant, status, plan and permission on every request; the UI only mirrors it.',
    },
    {
      id: 'stripe-subscriptions-marketplace',
      title: 'Stripe Subscriptions & Add-on Marketplace',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Save a card with a SetupIntent, pay with a PaymentIntent (3D Secure), then create the Stripe subscription and our own plan record; webhooks handle renewals and failures; add-ons are subscription items or credits, and plan limits are checked in the services.',
      what: `**Stripe** handles cards and recurring billing. Our database keeps a **plan record** per company (which plan, which add-ons, start and expiry dates, limits).

**Buying or upgrading a plan:**
1. **Save a card:** the server creates a Stripe **Customer** (if new) and a **SetupIntent**; the React app shows Stripe's **PaymentElement** so the card goes straight to Stripe, never through our server.
2. **Show the price:** we calculate what's left of the current plan as a credit, plus any customer balance and add-on balances, so the user sees the real amount to pay.
3. **Pay:** we create a **PaymentIntent**; the browser confirms it, including **3D Secure** if the bank asks.
4. **Activate:** after payment succeeds we create a Stripe **invoice** (plan + add-ons, minus the previous-plan credit), mark it paid, and create the **subscription** so Stripe bills the **next** cycles automatically.
5. **Update our side:** a new plan record becomes active, the old one is closed, extra users beyond the new seat limit are deactivated, and the plan is synced to the platform admin.

**Renewals and failures** come through **webhooks** (Stripe calling our endpoint):
- **Renewal paid** → create the next period's plan record, carry over unused add-on credits, email the customer.
- **Payment failed** → email with Stripe's hosted invoice link and the decline reason.
- **Subscription ended** → move the company to the **Free** plan.

**Cancel** = cancel at the end of the period; **renew** = undo that cancellation.

#### Deeper version
**The marketplace (add-ons):** the platform team creates add-ons, bundles and coupons; each add-on becomes a Stripe **Product** with monthly and yearly **Prices** per volume tier.
- **Recurring add-ons** (extra **user seats**, **cloud storage**) are added as **subscription items**.
- **One-time add-ons** (live-interview, one-sided-interview and resume-parsing packs) become **credits**.

**Plan limits:** the plan record stores, per feature, the base count plus add-on count. Before a limited action (inviting a user, bulk upload, scheduling a live interview, parsing a resume), the service **counts usage in the current plan period** and refuses with **429** when the quota is used up. A new period starts a fresh count.

**Lapsed payments:** daily jobs send expiry reminders; after a grace date the account is marked inactive, non-admin users are blocked, and the UI only shows the billing pages until someone pays.

Adapt: say which parts you built — checkout, webhooks, add-ons, limits or the billing UI.`,
      why: `Billing touches money, so interviewers probe hard: how card data stays out of your servers (PCI), how you keep your database in sync with Stripe, how renewals and failed payments work, and how paid features are enforced.`,
      analogy: `A gym membership. You give the front desk your card once (SetupIntent). You pay for this month, with your bank sometimes texting a code (PaymentIntent + 3D Secure). They write your membership card (plan record) and set up automatic monthly payments (subscription). Extras — a locker or personal-training sessions — are add-ons. If a payment bounces, they email you; if you stop paying, your card only opens the front desk until you sort it out.`,
      code: [
        {
          title: 'Pay, then activate the plan (simplified)',
          lang: 'typescript',
          code: `// 1. Server: create a PaymentIntent for the amount after credits
const intent = await stripe.paymentIntents.create({
  amount: amountDueInCents,
  currency: 'usd',
  customer: customerId,
  payment_method: defaultCardId,
  payment_method_options: { card: { request_three_d_secure: 'any' } },
  setup_future_usage: 'off_session',
});
// 2. Browser: stripe.confirmCardPayment(intent.client_secret) — handles 3D Secure

// 3. Server: after the intent has succeeded
await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: planPriceId }, { price: seatAddOnPriceId, quantity: extraSeats }],
  trial_period_days: daysInFirstPeriod, // first period already paid
  proration_behavior: 'none',
});
await PlanRepository.activateNewPlan(companyId, { plan, addOns, startDate, expiryDate });`,
        },
        {
          title: 'Webhook: handle a renewal (simplified)',
          lang: 'typescript',
          code: `export async function stripeWebhook(rawBody: string, signature: string) {
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret); // verify first
  switch (event.type) {
    case 'invoice.payment_succeeded':
      if (event.data.object.billing_reason === 'subscription_cycle') await startNextPeriod(event);
      break;
    case 'invoice.payment_failed':
      await emailPaymentFailed(event); // includes the hosted invoice link
      break;
    case 'customer.subscription.deleted':
      await moveToFreePlan(event);
      break;
  }
}`,
        },
      ],
      output: `The first block takes the payment (with 3D Secure if needed), then creates a subscription whose first period is already paid, and saves the new plan record. The second block reacts to Stripe events: a paid renewal starts the next period, a failed payment emails the customer, and an ended subscription drops the company to Free.`,
      questions: [
        {
          q: 'How do you keep card details off your servers?',
          a: `Stripe's PaymentElement collects the card in the browser and sends it to Stripe. We only store Stripe ids (customer, payment method, subscription).`,
        },
        {
          q: 'Why use webhooks?',
          a: `Renewals and failed payments happen later, without the user present. Stripe calls our webhook so we can extend the plan, send emails, or downgrade the account.`,
        },
        {
          q: 'How did add-ons work?',
          a: `Recurring add-ons like extra seats and storage were subscription items; one-time packs like interview or resume-parsing credits were stored as credits on the plan.`,
        },
        {
          q: 'How were usage limits enforced?',
          a: `The plan record holds base plus add-on counts per feature. Before a limited action the service counts usage in the current period and returns 429 when the quota is used up.`,
        },
        {
          q: 'What should a production webhook handler always do?',
          a: `Verify the signature on the raw body, handle duplicate deliveries safely (idempotency by event id), and return an error status when processing fails so Stripe retries.`,
        },
      ],
      spoken: `"For SkillKeepr billing, the browser saves a card through a SetupIntent and Stripe's PaymentElement, so card data never touches our servers. To buy or upgrade, we calculate the credit left on the current plan, take payment with a PaymentIntent that supports 3D Secure, and once it succeeds we create the invoice and the Stripe subscription, then activate a new plan record. Renewals, failed payments and cancellations come through webhooks. Add-ons are either subscription items, like extra seats, or credit packs, like interview credits, and each limited action checks usage against the plan before it runs."`,
      mistakes: [
        `Saying "we used Stripe Checkout". SkillKeepr used **SetupIntents + PaymentIntents + Subscriptions** with its own checkout UI.`,
        `Forgetting our own database. Stripe holds the money side; our **plan record** holds what the company may use.`,
        `Not mentioning 3D Secure. Many cards need an extra bank check, handled when confirming the PaymentIntent.`,
        `Follow-up trap: "What if the webhook arrives twice?" Store processed event ids and skip repeats; make each handler idempotent.`,
      ],
      takeaway: 'SetupIntent to save a card → PaymentIntent to pay → subscription + plan record → webhooks for renewals and failures → add-ons and limits checked in services.',
    },
    {
      id: 'boolean-search-engine',
      title: 'Boolean Search Engine on MongoDB',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: `A hand-written parser turns AND / OR / NOT, quotes and brackets into nested $and / $or / $nor regex conditions on a combined text field, with a $text pre-filter, separate field filters, pagination, and one aggregation for filter counts.`,
      what: `Recruiters search candidates with **Boolean queries**, for example:

\`(react OR angular) AND "full stack" NOT php\`

**How a search works, step by step:**
1. **The UI checks the syntax** first (words and operators alternate, quotes are closed).
2. The API **validates** the request.
3. A **hand-written parser** reads the query:
   - It lowercases it and splits it into **tokens**, keeping **"quoted phrases"** together.
   - It walks the tokens with a **stack**: \`AND\` and \`OR\` combine terms, \`NOT\` marks the next term as excluded, brackets open and close groups.
   - A plain **word** becomes a **whole-word, case-insensitive regex**, and it also matches simple word forms (for example \`develop\`, \`developer\`, \`developing\`).
   - A **phrase** becomes a regex for that exact phrase.
   - The result is a nested MongoDB query using \`$and\`, \`$or\` and \`$nor\` (for NOT).
4. The repository **adds the field filters** the recruiter picked in the sidebar — location, experience range, candidate type, speciality, workplace type, job type, "has video", and so on — combined with \`$and\`.
5. A **\`$text\` search** on the keywords is added as a **pre-filter**, so MongoDB's text index narrows the candidates before the regex checks.
6. Results come back with **skip/limit pagination**, a chosen sort, and case-insensitive collation.

#### Deeper version
- **Searchable text:** every candidate has a **combined text field** (resume text plus profile text). Mongoose **hooks** rebuild it in the background after a save or update, so the search reads one field instead of many.
- **Filter counts:** the sidebar numbers ("12 in Bangalore", "8 remote") come from **one aggregation**: a \`$match\` followed by a single \`$group\` with a conditional \`$sum\` per filter — one pass instead of many count queries.
- **Indexes:** **single-field indexes** on the common filter fields (type, speciality, experience, location, workplace type, dates) and a **text index** on the combined text field.
- **Safety:** user words are **escaped** before going into a regex, so special characters are treated as text.

Resume note: your resume says "MongoDB aggregation and **compound indexes**". In the code, the search uses \`find\` with nested \`$and/$or/$nor\` plus a text index, the **counts** use aggregation, and the indexes are **single-field and text** indexes. Adjust the wording, or say a compound index (for example on candidate type + experience + updated date) is what you would add next.

Adapt: say which parts you wrote (parser, filters, counts, indexes).`,
      why: `Search is a classic deep-dive: parsing, query building, indexing and performance. Being able to walk through a real query from text to MongoDB to results shows strong backend skills.`,
      analogy: `The parser is like a librarian turning "books about React or Angular, about full stack, but not PHP" into a precise list of shelf rules. The text index is the library catalogue that quickly finds books mentioning those words; the regex rules are the librarian then checking each book properly.`,
      code: [
        {
          title: 'From Boolean query to MongoDB query (simplified)',
          lang: 'typescript',
          code: `// "(react OR angular) AND \\"full stack\\" NOT php"
const tokens = query.toLowerCase().match(/"[^"]+"|\\S+/g); // keeps "full stack" together

function termToCondition(term: string) {
  const isPhrase = term.startsWith('"');
  const text = escapeRegex(term.replace(/"/g, ''));
  const pattern = isPhrase ? '(^|\\\\W)' + text + '(\\\\W|$)' : '\\\\b(' + wordForms(text).join('|') + ')\\\\b';
  return { rawText: { $regex: pattern, $options: 'i' } };
}

// After the stack-based parse:
const mongoQuery = {
  $and: [
    { $or: [termToCondition('react'), termToCondition('angular')] },
    termToCondition('"full stack"'),
    { $nor: [termToCondition('php')] },
  ],
};

const results = await Candidates.find({
  $text: { $search: 'react angular full stack' }, // fast pre-filter via the text index
  ...mongoQuery,
  ...sidebarFilters,                              // location, experience, type...
}).sort(sort).skip(page * size).limit(size).collation({ locale: 'en', strength: 1 });`,
        },
        {
          title: 'All filter counts in one aggregation (simplified)',
          lang: 'typescript',
          code: `const [counts] = await Candidates.aggregate([
  { $match: baseQuery },
  {
    $group: {
      _id: null,
      remote: { $sum: { $cond: [{ $eq: ['$workplaceType', 'remote'] }, 1, 0] } },
      withVideo: { $sum: { $cond: ['$hasVideo', 1, 0] } },
      senior: { $sum: { $cond: [{ $gte: ['$totalExperience', 5] }, 1, 0] } },
    },
  },
]);`,
        },
      ],
      output: `The query becomes "(react OR angular) AND the phrase 'full stack' AND NOT php", each word as a whole-word regex on the combined text field. The text index narrows the set first, the sidebar filters are added, and the page of results is returned. The second block counts every sidebar filter in one pass.`,
      questions: [
        {
          q: 'How did you parse the Boolean query?',
          a: `A hand-written tokenizer keeps quoted phrases together, then a stack-based parser handles AND, OR, NOT and brackets, building nested $and, $or and $nor conditions.`,
        },
        {
          q: 'How did you keep it fast?',
          a: `A combined text field per candidate, a $text pre-filter using a text index, single-field indexes on the common filters, pagination, and one aggregation for all the filter counts.`,
        },
        {
          q: 'Why not Elasticsearch or Atlas Search?',
          a: `The data was already in MongoDB per tenant, and the Boolean rules were simple enough to build in-house without syncing data to another system. At much larger scale a dedicated search engine would be the next step.`,
        },
        {
          q: 'How do you stop a search term breaking the regex?',
          a: `Escape special characters in user input before building the regex, and validate the query shape before parsing.`,
        },
      ],
      spoken: `"Recruiters could type Boolean queries like react OR angular AND a quoted phrase, NOT php. A hand-written tokenizer keeps quoted phrases together, then a stack-based parser turns AND, OR, NOT and brackets into nested $and, $or and $nor conditions, with each word as an escaped whole-word regex on a combined text field that Mongoose hooks keep up to date. We add a $text pre-filter so the text index narrows the set, AND in the sidebar filters, paginate, and compute every filter count in a single aggregation with conditional sums."`,
      mistakes: [
        `Claiming compound indexes. The code uses single-field and text indexes; adjust the wording or present a compound index as your next improvement.`,
        `Not escaping user input in regexes.`,
        `Forgetting operator precedence. Be ready to explain how AND and OR combine in your parser.`,
        `Follow-up trap: "Why is a leading-wildcard regex slow?" It cannot use a normal index and has to scan; that is why the $text pre-filter matters.`,
      ],
      takeaway: `Tokenize → stack-parse AND/OR/NOT → nested $and/$or/$nor regexes + $text pre-filter + field filters → paginate; counts via one $group.`,
    },
    {
      id: 'node-16-to-18-migration',
      title: 'Leading a Node.js Runtime Upgrade (Lambda)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Upgrading Node on AWS Lambda means changing the runtime in the Serverless config, the build images and local versions, upgrading dependencies, and regression testing before rolling out environment by environment.',
      what: `SkillKeepr's backends run as **AWS Lambda functions** deployed with the **Serverless Framework**. Upgrading Node there is not just "install a new Node". You must change every place the version is pinned:

1. **Lambda runtime**: the \`runtime\` setting in the shared Serverless config (for example \`nodejs18.x\` → \`nodejs22.x\`).
2. **Build environment**: the Node version in the CodeBuild build specs that run \`npm install\` and \`serverless deploy\`.
3. **Local and CI versions**: \`.nvmrc\`, the \`engines\` field in \`package.json\`, and the Node version in GitHub Actions.
4. **Types and tooling**: \`@types/node\`, TypeScript and webpack/babel config.
5. **Dependencies**: upgrade packages that break on the new Node, then run the tests.

**Resume note:** the code today shows the services on **Node 22** (Lambda \`nodejs22.x\`, CodeBuild Node 22, \`.nvmrc\` 22), and the READMEs still mention **Node 18**. Node 16 only appears in an old, retired server script. So the codebase shows an **18 → 22** upgrade. Adapt: confirm which upgrade you personally led (16 → 18, 18 → 22, or both) and make the resume match.

#### Deeper version
Things that commonly break on a Node runtime upgrade:
- **AWS SDK**: the newer Lambda runtimes (Node 18+) ship **AWS SDK v3** built in, not v2. If the code uses \`aws-sdk\` v2, you must **bundle it yourself** or migrate calls to the modular v3 clients (\`@aws-sdk/client-s3\` etc.). SkillKeepr still uses v2, so it has to be packaged with the function.
- **OpenSSL 3** (Node 17+): old crypto settings, legacy webpack hashing and some TLS options fail.
- **Native modules** must be rebuilt for the new version and CPU architecture (the functions run on **arm64**).
- **Behaviour changes**: global \`fetch\`, stricter \`URL\` parsing, different default DNS ordering.

A safe rollout: upgrade one service in **develop**, run the unit tests and a manual regression of the main flows (login, billing, interviews, uploads), then QA, staging and production one at a time. Keep the old runtime config ready to redeploy for rollback.`,
      why: `Lambda runtimes reach end of support on a schedule. After that, AWS first blocks creating new functions on that runtime and later blocks updates, and you stop getting security patches. Upgrading on time keeps deploys working and the platform secure.`,
      analogy: `It is like moving a restaurant to a new building. You must check every appliance fits the new sockets (dependencies), update the address everywhere (config files), and do a test service with friends (QA) before opening to the public.`,
      code: [
        {
          title: 'Where the version is pinned (simplified)',
          lang: 'yaml',
          code: `# Serverless config shared by all Lambda functions
provider:
  name: aws
  runtime: nodejs22.x   # was nodejs18.x
  architecture: arm64

# CodeBuild build spec
phases:
  install:
    runtime-versions:
      nodejs: 22         # was 18`,
        },
        {
          title: 'AWS SDK v2 vs v3 (simplified)',
          lang: 'javascript',
          code: `// v2: one big package. Not built into Node 18+ Lambda runtimes, so it must be bundled.
import AWS from 'aws-sdk';
const s3v2 = new AWS.S3();
await s3v2.getObject({ Bucket, Key }).promise();

// v3: small modular clients, built into Node 18+ runtimes.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({});
await s3.send(new GetObjectCommand({ Bucket, Key }));`,
        },
      ],
      output: `The first snippet shows the two main places the runtime is pinned: the Lambda runtime and the build image. Both must change together. The second shows why the AWS SDK is the biggest risk: v2 code still works only if the package is bundled with the function, while v3 is the long-term fix.`,
      questions: [
        {
          q: 'What did you change to upgrade Node on Lambda?',
          a: `The Lambda runtime in the Serverless config, the Node version in the CodeBuild specs, .nvmrc / engines / CI versions, @types/node, and any dependencies that broke. Then tests and a staged rollout.`,
        },
        {
          q: 'What is the AWS SDK problem when moving to Node 18+ on Lambda?',
          a: `Node 18+ runtimes include AWS SDK v3, not v2. Code using v2 must bundle aws-sdk itself or be migrated to v3 clients.`,
        },
        {
          q: 'How did you make sure nothing broke?',
          a: `Unit tests, then manual regression of the key flows in develop and QA, then rolling out environment by environment with the old config ready for rollback.`,
        },
        {
          q: 'Why upgrade at all if everything works?',
          a: `Runtimes lose support on a schedule: no security patches, and later no deploys. It also brings performance improvements and newer language features.`,
        },
      ],
      spoken: `"Our SkillKeepr backends run as Lambda functions deployed with the Serverless Framework, so a Node upgrade meant changing the runtime in the shared Serverless config, the Node version in our CodeBuild specs, and the local and CI versions. The biggest risk was the AWS SDK: newer Lambda runtimes ship SDK v3, while our code used v2, so we had to bundle it. We upgraded dependencies, ran our tests, did a regression pass on login, billing and interviews in develop and QA, and then rolled out environment by environment."`,
      mistakes: [
        `Changing only the Lambda runtime and forgetting the build image, or the other way round.`,
        `Assuming aws-sdk v2 is available on the Node 18+ Lambda runtime. It is not; bundle it or move to v3.`,
        `Upgrading every service and environment at once with no rollback plan.`,
        `Leaving docs on the old version. Here the READMEs still say Node 18 while the code runs 22, which confuses new developers.`,
        `Follow-up trap: "Which Node version did you migrate from and to?" Answer with what you really did, and make sure it matches your resume.`,
      ],
      takeaway: 'A Lambda Node upgrade = runtime + build image + local/CI versions + dependencies + AWS SDK check + staged rollout.',
    },
    {
      id: 'jitsi-live-interviews',
      title: 'Live Interviews with Jitsi + WebSockets',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Interviews use 8x8 Jitsi as a Service: the server checks who may join and when, then signs a Jitsi JWT (staff are moderators); recordings come back by webhook and are saved to S3; API Gateway WebSockets power the live code editor and notifications.',
      what: `**Live interviews** are video calls between recruiters/interviewers and a candidate, scheduled ahead of time.

**Video:** we used **Jitsi as a Service (JaaS, by 8x8)** through the **Jitsi React SDK**. We don't run our own video servers.

**Joining a call, step by step:**
1. A recruiter **schedules** an interview with time slots. The **room name is the interview id**, so no room has to be created in advance.
2. When someone clicks **Join**, our server checks:
   - the company still has **live-interview credits** and storage on its plan,
   - a candidate is **the candidate of this interview**, or a staff member is a **recruiter or collaborator on this round**,
   - the job is still active,
   - the time is inside the **join window** (a few minutes before the start until the end).
3. Only then the server signs a **Jitsi JWT** (RS256, with our private key). **Staff join as moderators**; candidates join as normal participants.
4. The browser opens the Jitsi meeting with that token. A **lobby** (waiting room) is turned on through Jitsi's settings webhook.

**Recording:** staff calls start recording automatically. When the recording is ready, Jitsi calls our webhook; we route it to the right company, **save the file to S3** and **email the recruiters**.

#### Deeper version
**WebSockets** in SkillKeepr use the **API Gateway WebSocket API** (not Socket.IO), and they are **not** used for video signalling — Jitsi handles all of that. They are used for:
- a **live collaborative code editor** during technical interviews (changes are sent to everyone in the same interview and saved as history),
- **one-sided (recorded) interview** upload updates,
- **notifications** pushed to a user.

On connect we store the connection id with the user and interview; to send, the server posts to each connection id and removes dead ones. The browser reconnects automatically, and a daily job cleans up stale connections.

**Reminders:** a scheduled **Step Functions** workflow finds upcoming interviews and emails the people involved.

Resume note: your resume says "Jitsi with WebSocket-backed signalling". In the code, Jitsi does its own media signalling; the WebSockets carry the **code editor, uploads and notifications**. Phrase it that way.

Adapt: say which parts you built (join checks and tokens, recording flow, code editor, notifications).`,
      why: `Real-time features show you can work with third-party platforms, secure tokens, webhooks and WebSockets together. Interviewers like to hear how you controlled **who can join and when**.`,
      analogy: `Jitsi is a rented meeting room in a business centre. Our server is the receptionist: it checks your name is on today's guest list and that it's nearly time, then gives you a key card (Jitsi JWT) — staff get a host card (moderator). The room records the meeting and sends the tape to our office (recording webhook → S3).`,
      code: [
        {
          title: 'Issue a Jitsi token after the checks (simplified)',
          lang: 'typescript',
          code: `export async function joinInterview(user, interviewId) {
  const interview = await InterviewRepository.get(interviewId);

  await assertPlanAllows('liveInterview');                 // credits left?
  if (user.isCandidate && interview.candidateId !== user.id) throw forbidden();
  if (!user.isCandidate && !interview.panel.includes(user.id)) throw forbidden();
  if (!isInsideJoinWindow(interview.startTime, interview.endTime)) throw forbidden('Not open yet');

  const token = jwt.sign(
    {
      aud: 'jitsi', iss: 'chat', sub: jaasAppId, room: interviewId,
      context: { user: { name: user.name, moderator: !user.isCandidate } },
    },
    jaasPrivateKey,
    { algorithm: 'RS256', keyid: jaasKeyId, expiresIn: '2h' },
  );
  return { roomName: interviewId, token };
}`,
        },
      ],
      output: `The function refuses to issue a token unless the plan allows it, the user belongs to this interview, and it is time to join. Staff get \`moderator: true\`, so they can manage the room; the candidate joins as a normal participant.`,
      questions: [
        {
          q: 'Did you host Jitsi yourselves?',
          a: `No, we used 8x8's Jitsi as a Service with the Jitsi React SDK. Our server only decides who may join and signs the meeting token.`,
        },
        {
          q: 'How do you stop the wrong person joining?',
          a: `The server checks the user is the interview's candidate or on the interview panel, that the job is active and that it is inside the join window, and only then signs a short-lived Jitsi JWT.`,
        },
        {
          q: 'What were the WebSockets for?',
          a: `API Gateway WebSockets powered a live shared code editor, interview upload updates and notifications. Video signalling was handled by Jitsi itself.`,
        },
        {
          q: 'How were recordings stored?',
          a: `Recording starts automatically for staff; Jitsi calls our webhook when it is ready, and we save it to S3 and email the recruiters.`,
        },
      ],
      spoken: `"For live interviews we used 8x8's Jitsi as a Service with the React SDK. The room name is the interview id, so nothing is created in advance. When someone clicks join, the server checks the company has interview credits, that the user is this interview's candidate or on its panel, and that we're inside the join window, then signs an RS256 Jitsi token — staff as moderators. Recordings come back through a webhook and are saved to S3. Separately, API Gateway WebSockets drive a live collaborative code editor and notifications."`,
      mistakes: [
        `Saying you built WebRTC signalling yourselves. Jitsi handles the video; the WebSockets were for the code editor and notifications.`,
        `Saying "Socket.IO". It was the **API Gateway WebSocket API**.`,
        `Skipping the access checks — they are the most interesting part.`,
        `Follow-up trap: "How do you scale WebSockets on Lambda?" API Gateway holds the connections; Lambdas run only on messages, and the server sends to connection ids through the management API.`,
      ],
      takeaway: 'Server checks who and when → signs a Jitsi JWT (staff = moderators) → JaaS runs the call → recording webhook → S3; WebSockets for the code editor and notifications.',
    },
    {
      id: 'production-issues-24h',
      title: 'Resolving Critical Production Issues Within 24 Hours',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A calm incident process: acknowledge, contain, find the cause with logs, fix with a test, deploy safely, communicate, and write a short post-mortem.',
      what: `On my resume: **resolved critical production issues within 24 hours, improving platform reliability.** Interviewers will ask "tell me about a production issue you fixed".

My process (easy to remember as **A-C-D-F-L**):
1. **Acknowledge** — confirm the issue, tell the team/customer we are on it.
2. **Contain** — stop the damage first: roll back, turn off a feature flag, or apply a quick workaround.
3. **Diagnose** — logs, error tracking, reproduce on staging, find the root cause.
4. **Fix** — write a test that fails, fix the code, test passes, review, deploy.
5. **Learn** — a short post-mortem: what happened, why, how we stop it happening again.

#### Deeper version
A **realistic example story** (use it only to shape your own — **Adapt** with a real incident you remember):

*"After a release, some customers who had upgraded their plan still could not access the new module. I checked the logs by correlation id and saw the Stripe \`customer.subscription.updated\` webhook was failing signature verification for some events. The cause: a change had moved the JSON body parser above the webhook route, so the raw body was lost. I contained it by re-sending the failed events from the Stripe dashboard after the fix, fixed the middleware order, added a test that sends a signed test webhook, and deployed the same day. In the post-mortem we added an alert on webhook failure rates."*

What makes 24-hour fixes possible: **structured logs with request ids**, error alerts, a fast CI pipeline, rollback-ready deploys, and knowing the system well.

Adapt: pick one or two real incidents. Remember the symptom, how you found the cause, the fix, and what you changed afterwards. Never invent customer names or numbers.`,
      why: `Every engineer breaks production sometimes. Interviewers want to see that you stay calm, protect customers first, find root causes instead of guessing, and prevent repeats. "Within 24 hours" shows urgency and ownership.`,
      analogy: `It is like a fire in a building. First you get people out and stop the fire spreading (contain). Then the fire inspector finds what started it (diagnose). Then you fix the wiring (fix) and install a smoke alarm (learn), so next time you know earlier.`,
      code: [
        {
          title: 'Request ids + structured logs make root causes findable',
          lang: 'javascript',
          code: `import pino from 'pino';
import { randomUUID } from 'node:crypto';

const logger = pino(); // JSON logs: easy to search in any log tool

// Give every request an id, pass it back to the client, and log with it
export function requestLogger(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  req.log = logger.child({ reqId: req.id, tenantId: req.user?.tenantId, path: req.path });

  const start = Date.now();
  res.on('finish', () => {
    req.log.info({ status: res.statusCode, ms: Date.now() - start }, 'request done');
  });
  next();
}

// Central error handler: log the full error, send a safe message to the user
export function errorHandler(err, req, res, next) {
  req.log?.error({ err }, 'unhandled error');
  res.status(500).json({ error: 'Something went wrong', requestId: req.id });
}`,
        },
        {
          title: 'Short post-mortem template',
          lang: 'text',
          code: `TITLE      Upgraded customers could not access new module
IMPACT     Who was affected, for how long (Adapt: real scope)
TIMELINE   detected -> acknowledged -> contained -> fixed -> verified
ROOT CAUSE Body parser registered before the Stripe webhook route; raw body lost,
           signature verification failed for webhook events.
FIX        Restored route order; re-sent failed events; added a signed-webhook test.
PREVENTION Alert on webhook failure rate; checklist item in code review.
BLAMELESS  We focus on the process gap, not on who made the change.`,
        },
      ],
      output: `With request ids, a customer can send you the \`requestId\` from an error message, and you find every log line for that exact request in seconds — including tenant, path, status and duration. The error handler hides internal details from users but logs everything for you. The post-mortem template turns one incident into a permanent improvement (a test, an alert, a checklist item).`,
      questions: [
        {
          q: 'Tell me about a production issue you fixed.',
          a: 'Use the A-C-D-F-L structure with a real incident: symptom, how you contained it, how logs led to the root cause, the fix plus a regression test, and what you changed to prevent it. Adapt with your own story.',
        },
        {
          q: 'How do you debug a production bug you cannot reproduce locally?',
          a: 'Start from logs and the request id, compare the failing data with working data, check recent deploys and config changes, and try to reproduce on staging with production-like data (anonymised). Add more logging if needed.',
        },
        {
          q: 'Roll back or fix forward?',
          a: 'If the last deploy caused it and rollback is safe, roll back first to stop the damage, then fix calmly. Fix forward only when rollback is risky (for example after a data migration) and the fix is small and clear.',
        },
        {
          q: 'How do you prevent the same bug coming back?',
          a: 'A regression test for that exact case, an alert on the symptom, and a short blameless post-mortem with one or two concrete action items.',
        },
      ],
      spoken: `"I handled several critical production issues and usually resolved them within 24 hours. My approach is simple. First acknowledge and communicate. Then contain the damage — roll back or disable the feature if needed. Then diagnose from logs; we used structured logs with request ids, so I could follow a single failing request across the system. Then I fix it with a test that reproduces the bug, so it can't come back silently, and deploy through the normal pipeline. Finally, a short blameless post-mortem with prevention steps, like adding an alert. Staying calm and protecting customers first is the most important part."`,
      mistakes: [
        'Telling a story where you only "restarted the server". Interviewers want root cause and prevention.',
        'Blaming a teammate in the story. Keep it blameless and about the process.',
        'Fixing directly on the production server without a test or review. Even urgent fixes go through a fast, safe path.',
        'Follow-up trap: "What monitoring did you have?" Be honest about what existed (logs, error tracking, alerts) and what you would add — dashboards for error rate and latency, alerts on webhook failures.',
        'Inventing numbers like "reduced downtime by 99%". Only use numbers you can explain.',
      ],
      takeaway: 'Acknowledge, contain, diagnose from logs, fix with a test, learn with a blameless post-mortem.',
    },
    {
      id: 'architecture-docs',
      title: 'Architecture Diagrams & Technical Documentation',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'I documented complex workflows (billing, provisioning, voice pipeline) with simple diagrams, sequence flows, OpenAPI specs and decision notes — kept close to the code.',
      what: `On my resume: **created architecture diagrams and technical documentation for complex workflows and integrations.**

Good documentation answers three questions for the next engineer:
1. **What are the parts?** — a box diagram (services, databases, third parties).
2. **How does a flow work step by step?** — a **sequence diagram** (for example: user upgrades → Stripe → webhook → our DB).
3. **Why was it built this way?** — a short decision note (often called an **ADR**, Architecture Decision Record).

Plus **API docs** with **Swagger/OpenAPI** (a standard format that describes every endpoint, its inputs and outputs, and can generate an interactive page).

#### Deeper version
Rules I follow:
- **Docs as code** — Markdown and Mermaid diagrams live in the repo, so they are reviewed in PRs and change with the code.
- **One diagram, one question.** Do not put everything in one huge picture.
- **Document the tricky parts**, not the obvious: retries, idempotency, failure handling, which system is the source of truth.
- **Onboarding test** — if a new engineer can understand a flow from the doc alone, it works.

Good candidates for diagrams on my projects: Stripe subscription + webhook flow, Zoho onboarding/provisioning, the voice agent pipeline, tenant + RBAC request pipeline.

Adapt: say what tool you used (Mermaid, draw.io, Lucidchart, Excalidraw, Confluence, Notion) and which docs you wrote.`,
      why: `Complex integrations (billing, CRM, telephony) are hard to understand from code alone. Docs reduce onboarding time, prevent wrong changes, and make incidents faster to fix. It also shows senior-level communication skills.`,
      analogy: `Documentation is like a map of a city. You could explore every street yourself (read all the code), but a map shows you the main roads, and the legend explains why some roads are one-way.`,
      code: [
        {
          title: 'Mermaid sequence diagram: plan upgrade flow',
          lang: 'text',
          code: `sequenceDiagram
  actor Admin as Tenant Admin
  participant UI as React App
  participant API as SkillKeepr API
  participant S as Stripe
  participant DB as MongoDB

  Admin->>UI: Choose higher plan
  UI->>API: POST /billing/change-plan
  API->>S: subscriptions.update (create_prorations)
  S-->>API: 200 subscription
  API-->>UI: "Upgrade processing"
  S-)API: webhook customer.subscription.updated
  API->>API: verify signature + skip duplicate event
  API->>S: retrieve latest subscription
  API->>DB: update tenant plan, status, limits
  UI->>API: GET /me (refresh)
  API-->>UI: new modules unlocked`,
        },
        {
          title: 'OpenAPI (Swagger) description of one endpoint',
          lang: 'yaml',
          code: `paths:
  /api/recruiter/candidates/search:
    post:
      summary: Boolean search over this tenant's candidates
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [query]
              properties:
                query: { type: string, example: '(react OR angular) AND node NOT php' }
                page: { type: integer, default: 1 }
      responses:
        '200': { description: Matching candidates (paginated) }
        '400': { description: Invalid Boolean query }
        '403': { description: Missing permission recruiter:candidates:read }`,
        },
      ],
      output: `The Mermaid code renders as a sequence diagram in GitHub, GitLab and many doc tools. It shows a key point that code alone hides: access is granted **after the webhook**, not after the API call. The OpenAPI block documents the search endpoint — required auth, request shape, an example query, and every response code — and tools like Swagger UI turn it into an interactive "try it" page.`,
      questions: [
        {
          q: 'What kind of documentation did you write?',
          a: 'Architecture box diagrams, sequence diagrams for complex flows like Stripe billing and Zoho provisioning, OpenAPI specs for APIs, and short decision notes explaining why we chose an approach.',
        },
        {
          q: 'How do you keep docs from going out of date?',
          a: 'Keep them in the repo next to the code, update them in the same PR as the change, generate API docs from the spec, and document the "why" (which changes rarely) more than line-by-line details.',
        },
        {
          q: 'What is an ADR?',
          a: 'An Architecture Decision Record: a short note with the context, the decision, the options considered and the consequences. It explains "why" to future engineers.',
        },
        {
          q: 'How would you explain a complex flow to a non-technical stakeholder?',
          a: 'A simple box-and-arrow picture, business words instead of tech words ("payment confirmed" not "webhook event"), and focus on what the user sees and what can go wrong.',
        },
      ],
      spoken: `"I created architecture diagrams and technical documentation for our more complex workflows — things like the Stripe subscription and webhook flow, Zoho onboarding, and the voice agent pipeline. I like three levels: a box diagram for the parts, a sequence diagram for how a flow works step by step, and a short decision note for why we built it that way. For APIs we used Swagger and OpenAPI. I prefer docs as code — Markdown and Mermaid in the repo — so they're reviewed and updated in the same pull request. It made onboarding easier and incidents faster to debug."`,
      mistakes: [
        'One giant diagram with every box and arrow. Nobody can read it. One diagram should answer one question.',
        'Docs in a separate wiki that nobody updates. Keep them close to the code and part of PR reviews.',
        'Documenting only the "happy path". The valuable parts are failures, retries and sources of truth.',
        'Follow-up trap: "Draw your architecture right now." Practise drawing the OCTAGNT and SkillKeepr diagrams on paper or a whiteboard in under 3 minutes.',
      ],
      takeaway: 'Box diagram for parts, sequence diagram for flows, decision notes for "why" — all kept in the repo.',
    },
    {
      id: 'testing-and-quality',
      title: 'Testing Strategy: Jest, pytest, Playwright & Code Quality',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'SkillKeepr: Jest unit tests with repository-level mocks and SonarQube scans. OCTAGNT: pytest with real Postgres integration tests, Vitest + contract tests and Playwright end-to-end tests in CI.',
      what: `The two products tested in different ways.

**SkillKeepr (TypeScript on Lambda)**
- **Jest + ts-jest** unit tests for controllers and services.
- The database is **mocked at the repository level**: tests replace the repository functions (and the shared DB connection) with Jest mocks, so a service test checks business logic without a real MongoDB.
- **SonarQube** scans run on pushes and pull requests for code smells and coverage.
- Coverage thresholds were **set low** as a starting point, so the gate catches big drops but does not block work.
- The team wrote **testing guides and prompt templates** so AI assistants generate tests in a consistent style.

**OCTAGNT (Python + React)**
- **pytest** with **ruff** (lint) and **mypy** (strict type checks) in CI.
- **Integration tests** run against a **real Postgres** in CI, after running the database migrations and seed data.
- The voice service has unit tests for turn detection, prompt building, scoring, the webhook sender and SMS consent, plus tests against a local S3 emulator.
- The UI uses **Vitest + Testing Library**, **contract tests** that check the API shapes the UI expects, and **Playwright** end-to-end tests (smoke, regression, accessibility with axe, performance and visual).

#### Deeper version
The idea is the **testing pyramid**: many fast unit tests, fewer integration tests, and a small number of slow end-to-end tests.
- **Mocking at the repository level** keeps service tests fast and focused, but it cannot catch query mistakes, so you need some integration tests against a real database.
- **Contract tests** protect the boundary between UI and API: if the backend changes a field name, the UI test fails before production.
- **Static checks** (TypeScript, mypy, linters) catch whole classes of bugs before tests even run.
- A quality gate only helps if CI **blocks merges** when it fails.`,
      why: `Tests let you change code with confidence: refactors, dependency upgrades and runtime upgrades. Interviewers want to know you test the right things at the right level, not just that you "wrote some tests".`,
      analogy: `Unit tests are checking each ingredient. Integration tests are tasting the sauce. End-to-end tests are serving the full dish to a guest. You need all three, but you taste ingredients far more often than you serve full meals.`,
      code: [
        {
          title: 'Jest service test with a mocked repository (simplified)',
          lang: 'typescript',
          code: `import { getActivePlan } from '../repository/payment-plans';
import { canAddUser } from '../services/user-service';

jest.mock('../repository/payment-plans'); // no real MongoDB

test('blocks a new user when the seat limit is reached', async () => {
  (getActivePlan as jest.Mock).mockResolvedValue({ seats: { limit: 5, used: 5 } });
  await expect(canAddUser('tenant-a')).resolves.toBe(false);
});`,
        },
        {
          title: 'Playwright end-to-end smoke test (simplified)',
          lang: 'typescript',
          code: `import { test, expect } from '@playwright/test';

test('recruiter can log in and see the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('recruiter@example.com');
  await page.getByLabel('Password').fill('test-password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});`,
        },
      ],
      output: `The Jest test runs in milliseconds because the repository is mocked; it proves the seat-limit rule without a database. The Playwright test drives a real browser through login and checks the dashboard appears, catching problems no unit test can see, like a broken route or a wrong API URL.`,
      questions: [
        {
          q: 'How did you test code that talks to MongoDB?',
          a: `In SkillKeepr, by mocking the repository layer and the DB connection with Jest, so services are tested in isolation. The trade-off is that query bugs need integration tests against a real database.`,
        },
        {
          q: 'What is a contract test?',
          a: `A test that checks the shape of data passed between two systems, for example that the API response has the fields the UI uses. It fails early when one side changes.`,
        },
        {
          q: 'What ran in CI?',
          a: `OCTAGNT: lint, strict type checks and pytest (with Postgres integration tests) for Python; eslint, tsc, Vitest and contract tests for the UI. SkillKeepr: SonarQube scans, with Jest run by developers.`,
        },
        {
          q: 'What would you improve?',
          a: `Raise coverage thresholds gradually, run tests as a required CI gate on every repo, and add integration tests against a real MongoDB for the most important queries.`,
        },
      ],
      spoken: `"The two products tested differently. In SkillKeepr we used Jest with ts-jest, mocking the repository layer so service tests check business rules without a database, and SonarQube scanned every pull request. In OCTAGNT, CI ran ruff, strict mypy and pytest, including integration tests against a real Postgres after migrations. The UI had Vitest, contract tests that check the API shapes, and Playwright end-to-end tests including accessibility checks. If I improved one thing, I'd make tests a required gate everywhere and raise coverage step by step."`,
      mistakes: [
        `Only mocking. Mocked repositories cannot catch a wrong query; add integration tests for important queries.`,
        `Chasing 100% coverage on trivial code instead of testing the risky business rules (billing, permissions, limits).`,
        `Having tests that CI does not run. A test suite that is not a merge gate slowly rots.`,
        `Follow-up trap: "How do you test a webhook?" Send a signed sample event to the handler in a test, and check the DB change and that a repeated event does nothing twice.`,
      ],
      takeaway: 'Right test at the right level: mocked unit tests, real-database integration tests, contract tests, and a few end-to-end tests, all enforced in CI.',
    },
    {
      id: 'octagnt-challenges',
      title: 'OCTAGNT: Challenges and How I Solved Them',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Real problems from the code: voice latency, natural turn-taking and interruptions, voicemail, unreliable AI output, long speech streams, duplicate events and AI cost.',
      what: `Pick **two or three** and tell them as stories (problem → what I tried → result).

**1. Voice latency (awkward silence)**
- Problem: waiting for the full AI reply, then converting it all to speech, left long pauses.
- Fix: stream everything. Claude's reply is cut at the first phrase break and sent to text-to-speech immediately, while Claude keeps writing. The stages run in parallel.

**2. Turn-taking and interruptions**
- Problem: the agent either cut candidates off or waited too long; and it kept talking when the candidate interrupted.
- Fix: voice activity detection plus **adaptive endpointing** (different waits depending on context), and **barge-in** — stop speaking and clear Twilio's queued audio.

**3. Voicemail and wrong people**
- Problem: calls reaching answering machines wasted AI calls and produced junk results.
- Fix: Twilio answering-machine detection (leave a short message, skip analysis), and simple rules to end the call politely for "wrong person" or "please stop calling".

**4. Unreliable AI output**
- Problem: the model sometimes wrapped JSON in extra text or failed under load.
- Fix: temperature 0, strict JSON-only prompts, a tolerant parser, retries with backoff, and **heuristic fallbacks** so scoring never fully fails.

**5. Long speech streams**
- Problem: streaming speech recognition has a time limit per stream.
- Fix: restart the stream before the limit, keeping the conversation going.

#### Deeper version
- **Duplicate events:** webhooks and queue messages can arrive twice; handlers upsert by id.
- **Stuck calls:** a watchdog marks calls that never connected so they don't block the pipeline.
- **Cost:** a credit per call, token usage tracked per request, and skipping analysis for voicemail.
- Adapt: choose the stories you were personally part of, and add one number if you remember it (e.g. how much faster the first reply became).`,
      why: `"Tell me about a challenge" tests problem-solving. Real, specific problems with clear fixes are far more convincing than generic ones.`,
      analogy: `Building the voice agent is like training a new receptionist: first they pause too long, then they talk over callers, then they leave messages on voicemail as if a person answered. Each fix teaches them one more manner.`,
      code: [
        {
          title: 'Speak the first phrase early (simplified)',
          lang: 'python',
          code: `buffer = ""
async for token in claude.stream(history):
    buffer += token
    if ends_phrase(buffer):            # ".", "?", "," after enough words
        await speak(buffer)            # TTS + send to Twilio right away
        buffer = ""
if buffer:
    await speak(buffer)`,
        },
      ],
      output: `Instead of waiting for the whole reply, each phrase is spoken as soon as it is complete, so the candidate hears the first words much sooner.`,
      questions: [
        {
          q: 'What was the hardest technical problem?',
          a: `Making the voice conversation feel natural: low latency through streaming, good turn detection with adaptive endpointing, and barge-in handling.`,
        },
        {
          q: 'How did you make AI scoring reliable?',
          a: `Temperature 0, strict JSON prompts, a tolerant parser, retries with backoff, and heuristic fallbacks when the AI call still fails.`,
        },
        {
          q: 'How did you test voice changes?',
          a: `Unit tests for endpointing, turn management, prompt building and the webhook sender, plus real test calls before release.`,
        },
      ],
      spoken: `"The hardest part was making the voice agent feel natural. At first there were long pauses, because we waited for the whole AI reply. I changed it to stream: as soon as Claude finishes a phrase, we turn it into speech and play it while Claude keeps writing. We also tuned turn detection with voice activity detection and adaptive waits, and added barge-in, so if the candidate interrupts we stop talking and listen. Another issue was voicemail; we used Twilio's machine detection to skip those calls and save AI cost."`,
      mistakes: [
        `Telling a challenge with no result. End with what improved.`,
        `Picking a problem you did not work on. Choose ones you can answer follow-ups about.`,
        `Being vague ("it was slow"). Say what was slow and exactly what you changed.`,
        `Follow-up trap: "What would you do differently?" For example: measure latency per stage from day one, and use schema-enforced AI output.`,
      ],
      takeaway: 'Best stories: streaming to cut latency, endpointing + barge-in for natural turns, voicemail detection, and reliable AI output with fallbacks.',
    },
    {
      id: 'skillkeepr-challenges',
      title: 'SkillKeepr: Challenges and How I Solved Them',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Real SkillKeepr challenges: keeping Stripe and the database in sync, enforcing plan limits, per-tenant database connections on Lambda, Boolean search parsing, and live interview access rules.',
      what: `Pick 2-3 of these and tell each as **problem → what I did → result**. Adapt: keep only the ones you really worked on.

**1. Keeping Stripe and our database in sync**
Problem: a purchase touches a PaymentIntent, an invoice, a subscription and our own plan record; renewals and failed payments arrive later as webhooks. Solution: a clear order of steps (charge, then build the invoice with plan, add-ons and the unused balance as a credit line, mark it paid, create the subscription, then write the new plan record and close the old one), plus webhook handlers for renewal, failed payment and cancellation.

**2. Plan-based limits**
Problem: each plan allows a number of user seats, live interviews, one-sided video interviews, resume parses and storage. Solution: limits are stored on the tenant's plan record; usage is counted for the current plan period; a shared check (\`checkModuleRestriction\`) is called before each limited action and returns "limit reached" (HTTP 429 for parsing). Add-ons increase the limit; a new plan period resets usage naturally.

**3. Database per tenant on Lambda**
Problem: every request must talk to the right company's database without reconnecting each time. Solution: resolve the tenant from the request, load its connection details once, and cache Mongoose connections per tenant across warm invocations.

**4. Boolean search**
Problem: recruiters wanted queries like \`(react OR angular) AND "node js" NOT php\`. Solution: a tokenizer that keeps quoted phrases together and a stack-based builder that turns the query into MongoDB \`$and\` / \`$or\` / \`$nor\` conditions, with a text-index prefilter.

**5. Live interview access**
Problem: only the right people should join, only at the right time. Solution: before issuing a signed Jitsi token, check the user's role in that interview round, the job status, the time window and the plan's interview limit.

#### Deeper version
For each story, add what you would do better now: idempotent webhook handling with stored event IDs, tests for the search parser, and automated migrations across all tenant databases.`,
      why: `"Tell me about a challenge" checks problem solving and honesty. Real, specific problems from your codebase are far more convincing than generic ones.`,
      analogy: `It is like being the accountant for a shop that also gets payments by post. You must record each sale the same way every time, and when a cheque bounces days later (a failed-payment webhook), your books must still end up correct.`,
      code: [
        {
          title: 'Plan limit check before an action (simplified)',
          lang: 'typescript',
          code: `async function scheduleLiveInterview(tenantId: string, data: InterviewInput) {
  const plan = await PlanRepo.getActive(tenantId);
  const used = await InterviewRepo.countBetween(tenantId, plan.startDate, plan.expiryDate);
  const limit = plan.features.liveInterview.count; // base count + add-on count

  if (limit !== 'Unlimited' && used >= limit) {
    throw new AppError('Live interview limit reached for this plan', 429);
  }
  return InterviewRepo.create(tenantId, data);
}`,
        },
      ],
      output: `The check counts interviews in the current plan period and compares them with the plan's limit, which already includes any purchased add-ons. When the limit is reached, the request fails with a clear error and the UI shows an upgrade option.`,
      questions: [
        {
          q: 'What was the hardest bug or challenge in SkillKeepr?',
          a: `Keeping Stripe and our plan records in sync across purchases, add-ons, renewals and failed payments, because events happen in different places and at different times.`,
        },
        {
          q: 'How did you enforce plan limits?',
          a: `Limits live on the tenant's plan record; usage is counted for the current period; a shared check runs before each limited action and returns a clear "limit reached" error.`,
        },
        {
          q: 'How did usage reset each month?',
          a: `Each renewal creates a new plan record with new start and end dates, and usage is counted only inside the current dates, so it resets without a reset job.`,
        },
        {
          q: 'What would you do differently?',
          a: `Store processed webhook event IDs so repeats are ignored, add tests for the search parser, and automate migrations across tenant databases.`,
        },
      ],
      spoken: `"One challenge in SkillKeepr was keeping Stripe and our database in sync. A purchase involves a payment, an invoice, a subscription and our own plan record, and renewals or failed payments arrive later as webhooks. I made the steps run in a fixed order and handled renewal, failure and cancellation events. Another was plan limits: seats, interviews, resume parses and storage. Limits live on the tenant's plan, usage is counted inside the current plan period, and a shared check runs before every limited action, so add-ons raise the limit and renewals reset usage naturally."`,
      mistakes: [
        `Telling a challenge with no technical detail ("the deadline was tight").`,
        `Claiming a perfect solution. Mention what you would improve.`,
        `Picking a challenge you did not personally work on.`,
        `Follow-up trap: "What if a webhook arrives twice?" Explain idempotency: store the Stripe event ID and skip events you have already processed.`,
      ],
      takeaway: 'Tell real SkillKeepr problems (billing sync, plan limits, tenant connections, search, interview access) as problem → solution → improvement.',
    },
    {
      id: 'frontend-work-on-projects',
      title: 'My Frontend Work: React, Redux-Saga, Mantine & Plan-Aware UI',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'SkillKeepr: React 18 + Redux-Saga + Mantine with a shared core UI library, permission- and plan-aware routes, cookie auth and a tenant header. OCTAGNT: React + Vite + TypeScript with Redux Toolkit, sagas, React Query, Tailwind and shadcn.',
      what: `**SkillKeepr** has three React apps (HR/recruiter, candidate, super-admin) that share one **core UI library** (a git submodule) with components, hooks and utilities.
- **React 18 + Redux + Redux-Saga**: each page **injects its own reducer and saga** when it loads, so the store stays small.
- **Mantine** components (with some styled-components).
- **Plan- and permission-aware UI**: a \`PrivateRoute\` checks three things before showing a page: the module is enabled for the company's plan, the user has the right permission, and the account is not blocked for payment. Hooks like \`usePermissions\` hide buttons the user cannot use, and an upgrade modal appears when a limit is reached.
- **API calls**: a small \`fetch\` wrapper sends cookies (\`credentials: 'include'\`) and adds the **tenant header** taken from the subdomain. No token is kept in JavaScript.
- **Live interviews** use the Jitsi (8x8 JaaS) React SDK, and a native **WebSocket** brings real-time notifications and the shared code editor.

**OCTAGNT** is one React app built with **Vite + TypeScript**.
- **Redux Toolkit + redux-saga** for app state, **TanStack React Query** for server data and caching.
- **Tailwind v4 + shadcn-style components** (Radix primitives), react-hook-form + zod for forms.
- **axios** client with cookie auth and a 401 interceptor that logs the user out once.
- Routes are scoped by tenant slug (\`/:tenantSlug/...\`).

#### Deeper version
- **Why sagas?** Long, multi-step flows (start a payment, confirm it, then refresh the plan) are easier to read as generator functions, and they can be cancelled.
- **Why React Query too (OCTAGNT)?** Server data (candidates, jobs) needs caching, refetching and loading states; React Query handles that, so Redux keeps only UI and session state.
- **Cookie auth** keeps tokens out of JavaScript, which protects them from XSS theft; the trade-off is that you need CSRF care (SameSite cookies).
- **UI permission checks are for user experience only.** The server always checks permissions again.`,
      why: `Interviewers for full-stack roles check that you can build real UI, not just APIs: state management, routing, forms, and how the UI reflects permissions and billing.`,
      analogy: `The plan-aware UI is like a hotel key card. The lobby screen shows only the floors your card opens (the UI hides features), but every door still checks the card itself (the server checks permissions).`,
      code: [
        {
          title: 'Plan- and permission-aware route (simplified)',
          lang: 'jsx',
          code: `function PrivateRoute({ module, privilege, children }) {
  const { isModuleEnabled, hasPermission, isPlanBlocked } = useAccess();

  if (isPlanBlocked && module !== 'settings') return <Redirect to="/settings/subscription" />;
  if (!isModuleEnabled(module) || !hasPermission(privilege)) return <Forbidden />;
  return children;
}

// Usage
<PrivateRoute module="interviews" privilege="MANAGE_INTERVIEWS.R">
  <InterviewList />
</PrivateRoute>`,
        },
        {
          title: 'Fetch wrapper with cookies and tenant header (simplified)',
          lang: 'javascript',
          code: `export async function request(path, options = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    credentials: 'include',                 // send the HttpOnly auth cookies
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': getTenantFromSubdomain(), // which company's data
      ...options.headers,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}`,
        },
      ],
      output: `The route component shows nothing the user cannot use: a blocked account is sent to the subscription page, and a missing module or permission shows a 403 page. The fetch wrapper means every API call automatically carries the login cookies and the company identifier, so page code stays simple.`,
      questions: [
        {
          q: 'Why Redux-Saga instead of thunks?',
          a: `Multi-step async flows like payments read clearly as sagas and can be cancelled or retried; thunks get messy for long flows.`,
        },
        {
          q: `How did the UI react to the customer's plan?`,
          a: `Routes and components checked whether the module was enabled and the user had permission; when a limit was reached, an upgrade modal appeared; a blocked account could only open the subscription page.`,
        },
        {
          q: 'Where did you store the auth token?',
          a: `In HttpOnly cookies set by the server, so JavaScript never reads them. The UI only knew "logged in or not".`,
        },
        {
          q: 'Why use both Redux and React Query in OCTAGNT?',
          a: `React Query manages server data (cache, refetch, loading); Redux keeps client state and multi-step flows. Each tool does what it is best at.`,
        },
      ],
      spoken: `"On SkillKeepr I worked on React 18 apps with Redux-Saga and Mantine, sharing a core UI library across the HR, candidate and admin apps. Pages inject their own reducers and sagas, and routes are plan- and permission-aware: a page only shows if the company's plan includes the module and the user has the permission, and a blocked account can only reach the subscription page. API calls use cookies plus a tenant header from the subdomain. On OCTAGNT the UI is React with Vite and TypeScript, Redux Toolkit with sagas, React Query for server data, and Tailwind with shadcn components."`,
      mistakes: [
        `Trusting UI checks for security. Hiding a button is UX; the server must check permissions too.`,
        `Storing JWTs in localStorage when HttpOnly cookies are available.`,
        `Putting all server data in Redux by hand when a data-fetching library would handle caching and refetching.`,
        `Follow-up trap: "What happens when the access token expires mid-session?" The server refreshes it from the refresh cookie, or the client's 401 handler logs the user out cleanly.`,
      ],
      takeaway: 'Shared component libraries, saga-driven flows, cookie auth and plan-aware routes that mirror (but never replace) server checks.',
    },
    {
      id: 'octagnt-why-x-over-y',
      title: 'OCTAGNT: Why X over Y? (Separate voice service, ECS, Claude, Twilio, PostgreSQL)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Defend each choice with trade-offs: voice as its own service, a stateless scoring engine, ECS containers, Claude for AI, Twilio + Google for phone audio, PostgreSQL with row-level security.',
      what: `**1. Voice as a separate service, not part of the API**
- Phone calls hold a **WebSocket open for minutes** and process real-time audio. Normal API requests last milliseconds.
- Separate service = a voice bug or call spike cannot slow the recruiter dashboard, and it scales on its own.
- Trade-off: more moving parts (webhooks between services, separate deploys).

**2. A stateless scoring engine**
- Pure logic, no database: easy to test, easy to scale, and the API stays the only owner of data.
- Trade-off: the API must send all the inputs on each call.

**3. ECS containers, not Lambda**
- Long-running WebSockets, background workers and steady traffic fit **containers** better than short-lived functions with time limits.
- Trade-off: you manage task sizes and scaling rules.

**4. Claude (small, fast model) for AI**
- Fast and cheap for extraction and conversation, follows strict JSON instructions well at temperature 0.
- Trade-off: depends on one provider; mitigated with retries, timeouts and heuristic fallbacks.

**5. Twilio + Google speech**
- Twilio gives real phone numbers, Media Streams over WebSocket, call recording and answering-machine detection.
- Google's streaming STT has a model tuned for phone audio, and natural-sounding TTS voices.

**6. PostgreSQL with row-level security**
- Strong relational data (tenants, jobs, runs, billing), migrations with Alembic, and tenant isolation enforced by the database itself.

#### Deeper version
Good answers always add the **alternative** and **why not**: "We could have used a speech-to-speech model end to end, but separate STT → LLM → TTS let us control each step, choose voices, and score the transcript." Adapt: if some choices were made before you joined, say so honestly.`,
      why: `"Why did you choose X?" checks whether you understand trade-offs or just used what was there. Naming the alternative and the cost of your choice shows engineering judgement.`,
      analogy: `Choosing tools is like choosing vehicles: a bus (containers) for a steady route all day, a taxi (Lambda) for short trips, and a separate ambulance (voice service) because emergencies should never wait behind regular traffic.`,
      code: [
        {
          title: 'Decision cheat-sheet',
          lang: 'text',
          code: `Choice                     Why                                   Cost
-------------------------  ------------------------------------  ---------------------------
Voice = own service        long WebSockets, real-time, isolated   more services + webhooks
Stateless engine           easy to test/scale, API owns data      inputs sent every call
ECS containers             WebSockets, workers, steady load       manage scaling
Claude (small model)       fast, cheap, good at strict JSON       provider dependency
Twilio + Google speech     phone numbers, streams, phone STT      per-minute costs
PostgreSQL + RLS           relational data, DB-enforced tenants   careful policy setup`,
        },
      ],
      output: `Read the table left to right in your answer: the choice, why it fits, and the honest cost. Interviewers value the "cost" column most.`,
      questions: [
        {
          q: 'Why not run the voice agent inside the main API?',
          a: `Calls are long-lived, real-time and bursty. Isolating them protects the main API and lets voice scale independently.`,
        },
        {
          q: 'Why containers on ECS instead of Lambda?',
          a: `Phone calls hold WebSockets for minutes and we run background workers; containers handle long-lived connections without function time limits.`,
        },
        {
          q: 'Why separate STT, LLM and TTS instead of one speech-to-speech model?',
          a: `Control: we pick each component, get a text transcript to score and audit, and can tune voices and turn-taking ourselves.`,
        },
        {
          q: 'Why PostgreSQL row-level security?',
          a: `The database itself filters rows by tenant, so one missed filter in application code is less likely to leak data.`,
        },
      ],
      spoken: `"We kept the voice agent as its own service because calls hold WebSockets open for minutes with real-time audio, and we didn't want a call spike to slow the dashboard. The scoring engine is stateless so it's easy to test and scale, while the API owns the data in PostgreSQL with row-level security per tenant. We run on ECS containers rather than Lambda because of the long connections and background workers. We use a small Claude model because it's fast and good at strict JSON, and Twilio plus Google speech for real phone calls."`,
      mistakes: [
        `Only giving benefits. Always name the cost of each choice.`,
        `Claiming you made decisions that were made before you. Say what you chose and what you inherited.`,
        `Mixing up projects: OCTAGNT is ECS + PostgreSQL; SkillKeepr is Lambda + MongoDB.`,
        `Follow-up trap: "What would you change?" For example: schema-enforced LLM output instead of prompt-only JSON, and a provider fallback for the LLM.`,
      ],
      takeaway: 'For every choice say: why it fits, what the alternative was, and what it costs.',
    },
    {
      id: 'skillkeepr-why-x-over-y',
      title: 'SkillKeepr: Why X over Y? (Lambda, DB-per-tenant, Stripe, Jitsi as a Service, Regex Search)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Defend each SkillKeepr choice with trade-offs: serverless Lambda, a MongoDB database per company, Stripe with custom proration, 8x8 Jitsi as a Service, API Gateway WebSockets and a hand-written Boolean search.',
      what: `Interviewers ask "why X and not Y?" to see if you understand trade-offs. For each choice give: **what we chose**, **why**, and **what it costs**.

**1. AWS Lambda + Serverless Framework (not a long-running Express/Hapi server)**
- Why: no servers to manage, scales per request, pay per use, easy per-service deploys.
- Cost: cold starts, a 29-second API Gateway timeout for HTTP calls, and database connections must be **cached across warm invocations**. Long jobs go to **SQS**, **Step Functions** or **AWS Batch** instead.

**2. One MongoDB database per company (not one shared database with a tenantId field)**
- Why: strong data isolation, easy per-customer backup or restore, and no risk of forgetting a tenant filter in a query.
- Cost: more connections to manage, migrations must run on every tenant database, and cross-tenant reporting is harder.

**3. Stripe (not Razorpay or building billing)**
- Why: subscriptions, saved cards with 3-D Secure, invoices, customer credit balances and webhooks for renewals and failed payments.
- Cost: the flow is complex. SkillKeepr calculates proration itself, so Stripe and the database must be kept in sync carefully.

**4. 8x8 Jitsi as a Service (not self-hosted Jitsi, Zoom or building WebRTC)**
- Why: a ready video-meeting product with a React SDK, JWT-controlled access (moderator vs guest), lobby and recording webhooks, no media servers to run.
- Cost: per-usage pricing and less control than self-hosting.

**5. API Gateway WebSockets (not Socket.IO)**
- Why: works natively with Lambda; no always-on socket server.
- Cost: you store connection IDs yourself and clean up stale ones.

**6. Hand-written Boolean search with regex + a text index (not Elasticsearch/Atlas Search)**
- Why: no extra search cluster; recruiters get AND / OR / NOT and quoted phrases on existing MongoDB data.
- Cost: regex matching does not scale like a real search engine; heavy usage would justify a search service.

#### Deeper version
A good answer also says **when you would change the choice**: move to a shared database with tenant IDs if you had thousands of tiny tenants; move search to a dedicated engine when the candidate pool grows into millions; move long-running APIs off Lambda if they keep hitting the timeout.`,
      why: `Anyone can list technologies. Explaining the trade-off shows senior thinking: you understand the cost of each decision and when it stops being the right one.`,
      analogy: `Choosing a database per tenant is like giving each family its own house instead of rooms in one big house. Privacy is excellent and one family's mess never spreads, but you now maintain many roofs and many locks.`,
      code: [
        {
          title: 'Lambda + cached connection per tenant (simplified)',
          lang: 'typescript',
          code: `const connections = new Map<string, Connection>(); // survives warm invocations

export async function handler(event) {
  const tenant = resolveTenant(event);              // from subdomain-derived header + token
  let conn = connections.get(tenant);
  if (!conn) {
    const uri = await getTenantConnectionString(tenant); // stored securely per tenant
    conn = await mongoose.createConnection(uri).asPromise();
    connections.set(tenant, conn);
  }
  return routeRequest(event, conn);
}`,
        },
        {
          title: 'Trade-off table to memorise',
          lang: 'text',
          code: `Choice                         | Main win                     | Main cost
Lambda + Serverless            | no servers, scales per call  | cold starts, 29s HTTP limit
DB per tenant                  | strong isolation             | many connections + migrations
Stripe + custom proration      | full control of pricing      | must keep Stripe and DB in sync
8x8 Jitsi as a Service         | video without media servers  | per-use cost, less control
API Gateway WebSockets         | serverless real-time         | manage connection IDs
Regex Boolean search           | no extra cluster             | limited scale vs search engine`,
        },
      ],
      output: `The handler shows the key Lambda trick for a database-per-tenant design: connections are cached in a module-level map, so a warm function reuses the tenant's connection instead of reconnecting on every request. The table is a quick revision sheet for the trade-offs.`,
      questions: [
        {
          q: 'Why a separate database per tenant?',
          a: `Isolation and per-customer operations (backup, restore, moving a customer) are simpler, and a missing tenant filter cannot leak data. The costs are connection management and running migrations on every database.`,
        },
        {
          q: 'What problems does Lambda bring with MongoDB?',
          a: `Connection storms on cold starts. Cache the connection outside the handler so warm invocations reuse it, and keep pool sizes small.`,
        },
        {
          q: 'Why not Elasticsearch for search?',
          a: `At our size, MongoDB with a text index and regex conditions was enough and avoided running another cluster. I would move to a search engine when data or query volume grows.`,
        },
        {
          q: 'Why Jitsi as a Service instead of Zoom?',
          a: `It embeds directly in our React app, and we control access with signed JWTs (moderator vs guest), lobby settings and recording webhooks, without running media servers.`,
        },
      ],
      spoken: `"SkillKeepr runs as TypeScript Lambda functions with the Serverless Framework, because we didn't want to manage servers and each service could deploy and scale on its own; the trade-off is cold starts and timeouts, so long work goes to SQS, Step Functions or Batch. Each company gets its own MongoDB database for strong isolation, at the cost of managing many connections, which we cache across warm invocations. We used Stripe for billing, 8x8 Jitsi as a Service for video so we didn't run media servers, and a hand-written Boolean search on MongoDB instead of a separate search cluster."`,
      mistakes: [
        `Saying "it was the best tool" without naming the cost. Every choice has one.`,
        `Claiming Elasticsearch-level search from regex on MongoDB. Be honest about the limits.`,
        `Forgetting Lambda limits (cold starts, timeouts, connection reuse) when defending serverless.`,
        `Not knowing when you would change the decision.`,
        `Follow-up trap: "How do you run a schema migration with a database per tenant?" Loop over every tenant database with a migration tool, track which version each one is on, and make migrations safe to re-run.`,
      ],
      takeaway: 'For each SkillKeepr choice: the win, the cost, and the point at which you would switch.',
    },
    {
      id: 'octagnt-scalability-security',
      title: 'OCTAGNT: Scalability & Security',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Scale with stateless services, SQS workers and per-step pipelines on ECS; secure with tenant isolation in PostgreSQL, roles, cookie-based JWT sessions, secrets in Secrets Manager, signed URLs and consent before calls.',
      what: `**Scalability**
- **Stateless services:** the scoring engine and API keep no state in memory between requests, so ECS can run more copies behind a load balancer.
- **Queues:** resume processing goes through **SQS**. A burst of uploads just makes the queue longer; workers drain it. Messages that are not finished become visible again, so work is retried (at-least-once).
- **Priority lane:** uploads from the UI use a priority queue so an interactive user is not stuck behind a bulk import.
- **Voice isolation:** calls run in a separate service that scales on its own.
- **Direct uploads:** browsers upload resumes straight to S3 with presigned URLs, so big files never load the API.
- **Rate limits** on login and signup endpoints, backed by Redis.

**Security**
- **Tenant isolation:** PostgreSQL **row-level security** plus a tenant id on every row.
- **Roles:** Owner, Admin, Senior Recruiter, Recruiter, Viewer; recruiters see only their own records.
- **Auth:** short-lived JWT access tokens with refresh tokens in **cookies**, and the ability to revoke a session.
- **Secrets** in AWS Secrets Manager; containers run as non-root.
- **Files:** S3 encrypted at rest with short-lived signed URLs.
- **Voice:** calls only after **candidate consent**, and Twilio requests are verified.

#### Deeper version
- **Idempotency:** external events (webhooks, queue messages) can arrive twice, so handlers should be safe to repeat (upsert by external id).
- **Cost as a scaling limit:** AI and phone minutes cost money, so each call uses a credit and token usage is tracked per request.
- **What I'd harden next** (say generically): consistent database-level isolation on every route, stricter verification and idempotency on every inbound webhook, and per-tenant AI spend limits.`,
      why: `Interviewers want to know if your system survives growth and protects customer data. Recruitment data is personal (CVs, phone numbers, recordings), so security is not optional.`,
      analogy: `An apartment building: each flat has its own lock (tenant isolation), residents have key cards with different access (roles), deliveries go to a mailroom queue instead of knocking on every door (SQS), and more lifts can be added when the building fills up (more containers).`,
      code: [
        {
          title: 'Tenant isolation in PostgreSQL (simplified)',
          lang: 'sql',
          code: `-- Every table has tenant_id, and a policy filters rows automatically.
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON candidates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- The API sets the tenant for each request's DB session:
-- SET app.current_tenant_id = '<tenant from the logged-in user>';`,
        },
      ],
      output: `Once the policy is on, every query on candidates only returns rows for the tenant set on that database session, even if the application code forgets a WHERE clause.`,
      questions: [
        {
          q: 'How does the system handle 10x more resumes?',
          a: `Uploads go to S3 and SQS, so the queue absorbs the burst and we add workers or ECS tasks. The engine is stateless, so it scales horizontally.`,
        },
        {
          q: `How do you keep tenants' data separate?`,
          a: `Tenant id on every row and PostgreSQL row-level security policies, so the database enforces the filter. Roles then limit access inside a tenant.`,
        },
        {
          q: 'What if a queue message is processed twice?',
          a: `SQS is at-least-once, so the processing must be idempotent: check the run state and upsert results instead of blindly inserting.`,
        },
        {
          q: 'How is personal data protected?',
          a: `Encrypted S3 with short-lived signed URLs, secrets in Secrets Manager, cookie-based sessions, role checks, and calls only with candidate consent.`,
        },
      ],
      spoken: `"For scale, the engine and API are stateless containers on ECS, so we add copies when load grows. Resume processing goes through SQS with a priority lane for interactive uploads, and big files go straight to S3 with presigned URLs. Voice runs as its own service. For security, tenants are isolated with PostgreSQL row-level security, users have roles, sessions use short-lived JWTs in cookies, secrets live in Secrets Manager, and we only call candidates who consented. Next I'd add stricter webhook verification and per-tenant AI spend limits."`,
      mistakes: [
        `Saying "it scales because it is on AWS". Explain the mechanism: stateless services, queues, more tasks.`,
        `Forgetting at-least-once delivery. Queue and webhook handlers must be safe to run twice.`,
        `Treating tenant isolation as only an application-code concern. Database-level policies are a strong second layer.`,
        `Follow-up trap: "What is the bottleneck now?" Usually AI and phone costs and provider rate limits, not CPU — hence credits, token tracking and retries with backoff.`,
      ],
      takeaway: 'Scale with stateless containers + SQS + direct S3 uploads; secure with row-level security, roles, cookie JWTs, secrets management and consent.',
    },
    {
      id: 'skillkeepr-scalability-security',
      title: 'SkillKeepr: Scalability & Security',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Scales through Lambda, queues (SQS FIFO, Step Functions, AWS Batch) and per-tenant databases; secured with tenant-checked JWT cookies, permission decorators, plan checks, CORS limits and presigned S3 URLs.',
      what: `**Scalability**
- **Serverless API**: every endpoint is a Lambda function behind API Gateway, so it scales with traffic automatically.
- **Queues for heavy work**: resume parsing and AI scoring are pushed to **SQS FIFO queues** and processed with limited concurrency. Long or scheduled work uses **Step Functions** (interview reminder emails) and **AWS Batch** (big Zoho CRM syncs, processed in batches with short pauses to respect API limits).
- **Database per tenant**: one busy customer does not slow down another's database.
- **Connection caching**: tenant database connections are reused across warm Lambda invocations.
- **Static front-ends** on S3 + CloudFront, with a small edge function routing each company's subdomain to the right app.
- **Files**: uploads go **straight from the browser to S3** with presigned (multipart) URLs, so large files never pass through Lambda.

**Security**
- **Auth**: short-lived access token and longer refresh token as **HttpOnly, SameSite=Strict cookies**.
- **Tenant check**: the token carries the tenant, and requests whose token does not match the tenant are rejected.
- **Permissions**: route handlers are wrapped in an authorizer decorator that checks the token, the tenant, that the user is active, the plan/payment status and a permission key like \`MANAGE_JOBS.R\`.
- **CORS** only allows the product's own domains.
- **Super-admin** login adds an email one-time code (MFA).
- **Files** are private in S3 and shared through short-lived presigned URLs.

#### Deeper version
Scaling limits to mention: Lambda concurrency limits, the 29-second HTTP timeout, connection counts on the MongoDB servers when many tenants are active, and regex-heavy search queries. The fixes are reserved concurrency for critical functions, moving slow work to queues, connection limits per function, and a dedicated search engine when needed.

Security practices worth stating as standards you follow: hash passwords with a slow algorithm (bcrypt/argon2), verify every webhook signature against the raw body and make handlers idempotent, authenticate WebSocket connections, never print secrets in build logs, and escape user input before using it in regular expressions.`,
      why: `Multi-tenant SaaS holds many companies' candidate data, so a scaling problem or a leak affects many customers at once. Interviewers want to see that you think about both.`,
      analogy: `It is like an apartment building. Each flat has its own lock and utilities (database per tenant), the lift scales up by adding more cars (Lambda), deliveries go to a parcel room instead of through the lobby (queues and direct S3 uploads), and the security desk checks both your key and which flat you belong to (tenant-checked token).`,
      code: [
        {
          title: 'Authorizer decorator on a controller method (simplified)',
          lang: 'typescript',
          code: `class JobController {
  @Authorizer.authenticateAdmin('MANAGE_JOBS.R') // token + tenant + active user + plan + permission
  static async list(event, user) {
    return JobService.list(user.tenantId, event.queryStringParameters);
  }
}`,
        },
        {
          title: 'Heavy work through a FIFO queue (simplified)',
          lang: 'typescript',
          code: `// Producer: one message per resume to score, grouped per tenant + job
await sqs.sendMessage({
  QueueUrl: SCORING_QUEUE_URL,
  MessageBody: JSON.stringify({ tenantId, jobId, candidateId }),
  MessageGroupId: tenantId + ':' + jobId,       // keeps order within a job
  MessageDeduplicationId: jobId + ':' + candidateId,
}).promise();

// Consumer Lambda: process a batch with a small concurrency limit
await runPool(records, 5, (msg) => scoreCandidate(JSON.parse(msg.body)));`,
        },
      ],
      output: `The decorator means no handler can forget the security checks: token, tenant, active user, plan status and permission are verified before the method runs. The queue example shows how scoring hundreds of resumes is spread out: messages are grouped per tenant and job, de-duplicated, and processed a few at a time.`,
      questions: [
        {
          q: 'How did SkillKeepr scale for heavy AI scoring or resume parsing?',
          a: `Work was pushed onto SQS FIFO queues and processed by consumer Lambdas with limited concurrency, with progress tracked in the database, so the API stayed fast.`,
        },
        {
          q: `How do you stop one company seeing another company's data?`,
          a: `Each company has its own database, the tenant is part of the signed token, and requests where the token's tenant does not match are rejected.`,
        },
        {
          q: 'How were file uploads handled?',
          a: `The browser uploads directly to S3 using presigned multipart URLs, and downloads use short-lived presigned GET URLs. Files never go through Lambda.`,
        },
        {
          q: 'Why FIFO queues?',
          a: `To keep order within a group (tenant + job) and avoid duplicate processing using de-duplication IDs.`,
        },
        {
          q: 'What would you harden next?',
          a: `Standard practices: slow password hashing everywhere, verified and idempotent webhooks, authenticated WebSocket connections, input escaping for regex search, and secrets kept out of logs.`,
        },
      ],
      spoken: `"SkillKeepr scales mainly through serverless and queues. Every endpoint is a Lambda function, heavy work like resume parsing and AI scoring goes through SQS FIFO queues with limited concurrency, reminder emails run on Step Functions, and big CRM syncs run on AWS Batch. Each company has its own MongoDB database, and connections are cached across warm invocations. On security, tokens live in HttpOnly SameSite cookies, the token's tenant must match the request, and every handler is wrapped in an authorizer that checks the user, the plan status and a permission key. Files go directly to S3 with presigned URLs."`,
      mistakes: [
        `Saying "Lambda scales infinitely". There are concurrency limits and database connection limits.`,
        `Relying only on UI checks for permissions.`,
        `Passing large uploads through Lambda instead of presigned S3 URLs.`,
        `Running long jobs inside API requests instead of queues or Step Functions.`,
        `Follow-up trap: "What if the scoring queue backs up?" Watch queue depth and age, scale consumer concurrency carefully, and send failed messages to a dead-letter queue.`,
      ],
      takeaway: 'Scale with Lambda, queues and per-tenant databases; secure with tenant-bound cookie tokens, permission decorators and presigned files.',
    },
    {
      id: 'llm-in-production',
      title: 'Running LLM Features in Production (Cost, Reliability, Safety)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'In OCTAGNT: small fast Claude models, temperature 0 and strict JSON, retries with backoff and timeouts, concurrency limits, heuristic fallbacks, token usage tracking, credits, and humans reviewing AI suggestions.',
      what: `How OCTAGNT runs Claude safely in production:

**Reliability**
- **Small, fast model** for most tasks (extraction, conversation, analysis).
- **Temperature 0** and **JSON-only prompts** for anything the code must parse.
- **Retries with exponential backoff** on rate limits (429) and server errors; respecting the provider's "retry after" hint.
- **Timeouts** and a **concurrency limit** on parallel AI calls, so a burst does not hit rate limits.
- **Heuristic fallbacks:** if the AI step fails, a simple rule-based result is used, so the pipeline never stalls.

**Cost**
- **Token usage recorded per request** and stored, so spend can be seen per feature and tenant.
- **Credits** per plan (e.g. one voice credit per call), and skipping AI work that adds no value (voicemail calls).

**Safety and quality**
- **Humans in the loop:** recruiters review and edit AI-suggested questions; scores come with reasons.
- **Rule-based checks first:** many decisions (screening questions, trust checks, tiers) are deterministic rules, with AI only where it helps.
- **Consent** before any AI phone call.

#### Deeper version
- **Streaming** for the voice agent so speech starts early; non-streaming for short extraction tasks.
- **Prompt-only JSON** works but can break; the next step is the provider's **schema-enforced tool output** and validation (e.g. Pydantic).
- **Evaluation:** keep a small set of real examples and check outputs when prompts or models change.
- **What I'd add:** per-tenant AI budgets, a provider fallback, and prompt-injection guards for text that comes from resumes.`,
      why: `A demo only has to work once. Production has to work for every user, every day, within a budget. Interviewers ask this to see if you think about failure, cost and safety, not just prompts.`,
      analogy: `Running an LLM in production is like running a busy kitchen with a talented but moody chef: you give exact recipes (strict prompts), have a backup cook for when the chef is overwhelmed (fallbacks), watch ingredient costs (token tracking), and a manager tastes dishes before they go out (human review).`,
      code: [
        {
          title: 'A safe AI call wrapper (simplified)',
          lang: 'python',
          code: `semaphore = asyncio.Semaphore(5)              # at most 5 AI calls at once

async def safe_ai(prompt: str, fallback):
    async with semaphore:
        for attempt in range(3):
            try:
                reply = await claude(prompt, temperature=0, timeout=8)
                record_usage(reply.usage)       # tokens -> cost tracking
                return parse_json(reply.text)
            except (RateLimited, ServerError, Timeout):
                await asyncio.sleep(2 ** attempt)
    return fallback()                           # rule-based result, pipeline continues`,
        },
      ],
      output: `The wrapper limits concurrency, sets a timeout, records token usage, retries with backoff, and returns a rule-based fallback if every attempt fails — so a provider outage degrades results instead of breaking the product.`,
      questions: [
        {
          q: 'How do you control LLM cost?',
          a: `Small fast models, short prompts, token usage tracked per request, credits per plan, and skipping AI calls that add no value.`,
        },
        {
          q: 'What happens when the LLM provider is down?',
          a: `Retries with backoff and timeouts, then a heuristic fallback so the pipeline completes with a simpler result.`,
        },
        {
          q: 'How do you make LLM output reliable for code?',
          a: `Temperature 0, strict JSON prompts, a parser that tolerates extra text, and validation. Next step: schema-enforced tool output.`,
        },
        {
          q: 'How do you keep humans in control?',
          a: `AI suggestions are editable by recruiters, scores show reasons, and key decisions use deterministic rules.`,
        },
      ],
      spoken: `"In OCTAGNT we use small, fast Claude models with temperature zero and strict JSON prompts for anything the code parses. Every AI call has a timeout, retries with backoff on rate limits, and a concurrency limit. If the AI still fails, we fall back to a rule-based result so the pipeline keeps going. We record token usage per request to track cost, and plans use credits, for example one per voice call. Recruiters can review and edit AI suggestions. Next I'd add per-tenant budgets and schema-enforced outputs."`,
      mistakes: [
        `No fallback: one provider outage stops the whole product.`,
        `Not tracking tokens: you only learn the cost from the monthly bill.`,
        `Parsing free-form text as if it were guaranteed JSON.`,
        `Follow-up trap: "How do you stop prompt injection from resumes?" Treat resume text as data, keep instructions separate, validate outputs, and never let the model trigger actions directly.`,
      ],
      takeaway: 'Production LLMs need: small models, strict JSON, retries + timeouts + limits, fallbacks, token/cost tracking and human review.',
    },
    {
      id: 'improvements-both-projects',
      title: 'What Would You Improve? (OCTAGNT & SkillKeepr)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Concrete, standard improvements: stronger CI gates and test coverage, idempotent verified webhooks, modern password hashing everywhere, a real search engine, AWS SDK v3, and better observability for the voice pipeline.',
      what: `A good answer is **specific, prioritised and honest**, and framed as normal engineering growth, not as "the system was bad".

**SkillKeepr**
1. **Tests as a gate**: raise coverage thresholds step by step, run Jest in CI on every pull request, and add integration tests for key queries and the Boolean search parser.
2. **Billing robustness**: verify every webhook against the raw request body, store processed event IDs (idempotency), and let Stripe retry on real failures.
3. **Security standards everywhere**: slow password hashing (bcrypt/argon2), authenticated WebSocket connections, input escaping for regex search, and secrets kept out of build logs.
4. **Search at scale**: move Boolean search to a search engine (Atlas Search or OpenSearch) when the candidate pool grows, keeping the same query syntax.
5. **AWS SDK v3**: migrate from v2 for smaller bundles and long-term support.
6. **Tenant migrations**: one automated tool that runs and tracks schema migrations across every tenant database.

**OCTAGNT**
1. **Voice observability**: record latency per stage (speech-to-text, LLM, text-to-speech) and per call, with dashboards and alerts.
2. **Shared session store** for live calls, so any instance can take over and deploys do not drop calls.
3. **Tenant context from the token**: always derive the tenant from the signed token and use database row-level security on every route.
4. **LLM cost controls**: per-tenant budgets and alerts on top of the existing token tracking.
5. **Remove unused code paths** left over from older call flows to reduce confusion.

#### Deeper version
Prioritise by **risk × effort**: security and billing correctness first (they affect money and trust), then reliability and observability, then performance and nice-to-haves. Mention how you would roll each change out safely: feature flags, one tenant first, metrics before and after.`,
      why: `Interviewers ask this to see if you can look at your own work critically and prioritise. Vague answers ("better code") or blaming the team both look bad.`,
      analogy: `It is like a home inspection report. A good inspector lists what to fix first (wiring and roof), what can wait (paint), and roughly what each will cost, without saying "this house is terrible".`,
      code: [
        {
          title: 'Idempotent webhook handling (simplified)',
          lang: 'typescript',
          code: `export async function stripeWebhook(rawBody: Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET); // throws if invalid

  const firstTime = await ProcessedEvents.insertIfAbsent(event.id); // unique index on event.id
  if (!firstTime) return { status: 200 };                           // already handled

  await handleEvent(event); // throw on real failure -> Stripe retries
  return { status: 200 };
}`,
        },
        {
          title: 'Prioritised list to say out loud',
          lang: 'text',
          code: `1. Security + billing correctness   (passwords, webhooks, sockets, tenant context)
2. Tests as CI gates                 (coverage up, integration tests, parser tests)
3. Observability                     (voice latency per stage, queue depth, LLM cost)
4. Scale                             (search engine, shared call sessions)
5. Clean-up                          (AWS SDK v3, unused code paths, tenant migrations)`,
        },
      ],
      output: `The webhook example shows two standard protections in a few lines: the signature is checked against the exact raw body, and each event ID is processed only once, so retries and duplicates are safe. The list shows a clear priority order, which is what interviewers look for.`,
      questions: [
        {
          q: 'If you had one more month on SkillKeepr, what would you do?',
          a: `Make tests a CI gate and raise coverage on billing and permissions, then make webhook handling verified and idempotent.`,
        },
        {
          q: 'What would you improve in the voice agent?',
          a: `Per-stage latency metrics and alerts, and a shared session store so calls survive deploys and can move between instances.`,
        },
        {
          q: 'How do you decide what to fix first?',
          a: `Risk times effort: anything touching money, data isolation or security comes first; cosmetic or nice-to-have work comes last.`,
        },
        {
          q: `Why didn't you do these already?`,
          a: `Honest answer: we prioritised shipping features for customers; some of these were on the roadmap. Adapt: mention any you did start.`,
        },
      ],
      spoken: `"For SkillKeepr, I'd first make tests a required CI gate and raise coverage on billing and permissions, then make our Stripe webhook handling fully verified and idempotent by storing processed event IDs. I'd also move to AWS SDK v3 and automate migrations across all tenant databases, and move Boolean search to a proper search engine when data grows. For OCTAGNT's voice agent, I'd add latency metrics for each stage of the pipeline and a shared session store so calls survive deploys. I'd prioritise by risk: money and security first."`,
      mistakes: [
        `Saying "nothing, it was perfect". Nobody believes it.`,
        `Blaming teammates or management.`,
        `Listing twenty vague items with no priority.`,
        `Follow-up trap: "How would you roll that out without breaking production?" Feature flags, one tenant or environment first, and metrics before and after.`,
      ],
      takeaway: 'Specific improvements, prioritised by risk, framed as growth, with a safe rollout plan.',
    },
    {
      id: 'decision-i-would-change',
      title: 'Explain a Technical Decision You Would Change',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Good candidates: hand-rolled proration and client-confirmed payments in SkillKeepr billing (vs letting Stripe drive the lifecycle through webhooks), or regex-based Boolean search (vs a search engine).',
      what: `Pick a real decision, explain **why it made sense then**, **what it cost later**, and **what you would do now**. Never pick something that makes you look careless.

**Option A: SkillKeepr billing flow**
- **Then**: we calculated proration ourselves and confirmed purchases from the client after the payment succeeded, then created the Stripe subscription with a trial period equal to the plan length so Stripe only charged from the next cycle. This gave full control over pricing, credits and add-ons.
- **Cost**: more custom code to keep Stripe and the database in sync, and more edge cases (credits, add-ons, cancellations).
- **Now**: let Stripe own more of the lifecycle: use Stripe's own proration and subscription updates, Checkout or the Billing Portal for plan changes, and treat **verified webhooks** as the single source of truth for "paid".

**Option B: Boolean search on regex**
- **Then**: a hand-written parser that builds MongoDB regex conditions was quick to build and needed no extra infrastructure.
- **Cost**: regex queries get slower as data grows, and the parser is hard to extend (operator precedence, wildcards).
- **Now**: keep the same query syntax for users, but parse it into a proper tree and run it on a search engine (Atlas Search or OpenSearch) with real indexes and relevance scores.

#### Deeper version
The structure interviewers like: **context → decision → consequence → lesson**. The lesson should be a general principle, for example "use the platform's built-in lifecycle before building your own" or "choose the simple option, but plan the exit when data grows".`,
      why: `This question checks maturity: can you admit a trade-off went the wrong way, and did you learn a principle from it? Defending everything, or blaming others, both look bad.`,
      analogy: `It is like building your own car-parking ticket system when the mall already offers one. It works and you control it, but every new rule (validation, lost tickets) is more work you now own forever.`,
      code: [
        {
          title: 'Then vs now: who decides "paid"? (simplified)',
          lang: 'text',
          code: `THEN (client-driven)
  UI confirms payment -> UI asks server "did it succeed?" -> server creates subscription + plan record
  Webhooks handle renewals and failures later

NOW (webhook-driven)
  UI starts Checkout / subscription update in Stripe
  Stripe sends verified webhook (invoice.paid / customer.subscription.updated)
  Server updates plan record from the webhook, once per event ID`,
        },
        {
          title: 'Search: same syntax, better engine (simplified)',
          lang: 'javascript',
          code: `// Parse once into a tree...
const tree = parseBoolean('(react OR angular) AND "node js" NOT php');
// ...then translate the tree for the engine you use
const atlasQuery = toAtlasCompound(tree); // must / should / mustNot clauses with real indexes`,
        },
      ],
      output: `The first block shows the main change in thinking: instead of the client telling the server a payment worked, Stripe tells the server through signed webhooks, which also covers renewals and retries in one path. The second shows how users keep the same search syntax while the engine underneath improves.`,
      questions: [
        {
          q: 'Why did it make sense at the time?',
          a: `It gave full control over pricing, credits and add-ons with the features we needed, and shipped quickly.`,
        },
        {
          q: 'What signal told you it was the wrong choice?',
          a: `Edge cases kept growing (credits, add-ons, cancellations, failed payments), and each needed more custom sync code between Stripe and our database.`,
        },
        {
          q: 'How would you migrate without disrupting customers?',
          a: `New purchases use the new flow behind a feature flag; existing subscriptions move over at their next renewal; compare records between Stripe and the database during the transition.`,
        },
        {
          q: 'What is the general lesson?',
          a: `Use the platform's built-in lifecycle before writing your own, and when you choose the simple option, know the point where you will need to change it.`,
        },
      ],
      spoken: `"One decision I'd change is how SkillKeepr handles subscription purchases. We calculated proration ourselves and confirmed payments from the client, then created the Stripe subscription with a trial matching the plan length. It gave us full control, but every new case, like credits, add-ons and cancellations, meant more code to keep Stripe and our database in sync. Today I'd let Stripe own the lifecycle with its own proration and subscription updates, and treat verified webhooks as the single source of truth. The lesson: use the platform's built-in lifecycle before building your own."`,
      mistakes: [
        `Picking a decision that sounds careless (for example "we skipped tests").`,
        `Blaming someone else for the decision.`,
        `Not explaining why it was reasonable at the time.`,
        `Follow-up trap: "Would the new approach have downsides?" Yes: less control over custom pricing rules and some Stripe-imposed limits; say how you would handle them.`,
      ],
      takeaway: 'Context → decision → consequence → lesson, on a real trade-off, ending with a general principle.',
    },
  ],
  rapidFire: [
    { q: 'Where did you work and when?', a: 'Haspaces, Thiruvananthapuram — Software Engineer, June 2023 to September 2026.' },
    { q: 'What are your two main products?', a: 'SkillKeepr (multi-tenant HR & recruitment SaaS) and OCTAGNT (agentic AI candidate shortlisting platform).' },
    { q: 'OCTAGNT in one line?', a: 'AI that drafts job descriptions, screens candidates by phone, and automates client onboarding.' },
    { q: 'SkillKeepr in one line?', a: 'One HR/recruitment app for many companies, with strict isolation, RBAC, Stripe plans, search and live interviews.' },
    { q: 'What are the four SkillKeepr modules?', a: 'HR, Talent, Recruiter and Admin.' },
    { q: 'How was ~70% JD effort reduction measured?', a: 'Adapt: explain honestly — e.g. comparing typical manual JD time with generate-and-edit time; call it an estimate if it was one.' },
    { q: 'Why call OpenAI from the backend?', a: 'To keep the API key secret and add auth, rate limits, validation and usage logging.' },
    { q: 'How do you get reliable JSON from an LLM?', a: 'JSON output mode, a clear system prompt, schema validation (zod) and one retry.' },
    { q: 'What audio format do Twilio Media Streams use?', a: '8 kHz mulaw, base64-encoded, sent over a WebSocket.' },
    { q: 'Voice pipeline order?', a: 'Twilio media stream → speech-to-text → LLM → text-to-speech → back to Twilio.' },
    { q: 'What is barge-in?', a: 'The caller interrupts the agent; we send Twilio a `clear` message to stop queued audio and listen again.' },
    { q: 'Biggest lever for voice latency?', a: 'Streaming every step and starting TTS on the first sentence instead of waiting for the full reply.' },
    { q: 'Why was the voice agent a separate service?', a: 'Long-lived WebSockets, real-time audio and bursty load — isolated so it cannot slow the main app.' },
    { q: 'Why not Lambda for the voice agent?', a: 'Lambda suits short invocations; a call is one long two-way stream, better on containers.' },
    { q: 'How do you secure Twilio webhooks?', a: 'Validate the `X-Twilio-Signature` header with the auth token, and protect the media stream with a per-call token.' },
    { q: 'Zoho access token lifetime and fix?', a: 'About one hour; cache it and refresh with the stored refresh token shortly before expiry.' },
    { q: 'How did you avoid duplicate Zoho leads?', a: 'Upsert with a duplicate-check field like Email.' },
    { q: 'What does idempotent mean?', a: 'Doing the same operation twice has the same effect as doing it once.' },
    { q: 'Should a CRM outage block sign-up?', a: 'No — provision the workspace, mark CRM sync pending, retry in the background.' },
    { q: 'Why a multi-stage Dockerfile?', a: 'Build with dev tools, ship only the output — smaller, safer images.' },
    { q: 'What is a presigned S3 URL?', a: 'A temporary signed URL letting the client upload or download one object directly to S3.' },
    { q: 'Best way to give GitHub Actions AWS access?', a: 'OIDC role assumption — short-lived credentials, no stored access keys.' },
    { q: 'Golden rule for AI coding tools?', a: 'I own every line: give context, review, verify against docs, test, never paste secrets.' },
    { q: 'Multi-tenant model used in SkillKeepr?', a: 'Shared database with a `tenantId` on every tenant-owned document.' },
    { q: 'How to stop forgotten tenant filters?', a: 'Request context (AsyncLocalStorage) plus a Mongoose plugin that adds the filter to every query and aggregation.' },
    { q: 'Which status for another tenant\'s record?', a: '404 — do not reveal that it exists.' },
    { q: 'Gotcha with tenantId in aggregations?', a: 'Aggregation does not cast types, so pass an ObjectId, not a string.' },
    { q: 'RBAC vs plan-based access?', a: 'RBAC = what a user may do; plan = what the company paid for. Both must pass.' },
    { q: 'Check roles or permissions in code?', a: 'Permissions (like `hr:employees:read`), so new roles need no route changes.' },
    { q: 'Is hiding a button in the UI security?', a: 'No — only UX. The backend enforces every check.' },
    { q: 'Why verify Stripe webhooks with the raw body?', a: 'The signature is computed over the exact bytes; parsed JSON breaks verification.' },
    { q: 'How do you handle duplicate Stripe events?', a: 'Store processed event ids and make handlers safe to repeat.' },
    { q: 'How do you handle out-of-order Stripe events?', a: 'Re-fetch the latest subscription from Stripe before saving state.' },
    { q: 'What is proration?', a: 'Credit for unused time on the old plan and charge for remaining time on the new one when changing plans mid-cycle.' },
    { q: 'Grant access on Checkout redirect or webhook?', a: 'Webhook — the redirect can be skipped or faked.' },
    { q: 'How to enforce usage limits safely?', a: 'One atomic conditional increment in the database, not read-then-write.' },
    { q: 'Stripe or Razorpay?', a: 'Stripe for complex, global subscriptions; Razorpay for India-first payments like UPI.' },
    { q: 'Boolean search steps?', a: 'Tokenize → parse into a tree with precedence → compile to `$and` / `$or` / `$nor`.' },
    { q: 'Boolean operator precedence?', a: 'NOT binds tightest, then AND, then OR; brackets override.' },
    { q: 'What is the ESR rule?', a: 'Compound index order: Equality fields, then Sort fields, then Range fields.' },
    { q: 'Does a case-insensitive regex use an index well?', a: 'No — that is why indexed equality filters go first, and why Atlas Search is the next step.' },
    { q: 'How to spot a slow query?', a: '`explain("executionStats")`: docs examined far above returned, COLLSCAN, or in-memory SORT.' },
    { q: 'How did you stop NoSQL injection in search?', a: 'Field whitelist, regex-escaping user text, schema validation, and building query objects ourselves.' },
    { q: 'Why did Node 16 have to go?', a: 'It reached end-of-life in September 2023 — no more security fixes.' },
    { q: 'Common Node 17+/18 breakages?', a: 'OpenSSL 3 errors in old build tools, `localhost` resolving to IPv6 `::1`, native module rebuilds.' },
    { q: 'Is Node 18 still current?', a: 'No — it reached end-of-life in April 2025; target a current LTS.' },
    { q: 'Incident process in five words?', a: 'Acknowledge, contain, diagnose, fix, learn.' },
    { q: 'Roll back or fix forward?', a: 'Roll back if the last deploy caused it and rollback is safe; fix forward only when rollback is risky.' },
    { q: 'What did Jitsi do vs your WebSocket layer?', a: 'Jitsi handled video/media; my Socket.IO layer handled auth, lobby, admit, start and end.' },
    { q: 'Scaling Socket.IO across servers?', a: 'Redis adapter plus sticky sessions.' },
    { q: 'Why Jitsi instead of raw WebRTC?', a: 'Group video needs STUN/TURN, an SFU and NAT handling — Jitsi saved months.' },
    { q: 'Why MongoDB for an HR SaaS?', a: 'Flexible per-company schemas and nested profiles, plus aggregation for search; trade-off is weaker relational constraints.' },
    { q: 'Monolith or microservices for SkillKeepr?', a: 'Modular monolith — simple to deploy and debug; split along module lines when needed.' },
    { q: 'How to defend against prompt injection?', a: 'Rules in the system prompt, user text treated as data, length caps, and sensitive decisions in separate server-side steps.' },
    { q: 'How to control LLM cost?', a: 'Cap tokens, rate-limit per tenant, tie usage to plans, and log usage per tenant and feature.' },
    { q: 'Top improvement for SkillKeepr?', a: 'Queue Stripe webhook processing and move free-text search to Atlas Search.' },
    { q: 'Top improvement for OCTAGNT?', a: 'Per-step latency tracing for every call, plus an outbound call queue.' },
    { q: 'Answer shape for "why X over Y"?', a: 'The need, the options, the trade-off accepted, and what would make me switch.' },
  ],
};
