// Revise MERN: AWS, Docker & Deployment. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'aws',
  icon: '☁️',
  title: 'AWS, Docker & Deployment',
  note: 'Serverless vs containers, Docker basics, core AWS services, secrets, CI/CD and safe deploys.',
  items: [
    {
      q: 'What is AWS Lambda and what are the pros and cons of serverless?',
      a: `**AWS Lambda** runs your code as functions in response to events, like an HTTP request through API Gateway or a message on SQS, without you managing servers. You pay per request and per millisecond of compute, and it scales automatically.

Pros: no servers to patch, automatic scaling, pay-per-use, and less ops work. Cons: **cold starts**, a 15-minute maximum run time, no long-lived connections by default, harder local debugging, and care needed with database connections. SkillKeepr ran its TypeScript services on Lambda behind API Gateway, deployed with the Serverless Framework.`,
    },
    {
      q: 'What is a cold start and how do you reduce it?',
      a: `A **cold start** is the extra delay when Lambda has to create a new execution environment: download the code, start the runtime and run your initialisation code. Warm invocations reuse an existing environment and skip all that.

To reduce it: keep the bundle small and tree-shaken, avoid heavy work at module load, give the function more memory (which also gives more CPU), and use **provisioned concurrency** for latency-critical endpoints. Also cache things like database connections outside the handler so warm calls reuse them; in SkillKeepr we cached the Mongoose connection per company for exactly this reason.`,
    },
    {
      q: 'What is the difference between a Docker image and a container?',
      a: `A **Docker image** is a read-only template: your app code, runtime, libraries and config, built from a Dockerfile. A **container** is a running instance of an image, with its own process, filesystem layer and network. One image can run as many containers.

A simple analogy is class versus object. The big benefit is consistency: the same image runs the same way on my laptop, in CI and in production.`,
    },
    {
      q: 'How do Dockerfile layers and caching work? What is a multi-stage build?',
      a: `Each Dockerfile instruction creates a **layer**, and Docker caches layers. If a layer has not changed, it is reused, but everything after a changed layer is rebuilt. So I copy \`package.json\` and the lockfile first, install dependencies, and only then copy the source code, so code changes do not reinstall packages.

A **multi-stage build** uses one stage with build tools to compile the app, then copies only the output into a small runtime image like a slim or alpine base. The final image is smaller, faster to pull and has less attack surface. I also use \`.dockerignore\` and run as a non-root user.`,
    },
    {
      q: 'How would you deploy a containerised app on AWS? Explain ECR and ECS/Fargate.',
      a: `**ECR** (Elastic Container Registry) is AWS's private registry where you push Docker images. **ECS** (Elastic Container Service) runs those images as **tasks**, defined by a **task definition** (image, CPU, memory, env vars, ports), and an ECS **service** keeps the desired number of tasks running and replaces failed ones.

With **Fargate**, AWS manages the servers, so you only specify CPU and memory per task; the alternative is running on your own EC2 instances. That was the OCTAGNT flow: build the image, push to ECR, update the ECS service to roll out the new version.`,
    },
    {
      q: 'Lambda vs containers on ECS: how do you choose?',
      a: `I choose **Lambda** for spiky, event-driven, short requests where pay-per-use and zero server management win, like SkillKeepr's API and queue consumers. I choose **containers on ECS** for long-running processes, steady traffic, long-lived connections, or work over 15 minutes.

OCTAGNT's voice service is a good example of container territory: it holds a WebSocket open with real-time phone audio for the whole call, which does not fit Lambda's request model. Containers also give more control over the runtime and avoid cold starts, but you pay for them while they are idle.`,
    },
    {
      q: 'What is API Gateway?',
      a: `**API Gateway** is a managed front door for APIs. It receives HTTP or WebSocket requests and routes them to a backend such as Lambda, a container service or another HTTP endpoint. It handles things like throttling, authorizers for auth, CORS, request validation, custom domains and stages like dev and prod.

There are REST APIs, the cheaper and simpler **HTTP APIs**, and **WebSocket APIs**. WebSocket APIs are handy for real-time features like notifications.`,
    },
    {
      q: 'What is IAM and the principle of least privilege?',
      a: `**IAM** (Identity and Access Management) controls who can do what in AWS. You have users, groups and **roles**, and **policies** that allow or deny specific actions on specific resources. Services like Lambda and ECS tasks get a role, so the code gets temporary credentials and you never hardcode keys.

**Least privilege** means giving each identity only the exact permissions it needs, for example \`s3:GetObject\` on one bucket instead of \`s3:*\` on everything. It limits the damage if something is compromised. I also prefer roles over long-lived access keys and turn on MFA for humans.`,
    },
    {
      q: 'What is S3 and how do you upload files securely?',
      a: `**S3** is object storage: you store files as objects in buckets, with very high durability, and pay for what you store and transfer. It is used for uploads, backups, logs and static website hosting, often behind CloudFront as a CDN.

For uploads, I keep buckets **private**, block public access, and let the browser upload directly using a **pre-signed URL** that the backend generates with a short expiry, so files do not pass through the API server. An S3 event or a queue message can then trigger processing.`,
    },
    {
      q: 'How do you manage environment variables and secrets?',
      a: `Plain config goes in environment variables per environment, but **secrets** like database passwords and API keys should never be in code or committed files. On AWS I store them in **SSM Parameter Store** (SecureString) or **Secrets Manager**, which adds automatic rotation, and the service's IAM role gets permission to read only its own secrets.

ECS task definitions can inject secrets from either service as env vars at start-up, and Lambda can read them at init and cache them. Locally I use a \`.env\` file that is git-ignored. For other clouds, workload identity federation avoids storing keys at all.`,
    },
    {
      q: 'What is SQS and why use a queue for async work?',
      a: `**SQS** is a managed message queue. A producer sends a message, and a consumer polls it, processes it and deletes it. If processing fails, the message becomes visible again after the **visibility timeout**, and after a set number of failures it goes to a **dead-letter queue**.

Queues decouple slow work from the request, absorb traffic spikes and let you retry safely. Standard queues give at-least-once delivery, so consumers must be idempotent; **FIFO** queues keep order. OCTAGNT puts uploaded resumes on SQS for pipeline workers, and SkillKeepr used SQS FIFO queues for resume parsing and AI scoring.`,
    },
    {
      q: 'What is the Serverless Framework?',
      a: `The **Serverless Framework** is a tool that lets you define Lambda functions, their triggers like HTTP routes or SQS queues, IAM permissions and environment settings in a \`serverless.yml\` file, then deploy everything with one command. Under the hood, it generates and deploys a **CloudFormation** stack.

It also supports stages like dev and prod, plugins for things like bundling TypeScript or running offline locally. Alternatives are AWS SAM, CDK and Terraform.`,
    },
    {
      q: 'What is CI/CD and what does your pipeline look like?',
      a: `**CI** (Continuous Integration) means every push is automatically built, linted and tested, so problems are caught early. **CD** (Continuous Delivery or Deployment) means passing builds are automatically deployed to an environment, sometimes with a manual approval before production.

A typical container pipeline, in GitHub Actions or similar: install, lint, test, build the Docker image, tag it with the commit SHA, push to ECR, then update the ECS service and wait for health checks. For Lambda, the deploy step is a Serverless Framework deploy to the right stage. Secrets come from the CI tool's secret store, never the repo.`,
    },
    {
      q: 'What is a load balancer?',
      a: `A **load balancer** spreads incoming traffic across multiple healthy instances, so no single server is overloaded and a failed instance is removed from rotation. On AWS, the **Application Load Balancer (ALB)** works at the HTTP layer and can route by path or host; the **Network Load Balancer** works at TCP level for very high performance.

The ALB also handles HTTPS termination with certificates from ACM, and runs **health checks** on targets. With ECS, the service registers its tasks in a target group automatically, so new tasks receive traffic once they are healthy.`,
    },
    {
      q: 'What are blue-green and rolling deployments?',
      a: `A **rolling deployment** replaces old instances with new ones gradually, a few at a time, so the app stays up. It is the ECS default. It is cheap, but for a while both versions serve traffic, so changes must be backward compatible.

**Blue-green** runs the new version (green) fully alongside the old one (blue), tests it, then switches traffic over in one step; rollback is just switching back. It costs more because you run two environments briefly. **Canary** is a variant where you send a small percentage of traffic first. Lambda supports this with aliases and weighted traffic shifting.`,
    },
    {
      q: 'What is auto scaling?',
      a: `**Auto scaling** automatically adds or removes capacity based on demand, so you handle peaks without paying for idle servers at night. For ECS, service auto scaling changes the number of tasks using **target tracking**, for example "keep average CPU at 60%", or based on request count or a custom metric like queue length.

Lambda scales by itself per request, up to the account's concurrency limit, and you can set reserved concurrency to cap a function. To scale well, services should be **stateless**, keeping session data in a database or cache, not in memory.`,
    },
    {
      q: 'How do you monitor and debug a production app on AWS? What is CloudWatch?',
      a: `**CloudWatch** is AWS's monitoring service. **Logs** collect output from Lambda and ECS, and you can search them with Logs Insights. **Metrics** track things like error count, latency, CPU and queue depth, and **alarms** notify you, for example via SNS to email or Slack, when a metric crosses a threshold.

I log in structured JSON with a request or correlation id so one request can be traced across services, and avoid logging secrets or personal data. For deeper tracing across services, there is AWS X-Ray or OpenTelemetry.`,
    },
    {
      q: 'What are health checks?',
      a: `A **health check** is an endpoint or command the platform calls regularly to see if an instance is working, usually something like \`GET /health\` returning 200. The load balancer stops sending traffic to an unhealthy target, and ECS replaces tasks that keep failing.

It helps to separate **liveness** ("the process is running") from **readiness** ("I can serve traffic, the database is reachable"). Health checks should be fast and cheap, and during deploys they are what decides whether the new version is good enough to receive traffic.`,
    },
    {
      q: 'What is a VPC? Explain public and private subnets.',
      a: `A **VPC** (Virtual Private Cloud) is your own isolated network inside AWS, with your IP range, split into **subnets** across availability zones. A **public subnet** has a route to an Internet Gateway, so things like the load balancer can be reached from the internet. A **private subnet** has no direct inbound internet access.

The usual setup is load balancer in public subnets, and app containers and databases in private subnets. Private resources reach out through a **NAT Gateway**. **Security groups** act as instance-level firewalls, for example "the database only accepts traffic from the app's security group".`,
    },
    {
      q: 'What is Docker Compose used for?',
      a: `**Docker Compose** defines and runs a multi-container setup from one YAML file, for example the API, a worker, PostgreSQL and Redis, with their ports, environment variables, volumes and networks. One \`docker compose up\` starts the whole stack.

It is mainly for **local development** and testing, so every developer gets the same environment. Services reach each other by service name on a shared network. In production on AWS, the same images are run by ECS instead, with task definitions playing a similar role.`,
    },
    {
      q: 'How do you keep AWS costs under control?',
      a: `First, **visibility**: tag resources by project and environment, use Cost Explorer and set **budgets with alerts**. Then right-size: do not over-provision CPU and memory, scale down or turn off dev environments out of hours, and use auto scaling instead of fixed capacity.

Common surprises are **NAT Gateway** data charges, CloudWatch log storage with no retention set, idle load balancers and forgotten resources. Serverless is cheap at low or spiky traffic, while steady high traffic is often cheaper on containers or with Savings Plans. S3 lifecycle rules can move old files to cheaper storage classes.`,
    },
    {
      q: 'What is CloudFront and how would you host a React app on AWS?',
      a: `**CloudFront** is AWS's CDN: it caches content at edge locations close to users, so static files load fast, and it also adds HTTPS and protection against some attacks. For a React app built with Vite, the build produces static files that go to a private **S3** bucket, served through CloudFront.

Hashed asset files get long cache times, while \`index.html\` gets a short one so new deploys show up; after deploying you can also invalidate the cache. For client-side routing, you return \`index.html\` for unknown paths.`,
    },
    {
      q: 'What is Infrastructure as Code?',
      a: `**Infrastructure as Code** means defining your cloud resources, like queues, functions, databases and permissions, in files kept in git, instead of clicking in the console. It makes environments **repeatable**, reviewable in pull requests, and easy to recreate.

On AWS the options are **CloudFormation**, **CDK** (which writes CloudFormation using TypeScript or Python), **Terraform** and the **Serverless Framework**, which generates CloudFormation for Lambda apps. The main rule is to avoid manual changes in the console, because they drift from what the code says.`,
    },
    {
      q: 'What is the difference between horizontal and vertical scaling?',
      a: `**Vertical scaling** means making one machine bigger, with more CPU or memory. It is simple but has a ceiling, can need downtime, and leaves a single point of failure. **Horizontal scaling** means adding more instances behind a load balancer, which has no hard ceiling and gives redundancy.

Horizontal scaling needs the app to be **stateless**: sessions, uploads and caches must live in shared stores like a database, Redis or S3. Lambda and ECS services are built for horizontal scaling; databases often scale vertically first, then with read replicas.`,
    },
    {
      q: 'What are Step Functions and when would you use them?',
      a: `**Step Functions** is AWS's workflow service. You define a state machine of steps, such as Lambda calls, waits, choices and parallel branches, and AWS runs it, keeping state, retrying failed steps and showing each execution visually.

It fits multi-step processes that are long-running or need waiting, like "send a reminder email in three days unless the candidate has replied". For simple fan-out or background jobs, SQS with a worker is usually enough.`,
    },
  ],
};
