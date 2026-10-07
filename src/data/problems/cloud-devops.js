// Interview problems for the Cloud & DevOps stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'cloud-devops',
  problems: [
    {
      id: 'fix-bad-node-dockerfile',
      title: 'Fix a bad Dockerfile (huge, slow, leaks a secret)',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'docker-multistage-optimization',
      question: `A teammate wrote this Dockerfile for a plain JavaScript Express API (no build step). The image is **1.2 GB**, every code change re-installs all packages (slow builds), and security says "there is a live Stripe key in the image". Find every problem and fix it.

\`\`\`dockerfile
FROM node:22
WORKDIR /app
COPY . .
ENV STRIPE_SECRET_KEY=sk_live_51Habc123
RUN npm install
EXPOSE 3000
CMD npm start
\`\`\`

There is also no \`.dockerignore\` file.`,
      hints: [
        'Docker caches each step (layer). If a step\'s input files change, that step and **every step after it** run again. Which step changes on every code edit?',
        'Anything written with `ENV` or `COPY` is stored inside the image forever. Anyone with the image can run `docker history` or `docker inspect` and read it.',
        'Think about: base image size, `npm ci` vs `npm install`, devDependencies, running as root, and how `CMD npm start` handles the stop signal.',
      ],
      solution: `**Idea:** copy only the package files first so the install step is cached, use a small base image, install only production packages, never put secrets in the image, and run as a normal user.

**The problems:**

1. \`node:22\` is the full Debian image (~1 GB). Use \`node:22-slim\` or \`node:22-alpine\`.
2. \`COPY . .\` **before** install. Any code change breaks the cache, so \`npm install\` runs every build.
3. No \`.dockerignore\`. Your local \`node_modules\`, \`.git\` and \`.env\` files get copied into the image.
4. **Secret baked in.** \`ENV STRIPE_SECRET_KEY=...\` is saved in the image metadata. Anyone who can pull the image can read it. The key must be rotated now.
5. \`npm install\` can change versions and installs devDependencies. Use \`npm ci --omit=dev\` (exact versions from the lockfile, no dev packages).
6. Runs as **root**. If someone breaks into the app, they are root inside the container.
7. \`CMD npm start\` (shell form) wraps the app in a shell and \`npm\`. The stop signal (SIGTERM) may not reach Node, so the app is killed instead of shutting down cleanly.

**Fixed Dockerfile:**

\`\`\`dockerfile
# Small base image (pick the current Node LTS)
FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

# 1) Copy ONLY the dependency files first -> this layer is cached
#    until package.json / package-lock.json change
COPY package.json package-lock.json ./

# 2) Exact versions from the lockfile, no devDependencies, clean npm cache
RUN npm ci --omit=dev && npm cache clean --force

# 3) Now copy the source code (changes often, but install is already cached)
COPY --chown=node:node . .

# 4) Run as the non-root "node" user that ships with the official image
USER node

EXPOSE 3000

# 5) Exec form: Node is PID 1 and receives SIGTERM directly
CMD ["node", "src/server.js"]
\`\`\`

**.dockerignore:**

\`\`\`text
node_modules
.git
.env
.env.*
npm-debug.log
coverage
Dockerfile
.dockerignore
\`\`\`

**The secret:** pass it when the container **runs**, not when the image is built:

\`\`\`bash
docker run -e STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" -p 3000:3000 my-api
\`\`\`

In production, the platform injects it from a secret store (AWS Secrets Manager, GCP Secret Manager) as an environment variable.

**Why it works:** Docker reuses a cached layer when its inputs did not change. Package files change rarely, so the slow install is skipped on most builds. The slim base and \`--omit=dev\` cut the size (often to ~200-250 MB). The image contains no secrets, so it is safe to store in a registry.`,
      followUps: [
        {
          q: 'I deleted the ENV line in a later commit. Is the old image safe now?',
          a: 'No. Old images and their layers still contain the key, and it may be in git history too. **Rotate the key** (create a new one, revoke the old one). Removing it from code is not enough.',
        },
        {
          q: 'How do you use a secret during the build, e.g. a private npm token?',
          a: 'Use BuildKit secret mounts: `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci`. The file is available only during that step and is not saved in any layer.',
        },
        {
          q: 'Alpine or slim?',
          a: 'Alpine is smaller but uses musl instead of glibc, so some native packages (e.g. `sharp`, `bcrypt`) can break or need extra build tools. Slim is a safe default; Alpine if you test it.',
        },
      ],
    },
    {
      id: 'container-crashes-on-cloud-run',
      title: 'Works locally, crashes on Cloud Run / ECS',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'cloud-run-deploy',
      question: `Your Node API runs fine with \`docker run -p 3000:3000 my-api\` on your laptop. On Cloud Run the deploy fails with:

\`\`\`text
The user-provided container failed to start and listen on the port
defined provided by the PORT=8080 environment variable.
\`\`\`

On ECS the task starts but the load balancer marks it **unhealthy** and keeps restarting it. Here is the server code:

\`\`\`javascript
import express from 'express';

const app = express();
app.get('/', (req, res) => res.send('ok'));

app.listen(3000, 'localhost', () => {
  console.log('API listening on http://localhost:3000');
});
\`\`\`

What is wrong, and how do you fix it?`,
      hints: [
        'Cloud Run tells your container which port to use. How does it tell you? (Look at the error message.)',
        'Inside a container, `localhost` means "only this container". Can traffic from outside the container reach an app that only listens on localhost?',
      ],
      solution: `**Idea:** two bugs. The port is hard-coded, and the app listens only on \`localhost\`.

**Bug 1 — wrong port.** Cloud Run sets a \`PORT\` environment variable (8080 by default) and sends traffic there. Our app ignores it and listens on 3000, so Cloud Run sees nothing on 8080 and fails the deploy.

**Bug 2 — listening on localhost.** \`localhost\` (127.0.0.1) inside a container is the container's **own private loopback**. Traffic from the platform (or the load balancer) arrives on the container's network interface, not on loopback. So the app never sees it. On your laptop it "worked" only because of how \`docker run -p\` forwards traffic in that setup — do not rely on it.

**Fix:**

\`\`\`javascript
import express from 'express';

const app = express();
app.get('/', (req, res) => res.send('ok'));
app.get('/health', (req, res) => res.json({ status: 'ok' })); // for ECS / ALB health checks

// Read the port from the environment, with a local default
const port = Number(process.env.PORT) || 3000;

// 0.0.0.0 = listen on ALL network interfaces, not just loopback
app.listen(port, '0.0.0.0', () => {
  console.log(\`API listening on port \${port}\`);
});
\`\`\`

**For ECS also check:**

- The task definition \`containerPort\` matches the port the app listens on.
- The target group health check path (e.g. \`/health\`) returns **200**.
- The security group of the task allows traffic from the load balancer on that port.

**Why it works:** the app now listens where the platform sends traffic (the \`PORT\` it was given) and on every interface, so requests from outside the container reach it.`,
      followUps: [
        {
          q: 'The image runs on my M1/M2 Mac but on Cloud Run/ECS it fails with "exec format error". Why?',
          a: 'You built an **ARM** image, but the server runs **x86_64 (amd64)**. Build for the right platform: `docker build --platform linux/amd64 -t my-api .` (or use `docker buildx` to build both).',
        },
        {
          q: 'Where do you look first when a container crashes on start?',
          a: 'The container logs (Cloud Logging for Cloud Run, CloudWatch Logs for ECS). Most crashes are a missing env var, a wrong port, or a failed DB connection, and the log shows the error line.',
        },
      ],
    },
    {
      id: 'docker-compose-api-mongo-redis',
      title: 'Write docker-compose for API + MongoDB + Redis with health checks',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'docker-compose',
      question: `Write a \`docker-compose.yml\` for local development with three services:

- \`api\` — your Node API, built from the local \`Dockerfile\`, on port 3000.
- \`mongo\` — MongoDB, with data that survives \`docker compose down\`.
- \`redis\` — Redis for caching.

Your teammate's first version fails. The API crashes on start with \`MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017\`:

\`\`\`yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      MONGO_URL: mongodb://localhost:27017/app
    depends_on:
      - mongo
  mongo:
    image: mongo:7
\`\`\`

Fix it, and make sure the API starts only after Mongo and Redis are actually **ready**.`,
      hints: [
        'Each compose service is its own container. Inside the API container, `localhost` is the API container itself. What hostname reaches the Mongo container?',
        'Plain `depends_on: [mongo]` only waits for the container to **start**, not for Mongo to accept connections. Look at `healthcheck` and `condition: service_healthy`.',
        'For data that survives restarts, use a **named volume** mounted at Mongo\'s data folder `/data/db`.',
      ],
      solution: `**Idea:** use the **service name** as the hostname (Compose gives every service a DNS name on a shared network), add health checks to Mongo and Redis, and make the API wait until they are healthy.

\`\`\`yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"            # host:container
    environment:
      PORT: "3000"
      # "mongo" and "redis" are the service names below = their hostnames
      MONGO_URL: mongodb://mongo:27017/app
      REDIS_URL: redis://redis:6379
    depends_on:
      mongo:
        condition: service_healthy   # wait until the healthcheck passes
      redis:
        condition: service_healthy
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db    # named volume -> data survives "down"
    healthcheck:
      # mongosh ships inside the official mongo image (6.0+)
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s        # give Mongo time to boot before counting failures

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  mongo-data:
\`\`\`

Run it with \`docker compose up --build\`.

**Why it works:**

- Compose puts all services on one network and creates DNS names from the service names, so \`mongodb://mongo:27017\` reaches the Mongo container.
- \`condition: service_healthy\` makes Compose wait until Mongo answers \`ping\` and Redis answers \`PONG\`, so the API does not crash on its first connection.
- The named volume \`mongo-data\` lives outside the container. \`docker compose down\` keeps it; only \`docker compose down -v\` deletes it.
- We did **not** publish Mongo/Redis ports to the host. The API reaches them on the internal network. Add \`ports: ["27017:27017"]\` only if you want to connect with Compass from your laptop.`,
      followUps: [
        {
          q: 'Is depends_on with healthchecks enough in production?',
          a: 'No. Compose is mainly for local dev. In production (ECS, Kubernetes) the database can restart at any time, so the app itself should **retry connections** with backoff. The Mongo driver and ioredis already reconnect automatically.',
        },
        {
          q: 'How do you get hot reload of code in the API container?',
          a: 'Bind-mount the source: `volumes: ["./src:/app/src"]` and run with `node --watch` or nodemon. Keep `node_modules` inside the container (do not mount it from the host), especially on Mac where native modules differ.',
        },
        {
          q: 'How would you add a health check for the API service itself?',
          a: 'The slim Node image has no curl, so use Node: `test: ["CMD", "node", "-e", "fetch(\'http://localhost:3000/health\').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]`.',
        },
      ],
    },
    {
      id: 'iam-policy-one-bucket-prefix',
      title: 'Write a least-privilege IAM policy for one S3 folder',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'iam-basics',
      question: `Your API (running with an IAM role) must:

- upload, read and delete files under \`uploads/\` in the bucket \`my-app-bucket\`
- list the files under \`uploads/\`

It must **not** touch anything else in that bucket (e.g. \`backups/\`) or any other bucket. A teammate suggested this:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "s3:*", "Resource": "*" }
  ]
}
\`\`\`

Write a proper least-privilege policy.`,
      hints: [
        'Least privilege = only the exact **actions** on the exact **resources** needed. `s3:*` on `*` lets the app delete every bucket in the account.',
        'Object actions (`GetObject`, `PutObject`, `DeleteObject`) apply to object ARNs like `arn:aws:s3:::bucket/path/*`. `ListBucket` applies to the **bucket** ARN itself.',
        'To limit listing to one folder, add a `Condition` on the `s3:prefix` key.',
      ],
      solution: `**Idea:** two statements. One for object actions on \`uploads/*\`. One for \`ListBucket\` on the bucket, limited by a prefix condition.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ObjectAccessInUploads",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::my-app-bucket/uploads/*"
    },
    {
      "Sid": "ListOnlyUploads",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::my-app-bucket",
      "Condition": {
        "StringLike": { "s3:prefix": ["uploads/", "uploads/*"] }
      }
    }
  ]
}
\`\`\`

**Why it works:**

- \`"Version": "2012-10-17"\` is the policy language version (always use this exact date, it is not "today").
- Object actions use the **object** ARN with the prefix, so \`backups/db.gz\` does not match \`uploads/*\`.
- \`s3:ListBucket\` is a **bucket-level** action, so it needs the bucket ARN (no \`/*\`). Putting it on \`my-app-bucket/*\` is the most common mistake — it silently does nothing and listing fails with AccessDenied.
- The \`s3:prefix\` condition means \`ListObjectsV2\` only works when the app asks for \`Prefix: 'uploads/'\`.
- Everything not allowed is denied by default (implicit deny).`,
      followUps: [
        {
          q: 'How would each user only access their own folder?',
          a: 'Use a policy variable in the resource, e.g. `arn:aws:s3:::my-app-bucket/users/${aws:username}/*` for IAM users. For app users (not IAM users) it is simpler to keep the check in your API and hand out **presigned URLs** for the exact key.',
        },
        {
          q: 'What if the bucket uses SSE-KMS encryption with a customer key?',
          a: 'The role also needs `kms:Decrypt` (to read) and `kms:GenerateDataKey` (to write) on that KMS key, or uploads/downloads fail with AccessDenied.',
        },
        {
          q: 'How do you test a policy before shipping it?',
          a: 'Use the IAM Policy Simulator, or IAM Access Analyzer policy validation. Then test the real calls in staging with the same role.',
        },
      ],
    },
    {
      id: 'secrets-across-environments',
      title: 'Manage secrets for dev, staging and prod',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'secrets-manager-parameter-store',
      question: `Your team keeps one \`.env\` file with the **production** MongoDB URL and Stripe live key. It is shared on Slack and was once committed to git by mistake. You now have dev, staging and prod environments.

How would you manage secrets properly? Cover: where secrets live, how the app gets them in each environment, how CI gets them, and what to do about the leaked key.`,
      hints: [
        'Split **config** (non-secret, like `LOG_LEVEL`) from **secrets** (passwords, API keys). Each environment should have its own values.',
        'Cloud secret stores (AWS Secrets Manager / SSM Parameter Store, GCP Secret Manager) can inject secrets as environment variables at deploy or start time.',
        'A leaked key is leaked forever. Deleting the commit is not enough.',
      ],
      solution: `**Idea:** the code reads everything from environment variables. Each environment gets its **own** secrets from a secret store. No real secret is ever in git, Slack or an image.

**1. Fix the leak first**

- **Rotate** the leaked keys now (new Stripe key, new DB password), then revoke the old ones.
- Then clean up: remove the file, add \`.env*\` to \`.gitignore\`, enable secret scanning (GitHub secret scanning / gitleaks in CI).

**2. Where secrets live**

- **Local dev:** each developer has a \`.env\` (git-ignored) with **test** keys only (Stripe \`sk_test_...\`, local Mongo). A committed \`.env.example\` lists the variable names with fake values.
- **Staging / prod:** AWS Secrets Manager or SSM Parameter Store (or GCP Secret Manager). Ideally separate cloud accounts/projects per environment, so a staging bug can never read prod secrets.

**3. How the app gets them** — the platform injects them as env vars. Example: ECS task definition:

\`\`\`json
{
  "containerDefinitions": [
    {
      "name": "api",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/api:abc123",
      "environment": [{ "name": "LOG_LEVEL", "value": "info" }],
      "secrets": [
        {
          "name": "MONGO_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/api/mongo-url"
        }
      ]
    }
  ]
}
\`\`\`

On Cloud Run: \`gcloud run deploy api --set-secrets MONGO_URL=mongo-url:latest\`. The ECS task execution role (or Cloud Run service account) gets permission to read **only** its own environment's secrets.

**4. Fail fast if config is missing** — validate at startup:

\`\`\`javascript
// config.js
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  MONGO_URL: z.string().startsWith('mongodb'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
});

// Throws on boot with a clear message if something is missing or wrong
export const config = schema.parse(process.env);
\`\`\`

**5. CI/CD** — store deploy credentials in **GitHub Environments** (\`staging\`, \`production\`) with required reviewers for prod. Better: use **OIDC** so GitHub gets short-lived cloud credentials and you store no long-lived AWS keys at all.

**Why it works:** the same image runs everywhere; only the injected values change (12-factor config). Secrets are encrypted at rest, access is logged, and each environment can be rotated on its own.`,
      followUps: [
        {
          q: 'Secrets Manager or Parameter Store?',
          a: 'Parameter Store (SecureString) is cheap/free for standard parameters and fine for most config. Secrets Manager costs per secret but adds **automatic rotation** (e.g. for RDS passwords) and cross-account sharing. Check current pricing.',
        },
        {
          q: 'If a secret is rotated, does the running app see the new value?',
          a: 'Not if it was injected as an env var at start — env vars are read once. You need to restart/redeploy the tasks, or have the app fetch the secret from the store with a short cache.',
        },
      ],
    },
    {
      id: 'choose-compute-for-workloads',
      title: 'Pick the right compute for four workloads',
      difficulty: 'easy',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'choosing-compute',
      question: `Your startup has four workloads. For each, pick **Lambda**, **ECS Fargate / Cloud Run**, **EC2** or **Kubernetes (EKS/GKE)**, and explain why in one or two sentences.

1. The main Express + Socket.IO API. Steady traffic all day, users keep WebSocket connections open.
2. Resize an image every time a user uploads one (a few hundred per day, bursty).
3. A nightly job that builds reports from MongoDB. It takes about **2 hours**.
4. A team of 3 engineers with 4 small services. Someone suggests "let's use Kubernetes".`,
      hints: [
        'Lambda has a hard maximum run time per invocation (15 minutes) and is billed per request. It is great for short, event-driven, bursty work.',
        'Long-lived connections and steady traffic usually fit containers that are always running.',
        'Kubernetes is powerful but someone has to run and upgrade it. Is that worth it for 3 people?',
      ],
      solution: `**Idea:** match the shape of the work (how long, how steady, event-driven or not) to the service, and prefer the **most managed** option the team can live with.

1. **Main API with WebSockets → ECS Fargate (or Cloud Run).** Traffic is steady, so always-on containers are cheap per request. WebSockets need long-lived connections; Lambda is a poor fit for this (each invocation is short, and API Gateway WebSockets need a different design). Fargate = containers without managing servers. Cloud Run also supports WebSockets, but a connection is limited by the request timeout (up to 60 minutes — check current docs), so clients must reconnect.
2. **Image resize on upload → Lambda.** It is event-driven (S3 upload event triggers it), short (seconds), and bursty. You pay only when it runs and it scales to zero when idle.
3. **2-hour nightly job → a scheduled container**, e.g. an ECS scheduled task (EventBridge Scheduler + Fargate) or a **Cloud Run Job**. **Not Lambda** — 2 hours is far over the 15-minute limit.
4. **3 engineers, 4 services → no Kubernetes yet.** Use ECS Fargate or Cloud Run. Kubernetes adds cluster upgrades, networking, ingress controllers and a lot of YAML. It pays off with many services, many teams, or a need to run the same setup on several clouds.

**When EC2?** When you need full control of the machine: special software, GPUs, very steady heavy load where reserved instances are cheapest, or licensing tied to a server.

**Why it works:** the interviewer wants trade-off thinking, not one "best" service. Say the limits (15-minute Lambda, cold starts, ops cost of Kubernetes) and tie each choice to cost and team size.`,
      followUps: [
        {
          q: 'When would you move the main API to Lambda?',
          a: 'If traffic is very spiky or low (lots of idle time), there are no WebSockets, and requests are short. Then pay-per-request is cheaper. Watch for cold starts and DB connection limits.',
        },
        {
          q: 'What is a cold start?',
          a: 'When no warm instance exists, the platform must start a new one (download code, start runtime, run your init code) before handling the request. That first request is slower — from ~100 ms to a few seconds.',
        },
      ],
    },
    {
      id: 'production-dockerfile-typescript-api',
      title: 'Write a production Dockerfile for a TypeScript Node API',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'docker-multistage-optimization',
      question: `Write a production Dockerfile for a TypeScript Express API.

- \`npm run build\` compiles \`src/\` to \`dist/\` (needs devDependencies like \`typescript\`).
- Start command: \`node dist/server.js\`. The app reads \`PORT\`.

Requirements:

- Final image must **not** contain TypeScript, source files or devDependencies.
- Rebuilds after a code-only change must **not** re-install packages.
- Run as a non-root user.
- The container must stop cleanly when the platform sends SIGTERM.`,
      hints: [
        'A **multi-stage** build uses several `FROM` lines. Early stages can have all the build tools; the last stage copies only what it needs with `COPY --from=<stage>`.',
        'You need two different `node_modules`: a full one to build, and a production-only one to run.',
        'Node running as PID 1 in a container does not stop on SIGTERM unless your code handles it. Either handle it in code or use an init process like `tini` (`docker run --init`).',
      ],
      solution: `**Idea:** stage 1 installs all deps and builds. Stage 2 installs only prod deps. The final stage copies \`dist/\` and prod \`node_modules\` into a clean slim image and runs as \`node\`.

\`\`\`dockerfile
# syntax=docker/dockerfile:1

# ---------- Stage 1: install ALL deps and build ----------
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Cache mount keeps npm's download cache between builds (BuildKit)
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Stage 2: production deps only ----------
FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---------- Stage 3: the small runtime image ----------
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 8080

# Exec form: node is PID 1 and gets SIGTERM directly
CMD ["node", "dist/server.js"]
\`\`\`

**Graceful shutdown in the app** (so SIGTERM finishes in-flight requests):

\`\`\`typescript
// src/server.ts
import express from 'express';

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 8080;
const server = app.listen(port, '0.0.0.0', () => console.log(\`listening on \${port}\`));

function shutdown(signal: string) {
  console.log(\`\${signal} received, closing server\`);
  // Stop accepting new connections, finish the ones in progress
  server.close(() => process.exit(0));
  // Safety net: force exit if something hangs
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
\`\`\`

Plus a \`.dockerignore\` with at least \`node_modules\`, \`dist\`, \`.git\`, \`.env*\`.

**Why it works:**

- Only the final stage becomes the image. TypeScript, \`src/\` and dev packages stay in the build stages and are thrown away.
- Package files are copied before the source, so the \`npm ci\` layers are reused when only code changes.
- \`--chown=node:node\` + \`USER node\` = the app does not run as root.
- Without a SIGTERM handler, Node as PID 1 ignores SIGTERM, and the platform kills it after the grace period (Docker: 10 s) — dropping requests. The handler makes it exit cleanly.`,
      followUps: [
        {
          q: 'How would you make it even smaller?',
          a: 'Use `node:22-alpine` (test native modules first), or a distroless Node image (no shell, no package manager — smaller and safer, but harder to debug). Also prune unused dependencies.',
        },
        {
          q: 'Why not just run `npm prune --omit=dev` in the build stage and copy that?',
          a: 'That works too and is a common pattern. A separate prod-deps stage is a bit cleaner and caches independently, but both are fine answers.',
        },
        {
          q: 'How do you check what is making an image big?',
          a: 'Run `docker history <image>` to see the size of each layer, or use the `dive` tool to browse layer contents.',
        },
      ],
    },
    {
      id: 's3-presigned-upload-node',
      title: 'Let users upload files directly to S3 with a presigned URL',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 's3-presigned-urls',
      question: `Users upload profile photos (JPEG/PNG/WebP, max 5 MB). Right now the browser sends the file to your Express API, which then uploads it to S3. Under load the API runs out of memory.

Change the design so the browser uploads **directly to S3**:

1. Write an Express endpoint \`POST /uploads/presign\` using **AWS SDK v3** that returns a presigned PUT URL.
2. Write the browser code that uploads the file with that URL.
3. What S3 bucket setting is needed for the browser upload to work?`,
      hints: [
        'Packages: `@aws-sdk/client-s3` (for `PutObjectCommand`) and `@aws-sdk/s3-request-presigner` (for `getSignedUrl`).',
        'The server decides the object **key** (never trust a file name from the client) and validates the content type. Keep the URL short-lived (a few minutes).',
        'The browser is on a different origin than `my-bucket.s3.amazonaws.com`. What blocks cross-origin requests in a browser?',
      ],
      solution: `**Idea:** the API only **signs** a short-lived URL (fast, no file bytes). The browser PUTs the file straight to S3 with it. The API never holds the file in memory.

**1. Server (Express, AWS SDK v3):**

\`\`\`javascript
import express from 'express';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION }); // creds come from the IAM role
const BUCKET = process.env.UPLOAD_BUCKET;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const app = express();
app.use(express.json());

app.post('/uploads/presign', requireAuth, async (req, res) => {
  const { contentType, size } = req.body;

  const ext = ALLOWED[contentType];
  if (!ext) return res.status(400).json({ error: 'Only JPEG, PNG or WebP allowed' });
  if (!Number.isInteger(size) || size <= 0 || size > MAX_BYTES) {
    return res.status(400).json({ error: 'File must be 5 MB or less' });
  }

  // Server chooses the key: per-user folder + random name (no path tricks, no overwrites)
  const key = \`uploads/\${req.user.id}/\${randomUUID()}.\${ext}\`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType, // the browser must send this exact Content-Type
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // valid for 5 minutes
  res.json({ url, key });
});
\`\`\`

**2. Browser:**

\`\`\`javascript
async function uploadAvatar(file) {
  // Ask our API for a signed URL
  const res = await fetch('/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  const { url, key } = await res.json();

  // Upload the file bytes directly to S3
  const put = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type }, // must match what was signed
    body: file,
  });
  if (!put.ok) throw new Error(\`Upload failed with status \${put.status}\`);

  // Tell our API the upload is done so it can save the key on the user
  await fetch('/api/me/avatar', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  return key;
}
\`\`\`

**3. Bucket CORS** — the browser sends a preflight (OPTIONS) request to S3, so the bucket must allow your origin:

\`\`\`json
[
  {
    "AllowedOrigins": ["https://app.example.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
\`\`\`

Keep **Block Public Access** on. The bucket stays private; the signature grants temporary access to one key.

**Why it works:** the signature proves your server (its IAM role) allowed this one PUT to this one key for 5 minutes. S3 checks it and stores the file. The API handles a tiny JSON request instead of megabytes of file data.

**Edge cases:**

- The size check on the server only checks what the client **says**. A presigned PUT does not enforce a max size by itself. For a hard limit use a **presigned POST** (\`createPresignedPost\` from \`@aws-sdk/s3-presigned-post\`) with a \`content-length-range\` condition.
- If the \`Content-Type\` header does not match the signed one, S3 returns **403 SignatureDoesNotMatch**.
- The IAM role that signs needs \`s3:PutObject\` on \`uploads/*\`. The URL can never do more than the signer is allowed to do.`,
      followUps: [
        {
          q: 'How do users view private images later?',
          a: 'Generate a presigned **GET** URL (`GetObjectCommand` + `getSignedUrl`) when you return the profile, or serve them through CloudFront with signed URLs/cookies for caching.',
        },
        {
          q: 'How do you clean up files that were uploaded but never saved to a user?',
          a: 'Upload to a `tmp/` prefix first, move/mark them when the API confirms, and add an S3 **lifecycle rule** that deletes `tmp/` objects after 1 day.',
        },
        {
          q: 'How would you handle 2 GB video uploads?',
          a: 'Use **multipart upload**: the server creates the upload and presigns a URL per part; the browser uploads parts in parallel (and can retry a failed part); then the server completes the upload.',
        },
      ],
    },
    {
      id: 'cloud-run-deploy-with-secrets-and-canary',
      title: 'Deploy a Node service to Cloud Run with secrets and a safe rollout',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'cloud-run-deploy',
      question: `You have a containerized Node API (it reads \`PORT\` and listens on \`0.0.0.0\`) and an **existing** Cloud Run service called \`api\` in \`us-central1\`. Write the \`gcloud\` commands to:

1. Build the image and push it to Artifact Registry, tagged with the git commit.
2. Store \`MONGO_URL\` in **Secret Manager** (not as a plain env var) and give only the service's own service account access.
3. Deploy the new version **without sending it any user traffic**, test it on its own URL, then send it **10%** of traffic, then **100%**.
4. Roll back fast if something goes wrong.`,
      hints: [
        'Cloud Run keeps every deploy as an immutable **revision**. Traffic can be split between revisions.',
        'Look at the flags `--no-traffic` and `--tag` on `gcloud run deploy`, and the command `gcloud run services update-traffic`.',
        'Secrets are attached with `--set-secrets ENV_NAME=secret-name:version`. The runtime service account needs the `roles/secretmanager.secretAccessor` role.',
      ],
      solution: `**Idea:** build an image per commit, mount the secret from Secret Manager, deploy a tagged revision with 0% traffic, then shift traffic in steps. Rollback = point traffic back at the old revision.

\`\`\`bash
PROJECT=my-project
REGION=us-central1
SA=api-runtime@$PROJECT.iam.gserviceaccount.com
IMAGE=$REGION-docker.pkg.dev/$PROJECT/api-repo/api:$(git rev-parse --short HEAD)

# --- one-time setup ---
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \\
  cloudbuild.googleapis.com secretmanager.googleapis.com
gcloud artifacts repositories create api-repo \\
  --repository-format=docker --location=$REGION
gcloud iam service-accounts create api-runtime

# Secret: read the value from stdin so it never lands in shell history files
printf '%s' "$MONGO_URL" | gcloud secrets create mongo-url --data-file=-
# Only the API's own service account may read it
gcloud secrets add-iam-policy-binding mongo-url \\
  --member="serviceAccount:$SA" \\
  --role="roles/secretmanager.secretAccessor"

# --- 1. build + push (Cloud Build builds for linux/amd64) ---
gcloud builds submit --tag $IMAGE

# --- 3a. deploy a new revision with NO traffic, reachable on a "canary" tag URL ---
gcloud run deploy api \\
  --image $IMAGE \\
  --region $REGION \\
  --service-account $SA \\
  --set-secrets MONGO_URL=mongo-url:latest \\
  --set-env-vars NODE_ENV=production \\
  --no-traffic \\
  --tag canary
# The output prints a URL like https://canary---api-xxxxx.a.run.app -> run smoke tests on it

# --- 3b. send 10% of real users to the canary revision ---
gcloud run services update-traffic api --region $REGION --to-tags canary=10

# --- 3c. looks healthy (errors, latency) -> send everyone ---
gcloud run services update-traffic api --region $REGION --to-latest

# --- 4. rollback: send 100% back to the previous revision ---
gcloud run revisions list --service api --region $REGION
gcloud run services update-traffic api --region $REGION --to-revisions api-00041-abc=100
\`\`\`

**Why it works:**

- Revisions are immutable, so the old one is still there and rollback is instant (no rebuild).
- \`--no-traffic --tag canary\` gives the new revision its own URL for testing while users stay on the current one.
- \`--set-secrets\` injects the secret as an env var at container start. The secret value is never in the image, the repo, or the service config.
- A dedicated service account (instead of the default compute one, which often has broad permissions) is least privilege.

**Note:** \`--no-traffic\` only works on an existing service — the very first deploy must serve traffic. Pinning a secret to a version number (e.g. \`mongo-url:3\`) instead of \`latest\` makes deploys reproducible.`,
      followUps: [
        {
          q: 'How would you avoid cold starts on Cloud Run?',
          a: 'Set `--min-instances 1` (you pay for an idle instance), keep the image small, and do less work at startup (lazy-load heavy modules, connect to DB once and reuse).',
        },
        {
          q: 'How do you automate this from GitHub Actions without a JSON key?',
          a: 'Use **Workload Identity Federation**: GitHub\'s OIDC token is exchanged for short-lived Google credentials via `google-github-actions/auth`, so no long-lived service-account key is stored in GitHub.',
        },
      ],
    },
    {
      id: 'github-actions-test-build-deploy',
      title: 'GitHub Actions: test on PR, build + deploy on main',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'github-actions-advanced',
      question: `Write one GitHub Actions workflow for a Node API that runs on ECS Fargate:

- On every **pull request** to \`main\`: install, lint and run tests (tests need a MongoDB).
- On every **push to main**: run the same tests, then build a Docker image, push it to **ECR** tagged with the commit SHA, and deploy it to ECS.
- Cache npm and Docker layers so it is fast.
- Do **not** store long-lived AWS access keys in GitHub.
- The deploy must need a manual approval.`,
      hints: [
        'Use two jobs: `test` and `deploy`. `needs: test` makes deploy wait, and an `if:` makes it run only for pushes to main.',
        'For tests, a `services:` block can start a MongoDB container next to the job.',
        'For AWS without stored keys use **OIDC**: `permissions: id-token: write` + `aws-actions/configure-aws-credentials` with `role-to-assume`. Manual approval comes from a GitHub **Environment** with required reviewers.',
      ],
      solution: `**Idea:** one workflow, two jobs. \`test\` runs everywhere. \`deploy\` runs only on main, after tests pass, inside a protected \`production\` environment, and uses OIDC to get short-lived AWS credentials.

\`\`\`yaml
name: CI/CD

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

# Cancel older runs of the same PR, but never cancel a deploy halfway
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: \${{ github.event_name == 'pull_request' }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:7
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm              # caches ~/.npm keyed on package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test
        env:
          MONGO_URL: mongodb://localhost:27017/test

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production       # required reviewers set in repo settings -> manual approval
    permissions:
      contents: read
      id-token: write             # lets the job request an OIDC token
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: us-east-1

      - id: ecr
        uses: aws-actions/amazon-ecr-login@v2

      - uses: docker/setup-buildx-action@v3

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: \${{ steps.ecr.outputs.registry }}/api:\${{ github.sha }}
          cache-from: type=gha                 # reuse layers from earlier runs
          cache-to: type=gha,mode=max

      - id: taskdef
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: .aws/task-definition.json
          container-name: api
          image: \${{ steps.ecr.outputs.registry }}/api:\${{ github.sha }}

      - uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: \${{ steps.taskdef.outputs.task-definition }}
          cluster: prod-cluster
          service: api
          wait-for-service-stability: true     # job fails if new tasks never become healthy
\`\`\`

**Why it works:**

- \`needs\` + \`if\` = PRs only run tests; main runs tests then deploys.
- \`setup-node\` with \`cache: npm\` and Buildx with \`type=gha\` cache make repeat runs much faster.
- OIDC: GitHub gives the job a signed token, AWS trusts GitHub's identity provider, and the role's **trust policy** only allows this repo + branch to assume it. Credentials expire in about an hour; nothing long-lived is stored.
- The \`production\` environment pauses the job until a reviewer approves.
- Tagging with \`github.sha\` means every image is traceable to a commit, and rollback = redeploy an older SHA.

Action major versions change over time — check the current ones in each action's README.`,
      followUps: [
        {
          q: 'What does the IAM trust policy for the deploy role check?',
          a: 'That the token comes from `token.actions.githubusercontent.com`, `aud` is `sts.amazonaws.com`, and `sub` matches your repo and branch, e.g. `repo:my-org/api:ref:refs/heads/main` (or `repo:my-org/api:environment:production`).',
        },
        {
          q: 'How would you test against Node 20 and 22 at the same time?',
          a: 'Add `strategy: matrix: node: [20, 22]` to the test job and use `node-version: ${{ matrix.node }}`. GitHub runs one job per value in parallel.',
        },
        {
          q: 'Why not use the `latest` image tag?',
          a: '`latest` is mutable, so you cannot tell what is running or roll back reliably, and ECS may not pull a new image. Immutable tags (commit SHA) are traceable and repeatable.',
        },
      ],
    },
    {
      id: 'nginx-proxy-websocket-gzip',
      title: 'Fix an nginx reverse proxy: WebSockets, gzip and real client IPs',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'nginx-reverse-proxy',
      question: `An Express + Socket.IO app runs on port 3000 on an EC2 server, behind nginx. Three complaints:

1. Socket.IO never upgrades to WebSocket. It falls back to slow HTTP polling, and the browser shows a failed \`wss://\` request.
2. JSON responses are large and **not compressed**.
3. In Express, \`req.ip\` is always \`127.0.0.1\`, so rate limiting blocks everyone together.

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
\`\`\`

Write a fixed config (also redirect HTTP to HTTPS) and say what to change in Express.`,
      hints: [
        'A WebSocket starts as a normal HTTP/1.1 request with `Upgrade: websocket` and `Connection: Upgrade` headers. By default nginx talks HTTP/1.0 to the backend and does **not** pass those headers on.',
        'gzip is off unless you turn it on, and by default only `text/html` is compressed.',
        'To Express, every request now comes from nginx (127.0.0.1). nginx must send the real client IP in a header, and Express must be told to trust it.',
      ],
      solution: `**Idea:** forward the upgrade headers with HTTP/1.1, turn on gzip for JSON, and pass \`X-Forwarded-*\` headers that Express trusts.

\`\`\`nginx
# These two blocks go in the http { } context (files in conf.d/ are already inside it)

# Connection header: "upgrade" when the client asks for it, "close" otherwise
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

upstream api_upstream {
    server 127.0.0.1:3000;
    keepalive 32;                      # reuse connections to Node
}

# HTTP -> HTTPS
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;                          # nginx 1.25.1+ (older: "listen 443 ssl http2;")
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    client_max_body_size 10m;

    # --- compression ---
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;              # tiny responses are not worth compressing
    gzip_proxied any;                  # also compress responses coming from the backend
    gzip_vary on;                      # adds "Vary: Accept-Encoding" for caches
    gzip_types application/json application/javascript text/css text/plain image/svg+xml;

    # Shared headers so the app knows the real client
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # --- WebSockets (Socket.IO) ---
    location /socket.io/ {
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        # A proxy_set_header inside a location REPLACES the server-level ones,
        # so repeat them here
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;      # default 60s would cut idle sockets
    }

    # --- normal API traffic ---
    location / {
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";    # required for upstream keepalive
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

**Express change:**

\`\`\`javascript
// Trust exactly one proxy hop (nginx). Now req.ip comes from X-Forwarded-For
// and req.protocol / req.secure come from X-Forwarded-Proto.
app.set('trust proxy', 1);
\`\`\`

Test with \`sudo nginx -t\` and then \`sudo systemctl reload nginx\` (reload = no dropped connections).

**Why it works:**

- \`proxy_http_version 1.1\` + passing \`Upgrade\` and \`Connection\` lets the backend switch the connection to WebSocket. The \`map\` sends \`close\` for normal requests.
- \`proxy_read_timeout\` keeps quiet sockets open longer than nginx's 60-second default.
- \`gzip_types\` adds JSON; \`gzip_proxied any\` allows compressing proxied responses.
- \`trust proxy\` makes Express read the client IP from the header nginx sets. Use the exact hop count, not \`true\`, or clients could fake their IP with their own \`X-Forwarded-For\` header.
- **Gotcha:** if any \`proxy_set_header\` appears in a \`location\`, the ones from \`server\` are not inherited there. That is why they are repeated.`,
      followUps: [
        {
          q: 'You run 3 Node instances behind nginx. Socket.IO breaks again. Why?',
          a: 'Polling requests from one client can hit different instances that do not know the session. Use sticky sessions (`ip_hash` or `hash` in the upstream) and the Socket.IO **Redis adapter** so events reach clients on other instances.',
        },
        {
          q: 'Should Node or nginx do gzip?',
          a: 'Prefer the proxy/CDN: it is written in C and keeps CPU free in the Node event loop. Do not compress twice.',
        },
      ],
    },
    {
      id: 'kubernetes-deployment-probes',
      title: 'Write a Kubernetes Deployment + Service with correct probes',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'kubernetes-config-ingress',
      question: `Deploy a Node API (port 8080) to Kubernetes:

- 3 replicas, rolling updates with **no** loss of capacity.
- \`MONGO_URL\` from a Kubernetes Secret named \`api-secrets\` (key \`mongo-url\`).
- CPU/memory requests and limits.
- A Service so other pods can call it at \`http://api\`.
- Probes. The current setup has a single **liveness** probe on \`/health\` that pings MongoDB. When Mongo had a 30-second blip, **all pods restarted at once** and the outage got worse.

Write the YAML and the Node health endpoints.`,
      hints: [
        '**Readiness** = "should I get traffic right now?" (failing removes the pod from the Service). **Liveness** = "is the process stuck and needs a restart?" (failing kills the container).',
        'Should a database outage restart your app? Restarting will not fix the database.',
        'For slow-starting apps, a **startupProbe** holds off liveness checks until the app has started.',
      ],
      solution: `**Idea:** liveness checks only the process itself. Readiness checks dependencies, so during a DB blip pods just stop getting traffic instead of restarting. Rolling update with \`maxUnavailable: 0\`.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0        # never go below 3 ready pods
      maxSurge: 1              # add 1 new pod at a time
  template:
    metadata:
      labels:
        app: api               # must match the selector
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/api:3f2a1c9   # immutable tag
          ports:
            - containerPort: 8080
          env:
            - name: PORT
              value: "8080"
            - name: MONGO_URL
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: mongo-url
          resources:
            requests:            # what the scheduler reserves
              cpu: 250m
              memory: 256Mi
            limits:
              memory: 512Mi      # over this -> OOMKilled
          startupProbe:          # up to 30 x 2s = 60s to start before liveness kicks in
            httpGet:
              path: /livez
              port: 8080
            periodSeconds: 2
            failureThreshold: 30
          readinessProbe:        # failing -> removed from the Service, NOT restarted
            httpGet:
              path: /readyz
              port: 8080
            periodSeconds: 5
            failureThreshold: 2
          livenessProbe:         # failing -> container restarted
            httpGet:
              path: /livez
              port: 8080
            periodSeconds: 10
            failureThreshold: 3
          lifecycle:
            preStop:             # give the Service time to stop sending traffic
              exec:
                command: ["sleep", "5"]
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
    - port: 80                 # other pods call http://api (port 80)
      targetPort: 8080         # forwarded to the container port
\`\`\`

**Health endpoints in Node:**

\`\`\`javascript
import mongoose from 'mongoose';

let shuttingDown = false;

// Liveness: is THIS process able to respond? No dependency checks.
app.get('/livez', (req, res) => res.status(200).send('ok'));

// Readiness: can I serve real requests right now?
app.get('/readyz', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1; // 1 = connected
  if (shuttingDown || !dbReady) return res.status(503).send('not ready');
  res.status(200).send('ready');
});

process.on('SIGTERM', () => {
  shuttingDown = true;                     // fail readiness first
  server.close(() => process.exit(0));     // finish in-flight requests
});
\`\`\`

**Why it works:**

- During a Mongo blip, \`/readyz\` fails, pods leave the load balancing, and come back when Mongo returns. No restart storm.
- \`/livez\` only fails if the event loop is so stuck it cannot answer — the one case where a restart helps.
- \`maxUnavailable: 0\` + readiness = a new pod gets traffic only when ready, and an old one is removed only after that.
- \`preStop\` sleep: when a pod is deleted, removing it from the Service endpoints happens in parallel with SIGTERM. The short sleep avoids sending requests to a pod that is already closing.
- No CPU limit on purpose: CPU limits can throttle Node badly. Many teams set only a memory limit — this is a common, debated choice.`,
      followUps: [
        {
          q: 'What does CrashLoopBackOff mean and how do you debug it?',
          a: 'The container keeps crashing and Kubernetes waits longer between restarts. Run `kubectl describe pod <name>` (events, exit code, OOMKilled?) and `kubectl logs <name> --previous` (logs of the crashed run).',
        },
        {
          q: 'How do you scale on load?',
          a: 'A **HorizontalPodAutoscaler** targeting e.g. 70% CPU utilization (based on the CPU **requests**), with min 3 and max 10 replicas. Needs metrics-server installed.',
        },
        {
          q: 'Newer Kubernetes has a native sleep for preStop. What is it?',
          a: '`lifecycle.preStop.sleep.seconds: 5` — it does not need a `sleep` binary in the image (useful for distroless). Check your cluster version supports it.',
        },
      ],
    },
    {
      id: 'lambda-s3-thumbnail',
      title: 'Lambda: create a thumbnail when an image is uploaded to S3',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'lambda-basics-layers',
      question: `When a user uploads an image to \`s3://my-app-uploads/uploads/...\`, create a 200x200 WebP thumbnail and save it to a **thumbnails** bucket under \`thumbnails/...\`.

1. Write the Lambda handler (Node.js, AWS SDK v3, ES modules). You may use the \`sharp\` library.
2. What is the classic infinite-loop mistake with this setup?
3. Users say the first thumbnail after a quiet period takes 3 seconds. How do you reduce that?`,
      hints: [
        'The S3 event contains `Records[]`, each with `s3.bucket.name` and `s3.object.key`. The key is **URL-encoded** (spaces become `+`).',
        'Create the S3 client **outside** the handler so warm invocations reuse it.',
        'If the Lambda writes into the same bucket/prefix that triggers it, what happens?',
      ],
      solution: `**Idea:** S3 sends an event, the Lambda downloads the original, resizes it with sharp, and writes the thumbnail to a **different** bucket. Throw on failure so Lambda retries.

\`\`\`javascript
// index.mjs  (Node.js runtime, ES modules)
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Created once per execution environment and reused while it stays warm
const s3 = new S3Client({});
const DEST_BUCKET = process.env.THUMBNAIL_BUCKET;

export const handler = async (event) => {
  const results = await Promise.allSettled(event.Records.map(processRecord));
  const failed = results.filter((r) => r.status === 'rejected');
  failed.forEach((f) => console.error('thumbnail failed', f.reason));
  // Throwing marks the invocation as failed -> Lambda retries (async invoke)
  if (failed.length) throw new Error(\`\${failed.length} record(s) failed\`);
};

async function processRecord(record) {
  const bucket = record.s3.bucket.name;
  // Keys arrive URL-encoded, with spaces as "+"
  const key = decodeURIComponent(record.s3.object.key.replace(/\\+/g, ' '));

  if (!/\\.(jpe?g|png|webp)$/i.test(key)) return; // ignore non-images

  const original = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const input = Buffer.from(await original.Body.transformToByteArray());

  const thumbnail = await sharp(input)
    .resize(200, 200, { fit: 'cover' })   // crop to fill the square
    .webp({ quality: 80 })
    .toBuffer();

  const thumbKey = key.replace(/^uploads\\//, 'thumbnails/').replace(/\\.\\w+$/, '.webp');

  await s3.send(new PutObjectCommand({
    Bucket: DEST_BUCKET,          // a DIFFERENT bucket -> no re-trigger
    Key: thumbKey,
    Body: thumbnail,
    ContentType: 'image/webp',
  }));
  console.log(JSON.stringify({ msg: 'thumbnail created', key, thumbKey }));
}
\`\`\`

Setup notes: the function's role needs \`s3:GetObject\` on the uploads bucket and \`s3:PutObject\` on the thumbnails bucket. The S3 event notification filters on prefix \`uploads/\`. \`sharp\` has native binaries, so install it for the Lambda platform (e.g. \`npm install --os=linux --cpu=x64 sharp\`, or \`--cpu=arm64\` for Graviton) or use a layer.

**2. The infinite loop:** if the thumbnail is written to the **same bucket and a prefix that also triggers** the function, every thumbnail triggers another run, forever — and the bill grows fast. Fix: separate bucket, or a strict prefix filter (\`uploads/\`) that the output never matches. (AWS has some recursive-loop detection now, but do not rely on it.)

**3. Cold starts:**

- Keep init light: create clients outside the handler (done), import only what you need.
- **Bundle** with esbuild to ship a small file instead of a big \`node_modules\`.
- **More memory = more CPU** in Lambda; 1024 MB often starts and resizes faster and may cost about the same.
- Use **arm64** (Graviton) — usually cheaper per ms.
- If latency truly matters: **provisioned concurrency** keeps N environments warm (you pay for them).

**Why it works:** S3 invokes the function asynchronously with the object location. Throwing on failure lets Lambda's built-in retries (2 extra attempts for async invokes) handle transient errors, and writing to another bucket breaks the trigger loop.`,
      followUps: [
        {
          q: 'What if processing keeps failing for one image?',
          a: 'After the async retries, the event is lost unless you configure an **on-failure destination** (SQS/SNS) or a DLQ on the function. Then you can inspect and replay it.',
        },
        {
          q: 'Is this handler idempotent?',
          a: 'Yes: running it twice for the same key writes the same thumbnail to the same key. That matters because S3 events and Lambda retries can deliver the same event more than once.',
        },
        {
          q: 'An upload of a 40 MB image times out. What do you check?',
          a: 'The function timeout (default 3 s — too low), memory (sharp needs RAM), and maybe reject huge files earlier. Look at the REPORT line in CloudWatch Logs for duration and max memory used.',
        },
      ],
    },
    {
      id: 'sqs-consumer-retries-dlq',
      title: 'Build an SQS worker with retries, backoff and a dead-letter queue',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'sqs-sns-eventbridge',
      question: `After checkout, your API sends an \`order.created\` message to an SQS queue. A Node worker (on ECS) must send the confirmation email and update the order. Processing takes up to **40 seconds** (slow email provider).

Problems seen today:

- Some customers get **two** emails.
- One malformed message has been failing and retrying for 3 days.

Write the worker loop with AWS SDK v3. Explain the **visibility timeout** you choose, how retries and the DLQ work, and how you stop duplicate emails.`,
      hints: [
        'When a worker receives a message it becomes **invisible** for the visibility timeout. If it is not deleted before that ends, it becomes visible again and another worker gets it. What if processing takes longer than the timeout?',
        'A **redrive policy** with `maxReceiveCount` moves a message to a dead-letter queue after N failed receives.',
        'Standard SQS is **at-least-once**: duplicates can happen even with a correct timeout. The handler must be **idempotent**.',
      ],
      solution: `**Idea:** long-poll, process, delete only on success. Visibility timeout comfortably above the max processing time. A DLQ catches poison messages. An idempotency record stops duplicate emails.

**Why two emails today:** the visibility timeout was probably the default **30 s**, but processing takes up to 40 s. The message became visible again while worker A was still working, worker B took it, and both sent the email.

**Queue setup** — visibility timeout **120 s** (about 3x the worst case), and a redrive policy on the main queue:

\`\`\`json
{
  "deadLetterTargetArn": "arn:aws:sqs:us-east-1:123456789012:order-events-dlq",
  "maxReceiveCount": 5
}
\`\`\`

After 5 failed receives the message moves to the DLQ instead of retrying forever. Set an alarm on the DLQ's \`ApproximateNumberOfMessagesVisible > 0\`.

**Worker:**

\`\`\`javascript
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} from '@aws-sdk/client-sqs';
import { ProcessedEvent, Order } from './models.js';
import { sendConfirmationEmail } from './email.js';

const sqs = new SQSClient({});
const QUEUE_URL = process.env.QUEUE_URL;
let running = true;
process.on('SIGTERM', () => { running = false; }); // finish current batch, then exit

async function pollForever() {
  while (running) {
    try {
      const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,                 // long polling: fewer empty, billed calls
        MessageSystemAttributeNames: ['ApproximateReceiveCount'],
      }));
      await Promise.all(Messages.map(handleMessage));
    } catch (err) {
      console.error('receive failed', err);
      await new Promise((r) => setTimeout(r, 5000)); // back off on SQS/network errors
    }
  }
}

async function handleMessage(msg) {
  const attempt = Number(msg.Attributes?.ApproximateReceiveCount ?? 1);
  try {
    const event = JSON.parse(msg.Body);      // malformed JSON throws -> retried -> DLQ
    await processOrderCreated(event);
    // Delete ONLY after success
    await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: msg.ReceiptHandle }));
  } catch (err) {
    console.error(JSON.stringify({ msg: 'processing failed', id: msg.MessageId, attempt, error: err.message }));
    // Exponential backoff: 30s, 60s, 120s... instead of waiting the full timeout each time
    const delay = Math.min(30 * 2 ** (attempt - 1), 900);
    await sqs.send(new ChangeMessageVisibilityCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: msg.ReceiptHandle,
      VisibilityTimeout: delay,
    }));
  }
}

async function processOrderCreated(event) {
  // Idempotency: a unique _id means only the FIRST insert succeeds
  try {
    await ProcessedEvent.create({ _id: \`order-created:\${event.orderId}\` });
  } catch (err) {
    if (err.code === 11000) return;          // duplicate key -> already handled, skip
    throw err;
  }
  try {
    await sendConfirmationEmail(event.orderId);
    await Order.updateOne({ _id: event.orderId }, { $set: { confirmationSent: true } });
  } catch (err) {
    // Remove the marker so a retry can try again
    await ProcessedEvent.deleteOne({ _id: \`order-created:\${event.orderId}\` });
    throw err;
  }
}

pollForever();
\`\`\`

**Why it works:**

- Visibility timeout > processing time, so a message is not handed to a second worker while the first is still working.
- Not deleting on failure = automatic retry. \`ChangeMessageVisibility\` adds backoff so a struggling provider is not hammered.
- \`maxReceiveCount: 5\` stops poison messages after 5 tries and parks them in the DLQ for a human to inspect and **redrive** (move back) after a fix.
- The idempotency key (by order id, not message id — the API might send the same event twice) makes duplicates harmless. Many email providers also accept an idempotency key, which closes the last small gap.`,
      followUps: [
        {
          q: 'Would a FIFO queue fix duplicates?',
          a: 'FIFO gives exactly-once **delivery** within a 5-minute dedup window and strict ordering per group, but has lower throughput, and your handler can still fail after the side effect. You still want idempotent handlers.',
        },
        {
          q: 'How does this look with Lambda instead of a worker?',
          a: 'An SQS event source mapping polls for you. Set the queue visibility timeout to at least 6x the function timeout (AWS guidance), enable `ReportBatchItemFailures`, and return `{ batchItemFailures: [{ itemIdentifier: messageId }] }` so only failed messages are retried.',
        },
        {
          q: 'What if one job can take 20 minutes?',
          a: 'Send a "heartbeat": call `ChangeMessageVisibility` every few minutes to extend the timeout while still working (max 12 hours total).',
        },
      ],
    },
    {
      id: 'set-up-api-alerts',
      title: 'Set up useful alerts for a production API',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'common',
      relatedTopic: 'cloudwatch',
      question: `Your Node API runs on ECS behind an Application Load Balancer (ALB), with MongoDB Atlas and an SQS worker. Last month an outage lasted 2 hours before a customer told you. You also tried alerting on "CPU > 70%" and people muted it because it fired all the time.

What would you alert on, how would you avoid noisy alerts, and show one concrete alarm.`,
      hints: [
        'Alert on what **users feel** (symptoms): errors, slowness, being down. Use causes like CPU for dashboards and auto scaling.',
        'Think of the "golden signals": latency, traffic, errors, saturation.',
        'An alarm that fires on one bad minute is noisy. Use rates (percent), percentiles (p95/p99), and "N out of M minutes".',
      ],
      solution: `**Idea:** page a human only for user-facing symptoms that need action now. Everything else becomes a ticket or a dashboard. Every alert has an owner and a short runbook.

**Page (wake someone up):**

- **5xx error rate** > 2% for 3 of 5 minutes (from ALB metrics: \`HTTPCode_Target_5XX_Count / RequestCount\`).
- **p99 latency** (\`TargetResponseTime\`) > 2 s for 5 minutes.
- **Uptime check** from outside (Route 53 health check / synthetic canary) failing on \`/health\` from 2+ locations — catches DNS, certificate and "whole thing is down" problems the app cannot report itself.
- **Healthy host count** below the minimum.

**Ticket / Slack (fix during work hours):**

- **DLQ has messages** (\`ApproximateNumberOfMessagesVisible > 0\` on the DLQ).
- **Queue backlog age** (\`ApproximateAgeOfOldestMessage\`) above e.g. 10 minutes.
- DB connections near the Atlas limit, disk filling, certificate expiring in < 14 days.
- High CPU/memory over a long window — or better, let **auto scaling** react to it.

**Concrete alarm — 5xx rate with metric math:**

\`metrics.json\`:

\`\`\`json
[
  {
    "Id": "errors",
    "MetricStat": {
      "Metric": {
        "Namespace": "AWS/ApplicationELB",
        "MetricName": "HTTPCode_Target_5XX_Count",
        "Dimensions": [{ "Name": "LoadBalancer", "Value": "app/prod-alb/50dc6c495c0c9188" }]
      },
      "Period": 60,
      "Stat": "Sum"
    },
    "ReturnData": false
  },
  {
    "Id": "requests",
    "MetricStat": {
      "Metric": {
        "Namespace": "AWS/ApplicationELB",
        "MetricName": "RequestCount",
        "Dimensions": [{ "Name": "LoadBalancer", "Value": "app/prod-alb/50dc6c495c0c9188" }]
      },
      "Period": 60,
      "Stat": "Sum"
    },
    "ReturnData": false
  },
  {
    "Id": "errorRate",
    "Expression": "100 * errors / requests",
    "Label": "5xx error rate (%)",
    "ReturnData": true
  }
]
\`\`\`

\`\`\`bash
aws cloudwatch put-metric-alarm \\
  --alarm-name api-prod-5xx-rate-high \\
  --metrics file://metrics.json \\
  --comparison-operator GreaterThanThreshold \\
  --threshold 2 \\
  --evaluation-periods 5 \\
  --datapoints-to-alarm 3 \\
  --treat-missing-data notBreaching \\
  --alarm-actions arn:aws:sns:us-east-1:123456789012:oncall-pager \\
  --ok-actions arn:aws:sns:us-east-1:123456789012:oncall-pager
\`\`\`

**Avoiding noise:**

- **Rates, not counts.** "50 errors" means a lot at 100 requests and nothing at 1 million.
- **3 of 5 minutes**, not 1 bad minute.
- **Percentiles, not averages.** The average hides the slow 1% of users.
- Every page must be **actionable**. If nobody needs to act, it is not a page.
- Review alerts after each incident: did the right one fire? Delete ones that never help.

**Why it works:** symptom alerts catch every cause (bad deploy, DB down, third-party outage) with one rule, and the outside uptime check covers the case where the whole stack is dead.`,
      followUps: [
        {
          q: 'How do you find WHY the error rate went up?',
          a: 'Structured JSON logs with a request id, filtered by status 5xx in CloudWatch Logs Insights; traces (X-Ray / OpenTelemetry) to see which dependency was slow; and checking what changed (recent deploy, config, traffic).',
        },
        {
          q: 'What is an SLO and how does it relate to alerts?',
          a: 'A target like "99.9% of requests succeed over 30 days". The 0.1% is the **error budget**. Advanced teams alert on how fast the budget is burning instead of fixed thresholds.',
        },
      ],
    },
    {
      id: 'terraform-private-s3-bucket',
      title: 'Terraform: a private, versioned S3 bucket with remote state',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'occasional',
      relatedTopic: 'terraform-iac',
      question: `Your team creates buckets by clicking in the AWS console, and staging and prod are slightly different. Write Terraform that creates an uploads bucket per environment with:

- name \`my-app-<env>-uploads\` (env is a variable)
- all public access blocked
- versioning on, encryption at rest
- objects under \`tmp/\` deleted after 1 day; old versions deleted after 30 days
- state stored **remotely** in S3 with locking

Then list the commands to apply it.`,
      hints: [
        'In AWS provider v4+, bucket settings are separate resources: `aws_s3_bucket_versioning`, `aws_s3_bucket_public_access_block`, `aws_s3_bucket_server_side_encryption_configuration`, `aws_s3_bucket_lifecycle_configuration`.',
        'Remote state goes in a `backend "s3"` block inside `terraform { }`. Locking stops two people from applying at the same time.',
      ],
      solution: `**Idea:** describe the bucket and its settings as code, use a variable for the environment, and keep state in a shared, locked S3 backend.

\`\`\`hcl
terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"   # pin a major version; check the current one
    }
  }

  # Remote state: shared by the team, encrypted, locked during apply
  backend "s3" {
    bucket       = "my-company-terraform-state"
    key          = "api/uploads/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true    # S3-native locking (Terraform 1.10+); older setups use dynamodb_table
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "environment" {
  type        = string
  description = "staging or prod"
}

resource "aws_s3_bucket" "uploads" {
  bucket = "my-app-\${var.environment}-uploads"
  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"   # S3-managed keys; use "aws:kms" for your own KMS key
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "delete-tmp-uploads"
    status = "Enabled"
    filter {
      prefix = "tmp/"
    }
    expiration {
      days = 1
    }
  }

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}                    # whole bucket
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

output "uploads_bucket_name" {
  value = aws_s3_bucket.uploads.bucket
}
\`\`\`

**Commands:**

\`\`\`bash
terraform init                                         # downloads provider, connects backend
terraform fmt -check && terraform validate
terraform plan -var="environment=staging" -out=tfplan  # review what will change
terraform apply tfplan                                 # applies exactly the reviewed plan
\`\`\`

For several environments, use a different state \`key\` (or separate state buckets/accounts) per environment, e.g. via \`terraform init -backend-config=...\` or a folder per env.

**Why it works:** the same code creates identical buckets for every environment, changes are reviewed in a plan (and a PR), and remote locked state means two engineers cannot corrupt it by applying at the same time.`,
      followUps: [
        {
          q: 'Someone changed the bucket in the console. What happens?',
          a: 'That is **drift**. The next `terraform plan` shows the difference and `apply` puts it back to what the code says. Fix: make the change in code, or lock down console write access.',
        },
        {
          q: 'How do you bring an existing console-made bucket under Terraform?',
          a: 'Write the resource, then import it: an `import { to = aws_s3_bucket.uploads, id = "my-app-prod-uploads" }` block (Terraform 1.5+) or `terraform import`. Then run plan until it shows no changes.',
        },
        {
          q: 'Why is the state file sensitive?',
          a: 'It can contain secrets in plain text (DB passwords, keys from resources). Keep it in an encrypted, access-controlled bucket — never in git.',
        },
      ],
    },
    {
      id: 'lambda-rds-timeouts-and-connections',
      title: 'Debug: Lambda times out and RDS runs out of connections',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'vpc-basics',
      question: `An API Gateway + Lambda function reads orders from **RDS PostgreSQL**. To reach the private database, someone put the Lambda **inside the VPC**. Since then:

1. Every request that also calls the **Stripe API** hangs until the Lambda times out (30 s).
2. Requests that only query the DB work, but during a traffic spike RDS logs \`FATAL: sorry, too many clients already\` and errors pile up.

\`\`\`javascript
import pg from 'pg';
import Stripe from 'stripe';

export const handler = async (event) => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [event.pathParameters.id]);

  const stripe = new Stripe(process.env.STRIPE_KEY);
  const intent = await stripe.paymentIntents.retrieve(rows[0].payment_intent_id);

  return { statusCode: 200, body: JSON.stringify({ order: rows[0], status: intent.status }) };
};
\`\`\`

Explain both problems and fix them (network + code).`,
      hints: [
        'A Lambda inside a VPC gets only private IPs in the subnets you choose. How does something with only a private IP reach the public internet?',
        'Each concurrent Lambda execution environment is a separate process. If 200 run at once and each opens up to 10 connections — and creates a NEW pool on every request — how many connections can RDS see?',
        'Look at **RDS Proxy**, and at creating the pool **outside** the handler.',
      ],
      solution: `**Idea:** problem 1 is networking (no route to the internet from private subnets). Problem 2 is connection management (a new pool per request, times many concurrent Lambdas).

**Problem 1 — Stripe calls hang**

A Lambda in a VPC uses ENIs (network interfaces) with **private IPs only**. Even in a "public" subnet it gets no public IP, so it cannot reach \`api.stripe.com\`. The request just waits until the Lambda times out.

Fix the network:

- Put the Lambda in **private subnets** whose route table sends \`0.0.0.0/0\` to a **NAT Gateway** (which lives in a public subnet). Now outbound internet works.
- For AWS services (Secrets Manager, S3, SQS) you can add **VPC endpoints** instead, so that traffic does not go through (and pay for) the NAT.
- Security groups: the RDS security group allows inbound **5432 from the Lambda's security group** (reference the SG, not an IP range).

**Problem 2 — too many connections**

- \`new pg.Pool()\` **inside** the handler creates a fresh pool (and new connections) on every request, and never closes them. Warm environments keep leaking connections.
- Lambda scales by adding environments. 200 concurrent environments x up to 10 connections each = up to 2,000 connections. A small RDS instance allows only a few hundred (it depends on instance memory — check current docs).

Fixed code:

\`\`\`javascript
import pg from 'pg';
import Stripe from 'stripe';

// Created ONCE per execution environment, reused by every warm invocation
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // points at the RDS Proxy endpoint
  max: 1,                         // one environment handles one request at a time
  idleTimeoutMillis: 60_000,
  connectionTimeoutMillis: 5_000, // fail fast instead of hanging until the Lambda timeout
});
const stripe = new Stripe(process.env.STRIPE_KEY, { timeout: 8_000 });

export const handler = async (event) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, payment_intent_id, total FROM orders WHERE id = $1',
      [event.pathParameters.id],
    );
    if (!rows.length) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };

    const intent = await stripe.paymentIntents.retrieve(rows[0].payment_intent_id);
    return { statusCode: 200, body: JSON.stringify({ order: rows[0], status: intent.status }) };
  } catch (err) {
    console.error(JSON.stringify({ msg: 'order lookup failed', error: err.message }));
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
\`\`\`

And put **RDS Proxy** between Lambda and RDS. It keeps a small pool of real DB connections and shares them across many Lambda connections, so spikes do not exhaust RDS. Optionally set **reserved concurrency** on the function as a hard cap on how many environments (and connections) can exist.

**Why it works:** the NAT Gateway gives private subnets a way out to the internet. One connection per environment + RDS Proxy turns "connections = concurrency x pool size" into a small, controlled number. Explicit timeouts turn hangs into fast, logged errors.`,
      followUps: [
        {
          q: 'Does putting Lambda in a VPC still cause huge cold starts?',
          a: 'Much less than before 2019. AWS now creates shared network interfaces (Hyperplane ENIs) when the function is configured, not on each cold start. VPC Lambdas still need correct subnets/SGs and a NAT for internet.',
        },
        {
          q: 'What would you use instead of RDS + Lambda to avoid this problem?',
          a: 'DynamoDB (HTTP-based, no connection limits), Aurora with the Data API, or run the API on ECS/Fargate where a few long-lived processes keep a normal connection pool.',
        },
        {
          q: 'NAT Gateways are expensive. Any alternative?',
          a: 'Use VPC endpoints for AWS services (the S3/DynamoDB gateway endpoints are free), keep only internet-bound traffic on the NAT, or keep the function out of the VPC if it does not need private resources.',
        },
      ],
    },
    {
      id: 'alb-502-on-deploys',
      title: 'Debug: random 502s from the load balancer, worse during deploys',
      difficulty: 'hard',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'load-balancing-autoscaling',
      question: `A Node/Express API runs on ECS Fargate behind an AWS Application Load Balancer (ALB). Two symptoms:

1. A small number of **502 Bad Gateway** errors all day, with no errors in the app logs.
2. A big spike of 502s and 503s during **every deploy**.

Setup facts: ALB idle timeout is the default **60 s**. The app calls \`app.listen(port)\` with no other settings and has no SIGTERM handler. The target group health check path is \`/\` (which returns 200 even before MongoDB is connected). Deregistration delay is 300 s; ECS stopTimeout is the default.

Find the causes and fix them.`,
      hints: [
        'The ALB keeps connections to your targets open and reuses them. Node\'s HTTP server closes idle keep-alive connections after `server.keepAliveTimeout` (default 5 s). What happens if the ALB sends a request on a connection Node just closed?',
        'During a deploy, new tasks get traffic as soon as the health check passes, and old tasks get SIGTERM. What does your app do in each moment?',
      ],
      solution: `**Idea:** three separate bugs. A keep-alive timeout race (the background 502s), new tasks taking traffic before they are ready, and old tasks dying without finishing requests.

**Cause 1 — keep-alive race (the all-day 502s)**

Node closes an idle connection after **5 s**. The ALB thinks it can reuse it for **60 s**. Sometimes the ALB sends a request on a connection at the exact moment Node closes it → the ALB gets a reset → **502**. The app never sees the request, so there is no log.

Rule: **the backend's keep-alive timeout must be longer than the load balancer's idle timeout**, so the ALB always closes first.

**Cause 2 — new tasks get traffic too early**

The health check on \`/\` passes before MongoDB is connected. The new task is put in service and its first requests fail.

**Cause 3 — old tasks killed mid-request**

There is no SIGTERM handler, and Node as PID 1 does not exit on SIGTERM by default. ECS waits for the stop timeout (30 s default) and then sends SIGKILL, cutting any open requests and connections.

**Fix in the app:**

\`\`\`javascript
import express from 'express';
import mongoose from 'mongoose';

const app = express();
let shuttingDown = false;

// Readiness for the ALB health check: only healthy when we can really serve
app.get('/readyz', (req, res) => {
  const ok = !shuttingDown && mongoose.connection.readyState === 1;
  res.status(ok ? 200 : 503).send(ok ? 'ready' : 'not ready');
});

await mongoose.connect(process.env.MONGO_URL);
const port = Number(process.env.PORT) || 8080;
const server = app.listen(port, '0.0.0.0');

// ALB idle timeout = 60s. Keep idle connections open LONGER so the ALB closes first.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000; // must be greater than keepAliveTimeout

process.on('SIGTERM', () => {
  shuttingDown = true;            // health check now fails
  server.close(async () => {      // stop new connections, finish in-flight requests
    await mongoose.disconnect();
    process.exit(0);
  });
  server.closeIdleConnections();  // close idle keep-alive sockets now (Node 18.2+)
  setTimeout(() => process.exit(1), 25_000).unref(); // exit before ECS SIGKILL
});
\`\`\`

**Fix in the infrastructure** (Terraform shown):

\`\`\`hcl
resource "aws_lb_target_group" "api" {
  name                 = "api-prod"
  port                 = 8080
  protocol             = "HTTP"
  target_type          = "ip"           # required for Fargate (awsvpc networking)
  vpc_id               = var.vpc_id
  deregistration_delay = 30             # 300s makes every deploy very slow

  health_check {
    path                = "/readyz"     # real readiness, not "/"
    matcher             = "200"
    interval            = 10
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
  }
}
\`\`\`

Plus in the ECS service: \`deployment_minimum_healthy_percent = 100\` and \`deployment_maximum_percent = 200\`, so ECS starts new tasks and waits for them to be healthy before stopping old ones.

**Why it works:**

- Node's keep-alive is now longer than the ALB's idle timeout, so the race is gone.
- New tasks join only after \`/readyz\` passes twice. Old tasks are first **deregistered** (the ALB stops sending new requests and lets existing ones finish during the 30 s delay), then get SIGTERM, close cleanly, and exit before SIGKILL.`,
      followUps: [
        {
          q: 'How can you tell a 502 from the ALB apart from a 502 your app returned?',
          a: 'ALB metrics: `HTTPCode_ELB_5XX_Count` = generated by the load balancer (connection problems), `HTTPCode_Target_5XX_Count` = returned by your app. ALB access logs also show `target_status_code` and an `error_reason`.',
        },
        {
          q: 'Does the same keep-alive problem exist behind nginx or GCP load balancers?',
          a: 'Yes, with any proxy that reuses connections. The rule is always: the upstream (Node) idle timeout must be longer than the proxy\'s. Google\'s HTTP(S) load balancer, for example, recommends a backend keep-alive longer than its own (check current docs for the value).',
        },
      ],
    },
    {
      id: 'zero-downtime-deploy-strategy',
      title: 'Design a zero-downtime deploy (blue-green vs canary) with DB changes',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'blue-green-canary',
      question: `Your payments API (Node on ECS behind an ALB, MongoDB) has 5 minutes of errors on every deploy, so the team only deploys on Friday nights. The CTO wants **daily deploys with zero downtime and instant rollback**.

The next release also **renames** the user field \`name\` to \`fullName\`.

1. Blue-green or canary — which would you use here, and why?
2. How does rollback work?
3. How do you ship the rename without breaking old and new versions running at the same time?`,
      hints: [
        '**Blue-green**: run the full new version (green) next to the old (blue), then switch all traffic at once. **Canary**: send a small % of traffic to the new version first, watch metrics, then increase.',
        'During any rolling, blue-green or canary deploy, **old and new code run at the same time** against the **same database**.',
        'Database changes that break old code cannot be rolled back by switching traffic. Search for the "expand and contract" pattern.',
      ],
      solution: `**Idea:** use a canary with automatic rollback on alarms for the payments API, and make every DB change backward compatible with the **expand → migrate → contract** pattern across several deploys.

**1. Blue-green vs canary**

- **Blue-green:** two full environments. Test green, flip the load balancer, keep blue for instant rollback. Simple to reason about, but **all** users hit the new version at once, and you pay for double capacity during the switch.
- **Canary:** send 5-10% of traffic to the new version, compare its error rate and latency against the old, then go to 100%. A bad release only hurts a few users.

For a **payments** API I would choose **canary** (smaller blast radius) with **automatic rollback**. On ECS this is CodeDeploy blue/green with a canary traffic config (e.g. \`CodeDeployDefault.ECSCanary10Percent5Minutes\`), using two ALB target groups. On Kubernetes: Argo Rollouts; on Cloud Run: traffic splitting between revisions.

**2. Rollback**

- Attach CloudWatch alarms (5xx rate, p99 latency, payment failure rate) to the deployment. If any fires during the canary window, CodeDeploy sends all traffic back to the old task set automatically — in seconds, no rebuild.
- Images are tagged by commit SHA, so a manual rollback = redeploy the previous SHA.
- Combine with **feature flags**: ship code "dark" and turn the feature on separately. Turning off a flag is the fastest rollback of all.

**3. The rename — expand and contract (3 deploys)**

Renaming in one step breaks: old pods still read \`name\` while new pods write only \`fullName\` (and a rollback would read data it does not understand).

\`\`\`javascript
// ---- Deploy 1: EXPAND (both versions can run together) ----
// Write BOTH fields, read the new one with a fallback
async function updateName(userId, value) {
  await User.updateOne({ _id: userId }, { $set: { fullName: value, name: value } });
}
const displayName = (user) => user.fullName ?? user.name;

// ---- Backfill (a one-off job after deploy 1 is fully live) ----
// Pipeline-style update (MongoDB 4.2+) copies name -> fullName for old documents
await User.updateMany(
  { fullName: { $exists: false }, name: { $exists: true } },
  [{ $set: { fullName: '$name' } }],
);

// ---- Deploy 2: switch reads to fullName only (still writing both) ----
const displayName2 = (user) => user.fullName;

// ---- Deploy 3: CONTRACT (days later, when no running version uses "name") ----
// Stop writing "name", then clean it up
await User.updateMany({ name: { $exists: true } }, { $unset: { name: '' } });
\`\`\`

At every step, the version before and after can run against the same data, so canary and rollback stay safe.

**Other pieces for zero downtime:** readiness checks (new tasks get traffic only when ready), graceful shutdown on SIGTERM, connection draining on the load balancer, and backward-compatible API changes for the frontend/mobile apps (add fields, do not remove them in the same release).

**Why it works:** the canary limits damage and alarms make rollback automatic. Expand/contract means the database is never in a state that only one version understands — which is the real reason "instant rollback" usually fails.`,
      followUps: [
        {
          q: 'What is the difference between a rolling deploy and blue-green?',
          a: 'Rolling replaces instances a few at a time inside the same environment (ECS/Kubernetes default). Cheap and simple, but rollback is another rolling deploy and you cannot test the full new stack before users hit it.',
        },
        {
          q: 'How do you handle long-running jobs or WebSocket connections during a switch?',
          a: 'Drain them: stop sending new work to old instances, give them a longer drain time, make clients reconnect automatically, and make jobs resumable/idempotent so a killed job can be retried.',
        },
      ],
    },
    {
      id: 'investigate-cloud-cost-spike',
      title: 'The AWS bill jumped from $2k to $9k — investigate',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'occasional',
      relatedTopic: 'cloud-cost-optimization',
      question: `Your monthly AWS bill went from about **$2,000 to $9,000** and nobody knows why. Traffic grew only 10%. The stack: ECS Fargate in private subnets (images in ECR), a NAT Gateway, RDS, S3 + CloudFront, Lambda, and CloudWatch Logs.

How do you find the cause step by step? Name the usual suspects for this kind of stack, how you would fix them, and how you would stop it happening again.`,
      hints: [
        'Start broad and drill down: which **service**? Then which **usage type** inside it? Then which resource and which day did it start?',
        'Common hidden costs: NAT Gateway data processing, CloudWatch Logs ingestion, data transfer out, and resources nobody turned off.',
        'A sudden jump on a specific day usually matches a deploy or config change.',
      ],
      solution: `**Idea:** use Cost Explorer to narrow it down (service → usage type → resource → start date), match the start date to a change, fix the cause, then add budgets and anomaly alerts.

**Step 1 — find which service and when**

\`\`\`bash
# Daily cost per service for last month
aws ce get-cost-and-usage \\
  --time-period Start=2026-09-01,End=2026-10-01 \\
  --granularity DAILY \\
  --metrics UnblendedCost \\
  --group-by Type=DIMENSION,Key=SERVICE
\`\`\`

Then group by \`USAGE_TYPE\` for the guilty service (e.g. \`NatGateway-Bytes\`, \`DataTransfer-Out-Bytes\`, \`DataProcessing-Bytes\` for logs). Look at the **day** the line jumped and check deploys and config changes from that day.

**Step 2 — usual suspects and fixes**

- **NAT Gateway data processing.** Every byte through a NAT is charged. Fargate pulling big images from ECR, or the app reading S3, through the NAT adds up fast. Fix: add an **S3 gateway endpoint** (free) and **interface endpoints** for ECR/CloudWatch Logs; shrink images.
- **CloudWatch Logs ingestion.** Someone shipped \`LOG_LEVEL=debug\` or logs full request bodies. Fix: back to \`info\`, sample noisy logs, and set retention (by default logs are **kept forever**).
- **A runaway Lambda.** A recursive trigger (writes to the bucket that triggers it) or a retry storm. Check invocation count graphs.
- **Data transfer out.** CloudFront cache hit ratio dropped (e.g. a new query-string or header in the cache key), so everything goes to the origin. Or large files are served straight from S3 instead of through CloudFront.
- **Auto scaling stuck high.** A memory leak or bad scaling metric keeps 20 tasks running instead of 4.
- **Forgotten resources.** A load test RDS instance, unattached EBS volumes, old snapshots, idle load balancers, a big dev cluster left on.

\`\`\`bash
# S3 gateway endpoint: S3 traffic from private subnets skips the NAT (no endpoint charge)
aws ec2 create-vpc-endpoint \\
  --vpc-id vpc-0abc1234def567890 \\
  --service-name com.amazonaws.us-east-1.s3 \\
  --route-table-ids rtb-0123456789abcdef0

# Stop keeping logs forever
aws logs put-retention-policy --log-group-name /ecs/api --retention-in-days 30
\`\`\`

**Step 3 — prevent it**

- **AWS Budgets** with alerts at 80% and 100% of the expected monthly cost.
- **Cost Anomaly Detection** — alerts on unusual daily spend per service within a day, not at month end.
- **Tags** on every resource (\`team\`, \`env\`, \`service\`) + activate them as cost allocation tags, so you can see cost per service.
- Infrastructure as code, so nothing exists that is not in code (no forgotten console resources).
- A short cost review in the monthly ops meeting.

**Why it works:** cost problems are almost always one or two line items. Drilling down by service, usage type and date finds them in minutes, and anomaly alerts catch the next one in a day instead of at the end of the month.`,
      followUps: [
        {
          q: 'How would you cut steady compute costs once the spike is fixed?',
          a: 'Right-size tasks (check real CPU/memory use), move to Graviton (arm64), use Savings Plans for the steady baseline, Fargate Spot for interruptible workers, and scale dev/staging to zero at night.',
        },
        {
          q: 'Why is cross-AZ traffic a hidden cost?',
          a: 'Traffic between Availability Zones is charged per GB in both directions. Chatty services in different AZs (or a NAT in another AZ) add up. Keep one NAT per AZ and route each subnet to its own AZ\'s NAT.',
        },
      ],
    },
    {
      id: 'disaster-recovery-plan',
      title: 'Design disaster recovery: deleted data and a region outage',
      difficulty: 'hard',
      type: 'design',
      frequency: 'occasional',
      relatedTopic: 'disaster-recovery',
      question: `Your SaaS runs in **us-east-1**: Node API on ECS, MongoDB Atlas (a 3-node replica set across AZs), S3 for user files, Route 53 for DNS. The business says: "we can lose at most **15 minutes** of data and must be back within **1 hour**."

Design the DR plan for two disasters:

1. An engineer runs a script that **deletes most documents** in the \`orders\` collection in production.
2. **The whole us-east-1 region** has a long outage.

A teammate says "we're fine, MongoDB has 3 replicas across AZs". Respond to that too.`,
      hints: [
        '**RPO** (Recovery Point Objective) = how much data you can lose. **RTO** (Recovery Time Objective) = how long you can be down. Here RPO = 15 min, RTO = 1 h.',
        'Replicas copy **every** write — including the delete. Is a replica a backup?',
        'For the region outage, think about what must already exist in a second region (data, images, infrastructure code, DNS) to be back within 1 hour.',
      ],
      solution: `**Idea:** replicas protect against hardware/AZ failure, not against bad writes. For bad writes you need **point-in-time backups**. For a region outage you need data copied to a second region plus infrastructure you can stand up fast, and DNS that can switch.

**The "3 replicas" argument:** replication copies the delete to all 3 nodes within milliseconds. Multi-AZ = **high availability**, not **backup**. It helps with disaster 2 only if the replicas are in different regions, and never with disaster 1.

**Disaster 1 — accidental delete (RPO 15 min)**

- Turn on **Atlas continuous cloud backup** with **point-in-time restore** (restore to any minute in the window). Restore to a **new** cluster at "1 minute before the script ran", then copy the missing \`orders\` back into production (\`mongodump\`/\`mongorestore\` of that collection), so you do not lose newer data in other collections.
- S3: **versioning** on (deleted/overwritten files can be recovered) plus lifecycle rules for old versions.
- Prevention: no human writes to prod by default, scripts reviewed and run against staging first, delete scripts with a dry-run mode, least-privilege DB users.

**Disaster 2 — region outage (RPO 15 min, RTO 1 h)**

Pick a DR tier that matches the targets:

\`\`\`text
Strategy          Typical RTO / RPO        Cost
Backup & restore  hours  / hours           $       (too slow here)
Pilot light       ~1 hour / minutes        $      <- fits our targets
Warm standby      minutes / seconds-mins   $$
Active-active     ~0 / ~0                  $$    (complex: multi-region writes)
\`\`\`

**Pilot light in us-west-2:**

- **Data:** Atlas multi-region cluster with an electable node (or replica) in us-west-2, so data is seconds behind. S3 **Cross-Region Replication** to a bucket in us-west-2.
- **Images:** ECR **cross-region replication**, so the same image exists in us-west-2.
- **Infra:** everything in **Terraform** with region as a variable. The VPC, ALB and an ECS service with 0 tasks already exist in us-west-2; in a disaster you scale it up.
- **Secrets/config:** replicated to the second region (Secrets Manager supports replica secrets).
- **DNS:** Route 53 **failover routing** with a health check on the primary:

\`\`\`hcl
resource "aws_route53_health_check" "primary" {
  fqdn              = "api-use1.example.com"
  type              = "HTTPS"
  port              = 443
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
}

resource "aws_route53_record" "api_primary" {
  zone_id         = var.zone_id
  name            = "api.example.com"
  type            = "CNAME"
  ttl             = 60
  set_identifier  = "primary"
  records         = ["api-use1.example.com"]
  health_check_id = aws_route53_health_check.primary.id

  failover_routing_policy {
    type = "PRIMARY"
  }
}

resource "aws_route53_record" "api_secondary" {
  zone_id        = var.zone_id
  name           = "api.example.com"
  type           = "CNAME"
  ttl            = 60
  set_identifier = "secondary"
  records        = ["api-usw2.example.com"]

  failover_routing_policy {
    type = "SECONDARY"
  }
}
\`\`\`

**Make it real:**

- A written **runbook** (who decides to fail over, exact steps, how to fail back).
- **DR drills** every quarter: actually restore a backup and actually fail over staging. An untested backup is a hope, not a plan.
- Keep backups in a **separate account** with restricted access, so a hacked or mistaken admin cannot delete both prod and its backups.

**Why it works:** each disaster has a matching tool — point-in-time restore for bad data, cross-region copies plus IaC plus DNS failover for a lost region — and the chosen tier meets the 15-minute RPO and 1-hour RTO without paying for full active-active.`,
      followUps: [
        {
          q: 'Why not always go active-active?',
          a: 'It is expensive and hard: writes in two regions can conflict, you need global data design, and every feature must be built for it. Only worth it when minutes of downtime cost more than all that complexity.',
        },
        {
          q: 'How do you measure that you meet the RPO?',
          a: 'Monitor backup/snapshot age and replication lag (Atlas and S3 replication metrics), with alerts if lag passes e.g. 10 minutes. Then confirm with real restore drills.',
        },
      ],
    },
  ],
};
