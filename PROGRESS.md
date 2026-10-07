# Progress

Status of every content file. If work is interrupted, resume from the first stack that is not ✅.
Run `npm run validate` to see topic counts and errors for all stacks.

## App shell
- ✅ Vite + React + Tailwind + react-router-dom app shell
- ✅ Components: Sidebar, TopicCard, CodeBlock, ProgressBar, FlipCard, SearchBar (+ RichText, Badges, FilterBar, TopicActions)
- ✅ Pages: Dashboard, Stack, Topic, Bookmarks, Quick Revise, Rapid Fire, Search
- ✅ Data validator: `scripts/validate-data.mjs`
- ✅ Content guide: `CONTENT_GUIDE.md`

## Content (priority order)
| # | Stack | File | Status |
|---|---|---|---|
| 22 | My Resume & Projects | `resume.js` | ✅ done (32 topics, 58 rapid-fire) |
| 4 | React.js | `react.js` | ✅ done (54 topics, 60 rapid-fire) |
| 1 | JavaScript | `javascript.js` | ✅ done (55 topics, 60 rapid-fire) |
| 8 | Node.js | `nodejs.js` | ✅ done (31 topics, 60 rapid-fire) |
| 9 | Express.js | `express.js` | ✅ done (27 topics, 60 rapid-fire) |
| 11 | MongoDB & Mongoose | `mongodb.js` | ✅ done (36 topics, 60 rapid-fire) |
| 2 | TypeScript | `typescript.js` | ✅ done (30 topics, 60 rapid-fire; 59 TS blocks type-checked) |
| 5 | Next.js | `nextjs.js` | ✅ done (24 topics, 60 rapid-fire) |
| 6 | Redux & Redux-Saga | `redux.js` | ✅ done (27 topics, 59 rapid-fire) |
| 3 | HTML5, CSS3, SCSS | `html-css.js` | ✅ done (32 topics, 59 rapid-fire) |
| 7 | UI Libraries | `ui-libraries.js` | ✅ done (13 topics, 40 rapid-fire) |
| 10 | API Design & Communication | `api-design.js` | ✅ done (39 topics, 61 rapid-fire) |
| 11 | PostgreSQL | `postgresql.js` | ✅ done (29 topics, 60 rapid-fire) |
| 11 | Redis, Caching & CAP | `redis.js` | ✅ done (15 topics, 44 rapid-fire) |
| 11 | Firebase | `firebase.js` | ✅ done (15 topics, 50 rapid-fire) |
| 12 | Cloud & DevOps | `cloud-devops.js` | ✅ done (37 topics, 60 rapid-fire) |
| 13 | Architecture & System Design | `architecture.js` | ✅ done (37 topics, 60 rapid-fire) |
| 14 | Stripe & Razorpay | `payments.js` | ✅ done (33 topics, 59 rapid-fire) |
| 14 | LLM APIs & Voice AI | `ai-llm.js` | ✅ done (36 topics, 64 rapid-fire) |
| 14 | Twilio, Zoho CRM & Jitsi | `twilio-zoho-jitsi.js` | ✅ done (20 topics, 55 rapid-fire) |
| 15 | Testing & Quality | `testing.js` | ✅ done (24 topics, 57 rapid-fire) |
| 16 | Tools & Workflow | `tools.js` | ✅ done (22 topics, 60 rapid-fire) |
| 17 | Security | `security.js` | ✅ done (20 topics, 56 rapid-fire) |
| 18 | Web Performance & Browser | `web-performance.js` | ✅ done (15 topics, 54 rapid-fire) |
| 19 | Machine Coding (React) | `machine-coding.js` | ✅ done (18 topics, 38 rapid-fire) |
| 20 | JS Output & Implement-it | `js-output.js` | ✅ done (27 topics, 78 puzzles, 50 rapid-fire) |
| 21 | DSA & Problem Solving | `dsa.js` | ✅ done (39 topics, 55 problems, 50 rapid-fire) |
| 23 | HR & Behavioral | `hr.js` | ✅ done (26 topics, 40 rapid-fire) |

## Final steps
- ✅ Full validation: 28 files, 813 topics, 1,554 rapid-fire Q&As, 0 errors, 0 warnings
- ✅ Production build passes (`npm run build`)
- ✅ Browser checks (headless Chrome): every page at desktop and phone width, no runtime errors and no sideways scroll; learned / bookmark / theme / search / flip cards / rapid fire / filters / Next button / persistence all tested
- ✅ TypeScript examples type-checked (59 blocks)
- ✅ README

## Completeness audits
Each stack writer listed commonly asked topics missing from the original list and added them
(e.g. React: Rules of Hooks, RSC, useSyncExternalStore; Node: http module, security, queues;
Architecture: outbox pattern, consistent hashing; DSA: tries, backtracking, topological sort).

## Before your interviews
- `resume.js` and `hr.js` contain **"Adapt:"** notes — fill these in with your real numbers and stories.
- Six HR spoken answers start with an "Example story" label — replace those stories with real ones.

## Interview problems (`src/data/problems/<stack>.js`)
App support: ✅ problems page per stack, ✅ global Practice Problems page, ✅ solved tracking, ✅ search, ✅ dashboard count, ✅ `scripts/validate-problems.mjs`

| Stack | File | Status |
|---|---|---|
| JavaScript | `problems/javascript.js` | ✅ done (32 problems) |
| React.js | `problems/react.js` | ✅ done (32 problems) |
| Node.js | `problems/nodejs.js` | ✅ done (25 problems) |
| Express.js | `problems/express.js` | ✅ done (22 problems) |
| MongoDB | `problems/mongodb.js` | ✅ done (28 problems) |
| TypeScript | `problems/typescript.js` | ✅ done (22 problems, all type-checked) |
| Next.js | `problems/nextjs.js` | ✅ done (17 problems) |
| Redux | `problems/redux.js` | ✅ done (18 problems) |
| API Design | `problems/api-design.js` | ✅ done (23 problems) |
| Cloud & DevOps | `problems/cloud-devops.js` | ✅ done (21 problems) |
| Architecture | `problems/architecture.js` | ✅ done (20 problems) |
| Stripe & Razorpay | `problems/payments.js` | ✅ done (22 problems) |
| LLM & Voice AI | `problems/ai-llm.js` | ✅ done (22 problems) |
| DSA | `problems/dsa.js` | ✅ done (35 problems, all tested) |
| HTML/CSS | `problems/html-css.js` | ✅ done (19 problems) |
| UI Libraries | `problems/ui-libraries.js` | ✅ done (12 problems) |
| PostgreSQL | `problems/postgresql.js` | ✅ done (23 problems, SQL run on local Postgres) |
| Redis | `problems/redis.js` | ✅ done (14 problems) |
| Twilio/Zoho/Jitsi | `problems/twilio-zoho-jitsi.js` | ✅ done (15 problems) |
| Firebase | `problems/firebase.js` | ✅ done (11 problems) |
| Testing | `problems/testing.js` | ✅ done (18 problems) |
| Tools | `problems/tools.js` | ✅ done (16 problems) |
| Security | `problems/security.js` | ✅ done (17 problems) |
| Web Performance | `problems/web-performance.js` | ✅ done (11 problems) |
| Resume & Projects | `problems/resume.js` | ✅ done (24 problems) |
| HR | `problems/hr.js` | ✅ done (14 problems) |
| JS Output | `problems/js-output.js` | ✅ done (30 problems) |
| Machine Coding | `problems/machine-coding.js` | ✅ done (12 problems) |

### Problems — final checks
- ✅ 28 problem files, **575 problems**, 0 errors, 0 warnings (`npm run validate`)
- ✅ Every problem and solution opened in headless Chrome (desktop + phone): no runtime errors, no sideways scroll
- ✅ 335 JSX/TSX blocks compiled with Vite's oxc; the 9 that don't compile are intentional short fragments (usage snippets, two files in one block, "..." placeholders)
- ✅ Fixed a text-insertion corruption in `problems/nextjs.js` (`'$'` became the file's closing brackets); all files scanned for the same pattern — clean
- ✅ Validators now also catch nested code fences
